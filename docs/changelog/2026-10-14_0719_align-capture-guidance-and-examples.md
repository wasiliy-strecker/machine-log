# Erfassungshilfe und Beispiele an ZählerstandLog angeglichen

Die zwei neuesten Smartphone-Screenshots mit der Flutter-Vorlage verglichen.
Erfassungsbildschirm und Einstieg heißen jetzt „Erfassen / Fotografieren“.
Die Karte „Für eine gute Erkennung“ übernimmt die drei Fototipps, mit
Maschinen-/Zählernummer, und die Erklärung zu 1920 Pixeln, JPEG-Optimierung,
Metadaten und erforderlicher Wertbestätigung.

„Beispiele ansehen“ öffnet wie im Vorbild eine große schließbare Galerie mit
Wischen, Pfeiltasten, Beschriftung und Bildzählung. Schließen über Android-Zurück,
Hintergrund und Ziehen unterstützt. Ladefehler erhalten einen verständlichen
Hinweis. Die Bilder werden ausschließlich angezeigt. Entwurf, OCR, Galerie-
Import und gespeicherte Ablesungen werden dadurch nicht verändert.

Sechs bereits vorhandene künstliche Produktionsanzeigen aus Flutter MaschinenLog
als unabhängige lokale JPEG-Vorschauen eingebunden. Fertigung, Montage, Verpackung,
Abfüllung, Zuschnitt und Druck. Maximal 1024 Pixel, metadatenfrei, je unter 150 KiB.
Originale und Nachbarprojekte bleiben unverändert. README, Ressourcenbeschreibung
und Herkunftshinweise ergänzt. Keine Datenbank- oder Backupformatänderung.

`npm run check` erfolgreich mit Formatierung, ESLint, TypeScript und 40 Tests.
Ein gezielter Erfassungs-/Galerietest prüft Titel und Anleitung, Öffnen, Pfeile,
Wischen, Grenzen, Ladefehler, Android-Zurück, erneutes Öffnen und unveränderte
Datenbank/Entwürfe. Keine aufwendige visuelle Testreihe.

Dev-APK erfolgreich gebaut und mit identischer Signatur datenbewahrend auf dem
HONOR BVL-N49 installiert. Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0,
Code 1, nicht debuggable, Installer vor und nach Update `null`.
Titel, Anleitung und Beispiel-Schaltfläche auf dem Smartphone bestätigt.
Vor dem Öffnen der Galerie wurde das Display automatisch gesperrt. Kurze manuelle
Restprüfung nach dem Entsperren: „Beispiele ansehen“ öffnen, blättern und schließen.
Keine JavaScript- oder Android-Absturzmeldung im kurzen Laufzeitcheck.

Artefakt: `build/dev/maschinenlog-1.0.0-dev-capture-help-2026-10-14.apk`.
SHA-256: `e68b2f86794e5cca4d118ae10cd122b406c20637d2668ea04ea45d6ff783bc87`.
Kein Store-Build und kein Push.
