# MaschinenLog

Eigenständige Android-App mit React Native, TypeScript strict, Expo und SQLite.
MaschinenLog dokumentiert Produktionszähler mit lokaler Zahlen-OCR, bestätigten
Ablesungen, nachvollziehbaren Korrekturen und Produktionsprotokollen als PDF.

## Funktionen

Jeder Listeneintrag steht für genau einen Produktionszähler für Stückzahlen,
Zyklen, Betriebsstunden oder Mengen. Das Stammdatenformular enthält Zählerart,
Bezeichnung, Maschinen-/Zählernummer, Produktionsbereich, Einheit und Erinnerung.
Betriebsstunden werden dezimal erfasst.

Die Erfassung folgt ZählerstandLog: Zähler fotografieren, ein Foto aus der Galerie
wählen oder ohne Foto erfassen. Neue Ablesungen besitzen höchstens ein aktuelles
Foto. Zahlen werden mit dem gebündelten lateinischen ML-Kit-Modell lokal erkannt.
Mehrere Zahlenvorschläge lassen sich auswählen oder überschreiben. Erst
„Bestätigen und speichern“ legt die Ablesung an. Bei OCR-Fehlern bleibt die manuelle
Eingabe mit Foto möglich. Fotos werden auf höchstens 1920 Pixel optimiert und als
JPEG ohne übernommene Aufnahme- und Standortmetadaten gespeichert.

Vorhandene Maschinen mit mehreren Zählern erscheinen als einzelne Listeneinträge.
Ihre IDs, Ablesungen, Erinnerungen und Korrekturhistorien bleiben erhalten.
Bereichsänderungen eines solchen Zählers werden separat gespeichert und verändern
keinen Nachbarzähler. Zusätzliche Maschinendaten aus Altbeständen bleiben gespeichert.
PDF-Anhänge und Mehrfachfotos älterer Versionen bleiben lesbar und Bestandteil der
Backups. PDF-Import und Dokumentenscan sind aus der Erfassung und dem nativen Modul
entfernt. Beim Ersetzen eines Fotos bleiben frühere Fotoversionen nachvollziehbar.

Zahlen bleiben als Ziffernfolge und Dezimalskala erhalten. Berechnungen verwenden
BigInt. Nachträge werden nach ihrem Ablesezeitpunkt einsortiert. Pro Zähler ist ein
Ereignis je Zeitpunkt möglich. Die erste Ablesung ist ein Ausgangsstand.

Rücksetzungen und Zählerwechsel enthalten den alten Endstand und den neuen
Startstand. Beispiel: 100 → Endstand 120 → Startstand 0 → 15 ergibt 35 Stück.
Ein unbekannter Endstand bleibt als Berechnungslücke sichtbar. Unterschiedliche
Einheiten werden nicht verrechnet. Rückläufige Stände müssen durch einen passenden
Wechsel oder eine Korrektur aufgelöst werden. Es gibt keine automatische Erkennung
von Rücksetzungen oder Überläufen, keine Einheitenumrechnung und keine Schichtanalyse.

Korrekturen benötigen einen Grund. Originalwerte, Zeitpunkte, OCR-Quelle und
frühere Anhänge bleiben in einer unveränderlichen Korrekturkette erhalten.
Einträge können bewusst gelöscht werden, sofern dadurch keine widersprüchliche
Zählerfolge entsteht. Ein Zähler mit Einträgen, Entwürfen oder eigenen Protokollen
kann nicht aus der Maschine entfernt werden. Das Löschen der gesamten Maschine
entfernt ihre lokalen Einträge, Entwürfe und Protokolle.

Einzel- und Zählerprotokolle enthalten Werte, Zuwächse, Übergänge,
Berechnungslücken und Korrekturen. Fotos und Original-PDF-Seiten sind optional.
Frühere gemeinsame Maschinenprotokolle bleiben als Altprotokolle zugänglich. Bereits erzeugte PDFs bleiben nach
Korrekturen unverändert. Protokolle dienen der Dokumentation und sind keine
amtliche Bestätigung. Zeitangaben stammen vom Gerät.

Passwortgeschützte `.mlbackup`-Sicherungen verwenden AES-256-GCM und PBKDF2-SHA256
mit 600000 Runden. Sie enthalten gespeicherte Einträge, Korrekturen, Fotos und PDFs,
aber keine Formularentwürfe. Wiederherstellung erhält neuere lokale Korrekturen.
Getrennt weiterentwickelte Korrekturketten werden vor der Datenübernahme abgewiesen.
Die eigene Formatkennung verhindert die Übernahme fremder App-Backups.
Backups sind auf 128 MiB begrenzt, einzelne Dateien auf 50 MiB.

