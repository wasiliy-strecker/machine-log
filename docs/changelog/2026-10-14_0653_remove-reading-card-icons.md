# Zahnrad aus den Ablesungskarten entfernt

Die zwei neuesten MaschinenLog-Screenshots vom Smartphone geprüft.
Das dekorative Kategorie-Zahnrad samt Kreis und reserviertem Platz aus der
Zählerübersicht und dem Kopf der Zählerdetails entfernt. Die Angaben nutzen
dadurch mehr Breite. Den Hinweis auf eine aktive Ableseerinnerung neben den
Zählernamen verschoben. Navigation und Erinnerungsaktionen bleiben verfügbar.

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 39 Tests.
Dev-APK erfolgreich gebaut und mit identischer Signatur datenbewahrend auf dem
HONOR BVL-N49 installiert. Paket `com.appfactory.maschinenlog.dev`, Version
1.0.0, Code 1, nicht debuggable, Installer vor und nach Update `null`.
Start angefordert. Keine JavaScript- oder Android-Absturzmeldung im kurzen
Laufzeitcheck. Das Display war gesperrt.

Kurze manuelle Prüfung nach dem Entsperren: Zählerübersicht öffnen und einen
Zähler antippen. In beiden Karten fehlt das Zahnrad ohne leeren Platzhalter.
Die Karte führt weiterhin zu den Details beziehungsweise zur Bearbeitung.
Keine zusätzliche automatisierte UI-Testreihe für diese reine Darstellungsänderung.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-reading-cards-2026-10-14.apk`.
SHA-256: `39af881a25f51d3c826eb00f8ed203e15e07668f35df2ef4bc815ca21008b7c5`.
Kein Store-Build und kein Push.
