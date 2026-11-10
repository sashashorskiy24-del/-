// "Alex Doesn't Want to Leave Prison" — Scene 3 (final): the neighbour agrees, everyone gets thrown out.
// Voice-over: assets/audio/prison_voiceover_full.mp3, 41.45s–82.2s (+1.25 s of silence for the last beat on the door).
// Sets: A = Alex's cell (as scenes 1–2), B = cell A-13 across the hallway, C = corridor in perspective, D = prison entrance outside.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s, end = i => W[i].e;

  // ---------------- who speaks when ----------------
  const NO = [at(93), 35.9];                                     // "No!" — both prisoners together
  const BRUNO_LINES = [[at(11), 5.79], [at(25), 14.25], NO];      // "Hey, I totally agree…" / "We get free food…"
  const ALEX_LINES = [[at(47), 19.97], NO];                       // "Exactly! Finally, someone understands me!"
  const GUARD_LINES = [[at(78), 31.28]];                          // "That's it! Both of you, get out! Now!"
  const K = {
    hey: at(11),            // 3.83
    agree: at(12),          // 4.39
    stepped: at(17),        // 6.15 narrator: "The other prisoner stepped closer to the bars."
    we: at(25),             // 8.79
    food: at(28), water: at(30), bed: at(34),
    outside: at(35),        // 12.07
    PAY: at(39),            // 13.35
    everything: at(41),     // 13.83
    pointed: at(42),        // 14.71 narrator: "Alex pointed at him excitedly."
    exactly: at(47),        // 16.79
    finally: at(48),        // 17.91
    understands: at(50),    // 19.19
    looked: at(52),         // 20.47 narrator: "The guard slowly looked from one prisoner to the other."
    silence: at(62),        // 23.67 narrator: "He stood there in silence for a moment."
    then: at(70),           // 25.99 narrator: "Then he threw his papers on the floor."
    threw: at(72),          // 26.63
    thats: at(78),          // 28.47 guard
    both: at(80),           // 29.27
    getout: at(83),         // 30.15
    now: at(85),            // 30.87
    screamed: at(86),       // 31.75 narrator
    no: at(93),             // 34.55
    unlock: 35.95,
    dragged: at(94),        // 36.31 narrator: "The guard dragged them both out of their cells"
    slammed: at(104),       // 38.87 "and slammed the prison door shut."
    door: at(107),          // 39.91
    shut: at(108),          // 40.15  <- the slam
    voiceEnd: 40.5,
  };

  // ---------------- layout ----------------
  const FLOOR_CELL = 1360, FLOOR_FRONT = 1500;
  const ALEX = { sc: 0.85, standX: 585, standFeet: 1480 };
  const GUARD = { sc: 1.0, x: 1080, feet: 1660 };
  const PILLOW = [735, 1190];
  const hipY = (feet, sc) => feet - (138 + 128 + 14) * sc;
  const BARS = [60, 210, 360, 510, 660, 810, 960];
  const ALEX_LOOK = { skin: CH.SKIN.alex, outfit: 'prisoner', sleeve: '#f07a2a', pants: '#f07a2a', shoe: 'white', armW: 21, handSc: 0.8 };
  const GUARD_LOOK = { kind: 'guard', skin: CH.SKIN.guard, outfit: 'guardpro', sleeve: '#1f3152', pants: '#1a2438', shoe: 'black', armW: 21, handSc: 0.8 };   // same arms & hands as Alex

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
  const CELLS = {};
  function cellBack(v = 'A') {           // 'A' = Alex's cell A-12, 'B' = the cell across the hallway A-13
    if (CELLS[v]) return CELLS[v];
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
    o.push(`<g transform="translate(600 620) rotate(-3)"><rect x="-90" y="-70" width="180" height="140" rx="6" fill="#fdf6e3" stroke="#8a7a5a" stroke-width="4"/><text x="0" y="-18" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#c0504d">${v === 'A' ? 'HOME' : 'FREE'}</text><text x="0" y="16" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#c0504d">${v === 'A' ? 'SWEET' : 'FOOD'}</text><text x="0" y="50" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#c0504d">${v === 'A' ? 'HOME' : '♥'}</text><circle cx="-70" cy="-55" r="6" fill="#d64545"/><circle cx="70" cy="-55" r="6" fill="#d64545"/></g>`);
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
    CELLS[v] = o.join('');
    return CELLS[v];
  }

  function bars(v = 'A') {
    const o = [];
    for (const x of BARS) o.push(`<rect x="${x - 9}" y="390" width="18" height="${FLOOR_FRONT + 10 - 390}" fill="url(#gBar)"/>`);
    for (const y of [380, 1232, 1490]) o.push(`<rect x="45" y="${y}" width="930" height="${y === 1232 ? 18 : 26}" rx="4" fill="url(#gBarH)"/>`);
    o.push(`<rect x="972" y="930" width="46" height="110" rx="6" fill="#4a5056" stroke="#2c3036" stroke-width="4"/><circle cx="995" cy="985" r="9" fill="#1b1d20"/>`);
    o.push(`<rect x="-10" y="380" width="56" height="${FLOOR_FRONT - 370}" fill="#7d8a82"/><rect x="975" y="380" width="70" height="${FLOOR_FRONT - 370}" fill="none"/>`);
    o.push(`<g transform="translate(510 330)"><rect x="-70" y="-30" width="140" height="56" rx="8" fill="#f2efe6" stroke="#3e464e" stroke-width="4"/><text x="0" y="12" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="36" fill="#3e464e">${v === 'A' ? 'A-12' : 'A-13'}</text></g>`);
    return o.join('');
  }

  function pillowSvg(cx, cy, sqx = 1, sqy = 1, rot = 0) {
    return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rot)}) scale(${f1(sqx)} ${f1(sqy)})">` +
      `<path d="M-78 -30C-60 -42 60 -42 78 -30C88 -10 88 10 78 30C60 42 -60 42 -78 30C-88 10 -88 -10 -78 -30Z" fill="#fbf9f4" stroke="#8f8b80" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M-78 -30l-8 -8M78 -30l8 -8M78 30l8 8M-78 30l-8 8" stroke="#8f8b80" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M-50 -14q50 12 100 0" fill="none" stroke="#e2ddd1" stroke-width="6" stroke-linecap="round"/></g>`;
  }

  const BRUNO_LOOK = { skin: CH.SKIN.bruno, outfit: 'prisoner', patch: 'A-13', sleeve: '#f07a2a', pants: '#f07a2a', shoe: 'white', armW: 21, handSc: 0.8 };
  const SX = ALEX.standX, SHIP = hipY(ALEX.standFeet, ALEX.sc);
  const BRUNO_SC = 0.9;

  // ---------------- shot list ----------------
  // [start, set, camera keys...]  — hard cuts between shots, camera moves inside a shot
  const SHOTS = [
    [0.0, 'A', [[0, [900, 1115, 0.95]], [2.3, [1180, 1115, 0.95], 'sine']]],
    [2.3, 'C', [[2.3, [540, 1080, 1.0]], [4.38, [540, 1060, 1.12], 'sine']]],
    [4.4, 'B', [[4.4, [560, 1150, 1.35]], [6.1, [560, 1140, 1.4], 'sine'], [8.6, [590, 1075, 1.95], 'sine']]],
    [8.75, 'B', [[8.75, [590, 1055, 2.35]], [13.3, [590, 1045, 2.5], 'sine'], [13.5, [590, 1030, 2.95], 'outBack'], [14.6, [590, 1030, 3.0], 'sine']]],
    [14.65, 'A', [[14.65, [600, 1080, 2.2]], [16.75, [600, 1070, 2.35], 'sine'], [16.95, [592, 1045, 2.65], 'outBack'], [17.85, [592, 1045, 2.7], 'sine']]],
    [17.88, 'A', [[17.88, [610, 1100, 1.8]], [20.4, [610, 1095, 1.9], 'sine']]],
    [20.42, 'C', [[20.42, [540, 1100, 1.2]], [23.5, [540, 1080, 1.35], 'sine']]],
    [23.55, 'C', [[23.55, [540, 1035, 2.4]], [25.9, [540, 1030, 2.75], 'sine']]],
    [25.92, 'C', [[25.92, [540, 1170, 1.45]], [28.4, [540, 1160, 1.55], 'sine']]],
    [28.42, 'C', [[28.42, [540, 1040, 2.4]], [30.8, [540, 1035, 2.6], 'sine'], [31.0, [540, 1020, 3.05], 'outBack'], [31.7, [540, 1020, 3.1], 'sine']]],
    [31.72, 'C', [[31.72, [540, 1100, 1.1]], [34.5, [540, 1090, 1.25], 'sine']]],
    [34.53, 'A', [[34.53, [592, 1040, 2.5]], [34.93, [592, 1030, 2.75], 'out']]],          // NOOO — Alex
    [34.95, 'B', [[34.95, [592, 1040, 2.5]], [35.33, [592, 1030, 2.75], 'out']]],          // NOOO — neighbour
    [35.35, 'C', [[35.35, [540, 1100, 1.15]], [36.29, [540, 1100, 1.2], 'sine']]],          // both + doors unlock
    [36.31, 'C', [[36.31, [540, 1110, 1.2]], [38.6, [540, 1010, 1.55], 'sine']]],          // dragged down the corridor
    [38.62, 'D', [[38.62, [540, 1230, 1.0]], [40.1, [540, 1220, 1.05], 'sine'], [40.5, [540, 1240, 1.0], 'out'], [T.duration, [540, 1240, 1.08], 'sine']]],
  ];
  function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; }

  // ---------------- set C: corridor in perspective (layered so people stand inside the cells) ----------------
  const CELL_Z = [1.35, 3.1], DOOR_Z = [1.75, 2.35];
  function quad(a, b, c, d, fill) { return `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}Z" fill="${fill}"/>`; }
  let CB = null;
  function corrBase() {
    if (CB) return CB;
    const o = [];
    o.push(`<rect x="-400" y="-500" width="1900" height="3000" fill="#5f6b65"/>`);
    o.push(`<path d="M${NEAR.x0} ${NEAR.y0}L${NEAR.x1} ${NEAR.y0}L${FAR.x1} ${FAR.y0}L${FAR.x0} ${FAR.y0}Z" fill="#9aa39d"/>`);
    o.push(`<path d="M${NEAR.x0} ${NEAR.y1}L${NEAR.x1} ${NEAR.y1}L${FAR.x1} ${FAR.y1}L${FAR.x0} ${FAR.y1}Z" fill="url(#gPFloor)"/>`);
    o.push(`<path d="M${NEAR.x0} ${NEAR.y0}L${FAR.x0} ${FAR.y0}L${FAR.x0} ${FAR.y1}L${NEAR.x0} ${NEAR.y1}Z" fill="#7d8b83"/>`);
    o.push(`<path d="M${NEAR.x1} ${NEAR.y0}L${FAR.x1} ${FAR.y0}L${FAR.x1} ${FAR.y1}L${NEAR.x1} ${NEAR.y1}Z" fill="#74827a"/>`);
    for (const s of [-1, 1]) o.push(quad(P(s, 1, 0.62), P(s, ZF, 0.62), P(s, ZF, 1), P(s, 1, 1), '#66756c'));
    o.push(`<rect x="${FAR.x0}" y="${FAR.y0}" width="${FAR.x1 - FAR.x0}" height="${FAR.y1 - FAR.y0}" fill="#8d9a92"/>`);
    o.push(`<rect x="490" y="800" width="100" height="210" fill="#5d6770" stroke="#3e464e" stroke-width="5"/><rect x="515" y="825" width="50" height="40" fill="#2c3036"/>`);
    o.push(`<path d="M540 ${FAR.y1}L540 ${NEAR.y1}" stroke="#d9b84a" stroke-width="10" stroke-dasharray="40 30" opacity=".6"/>`);
    for (const s of [-1, 1]) {
      // lit cell interior seen through the bars
      o.push(quad(P(s, CELL_Z[0], 0.12), P(s, CELL_Z[1], 0.12), P(s, CELL_Z[1], 0.98), P(s, CELL_Z[0], 0.98), '#55606a'));
      o.push(quad(P(s, 1.9, 0.62), P(s, 2.9, 0.62), P(s, 2.9, 0.72), P(s, 1.9, 0.72), '#cfcabd'));
      const pl = P(s, 2.2, 0.05);
      o.push(`<g transform="translate(${f1(pl[0])} ${f1(pl[1])})"><rect x="-56" y="-26" width="112" height="52" rx="8" fill="#f2efe6" stroke="#3e464e" stroke-width="4"/><text x="0" y="14" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="34" fill="#3e464e">${s < 0 ? 'A-12' : 'A-13'}</text></g>`);
    }
    for (const z of [1.5, 2.3, 3.3, 4.4]) {
      const k = gz(z), y = lerp(NEAR.y0, FAR.y0, k) + 12 / z * 3, w = 240 / z;
      o.push(`<ellipse cx="540" cy="${f1(y + 30 / z)}" rx="${f1(w * 1.6)}" ry="${f1(w * 0.6)}" fill="url(#gLampP)"/>`);
      o.push(`<rect x="${f1(540 - w / 2)}" y="${f1(y)}" width="${f1(w)}" height="${f1(40 / z)}" rx="${f1(8 / z)}" fill="#f6fff1" stroke="#9aa39b" stroke-width="${f1(6 / z)}"/>`);
    }
    CB = o.join('');
    return CB;
  }
  function corrBars(open) {
    // cell fronts; the door section (DOOR_Z) slides along the wall when unlocked
    const o = [];
    for (const s of [-1, 1]) {
      const N = 11, step = (CELL_Z[1] - CELL_Z[0]) / N;
      for (let i = 0; i <= N; i++) {
        let z = CELL_Z[0] + i * step;
        const isDoor = z >= DOOR_Z[0] - 0.001 && z <= DOOR_Z[1] + 0.001;
        if (isDoor) z += open * 0.75;
        const top = P(s, z, 0.12), bot = P(s, z, 0.98), w = 22 / z;
        o.push(`<path d="M${f1(top[0])} ${f1(top[1])}L${f1(bot[0])} ${f1(bot[1])}" stroke="#2f343a" stroke-width="${f1(w)}"/><path d="M${f1(top[0] + w * 0.15)} ${f1(top[1])}L${f1(bot[0] + w * 0.15)} ${f1(bot[1])}" stroke="#8a919a" stroke-width="${f1(w * 0.25)}"/>`);
      }
      for (const v of [0.12, 0.55, 0.98]) { const p1 = P(s, CELL_Z[0], v), p2 = P(s, CELL_Z[1], v); o.push(`<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(p2[0])} ${f1(p2[1])}" stroke="#2f343a" stroke-width="16"/>`); }
    }
    return o.join('');
  }
  // world position for a character standing at depth z (side: -1 left cell, 0 corridor, +1 right cell)
  function spot(side, z, baseSc) {
    const k = gz(z);
    const feet = lerp(NEAR.y1, FAR.y1, k);
    let x = 540;
    if (side) x = P(side, z, 0.98)[0] - side * 18 / z * 2;
    const sc = 1.55 / z * baseSc;
    return { x, feet, sc, hip: feet - (138 + 128 + 14) * sc };
  }

  // ---------------- set D: prison entrance outside ----------------
  let EXT = null;
  function exterior() {
    if (EXT) return EXT;
    const o = [];
    o.push(`<defs><linearGradient id="gSkyX" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc2dc"/><stop offset="1" stop-color="#dce8ef"/></linearGradient></defs>`);
    o.push(`<rect x="-500" y="-600" width="2100" height="1400" fill="url(#gSkyX)"/>`);
    o.push(`<g fill="#fff" opacity=".8"><ellipse cx="160" cy="180" rx="110" ry="30"/><ellipse cx="210" cy="160" rx="70" ry="36"/><ellipse cx="860" cy="300" rx="120" ry="28"/></g>`);
    // stone wall
    o.push(`<rect x="-500" y="560" width="2100" height="1100" fill="#8d9296"/>`);
    for (let y = 560; y < 1500; y += 70) for (let x = -500 + ((y / 70) % 2) * 70; x < 1600; x += 140) o.push(`<rect x="${x + 3}" y="${y + 3}" width="134" height="64" rx="6" fill="#9ca1a5" stroke="#6f7478" stroke-width="3"/>`);
    // barbed wire along the top
    o.push(`<rect x="-500" y="540" width="2100" height="26" fill="#6f7478"/>`);
    let wire = 'M-500 520'; for (let x = -500; x < 1600; x += 30) wire += `Q${x + 15} ${x % 60 ? 490 : 545} ${x + 30} 520`;
    o.push(`<path d="${wire}" fill="none" stroke="#4a4f54" stroke-width="5"/>`);
    for (let x = -480; x < 1600; x += 60) o.push(`<path d="M${x} 510l10 20M${x + 10} 510l-10 20" stroke="#4a4f54" stroke-width="4"/>`);
    // doorway, lamps, emblem
    o.push(`<rect x="370" y="870" width="340" height="600" rx="10" fill="#5f6569"/><rect x="395" y="895" width="290" height="575" fill="#15181b"/>`);
    for (const x of [300, 780]) o.push(`<rect x="${x - 6}" y="900" width="12" height="40" fill="#3e4246"/><path d="M${x - 26} 940h52l-8 50h-36Z" fill="#f6e7b0" stroke="#3e4246" stroke-width="5"/><ellipse cx="${x}" cy="1000" rx="60" ry="30" fill="#fff3c4" opacity=".35"/>`);
    o.push(`<g transform="translate(540 800)"><path d="M0 -42C26 -42 40 -36 40 -36V0C40 26 20 40 0 48C-20 40 -40 26 -40 0V-36S-26 -42 0 -42Z" fill="#c9a33a" stroke="#5a4510" stroke-width="5"/><circle r="14" fill="#a8841f"/></g>`);
    // ground
    o.push(`<rect x="-500" y="1470" width="2100" height="40" fill="#b9b4aa"/><rect x="-500" y="1510" width="2100" height="1000" fill="#a9a398"/>`);
    for (let x = -480; x < 1600; x += 180) o.push(`<path d="M${x} 1510l-60 900" stroke="#948e83" stroke-width="4"/>`);
    o.push(`<rect x="-500" y="1840" width="2100" height="600" fill="#6b6f72"/><path d="M-500 1990h2100" stroke="#e8d27a" stroke-width="12" stroke-dasharray="70 50"/>`);
    for (const [x, y] of [[80, 1500], [930, 1495], [-120, 1505], [1150, 1500]]) o.push(`<path d="M${x} ${y}c6-20 10-24 14-30M${x + 8} ${y}c2-18 8-26 16-28M${x + 16} ${y}c0-14 4-20 10-24" stroke="#6f8f55" stroke-width="5" fill="none" stroke-linecap="round"/>`);
    EXT = o.join('');
    return EXT;
  }
  function extDoor(open) {
    // heavy steel door hinged on the left, swinging outwards
    const x0 = 395, x1 = 685, y0 = 895, y1 = 1470, w = x1 - x0;
    const xf = x0 + w * Math.cos(open * 1.3), grow = w * Math.sin(open * 1.3) * 0.12;
    let o = `<path d="M${x0} ${y0}L${f1(xf)} ${f1(y0 - grow)}L${f1(xf)} ${f1(y1 + grow)}L${x0} ${y1}Z" fill="#7b838a" stroke="#2f343a" stroke-width="7"/>`;
    const k = (xf - x0) / w;
    if (k > 0.25) {
      for (const yy of [960, 1180, 1400]) o += `<path d="M${f1(x0 + 20 * k)} ${yy}H${f1(xf - 20 * k)}" stroke="#5c646b" stroke-width="10"/>`;
      for (const yy of [930, 1440]) for (let i = 0; i < 6; i++) o += `<circle cx="${f1(x0 + (30 + i * 46) * k)}" cy="${yy}" r="${f1(6 * Math.max(0.4, k))}" fill="#5c646b"/>`;
      o += `<rect x="${f1(x0 + 105 * k)}" y="1000" width="${f1(80 * k)}" height="70" fill="#1b1e21" stroke="#2f343a" stroke-width="5"/>`;
      for (let i = 1; i < 4; i++) o += `<path d="M${f1(x0 + (105 + i * 20) * k)} 1000v70" stroke="#5c646b" stroke-width="6"/>`;
      o += `<rect x="${f1(xf - 40 * k)}" y="1180" width="${f1(16 * k)}" height="60" rx="5" fill="#c9ced6" stroke="#2f343a" stroke-width="4"/>`;
    }
    return o;
  }

  // ---------------- characters ----------------
  function talk(t, lines, f) {
    const s = LIPSYNC.talk(T, t, lines);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    if (t >= NO[0] && t <= NO[1] + 0.04 && s) { f.mouth = 'o'; f.open = Math.max(f.open || 0, 0.55 + 0.4 * (s.open || 0)); }   // the long "NOOOO"
    return s;
  }
  function huggedPillow(p, t, squeezeAmt) {
    const sq = squeezeAmt == null ? 0.5 + 0.3 * Math.sin(t * 6) : squeezeAmt;
    p.chest = pillowSvg(0, -112, 1.45 - 0.12 * sq, 1.55 + 0.12 * sq, -8);
    return sq;
  }
  function pillowOneArm(p, t) {
    // pillow tucked under the left arm (frees the right hand for pointing)
    p.chest = pillowSvg(-30, -100, 1.25, 1.35, 12);
    p.armL = CH.armIK(p, -1, p.x + 20 * p.sc, p.y - 70 * p.sc, -1);
    p.handL = 'fist';
  }

  // Alex in set A (front of his cell, same spot as scenes 1–2)
  function alexA(t) {
    const p = Object.assign({ x: SX, y: SHIP, sc: ALEX.sc }, ALEX_LOOK);
    p.legL = [-8, 2]; p.legR = [8, -2];
    const f = { turn: 0.05, look: [0.6, -0.1], mouth: 'frown', brow: 0.6, browTilt: 0.9, eye: 1.1, pupil: 1.4, time: t, tears: 0.5, sadTalk: true };
    f.blink = blink(t, [1.6, 15.9, 19.2]);
    const sq = huggedPillow(p, t);
    const cx = p.x, cy = p.y - 112 * p.sc;
    p.armL = CH.armIK(p, -1, cx + 24 - 6 * sq, cy + 34, -1); p.armR = CH.armIK(p, 1, cx - 18 + 6 * sq, cy + 18, 1);
    p.handL = 'fist'; p.handR = 'fist';
    p.headTilt = -5 + Math.sin(t * 1.6) * 2;
    if (t < 3.8) f.look = [1, -0.1];                                 // watching the guard leave
    if (t >= K.pointed - 0.2 && t < 21) {
      // lights up and points across the hallway (towards us)
      const k = prog(t, K.pointed - 0.1, K.pointed + 0.25, 'outBack');
      pillowOneArm(p, t);
      const pump = t > K.exactly && t < 17.6 ? Math.max(0, Math.sin((t - K.exactly) * 18)) * 18 : 0;
      p.armR = CH.armIK(p, 1, lerp(cx + 50, cx + 135, k), lerp(cy + 60, cy + 5 - pump, k), 1);
      p.handR = 'point'; p.handRotR = 120; p.thumbR = -1;
      f.sadTalk = false; f.mouth = 'smile'; f.brow = 0.9; f.browTilt = 0.1; f.eye = 1.25; f.pupil = 1.25; f.tears = 0.25; f.turn = 0.1; f.look = [0.2, 0.1];
      p.headTilt = 4 + Math.sin(t * 5) * 4;
      if (t > K.exactly && t < 17.4) p.y -= Math.sin(prog(t, K.exactly, 17.4, 'linear') * Math.PI) * 30;     // little hop
      if (t > K.finally) { f.happy = t > K.understands + 0.6; f.tears = 0.45; }                                // tears of joy
    }
    if (t >= 31 && t < 37) {        // horrified at the bars, then "NOOOO"
      f.sadTalk = false; f.eye = 1.4; f.pupil = 0.5; f.brow = 1.1; f.browTilt = 0.7; f.mouth = 'o'; f.open = 0.15; f.look = [0, 0]; f.tears = 0.6;
      p.sqY = t > K.no - 0.3 && t < K.no ? 1.04 : 1;                  // big inhale
    }
    talk(t, ALEX_LINES, f);
    p.face = f;
    return p;
  }

  // the neighbour in set B (his own cell, same layout)
  function brunoB(t) {
    const step = prog(t, 6.5, 7.9, 'inOut');
    const back = { x: 455, feet: 1395 }, front = { x: 588, feet: 1480 };
    const x = lerp(back.x, front.x, step), feet = lerp(back.feet, front.feet, step);
    const ph = (t - 6.5) * Math.PI * 2 * 1.4, a = step > 0 && step < 1 ? Math.sin(step * Math.PI) : 0;
    const p = Object.assign({ x, y: feet - (138 + 128 + 14) * BRUNO_SC - Math.abs(Math.sin(ph)) * 8 * a, sc: BRUNO_SC }, BRUNO_LOOK);
    p.legL = [-8 + 18 * Math.sin(ph) * a, Math.max(0, -Math.sin(ph)) * 16 * a]; p.legR = [8 - 18 * Math.sin(ph) * a, -Math.max(0, Math.sin(ph)) * 16 * a];
    const hip = p.y;
    const f = { turn: 0.1, look: [-0.3, 0], mouth: 'flat', brow: 0.4, browTilt: -0.1, eye: 1.0, pupil: 1.0 };
    f.blink = blink(t, [6.0, 10.8, 13.0]);
    // default: arms crossed-ish / relaxed
    let wl = [x - 60, hip - 10], wr = [x + 60, hip - 10], hL = 'fist', hR = 'fist', rL = 0, rR = 0;
    if (t > 7.6) {   // grips the bars
      const g = prog(t, 7.6, 7.95, 'outBack');
      wl = [lerp(wl[0], BARS[3] + 2, g), lerp(wl[1], hip - 78, g)]; wr = [lerp(wr[0], BARS[4] - 2, g), lerp(wr[1], hip - 78, g)];
    }
    // "We get free food, free water, and a free bed!" — counting; "Outside…" — thumb; "PAY" — rubs fingers; "everything" — arms out
    const cnt = prog(t, K.we + 0.1, K.food, 'outBack') * (1 - prog(t, K.outside - 0.1, K.outside + 0.15));
    if (cnt > 0) {
      wr = [lerp(wr[0], x + 75, cnt), lerp(wr[1], hip - 95, cnt)];
      hR = 'point'; rR = 165;
      const w2 = prog(t, K.water - 0.1, K.water + 0.15, 'outBack');
      if (w2 > 0) { wl = [lerp(wl[0], x - 75, w2 * cnt), lerp(wl[1], hip - 92, w2 * cnt)]; hL = 'point'; rL = 195; }
      if (t > K.bed) { wr = [x + 100, hip - 115]; rR = 215; }
    }
    const outK = prog(t, K.outside - 0.05, K.outside + 0.25, 'outBack') * (1 - prog(t, K.PAY - 0.2, K.PAY));
    if (outK > 0) { wr = [lerp(wr[0], x + 160, outK), lerp(wr[1], hip - 150, outK)]; hR = 'point'; rR = 100; wl = [lerp(wl[0], x - 60, outK), lerp(wl[1], hip - 10, outK)]; hL = 'fist'; }
    const pay = prog(t, K.PAY - 0.15, K.PAY + 0.05, 'outBack') * (1 - prog(t, K.everything, K.everything + 0.15));
    if (pay > 0) {
      const rub = Math.sin(t * 40) * 6;
      wr = [lerp(wr[0], x + 34 + rub, pay), lerp(wr[1], hip - 82, pay)]; wl = [lerp(wl[0], x - 34 - rub, pay), lerp(wl[1], hip - 80, pay)];
      hR = 'fist'; hL = 'fist';
    }
    const ev = prog(t, K.everything, K.everything + 0.25, 'outBack') * (1 - prog(t, 15, 15.3));
    if (ev > 0) { wl = [lerp(wl[0], x - 120, ev), lerp(wl[1], hip - 40, ev)]; wr = [lerp(wr[0], x + 120, ev), lerp(wr[1], hip - 40, ev)]; hL = 'open'; hR = 'open'; rL = -95; rR = 95; }
    if (t > 31) { wl = [BARS[3] + 2, hip - 78]; wr = [BARS[4] - 2, hip - 78]; hL = 'fist'; hR = 'fist'; rL = 0; rR = 0; }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotL = rL; p.handRotR = rR; p.thumbL = 1; p.thumbR = -1;
    p.gripBars = (t > 7.95 && t < K.we + 0.1) || t > 31;
    // face
    if (t < 6.5) { f.brow = 0.7; f.browTilt = 0.1; f.look = [-0.2, 0]; f.mouth = 'smile'; }
    if (t >= K.we) { f.brow = 0.6; f.browTilt = 0.2; f.eye = 1.1; f.look = [-0.1, 0]; f.mouth = 'flat'; }
    if (t > K.PAY - 0.1 && t < K.PAY + 0.5) { f.eye = 1.3; f.pupil = 0.7; f.brow = 1.0; }
    p.headTilt = t > K.we && t < 14.3 ? Math.sin(t * 3.3) * 5 : 0;
    if (t > K.PAY - 0.1 && t < K.PAY + 0.4) p.y -= Math.sin(prog(t, K.PAY - 0.1, K.PAY + 0.4, 'linear') * Math.PI) * 18;
    if (t > 31) { f.eye = 1.4; f.pupil = 0.5; f.brow = 1.1; f.browTilt = 0.7; f.mouth = 'o'; f.open = 0.15; f.look = [0, 0]; }
    talk(t, BRUNO_LINES, f);
    p.face = f;
    return p;
  }

  // guard in sets A/B (only seen walking off at the very start, or at the edge of frame)
  function guardWalkA(t) {
    const stopK = prog(t, 3.83, 4.1);
    const walkT = Math.min(t, 3.83);
    const ph = walkT * Math.PI * 2 * 1.6;
    const amp = 1 - stopK;
    const p = Object.assign({ x: 1340 + walkT * 230, y: hipY(GUARD.feet, GUARD.sc) - Math.abs(Math.sin(ph)) * 10 * amp, sc: GUARD.sc }, GUARD_LOOK);
    p.legL = [-8 + 22 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 20 * amp]; p.legR = [8 - 22 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 20 * amp];
    p.armL = [-10 - 12 * Math.sin(ph) * amp, 40]; p.handL = 'fist'; p.itemL = 'folder';
    p.armR = [10 + 12 * Math.sin(ph) * amp, -10]; p.handR = 'fist';
    p.face = { turn: 0.55, look: [1, 0], mouth: 'flat', brow: 0.1, browTilt: -0.75, lid: 0.25, red: 0.12, blink: blink(t, [1.2]) };
    return p;
  }

  // ---------- set C: everybody in the corridor ----------
  const PAPERS = Array.from({ length: 7 }, (_, i) => ({ vx: (i - 3) * 55 + (i % 2 ? 20 : -15), vy: -220 - (i % 3) * 60, rot: (i * 47) % 360, spin: (i % 2 ? 1 : -1) * (180 + i * 30), land: 1395 + (i % 4) * 14 }));

  function guardC(t) {
    // stands in the middle of the corridor between the two cells
    let z = 2.2, back = false;
    // 2.3–3.83: walking away (back to us), then stops and turns around at "Hey!"
    if (t < 3.95) { z = lerp(2.0, 2.45, prog(t, 2.3, 3.83, 'linear')); back = true; }
    else if (t < 20) z = 2.45;
    else if (t < 36.31) z = 2.2;
    // dragged scene: walks off towards the far door (back to us)
    const drag = prog(t, 36.6, 38.6, 'linear');
    if (t >= 36.31) { z = lerp(2.15, 4.3, drag); back = true; }
    const sp = spot(0, z, 1.0);
    const walking = (t > 2.3 && t < 3.83) || t > 36.6;
    const ph = t * Math.PI * 2 * 1.7, amp = walking ? 1 : 0;
    const p = Object.assign({ x: sp.x, y: sp.hip - Math.abs(Math.sin(ph)) * 8 * sp.sc * amp, sc: sp.sc, back }, GUARD_LOOK);
    p.legL = [-8 + 6 * Math.sin(ph) * amp, Math.max(0, Math.sin(ph)) * 28 * amp]; p.legR = [8 - 6 * Math.sin(ph) * amp, -Math.max(0, -Math.sin(ph)) * 28 * amp];
    const head = CH.headPos(p);
    const hip = p.y, x = p.x, s = p.sc;
    let wl = [x - 60 * s, hip - 30 * s], wr = [x + 62 * s, hip - 8 * s], hR = 'fist', rR = 0, thR = -1;
    let folder = t < K.threw + 0.05;
    const f = { turn: 0, look: [0, 0.05], mouth: 'flat', brow: 0.1, browTilt: -0.6, eye: 1, pupil: 1, lid: 0.2, red: 0.12 };
    f.blink = blink(t, [21.9, 24.3, 24.45, 33]);
    if (t >= 3.95 && t < 20) {   // turned around, surprised, looking at A-13 (right)
      const k = prog(t, 3.95, 4.2, 'outBack');
      f.turn = 0.55; f.look = [1, -0.05]; f.eye = lerp(1, 1.3, k); f.pupil = 0.6; f.brow = 0.9; f.browTilt = 0.1; f.lid = 0;
      p.headTilt = 4;
    }
    // "slowly looked from one prisoner to the other"
    if (t >= 20 && t < 23.5) {
      const l = prog(t, 20.9, 21.8, 'sine'), r = prog(t, 22.1, 23.0, 'sine');
      f.turn = lerp(lerp(0.1, -0.6, l), 0.6, r); f.look = [lerp(lerp(0, -1, l), 1, r), 0.05]; f.eye = 1.05; f.lid = 0.3; f.brow = 0.25; f.browTilt = -0.2;
    }
    // "stood there in silence for a moment" — frozen, eye twitch
    if (t >= 23.5 && t < 25.95) {
      f.turn = 0.05; f.look = [0, 0]; f.lid = 0.38; f.brow = 0.1; f.browTilt = -0.15; f.eye = 1.0;
      if (t > 24.8 && t < 25.4) f.browTilt = -0.15 + Math.sin(t * 60) * 0.25;
    }
    // "Then he threw his papers on the floor"
    let folderPos = null;
    if (t >= 25.95 && t < 28.4) {
      const up = prog(t, 26.0, 26.45, 'out'), down = prog(t, 26.5, K.threw + 0.08, 'in');
      wl = [lerp(lerp(wl[0], x - 40 * s, up), x - 70 * s, down), lerp(lerp(wl[1], head[1] - 140 * s, up), hip - 20 * s, down)];
      f.browTilt = -0.85; f.lid = 0.15; f.eye = 1.1; f.red = 0.35; f.mouth = 'tight';
      p.sqY = t > K.threw && t < K.threw + 0.2 ? 0.96 : 1;
    }
    if (t >= 28.4 && t < 31.6) {   // "THAT'S IT! BOTH OF YOU! GET OUT! NOW!"
      f.red = 0.75; f.browTilt = -0.9; f.brow = 0.2; f.eye = 1.15; f.pupil = 0.8; f.lid = 0;
      const pl = prog(t, K.both, K.both + 0.15, 'outBack') * (1 - prog(t, K.both + 0.3, K.both + 0.4));
      const pr = prog(t, K.both + 0.35, K.both + 0.5, 'outBack') * (1 - prog(t, K.getout - 0.1, K.getout));
      const go = prog(t, K.getout, K.getout + 0.2, 'outBack');
      if (pl > 0) { wl = [lerp(wl[0], x - 150 * s, pl), lerp(wl[1], hip - 150 * s, pl)]; }
      if (pr > 0) { wr = [lerp(wr[0], x + 150 * s, pr), lerp(wr[1], hip - 150 * s, pr)]; hR = 'point'; rR = 95; }
      if (go > 0) { wr = [lerp(wr[0], x + 70 * s, go), lerp(wr[1], head[1] - 20 * s, go)]; hR = 'point'; rR = 200; }   // thumb back over the shoulder to the exit
      if (t > K.now) p.lean = Math.sin(prog(t, K.now, 31.4, 'linear') * Math.PI) * -4;
      f.turn = pl > 0.5 ? -0.5 : pr > 0.5 ? 0.5 : 0;
    }
    if (t >= 31.6 && t < 36.31) { f.red = 0.5; f.browTilt = -0.8; f.lid = 0.1; f.look = [0, 0]; f.mouth = 'tight'; }
    // unlock: a sweep of the key hand
    if (t >= 35.9 && t < 36.31) { wr = [x + 120 * s, hip - 90 * s]; hR = 'fist'; }
    // dragging (back view): hands down at the prisoners' collars
    if (t >= 36.31) {
      const A2 = alexC(t), B2 = brunoC(t);
      wl = [A2.x + 10 * A2.sc, A2.y - 190 * A2.sc]; wr = [B2.x - 10 * B2.sc, B2.y - 190 * B2.sc];
    }
    if (t < 3.95) { wl = [x - 60 * s - 10 * Math.sin(ph) * s, hip - 30 * s]; wr = [x + 62 * s + 10 * Math.sin(ph) * s, hip - 8 * s]; }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = 'fist'; p.handR = hR; p.handRotR = rR; p.thumbR = thR;
    if (folder) { p.itemL = 'folder'; p.folderOpenL = 0; }
    talk(t, GUARD_LINES, f);
    p.face = f;
    return p;
  }

  function prisonerC(t, side, look, base) {
    // standing inside their cells, at the bars
    const sp = spot(side, 2.05, base);
    const p = Object.assign({ x: sp.x, y: sp.hip, sc: sp.sc }, look);
    p.legL = [-8, 2]; p.legR = [8, -2];
    return { p, sp };
  }
  function alexC(t) {
    let { p } = prisonerC(t, -1, ALEX_LOOK, ALEX.sc);
    const f = { turn: 0.45, look: [1, 0], mouth: 'smile', brow: 0.7, browTilt: 0.2, eye: 1.15, pupil: 1.2, time: t, tears: 0.3 };
    f.blink = blink(t, [21.2, 26.8]);
    huggedPillow(p, t);
    const cx = p.x, cy = p.y - 112 * p.sc;
    p.armL = CH.armIK(p, -1, cx + 24 * p.sc / 0.85, cy + 34 * p.sc / 0.85, -1); p.armR = CH.armIK(p, 1, cx - 18 * p.sc / 0.85, cy + 18 * p.sc / 0.85, 1);
    p.handL = 'fist'; p.handR = 'fist';
    if (t > 23.5) { f.mouth = 'nervous'; f.brow = 0.8; f.browTilt = 0.7; f.look = [0.8, 0.1]; f.pupil = 1.0; }
    if (t > 28.4) { f.eye = 1.35; f.pupil = 0.55; f.brow = 1.1; f.mouth = 'o'; f.open = 0.15; f.tears = 0.6; f.look = [0.8, 0]; }
    if (t > K.dragged) {
      // dragged backwards by the collar, reaching for his cell
      const drag = prog(t, 36.6, 38.6, 'linear');
      const g = guardDragZ(t);
      const sp = spot(0, g - 0.18, ALEX.sc);
      const sp0 = spot(-1, 2.05, ALEX.sc);
      const k = prog(t, K.dragged, 36.7, 'inOut');
      p.x = lerp(sp0.x, sp.x - 95 * sp.sc, k); p.sc = lerp(sp0.sc, sp.sc, k); p.y = lerp(sp0.hip, sp.hip + 30 * sp.sc, k);
      p.rot = -14 + Math.sin(t * 9) * 4; p.legL = [-30, 20]; p.legR = [25, -5 + Math.sin(t * 14) * 25];
      p.chest = pillowSvg(-30, -100, 1.25, 1.35, 12);
      p.armL = CH.armIK(p, -1, p.x + 20 * p.sc, p.y - 70 * p.sc, -1); p.handL = 'fist';
      const bar = P(-1, 2.0 + drag * 0.6, 0.5);   // reaching back towards the cell bars
      const reach = 1 - prog(t, 36.9, 37.2);
      p.armR = CH.armIK(p, 1, lerp(p.x - 150 * p.sc, bar[0], reach), lerp(p.y - 260 * p.sc, bar[1], reach), 1); p.handR = reach > 0.3 ? 'fist' : 'open'; p.handRotR = 180;
      f.mouth = 'nervous'; f.eye = 1.35; f.pupil = 0.6; f.brow = 1.0; f.browTilt = 0.9; f.tears = 1; f.look = [-0.9, -0.2]; f.turn = -0.3;
    }
    talk(t, ALEX_LINES, f);
    p.face = f;
    return p;
  }
  function brunoC(t) {
    let { p } = prisonerC(t, 1, BRUNO_LOOK, BRUNO_SC);
    const f = { turn: -0.45, look: [-1, 0], mouth: 'flat', brow: 0.5, browTilt: 0.1, eye: 1.05, pupil: 1.0 };
    f.blink = blink(t, [22.4, 27.2]);
    if (t < 4.4) { f.mouth = 'smile'; f.brow = 0.7; }
    const s = p.sc, x = p.x, hip = p.y;
    p.armL = CH.armIK(p, -1, x - 60 * s, hip - 80 * s, -1); p.armR = CH.armIK(p, 1, x + 40 * s, hip - 80 * s, 1); p.handL = 'fist'; p.handR = 'fist';
    if (t < 6) { p.armL = CH.armIK(p, -1, x - 60 * s, hip - 10 * s, -1); p.armR = CH.armIK(p, 1, x + 60 * s, hip - 10 * s, 1); }
    if (t > 23.5) { f.mouth = 'nervous'; f.browTilt = 0.6; }
    if (t > 28.4) { f.eye = 1.35; f.pupil = 0.55; f.brow = 1.1; f.browTilt = 0.7; f.mouth = 'o'; f.open = 0.15; f.look = [-0.8, 0]; }
    if (t > K.dragged) {
      const drag = prog(t, 36.6, 38.6, 'linear');
      const g = guardDragZ(t);
      const sp = spot(0, g - 0.18, BRUNO_SC);
      const sp0 = spot(1, 2.05, BRUNO_SC);
      const k = prog(t, K.dragged, 36.7, 'inOut');
      p.x = lerp(sp0.x, sp.x + 95 * sp.sc, k); p.sc = lerp(sp0.sc, sp.sc, k); p.y = lerp(sp0.hip, sp.hip + 30 * sp.sc, k);
      p.rot = 14 + Math.sin(t * 8 + 1) * 4; p.legL = [-25, 5 + Math.sin(t * 13) * 25]; p.legR = [30, -20];
      const bar = P(1, 2.0 + drag * 0.6, 0.5);
      const reach = 1 - prog(t, 37.0, 37.3);
      p.armL = CH.armIK(p, -1, lerp(p.x + 150 * p.sc, bar[0], reach), lerp(p.y - 260 * p.sc, bar[1], reach), -1); p.handL = reach > 0.3 ? 'fist' : 'open'; p.handRotL = 180;
      p.armR = CH.armIK(p, 1, p.x + 140 * p.sc, p.y - 230 * p.sc, 1); p.handR = 'open'; p.handRotR = 180;
      f.mouth = 'nervous'; f.eye = 1.35; f.pupil = 0.6; f.brow = 1.0; f.browTilt = 0.9; f.look = [0.9, -0.2]; f.turn = 0.3;
    }
    talk(t, BRUNO_LINES, f);
    p.face = f;
    return p;
  }
  function guardDragZ(t) { return lerp(2.15, 4.3, prog(t, 36.6, 38.6, 'linear')); }

  function papers(t, guardP) {
    if (t < K.threw) return '';
    const s = guardP.sc, x0 = guardP.x - 70 * s, y0 = guardP.y - 20 * s;
    const tau = t - K.threw;
    let o = '';
    // the folder smacks onto the floor
    const fy = Math.min(y0 + 0.5 * 2600 * tau * tau, 1405);
    o += `<g transform="translate(${f1(x0 - 20 * s)} ${f1(fy)}) scale(${f1(s)}) rotate(${f1(Math.min(tau * 400, 80))})"><rect x="-50" y="-60" width="100" height="124" rx="7" fill="#e9c46a" stroke="#6b4f12" stroke-width="5"/></g>`;
    for (const pp of PAPERS) {
      const fall = Math.min(1, tau / 1.4);
      const x = x0 + pp.vx * s * Math.min(tau, 0.9) + Math.sin(tau * 6 + pp.rot) * 18 * s * (1 - fall);
      const y = Math.min(y0 - 60 * s + pp.vy * s * tau + 0.5 * 600 * s * tau * tau, pp.land + (t > 30 ? 0 : 0));
      const landed = y >= pp.land - 0.5;
      const r = landed ? pp.rot : pp.rot + pp.spin * tau;
      o += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${f1(s)} ${f1(landed ? s * 0.45 : s)})"><rect x="-30" y="-40" width="60" height="80" fill="#fffdf6" stroke="#8a7a5a" stroke-width="3"/><path d="M-18 -24h36M-18 -12h30M-18 0h34" stroke="#9aa3b2" stroke-width="4"/></g>`;
    }
    return o;
  }

  // ---------- set D: outside ----------
  function outsideCast(t) {
    // prisoners are flung out of the door, the guard slams it
    const doorOpen = t < K.door - 0.05 ? prog(t, 38.62, 38.85, 'out') : 1 - prog(t, K.door - 0.05, K.shut, 'in');
    const fly = (t0, x1, y1, spin) => {
      const k = prog(t, t0, t0 + 0.45, 'linear');
      const x = lerp(540, x1, k), y = lerp(1250, y1, k) - Math.sin(k * Math.PI) * 260;
      return { k, x, y, rot: k < 1 ? spin * k : 0 };
    };
    const a = fly(38.7, 300, 1585, -360), b = fly(38.85, 790, 1590, 360);
    const sitPose = (pp, lookX) => {
      pp.legK = [0.35, 0.45]; pp.legL = [-55, 30]; pp.legR = [55, -30];
    };
    const alex = Object.assign({ x: a.x, y: a.y, sc: 0.9, rot: a.rot }, ALEX_LOOK);
    const bruno = Object.assign({ x: b.x, y: b.y, sc: 0.95, rot: b.rot }, BRUNO_LOOK);
    for (const [pp, fl] of [[alex, a], [bruno, b]]) {
      if (fl.k >= 1) sitPose(pp); else { pp.legL = [-40, 30]; pp.legR = [40, -30]; }
    }
    // Alex still clutches the pillow
    const sqA = 0.5 + 0.3 * Math.sin(t * 5);
    alex.chest = pillowSvg(0, -112, 1.45 - 0.12 * sqA, 1.55 + 0.12 * sqA, -8);
    alex.armL = CH.armIK(alex, -1, alex.x + 24 * 0.9 / 0.85, alex.y - 112 * 0.9 + 34, -1); alex.armR = CH.armIK(alex, 1, alex.x - 18, alex.y - 112 * 0.9 + 18, 1);
    alex.handL = 'fist'; alex.handR = 'fist';
    bruno.armL = CH.armIK(bruno, -1, bruno.x - 70, bruno.y + 20, -1); bruno.armR = CH.armIK(bruno, 1, bruno.x + 70, bruno.y + 20, 1);
    bruno.handL = 'open'; bruno.handR = 'open';
    const slamJolt = t > K.shut && t < K.shut + 0.3 ? 1 : 0;
    const fa = { turn: 0.2, look: [0.3, -0.6], mouth: 'nervous', brow: 1.0, browTilt: 1.0, eye: 1.3, pupil: 0.6, time: t, tears: 0.8 };
    const fb = { turn: -0.2, look: [-0.3, -0.6], mouth: 'nervous', brow: 1.0, browTilt: 0.9, eye: 1.3, pupil: 0.6 };
    if (t > K.shut) { fa.eye = 1.45; fb.eye = 1.45; fa.pupil = 0.45; fb.pupil = 0.45; }
    // the final beat: they look at the shut door… then at each other
    if (t > 41.0) { fa.turn = 0.5; fa.look = [1, 0]; fb.turn = -0.5; fb.look = [-1, 0]; fa.mouth = 'frown'; fb.mouth = 'frown'; fa.eye = 1.15; fb.eye = 1.15; fa.pupil = 1.3; fb.pupil = 1.3; fa.sadTalk = true; }
    fa.blink = blink(t, [40.8]); fb.blink = blink(t, [40.85]);
    alex.face = fa; bruno.face = fb;
    alex.y -= slamJolt * 14; bruno.y -= slamJolt * 14;
    // guard in the doorway
    const g = Object.assign({ x: 545, y: 1470 - (138 + 128 + 14) * 0.82, sc: 0.82 }, GUARD_LOOK);
    g.armL = CH.armIK(g, -1, 470, g.y - 60, -1); g.handL = 'fist';
    const reachDoor = prog(t, K.door - 0.4, K.door - 0.1);
    g.armR = CH.armIK(g, 1, lerp(g.x + 70, 650, reachDoor), lerp(g.y - 20, 1210, reachDoor), 1); g.handR = 'fist';
    g.face = { turn: 0, look: [0, 0.2], mouth: 'tight', brow: 0.2, browTilt: -0.85, lid: 0.15, red: 0.55, blink: 0 };
    return { alex, bruno, guard: g, doorOpen, a, b };
  }
  function dust(t, x, y, t0, n = 7) {
    if (t < t0 || t > t0 + 0.9) return '';
    const k = prog(t, t0, t0 + 0.9, 'out');
    let o = '';
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.05 + 0.9 * i / (n - 1));
      o += `<circle cx="${f1(x + Math.cos(a) * (40 + 120 * k) * (i % 2 ? 1 : -1))}" cy="${f1(y - Math.sin(a) * 30 * k)}" r="${f1(18 + 30 * k)}" fill="#d8d2c4" opacity="${f1(0.75 * (1 - k))}"/>`;
    }
    return o;
  }

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const shot = shotAt(t);
    const set = shot[1];
    const c = kf(t, shot[2]);
    let shake = 0;
    if (t > K.PAY && t < K.PAY + 0.6) shake += 12 * Math.exp(-(t - K.PAY) * 6);
    if (t > K.now && t < K.now + 0.8) shake += 16 * Math.exp(-(t - K.now) * 5);
    if (t > K.no && t < NO[1]) shake += 6;
    if (t > K.threw && t < K.threw + 0.4) shake += 8 * Math.exp(-(t - K.threw) * 8);
    if (t > K.shut && t < K.shut + 1.0) shake += 26 * Math.exp(-(t - K.shut) * 5);
    const cam = { cx: c[0] + Math.sin(t * 61) * shake, cy: c[1] + Math.cos(t * 47) * shake, z: c[2] };
    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, defs());
    o.push(`<g transform="translate(540 960) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    if (set === 'A') {
      const ap = alexA(t);
      o.push(cellBack('A'), CH.figure(ap), bars('A'));
      if (t < 4.4) { const g = guardWalkA(t); o.push(`<ellipse cx="${f1(g.x)}" cy="${GUARD.feet + 22}" rx="115" ry="16" fill="#000" opacity=".25" filter="url(#fBlurP)"/>`, CH.figure(g)); }
    } else if (set === 'B') {
      const bp = brunoB(t);
      o.push(cellBack('B'));
      // A-13 is darker at the back: he steps out of the shadow
      const shade = 0.55 * (1 - prog(t, 6.4, 7.9));
      o.push(CH.figure(bp));
      if (shade > 0.01) o.push(`<rect x="60" y="400" width="900" height="1100" fill="#0d1114" opacity="${f1(shade)}"/>`);
      o.push(bars('B'));
      if (bp.gripBars) o.push(CH.figure(Object.assign({}, bp, { _handsOnly: 'LR' })));
    } else if (set === 'C') {
      const gp = guardC(t);
      const open = prog(t, K.unlock, K.unlock + 0.3, 'out');
      o.push(corrBase());
      if (t < K.dragged) {
        const ap = alexC(t), bp = brunoC(t);
        // the neighbour lurks in the dark before he speaks up
        o.push(CH.figure(ap), CH.figure(bp));
        if (t < 4.4) o.push(quad(P(1, CELL_Z[0], 0.12), P(1, CELL_Z[1], 0.12), P(1, CELL_Z[1], 0.98), P(1, CELL_Z[0], 0.98), 'rgba(8,10,12,0.55)'));
        o.push(corrBars(open));
        o.push(papers(t, gp));
        o.push(CH.figure(gp));
      } else {
        o.push(corrBars(1), papers(t, guardC(K.threw + 0.01)));
        const ap = alexC(t), bp = brunoC(t);
        o.push(CH.figure(gp), CH.figure(ap), CH.figure(bp));
      }
    } else {
      const d = outsideCast(t);
      o.push(exterior());
      if (d.doorOpen > 0.05) o.push(CH.figure(d.guard));
      o.push(extDoor(d.doorOpen));
      o.push(dust(t, d.a.x, 1600, 39.15), dust(t, d.b.x, 1605, 39.3));
      o.push(dust(t, 540, 1470, K.shut, 9));
      if (d.a.k > 0) o.push(CH.figure(d.alex));
      if (d.b.k > 0) o.push(CH.figure(d.bruno));
    }
    o.push('</g>');
    o.push(`<rect width="1080" height="1920" fill="#1d3340" opacity="${set === 'D' ? 0.04 : 0.12}" style="mix-blend-mode:multiply"/>`);
    o.push(`<defs><radialGradient id="gVigP" cx=".5" cy=".45" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05080a" stop-opacity="${set === 'D' ? 0.35 : 0.55}"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigP)"/>`);
    if (t > K.shut && t < K.shut + 0.12) o.push(`<rect width="1080" height="1920" fill="#fff" opacity="${f1(0.35 * (1 - (t - K.shut) / 0.12))}"/>`);
    // ending: fade to black
    const fade = prog(t, T.duration - 0.55, T.duration - 0.05, 'in');
    if (fade > 0) o.push(`<rect width="1080" height="1920" fill="#000" opacity="${f1(fade)}"/>`);
    svg.innerHTML = o.join('');
  };
})();
