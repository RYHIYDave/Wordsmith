## THE CHECK OF VOLATILE'S FIVE MELDS' AND THE EIGHT MELDS' LOOKS IN THE FIGHT (--only=looks_volatile; main.gd sends it here): on
## floor 2, in the hall the words' check gathers its pack of six skeletons in (main.gd _w_find, _w_reset: A before him, B and C
## beside it, D and E further off), each of the thirteen at work by the rules themselves (his moves made as he makes them, the rules
## telling what happened, fx_volatile3.gd and fx_melds8.gd showing it; the setups check_melds.gd's), pictured at its beats, a line a
## picture: what the rules did, what the looks keep then, how many of their fills lie on the floor, in the air and over the sparks,
## and whether that is what they should be showing then (OK or WRONG).
##   IN FRONT of his Strike, A killed: Demolition's great blast (and an elite struck to half its life bursting), Powderkeg's on a
##     burning one with the pieces it throws catching, Shatter's shards off a frozen one, Chain Reaction's arcs to the nearest,
##     Rupture's splash off a poisoned one.
##   BEHIND his Strike: the rune each leaves, as it waits and as it goes off, and what it leaves (Powderkeg's burning ground,
##     Shatter's freezing first, Chain Reaction's two runes set off together, Rupture's cloud).
##   THE EIGHT, in front and behind (behind half as strong): Siphon's beads of poison drawn to him, Cauterize's brand, Forking's bolt,
##     Shiver's cross-hairs, Sunder's crack and a blow on it, Fervor's embers and flames, Rime Ward's pane, Implode's vortex and burst.
##   WHAT IT COSTS: the effects a frame with nothing of the thirteen, and at the heaviest (every rune at once, big, the ground and
##     the cloud, the five blasts, Fervor at its most, an implosion): its line, LOOKS_VOLATILE COST.
## Then the sum, LOOKS_VOLATILE.
extends RefCounted

const Monster := preload("res://scripts/monster.gd")
const Words := preload("res://scripts/words.gd")
const V3 := preload("res://scripts/fx_volatile3.gd")
const M8 := preload("res://scripts/fx_melds8.gd")
const CheckMelds := preload("res://scripts/check_melds.gd")

