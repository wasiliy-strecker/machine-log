// Code-native layouts around unchanged, real Android screenshots. Node >= 22.
import { spawn, execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  rmSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const [mode, destination] = process.argv.slice(2);
if (!['assets', 'contact'].includes(mode) || !destination) {
  throw Error(
    'Usage: node scripts/store_assets/render.mjs assets|contact OUTPUT',
  );
}
const out = resolve(destination);
mkdirSync(out, { recursive: true });
const profile = mkdtempSync('/dev/shm/ml-assets-chrome-');
const chrome = spawn(
  'google-chrome',
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);
let socket;
try {
  for (let i = 0; !existsSync(join(profile, 'DevToolsActivePort')); i++) {
    if (i > 100) throw Error('Chrome did not start');
    await delay(100);
  }
  const port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split(
    '\n',
  )[0];
  const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(
    pages.find((p) => p.type === 'page').webSocketDebuggerUrl,
  );
  await new Promise((ok, fail) => {
    socket.onopen = ok;
    socket.onerror = fail;
  });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (pending.has(message.id)) {
      const { ok, fail } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) fail(Error(JSON.stringify(message.error)));
      else ok(message.result);
    }
  };
  const call = (method, params = {}) =>
    new Promise((ok, fail) => {
      pending.set(++id, { ok, fail });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const uri = (p) => pathToFileURL(resolve(p)).href;
  const font = `@font-face{font-family:Roboto;src:url('${uri('assets/ui/Roboto-Regular.ttf')}')}@font-face{font-family:Roboto;src:url('${uri('assets/ui/Roboto-Bold.ttf')}');font-weight:700}`;
  async function render(name, width, height, body, css = '') {
    const path = join(out, name);
    mkdirSync(resolve(path, '..'), { recursive: true });
    const html = join(out, 'raw/layouts', `${name}.html`);
    mkdirSync(resolve(html, '..'), { recursive: true });
    if (existsSync(`${path}.html`)) renameSync(`${path}.html`, html);
    writeFileSync(
      html,
      `<!doctype html><meta charset="utf-8"><style>${font}*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#fff;font-family:Roboto,sans-serif}${css}</style>${body}`,
    );
    await call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await call('Page.navigate', { url: uri(html) });
    await delay(100);
    const ready = await call('Runtime.evaluate', {
      expression:
        'Promise.all([document.fonts.ready,...Array.from(document.images).map(i=>i.decode())])',
      awaitPromise: true,
    });
    if (ready.exceptionDetails)
      throw Error(`Image/font loading failed for ${name}`);
    const result = await call('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    writeFileSync(path, Buffer.from(result.data, 'base64'));
    // Lossless RGB encoding only: no changes to the screenshot content.
    execFileSync('convert', [
      path,
      `${name === 'icon/app-icon.png' ? 'PNG32' : 'PNG24'}:${path}`,
    ]);
    console.log(path);
  }

  const frames = [
    ['01-uebersicht', 'Maschinenzähler\\nim Blick'],
    ['02-foto-ocr', 'Zählerstände aus Fotos\\nübernehmen'],
    ['03-verlauf', 'Ablesungen\\nnachvollziehen'],
    ['04-pdf', 'Produktionsprotokolle\\nals PDF'],
  ];
  if (mode === 'assets') {
    const logo = uri('assets/icon.png');
    await render(
      'icon/app-icon.png',
      512,
      512,
      `<img src="${logo}" width="512" height="512">`,
      'body{background:#006B63}',
    );
    const overview = uri(join(out, 'raw/phone/01-uebersicht.png'));
    await render(
      'feature/feature-graphic.png',
      1024,
      500,
      `<main><div class="brand"><img src="${logo}">MaschinenLog</div><h1>Zähler erfassen.<br>Produktion<br>dokumentieren.</h1><p>Foto-OCR · Verlauf · PDF</p></main><img class="screen" src="${overview}"><div class="circle"></div>`,
      'body{background:#006B63;color:#FAFDFB}main{position:absolute;left:64px;top:62px;z-index:2}.brand{display:flex;align-items:center;gap:12px;font-size:32px;font-weight:700}.brand img{width:52px;height:52px}h1{font-size:49px;line-height:1.12;letter-spacing:-1.4px;margin:30px 0 25px}p{font-size:20px;color:#BCECE2;margin:0}.screen{position:absolute;right:112px;top:36px;height:428px;width:auto;box-shadow:0 10px 35px #00373155;z-index:2}.circle{position:absolute;right:-130px;top:-80px;width:650px;height:650px;border:1px solid #87D5C655;border-radius:50%}',
    );
    for (let i = 0; i < frames.length; i++) {
      const [name, headline] = frames[i];
      const raw = join(out, `raw/phone/${name}.png`);
      if (!existsSync(raw)) throw Error(`Missing real capture: ${raw}`);
      await render(
        `phone/${name}.png`,
        1080,
        1920,
        `<header><div class="brand">MASCHINENLOG <span>· 0${i + 1}</span></div><h1>${headline.replace('\\n', '<br>')}</h1></header><img class="screen" src="${uri(raw)}">`,
        'body{background:#F0F5F3;color:#004E46}header{height:330px;padding:45px 70px 0}.brand{font-size:22px;font-weight:700;letter-spacing:2.8px}.brand span{color:#414A46}h1{font-size:62px;line-height:1.12;letter-spacing:-1.5px;margin:25px 0 0}.screen{display:block;height:1550px;width:auto;margin:0 auto;box-shadow:0 8px 26px #004E4620}',
      );
    }
  } else {
    let body = `<h1>MaschinenLog <span>Store-Bilder · Deutsch · 1.0.0 (3)</span></h1><section class="branding"><img src="${uri(join(out, 'icon/app-icon.png'))}"><img src="${uri(join(out, 'feature/feature-graphic.png'))}"></section>`;
    body += '<h2>Smartphone</h2><section class="grid phones">';
    for (const [name] of frames)
      body += `<figure><img src="${uri(join(out, `phone/${name}.png`))}"><figcaption>phone/${name}.png</figcaption></figure>`;
    body +=
      '</section><h2>7-Zoll-Tablet <span>10-Zoll-Tablet</span></h2><section class="grid tablets">';
    for (const folder of ['tablet7', 'tablet10'])
      for (const name of ['01-uebersicht', '02-pdf'])
        body += `<figure><img src="${uri(join(out, `${folder}/${name}.png`))}"><figcaption>${folder}/${name}.png</figcaption></figure>`;
    body += '</section>';
    await render(
      'VORSCHAU.png',
      1680,
      2040,
      body,
      'body{background:#F0F5F3;padding:40px;color:#004E46}h1{font-size:34px;margin:0 0 28px}h1 span{font-size:21px;font-weight:400;margin-left:20px}.branding{display:flex;gap:32px;height:240px}.branding img{height:100%;width:auto}h2{font-size:26px;margin:32px 0 20px}h2 span{position:absolute;left:850px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}figure{margin:0}figure img{width:100%;display:block}.tablets img{height:690px;object-fit:contain}figcaption{font-size:15px;margin-top:12px}',
    );
  }
} finally {
  socket?.close();
  chrome.kill();
  await delay(300);
  rmSync(profile, { recursive: true, force: true });
}
