# MaschinenLog Store-Release 1.0.0 (5) und GitHub-Übergabe

Auf erneuten Nutzerauftrag den Versionscode in Expo-Konfiguration und Android
von 4 auf 5 erhöht. Marketingversion und Funktionsstand bleiben bei 1.0.0 und
dem bereits abgenommenen Stand von Build 4. Release-Anleitung, README,
technischen Prüfstand und kopierbare deutsche Versionshinweise aktualisiert.
Die vorhandenen lokalen Commits bleiben Teil des beauftragten GitHub-Pushs.

`npm ci`, Prettier, ESLint, TypeScript, 98 Anwendungstests, 51 native JVM-Tests,
fünf Store-Regressionstests, Expo-Kompatibilität und alle 20 Doctor-Prüfungen
erfolgreich. Eigenes Android-Lint mit 0 Fehlern und 33 bekannten Warnungen.
Beide npm-Audits melden weiterhin 18 hohe Einträge aus den beiden bekannten
Build-Werkzeug-Ursachen `node-forge` und `braces`. Keine kritischen Einträge.
Registry-Abfrage bestätigt weiterhin 1.4.0 beziehungsweise 3.0.3 als neueste
Versionen. Audit-Exitcode 1 und die bestehende Bewertung bleiben dokumentiert.

`npm run build:store` hat die AAB gebaut, signiert und geprüft.
Paket `com.appfactory.maschinenlog`, Name MaschinenLog, Version 1.0.0, Code 5,
Target API 36, kein Debug-/Testflag und keine Netzwerkberechtigungen.
Eigenes Upload-Zertifikat, gebündeltes OCR-Modell, eingebettetes JavaScript,
Bundletool-Validierung und 16-KB-Ausrichtung aller 46 nativen Bibliotheken bestätigt.
Die Source Map enthält 2118 Quellen und keine der vier bewerteten npm-Pakete.
Alle fünf Startbilder sind bytegleich mit der geprüften Store-Auslieferung 4.

Auslieferung: `build/releases/production/maschinenlog-1.0.0-build-5-production.aab`.
SHA-256: `dd4b9934f8285b18079bf5d2ad96071c4383cf40a0f901b38783b776a1ef5560`.
Auslieferungen 2, 3 und 4 vor und nach dem Build anhand ihrer Prüfsummen
unverändert bestätigt. Protokolle und Nachweise liegen ignoriert unter
`build/validation/release-5/`. Deutsche Versionshinweise liegen neben der AAB.
Private Schlüssel und Build-Dateien bleiben außerhalb von Git.
Keine Geräteinstallation und kein Play-Upload in diesem Auftrag.
