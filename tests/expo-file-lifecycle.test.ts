import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fixture, env, sourcePdf } from './support';
import { ExpoVault } from '../src/core/files/expo-vault';
import { ExpoMedia } from '../src/core/media/media-service';
import { BackupService } from '../src/core/backup/backup-service';
import { MachineService } from '../src/features/entries/entry-service';
import { evidenceJson } from '../src/core/domain/models';

const io = vi.hoisted(() => ({
  root: '',
  moveGate: undefined as Promise<void> | undefined,
  copyGate: undefined as Promise<void> | undefined,
  moving: vi.fn(),
  copying: vi.fn(),
  share: vi.fn(),
  sharePdfs: vi.fn(),
  pending: [] as Promise<unknown>[],
}));
vi.mock('expo-crypto', async () => ({
  randomUUID: (await import('node:crypto')).randomUUID,
}));
vi.mock('expo-file-system', async () => {
  const fs = await import('node:fs');
  const asyncFs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const join = (parts: (string | { path: string })[]) =>
    path.join(
      ...parts.map((part) =>
        typeof part !== 'string'
          ? part.path
          : part.startsWith('file:')
            ? url.fileURLToPath(part)
            : part,
      ),
    );
  class File {
    path: string;
    constructor(...parts: (string | { path: string })[]) {
      this.path = join(parts);
    }
    get uri() {
      return url.pathToFileURL(this.path).href;
    }
    get name() {
      return path.basename(this.path);
    }
    get exists() {
      return fs.existsSync(this.path);
    }
    async bytes() {
      return new Uint8Array(await asyncFs.readFile(this.path));
    }
    write(bytes: Uint8Array) {
      fs.writeFileSync(this.path, bytes);
    }
    delete() {
      fs.unlinkSync(this.path);
    }
    move(destination: File) {
      const task = (async () => {
        io.moving();
        await io.moveGate;
        await asyncFs.rename(this.path, destination.path);
        this.path = destination.path;
      })();
      io.pending.push(task.catch(() => {}));
      return task;
    }
    copy(destination: File) {
      const task = (async () => {
        io.copying();
        await io.copyGate;
        await asyncFs.copyFile(this.path, destination.path);
      })();
      io.pending.push(task.catch(() => {}));
      return task;
    }
  }
  class Directory {
    path: string;
    constructor(...parts: (string | { path: string })[]) {
      this.path = join(parts);
    }
    get uri() {
      return url.pathToFileURL(this.path).href + '/';
    }
    create() {
      fs.mkdirSync(this.path, { recursive: true });
    }
    list() {
      return fs.readdirSync(this.path).map((name) => new File(this, name));
    }
    delete() {
      fs.rmSync(this.path, { recursive: true });
    }
  }
  return {
    File,
    Directory,
    Paths: {
      get document() {
        return new Directory(io.root, 'documents');
      },
      get cache() {
        return new Directory(io.root, 'cache');
      },
    },
  };
});
vi.mock('expo-image-picker', () => ({}));
vi.mock('expo-document-picker', () => ({}));
vi.mock('expo-image-manipulator', () => ({
  ImageManipulator: {},
  SaveFormat: { JPEG: 'jpeg' },
}));
vi.mock('expo-sharing', () => ({
  isAvailableAsync: async () => true,
  shareAsync: io.share,
}));
vi.mock('../src/core/native/machine-native', () => ({
  machineNative: { sharePdfs: io.sharePdfs },
}));

