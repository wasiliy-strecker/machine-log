# Technischer Prüfstand

Stand: 18. Oktober 2026. Die Store-AAB für `com.appfactory.maschinenlog`,
Version `1.0.0`, Code `4`, ist lokal gebaut, signiert und geprüft.
Die Nutzerabnahme der zuletzt installierten Dev-Version ist bestätigt.
Die App ist in der Play Console angelegt. Der Agent hat weder einen Upload
noch eine Veröffentlichung durchgeführt.

## Abhängigkeiten

Expo bleibt auf SDK 57. Die kompatiblen Aktualisierungen umfassen Expo
`57.0.30`, Asset `57.0.20`, Constants `57.0.22`, Crypto `57.0.4`, Dev Client
`57.0.20`, Image Manipulator `57.0.21`, Linking `57.0.13`, Router `57.0.28`,
Sharing `57.0.23`, Splash Screen `57.0.10` und SQLite `57.0.4`.
React Native bleibt auf `0.86.3` und React auf `19.2.3`.

`npx expo install --check` meldet passende Abhängigkeiten. `npx expo-doctor`
`1.21.5` besteht 20 von 20 Prüfungen. Der bereits vorhandene Ausschluss von
`appConfigFieldsNotSyncedCheck` bleibt bestehen, weil `android/` versioniert und
die native Konfiguration app-lokal gepflegt wird. Das ersetzt keinen Vergleich
der tatsächlich gebauten Paketkennung, Version und Signatur.

## Sicherheitsprüfung

Vor der Abhängigkeitsaktualisierung am 16. Oktober meldete `npm audit --omit=dev` einen kritischen und
20 hoch eingestufte Paketeinträge. Bei der erneuten Prüfung am 18. Oktober melden sowohl `npm audit` als auch
`npm audit --omit=dev` keinen kritischen und 18 hoch eingestufte Einträge.
Der Audit-Befehl endet wegen dieser verbleibenden Meldungen weiterhin mit Code 1.
Diese Einträge enthalten die übergeordneten Pakete der betroffenen
Abhängigkeitsketten. Es sind zwei verbleibende Ursachen, keine 18 unabhängigen
Sicherheitslücken. Es gibt keine Audit-Unterdrückung.

