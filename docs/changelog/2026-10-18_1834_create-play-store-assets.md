# Google-Play-Store-Bilder für MaschinenLog

Zehn deutsche Upload-Bilder aus der vorhandenen Store-AAB 1.0.0 (3) erstellt.
Icon und Feature-Grafik verwenden das bestehende Branding. Vier Smartphone-
Bilder zeigen Übersicht, echte Foto-OCR, Ableseverlauf und PDF-Protokoll mit
kurzen Überschriften. Je zwei direkte Tablet-Aufnahmen zeigen Übersicht und
PDF im Hochformat 9:16 auf getrennten 7- und 10-Zoll-Emulatorprofilen.

Drei fiktive Zähler und sechs Ablesungen über die echte App angelegt. Lokale
OCR erkannte 12480 Stück aus dem vorhandenen künstlichen Foto. Die App erzeugte
das PDF und ein verschlüsseltes Demo-Backup. Beide Tablets importierten die
Sicherung einschließlich des gespeicherten Protokolls erfolgreich.

Lieferung unter `build/store-assets/de-DE/build-3/` mit Gesamtvorschau,
Play-Console-Zuordnung, deutschen Alt-Texten und SHA-256-Manifest. App-lokale
Aufnahme-, Render- und Prüfhelfer samt Anleitung ergänzt. Generierte Dateien
bleiben ignoriert. App-Code, Abhängigkeiten und Release-Version sind unverändert.

Prüfung: Alle zehn PNGs vollständig dekodiert und auf Maße, Farbmodus und
Größenlimits geprüft. Größte Upload-Datei rund 309 KiB. Alle Bilder visuell
kontrolliert. Tablet-Uploads sind bytegleich mit ihren Originalaufnahmen.
69 Assets und native Bibliotheken der Emulator-APK stimmen byteweise mit der
AAB überein. Paket, Version und fehlendes Debug-Flag geprüft. Prettier,
ESLint, TypeScript sowie Python-, Shell- und JavaScript-Syntaxprüfungen erfolgreich.
Geräteschutz gegen physische oder ungültige Seriennummern geprüft.
Keine umfangreiche Regressionstestreihe, kein App-Neubau und kein Play-Upload.
