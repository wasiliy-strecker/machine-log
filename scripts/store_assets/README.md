# MaschinenLog Store-Bilder

App-lokale Werkzeuge für zehn deutsche Play-Console-Bilder aus der vorhandenen
Store-AAB 1.0.0 (3). Gestaltung nach den vorhandenen Log-Apps, mit MaschinenLogs
Icon, Roboto und türkiser Farbwelt. Keine Änderungen an App-Code oder Release.

## Voraussetzungen und Quelle

Android SDK mit API-35-Google-APIs-x86_64, KVM, Java, Bundletool 1.18.3,
Python mit Pillow, Node 22 oder neuer, Chrome und ImageMagick.
Die Standardpfade stehen im Emulator-Helfer. `ML_ANDROID_SDK`, `ML_ADB`,
`ML_EMULATOR_PORT` und `BUNDLETOOL_JAR` erlauben abweichende lokale Pfade.

Alle Befehle aus dem Projektverzeichnis ausführen. Ausgabe ist
`build/store-assets/de-DE/build-3/`. Der gesamte Ausgabeordner ist ignoriert.
Die vorhandene AAB unter `build/releases/production/` bleibt unverändert.
Der Helfer prüft ihren SHA-256 und extrahiert eine universelle APK. Bundletool
signiert diese lokale Emulator-APK mit dem lokalen Debug-Schlüssel. Die App
bleibt ein nicht debuggbarer Store-Release mit eingebettetem JavaScript.

## Isolierte Emulatoren

Jeder Aufruf erzeugt ein eigenes leeres AVD unter `/dev/shm`. Bereits belegte
Seriennummern werden abgelehnt. Das Terminal bleibt bis zum Beenden des
jeweiligen Emulators offen. Die Helfer akzeptieren nur Emulator-Seriennummern
und prüfen zusätzlich den Namenspräfix `ml_store_assets_`.

```bash
bash scripts/store_assets/prepare_emulator.sh phone build/store-assets/de-DE/build-3
ML_EMULATOR_PORT=5582 bash scripts/store_assets/prepare_emulator.sh tablet7 build/store-assets/de-DE/build-3
ML_EMULATOR_PORT=5584 bash scripts/store_assets/prepare_emulator.sh tablet10 build/store-assets/de-DE/build-3
```

| Profil         | Pixel       | Dichte  | Logische Breite |
| -------------- | ----------- | ------- | --------------- |
| Smartphone     | 1080 × 1920 | 360 dpi | 480 dp          |
| 7-Zoll-Tablet  | 1080 × 1920 | 240 dpi | 720 dp          |
| 10-Zoll-Tablet | 1440 × 2560 | 240 dpi | 960 dp          |

Tablet-Profile basieren auf Nexus 7 und Nexus 10 mit angepasstem 9:16-Display.
Keine Tablet-Aufnahme wird aus einem Smartphone-Screenshot abgeleitet.
Die App läuft im hellen Design mit normaler Schriftgröße.
`device.py SERIAL status` stellt Androids Demostatusleiste auf 09:41 Uhr.

## Beispieldaten und Aufnahmeablauf

Die Daten werden ausschließlich über die echte App eingegeben. `Capture` in
`capture.py` bietet dafür kleine UI-Helfer, keinen App-Demomodus und keinen
direkten Datenbankzugriff.

| Zähler       | Art und Symbol         | Nummer und Bereich | Ablesungen                          |
| ------------ | ---------------------- | ------------------ | ----------------------------------- |
| Fertigung 1  | Stückzahl, Fertigung   | F-001, Halle 1     | 11840, 12040, 12260 und 12480 Stück |
| Verpackung 2 | Menge, Verpackung      | V-002, Halle 2     | 1248 Pakete                         |
| Kompressor   | Betriebsstunden, Pumpe | K-003, Technikraum | 1856,5 h                            |

