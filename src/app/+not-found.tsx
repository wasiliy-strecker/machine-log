import { t } from '../core/localization/runtime';
import { useLocalization } from '../core/localization/react';
import { router } from 'expo-router';
import { Body, Button, Page } from '../core/ui/components';
export default function NotFoundScreen() {
  useLocalization();
  return (
    <Page>
      <Body>{t('dieseSeiteWurdeNichtGefunden')}</Body>
      <Button
        title={t('zurMaschinenuebersicht')}
        onPress={() => router.replace('/')}
      />
    </Page>
  );
}
