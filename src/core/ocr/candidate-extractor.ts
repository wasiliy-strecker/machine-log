// Adapted from ZählerstandLog's MeterReadingCandidateExtractor (MPL-2.0).
import {
  canonicalValue,
  parseValue,
  type ReadingValue,
} from '../domain/reading-value';

export type OcrElement = {
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export type OcrLine = {
  text: string;
  confidence: number | null;
  height: number;
  elements: OcrElement[];
};
export type OcrText = { rawText: string; lines: OcrLine[] };
export type OcrCandidate = {
  rawText: string;
  value: ReadingValue;
  score: number;
};
export interface OcrPort {
  recognize(uri: string): Promise<OcrText>;
}
const spaces = /[ \t\u00a0\u2007\u2009\u202f]+/g;
const numberPattern = /\d(?:[\d \t\u00a0\u2007\u2009\u202f.,'’]*\d)?/g;
function parseOcr(raw: string, joined: boolean): ReadingValue | null {
  try {
    return parseValue(raw);
  } catch {
    /* OCR-only normalization below. */
  }
  if (!joined) {
    for (const [index, group] of raw.split(/[.,'’]/).entries()) {
      const parts = group.trim().split(spaces);
      if (parts.length <= 1) continue;
      if (parts.every((p) => /^\d$/.test(p))) continue;
      try {
        if (index === 0 && parseValue(group).scale === 0) continue;
      } catch {
        /* Ambiguous grouping. */
      }
      return null;
    }
  }
  try {
    return parseValue(raw.replace(spaces, ''));
  } catch {
    return null;
  }
}
function valid(e: OcrElement) {
  return (
    [e.left, e.top, e.right, e.bottom].every(Number.isFinite) &&
    e.right > e.left &&
    e.bottom > e.top
  );
}
function adjacent(a: OcrElement, b: OcrElement) {
  const small = Math.min(a.bottom - a.top, b.bottom - b.top);
  const large = Math.max(a.bottom - a.top, b.bottom - b.top);
  const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return (
    small >= large * 0.7 &&
    overlap >= small * 0.75 &&
    b.left >= a.right &&
    b.left - a.right <= small * 0.6
  );
}
function joinedGroups(elements: OcrElement[]): string[] {
  const groups: string[] = [];
  let run: OcrElement[] = [];
  const numeric = /^\d(?:[\d \t\u00a0\u2007\u2009\u202f.,'’]*\d)?$/;
  const flush = () => {
    if (run.length > 1) groups.push(run.map((p) => p.text.trim()).join(' '));
    run = [];
  };
  for (const e of elements) {
    const usable = numeric.test(e.text.trim()) && valid(e);
    if (!usable || (run.length && !adjacent(run.at(-1)!, e))) flush();
    if (usable) run.push(e);
  }
  flush();
  return groups;
}
export function extractCandidates(lines: OcrLine[]): OcrCandidate[] {
  const result = new Map<string, OcrCandidate>();
  const maxHeight = Math.max(1, ...lines.map((l) => l.height));
  for (const line of lines) {
    const raws = new Map<string, boolean>();
    for (const match of line.text.matchAll(numberPattern))
      raws.set(match[0].trim(), false);
    for (const raw of joinedGroups(line.elements)) raws.set(raw, true);
    for (const [rawText, joined] of raws) {
      const value = parseOcr(rawText, joined);
      if (!value) continue;
      const digits = rawText.replace(/\D/g, '').length;
      const score =
        Math.max(0, Math.min(1, line.confidence ?? 0.75)) * 0.35 +
        (digits / rawText.replace(spaces, '').length) * 0.25 +
        Math.min(1, digits / 8) * 0.2 +
        Math.max(0, Math.min(1, line.height / maxHeight)) * 0.2;
      const key = canonicalValue(value);
      if (!result.has(key) || score > result.get(key)!.score)
        result.set(key, { rawText, value, score });
    }
  }
  return [...result.values()].sort((a, b) => b.score - a.score).slice(0, 8);
}
