# MaschinenLog

Eigenständige Android-App mit React Native, TypeScript strict, Expo und SQLite.
MaschinenLog dokumentiert Produktionszähler mit lokaler Zahlen-OCR, bestätigten
Ablesungen, nachvollziehbaren Korrekturen und Produktionsprotokollen als PDF.

Beim Öffnen erscheint das vorhandene Zahnrad-Icon mittig auf dem türkisen
Markenhintergrund. Android-Startbildschirm und Ladeansicht verwenden dasselbe
Motiv, auch im Dunkelmodus. Sobald Schriften, Daten und die erste Ansicht bereit
sind, blendet die App in 180 Millisekunden über. Es gibt keine zusätzliche
Mindestwartezeit. Die Splash-Konfiguration bleibt beim Expo-Prebuild erhalten.

## Funktionen

Jeder Listeneintrag steht für genau einen Produktionszähler für Stückzahlen,
Zyklen, Betriebsstunden oder Mengen. Das Stammdatenformular enthält Zählerart,
Maschinensymbol, Bezeichnung, Maschinen-/Zählernummer, Produktionsbereich,
Einheit und Erinnerung.
Betriebsstunden werden dezimal erfasst.

Die Hauptansicht ist wie bei ZählerstandLog eine durchgehend scrollbare Liste
ohne Seitenwechsel. Alle Zähler bleiben durchsuchbar und sortierbar. Ihre Karten
werden mit einer `FlatList` erst für den sichtbaren Bereich und seine Umgebung
aufgebaut. Beim Zurückkehren aus Details bleiben Suchtext und Scrollposition
erhalten, während die Daten im Hintergrund aktualisiert werden.

Bei „Zählerart“ lassen sich Stückzahl, Zyklen, Betriebsstunden und Menge auswählen
oder eigene Bezeichnungen wie Prüfzyklen und Chargen eingeben. Bereits gespeicherte
eigene Arten erscheinen wieder als Vorschläge. Standardarten schlagen die passende
Standardeinheit vor. Eine selbst eingetragene Einheit bleibt beim Wechsel erhalten.
Eigene Arten sind auch in Suche, Sortierung und verschlüsselten Backups enthalten.

Vorschläge für Zählerart und Einheit öffnen sich unter dem Eingabefeld, wenn
dort genügend Platz ist. Andernfalls erscheinen sie darüber. Die Liste bleibt
innerhalb des sichtbaren Formularbereichs oberhalb der Tastatur und lässt sich
bei wenig Platz separat scrollen. Eigene Angaben bleiben frei eingebbar.

Im Stammdatenformular stehen acht Maschinensymbole zur Auswahl: Maschine,
Fertigung, Werkzeuge, Verpackung, Drucker, Pumpe, Landmaschine und Transport.
Das gewählte Symbol erscheint in der Übersicht, den Zählerdetails, der
Einzelansicht einer Ablesung sowie in geplanten und getesteten Android-Erinnerungen.
Es gehört zu den Stammdaten des jeweiligen Zählers und ist in verschlüsselten
Backups enthalten. Altbestände ohne Auswahl verwenden das Symbol „Maschine“.
Symboländerungen verändern keine Ablesung oder Korrekturhistorie.
Bereits angezeigte Erinnerungen erhalten das neue Symbol ohne erneuten Ton.
Android bestimmt die genaue Darstellung der Nachricht und ihrer Symbole.

Die Erfassung folgt ZählerstandLog: Zähler fotografieren, ein Foto aus der Galerie
wählen oder ohne Foto erfassen. Neue Ablesungen besitzen höchstens ein aktuelles
Foto. Zahlen werden mit dem gebündelten lateinischen ML-Kit-Modell lokal erkannt.
Der Einstieg „Erfassen / Fotografieren“ erklärt die Aufnahme wie das Flutter-Vorbild.
„Beispiele ansehen“ zeigt sechs künstliche Produktionsanzeigen in einer lokalen,
wischbaren Galerie. Die Beispiele dienen nur zur Ansicht und werden weder
importiert noch durch OCR verarbeitet oder als Ablesung gespeichert.
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
Zuwächse beziehen sich jeweils auf die vorherige Ablesung. Die App und neu
erzeugte PDF-Protokolle zeigen keine kumulierte Gesamtsumme.

