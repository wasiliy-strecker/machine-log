# Android Store-Auslieferung

MaschinenLog ist ein eigenständiges React-Native-/Expo-Projekt. Das Verfahren
folgt den Dev-/Store-Konventionen der Flutter-Apps dieses Workspace, verwendet
aber den eigenen Gradle-Build. Nachbarprojekte und deren Schlüssel bleiben unverändert.

## Identität und erste Version

| Variante | Paketkennung                      | Name             | Verwendung                                   |
| -------- | --------------------------------- | ---------------- | -------------------------------------------- |
| Dev      | `com.appfactory.maschinenlog.dev` | MaschinenLog Dev | Lokale Tests und datenbewahrende APK-Updates |
| Store    | `com.appfactory.maschinenlog`     | MaschinenLog     | Interne Play-Tests und Produktion            |

Die aktuelle Auslieferung verwendet Version `1.0.0`, Versionscode `5`.
Die früheren benannten Auslieferungen mit Code `2`, `3` und `4` bleiben unverändert
erhalten. Code `5` enthält wie Code `4` den auf dem Smartphone bestätigten
App-Start mit Icon. Die erneute Auslieferung erhöht nur den Versionscode.
Die App wurde inzwischen vom Nutzer in der Play Console angelegt. Ein Upload
oder eine Veröffentlichung durch den Agenten ist nicht erfolgt. Vor einem
weiteren Upload den tatsächlichen Console-Stand prüfen.

Store-Debug ist deaktiviert. Die Store-Version benötigt einen eigenen privaten
Upload-Schlüssel. Es gibt keinen Rückfall auf Debug-Signierung oder unsignierte
Auslieferungen. Die Dev-App bleibt parallel installiert und hat getrennte Daten.
Eine AAB-Erstellung installiert nichts und benötigt kein Smartphone.

## Private Signierung

Die app-eigenen Dateien liegen unter
`~/.local/share/app-factory/signing/maschinenlog/`:

`upload-keystore.p12` enthält den privaten RSA-4096-Upload-Schlüssel mit Alias
`upload`. `key.properties` enthält die privaten Zugangsdaten. Das Verzeichnis ist
mit Modus `0700` geschützt, Schlüssel und Zugangsdaten mit `0600`.
`upload-certificate.pem` ist das öffentliche Zertifikat.

`android/key.properties` ist ein ignorierter Link zur privaten Konfiguration.
Vorlage ohne Zugangsdaten: `android/key.properties.example`. Bei einer neuen
Entwicklungsumgebung die vorhandenen privaten Dateien sicher übernehmen.
Keinen neuen Schlüssel als vermeintlichen Ersatz für einen bereits registrierten
Upload-Schlüssel erzeugen. Diese Dateien separat und privat sichern.

Das Expo-Plugin kopiert die Store-Gradle-Konfiguration und die Beispielkonfiguration
bei einem Prebuild erneut nach `android/`. Wenn die app-eigene private Konfiguration
am Standardort vorhanden ist, stellt es den Link wieder her. Die Schlüssel bleiben
auch bei einem neu erzeugten Android-Verzeichnis erhalten. Änderungen an
`plugins/store-signing.gradle` immer auch nach `android/app/store-signing.gradle`
übernehmen. Der Release-Helfer vergleicht beide Dateien.

