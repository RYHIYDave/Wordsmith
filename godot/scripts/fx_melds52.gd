## THE 52 DESIGNED MELDS AS THE FIGHT SHOWS THEM (his two docs, Twin's Meld Animations and the Floor 6–10 Meld Animations, approved
## 23 Nov 2026: “Okay sounds good”, “Good”). The rules tell what happened (melds52_rules.gd, `m52` {id, what, x, y, ...}); this makes
## of each telling what is seen, out of the effects' own pieces (fx.gd: rings, flashes, sparks, motes, shards, smoke, cuts, the
## hold and the kick), in the meld's own colour, darkest to brightest from its stone's (melds52.json `color`). What each rune of it
## shows already stays as it is (fx.gd and its words' modules draw them); this adds each one's own moment.
## AS THINGS GO ON (update): a monster carrying one smoulders in its colour (motes rising off it), as a guardian smoulders in its
## first rune's; the ground a meld behind left gives off motes of its colour; his shield, with a Guarding meld in front, gives off
## its meld's (embers, thorns, sparks, wind, grit); Berserk's red steam off him at a full frenzy; Brand's mark burning on what it
## branded.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const L := preload("res://scripts/fx_looks.gd")
## (those of the 52 painted as the game's own melds are: fx_m52paint.gd)
const Paint := preload("res://scripts/fx_m52paint.gd")
const PAINTERS := ["res://scripts/fx_m52p_leech.gd", "res://scripts/fx_m52p_precise.gd", "res://scripts/fx_m52p_guard.gd", "res://scripts/fx_m52p_last.gd", "res://scripts/fx_m52p_vast.gd", "res://scripts/fx_m52p_last110.gd", "res://scripts/fx_m52p_city.gd", "res://scripts/fx_m52p_city2.gd", "res://scripts/fx_m52p_reap.gd", "res://scripts/fx_m52p_high.gd"]

var fx:
	set(v):
		fx = v
		for p in painters:
			p.fx = v
var paint := Paint.new()
## (every painter: Twin's, then each group's)
var painters: Array = [paint]
var _by_id := {}
## (ALL MELDS REDONE: the moments the redone ones add, their own painter: fx_m52p_redo.gd, behind melds52.gd REDO_ON)
var redo


func _init() -> void:
	for path in PAINTERS:
		painters.append(load(path).new())
	for id in Paint.PAINTED:
		_by_id[id] = paint
	for p in painters.slice(1):
		for id in p.ids():
			_by_id[id] = p
	redo = load("res://scripts/fx_m52p_redo.gd").new()
	painters.append(redo)


func draw_floor(c: CanvasItem) -> void:
	for p in painters:
		p.draw_floor(c)


func draw_air(c: CanvasItem) -> void:
	for p in painters:
		p.draw_air(c)


func alive() -> bool:
	return painters.any(func(p): return p.alive())
var _ramps := {}
var _t := 0.0
var _carriers := {}


## Its colours, brightest first (the effects' own ramps run so): its glow, its light, itself, its dark, its darkest.
func ramp(id: String) -> PackedColorArray:
	if _ramps.has(id):
		return _ramps[id]
	var c := Color(str(M52.T()["color"].get(id, "#ffffff"))) if id != "~icy" else Color(preload("res://scripts/fx_m52kit.gd").FROST_DEEP)
	if id == "~sea":
		c = Color(preload("res://scripts/fx_m52kit.gd").SEA_DEEP)
	var out := PackedColorArray([c.lerp(Color.WHITE, 0.65), c.lerp(Color.WHITE, 0.3), c, c.darkened(0.3), c.darkened(0.55)])
	_ramps[id] = out
	return out


const TEAL := [Color("#c8fff6"), Color("#7af8f0"), Color("#2ec4c4")]
const DUST := [Color("#e8d4a8"), Color("#b89a62"), Color("#7a6040")]
const ICE := [Color("#ffffff"), Color("#d8f4ff"), Color("#8ad0fa")]


func _pa(a: Array) -> PackedColorArray:
	return PackedColorArray(a)


