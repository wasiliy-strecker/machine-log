# Überschrift zu Zählerverlauf gekürzt

Die Überschrift „Produktionsprotokoll · Zählerverlauf“ in der PDF-Erstellungskarte
und bei gespeicherten Zählerprotokollen zu „Zählerverlauf“ gekürzt. Teilnummern
mehrteiliger Protokolle bleiben erhalten. Berechnungen und gespeicherte PDFs
bleiben unverändert.

Die Bedeutung von „Dokumentierter Zuwachs“ anhand der Implementierung erklärt:
Die Anzeige summiert die berechenbaren Zuwächse des Zählers pro Einheit ab der
ersten gespeicherten Ablesung. Fehlende Endstände oder Einheitenwechsel können
Berechnungslücken verursachen. Der erste Stand ist ein Ausgangswert.

Prüfung: `npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 47 Tests.
Beide geänderten JSX-Zweige manuell geprüft. Manueller Prüfschritt auf dem Gerät:
Zählerdetails öffnen und die Überschrift der Erstellungskarte sowie eines
gespeicherten Zählerprotokolls auf „Zählerverlauf“ prüfen.
Keine neue Testreihe und keine native Änderung.

Dev-APK mit eingebettetem JavaScript erfolgreich erstellt. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable.
Eigene bisherige Dev-Signatur bestätigt. Kein Android-Gerät per ADB verbunden,
deshalb keine Installation oder visuelle Geräteprüfung ausgeführt.
Installation nach dem Verbinden aus dem App-Verzeichnis:
`npm run install:preview -- A5CS024205005243 build/dev/maschinenlog-1.0.0-dev-counter-history-title-2026-10-14.apk`.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-counter-history-title-2026-10-14.apk`.
SHA-256: `3cf7db4c623a4ff44479da115b702af95600e919804e2455f8d38d7b3489e259`.
Kein Store-Build und kein Push.
