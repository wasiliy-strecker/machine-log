# MaschinenLog

Eigenständige Android-App mit React Native, TypeScript strict und Expo.
Die Root-Regeln gelten mit der ausdrücklich beauftragten React-Native-Ausnahme.
Hausakte und alle anderen Nachbarprojekte bleiben unverändert. Keine gemeinsamen Runtime-Pakete.

## Entwicklung

`npm ci`, `npm run check` und bei nativen Änderungen `npm run check:native`.
Schlanke Expo-Routen, View-Model-Hooks, Fachservices und austauschbare Ports.
Werte bleiben exakte Dezimalzahlen. Korrekturen behalten Originale, Gründe und frühere Anhänge.
Datenbanktransaktionen gehen der referenzgeprüften Dateibereinigung voraus.
Keine Server-KI und keine eigene Telemetrie.

Die normale Smartphone-Version ist `npm run build:preview` mit eingebettetem JavaScript.
Dev-Preview (`devRelease`) verwendet dieselbe Netzwerksperre wie Store.
Nur Dev-Debug behält die Netzwerkberechtigung für Metro.
`npm run install:preview -- DEVICE` prüft Paket und Signatur und installiert datenbewahrend.
Dev: `com.appfactory.maschinenlog.dev`, Name `MaschinenLog Dev`.
Store: `com.appfactory.maschinenlog`. Store-Debug ist deaktiviert.
Store darf weder `INTERNET` noch `ACCESS_NETWORK_STATE` anfordern.
Den Store-Manifest-Overlay im Expo-Plugin erhalten und mit `npm run check:store` prüfen.
`npm run build:store` baut und prüft die signierte AAB gemäß `docs/ANDROID_RELEASES.md`.
Private Upload-Schlüssel bleiben außerhalb von Git und des regenerierten Android-Ordners.
Kein Store-Build oder Push ohne ausdrücklichen Auftrag. Keine fremden Schlüssel kopieren.
Optionales Fast Refresh verwendet Dev-Debug und Metro auf Port 8084.
Ein Wechsel des installierten Dev-Modus wird ausdrücklich benannt.

`android/` ist versioniert. Generierte Konfiguration auch in `plugins/with-machine-android.js` pflegen.
Gezielte Tests für Berechnung, OCR, Revisionen, SQLite, PDFs und Backups genügen.
Keine aufwendigen visuellen Testreihen. Tatsächliche Gerätegrenzen in README dokumentieren.
Changelog unter Workspace `CODEX/changelog/` mit Kopie unter `docs/changelog/`.
Nach erfolgreichen Prüfungen nur dieses Projekt lokal committen. Nur auf ausdrücklichen Auftrag pushen.
