## FLOOR 20'S BOSS: THE MOTH (the Tower Top), as the game fights her, MADE GHOSTLY (game/act1_rules/moth.ts; art/moth.ts,
## moth_moves.ts, moth2.ts, moth2_fx.ts; render/act1_fx/moth.ts; on at his yes of 14 Nov 2026: “Yes, switch her on (Recommended)”).
## His doc (level 20): "A vast grey moth, its wings wider than the room is long, an eye on each wing that opens and follows you. The
## dust off its wings is the Hush itself: where it falls, words go dark and sound dies. It never lands for long. ... in the last
## [phase] it settles on the last chapter and its wings beat the whole top. The payoff: it dies screaming, the first sound it ever
## makes, and every word it ever swallowed pours out of it and flies home." His pick for how it moves, “Slow, heavy wingbeats”; of
## where it lands, “Book knocked to the stones (Recommended)”; and of her attacks made ghostly, 14 Nov 2026: “as of right now the
## moth is the end boss of the compaign so it needs to be good.  dont make mistakes, make some cool original attacks.  very
## ethereal”, the set offered him, “Yes, build these (Recommended)”.
##   SHE HOVERS AND DRIFTS over the top, never touching it, keeping 4.2 tiles off him; HER WINGS BEAT one slow beat in 2.4 s, and EACH
##     OF HER MOVES BEGINS AT THE TOP OF A BEAT and ends there: her beat's clock is her own (a1 "beat"), her stand and her drift
##     drawn by it frame for frame (`shown`), so her wings never jump.
##   HER BLOWS, along the way her picture faces (one of the four the camera shows: picture_way), or at him:
##     GHOST WING (her basic, the buffet; within 8 tiles): as her wing comes down a see-through ghost of her wings sweeps the cone
##       before her, 140 degrees and 9 tiles: struck, and thrown back 1.6 tiles.
##     THE HUSH (her Dust, every 9 s, the first after 4): her glowing scales fall like slow snow 4.5 tiles before her, 7 across; settled,
##       in it his words go dark and it bites a little, every 0.6 s.
##     ECLIPSE (her Eyes' moves, every 11 s, the first after 6; from 1.5 tiles to 6): a pale moon rises behind her; her shadow is
##       thrown huge across the top toward him, the eyes on her wings opening in it; then the whole shadow strikes (x1.3).
##     PHANTOMS (her Swarm's moves, every 13 s, the first after 9; from 3 tiles to 15): three see-through copies of her peel away and
##       glide across the top one after another, each down its lane marked before it, the first at him; each strikes him once (x0.8).
##   HER PHASES (by her life: two thirds, a third): each phase she beats and drifts faster (x1.25, x1.4), and sheds the Hush over him
##     now and then (from her second phase: every 9 s, then 5; marked a second before it falls). THE LAST: she cannot die in the air;
##     she flies to the lectern, THE LAST CHAPTER IS KNOCKED FROM IT TO THE STONES, and she comes down on the book (nothing hurts her
##     the while): there THE UNWRITING (her beat, every 3.2 s): the chapter's pages tear loose and wheel out round her as a ring of
##     pale burning pages over the whole top, 11 tiles: it strikes him as it passes under him (dodge through it).
##   HER DEATH, on the book: her scream, the first sound she ever makes; every word she swallowed pours out of her and flies home;
##     she comes apart into drifting light.
##   THE SONGBIRD, mended (act3/quest1620.gd): in her fight E, and it sings, once a phase: her Hush blown away, his words back, she
##     stunned 3 s.
## What her blows leave and send: act3/moth_marks.gd, drawn by act3/moth_paint.gd; her numbers: assets/act3/moth.json
## (tools/godot_moth.ts); her pictures, taken in a move at a time (baked_figure.gd).
extends "res://scripts/act3/hc.gd"

const MP := preload("res://scripts/act3/moth_paint.gd")

static var _acts: Array = []
static var _gait := {}
static var _land_i := -1
const IN_AIR := ["moth:buffet", "moth:dust", "moth:swarm", "moth:eyes"]


static func D() -> Dictionary:
	return MP.data()


static func T(k: String):
	return D()["tune"][k]


func gait() -> Dictionary:
	if _gait.is_empty():
		_gait = D()["gait"]
	return _gait


func acts() -> Array:
	if _acts.is_empty():
		_acts = D()["acts"]
		for i in _acts.size():
			if str(_acts[i]["id"]) == "moth:land":
				_land_i = i
	return _acts


func _id() -> String:
	return str(acts()[act["i"]]["id"]) if act != null else ""


## Her phase: 0, 1 or 2 (her last, on the book), by her life.
static func phase_of(m) -> int:
	var k: float = m.life / maxf(1.0, m.max_life)
	return 0 if k > 2.0 / 3.0 else (1 if k > 1.0 / 3.0 else 2)


