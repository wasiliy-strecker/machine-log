# Store-Netzwerksperre und OCR-Prüfung

Stand: 18. Oktober 2026. MaschinenLog `1.0.0`, Store-Code `3`,
Paket `com.appfactory.maschinenlog`.

## Umgesetzte Beschränkung

Der Store-Manifest-Overlay entfernt `INTERNET` und `ACCESS_NETWORK_STATE` auch
aus Abhängigkeitsmanifesten. Das app-lokale Expo-Plugin erzeugt den Overlay bei
Prebuild erneut. Die beiden Rechte fehlen in der tatsächlich signierten AAB.
Die eigenständige Dev-Preview verwendet inzwischen dieselbe Sperre. Dev-Debug
behält den Netzwerkzugriff für Metro.
ML Kit und sein mitgeliefertes OCR-Modell wurden nicht ausgetauscht.

Der Release-Prüfer verwirft eine AAB mit einer der beiden Berechtigungen.
Die Gegenprobe mit der unveränderten früheren Code-2-AAB wird erwartungsgemäß
abgelehnt. Fünf Regressionstests unter `npm run check:store` prüfen erlaubte
lokale Rechte, ein leeres Manifest, beide gesperrten Rechte sowie eine
SDK-23-spezifische Berechtigungsdeklaration.

## Gezielter Laufzeitnachweis

Die aus der ausgelieferten AAB erzeugte Universal-APK wurde mit dem bestehenden
app-eigenen Upload-Schlüssel signiert. Eine ebenfalls gleich signierte, temporäre
Instrumentation rief die unveränderte App-Funktion
`CounterOcrKt.recognizeCounter` auf. Es gab keine Testimplementierung anstelle
der tatsächlichen OCR-Funktion.

Umgebung: schreibgeschützter Emulator `pixel_tablet_api35`, API 35, x86_64,
Google Play-Dienste `24.23.35`. Beide Testpakete waren vorher nicht installiert.
Paketkennung, Version 3, fehlendes Debug-Flag und Signatur wurden vor Installation
geprüft. Es wurde kein Smartphone verändert. Der Emulator wurde ohne gespeicherten
Snapshot beendet und seine vorübergehenden Änderungen verworfen.

| Prüfung                               | Ergebnis                                          |
| ------------------------------------- | ------------------------------------------------- |
| Internetrecht im Testprozess          | Verweigert                                        |
| Netzwerkstatusrecht im Testprozess    | Verweigert                                        |
| Synthetisches Zählerfoto `123456`     | `123456` erkannt                                  |
| Leeres Foto                           | Leeres OCR-Ergebnis, kein Fehler                  |
| App-UID, gesendete Bytes vor/nach OCR | `0` / `0`                                         |
| SDK-Transportplanung                  | Wegen fehlendem `ACCESS_NETWORK_STATE` abgewiesen |

Lokaler Ergebnisnachweis mit APK-/AAB-Prüfsummen:
`build/releases/production/maschinenlog-1.0.0-build-3-offline-ocr-check.json`.
Probe-Quelltext, Test-APK, Ergebnis und gefiltertes SDK-Log liegen ignoriert unter
`build/validation/offline-ocr/`. Es wurden ausschließlich synthetische Testbilder
verwendet. Keine echten Ablesungen, Fotos, Backup-Passwörter oder SDK-Kennungswerte
wurden als Testdaten aufgezeichnet.

## Anschließende Dev-Installation auf dem Smartphone

Die eigenständige Dev-Preview wurde am 18. Oktober 2026 ebenfalls mit diesem
Manifest-Overlay gebaut. Das Expo-Plugin erhält den Overlay für `devRelease`,
während das erzeugte Dev-Debug-Manifest weiterhin `INTERNET` für Metro enthält.
Der Dev-Installationshelfer verwirft eigenständige APKs mit Netzwerkrechten.
Die Gegenprobe mit der alten Dev-APK scheitert bereits vor dem Gerätezugriff.

Auf dem HONOR BVL-N49 wurde ausschließlich `com.appfactory.maschinenlog.dev`
von Code 1 auf Code 3 aktualisiert. Vorher waren Version 1.0.0, fehlendes
Debug-Flag und Installer `null` geprüft. Vorhandene und neue Dev-Signatur stimmen
überein. `adb install -r -t -g --no-streaming` erhielt die Installation.
App-UID und Erstinstallationszeit sind unverändert. Beide Netzwerkrechte fehlen
auch im installierten Paket. Die installierte APK besitzt die identische
Dateiprüfsumme der benannten Dev-Auslieferung. Der App-Prozess wurde gestartet,
ohne beobachtete AndroidRuntime-/ReactNativeJS-/Expo-Startfehler. Das Store-Paket
ist auf dem Smartphone nicht installiert.

Auslieferung:
`build/dev/maschinenlog-1.0.0-dev-build-3-offline-2026-10-18.apk`.
Daneben liegen Metadaten und ein lokaler Installationsnachweis.

SHA-256:
`bcaca8791381b37bdc26460d5cef6be013e91a7d7af008d9dfd6cd7d75f93583`.

Der neue Smartphone-Stand kann nun mit Kamera-/Galerie-OCR, Flugmodus, einem
Bild ohne Zahlen und dem externen Datenschutz-Link manuell geprüft werden.
Der bisherige Emulator-Nachweis und seine Grenzen bleiben davon getrennt.

## Grenze der Aussage zur SDK-Telemetrie

Die Berechtigungssperre blockiert eigene Netzwerkverbindungen der Store-App.
Der kurze Lauf belegt funktionierende OCR und 0 gesendete App-Bytes in genau
dieser Umgebung. Er ist keine vollständige Netzwerkprüfung aller Geräte und
keine Zuordnung des Verkehrs des separaten Google-Play-Dienste-Prozesses.

Die tatsächlich aufgelöste Abhängigkeit
`play-services-mlkit-text-recognition-common:19.1.0` enthält in
`TextRecognizerTaskWithResource` einen Aufruf von `zzue.zzc()`. Dieser verwendet
`TelemetryLogging.getClient()` und `TelemetryLoggingClient.log()`. Der Aufruf
ist deshalb als SDK-Codepfad vorhanden. Seine Existenz allein beweist keinen
erfolgreichen Upload. Die 0-Byte-Messung des App-UID beweist umgekehrt keine
vollständige Deaktivierung dieses getrennten Weges.

Es wurde kein SDK durch Reflection, manipulierte Google-APIs oder Bytecode-Patches
verändert. Ein offizieller vollständiger Telemetrie-Aus-Schalter wurde nicht
ergänzt. Die Datenschutzseiten bleiben deshalb bei einer abgegrenzten Aussage
zur Netzwerksperre und behalten die allgemeinen SDK-Datenangaben.

Die Angabe „keine Datenerhebung“ im Play-Formular darf nicht ausschließlich aus
den entfernten Netzwerkrechten oder dem Vorhandensein des lokalen Modells
abgeleitet werden. Google zählt tatsächlich übertragene SDK-Daten mit. Eine
pauschale No-Freigabe wurde durch diese Prüfung nicht nachgewiesen.

Quellen, am 18. Oktober 2026 geprüft:

[Android-Netzwerkberechtigung](https://developer.android.com/reference/android/Manifest.permission#INTERNET),
[gebündelte ML-Kit-Texterkennung](https://developers.google.com/ml-kit/vision/text-recognition/v2/android),
[SDK-Datenangaben](https://developers.google.com/ml-kit/android-data-disclosure),
[Play-Datensicherheitsangaben](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
