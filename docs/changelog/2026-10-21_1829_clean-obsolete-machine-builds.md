# MaschinenLog auf die aktuelle Smartphone-APK bereinigt

Auf Nutzerauftrag 34 ausschließlich lokale Build- und Cache-Ziele entfernt.
Die Dev-APK `build/dev/maschinenlog-1.0.0-dev-start-icon-2026-10-18.apk`
bleibt erhalten. Sie stimmt per SHA-256 exakt mit der auf dem angeschlossenen
Smartphone installierten Version überein: `com.appfactory.maschinenlog.dev`,
Version `1.0.0`, Versionscode `3`.

Entfernt wurden die doppelte Dev-APK und Store-Ausgaben unter `android/app/build`,
die vier älteren Store-AAB-Dateien mit Versionscodes 2 bis 5, erzeugte APK-/APKS-Dateien
für Store-Bilder und OCR-Prüfungen sowie lokale Android-, Gradle-, Kotlin- und
Expo-Zwischenstände. Build-Verzeichnisse innerhalb von Abhängigkeiten wurden
ausschließlich für native Android-Module und Gradle-Plugins entfernt.

Quellcode, installierte Abhängigkeiten, Konfigurationen, Signierschlüssel,
Store-Bilder, Backups, Release-Texte und kleine Prüfbelege bleiben erhalten.
Andere Apps und gemeinsame Caches wurden nicht verändert. Die Smartphone-App
und ihre Daten bleiben unverändert. Benötigte Zwischenstände werden beim nächsten
Build erneut erzeugt. Die Release-Dokumentation beschreibt den bereinigten Stand.

## Prüfung

Rund 825,3 MB beziehungsweise 787,1 MiB belegten Speicher freigegeben.
Die Bilanz berücksichtigt Hardlinks. Vor der Bereinigung keine versionierten
Dateien oder offenen Dateizugriffe innerhalb der Löschziele festgestellt.
Alle 34 Ziele sind entfernt. 305 geschützte Dateien einschließlich Quellcode,
Konfigurationen, Signierdateien und erhaltener Dev-APK vor und nach der Bereinigung
per SHA-256 verglichen. Keine Abweichungen. Git blieb durch die Bereinigung sauber.

Dokumentation, übereinstimmende Changelog-Kopien und Diff auf Formatfehler geprüft.
Keine Tests, Builds, Installation oder Push, da Laufzeitcode und Konfiguration
unverändert bleiben.
