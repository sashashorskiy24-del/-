// "Alex Doesn't Want to Leave Prison" — Scene 1: the release.
// Voice-over: assets/audio/prison_voiceover_full.mp3, 0.0s–20.9s.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s, end = i => W[i].e;

  // ---------------- who speaks when (from the word timings) ----------------
  const GUARD_LINES = [[at(13), 8.13]];              // "Alex, congratulations, you're free. You can go home today."
  const ALEX_LINES = [[at(28), 11.57], [at(29), 13.55], [at(34), 16.89], [at(45), 18.44]];
  const K = {
    papers: at(12),          // 3.28
    alex: at(13),            // 4.16  guard: "Alex,"
    congrats: at(14),        // 4.88
    free: at(15),            // 6.08  "you're free"
    goHome: at(17),          // 7.04  "You can go home today"
    guardEnd: 8.13,
    slowly: at(22),          // 8.64  narrator: "Alex slowly got out of bed"
    no: at(28),              // 10.96 Alex: "No,"
    please: at(29),          // 11.84
    have: at(34),            // 13.92 "I have free food,"
    water: at(38),           // 15.12
    bed: at(40),             // 15.84 "and a free bed here"
    everything: at(45),      // 17.28
    FREE: at(47),            // 17.92
    alexEnd: 18.44,
    hug: at(48),             // 18.88 narrator: "Alex hugged his pillow tightly."
  };
  const CUT = 2.0;            // corridor establishing shot -> cell

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
  function alexPose(t) {
    const sit = prog(t, 8.75, 9.65, 'sine');                 // slowly sits up
    const stand = prog(t, 9.7, 10.15, 'inOut');              // stands up
    const step = prog(t, 10.15, 10.9, 'inOut');             // shuffles to the bars
    const lieHip = [495, 1166], sitHip = [600, 1215], standHipBed = [600, hipY(FLOOR_CELL + 30, ALEX.sc)];
    const standHip = [ALEX.standX, hipY(ALEX.standFeet, ALEX.sc)];
    let hx = lerp(lieHip[0], sitHip[0], sit), hy = lerp(lieHip[1], sitHip[1], sit);
    hx = lerp(hx, standHipBed[0], stand); hy = lerp(hy, standHipBed[1], stand);
    hx = lerp(hx, standHip[0], step); hy = lerp(hy, standHip[1], step);
    const p = Object.assign({ x: hx, y: hy, sc: ALEX.sc, rot: lerp(90, 0, sit) }, ALEX_LOOK);
    // legs: straight & crossed (lying) -> seated -> standing
    const tap = t < 8.6 ? Math.max(0, Math.sin(t * 7)) * 14 : 0;
    const seatL = [-35, 35], seatR = [35, -35];
    // while sitting up the legs stay flat on the bed (world-horizontal), then swing down over the edge
    const rot = lerp(90, 0, sit), along = rot - 90, swing = prog(sit, 0.55, 1, 'inOut');
    p.legL = A.mix(A.mix([along + 4, 0], seatL, swing), [-8, 2], stand);
    p.legR = A.mix(A.mix([along - 6, tap], seatR, swing), [8, -2], stand);
    p.legK = A.mix(A.mix([1, 1], [0.32, 1], swing), [1, 1], stand);
    // step cycle while shuffling
    if (step > 0 && step < 1) {
      const ph = (t - 10.15) * Math.PI * 2 * 1.4, a = Math.sin(step * Math.PI);
      p.legL = [-8 + 16 * Math.sin(ph) * a, Math.max(0, -Math.sin(ph)) * 16 * a];
      p.legR = [8 - 16 * Math.sin(ph) * a, -Math.max(0, Math.sin(ph)) * 16 * a];
      p.y -= Math.abs(Math.sin(ph)) * 6 * a;
    }
    p.headTilt = lerp(-64, 0, sit);
    p.lean = lerp(0, 6, stand) * (1 - prog(t, 10.8, 11.1)) ;   // slumped while getting up
    const f = { turn: 0.2, look: [0, 0], mouth: 'smile', open: 0, brow: 0, browTilt: 0, eye: 1, pupil: 1 };

    // ----- arms
    const head = CH.headPos(p);
    if (sit < 0.5) {
      // relaxed: hands behind the head
      p.armL = CH.armIK(p, -1, head[0] + 30, head[1] - 62, 1);
      p.armR = CH.armIK(p, 1, head[0] + 70, head[1] - 10, 1);
      p.handL = 'fist'; p.handR = 'fist';
      p.armBehindL = true; p.armBehindR = true;
    } else if (t < 10.9) {
      // hanging, a bit limp
      p.armL = [-9 + 2 * Math.sin(t * 2.1), 12 + 3 * Math.sin(t * 2.6)]; p.armR = [9 + 2 * Math.sin(t * 2.3 + 1), -12 - 3 * Math.sin(t * 2.8)]; p.handL = 'fist'; p.handR = 'fist';
    }
    // ----- the plea (natural arms: elbows down/out, hands at chest height)
    p.gripBars = false;
    if (t >= 10.9 && t < K.hug) {
      const sx = standHip[0], sy = standHip[1];
      const hangL = [sx - 62, sy - 6], hangR = [sx + 62, sy - 6];          // relaxed, slightly bent
      const grab = prog(t, 10.9, 11.12, 'outBack') * (1 - prog(t, 13.6, 13.9));
      const barL = [BARS[3] + 2, sy - 78], barR = [BARS[4] - 2, sy - 78];   // grip the bars at chest height
      let wl = [lerp(hangL[0], barL[0], grab), lerp(hangL[1], barL[1], grab)];
      let wr = [lerp(hangR[0], barR[0], grab), lerp(hangR[1], barR[1], grab)];
      p.handL = 'fist'; p.handR = 'fist';
      p.gripBars = grab > 0.85;
      if (t > 13.75) {
        // counting the free stuff: one hand in front of the chest, the other relaxed
        const g1 = prog(t, 13.95, 14.25, 'outBack') * (1 - prog(t, K.bed - 0.1, K.bed + 0.2));
        const g2 = prog(t, K.water - 0.1, K.water + 0.2, 'outBack') * (1 - prog(t, K.bed - 0.1, K.bed + 0.2));
        const g3 = prog(t, K.bed, K.bed + 0.3, 'outBack') * (1 - prog(t, K.everything - 0.15, K.everything + 0.1));
        wr = [lerp(hangR[0], sx + 72, g1), lerp(hangR[1], sy - 92, g1)];
        wl = [lerp(hangL[0], sx - 72, g2), lerp(hangL[1], sy - 88, g2)];
        p.handR = g1 > 0.5 ? 'point' : 'fist'; p.handL = g2 > 0.5 ? 'point' : 'fist';
        p.handRotR = g1 > 0.5 ? 165 : 0; p.handRotL = g2 > 0.5 ? 195 : 0;
        if (g3 > 0) {   // "a free bed here" — thumb over the shoulder at the bed
          wr = [lerp(wr[0], sx + 95, g3), lerp(wr[1], sy - 112, g3)];
          p.handR = 'point'; p.handRotR = lerp(165, 215, g3);
        }
        const big = prog(t, K.everything, K.everything + 0.3, 'outBack');
        if (big > 0) {   // "Everything is FREE!" — arms open, palms up
          wl = [lerp(wl[0], sx - 118, big), lerp(wl[1], sy - 38, big)];
          wr = [lerp(wr[0], sx + 118, big), lerp(wr[1], sy - 38, big)];
          if (big > 0.4) { p.handL = 'open'; p.handR = 'open'; p.handRotL = -95; p.handRotR = 95; p.thumbL = 1; p.thumbR = -1; }
        }
      }
      p.armL = CH.armIK(p, -1, wl[0], wl[1], -1);
      p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
      p.headTilt = (t < 13.6 ? Math.sin(t * 2.2) * 7 : wob(t, 1.2, 1) * 4);
      if (t > K.FREE - 0.05 && t < K.alexEnd) { p.y -= Math.sin(prog(t, K.FREE - 0.05, K.FREE + 0.3, 'linear') * Math.PI) * 26; }
    }
    // ----- hugging the pillow
    let pillow = null;
    if (t >= K.hug - 0.1) {
      const reach = prog(t, K.hug - 0.1, K.hug + 0.25, 'out');
      const lift = prog(t, K.hug + 0.25, K.hug + 0.6, 'inOut');
      const squeeze = t > K.hug + 0.6 ? 0.5 + 0.5 * Math.sin((t - K.hug - 0.6) * 9) : 0;
      if (lift < 1) {
        const px = lerp(PILLOW[0], p.x, lift), py = lerp(PILLOW[1], p.y - 110 * p.sc, lift);
        pillow = { world: [px, py], s: 1 };
        p.armL = CH.armIK(p, -1, lerp(p.x - 50, px - 55, reach), lerp(p.y - 10, py, reach), -1);
        p.armR = CH.armIK(p, 1, lerp(p.x + 50, px + 55, reach), lerp(p.y - 10, py, reach), 1);
        p.handL = 'open'; p.handR = 'open'; p.handRotL = 180; p.handRotR = 180;
      } else {
        const sx = 1.45 - 0.12 * squeeze, sy = 1.55 + 0.12 * squeeze;
        p.chest = pillowSvg(0, -112, sx, sy, -8);
        // arms around it from below, hands squeezing its lower corners
        const cx = p.x, cy = p.y - 112 * p.sc;
        p.armL = CH.armIK(p, -1, cx + 24 - 6 * squeeze, cy + 34, -1);
        p.armR = CH.armIK(p, 1, cx - 18 + 6 * squeeze, cy + 18, 1);
        p.handL = 'fist'; p.handR = 'fist';
        p.headTilt = 12 + Math.sin(t * 3) * 2; p.lean = -2;
        p.sqX = 1 - 0.015 * squeeze; p.sqY = 1 + 0.015 * squeeze;
      }
    }

    // ----- face
    f.blink = blink(t, [9.3, 12.6, 15.5]);
    if (t < K.alex) { f.sleep = true; f.mouth = 'smile'; }                       // dozing, totally content
    else if (t < K.free) { f.lid = lerp(0.6, 0.35, prog(t, K.alex, K.alex + 0.5)); f.look = [0.8, 0.3]; f.turn = 0.35; }   // opens his eyes lazily
    else if (t < K.goHome) {                                                      // "you're free" — eyes snap open
      const k = prog(t, K.free, K.free + 0.15, 'outBack');
      f.eye = lerp(1, 1.35, k); f.pupil = lerp(1, 0.5, k); f.brow = 0.9 * k; f.mouth = 'o'; f.open = 0.25; f.turn = 0.35; f.look = [0.8, 0.2];
    } else if (t < K.no - 0.1) {                                                  // the face falls
      const k = prog(t, K.goHome, K.goHome + 0.6);
      f.eye = lerp(1.25, 1, k); f.pupil = 1.1; f.brow = lerp(0.6, 0.35, k); f.browTilt = 0.85 * k; f.mouth = 'frown'; f.turn = 0.3;
      f.lid = 0.25 * k; f.look = t < 9.6 ? [0.8, 0.2] : [0.2, 0.7];
    }
    if (t >= K.no - 0.1 && t < K.hug - 0.1) {                                     // begging: puppy eyes
      f.turn = t < 13.75 ? 0.15 : 0.25;
      f.eye = 1.15; f.pupil = 1.45; f.brow = 0.7; f.browTilt = 0.95; f.mouth = 'frown'; f.look = [0.75, -0.3];
      if (t >= K.everything) { f.eye = 1.35; f.pupil = 0.9; f.brow = 1.0; f.browTilt = 0.4; f.look = [0.5, -0.2]; }
    }
    if (t >= K.hug - 0.1) { f.sleep = t > K.hug + 0.55; f.mouth = 'frown'; f.brow = 0.6; f.browTilt = 1; f.turn = 0.15; f.look = [0.3, 0.3]; f.pupil = 1.3; }
    f.time = t;
    f.tears = Math.max(prog(t, K.please, K.please + 0.8) * (1 - prog(t, 13.7, 14.0)) * 0.7, prog(t, K.hug + 0.3, K.hug + 1.0));
    if (t >= K.everything && t < K.hug) f.tears = 0.35;
    // lip-sync: only while Alex himself speaks
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    else if (s) { f.mouth = 'frown'; }
    p.face = f;
    return { p, pillow };
  }

  function guardPose(t) {
    const wk = prog(t, CUT, 3.5, 'linear');
    const walking = t > CUT && t < 3.55;
    const amp = walking ? Math.sin(Math.min(1, wk * 5, (1 - wk) * 5) * Math.PI / 2) : 0;
    const ph = (t - CUT) * Math.PI * 2 * 1.5;
    const x = lerp(1600, GUARD.x, E.sine(wk));
    const p = Object.assign({ x, y: hipY(GUARD.feet, GUARD.sc) - Math.abs(Math.sin(ph)) * 10 * amp, sc: GUARD.sc }, GUARD_LOOK);
    p.legL = [-8 + 22 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 20 * amp];
    p.legR = [8 - 22 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 20 * amp];
    p.lean = -3 * amp;
    p.headTilt = wob(t, 0.6, 4) * 1.5;
    // folder (left hand, towards Alex)
    const reading = prog(t, 3.75, 4.05) * (1 - prog(t, 4.6, 4.85));
    const showing = prog(t, K.congrats - 0.05, K.congrats + 0.25, 'outBack') * (1 - prog(t, 8.3, 8.6));
    const head = CH.headPos(p);
    const wl = [lerp(lerp(GUARD.x - 70, head[0] - 40, reading), GUARD.x - 95, showing), lerp(lerp(p.y - 30, head[1] + 165, reading), head[1] + 175, showing)];
    p.armL = walking ? [-10 - 12 * Math.sin(ph) * amp, 40] : CH.armIK(p, -1, wl[0], wl[1], 1);
    p.handL = 'fist'; p.itemL = 'folder'; p.folderOpenL = (reading > 0.5 || showing > 0.3) ? 1 : 0;
    // right hand: friendly gestures while speaking
    let wr = [GUARD.x + 60, p.y - 10];
    const cheer = prog(t, K.congrats, K.congrats + 0.3, 'outBack') * (1 - prog(t, K.free + 0.2, K.free + 0.5));
    const thumb = prog(t, K.goHome + 0.3, K.goHome + 0.6, 'outBack') * (1 - prog(t, 8.3, 8.6));
    wr = [lerp(wr[0], GUARD.x + 130, cheer), lerp(wr[1], head[1] - 40, cheer)];
    wr = [lerp(wr[0], GUARD.x + 150, thumb), lerp(wr[1], p.y - 170, thumb)];
    p.armR = walking ? [10 + 12 * Math.sin(ph) * amp, -10] : CH.armIK(p, 1, wr[0], wr[1], -1);
    p.handR = cheer > 0.5 ? 'open' : thumb > 0.5 ? 'point' : 'fist'; p.handRotR = 180; p.thumbR = -1;
    if (thumb > 0.5) p.handRotR = 240;

    const f = { turn: -0.45, look: [-0.85, 0.1], mouth: 'flat', open: 0, brow: 0.05, browTilt: -0.35, eye: 1 };
    if (t > K.alex - 0.3 && t < 8.6) { f.mouth = 'smile'; f.browTilt = 0; f.brow = 0.3; }
    f.blink = blink(t, [5.4, 9.9, 12.0, 16.4, 20.2]);
    if (reading > 0.5) f.look = [-0.6, 0.8];
    // watching Alex get up
    if (t > K.slowly && t < 10.9) f.look = [-0.9, 0.3];
    // the plea: friendly smile -> confusion -> disbelief (mouth stays shut!)
    if (t > K.no) {
      const k = prog(t, K.no, K.no + 0.4);
      f.mouth = 'flat'; f.brow = lerp(0.2, 0.7, k); f.browTilt = lerp(0, -0.35, k); f.eye = lerp(1, 1.1, k); f.look = [-0.85, -0.1];
      p.headTilt += lerp(0, -8, k);
    }
    if (t > K.everything + 0.3) { f.eye = 1.3; f.pupil = 0.55; f.brow = 1.0; f.browTilt = 0.1; f.mouth = 'o'; f.open = 0.05; }
    if (t > K.hug + 0.4) { f.eye = 1.05; f.pupil = 0.8; f.lid = 0.3; f.mouth = 'flat'; f.brow = 0.5; f.browTilt = -0.4; f.look = [-0.8, 0.2]; }
    const s = LIPSYNC.talk(T, t, GUARD_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    if (s) { f.brow = 0.45; f.browTilt = 0; }
    p.face = f;
    return p;
  }

  // ---------------- FX ----------------
  function tears(t, head) {
    if (t < K.hug + 0.6) return '';
    let o = '';
    for (let i = 0; i < 4; i++) {
      const k = ((t - K.hug) * 0.9 + i / 4) % 1, s = i % 2 ? 1 : -1;
      const x = head[0] + s * 40 + s * k * 20, y = head[1] + 10 + k * 120;
      o += `<path d="M${f1(x)} ${f1(y - 12)}c5 8 8 12 8 16a8 8 0 0 1-16 0c0-4 3-8 8-16Z" fill="#8fd3ff" stroke="#1b1b1b" stroke-width="2.5" opacity="${f1(Math.sin(k * Math.PI))}"/>`;
    }
    return o;
  }
  function shockLines(t, head) {
    // little "!" pop above Alex on "you're free"
    const k = prog(t, K.free, K.free + 0.25, 'outBack') * (1 - prog(t, K.goHome - 0.2, K.goHome, 'in'));
    if (k < 0.01) return '';
    return `<g transform="translate(${f1(head[0] + 40)} ${f1(head[1] - 150)}) rotate(12) scale(${f1(k)})"><text text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="120" fill="#ffd84a" stroke="#141414" stroke-width="10" paint-order="stroke">!</text></g>`;
  }
  function freeBurst(t, head, cam) {
    // emphasis on "FREE!"
    const k = prog(t, K.FREE, K.FREE + 0.2, 'out'), out = 1 - prog(t, K.alexEnd, K.alexEnd + 0.3, 'linear');
    if (t < K.FREE || t > 18.44 || out <= 0) return '';
    const hs = [540 + (head[0] - cam.cx) * cam.z, 960 + (head[1] - cam.cy) * cam.z];
    let o = '';
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2, r0 = lerp(1400, 470 + (i % 3) * 40, k), w = 0.02 + (i % 2) * 0.01;
      o += `<path d="M${f1(hs[0] + Math.cos(a) * r0)} ${f1(hs[1] + Math.sin(a) * r0)}L${f1(hs[0] + Math.cos(a - w) * 1500)} ${f1(hs[1] + Math.sin(a - w) * 1500)}L${f1(hs[0] + Math.cos(a + w) * 1500)} ${f1(hs[1] + Math.sin(a + w) * 1500)}Z" fill="#fff" opacity="${f1(0.55 * out)}"/>`;
    }
    return o;
  }

  // ---------------- camera ----------------
  function camera(t) {
    if (t < CUT) {
      const z = lerp(1.0, 1.12, prog(t, 0, CUT, 'sine'));
      return { cx: 540, cy: lerp(980, 1020, prog(t, 0, CUT)), z, rot: 0 };
    }
    const c = kf(t, [
      [CUT, [700, 1170, 0.78]],
      [3.6, [760, 1150, 0.84], 'sine'],
      [4.12, [760, 1150, 0.84], 'sine'],
      [4.14, [1070, 1170, 2.3], 'step'],            // guard close-up: "Alex, congratulations…"
      [6.04, [1065, 1160, 2.45], 'sine'],
      [6.06, [745, 1185, 2.7], 'step'],             // Alex (lying) close-up: "…you're free"
      [6.95, [745, 1182, 2.85], 'sine'],
      [6.97, [1070, 1150, 2.5], 'step'],            // guard: "You can go home today"
      [8.13, [1068, 1145, 2.65], 'sine'],
      [8.15, [745, 1185, 2.8], 'step'],             // Alex's face falls
      [8.62, [745, 1185, 2.9], 'sine'],
      [8.64, [690, 1160, 1.05], 'step'],            // "Alex slowly got out of bed" — wide
      [10.9, [660, 1130, 1.1], 'sine'],
      [10.92, [585, 1060, 2.5], 'step'],            // Alex at the bars: "No… please…"
      [13.55, [585, 1055, 2.75], 'sine'],
      [13.57, [1070, 1150, 2.6], 'step'],           // guard reaction
      [13.9, [1070, 1148, 2.65], 'sine'],
      [13.92, [590, 1110, 1.75], 'step'],           // counting the free stuff
      [17.25, [590, 1100, 1.85], 'sine'],
      [17.27, [588, 1040, 2.2], 'step'],            // "Everything is FREE!"
      [18.44, [588, 1035, 2.35], 'sine'],
      [18.46, [1070, 1150, 2.65], 'step'],          // guard: speechless
      [18.85, [1070, 1148, 2.7], 'sine'],
      [18.87, [600, 1150, 2.1], 'step'],            // hugging the pillow
      [T.duration, [595, 1165, 2.35], 'sine'],
    ]);
    const shake = t > K.FREE ? 12 * Math.exp(-(t - K.FREE) * 6) : 0;
    const sh2 = t > K.no && t < K.no + 0.6 ? 6 * Math.exp(-(t - K.no) * 8) : 0;
    return { cx: c[0] + Math.sin(t * 61) * (shake + sh2), cy: c[1] + Math.cos(t * 47) * (shake + sh2), z: c[2], rot: 0 };
  }

  // ---------------- subtitles ----------------
  const subs = SUBS.makeWordSubs(T);

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  const subsEl = document.getElementById('subs');

  window.renderFrame = function (t) {
    const cam = camera(t);
    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, defs());
    o.push(`<g transform="translate(540 960) rotate(${f1(cam.rot)}) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    if (t < CUT) {
      o.push(corridor(), corridorGuard(t));
    } else {
      const { p: ap, pillow } = alexPose(t);
      const gp = guardPose(t);
      const aHead = CH.headPos(ap);
      o.push(cellBack());
      if (!pillow && t < K.hug) o.push(pillowSvg(PILLOW[0], PILLOW[1]));
      o.push(CH.figure(ap));
      if (pillow) o.push(pillowSvg(pillow.world[0], pillow.world[1], 1, 1, -6));
      o.push(tears(t, aHead), shockLines(t, aHead));
      o.push(bars());
      if (ap.gripBars) o.push(CH.figure(Object.assign({}, ap, { _handsOnly: 'LR' })));
      o.push(`<ellipse cx="${f1(gp.x)}" cy="${GUARD.feet + 22}" rx="115" ry="16" fill="#000" opacity=".25" filter="url(#fBlurP)"/>`);
      o.push(CH.figure(gp));
      o.push('</g>');
      o.push(freeBurst(t, aHead, cam));
      o.push(`<rect width="1080" height="1920" fill="#1d3340" opacity=".12" style="mix-blend-mode:multiply"/>`);
      o.push(`<defs><radialGradient id="gVigP" cx=".5" cy=".45" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05080a" stop-opacity=".55"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigP)"/>`);
      svg.innerHTML = o.join('');
      subsEl.innerHTML = subs(t);
      return;
    }
    o.push('</g>');
    o.push(`<defs><radialGradient id="gVigP" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0f1612" stop-opacity=".38"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigP)"/>`);
    svg.innerHTML = o.join('');
    subsEl.innerHTML = subs(t);
  };
})();
