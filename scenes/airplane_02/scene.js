// "Alex's First Flight" — Scene 2: the toilet question.
// Audio: assets/audio/airplane_voiceover_full.wav, 17.85s–32.45s (continues right after scene 1) + 2.4 s for the facepalm.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;

  // ---------------- who speaks when (measured on the voice envelope) ----------------
  const ALEX_LINES = [[0.27, 1.45], [2.94, 7.42], [11.35, 13.9]];
  const STEW_LINES = [[1.87, 2.43], [7.7, 10.9]];
  const K = {
    another: 0.27,                    // Alex: "Can I ask another question?"
    yesSir: 1.87,                     // stew: "Yes, sir…"
    when: 2.94,                       // Alex: "When someone flushes the toilet on a plane…"
    does: at(15), fall: at(17), below: at(21),   // 5.43 / 6.15 / 7.03
    what: 7.73, no: at(23),           // stew: "WHAT?! NO!" 7.73 / 8.47
    itAll: at(24), tank: at(30),      // "It all goes into a special tank!" 9.19 / 10.47
    phew: 11.35, because: at(32),     // Alex: "Phew… because we just flew over my house." 12.07
    house: at(38), alexEnd: 13.9,
    stare: 14.0, palm: 15.15,         // silent stare, then the facepalm
  };
  const { ALEX, STEW, ALEX_LOOK, STEW_LOOK } = AIR;

  // ---------------- Alex ----------------
  function alexPose(t) {
    const p = Object.assign({ x: ALEX.x, y: ALEX.hip, sc: ALEX.sc, legK: [0.32, 1], legL: [-36, 36], legR: [36, -36] }, ALEX_LOOK);
    p.lean = wob(t, 0.4, 1) * 1.2;
    p.headTilt = wob(t, 0.5, 2) * 1.5;
    const f = { turn: 0.45, look: [0.85, -0.15], mouth: 'flat', open: 0, brow: 0.2, browTilt: 0, eye: 1.05, pupil: 1.05 };
    f.blink = blink(t, [2.6, 7.6, 10.2, 15.8]);
    let wl = [p.x - 95, p.y - 40], wr = [p.x + 95, p.y - 40], hL = 'fist', hR = 'fist', rR = 0, rL = 0;
    // "Can I ask another question?" — raises his hand like at school, innocent face
    const raise = prog(t, 0.0, 0.3, 'outBack') * (1 - prog(t, 2.6, 2.95));
    wr = [lerp(wr[0], p.x + 175, raise), lerp(wr[1], p.y - 300, raise)];
    if (raise > 0.5) { hR = 'open'; rR = 180; }
    if (t < 2.95) { f.brow = 0.5; f.eye = 1.12; f.pupil = 1.2; p.headTilt += 5; }
    // the toilet question — completely sincere; points down at "fall … below", little falling wiggle
    if (t >= K.when - 0.05 && t < 11.2) {
      f.brow = 0.35; f.browTilt = 0.15; f.eye = 1.1; f.pupil = 1.1; p.headTilt += 6;
      const dn = prog(t, K.fall - 0.15, K.fall + 0.1, 'outBack') * (1 - prog(t, 7.6, 7.9));
      const wig = Math.sin((t - K.fall) * 14) * 10 * prog(t, K.fall, K.below + 0.3) * (1 - prog(t, 7.4, 7.6));
      wr = [lerp(wr[0], p.x + 150 + wig, dn), lerp(wr[1], p.y - 70 + Math.max(0, (t - K.fall)) * 30 * dn, dn)];
      if (dn > 0.5) { hR = 'point'; rR = 0; }
      if (t > K.fall && t < 7.5) f.look = [0.8, 0.5];            // glances down, imagining it
    }
    // listening to "WHAT?! NO!" — a tiny flinch, still calm
    if (t >= K.what && t < K.phew - 0.05) {
      f.eye = t < K.what + 0.6 ? 1.2 : 1.08; f.brow = 0.45; f.browTilt = 0; f.look = [0.85, -0.15];
      if (t < K.what + 0.3) p.headTilt -= 4;
    }
    // "Phew…" relief, then looks out of the window, searching for his house — dead serious
    if (t >= K.phew - 0.05) {
      const ex = Math.sin(prog(t, K.phew, 11.95, 'linear') * Math.PI);
      p.sqY = 1 - 0.03 * ex; p.lean += ex * 3;
      f.lid = 0.45 * ex; f.brow = 0.3; f.browTilt = 0.3 * ex;
      const win = prog(t, 11.85, 12.25);
      f.turn = lerp(0.45, -0.65, win); f.look = [lerp(0.85, -1, win), lerp(-0.1, 0.6, win)];
      p.headTilt += lerp(0, -8, win);
      wl = [lerp(wl[0], p.x - 120, win), lerp(wl[1], p.y - 140, win)];   // hand against the window
      if (win > 0.5) { hL = 'open'; rL = 160; }
      if (t > K.alexEnd + 0.3) { f.mouth = 'smile'; f.brow = 0.35; f.browTilt = 0; f.lid = 0.15; }   // content: house is safe
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotR = rR; p.handRotL = rL; p.thumbR = -1; p.thumbL = 1;
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    p.face = f;
    return p;
  }

  // ---------------- stewardess ----------------
  function stewPose(t) {
    // she was about to move on down the aisle; turns back with a sigh
    const back = prog(t, 1.2, 1.8, 'inOut');
    const hip = STEW.feet - (138 + 128 + 14) * STEW.sc;
    const p = Object.assign({ x: STEW.x + 30 * (1 - back), y: hip, sc: STEW.sc }, STEW_LOOK);
    p.legL = [-6, 2]; p.legR = [6, -2];
    p.lean = wob(t, 0.4, 3) * 1;
    p.headTilt = -4 + wob(t, 0.5, 5) * 1.5;
    const f = { turn: lerp(0.5, -0.45, back), look: [lerp(0.9, -0.85, back), 0.15], mouth: 'tight', open: 0, brow: 0.45, browTilt: 0.3, eye: 1.05, pupil: 0.95, lid: 0.15 };
    f.blink = blink(t, [0.6, 4.4, 6.9, 12.6]);
    let wl = [p.x - 18, p.y - 50], wr = [p.x + 18, p.y - 55], hL = 'fist', hR = 'fist', rL = 0, rR = 0;
    // the sigh before "Yes, sir…" — shoulders up and down, eyes closed (silent)
    const sigh = Math.sin(prog(t, 1.05, 1.85, 'linear') * Math.PI);
    p.sqY = 1 + 0.035 * sigh; if (sigh > 0.4) { f.sleep = true; f.mouth = 'flat'; }
    if (t >= K.yesSir - 0.05 && t < 7.65) { f.lid = 0.3; f.brow = 0.3; f.browTilt = 0.4; f.mouth = 'tight'; }
    // listening to the toilet question: eyebrows climbing
    if (t >= 4.0 && t < K.what) { f.brow = lerp(0.3, 0.75, prog(t, 4.0, 7.2)); f.browTilt = 0.45; f.lid = lerp(0.3, 0, prog(t, 5.5, 7.2)); f.eye = lerp(1.05, 1.15, prog(t, 5.5, 7.2)); }
    // "WHAT?!" — eyes pop; "NO!" — hands up, stop; "It all goes into a special tank!" — shapes the tank
    if (t >= K.what - 0.05 && t < 11.3) {
      const pop = prog(t, K.what - 0.05, K.what + 0.12, 'outBack');
      f.eye = lerp(1.15, 1.45, pop); f.pupil = 0.5; f.brow = 1.1; f.browTilt = 0.2; f.lid = 0;
      p.headTilt += -6 * pop;
      if (t < K.what + 0.35) p.y -= Math.sin(prog(t, K.what - 0.05, K.what + 0.35, 'linear') * Math.PI) * 14;
      const no = prog(t, K.no - 0.1, K.no + 0.1, 'outBack') * (1 - prog(t, K.itAll - 0.1, K.itAll + 0.1));
      if (no > 0) {
        const shake = Math.sin((t - K.no) * 30) * 12;
        wl = [lerp(wl[0], p.x - 110 + shake, no), lerp(wl[1], p.y - 175, no)]; wr = [lerp(wr[0], p.x + 110 + shake, no), lerp(wr[1], p.y - 175, no)];
        if (no > 0.5) { hL = 'open'; hR = 'open'; rL = 180; rR = 180; }
      }
      const tk = prog(t, K.itAll, K.itAll + 0.25, 'outBack') * (1 - prog(t, 10.95, 11.3));
      if (tk > 0) {
        const pump = Math.sin(prog(t, K.tank - 0.1, K.tank + 0.3, 'linear') * Math.PI) * 25;
        wl = [lerp(wl[0], p.x - 85, tk), lerp(wl[1], p.y - 95 + pump, tk)]; wr = [lerp(wr[0], p.x + 85, tk), lerp(wr[1], p.y - 95 + pump, tk)];
        if (tk > 0.5) { hL = 'open'; hR = 'open'; rL = -95; rR = 95; }
        f.eye = 1.25; f.pupil = 0.7; f.brow = 0.6; f.browTilt = -0.4;       // indignant
      }
    }
    // listening to "Phew… because we just flew over my house."
    if (t >= 11.3 && t < K.stare) { f.eye = 1.1; f.pupil = 0.85; f.brow = 0.5; f.browTilt = 0.1; f.mouth = 'tight'; f.look = [-0.85, 0.2]; }
    // the silent stare… then the facepalm
    if (t >= K.stare) {
      f.mouth = 'flat'; f.eye = 1.0; f.pupil = 0.65; f.lid = 0.35; f.brow = 0.15; f.browTilt = -0.05; f.look = [-0.9, 0.15];
      if (t > 14.6 && t < 15.0) f.browTilt = -0.05 + Math.sin(t * 60) * 0.3;
      const fp = prog(t, K.palm, K.palm + 0.55, 'inOut');
      if (fp > 0) {
        const head = CH.headPos(p);
        wr = [lerp(wr[0], head[0] + 8, fp), lerp(wr[1], head[1] - 12, fp)];
        hR = 'open'; rR = 180;
        p.headTilt += 10 * fp; p.lean += 3 * fp;
        if (fp > 0.7) { f.sleep = true; }
      }
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotL = rL; p.handRotR = rR; p.thumbL = 1; p.thumbR = -1;
    const s = LIPSYNC.talk(T, t, STEW_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    if (t >= K.what - 0.05 && t < K.what + 0.5 && s) { f.mouth = 'o'; f.open = Math.max(f.open || 0, 0.45); }
    p.face = f;
    return p;
  }

  // ---------------- camera: few, smooth cuts ----------------
  const CAM = [
    [0, [320, 1215, 1.55]], [1.85, [325, 1210, 1.62], 'sine'],                       // Alex raises his hand
    [1.87, [870, 1185, 1.55], 'step'], [2.9, [870, 1180, 1.62], 'sine'],             // stewardess sighs: "Yes, sir…"
    [2.92, [300, 1215, 1.95], 'step'], [7.66, [300, 1205, 2.2], 'sine'],             // Alex close-up: the toilet question
    [7.68, [870, 1165, 2.05], 'step'], [7.9, [870, 1150, 2.4], 'outBack'], [11.25, [870, 1150, 2.45], 'sine'],   // "WHAT?! NO! …special tank!"
    [11.27, [210, 1195, 1.45], 'step'], [13.95, [195, 1190, 1.55], 'sine'],          // Alex at the window: "…flew over my house."
    [13.97, [560, 1180, 1.05], 'step'], [T.duration, [575, 1172, 1.13], 'sine'],     // both: stare… facepalm
  ];

  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const c = kf(t, CAM);
    const cam = { cx: c[0], cy: c[1], z: c[2] };
    const ap = alexPose(t), sp = stewPose(t);
    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, AIR.defs());
    o.push(`<g transform="translate(540 960) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(AIR.cabin(t + 17.2));          // keep the clouds / passengers' idle cycles continuous from scene 1
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
