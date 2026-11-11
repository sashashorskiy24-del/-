// "Alex's First Flight" — Scene 1: "Is this your first flight?" … "Ohhh…"
// Audio: assets/audio/airplane_voiceover_full.wav, 1.45s–17.85s (+0.8 s for Alex's final nod). No narrator, no subtitles.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;

  // ---------------- who speaks when (measured on the voice envelope) ----------------
  const STEW_LINES = [[0.2, 2.05], [4.72, 5.4], [8.85, 9.6], [12.4, 14.25]];
  const ALEX_LINES = [[2.5, 4.38], [5.95, 8.38], [10.08, 11.95], [14.72, 15.65]];
  const K = {
    hello: 0.2,
    yes: 2.5, canI: at(7),                 // 3.19 "Can I ask you a question?"
    ofCourse: 4.72,
    areWe: 5.95, up: at(18), forward: at(20),   // 6.79 / 7.35
    forwardSir: 8.85,
    then: 10.08, ground: at(29), below: at(30), // 11.03 / 11.35
    because: 12.4, air: at(36),                 // 13.99
    oh: 14.72, ohEnd: 15.65,
  };
  const { ALEX, STEW, ALEX_LOOK, STEW_LOOK, WINDOW } = AIR;

  // ---------------- Alex (window seat) ----------------
  function alexPose(t) {
    const p = Object.assign({ x: ALEX.x, y: ALEX.hip, sc: ALEX.sc, legK: [0.32, 1], legL: [-36, 36], legR: [36, -36] }, ALEX_LOOK);
    p.lean = wob(t, 0.4, 1) * 1.2;
    p.headTilt = wob(t, 0.5, 2) * 1.5;
    const f = { turn: 0.45, look: [0.85, -0.15], mouth: 'flat', open: 0, brow: 0.15, browTilt: 0, eye: 1.05, pupil: 1.05 };
    f.blink = blink(t, [1.4, 5.5, 9.8, 13.0]);
    // hands resting on the armrests / lap
    let wl = [p.x - 95, p.y - 40], wr = [p.x + 95, p.y - 40], hL = 'fist', hR = 'fist', rR = 0, thR = -1;
    // "Yes! Can I ask you a question?" — eager, finger up
    if (t >= K.yes - 0.1 && t < 5.0) {
      const k = prog(t, K.yes - 0.1, K.yes + 0.2, 'outBack');
      f.eye = 1.15; f.brow = 0.55; f.turn = 0.5; p.headTilt += 3;
      if (t < K.yes + 0.4) p.y -= Math.sin(prog(t, K.yes - 0.1, K.yes + 0.4, 'linear') * Math.PI) * 12;   // perks up
      const fk = prog(t, K.canI - 0.15, K.canI + 0.1, 'outBack') * (1 - prog(t, 4.6, 4.9));
      wr = [lerp(wr[0], p.x + 185, fk), lerp(wr[1], p.y - 215, fk)];
      if (fk > 0.5) { hR = 'point'; rR = 180; }
    }
    // "Are we flying up or forward right now?" — dead serious, head tilted
    if (t >= K.areWe - 0.1 && t < 8.7) {
      f.brow = 0.25; f.browTilt = -0.1; f.eye = 1.05; f.turn = 0.5; p.headTilt += 8;
      const u = prog(t, K.up - 0.15, K.up + 0.1, 'outBack') * (1 - prog(t, K.forward - 0.15, K.forward));
      const fw = prog(t, K.forward - 0.1, K.forward + 0.15, 'outBack') * (1 - prog(t, 8.5, 8.8));
      wr = [lerp(lerp(wr[0], p.x + 180, u), p.x + 205, fw), lerp(lerp(wr[1], p.y - 270, u), p.y - 130, fw)];
      if (u > 0.5) { hR = 'point'; rR = 180; }
      if (fw > 0.5) { hR = 'point'; rR = 95; }
    }
    // listening to "Forward, sir."
    if (t >= 8.7 && t < K.then) { f.brow = 0.1; f.look = [0.85, -0.1]; }
    // "Then why is the ground below us?" — looks out of the window, then back at her
    if (t >= K.then - 0.1 && t < 12.3) {
      const out = prog(t, K.then - 0.05, K.then + 0.3) * (1 - prog(t, 10.95, 11.25));
      f.turn = lerp(0.5, -0.65, out); f.look = [lerp(0.85, -1, out), lerp(-0.1, 0.55, out)];
      p.headTilt += lerp(0, -10, out);
      f.brow = 0.35; f.browTilt = 0.1;
      const pt = prog(t, K.below - 0.1, K.below + 0.15, 'outBack') * (1 - prog(t, 12.0, 12.3));
      wl = [lerp(wl[0], p.x - 150, pt), lerp(wl[1], p.y - 120, pt)];
      if (pt > 0.5) { hL = 'point'; }
    }
    // listening to "Because… we're in the air." — perfectly serious
    if (t >= 12.3 && t < K.oh) { f.brow = 0.2; f.eye = 1.1; f.look = [0.85, -0.12]; f.turn = 0.5; }
    // "Ohhh…" — slow, satisfied nod, as if he just understood rocket science
    if (t >= K.oh - 0.05) {
      const nod = Math.sin(prog(t, K.oh, 17.0, 'linear') * Math.PI * 3);
      p.headTilt = nod * 6; p.headY = Math.max(0, nod) * 6;
      f.lid = prog(t, K.oh, K.oh + 0.4) * 0.35; f.brow = 0.55; f.browTilt = -0.1; f.turn = 0.4; f.look = [0.6, 0.1];
      if (t > K.ohEnd) { f.mouth = 'smile'; }
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotR = rR; p.thumbR = thR; p.handRotL = hL === 'point' ? 180 : 0;
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  // ---------------- stewardess (aisle) ----------------
  function stewPose(t) {
    const walk = prog(t, 0, 0.75, 'out');
    const ph = t * Math.PI * 2 * 1.6, amp = 1 - walk;
    const x = lerp(1150, STEW.x, walk);
    const hip = STEW.feet - (138 + 128 + 14) * STEW.sc;
    const p = Object.assign({ x, y: hip - Math.abs(Math.sin(ph)) * 8 * amp, sc: STEW.sc }, STEW_LOOK);
    p.legL = [-6 + 18 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 16 * amp]; p.legR = [6 - 18 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 16 * amp];
    p.lean = -2 * amp + wob(t, 0.4, 3) * 1;
    p.headTilt = -4 + wob(t, 0.5, 5) * 1.5;
    const f = { turn: -0.45, look: [-0.85, 0.15], mouth: 'smile', open: 0, brow: 0.3, browTilt: 0, eye: 1, pupil: 1 };
    f.blink = blink(t, [2.9, 6.6, 10.6, 15.2]);
    // hands politely clasped in front
    let wl = [p.x - 18, p.y - 50], wr = [p.x + 18, p.y - 55], hL = 'fist', hR = 'fist', rL = 0;
    // "Hello! Is this your first flight?" — small friendly wave-palm
    const hi = prog(t, 0.25, 0.55, 'outBack') * (1 - prog(t, 1.6, 1.95));
    wl = [lerp(wl[0], p.x - 110, hi), lerp(wl[1], p.y - 175, hi)]; if (hi > 0.5) { hL = 'open'; rL = 180; }
    // "Of course!" — warm nod, open palm
    if (t >= K.ofCourse - 0.1 && t < 5.7) {
      const k = prog(t, K.ofCourse - 0.1, K.ofCourse + 0.15, 'outBack') * (1 - prog(t, 5.4, 5.7));
      wl = [lerp(wl[0], p.x - 95, k), lerp(wl[1], p.y - 110, k)]; if (k > 0.5) { hL = 'open'; rL = 150; }
      p.headTilt += Math.sin(prog(t, K.ofCourse, K.ofCourse + 0.5, 'linear') * Math.PI) * 8;
      f.brow = 0.45;
    }
    // the questions start: slight puzzlement
    if (t >= 6.5) { f.brow = 0.5; f.browTilt = 0.15; }
    // "Forward, sir." — eyebrows up, smile thinning
    if (t >= K.forwardSir - 0.1) { f.brow = 0.65; f.browTilt = 0.2; f.eye = 1.08; f.mouth = 'smile'; }
    if (t >= 9.7 && t < K.because) { f.mouth = 'tight'; f.eye = 1.15; f.pupil = 0.85; }
    // "Because… we're in the air." — lost for words: looks up, searches, open palms
    if (t >= K.because - 0.1 && t < 15.0) {
      const think = prog(t, 12.6, 12.8) * (1 - prog(t, 13.1, 13.3));
      f.look = [lerp(-0.85, -0.2, think), lerp(0.15, -0.9, think)]; f.turn = lerp(-0.45, -0.2, think);
      f.brow = 0.75; f.browTilt = 0.45; f.eye = 1.12; f.mouth = 'tight';
      const pal = prog(t, 13.15, 13.4, 'outBack') * (1 - prog(t, 14.6, 14.95));
      wl = [lerp(wl[0], p.x - 120, pal), lerp(wl[1], p.y - 70, pal)]; wr = [lerp(wr[0], p.x + 120, pal), lerp(wr[1], p.y - 70, pal)];
      if (pal > 0.5) { hL = 'open'; hR = 'open'; rL = -95; p.handRotR = 95; p.thumbL = 1; p.thumbR = -1; }
    }
    // the end: frozen professional smile, eye twitch
    if (t >= 15.0) {
      f.mouth = 'tight'; f.brow = 0.55; f.browTilt = 0.35; f.eye = 1.1; f.pupil = 0.8; f.look = [-0.85, 0.1];
      if (t > 16.2 && t < 16.6) f.browTilt = 0.35 + Math.sin(t * 60) * 0.25;
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotL = rL; p.thumbL = p.thumbL || 1;
    const s = LIPSYNC.talk(T, t, STEW_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  // ---------------- camera: wide / medium / close-ups, cut on each speaker ----------------
  const CAM = [
    [0, [640, 1160, 0.82]], [2.45, [660, 1170, 0.92], 'sine'],
    [2.47, [300, 1215, 1.85], 'step'], [4.66, [300, 1210, 1.95], 'sine'],          // Alex: "Yes! Can I ask you a question?"
    [4.68, [870, 1165, 1.95], 'step'], [5.88, [870, 1160, 2.05], 'sine'],          // stewardess: "Of course!"
    [5.9, [330, 1230, 1.6], 'step'], [8.78, [320, 1220, 1.8], 'sine'],             // Alex: "up or forward?"
    [8.8, [870, 1160, 2.05], 'step'], [10.0, [870, 1155, 2.15], 'sine'],           // "Forward, sir."
    [10.02, [200, 1190, 1.45], 'step'], [12.33, [215, 1195, 1.55], 'sine'],        // Alex + window: "why is the ground below us?"
    [12.35, [870, 1160, 2.1], 'step'], [14.66, [870, 1150, 2.3], 'sine'],          // "Because… we're in the air."
    [14.68, [300, 1210, 1.95], 'step'], [16.2, [300, 1205, 2.15], 'sine'],         // Alex: "Ohhh…"
    [16.22, [620, 1170, 1.0], 'step'], [T.duration, [620, 1170, 1.04], 'sine'],    // wide: the stewardess, frozen smile
  ];

  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const c = kf(t, CAM);
    const cam = { cx: c[0], cy: c[1], z: c[2] };
    const ap = alexPose(t), sp = stewPose(t);
    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, AIR.defs());
    o.push(`<g transform="translate(540 960) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(AIR.cabin(t));
    o.push(AIR.rowBack());
    o.push(CH.figure(ap));
    o.push(AIR.rowFront());
    o.push(`<ellipse cx="${f1(sp.x)}" cy="${STEW.feet + 20}" rx="110" ry="16" fill="#000" opacity=".2" filter="url(#fBlurA)"/>`);
    o.push(CH.figure(sp));
    o.push('</g>');
    o.push(`<defs><radialGradient id="gVigA" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a1410" stop-opacity=".28"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigA)"/>`);
    svg.innerHTML = o.join('');
  };
})();
