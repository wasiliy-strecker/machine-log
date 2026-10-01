# Datenschutz für MaschinenLog

Stand: 1. Oktober 2026

Verantwortlicher Entwickler: Wasiliy Strecker, AppFabrik AI.

MaschinenLog verarbeitet Maschinenangaben, Zählerstände, Notizen, Fotos,
OCR-Ergebnisse, Korrekturen und PDFs lokal im privaten Speicher des Geräts.
Es gibt kein Konto, keine Cloud-Synchronisation, keine Werbung und keine eigene
Telemetrie. Die App sendet diese Inhalte nicht an einen Server.

Die Kamera wird nur auf ausdrücklichen Aufruf verwendet. Die Galerie- und
Dokumentenauswahl läuft über Android. Fotos werden ohne übernommene EXIF-Daten
als JPEG neu gespeichert. Das Modell zur lateinischen Zahlen- und Texterkennung
ist Bestandteil der App. Ein Modelldownload ist dafür nicht erforderlich.

Der optionale Google-Dokumentenscanner kann Komponenten über Google Play-Dienste
nachladen. Die Bildverarbeitung erfolgt lokal. Google-Bibliotheken können technische
Geräte-, Leistungs- und Nutzungsmetriken verarbeiten. Die Hinweise von Google zu
ML Kit gelten ergänzend. Eine eigene Analyse des Nutzungsverhaltens erfolgt nicht.

Erinnerungen werden lokal geplant. Android-Berechtigungen für Benachrichtigungen
und genaue Alarme bestimmen die Zustellung. Sie werden nur für aktivierte
Erinnerungen benötigt. Der optionale Entwicklungsmodus benötigt eine lokale
Verbindung zu Metro. Die eigenständige Dev-Testversion braucht diesen Dienst nicht.

Korrekturen behalten die ursprünglichen Werte, Änderungsgründe und frühere
Fotoversionen. Ein ausdrücklich gelöschter Eintrag entfernt auch seine Korrekturen
und Einzelprotokolle. Gesamtprotokolle bleiben als gespeicherte Dokumente erhalten.
Das Löschen einer Maschine entfernt ihre lokalen Einträge und Protokolle.
Eine Deinstallation oder das Löschen von App-Daten entfernt den privaten Speicher.

PDFs und verschlüsselte Backups verlassen die private App-Ablage nur über eine
bewusste Speicher- oder Teilen-Aktion. Speicherort und Empfänger bestimmt der Nutzer.
Extern gespeicherte Kopien müssen separat gelöscht werden. Backups enthalten
keine ungespeicherten Formularentwürfe. Android-Systembackups sind deaktiviert.

Backups sind mit einem selbst gewählten Passwort verschlüsselt. Ohne dieses
Passwort gibt es keine Wiederherstellung. Dateien in externen Speicherzielen
unterliegen zusätzlich den Regeln des gewählten Anbieters.
