# Backup-Optimierung auf dem Smartphone installiert

Den unveränderten App-Stand 8fcc8d5 als eigenständige Dev-APK mit eingebettetem
JavaScript gebaut. Der APK-Build ist für die dauerhaft installierte Preview
nötig. Kein Expo-Prebuild und keine Änderungen an nativen Quellen ausgeführt.
Gradle assembleDevRelease mit arm64-v8a und x86_64 erfolgreich in 38 Sekunden.
Die 86 Anwendungstests, ESLint und TypeScript waren für diesen Code-Stand bereits
im Implementierungsauftrag erfolgreich. Diese Aufgabe ändert nur Dokumentation.

Die eigene benannte APK wurde neu angelegt und kein vorhandenes Artefakt ersetzt.
Vor der Installation Paket com.appfactory.maschinenlog.dev, Version 1.0.0,
Code 1, nicht debuggable und Installer null geprüft. Der Installationshelfer
verglich das Zertifikat der vorhandenen Installation mit der neuen APK und
bestätigte die identische Signatur. Das datenbewahrende Update über
adb install -r -t -g --no-streaming war erfolgreich. Paket, Version, Debug-Flag
und Installer blieben nach der Installation unverändert.

Die Prüfsumme der installierten base.apk entspricht exakt der benannten APK.
MainActivity wurde gestartet, der eigene App-Prozess läuft. Die auf diesen
Prozess begrenzte Logprüfung meldete keine passenden JavaScript-, Modul- oder
Startfehler. Das HONOR BVL-N49 war gesperrt. Keine Entsperrung, UI-Eingabe oder
Erstellung und Wiederherstellung eines Nutzerdaten-Backups durchgeführt.
Sichtprüfung und tatsächlicher Geschwindigkeitsvergleich bleiben offen.

Artefakt: build/dev/maschinenlog-1.0.0-dev-backup-optimization-2026-10-16.apk.
APK-SHA-256: 7b1d623a8c5971a1b53ab72b5fa63bac2f4ed7d29d1e648d336a9bfac8b8ac56.
Zertifikat-SHA-256: a3b1f2a1dd55ba47f87f8735b6ed3490d4b9d57df1ac116ab7122f894174643b.

README aktualisiert. Markdown-Formatierung, beide identischen Changelog-Kopien
und Git-Diff auf Whitespace geprüft. Keine Datenlöschung, kein Store-Build,
keine Store-Installation und kein Push. Lokaler Dokumentationscommit.
