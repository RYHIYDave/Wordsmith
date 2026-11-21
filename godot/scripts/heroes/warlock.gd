## THE WARLOCK (game/warlock.ts: "A demon inside. It wants out."; Strength and Intelligence his two, each a little less: words.gd), his
## moves as the game makes them (game.ts deliver, curseAll, damningAll, spreadBurns (monsters.gd), smokeThrough, smokeEcho, demonLands,
## warlockHit, hellOnIt, curseOne, stepPact, beginChange, stepChange; WARLOCK_TUNE), on what every hero's moves have in common
## (heroes/kit.gd), his words in them as for every hero.
## AS A MAN:
##   HELLFIRE BOLT (left button): a bolt of his hellfire at one enemy, 14 tiles a second, 9 at most; what it hits burns in his
##     hellfire, half the hit again each second for 4 s ("a relatively strong DOT").
##   CURSE (right button; 5 s): chains of smoke curse every enemy within 4.5 tiles that he can see: each struck a little, and it
##     smoulders (four tenths of that a second, 6 s); when a cursed one dies, every burn on it (his hellfire, the curse, fire, poison,
##     bleeding) leaps to the enemies within 3.5 tiles of it (monsters.gd spread_burns).
##   SMOKE STEP (Space; 4 s): he streaks to a spot as smoke (6 tiles at most, as near there as he can see; 0.28 s); nothing can hit
##     him, and whoever he passes through is struck and cursed, each once.
##   THE PACT: each hit of his fills it a thirtieth; full, his arm blazes, and R changes him: 2.4 s of the change, nothing harming
##     him, and the demon roars out of him, throwing back what is within 2.6 tiles.
## AS THE DEMON (its three in the places of his, his words in them: game/warlock.ts DEMON_KIT): CLAW RAKE (one claw, then the other,
##   2 tiles; what it tears is cursed), DAMNING (6 s: the ground erupts under every enemy within 6 tiles cursed or burning, it is
##   struck, every burn on it paid out at once, and it is thrown), SMOKE STEP (the violent one: it rakes, curses and knocks aside
##   whoever it passes through, and bursts out where it stops). Its pact runs dry in 18 s (each of its hits putting a little back);
##   empty, the demon burns out (2 s) and he is a man again.
## Left out: his tree (the talents: the game's switch for them is off).
extends "res://scripts/heroes/kit.gd"

const PF := preload("res://scripts/pixel_font.gd")

const W := {
	"hell": {"share": 0.5, "secs": 4.0},
	"curse": {"share": 0.4, "secs": 6.0},
	"pact": {"full": 30.0, "hit": 1.0, "demonSecs": 18.0, "demonHit": 0.2},
	"change": {"secs": 2.4, "roar": 2.6},
	"burnOut": {"secs": 2.0},
	"damning": {"pay": 1.0, "throw": 1.6},
	"step": {"secs": 0.28, "demonSecs": 0.3, "aside": 1.2, "burst": 1.6, "burstShare": 0.6},
}

## "man" or "demon"; his pact (0 to 30); the change he is in the middle of ({to, t, dur}, empty when none)
var form := "man"
var pact := 0.0
## (HIS TREE: Bloodlust, the demon's kills since it came out; what a hit of his came by: "" his own, "chain" a Hex Chain's leap,
## "blaze" his Blazing Arm's burst: game.ts warlockBy)
var lust := 0
var _by := ""
const Talents := preload("res://scripts/talents.gd")


func _T() -> Dictionary:
	return Talents.D["warlockTalents"]
var change := {}
var _deny := 0.0


func _init(hero) -> void:
	super(hero, "warlock")


## (the look the hero's pictures are taken from: render.ts, the demon's while he is it, his arm blazing while his pact is full)
func look_key() -> String:
	if form == "demon":
		return "demon"
	return "blaze" if pact >= float(W["pact"]["full"]) and change.is_empty() else "dungeon"


func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_deny = maxf(0.0, _deny - dt)
	_tick(dt)
	# (nothing harms him while he changes; he does nothing else: game.ts updateHero, `if (h.change) return`)
	if not change.is_empty():
		_step_change(dt)
		return true
	_step_pact(dt)
	if not change.is_empty():
		return true
	return _act(dt, way, hooked)


