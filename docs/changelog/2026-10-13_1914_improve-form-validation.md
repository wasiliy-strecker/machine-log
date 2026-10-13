# Formularfehler und Zahleneingabe verbessert

Die drei neuesten MaschinenLog-Screenshots vom verbundenen Smartphone geprüft.
Fehler beim Speichern führen zum ersten ungültigen Feld, allgemeine Fehler zum
Formularanfang. Wiederholtes Speichern löst die Navigation erneut aus.
Pflichtfelder, Einheiten, alte Endstände, Zeitpunktkonflikte und Änderungsgründe
zeigen ihre Fehler direkt an der Eingabe. Korrigieren eines Feldes schließt die
Tastatur nicht ungewollt. Einheit-Auswahllisten behalten ihre Anzeigeebene.

Zählerstand und alter Endstand erlauben Ziffern mit Dezimalkomma oder Dezimalpunkt,
damit Betriebsstunden und Mengen weiterhin exakt erfasst werden können.
Buchstaben, Vorzeichen und Exponentialschreibweise werden abgewiesen.
Gültige eingefügte Gruppierungen werden exakt normalisiert. Bereits vorhandene
ungültige Entwürfe bleiben durch Löschen korrigierbar. Originale und Revisionen
sowie SQLite- und Backupformat bleiben erhalten.

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 38 Tests.
Sechs neue gezielte Fälle prüfen Fehlersprünge, Wiederholung, Tastaturverhalten,
Pflichtfelder vor Berechtigungsanfragen, Zahlenfilter und Datenbankgrenzen.
Dev-Release erfolgreich erstellt und mit identischer Signatur per `adb install -r`
auf dem HONOR BVL-N49 mit Android 16 installiert. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach Update `null`. Enthält auch den letzten Erinnerungsstand.
Bestehenden Entwurf mit unverändertem Wert und Notiz geöffnet. Beim Speichern
erscheinen die rote Markierung und der Fehler direkt am Zählerstand.
Keine JavaScript- oder Android-Absturzmeldung im kurzen Laufzeitcheck.
Keine aufwendige visuelle Testreihe. README und manuelle Prüfschritte ergänzt.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-validation-2026-10-13.apk`.
SHA-256: `0782f5bc396009361ff4078ef0d0d92bbd87f06e31ceb1b05147f2d4543708c5`.
Kein Store-Build. Lokaler Commit ohne Push.
