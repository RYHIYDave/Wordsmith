// THE GODOT PORT, THE RECORDER'S HALF THAT RUNS IN THE GAME'S OWN PAGE (tools/godot_record.mjs puts it there).
//
// The game draws a place with render.ts Renderer.draw(g, W, H, game, fx, t, pace). Here that same call is made with a context
// that draws nothing and writes down everything it is asked to draw: so what comes out is the place exactly as the game
// itself draws it, on any floor, with no second copy of the renderer's rules to keep in step.
//   - `g` is a recording context (RC): every drawImage, fill and clip, with the transform, alpha and blend in force.
//   - the renderer's list of what stands (Renderer.stands) is read as it is sorted, each with its depth, and every draw made
//     while one of them is being drawn is put down to it.
//   - the dark (Renderer.dg, the canvas the lights' holes are cut in) is a recording context too.
// A whole level is drawn at once on a screen made big enough to hold it, the hero parked out in the empty stone where he
// fades no wall and lights nothing.
(() => {
  const d = window.__dbg;
  const REC = (window.__rec = { phase: 'idle', stand: null, snapshot: null, unknown: {}, srcs: [], srcIds: new Map(), errors: [] });

  REC.idOf = (img) => {
    let i = REC.srcIds.get(img);
    if (i === undefined) {
      i = REC.srcs.length;
      REC.srcIds.set(img, i);
      REC.srcs.push(img);
    }
    return i;
  };

  // ------------------------------------------------------------------------------------------------------------------
  // The recording context.
  class RC {
    constructor(name, W, H) {
      this.name = name;
      this.log = [];
      this.m = [1, 0, 0, 1, 0, 0];
      this.stack = [];
      this.alpha = 1;
      this.op = 'source-over';
      this.fillS = '#000';
      this.strokeS = '#000';
      this.lw = 1;
      this.smooth = true;
      this.clips = [];
      this.path = [];
      this.props = {};
      this.canvas = { width: W, height: H, style: {}, __fake: name };
    }
    // --- state ---
    save() {
      this.stack.push({ m: this.m.slice(), alpha: this.alpha, op: this.op, fillS: this.fillS, strokeS: this.strokeS, lw: this.lw, smooth: this.smooth, clips: this.clips, props: { ...this.props } });
    }
    restore() {
      const s = this.stack.pop();
      if (!s) return;
      this.m = s.m;
      this.alpha = s.alpha;
      this.op = s.op;
      this.fillS = s.fillS;
      this.strokeS = s.strokeS;
      this.lw = s.lw;
      this.smooth = s.smooth;
      this.clips = s.clips;
      this.props = s.props;
    }
    get globalAlpha() { return this.alpha; }
    set globalAlpha(v) { if (Number.isFinite(v) && v >= 0 && v <= 1) this.alpha = v; }
    get globalCompositeOperation() { return this.op; }
    set globalCompositeOperation(v) { this.op = v; }
    get fillStyle() { return this.fillS; }
    set fillStyle(v) { this.fillS = v; }
    get strokeStyle() { return this.strokeS; }
    set strokeStyle(v) { this.strokeS = v; }
    get lineWidth() { return this.lw; }
    set lineWidth(v) { this.lw = v; }
    get imageSmoothingEnabled() { return this.smooth; }
    set imageSmoothingEnabled(v) { this.smooth = !!v; }
    // --- transform ---
    setTransform(a, b, c, dd, e, f) {
      if (a === undefined) this.m = [1, 0, 0, 1, 0, 0];
      else if (typeof a === 'object') this.m = [a.a, a.b, a.c, a.d, a.e, a.f];
      else this.m = [a, b, c, dd, e, f];
    }
    resetTransform() { this.m = [1, 0, 0, 1, 0, 0]; }
    getTransform() { const m = this.m; return new DOMMatrix([m[0], m[1], m[2], m[3], m[4], m[5]]); }
    transform(a, b, c, dd, e, f) {
      const m = this.m;
      this.m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * dd, m[1] * c + m[3] * dd, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]];
    }
    translate(x, y) { this.transform(1, 0, 0, 1, x, y); }
    scale(x, y) { this.transform(x, 0, 0, y, 0, 0); }
    rotate(r) { const c = Math.cos(r); const s = Math.sin(r); this.transform(c, s, -s, c, 0, 0); }
    // --- paths ---
    beginPath() { this.path = []; }
    _p(op, args) { this.path.push([op, this.m.slice(), args]); }
    moveTo(...a) { this._p('moveTo', a); }
    lineTo(...a) { this._p('lineTo', a); }
    rect(...a) { this._p('rect', a); }
    arc(...a) { this._p('arc', a); }
    arcTo(...a) { this._p('arcTo', a); }
    ellipse(...a) { this._p('ellipse', a); }
    quadraticCurveTo(...a) { this._p('quadraticCurveTo', a); }
    bezierCurveTo(...a) { this._p('bezierCurveTo', a); }
    roundRect(...a) { this._p('roundRect', a); }
    closePath() { this._p('closePath', []); }
    clip(rule) { this.clips = [...this.clips, { path: this.path.slice(), rule: typeof rule === 'string' ? rule : 'nonzero' }]; }
    // --- drawing ---
    _emit(o) {
      o.m = this.m.slice();
      o.alpha = this.alpha;
      o.op = this.op;
      o.clips = this.clips;
      o.smooth = this.smooth;
      o.phase = REC.phase;
      o.stand = REC.stand;
      this.log.push(o);
    }
    drawImage(img, ...a) {
      if (!img) return;
      this._emit({ k: 'img', src: REC.idOf(img), a });
    }
    fillRect(x, y, w, h) { this._emit({ k: 'rect', x, y, w, h, style: this.fillS }); }
    clearRect(x, y, w, h) { this._emit({ k: 'clear', x, y, w, h }); }
    strokeRect(x, y, w, h) { this._emit({ k: 'srect', x, y, w, h, style: this.strokeS, lw: this.lw }); }
    fill(rule) { this._emit({ k: 'fill', path: this.path.slice(), rule: typeof rule === 'string' ? rule : 'nonzero', style: this.fillS }); }
    stroke() { this._emit({ k: 'stroke', path: this.path.slice(), style: this.strokeS, lw: this.lw, cap: this.props.lineCap, join: this.props.lineJoin, dash: this.props.__dash }); }
    fillText(...a) { this._emit({ k: 'text', a, style: this.fillS, font: this.props.font }); }
    strokeText() {}
    setLineDash(v) { this.props.__dash = v; }
    getLineDash() { return this.props.__dash || []; }
    measureText(s) { return { width: String(s).length * 6 }; }
    createLinearGradient(...args) { return { kind: 'lin', args, stops: [], addColorStop(o, c) { this.stops.push([o, c]); } }; }
    createRadialGradient(...args) { return { kind: 'rad', args, stops: [], addColorStop(o, c) { this.stops.push([o, c]); } }; }
    createConicGradient(...args) { return { kind: 'con', args, stops: [], addColorStop(o, c) { this.stops.push([o, c]); } }; }
    createPattern(img, rep) { return { kind: 'pat', src: REC.idOf(img), rep, setTransform() {} }; }
    getImageData(x, y, w, h) { return new ImageData(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
    createImageData(w, h) { return new ImageData(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
    putImageData(im, x, y) { this._emit({ k: 'put', x, y, w: im.width, h: im.height }); }
    isPointInPath() { return false; }
  }

  /** An RC behind a proxy: anything a real context has that RC has not is counted, and does nothing. */
  function recorder(name, W, H) {
    const rc = new RC(name, W, H);
    const px = new Proxy(rc, {
      get(t, k) {
        if (k in t) return t[k];
        if (typeof k === 'symbol') return undefined;
        if (k in t.props) return t.props[k];
        if (typeof CanvasRenderingContext2D.prototype[k] === 'function') {
          REC.unknown[`${name}.${k}()`] = (REC.unknown[`${name}.${k}()`] || 0) + 1;
          return () => undefined;
        }
        return undefined;
      },
      set(t, k, v) {
        const desc = Object.getOwnPropertyDescriptor(RC.prototype, k);
        if (desc && desc.set) desc.set.call(t, v);
        else if (k in t) t[k] = v;
        else t.props[k] = v;
        return true;
      },
    });
    return { rc, px };
  }

  // ------------------------------------------------------------------------------------------------------------------
  // One frame of the real renderer, written down.
  REC.frame = (t, W, H) => {
    const R = d.renderer;
    const game = d.game();
    const G = recorder('g', W, H);
    const D = recorder('dg', W, H);
    const realDark = R.dark;
    const realDg = R.dg;
    const fakeDark = { width: W, height: H, style: {}, __fake: 'dark', getContext: () => D.px };
    R.dark = fakeDark;
    R.dg = D.px;
    const stands = R.stands;
    REC.phase = 'floor';
    REC.stand = null;
    REC.snapshot = null;
    let ordered = null;
    stands.sort = function (cmp) {
      Array.prototype.sort.call(this, cmp);
      ordered = this.slice();
      REC.phase = 'stands';
      const self = this;
      this[Symbol.iterator] = function* () {
        delete self[Symbol.iterator];
        for (let i = 0; i < self.length; i++) {
          REC.stand = i;
          yield self[i];
        }
        REC.stand = null;
        REC.phase = 'after';
      };
      return this;
    };
    const ownLight = Object.prototype.hasOwnProperty.call(R, 'light');
    const light = R.light;
    R.light = function (...a) {
      REC.phase = 'light';
      REC.stand = null;
      try {
        return light.apply(this, a);
      } finally {
        REC.phase = 'lit';
      }
    };
    let cam = null;
    let err = null;
    try {
      const c = R.draw(G.px, W, H, game, d.fx, t, 0);
      cam = { ox: c.ox, oy: c.oy };
    } catch (e) {
      err = String(e && e.stack ? e.stack : e);
    } finally {
      delete stands.sort;
      delete stands[Symbol.iterator];
      if (ownLight) R.light = light;
      else delete R.light;
      R.dark = realDark;
      R.dg = realDg;
      REC.phase = 'idle';
      REC.stand = null;
    }
    return { g: G.rc.log, dg: D.rc.log, stands: ordered, cam, err, darkId: REC.srcIds.get(fakeDark) };
  };

  // ------------------------------------------------------------------------------------------------------------------
  // Setting a place up to be recorded.

  /** Start a new game (a class, a seed), and wait for the town. */
  REC.begin = (cls, seed) => {
    d.saving(false);
    d.run(cls, seed);
    d.autoLevel = false;
    d.autoWords = false;
  };
  REC.loading = () => !!d.loadingNow();

  /** Go to a floor (0: stay in town). */
  REC.enter = (depth) => {
    const g = d.game();
    if (depth > 0) {
      g.depth = depth;
      g.enterDungeon(depth === 1 ? 'gate' : undefined);
    }
    return { town: !!g.level.town, depth: g.depth, w: g.level.floor.w, h: g.level.floor.h };
  };

  /**
   * Make the place ready: time stopped, everything seen, nobody about (the monsters, what they left, what is in the air), the
   * hero parked where the stone is empty furthest from any floor.
   */
  REC.ready = () => {
    const g = d.game();
    const L = g.level;
    const f = L.floor;
    d.slowmo = 1e-9;
    d.god = true;
    L.explored.fill(1);
    if (L.visible) L.visible.fill(1);
    REC.kept = { monsters: g.monsters.slice(), hero: { x: g.hero.x, y: g.hero.y } };
    g.monsters.length = 0;
    for (const k of ['drops', 'projectiles', 'zones', 'orbs', 'volleys', 'familiars', 'perils', 'risers', 'spears']) if (Array.isArray(g[k])) g[k].length = 0;
    d.renderer.skip.add('vignette');
    // the emptiest spot: the tile furthest (by steps of a king) from anything that is not empty stone
    const dist = new Int16Array(f.w * f.h).fill(-1);
    let q = [];
    for (let i = 0; i < dist.length; i++) if (f.tiles[i] !== 0) { dist[i] = 0; q.push(i); }
    let best = 0;
    let bestD = -1;
    // (the level's own edge counts as something too, so that he is not parked against it)
    while (q.length) {
      const nq = [];
      for (const i of q) {
        const x = i % f.w;
        const y = (i / f.w) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
          const j = ny * f.w + nx;
          if (dist[j] >= 0) continue;
          dist[j] = dist[i] + 1;
          nq.push(j);
        }
      }
      q = nq;
    }
    const spots = [];
    for (let i = 0; i < dist.length; i++) {
      const x = i % f.w;
      const y = (i / f.w) | 0;
      const edge = Math.min(x, y, f.w - 1 - x, f.h - 1 - y);
      const v = Math.min(dist[i], edge);
      spots.push([v, i]);
      if (v > bestD) { bestD = v; best = i; }
    }
    spots.sort((a, b) => b[0] - a[0]);
    // a second spot, far from the first, as empty as may be (for the check that nothing recorded hangs on where he is)
    const bx = best % f.w;
    const by = (best / f.w) | 0;
    let second = best;
    let secondScore = -1;
    for (const [v, i] of spots) {
      if (v < Math.min(6, bestD)) break;
      const x = i % f.w;
      const y = (i / f.w) | 0;
      const far = Math.hypot(x - bx, y - by);
      if (far > secondScore) { secondScore = far; second = i; }
    }
    REC.park = [{ x: bx + 0.5, y: by + 0.5, clear: bestD }, { x: (second % f.w) + 0.5, y: ((second / f.w) | 0) + 0.5, clear: Math.min(dist[second], 99) }];
    // (THE FALLEN WORDSMITH is the Godot side's own to draw, searched and unsearched (loot.gd): he is set down by the hero, out
    // in the empty stone, where what is drawn of him is left out with the hero's own)
    REC.body = null;
    for (const p of L.props) {
      if (p.kind !== 'body') continue;
      REC.body = { x: p.x, y: p.y };
      p.x = bx + 0.9;
      p.y = by + 0.9;
      p.tx = bx;
      p.ty = by;
    }
    // (what the level is, to hold against the layout the Godot side has: its tiles, its doors, its chests, barrels and urns)
    let hash = 0;
    for (let i = 0; i < f.tiles.length; i++) hash = (Math.imul(hash, 31) + f.tiles[i]) | 0;
    const sig = { tiles: hash, doors: (L.doors || []).map((q) => `${q.spot.kind}:${q.spot.alongX ? 'x' : 'y'}:${q.spot.a}:${q.spot.plane}`), props: L.props.map((p, i) => (p.kind === 'chest' || p.kind === 'barrel' || p.kind === 'urn' ? `${i}:${p.kind}:${p.tx}:${p.ty}` : '')).filter((x) => x) };
    const look = d.renderer.lookOf ? d.renderer.lookOf(L) : null;
    return { w: f.w, h: f.h, park: REC.park, monsters: REC.kept.monsters.length, props: L.props.length, doors: L.doors ? L.doors.length : 0, look: !!look, vignette: look && look.vignette !== undefined ? look.vignette : null, sig };
  };

  REC.parkAt = (n) => {
    const g = d.game();
    g.hero.x = REC.park[n].x;
    g.hero.y = REC.park[n].y;
  };
})();

// ====================================================================================================================
// WHAT A FRAME HOLDS, read out of its record: the ground's draws in order, what stands (each with its depth), the dark's
// holes, the glows over it. Everything measured from the screen point of world (0, 0), in game pixels.
(() => {
  const d = window.__dbg;
  const REC = window.__rec;
  /** What Renderer.wallVeil is made to answer while a place is recorded: a wall that would fade is known by it. */
  const SENT = 0.424242;
  REC.SENT = SENT;
  const ident = (m) => m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1;
  const simpleRect = (c) => c.path.length === 1 && c.path[0][0] === 'rect' && ident(c.path[0][1]);

  /** A picture made here (a stand cut by the raised ground before it), as a source of its own. */
  const cuts = new Map();
  function cutPicture(e, left, top, w, h) {
    // (the same picture cut the same way is the same picture: made once)
    const r = (n) => Math.round(n * 100) / 100;
    const sig = `${e.src}|${e.a.map(r).join(',')}|${r(w)}x${r(h)}|` + e.clips.map((cl) => cl.rule + ':' + cl.path.map(([op, m, args]) => `${op}(${m.map(r).join(',')};${args.map((v, i) => (op === 'closePath' ? '' : r(v - (op === 'rect' && i >= 2 ? 0 : i % 2 === 0 ? left : top)))).join(',')})`).join(' ')).join('|');
    const had = cuts.get(sig);
    if (had !== undefined) return had;
    const id = cutPictureNew(e, left, top, w, h);
    cuts.set(sig, id);
    return id;
  }
  function cutPictureNew(e, left, top, w, h) {
    const src = REC.srcs[e.src];
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * 2));
    c.height = Math.max(1, Math.round(h * 2));
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    for (const cl of e.clips) {
      x.beginPath();
      for (const [op, m, args] of cl.path) {
        x.setTransform(2 * m[0], 2 * m[1], 2 * m[2], 2 * m[3], 2 * (m[4] - left), 2 * (m[5] - top));
        x[op](...args);
      }
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clip(cl.rule);
    }
    x.setTransform(2, 0, 0, 2, -left * 2, -top * 2);
    x.globalAlpha = 1;
    if (e.a.length === 8) x.drawImage(src, e.a[0], e.a[1], e.a[2], e.a[3], e.a[4], e.a[5], e.a[6], e.a[7]);
    else x.drawImage(src, left, top, w, h);
    c.__made = true;
    return REC.idOf(c);
  }

  /**
   * One image draw as an entry: { src, sub: [sx, sy, sw, sh] | null (picture pixels of the source), x, y (top left), w, h
   * (drawn size), nat (drawn at the source's own size), a, add }.
   */
  function drawOf(e, note) {
    if (!ident(e.m)) { note('transformed draw'); return null; }
    const src = REC.srcs[e.src];
    if (!src || src.__fake) return null;
    let sx = 0;
    let sy = 0;
    let sw = src.width;
    let sh = src.height;
    let dx;
    let dy;
    let dw;
    let dh;
    if (e.a.length === 2) { [dx, dy] = e.a; dw = src.width; dh = src.height; }
    else if (e.a.length === 4) [dx, dy, dw, dh] = e.a;
    else if (e.a.length === 8) [sx, sy, sw, sh, dx, dy, dw, dh] = e.a;
    else { note('drawImage with ' + e.a.length + ' numbers'); return null; }
    dx += e.m[4];
    dy += e.m[5];
    let srcId = e.src;
    let sub = sx !== 0 || sy !== 0 || sw !== src.width || sh !== src.height ? [sx, sy, sw, sh] : null;
    if (e.clips.length) {
      if (e.clips.every(simpleRect)) {
        // (a rectangle's clip: the part of the picture inside it, as a part of the source)
        let x0 = dx;
        let y0 = dy;
        let x1 = dx + dw;
        let y1 = dy + dh;
        for (const c of e.clips) {
          const [cx, cy, cw, ch] = c.path[0][2];
          const m = c.path[0][1];
          x0 = Math.max(x0, cx + m[4]);
          y0 = Math.max(y0, cy + m[5]);
          x1 = Math.min(x1, cx + m[4] + cw);
          y1 = Math.min(y1, cy + m[5] + ch);
        }
        if (x1 <= x0 || y1 <= y0) return null;
        const kx = sw / dw;
        const ky = sh / dh;
        sub = [sx + (x0 - dx) * kx, sy + (y0 - dy) * ky, (x1 - x0) * kx, (y1 - y0) * ky];
        dx = x0;
        dy = y0;
        dw = x1 - x0;
        dh = y1 - y0;
        sw = sub[2];
        sh = sub[3];
      } else {
        srcId = cutPicture(e, dx, dy, dw, dh);
        sub = null;
        sw = Math.round(dw * 2);
        sh = Math.round(dh * 2);
        note('cut by a shape');
      }
    }
    const rx = sw / dw;
    const ry = sh / dh;
    const nat = (Math.abs(rx - 2) < 1e-6 && Math.abs(ry - 2) < 1e-6) ? 2 : (Math.abs(rx - 1) < 1e-6 && Math.abs(ry - 1) < 1e-6) ? 1 : 0;
    return { src: srcId, sub, x: dx, y: dy, w: dw, h: dh, nat, a: e.alpha, add: e.op === 'lighter', op: e.op };
  }

  REC.analyze = (fr, W, H) => {
    const game = d.game();
    const hero = game.hero;
    const cam = fr.cam;
    const out = { ground: [], stands: [], holes: [], glows: [], veil: null, clear: null, odd: {} };
    const note = (k) => { out.odd[k] = (out.odd[k] || 0) + 1; };
    const hx = cam.ox + (hero.x - hero.y) * 16;
    const hy = cam.oy + (hero.x + hero.y) * 8;
    const nearHero = (x, y, w, h) => Math.abs(x + w / 2 - hx) < 48 && Math.abs(y + h / 2 - hy) < 48;
    const byStand = new Map();
    for (const e of fr.g) {
      if (e.phase === 'floor') {
        if (e.k === 'rect') {
          if (e.w >= W * 0.9 && e.h >= H * 0.9) {
            if (out.clear === null && e.alpha === 1 && typeof e.style === 'string') out.clear = e.style;
            else note('a fill over the whole screen: ' + (typeof e.style === 'string' ? e.style : e.style && e.style.kind) + ' ' + e.op + ' ' + e.alpha);
          } else note('a filled rectangle on the ground');
          continue;
        }
        if (e.k !== 'img') { note('ground ' + e.k); continue; }
        if (e.op !== 'source-over' && e.op !== 'lighter') { note('ground blend ' + e.op); continue; }
        const q = drawOf(e, note);
        if (!q) continue;
        if (nearHero(q.x, q.y, q.w, q.h)) { note('by the hero'); continue; }
        q.x -= cam.ox;
        q.y -= cam.oy;
        out.ground.push(q);
      } else if (e.phase === 'stands') {
        let list = byStand.get(e.stand);
        if (!list) byStand.set(e.stand, (list = []));
        list.push(e);
      } else if (e.phase === 'lit') {
        if (e.k === 'img' && e.op === 'lighter') {
          const q = drawOf(e, note);
          if (!q) continue;
          if (nearHero(q.x, q.y, q.w, q.h)) { note('glow by the hero'); continue; }
          q.x -= cam.ox;
          q.y -= cam.oy;
          out.glows.push(q);
        } else if (e.k === 'img') {
          const s = REC.srcs[e.src];
          if (!(s && s.__fake === 'dark')) note('after the dark: a picture ' + e.op);
        } else note('after the dark: ' + e.k);
      } else note(e.phase + ' ' + e.k);
    }
    // what stands
    const st = fr.stands || [];
    const calls = fr.walls || [];
    let ci = 0;
    // (the walls' calls are in the order their stands were pushed: by q)
    const wallOf = (q) => {
      let lo = 0;
      let hi = calls.length - 1;
      let best = null;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (calls[mid].q <= q) { best = calls[mid]; lo = mid + 1; } else hi = mid - 1;
      }
      return best;
    };
    for (let i = 0; i < st.length; i++) {
      const s = st[i];
      if (s.figure || s.skip) continue;
      // (what stands by the hero, out in the empty stone: the fallen wordsmith set aside there)
      if (Math.abs(s.x - hx) < 48 && Math.abs(s.y - hy) < 48) { note('standing by the hero'); continue; }
      const list = byStand.get(i);
      if (!list) { note('a stand not drawn'); continue; }
      let wall = null;
      if (Math.abs(s.alpha - SENT) < 1e-9) {
        const c = wallOf(s.q);
        wall = c ? [c.px - cam.ox, c.py - cam.oy, c.depth, c.idx] : null;
        if (!c) note('a fading stand with no wall');
      } else if (s.alpha !== 1) note('a stand at alpha ' + s.alpha.toFixed(2));
      for (const e of list) {
        if (e.k !== 'img') { note('stand ' + e.k); continue; }
        if (e.op !== 'source-over' && e.op !== 'lighter') { note('stand blend ' + e.op); continue; }
        const q = drawOf(e, note);
        if (!q) continue;
        const sp = s.s;
        // (the stand's own picture, laid by its anchor: kept by its anchor, so that a run of pictures of it holds its place)
        const own = REC.srcs[q.src] === sp.img && !q.sub && Math.abs(q.x - (s.x - sp.ax)) < 1e-6 && Math.abs(q.y - (s.y - sp.ay)) < 1e-6 && q.nat;
        const a = wall ? 1 : Math.abs(q.a - SENT) < 1e-9 ? 1 : q.a;
        out.stands.push({ src: q.src, sub: q.sub, own, ax: own ? sp.ax : 0, ay: own ? sp.ay : 0, x: (own ? s.x : q.x) - cam.ox, y: (own ? s.y : q.y) - cam.oy, w: q.w, h: q.h, nat: q.nat, a, add: q.add, d: s.d, q: s.q, wall });
      }
    }
    // the dark and its holes
    for (const e of fr.dg) {
      if (e.k === 'clear') continue;
      if (e.k === 'rect' && e.op === 'source-over') {
        if (out.veil === null) out.veil = e.style;
        else note('a second veil: ' + e.style);
        continue;
      }
      if (e.k === 'img' && e.op === 'destination-out') {
        const [x, y, w, h] = e.a;
        const cx = x + w / 2;
        const cy = y + h / 2;
        if (Math.abs(cx - hx) < 48 && Math.abs(cy - hy) < 48) continue;
        out.holes.push({ x: cx - cam.ox, y: cy - cam.oy, r: w / 2, ry: h / 2, a: e.alpha });
        continue;
      }
      note('on the dark: ' + e.k + ' ' + e.op);
    }
    return out;
  };

  /** A frame recorded with the walls answering SENT, and analysed. */
  REC.take = (t, W, H) => {
    const R = d.renderer;
    const calls = [];
    const own = Object.prototype.hasOwnProperty.call(R, 'wallVeil');
    const veil = R.wallVeil;
    R.wallVeil = function (game, idx, px, py, depth) {
      calls.push({ q: this.stands.length, idx, px, py, depth });
      return SENT;
    };
    let fr;
    try {
      fr = REC.frame(t, W, H);
    } finally {
      if (own) R.wallVeil = veil;
      else delete R.wallVeil;
    }
    if (fr.err) return { err: fr.err };
    fr.walls = calls;
    return REC.analyze(fr, W, H);
  };
})();

