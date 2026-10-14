# Zusätzliche Summenkarte aus den Zählerdetails entfernt

Mit Flutter ZählerstandLog verglichen. Dort zeigt der Zählerverlauf Differenzen
zwischen einzelnen Ablesungen, aber keine zusätzliche Summenkarte. Die Karte
„Dokumentierter Zuwachs“ aus den MaschinenLog-Zählerdetails entfernt. Den nur
dafür verwendeten View-Model-Zustand und das Laden der vollständigen Timeline
entfernt. Die vorhandene seitenweise Historie und ihre Einzelvergleiche bleiben
erhalten. Produktionsberechnungen, PDFs und gespeicherte Daten nicht verändert.
Die zuletzt gekürzte Überschrift „Zählerverlauf“ bleibt bestehen.

Prüfung: `npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 47 Tests.
Diff und verbleibende Aufrufer manuell geprüft. Manueller Geräteprüfschritt:
Einen Zähler mit mindestens zwei Ablesungen derselben Einheit öffnen. Zwischen
Zähleraktionen und PDF-Karte erscheint keine Summenkarte. Im Verlauf wird die
Differenz zur vorherigen Ablesung weiter angezeigt. Auch Alle Ablesungen prüfen.
Keine neue Testreihe und keine native Änderung.

Dev-APK mit aktualisiertem eingebettetem JavaScript erfolgreich erstellt.
Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable.
Die eigene bisherige Dev-Signatur ist bestätigt. Kein Android-Gerät per ADB
verbunden, deshalb keine Installation oder visuelle Geräteprüfung ausgeführt.
Installation nach dem Verbinden aus dem App-Verzeichnis:
`npm run install:preview -- A5CS024205005243 build/dev/maschinenlog-1.0.0-dev-counter-details-2026-10-14.apk`.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-counter-details-2026-10-14.apk`.
SHA-256: `a9d7a2a11192fba5ea43471e41899f48104c6bc21f9e1be4ca9e945890b46c38`.
Vorlagen nur gelesen. Kein Store-Build und kein Push.
