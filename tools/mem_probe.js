// FOR MEASURING WHAT THE GAME KEEPS FROM FLOOR TO FLOOR (playtest.mjs --init tools/mem_probe.js, with the scenario
// tools/scenarios/mem_floors.mjs; made 11 Nov 2026 for his “lag and freezing issues after playing a few levels”).
// Loaded before the game's own script, it counts what the page makes and still holds: canvases (by the functions that made
// them: build the page readable, minify off, for names), the pictures handed over by the painter's workers and the heroes' baked
// ones (ImageBitmaps), decoded sounds (AudioBuffers), sound nodes, timers, listeners; how canvases give their room back (by
// hand, their size taken to nothing, or left to the browser's collector: a phone's is slow to); and what each frame's own work
// takes. window.__probe.counts(), .who(n), .churn(n), .frames(), .listeners(); tools/canvas_room.js is the smaller one before it.
(() => {
  const P = (window.__probe = {});
  const MB = 1048576;
  const DEPTH = 6;
  const stackOf = () => (new Error().stack || '').split('\n').slice(3, 16)
    .map((l) => (/at (?:new )?(?:async )?([\w$.<>]+)/.exec(l) || [])[1] || '?')
    .filter((n) => !/^(Object\.)?(createElement|blank|canvasOf|newCanvas|makeCanvas|Px|sprite|crop|toSprite|framed|get|value|Promise|then|Px\.toCanvas|Px\.sprite|_Px\.toCanvas|_Px\.sprite|Array\.map|Array\.forEach|http|\?)$/.test(n))
    .slice(0, DEPTH).join(' < ');
  const pool = () => {
    const refs = [];
    return {
      add(o, meta) { refs.push([new WeakRef(o), meta]); },
      alive() {
        const out = [];
        for (let i = refs.length - 1; i >= 0; i--) {
          const o = refs[i][0].deref();
          if (!o) { refs[i] = refs[refs.length - 1]; refs.pop(); continue; }
          out.push([o, refs[i][1]]);
        }
        return out;
      },
    };
  };

  // ---- canvases
  const canv = pool();
  let canvMade = 0;
  const make = Document.prototype.createElement;
  Document.prototype.createElement = function (name, o) {
    const el = make.call(this, name, o);
    if (String(name).toLowerCase() === 'canvas') { canvMade++; const who = stackOf(); canv.add(el, who); track(el, who); }
    return el;
  };
  if (typeof OffscreenCanvas === 'function') {
    const OC = OffscreenCanvas;
    window.OffscreenCanvas = new Proxy(OC, { construct(t, a) { const c = new t(...a); canvMade++; canv.add(c, 'Offscreen < ' + stackOf()); return c; } });
  }


  // ---- how canvases give their room back: by hand (their size taken to nothing) or left to the collector
  const sizeNow = new WeakMap(); // canvas -> { b, who }
  const churn = { allocMB: 0, byHandMB: 0, leftMB: 0, leftN: 0 };
  const leftBy = new Map();
  const reg = new FinalizationRegistry((held) => {
    if (held.b > 0) { churn.leftMB += held.b / MB; churn.leftN++; const e = leftBy.get(held.who) || { n: 0, b: 0 }; e.n++; e.b += held.b; leftBy.set(held.who, e); }
  });
  const track = (el, who) => { const held = { b: 0, who }; sizeNow.set(el, held); reg.register(el, held); };
  const resized = (el) => {
    const held = sizeNow.get(el); if (!held) return;
    const b = el.width * el.height * 4;
    if (b > held.b) churn.allocMB += (b - held.b) / MB;
    else if (b < held.b && b === 0) churn.byHandMB += held.b / MB;
    held.b = b;
  };
  for (const prop of ['width', 'height']) {
    const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, prop);
    Object.defineProperty(HTMLCanvasElement.prototype, prop, { get: d.get, set(v) { d.set.call(this, v); resized(this); }, configurable: true });
  }
  P.churn = (k = 25) => ({ allocMB: +churn.allocMB.toFixed(0), byHandMB: +churn.byHandMB.toFixed(0), leftToCollectorMB: +churn.leftMB.toFixed(0), leftN: churn.leftN,
    leftBy: [...leftBy.entries()].sort((a, b) => b[1].b - a[1].b).slice(0, k).map(([w, e]) => `${(e.b / MB).toFixed(1)}MB x${e.n} ${w}`) });

  // ---- bitmaps (made here, or handed over by a worker)
  const bmp = pool();
  let bmpMade = 0;
  const closed = new WeakSet();
  const seenBmp = new WeakSet();
  const noteBmp = (b, who) => { if (b && !seenBmp.has(b)) { seenBmp.add(b); bmpMade++; bmp.add(b, who); } };
  if (typeof createImageBitmap === 'function') {
    const cib = window.createImageBitmap;
    window.createImageBitmap = function (...a) {
      const who = stackOf();
      return cib.apply(this, a).then((b) => { noteBmp(b, who); return b; });
    };
    const cl = ImageBitmap.prototype.close;
    ImageBitmap.prototype.close = function () { closed.add(this); return cl.call(this); };
  }
  const scan = (v, d, who) => {
    if (!v || typeof v !== 'object' || d > 5) return;
    if (typeof ImageBitmap === 'function' && v instanceof ImageBitmap) { noteBmp(v, who); return; }
    if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer) return;
    if (Array.isArray(v)) { for (const x of v) scan(x, d + 1, who); return; }
    for (const k in v) scan(v[k], d + 1, who);
  };
  if (typeof Worker === 'function') {
    const W = Worker;
    let workers = 0; let ended = 0;
    window.Worker = new Proxy(W, {
      construct(t, a) {
        const w = new t(...a);
        workers++;
        w.addEventListener('message', (e) => { const d = e.data; scan(d, 0, 'worker:' + (d && typeof d === 'object' ? (d.t ?? d.type ?? d.kind ?? Object.keys(d).slice(0, 4).join(',')) : typeof d)); });
        const term = w.terminate.bind(w);
        w.terminate = () => { ended++; return term(); };
        return w;
      },
    });
    P.workers = () => ({ made: workers, ended });
  }

  // ---- images
  const imgs = pool();
  let imgMade = 0;
  const I = window.Image;
  window.Image = new Proxy(I, { construct(t, a) { const i = new t(...a); imgMade++; imgs.add(i, stackOf()); return i; } });

  // ---- sound
  const bufs = pool();
  let bufMade = 0;
  const nodes = pool();
  const nodeMade = {};
  let started = 0; let ended = 0; let connects = 0; let disconnects = 0;
  const ctxs = [];
  const hookCtx = (C) => {
    if (!C) return;
    const proto = C.prototype;
    const base = Object.getPrototypeOf(proto); // BaseAudioContext.prototype
    if (base.__probed) return;
    base.__probed = true;
    const dec = base.decodeAudioData;
    base.decodeAudioData = function (ab, ok, no) {
      const who = stackOf();
      const note = (b) => { if (b) { bufMade++; bufs.add(b, who); } };
      const p = dec.call(this, ab, (b) => { note(b); if (ok) ok(b); }, no);
      return p;
    };
    const cb = base.createBuffer;
    base.createBuffer = function (...a) { const b = cb.apply(this, a); bufMade++; bufs.add(b, 'createBuffer < ' + stackOf()); return b; };
    for (const k of Object.getOwnPropertyNames(base)) {
      if (!/^create[A-Z]/.test(k) || k === 'createBuffer' || k === 'createPeriodicWave') continue;
      const f = base[k];
      if (typeof f !== 'function') continue;
      base[k] = function (...a) {
        const n = f.apply(this, a);
        nodeMade[k] = (nodeMade[k] || 0) + 1;
        if (n && typeof n === 'object') nodes.add(n, k);
        return n;
      };
    }
  };
  hookCtx(window.AudioContext);
  hookCtx(window.webkitAudioContext);
  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const C = window[name];
    if (!C) continue;
    window[name] = new Proxy(C, { construct(t, a) { const c = new t(...a); ctxs.push(c); return c; } });
  }
  if (typeof AudioNode === 'function') {
    const con = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (...a) { connects++; return con.apply(this, a); };
    const dis = AudioNode.prototype.disconnect;
    AudioNode.prototype.disconnect = function (...a) { disconnects++; return dis.apply(this, a); };
  }
  if (typeof AudioScheduledSourceNode === 'function') {
    const st = AudioScheduledSourceNode.prototype.start;
    AudioScheduledSourceNode.prototype.start = function (...a) {
      started++;
      this.addEventListener('ended', () => { ended++; }, { once: true });
      return st.apply(this, a);
    };
  }

  // ---- timers and listeners
  let intervals = 0; let timeouts = 0;
  const live = new Set();
  const si = window.setInterval; const ci = window.clearInterval;
  window.setInterval = function (...a) { const id = si.apply(this, a); intervals++; live.add(id); return id; };
  window.clearInterval = function (id) { live.delete(id); return ci.call(this, id); };
  const pend = new Set();
  const so = window.setTimeout; const co = window.clearTimeout;
  window.setTimeout = function (f, ms, ...r) {
    timeouts++;
    const id = so.call(this, (...x) => { pend.delete(id); return typeof f === 'function' ? f(...x) : undefined; }, ms, ...r);
    pend.add(id);
    return id;
  };
  window.clearTimeout = function (id) { pend.delete(id); return co.call(this, id); };
  const lis = {};
  const ael = EventTarget.prototype.addEventListener; const rel = EventTarget.prototype.removeEventListener;
  const nameOf = (t) => (t === window ? 'window' : t === document ? 'document' : t && t.constructor ? t.constructor.name : '?');
  EventTarget.prototype.addEventListener = function (type, f, o) {
    if (!(o && typeof o === 'object' && o.once)) { const k = nameOf(this) + ':' + type; lis[k] = (lis[k] || 0) + 1; }
    return ael.call(this, type, f, o);
  };
  EventTarget.prototype.removeEventListener = function (type, f, o) {
    const k = nameOf(this) + ':' + type; lis[k] = (lis[k] || 0) - 1;
    return rel.call(this, type, f, o);
  };

  // ---- each frame's own work
  let frames = []; let gaps = []; let lastAt = 0;
  const raf = window.requestAnimationFrame;
  let rafPending = 0; let rafMax = 0;
  window.requestAnimationFrame = function (f) {
    rafPending++; rafMax = Math.max(rafMax, rafPending);
    return raf.call(this, (t) => {
      rafPending--;
      const t0 = performance.now();
      if (lastAt) gaps.push(t0 - lastAt);
      lastAt = t0;
      try { return f(t); } finally { frames.push(performance.now() - t0); }
    });
  };
  const q = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  P.framesReset = () => { frames = []; gaps = []; lastAt = 0; rafMax = 0; };
  P.frames = () => ({
    n: frames.length,
    workMean: +(frames.reduce((s, x) => s + x, 0) / Math.max(1, frames.length)).toFixed(2),
    workP50: +q(frames, 0.5).toFixed(2), workP95: +q(frames, 0.95).toFixed(2), workMax: +q(frames, 1).toFixed(1),
    gapP50: +q(gaps, 0.5).toFixed(1), gapP95: +q(gaps, 0.95).toFixed(1), gapMax: +q(gaps, 1).toFixed(0),
    over50: frames.filter((x) => x > 50).length, over200: frames.filter((x) => x > 200).length,
    rafMax,
  });

  const sum = (list, sizeOf) => {
    let mb = 0; let n = 0;
    for (const [o] of list) { const s = sizeOf(o); if (s > 0) { mb += s; n++; } }
    return { n, mb: +(mb / MB).toFixed(1) };
  };
  const top = (list, sizeOf, k = 12) => {
    const by = new Map();
    for (const [o, who] of list) {
      const s = sizeOf(o); if (!(s > 0)) continue;
      const e = by.get(who) || { n: 0, b: 0 }; e.n++; e.b += s; by.set(who, e);
    }
    return [...by.entries()].sort((a, b) => b[1].b - a[1].b).slice(0, k).map(([w, e]) => `${(e.b / MB).toFixed(1)}MB x${e.n} ${w}`);
  };
  const cSize = (c) => (c.width * c.height > 1 ? c.width * c.height * 4 : 0);
  const bSize = (b) => (closed.has(b) ? 0 : b.width * b.height * 4);
  const iSize = (i) => (i.complete && i.naturalWidth ? i.naturalWidth * i.naturalHeight * 4 : 0);
  const aSize = (b) => b.length * b.numberOfChannels * 4;
  P.counts = () => ({
    canvas: { made: canvMade, ...sum(canv.alive(), cSize) },
    bitmap: { made: bmpMade, ...sum(bmp.alive(), bSize) },
    image: { made: imgMade, ...sum(imgs.alive(), iSize) },
    audioBuf: { made: bufMade, ...sum(bufs.alive(), aSize) },
    audioNodes: { alive: nodes.alive().length, made: Object.values(nodeMade).reduce((s, x) => s + x, 0), started, ended, playing: started - ended, connects, disconnects },
    ctx: ctxs.map((c) => c.state),
    timers: { intervals: live.size, intervalsMade: intervals, timeoutsPending: pend.size, timeoutsMade: timeouts },
  });
  P.listeners = () => Object.fromEntries(Object.entries(lis).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1]).slice(0, 25));
  P.who = (k = 12) => ({ canvas: top(canv.alive(), cSize, k), bitmap: top(bmp.alive(), bSize, k), audioBuf: top(bufs.alive(), aSize, 8), nodeMade });

  // ---- a census of everything the game holds: every list, map and set reachable from the game's own objects, by path
  P.census = (roots, maxDepth = 7, cap = 400000) => {
    const seen = new WeakSet();
    const out = {};
    let visited = 0;
    const skip = (v) => !v || typeof v !== 'object' || ArrayBuffer.isView(v) || v instanceof ArrayBuffer ||
      (typeof Node === 'function' && v instanceof Node) || (typeof ImageBitmap === 'function' && v instanceof ImageBitmap) ||
      (typeof AudioNode === 'function' && v instanceof AudioNode) || (typeof AudioBuffer === 'function' && v instanceof AudioBuffer) ||
      (typeof BaseAudioContext === 'function' && v instanceof BaseAudioContext) || v instanceof Promise || v === window || v === document ||
      (typeof CanvasRenderingContext2D === 'function' && v instanceof CanvasRenderingContext2D) || (typeof OffscreenCanvas === 'function' && v instanceof OffscreenCanvas);
    const queue = [];
    for (const [name, r] of Object.entries(roots)) if (r && typeof r === 'object') { seen.add(r); queue.push([r, name, 0]); }
    while (queue.length && visited < cap) {
      const [v, path, d] = queue.shift();
      visited++;
      let kids = null;
      if (Array.isArray(v)) { out[path] = (out[path] || 0) + v.length; if (d < maxDepth) kids = v.slice(0, 40).map((x) => [x, path + '[]']); }
      else if (v instanceof Map) { out[path] = (out[path] || 0) + v.size; if (d < maxDepth) { kids = []; let i = 0; for (const [k, x] of v) { if (i++ >= 40) break; kids.push([x, path + '{}']); if (k && typeof k === 'object') kids.push([k, path + '{key}']); } } }
      else if (v instanceof Set) { out[path] = (out[path] || 0) + v.size; if (d < maxDepth) { kids = []; let i = 0; for (const x of v) { if (i++ >= 40) break; kids.push([x, path + '()']); } } }
      else {
        let keys; try { keys = Object.keys(v); } catch { continue; }
        if (keys.length > 24) out[path + '#keys'] = (out[path + '#keys'] || 0) + keys.length;
        if (d < maxDepth) { kids = []; for (const k of keys.slice(0, 400)) { let x; try { x = v[k]; } catch { continue; } kids.push([x, keys.length > 60 ? path + '.*' : path + '.' + k]); } }
      }
      if (kids) for (const [x, p] of kids) { if (skip(x) || seen.has(x)) continue; seen.add(x); queue.push([x, p, d + 1]); }
    }
    // (lists under the same path, as the members of a list are, are added up)
    return { visited, capped: visited >= cap, sizes: out };
  };
})();