# =====================================================================================================================
# WHAT HIS MOVES SEND (game.ts deliver: the bolt, the curse; the demon's rakes and Damning)

func _release_sound(def: Dictionary) -> void:
	var id: String = h.loadout.id(0)
	if def["kind"] == "melee":
		h.sfx.play("rake" if id == "rake" else "swing", linear_to_db(0.8))
	elif def["kind"] == "projectile":
		h.sfx.play("hellbolt" if id == "hellbolt" else "shot", linear_to_db(0.8))
	else:
		super(def)


func _deliver(i: int, from: Vector2, to: Vector2, frac: float, primary: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var way := to - from
	way = way / way.length() if way.length() >= 0.01 else h.face
	var each: float = frac * float(r["count_dmg"])
	var words: Array = h.loadout.wfronts(i)
	var echo := not primary
	var kind := str(def["kind"])
	h._cast(i, kind, from, way, echo)
	if primary:
		h._time_word_sound(i)
	if kind == "projectile":
		var base := atan2(way.y, way.x)
		var hit: Array = []
		var n: int = r["count"]
		for k in n:
			var a := base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 0.16)
			var u := Vector2(cos(a), sin(a))
			shots.append({"x": from.x + u.x * 0.4, "y": from.y + u.y * 0.4, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
				"r": minf(0.6, float(def["radius"]) * float(r["size"]) * (1.5 if float(r["splash"]) >= 1.5 else 1.0)), "dist": float(def["range"]),
				"dmg": each, "element": r["element"], "pierce": bool(r["pierce"]), "hit": hit, "volley": n > 1, "skill": i, "trail": 0.0,
				"words": words, "age": 0.0, "n": k, "flown": 0.0, "look": "hellbolt"})
	elif kind == "curse":
		# (every enemy near him struck and cursed; Twin, a second a moment later)
		if primary:
			h.sfx.play("curse", linear_to_db(0.8))
		var rad: float = float(def["radius"]) * float(r["size"])
		for k in int(r["count"]):
			if k == 0:
				_curse_all(i, from, rad, each, 0, echo)
			else:
				_after(0.28 * k, func() -> void: _curse_all(i, h.world, rad, each, k, echo))
	elif kind == "melee":
		# (the demon's rake: one claw, then the other; Twin, a second blow a moment after)
		for k in int(r["count"]):
			if k == 0:
				h._strike(i, from, way, each, 0, echo, float(def["range"]))
			else:
				_after(0.13 * k, func() -> void: h._strike(i, from if echo else h.world, way, each, k, echo, float(def["range"])))
	elif kind == "damning":
		# (every cursed or burning enemy near it struck, and all its burns paid out at once; Twin, a second eruption a moment later)
		if primary:
			h.sfx.play("damning", linear_to_db(0.9))
		var rad: float = float(def["radius"]) * float(r["size"])
		for k in int(r["count"]):
			if k == 0:
				_damning_all(i, from, rad, each, 0, echo)
			else:
				_after(0.28 * k, func() -> void: _damning_all(i, h.world, rad, each, k, echo))
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, kind, from, way, again)


## (game.ts curseAll) Every enemy within `rad` that he can see struck and cursed, chains of smoke to each.
func _curse_all(i: int, at: Vector2, rad: float, frac: float, n := 0, echo := false) -> void:
	var to: Array = []
	var them: Array = []
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m) or m.world.distance_to(at) > rad + m.r or not h.monsters.sees(at, m.world):
				continue
			to.append({"id": m.id, "x": m.world.x, "y": m.world.y})
			them.append(m)
	_say({"t": "curse", "x": at.x, "y": at.y, "r": rad, "to": to, "n": n, "echo": echo})
	h.sfx.play("rune", linear_to_db(0.5 if n > 0 or echo else 0.8))
	var words: Array = h.loadout.wfronts(i)
	if words.has("power"):
		h.sfx.play("power", linear_to_db(0.9))
	if words.has("heavy"):
		h._tell({"t": "heavy", "x": at.x, "y": at.y, "r": rad, "big": true})
	var hits := 0
	for m in them:
		if is_instance_valid(m) and not m.dead:
			h.hit_monster(m, i, frac, hits >= 3)
			hits += 1
	if hits > 0:
		h._landed_on(i)
		if float(h.loadout.r(i)["pull"]) > 0.0:
			h.city.pull_in(i, at, rad, false)
	if n == 0:
		h._wake(i, at, rad, frac)


