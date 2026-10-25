# MaschinenLog Store-Bilder

App-lokale Werkzeuge für sechs Sprachpakete der Store-Version 1.0.0 (6).
Jedes Paket enthält 16 Upload-Bilder. Gestaltung, Icon und Roboto bleiben an
der bestehenden MaschinenLog-App orientiert. Die Aufnahme erfolgt aus einer
explizit angegebenen AAB mit echtem JavaScript und nativen Funktionen.

## Voraussetzungen

Android SDK mit API-35-Google-APIs-x86_64, KVM, Java, Bundletool 1.18.3,
Python mit Pillow, Node 22 oder neuer, Chrome und ImageMagick.
`ML_ANDROID_SDK`, `ML_ADB`, `ML_EMULATOR_PORT` und `BUNDLETOOL_JAR` können die
lokalen Standardpfade überschreiben.

Alle Befehle werden aus dem Projektverzeichnis ausgeführt.
Ausgabe ist `releases/international/build-6/`. Dieser Ordner ist ignoriert.
Die signierte Upload-AAB bleibt unverändert. Bundletool erzeugt ausschließlich
für eigene Emulatoren eine lokal signierte APK. Diese bleibt eine nicht
debuggbare Store-App mit derselben Paketkennung und denselben Inhalten.

```bash
ML_FIXTURE_OUTPUT=releases/international/build-6/fixtures \
  npx vitest run --config scripts/store_assets/vitest.config.ts

bash scripts/store_assets/extract_apk.sh \
  build/releases/production/maschinenlog-1.0.0-build-6-production.aab \
  releases/international/build-6

python3 scripts/store_assets/run_capture.py de-DE phone \
  releases/international/build-6 \
  build/releases/production/maschinenlog-1.0.0-build-6-production.aab --port 5586
```

Den Capture-Aufruf für `de-DE`, `en-US`, `es-ES`, `fr-FR`, `it-IT`, `pt-BR`
und jeweils `phone`, `tablet7`, `tablet10` ausführen. Parallele Sitzungen brauchen
unterschiedliche gerade Emulator-Ports. Ein belegter Port wird abgelehnt.

## Isolierte Emulatoren und Daten

Jeder Aufruf erzeugt ein leeres `ml_store_assets`-AVD unter `/dev/shm`.
`Device` lehnt physische Geräte und fremde AVDs ab. Die tatsächliche Systemregion
wird vor der Installation gesetzt. Die App folgt ihrer Systemsprache.
Die eigene App erhält keine Netzwerkberechtigung. Neue Capture-AVDs laufen
zusätzlich im Flugmodus. Die synthetische Android-Statusleiste zeigt 09:41 Uhr.

| Profil         | Pixel       | Dichte  | Logische Breite |
| -------------- | ----------- | ------- | --------------- |
| Smartphone     | 1080 × 1920 | 300 dpi | 576 dp          |
| 7-Zoll-Tablet  | 1080 × 1920 | 240 dpi | 720 dp          |
| 10-Zoll-Tablet | 1440 × 2560 | 240 dpi | 960 dp          |

Tablet-Profile basieren auf Nexus 7 und Nexus 10 mit angepasstem 9:16-Display.
Tablet-Aufnahmen werden separat erstellt. Sie sind keine vergrößerten
Smartphone-Aufnahmen. Helles Design und normale Schriftgröße bleiben eingestellt.

`fixture.test.ts` erzeugt die Demo-Backups über die Produktionsservices.
Die drei Beispielzähler haben zehn Ablesungen, ein Foto und eine nachvollziehbare
Notizkorrektur. Namen und Notizen stammen aus `store/<Sprache>/copy.json`.
Das öffentliche Demo-Passwort ist `Demo2026`. Es werden keine vertraulichen Daten
verwendet. Der Import erfolgt durch die echte App und den Android-Dateidialog.

`capture_localized.py` verwendet normale App-Routen und UI-Aktionen. Das
vorhandene künstliche Foto wird über den Android-Fotodialog ausgewählt und von
der tatsächlichen OCR erkannt. Der zusätzliche OCR-Entwurf wird danach verworfen.
Jede PDF-Aufnahme folgt einer echten Protokollerstellung. Der deutsche
Smartphone-Ablauf prüft zusätzlich die dauerhafte englische Sprachwahl, einen
Kaltstart, weiterhin deutsche Zahlen und die Rückkehr zur Systemsprache.

Ein gelegentlicher System-UI-Startdialog eines neuen AVDs kann mit Warten
fortgesetzt werden. Ein Fehlerdialog der getesteten App wird nicht unterdrückt.
Bei fehlgeschlagenen Aufnahmen bleibt das eigene AVD zur Diagnose erhalten.
Erfolgreiche Sitzungen beenden und entfernen ihr temporäres AVD selbst.

## Gestaltung und Paketprüfung

```bash
node scripts/store_assets/render.mjs assets releases/international/build-6/de-DE de-DE
node scripts/store_assets/render.mjs contact releases/international/build-6/de-DE de-DE

# Nach dem Rendern aller sechs Sprachen.
python3 scripts/store_assets/package.py releases/international/build-6 \
  --aab build/releases/production/maschinenlog-1.0.0-build-6-production.aab \
  --apk releases/international/build-6/raw/store.apk

python3 -m py_compile scripts/store_assets/*.py
bash -n scripts/store_assets/prepare_emulator.sh scripts/store_assets/extract_apk.sh
node --check scripts/store_assets/render.mjs
```

Die sechs Smartphone-Motive zeigen Übersicht, OCR, Verlauf, Details, PDF und
Einstellungen. Die Tablets zeigen Übersicht, Verlauf, PDF und Einstellungen.
Alle drei Gruppen erhalten lokalisierte Überschriften außerhalb des proportional
skalierten, unveränderten App-Screenshots. Feature-Grafik und Icon verwenden
vorhandene Markenressourcen. Die App-Oberfläche wird nicht nachgebaut oder retuschiert.

Der Paketierer prüft 96 Upload-Dateien, PNG-Dekodierung, Pixelmaße, Farbmodus,
Größenlimits, Textlängen und Alt-Texte. Android-DEX-Code, App-Assets und native Bibliotheken der
Emulator-APK werden byteweise mit der AAB verglichen. Zu jeder Rohaufnahme wird
die Prüfsumme der tatsächlich installierten APK, Sprache, AVD und Geometrie
festgehalten. Die Paketierung weist Aufnahmen einer anderen APK zurück.
Alle Bildübersichten werden außerdem auf Lesbarkeit und unerwünschte Dialoge geprüft.

Sprach-ZIPs enthalten die 16 Bilder, Textfelder, Alt-Texte, Kontaktübersicht,
Upload-Hinweise und Herkunftsmanifest. Das Gesamt-ZIP enthält zusätzlich AAB,
Release-Titel, alle Play-Sprachtags und Prüfsummen. `raw/`, `fixtures/` und die
Kontaktübersichten sind keine Play-Uploads. Das Video-Feld bleibt leer.
Bereits vorhandene benannte ZIP-Lieferungen werden nicht überschrieben.
Das Gesamt-ZIP erhält zusätzlich eine eigene SHA-256-Datei.

[Internationale Store-Version](../../docs/INTERNATIONAL_RELEASE.md) und
[Google-Play-Grafikvorgaben](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).
