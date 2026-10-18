# MaschinenLog Store-Release 1.0.0 (4) bauen

Nach bestätigtem Smartphone-Test des neuen Startbildschirms den Store-Build
beauftragt und erstellt. Versionscode in Expo-Konfiguration und Android-Gradle
von 3 auf 4 erhöht. Marketingversion bleibt 1.0.0. Das vorhandene Zahnrad-Icon
und der kurze Übergang zur fertigen App sind im signierten Store-Bundle enthalten.

`npm ci`, `npm run check` mit 98 Anwendungstests, `npm run check:native` mit
51 JVM-Tests sowie `npm run check:store` mit fünf Regressionstests erfolgreich.
Formatierung, ESLint, TypeScript, Expo-Kompatibilität und alle 20 Doctor-Prüfungen
bestanden. Native Lint-Prüfung mit 0 Fehlern und 33 bekannten Warnungen.
Beide npm-Audits melden weiterhin 18 hohe Einträge aus den zwei bekannten
Build-Werkzeug-Ursachen `node-forge` und `braces`. Keine kritischen Einträge.
Die Registry bietet weiterhin keine gepatchte Version dieser Pakete.
Audit-Exitcode 1 ist ausdrücklich dokumentiert und keine saubere Audit-Prüfung.

Der lokale Release-Helfer hat die Store-AAB gebaut, signiert und geprüft.
Paket `com.appfactory.maschinenlog`, Name MaschinenLog, Version 1.0.0, Code 4,
Target API 36, kein Debug-/Testflag und keine Netzwerkberechtigungen.
Eigenes Upload-Zertifikat, JavaScript, OCR-Modell, Bundletool-Validierung und
16-KB-Ausrichtung aller 46 nativen Bibliotheken bestätigt. Die Source Map enthält
2118 Quellen und keine der vier bewerteten npm-Build-Bibliotheken.
Alle fünf gepackten Splash-Bilder sind pixelgleich mit den geprüften
Dev-Ressourcen. Das transparente Ersatzmotiv ist entfernt.

Auslieferung: `build/releases/production/maschinenlog-1.0.0-build-4-production.aab`.
AAB SHA-256: `5e6d4e8320e35d0b31142d6a15feb21648794173f0ab52e685ee636c9e6287f6`.
Die benannten AABs mit Code 2 und 3 sind per Prüfsummenvergleich unverändert.
Release-Anleitung, technische Abnahme und kopierbare deutsche Versionshinweise
aktualisiert. Der Ausgabeordner wurde für die Übergabe geöffnet.
Keine Smartphone-Installation, kein Play-Upload und kein Git-Push in diesem Auftrag.
