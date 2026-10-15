# Einheitliche dezente Konturen für Dialoge

Die letzten beiden Smartphone-Screenshots verglichen. Die feine Kontur der
Auswahlblätter gilt jetzt auch für zentrierte Bestätigungen und Menüs im
Feedback-Provider, beide Backup-Passwortdialoge sowie Datum und Uhrzeit.
Alle verwenden eine Linie mit Breite 1 in der vorhandenen Themefarbe `border`.
Auswahlblätter, Beispielfotos und Fortschrittsdialoge besitzen diese Kontur
bereits. Formen, Farben, Abstände und Bedienung ansonsten beibehalten.

`npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 59 Tests.
Den Löschdialog am Smartphone direkt gegen den Screenshot geprüft und über
„Abbrechen“ geschlossen. Keine Daten gelöscht oder geändert. Keine neuen
Tests für reine Rahmenfarben und keine aufwendige visuelle Testreihe.
Kurzer Laufzeitcheck ohne JavaScript- oder Android-Absturzmeldung.

Dev-APK mit eingebettetem JavaScript gebaut und nach Paket- und Signaturprüfung
datenbewahrend auf dem HONOR BVL-N49 installiert. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach dem Update `null`. Native Quellen unverändert.
Kein Store-Build. Push auf `main` im Anschluss ausdrücklich beauftragt.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-modal-borders-2026-10-15.apk`.
SHA-256: `583d4ff3a0f87ceb853ae7ebc01aa71928c45cc85c65e4ea21a20e5b34e261e3`.
