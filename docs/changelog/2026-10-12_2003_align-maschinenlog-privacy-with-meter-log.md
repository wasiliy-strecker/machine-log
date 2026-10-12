# Datenschutzaufbau von ZählerstandLog für MaschinenLog übernommen

Auf Nutzerauftrag die Datenschutzeinstellungen und die vollständige Erklärung
an das ZählerstandLog-Vorbild angeglichen. Die App öffnet die Erklärung im
Browser. Unter „Über MaschinenLog“ führt „Quellcode auf GitHub“ direkt zur README.
Fehlgeschlagene Browseraufrufe zeigen einen deutschen Hinweis und lassen sich
wiederholen. Die frühere verkürzte lokale Datenschutzroute entfernt.

Deutsche und englische statische Seiten unter `docs/` mit denselben 13
Abschnitten, Sprachwechsel, Kontaktangaben, GitHub-Link, mobilen Ansichten,
Dunkelmodus und Druckansicht. Farben an MaschinenLog angepasst.
Inhalte berücksichtigen Maschinen mit mehreren Zählern, Korrekturhistorien,
Dokumentenscan, gebündelte OCR, Google-Metriken und die tatsächlichen Löschregeln.
Keine falsche Aussage über eine fehlende Internetberechtigung übernommen.

README und PRIVACY.md verlinken die vollständigen Seiten. GitHub Pages verwendet
wie beim Vorbild `main` und `/docs` mit `.nojekyll`. Keine externen Skripte,
Schriftarten oder App-Daten auf der Webseite. Die Veröffentlichung im bereits
vom Nutzer angegebenen Repository gehört zur gewünschten funktionierenden
Verlinkung. Keine Änderungen an ZählerstandLog oder anderen Apps.

## Prüfung

`npm run check` erfolgreich. Formatierung, ESLint, TypeScript und alle 21 Tests
bestanden. Zwei gezielte Tests prüfen die Browserlinks, den Fehlerfall und die
anschließend wieder nutzbaren Aktionen. Die statischen Seiten besitzen dieselbe
Gliederung wie das Vorbild. Lokale Links, Stylesheet, Sprachwechsel, README-Link
und Texte geprüft.

`assembleDevRelease` erfolgreich. Eigene Dev-Paketkennung und Signatur geprüft.
Die eigenständige Smartphone-Version enthält ihr JavaScript fest. Deshalb benötigt
auch diese UI-Änderung ein APK-Update. Während der Arbeit wurde das zunächst
verbundene Smartphone getrennt. Die neue APK ist vorbereitet, aber noch nicht
installiert. Die vorangegangene Installation bleibt unberührt.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-privacy-2026-10-12.apk`.
SHA-256: `4253fcf56d3419f315e762fcbd32ec4adcc71beb796737ede1088c290eff2326`.

Kein Store-Build und keine aufwendige visuelle Testreihe.
