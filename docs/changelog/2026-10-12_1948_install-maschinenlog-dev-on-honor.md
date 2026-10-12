# MaschinenLog Dev auf dem angeschlossenen HONOR installiert

Auf Nutzerauftrag die eigenständige Smartphone-Testversion aus dem aktuellen
Stand neu gebaut und auf einem HONOR BVL-N49 mit Android 16 installiert.
Vorher keine Installation von `com.appfactory.maschinenlog.dev` vorhanden.
Laufzeitcode und native Konfiguration bleiben unverändert.

## Build und Installation

`assembleDevRelease` für arm64-v8a und x86_64 erfolgreich.
Version 1.0.0 mit Code 1, Label MaschinenLog Dev und Paket
`com.appfactory.maschinenlog.dev`. Der Build ist nicht debuggable und enthält
JavaScript für den Start ohne Metro. Die eigene Dev-Signatur wurde geprüft.
Die Installation erfolgte mit dem app-lokalen Installationshelfer und
`adb install -r -t -g --no-streaming`. Der Installer wird von Android als
`null` gemeldet. Anschließend die MainActivity per Launcher-Intent gestartet.

App-Prozess und JavaScript-Laufzeit laufen. Keine JavaScript-Fehler oder
Android-Absturzmeldungen beim Start. Der Gerätebildschirm war gesperrt.
Die sichtbare Oberfläche und Kamera-/OCR-Abläufe bleiben zur Nutzerabnahme offen.
Keine aufwendigen visuellen Tests, kein Store-Build und kein Push.

## Artefakt und Dokumentation

Benannte APK unter `build/dev/maschinenlog-1.0.0-dev-2026-10-12.apk`.
Die frühere benannte Auslieferung bleibt erhalten. APKs und private Schlüssel
werden nicht versioniert.

SHA-256: `c69a59fa0e35895dc64d35fd243d3756140326150c16368de53a278c46eca722`.

README um die Geräteinstallation ergänzt. Nur Dokumentation geändert.
Formatierung und Diff geprüft. Keine erneute Anwendungstestsuite erforderlich.
