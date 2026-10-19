# MaschinenLog-Build-Zwischenstände und alte Dev-APKs bereinigt

Auf ausdrücklichen Nutzerauftrag ausschließlich die zuvor geprüften lokalen
MaschinenLog-Build-Zwischenstände und 31 ältere Dev-APK-Dateien entfernt.
Die neueste Dev-APK `maschinenlog-1.0.0-dev-start-icon-2026-10-18.apk`
bleibt unter `build/dev/` erhalten.

Entfernt wurden die freigegebenen erzeugten Unterordner von
`android/app/build/`, die lokalen Gradle- und CMake-Zwischenstände sowie die
geprüften Android-Build-Zwischenstände der nativen Bibliotheken in
`node_modules`. Bibliotheksquelltexte und installierte Abhängigkeiten bleiben
erhalten. Die erzeugte unsignierte Zwischen-AAB innerhalb von `intermediates`
ist Teil der entfernten Build-Zwischenstände.

Alle fertigen Store-AAB-Auslieferungen, Ausgabeordner, Prüfdateien,
Store-Materialien, Konfigurationen, Quelltexte, persönlichen Dateien und
Signierschlüssel bleiben erhalten. Andere Projekte, gemeinsame Gradle-Caches
und SQL-Backups wurden nicht bereinigt. Keine Geräteaktionen oder Änderungen
an installierten Apps. Ein künftiger Build erzeugt benötigte Zwischenstände neu.

## Ergebnis und Prüfung

Die Build-Zwischenstände geben 5812326400 Bytes frei. Die 31 älteren Dev-APKs
geben weitere 2935898112 Bytes frei. Zusammen sind das 8748224512 Bytes,
rund 8,75 GB. Die Bilanz berücksichtigt Hardlinks und verbleibende externe
Verknüpfungen. Nach Abschluss waren rund 12,1 GB auf dem Ubuntu-Laufwerk frei.
GB-Angaben verwenden die dezimale Einheit.

Keine versionierten Dateien innerhalb der Löschziele gefunden. Vor dem Löschen
keine aktiven Builds oder offenen Dateizugriffe auf die Löschziele festgestellt.
Alle 61 freigegebenen Ziele sind entfernt. Unter `build/dev/` verbleibt genau
die neueste Dev-APK. Inhalte beziehungsweise Symlink-Ziele und Dateimodi von
47385 geschützten Dateien vor und nach der Bereinigung verglichen.
Keine Abweichungen festgestellt. Git-Branch, HEAD und Arbeitsstand blieben
während der Bereinigung unverändert.

Nur diese Dokumentation wird versioniert. Inhalt, übereinstimmende
Changelog-Kopien und Diff auf Formatfehler geprüft. Keine Analyse, Tests,
Prüfbuilds oder Installationen, da Laufzeitcode und Projektkonfiguration durch
diese Aufgabe unverändert bleiben.