In der Play Console Play App Signing für die neue App einrichten. Der lokale
Schlüssel signiert die Upload-AAB. Google signiert später die ausgelieferten APKs
mit dem App-Signaturschlüssel. Abweichende Fingerabdrücke sind dabei normal.
Quelle: [Android App Signing](https://developer.android.com/studio/publish/app-signing).

## Neuen Upload bauen

Vor jedem weiteren Upload den höchsten bekannten oder hochgeladenen Versionscode
prüfen. `android.versionCode` in `app.config.ts` und `versionCode` in
`android/app/build.gradle` gemeinsam erhöhen. Die Marketingversion nur bei Bedarf
in App-Konfiguration, Gradle und npm-Metadaten ändern.

```bash
npm ci
npm run check
npm run check:native
npm run check:store
npx expo install --check
npx expo-doctor
npm audit
npm audit --omit=dev
npm run build:store
```

Audit-Meldungen müssen bewertet werden. Ein Exitcode 1 wegen der dokumentierten
Build-Werkzeug-Advisories darf nicht als sauberer Audit ausgegeben werden.
Aktuelle Bewertung und Geräteabnahme stehen im
[technischen Prüfstand](technical-release-readiness.md).

Voraussetzungen sind die Entwicklungswerkzeuge aus der README, Python 3,
OpenSSL und `bundletool-all-1.18.3.jar` unter
`~/.local/share/app-factory/tools/`. Alternativ `BUNDLETOOL_JAR` auf die passende
Datei setzen. Der Helfer baut direkt `:app:bundleStoreRelease` mit eingebettetem
Produktions-JavaScript für `arm64-v8a` und `x86_64`. Er startet keinen Expo-Prebuild
und installiert keine APK. Zusätzliche Gradle-Argumente sind nicht zugelassen.

## Prüfung und benannte Auslieferung

`scripts/verify_store_aab.py` prüft mit Bundletool und Jarsigner die konkrete AAB.
Er kontrolliert Paket, Version, Store-Name, Target API 36, fehlende Debug-/Testflags,
deaktiviertes Systembackup und das eigene öffentliche Upload-Zertifikat.
Ab Code 3 müssen außerdem `INTERNET` und `ACCESS_NETWORK_STATE` fehlen, auch
bei SDK-spezifischen Berechtigungsdeklarationen. Das Expo-Plugin erhält den
Overlay unter `android/app/src/store/AndroidManifest.xml`. Dev bleibt unverändert.
Der Helfer vergleicht den Overlay mit seiner Vorlage unter `plugins/`.
JavaScript und das gebündelte OCR-Modell müssen enthalten sein. Die Bundle-
Konfiguration muss 16-KB-ZIP-Ausrichtung verlangen und alle enthaltenen nativen
Bibliotheken müssen entsprechend ausgerichtete ELF-Ladesegmente besitzen.
Quelle: [Android 16-KB-Unterstützung](https://developer.android.com/guide/practices/page-sizes).

Die Store-Source-Map wird auf die vier im Prüfstand bewerteten npm-Pakete geprüft.
Dies prüft deren Abwesenheit im JavaScript-Bundle und ist keine vollständige
Sicherheitsbewertung sämtlicher nativer Bibliotheken.

Erst danach legt der Helfer die benannte Auslieferung an:

```text
build/releases/production/maschinenlog-1.0.0-build-5-production.aab
```

Daneben liegt eine JSON-Prüfdatei mit SHA-256, Upload-Zertifikat-Fingerabdruck,
Metadaten und Prüfergebnissen. Vorhandene benannte Auslieferungen werden nicht
überschrieben. Die generierte Datei unter `android/app/build/outputs/bundle/`
ist kein dauerhafter Übergabepfad. Build-Dateien und Signaturmaterial bleiben
außerhalb von Git.

## Übergabe an die Play Console

Die vorbereiteten Feldinhalte stehen in [Store-Texte Deutsch](store-listing-de.md).
Die Datenschutzerklärung ist
`https://wasiliy-strecker.github.io/machine-log/datenschutz/`.
Bei der Datensicherheit die tatsächlichen technischen SDK-Daten aus den
[ML-Kit-Datenangaben](https://developers.google.com/ml-kit/android-data-disclosure)
berücksichtigen. Lokale Verarbeitung der Fotos bedeutet keine pauschale
Abwesenheit jeder SDK-Datenübertragung. Der konkrete OCR-Lauf ohne
Netzwerkberechtigung und die Grenzen der Telemetrieprüfung stehen in
[Store-Netzwerksperre und OCR-Prüfung](store-offline-verification.md).

Die Nutzerabnahme gilt für die zuletzt installierte Dev-Version. Der Store-Build
verwendet dieselbe Fachlogik, aber eine eigene Identität und Signatur. Ein erster
Play-Test prüft zusätzlich Installation und Start des von Play erzeugten Pakets.
Die Dev-Installation wird dafür weder ersetzt noch gelöscht. Datenübernahme ist
ein eigener Vorgang und nicht Teil des AAB-Builds.

Ein Build oder Git-Push veröffentlicht die App nicht. Console-Formulare,
rechtliche Erklärungen, Testerfreigabe und Veröffentlichung werden mit dem
Kontoinhaber durchgegangen. Upload und Veröffentlichung erfolgen nur nach Auftrag.
