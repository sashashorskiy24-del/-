// "Alex Orders a Pizza" — Scene 3 (final): the address … "That's a bit long… Oh well, I'll wait."
// Audio: assets/audio/pizza_voiceover_full.mp3, 19.3s–end (41.48s) + 1.6 s end beat. Uses lib/pizza.js.
(function () {
  const { prog, blink, lerp } = A;
  const T = window.TIMING;
  const OP_LINES = [[0.1, 1.43], [4.37, 5.66], [9.4, 11.33], [15.8, 19.1]];
  const ALEX_LINES = [[1.63, 4.0], [5.95, 9.06], [11.63, 15.4], [19.44, 21.93]];
  const SHOTS = [[0, 'op'], [1.52, 'alex'], [4.22, 'op'], [5.85, 'alex'], [9.25, 'op'], [11.5, 'alex'], [15.62, 'op'], [19.3, 'alex']];
  const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
  const CALL0 = 19.3;

  function alex(t) {
    const a = PIZZA.alexBase(t + CALL0), f = a.p.face;
    f.blink = blink(t, [3.2, 7.9, 12.9, 17.0, 21.0]);
    // "Don't you know it? I'm the one calling you!" — honestly surprised
    if (t >= 1.5 && t < 4.2) { f.brow = 0.8; f.browTilt = 0.15; f.eye = 1.18; f.pupil = 1.0; }
    // "That's weird… Then how will you know where to bring the pizza?" — puzzled
    if (t >= 5.8 && t < 9.25) { f.brow = 0.55; f.browTilt = 0.45; f.look = t < 6.9 ? [0.4, -0.6] : [0, 0]; a.p.headTilt += 7; f.mouth = 'flat'; }
    // "Okay, one second…" — remembering (eyes up) … "New York, Maple Street, number twelve." — proud
    if (t >= 11.5 && t < 15.6) {
      const think = t < 13.1;
      f.look = think ? [-0.35, -0.85] : [0, 0]; f.brow = think ? 0.6 : 0.45; f.mouth = think ? 'flat' : 'smile';
      a.p.headTilt += think ? -6 : 0;
    }
    // "That's a bit long…" — small frown … "Oh well, I'll wait." — content
    if (t >= 19.3) {
      const ok = t > 20.6;
      f.brow = ok ? 0.45 : 0.35; f.browTilt = ok ? 0 : 0.5; f.mouth = ok ? 'smile' : 'frown';
      f.look = ok ? [0, 0] : [0.5, 0.3];
      if (t > 22.0) { f.lid = 0.2; f.mouth = 'smile'; a.p.headTilt += Math.sin(prog(t, 22.0, 23.0, 'linear') * Math.PI * 2) * 4; }   // little nod
    }
    const s = LIPSYNC.talk(T, t, ALEX_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    return a;
  }
  function op(t) {
    const typing = (t > 13.0 && t < 15.6) || (t > 15.8 && t < 16.8);
    const p = PIZZA.opBase(t + CALL0, typing), f = p.face;
    f.blink = blink(t, [0.9, 5.2, 10.2, 17.6]);
    if (t < 1.5) { f.brow = 0.45; }                                               // "Can I have your address, please?"
    if (t >= 4.22 && t < 5.85) { f.lid = 0.3; f.brow = 0.25; f.mouth = 'flat'; } // "No… we don't." — tired
    // "Sir… just tell me your address." — patience running out
    if (t >= 9.25 && t < 11.5) {
      f.lid = t < 9.9 ? 0.55 : 0.25; f.brow = 0.15; f.browTilt = -0.3; f.mouth = 'tight'; f.look = [0, 0];
      p.headTilt = 0;
    }
    // "Great, all done. Your pizza will be there in about twenty minutes." — relieved
    if (t >= 15.62) { f.brow = 0.5; f.browTilt = 0; f.eye = 1.08; f.mouth = 'smile'; f.look = t < 16.8 ? [0.5, 0.4] : [0.2, 0]; }
    const s = LIPSYNC.talk(T, t, OP_LINES);
    if (s && s.mouth) { f.mouth = s.mouth; f.open = s.open; }
    return p;
  }
  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const [t0, who] = shotAt(t);
    let html = PIZZA.frame(t + CALL0, who, t - t0, who === 'alex' ? alex(t) : null, who === 'op' ? op(t) : null);
    if (who === 'op') html += PIZZA.callBadge(t + CALL0);
    // ending: gentle fade to black
    const fade = prog(t, T.duration - 0.6, T.duration - 0.05, 'in');
    if (fade > 0) html += `<rect width="1080" height="1920" fill="#000" opacity="${fade.toFixed(3)}"/>`;
    svg.innerHTML = html;
  };
})();