## (HEAVY BLOWS LAND WITH A FREEZE, his Art Rulebook's Movement 7: "The moment a heavy blow lands, everything holds for a tenth
## of a second." The Heavy and Volatile melds' landings and blasts, and how long each holds, as the game's own words hold: fx_words3.gd)
const HOLDS := {"aftershock:burst": 0.1, "marrow:drink": 0.08, "concussion:boom": 0.1, "pressurepoint:point": 0.08, "fortress:clang": 0.1,
	"daze:thud": 0.1, "earthquake:wave": 0.12, "charge:ram": 0.1, "mire:mud": 0.08, "icebreaker:shatter": 0.1, "anvil:sparks": 0.1,
	"fulgurite:stun": 0.08, "quickfuse:pop": 0.08, "cluster:pop": 0.08, "bloodbloom:bloom": 0.08, "detonator:burst": 0.1,
	"detonator:boom": 0.12, "mayhem:burst": 0.08, "minefield:mine": 0.1, "timebomb:boom": 0.12, "hairtrigger:trigger": 0.1,
	"blastwave:wave": 0.12,
	# (the city's melds: meldscity_rules.gd, fx_m52p_city.gd)
	"maw:crash": 0.1, "maw:collapse": 0.12, "gravity:crater": 0.12, "stasis:snap": 0.08, "shackle:bite": 0.08, "anchor:sink": 0.12,
	"firetrap:blaze": 0.08, "burden:weight": 0.1, "rubble:thud": 0.06, "standstill:pulse": 0.1,
	# (the city's runes with the floor 6–10 runes: meldscity2_rules.gd, fx_m52p_city2.gd)
	"tripwire:boom": 0.1, "slowfuse:boom": 0.1, "hexblast:burst": 0.08, "shellburst:pop": 0.08, "whiplash:snap": 0.08, "stutter:went": 0.06, "omen:went": 0.06,
	# (on a monster: Quickfuse's blast at once as it dies; Cinderward's shield bursting; the others hold as each lands, in its painter)
	"quickfuse:foe": 0.08, "cinderward:foe": 0.08}


