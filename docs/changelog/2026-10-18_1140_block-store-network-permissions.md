# MaschinenLog Store-Netzwerkberechtigungen entfernen

Store-Code 3 entfernt `INTERNET` und `ACCESS_NETWORK_STATE` durch einen eigenen
Flavor-Overlay. Das Expo-Plugin erhält ihn bei Prebuild. ML Kit und das gebündelte
lateinische OCR-Modell bleiben bestehen. Dev behält seine bisherigen Rechte.
Der Release-Helfer prüft die tatsächlich signierte AAB auf fehlende Netzwerkrechte
und vergleicht den Overlay mit seiner Vorlage.

Die neue benannte AAB `maschinenlog-1.0.0-build-3-production.aab` ist mit dem
bestehenden app-eigenen Upload-Schlüssel signiert. Bundletool, Jarsigner, Identität,
Version, JavaScript, OCR-Modell und alle 46 nativen 16-KB-Ausrichtungen geprüft.
Die frühere Auslieferung mit Code 2 bleibt unverändert erhalten und wird vom
erweiterten Prüfer wegen ihrer Internetberechtigung erwartungsgemäß abgelehnt.

Fünf gezielte Release-Regressionstests ergänzt. `npm run check` mit 98 Tests,
`npm run check:native` mit 51 JVM-Tests und Lint mit 0 Fehlern sowie 33 Warnungen,
Expo-Kompatibilität und Doctor 20/20 erfolgreich. Npm meldet unverändert 18 hohe
Einträge aus den zwei dokumentierten Build-Werkzeug-Ursachen und keine kritischen.

Eine direkt aus der AAB erzeugte, gleich signierte APK wurde ausschließlich in
einem temporären schreibgeschützten API-35-Emulator geprüft. Gleich signierte
Instrumentation rief die unveränderte native App-Funktion auf. `123456` erkannt,
leeres Bild ohne Treffer, beide Netzwerkrechte verweigert, 0 gesendete App-UID-
Bytes vor und nach dem kurzen Test. SDK-Transportplanung scheitert am fehlenden
Netzwerkstatusrecht. Kein Smartphone verbunden oder verändert. Emulator ohne
gespeicherten Snapshot beendet.

Die tatsächliche SDK-Abhängigkeit enthält weiterhin `TelemetryLoggingClient`-
Aufrufe. Die Messung am App-UID ist kein Nachweis einer vollständigen Abschaltung
aller Wege über Google Play-Dienste. Keine pauschale No-Freigabe im Play-Formular
behauptet und keine SDK-Manipulation vorgenommen. Deutsche und englische
Datenschutzseiten, README, Store-Anleitung und technischer Prüfstand unterscheiden
die Store-Netzwerksperre von den allgemeinen SDK-Datenangaben.

AAB SHA-256:
`18551c110e7fcf8b074e3fa8fc3c70f8d285049da7704721151beae797092397`.

Runtime-Nachweis:
`build/releases/production/maschinenlog-1.0.0-build-3-offline-ocr-check.json`.
