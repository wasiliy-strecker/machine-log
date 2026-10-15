# Hauptansicht mit bedarfsgerecht aufgebauten Zählerkarten

Die durchgehend scrollbare Hauptliste wie bei Flutter ZählerstandLog auf eine
React-Native-`FlatList` umgestellt. Alle Zähler bleiben ohne Seitenwechsel
zugänglich. Suche, Trefferzahl und Sortierung berücksichtigen den vollständigen
Datenbestand. Repository-Schnittstellen und Datenformate bleiben unverändert.

Kopfzeile und Karten in stabile Komponenten getrennt. Die Liste verwendet
Zähler-IDs als Schlüssel und eine eigene Scrollfläche ohne verschachtelte
`ScrollView`. Karten behalten ihre unterschiedlichen Höhen, Symbole,
Erinnerungen und Entwurfshinweise. Kopfzeile scrollt mit. Abstände und Platz
für den feststehenden Anlegen-Button entsprechen der bisherigen Ansicht.

Nach dem ersten erfolgreichen Laden bleibt die Liste bei einer Aktualisierung
stehen. Dadurch werden Liste und Suchfeld beim Zurückkehren aus Details nicht
neu eingehängt. Suchtext und Scrollposition bleiben erhalten. Ladefehler bei
vorhandenen Daten erscheinen mit Wiederholung in der Kopfzeile. Erster
Ladevorgang, leere Bestände und erfolglose Suchen behalten ihre eigenen Zustände.
Suche und Sortierung werden nur bei geänderten Daten oder Auswahl neu berechnet.
README ergänzt.

`npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 62 Tests.
Drei gezielte Fälle mit 24 synthetischen Zählern in echter SQLite prüfen Suche
außerhalb des anfänglichen Ausschnitts, globale Sortierung, Schlüssel und
Navigation, stabile Listen- und Suchfeldinstanzen beim Fokuswechsel während
einer laufenden Abfrage, neue Daten, Ladefehler und Wiederholung sowie den
leeren Erstzustand. Der Listentest ersetzt nur die native Darstellung und ist
kein Bildratenbenchmark. Keine Testdaten auf dem Smartphone angelegt.

Dev-APK mit eingebettetem JavaScript erfolgreich gebaut und mit passender
Signatur datenbewahrend auf dem HONOR BVL-N49 installiert. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach dem Update `null`. Das Smartphone war gesperrt.
Die Sichtprüfung von Suche, Sortierung, Scrollen und Rückkehr aus Details
bleibt deshalb nach dem Entsperren offen. Sperre nicht umgangen.
Native Quellen und Nachbarprojekte unverändert. Kein Store-Build und kein Push.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-dashboard-flatlist-2026-10-15.apk`.
SHA-256: `d9d1c48b87e53ed77d2d524b5b164e7abafd332ad5c3fe0de2d0a3c7d1eb1c1a`.
