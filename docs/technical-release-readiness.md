# Technischer Prüfstand

Stand: 16. Oktober 2026. Dieser Stand betrifft die eigenständige Dev-Version
`com.appfactory.maschinenlog.dev`, Version `1.0.0`, Code `1`.
Er ist keine abgeschlossene Store-Freigabe.

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

Vor der Aktualisierung meldete `npm audit --omit=dev` einen kritischen und
20 hoch eingestufte Paketeinträge. Danach melden sowohl `npm audit` als auch
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
Abhängigkeitsbaum und den Aufrufstellen. Die Abwesenheit im neu erzeugten
Dev-JavaScript-Bundle wird zusätzlich anhand seiner Source Map geprüft und unten
festgehalten. Das ist keine allgemeine Entwarnung für die Entwicklungsumgebung
oder eine künftige Store-Datei. Die offenen Meldungen müssen vor dem späteren
Store-Build erneut bewertet und verfügbare kompatible Patches übernommen werden.

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
dokumentiert. Quellen am 16. Oktober 2026 geprüft.

Diese SDK-Verarbeitung muss auch bei der späteren Play-Datensicherheitsangabe
berücksichtigt werden. Eine pauschale Angabe ohne jede Datenerhebung ist durch
die lokale OCR allein nicht begründet. Die Play-Angaben werden erst im
Store-Auftrag ausgefüllt. Die geänderten Webseiten werden nach einem späteren
Push über die vorhandene GitHub-Pages-Konfiguration veröffentlicht.

## Lokale Prüfung und Installation

- `npm run check` erfolgreich. Prettier, ESLint und TypeScript bestanden,
  90 Anwendungstests in zwölf Testdateien erfolgreich.
- `npm run check:native` erfolgreich. 51 JVM-Tests in fünf Klassen erfolgreich,
  eigenes Android-Lint ohne Fehler und mit 33 Warnungen. Dazu gehören
  Aktualisierungshinweise und Warnungen zu Alarmberechtigungen. Das App-Manifest
  enthält `SCHEDULE_EXACT_ALARM`, die normale Planung prüft `canScheduleExact()`
  und fängt Planungsfehler ab. Der ältere Ablauf für das Ausblenden einer
  Testmeldung ist auf Android-Versionen vor API 26 begrenzt. Es wurden keine
  weiteren Lint-Ausnahmen ergänzt. Die zwei bestehenden Ausschlüsse für
  abstürzende Analyse-Tasks von Worklets und Expo Modules Core bleiben bestehen.
- Die Source Map des neu erzeugten `devRelease`-Bundles enthält 2115 Quellen.
  Für `node_modules/shell-quote/`, `source-map-js/`, `node-forge/` und `braces/`
  ist jeweils keine Quelle enthalten. Geprüfte Datei:
  `android/app/build/intermediates/sourcemaps/react/devRelease/index.android.bundle.packager.map`.
- Beide Datenschutz-HTML-Dateien geparst, relative Links und Verweise auf die
  GitHub-README sowie Googles SDK-Datenangaben geprüft. Prettier und
  `git diff --check` bestanden.

Der direkte Gradle-Aufruf `:app:assembleDevRelease` mit
`-PreactNativeArchitectures=arm64-v8a,x86_64 --max-workers=4` war erfolgreich.
Es wurde kein Expo-Prebuild ausgeführt und die versionierte native Konfiguration
blieb unverändert. Die neue eigenständige APK liegt unter
`build/dev/maschinenlog-1.0.0-dev-sdk57-check-2026-10-16.apk` und enthält das
JavaScript-Bundle. Vorhandene benannte APKs wurden nicht überschrieben.

SHA-256 der APK:
`404787b5f8686cf3a95b9eb438366edf12c11775060e8fe618a9ecc13bccf953`.

Die APK wurde auf dem HONOR datenbewahrend mit dem app-eigenen
`install:preview`-Helfer installiert. Vorher wurden Dev-Paket, Version, fehlendes
Debug-Flag, Installer `null` und das zur vorhandenen Installation passende
Zertifikat geprüft. Das Zertifikat besitzt den SHA-256-Fingerabdruck
`a3b1f2a1dd55ba47f87f8735b6ed3490d4b9d57df1ac116ab7122f894174643b`.
Die installierte APK hat die oben genannte identische Datei-Prüfsumme.
Die genaue Dev-Activity wurde gestartet, der neue Prozess lief und sein
AndroidRuntime-/ReactNativeJS-/Expo-Fehlerlog enthielt bei der Startkontrolle keine
Fehler. Ein solcher Startcheck bestätigt keinen vollständigen Funktionsdurchlauf.

## Kurze Geräteabnahme

Das angeschlossene HONOR BVL-N49 mit Android 16 war während der Prüfung und
nach dem Update gesperrt. Deshalb wurden keine UI-Aktionen oder realen
Funktionsdurchläufe ausgeführt. Kamera und Benachrichtigungen waren laut
Paketstatus bereits vor dem Update erlaubt und sind danach weiterhin erlaubt.
Das bestätigt weder die erstmaligen Dialoge noch die tatsächliche Zustellung.
Es wurden keine Nutzerdaten gelöscht und keine Berechtigungen zurückgesetzt.
Die folgenden kurzen Schritte bleiben zur Geräteabnahme offen.

| Ablauf         | Nachweis für die Abnahme                                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kamera-OCR     | Zähler aufnehmen, erkannte Zahl prüfen, vor dem Speichern bestätigen.                                                                                                                          |
| Galerie-OCR    | Ein vorhandenes Foto auswählen, Vorschlag prüfen und bestätigen. Bei fehlender Erkennung muss manuelle Eingabe möglich bleiben.                                                                |
| Berechtigungen | Kamera und Benachrichtigungen prüfen. Ein bereits erteilter Zugriff ist kein Test des erstmaligen Berechtigungsdialogs.                                                                        |
| Erinnerung     | „Erinnerung jetzt testen“ muss eine sichtbare Android-Meldung zustellen. Eine geplante Erinnerung zusätzlich zu ihrem Termin prüfen.                                                           |
| PDF            | Ein Protokoll öffnen und das Android-Teilen-Menü prüfen. Nur aktuelle Fotos dürfen enthalten sein.                                                                                             |
| Alte Sicherung | Vorhandene alte `.mlbackup` in den Einstellungen wiederherstellen. Das reale Passwort wird ausschließlich vom Nutzer am Smartphone eingegeben. Danach Einträge, frühere Fotos und PDFs prüfen. |
| Neue Sicherung | Backup speichern, anschließend wiederherstellen und unveränderte Einträge sowie Dateien prüfen. Ende-zu-Ende-Dauer und Fortschrittsanzeige beobachten.                                         |

Die lokalen Tests mit einer festen alten synthetischen Sicherung und verzögerten
Dateioperationen ersetzen die Wiederherstellung der echten Nutzerdatei auf dem
Smartphone nicht.

## Späterer Store-Auftrag

Store-Signierung, AAB, hochgeladene Versionscodes, Play Console, Inhaltsbewertung,
Testerzugang, Store-Texte und Screenshots bleiben offen. Der Dev-Auftrag verändert
keine Store-Installation und führt keinen Upload oder Push aus.
