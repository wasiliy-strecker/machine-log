import {
  counterSchema,
  eventStateSchema,
  revisionSchema,
  type EntryForm,
} from './models';
import type { CounterDetails } from './production-counter';
import { parseValue } from './reading-value';

export class FormValidationError extends Error {
  constructor(readonly fields: Record<string, string>) {
    super(Object.values(fields)[0] ?? 'Bitte die Angaben prüfen.');
  }
}

export function validateCounterForm(form: CounterDetails): void {
  const result = counterSchema.omit({ id: true }).safeParse(form);
  if (result.success) return;
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    fields[field] ??=
      field === 'reminder'
        ? 'Bitte die Angaben zur Erinnerung prüfen.'
        : issue.code === 'too_big'
          ? `Bitte höchstens ${issue.maximum} Zeichen eingeben.`
          : issue.message;
  }
  throw new FormValidationError(fields);
}

export function validateEntryForm(form: EntryForm): void {
  const fields: Record<string, string> = {};
  const value = (field: 'value' | 'closingValue') => {
    if (!form[field].trim()) {
      fields[field] = 'Bitte einen Zählerstand eingeben.';
      return;
    }
    try {
      parseValue(form[field]);
    } catch (error) {
      fields[field] = (error as Error).message;
    }
  };
  const unit = (field: 'unit' | 'closingUnit') => {
    if (!form[field].trim()) fields[field] = 'Bitte eine Einheit eingeben.';
    else if (
      !eventStateSchema.shape.measurement.shape.unit.safeParse(form[field])
        .success
    )
      fields[field] = 'Bitte höchstens 20 Zeichen für die Einheit eingeben.';
  };
  value('value');
  unit('unit');
  if (form.kind !== 'reading' && form.closingValue.trim()) {
    value('closingValue');
    unit('closingUnit');
  }
  if (!eventStateSchema.shape.occurredAt.safeParse(form.occurredAt).success)
    fields.occurredAt = 'Bitte einen gültigen Zeitpunkt auswählen.';
  else if (Date.parse(form.occurredAt) > Date.parse('2100-12-31T23:59:59.999Z'))
    fields.occurredAt = 'Zeitpunkte sind bis Ende 2100 möglich.';
  if (
    form.kind === 'replacement' &&
    !eventStateSchema.shape.newCounterNumber.safeParse(
      form.newCounterNumber.trim(),
    ).success
  )
    fields.newCounterNumber = 'Bitte höchstens 500 Zeichen eingeben.';
  if (!eventStateSchema.shape.note.safeParse(form.note.trim()).success)
    fields.note = 'Bitte höchstens 20.000 Zeichen für die Notiz eingeben.';
  if (Object.keys(fields).length) throw new FormValidationError(fields);
}

export function validateCorrectionReason(reason: string): void {
  if (!revisionSchema.shape.reason.safeParse(reason.trim()).success)
    throw new FormValidationError({
      reason: reason.trim()
        ? 'Bitte höchstens 500 Zeichen für den Änderungsgrund eingeben.'
        : 'Bitte einen Änderungsgrund angeben.',
    });
}
