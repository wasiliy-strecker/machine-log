# MaschinenLog

Eigenständige Android-App mit React Native, TypeScript strict, Expo und SQLite.
MaschinenLog dokumentiert Produktionszähler mit lokaler Zahlen-OCR, bestätigten
Ablesungen, nachvollziehbaren Korrekturen und Produktionsprotokollen als PDF.

## Funktionen

Maschinen besitzen einen oder mehrere Zähler für Stückzahlen, Zyklen,
Betriebsstunden oder Mengen. Zähler haben eigene Einheiten und optionale lokale
Erinnerungen. Betriebsstunden werden dezimal erfasst. Maschinendaten, Kategorien,
Standorte und Zählerbezeichnungen sind frei bearbeitbar.

Kamera, Galerie, Dokumentenscan, PDF-Anhänge, Fotoansicht mit Zoom und Sortierung
folgen Hausakte. Zahlen werden mit dem gebündelten lateinischen ML-Kit-Modell lokal
erkannt. Mehrere Vorschläge lassen sich auswählen oder überschreiben. Erst
„Bestätigen und speichern“ legt die Ablesung an. Bei OCR-Fehlern bleibt die manuelle
Eingabe mit Foto möglich. Fotos werden auf höchstens 1920 Pixel optimiert und als
JPEG ohne übernommene Aufnahme- und Standortmetadaten gespeichert.

Zahlen bleiben als Ziffernfolge und Dezimalskala erhalten. Berechnungen verwenden
BigInt. Nachträge werden nach ihrem Ablesezeitpunkt einsortiert. Pro Zähler ist ein
Ereignis je Zeitpunkt möglich. Die erste Ablesung ist ein Ausgangsstand.

Rücksetzungen und Zählerwechsel enthalten den alten Endstand und den neuen
Startstand. Beispiel: 100 → Endstand 120 → Startstand 0 → 15 ergibt 35 Stück.
Ein unbekannter Endstand bleibt als Berechnungslücke sichtbar. Unterschiedliche
Einheiten werden nicht verrechnet. Rückläufige Stände müssen durch einen passenden
Wechsel oder eine Korrektur aufgelöst werden. Es gibt keine automatische Erkennung
von Rücksetzungen oder Überläufen, keine Einheitenumrechnung und keine Schichtanalyse.

Korrekturen benötigen einen Grund. Originalwerte, Zeitpunkte, OCR-Quelle und
frühere Anhänge bleiben in einer unveränderlichen Korrekturkette erhalten.
Einträge können bewusst gelöscht werden, sofern dadurch keine widersprüchliche
Zählerfolge entsteht. Ein Zähler mit Einträgen, Entwürfen oder eigenen Protokollen
kann nicht aus der Maschine entfernt werden. Das Löschen der gesamten Maschine
entfernt ihre lokalen Einträge, Entwürfe und Protokolle.

Einzel-, Zähler- und Maschinenprotokolle enthalten Werte, Zuwächse, Übergänge,
Berechnungslücken und Korrekturen. Fotos und Original-PDF-Seiten sind optional.
Maschinenprotokolle gruppieren nach Zähler. Bereits erzeugte PDFs bleiben nach
Korrekturen unverändert. Protokolle dienen der Dokumentation und sind keine
amtliche Bestätigung. Zeitangaben stammen vom Gerät.

Passwortgeschützte `.mlbackup`-Sicherungen verwenden AES-256-GCM und PBKDF2-SHA256
mit 600000 Runden. Sie enthalten gespeicherte Einträge, Korrekturen, Fotos und PDFs,
aber keine Formularentwürfe. Wiederherstellung erhält neuere lokale Korrekturen.
Getrennt weiterentwickelte Korrekturketten werden vor der Datenübernahme abgewiesen.
Die eigene Formatkennung verhindert die Übernahme fremder App-Backups.
Backups sind auf 128 MiB begrenzt, einzelne Dateien auf 50 MiB.

## Unabhängige App

| Variante | Paketkennung                      | Verwendung                                           |
| -------- | --------------------------------- | ---------------------------------------------------- |
| Dev      | `com.appfactory.maschinenlog.dev` | Entwicklung und eigenständige Smartphone-Testversion |
| Store    | `com.appfactory.maschinenlog`     | Vorbereitete, unsignierte Release-Identität          |

Die vorhandene Flutter-App unter `production_counter_log` und Hausakte bleiben
unverändert. Es gibt keine gemeinsame Runtime-Bibliothek, keine Datenmigration,
kein Konto, keine Cloud und keine eigene Telemetrie. Android-Systembackups sind
deaktiviert. Details stehen in [PRIVACY.md](PRIVACY.md) und direkt in der App.

## Entwicklung

Voraussetzungen sind Node 22.13 oder neuer, npm, JDK 21, Android SDK 36,
Build Tools 36.0.0, NDK 28.2.13676358 und CMake. PDF-Inhaltstests verwenden
`pdftotext` aus Poppler. Die Abhängigkeiten und deren Lockfile stammen aus Hausakte.

