import type {
  Machine,
  Counter,
  CounterEvent,
  SavedReport,
  Snapshot,
  EntryDraft,
} from './domain/models';

export interface SqlConnection {
  exec(sql: string): Promise<void>;
  run(sql: string, ...params: (string | number | null)[]): Promise<void>;
  all<T>(sql: string, ...params: (string | number | null)[]): Promise<T[]>;
}
export type ReportPageRequest = {
  recordId: string;
  entryId: string | null;
  counterId: string | null;
  offset: number;
};
export type ReportPage = {
  rows: SavedReport[];
  total: number;
  offset: number;
};
export interface Repository {
  snapshot(): Promise<Snapshot>;
  records(): Promise<Machine[]>;
  entry(id: string): Promise<CounterEvent | null>;
  dashboard(): Promise<
    {
      record: Machine;
      counter: Counter;
      latest: CounterEvent | null;
      lastEdited: string;
    }[]
  >;
  entries(
    recordId: string,
    search?: string,
    offset?: number,
    limit?: number,
    counterId?: string,
  ): Promise<{ rows: CounterEvent[]; total: number; hasAttachments: boolean }>;
  previousMeasurement(entry: CounterEvent): Promise<CounterEvent | null>;
  timeline(counterId: string): Promise<CounterEvent[]>;
  reports(recordId: string): Promise<SavedReport[]>;
  reportPage(request: ReportPageRequest): Promise<ReportPage>;
  drafts(): Promise<EntryDraft[]>;
  saveDraft(draft: EntryDraft): Promise<void>;
  removeDraft(id: string): Promise<void>;
  saveRecord(record: Machine): Promise<void>;
  saveEntry(entry: CounterEvent, draftId: string): Promise<void>;
  saveReport(report: SavedReport): Promise<void>;
  saveReports(reports: SavedReport[]): Promise<void>;
  deleteRecord(id: string): Promise<void>;
  deleteCounter(recordId: string, counterId: string): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  deleteReport(id: string): Promise<void>;
  replace(data: Snapshot): Promise<void>;
}
export interface FileVault {
  read(key: string): Promise<Uint8Array>;
  put(bytes: Uint8Array, extension: 'jpg' | 'pdf'): Promise<string>;
  remove(key: string): Promise<void>;
  list(): Promise<string[]>;
  uri(key: string): string;
}
export interface ReminderPort {
  sync(records: Machine[], entries: CounterEvent[]): Promise<string[]>;
}
export type Environment = {
  id(): string;
  now(): string;
  random(length: number): Uint8Array;
};

export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(work: () => Promise<T>): Promise<T> {
    const next = this.tail.then(work, work);
    this.tail = next.catch(() => undefined);
    return next;
  }
}