## Whether she is down on the book.
func perched() -> bool:
	return int(a1.get("perched", 0)) == 1


## Her beat's clock now (seconds into the beat, 0 its top).
func beat() -> float:
	return float(a1.get("beat", 0.0))


## The axis her picture faces along (her blows drawn in her picture go that way): +x, +y, -y or -x.
static func picture_way(f: Vector2) -> Vector2:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	if back:
		return Vector2(-1, 0) if flip else Vector2(0, -1)
	return Vector2(0, 1) if flip else Vector2(1, 0)


## THE BOOK on the stones: where it falls (MOTH_TUNE.book from the lectern, toward the eye), and where she comes down on it (her
## floor point, BOOK.at behind it), facing the eye. Empty off the tower.
static func book_of(map) -> Dictionary:
	if map == null or map.land == null or map.land.get("tower") == null:
		return {}
	var top: Dictionary = map.land["tower"]["top"]
	var f := Vector2(sqrt(0.5), sqrt(0.5))
	var book := Vector2(float(top["cx"]), float(top["cy"])) + f * float(T("book"))
	var w := picture_way(f)
	var at := book - w * (float(D()["book"]["at"][0]) / float(D()["tile3"]))
	return {"book": book, "at": at, "f": f}


## Whether (h) is under the gust of a ghost wing from `at` along `f`.
static func in_gust(at: Vector2, f: Vector2, h: Vector2) -> bool:
	var C: Dictionary = D()["cone"]
	var d := h.distance_to(at)
	if d > float(C["tiles"]):
		return false
	if d < 1.2:
		return true
	return (h - at).dot(f) / d >= cos(((float(C["deg"]) / 2.0) * PI) / 180.0)


## The middle of her Hush's cloud, from `at` along `f`.
static func cloud_at(at: Vector2, f: Vector2) -> Vector2:
	return at + f * float(D()["cloud"]["ahead"])


## How far the Unwriting's ring has rolled out `t` seconds after she beats down (tiles).
static func wave_at(t: float) -> float:
	var reach: float = D()["waveFx"]["reach"]
	return 1.6 + (float(D()["ring"]["tiles"]) - 1.6) * (1.0 - pow(1.0 - minf(1.0, maxf(0.0, t) / reach), 3.0))


# --- her rules ---

func spawned(m) -> void:
	a1["beat"] = 0.0
	# (her pictures, a move at a time: her hover, her drift and her flinch read ahead; only once he is near, as every figure's:
	# baked_figure.gd fetch, monsters.gd NEAR_FETCH)
	var h = m.mgr.hero
	if h != null and m.world.distance_to(h.world) > 40.0:  # (monsters.gd NEAR_FETCH)
		return
	for l in ["idle", "walk", "reel"]:
		m.art.want(l, 1 if m.face.x + m.face.y < -0.2 else 0)


func aloft(_m) -> bool:
	return true


## (she cannot die in the air: her last phase is on the book)
func life_floor(_m) -> float:
	return 0.0 if perched() else 1.0


## (flying to the book and coming down on it: monster.gd "Invulnerable")
func invulnerable(_m) -> bool:
	return int(a1.get("toLand", 0)) != 0 or _id() == "moth:land"


## (her body fills the screen: struck, she flashes faintly: render/act1_fx/moth.ts flash)
func flash_k(_m) -> float:
	return 0.28


