# Kumulierten Zuwachs vollständig aus der Ausgabe entfernt

Die verbleibende Gesamtsumme „Dokumentierter Zuwachs“ aus neu erzeugten
Zählerverlaufs-PDFs entfernt. Die entsprechende Summenkarte der App war bereits
entfernt. Auch die nun ungenutzte Berechnung `counterTotals` entfernt. Laufzeitcode
enthält keine solche Summenanzeige mehr. README beschreibt ausschließlich die
Differenz zur jeweils vorherigen Ablesung und getrennte Übergänge bei Rücksetzungen.
Bereits gespeicherte PDFs bleiben als unveränderte Nachweise erhalten.

Vorhandene Workflow-Tests auf die fachlich relevanten Einzelübergänge angepasst.
Nachträge, Rücksetzungen, Wechsel und Berechnungslücken werden je benachbarter
Ablesung geprüft. Der echte PDF-Export wird mit `pdftotext` gelesen. Er enthält
nach der synthetischen Korrektur die Einzelzuwächse 19 und 15 Stück, aber weder
die kumulierte Summe von 34 Stück noch „Dokumentierter Zuwachs“. Die vorhandene
Prüfung unveränderter Altprotokolle und verschlüsselter Wiederherstellung bleibt
erhalten. `npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 47 Tests.
Keine zusätzliche visuelle Testreihe und keine native Änderung.

Dev-APK mit allen bisherigen Textänderungen und aktualisierter PDF-Ausgabe gebaut.
Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable.
Die bisherige eigene Dev-Signatur bestätigt. Kein Android-Gerät per ADB verbunden,
deshalb keine Installation ausgeführt. Die Smartphone-Installation enthält diese
Änderungen noch nicht. Installation nach dem Verbinden aus dem App-Verzeichnis:
`npm run install:preview -- A5CS024205005243 build/dev/maschinenlog-1.0.0-dev-reading-differences-2026-10-14.apk`.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-reading-differences-2026-10-14.apk`.
SHA-256: `921c263e95676bdd11201a6eed9b264e8f1cc516f55138369bc83677b70b9ed1`.
Keine gespeicherten Ablesungen oder Nachbar-Apps verändert. Kein Store-Build und
kein Push.
