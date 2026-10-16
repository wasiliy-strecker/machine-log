import { PDFDocument, type PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  eventLabels,
  sourceLabels,
  type Attachment,
  type EventState,
  type CounterEvent,
  type Machine,
} from '../domain/models';
import { reportAttachments } from '../domain/report-attachments';
import { chronological, increment } from '../domain/counter-timeline';
import { formatValue } from '../domain/reading-value';
import {
  ReportLayout,
  REPORT_BLUE,
  REPORT_GREY,
  type ReportFonts,
} from './report-layout';
import type { FileVault } from '../ports';
import { verifiedFile } from '../files/integrity';
import {
  ContentLimitError,
  MAX_FILE_BYTES,
  checkPdfPages,
} from '../files/limits';

export { MAX_FILE_BYTES } from '../files/limits';
export async function inspectPdf(bytes: Uint8Array): Promise<PDFDocument> {
  if (bytes.length > MAX_FILE_BYTES)
    throw new ContentLimitError('Die PDF überschreitet die Grenze von 50 MB.');
  if (bytes.length < 20) throw new Error('Die PDF ist leer oder beschädigt.');
  const head = String.fromCharCode(...bytes.slice(0, 8));
  const tail = String.fromCharCode(...bytes.slice(-2048));
  if (!head.startsWith('%PDF-') || !tail.includes('%%EOF'))
    throw new Error('Die PDF ist beschädigt oder unvollständig.');
  try {
    const pdf = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    });
    if (pdf.isEncrypted)
      throw new Error('Passwortgeschützte PDFs werden nicht unterstützt.');
    checkPdfPages(pdf.getPageCount());
    if (!pdf.getPageCount()) throw new Error('Die PDF hat keine Seiten.');
    for (const page of pdf.getPages()) {
      if (
        !Number.isFinite(page.getWidth()) ||
        !Number.isFinite(page.getHeight()) ||
        page.getWidth() <= 0 ||
        page.getHeight() <= 0
      )
        throw new Error('Ungültiges Seitenformat.');
    }
    return pdf;
  } catch (error) {
    if (error instanceof ContentLimitError) throw error;
    if (
      String(error).toLowerCase().includes('encrypt') ||
      String(error).includes('Passwort')
    )
      throw new Error(
        'Diese PDF ist passwortgeschützt. Bitte eine ungeschützte Kopie verwenden.',
      );
    throw new Error(
      'Die PDF ist beschädigt oder enthält keine lesbaren Seiten.',
    );
  }
}
export type ReportFontBytes = { regular: Uint8Array; bold: Uint8Array };
export type ReportOptions = {
  kind: 'single' | 'history';
  createdAt: string;
  context?: CounterEvent[];
};