## (game.ts damningAll) Every enemy within `rad` cursed or burning: the ground erupts under it, it is struck, every burn on it is paid
## out at once, and it is thrown.
func _damning_all(i: int, at: Vector2, rad: float, frac: float, n := 0, echo := false) -> void:
	var D: Dictionary = W["damning"]
	var spots: Array = []
	var them: Array = []
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m) or m.world.distance_to(at) > rad + m.r:
				continue
			if m.curse_t > 0.0 or m.hell_t > 0.0 or m.burn_t > 0.0:
				spots.append({"id": m.id, "x": m.world.x, "y": m.world.y})
				them.append(m)
	_say({"t": "damning", "x": at.x, "y": at.y, "at": spots, "n": n, "echo": echo})
	if h.loadout.wfronts(i).has("heavy"):
		h._tell({"t": "heavy", "x": at.x, "y": at.y, "r": rad, "big": true})
	h.kick(2.0 if n > 0 or echo else 4.0)
	h.sfx.play("slam", linear_to_db(0.6 if n > 0 or echo else 1.0))
	var hits := 0
	for m in them:
		if not is_instance_valid(m) or m.dead:
			continue
		# every burn still to come, paid now
		var owed: float = (m.hell_dps * m.hell_t if m.hell_t > 0.0 else 0.0) + (m.curse_dps * m.curse_t if m.curse_t > 0.0 else 0.0) \
			+ (m.burn_dps * m.burn_t if m.burn_t > 0.0 else 0.0) + (m.poison_dps * m.poison_t if m.poison_t > 0.0 else 0.0) \
			+ (m.bleed_dps * m.bleed_t if m.bleed_t > 0.0 else 0.0)
		m.hell_t = 0.0
		m.curse_t = 0.0
		m.burn_t = 0.0
		m.poison_t = 0.0
		m.bleed_t = 0.0
		h.hit_monster(m, i, frac, hits >= 3)
		hits += 1
		if not m.dead and owed * float(D["pay"]) >= 1.0:
			m.damage(roundf(owed * float(D["pay"])), "fire", false, false, [], false, true, i)
		if not m.dead:
			m.throw_from(at, float(D["throw"]), 0.25)
	if hits > 0:
		h._landed_on(i)
		if float(h.loadout.r(i)["pull"]) > 0.0:
			h.city.pull_in(i, at, rad, false)
	if n == 0:
		h._wake(i, at, rad, frac)


## (game.ts warlockHit) What a hit of his sets going: his hellfire (the bolt), the curse (the Curse, the smoke steps, the rakes); and
## his pact, filled by his hits as a man, a little put back by the demon's.
func on_hit(m, i: int, dmg: float) -> void:
	var id: String = h.loadout.id(i)
	var bolt := id == "hellbolt"
	var was_cursed: bool = m.curse_t > 0.0
	if not m.dead and bolt:
		_hell_on(m, dmg)
	if not m.dead and id in ["curse", "smokestep", "rake", "demonstep"]:
		_curse_one(m, dmg)
	# (HIS TREE: Branded, every Hellfire Bolt curses what it hits)
	if not m.dead and bolt and h.has("branded"):
		_curse_one(m, dmg)
	# (HIS TREE: Hex Chain, a bolt on one cursed leaps on to the next; Blazing Arm, with his pact full his bolt bursts)
	if bolt and _by == "" and was_cursed and h.has("hexchain"):
		_hex_chain(m, i)
	if bolt and (_by == "" or _by == "chain") and form != "demon" and pact >= float(W["pact"]["full"]) and h.has("blazingarm"):
		_blaze(m, i, dmg)
	var full: float = W["pact"]["full"]
	var was := pact
	if form == "demon":
		pact = minf(full, was + float(W["pact"]["demonHit"]))
	elif change.is_empty():
		pact = minf(full, was + float(W["pact"]["hit"]))
		if was < full and pact >= full:
			_say({"t": "pactFull", "x": h.world.x, "y": h.world.y})
			h.sfx.play("power", linear_to_db(0.8))


