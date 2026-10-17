# OCR-Hinweis direkt unter der Fotobox

Statushinweise der Fotoerkennung stehen im Ableseformular unmittelbar unter
der Fotobox. Das gilt insbesondere für „Keine Zahlen erkannt.“. Allgemeine
Formularfehler bleiben am Formularanfang. Der Erfassungseinstieg behält seine
Hinweise an der bisherigen Position.

Den bestehenden Foto-/OCR-Ablauftest um die unmittelbare Zuordnung des Hinweises
zur Fotobox ergänzt. npm run check mit Prettier, ESLint, TypeScript und 98 Tests
erfolgreich. Keine Änderung an nativen Quellen, Datenformaten oder Erkennungslogik.

Für die installierte Testversion mit eingebettetem JavaScript eine neue Dev-APK
über Gradle ohne Prebuild erstellt und datenbewahrend installiert. Dev-Paket,
Version 1.0.0 mit Code 1, fehlendes Debug-Flag, Installer null und die bestehende
Signatur vorab geprüft. Installierte Datei-Prüfsumme stimmt überein. Keine
passenden Fehler im aktuellen App-Prozess. Den vorhandenen Ableseentwurf mit
Foto wieder geöffnet. Keine Ablesung gespeichert oder gelöscht.

Die neue Hinweisposition ist im Formulartest abgesichert. Es wurde kein neuer
Kamera-/Galerie-OCR-Durchlauf am Gerät gestartet. Kurzer manueller Prüfschritt:
Foto ohne erkennbare Ziffern auswählen. „Keine Zahlen erkannt.“ muss direkt
unter der Fotobox erscheinen.

Artefakt: build/dev/maschinenlog-1.0.0-dev-photo-ocr-hint-2026-10-17.apk.
APK-SHA-256: 6e2995a0a396bd2071384069114d142f751e72e6e3ebcedadad6d2eef661afe9.

Beide Changelog-Kopien und Diff/Whitespace geprüft. Nur lokaler Commit.
Kein Store-Build oder Push.
