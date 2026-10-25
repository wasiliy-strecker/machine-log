import { displayValue } from '../localization/numbers';
import { presetLabel } from '../localization/presets';
import { localDate } from '../ui/date-time-model';
import {
  localization,
  translator,
  type Localization,
  LocalizedError,
} from '../localization/runtime';
import { PDFDocument, type PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  type Attachment,
  type EventState,
  type CounterEvent,
  type Machine,
} from '../domain/models';
import { reportAttachments } from '../domain/report-attachments';
import { chronological, increment } from '../domain/counter-timeline';

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
    throw new ContentLimitError('diePdfUeberschreitetDieGrenzeVon50Mb');
  if (bytes.length < 20)
    throw new LocalizedError('diePdfIstLeerOderBeschaedigt');
  const head = String.fromCharCode(...bytes.slice(0, 8));
  const tail = String.fromCharCode(...bytes.slice(-2048));
  if (!head.startsWith('%PDF-') || !tail.includes('%%EOF'))
    throw new LocalizedError('diePdfIstBeschaedigtOderUnvollstaendig');
  try {
    const pdf = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    });
    if (pdf.isEncrypted)
      throw new LocalizedError(
        'passwortgeschuetztePdfsWerdenNichtUnterstuetzt',
      );
    checkPdfPages(pdf.getPageCount());
    if (!pdf.getPageCount()) throw new LocalizedError('diePdfHatKeineSeiten');
    for (const page of pdf.getPages()) {
      if (
        !Number.isFinite(page.getWidth()) ||
        !Number.isFinite(page.getHeight()) ||
        page.getWidth() <= 0 ||
        page.getHeight() <= 0
      )
        throw new LocalizedError('ungueltigesSeitenformat');
    }
    return pdf;
  } catch (error) {
    if (error instanceof ContentLimitError) throw error;
    if (
      String(error).toLowerCase().includes('encrypt') ||
      (error instanceof LocalizedError &&
        error.key === 'passwortgeschuetztePdfsWerdenNichtUnterstuetzt')
    )
      throw new LocalizedError(
        'diesePdfIstPasswortgeschuetztBitteEineUngeschuetzteKopieVerwenden',
      );
    throw new LocalizedError(
      'diePdfIstBeschaedigtOderEnthaeltKeineLesbarenSeiten',
    );
  }
}
export type ReportFontBytes = {
  regular: Uint8Array;
  bold: Uint8Array;
};
export type ReportOptions = {
  kind: 'single' | 'history';
  createdAt: string;
  context?: CounterEvent[];
  locale?: Localization;
};
function reportText(locale: Localization) {
  const t = translator(locale);
  const formatValue = (value: import('../domain/reading-value').ReadingValue) =>
    displayValue(value, locale.formatLocale);
  const eventLabels = {
    reading: t('reading'),
    reset: t('ruecksetzung'),
    replacement: t('meterReplacement'),
  };
  const sourceLabels = {
    manual: t('manuallyRecorded'),
    camera: t('cameraPhoto'),
    gallery: t('galleryImport'),
  };
  function dateTime(iso: string, withOffset = false) {
    const date = new Date(iso);
    const pad = (value: number) => String(value).padStart(2, '0');
    const text = date.toLocaleString(locale.formatLocale, {
      dateStyle: 'short',
      timeStyle: 'short',
      calendar: 'gregory',
    });
    if (!withOffset) return text;
    const offset = -date.getTimezoneOffset();
    return `${text} (UTC${offset >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)})`;
  }
  function measurement(entry: EventState) {
    return `${formatValue(entry.measurement.value)} ${presetLabel(entry.measurement.unit, locale)}`;
  }
  function eventTime(entry: EventState) {
    const shifted = new Date(
      Date.parse(entry.occurredAt) + entry.timezoneOffsetMinutes * 60000,
    );
    const time = shifted.toLocaleString(locale.formatLocale, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC',
      calendar: 'gregory',
    });
    const offset = entry.timezoneOffsetMinutes;
    return `${time} (UTC${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')})`;
  }
  function summary(entry: CounterEvent) {
    return `${eventLabels[entry.kind]} · ${measurement(entry)}`;
  }
  function recordSection(layout: ReportLayout, record: Machine) {
    const rows = [
      [
        t('kategorie'),
        presetLabel(record.category, locale) || t('notSpecified494'),
      ],
      [t('maschine'), record.name],
      [t('maschinennummer'), record.number || t('notSpecified494')],
      ...Object.entries({
        [t('location')]: record.location,
        [t('manufacturer')]: record.manufacturer,
        [t('model')]: record.model,
        [t('serialNumber')]: record.serial,
        [t('installedOn')]: record.installedOn
          ? localDate(record.installedOn).toLocaleDateString(
              locale.formatLocale,
            )
          : '',
      }).filter(([, value]) => value),
    ];
    layout.ensure(80);
    layout.text(t('aktuelleMaschinenangaben'), { bold: true });
    layout.gap(6);
    layout.dataTable(rows);
    if (record.note.trim()) {
      layout.ensure(45);
      layout.gap(10);
      layout.text(t('notizZurMaschine'), { bold: true });
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
    layout.text(t('produktionsprotokoll'), { size: 24, bold: true });
    layout.gap(4);
    layout.text(
      options.kind === 'single' ? t('singleEntry') : t('produktionsverlauf'),
      { size: 14, color: REPORT_GREY },
    );
    layout.gap(6);
    layout.text(
      t('pdfCreatedOnValueValue', {
        p0: dateTime(options.createdAt),
        p1: full ? t('mitFotos') : t('compactWithoutAttachments'),
      }),
      { size: 9, color: REPORT_GREY },
    );
    layout.gap(18);
    recordSection(layout, record);
    layout.gap(18);
  }
  function stateRows(state: EventState): string[][] {
    return [
      [t('ereignis'), eventLabels[state.kind]],
      [t('meter'), state.counterName],
      ...(state.counterNumber ? [[t('meterNumber'), state.counterNumber]] : []),
      [
        state.kind === 'reading' ? t('meterReading') : t('neuerStartstand'),
        measurement(state),
      ],
      ...(state.kind === 'reading'
        ? []
        : [
            [
              t('alterEndstand'),
              state.closing
                ? `${formatValue(state.closing.value)} ${presetLabel(state.closing.unit, locale)}`
                : t('unbekanntBerechnungsluecke'),
            ],
          ]),
      ...(state.newCounterNumber
        ? [[t('neueZaehlernummer'), state.newCounterNumber]]
        : []),
      [t('dateAndTime'), eventTime(state)],
      [t('source'), sourceLabels[state.source]],
      ...(state.ocr
        ? [
            [
              t('gewaehlterOcrVorschlag'),
              state.ocr.selectedText || t('keinVorschlagUebernommen'),
            ],
          ]
        : []),
      ...(state.note ? [[t('note'), state.note]] : []),
      [
        t('anhaenge'),
        state.attachments.map((a) => a.name).join(', ') || t('keine'),
      ],
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
    layout.text(t('eintragValueValue', { p0: number, p1: entry.counterName }), {
      size: 17,
      bold: true,
      color: REPORT_BLUE,
    });
    layout.gap(8);
    layout.dataTable([
      ...stateRows(entry),
      [t('zuwachs'), increment(entry, previous, locale).label],
      [t('erstmalsGespeichert'), dateTime(entry.createdAt, true)],
    ]);
    if (Date.parse(entry.occurredAt) > Date.parse(entry.updatedAt)) {
      layout.gap(6);
      layout.text(
        t('derAblesezeitpunktLagBeimSpeichernDiesesStandsInDerZukunft'),
        { size: 10 },
      );
    }
    if (entry.revisions.length) {
      layout.gap(12);
      layout.text(t('urspruenglicherEintrag'), { bold: true });
      layout.gap(6);
      layout.dataTable(stateRows(entry.original));
      for (const [i, revision] of entry.revisions.entries()) {
        layout.ensure(90);
        layout.gap(12);
        layout.text(
          t('korrekturValueValue', {
            p0: i + 1,
            p1: dateTime(revision.changedAt, true),
          }),
          { bold: true },
        );
        if (revision.reason)
          layout.text(t('anderungsgrundValue', { p0: revision.reason }));
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
            t('dateiversionen'),
            t('anhaengeGeaendertFruehereVersionenBleibenGespeichert'),
          ]);
        if (rows.length) layout.dataTable(rows);
      }
    }
  }
  return { dateTime, eventTime, summary, reportHeading, entrySection };
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
    locale: Localization = localization(),
  ) {
    const t = translator(locale);
    const { dateTime } = reportText(locale);
    pdf.registerFontkit(fontkit);
    const bytes = await this.fontBytes();
    const fonts = {
      regular: await pdf.embedFont(bytes.regular, { subset: true }),
      bold: await pdf.embedFont(bytes.bold, { subset: true }),
    };
    const cover = new ReportLayout(pdf, fonts, undefined, true, locale);
    cover.text(t('maschinenlog447'), { size: 24, bold: true });
    cover.gap(24);
    cover.text(record.name, { size: 20 });
    cover.gap(16);
    cover.text(
      t('produktionsprotokollTeilValueVonValue', { p0: index, p1: total }),
      {
        size: 18,
      },
    );
    cover.gap(16);
    cover.text(t('erstelltAmValue', { p0: dateTime(createdAt) }));
    cover.gap(24);
    cover.text(
      t('thisPartBelongsToACompleteReportPleaseKeepAllValuePartsTogether', {
        p0: total,
      }),
    );
    if (index > 1) {
      cover.gap(12);
      cover.text(
        t('continuedFromPartValueEntriesOrDocumentsMayContinueAcrossParts', {
          p0: index - 1,
        }),
      );
    }
    pdf.setTitle(
      t('produktionsprotokollValueTeilValueVonValue', {
        p0: record.name,
        p1: index,
        p2: total,
      }),
    );
    pdf.setAuthor(t('maschinenlog'));
    pdf.setCreationDate(new Date(createdAt));
  }
  async create(
    record: Machine,
    entries: CounterEvent[],
    full: boolean,
    options: ReportOptions,
  ): Promise<Uint8Array> {
    const locale = options.locale ?? localization();
    const t = translator(locale);
    const { reportHeading, eventTime, summary, entrySection } =
      reportText(locale);
    const referenced = new Map(
      entries.flatMap(reportAttachments).map((a) => [a.file, a]),
    );
    if (
      [...referenced.values()].reduce((sum, a) => sum + a.size, 0) >
      64 * 1024 * 1024
    )
      throw new LocalizedError(
        'dieAnhaengeDiesesProtokollsUeberschreiten64MbBitteEinzelprotokolleErstellen',
      );
    const pdf = await PDFDocument.create();
    pdf.setTitle(t('produktionsprotokollValue', { p0: record.name }));
    pdf.setAuthor(t('maschinenlog'));
    pdf.setSubject(
      t('lokaleDokumentationVonProduktionsstaendenUndKorrekturen'),
    );
    pdf.setProducer(t('maschinenlogLokaleVerarbeitung'));
    pdf.setCreationDate(new Date(options.createdAt));
    pdf.registerFontkit(fontkit);
    const bytes = await this.fontBytes();
    const fonts: ReportFonts = {
      regular: await pdf.embedFont(bytes.regular, { subset: true }),
      bold: await pdf.embedFont(bytes.bold, { subset: true }),
    };
    const history = new ReportLayout(pdf, fonts, undefined, false, locale);
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
            increment(e, previous.get(e.id), locale).label,
          ]),
        );
      }
    }
    if (!ordered.length) history.text(t('noEntriesYet'));
    history.finish();
    let number = 0;
    for (const entry of ordered) {
      number++;
      const layout = new ReportLayout(pdf, fonts, number, false, locale);
      entrySection(layout, entry, previous.get(entry.id), number);
      const current = new Set(entry.attachments.map((a) => a.file));
      const attachments = reportAttachments(entry);
      const photos: {
        attachment: Attachment;
        image: PDFImage;
      }[] = [];
      const documents: {
        attachment: Attachment;
        pdf: PDFDocument;
      }[] = [];
      for (const attachment of attachments) {
        const content = await verifiedFile(this.vault, attachment);
        if (attachment.kind === 'pdf') {
          const original = await inspectPdf(content);
          if (original.getPageCount() !== attachment.pages)
            throw new LocalizedError(
              'dieSeitenzahlEinesPdfAnhangsStimmtNichtMehr',
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
            title: t('aktuelleFotos'),
            name: attachment.name,
            number: index + 1,
            total: photos.length,
          });
      else if (attachments.length) {
        layout.gap(12);
        layout.text(t('anhaengeNichtEingebettet'), { bold: true });
        for (const a of attachments)
          layout.text(
            `${current.has(a.file) ? t('aktuell') : t('fruehereVersion')} · ${a.name}`,
            { size: 10 },
          );
      }
      layout.finish();
      if (full)
        for (const { attachment, pdf: original } of documents) {
          const divider = new ReportLayout(pdf, fonts, undefined, true, locale);
          divider.text(t('maschinenlog447'), {
            bold: true,
            color: REPORT_BLUE,
          });
          divider.gap(30);
          divider.text(t('documentForEntryValue', { p0: number }), {
            size: 22,
            bold: true,
          });
          divider.gap(12);
          divider.text(
            current.has(attachment.file)
              ? t('aktuelleDokumentversion')
              : t('fruehereDokumentversion'),
          );
          divider.text(attachment.name);
          divider.gap(12);
          divider.text(
            t('valueUnveraenderteOriginalseitenFolgen', {
              p0: original.getPageCount(),
            }),
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
      throw new LocalizedError(
        'dasProtokollUeberschreitet50MbBitteKleinereEinzelprotokolleErstellen',
      );
    return result;
  }
}
