// "Alex Orders a Pizza" — Scene 1: "Cheese Paradise Pizza, hello!" … "Ohhh… tasty ones."
// Audio: assets/audio/pizza_voiceover_full.mp3, 0–10.5s (+1.2 s end beat). No subtitles.
// Cuts follow the speaker: operator lines -> pizzeria, Alex lines -> his living room.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1 } = A;
  const T = window.TIMING;

  const OP_LINES = [[0.0, 1.99], [3.9, 5.05], [6.44, 7.95]];
  const ALEX_LINES = [[2.4, 3.65], [5.37, 6.0], [8.27, 10.36]];
  // shots: [start, 'alex' | 'op']
  const SHOTS = [[0, 'op'], [2.2, 'alex'], [3.78, 'op'], [5.22, 'alex'], [6.24, 'op'], [8.12, 'alex']];
  const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };

  // the same Alex as "First Flight" / hello clip, with natural hands
  const ALEX_LOOK = { smooth: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.18, handSc: 1.35 };
  const OP_LOOK = { kind: 'operator', outfit: 'pizzatee', smooth: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.12, handSc: 1.25, noLegs: true };

  // ---------------- Alex's living room (realistic, warm evening tones) ----------------
  let ROOM = null;
  function room() {
    if (ROOM) return ROOM;
    const o = [];
    o.push(`<defs>
      <linearGradient id="gRW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f7563"/><stop offset=".7" stop-color="#7c816c"/><stop offset="1" stop-color="#6a6f5d"/></linearGradient>
      <linearGradient id="gRF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5236"/><stop offset="1" stop-color="#5a3a25"/></linearGradient>
      <linearGradient id="gSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6f9a"/><stop offset=".55" stop-color="#d9927a"/><stop offset="1" stop-color="#f2c38f"/></linearGradient>
      <linearGradient id="gSun2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf94" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf94" stop-opacity="0"/></linearGradient>
      <radialGradient id="gLampR"><stop offset="0" stop-color="#ffd690" stop-opacity=".75"/><stop offset=".5" stop-color="#ffc070" stop-opacity=".25"/><stop offset="1" stop-color="#ffc070" stop-opacity="0"/></radialGradient>
      <linearGradient id="gSofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4e6170"/><stop offset="1" stop-color="#3b4b58"/></linearGradient>
      <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5c3c"/><stop offset="1" stop-color="#6b452c"/></linearGradient>
      <linearGradient id="gAO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <pattern id="pWall" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.2" fill="#000" opacity=".06"/><circle cx="12" cy="12" r="1" fill="#fff" opacity=".04"/></pattern>
      <filter id="fSoft"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>`);
    // walls with subtle texture, crown shadow
    o.push(`<rect x="-600" y="-600" width="2300" height="1900" fill="url(#gRW)"/><rect x="-600" y="-600" width="2300" height="1900" fill="url(#pWall)"/>`);
    o.push(`<rect x="-600" y="-600" width="2300" height="700" fill="url(#gAO)" opacity=".6"/>`);
    // wainscot panelling
    o.push(`<rect x="-600" y="960" width="2300" height="330" fill="#5f6555"/>`);
    for (const x of [-560, -260, 40, 340, 640, 940, 1240]) o.push(`<rect x="${x}" y="1000" width="260" height="250" rx="6" fill="none" stroke="#4f5446" stroke-width="7"/><rect x="${x + 4}" y="1004" width="252" height="4" fill="#fff" opacity=".06"/>`);
    o.push(`<rect x="-600" y="948" width="2300" height="16" fill="#8b8f79"/><rect x="-600" y="962" width="2300" height="5" fill="#000" opacity=".2"/>`);
    // window: evening sky, frame with depth, curtains
    o.push(`<rect x="548" y="248" width="444" height="584" rx="6" fill="#3d3a33"/>`);
    o.push(`<rect x="560" y="260" width="420" height="560" fill="url(#gSky2)"/>`);
    o.push(`<circle cx="840" cy="640" r="46" fill="#ffe2a8" opacity=".9"/>`);
    o.push(`<path d="M560 700l40-60 30 20 40-90 40 70 30-30 50 80 40-40 40 60 30-20 40 50V820H560Z" fill="#2f3446" opacity=".85"/>`);
    for (const [x, y] of [[612, 728], [690, 705], [756, 742], [832, 735], [900, 760]]) o.push(`<rect x="${x}" y="${y}" width="8" height="10" fill="#ffd27a" opacity=".85"/>`);
    o.push(`<path d="M560 260h420v560H560Z M574 274v532h189V274Z M777 274v532h189V274Z" fill="#e9dfcf" fill-rule="evenodd"/><path d="M560 540h420" stroke="#e9dfcf" stroke-width="14"/>`);
    o.push(`<rect x="536" y="812" width="468" height="24" rx="4" fill="#d9cdb9"/><rect x="536" y="834" width="468" height="10" fill="#000" opacity=".25"/>`);
    o.push(`<rect x="500" y="222" width="540" height="14" rx="7" fill="#3a2a1d"/>`);
    o.push(`<path d="M508 236h110c-14 200 22 420 4 640H496c16-220-8-420 12-640Z" fill="#8e3f35"/><path d="M540 236c-6 210 10 430 0 640" stroke="#6f2f28" stroke-width="10" fill="none" opacity=".7"/>`);
    o.push(`<path d="M922 236h110c12 220-14 420 4 640H926c-14-200 12-420-4-640Z" fill="#8e3f35"/><path d="M1000 236c6 210-10 430 0 640" stroke="#6f2f28" stroke-width="10" fill="none" opacity=".7"/>`);
    // bookshelf (left)
    o.push(`<rect x="40" y="300" width="380" height="650" fill="#4a3322"/><rect x="52" y="312" width="356" height="626" fill="#352418"/>`);
    const bookCols = ['#8e3f35', '#c49a4a', '#4e6170', '#6d7b52', '#a7695a', '#d9cdb9', '#5b4a7a'];
    for (let r = 0; r < 4; r++) {
      const y = 312 + r * 157;
      o.push(`<rect x="52" y="${y + 145}" width="356" height="12" fill="#5a3f2a"/>`);
      let x = 62;
      for (let i = 0; x < 380; i++) {
        const w = 18 + ((i * 7 + r * 3) % 4) * 6, h = 100 + ((i * 13 + r * 5) % 5) * 9;
        if ((i + r) % 6 === 4) { x += 26; continue; }
        o.push(`<rect x="${x}" y="${y + 145 - h}" width="${w}" height="${h}" rx="2" fill="${bookCols[(i + r * 2) % bookCols.length]}"/><rect x="${x + 3}" y="${y + 160 - h}" width="${w - 6}" height="4" fill="#fff" opacity=".2"/>`);
        x += w + 3;
      }
    }
    o.push(`<path d="M300 469l10-34h40l10 34Z" fill="#b9a487"/><path d="M330 435c-14-26 0-40 10-30-4 10-6 20-10 30Z" fill="#6d7b52"/>`);
    // framed picture above the sofa area
    o.push(`<rect x="-310" y="470" width="300" height="220" fill="#3a2a1d"/><rect x="-296" y="484" width="272" height="192" fill="#c9b79a"/><path d="M-280 650l70-90 50 60 40-40 80 70Z" fill="#6d7b52"/><circle cx="-90" cy="530" r="20" fill="#e8b46a"/>`);
    // floor: planks + reflection of the window light
    o.push(`<rect x="-600" y="1290" width="2300" height="1000" fill="url(#gRF)"/>`);
    let y = 1290, gap = 26, row = 0;
    while (y < 2300) { o.push(`<rect x="-600" y="${y}" width="2300" height="3" fill="#3f2818" opacity=".55"/>`); for (let x = -600 + (row % 3) * 140; x < 1700; x += 420) o.push(`<rect x="${x}" y="${y}" width="3" height="${gap}" fill="#3f2818" opacity=".45"/>`); y += gap; gap *= 1.14; row++; }
    o.push(`<rect x="-600" y="1278" width="2300" height="16" fill="#4a3322"/><rect x="-600" y="1294" width="2300" height="40" fill="url(#gAO)"/>`);
    o.push(`<path d="M560 1300H980L1160 1900H380Z" fill="url(#gSun2)" opacity=".7"/>`);
    // rug with pattern
    o.push(`<ellipse cx="540" cy="1655" rx="500" ry="92" fill="#000" opacity=".25" filter="url(#fSoft)"/>`);
    o.push(`<ellipse cx="540" cy="1645" rx="490" ry="86" fill="#8b5a48"/><ellipse cx="540" cy="1645" rx="440" ry="70" fill="none" stroke="#c99a6f" stroke-width="10"/><ellipse cx="540" cy="1645" rx="380" ry="54" fill="#9c6853"/><ellipse cx="540" cy="1645" rx="300" ry="38" fill="none" stroke="#c99a6f" stroke-width="5" stroke-dasharray="18 12"/>`);
    // sofa (left), with cushions and a throw
    o.push(`<ellipse cx="-40" cy="1330" rx="330" ry="26" fill="#000" opacity=".35" filter="url(#fSoft)"/>`);
    o.push(`<rect x="-330" y="1040" width="560" height="190" rx="36" fill="url(#gSofa)"/><rect x="-350" y="1170" width="600" height="140" rx="32" fill="#56697a"/><rect x="-370" y="1110" width="80" height="200" rx="30" fill="#4a5c6b"/><rect x="190" y="1110" width="80" height="200" rx="30" fill="#4a5c6b"/>`);
    o.push(`<rect x="-270" y="1080" width="150" height="120" rx="26" fill="#c49a4a" transform="rotate(-8 -195 1140)"/><rect x="-100" y="1090" width="140" height="110" rx="26" fill="#8e3f35" transform="rotate(6 -30 1145)"/>`);
    o.push(`<path d="M80 1170c40-10 90 0 120 20l10 110c-40 10-90 6-120-10Z" fill="#d9cdb9"/><path d="M96 1190l90 12M94 1220l92 12M96 1250l86 10" stroke="#b9a487" stroke-width="4"/>`);
    o.push(`<rect x="-320" y="1306" width="22" height="30" fill="#2b1f15"/><rect x="200" y="1306" width="22" height="30" fill="#2b1f15"/>`);
    // floor lamp (right) with warm glow
    o.push(`<circle cx="930" cy="880" r="300" fill="url(#gLampR)"/>`);
    o.push(`<rect x="924" y="900" width="10" height="470" fill="#2b2b2b"/><ellipse cx="929" cy="1372" rx="56" ry="12" fill="#2b2b2b"/><path d="M866 900h126l-24-110h-78Z" fill="#f0d9a8" stroke="#b9945a" stroke-width="4"/><path d="M880 900h98" stroke="#fff3c9" stroke-width="6" opacity=".8"/>`);
    o.push(`<ellipse cx="929" cy="1380" rx="120" ry="18" fill="#000" opacity=".3" filter="url(#fSoft)"/>`);
    // big plant in a pot (far right)
    o.push(`<path d="M1010 1300l-16-140h120l-16 140Z" fill="#b5644a" stroke="#7a3f2c" stroke-width="5"/><g fill="#3f5a3a"><path d="M1054 1160c-70-60-100-180-66-220 34 44 60 140 66 220Z"/><path d="M1054 1160c0-100 34-190 90-220 6 70-34 170-90 220Z"/><path d="M1054 1160c-26-90-20-190 6-250 24 76 18 176-6 250Z" fill="#4f6f47"/></g>`);
    // warm ambient + soft corner shadows
    o.push(`<rect x="-600" y="-600" width="2300" height="2900" fill="#ffb066" opacity=".06"/>`);
    o.push(`<rect x="-600" y="-600" width="500" height="2900" fill="#000" opacity=".12" filter="url(#fSoft)"/><rect x="1200" y="-600" width="500" height="2900" fill="#000" opacity=".12" filter="url(#fSoft)"/>`);
    ROOM = o.join('');
    return ROOM;
  }

  // ---------------- pizzeria (warm but light) ----------------
  let SHOP = null;
  function shop(t) {
    if (!SHOP) {
      const o = [];
      o.push(`<defs>
        <linearGradient id="gPW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf3e4"/><stop offset="1" stop-color="#f6e4cb"/></linearGradient>
        <radialGradient id="gOven"><stop offset="0" stop-color="#ffcf6b"/><stop offset=".6" stop-color="#ff8a3d"/><stop offset="1" stop-color="#c94a1f"/></radialGradient>
        <linearGradient id="gDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a873"/><stop offset="1" stop-color="#b9864f"/></linearGradient>
      </defs>`);
      o.push(`<rect x="-600" y="-600" width="2300" height="2600" fill="url(#gPW)"/>`);
      // checkered tile strip + menu board
      for (let x = -600; x < 1700; x += 60) for (let r = 0; r < 2; r++) o.push(`<rect x="${x + (r % 2) * 30}" y="${900 + r * 30}" width="30" height="30" fill="#e0453a" opacity=".85"/>`);
      o.push(`<rect x="-600" y="960" width="2300" height="12" fill="#fbf7f1"/>`);
      o.push(`<rect x="80" y="260" width="400" height="300" rx="16" fill="#3a3f3c" stroke="#8a5d38" stroke-width="12"/>`);
      o.push(`<text x="280" y="330" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="44" fill="#f6f1e6">MENU</text>`);
      const items = [['Margherita', '9'], ['Pepperoni', '11'], ['Four Cheese', '12'], ['Veggie', '10']];
      items.forEach(([n, pr], i) => { o.push(`<text x="115" y="${385 + i * 44}" font-family="Fredoka" font-weight="600" font-size="30" fill="#f6f1e6">${n}</text><text x="445" y="${385 + i * 44}" text-anchor="end" font-family="Fredoka" font-weight="600" font-size="30" fill="#f2c45a">$${pr}</text>`); });
      // logo sign
      o.push(`<g transform="translate(790 300)"><circle r="110" fill="#f6f1e6" stroke="#e0453a" stroke-width="12"/><path d="M0 -62L54 40H-54Z" fill="#f2c45a" stroke="#8a5d38" stroke-width="6" stroke-linejoin="round"/><circle cx="-12" cy="10" r="9" fill="#c0392b"/><circle cx="14" cy="22" r="9" fill="#c0392b"/><circle cx="2" cy="-18" r="8" fill="#c0392b"/><path d="M-80 70Q0 100 80 70" fill="none" stroke="#e0453a" stroke-width="0"/></g>`);
      o.push(`<text x="790" y="470" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="40" fill="#e0453a">CHEESE PARADISE</text>`);
      // brick oven (right) + pizza boxes (left)
      o.push(`<path d="M820 980V700Q820 560 980 560Q1140 560 1140 700V980Z" fill="#c9704a" stroke="#8a4a30" stroke-width="8"/>`);
      for (let y = 600; y < 980; y += 40) for (let x = 830 + ((y / 40) % 2) * 30; x < 1140; x += 60) o.push(`<rect x="${x}" y="${y}" width="56" height="36" rx="4" fill="none" stroke="#a85a3b" stroke-width="3" opacity=".7"/>`);
      o.push(`<rect x="-200" y="740" width="230" height="240" fill="none"/>`);
      for (let i = 0; i < 5; i++) o.push(`<rect x="-150" y="${930 - i * 40}" width="240" height="38" rx="5" fill="#e9cfa5" stroke="#b98f5c" stroke-width="4"/><circle cx="-30" cy="${949 - i * 40}" r="10" fill="#e0453a" opacity=".8"/>`);
      SHOP = o.join('');
    }
    const flick = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7);
    return SHOP + `<path d="M890 980V760Q890 680 980 680Q1070 680 1070 760V980Z" fill="url(#gOven)" opacity="${f1(flick)}"/>` +
      `<g fill="#ffdf8a" opacity=".8">${[0, 1, 2].map(i => { const k = (t * 0.6 + i / 3) % 1; return `<circle cx="${f1(950 + i * 30 + Math.sin(k * 6) * 8)}" cy="${f1(740 - k * 160)}" r="${f1(4 + k * 3)}" opacity="${f1(1 - k)}"/>`; }).join('')}</g>`;
  }
  function desk() {
    // counter in front of the operator, with a computer screen + order pad
    return `<rect x="-200" y="1390" width="1480" height="700" fill="url(#gDesk)"/><rect x="-200" y="1380" width="1480" height="28" rx="6" fill="#e4b886" stroke="#9c6d3d" stroke-width="4"/>` +
      `<rect x="640" y="1190" width="300" height="200" rx="14" fill="#2b2f33" stroke="#141414" stroke-width="6"/><rect x="656" y="1206" width="268" height="168" rx="8" fill="#cfe7f5"/>` +
      `<path d="M676 1236h150M676 1266h200M676 1296h120" stroke="#7ea7c4" stroke-width="10" stroke-linecap="round"/><rect x="772" y="1388" width="36" height="10" fill="#2b2f33"/>` +
      `<g transform="translate(190 1395) rotate(-6)"><rect x="-70" y="-10" width="140" height="22" rx="4" fill="#fffdf6" stroke="#b9a487" stroke-width="3"/></g>` +
      `<g transform="translate(330 1376)"><path d="M-30 0h60l-6 -60h-48Z" fill="#fff" stroke="#b9a487" stroke-width="4"/><path d="M-20 -60c0-20 10-20 10-34M6 -60c0-20 10-20 10-34" stroke="#e0453a" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  }

  // ---------------- characters ----------------
  function phone(head, s, side) {
    // smartphone held against the ear (drawn between the head and the hand)
    const x = head[0] + side * 0.98 * CH.R * s, y = head[1] + 0.12 * CH.R * s;
    return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${side * 8}) scale(${f1(s)})"><rect x="-16" y="-44" width="32" height="92" rx="9" fill="#e9edf2" stroke="#141414" stroke-width="5"/><rect x="-11" y="-36" width="22" height="70" rx="4" fill="#7fb6e0"/></g>`;
  }

  function alexPose(t) {
    const S = 1.75;
    const p = Object.assign({ x: 540, y: 1180, sc: S }, ALEX_LOOK);
    p.legL = [-8, 2]; p.legR = [8, -2];
    const breathe = Math.sin(t * 2);
    p.y -= Math.abs(breathe) * 3; p.lean = breathe * 1;
    p.headTilt = -4 + wob(t, 0.5, 2) * 2;
    const head = CH.headPos(p);
    // right hand holds the phone at the ear (fixed, no extra motion); left arm relaxed
    const ear = [head[0] + 1.08 * CH.R * S * 1.12, head[1] + 0.45 * CH.R * S];
    p.armR = CH.armIK(p, 1, ear[0], ear[1], 1);
    p.handR = 'glove'; p.handAbsR = 205; p.thumbR = -1;
    p.armL = CH.armIK(p, -1, p.x - 82 * S, p.y - 4 * S, -1);
    p.handL = 'glove'; p.handAbsL = 8; p.thumbL = -1;
    const f = { turn: 0.05, look: [0, 0], mouth: 'smile', open: 0, brow: 0.35, browTilt: 0, eye: 1.08, pupil: 1.1 };
    f.blink = blink(t, [2.9, 6.1, 9.1, 11.2]);
    // "Hey, I want a pizza." — eager
    if (t >= 2.3 && t < 3.8) { f.brow = 0.55; f.eye = 1.15; }
    // "A round one." — completely serious
    if (t >= 5.2 && t < 6.25) { f.brow = 0.2; f.browTilt = -0.1; f.mouth = 'flat'; f.eye = 1.05; }
    // "Ohhh… tasty ones." — thinks (eyes up), then pleased with his answer
    if (t >= 8.1) {
      const think = t < 9.45;
      f.look = think ? [0.3, -0.8] : [0, 0]; f.brow = think ? 0.6 : 0.45; f.mouth = t > 10.4 ? 'smile' : 'flat';
      p.headTilt += think ? 6 : 0;
      if (t > 10.4) f.lid = 0.15;
    }
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return { p, head, S };
  }

  function opPose(t) {
    const S = 1.75;
    const p = Object.assign({ x: 470, y: 1500, sc: S, legs: false }, OP_LOOK);
    p.lean = wob(t, 0.4, 3) * 1.2;
    p.headTilt = 3 + wob(t, 0.5, 5) * 2;
    // hands resting on the counter / keyboard (tiny typing taps), nothing fancy
    const tap = (t > 6.4 && t < 7.9) ? Math.max(0, Math.sin(t * 16)) * 6 : 0;
    p.armL = CH.armIK(p, -1, p.x - 215, 1392, -1); p.handL = 'glove'; p.handAbsL = 12; p.thumbL = 1;
    p.armR = CH.armIK(p, 1, p.x + 215, 1388 - tap, 1); p.handR = 'glove'; p.handAbsR = -12; p.thumbR = -1;
    const f = { turn: 0.1, look: [0.2, 0], mouth: 'smile', open: 0, brow: 0.4, browTilt: 0, eye: 1.05, pupil: 1.05 };
    f.blink = blink(t, [0.9, 4.6, 7.6]);
    // after "A round one." — blank stare
    if (t >= 6.1 && t < 6.45) { f.mouth = 'flat'; f.eye = 1.15; f.pupil = 0.8; f.brow = 0.6; }
    if (t >= 6.44) { f.brow = 0.55; f.browTilt = 0.25; f.eye = 1.1; }        // "I meant… what toppings?"
    const s = LIPSYNC.talk(T, t, OP_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const [t0, who] = shotAt(t);
    const local = t - t0;
    const o = [`<defs>${CH.defs()}</defs>`];
    if (who === 'alex') {
      const z = 1.0 + local * 0.025;                                   // slow push-in
      const { p, head, S } = alexPose(t);
      o.push(`<g transform="translate(540 960) scale(${z.toFixed(4)}) translate(-540 -${f1(960 - 30)})">`);
      o.push(room());
      o.push(`<ellipse cx="540" cy="1700" rx="240" ry="32" fill="#000" opacity=".35" filter="url(#fSoft)"/>`);
      o.push(CH.figure(p));
      o.push(phone(head, S * 1.12, 1));
      o.push(CH.figure(Object.assign({}, p, { _handsOnly: 'R' })));      // hand over the phone
      o.push('</g>');
    } else {
      const z = 1.0 + local * 0.025;
      const p = opPose(t);
      o.push(`<g transform="translate(540 960) scale(${z.toFixed(4)}) translate(-540 -${f1(960 - 40)})">`);
      o.push(shop(t));
      o.push(CH.figure(p));
      o.push(desk());
      o.push(CH.figure(Object.assign({}, p, { _handsOnly: 'LR' })));    // hands on top of the counter
      o.push('</g>');
    }
    o.push(`<defs><radialGradient id="gVigZ" cx=".5" cy=".5" r=".78"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2a1a" stop-opacity=".18"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigZ)"/>`);
    // tiny call indicator on the operator shots
    if (who === 'op') o.push(`<g transform="translate(940 140)" opacity=".9"><rect x="-70" y="-30" width="140" height="60" rx="30" fill="#2fbf71"/><path d="M-36 -8c4 14 14 24 28 28l8-8c2-2 5-2 7 0l8 6c2 2 2 5 0 7c-6 8-20 8-36-6c-16-16-16-30-6-36c2-2 5-2 7 0l6 8c2 2 2 5 0 7Z" fill="#fff" transform="translate(-6 -2) scale(.9)"/><text x="22" y="10" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="26" fill="#fff">${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}</text></g>`);
    svg.innerHTML = o.join('');
  };
})();
