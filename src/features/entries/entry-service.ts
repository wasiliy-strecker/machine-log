import { parseValue } from '../../core/domain/reading-value';
import { validateTimeline } from '../../core/domain/counter-timeline';
import {
  entrySchema,
  recordSchema,
  snapshotFiles,
  formFromEntry,
  eventState,
  evidenceJson,
  allAttachments,
  validateSnapshot,
  type Attachment,
  type EntryDraft,
  type CounterEvent,
  type Machine,
  type SavedReport,
} from '../../core/domain/models';
import type {
  Environment,
  FileVault,
  Repository,
  ReminderPort,
} from '../../core/ports';
import { PDFDocument } from 'pdf-lib';
import { SerialQueue } from '../../core/ports';
import { digest } from '../../core/files/integrity';
import { checkPdfPages } from '../../core/files/limits';
import {
  inspectPdf,
  MAX_FILE_BYTES,
  type PdfService,
} from '../../core/pdf/pdf-service';

export class MachineService {
  readonly queue = new SerialQueue();
  constructor(
    readonly repository: Repository,
    readonly vault: FileVault,
    readonly env: Environment,
    readonly pdf: PdfService,
    readonly reminders: ReminderPort,
  ) {}
  async cleanup(candidates: string[]): Promise<void> {
    // A failed reference lookup must prevent all physical deletion.
    try {
      const used = new Set(snapshotFiles(await this.repository.snapshot()));
      for (const d of await this.repository.drafts())
        for (const a of d.form.attachments) used.add(a.file);
      for (const file of new Set(candidates))
        if (!used.has(file))
          await this.vault.remove(file).catch(() => undefined);
    } catch {
      /* Retain an orphan rather than risk a referenced file. */
    }
  }
  async syncReminders(): Promise<string[]> {
    try {
      const data = await this.repository.snapshot();
      return await this.reminders.sync(data.records, data.entries);
    } catch {
      return [
        'Gespeichert. Erinnerungen konnten nicht aktualisiert werden. Bitte die Berechtigungen in den Einstellungen prüfen.',
      ];
    }
  }
  saveRecord(record: Machine) {
    return this.queue.run(async () => {
      await this.repository.saveRecord(
        recordSchema.parse({ ...record, updatedAt: this.env.now() }),
      );
      return this.syncReminders();
    });
  }
  async draft(
    recordId: string,
    entry?: CounterEvent,
    counterId?: string,
  ): Promise<EntryDraft> {
    return this.queue.run(async () => {
      const record = (await this.repository.records()).find(
        (r) => r.id === recordId,
      );
      const counter =
        record?.counters.find(
          (c) => c.id === (entry?.counterId ?? counterId),
        ) ?? (!counterId && !entry ? record?.counters[0] : undefined);
      if (!counter) throw new Error('Zähler nicht gefunden.');
      const existing = (await this.repository.drafts()).find(
        (d) =>
          d.recordId === recordId &&
          d.counterId === counter.id &&
          d.entryId === (entry?.id ?? null),
      );
      if (existing) return existing;
      const now = this.env.now();
      const draft: EntryDraft = {
        id: this.env.id(),
        recordId,
        counterId: counter.id,
        baseRevisionId: entry?.revisions.at(-1)?.id ?? null,
        entryId: entry?.id ?? null,
        createdAt: entry?.createdAt ?? now,
        updatedAt: now,
        external: null,
        form: entry
          ? formFromEntry(entry)
          : {
              kind: 'reading',
              occurredAt: now,
              value: '',
              unit: counter.unit,
              closingValue: '',
              closingUnit: counter.unit,
              newCounterNumber: '',
              note: '',
              reason: '',
              source: 'manual',
              ocr: null,
              attachments: [],
            },
      };
      await this.repository.saveDraft(draft);
      return draft;
    });
  }
  persistDraft(draft: EntryDraft): Promise<void> {
    return this.queue.run(async () => {
      const previous = (await this.repository.drafts()).find(
        (d) => d.id === draft.id,
      );
      await this.repository.saveDraft({ ...draft, updatedAt: this.env.now() });
      await this.cleanup(previous?.form.attachments.map((a) => a.file) ?? []);
    });
  }
  async importAttachment(
    bytes: Uint8Array,
    kind: Attachment['kind'],
    name: string,
    source?: Attachment['source'],
  ): Promise<Attachment> {
    if (!bytes.length || bytes.length > MAX_FILE_BYTES)
      throw new Error('Die Datei ist leer oder größer als 50 MB.');
    const pages =
      kind === 'pdf' ? (await inspectPdf(bytes)).getPageCount() : undefined;
    const file = await this.vault.put(bytes, kind === 'pdf' ? 'pdf' : 'jpg');
    return {
      id: this.env.id(),
      kind,
      name:
        name.slice(0, 500) || (kind === 'pdf' ? 'Dokument.pdf' : 'Foto.jpg'),
      file,
      sha256: digest(bytes),
      size: bytes.length,
      ...(pages ? { pages } : {}),
      ...(source ? { source } : {}),
    };
  }
  saveEntry(
    draft: EntryDraft,
  ): Promise<{ entry: CounterEvent; warnings: string[] }> {
    return this.queue.run(async () => {
      const data = await this.repository.snapshot();
      const machine = data.records.find((r) => r.id === draft.recordId);
      const counter = machine?.counters.find((c) => c.id === draft.counterId);
      if (!counter) throw new Error('Zähler nicht gefunden.');
      const existing = draft.entryId
        ? data.entries.find((e) => e.id === draft.entryId)
        : undefined;
      if (
        draft.entryId &&
        (!existing ||
          existing.counterId !== draft.counterId ||
          existing.recordId !== draft.recordId)
      )
        throw new Error('Der ursprüngliche Eintrag wurde nicht gefunden.');
      if (
        existing &&
        (existing.revisions.at(-1)?.id ?? null) !== draft.baseRevisionId
      )
        throw new Error(
          'Der Eintrag wurde zwischenzeitlich geändert. Bitte den Entwurf verwerfen und erneut öffnen.',
        );
      const f = draft.form;
      const occurredAt = new Date(f.occurredAt).toISOString();
      if (Date.parse(occurredAt) > Date.parse('2100-12-31T23:59:59.999Z'))
        throw new Error('Zeitpunkte sind bis Ende 2100 möglich.');
      const replacement = data.entries
        .filter(
          (e) =>
            e.counterId === counter.id &&
            e.id !== existing?.id &&
            e.kind === 'replacement' &&
            e.newCounterNumber &&
            Date.parse(e.occurredAt) < Date.parse(occurredAt),
        )
        .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
      const state = {
        kind: f.kind,
        occurredAt,
        timezoneOffsetMinutes:
          existing?.occurredAt === occurredAt
            ? existing.timezoneOffsetMinutes
            : -new Date(occurredAt).getTimezoneOffset(),
        counterName: existing?.counterName ?? counter.name,
        counterNumber:
          existing?.occurredAt === occurredAt
            ? existing.counterNumber
            : replacement?.newCounterNumber || counter.number,
        newCounterNumber:
          f.kind === 'replacement' ? f.newCounterNumber.trim() : '',
        measurement: { value: parseValue(f.value), unit: f.unit.trim() },
        closing:
          f.kind !== 'reading' && f.closingValue.trim()
            ? { value: parseValue(f.closingValue), unit: f.closingUnit.trim() }
            : null,
        note: f.note.trim(),
        source: f.source,
        ocr: f.ocr,
        attachments: f.attachments,
      };
      const now = this.env.now();
      if (
        existing &&
        evidenceJson(state) === evidenceJson(eventState(existing))
      ) {
        await this.repository.removeDraft(draft.id);
        return { entry: existing, warnings: [] };
      }
      if (existing && !f.reason.trim())
        throw new Error('Bitte einen Änderungsgrund angeben.');
      const entry = entrySchema.parse({
        ...state,
        id: existing?.id ?? this.env.id(),
        recordId: draft.recordId,
        counterId: counter.id,
        original: existing?.original ?? state,
        revisions: existing
          ? [
              ...existing.revisions,
              {
                id: this.env.id(),
                parentId: existing.revisions.at(-1)?.id ?? null,
                changedAt: now,
                reason: f.reason.trim(),
                before: eventState(existing),
                after: state,
              },
            ]
          : [],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
      validateSnapshot({
        ...data,
        entries: [...data.entries.filter((e) => e.id !== entry.id), entry],
      });
      await this.repository.saveEntry(entry, draft.id);
      // Historical photo versions are still referenced by the immutable revision chain.
      await this.cleanup(
        existing ? allAttachments(existing).map((a) => a.file) : [],
      );
      return { entry, warnings: await this.syncReminders() };
    });
  }
  discard(draft: EntryDraft): Promise<void> {
    return this.queue.run(async () => {
      await this.repository.removeDraft(draft.id);
      await this.cleanup(draft.form.attachments.map((a) => a.file));
    });
  }
  delete(kind: 'record' | 'entry' | 'report', id: string): Promise<string[]> {
    return this.queue.run(async () => {
      const candidates = snapshotFiles(await this.repository.snapshot());
      const drafts = await this.repository.drafts();
      candidates.push(
        ...drafts.flatMap((d) => d.form.attachments.map((a) => a.file)),
      );
      if (kind === 'record') await this.repository.deleteRecord(id);
      else if (kind === 'entry') {
        validateTimeline(
          (await this.repository.snapshot()).entries.filter((e) => e.id !== id),
        );
        await this.repository.deleteEntry(id);
      } else await this.repository.deleteReport(id);
      await this.cleanup(candidates);
      return this.syncReminders();
    });
  }
  createReport(
    recordId: string,
    entryId: string | null,
    full: boolean,
    counterId: string | null = null,
  ): Promise<SavedReport> {
    return this.queue.run(async () => {
      const data = await this.repository.snapshot();
      const record = data.records.find((r) => r.id === recordId);
      if (!record) throw new Error('Die Maschine wurde nicht gefunden.');
      const entries = data.entries.filter(
        (e) =>
          e.recordId === recordId &&
          (!entryId || e.id === entryId) &&
          (!counterId || e.counterId === counterId),
      );
      if (entryId && !entries.length)
        throw new Error('Der Eintrag wurde nicht gefunden.');
      if (counterId && !record.counters.some((c) => c.id === counterId))
        throw new Error('Zähler nicht gefunden.');
      const reportCounterId = entryId ? entries[0]!.counterId : counterId;
      const createdAt = this.env.now();
      const bytes = await this.pdf.create(record, entries, full, {
        kind: entryId ? 'single' : 'history',
        createdAt,
        context: data.entries.filter((e) => e.recordId === recordId),
      });
      const source = await inspectPdf(bytes);
      // A multipart file reserves one of its 100 pages for its own cover.
      const partCount =
        source.getPageCount() <= 100
          ? 1
          : Math.ceil(source.getPageCount() / 99);
      checkPdfPages(
        source.getPageCount() + (partCount > 1 ? partCount : 0),
        true,
      );
      const groupId = partCount > 1 ? this.env.id() : undefined;
      const files: string[] = [],
        reports: SavedReport[] = [];
      try {
        for (let index = 0; index < partCount; index++) {
          let part = bytes;
          if (partCount > 1) {
            const document = await PDFDocument.create();
            await this.pdf.addPartCover(
              document,
              record,
              index + 1,
              partCount,
              createdAt,
            );
            const indices = source
              .getPageIndices()
              .slice(index * 99, (index + 1) * 99);
            for (const page of await document.copyPages(source, indices))
              document.addPage(page);
            part = await document.save();
          }
          if (part.length > MAX_FILE_BYTES)
            throw new Error(
              'Der Protokollteil überschreitet die Grenze von 50 MB.',
            );
          const file = await this.vault.put(part, 'pdf');
          files.push(file);
          reports.push({
            id: this.env.id(),
            recordId,
            entryId,
            counterId: reportCounterId,
            name: `${record.name.slice(0, 200)} · ${entryId ? 'Einzelprotokoll' : counterId ? record.counters.find((c) => c.id === counterId)!.name : 'Maschinenprotokoll'} · ${full ? 'vollständig' : 'kompakt'}${partCount > 1 ? ` · Teil ${index + 1} von ${partCount}` : ''}`,
            file,
            sha256: digest(part),
            createdAt,
            full,
            ...(groupId ? { groupId, partIndex: index + 1, partCount } : {}),
          });
        }
        // Every part is prepared before a single transaction publishes the group.
        await this.repository.saveReports(reports);
        return reports[0]!;
      } catch (error) {
        await this.cleanup(files);
        throw error;
      }
    });
  }
}
