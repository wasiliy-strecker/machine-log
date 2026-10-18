# MaschinenLog mit App-Icon starten

Den bisher absichtlich leeren Android-Startbildschirm durch das vorhandene
Zahnrad-Icon auf dem türkisen Markenhintergrund ersetzt. Expo erzeugt die
passenden Auflösungen aus dem vorhandenen transparenten Icon. Die native
Kompatibilitätsdarstellung bleibt für ältere Android-Versionen erhalten.
Die Ladeansicht verwendet dasselbe Icon. Nach dem bisherigen Bereitschaftssignal
folgt eine Überblendung von 180 Millisekunden ohne zusätzliche Mindestwartezeit.

Prüfung: `npm run check` mit 98 erfolgreichen Anwendungstests, Formatierung,
ESLint und TypeScript. `npm run check:native` mit 51 erfolgreichen JVM-Tests und
Android-Lint. `npm run build:preview` erfolgreich. Das gesamte Motiv passt in
allen fünf Auflösungen in die Android-Splash-Maske. Die tatsächlichen Kaltstarts
wurden auf isolierten Android-7- und Android-15-Emulatoren aufgezeichnet und
visuell geprüft. Android 15 zusätzlich im Dunkelmodus. Logo bis zur fertigen
Übersicht sichtbar. Keine AndroidRuntime- oder ReactNativeJS-Fehler im Logcheck.

Die datenbewahrende Installationshilfe hat Paket, Version, eingebettetes
JavaScript, fehlendes Debug-Flag und Netzwerksperre vor der Emulator-Installation
geprüft. Auf beiden eigens angelegten Emulatoren bestand keine frühere
Installation. Ein physisches Telefon war nicht verbunden.

Dev-APK: `build/dev/maschinenlog-1.0.0-dev-start-icon-2026-10-18.apk`.
Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 3.
Vorschau und Startaufzeichnungen unter `build/validation/splash/`.
Store-Build 3 enthält die spätere Splash-Änderung noch nicht. Keine neue
Store-AAB erstellt und keine Versionsnummer erhöht. Temporäre Emulatoren nach
der Prüfung beendet und entfernt.
