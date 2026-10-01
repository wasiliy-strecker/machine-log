import { Stack } from 'expo-router';
import { Body, Card, Heading, Page } from '../core/ui/components';
export default function PrivacyScreen() {
  return (
    <Page>
      <Stack.Screen options={{ title: 'Datenschutz' }} />
      <Heading>MaschinenLog</Heading>
      <Card>
        <Body strong>Lokale Verarbeitung</Body>
        <Body>
          Maschinen, Zählerstände, Fotos, OCR-Ergebnisse und Korrekturen werden
          auf deinem Gerät verarbeitet und im privaten App-Speicher abgelegt. Es
          gibt kein Konto, keine Cloud-Synchronisation, keine Werbung und keine
          eigene Telemetrie.
        </Body>
      </Card>
      <Card>
        <Body strong>Fotos und Zahlenerkennung</Body>
        <Body>
          Die Kamera wird nur für von dir gestartete Aufnahmen verwendet.
          Galerieimporte erfolgen über die Android-Dateiauswahl. Fotos werden
          als JPEG ohne übernommene Aufnahme- und Standortmetadaten gespeichert.
          Die Zahlenerkennung verwendet ein mitgeliefertes Google-ML-Kit-Modell
          und benötigt keinen Modelldownload.
        </Body>
        <Body>
          Der optionale Google-Dokumentenscanner kann zunächst Komponenten über
          Google Play-Dienste laden. Die Bildverarbeitung erfolgt lokal.
          Google-Bibliotheken können technische Geräte-, Leistungs- und
          Nutzungsmetriken verarbeiten. Dokumenteninhalte werden durch
          MaschinenLog nicht an einen Server übertragen.
        </Body>
      </Card>
      <Card>
        <Body strong>Speichern und Teilen</Body>
        <Body>
          PDFs und passwortgeschützte Backups verlassen die private Ablage nur
          durch deine Speicher- oder Teilen-Aktion. Du bestimmst den Speicherort
          und Empfänger. Android-Systembackups sind deaktiviert. Backups
          enthalten gespeicherte Einträge und ihre Historien, aber keine
          ungespeicherten Formularentwürfe.
        </Body>
      </Card>
      <Card>
        <Body strong>Korrekturen und Löschen</Body>
        <Body>
          Korrekturen behalten ursprüngliche Angaben und frühere Anhänge. Beim
          ausdrücklichen Löschen eines Eintrags werden seine Korrekturen und
          Einzelprotokolle mit entfernt. Gespeicherte Gesamtprotokolle und
          extern exportierte Kopien bleiben erhalten. Eine Deinstallation
          entfernt die privaten App-Daten.
        </Body>
      </Card>
      <Card>
        <Body strong>Kontakt</Body>
        <Body>Wasiliy Strecker · AppFabrik AI</Body>
        <Body>Stand: 1. Oktober 2026</Body>
      </Card>
    </Page>
  );
}
