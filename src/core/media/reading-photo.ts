import { LocalizedError } from '../localization/runtime';
import type { Attachment } from '../domain/models';
// Legacy attachments remain readable. New captures replace the current photo.
export function replaceReadingPhoto(
  attachments: Attachment[],
  photo: Attachment,
  replaceId?: string,
): Attachment[] {
  if (photo.kind !== 'photo')
    throw new LocalizedError('bitteEinZaehlerfotoAuswaehlen');
  const previous = replaceId
    ? attachments.find((a) => a.kind === 'photo' && a.id === replaceId)
    : attachments.find((a) => a.kind === 'photo');
  if (replaceId && !previous)
    throw new LocalizedError('dasBisherigeFotoWurdeNichtGefunden');
  return previous
    ? attachments.map((a) => (a.id === previous.id ? photo : a))
    : [...attachments, photo];
}
