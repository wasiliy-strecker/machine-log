# Wählbare Maschinensymbole ergänzt

Den letzten Smartphone-Screenshot des Bearbeitungsformulars geprüft. Unter
Zählerart eine kompakte Auswahl mit acht Material-Symbolen ergänzt: Maschine,
Fertigung, Werkzeuge, Verpackung, Drucker, Pumpe, Landmaschine und Transport.
Die Auswahl ist hervorgehoben und zeigt ihren Namen unter den Symbolflächen.
Android erhält beschriftete Radio-Elemente mit Auswahl- und Sperrzustand.
Lange Einzelbeschriftungen in schmalen Viererspalten entfallen nach dem kurzen
Gerätecheck. In der Übersicht steht das Symbol neben der Bezeichnung, damit
Ablesewerte und Erinnerungstexte ihre bisherige Breite behalten.

Stabile Symbol-IDs werden optional pro Zähler gespeichert. Bestehende SQLite-
Daten und Backups bleiben lesbar und verwenden ohne Auswahl das Symbol Maschine.
Altbestände mit mehreren Zählern behalten unabhängige Symbole. Die Auswahl
erscheint in Übersicht, Zählerdetails und Einzelansicht einer Ablesung. Originale,
Korrekturen, Fotos und bereits erzeugte PDFs bleiben unverändert.

Geplante und getestete Android-Erinnerungen erhalten die gewählte Symbol-ID.
Native Vektoren wurden aus denselben gebündelten MaterialIcons-Glyphen abgeleitet
und werden als kleines und großes Nachrichtensymbol verwendet. Bereits
angezeigte Erinnerungen erhalten ein geändertes Symbol ohne erneuten Ton und
ohne Veränderung des ursprünglichen Zeitpunkts oder einer fälligen Planung.
Alte native Erinnerungsdaten und unbekannte Symbol-IDs besitzen einen Fallback.
README und Herkunftshinweise ergänzt. Keine neue Abhängigkeit.

Prüfung: `npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 47 Tests.
Gezielte Ergänzungen prüfen Auswahl, Weitergabe an Testmeldungen, SQLite,
unveränderte Ablesungsnachweise, alte Backups und verschlüsselte Wiederherstellung.
`npm run check:native` erfolgreich mit 51 JVM-Tests und Android-Lint. Neue native
Fälle prüfen alle acht Symbole, Speicherung, echte und getestete Nachrichten,
Fallbacks und die stille Aktualisierung einer bereits angezeigten Erinnerung.
Eine beim ersten Lint-Lauf entdeckte API-28-Abhängigkeit wurde durch einen
versionsunabhängigen Vergleich der gespeicherten Symbol-ID ersetzt.

Dev-APK erfolgreich gebaut und mit identischer Signatur datenbewahrend auf dem
HONOR BVL-N49 installiert. Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0,
Code 1, nicht debuggable, Installer vor und nach Update `null`. Acht auswählbare
Symbole und die Anzeige in Übersicht und Zählerdetails beim kurzen Gerätecheck
bestätigt. Auswahl auf Drucker gewechselt und ohne Speichern auf Maschine
zurückgesetzt. Das Formular zeigte danach Alles gespeichert. Keine Testdaten
angelegt. Die abschließende kompakte Darstellung ist installiert. Der weitere
UI-Check wurde beim Wechsel des Smartphones in eine andere App beendet.
Keine aufwendige visuelle Testreihe.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-machine-icons-compact-2026-10-14.apk`.
SHA-256: `5d3b096113e0994a4b94f0a39a6294164a7dae18532fa96e99d5a61e5453a006`.
Keine Nachbar-App verändert. Kein Store-Build und kein Push.