function dateTime(iso: string, withOffset = false) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  const text = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (!withOffset) return text;
  const offset = -date.getTimezoneOffset();
  return `${text} (UTC${offset >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)})`;
}
function measurement(entry: EventState) {
  return `${formatValue(entry.measurement.value)} ${entry.measurement.unit}`;
}
function eventTime(entry: EventState) {
  const shifted = new Date(
    Date.parse(entry.occurredAt) + entry.timezoneOffsetMinutes * 60000,
  );
  const time = shifted.toISOString().slice(0, 16).replace('T', ' ');
  const offset = entry.timezoneOffsetMinutes;
  return `${time} (UTC${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')})`;
}
function summary(entry: CounterEvent) {
  return `${eventLabels[entry.kind]} · ${measurement(entry)}`;
}
function recordSection(layout: ReportLayout, record: Machine) {
  const rows = [
    ['Kategorie', record.category || 'Nicht angegeben'],
    ['Maschine', record.name],
    ['Maschinennummer', record.number || 'Nicht angegeben'],
    ...Object.entries({
      Standort: record.location,
      Hersteller: record.manufacturer,
      Modell: record.model,
      Seriennummer: record.serial,
      Inbetriebnahme: record.installedOn
        ? record.installedOn.split('-').reverse().join('.')
        : '',
    }).filter(([, value]) => value),
  ];
  layout.ensure(80);
  layout.text('Aktuelle Maschinenangaben', { bold: true });
  layout.gap(6);
  layout.dataTable(rows);
  if (record.note.trim()) {
    layout.ensure(45);
    layout.gap(10);
    layout.text('Notiz zur Maschine', { bold: true });
    layout.gap(4);
    layout.text(record.note);
  }
}
function reportHeading(
  layout: ReportLayout,
  record: Machine,
  full: boolean,
  options: ReportOptions,
) {
  layout.gap(16);
  layout.text('Produktionsprotokoll', { size: 24, bold: true });
  layout.gap(4);
  layout.text(
    options.kind === 'single' ? 'Einzelner Eintrag' : 'Produktionsverlauf',
    { size: 14, color: REPORT_GREY },
  );
  layout.gap(6);
  layout.text(
    `PDF erstellt am ${dateTime(options.createdAt)} · ${full ? 'Mit Fotos' : 'Kompakt ohne Anhänge'}`,
    { size: 9, color: REPORT_GREY },
  );
  layout.gap(18);
  recordSection(layout, record);
  layout.gap(18);
}
function stateRows(state: EventState): string[][] {
  return [
    ['Ereignis', eventLabels[state.kind]],
    ['Zähler', state.counterName],
    ...(state.counterNumber ? [['Zählernummer', state.counterNumber]] : []),
    [
      state.kind === 'reading' ? 'Zählerstand' : 'Neuer Startstand',
      measurement(state),
    ],
    ...(state.kind === 'reading'
      ? []
      : [
          [
            'Alter Endstand',
            state.closing
              ? `${formatValue(state.closing.value)} ${state.closing.unit}`
              : 'Unbekannt · Berechnungslücke',
          ],
        ]),
    ...(state.newCounterNumber
      ? [['Neue Zählernummer', state.newCounterNumber]]
      : []),
    ['Zeitpunkt', eventTime(state)],
    ['Quelle', sourceLabels[state.source]],
    ...(state.ocr
      ? [
          [
            'Gewählter OCR-Vorschlag',
            state.ocr.selectedText || 'Kein Vorschlag übernommen',
          ],
        ]
      : []),
    ...(state.note ? [['Notiz', state.note]] : []),
    ['Anhänge', state.attachments.map((a) => a.name).join(', ') || 'Keine'],
  ];
}
function entrySection(
  layout: ReportLayout,
  entry: CounterEvent,
  previous: CounterEvent | undefined,
  number: number,
) {
  layout.ensure(120);
  layout.gap(16);
  layout.text(`Eintrag ${number} · ${entry.counterName}`, {
    size: 17,
    bold: true,
    color: REPORT_BLUE,
  });
  layout.gap(8);
  layout.dataTable([
    ...stateRows(entry),
    ['Zuwachs', increment(entry, previous).label],
    ['Erstmals gespeichert', dateTime(entry.createdAt, true)],
  ]);
  if (Date.parse(entry.occurredAt) > Date.parse(entry.updatedAt)) {
    layout.gap(6);
    layout.text(
      'Der Ablesezeitpunkt lag beim Speichern dieses Stands in der Zukunft.',
      { size: 10 },
    );
  }
  if (entry.revisions.length) {
    layout.gap(12);
    layout.text('Ursprünglicher Eintrag', { bold: true });
    layout.gap(6);
    layout.dataTable(stateRows(entry.original));
    for (const [i, revision] of entry.revisions.entries()) {
      layout.ensure(90);
      layout.gap(12);
      layout.text(
        `Korrektur ${i + 1} · ${dateTime(revision.changedAt, true)}`,
        { bold: true },
      );
      if (revision.reason) layout.text(`Änderungsgrund: ${revision.reason}`);
      layout.gap(6);
      const before = stateRows(revision.before),
        after = stateRows(revision.after);
      const keys = [...new Set([...before, ...after].map((r) => r[0]!))];
      const rows = keys
        .filter(
          (key) =>
            before.find((r) => r[0] === key)?.[1] !==
            after.find((r) => r[0] === key)?.[1],
        )
        .map((key) => [
          key,
          `${before.find((r) => r[0] === key)?.[1] ?? '–'} → ${after.find((r) => r[0] === key)?.[1] ?? '–'}`,
        ]);
      // A photo can be replaced while retaining the same displayed filename.
      if (
        JSON.stringify(revision.before.attachments.map((a) => a.sha256)) !==
        JSON.stringify(revision.after.attachments.map((a) => a.sha256))
      )
        rows.push([
          'Dateiversionen',
          'Anhänge geändert. Frühere Versionen bleiben gespeichert.',
        ]);
      if (rows.length) layout.dataTable(rows);
    }
  }
}

