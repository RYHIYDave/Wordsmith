// FOR MEASURING (playtest.mjs --init tools/canvas_room.js): every canvas the page makes is counted, so that
// window.__canvasRoom() can say how many are alive and the room their pixels take. A phone's browser limits that
// room (Safari on an iPhone: a quarter of what the page may take in all, a few hundred megabytes, past which a
// new canvas cannot be drawn on). Pictures handed over by the painter are ImageBitmaps, not canvases: not counted here.
(() => {
  const refs = [];
  const make = Document.prototype.createElement;
  Document.prototype.createElement = function (name, o) {
    const el = make.call(this, name, o);
    if (String(name).toLowerCase() === 'canvas') refs.push(new WeakRef(el));
    return el;
  };
  window.__canvasRoom = () => {
    let px = 0, drawn = 0, alive = 0, big = 0;
    for (let i = refs.length - 1; i >= 0; i--) {
      const c = refs[i].deref();
      if (!c) { refs[i] = refs[refs.length - 1]; refs.pop(); continue; }
      alive++;
      const a = c.width * c.height;
      if (a > 1) { drawn++; px += a; if (a * 4 > 4 * 1048576) big++; }
    }
    return { canvases: drawn, alive, big, mb: +((px * 4) / 1048576).toFixed(1) };
  };
})();
