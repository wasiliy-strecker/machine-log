# MaschinenLog Store-Version vorbereiten

Die bestätigte Nutzerabnahme ersetzt die früher offenen Hinweise zu Gerätetests.
Store-Paket `com.appfactory.maschinenlog`, Version `1.0.0`, Code `2` mit eigenem
privatem RSA-4096-Upload-Schlüssel eingerichtet. Schlüssel und Zugangsdaten liegen
geschützt außerhalb von Git und des regenerierten Android-Verzeichnisses.
Expo erhält die Signierung bei einer Neuerzeugung. Dev-Paket und Gerätedaten
bleiben unverändert. Nachbarprojekte wurden nicht geändert.

App-lokaler Store-Helfer baut und prüft die AAB vor einer benannten, nicht
überschreibbaren Auslieferung. Geprüft sind Store-Identität und Version,
Upload-Signatur, Target API 36, eingebettetes JavaScript, gebündeltes OCR-Modell
und 16-KB-Ausrichtung aller 46 nativen Bibliotheken. Die Store-Source-Map mit
2117 Quellen enthält keine der vier bewerteten npm-Build-Bibliotheken.
Gegenproben für fehlende Signierung, falsche Version, falsches Zertifikat,
ungeeignete ELF-Ausrichtung und erneute Auslieferung erfolgreich.

`npm run check` mit 98 Anwendungstests, `npm run check:native` mit 51 JVM-Tests
und Android-Lint mit 0 Fehlern und 33 Warnungen erfolgreich. Expo-Kompatibilität
und Doctor bestanden. Store-Build einschließlich Release-Lint ohne zusätzliche
Ausschlüsse erfolgreich. `npm audit` und `--omit=dev` melden weiterhin 18 hohe
Einträge aus zwei ungepatchten Build-Werkzeug-Ursachen, keine kritischen Meldungen.
Die Bewertung bleibt ausdrücklich dokumentiert.

Release-Anleitung, technische Abnahme und direkt kopierbare deutsche Store-Texte
ergänzt. Der beauftragte GitHub-Push veröffentlicht auch die zuvor ergänzten
SDK-Datenangaben der beiden Datenschutzseiten. Beide öffentlichen Fassungen sind
mit HTTP 200 erreichbar und bytegleich mit den lokalen HTML-Dateien geprüft.
Kein Play-Upload und keine
Veröffentlichung der App. Der weitere Console-Ablauf erfolgt mit dem Nutzer.

Auslieferung:
`build/releases/production/maschinenlog-1.0.0-build-2-production.aab`.

AAB SHA-256:
`5f78a58f4c01ea896ecd9d31508d37ace1cd10e1012f470badfb8bb393c8e328`.