Rücksetzungen und Zählerwechsel enthalten den alten Endstand und den neuen
Startstand. Beispiel: Von 100 bis zum Endstand 120 sind es 20 Stück bis zur
Rücksetzung. Vom neuen Startstand 0 bis zum Stand 15 sind es weitere 15 Stück.
Ein unbekannter Endstand bleibt als Berechnungslücke sichtbar. Unterschiedliche
Einheiten werden nicht verrechnet. Rückläufige Stände müssen durch einen passenden
Wechsel oder eine Korrektur aufgelöst werden. Es gibt keine automatische Erkennung
von Rücksetzungen oder Überläufen, keine Einheitenumrechnung und keine Schichtanalyse.

Ein Änderungsgrund ist bei Korrekturen optional. Originalwerte, Zeitpunkte,
OCR-Quelle und frühere Anhänge bleiben in einer unveränderlichen Korrekturkette
erhalten. Die Ablesungsansicht zeigt wie ZählerstandLog beschriftete Angaben zu
Zeitpunkt, Quelle und optionaler Notiz. Der „Korrekturverlauf“ erklärt seinen
Zweck und zeigt neueste Korrekturen zuerst. Nur geänderte Angaben erscheinen mit
„Vorher“ und „Neu“. Frühere Fotos lassen sich bei einer Fotoänderung aufklappen.
Einträge können bewusst gelöscht werden, sofern dadurch keine widersprüchliche
Zählerfolge entsteht. Ein Zähler mit Einträgen, Entwürfen oder eigenen Protokollen
kann nicht aus der Maschine entfernt werden. Das Löschen der gesamten Maschine
entfernt ihre lokalen Einträge, Entwürfe und Protokolle.

Einzel- und Zählerprotokolle enthalten Werte, Zuwächse, Übergänge,
Berechnungslücken und Korrekturen. Fotos und Original-PDF-Seiten sind optional.
Gespeicherte Zählerverlaufsprotokolle und Einzelprotokolle werden mit zehn PDFs
pro Seite geladen. Ab elf PDFs erscheinen „Zurück“, „Weiter“ und „Seite x von y“.
Beim Blättern springt die Ansicht zum Beginn des jeweiligen PDF-Bereichs.
Wird das letzte PDF einer Seite gelöscht, erscheint die vorherige gültige Seite.
Neu erstellte Protokolle zeigen je Ablesung nur das aktuelle Foto. Frühere
Fotoversionen bleiben in der Korrekturhistorie und in Backups erhalten.
Jedes aktuelle Foto erhält eine eigene Seite mit unverändertem Seitenverhältnis
und ohne Beschnitt. Die bisherige Fotogröße bleibt erhalten.
Frühere gemeinsame Maschinenprotokolle bleiben als Altprotokolle zugänglich. Bereits erzeugte PDFs bleiben nach
Korrekturen unverändert. Protokolle dienen der Dokumentation und sind keine
amtliche Bestätigung. Zeitangaben stammen vom Gerät.

Passwortgeschützte `.mlbackup`-Sicherungen verwenden AES-256-GCM und PBKDF2-SHA256
mit 600000 Runden. Sie enthalten gespeicherte Einträge, Korrekturen, Fotos und PDFs,
aber keine Formularentwürfe. Wiederherstellung erhält neuere lokale Korrekturen.
Getrennt weiterentwickelte Korrekturketten werden vor der Datenübernahme abgewiesen.
Die eigene Formatkennung verhindert die Übernahme fremder App-Backups.
Backups sind auf 128 MiB begrenzt, einzelne Dateien auf 50 MiB.
Android verwendet für SHA-256 und AES-GCM die nativen Funktionen der bereits
vorhandenen Expo-Kryptobibliothek. Beim Erstellen wird jede unterschiedliche
Datei einmal gelesen und einmal gehasht. Alle Referenzen aus Originalen und
Korrekturen werden weiterhin gegen diese Prüfsumme und Dateigröße geprüft.
PDFs und JPEGs behalten ihre Inhaltsprüfung. Die Wiederherstellung prüft auch
neu geschriebene Dateien und verwendet ihren Dateicache nur innerhalb des
laufenden Vorgangs. Das Dateiformat und die Passwortableitung sind unverändert.
Bestehende Sicherungen bleiben lesbar.
Asynchrone Dateiverschiebungen werden vor der Prüfung der Zieldatei vollständig
abgewartet. Das verhindert einen vorzeitigen Importabbruch beim Wiederherstellen
älterer Sicherungen. Auch beim Teilen von Backups sowie Einzel- und mehrteiligen
PDFs wird die jeweilige Kopie fertiggestellt, bevor Android sie erhält.

