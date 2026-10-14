# Aktuellen Dev-Stand auf dem Smartphone installiert

Auf ausdrücklichen Wunsch den aktuellen Quellstand `f29815a` erneut mit
`:app:assembleDevRelease` gebaut. Build erfolgreich. Die aktuelle Dev-APK stimmt
mit dem zuletzt vorbereiteten Artefakt überein und enthält die Überschrift
„Zählerverlauf“ sowie die entfernte Gesamtsumme in App und neuen PDF-Protokollen.

Angeschlossenes HONOR BVL-N49 mit Gerätekennung `A5CS024205005243` erkannt.
Vorhandenes Paket `com.appfactory.maschinenlog.dev`, Version 1.0.0, Code 1,
nicht debuggable, Installer `null` vor dem Update geprüft. Das app-lokale
Installationsskript hat die übereinstimmenden Signaturen der vorhandenen und
neuen APK bestätigt und mit `adb install -r -t -g --no-streaming` datenbewahrend
aktualisiert. Installation erfolgreich. Identität, Version, Debug-Flag und
Installer sind nach dem Update unverändert.

MaschinenLog Dev gestartet und den laufenden App-Prozess bestätigt. Keine
JavaScript- oder Android-Absturzmeldung im kurzen Startcheck. Das Smartphone
war gesperrt. Keine Bildschirmsperre umgangen und keine visuellen Tests ausgeführt.
Der Quellcode ist unverändert. Die unmittelbar zuvor erfolgreichen 47 Tests,
TypeScript-, ESLint- und Formatprüfungen wurden nicht unnötig wiederholt.

Installiertes Artefakt:
`build/dev/maschinenlog-1.0.0-dev-reading-differences-2026-10-14.apk`.
SHA-256: `921c263e95676bdd11201a6eed9b264e8f1cc516f55138369bc83677b70b9ed1`.
Kein Store-Build, keine Datenlöschung und kein Push.
