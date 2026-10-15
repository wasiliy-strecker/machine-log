import { z } from 'zod';
import { validateTimeline } from './counter-timeline';
import { formatValue } from './reading-value';
import { MAX_FILE_BYTES, MAX_PDF_PAGES } from '../files/limits';
import { machineIconIds } from './machine-icon';

const id = z.string().uuid();
const short = z.string().max(500);
const note = z.string().max(20000);
const timestamp = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value).toISOString());
export const fileKey = z.string().regex(/^[a-f0-9-]{36}\.(jpg|pdf)$/);
export const attachmentSchema = z
  .object({
    id,
    kind: z.enum(['photo', 'pdf']),
    name: short.min(1),
    file: fileKey,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    size: z.number().int().positive().max(MAX_FILE_BYTES),
    pages: z.number().int().positive().max(MAX_PDF_PAGES).optional(),
    source: z.enum(['camera', 'gallery', 'scanned', 'imported']).optional(),
  })
  .strict();
export const reminderSchema = z
  .object({
    interval: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly']),
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    deliveryMode: z.enum(['normal', 'punctualWithSound']),
    startsAtMillis: z.number().int().nonnegative(),
  })
  .strict()
  .refine((r) => r.interval !== 'weekly' || r.day <= 7, {
    message: 'Wochentag muss zwischen 1 und 7 liegen.',
  });
export const counterSchema = z
  .object({
    id,
    name: short.trim().min(1, 'Bitte eine Zählerbezeichnung eingeben.'),
    type: z.string().trim().min(1, 'Bitte eine Zählerart eingeben.').max(100),
    unit: z.string().trim().min(1, 'Bitte eine Einheit eingeben.').max(20),
    number: short,
    reminder: reminderSchema.nullable(),
    location: short.optional(),
    icon: z.enum(machineIconIds).optional(),
  })
  .strict();