Der Ladehinweis unterscheidet Vorbereitung, Dateiprüfung, Verschlüsselung,
Entschlüsselung und Wiederherstellung. Bei Dateischritten erscheint der
tatsächliche Zähler, beispielsweise „3 von 12“. Erneutes Wählen eines
Speicherorts verwendet dieselbe vorbereitete Sicherung.

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
Der direkte Button **„Alarme & Erinnerungen“ öffnen** ist im aktivierten
Android-Erinnerungsformular zusätzlich verfügbar. Er öffnet die Systemeinstellung
auch bei normaler Erinnerung oder bereits erteilter Freigabe, ohne die Auswahl
oder den Termin zu ändern.
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
| Store    | `com.appfactory.maschinenlog`     | Signierte AAB für Play-Tests und Veröffentlichung    |

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
  Ab Store-Code 3 entfernt der Store-Manifest-Overlay `INTERNET` und
  `ACCESS_NETWORK_STATE`. Eigene Netzwerkverbindungen der Store-App sind damit
  gesperrt. Dev-Preview verwendet dieselbe Sperre. Dev-Debug behält die für
  Metro benötigte Internetberechtigung.
  Die allgemeinen Herstellerangaben der Google-Bibliotheken beschreiben
  technische Leistungs- und Nutzungsmetriken.
  Bilder, erkannte Texte und Dokumenteninhalte werden dadurch nicht an Google
  übertragen. Details stehen in den [ML-Kit-Datenschutzhinweisen](https://developers.google.com/ml-kit/terms)
  und den [Android-SDK-Datenangaben](https://developers.google.com/ml-kit/android-data-disclosure).
  Beide Datenschutzerklärungen erläutern die technischen Datenkategorien und
  die Beschränkung der Store-Version. Die Berechtigungssperre ist kein offizieller
  Schalter zum vollständigen Abschalten sämtlicher SDK-Telemetriewege.
- Android-Systembackups sind deaktiviert. Manuelle Backups sind verschlüsselt.
- PDFs und verschlüsselte Backups verlassen die private App-Ablage nur durch
  eine bewusste Speicher- oder Teilen-Aktion. Speicherort und Empfänger bestimmen Sie.

### Veröffentlichung der Datenschutzerklärung

Die statischen Datenschutzseiten liegen unter `docs/`. GitHub Pages veröffentlicht
den Ordner `/docs` aus `main` über „Deploy from a branch“. `.nojekyll` deaktiviert
die Jekyll-Verarbeitung. HTML und CSS benötigen keine externen Assets, Skripte
oder Build-Abhängigkeiten. App-Daten werden dort nicht abgelegt.

Die App öffnet die deutsche URL. Für den Store-Eintrag in der
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

Die normale Dev-Testversion enthält JavaScript und läuft ohne Metro. Wie Store
fordert sie weder `INTERNET` noch `ACCESS_NETWORK_STATE` an. Der
Installationshelfer verweigert eigenständige Dev-APKs mit diesen Rechten.
Die gemeinsame app-lokale Manifest-Vorlage wird durch das Expo-Plugin für Store
und `devRelease` erzeugt. Dev-Debug behält den Netzwerkzugriff für Metro.
Die Dev-Testversion liegt
unter `android/app/build/outputs/apk/dev/release/app-dev-release.apk`. Änderungen
an dieser installierten Version benötigen ein APK-Update. Der eigene lokale
Dev-Schlüssel liegt ignoriert unter `.local/maschinenlog-dev.keystore` außerhalb
des von Expo regenerierten Android-Verzeichnisses. Diese Datei behalten und privat
sichern. Sie wird nicht eingecheckt. Store-Debug ist deaktiviert.

Die Store-Version verwendet einen getrennten privaten Upload-Schlüssel und wird
mit `npm run build:store` erstellt. Der Helfer prüft die tatsächliche Signatur,
Identität, Version, JavaScript, OCR-Modell und native 16-KB-Ausrichtung vor der
benannten Auslieferung. Ab Code 3 verwirft er auch Netzwerkberechtigungen in der
fertigen AAB. `npm run check:store` prüft diese Sperre mit fünf gezielten Tests.
Er installiert nichts. Anleitung und Schlüsselablage:
[Android Store-Auslieferung](docs/ANDROID_RELEASES.md). Vorbereitete kopierbare
Feldinhalte: [Store-Texte Deutsch](docs/store-listing-de.md).

Die [Store-Bilder-Werkzeuge](scripts/store_assets/README.md) erzeugen das deutsche
Paket mit Icon, Feature-Grafik, vier Smartphone-Bildern und jeweils zwei echten
Tablet-Aufnahmen. Die Lieferung für Version 1.0.0 (3) liegt unter
`build/store-assets/de-DE/build-3/` mit Vorschau und Upload-Zuordnung.

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

Der [technische Prüfstand](docs/technical-release-readiness.md) hält die aktuellen
Paketprüfungen, verbleibende Sicherheitsmeldungen und die Geräteabnahme fest.

Aktueller Abnahmestand vom 18. Oktober 2026: Der Nutzer hat bestätigt, alle
Funktionen auf dem Smartphone getestet zu haben, und die App für den Store-Auftrag
freigegeben. Die zuvor offenen Abläufe für Kamera-/Galerie-OCR, Berechtigungen,
Erinnerungen, PDF-Teilen sowie alte und neue Sicherungen gelten damit als vom
Nutzer abgenommen. Das ist die Nutzerbestätigung und keine nachträglich behauptete
automatisierte Geräteprüfung. Die folgenden datierten Absätze beschreiben den
jeweiligen früheren Prüfstand.

Der überarbeitete Startbildschirm wurde am 18. Oktober 2026 mit der eigenständigen
Dev-APK in isolierten Emulatoren auf Android 7 und Android 15 geprüft. Das Logo
bleibt bis zur fertigen Übersicht sichtbar, auf Android 15 auch im Dunkelmodus.
Aufzeichnungen liegen lokal unter `build/validation/splash/`. Ein physisches
Telefon war für diese Änderung nicht verbunden. Die APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-start-icon-2026-10-18.apk`.
Der zuvor ausgelieferte Store-Build 3 enthält diese spätere Änderung noch nicht.

Die Dev-APK mit dem Start-Icon wurde anschließend am 18. Oktober 2026 auf dem
wieder verbundenen HONOR BVL-N49 nach Signaturvergleich datenbewahrend installiert
und gestartet. Die Prüfsumme der installierten APK entspricht der Auslieferung.
Der Nutzer hat den neuen Startbildschirm auf diesem Smartphone bestätigt. Die
anschließend beauftragte, signierte und geprüfte Store-Auslieferung liegt unter
`build/releases/production/maschinenlog-1.0.0-build-4-production.aab`.

Am 19. Oktober 2026 wurde auf erneuten Auftrag die Store-Auslieferung mit
Versionscode 5 gebaut und geprüft. Sie enthält denselben Funktionsstand wie
Code 4. Aktuelle Datei:
`build/releases/production/maschinenlog-1.0.0-build-5-production.aab`.
Frühere Auslieferungen bleiben unter ihren bisherigen Dateinamen erhalten.

Die kurze automatisierte Suite prüft exakte Zahlen, OCR-Kandidaten, getrennte Altzähler,
Nachträge, Rücksetzungen, Wechsel, Korrekturen, SQLite-Neuöffnung und einen vollständigen
PDF-/Backup-Ablauf. Die Entschlüsselung wird unabhängig mit Node Crypto geprüft.
Übernommene Galerie- und Backup-Dialogtests sichern weiterhin ihre Kernabläufe ab.
Native JVM-Tests und Lint prüfen das eigene Android-Modul. Wie bei Hausakte werden
zwei bekannte, abstürzende Lint-Analysetasks der SDK-57-Abhängigkeiten ausgenommen.

Bei der Erstumsetzung war kein Android-Gerät verbunden. Deshalb waren echte
Kamera-/Galerie-OCR, Berechtigungsdialoge, Reminder-Zustellung und
der sichtbare App-Start damals noch auf einem Gerät abzunehmen. Es wurden keine
aufwendigen visuellen Testreihen durchgeführt.

Am 12. Oktober 2026 wurde die eigenständige Dev-Version auf einem HONOR BVL-N49
mit Android 16 installiert und per Launcher gestartet. Die JavaScript-Laufzeit
startete erfolgreich, ohne JavaScript-Fehler oder Android-Absturzmeldungen.
Die oben genannten Funktionsabläufe waren zu diesem Zeitpunkt noch offen.

Kurzer manueller Ablauf nach Installation: Zwei getrennte Zähler für Stückzahl und
Betriebsstunden anlegen, einen Stand manuell und einen per Foto bestätigen, einen Nachtrag und
eine Rücksetzung erfassen, eine Ablesung mit Grund korrigieren, Produktions-PDF
öffnen und ein Backup speichern sowie wiederherstellen. Frühere Werte und Fotos
müssen in der Historie erhalten bleiben. Neu erzeugte PDFs enthalten nur die
aktuellen Fotos.

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
Kamera-/OCR-Abläufe waren zu diesem Zeitpunkt noch offen.

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

Die Backup-Optimierung wird lokal mit einer festen synthetischen Sicherung des
bisherigen Codecs, den echten Expo-JavaScript-Schnittstellen an einer durch
Node/OpenSSL ersetzten nativen Grenze und unabhängigen Kompatibilitätsprüfungen
getestet. Die tatsächliche Dauer über die Android-Schnittstellen und die sichtbare
Fortschrittsanzeige waren beim nachfolgenden Gerätetest zu prüfen. Die
optimierte Dev-Version wurde am 16. Oktober 2026 nach erneutem Anschließen
datenbewahrend auf dem HONOR BVL-N49 installiert. Die APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-backup-optimization-2026-10-16.apk`.
Paket, Signatur und Prüfsumme der installierten APK wurden bestätigt.
Der App-Prozess wurde ohne gemeldete Startfehler gestartet. Das Smartphone war
gesperrt. Es wurde kein Backup mit Nutzerdaten erzeugt oder wiederhergestellt.

Die anschließende Korrektur für vollständig abgewartete Dateiverschiebungen und
Kopien ist mit 90 Anwendungstests geprüft und ebenfalls datenbewahrend installiert.
Die aktuelle APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-backup-restore-file-wait-2026-10-16.apk`.
Die Einstellungen mit „Backup wiederherstellen“ wurden auf dem entsperrten
Smartphone geöffnet. Die Wiederherstellung der echten alten Sicherung benötigte
die Passworteingabe durch den Nutzer direkt auf dem Gerät.

Die anschließende technische Prüfung am 16. Oktober 2026 aktualisiert kompatible
Expo-SDK-57-Pakete und behebt die Meldungen für `shell-quote` und `source-map-js`.
Expo-Kompatibilitätsprüfung, Expo Doctor, 90 Anwendungstests, 51 native Tests
und Android-Lint sind erfolgreich. Die neue eigenständige Dev-APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-sdk57-check-2026-10-16.apk` und wurde
datenbewahrend installiert. Signatur, installierte Datei-Prüfsumme und
Prozessstart wurden geprüft. Das Smartphone war gesperrt. Der reale
Funktionsdurchlauf einschließlich der alten und neuen Sicherung war damals offen.
Der [technische Prüfstand](docs/technical-release-readiness.md) beschreibt die
verbleibenden 18 hohen Audit-Einträge aus zwei ungepatchten Build-Abhängigkeiten
und die Grenzen der Bundle-Prüfung.

Die automatische Platzierung der Vorschlagslisten ist am 17. Oktober 2026 mit
96 Anwendungstests geprüft. Auf dem HONOR BVL-N49 wurden Vorschläge unter der
Zählerart und über dem Einheitenfeld, unabhängiges Scrollen bei geöffneter
Tastatur und die Auswahl einer weiter unten liegenden Einheit bestätigt.
Das Formular blieb beim Scrollen der Liste stehen. Es wurde kein Testzähler
gespeichert. Die datenbewahrend installierte Dev-Version liegt unter
`build/dev/maschinenlog-1.0.0-dev-keyboard-suggestions-2026-10-17-final.apk`.
