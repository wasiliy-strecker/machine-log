# Internationale Store-Version

MaschinenLog 1.0.0 (6) erweitert die bestehende App um Deutsch, Englisch,
Spanisch, Französisch, Italienisch und Portugiesisch (Brasilien). Der Nutzer
bestätigte Versionscode 5 als höchsten bisherigen Play-Code. Code 6 ist für den
nächsten Upload reserviert. Upload und Veröffentlichung erfolgen nicht automatisch.

| Play-Sprache | App-Sprache | App-Name             |
| ------------ | ----------- | -------------------- |
| de-DE        | de          | MaschinenLog         |
| en-US        | en          | Machine Log          |
| es-ES        | es          | Registro de máquinas |
| fr-FR        | fr          | Journal des machines |
| it-IT        | it          | Registro macchine    |
| pt-BR        | pt          | Registro de máquinas |

## Verhalten

Die Einstellungen bieten eine dauerhafte App-Sprachwahl und die Systemsprache.
Bei Systemwahl wird die erste unterstützte Sprache aus der Android-Sprachliste
verwendet. Ohne unterstützte Sprache gilt Englisch. Portugiesisch verwendet die
brasilianische Übersetzung. Android 13 und neuer verwenden die native
App-Sprachverwaltung. Auf älteren Geräten bleibt die Auswahl lokal gespeichert.
Der Dev-Name erhält in jeder Sprache weiterhin den Zusatz Dev.

Zahlen und Datumsangaben richten sich unabhängig von der App-Sprache nach der
ersten Systemregion. Beispielsweise bedeutet `1,234` bei deutscher Region 1,234
und bei US-Region 1234. Gruppierungen werden regional geprüft. Große Werte
bleiben bei der Anzeige exakt, auch oberhalb der JavaScript-Ganzzahlgrenze.
Gespeicherte Zahlen, Entwürfe, ISO-Zeitpunkte, Einheiten und Typkennungen behalten
ihr bisheriges Format. Bekannte Vorgaben werden erst bei der Anzeige übersetzt.
Eigene Namen, Notizen und Einheiten bleiben erhalten.

Ein Sprachwechsel setzt die Services und Formulare nicht neu auf. Nur der
abgeleitete Suchindex wird neu erstellt. Ablesungen, ursprüngliche Angaben,
Korrekturen und Backup-Inhalte werden nicht umgeschrieben. Neue PDF-Protokolle
halten die beim Start gewählte Sprache und Region für alle Seiten fest.
Gespeicherte PDFs behalten ihre ursprünglichen Bytes. Android-Erinnerungen lesen
die Sprache auch im Hintergrund. Bestehende Benachrichtigungen können ihre Texte
aktualisieren, ohne den nächsten geplanten Alarm zu verschieben.

## Quellen und Generierung

`src/core/localization/messages/` enthält sechs gleich aufgebaute Kataloge.
`runtime.ts` stellt Übersetzung, Sprachauflösung und abonnierbare Sprache bereit.
Die Formatierung exakter Werte liegt in `numbers.ts`.
`scripts/generate_localizations.py` prüft Schlüssel und Platzhalter und erzeugt
die passenden Android-Texte, App-Namen und `locale_config.xml`.
Das Expo-Plugin führt diese Generierung auch beim Prebuild aus.

```bash
python3 scripts/generate_localizations.py
npm run check
npm run check:native
npm run check:store
npx expo install --check
npx expo-doctor
npm audit
npm audit --omit=dev
npm run build:store
```

`check` enthält die Prüfung auf veraltete generierte Sprachressourcen.
Die Tests prüfen Platzhalter an den Übersetzungsaufrufen, Sprachreihenfolge,
regionale Zahlen und Daten, Typkennungen, die Sprachwahl in den Einstellungen,
Suchindex und Backup sowie den tatsächlichen Text neu erzeugter PDFs.
Native Tests laufen unter Android 7 und Android 15 und prüfen Sprachpersistenz,
regionale Zahlen, Fallback und unveränderte Alarmplanung.

## Store-Texte und Assets

`store/<Play-Sprache>/copy.json` enthält Namen, kurze und vollständige
Beschreibung, Bildüberschriften, Release-Notizen und synthetische Beispieldaten.
Die Feldgrenzen sind 30, 80, 4000 beziehungsweise 500 Zeichen.
Die Datenschutzerklärung ist deutsch für de-DE und englisch für die anderen
Sprachen verlinkt. Es werden keine zusätzlich übersetzten Rechtstexte behauptet.

Die Auslieferung liegt unter `releases/international/build-6/` außerhalb
regenerierter Android-Verzeichnisse und wird nicht eingecheckt. Je Sprache sind
16 Upload-Bilder enthalten. Ein Icon mit 512 × 512 Pixeln, eine Feature-Grafik
mit 1024 × 500 Pixeln, sechs Smartphone-Bilder mit 1080 × 1920 Pixeln, vier
7-Zoll-Bilder mit 1080 × 1920 Pixeln und vier 10-Zoll-Bilder mit 1440 × 2560 Pixeln.
Alle Screenshots verwenden echte App-Aufnahmen. Beschriftungen liegen außerhalb
des unveränderten App-Inhalts. Das Zählerfoto ist ein vorhandenes künstliches
Beispielbild aus dem Projekt.

