## REAPING WITH THE DAMAGE RUNES IN THE FIGHT (his words, 24 Nov 2026: “Should there be a specific new creature per damage type for
## reaping.  Like reaping and fire makes little imps that throw fireballs instead of the shades.  What would the others be?”;
## offered the five, “Yes and work on reaping”; their text tools/meldsreap/docs_reap.txt; behind melds52.gd REAP_ON). Each does
## the work of both its runes, as every melded word does (words.gd resolve: Reaping's soul and spirit, and its damage rune's own),
## and a twist of its own:
##   IN FRONT, on a kill (last_words.gd killed): Cinderbrood, one that dies burning passes its fire to those near it; Wintergrave,
##     one that dies frozen shatters, chilling those near it; Stormwake, each soul looses a bolt at the nearest enemy; Bogborn,
##     one that dies poisoned bursts, poisoning those near it; Charnel, each soul gathered adds to his damage a while (his might).
##   BEHIND (last_words.gd _raise_spirit, _step_spirits): what it kills rises as its own creature in place of the grey spirit, for
##     as long and as many at once: the IMP keeps its distance and hurls fireballs that set what they hit burning; the RIMELING
##     flings icicles that chill, then freeze; the STORMWISP darts in and zaps, each zap jumping on to a second enemy; the BLIGHT
##     TOAD hops after them and spits venom, and bursts in a cloud of poison as it goes; the BONEBRUTE stomps up and slams the
##     ground, striking all round it and throwing them back. What they kill is no one's, and raises none (as the spirit's).
##   ON ENEMIES (monster.gd, as it dies): its blows do what its damage rune's do; and in place of rising once it rises as its
##     creature against him, in the enemy's pink, for a few seconds: its every blow marked on the floor before it lands (the
##     perils' warning), so that he can step out of it.
## Numbers melds52.json `tune` (tools/melds52/tune.json). The looks fx_m52p_reap.gd; the creatures' pictures assets/words/reap5_*.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const KIND := {"cinderbrood": "imp", "wintergrave": "rimeling", "stormwake": "stormwisp", "bogborn": "toad", "charnel": "bonebrute"}
const EL := {"cinderbrood": "fire", "wintergrave": "frost", "stormwake": "lightning", "bogborn": "poison", "charnel": "phys"}
const RUNE := {"cinderbrood": "fire", "wintergrave": "frost", "stormwake": "lightning", "bogborn": "poison", "charnel": "power"}
## (which keep their distance and throw, and which come close; which walk the ground and so keep to the open floor)
const THROWS := ["imp", "rimeling", "toad"]
const GROUNDED := ["toad", "bonebrute"]
## (the sounds each makes, the game's own: as it rises, as it lets fly, as its blow lands)
const SOUNDS := {"imp": ["reap_spirit", "fire", "fire_pop"], "rimeling": ["reap_spirit", "frost", "shatter"],
	"stormwisp": ["reap_spirit", "zap", "zap"], "toad": ["reap_spirit", "poison", "poison"], "bonebrute": ["bones_aggro", "atkBones", "slam"]}

var lw
var hero
## THE CREATURES RISEN OUT OF HIS ENEMIES AGAINST HIM: {id, meld, kind, x, y, t, life, next, atk, fx, fy, dmg, foe: true}
var foes: Array = []
## (what is in flight: a fireball, an icicle, a spit of venom; and the toads' clouds)
var shots: Array = []
var clouds: Array = []
static var _clip := {}


func _init(l) -> void:
	lw = l
	hero = l.hero


static func on() -> bool:
	return M52.REAP_ON


static func is_reap(id) -> bool:
	return id != null and KIND.has(str(id))


static func T(id: String) -> Dictionary:
	return M52.tune(id)


## Its attack's length and the moment in it its blow lands (seconds), from its pictures' own (reap5_<kind>.json).
static func clip(kind: String) -> Array:
	if not _clip.has(kind):
		var d = JSON.parse_string(FileAccess.get_file_as_string("res://assets/words/reap5_%s.json" % kind))
		var s: Dictionary = d["friend"][0]
		_clip[kind] = [float((s["attack"] as Array).size()) / float(s["attackFps"]), float(s["attackHit"])]
	return _clip[kind]


func _list() -> Array:
	return hero.monsters.list if hero.monsters != null and is_instance_valid(hero.monsters) else []


func _ok(o) -> bool:
	return is_instance_valid(o) and not o.dead and o.state != "sleep" and o.state != "rise" and not lw._shut(o)


