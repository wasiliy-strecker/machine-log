# MaschinenLog für sechs Store-Sprachen vorbereiten

MaschinenLog 1.0.0 (6) erhält Deutsch, Englisch, Spanisch, Französisch,
Italienisch und Portugiesisch (Brasilien). 670 Meldungen je Sprache decken App,
Validierung, PDFs und native Erinnerungen ab. Die App-Sprache bleibt gespeichert.
Zahlen und Daten folgen unabhängig davon der Systemregion. Bestehende Daten,
Entwürfe, Korrekturen, Backups und gespeicherte PDFs behalten ihr Format.

Sechs Store-Textpakete und 96 Upload-Bilder wurden aus 84 echten Aufnahmen der
finalen AAB erstellt. Eigene Emulatoren verwenden synthetische Backups über die
normale Wiederherstellung. OCR, PDFs und Sprachpersistenz wurden praktisch
geprüft. Die Lieferung unter `releases/international/build-6/` enthält AAB,
Sprach-ZIPs, Gesamt-ZIP, Vorschauen, Release-Notizen und Herkunftsnachweise.

Formatierung, ESLint, TypeScript und 108 App-Tests sind erfolgreich.
57 native Tests, Android Lint, fünf Store-Tests und 20 Expo-Doctor-Prüfungen
sind erfolgreich. Die signierte AAB besteht Identitäts-, Sprach-, Offline- und
16-KB-Prüfungen. 75 Code-, Asset- und Bibliotheksdateien stimmen mit der
Emulator-APK überein. Die sechs Backup-Fixtures bestehen ihren zusätzlichen Test.

Kompatible Expo- und Testwerkzeug-Patches sowie Zod 4.6.7 wurden übernommen.
Beide npm-Audits melden weiterhin fünf hohe Einträge in Buildwerkzeugen und
keine kritische Meldung. Diese Befunde sind bewertet und dokumentiert.
Die betroffenen CLI-Bibliotheken fehlen laut Source Map im Store-JavaScript.
Ein vorhandenes Changelog wurde ausschließlich für die verpflichtende
Prettier-Prüfung formatiert.

Keine Veröffentlichung und kein Push. Das persönliche Android-Gerät und seine
Dev-Installation bleiben unberührt. Alle eigenen Capture-Emulatoren sind beendet.
