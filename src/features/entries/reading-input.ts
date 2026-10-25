import { canonicalInput, displayInput } from '../../core/localization/numbers';

/** Partial input remains editable. Stored drafts retain their historic format. */
export function readingInput(text: string, previous = ''): string | null {
  const value = canonicalInput(text);
  if (value !== null) return value;
  const displayed = displayInput(previous);
  if (text.length < displayed.length) {
    let index = 0;
    for (const character of displayed) if (character === text[index]) index++;
    if (index === text.length) return text;
  }
  return null;
}
