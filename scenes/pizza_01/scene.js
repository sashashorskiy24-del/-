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

  // ---------------- Alex's living room (light, airy) ----------------
  let ROOM = null;
  function room() {
    if (ROOM) return ROOM;
    const o = [];
    o.push(`<defs>
      <linearGradient id="gRW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f1e8"/><stop offset="1" stop-color="#efe5d6"/></linearGradient>
      <linearGradient id="gRF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6d2b5"/><stop offset="1" stop-color="#d7bf9d"/></linearGradient>
      <linearGradient id="gSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d4f2"/><stop offset="1" stop-color="#e4f2fb"/></linearGradient>
      <linearGradient id="gSun2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".7"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
      <radialGradient id="gLampR"><stop offset="0" stop-color="#ffe9b8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></radialGradient>
    </defs>`);
    o.push(`<rect x="-600" y="-600" width="2300" height="2200" fill="url(#gRW)"/>`);
    // soft wall panels
    for (const x of [-420, -60, 300, 660, 1020]) o.push(`<rect x="${x}" y="980" width="300" height="300" rx="10" fill="none" stroke="#e6d9c6" stroke-width="6"/>`);
    o.push(`<rect x="-600" y="950" width="2300" height="14" fill="#fbf7f1"/>`);
    // big window with sheer curtains
    o.push(`<rect x="560" y="260" width="420" height="560" rx="14" fill="url(#gSky2)"/>`);
    o.push(`<g fill="#fff" opacity=".9"><ellipse cx="680" cy="380" rx="70" ry="20"/><ellipse cx="710" cy="365" rx="40" ry="22"/><ellipse cx="880" cy="470" rx="60" ry="16"/></g>`);
    o.push(`<path d="M560 700Q640 650 720 690T880 680T980 700V820H560Z" fill="#cfe3c4"/><path d="M560 760Q700 720 820 760T980 750V820H560Z" fill="#b6d3a8"/>`);
    o.push(`<path d="M560 260h420v560H560Z M574 274v532h189V274Z M777 274v532h189V274Z" fill="#fbf7f1" fill-rule="evenodd"/>`);
    o.push(`<rect x="540" y="812" width="460" height="22" rx="6" fill="#fbf7f1"/>`);
    o.push(`<rect x="520" y="226" width="500" height="12" rx="6" fill="#c9b8a0"/>`);
    o.push(`<path d="M528 238h80c-8 200 18 400 4 600h-92c10-200-6-400 8-600Z" fill="#fffaf3" opacity=".9"/><path d="M932 238h80c8 200-10 400 4 600h-92c-12-200 14-400 8-600Z" fill="#fffaf3" opacity=".9"/>`);
    o.push(`<path d="M560 834L980 834L1180 1600L360 1600Z" fill="url(#gSun2)" opacity=".55"/>`);
    // framed pictures + shelf with plants
    o.push(`<rect x="90" y="330" width="170" height="210" rx="8" fill="#fff" stroke="#d9c7ad" stroke-width="8"/><path d="M110 510L160 430L200 480L230 450L240 510Z" fill="#b9d6c1"/><circle cx="210" cy="390" r="18" fill="#f3d38c"/>`);
    o.push(`<rect x="290" y="390" width="130" height="150" rx="8" fill="#fff" stroke="#d9c7ad" stroke-width="8"/><circle cx="355" cy="465" r="40" fill="#f0c2b5"/>`);
    o.push(`<rect x="80" y="640" width="360" height="14" rx="5" fill="#c9b8a0"/>`);
    o.push(`<path d="M110 640l8-50h50l8 50Z" fill="#e8ddcc"/><path d="M143 590c-22-34-4-52 8-42-6 12-8 26-8 42Zm0 0c10-36 32-44 38-32-14 8-26 18-38 32Z" fill="#7fae86"/>`);
    o.push(`<rect x="230" y="598" width="26" height="42" rx="4" fill="#9fc0d8"/><rect x="262" y="590" width="22" height="50" rx="4" fill="#f0c2b5"/><rect x="290" y="604" width="28" height="36" rx="4" fill="#e9d79b"/>`);
    o.push(`<path d="M360 640l6-28h42l6 28Z" fill="#fff" stroke="#d9c7ad" stroke-width="4"/>`);
    // floor + rug
    o.push(`<rect x="-600" y="1280" width="2300" height="1000" fill="url(#gRF)"/><rect x="-600" y="1272" width="2300" height="14" fill="#fbf7f1"/>`);
    for (let i = 0; i < 9; i++) o.push(`<path d="M-600 ${1320 + i * i * 9}H1700" stroke="#cdb391" stroke-width="3" opacity=".45"/>`);
    o.push(`<ellipse cx="540" cy="1640" rx="470" ry="80" fill="#f4ece0"/><ellipse cx="540" cy="1640" rx="410" ry="62" fill="none" stroke="#e3d3bd" stroke-width="8"/>`);
    // light sofa on the left, floor lamp and plant on the right
    o.push(`<rect x="-300" y="1080" width="520" height="210" rx="40" fill="#dfe3e6"/><rect x="-310" y="1200" width="560" height="120" rx="34" fill="#e8ebee"/><rect x="-250" y="1110" width="150" height="110" rx="24" fill="#c9d8e4"/><rect x="-80" y="1110" width="150" height="110" rx="24" fill="#f3d9cf"/>`);
    o.push(`<rect x="-280" y="1318" width="20" height="40" fill="#b9a487"/><rect x="200" y="1318" width="20" height="40" fill="#b9a487"/>`);
    o.push(`<circle cx="910" cy="900" r="220" fill="url(#gLampR)"/><rect x="904" y="920" width="10" height="440" fill="#b9a487"/><ellipse cx="909" cy="1362" rx="50" ry="10" fill="#b9a487"/><path d="M860 920h98l-18-90h-62Z" fill="#fff6e3" stroke="#e6d6b8" stroke-width="4"/>`);
    o.push(`<path d="M1000 1290l-14-130h110l-14 130Z" fill="#f4ece0" stroke="#d9c7ad" stroke-width="4"/><g fill="#7fae86"><path d="M1041 1160c-60-50-90-160-60-200 30 40 54 130 60 200Z"/><path d="M1041 1160c0-90 30-170 80-200 6 60-30 150-80 200Z"/><path d="M1041 1160c-24-80-18-170 6-230 22 70 16 160-6 230Z" fill="#94c19a"/></g>`);
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
      o.push(`<ellipse cx="540" cy="1700" rx="230" ry="30" fill="#000" opacity=".12"/>`);
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
