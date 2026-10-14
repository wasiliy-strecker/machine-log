// Adapted from ZählerstandLog and Flutter MaschinenLog (MPL-2.0).
import { Body, Card } from '../../core/ui/components';

export function CaptureGuidance() {
  return (
    <Card>
      <Body strong style={{ fontSize: 16 }}>
        Für eine gute Erkennung
      </Body>
      <Body>
        • Anzeige möglichst gerade und vollständig aufnehmen{'\n'}• Spiegelungen
        und Schatten vermeiden{'\n'}• Maschinen-/Zählernummer nach Möglichkeit
        mitfotografieren
      </Body>
      <Body muted>
        Das Nachweisfoto wird für die lokale Speicherung auf maximal 1920 Pixel
        an der längsten Kante verkleinert und als JPEG optimiert. Aufnahme- und
        Standortmetadaten werden nicht übernommen. Der erkannte Wert muss vor
        dem Speichern bestätigt werden.
      </Body>
    </Card>
  );
}
