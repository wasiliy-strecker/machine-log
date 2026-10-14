import type { ImageSourcePropType } from 'react-native';

export type PhotoExample = {
  label: string;
  source(): ImageSourcePropType;
};

export const photoExamples: PhotoExample[] = [
  {
    label: 'Fertigung · Stück',
    source: () =>
      require('../../../assets/photo-examples/01_fertigung_012480_stueck.jpg'),
  },
  {
    label: 'Montage · Stück',
    source: () =>
      require('../../../assets/photo-examples/02_montage_003256_stueck.jpg'),
  },
  {
    label: 'Verpackung · Pakete',
    source: () =>
      require('../../../assets/photo-examples/03_verpackung_001248_pakete.jpg'),
  },
  {
    label: 'Abfüllung · Liter',
    source: () =>
      require('../../../assets/photo-examples/04_abfuellung_012345-6_liter.jpg'),
  },
  {
    label: 'Zuschnitt · Laufmeter',
    source: () =>
      require('../../../assets/photo-examples/05_zuschnitt_000872-35_laufmeter.jpg'),
  },
  {
    label: 'Druck · m²',
    source: () =>
      require('../../../assets/photo-examples/06_druck_004218-5_m2.jpg'),
  },
];