func tick(m, dt: float, _dist: float, _hero) -> bool:
	var ph := phase_of(m)
	var quick: float = T("quick")[ph]
	# (her beat's clock: faster each phase)
	a1["beat"] = fmod(beat() + dt * quick, float(D()["beat"]["long"]))
	# (her drift faster each phase; on the book she stays where she came down, facing the eye, her feet round the book)
	if not a1.has("base"):
		a1["base"] = m.speed
	m.speed = 0.0 if perched() else float(a1["base"]) * quick
	var B := book_of(m.mgr.map)
	if perched() and not B.is_empty():
		m.world = B["at"]
		m.face = B["f"]
	# (the Hush she sheds over him, now and then, from her second phase)
	var every: float = T("shed")["every"][ph]
	if every > 0.0 and int(a1.get("toLand", 0)) == 0 and _id() != "moth:land":
		a1["shed"] = float(a1.get("shed", every * 0.6)) - dt
		if float(a1["shed"]) <= 0.0:
			a1["shed"] = every
			var h = m.mgr.hero
			peril(m, "moth:shed", h.world, {"t": -float(T("shed")["warn"]), "hit": 0.0, "dur": D()["cloudLong"], "dmg": m._roll() * float(T("dust")["bite"])})
	# (her last phase near: her coming down and her beat read ahead)
	if ph >= 1 and m.life <= m.max_life * 0.4:
		var side := 1 if m.face.x + m.face.y < -0.2 else 0
		for l in ["land", "perch", "beat", "perchReel"]:
			m.art.want(l, side)
	# THE LAST PHASE: to the lectern; the book knocked to the stones; down on it
	a1["walking"] = 0
	if ph == 2 and not perched() and act == null:
		if B.is_empty():
			return false
		if int(a1.get("toLand", 0)) == 0:
			a1["toLand"] = 1
			sound(m, "whirl", 0.6)
		var d: float = m.world.distance_to(B["at"])
		if d > 0.15:
			var step := minf(d, float(T("fly")) * dt)
			m.world += (B["at"] - m.world) / d * step
			a1["walking"] = 1
			return true
		m.world = B["at"]
		m.face = B["f"]
		if int(a1.get("bookDown", 0)) == 0:
			# (the chapter falls from its lectern to the stones)
			a1["bookDown"] = 1
			peril(m, "moth:book", B["book"], {"dur": 1e9, "hit": 0.0})
			var look = m.mgr.main.look if m.mgr.main != null else null
			if look != null and look.data.get("variants", {}).has("lectern"):
				look.show_variant("lectern", 1.0)
			sound(m, "door", 0.4)
		# (at the top of a beat the rest of her step runs, and brings her coming down: forced)
		return beat() >= 1.0 / float(D()["beat"]["fps"])
	return false


func forced(_m) -> int:
	acts()
	# (down on the book, once she is over it and at the top of a beat)
	if int(a1.get("toLand", 0)) != 0 and int(a1.get("bookDown", 0)) != 0 and not perched() and beat() < 1.0 / float(D()["beat"]["fps"]):
		return _land_i
	return -1


func can(_m, a: Dictionary, _dist: float, _los: bool) -> bool:
	if int(a1.get("toLand", 0)) != 0:
		return false
	# (each move begun at the top of a beat)
	if beat() >= 1.2 / float(D()["beat"]["fps"]):
		return false
	if perched():
		return str(a["id"]) == "moth:beat"
	return IN_AIR.has(str(a["id"]))


func start(m, a: Dictionary, hero) -> void:
	var id := str(a["id"])
	# (her blows go the way her picture faces: she is turned to it, which changes nothing of her picture)
	var w := picture_way(m.face)
	if id != "moth:land":
		m.face = w
	a1["wx"] = w.x
	a1["wy"] = w.y
	# (her shadow and her phantoms go at him, not along her picture's way)
	if id == "moth:eyes" or id == "moth:swarm":
		var dv: Vector2 = hero.world - m.world
		var dd := dv.length()
		a1["ax"] = dv.x / dd if dd > 1e-6 else w.x
		a1["ay"] = dv.y / dd if dd > 1e-6 else w.y
		sound(m, "whirl", 0.3)
	# (her pictures of this move taken in, if they are not yet; their warnings on the floor)
	m.art.want(str(a["clip"]), 1 if m.face.x + m.face.y < -0.2 else 0)
	var mv: Dictionary = D()["moves"]
	match id:
		"moth:buffet":
			var C: Dictionary = D()["cone"]
			var b := (float(C["deg"]) / 2.0) * PI / 180.0
			warn(m, id, float(mv["buffet"]["warn"][0]) - 0.2, a["hit"], [], [[-b, b, C["tiles"]]])
		"moth:dust":
			warn(m, id, float(mv["dust"]["warn"][0]) - 0.2, a["hit"], [], [[-PI, PI, float(D()["cloud"]["tiles"]) / 2.0, D()["cloud"]["ahead"]]])
		"moth:beat":
			warn(m, id, float(mv["beat"]["warn"][0]) - 0.2, a["hit"], [], [[-PI, PI, 11.0]], false, {"kmul": 0.55})
	if id == "moth:eyes" or id == "moth:swarm" or id == "moth:beat":
		# (what her wind-up shows besides: the moon and her shadow; her phantoms' lanes and her copies shimmering off her; the
		# chapter's pages tearing loose: act3/moth_marks.gd)
		peril(m, "moth:show", m.world, {"dur": 1e9, "act": act, "act_id": id, "ax": a1.get("ax", w.x), "ay": a1.get("ay", w.y)})


