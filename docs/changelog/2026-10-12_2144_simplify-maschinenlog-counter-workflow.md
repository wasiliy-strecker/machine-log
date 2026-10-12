# MaschinenLog auf den ZählerstandLog-Ablauf vereinfacht

Auf Nutzerauftrag einen Produktionszähler je Listeneintrag und ein schlankes
Stammdatenformular umgesetzt. Zählerart, Bezeichnung, Maschinen-/Zählernummer,
Produktionsbereich, Einheit und Erinnerung bleiben bearbeitbar.
Neue Datensätze besitzen genau einen Zähler. Die bisherige Mehrzähler-Anforderung
wurde durch die bestätigte Vereinfachung ersetzt.

## Altbestände und Daten

Die Übersicht liest jeden bestehenden Zähler separat aus SQLite. Navigation,
aktuelle Ablesung, Historie, Erinnerungsstatus und Protokolle verwenden seine
bestehende ID. Bearbeiten und Löschen betreffen nur den gewählten Zähler.
Altbestände behalten ihre zusätzlichen Maschinendaten, unveränderten
Ablesungen und Korrekturen. Ein optionaler Produktionsbereich am Zähler erlaubt
Änderungen ohne Eingriff in den gemeinsamen Maschinenbereich.

SQLite-Schema und Backupkennung unverändert. Bestehende Mehrfachzähler-Backups
werden weiterhin gelesen. Frühere gemeinsame Maschinenprotokolle bleiben als
Altprotokolle zugänglich. Alte PDF-Anhänge und Mehrfachfotos bleiben lesbar.
Keine Datenbereinigung oder automatische Neuzuordnung der Historien.

## Erfassung und Dokumentation

Kamera, Galerie mit Einzelfotoauswahl oder manuelle Eingabe wie in ZählerstandLog.
Neue Fotos ersetzen das aktuelle Foto. Korrekturen behalten dessen frühere Version.
Wiederherstellung einer unterbrochenen Fotoaufnahme verwendet dieselbe Regel.
PDF-Import und Dokumentenscan samt nativer ScanActivity und Scanner-Abhängigkeit
entfernt. Produktionsprotokolle bleiben als PDF-Ausgabe verfügbar.

README und deutsche sowie englische Datenschutzseite auf diesen Funktionsumfang
angepasst. Gliederung und GitHub-README-Verlinkung bleiben wie bei ZählerstandLog.

## Prüfung und Smartphone

`npm run check` erfolgreich. Formatierung, ESLint, TypeScript und 26 Tests bestanden.
Gezielte zusätzliche Fälle prüfen Einzähler-Neuanlage, getrennte Altbestände,
isolierte Bearbeitung und Löschung, passende Protokolle, Fotoersatz und erhaltene
Originale sowie verschlüsselte Backup-Wiederherstellung. Browser- und Galerieprüfungen
bleiben Teil der kurzen Suite. Keine aufwendige visuelle Testreihe.

`npm run check:native` erfolgreich. 39 JVM-Tests ohne Fehler und Android-Lint bestanden.
Die zwei entfernten Tests betrafen ausschließlich den entfernten Scanner.
`assembleDevRelease` erfolgreich. Manifest ohne ScanActivity sowie eingebettetes
JavaScript und OCR-Modell geprüft.

Dev-Version 1.0.0 mit Code 1 für `com.appfactory.maschinenlog.dev` auf dem verbundenen
HONOR BVL-N49 mit Android 16 datenbewahrend installiert. Zuvor den Eingabezustand
geprüft und die Korrekturmaske über die Rücknavigation verlassen. Die Signatur stimmt mit der
vorhandenen Installation überein. Installationshelfer verwendet ausschließlich
`adb install -r -t -g --no-streaming`. App per Launcher gestartet, Prozess läuft.
Der Bildschirm war danach gesperrt. Sichtbare UI und echte Kamera-/OCR bleiben
zur kurzen Nutzerabnahme offen. Kein Store-Build.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-counter-flow-2026-10-12-final.apk`.
SHA-256: `226446157d691eebf0f3fb02c1eab45ea7870cf7acbe038f1f7da37bef788e8a`.