Die Demo-Sicherungen werden mit `MachineService` und `BackupService` erzeugt.
Es gibt keinen versteckten Demo-Modus und keine direkte Änderung der App-Datenbank.
Der Import erfolgt über die normale Wiederherstellung und den Android-Dateidialog.
OCR und PDF-Erstellung werden in der installierten Store-App ausgeführt.

```bash
ML_FIXTURE_OUTPUT=releases/international/build-6/fixtures \
  npx vitest run --config scripts/store_assets/vitest.config.ts

bash scripts/store_assets/extract_apk.sh \
  build/releases/production/maschinenlog-1.0.0-build-6-production.aab \
  releases/international/build-6

python3 scripts/store_assets/run_capture.py de-DE phone \
  releases/international/build-6 \
  build/releases/production/maschinenlog-1.0.0-build-6-production.aab --port 5586

node scripts/store_assets/render.mjs assets releases/international/build-6/de-DE de-DE
node scripts/store_assets/render.mjs contact releases/international/build-6/de-DE de-DE

# Nach allen sechs Sprachen und drei Geräteprofilen.
python3 scripts/store_assets/package.py releases/international/build-6 \
  --aab build/releases/production/maschinenlog-1.0.0-build-6-production.aab \
  --apk releases/international/build-6/raw/store.apk
```

Die Capture-Werkzeuge akzeptieren ausschließlich explizite Emulator-Seriennummern
und dedizierte `ml_store_assets`-AVDs. Das persönliche Testgerät und seine
Dev-Installation werden nicht angesprochen. Unterschiedliche Geräteprofile
werden separat gestartet. Fehlgeschlagene Capture-Sitzungen bleiben zur Diagnose
erhalten. Erfolgreiche temporäre AVDs werden entfernt.

Die Paketprüfung vergleicht JavaScript, Android-DEX-Code, Assets und native Bibliotheken der
Emulator-APK byteweise mit der AAB. Sie kontrolliert Paket, Version, fehlende
Debug-Flags, Anzahl, Pixelmaße, Farbmodus, Dateigrößen und Prüfsummen. Pro Sprache
entstehen ein ZIP, kopierbare Textdateien, Alt-Texte, Herkunftsmanifest und
Kontaktübersicht. Das Gesamt-ZIP enthält die AAB, sechs Sprach-ZIPs,
Release-Texte und Prüfsummen. Rohaufnahmen und Demo-Backups sind keine Uploads.

## Prüfstand des ausgelieferten Builds

Die vollständige App-Prüfung besteht Formatierung, 670 Meldungen je Sprache,
ESLint, TypeScript und 108 Tests in 15 Dateien. Die native Prüfung besteht
57 Tests und Android Lint des eigenen Moduls. Weitere fünf Tests prüfen die
Store-Manifestregeln. Expo Doctor besteht 20 Prüfungen. Die sechs synthetischen
Backups wurden durch einen zusätzlichen Fixture-Test erzeugt und dekodiert.

Die AAB hat Paketkennung `com.appfactory.maschinenlog`, Version `1.0.0 (6)`,
minSdk 24 und targetSdk 36. Sie ist nicht debuggbar und enthält keine
Netzwerkberechtigung. Alle 46 nativen Bibliotheken erfüllen die 16-KB-Ausrichtung.
Die Emulator-APK enthält 75 bytegleich geprüfte DEX-, Asset- und Bibliotheksdateien
der AAB. Ihr lokales Emulator-Zertifikat ist kein Upload-Zertifikat.

SHA-256 der signierten AAB:

```text
27ec145f785c33e38545f51b4ade0f1295d2d0b33a80d55eb40deeaf817a4cc9
```

Die Audit-Befehle enden wegen fünf bekannten hohen Paketeinträgen in
Buildwerkzeugen mit Status 1. Es gibt keine kritische Meldung. Details und
Abgrenzung zum App-Bundle stehen im [technischen Prüfstand](technical-release-readiness.md).
Die lokalen Nachweise liegen unter `releases/international/build-6/verification/`.

Alle 84 Rohaufnahmen wurden auf eigenen Emulatoren aus der finalen AAB erstellt.
Die sechs Kontaktübersichten mit insgesamt 96 Upload-Bildern wurden visuell geprüft.
OCR erkannte in jeder Sprache den Zählerstand 12480. Die PDF-Aufnahmen zeigen
in der App erzeugte Protokolle. Auf dem deutschen Emulator wurden zusätzlich
die englische Sprachwahl, ein Kaltstart, deutsche Dezimalwerte und die Rückkehr
zur Systemsprache geprüft. Alle temporären Capture-AVDs sind beendet.

## Quellen

[Android-App-Sprachen](https://developer.android.com/guide/topics/resources/app-languages),
[Play-Grafikvorgaben](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
und [Play-Textvorgaben](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en).
