import type { OcrPort } from './ocr/candidate-extractor';
import { reminderRequests } from './native/reminder-requests';
import { replaceReadingPhoto } from './media/reading-photo';
import { StartupError, StartupPending } from './startup/startup';
import { PdfViewerService } from './pdf/viewer-service';
import { androidPasswordKey } from './backup/password-key';
import { expoBackupCrypto } from './backup/expo-backup-crypto';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { migrate, SqlRepository } from './database/repository';
import { ExpoVault } from './files/expo-vault';
import { PdfService } from './pdf/pdf-service';
import { MachineService } from '../features/entries/entry-service';
import { BackupCodec, BackupService } from './backup/backup-service';
import { ExpoMedia, type MediaPort } from './media/media-service';
import { machineNative, type MachineNative } from './native/machine-native';
import type { Environment } from './ports';
import {
  DeviceExternalLinks,
  type ExternalLinks,
} from './links/external-links';

export type Services = {
  machine: MachineService;
  ocr: OcrPort;
  backup: BackupService;
  media: MediaPort;
  native: MachineNative;
  viewer: PdfViewerService;
  links: ExternalLinks;
};
const Context = createContext<
  (Services & { revision: number; refresh(): void }) | null
>(null);
let boot: Promise<Services> | undefined;
async function createServices(): Promise<Services> {
  const connection = await SQLite.openDatabaseAsync('maschinenlog.db');
  const db = {
    exec: (sql: string) => connection.execAsync(sql),
    run: async (sql: string, ...params: (string | number | null)[]) => {
      await connection.runAsync(sql, ...params);
    },
    all: <T,>(sql: string, ...params: (string | number | null)[]) =>
      connection.getAllAsync<T>(sql, ...params),
  };
  await migrate(db);
  const repository = new SqlRepository(db);
  const vault = new ExpoVault();
  const env: Environment = {
    id: Crypto.randomUUID,
    now: () => new Date().toISOString(),
    random: Crypto.getRandomBytes,
  };
  const pdf = new PdfService(vault, async () => {
    const read = async (module: number) => {
      const asset = Asset.fromModule(module);
      await asset.downloadAsync();
      return new File(asset.localUri!).bytes();
    };
    return {
      regular: await read(require('../../assets/ui/Roboto-Regular.ttf')),
      bold: await read(require('../../assets/ui/Roboto-Bold.ttf')),
    };
  });
  const machine = new MachineService(repository, vault, env, pdf, {
    async sync(records, entries) {
      return machineNative.syncReminders(
        JSON.stringify(reminderRequests(records, entries)),
      );
    },
  });
  const media = new ExpoMedia(machine);
  // Only clean startup orphans after SQLite and persistent drafts are available.
  await machine.cleanup(await vault.list());
  const interrupted = (await repository.drafts()).find(
    (d) => d.external === 'camera' || d.external === 'gallery',
  );
  if (interrupted) {
    const recovered = await media.recoverPhotos();
    const source = interrupted.external === 'camera' ? 'camera' : 'gallery';
    recovered.attachments.forEach((a) => {
      a.source = source;
    });
    const photo = recovered.attachments[0];
    if (photo) {
      interrupted.form.attachments = replaceReadingPhoto(
        interrupted.form.attachments,
        photo,
      );
      interrupted.form.ocr = null;
      interrupted.form.source = source;
      interrupted.captureStage = 'form';
      interrupted.captureSource = 'photo';
    }
    interrupted.external = null;
    await repository.saveDraft(interrupted);
  }
  await machine.syncReminders();
  return {
    machine,
    ocr: { recognize: (uri) => machineNative.recognizeText(uri) },
    backup: new BackupService(
      machine,
      new BackupCodec(env, androidPasswordKey, expoBackupCrypto),
    ),
    media,
    native: machineNative,
    viewer: new PdfViewerService(machine, machineNative),
    links: new DeviceExternalLinks(),
  };
}
export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Services>();
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    boot ??= createServices();
    boot.then(setServices).catch((e) => {
      boot = undefined;
      setError(
        e instanceof Error
          ? e.message
          : 'Lokale Daten konnten nicht geladen werden.',
      );
    });
  }, [attempt]);
  if (!services)
    return error ? (
      <StartupError
        message={error}
        retry={() => {
          setError('');
          setAttempt((n) => n + 1);
        }}
      />
    ) : (
      <StartupPending />
    );
  return (
    <Context.Provider
      value={{
        ...services,
        revision,
        refresh: () => setRevision((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useServices() {
  const value = useContext(Context);
  if (!value) throw new Error('Composition Root fehlt.');
  return value;
}
