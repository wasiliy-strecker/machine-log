# Ablesungsansicht und Auswahlblätter vereinfacht

Die letzten Smartphone-Screenshots mit Flutter ZählerstandLog verglichen.
„Zeitpunkt der Ablesung oder des Wechsels“ steht jetzt als normaler Untertitel
unter „Datum und Uhrzeit“. Das Datumsfeld behält seine zugängliche Beschriftung.
Der Änderungsgrund ist im Formular und im gespeicherten Korrekturschema optional.
Die Grenze von 500 Zeichen bleibt bestehen. Originale, Zeitpunkte, Gründe und
Foto-Versionen bleiben in der Korrekturkette erhalten. Leere Grundzeilen werden
in der Ansicht und in neuen PDFs ausgelassen. Vorhandene PDFs bleiben unverändert.

Die Eintragsinformationen durch beschriftete Zeilen für Zeitpunkt, Quelle und
optionale Notiz ersetzt. Wechselangaben erscheinen bei Rücksetzung oder
Zählerwechsel. Technische OCR-Angaben, doppelte Maschinenangaben, Zuwachshinweis
und Bearbeitungszeile entfallen hier wie im Flutter-Vorbild. Die nicht mehr
benötigte Abfrage der vorherigen Ablesung aus dem Detail-Hook entfernt.

„Korrekturverlauf“ übernimmt Titel und Erklärung von ZählerstandLog. Neueste
Korrekturen erscheinen zuerst. Nur tatsächlich geänderte Angaben werden mit
„Vorher“ und „Neu“ gezeigt. Neue Fotos erscheinen bei einer Fotoänderung.
Frühere Fotos und Altanhänge lassen sich dann aufklappen. Unveränderte Fotos
werden nicht bei jeder Korrektur wiederholt. Leere Verläufe erhalten denselben
kurzen Hinweis wie im Vorbild. Bestehende Historien und Anhänge bleiben erhalten.
README angepasst. Nachbarprojekte nur gelesen.

Auswahlblätter und die Beispielfotogalerie erhalten eine erhöhte Fläche,
eine feine Kontur, Schatten und einen stärker abgedunkelten Hintergrund.
Dadurch hebt sich die Oberkante auch vor dunklen Karten deutlich ab.

`npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 59 Tests.
Gezielte Fälle prüfen optionale Gründe, originale und korrigierte Werte,
PDFs und verschlüsselte Wiederherstellung, beschriftete Angaben, tatsächlich
geänderte Felder, Reihenfolge und aufklappbare frühere Fotos. Am Smartphone
Datumsuntertitel, optionales Feld, Korrekturanzeige und PDF-Auswahlblatt geprüft.
Keine Testdaten oder neuen PDFs auf dem Gerät angelegt. Kurzer Laufzeitcheck
und eine direkte Sichtprüfung genügen. Keine aufwendige visuelle Testreihe.

Dev-APK mit eingebettetem JavaScript erfolgreich gebaut und nach Paket- und
Signaturprüfung datenbewahrend auf dem HONOR BVL-N49 installiert. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach dem Update `null`. Native Quellen unverändert.
Kein Store-Build und kein Push.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-reading-details-and-sheets-2026-10-15.apk`.
SHA-256: `3604493391e51dd9c49aacfbf0a483270087db28d79dc4fa8b2842e9fad4cc42`.