## (game.ts hellOnIt) It burns in his hellfire: half the hit each second for 4 s, a stronger taking the place of a weaker.
func _hell_on(m, dmg: float) -> void:
	var dps := dmg * float(W["hell"]["share"])
	if m.hell_t <= 0.0:
		_say({"t": "hellOn", "id": m.id, "x": m.world.x, "y": m.world.y})
	if m.hell_t <= 0.0 or dps > m.hell_dps:
		m.hell_dps = dps
	m.hell_t = W["hell"]["secs"]


## (game.ts curseOne) Cursed: it smoulders, four tenths of the hit that cursed it each second, 6 s; a stronger curse takes the place of
## a weaker.
func _curse_one(m, dmg: float) -> void:
	var dps := dmg * float(W["curse"]["share"])
	if m.curse_t <= 0.0 or dps > m.curse_dps:
		m.curse_dps = dps
	m.curse_t = W["curse"]["secs"]


# =====================================================================================================================
# THE SMOKE STEP (game.ts useEvasive, kind smoke; smokeThrough; smokeEcho; demonLands)

func _use_evasive(at: Vector2, way: Vector2) -> void:
	var def := _def(2)
	at = _evasive_at(at, way)
	if charges[2] < 1:
		return
	var land := _reach_point(at, float(def["range"]))
	if land.distance_to(h.world) < 0.5:
		if _deny <= 0.0:
			_deny = 0.8
			h.sfx.play("deny")
			h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "No room", "color": "#8c8090"})
		return
	_pay_evasive()
	_face(at)
	h.sfx.play("smokestep")
	var r: Dictionary = h.loadout.r(2)
	var x0: Vector2 = h.world
	var dir: Vector2 = (at - x0).normalized() if at.distance_to(x0) > 0.0 else h.face
	h._cast(2, "smoke", x0, dir)
	h._boons(2)
	h._time_word_sound(2)
	h.last.dodge_surge(x0)
	var demon: bool = h.loadout.id(2) == "demonstep"
	move = {"kind": "smoke", "from": x0, "to": land, "t": 0.0, "dur": float(W["step"]["demonSecs"] if demon else W["step"]["secs"]), "hit": [], "demon": demon}
	h._act = "lunge"
	h._invuln = maxf(h._invuln, 0.06)
	_say({"t": "smoke", "x0": x0.x, "y0": x0.y, "x1": land.x, "y1": land.y, "demon": demon})
	if demon:
		h.sfx.play("slam", linear_to_db(0.6))
	else:
		# behind: left where he went up in smoke
		h._wake(2, x0, float(def["radius"]) * float(r["size"]), float(r["count_dmg"]))
		# (HIS TREE: Phantom Step, his shadow left where he stood: the enemies near go after it, not him, a while: the decoys)
		if h.has("phantomstep") and h.monsters != null:
			var P: Dictionary = _T()["phantom"]
			var d := {"x": x0.x, "y": x0.y, "t": float(P["secs"]), "r": float(P["reach"]), "size": h.RADIUS}
			h.monsters.decoys.append(d)
			_say({"t": "phantom", "x": x0.x, "y": x0.y, "secs": P["secs"]})
			_shadow_of(d)
	# "of Echoes": a moment later the smoke streaks along the same way again, weaker
	if float(r["echo"]) > 0.0:
		var x1 := land
		var again := func() -> void: _smoke_echo(x0, x1, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]))
		h._echo_of(2, "smoke", x0, dir, again)


func _move_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
	h._invuln = maxf(h._invuln, 0.06)
	var k := clampf(float(move["t"]) / float(move["dur"]), 0.0, 1.0)
	h.world = (move["from"] as Vector2).lerp(move["to"], k)
	_anim_t += dt
	_smoke_through()
	if k >= 1.0:
		var demon: bool = move["demon"]
		move = {}
		h._act = ""
		_anim_t = 0.0
		if demon:
			_demon_lands()


