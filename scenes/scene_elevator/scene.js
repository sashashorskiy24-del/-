// Scene "Elevator" — the serious man, his stomach, and Sanya's laugh (final scene).
// Voice-over fragment 44.95s–62.93s of the full file + 1.8 s of silence for the closing comic beat.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;
  const end = i => W[i].e;

  // ---------------- key moments (from the voice-over) ----------------
  const K = {
    steps: at(3),           // "steps into an elevator"  1.37
    elevator: at(6),        //                            2.09
    man: at(7),             // "A serious looking man"   2.97
    serious: at(8),         //                            3.13
    inside: at(15),         // "But inside his head"     5.37
    please: at(21),         // "Please, please ..."      7.45
    stomach: at(26),        //                            9.21
    growl: at(27),          //                            9.61
    now: at(29), nowEnd: end(29),          //             10.25 / ~10.4
    suddenly: at(30),       // "Suddenly,"               11.05
    gurgle: 11.76,          // small gurgle SFX (pause after "Suddenly,")
    hisStomach: at(32),     //                            12.17
    growls: at(33),         //                            12.65
    GROWL: 13.72,           // big growl SFX (pause after "loudly.")
    the: at(35),            // "The man turns red"       14.17
    red: at(38),            //                            15.05
    and: at(39),            // "and Sanya bursts out laughing" 15.77
    bursts: at(41),         //                            16.65
    laughEnd: end(43),      //                            17.73
    blorp: 18.35,           // tiny growl in the closing pause
    again: 18.95,           // Sanya loses it again
    iris: 19.05,
  };

  const FEET = 1660;
  const SAN = { x: 392, sc: 0.85 };
  const MAN = { x: 700, sc: 1.0 };
  const hipY = sc => FEET - (138 + 128 + 14) * sc;

  // ---------------- sets ----------------
  const BW = [270, 810, 560, 1420];   // back wall x0,x1,y0,y1
  function defs() {
    return `<defs>
      <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ced4"/><stop offset=".5" stop-color="#e2e5e9"/><stop offset="1" stop-color="#c3c8ce"/></linearGradient>
      <linearGradient id="gSideL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f969f"/><stop offset="1" stop-color="#b9bfc6"/></linearGradient>
      <linearGradient id="gSideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#8f969f"/><stop offset="1" stop-color="#b9bfc6"/></linearGradient>
      <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93623d"/><stop offset=".5" stop-color="#ad7a50"/><stop offset="1" stop-color="#8e5d3a"/></linearGradient>
      <linearGradient id="gFloorE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6169"/><stop offset="1" stop-color="#41444b"/></linearGradient>
      <linearGradient id="gLobby" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece5da"/><stop offset="1" stop-color="#ddd3c5"/></linearGradient>
      <linearGradient id="gDoor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b4bac1"/><stop offset=".5" stop-color="#d9dde1"/><stop offset="1" stop-color="#aeb4bb"/></linearGradient>
      <radialGradient id="gCeilGlow" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>
      <filter id="fBlurE"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="fBlurE20"><feGaussianBlur stdDeviation="22"/></filter>
    </defs>`;
  }

  let INT = null;
  function interior() {
    if (INT) return INT;
    const [x0, x1, y0, y1] = BW, o = [];
    const FAR = 2600, L = -900, Rr = 1980, TOP = -700;
    // ceiling, side walls, floor (one-point perspective into the back wall)
    o.push(`<path d="M${x0} ${y0}L${x1} ${y0}L${Rr} ${TOP}L${L} ${TOP}Z" fill="#ebe7e0"/>`);
    o.push(`<path d="M${x0 + 80} ${y0 - 30}L${x1 - 80} ${y0 - 30}L${x1 + 260} ${y0 - 330}L${x0 - 260} ${y0 - 330}Z" fill="#fff8e6"/>`);
    o.push(`<path d="M${x0 + 80} ${y0 - 30}L${x1 - 80} ${y0 - 30}L${x1 + 260} ${y0 - 330}L${x0 - 260} ${y0 - 330}Z" fill="none" stroke="#d8d2c6" stroke-width="6"/>`);
    o.push(`<path d="M${x0} ${y0}L${L} ${TOP}L${L} ${FAR}L${x0} ${y1}Z" fill="url(#gSideL)"/>`);
    o.push(`<path d="M${x1} ${y0}L${Rr} ${TOP}L${Rr} ${FAR}L${x1} ${y1}Z" fill="url(#gSideR)"/>`);
    // side wall panel seams
    for (const k of [0.35, 0.7]) {
      const xl = lerp(x0, L, k), xr = lerp(x1, Rr, k);
      o.push(`<path d="M${f1(xl)} ${f1(lerp(y0, TOP, k))}L${f1(xl)} ${f1(lerp(y1, FAR, k))}" stroke="#7d848d" stroke-width="4" opacity=".6"/>`);
      o.push(`<path d="M${f1(xr)} ${f1(lerp(y0, TOP, k))}L${f1(xr)} ${f1(lerp(y1, FAR, k))}" stroke="#7d848d" stroke-width="4" opacity=".6"/>`);
    }
    // floor
    o.push(`<path d="M${x0} ${y1}L${x1} ${y1}L${Rr} ${FAR}L${L} ${FAR}Z" fill="url(#gFloorE)"/>`);
    for (let i = 1; i < 6; i++) { const k = Math.pow(i / 6, 1.6); o.push(`<path d="M${f1(lerp(x0, L, k))} ${f1(lerp(y1, FAR, k))}H${f1(lerp(x1, Rr, k))}" stroke="#373a40" stroke-width="3" opacity=".6"/>`); }
    for (let i = 0; i <= 6; i++) { const bx = lerp(x0, x1, i / 6), fx = lerp(L, Rr, i / 6); o.push(`<path d="M${f1(bx)} ${y1}L${f1(fx)} ${FAR}" stroke="#373a40" stroke-width="3" opacity=".5"/>`); }
    // back wall: steel | wood | steel
    o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#gSteel)"/>`);
    o.push(`<rect x="450" y="${y0}" width="180" height="${y1 - y0}" fill="url(#gWood)"/>`);
    o.push(`<path d="M450 ${y0}V${y1}M630 ${y0}V${y1}" stroke="#7d848d" stroke-width="4"/>`);
    // handrails (back + perspective on the sides)
    o.push(`<rect x="${x0 + 10}" y="1230" width="${x1 - x0 - 20}" height="14" rx="7" fill="#d9b25b" stroke="#8a6a25" stroke-width="3"/>`);
    const hk = 0.55;
    o.push(`<path d="M${x0} 1236L${f1(lerp(x0, L, hk))} ${f1(lerp(1236, 1236 + (1236 - 560) * 0.95, hk))}" stroke="#d9b25b" stroke-width="14" stroke-linecap="round"/>`);
    o.push(`<path d="M${x1} 1236L${f1(lerp(x1, Rr, hk))} ${f1(lerp(1236, 1236 + (1236 - 560) * 0.95, hk))}" stroke="#d9b25b" stroke-width="14" stroke-linecap="round"/>`);
    // back-wall edges
    o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="#6f767f" stroke-width="5"/>`);
    // ceiling downlights
    for (const x of [380, 700]) o.push(`<ellipse cx="${x}" cy="${y0 - 12}" rx="26" ry="7" fill="#fffbe9"/>`);
    // control panel on the right side wall (perspective-squashed)
    o.push(`<path d="M935 760L1040 680L1040 1210L935 1190Z" fill="#cfd4da" stroke="#6f767f" stroke-width="4"/>`);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) {
      const x = 960 + c * 46 + r * 0.5, y = 830 + r * 58 - c * 12;
      o.push(`<ellipse cx="${x}" cy="${y}" rx="13" ry="16" fill="${r === 1 && c === 1 ? '#ffcf6a' : '#f2f4f6'}" stroke="#6f767f" stroke-width="3"/>`);
    }
    // little sign on the left wall
    o.push(`<path d="M150 820L60 760L60 860L150 900Z" fill="#f6f7f8" stroke="#8f969f" stroke-width="3"/><path d="M78 800l56 28M78 826l56 28" stroke="#8f969f" stroke-width="5" stroke-linecap="round"/>`);
    INT = o.join('');
    return INT;
  }

  function floorDisplay(t) {
    // floor indicator on the right wall: counts up after the doors close
    const floor = Math.min(14, 1 + Math.max(0, Math.floor((t - 3.0) / 1.25)));
    return `<path d="M935 640L1040 570L1040 660L935 720Z" fill="#141414" stroke="#6f767f" stroke-width="4"/>` +
      `<text x="0" y="0" transform="matrix(1 -0.62 0 1 975 708)" font-family="Fredoka" font-weight="700" font-size="44" fill="#ffb53d">${floor}</text>` +
      `<path d="M955 664l10-20 10 14Z" fill="#ffb53d" transform="translate(0 ${f1(Math.sin(t * 4) * 2)})"/>`;
  }

  // lobby wall with the elevator opening + sliding doors (only before the cut)
  const OP = [210, 870, 470, 1700];
  function doors(open) {
    const [x0, x1, y0, y1] = OP, w = (x1 - x0) / 2, sh = w * open;
    let o = `<clipPath id="cOp"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath><g clip-path="url(#cOp)">`;
    o += `<rect x="${f1(x0 - sh)}" y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#gDoor)" stroke="#7d848d" stroke-width="5"/>`;
    o += `<rect x="${f1(x0 + w + sh)}" y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#gDoor)" stroke="#7d848d" stroke-width="5"/>`;
    o += `</g>`;
    return o;
  }
  function lobbyWall(t) {
    const [x0, x1, y0, y1] = OP;
    let o = `<path d="M-900 -900H2000V${y1}H-900Z M${x0} ${y0}V${y1}H${x1}V${y0}Z" fill="url(#gLobby)" fill-rule="evenodd"/>`;
    for (let x = -880; x < -40; x += 46) o += `<rect x="${x}" y="-900" width="30" height="${y1 + 900}" fill="#b98a5e" opacity=".9"/>`;
    o += `<path d="M${x0 - 30} ${y1}V${y0 - 30}H${x1 + 30}V${y1}" fill="none" stroke="#aeb4bb" stroke-width="40"/>`;
    o += `<path d="M${x0 - 50} ${y1}V${y0 - 50}H${x1 + 50}V${y1}" fill="none" stroke="#7d848d" stroke-width="4"/>`;
    o += `<rect x="440" y="300" width="200" height="90" rx="12" fill="#141414"/><text x="515" y="368" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="60" fill="#ffb53d">1</text><path d="M570 360l18-34 18 34Z" fill="#ffb53d"/>`;
    o += `<rect x="960" y="1050" width="90" height="190" rx="14" fill="#c9ced4" stroke="#7d848d" stroke-width="4"/><circle cx="1005" cy="1110" r="24" fill="${t < 0.3 ? '#ffcf6a' : '#f2f4f6'}" stroke="#7d848d" stroke-width="4"/><circle cx="1005" cy="1180" r="24" fill="#f2f4f6" stroke="#7d848d" stroke-width="4"/>`;
    // lobby floor + plant
    o += `<rect x="-900" y="${y1}" width="2900" height="1200" fill="#d4cabb"/><rect x="-900" y="${y1}" width="2900" height="10" fill="#b8ad9c"/>`;
    for (let i = 1; i < 8; i++) o += `<rect x="-900" y="${y1 + i * i * 9}" width="2900" height="3" fill="#bfb4a3"/>`;
    o += `<ellipse cx="540" cy="${y1 + 70}" rx="380" ry="40" fill="#fff" opacity=".25" filter="url(#fBlurE)"/>`;
    o += `<path d="M1090 1700l-14-150h120l-14 150Z" fill="#f2efe8" stroke="#cfc6b8" stroke-width="4"/><g fill="#4f8a60"><path d="M1136 1560c-80-60-120-200-90-260 40 40 80 160 90 260Z"/><path d="M1136 1560c-10-120 30-220 90-270 10 80-30 200-90 270Z"/><path d="M1136 1560c-40-100-30-220 0-300 30 90 20 210 0 300Z" fill="#62a173"/></g>`;
    return o;
  }

  // ---------------- characters ----------------
  function sanyaPose(t) {
    // walk in from the lobby (0.3–2.1), then turn to face the doors (camera)
    const wk = prog(t, 0.3, 2.1, 'linear');
    const walking = t > 0.3 && t < 2.15;
    const amp = walking ? Math.sin(Math.min(1, wk * 5, (1 - wk) * 5) * Math.PI / 2) : 0;
    const ph = (t - 0.3) * Math.PI * 2 * 1.5;
    const x = lerp(-180, SAN.x, E.sine(wk));
    const feet = lerp(FEET + 90, FEET, prog(t, 1.4, 2.0));
    const p = { x, y: feet - (FEET - hipY(SAN.sc)) - Math.abs(Math.sin(ph)) * 10 * amp, sc: SAN.sc };
    p.legL = [-8 + 22 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 20 * amp];
    p.legR = [8 - 22 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 20 * amp];
    p.lean = 3 * amp; p.headTilt = wob(t, 0.5, 2) * 1.5;
    const sw = 14 * Math.sin(ph) * amp;
    p.armL = [-8 - sw, 6]; p.armR = [8 - sw, -6]; p.handL = 'fist'; p.handR = 'fist';

    const f = { turn: 0.2, look: [0, 0], mouth: 'smile', open: 0, brow: 0, browTilt: 0, eye: 1, pupil: 1 };
    f.blink = blink(t, [2.6, 4.4, 6.2, 9.9, 12.2]);
    f.turn = kf(t, [[0, 0.6], [2.05, 0.6], [2.4, 0.2], [K.serious, 0.2], [K.serious + 0.3, 0.45], [4.6, 0.45], [4.9, 0.15], [K.inside, 0.15], [K.inside + 0.4, 0.4]]);
    f.look = kf(t, [[0, [0.9, 0]], [2.05, [0.9, 0]], [2.4, [0, 0]], [K.serious, [0, 0]], [K.serious + 0.3, [0.95, -0.2]], [4.6, [0.95, -0.2]], [4.9, [0.4, -0.95]], [K.inside, [0.4, -0.95]], [K.inside + 0.4, [0.95, -0.1]],
      [K.stomach, [0.95, -0.1]], [K.stomach + 0.3, [0.9, 0.6]], [K.now, [0.9, 0.2]], [K.gurgle, [0.9, 0.2]], [K.gurgle + 0.1, [0.95, 0.8]], [K.GROWL - 0.4, [0.9, 0.6]], [K.GROWL, [0.9, 0.6]], [K.GROWL + 0.15, [0.9, 0.3]]]);
    f.brow = kf(t, [[K.inside, 0], [K.inside + 0.4, 0.5], [K.please + 0.5, 0.7], [K.now, 0.4], [K.GROWL, 0.4], [K.GROWL + 0.12, 1.1, 'out']]);
    f.browTilt = kf(t, [[K.inside, 0], [K.inside + 0.4, -0.2], [K.GROWL, -0.2], [K.GROWL + 0.12, 0.3]]);
    if (t > K.please + 0.3 && t < K.now) { f.squint = 0.25; f.mouth = 'smile'; }
    if (t > K.suddenly && t < K.GROWL) { f.mouth = 'flat'; f.eye = 1.08; }

    // --- surprise after the growl
    if (t >= K.GROWL) {
      f.mouth = 'o'; f.open = 0.5; f.eye = kf(t, [[K.GROWL, 1.1], [K.GROWL + 0.12, 1.45, 'outBack'], [15.4, 1.4], [15.7, 1.0]]); f.pupil = kf(t, [[K.GROWL, 0.8], [K.GROWL + 0.1, 0.45], [15.4, 0.5], [15.7, 1]]);
      p.sqY = kf(t, [[K.GROWL, 1], [K.GROWL + 0.08, 1.06, 'out'], [K.GROWL + 0.22, 0.97], [K.GROWL + 0.35, 1]]); p.sqX = 2 - p.sqY;
    }
    // --- comic pause: trying SO hard not to laugh (hand over mouth, trembling)
    const mouthW = CH.mouthPos(Object.assign({}, p, { face: f }));
    if (t >= 15.45 && t < K.bursts) {
      const k = prog(t, 15.45, 15.75, 'out');
      p.armL = CH.armIK(p, -1, lerp(p.x - 60, mouthW[0] - 6, k), lerp(hipY(SAN.sc) - 10, mouthW[1] + 30, k), 1);
      p.handL = 'open'; p.handRotL = 180; p.thumbL = 1;
      f.mouth = 'tight'; f.squint = 0.55; f.brow = 0.3; f.browTilt = 0.6; f.look = [0.6, 0.1];
      const tr = prog(t, 15.8, K.bursts, 'linear');
      p.x += Math.sin(t * 55) * (1 + 3 * tr); p.headTilt += Math.sin(t * 40) * 1.5 * tr; f.eye = 1 - 0.1 * tr;
      if (t > 16.2) f.sleep = false;
    }
    // --- bursts out laughing
    const laughing = (t >= K.bursts && t < K.blorp) || t >= K.again;
    if (laughing) {
      const t0 = t >= K.again ? K.again : K.bursts;
      const ha = Math.abs(Math.sin((t - t0) * Math.PI * 4.2));
      f.happy = true; f.mouth = 'open'; f.open = 0.65 + 0.35 * ha; f.brow = 0.5; f.browTilt = 0.5;
      const kk = prog(t, t0, t0 + 0.15, 'out');
      p.headTilt += -12 * kk + Math.sin((t - t0) * 26) * 3;
      p.lean = kf(t, [[t0, 0], [t0 + 0.15, -6, 'outBack']]) + Math.sin((t - t0) * 13) * 3;
      p.y -= ha * 10;
      p.sqY = 1 + 0.03 * ha; p.sqX = 1 - 0.02 * ha;
      // hold the belly
      const belly = [p.x, hipY(SAN.sc) - 60];
      p.armL = CH.armIK(p, -1, belly[0] - 12, belly[1] + 6 * ha, 1); p.armR = CH.armIK(p, 1, belly[0] + 12, belly[1] + 6 * ha, -1);
      p.handL = 'fist'; p.handR = 'fist';
    }
    // --- the tiny blorp: freeze mid-laugh, eyes snap open
    if (t >= K.blorp && t < K.again) {
      const belly = [p.x, hipY(SAN.sc) - 60];
      p.armL = CH.armIK(p, -1, belly[0] - 12, belly[1], 1); p.armR = CH.armIK(p, 1, belly[0] + 12, belly[1], -1);
      p.handL = 'fist'; p.handR = 'fist';
      p.headTilt = -6; p.lean = -3;
      f.happy = false; f.mouth = 'open'; f.open = 0.75; f.eye = kf(t, [[K.blorp, 1], [K.blorp + 0.1, 1.3, 'outBack']]); f.pupil = 0.55;
      f.look = kf(t, [[K.blorp, [0, 0]], [K.blorp + 0.15, [0.95, 0.4]]]); f.turn = 0.4; f.brow = 1;
    }
    p.face = f;
    return p;
  }

  function manPose(t) {
    const p = { kind: 'man', x: MAN.x, y: hipY(MAN.sc), sc: MAN.sc };
    p.armL = [-6, 2]; p.handL = 'fist';
    p.armR = [8, -4]; p.handR = 'fist'; p.itemR = 'briefcase';
    p.legL = [-7, 2]; p.legR = [7, -2];
    p.lean = 0; p.headTilt = 0;
    const f = { turn: 0, look: [0, 0.05], mouth: 'flat', brow: -0.1, browTilt: -0.3, eye: 0.95, pupil: 0.9 };
    f.blink = blink(t, [3.6, 6.9, 9.95, 17.1]);
    // outwardly calm while thinking; tiny tells
    if (t > K.stomach && t < K.stomach + 0.5) f.look = [0, 0.7];
    f.sweat = prog(t, K.growl, K.growl + 0.35, 'outBack') * (1 - prog(t, K.nowEnd + 0.3, K.nowEnd + 0.6));
    // small gurgle: eyes dart
    if (t > K.gurgle && t < K.gurgle + 0.7) { f.eye = 1.08; f.look = [Math.sin((t - K.gurgle) * 18) * 0.6, 0.1]; }
    if (t > K.suddenly + 0.4 && t < K.GROWL) f.sweat = Math.max(f.sweat, prog(t, K.gurgle, K.gurgle + 0.3, 'outBack'));
    // BIG growl: belly wobble, eyes pop
    if (t >= K.GROWL) {
      const g = 1 - prog(t, K.GROWL, K.GROWL + 1.0, 'linear');
      p.sqX = 1 + 0.045 * Math.sin((t - K.GROWL) * 45) * g; p.sqY = 1 - 0.03 * Math.sin((t - K.GROWL) * 45) * g;
      f.eye = kf(t, [[K.GROWL, 0.95], [K.GROWL + 0.12, 1.3, 'outBack'], [K.the + 0.3, 1.2], [K.the + 0.7, 0.95]]);
      f.pupil = kf(t, [[K.GROWL, 0.9], [K.GROWL + 0.1, 0.5], [K.the + 0.4, 0.8]]);
      f.brow = kf(t, [[K.GROWL, -0.1], [K.GROWL + 0.12, 0.8], [K.the + 0.4, 0.5]]);
      f.browTilt = kf(t, [[K.GROWL, -0.3], [K.GROWL + 0.12, 0.2], [K.the + 0.4, 0.6]]);
      f.sweat = 1;
    }
    // turns red, looks away awkwardly
    if (t >= K.the) {
      f.red = prog(t, K.the + 0.3, K.red + 0.1, 'inOut');
      f.blush = f.red;
      f.mouth = 'nervous';
      f.turn = kf(t, [[K.the + 0.4, 0], [K.the + 0.8, 0.38]]);
      f.look = kf(t, [[K.the + 0.4, [0, 0.05]], [K.the + 0.8, [1, -0.35]]]);
      p.headTilt = kf(t, [[K.the + 0.4, 0], [K.the + 0.8, 6]]);
      // the closing beat: slides his eyes to the camera, deadpan and red
      if (t > K.blorp) {
        f.turn = kf(t, [[K.blorp + 0.1, 0.38], [K.blorp + 0.4, 0.05]]);
        f.look = kf(t, [[K.blorp + 0.1, [1, -0.35]], [K.blorp + 0.4, [0, 0.05]]]);
        f.mouth = 'flat'; f.eye = 0.85; f.lid = 0.35; p.headTilt = kf(t, [[K.blorp + 0.1, 6], [K.blorp + 0.4, 0]]);
        f.browTilt = -0.2;
      }
    }
    p.face = f;
    return p;
  }

  // ---------------- FX ----------------
  function telepathy(t, head) {
    const a = K.inside, b = K.nowEnd + 0.4;
    if (t < a || t > b + 0.5) return '';
    const g = prog(t, a, a + 0.4) * (1 - prog(t, b, b + 0.5));
    let o = `<circle cx="${f1(head[0])}" cy="${f1(head[1])}" r="${f1(115 + 8 * Math.sin(t * 8))}" fill="#7fe8ff" opacity="${f1(0.35 * g)}" filter="url(#fBlurE20)"/>`;
    for (let i = 0; i < 3; i++) {
      const k = ((t - a) * 1.1 + i / 3) % 1;
      o += `<circle cx="${f1(head[0])}" cy="${f1(head[1])}" r="${f1(100 + k * 90)}" fill="none" stroke="#bff3ff" stroke-width="${f1(6 * (1 - k))}" opacity="${f1((1 - k) * 0.8 * g)}"/>`;
    }
    return o;
  }

  const BLOBS = [[-190, 10, 105], [-105, -85, 115], [20, -112, 125], [145, -75, 110], [205, 30, 95], [125, 115, 105], [0, 132, 115], [-125, 112, 100], [0, 10, 200]];
  function thought(t, head) {
    const a = K.please - 0.3, z = K.nowEnd + 0.15;
    if (t < a || t > z + 0.4) return '';
    const cx = 600, cy = 560;
    let o = '';
    [0.2, 0.42, 0.66].forEach((k, i) => {
      const s = prog(t, a + i * 0.08, a + i * 0.08 + 0.22, 'outBack') * (1 - prog(t, z, z + 0.2, 'in'));
      const fx = head[0] - 30, fy = head[1] - 120, tx = cx + 90, ty = cy + 200;
      if (s > 0.01) o += `<circle cx="${f1(lerp(fx, tx, k))}" cy="${f1(lerp(fy, ty, k))}" r="${f1((14 + i * 8) * s)}" fill="#fff" stroke="#1b1b1b" stroke-width="6"/>`;
    });
    const pop = prog(t, a + 0.2, a + 0.65, 'outBack') * (1 - prog(t, z, z + 0.25, 'in'));
    if (pop < 0.01) return o;
    o += `<g transform="translate(${cx} ${f1(cy + Math.sin(t * 2.2) * 6)}) scale(${f1(pop)})">`;
    o += `<g fill="#1b1b1b">${BLOBS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 6}"/>`).join('')}</g><g fill="#fffdf7">${BLOBS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
    // the nervous stomach (trembles harder on "growl")
    const tr = 1 + 3 * prog(t, K.growl - 0.1, K.growl + 0.2);
    o += `<g transform="translate(${f1(-80 + Math.sin(t * 40) * 2 * tr)} ${f1(20 + Math.cos(t * 37) * 1.5 * tr)}) rotate(-12)">`;
    o += `<path d="M-70 -60C-40 -110 40 -100 60 -50C80 0 60 40 70 70C80 110 20 120 0 90C-20 60 -60 80 -86 50C-110 20 -96 -20 -70 -60Z" fill="#ff9fb3" stroke="#7a1f35" stroke-width="7" stroke-linejoin="round"/>`;
    o += `<path d="M-60 -70q-20 10-30 40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>`;
    o += `<path d="M30 -96q10-30 30-36" fill="none" stroke="#7a1f35" stroke-width="12" stroke-linecap="round"/>`;
    // its worried little face
    o += `<ellipse cx="-36" cy="-14" rx="11" ry="14" fill="#fff" stroke="#3a0d1a" stroke-width="3"/><ellipse cx="6" cy="-18" rx="11" ry="14" fill="#fff" stroke="#3a0d1a" stroke-width="3"/>`;
    o += `<circle cx="-34" cy="-10" r="5" fill="#1b1b1b"/><circle cx="8" cy="-14" r="5" fill="#1b1b1b"/>`;
    o += `<path d="M-48 -36l18 6M-6 -38l-16 6" stroke="#3a0d1a" stroke-width="4" stroke-linecap="round"/>`;
    o += `<path d="M-40 26q6-8 12 0t12 0t12 0" fill="none" stroke="#3a0d1a" stroke-width="4" stroke-linecap="round"/>`;
    o += `<path d="M44 -40c6 10 10 16 10 22a10 10 0 0 1-20 0c0-6 4-12 10-22Z" fill="#8fd3ff" stroke="#1b1b1b" stroke-width="3"/>`;
    o += `</g>`;
    // "no growling" sign
    o += `<g transform="translate(120 -10)"><circle r="78" fill="#fff" stroke="#e2384f" stroke-width="14"/>`;
    o += `<text x="0" y="14" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="44" fill="#3a3f4a">GRRR</text>`;
    o += `<path d="M-55 -55L55 55" stroke="#e2384f" stroke-width="14" stroke-linecap="round"/></g>`;
    // praying hands emoji-ish
    o += `<g transform="translate(110 115) scale(${f1(0.9 + 0.08 * Math.sin(t * 6))})"><path d="M-6 30L-6 -26Q-6 -40 -18 -30L-30 10Q-34 24 -22 34Z M6 30L6 -26Q6 -40 18 -30L30 10Q34 24 22 34Z" fill="#141414" stroke="#8f8f8f" stroke-width="4" stroke-linejoin="round"/></g>`;
    o += '</g>';
    return o;
  }

  function growlText(t, belly, cam) {
    let o = '';
    const pop = (start, dur, x, y, txt, size, rot, color) => {
      if (t < start || t > start + dur) return '';
      const k = prog(t, start, start + 0.18, 'outBack'), out = 1 - prog(t, start + dur - 0.2, start + dur, 'in');
      const letters = [...txt].map((ch, i) => `<tspan dy="${f1(Math.sin(t * 30 + i) * 6)}">${ch}</tspan>`).join('');
      return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${f1(k * out)})"><text text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${size}" fill="${color}" stroke="#141414" stroke-width="12" paint-order="stroke">${letters}</text></g>`;
    };
    // wavy rumble lines around the belly
    const g = (t > K.GROWL && t < K.GROWL + 1.0) ? 1 - prog(t, K.GROWL + 0.6, K.GROWL + 1.0, 'linear') : (t > K.gurgle && t < K.gurgle + 0.4) ? 0.5 : (t > K.blorp && t < K.blorp + 0.35) ? 0.4 : 0;
    if (g > 0) {
      for (let i = 0; i < 3; i++) {
        const r = 90 + i * 34 + ((t * 300) % 34);
        for (const s of [-1, 1]) o += `<path d="M${f1(belly[0] + s * r)} ${f1(belly[1] - 50)}q${f1(s * 14)} 25 0 50t0 50" fill="none" stroke="#ffd84a" stroke-width="8" stroke-linecap="round" opacity="${f1(g * (1 - i * 0.25))}"/>`;
      }
    }
    o += pop(K.gurgle, 0.75, belly[0] + 150, belly[1] - 40, 'grr…', 54, -8, '#ffb34d');
    o += pop(K.GROWL, 1.25, belly[0] - 10, belly[1] - 135, 'GRRRROOOWL!', 64, -6, '#ffd84a');
    o += pop(K.blorp, 0.7, belly[0] + 120, belly[1] - 30, 'blorp', 48, 10, '#ffb34d');
    return o;
  }

  function steam(t, head) {
    if (t < K.red - 0.3) return '';
    const fade = 1 - prog(t, 18.0, 18.4, 'linear');
    let o = '';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const k = ((t - K.red) * 1.3 + i / 3) % 1;
      const x = head[0] + s * (95 + k * 40), y = head[1] - 20 - k * 130;
      o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(12 + k * 26)}" fill="#fff" opacity="${f1(Math.sin(k * Math.PI) * 0.75 * fade)}"/>`;
    }
    return o;
  }

  function tears(t, head, active, t0) {
    if (!active) return '';
    let o = '';
    for (let i = 0; i < 8; i++) {
      const k = ((t - t0) * 1.6 + i / 8) % 1;
      const s = i % 2 ? 1 : -1;
      const x = head[0] + s * (50 + k * 120), y = head[1] - 10 - Math.sin(k * Math.PI) * 60 + k * 90;
      o += `<path d="M${f1(x)} ${f1(y - 12)}c5 8 8 12 8 16a8 8 0 0 1-16 0c0-4 3-8 8-16Z" fill="#8fd3ff" stroke="#1b1b1b" stroke-width="2.5" opacity="${f1(1 - k)}"/>`;
    }
    return o;
  }

  function haha(t, head) {
    let o = '';
    const spots = [[-230, -150, -14], [230, -170, 12], [-260, 30, -8], [250, 20, 10], [-190, -300, -6], [200, -320, 8]];
    const win = (a, b) => t >= a && t < b;
    if (!(win(K.bursts, K.blorp) || win(K.again, T.duration))) return '';
    const t0 = t >= K.again ? K.again : K.bursts;
    spots.forEach(([dx, dy, r], i) => {
      const s = t0 + i * 0.22;
      if (t < s) return;
      const k = prog(t, s, s + 0.2, 'outBack');
      const wig = Math.sin(t * 20 + i) * 4;
      o += `<g transform="translate(${f1(head[0] + dx)} ${f1(head[1] + dy + wig)}) rotate(${r}) scale(${f1(k)})"><text text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${i < 2 ? 84 : 64}" fill="#ffd84a" stroke="#141414" stroke-width="11" paint-order="stroke">HA${i % 3 === 0 ? ' HA' : ''}!</text></g>`;
    });
    return o;
  }

  // ---------------- camera ----------------
  function camera(t) {
    const c = kf(t, [
      [0, [560, 1190, 0.84]],
      [2.4, [520, 1180, 0.92], 'sine'],
      [2.96, [520, 1180, 0.93], 'sine'],
      [2.97, [545, 1235, 1.12], 'step'],
      [3.4, [560, 1220, 1.15], 'sine'],
      [4.3, [700, 1130, 1.45]],
      [5.2, [700, 1120, 1.48], 'sine'],
      [6.2, [560, 1150, 1.22]],
      [7.5, [610, 960, 1.05]],
      [10.3, [615, 950, 1.1], 'sine'],
      [10.8, [545, 1200, 1.15]],
      [11.05, [545, 1200, 1.16], 'sine'],
      [11.35, [700, 1110, 1.7], 'out'],
      [12.2, [700, 1110, 1.72], 'sine'],
      [12.9, [700, 1290, 1.55]],
      [K.GROWL, [700, 1290, 1.58], 'sine'],
      [K.GROWL + 0.18, [700, 1290, 1.85], 'outBack'],
      [14.3, [700, 1260, 1.8], 'sine'],
      [14.75, [700, 1105, 1.62]],
      [15.4, [700, 1100, 1.66], 'sine'],
      [15.65, [395, 1170, 1.62], 'inOut'],
      [K.bursts, [392, 1165, 1.7], 'sine'],
      [K.bursts + 0.4, [500, 1190, 1.36], 'outBack'],
      [K.blorp, [505, 1180, 1.42], 'sine'],
      [K.blorp + 0.25, [545, 1175, 1.3], 'out'],
      [K.again, [545, 1175, 1.32], 'sine'],
      [K.again + 0.3, [470, 1170, 1.5], 'outBack'],
      [T.duration, [465, 1165, 1.55], 'sine'],
    ]);
    let shake = 0;
    if (t > K.GROWL) shake += 18 * Math.exp(-(t - K.GROWL) * 3.5);
    if (t > K.gurgle && t < K.gurgle + 0.5) shake += 4 * (1 - (t - K.gurgle) / 0.5);
    if (t > K.bursts) shake += 5 * Math.exp(-(t - K.bursts) * 4);
    const rot = kf(t, [[15.4, 0], [15.52, -2], [15.65, 0]]) + (t > K.GROWL ? Math.sin(t * 33) * 1.2 * Math.exp(-(t - K.GROWL) * 3.5) : 0);
    return { cx: c[0] + Math.sin(t * 61) * shake, cy: c[1] + Math.cos(t * 47) * shake, z: c[2], rot };
  }

  // ---------------- subtitles ----------------
  const subs = SUBS.makeSubs(T, [
    { w: [0, 6], text: { 2: 'Sanya' } },
    { w: [7, 14] },
    { w: [15, 20] },
    { w: [21, 24], cls: 'thought', text: { 21: '“Please,' } },
    { w: [25, 29], cls: 'thought', text: { 29: 'now!”' } },
    { w: [30, 34] },
    { w: [35, 38] },
    { w: [39, 43], cls: 'sanya', text: { 40: 'Sanya', 43: 'laughing!' }, until: K.blorp - 0.05 },
  ]);

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  const subsEl = document.getElementById('subs');

  window.renderFrame = function (t) {
    const cam = camera(t);
    const sp = sanyaPose(t), mp = manPose(t);
    const sHead = CH.headPos(sp), mHead = CH.headPos(mp);
    const belly = [MAN.x, hipY(MAN.sc) - 70];
    const inLobby = t < K.man;
    const sanyaInside = sp.x > 300;

    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, defs());
    o.push(`<g transform="translate(540 960) rotate(${f1(cam.rot)}) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(interior(), floorDisplay(t));
    o.push(`<rect x="-900" y="-700" width="2900" height="1300" fill="url(#gCeilGlow)"/>`);
    // shadows
    o.push(`<ellipse cx="${MAN.x}" cy="${FEET + 22}" rx="110" ry="16" fill="#000" opacity=".25" filter="url(#fBlurE)"/>`);
    if (sanyaInside) o.push(`<ellipse cx="${f1(sp.x)}" cy="${FEET + 22}" rx="95" ry="14" fill="#000" opacity=".25" filter="url(#fBlurE)"/>`);
    o.push(telepathy(t, sHead));
    o.push(CH.figure(mp));
    if (!inLobby || sanyaInside) o.push(CH.figure(sp));
    if (inLobby) {
      o.push(doors(1 - prog(t, 2.45, 2.92, 'inOut')));
      o.push(lobbyWall(t));
      if (!sanyaInside) o.push(CH.figure(sp));
    }
    o.push(steam(t, mHead));
    const laughing = (t >= K.bursts && t < K.blorp) || t >= K.again;
    o.push(tears(t, sHead, laughing, t >= K.again ? K.again : K.bursts));
    o.push(thought(t, mHead));
    o.push(growlText(t, belly, cam));
    o.push(haha(t, sHead));
    o.push('</g>');
    // light flicker on the big growl
    const fl = t > K.GROWL && t < K.GROWL + 0.5 ? (Math.sin(t * 90) > 0.3 ? 0.18 : 0) : 0;
    if (fl) o.push(`<rect width="1080" height="1920" fill="#000" opacity="${fl}"/>`);
    o.push(`<defs><radialGradient id="gVigE" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a1410" stop-opacity=".35"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigE)"/>`);
    // iris-out ending on Sanya laughing
    if (t > K.iris) {
      const hs = [540 + (sHead[0] - cam.cx) * cam.z, 960 + (sHead[1] - cam.cy) * cam.z];
      const r = lerp(1300, 0, prog(t, K.iris, K.iris + 0.6, 'in'));
      o.push(`<path d="M-50 -50H1130V1970H-50Z M${f1(hs[0] - r)} ${f1(hs[1])}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z" fill="#000" fill-rule="evenodd"/>`);
    }
    svg.innerHTML = o.join('');
    subsEl.innerHTML = subs(t);
  };
})();
