/*
 * THE PHONE CHECK'S RECORDER (the Eight-sides merge chat, 11 Nov 2026; the queue's measure-lag-on-his-phone; his words of that
 * evening on the eight-sides test page: the title screen, the hero screen, picking a hero and the loading screen lag, and
 * coming into town took 60 seconds; asked whether to make a page that times itself on his phone: "Yes, make it (Recommended)").
 *
 * Put in the page BEFORE the game's own script (tools/phone_check_page.mjs). It changes nothing of the game. It stands between
 * the game and the browser at a few doors and counts what goes through, screen by screen:
 *   - every frame: how long since the one before (what he sees), and how long the game's own frame took of that;
 *   - every picture made (createImageBitmap: the heroes' baked frames are made this way, one each: render/baked.ts), how
 *     long each waited, and how many were cut from a sheet;
 *   - what the side painter's workers hand over (messages, pictures in them, the time in the game's handlers);
 *   - sounds decoded, canvases made, pixels read back and put, images drawn;
 *   - a clock that should ring every tenth of a second, and how late it rang;
 *   - the files fetched (the browser's own record).
 * Then, once he has stood in town a few seconds, A TRIAL OF THE TWO WAYS side by side, with the browser's own doors: a picture
 * made for every frame (the game's way), and frames drawn straight out of the sheet. And the same number of pictures handed
 * over by a worker.
 * It writes all of it to this page's own database (runs/<id>), which the chat reads; where it cannot, it says so on the screen.
 * Read here: window.__rec.
 *
 * THE SECOND PHONE CHECK (12 Nov 2026, `v` 2): the same, on a page of the game with the baked frames kept in their sheets
 * (engine/px.ts sheetSprite, the branch fix/frames-from-sheets: his phone's first run, 74 s into town, 68.5 s of it the
 * browser making a picture for every frame). Where the page has that (`fix`), the trial also asks, of the hero's own frames:
 * EVERY PIXEL of a frame as it is given now against the picture made the old way, some 120 of them (`real.tried`,
 * `real.unlike`), what the old way costs a frame on the real sheets (`real.oldMs`), and what frames not yet cut cost to be
 * asked for and drawn (`real.cutN`, `real.cutMs`); and it writes how many frames have been cut from their sheets (`cuts`).
 *
 * THE THIRD PHONE CHECK (12 Nov 2026, `v` 3): on a page of the game as it would go live (the branch fix/hero-cards-from-bake:
 * 25.3.7 with the frames kept in their sheets and the hero cards from the bake; his phone's second run: the cards at 3 to 5
 * frames a second, their heroes painted where the game is drawn). Each screen also has `painted`, `paintMs` and `stoodIn`:
 * the frames of art the game painted on its own thread while that screen was up (the game's own count), how long that took,
 * and the frames shown as the nearest painted of their list. On the cards all three should be 0.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined' || window.__rec) return;
  var W = window;
  var D = document;
  var P = W.performance;
  var now = function () { return P.now(); };
  var T0 = now();
  var EDGES = [20, 34, 50, 100, 200, 500, 1000];
  var MAX_SEGS = 48;
  var MAX_LONG = 160;
  var MAX_TICKS = 170;
  var r1 = function (x) { return Math.round(x * 10) / 10; };

  var R = {
    v: 3,
    fix: false,
    cuts: null,
    page: 'phone-check',
    id: 'r' + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36),
    startedAt: new Date().toISOString(),
    updatedAt: '',
    state: 'recording',
    seconds: 0,
    hero: '',
    device: null,
    segs: [],
    long: [],
    ticks: [],
    baked: null,
    sounds: null,
    files: null,
    trial: null,
    errors: [],
    sent: 0,
    sendFails: 0,
  };
  W.__rec = R;

  function device() {
    var n = W.navigator || {};
    var s = W.screen || {};
    var framed = false;
    try { framed = W.top !== W; } catch (e) { framed = true; }
    return {
      ua: String(n.userAgent || ''), platform: String(n.platform || ''), dpr: W.devicePixelRatio || 1,
      screen: [s.width | 0, s.height | 0], inner: [W.innerWidth | 0, W.innerHeight | 0],
      cores: n.hardwareConcurrency || 0, mem: n.deviceMemory || 0, touch: n.maxTouchPoints || 0, framed: framed,
      offscreen: typeof W.OffscreenCanvas === 'function', bitmaps: typeof W.createImageBitmap === 'function',
    };
  }
  R.device = device();

  function err(what, e) {
    if (R.errors.length < 12) R.errors.push((what + ': ' + String((e && e.message) || e)).slice(0, 220));
  }
  W.addEventListener('error', function (e) { err('error', e && (e.message || (e.error && e.error.message))); });
  W.addEventListener('unhandledrejection', function (e) { err('rejection', e && e.reason); });

  // ---------------------------------------------------------------- the screens, one after another
  function seg(label) {
    return {
      label: label, at: r1((now() - T0) / 1000), secs: 0, frames: 0, gapSum: 0, gapMax: 0, gaps: [0, 0, 0, 0, 0, 0, 0, 0], workSum: 0, workMax: 0,
      made: 0, cut: 0, madeDone: 0, madeWait: 0, madeWaitMax: 0, madeCall: 0, madeFail: 0,
      msgs: 0, fromWorkers: 0, msgMs: 0, msgMax: 0,
      dec: 0, decMs: 0, decKB: 0, canv: 0, draws: 0, reads: 0, readMs: 0, puts: 0, putMs: 0, late: 0, taps: 0, gameT: 0,
      // (v 3: frames of art painted where the game is drawn while this screen was up (the game's own count, art/kit.ts
      // PAINTING), the time that took, and frames shown as the nearest painted of their list (HEAVY.deferred))
      painted: 0, paintMs: 0, stoodIn: 0,
    };
  }
  var paintedAll = -1;
  var paintMsAll = 0;
  var stoodAll = 0;
  var paintMsCur = 0;
  /** What the game has painted since it was last asked, put to the screen that is up. */
  function painting() {
    var d = W.__dbg;
    if (!d || !d.painting) return;
    var f = 0;
    var m = 0;
    var st = 0;
    try { f = d.painting.frames | 0; m = +d.painting.ms || 0; st = typeof d.stoodIn === 'function' ? d.stoodIn() | 0 : 0; } catch (e) { return; }
    if (paintedAll >= 0) {
      cur.painted += f - paintedAll;
      paintMsCur += m - paintMsAll;
      cur.paintMs = Math.round(paintMsCur);
      cur.stoodIn += st - stoodAll;
    } else {
      // (what was painted before the first frame is the boot's)
      cur.painted += f;
      paintMsCur += m;
      cur.paintMs = Math.round(paintMsCur);
      cur.stoodIn += st;
    }
    paintedAll = f;
    paintMsAll = m;
    stoodAll = st;
  }
  var cur = seg('boot');
  var curAt = T0;
  R.segs.push(cur);
  var forced = '';
  var taps = 0;
  function open(label) {
    var a = now();
    cur.secs = r1((a - curAt) / 1000);
    if (R.segs.length >= MAX_SEGS) { cur = R.segs[R.segs.length - 1]; cur.label = 'and after'; return; }
    cur = seg(label);
    curAt = a;
    paintMsCur = 0;
    R.segs.push(cur);
    changed = true;
  }
  /** Which screen is up (the game's own test hooks, read only). */
  function where() {
    var d = W.__dbg;
    if (!d) return 'boot';
    var g = null;
    try { g = d.game(); } catch (e) { g = null; }
    if (!g) {
      var en = null;
      try { en = d.entering(); } catch (e2) { en = null; }
      return en ? 'title: a hero picked' : 'title, ' + Math.min(taps, 9) + ' taps';
    }
    try { if (g.hero && g.hero.cls) R.hero = String(g.hero.cls); } catch (e3) { /* none */ }
    var L = null;
    try { L = d.loadingNow(); } catch (e4) { L = null; }
    var place = 'play';
    try { place = g.level && g.level.town ? 'town' : 'floor ' + g.depth; } catch (e5) { /* none */ }
    if (L) { cur.gameT = r1(L.t); return 'loading: ' + place; }
    return place;
  }
  W.addEventListener('touchstart', function () { taps++; cur.taps++; }, { capture: true, passive: true });
  W.addEventListener('mousedown', function () { taps++; cur.taps++; }, { capture: true, passive: true });

  // ---------------------------------------------------------------- frames
  var rafOrig = W.requestAnimationFrame.bind(W);
  var lastFrame = 0;
  var changed = false;
  W.requestAnimationFrame = function (cb) {
    return rafOrig(function (ts) {
      var a = now();
      if (lastFrame) {
        var gap = a - lastFrame;
        cur.frames++;
        cur.gapSum += gap;
        if (gap > cur.gapMax) cur.gapMax = gap;
        var b = 0;
        while (b < EDGES.length && gap >= EDGES[b]) b++;
        cur.gaps[b]++;
        if (gap >= 150 && R.long.length < MAX_LONG) R.long.push([r1((a - T0) / 1000), Math.round(gap), R.segs.length - 1]);
        tickFrames++;
        if (gap > tickWorst) tickWorst = gap;
      }
      lastFrame = a;
      try {
        return cb(ts);
      } finally {
        var w = now() - a;
        cur.workSum += w;
        if (w > cur.workMax) cur.workMax = w;
        after(a);
      }
    });
  };
  D.addEventListener('visibilitychange', function () {
    lastFrame = 0;
    lastRing = 0;
    if (D.hidden) send();
  });

  // ---------------------------------------------------------------- pictures made
  var cibOrig = typeof W.createImageBitmap === 'function' ? W.createImageBitmap.bind(W) : null;
  var madeAll = 0;
  var madeDoneAll = 0;
  if (cibOrig) {
    W.createImageBitmap = function () {
      var s = cur;
      var a = now();
      s.made++;
      madeAll++;
      if (arguments.length >= 5) s.cut++;
      var p = cibOrig.apply(W, arguments);
      s.madeCall += now() - a;
      p.then(function () {
        var d = now() - a;
        s.madeDone++;
        madeDoneAll++;
        s.madeWait += d;
        if (d > s.madeWaitMax) s.madeWaitMax = d;
      }, function () { s.madeFail++; });
      return p;
    };
  }

  // ---------------------------------------------------------------- what the workers hand over
  var WorkerOrig = W.Worker;
  var fromWorkersAll = 0;
  function bitmapsIn(x, depth) {
    if (!x || typeof x !== 'object') return 0;
    if (typeof W.ImageBitmap === 'function' && x instanceof W.ImageBitmap) return 1;
    if (depth >= 5) return 0;
    var n = 0;
    if (Array.isArray(x)) {
      // (a list of numbers or words holds no picture: not walked)
      if (x.length && (x[0] === null || typeof x[0] !== 'object')) return 0;
      for (var i = 0; i < x.length; i++) n += bitmapsIn(x[i], depth + 1);
      return n;
    }
    if (x instanceof ArrayBuffer || ArrayBuffer.isView(x)) return 0;
    for (var k in x) n += bitmapsIn(x[k], depth + 1);
    return n;
  }
  if (typeof WorkerOrig === 'function') {
    var Wrapped = function (url, opts) {
      var w = opts === undefined ? new WorkerOrig(url) : new WorkerOrig(url, opts);
      try {
        // (the game sets worker.onmessage: it is kept here and called from a listener of ours, so its time can be told)
        var handler = null;
        Object.defineProperty(w, 'onmessage', { configurable: true, enumerable: true, get: function () { return handler; }, set: function (f) { handler = f; } });
        w.addEventListener('message', function (e) {
          var s = cur;
          s.msgs++;
          var n = 0;
          try { n = bitmapsIn(e.data, 0); } catch (e1) { n = 0; }
          s.fromWorkers += n;
          fromWorkersAll += n;
          if (typeof handler !== 'function') return;
          var a = now();
          try { handler.call(w, e); } finally {
            var d = now() - a;
            s.msgMs += d;
            if (d > s.msgMax) s.msgMax = d;
          }
        });
      } catch (e2) { err('worker door', e2); }
      return w;
    };
    Wrapped.prototype = WorkerOrig.prototype;
    W.Worker = Wrapped;
  }

  // ---------------------------------------------------------------- sounds decoded
  var AC = W.AudioContext || W.webkitAudioContext;
  if (AC && AC.prototype && typeof AC.prototype.decodeAudioData === 'function') {
    var decOrig = AC.prototype.decodeAudioData;
    AC.prototype.decodeAudioData = function (buf, ok, no) {
      var s = cur;
      var a = now();
      var over = false;
      s.dec++;
      try { s.decKB += (buf && buf.byteLength ? buf.byteLength : 0) / 1024; } catch (e) { /* none */ }
      var done = function () { if (over) return; over = true; s.decMs += now() - a; };
      var r = decOrig.call(this, buf, function (x) { done(); if (typeof ok === 'function') ok(x); }, function (e) { done(); if (typeof no === 'function') no(e); });
      if (r && typeof r.then === 'function') r.then(done, done);
      return r;
    };
  }

  // ---------------------------------------------------------------- canvases, and what is drawn, read and put
  var ceOrig = D.createElement;
  D.createElement = function (name) {
    if (name === 'canvas') cur.canv++;
    return ceOrig.apply(D, arguments);
  };
  var C2 = W.CanvasRenderingContext2D && W.CanvasRenderingContext2D.prototype;
  if (C2) {
    var di = C2.drawImage;
    C2.drawImage = function () { cur.draws++; return di.apply(this, arguments); };
    var gi = C2.getImageData;
    C2.getImageData = function () {
      var a = now();
      try { return gi.apply(this, arguments); } finally { cur.reads++; cur.readMs += now() - a; }
    };
    var pi = C2.putImageData;
    C2.putImageData = function () {
      var a = now();
      try { return pi.apply(this, arguments); } finally { cur.puts++; cur.putMs += now() - a; }
    };
  }

  // ---------------------------------------------------------------- a clock that should ring every tenth of a second
  var lastRing = 0;
  setInterval(function () {
    var a = now();
    if (lastRing && !D.hidden) {
      var late = a - lastRing - 100;
      if (late > cur.late) cur.late = late;
    }
    lastRing = a;
  }, 100);

  // ---------------------------------------------------------------- after every frame
  var tickAt = T0;
  var tickFrames = 0;
  var tickWorst = 0;
  var townSince = 0;
  var trialStarted = false;
  var lastSend = 0;
  function after(a) {
    painting();
    var label = forced || where();
    if (label !== cur.label) open(label);
    if (a - tickAt >= 2000) {
      if (R.ticks.length < MAX_TICKS) R.ticks.push([Math.round((a - T0) / 1000), R.segs.length - 1, tickFrames, Math.round(tickWorst), madeDoneAll, fromWorkersAll]);
      tickAt = a;
      tickFrames = 0;
      tickWorst = 0;
      paint();
    }
    if (!trialStarted && !forced) {
      if (label === 'town') {
        if (!townSince) townSince = a;
        else if (a - townSince > 8000) startTrial();
      } else townSince = 0;
      if (!trialStarted && a - T0 > 180000 && label.indexOf('loading') !== 0) startTrial();
    }
    // (sent as a screen changes, a few seconds apart at the least; else four times a minute; less once it is done; never after ten minutes)
    var since = a - lastSend;
    var age = a - T0;
    if (db && !sending && age < 600000) {
      var every = R.state === 'done' ? 30000 : 15000;
      if ((changed && since > 3000) || since > every) send();
    }
  }

  // ---------------------------------------------------------------- the trial of the two ways
  function frames(n) {
    return new Promise(function (done) {
      var left = n;
      var step = function () { if (--left <= 0) done(); else rafOrig(step); };
      rafOrig(step);
    });
  }
  function median(list) {
    var s = list.slice().sort(function (x, y) { return x - y; });
    return s.length ? s[Math.floor(s.length / 2)] : 0;
  }
  /** Draws six times, each time made to finish (a pixel read back), a frame between: the middle time and the worst. */
  async function drawRounds(draw, g) {
    var times = [];
    for (var r = 0; r < 6; r++) {
      var a = now();
      draw();
      g.getImageData(0, 0, 1, 1);
      times.push(now() - a);
      await frames(1);
    }
    return [r1(median(times)), r1(Math.max.apply(null, times))];
  }
  function workerTrial(n, w, h) {
    return new Promise(function (resolve) {
      if (typeof W.OffscreenCanvas !== 'function' || typeof WorkerOrig !== 'function') { resolve({ skipped: 'no OffscreenCanvas or no Worker' }); return; }
      var src = 'self.onmessage=function(e){var n=e.data.n,w=e.data.w,h=e.data.h,t0=performance.now(),list=[];try{for(var i=0;i<n;i++){var c=new OffscreenCanvas(w,h);var g=c.getContext("2d");g.fillStyle="hsl("+(i*29%360)+",70%,50%)";g.fillRect(0,0,w,h);g.fillStyle="#fff";g.fillRect(i%w,0,3,h);list.push(c.transferToImageBitmap());if(list.length===24||i===n-1){self.postMessage({list:list,made:performance.now()-t0,last:i===n-1},list);list=[];}}}catch(x){self.postMessage({fail:String(x&&x.message||x)});}};';
      var url = '';
      var w0 = null;
      try {
        url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        w0 = new WorkerOrig(url);
      } catch (e) { resolve({ skipped: 'no worker: ' + String((e && e.message) || e) }); return; }
      var a = now();
      var got = 0;
      var keep = [];
      var first = 0;
      var over = false;
      var finish = function (extra) {
        if (over) return;
        over = true;
        clearTimeout(timer);
        try { w0.terminate(); } catch (e) { /* none */ }
        try { URL.revokeObjectURL(url); } catch (e) { /* none */ }
        var o = { n: n, got: got, ms: r1(now() - a), firstMs: r1(first) };
        for (var k in extra) o[k] = extra[k];
        for (var i = 0; i < keep.length; i++) { try { keep[i].close(); } catch (e) { /* none */ } }
        resolve(o);
      };
      var timer = setTimeout(function () { finish({ timedOut: true }); }, 30000);
      w0.onmessage = function (e) {
        var d = e.data || {};
        if (d.fail) { finish({ fail: String(d.fail).slice(0, 160) }); return; }
        if (!first) first = now() - a;
        var list = d.list || [];
        got += list.length;
        for (var i = 0; i < list.length; i++) keep.push(list[i]);
        if (d.last) finish({ madeMs: r1(d.made) });
      };
      w0.onerror = function (e) { finish({ fail: 'worker error: ' + String((e && e.message) || '') }); };
      w0.postMessage({ n: n, w: w, h: h });
    });
  }
  async function runTrial() {
    var t = { n: 480, frame: [64, 72] };
    var S = 1024;
    var FW = 64;
    var FH = 72;
    var cv = ceOrig.call(D, 'canvas');
    cv.width = S;
    cv.height = S;
    var g = cv.getContext('2d');
    for (var i = 0; i < 500; i++) {
      g.fillStyle = 'hsl(' + ((i * 37) % 360) + ',70%,' + (30 + (i % 40)) + '%)';
      g.fillRect((i * 53) % S, (i * 97) % S, 40 + (i % 50), 30 + (i % 60));
    }
    var rects = [];
    for (var k = 0; k < t.n; k++) rects.push([(k % 15) * FW, (Math.floor(k / 15) % 14) * FH]);
    forced = 'trial: making ready';
    await frames(3);
    if (!cibOrig) { t.skipped = 'no createImageBitmap'; return t; }
    var a = now();
    var sheet = await cibOrig(cv);
    t.sheetMs = r1(now() - a);

    // A. THE GAME'S WAY: a picture for every frame, cut from the sheet, 48 at once (render/baked.ts)
    forced = 'trial: a picture a frame';
    await frames(2);
    a = now();
    var bits = [];
    for (var b0 = 0; b0 < t.n; b0 += 48) {
      var got = await Promise.all(rects.slice(b0, b0 + 48).map(function (r) { return cibOrig(sheet, r[0], r[1], FW, FH); }));
      for (var q = 0; q < got.length; q++) bits.push(got[q]);
    }
    t.cutMs = r1(now() - a);

    // B. one at a time, each waited for: what one costs
    forced = 'trial: one at a time';
    await frames(2);
    a = now();
    var one = [];
    for (var j = 0; j < 60; j++) one.push(await cibOrig(sheet, rects[j][0], rects[j][1], FW, FH));
    t.oneMs = r1(now() - a);
    t.oneN = 60;

    // C. DRAWING: the cut pictures, then the same frames straight out of the sheet
    var out = ceOrig.call(D, 'canvas');
    out.width = 960;
    out.height = 540;
    var og = out.getContext('2d');
    forced = 'trial: drawing cut pictures';
    await frames(2);
    t.drawCut = await drawRounds(function () { for (var k1 = 0; k1 < bits.length; k1++) og.drawImage(bits[k1], (k1 * 13) % 890, (k1 * 7) % 460); }, og);
    forced = 'trial: drawing from the sheet';
    await frames(2);
    t.drawSheet = await drawRounds(function () { for (var k2 = 0; k2 < rects.length; k2++) og.drawImage(sheet, rects[k2][0], rects[k2][1], FW, FH, (k2 * 13) % 890, (k2 * 7) % 460, FW, FH); }, og);

    // D. the other old way: a small canvas for every frame
    forced = 'trial: a canvas a frame';
    await frames(2);
    a = now();
    var cans = [];
    for (var k3 = 0; k3 < t.n; k3++) {
      var c = ceOrig.call(D, 'canvas');
      c.width = FW;
      c.height = FH;
      c.getContext('2d').drawImage(sheet, rects[k3][0], rects[k3][1], FW, FH, 0, 0, FW, FH);
      cans.push(c);
    }
    await frames(2);
    t.canvasMs = r1(now() - a);
    t.drawCanvas = await drawRounds(function () { for (var k4 = 0; k4 < cans.length; k4++) og.drawImage(cans[k4], (k4 * 13) % 890, (k4 * 7) % 460); }, og);

    // E. the same kind of pictures handed over by a worker, as the side painter hands its own
    forced = 'trial: pictures from a worker';
    await frames(2);
    t.worker = await workerTrial(240, FW, FH);

    // F. THE HERO'S OWN FRAMES, where the page keeps them in their sheets
    if (W.__dbg && typeof W.__dbg.sheetWhere === 'function') {
      forced = 'trial: the hero\'s own frames';
      await frames(2);
      try { t.real = await realFrames(); } catch (e) { t.real = { failed: String((e && e.message) || e).slice(0, 200) }; }
    }

    forced = 'trial: tidying';
    for (var x = 0; x < bits.length; x++) { try { bits[x].close(); } catch (e) { /* none */ } }
    for (var y = 0; y < one.length; y++) { try { one[y].close(); } catch (e) { /* none */ } }
    try { sheet.close(); } catch (e) { /* none */ }
    for (var z = 0; z < cans.length; z++) { cans[z].width = 0; cans[z].height = 0; }
    cv.width = 0;
    out.width = 0;
    await frames(2);
    return t;
  }
  /** The hero's own frames, kept in their sheets: every pixel against the old way; what the old way costs; what a frame's first asking costs. */
  async function realFrames() {
    var d = W.__dbg;
    var out = { frames: 0, tried: 0, unlike: 0, first: '', oldMs: 0, cutN: 0, cutMs: 0 };
    var cls = R.hero;
    if (!cls || !d.renderer || !d.renderer.art || !d.renderer.art.heroes) { out.skipped = 'no hero'; return out; }
    var list = [];
    var seen = new Set();
    var isSprite = function (v) { return v && typeof v === 'object' && typeof v.w === 'number' && typeof v.ax === 'number'; };
    var walk = function (o, depth) {
      if (!o || typeof o !== 'object' || seen.has(o) || depth > 8) return;
      seen.add(o);
      if (Array.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
          var dsc = Object.getOwnPropertyDescriptor(o, i);
          if (!dsc || typeof dsc.get === 'function') continue;
          var v = dsc.value;
          if (isSprite(v)) { if (!seen.has(v) && d.sheetWhere(v)) { seen.add(v); list.push(v); } } else walk(v, depth + 1);
        }
        return;
      }
      if (isSprite(o)) return;
      var keys = Object.keys(o);
      for (var k = 0; k < keys.length; k++) {
        var dk = Object.getOwnPropertyDescriptor(o, keys[k]);
        if (dk && !dk.get) walk(dk.value, depth + 1);
      }
    };
    var places = cls === 'warlock' ? [{ town: true }, {}, { demon: true }, { blaze: true }] : [{ town: true }, {}];
    for (var p = 0; p < places.length; p++) walk(d.renderer.art.heroes.of(cls, Object.assign({ twoHanded: true, town: !!places[p].town }, places[p], { vet: cls === 'brawler' })), 0);
    out.frames = list.length;
    if (!list.length) return out;
    var scratch = ceOrig.call(D, 'canvas');
    scratch.width = 256;
    scratch.height = 256;
    var sg = scratch.getContext('2d', { willReadFrequently: true });
    // (a) frames not cut yet, asked for and drawn one after another
    var fresh = [];
    for (var f = 0; f < list.length && fresh.length < 400; f++) {
      var w0 = d.sheetWhere(list[f]);
      if (w0 && !w0.cut && w0.sheet.img) fresh.push(list[f]);
    }
    var a = now();
    for (var j = 0; j < fresh.length; j++) sg.drawImage(fresh[j].img, 0, 0);
    sg.getImageData(0, 0, 1, 1);
    out.cutN = fresh.length;
    out.cutMs = r1(now() - a);
    await frames(1);
    // (b) every pixel, one frame in every `step`
    var pixels = function (img, w, h) {
      scratch.width = w;
      scratch.height = h;
      sg.clearRect(0, 0, w, h);
      sg.drawImage(img, 0, 0);
      return sg.getImageData(0, 0, w, h).data;
    };
    var step = Math.max(1, Math.floor(list.length / 120));
    var old = 0;
    for (var n = 0; n < list.length; n += step) {
      var s = list[n];
      var at = d.sheetWhere(s);
      if (!at || !at.sheet.img) continue;
      var img = s.img;
      out.tried++;
      if (img.width !== at.w || img.height !== at.h) { out.unlike++; if (!out.first) out.first = 'frame ' + n + ': its size'; continue; }
      var A = new Uint8ClampedArray(pixels(img, at.w, at.h));
      var t1 = now();
      var bmp = await cibOrig(at.sheet.img, at.x, at.y, at.w, at.h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
      old += now() - t1;
      var B = pixels(bmp, at.w, at.h);
      if (typeof bmp.close === 'function') bmp.close();
      var diff = 0;
      for (var q = 0; q < A.length; q++) if (A[q] !== B[q]) diff++;
      if (diff) { out.unlike++; if (!out.first) out.first = 'frame ' + n + ': ' + diff + ' of ' + A.length; }
    }
    out.oldMs = r1(old);
    scratch.width = 0;
    scratch.height = 0;
    return out;
  }
  function startTrial() {
    if (trialStarted) return;
    trialStarted = true;
    R.state = 'trial';
    forced = 'trial: making ready';
    paint();
    runTrial().then(function (t) { R.trial = t; }, function (e) { R.trial = { failed: String((e && e.message) || e).slice(0, 200) }; }).then(function () {
      forced = '';
      R.state = 'done';
      changed = true;
      paint();
      send();
    });
  }
  /** For trying it here: the trial at once. */
  R.tryNow = startTrial;

  // ---------------------------------------------------------------- what is written
  function files() {
    var list = [];
    try { list = P.getEntriesByType('resource') || []; } catch (e) { list = []; }
    var rows = [];
    var total = 0;
    var kb = 0;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      var name = String(e.name || '');
      if (name.indexOf('blob:') === 0 || name.indexOf('data:') === 0) continue;
      var parts = name.split('?')[0].split('/');
      var size = (e.encodedBodySize || e.transferSize || 0) / 1024;
      total += e.duration || 0;
      kb += size;
      rows.push([parts.slice(-2).join('/').slice(-60), r1((e.startTime || 0) / 1000), Math.round(e.duration || 0), Math.round(size)]);
    }
    rows.sort(function (x, y) { return y[2] - x[2]; });
    return { n: rows.length, ms: Math.round(total), kb: Math.round(kb), slowest: rows.slice(0, 16) };
  }
  function snapshot() {
    var a = now();
    cur.secs = r1((a - curAt) / 1000);
    R.seconds = r1((a - T0) / 1000);
    R.updatedAt = new Date().toISOString();
    var d = W.__dbg;
    if (d) {
      try { R.baked = JSON.parse(JSON.stringify(d.baked())); } catch (e) { /* none */ }
      try { R.sounds = JSON.parse(JSON.stringify(d.sounds())); } catch (e) { /* none */ }
      try { R.fix = typeof d.sheetWhere === 'function'; if (typeof d.sheetCuts === 'function') R.cuts = JSON.parse(JSON.stringify(d.sheetCuts())); } catch (e) { /* none */ }
    }
    R.files = files();
    var body = JSON.parse(JSON.stringify(R));
    for (var i = 0; i < body.segs.length; i++) {
      var s = body.segs[i];
      for (var k in s) if (typeof s[k] === 'number') s[k] = r1(s[k]);
    }
    body.made = madeAll;
    body.madeDone = madeDoneAll;
    body.fromWorkers = fromWorkersAll;
    return body;
  }
  R.snapshot = snapshot;

  // ---------------------------------------------------------------- sent to the page's own database
  var db = null;
  var dbState = 'waiting';
  var sending = false;
  var again = false;
  function send() {
    if (!db) return;
    if (sending) { again = true; return; }
    sending = true;
    again = false;
    changed = false;
    lastSend = now();
    var p;
    try { p = db.doc('runs/' + R.id).set(snapshot()); } catch (e) { sending = false; R.sendFails++; err('send', e); paint(); return; }
    p.then(function () {
      sending = false;
      R.sent++;
      paint();
      if (again) setTimeout(send, 1500);
    }, function (e) {
      sending = false;
      R.sendFails++;
      err('send', e && (e.code || e.message));
      paint();
    });
  }
  var tries = 0;
  function connect() {
    var c = W.claude;
    if (!c || typeof c.use !== 'function') {
      if (++tries > 60) { dbState = 'none'; paint(); return; }
      setTimeout(connect, 500);
      return;
    }
    try {
      c.use('db').then(function (x) {
        db = x || null;
        dbState = x ? 'on' : 'none';
        paint();
        if (x) send();
      }, function () { dbState = 'none'; paint(); });
    } catch (e) { dbState = 'none'; paint(); }
  }
  connect();

  // ---------------------------------------------------------------- the small mark in the corner
  var mark = null;
  function paint() {
    try {
      if (!mark) {
        if (!D.body) return;
        mark = ceOrig.call(D, 'div');
        mark.setAttribute('aria-hidden', 'true');
        mark.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 3px);max-width:92vw;font:600 11px/1.35 -apple-system,BlinkMacSystemFont,sans-serif;color:#fff;background:rgba(10,12,30,.82);border:1px solid rgba(40,220,240,.7);border-radius:6px;padding:3px 7px;white-space:pre-wrap';
        D.body.appendChild(mark);
      }
      var secs = Math.floor((now() - T0) / 1000);
      var clock = Math.floor(secs / 60) + ':' + ('0' + (secs % 60)).slice(-2);
      var to = dbState === 'on' ? (R.sent ? 'sent ' + R.sent : 'sending') : dbState === 'waiting' ? 'connecting' : 'NOT SENDING';
      var text;
      if (R.state === 'trial') {
        text = 'PHONE CHECK: measuring, about 15 seconds. Please wait.';
        mark.style.fontSize = '14px';
        mark.style.borderColor = '#ffd27a';
      } else if (R.state === 'done') {
        var ok = dbState === 'on' && R.sent > 0;
        text = ok ? 'PHONE CHECK DONE. Numbers sent. You can close this page.' : 'PHONE CHECK DONE, but the numbers could not be sent.\nPlease screenshot this:\n' + brief();
        mark.style.fontSize = ok ? '14px' : '11px';
        mark.style.borderColor = ok ? '#86eaae' : '#ff9e8a';
      } else {
        text = 'REC ' + clock + ' · ' + to;
      }
      if (mark.textContent !== text) mark.textContent = text;
    } catch (e) { /* the mark is not worth an error */ }
  }
  /** The numbers in short, for a screenshot where they cannot be sent. */
  function brief() {
    var lines = [];
    for (var i = 0; i < R.segs.length && lines.length < 14; i++) {
      var s = R.segs[i];
      var secs = s === cur ? (now() - curAt) / 1000 : s.secs;
      if (secs < 0.5 && !s.frames) continue;
      lines.push(s.label + ': ' + r1(secs) + 's, ' + s.frames + ' fr, worst ' + Math.round(s.gapMax) + 'ms, made ' + s.madeDone + ', wk ' + s.fromWorkers + ', painted ' + s.painted);
    }
    var t = R.trial;
    if (t) lines.push('trial: cut ' + t.cutMs + ' one ' + t.oneMs + ' drawCut ' + (t.drawCut || []).join('/') + ' drawSheet ' + (t.drawSheet || []).join('/') + ' canvas ' + t.canvasMs + ' wk ' + (t.worker ? t.worker.ms : '-'));
    if (t && t.real) lines.push('own frames: ' + t.real.tried + ' tried, ' + t.real.unlike + ' unlike; old ' + t.real.oldMs + 'ms; cut ' + t.real.cutN + ' in ' + t.real.cutMs + 'ms');
    return lines.join('\n');
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', paint);
  paint();
  setInterval(paint, 1000);
})();
