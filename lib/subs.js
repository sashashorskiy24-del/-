// Word-by-word karaoke subtitles (HTML overlay), shared by scenes.
// phrases: [{ w: [firstWordIdx, lastWordIdx], cls?: 'mom'|'thought'|..., text?: {idx: 'override'}, until?: sec }]
(function (g) {
  const { prog } = A;
  function makeSubs(T, phrases) {
    const W = T.words;
    phrases.forEach((p, i) => {
      p.s = W[p.w[0]].s - 0.12;
      const next = phrases[i + 1];
      p.e = next ? Math.min(W[next.w[0]].s - 0.12, W[p.w[1]].e + 0.6) : T.duration + 1;
      if (p.until != null) p.e = p.until;
    });
    return function (t) {
      const p = phrases.find(p => t >= p.s && t < p.e);
      if (!p) return '';
      const inK = prog(t, p.s, p.s + 0.18, 'outBack');
      const outK = 1 - prog(t, p.e - 0.12, p.e, 'in');
      let html = '';
      for (let i = p.w[0]; i <= p.w[1]; i++) {
        const txt = (p.text && p.text[i]) || W[i].w;
        const active = t >= W[i].s - 0.03 && (i === p.w[1] || t < W[i + 1].s - 0.03);
        const done = t >= W[i].s - 0.03;
        const pk = prog(t, W[i].s - 0.03, W[i].s + 0.12, 'outBack');
        const sc = active ? 1.04 + 0.12 * Math.sin(pk * Math.PI) : 1;
        html += `<span class="w${active ? ' on' : ''}${done ? '' : ' todo'}" style="transform:scale(${sc.toFixed(3)})">${txt}</span> `;
      }
      return `<div class="phrase ${p.cls || ''}" style="opacity:${outK.toFixed(3)};transform:translateY(${((1 - inK) * 30).toFixed(1)}px) scale(${(0.9 + 0.1 * inK).toFixed(3)})">${html}</div>`;
    };
  }
  // One big word at a time (short-video style). opts.text: {wordIdx: 'override'}
  function makeWordSubs(T, opts = {}) {
    const W = T.words;
    return function (t) {
      let i = -1;
      for (let k = 0; k < W.length; k++) {
        const nxt = W[k + 1] ? W[k + 1].s : Infinity;
        if (t >= W[k].s - 0.02 && t < Math.min(nxt - 0.02, W[k].e + 0.35)) { i = k; break; }
      }
      if (i < 0) return '';
      let txt = (opts.text && opts.text[i]) || W[i].w;
      txt = txt.replace(/[.,;:“”"]/g, '').toUpperCase();
      const k = prog(t, W[i].s - 0.02, W[i].s + 0.14, 'outBack');
      return `<div class="word" style="transform:scale(${(0.6 + 0.4 * k).toFixed(3)})">${txt}</div>`;
    };
  }
  g.SUBS = { makeSubs, makeWordSubs };
})(window);
