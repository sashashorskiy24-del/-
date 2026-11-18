// "Alex at the Doctor" — one ~28 s short.
// Audio: two TTS takes (assets/audio/doctor_vo_alex.mp3, doctor_vo_doctor.mp3) assembled by
// tools/assemble_dialogue.py from dialogue.json; script in script.md.
(function () {
  const { prog, blink, wob, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;
  const R = CH.R;

  const ALEX_LINES = T.lines.filter(l => l.who === 'alex').map(l => [l.s, l.e]);
  const DOC_LINES = T.lines.filter(l => l.who === 'doctor').map(l => [l.s, l.e]);
  const K = {
    hello: at(0),
    sip1: 2.78,                       // first sip -> spoon in the eye
    tea: at(12), eye: at(14),
    sip2: 5.86,                       // second sip -> again
    spoon: at(21), cup: at(25),
    pull: 8.95,                       // Alex pulls the spoon out
    doctor: at(26), genius: at(29),
    anything: at(30), dropBack: 11.95, // puts the spoon back in the mug, without thinking
    yes: at(32), poke1: at(35) + 0.05, hurts: at(38), poke2: at(40), poke3: at(42),
    sigh: at(43), finger: at(45), broken: at(47),
    oh: at(48), how: at(49),
    two: at(55), dollars: at(57),
    can: at(58), payTea: at(62),
    facepalm: 25.75, sip3: 26.55,     // final sip -> spoon in the eye again
  };

  // ---------------- looks ----------------
  const ALEX_LOOK = { smooth: true, roundHands: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.18, handSc: 1.05 };
  const DOC_LOOK = { kind: 'doctor', outfit: 'doctor', sleeve: '#f7f7f3', sleeveRim: '#2a2f33', smooth: true, roundHands: true, armW: 38, legW: 50, shX: 1.25, hipX: 1.3, shoeSc: 1.2, headSc: 1.1, eyeSc: 1.12, handSc: 1.0 };
  const SC = 1.0;
  const ALEX_SEAT = { x: 300, hip: 1296 };
  const DOC_SEAT = { x: 810, hip: 1290 };
  const DESK_TOP = 1305, FLOOR = 1640, COUCH_TOP = ALEX_SEAT.hip + 12;

  // ---------------- clinic set ----------------
  let SET = null;
  function clinic() {
    if (SET) return SET;
    const o = [];
    o.push(`<defs>
      <linearGradient id="gCW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6e6df"/><stop offset=".7" stop-color="#c4d9d0"/><stop offset="1" stop-color="#b2cabf"/></linearGradient>
      <linearGradient id="gCF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9cfd2"/><stop offset="1" stop-color="#9ea7ad"/></linearGradient>
      <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6cbe6"/><stop offset="1" stop-color="#e5f0f5"/></linearGradient>
      <linearGradient id="gDeskC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ecee"/><stop offset="1" stop-color="#c7ccd0"/></linearGradient>
      <linearGradient id="gPad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7f86"/><stop offset="1" stop-color="#2a5c62"/></linearGradient>
      <linearGradient id="gBeamC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8" stop-opacity=".35"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0"/></linearGradient>
      <radialGradient id="gLampC"><stop offset="0" stop-color="#fffaf0" stop-opacity=".55"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>
      <linearGradient id="gAOc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <pattern id="pWallC" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="5" cy="7" r="1.1" fill="#000" opacity=".04"/><circle cx="15" cy="16" r="1" fill="#fff" opacity=".07"/></pattern>
      <filter id="fSoftC"><feGaussianBlur stdDeviation="12"/></filter>
      <filter id="fGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>`);
    o.push(`<rect x="-700" y="-700" width="2500" height="${FLOOR + 700}" fill="url(#gCW)"/><rect x="-700" y="-700" width="2500" height="${FLOOR + 700}" fill="url(#pWallC)"/>`);
    o.push(`<rect x="-700" y="-700" width="2500" height="900" fill="url(#gAOc)"/>`);
    // tiled lower wall (wainscot) + chair rail
    o.push(`<rect x="-700" y="1150" width="2500" height="${FLOOR - 1150}" fill="#e6eeea"/>`);
    for (let x = -700; x < 1800; x += 60) o.push(`<rect x="${x}" y="1150" width="2" height="${FLOOR - 1150}" fill="#b9c9c2"/>`);
    for (let y = 1150; y < FLOOR; y += 60) o.push(`<rect x="-700" y="${y}" width="2500" height="2" fill="#b9c9c2"/>`);
    o.push(`<rect x="-700" y="1138" width="2500" height="16" fill="#9fbab0"/>`);
    // window (right) with a sunny sky and a tree
    o.push(`<rect x="610" y="330" width="460" height="560" rx="6" fill="#f4f6f5" stroke="#9aa7a2" stroke-width="6"/><rect x="630" y="350" width="420" height="520" fill="url(#gSky)"/>`);
    o.push(`<circle cx="980" cy="430" r="44" fill="#fff6c9" opacity=".9"/><path d="M630 800q80-60 160-20t160-10t100 10V870H630Z" fill="#9cc49a"/><path d="M720 870v-150" stroke="#6b4b34" stroke-width="18"/><circle cx="720" cy="690" r="70" fill="#5f9a5e"/><circle cx="670" cy="720" r="46" fill="#6aa868"/><circle cx="770" cy="720" r="50" fill="#6aa868"/>`);
    o.push(`<path d="M840 350V870M630 610H1050" stroke="#f4f6f5" stroke-width="12"/><rect x="596" y="880" width="488" height="22" rx="4" fill="#f4f6f5" stroke="#9aa7a2" stroke-width="4"/>`);
    o.push(`<path d="M630 902L1050 902L1200 1640L480 1640Z" fill="url(#gBeamC)" opacity=".55"/>`);
    // eye chart (between them — keep your eyes on it)
    o.push(`<g transform="translate(440 560)"><rect x="-110" y="-190" width="220" height="330" rx="6" fill="#fdfdfb" stroke="#7d8a86" stroke-width="6"/>` +
      `<text x="0" y="-92" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="92" fill="#1b1b1b">E</text>` +
      `<text x="0" y="-26" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="44" fill="#1b1b1b" letter-spacing="10">F P</text>` +
      `<text x="0" y="24" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="32" fill="#1b1b1b" letter-spacing="8">T O Z</text>` +
      `<text x="0" y="64" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="22" fill="#1b1b1b" letter-spacing="7">L P E D</text>` +
      `<text x="0" y="96" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="15" fill="#1b1b1b" letter-spacing="6">P E C F D</text>` +
      `<rect x="-90" y="112" width="180" height="4" fill="#d24a4a"/></g>`);
    // anatomy poster (left) — a simple heart
    o.push(`<g transform="translate(150 520)"><rect x="-95" y="-130" width="190" height="250" rx="4" fill="#fbf7ee" stroke="#7d8a86" stroke-width="6"/>` +
      `<path d="${CH.heart(0, -10, 62)}" fill="#e05a5a" stroke="#7a1f1f" stroke-width="5"/><path d="M-10 -60c-4-30 10-44 26-50M10 -58c8-18 22-26 40-24" fill="none" stroke="#4b7fc0" stroke-width="10" stroke-linecap="round"/>` +
      `<rect x="-60" y="70" width="120" height="8" rx="4" fill="#9aa7a2"/><rect x="-44" y="88" width="88" height="8" rx="4" fill="#c4ccc9"/></g>`);
    // wall cabinet + hand sanitizer
    o.push(`<rect x="-260" y="700" width="230" height="250" rx="6" fill="#f1f3f2" stroke="#9aa7a2" stroke-width="6"/><path d="M-145 706V944" stroke="#9aa7a2" stroke-width="5"/><circle cx="-160" cy="830" r="7" fill="#9aa7a2"/><circle cx="-130" cy="830" r="7" fill="#9aa7a2"/>`);
    o.push(`<rect x="30" y="860" width="44" height="80" rx="8" fill="#f4f6f5" stroke="#7d8a86" stroke-width="5"/><rect x="40" y="900" width="24" height="26" rx="4" fill="#7fc8e8"/><path d="M52 940v20" stroke="#7d8a86" stroke-width="6"/>`);
    // skirting + linoleum floor
    o.push(`<rect x="-700" y="${FLOOR - 22}" width="2500" height="26" fill="#8aa89c"/>`);
    o.push(`<rect x="-700" y="${FLOOR}" width="2500" height="900" fill="url(#gCF)"/>`);
    let y = FLOOR, gap = 30, row = 0;
    while (y < 2600) {
      o.push(`<rect x="-700" y="${y}" width="2500" height="3" fill="#7f898f" opacity=".45"/>`);
      for (let x = -700 + (row % 2) * 90; x < 1800; x += 180) o.push(`<rect x="${x}" y="${y}" width="90" height="${f1(gap)}" fill="#fff" opacity=".12"/>`);
      y += gap; gap *= 1.16; row++;
    }
    o.push(`<rect x="-700" y="${FLOOR + 4}" width="2500" height="40" fill="url(#gAOc)"/>`);
    // ceiling light + soft vignette edges
    o.push(`<circle cx="560" cy="260" r="480" fill="url(#gLampC)"/>`);
    o.push(`<rect x="-700" y="-700" width="500" height="3000" fill="#000" opacity=".08" filter="url(#fSoftC)"/><rect x="1300" y="-700" width="500" height="3000" fill="#000" opacity=".08" filter="url(#fSoftC)"/>`);
    SET = o.join('');
    return SET;
  }

  // exam couch with a paper sheet (Alex sits on it, feet dangling)
  function couch() {
    const x0 = 60, x1 = 540, top = COUCH_TOP;
    return `<ellipse cx="${(x0 + x1) / 2}" cy="${FLOOR + 14}" rx="270" ry="22" fill="#000" opacity=".2" filter="url(#fSoftC)"/>` +
      `<rect x="${x0 + 30}" y="${top + 50}" width="${x1 - x0 - 60}" height="${FLOOR - top - 50}" fill="#e9ecee" stroke="#7d8a86" stroke-width="6"/>` +
      `<rect x="${x0 + 60}" y="${top + 90}" width="${(x1 - x0 - 140) / 2}" height="${FLOOR - top - 130}" rx="6" fill="none" stroke="#b5bec2" stroke-width="5"/>` +
      `<rect x="${(x0 + x1) / 2 + 10}" y="${top + 90}" width="${(x1 - x0 - 140) / 2}" height="${FLOOR - top - 130}" rx="6" fill="none" stroke="#b5bec2" stroke-width="5"/>` +
      `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="56" rx="18" fill="url(#gPad)" stroke="#1d3a3e" stroke-width="7"/>` +
      // headrest bump on the left + paper sheet
      `<path d="M${x0} ${top + 10}Q${x0 - 6} ${top - 40} ${x0 + 70} ${top - 36}L${x0 + 110} ${top}Z" fill="url(#gPad)" stroke="#1d3a3e" stroke-width="7" stroke-linejoin="round"/>` +
      `<rect x="${x0 + 110}" y="${top - 4}" width="${x1 - x0 - 150}" height="20" fill="#fbfbf7" stroke="#cfd3cf" stroke-width="3"/>` +
      `<path d="M${x0 + 140} ${top + 16}v10M${x0 + 220} ${top + 16}v8M${x0 + 300} ${top + 16}v10" stroke="#e2e4df" stroke-width="3"/>`;
  }

  function desk() {
    const x0 = 520, x1 = 1140;
    return `<rect x="${x0}" y="${DESK_TOP}" width="${x1 - x0}" height="${FLOOR - DESK_TOP + 10}" fill="url(#gDeskC)" stroke="#7d8a86" stroke-width="6"/>` +
      `<rect x="${x0 - 18}" y="${DESK_TOP - 18}" width="${x1 - x0 + 36}" height="30" rx="6" fill="#f4f6f5" stroke="#7d8a86" stroke-width="6"/>` +
      `<rect x="${x0 + 40}" y="${DESK_TOP + 60}" width="230" height="${FLOOR - DESK_TOP - 120}" rx="8" fill="none" stroke="#b5bec2" stroke-width="5"/><rect x="${x0 + 135}" y="${DESK_TOP + 90}" width="40" height="10" rx="5" fill="#9aa7a2"/>` +
      // monitor, pill jar, clipboard
      `<g transform="translate(1040 ${DESK_TOP - 18})"><rect x="-12" y="-30" width="24" height="30" fill="#5b6168"/><rect x="-50" y="-8" width="100" height="10" rx="4" fill="#5b6168"/><rect x="-80" y="-150" width="160" height="122" rx="10" fill="#2b3036" stroke="#15181b" stroke-width="5"/><rect x="-70" y="-140" width="140" height="100" rx="4" fill="#8fd0d8"/><path d="M-60 -90h24l8-20 10 40 10-30 6 10h62" fill="none" stroke="#1f5c58" stroke-width="5" stroke-linejoin="round"/></g>` +
      `<g transform="translate(600 ${DESK_TOP - 18})"><rect x="-22" y="-56" width="44" height="56" rx="6" fill="#f0a44a" stroke="#6b4210" stroke-width="4" opacity=".95"/><rect x="-24" y="-68" width="48" height="16" rx="4" fill="#fbfbf7" stroke="#6b4210" stroke-width="4"/></g>` +
      `<g transform="translate(760 ${DESK_TOP - 22}) rotate(-6)"><rect x="-70" y="-10" width="140" height="20" rx="3" fill="#a77b4f" stroke="#5a3e22" stroke-width="4"/><rect x="-62" y="-14" width="124" height="14" fill="#fbfbf7"/></g>` +
      `<ellipse cx="830" cy="${DESK_TOP + 18}" rx="320" ry="16" fill="#000" opacity=".18" filter="url(#fSoftC)"/>`;
  }

  // ---------------- props ----------------
  const rot = (x, y, a) => { const r = a * Math.PI / 180; return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]; };
  // mug held by its handle: wrist at (wx, wy); mug body sits to the LEFT of the hand (toward Alex's face).
  const MUG_OFF = [-44, 12];
  function mugGeom(wx, wy, tilt) {
    const c = rot(MUG_OFF[0], MUG_OFF[1], tilt), top = rot(MUG_OFF[0], MUG_OFF[1] - 26, tilt), base = rot(MUG_OFF[0] + 6, MUG_OFF[1] - 6, tilt);
    return { c: [wx + c[0], wy + c[1]], top: [wx + top[0], wy + top[1]], base: [wx + base[0], wy + base[1]] };
  }
  function mug(wx, wy, tilt) {
    return `<g transform="translate(${f1(wx)} ${f1(wy)}) rotate(${f1(tilt)}) translate(${MUG_OFF[0]} ${MUG_OFF[1]})">` +
      `<path d="M24 -14q24 0 24 16t-24 16" fill="none" stroke="#2a2a2a" stroke-width="14"/><path d="M24 -14q24 0 24 16t-24 16" fill="none" stroke="#e8f4f2" stroke-width="7"/>` +
      `<path d="M-28 -28h56l-5 54a10 10 0 0 1-10 9h-26a10 10 0 0 1-10-9Z" fill="#e8f4f2" stroke="#2a2a2a" stroke-width="5" stroke-linejoin="round"/>` +
      `<ellipse cx="0" cy="-27" rx="26" ry="6" fill="#b5713c" stroke="#2a2a2a" stroke-width="4"/>` +
      `<path d="${CH.heart(0, 4, 13)}" fill="#e05a5a"/></g>`;
  }
  // spoon: handle from `a` to `b` (b = handle end); bowl at `a` if `bowl`
  function spoon(a, b, bowl) {
    let s = `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="#2a2a2a" stroke-width="13" stroke-linecap="round"/>` +
      `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="#d9dee3" stroke-width="6" stroke-linecap="round"/>`;
    if (bowl) {
      const ang = Math.atan2(a[1] - b[1], a[0] - b[0]) * 180 / Math.PI + 90;
      s += `<ellipse cx="${f1(a[0])}" cy="${f1(a[1])}" rx="15" ry="21" transform="rotate(${f1(ang)} ${f1(a[0])} ${f1(a[1])})" fill="#d9dee3" stroke="#2a2a2a" stroke-width="5"/>`;
    }
    return s;
  }
  // cartoon pain burst
  function ouch(x, y, k, s = 1) {
    if (k <= 0 || k >= 1) return '';
    const sc = E.outBack(Math.min(1, k * 3)) * (1 - prog(k, 0.7, 1)) * s;
    const pts = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 22 : 50; pts.push(`${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`); }
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(sc)}) rotate(${f1(k * 40)})"><path d="M${pts.join('L')}Z" fill="#ffd84a" stroke="#1b1b1b" stroke-width="6" stroke-linejoin="round"/><path d="M${pts.map(p => p.split(' ').map(v => f1(v * 0.5)).join(' ')).join('L')}Z" fill="#ff7a4a"/></g>`;
  }
  const eyePos = (pose, head) => {
    const hs = pose.headSc || 1, turn = (pose.face && pose.face.turn) || 0;
    return [head[0] + (turn + 0.39) * R * hs * pose.sc, head[1] - 0.2 * R * hs * pose.sc];
  };

  // sip envelope: 0 → mug at rest, 1 → mug at the mouth (spoon handle in the eye at the peak)
  function sipK(t, t0) {
    const up = prog(t, t0, t0 + 0.28, 'out'), down = prog(t, t0 + 0.42, t0 + 0.8, 'inOut');
    return up * (1 - down);
  }

  // ---------------- Alex ----------------
  function alexPose(t) {
    const p = Object.assign({ sc: SC, x: ALEX_SEAT.x, y: ALEX_SEAT.hip, legK: [0.32, 1] }, ALEX_LOOK);
    const f = { turn: 0.45, look: [0.85, -0.1], mouth: 'flat', open: 0, brow: 0.3, browTilt: 0, eye: 1.08, pupil: 1.1 };
    f.blink = blink(t, [1.6, 8.3, 12.6, 20.2, 23.0]);
    const sw = wob(t, 0.9, 3) * 10;                       // feet swinging off the high couch
    p.legL = [-30 + sw, 30 - sw * 0.5]; p.legR = [30 - sw, -30 + sw * 0.5];
    p.lean = wob(t, 0.4, 1) * 1.2; p.headTilt = wob(t, 0.5, 2) * 1.5;
    let wl = [p.x - 90, p.y - 30], wr = [p.x + 92, p.y - 52], hL = 'fist', rL = 0, absL = null;
    let tilt = 0;                 // mug tilt
    let spoonState = 'cup';       // 'cup' | 'hand' (left hand)
    const fx = [];                // effects drawn on top
    let glow = 0;                 // red glow on the broken fingertip

    // the head position is needed for the sips; compute it with the body pose first
    const head0 = CH.headPos(Object.assign({}, p));
    const mouth = CH.mouthPos(Object.assign({}, p, { face: f }));
    const eye = eyePos(p, head0);

    // three sips, each ending with the spoon handle in the eye
    let sip = 0, sipT = null;
    for (const s of [K.sip1, K.sip2, K.sip3]) { const k = sipK(t, s); if (k > sip) { sip = k; sipT = s; } }
    // after the first poke: right eye squeezed shut for a while
    let hurtEye = 0;
    for (const s of [K.sip1, K.sip2, K.sip3]) hurtEye = Math.max(hurtEye, prog(t, s + 0.26, s + 0.32) * (1 - prog(t, s + 1.6, s + 2.1)));
    if (sip > 0) {
      tilt = -32 * sip;
      const g0 = mugGeom(0, 0, tilt);
      const target = [mouth[0] + 16 - g0.top[0], mouth[1] + 6 - g0.top[1]];
      wr = [lerp(wr[0], target[0], sip), lerp(wr[1], target[1], sip)];
      f.look = [0.6, 0.5]; f.lid = 0.25 * sip;
    }
    if (hurtEye > 0) {
      f.twitchR = hurtEye; f.brow = lerp(f.brow, 0.75, hurtEye); f.browTilt = 0.6 * hurtEye; f.mouth = 'tight';
      p.headTilt -= 6 * hurtEye;
      if (sipT != null) fx.push(ouch(eye[0] + 20, eye[1] - 10, (t - sipT - 0.26) / 0.7, 0.9));
    }

    // "Every time I drink tea, my eye hurts." — lifts the mug, then points at his eye (with the mug hand)
    if (t >= K.tea - 0.15 && t < K.eye - 0.2) { wr = [p.x + 115, p.y - 150]; }
    if (t >= K.eye - 0.2 && t < 5.8) { const k = prog(t, K.eye - 0.2, K.eye + 0.1, 'outBack'); wr = [lerp(p.x + 115, eye[0] + 70, k), lerp(p.y - 150, eye[1] + 60, k)]; }

    // "Have you tried taking the spoon out of the cup?" — Alex looks down into his mug
    if (t >= K.spoon && t < K.pull) { f.look = [0.5, 0.9]; f.brow = 0.55; f.pupil = 0.9; wr = [p.x + 100, p.y - 90]; }
    // pulls the spoon out, stares at it, amazed: "Doctor... you're a genius."
    if (t >= K.pull && t < K.dropBack + 0.4) {
      wr = [p.x + 100, p.y - 90];
      const reach = prog(t, K.pull, K.pull + 0.25) * (1 - prog(t, K.pull + 0.35, K.pull + 0.65));
      const g = mugGeom(wr[0], wr[1], 0);
      const held = [p.x + 135, p.y - 170];   // spoon held up in front of his face
      if (t < K.pull + 0.35) { wl = [lerp(wl[0], g.top[0] - 6, reach), lerp(wl[1], g.top[1] - 70, reach)]; }
      else { const k = prog(t, K.pull + 0.35, K.pull + 0.75, 'outBack'); wl = [lerp(g.top[0] - 6, held[0], k), lerp(g.top[1] - 70, held[1], k)]; spoonState = 'hand'; }
      if (t >= K.pull + 0.5) { f.look = [0.7, 0.2]; f.eye = 1.25; f.pupil = 1.4; f.brow = 0.85; f.turn = 0.3; }
      if (t >= K.doctor) { f.look = [0.85, -0.2]; f.turn = 0.45; f.brow = 0.8; f.eye = 1.22; }
      // "Anything else?" — absent-mindedly drops it back into the mug
      if (t >= K.dropBack) {
        const k = prog(t, K.dropBack, K.dropBack + 0.35);
        wl = [lerp(held[0], g.top[0] - 6, k), lerp(held[1], g.top[1] - 70, k)];
        if (k >= 1) spoonState = 'cup';
        f.look = [0.85, -0.05]; f.eye = 1.08; f.brow = 0.4;
      }
    }

    // "Yes. When I press here, it hurts. And here. And here." — pokes himself with one finger
    const pokes = [
      [K.poke1, [p.x + 62, p.y - 128], [1, -0.15]],          // right shoulder
      [K.poke2, [p.x + 10, p.y - 70], [1, -0.35]],           // belly
      [K.poke3, [head0[0] - 92, head0[1] - 20], [1, 0.15]],  // side of the head
    ];
    if (t >= K.yes - 0.1 && t < 17.6) {
      hL = 'point';
      let tgt = [p.x - 40, p.y - 160], dir = [0.3, -1], wince = 0;
      for (let i = 0; i < pokes.length; i++) {
        const [pt, target, d] = pokes[i];
        const next = pokes[i + 1] ? pokes[i + 1][0] : 17.6;
        if (t >= pt - 0.35 && t < next - 0.35) {
          const n = Math.hypot(d[0], d[1]), u = [d[0] / n, d[1] / n];
          const hover = [target[0] - u[0] * 110, target[1] - u[1] * 110], touch = [target[0] - u[0] * 67, target[1] - u[1] * 67];
          const k = prog(t, pt - 0.35, pt - 0.05, 'inOut'), press = prog(t, pt - 0.05, pt + 0.05, 'in') * (1 - prog(t, pt + 0.3, pt + 0.5));
          tgt = [lerp(hover[0], touch[0], press), lerp(hover[1], touch[1], press)];
          if (k < 1) { const prev = i ? null : [p.x - 40, p.y - 160]; if (prev) tgt = [lerp(prev[0], tgt[0], k), lerp(prev[1], tgt[1], k)]; }
          dir = u;
          wince = prog(t, pt, pt + 0.08) * (1 - prog(t, pt + 0.6, pt + 0.9));
          fx.push(ouch(target[0], target[1], (t - pt) / 0.6, 0.75));
        }
      }
      wl = tgt; absL = Math.atan2(-dir[0], dir[1]) * 180 / Math.PI;
      glow = 0.5 + 0.5 * Math.sin(t * 9);
      if (wince > 0) { f.squint = 0.6 * wince; f.brow = lerp(0.3, 0.8, wince); f.browTilt = 0.6 * wince; f.mouth = 'tight'; p.headTilt -= 4 * wince; }
      f.look = t < K.poke1 - 0.3 ? [0.85, -0.1] : [0.85, -0.1];
    }
    // "Alex... your finger is broken." — holds the finger up to his face and stares at it
    if (t >= 17.6 && t < K.how) {
      hL = t >= K.broken ? 'pointBent' : 'point';
      const k = prog(t, 17.6, 18.2, 'inOut');
      wl = [lerp(p.x - 40, p.x + 108, k), lerp(p.y - 160, p.y - 132, k)]; absL = lerp(200, 212, k);
      glow = 0.6 + 0.4 * Math.sin(t * 11);
      if (t >= K.finger - 0.2) { f.look = [0.7, 0.45]; f.turn = 0.4; f.eye = 1.2; f.pupil = 1.25; f.brow = 0.7; }
      if (t >= K.broken + 0.1) { f.eye = 1.35; f.pupil = 0.8; f.brow = 0.95; f.sweat = prog(t, K.broken + 0.2, K.broken + 0.6, 'outBack'); }
      if (t >= K.oh - 0.1) { f.look = [0.85, -0.1]; f.turn = 0.45; f.eye = 1.08; f.brow = 0.35; f.sweat = 1 - prog(t, K.oh + 0.6, K.oh + 0.9); }
    }
    if (t >= K.how && t < K.two) { f.brow = 0.45; f.mouth = 'smile'; wl = [p.x - 90, p.y - 30]; }
    // "Two hundred dollars." — shock
    if (t >= K.dollars && t < K.can) {
      const k = prog(t, K.dollars, K.dollars + 0.2, 'outBack');
      f.eye = lerp(1.08, 1.45, k); f.pupil = lerp(1.1, 0.6, k); f.brow = 1; f.sweat = k; p.lean -= 4 * k; f.mouth = 'o'; f.open = 0.5;
    }
    // "Can I pay with tea?" — offers his mug, hopeful
    if (t >= K.can - 0.1 && t < K.sip3) {
      const k = prog(t, K.can - 0.1, K.can + 0.25, 'outBack') * (1 - prog(t, K.facepalm + 0.3, K.sip3 - 0.05));
      wr = [lerp(wr[0], p.x + 250, k), lerp(wr[1], p.y - 175, k)];
      f.brow = 0.75; f.eye = 1.2; f.pupil = 1.35; f.mouth = 'smile';
      if (t > K.payTea + 0.3) f.look = [0.85, -0.15];
    }
    if (t >= K.sip3 - 0.4 && t < K.sip3) { f.look = [0.4, 0.4]; f.brow = 0.25; }
    if (t >= K.sip3 && hurtEye === 0 && sip === 0) { f.brow = 0.35; }

    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = 'fist'; p.thumbL = 1; p.thumbR = -1;
    if (absL != null) p.handAbsL = absL; else p.handRotL = rL;
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;

    // props
    const g = mugGeom(wr[0], wr[1], tilt);
    let spoonSvg = '';
    if (spoonState === 'cup') {
      const rest = rot(-14, -78, tilt);
      let tip = [g.top[0] + rest[0], g.top[1] + rest[1]];
      if (sip > 0) { const k = prog(sip, 0.55, 1); tip = [lerp(tip[0], eye[0] + 6, k), lerp(tip[1], eye[1] + 4, k)]; }
      spoonSvg = spoon(g.base, tip, false);
    } else {
      const hand = wl;
      spoonSvg = spoon([hand[0] + 8, hand[1] - 92], [hand[0] + 2, hand[1] + 16], true);
    }
    // fingertip (for the glow)
    let tipPt = null;
    if (hL === 'point' || hL === 'pointBent') {
      const a = (absL || 0) * Math.PI / 180, L = 62 * p.handSc;
      tipPt = [wl[0] - Math.sin(a) * L, wl[1] + Math.cos(a) * L];
    }
    return { p, mugSvg: mug(wr[0], wr[1], tilt), spoonSvg, spoonFront: spoonState === 'hand', fx: fx.join(''), glow, tipPt };
  }

  // ---------------- Doctor ----------------
  function docPose(t, alexHand) {
    const p = Object.assign({ x: DOC_SEAT.x, y: DOC_SEAT.hip, sc: SC, legs: false }, DOC_LOOK);
    p.lean = wob(t, 0.35, 4) * 1; p.headTilt = wob(t, 0.45, 6) * 1.2;
    const f = { turn: -0.45, look: [-0.85, -0.05], mouth: 'smile', open: 0, brow: 0.25, browTilt: 0, eye: 1.0, pupil: 1.0 };
    f.blink = blink(t, [2.2, 5.0, 9.4, 13.2, 16.0, 21.4, 24.6]);
    let wl = [p.x - 120, DESK_TOP - 4], wr = [p.x + 120, DESK_TOP - 4];
    // writing on the clipboard at the start and during "Anything else?"
    const writing = (t < 0.4) || (t > K.anything + 0.6 && t < K.poke1 - 0.3);
    if (writing) { const w = Math.sin(t * 22) * 6; wl = [760 + w, DESK_TOP - 20]; f.look = [-0.3, 0.8]; }
    if (t >= 0.4 && t < 1.2) f.look = [-0.85, -0.05];
    // first spoon poke: she glances up
    if (t >= K.sip1 + 0.25 && t < K.sip1 + 1.0) { f.brow = 0.6; f.eye = 1.1; }
    // "Have you tried taking the spoon out of the cup?" — deadpan, open palm toward his mug
    if (t >= 6.2 && t < 9.0) {
      f.lid = 0.38; f.brow = 0.1; f.mouth = 'flat';
      const k = prog(t, K.spoon - 0.25, K.spoon + 0.1, 'outBack') * (1 - prog(t, 8.9, 9.3));
      if (k > 0) wl = [lerp(wl[0], p.x - 250, k), lerp(wl[1], p.y - 150, k)];
    }
    // "you're a genius" — tiny tired smile
    if (t >= K.genius && t < K.anything) { f.lid = 0.3; f.mouth = 'smile'; f.brow = 0.2; }
    // the pokes — growing concern
    if (t >= K.poke1 && t < 17.6) { f.brow = 0.35 + 0.25 * prog(t, K.poke1, K.poke3); f.browTilt = 0.5 * prog(t, K.poke2, K.poke3); f.lid = 0.15; f.mouth = 'flat'; f.look = [-0.85, 0]; }
    // "Alex... your finger is broken." — sigh, then points (open palm) at his hand
    if (t >= K.sigh - 0.1 && t < K.oh) {
      f.lid = t < K.finger ? 0.45 : 0.2; f.brow = 0.15; f.browTilt = 0.3; f.mouth = 'flat';
      const k = prog(t, K.finger - 0.2, K.finger + 0.15, 'outBack') * (1 - prog(t, K.oh - 0.2, K.oh + 0.1));
      if (k > 0) wl = [lerp(wl[0], p.x - 250, k), lerp(wl[1], p.y - 190, k)];
    }
    // "Two hundred dollars." — bright professional smile
    if (t >= K.two - 0.1 && t < K.can) { f.mouth = 'smile'; f.brow = 0.4; f.eye = 1.05; }
    // "Can I pay with tea?" — dead stare, eye twitch, then facepalm
    if (t >= K.can && t < K.facepalm) { f.mouth = 'flat'; f.lid = 0.3; f.pupil = 0.7; f.eye = 1.1; f.browTilt = -0.4; if (t > K.payTea) f.twitchR = 0.5 + 0.5 * Math.sin(t * 55); }
    if (t >= K.facepalm) {
      const fp = prog(t, K.facepalm, K.facepalm + 0.45, 'inOut');
      const head = CH.headPos(p);
      wr = [lerp(wr[0], head[0] + 5, fp), lerp(wr[1], head[1] - 10, fp)];
      if (fp > 0.7) f.sleep = true;
      p.headTilt += 8 * fp; f.mouth = 'flat';
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = 'round'; p.handR = 'round';
    const s = LIPSYNC.talk(T, t, DOC_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  // ---------------- camera ----------------
  const SHOTS = [
    [0, 'wide'], [2.6, 'alex'], [6.25, 'doc'], [8.85, 'alexTight'], [11.75, 'doc'], [12.95, 'alexWide'],
    [17.6, 'doc'], [18.7, 'finger'], [20.6, 'alex'], [22.9, 'doc'], [23.85, 'alexShock'], [24.45, 'alexWide'], [25.65, 'wide'], [26.35, 'alex'],
  ];
  const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
  function camera(t, aHead, dHead, a) {
    const [t0, kind] = shotAt(t), l = t - t0, push = 1 + l * 0.02;
    if (kind === 'wide') return { cx: 560, cy: 1170, z: 0.95 * push };
    if (kind === 'alex') return { cx: aHead[0] + 40, cy: aHead[1] + 150, z: 1.75 * push };
    if (kind === 'alexTight') return { cx: aHead[0] + 20, cy: aHead[1] + 90, z: 2.05 * push };
    if (kind === 'alexWide') return { cx: aHead[0] + 110, cy: aHead[1] + 130, z: 1.4 * push };
    if (kind === 'alexShock') return { cx: aHead[0] + 20, cy: aHead[1] + 40, z: 2.6 + l * 0.3 };
    if (kind === 'doc') return { cx: dHead[0] - 20, cy: dHead[1] + 150, z: 1.75 * push };
    if (kind === 'finger') { const tp = a.tipPt || aHead; return { cx: lerp(aHead[0], tp[0], 0.55) + 10, cy: lerp(aHead[1], tp[1], 0.55) + 40, z: 2.3 + l * 0.12 }; }
  }

  const subs = SUBS.makeWordSubs(T);
  const subsEl = document.getElementById('subs');
  const svg = document.getElementById('svg');

  window.renderFrame = function (t) {
    const a = alexPose(t), d = docPose(t);
    const aHead = CH.headPos(a.p), dHead = CH.headPos(d);
    const c = camera(t, aHead, dHead, a);
    const o = [`<defs>${CH.defs()}</defs>`];
    o.push(`<g transform="translate(540 960) scale(${c.z.toFixed(4)}) translate(${f1(-c.cx)} ${f1(-c.cy)})">`);
    o.push(clinic());
    // doctor's chair back, doctor, desk, her hands over the desk
    o.push(`<path d="M${DOC_SEAT.x - 120} 1320V990Q${DOC_SEAT.x - 120} 920 ${DOC_SEAT.x} 914Q${DOC_SEAT.x + 120} 920 ${DOC_SEAT.x + 120} 990V1320Z" fill="#3d5a66" stroke="#1d2b33" stroke-width="7"/>`);
    o.push(CH.figure(d));
    o.push(desk());
    o.push(CH.figure(Object.assign({}, d, { _handsOnly: 'LR' })));
    // Alex on the couch, mug in front of his hand, hand over the mug handle
    o.push(couch());
    o.push(CH.figure(a.p));
    if (!a.spoonFront) o.push(a.spoonSvg);
    o.push(a.mugSvg);
    o.push(CH.figure(Object.assign({}, a.p, { _handsOnly: 'R' })));
    if (a.spoonFront) o.push(a.spoonSvg);
    if (a.spoonFront || a.tipPt) o.push(CH.figure(Object.assign({}, a.p, { _handsOnly: 'L' })));
    if (a.tipPt && a.glow > 0) o.push(`<circle cx="${f1(a.tipPt[0])}" cy="${f1(a.tipPt[1])}" r="${f1(16 + 6 * a.glow)}" fill="#ff3b3b" opacity="${(0.35 + 0.35 * a.glow).toFixed(2)}" filter="url(#fGlow)"/>`);
    o.push(a.fx);
    o.push('</g>');
    o.push(`<defs><radialGradient id="gVigC" cx=".5" cy=".5" r=".78"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0c1614" stop-opacity=".25"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigC)"/>`);
    const fade = prog(t, T.duration - 0.5, T.duration - 0.05, 'in');
    if (fade > 0) o.push(`<rect width="1080" height="1920" fill="#000" opacity="${fade.toFixed(3)}"/>`);
    svg.innerHTML = o.join('');
    subsEl.innerHTML = subs(t);
  };
})();