func _tell(e: Dictionary) -> void:
	if hero.m52 != null:
		hero.m52._tell(e)


func fresh_place() -> void:
	foes = []
	shots = []
	clouds = []


# --- IN FRONT -----------------------------------------------------------------------------------------------------------

## A kill by move `i`, `id` in front of it: its twist on what fell.
func front_kill(m, i: int, id: String) -> void:
	var t := T(id)
	var at: Vector2 = m.world
	var near := func(r: float) -> Array:
		return _list().filter(func(o): return _ok(o) and o != m and o.world.distance_to(at) <= r + o.r * 0.5)
	_tell({"id": id, "what": "soul", "x": at.x, "y": at.y})
	match id:
		"cinderbrood":
			if float(m.burn_t) > 0.0:
				var dps: float = maxf(1.0, float(m.burn_base()) * float(t["spreadK"]))
				var hit: Array = near.call(float(t["spreadR"]))
				for o in hit:
					o.set_alight(dps, float(t["spreadSecs"]))
				_tell({"id": id, "what": "spread", "x": at.x, "y": at.y, "n": hit.size(), "r": float(t["spreadR"]), "to": hit.map(func(o): return o.world)})
				lw.rec("reap_soul")
		"wintergrave":
			if float(m.frozen_t) > 0.0:
				var hit: Array = near.call(float(t["shatterR"]))
				for o in hit:
					o.chill_by(float(t["shatterChill"]))
				_tell({"id": id, "what": "shatter", "x": at.x, "y": at.y, "n": hit.size(), "r": float(t["shatterR"])})
				hero.sfx.play("shatter", linear_to_db(0.7))
		"stormwake":
			var best = null
			var bd := float(t["boltR"])
			for o in near.call(float(t["boltR"])):
				var d: float = o.world.distance_to(at)
				if d < bd:
					bd = d
					best = o
			if best != null:
				var dmg: float = maxf(1.0, roundf(hero.avg_hit(i, float(t["boltDmg"]))))
				best.damage(hero.side(best, dmg, i), "lightning", false, false, [], false, false, -1)
				_tell({"id": id, "what": "bolt", "x": at.x, "y": at.y, "x1": best.world.x, "y1": best.world.y})
				hero.sfx.play("zap", linear_to_db(0.6))
		"bogborn":
			if float(m.poison_t) > 0.0:
				var dps: float = maxf(1.0, float(m.poison_dps) * float(t["burstK"]))
				var hit: Array = near.call(float(t["burstR"]))
				for o in hit:
					o.dose(dps)
				_tell({"id": id, "what": "puff", "x": at.x, "y": at.y, "n": hit.size(), "r": float(t["burstR"])})
				hero.sfx.play("poison", linear_to_db(0.6))
		"charnel":
			var most: float = float(t["might"]) * float(t["mightMost"])
			if hero.might < most:
				hero.might = minf(most, hero.might + float(t["might"]))
			hero.might_t = maxf(hero.might_t, float(t["mightSecs"]))
			_tell({"id": id, "what": "might", "x": hero.world.x, "y": hero.world.y, "x1": at.x, "y1": at.y})


# --- BEHIND: HIS CREATURES ----------------------------------------------------------------------------------------------

## A spirit about to rise for move `i` (last_words.gd _raise_spirit): made its creature if `id` is one of the five behind.
func make_creature(sp: Dictionary, id: String) -> void:
	var kind: String = KIND[id]
	sp["meld"] = id
	sp["kind"] = kind
	sp["atk"] = -1.0
	sp["next"] = 0.6
	sp["fx"] = 1.0
	sp["fy"] = 0.0
	_tell({"id": id, "what": "rise", "x": sp["x"], "y": sp["y"]})


## Where it may stand (one that walks keeps to the open floor; one that flies goes where it will).
func _may(kind: String, p: Vector2) -> bool:
	if not GROUNDED.has(kind):
		return true
	var map = hero.monsters.get("map") if hero.monsters != null and is_instance_valid(hero.monsters) else null
	return map == null or map.open_at(floori(p.x), floori(p.y))


func _go(c: Dictionary, to: Vector2, stop: float, speed: float, dt: float) -> bool:
	var at := Vector2(c["x"], c["y"])
	var d := at.distance_to(to)
	var keep := 0.0
	if d > stop + 0.05:
		keep = minf(d - stop, speed * dt)
	elif d < stop - 0.6 and THROWS.has(c["kind"]):
		keep = -minf(stop - d, speed * 0.6 * dt)
	if absf(keep) < 1e-4 or d < 1e-4:
		return false
	var nxt := at + (to - at) / d * keep
	if not _may(c["kind"], nxt):
		return false
	c["x"] = nxt.x
	c["y"] = nxt.y
	return true


