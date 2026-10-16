# PDF-Protokolle nur mit aktuellen Fotos

Neue Einzel- und Verlaufsprotokolle enthalten pro Ablesung nur deren aktuelle
Fotoversion. Frühere Fotos werden nicht eingebettet und gehören nicht mehr
zur separaten Anhangsliste, Dateiprüfung oder zum Größenbudget des Exports.
Die zentrale Auswahl wird auch für die Fotooption beim Einzelprotokoll verwendet.
Die SQLite-Verfügbarkeitsprüfung berücksichtigt aktuelle Anhänge und erhaltene
PDF-Altanhänge mit unverändertem Zählerfilter. Nach Entfernen eines Fotos gibt
es keinen Rückgriff auf frühere Fotoversionen.

Auswahltexte, Erklärung und README angepasst. Fotogröße unverändert.
Korrekturangaben bleiben im PDF dokumentiert. Frühere Fotos bleiben in der
Korrekturhistorie und in verschlüsselten Backups erhalten. PDF-Altanhänge bleiben
exportierbar. Bereits gespeicherte Protokolle werden nicht verändert.
Keine Datenmigration und keine Änderung an Dateibereinigung oder Backup-Format.

`npm run check` erfolgreich mit Prettier, ESLint, TypeScript und 63 Tests.
Gezielte Prüfungen erzeugen echte Einzel- und Verlaufs-PDFs und lesen sie mit
Poppler aus. Bildanzahl, Bildgröße und extrahierte JPEG-Bytes entsprechen nur
dem aktuellen Foto. Die Exportfälle lesen eine frühere Fotodatei auch bei
simuliertem Lesefehler nicht. Kompakte PDFs und Ablesungen mit entferntem Foto
enthalten keine Bilder. SQLite-Prüfungen trennen Zähler und erkennen erhaltene
PDF-Altanhänge. Bestehende verschlüsselte Backup-Prüfungen bestätigen weiterhin
den vollständigen Erhalt früherer Fotos und unveränderter gespeicherter PDFs.
Keine Testdaten oder neuen PDFs auf dem Smartphone angelegt.

Dev-APK mit eingebettetem JavaScript erfolgreich gebaut und mit passender
Signatur datenbewahrend auf dem HONOR BVL-N49 installiert. Paket
`com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1, nicht debuggable,
Installer vor und nach dem Update `null`. Das Smartphone war gesperrt.
Die Sichtprüfung auf dem Gerät bleibt nach dem Entsperren offen.
Native Quellen und Nachbarprojekte unverändert. Kein Store-Build und kein Push.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-current-report-photos-2026-10-16.apk`.
SHA-256: `98cfcc724416ce15b0c81fa251beef3793e87ad1833c19fbe302c9c4787c0cd7`.