## Ableseerinnerungen

Formular und Statusanzeigen folgen ZählerstandLog. Erinnerungen sind optional
und bleiben lokal. Stündlich, täglich, wöchentlich, monatlich und jährlich werden
unterstützt. Beim stündlichen Intervall lassen sich Startdatum und Startzeit
getrennt wählen. Eine Vorschau zeigt den nächsten Termin ab diesem Start.

Neue Erinnerungen verwenden den aktuellen Tag bis maximal 28, den aktuellen
Monat, 09:00 Uhr und für stündliche Termine die nächste volle Stunde.
Gespeicherte Tage 29–31 bleiben gültig. Änderungen von Intervall, Datum und
Uhrzeit bleiben beim Aus- und Einschalten im selben Formular erhalten.

„Normale Erinnerung“ berücksichtigt „Nicht stören“ und kann verzögert erscheinen.
„Pünktlich mit Ton“ führt bei fehlender Freigabe zu „Alarme & Erinnerungen“.
Eine abgelehnte Freigabe verändert die Auswahl nicht. Appweite Blockierung,
gesperrte Erinnerungsart und „Nicht stören“ erhalten eigene Hinweise und passende
Einstellungslinks. Nach Rückkehr werden die Android-Zustände erneut gelesen.
Die bestehenden Kanal-IDs bleiben unverändert. Die Kategorien heißen passend
zum Formular „Normale Erinnerung“ und „Pünktlich mit Ton“.

„Erinnerung jetzt testen“ verwendet die Bezeichnung und letzte Ablesung des
gewählten Zählers. Antippen öffnet diesen Zähler. Bei einem noch ungespeicherten
Zähler öffnet die Testmeldung die App. Die Testmeldung läuft nach einer Minute ab.
Erfolg, gesperrte Zustellung und technische Fehler werden getrennt erklärt.
Die Erfolgsmeldung bleibt acht Sekunden lesbar.

Unbestätigte Planung, fehlende Alarmfreigabe, Zustellfehler und fehlgeschlagenes
Ausschalten werden in Übersicht und Details angezeigt. „Erinnerung bearbeiten“
führt zum betroffenen Zähler. „Erinnerung erneut speichern“ ist bei einem
Planungsproblem auch ohne Feldänderung verfügbar. Gespeicherte Zählerdaten und
Fehler bei der Erinnerungsplanung werden getrennt gemeldet.

## Unabhängige App

| Variante | Paketkennung                      | Verwendung                                           |
| -------- | --------------------------------- | ---------------------------------------------------- |
| Dev      | `com.appfactory.maschinenlog.dev` | Entwicklung und eigenständige Smartphone-Testversion |
| Store    | `com.appfactory.maschinenlog`     | Vorbereitete, unsignierte Release-Identität          |

