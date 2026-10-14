# Direkten Zugang zu Alarme und Erinnerungen ergänzt

Das Erinnerungsformular mit ZählerstandLog und Flutter MaschinenLog verglichen.
Den fehlenden Button „Alarme & Erinnerungen“ öffnen unter den Erinnerungsarten
ergänzt. Er ist im aktivierten Android-Erinnerungsformular verfügbar, auch bei
normaler Erinnerung und bereits erteilter Alarmfreigabe. Verwendet die vorhandene
native Schnittstelle mit dem Ziel `exact`. Ändert weder Erinnerungsart noch Termin.
Nicht verfügbare Systemeinstellungen erhalten eine passende Meldung. Beim
Auswählen von „Pünktlich mit Ton“ bleibt der Hinweis auf die erhaltene Auswahl
bestehen. README ergänzt. Native Schnittstelle, Datenbank und Backup unverändert.

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 45 Tests.
Fünf neue gezielte Fälle prüfen beide Erinnerungsarten mit und ohne Freigabe,
Mehrfachtippen, Rückkehr aus Android, unveränderte Formulardaten und Fehler beim
Öffnen. Keine aufwendige visuelle Testreihe.

Dev-APK erfolgreich gebaut und mit identischer Signatur datenbewahrend auf dem
HONOR BVL-N49 installiert. Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0,
Code 1, nicht debuggable, Installer vor und nach Update `null`.
Den Button bei normaler Erinnerung auf dem Gerät bestätigt und betätigt.
Android öffnete `Settings$AlarmsAndRemindersAppActivity` für MaschinenLog Dev,
mit dem gerätespezifischen Titel „Wecker und Erinnerungen“. Keine Freigabe durch
Codex geändert. Keine JavaScript- oder Android-Absturzmeldung im kurzen Laufzeitcheck.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-alarm-settings-2026-10-14.apk`.
SHA-256: `40b9660578ecfac7a84a1434248d0394260be4080be8620cc668833981bde88b`.
Kein Store-Build und kein Push.
