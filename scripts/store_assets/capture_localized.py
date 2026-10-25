"""Capture the actual AAB-derived app with synthetic backups on dedicated AVDs."""
import argparse
import json
import hashlib
from pathlib import Path
import re
import shlex
import time
import subprocess
from capture import Capture, PACKAGE

ROOT = Path(__file__).resolve().parents[2]


class LocalizedCapture(Capture):
    def __init__(self, serial, locale, output, fixture):
        super().__init__(serial)
        self.locale, self.output, self.fixture = locale, output, fixture
        self.copy = json.loads((ROOT / 'store' / locale / 'copy.json').read_text())
        self.strings = json.loads((ROOT / 'src/core/localization/messages' / (self.copy['language'] + '.json')).read_text())
        self.ids = json.loads((fixture / 'fixture.json').read_text())['counters'][0]
        installed = self.run('shell','pm','path',PACKAGE).decode().strip().removeprefix('package:')
        self.installed_sha = self.run('shell','sha256sum',shlex.quote(installed)).decode().split()[0]
        if self.installed_sha != hashlib.sha256((output.parent/'raw/store.apk').read_bytes()).hexdigest():
            raise ValueError('Installed APK differs from the final capture source')

    def start(self):
        super().start()
        for _ in range(15):
            if self.has(self.copy['name']) or self.has('Machine Log'): return
            nodes=list(self.nodes())
            waiting=[n for n in nodes if n.get('resource-id','').endswith('/aerr_wait')]
            text=' '.join(n.get('text','') for n in nodes).lower()
            # A fresh AVD can show a System UI startup timeout after its locale restart.
            # Never dismiss an ANR belonging to the app under test.
            if waiting and any(word in text for word in ['system-ui','system ui','sistema','interface']):
                print('Waiting for emulator System UI to recover',flush=True)
                self.tap_node(waiting[0])
                time.sleep(2)
                continue
            time.sleep(.5)
        raise ValueError('App dashboard did not become ready')

    def key(self, key):
        self.tap(self.strings[key])

    def seek(self, key):
        self.reveal(self.strings[key])

    def contains(self, text):
        matches = [n for n in self.nodes() if text in (n.get('text', '') + n.get('content-desc', '')) and self.visible(n)]
        if not matches:
            raise ValueError(f'Visible text not found: {text}')
        self.tap_node(matches[-1])

    def tap_node(self, node):
        a,b,c,d = map(int, re.findall(r'\d+',node.get('bounds')))
        self.run('shell','input','tap',str((a+c)//2),str((b+d)//2))
        time.sleep(.8)

    def link(self, path):
        self.run('shell','am','start','-W','-a','android.intent.action.VIEW','-d',shlex.quote('maschinenlog://' + path), PACKAGE)
        time.sleep(2)

    def screenshot(self, profile, name):
        path = self.output / 'raw' / profile / (name + '.png')
        super().capture(path)
        metadata=json.loads(path.with_suffix('.json').read_text())
        metadata.update(locale=self.locale,installedApkSha256=self.installed_sha)
        path.with_suffix('.json').write_text(json.dumps(metadata,indent=2)+'\n')
        path.with_suffix('.xml').write_bytes(self.run('shell','cat','/sdcard/ml-store-ui.xml'))

    def restore(self):
        self.start()
        name = 'Demo-' + self.locale + '.mlbackup'
        self.run('push',str(self.fixture / 'Demo.mlbackup'),'/sdcard/Download/' + name)
        self.run('push',str(ROOT / 'assets/photo-examples/01_fertigung_012480_stueck.jpg'),'/sdcard/Pictures/Production.jpg')
        self.run('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d','file:///sdcard/Pictures/Production.jpg')
        self.link('settings')
        self.seek('restoreBackup')
        self.key('restoreBackup')
        time.sleep(2)
        if not self.has(name):
            # Open Downloads through the system file picker. Resource IDs work in every language.
            buttons=[n for n in self.nodes() if n.get('class') == 'android.widget.ImageButton' and n.get('package','').endswith('documentsui')]
            if not buttons: raise ValueError('System file picker navigation missing')
            self.tap_node(buttons[0])
            time.sleep(.8)
            downloads = [n for n in self.nodes() if n.get('text','') in ['Downloads','Descargas','Téléchargements','Download']]
            if not downloads: raise ValueError('System Downloads root missing')
            self.tap_node(downloads[-1])
        self.tap(name)
        time.sleep(1)
        self.field(self.strings['password'], 'Demo2026')
        self.key('next')
        for _ in range(20):
            if self.has(self.strings['restore']): break
            time.sleep(.5)
        self.key('restore')
        time.sleep(3)
        self.start()

    def open_counter(self):
        self.start()
        self.link('counter/' + self.ids['counterId'])

    def history(self):
        self.start()
        self.link('record/history?id=' + self.ids['recordId'] + '&counterId=' + self.ids['counterId'])

    def pdf(self):
        self.open_counter()
        self.seek('zaehlerverlaufsprotokollErstellen')
        self.key('zaehlerverlaufsprotokollErstellen')
        self.key('compactWithoutAttachments')
        time.sleep(4)
        if not self.has(self.strings['share']) and not self.has(self.strings['sharePdf']):
            raise ValueError('Expected rendered PDF actions')

    def capture_profile(self, profile):
        subprocess.run(['python3', str(ROOT/'scripts/store_assets/device.py'), self.serial, 'status'],check=True,stdout=subprocess.DEVNULL)
        self.start()
        list(self.nodes())
        self.screenshot(profile,'01-overview')
        self.link('settings')
        list(self.nodes())
        self.screenshot(profile,'06-settings')
        self.history()
        list(self.nodes())
        self.screenshot(profile,'03-history')
        if profile == 'phone':
            self.contains('12480')
            self.align_details()
            list(self.nodes())
            self.screenshot(profile,'04-details')
        self.pdf()
        list(self.nodes())
        self.screenshot(profile,'05-pdf')
        if profile == 'phone':
            self.ocr(profile)
        if profile == 'phone' and self.locale == 'de-DE':
            self.verify_language_selection()

    def ocr(self, profile):
        self.open_counter()
        self.key('erfassenFotografieren')
        self.key('photoFromGallery')
        time.sleep(2)
        images=[n for n in self.nodes() if n.get('resource-id','').endswith('/icon_thumbnail')]
        if not images: raise ValueError('Synthetic OCR photo missing from picker')
        self.tap_node(images[0])
        time.sleep(5)
        self.run('shell','input','swipe',str(self.width//2),str(int(self.height*.8)),str(self.width//2),str(int(self.height*.58)),'650')
        time.sleep(.6)
        if not any('12480' in (n.get('text','')+n.get('content-desc','')) for n in self.nodes()):
            raise ValueError('Real OCR did not recognize 12480')
        self.screenshot(profile,'02-ocr')
        self.back()
        self.tap(self.strings['discardEntry'].rstrip('?'))
        self.start()

    def align_details(self):
        for _ in range(6):
            values=[n for n in self.nodes() if '12480' in n.get('text','') and len(n.get('text','')) < 80]
            if not values: return
            _,y,_,bottom=map(int,re.findall(r'\d+',values[0].get('bounds')))
            distance=y-self.height*.19 if bottom>y else -self.height*.12
            if bottom>y and abs(distance)<40: return
            shift=max(-self.height*.25,min(self.height*.25,distance))
            self.run('shell','input','swipe',str(self.width//2),str(int(self.height*.75)),str(self.width//2),str(int(self.height*.75-shift)),'1000')
            time.sleep(.5)

    def verify_language_selection(self):
        self.link('settings')
        targets=[n for n in self.nodes() if n.get('content-desc','').split(',')[0] == self.strings['language'] and n.get('clickable') == 'true']
        if not targets: raise ValueError('Language selector missing')
        self.tap_node(targets[0])
        self.tap('English')
        time.sleep(1)
        if not self.has('Language'): raise ValueError('In-app language change failed')
        self.start()
        self.link('settings')
        if not self.has('Language'): raise ValueError('Language did not survive cold start')
        self.capture(self.output/'qa'/'english-with-german-region.png')
        self.link('counter/' + json.loads((self.fixture/'fixture.json').read_text())['counters'][2]['counterId'])
        if not any('334,5' in (n.get('text','') + n.get('content-desc','')) for n in self.nodes()):
            raise ValueError('App language changed the independent decimal region')
        self.capture(self.output/'qa'/'english-regional-number.png')
        self.link('settings')
        targets=[n for n in self.nodes() if n.get('content-desc','').split(',')[0] == 'Language' and n.get('clickable') == 'true']
        self.tap_node(targets[0])
        self.tap('System language')
        time.sleep(1)
        if not self.has(self.strings['language']): raise ValueError('System language restoration failed')
        (self.output/'qa'/'language-selection.json').write_text(json.dumps(dict(persistentSelection=True,coldStart=True,independentRegion='de-DE',systemLanguageRestored=True),indent=2)+'\n')


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('serial')
    parser.add_argument('locale')
    parser.add_argument('output',type=Path)
    parser.add_argument('fixture',type=Path)
    parser.add_argument('profile',choices=['phone','tablet7','tablet10'])
    parser.add_argument('--stage',choices=['restore','capture','all'],default='all')
    args=parser.parse_args()
    c=LocalizedCapture(args.serial,args.locale,args.output,args.fixture)
    if args.stage in ['restore','all']: c.restore()
    if args.stage in ['capture','all']: c.capture_profile(args.profile)
