# Vorschläge bei geöffneter Tastatur erreichbar halten

Den letzten MaschinenLog-Screenshot vom Smartphone geprüft. Die Einheitenliste
lag unter dem Eingabefeld und wurde von der Tastatur verdeckt. Vorschläge für
Zählerart und Einheiten richten sich jetzt nach Feldposition, sichtbarem
Formularbereich und Tastatur. Sie öffnen bei genügend Platz darunter, sonst
darüber. Die Listenhöhe bleibt begrenzt und bei wenig Platz scrollbar.

Die Liste wird auf einer eigenen Ebene innerhalb der Formularseite dargestellt.
Sie wird dadurch nicht an kleinen Feldrahmen abgeschnitten und übernimmt ihre
Wischbewegungen selbst. Die Tastatur bleibt beim Scrollen der Liste geöffnet,
das Formular bewegt sich dabei nicht. Dezenter Rahmen und abgerundete Ecken.
Freie Eingabe, Filtern und Auswahl mit einem Tipp bleiben erhalten. Keine neue
Abhängigkeit und keine Änderung an Datenformaten, nativen Quellen oder Nachbarapps.

Sechs gezielte Tests für Platzierung, Tastaturwechsel, knappen Platz,
Auswahl und eigene Einheiten. npm run check mit Prettier, ESLint, TypeScript und
96 Tests in 13 Testdateien erfolgreich. README und Changelog formatiert und
Diff/Whitespace geprüft. Native Tests nicht erneut nötig, da nur TypeScript/UI
geändert wurde. Dev-APK für das eingebettete JavaScript per Gradle ohne Prebuild
erfolgreich gebaut und datenbewahrend installiert. Dev-Paket, Version 1.0.0 mit
Code 1, nicht debuggable, Installer null und passende vorhandene Signatur geprüft.
Der Nutzer hat den Neustart mit Verwerfen der offenen Eingaben ausdrücklich
freigegeben. Gespeicherte Zähler und Ablesungen wurden nicht verändert.

Kurzer Gerätecheck auf dem entsperrten HONOR BVL-N49 mit Android 16 erfolgreich.
Zählerart öffnet darunter, Einheit bei geöffneter Tastatur darüber. Liste separat
gescrollt und Laufmeter mit einem Tipp übernommen. Tastatur und Liste schließen
nach Auswahl. Standardwert Stück wiederhergestellt und ungespeichertes leeres
Testformular verlassen. Rückkehr zur Hauptansicht bestätigt. Keine gespeicherten
Testdatensätze. Installierte Datei-Prüfsumme stimmt mit dem benannten Artefakt
überein. Keine passenden Laufzeitfehler im aktuellen App-Prozess.

Artefakt: build/dev/maschinenlog-1.0.0-dev-keyboard-suggestions-2026-10-17-final.apk.
APK-SHA-256: 960ebbdedc33c7dfd2324998a5b10c20b271ccc16a060803eb781e58f8c281cf.

Kein Store-Build oder Push. Lokaler Commit nach erfolgreicher Prüfung.
