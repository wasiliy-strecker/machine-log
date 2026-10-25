import { beforeEach } from 'vitest';
import { setLocalization } from '../src/core/localization/runtime';

beforeEach(() =>
  setLocalization({ language: 'de', formatLocale: 'de-DE', preference: null }),
);
