# Hintergrund der Datumsbeschriftung abgerundet

Den neuesten Smartphone-Screenshot geprüft. Die Beschriftung „Zeitpunkt der
Ablesung oder des Wechsels“ erhält einen eigenen abgerundeten Hintergrund in
der Kartenfarbe mit etwas mehr Innenabstand. Der separate View sorgt auch unter
Android für zuverlässige Rundungen. Die Breite bleibt innerhalb des Feldes.
Die Beschriftung blockiert keine Berührungen. Der vollständige Name bleibt für
die Bedienungshilfen am Datumsbutton erhalten.

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 40 Tests.
Keine zusätzlichen Tests für diese reine Darstellungsänderung. Kurze manuelle
Prüfung: Einen Ableseentwurf öffnen, zu „Datum und Uhrzeit“ scrollen und den
abgerundeten Beschriftungshintergrund prüfen. Datumsfeld oder Kalender antippen
und den Dialog ohne Änderung schließen.

Dev-APK erfolgreich gebaut und mit identischer Signatur datenbewahrend auf dem
HONOR BVL-N49 installiert. Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0,
Code 1, nicht debuggable, Installer vor und nach Update `null`. App gestartet.
Keine JavaScript- oder Android-Absturzmeldung im kurzen Laufzeitcheck.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-rounded-date-label-2026-10-14.apk`.
SHA-256: `4907770a0a57960b0d345696e131d454a6913e930b3e7b58c6d4065c7efe9fa5`.
Kein Store-Build und kein Push.
