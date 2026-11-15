## THE CHECK OF LASTING'S, FLEETING'S AND VAST'S LOOKS (--only=looks10; main.gd sends it here): on floor 2, in the hall the words'
## check gathers its pack of six skeletons in (main.gd _w_find, _w_reset: A before him, B and C beside it, D and E further off),
## each of the three words' sides at work, pictured at its beats (render/words10.ts W10_BEATS), a line a picture: what the rules
## keep then, how many of the look's dots lie on the floor and over the figures, its moments at work and his after-images, and
## whether that is what the look should be showing then (OK or WRONG). Then the sum, LOOKS10.
##   AT ITS BEATS (the rules' clocks moved by hand, a sixtieth of a second at a time, the effects with them, so that each picture
##     is of its own moment): Lasting and Fleeting on burning ground Flame behind his Strike leaves, on his Whirlwind, on the boost
##     a move gives him (Power's might, Swift's haste), on his poison or burning on a monster, and on a monster's on him; Vast in
##     front on his Whirlwind's turns, his Strike's splash and his Lunge's landing; Vast behind, a hit splashed on two near; a
##     monster carrying Vast, its warning (perils.gd warn, its own rule widening it).
##   AT WORK (the rules running, his moves made as he makes them): a Strike with Vast in front and behind; the Whirlwind with
##     Lasting and Flame, held and let go; the Whirlwind with Fleeting and Vast; a skeleton carrying Poison and Lasting striking
##     him; and what the effects cost a frame with nothing, and with Lasting's burning ground, its spin and its ribbon at once.
extends RefCounted

const BakedHero := preload("res://scripts/baked_hero.gd")
const Monster := preload("res://scripts/monster.gd")
const Words := preload("res://scripts/words.gd")
const W10 := preload("res://scripts/fx_words10.gd")