## One of his creatures' turn (in place of the grey spirit's: last_words.gd _step_spirits). `sp` is the spirit.
func step_friend(sp: Dictionary, dt: float) -> void:
	var id: String = sp["meld"]
	var kind: String = sp["kind"]
	var t := T(id)
	var at := Vector2(sp["x"], sp["y"])
	var best = null
	var bd := 8.0
	for o in _list():
		if not _ok(o):
			continue
		var d: float = o.world.distance_to(at)
		if d < bd:
			bd = d
			best = o
	var reach: float = float(t["reach"])
	var atk: float = float(sp["atk"])
	if atk >= 0.0:
		var C := clip(kind)
		var was := atk
		atk += dt
		var tgt = sp.get("tgt")
		if tgt != null and is_instance_valid(tgt) and not tgt.dead:
			var dv: Vector2 = tgt.world - at
			if dv.length() > 1e-4:
				sp["fx"] = dv.normalized().x
				sp["fy"] = dv.normalized().y
		if was < float(C[1]) and atk >= float(C[1]):
			_let_fly(sp, tgt, id, t)
		sp["atk"] = atk if atk < float(C[0]) else -1.0
		return
	sp["next"] = float(sp["next"]) - dt
	if best == null:
		sp["moving"] = _go(sp, hero.world, 1.4, float(t["speed"]), dt)
		return
	var stop: float = float(t.get("keep", reach * 0.8))
	sp["moving"] = _go(sp, best.world, stop, float(t["speed"]), dt)
	var d2: float = Vector2(sp["x"], sp["y"]).distance_to(best.world)
	if float(sp["next"]) <= 0.0 and d2 <= reach + best.r:
		sp["atk"] = 0.0
		sp["tgt"] = best
		sp["next"] = float(t["every"])


## Its blow, at the moment in its attack it lands or leaves its claws.
func _let_fly(sp: Dictionary, tgt, id: String, t: Dictionary) -> void:
	var kind: String = sp["kind"]
	var i: int = int(sp["skill"])
	var share: float = float(sp["share"])
	var at := Vector2(sp["x"], sp["y"])
	var dmg: float = maxf(1.0, roundf(hero.avg_hit(i, share * float(t["dmg"]))))
	hero.sfx.play(SOUNDS[kind][1], linear_to_db(0.55))
	match kind:
		"imp", "rimeling", "toad":
			if tgt == null or not is_instance_valid(tgt) or tgt.dead:
				return
			var to: Vector2 = tgt.world
			var fly: float = maxf(0.12, at.distance_to(to) / float(t.get("shot", 8.0)))
			shots.append({"meld": id, "kind": kind, "x0": at.x, "y0": at.y, "to": to, "tgt": tgt, "t": 0.0, "fly": fly, "dmg": dmg, "skill": i, "foe": false})
			_tell({"id": id, "what": "throw", "x": at.x, "y": at.y, "x1": to.x, "y1": to.y, "secs": fly, "kind": kind})
		"stormwisp":
			if tgt == null or not is_instance_valid(tgt) or tgt.dead:
				return
			tgt.damage(hero.side(tgt, dmg, i), "lightning", false, false, [], false, false, -1)
			var e := {"id": id, "what": "zap", "x": at.x, "y": at.y, "x1": tgt.world.x, "y1": tgt.world.y}
			var next = null
			var nd: float = float(t["jumpR"])
			for o in _list():
				if not _ok(o) or o == tgt:
					continue
				var d: float = o.world.distance_to(tgt.world)
				if d < nd:
					nd = d
					next = o
			if next != null:
				var jd: float = maxf(1.0, roundf(dmg * float(t["jump"])))
				next.damage(hero.side(next, jd, i), "lightning", false, false, [], false, false, -1)
				e["x2"] = next.world.x
				e["y2"] = next.world.y
			_tell(e)
		"bonebrute":
			var fx := Vector2(float(sp["fx"]), float(sp["fy"]))
			var c := at + fx * 0.8
			var hit := 0
			for o in _list().duplicate():
				if not _ok(o) or o.world.distance_to(c) > float(t["r"]) + o.r * 0.5:
					continue
				o.damage(hero.side(o, dmg, i), "phys", false, true, [], false, false, -1)
				if not o.dead and not o.boss and o.has_method("throw_from"):
					o.throw_from(c, float(t["throw"]))
				hit += 1
			_tell({"id": id, "what": "slam", "x": c.x, "y": c.y, "r": float(t["r"]), "n": hit})
			hero.sfx.play(SOUNDS[kind][2], linear_to_db(0.7))


