## THE CHECK OF THE TEN MELDED WORDS' LOOKS (--only=looks_melds; main.gd sends it here): on floor 2, in the hall the words' check
## gathers its pack of six skeletons in (main.gd _w_find, _w_reset: A before him, B and C beside it, D and E further off), each of
## the ten at work by the rules themselves (his moves made as he makes them, the rules telling what happened, fx_melds3.gd showing
## it), pictured at its beats, a line a picture: what the rules did, what the look keeps then (its patches, bolts, the sky's bolts,
## bombs, scars, columns, jaws, slides, marks, his heat and charge, whether the steam hides him), how many of its dots lie on the
## floor, over the dark and over the sparks, and whether that is what the look should be showing then (OK or WRONG).
##   IN FRONT of his Strike, on A: each of the ten's hit and its twist (Scald on A burning, Fumes on A burning and poisoned).
##   BEHIND his Strike: what each leaves and its twist (Eruption's heat built to its eruption; Avalanche's crush on A chilled;
##     Thunder's hits to its clap; Scald's steam with him stood in it; Fumes' cloud with A burning in it; Wildfire's and
##     Contagion's patches at work).
##   AN AREA: his Lunge landing with Eruption in front (its jets round the ring); his Whirlwind's turns with Thunder in front.
##   THE RANKED WORDS: Power II in front and Flame II behind: told and drawn as Power's and Flame's.
##   WHAT IT COSTS: the effects a frame with nothing of the ten, and at the heaviest (every patch's look at once, big, his heat
##     and charge, an eruption and a thunderclap): its line, LOOKS_MELDS COST.
## Then the sum, LOOKS_MELDS.
extends RefCounted

const Monster := preload("res://scripts/monster.gd")
const Words := preload("res://scripts/words.gd")
const M3 := preload("res://scripts/fx_melds3.gd")