```bash
npm ci
npm run check
npm run check:native
npm run build:preview
npm run install:preview -- DEVICE
```

`DEVICE` durch die Ausgabe von `adb devices -l` ersetzen. Der Installationshelfer
prüft Paket, Version, Debug-Eigenschaft, bisherigen Installer und bei vorhandener
Installation die Signatur. Er verwendet ausschließlich `adb install -r -t -g
--no-streaming`. Niemals deinstallieren oder Daten löschen, um einen Signaturkonflikt
zu umgehen.

Die normale Dev-Testversion enthält JavaScript und läuft ohne Metro. Sie liegt
unter `android/app/build/outputs/apk/dev/release/app-dev-release.apk`. Änderungen
an dieser installierten Version benötigen ein APK-Update. Der eigene lokale
Dev-Schlüssel liegt ignoriert unter `.local/maschinenlog-dev.keystore` außerhalb
des von Expo regenerierten Android-Verzeichnisses. Diese Datei behalten und privat
sichern. Sie wird nicht eingecheckt. Store-Debug ist deaktiviert. Ein Store-Build,
Store-Signierung oder Upload gehört nicht zu diesem Projektauftrag.

Für optionales Fast Refresh stehen `npm run build:dev`, `npm start` auf Port 8084
und `bash scripts/install-dev.sh DEVICE` zur Verfügung. Dev-Debug und Dev-Preview
verwenden dieselbe Paketkennung und Signatur. Ein Moduswechsel ersetzt die bisherige
Dev-Version datenbewahrend. Hausakte und deren Metro-Port 8083 bleiben unberührt.

## Architektur und Herkunft

Schlanke Expo-Routen liegen in `src/app`. Feature-Hooks steuern die Oberfläche,
`MachineService` koordiniert Geschäftsregeln. SQLite, Dateispeicher, Medien,
Erinnerungen, OCR und PDF-Vorschau sind über Ports angebunden. Das app-lokale
Expo-Modul `machine-native` übernimmt Android-Funktionen und ML-Kit-OCR.

Das neue SQLite-Schema 1 verwendet Fremdschlüssel, WAL und Transaktionen.
Maschinen speichern ihre typisierten Zähler gemeinsam. Ereignisse besitzen eine
indizierte Zählerzuordnung und einen eindeutigen Zeitpunkt. Originalzustand und
Korrekturkette werden atomar mit dem aktuellen Stand gespeichert. Dateibereinigung
berücksichtigt aktuelle Einträge, Revisionen und persistierte Entwürfe.

Basis ist Hausakte am Commit `dfd6fc8`. Zahlen- und OCR-Kandidatenlogik wurde aus
ZählerstandLog nach TypeScript übertragen, einschließlich der Erkennung getrennter
Rollenziffern anhand ihrer Positionen. Siehe [NOTICE.md](NOTICE.md).

## Prüfung und Geräteabnahme

Die kurze automatisierte Suite prüft exakte Zahlen, OCR-Kandidaten, mehrere Zähler,
Nachträge, Rücksetzungen, Wechsel, Korrekturen, SQLite-Neuöffnung und einen vollständigen
PDF-/Backup-Ablauf. Die Entschlüsselung wird unabhängig mit Node Crypto geprüft.
Übernommene Galerie- und Backup-Dialogtests sichern weiterhin ihre Kernabläufe ab.
Native JVM-Tests und Lint prüfen das eigene Android-Modul. Wie bei Hausakte werden
zwei bekannte, abstürzende Lint-Analysetasks der SDK-57-Abhängigkeiten ausgenommen.

Bei der Erstumsetzung war kein Android-Gerät verbunden. Deshalb sind echte
Kamera-/Galerie-OCR, Berechtigungsdialoge, Dokumentenscan, Reminder-Zustellung und
der sichtbare App-Start noch auf einem Gerät abzunehmen. Es wurden keine
aufwendigen visuellen Testreihen durchgeführt.

Kurzer manueller Ablauf nach Installation: Maschine mit Stück- und Stundenzähler
anlegen, einen Stand manuell und einen per Foto bestätigen, einen Nachtrag und
eine Rücksetzung erfassen, eine Ablesung mit Grund korrigieren, Produktions-PDF
öffnen und ein Backup speichern sowie wiederherstellen. Frühere Werte und Fotos
müssen in Historie und PDF erhalten bleiben.

Aktueller geprüfter Stand: `npm run check` mit 19 Tests, 41 native JVM-Tests und
Modul-Lint erfolgreich. Dev-APK `1.0.0` mit Code `1`, eigener Dev-Signatur,
gebündeltem OCR-Modell und eingebettetem JavaScript erstellt. Die benannte
Auslieferung liegt unter `build/dev/maschinenlog-1.0.0-dev.apk`.
