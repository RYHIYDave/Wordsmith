// ACT 2, THE HUSH: FLOOR 14, THE HOUSE OF QUIET, as its own map-maker and dresser lay it (game/act2/housequiet.ts; behind ACT2,
// off; switched on here by the test hook, __dbg.act2). The hero set down in each kind of room in turn (the floor's packs taken
// away, so that the rooms are seen as they are dressed), and a map of the floor's tiles laid over the screen: each room by its
// floor (HQ_ZONE), the beds, the Bells and the Hush's circle, the packs, the spilled tonic, the start, the boss and the way on.
// SEED (the run's), WAIT (ms at each place, for the ground to be painted), ONLY (comma-separated: entrance, ward, hall,
// apothecary, chapel, bell, theatre, map).
//   node tools/build_to.mjs dist/hq.html
//   node tools/playtest.mjs --file dist/hq.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_housequiet.mjs --out shots/hq/a
export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 3);
  const wait = Number(process.env.WAIT ?? 3500);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const want = (k) => !only || only.includes(k);
  const info = await page.evaluate((seed) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', seed);
    D.seasoned(20);
    D.god = true;
    D.act2(true, 14);
    const g = D.game();
    const L = g.level;
    g.monsters = [];
    const f = L.floor;
    const land = L.land;
    const zoneAt = (r) => land.zones[(r.y + (r.h >> 1)) * f.w + r.x + (r.w >> 1)];
    const role = (r) => land.areas.find((a) => a.room === r.id)?.role;
    const beds = (r) => L.props.filter((p) => p.name === 'an iron ward bed' && p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h).length;
    const rooms = f.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, path: r.path, zone: zoneAt(r), role: role(r), beds: beds(r) }));
    return { w: f.w, h: f.h, start: f.start, boss: f.boss, exit: land.exit, bells: land.bells, rooms, props: L.props.length, hazards: L.hazards.length, packs: f.packs.length };
  }, seed);
  console.log('  floor 14:', JSON.stringify({ w: info.w, h: info.h, rooms: info.rooms.length, props: info.props, hazards: info.hazards, packs: info.packs, hush: info.bells?.hush }));
  for (const r of info.rooms) console.log('   room', JSON.stringify(r));
  const goTo = async (x, y) => {
    await page.evaluate(([x, y]) => {
      const g = window.__dbg.game();
      g.hero.x = x;
      g.hero.y = y;
      g.monsters = [];
    }, [x, y]);
    await page.waitForTimeout(wait);
  };
  const Z = { Ward: 0, Hall: 1, Apothecary: 2, Theatre: 3, Chapel: 4 };
  const mainWard = info.rooms.filter((r) => r.zone === Z.Ward && r.role === 'path').sort((a, b) => b.beds - a.beds)[0] ?? info.rooms.find((r) => r.zone === Z.Ward);
  const hall = info.rooms.filter((r) => r.zone === Z.Hall && r.role === 'path' && Math.max(r.w, r.h) >= 14).sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h))[0];
  const apo = info.rooms.find((r) => r.zone === Z.Apothecary);
  const theatre = info.rooms.find((r) => r.role === 'boss');
  if (want('entrance')) {
    await goTo(info.start.x, info.start.y);
    await snap('entrance');
  }
  if (want('ward') && mainWard) {
    await goTo(mainWard.x + mainWard.w / 2, mainWard.y + 5);
    await snap('ward');
  }
  if (want('hall') && hall) {
    await goTo(hall.x + hall.w / 2, hall.y + hall.h / 2);
    await snap('hall');
  }
  if (want('apothecary') && apo) {
    await goTo(apo.x + apo.w / 2 + 1, apo.y + apo.h / 2 + 1.5);
    await snap('apothecary');
  }
  if (want('chapel') && info.bells) {
    await goTo(info.bells.muffled.x + 0.5, info.bells.muffled.y + 3.5);
    await snap('chapel');
  }
  if (want('bell') && info.bells) {
    // (three tiles out from the wall it is on: the wall along x behind its tile, or the wall along y)
    const b = info.bells.bells[0];
    const face = await page.evaluate(([x, y]) => {
      const L = window.__dbg.game().level;
      const p = L.props.find((q) => q.name === "a patient's call bell" && q.tx === Math.floor(x) && q.ty === Math.floor(y));
      return p ? p.variant & 1 : 0;
    }, [b.x, b.y]);
    await goTo(face ? b.x + 3 : b.x + 0.5, face ? b.y + 0.5 : b.y + 3);
    await snap('bell');
  }
  if (want('theatre') && theatre) {
    const tx = theatre.x + Math.floor(theatre.w / 2);
    const ty = theatre.y + Math.floor(theatre.h / 2);
    await goTo(tx + 2.5, ty + 4.5);
    await snap('theatre');
    // (toward its far corner: the gallery, the cabinets of last words, the ledger, the beds along its far walls)
    await goTo(theatre.x + 6.5, theatre.y + 6.5);
    await snap('gallery');
  }
  if (want('map')) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const L = g.level;
      const f = L.floor;
      const land = L.land;
      const k = Math.max(1, Math.floor(Math.min((innerWidth - 8) / f.w, (innerHeight - 8) / f.h) * 4) / 4);
      const c = document.createElement('canvas');
      c.id = 'hqmap';
      c.width = innerWidth * 2;
      c.height = innerHeight * 2;
      c.style.cssText = `position:fixed;left:0;top:0;width:${innerWidth}px;height:${innerHeight}px;z-index:99;background:#05060a`;
      document.body.appendChild(c);
      const d = c.getContext('2d');
      d.scale(2, 2);
      d.fillStyle = '#05060a';
      d.fillRect(0, 0, innerWidth, innerHeight);
      const ox = (innerWidth - f.w * k) / 2;
      const oy = (innerHeight - f.h * k) / 2;
      const ZC = ['#8b8572', '#5f6266', '#62785a', '#5a4434', '#7a6f88'];
      for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
        const i = ty * f.w + tx;
        if (f.tiles[i] !== 1) continue;
        d.fillStyle = ZC[land.zones[i]] ?? '#888';
        d.fillRect(ox + tx * k, oy + ty * k, k, k);
        if (L.walk[i] !== 1) {
          d.fillStyle = 'rgba(0,0,0,0.55)';
          d.fillRect(ox + tx * k, oy + ty * k, k, k);
        }
      }
      const dot = (x, y, r, col) => {
        d.fillStyle = col;
        d.beginPath();
        d.arc(ox + x * k, oy + y * k, r, 0, Math.PI * 2);
        d.fill();
      };
      for (const p of L.props) if (p.name === 'an iron ward bed') {
        d.fillStyle = '#d6d4c6';
        d.fillRect(ox + p.tx * k + k * 0.2, oy + p.ty * k + k * 0.2, (p.variant >= 2 ? 0.6 : 1.6) * k, (p.variant >= 2 ? 1.6 : 0.6) * k);
      }
      for (const z of L.hazards) dot(z.spot.x + 0.5, z.spot.y + 0.5, k * 0.6, '#a8d060');
      for (const p of f.packs) dot(p.x, p.y, k * 0.8, p.tier === 'champion' ? '#ff4040' : p.tier === 'elite' ? '#ffd040' : '#ff8a30');
      const b = land.bells;
      if (b) {
        d.strokeStyle = 'rgba(160,160,170,0.7)';
        d.lineWidth = 1;
        d.beginPath();
        d.arc(ox + b.hush.x * k, oy + b.hush.y * k, b.hush.r * k, 0, Math.PI * 2);
        d.stroke();
        dot(b.muffled.x, b.muffled.y, k * 1.1, '#ff40c0');
        for (const q of b.bells) dot(q.x, q.y, k * 0.9, '#28dcf0');
      }
      dot(f.start.x, f.start.y, k * 1.2, '#40ff60');
      dot(f.boss.x, f.boss.y, k * 1.2, '#ff2020');
      dot(land.exit.x, land.exit.y, k * 1.2, '#ffffff');
      d.fillStyle = '#ddd';
      d.font = '10px sans-serif';
      d.fillText(`floor 14, ${f.w} x ${f.h}: ward (boards), hall (grey), apothecary (green), theatre (brown), chapel (violet); beds; call bells cyan, the Muffled Bell pink, the Hush's circle; packs orange (yellow elite, red the lair's); tonic green; start green, boss red, way on white`, 6, 12);
    });
    await page.waitForTimeout(300);
    await snap('map');
    await page.evaluate(() => document.getElementById('hqmap')?.remove());
  }
}
