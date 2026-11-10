// Lip-sync from the real voice-over: mouth opening follows the loudness envelope
// (timing.json env, 30 fps), only inside the speaker's own time windows.
(function (g) {
  const { clamp } = A;
  const O_WORDS = /^(no|go|home|food|don'?t|do|you|to|oh|so|wow|who|whoa|now|out|how)$/i;
  // windows: [[start, end], ...]  -> returns null when the character must keep the mouth shut
  function talk(T, t, windows) {
    const w = windows.find(([a, b]) => t >= a - 0.03 && t <= b + 0.04);
    if (!w) return null;
    const f = Math.round(t * T.fps), E = T.env;
    const e = Math.max(E[f] || 0, 0.6 * (E[f - 1] || 0));       // tiny hold so the mouth doesn't flicker
    const open = clamp((e - 0.14) / 0.62);
    const word = T.words.find(x => t >= x.s - 0.02 && t <= x.e + 0.02);
    const clean = word ? word.w.replace(/[^a-z']/gi, '') : '';
    const shape = O_WORDS.test(clean) ? 'o' : 'open';
    return { mouth: open < 0.06 ? null : shape, open: shape === 'o' ? open * 0.9 : open };
  }
  g.LIPSYNC = { talk };
})(window);