func handle(e: Dictionary) -> void:
	var id: String = e.get("id", "")
	var held := id + ":" + str(e.get("what", ""))
	if HOLDS.has(held) and fx != null:
		fx.hold(float(HOLDS[held]))
	if redo.knows(id, str(e.get("what", ""))):
		redo.handle(e)
		return
	if _by_id.has(id):
		_by_id[id].handle(e)
		return
	var what: String = e.get("what", "")
	var x: float = e.get("x", 0.0)
	var y: float = e.get("y", 0.0)
	var C := ramp(id)
	match "%s:%s" % [id, what]:
		# --- TWIN'S
		"onslaught:second":
			fx.flash(x, y, 10.0, 0.7, 0.16, _pa([Color.WHITE, C[0], C[1]]))
			fx.spray(x, y, 12, C, 4.0, 10.0)
			fx.ring(x, y, 0.9, 0.3, C, false, {"heavy": true})
			fx.kick(2.0)
		"viper:bite":
			var a := randf() * TAU
			fx.slash(x, y, a, 0.6, 0.18, C, false, {"fast": true})
			fx.slash(x, y, a + PI, 0.6, 0.18, C, false, {"fast": true, "rev": true})
			for k in 4:
				fx.mote(x, y, C)
		"flashfreeze:frost":
			fx.ring(x, y, 0.6, 0.35, _pa(ICE), false, {"closing": true})
			fx.spray(x, y, 5, _pa(ICE), 1.5, 4.0)
		"flashfreeze:freeze":
			fx.flash(x, y, 8.0, 1.0, 0.2, _pa([Color.WHITE, ICE[1], C[1]]))
			fx.shards(x, y, 10, 3.5)
			fx.ring(x, y, 0.8, 0.3, C, false, {"jag": true})
			fx.glow(x, y, 2.0, 0.4)
		"flashfreeze:sheet":
			fx.ring(x, y, float(e.get("r", 1.0)), 0.45, _pa(ICE), true)
			fx.flash(x, y, 2.0, float(e.get("r", 1.0)), 0.18, _pa([Color.WHITE, ICE[1]]))
			fx.shards(x, y, 8, 2.5)
		"rekindle:relight":
			fx.flash(x, y, 8.0, 0.6, 0.2, C)
			fx.spray(x, y, 10, C, 2.5, 18.0)
			for k in 5:
				fx.mote(x, y, C)
			fx.glow(x, y, 2.2, 0.5)
		"rekindle:flare":
			fx.ring(x, y, float(e.get("r", 1.0)), 0.5, C, true)
			fx.spray(x, y, 14, C, 3.0, 20.0)
			fx.glow(x, y, 3.0, 0.6)
		"flurry:stack":
			var n: int = int(e.get("n", 2))
			for k in n:
				fx.slash(x, y, TAU * float(k) / float(n) + randf() * 0.4, 0.9, 0.2, C, false, {"fast": true, "faint": k > 1})
			fx.ring(x, y, 0.3 + 0.08 * n, 0.4, C, false, {"double": n >= 4})
		"flurry:gust", "blur:gust", "tailwind:gust", "secondwind:orb":
			fx.ring(x, y, 0.8, 0.4, C, false, {"swirl": true})
			fx.spray(x, y, 8, C, 3.0, 2.0, 3.0)
		"aftershock:burst":
			var r: float = e.get("r", 1.8)
			fx.ring(x, y, r, 0.45, _pa([Color.WHITE, C[0], C[2], DUST[2]]), false, {"heavy": true, "jag": true})
			fx.spray(x, y, 16, _pa(DUST), 4.0, 14.0)
			fx.smoke(x, y, r * 0.6, 5)
			fx.kick(3.0)
			fx.glow(x, y, r, 0.3)
		"aftershock:quake":
			fx.ring(x, y, float(e.get("r", 1.0)), 0.4, _pa([Color.WHITE, C[1], C[2]]), false, {"jag": true})
			fx.smoke(x, y, float(e.get("r", 1.0)) * 0.5, 4)
		# --- LEECH'S
		"marrow:drink", "marrow:drain":
			for k in (3 if what == "drink" else 1):
				fx.mote(x, y, C)
			fx.flash(x, y, 8.0, 0.4, 0.15, C)
		"secondwind:wind":
			fx.ring(x, y, 0.6, 0.35, C, false, {"swirl": true})
		"conduit:bead":
			fx.flash(x, y, 10.0, 0.3, 0.12, C)
			var hh: Vector2 = fx.hero_at()
			fx.after(0.15, func() -> void: fx.flash(hh.x, hh.y, 12.0, 0.35, 0.15, C))
		"bloodlust:orb":
			fx.ring(x, y, 0.9, 0.4, C, false, {"double": true})
			fx.glow(x, y, 2.0, 0.4)
		# --- VOLATILE'S
		"quickfuse:pop":
			fx.flash(x, y, 8.0, 0.9, 0.14, C)
			fx.spray(x, y, 12, C, 4.0, 10.0)
			fx.spray(x, y, 6, _pa([Color("#e8fff0"), Color("#b0e08c")]), 5.0, 2.0, 3.0)
		"concussion:boom":
			var r: float = e.get("r", 2.0)
			fx.ring(x, y, r, 0.4, _pa([Color.WHITE, C[0], C[2]]), false, {"heavy": true})
			fx.ring(x, y, r * 0.7, 0.5, _pa(DUST), false, {"delay": 0.08})
			fx.smoke(x, y, r * 0.5, 4)
			fx.kick(2.0)
		# --- PRECISE'S
		"duelist:alone":
			fx.ring(x, y, 1.3, 0.5, C, false, {"closing": true})
			fx.flash(x, y, 10.0, 0.5, 0.12, _pa([Color.WHITE, C[0]]))
		"duelist:mark", "needle:mark", "brand:mark", "seeker:mark", "quickdraw:mark":
			fx.ring(x, y, 0.7, 0.5, C, false, {"closing": true})
			fx.flash(x, y, 22.0, 0.25, 0.4, C)
		"needle:three":
			var a := randf() * TAU
			for k in 3:
				fx.slash(x, y, a + (k - 1) * 0.35, 0.7, 0.16, _pa([Color.WHITE, C[0], C[2]]), false, {"fast": true})
			for k in 3:
				fx.mote(x, y, C)
		"needle:double":
			fx.spray(x, y, 10, C, 1.5, 8.0)
			fx.ring(x, y, 0.5, 0.3, C, true)
		"brand:brand":
			fx.flash(x, y, 9.0, 0.5, 0.25, C)
			fx.ring(x, y, 0.45, 0.4, C, false, {"double": true})
			fx.spray(x, y, 6, C, 1.5, 12.0)
		"quickdraw:draw":
			fx.flash(x, y, 14.0, 0.25, 0.3, _pa([Color.WHITE, C[0]]))
		"quickdraw:crack":
			fx.slash(x, y, randf() * TAU, 1.4, 0.14, _pa([Color.WHITE, C[0], C[1]]), false, {"fast": true})
			fx.spray(x, y, 8, C, 4.0, 2.0, 4.0)
			fx.flash(x, y, 10.0, 0.5, 0.1, _pa([Color.WHITE]))
		"pressurepoint:point":
			for k in 4:
				fx.slash(x + cos(k * PI / 2.0) * 0.6, y + sin(k * PI / 2.0) * 0.6, k * PI / 2.0 + PI, 0.5, 0.18, _pa([Color.WHITE, C[0]]), false, {"fast": true})
			fx.flash(x, y, 10.0, 0.4, 0.12, _pa([Color.WHITE, C[0]]))
		# --- FRENZIED'S
		"fever:dose":
			for k in int(e.get("n", 1)):
				fx.mote(x, y, C)
			fx.spray(x, y, 3 + int(e.get("n", 1)), C, 1.2, 6.0)
		"whiteout:burst":
			fx.ring(x, y, float(e.get("r", 2.0)), 0.45, _pa(ICE), true)
			fx.shards(x, y, 10, 3.0)
			fx.spray(x, y, 14, _pa([Color.WHITE, C[0]]), 3.0, 6.0)
		# --- GUARDING'S
		"cinderward:burst":
			var r: float = e.get("r", 2.2)
			fx.ring(x, y, r, 0.45, C, true)
			fx.flash(x, y, 10.0, r * 0.6, 0.2, C)
			fx.spray(x, y, 18, C, 4.0, 16.0)
			fx.glow(x, y, r + 1.0, 0.5)
		"hemlock:thorns":
			fx.spray(x, y, 8, C, 2.5, 6.0)
		# --- LASTING'S
		"momentum:build":
			fx.ring(x, y, 0.35 + 0.04 * int(e.get("n", 1)), 0.3, C, false)
		"smoulder:coals":
			fx.smoke(x, y, 0.6, 3)
			for k in 4:
				fx.mote(x, y, C)
		# --- FLEETING'S
		"blink:blink":
			fx.flash(x, y, 12.0, 0.6, 0.1, _pa([Color.WHITE, C[0]]))
			fx.spray(x, y, 8, C, 5.0, 2.0, 6.0)
		"coldsnap:snap":
			fx.shards(x, y, 8, 3.0)
			fx.flash(x, y, 8.0, 0.5, 0.12, _pa([Color.WHITE, C[0]]))
		"coldsnap:melt":
			fx.ring(x, y, float(e.get("r", 1.0)), 0.4, C, true)
			fx.shards(x, y, 10, 2.5)
		"flashfire:flare":
			var r: float = e.get("r", 1.8)
			fx.ring(x, y, r, 0.35, C, true)
			fx.flash(x, y, 10.0, r * 0.5, 0.15, _pa([Color.WHITE, C[0], C[1]]))
			fx.spray(x, y, 14, C, 4.0, 18.0)
			fx.glow(x, y, r + 1.0, 0.35)
		"jolt:jolt":
			fx.flash(x, y, 12.0, 1.0, 0.12, _pa([Color.WHITE, C[0], C[1]]))
			fx.ring(x, y, 0.9, 0.25, C, false, {"jag": true})
			fx.glow(x, y, 2.5, 0.25)
		"jolt:all":
			fx.flash(x, y, 30.0, float(e.get("r", 1.5)), 0.12, _pa([Color.WHITE, C[0]]))
			fx.ring(x, y, float(e.get("r", 1.5)), 0.3, C, true, {"jag": true})
			fx.glow(x, y, 4.0, 0.3)
		"bloat:burst":
			var r: float = e.get("r", 1.5)
			fx.ring(x, y, r, 0.4, C, true)
			fx.spray(x, y, 12, C, 2.5, 8.0)
		# --- VAST'S
		"earthquake:wave":
			var r: float = e.get("r", 3.5)
			var sp: float = e.get("speed", 7.0)
			fx.ring(x, y, r, r / maxf(1.0, sp) + 0.25, _pa([C[0], C[2], DUST[2]]), false, {"heavy": true, "jag": true})
			fx.ring(x, y, r * 0.6, r / maxf(1.0, sp) + 0.2, _pa(DUST), false, {"delay": 0.1, "jag": true})
			fx.smoke(x, y, 0.8, 5)
			fx.kick(3.0)
		"gale:blow":
			fx.spray(x, y, 6, C, 4.0, 2.0, 3.0)
		"gale:gust":
			fx.ring(x, y, float(e.get("r", 3.0)), 0.5, C, false, {"swirl": true})
			fx.spray(x, y, 14, C, 4.0, 2.0, 3.0)
		"glacier:spread":
			for p in e.get("to", []):
				fx.ring(p.x, p.y, 0.5, 0.35, _pa(ICE), true)
				fx.shards(p.x, p.y, 4, 2.0)


