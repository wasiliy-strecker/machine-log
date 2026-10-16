# Technischen Prüfstand vor dem Store-Auftrag verbessern

Kompatible Expo-Pakete innerhalb SDK 57 aktualisiert. Expo steht auf 57.0.30.
Die transitiven Pakete shell-quote 1.12.0 und source-map-js 1.2.2 beheben zwei
Audit-Ursachen einschließlich der kritischen Meldung. npm audit und npm audit
--omit=dev melden noch 18 hohe Paketeinträge aus node-forge und braces. Für diese
beiden Ursachen gibt es am Prüftag keinen veröffentlichten Patch. Die tatsächlichen
CLI-/Metro-Pfade, Auslöser und Grenzen der Einordnung sind im neuen technischen
Prüfstand dokumentiert. Keine Audit-Unterdrückung und keine erzwungenen Downgrades.

Deutsche und englische Datenschutzerklärung um die technischen ML-Kit-Datenarten
und Googles Android-SDK-Datenangaben ergänzt. README-Verweise bleiben erhalten.
Beide Aktualisierungsdaten und PRIVACY.md angepasst. Die geänderten Webseiten
sind lokal versioniert und werden erst nach einem späteren Push veröffentlicht.

Prüfung: npm run check mit Prettier, ESLint, TypeScript und 90 Anwendungstests
erfolgreich. npm run check:native mit 51 JVM-Tests und eigenem Android-Lint
erfolgreich. Lint meldet 33 Warnungen und keine Fehler. Bestehende Ausnahmen für
zwei abstürzende Abhängigkeits-Analysetasks unverändert. Expo-Kompatibilitätscheck
und Expo Doctor 1.21.5 mit 20 von 20 Prüfungen erfolgreich. Die vorhandene
Ausnahme für den Config-Sync-Check ist im Prüfstand benannt. Datenschutz-HTML,
relative Links, README- und SDK-Links sowie Diff/Whitespace geprüft.

Dev-Release über Gradle ohne Prebuild erfolgreich gebaut. Seine neue Source Map
enthält keine Quellen aus den vier Paketen der ursprünglichen Audit-Ursachen.
Das ist ein auf dieses Dev-JavaScript-Bundle begrenzter Nachweis.
APK build/dev/maschinenlog-1.0.0-dev-sdk57-check-2026-10-16.apk datenbewahrend
installiert. Dev-Paket, Version 1.0.0 mit Code 1, nicht debuggable, Installer null
und bestehende Signatur vorab geprüft. Installierte APK-Prüfsumme stimmt überein.
APK-SHA-256: 404787b5f8686cf3a95b9eb438366edf12c11775060e8fe618a9ecc13bccf953.
App-Prozess gestartet und keine passenden Startfehler gemeldet.

Das Smartphone war gesperrt. Echte Kamera-/Galerie-OCR, Berechtigungsdialoge,
Erinnerungszustellung, PDF-Teilen sowie alte und neue Sicherung bleiben zur
kurzen Geräteabnahme offen. Das echte Backup-Passwort wird ausschließlich vom
Nutzer am Smartphone eingegeben. Diese Grenze ist in README und Prüfstand
festgehalten. Keine Deinstallation oder Datenlöschung. Kein Store-Build,
keine Store-Signierung, kein Upload und kein Push. Nur lokaler Commit.
