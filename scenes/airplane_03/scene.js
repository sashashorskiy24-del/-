// "Alex's First Flight" — Scene 3 (final): "One last question!" … the whispered air-conditioning request.
// Audio: assets/audio/airplane_voiceover_full.wav, 32.45s–end of file (56.35s) + 2.9 s silence for the final reaction.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;

  // ---------------- who speaks when (measured on the voice envelope) ----------------
  const WHISPER = [21.2, 23.07];
  const ALEX_LINES = [[0.25, 1.72], [3.88, 6.13], [9.52, 12.22], [14.2, 17.02], WHISPER];
  const STEW_LINES = [[2.03, 3.42], [6.5, 9.06], [12.47, 13.7], [17.3, 20.7]];
  const K = {
    wait: 0.25,                       // Alex: "Wait! One last question!"
    sir: 2.03, whatNow: at(5),        // stew: "Sir… WHAT NOW?!" (2.67)
    window: 3.88, hot: at(12),        // Alex: "Can I open the window? It's a little hot in here." (hot 5.47)
    no1: 6.5, feet: at(23),           // stew: "NO! We're flying at thirty thousand feet!" (30,000 ≈ 7.87, feet 8.75)
    k30: at(22),
    oh: 9.52, door: at(32),           // Alex: "Ohhh… then can you at least open the door a little?" (door 11.63)
    what2: 12.47, no2: at(36),        // stew: "WHAT?! NO!!!" (no 13.23)
    weird: 14.2, then: at(39), fresh: at(44),   // Alex: "That's weird… Then how do you get fresh air in here?"
    sirP: 17.3, please: at(49), stop: at(50), stupid: at(52), questions: at(53),   // stew climax
    whisper: WHISPER[0], end: WHISPER[1],
    twitch: 23.45, palm: 24.15, leave: 24.95,
  };
  const { ALEX, STEW, ALEX_LOOK, STEW_LOOK } = AIR;

  // ---------------- Alex ----------------
  function alexPose(t) {
    const p = Object.assign({ x: ALEX.x, y: ALEX.hip, sc: ALEX.sc, legK: [0.32, 1], legL: [-36, 36], legR: [36, -36] }, ALEX_LOOK);
    p.lean = wob(t, 0.4, 1) * 1.2;
    p.headTilt = wob(t, 0.5, 2) * 1.5;
    const f = { turn: 0.45, look: [0.85, -0.15], mouth: 'flat', open: 0, brow: 0.3, browTilt: 0, eye: 1.08, pupil: 1.1 };
    f.blink = blink(t, [3.0, 8.0, 13.9, 25.7]);
    let wl = [p.x - 95, p.y - 40], wr = [p.x + 95, p.y - 40], hL = 'fist', hR = 'fist', rR = 0, rL = 0;
    // "Wait! One last question!" — hand shoots up, very interested
    const up = prog(t, 0.05, 0.3, 'outBack') * (1 - prog(t, 2.0, 2.4));
    wr = [lerp(wr[0], p.x + 180 + Math.sin(t * 14) * 6 * up, up), lerp(wr[1], p.y - 300, up)];
    if (up > 0.5) { hR = 'open'; rR = 180; }
    if (t < 3.8) { f.brow = 0.6; f.eye = 1.15; f.pupil = 1.25; p.headTilt += 5; if (t < 0.6) p.y -= Math.sin(prog(t, 0.05, 0.6, 'linear') * Math.PI) * 14; }
    // "Can I open the window? It's a little hot in here." — points at the window, totally casual
    if (t >= K.window - 0.1 && t < 6.4) {
      const pw = prog(t, K.window - 0.05, K.window + 0.25, 'outBack') * (1 - prog(t, 6.1, 6.4));
      wl = [lerp(wl[0], p.x - 150, pw), lerp(wl[1], p.y - 135, pw)]; if (pw > 0.5) { hL = 'point'; rL = 180; }
      f.turn = 0.3; f.look = t < 4.6 ? [-0.9, 0.1] : [0.85, -0.1]; f.brow = 0.3;
      if (t > K.hot) { const fan = Math.sin((t - K.hot) * 18) * 15; wr = [p.x + 70 + fan, p.y - 150]; hR = 'open'; rR = 200; }   // fans himself
    }
    // "Ohhh… then can you at least open the door a little?" — thinks, then hopefully points to the door (front of the plane)
    if (t >= K.oh - 0.05 && t < 12.45) {
      if (t < 10.35) { f.lid = 0.3; f.look = [0.2, -0.8]; f.turn = 0.25; p.headTilt += 6; wr = [p.x + 55, p.y - 125]; hR = 'fist'; }   // "Ohhh…" pondering, hand on chin
      const pd = prog(t, 10.35, 10.65, 'outBack') * (1 - prog(t, 12.2, 12.45));
      if (pd > 0) { wr = [lerp(wr[0], p.x + 235, pd), lerp(wr[1], p.y - 150, pd)]; hR = 'point'; rR = 95; f.brow = 0.6; f.eye = 1.15; f.look = [1, -0.1]; f.turn = 0.5; }
    }
    // reacting to "WHAT?! NO!!!" — blinks, unbothered
    if (t >= K.what2 && t < 14.1) { f.eye = 1.15; f.brow = 0.4; }
    // "That's weird… Then how do you get fresh air in here?" — looks out of the window, then back, puzzled
    if (t >= K.weird - 0.05 && t < 17.25) {
      const out = prog(t, K.weird, K.weird + 0.3) * (1 - prog(t, K.then - 0.1, K.then + 0.2));
      f.turn = lerp(0.45, -0.6, out); f.look = [lerp(0.85, -1, out), lerp(-0.1, 0.4, out)];
      f.brow = 0.45; f.browTilt = 0.35; p.headTilt += 7;
      if (t > K.then) { wr = [p.x + 120, p.y - 110]; hR = 'open'; rR = 120; }
    }
    // the shout: freezes, scared
    if (t >= K.sirP && t < K.whisper - 0.15) {
      const k = prog(t, K.sirP, K.sirP + 0.2, 'outBack');
      f.eye = lerp(1.1, 1.45, k); f.pupil = lerp(1.1, 0.45, k); f.brow = 1.0; f.browTilt = 0.6; f.mouth = 'flat';
      p.lean = -5 * k; p.sqY = 1 - 0.03 * k;
      if (t > K.stupid && t < K.stupid + 0.35) p.x -= Math.sin((t - K.stupid) * 60) * 3;
    }
    // the whisper: leans in, huge innocent eyes, small mouth movements
    if (t >= K.whisper - 0.15) {
      const lean = prog(t, K.whisper - 0.15, K.whisper + 0.3);
      p.lean = lerp(-5, 7, lean); p.headTilt += 6 * lean;
      f.eye = 1.25; f.pupil = 1.55; f.brow = 0.75; f.browTilt = 0.7; f.look = [0.85, -0.25]; f.mouth = 'flat';
      wr = [p.x + 85, p.y - 120]; hR = 'open'; rR = 200;          // hand by the mouth, "psst"
    }
    // the ending: watches her go… shrug
    if (t >= K.end + 0.1) {
      f.look = t > K.leave ? [1, 0] : [0.85, -0.2]; f.turn = t > K.leave ? 0.55 : 0.45;
      f.eye = 1.15; f.pupil = 1.2; f.brow = 0.5; f.browTilt = 0.3;
      wr = [p.x + 95, p.y - 40]; hR = 'fist';
      const sh = prog(t, 25.9, 26.25, 'outBack');
      if (sh > 0) {
        wl = [lerp(wl[0], p.x - 140, sh), lerp(wl[1], p.y - 85, sh)]; wr = [lerp(wr[0], p.x + 140, sh), lerp(wr[1], p.y - 85, sh)];
        hL = 'open'; hR = 'open'; rL = -95; rR = 95; p.sqY = 1 + 0.035 * sh; p.headTilt += 6 * sh; f.mouth = 'flat'; f.brow = 0.8; f.browTilt = 0.1; f.turn = 0.2; f.look = [0, 0];
      }
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotR = rR; p.handRotL = rL; p.thumbR = -1; p.thumbL = 1;
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) {
      f.mouth = s.mouth; f.open = s.open;
      if (t >= WHISPER[0] - 0.05) { f.open = s.open * 0.45; if (f.mouth === 'o') f.open *= 0.8; }   // whisper: softer, smaller
    }
    p.face = f;
    return p;
  }

  // ---------------- stewardess ----------------
  function stewPose(t) {
    // leaving at the end: turns and walks off towards the front galley (out of frame, right)
    const walkK = prog(t, K.leave + 0.25, T.duration, 'linear');
    const walking = t > K.leave + 0.25;
    const ph = (t - K.leave) * Math.PI * 2 * 1.7, amp = walking ? Math.min(1, (t - K.leave - 0.25) * 4) : 0;
    const hip = STEW.feet - (138 + 128 + 14) * STEW.sc;
    // at the start she's already turning away (end of scene 2)
    const turnBack = prog(t, 2.0, 2.7, 'inOut');
    const p = Object.assign({ x: STEW.x + 30 * (1 - turnBack) + walkK * 520, y: hip - Math.abs(Math.sin(ph)) * 9 * amp + walkK * 40, sc: STEW.sc * (1 + walkK * 0.12) }, STEW_LOOK);
    p.legL = [-6 + 18 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 16 * amp]; p.legR = [6 - 18 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 16 * amp];
    p.lean = wob(t, 0.4, 3);
    p.headTilt = -4 + wob(t, 0.5, 5) * 1.5;
    const f = { turn: lerp(0.5, -0.45, turnBack), look: [lerp(0.9, -0.85, turnBack), 0.15], mouth: 'flat', open: 0, brow: 0.3, browTilt: 0.1, eye: 1.0, pupil: 0.9, lid: 0.25 };
    f.blink = blink(t, [5.2, 11.3, 16.0]);
    let wl = [p.x - 18, p.y - 50], wr = [p.x + 18, p.y - 55], hL = 'fist', hR = 'fist', rL = 0, rR = 0;
    // start: lowering the hand from the facepalm
    const lower = prog(t, 0, 0.5);
    if (t < 0.5) { const head = CH.headPos(p); wr = [lerp(head[0] + 8, wr[0], lower), lerp(head[1] - 12, wr[1], lower)]; hR = 'open'; rR = 180; }
    // "Sir… WHAT NOW?!" — slow turn, then snaps
    if (t >= K.sir - 0.1 && t < 3.7) {
      f.lid = 0.35; f.brow = 0.2; f.browTilt = -0.35;
      if (t >= K.whatNow - 0.05) { const k = prog(t, K.whatNow - 0.05, K.whatNow + 0.15, 'outBack'); f.eye = lerp(1, 1.25, k); f.lid = 0; f.browTilt = -0.7; f.pupil = 0.75; p.headTilt -= 5 * k; }
      const hips = prog(t, K.whatNow - 0.1, K.whatNow + 0.15, 'outBack');   // hands on hips
      wl = [lerp(wl[0], p.x - 78, hips), lerp(wl[1], p.y - 10, hips)]; wr = [lerp(wr[0], p.x + 78, hips), lerp(wr[1], p.y - 10, hips)];
    }
    if (t >= 3.7 && t < K.no1 - 0.1) { f.lid = 0.3; f.brow = 0.25; f.browTilt = -0.4; f.eye = 1.05; wl = [p.x - 78, p.y - 10]; wr = [p.x + 78, p.y - 10]; }
    // "NO! We're flying at thirty thousand feet!" — eyes wide, points up high
    if (t >= K.no1 - 0.1 && t < 9.4) {
      const k = prog(t, K.no1 - 0.1, K.no1 + 0.12, 'outBack');
      f.eye = lerp(1.05, 1.4, k); f.pupil = 0.55; f.brow = 1.0; f.browTilt = 0.1; f.lid = 0;
      const pt = prog(t, K.k30 - 0.2, K.k30 + 0.1, 'outBack') * (1 - prog(t, 9.1, 9.4));
      const no = prog(t, K.no1 - 0.1, K.no1 + 0.1, 'outBack') * (1 - prog(t, K.k30 - 0.3, K.k30 - 0.1));
      wl = [lerp(wl[0], p.x - 110, no), lerp(wl[1], p.y - 170, no)]; wr = [lerp(wr[0], p.x + 110, no), lerp(wr[1], p.y - 170, no)];
      if (no > 0.5) { hL = 'open'; hR = 'open'; rL = 180; rR = 180; }
      if (pt > 0) { wr = [lerp(wr[0], p.x + 105, pt), lerp(wr[1], p.y - 330, pt)]; hR = 'point'; rR = 180; wl = [lerp(wl[0], p.x - 78, pt), lerp(wl[1], p.y - 10, pt)]; hL = 'fist'; }
    }
    if (t >= 9.4 && t < K.what2 - 0.1) { f.eye = 1.15; f.lid = 0.15; f.brow = 0.55; f.browTilt = 0.2; wl = [p.x - 78, p.y - 10]; wr = [p.x + 78, p.y - 10]; }
    // "WHAT?! NO!!!" — total shock, arms flung wide
    if (t >= K.what2 - 0.1 && t < 14.2) {
      const k = prog(t, K.what2 - 0.1, K.what2 + 0.12, 'outBack');
      f.eye = lerp(1.1, 1.55, k); f.pupil = 0.42; f.brow = 1.2; f.browTilt = 0.15; f.lid = 0;
      if (t < K.what2 + 0.4) p.y -= Math.sin(prog(t, K.what2 - 0.1, K.what2 + 0.4, 'linear') * Math.PI) * 16;
      const wide = prog(t, K.no2 - 0.15, K.no2 + 0.05, 'outBack');
      const k2 = Math.max(k * 0.5, wide);
      wl = [lerp(wl[0], p.x - 165, k2), lerp(wl[1], p.y - 140, k2)]; wr = [lerp(wr[0], p.x + 165, k2), lerp(wr[1], p.y - 140, k2)];
      hL = 'open'; hR = 'open'; rL = 180; rR = 180;
    }
    if (t >= 14.2 && t < K.sirP - 0.1) { f.eye = 1.2; f.pupil = 0.6; f.lid = 0.1; f.brow = 0.35; f.browTilt = -0.5; f.mouth = 'tight'; wl = [p.x - 78, p.y - 10]; wr = [p.x + 78, p.y - 10]; }
    // CLIMAX: "SIR! PLEASE! STOP ASKING STUPID QUESTIONS!!!"
    if (t >= K.sirP - 0.1 && t < 21.1) {
      const k = prog(t, K.sirP - 0.1, K.sirP + 0.1, 'outBack');
      f.eye = lerp(1.2, 1.38, k); f.pupil = 0.5; f.brow = -0.45; f.browTilt = -1.6; f.lid = 0;     // eyes wide, brows slammed down
      p.lean = -6 * k;
      // SIR! — points at him
      const pt = prog(t, K.sirP - 0.1, K.sirP + 0.1, 'outBack') * (1 - prog(t, K.please - 0.15, K.please));
      if (pt > 0) { wl = [lerp(wl[0], p.x - 170, pt), lerp(wl[1], p.y - 160, pt)]; hL = 'point'; rL = 265; }
      // PLEASE! — palms together, pleading-angry
      const pl = prog(t, K.please - 0.15, K.please + 0.05, 'outBack') * (1 - prog(t, K.stop - 0.12, K.stop));
      if (pl > 0) { wl = [lerp(wl[0], p.x - 22, pl), lerp(wl[1], p.y - 140, pl)]; wr = [lerp(wr[0], p.x + 22, pl), lerp(wr[1], p.y - 140, pl)]; hL = 'open'; hR = 'open'; rL = 180; rR = 180; }
      // STOP — flat hand out
      const st = prog(t, K.stop - 0.12, K.stop + 0.05, 'outBack') * (1 - prog(t, K.stupid - 0.15, K.stupid));
      if (st > 0) { wr = [lerp(wr[0], p.x + 150, st), lerp(wr[1], p.y - 190, st)]; hR = 'open'; rR = 180; wl = [lerp(wl[0], p.x - 78, st), lerp(wl[1], p.y - 10, st)]; hL = 'fist'; }
      // STUPID — both fists shaking up by the head
      const su = prog(t, K.stupid - 0.15, K.stupid + 0.05, 'outBack') * (1 - prog(t, K.questions + 0.1, K.questions + 0.3));
      if (su > 0) {
        const sh = Math.sin((t - K.stupid) * 45) * 10;
        wl = [lerp(wl[0], p.x - 170 + sh, su), lerp(wl[1], p.y - 150, su)]; wr = [lerp(wr[0], p.x + 170 + sh, su), lerp(wr[1], p.y - 150, su)]; hL = 'fist'; hR = 'fist';
        p.sqY = 1 + 0.03 * Math.abs(Math.sin((t - K.stupid) * 20)); p.y -= 8 * su;
      }
      // QUESTIONS — arms out, then heaving breath
      const q = prog(t, K.questions + 0.1, K.questions + 0.35, 'outBack');
      if (q > 0) { wl = [lerp(wl[0], p.x - 150, q), lerp(wl[1], p.y - 100, q)]; wr = [lerp(wr[0], p.x + 150, q), lerp(wr[1], p.y - 100, q)]; hL = 'open'; hR = 'open'; rL = -95; rR = 95; }
      if (t > 20.7) { p.sqY = 1 + 0.03 * Math.sin((t - 20.7) * 9); f.mouth = 'tight'; }        // heavy breathing, glaring
    }
    // during the whisper: glaring, breathing
    if (t >= 21.1 && t < K.end + 0.05) {
      f.eye = 1.15; f.pupil = 0.65; f.brow = 0.05; f.browTilt = -0.85; f.lid = 0.1; f.mouth = 'tight';
      p.sqY = 1 + 0.02 * Math.sin(t * 7); wl = [p.x - 78, p.y - 10]; wr = [p.x + 78, p.y - 10];
    }
    // the end: freeze… one eye twitches… facepalm… walks off
    if (t >= K.end + 0.05) {
      f.mouth = 'flat'; f.eye = 1.05; f.pupil = 0.6; f.lid = 0.25; f.brow = 0.15; f.browTilt = -0.2;
      f.twitchR = t > K.twitch && t < K.palm + 0.1 ? 0.5 + 0.5 * Math.sin(t * 55) : 0;
      wl = [p.x - 30, p.y - 45]; wr = [p.x + 30, p.y - 50];
      const fp = prog(t, K.palm, K.palm + 0.4, 'inOut') * (1 - prog(t, K.leave, K.leave + 0.25));
      if (fp > 0) { const head = CH.headPos(p); wr = [lerp(wr[0], head[0] + 8, fp), lerp(wr[1], head[1] - 12, fp)]; hR = 'open'; rR = 180; p.headTilt += 10 * fp; if (fp > 0.7) f.sleep = true; }
      if (t > K.leave) {
        f.turn = 0.6; f.look = [1, 0.1]; f.sleep = false; f.lid = 0.3;
        wl = [p.x - 60 - 14 * Math.sin(ph) * amp, p.y - 20]; wr = [p.x + 60 + 14 * Math.sin(ph) * amp, p.y - 20];
      }
    }
    p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1);
    p.handL = hL; p.handR = hR; p.handRotL = rL; p.handRotR = rR; p.thumbL = 1; p.thumbR = -1;
    const s = LIPSYNC.talk(T, t, STEW_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    // shouted words: bigger mouth
    if (s && s.mouth && t >= K.sirP) f.open = Math.min(1, s.open * 1.15 + 0.1);
    p.face = f;
    return p;
  }

  // ---------------- camera ----------------
  const CAM = [
    [0, [320, 1215, 1.55]], [1.98, [325, 1210, 1.62], 'sine'],                         // Alex: "Wait! One last question!"
    [2.0, [870, 1170, 1.9]], [2.6, [870, 1165, 1.95], 'sine'], [2.85, [870, 1150, 2.35], 'outBack'], [3.75, [870, 1150, 2.4], 'sine'],   // "Sir… WHAT NOW?!"
    [3.77, [215, 1200, 1.5], 'step'], [6.4, [210, 1200, 1.58], 'sine'],                // Alex points at the window
    [6.42, [870, 1150, 2.15], 'step'], [9.4, [870, 1145, 2.25], 'sine'],              // "NO! We're flying at 30,000 feet!"
    [9.42, [520, 1190, 1.18], 'step'], [12.42, [530, 1185, 1.24], 'sine'],            // Alex: "…open the door a little?"
    [12.44, [870, 1150, 2.2], 'step'], [12.65, [870, 1140, 2.5], 'outBack'], [14.15, [870, 1140, 2.55], 'sine'],   // "WHAT?! NO!!!"
    [14.17, [215, 1200, 1.5], 'step'], [17.25, [220, 1200, 1.6], 'sine'],             // "That's weird… how do you get fresh air?"
    [17.27, [870, 1150, 2.3], 'step'], [19.4, [870, 1140, 2.45], 'sine'], [19.6, [870, 1125, 2.8], 'outBack'], [20.72, [870, 1125, 2.85], 'sine'],   // CLIMAX
    [20.74, [300, 1210, 2.0], 'step'], [23.1, [300, 1200, 2.3], 'sine'],              // Alex: frozen… then the whisper
    [23.12, [870, 1160, 2.0], 'step'], [24.93, [870, 1160, 2.1], 'sine'],             // stew: twitch, facepalm
    [24.95, [600, 1180, 1.05], 'step'], [T.duration, [600, 1180, 1.08], 'sine'],      // she walks off; Alex shrugs
  ];

  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const c = kf(t, CAM);
    let shake = 0;
    if (t > K.whatNow && t < K.whatNow + 0.4) shake += 6 * Math.exp(-(t - K.whatNow) * 8);
    if (t > K.what2 && t < K.what2 + 0.5) shake += 8 * Math.exp(-(t - K.what2) * 7);
    if (t > K.stupid && t < K.stupid + 0.8) shake += 14 * Math.exp(-(t - K.stupid) * 5);
    const cam = { cx: c[0] + Math.sin(t * 61) * shake, cy: c[1] + Math.cos(t * 47) * shake, z: c[2] };
    const ap = alexPose(t), sp = stewPose(t);
    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, AIR.defs());
    o.push(`<g transform="translate(540 960) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(AIR.cabin(t + 34.2));          // continuous idle cycles after scenes 1 (17.2 s) and 2 (17.0 s)
    o.push(AIR.rowBack());
    o.push(CH.figure(ap));
    o.push(AIR.rowFront());
    o.push(`<ellipse cx="${f1(sp.x)}" cy="${f1(STEW.feet + 20 + (sp.sc / STEW.sc - 1) * 300)}" rx="110" ry="16" fill="#000" opacity=".2" filter="url(#fBlurA)"/>`);
    o.push(CH.figure(sp));
    o.push('</g>');
    o.push(`<defs><radialGradient id="gVigA" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a1410" stop-opacity=".28"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigA)"/>`);
    svg.innerHTML = o.join('');
  };
})();