export class PdfService {
  constructor(
    private vault: FileVault,
    private fontBytes: () => Promise<ReportFontBytes>,
  ) {}

  async addPartCover(
    pdf: PDFDocument,
    record: Machine,
    index: number,
    total: number,
    createdAt: string,
  ) {
    pdf.registerFontkit(fontkit);
    const bytes = await this.fontBytes();
    const fonts = {
      regular: await pdf.embedFont(bytes.regular, { subset: true }),
      bold: await pdf.embedFont(bytes.bold, { subset: true }),
    };
    const cover = new ReportLayout(pdf, fonts, undefined, true);
    cover.text('MASCHINENLOG', { size: 24, bold: true });
    cover.gap(24);
    cover.text(record.name, { size: 20 });
    cover.gap(16);
    cover.text(`Produktionsprotokoll – Teil ${index} von ${total}`, {
      size: 18,
    });
    cover.gap(16);
    cover.text(`Erstellt am ${dateTime(createdAt)}`);
    cover.gap(24);
    cover.text(
      `Dieser Teil gehört zu einem zusammenhängenden Protokoll. Bitte alle ${total} Teile gemeinsam aufbewahren.`,
    );
    if (index > 1) {
      cover.gap(12);
      cover.text(
        `Fortsetzung aus Teil ${index - 1}. Einträge oder Dokumente können über die Teilgrenze hinweg fortgesetzt werden.`,
      );
    }
    pdf.setTitle(
      `Produktionsprotokoll · ${record.name} · Teil ${index} von ${total}`,
    );
    pdf.setAuthor('MaschinenLog');
    pdf.setCreationDate(new Date(createdAt));
  }