Für Fertigung die vier Tage 13. bis 16. Oktober 2026, jeweils 08:00 Uhr,
verwenden. Notiz ist „Schichtende“. Die ersten drei Stände manuell eingeben.
Das bestehende künstliche Foto `assets/photo-examples/01_fertigung_012480_stueck.jpg`
nach `/sdcard/Pictures/Fertigung.jpg` kopieren, den Android-Medienscanner anstoßen
und über „Foto aus Galerie“ wählen. Die tatsächliche lokale OCR erkennt 12480.
Den Vorschlag übernehmen und Datum sowie Notiz setzen. Vor dem Speichern
die Ansicht auf die OCR-Karte und die Prüffelder scrollen und aufnehmen.
Das Foto und die Vorschläge stehen in der unveränderten App untereinander.

Nach dem Speichern den Verlauf zur Überschrift „Zählerverlauf“ scrollen.
Ein kompaktes Zählerverlaufsprotokoll ohne Anhänge erstellen und die fertige
native PDF-Vorschau aufnehmen. Die beiden weiteren Zähler mit je einer
manuellen Ablesung anlegen. Für die Übersicht nach Namen sortieren.

Die vier Smartphone-Rohbilder heißen unter `raw/phone/`:

```text
01-uebersicht.png
02-foto-ocr.png
03-verlauf.png
04-pdf.png
```

In Einstellungen ein verschlüsseltes Backup über den normalen Android-Dialog
speichern. Das Passwort für diese ausschließlich fiktiven Daten lautet
`Demo2026`. Die Datei unter `raw/demo/Demo.mlbackup` sichern und in beiden
Tablet-Emulatoren über „Backup wiederherstellen“ importieren. Übersicht sowie
das gespeicherte PDF direkt auf jedem Tablet aufnehmen. Die Originale bleiben
unter `raw/tablet7/` und `raw/tablet10/`, identische Upload-Kopien unter
`tablet7/` und `tablet10/`. Namen sind jeweils `01-uebersicht.png` und `02-pdf.png`.
`Capture.capture` speichert zusätzlich die tatsächliche AVD-Geometrie als JSON.

## Gestaltung und Prüfung

```bash
node scripts/store_assets/render.mjs assets build/store-assets/de-DE/build-3
node scripts/store_assets/render.mjs contact build/store-assets/de-DE/build-3
python3 scripts/store_assets/package.py build/store-assets/de-DE/build-3
python3 -m py_compile scripts/store_assets/device.py scripts/store_assets/capture.py scripts/store_assets/package.py
bash -n scripts/store_assets/prepare_emulator.sh
node --check scripts/store_assets/render.mjs
npx prettier --check scripts/store_assets/render.mjs scripts/store_assets/README.md
```

Smartphone-Bilder sind 1080 × 1920 mit 330 Pixeln Überschriftenbereich und
1550 Pixeln für den proportional skalierten vollständigen Screenshot.
Feature-Grafik und Icon verwenden vorhandene Markenressourcen. Die Oberfläche
wird weder nachgebaut noch retuschiert. Tablet-Bilder erhalten keine Werbetexte.

Der Paketierer kontrolliert die zehn Dateinamen, vollständige PNG-Dekodierung,
Maße, Farbmodus und Größenlimits. Er vergleicht App-Assets und native Bibliotheken
der Emulator-APK byteweise mit der AAB und prüft Paket, Version und fehlendes
Debug-Flag. Er erzeugt Upload-Zuordnung, deutsche Alt-Texte und Prüfsummen.
Jede finale Datei muss zusätzlich visuell auf Lesbarkeit und unerwünschte
Dialoge oder Hinweise geprüft werden. OCR, Verlauf, PDF und Backup-Import
werden im Aufnahmeablauf manuell geprüft. Eine allgemeine Regressionstestreihe
oder ein neuer App-Build ist für diese Werkzeug- und Bildänderung nicht erforderlich.

Anschließend ausschließlich die eigenen geprüften Emulatoren beenden und deren
vom Helfer ausgegebene temporäre Arbeitsverzeichnisse entfernen. Den Ausgabeordner
öffnen. `raw/`, `VORSCHAU.png`, `README.md` und `manifest.json` sind keine
Play-Upload-Bilder. Das Video-Feld bleibt leer. Kein automatischer Upload.

[Offizielle Google-Play-Vorgaben](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