| Paket und Advisory                                                                           | Ergebnis                                                           | Verwendung und Auslöser                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shell-quote`, [GHSA-pqg4-j6r4-53mv](https://github.com/advisories/GHSA-pqg4-j6r4-53mv)      | Von `1.10.0` auf `1.12.0` aktualisiert. Kritische Meldung behoben. | Transitiv über `react-native → react-devtools-core`.                                                                                                                                                                                                                                                                                                                            |
| `source-map-js`, [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)    | Von `1.2.1` auf `1.2.2` aktualisiert. Meldung behoben.             | Transitiv über `expo → @expo/metro-config → postcss`.                                                                                                                                                                                                                                                                                                                           |
| `node-forge@1.4.0`, [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Offen. Am Prüftag keine gepatchte Version veröffentlicht.          | `expo → @expo/cli → @expo/code-signing-certificates → node-forge` und direkt aus der CLI. Betroffen ist RSA-Signaturprüfung mit präparierten Daten und kleinen RSA-Exponenten. Die installierte CLI verwendet die Bibliothek für Entwicklungs-/Update-Zertifikate und iOS-Werkzeuge. Die Zertifikatshilfe ruft tatsächlich `certificate.verify()` und `publicKey.verify()` auf. |
| `braces@3.0.3`, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)     | Offen. Am Prüftag keine gepatchte Version veröffentlicht.          | Unter anderem `expo → @expo/metro → metro-file-map → micromatch → braces`. Tief verschachtelte Glob-Muster können den Node-Prozess beenden. Das betrifft Musterverarbeitung beim Bauen und Entwickeln. Die App verarbeitet keine Zählereingaben als solche Build-Muster.                                                                                                        |

Die Einordnung als Build-Werkzeuge ergibt sich aus dem installierten
Abhängigkeitsbaum und den Aufrufstellen. Die Abwesenheit im tatsächlich erzeugten
Store-JavaScript-Bundle ist zusätzlich anhand seiner Source Map geprüft und unten
festgehalten. Das ist keine allgemeine Entwarnung für die Entwicklungsumgebung
oder sämtliche nativen Bibliotheken. Auch am 18. Oktober liefern npm und die
Advisories keine gepatchte Version für die beiden verbleibenden Ursachen.
Vor künftigen Uploads erneut prüfen und verfügbare kompatible Patches übernehmen.

Die von npm vorgeschlagenen erzwungenen Wechsel auf Expo 44 beziehungsweise
ältere React-Native-Pakete werden nicht angewendet. Sie sind keine kompatible
Reparatur dieses SDK-57-Projekts. Die vorhandenen Overrides bleiben unverändert.

## ML Kit und Datenschutz

Das eigene native Modul verwendet `com.google.mlkit:text-recognition:16.0.1`
mit gebündeltem lateinischen Modell. Es wird kein OCR-Backend ergänzt.
Die deutschen und englischen Datenschutzseiten benennen die technischen
SDK-Datenkategorien genauer und verlinken Googles
[Android-Datenangaben](https://developers.google.com/ml-kit/android-data-disclosure).
Die Aussage zur lokalen Verarbeitung der Bilder und Ergebnisse folgt den
[ML-Kit-Datenschutzhinweisen](https://developers.google.com/ml-kit/terms).
Die konkrete gebündelte Integration ist in der
[Android-Anleitung](https://developers.google.com/ml-kit/vision/text-recognition/v2/android)
dokumentiert. Quellen am 18. Oktober 2026 erneut geprüft.

Diese SDK-Verarbeitung muss auch bei der späteren Play-Datensicherheitsangabe
berücksichtigt werden. Eine pauschale Angabe ohne jede Datenerhebung ist durch
die lokale OCR allein nicht begründet. Die Play-Angaben werden im
geführten Console-Ablauf ausgefüllt.

Die früheren Fassungen vom 16. Oktober wurden nach dem ersten GitHub-Push
mit HTTP 200 und Inhaltsgleichheit geprüft. Die aktuellen Fassungen vom 18. Oktober
benennen zusätzlich die Store-Netzwerksperre und deren Grenzen. Beide sind nach
dem Push mit HTTP 200 erreichbar und bytegleich mit den lokalen Quellen geprüft.
Die öffentlichen Adressen bleiben:
[Deutsch](https://wasiliy-strecker.github.io/machine-log/datenschutz/) und
[Englisch](https://wasiliy-strecker.github.io/machine-log/privacy/).
Der frühere lokale Nachweis liegt unter
`build/releases/production/maschinenlog-1.0.0-build-2-privacy-check.json`.
Der aktuelle Nachweis liegt unter
`build/releases/production/maschinenlog-1.0.0-build-3-privacy-check.json`.

## Bestätigte Geräteabnahme

Der Nutzer bestätigte vor der Store-Beauftragung, alle Funktionen auf dem
Smartphone getestet zu haben und die App als fertig anzusehen. Damit sind die
zuvor offenen Abläufe für Kamera-/Galerie-OCR, Berechtigungen, tatsächliche
Erinnerungszustellung, PDF-Teilen sowie alte und neue Backups als Nutzerabnahme
abgeschlossen. Es handelt sich um die Nutzerbestätigung, nicht um einen vom
Agenten beobachteten vollständigen Durchlauf oder eine neue visuelle Testreihe.

Den anschließend ergänzten Startbildschirm mit dem vorhandenen Zahnrad-Icon
hat der Nutzer auf dem HONOR BVL-N49 ebenfalls bestätigt und danach den neuen
Store-Build 4 beauftragt. Der native Start und der Ladezustand verwenden dasselbe
Motiv. Die fertige App blendet in 180 Millisekunden ein. Zuvor wurden Kaltstarts
auf isolierten Android-7- und Android-15-Emulatoren sowie Android 15 im Dunkelmodus
geprüft. Die installierte Dev-Version enthält bereits genau diese Änderung.

Die damaligen Hinweise vom 16. Oktober beschrieben ein gesperrtes Smartphone und
fehlende manuelle Prüfungen zu diesem Zeitpunkt. Sie sind kein aktueller offener
Release-Blocker mehr. Die historischen Dev-Installationen stehen weiterhin in
der README. Bei diesem Store-Auftrag wurde die Dev-App nicht verändert, gestartet,
neu installiert oder gelöscht. Es wurden keine Gerätedaten übernommen.

## Lokale Release-Prüfungen

`npm run check` erfolgreich. Prettier, ESLint und TypeScript bestanden.
98 Anwendungstests in 13 Testdateien erfolgreich.

`npm run check:native` erfolgreich. 51 JVM-Tests in fünf Klassen bestanden.
Das eigene Android-Lint meldet 0 Fehler und 33 Warnungen. Dazu gehören
Aktualisierungshinweise und Alarmberechtigungen. Die vorhandenen zwei Ausschlüsse
für abstürzende Debug-Analysetasks von Worklets und Expo Modules Core bleiben
unverändert. Es wurden keine neuen Lint-Ausnahmen ergänzt.

Der tatsächliche Store-Build `:app:bundleStoreRelease` einschließlich
`lintVitalStoreRelease` ist ohne zusätzliche Task-Ausschlüsse erfolgreich.
Der Helfer baut direkt mit Produktions-JavaScript für `arm64-v8a` und `x86_64`.

Die Expo-Neuerzeugung wurde geprüft. App-Kennung, Version, Flavor-Trennung,
Store-Signierungsdatei und Beispielkonfiguration bleiben erhalten. Der ignorierte
Link zur privaten Konfiguration wird aus dem app-eigenen externen Standardpfad
wiederhergestellt. Im generierten App-Gradle steht genau ein Store-Signierungshook.
Eine temporär ausgeblendete private Konfiguration blockiert Store-Tasks wie
vorgesehen. Der Link wurde anschließend wiederhergestellt.

Die numerische ELF-Prüfung akzeptiert 16-KB-Ladesegmente und verwirft 4-KB-
Ausrichtung, Null-Ausrichtung sowie nicht zueinander passende Datei-/Speicher-
Offsets. Die zusätzlichen Gegenproben verwerfen eine falsche Version und ein
abweichendes Zertifikat. Ein erneuter Helferaufruf verweigert die vorhandene
benannte Auslieferung bereits vor Gradle. Ihre Prüfsumme bleibt unverändert.

## Store-Netzwerksperre und OCR

Code 3 entfernt `INTERNET` und `ACCESS_NETWORK_STATE` nur im Store-Flavor.
Die Berechtigungen fehlen nachweislich in der signierten AAB. Die unveränderte
frühere AAB mit Code 2 wird vom erweiterten Release-Prüfer abgelehnt.
`npm run check:store` besteht fünf gezielte Regressionstests.

Aus der ausgelieferten AAB wurde mit Bundletool eine gleich signierte Universal-
APK erzeugt und ausschließlich in einem temporären schreibgeschützten Emulator
mit Android API 35 geprüft. Die echte native Funktion `recognizeCounter`
erkannte ein synthetisches Foto mit `123456`. Ein leeres Foto lieferte ein leeres
Ergebnis. Beide Netzwerkrechte waren verweigert, der App-UID-Zähler blieb bei
0 gesendeten Bytes. Der SDK-Transport meldete fehlendes `ACCESS_NETWORK_STATE`.
Es wurde keine Smartphone-App installiert oder verändert.

Die SDK-Bytecodeprüfung zeigt weiterhin einen `TelemetryLoggingClient`-Aufruf
in der Texterkennung. Die Messung am App-UID beweist keine vollständige
Abschaltung möglicher Wege über Google Play-Dienste. Deshalb ist das Entfernen
der Berechtigungen allein keine Freigabe für eine pauschale No-Angabe im
Datensicherheitsformular. Einzelheiten und lokale Nachweise:
[Store-Netzwerksperre und OCR-Prüfung](store-offline-verification.md).

## Geprüfte Store-Datei

Benannte Auslieferung:
`build/releases/production/maschinenlog-1.0.0-build-4-production.aab`.
Daneben liegt die JSON-Prüfdatei. Reproduktionsanleitung:
[Android Store-Auslieferung](ANDROID_RELEASES.md).

| Eigenschaft          | Ergebnis                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Paketkennung         | `com.appfactory.maschinenlog`                                                                |
| App-Name             | `MaschinenLog`                                                                               |
| Version              | `1.0.0` mit Code `4`                                                                         |
| Android              | Minimum API 24, Target API 36                                                                |
| Debug/Test-only      | Deaktiviert                                                                                  |
| Android-Systembackup | Deaktiviert                                                                                  |
| Signatur             | App-eigener privater RSA-4096-Upload-Schlüssel, Bundletool und Jarsigner erfolgreich         |
| Native Plattformen   | ARM64 und x86_64                                                                             |
| Native 16-KB-Prüfung | Alle 46 Bibliotheken besitzen passende ELF-Ladesegmente. Bundle fordert `PAGE_ALIGNMENT_16K` |
| JavaScript           | Im Store-Bundle enthalten                                                                    |
| Zahlen-OCR           | Lateinisches ML-Kit-Modell im Bundle enthalten                                               |

SHA-256 der AAB:
`5e6d4e8320e35d0b31142d6a15feb21648794173f0ab52e685ee636c9e6287f6`.

SHA-256 des öffentlichen Upload-Zertifikats:
`567749b56beef37de6f131f8410377ccd977d1b8add7e60052ccd389a8acb714`.

Die Store-Source-Map enthält 2118 Quellen. Für
`node_modules/shell-quote/`, `source-map-js/`, `node-forge/` und `braces/`
ist jeweils keine Quelle enthalten. Geprüfte Datei:
`android/app/build/intermediates/sourcemaps/react/storeRelease/index.android.bundle.packager.map`.

Die fünf Startbild-Ressourcen in der signierten AAB stimmen pixelgenau mit den
geprüften Dev-Ressourcen überein. Das frühere transparente Ersatzmotiv ist nicht
mehr enthalten. Die Auslieferungen mit Code 2 und 3 wurden über ihre SHA-256-
Prüfsummen als unverändert bestätigt. Lokale Nachweise und Audit-Berichte dieses
Builds liegen unter `build/validation/release-4/`.

Die Target-API wurde aus der konkreten AAB gelesen und entspricht den
[aktuellen Play-Vorgaben für neue Android-Apps](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en).
Die 16-KB-Prüfung folgt den
[Android-Hinweisen zu ELF- und ZIP-Ausrichtung](https://developer.android.com/guide/practices/page-sizes).
Dies ist eine statische Artefaktprüfung, kein beobachteter Start auf einem Gerät
mit 16-KB-Speicherseiten.

## Verbleibende Console-Schritte

Die technische Store-Datei liegt vor und die App wurde angelegt. Vor
Veröffentlichung folgen Store-Eintrag mit Grafiken und Screenshots, die tatsächlichen Console-Formulare,
Play App Signing, Testzugang und Upload. Der erste Play-Test prüft zusätzlich
Installation und Start der von Play erzeugten Store-App mit eigener Identität.
Die Dev-App bleibt parallel bestehen.

Vorbereitete kopierbare Feldinhalte stehen in
[Store-Texte Deutsch](store-listing-de.md). Es wurde weder ein Bundle hochgeladen
noch eine App veröffentlicht. Rechtsverbindliche Erklärungen und Freigaben trifft
der Kontoinhaber im geführten Console-Ablauf.
