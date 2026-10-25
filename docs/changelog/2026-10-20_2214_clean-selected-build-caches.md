# Ausgewählte Build-Zwischenstände, Website-Prüfkopien und SQL-Backups bereinigt

Auf ausdrücklichen Nutzerauftrag die geprüften MaschinenLog- und
Contest-Gallery-App-Build-Zwischenstände, die erzeugten Prüfkopien der
Appfabrik-Website und genau vier ältere SQL-Backups entfernt.

## Umfang und Ergebnis

| Bereich             | Entfernt                                                       | Freigegebene Bytes |
| ------------------- | -------------------------------------------------------------- | -----------------: |
| MaschinenLog        | 30 Ziele mit Android-, Gradle- und CMake-Build-Zwischenständen |         4838498304 |
| Contest Gallery App | 18 Ziele mit Flutter-, Test- und Android-Build-Zwischenständen |         2401165312 |
| Appfabrik-Website   | Vier Verzeichnisse mit erzeugten Prüfkopien                    |         3902177280 |
| SQL-Backups         | Vier Dumps vom 10. bis 13.10.2026                              |          377339904 |

Zusammen sind das 11519180800 Bytes, rund 11,52 GB. Die Bilanz berücksichtigt
Hardlinks und verbleibende externe Verknüpfungen. Nach der Bereinigung wurden
rund 13,8 GB freier Speicher auf dem Ubuntu-Laufwerk gemessen. GB-Angaben
verwenden die dezimale Einheit.

Die Website-Prüfung lief zu Beginn noch. Zuerst die beiden Apps und SQL-Backups
bereinigt und mit der Website gewartet, bis deren Prüfung beendet war.
Die Prüfkopien waren bis dahin auf rund 3,90 GB angewachsen. Entfernt wurden
ausschließlich `.cache/verification`, `.cache/checks`, `.cache/flutter_check`
und `.cache/basic-verification`. Die Website-Werkzeuge und übrigen Cache-Dateien
bleiben erhalten.

## Erhaltene Dateien und Prüfung

Quelltexte, installierte Abhängigkeiten, Konfigurationen, Signierschlüssel,
fertige Dev-APKs, benannte Store-AAB-Auslieferungen, Store-Materialien,
Prüfdateien und Ausgabeordner der Apps bleiben erhalten. Die erzeugte
Zwischen-AAB in MaschinenLogs `intermediates` war Teil der freigegebenen
Build-Zwischenstände. Keine installierten Apps oder Gerätedaten verändert.
SerienLog, ModellbauLog und gemeinsame Gradle-Caches wurden nicht bereinigt.

Vor jeder Bereinigung keine versionierten Dateien innerhalb der Löschziele
und keine laufenden Prozesse oder offenen Zugriffe auf diese Ziele festgestellt.
Alle 52 freigegebenen App- und Website-Ziele sind entfernt. Inhalte
beziehungsweise Symlink-Ziele und Dateimodi von 57183 geschützten Dateien
vor und nach den drei Bereinigungsschritten verglichen. Keine Abweichungen.
Branch, HEAD und Arbeitsstand der jeweils betroffenen Repositories blieben
während ihrer Bereinigung unverändert.

Genau sieben SQL-Dumps vom 14. bis 20.10.2026 bleiben erhalten. Kopfzeilen und
Abschlussmarker geprüft. SHA-256-Prüfsummen aller sieben erhaltenen Dumps
vor und nach dem Löschen identisch. Andere Einträge im Backup-Verzeichnis
bleiben erhalten. Die Bereinigung ist einmalig und richtet keine automatische
Aufbewahrungsregel ein. Plugin-Quelltexte wurden nicht verändert.

Nur diese Dokumentation wird versioniert. Changelog-Kopien auf identischen
Inhalt und Diff auf Formatfehler geprüft. Keine Analyse, Tests, Prüfbuilds,
Installationen oder Deployments gestartet, da Laufzeitcode und Konfiguration
durch diese Aufgabe unverändert bleiben. Bestehende Website-Quelländerungen
bleiben außerhalb dieser Aufgabe und der lokalen Dokumentations-Commits.
