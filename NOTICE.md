# Herkunft und Lizenzen

MaschinenLog basiert auf der ausdrücklich als Vorlage gewählten, app-lokal
kopierten Hausakte-Codebase von Wasiliy Strecker am Commit `dfd6fc8`.
Es besteht keine Runtime-Abhängigkeit zum Nachbarprojekt.

Die Fotoanleitung und der Aufbau der Beispielgalerie stammen aus ZählerstandLog
und der Flutter-MaschinenLog-App von Wasiliy Strecker. Die app-lokalen React-
Übertragungen unter `src/features/entries/capture-guidance.tsx` und
`photo-examples-button.tsx` sind Bearbeitungen unter MPL-2.0.
Die künstlichen Produktionsanzeigen unter `assets/photo-examples/` sind lokal
kopierte JPEG-Vorschauen der synthetischen Testbilder aus Flutter MaschinenLog.
Sie enthalten keine echten Produktions- oder Kundendaten.

Aufbau und Gestaltung der statischen Datenschutzseiten unter `docs/` stammen
aus ZählerstandLog von Wasiliy Strecker. Inhalte, Farben und Links sind für
MaschinenLog angepasst. Es werden keine Dateien der Vorlage verändert.

Die Zahlenverarbeitung in `src/core/domain/reading-value.ts` und die
OCR-Kandidatenextraktion in `src/core/ocr/candidate-extractor.ts` sind nach
TypeScript übertragene Bearbeitungen der entsprechenden ZählerstandLog-Dateien
von Wasiliy Strecker. Diese Teile unterliegen MPL-2.0. Der Lizenztext steht
in `LICENSE`. Die Übertragungen übernehmen insbesondere die Behandlung durch
Leerzeichen getrennter Ziffern und deren positionsabhängige Zusammenführung.

Die Lizenztexte der eingebetteten Roboto-, MaterialIcons- und DejaVu-Schriften
liegen in `assets/`. Weitere Abhängigkeiten behalten ihre jeweiligen Lizenzen
in den Paketmetadaten. Das Zahnrad-/Zähler-Icon wurde für MaschinenLog als
SVG erstellt.