## (game.ts smokeThrough) Whoever the smoke passes through is struck (the demon's rakes it and knocks it aside) and cursed, each once.
func _smoke_through() -> void:
	if h.monsters == null:
		return
	var def := _def(2)
	var r: Dictionary = h.loadout.r(2)
	var hit: Array = move["hit"]
	var reach: float = float(def["radius"]) * float(r["size"])
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or hit.has(m) or h.monsters.shut_in(m):
			continue
		if m.world.distance_to(h.world) > reach + m.r:
			continue
		hit.append(m)
		_say({"t": "smokeHit", "id": m.id, "x": m.world.x, "y": m.world.y, "n": 0, "echo": false})
		h.hit_monster(m, 2, float(r["count_dmg"]), hit.size() > 3)
		if hit.size() == 1:
			h._landed_on(2)
			if h.loadout.wfronts(2).has("heavy"):
				h._tell({"t": "heavy", "x": m.world.x, "y": m.world.y, "r": reach, "big": false})
			if float(r["pull"]) > 0.0:
				h.city.pull_in(2, m.world, reach * 2.0, false)
		# (Twin: each struck again a moment later)
		var id: String = h.loadout.id(2)
		for k in range(1, int(r["count"])):
			_after(0.13 * k, func() -> void:
				if not is_instance_valid(m) or m.dead or h.loadout.id(2) != id:
					return
				_say({"t": "smokeHit", "id": m.id, "x": m.world.x, "y": m.world.y, "n": k, "echo": false})
				h.hit_monster(m, 2, float(h.loadout.r(2)["count_dmg"]), true))
		if bool(move["demon"]) and not m.dead:
			# knocked aside, off its line
			var l: Vector2 = (move["to"] as Vector2) - (move["from"] as Vector2)
			var side := 1.0 if (m.world.x - h.world.x) * l.y - (m.world.y - h.world.y) * l.x >= 0.0 else -1.0
			var len := l.length() if l.length() > 0.0 else 1.0
			m.throw_from(m.world - Vector2(l.y / len * side, -l.x / len * side), float(W["step"]["aside"]), 0.2)


## (game.ts smokeEcho) "Of Echoes": the smoke streaks along its way again, striking and cursing whoever it passes through.
func _smoke_echo(x0: Vector2, x1: Vector2, frac: float) -> void:
	var def := _def(2)
	var r: Dictionary = h.loadout.r(2)
	var demon: bool = h.loadout.id(2) == "demonstep"
	_say({"t": "smoke", "x0": x0.x, "y0": x0.y, "x1": x1.x, "y1": x1.y, "demon": demon, "echo": true})
	var l := x1 - x0
	var l2 := l.length_squared() if l.length_squared() > 0.0 else 1.0
	var hits := 0
	if h.monsters == null:
		return
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m):
			continue
		var k := clampf(((m.world.x - x0.x) * l.x + (m.world.y - x0.y) * l.y) / l2, 0.0, 1.0)
		var reach: float = float(def["radius"]) * float(r["size"]) + (float(W["step"]["aside"]) if demon else 0.0)
		if m.world.distance_to(x0 + l * k) > reach + m.r:
			continue
		_say({"t": "smokeHit", "id": m.id, "x": m.world.x, "y": m.world.y, "n": 0, "echo": true})
		h.hit_monster(m, 2, frac, hits >= 3)
		hits += 1
	if hits > 0:
		h._landed_on(2)


## (game.ts demonLands) The demon's smoke step ends: it bursts out of the smoke, its claws slammed down, knocking back whoever is there.
func _demon_lands() -> void:
	var r: Dictionary = h.loadout.r(2)
	var S: Dictionary = W["step"]
	h.kick(3.0)
	h._blast(2, h.world + h.face * 0.6, float(S["burst"]) * float(r["size"]), float(r["count_dmg"]) * float(S["burstShare"]), "land", false, linear_to_db(0.8))
	if h.monsters != null:
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) <= float(S["burst"]) + m.r:
				m.throw_from(h.world, 1.2, 0.2)
	# behind: left where it bursts out, as far as it throws them
	h._wake(2, h.world, float(S["burst"]) * float(r["size"]) + 1.2, float(r["count_dmg"]))


# =====================================================================================================================
# THE PACT AND THE CHANGE (game.ts stepPact, beginChange, stepChange)

