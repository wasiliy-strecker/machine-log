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

`photo-examples/` enthält sechs JPEG-Vorschauen der künstlichen Produktionsanzeigen
aus `production_counter_log/test/manual_fixtures/production_photos/`.
Die app-lokalen Kopien sind auf maximal 1024 Pixel an der längsten Kante reduziert,
metadatenfrei und jeweils kleiner als 150 KiB. Die Originale bleiben unverändert.
Die Galerie dient nur zur Ansicht und legt keine Fotos, OCR-Vorschläge oder
Ablesungen in der Datenbank an. Die Bilder enthalten keine echten Produktionsdaten.

Fertigung zeigt 012480 Stück, Montage 003256 Stück, Verpackung 001248 Pakete,
Abfüllung 012345,6 Liter, Zuschnitt 000872,35 Laufmeter und Druck 004218,5 m².
