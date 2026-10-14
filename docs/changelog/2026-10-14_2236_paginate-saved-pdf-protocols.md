# Gespeicherte PDF-Protokolle benannt und seitenweise geladen

Den PDF-Bereich mit Flutter ZählerstandLog verglichen. Die Bereiche heißen jetzt
„Gespeicherte Zählerverlaufsprotokolle“ und „Gespeicherte Einzelprotokolle“.
Bezeichnungen von Einzelprotokollen, Erstellungsaktionen und Löschdialogen
entsprechend angepasst. Der Verlaufsbereich bleibt wie im Vorbild einklappbar.

Die vorhandene Aufteilung in Zehnerseiten auf echte SQLite-Seitenabfragen
umgestellt. Pro Seite werden höchstens zehn PDF-Metadaten geladen. Ab elf PDFs
erscheinen „Seite x von y“, „Zurück“ und „Weiter“. Die Filter trennen Maschine,
Zähler, Verlauf und einzelne Ablesung. Frühere gemeinsame Maschinenprotokolle
bleiben zugänglich. Sortierung ist stabil und berücksichtigt mehrteilige PDFs.
Die vollständige Protokollabfrage für andere Anwendungen bleibt erhalten.

Beim Blättern springt die Ansicht an den Beginn des betreffenden PDF-Bereichs.
Nach dem Löschen des letzten PDFs einer Seite wird die vorherige gültige Seite
angezeigt. Bereichswechsel beginnen auf Seite eins. Ladefehler sind wiederholbar.
Den Protokoll-Hook in `use-reports.ts` getrennt. README ergänzt. Keine Migration,
keine neue Abhängigkeit und keine Änderung am Inhalt gespeicherter PDF-Dateien.

`npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 52 Tests.
Fünf neue gezielte Fälle verwenden echte SQLite-Daten und den React-Bereich mit
seinem tatsächlichen Hook. Sie prüfen beide Protokollarten bei 10 und 11 PDFs,
Scope-Trennung einschließlich gemeinsamer Altprotokolle, Scrollen, Bereichswechsel,
Löschen auf der letzten Seite und Fehler mit Wiederholung. Keine Test-PDFs auf
dem Smartphone erzeugt und keine aufwendige visuelle Testreihe ausgeführt.

Dev-APK erfolgreich gebaut und mit übereinstimmender Signatur datenbewahrend
auf dem HONOR BVL-N49 installiert. Paket `com.appfactory.maschinenlog.dev`,
Version 1.0.0, Code 1, nicht debuggable, Installer vor und nach dem Update `null`.
Beide neuen Überschriften am Gerät bestätigt. Keine JavaScript- oder Android-
Absturzmeldung im kurzen Laufzeitcheck. Native Quellen unverändert.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-pdf-pagination-2026-10-14.apk`.
SHA-256: `a4552b78e638f1fb580e7ac4de0bfbc98e8b2d3c9b5c3d4a9665b879036b2883`.
Flutter-Vorlage nur gelesen. Kein Store-Build und kein Push.