Die vorhandene Flutter-App unter `production_counter_log` und Hausakte bleiben
unverändert. Es gibt keine gemeinsame Runtime-Bibliothek, keine Datenmigration,
kein Konto, keine Cloud und keine eigene Telemetrie. Android-Systembackups sind
deaktiviert. Die Einstellungen öffnen die vollständige Datenschutzerklärung
im Browser und verlinken die [GitHub-README](https://github.com/wasiliy-strecker/machine-log#readme).

## Datenschutz

Die vollständige [Datenschutzerklärung](https://wasiliy-strecker.github.io/machine-log/datenschutz/)
und ihre [englische Fassung](https://wasiliy-strecker.github.io/machine-log/privacy/)
werden wie bei ZählerstandLog über GitHub Pages bereitgestellt.

- Maschinen, Zählerstände, Fotos, OCR, Korrekturhistorien, PDFs und Backups werden
  lokal im privaten App-Speicher auf Ihrem Gerät verarbeitet.
- Es gibt kein Konto, keine Cloud-Synchronisation, keine Server-KI, keine Werbung
  und keine eigene Analyse des Nutzungsverhaltens.
- Die Zahlen-OCR verwendet ein mitgeliefertes ML-Kit-Modell.
  Google-Bibliotheken verarbeiten technische Leistungs- und Nutzungsmetriken.
  Bilder, erkannte Texte und Dokumenteninhalte werden dadurch nicht an Google
  übertragen. Details stehen in den [ML-Kit-Datenschutzhinweisen](https://developers.google.com/ml-kit/terms).
- Android-Systembackups sind deaktiviert. Manuelle Backups sind verschlüsselt.
- PDFs und verschlüsselte Backups verlassen die private App-Ablage nur durch
  eine bewusste Speicher- oder Teilen-Aktion. Speicherort und Empfänger bestimmen Sie.

### Veröffentlichung der Datenschutzerklärung

Die statischen Datenschutzseiten liegen unter `docs/`. GitHub Pages veröffentlicht
den Ordner `/docs` aus `main` über „Deploy from a branch“. `.nojekyll` deaktiviert
die Jekyll-Verarbeitung. HTML und CSS benötigen keine externen Assets, Skripte
oder Build-Abhängigkeiten. App-Daten werden dort nicht abgelegt.

Die App öffnet die deutsche URL. Für einen späteren Store-Release in der
Play Console dieselbe URL als Datenschutzerklärung hinterlegen.
Änderungen künftig in beiden Sprachfassungen pflegen und das
Aktualisierungsdatum anpassen. [PRIVACY.md](PRIVACY.md) verweist ebenfalls auf
die vollständigen Erklärungen.

## Entwicklung

Voraussetzungen sind Node 22.13 oder neuer, npm, JDK 21, Android SDK 36,
Build Tools 36.0.0, NDK 28.2.13676358 und CMake. PDF-Inhaltstests verwenden
`pdftotext` aus Poppler. Die Abhängigkeiten und deren Lockfile stammen aus Hausakte.

```bash
npm ci
npm run check
npm run check:native
npm run build:preview
npm run install:preview -- DEVICE
```

`DEVICE` durch die Ausgabe von `adb devices -l` ersetzen. Der Installationshelfer
prüft Paket, Version, Debug-Eigenschaft, bisherigen Installer und bei vorhandener
Installation die Signatur. Er verwendet ausschließlich `adb install -r -t -g
--no-streaming`. Niemals deinstallieren oder Daten löschen, um einen Signaturkonflikt
zu umgehen.

Die normale Dev-Testversion enthält JavaScript und läuft ohne Metro. Sie liegt
unter `android/app/build/outputs/apk/dev/release/app-dev-release.apk`. Änderungen
an dieser installierten Version benötigen ein APK-Update. Der eigene lokale
Dev-Schlüssel liegt ignoriert unter `.local/maschinenlog-dev.keystore` außerhalb
des von Expo regenerierten Android-Verzeichnisses. Diese Datei behalten und privat
sichern. Sie wird nicht eingecheckt. Store-Debug ist deaktiviert. Ein Store-Build,
Store-Signierung oder Upload gehört nicht zu diesem Projektauftrag.

Für optionales Fast Refresh stehen `npm run build:dev`, `npm start` auf Port 8084
und `bash scripts/install-dev.sh DEVICE` zur Verfügung. Dev-Debug und Dev-Preview
verwenden dieselbe Paketkennung und Signatur. Ein Moduswechsel ersetzt die bisherige
Dev-Version datenbewahrend. Hausakte und deren Metro-Port 8083 bleiben unberührt.

## Architektur und Herkunft

Schlanke Expo-Routen liegen in `src/app`. Feature-Hooks steuern die Oberfläche,
`MachineService` koordiniert Geschäftsregeln. SQLite, Dateispeicher, Medien,
Erinnerungen, OCR und PDF-Vorschau sind über Ports angebunden. Das app-lokale
Expo-Modul `machine-native` übernimmt Android-Funktionen und ML-Kit-OCR.

Das neue SQLite-Schema 1 verwendet Fremdschlüssel, WAL und Transaktionen.
Das bestehende Speicher- und Backupformat bleibt kompatibel. Neue Datensätze
enthalten einen Zähler. Altbestände speichern ihre typisierten Zähler weiterhin
gemeinsam und werden in der Oberfläche getrennt dargestellt. Ereignisse besitzen eine
indizierte Zählerzuordnung und einen eindeutigen Zeitpunkt. Originalzustand und
Korrekturkette werden atomar mit dem aktuellen Stand gespeichert. Dateibereinigung
berücksichtigt aktuelle Einträge, Revisionen und persistierte Entwürfe.

Basis ist Hausakte am Commit `dfd6fc8`. Zahlen- und OCR-Kandidatenlogik wurde aus
ZählerstandLog nach TypeScript übertragen, einschließlich der Erkennung getrennter
Rollenziffern anhand ihrer Positionen. Siehe [NOTICE.md](NOTICE.md).

## Prüfung und Geräteabnahme

Die kurze automatisierte Suite prüft exakte Zahlen, OCR-Kandidaten, getrennte Altzähler,
Nachträge, Rücksetzungen, Wechsel, Korrekturen, SQLite-Neuöffnung und einen vollständigen
PDF-/Backup-Ablauf. Die Entschlüsselung wird unabhängig mit Node Crypto geprüft.
Übernommene Galerie- und Backup-Dialogtests sichern weiterhin ihre Kernabläufe ab.
Native JVM-Tests und Lint prüfen das eigene Android-Modul. Wie bei Hausakte werden
zwei bekannte, abstürzende Lint-Analysetasks der SDK-57-Abhängigkeiten ausgenommen.

Bei der Erstumsetzung war kein Android-Gerät verbunden. Deshalb sind echte
Kamera-/Galerie-OCR, Berechtigungsdialoge, Reminder-Zustellung und
der sichtbare App-Start noch auf einem Gerät abzunehmen. Es wurden keine
aufwendigen visuellen Testreihen durchgeführt.

Am 12. Oktober 2026 wurde die eigenständige Dev-Version auf einem HONOR BVL-N49
mit Android 16 installiert und per Launcher gestartet. Die JavaScript-Laufzeit
startete erfolgreich, ohne JavaScript-Fehler oder Android-Absturzmeldungen.
Die oben genannten Funktionsabläufe bleiben zur manuellen Geräteabnahme offen.

Kurzer manueller Ablauf nach Installation: Zwei getrennte Zähler für Stückzahl und
Betriebsstunden anlegen, einen Stand manuell und einen per Foto bestätigen, einen Nachtrag und
eine Rücksetzung erfassen, eine Ablesung mit Grund korrigieren, Produktions-PDF
öffnen und ein Backup speichern sowie wiederherstellen. Frühere Werte und Fotos
müssen in Historie und PDF erhalten bleiben.

Prüfung der Erstumsetzung: `npm run check` mit 19 Tests, 41 native JVM-Tests und
Modul-Lint erfolgreich. Dev-APK `1.0.0` mit Code `1`, eigener Dev-Signatur,
gebündeltem OCR-Modell und eingebettetem JavaScript erstellt. Die benannte
Auslieferung liegt unter `build/dev/maschinenlog-1.0.0-dev.apk`.
Die am 12. Oktober 2026 neu gebaute und installierte Auslieferung liegt zusätzlich
unter `build/dev/maschinenlog-1.0.0-dev-2026-10-12.apk`.

Aktueller vereinfachter Ablauf geprüft mit 26 Anwendungstests und 39 nativen
JVM-Tests. Formatierung, ESLint, TypeScript und Android-Lint erfolgreich.
Scanner aus dem nativen Modul und der APK entfernt. Die aktualisierte
Dev-Version 1.0.0 mit Code 1 auf dem HONOR BVL-N49 datenbewahrend installiert.
Die benannte APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-counter-flow-2026-10-12-final.apk`.
Der Bildschirm war nach dem Update gesperrt. Die sichtbare Oberfläche und echte
Kamera-/OCR-Abläufe bleiben zur kurzen Nutzerabnahme offen.

Die an ZählerstandLog angeglichene Ableseerinnerung ist mit 32 Anwendungstests,
45 nativen JVM-Tests und Android-Lint geprüft. Die eigene Dev-APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-reminders-2026-10-12.apk`.
Dieser Erinnerungsstand wurde am 13. Oktober 2026 zusammen mit der verbesserten
Formularprüfung datenbewahrend auf dem HONOR BVL-N49 installiert.

Speicherfehler führen zum ersten betroffenen Feld. Eingabefehler erscheinen direkt
am Feld, allgemeine Fehler am Formularanfang. Erneutes Speichern führt erneut zum
Fehler, das Korrigieren eines Feldes schließt die Tastatur nicht ungewollt.
Zählerstände und alte Endstände erlauben Ziffern mit Dezimalkomma oder Dezimalpunkt.
Gültige eingefügte Tausendergruppierungen werden ohne Rundung normalisiert.
Ungültige Zeichen werden abgewiesen. Alte ungültige Entwürfe bleiben durch Löschen
korrigierbar.

Prüfung dieses Stands: `npm run check` mit 38 erfolgreichen Tests und erfolgreicher
Dev-APK-Erstellung. Der vorhandene Formularentwurf mit Wert und Notiz blieb beim
Update erhalten. Ein kurzer Gerätecheck bestätigte die rote Feldmarkierung und
die Fehlermeldung unmittelbar unter dem Zählerstand nach dem Speichern.
Weitere manuelle Prüfung: Fehlende Einheit und fehlenden Zählerstand speichern,
Felder korrigieren, erneut speichern sowie `12,5` und `12.5` eingeben.
Die Auslieferung liegt unter
`build/dev/maschinenlog-1.0.0-dev-validation-2026-10-13.apk`.
