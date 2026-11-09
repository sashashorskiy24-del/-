// Character rig: glossy black "rubber-hose" figures (Sanya, Mom, Guy, Girl).
// Everything is drawn as SVG strings so every frame is fully deterministic.
(function (g) {
  const { f1 } = A;
  const R = 105;               // head radius (local units)
  const INK = '#070707', RIM = '#8f8f8f', BODY = '#141414';
  const ARM = [88, 82, 30];    // upper, fore, thickness
  const LEG = [138, 128, 36];
  const rad = d => (d * Math.PI) / 180;

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
    <linearGradient id="gDress" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9708a"/><stop offset="1" stop-color="#cf4f6d"/>
    </linearGradient>`;

  // ---------- face ----------
  function face(f, kind) {
    const t = f.turn, o = [];
    const lip = kind === 'mom' ? '#ff9fb3' : kind === 'girl' ? '#ff8fa8' : '#ffffff';
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
      o.push(`<path d="M${f1(xo)} ${f1(yo)}Q${f1(e.x)} ${f1((yi + yo) / 2 - 0.13 * R)} ${f1(xi)} ${f1(yi)}" fill="none" stroke="#fff" stroke-width="${f1(0.066 * R)}" stroke-linecap="round"/>`);
    }
    for (const e of eyes) {
      const closed = f.sleep || f.blink > 0.82;
      if (closed) {
        const d = f.sleep ? 0.55 : 0.18;
        o.push(`<path d="M${f1(e.x - e.rx)} ${f1(e.y)}Q${f1(e.x)} ${f1(e.y + e.rx * d)} ${f1(e.x + e.rx)} ${f1(e.y)}" fill="none" stroke="#fff" stroke-width="${f1(0.06 * R)}" stroke-linecap="round"/>`);
      } else {
        const ry = e.ry * (1 - f.blink);
        o.push(`<path d="${ell(e.x, e.y, e.rx, ry)}" fill="#fff"/>`);
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
          o.push(`<rect clip-path="url(#${id})" x="${f1(e.x - e.rx - 2)}" y="${f1(e.y - ry - 2)}" width="${f1(2 * e.rx + 4)}" height="${f1(2 * ry * f.lid + 2)}" fill="#161616"/>`);
          o.push(`<path clip-path="url(#${id})" d="M${f1(e.x - e.rx)} ${f1(e.y - ry + 2 * ry * f.lid)}H${f1(e.x + e.rx)}" stroke="#8f8f8f" stroke-width="4"/>`);
        }
      }
      if (f.lashes && !f.sleep && f.blink < 0.82) {
        const ry = e.ry * (1 - f.blink);
        for (const th of [40, 62, 84]) {
          const a = rad(th), dx = e.side * Math.sin(a), dy = -Math.cos(a);
          const x0 = e.x + e.rx * dx, y0 = e.y + ry * dy;
          o.push(`<path d="M${f1(x0)} ${f1(y0)}l${f1(dx * 11)} ${f1(dy * 11 - 2)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`);
        }
      }
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
      const d = `M${f1(mx - w / 2)} ${f1(my)}Q${f1(mx)} ${f1(my + 0.06 * R)} ${f1(mx + w / 2)} ${f1(my)}Q${f1(mx)} ${f1(my + 0.12 * R + 0.42 * R * op)} ${f1(mx - w / 2)} ${f1(my)}Z`;
      o.push(`<path d="${d}" fill="#5a1222" stroke="${lip}" stroke-width="${f1(0.045 * R)}" stroke-linejoin="round"/>`);
      if (op > 0.35) o.push(`<path d="${ell(mx, my + 0.05 * R + 0.2 * R * op, 0.1 * R, 0.045 * R * op)}" fill="#e2687e"/>`);
    } else if (f.mouth === 'o') {
      o.push(`<path d="${ell(mx, my + 0.05 * R, 0.08 * R + 0.07 * R * op, 0.08 * R + 0.17 * R * op)}" fill="#5a1222" stroke="${lip}" stroke-width="${f1(0.045 * R)}"/>`);
    } else if (f.mouth === 'flat') {
      o.push(`<path d="M${f1(mx - w * 0.3)} ${f1(my + 0.03 * R)}L${f1(mx + w * 0.3)} ${f1(my + 0.03 * R)}" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round"/>`);
    } else if (f.mouth === 'tight') {
      // forced polite smile: wide, flat, corners pushed up
      o.push(`<path d="M${f1(mx - w * 0.62)} ${f1(my - 0.07 * R)}Q${f1(mx - w * 0.55)} ${f1(my + 0.03 * R)} ${f1(mx - w * 0.3)} ${f1(my + 0.03 * R)}L${f1(mx + w * 0.3)} ${f1(my + 0.03 * R)}Q${f1(mx + w * 0.55)} ${f1(my + 0.03 * R)} ${f1(mx + w * 0.62)} ${f1(my - 0.07 * R)}" fill="none" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`);
    } else if (f.mouth === 'nervous') {
      const q = w / 4;
      o.push(`<path d="M${f1(mx - w / 2)} ${f1(my)}q${f1(q / 2)} ${f1(-0.06 * R)} ${f1(q)} 0t${f1(q)} 0t${f1(q)} 0t${f1(q)} 0" fill="none" stroke="${lip}" stroke-width="${sw}" stroke-linecap="round"/>`);
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
    if (p.kind === 'mom') {
      o.push(F(circ(0.05 * R, -1.08 * R, 0.42 * R), 'url(#gHead)'));
      o.push(`<path d="${ell(0.03 * R, -0.8 * R, 0.3 * R, 0.09 * R)}" fill="#ff7fa0" stroke="#3a0d1a" stroke-width="4"/>`);
    }
    o.push(F(circ(0, 0, R), 'url(#gHead)'));
    // glossy highlight (crescent upper-left + small dot), like the reference art
    o.push(`<path d="M${f1(-0.86 * R)} ${f1(-0.22 * R)}A${f1(0.89 * R)} ${f1(0.89 * R)} 0 0 1 ${f1(-0.42 * R)} ${f1(-0.78 * R)}" fill="none" stroke="#fff" stroke-opacity="0.78" stroke-width="${f1(0.075 * R)}" stroke-linecap="round"/>`);
    o.push(`<circle cx="${f1(-0.27 * R)}" cy="${f1(-0.86 * R)}" r="${f1(0.035 * R)}" fill="#fff" fill-opacity="0.7"/>`);
    if (p.kind === 'mom') {
      for (const s of [-1, 1]) o.push(`<circle cx="${f1(s * 0.97 * R)}" cy="${f1(0.28 * R)}" r="9" fill="#f6c453" stroke="#3b2a05" stroke-width="3"/>`);
    }
    if (p.kind === 'girl') {
      // yellow bow
      o.push(`<g transform="translate(${f1(0.52 * R)} ${f1(-0.82 * R)}) rotate(20)"><path d="M0 0L-34 -20Q-42 0 -34 20Z M0 0L34 -20Q42 0 34 20Z" fill="#ffcf4a" stroke="#3a2a05" stroke-width="5" stroke-linejoin="round"/><circle r="10" fill="#f5b72c" stroke="#3a2a05" stroke-width="5"/></g>`);
    }
    o.push(face(p.face, p.kind));
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
    let s = S(P([sh, c.e, c.w]), ARM[2]);
    const hr = -c.a + (p['handRot' + k] || 0);
    const it = p['item' + k];
    const item = it === 'spatula' ? spatula() : '';
    const hsvg = hand(p['hand' + k], p['thumb' + k] || -side, ARM[2]);
    if (it === 'cup') {
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
  function outfit(kind) {
    if (kind === 'guy') {
      return F(TORSO, '#4a7fc1', '#0e1d33', '#9fc0ea') +
        `<path d="M-16 -190L0 -168L16 -190" fill="none" stroke="#f4f6fa" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<path d="M0 -160V-20" stroke="#3a69a6" stroke-width="4"/><circle cx="0" cy="-130" r="4" fill="#f4f6fa"/><circle cx="0" cy="-95" r="4" fill="#f4f6fa"/><circle cx="0" cy="-60" r="4" fill="#f4f6fa"/>`;
    }
    if (kind === 'girl') {
      return F('M-40 -70C-52 -40 -62 -6 -66 22Q0 40 66 22C62 -6 52 -40 40 -70Z', '#7c5cc0', '#1f1238', '#c2a9f2') +
        F(TORSO, '#b391e6', '#1f1238', '#dccaf8') +
        `<path d="M-16 -192Q0 -176 16 -192" fill="none" stroke="#f1e7ff" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M-36 -70Q0 -62 36 -70" fill="none" stroke="#7c5cc0" stroke-width="8" stroke-linecap="round"/>`;
    }
    return F(TORSO, 'url(#gTorso)');
  }

  const DEF = {
    kind: 'sanya', x: 0, y: 0, sc: 1, rot: 0, lean: 0, headTilt: 0, headY: 0, sqX: 1, sqY: 1,
    armL: [-42, 98], armR: [32, 102], handRotR: -70, handL: 'fist', handR: 'open', handRotL: 0, handRotR: 0,
    legL: [-9, 3], legR: [9, -3], legs: true, armsBehind: false, armBehindR: false, armBehindL: false,
    itemL: '', itemR: '',
  };
  const DEF_FACE = { turn: 0.22, look: [0.35, -0.12], pupil: 1, eye: 1, blink: 0, squint: 0, brow: 0, browTilt: 0, mouth: 'smile', open: 0, sleep: false, sweat: 0, lashes: false, lid: 0, heart: 0, blush: 0 };

  function figure(pose) {
    const p = Object.assign({}, DEF, pose);
    p.face = Object.assign({}, DEF_FACE, pose.face || {});
    if (p.kind === 'mom' || p.kind === 'girl') p.face.lashes = true;
    const o = [];
    o.push(`<g transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.rot)}) scale(${f1(p.sc * p.sqX)} ${f1(p.sc * p.sqY)})">`);
    if (p.legs) o.push(leg(p, -1), leg(p, 1));
    o.push(`<g transform="rotate(${f1(p.lean)})">`);
    if (p.armBehindL) o.push(arm(p, -1));
    if (p.armBehindR) o.push(arm(p, 1));
    o.push(p.kind === 'mom' ? momDress() : outfit(p.kind));
    o.push(`<g transform="translate(0 ${f1(-192 + p.headY)}) rotate(${f1(p.headTilt)}) translate(0 ${f1(-0.86 * R)})">${headSvg(p)}</g>`);
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

  g.CH = { figure, headPos, defs, R, headOnly, armIK, mouthPos, heart };
})(window);
