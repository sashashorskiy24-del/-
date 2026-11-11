// "Alex's First Flight" — shared airplane cabin set + character looks.
// Used by every airplane scene so the background, seat layout and characters stay identical.
(function (g) {
  const { f1, lerp } = A;

  // ---- fixed layout (world coordinates) ----
  const VP = [700, 820];                       // vanishing point (looking down the cabin, aisle on the right)
  const FLOOR = 1585;                          // floor line in front of Alex's row
  const ALEX = { x: 270, hip: 1440, sc: 0.85 };            // window seat
  const STEW = { x: 880, feet: 1720, sc: 1.0 };            // standing in the aisle
  const WINDOW = { cx: 52, cy: 1110, rx: 66, ry: 98 };     // Alex's window on the left wall
  const SEATS = [[270, 'L'], [545, 'M']];                  // Alex's row: window + middle seat (aisle is to the right)

  // character looks (kept identical across scenes)
  // the original black Alex, drawn closer to the reference art: one seamless silhouette, thicker limbs
  const ALEX_LOOK = { smooth: true, armW: 40, legW: 52, shX: 1.3, hipX: 1.35, shoeSc: 1.25, headSc: 1.12, eyeSc: 1.18, handSc: 1.5 };
  const STEW_LOOK = { kind: 'stewardess' };

  const defs = () => `<defs>
    <linearGradient id="gCabWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9d6cf"/><stop offset="1" stop-color="#ece9e3"/></linearGradient>
    <linearGradient id="gCabCeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2ee"/><stop offset="1" stop-color="#e2dfd8"/></linearGradient>
    <linearGradient id="gSeat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c5591"/><stop offset=".5" stop-color="#3767a8"/><stop offset="1" stop-color="#284e86"/></linearGradient>
    <linearGradient id="gSkyW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fa6e0"/><stop offset=".7" stop-color="#b9dcf5"/><stop offset="1" stop-color="#e3f1fb"/></linearGradient>
    <linearGradient id="gCarpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4a66"/><stop offset="1" stop-color="#26324a"/></linearGradient>
    <radialGradient id="gCabLight" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#fff8e6" stop-opacity=".55"/><stop offset="1" stop-color="#fff8e6" stop-opacity="0"/></radialGradient>
    <filter id="fBlurA"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>`;

  // depth scaling towards the vanishing point
  const D = (x, y, s) => [VP[0] + (x - VP[0]) * s, VP[1] + (y - VP[1]) * s];

  // a passenger seat seen from the front, centred at x, cushion top at y, scale s
  function seat(x, y, s, highlight) {
    const w = 250 * s, h = 470 * s;
    const x0 = x - w / 2, top = y - h + 60 * s;
    return `<g>` +
      `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(42 * s)}" fill="url(#gSeat)" stroke="#16294a" stroke-width="${f1(6 * s)}"/>` +
      `<rect x="${f1(x0 + 26 * s)}" y="${f1(top + 18 * s)}" width="${f1(w - 52 * s)}" height="${f1(92 * s)}" rx="${f1(24 * s)}" fill="#f1f0ec" stroke="#b9b6ae" stroke-width="${f1(4 * s)}"/>` +
      `<path d="M${f1(x0 + 40 * s)} ${f1(top + 150 * s)}V${f1(y - 30 * s)}M${f1(x0 + w - 40 * s)} ${f1(top + 150 * s)}V${f1(y - 30 * s)}" stroke="#244a80" stroke-width="${f1(6 * s)}" stroke-linecap="round"/>` +
      `<rect x="${f1(x0 + 8 * s)}" y="${f1(y - 20 * s)}" width="${f1(w - 16 * s)}" height="${f1(70 * s)}" rx="${f1(26 * s)}" fill="#3a6bad" stroke="#16294a" stroke-width="${f1(6 * s)}"/>` +
      `<rect x="${f1(x0 - 14 * s)}" y="${f1(y - 70 * s)}" width="${f1(26 * s)}" height="${f1(110 * s)}" rx="${f1(10 * s)}" fill="#9aa1a9" stroke="#4d545b" stroke-width="${f1(4 * s)}"/>` +
      `<rect x="${f1(x0 + w - 12 * s)}" y="${f1(y - 70 * s)}" width="${f1(26 * s)}" height="${f1(110 * s)}" rx="${f1(10 * s)}" fill="#9aa1a9" stroke="#4d545b" stroke-width="${f1(4 * s)}"/>` +
      `<rect x="${f1(x0 + 20 * s)}" y="${f1(y + 50 * s)}" width="${f1(14 * s)}" height="${f1(FLOOR - y - 50 * s)}" fill="#4d545b"/><rect x="${f1(x0 + w - 34 * s)}" y="${f1(y + 50 * s)}" width="${f1(14 * s)}" height="${f1(FLOOR - y - 50 * s)}" fill="#4d545b"/>` +
      `</g>`;
  }

  function windowView(t, cx, cy, rx, ry) {
    // sky, drifting clouds and the ground far below
    const id = 'cw' + Math.round(cx) + '_' + Math.round(cy);
    let o = `<clipPath id="${id}"><ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}"/></clipPath><g clip-path="url(#${id})">`;
    o += `<rect x="${f1(cx - rx)}" y="${f1(cy - ry)}" width="${f1(2 * rx)}" height="${f1(2 * ry)}" fill="url(#gSkyW)"/>`;
    // ground far below (patchwork fields)
    const gy = cy + ry * 0.45;
    o += `<rect x="${f1(cx - rx)}" y="${f1(gy)}" width="${f1(2 * rx)}" height="${f1(ry)}" fill="#8fb37a"/>`;
    for (let i = 0; i < 8; i++) {
      const x = cx - rx + ((i * 37 + t * 22 * rx / 60) % (2 * rx + 40)) - 20;
      o += `<rect x="${f1(x)}" y="${f1(gy + (i % 3) * ry * 0.12)}" width="${f1(rx * 0.35)}" height="${f1(ry * 0.1)}" fill="${['#c9b77a', '#6f9a5e', '#a8c48a'][i % 3]}"/>`;
    }
    for (let i = 0; i < 4; i++) {
      const x = cx - rx + ((i * 61 + t * 40 * rx / 60) % (2 * rx + 80)) - 40, y = cy - ry * 0.4 + (i % 2) * ry * 0.45;
      o += `<g fill="#fff" opacity=".9"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx * 0.32)}" ry="${f1(ry * 0.07)}"/><ellipse cx="${f1(x + rx * 0.12)}" cy="${f1(y - ry * 0.05)}" rx="${f1(rx * 0.18)}" ry="${f1(ry * 0.07)}"/></g>`;
    }
    o += `</g>`;
    o += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="none" stroke="#c9c5bd" stroke-width="${f1(rx * 0.18)}"/>`;
    o += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx * 1.09)}" ry="${f1(ry * 1.06)}" fill="none" stroke="#a9a59d" stroke-width="3"/>`;
    o += `<path d="M${f1(cx - rx * 0.7)} ${f1(cy - ry * 0.72)}Q${f1(cx)} ${f1(cy - ry * 1.02)} ${f1(cx + rx * 0.7)} ${f1(cy - ry * 0.72)}" fill="none" stroke="#e8e5df" stroke-width="${f1(rx * 0.16)}" stroke-linecap="round"/>`;
    return o;
  }

  // the cabin behind Alex's row (everything except his own row)
  function cabin(t) {
    const o = [];
    o.push(`<rect x="-900" y="-600" width="2900" height="3200" fill="#cfccc5"/>`);
    // ceiling, side walls, floor/aisle — one-point perspective
    const far = 0.18;
    const fL = D(-500, 300, far), fR = D(1700, 300, far), bL = D(-500, FLOOR, far), bR = D(1700, FLOOR, far);
    o.push(`<path d="M-900 -600H2000L${f1(fR[0])} ${f1(fR[1])}H${f1(fL[0])}Z" fill="url(#gCabCeil)"/>`);
    o.push(`<path d="M-900 -600L${f1(fL[0])} ${f1(fL[1])}V${f1(bL[1])}L-900 2600Z" fill="url(#gCabWall)"/>`);
    o.push(`<path d="M2000 -600L${f1(fR[0])} ${f1(fR[1])}V${f1(bR[1])}L2000 2600Z" fill="#e3e0da"/>`);
    o.push(`<rect x="${f1(fL[0])}" y="${f1(fL[1])}" width="${f1(fR[0] - fL[0])}" height="${f1(bL[1] - fL[1])}" fill="#d6d3cc"/>`);
    // galley curtain at the back
    const c0 = D(560, 600, far), c1 = D(840, FLOOR, far);
    o.push(`<rect x="${f1(c0[0])}" y="${f1(c0[1])}" width="${f1(c1[0] - c0[0])}" height="${f1(c1[1] - c0[1])}" fill="#2f4a78"/>`);
    o.push(`<path d="M-900 2600L${f1(bL[0])} ${f1(bL[1])}H${f1(bR[0])}L2000 2600Z" fill="#8e9097"/>`);
    // aisle carpet
    const a0 = D(700, FLOOR, far), a1 = D(1080, FLOOR, far);
    o.push(`<path d="M${f1(a0[0])} ${f1(a0[1])}H${f1(a1[0])}L1180 2600H600Z" fill="url(#gCarpet)"/>`);
    for (let i = 0; i < 9; i++) { const k = 0.2 + i * 0.1; const p = D(700, FLOOR, k), q = D(1080, FLOOR, k); o.push(`<path d="M${f1(p[0])} ${f1(p[1])}H${f1(q[0])}" stroke="#4b5b7a" stroke-width="${f1(3 + 5 * k)}" opacity=".6"/>`); }
    // ceiling light strip + overhead bins (both sides)
    for (const side of [-1, 1]) {
      const xin = side < 0 ? 560 : 860, xout = side < 0 ? -500 : 1700;
      const p1 = D(xout, 420, 1), p2 = D(xin, 420, 1), p3 = D(xin, 420, far), p4 = D(xout, 420, far);
      o.push(`<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(p2[0])} ${f1(p2[1])}L${f1(p3[0])} ${f1(p3[1])}L${f1(p4[0])} ${f1(p4[1])}Z" fill="#f3f1ec" stroke="#c9c5bd" stroke-width="3"/>`);
      const q1 = D(xout, 640, 1), q2 = D(xin, 640, 1), q3 = D(xin, 640, far), q4 = D(xout, 640, far);
      o.push(`<path d="M${f1(p2[0])} ${f1(p2[1])}L${f1(q2[0])} ${f1(q2[1])}L${f1(q3[0])} ${f1(q3[1])}L${f1(p3[0])} ${f1(p3[1])}Z" fill="#e6e3dd" stroke="#c9c5bd" stroke-width="3"/>`);
      for (let k = 0.3; k < 1; k += 0.17) { const a = D(xin, 420, k), b = D(xin, 640, k); o.push(`<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="#c9c5bd" stroke-width="${f1(2 + 3 * k)}"/>`); }
    }
    const l0 = D(620, 330, 1), l1 = D(800, 330, 1), l2 = D(800, 330, far), l3 = D(620, 330, far);
    o.push(`<path d="M${f1(l0[0])} ${f1(l0[1])}L${f1(l1[0])} ${f1(l1[1])}L${f1(l2[0])} ${f1(l2[1])}L${f1(l3[0])} ${f1(l3[1])}Z" fill="#fffbe9"/>`);
    o.push(`<rect x="-900" y="-600" width="2900" height="1600" fill="url(#gCabLight)"/>`);
    // windows receding on the left wall
    for (const k of [0.32, 0.45, 0.62]) { const c = D(WINDOW.cx, WINDOW.cy, k); o.push(windowView(t, c[0], c[1], WINDOW.rx * k, WINDOW.ry * k)); }
    // rows of seats behind Alex's row (left block + right block across the aisle)
    for (const k of [0.3, 0.38, 0.48, 0.6, 0.76]) {
      for (const x of [270, 545, 1180, 1455]) { const c = D(x, ALEX.hip, k); o.push(seat(c[0], c[1], k)); }
    }
    // Alex's own window (next to him)
    o.push(windowView(t, WINDOW.cx, WINDOW.cy, WINDOW.rx, WINDOW.ry));
    o.push(`<path d="M-900 ${FLOOR}H700" stroke="#7d8087" stroke-width="4"/>`);
    return o.join('');
  }

  // Alex's row: seat backs drawn behind the people, armrests in front
  const rowBack = () => SEATS.map(([x]) => seat(x, ALEX.hip + 10, 1)).join('');
  // seat cushion front (over the thighs, so a seated character reads as sitting) + armrests
  const rowFront = () => SEATS.map(([x]) =>
    `<rect x="${x - 118}" y="${ALEX.hip + 8}" width="236" height="62" rx="26" fill="#3a6bad" stroke="#16294a" stroke-width="6"/>` +
    `<path d="M${x - 96} ${ALEX.hip + 22}H${x + 96}" stroke="#4f80c2" stroke-width="7" stroke-linecap="round"/>` +
    `<rect x="${x - 139}" y="${ALEX.hip - 60}" width="26" height="120" rx="10" fill="#9aa1a9" stroke="#4d545b" stroke-width="4"/><rect x="${x + 113}" y="${ALEX.hip - 60}" width="26" height="120" rx="10" fill="#9aa1a9" stroke="#4d545b" stroke-width="4"/>`).join('');

  g.AIR = { VP, FLOOR, ALEX, STEW, WINDOW, ALEX_LOOK, STEW_LOOK, defs, cabin, rowBack, rowFront, windowView, seat };
})(window);
