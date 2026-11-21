// "Будни безработного школьника" — Alex re-lives the day from a real vlog (one ~42.6 s short).
// Audio: the vlog's own voice track (tools/build_timing_video.py), words: tools/vlog_words.json.
// Style of the source: handheld vertical shots, hard cuts, small white lowercase captions.
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;

  // ---------------- looks ----------------
  const LOOK = { smooth: true, roundHands: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.18, handSc: 1.05 };
  const HOODIE = '#d9d3c7', PUFFER = '#f3f2ee', QUILT = '#cbc8c0';
  const OUT_HOODIE = { outfit: 'hoodie', teeCol: HOODIE, sleeveFull: HOODIE, sleevePuff: 12, pants: '#cdc6b8', shoe: 'white' };
  const OUT_PUFFER = { outfit: 'puffer', teeCol: PUFFER, quiltCol: QUILT, sleeveFull: PUFFER, sleevePuff: 22, sleeveQuilt: QUILT, pants: '#1d1d20', shoe: 'white' };
  const CLIENT = Object.assign({}, LOOK, { kind: 'guy', outfit: 'puffer', teeCol: '#232427', quiltCol: '#3d3e43', sleeveFull: '#232427', sleevePuff: 22, sleeveQuilt: '#3d3e43', pants: '#2c2c30', shoe: 'white' });

  // ---------------- shots (hard cuts, like the source) ----------------
  const SHOTS = [
    [0, 'lobby'], [4.62, 'sky'], [9.5, 'phone'], [11.84, 'dress'], [13.0, 'street'], [14.45, 'office'],
    [16.5, 'terminal'], [19.5, 'goHome'], [21.38, 'unbox'], [23.56, 'pack'], [27.06, 'two'], [29.95, 'counter'],
    [32.28, 'client'], [38.66, 'atm'], [40.46, 'night'],
  ];
  const shotAt = t => { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k][0]) i = k; return [SHOTS[i][0], SHOTS[i][1], SHOTS[i + 1] ? SHOTS[i + 1][0] : T.duration]; };

  // ---------------- helpers ----------------
  const ink = (d, w, col = '#141414') =>
    `<path d="${d}" fill="none" stroke="#070707" stroke-width="${w + 10}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#8f8f8f" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ball = (x, y, r) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 5)}" fill="#070707"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 2.5)}" fill="#8f8f8f"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#141414"/>` +
    `<path d="M${f1(x - r * 0.5)} ${f1(y - r * 0.35)}q${f1(r * 0.35)} ${f1(-r * 0.35)} ${f1(r * 0.75)} ${f1(-r * 0.25)}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="${f1(r * 0.16)}" stroke-linecap="round"/>`;
  // arm seen in close-up (POV): from (x0,y0) off-screen to the hand at (x1,y1); sleeve colour covers most of it
  function povArm(x0, y0, x1, y1, w, sleeve, quilt) {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    const cx = x1 - ux * w * 1.25, cy = y1 - uy * w * 1.25;
    let s = ink(`M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`, w * 0.78);
    if (sleeve) {
      s += `<path d="M${f1(x0)} ${f1(y0)}L${f1(cx)} ${f1(cy)}" stroke="#111" stroke-width="${f1(w * 1.25 + 10)}" stroke-linecap="round"/>` +
        `<path d="M${f1(x0)} ${f1(y0)}L${f1(cx)} ${f1(cy)}" stroke="${sleeve}" stroke-width="${f1(w * 1.25)}" stroke-linecap="round"/>`;
      if (quilt) for (let d = w * 1.4; d < len - w * 1.3; d += w * 1.1) {
        const qx = cx - ux * d, qy = cy - uy * d, h = w * 0.6;
        s += `<path d="M${f1(qx - uy * h)} ${f1(qy + ux * h)}L${f1(qx + uy * h)} ${f1(qy - ux * h)}" stroke="${quilt}" stroke-width="5" stroke-linecap="round"/>`;
      }
    }
    return s + ball(x1, y1, w * 0.62);
  }
  function walk(p, t, speed, amp = 1) {
    const ph = t * Math.PI * 2 * speed;
    p.legL = [-8 + 22 * Math.sin(ph) * amp, Math.max(0, -Math.sin(ph)) * 20 * amp];
    p.legR = [8 - 22 * Math.sin(ph) * amp, -Math.max(0, Math.sin(ph)) * 20 * amp];
    p.y -= Math.abs(Math.sin(ph)) * 9 * amp * p.sc;
    return ph;
  }
  const standHip = (floor, sc) => floor - 280 * sc;
  function alex(t, x, hip, sc, outfit, face) {
    const p = Object.assign({ x, y: hip, sc }, LOOK, outfit);
    p.legL = [-8, 2]; p.legR = [8, -2];
    p.lean = wob(t, 0.4, 1) * 1.2; p.headTilt = wob(t, 0.5, 2) * 1.6;
    p.face = Object.assign({ turn: 0.1, look: [0.1, 0.1], mouth: 'smile', open: 0, brow: 0.35, browTilt: 0, eye: 1.08, pupil: 1.1 }, face || {});
    p.face.blink = blink(t, [1.9, 5.6, 8.4, 12.4, 15.2, 18.9, 33.2, 35.6, 37.9, 40.0]);
    return p;
  }
  // arms to world targets (round hands)
  function arms(p, wl, wr) { p.armL = CH.armIK(p, -1, wl[0], wl[1], -1); p.armR = CH.armIK(p, 1, wr[0], wr[1], 1); }
  const restL = p => [p.x - 72 * p.sc, p.y - 22 * p.sc], restR = p => [p.x + 72 * p.sc, p.y - 22 * p.sc];
  function talk(p, t, on = true) {
    if (!on) return;
    const s = LIPSYNC.talk(T, t, [[0, T.duration]]);
    if (s && s.mouth) { p.face.mouth = 'open'; p.face.open = s.open; }
  }
  // the hood, pulled over the head (behind + a rim in front of the top of the head)
  function hoodBack(p) {
    const [hx, hy] = CH.headPos(p), r = CH.R * 1.12 * p.sc;
    return `<path d="M${f1(hx - r * 1.28)} ${f1(hy + r * 1.1)}C${f1(hx - r * 1.5)} ${f1(hy - r * 0.6)} ${f1(hx - r * 0.9)} ${f1(hy - r * 1.42)} ${f1(hx)} ${f1(hy - r * 1.4)}C${f1(hx + r * 0.9)} ${f1(hy - r * 1.42)} ${f1(hx + r * 1.5)} ${f1(hy - r * 0.6)} ${f1(hx + r * 1.28)} ${f1(hy + r * 1.1)}Z" fill="${HOODIE}" stroke="#111" stroke-width="${f1(5 * p.sc)}" stroke-linejoin="round"/>` +
      `<path d="M${f1(hx - r * 1.1)} ${f1(hy + r * 0.2)}C${f1(hx - r * 1.2)} ${f1(hy - r * 0.8)} ${f1(hx - r * 0.6)} ${f1(hy - r * 1.25)} ${f1(hx)} ${f1(hy - r * 1.24)}" fill="none" stroke="#bdb6a8" stroke-width="${f1(4 * p.sc)}" stroke-linecap="round"/>`;
  }
  function hoodFront(p) {
    const [hx, hy] = CH.headPos(p), r = CH.R * 1.12 * p.sc;
    return `<path d="M${f1(hx - r * 1.0)} ${f1(hy - r * 0.25)}C${f1(hx - r * 0.9)} ${f1(hy - r * 1.12)} ${f1(hx + r * 0.9)} ${f1(hy - r * 1.12)} ${f1(hx + r * 1.0)} ${f1(hy - r * 0.25)}C${f1(hx + r * 1.04)} ${f1(hy - r * 1.32)} ${f1(hx - r * 1.04)} ${f1(hy - r * 1.32)} ${f1(hx - r * 1.0)} ${f1(hy - r * 0.25)}Z" fill="${HOODIE}" stroke="#111" stroke-width="${f1(5 * p.sc)}" stroke-linejoin="round"/>`;
  }
  const shadow = (x, y, rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(rx * 0.14)}" fill="#000" opacity=".22" filter="url(#fSoft)"/>`;
  function rain(t, n, alpha = 0.5, slant = -0.18, len = 60) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const sp = 1500 + (i * 37) % 600, x0 = (i * 211) % 1500 - 200;
      const y = ((t * sp + i * 977) % 2600) - 300, x = x0 + y * slant;
      s += `<path d="M${f1(x)} ${f1(y)}l${f1(slant * len)} ${len}" stroke="#eef3f7" stroke-opacity="${alpha}" stroke-width="3" stroke-linecap="round"/>`;
    }
    return s;
  }
  // grey wide-leg jeans, top at (0,0), centred; h = length
  function jeans(h, w = 1, fold = 0) {
    const s = h / 300;
    if (fold) {   // folded square (top-down)
      return `<g transform="scale(${f1(s)})"><rect x="-110" y="0" width="220" height="190" rx="16" fill="url(#gDenim)" stroke="#2c2f33" stroke-width="6"/>` +
        `<path d="M-110 42H110" stroke="#4b5056" stroke-width="6"/><path d="M-96 60Q-60 70 -40 60M40 60Q60 70 96 60" fill="none" stroke="#c9a35a" stroke-width="3" stroke-dasharray="6 5"/>` +
        `<path d="M-40 100C-10 120 20 90 50 130" fill="none" stroke="#9ba1a7" stroke-width="10" opacity=".35" stroke-linecap="round"/></g>`;
    }
    return `<g transform="scale(${f1(s * w)} ${f1(s)})">` +
      `<path d="M-74 0H74L84 40L104 296H18L0 70L-18 296H-104L-84 40Z" fill="url(#gDenim)" stroke="#2c2f33" stroke-width="6" stroke-linejoin="round"/>` +
      `<path d="M-74 0H74L76 20H-76Z" fill="#5d6268" stroke="#2c2f33" stroke-width="4"/><circle cx="0" cy="10" r="5" fill="#c9a35a"/>` +
      `<path d="M0 22V64" stroke="#3d4146" stroke-width="4"/><path d="M-66 30Q-48 50 -30 32M66 30Q48 50 30 32" fill="none" stroke="#c9a35a" stroke-width="3" stroke-dasharray="6 5"/>` +
      `<path d="M-70 120Q-60 200 -80 280M70 120Q60 200 80 280" fill="none" stroke="#9ba1a7" stroke-width="16" opacity=".3" stroke-linecap="round"/>` +
      `<rect x="40" y="18" width="34" height="46" rx="3" fill="#f4efe2" stroke="#8a7a5a" stroke-width="3" transform="rotate(8 57 41)"/></g>`;
  }
  // white mailer bag (top-down), w×h centred; seal 0..1 = flap folded down
  function mailer(w, h, seal = 1, label = false) {
    const fl = h * 0.22 * (1 - seal);
    return `<g><rect x="${f1(-w / 2 + 8)}" y="${f1(-h / 2 + 12)}" width="${w}" height="${h}" rx="14" fill="#000" opacity=".12" filter="url(#fSoft)"/>` +
      `<rect x="${f1(-w / 2)}" y="${f1(-h / 2 - fl)}" width="${w}" height="${f1(h + fl)}" rx="12" fill="#f6f6f4" stroke="#b9b9b5" stroke-width="4"/>` +
      `<path d="M${f1(-w / 2 + 14)} ${f1(-h / 2 + h * 0.2)}H${f1(w / 2 - 14)}" stroke="#d83a3a" stroke-width="5" stroke-dasharray="14 9"/>` +
      `<path d="${CH.heart(-w * 0.12, h * 0.05, w * 0.12)}" fill="none" stroke="#d83a3a" stroke-width="5"/>` +
      `<path d="M${f1(-w * 0.3)} ${f1(h * 0.26)}L${f1(w * 0.18)} ${f1(-h * 0.04)}" stroke="#2f4f9a" stroke-width="4" stroke-linecap="round"/><path d="M${f1(w * 0.18)} ${f1(-h * 0.04)}l-18 2l8 12Z" fill="#2f4f9a"/>` +
      `<text x="${f1(w * 0.12)}" y="${f1(h * 0.34)}" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="${f1(w * 0.09)}" fill="#2f4f9a" transform="rotate(-8 ${f1(w * 0.12)} ${f1(h * 0.34)})">спасибо!</text>` +
      (label ? `<g transform="translate(${f1(w * 0.18)} ${f1(-h * 0.33)})"><rect x="-70" y="-26" width="140" height="52" rx="4" fill="#fff" stroke="#888" stroke-width="2"/>` +
        Array.from({ length: 22 }, (_, i) => `<rect x="${-60 + i * 5.4}" y="-18" width="${(i * 7) % 3 + 1.5}" height="30" fill="#111"/>`).join('') + `</g>` : '') + `</g>`;
  }
  function cardboard(w, h, open = 0, tape = 1) {
    // top-down box; open: flaps folded out, shows jeans inside
    let s = `<rect x="${f1(-w / 2 + 10)}" y="${f1(-h / 2 + 14)}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".15" filter="url(#fSoft)"/>`;
    if (open > 0) {
      const fx = w * 0.5 * open, fy = h * 0.5 * open;
      s += `<path d="M${-w / 2} ${-h / 2}H${w / 2}L${f1(w / 2 - 10)} ${f1(-h / 2 - fy)}H${f1(-w / 2 + 10)}Z" fill="#b98d56" stroke="#7a5a32" stroke-width="4"/>`;
      s += `<path d="M${-w / 2} ${h / 2}H${w / 2}L${f1(w / 2 - 10)} ${f1(h / 2 + fy)}H${f1(-w / 2 + 10)}Z" fill="#b98d56" stroke="#7a5a32" stroke-width="4"/>`;
      s += `<path d="M${-w / 2} ${-h / 2}V${h / 2}L${f1(-w / 2 - fx)} ${f1(h / 2 - 10)}V${f1(-h / 2 + 10)}Z" fill="#c69a60" stroke="#7a5a32" stroke-width="4"/>`;
      s += `<path d="M${w / 2} ${-h / 2}V${h / 2}L${f1(w / 2 + fx)} ${f1(h / 2 - 10)}V${f1(-h / 2 + 10)}Z" fill="#c69a60" stroke="#7a5a32" stroke-width="4"/>`;
      s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#8a6338" stroke="#7a5a32" stroke-width="4"/>`;
      s += `<g transform="translate(0 ${f1(-h * 0.36)})">${jeans(h * 0.62 * 1.58, 1, 1)}</g>`;
      return s;
    }
    s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="#c99d62" stroke="#7a5a32" stroke-width="5"/>`;
    s += `<path d="M${-w / 2} 0H${w / 2}" stroke="#8f6a3c" stroke-width="4"/>`;
    s += `<rect x="${-w / 2}" y="-22" width="${f1(w * tape)}" height="44" fill="#d9c29a" opacity=".85"/>`;
    if (tape < 1) s += `<path d="M${f1(-w / 2 + w * tape)} -22l40 -60h20l-40 60v44Z" fill="#e3d1ad" opacity=".9"/>`;
    return s + `<rect x="${f1(w * 0.12)}" y="${f1(-h * 0.4)}" width="${f1(w * 0.3)}" height="${f1(h * 0.24)}" fill="#fff" stroke="#999" stroke-width="2"/>`;
  }
  function bills(n, x, y, rot = 0, s = 1) {
    let o = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})">`;
    for (let i = 0; i < n; i++) o += `<g transform="translate(${i * 6} ${-i * 5}) rotate(${(i % 2 ? 4 : -3)})"><rect x="-70" y="-34" width="140" height="68" rx="5" fill="#c8b8e6" stroke="#5b4b86" stroke-width="3"/><rect x="-60" y="-24" width="120" height="48" rx="4" fill="none" stroke="#8a77b8" stroke-width="2"/><circle cx="-30" cy="0" r="16" fill="#a996d4"/><text x="30" y="10" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="26" fill="#4a3a78">500</text></g>`;
    return o + '</g>';
  }
  function phoneBack(x, y, s, rot, flash) {
    let o = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})"><rect x="-42" y="-86" width="84" height="172" rx="16" fill="#2a2d33" stroke="#0c0c0c" stroke-width="5"/>` +
      `<rect x="-34" y="-78" width="40" height="44" rx="11" fill="#14161a"/><circle cx="-22" cy="-66" r="8" fill="#050505" stroke="#555" stroke-width="2"/><circle cx="-6" cy="-48" r="8" fill="#050505" stroke="#555" stroke-width="2"/><circle cx="-22" cy="-42" r="4" fill="#fff8d8"/></g>`;
    if (flash > 0) o += `<circle cx="${f1(x - 14 * s)}" cy="${f1(y - 40 * s)}" r="${f1(220 * s * flash)}" fill="url(#gFlash)"/>`;
    return o;
  }
  function tumbleweed(x, y, r, rot) {
    let o = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})">`;
    for (let i = 0; i < 9; i++) o += `<ellipse rx="${r}" ry="${f1(r * 0.45)}" fill="none" stroke="#a2804f" stroke-width="5" transform="rotate(${i * 20})"/>`;
    return o + `<circle r="${f1(r * 0.98)}" fill="none" stroke="#7e5f36" stroke-width="5"/></g>`;
  }
  function plant(x, y, r) {
    let o = `<circle cx="${x + 10}" cy="${y + 16}" r="${r}" fill="#000" opacity=".16" filter="url(#fSoft)"/>`;
    for (let i = 0; i < 26; i++) {
      const a = i * 2.4, d = r * 0.85 * Math.sqrt((i + 1) / 26);
      o += `<circle cx="${f1(x + Math.cos(a) * d)}" cy="${f1(y + Math.sin(a) * d)}" r="${f1(r * 0.22)}" fill="${i % 3 ? '#3f7d33' : '#5a9b45'}" stroke="#2a5a22" stroke-width="2"/>`;
    }
    return o;
  }

  // ---------------- shared sets ----------------
  function streetSet(t, door) {
    // overcast street: building with the post-office door, wet tiles
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="1500" fill="url(#gSky)"/>`);
    o.push(`<rect x="-800" y="300" width="2700" height="1100" fill="#c9c4bb"/>`);
    for (let x = -800; x < 1900; x += 180) o.push(`<rect x="${x}" y="300" width="6" height="1100" fill="#b3ada3"/>`);
    o.push(`<rect x="-800" y="300" width="2700" height="40" fill="#8e8a84"/>`);
    // shop windows
    o.push(`<rect x="-520" y="560" width="420" height="640" fill="#4f5c66" stroke="#2b2f33" stroke-width="10"/><path d="M-500 580l140 600M-380 580l120 400" stroke="#fff" stroke-opacity=".12" stroke-width="30"/>`);
    // post-office sign + glass door
    o.push(`<rect x="560" y="420" width="420" height="96" rx="10" fill="#1f4f9a"/><text x="770" y="488" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="58" fill="#fff" letter-spacing="6">ПОЧТА</text>`);
    o.push(`<rect x="600" y="560" width="340" height="830" fill="#3c464e" stroke="#2b2f33" stroke-width="12"/>`);
    const op = door || 0;
    o.push(`<rect x="${f1(614 + op * 150)}" y="574" width="156" height="802" fill="#9fb3c1" opacity=".55" stroke="#d8dde1" stroke-width="8"/>`);
    o.push(`<rect x="770" y="574" width="156" height="802" fill="#9fb3c1" opacity=".55" stroke="#d8dde1" stroke-width="8"/>`);
    o.push(`<path d="M640 600l90 500M800 600l90 500" stroke="#fff" stroke-opacity=".15" stroke-width="26"/>`);
    // pavement
    o.push(`<rect x="-800" y="1390" width="2700" height="900" fill="#8f8172"/>`);
    let y = 1390, g = 28;
    while (y < 2300) { o.push(`<rect x="-800" y="${f1(y)}" width="2700" height="4" fill="#6e6255"/>`); y += g; g *= 1.16; }
    for (let x = -800; x < 1900; x += 120) o.push(`<path d="M${x} 1390L${f1(540 + (x - 540) * 2.4)} 2300" stroke="#6e6255" stroke-width="4"/>`);
    o.push(`<rect x="-800" y="1390" width="2700" height="900" fill="url(#gWet)"/>`);
    // a few autumn leaves
    for (let i = 0; i < 14; i++) o.push(`<ellipse cx="${(i * 313) % 1500 - 200}" cy="${1440 + (i * 97) % 420}" rx="16" ry="9" fill="${['#c98a2e', '#a55a24', '#d9aa3c'][i % 3]}" transform="rotate(${i * 40} ${(i * 313) % 1500 - 200} ${1440 + (i * 97) % 420})"/>`);
    return o.join('');
  }
  function roomSet(night) {
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="2400" fill="${night ? '#5e5a66' : '#d8d0c2'}"/>`);
    o.push(`<rect x="610" y="420" width="380" height="520" rx="8" fill="#ece6da"/><rect x="630" y="440" width="340" height="480" fill="${night ? 'url(#gNight)' : 'url(#gSky)'}"/>`);
    if (night) for (let i = 0; i < 9; i++) o.push(`<rect x="${650 + (i * 47) % 300}" y="${760 + (i * 31) % 120}" width="16" height="22" fill="#ffd98a" opacity=".8"/>`);
    o.push(`<path d="M800 440V920M630 680H970" stroke="#ece6da" stroke-width="12"/>`);
    o.push(`<path d="M590 400h420" stroke="#8a7a62" stroke-width="10" stroke-linecap="round"/><path d="M600 405q30 300 0 560h50q-20 -280 0 -560Z" fill="${night ? '#6d4f6b' : '#b77b6a'}"/>`);
    // bed (left) + poster
    o.push(`<rect x="-300" y="1180" width="760" height="240" rx="20" fill="${night ? '#46506a' : '#7a8cb0'}" stroke="#2a2f3b" stroke-width="8"/><rect x="-300" y="1130" width="220" height="90" rx="40" fill="#f2efe8" stroke="#2a2f3b" stroke-width="6"/>`);
    o.push(`<rect x="90" y="560" width="230" height="300" fill="#2b2b2b"/><rect x="104" y="574" width="202" height="272" fill="${night ? '#7a5d6b' : '#e9785a'}"/><circle cx="205" cy="690" r="62" fill="#ffd25a" opacity=".85"/>`);
    o.push(`<rect x="-800" y="1440" width="2700" height="700" fill="${night ? '#4a3d33' : '#9a7a5c'}"/>`);
    let y = 1440, g = 26; while (y < 2200) { o.push(`<rect x="-800" y="${f1(y)}" width="2700" height="3" fill="#000" opacity=".25"/>`); y += g; g *= 1.15; }
    return o.join('');
  }
  function tableTop(extra) {
    return `<rect x="-400" y="-400" width="1900" height="2700" fill="url(#gTable)"/>` +
      `<rect x="-400" y="-400" width="1900" height="2700" fill="url(#gTableShade)"/>` +
      plant(220, 1560, 120) +
      `<g transform="translate(820 1380) rotate(-28)"><rect x="-70" y="-110" width="140" height="220" rx="26" fill="#f2f2f0" stroke="#c9c9c5" stroke-width="5"/><rect x="-44" y="-70" width="88" height="70" rx="12" fill="#e2e2df"/></g>` +
      `<rect x="620" y="1640" width="560" height="40" rx="10" fill="#6b6e72" transform="rotate(-16 900 1660)"/>` + (extra || '');
  }

  // ---------------- shots ----------------
  const DRAW = {};

  // 1. lobby, mirror selfie: "Всем привет! Это будни безработного шестнадцатилетнего школьника. Погнали!"
  DRAW.lobby = (t, l) => {
    const FLOOR = 1720, sc = 1.55;
    const p = alex(t, 520, standHip(FLOOR, sc), sc, OUT_HOODIE, { turn: 0.0, look: [0.05, 0.15] });
    const head = CH.headPos(p);
    const phone = [p.x + 205, head[1] + 255 + wob(t, 0.8, 3) * 6];
    let wl = restL(p);
    if (t < 1.05) { const w = Math.sin(t * 13); wl = [p.x - 235 + w * 28, head[1] - 40 + Math.abs(w) * 10]; }                        // wave
    else if (t > 1.3 && t < 3.6) { const k = prog(t, 1.3, 1.6, 'outBack'); wl = [lerp(wl[0], p.x - 165, k), lerp(wl[1], p.y - 120, k)]; p.face.brow = 0.6; p.face.browTilt = 0.35; p.headTilt += 6; }   // shrug "безработного"
    if (t >= 3.8) { const k = prog(t, 3.8, 4.0, 'outBack'); wl = [lerp(wl[0], p.x - 120, k), lerp(wl[1], head[1] - 140, k)]; p.face.eye = 1.2; p.face.brow = 0.75; }  // "Погнали!" fist up
    arms(p, wl, [phone[0], phone[1] + 40]);
    talk(p, t);
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="${FLOOR + 800}" fill="#6d6b67"/>`);
    for (let x = -600; x < 1800; x += 300) {
      o.push(`<rect x="${x}" y="-200" width="292" height="${FLOOR + 200}" fill="url(#gMarble)" />`);
      o.push(`<path d="M${x + 40} 100c60 200 -20 400 80 700M${x + 200} 300c-40 300 60 500 0 900" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="5"/>`);
    }
    o.push(`<rect x="320" y="330" width="120" height="120" rx="8" fill="#d8d8d4" stroke="#999" stroke-width="4"/><path d="M345 360h70M345 380h70M345 400h70M345 420h70" stroke="#aaa" stroke-width="5"/>`);
    o.push(`<rect x="-800" y="-800" width="2700" height="560" fill="#3a3936"/><rect x="-800" y="-240" width="2700" height="14" fill="#55534f"/>`);
    o.push(`<rect x="-800" y="${FLOOR}" width="2700" height="800" fill="#4a4946"/><rect x="-800" y="${FLOOR}" width="2700" height="800" fill="url(#gWet)"/>`);
    o.push(`<rect x="300" y="${FLOOR + 40}" width="460" height="220" fill="#2c2c2b" opacity=".7"/>`);
    o.push(shadow(p.x, FLOOR + 6, 170));
    o.push(CH.figure(p));
    o.push(phoneBack(phone[0], phone[1], 1.15, -6, 0.75 + 0.25 * Math.sin(t * 9)));
    o.push(CH.figure(Object.assign({}, p, { _handsOnly: 'R' })));
    const push = t >= 3.8 ? 1 + 0.08 * prog(t, 3.8, 4.1, 'outBack') : 1;
    return { svg: o.join(''), cam: { cx: 540, cy: head[1] + 330, z: 1.32 * push } };
  };

  // 2. low angle, grey sky, drizzle, hood up: "Погода, конечно, была не очень, но в планах было хорошо поработать, поэтому…"
  DRAW.sky = (t, l) => {
    const sc = 2.5;
    const p = alex(t, 540 + wob(t, 0.3, 7) * 10, 1720, sc, OUT_HOODIE, { turn: 0, look: [0, 0.55], brow: 0.3 });
    p.headTilt = -6 + wob(t, 0.6, 1) * 3;
    const head = CH.headPos(p);
    const R = CH.R * 1.12 * sc;
    let wl = restL(p);
    let wr = restR(p);
    if (t >= 6.0 && t < 7.0) { p.face.browTilt = 0.6; p.face.brow = 0.5; p.face.look = [0.4, 0.3]; p.headTilt += 4; }   // "не очень"
    if (t >= 7.4) { p.face.brow = 0.6; p.face.browTilt = -0.1; const k = prog(t, 7.6, 7.9, 'outBack'); wr = [lerp(wr[0], p.x + 170, k), lerp(wr[1], head[1] + R * 1.7, k)]; }  // "хорошо поработать"
    arms(p, wl, wr);
    talk(p, t);
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="url(#gSky)"/>`);
    // building edges converging (low angle)
    o.push(`<path d="M-300 2200L-120 -300H40L120 2200Z" fill="#9aa1a6"/><path d="M1380 2200L1180 -300H1040L960 2200Z" fill="#a6acb1"/>`);
    for (let y = -200; y < 2200; y += 160) o.push(`<path d="M${f1(-120 + (y + 300) * 0.07)} ${y}h${f1(160 - (y + 300) * 0.01)}" stroke="#7e868c" stroke-width="5"/>`);
    o.push(rain(t, 60, 0.45));
    o.push(hoodBack(p));
    o.push(CH.figure(p));
    o.push(hoodFront(p));
    o.push(rain(t + 3, 30, 0.7, -0.18, 90));
    // a few drops on the lens
    for (let i = 0; i < 6; i++) { const ap = prog(t, 4.8 + i * 0.7, 5.0 + i * 0.7); if (ap > 0) o.push(`<circle cx="${(i * 377) % 900 + 90}" cy="${(i * 523) % 1500 + 200}" r="${f1(16 * ap + (i % 3) * 5)}" fill="#fff" opacity=".18" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`); }
    return { svg: o.join(''), cam: { cx: 540, cy: head[1] + 360, z: 1.0 + l * 0.012 } };
  };

  // 3a. phone close-up, notification: "как мне только пришло сообщение, что посылка приехала,"
  DRAW.phone = (t, l) => {
    const buzz = t > 10.3 && t < 10.9 ? Math.sin(t * 90) * 6 : 0;
    const o = [];
    o.push(roomSet(false));
    o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="#000" opacity=".25"/>`);
    o.push(`<g transform="translate(${f1(540 + buzz)} 960) rotate(${f1(-3 + wob(t, 0.5, 2))})">`);
    o.push(povArm(-260, 700, -275, 240, 90, HOODIE) + povArm(300, 760, 280, 300, 90, HOODIE));
    o.push(`<rect x="-265" y="-520" width="530" height="1060" rx="70" fill="#15171b" stroke="#050505" stroke-width="8"/>`);
    o.push(`<rect x="-240" y="-495" width="480" height="1010" rx="52" fill="url(#gWall)"/>`);
    o.push(`<rect x="-70" y="-480" width="140" height="36" rx="18" fill="#000"/>`);
    o.push(`<text x="0" y="-300" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="120" fill="#fff" opacity=".95">12:47</text>`);
    o.push(`<text x="0" y="-235" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="30" fill="#fff" opacity=".8">суббота, 18 октября</text>`);
    const k = prog(t, 10.22, 10.5, 'outBack');
    if (k > 0) {
      o.push(`<g transform="translate(0 ${f1(lerp(-640, -130, k))})"><rect x="-220" y="-70" width="440" height="160" rx="34" fill="#f4f4f6" opacity=".96"/>` +
        `<rect x="-196" y="-46" width="64" height="64" rx="16" fill="#1f4f9a"/><path d="M-182 -26l18 -10l18 10v24l-18 10l-18 -10Z" fill="#f4d29a" stroke="#7a5a32" stroke-width="3"/>` +
        `<text x="-116" y="-14" font-family="Montserrat" font-weight="900" font-size="28" fill="#111">ПОЧТА</text><text x="190" y="-14" text-anchor="end" font-family="Montserrat" font-weight="800" font-size="22" fill="#888">сейчас</text>` +
        `<text x="-116" y="24" font-family="Montserrat" font-weight="800" font-size="25" fill="#333">Ваша посылка прибыла</text><text x="-116" y="58" font-family="Montserrat" font-weight="800" font-size="25" fill="#333">в отделение №12 📦</text></g>`);
    }
    o.push('</g>');
    if (buzz) o.push(`<path d="M190 520q-30 40 0 80M150 500q-50 60 0 120M890 520q30 40 0 80M930 500q50 60 0 120" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>`);
    return { svg: o.join(''), cam: { cx: 540, cy: 960, z: 1.0 + l * 0.03 } };
  };

  // 3b. "сразу же оделся" — the puffer flies in, poof, he dashes off
  DRAW.dress = (t, l) => {
    const FLOOR = 1470, sc = 1.25;
    const swap = 12.28;
    const p = alex(t, 470, standHip(FLOOR, sc), sc, t < swap ? OUT_HOODIE : OUT_PUFFER, { turn: 0.2, look: [-0.6, 0], brow: 0.6, eye: 1.15 });
    let wl = restL(p), wr = restR(p);
    const run = prog(t, 12.6, 13.0, 'in');
    if (t < swap) { wl = [p.x - 150, p.y - 210]; wr = [p.x + 150, p.y - 210]; p.face.look = [-0.9, -0.2]; }   // arms up, catching it
    else { p.face.turn = 0.5; p.face.look = [1, 0]; p.face.mouth = 'smile'; }
    if (run > 0) { p.x += run * 900; walk(p, t, 3.2); p.lean = 8; wl = [p.x - 90, p.y - 70]; wr = [p.x + 60, p.y - 120]; }
    arms(p, wl, wr);
    const o = [roomSet(false)];
    o.push(shadow(p.x, FLOOR + 6, 150));
    // flying jacket
    if (t < swap) {
      const k = prog(t, 11.84, swap, 'in');
      const jx = lerp(-300, p.x, k), jy = lerp(700, p.y - 120 * sc, k);
      o.push(`<g transform="translate(${f1(jx)} ${f1(jy)}) rotate(${f1(lerp(-40, 0, k))}) scale(${f1(sc)})"><path d="M-60 -90C-80 -80 -90 -40 -110 40L-90 50L-56 -30L-50 90H50L56 -30L90 50L110 40C90 -40 80 -80 60 -90Z" fill="${PUFFER}" stroke="#111" stroke-width="6" stroke-linejoin="round"/><path d="M-54 -40H54M-52 10H52M-50 50H50" stroke="${QUILT}" stroke-width="5"/></g>`);
      for (let i = 0; i < 3; i++) o.push(`<path d="M${f1(jx - 200 - i * 40)} ${f1(jy - 40 + i * 40)}h${f1(130 - i * 20)}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>`);
    }
    o.push(CH.figure(p));
    const poof = prog(t, swap - 0.04, swap + 0.35, 'out');
    if (poof > 0 && poof < 1) for (let i = 0; i < 9; i++) {
      const a = i * 0.7, d = 90 + 120 * poof;
      o.push(`<circle cx="${f1(p.x + Math.cos(a) * d)}" cy="${f1(p.y - 160 + Math.sin(a) * d * 0.8)}" r="${f1(60 * (1 - poof) + 10)}" fill="#fff" opacity="${f1(0.9 * (1 - poof))}"/>`);
    }
    if (run > 0) for (let i = 0; i < 5; i++) o.push(`<path d="M${f1(p.x - 200 - i * 30)} ${f1(p.y - 300 + i * 70)}h-${160 - i * 15}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".75"/>`);
    return { svg: o.join(''), cam: { cx: 540, cy: 1000, z: 1.05 } };
  };

  // 4a. street → post-office door: "и выдвинулся на почту."
  DRAW.street = (t, l) => {
    const FLOOR = 1520, sc = 1.15;
    const k = prog(t, 13.0, 14.3, 'linear');
    const p = alex(t, lerp(80, 770, k), standHip(FLOOR, sc), sc, OUT_PUFFER, { turn: 0.5, look: [0.9, 0], mouth: 'smile' });
    const ph = walk(p, t, 1.9);
    const sw = Math.sin(ph) * 30;
    arms(p, [p.x - 60 + sw, p.y - 30], [p.x + 60 - sw, p.y - 30]);
    const inside = t > 14.1;
    const door = prog(t, 13.6, 13.95);
    const o = [streetSet(t, door)];
    if (inside) o.push(`<g opacity="${f1(1 - prog(t, 14.1, 14.4))}">${CH.figure(p)}</g>`);
    else { o.push(shadow(p.x, FLOOR + 6, 130)); o.push(CH.figure(p)); }
    o.push(rain(t, 50, 0.4));
    return { svg: o.join(''), cam: { cx: lerp(440, 640, k), cy: 1010, z: 1.0 } };
  };

  // 4b. empty post office + tumbleweed: "Людей на почте, конечно, было немного,"
  DRAW.office = (t, l) => {
    const FLOOR = 1500, sc = 1.15;
    const k = prog(t, 14.45, 15.2, 'out');
    const p = alex(t, lerp(-120, 300, k), standHip(FLOOR, sc), sc, OUT_PUFFER, { turn: 0.5, look: [0.9, 0] });
    if (k < 1) { const ph = walk(p, t, 1.9, 1 - k * 0.6); arms(p, [p.x - 60 + Math.sin(ph) * 30, p.y - 30], [p.x + 60 - Math.sin(ph) * 30, p.y - 30]); }
    else {
      const lookA = Math.sin((t - 15.2) * 3);
      p.face.turn = 0.45 * lookA; p.face.look = [lookA, -0.05]; p.face.brow = 0.6; p.face.browTilt = 0.25;
      arms(p, restL(p), restR(p));
    }
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="${FLOOR + 800}" fill="#ecebe7"/>`);
    o.push(`<rect x="-800" y="-800" width="2700" height="1200" fill="#e2e0db"/><rect x="-800" y="390" width="2700" height="16" fill="#c43a3a"/>`);
    // parcel shelves (back wall)
    o.push(`<rect x="420" y="520" width="700" height="720" fill="#d9d6cf" stroke="#9b978f" stroke-width="6"/>`);
    for (let r = 0; r < 4; r++) {
      o.push(`<rect x="420" y="${700 + r * 180}" width="700" height="12" fill="#9b978f"/>`);
      for (let i = 0; i < 6; i++) { const w = 70 + (i * 13 + r * 7) % 40, h = 60 + (i * 17 + r * 11) % 80; o.push(`<rect x="${440 + i * 110}" y="${700 + r * 180 - h}" width="${w}" height="${h}" fill="${(i + r) % 3 ? '#c99d62' : '#f2f2f0'}" stroke="#7a5a32" stroke-width="3"/>`); }
    }
    // counter + scale
    o.push(`<rect x="520" y="1180" width="800" height="${FLOOR - 1180}" fill="#e9dcc8" stroke="#a08a6a" stroke-width="6"/><rect x="500" y="1160" width="840" height="34" fill="#c43a3a"/>`);
    o.push(`<rect x="660" y="1110" width="140" height="50" rx="6" fill="#3a6ea8"/><rect x="720" y="1040" width="18" height="70" fill="#3a6ea8"/><rect x="690" y="1010" width="80" height="40" rx="6" fill="#2b2f33"/>`);
    // self-service terminal (left)
    o.push(`<rect x="70" y="760" width="200" height="${FLOOR - 760}" rx="16" fill="#f4f4f2" stroke="#9b978f" stroke-width="6"/><rect x="92" y="790" width="156" height="240" rx="8" fill="#cfe1ef"/><rect x="110" y="980" width="120" height="30" rx="8" fill="#3aa35a"/>`);
    o.push(`<rect x="-800" y="${FLOOR}" width="2700" height="800" fill="#d6d2ca"/>`);
    for (let x = -800; x < 1900; x += 140) o.push(`<path d="M${x} ${FLOOR}L${f1(540 + (x - 540) * 2.2)} ${FLOOR + 800}" stroke="#bdb8ae" stroke-width="4"/>`);
    o.push(shadow(p.x, FLOOR + 6, 130));
    o.push(CH.figure(p));
    // tumbleweed rolling across (nobody here)
    const tw = prog(t, 15.0, 16.5, 'linear');
    if (tw > 0 && tw < 1) o.push(tumbleweed(lerp(1300, -200, tw), FLOOR - 40 - Math.abs(Math.sin(tw * 14)) * 50, 46, -tw * 900));
    // crickets: "..."
    const dots = prog(t, 15.6, 15.8);
    if (dots > 0) o.push(`<g transform="translate(${f1(p.x + 120)} ${f1(CH.headPos(p)[1] - 170)}) scale(${f1(dots)})"><rect x="-80" y="-44" width="160" height="88" rx="40" fill="#fff" stroke="#141414" stroke-width="6"/><circle cx="-36" r="9"/><circle r="9"/><circle cx="36" r="9"/></g>`);
    return { svg: o.join(''), cam: { cx: 560, cy: 1020, z: 1.0 } };
  };

  // 5. self-service terminal close-up: "поэтому быстренько забираю посылку"
  DRAW.terminal = (t, l) => {
    const tap = 17.42;
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="#d9d6cf"/>`);
    o.push(`<rect x="90" y="120" width="900" height="1700" rx="50" fill="#f4f4f2" stroke="#9b978f" stroke-width="8"/>`);
    o.push(`<rect x="140" y="170" width="800" height="1180" rx="20" fill="#202326"/><rect x="160" y="190" width="760" height="1140" rx="10" fill="#f7f8fa"/>`);
    if (t < tap + 0.25) {
      o.push(`<text x="200" y="270" font-family="Montserrat" font-weight="900" font-size="40" fill="#222">Ваши посылки</text>`);
      const rows = [['№ 2045 7812 0033', 'Отправитель: магазин одежды'], ['№ 2045 7812 0471', 'Отправитель: частное лицо']];
      rows.forEach(([a, b], i) => {
        const y = 330 + i * 170;
        o.push(`<rect x="190" y="${y}" width="700" height="140" rx="16" fill="#fff" stroke="#dde1e6" stroke-width="4"/><rect x="214" y="${y + 46}" width="44" height="44" rx="8" fill="#1f4f9a"/><path d="M224 ${y + 68}l10 10l16 -20" stroke="#fff" stroke-width="7" fill="none"/>` +
          `<circle cx="310" cy="${y + 70}" r="30" fill="${i ? '#3aa3a0' : '#7b4fb8'}"/><text x="310" y="${y + 80}" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="26" fill="#fff">${i ? 'ЧЛ' : 'МО'}</text>` +
          `<text x="360" y="${y + 60}" font-family="Montserrat" font-weight="800" font-size="30" fill="#222">${a}</text><text x="360" y="${y + 100}" font-family="Montserrat" font-weight="800" font-size="24" fill="#777">${b}</text>`);
      });
      const pr = t > tap && t < tap + 0.25;
      o.push(`<rect x="200" y="1150" width="680" height="110" rx="20" fill="${pr ? '#2b8a48' : '#3aa35a'}"/><text x="540" y="1222" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="44" fill="#fff">Получить</text>`);
      if (t > tap) { const r = prog(t, tap, tap + 0.3); o.push(`<circle cx="600" cy="1205" r="${f1(30 + 200 * r)}" fill="#fff" opacity="${f1(0.5 * (1 - r))}"/>`); }
    } else {
      // "thank you" screen with a little cheerful box
      const b = prog(t, tap + 0.25, tap + 0.6, 'outBack');
      o.push(`<g transform="translate(540 600) scale(${f1(b)})"><rect x="-110" y="-90" width="220" height="180" rx="14" fill="#c99d62" stroke="#7a5a32" stroke-width="7"/><path d="M-110 -30H110" stroke="#8f6a3c" stroke-width="5"/>` +
        `<circle cx="-40" cy="10" r="12" fill="#222"/><circle cx="40" cy="10" r="12" fill="#222"/><path d="M-30 40q30 26 60 0" fill="none" stroke="#222" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M-110 0q-60 -30 -70 -90M110 0q60 -30 70 -90" fill="none" stroke="#c99d62" stroke-width="20" stroke-linecap="round"/></g>`);
      o.push(`<rect x="250" y="300" width="580" height="90" rx="40" fill="#fff" stroke="#bbb" stroke-width="4"/><text x="540" y="358" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="34" fill="#333">Спасибо, что выбрали нас!</text>`);
      o.push(`<text x="540" y="860" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="46" fill="#222">Ожидайте в зоне</text><text x="540" y="920" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="46" fill="#222">выдачи</text>`);
      o.push(`<text x="540" y="990" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="30" fill="#777">Ваша посылка уже едет к вам</text>`);
    }
    // card slot, scanner, parcel hatch
    o.push(`<rect x="200" y="1420" width="120" height="70" rx="10" fill="#2b2f33"/><rect x="215" y="1435" width="90" height="12" rx="4" fill="#7a7f86"/><rect x="420" y="1440" width="240" height="14" rx="7" fill="#2b2f33"/><rect x="760" y="1400" width="130" height="200" rx="14" fill="#2b2f33"/><rect x="780" y="1430" width="90" height="60" rx="6" fill="#5a3f9a"/>`);
    o.push(`<rect x="180" y="1560" width="460" height="200" rx="12" fill="#e1e0dc" stroke="#9b978f" stroke-width="5"/>`);
    const out = prog(t, 18.25, 18.6, 'outBack');
    if (out > 0) o.push(`<g transform="translate(410 ${f1(1660 - 70 * out)}) scale(${f1(0.6 + 0.4 * out)})">${cardboard(260, 150)}</g>`);
    // Alex's finger (white puffer sleeve) taps the button, then grabs the box
    const reach = prog(t, 16.7, 17.3, 'out'), press = Math.sin(prog(t, tap - 0.1, tap + 0.2) * Math.PI);
    let hx = lerp(1150, 640, reach), hy = lerp(1500, 1230, reach) + press * 18;
    if (t > 17.8) { const g = prog(t, 18.6, 18.95); hx = lerp(640, 470, g); hy = lerp(1230, 1600, g); }
    if (t > 19.0) { const g = prog(t, 19.0, 19.45, 'in'); hy += g * 600; }
    o.push(povArm(1150, 2200, hx, hy, 80, PUFFER, QUILT));
    return { svg: o.join(''), cam: { cx: 540, cy: 960 + (t > 18.1 ? prog(t, 18.1, 18.4) * 300 : 0), z: 1.0 + l * 0.02 } };
  };

  // 5b. walks home with the box in the rain: "и уже иду домой работать."
  DRAW.goHome = (t, l) => {
    const FLOOR = 1520, sc = 1.25;
    const k = prog(t, 19.5, 21.38, 'linear');
    const p = alex(t, lerp(700, 1500, k), standHip(FLOOR, sc), sc, OUT_PUFFER, { turn: 0.5, look: [0.9, 0], mouth: 'smile', brow: 0.55 });
    const ph = walk(p, t, 2.3);
    arms(p, [p.x - 60 + Math.sin(ph) * 30, p.y - 30], [p.x + 70, p.y - 110]);
    const o = [streetSet(t, 0)];
    o.push(shadow(p.x, FLOOR + 6, 140));
    o.push(CH.figure(p));
    o.push(`<g transform="translate(${f1(p.x + 70)} ${f1(p.y - 110)}) rotate(4) scale(${f1(sc * 0.55)})">${cardboard(260, 170).replace(/<rect[^>]*fSoft[^>]*\/>/, '')}</g>`);
    o.push(CH.figure(Object.assign({}, p, { _handsOnly: 'R' })));
    o.push(rain(t, 50, 0.4));
    return { svg: o.join(''), cam: { cx: lerp(820, 1260, k), cy: 1010, z: 1.0 } };
  };

  // 6. top-down unboxing: "Дома я её уже распаковываю."
  DRAW.unbox = (t, l) => {
    const tape = 1 - prog(t, 22.2, 22.75, 'inOut'), open = prog(t, 22.75, 23.2, 'outBack');
    const o = [tableTop()];
    o.push(`<g transform="translate(540 820) rotate(-6)">${cardboard(520, 400, open, tape)}</g>`);
    // hands: first on the box sides, then one pulls the tape
    const jig = Math.sin(t * 7) * 6;
    let L = [330, 820 + jig], Rr = [760, 800 - jig];
    if (t > 22.1 && t < 22.8) { const g = prog(t, 22.2, 22.75); Rr = [lerp(320, 820, g), lerp(800, 760, g)]; }
    if (t >= 22.75) { L = [lerp(330, 220, open), 900]; Rr = [lerp(820, 860, open), 900]; }
    o.push(povArm(170, -300, L[0], L[1], 78, HOODIE) + povArm(900, -300, Rr[0], Rr[1], 78, HOODIE));
    return { svg: o.join(''), cam: { cx: 540, cy: 960, z: 1.0 } };
  };

  // 7. top-down packing: "Дальше я пакую заказы и выдвигаюсь на почту. Их было сегодня немного,"
  DRAW.pack = (t, l) => {
    const o = [tableTop()];
    // the dark backpack on the left edge (as in the vlog)
    o.push(`<path d="M-60 980L260 1020L300 1400L-60 1440Z" fill="#3b3732" stroke="#1c1a17" stroke-width="6"/><path d="M40 1060L230 1080" stroke="#24221f" stroke-width="12" stroke-linecap="round"/>`);
    const into = prog(t, 23.9, 24.8, 'inOut'), seal = prog(t, 25.2, 25.9, 'inOut');
    const bag = [600, 760];
    // jeans slides into the bag (drawn under the bag, clipped at its mouth)
    o.push(`<defs><clipPath id="cBag"><rect x="${bag[0] - 400}" y="${bag[1] - 200}" width="800" height="1400"/></clipPath></defs>`);
    if (into < 1) o.push(`<g clip-path="url(#cBag)"><g transform="translate(${f1(lerp(560, bag[0], into))} ${f1(lerp(1290, 820, into))}) rotate(${f1(lerp(12, 0, into))})">${jeans(300, 1, 1)}</g></g>`);
    o.push(`<g transform="translate(${bag[0]} ${bag[1]}) rotate(${f1(-8 + 4 * seal)})">${mailer(440, 520, seal)}</g>`);
    if (into > 0 && into < 1) o.push(`<g transform="translate(${bag[0]} ${bag[1]}) rotate(-8)"><rect x="-220" y="-${f1(260 + 114 * (1 - seal))}" width="440" height="40" fill="#f6f6f4"/></g>`);
    // second finished bag slides in
    const s2 = prog(t, 26.1, 26.55, 'outBack');
    if (s2 > 0) o.push(`<g transform="translate(${f1(lerp(1400, 860, s2))} 1250) rotate(12)">${mailer(360, 420, 1)}</g>`);
    // hands push and fold
    let L = [lerp(420, 470, into), lerp(1400, 900, into)], Rr = [lerp(760, 740, into), lerp(1400, 940, into)];
    if (t > 25.0) { L = [lerp(470, 470, seal), lerp(900, 540, seal)]; Rr = [lerp(740, 760, seal), lerp(940, 560, seal)]; }
    if (t > 26.0) { L = [480, 600 + Math.sin(t * 10) * 10]; Rr = [760, 620 - Math.sin(t * 10) * 10]; }
    o.push(povArm(250, 2300, L[0], L[1], 78, HOODIE) + povArm(900, 2300, Rr[0], Rr[1], 78, HOODIE));
    return { svg: o.join(''), cam: { cx: 540, cy: 960, z: 1.0 } };
  };

  // 8. "всего лишь две штуки." — two bags drop in, counted
  DRAW.two = (t, l) => {
    const o = [tableTop()];
    const b1 = prog(t, 27.2, 27.55, 'outBack'), b2 = prog(t, 27.75, 28.1, 'outBack');
    o.push(`<g transform="translate(360 ${f1(lerp(-400, 820, b1))}) rotate(-10)">${mailer(380, 460, 1)}</g>`);
    o.push(`<g transform="translate(730 ${f1(lerp(-400, 900, b2))}) rotate(8)">${mailer(380, 460, 1)}</g>`);
    const badge = (x, y, n, k) => k > 0 ? `<g transform="translate(${x} ${y}) scale(${f1(k)})"><circle r="62" fill="#ffd84a" stroke="#141414" stroke-width="8"/><text y="28" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="80" fill="#141414">${n}</text></g>` : '';
    o.push(badge(330, 560, 1, prog(t, 27.7, 27.95, 'outBack')), badge(760, 640, 2, prog(t, 28.48, 28.75, 'outBack')));
    // Alex pops up from the bottom edge, proud
    const up = prog(t, 28.5, 28.9, 'outBack');
    if (up > 0) {
      const p = alex(t, 820, 2330 - 420 * up, 1.6, OUT_HOODIE, { turn: -0.3, look: [-0.6, -0.6], brow: 0.65, eye: 1.15, mouth: 'smile' });
      arms(p, [p.x - 200, p.y - 330], [p.x + 200, p.y - 330]);
      talk(p, t);
      o.push(CH.figure(p));
    }
    return { svg: o.join(''), cam: { cx: 540, cy: 960, z: 1.0 } };
  };

  // 9. post counter: "Было двое заказов по почте"
  DRAW.counter = (t, l) => {
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="#e2e0db"/><rect x="-800" y="160" width="2700" height="16" fill="#c43a3a"/>`);
    o.push(`<rect x="-800" y="-800" width="2700" height="600" fill="#cfccc5"/>`);
    // monitor, card terminal, operator area
    o.push(`<rect x="560" y="300" width="360" height="240" rx="10" fill="#2b2f33"/><rect x="576" y="316" width="328" height="190" fill="#cfe1ef"/><rect x="720" y="540" width="40" height="80" fill="#2b2f33"/>`);
    o.push(`<rect x="-800" y="620" width="2700" height="2000" fill="url(#gCounter)"/><rect x="-800" y="600" width="2700" height="30" fill="#9b8a72"/>`);
    o.push(`<g transform="translate(260 640) rotate(-4)"><rect x="-70" y="-150" width="140" height="240" rx="16" fill="#2b2f33" stroke="#0c0c0c" stroke-width="5"/><rect x="-52" y="-130" width="104" height="70" rx="6" fill="#6fb4d8"/>` +
      Array.from({ length: 9 }, (_, i) => `<rect x="${-48 + (i % 3) * 34}" y="${-40 + Math.floor(i / 3) * 34}" width="28" height="26" rx="5" fill="#d8dde1"/>`).join('') + `</g>`);
    const b1 = prog(t, 30.0, 30.5, 'out'), b2 = prog(t, 30.55, 31.05, 'out');
    const lab = t > 31.55;
    o.push(`<g transform="translate(${f1(lerp(200, 430, b1))} ${f1(lerp(1900, 1150, b1))}) rotate(-12)">${mailer(400, 480, 1, lab)}</g>`);
    if (b2 > 0) o.push(`<g transform="translate(${f1(lerp(200, 700, b2))} ${f1(lerp(1900, 1260, b2))}) rotate(10)">${mailer(400, 480, 1, lab)}</g>`);
    if (t > 31.5 && t < 31.75) o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="#ff3b3b" opacity=".12"/>`);
    // hand places the bags
    const hk = t < 30.55 ? b1 : b2, tx = t < 30.55 ? 430 : 700, ty = t < 30.55 ? 1180 : 1290;
    const back = prog(t, 31.1, 31.5, 'in');
    o.push(povArm(-100, 2300, lerp(150, tx, hk) - back * 300, lerp(1900, ty, hk) + back * 700, 82, PUFFER, QUILT));
    return { svg: o.join(''), cam: { cx: 540, cy: 960, z: 1.0 } };
  };

  // 10. meeting the client: "и одна личная встреча с клиентом. Тут клиент уже смотрит свой товар,
  //     ему всё понравилось, и он его забирает."
  DRAW.client = (t, l) => {
    const FLOOR = 1560, sc = 1.3;
    const a = alex(t, 290, standHip(FLOOR, sc), sc, OUT_PUFFER, { turn: 0.45, look: [0.9, -0.05] });
    // client walks in from the right, later leaves with the jeans
    const inK = prog(t, 32.3, 33.5, 'out'), leave = prog(t, 37.45, 38.66, 'in');
    const c = Object.assign({ x: lerp(1350, 790, inK) + leave * 700, y: standHip(FLOOR, sc), sc }, CLIENT);
    c.legL = [-8, 2]; c.legR = [8, -2]; c.lean = wob(t, 0.4, 5); c.headTilt = wob(t, 0.5, 6) * 1.5;
    c.face = { turn: -0.45, look: [-0.9, -0.05], mouth: 'flat', brow: 0.3, eye: 1.0, pupil: 1.0, blink: blink(t, [33.9, 36.6]) };
    if (inK < 1) { const ph = walk(c, t, 1.9, 1 - inK); }
    if (leave > 0) { walk(c, t, 2.0); c.face.turn = 0.45; c.face.look = [1, 0]; }
    // jeans: in Alex's hands → given (34.0) → held up by the client (34.6–36.0) → under the client's arm
    const give = prog(t, 33.95, 34.45, 'inOut');
    const ah = CH.headPos(a), ch = CH.headPos(c);
    let jx, jy, jh = 330, jw = 1;
    if (give <= 0) { jx = a.x + 150; jy = a.y - 230; }
    else if (t < 36.1) { jx = lerp(a.x + 150, c.x - 20, give); jy = lerp(a.y - 230, ch[1] + 120, give); if (t > 34.6) jy += Math.sin((t - 34.6) * 3) * 10; }
    else { const g = prog(t, 36.1, 36.6); jx = c.x - 20 + g * 70; jy = lerp(ch[1] + 120, c.y - 210, g); jh = lerp(330, 240, g); jw = lerp(1, 0.6, g); }
    // Alex's arms
    let awl = restL(a), awr = restR(a);
    if (give < 1) { awl = [jx - 80, jy + 20]; awr = [jx + 80, jy + 20]; }
    if (t < 33.0) { const w = Math.sin(t * 12); awr = [a.x + 160 + w * 30, ah[1] - 30]; }                // wave hello
    if (t > 34.6 && t < 37.3) { awl = [a.x - 80, a.y - 20]; awr = [a.x + 80, a.y - 40]; a.face.mouth = 'smile'; a.face.brow = 0.5; }
    // cash: client → Alex at 37.1
    const pay = prog(t, 37.0, 37.4, 'inOut');
    if (t > 37.0) { awr = [lerp(a.x + 140, a.x + 120, pay), a.y - 160]; a.face.eye = 1.2; a.face.brow = 0.75; a.face.mouth = 'smile'; }
    arms(a, awl, awr);
    // client's arms
    let cwl = [c.x - 72 * sc, c.y - 22 * sc], cwr = [c.x + 72 * sc, c.y - 22 * sc];
    if (give > 0.6 && t < 36.1) { cwl = [jx - 90, jy + 20]; cwr = [jx + 70, jy + 20]; c.face.look = [-0.3, 0.6]; c.face.turn = -0.2; c.face.brow = 0.45; }
    if (t > 35.2 && t < 36.1) { c.face.look = [-0.5, 0.9]; c.face.browTilt = 0.2; }
    if (t >= 36.1) { cwr = [c.x + 60, c.y - 200]; c.face.mouth = 'smile'; c.face.brow = 0.6; c.face.look = [-0.9, -0.1]; c.headTilt += Math.sin((t - 36.1) * 12) * 4 * (1 - prog(t, 36.8, 37.0)); }
    if (t > 36.95 && t < 37.45) cwl = [lerp(c.x - 100, a.x + 160, pay), a.y - 170];
    if (leave > 0) cwl = [c.x - 50, c.y - 40];
    arms(c, cwl, cwr);
    talk(a, t, false);
    const o = [streetSet(t, 0).replace(/ПОЧТА/, '')];
    o.push(`<rect x="-800" y="1150" width="2700" height="240" fill="#4a4d52" opacity=".9"/>`);
    for (let x = -800; x < 1900; x += 70) o.push(`<rect x="${x}" y="1180" width="12" height="210" fill="#26282b"/>`);
    o.push(`<rect x="-800" y="1170" width="2700" height="16" fill="#26282b"/>`);
    o.push(shadow(a.x, FLOOR + 6, 150), shadow(c.x, FLOOR + 6, 150));
    o.push(CH.figure(a), CH.figure(c));
    const jrot = t >= 36.1 ? lerp(0, 70, prog(t, 36.1, 36.6)) : 0;
    o.push(`<g transform="translate(${f1(jx)} ${f1(jy)}) rotate(${f1(jrot)})">${jeans(jh, jw)}</g>`);
    o.push(CH.figure(Object.assign({}, a, { _handsOnly: 'LR' })), CH.figure(Object.assign({}, c, { _handsOnly: 'LR' })));
    if (t > 37.0) { const bx = t < 37.4 ? lerp(c.x - 100, a.x + 140, pay) : a.x + 120; o.push(bills(2, bx, a.y - 190, -10, 0.8)); }
    // heart "ему всё понравилось"
    const h = prog(t, 36.25, 36.55, 'outBack') * (1 - prog(t, 37.3, 37.5));
    if (h > 0) o.push(`<path d="${CH.heart(ch[0] + 20, ch[1] - 190, 60 * h)}" fill="#ff4d6d" stroke="#141414" stroke-width="7"/>`);
    return { svg: o.join(''), cam: { cx: 545, cy: 1000, z: 1.15 } };
  };

  // 11. cash-in terminal: "Дальше я закинул деньги на карточку"
  DRAW.atm = (t, l) => {
    const o = [];
    o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="#c9c6c0"/>`);
    o.push(`<rect x="110" y="-100" width="860" height="2100" rx="40" fill="#f1f1ef" stroke="#8d8a84" stroke-width="8"/>`);
    o.push(`<rect x="150" y="-60" width="780" height="620" rx="16" fill="#111"/><rect x="170" y="-40" width="740" height="580" rx="8" fill="url(#gBlue)"/>`);
    const amt = Math.round(clamp((t - 39.25) / 1.0) * 2) * 500;
    o.push(`<text x="210" y="80" font-family="Montserrat" font-weight="800" font-size="34" fill="#cfe0ff">Пополнение карты</text>`);
    o.push(`<rect x="210" y="130" width="660" height="170" rx="24" fill="#ffffff" opacity=".12"/><text x="240" y="190" font-family="Montserrat" font-weight="800" font-size="32" fill="#cfe0ff">К зачислению</text>` +
      `<text x="840" y="270" text-anchor="end" font-family="Montserrat" font-weight="900" font-size="78" fill="#fff">${amt} ₴</text>`);
    o.push(`<rect x="330" y="380" width="420" height="96" rx="48" fill="#0d1a3a"/><text x="540" y="442" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="38" fill="#fff">Зачислить</text>`);
    o.push(`<rect x="110" y="660" width="860" height="230" fill="#1d1f22"/><text x="540" y="810" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="120" fill="#f1f1ef" letter-spacing="4">bank</text>`);
    // bill acceptor
    o.push(`<rect x="300" y="1000" width="480" height="210" rx="20" fill="#2b2f33"/><rect x="340" y="1080" width="400" height="26" rx="13" fill="#060606"/><rect x="340" y="1130" width="400" height="10" rx="5" fill="#3aa35a" opacity="${t % 0.4 < 0.2 ? 1 : 0.3}"/>`);
    // bills go in one by one
    const n = 3;
    for (let i = 0; i < n; i++) {
      const s0 = 39.1 + i * 0.4, k = prog(t, s0, s0 + 0.3, 'in');
      if (k >= 1) continue;
      o.push(`<defs><clipPath id="cSlot${i}"><rect x="0" y="1093" width="1080" height="2000"/></clipPath></defs>`);
      o.push(`<g clip-path="url(#cSlot${i})">${bills(1, 540, lerp(1260, 1000, k) + i * 40 * (1 - prog(t, 38.9, s0)), 0, 2.4).replace('rotate(4)', 'rotate(0)').replace('rotate(-3)', 'rotate(0)')}</g>`);
    }
    const hk = Math.min(prog(t, 38.75, 39.05, 'out'), 1 - prog(t, 40.2, 40.45, 'in'));
    o.push(povArm(900, 2300, 640, lerp(2000, 1340, hk), 84, PUFFER, QUILT));
    return { svg: o.join(''), cam: { cx: 540, cy: 900, z: 1.0 + l * 0.03 } };
  };

  // 12. evening, home: "и на этом, в принципе, мой день закончился."
  DRAW.night = (t, l) => {
    const FLOOR = 1470, sc = 1.3;
    const p = alex(t, 560, standHip(FLOOR, sc), sc, OUT_HOODIE, { turn: 0.05, look: [0, 0], mouth: 'smile', brow: 0.4 });
    const st = prog(t, 40.6, 41.0, 'inOut') * (1 - prog(t, 41.8, 42.1));
    const head = CH.headPos(p);
    arms(p, [lerp(p.x - 72 * sc, p.x - 140, st), lerp(p.y - 22 * sc, head[1] - 200, st)], [lerp(p.x + 72 * sc, p.x + 140, st), lerp(p.y - 22 * sc, head[1] - 200, st)]);
    if (st > 0.3) { p.face.mouth = 'o'; p.face.open = 0.8 * st; p.face.blink = 0.85; }      // big yawn
    p.sqY = 1 + 0.04 * st;
    if (t > 41.9) { p.face.blink = 0.6; p.face.mouth = 'smile'; }
    const o = [roomSet(true)];
    // a little desk lamp that clicks off at the end
    const lampOn = t < 42.05;
    o.push(`<rect x="840" y="1270" width="220" height="200" fill="#5a4636"/><path d="M900 1270l20 -120l-50 -40" fill="none" stroke="#222" stroke-width="10" stroke-linecap="round"/><path d="M840 1100l60 -50l50 60Z" fill="#2b2f33"/>`);
    if (lampOn) o.push(`<circle cx="900" cy="1110" r="420" fill="url(#gLamp)"/>`);
    o.push(shadow(p.x, FLOOR + 6, 150));
    o.push(CH.figure(p));
    if (st > 0.5) o.push(`<text x="${f1(head[0] + 170)}" y="${f1(head[1] - 120)}" font-family="Montserrat" font-weight="900" font-size="70" fill="#fff" stroke="#141414" stroke-width="8" paint-order="stroke" opacity="${f1(st)}">z<tspan font-size="50" dy="-30">z</tspan></text>`);
    if (!lampOn) o.push(`<rect x="-800" y="-800" width="2700" height="3600" fill="#05060c" opacity=".72"/>`);
    return { svg: o.join(''), cam: { cx: 560, cy: 1000, z: 1.1 + l * 0.02 } };
  };

  // ---------------- captions like the vlog: short lowercase chunks, white with a black outline ----------------
  const W = T.words;
  const SHOW = { 'две': '2' };
  const chunks = [];
  {
    let cur = [];
    const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
    W.forEach((w, i) => {
      const len = cur.reduce((a, k) => a + W[k].w.length + 1, 0);
      if (cur.length && (cur.length >= 3 || len + w.w.length > 24 || w.s - W[cur[cur.length - 1]].e > 0.35)) flush();
      cur.push(i);
      if (/[.!?,]$/.test(w.w) && cur.length >= 2) flush();
    });
    flush();
  }
  const capText = c => c.map(i => SHOW[W[i].w.replace(/[^а-яё0-9a-z-]/gi, '').toLowerCase()] || W[i].w).join(' ').replace(/[.,!?]/g, '').toLowerCase();
  function caption(t) {
    for (let k = 0; k < chunks.length; k++) {
      const s = W[chunks[k][0]].s - 0.05, e = chunks[k + 1] ? Math.min(W[chunks[k + 1][0]].s - 0.05, W[chunks[k][chunks[k].length - 1]].e + 0.5) : W[chunks[k][chunks[k].length - 1]].e + 0.5;
      if (t >= s && t < e) return `<div class="cap">${capText(chunks[k])}</div>`;
    }
    return '';
  }

  // ---------------- frame ----------------
  const DEFS = `<defs>${CH.defs()}
    <filter id="fSoft"><feGaussianBlur stdDeviation="10"/></filter>
    <radialGradient id="gFlash"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".25" stop-color="#fffbe8" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="gLamp"><stop offset="0" stop-color="#ffd98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aeb5bb"/><stop offset="1" stop-color="#e3e6e8"/></linearGradient>
    <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141c3a"/><stop offset="1" stop-color="#3b3f6a"/></linearGradient>
    <linearGradient id="gWet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    <linearGradient id="gMarble" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d7b77"/><stop offset=".5" stop-color="#8e8c87"/><stop offset="1" stop-color="#6f6d69"/></linearGradient>
    <linearGradient id="gWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4f7a"/><stop offset=".55" stop-color="#7a5f9a"/><stop offset="1" stop-color="#e08a6a"/></linearGradient>
    <linearGradient id="gTable" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f2ef"/><stop offset="1" stop-color="#dcdad5"/></linearGradient>
    <radialGradient id="gTableShade" cx=".5" cy=".4" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></radialGradient>
    <linearGradient id="gCounter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe9df"/><stop offset="1" stop-color="#d9d1c3"/></linearGradient>
    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e6fe0"/><stop offset="1" stop-color="#174bb0"/></linearGradient>
    <linearGradient id="gDenim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d8389"/><stop offset=".5" stop-color="#5f656b"/><stop offset="1" stop-color="#6c7278"/></linearGradient>
  </defs>`;
  const subsEl = document.getElementById('subs');
  const svg = document.getElementById('svg');
  window.renderFrame = function (t) {
    const [t0, kind] = shotAt(t);
    const r = DRAW[kind](t, t - t0);
    const c = r.cam;
    // handheld phone camera: small drift + rotation
    const hx = wob(t, 0.9, 1.3) * 9, hy = wob(t, 0.8, 4.1) * 9, hr = wob(t, 0.6, 2.2) * 0.6;
    const o = [DEFS];
    o.push(`<g transform="translate(${f1(540 + hx)} ${f1(960 + hy)}) rotate(${hr.toFixed(3)}) scale(${(c.z * 1.03).toFixed(4)}) translate(${f1(-c.cx)} ${f1(-c.cy)})">${r.svg}</g>`);
    o.push(`<defs><radialGradient id="gVig" cx=".5" cy=".5" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVig)"/>`);
    const fade = prog(t, T.duration - 0.45, T.duration - 0.05, 'in');
    if (fade > 0) o.push(`<rect width="1080" height="1920" fill="#000" opacity="${fade.toFixed(3)}"/>`);
    svg.innerHTML = o.join('');
    subsEl.innerHTML = caption(t);
  };
})();
