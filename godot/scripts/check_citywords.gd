## CHECKS: THE CITY'S FIVE WORDS (game/defs.ts PULL, SPLIT, HEX, STILL, BIND; types.ts DEEP_WORD_IDS), `--only=citywords`: on floor 11, a
## Hushed given each word in turn strikes the hero, and what the word does is looked for (Pulling drags him a step to it; Hexing curses
## him, the next blow harder; Stilling slows the waits of his moves; Binding roots him; Splitting, struck dead, it splits in two at
## half its life); then his own moves with each word (front and behind), where they are in.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var shot := 0
var struck := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("WORDS11 %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/w11_%02d_%s.png" % [dir, shot, name])


func _run(secs: float, until := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		if h.life < h.max_life:
			struck += 1
			h.life = h.max_life
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


static func _ready_only(m, i: int) -> void:
	var A: Array = m.h2.acts()
	if m.h2.cds.size() != A.size():
		m.h2.cds = []
		for a in A:
			m.h2.cds.append(0.0)
	for k in A.size():
		m.h2.cds[k] = 0.0 if k == i else 999.0
	m._cd = 0.0
	if m.h2.act == null:
		m.h2._to("stand")


func run(main, hero, out: String) -> void:
	M = main
	h = hero
	dir = out
	M.loot.level = 30
	M.loot.ring_lit = true
	M.loot.derive()
	h.walked = 50.0
	h.unhurt = false
	await M.go_to("floor11", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	# (one plain Hushed kept, the rest of the floor put away)
	var m = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.kind == "hushed" and not o.boss and o.words.is_empty() and (m == null or o.world.distance_to(h.world) < m.world.distance_to(h.world)):
			m = o
	for o in M._monsters.list:
		if is_instance_valid(o) and o != m:
			o.queue_free()
	await M._wait(0.1)
	if m == null:
		_line(false, "no plain Hushed on floor 11")
		return
	await _on_monster(m)
	print("WORDS11: %d steps, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## A blow of `m`'s, it carrying `w`: it is let at the hero, standing beside it, and its blow awaited.
func _blow_with(m, w: String) -> bool:
	m.words = [w]
	m.half = []
	m.rise(0.0)
	m._t = 0.0
	h.world = M._spot_near(m.world, 0.9, h.world)
	_ready_only(m, 0)
	struck = 0
	var got: bool = await _run(5.0, func(): return struck > 0)
	await _run(0.1)
	return got


func _on_monster(m) -> void:
	# PULLING: a step toward it
	var at0: Vector2 = h.world
	m.words = ["pulling"]
	h.world = M._spot_near(m.world, 1.6, h.world)
	var from: float = h.world.distance_to(m.world)
	var hit: bool = await _blow_with(m, "pulling")
	_line(hit and h.last_blow.get("dmg", 0.0) > 0.0, "PULLING on a monster: its blow drags the hero a step toward it (%.2f tiles off after)" % h.world.distance_to(m.world))
	m.rise(1e9)
	await _run(1.5)
	# HEXING: cursed, the next blow harder
	h.hex_t = 0.0
	hit = await _blow_with(m, "hexing")
	var hexed: bool = h.hex_t > 0.0 and h.hex_more > 0.0
	await _snap("hexed")
	_line(hit and hexed, "HEXING on a monster: its blow curses the hero, %d%% more harm for %.1f s" % [roundi(h.hex_more * 100.0), h.hex_t])
	m.rise(1e9)
	await _run(1.0)
	# STILLING: the waits of his moves slower
	h.still_t = 0.0
	hit = await _blow_with(m, "stilling")
	var pace: float = h.cd_pace()
	await _snap("stilled")
	_line(hit and h.still_t > 0.0 and pace < h.frenzy_pace() - 0.1, "STILLING on a monster: its blow slows the waits of his moves (at %.0f%% for %.1f s)" % [pace * 100.0, h.still_t])
	m.rise(1e9)
	await _run(1.0)
	# BINDING: rooted where he stands
	h.root_t = 0.0
	h.root_again = 0.0
	hit = await _blow_with(m, "binding")
	var rooted: bool = h.root_t > 0.0 and h.walk_pace() == 0.0
	await _snap("rooted")
	_line(hit and rooted, "BINDING on a monster: its blow roots the hero where he stands (%.1f s; not again for %.1f s)" % [h.root_t, h.root_again])
	m.rise(1e9)
	await _run(1.5)
	# SPLITTING: struck dead, it splits in two at half its life, smaller
	m.words = ["splitting"]
	var was := 0
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead:
			was += 1
	var life: float = m.max_life
	m.rise(0.0)
	await _run(0.1)
	m.hurt(1e9)
	await _run(0.4)
	var two: Array = []
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.split:
			two.append(o)
	await _snap("split")
	var halves: bool = two.size() == 2 and two.all(func(o): return absf(o.max_life - roundf(life * 0.5)) <= 1.0 and o.look < 1.0 and o.words.is_empty())
	_line(halves, "SPLITTING on a monster: struck dead, it splits in two (%d), each at half its life, smaller, wordless" % two.size())
	# (they split no more)
	for o in two:
		o.hurt(1e9)
	await _run(0.4)
	var more := 0
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.split:
			more += 1
	_line(more == 0, "and the two it split into split no more (%d left)" % more)
