// FOR MEASURING (playtest.mjs --init tools/canvas_room.js): every canvas the page makes is counted, so that
// window.__canvasRoom() can say how many are alive and the room their pixels take. A phone's browser limits that
// room (Safari on an iPhone: a few hundred megabytes, past which a new canvas cannot be drawn on). Pictures handed
// over by the painter are ImageBitmaps, not canvases: not counted here. window.__canvasWho(n) names the n callers
// whose canvases take the most room (by the functions that made them).
(() => {
  const refs = [];
  const who = new WeakMap();
  const make = Document.prototype.createElement;
  Document.prototype.createElement = function (name, o) {
    const el = make.call(this, name, o);
    if (String(name).toLowerCase() === 'canvas') {
      refs.push(new WeakRef(el));
      const st = (new Error().stack || '').split('\n').slice(2, 9)
        .map((l) => (/at (?:new )?([\w$.<>]+)/.exec(l) || [])[1] || '?')
        .filter((n) => !/^(Object\.)?(createElement|blank|canvasOf|newCanvas|makeCanvas|Px|sprite|crop|toSprite|framed|get|value)$/.test(n));
      who.set(el, st.slice(0, 3).join(' < '));
    }
    return el;
  };
  const alive = () => {
    const out = [];
    for (let i = refs.length - 1; i >= 0; i--) {
      const c = refs[i].deref();
      if (!c) { refs[i] = refs[refs.length - 1]; refs.pop(); continue; }
      out.push(c);
    }
    return out;
  };
  window.__canvasRoom = () => {
    let px = 0, drawn = 0, big = 0;
    const all = alive();
    for (const c of all) {
      const a = c.width * c.height;
      if (a > 1) { drawn++; px += a; if (a * 4 > 4 * 1048576) big++; }
    }
    return { canvases: drawn, alive: all.length, big, mb: +((px * 4) / 1048576).toFixed(1) };
  };
  window.__canvasWho = (n = 15) => {
    const by = new Map();
    for (const c of alive()) {
      const a = c.width * c.height;
      if (a <= 1) continue;
      const k = who.get(c) || '?';
      const e = by.get(k) || { n: 0, mb: 0 };
      e.n++; e.mb += (a * 4) / 1048576;
      by.set(k, e);
    }
    return [...by.entries()].sort((x, y) => y[1].mb - x[1].mb).slice(0, n).map(([k, e]) => [k, e.n, +e.mb.toFixed(1)]);
  };
})();