export const recordSchema = z
  .object({
    id,
    name: short.trim().min(1, 'Bitte eine Bezeichnung eingeben.'),
    number: short,
    category: short,
    location: short,
    manufacturer: short,
    model: short,
    serial: short,
    installedOn: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
    note,
    counters: z.array(counterSchema).min(1).max(100),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  .strict();
export const valueSchema = z
  .object({
    digits: z
      .string()
      .regex(/^(0|[1-9][0-9]*)$/)
      .max(100),
    scale: z.number().int().min(0).max(100),
  })
  .strict();
const measurementSchema = z
  .object({ value: valueSchema, unit: z.string().trim().min(1).max(20) })
  .strict();
export const ocrSchema = z
  .object({
    photoId: id,
    rawText: z.string().max(100000),
    selectedText: z.string().max(500),
  })
  .strict();
export const eventStateSchema = z
  .object({
    kind: z.enum(['reading', 'reset', 'replacement']),
    occurredAt: timestamp,
    timezoneOffsetMinutes: z.number().int().min(-840).max(840),
    counterName: short.min(1),
    counterNumber: short,
    newCounterNumber: short,
    measurement: measurementSchema,
    closing: measurementSchema.nullable(),
    source: z.enum(['manual', 'camera', 'gallery']),
    ocr: ocrSchema.nullable(),
    note,
    attachments: z.array(attachmentSchema).max(200),
  })
  .strict()
  .refine((e) => e.kind !== 'reading' || e.closing === null, {
    message: 'Eine Ablesung hat keinen Wechsel-Endstand.',
  });
export const revisionSchema = z
  .object({
    id,
    parentId: id.nullable(),
    changedAt: timestamp,
    reason: short.trim(),
    before: eventStateSchema,
    after: eventStateSchema,
  })
  .strict();
export const entrySchema = eventStateSchema
  .safeExtend({
    id,
    recordId: id,
    counterId: id,
    original: eventStateSchema,
    revisions: z.array(revisionSchema).max(1000),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  .strict();
export const reportSchema = z
  .object({
    id,
    recordId: id,
    entryId: id.nullable(),
    counterId: id.nullable(),
    name: short,
    file: fileKey,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    createdAt: timestamp,
    full: z.boolean(),
    groupId: id.optional(),
    partIndex: z.number().int().positive().optional(),
    partCount: z.number().int().min(2).max(20).optional(),
  })
  .strict();
export const snapshotSchema = z
  .object({
    records: z.array(recordSchema).max(10000),
    entries: z.array(entrySchema).max(100000),
    reports: z.array(reportSchema).max(20000),
  })
  .strict();
export type Machine = z.infer<typeof recordSchema>;
export type Counter = z.infer<typeof counterSchema>;
export type CounterEvent = z.infer<typeof entrySchema>;
export type EventState = z.infer<typeof eventStateSchema>;
export type Revision = z.infer<typeof revisionSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type SavedReport = z.infer<typeof reportSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type EntryForm = {
  kind: EventState['kind'];
  occurredAt: string;
  value: string;
  unit: string;
  closingValue: string;
  closingUnit: string;
  newCounterNumber: string;
  note: string;
  reason: string;
  source: EventState['source'];
  ocr: EventState['ocr'];
  attachments: Attachment[];
};
export type EntryDraft = {
  id: string;
  recordId: string;
  counterId: string;
  entryId: string | null;
  baseRevisionId: string | null;
  createdAt: string;
  form: EntryForm;
  updatedAt: string;
  external: 'camera' | 'gallery' | 'pdf' | 'scanner' | null;
  captureStage?: 'choose' | 'form';
  captureSource?: 'manual' | 'photo';
};
export const categories = [
  'Fertigung',
  'Montage',
  'Verpackung',
  'Abfüllung',
  'Druck',
  'Zuschnitt',
  'Sonstige Maschine',
];
export const units = [
  'Stück',
  'Zyklen',
  'h',
  'kg',
  'Liter',
  'm³',
  'm²',
  'Laufmeter',
  'Chargen',
  'Pakete',
  'Kartons',
  'Paletten',
  'g',
  't',
  'ml',
  'Rollen',
  'Bogen',
];
export const counterTypes = {
  pieces: 'Stückzahl',
  cycles: 'Zyklen',
  hours: 'Betriebsstunden',
  quantity: 'Menge',
};
export const defaultUnits = {
  pieces: 'Stück',
  cycles: 'Zyklen',
  hours: 'h',
  quantity: 'kg',
};
export const eventLabels = {
  reading: 'Ablesung',
  reset: 'Rücksetzung',
  replacement: 'Zählerwechsel',
};
export const sourceLabels = {
  manual: 'Manuell erfasst',
  camera: 'Kameraaufnahme',
  gallery: 'Galerieimport',
};
export const PAGE_SIZE = 10;
export function eventState(entry: CounterEvent): EventState {
  return eventStateSchema.parse(entryStateInput(entry));
}
function entryStateInput(e: EventState): EventState {
  return {
    kind: e.kind,
    occurredAt: e.occurredAt,
    timezoneOffsetMinutes: e.timezoneOffsetMinutes,
    counterName: e.counterName,
    counterNumber: e.counterNumber,
    newCounterNumber: e.newCounterNumber,
    measurement: e.measurement,
    closing: e.closing,
    source: e.source,
    ocr: e.ocr,
    note: e.note,
    attachments: e.attachments,
  };
}
export function formFromEntry(e: CounterEvent): EntryForm {
  return {
    kind: e.kind,
    occurredAt: e.occurredAt,
    value: formatValue(e.measurement.value),
    unit: e.measurement.unit,
    closingValue: e.closing ? formatValue(e.closing.value) : '',
    closingUnit: e.closing?.unit ?? e.measurement.unit,
    newCounterNumber: e.newCounterNumber,
    note: e.note,
    reason: '',
    source: e.source,
    ocr: e.ocr,
    attachments: e.attachments,
  };
}
export function eventVersions(e: CounterEvent): EventState[] {
  return [e, e.original, ...e.revisions.flatMap((r) => [r.before, r.after])];
}
export function allAttachments(e: CounterEvent): Attachment[] {
  return eventVersions(e).flatMap((v) => v.attachments);
}
export function snapshotFiles(data: Snapshot): string[] {
  return [
    ...new Set([
      ...data.entries.flatMap((e) => allAttachments(e).map((a) => a.file)),
      ...data.reports.map((r) => r.file),
    ]),
  ];
}
// Local file keys may be remapped during a restore. Content hashes and all
// other fields define the immutable evidence, not its storage location.
export function evidenceJson(value: unknown): string {
  const canonical = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(canonical);
    if (input && typeof input === 'object')
      return Object.fromEntries(
        Object.entries(input)
          .filter(([key]) => key !== 'file')
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, canonical(item)]),
      );
    return input;
  };
  return JSON.stringify(canonical(value));
}
export function validateSnapshot(input: unknown): Snapshot {
  const data = snapshotSchema.parse(input);
  const unique = (ids: string[]) => new Set(ids).size === ids.length;
  for (const rows of [data.records, data.entries, data.reports])
    if (!unique(rows.map((r) => r.id)))
      throw new Error('Doppelte IDs im Backup.');
  if (!unique(data.records.flatMap((r) => r.counters.map((c) => c.id))))
    throw new Error('Doppelte Zähler-IDs.');
  const records = new Map(data.records.map((r) => [r.id, r]));
  const entries = new Map(data.entries.map((e) => [e.id, e]));
  for (const e of data.entries) {
    if (!records.get(e.recordId)?.counters.some((c) => c.id === e.counterId))
      throw new Error('Ungültige Zählerzuordnung.');
    let before = e.original;
    let parent: string | null = null;
    if (!unique(e.revisions.map((r) => r.id)))
      throw new Error('Doppelte Korrektur-IDs.');
    for (const revision of e.revisions) {
      if (
        revision.parentId !== parent ||
        evidenceJson(revision.before) !== evidenceJson(before)
      )
        throw new Error('Unterbrochene Korrekturhistorie.');
      before = revision.after;
      parent = revision.id;
    }
    if (evidenceJson(eventState(e)) !== evidenceJson(before))
      throw new Error(
        'Der aktuelle Eintrag passt nicht zur Korrekturhistorie.',
      );
    for (const version of eventVersions(e)) {
      if (!unique(version.attachments.map((a) => a.id)))
        throw new Error('Doppelte Anhänge.');
      if (
        version.ocr &&
        !version.attachments.some(
          (a) => a.kind === 'photo' && a.id === version.ocr?.photoId,
        )
      )
        throw new Error('OCR-Foto fehlt.');
      for (const a of version.attachments)
        if ((a.kind === 'pdf') !== a.file.endsWith('.pdf'))
          throw new Error('Ungültiger Anhangstyp.');
    }
  }
  validateTimeline(data.entries);
  for (const r of data.reports) {
    if (
      !records.has(r.recordId) ||
      (r.entryId && entries.get(r.entryId)?.recordId !== r.recordId) ||
      (r.counterId &&
        !records.get(r.recordId)!.counters.some((c) => c.id === r.counterId)) ||
      (r.entryId && r.counterId !== entries.get(r.entryId)?.counterId)
    )
      throw new Error('Ungültiges Protokoll.');
    if (
      (r.groupId || r.partIndex || r.partCount) &&
      (!r.groupId || !r.partIndex || !r.partCount || r.partIndex > r.partCount)
    )
      throw new Error('Ungültige Protokollteile.');
  }
  const groups = new Map<string, SavedReport[]>();
  for (const report of data.reports)
    if (report.groupId)
      groups.set(report.groupId, [
        ...(groups.get(report.groupId) ?? []),
        report,
      ]);
  for (const reports of groups.values()) {
    const first = reports[0]!;
    if (
      !unique(reports.map((r) => String(r.partIndex))) ||
      reports.some(
        (r) =>
          r.recordId !== first.recordId ||
          r.entryId !== first.entryId ||
          r.counterId !== first.counterId ||
          r.createdAt !== first.createdAt ||
          r.full !== first.full ||
          r.partCount !== first.partCount,
      )
    )
      throw new Error('Widersprüchliche Protokollteile.');
  }
  return data;
}
