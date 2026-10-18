"""Validate the ten Play uploads and write their provenance and upload guide."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

from PIL import Image

AAB = Path("build/releases/production/maschinenlog-1.0.0-build-3-production.aab")
SOURCE_SHA = "18551c110e7fcf8b074e3fa8fc3c70f8d285049da7704721151beae797092397"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate(path, size, mode, limit):
    with Image.open(path) as image:
        image.load()
        if image.format != "PNG" or image.size != size or image.mode != mode:
            raise ValueError(f"Incorrect image format, dimensions or mode: {path}")
    if path.stat().st_size > limit:
        raise ValueError(f"Image exceeds upload size limit: {path}")


def package(out):
    if sha(AAB) != SOURCE_SHA:
        raise ValueError("The source Store AAB has changed")
    apk = out / "raw/store.apk"
    compared = 0
    with zipfile.ZipFile(AAB) as source, zipfile.ZipFile(apk) as installed:
        for name in source.namelist():
            if name.startswith(("base/assets/", "base/lib/")) and not name.endswith("/"):
                if source.read(name) != installed.read(name.removeprefix("base/")):
                    raise ValueError(f"APK content differs from source release: {name}")
                compared += 1
    badging = subprocess.check_output([
        "/home/unknown/.local/android-sdk/build-tools/35.0.0/aapt", "dump", "badging", str(apk)
    ], text=True)
    if "name='com.appfactory.maschinenlog' versionCode='3' versionName='1.0.0'" not in badging:
        raise ValueError("Wrong package/version")
    if "application-debuggable" in badging or "application-testOnly" in badging:
        raise ValueError("Debug/test package is not a Store capture source")
    entries = [
        ("App icon", "icon/app-icon.png", (512, 512), "RGBA", 1024**2,
         "MaschinenLog: helles Zahnrad mit drei Zählersegmenten auf türkisem Hintergrund."),
        ("Feature graphic", "feature/feature-graphic.png", (1024, 500), "RGB", 15 * 1024**2,
         "MaschinenLog: Zähler erfassen und Produktion dokumentieren. Mit Übersicht, Foto-OCR, Verlauf und PDF."),
    ]
    phones = [
        ("01-uebersicht", "Übersicht mit drei Beispielzählern für Fertigung, Verpackung und Betriebsstunden."),
        ("02-foto-ocr", "Lokale Fotoerkennung mit dem Vorschlag 12480 Stück und den Prüffeldern für Wert, Einheit und Zeitpunkt."),
        ("03-verlauf", "Vier Ablesungen der Fertigung mit Zeitpunkten, Zählerständen und berechneten Zuwächsen."),
        ("04-pdf", "Produktionsprotokoll der Fertigung als PDF mit Ablesungen, Zuwächsen sowie Drucken und Teilen."),
    ]
    for name, alt in phones:
        entries.append(("Phone screenshots", f"phone/{name}.png", (1080, 1920), "RGB", 8 * 1024**2, alt))
    for folder, field, size in [("tablet7", "7-inch tablet screenshots", (1080, 1920)),
                                ("tablet10", "10-inch tablet screenshots", (1440, 2560))]:
        for name, alt in [("01-uebersicht", "Tablet-Übersicht mit den Beispielzählern Fertigung, Verpackung und Kompressor."),
                          ("02-pdf", "Produktionsprotokoll in der echten Tablet-PDF-Vorschau mit Drucken und Teilen.")]:
            entries.append((field, f"{folder}/{name}.png", size, "RGB", 8 * 1024**2, alt))
    actual = {str(p.relative_to(out)) for folder in ("icon", "feature", "phone", "tablet7", "tablet10")
              for p in (out / folder).glob("*.png")}
    if actual != {e[1] for e in entries}:
        raise ValueError("Expected exactly ten named upload images")
    manifest = {"app": "MaschinenLog", "locale": "de-DE", "version": "1.0.0 (3)",
                "sourceAab": str(AAB), "sourceSha256": SOURCE_SHA,
                "emulatorApkSha256": sha(apk), "verifiedReleaseAssetAndLibraryCount": compared,
                "images": []}
    for field, name, size, mode, limit, alt in entries:
        path = out / name
        validate(path, size, mode, limit)
        assert len(alt) <= 140
        manifest["images"].append({"file": name, "playField": field, "width": size[0],
                                   "height": size[1], "mode": mode, "bytes": path.stat().st_size,
                                   "sha256": sha(path), "altDe": alt})
    manifest["rawCaptures"] = [{"file": str(p.relative_to(out)), "sha256": sha(p)}
                              for p in sorted((out / "raw").glob("*/*.png"))]
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    lines = ["# MaschinenLog – Store-Bilder", "", "Deutsch, Store-Version 1.0.0 (3). Zehn Upload-Bilder.", "",
             "| Play-Console-Feld | Datei | Pixel | Bytes |", "| --- | --- | --- | --- |"]
    for item in manifest["images"]:
        lines.append(f"| {item['playField']} | `{item['file']}` | {item['width']} × {item['height']} | {item['bytes']} |")
    lines += ["", "Das Video-Feld bleibt leer. Die Smartphone-Dateien in ihrer nummerierten Reihenfolge hochladen.",
              "`VORSCHAU.png`, `manifest.json` und `raw/` sind keine Upload-Bilder.", "", "## Deutsche Alt-Texte", ""]
    for item in manifest["images"]:
        lines += [f"### {item['file']}", "", item["altDe"], ""]
    lines += ["## Herkunft", "", "Echte Aufnahmen der unveränderten Store-App auf eigenen Android-Emulatoren.",
              "Fiktive Daten wurden in der App eingegeben. Das Zählerfoto ist ein vorhandenes künstliches Beispielbild.",
              "OCR und PDF wurden durch die tatsächlichen App-Funktionen erzeugt.",
              "Die Emulator-APK wurde aus der vorhandenen AAB extrahiert und lokal für die Emulatorinstallation signiert.",
              "App-Assets, JavaScript und native Bibliotheken wurden byteweise gegen die AAB geprüft.",
              "Die Tablet-Bilder wurden auf eigenständigen Tablet-Profilen aufgenommen und nicht aus Smartphone-Bildern erzeugt.", "",
              "[Google-Play-Anforderungen](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)", ""]
    (out / "README.md").write_text("\n".join(lines))
    print(f"Validated {len(entries)} upload images and {compared} release assets/libraries")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    package(parser.parse_args().output)