// ====================================================================================================================
// A PLACE OVER TIME: the frame taken again and again a thirtieth of a second apart; what never changes is a still
// picture, what changes is a run of pictures (a flame, water, a shaft of light); and then the sheet of every picture used.
(() => {
  const d = window.__dbg;
  const REC = window.__rec;
  const RATE = 30;
  const r3 = (n) => Math.round(n * 1000) / 1000;

  /** The key of a picture as it is drawn: the source, the part of it, and (a stand's own) its anchor. */
  function picKey(q, anchored) {
    return `${q.src}${q.sub ? `r${q.sub.map(r3).join('_')}` : ''}${anchored ? `a${r3(q.ax)}_${r3(q.ay)}` : ''}`;
  }

  REC.accBegin = (N) => {
    REC.acc = { N, k: 0, keyIds: new Map(), keys: [], things: [], byId: new Map(), holes: [], glows: [], veil: null, clear: null, odd: {}, groundOrder: [] };
  };

  function keyId(A, key, q, anchored) {
    let i = A.keyIds.get(key);
    if (i === undefined) {
      i = A.keys.length;
      A.keyIds.set(key, i);
      A.keys.push({ key, src: q.src, sub: q.sub, ax: anchored ? q.ax : 0, ay: anchored ? q.ay : 0, nat: q.nat });
    }
    return i;
  }

  /** One more frame into the tally. */
  REC.accAdd = (fr) => {
    const A = REC.acc;
    const k = A.k++;
    for (const o in fr.odd) A.odd[o] = (A.odd[o] || 0) + fr.odd[o];
    if (k === 0) { A.veil = fr.veil; A.clear = fr.clear; }
    A.holes.push(fr.holes);
    A.glows.push(fr.glows);
    const count = new Map();
    let prev = -1;
    const see = (slot, q, anchored, extra) => {
      const n = count.get(slot) || 0;
      count.set(slot, n + 1);
      const id = `${slot}#${n}`;
      const key = keyId(A, picKey(q, anchored), q, anchored);
      let ti = A.byId.get(id);
      if (ti === undefined) {
        ti = A.things.length;
        A.byId.set(id, ti);
        A.things.push({ ...extra, id, first: key, tl: null, born: k, last: k, after: prev });
        const T = A.things[ti];
        if (k > 0) { T.tl = new Int32Array(A.N).fill(-1); T.tl[k] = key; }
      } else {
        const T = A.things[ti];
        if (T.tl === null && (key !== T.first || T.last !== k - 1)) {
          T.tl = new Int32Array(A.N).fill(-1);
          for (let j = T.born; j <= T.last; j++) T.tl[j] = T.first;
        }
        if (T.tl) T.tl[k] = key;
        T.last = k;
      }
      prev = ti;
      return ti;
    };
    for (const q of fr.ground) {
      const stretched = !q.nat;
      const slot = `G|${q.add ? 1 : 0}|${r3(q.x)}|${r3(q.y)}|${stretched ? `${r3(q.w)}x${r3(q.h)}` : ''}|${r3(q.a)}`;
      see(slot, q, false, { kind: 'g', x: q.x, y: q.y, w: stretched ? q.w : 0, h: stretched ? q.h : 0, a: q.a, add: q.add });
    }
    prev = -1;
    for (const q of fr.stands) {
      const stretched = !q.nat;
      const slot = `S|${q.add ? 1 : 0}|${r3(q.x)}|${r3(q.y)}|${r3(q.d)}|${stretched ? `${r3(q.w)}x${r3(q.h)}` : ''}|${r3(q.a)}|${q.wall ? 1 : 0}`;
      see(slot, q, q.own, { kind: 's', x: q.x, y: q.y, w: stretched ? q.w : 0, h: stretched ? q.h : 0, a: q.a, add: q.add, d: q.d, q: q.q, wall: q.wall });
    }
    return { k, things: A.things.length, keys: A.keys.length };
  };

  /** A thing's run of pictures over the frames taken, as [frames (key ids, -1 for none), fps]. */
  function runOf(tl, N) {
    // the shortest stretch it repeats by (if it repeats within the frames taken)
    let p = N;
    for (let c = 1; c <= N / 2; c++) {
      let ok = true;
      for (let i = 0; i + c < N; i++) if (tl[i] !== tl[i + c]) { ok = false; break; }
      if (ok) { p = c; break; }
    }
    // the longest step every change falls on
    const g2 = (a, b) => { while (b) { const t = a % b; a = b; b = t; } return a; };
    let g = p;
    let run = 1;
    for (let i = 1; i <= p; i++) {
      if (i < p && tl[i] === tl[i - 1]) { run++; continue; }
      g = g2(g, run);
      run = 1;
    }
    // (a run that wraps round the end joins the one at the start)
    const frames = [];
    for (let i = 0; i < p; i += g) frames.push(tl[i]);
    return { frames, fps: RATE / g, whole: p === N };
  }

  /** The tally made the place's lists: the ground in its order, what stands by depth, the lights. */
  REC.accEnd = () => {
    const A = REC.acc;
    const N = A.k;
    const used = new Set();
    const itemOf = (T) => {
      let frames;
      let fps = RATE;
      let whole = false;
      if (T.tl === null && T.last === N - 1 && T.born === 0) frames = [T.first];
      else {
        if (T.tl === null) {
          T.tl = new Int32Array(A.N).fill(-1);
          for (let j = T.born; j <= T.last; j++) T.tl[j] = T.first;
        }
        const r = runOf(T.tl.subarray(0, N), N);
        frames = r.frames;
        fps = r.fps;
        whole = r.whole;
      }
      for (const f of frames) if (f >= 0) used.add(f);
      return { frames, fps, whole };
    };
    // the ground, in the order it was drawn: a thing first seen in a later frame goes in after the one drawn before it then
    const ground = [];
    const late = new Map();
    A.things.forEach((T, i) => {
      if (T.kind !== 'g') return;
      if (T.born === 0) ground.push(i);
      else {
        let l = late.get(T.after);
        if (!l) late.set(T.after, (l = []));
        l.push(i);
      }
    });
    const order = [];
    const put = (i) => {
      order.push(i);
      const l = late.get(i);
      if (l) for (const j of l) put(j);
    };
    for (const j of late.get(-1) || []) put(j);
    for (const i of ground) put(i);
    order.forEach((i, pos) => { A.things[i].pos = pos; });
    const G = order.map((i) => {
      const T = A.things[i];
      const r = itemOf(T);
      return { f: r.frames, fps: r.fps, x: r3(T.x), y: r3(T.y), a: r3(T.a), w: r3(T.w), h: r3(T.h), add: T.add ? 1 : 0, whole: r.whole };
    });
    const S = A.things.filter((T) => T.kind === 's').sort((a, b) => a.d - b.d || a.q - b.q).map((T, pos) => {
      T.pos = pos;
      const r = itemOf(T);
      return { f: r.frames, fps: r.fps, x: r3(T.x), y: r3(T.y), d: Math.round(T.d * 1e5) / 1e5, a: r3(T.a), w: r3(T.w), h: r3(T.h), add: T.add ? 1 : 0, wall: T.wall ? T.wall.map(r3) : null, whole: r.whole };
    });
    // the lights: the same ones every frame (by their place in the list), each with how far its size swings
    const flick = (lists, size) => {
      const base = lists[0] || [];
      const same = lists.every((l) => l.length === base.length);
      return base.map((h, i) => {
        let lo = size(h);
        let hi = size(h);
        let sum = 0;
        let n = 0;
        if (same) for (const l of lists) { const v = size(l[i]); lo = Math.min(lo, v); hi = Math.max(hi, v); sum += v; n++; }
        else { sum = size(h); n = 1; }
        return { h, mean: sum / n, swing: (hi - lo) / 2 };
      });
    };
    const holes = flick(A.holes, (h) => h.r).map(({ h, mean, swing }) => ({ x: r3(h.x), y: r3(h.y), r: r3(mean), ry: r3(h.ry * (mean / h.r)), a: r3(h.a), flicker: r3(swing) }));
    const glows = flick(A.glows, (q) => q.w).map(({ h: q, mean, swing }) => {
      const key = keyId(A, picKey(q, false), q, false);
      used.add(key);
      const k = mean / q.w;
      return { f: key, x: r3(q.x + q.w / 2), y: r3(q.y + q.h / 2), w: r3(mean), h: r3(q.h * k), a: r3(q.a), flicker: r3(swing) };
    });
    REC.result = { N, ground: G, stands: S, holes, glows, veil: A.veil, clear: A.clear, odd: A.odd, used: [...used].sort((a, b) => a - b), holesSame: A.holes.every((l) => l.length === A.holes[0].length), glowsSame: A.glows.every((l) => l.length === A.glows[0].length) };
    return { N, ground: G.length, groundMoving: G.filter((q) => q.f.length > 1).length, stands: S.length, standsMoving: S.filter((q) => q.f.length > 1).length, walls: S.filter((q) => q.wall).length, holes: holes.length, glows: glows.length, keys: A.keys.length, used: used.size, veil: A.veil, clear: A.clear, odd: A.odd, whole: G.filter((q) => q.whole).length + S.filter((q) => q.whole).length };
  };

  // ------------------------------------------------------------------------------------------------------------------
  // THE SHEETS: every picture used, two picture pixels to a game pixel, packed on pages no wider or taller than `side`.
  REC.sheets = (side = 4096) => {
    const A = REC.acc;
    const res = REC.result;
    // (a source drawn at its own size one to one is a picture at the coarser grain: it goes on the sheet doubled)
    const dens = new Map();
    // (and the pictures the place's states add)
    const usedAll = [...new Set([...res.used, ...(REC.extra || [])])].sort((a, b) => a - b);
    for (const ki of usedAll) {
      const K = A.keys[ki];
      const was = dens.get(K.src);
      const now = K.nat === 1 ? 1 : 2;
      dens.set(K.src, was === undefined ? now : Math.min(was, now));
    }
    const srcs = [...dens.keys()].map((id) => {
      const s = REC.srcs[id];
      const k = dens.get(id) === 1 ? 2 : 1;
      return { id, w: s.width * k, h: s.height * k, k };
    }).sort((a, b) => b.h - a.h || b.w - a.w);
    const pages = [];
    let page = null;
    const place = new Map();
    for (const s of srcs) {
      if (s.w > side || s.h > side) { REC.errors.push(`a picture ${s.w}x${s.h} is bigger than a sheet`); continue; }
      if (!page || (page.x + s.w > side && page.y + page.row + s.h > side)) {
        page = { x: 0, y: 0, row: 0, list: [] };
        pages.push(page);
      }
      if (page.x + s.w > side) { page.x = 0; page.y += page.row + 1; page.row = 0; }
      if (page.y + s.h > side) { page = { x: 0, y: 0, row: 0, list: [] }; pages.push(page); }
      place.set(s.id, { page: pages.length - 1, x: page.x, y: page.y, k: s.k });
      page.list.push({ id: s.id, x: page.x, y: page.y, w: s.w, h: s.h });
      page.x += s.w + 1;
      page.row = Math.max(page.row, s.h);
    }
    const out = [];
    for (const p of pages) {
      const W = Math.max(...p.list.map((q) => q.x + q.w));
      const H = Math.max(...p.list.map((q) => q.y + q.h));
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      for (const q of p.list) x.drawImage(REC.srcs[q.id], q.x, q.y, q.w, q.h);
      out.push({ w: W, h: H, png: c.toDataURL('image/png').split(',')[1] });
    }
    // each key: [x, y, w, h, ax, ay, page], in picture pixels
    const pics = {};
    for (const ki of usedAll) {
      const K = A.keys[ki];
      const at = place.get(K.src);
      if (!at) continue;
      const s = REC.srcs[K.src];
      const sub = K.sub || [0, 0, s.width, s.height];
      pics[ki] = [at.x + Math.round(sub[0] * at.k), at.y + Math.round(sub[1] * at.k), Math.round(sub[2] * at.k), Math.round(sub[3] * at.k), Math.round(K.ax * 2 * 1000) / 1000, Math.round(K.ay * 2 * 1000) / 1000, at.page];
    }
    return { pages: out, pics };
  };
})();


