import { formatValue } from '../domain/reading-value';
import { counterTitle } from '../domain/production-counter';
import { SerialQueue, type Repository, type SqlConnection } from '../ports';
import {
  type CounterEvent,
  type Machine,
  type Counter,
  type SavedReport,
  type Snapshot,
  type EntryDraft,
  PAGE_SIZE,
  recordSchema,
  entrySchema,
  reportSchema,
  validateSnapshot,
  evidenceJson,
  eventLabels,
} from '../domain/models';

export const schemaV1 = `
CREATE TABLE records (id TEXT PRIMARY KEY, body TEXT NOT NULL CHECK(json_valid(body)));
CREATE TABLE entries (id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE, counter_id TEXT NOT NULL, occurred_at TEXT NOT NULL, search TEXT NOT NULL, body TEXT NOT NULL CHECK(json_valid(body)));
CREATE UNIQUE INDEX counter_time ON entries(counter_id, occurred_at);
CREATE INDEX entries_history ON entries(record_id, counter_id, occurred_at DESC);
CREATE TABLE reports (id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE, entry_id TEXT REFERENCES entries(id) ON DELETE CASCADE, body TEXT NOT NULL CHECK(json_valid(body)));
CREATE INDEX reports_record ON reports(record_id);
CREATE TABLE drafts (id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE, body TEXT NOT NULL CHECK(json_valid(body)));
PRAGMA user_version=1;`;
export async function migrate(db: SqlConnection): Promise<void> {
  await db.exec(
    'PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;',
  );
  const version =
    (await db.all<{ user_version: number }>('PRAGMA user_version'))[0]
      ?.user_version ?? 0;
  if (version > 1)
    throw new Error(
      'Die Datenbank stammt aus einer neueren MaschinenLog-Version.',
    );
  if (version === 1) return;
  await db.exec('BEGIN IMMEDIATE');
  try {
    await db.exec(schemaV1);
    await db.exec('COMMIT');
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}
export class SqlRepository implements Repository {
  private queue = new SerialQueue();
  constructor(private db: SqlConnection) {}
  private async bodies<T>(
    table: string,
    where = '',
    params: (string | number)[] = [],
  ): Promise<T[]> {
    return (
      await this.db.all<{ body: string }>(
        `SELECT body FROM ${table} ${where}`,
        ...params,
      )
    ).map((r) => JSON.parse(r.body) as T);
  }
  private write<T>(work: () => Promise<T>): Promise<T> {
    return this.queue.run(async () => {
      await this.db.exec('BEGIN IMMEDIATE');
      try {
        const value = await work();
        await this.db.exec('COMMIT');
        return value;
      } catch (error) {
        await this.db.exec('ROLLBACK');
        throw error;
      }
    });
  }
  records() {
    return this.queue.run(() =>
      this.bodies<Machine>(
        'records',
        "ORDER BY json_extract(body, '$.name') COLLATE NOCASE",
      ),
    );
  }
  entry(id: string) {
    return this.queue.run(
      async () =>
        (await this.bodies<CounterEvent>('entries', 'WHERE id=?', [id]))[0] ??
        null,
    );
  }
  dashboard() {
    return this.queue.run(async () => {
      const rows = await this.db.all<{
        body: string;
        counter: string;
        latest: string | null;
        lastEdited: string;
      }>(`
        SELECT r.body, c.value counter,
          (SELECT e.body FROM entries e WHERE e.record_id=r.id AND e.counter_id=json_extract(c.value,'$.id') ORDER BY e.occurred_at DESC,e.id DESC LIMIT 1) latest,
          max(json_extract(r.body,'$.updatedAt'),coalesce((SELECT max(json_extract(e.body,'$.updatedAt')) FROM entries e WHERE e.record_id=r.id AND e.counter_id=json_extract(c.value,'$.id')),json_extract(r.body,'$.updatedAt'))) lastEdited
        FROM records r, json_each(r.body,'$.counters') c ORDER BY lastEdited DESC,r.id ASC,c.key ASC`);
      return rows.map((row) => ({
        record: JSON.parse(row.body) as Machine,
        counter: JSON.parse(row.counter) as Counter,
        latest: row.latest ? (JSON.parse(row.latest) as CounterEvent) : null,
        lastEdited: row.lastEdited,
      }));
    });
  }
  entries(
    recordId: string,
    search = '',
    offset = 0,
    limit = PAGE_SIZE,
    counterId?: string,
  ) {
    return this.queue.run(async () => {
      const pattern = `%${search.toLocaleLowerCase('de-DE').replace(/[\\%_]/g, '\\$&')}%`;
      const clause =
        "WHERE record_id=? AND search LIKE ? ESCAPE '\\'" +
        (counterId ? ' AND counter_id=?' : '');
      const params = counterId
        ? [recordId, pattern, counterId]
        : [recordId, pattern];
      const rows = await this.bodies<CounterEvent>(
        'entries',
        `${clause} ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );
      const total =
        (
          await this.db.all<{ n: number }>(
            `SELECT count(*) n FROM entries ${clause}`,
            ...params,
          )
        )[0]?.n ?? 0;
      const any = await this.db.all<{ found: number }>(
        `SELECT EXISTS(SELECT 1 FROM entries WHERE record_id=? ${counterId ? 'AND counter_id=?' : ''} AND (json_array_length(body,'$.attachments')>0 OR json_array_length(body,'$.original.attachments')>0 OR EXISTS(SELECT 1 FROM json_each(body,'$.revisions') WHERE json_array_length(value,'$.before.attachments')>0 OR json_array_length(value,'$.after.attachments')>0))) found`,
        ...(counterId ? [recordId, counterId] : [recordId]),
      );
      return { rows, total, hasAttachments: any[0]?.found === 1 };
    });
  }
  timeline(counterId: string) {
    return this.queue.run(() =>
      this.bodies<CounterEvent>(
        'entries',
        'WHERE counter_id=? ORDER BY occurred_at ASC',
        [counterId],
      ),
    );
  }
  reports(recordId: string) {
    return this.queue.run(() =>
      this.bodies<SavedReport>(
        'reports',
        "WHERE record_id=? ORDER BY json_extract(body,'$.createdAt') DESC",
        [recordId],
      ),
    );
  }
  previousMeasurement(entry: CounterEvent) {
    return this.queue.run(async () => {
      const rows = await this.bodies<CounterEvent>(
        'entries',
        'WHERE counter_id=? AND occurred_at<? ORDER BY occurred_at DESC LIMIT 1',
        [entry.counterId, entry.occurredAt],
      );
      return rows[0] ?? null;
    });
  }
  drafts() {
    return this.queue.run(() => this.bodies<EntryDraft>('drafts'));
  }
  snapshot(): Promise<Snapshot> {
    return this.queue.run(async () =>
      validateSnapshot({
        records: await this.bodies('records'),
        entries: await this.bodies('entries'),
        reports: await this.bodies('reports'),
      }),
    );
  }
  saveDraft(draft: EntryDraft) {
    return this.write(() =>
      this.db.run(
        'INSERT INTO drafts VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body',
        draft.id,
        draft.recordId,
        JSON.stringify(draft),
      ),
    );
  }
  removeDraft(id: string) {
    return this.write(() => this.db.run('DELETE FROM drafts WHERE id=?', id));
  }
  private putRecord(record: Machine) {
    return this.db.run(
      'INSERT INTO records VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body',
      record.id,
      JSON.stringify(recordSchema.parse(record)),
    );
  }
  saveRecord(record: Machine) {
    return this.write(async () => {
      const entries = await this.bodies<CounterEvent>(
        'entries',
        'WHERE record_id=?',
        [record.id],
      );
      const drafts = await this.bodies<EntryDraft>(
        'drafts',
        'WHERE record_id=?',
        [record.id],
      );
      if (
        [...entries, ...drafts].some(
          (e) => !record.counters.some((c) => c.id === e.counterId),
        )
      )
        throw new Error(
          'Ein Zähler mit Einträgen oder Entwürfen kann nicht entfernt werden.',
        );
      const reports = await this.bodies<SavedReport>(
        'reports',
        'WHERE record_id=?',
        [record.id],
      );
      if (
        reports.some(
          (report) =>
            report.counterId &&
            !record.counters.some((c) => c.id === report.counterId),
        )
      )
        throw new Error(
          'Ein Zähler mit gespeicherten Protokollen kann nicht entfernt werden.',
        );
      await this.putRecord(record);
    });
  }
  private async putEntry(entry: CounterEvent) {
    const e = entrySchema.parse(entry);
    const record = (
      await this.bodies<Machine>('records', 'WHERE id=?', [e.recordId])
    )[0];
    if (!record?.counters.some((c) => c.id === e.counterId))
      throw new Error('Zähler nicht gefunden.');
    await this.db.run(
      'INSERT INTO entries VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET occurred_at=excluded.occurred_at,search=excluded.search,body=excluded.body',
      e.id,
      e.recordId,
      e.counterId,
      e.occurredAt,
      `${eventLabels[e.kind]} ${e.counterName} ${formatValue(e.measurement.value)} ${e.measurement.unit} ${e.occurredAt} ${new Date(e.occurredAt).toLocaleDateString('de-DE')} ${e.note} ${e.attachments.map((a) => a.name).join(' ')}`.toLocaleLowerCase(
        'de-DE',
      ),
      JSON.stringify(e),
    );
  }
  saveEntry(entry: CounterEvent, draftId: string) {
    return this.write(async () => {
      const existing = (
        await this.bodies<CounterEvent>('entries', 'WHERE id=?', [entry.id])
      )[0];
      if (
        existing &&
        (existing.recordId !== entry.recordId ||
          existing.counterId !== entry.counterId ||
          evidenceJson(existing.original) !== evidenceJson(entry.original) ||
          entry.revisions.length !== existing.revisions.length + 1 ||
          evidenceJson(existing.revisions) !==
            evidenceJson(entry.revisions.slice(0, -1)))
      )
        throw new Error(
          'Der Eintrag wurde zwischenzeitlich geändert. Bitte erneut öffnen.',
        );
      await this.putEntry(entry);
      await this.db.run('DELETE FROM drafts WHERE id=?', draftId);
    });
  }
  private putReport(report: SavedReport) {
    return this.db.run(
      'INSERT INTO reports VALUES (?,?,?,?)',
      report.id,
      report.recordId,
      report.entryId,
      JSON.stringify(reportSchema.parse(report)),
    );
  }
  saveReport(report: SavedReport) {
    return this.write(() => this.putReport(report));
  }
  saveReports(reports: SavedReport[]) {
    return this.write(async () => {
      for (const report of reports) await this.putReport(report);
    });
  }
  deleteRecord(id: string) {
    return this.write(() => this.db.run('DELETE FROM records WHERE id=?', id));
  }
  deleteCounter(recordId: string, counterId: string) {
    return this.write(async () => {
      const record = (
        await this.bodies<Machine>('records', 'WHERE id=?', [recordId])
      )[0];
      if (!record?.counters.some((counter) => counter.id === counterId))
        throw new Error('Der Zähler wurde nicht gefunden.');
      if (record.counters.length === 1) {
        await this.db.run('DELETE FROM records WHERE id=?', recordId);
        return;
      }
      await this.db.run(
        "DELETE FROM drafts WHERE record_id=? AND json_extract(body,'$.counterId')=?",
        recordId,
        counterId,
      );
      await this.db.run(
        "DELETE FROM reports WHERE record_id=? AND json_extract(body,'$.counterId')=?",
        recordId,
        counterId,
      );
      await this.db.run(
        'DELETE FROM entries WHERE record_id=? AND counter_id=?',
        recordId,
        counterId,
      );
      const remaining = record.counters.filter(
        (counter) => counter.id !== counterId,
      );
      await this.putRecord({
        ...record,
        ...(remaining.length === 1
          ? { name: counterTitle(record, remaining[0]!) }
          : {}),
        counters: remaining,
      });
    });
  }
  deleteEntry(id: string) {
    return this.write(async () => {
      await this.db.run(
        "DELETE FROM drafts WHERE json_extract(body,'$.entryId')=?",
        id,
      );
      await this.db.run('DELETE FROM entries WHERE id=?', id);
    });
  }
  deleteReport(id: string) {
    return this.write(() => this.db.run('DELETE FROM reports WHERE id=?', id));
  }
  replace(input: Snapshot) {
    const data = validateSnapshot(input);
    return this.write(async () => {
      const drafts = await this.bodies<EntryDraft>('drafts');
      await this.db.exec(
        'DELETE FROM drafts; DELETE FROM reports; DELETE FROM entries; DELETE FROM records;',
      );
      for (const r of data.records) await this.putRecord(r);
      for (const e of data.entries) await this.putEntry(e);
      for (const r of data.reports) await this.putReport(r);
      for (const draft of drafts)
        if (data.records.some((r) => r.id === draft.recordId))
          await this.db.run(
            'INSERT INTO drafts VALUES (?,?,?)',
            draft.id,
            draft.recordId,
            JSON.stringify(draft),
          );
    });
  }
}
