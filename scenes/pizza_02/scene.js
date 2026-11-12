// "Alex Orders a Pizza" — Scene 2: "Okay… is pepperoni all right?" … "Six. I can't eat eight." … "I see."
// Audio: assets/audio/pizza_voiceover_full.mp3, 10.5s–19.3s (+0.9 s). Uses the shared set in lib/pizza.js.
(function () {
  const { prog, blink, lerp } = A;
  const T = window.TIMING;
  const OP_LINES = [[0.15, 0.86], [1.2, 2.43], [3.47, 5.7], [8.0, 8.6]];
  const ALEX_LINES = [[2.67, 3.13], [5.97, 7.56]];
  const SHOTS = [[0, 'op'], [2.55, 'alex'], [3.35, 'op'], [5.82, 'alex'], [7.72, 'op']];
  const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
  const CALL0 = 10.5;     // call timer continues from scene 1

  function alex(t) {
    const a = PIZZA.alexBase(t + CALL0), f = a.p.face;
    f.blink = blink(t, [1.8, 4.6, 8.9]);
    if (t >= 2.5 && t < 3.4) { f.brow = 0.6; f.eye = 1.15; }                     // "All right!" — happy
    if (t >= 5.8) {
      // "Six." — thinks (eyes up), then very serious: "I can't eat eight."
      const think = t < 6.6;
      f.look = think ? [0.35, -0.8] : [0, 0]; f.brow = think ? 0.55 : 0.25; f.browTilt = think ? 0 : -0.1; f.mouth = 'flat';
      a.p.headTilt += think ? 6 : 0;
      if (t > 7.6) { f.mouth = 'smile'; f.brow = 0.4; }
    }
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    return a;
  }
  function op(t) {
    const p = PIZZA.opBase(t + CALL0, t > 3.4 && t < 5.7), f = p.face;
    f.blink = blink(t, [1.0, 4.9]);
    if (t < 1.1) { f.lid = 0.2; f.brow = 0.3; }                                  // "Okay…" a touch tired
    if (t >= 1.1 && t < 3.4) { f.brow = 0.5; f.eye = 1.08; }                     // "Is pepperoni all right?"
    if (t >= 3.4 && t < 7.7) { f.look = [0.5, 0.4]; f.brow = 0.4; }             // typing the order
    if (t >= 7.72) {
      // the long pause after "I can't eat eight." — frozen stare, then a flat "I see."
      f.look = [0, 0]; f.turn = 0; f.mouth = 'flat'; f.eye = 1.18; f.pupil = 0.7; f.brow = 0.55; f.browTilt = 0.1;
      p.headTilt = 0; p.lean = 0;
      if (t > 8.0) { f.lid = 0.3; f.eye = 1.05; f.brow = 0.35; }
      f.blink = blink(t, [9.1]);
    }
    const s = LIPSYNC.talk(T, t, OP_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    return p;
  }
  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const [t0, who] = shotAt(t);
    let html = PIZZA.frame(t + CALL0, who, t - t0, who === 'alex' ? alex(t) : null, who === 'op' ? op(t) : null);
    if (who === 'op') html += PIZZA.callBadge(t + CALL0);
    svg.innerHTML = html;
  };
})();