var M  # main.gd
var h  # hero.gd
var fx
var v3
var m8
var cm  # check_melds.gd: its setups
var dir := ""
var n := 0
var bad: Array = []
var _home := Vector2.ZERO
var _face := Vector2(1, 0)
var _side := Vector2(0, 1)
var _t0 := 0


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor2", "down")
	await M._wait(1.4)
	fx = M.fx
	v3 = fx.v3
	m8 = fx.m8
	cm = CheckMelds.new(M, h)
	# (each look pictured at its own moment: the heavy blows do not hold the game still here)
	fx.holds = false
	if M.sight != null:
		M.sight.see_all()
	h.walked = 5.0
	if not M._w_find():
		print("LOOKS_VOLATILE: no hall on floor 2 has room for the pack")
		return
	var first: Monster = M._nearest_kind(M._w_home, "skeleton", 0.0)
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "skeleton" and not m.elite and not m.boss:
			near.append(m)
	if first == null or near.size() < 6:
		print("LOOKS_VOLATILE: floor 2 has no pack of skeletons to gather")
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
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	await M._wait(0.6)
	print("LOOKS_VOLATILE begin: floor 2, he at %s facing %s, the pack A to F before him" % [_home, _face])
	var only: String = M._arg("case")
	var want := func(k: String) -> bool: return only == "" or k.begins_with(only)
	for w in V3.IDS:
		if want.call("front_" + w):
			await _front(w)
	for w in V3.IDS:
		if want.call("behind_" + w):
			await _behind(w)
	for w in M8.IDS:
		for side in ["front", "behind"]:
			if want.call("%s_%s" % [side, w]):
				await _eight(w, side)
	if want.call("cost"):
		await _cost_case()
	h.stats["life_regen"] = regen
	cm._clean()
	print("LOOKS_VOLATILE: %d pictures of Volatile's five melds' and the eight melds' looks, %d as each should be then%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + ", ".join(bad)])


# =====================================================================================================================

## A case begun: `w` set on his Strike, in front or behind (check_melds.gd _put: the pack whole and where it stands, what the words
## leave gone), the effects emptied.
func _begin(side: String, w: String) -> Dictionary:
	var r: Dictionary = cm._put(side, [w])
	h.life = h.max_life
	fx.clear()
	await M._wait(0.3)
	fx.seen = {}
	fx.last = {}
	_t0 = Time.get_ticks_msec()
	return r


## How many fills the looks lay on the floor, in the air and over the sparks now (the five's three layers, the eight's two).
func _dots() -> Array:
	var out: Array = []
	var clock: float = v3.clock
	for layer in 5:
		var lines: Array = []
		if layer < 3:
			v3._rec = lines
			if layer == 0:
				v3.draw_floor(null, clock)
			elif layer == 1:
				v3.draw_air(null, clock)
			else:
				v3.draw_over(null, clock)
			v3._rec = null
		else:
			m8._rec = lines
			if layer == 3:
				m8.draw_ground(null)
			else:
				m8.draw_air(null)
			m8._rec = null
		out.append(lines.size())
	return out


## What the looks keep now, said.
func _kept() -> String:
	var runes := PackedStringArray()
	for z: Dictionary in M.wakes.list:
		if V3.owns_zone(z):
			runes.append("%s %s %.1f/%.1f" % [z["kind"], z.get("meld", "-"), z["t"], z["dur"]])
	var ids := PackedStringArray()
	for b: Dictionary in m8.beats:
		ids.append(str(b.get("id", "?")))
	return "the five's: ground [%s]; domes %d, arcs %d, lobs %d, pillars %d, spears %d, spikes %d, scars %d, jolts %d, freezes %d, marks %d, to come %d; the eight's: beats [%s], bits %d; particles %d" % [
		", ".join(runes), v3.domes.size(), v3.arcs.size(), v3.lobs.size(), v3.pillars.size(), v3.spears.size(), v3.spikes.size(), v3.scars.size(),
		v3.jolts.size(), v3.freezes.size(), v3.marks.size(), v3.later.size(), ", ".join(ids), m8.bits.size(), fx.pn]


## A picture of the case at its moment, and its line: `ok` whether it is what the looks should be showing then.
func _pic(name: String, ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(name)
	var d := _dots()
	await RenderingServer.frame_post_draw
	var img: Image = M.get_viewport().get_texture().get_image()
	img.get_region(Rect2i(240, 60, 480, 360)).save_png("%s/v%02d_%s.png" % [dir, n, name])
	print("LOOKS_VOLATILE %02d %s +%.2f s %s: %s; the looks keep %s; drawn %d fills on the floor, %d in the air, %d over the sparks (the five's), %d on the floor and %d in the air (the eight's)" % [
		n, name, (Time.get_ticks_msec() - _t0) / 1000.0, "OK" if ok else "WRONG", what, _kept(), d[0], d[1], d[2], d[3], d[4]])


func _seen(t: String) -> int:
	return int(fx.seen.get(t, 0))


func _told(t: String, key: String, val: String) -> bool:
	return str(fx.last.get(t, {}).get(key, "")) == val


func _beat(id: String) -> bool:
	for b: Dictionary in m8.beats:
		if b.get("id", "") == id:
			return true
	return false


func _runes(w: String) -> Array:
	return M.wakes.list.filter(func(z): return z["kind"] == "rune" and z.get("meld") == w)


# --- VOLATILE'S FIVE, IN FRONT: what his Strike kills goes off ---

func _front(w: String) -> void:
	await _begin("front", w)
	var a = cm._victim()
	var setup := ""
	match w:
		"powderkeg":
			a.set_alight(5.0, 4.0)
			setup = ", burning"
		"shatter":
			a.chill_t = 2.0
			a.chill = 0.3
			setup = ", chilled (his frost freezes it)"
		"rupture":
			a.poison_t = 3.0
			a.poison_dps = 50.0
			a.poison_n = 1
			setup = ", poisoned"
	await M._w_strike(h)
	var dead: bool = a.dead
	# (the blast a moment after the kill: melds.gd explode)
	await M._wait(0.14)
	var ok: bool = dead and _told("burst", "meld", w) and not v3.domes.is_empty()
	var said := "his Strike with %s in front kills A%s; it goes off %.2f round (the blast told %s)" % [w.to_upper(), setup, float(fx.last.get("burst", {}).get("r", 0.0)), fx.last.get("burst", {}).get("meld", "-")]
	match w:
		"powderkeg":
			ok = ok and _told("volFx", "what", "catch") and not v3.lobs.is_empty()
			said += "; burning pieces thrown onto those it struck (told %d)" % _seen("volFx")
		"shatter":
			ok = ok and _told("volFx", "what", "shard")
			said += "; A burst into shards at those round it (told %d)" % _seen("volFx")
		"chainreaction":
			ok = ok and _told("volFx", "what", "arc") and not v3.arcs.is_empty()
			said += "; arcs to the nearest (told %d)" % _seen("volFx")
		"rupture":
			ok = ok and _told("volFx", "what", "splash")
			said += "; its poison splashed on those round it (told %d)" % _seen("volFx")
	await _pic("front_%s_blast" % w, ok, said)
	await M._wait(0.2)
	await _pic("front_%s_after" % w, true, "0.35 s on")
	await M._wait(0.6)
	await _pic("front_%s_later" % w, true, "1 s on")
	if w == "demolition":
		# (an elite struck to half its life bursts, once)
		cm._clean()
		M._w_reset(h)
		fx.clear()
		await M._wait(0.3)
		fx.seen = {}
		fx.last = {}
		_t0 = Time.get_ticks_msec()
		var e = M._w_pack[0]
		e.elite = true
		e.max_life = 1000.0
		e.life = 500.0 + cm._hit() * 0.5
		await M._w_strike(h)
		await M._wait(0.05)
		await _pic("front_demolition_half", e.demolished and _told("volFx", "what", "half"), "an elite struck to half its life: it bursts, once (demolished %s, told %s)" % [e.demolished, fx.last.get("volFx", {}).get("what", "-")])
		await M._wait(0.2)
		await _pic("front_demolition_half_blast", _told("burst", "meld", "demolition") and not v3.domes.is_empty(), "its blast, half as hard")
		e.elite = false


# --- VOLATILE'S FIVE, BEHIND: the rune each leaves ---

func _behind(w: String) -> void:
	await _begin("behind", w)
	await M._w_strike(h)
	await M._wait(0.05)
	var runes := _runes(w)
	var g: Dictionary = runes[0] if runes.size() >= 1 else {}
	var wait: float = g.get("dur", 1.2)
	await _pic("behind_%s_laid" % w, runes.size() == 1, "his Strike with %s behind leaves its rune, %.2f round, going off in %.1f s (%d laid)" % [w.to_upper(), float(g.get("r", 0.0)), wait, runes.size()])
	if w == "chainreaction":
		await cm._hold(0.3)
		await M._w_strike_again(h)
		await M._wait(0.05)
		await _pic("behind_chainreaction_two", _runes(w).size() == 2, "a second Strike: a second rune, linked to the first (%d lie)" % _runes(w).size())
		var t := 0.0
		while t < wait and not _runes(w).is_empty() and _seen("volFx") == 0:
			M._monsters._dot_t = 1.0
			await M.get_tree().process_frame
			t += M.get_process_delta_time()
		await M._wait(0.03)
		await _pic("behind_chainreaction_link", _told("volFx", "what", "link") and _told("burst", "meld", "chainreaction"), "the first goes off and sets off the second (link told %d, the blast %s)" % [_seen("volFx"), fx.last.get("burst", {}).get("style", "-")])
		await cm._hold(0.12)
		await _pic("behind_chainreaction_second", true, "the second going off")
		await cm._hold(0.6)
		await _pic("behind_chainreaction_after", true, "0.7 s on")
		return
	if w == "shatter":
		var S: Dictionary = Words.data()["melds"]["tune"]["shatter"]
		await cm._hold(wait * float(S["freezeAt"]))
		await _pic("behind_shatter_freezes", _told("volFx", "what", "freeze") and not v3.freezes.is_empty(), "%.0f%% through its wait it freezes what is near (told %s)" % [float(S["freezeAt"]) * 100.0, fx.last.get("volFx", {}).get("what", "-")])
	else:
		await cm._hold(wait * 0.5 - 0.05)
		await _pic("behind_%s_waiting" % w, _runes(w).size() == 1, "half its wait: the rune at work")
	var t2 := 0.0
	while t2 < wait + 0.5 and not _runes(w).is_empty():
		M._monsters._dot_t = 1.0
		await M.get_tree().process_frame
		t2 += M.get_process_delta_time()
	await M._wait(0.03)
	var ok: bool = _runes(w).is_empty() and _told("burst", "meld", w) and _told("burst", "style", "ruin")
	var said := "its time out, it goes off (a burst %s of %s)" % [fx.last.get("burst", {}).get("style", "-"), fx.last.get("burst", {}).get("meld", "-")]
	await _pic("behind_%s_goes_off" % w, ok, said)
	await cm._hold(0.3)
	var left := true
	var what := "0.35 s on"
	if w == "powderkeg":
		left = M.wakes.list.any(func(z): return z["kind"] == "burn" and z.get("meld") == "powderkeg" and float(z["t"]) < 0.5)
		what += ": the burning ground it leaves"
	elif w == "rupture":
		left = M.wakes.list.any(func(z): return z["kind"] == "venom" and z.get("meld") == "rupture")
		what += ": the poison cloud it bursts into"
	await _pic("behind_%s_after" % w, left, what)
	await cm._hold(1.0)
	await _pic("behind_%s_later" % w, true, "1.35 s on")


# --- THE EIGHT ACROSS THE GROUPS, in front and behind ---

func _eight(w: String, side: String) -> void:
	await _begin(side, w)
	var a = M._w_pack[0]
	var name := "%s_%s" % [side, w]
	var k8 := "in front" if side == "front" else "behind (half as strong)"
	match w:
		"siphon":
			h.life = h.max_life * 0.5
			await M._w_strike(h)
			if side == "behind":
				# (the cloud's first bite poisons A)
				await cm._hold(0.3)
			M._monsters._dot_t = 0.0
			await M.get_tree().process_frame
			await M._wait(0.1)
			await _pic(name + "_drawn", _told("meld8", "id", "siphon") and _beat("siphon"), "his Strike with SIPHON %s poisons A; a bite of its poison heals him (told %d)" % [k8, _seen("meld8")])
			await M._wait(0.35)
			await _pic(name + "_landed", true, "0.45 s on: the beads landing on him")
		"cauterize":
			var v = cm._victim()
			v.burn_t = 2.0
			v.burn_dps = 0.001
			h.life = h.max_life * 0.4
			await M._w_strike(h)
			await M._wait(0.08)
			await _pic(name + "_flash", v.dead and _told("meld8", "id", "cauterize") and _beat("cauterize"), "his Strike with CAUTERIZE %s kills A, burning: its fire torn off it and thrown at him" % k8)
			await M._wait(0.35)
			await _pic(name + "_brand", true, "0.45 s on: the brand on him")
		"forking":
			await M._w_strike(h)
			await M._wait(0.03)
			await _pic(name + "_bolt", _told("meld8", "id", "forking") and _beat("forking"), "his Strike with FORKING %s: a bolt from A to the nearest other (told %d)" % [k8, _seen("meld8")])
			await M._wait(0.25)
			await _pic(name + "_after", true, "0.3 s on")
		"shiver":
			h.stats["crit_chance"] = 100.0
			await M._w_strike(h)
			await M._wait(0.05)
			await _pic(name + "_frozen", _told("meld8", "id", "shiver") and _beat("shiver") and a.frozen_t > 0.0, "his Strike with SHIVER %s, a critical hit: A frozen %.2f s" % [k8, a.frozen_t])
			await M._wait(0.3)
			await _pic(name + "_after", true, "0.35 s on")
			h.stats["crit_chance"] = 0.0
		"sunder":
			a.stun_for(2.0)
			await M._w_strike(h)
			await M._wait(0.05)
			await _pic(name + "_crack", _told("meld8", "id", "sunder") and _beat("sunder"), "his Strike with SUNDER %s on A, stunned: its crack, burning red while the stun lasts" % k8)
			var n0 := _seen("meld8")
			a.damage(100.0, "phys", false, false, [], false, false, -1)
			await M._wait(0.05)
			await _pic(name + "_blow", _seen("meld8") > n0 and _told("meld8", "what", "hit"), "a blow on it while stunned: the crack flaring, chips bursting out")
			await M._wait(0.4)
			await _pic(name + "_after", true, "0.45 s on")
		"fervor":
			cm._victim()
			await M._w_strike(h)
			await M._wait(0.1)
			var n1: float = h.melds.fervor_n
			await _pic(name + "_kill", _told("meld8", "id", "fervor") and _beat("fervor"), "his Strike with FERVOR %s kills A: its embers streaming to him (fervor %.1f)" % [k8, h.melds.fervor_n])
			await M._wait(0.5)
			await _pic(name + "_flames", true, "0.6 s on: the flames round his feet while it lasts")
			# (toward its most: kill after kill, A up again for each)
			for q in 3:
				a.dead = false
				a._dead_for = 0.0
				a.modulate.a = 1.0
				a._set_list("idle", true)
				a.world = M._w_spot(0)
				# (the ground his fire left would kill it first, and a kill by the ground is not his: game.ts meld8Struck)
				a.clear_afflictions()
				M.wakes.list.clear()
				cm._victim()
				await M._w_strike_again(h)
				await M._wait(0.05)
			await M._wait(0.2)
			await _pic(name + "_most", h.melds.fervor_n > n1 + 0.01, "more kills: fervor %.1f of %s, its flames more and higher" % [h.melds.fervor_n, Words.data()["melds"]["eightTune"]["fervor"]["most"]])
		"rimeward":
			h.stats["block_chance"] = 100.0
			h.unhurt = true
			var tries := 0
			a.chill_t = 0.0
			while tries < 60 and a.chill_t <= 0.0:
				tries += 1
				h._invuln = 0.0
				h.hurt_by(10.0, "phys", [], {}, a)
			await M._wait(0.06)
			await _pic(name + "_pane", _told("meld8", "id", "rimeward") and _beat("rimeward"), "with RIME WARD %s, a blow of A's blocked (after %d): the pane of rime between them, A chilled %.2f s" % [k8, tries, a.chill_t])
			await M._wait(0.35)
			await _pic(name + "_rime", true, "0.4 s on: rime on it while it is chilled")
			h.stats["block_chance"] = 0.0
			h.unhurt = false
		"implode":
			await M._w_strike(h)
			await M._wait(0.05)
			await _pic(name + "_vortex", _told("meld8", "id", "implode") and _beat("implode"), "his Strike with IMPLODE %s: the vortex, those near drawn toward its heart" % k8)
			var I: Dictionary = Words.data()["melds"]["eightTune"]["implode"]
			await cm._hold(float(I["wait"]))
			await M._wait(0.03)
			await _pic(name + "_burst", _told("burst", "meld", "implode"), "%.1f s on: the burst there" % float(I["wait"]))
			await M._wait(0.3)
			await _pic(name + "_after", true, "0.35 s after")


# --- WHAT IT COSTS ---

func _cost(frames: int) -> String:
	fx.timing = true
	fx.cost_update = 0
	fx.cost_draw = 0
	fx.cost_frames = 0
	for i in frames:
		await M.get_tree().process_frame
	fx.timing = false
	var f := float(maxi(1, fx.cost_frames))
	return "update %.3f ms, drawing %.3f ms" % [fx.cost_update / 1000.0 / f, fx.cost_draw / 1000.0 / f]


func _cost_case() -> void:
	await _begin("front", "demolition")
	var idle: String = await _cost(60)
	# every rune at once, big, round him; Powderkeg's ground and Rupture's cloud
	var k := 0
	for w in V3.IDS:
		var at: Vector2 = _home + _face * (2.0 + (k % 3) * 2.2) + _side * (-2.5 + int(k / 3) * 3.0)
		M.wakes.list.append({"kind": "rune", "x": at.x, "y": at.y, "r": 2.4 if w == "demolition" else 1.6, "t": 0.2, "dur": 30.0, "element": "phys", "dmg": 0.0, "slow": 0.0, "tick": 99.0, "skill": 0, "meld": w})
		k += 1
	var at2: Vector2 = _home - _face * 2.0
	M.wakes.list.append({"kind": "burn", "x": at2.x, "y": at2.y, "r": 2.0, "t": 0.3, "dur": 30.0, "element": "fire", "dmg": 0.0, "slow": 0.0, "tick": 99.0, "skill": 0, "meld": "powderkeg"})
	var at3: Vector2 = _home + _side * 2.5
	M.wakes.list.append({"kind": "venom", "x": at3.x, "y": at3.y, "r": 2.0, "t": 0.3, "dur": 30.0, "element": "poison", "dmg": 0.0, "slow": 0.0, "tick": 99.0, "skill": 0, "meld": "rupture"})
	M.wakes.queue_redraw()
	await M._wait(0.4)
	await _pic("cost_all_at_once", true, "the five's runes at once, big, Powderkeg's ground and Rupture's cloud")
	var many: String = await _cost(45)
	# and the five blasts, Fervor at its most, an implosion
	var j := 0
	for w in V3.IDS:
		var at: Vector2 = _home + _face * (2.0 + (j % 3) * 2.2) + _side * (-2.5 + int(j / 3) * 3.0)
		fx.event({"t": "burst", "x": at.x, "y": at.y, "r": 2.2, "el": "phys", "style": "blast", "words": ["volatile"], "meld": w})
		j += 1
	var E: Dictionary = Words.data()["melds"]["eightTune"]
	fx.event({"t": "meld8", "id": "fervor", "x": _home.x + 1.0, "y": _home.y, "n": int(E["fervor"]["most"]), "most": E["fervor"]["most"], "secs": E["fervor"]["secs"], "k": 1.0})
	fx.event({"t": "meld8", "id": "implode", "x": (_home + _face * 2.0).x, "y": (_home + _face * 2.0).y, "reach": E["implode"]["reach"], "r": E["implode"]["r"], "wait": E["implode"]["wait"], "k": 1.0})
	await M._wait(0.1)
	await _pic("cost_blasts", not v3.domes.is_empty() and _beat("implode"), "and the five blasts, Fervor at its most and an implosion in it")
	var heavy: String = await _cost(20)
	M.wakes.list.clear()
	print("LOOKS_VOLATILE COST: the effects a frame: with nothing of the thirteen %s; with the five's runes, ground and cloud at once %s; with the five blasts, Fervor at its most and an implosion in that %s" % [idle, many, heavy])
