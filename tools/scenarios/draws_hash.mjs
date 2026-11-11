// WHAT IS DRAWN, AS A NUMBER, FOR COMPARING TWO BUILDS: a new run (seed 9), and for each of PLACES (town, or a floor's number)
// the place entered and, at once (no frame of the game between), drawn at a fixed moment with fixed random numbers, the hero at
// a few spots; every drawImage and fillRect of each drawing written down (which canvas, how, where, the picture's size) and
// hashed, and the picture's own pixels hashed too: "<calls>:<the calls' number>:<the pixels' number>" for each spot. Pictures
// are painted at once, not later (dbg.paintDefer off). The speed switches of the renderer, if the build has any, are turned off
// first (OFF=0 leaves them on). Run on two builds and compare the lines: 11 Nov 2026, 25.3.1 against the same with
// render/still_*.ts and the floor's tile moved into Renderer.floorTile, switches off: the town and floors 1 to 7 the same
// call for call and pixel for pixel (the town's first drawing but for when the light's small picture is made, a few calls
// sooner; its pixels the same). Floors 8 and on differ from one run of ONE build to the next (their ground comes from a worker).
//   PLACES=town,1,2,3,4,5,6,7 node tools/playtest.mjs --file dist/<page>.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/draws_hash.mjs
import { log } from './lib.mjs';
export default async function (page) {
  const places = (process.env.PLACES || 'town,1,2,3,4,5,6,8,11,16').split(',');
  for (const place of places) {
    const r = await page.evaluate(async ([place, off]) => {
      const d = window.__dbg; d.saving(false); d.paintDefer.on = false; d.run('warrior', 9); d.god = true;
      const g = d.game();
      if (place !== 'town') { const n = Number(place); g.depth = n; g.cleared = n - 1; g.enterDungeon(); g.level.explored.fill(1); }
      const R = d.renderer;
      if (off) for (const k of Object.keys(R)) if (R[k] && typeof R[k] === 'object' && R[k].sw && typeof R[k].sw.on === 'boolean') R[k].sw.on = false;
      const main = document.querySelector('canvas'); const W = Math.round(main.width / 2); const H = Math.round(main.height / 2);
      const P = CanvasRenderingContext2D.prototype; const di = P.drawImage; const fr = P.fillRect;
      const ids = new Map(); const idOf = (c) => { if (!ids.has(c)) ids.set(c, ids.size); return ids.get(c); };
      let h = 2166136261 >>> 0; let n = 0;
      const add = (s) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } n++; };
      const rd = (v) => Math.round(v * 64) / 64;
      const real = Math.random;
      const out = [];
      const f = g.level.floor; const st = [g.hero.x, g.hero.y];
      const spots = [[0, 0]];
      for (const [dx, dy] of [[1.3, 0.2], [-0.6, 1.7], [2.4, -1.1], [-2.2, -0.4], [0.5, 3.1]]) { const x = st[0] + dx, y = st[1] + dy; if (f.tiles[Math.floor(y) * f.w + Math.floor(x)] === 1) spots.push([dx, dy]); }
      for (const [dx, dy] of spots) {
        g.hero.x = st[0] + dx; g.hero.y = st[1] + dy;
        h = 2166136261 >>> 0; n = 0; ids.clear();
        const c = document.createElement('canvas'); c.width = main.width; c.height = main.height;
        const cg = c.getContext('2d', { alpha: false }); cg.setTransform(2, 0, 0, 2, 0, 0); cg.imageSmoothingEnabled = false;
        idOf(c);
        P.drawImage = function (img, ...a) { add(`D${idOf(this.canvas)}|${this.globalCompositeOperation}|${rd(this.globalAlpha)}|${a.map(rd).join(',')}|${img.width}x${img.height}`); return di.call(this, img, ...a); };
        P.fillRect = function (...a) { add(`F${idOf(this.canvas)}|${this.globalCompositeOperation}|${rd(this.globalAlpha)}|${this.fillStyle}|${a.map(rd).join(',')}`); return fr.apply(this, a); };
        let seed = 12345; Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
        try { R.draw(cg, W, H, g, d.fx, 1000.5, 0); } finally { Math.random = real; P.drawImage = di; P.fillRect = fr; }
        // (and the pixels: a number of them too)
        const px = cg.getImageData(0, 0, c.width, c.height).data; let ph = 2166136261 >>> 0; for (let i = 0; i < px.length; i += 1) { ph ^= px[i]; ph = Math.imul(ph, 16777619) >>> 0; }
        out.push(`${n}:${h.toString(16)}:${ph.toString(16)}`);
      }
      g.hero.x = st[0]; g.hero.y = st[1];
      return out;
    }, [place, process.env.OFF !== '0']);
    log(`place ${place}`, r.join(' '));
  }
}
