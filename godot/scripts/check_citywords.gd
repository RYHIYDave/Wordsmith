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
	await _in_his_moves()
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


# --- in his moves: floor 2's pack of skeletons, as the words' own checks gather it (main.gd _words_shots, _w_*) ---

func _lost() -> Array:
	var out: Array = []
	for k in M._w_pack.size():
		out.append(roundi(float(M._w_was[k]) - float(M._w_pack[k].life)))
	return out


func _in_his_moves() -> void:
	await M.go_to("floor2", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	h.walked = 5.0
	if not M._w_find():
		_line(false, "no hall on floor 2 for the pack")
		return
	var near: Array = []
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == "skeleton" and not o.elite and not o.boss:
			near.append(o)
	near.sort_custom(func(a, b): return a.world.distance_to(M._w_home) < b.world.distance_to(M._w_home))
	M._w_pack = near.slice(0, M.W_FORM.size())
	for o in M._monsters.list:
		if is_instance_valid(o) and not M._w_pack.has(o):
			o.queue_free()
	await M._wait(0.2)
	h.unhurt = true
	var P: Array = M._w_pack
	var hit: int
	var lost: Array
	# PULLING in front: what is within 2.2 of the one struck dragged toward it
	_case(h, 0, "front", ["pulling"])
	var d1: float = P[1].world.distance_to(P[0].world)
	var d2: float = P[2].world.distance_to(P[0].world)
	await M._w_strike(h)
	await M._wait(0.2)
	await _snap("pulling_front")
	var e1: float = P[1].world.distance_to(P[0].world)
	var e2: float = P[2].world.distance_to(P[0].world)
	var stop: float = float(preload("res://scripts/words.gd").data()["pull"]["stop"])
	_line(e1 <= stop + 0.05 and e2 <= stop + 0.05 and e1 < d1 and e2 < d2, "PULLING in front: those near the one struck dragged toward it (%.2f to %.2f, %.2f to %.2f tiles)" % [d1, e1, d2, e2])
	# SPLITTING in front: three copies of 40% fly on to the nearest others
	var r: Dictionary = _case(h, 0, "front", ["splitting"])
	await M._w_strike(h)
	await M._wait(0.08)
	await _snap("splitting_front")
	await M._wait(0.5)
	lost = M._w_lost()
	hit = M._w_hit(h, 0)
	var copy: int = M._w_hit(h, 0, float(r["split"]))
	var copies := 0
	for k in range(1, lost.size()):
		if absi(int(lost[k]) - copy) <= 1:
			copies += 1
	_line(absi(int(lost[0]) - hit) <= 1 and copies == 3, "SPLITTING in front: its first hit (%d) breaks into 3 copies of %s (%d each): %s" % [hit, str(r["split"]), copy, str(lost)])
	# HEXING in front: cursed, the next blow harder
	r = _case(h, 0, "front", ["hexing"])
	await M._w_strike(h)
	await M._wait(0.1)
	var hexed: bool = P[0].hex_t > 0.0
	await _snap("hexing_front")
	M._w_mark()
	h._last_swing = -10.0
	await M._w_strike(h)
	await M._wait(0.1)
	lost = M._w_lost()
	var want: int = roundi(maxf(1.0, roundf(M._w_avg(h, 0))) * (1.0 + float(r["hex"])))
	_line(hexed and absi(int(lost[0]) - want) <= 1, "HEXING in front: what it hits is cursed (%.1f s); struck again it takes %s more (%d, wanted %d)" % [P[0].hex_t, str(r["hex"]), int(lost[0]), want])
	# STILLING in front: slowed in time
	r = _case(h, 0, "front", ["stilling"])
	await M._w_strike(h)
	await M._wait(0.1)
	await _snap("stilling_front")
	_line(P[0].still_t > 0.0 and absf(P[0].time_of() - (1.0 - float(r["still"]))) < 0.01, "STILLING in front: what it hits is slowed in time %.0f%% for %.1f s" % [(1.0 - P[0].time_of()) * 100.0, P[0].still_t])
	# BINDING in front: held in place
	r = _case(h, 0, "front", ["binding"])
	await M._w_strike(h)
	await M._wait(0.1)
	await _snap("binding_front")
	var at0: Vector2 = P[0].world
	P[0].world += Vector2(0.5, 0.0)
	await M._wait(0.05)
	var pinned: bool = P[0].world.distance_to(at0 + Vector2(0.5, 0.0)) < 0.01
	_line(P[0].bind_t > 0.0, "BINDING in front: what it hits is held in place (%.1f s, not again for %.1f s)" % [P[0].bind_t, P[0].bind_again])
	# BEHIND: the vortex, the hex circle, the bubble, the shards, the snare
	_case(h, 0, "behind", ["pulling"])
	await M._w_strike(h)
	await M._wait(0.1)
	await _snap("pulling_behind")
	_line(M.wakes.list.any(func(z): return z["kind"] == "vortex"), "PULLING behind: a vortex where it struck")
	_case(h, 0, "behind", ["hexing"])
	await M._w_strike(h)
	await M._wait(0.1)
	var circle = M.wakes.patch_at("hex", P[0].world)
	await _snap("hexing_behind")
	# (a blow from one standing in it is weaker)
	h.unhurt = false
	h.life = h.max_life
	h.hurt_by(100.0, "phys", [], {}, P[0], P[0].world, true)
	var took: float = h.max_life - h.life
	h.life = h.max_life
	h.unhurt = true
	_line(circle != null and absf(took - roundf(100.0 * (1.0 - float(circle["dmg"])))) <= 1.0, "HEXING behind: a hex circle; a blow of 100 from one in it does %d" % roundi(took))
	r = _case(h, 0, "behind", ["stilling"])
	await M._w_strike(h)
	await M._wait(0.1)
	await _snap("stilling_behind")
	_line(M.wakes.patch_at("bubble", P[0].world) != null and absf(P[0].time_of() - (1.0 - float(r["bubble"]))) < 0.01, "STILLING behind: a bubble; one in it %.0f%% slower" % [(1.0 - P[0].time_of()) * 100.0])
	r = _case(h, 0, "behind", ["splitting"])
	await M._w_strike(h)
	await M._wait(0.1)
	await _snap("splitting_behind")
	await M._wait(0.6)
	lost = M._w_lost()
	var shard: int = M._w_hit(h, 0, float(r["shards"]))
	var by_shards := 0
	for k in range(1, lost.size()):
		if int(lost[k]) > 0 and absi(int(lost[k]) % shard) <= 1:
			by_shards += 1
	_line(by_shards >= 1, "SPLITTING behind: shards of %s (%d each) fly out where it struck, striking the first on their lines: %s" % [str(r["shards"]), shard, str(lost)])
	r = _case(h, 0, "behind", ["binding"])
	await M._w_strike(h)
	await M._wait(0.1)
	var snare = null
	for z in M.wakes.list:
		if z["kind"] == "snare":
			snare = z
	# (the one struck stands on it: let be; another comes onto it)
	P[3].world = Vector2(snare["x"], snare["y"]) if snare != null else P[3].world
	await M._wait(0.2)
	await _snap("binding_behind")
	_line(snare != null and P[3].bind_t > 0.0 and P[0].bind_t <= 0.0, "BINDING behind: a snare where it struck; the next to cross it held (%.1f s), the one standing on it let be" % P[3].bind_t)


## A case begun (main.gd _w_set), and what the city's words did to the pack in the last case gone.
func _case(_h, i: int, side: String, words: Array) -> Dictionary:
	var r: Dictionary = M._w_set(h, i, side, words)
	for o in M._w_pack:
		o.hex_t = 0.0
		o.still_t = 0.0
		o.bind_t = 0.0
		o.bind_again = 0.0
	return r