var M  # main.gd
var h  # hero.gd
var fx
var m3
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
	m3 = fx.m3
	# (each look pictured at its own moment: the heavy blows do not hold the game still here)
	fx.holds = false
	if M.sight != null:
		M.sight.see_all()
	h.walked = 5.0
	if not M._w_find():
		print("LOOKS_MELDS: no hall on floor 2 has room for the pack")
		return
	var first: Monster = M._nearest_kind(M._w_home, "skeleton", 0.0)
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "skeleton" and not m.elite and not m.boss:
			near.append(m)
	if first == null or near.size() < 6:
		print("LOOKS_MELDS: floor 2 has no pack of skeletons to gather")
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
	print("LOOKS_MELDS begin: floor 2, he at %s facing %s, the pack A to F before him" % [_home, _face])
	var only: String = M._arg("case")
	var want := func(k: String) -> bool: return only == "" or k.begins_with(only)
	for w in M3.TEN:
		if want.call("front_" + w):
			await _front(w)
	for w in M3.TEN:
		if want.call("behind_" + w):
			await _behind(w)
	if want.call("area"):
		await _area()
	if want.call("ranked"):
		await _ranked()
	if want.call("cost"):
		await _cost_case()
	print("LOOKS_MELDS: %d pictures of the ten melded words' looks, %d as each should be then%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + ", ".join(bad)])


# =====================================================================================================================

## A case begun: his words set on move `i` (front, behind), the pack whole, nothing on it, the effects emptied.
func _begin(i: int, front: Array, behind: Array) -> void:
	M._w_put(h, i, "front", front)
	for w in behind:
		h.loadout.put(i, "behind", w)
	M._w_reset(h)
	for m in M._w_pack:
		m.clear_afflictions()
		m.words = []
		m.last_skill = -1
	h.melds.heat = [0, 0, 0]
	h.melds.hits = [0, 0, 0]
	h.melds.implosions = []
	fx.clear()
	await M._wait(0.3)
	_t0 = Time.get_ticks_msec()


## How many of the look's dots lie on the floor, over the dark and over the sparks now, and how many ovals it fills.
func _dots() -> Array:
	var out: Array = []
	var ovals := 0
	for layer in 3:
		m3._rec = {}
		m3._ovals = []
		if layer == 0:
			m3.draw_floor(null)
		elif layer == 1:
			m3.draw_air(null)
		else:
			m3.draw_over(null)
		out.append(m3._rec.size())
		ovals += m3._ovals.size()
	m3._rec = null
	m3._ovals = null
	out.append(ovals)
	return out


## What the look keeps now, said.
func _kept() -> String:
	var looks := PackedStringArray()
	for z: Dictionary in M.wakes.list:
		var l := M3.look_of(z)
		if l != "":
			looks.append("%s %.1f/%.1f" % [l, z["t"], z["dur"]])
	var mk := PackedStringArray()
	for k in m3.marks:
		var q: Dictionary = m3.marks[k]
		var s := ""
		if q["thunder"] > 0.0:
			s += "stunned %.2f " % q["thunder"]
		if q["blight"]:
			s += "rotting "
		if q["crush"] < 0.12:
			s += "crushed "
		if q["bite"] >= 0:
			s += "bitten "
		if s != "":
			mk.append(s.strip_edges())
	return "patches [%s]; bolts %d, sky bolts %d, bombs %d, scars %d, columns %d, jaws %d, slides %d, marks [%s]; heat %d, charge %d%s; particles %d" % [
		", ".join(looks), m3.bolts.size(), m3.skies.size(), m3.bombs.size(), m3.scars.size(), m3.columns.size(), m3.clamps.size(), m3.slides.size(), ", ".join(mk),
		m3.heat, m3.claps, ", hidden in the steam (drawn %.2f solid)" % m3.hero_alpha() if m3.hidden else "", fx.pn]


func _owned(look: String) -> bool:
	for z: Dictionary in M.wakes.list:
		if M3.look_of(z) == look:
			return true
	return false


## A picture of the case at its moment, and its line: `ok` whether it is what the look should be showing then.
func _pic(name: String, ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(name)
	var d := _dots()
	await RenderingServer.frame_post_draw
	var img: Image = M.get_viewport().get_texture().get_image()
	img.get_region(Rect2i(240, 60, 480, 360)).save_png("%s/m%02d_%s.png" % [dir, n, name])
	print("LOOKS_MELDS %02d %s +%.2f s %s: %s; the look keeps %s; drawn %d dots on the floor, %d over the dark, %d over the sparks, %d ovals" % [n, name, (Time.get_ticks_msec() - _t0) / 1000.0,
		"OK" if ok else "WRONG", what, _kept(), d[0], d[1], d[2], d[3]])


func _seen(t: String) -> int:
	return int(fx.seen.get(t, 0))


func _told_meld(t: String, meld: String) -> bool:
	var e: Dictionary = fx.last.get(t, {})
	return e.get("meld", "") == meld


# --- IN FRONT ---

func _front(w: String) -> void:
	await _begin(0, [w], [])
	var a: Monster = M._w_pack[0]
	# (what its twist needs first: Scald one burning, Fumes one burning and poisoned)
	if w == "scald":
		a.set_alight(5.0, 4.0)
	elif w == "fumes":
		a.set_alight(5.0, 4.0)
		a.dose(4.0, 4.0)
	await M._w_strike(h)
	var hit: Dictionary = fx.last.get("hit", {})
	var said := "his Strike with %s in front: hit A for %s%s" % [w.to_upper(), hit.get("amount", "-"), (" (" + ", ".join(hit.get("words", [])) + ")") if hit.has("words") else ""]
	await M._wait(0.03)
	var ok := true
	match w:
		"eruption":
			ok = _owned("molten")
			said += "; its molten pool laid"
		"avalanche":
			ok = not m3.slides.is_empty() or _seen("meldFx") > 0
			said += "; A shoved %s" % ("(slid)" if not m3.slides.is_empty() else "(not)")
		"thunder":
			ok = not m3.skies.is_empty() and _told_meld("arc", "thunder")
			said += "; the bolt from the sky in place of the arcs, A stunned %.2f s" % a.stun_t
		"blight":
			ok = m3.marks.has(a.get_instance_id()) and m3.marks[a.get_instance_id()]["blight"]
			said += "; A marked to rot (poisoned %.1f s)" % a.poison_t
		"scald":
			# (the crack's burst is told before the hit's own splash: its sign the rules' wait before the next, scald_cd)
			ok = a.scald_cd > 0.0 and _seen("burst") >= 1
			said += "; A, burning and chilled, CRACKS (its next not for %.2f s)" % a.scald_cd
		"wildfire":
			ok = not m3.bolts.is_empty() and _told_meld("arc", "wildfire")
			said += "; its arcs set burning what they strike"
		"fumes":
			ok = _owned("fumes")
			said += "; A, burning and poisoned, gives off its toxic cloud"
		"hailstorm":
			ok = not m3.bolts.is_empty() and _told_meld("arc", "hailstorm")
			said += "; its arcs chill"
		"frostbite":
			ok = not m3.clamps.is_empty() and a.bite_dps > 0.0
			said += "; the jaws close on A, chilled, losing %.1f a second" % a.bite_dps
		"contagion":
			ok = not m3.bolts.is_empty() and _told_meld("arc", "contagion")
			said += "; its arcs poison"
	await _pic("front_%s_hit" % w, ok, said)
	await M._wait(0.15)
	await _pic("front_%s_after" % w, true, "0.2 s on")
	await M._wait(0.5)
	var lasting: bool = w in ["eruption", "fumes", "blight", "frostbite"]
	await _pic("front_%s_later" % w, not lasting or not m3.marks.is_empty() or _owned("molten") or _owned("fumes"), "0.7 s on%s" % (": what it left lying on" if lasting else ""))


# --- BEHIND ---

func _behind(w: String) -> void:
	await _begin(0, [], [w])
	var a: Monster = M._w_pack[0]
	var looks: Array = M3.TABLE[w].values()
	if w == "eruption":
		# (its heat built to one short of full: the next hit is full heat, and the one after erupts)
		h.melds.heat[0] = 4
		await M._wait(0.1)
		await _pic("behind_eruption_heat4", m3.heat == 4, "heat 4 of 5 at his feet, the embers circling him")
		await M._w_strike(h)
		await M._wait(0.05)
		await _pic("behind_eruption_full", m3.heat >= M3.HEAT_FULL and _owned("molten"), "his Strike: full heat (HEAT told %d), its molten ground laid" % _seen("text"))
		await M._wait(0.6)
		await M._w_strike_again(h)
		await M._wait(0.08)
		await _pic("behind_eruption_erupts", _told_meld("burst", "eruption") and not m3.columns.is_empty(), "the next hit ERUPTS round A: fissures, a column of lava, bombs flung")
		await M._wait(0.5)
		await _pic("behind_eruption_after", not m3.scars.is_empty(), "0.6 s on: the fissures cooling")
		return
	if w == "thunder":
		h.melds.hits[0] = 2
		await M._wait(0.1)
		await _pic("behind_thunder_charge", m3.claps == 2, "two hits toward its thunderclap, two balls of lightning circling his chest")
		await M._w_strike(h)
		await M._wait(0.05)
		await _pic("behind_thunder_ready", m3.claps == 3 and _owned("thunderhead"), "his Strike: one short of the clap, the balls going faster; its thunderhead laid")
		await M._wait(0.6)
		await M._w_strike_again(h)
		await M._wait(0.06)
		await _pic("behind_thunder_clap", _told_meld("burst", "thunder") and not m3.skies.is_empty(), "the fourth hit: a THUNDERCLAP round him, bolts down all round the ring")
		await M._wait(0.4)
		await _pic("behind_thunder_after", not m3.scars.is_empty(), "0.5 s on: the burnt stars")
		return
	if w == "avalanche":
		a.chill_t = 2.0
		a.chill = 0.4
	await M._w_strike(h)
	await M._wait(0.05)
	var ok := true
	for l in looks:
		ok = ok and _owned(l)
	var said := "his Strike with %s behind: %s laid" % [w.to_upper(), ", ".join(looks)]
	if w == "avalanche":
		ok = ok and m3.marks.has(a.get_instance_id()) and fx.last.get("meldFx", {}).get("what", "") == "crush"
		said += "; A, chilled, crushed (told %d)" % _seen("meldFx")
	if w == "blight":
		said += "; A touched (blighted %.1f s)" % a.blight_t
	await _pic("behind_%s_laid" % w, ok, said)
	if w == "scald":
		# he steps into his steam: nothing sees him, and he is drawn fainter
		var steam: Dictionary = {}
		for z: Dictionary in M.wakes.list:
			if z["kind"] == "steam":
				steam = z
		if not steam.is_empty():
			h.world = Vector2(steam["x"], steam["y"])
			h._place()
		await M._wait(0.3)
		await _pic("behind_scald_hidden", m3.hidden and M._monsters.hero_hidden(), "he stands in the steam: hidden (the monsters: %s), drawn %.2f solid" % [M._monsters.hero_hidden(), m3.hero_alpha()])
		return
	if w == "fumes":
		# A, burning, comes into the cloud: it goes up
		a.set_alight(5.0, 4.0)
		await M._wait(0.6)
		await _pic("behind_fumes_burning_in_it", true, "A burning in its cloud (told the explosion %s)" % _told_meld("burst", "fumes"))
		await M._wait(0.6)
		await _pic("behind_fumes_later", true, "1.3 s on")
		return
	await M._wait(0.8)
	var at_work := true
	if w == "wildfire":
		at_work = _seen("arc") > 0
	await _pic("behind_%s_at_work" % w, at_work, "0.85 s on: at work%s" % (" (sparks thrown %d)" % _seen("arc") if w == "wildfire" else ""))
	await M._wait(1.2)
	await _pic("behind_%s_later" % w, true, "2 s on")


# --- AN AREA: a landing and a whirl ---

func _area() -> void:
	await _begin(2, ["eruption"], [])
	await M._w_lunge(h, _home + _face * 3.0)
	await M._wait(0.02)
	var land: Dictionary = fx.last.get("burst", {})
	await _pic("area_lunge_eruption", land.get("style", "") == "land" and not m3.columns.is_empty(), "his Lunge lands with Eruption in front (a burst %s, %.1f round): jets of lava round its ring" % [land.get("style", "-"), float(land.get("r", 0.0))])
	await M._wait(0.25)
	await _pic("area_lunge_eruption_after", true, "0.3 s on")
	await _begin(1, ["thunder"], [])
	await M._w_whirl_begin(h)
	await M._wait(0.3)
	await _pic("area_whirl_thunder", not h.channel().is_empty() and _seen("burst") > 0, "his Whirlwind with Thunder in front, its turns crackling violet (turns told %d)" % _seen("burst"))
	h.auto_whirl = false
	await M._w_until(func() -> bool: return h.channel().is_empty(), 4.0)


# --- THE RANKED WORDS ---

func _ranked() -> void:
	await _begin(0, ["power2"], ["fire2"])
	await M._w_strike(h)
	await M._wait(0.05)
	# (the strike's own hit on A: Power in front gives it a splash, whose hits are told after it and carry no words, as the game's)
	var hit: Dictionary = fx.last.get("hit_words", {})
	var words: Array = hit.get("words", [])
	var plain := true
	for z: Dictionary in M.wakes.list:
		plain = plain and not M3.owns_zone(z) and z["kind"] == "burn"
	var ok: bool = words.has("power") and not words.has("power2") and M.wakes.list.size() > 0 and plain and is_same(M3.look_words(words), words)
	await _pic("ranked_power2_fire2", ok, "his Strike with POWER II in front and FLAME II behind: the hit told with %s (Power's look, Power's weight), its ground %s, drawn as Flame's" % [words, ", ".join(M.wakes.list.map(func(z): return str(z["kind"])))])


# --- WHAT IT COSTS ---

func _cost(frames: int) -> String:
	fx.timing = true
	fx.cost_update = 0
	fx.cost_draw = 0
	fx.cost_frames = 0
	m3.cost_update = 0
	m3.cost_paint = 0
	for i in frames:
		await M.get_tree().process_frame
	fx.timing = false
	var f := float(maxi(1, fx.cost_frames))
	return "update %.3f ms, drawing %.3f ms (of which the melded words' own: reading and ticking %.3f ms, painting %.3f ms)" % [fx.cost_update / 1000.0 / f, fx.cost_draw / 1000.0 / f, m3.cost_update / 1000.0 / f, m3.cost_paint / 1000.0 / f]


func _cost_case() -> void:
	await _begin(0, [], [])
	var idle: String = await _cost(60)
	# every patch's look at once, big, round him; his heat and his charge; then an eruption and a thunderclap
	var k := 0
	for w in M3.TEN:
		for kind in M3.TABLE[w]:
			var at: Vector2 = _home + _face * (1.5 + (k % 4) * 1.6) + _side * (-3.0 + int(k / 4) * 2.0)
			M.wakes.list.append({"kind": kind, "x": at.x, "y": at.y, "r": 2.0, "t": 0.3, "dur": 30.0, "element": "phys", "dmg": 0.0, "slow": 0.0, "tick": 99.0, "skill": 0, "meld": w})
			k += 1
	M.wakes.queue_redraw()
	h.loadout.put(0, "behind", "eruption")
	h.loadout.put(1, "behind", "thunder")
	h.melds.heat[0] = 5
	h.melds.hits[1] = 3
	await M._wait(0.4)
	await _pic("cost_all_at_once", m3.heat == 5 and m3.claps == 3, "%d patches of the melded words' looks at once, big; full heat and the charge" % k)
	var many: String = await _cost(45)
	fx.event({"t": "burst", "x": (_home + _face * 2.0).x, "y": (_home + _face * 2.0).y, "r": 2.0, "el": "fire", "style": "blast", "meld": "eruption"})
	fx.event({"t": "burst", "x": _home.x, "y": _home.y, "r": 2.4, "el": "lightning", "style": "blast", "meld": "thunder"})
	await M._wait(0.06)
	await _pic("cost_eruption_and_clap", not m3.columns.is_empty() and not m3.skies.is_empty(), "and an eruption and a thunderclap in it")
	var heavy: String = await _cost(20)
	M.wakes.list.clear()
	print("LOOKS_MELDS COST: the effects a frame: with nothing of the ten %s; with %d of their patches big at once, full heat and the charge %s; with an eruption and a thunderclap in that %s" % [idle, k, many, heavy])