// ====================================================================================================================
// THE PLACE'S STATES: a door swinging, a gate rising, a chest open, an urn broken, the way on opening. The game is put in
// the state, the frame taken at the first frame's moment, and what differs from the place as recorded is written down:
// which of its things are not there (by their places in the lists), and what is drawn in their stead.
(() => {
  const d = window.__dbg;
  const REC = window.__rec;
  const r3 = (n) => Math.round(n * 1000) / 1000;
  const picKey = (q, anchored) => `${q.src}${q.sub ? `r${q.sub.map(r3).join('_')}` : ''}${anchored ? `a${r3(q.ax)}_${r3(q.ay)}` : ''}`;

  /** The frame `fr` against the place as recorded: { hg, hs: what of the ground and of what stands is gone; g, s: what is new }. */
  REC.differ = (fr) => {
    const A = REC.acc;
    const res = REC.result;
    const count = new Map();
    const seen = new Set();
    const out = { hg: [], hs: [], g: [], s: [] };
    const keyOf = (q, anchored) => {
      const k = picKey(q, anchored);
      let i = A.keyIds.get(k);
      if (i === undefined) {
        i = A.keys.length;
        A.keyIds.set(k, i);
        A.keys.push({ key: k, src: q.src, sub: q.sub, ax: anchored ? q.ax : 0, ay: anchored ? q.ay : 0, nat: q.nat });
      }
      return i;
    };
    const first = (T) => (T.tl ? T.tl[0] : T.born === 0 ? T.first : -1);
    let lastBase = -1;
    for (const q of fr.ground) {
      const stretched = !q.nat;
      const slot = `G|${q.add ? 1 : 0}|${r3(q.x)}|${r3(q.y)}|${stretched ? `${r3(q.w)}x${r3(q.h)}` : ''}|${r3(q.a)}`;
      const n = count.get(slot) || 0;
      count.set(slot, n + 1);
      const ti = A.byId.get(`${slot}#${n}`);
      const key = keyOf(q, false);
      if (ti !== undefined && first(A.things[ti]) === key) {
        seen.add(ti);
        lastBase = A.things[ti].pos;
        continue;
      }
      REC.extra.add(key);
      out.g.push({ f: key, x: r3(q.x), y: r3(q.y), a: r3(q.a), w: stretched ? r3(q.w) : 0, h: stretched ? r3(q.h) : 0, add: q.add ? 1 : 0, after: lastBase });
    }
    for (const q of fr.stands) {
      const stretched = !q.nat;
      const slot = `S|${q.add ? 1 : 0}|${r3(q.x)}|${r3(q.y)}|${r3(q.d)}|${stretched ? `${r3(q.w)}x${r3(q.h)}` : ''}|${r3(q.a)}|${q.wall ? 1 : 0}`;
      const n = count.get(slot) || 0;
      count.set(slot, n + 1);
      const ti = A.byId.get(`${slot}#${n}`);
      const key = keyOf(q, q.own);
      if (ti !== undefined && first(A.things[ti]) === key) {
        seen.add(ti);
        continue;
      }
      REC.extra.add(key);
      out.s.push({ f: key, x: r3(q.x), y: r3(q.y), d: Math.round(q.d * 1e5) / 1e5, a: r3(q.a), w: stretched ? r3(q.w) : 0, h: stretched ? r3(q.h) : 0, add: q.add ? 1 : 0, wall: q.wall ? q.wall.map(r3) : null });
    }
    A.things.forEach((T, ti) => {
      if (seen.has(ti) || first(T) < 0 || T.pos === undefined) return;
      (T.kind === 'g' ? out.hg : out.hs).push(T.pos);
    });
    return out;
  };

  /**
   * A state's frames: `set(v)` puts the game in the state at each of `values`, `unset()` puts it back. `base`: what differs
   * of itself at that moment with nothing set (a frame of the place as it is), taken out of every frame.
   */
  REC.variant = (T0, W, H, values, set, unset) => {
    const g = d.game();
    const frames = [];
    for (const v of values) {
      set(v);
      g.time = REC.time0;
      const fr = REC.take(T0, W, H);
      if (fr.err) { unset(); return { err: fr.err }; }
      const df = REC.differ(fr);
      const B = REC.baseDiff;
      if (B) {
        // (what differs with nothing set at all is no part of the state: a thing that flickers by more than the clock)
        const drop = (list, base) => list.filter((x) => !base.has(x));
        df.hg = drop(df.hg, B.hg);
        df.hs = drop(df.hs, B.hs);
        df.g = df.g.filter((e) => !B.g.has(`${e.f}|${e.x}|${e.y}`));
        df.s = df.s.filter((e) => !B.s.has(`${e.f}|${e.x}|${e.y}|${e.d}`));
      }
      frames.push(df);
    }
    unset();
    return { frames };
  };

  /** Begin the states: the pictures they add are kept apart; the place as it is, taken once more, is what nothing changed looks like. */
  REC.statesBegin = (T0, W, H) => {
    REC.extra = new Set();
    REC.baseDiff = null;
    const g = d.game();
    g.time = REC.time0;
    const fr = REC.take(T0, W, H);
    if (fr.err) return { err: fr.err };
    const df = REC.differ(fr);
    REC.baseDiff = { hg: new Set(df.hg), hs: new Set(df.hs), g: new Set(df.g.map((e) => `${e.f}|${e.x}|${e.y}`)), s: new Set(df.s.map((e) => `${e.f}|${e.x}|${e.y}|${e.d}`)) };
    return { hg: df.hg.length, hs: df.hs.length, g: df.g.length, s: df.s.length };
  };

  /** Every state of the place's doors, props and ways, by name. `consts`: the lengths of the ways' films, in seconds. */
  REC.states = (T0, W, H, consts) => {
    const g = d.game();
    const L = g.level;
    const out = {};
    const note = {};
    const steps = (n) => Array.from({ length: n + 1 }, (_, i) => i / n);
    // the doors and gates, each from shut to open
    (L.doors || []).forEach((door, i) => {
      const was = { open: door.open, want: door.want };
      const r = REC.variant(T0, W, H, steps(20), (v) => { door.open = v; }, () => { door.open = was.open; door.want = was.want; });
      if (r.err) { note[`door${i}`] = r.err; return; }
      out[`door${i}`] = { kind: door.spot.kind, at: was.open, frames: r.frames };
    });
    // the chests, barrels and urns: opened, broken
    L.props.forEach((p, i) => {
      if (p.kind !== 'chest' && p.kind !== 'barrel' && p.kind !== 'urn') return;
      const was = p.state;
      const r = REC.variant(T0, W, H, [1], () => { p.state = 1; }, () => { p.state = was; });
      if (r.err) { note[`prop${i}`] = r.err; return; }
      out[`prop${i}`] = { kind: p.kind, frames: [{ hg: [], hs: [], g: [], s: [] }, r.frames[0]] };
    });
    // the ways on
    const Wy = L.ways;
    if (Wy) {
      const film = (secs, fps) => steps(Math.max(1, Math.round(secs * fps)));
      (Wy.stairs || []).forEach((st, j) => {
        const was = { stair: Wy.stair, open: st.open, t: st.t };
        const walk = L.walk.slice();
        const r = REC.variant(T0, W, H, film(consts.stair, 10), (v) => { Wy.stair = st; st.open = true; st.t = v * consts.stair; }, () => { Wy.stair = was.stair; st.open = was.open; if (was.t === undefined) delete st.t; else st.t = was.t; L.walk.set(walk); });
        if (r.err) { note[`stair${j}`] = r.err; return; }
        out[`stair${j}`] = { kind: 'stair', secs: consts.stair, frames: r.frames };
      });
      if (Wy.exit) {
        const ex = Wy.exit;
        const was = { state: ex.state, t: ex.t };
        const r = REC.variant(T0, W, H, film(consts.exit, 10), (v) => { ex.state = v >= 1 ? 'open' : 'opening'; ex.t = v * consts.exit; }, () => { ex.state = was.state; ex.t = was.t; });
        if (r.err) note.exit = r.err;
        else out.exit = { kind: 'exit', secs: consts.exit, frames: r.frames };
      }
      if (Wy.cave) {
        const cv = Wy.cave;
        const was = { state: cv.state, t: cv.t };
        const r = REC.variant(T0, W, H, film(consts.cave, 10), (v) => { cv.state = v >= 1 ? 'open' : 'falling'; cv.t = v * consts.cave; }, () => { cv.state = was.state; cv.t = was.t; });
        if (r.err) note.cave = r.err;
        else out.cave = { kind: 'cave', secs: consts.cave, frames: r.frames };
      }
      if (Wy.shaft) {
        const sh = Wy.shaft;
        const was = { state: sh.state, t: sh.t };
        const r = REC.variant(T0, W, H, film(consts.shaft, 10), (v) => { sh.state = v >= 1 ? 'down' : 'coming'; sh.t = v * consts.shaft; }, () => { sh.state = was.state; sh.t = was.t; });
        if (r.err) note.shaft = r.err;
        else out.shaft = { kind: 'shaft', secs: consts.shaft, frames: r.frames };
      }
      if (Wy.way) {
        const wp = Wy.way;
        const was = wp.awake;
        const r = REC.variant(T0, W, H, [1], () => { wp.awake = true; }, () => { wp.awake = was; });
        if (r.err) note.way = r.err;
        else out.way = { kind: 'way', frames: [{ hg: [], hs: [], g: [], s: [] }, r.frames[0]] };
      }
    }
    REC.variants = out;
    const sum = {};
    for (const k in out) {
      const kind = out[k].kind;
      const changed = out[k].frames.filter((f) => f.hg.length || f.hs.length || f.g.length || f.s.length).length;
      if (!sum[kind]) sum[kind] = { n: 0, frames: 0, changed: 0 };
      sum[kind].n++;
      sum[kind].frames += out[k].frames.length;
      sum[kind].changed += changed;
    }
    return { sum, note, extra: REC.extra.size };
  };
})();