func _step_pact(dt: float) -> void:
	var P: Dictionary = W["pact"]
	if form == "demon":
		pact = maxf(0.0, pact - float(P["full"]) / float(P["demonSecs"]) * dt)
		if pact <= 0.0:
			_begin_change("man")
		return
	var asked: bool = Input.is_action_just_pressed("change") or h.get("auto_change") == true
	if h.get("auto_change") == true:
		h.auto_change = false
	if asked and pact >= float(P["full"]) and move.is_empty():
		_begin_change("demon")


## He begins to change, into the demon or back: whatever he was doing is broken off.
func _begin_change(to: String) -> void:
	windup = {}
	queued = {}
	attack = {}
	move = {}
	swing_step = {}
	combo = 0
	combo_t = 0.0
	var dur: float = W["change"]["secs"] if to == "demon" else W["burnOut"]["secs"]
	change = {"to": to, "t": 0.0, "dur": dur}
	h._invuln = maxf(h._invuln, dur)
	_anim_t = 0.0
	h._act = ""
	_say({"t": "change", "to": to, "x": h.world.x, "y": h.world.y})
	h.sfx.play("power" if to == "demon" else "deny", linear_to_db(0.9))


## The change goes on; at its end he is the demon (it roars, throwing back what is near) or a man again.
func _step_change(dt: float) -> void:
	change["t"] = float(change["t"]) + dt
	h._invuln = maxf(h._invuln, 0.06)
	if float(change["t"]) < float(change["dur"]):
		return
	var to: String = change["to"]
	change = {}
	_anim_t = 0.0
	if to == "demon":
		lust = 0
		_become("demon")
		pact = W["pact"]["full"]
		var R: float = W["change"]["roar"]
		_say({"t": "roar", "x": h.world.x, "y": h.world.y, "r": R, "formed": true})
		h.kick(5.0)
		h.sfx.play("explode", linear_to_db(0.8))
		if h.monsters != null:
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) <= R + m.r:
					m.throw_from(h.world, 1.5, 0.25)
	else:
		# (HIS TREE: Last Rites, as the demon burns out, Damning goes off by itself round him)
		if form == "demon" and h.has("lastrites"):
			var r1: Dictionary = h.loadout.r(1)
			_damning_all(1, h.world, float(Words.skill("damning")["radius"]) * float(r1["size"]), float(r1["count_dmg"]))
		lust = 0
		_become("man")
		pact = 0.0


## (game.ts refresh) His three: the demon's in the places of his while he is it; his pictures' times with them.
func _become(f: String) -> void:
	form = f
	h.loadout.form_moves = Words.data()["demonKit"] if f == "demon" else []
	h.loadout.refresh()
	C = clips["warlock:demon"] if f == "demon" else clips["warlock"]


# =====================================================================================================================
# HIS PICTURES: the change (its own pictures, by how far through it he is), the smoke step (his run, twice as fast)

func _own_picture(side: int) -> Array:
	if not change.is_empty():
		var n: int = h.art.count(side, 56)
		if n > 0:
			return [56, clampi(floori(float(change["t"]) / float(change["dur"]) * n), 0, n - 1)]
		return [0, 0]
	if not move.is_empty():
		var n: int = h.art.count(side, 2)
		return [2, posmod(floori(_anim_t * 2.0 * float(C["walkFps"])), maxi(1, n))]
	return []


