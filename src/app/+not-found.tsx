import { router } from 'expo-router';
import { Body, Button, Page } from '../core/ui/components';

export default function NotFoundScreen() {
  return (
    <Page>
      <Body>Diese Seite wurde nicht gefunden.</Body>
      <Button
        title="Zur Maschinenübersicht"
        onPress={() => router.replace('/')}
      />
    </Page>
  );
}