var M  # main.gd
var h  # hero.gd
var fx
var w10
var dir := ""
var n := 0
var bad: Array = []
var _t := 0.0
var _home := Vector2.ZERO
var _face := Vector2(1, 0)
var _side := Vector2(0, 1)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor2", "down")
	await M._wait(1.4)
	# (the place's own effects, made as it was laid out)
	fx = M.fx
	w10 = fx.w10
	if M.sight != null:
		M.sight.see_all()
	h.walked = 5.0
	# (the words' check's hall and pack: main.gd _words_shots)
	if not M._w_find():
		print("LOOKS10: no hall on floor 2 has room for the pack")
		return
	var first: Monster = M._nearest_kind(M._w_home, "skeleton", 0.0)
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "skeleton" and not m.elite and not m.boss:
			near.append(m)
	if first == null or near.size() < 6:
		print("LOOKS10: floor 2 has no pack of skeletons to gather")
		return
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(first.world) < b.world.distance_to(first.world))
	M._w_pack = near.slice(0, 6)
	for o in M._monsters.list:
		if is_instance_valid(o) and not M._w_pack.has(o):
			o.queue_free()
	_home = M._w_home
	_face = M._w_face
	_side = Vector2(-_face.y, _face.x)
	M._w_reset(h)
	M._hud.visible = false
	M._mini.visible = false
	await M._wait(0.6)
	print("LOOKS10 begin: floor 2, he at %s facing %s, the pack A to F before him" % [_home, _face])
	var only: String = M._arg("case")
	var want := func(k: String) -> bool: return only == "" or k.begins_with(only)
	# ---- AT ITS BEATS ----
	if want.call("lasting_ground"):
		await _ground("lasting", [0.12, 1.5, 4.5, 5.6, 6.15, 6.5, 7.0])
	if want.call("fleeting_ground"):
		await _ground("fleeting", [0.05, 0.1, 1.2, 2.45, 2.75, 3.2])
	if want.call("lasting_spin"):
		await _spin("lasting", [], [0.1, 0.3, 1.5, 3.0, 3.55, 3.7, 4.0, 4.4])
	if want.call("fleeting_spin"):
		await _spin("fleeting", [], [0.04, 0.1, 0.8, 1.5, 1.65, 1.9])
	if want.call("lasting_boost"):
		await _boost("lasting", "power", [0.15, 0.35, 1.0, 2.5, 7.2, 7.45, 7.6])
	if want.call("fleeting_boost"):
		await _boost("fleeting", "swift", [0.03, 0.06, 0.6, 1.3, 1.95, 2.1])
	if want.call("lasting_dot"):
		await _dot("lasting", "poison", [0.1, 0.25, 3.0, 5.8, 6.1, 6.4, 6.8])
	if want.call("fleeting_dot"):
		await _dot("fleeting", "fire", [0.03, 0.06, 0.2, 1.0, 1.9, 2.2])
	if want.call("lasting_him"):
		await _on_him("lasting", "poison", [0.1, 0.25, 3.0, 5.8, 6.1, 6.5])
	if want.call("fleeting_him"):
		await _on_him("fleeting", "fire", [0.03, 0.06, 0.5, 1.9, 2.1])
	if want.call("vast_front_spin"):
		await _vast_spin([0.03, 0.06, 0.13, 0.2, 0.32, 0.5, 0.75])
	if want.call("vast_front_splash"):
		await _vast_burst("splash", [0.03, 0.1, 0.2, 0.5, 0.75])
	if want.call("vast_front_landing"):
		await _vast_burst("landing", [0.03, 0.1, 0.2, 0.5, 0.75])
	if want.call("vast_behind"):
		await _vast_behind([0.03, 0.06, 0.12, 0.2, 0.3, 0.45, 0.7, 0.8])
	if want.call("vast_monster"):
		await _vast_warn([0.05, 0.2, 0.5, 0.85, 0.95])
	# ---- AT WORK ----
	_hand(false)
	if want.call("work"):
		await _at_work()
	print("LOOKS10: %d pictures of the three words' looks, %d as each should be then%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + ", ".join(bad)])


# =====================================================================================================================
# By hand

## The rules' own clocks stopped (the hero, the monsters, the ground, the warnings, the effects): they are moved by hand.
func _hand(on: bool) -> void:
	h.set_process(not on)
	M._monsters.set_process(not on)
	M.wakes.set_process(not on)
	M._monsters.perils.set_process(not on)
	fx.set_process(not on)
	fx.holds = not on


## A case begun: the pack whole and where it stands, he where he stands, nothing on him or it, the effects emptied; his words.
func _begin(i: int, front: Array, behind: Array) -> void:
	_hand(false)
	M._w_put(h, i, "front", front)
	for w in behind:
		h.loadout.put(i, "behind", w)
	M._w_reset(h)
	M._monsters.perils.list.clear()
	h.boost_by = {}
	h.dot_by = {}
	h.poison_t = 0.0
	h.burn_t = 0.0
	h.chill_t = 0.0
	h.frenzy = 0
	h.frenzy_t = 0.0
	h.shield_t = 0.0
	for m in M._w_pack:
		m.words = []
		m.last_skill = -1
	# (two frames with the clocks going, for all to stand where it was put)
	await M.get_tree().process_frame
	await M.get_tree().process_frame
	_hand(true)
	fx.clear()
	_t = 0.0


## The case's clock moved on to `t`, a sixtieth at a time: `tend` moves the rules' clocks; the effects with them.
func _to(t: float, tend: Callable) -> void:
	var step := 1.0 / 60.0
	while _t < t - 1e-6:
		tend.call(step, _t)
		fx.advance(step, _t + step >= t - 1e-6)
		w10.follow()
		_t += step


## How many of the look's dots lie on the floor and over the figures now (fx_words10.gd laid as the check lays it).
func _dots() -> Array:
	var out: Array = []
	for floor in [true, false]:
		w10._rec = {}
		if floor:
			w10.draw_floor(null)
		else:
			w10.draw_air(null)
		out.append(w10._rec.size())
	w10._rec = null
	return out


func _acts() -> String:
	var said := PackedStringArray()
	for a: Dictionary in w10.acts:
		said.append("%s %s%s %.2f/%.2f" % [a["word"], a["kind"], (" " + str(a["what"])) if a["what"] != "" else "", a["t"], a["dur"]])
	return "none" if said.is_empty() else ", ".join(said)


func _ghosts() -> int:
	var k := 0
	for g in w10._ghosts:
		if is_instance_valid(g) and g.visible:
			k += 1
	return k


## A picture of the case at its moment, and its line: `ok` whether it is what the look should be showing then.
func _pic(name: String, ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append("%s at %.2f s" % [name, _t])
	var d := _dots()
	await RenderingServer.frame_post_draw
	var img: Image = M.get_viewport().get_texture().get_image()
	img.get_region(Rect2i(240, 60, 480, 360)).save_png("%s/l%02d_%s_%03d.png" % [dir, n, name, roundi(_t * 100.0)])
	print("LOOKS10 %02d %s at %.2f s %s: %s; drawn %d dots on the floor, %d over the figures; at work: %s; after-images %d" % [n, name, _t, "OK" if ok else "WRONG", what, d[0], d[1], _acts(), _ghosts()])


# --- Lasting and Fleeting on a patch: the burning ground Flame behind his Strike leaves ---

func _ground(word: String, beats: Array) -> void:
	await _begin(0, [word], ["fire"])
	var r: Dictionary = h.loadout.r(0)
	var dur: float = r["zone"]["dur"]
	var at: Vector2 = _home + _face * 2.0 + _side * 0.4
	var patch := {"kind": "burn", "x": at.x, "y": at.y, "r": 1.2, "t": 0.0, "dur": dur, "element": "fire", "dmg": 0.0, "slow": 0.0, "tick": 99.0, "skill": 0}
	M.wakes.list.append(patch)
	fx.event({"t": "zone", "kind": "burn", "x": at.x, "y": at.y, "r": 1.2, "el": "fire"})
	var tend := func(dt: float, _now: float) -> void:
		if M.wakes.list.has(patch):
			patch["t"] += dt
			if patch["t"] >= patch["dur"]:
				M.wakes.list.erase(patch)
		M.wakes.queue_redraw()
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var lies: bool = M.wakes.list.has(patch)
		var own: float = dur / maxf(1.0, float(r["last"]))
		var ok: bool
		var what: String
		if lies:
			what = "burning ground (%s) %.2f of its %.2f s%s" % [word, patch["t"], dur, ", in the half again Lasting gave it" if word == "lasting" and patch["t"] > own else ""]
			ok = (d[0] > 0 if word == "lasting" else d[0] + d[1] > 0) and w10.held.size() == 1
		else:
			var leaves := "dunes" if word == "lasting" else "sparks"
			var left: bool = w10.acts.any(func(a): return a["what"] == leaves)
			var fade: float = W10.BEAT[word + ":patch"]["fade"]
			var gone: bool = _t > dur + fade + 0.02
			what = "the ground gone %.2f s ago%s" % [_t - dur, (", what it left (%s) settling" % leaves) if not gone else ", and what it left"]
			ok = (not left and d[0] + d[1] == 0) if gone else left
		await _pic(word + "_ground", ok, what)


# --- Lasting and Fleeting on his Whirlwind, held to its end and let go ---

func _spin(word: String, more: Array, beats: Array) -> void:
	await _begin(1, [word] + more, [])
	var r: Dictionary = h.loadout.r(1)
	var length: float = 2.4 * float(r["last"])
	var tick: float = 0.3 / float(r["pace"])
	var rad: float = 2.0 * float(r["size"])
	var next := [0.0]
	h._begin_whirl()
	h._act_t = 0.12
	h._spun = 0.0
	h._landed = false
	var tend := func(dt: float, now: float) -> void:
		if not h._landed:
			if next[0] <= 1e-9:
				fx.event(h._vast_edge(r, rad, {"t": "burst", "x": h.world.x, "y": h.world.y, "r": rad, "el": "phys", "style": "whirl", "words": h.loadout.fronts(1), "n": 0, "echo": false}))
				next[0] += tick
			next[0] -= dt
			h._spun += dt
			if h._spun >= length:
				h._landed = true
		h._act_t += dt
		h._show()
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var spinning: bool = not h.channel().is_empty()
		var ok: bool
		var what: String
		if spinning:
			what = "his Whirlwind (%s) %.2f of its %.2f s%s" % [word, h._spun, length, ", in the half again Lasting gave it" if word == "lasting" and h._spun > 2.4 else ""]
			ok = d[1] > 0 and (word == "lasting" or _ghosts() == 2) and (word == "fleeting" or h._spun < 2.4 or d[0] > 0)
		else:
			var leaves := "drift" if word == "lasting" else "sparks"
			var fade: float = W10.BEAT[word + ":spin"]["fade"]
			var gone: bool = _t > length + fade + 0.02
			var left: bool = w10.acts.any(func(a): return a["what"] == leaves)
			what = "let go %.2f s ago%s" % [_t - length, (", what it left (%s) settling" % leaves) if not gone else ", and what it left gone"]
			ok = (not left and d[0] + d[1] == 0 and _ghosts() == 0) if gone else left
		await _pic(word + "_spin", ok, what)
	h._end_act()


# --- a boost a move gives him: Power's might (Lasting), Swift's haste (Fleeting) ---

func _boost(word: String, by: String, beats: Array) -> void:
	await _begin(0, [word], [by])
	var r: Dictionary = h.loadout.r(0)
	var secs: float
	var key: String
	if by == "power":
		secs = 5.0 * float(r["last"])
		h.might = float(r["might"])
		h.might_t = secs
		key = "might"
		fx.event({"t": "buff", "kind": "might", "x": h.world.x, "y": h.world.y, "stacks": 1})
	else:
		secs = 3.0 * float(r["last"])
		h.haste = float(r["haste"])
		h.haste_t = secs
		key = "haste"
		fx.event({"t": "buff", "kind": "haste", "x": h.world.x, "y": h.world.y, "stacks": 1, "secs": secs})
	h.boost_by[key] = 0
	# (he walks across the hall a while, then stands)
	var from := _home - _side * 2.0
	var walk := [0.3, 1.3] if word == "lasting" else [0.25, 1.5]
	h.world = from
	h._turn(_side)
	h._place()
	var tend := func(dt: float, now: float) -> void:
		if by == "power":
			h.might_t = maxf(0.0, h.might_t - dt)
		else:
			h.haste_t = maxf(0.0, h.haste_t - dt)
		if now >= walk[0] and now < walk[1]:
			h.world += _side * 3.6 * dt
			h._list = BakedHero.WALK
		else:
			h._list = BakedHero.IDLE
		h._t += dt
		h._place()
		h._show()
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var left: float = h.might_t if by == "power" else h.haste_t
		var walking: bool = _t >= walk[0] and _t < walk[1]
		var ok: bool
		var what := "%s (%s, %s), %.2f of its %.2f s left, he %s" % [key, word, by, left, secs, "walking" if walking else "standing"]
		if left > 0.0:
			ok = d[1] > 0 if word == "lasting" else (d[1] > 0 and _ghosts() == 3)
		else:
			ok = d[0] + d[1] == 0 and _ghosts() == 0
		await _pic(word + "_" + key, ok, what)
	h._list = BakedHero.IDLE


# --- his poison or burning on a monster, by the move that last struck it ---

func _dot(word: String, what: String, beats: Array) -> void:
	await _begin(0, [what, word], [])
	var r: Dictionary = h.loadout.r(0)
	var a: Monster = M._w_pack[0]
	var secs: float = (4.0 if what == "poison" else 3.0) * float(r["last"])
	a.last_skill = 0
	if what == "poison":
		a.poison_t = secs
		a.poison_n = 1
		a.poison_dps = 1.0
	else:
		a.burn_t = secs
		a.burn_dps = 1.0
	var tend := func(dt: float, _now: float) -> void:
		a.poison_t = maxf(0.0, a.poison_t - dt)
		a.burn_t = maxf(0.0, a.burn_t - dt)
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var left := maxf(a.poison_t, a.burn_t)
		var ok: bool
		var said: String
		if left > 0.0:
			said = "its %s from his Strike (%s), %.2f of %.2f s left" % [what, word, left, secs]
			ok = d[1] > 0
		else:
			var heap: bool = w10.acts.any(func(q): return q["what"] == "heap")
			said = "its %s over %.2f s ago%s" % [what, _t - secs, ", Lasting's heap left blowing away" if heap else ""]
			ok = heap if word == "lasting" and _t - secs < float(W10.BEAT["lasting:dot"]["fade"]) else d[0] + d[1] == 0
		await _pic(word + "_on_monster", ok, said)


# --- a monster's poison or burning on him, laid with Lasting or Fleeting: its own blow (hero.gd hurt_by) ---

func _on_him(word: String, what: String, beats: Array) -> void:
	await _begin(0, [], [])
	var a: Monster = M._w_pack[0]
	a.words = [what, word]
	a.harm_hero(h, 8.0)
	var secs: float = maxf(h.poison_t, h.burn_t)
	var tend := func(dt: float, _now: float) -> void:
		h.poison_t = maxf(0.0, h.poison_t - dt)
		h.burn_t = maxf(0.0, h.burn_t - dt)
		h.chill_t = maxf(0.0, h.chill_t - dt)
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var left := maxf(h.poison_t, h.burn_t)
		var ok: bool
		var said: String
		if left > 0.0:
			said = "a skeleton's %s on him (%s, his dot_by %s), %.2f of %.2f s left" % [what, word, h.dot_by.get("word", ""), left, secs]
			ok = d[1] > 0 and h.dot_by.get("word", "") == word
		else:
			var heap: bool = w10.acts.any(func(q): return q["what"] == "heap" and q["enemy"])
			said = "its %s over %.2f s ago%s" % [what, _t - secs, ", the enemy's heap left blowing away" if heap else ""]
			ok = heap if word == "lasting" and _t - secs < float(W10.BEAT["lasting:monster"]["fade"]) else d[0] + d[1] == 0
		await _pic(word + "_on_him", ok, said)


# --- Vast in front: his Whirlwind's turns, his Strike's splash (Power's), his Lunge's landing; each laid wider ---

func _vast_spin(beats: Array) -> void:
	await _begin(1, ["vast"], [])
	var r: Dictionary = h.loadout.r(1)
	var rad: float = 2.0 * float(r["size"])
	var next := [0.0]
	h._begin_whirl()
	h._act_t = 0.12
	h._spun = 0.0
	var tend := func(dt: float, _now: float) -> void:
		if next[0] <= 1e-9:
			fx.event(h._vast_edge(r, rad, {"t": "burst", "x": h.world.x, "y": h.world.y, "r": rad, "el": "phys", "style": "whirl", "words": h.loadout.fronts(1), "n": 0, "echo": false}))
			next[0] += 0.3
		next[0] -= dt
		h._spun += dt
		h._act_t += dt
		h._show()
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var rings: Array = w10.acts.filter(func(a): return a["kind"] == "ring")
		var said := "his Whirlwind's turns (Vast in front: %.2f wide, from %.2f), its rings: %s" % [rad, rad / float(r["wide"]), ", ".join(rings.map(func(a): return "%.2f s in" % a["t"]))]
		# (a turn every 0.3 s, a ring at a time: a new one only once the last is winding down, 0.45 s in)
		await _pic("vast_front_whirlwind", rings.size() == 1 and d[0] > 0 and d[1] > 0, said)
	h._end_act()


func _vast_burst(kind: String, beats: Array) -> void:
	var i := 0 if kind == "splash" else 2
	await _begin(i, ["power", "vast"] if kind == "splash" else ["vast"], [])
	var r: Dictionary = h.loadout.r(i)
	var at: Vector2 = M._w_pack[0].world if kind == "splash" else _home + _face * 2.0
	var rad: float = float(r["splash"]) * float(r["size"]) if kind == "splash" else 1.6 * float(r["size"])
	var e: Dictionary = h._vast_edge(r, rad, {"t": "burst", "x": at.x, "y": at.y, "r": rad, "el": "phys", "style": "shock" if kind == "splash" else "land", "words": h.loadout.fronts(i), "n": 0, "echo": false})
	fx.event(e)
	if kind == "splash":
		fx.event({"t": "hit", "x": at.x, "y": at.y, "amount": 40, "el": "phys", "heavy": true, "words": h.loadout.fronts(i)})
	var tend := func(_dt: float, _now: float) -> void:
		pass
	var life: float = W10.life("vast:front")
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var said := "his %s (Vast in front, %s): %.2f wide, its edge without the word %.2f" % ["Strike's splash" if kind == "splash" else "Lunge's landing", ", ".join(h.loadout.fronts(i)), rad, e.get("r0", 0.0)]
		var ok: bool = (d[0] > 0 and d[1] > 0 and w10.acts.size() == 1) if _t < life else (w10.acts.is_empty() and d[0] + d[1] == 0)
		await _pic("vast_front_" + kind, ok, said)


# --- Vast behind: a hit splashed onto those near it (hero.gd hit_monster: its `vastSplash`) ---

func _vast_behind(beats: Array) -> void:
	await _begin(0, [], ["vast"])
	var a: Monster = M._w_pack[0]
	var reach: float = Words.data()["vast"]["splashR"]
	var ids: Array = []
	for o in M._w_pack:
		if o != a and o.world.distance_to(a.world) <= reach + o.r:
			ids.append(o.id)
	fx.event({"t": "hit", "x": a.world.x, "y": a.world.y, "amount": 40, "el": "phys", "words": []})
	fx.event({"t": "vastSplash", "x": a.world.x, "y": a.world.y, "r": reach, "ids": ids, "el": "phys"})
	var tend := func(_dt: float, _now: float) -> void:
		pass
	var life: float = W10.life("vast:behind")
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var to: Array = w10.acts[0]["to"] if not w10.acts.is_empty() else []
		var said := "a hit on A splashed (Vast behind) on the %d near it within %.1f, a rock to each" % [ids.size(), reach]
		var ok: bool = (d[1] > 0 and to.size() == ids.size() and ids.size() >= 1) if _t < life else (w10.acts.is_empty() and d[0] + d[1] == 0)
		await _pic("vast_behind", ok, said)


# --- a monster carrying Vast: its warning widened by its own rule (perils.gd warn) ---

func _vast_warn(beats: Array) -> void:
	await _begin(0, [], [])
	var dm: Monster = M._w_pack[3]
	dm.words = ["vast"]
	var at: Vector2 = _home + _face * 2.6 - _side * 0.6
	M._monsters.perils.warn(at.x, at.y, 1.25, 0.9, 0.0, dm)
	var p: Dictionary = M._monsters.perils.list.back()
	var tend := func(dt: float, _now: float) -> void:
		if M._monsters.perils.list.has(p):
			p["t"] += dt
			if p["t"] >= p["dur"]:
				M._monsters.perils.list.erase(p)
		M._monsters.perils.queue_redraw()
	for b in beats:
		await _to(b, tend)
		var d := _dots()
		var lies: bool = M._monsters.perils.list.has(p)
		var said := "a skeleton's warning carrying Vast, %.2f round (1.25 without the word), %.2f of its %.2f s" % [p["r"], p["t"], p["dur"]]
		await _pic("vast_monster", (d[0] > 0 and d[1] > 0) if lies else d[0] + d[1] == 0, said if lies else "its warning gone, struck")


# =====================================================================================================================
# At work: the rules running

func _at_work() -> void:
	_hand(false)
	# A STRIKE WITH VAST IN FRONT AND BEHIND (Power too, for its splash): wider, and a quarter of each hit splashed on those near
	M._w_put(h, 0, "front", ["power", "vast"])
	h.loadout.put(0, "behind", "vast")
	M._w_reset(h)
	fx.clear()
	await M._wait(0.3)
	await M._w_strike(h)
	var acts := _acts()
	var bursts: Dictionary = fx.last.get("burst", {})
	await M._wait(0.12)
	await _work("work_strike_vast", w10.acts.size() >= 2 and bursts.has("r0") and fx.seen.get("vastSplash", 0) >= 1,
		"\"%s\": the rules told a burst %.2f wide (its edge without Vast %.2f) and %d splash(es); the look made: %s" % [h.loadout.r(0)["name"], bursts.get("r", 0.0), bursts.get("r0", 0.0), fx.seen.get("vastSplash", 0), acts])
	await M._wait(0.3)
	await _work("work_strike_vast_after", true, "0.4 s on: " + _acts())
	# THE WHIRLWIND WITH LASTING AND FLAME, held to its end: its sand-light, and the burning ground it leaves dune over
	M._w_put(h, 1, "front", ["lasting"])
	h.loadout.put(1, "behind", "fire")
	M._w_reset(h)
	fx.clear()
	await M._wait(0.3)
	await M._w_whirl_begin(h)
	h.auto_whirl = true
	var t0 := Time.get_ticks_msec()
	await M._wait(1.0)
	await _work("work_whirl_lasting_fire", not h.channel().is_empty() and w10.held.size() >= 2, "held %.2f s: its looks held %s; patches %d" % [h._spun, w10.held.keys(), M.wakes.list.size()])
	# (what the effects cost a frame now, with Lasting's patches and its spin at once)
	var cost: String = await _cost(30)
	await M._w_until(func() -> bool: return h._spun >= 3.0 or h.channel().is_empty(), 4.0)
	await _work("work_whirl_lasting_fire_long", not h.channel().is_empty() and h._spun > 2.4, "held %.2f s, in the half again Lasting gave it: its looks held %s" % [h._spun, w10.held.keys()])
	await M._w_until(func() -> bool: return h.channel().is_empty(), 3.0)
	await M._wait(0.12)
	await _work("work_whirl_lasting_fire_let_go", w10.acts.any(func(a): return a["what"] == "drift"), "run its length (%.1f s from its start): %s" % [(Time.get_ticks_msec() - t0) / 1000.0, _acts()])
	h.auto_whirl = false
	await M._wait(2.5)
	await _work("work_burning_ground_lasting", M.wakes.list.size() > 0, "its burning ground lying on, %d patches: %s" % [M.wakes.list.size(), ", ".join(M.wakes.list.map(func(z): return "%.1f of %.1f s" % [z["t"], z["dur"]]))])
	# THE WHIRLWIND WITH FLEETING AND VAST: quickened, its turns' dust rolled out wider
	M._w_put(h, 1, "front", ["fleeting", "vast"])
	M._w_reset(h)
	fx.clear()
	await M._wait(0.3)
	await M._w_whirl_begin(h)
	h.auto_whirl = true
	await M._wait(0.5)
	await _work("work_whirl_fleeting_vast", not h.channel().is_empty() and _ghosts() == 2 and w10.acts.any(func(a): return a["kind"] == "ring"), "held %.2f s: %s; after-images %d" % [h._spun, _acts(), _ghosts()])
	h.auto_whirl = false
	await M._w_until(func() -> bool: return h.channel().is_empty(), 3.0)
	await M._wait(0.08)
	await _work("work_whirl_fleeting_vast_let_go", w10.acts.any(func(a): return a["what"] == "sparks"), "let go: " + _acts())
	# A SKELETON CARRYING POISON AND LASTING STRIKES HIM: its poison on him lingers, in the enemy's pink and gold
	M._w_put(h, 0, "front", [])
	M._w_reset(h)
	fx.clear()
	h.dot_by = {}
	var a: Monster = M._w_pack[0]
	a.words = ["poison", "lasting"]
	a.harm_hero(h, 8.0)
	await M._wait(0.5)
	await _work("work_poisoned_lasting", h.poison_t > 0.0 and h.dot_by.get("word", "") == "lasting" and w10.since.has("him"), "its poison on him %.2f s left (game: 4 s and half again, 6), whose: %s" % [h.poison_t, h.dot_by])
	a.words = []
	# A SKELETON CARRYING VAST WARNS OF ITS BLOW: its own rule widens it, and its look rolls the pink dust out to it
	var dm: Monster = M._w_pack[3]
	dm.words = ["vast"]
	var at: Vector2 = _home + _face * 2.6
	M._monsters.perils.warn(at.x, at.y, 1.25, 0.9, 0.0, dm)
	await M._wait(0.3)
	await _work("work_warning_vast", w10._warns == 1, "its warning %.2f round (1.25 without the word)" % float(M._monsters.perils.list.back()["r"]) if not M._monsters.perils.list.is_empty() else "its warning gone")
	dm.words = []
	await M._wait(1.0)
	h.poison_t = 0.0
	# ALL AT ONCE: the Whirlwind with Lasting and Vast in front and Flame behind (its sand, its rings, its burning ground), and a
	# skeleton carrying Vast warning of its blow, held to its end: what the effects cost a frame then
	M._w_put(h, 1, "front", ["lasting", "vast"])
	h.loadout.put(1, "behind", "fire")
	M._w_reset(h)
	fx.clear()
	await M._wait(0.3)
	await M._w_whirl_begin(h)
	h.auto_whirl = true
	dm.words = ["vast"]
	M._monsters.perils.warn(at.x - 1.0, at.y, 1.25, 2.0, 0.0, dm)
	await M._wait(0.6)
	await _work("work_all_at_once", not h.channel().is_empty() and w10.acts.any(func(a): return a["kind"] == "ring") and w10._warns == 1, "held %.2f s: %s; held %s" % [h._spun, _acts(), w10.held.keys()])
	var heavy: String = await _cost(45)
	h.auto_whirl = false
	await M._w_until(func() -> bool: return h.channel().is_empty(), 4.0)
	dm.words = []
	await M._wait(0.5)
	# (and what the effects cost a frame with nothing of these words to show)
	M._w_reset(h)
	fx.clear()
	await M._wait(0.5)
	var idle: String = await _cost(60)
	print("LOOKS10 COST: the effects a frame (update, drawing): with nothing of the three words %s; with Lasting's spin and its burning ground %s; with the Whirlwind with Lasting, Vast and Flame and a Vast warning, all at once, %s" % [idle, cost, heavy])


func _work(name: String, ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(name)
	var d := _dots()
	await RenderingServer.frame_post_draw
	var img: Image = M.get_viewport().get_texture().get_image()
	img.get_region(Rect2i(240, 60, 480, 360)).save_png("%s/l%02d_%s.png" % [dir, n, name])
	print("LOOKS10 %02d %s %s: %s; drawn %d dots on the floor, %d over the figures; after-images %d" % [n, name, "OK" if ok else "WRONG", what, d[0], d[1], _ghosts()])


## What the effects cost a frame over `frames` frames, milliseconds: "update U, drawing D".
func _cost(frames: int) -> String:
	fx.timing = true
	fx.cost_update = 0
	fx.cost_draw = 0
	fx.cost_frames = 0
	w10.cost_update = 0
	w10.cost_paint = 0
	for i in frames:
		await M.get_tree().process_frame
	fx.timing = false
	var f := float(maxi(1, fx.cost_frames))
	return "update %.3f ms, drawing %.3f ms (of which these looks' own: reading and ticking %.3f ms, painting %.3f ms)" % [fx.cost_update / 1000.0 / f, fx.cost_draw / 1000.0 / f, w10.cost_update / 1000.0 / f, w10.cost_paint / 1000.0 / f]
