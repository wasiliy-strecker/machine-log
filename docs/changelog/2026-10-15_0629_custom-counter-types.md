# Eigene Zählerarten mit gespeicherten Vorschlägen

Die vorhandene freie Vorschlagsauswahl aus ModellbauLog und Hausakte für die
Zählerart übernommen. Stückzahl, Zyklen, Betriebsstunden und Menge bleiben
vorgegeben. Eigene Bezeichnungen können direkt eingegeben werden und erscheinen
nach dem Speichern bei weiteren Zählern als Vorschläge. Doppelte Vorschläge
werden unabhängig von Groß- und Kleinschreibung zusammengeführt.

Standardarten behalten ihre bisherigen gespeicherten Kennungen. Eigene Arten
werden validiert und auch in Suche, Sortierung und verschlüsselten Backups
berücksichtigt. Eine ausdrücklich eingetragene Einheit bleibt beim Wechsel
der Zählerart erhalten. Pflichtfeldfehler erscheinen direkt am Feld und werden
beim Speichern angesprungen. Keine Datenmigration und keine Änderung an Ablesungen.
README ergänzt. Nachbarprojekte nur gelesen.

`npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 56 Tests.
Gezielte Fälle prüfen Vorschläge beim Anlegen, freie Eingabe, Einheiten,
Pflichtfeldfehler, alte Standardkennungen und verschlüsselte Wiederherstellung
mit unveränderten Ablesungen. Am Smartphone das editierbare Feld und alle vier
Standardvorschläge bestätigt. Keine Testdaten gespeichert und keine aufwendige
visuelle Testreihe ausgeführt.

Die Dev-APK mit eingebettetem JavaScript gebaut und mit übereinstimmender Signatur
datenbewahrend auf dem HONOR BVL-N49 installiert. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach dem Update `null`. Kurzer Laufzeitcheck ohne JavaScript-
oder Android-Absturzmeldung. Native Quellen unverändert. Kein Store-Build und
kein Push.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-custom-counter-types-2026-10-15.apk`.
SHA-256: `0f72cd0f3cd6067d46c1ac1f31feab4bfd33dd032cb232ac4c6fa4c2389a955a`.