## What its creature does as its time runs out (the toad bursts in its cloud of poison).
func friend_gone(sp: Dictionary) -> void:
	if str(sp.get("kind", "")) != "toad":
		return
	var t := T("bogborn")
	var i: int = int(sp["skill"])
	var dps: float = maxf(1.0, roundf(hero.avg_hit(i, float(sp["share"]) * float(t["cloudDps"]))))
	clouds.append({"x": sp["x"], "y": sp["y"], "r": float(t["cloudR"]), "t": 0.0, "dur": float(t["cloudSecs"]), "dps": dps, "tick": 0.0})
	_tell({"id": "bogborn", "what": "cloud", "x": sp["x"], "y": sp["y"], "r": float(t["cloudR"]), "secs": float(t["cloudSecs"])})
	hero.sfx.play("poison", linear_to_db(0.7))


# --- ON ENEMIES ---------------------------------------------------------------------------------------------------------

## The one of the five `m` carries, or "".
static func carried(m) -> String:
	if not M52.REAP_ON:
		return ""
	for id in KIND:
		if m.word_share(id) > 0.0:
			return id
	return ""


## `m`, carrying `id`, has died: in place of rising once, it rises as its creature against him.
func rise_foe(m, id: String) -> void:
	var t := T(id)
	var kind: String = KIND[id]
	var hit: float = (float(m.dmg_min) + float(m.dmg_max)) / 2.0
	var f := {"id": lw._next_id, "meld": id, "kind": kind, "x": m.world.x, "y": m.world.y, "t": 0.0, "life": float(t["foeSecs"]),
		"next": 0.9, "atk": -1.0, "fx": 1.0, "fy": 0.0, "dmg": maxf(1.0, roundf(hit * float(t["foeDmg"]))), "foe": true,
		"words": [RUNE[id]] if RUNE[id] != "power" else [], "share": 0.0, "skill": -1}
	lw._next_id += 1
	foes.append(f)
	_tell({"id": id, "what": "rise", "x": f["x"], "y": f["y"], "bad": true})
	hero.sfx.play(SOUNDS[kind][0], linear_to_db(0.7))


func _step_foes(dt: float) -> void:
	var P = hero.monsters.get("perils") if hero.monsters != null and is_instance_valid(hero.monsters) else null
	for k in range(foes.size() - 1, -1, -1):
		var f: Dictionary = foes[k]
		f["t"] = float(f["t"]) + dt
		var id: String = f["meld"]
		var kind: String = f["kind"]
		var t := T(id)
		if float(f["t"]) >= float(f["life"]) or not hero.alive:
			foes.remove_at(k)
			if kind == "toad" and P != null and hero.alive:
				P.warn(f["x"], f["y"], float(t["cloudR"]), float(t["foeCloud"]), f["dmg"], null, {"el": "poison", "words": ["poison"], "half": {}})
				_tell({"id": id, "what": "cloud", "x": f["x"], "y": f["y"], "r": float(t["cloudR"]), "secs": float(t["foeCloud"]) + 0.8, "bad": true})
			continue
		var at := Vector2(f["x"], f["y"])
		var to: Vector2 = hero.world
		var dv := to - at
		if dv.length() > 1e-4:
			f["fx"] = dv.normalized().x
			f["fy"] = dv.normalized().y
		var atk: float = float(f["atk"])
		if atk >= 0.0:
			var C := clip(kind)
			var was := atk
			atk += dt
			if was < float(C[1]) and atk >= float(C[1]):
				_foe_blow(f, id, t, P)
			f["atk"] = atk if atk < float(C[0]) else -1.0
			f["moving"] = false
			continue
		f["next"] = float(f["next"]) - dt
		var stop: float = 3.0 if THROWS.has(kind) else 1.1
		var speed: float = float(t.get("foeSpeed", float(t["speed"]) * 0.8))
		f["moving"] = _go(f, to, stop, speed, dt)
		if float(f["next"]) <= 0.0 and at.distance_to(to) <= (5.0 if THROWS.has(kind) else 1.6):
			f["atk"] = 0.0
			f["next"] = float(t["foeEvery"])


