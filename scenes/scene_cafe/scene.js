// Scene "Café" — the couple's thoughts and Sanya's spit-take.
// Voice-over fragment 29.2s–44.8s of the full file (see timing.json, words[] are in scene time).
(function () {
  const { kf, prog, blink, wob, clamp, lerp, f1, E } = A;
  const T = window.TIMING;
  const W = T.words;
  const at = i => W[i].s;
  const end = i => W[i].e;

  const FLOOR = 1500;

  // ---------------- key moments (from the voice-over) ----------------
  const K = {
    cafe: at(3),            // "café"                       0.88
    sees: at(5),            // "he sees a couple"           1.68
    together: at(9),        // "together"                   2.72
    guyThinks: at(10),      // "The guy is thinking"        3.44
    shes: at(14),           // "She's the love of my life"  4.88
    love: at(16),           // "love"                       5.36
    lucky: at(22),          // "lucky"                      7.12
    luckyEnd: end(22),      //                              7.33
    girlThinks: at(23),     // "But the girl is thinking"   8.08
    oh: at(28),             // "Oh my God"                  9.76
    when: at(31),           // "when is this guy..."        10.88
    stop: at(37),           // "stop"                       11.92
    talking: at(38),        // "talking?"                   12.4
    talkingEnd: end(38),    //                              12.67
    sanya: at(39),          // "Sanya can't believe..."     13.28
    hearing: at(44),        // "hearing"                    15.04
  };
  const SPIT = K.talking + 0.2;   // spit-take lands right on the end of "talking?"

  // ---------------- characters' base placement ----------------
  const SAN = { x: 300, y: 1455, sc: 0.85 };
  const GUY = { x: 832, y: 1448, sc: 0.9 };
  const GIRL = { x: 1192, y: 1458, sc: 0.86 };
  const TABLE_Y = 1385;

  function mixCol(a, b, k) {
    const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
    return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join('');
  }

  // ---------------- background ----------------
  function defs() {
    return `<defs>
      <linearGradient id="gWallC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e6d3"/><stop offset="1" stop-color="#e8d5bd"/></linearGradient>
      <linearGradient id="gSkyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc7ef"/><stop offset="1" stop-color="#e6f3fb"/></linearGradient>
      <linearGradient id="gFloorC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9845a"/><stop offset="1" stop-color="#946342"/></linearGradient>
      <linearGradient id="gBeamC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4cf" stop-opacity=".5"/><stop offset="1" stop-color="#fff4cf" stop-opacity="0"/></linearGradient>
      <radialGradient id="gLampC"><stop offset="0" stop-color="#ffd98f" stop-opacity=".8"/><stop offset="1" stop-color="#ffd98f" stop-opacity="0"/></radialGradient>
      <radialGradient id="gWarm" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".18"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>
      <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="fBlur8C"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="fBlur20C"><feGaussianBlur stdDeviation="22"/></filter>
    </defs>`;
  }

  let BG = null;  // static part of the background, built once
  function background() {
    if (BG) return BG;
    const o = [];
    o.push(`<rect x="-800" y="-900" width="3000" height="${FLOOR + 900}" fill="url(#gWallC)"/>`);
    // subtle wallpaper dots
    for (let y = -560; y < 1160; y += 70) for (let x = -760 + ((y / 70) % 2) * 35; x < 2200; x += 70) o.push(`<circle cx="${x}" cy="${y}" r="3" fill="#d9c2a5" opacity=".45"/>`);
    // wainscot
    o.push(`<rect x="-800" y="1170" width="3000" height="${FLOOR - 1170}" fill="#7f9f88"/>`);
    for (let x = -780; x < 2200; x += 150) o.push(`<rect x="${x}" y="1200" width="120" height="${FLOOR - 1240}" rx="6" fill="none" stroke="#6c8c75" stroke-width="6"/>`);
    o.push(`<rect x="-800" y="1158" width="3000" height="20" fill="#f6efe4"/><rect x="-800" y="1176" width="3000" height="5" fill="#5f7f68" opacity=".5"/>`);
    // ---- arched window (behind the couple)
    const wx0 = 780, wx1 = 1240, wcx = 1010, wr = 230, wTop = 610, wBot = 1158;
    const arch = `M${wx0} ${wBot}V${wTop}A${wr} ${wr} 0 0 1 ${wx1} ${wTop}V${wBot}Z`;
    o.push(`<clipPath id="cWin"><path d="${arch}"/></clipPath>`);
    o.push(`<g clip-path="url(#cWin)">`);
    o.push(`<rect x="${wx0}" y="300" width="${wx1 - wx0}" height="900" fill="url(#gSkyC)"/>`);
    o.push(`<g fill="#fff" opacity=".85"><ellipse cx="880" cy="470" rx="60" ry="18"/><ellipse cx="905" cy="455" rx="34" ry="20"/><ellipse cx="1150" cy="560" rx="50" ry="14"/></g>`);
    // building across the street
    o.push(`<rect x="770" y="620" width="300" height="560" fill="#cf8f6d"/><rect x="1070" y="700" width="200" height="480" fill="#b9a38a"/>`);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o.push(`<rect x="${800 + c * 66}" y="${660 + r * 110}" width="40" height="64" rx="4" fill="#f6e2b8" opacity=".9"/>`);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) o.push(`<rect x="${1095 + c * 80}" y="${730 + r * 105}" width="46" height="60" fill="#d8eef8"/>`);
    o.push(`<path d="M790 940h260l-20 40H810Z" fill="#e2675d"/><path d="M790 980h240" stroke="#fff" stroke-width="6" stroke-dasharray="20 20"/>`);
    // tree + street
    o.push(`<rect x="1180" y="900" width="18" height="260" fill="#6b4a32"/><circle cx="1190" cy="880" r="80" fill="#6aa86f"/><circle cx="1140" cy="920" r="55" fill="#5d9963"/><circle cx="1240" cy="930" r="55" fill="#7bb87e"/>`);
    o.push(`<rect x="770" y="1090" width="480" height="80" fill="#9aa3ad"/><rect x="770" y="1086" width="480" height="8" fill="#c9cfd5"/>`);
    o.push(`</g>`);
    o.push(`<path d="${arch}" fill="none" stroke="#2b2b2b" stroke-width="16"/>`);
    o.push(`<path d="M${wcx} ${wTop - wr}V${wBot}M${wx0} ${wTop}H${wx1}M${wx0} 890H${wx1}" stroke="#2b2b2b" stroke-width="9"/>`);
    o.push(`<rect x="${wx0 - 24}" y="${wBot - 8}" width="${wx1 - wx0 + 48}" height="24" rx="6" fill="#f6efe4"/>`);
    // potted plant on the sill + hanging plant
    o.push(`<path d="M820 1150l8-50h56l8 50Z" fill="#e48b6a"/><path d="M856 1100c-26-40-50-40-58-26 20 0 38 10 58 26Zm0 0c6-46 28-62 40-56-16 12-28 30-40 56Zm0 0c22-26 50-28 54-14-20 2-36 8-54 14Z" fill="#4f8a60"/>`);
    o.push(`<path d="M690 -900V420" stroke="#6e5a44" stroke-width="3"/><path d="M650 420h80l-10 56h-60Z" fill="#f2efe8" stroke="#cfc6b8" stroke-width="4"/>`);
    o.push(`<g fill="#5d9963"><path d="M660 470c-10 60-30 110-20 170 8-40 16-80 30-120Z"/><path d="M700 470c0 80 10 130 30 190 0-60-4-110-14-190Z"/><path d="M680 470c-6 50-4 100 4 140 6-40 6-90 4-140Z" fill="#6aa86f"/></g>`);
    for (const [x, y] of [[652, 560], [646, 610], [714, 560], [724, 620], [684, 590]]) o.push(`<ellipse cx="${x}" cy="${y}" rx="12" ry="7" fill="#7bb87e"/>`);
    // ---- neon sign above the window
    o.push(`<g transform="translate(1010 300)">`);
    o.push(`<rect x="-200" y="-90" width="400" height="150" rx="24" fill="#3a2a2a" opacity=".08"/>`);
    o.push(`<text x="-20" y="30" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="120" fill="none" stroke="#ff5fa2" stroke-width="16" opacity=".55" filter="url(#fGlow)">café</text>`);
    o.push(`<text x="-20" y="30" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="120" fill="none" stroke="#ffd1e6" stroke-width="6">café</text>`);
    o.push(`<g transform="translate(150 -10)"><path d="M-30 -20h52v36a16 16 0 0 1-16 16h-20a16 16 0 0 1-16-16Z M22 -10q22 0 22 14t-22 14" fill="none" stroke="#ffb34d" stroke-width="14" opacity=".5" filter="url(#fGlow)"/><path d="M-30 -20h52v36a16 16 0 0 1-16 16h-20a16 16 0 0 1-16-16Z M22 -10q22 0 22 14t-22 14" fill="none" stroke="#ffe2b3" stroke-width="5"/></g>`);
    o.push(`</g>`);
    // ---- chalkboard menu (behind Sanya)
    o.push(`<rect x="66" y="500" width="420" height="440" rx="14" fill="#8a5a35"/><rect x="86" y="520" width="380" height="400" rx="6" fill="#2f3a35"/>`);
    const chalk = (x, y, s, txt, anchor = 'start', w = 600) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Fredoka" font-weight="${w}" font-size="${s}" fill="#f1eee4" opacity=".92">${txt}</text>`;
    o.push(chalk(276, 600, 64, 'MENU', 'middle', 700));
    o.push(`<path d="M150 622h252" stroke="#f1eee4" stroke-width="4" stroke-dasharray="10 8" opacity=".7"/>`);
    const items = [['Latte', '4'], ['Cappuccino', '4'], ['Cocoa', '3'], ['Croissant', '3']];
    items.forEach(([n, pr], i) => { o.push(chalk(120, 690 + i * 56, 36, n)); o.push(chalk(430, 690 + i * 56, 36, pr, 'end')); o.push(`<path d="M${130 + n.length * 19} ${680 + i * 56}H${400}" stroke="#f1eee4" stroke-width="3" stroke-dasharray="3 9" opacity=".55"/>`); });
    o.push(`<path d="M370 880c-4-14 10-22 18-12 8-10 22-2 18 12l-18 18Z" fill="none" stroke="#ff9fb3" stroke-width="4"/>`);
    o.push(`<path d="M130 870h44v24a12 12 0 0 1-12 12h-20a12 12 0 0 1-12-12Z M174 876q14 0 14 10t-14 10" fill="none" stroke="#f1eee4" stroke-width="4"/>`);
    // ---- wall shelf left
    o.push(`<rect x="-260" y="760" width="250" height="14" rx="4" fill="#8a5a35"/>`);
    o.push(`<path d="M-240 760l6-46h44l6 46Z" fill="#e8dccb"/><path d="M-212 714c-14-30 6-44 16-34-6 10-10 20-16 34Z" fill="#5d9963"/>`);
    o.push(`<rect x="-160" y="700" width="40" height="60" rx="8" fill="#c98b5a"/><rect x="-110" y="716" width="40" height="44" rx="8" fill="#e7b54b"/><rect x="-62" y="690" width="36" height="70" rx="8" fill="#8fb3a0"/>`);
    // ---- counter (right)
    o.push(`<rect x="1350" y="640" width="560" height="14" rx="4" fill="#8a5a35"/><rect x="1350" y="820" width="560" height="14" rx="4" fill="#8a5a35"/>`);
    for (let i = 0; i < 7; i++) o.push(`<rect x="${1370 + i * 72}" y="${590 - (i % 2) * 10}" width="50" height="${50 + (i % 2) * 10}" rx="10" fill="${['#e7b54b', '#c98b5a', '#f2efe8', '#8fb3a0'][i % 4]}"/>`);
    for (let i = 0; i < 6; i++) o.push(`<path d="M${1380 + i * 86} 820l4-40h46l4 40Z" fill="#fbf8f2" stroke="#d8cfc0" stroke-width="3"/>`);
    o.push(`<rect x="1360" y="1130" width="560" height="24" rx="6" fill="#f2eee8"/><rect x="1370" y="1154" width="540" height="${FLOOR - 1154}" fill="#a8774f"/>`);
    for (let x = 1390; x < 1900; x += 40) o.push(`<rect x="${x}" y="1170" width="22" height="${FLOOR - 1190}" rx="6" fill="#b98658"/>`);
    // espresso machine + pastry dome
    o.push(`<rect x="1560" y="1000" width="200" height="130" rx="18" fill="#c9ced6" stroke="#5c636d" stroke-width="5"/><rect x="1580" y="1020" width="160" height="30" rx="8" fill="#a4abb5"/><circle cx="1610" cy="1080" r="14" fill="#2f2f2f"/><circle cx="1710" cy="1080" r="14" fill="#2f2f2f"/><rect x="1600" y="1094" width="20" height="26" fill="#2f2f2f"/><rect x="1700" y="1094" width="20" height="26" fill="#2f2f2f"/>`);
    o.push(`<path d="M1400 1130a70 70 0 0 1 140 0Z" fill="#e8f4fb" opacity=".6" stroke="#bcd3df" stroke-width="4"/><path d="M1420 1126c10-24 40-24 50 0Zm40 0c10-24 40-24 50 0Z" fill="#e7a94b" stroke="#9a5e1f" stroke-width="3"/>`);
    // ---- floor
    o.push(`<rect x="-800" y="${FLOOR}" width="3000" height="1400" fill="url(#gFloorC)"/>`);
    let y = FLOOR, gap = 34, row = 0;
    while (y < 2800) {
      o.push(`<rect x="-800" y="${f1(y)}" width="3000" height="3" fill="#7d5235" opacity=".45"/>`);
      for (let x = -800 + (row % 2) * 150; x < 2200; x += 300) o.push(`<rect x="${x}" y="${f1(y)}" width="3" height="${f1(gap)}" fill="#7d5235" opacity=".35"/>`);
      y += gap; gap *= 1.12; row++;
    }
    o.push(`<rect x="-800" y="${FLOOR - 22}" width="3000" height="26" fill="#f6efe4"/>`);
    // window light on the floor
    o.push(`<path d="M780 1500H1240L1420 2100H620Z" fill="url(#gBeamC)" opacity=".7"/>`);
    BG = o.join('');
    return BG;
  }

  function lamps(t) {
    let o = '';
    for (const [x, yL] of [[330, 160], [1010, 60], [1640, 160]]) {
      o += `<path d="M${x} -900V${yL - 60}" stroke="#3b2f25" stroke-width="4"/>`;
      o += `<circle cx="${x}" cy="${yL + 40}" r="${f1(150 + 4 * Math.sin(t * 2 + x))}" fill="url(#gLampC)"/>`;
      o += `<path d="M${x - 70} ${yL}A70 70 0 0 1 ${x + 70} ${yL}Z" fill="#d9a441" stroke="#8a6420" stroke-width="5"/><rect x="${x - 10}" y="${yL - 80}" width="20" height="20" rx="4" fill="#8a6420"/>`;
      o += `<circle cx="${x}" cy="${yL + 10}" r="20" fill="#fff4cf"/>`;
    }
    return o;
  }

  function chair(x, hipY, sc) {
    const s = sc, c = '#6b4528', hi = '#8a5d38';
    const top = hipY - 165 * s, seat = hipY + 14 * s, foot = FLOOR + 110;
    return `<g>` +
      `<path d="M${f1(x - 62 * s)} ${f1(seat)}V${f1(top + 40 * s)}Q${f1(x - 62 * s)} ${f1(top)} ${f1(x)} ${f1(top)}Q${f1(x + 62 * s)} ${f1(top)} ${f1(x + 62 * s)} ${f1(top + 40 * s)}V${f1(seat)}" fill="none" stroke="${c}" stroke-width="${f1(16 * s)}" stroke-linecap="round"/>` +
      `<path d="M${f1(x - 40 * s)} ${f1(top + 50 * s)}H${f1(x + 40 * s)}" stroke="${hi}" stroke-width="${f1(12 * s)}" stroke-linecap="round"/>` +
      `<path d="M${f1(x - 64 * s)} ${f1(seat + 6)}L${f1(x - 74 * s)} ${foot}M${f1(x + 64 * s)} ${f1(seat + 6)}L${f1(x + 74 * s)} ${foot}" stroke="${c}" stroke-width="${f1(14 * s)}" stroke-linecap="round"/>` +
      `<rect x="${f1(x - 80 * s)}" y="${f1(seat - 4)}" width="${f1(160 * s)}" height="${f1(22 * s)}" rx="${f1(10 * s)}" fill="${hi}" stroke="${c}" stroke-width="4"/></g>`;
  }

  function table(cx, w) {
    const y = TABLE_Y;
    return `<g><ellipse cx="${cx}" cy="${FLOOR + 140}" rx="${w * 0.42}" ry="16" fill="#3a2410" opacity=".25" filter="url(#fBlur8C)"/>` +
      `<rect x="${cx - 10}" y="${y + 20}" width="20" height="${FLOOR + 120 - y - 20}" fill="#2f2f2f"/>` +
      `<path d="M${cx - 80} ${FLOOR + 136}Q${cx} ${FLOOR + 100} ${cx + 80} ${FLOOR + 136}Z" fill="#2f2f2f"/>` +
      `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="26" rx="13" fill="#f4f1ec" stroke="#3b3b3b" stroke-width="5"/>` +
      `<rect x="${cx - w / 2 + 14}" y="${y + 4}" width="${w - 60}" height="6" rx="3" fill="#fff"/></g>`;
  }

  function tableProps(t) {
    // couple's table: flower vase + slice of cake
    return `<g><path d="M1000 ${TABLE_Y}l-12-46q12-10 24 0l-12 46Z" fill="#cfe6f2" stroke="#6f8ea0" stroke-width="4"/>` +
      `<path d="M1000 1340q-6-40 0-70" stroke="#4f8a60" stroke-width="5" fill="none"/>` +
      `<g transform="translate(1000 1262) rotate(${f1(Math.sin(t * 1.5) * 4)})"><circle r="10" fill="#ffd84a"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${f1(Math.cos(a * Math.PI / 180) * 18)}" cy="${f1(Math.sin(a * Math.PI / 180) * 18)}" rx="12" ry="9" fill="#ff7aa2" transform="rotate(${a} ${f1(Math.cos(a * Math.PI / 180) * 18)} ${f1(Math.sin(a * Math.PI / 180) * 18)})"/>`).join('')}<circle r="9" fill="#ffd84a"/></g>` +
      `<ellipse cx="1080" cy="${TABLE_Y - 2}" rx="46" ry="10" fill="#e9eef3" stroke="#7d8b99" stroke-width="3"/><path d="M1052 ${TABLE_Y - 6}l44-10v-26l-44 10Z" fill="#f6dfb0" stroke="#7a5230" stroke-width="3"/><path d="M1052 ${TABLE_Y - 32}l44-10" stroke="#ff7aa2" stroke-width="8"/><circle cx="1090" cy="${TABLE_Y - 46}" r="7" fill="#e2384f"/></g>`;
  }

  // ---------------- characters ----------------
  const chatterMouth = (t, k = 1) => 0.2 + 0.6 * k * Math.abs(Math.sin(t * 13.3)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 5.1 + 1)));

  function sanyaPose(t) {
    const p = { x: SAN.x, y: SAN.y, sc: SAN.sc, legK: [0.32, 1], legL: [-40, 40], legR: [40, -40] };
    p.lean = 0; p.headTilt = wob(t, 0.4, 1) * 1.5;
    const f = { turn: 0.2, look: [0.3, -0.1], mouth: 'smile', open: 0, brow: 0, browTilt: 0, eye: 1, pupil: 1 };
    f.blink = blink(t, [2.4, 5.2, 8.5, 10.6, 14.1]);

    // ----- head direction: café sip -> watches the couple -> stares at camera
    f.turn = kf(t, [[0, 0.1], [K.sees - 0.1, 0.1], [K.sees + 0.3, 0.55], [SPIT, 0.55], [SPIT + 0.15, 0.4], [K.sanya + 0.6, 0.4], [K.sanya + 1.0, 0.08]]);
    f.look = kf(t, [[0, [0, -0.1]], [K.sees - 0.1, [0, -0.1]], [K.sees + 0.25, [0.95, -0.1]], [8.3, [0.95, -0.1]], [8.6, [0.95, 0.1]], [SPIT, [0.9, 0]], [K.sanya + 0.6, [0.9, 0]], [K.sanya + 1.0, [0, 0.05]]]);
    p.headTilt += kf(t, [[K.guyThinks, 0], [K.guyThinks + 0.5, 6], [K.girlThinks, 6], [K.girlThinks + 0.4, 9]]);

    // ----- cup: sip (0.2-1.4), rests, sip again from 8.7 until the spit-take
    const mouth = CH.mouthPos(Object.assign({}, p, { face: f }));
    const rest = [SAN.x + 92, TABLE_Y - 30];
    const lip = [mouth[0] + 74, mouth[1] + 18];
    const drink = Math.max(prog(t, 0.15, 0.6) * (1 - prog(t, 1.25, 1.65)), prog(t, 8.7, 9.15) * (1 - prog(t, SPIT - 0.04, SPIT + 0.12, 'out')));
    let wr = [lerp(rest[0], lip[0], drink), lerp(rest[1], lip[1], drink)];
    if (t > SPIT) {   // cup jerks away, then trembles
      const k = prog(t, SPIT, SPIT + 0.25, 'out');
      wr = [lerp(lip[0], rest[0] + 30, k), lerp(lip[1], rest[1] - 60, k)];
      wr[1] += kf(t, [[SPIT + 0.25, 0], [K.sanya, 40]]);
      wr[0] += Math.sin(t * 70) * 2.5 * prog(t, K.sanya, K.sanya + 0.3);
    }
    p.armR = CH.armIK(p, 1, wr[0], wr[1], -1);
    p.handR = 'fist'; p.itemR = 'cup';
    p.itemTiltR = -48 * drink + (t > SPIT ? kf(t, [[SPIT, -40], [SPIT + 0.15, 18], [SPIT + 0.5, -6], [SPIT + 0.8, 0]]) : 0);
    const wl = [SAN.x - 70, TABLE_Y - 6];
    p.armL = CH.armIK(p, -1, wl[0], wl[1], 1);
    p.handL = 'fist';

    // ----- faces through the beats
    if (drink > 0.6 && t < 2) { f.sleep = true; f.mouth = 'o'; f.open = 0.05; }          // blissful first sip
    if (t > 2 && t < SPIT) {                                                             // amused eavesdropper
      f.brow = kf(t, [[K.guyThinks, 0], [K.guyThinks + 0.4, 0.5], [K.girlThinks, 0.4], [K.girlThinks + 0.3, 0.7]]);
      f.browTilt = -0.15;
      if (drink > 0.5) { f.mouth = 'o'; f.open = 0.05; }
    }
    // spit-take
    if (t >= K.talking && t < SPIT) { f.eye = lerp(1, 1.35, prog(t, K.talking, SPIT)); f.pupil = 0.6; }
    if (t >= SPIT) {
      const cough = t > SPIT + 0.35 && t < K.sanya;
      f.mouth = 'o';
      f.open = t < SPIT + 0.35 ? 1 : cough ? 0.35 + 0.35 * Math.abs(Math.sin(t * 18)) : 0.3;
      if (cough) { f.sleep = true; f.brow = -0.3; f.browTilt = 0.5; }
      else { f.eye = t < K.sanya ? 1.45 : kf(t, [[K.sanya, 1.2], [K.sanya + 0.25, 1.5, 'outBack']]); f.pupil = 0.42; f.brow = 1.0; f.browTilt = 0.35; }
      p.lean = kf(t, [[SPIT, 0], [SPIT + 0.1, 9, 'out'], [SPIT + 0.4, 4], [K.sanya, 3], [K.sanya + 0.3, -2]]);
      if (cough) p.lean += Math.max(0, Math.sin(t * 18)) * 4;
      p.sqY = kf(t, [[K.sanya, 1], [K.sanya + 0.1, 1.06, 'out'], [K.sanya + 0.25, 0.98], [K.sanya + 0.4, 1]]);
      p.sqX = 2 - p.sqY;
    }
    p.face = f;
    return p;
  }

  function guyPose(t) {
    const p = { kind: 'guy', x: GUY.x, y: GUY.y, sc: GUY.sc, legK: [0.32, 1], legL: [-38, 38], legR: [38, -38] };
    const dreamy = t > K.guyThinks - 0.05 && t < 7.75;
    const f = { turn: 0.5, look: [0.9, -0.05], mouth: 'smile', open: 0, brow: 0.2 };
    f.blink = blink(t, [1.2, 3.1, 9.0, 11.4]);
    p.lean = 4 + wob(t, 0.5, 3) * 1.5;
    p.headTilt = 4;
    // chin-on-hand dreaming vs. non-stop talking with hands
    const head = CH.headPos(p);
    const dk = dreamy ? prog(t, K.guyThinks - 0.05, K.guyThinks + 0.4) * (1 - prog(t, 7.6, 7.95)) : 0;
    const gR = [GUY.x + 125 + Math.sin(t * 4.3) * 24, GUY.y - 105 + Math.cos(t * 5.7) * 22];
    const gL = [GUY.x - 115 + Math.sin(t * 3.7 + 1) * 20, GUY.y - 95 + Math.cos(t * 4.9) * 22];
    const chin = [head[0] + 34, head[1] + 94];
    const rest = [GUY.x + 70, TABLE_Y - 8];
    const wR = [lerp(gR[0], chin[0], dk), lerp(gR[1], chin[1], dk)];
    const wL = [lerp(gL[0], rest[0] - 150, dk), lerp(gL[1], rest[1], dk)];
    p.armR = CH.armIK(p, 1, wR[0], wR[1], dk > 0.5 ? 1 : -1);
    p.armL = CH.armIK(p, -1, wL[0], wL[1], 1);
    p.handR = dk > 0.5 ? 'fist' : 'open'; p.handL = dk > 0.5 ? 'fist' : 'open';
    p.handRotR = dk > 0.5 ? 180 : 0;
    if (!dreamy) {                  // chatterbox
      f.mouth = 'open'; f.open = chatterMouth(t);
      f.brow = 0.4 + 0.3 * Math.sin(t * 3); p.headTilt += Math.sin(t * 6) * 3;
    } else {
      p.headTilt = lerp(4, 14, dk);
      f.heart = prog(t, K.shes - 0.1, K.shes + 0.25, 'outBack') * (1 + 0.12 * Math.sin(t * 9)) * (1 - prog(t, 7.6, 7.8));
      f.blush = prog(t, K.guyThinks, K.guyThinks + 0.5);
      f.brow = 0.5; f.browTilt = 0.35;
      if (t > K.lucky && t < K.luckyEnd + 0.3) { f.sleep = true; p.headTilt += 4; }   // happy sigh
    }
    p.face = f;
    return p;
  }

  function girlPose(t) {
    const p = { kind: 'girl', x: GIRL.x, y: GIRL.y, sc: GIRL.sc, legK: [0.32, 1], legL: [-34, 34], legR: [34, -34] };
    const bored = t > 9.4;
    const f = { turn: -0.48, look: [-0.9, -0.05], mouth: 'smile', open: 0, brow: 0.15 };
    f.blink = blink(t, [0.9, 2.9, 5.6, 7.1, 11.0]);
    p.lean = -3; p.headTilt = -4 + (bored ? 0 : Math.sin(t * 3.2) * 2.5);   // polite nodding
    const head = CH.headPos(p);
    const cupW = [GIRL.x - 70, TABLE_Y - 30];
    p.armL = CH.armIK(p, -1, cupW[0], cupW[1], 1); p.handL = 'fist'; p.itemL = 'cup';
    const bk = prog(t, 9.4, 9.9);
    const chin = [head[0] + 38, head[1] + 92];
    const lap = [GIRL.x + 40, TABLE_Y - 6];
    p.armR = CH.armIK(p, 1, lerp(lap[0], chin[0], bk), lerp(lap[1], chin[1], bk), 1);
    p.handR = 'fist'; p.handRotR = bk > 0.5 ? 180 : 0;
    f.mouth = t > 3.2 ? 'tight' : 'smile';
    if (bored) {
      p.headTilt = lerp(-4, -12, bk) + Math.sin(t * 2.2) * 2;    // head sinks onto the hand
      f.lid = 0.45;
      // eye roll on "Oh my God"
      const roll = prog(t, K.oh - 0.05, K.oh + 0.35) * (1 - prog(t, 10.6, 10.95));
      f.look = [lerp(-0.6, 0.15, roll), lerp(-0.05, -1, roll)];
      f.lid = lerp(0.45, 0.2, roll);
      f.brow = lerp(0.1, 0.6, roll); f.browTilt = 0.15;
      // twitch on "stop talking"
      if (t > K.stop && t < K.talkingEnd) { f.browTilt = 0.5 + Math.sin(t * 50) * 0.25; f.lid = 0.55; }
    }
    p.face = f;
    return p;
  }

  // ---------------- FX ----------------
  function telepathy(t, head, a, b) {
    if (t < a || t > b + 0.5) return '';
    const g = prog(t, a, a + 0.4) * (1 - prog(t, b, b + 0.5));
    let o = `<circle cx="${f1(head[0])}" cy="${f1(head[1])}" r="${f1(115 + 8 * Math.sin(t * 8))}" fill="#7fe8ff" opacity="${f1(0.35 * g)}" filter="url(#fBlur20C)"/>`;
    for (let i = 0; i < 3; i++) {
      const k = ((t - a) * 1.1 + i / 3) % 1;
      o += `<circle cx="${f1(head[0])}" cy="${f1(head[1])}" r="${f1(100 + k * 90)}" fill="none" stroke="#bff3ff" stroke-width="${f1(6 * (1 - k))}" opacity="${f1((1 - k) * 0.8 * g)}"/>`;
    }
    return o;
  }

  function cloud(blobs, fill, ink) {
    return `<g fill="${ink}">${blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 6}"/>`).join('')}</g>` +
      `<g fill="${fill}">${blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
  }
  const BLOBS = [[-190, 10, 105], [-105, -85, 115], [20, -112, 125], [145, -75, 110], [205, 30, 95], [125, 115, 105], [0, 132, 115], [-125, 112, 100], [0, 10, 200]];

  function trail(t, from, to, a, z) {
    let o = '';
    [0.18, 0.4, 0.64].forEach((k, i) => {
      const s = prog(t, a + i * 0.08, a + i * 0.08 + 0.22, 'outBack') * (1 - prog(t, z, z + 0.2, 'in'));
      if (s > 0.01) o += `<circle cx="${f1(lerp(from[0], to[0], k))}" cy="${f1(lerp(from[1], to[1], k))}" r="${f1((14 + i * 8) * s)}" fill="#fff" stroke="#1b1b1b" stroke-width="6"/>`;
    });
    return o;
  }

  function loveBubble(t, guyHead, girlP) {
    const a = K.shes - 0.3, z = 7.7;
    if (t < a || t > z + 0.4) return '';
    const cx = 800, cy = 640;
    let o = trail(t, [guyHead[0] - 20, guyHead[1] - 110], [cx + 40, cy + 190], a, z);
    const pop = prog(t, a + 0.2, a + 0.65, 'outBack') * (1 - prog(t, z, z + 0.25, 'in'));
    if (pop < 0.01) return o;
    o += `<g transform="translate(${cx} ${f1(cy + Math.sin(t * 2.2) * 6)}) scale(${f1(pop)})">`;
    o += cloud(BLOBS, '#fff2f6', '#1b1b1b');
    // floating little hearts inside the cloud
    for (let i = 0; i < 7; i++) {
      const k = ((t * 0.35 + i / 7) % 1);
      const x = -170 + i * 56 + Math.sin(k * 6 + i) * 14, y = 120 - k * 260;
      o += `<path d="${CH.heart(x, y, 14 + (i % 3) * 5)}" fill="#ff8fb0" opacity="${f1(Math.sin(k * Math.PI) * 0.8)}"/>`;
    }
    // big heart with the girl's portrait
    const beat = 1 + 0.06 * Math.max(0, Math.sin(t * 7));
    o += `<g transform="scale(${f1(beat)})"><path d="${CH.heart(0, 10, 150)}" fill="#ff4f7e" stroke="#7a0f2a" stroke-width="8"/>`;
    o += `<path d="M-95 -70q-30 30-20 70" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>`;
    o += `<g transform="translate(0 -12) scale(0.62)">${CH.headOnly({ kind: 'girl', face: { turn: 0, look: [0, 0], mouth: 'smile', blush: 1, blink: blink(t, [6.3]) } })}</g></g>`;
    // sparkles
    for (const [x, y, s, ph] of [[-180, -60, 18, 0], [175, -40, 22, 1.5], [150, 110, 14, 3], [-160, 100, 16, 4.2]]) {
      const k = 0.6 + 0.4 * Math.sin(t * 5 + ph);
      o += `<path d="M${x} ${y - s * k}L${x + s * 0.3 * k} ${y}L${x} ${y + s * k}L${x - s * 0.3 * k} ${y}Z M${x - s * k} ${y}L${x} ${y + s * 0.3 * k}L${x + s * k} ${y}L${x} ${y - s * 0.3 * k}Z" fill="#ffc94a"/>`;
    }
    o += '</g>';
    return o;
  }

  function guyHearts(t, head) {
    if (t < K.shes || t > 7.9) return '';
    let o = '';
    for (let i = 0; i < 5; i++) {
      const k = ((t - K.shes) * 0.6 + i / 5) % 1;
      const fade = Math.sin(k * Math.PI) * (1 - prog(t, 7.5, 7.9));
      const x = head[0] + 60 + Math.sin(k * 7 + i * 2) * 30 + (i - 2) * 18, y = head[1] - 60 - k * 220;
      o += `<path d="${CH.heart(x, y, 16 + (i % 2) * 6)}" fill="#ff4f7e" stroke="#7a0f2a" stroke-width="3" opacity="${f1(fade)}"/>`;
    }
    return o;
  }

  function boredBubble(t, girlHead) {
    const a = K.oh - 0.3, z = SPIT - 0.25;
    if (t < a || t > z + 0.4) return '';
    const cx = 1150, cy = 610;
    let o = trail(t, [girlHead[0] - 10, girlHead[1] - 110], [cx - 20, cy + 190], a, z);
    const pop = prog(t, a + 0.2, a + 0.65, 'outBack') * (1 - prog(t, z, z + 0.25, 'in'));
    if (pop < 0.01) return o;
    o += `<g transform="translate(${cx} ${f1(cy + Math.sin(t * 2) * 5)}) scale(${f1(pop)})">`;
    o += cloud(BLOBS, '#e4e8ef', '#2a2f3a');
    // little rain cloud
    o += `<g transform="translate(-20 -150)"><g fill="#8d96a6"><circle cx="-30" cy="0" r="26"/><circle cx="0" cy="-12" r="32"/><circle cx="32" cy="0" r="24"/><rect x="-56" y="0" width="112" height="22" rx="11"/></g>`;
    for (let i = 0; i < 5; i++) { const k = (t * 2.2 + i / 5) % 1; o += `<path d="M${-40 + i * 20} ${30 + k * 40}l-4 12" stroke="#6fa8dc" stroke-width="5" stroke-linecap="round" opacity="${f1(1 - k)}"/>`; }
    o += `</g>`;
    // the girl, inside her head: eyes rolled, totally done
    const roll = 0.5 + 0.5 * Math.sin(t * 2.5);
    o += `<g transform="translate(-10 40) scale(0.68) rotate(${f1(Math.sin(t * 1.8) * 6)})">${CH.headOnly({ kind: 'girl', face: { turn: 0, look: [lerp(-0.4, 0.4, roll), -1], lid: 0.35, mouth: 'flat', brow: 0.2, browTilt: 0.6 } })}</g>`;
    // spinning clock
    o += `<g transform="translate(-175 20)"><circle r="54" fill="#fff" stroke="#2a2f3a" stroke-width="7"/>`;
    for (let i = 0; i < 12; i++) o += `<circle cx="${f1(Math.cos(i * Math.PI / 6) * 42)}" cy="${f1(Math.sin(i * Math.PI / 6) * 42)}" r="3" fill="#2a2f3a"/>`;
    o += `<path d="M0 0L${f1(Math.sin(t * 9) * 36)} ${f1(-Math.cos(t * 9) * 36)}" stroke="#e2384f" stroke-width="6" stroke-linecap="round"/><path d="M0 0L${f1(Math.sin(t * 0.9) * 24)} ${f1(-Math.cos(t * 0.9) * 24)}" stroke="#2a2f3a" stroke-width="7" stroke-linecap="round"/><circle r="6" fill="#2a2f3a"/></g>`;
    // "bla bla bla" piling up
    const blas = [[125, -50, -8], [140, 20, 6], [120, 95, -4], [55, 150, 8], [-115, 128, -10]];
    blas.forEach(([x, y, r], i) => {
      const k = prog(t, a + 0.5 + i * 0.4, a + 0.75 + i * 0.4, 'outBack');
      if (k > 0.01) o += `<text x="${x}" y="${y}" transform="rotate(${r} ${x} ${y}) scale(${f1(k)})" transform-origin="${x} ${y}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="40" fill="#5b6475">bla bla</text>`;
    });
    o += '</g>';
    return o;
  }

  function spitFX(t, origin) {
    if (t < SPIT || t > SPIT + 1.2) return '';
    const tau = t - SPIT;
    let o = '';
    // mist puff
    const mk = prog(t, SPIT, SPIT + 0.5, 'out');
    o += `<ellipse cx="${f1(origin[0] + 90 + mk * 120)}" cy="${f1(origin[1] + 10)}" rx="${f1(40 + mk * 120)}" ry="${f1(20 + mk * 50)}" fill="#8a5a36" opacity="${f1(0.35 * (1 - mk))}" filter="url(#fBlur8C)"/>`;
    for (let i = 0; i < 30; i++) {
      const r1 = Math.sin(i * 12.9898) * 43758.5453 % 1, r2 = Math.sin(i * 78.233) * 12345.6789 % 1;
      const vx = 650 + Math.abs(r1) * 650, vy = -260 + r2 * 320;
      const x = origin[0] + vx * tau, y = origin[1] + vy * tau + 0.5 * 1700 * tau * tau;
      const rr = 5 + Math.abs(r2) * 9;
      const fade = 1 - prog(tau, 0.7, 1.2, 'linear');
      o += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr * 1.3)}" ry="${f1(rr)}" transform="rotate(${f1(Math.atan2(vy + 1700 * tau, vx) * 57.3)} ${f1(x)} ${f1(y)})" fill="${i % 3 ? '#6b3f22' : '#8e5a33'}" opacity="${f1(fade)}"/>`;
    }
    return o;
  }

  function drip(t, mouth) {
    if (t < K.sanya - 0.2) return '';
    const k = prog(t, K.sanya - 0.2, K.sanya + 1.2, 'out');
    const x = mouth[0] + 12, y = mouth[1] + 16 + k * 22;
    return `<path d="M${f1(x)} ${f1(y - 14 - k * 10)}C${f1(x + 6)} ${f1(y - 4)} ${f1(x + 9)} ${f1(y + 2)} ${f1(x)} ${f1(y + 8)}C${f1(x - 9)} ${f1(y + 2)} ${f1(x - 6)} ${f1(y - 4)} ${f1(x)} ${f1(y - 14 - k * 10)}Z" fill="#6b3f22" stroke="#2a160a" stroke-width="2"/>`;
  }

  function shockMarks(t, head, cam) {
    if (t < K.sanya) return '';
    const hs = [540 + (head[0] - cam.cx) * cam.z, 960 + (head[1] - cam.cy) * cam.z];
    const pk = prog(t, K.sanya, K.sanya + 0.3, 'outBack');
    let o = '';
    // soft radial lines
    const k = prog(t, K.sanya, K.sanya + 0.25, 'out');
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2, r0 = lerp(1500, 480 + (i % 3) * 50, k), r1 = 1500, w = 0.016 + (i % 3) * 0.006;
      o += `<path d="M${f1(hs[0] + Math.cos(a) * r0)} ${f1(hs[1] + Math.sin(a) * r0)}L${f1(hs[0] + Math.cos(a - w) * r1)} ${f1(hs[1] + Math.sin(a - w) * r1)}L${f1(hs[0] + Math.cos(a + w) * r1)} ${f1(hs[1] + Math.sin(a + w) * r1)}Z" fill="#fff" opacity=".6"/>`;
    }
    o += `<g transform="translate(${f1(hs[0] + 290)} ${f1(hs[1] - 300)}) rotate(14) scale(${f1(pk)})"><text text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="170" fill="#ffd84a" stroke="#141414" stroke-width="12" paint-order="stroke">!</text></g>`;
    o += `<g transform="translate(${f1(hs[0] - 290)} ${f1(hs[1] - 270)}) rotate(-14) scale(${f1(pk)})"><text text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="140" fill="#ffd84a" stroke="#141414" stroke-width="12" paint-order="stroke">?</text></g>`;
    return o;
  }

  // ---------------- camera ----------------
  function camera(t) {
    const c = kf(t, [
      [0, [1010, 360, 1.35]],
      [0.5, [1000, 430, 1.33], 'sine'],
      [1.6, [370, 1318, 1.34]],
      [1.95, [368, 1318, 1.36], 'sine'],
      [3.15, [690, 1250, 0.92]],
      [3.4, [695, 1245, 0.93], 'sine'],
      [4.5, [985, 1070, 1.1]],
      [7.65, [975, 1040, 1.16], 'sine'],
      [8.15, [365, 1318, 1.4]],
      [9.4, [365, 1312, 1.46], 'sine'],
      [9.75, [1130, 1010, 1.08]],
      [12.35, [1140, 990, 1.16], 'sine'],
      [12.62, [360, 1302, 1.6]],
      [K.sanya, [355, 1298, 1.64], 'sine'],
      [K.sanya + 0.25, [345, 1282, 1.86], 'outBack'],
      [T.duration, [342, 1276, 1.93], 'sine'],
    ]);
    const shake = t > SPIT ? 12 * Math.exp(-(t - SPIT) * 7) : 0;
    const sh2 = t > K.sanya ? 10 * Math.exp(-(t - K.sanya) * 7) : 0;
    const rot = kf(t, [[7.65, 0], [7.9, 2], [8.15, 0], [9.4, 0], [9.6, -2], [9.75, 0], [12.35, 0], [12.5, 2.5], [12.62, 0]]);
    return { cx: c[0] + Math.sin(t * 61) * (shake + sh2), cy: c[1] + Math.cos(t * 47) * (shake + sh2), z: c[2], rot };
  }

  // ---------------- subtitles ----------------
  const subs = SUBS.makeSubs(T, [
    { w: [0, 3], text: { 3: 'café,' } },
    { w: [4, 9] },
    { w: [10, 13] },
    { w: [14, 19], cls: 'love', text: { 14: '“She’s' } },
    { w: [20, 22], cls: 'love', text: { 20: 'I’m', 22: 'lucky!”' } },
    { w: [23, 27] },
    { w: [28, 30], cls: 'bored', text: { 28: '“Oh', 30: 'God…' } },
    { w: [31, 38], cls: 'bored', text: { 38: 'talking?”' } },
    { w: [39, 44], cls: 'sanya', text: { 39: 'Sanya', 40: 'can’t', 43: 'he’s', 44: 'hearing!' } },
  ]);

  // ---------------- frame ----------------
  const svg = document.getElementById('svg');
  const subsEl = document.getElementById('subs');

  window.renderFrame = function (t) {
    const cam = camera(t);
    const sp = sanyaPose(t), gp = guyPose(t), gl = girlPose(t);
    const sHead = CH.headPos(sp), gHead = CH.headPos(gp), lHead = CH.headPos(gl);
    const sMouth = CH.mouthPos(sp);

    const o = [];
    o.push(`<defs>${CH.defs()}</defs>`, defs());
    o.push(`<g transform="translate(540 960) rotate(${f1(cam.rot)}) scale(${cam.z.toFixed(4)}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})">`);
    o.push(background(), lamps(t));
    // couple
    o.push(chair(GUY.x, GUY.y, GUY.sc), chair(GIRL.x, GIRL.y, GIRL.sc));
    o.push(CH.figure(gp), CH.figure(gl));
    o.push(table(1010, 360), tableProps(t));
    // Sanya
    o.push(chair(SAN.x, SAN.y, SAN.sc));
    o.push(telepathy(t, sHead, K.guyThinks, SPIT + 0.4));   // glow sits behind Sanya
    o.push(CH.figure(sp));
    o.push(table(330, 320));
    o.push(guyHearts(t, gHead));
    o.push(loveBubble(t, gHead, gl), boredBubble(t, lHead));
    o.push(spitFX(t, [sMouth[0] + 10, sMouth[1]]), drip(t, sMouth));
    o.push('</g>');
    o.push(`<rect width="1080" height="1920" fill="url(#gWarm)"/>`);
    o.push(`<defs><radialGradient id="gVigC" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0a" stop-opacity=".35"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#gVigC)"/>`);
    o.push(shockMarks(t, sHead, cam));
    svg.innerHTML = o.join('');
    subsEl.innerHTML = subs(t);
  };
})();