  async create(
    record: Machine,
    entries: CounterEvent[],
    full: boolean,
    options: ReportOptions,
  ): Promise<Uint8Array> {
    const referenced = new Map(
      entries.flatMap(reportAttachments).map((a) => [a.file, a]),
    );
    if (
      [...referenced.values()].reduce((sum, a) => sum + a.size, 0) >
      64 * 1024 * 1024
    )
      throw new Error(
        'Die Anhänge dieses Protokolls überschreiten 64 MB. Bitte Einzelprotokolle erstellen.',
      );
    const pdf = await PDFDocument.create();
    pdf.setTitle(`Produktionsprotokoll · ${record.name}`);
    pdf.setAuthor('MaschinenLog');
    pdf.setSubject(
      'Lokale Dokumentation von Produktionsständen und Korrekturen',
    );
    pdf.setProducer('MaschinenLog · lokale Verarbeitung');
    pdf.setCreationDate(new Date(options.createdAt));
    pdf.registerFontkit(fontkit);
    const bytes = await this.fontBytes();
    const fonts: ReportFonts = {
      regular: await pdf.embedFont(bytes.regular, { subset: true }),
      bold: await pdf.embedFont(bytes.bold, { subset: true }),
    };
    const history = new ReportLayout(pdf, fonts);
    reportHeading(history, record, full, options);
    const ordered = [...entries].sort(
      (a, b) =>
        record.counters.findIndex((c) => c.id === a.counterId) -
          record.counters.findIndex((c) => c.id === b.counterId) ||
        Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    );
    const previous = new Map<string, CounterEvent>();
    const last = new Map<string, CounterEvent>();
    for (const e of chronological(options.context ?? entries)) {
      const p = last.get(e.counterId);
      if (p) previous.set(e.id, p);
      last.set(e.counterId, e);
    }
    if (options.kind === 'history') {
      for (const counter of record.counters) {
        const rows = ordered.filter((e) => e.counterId === counter.id);
        if (!rows.length) continue;
        history.ensure(120);
        history.gap(12);
        history.text(counter.name, {
          size: 17,
          bold: true,
          color: REPORT_BLUE,
        });
        history.gap(8);
        history.historyTable(
          rows.map((e, index) => [
            String(rows.length - index),
            eventTime(e),
            summary(e),
            increment(e, previous.get(e.id)).label,
          ]),
        );
      }
    }
    if (!ordered.length) history.text('Noch keine Einträge vorhanden.');
    history.finish();
    let number = 0;
    for (const entry of ordered) {
      number++;
      const layout = new ReportLayout(pdf, fonts, number);
      entrySection(layout, entry, previous.get(entry.id), number);
      const current = new Set(entry.attachments.map((a) => a.file));
      const attachments = reportAttachments(entry);
      const photos: { attachment: Attachment; image: PDFImage }[] = [];
      const documents: { attachment: Attachment; pdf: PDFDocument }[] = [];
      for (const attachment of attachments) {
        const content = await verifiedFile(this.vault, attachment);
        if (attachment.kind === 'pdf') {
          const original = await inspectPdf(content);
          if (original.getPageCount() !== attachment.pages)
            throw new Error(
              'Die Seitenzahl eines PDF-Anhangs stimmt nicht mehr.',
            );
          documents.push({ attachment, pdf: original });
        } else {
          const image = await (
            full ? pdf : await PDFDocument.create()
          ).embedJpg(content);
          if (full) photos.push({ attachment, image });
        }
      }
      if (full)
        for (const [index, { image, attachment }] of photos.entries())
          layout.photo(image, {
            title: 'Aktuelle Fotos',
            name: attachment.name,
            number: index + 1,
            total: photos.length,
          });
      else if (attachments.length) {
        layout.gap(12);
        layout.text('Anhänge (nicht eingebettet)', { bold: true });
        for (const a of attachments)
          layout.text(
            `${current.has(a.file) ? 'Aktuell' : 'Frühere Version'} · ${a.name}`,
            { size: 10 },
          );
      }
      layout.finish();
      if (full)
        for (const { attachment, pdf: original } of documents) {
          const divider = new ReportLayout(pdf, fonts, undefined, true);
          divider.text('MASCHINENLOG', { bold: true, color: REPORT_BLUE });
          divider.gap(30);
          divider.text(`Dokument zu Eintrag ${number}`, {
            size: 22,
            bold: true,
          });
          divider.gap(12);
          divider.text(
            current.has(attachment.file)
              ? 'Aktuelle Dokumentversion'
              : 'Frühere Dokumentversion',
          );
          divider.text(attachment.name);
          divider.gap(12);
          divider.text(
            `${original.getPageCount()} unveränderte Originalseiten folgen.`,
          );
          divider.finish();
          checkPdfPages(pdf.getPageCount() + original.getPageCount(), true);
          for (const page of await pdf.copyPages(
            original,
            original.getPageIndices(),
          ))
            pdf.addPage(page);
        }
    }
    checkPdfPages(pdf.getPageCount(), true);
    const result = await pdf.save();
    if (result.length > MAX_FILE_BYTES)
      throw new Error(
        'Das Protokoll überschreitet 50 MB. Bitte kleinere Einzelprotokolle erstellen.',
      );
    return result;
  }
}
