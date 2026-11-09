// Animation helpers shared by all scenes.
(function (g) {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    linear: k => k,
    in: k => k * k * k,
    out: k => 1 - Math.pow(1 - k, 3),
    inOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    sine: k => -(Math.cos(Math.PI * k) - 1) / 2,
    outBack: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    outElastic: k => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
    step: k => (k < 1 ? 0 : 1),
  };
  function mix(a, b, k) {
    if (typeof a === 'number') return lerp(a, b, k);
    if (Array.isArray(a)) return a.map((v, i) => mix(v, b[i], k));
    if (a && typeof a === 'object') { const o = {}; for (const key in a) o[key] = key in b ? mix(a[key], b[key], k) : a[key]; return o; }
    return k < 0.5 ? a : b;
  }
  // keyframes: [[time, value, easeIntoThisKey?], ...]
  function kf(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const k = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
        return mix(v0, v1, (E[e || 'inOut'])(clamp(k)));
      }
    }
    return keys[keys.length - 1][1];
  }
  // 0..1 progress of t inside [a,b] with easing
  const prog = (t, a, b, e = 'inOut') => E[e](clamp((t - a) / (b - a)));
  // blink: returns 0..1 closedness for list of blink start times
  function blink(t, times, d = 0.16) {
    let v = 0;
    for (const s of times) { const k = (t - s) / d; if (k > 0 && k < 1) v = Math.max(v, Math.sin(k * Math.PI)); }
    return v;
  }
  // deterministic noise for idle motion
  const wob = (t, f = 1, seed = 0) => Math.sin(t * f * 2.1 + seed) * 0.6 + Math.sin(t * f * 3.7 + seed * 2.3) * 0.4;
  const f1 = v => (Math.round(v * 10) / 10).toString();
  g.A = { clamp, lerp, E, mix, kf, prog, blink, wob, f1 };
})(window);