## Its blow on him: marked on the floor where he stands as it lets fly, landing when its warning runs out.
func _foe_blow(f: Dictionary, id: String, t: Dictionary, P) -> void:
	if P == null:
		return
	var kind: String = f["kind"]
	var at := Vector2(f["x"], f["y"])
	var by := {"el": EL[id], "words": f["words"], "half": {}}
	hero.sfx.play(SOUNDS[kind][1], linear_to_db(0.5))
	match kind:
		"imp", "rimeling", "toad":
			var to: Vector2 = hero.world
			var fly: float = float(t["foeFly"])
			P.warn(to.x, to.y, float(t["foeR"]), fly, f["dmg"], null, by)
			_tell({"id": id, "what": "throw", "x": at.x, "y": at.y, "x1": to.x, "y1": to.y, "secs": fly, "kind": kind, "bad": true})
		"stormwisp":
			var to: Vector2 = hero.world
			var wait: float = float(t["foeWait"])
			P.warn(to.x, to.y, float(t["foeR"]), wait, f["dmg"], null, by)
			_tell({"id": id, "what": "charge", "x": at.x, "y": at.y, "x1": to.x, "y1": to.y, "secs": wait, "bad": true})
		"bonebrute":
			var c := at + Vector2(f["fx"], f["fy"]) * 0.8
			var wait: float = float(t["foeWait"])
			var r: float = float(t["foeR"])
			P.warn(c.x, c.y, r, wait, f["dmg"], null, by)
			_tell({"id": id, "what": "raise", "x": c.x, "y": c.y, "r": r, "secs": wait, "bad": true})
			var H = hero
			var me = self
			hero.monsters.after(wait, func() -> void:
				if not is_instance_valid(H) or not H.alive:
					return
				me._tell({"id": id, "what": "slam", "x": c.x, "y": c.y, "r": r, "bad": true})
				H.sfx.play("slam", linear_to_db(0.7))
				var d: float = H.world.distance_to(c)
				if d <= r + 0.3 and d > 1e-3:
					H.knock((H.world - c) / d, 0.9))


# --- EACH STEP ------------------------------------------------------------------------------------------------------------

func step(dt: float) -> void:
	# (what is in flight: lands where it was thrown, on what is there)
	for k in range(shots.size() - 1, -1, -1):
		var s: Dictionary = shots[k]
		s["t"] = float(s["t"]) + dt
		var tgt = s["tgt"]
		if tgt != null and is_instance_valid(tgt) and not tgt.dead:
			s["to"] = tgt.world
		if float(s["t"]) < float(s["fly"]):
			continue
		shots.remove_at(k)
		var to: Vector2 = s["to"]
		var id: String = s["meld"]
		var t := T(id)
		_tell({"id": id, "what": "land", "x": to.x, "y": to.y, "kind": s["kind"]})
		hero.sfx.play(SOUNDS[s["kind"]][2], linear_to_db(0.5))
		var hit = null
		if tgt != null and is_instance_valid(tgt) and _ok(tgt) and tgt.world.distance_to(to) <= 0.9:
			hit = tgt
		else:
			for o in _list():
				if _ok(o) and o.world.distance_to(to) <= 0.7 + o.r * 0.5:
					hit = o
					break
		if hit == null:
			continue
		var i: int = int(s["skill"])
		var el: String = EL[id]
		hit.damage(hero.side(hit, float(s["dmg"]), i), el, false, false, [], el == "poison", false, -1)
		if hit.dead:
			continue
		match s["kind"]:
			"imp":
				hit.set_alight(maxf(1.0, float(s["dmg"]) * float(t["burn"])), 3.0)
			"rimeling":
				hit.chill_by(float(t["chill"]))
			"toad":
				hit.dose(maxf(1.0, float(s["dmg"]) * float(t["dose"])))
	# (the toads' clouds: what is in one is dosed each half second)
	for k in range(clouds.size() - 1, -1, -1):
		var c: Dictionary = clouds[k]
		c["t"] = float(c["t"]) + dt
		c["tick"] = float(c["tick"]) - dt
		if float(c["tick"]) <= 0.0:
			c["tick"] = 0.5
			var at := Vector2(c["x"], c["y"])
			for o in _list():
				if _ok(o) and o.world.distance_to(at) <= float(c["r"]) + o.r * 0.5:
					o.dose(float(c["dps"]))
		if float(c["t"]) >= float(c["dur"]):
			clouds.remove_at(k)
	_step_foes(dt)
