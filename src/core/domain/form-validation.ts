import { t } from '../localization/runtime';
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
    super(Object.values(fields)[0] ?? t('bitteDieAngabenPruefen'));
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
        ? t('bitteDieAngabenZurErinnerungPruefen')
        : issue.code === 'too_big'
          ? t('bitteHoechstensValueZeichenEingeben', { p0: issue.maximum })
          : issue.message;
  }
  throw new FormValidationError(fields);
}
export function validateEntryForm(form: EntryForm): void {
  const fields: Record<string, string> = {};
  const value = (field: 'value' | 'closingValue') => {
    if (!form[field].trim()) {
      fields[field] = t('bitteEinenZaehlerstandEingeben');
      return;
    }
    try {
      parseValue(form[field]);
    } catch (error) {
      fields[field] = (error as Error).message;
    }
  };
  const unit = (field: 'unit' | 'closingUnit') => {
    if (!form[field].trim()) fields[field] = t('pleaseEnterAUnit');
    else if (
      !eventStateSchema.shape.measurement.shape.unit.safeParse(form[field])
        .success
    )
      fields[field] = t('bitteHoechstens20ZeichenFuerDieEinheitEingeben');
  };
  value('value');
  unit('unit');
  if (form.kind !== 'reading' && form.closingValue.trim()) {
    value('closingValue');
    unit('closingUnit');
  }
  if (!eventStateSchema.shape.occurredAt.safeParse(form.occurredAt).success)
    fields.occurredAt = t('bitteEinenGueltigenZeitpunktAuswaehlen');
  else if (Date.parse(form.occurredAt) > Date.parse('2100-12-31T23:59:59.999Z'))
    fields.occurredAt = t('zeitpunkteSindBisEnde2100Moeglich');
  if (
    form.kind === 'replacement' &&
    !eventStateSchema.shape.newCounterNumber.safeParse(
      form.newCounterNumber.trim(),
    ).success
  )
    fields.newCounterNumber = t('bitteHoechstens500ZeichenEingeben');
  if (!eventStateSchema.shape.note.safeParse(form.note.trim()).success)
    fields.note = t('bitteHoechstens20000ZeichenFuerDieNotizEingeben');
  if (Object.keys(fields).length) throw new FormValidationError(fields);
}
export function validateCorrectionReason(reason: string): void {
  if (!revisionSchema.shape.reason.safeParse(reason.trim()).success)
    throw new FormValidationError({
      reason: t('bitteHoechstens500ZeichenFuerDenAnderungsgrundEingeben'),
    });
}
