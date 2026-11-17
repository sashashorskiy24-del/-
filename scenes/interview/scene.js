// "Alex at the Job Interview" — one ~38 s short.
// Audio: assets/audio/interview_voiceover_full.mp3 (whole file, 34.6 s) + 3.2 s silent ending (Alex walks out with the chair).
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;

  // ---------------- who speaks when (measured on the voice envelope) ----------------
  const BOSS_LINES = [[0.0, 1.96], [5.4, 5.86], [6.5, 8.26], [11.7, 14.26], [16.2, 17.53], [19.34, 20.46], [22.54, 23.03], [23.6, 25.5], [27.04, 30.66], [33.84, 34.4]];
  const ALEX_LINES = [[2.44, 5.06], [8.67, 11.33], [14.74, 15.86], [17.87, 18.93], [20.84, 22.03], [25.87, 26.7], [31.07, 33.5]];
  const K = {
    seat: at(2),           // "Please have a seat"
    nice: at(8), keep: at(10),
    no: at(14),
    why: at(15),
    honestly: at(22), mom: at(24),
    strength: at(35),
    very: at(40),
    weakness: at(43),
    too: at(47),
    example: at(50),
    spinach: at(56),       // "You have spinach in your teeth."
    right: at(62),
    five: at(63),
    inYour: at(71),        // "In your chair."
    okay: at(74), hired: at(75), bank: at(77),
    theBank: at(81), pizza: at(83),
    getOut: at(90),
    leave: 34.55,
  };

  // ---------------- looks (same Alex as the pizza / flight shorts) ----------------
  const ALEX_LOOK = { smooth: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.18, handSc: 1.35 };
  const BOSS_LOOK = { kind: 'man', outfit: 'man', smooth: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.1, handSc: 1.35 };
  const SC = 1.0;
  const ALEX_SEAT = { x: 300, hip: 1330 };
  const BOSS_SEAT = { x: 800, hip: 1290 };
  const DESK_TOP = 1305, FLOOR = 1640;

  // ---------------- office set ----------------
  let SET = null;
  function office() {
    if (SET) return SET;
    const o = [];
    o.push(`<defs>
      <linearGradient id="gOW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d2c7"/><stop offset="1" stop-color="#c9c1b3"/></linearGradient>
      <linearGradient id="gOF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b5442"/><stop offset="1" stop-color="#4c3a2c"/></linearGradient>
      <linearGradient id="gCity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc3e4"/><stop offset="1" stop-color="#e3eef6"/></linearGradient>
      <linearGradient id="gDeskW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4f33"/><stop offset="1" stop-color="#5a3922"/></linearGradient>
      <linearGradient id="gLeather" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c2622"/><stop offset=".5" stop-color="#3d342e"/><stop offset="1" stop-color="#241f1b"/></linearGradient>
      <radialGradient id="gLampO"><stop offset="0" stop-color="#fff1cf" stop-opacity=".6"/><stop offset="1" stop-color="#fff1cf" stop-opacity="0"/></radialGradient>
      <filter id="fSoftO"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>`);
    o.push(`<rect x="-700" y="-700" width="2500" height="${FLOOR + 700}" fill="url(#gOW)"/>`);
    // wall panelling
    o.push(`<rect x="-700" y="1150" width="2500" height="${FLOOR - 1150}" fill="#b9ae9d"/>`);
    for (let x = -680; x < 1800; x += 220) o.push(`<rect x="${x}" y="1180" width="190" height="${FLOOR - 1220}" rx="6" fill="none" stroke="#a69a87" stroke-width="6"/>`);
    o.push(`<rect x="-700" y="1138" width="2500" height="16" fill="#e8e2d8"/>`);
    // big window with city view (right of center, behind the boss)
    o.push(`<rect x="560" y="360" width="520" height="640" rx="8" fill="#3b3a38"/><rect x="574" y="374" width="492" height="612" fill="url(#gCity)"/>`);
    const bld = [[580, 700, 70], [652, 620, 60], [714, 760, 80], [796, 560, 70], [868, 680, 64], [934, 600, 78], [1014, 740, 60]];
    for (const [x, y, w] of bld) {
      o.push(`<rect x="${x}" y="${y}" width="${w}" height="${990 - y}" fill="#7f93a8"/>`);
      for (let yy = y + 16; yy < 970; yy += 34) for (let xx = x + 10; xx < x + w - 12; xx += 20) o.push(`<rect x="${xx}" y="${yy}" width="9" height="14" fill="#c7d6e3"/>`);
    }
    o.push(`<path d="M820 374V986M574 680H1066" stroke="#3b3a38" stroke-width="10"/>`);
    o.push(`<rect x="548" y="990" width="544" height="20" rx="4" fill="#e8e2d8"/>`);
    // bank sign (the late reveal) — top left above the door
    o.push(`<g transform="translate(270 420)"><rect x="-200" y="-70" width="400" height="140" rx="16" fill="#1f3b5c" stroke="#c9a33a" stroke-width="8"/>` +
      `<path d="M-150 -18L-118 -40L-86 -18Z" fill="#c9a33a"/><rect x="-146" y="-16" width="56" height="8" fill="#c9a33a"/><path d="M-140 -6v30M-128 -6v30M-112 -6v30M-100 -6v30" stroke="#c9a33a" stroke-width="7"/><rect x="-150" y="26" width="64" height="9" fill="#c9a33a"/>` +
      `<text x="40" y="18" text-anchor="middle" font-family="Oswald, Fredoka" font-weight="700" font-size="58" fill="#f4ecd8" letter-spacing="4">CITY BANK</text></g>`);
    // framed certificate + plant + filing cabinet
    o.push(`<rect x="90" y="640" width="200" height="150" fill="#fff" stroke="#8a6a3c" stroke-width="10"/><path d="M120 680h140M120 710h110M120 740h130" stroke="#c9c1b3" stroke-width="7"/><circle cx="250" cy="760" r="14" fill="#c0392b"/>`);
    o.push(`<rect x="1120" y="980" width="200" height="300" rx="8" fill="#9aa1a9" stroke="#5b6168" stroke-width="5"/><path d="M1130 1080h180M1130 1180h180" stroke="#5b6168" stroke-width="5"/><rect x="1200" y="1020" width="40" height="10" rx="3" fill="#5b6168"/><rect x="1200" y="1120" width="40" height="10" rx="3" fill="#5b6168"/>`);
    // door (left wall) — Alex leaves through it
    o.push(`<rect x="-260" y="760" width="250" height="${FLOOR - 760}" fill="#7a5a3e" stroke="#4a3522" stroke-width="8"/><circle cx="-40" cy="1220" r="12" fill="#e2b84a"/>`);
    // floor + rug
    o.push(`<rect x="-700" y="${FLOOR}" width="2500" height="900" fill="url(#gOF)"/><rect x="-700" y="${FLOOR - 8}" width="2500" height="12" fill="#3e2e22"/>`);
    o.push(`<ellipse cx="560" cy="1780" rx="560" ry="80" fill="#7c2f2a" opacity=".85"/><ellipse cx="560" cy="1780" rx="500" ry="62" fill="none" stroke="#b9853f" stroke-width="6"/>`);
    // ceiling lamp glow
    o.push(`<circle cx="560" cy="300" r="420" fill="url(#gLampO)"/>`);
    SET = o.join('');
    return SET;
  }

  // the boss's big leather chair (behind him)
  function bossChair() {
    const x = BOSS_SEAT.x;
    return `<path d="M${x - 150} 1330V930Q${x - 150} 820 ${x} 810Q${x + 150} 820 ${x + 150} 930V1330Z" fill="url(#gLeather)" stroke="#141110" stroke-width="7"/>` +
      `<path d="M${x - 110} 880Q${x} 850 ${x + 110} 880" fill="none" stroke="#4a3f37" stroke-width="6"/>` + `<circle cx="${x - 70}" cy="960" r="6" fill="#4a3f37"/><circle cx="${x + 70}" cy="960" r="6" fill="#4a3f37"/><circle cx="${x}" cy="990" r="6" fill="#4a3f37"/>`;
  }

  // Alex's simple office chair; `held`: drawn in his hands (no legs on the floor)
  function guestChair(x, y, s = 1, rot = 0) {
    return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})">` +
      `<rect x="-95" y="-300" width="190" height="230" rx="34" fill="#4e6b8a" stroke="#1d2b3a" stroke-width="7"/>` +
      `<rect x="-70" y="-270" width="140" height="160" rx="22" fill="#5f7fa1"/>` +
      `<rect x="-14" y="-74" width="28" height="70" fill="#5b6168"/>` +
      `<rect x="-120" y="0" width="240" height="44" rx="20" fill="#4e6b8a" stroke="#1d2b3a" stroke-width="7"/>` +
      `<rect x="-10" y="44" width="20" height="150" fill="#5b6168"/>` +
      `<path d="M-110 210L0 186L110 210" fill="none" stroke="#3a3f45" stroke-width="12" stroke-linecap="round"/>` +
      `<circle cx="-110" cy="214" r="12" fill="#2a2d31"/><circle cx="110" cy="214" r="12" fill="#2a2d31"/><circle cx="0" cy="196" r="12" fill="#2a2d31"/>` +
      `</g>`;
  }

  function desk() {
    const x0 = 480, x1 = 1130;
    return `<rect x="${x0}" y="${DESK_TOP}" width="${x1 - x0}" height="${FLOOR - DESK_TOP + 10}" fill="url(#gDeskW)" stroke="#3a2416" stroke-width="7"/>` +
      `<rect x="${x0 - 20}" y="${DESK_TOP - 20}" width="${x1 - x0 + 40}" height="34" rx="6" fill="#8a5c3c" stroke="#3a2416" stroke-width="6"/>` +
      `<rect x="${x0 + 40}" y="${DESK_TOP + 60}" width="240" height="${FLOOR - DESK_TOP - 120}" rx="8" fill="none" stroke="#4a2f1e" stroke-width="6"/>` +
      // nameplate, papers, mug
      `<g transform="translate(640 ${DESK_TOP - 40})"><path d="M-80 20L-70 -20H70L80 20Z" fill="#c9a33a" stroke="#5a4510" stroke-width="4"/><text x="0" y="10" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="22" fill="#3a2a05">MANAGER</text></g>` +
      `<rect x="950" y="${DESK_TOP - 34}" width="120" height="14" rx="3" fill="#fffdf6" stroke="#b9a487" stroke-width="3" transform="rotate(-4 1010 ${DESK_TOP - 27})"/>` +
      `<path d="M1080 ${DESK_TOP - 18}h46l-6 -60h-34Z" fill="#fff" stroke="#888" stroke-width="4"/>`;
  }

  // ---------------- characters ----------------
  function alexPose(t) {
    const p = Object.assign({ sc: SC }, ALEX_LOOK);
    const f = { turn: 0.45, look: [0.85, -0.1], mouth: 'flat', open: 0, brow: 0.3, browTilt: 0, eye: 1.08, pupil: 1.1 };
    f.blink = blink(t, [3.0, 6.2, 12.6, 16.0, 19.0, 24.2, 28.0]);
    let held = null;
    // walk in from the left and sit down (0 – 2.2)
    const walk = prog(t, 0.0, 1.5, 'linear'), sit = prog(t, 1.5, 2.15, 'inOut');
    const standHip = FLOOR - (138 + 128 + 14) * SC;
    if (t < 2.15) {
      const ph = t * Math.PI * 2 * 1.6, amp = 1 - prog(t, 1.3, 1.5);
      p.x = lerp(-120, ALEX_SEAT.x, E.sine(walk));
      p.y = lerp(standHip, ALEX_SEAT.hip, sit) - Math.abs(Math.sin(ph)) * 8 * amp * (1 - sit);
      p.legL = [-8 + 20 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 18 * amp]; p.legR = [8 - 20 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 18 * amp];
      p.legK = A.mix([1, 1], [0.32, 1], sit);
      if (sit > 0) { p.legL = A.mix(p.legL, [-36, 36], sit); p.legR = A.mix(p.legR, [36, -36], sit); }
    } else {
      p.x = ALEX_SEAT.x; p.y = ALEX_SEAT.hip; p.legK = [0.32, 1]; p.legL = [-36, 36]; p.legR = [36, -36];
    }
    p.lean = wob(t, 0.4, 1) * 1.2; p.headTilt = wob(t, 0.5, 2) * 1.5;
    let wl = [p.x - 95, p.y - 40], wr = [p.x + 95, p.y - 40], hL = 'fist', hR = 'fist', rR = 0, rL = 0;
    if (t < 2.15) { wl = [p.x - 70, p.y - 20]; wr = [p.x + 70, p.y - 20]; }

    // "Thank you. Nice chair." — pats the chair; "Can I keep it?" — hopeful
    if (t >= K.nice - 0.1 && t < 5.4) {
      const pat = Math.max(0, Math.sin((t - K.nice) * 14)) * 12;
      wl = [p.x - 125, p.y + 6 - pat]; hL = 'glove'; rL = 0;
      f.look = t < K.keep ? [-0.6, 0.6] : [0.85, -0.15]; f.turn = t < K.keep ? 0.1 : 0.45;
      if (t >= K.keep) { f.brow = 0.7; f.eye = 1.2; f.pupil = 1.35; }
    }
    if (t >= 5.4 && t < 6.4) { f.brow = 0.2; f.mouth = 'flat'; }                         // "No." — shrug-face
    // "Honestly? My mom told me to get out of the house." — sincere, hand on chest
    if (t >= K.honestly - 0.1 && t < 11.5) {
      f.brow = 0.55; f.browTilt = 0.3; f.look = [0.85, -0.05];
      wr = [p.x + 20, p.y - 130]; hR = 'glove'; rR = 160;
    }
    // "I'm very honest." — proud
    if (t >= K.very - 0.2 && t < 16.0) { f.brow = 0.6; f.eye = 1.12; p.lean += -3; f.mouth = 'smile'; }
    // "I'm too honest." — modest
    if (t >= K.too - 0.2 && t < 19.2) { f.brow = 0.45; f.lid = 0.3; f.look = [0.5, 0.4]; }
    // "You have spinach in your teeth." — points right at the boss's mouth
    if (t >= K.spinach - 0.15 && t < 22.6) {
      const k = prog(t, K.spinach - 0.15, K.spinach + 0.15, 'outBack');
      wr = [lerp(wr[0], p.x + 230, k), lerp(wr[1], p.y - 175, k)]; hR = 'glove'; rR = 95;
      f.brow = 0.4; f.look = [1, -0.05];
    }
    // "In your chair." — eyes on the leather chair, little smirk
    if (t >= K.inYour - 0.15 && t < 27.0) {
      const k = prog(t, K.inYour - 0.15, K.inYour + 0.15, 'outBack');
      wr = [lerp(wr[0], p.x + 220, k), lerp(wr[1], p.y - 250, k)]; hR = 'glove'; rR = 120;
      f.look = [1, -0.5]; f.brow = 0.6; f.browTilt = -0.2; if (t > 26.7) f.mouth = 'smile';
    }
    // "Welcome to the bank." → "The bank? I thought this was the pizza place." — confused
    if (t >= K.bank && t < K.getOut) {
      f.eye = 1.2; f.pupil = 0.9; f.brow = 0.8; f.browTilt = 0.5; f.look = t < 31.6 ? [-0.6, -0.6] : [0.85, -0.1];
      p.headTilt += 8;
      wl = [p.x - 60, p.y - 150]; hL = 'glove'; rL = 200;     // scratches his head-ish
    }
    // "Get out." — stands up, grabs HIS chair and walks out with it
    if (t >= K.getOut) {
      const up = prog(t, K.leave, K.leave + 0.45, 'inOut');
      const grab = prog(t, K.leave + 0.4, K.leave + 0.8, 'inOut');
      const go = prog(t, K.leave + 0.8, T.duration, 'linear');
      const ph = (t - K.leave - 0.8) * Math.PI * 2 * 1.7, amp = go > 0 ? Math.min(1, go * 6) : 0;
      p.x = ALEX_SEAT.x - go * 620;
      p.y = lerp(ALEX_SEAT.hip, standHip, up) - Math.abs(Math.sin(ph)) * 8 * amp;
      p.legK = A.mix([0.32, 1], [1, 1], up);
      p.legL = A.mix([-36, 36], [-8 + 20 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 18 * amp], up);
      p.legR = A.mix([36, -36], [8 - 20 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 18 * amp], up);
      f.turn = go > 0 ? -0.55 : 0.2; f.look = go > 0 ? [-1, 0] : [0, 0.2]; f.brow = 0.35; f.browTilt = 0; f.mouth = go > 0 ? 'smile' : 'flat';
      if (grab > 0) {
        held = { x: p.x + 10, y: p.y + 40 - 60 * grab, s: 0.78, rot: -8 * grab };
        wl = [p.x - 95, p.y - 60]; wr = [p.x + 95, p.y - 60]; hL = 'glove'; hR = 'glove'; rL = -90; rR = 90;
      }
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotL = rL; p.handRotR = rR; p.thumbL = 1; p.thumbR = -1;
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return { p, held, chairOnFloor: !held };
  }

  function bossPose(t) {
    const p = Object.assign({ x: BOSS_SEAT.x, y: BOSS_SEAT.hip, sc: SC, legs: false }, BOSS_LOOK);
    p.lean = wob(t, 0.35, 4) * 1; p.headTilt = wob(t, 0.45, 6) * 1.2;
    const f = { turn: -0.45, look: [-0.85, -0.05], mouth: 'flat', open: 0, brow: 0.15, browTilt: -0.25, eye: 1.0, pupil: 0.95, spinach: t < 23.3 };
    f.blink = blink(t, [2.6, 7.0, 10.4, 15.1, 18.5, 26.9, 31.6]);
    // hands resting on the desk
    let wl = [p.x - 130, DESK_TOP - 4], wr = [p.x + 130, DESK_TOP - 4], hL = 'glove', hR = 'glove', rL = -82, rR = 82, thL = -1, thR = 1;
    // "Please have a seat." — open palm to the chair
    const seat = prog(t, K.seat - 0.1, K.seat + 0.2, 'outBack') * (1 - prog(t, 2.4, 2.8));
    if (seat > 0) { wl = [lerp(wl[0], p.x - 240, seat), lerp(wl[1], p.y - 120, seat)]; rL = lerp(-82, -100, seat); }
    if (t < 2.0) f.mouth = 'smile';
    // "Can I keep it?" … "No." — deadpan
    if (t >= 5.2 && t < 6.5) { f.lid = 0.35; f.brow = 0.05; }
    // "Honestly, my mom told me to get out of the house." — one brow up
    if (t >= 9.0 && t < 11.7) { f.browTilt = -0.6; f.lid = 0.2; f.eye = 1.05; }
    // writing notes during his questions
    if ((t > 11.8 && t < 14.3) || (t > 16.2 && t < 17.6)) { const w = Math.sin(t * 22) * 6; wr = [p.x + 90 + w, DESK_TOP - 8]; f.look = [-0.3, 0.8]; }
    // "You have spinach in your teeth." — freezes, wide eyes … "Right." — covers his mouth, eyes away
    if (t >= 21.4 && t < 22.54) { f.eye = 1.3; f.pupil = 0.55; f.brow = 0.9; f.mouth = 'tight'; f.blush = prog(t, 21.6, 22.3); }
    if (t >= 22.54 && t < 23.6) { f.blush = 1; f.look = [0.6, 0.3]; f.turn = -0.2; }
    if (t >= 23.0 && t < 23.6) {    // hand over the mouth after "Right."
      const head = CH.headPos(p); wr = [head[0] - 10, head[1] + 70]; hR = 'glove'; rR = 180;
      f.mouth = 'flat';
    }
    // "In your chair." — glare
    if (t >= 26.0 && t < 27.04) { f.browTilt = -0.9; f.lid = 0.15; f.eye = 1.1; }
    // "Okay… you're hired. Welcome to the bank." — tired sigh, then forced smile
    if (t >= 27.04 && t < 30.7) {
      f.lid = t < 28.4 ? 0.45 : 0.2; f.brow = 0.1; f.browTilt = 0;
      const hand = prog(t, K.bank - 0.2, K.bank + 0.1, 'outBack') * (1 - prog(t, 30.6, 30.9));
      if (hand > 0) { wl = [lerp(wl[0], p.x - 230, hand), lerp(wl[1], p.y - 140, hand)]; rL = -100; }
    }
    // "The bank? I thought this was the pizza place." — dead stare, eye twitch
    if (t >= 30.7 && t < K.getOut - 0.05) {
      f.eye = 1.15; f.pupil = 0.65; f.lid = 0.25; f.brow = 0.2; f.browTilt = -0.5; f.mouth = 'flat';
      if (t > 32.8) f.twitchR = 0.5 + 0.5 * Math.sin(t * 55);
    }
    // "Get out." — points at the door
    if (t >= K.getOut - 0.05) {
      const k = prog(t, K.getOut - 0.05, K.getOut + 0.2, 'outBack');
      wl = [lerp(wl[0], p.x - 260, k), lerp(wl[1], p.y - 190, k)]; hL = 'glove'; rL = -95;
      f.browTilt = -0.9; f.red = 0.12; f.eye = 1.1;
      // … then a facepalm as Alex walks off with the chair
      const fp = prog(t, 35.6, 36.1, 'inOut');
      if (fp > 0) { const head = CH.headPos(p); wl = [lerp(wl[0], head[0] - 5, fp), lerp(wl[1], head[1] - 15, fp)]; rL = 180; if (fp > 0.7) f.sleep = true; p.headTilt += 8 * fp; }
      if (t > 35.0 && fp < 0.3) f.look = [-1, 0.1];
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotL = rL; p.handRotR = rR; p.thumbL = thL; p.thumbR = thR;
    const s = LIPSYNC.talk(T, t, BOSS_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  // thought bubble with a pizza (Alex's confusion)
  function pizzaBubble(t, head) {
    const k = prog(t, K.pizza - 0.1, K.pizza + 0.25, 'outBack') * (1 - prog(t, 33.6, 33.85, 'in'));
    if (k <= 0) return '';
    const x = head[0] + 150, y = head[1] - 230;
    return `<circle cx="${f1(head[0] + 70)}" cy="${f1(head[1] - 120)}" r="${f1(12 * k)}" fill="#fff" stroke="#1b1b1b" stroke-width="5"/>` +
      `<circle cx="${f1(head[0] + 105)}" cy="${f1(head[1] - 165)}" r="${f1(20 * k)}" fill="#fff" stroke="#1b1b1b" stroke-width="5"/>` +
      `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(k)})"><ellipse rx="120" ry="90" fill="#fff" stroke="#1b1b1b" stroke-width="7"/>` +
      `<path d="M-45 -45L55 -10L-20 55Z" fill="#f2c45a" stroke="#8a5d38" stroke-width="6" stroke-linejoin="round"/><path d="M-45 -45L55 -10" stroke="#c98a3a" stroke-width="14" stroke-linecap="round"/>` +
      `<circle cx="-12" cy="5" r="9" fill="#c0392b"/><circle cx="12" cy="20" r="8" fill="#c0392b"/><circle cx="-20" cy="30" r="7" fill="#c0392b"/></g>`;
  }

  // ---------------- camera: shots cut to whoever speaks ----------------
  const SHOTS = [
    [0, 'wide'], [2.38, 'alex'], [5.32, 'boss'], [8.6, 'alex'], [11.62, 'boss'], [14.66, 'alex'], [16.12, 'boss'], [17.8, 'alex'],
    [19.26, 'boss'], [20.76, 'alex'], [21.95, 'bossTight'], [23.5, 'boss'], [25.8, 'alex'], [26.96, 'boss'], [29.6, 'sign'],
    [31.0, 'alexWide'], [33.75, 'boss'], [34.5, 'wide'],
  ];
  const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
  function camera(t, aHead, bHead) {
    const [t0, kind] = shotAt(t), l = t - t0, push = 1 + l * 0.02;
    if (kind === 'wide') return { cx: 560, cy: 1180, z: 0.95 * push };
    if (kind === 'alex') return { cx: aHead[0] + 30, cy: aHead[1] + 150, z: 1.75 * push };
    if (kind === 'alexWide') return { cx: aHead[0] + 120, cy: aHead[1] + 60, z: 1.45 * push };
    if (kind === 'boss') return { cx: bHead[0] - 20, cy: bHead[1] + 150, z: 1.75 * push };
    if (kind === 'bossTight') return { cx: bHead[0], cy: bHead[1] + 50, z: 2.9 + l * 0.15 };
    if (kind === 'sign') return { cx: 290, cy: 470, z: 1.9 * push };
  }

  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const a = alexPose(t), b = bossPose(t);
    const aHead = CH.headPos(a.p), bHead = CH.headPos(b);
    const c = camera(t, aHead, bHead);
    const o = [`<defs>${CH.defs()}</defs>`];
    o.push(`<g transform="translate(540 960) scale(${c.z.toFixed(4)}) translate(${f1(-c.cx)} ${f1(-c.cy)})">`);
    o.push(office(), bossChair());
    o.push(CH.figure(b));
    o.push(desk());
    o.push(CH.figure(Object.assign({}, b, { _handsOnly: 'LR' })));
    if (a.chairOnFloor) o.push(guestChair(ALEX_SEAT.x, ALEX_SEAT.hip + 14));
    o.push(`<ellipse cx="${f1(a.p.x)}" cy="${FLOOR + 30}" rx="140" ry="18" fill="#000" opacity=".25" filter="url(#fSoftO)"/>`);
    o.push(CH.figure(a.p));
    if (a.held) { o.push(guestChair(a.held.x, a.held.y, a.held.s, a.held.rot)); o.push(CH.figure(Object.assign({}, a.p, { _handsOnly: 'LR' }))); }
    else if (t >= 2.15) {
      // seat cushion over his thighs so he reads as sitting in the chair
      o.push(`<rect x="${ALEX_SEAT.x - 120}" y="${ALEX_SEAT.hip + 14}" width="240" height="44" rx="20" fill="#4e6b8a" stroke="#1d2b3a" stroke-width="7"/>`);
      if (t >= K.nice - 0.1 && t < 5.4) o.push(CH.figure(Object.assign({}, a.p, { _handsOnly: 'L' })));
    }
    o.push(pizzaBubble(t, aHead));
    o.push('</g>');
    o.push(`<defs><radialGradient id="gVigI" cx=".5" cy=".5" r=".78"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a120c" stop-opacity=".25"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigI)"/>`);
    const fade = prog(t, T.duration - 0.5, T.duration - 0.05, 'in');
    if (fade > 0) o.push(`<rect width="1080" height="1920" fill="#000" opacity="${fade.toFixed(3)}"/>`);
    svg.innerHTML = o.join('');
  };
})();
