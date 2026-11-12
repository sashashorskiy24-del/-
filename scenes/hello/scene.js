// "Hello" — 5 s: Alex waves at the camera with a fingerless hand and says "Привет!" (silent track, speech bubble).
(function () {
  const { kf, prog, blink, lerp, f1 } = A;
  const LOOK = { smooth: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.18, handSc: 1.5 };   // same Alex as "First Flight"
  const SAY = [1.25, 1.95];   // when he says "При-вет!"

  function alex(t) {
    const p = Object.assign({ x: 470, y: 1230, sc: 1.85 }, LOOK);
    const S = p.sc;
    p.legL = [-8, 2]; p.legR = [8, -2];
    const bob = Math.sin(t * 2.2);
    p.y += Math.abs(bob) * -6; p.lean = bob * 1.5;
    // left hand relaxed on the hip
    p.armL = CH.armIK(p, -1, p.x - 85 * S, p.y - 22 * S, -1); p.handL = 'mitt'; p.handRotL = 0;
    // right arm: raises, then waves (forearm swings side to side), lowers at the end
    const up = prog(t, 0.3, 0.75, 'outBack') * (1 - prog(t, 4.35, 4.85));
    const wave = Math.sin((t - 0.75) * 9) * prog(t, 0.7, 0.9) * (1 - prog(t, 4.1, 4.4));
    const wx = p.x + (170 + wave * 30) * S, wy = p.y - (232 - Math.abs(wave) * 10) * S;   // forearm up, beside the head   // beside the head, never behind it
    const rest = [p.x + 85 * S, p.y - 22 * S];
    p.armR = CH.armIK(p, 1, lerp(rest[0], wx, up), lerp(rest[1], wy, up), -1);   // elbow out to the side
    p.handR = 'mitt'; p.handRotR = up > 0.5 ? 180 + wave * 22 : 0;   // palm continues the forearm upwards
    // face
    const f = { turn: 0, look: [0, 0], mouth: 'smile', open: 0, brow: 0.45, browTilt: 0, eye: 1.1, pupil: 1.15 };
    f.blink = blink(t, [0.2, 2.8, 4.6]);
    p.headTilt = Math.sin(t * 1.8) * 4 + up * 4;
    if (t >= SAY[0] && t <= SAY[1]) {
      // "при" (small) — "вет" (wide)
      const k = (t - SAY[0]) / (SAY[1] - SAY[0]);
      f.mouth = 'open';
      f.open = k < 0.42 ? Math.sin(k / 0.42 * Math.PI) * 0.45 : Math.sin((k - 0.42) / 0.58 * Math.PI) * 0.8;
      f.brow = 0.7;
    }
    if (t > SAY[1]) { f.mouth = 'smile'; f.brow = 0.55; }
    p.face = f;
    return p;
  }

  function bubble(t, head) {
    const k = prog(t, SAY[0] - 0.05, SAY[0] + 0.25, 'outBack') * (1 - prog(t, 4.4, 4.75, 'in'));
    if (k <= 0) return '';
    const x = head[0] + 120, y = head[1] - 400;
    return `<g transform="translate(${f1(x)} ${f1(y + Math.sin(t * 2.5) * 6)}) scale(${f1(k)})">` +
      `<path d="M-200 -90Q-200 -120 -170 -120H170Q200 -120 200 -90V60Q200 90 170 90H-20L-120 170L-110 90H-170Q-200 90 -200 60Z" fill="#fff" stroke="#141414" stroke-width="10" stroke-linejoin="round"/>` +
      `<text x="0" y="22" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="78" fill="#141414">Привет!</text></g>`;
  }

  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const p = alex(t);
    const head = CH.headPos(p);
    const z = kf(t, [[0, 1.0], [5, 1.06, 'sine']]);
    svg.innerHTML = `<defs>${CH.defs()}<radialGradient id="gBgH" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#fff6dd"/><stop offset="1" stop-color="#f2c98a"/></radialGradient></defs>` +
      `<rect width="1080" height="1920" fill="url(#gBgH)"/>` +
      `<g transform="translate(540 960) scale(${z.toFixed(4)}) translate(-540 -960)">` +
      `<ellipse cx="470" cy="1765" rx="300" ry="38" fill="#000" opacity=".15"/>` +
      CH.figure(p) + bubble(t, head) + `</g>`;
  };
})();
