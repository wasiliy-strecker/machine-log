# Dateiverschiebungen vor der Backup-Prüfung abwarten

Der letzte Smartphone-Screenshot zeigte einen Abbruch beim Speichern der bereits
entschlüsselten und geprüften Backup-Dateien. Das Backup-Format war nicht die
Ursache. Expo File.move ist asynchron, ExpoVault.put hatte den Abschluss jedoch
nicht abgewartet. Die neue schnelle Prüfung konnte deshalb die noch nicht
vorhandene Zieldatei als fehlgeschlagenen Schreibvorgang behandeln.

ExpoVault wartet jetzt die Dateiverschiebung ab. Asynchrone Fehler werden wieder
vom vorhandenen Fehlerpfad erfasst und die temporäre Datei aufgeräumt. Dieselbe
Ursache bei File.copy für geteilte Backups, benannte Einzel-PDFs und mehrteilige
PDFs korrigiert. Jede Kopie wird vor dem Weitergeben vollständig fertiggestellt.
Integritätsprüfungen, Backup-Format, Verschlüsselung, Datenübernahme und
Sicherungsumfang bleiben unverändert. Keine neue Abhängigkeit und keine
Änderung an nativen Quellen oder Nachbarprojekten.

Vier gezielte Regressionstests schlugen vor der Korrektur fehl und bestehen
danach. Sie steuern verzögerte und abgelehnte Expo-Dateioperationen über echte
lokale Testdateien. Eine feste alte synthetische Sicherung wird über ExpoVault,
MachineService und SQLite vollständig wiederhergestellt. Die Tests prüfen auch
Fehlerbereinigung sowie das Teilen erst nach dem Abschluss der jeweiligen Kopie.
npm run check erfolgreich mit Prettier, ESLint, TypeScript und 90 Tests.

Dev-APK mit eingebettetem JavaScript erfolgreich in 26 Sekunden gebaut. Der
Installationshelfer prüfte Paket com.appfactory.maschinenlog.dev, Version 1.0.0,
Code 1, nicht debuggable, Installer null und die passende bestehende Signatur.
Datenbewahrendes Update über adb install -r -t -g --no-streaming erfolgreich.
Die installierte APK hat dieselbe Prüfsumme wie das benannte Artefakt.
App-Prozess gestartet und keine passenden Startfehler gemeldet. Auf dem
entsperrten Smartphone die Einstellungen geöffnet und die sichtbare Aktion
Backup wiederherstellen bestätigt. Keine Passwörter ausgelesen oder eingegeben.
Der Import der echten Sicherung benötigt die Passworteingabe durch den Nutzer.

Artefakt: build/dev/maschinenlog-1.0.0-dev-backup-restore-file-wait-2026-10-16.apk.
APK-SHA-256: 6e6fe7d29fd590c2166e2b93c545cd92f72165d334beec4a12f5ef1144fe9b26.

README und beide Changelog-Kopien aktualisiert, formatiert und auf Whitespace
geprüft. Kein Store-Build, keine Deinstallation, keine Datenlöschung und kein
Push. Lokaler Commit nach erfolgreicher Prüfung.
