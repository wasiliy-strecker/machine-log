# Ableseerinnerung an ZählerstandLog angeglichen

Auf Nutzerauftrag das vollständige Erinnerungsformular sowie die Statusanzeigen
in Übersicht und Zählerdetails an das Flutter-Vorbild angeglichen.
Die Texte zu normaler Erinnerung, Pünktlichkeit, „Nicht stören“, Android-Freigaben
und Test-Erinnerungen vollständig übernommen und den App-Namen angepasst.

## Bedienung und Termine

Stündlicher Start mit getrenntem Datum, Uhrzeit und Vorschau des nächsten Termins.
Neue Standardwerte folgen dem Vorbild. Intervallbezogene Tag- und Zeitauswahlen
bleiben beim Wechsel und Aus-/Einschalten im selben Formular erhalten.
Gespeicherte Tage 29–31 bleiben gültig. Neue Tagesauswahlen reichen von 1 bis 28.
Nicht verfügbare Uhrzeiten bei der Zeitumstellung werden ohne Terminänderung abgelehnt.
Keine Änderung des SQLite- oder Backupformats.

Die Auswahl „Pünktlich mit Ton“ öffnet bei fehlender Freigabe „Alarme & Erinnerungen“.
Die Auswahl bleibt bei einer Ablehnung bestehen. Nach Rückkehr werden die Zustände
neu gelesen. App- und Kategorieblockierung sowie „Nicht stören“ werden getrennt erklärt.
Native Einstellungsaufrufe unterstützen passende Ziele und Android-Fallbacks.
Kanal-IDs und Benutzereinstellungen bleiben erhalten. Die Namen der Kategorien
passen zu den Bezeichnungen im Formular.

## Test, Status und Reparatur

Tests enthalten Zähler-ID, Bezeichnung und letzte bestätigte Ablesung mit Einheit.
Antippen öffnet den richtigen Zähler. Testmeldungen verschwinden nach einer Minute.
Mehrfachtippen wird während des Tests gesperrt. Erfolgsrückmeldung bleibt acht
Sekunden lesbar. Blockierte Zustellung und technische Fehler werden unterschieden.

Übersicht und Details unterscheiden geplante, ausstehende und unbekannte Termine,
Blockierungen, fehlende Alarmfreigabe, Zustellfehler und fehlgeschlagenes Ausschalten.
Passende Einstellungs- und Bearbeitungsaktionen ergänzt. Unbestätigte Planung kann
auch ohne Feldänderungen mit „Erinnerung erneut speichern“ repariert werden.
Daten werden vor der Statusprüfung gespeichert. Planungsprobleme werden anschließend
getrennt gemeldet. Fehlgeschlagene Abschaltungen bleiben im nativen Status sichtbar
und können erneut versucht werden.

## Prüfung und Artefakt

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 32 Tests.
Die sechs neuen fokussierten Fälle prüfen Defaults und Zeitumstellung, alte Tage,
Intervallwechsel, Android-Rückkehr, Zielauswahl, Testserialisierung, Zählerkontext
und Reparatur nach gespeichertem Datensatz.
`npm run check:native` erfolgreich mit 45 JVM-Tests und Android-Lint.
Kanalziele, Fallbacks, Test-Tap-Ziel, Einheit, Timeout und Abschaltwiederholung geprüft.
Keine aufwendige visuelle Testreihe.

`assembleDevRelease` erfolgreich. Dev-Paket `com.appfactory.maschinenlog.dev`,
Version 1.0.0 mit Code 1, eigene Signatur und eingebettetes JavaScript geprüft.
Native Schnittstellenänderungen erfordern die aktualisierte APK.
Der verbundene HONOR war gesperrt. Eine möglicherweise offene Eingabe konnte
nicht zuverlässig ausgeschlossen werden. Eine Rückfrage zur sicheren Geräteaktualisierung
ist offen. Die bisherige Installation und ihre Daten wurden nicht verändert.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-reminders-2026-10-12.apk`.
SHA-256: `17f516bbab622957c3a8cb9e441bb5eb86e2f08064e2f3afb33f131a3157a834`.

README ergänzt. Kein Store-Build. Änderungen werden im freigegebenen Repository
committed und gepusht.
