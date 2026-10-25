import { LocalizedError } from '../localization/runtime';
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_PDF_PAGES = 2000;
/** A supported file can exceed a limit without being corrupt. */
export class ContentLimitError extends LocalizedError {}
export function checkPdfPages(pages: number, report = false): void {
  if (pages > MAX_PDF_PAGES)
    throw new ContentLimitError(
      report
        ? 'dasProtokollUeberschreitet2000SeitenEinschliesslichDeckblaetternUndAnhaengenBitteKleinereEinzel'
        : 'diePdfUeberschreitetDieGrenzeVon2000Seiten',
    );
}
