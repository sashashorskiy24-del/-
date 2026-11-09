// Scene 01 — "Sanya wakes up / Mom's pancake thought"
// All timings are in seconds and match the voice-over (see timing.json, words[]).
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;           // word start time by index
  const env = t => T.env[clamp(Math.round(t * T.fps), 0, T.env.length - 1)] || 0;

  const FLOOR = 1380;
  const SANYA_X = 430;

  // ---------------- key moments (from the voice-over) ----------------
  const K = {
    wake: at(14),          // "wakes"            6.24
    sitA: 6.42, sitB: 7.22,
    momIn: at(19) + 0.02,  // "His"              7.6
    walkA: 7.78, walkB: 9.15,
    sweetie: at(25),       // "Sweetie"          9.44
    readyEnd: 11.0,
    but: at(29),           // "But her thoughts" 11.44
    please: at(33),        // "Please don't..."  12.96
    burned: at(37),        // "burned"           14.08
    pancakes: at(39),      // "pancakes"         14.56
    wait: at(41),          // "Wait"             16.0
    what: at(42),          // "WHAT"             16.56
    end: T.duration,
  };

  // ---------------- static background ----------------
  function wallAndWindow(m) {
    const sky0 = mixCol('#3f4f86', '#8cc6f0', m), sky1 = mixCol('#f2a27c', '#fde6bb', m);
    const sunY = lerp(760, 470, m);
    const o = [];
    o.push(`<defs>
      <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e3d0"/><stop offset="1" stop-color="#e3cfb7"/></linearGradient>
      <pattern id="pStripe" width="46" height="40" patternUnits="userSpaceOnUse"><rect width="23" height="40" fill="#fff" fill-opacity=".09"/></pattern>
      <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky0}"/><stop offset="1" stop-color="${sky1}"/></linearGradient>
      <radialGradient id="gSun"><stop offset="0" stop-color="#fff6d8"/><stop offset=".35" stop-color="#ffd77e"/><stop offset="1" stop-color="#ffd77e" stop-opacity="0"/></radialGradient>
      <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79a6b"/><stop offset="1" stop-color="#a97a4f"/></linearGradient>
      <linearGradient id="gCurtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#86ad99"/><stop offset=".25" stop-color="#9cc1ad"/><stop offset=".5" stop-color="#7fa691"/><stop offset=".75" stop-color="#9cc1ad"/><stop offset="1" stop-color="#7a9f8b"/></linearGradient>
      <linearGradient id="gHall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe1b4"/><stop offset="1" stop-color="#e9b77d"/></linearGradient>
      <linearGradient id="gBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c6" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c6" stop-opacity="0"/></linearGradient>
      <radialGradient id="gLamp"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
      <filter id="fBlur8"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="fBlur20"><feGaussianBlur stdDeviation="22"/></filter>
    </defs>`);
    o.push(`<rect x="-700" y="-700" width="2900" height="${FLOOR + 700}" fill="url(#gWall)"/>`);
    o.push(`<rect x="-700" y="-700" width="2900" height="${FLOOR + 700}" fill="url(#pStripe)"/>`);
    // crown molding
    o.push(`<rect x="-700" y="-80" width="2900" height="26" fill="#f8f1e6"/><rect x="-700" y="-54" width="2900" height="6" fill="#d8c4aa"/>`);
    // window
    o.push(`<rect x="190" y="330" width="400" height="520" rx="10" fill="url(#gSky)"/>`);
    o.push(`<circle cx="400" cy="${f1(sunY)}" r="140" fill="url(#gSun)" opacity="${f1(0.4 + 0.6 * m)}"/>`);
    o.push(`<circle cx="400" cy="${f1(sunY)}" r="44" fill="#ffe7a6"/>`);
    // distant city skyline + clouds
    o.push(`<path d="M190 850V760h40v-40h36v60h30v-90h44v70h34v-50h40v80h30v-30h46v-40h34v70h40v-30h26V850Z" fill="${mixCol('#2c3560', '#a9bcd6', m)}" opacity=".85"/>`);
    o.push(`<g fill="#fff" opacity="${f1(0.35 + 0.5 * m)}"><ellipse cx="290" cy="470" rx="58" ry="18"/><ellipse cx="320" cy="456" rx="34" ry="20"/><ellipse cx="500" cy="560" rx="50" ry="14"/><ellipse cx="520" cy="548" rx="28" ry="16"/></g>`);
    o.push(`<path d="M190 330h400v520H190Z M206 346v488h174V346Z M400 346v488h174V346Z" fill="#fbf7f1" fill-rule="evenodd"/>`);
    o.push(`<rect x="196" y="580" width="388" height="14" fill="#fbf7f1"/>`);
    o.push(`<rect x="170" y="846" width="440" height="26" rx="6" fill="#fbf7f1"/><rect x="170" y="868" width="440" height="6" fill="#d9c7af"/>`);
    // little plant + book on sill
    o.push(`<path d="M480 846l6-44h48l6 44Z" fill="#d9825f"/><path d="M510 802c-20-30-40-30-46-20 16 0 30 8 46 20Zm0 0c4-36 22-50 32-44-12 10-22 24-32 44Zm0 0c18-20 40-22 44-12-16 2-30 6-44 12Z" fill="#5f9a6e"/>`);
    o.push(`<rect x="250" y="826" width="90" height="20" rx="3" fill="#6f8fc9"/><rect x="258" y="808" width="76" height="18" rx="3" fill="#e7b54b"/>`);
    // curtains + rod
    o.push(`<rect x="120" y="292" width="540" height="12" rx="6" fill="#8b6a4b"/><circle cx="118" cy="298" r="12" fill="#8b6a4b"/><circle cx="662" cy="298" r="12" fill="#8b6a4b"/>`);
    o.push(`<path d="M140 300h100c-10 200 30 420 10 640h-120c20-200 -10-420 10-640Z" fill="url(#gCurtain)"/>`);
    o.push(`<path d="M540 300h100c10 220 -20 420 10 640h-120c-20-240 20-420 10-640Z" fill="url(#gCurtain)"/>`);
    // poster (planet)
    o.push(`<rect x="690" y="400" width="220" height="290" rx="8" fill="#fbf7f1"/><rect x="704" y="414" width="192" height="262" fill="#2f3f73"/>`);
    o.push(`<circle cx="800" cy="545" r="54" fill="#f2b84b"/><ellipse cx="800" cy="545" rx="92" ry="18" fill="none" stroke="#f7d38a" stroke-width="8" transform="rotate(-18 800 545)"/>`);
    o.push(`<g fill="#fff"><circle cx="730" cy="440" r="3"/><circle cx="870" cy="460" r="4"/><circle cx="740" cy="640" r="3"/><circle cx="866" cy="630" r="3"/><circle cx="830" cy="430" r="2.5"/></g>`);
    o.push(`<text x="800" y="660" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="22" fill="#fbe7b9" letter-spacing="3">EXPLORE</text>`);
    // shelf with books
    o.push(`<rect x="680" y="840" width="250" height="16" rx="4" fill="#9a6d47"/>`);
    const books = [['#d9655b', 22, 92], ['#6d8fc9', 18, 80], ['#e8b54b', 26, 98], ['#5f9a7e', 20, 86], ['#c784b6', 16, 74]];
    let bx = 700; for (const [c, w, h] of books) { o.push(`<rect x="${bx}" y="${840 - h}" width="${w}" height="${h}" rx="3" fill="${c}"/>`); bx += w + 3; }
    o.push(`<rect x="${bx + 10}" y="790" width="52" height="50" rx="6" fill="#f3efe7"/><path d="M${bx + 36} 790c-8-30 4-40 10-36 0 10-4 22-10 36Z" fill="#5f9a6e"/>`);
    // left corner: big plant
    o.push(`<path d="M-250 1250h150l-18 140h-114Z" fill="#e8dcc8"/><rect x="-262" y="1236" width="174" height="22" rx="8" fill="#d8c8ae"/>`);
    o.push(`<g fill="#4f8a60"><path d="M-175 1240C-260 1150-330 1060-300 960c40 40 110 150 125 280Z"/><path d="M-175 1240C-170 1100-130 980-60 930c10 80-40 220-115 310Z"/><path d="M-175 1240C-230 1120-220 980-180 880c40 90 30 250 5 360Z" fill="#62a173"/></g>`);
    return o.join('');
  }

  function door(open) {
    const x0 = 1110, x1 = 1450, y0 = 520, y1 = FLOOR + 4;
    const o = [];
    o.push(`<rect x="${x0 - 24}" y="${y0 - 24}" width="${x1 - x0 + 48}" height="${y1 - y0 + 24}" rx="6" fill="#f8f2e8"/>`);
    o.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#gHall)"/>`);
    // hallway hint: picture frame and light
    o.push(`<rect x="${x0 + 60}" y="${y0 + 160}" width="110" height="80" rx="4" fill="#e8c18f" stroke="#c99a63" stroke-width="6"/>`);
    o.push(`<ellipse cx="${x0 + 170}" cy="${y0 + 40}" rx="160" ry="60" fill="#fff4d6" opacity=".6" filter="url(#fBlur20)"/>`);
    // door leaf (hinge on the right, swings into the room)
    const th = open * 78 * Math.PI / 180, w = x1 - x0;
    const xf = x1 - w * Math.cos(th), grow = w * Math.sin(th) * 0.11;
    const leaf = `M${x1} ${y0}L${f1(xf)} ${f1(y0 - grow)}L${f1(xf)} ${f1(y1 + grow)}L${x1} ${y1}Z`;
    o.push(`<path d="${leaf}" fill="${open > 0.02 ? '#b98654' : '#c4925f'}" stroke="#8a5d36" stroke-width="5"/>`);
    const px = (k, yy, g) => [f1(x1 - (x1 - xf) * k), f1(yy - g * (1 - (1 - k)) * (yy < (y0 + y1) / 2 ? 1 : -1))];
    for (const [ya, yb] of [[y0 + 70, y0 + 380], [y0 + 450, y1 - 70]]) {
      const ka = 0.14, kb = 0.86;
      const g1 = grow * 0.8;
      o.push(`<path d="M${f1(x1 - (x1 - xf) * ka)} ${f1(ya - g1 * ka)}L${f1(x1 - (x1 - xf) * kb)} ${f1(ya - g1 * kb)}L${f1(x1 - (x1 - xf) * kb)} ${f1(yb + g1 * kb)}L${f1(x1 - (x1 - xf) * ka)} ${f1(yb + g1 * ka)}Z" fill="none" stroke="#a5734a" stroke-width="5"/>`);
    }
    const kx = x1 - (x1 - xf) * 0.9;
    o.push(`<circle cx="${f1(kx)}" cy="${y0 + 430}" r="${f1(9 + 4 * Math.sin(th))}" fill="#f2c45a" stroke="#8a6420" stroke-width="3"/>`);
    return o.join('');
  }

  function floorAndRug() {
    const o = [];
    o.push(`<rect x="-700" y="${FLOOR}" width="2900" height="1400" fill="url(#gFloor)"/>`);
    let y = FLOOR, gap = 34, row = 0;
    while (y < 2700) {
      o.push(`<rect x="-700" y="${f1(y)}" width="2900" height="3" fill="#9c7048" opacity=".45"/>`);
      for (let x = -700 + (row % 2) * 160; x < 2200; x += 320) o.push(`<rect x="${x}" y="${f1(y)}" width="3" height="${f1(gap)}" fill="#9c7048" opacity=".35"/>`);
      y += gap; gap *= 1.12; row++;
    }
    o.push(`<rect x="-700" y="${FLOOR - 26}" width="2900" height="30" fill="#f8f2e8"/><rect x="-700" y="${FLOOR + 2}" width="2900" height="4" fill="#d7c3a8"/>`);
    // rug
    o.push(`<ellipse cx="760" cy="1650" rx="470" ry="96" fill="#b5654a" opacity=".35" filter="url(#fBlur8)"/>`);
    o.push(`<ellipse cx="760" cy="1640" rx="460" ry="92" fill="#d98f6b"/><ellipse cx="760" cy="1640" rx="400" ry="70" fill="none" stroke="#f3c9a2" stroke-width="10" stroke-dasharray="26 16"/><ellipse cx="760" cy="1640" rx="300" ry="48" fill="#e5a682"/>`);
    // slippers
    o.push(`<g transform="translate(330 1490)"><ellipse cx="0" cy="0" rx="46" ry="18" fill="#7fa3c8"/><ellipse cx="-14" cy="-4" rx="24" ry="11" fill="#fff" opacity=".8"/></g>`);
    o.push(`<g transform="translate(430 1510) rotate(8)"><ellipse cx="0" cy="0" rx="46" ry="18" fill="#7fa3c8"/><ellipse cx="-14" cy="-4" rx="24" ry="11" fill="#fff" opacity=".8"/></g>`);
    return o.join('');
  }

  function bed() {
    const o = [];
    o.push(`<ellipse cx="440" cy="1404" rx="420" ry="16" fill="#000" opacity=".12" filter="url(#fBlur8)"/>`);
    o.push(`<rect x="20" y="990" width="80" height="410" rx="34" fill="#6f8fb0"/><rect x="30" y="1000" width="22" height="390" rx="11" fill="#86a5c4"/>`);
    for (const yy of [1060, 1140, 1220]) o.push(`<circle cx="60" cy="${yy}" r="5" fill="#57779a"/>`);
    o.push(`<rect x="70" y="1316" width="760" height="54" rx="10" fill="#a8774f"/><rect x="70" y="1316" width="760" height="10" fill="#bf8c62"/>`);
    o.push(`<rect x="100" y="1368" width="18" height="34" fill="#7f5638"/><rect x="790" y="1368" width="18" height="34" fill="#7f5638"/>`);
    o.push(`<rect x="76" y="1240" width="750" height="82" rx="18" fill="#f5f1ea"/><rect x="76" y="1300" width="750" height="22" rx="10" fill="#e3ddd2"/>`);
    // pillow
    o.push(`<path d="M86 1250C78 1190 96 1150 140 1148H280C318 1150 330 1200 316 1252Z" fill="#fffdf8" stroke="#d9d2c6" stroke-width="5"/><path d="M120 1180q70-14 160 0" fill="none" stroke="#e7e1d6" stroke-width="6" stroke-linecap="round"/>`);
    return o.join('');
  }

  function blanket(s, t) {
    // s: 0 lying (covers body to the neck) .. 1 sitting (covers legs only)
    const breath = Math.sin(t * 2.4) * 4 * (1 - s);
    const lx = lerp(286, 316, s), ly = lerp(1118, 1228, s) + breath;
    const hx = lerp(470, 470, s), hy = lerp(1110, 1196, s) + breath;
    const d = `M${f1(lx)} ${f1(ly)}C${f1(lx + 40)} ${f1(ly - 22)} ${f1(hx - 60)} ${f1(hy - 14)} ${f1(hx)} ${f1(hy)}C${f1(hx + 120)} ${f1(hy + 8)} 640 ${f1(lerp(1150, 1206, s))} 740 1200C800 1196 836 1214 846 1250L858 1352Q800 1370 740 1356Q660 1372 580 1356Q500 1372 420 1356Q340 1372 ${f1(lx - 12)} 1352C${f1(lx - 30)} 1300 ${f1(lx - 20)} ${f1(ly + 40)} ${f1(lx)} ${f1(ly)}Z`;
    let o = `<path d="${d}" fill="#e8b24c" stroke="#b9852c" stroke-width="5" stroke-linejoin="round"/>`;
    o += `<path d="M${f1(lx + 10)} ${f1(ly + 8)}C${f1(lx + 50)} ${f1(ly - 10)} ${f1(hx - 60)} ${f1(hy - 2)} ${f1(hx + 10)} ${f1(hy + 10)}" fill="none" stroke="#f6d38a" stroke-width="10" stroke-linecap="round" opacity=".8"/>`;
    o += `<path d="M560 1250q30 50 10 100M700 1240q24 50 6 110" fill="none" stroke="#c9922f" stroke-width="6" stroke-linecap="round" opacity=".7"/>`;
    // little pattern
    for (const [x, y] of [[420, 1290], [520, 1320], [640, 1280], [760, 1310], [370, 1330], [700, 1340], [600, 1230]]) o += `<circle cx="${x}" cy="${y}" r="6" fill="#fff4d6" opacity=".65"/>`;
    return o;
  }

  function nightstand(t) {
    const o = [];
    o.push(`<rect x="860" y="1180" width="170" height="220" rx="10" fill="#c08a5c"/><rect x="860" y="1180" width="170" height="14" fill="#d39d6e"/><rect x="876" y="1240" width="138" height="60" rx="6" fill="none" stroke="#a5734a" stroke-width="5"/><circle cx="945" cy="1270" r="7" fill="#f2c45a"/>`);
    o.push(`<rect x="878" y="1394" width="14" height="10" fill="#7f5638"/><rect x="998" y="1394" width="14" height="10" fill="#7f5638"/>`);
    o.push(`<circle cx="975" cy="1080" r="170" fill="url(#gLamp)" opacity="${f1(0.75 + 0.05 * Math.sin(t * 3))}"/>`);
    o.push(`<rect x="966" y="1110" width="12" height="70" fill="#d8c3a2"/><ellipse cx="972" cy="1180" rx="34" ry="8" fill="#b79a74"/><path d="M928 1110h88l-14-68h-60Z" fill="#fff1cf" stroke="#e8cf9c" stroke-width="4"/>`);
    // alarm clock
    o.push(`<g transform="translate(900 1150)"><circle r="26" fill="#e7675e"/><circle r="19" fill="#fffaf1"/><path d="M0 0V-12M0 0L9 4" stroke="#333" stroke-width="3" stroke-linecap="round"/><circle cx="-18" cy="-22" r="8" fill="#e7675e"/><circle cx="18" cy="-22" r="8" fill="#e7675e"/></g>`);
    return o.join('');
  }

  function garland(t) {
    const o = [];
    const pts = [];
    for (let i = 0; i <= 60; i++) { const x = -300 + i * 30; const y = 150 + 60 * Math.pow(Math.sin(((x + 300) / 900) * Math.PI), 2); pts.push([x, y]); }
    o.push(`<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}" fill="none" stroke="#6e5a44" stroke-width="3"/>`);
    const cols = ['#ffd36e', '#ffb37a', '#fff0b0'];
    pts.forEach((p, i) => {
      if (i % 2) return;
      const fl = 0.75 + 0.25 * Math.sin(t * 2.2 + i * 1.7);
      o.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1] + 14)}" r="18" fill="${cols[i % 3]}" opacity="${f1(0.28 * fl)}"/>`);
      o.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1] + 14)}" r="7" fill="${cols[i % 3]}"/>`);
    });
    return o.join('');
  }

  function mixCol(a, b, k) {
    const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
    return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join('');
  }

  // ---------------- characters ----------------
  function sanyaPose(t) {
    const s = prog(t, K.sitA, K.sitB, 'inOut');
    const sOver = s + Math.sin(prog(t, K.sitB - 0.1, K.sitB + 0.35, 'linear') * Math.PI) * 0.04;
    const breath = Math.sin(t * 2.4);
    const p = { x: SANYA_X, y: lerp(1166, 1230, s), sc: 0.85, rot: lerp(-90, 0, sOver), legs: false, noArms: s < 0.3 };
    p.headTilt = lerp(64, 0, s) + (1 - s) * breath * 1.5;
    p.lean = 0;

    // arms: under blanket while lying -> hands on lap -> stretch -> lap
    const lapL = [-14, 74], lapR = [14, -74];
    p.armL = kf(t, [[0, [-6, 0]], [K.sitA, [-6, 0]], [K.sitB, lapL], [7.3, lapL], [7.55, [-150, -20], 'out'], [7.9, [-150, -20]], [8.25, lapL]]);
    p.armR = kf(t, [[0, [6, 0]], [K.sitA, [6, 0]], [K.sitB, lapR], [7.3, lapR], [7.55, [150, 20], 'out'], [7.9, [150, 20]], [8.25, lapR]]);
    p.handL = 'fist'; p.handR = 'fist';
    if (t > 7.4 && t < 8.15) { p.handL = 'open'; p.handR = 'open'; }
    p.lean = kf(t, [[7.3, 0], [7.6, -3], [8.2, 0], [K.but, 0], [K.but + 0.5, 4], [K.wait, 4], [K.wait + 0.2, 0]]);

    const f = { turn: 0.0, look: [0, 0], sleep: t < K.wake - 0.12, mouth: 'smile', open: 0, brow: 0, browTilt: 0, eye: 1, pupil: 1, squint: 0 };
    if (t < K.wake - 0.12) { f.mouth = 'o'; f.open = 0.05 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2.4)); }
    // waking: groggy half-open eyes, then a double blink
    f.blink = clamp(1 - prog(t, K.wake - 0.12, K.wake + 0.35, 'out')) * 0.75 + blink(t, [K.wake + 0.5, 6.8, 9.05, 11.2, 13.9]);
    f.turn = kf(t, [[K.sitA, 0], [K.sitB, 0.2], [7.85, 0.2], [8.25, 0.5], [K.wait, 0.5], [K.wait + 0.25, 0.25], [K.what, 0.12]]);
    f.look = kf(t, [[K.wake, [0, -0.2]], [6.9, [0.2, -0.4]], [7.9, [0.3, -0.2]], [8.3, [0.95, -0.15]], [K.but + 0.3, [0.95, -0.15]], [K.please, [0.9, -0.4]], [K.wait, [0.9, -0.3]], [K.wait + 0.25, [0.2, 0]], [K.what, [0, 0.05]]]);
    // yawn while stretching
    if (t > 7.32 && t < 8.05) { f.mouth = 'o'; f.open = Math.sin(prog(t, 7.32, 8.05, 'linear') * Math.PI) * 1.0; f.squint = f.open * 0.8; }
    // reaction arc
    f.brow = kf(t, [[K.but, 0], [K.but + 0.4, 0.35], [K.please, 0.2], [K.burned, 0.5], [K.pancakes, 0.9], [K.wait, 0.7], [K.what, 0.8], [K.what + 0.12, 1.25, 'out']]);
    f.browTilt = kf(t, [[K.but, 0], [K.but + 0.4, -0.25], [K.please + 0.3, 0.1], [K.wait, 0.4], [K.what, 0.4], [K.what + 0.12, 0.6]]);
    f.squint = Math.max(f.squint, kf(t, [[K.but, 0], [K.but + 0.4, 0.3], [K.please + 0.4, 0.15], [K.burned, 0]]));
    f.eye = kf(t, [[K.burned, 1], [K.pancakes + 0.3, 1.12], [K.wait, 1.12], [K.what, 1.15], [K.what + 0.12, 1.5, 'outBack']]);
    f.pupil = kf(t, [[K.burned, 1], [K.pancakes + 0.3, 0.8], [K.wait, 0.7], [K.what, 0.7], [K.what + 0.1, 0.42, 'out']]);
    if (t > K.please + 0.2 && t < K.wait) f.mouth = t > K.pancakes ? 'flat' : 'smile';
    // lip-sync "Wait… WHAT?!"
    if (t >= K.wait - 0.05) {
      const e = env(t);
      if (t < K.what - 0.05) { f.mouth = 'open'; f.open = e * 0.7; }
      else { f.mouth = 'o'; f.open = Math.max(0.55, e * 1.1); }
    }
    // freeze/tremble after "WHAT"
        if (t > K.what) {
      p.sqY = kf(t, [[K.what, 1], [K.what + 0.08, 1.08, 'out'], [K.what + 0.2, 0.97], [K.what + 0.34, 1]]);
      p.sqX = 2 - p.sqY;
      p.armL = kf(t, [[K.what, lapL], [K.what + 0.16, [-128, -30], 'out']]);
      p.armR = kf(t, [[K.what, lapR], [K.what + 0.16, [128, 30], 'out']]);
      p.handL = 'open'; p.handR = 'open';
      p.thumbL = 1; p.thumbR = -1;
      p.x += Math.sin(t * 80) * 1.2 * (t > K.what + 0.3 ? 1 : 0);
    } else if (t > K.wait) {
      // "Wait…": freezes, shoulders up a touch
      p.armL = kf(t, [[K.wait, lapL], [K.wait + 0.3, [-24, 64]]]);
      p.armR = kf(t, [[K.wait, lapR], [K.wait + 0.3, [24, -64]]]);
    }
    p.headTilt += kf(t, [[K.but, 0], [K.but + 0.5, 8], [K.please, 6], [K.wait, 6], [K.wait + 0.25, 0], [K.what, 0], [K.what + 0.12, -4]]);
    p.face = f;
    return { p, s };
  }

  function momPose(t) {
    const walkK = prog(t, K.walkA, K.walkB, 'linear');
    const x = lerp(1300, 1060, E.sine(walkK));
    const walking = t > K.walkA && t < K.walkB + 0.1;
    const amp = walking ? Math.sin(Math.min(1, walkK * 4, (1 - walkK) * 4) * Math.PI / 2) : 0;
    const ph = (t - K.walkA) * Math.PI * 2 * 1.45;
    const p = { kind: 'mom', x, y: 1222 - Math.abs(Math.sin(ph)) * 10 * amp, sc: 0.95 };
    p.legL = [-8 + 20 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 18 * amp];
    p.legR = [8 - 20 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 18 * amp];
    p.lean = -3 * amp + kf(t, [[K.sweetie - 0.2, 0], [K.sweetie + 0.2, -5], [K.readyEnd, -2], [K.please, 0], [K.please + 0.4, 3]]);
    p.itemR = 'spatula'; p.handR = 'fist'; p.handRotR = 180;
    const spatUp = [26, 152];
    const wave = (t > K.sweetie && t < K.readyEnd) ? Math.sin((t - K.sweetie) * 9) * 10 : 0;
    p.armR = kf(t, [[0, spatUp], [K.please - 0.1, spatUp], [K.please + 0.25, [48, 20]], [K.please + 0.5, [14, 6]]]);
    p.armR = [p.armR[0] + wave * 0.5, p.armR[1] + wave];
    p.armBehindR = t > K.please + 0.3;
    // left arm: walk swing -> welcoming gesture -> nervous hand on chest
    const swing = -10 + 14 * Math.sin(ph + Math.PI) * amp;
    p.armL = kf(t, [[0, [swing, 10]], [K.walkB, [-12, 10]], [K.sweetie - 0.15, [-12, 10]], [K.sweetie + 0.35, [-62, -38], 'outBack'], [K.readyEnd + 0.2, [-62, -38]], [K.readyEnd + 0.6, [-18, 20]], [K.please + 0.2, [-18, 20]], [K.please + 0.6, [-35, 138]]]);
    if (t < K.walkB) p.armL = [swing, 10];
    p.handL = 'open'; p.handRotL = t > K.sweetie - 0.1 && t < K.readyEnd + 0.4 ? 70 : 0;
    p.thumbL = 1;
    const f = { turn: -0.4, look: [-0.85, -0.1], mouth: 'smile', open: 0, brow: 0.15, browTilt: 0 };
    f.blink = blink(t, [8.6, 11.3, 12.4, 15.1]);
    p.headTilt = kf(t, [[K.sweetie - 0.2, 0], [K.sweetie + 0.25, -9], [K.readyEnd, -4], [K.please, -2], [K.please + 0.4, 5]]) + wob(t, 0.6, 2) * 1.5;
    if (t > K.sweetie - 0.05 && t < K.readyEnd + 0.05) { f.mouth = 'open'; f.open = env(t) * 0.85; f.brow = 0.35; }
    if (t >= K.please) {
      f.mouth = 'nervous';
      f.look = kf(t, [[K.please, [-0.85, -0.1]], [K.please + 0.25, [0.9, 0.1]], [K.burned - 0.1, [0.9, 0.1]], [K.burned + 0.15, [-0.6, -0.1]], [K.pancakes + 0.3, [-0.6, -0.1]], [K.pancakes + 0.5, [0.9, 0]], [15.4, [0.9, 0]], [15.6, [-0.7, -0.1]]]);
      f.sweat = prog(t, K.please + 0.5, K.please + 0.9, 'outBack');
      f.browTilt = prog(t, K.please, K.please + 0.3) * 0.7;
      f.brow = 0.25;
    }
    p.face = f;
    return p;
  }

  // ---------------- FX ----------------
  function zzz(t, head) {
    if (t > K.wake + 0.2) return '';
    let o = '';
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.5 + i / 3) % 1);
      const fade = Math.sin(k * Math.PI) * (1 - prog(t, K.wake - 0.3, K.wake + 0.1, 'linear'));
      const x = head[0] + 70 + k * 120 + Math.sin(k * 6 + i) * 12, y = head[1] - 70 - k * 190;
      o += `<text x="${f1(x)}" y="${f1(y)}" font-family="Fredoka" font-weight="700" font-size="${f1(34 + k * 34)}" fill="#5f6fb0" opacity="${f1(fade)}" transform="rotate(-12 ${f1(x)} ${f1(y)})">z</text>`;
    }
    return o;
  }

  function telepathy(t, sHead, mHead) {
    const k0 = K.but - 0.05, k1 = K.please + 0.5;
    if (t < k0 || t > k1 + 0.6) return '';
    const fadeAll = 1 - prog(t, k1, k1 + 0.6, 'linear');
    let o = '';
    // glow around Sanya's head
    const g = prog(t, k0, k0 + 0.4) * fadeAll;
    o += `<circle cx="${f1(sHead[0])}" cy="${f1(sHead[1])}" r="${f1(120 + 8 * Math.sin(t * 8))}" fill="#7fe8ff" opacity="${f1(0.18 * g)}" filter="url(#fBlur20)"/>`;
    // rings from mom's head travelling to Sanya
    for (let i = 0; i < 4; i++) {
      const k = ((t - k0) * 0.9 + i / 4) % 1;
      const x = lerp(mHead[0], sHead[0], k), y = lerp(mHead[1], sHead[1], k) - Math.sin(k * Math.PI) * 120;
      const r = 26 + k * 34;
      o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="none" stroke="#9feaff" stroke-width="7" opacity="${f1(Math.sin(k * Math.PI) * 0.85 * g)}"/>`;
    }
    // ripples around Sanya head
    for (let i = 0; i < 3; i++) {
      const k = ((t - k0) * 1.2 + i / 3) % 1;
      o += `<circle cx="${f1(sHead[0])}" cy="${f1(sHead[1])}" r="${f1(110 + k * 90)}" fill="none" stroke="#bff3ff" stroke-width="${f1(6 * (1 - k))}" opacity="${f1((1 - k) * 0.8 * g)}"/>`;
    }
    return o;
  }

  function thoughtBubble(t, mHead) {
    const a = K.please - 0.25, z = K.wait + 0.05;
    if (t < a || t > z + 0.3) return '';
    const pop = prog(t, a + 0.25, a + 0.75, 'outBack') * (1 - prog(t, z, z + 0.25, 'in'));
    const cx = 720, cy = 520;
    let o = '';
    // trailing dots
    const trail = [[mHead[0] - 40, mHead[1] - 130, 16], [mHead[0] - 85, mHead[1] - 190, 24], [mHead[0] - 140, mHead[1] - 250, 32]];
    trail.forEach(([x, y, r], i) => {
      const k = prog(t, a + i * 0.09, a + i * 0.09 + 0.25, 'outBack') * (1 - prog(t, z, z + 0.2, 'in'));
      if (k > 0.01) o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * k)}" fill="#fff" stroke="#1b1b1b" stroke-width="6"/>`;
    });
    if (pop < 0.01) return o;
    const bob = Math.sin(t * 2.2) * 6;
    o += `<g transform="translate(${cx} ${f1(cy + bob)}) scale(${f1(pop)})">`;
    const blobs = [[-200, 10, 110], [-110, -90, 120], [20, -120, 130], [150, -80, 115], [215, 30, 100], [130, 120, 110], [0, 140, 120], [-130, 120, 105]];
    const cloud = blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    o += `<g fill="#1b1b1b">${blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 6}"/>`).join('')}</g>`;
    o += `<g fill="#fffdf7">${cloud}</g><ellipse cx="0" cy="10" rx="250" ry="150" fill="#fffdf7"/>`;
    o += `<ellipse cx="-60" cy="-120" rx="70" ry="22" fill="#fff" opacity=".9"/>`;
    // plate + burnt pancakes
    o += `<ellipse cx="0" cy="110" rx="190" ry="40" fill="#cfd8e3" stroke="#59677a" stroke-width="6"/><ellipse cx="0" cy="104" rx="140" ry="26" fill="#eef2f7"/>`;
    const cakes = [[100, '#22140b'], [62, '#1a0f08'], [24, '#24150c']];
    cakes.forEach(([y, c], i) => {
      o += `<path d="M-130 ${y}C-140 ${y - 40} 140 ${y - 40} 130 ${y}C134 ${y + 30} -134 ${y + 30} -130 ${y}Z" fill="${c}" stroke="#120a05" stroke-width="5"/>`;
      o += `<path d="M-110 ${y + 2}c30 10 60 -6 90 4c24 8 54 -4 80 2" fill="none" stroke="#5a3418" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
      o += `<path d="M-128 ${y}l10 -8 8 6 10 -6M118 ${y - 4}l8 6 6 -8" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round"/>`;
      o += `<circle cx="${-90 + i * 70}" cy="${y + 4}" r="4" fill="#ff7a2e" opacity="${f1(0.6 + 0.4 * Math.sin(t * 9 + i * 2))}"/>`;
      o += `<circle cx="${-60 + i * 40}" cy="${y - 14}" r="9" fill="#0d0805"/><circle cx="${50 - i * 30}" cy="${y - 10}" r="7" fill="#0d0805"/>`;
    });
    // butter melted to ash :)
    o += `<rect x="-22" y="-26" width="44" height="22" rx="5" fill="#5c4a2a" stroke="#120a05" stroke-width="4" transform="rotate(-6)"/>`;
    // smoke
    for (let i = 0; i < 3; i++) {
      const ph = t * 1.6 + i * 2.1;
      const x0 = -60 + i * 60;
      const d = `M${x0} -30C${f1(x0 - 30 + Math.sin(ph) * 12)} -70 ${f1(x0 + 30 + Math.sin(ph + 1) * 12)} -100 ${f1(x0 + Math.sin(ph + 2) * 16)} -140C${f1(x0 - 30 + Math.sin(ph + 3) * 10)} -170 ${f1(x0 + 20)} -190 ${f1(x0 + Math.sin(ph) * 8)} -210`;
      o += `<path d="${d}" fill="none" stroke="#5f646d" stroke-width="${18 - i * 2}" stroke-linecap="round" opacity=".55"/>`;
    }
    // stink lines / heat marks
    o += `<path d="M-190 -10l-24-14M-196 30l-28 0M190 -10l24-14M196 30l28 0" stroke="#e0533f" stroke-width="7" stroke-linecap="round"/>`;
    o += '</g>';
    return o;
  }

  function shockFX(t, cx, cy) {
    if (t < K.what) return '';
    const k = prog(t, K.what, K.what + 0.25, 'out');
    let o = '';
    // manga burst lines (screen space)
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2 + (i % 2) * 0.03;
      const r0 = 520 + (i % 3) * 60 + Math.sin(t * 40 + i) * 18, r1 = 1500;
      const w = 0.018 + (i % 4) * 0.006;
      const p1 = [cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1], p2 = [cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1];
      const p0 = [cx + Math.cos(a) * lerp(r1, r0, k), cy + Math.sin(a) * lerp(r1, r0, k)];
      o += `<path d="M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}L${f1(p2[0])} ${f1(p2[1])}Z" fill="#fff" opacity=".75"/>`;
    }
    // flash
    const fl = 1 - prog(t, K.what, K.what + 0.3, 'out');
    o += `<rect width="1080" height="1920" fill="#fff" opacity="${f1(fl * 0.45)}"/>`;
    // "!!" marks
    const pk = prog(t, K.what + 0.05, K.what + 0.35, 'outBack');
    if (pk > 0.01) {
      o += `<g transform="translate(${f1(cx + 300)} ${f1(cy - 330)}) rotate(14) scale(${f1(pk)})"><text x="0" y="0" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="180" fill="#ffd84a" stroke="#141414" stroke-width="12" paint-order="stroke">!</text></g>`;
      o += `<g transform="translate(${f1(cx - 300)} ${f1(cy - 300)}) rotate(-14) scale(${f1(pk)})"><text x="0" y="0" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="150" fill="#ffd84a" stroke="#141414" stroke-width="12" paint-order="stroke">?</text></g>`;
    }
    return o;
  }

  // ---------------- camera ----------------
  function camera(t) {
    const c = kf(t, [
      [0, [390, 1110, 0.9]],
      [5.3, [300, 1140, 1.28], 'sine'],
      [6.3, [262, 1150, 1.5], 'sine'],
      [7.35, [400, 1060, 1.1]],
      [7.62, [410, 1060, 1.08]],
      [8.6, [760, 1080, 0.84]],
      [9.4, [760, 1075, 0.85]],
      [11.3, [745, 1040, 0.92], 'sine'],
      [12.75, [740, 980, 0.94], 'sine'],
      [13.5, [735, 880, 0.97]],
      [15.85, [745, 870, 1.04], 'sine'],
      [16.28, [445, 1000, 1.62]],
      [K.what, [445, 995, 1.62], 'sine'],
      [K.what + 0.2, [445, 990, 1.9], 'outBack'],
      [17.2, [445, 990, 1.94], 'sine'],
    ]);
    const shake = t > K.what ? 16 * Math.exp(-(t - K.what) * 6) : 0;
    const rot = kf(t, [[15.85, 0], [16.05, -2.5], [16.28, 0]]);
    return { cx: c[0] + Math.sin(t * 61) * shake, cy: c[1] + Math.cos(t * 47) * shake, z: c[2], rot };
  }

  // ---------------- titles & subtitles (HTML overlay) ----------------
  const PHRASES = [
    { w: [0, 4] },
    { w: [5, 12] },
    { w: [13, 18], text: { 13: 'Sanya' } },
    { w: [19, 24] },
    { w: [25, 28], cls: 'mom', text: { 25: '“Sweetie,', 28: 'ready!”' } },
    { w: [29, 32] },
    { w: [33, 35], cls: 'thought', text: { 33: '“Please' } },
    { w: [36, 40], cls: 'thought', text: { 40: 'again!”' } },
    { w: [41, 42], cls: 'sanya', text: { 41: 'Wait…', 42: 'WHAT?!' } },
  ];
  PHRASES.forEach((p, i) => {
    p.s = W[p.w[0]].s - 0.12;
    const next = PHRASES[i + 1];
    p.e = next ? Math.min(W[next.w[0]].s - 0.12, W[p.w[1]].e + 0.6) : T.duration + 1;
  });

  function subtitles(t) {
    const p = PHRASES.find(p => t >= p.s && t < p.e);
    if (!p) return '';
    const inK = prog(t, p.s, p.s + 0.18, 'outBack');
    const outK = 1 - prog(t, p.e - 0.12, p.e, 'in');
    let html = '';
    for (let i = p.w[0]; i <= p.w[1]; i++) {
      const txt = (p.text && p.text[i]) || W[i].w;
      const active = t >= W[i].s - 0.03 && (i === p.w[1] || t < W[i + 1].s - 0.03);
      const done = t >= W[i].s - 0.03;
      const pk = prog(t, W[i].s - 0.03, W[i].s + 0.12, 'outBack');
      const sc = active ? 1 + 0.12 * Math.sin(pk * Math.PI) + 0.04 : 1;
      html += `<span class="w${active ? ' on' : ''}${done ? '' : ' todo'}" style="transform:scale(${sc.toFixed(3)})">${txt}</span> `;
    }
    return `<div class="phrase ${p.cls || ''}" style="opacity:${(outK).toFixed(3)};transform:translateY(${((1 - inK) * 30).toFixed(1)}px) scale(${(0.9 + 0.1 * inK).toFixed(3)})">${html}</div>`;
  }

  function title(t) {
    const a = prog(t, 0.25, 0.85, 'outBack'), b = prog(t, 0.55, 1.15, 'outBack');
    const out = 1 - prog(t, 4.6, 5.2, 'in');
    if (out <= 0) return '';
    return `<div class="badge" style="opacity:${(Math.min(1, a) * out).toFixed(3)};transform:translateY(${((1 - a) * -40).toFixed(1)}px)">HISTORY OF SANYA</div>` +
      `<div class="ttl" style="opacity:${(Math.min(1, b) * out).toFixed(3)};transform:scale(${(0.7 + 0.3 * b).toFixed(3)})">What If You Could<br><span>Read Minds?</span></div>`;
  }

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  const subs = document.getElementById('subs');
  const ttl = document.getElementById('title');

  window.renderFrame = function (t) {
    const m = prog(t, 0.0, 5.6, 'sine');               // night -> morning light
    const cam = camera(t);
    const { p: sp, s } = sanyaPose(t);
    const mp = momPose(t);
    const sHead = CH.headPos(sp), mHead = CH.headPos(mp);

    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`);
    o.push(`<g transform="translate(540 960) rotate(${f1(cam.rot)}) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(wallAndWindow(m), garland(t));
    // sun beam on the wall/floor
    o.push(`<path d="M206 850L574 850L1050 1900L520 1900Z" fill="url(#gBeam)" opacity="${f1(0.15 + 0.55 * m)}"/>`);
    o.push(door(prog(t, K.momIn + 0.02, K.momIn + 0.55, 'out')));
    o.push(floorAndRug(), nightstand(t), bed());
    o.push(CH.figure(sp), blanket(s, t));
    o.push(zzz(t, sHead));
    if (t > K.momIn + 0.05) {
      o.push(`<ellipse cx="${f1(mp.x)}" cy="1478" rx="110" ry="16" fill="#3a2410" opacity=".25" filter="url(#fBlur8)"/>`);
      o.push(CH.figure(mp));
    }
    o.push(telepathy(t, sHead, mHead));
    o.push(thoughtBubble(t, mHead));
    o.push('</g>');
    // lighting: dawn tint, vignette
    o.push(`<rect width="1080" height="1920" fill="#1d2758" opacity="${f1(0.42 * (1 - m))}" style="mix-blend-mode:multiply"/>`);
    o.push(`<defs><radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0a" stop-opacity=".35"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVig)"/>`);
    // shock FX in screen space around Sanya's head
    const hs = [540 + (sHead[0] - cam.cx) * cam.z, 960 + (sHead[1] - cam.cy) * cam.z];
    o.push(shockFX(t, hs[0], hs[1]));
    svg.innerHTML = o.join('');
    subs.innerHTML = subtitles(t);
    ttl.innerHTML = title(t);
  };
})();
