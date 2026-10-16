import { allAttachments, type CounterEvent } from './models';

/** Reports include current photos and keep legacy PDF documents accessible. */
export function reportAttachments(entry: CounterEvent) {
  const files = new Map(
    allAttachments(entry)
      .filter((attachment) => attachment.kind === 'pdf')
      .map((attachment) => [attachment.file, attachment]),
  );
  for (const attachment of entry.attachments)
    files.set(attachment.file, attachment);
  return [...files.values()];
}
