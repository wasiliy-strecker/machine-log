# Verschlüsselte Backups beschleunigt

Android verwendet die bereits vorhandenen nativen Expo-Funktionen für SHA-256
und AES-256-GCM über einen austauschbaren BackupCrypto-Adapter. Große Inhalte
werden als Bytearrays übergeben. Die Noble-Implementierung bleibt unabhängig
für Tests verfügbar. Produktiv gibt es keinen stillen Rückfall auf JavaScript
bei einem nativen Fehler.

Beim Erstellen wird jede unterschiedliche Datei einmal gelesen und einmal
gehasht. Das Dateiverzeichnis und alle Referenzen aus Originalen, Korrekturen
und gespeicherten PDFs verwenden dieselbe geprüfte Prüfsumme. PDF- und
JPEG-Inhaltsprüfungen bleiben erhalten. Wiederherstellung prüft neu geschriebene
Dateien vor der Datenübernahme und liest mehrfach referenzierte lokale Dateien
innerhalb des Vorgangs nur einmal. Fehlende passende Originaldateien bleiben
reparierbar. Ein späterer Vorgang prüft erneut. Schlüssel, Manifest- und
Payload-Puffer werden auch bei Verschlüsselungsfehlern aufgeräumt.

Ein optionaler Fortschrittscallback meldet Vorbereitung, Dateiprüfung,
Verschlüsselung, Entschlüsselung und Wiederherstellung. Die Einstellungen zeigen
bei Dateischritten tatsächliche Anzahlen. Meldungen werden zeitlich gebündelt
und erhalten vor längeren Arbeitsschritten Gelegenheit zum Rendern.
Speicherortauswahl, erneutes Speichern derselben vorbereiteten Sicherung,
Abbrechen und Aufräumen bleiben erhalten.

MLBACK01, authentifizierter Header, AES-256-GCM, 600000 PBKDF2-SHA256-Runden,
Dateigrenzen und Sicherungsumfang bleiben unverändert. Frühere Fotos,
Korrekturen und gespeicherte PDFs bleiben enthalten. Keine Datenmigration,
neue Abhängigkeit oder Änderung an nativen Quellen und Nachbarprojekten.

Prüfung: npm run check erfolgreich mit Prettier, ESLint, TypeScript und
86 Tests. Neue gezielte Tests verwenden eine feste synthetische Sicherung des
bisherigen Codecs. Die echten Expo-JavaScript-Schnittstellen laufen gegen eine
mit Node/OpenSSL nachgebildete native Grenze. Unabhängige Entschlüsselung,
Noble-Kompatibilität, einmaliges Lesen und Hashen, Bytearray-Ausschnitte mit
rund 8 MiB, Manipulation, falsches Passwort, fehlende oder beschädigte Anhänge,
abweichende Referenzen und PDF-Seitenzahlen sind geprüft. Weitere Fälle prüfen
unveränderte Historien, Reparatur fehlender Originaldateien, Abbruch bei
beschädigten Schreibvorgängen, Cache-Lebensdauer und Fehlerbereinigung.
Settings-Tests prüfen Fortschritt, Sperren, Wiederholung und Fehlerfreigabe.

Das Smartphone wurde vom Nutzer getrennt. Tatsächliche Laufzeit und Darstellung
auf Android sind für diesen Stand noch nicht geprüft. Kein APK-Build, keine
Installation, kein Store-Build und kein Push. Lokaler Commit nach den Prüfungen.
