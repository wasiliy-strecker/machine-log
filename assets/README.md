# Lokale Ressourcen

`machine.svg` ist das einfache app-eigene Zahnrad-/Zähler-Icon. Die PNGs werden daraus mit
ImageMagick gerendert. PDF-Protokolle verwenden die Roboto-Schriften unter `ui/`. `DejaVuSans.ttf` bleibt als Ressource der Vorlage mit ihrer Lizenz erhalten.
Die mitgelieferte Lizenz steht in `FONT-LICENSE.txt`.

`synthetic-photo.jpg` enthält ausschließlich eine gezeichnete Hausform und einen
Testhinweis. Absichtlich vorhandene synthetische EXIF-Daten prüfen deren Entfernung.
`synthetic-document.pdf` hat zwei durchsuchbare Querformatseiten.
`protected.pdf` ist eine mit `synthetic-password` geschützte Kopie für Ablehnungstests.
Keine dieser Dateien enthält Kundendaten, private Adressen oder echte Dokumente.

`ui/` enthält app-lokale Roboto-Schriften und MaterialIcons aus dem Flutter-SDK
für die ausdrücklich gewünschte Übereinstimmung der Oberflächen. Die zugehörigen
Lizenzen sind beigefügt. Es gibt keine Laufzeitabhängigkeit zur Flutter-App.
