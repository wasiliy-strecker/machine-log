import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, pbkdf2Sync } from 'node:crypto';
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  rename,
  readdir,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { SqlRepository, migrate } from '../src/core/database/repository';
import type {
  Environment,
  FileVault,
  ReminderPort,
  SqlConnection,
} from '../src/core/ports';
import { fileKey, type Machine } from '../src/core/domain/models';
import { MachineService } from '../src/features/entries/entry-service';
import { PdfService } from '../src/core/pdf/pdf-service';
import { BackupCodec, BackupService } from '../src/core/backup/backup-service';

export const env: Environment = {
  id: randomUUID,
  now: () => new Date().toISOString(),
  random: (n) => new Uint8Array(randomBytes(n)),
};
export class NodeVault implements FileVault {
  constructor(readonly directory: string) {}
  uri(key: string) {
    return join(this.directory, fileKey.parse(key));
  }
  async read(key: string) {
    return new Uint8Array(await readFile(this.uri(key)));
  }
  async put(bytes: Uint8Array, extension: 'jpg' | 'pdf') {
    await mkdir(this.directory, { recursive: true });
    const key = `${randomUUID()}.${extension}`;
    await writeFile(this.uri(key) + '.tmp', bytes);
    await rename(this.uri(key) + '.tmp', this.uri(key));
    return key;
  }
  async remove(key: string) {
    await rm(this.uri(key), { force: true });
  }
  async list() {
    return readdir(this.directory).catch(() => [] as string[]);
  }
}
export function connect(path: string) {
  const raw = new DatabaseSync(path);
  const db: SqlConnection = {
    async exec(sql) {
      raw.exec(sql);
    },
    async run(sql, ...params) {
      raw.prepare(sql).run(...params);
    },
    async all<T>(sql: string, ...params: (string | number | null)[]) {
      return raw.prepare(sql).all(...params) as T[];
    },
  };
  return { raw, db };
}
export async function fixture(
  reminders: ReminderPort = {
    async sync() {
      return [];
    },
  },
) {
  const root = await mkdtemp(join(tmpdir(), 'maschinenlog-test-'));
  const path = join(root, 'machine.db');
  const { raw, db } = connect(path);
  await migrate(db);
  const repo = new SqlRepository(db);
  const vault = new NodeVault(join(root, 'vault'));
  const pdf = new PdfService(vault, async () => ({
    regular: await readFile(
      new URL('../assets/ui/Roboto-Regular.ttf', import.meta.url),
    ),
    bold: await readFile(
      new URL('../assets/ui/Roboto-Bold.ttf', import.meta.url),
    ),
  }));
  const machine = new MachineService(repo, vault, env, pdf, reminders);
  const backup = new BackupService(
    machine,
    new BackupCodec(
      env,
      async (password, salt, iterations) =>
        new Uint8Array(pbkdf2Sync(password, salt, iterations, 32, 'sha256')),
    ),
  );
  return {
    root,
    path,
    raw,
    db,
    repo,
    vault,
    pdf,
    machine,
    backup,
    async close() {
      raw.close();
      await rm(root, { recursive: true, force: true });
    },
  };
}
export function record(overrides: Partial<Machine> = {}): Machine {
  return {
    id: env.id(),
    name: 'Presse 1',
    category: 'Fertigung',
    number: 'M-01',
    location: 'Testort',
    manufacturer: '',
    model: '',
    serial: '',
    installedOn: '',
    note: '',
    counters: [
      {
        id: env.id(),
        name: 'Produktion',
        number: '',
        type: 'pieces',
        unit: 'Stück',
        reminder: null,
      },
    ],
    createdAt: env.now(),
    updatedAt: env.now(),
    ...overrides,
  };
}
export async function sourcePdf(
  texts = ['SYNTHETIC_PAGE_ONE', 'SYNTHETIC_PAGE_TWO'],
  landscape = true,
) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const text of texts) {
    const page = doc.addPage(landscape ? [842, 595] : [595, 842]);
    page.drawText(text, { x: 60, y: 480, font });
  }
  return doc.save();
}
export async function photo() {
  return new Uint8Array(
    await readFile(new URL('../assets/synthetic-photo.jpg', import.meta.url)),
  );
}
