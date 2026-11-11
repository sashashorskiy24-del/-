// Character rig: glossy black "rubber-hose" figures (Sanya/Alex, Mom, Guy, Girl, Man, Guard, Stewardess).
// Everything is drawn as SVG strings so every frame is fully deterministic.
(function (g) {
  const { f1 } = A;
  const R = 105;               // head radius (local units)
  const INK = '#070707', RIM = '#8f8f8f', BODY = '#141414';
  const ARM = [88, 82, 30];    // upper, fore, thickness
  const LEG = [138, 128, 36];
  const rad = d => (d * Math.PI) / 180;
  const lerp2 = (a, b, k) => a + (b - a) * k;

  const S = (d, w, col = BODY, ink = INK, rim = RIM) =>
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w + 10}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${rim}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const F = (d, fill = BODY, ink = INK, rim = RIM) =>
    `<path d="${d}" fill="${fill}" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${rim}" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="${fill}"/>`;
  const circ = (cx, cy, r) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
  const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;
  const P = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
  const heart = (cx, cy, s) => `M${f1(cx)} ${f1(cy + 0.42 * s)}C${f1(cx - 1.15 * s)} ${f1(cy - 0.25 * s)} ${f1(cx - 0.55 * s)} ${f1(cy - 1.05 * s)} ${f1(cx)} ${f1(cy - 0.45 * s)}C${f1(cx + 0.55 * s)} ${f1(cy - 1.05 * s)} ${f1(cx + 1.15 * s)} ${f1(cy - 0.25 * s)} ${f1(cx)} ${f1(cy + 0.42 * s)}Z`;
  let uid = 0;

  const defs = () => `
    <radialGradient id="gHead" cx="0.36" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#3c3c3c"/><stop offset="0.45" stop-color="#181818"/><stop offset="1" stop-color="#060606"/>
    </radialGradient>
    <linearGradient id="gTorso" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#262626"/><stop offset="0.5" stop-color="#151515"/><stop offset="1" stop-color="#0b0b0b"/>
    </linearGradient>
    <radialGradient id="gSkinA" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#ffdcc2"/><stop offset="0.7" stop-color="#f1bf9b"/><stop offset="1" stop-color="#d99c78"/></radialGradient>
    <radialGradient id="gSkinG" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#f6c9a6"/><stop offset="0.7" stop-color="#e3aa84"/><stop offset="1" stop-color="#c88a63"/></radialGradient>
    <linearGradient id="gOrange" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff9547"/><stop offset=".55" stop-color="#f47a2b"/><stop offset="1" stop-color="#d45a17"/></linearGradient>
    <linearGradient id="gNavy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b4167"/><stop offset=".55" stop-color="#1f3152"/><stop offset="1" stop-color="#15223a"/></linearGradient>
    <radialGradient id="gSkinB" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#e9b58a"/><stop offset="0.7" stop-color="#d29a6e"/><stop offset="1" stop-color="#b17a50"/></radialGradient>
    <radialGradient id="gRed" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="#ff3b3b"/><stop offset="0.7" stop-color="#d81f2a"/><stop offset="1" stop-color="#8e0f18"/>
    </radialGradient>
    <linearGradient id="gDress" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9708a"/><stop offset="1" stop-color="#cf4f6d"/>
    </linearGradient>`;

  // ---------- face ----------
  function face(f, kind, skin) {
    const t = f.turn, o = [];
    // feature colours: white on the glossy black heads, dark ink on skin-toned heads
    const INKF = skin ? '#2a1712' : '#fff';
    const lip = skin ? '#2a1712' : kind === 'mom' ? '#ff9fb3' : kind === 'girl' ? '#ff8fa8' : kind === 'stewardess' ? '#ff6b81' : '#ffffff';
    const eyes = [-1, 1].map(side => {
      const rx = 0.2 * R * (1 - 0.2 * t * side) * f.eye;
      let ry = 0.25 * R * f.eye * (1 - 0.3 * f.squint);
      return { side, x: (t + side * 0.39) * R, y: -0.2 * R, rx, ry };
    });
    // brows
    for (const e of eyes) {
      const by = Math.max(-0.86 * R, e.y - 0.25 * R * f.eye - 0.13 * R - f.brow * 0.13 * R);
      const inner = -e.side, w = e.rx * 1.05;
      const yi = by - f.browTilt * 0.09 * R, yo = by + f.browTilt * 0.07 * R;
      const xi = e.x + inner * w, xo = e.x - inner * w;
      o.push(`<path d="M${f1(xo)} ${f1(yo)}Q${f1(e.x)} ${f1((yi + yo) / 2 - 0.13 * R)} ${f1(xi)} ${f1(yi)}" fill="none" stroke="${INKF}" stroke-width="${f1((skin ? (skin.brows === 'thick' ? 0.12 : 0.085) : 0.066) * R)}" stroke-linecap="round"/>`);
    }
    for (const e of eyes) {
      const closed = f.sleep || f.blink > 0.82;
      if (f.happy) {
        // laughing eyes: tight upward arcs  ^ ^
        o.push(`<path d="M${f1(e.x - e.rx)} ${f1(e.y + e.rx * 0.25)}Q${f1(e.x)} ${f1(e.y - e.rx * 0.75)} ${f1(e.x + e.rx)} ${f1(e.y + e.rx * 0.25)}" fill="none" stroke="${INKF}" stroke-width="${f1(0.065 * R)}" stroke-linecap="round"/>`);
      } else if (closed) {
        const d = f.sleep ? 0.55 : 0.18;
        o.push(`<path d="M${f1(e.x - e.rx)} ${f1(e.y)}Q${f1(e.x)} ${f1(e.y + e.rx * d)} ${f1(e.x + e.rx)} ${f1(e.y)}" fill="none" stroke="${INKF}" stroke-width="${f1(0.06 * R)}" stroke-linecap="round"/>`);
      } else {
        const ry = e.ry * (1 - f.blink);
        o.push(`<path d="${ell(e.x, e.y, e.rx, ry)}" fill="#fff"${skin ? ' stroke="#141414" stroke-width="5"' : ''}/>`);
        const prx = Math.min(e.rx * 0.5 * f.pupil, e.rx * 0.85), pry = Math.min(e.ry * 0.44 * f.pupil, ry * 0.85);
        const px = e.x + f.look[0] * (e.rx - prx) * 0.92, py = e.y + f.look[1] * Math.max(0, ry - pry) * 0.92;
        if (f.heart > 0.05) {
          const hs = e.rx * 0.95 * f.heart;
          o.push(`<path d="${heart(e.x, e.y + hs * 0.2, hs)}" fill="#ff3d6e" stroke="#7a0f2a" stroke-width="3"/>`);
          o.push(`<circle cx="${f1(e.x - hs * 0.4)}" cy="${f1(e.y - hs * 0.35)}" r="${f1(hs * 0.16)}" fill="#fff"/>`);
        } else {
          o.push(`<path d="${ell(px, py, prx, pry)}" fill="#0a0a0a"/>`);
          o.push(`<circle cx="${f1(px + prx * 0.3)}" cy="${f1(py - pry * 0.38)}" r="${f1(Math.max(1.5, prx * 0.3))}" fill="#fff"/>`);
        }
        if (f.lid > 0.01) {
          const id = 'lid' + (uid++);
          o.push(`<clipPath id="${id}"><path d="${ell(e.x, e.y, e.rx, ry)}"/></clipPath>`);
          o.push(`<rect clip-path="url(#${id})" x="${f1(e.x - e.rx - 2)}" y="${f1(e.y - ry - 2)}" width="${f1(2 * e.rx + 4)}" height="${f1(2 * ry * f.lid + 2)}" fill="${skin ? skin.tone : '#161616'}"/>`);
          o.push(`<path clip-path="url(#${id})" d="M${f1(e.x - e.rx)} ${f1(e.y - ry + 2 * ry * f.lid)}H${f1(e.x + e.rx)}" stroke="#8f8f8f" stroke-width="4"/>`);
        }
      }
      if (f.lashes && !f.sleep && f.blink < 0.82) {
        const ry = e.ry * (1 - f.blink);
        for (const th of [40, 62, 84]) {
          const a = rad(th), dx = e.side * Math.sin(a), dy = -Math.cos(a);
          const x0 = e.x + e.rx * dx, y0 = e.y + ry * dy;
          o.push(`<path d="M${f1(x0)} ${f1(y0)}l${f1(dx * 11)} ${f1(dy * 11 - 2)}" stroke="${INKF}" stroke-width="5" stroke-linecap="round"/>`);
        }
      }
    }
    if (skin) {
      // eye bags, nose, stubble
      if (skin.bags) for (const e of eyes) o.push(`<path d="M${f1(e.x - e.rx * 0.8)} ${f1(e.y + e.ry + 8)}Q${f1(e.x)} ${f1(e.y + e.ry + 20)} ${f1(e.x + e.rx * 0.8)} ${f1(e.y + e.ry + 8)}" fill="none" stroke="${skin.shade}" stroke-width="5" stroke-linecap="round"/>`);
      const nx = t * 1.15 * R;
      o.push(`<path d="M${f1(nx + 0.02 * R)} ${f1(0.0 * R)}Q${f1(nx - 0.12 * R)} ${f1(0.17 * R)} ${f1(nx + 0.04 * R)} ${f1(0.2 * R)}" fill="none" stroke="#2a1712" stroke-width="5" stroke-linecap="round"/>`);
      // nasolabial folds + worry crease
      const mx0 = t * 1.25 * R;
      o.push(`<path d="M${f1(nx - 0.2 * R)} ${f1(0.15 * R)}Q${f1(mx0 - 0.3 * R)} ${f1(0.3 * R)} ${f1(mx0 - 0.27 * R)} ${f1(0.42 * R)}M${f1(nx + 0.22 * R)} ${f1(0.15 * R)}Q${f1(mx0 + 0.3 * R)} ${f1(0.3 * R)} ${f1(mx0 + 0.27 * R)} ${f1(0.42 * R)}" fill="none" stroke="${skin.shade}" stroke-width="4" stroke-linecap="round" opacity=".75"/>`);
      if (f.browTilt > 0.7) o.push(`<path d="M${f1(t * R - 0.05 * R)} ${f1(-0.52 * R)}l${f1(0.02 * R)} ${f1(0.1 * R)}M${f1(t * R + 0.05 * R)} ${f1(-0.52 * R)}l${f1(-0.02 * R)} ${f1(0.1 * R)}" stroke="${skin.shade}" stroke-width="4" stroke-linecap="round"/>`);
      if (f.browTilt < -0.3) o.push(`<path d="M${f1(t * R - 0.04 * R)} ${f1(-0.48 * R)}v${f1(0.1 * R)}M${f1(t * R + 0.04 * R)} ${f1(-0.48 * R)}v${f1(0.1 * R)}" stroke="${skin.shade}" stroke-width="4" stroke-linecap="round"/>`);
      if (skin.stubble) {
        let st = '';
        for (let i = 0; i < 95; i++) {
          const a = (0.15 + 0.7 * ((i * 0.618) % 1)) * Math.PI, rr = (0.55 + 0.38 * ((i * 0.377) % 1)) * R;
          const x = t * 0.9 * R + Math.cos(a) * rr * 0.95, y = 0.12 * R + Math.sin(a) * rr * 0.85;
          if (x * x + y * y < 0.9 * R * R) st += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9"/>`;
        }
        for (let i = 0; i < 16; i++) st += `<circle cx="${f1(t * 1.25 * R + (i - 7.5) * 0.04 * R)}" cy="${f1(0.29 * R + (i % 2) * 0.03 * R)}" r="1.8"/>`;
        o.push(`<g fill="#5e463a" opacity=".4">${st}</g>`);
      }
    }
    if (f.glasses) {
      for (const e of eyes) {
        const gw = 0.27 * R * (1 - 0.2 * t * e.side), gh = 0.22 * R;
        o.push(`<rect x="${f1(e.x - gw)}" y="${f1(e.y - gh)}" width="${f1(2 * gw)}" height="${f1(2 * gh)}" rx="${f1(0.07 * R)}" fill="#bfe3ff" fill-opacity=".14" stroke="#e9edf2" stroke-width="${f1(0.045 * R)}"/>`);
      }
      const [l, r] = eyes;
      o.push(`<path d="M${f1(l.x + 0.27 * R * (1 + 0.2 * t))} ${f1(l.y - 0.05 * R)}Q${f1((l.x + r.x) / 2)} ${f1(l.y - 0.12 * R)} ${f1(r.x - 0.27 * R * (1 - 0.2 * t))} ${f1(r.y - 0.05 * R)}" fill="none" stroke="#e9edf2" stroke-width="${f1(0.04 * R)}"/>`);
    }
    if (f.blush > 0.01) {
      for (const side of [-1, 1]) o.push(`<ellipse cx="${f1((t + side * 0.5) * R)}" cy="${f1(0.18 * R)}" rx="${f1(0.15 * R)}" ry="${f1(0.07 * R)}" fill="#ff6f91" opacity="${f1(0.75 * f.blush)}"/>`);
    }
    // mouth
    const mx = t * 1.25 * R, my = 0.37 * R, w = 0.4 * R, sw = f1(0.06 * R);
    const op = f.open;
    if (f.mouth === 'smile') {
      o.push(`<path d="M${f1(mx - w / 2)} ${f1(my - 0.02 * R)}Q${f1(mx)} ${f1(my + 0.17 * R)} ${f1(mx + w / 2)} ${f1(my - 0.02 * R)}" fill="none" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round"/>`);
    } else if (f.mouth === 'open') {
      // f.sadTalk: corners pulled down (whiny / pleading speech) instead of the default happy shape
      const d = f.sadTalk
        ? `M${f1(mx - w * 0.42)} ${f1(my + 0.08 * R)}Q${f1(mx)} ${f1(my - 0.06 * R)} ${f1(mx + w * 0.42)} ${f1(my + 0.08 * R)}Q${f1(mx)} ${f1(my + 0.1 * R + 0.38 * R * op)} ${f1(mx - w * 0.42)} ${f1(my + 0.08 * R)}Z`
        : `M${f1(mx - w / 2)} ${f1(my)}Q${f1(mx)} ${f1(my + 0.06 * R)} ${f1(mx + w / 2)} ${f1(my)}Q${f1(mx)} ${f1(my + 0.12 * R + 0.42 * R * op)} ${f1(mx - w / 2)} ${f1(my)}Z`;
      o.push(`<path d="${d}" fill="#5a1222" stroke="${lip}" stroke-width="${f1(0.045 * R)}" stroke-linejoin="round"/>`);
      if (skin && op > 0.25) {
        const id = 'mth' + (uid++);
        o.push(`<clipPath id="${id}"><path d="${d}"/></clipPath><rect clip-path="url(#${id})" x="${f1(mx - w / 2)}" y="${f1(my - 0.02 * R)}" width="${f1(w)}" height="${f1(0.09 * R)}" fill="#fbfaf4"/>`);
        o.push(`<path d="${d}" fill="none" stroke="${lip}" stroke-width="${f1(0.045 * R)}" stroke-linejoin="round"/>`);
      }
      if (op > 0.35) o.push(`<path d="${ell(mx, my + 0.05 * R + 0.2 * R * op, 0.1 * R, 0.045 * R * op)}" fill="#e2687e"/>`);
    } else if (f.mouth === 'o') {
      o.push(`<path d="${ell(mx, my + 0.05 * R, 0.08 * R + 0.07 * R * op, 0.08 * R + 0.17 * R * op)}" fill="#5a1222" stroke="${lip}" stroke-width="${f1(0.045 * R)}"/>`);
    } else if (f.mouth === 'flat') {
      o.push(`<path d="M${f1(mx - w * 0.3)} ${f1(my + 0.03 * R)}L${f1(mx + w * 0.3)} ${f1(my + 0.03 * R)}" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round"/>`);
    } else if (f.mouth === 'frown') {
      o.push(`<path d="M${f1(mx - w * 0.42)} ${f1(my + 0.1 * R)}Q${f1(mx)} ${f1(my - 0.07 * R)} ${f1(mx + w * 0.42)} ${f1(my + 0.1 * R)}" fill="none" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round"/>`);
    } else if (f.mouth === 'tight') {
      // forced polite smile: wide, flat, corners pushed up
      o.push(`<path d="M${f1(mx - w * 0.62)} ${f1(my - 0.07 * R)}Q${f1(mx - w * 0.55)} ${f1(my + 0.03 * R)} ${f1(mx - w * 0.3)} ${f1(my + 0.03 * R)}L${f1(mx + w * 0.3)} ${f1(my + 0.03 * R)}Q${f1(mx + w * 0.55)} ${f1(my + 0.03 * R)} ${f1(mx + w * 0.62)} ${f1(my - 0.07 * R)}" fill="none" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`);
    } else if (f.mouth === 'nervous') {
      const q = w / 4;
      o.push(`<path d="M${f1(mx - w / 2)} ${f1(my)}q${f1(q / 2)} ${f1(-0.06 * R)} ${f1(q)} 0t${f1(q)} 0t${f1(q)} 0t${f1(q)} 0" fill="none" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round"/>`);
    }
    if (skin && skin.beard) {
      // big bushy beard around the jaw, with a hole for the mouth
      const bx = t * 1.1 * R, hm = [t * 1.25 * R, 0.4 * R];
      const outer = `M${f1(-0.97 * R)} ${f1(-0.02 * R)}C${f1(-0.98 * R)} ${f1(0.7 * R)} ${f1(-0.5 * R)} ${f1(1.12 * R)} ${f1(bx)} ${f1(1.14 * R)}C${f1(0.5 * R)} ${f1(1.12 * R)} ${f1(0.98 * R)} ${f1(0.7 * R)} ${f1(0.97 * R)} ${f1(-0.02 * R)}C${f1(0.8 * R)} ${f1(0.25 * R)} ${f1(0.55 * R)} ${f1(0.2 * R)} ${f1(bx + 0.18 * R)} ${f1(0.22 * R)}Q${f1(bx)} ${f1(0.18 * R)} ${f1(bx - 0.18 * R)} ${f1(0.22 * R)}C${f1(-0.55 * R)} ${f1(0.2 * R)} ${f1(-0.8 * R)} ${f1(0.25 * R)} ${f1(-0.97 * R)} ${f1(-0.02 * R)}Z`;
      const hole = ell(hm[0], hm[1] + 0.03 * R, 0.25 * R, 0.13 * R + 0.12 * R * (f.mouth === 'open' || f.mouth === 'o' ? f.open : 0));
      o.push(`<path d="${outer} ${hole}" fill="#2b1c14" fill-rule="evenodd" stroke="#141414" stroke-width="5" stroke-linejoin="round"/>`);
      o.push(`<path d="M${f1(-0.6 * R)} ${f1(0.55 * R)}q${f1(0.04 * R)} ${f1(0.1 * R)} 0 ${f1(0.2 * R)}M${f1(0.6 * R)} ${f1(0.55 * R)}q${f1(-0.04 * R)} ${f1(0.1 * R)} 0 ${f1(0.2 * R)}M${f1(bx - 0.1 * R)} ${f1(0.85 * R)}q${f1(0.05 * R)} ${f1(0.1 * R)} 0 ${f1(0.18 * R)}M${f1(bx + 0.12 * R)} ${f1(0.85 * R)}q${f1(-0.05 * R)} ${f1(0.1 * R)} 0 ${f1(0.18 * R)}" fill="none" stroke="#4a3426" stroke-width="5" stroke-linecap="round"/>`);
    }
    if (skin && f.tears > 0.01) {
      // streams of tears down both cheeks + a pool on the lower lids
      for (const e of eyes) {
        const x0 = e.x + e.side * e.rx * 0.2, y0 = e.y + e.ry * 0.85, L = 0.62 * R * f.tears;
        o.push(`<path d="M${f1(x0)} ${f1(y0)}C${f1(x0 + e.side * 6)} ${f1(y0 + L * 0.4)} ${f1(x0 - e.side * 4)} ${f1(y0 + L * 0.7)} ${f1(x0 + e.side * 3)} ${f1(y0 + L)}" fill="none" stroke="#6ec1f0" stroke-width="12" stroke-linecap="round" opacity=".9"/>`);
        o.push(`<path d="M${f1(x0 - 2)} ${f1(y0 + 6)}V${f1(y0 + L * 0.6)}" stroke="#d8f1ff" stroke-width="3" stroke-linecap="round" opacity=".9"/>`);
        const k = ((f.time || 0) * 1.7 + (e.side > 0 ? 0.5 : 0)) % 1;
        const dy = y0 + L + k * 0.5 * R;
        o.push(`<path d="M${f1(x0 + e.side * 3)} ${f1(dy - 12)}c5 8 8 12 8 16a8 8 0 0 1-16 0c0-4 3-8 8-16Z" fill="#6ec1f0" stroke="#2a6f99" stroke-width="2" opacity="${f1(1 - k)}"/>`);
        o.push(`<path d="M${f1(e.x - e.rx * 0.8)} ${f1(e.y + e.ry * 0.78)}Q${f1(e.x)} ${f1(e.y + e.ry * 1.05)} ${f1(e.x + e.rx * 0.8)} ${f1(e.y + e.ry * 0.78)}" fill="none" stroke="#8fd3ff" stroke-width="6" opacity=".85"/>`);
      }
    }
    if (skin && skin.mustache) {
      const mx2 = t * 1.2 * R, my2 = 0.27 * R;
      o.push(`<path d="M${f1(mx2)} ${f1(my2 - 0.02 * R)}C${f1(mx2 - 0.12 * R)} ${f1(my2 - 0.1 * R)} ${f1(mx2 - 0.32 * R)} ${f1(my2 - 0.06 * R)} ${f1(mx2 - 0.34 * R)} ${f1(my2 + 0.07 * R)}C${f1(mx2 - 0.2 * R)} ${f1(my2 + 0.03 * R)} ${f1(mx2 - 0.1 * R)} ${f1(my2 + 0.06 * R)} ${f1(mx2)} ${f1(my2 + 0.03 * R)}C${f1(mx2 + 0.1 * R)} ${f1(my2 + 0.06 * R)} ${f1(mx2 + 0.2 * R)} ${f1(my2 + 0.03 * R)} ${f1(mx2 + 0.34 * R)} ${f1(my2 + 0.07 * R)}C${f1(mx2 + 0.32 * R)} ${f1(my2 - 0.06 * R)} ${f1(mx2 + 0.12 * R)} ${f1(my2 - 0.1 * R)} ${f1(mx2)} ${f1(my2 - 0.02 * R)}Z" fill="#3b2418" stroke="#141414" stroke-width="4" stroke-linejoin="round"/>`);
    }
    if (f.sweat > 0.01) {
      const s = f.sweat, x = (t > 0 ? -0.78 : 0.78) * R, y = -0.42 * R + (1 - s) * -10;
      o.push(`<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s)})"><path d="M0 -26C10 -8 18 2 18 12A18 18 0 0 1 -18 12C-18 2 -10 -8 0 -26Z" fill="#8fd3ff" stroke="#0b0b0b" stroke-width="4"/><circle cx="-6" cy="10" r="4" fill="#fff"/></g>`);
    }
    return o.join('');
  }

  function headSvg(p) {
    const o = [];
    if (p.kind === 'girl') {
      // long hair falling behind the head onto the shoulders
      o.push(F(`M${f1(-1.06 * R)} ${f1(-0.05 * R)}C${f1(-1.2 * R)} ${f1(0.7 * R)} ${f1(-1.05 * R)} ${f1(1.25 * R)} ${f1(-0.7 * R)} ${f1(1.38 * R)}Q0 ${f1(1.2 * R)} ${f1(0.7 * R)} ${f1(1.38 * R)}C${f1(1.05 * R)} ${f1(1.25 * R)} ${f1(1.2 * R)} ${f1(0.7 * R)} ${f1(1.06 * R)} ${f1(-0.05 * R)}A${f1(1.06 * R)} ${f1(1.06 * R)} 0 0 0 ${f1(-1.06 * R)} ${f1(-0.05 * R)}Z`, '#121212'));
    }
    if (p.kind === 'guy') {
      o.push(F(`M${f1(-0.55 * R)} ${f1(-0.8 * R)}C${f1(-0.6 * R)} ${f1(-1.22 * R)} ${f1(0.05 * R)} ${f1(-1.42 * R)} ${f1(0.62 * R)} ${f1(-1.2 * R)}C${f1(0.42 * R)} ${f1(-1.18 * R)} ${f1(0.4 * R)} ${f1(-1.1 * R)} ${f1(0.55 * R)} ${f1(-1.0 * R)}C${f1(0.35 * R)} ${f1(-1.02 * R)} ${f1(0.3 * R)} ${f1(-0.95 * R)} ${f1(0.4 * R)} ${f1(-0.8 * R)}Z`, 'url(#gHead)'));
    }
    if (p.kind === 'man') {
      // neat side-parted hair cap, slightly raised above the skull
      o.push(F(`M${f1(-1.02 * R)} ${f1(-0.15 * R)}C${f1(-1.1 * R)} ${f1(-0.9 * R)} ${f1(-0.4 * R)} ${f1(-1.22 * R)} ${f1(0.25 * R)} ${f1(-1.14 * R)}C${f1(0.8 * R)} ${f1(-1.06 * R)} ${f1(1.1 * R)} ${f1(-0.7 * R)} ${f1(1.03 * R)} ${f1(-0.12 * R)}Z`, 'url(#gHead)'));
    }
    if (p.kind === 'stewardess') {
      // neat low bun at the back of the head
      o.push(F(circ(0.72 * R, -0.62 * R, 0.36 * R), 'url(#gHead)'));
      o.push(`<path d="${ell(0.6 * R, -0.42 * R, 0.08 * R, 0.16 * R)}" fill="#c9a33a" stroke="#5a4510" stroke-width="3" transform="rotate(-35 ${f1(0.6 * R)} ${f1(-0.42 * R)})"/>`);
    }
    if (p.kind === 'mom') {
      o.push(F(circ(0.05 * R, -1.08 * R, 0.42 * R), 'url(#gHead)'));
      o.push(`<path d="${ell(0.03 * R, -0.8 * R, 0.3 * R, 0.09 * R)}" fill="#ff7fa0" stroke="#3a0d1a" stroke-width="4"/>`);
    }
    if (p.skin) {
      for (const sd of [-1, 1]) o.push(F(ell(sd * 0.97 * R, 0.08 * R, 0.17 * R, 0.2 * R), p.skin.tone, '#141414', '#141414'));
      o.push(F(circ(0, 0, R), `url(#${p.skin.grad})`, '#141414', '#141414'));
    } else o.push(F(circ(0, 0, R), 'url(#gHead)'));
    if (p.face && p.face.red > 0.01) {
      o.push(`<path d="${circ(0, 0, R - 3)}" fill="url(#gRed)" opacity="${f1(p.face.red)}"/>`);
    }
    if (p.kind === 'guard') o.push(`<g transform="translate(0 ${f1(p.skin ? -0.14 * R : 0)})">`);
    if (p.kind === 'guard') {
      // peaked police-style cap
      o.push(`<path d="M${f1(-0.95 * R)} ${f1(-0.62 * R)}C${f1(-1.15 * R)} ${f1(-1.05 * R)} ${f1(-0.6 * R)} ${f1(-1.32 * R)} 0 ${f1(-1.3 * R)}C${f1(0.6 * R)} ${f1(-1.32 * R)} ${f1(1.15 * R)} ${f1(-1.05 * R)} ${f1(0.95 * R)} ${f1(-0.62 * R)}Z" fill="${p.outfit === 'guardpro' ? '#1c2c4a' : '#26406b'}" stroke="#0b1424" stroke-width="7" stroke-linejoin="round"/>`);
      o.push(`<path d="M${f1(-0.95 * R)} ${f1(-0.62 * R)}H${f1(0.95 * R)}V${f1(-0.78 * R)}H${f1(-0.95 * R)}Z" fill="#111" stroke="#0b1424" stroke-width="5"/>`);
      o.push(`<path d="M${f1(-0.9 * R)} ${f1(-0.62 * R)}Q0 ${f1(-0.42 * R)} ${f1(0.9 * R)} ${f1(-0.62 * R)}Z" fill="#1a1a1a" stroke="#0b0b0b" stroke-width="5"/>`);
      o.push(`<path d="M${f1(-0.5 * R)} ${f1(-0.56 * R)}Q0 ${f1(-0.48 * R)} ${f1(0.5 * R)} ${f1(-0.56 * R)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>`);
      if (p.outfit === 'guardpro') o.push(`<g transform="translate(0 ${f1(-0.98 * R)}) scale(1.5)"><path d="M0 -15C8 -15 13 -12 13 -12V0C13 9 6 14 0 17C-6 14 -13 9 -13 0V-12S-8 -15 0 -15Z" fill="#e8b83a" stroke="#6b4b08" stroke-width="3"/><circle r="5" fill="#c9971f"/></g>`);
      else o.push(`<g transform="translate(0 ${f1(-0.98 * R)})"><path d="M0 -20L6 -6H20L9 3L13 18L0 9L-13 18L-9 3L-20 -6H-6Z" fill="#f2c94c" stroke="#7a5a10" stroke-width="3" stroke-linejoin="round"/></g>`);
    }
    if (p.kind === 'guard') o.push('</g>');
    if (p.kind === 'man') {
      o.push(`<path d="M${f1(-0.98 * R)} ${f1(-0.3 * R)}C${f1(-0.9 * R)} ${f1(-0.78 * R)} ${f1(-0.45 * R)} ${f1(-0.98 * R)} ${f1(-0.18 * R)} ${f1(-0.98 * R)}" fill="none" stroke="#8f8f8f" stroke-width="5" stroke-linecap="round"/>`);
    }
    if (p.skin && p.skin.bald) {
      o.push(`<ellipse cx="${f1(-0.35 * R)}" cy="${f1(-0.62 * R)}" rx="${f1(0.28 * R)}" ry="${f1(0.13 * R)}" transform="rotate(-30 ${f1(-0.35 * R)} ${f1(-0.62 * R)})" fill="#fff" opacity=".45"/>`);
      o.push(`<path d="M${f1(-0.5 * R)} ${f1(-0.78 * R)}q${f1(0.12 * R)} ${f1(0.05 * R)} ${f1(0.24 * R)} ${f1(0.02 * R)}M${f1(-0.45 * R)} ${f1(-0.7 * R)}q${f1(0.1 * R)} ${f1(0.04 * R)} ${f1(0.2 * R)} ${f1(0.02 * R)}" fill="none" stroke="${p.skin.shade}" stroke-width="4" stroke-linecap="round" opacity=".6"/>`);
    }
    if (p.skin && p.skin.hair === 'messy') {
      // short, messy dark-brown hair
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const a = Math.PI * (1.08 + 0.84 * i / 14), r = R * (i % 2 ? 1.12 : 1.02);
        pts.push(`${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`);
      }
      const fr = [];
      for (let i = 14; i >= 0; i--) {
        const x = R * (-0.92 + 1.84 * i / 14), y = -0.76 * R - Math.sqrt(Math.max(0, 1 - (x / R) ** 2)) * 0.12 * R + (i % 2 ? 0.08 * R : 0);
        fr.push(`${f1(x)} ${f1(y)}`);
      }
      o.push(`<path d="M${pts.join('L')}L${fr.join('L')}Z" fill="#4a3022" stroke="#141414" stroke-width="5" stroke-linejoin="round"/>`);
      o.push(`<path d="M${f1(-0.45 * R)} ${f1(-0.92 * R)}q${f1(0.2 * R)} ${f1(-0.06 * R)} ${f1(0.35 * R)} ${f1(-0.02 * R)}" fill="none" stroke="#7a5642" stroke-width="5" stroke-linecap="round"/>`);
    }
    if (!p.skin) {
      // glossy highlight (crescent upper-left + small dot), like the reference art
      o.push(`<path d="M${f1(-0.86 * R)} ${f1(-0.22 * R)}A${f1(0.89 * R)} ${f1(0.89 * R)} 0 0 1 ${f1(-0.42 * R)} ${f1(-0.78 * R)}" fill="none" stroke="#fff" stroke-opacity="0.78" stroke-width="${f1(0.075 * R)}" stroke-linecap="round"/>`);
      o.push(`<circle cx="${f1(-0.27 * R)}" cy="${f1(-0.86 * R)}" r="${f1(0.035 * R)}" fill="#fff" fill-opacity="0.7"/>`);
    }
    if (p.kind === 'mom') {
      for (const s of [-1, 1]) o.push(`<circle cx="${f1(s * 0.97 * R)}" cy="${f1(0.28 * R)}" r="9" fill="#f6c453" stroke="#3b2a05" stroke-width="3"/>`);
    }
    if (p.kind === 'stewardess') {
      // small pillbox hat, tilted
      o.push(`<g transform="translate(${f1(-0.3 * R)} ${f1(-0.9 * R)}) rotate(-14)"><path d="M-46 0V-34Q-46 -44 -36 -44H36Q46 -44 46 -34V0Z" fill="#22355e" stroke="#0b1424" stroke-width="6" stroke-linejoin="round"/><rect x="-46" y="-14" width="92" height="10" fill="#c9a33a"/><path d="M0 -36l5 10h11l-9 7 3 11-10-6-10 6 3-11-9-7h11Z" fill="#c9a33a"/></g>`);
    }
    if (p.kind === 'girl') {
      // yellow bow
      o.push(`<g transform="translate(${f1(0.52 * R)} ${f1(-0.82 * R)}) rotate(20)"><path d="M0 0L-34 -20Q-42 0 -34 20Z M0 0L34 -20Q42 0 34 20Z" fill="#ffcf4a" stroke="#3a2a05" stroke-width="5" stroke-linejoin="round"/><circle r="10" fill="#f5b72c" stroke="#3a2a05" stroke-width="5"/></g>`);
    }
    o.push(face(p.face, p.kind, p.skin));
    return o.join('');
  }

  function hand(type, th, w) {
    if (type === 'none') return '';
    if (type === 'fist') return F(circ(0, 18, 21)) + `<path d="M-10 30q5 5 10 0M2 30q5 5 10 0" fill="none" stroke="#6d6d6d" stroke-width="3" stroke-linecap="round"/>`;
    if (type === 'point') return S('M0 30L0 64', 12) + F(circ(0, 18, 20));
    // open palm: fingers drawn as separate capsules so they read as a hand
    let h = S(`M${th * 12} 6L${th * 30} 14`, 12);
    for (const fx of [-12, -4, 4, 12]) h += S(`M${fx} 22L${fx * 1.25} ${fx === -12 || fx === 12 ? 50 : 58}`, 11);
    return h + F(ell(0, 15, 20, 17));
  }

  // coffee mug, drawn upright (tilt in degrees), handle at the origin
  function cup(tilt, side) {
    const sx = side;  // mug body sits on the thumb side of the hand
    return `<g transform="rotate(${f1(tilt)}) translate(${f1(sx * 36)} -6)">` +
      `<path d="M${f1(-sx * 22)} -8q${f1(-sx * 22)} 0 ${f1(-sx * 22)} 16t${f1(sx * 22)} 16" fill="none" stroke="#2a2a2a" stroke-width="13"/>` +
      `<path d="M${f1(-sx * 22)} -8q${f1(-sx * 22)} 0 ${f1(-sx * 22)} 16t${f1(sx * 22)} 16" fill="none" stroke="#fbf8f2" stroke-width="7"/>` +
      `<path d="M-26 -28h52l-5 54a10 10 0 0 1-10 9h-22a10 10 0 0 1-10-9Z" fill="#fbf8f2" stroke="#2a2a2a" stroke-width="5" stroke-linejoin="round"/>` +
      `<ellipse cx="0" cy="-27" rx="24" ry="6" fill="#6b3f22" stroke="#2a2a2a" stroke-width="4"/>` +
      `<path d="M-26 0h52" stroke="#e98a6f" stroke-width="8"/></g>`;
  }

  // manila folder; open=0 closed, 1 opened showing the release form
  function folder(open) {
    if (open < 0.5) {
      return `<g transform="translate(0 -20)"><rect x="-8" y="-6" width="96" height="124" rx="6" fill="#fffdf6" stroke="#8a7a5a" stroke-width="3"/>` +
        `<rect x="-14" y="0" width="100" height="124" rx="7" fill="#e9c46a" stroke="#6b4f12" stroke-width="5"/><rect x="40" y="-8" width="34" height="14" rx="5" fill="#e9c46a" stroke="#6b4f12" stroke-width="4"/></g>`;
    }
    return `<g transform="translate(-60 -40)"><rect x="-90" y="0" width="100" height="130" rx="7" fill="#e3b955" stroke="#6b4f12" stroke-width="5"/>` +
      `<rect x="10" y="0" width="100" height="130" rx="7" fill="#e9c46a" stroke="#6b4f12" stroke-width="5"/>` +
      `<rect x="20" y="8" width="82" height="112" rx="3" fill="#fffdf6" stroke="#8a7a5a" stroke-width="3"/>` +
      `<path d="M30 30h60M30 44h50M30 58h56M30 72h40" stroke="#9aa3b2" stroke-width="4" stroke-linecap="round"/>` +
      `<g transform="translate(62 96) rotate(-12)"><rect x="-38" y="-14" width="76" height="28" rx="5" fill="none" stroke="#2e9e5b" stroke-width="5"/><text x="0" y="8" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="20" fill="#2e9e5b">FREE</text></g></g>`;
  }

  function briefcase() {
    return `<g><path d="M-22 6v-14a8 8 0 0 1 8-8h28a8 8 0 0 1 8 8v14" fill="none" stroke="#2a1608" stroke-width="10"/>` +
      `<rect x="-62" y="6" width="124" height="88" rx="12" fill="#7a4a2a" stroke="#2a1608" stroke-width="6"/>` +
      `<rect x="-62" y="34" width="124" height="8" fill="#5e3820"/><rect x="-10" y="28" width="20" height="18" rx="3" fill="#e2b84a" stroke="#2a1608" stroke-width="3"/></g>`;
  }

  function spatula() {
    return `<g>${S('M0 10L0 92', 9, '#8a5a35', '#2b1608', '#c08a5e')}` +
      `<path d="M-24 92h48v46a10 10 0 0 1-10 10h-28a10 10 0 0 1-10-10Z" fill="#c9ced6" stroke="#222" stroke-width="5"/>` +
      `<path d="M-10 102v34M0 102v34M10 102v34" stroke="#8b929c" stroke-width="4" stroke-linecap="round"/></g>`;
  }

  // arm/leg chain. angles in degrees from straight-down, positive swings toward +x
  function chain(start, a1, a2, L1, L2) {
    const e = [start[0] + Math.sin(rad(a1)) * L1, start[1] + Math.cos(rad(a1)) * L1];
    const a = a1 + a2;
    const w = [e[0] + Math.sin(rad(a)) * L2, e[1] + Math.cos(rad(a)) * L2];
    return { e, w, a };
  }

  function arm(p, side) {
    const k = side < 0 ? 'L' : 'R';
    const [a1, a2] = p['arm' + k];
    const sh = [side * 37, -156];
    const c = chain(sh, a1, a2, ARM[0], ARM[1]);
    const aw = p.armW || ARM[2], hsc = p.handSc || 1;
    let s = p._handsOnly ? '' : S(P([sh, c.e, c.w]), aw);
    if (p.sleeve && !p._handsOnly) {   // short sleeve over the upper arm
      const m = [lerp2(sh[0], c.e[0], 0.5), lerp2(sh[1], c.e[1], 0.5)];
      s += S(P([[sh[0] - side * 3, sh[1] + 4], m]), aw + 12, p.sleeve, '#111', p.sleeveRim || '#111');
      s += `<path d="${P([[m[0] - Math.cos(rad(a1)) * 20, m[1] + Math.sin(rad(a1)) * 20], [m[0] + Math.cos(rad(a1)) * 20, m[1] - Math.sin(rad(a1)) * 20]])}" stroke="#111" stroke-width="5" stroke-linecap="round"/>`;
    }
    const hr = -c.a + (p['handRot' + k] || 0);
    const it = p['item' + k];
    const item = it === 'spatula' ? spatula() : '';
    const hsvg = `<g transform="scale(${f1(hsc)})">${hand(p['hand' + k], p['thumb' + k] || -side, ARM[2])}</g>`;
    if (p._handsOnly) return `<g transform="translate(${f1(c.w[0])} ${f1(c.w[1])}) rotate(${f1(hr)})">${hsvg}</g>`;
    if (it === 'folder') {
      s += `<g transform="translate(${f1(c.w[0])} ${f1(c.w[1])})">${folder(p['folderOpen' + k] || 0)}<g transform="rotate(${f1(hr)})">${hsvg}</g></g>`;
    } else if (it === 'briefcase') {
      s += `<g transform="translate(${f1(c.w[0])} ${f1(c.w[1])})"><g transform="translate(0 6)">${briefcase()}</g><g transform="rotate(${f1(hr)})">${hsvg}</g></g>`;
    } else if (it === 'cup') {
      // mug stays upright regardless of the arm; fist wraps the handle
      s += `<g transform="translate(${f1(c.w[0])} ${f1(c.w[1])})">${cup(p['itemTilt' + k] || 0, -side)}<g transform="rotate(${f1(hr)})">${hsvg}</g></g>`;
    } else {
      s += `<g transform="translate(${f1(c.w[0])} ${f1(c.w[1])}) rotate(${f1(hr)})">${item}${hsvg}</g>`;
    }
    return s;
  }

  function leg(p, side) {
    const k = side < 0 ? 'L' : 'R';
    const [a1, a2] = p['leg' + k];
    const hip = [side * 20, -4];
    const lk = p.legK || [1, 1];
    const c = chain(hip, a1, a2, LEG[0] * lk[0], LEG[1] * lk[1]);
    const toe = side;
    const shoe = `M${f1(c.w[0] - 22 * toe)} ${f1(c.w[1] - 6)}C${f1(c.w[0] - 26 * toe)} ${f1(c.w[1] + 26)} ${f1(c.w[0] + 58 * toe)} ${f1(c.w[1] + 30)} ${f1(c.w[0] + 54 * toe)} ${f1(c.w[1] + 8)}C${f1(c.w[0] + 50 * toe)} ${f1(c.w[1] - 12)} ${f1(c.w[0] + 6 * toe)} ${f1(c.w[1] - 16)} ${f1(c.w[0] - 22 * toe)} ${f1(c.w[1] - 6)}Z`;
    if (p.pants) {
      const sneaker = p.shoe === 'white';
      return S(P([hip, c.e, c.w]), LEG[2] + 14, p.pants, '#111', '#111') +
        `<path d="${P([[c.e[0] - 8, c.e[1] - 30], [c.e[0] + 2, c.e[1] + 10]])}" stroke="#000" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>` +
        F(shoe, sneaker ? '#f4f4f2' : '#151515', '#111', sneaker ? '#bdbdbd' : '#555') +
        (sneaker ? `<path d="M${f1(c.w[0] - 18 * toe)} ${f1(c.w[1] + 14)}q${f1(36 * toe)} 10 ${f1(70 * toe)} 4" fill="none" stroke="#c9c9c9" stroke-width="5"/><path d="M${f1(c.w[0] + 4 * toe)} ${f1(c.w[1] - 8)}l${f1(14 * toe)} 6M${f1(c.w[0] + 12 * toe)} ${f1(c.w[1] - 12)}l${f1(14 * toe)} 6" stroke="#9a9a9a" stroke-width="4" stroke-linecap="round"/>` : '');
    }
    return S(P([hip, c.e, c.w]), LEG[2]) + F(shoe) +
      `<path d="M${f1(c.w[0] + 2 * toe)} ${f1(c.w[1] - 4)}q${f1(18 * toe)} -6 ${f1(34 * toe)} 4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>`;
  }

  const TORSO = 'M-16 -198C-17 -176 -44 -178 -46 -150L-36 -66C-41 -36 -45 -14 -38 4Q0 20 38 4C45 -14 41 -36 36 -66L46 -150C44 -178 17 -176 16 -198Z';

  function momDress() {
    const skirt = 'M-38 -70C-56 -10 -78 60 -88 112Q0 132 88 112C78 60 56 -10 38 -70Z';
    const apron = 'M-24 -140L24 -140L28 -72C40 -30 50 30 56 92Q0 108 -56 92C-50 30 -40 -30 -28 -72Z';
    return F(skirt, 'url(#gDress)', '#2a0b14', '#f4a9bb') + F(TORSO.replace('-16 -198', '-16 -186').replace('16 -198Z', '16 -186Z'), 'url(#gDress)', '#2a0b14', '#f4a9bb') +
      `<path d="M-24 -140L-14 -186M24 -140L14 -186" stroke="#fff6ea" stroke-width="6" stroke-linecap="round"/>` +
      F(apron, '#fff6ea', '#3a2a1e', '#ffffff') +
      `<path d="M-36 -70Q0 -60 36 -70" fill="none" stroke="#e6d3bd" stroke-width="8" stroke-linecap="round"/>` +
      `<path d="M-22 10h44v30a10 10 0 0 1-10 10h-24a10 10 0 0 1-10-10Z" fill="none" stroke="#e0c8b0" stroke-width="5"/>` +
      `<path d="M0 -118c-6-8-18-2-12 8l12 10 12-10c6-10-6-16-12-8Z" fill="#f07a93"/>`;
  }

  // casual outfits for the café couple
  function outfit(kind, p) {
    if (kind === 'guy') {
      return F(TORSO, '#4a7fc1', '#0e1d33', '#9fc0ea') +
        `<path d="M-16 -190L0 -168L16 -190" fill="none" stroke="#f4f6fa" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<path d="M0 -160V-20" stroke="#3a69a6" stroke-width="4"/><circle cx="0" cy="-130" r="4" fill="#f4f6fa"/><circle cx="0" cy="-95" r="4" fill="#f4f6fa"/><circle cx="0" cy="-60" r="4" fill="#f4f6fa"/>`;
    }
    if (kind === 'stewardess') {
      // fitted navy jacket, red neck scarf, gold buttons + wings, pencil skirt
      return F('M-36 -70C-42 -20 -46 40 -44 98Q0 108 44 98C46 40 42 -20 36 -70Z', '#1d2e52', '#0b1424', '#4a5f8c') +
        F(TORSO, '#22355e', '#0b1424', '#4a5f8c') +
        `<path d="M-16 -192L0 -160L16 -192Z" fill="#f4f4f2"/>` +
        `<path d="M-20 -190L0 -150L20 -190Q0 -178 -20 -190Z" fill="#e23a4a" stroke="#7a1420" stroke-width="3" stroke-linejoin="round"/><path d="M4 -160l14 26l-8 4Z" fill="#e23a4a" stroke="#7a1420" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M-18 -188L-4 -140L-28 -118M18 -188L4 -140L28 -118" fill="none" stroke="#14213d" stroke-width="5" stroke-linejoin="round"/>` +
        `<circle cx="0" cy="-110" r="4.5" fill="#c9a33a"/><circle cx="0" cy="-86" r="4.5" fill="#c9a33a"/>` +
        `<g transform="translate(-24 -132)"><path d="M0 0c-6 -6 -16 -6 -22 -2c6 1 12 3 22 2zM0 0c6 -6 16 -6 22 -2c-6 1 -12 3 -22 2z" fill="#c9a33a"/><circle r="3.5" fill="#c9a33a"/></g>` +
        `<path d="M-36 -70Q0 -60 36 -70" fill="none" stroke="#14213d" stroke-width="7" stroke-linecap="round"/>`;
    }
    if (kind === 'prisoner') {
      return F(TORSO, 'url(#gOrange)', '#111', '#111') +
        `<path d="M-15 -194L0 -146L15 -194Z" fill="#f4f4f2" stroke="#111" stroke-width="4"/>` +
        `<path d="M-17 -194L-2 -146L-30 -150L-40 -176Z M17 -194L2 -146L30 -150L40 -176Z" fill="#e2641f" stroke="#111" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M14 -128h24v26h-24Z" fill="none" stroke="#b9500f" stroke-width="4"/>` +
        `<path d="M-30 -110q4 40 0 80M24 -90q6 30 2 70" fill="none" stroke="#c4561a" stroke-width="4" stroke-linecap="round" opacity=".7"/>` +
        `<g transform="translate(-20 -118)"><rect x="-17" y="-9" width="34" height="18" rx="2" fill="#f4f4f2" stroke="#111" stroke-width="2.5"/><text x="0" y="5" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="#111">${(p && p.patch) || 'A-12'}</text></g>`;
    }
    if (kind === 'guardpro') {
      return F(TORSO, 'url(#gNavy)', '#0a0f18', '#0a0f18') +
        `<path d="M-15 -194L0 -168L15 -194Z" fill="#f2f2ef" stroke="#0a0f18" stroke-width="4"/>` +
        `<path d="M-17 -194L-3 -166L-24 -160L-34 -182Z M17 -194L3 -166L24 -160L34 -182Z" fill="#26395c" stroke="#0a0f18" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M0 -166V-30" stroke="#0f1a2c" stroke-width="4"/>` +
        `<path d="M-38 -132h26v6h-26ZM12 -132h26v6h-26Z" fill="#162540" stroke="#0a0f18" stroke-width="3"/>` +
        `<path d="M-36 -126h22v24h-22ZM14 -126h22v24h-22Z" fill="none" stroke="#0f1a2c" stroke-width="3"/>` +
        `<g transform="translate(-25 -146)"><path d="M0 -15C8 -15 13 -12 13 -12V0C13 9 6 14 0 17C-6 14 -13 9 -13 0V-12S-8 -15 0 -15Z" fill="#e8b83a" stroke="#6b4b08" stroke-width="3"/><circle cy="0" r="5" fill="#c9971f"/></g>` +
        `<path d="M-40 -26Q0 -16 40 -26" fill="none" stroke="#0d0d0d" stroke-width="16" stroke-linecap="round"/><rect x="-11" y="-33" width="22" height="16" rx="3" fill="#c9ced6" stroke="#222" stroke-width="3"/>` +
        `<rect x="26" y="-40" width="18" height="30" rx="4" fill="#1b1b1b" stroke="#000" stroke-width="3"/><path d="M38 -40v-16" stroke="#1b1b1b" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (kind === 'guard') {
      return F(TORSO, '#2f5a94', '#0b1424', '#8fb2e0') +
        `<path d="M-16 -192L0 -170L16 -192" fill="none" stroke="#1d3a63" stroke-width="7" stroke-linejoin="round"/>` +
        `<path d="M0 -168V-26" stroke="#25497a" stroke-width="4"/>` +
        `<path d="M-46 -150l-2 -14h26l2 12Z M46 -150l2 -14h-26l-2 12Z" fill="#1d3a63"/>` +
        `<g transform="translate(-22 -122)"><path d="M0 -14L4 -4H14L6 2L9 13L0 7L-9 13L-6 2L-14 -4H-4Z" fill="#f2c94c" stroke="#7a5a10" stroke-width="2.5"/></g>` +
        `<rect x="8" y="-140" width="26" height="22" rx="3" fill="none" stroke="#1d3a63" stroke-width="4"/>` +
        `<path d="M-38 -28Q0 -18 38 -28" fill="none" stroke="#151515" stroke-width="14" stroke-linecap="round"/><rect x="-10" y="-34" width="20" height="16" rx="3" fill="#c9ced6" stroke="#333" stroke-width="3"/>`;
    }
    if (kind === 'man') {
      return F(TORSO, '#3c4454', '#0d1016', '#8b95a6') +
        `<path d="M-16 -192L0 -150L16 -192Z" fill="#f4f6fa"/>` +
        `<path d="M0 -176l-9 10 5 66 4 10 4-10 5-66Z" fill="#d64545" stroke="#5a1212" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M-17 -190L-2 -140L-26 -112M17 -190L2 -140L26 -112" fill="none" stroke="#2b313d" stroke-width="7" stroke-linejoin="round"/>` +
        `<circle cx="0" cy="-70" r="4" fill="#9aa3b2"/><circle cx="0" cy="-40" r="4" fill="#9aa3b2"/>` +
        `<path d="M24 -128h14" stroke="#f4f6fa" stroke-width="5" stroke-linecap="round"/>`;
    }
    if (kind === 'girl') {
      return F('M-40 -70C-52 -40 -62 -6 -66 22Q0 40 66 22C62 -6 52 -40 40 -70Z', '#7c5cc0', '#1f1238', '#c2a9f2') +
        F(TORSO, '#b391e6', '#1f1238', '#dccaf8') +
        `<path d="M-16 -192Q0 -176 16 -192" fill="none" stroke="#f1e7ff" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M-36 -70Q0 -62 36 -70" fill="none" stroke="#7c5cc0" stroke-width="8" stroke-linecap="round"/>`;
    }
    return F(TORSO, 'url(#gTorso)');
  }

  function outfitBack(p) {
    if (p.outfit === 'guardpro') return F(TORSO, 'url(#gNavy)', '#0a0f18', '#0a0f18') + `<path d="M0 -180V-30" stroke="#0f1a2c" stroke-width="3"/><path d="M-40 -26Q0 -16 40 -26" fill="none" stroke="#0d0d0d" stroke-width="16" stroke-linecap="round"/>`;
    if (p.outfit === 'prisoner') return F(TORSO, 'url(#gOrange)', '#111', '#111');
    return F(TORSO, 'url(#gTorso)');
  }
  function headBack(p) {
    const o = [];
    for (const sd of [-1, 1]) o.push(F(ell(sd * 0.97 * R, 0.08 * R, 0.17 * R, 0.2 * R), p.skin.tone, '#141414', '#141414'));
    o.push(F(circ(0, 0, R), `url(#${p.skin.grad})`, '#141414', '#141414'));
    o.push(`<path d="M${f1(-0.5 * R)} ${f1(0.75 * R)}q${f1(0.5 * R)} ${f1(0.12 * R)} ${f1(R)} 0" fill="none" stroke="${p.skin.shade}" stroke-width="5" opacity=".7"/>`);
    if (p.kind === 'guard') {
      const cap = p.outfit === 'guardpro' ? '#1c2c4a' : '#26406b';
      o.push(`<g transform="translate(0 ${f1(-0.14 * R)})"><path d="M${f1(-0.95 * R)} ${f1(-0.62 * R)}C${f1(-1.15 * R)} ${f1(-1.05 * R)} ${f1(-0.6 * R)} ${f1(-1.32 * R)} 0 ${f1(-1.3 * R)}C${f1(0.6 * R)} ${f1(-1.32 * R)} ${f1(1.15 * R)} ${f1(-1.05 * R)} ${f1(0.95 * R)} ${f1(-0.62 * R)}Z" fill="${cap}" stroke="#0b1424" stroke-width="7" stroke-linejoin="round"/><path d="M${f1(-0.95 * R)} ${f1(-0.62 * R)}H${f1(0.95 * R)}V${f1(-0.78 * R)}H${f1(-0.95 * R)}Z" fill="#111" stroke="#0b1424" stroke-width="5"/></g>`);
    }
    return o.join('');
  }

  const DEF = {
    kind: 'sanya', x: 0, y: 0, sc: 1, rot: 0, lean: 0, headTilt: 0, headY: 0, sqX: 1, sqY: 1,
    armL: [-42, 98], armR: [32, 102], handRotR: -70, handL: 'fist', handR: 'open', handRotL: 0, handRotR: 0,
    legL: [-9, 3], legR: [9, -3], legs: true, armsBehind: false, armBehindR: false, armBehindL: false,
    itemL: '', itemR: '',
  };
  const DEF_FACE = { turn: 0.22, look: [0.35, -0.12], pupil: 1, eye: 1, blink: 0, squint: 0, brow: 0, browTilt: 0, mouth: 'smile', open: 0, sleep: false, sweat: 0, lashes: false, lid: 0, heart: 0, blush: 0, happy: false, glasses: false, red: 0, tears: 0, time: 0 };

  function figure(pose) {
    const p = Object.assign({}, DEF, pose);
    if (p._handsOnly) {
      // only the hands, with the exact same transforms (e.g. fingers wrapped in front of bars)
      const which = p._handsOnly;   // 'L', 'R' or 'LR'
      let h = '';
      if (which.includes('L')) h += arm(p, -1);
      if (which.includes('R')) h += arm(p, 1);
      return `<g transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.rot)}) scale(${f1(p.sc * p.sqX)} ${f1(p.sc * p.sqY)})"><g transform="rotate(${f1(p.lean)})">${h}</g></g>`;
    }
    p.face = Object.assign({}, DEF_FACE, pose.face || {});
    if (p.kind === 'mom' || p.kind === 'girl' || p.kind === 'stewardess') p.face.lashes = true;
    if (p.kind === 'man') p.face.glasses = true;
    const o = [];
    o.push(`<g transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.rot)}) scale(${f1(p.sc * p.sqX)} ${f1(p.sc * p.sqY)})">`);
    if (p.legs) o.push(leg(p, -1), leg(p, 1));
    o.push(`<g transform="rotate(${f1(p.lean)})">`);
    if (p.armBehindL) o.push(arm(p, -1));
    if (p.armBehindR) o.push(arm(p, 1));
    o.push(p.kind === 'mom' ? momDress() : p.back ? outfitBack(p) : outfit(p.outfit || p.kind, p));
    if (p.chest) o.push(p.chest);   // something hugged against the chest (between torso and arms)
    o.push(`<g transform="translate(0 ${f1(-192 + p.headY)}) rotate(${f1(p.headTilt)}) translate(0 ${f1(-0.86 * R)})">${p.back ? headBack(p) : headSvg(p)}</g>`);
    if (!p.noArms && !p.armBehindL) o.push(arm(p, -1));
    if (!p.noArms && !p.armBehindR) o.push(arm(p, 1));
    o.push('</g></g>');
    return o.join('');
  }

  // head centre in world coords (for effects / camera targets)
  function headPos(pose) {
    const p = Object.assign({}, DEF, pose);
    const r1 = rad(p.rot), r2 = rad(p.rot + p.lean);
    const nx = Math.sin(r2) * (192 - p.headY), ny = -Math.cos(r2) * (192 - p.headY);
    const r3 = rad(p.rot + p.lean + p.headTilt);
    const hx = nx + Math.sin(r3) * 0.86 * R, hy = ny - Math.cos(r3) * 0.86 * R;
    return [p.x + hx * p.sc, p.y + hy * p.sc * p.sqY];
  }

  // just a head (for thought-bubble portraits etc.), centred at 0,0
  function headOnly(pose) {
    const p = Object.assign({}, DEF, pose);
    p.face = Object.assign({}, DEF_FACE, pose.face || {});
    if (p.kind === 'mom' || p.kind === 'girl') p.face.lashes = true;
    return headSvg(p);
  }

  // world -> body-local point (inverse of figure transform, incl. lean)
  function toLocal(p, wx, wy) {
    let x = wx - p.x, y = wy - p.y;
    const r = rad(-(p.rot || 0));
    [x, y] = [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
    x /= p.sc * (p.sqX || 1); y /= p.sc * (p.sqY || 1);
    const l = rad(-(p.lean || 0));
    return [x * Math.cos(l) - y * Math.sin(l), x * Math.sin(l) + y * Math.cos(l)];
  }
  // two-bone IK: returns [a1, a2] so the wrist reaches world point (wx, wy).
  // bend = +1 / -1 picks the elbow side.
  function armIK(pose, side, wx, wy, bend) {
    const p = Object.assign({}, DEF, pose);
    const [tx, ty] = toLocal(p, wx, wy);
    const sh = [side * 37, -156];
    const dx = tx - sh[0], dy = ty - sh[1];
    const L1 = ARM[0], L2 = ARM[1];
    const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5);
    const base = Math.atan2(dx, dy) * 180 / Math.PI;
    const A = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))) * 180 / Math.PI;
    const a1 = base + (bend == null ? -side : bend) * A;
    const e = [sh[0] + Math.sin(rad(a1)) * L1, sh[1] + Math.cos(rad(a1)) * L1];
    const a = Math.atan2(tx - e[0], ty - e[1]) * 180 / Math.PI;
    return [a1, a - a1];
  }
  // world position of the mouth (approx.)
  function mouthPos(pose) {
    const p = Object.assign({}, DEF, pose);
    const f = Object.assign({}, DEF_FACE, pose.face || {});
    const [hx, hy] = headPos(pose);
    const r = rad((p.rot || 0) + (p.lean || 0) + (p.headTilt || 0));
    const lx = f.turn * 1.25 * R, ly = 0.4 * R;
    return [hx + (lx * Math.cos(r) - ly * Math.sin(r)) * p.sc, hy + (lx * Math.sin(r) + ly * Math.cos(r)) * p.sc];
  }

  const SKIN = {
    alex: { tone: '#f1bf9b', shade: '#c98a66', grad: 'gSkinA', hair: 'messy', stubble: true, bags: true },
    bruno: { tone: '#d29a6e', shade: '#a36b46', grad: 'gSkinB', bald: true, beard: true, bags: true, brows: 'thick' },
    guard: { tone: '#e3aa84', shade: '#b97d58', grad: 'gSkinG', stubble: true, mustache: true },
  };
  g.CH = { figure, headPos, defs, R, headOnly, armIK, mouthPos, heart, SKIN };
})(window);
