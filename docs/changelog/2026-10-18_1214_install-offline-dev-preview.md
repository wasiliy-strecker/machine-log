# MaschinenLog Dev-Preview mit Netzwerksperre installieren

Die eigenständige Dev-Preview verwendet nun denselben app-lokalen Manifest-Overlay
wie Store. Das Expo-Plugin erhält beide Overlays. Dev-Debug behält seinen
Netzwerkzugriff für Metro. Der Dev-Build vergleicht die Vorlage und der
Installationshelfer verwirft Preview-APKs mit Netzwerkberechtigungen.
Eine alte APK wird bereits vor jedem Gerätezugriff abgelehnt.

Dev-APK 1.0.0 mit dem bestehenden Code 3 und bestehender eigener Dev-Signatur
gebaut. Kein Versionsbump, kein Store-Build und keine neue Paketkennung.
Auf dem HONOR BVL-N49 Paket, bisherige Version 1, fehlendes Debug-Flag, Installer
`null` und übereinstimmende Zertifikate geprüft. Datenbewahrend installiert und
gestartet. App-UID und Erstinstallationszeit bleiben gleich. Installierte APK-
Prüfsumme stimmt überein. Beide Netzwerkrechte fehlen. Keine beobachteten
AndroidRuntime-/ReactNativeJS-/Expo-Startfehler. Store-Paket nicht installiert.

`npm run check` mit 98 Tests bestanden. Native Prüfung mit 51 JVM-Tests und
Lint erfolgreich. Dev-Debug-Merge behält `INTERNET`, Dev-Preview entfernt beide
Netzwerkrechte. Fünf Release-Regressionstests und Bash-Syntaxprüfung bestanden.
Anleitung und lokale Datenschutzquellen unterscheiden jetzt Dev-Preview von
Dev-Debug. Die dokumentierten Grenzen der Aussage zur SDK-Telemetrie bleiben
bestehen. Keine pauschale No-Freigabe ergänzt.

Benannte Auslieferung:
`build/dev/maschinenlog-1.0.0-dev-build-3-offline-2026-10-18.apk`.

SHA-256:
`bcaca8791381b37bdc26460d5cef6be013e91a7d7af008d9dfd6cd7d75f93583`.