## THE PACT OVER HIS HEAD (render.ts, his pick of 28 Oct: "Bar over his head"): a thin cyan bar just under his life bar, filling as he
## hits; full, it blazes and says how he changes; as the demon, it runs down. There while the life bar is (`shown` 1), and always
## while it is full, he is the demon, or he changes. On `c` (hero.gd), `top` where his life bar is (picture pixels).
func draw_over(c: CanvasItem, top: float, shown: float) -> void:
	if not h.alive:
		return
	var full: float = W["pact"]["full"]
	var k := clampf(pact / full, 0.0, 1.0)
	var demon := form == "demon"
	var blaze := not demon and k >= 1.0 and change.is_empty()
	var a := maxf(shown, 1.0 if blaze or demon or not change.is_empty() else 0.0)
	if a <= 0.01:
		return
	var w := 44.0
	var x := -w / 2.0
	var y := top + 5.0 + 4.0
	var t := _clock
	var hot := blaze and floori(t * 6.0) % 2 == 0
	var ink := Color("#0e0c24")
	c.draw_rect(Rect2(x - 2, y - 2, w + 4, 8), Color(Color.WHITE if hot else Color("#22d0e0"), a) if blaze else Color(ink, a))
	c.draw_rect(Rect2(x, y, w, 4), Color(Color("#0a2630"), a))
	var fill := roundf(k * w / 2.0) * 2.0
	c.draw_rect(Rect2(x, y, fill, 4), Color(Color("#e8ffff") if hot else Color("#b8fff8"), a) if blaze else Color(Color("#22d0e0"), a))
	c.draw_rect(Rect2(x, y, fill, 2), Color(Color("#b8fff8"), a))
	if blaze:
		# (its fire licking up off it, and what to do)
		for i in 4:
			var fx0 := x + 4.0 + float((i * 7 + floori(t * 11.0)) % int(w / 2.0 - 3.0)) * 2.0
			var up := 1 + (i + floori(t * 9.0)) % 3
			c.draw_rect(Rect2(fx0, y - 2.0 - up * 2.0, 2.0, up * 2.0), Color("#e8ffff") if up > 2 else Color("#22d0e0"))
		# (over the life bar, clear of his head)
		PF.draw(c, "R: CHANGE", 0.0, top - 22.0, Color("#e8ffff") if hot else Color("#22d0e0"), {"align": "center", "font": "small", "shadow": ink, "scale": 2})


func readiness() -> Dictionary:
	var r := super()
	r["pact"] = pact / float(W["pact"]["full"])
	r["form"] = form
	return r


func _clear_own() -> void:
	for sh in _shadows:
		if is_instance_valid(sh["node"]):
			sh["node"].queue_free()
	_shadows.clear()


## (Phantom Step) His shadows standing where he stepped from: {d: its decoy, node}.
var _shadows: Array = []
const FigureFx := preload("res://scripts/fx_figures.gd")


## (render.ts drawShadows) Him as he stood the moment he stepped away, gone dark as his smoke, an edge of the friend's cyan either
## side; among what stands, where he stood.
func _shadow_of(d: Dictionary) -> void:
	var holder = h.get_parent()
	if holder == null or h._sprite == null:
		return
	var node := Node2D.new()
	node.position = h.position
	for k in 3:
		var sp := Sprite2D.new()
		sp.texture = h._sprite.texture
		sp.centered = h._sprite.centered
		sp.offset = h._sprite.offset
		sp.scale = h._sprite.scale
		sp.position = h._sprite.position + Vector2([-2.0, 2.0, 0.0][k], 0.0)
		sp.material = FigureFx._flat_material()
		sp.modulate = Color("#22d0e0") if k < 2 else Color("#0c0e22")
		node.add_child(sp)
	holder.add_child(node)
	_shadows.append({"d": d, "node": node})


## His shadows: each flickering, fading as its time runs out, gone with it; his decoys (not a Golem's) run out.
func _step_own(dt: float) -> void:
	if h.monsters != null:
		for k in range(h.monsters.decoys.size() - 1, -1, -1):
			var d: Dictionary = h.monsters.decoys[k]
			if d.get("golem") != null:
				continue
			d["t"] = float(d["t"]) - dt
			if float(d["t"]) <= 0.0:
				h.monsters.decoys.remove_at(k)
	for k in range(_shadows.size() - 1, -1, -1):
		var sh: Dictionary = _shadows[k]
		var d: Dictionary = sh["d"]
		var node = sh["node"]
		if float(d["t"]) <= 0.0 or not is_instance_valid(node):
			if is_instance_valid(node):
				node.queue_free()
			_shadows.remove_at(k)
			continue
		var fade := minf(1.0, float(d["t"]) / 0.4) * (0.85 + 0.15 * sin(Time.get_ticks_msec() / 1000.0 * 23.0 + float(d["x"])))
		var kids: Array = node.get_children()
		for j in kids.size():
			var c: Color = kids[j].modulate
			c.a = (0.45 if j < 2 else 0.9) * fade
			kids[j].modulate = c


