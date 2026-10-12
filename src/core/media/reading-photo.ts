import type { Attachment } from '../domain/models';

// Legacy attachments remain readable. New captures replace the current photo.
export function replaceReadingPhoto(
  attachments: Attachment[],
  photo: Attachment,
  replaceId?: string,
): Attachment[] {
  if (photo.kind !== 'photo')
    throw new Error('Bitte ein Zählerfoto auswählen.');
  const previous = replaceId
    ? attachments.find((a) => a.kind === 'photo' && a.id === replaceId)
    : attachments.find((a) => a.kind === 'photo');
  if (replaceId && !previous)
    throw new Error('Das bisherige Foto wurde nicht gefunden.');
  return previous
    ? attachments.map((a) => (a.id === previous.id ? photo : a))
    : [...attachments, photo];
}
