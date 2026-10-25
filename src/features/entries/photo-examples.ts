import { t } from '../../core/localization/runtime';
import type { ImageSourcePropType } from 'react-native';
export type PhotoExample = {
  label: string;
  source(): ImageSourcePropType;
};
export const photoExamples: PhotoExample[] = [
  {
    get label() {
      return t('fertigungStueck');
    },
    source: () =>
      require('../../../assets/photo-examples/01_fertigung_012480_stueck.jpg'),
  },
  {
    get label() {
      return t('montageStueck');
    },
    source: () =>
      require('../../../assets/photo-examples/02_montage_003256_stueck.jpg'),
  },
  {
    get label() {
      return t('verpackungPakete');
    },
    source: () =>
      require('../../../assets/photo-examples/03_verpackung_001248_pakete.jpg'),
  },
  {
    get label() {
      return t('abfuellungLiter');
    },
    source: () =>
      require('../../../assets/photo-examples/04_abfuellung_012345-6_liter.jpg'),
  },
  {
    get label() {
      return t('zuschnittLaufmeter');
    },
    source: () =>
      require('../../../assets/photo-examples/05_zuschnitt_000872-35_laufmeter.jpg'),
  },
  {
    get label() {
      return t('druckM');
    },
    source: () =>
      require('../../../assets/photo-examples/06_druck_004218-5_m2.jpg'),
  },
];