func update(dt: float) -> void:
	for p in painters:
		p.update(dt)
	_t += dt
	if fmod(_t, 0.12) >= dt:
		return
	var h = fx.hero()
	# (a monster carrying one: smouldering in its colour)
	var mons: Array = h.monsters.list if h != null and h.monsters != null and is_instance_valid(h.monsters) else []
	for m in mons:
		if not is_instance_valid(m) or m.dead or m.words.is_empty():
			continue
		var c52: String = _carrier(m)
		if c52 != "" and randf() < 0.6:
			# (FRIEND CYAN IS THE HERO'S ALONE: the icy ones smoulder in Frost's deep blue on a monster, fx_m52kit.gd ICY)
			var K := preload("res://scripts/fx_m52kit.gd")
			fx.mote(m.world.x, m.world.y, ramp("~icy") if K.ICY.has(c52) else (ramp("~sea") if K.SEA.has(c52) else ramp(c52)))
		if m.m52.has("brand") or (m.mark_t > 0.0 and str(m.m52.get("mark", "")) == "brand"):
			fx.mote(m.world.x, m.world.y, ramp("brand"))
	if h == null:
		return
	# (the ground his melds left, giving off its colour)
	if h.wakes != null and is_instance_valid(h.wakes):
		for z in h.wakes.list:
			var id: String = str(z.get("m52", ""))
			if id == "" or randf() > 0.5:
				continue
			var a := randf() * TAU
			var d: float = sqrt(randf()) * float(z["r"])
			var px: float = float(z["x"]) + cos(a) * d
			var py: float = float(z["y"]) + sin(a) * d
			if id == "cinderward":
				px = float(z["x"]) + cos(a) * float(z["r"])
				py = float(z["y"]) + sin(a) * float(z["r"])
			fx.mote(px, py, ramp(id))
	# (his shield, a Guarding meld in front: its own)
	# (only while a shield holds: a barrier is shown on his life globe, nothing round him; his words, 27 Nov 2026)
	var sh: bool = h.shield > 0.0
	if sh:
		for i in 3:
			var f: String = h.m52.fid(i)
			if f in ["bulwark", "hemlock", "cinderward", "static", "windward", "fortress", "guarding2"]:
				var a := randf() * TAU
				fx.mote(h.world.x + cos(a) * 0.5, h.world.y + sin(a) * 0.5, ramp(f))
				break
	# (Berserk at a full frenzy: red steam off him; Juggernaut's steps shaking dust)
	if h.frenzy >= int(preload("res://scripts/words.gd").data()["frenzy"]["max"]):
		if h.m52.any_has("berserk"):
			fx.mote(h.world.x, h.world.y, ramp("berserk"))
			fx.smoke(h.world.x, h.world.y, 0.3, 1)
		if h.m52.any_has("juggernaut") and randf() < 0.5:
			fx.spray(h.world.x, h.world.y, 2, _pa(DUST), 1.0, 2.0, 1.0)


## The first of the 52 a monster carries, or "".
func _carrier(m) -> String:
	var key: int = m.get_instance_id()
	if _carriers.has(key):
		return _carriers[key]
	var out := ""
	for w in m.words:
		if M52.is_new(w):
			out = str(w)
			break
	_carriers[key] = out
	return out


func clear() -> void:
	_carriers = {}
	for p in painters:
		p.clear()
