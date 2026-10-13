# Fotos im Produktionsprotokoll vergrößert

Den neuesten MaschinenLog-Screenshot vom Smartphone geprüft. Bisher wurden Fotos
in einem kleinen Rahmen mit zwei Spalten und 170 Punkten Höhe dargestellt.
Jedes aktuelle und frühere Foto erhält jetzt eine eigene A4-Seite. Die Skalierung
nutzt die verfügbare Breite und Höhe, erhält das Seitenverhältnis und beschneidet
das Bild nicht. Dateiname, Fotozählung, Eintragszuordnung und Seitenfuß bleiben
sichtbar. Der Rahmen folgt den tatsächlichen Bildmaßen.

Kompakte Protokolle, gespeicherte PDFs und Bilddateien bleiben unverändert.
Die neue Darstellung gilt beim erneuten Erstellen eines Protokolls mit Fotos.
README um das Verhalten ergänzt.

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 39 Tests.
Ein neuer gezielter PDF-Test prüft anhand der tatsächlichen PDF-Ausgabe getrennte
Seiten für aktuelle und frühere Fotos, volle Breite bei Querformat, Seitenverhältnis,
Beschriftungen und unveränderte extrahierte JPEG-Daten. Kompakte PDFs bleiben
ohne eingebettete Bilder. Keine aufwendige visuelle Testreihe.

Dev-APK erfolgreich gebaut und datenbewahrend auf dem HONOR BVL-N49 installiert.
Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach Update `null`. Signatur mit der vorhandenen Installation
verglichen. Start angefordert. Keine JavaScript- oder Android-Absturzmeldung im
kurzen Laufzeitcheck. Das Smartphone war gesperrt. Die neue Darstellung kann mit
einem neu erstellten Protokoll nach dem Entsperren kurz geprüft werden.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-large-pdf-photos-2026-10-13.apk`.
SHA-256: `148c98852628474ce10cd93b52793744cfb6f4f4da5c843dcf4bf7e40b584740`.
Kein Store-Build und kein Push.
