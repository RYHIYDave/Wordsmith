# Plants one fault at a time in the tutorial's and the word economy's rules and checks that the
# unit tests notice. Every line should read CAUGHT. The source is put back after each one.
#   python3 tools/faults.py            (all of them: about four minutes)
#   python3 tools/faults.py "no harm"   (only those whose name contains the words)
# A fault whose text is no longer in the source is reported as "cannot plant": bring it up to date.
import subprocess, re, sys
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
G = 'src/game/game.ts'
D = 'src/game/defs.ts'
faults = [
 # ---- the tutorial
 ('the warrior is taught with Flame', D, "{ warrior: 'power', ranger: 'twin', mage: 'fire' }", "{ warrior: 'fire', ranger: 'twin', mage: 'fire' }"),
 ('the tutorial takes the word anywhere', G, "        if (quick.front.includes(w)) this.lessonStage('after');", "        if (owned) this.lessonStage('after');"),
 ('"behind" passes while the word is still in front', G, "        if (quick.behind.includes(w) && !quick.front.includes(w)) this.lessonStage('tryBehind');", "        if (owned) this.lessonStage('tryBehind');"),
 ('the big attack need not be used', G, "          if (h.skills[1].uses > L.uses0) this.lessonStage('evade');", "          if (true) this.lessonStage('evade');"),
 ('the first fight passes on time alone', G, "        if (!alive && L.t > 1) this.lessonStage('need');", "        if (L.t > 1) this.lessonStage('need');"),
 ('the crowd need not be killed, only the carrier', G, "        if (!alive && L.t > 1) {\n          // how the crowd went with the bare attack", "        if (!this.monsters.some((m) => !m.dead && m.carries.length > 0) && L.t > 1) {\n          // how the crowd went with the bare attack"),
 ('the evasive move need not be made', G, "        if (h.skills[2].uses > L.uses0 && !h.move) this.lessonStage('behind');", "        if (L.t > 1) this.lessonStage('behind');"),
 ('the first steps need not be taken', G, "        if (Math.hypot(h.x - L.goal.x, h.y - L.goal.y) < 1.3) this.lessonStage('attack');", "        if (L.t > 1) this.lessonStage('attack');"),
 ('the word lies on the floor from the start (no "before")', G, "    this.lessonStage('walk');\n  }", "    this.addDrop('word', h.x, h.y - 3, 0, null, this.lesson.word);\n    this.lessonStage('walk');\n  }"),
 ('monsters are there before the first steps', G, "    this.lessonStage('walk');\n  }", "    this.lessonStage('walk');\n    this.lessonPack(2, false);\n  }"),
 ('the carrier carries nothing', G, "        m.carries = [L.word];\n", ""),
 ('nobody in the crowd has a name', G, "    else if (stage === 'need') this.lessonPack(LESSON.crowd, true);", "    else if (stage === 'need') this.lessonPack(LESSON.crowd, false);"),
 ('a second word: the second crowd is led by a carrier too', G, "    else if (stage === 'after') this.lessonPack(LESSON.crowd, false);", "    else if (stage === 'after') this.lessonPack(LESSON.crowd, true);"),
 ('the second crowd is not the same crowd', G, "    else if (stage === 'after') this.lessonPack(LESSON.crowd, false);", "    else if (stage === 'after') this.lessonPack(LESSON.few, false);"),
 ('nothing comes once the word is on', G, "    else if (stage === 'after') this.lessonPack(LESSON.crowd, false);", ""),
 ('tutorial monsters are as tough as dungeon ones', G, "    const life = Math.max(2, Math.round(this.avgHit(0, 1) * LESSON.hits));", "    const life = MONSTERS.skeleton.life;"),
 ('tutorial monsters fall to one bare hit (no "before")', D, "  hits: 1.25,", "  hits: 0.5,"),
 ('the carrier is no tougher than the rest', D, "  carrier: 3,", "  carrier: 1,"),
 ('the difference is claimed even when there was none', G, "            if (L.after.hits >= 1 && L.after.hits < L.before.hits) L.tally = 0;", "            L.tally = 0;"),
 ('the two numbers get no beat', G, "          if (L.tally < 0 || L.tally >= LESSON.beat) this.lessonStage('big');", "          this.lessonStage('big');"),
 ('the "before" is not measured', G, "          L.before = { time: L.t, hits: quick.uses - L.uses0 };", "          L.before = { time: L.t, hits: 0 };"),
 ('the "after" keeps counting', G, "          if (L.after.time === 0) {", "          if (true) {"),
 ('the tutorial is not remembered', G, "    this.meta.taught = true;\n", "\n"),
 ('a new character is not offered its word', G, "    this.offer = FIRST_WORD[cls];\n", "\n"),
 ('a skipped tutorial offers nothing', G, "    this.offer = h.words[w] > 0 && this.placeable(w) ? w : null;", "    this.offer = null;"),
 ('skipping gives the word twice', G, "    if (h.words[w] <= 0 && !h.skills.some((sk) => sk.front.includes(w) || sk.behind.includes(w))) h.words[w] = 1;", "    h.words[w]++;"),
 ('a new character has two words', G, "    words[FIRST_WORD[cls]] = 1;\n", "    words[FIRST_WORD[cls]] = 1;\n    words[cls === 'ranger' ? 'fire' : 'twin'] = 1;\n"),
 ('the tutorial word is carried into the tutorial', G, "    h.words[FIRST_WORD[h.cls]] = 0;\n", ""),
 ('a lost word is not handed over', G, "        else if (!this.drops.some((d) => d.kind === 'word' && d.word === w)) h.words[w] = 1;", ""),
 ('the hero can die in the tutorial', G, "    if (this.practice || this.lesson) {\n      // the practice room and the opening lesson only knock the wind out of you", "    if (this.practice) {\n      // the practice room and the opening lesson only knock the wind out of you"),
 ('a step does not refill life', G, "    // every step begins whole: this is a lesson, not a test of endurance\n    h.life = h.d.maxLife;", "    // every step begins whole: this is a lesson, not a test of endurance"),
 ('the crowd hits as hard as a dungeon', D, "  dmg: 0.18,", "  dmg: 1,"),
 ('the crowd hits as fast as a dungeon, and a tutorial fire burns', G, "    if (h.burnT > 0 && !this.over && !this.lesson) {", "    if (h.burnT > 0 && !this.over) {"),
 ('the crowd does no harm at all', G, "    if (this.over || h.invuln > 0 || h.move) return;\n    this.slainBy = src ? src.name : from;", "    if (this.over || h.invuln > 0 || h.move || this.lesson) return;\n    this.slainBy = src ? src.name : from;"),
 ('the banner keeps asking for a dead carrier', 'src/ui/lesson.ts', "      if (!game.monsters.some((m) => !m.dead && m.carries.length > 0)) return mk(", "      if (false) return mk("),
 ('the "after" banner does not name the new attack', 'src/ui/lesson.ts', "      return mk(touch ? `Now TAP: ${n.f} ${n.a}` : `Now LEFT CLICK: ${n.f} ${n.a}`,", "      return mk(touch ? `Now TAP: ${n.a}` : `Now LEFT CLICK: ${n.a}`,"),
 ('the tutorial sets off the offer as well (the screen would open twice)', G, "        if (!this.lesson && this.placeable(dr.word)) this.offer = dr.word;", "        if (this.placeable(dr.word)) this.offer = dr.word;"),
 ('a word picked up outside the tutorial is not offered', G, "        if (!this.lesson && this.placeable(dr.word)) this.offer = dr.word;", ""),
 ('a new socket is not offered a word', G, "        if (spare) this.offer = spare;", ""),
 ('the dodge fizzles beside the pointer', G, "    if (Math.hypot(tx - h.x, ty - h.y) < 0.9) {", "    if (Math.hypot(tx - h.x, ty - h.y) < 0.3) {"),
 ('a swap loses the displaced word', G, "    if (toPouch) h.words[toPouch]++;", ""),
 ('a carried-on character is pressed to wordsmith', G, "    // (a character carried on with is not a new one: nothing is pressed on them)\n    g.offer = null;", "    // (a character carried on with is not a new one: nothing is pressed on them)"),
 # ---- scarce words
 ('every named monster carries, as before', D, "  eliteCarry: 0.2,", "  eliteCarry: 1,"),
 ('named monsters never carry', D, "  eliteCarry: 0.2,", "  eliteCarry: 0,"),
 ('every guardian carries, as before', D, "  guardianCarry: 0.4,", "  guardianCarry: 1,"),
 ('the boss gives up nothing', G, "      const p = boss ? 1 : champion ? TUNE.guardianCarry : TUNE.eliteCarry;", "      const p = boss ? 0 : champion ? TUNE.guardianCarry : TUNE.eliteCarry;"),
 ('a carrier gives up all its words, as before', G, "carries = [lot.pick(words)];", "carries = [...words];"),
 ('a named monster drops its word whether or not it shows a rune', G, "    for (const w of m.carries) this.addDrop('word', m.x, m.y, 0, null, w);\n    // (in the lesson there is nothing else", "    for (const w of m.elite && !this.lesson ? m.words : m.carries) this.addDrop('word', m.x, m.y, 0, null, w);\n    // (in the lesson there is nothing else"),
 ('a carrier drops nothing', G, "    for (const w of m.carries) this.addDrop('word', m.x, m.y, 0, null, w);\n    // (in the lesson there is nothing else", "    // (in the lesson there is nothing else"),
 ('the first chest of a vault always holds a word, as before', G, "        if (this.rng.chance(firstInVault ? TUNE.vaultWord : TUNE.chestWord))", "        if (firstInVault || this.rng.chance(TUNE.chestWord))"),
 ('every chest holds a word a third of the time, as before', D, "  chestWord: 0.05,", "  chestWord: 0.35,"),
 ('ordinary monsters drop words as often as before', D, "  dropWord: 0.003,", "  dropWord: 0.012,"),
 ('the boss drops an extra random word, as before', G, "      this.addDrop('orb', m.x, m.y, 0, null, null);\n      return;\n    }\n    if (m.champion) {", "      this.addDrop('orb', m.x, m.y, 0, null, null);\n      this.addDrop('word', m.x, m.y, 0, null, rng.pick(WORD_IDS));\n      return;\n    }\n    if (m.champion) {"),
 ('the boss keeps the words burned into its dungeon', G, "    if (boss) for (const w of this.dungeonWords) if (!carries.includes(w)) carries.push(w);", ""),
 ('every monster gives up the words burned into the dungeon', G, "    if (boss) for (const w of this.dungeonWords) if (!carries.includes(w)) carries.push(w);", "    for (const w of this.dungeonWords) if (!carries.includes(w)) carries.push(w);"),
 ('burning words in does not make finds likelier', G, "      if (lot.chance(Math.min(1, p * (1 + 0.3 * this.dungeonWords.length)))) carries", "      if (lot.chance(p)) carries"),
 ('the luck of the finds changes the dungeon itself', G, "      if (lot.chance(Math.min(1, p * (1 + 0.3 * this.dungeonWords.length)))) carries = [lot.pick(words)];", "      if (rng.chance(Math.min(1, p * (1 + 0.3 * this.dungeonWords.length)))) carries = [rng.pick(words)];"),
 ('the first dungeon has no certain word', G, "    if (give && want > 0) carries = [give];", "    if (false) carries = [give];"),
 ('the first dungeon\'s certain word may be one already owned', G, "    const gift = fresh.length ? fresh[(seed >>> 3) % fresh.length] : null;", "    const gift = WORD_IDS[(seed >>> 3) % WORD_IDS.length];"),
 ('the rune is never explained', G, "        this.msg(`${o.name} carries a WORD. Kill it and the word is yours.`, '#b0f0dc');", ""),
 ('the rune is explained every time', G, "        this.toldCarrier = true;\n", ""),
]
only = sys.argv[1:] 
missed = 0
for name, f, old, new in faults:
    if only and not any(o in name for o in only): continue
    p = ROOT + f
    s = open(p).read()
    if s.count(old) != 1:
        print('!! cannot plant:', name, '(found %d)' % s.count(old)); missed += 1; continue
    open(p, 'w').write(s.replace(old, new))
    try:
        r = subprocess.run(['/opt/npm-tools/node_modules/.bin/tsx', '--test', 'tests/lesson.test.ts', 'tests/economy.test.ts'], cwd=ROOT, capture_output=True, text=True, timeout=280)
        out = r.stdout + r.stderr
        failed = re.findall(r'^not ok \d+ - (.*)$', out, re.M)
        if not failed: missed += 1
        print(('CAUGHT  ' if failed else 'MISSED  ') + name + (': ' + '; '.join(x[:60] for x in failed[:2]) if failed else ''), flush=True)
    except subprocess.TimeoutExpired:
        print('CAUGHT  ' + name + ': the tests never finished', flush=True)
    finally:
        open(p, 'w').write(s)
print('missed or unplantable:', missed, 'of', len(faults))
