// MIXED ELEMENTS IN ONE LINE (game/items.ts MELD_LINE, switched on for this page only): an amulet with Hailstorm burned in, its
// card as the game has it (two lines, each rolled on its own) and with MELD_LINE (one line, one number). For his yes.
//   node tools/build_to.mjs dist/foe_melds.html
//   node tools/playtest.mjs --file dist/foe_melds.html --size 844x390 --dpr 3 --scenario tools/scenarios/meld_line_look.mjs --out shots/foe/card
export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  for (const on of [false, true]) {
    const got = await page.evaluate((on) => {
      const d = window.__dbg;
      d.saving(false);
      d.practice('warrior', 12);
      d.autoLevel = false;
      d.autoWords = false;
      d.meldLine.on = on;
      const g = d.game(); const h = g.hero;
      g.waveT = 1e9; g.monsters.length = 0;
      for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
      // (a plain amulet, Hailstorm burned in as frost and lightning damage: the pair his “25% lightning and frost damage” was)
      for (let s = 1; s < 400; s++) {
        const it = d.item('amulet', 0, 12, s);
        if (it.affixes.length) continue;
        it.reqLevel = 1;
        h.bag[0] = it;
        h.words.hailstorm = 1;
        g.imbue({ kind: 'bag', i: 0 }, 'hailstorm');
        const im = it.imbues[0];
        if (im && im.mods.length === 2 && im.mods[0].stat === 'frostPct' && im.mods[1].stat === 'lightPct') break;
        h.bag[0] = null;
      }
      d.inv();
      d.invUi.page = 'gear';
      d.invUi.sel = { kind: 'bag', i: 0 };
      const it = h.bag[0];
      return it ? it.imbues[0].mods.map((m) => `${m.stat} ${m.value}`) : null;
    }, on);
    console.log(`  MELD_LINE ${on ? 'on' : 'off'}: ${JSON.stringify(got)}`);
    if (!got) bad('no amulet with frost and lightning damage');
    await page.waitForTimeout(600);
    await snap(on ? '2_one_line' : '1_two_lines');
  }
}