// ====================================================================================================================
// WHAT IS SEEN WHEN: the game draws a thing only once a tile of the floor has been seen (Level.explored). Which tile each
// thing waits on is read off the renderer itself: the place is drawn with the tiles "seen" whose number has bit b set, for
// each bit, and again with those whose number has it clear; a thing that waits on one tile is there in exactly one of
// each pair, and the bits spell the tile's number. (-1: drawn whatever is seen; -2: it waits on more than one tile.)
(() => {
  const d = window.__dbg;
  const REC = window.__rec;
  REC.fog = (T0, W, H) => {
    const g = d.game();
    const L = g.level;
    const f = L.floor;
    const A = REC.acc;
    const res = REC.result;
    const n = f.w * f.h;
    let bits = 1;
    while ((1 << bits) < n) bits++;
    const NG = res.ground.length;
    const NS = res.stands.length;
    const codeG = new Int32Array(NG);
    const invG = new Int32Array(NG);
    const codeS = new Int32Array(NS);
    const invS = new Int32Array(NS);
    const glowKey = (q) => `${Math.round(q.x + q.w / 2)},${Math.round(q.y + q.h / 2)}`;
    const glowIds = new Map();
    res.glows.forEach((q, i) => glowIds.set(`${Math.round(q.x)},${Math.round(q.y)}`, i));
    const codeL = new Int32Array(res.glows.length);
    const invL = new Int32Array(res.glows.length);
    const holeIds = new Map();
    res.holes.forEach((q, i) => holeIds.set(`${Math.round(q.x / 2)},${Math.round(q.y / 2)}`, i));
    const codeH = new Int32Array(res.holes.length);
    const invH = new Int32Array(res.holes.length);
    const keepE = L.explored.slice();
    const keepV = L.visible ? L.visible.slice() : null;
    let err = null;
    for (let pass = 0; pass < 2 && !err; pass++) {
      for (let b = 0; b < bits && !err; b++) {
        for (let i = 0; i < n; i++) L.explored[i] = (((i >> b) & 1) === 1) === (pass === 0) ? 1 : 0;
        if (L.visible) L.visible.set(L.explored);
        g.time = REC.time0;
        const fr = REC.take(T0, W, H);
        if (fr.err) { err = fr.err; break; }
        const df = REC.differ(fr);
        const goneG = new Set(df.hg);
        const goneS = new Set(df.hs);
        const cg = pass === 0 ? codeG : invG;
        const cs = pass === 0 ? codeS : invS;
        for (let i = 0; i < NG; i++) if (!goneG.has(i)) cg[i] |= 1 << b;
        for (let i = 0; i < NS; i++) if (!goneS.has(i)) cs[i] |= 1 << b;
        const cl = pass === 0 ? codeL : invL;
        for (const q of fr.glows) {
          const i = glowIds.get(glowKey(q));
          if (i !== undefined) cl[i] |= 1 << b;
        }
        const ch = pass === 0 ? codeH : invH;
        for (const q of fr.holes) {
          const i = holeIds.get(`${Math.round(q.x / 2)},${Math.round(q.y / 2)}`);
          if (i !== undefined) ch[i] |= 1 << b;
        }
      }
    }
    L.explored.set(keepE);
    if (keepV) L.visible.set(keepV);
    if (err) return { err };
    const mask = (1 << bits) - 1;
    const tally = { always: 0, one: 0, many: 0, never: 0 };
    const tileOf = (code, inv) => {
      if (code === mask && inv === mask) { tally.always++; return -1; }
      if ((code ^ inv) === mask && code < n) { tally.one++; return code; }
      if (code === 0 && inv === 0) { tally.never++; return -1; }
      tally.many++;
      return -2;
    };
    const out = { g: Array.from(codeG, (c, i) => tileOf(c, invG[i])), s: Array.from(codeS, (c, i) => tileOf(c, invS[i])) };
    const t2 = { ...tally };
    out.glows = Array.from(codeL, (c, i) => tileOf(c, invL[i]));
    out.holes = Array.from(codeH, (c, i) => tileOf(c, invH[i]));
    // (a thing that waits on more than one tile: on the tile it stands on, by its place on the screen)
    const tileAt = (x, y) => {
      const wx = (x / 16 + y / 8) / 2;
      const wy = (y / 8 - x / 16) / 2;
      const tx = Math.max(0, Math.min(f.w - 1, Math.floor(wx)));
      const ty = Math.max(0, Math.min(f.h - 1, Math.floor(wy)));
      return ty * f.w + tx;
    };
    out.g = out.g.map((t, i) => (t === -2 ? tileAt(res.ground[i].x + 16, res.ground[i].y + 8) : t));
    out.s = out.s.map((t, i) => (t === -2 ? tileAt(res.stands[i].x, res.stands[i].y - 1) : t));
    out.glows = out.glows.map((t, i) => (t === -2 ? tileAt(res.glows[i].x, res.glows[i].y) : t));
    out.holes = out.holes.map((t, i) => (t === -2 ? tileAt(res.holes[i].x, res.holes[i].y) : t));
    REC.fogOut = out;
    return { bits, things: t2, withLights: tally };
  };
})();