# =====================================================================================================================
# HIS TREE (game/talents.ts WARLOCK_TREE; game.ts warlockHit, warlockKill, hexChain, blaze, pyre, lastRites; WARLOCK_TUNE.talents)

## (Hex Chain) A bolt on one cursed leaps on to the next cursed one near it, up to three times, burning each.
func _hex_chain(from, i: int) -> void:
	var T: Dictionary = _T()["hexChain"]
	var hit: Array = [from]
	var at = from
	for k in int(T["leaps"]):
		var best = null
		var bd: float = T["reach"]
		for q in h.monsters.list:
			if not is_instance_valid(q) or q.dead or hit.has(q) or q.curse_t <= 0.0 or h.monsters.shut_in(q):
				continue
			var d: float = q.world.distance_to(at.world) - q.r
			if d < bd:
				bd = d
				best = q
		if best == null:
			return
		hit.append(best)
		var to = best
		var x0: Vector2 = at.world
		h._after(float(T["gap"]) * (k + 1), func() -> void:
			if not is_instance_valid(to) or to.dead or h.loadout.id(i) != "hellbolt":
				return
			_say({"t": "hexLeap", "x0": x0.x, "y0": x0.y, "x1": to.world.x, "y1": to.world.y})
			h.sfx.play("fire", linear_to_db(0.4))
			_by = "chain"
			h.hit_monster(to, i, float(T["share"]), true)
			_by = "")
		at = best


## (Blazing Arm) With his pact full, his bolt bursts: all near cursed and struck.
func _blaze(m, i: int, dmg: float) -> void:
	var T: Dictionary = _T()["blazing"]
	_say({"t": "blaze", "x": m.world.x, "y": m.world.y, "r": T["r"]})
	h.sfx.play("fire", linear_to_db(0.7))
	var was := _by
	_by = "blaze"
	var n := 0
	for o in h.monsters.list:
		if not is_instance_valid(o) or o == m or o.dead or h.monsters.shut_in(o) or o.world.distance_to(m.world) > float(T["r"]) + o.r:
			continue
		h.hit_monster(o, i, float(T["share"]), n >= 3)
		n += 1
		if not o.dead:
			_curse_one(o, dmg)
	_by = was


## A kill of his (game.ts warlockKill): the demon's (Hunger, Feast, Bloodlust); a cursed one's (Soul Debt, Pyre).
func on_kill(m) -> void:
	var T := _T()
	var P: Dictionary = W["pact"]
	if form == "demon":
		if h.has("hunger"):
			pact = minf(float(P["full"]), pact + float(T["hunger"]["secs"]) * (float(P["full"]) / float(P["demonSecs"])))
		if h.has("feast"):
			var n: float = h.max_life * float(T["feast"]["share"])
			h.heal_flat(n)
			_say({"t": "heal", "amount": roundi(n)})
		if h.has("bloodlust"):
			lust += 1
	if m.curse_t > 0.0:
		if h.has("souldebt"):
			pact = minf(float(P["full"]), pact + float(P["full"]) * float(T["soulDebt"]["share"]))
		if h.has("pyre"):
			var at: Vector2 = m.world
			h._after(0.05, func() -> void: _pyre(at))


## (Pyre) A cursed one bursts in his hellfire as it dies: everything near struck, as his Curse strikes.
func _pyre(at: Vector2) -> void:
	var T: Dictionary = _T()["pyre"]
	_say({"t": "pyre", "x": at.x, "y": at.y, "r": T["r"]})
	h.sfx.play("fire", linear_to_db(0.6))
	var n := 0
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead or h.monsters.shut_in(o) or o.world.distance_to(at) > float(T["r"]) + o.r:
			continue
		h.hit_monster(o, 1, float(T["share"]), n >= 3)
		n += 1


## (Bloodlust) Every kill the demon makes its rakes the quicker, up to twice as quick, till it burns out.
func rate_k() -> float:
	if form == "demon" and h.has("bloodlust"):
		var B: Dictionary = _T()["bloodlust"]
		return minf(float(B["most"]), 1.0 + lust * float(B["each"]))
	return 1.0
