import { formatValue, parseValue } from '../../core/domain/reading-value';

/** Keep partial decimals editable and normalize valid pasted grouping exactly. */
export function readingInput(text: string, previous = ''): string | null {
  if (text.length <= 100 && /^\d*(?:[.,]\d*)?$/.test(text)) return text;
  try {
    return formatValue(parseValue(text));
  } catch {
    // Restored invalid drafts must remain repairable by deleting characters.
    if (text.length < previous.length) {
      let index = 0;
      for (const character of previous) if (character === text[index]) index++;
      if (index === text.length) return text;
    }
    return null;
  }
}
