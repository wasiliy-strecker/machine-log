# Erneute Zahlenerkennung vereinfachen

Den Button „Zahlen erneut erkennen“ aus dem Ableseformular entfernt. Die
Erkennung startet weiterhin automatisch nach Aufnahme oder Auswahl eines
Fotos. Erkannte Vorschläge lassen sich weiter übernehmen. Die Fotoauswahl
für vorhandene Altbestände mit mehreren Fotos bleibt erhalten.

Ohne erkannten Zahlenvorschlag steht nur „Keine Zahlen erkannt.“. Der dann leere
Vorschlagskasten entfällt. Der Bestätigungshinweis erscheint nur bei vorhandenen
Vorschlägen. Die technische OCR-Fehlermeldung verweist auf manuelle Eingabe und
nicht mehr auf den entfernten Wiederholungsbutton.

Zwei gezielte Ablaufprüfungen mit synthetischem Foto, ersetzter OCR-Schnittstelle
und echtem SQLite-Speicher ergänzen den vorhandenen Formulartest. Sie prüfen
automatische Erkennung, den kurzen Leerhinweis, erfolgreiche Vorschläge und
manuelle Bestätigung mit erhaltenem Foto. npm run check erfolgreich mit
Prettier, ESLint, TypeScript und 98 Tests. Keine nativen Quellen geändert.

Dev-APK mit eingebettetem JavaScript über Gradle ohne Prebuild erfolgreich
erstellt. Paket com.appfactory.maschinenlog.dev, Version 1.0.0 mit Code 1,
fehlendes Debug-Flag, Installer null und bestehende passende Signatur vor dem
datenbewahrenden Update geprüft. Installierte APK-Prüfsumme stimmt überein.
App-Prozess ohne passende Fehlermeldungen. Auf dem Smartphone den gesicherten
Ableseentwurf wieder geöffnet und das Fehlen des Buttons bestätigt. Keine
Ablesung gespeichert oder gelöscht. Die tatsächliche Kamera-/Galerie-OCR
wurde für diese Oberflächenänderung nicht erneut auf dem Gerät durchlaufen.

Artefakt: build/dev/maschinenlog-1.0.0-dev-no-ocr-retry-2026-10-17.apk.
APK-SHA-256: 028c666a6797e114db419d1ee3e4331cca2d5e34a8a149f567f1ff3d5c0a2bc2.

Kein Store-Build oder Push. Beide Changelog-Kopien und Diff/Whitespace geprüft.
Lokaler Commit nach erfolgreicher Prüfung.
