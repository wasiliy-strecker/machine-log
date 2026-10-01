# MaschinenLog als eigenständige React-Native-App

Hausakte am Stand `dfd6fc8` als unabhängige App nach `maschinenlog/` kopiert.
Hausakte selbst bleibt unverändert. Eigene Dev-/Store-Paketkennungen, SQLite-Daten,
Backupkennung, native Module, Petrol-Thema und Zahnrad-/Zähler-Icon eingerichtet.

Maschinen mit mehreren Produktionszählern, exakten Dezimalwerten, Nachträgen,
Rücksetzungen und Zählerwechseln implementiert. Übergänge erfassen End- und
Startstand, fehlende Endstände bleiben als Berechnungslücke sichtbar.
Korrekturen verlangen einen Grund und behalten Originale sowie frühere Anhänge.

Lokale ML-Kit-Zahlen-OCR im Expo-Modul ergänzt. Kandidatenextraktion folgt
ZählerstandLog einschließlich positionsabhängig getrennter Ziffern. Erkannte
Werte werden erst durch ausdrückliches Bestätigen gespeichert. PDF-Protokolle
und verschlüsselte Backups enthalten Korrekturen und frühere Fotoversionen.
Divergierende Korrekturketten werden bei Wiederherstellung ohne Teilübernahme
abgewiesen. Formulare, Dialoge, Galerie, Scanner, PDF-Vorschau und Erinnerungen
nutzen die übernommene Hausakte-Technik.

Der app-eigene Dev-Schlüssel liegt ignoriert außerhalb des von Expo neu erzeugten
Android-Verzeichnisses. Installationshelfer prüft Paket und Signatur und verwendet
`adb install -r -t -g --no-streaming`. Keine andere App oder Signatur übernommen.

## Prüfung

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 19 Tests.
`npm run check:native` erfolgreich mit 41 JVM-Tests und Lint des eigenen Moduls.
Die zwei bereits in Hausakte dokumentierten, abstürzenden Lint-Analysetasks von
Worklets und Expo Modules Core bleiben ausgenommen.

Der zusammenhängende SQLite-/PDF-/Backup-Test bestätigt Mehrzählertrennung,
Korrekturhistorie, alte Fotos, unveränderte gespeicherte PDFs und vollständige
Wiederherstellung. PDF-Inhalte wurden mit Poppler geprüft, AES-GCM zusätzlich
unabhängig über Node Crypto entschlüsselt.

Dev-Preview gebaut und abschließend mit `:app:assembleDevRelease` aktualisiert.
Paket `com.appfactory.maschinenlog.dev`, Label `MaschinenLog Dev`, Version `1.0.0`
mit Code `1`, nicht debuggable, eigene Dev-Signatur, eingebettetes JavaScript und
gebündeltes lateinisches OCR-Modell geprüft. Unterstützte Architekturen sind
arm64-v8a und x86_64. Benannte APK: `build/dev/maschinenlog-1.0.0-dev.apk`.
SHA-256: `697d717a2b013815d762aac5e084e0095e5fecb9c6399622ef1509ea8fde735a`.

Kein Android-Gerät verbunden. Deshalb keine Installation und keine Behauptung
einer echten Kamera-/OCR- oder Startabnahme. Kurze manuelle Prüfschritte stehen
in README. Keine aufwendigen visuellen Testreihen, kein Store-Build und kein Push.