func end(m, a: Dictionary, hero) -> void:
	# (each move ends at the top of a beat)
	a1["beat"] = 0.0
	if str(a["id"]) == "moth:land":
		a1["perched"] = 1
		a1["toLand"] = 0
		hero.kick(4.0)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var wf := Vector2(float(a1.get("wx", m.face.x)), float(a1.get("wy", m.face.y)))
	var hit: float = a["hit"]
	match str(a["id"]):
		"moth:buffet":
			if not crossed(t0, t1, hit):
				return
			sound(m, "gust", 0.9)
			hero.kick(3.0)
			peril(m, "moth:gust", m.world, {"fx": wf.x, "fy": wf.y, "dur": D()["gustFx"]["long"], "hit": 0.0})
			if open_to(hero) and in_gust(m.world, wf, hero.world):
				blow(m, hero, a["dmg"])
				# (thrown back by the wind, so far as the floor lets him)
				var d: Vector2 = hero.world - m.world
				var u := d / d.length() if d.length() > 0.0 else Vector2.ZERO
				var push: float = T("buffet")["push"]
				for s in 16:
					var n: Vector2 = hero.world + u * push / 16.0
					if not is_open(m, n):
						break
					hero.world = n
		"moth:dust":
			if not crossed(t0, t1, hit):
				return
			sound(m, "whirl", 0.4)
			var c := cloud_at(m.world, wf)
			peril(m, "moth:dust", c, {"fx": wf.x, "fy": wf.y, "dur": D()["cloudLong"], "hit": 0.0, "dmg": m._roll() * float(T("dust")["bite"]), "b": m.world.x, "c": m.world.y})
		"moth:eyes":
			if not crossed(t0, t1, hit):
				return
			# ECLIPSE: her shadow strikes; whoever is in it is struck (rolling, not)
			var ax: float = a1.get("ax", wf.x)
			var ay: float = a1.get("ay", wf.y)
			sound(m, "gust", 0.7)
			hero.kick(4.0)
			peril(m, "moth:eclipse", m.world, {"fx": ax, "fy": ay, "dur": D()["eclipse"]["after"], "hit": 0.0})
			if open_to(hero) and MP.in_eclipse(m.world.x, m.world.y, ax, ay, hero.world.x, hero.world.y):
				blow(m, hero, a["dmg"])
		"moth:swarm":
			if not crossed(t0, t1, hit):
				return
			# PHANTOMS: three of her, each down its lane, one after another (their mark strikes)
			sound(m, "whirl", 0.8)
			peril(m, "moth:phantoms", m.world, {"fx": a1.get("ax", wf.x), "fy": a1.get("ay", wf.y), "dur": D()["phantomsLong"], "hit": 0.0, "dmg": m._roll() * float(D()["phantoms"]["dmg"]), "a": 0})
		"moth:land":
			if crossed(t0, t1, D()["land"]["touch"]):
				sound(m, "slam", 0.6)
				hero.kick(5.0)
		"moth:beat":
			if not crossed(t0, t1, hit):
				return
			sound(m, "gust", 1.0)
			hero.kick(6.0)
			peril(m, "moth:wave", m.world, {"dur": D()["waveFx"]["long"], "hit": 0.0, "dmg": m._roll() * float(a["dmg"])})


func died(m) -> void:
	# (her scream: the first sound she ever makes; every word she swallowed flying home, far off over the top)
	sound(m, "boss_roar", 1.0)
	m.mgr.hero.kick(8.0)
	var w := picture_way(m.face)
	peril(m, "moth:words", m.world, {"fx": w.x, "fy": w.y, "dur": 6.0, "hit": 0.0})
	# (her Hush, her phantoms and her ring harm nothing more once she is dead: they are left to fade)
	for p in m.mgr.perils.list:
		var n := str(p.get("a1", ""))
		if n == "moth:dust" or n == "moth:shed" or n == "moth:wave" or n == "moth:phantoms" or n == "moth:eclipse":
			p["done"] = 1


## Her picture in place of the one her gait gives (render/act1_fx/moth.ts sprite): struck, her flinch (on the book its own); else her
## beat, by its own clock, hovering and drifting the same frame for frame; on the book her perch.
func shown(m) -> Dictionary:
	if m.dead or m.state == "act":
		return {}
	var reel := "perchReel" if perched() else "reel"
	if m.art.has(reel) and m.struck_t < float(D()["reel"]):
		return {"list": reel, "i": floori(m.struck_t * m.art.fps(reel))}
	var B: Dictionary = D()["beat"]
	var i := floori(beat() * float(B["fps"]) + 1e-6) % int(B["frames"])
	if perched() and m.art.has("perch"):
		return {"list": "perch", "i": i}
	var walking := int(a1.get("walking", 0)) != 0 or mode == "walk" or mode == "setOff" or mode == "halt"
	return {"list": "walk" if walking else "idle", "i": i}


# --- the songbird (act3/quest1620.gd song_ready, sing) ---

## The phase she is in, for the song's once a phase.
func phase_now(m) -> int:
	return phase_of(m)
