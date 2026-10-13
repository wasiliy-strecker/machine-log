import { useRef, useState } from 'react';
import { errorText } from './components';
import { FormValidationError } from '../domain/form-validation';
export function useTask() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorAttempt, setErrorAttempt] = useState(0);
  function clearFieldErrors(...fields: string[]) {
    setFieldErrors((current) => {
      const next = { ...current };
      for (const field of fields) delete next[field];
      return next;
    });
  }
  async function run<T>(work: () => Promise<T>): Promise<T | undefined> {
    if (lock.current) return undefined;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    setFieldErrors({});
    try {
      return await work();
    } catch (e) {
      if (e instanceof FormValidationError) setFieldErrors(e.fields);
      else setError(errorText(e));
      setErrorAttempt((current) => current + 1);
      return undefined;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return {
    busy,
    error,
    notice,
    fieldErrors,
    errorAttempt,
    clearFieldErrors,
    setError,
    setNotice,
    run,
  };
}
