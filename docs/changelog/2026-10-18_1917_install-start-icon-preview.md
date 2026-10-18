# MaschinenLog-Start-Icon auf dem Smartphone installieren

Die bereits geprüfte Dev-APK mit dem neuen Startbildschirm auf dem angeschlossenen
HONOR BVL-N49 aktualisiert. Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0,
Code 3, eigenständige Preview ohne Debug-Flag und ohne Metro. Vor der Installation
wurden vorhandene Version, Paketflags und Installer geprüft. Die Signaturen der
alten und neuen APK stimmen überein. Datenbewahrendes Update über die
Installationshilfe mit `adb install -r -t -g --no-streaming` erfolgreich.

Verwendete APK: `build/dev/maschinenlog-1.0.0-dev-start-icon-2026-10-18.apk`.
Die SHA-256-Prüfsumme der installierten APK entspricht exakt der Auslieferung.
App per Launcher-Intent gestartet und laufenden Prozess bestätigt. Im kurzen
Logcheck des aktuellen Prozesses keine AndroidRuntime- oder ReactNativeJS-Fehler.
Die visuelle Prüfung auf dem Smartphone übernimmt der Nutzer.

Kein neuer Build und keine Versionsänderung erforderlich. Die vorhandene
Store-Installation wurde nicht verändert. Dokumentation und Diff geprüft.