let f: Awaited<ReturnType<typeof fixture>>;
let vault: ExpoVault;
let machine: MachineService;
function deferred() {
  let resolve!: () => void, reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
beforeEach(async () => {
  vi.clearAllMocks();
  io.moveGate = undefined;
  io.copyGate = undefined;
  f = await fixture();
  io.root = f.root + '/expo';
  vault = new ExpoVault();
  machine = new MachineService(f.repo, vault, env, f.pdf, {
    sync: async () => [],
  });
});
afterEach(async () => {
  await Promise.all(io.pending.splice(0));
  await f.close();
});

it('waits for the asynchronous Expo move before verifying files and committing a legacy restore', async () => {
  const gate = deferred();
  io.moveGate = gate.promise;
  const legacy = await f.backup.codec.decode(
    new Uint8Array(
      await readFile(new URL('./fixtures/backup-v1.bin', import.meta.url)),
    ),
    'Synthetic legacy ä🔑',
  );
  let completed = false;
  const restored = new BackupService(machine, f.backup.codec)
    .restore(legacy)
    .then(
      () => {
        completed = true;
        return null;
      },
      (error: unknown) => {
        completed = true;
        return error;
      },
    );
  try {
    await vi.waitFor(() => expect(io.moving).toHaveBeenCalledOnce());
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(completed).toBe(false);
    expect((await f.repo.snapshot()).records).toEqual([]);
    gate.resolve();
    expect(await restored).toBeNull();
    expect(evidenceJson(await f.repo.snapshot())).toBe(
      evidenceJson(legacy.data),
    );
    expect((await vault.list()).length).toBe(legacy.files.size);
  } finally {
    gate.resolve();
    await restored;
  }
});

it('catches an asynchronous move failure and removes the temporary file before returning an error', async () => {
  const gate = deferred();
  io.moveGate = gate.promise;
  const result = vault.put(new Uint8Array([1, 2, 3]), 'jpg').then(
    () => null,
    (error: unknown) => error,
  );
  await vi.waitFor(() => expect(io.moving).toHaveBeenCalledOnce());
  gate.reject(new Error('SYNTHETIC_MOVE_FAILED'));
  expect(await result).toMatchObject({ message: 'SYNTHETIC_MOVE_FAILED' });
  const { readdir } = await import('node:fs/promises');
  expect(await readdir(io.root + '/documents/vault')).toEqual([]);
});

it('waits for the encrypted backup copy before opening the share target', async () => {
  const source = new Uint8Array([1, 2, 3, 4]);
  const key = await vault.put(source, 'pdf');
  const gate = deferred();
  io.copyGate = gate.promise;
  const sharing = new ExpoMedia(machine).shareBackup({
    uri: vault.uri(key),
    name: 'Synthetic.mlbackup',
  });
  try {
    await vi.waitFor(() => expect(io.copying).toHaveBeenCalledOnce());
    expect(io.share).not.toHaveBeenCalled();
    gate.resolve();
    await sharing;
    const uri = io.share.mock.calls[0]![0] as string;
    expect(
      Buffer.from(readFileSync(fileURLToPath(uri))).equals(Buffer.from(source)),
    ).toBe(true);
  } finally {
    gate.resolve();
    await sharing;
  }
});

it('shares named single PDFs and multipart PDFs only after every copy is complete', async () => {
  const content = await sourcePdf();
  const key = await vault.put(content, 'pdf');
  const { digest } = await import('../src/core/files/integrity');
  const item = {
    file: key,
    sha256: digest(content),
    name: 'Synthetic named PDF',
  };
  const gate = deferred();
  io.copyGate = gate.promise;
  const single = new ExpoMedia(machine).share(item);
  try {
    await vi.waitFor(() => expect(io.copying).toHaveBeenCalledOnce());
    expect(io.share).not.toHaveBeenCalled();
    gate.resolve();
    await single;
    expect(
      readFileSync(fileURLToPath(io.share.mock.calls[0]![0] as string)),
    ).toEqual(Buffer.from(content));
  } finally {
    gate.resolve();
    await single;
  }
  io.sharePdfs.mockImplementation(async (uris: string[]) => {
    expect(uris).toHaveLength(2);
    for (const uri of uris)
      expect(readFileSync(fileURLToPath(uri))).toEqual(Buffer.from(content));
  });
  await new ExpoMedia(machine).shareMany([item, item]);
  expect(io.sharePdfs).toHaveBeenCalledOnce();
});
