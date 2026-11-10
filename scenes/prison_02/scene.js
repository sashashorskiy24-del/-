// "Alex Doesn't Want to Leave Prison" — Scene 2: the argument with the guard.
// Voice-over: assets/audio/prison_voiceover_full.mp3, 20.9s–41.45s (continues right where scene 1 ends).
// The cell, bars, bunk bed, palette and character looks are the same as scene 1 (shared block below is copied 1:1).
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s, end = i => W[i].e;

  // ---------------- who speaks when (from the word timings / silences) ----------------
  const GUARD_LINES = [[at(7), 7.18], [at(47), 20.32]];   // "Are you out of your mind?! …" / "Alright, that's it! …"
  const ALEX_LINES = [[at(30), 13.62]];                     // "But… can I please stay? I promise I'll be good!"
  const K = {
    stared: at(2),          // 0.78  narrator: "The guard stared at him in disbelief."
    mind: at(7),            // 2.62  guard: "Are you out of your mind?!"
    youre: at(13),          // 4.30  "You're FREE!"
    FREE: at(14),           // 4.62
    whatever: at(15),       // 5.42  "You can do whatever you want out there!"
    there: at(21),          // 6.78  "out there"
    guardEnd1: 7.18,
    sad: at(23),            // 7.66  narrator: "Alex looked at him with sad eyes."
    but: at(30),            // 10.14 Alex: "But… can I please stay?"
    please: at(33),         // 11.10
    promise: at(35),        // 12.30 "I promise I'll be good!"
    alexEnd: 13.62,
    sighed: at(40),         // 14.06 narrator: "The guard sighed and closed his folder."
    sigh: at(42),           // 14.70
    closed: at(44),         // 15.34
    alright: at(47),        // 16.78 guard: "Alright, that's it!"
    sick: at(51),           // 18.14 "I'm sick of this!"
    warden: at(55),         // 19.18 "I'm going to get the warden!"
    guardEnd2: 20.32,
  };

  // ---------------- layout ----------------
  const FLOOR_CELL = 1360, FLOOR_FRONT = 1500;
  const ALEX = { sc: 0.85, standX: 585, standFeet: 1480 };
  const GUARD = { sc: 1.0, x: 1080, feet: 1660 };
  const PILLOW = [735, 1190];
  const hipY = (feet, sc) => feet - (138 + 128 + 14) * sc;
  const BARS = [60, 210, 360, 510, 660, 810, 960];
  const ALEX_LOOK = { skin: CH.SKIN.alex, outfit: 'prisoner', sleeve: '#f07a2a', pants: '#f07a2a', shoe: 'white', armW: 21, handSc: 0.8 };
  const GUARD_LOOK = { kind: 'guard', skin: CH.SKIN.guard, outfit: 'guardpro', sleeve: '#1f3152', pants: '#1a2438', shoe: 'black', armW: 23, handSc: 0.85 };

  function defs() {
    return `<defs>
      <linearGradient id="gCellWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d969c"/><stop offset="1" stop-color="#737c82"/></linearGradient>
      <linearGradient id="gCorr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f8c86"/><stop offset="1" stop-color="#66726c"/></linearGradient>
      <linearGradient id="gPFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f6866"/><stop offset="1" stop-color="#454c4b"/></linearGradient>
      <linearGradient id="gBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c3036"/><stop offset=".45" stop-color="#7d848d"/><stop offset="1" stop-color="#2c3036"/></linearGradient>
      <linearGradient id="gBarH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3036"/><stop offset=".45" stop-color="#7d848d"/><stop offset="1" stop-color="#2c3036"/></linearGradient>
      <linearGradient id="gSkyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ec"/><stop offset="1" stop-color="#d9eefa"/></linearGradient>
      <linearGradient id="gBeamP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff5d1" stop-opacity=".55"/><stop offset="1" stop-color="#fff5d1" stop-opacity="0"/></linearGradient>
      <radialGradient id="gLampP"><stop offset="0" stop-color="#f4fff2" stop-opacity=".7"/><stop offset="1" stop-color="#f4fff2" stop-opacity="0"/></radialGradient>
      <filter id="fBlurP"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>`;
  }

  // ---------------- establishing shot: corridor in one-point perspective ----------------
  const NEAR = { x0: -120, x1: 1200, y0: -260, y1: 2200 }, FAR = { x0: 410, x1: 670, y0: 700, y1: 1010 };
  const ZF = 5;
  const gz = z => (1 - 1 / z) / (1 - 1 / ZF);                       // depth -> screen interpolation
  const P = (side, z, v) => {                                          // point on a side wall: v 0 top .. 1 bottom
    const k = gz(z);
    const x = side < 0 ? lerp(NEAR.x0, FAR.x0, k) : lerp(NEAR.x1, FAR.x1, k);
    const y = lerp(lerp(NEAR.y0, FAR.y0, k), lerp(NEAR.y1, FAR.y1, k), v);
    return [x, y];
  };
  let CORR = null;
  function corridor() {
    if (CORR) return CORR;
    const o = [];
    o.push(`<rect x="-200" y="-300" width="1500" height="2600" fill="#5f6b65"/>`);
    // ceiling, floor, walls
    o.push(`<path d="M${NEAR.x0} ${NEAR.y0}L${NEAR.x1} ${NEAR.y0}L${FAR.x1} ${FAR.y0}L${FAR.x0} ${FAR.y0}Z" fill="#9aa39d"/>`);
    o.push(`<path d="M${NEAR.x0} ${NEAR.y1}L${NEAR.x1} ${NEAR.y1}L${FAR.x1} ${FAR.y1}L${FAR.x0} ${FAR.y1}Z" fill="url(#gPFloor)"/>`);
    o.push(`<path d="M${NEAR.x0} ${NEAR.y0}L${FAR.x0} ${FAR.y0}L${FAR.x0} ${FAR.y1}L${NEAR.x0} ${NEAR.y1}Z" fill="#7d8b83"/>`);
    o.push(`<path d="M${NEAR.x1} ${NEAR.y0}L${FAR.x1} ${FAR.y0}L${FAR.x1} ${FAR.y1}L${NEAR.x1} ${NEAR.y1}Z" fill="#74827a"/>`);
    // lower-wall stripe
    for (const s of [-1, 1]) {
      const a = P(s, 1, 0.62), b = P(s, ZF, 0.62), c = P(s, ZF, 1), d = P(s, 1, 1);
      o.push(`<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}Z" fill="#7f9187"/>`);
    }
    // far wall + steel door
    o.push(`<rect x="${FAR.x0}" y="${FAR.y0}" width="${FAR.x1 - FAR.x0}" height="${FAR.y1 - FAR.y0}" fill="#b4c0b8"/>`);
    o.push(`<rect x="490" y="800" width="100" height="210" fill="#6f7a84" stroke="#3e464e" stroke-width="5"/><rect x="515" y="825" width="50" height="40" fill="#2c3036"/><path d="M515 825v40M532 825v40M548 825v40" stroke="#7d848d" stroke-width="3"/>`);
    // floor centre line + shine
    o.push(`<path d="M540 ${FAR.y1}L540 ${NEAR.y1}" stroke="#d9b84a" stroke-width="10" stroke-dasharray="40 30" opacity=".7"/>`);
    o.push(`<path d="M470 ${FAR.y1}L300 ${NEAR.y1}L780 ${NEAR.y1}L610 ${FAR.y1}Z" fill="#fff" opacity=".07"/>`);
    // cells on both sides: dark openings + bars
    for (const s of [-1, 1]) {
      const z0 = 1.35, z1 = 3.1;
      const a = P(s, z0, 0.12), b = P(s, z1, 0.12), c = P(s, z1, 0.98), d = P(s, z0, 0.98);
      o.push(`<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}Z" fill="#4a5258"/>`);
      // a bunk inside, seen through the bars
      const e = P(s, 1.9, 0.72), ff = P(s, 2.8, 0.72), g2 = P(s, 2.8, 0.82), h = P(s, 1.9, 0.82);
      o.push(`<path d="M${f1(e[0])} ${f1(e[1])}L${f1(ff[0])} ${f1(ff[1])}L${f1(g2[0])} ${f1(g2[1])}L${f1(h[0])} ${f1(h[1])}Z" fill="#c9c4b8"/>`);
      for (let z = z0; z <= z1 + 0.001; z += (z1 - z0) / 11) {
        const top = P(s, z, 0.12), bot = P(s, z, 0.98), w = 22 / z;
        o.push(`<path d="M${f1(top[0])} ${f1(top[1])}L${f1(bot[0])} ${f1(bot[1])}" stroke="#2f343a" stroke-width="${f1(w)}"/><path d="M${f1(top[0] + w * 0.15)} ${f1(top[1])}L${f1(bot[0] + w * 0.15)} ${f1(bot[1])}" stroke="#8a919a" stroke-width="${f1(w * 0.25)}"/>`);
      }
      for (const v of [0.12, 0.55, 0.98]) {
        const p1 = P(s, z0, v), p2 = P(s, z1, v);
        o.push(`<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(p2[0])} ${f1(p2[1])}" stroke="#2f343a" stroke-width="16"/>`);
      }
      // cell number plates
      const pl = P(s, 2.2, 0.05);
      o.push(`<g transform="translate(${f1(pl[0])} ${f1(pl[1])})"><rect x="-56" y="-26" width="112" height="52" rx="8" fill="#f2efe6" stroke="#3e464e" stroke-width="4"/><text x="0" y="14" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="34" fill="#3e464e">${s < 0 ? 'A-12' : 'A-13'}</text></g>`);
    }
    // ceiling lamps
    for (const z of [1.5, 2.3, 3.3, 4.4]) {
      const k = gz(z), y = lerp(NEAR.y0, FAR.y0, k) + 12 / z * 3, w = 240 / z;
      o.push(`<ellipse cx="540" cy="${f1(y + 30 / z)}" rx="${f1(w * 1.6)}" ry="${f1(w * 0.6)}" fill="url(#gLampP)"/>`);
      o.push(`<rect x="${f1(540 - w / 2)}" y="${f1(y)}" width="${f1(w)}" height="${f1(40 / z)}" rx="${f1(8 / z)}" fill="#f6fff1" stroke="#9aa39b" stroke-width="${f1(6 / z)}"/>`);
    }
    CORR = o.join('');
    return CORR;
  }

  function corridorGuard(t) {
    // guard walks towards the camera down the corridor
    const z = lerp(4.6, 1.75, prog(t, 0, CUT, 'linear'));
    const k = gz(z);
    const feet = lerp(NEAR.y1, FAR.y1, k), sc = 1.55 / z;
    const ph = t * Math.PI * 2 * 1.5;
    const p = { ...GUARD_LOOK, x: 540 + Math.sin(ph / 2) * 4, y: feet - (138 + 128 + 14) * sc - Math.abs(Math.sin(ph)) * 8 * sc, sc };
    p.legL = [-8, 0]; p.legR = [8, 0];
    p.legKL = null;
    const lift = Math.sin(ph);
    p.legL = [-8, Math.max(0, lift) * 30]; p.legR = [8, -Math.max(0, -lift) * 30];
    p.armL = [-14 + 6 * lift, 70]; p.handL = 'fist'; p.itemL = 'folder';
    p.armR = [10 + 10 * lift, -6]; p.handR = 'fist';
    p.face = { turn: 0, look: [0, 0], mouth: 'smile', brow: 0.2, blink: blink(t, [1.1]) };
    return `<ellipse cx="540" cy="${f1(feet + 10 * sc)}" rx="${f1(110 * sc)}" ry="${f1(16 * sc)}" fill="#000" opacity=".25" filter="url(#fBlurP)"/>` + CH.figure(p);
  }

  // ---------------- the cell (front view through the bars) ----------------
  let CELL = null;
  function cellBack() {
    if (CELL) return CELL;
    const o = [];
    // corridor wall around the cell
    o.push(`<rect x="-900" y="-900" width="3000" height="${FLOOR_FRONT + 900}" fill="url(#gCorr)"/>`);
    o.push(`<rect x="-900" y="1150" width="3000" height="${FLOOR_FRONT - 1150}" fill="#7f9187"/>`);
    // cell interior
    o.push(`<rect x="60" y="400" width="900" height="${FLOOR_CELL - 400}" fill="url(#gCellWall)"/>`);
    for (let y = 430; y < FLOOR_CELL; y += 60) {
      o.push(`<path d="M60 ${y}H960" stroke="#5f686e" stroke-width="4" opacity=".8"/>`);
      for (let x = 60 + ((y / 60) % 2) * 60; x < 960; x += 120) o.push(`<path d="M${x} ${y}v60" stroke="#5f686e" stroke-width="4" opacity=".8"/>`);
    }
    // grime: water stains and dark patches
    for (const [x, y, rx, ry, op] of [[150, 980, 70, 120, .18], [470, 1300, 140, 40, .2], [880, 560, 60, 90, .15], [700, 900, 40, 70, .12], [330, 640, 50, 30, .12]])
      o.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2c3236" opacity="${op}" filter="url(#fBlurP)"/>`);
    for (const x of [140, 420, 900]) o.push(`<path d="M${x} 400q-6 60 2 120t-4 140" fill="none" stroke="#4a5257" stroke-width="5" opacity=".35"/>`);
    o.push(`<rect x="60" y="${FLOOR_CELL}" width="900" height="${FLOOR_FRONT - FLOOR_CELL}" fill="#646c6f"/>`);
    o.push(`<rect x="60" y="${FLOOR_CELL - 6}" width="900" height="10" fill="#6f777b"/>`);
    // small barred window + sunbeam
    o.push(`<rect x="250" y="470" width="160" height="120" rx="6" fill="url(#gSkyP)" stroke="#5f676d" stroke-width="8"/>`);
    o.push(`<ellipse cx="300" cy="510" rx="30" ry="10" fill="#fff" opacity=".9"/>`);
    for (const x of [290, 330, 370]) o.push(`<rect x="${x - 5}" y="470" width="10" height="120" fill="#4a5056"/>`);
    o.push(`<path d="M250 590L410 590L640 ${FLOOR_CELL}L330 ${FLOOR_CELL}Z" fill="url(#gBeamP)" opacity=".8"/>`);
    // tally marks + poster + shelf
    o.push(`<g stroke="#f2f2ec" stroke-width="6" stroke-linecap="round" opacity=".85">${[0, 1, 2].map(g => `<path d="M${120 + g * 60} 700v60M${132 + g * 60} 700v60M${144 + g * 60} 700v60M${156 + g * 60} 700v60M${112 + g * 60} 750l52-40"/>`).join('')}</g>`);
    o.push(`<g transform="translate(600 620) rotate(-3)"><rect x="-90" y="-70" width="180" height="140" rx="6" fill="#fdf6e3" stroke="#8a7a5a" stroke-width="4"/><text x="0" y="-18" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#c0504d">HOME</text><text x="0" y="16" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#c0504d">SWEET</text><text x="0" y="50" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#c0504d">HOME</text><circle cx="-70" cy="-55" r="6" fill="#d64545"/><circle cx="70" cy="-55" r="6" fill="#d64545"/></g>`);
    o.push(`<rect x="770" y="760" width="160" height="12" rx="3" fill="#6f777b"/><path d="M790 760l6-40h34l6 40Z" fill="#c9ced6" stroke="#5f676d" stroke-width="3"/><rect x="850" y="726" width="60" height="34" rx="3" fill="#c0504d"/><rect x="856" y="716" width="48" height="12" rx="2" fill="#e9c46a"/>`);
    // steel sink + toilet
    o.push(`<path d="M800 1010h120l-12 40h-96Z" fill="#c9ced6" stroke="#5f676d" stroke-width="4"/><rect x="852" y="980" width="16" height="32" fill="#9aa1a9"/>`);
    o.push(`<path d="M810 1250h110v30a55 40 0 0 1-110 0Z" fill="#c9ced6" stroke="#5f676d" stroke-width="4"/><rect x="830" y="1300" width="70" height="${FLOOR_CELL - 1300}" fill="#b4bac1" stroke="#5f676d" stroke-width="4"/>`);
    // bed (metal cot)
    o.push(`<rect x="230" y="1290" width="580" height="24" rx="6" fill="#6f777b"/><rect x="240" y="1310" width="16" height="${FLOOR_CELL - 1310}" fill="#5f676d"/><rect x="784" y="1310" width="16" height="${FLOOR_CELL - 1310}" fill="#5f676d"/>`);
    o.push(`<rect x="232" y="1198" width="576" height="96" rx="16" fill="#cfcabd" stroke="#4d4b45" stroke-width="5"/>`);
    for (let x = 262; x < 800; x += 40) o.push(`<rect x="${x}" y="1206" width="14" height="80" fill="#9fb0bf" opacity=".6"/>`);
    // upper bunk + posts (two-tier metal bunk bed)
    o.push(`<rect x="228" y="760" width="18" height="${FLOOR_CELL - 760}" fill="#4f575d" stroke="#2c3236" stroke-width="3"/><rect x="796" y="760" width="18" height="${FLOOR_CELL - 760}" fill="#4f575d" stroke="#2c3236" stroke-width="3"/>`);
    o.push(`<rect x="232" y="870" width="576" height="70" rx="12" fill="#5d6b78" stroke="#2c3236" stroke-width="5"/><rect x="226" y="936" width="590" height="22" rx="5" fill="#4f575d" stroke="#2c3236" stroke-width="4"/>`);
    o.push(`<path d="M260 870q120-26 260 0" fill="none" stroke="#728292" stroke-width="8" stroke-linecap="round"/><rect x="226" y="780" width="590" height="14" rx="5" fill="#4f575d" stroke="#2c3236" stroke-width="3"/>`);
    o.push(`<rect x="232" y="958" width="576" height="40" fill="#000" opacity=".2" filter="url(#fBlurP)"/>`);
    // folded grey blanket at the foot end
    o.push(`<rect x="240" y="1176" width="140" height="44" rx="12" fill="#7f8a99" stroke="#4e5763" stroke-width="5"/><path d="M252 1196h116" stroke="#9aa4b2" stroke-width="5"/>`);
    // corridor floor in front of the bars
    o.push(`<rect x="-900" y="${FLOOR_FRONT}" width="3000" height="1500" fill="url(#gPFloor)"/>`);
    o.push(`<rect x="-900" y="1560" width="3000" height="10" fill="#d9b84a" opacity=".75"/>`);
    o.push(`<ellipse cx="520" cy="1700" rx="600" ry="60" fill="#fff" opacity=".07"/>`);
    CELL = o.join('');
    return CELL;
  }

  function bars() {
    const o = [];
    for (const x of BARS) o.push(`<rect x="${x - 9}" y="390" width="18" height="${FLOOR_FRONT + 10 - 390}" fill="url(#gBar)"/>`);
    for (const y of [380, 1232, 1490]) o.push(`<rect x="45" y="${y}" width="930" height="${y === 1232 ? 18 : 26}" rx="4" fill="url(#gBarH)"/>`);
    o.push(`<rect x="972" y="930" width="46" height="110" rx="6" fill="#4a5056" stroke="#2c3036" stroke-width="4"/><circle cx="995" cy="985" r="9" fill="#1b1d20"/>`);
    o.push(`<rect x="-10" y="380" width="56" height="${FLOOR_FRONT - 370}" fill="#7d8a82"/><rect x="975" y="380" width="70" height="${FLOOR_FRONT - 370}" fill="none"/>`);
    o.push(`<g transform="translate(510 330)"><rect x="-70" y="-30" width="140" height="56" rx="8" fill="#f2efe6" stroke="#3e464e" stroke-width="4"/><text x="0" y="12" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="36" fill="#3e464e">A-12</text></g>`);
    return o.join('');
  }

  function pillowSvg(cx, cy, sqx = 1, sqy = 1, rot = 0) {
    return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rot)}) scale(${f1(sqx)} ${f1(sqy)})">` +
      `<path d="M-78 -30C-60 -42 60 -42 78 -30C88 -10 88 10 78 30C60 42 -60 42 -78 30C-88 10 -88 -10 -78 -30Z" fill="#fbf9f4" stroke="#8f8b80" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M-78 -30l-8 -8M78 -30l8 -8M78 30l8 8M-78 30l-8 8" stroke="#8f8b80" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M-50 -14q50 12 100 0" fill="none" stroke="#e2ddd1" stroke-width="6" stroke-linecap="round"/></g>`;
  }

  // ---------------- characters ----------------
  const SX = ALEX.standX, SHIP = hipY(ALEX.standFeet, ALEX.sc);

  function alexPose(t) {
    // standing at the bars, hugging the pillow (exactly as scene 1 ended)
    const p = Object.assign({ x: SX, y: SHIP, sc: ALEX.sc, rot: 0 }, ALEX_LOOK);
    p.legL = [-8, 2]; p.legR = [8, -2];
    // squeeze rhythm; tighter on "please" and "promise"
    const tight = Math.max(prog(t, K.please - 0.1, K.please + 0.25) * (1 - prog(t, 11.9, 12.2)), prog(t, K.promise, K.promise + 0.3) * (1 - prog(t, 13.8, 14.2)));
    const squeeze = clamp(0.5 + 0.5 * Math.sin(t * 6) * 0.6 + tight * 0.7, 0, 1.4);
    const sx = 1.45 - 0.12 * squeeze, sy = 1.55 + 0.12 * squeeze;
    p.chest = pillowSvg(0, -112, sx, sy, -8);
    const cx = p.x, cy = p.y - 112 * p.sc;
    p.armL = CH.armIK(p, -1, cx + 24 - 6 * squeeze, cy + 34, -1);
    p.armR = CH.armIK(p, 1, cx - 18 + 6 * squeeze, cy + 18, 1);
    p.handL = 'fist'; p.handR = 'fist';
    p.lean = -2 + wob(t, 0.5, 2);
    p.headTilt = -5 + Math.sin(t * 1.6) * 2 - tight * 7;   // head tilts (between the bars) more when he pleads
    p.sqX = 1 - 0.015 * squeeze; p.sqY = 1 + 0.015 * squeeze;

    const f = { turn: 0.05, look: [0.8, -0.2], mouth: 'frown', open: 0, brow: 0.7, browTilt: 1.0, eye: 1.1, pupil: 1.45, time: t, sadTalk: true };
    f.blink = blink(t, [1.9, 5.0, 9.9, 15.6, 19.0]);
    f.tears = 0.55;
    // eyes closed, hugging, at the very start (continuing scene 1), then he looks up at the guard
    if (t < 0.55) { f.sleep = true; f.tears = 1; f.look = [0.3, 0.3]; f.turn = 0.05; }
    // "Are you out of your mind?!" — flinches a bit
    if (t > K.mind && t < K.guardEnd1) { f.eye = 1.15; f.pupil = 1.2; f.brow = 0.85; }
    if (t > K.FREE && t < K.FREE + 0.4) { p.headTilt -= 4; f.eye = 1.25; }
    // "Alex looked at him with sad eyes." — biggest puppy eyes
    if (t >= K.sad - 0.1 && t < K.but) {
      const k = prog(t, K.sad - 0.1, K.sad + 0.5);
      f.eye = lerp(1.1, 1.3, k); f.pupil = lerp(1.45, 1.75, k); f.brow = lerp(0.7, 1.0, k); f.browTilt = 1.1; f.tears = lerp(0.55, 0.9, k);
      f.look = [0.75, -0.35]; p.headTilt += 4 * k;
    }
    if (t >= K.but) { f.eye = 1.2; f.pupil = 1.6; f.brow = 1.0; f.browTilt = 1.1; f.tears = 0.85; f.look = [0.75, -0.3]; }
    if (t > K.alexEnd + 0.4) { f.pupil = 1.5; f.tears = 0.7; }
    // the guard storms off — Alex's eyes follow him to the right
    if (t > K.warden) f.look = [1, -0.1];
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  function guardPose(t) {
    // walks off towards the corridor (right) at the very end
    const wk = prog(t, 19.55, T.duration + 0.4, 'linear');
    const walking = t > 19.55;
    const ph = (t - 19.55) * Math.PI * 2 * 1.6;
    const amp = walking ? Math.min(1, (t - 19.55) * 4) : 0;
    const p = Object.assign({ x: GUARD.x + (walking ? (t - 19.55) * 260 : 0), y: hipY(GUARD.feet, GUARD.sc) - Math.abs(Math.sin(ph)) * 10 * amp, sc: GUARD.sc }, GUARD_LOOK);
    p.legL = [-8 + 22 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 20 * amp];
    p.legR = [8 - 22 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 20 * amp];
    p.headTilt = wob(t, 0.6, 4) * 1.5;
    const gy = p.y, gx = GUARD.x;
    const head = CH.headPos(p);

    // ---- left hand: the folder (open while he reads, snapped shut on "closed")
    const folderOpen = t > 13.75 && t < K.closed + 0.1;
    const raise = prog(t, 13.7, 14.0) * (1 - prog(t, K.closed + 0.1, K.closed + 0.35));
    let wl = [lerp(gx - 70, gx - 95, raise), lerp(gy - 40, head[1] + 175, raise)];
    // ---- right hand: gestures
    let wr = [gx + 62, gy - 8];
    let hR = 'fist', rotR = 0, thR = -1;
    let hL = 'fist';
    // "stared … in disbelief": arms slightly open, palms up
    const dis = prog(t, 0.55, 0.9, 'outBack') * (1 - prog(t, 2.45, 2.7));
    wr = [lerp(wr[0], gx + 120, dis), lerp(wr[1], gy - 40, dis)];
    wl = [lerp(wl[0], gx - 115, dis), lerp(wl[1], gy - 40, dis)];
    if (dis > 0.5) { hR = 'open'; rotR = 95; thR = 1; }
    // "Are you out of your mind?!": finger tapping the temple
    const mind = prog(t, K.mind - 0.05, K.mind + 0.25, 'outBack') * (1 - prog(t, 4.05, 4.3));
    if (mind > 0) {
      const tap = Math.max(0, Math.sin((t - K.mind) * 16)) * 8;
      wr = [lerp(wr[0], head[0] + 112 - tap, mind), lerp(wr[1], head[1] + 30, mind)];
      if (mind > 0.5) { hR = 'point'; rotR = 150; }
    }
    // "You're FREE!": both arms thrown wide
    const free = prog(t, K.youre, K.youre + 0.22, 'outBack') * (1 - prog(t, 5.25, 5.45));
    if (free > 0) {
      wr = [lerp(wr[0], gx + 150, free), lerp(wr[1], gy - 175, free)];
      wl = [lerp(wl[0], gx - 150, free), lerp(wl[1], gy - 175, free)];
      if (free > 0.5) { hR = 'open'; rotR = 180; thR = -1; }
    }
    // "…whatever you want out there!": points to the exit down the corridor (right)
    const out = prog(t, K.whatever, K.whatever + 0.3, 'outBack') * (1 - prog(t, 7.4, 7.8));
    if (out > 0) {
      const sweep = Math.sin(prog(t, K.there - 0.2, K.there + 0.3, 'linear') * Math.PI) * 25;
      wr = [lerp(wr[0], gx + 175, out), lerp(wr[1], gy - 130 - sweep, out)];
      if (out > 0.5) { hR = 'point'; rotR = 90 + sweep * 0.5; }
    }
    // the sigh + closing the folder: right hand comes over to slap it shut
    const shut = prog(t, K.closed - 0.25, K.closed, 'in') * (1 - prog(t, K.closed + 0.15, K.closed + 0.45));
    if (shut > 0) { wr = [lerp(wr[0], gx - 50, shut), lerp(wr[1], head[1] + 175, shut)]; hR = 'open'; rotR = 120; }
    // "Alright, that's it!": flat hand chop
    const chop = prog(t, K.alright, K.alright + 0.2, 'outBack') * (1 - prog(t, 18.0, 18.2));
    if (chop > 0) {
      const c2 = Math.max(0, Math.sin((t - K.alright) * 9)) * 30;
      wr = [lerp(wr[0], gx + 125, chop), lerp(wr[1], gy - 150 + c2, chop)];
      if (chop > 0.5) { hR = 'open'; rotR = 165; thR = -1; }
    }
    // "I'm sick of this!": rubs the bridge of his nose
    const nose = prog(t, K.sick - 0.05, K.sick + 0.2) * (1 - prog(t, 19.0, 19.2));
    if (nose > 0) {
      wr = [lerp(wr[0], head[0] + 35, nose), lerp(wr[1], head[1] + 75, nose)];
      if (nose > 0.5) { hR = 'fist'; rotR = 160; }
    }
    // "I'm going to get the warden!": thumb over the shoulder, turns and walks off
    const go = prog(t, K.warden, K.warden + 0.25, 'outBack');
    if (go > 0) {
      wr = [lerp(wr[0], gx + 120 + (p.x - gx), go), lerp(wr[1], gy - 165, go)];
      if (go > 0.5) { hR = 'point'; rotR = 70; }
      if (walking) { wr = [p.x + 62 + 14 * Math.sin(ph) * amp, gy - 10]; hR = 'fist'; rotR = 0; }
    }
    if (walking) wl = [p.x - 70 - 12 * Math.sin(ph) * amp, gy - 40];
    p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1);
    p.handR = hR; p.handRotR = rotR; p.thumbR = thR;
    p.handL = hL; p.itemL = 'folder'; p.folderOpenL = folderOpen ? 1 : 0;

    // ---- shoulders: big sigh (narrator), angry lean
    const sighK = Math.sin(prog(t, K.sigh - 0.2, K.sigh + 0.8, 'linear') * Math.PI);
    p.sqY = 1 + 0.035 * sighK * (t < K.sigh + 0.25 ? 1 : -0.6);
    p.lean = kf(t, [[2.5, 0], [2.8, -4], [5.4, -2], [7.4, 0], [16.7, 0], [17.0, -5], [19.1, -3], [19.5, 3]]);

    // ---- face
    const f = { turn: -0.45, look: [-0.85, 0.1], mouth: 'flat', open: 0, brow: 0.05, browTilt: -0.35, eye: 1, pupil: 1 };
    f.blink = blink(t, [6.1, 9.4, 12.9, 17.6]);
    if (t < K.mind - 0.1) {                                       // disbelief
      const k = prog(t, 0.5, 0.75, 'outBack');
      f.eye = lerp(1, 1.35, k); f.pupil = lerp(1, 0.5, k); f.brow = lerp(0.05, 1.0, k); f.browTilt = lerp(-0.35, 0.15, k);
      f.mouth = 'o'; f.open = 0.12 * k;                           // jaw hangs open — no talking
      p.headTilt += -6 * k;
    } else if (t < K.guardEnd1 + 0.3) {                            // indignant
      f.eye = t > K.FREE - 0.05 && t < K.FREE + 0.6 ? 1.35 : 1.18; f.pupil = 0.75; f.brow = 0.75; f.browTilt = -0.15;
    } else if (t < K.sighed) {                                     // listening to Alex, exasperated
      f.eye = 1.05; f.lid = 0.2; f.brow = 0.35; f.browTilt = -0.25; f.look = [-0.85, 0.15];
    } else if (t < K.alright - 0.15) {                             // the sigh: eyes shut, slow exhale
      const closedEyes = t > K.sigh - 0.15 && t < K.closed - 0.2;
      f.sleep = closedEyes; f.brow = 0.2; f.browTilt = -0.1;
      f.mouth = closedEyes ? 'o' : 'flat'; f.open = closedEyes ? 0.18 : 0;
      f.look = folderOpen ? [-0.5, 0.85] : [-0.85, 0.1];
      f.lid = 0.3;
    } else {                                                       // fed up
      f.eye = 0.95; f.lid = 0.25; f.brow = 0.1; f.browTilt = -0.75; f.pupil = 0.9;
      if (t > K.sick && t < 19.1) { f.sleep = true; }
      if (t > K.warden) { f.turn = kf(t, [[K.warden, -0.45], [K.warden + 0.4, 0.55]]); f.look = kf(t, [[K.warden, [-0.85, 0.1]], [K.warden + 0.4, [1, 0]]]); }
    }
    f.red = t > K.alright ? 0.12 : 0;
    const s = LIPSYNC.talk(T, t, GUARD_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    else if (s) f.mouth = t > K.alright ? 'flat' : 'flat';
    p.face = f;
    return p;
  }

  // ---------------- FX ----------------
  function freeShake(t) { return t > K.FREE ? 12 * Math.exp(-(t - K.FREE) * 6) : 0; }
  function sighPuff(t, head) {
    const k = prog(t, K.sigh + 0.05, K.sigh + 0.9, 'out');
    if (k <= 0 || k >= 1) return '';
    const x = head[0] - 70 - k * 90, y = head[1] + 40 - k * 20;
    return `<g opacity="${f1(Math.sin(k * Math.PI) * 0.8)}"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(18 + k * 30)}" ry="${f1(10 + k * 16)}" fill="#fff"/><ellipse cx="${f1(x - 30 - k * 20)}" cy="${f1(y - 8)}" rx="${f1(10 + k * 16)}" ry="${f1(7 + k * 10)}" fill="#fff"/></g>`;
  }
  function angerMark(t, head) {
    const k = prog(t, K.alright, K.alright + 0.25, 'outBack') * (1 - prog(t, K.warden + 0.2, K.warden + 0.5));
    if (k < 0.01) return '';
    const pulse = 1 + 0.12 * Math.sin(t * 14);
    return `<g transform="translate(${f1(head[0] + 70)} ${f1(head[1] - 75)}) scale(${f1(k * pulse)})" stroke="#d62828" stroke-width="8" stroke-linecap="round" fill="none"><path d="M-22 -6q10 0 16-16M6 -22q0 10 16 16M22 6q-10 0-16 16M-6 22q0-10-16-16"/></g>`;
  }

  // ---------------- camera (medium + close-up shots, hard cuts on speaker changes) ----------------
  function camera(t) {
    const c = kf(t, [
      [0, [820, 1120, 1.05]],                    // two-shot: Alex hugging, guard staring
      [0.95, [830, 1115, 1.1], 'sine'],
      [0.97, [1070, 1160, 2.3], 'step'],         // guard close-up: disbelief
      [2.6, [1070, 1150, 2.42], 'sine'],
      [4.27, [1070, 1140, 2.5], 'sine'],
      [4.5, [1070, 1110, 2.85], 'outBack'],      // punch-in on "FREE!"
      [5.38, [1070, 1110, 2.9], 'sine'],
      [5.4, [880, 1100, 1.15], 'step'],          // medium two-shot: points down the corridor
      [7.6, [870, 1100, 1.2], 'sine'],
      [7.62, [592, 1140, 2.35], 'step'],         // Alex close-up: sad eyes
      [10.1, [592, 1130, 2.7], 'sine'],
      [13.65, [592, 1120, 2.95], 'sine'],        // "…I promise I'll be good!"
      [13.67, [1055, 1175, 1.85], 'step'],       // guard medium: sigh + folder
      [16.7, [1055, 1170, 1.95], 'sine'],
      [16.72, [1070, 1150, 2.45], 'step'],       // "Alright, that's it! I'm sick of this!"
      [19.05, [1070, 1145, 2.6], 'sine'],
      [19.07, [860, 1120, 1.0], 'step'],         // wide: he turns and heads for the corridor
      [T.duration, [900, 1115, 0.95], 'sine'],
    ]);
    const sh = freeShake(t);
    return { cx: c[0] + Math.sin(t * 61) * sh, cy: c[1] + Math.cos(t * 47) * sh, z: c[2], rot: 0 };
  }

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const cam = camera(t);
    const ap = alexPose(t), gp = guardPose(t);
    const gHead = CH.headPos(gp);
    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, defs());
    o.push(`<g transform="translate(540 960) rotate(${f1(cam.rot)}) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(cellBack());
    o.push(CH.figure(ap));
    o.push(bars());
    o.push(`<ellipse cx="${f1(gp.x)}" cy="${GUARD.feet + 22}" rx="115" ry="16" fill="#000" opacity=".25" filter="url(#fBlurP)"/>`);
    o.push(CH.figure(gp));
    o.push(sighPuff(t, gHead), angerMark(t, gHead));
    o.push('</g>');
    o.push(`<rect width="1080" height="1920" fill="#1d3340" opacity=".12" style="mix-blend-mode:multiply"/>`);
    o.push(`<defs><radialGradient id="gVigP" cx=".5" cy=".45" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05080a" stop-opacity=".55"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigP)"/>`);
    svg.innerHTML = o.join('');
  };
})();
