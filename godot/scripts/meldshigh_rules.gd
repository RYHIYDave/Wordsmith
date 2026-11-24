## THE HIGH CITY'S RUNES MELDED, AT WORK (his doc High City Melds, https://claude.ai/artifact/9BqzAMcqTjGwiARFPBdLEk; its text
## tools/meldshigh/docs_high.txt; behind melds52.gd HIGH_ON). His words of the first try, which gave all of them one twist: “I don't
## need this done quick, I need it done right”; and “I need you to police yourself on this”. So each of the 110 does what its own
## design says: a melded word does the work of both its words already (words.gd resolve), and here is each one's own TWIST, in front
## and behind, reached from the moments of the High City's own words (last_words.gd: the line Piercing strikes and its lance,
## Bleeding's wounds and thorns, Reaping's souls and spirits, Culling's culls and reaper's marks, Surging's shockwaves and the dodge)
## and from the 52's (melds52_rules.gd: a hit landing, a kill, a use, an arc, a mark, a blow on him). Each rune's melds in a part of
## their own: mh_pierce.gd, mh_bleed.gd, mh_reap.gd, mh_cull.gd, mh_surge.gd. On a monster: foe_meldshigh.gd. Their looks:
## fx_m52p_high.gd, from the tellings sent here ({id, what, x, y, ...}). Their numbers melds52.json `tune` (tools/melds52/tune.json),
## each read with the number it is made with (`n`).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Words := preload("res://scripts/words.gd")

var lw
var hero
var pierce
var bleed
var reap
var cull
var surge
## (things to come: {t, fn}, on the words' own clock)
var _later: Array = []
## (moments no oftener than: the last time each was)
var _once := {}
## (a twist's own hits and blasts run through the moves' words again: what they set off is not set off again from inside them)
var busy := 0


func _init(l) -> void:
	lw = l
	hero = l.hero
	pierce = preload("res://scripts/mh_pierce.gd").new(self)
	bleed = preload("res://scripts/mh_bleed.gd").new(self)
	reap = preload("res://scripts/mh_reap.gd").new(self)
	cull = preload("res://scripts/mh_cull.gd").new(self)
	surge = preload("res://scripts/mh_surge.gd").new(self)


# --- who has what ---

static func is_meld(m) -> bool:
	return m != null and str(m) != "" and M52.is_high(str(m)) and not M52.is_new_rank(str(m))


## His High City meld in front of move `i`, or "".
func f(i: int) -> String:
	if not M52.HIGH_ON or i < 0 or i > 2 or hero.loadout == null:
		return ""
	var m = hero.loadout.r(i).get("meld")
	return str(m) if is_meld(m) else ""


## His High City meld behind move `i`, or "".
func b(i: int) -> String:
	if not M52.HIGH_ON or i < 0 or i > 2 or hero.loadout == null:
		return ""
	var m = hero.loadout.r(i).get("meld_behind")
	return str(m) if is_meld(m) else ""


## Whether any of his moves has meld `id` in front (or behind).
func any(id: String, front := true) -> int:
	for i in 3:
		if (f(i) if front else b(i)) == id:
			return i
	return -1


## A number of meld `id` (melds52.json `tune`), `d` where it has none.
func n(id: String, key: String, d: float) -> float:
	var T: Dictionary = M52.tune(id)
	return float(T.get(key, d))


func clock() -> float:
	return lw._clock


## True at most once each `gap` seconds for `key`.
func once(key: String, gap: float) -> bool:
	if clock() - float(_once.get(key, -99.0)) < gap:
		return false
	_once[key] = clock()
	return true


func later(t: float, fn: Callable) -> void:
	_later.append({"t": clock() + t, "fn": fn})


## A telling for the looks and the checks (hero.m52 told: "id:what").
func tell(id: String, what: String, at: Vector2, more := {}) -> void:
	var e := {"id": id, "what": what, "x": at.x, "y": at.y}
	e.merge(more)
	if hero.m52 != null:
		hero.m52._tell(e)


# --- the world ---

func list() -> Array:
	return hero.monsters.list if hero.monsters != null and is_instance_valid(hero.monsters) else []


func ok(o) -> bool:
	return o != null and is_instance_valid(o) and not o.dead and o.state != "rise" and not lw._shut(o)


## The enemies within `r` of `at` (but those in `but`), nearest first, `most` at most.
func near(at: Vector2, r: float, most := 99, but: Array = []) -> Array:
	var c: Array = []
	for q in list():
		if not ok(q) or but.has(q) or q.state == "sleep" or q.world.distance_to(at) > r + q.r * 0.5:
			continue
		c.append(q)
	c.sort_custom(func(a, b2): return a.world.distance_to(at) < b2.world.distance_to(at))
	return c.slice(0, most)


## The enemies on the line from `a` the way `way` for `len`, `w` either side, in order along it.
func on_line(a: Vector2, way: Vector2, len: float, w: float, but: Array = []) -> Array:
	var c: Array = []
	for q in list():
		if not ok(q) or but.has(q):
			continue
		var p: Vector2 = q.world - a
		var along := p.dot(way)
		if along < -0.2 or along > len + q.r:
			continue
		if absf(p.y * way.x - p.x * way.y) <= w + q.r:
			c.append([along, q])
	c.sort_custom(func(x, y): return x[0] < y[0])
	return c.map(func(x): return x[1])


func open(at: Vector2) -> bool:
	return lw._open(at)


# --- what a twist does ---

## A hit of the twist's own on `o`: `share` of move `i`'s hit, of `el` (its move's element if ""), no word of the move set off by it.
func hit(o, i: int, share: float, el := "", crit := false) -> void:
	if not ok(o):
		return
	var e: String = el if el != "" else str(hero.loadout.r(i)["element"])
	var dmg: float = maxf(1.0, roundf(hero.avg_hit(i, share) * (1.0 + float(hero.stats.get("crit_mult", 50.0)) / 100.0 if crit else 1.0)))
	o.damage(hero.side(o, dmg, i), e, crit, false, [], e == "poison", false, i)


## A blast of move `i` round `at` (its words with it), `share` of its hit.
func blast(i: int, at: Vector2, r: float, share: float, look := "nova") -> void:
	busy += 1
	hero._blast(i, at, r, share, look, false, -8.0)
	busy -= 1


func shield(share: float, id: String) -> void:
	var G: Dictionary = Words.data()["guard"]
	var add := roundf(hero.max_life * share)
	if hero.max_barrier > 0.0:
		hero.barrier = minf(hero.max_barrier, hero.barrier + add)
	else:
		var most: float = roundf(hero.max_life * float(G["shield"]) * 2.0)
		hero.shield = minf(most, maxf(hero.shield, 0.0) + add)
		hero.shield_t = maxf(hero.shield_t, float(G["shieldTime"]))
	tell(id, "shield", hero.world, {"n": add})


func haste(k: float, secs: float, id: String) -> void:
	hero.haste = maxf(hero.haste, k)
	hero.haste_t = maxf(hero.haste_t, secs)
	tell(id, "haste", hero.world)


func frenzy_up(i: int, steps: int, id: String) -> void:
	var F: Dictionary = Words.data()["frenzy"]
	hero.frenzy = mini(int(F["max"]), hero.frenzy + steps)
	hero.frenzy_t = maxf(hero.frenzy_t, float(F["hold"]) * float(hero.loadout.r(i)["last"]))
	tell(id, "frenzy", hero.world, {"n": hero.frenzy})


func frenzy_full() -> bool:
	return hero.frenzy >= int(Words.data()["frenzy"]["max"])


func heal_life(amount: float, id: String) -> void:
	if amount <= 0.0 or hero.life <= 0.0:
		return
	hero.life = minf(hero.max_life, hero.life + roundf(amount))
	tell(id, "heal", hero.world, {"n": amount})


func orb(at: Vector2) -> void:
	if hero.monsters != null and hero.monsters.loot != null:
		hero.monsters.loot.orb_at(at)


## Precise's mark on `o`, as Precise behind lays it.
func mark(o, id: String) -> void:
	if not ok(o):
		return
	o.mark_t = float(Words.data()["precise"]["markTime"])
	o.m52["mark"] = id
	hero._tell({"t": "markOn", "id": o.id, "x": o.world.x, "y": o.world.y, "secs": o.mark_t})


func bind(o, secs: float) -> float:
	return hero.city.bind_monster(o, secs) if ok(o) else 0.0


func curse(o, secs: float, more: float) -> void:
	if not ok(o):
		return
	o.hex_t = maxf(o.hex_t, secs)
	o.hex_more = maxf(o.hex_more if o.hex_t > 0.0 else 0.0, more)


func still(o, secs: float, k: float) -> void:
	if not ok(o) or o.boss:
		return
	o.still_t = maxf(o.still_t, secs)
	o.still_k = maxf(o.still_k, k)


func stun(o, secs: float) -> void:
	if ok(o) and not o.boss:
		o.stun_for(secs)


## Thrown from `from` by `far` (a pull: `from` the far side of it).
func throw(o, from: Vector2, far: float) -> void:
	if ok(o) and not o.boss and far > 0.0:
		o.throw_from(from, far)


## Dragged toward `to`, to within `stop` of it.
func drag(o, to: Vector2, stop := 0.6) -> void:
	if not ok(o) or o.boss:
		return
	var d: Vector2 = o.world - to
	if d.length() <= stop:
		return
	o.throw_from(o.world + d.normalized(), d.length() - stop, 0.25)


## A wait of move `i` shortened by `secs` (the Strike has none).
func cool_move(i: int, secs: float) -> void:
	if i == 1 and hero._whirl_cd > 0.0:
		hero._whirl_cd = maxf(0.01, hero._whirl_cd - secs)
	elif i == 2 and hero._lunge_cd > 0.0:
		hero._lunge_cd = maxf(0.01, hero._lunge_cd - secs)


## Thorns of move `i` laid at `at`, `r` round, cutting for `dmg` (a cut's worth twice a second), for `dur`, `more` its own.
func thorns(i: int, at: Vector2, r: float, dmg: float, dur: float, more := {}) -> void:
	if not open(at):
		return
	var z := {"kind": "thorns", "x": at.x, "y": at.y, "r": r, "t": 0.0, "dur": dur, "dmg": dmg, "tick": 0.0, "skill": i}
	z.merge(more)
	lw.zones.append(z)
	hero._tell({"t": "zone", "kind": "thorns", "x": at.x, "y": at.y, "r": r, "el": "phys", "dur": dur})


## A reaper's mark of move `i` at `at`, `r` round, culling under `under`, for `dur`, `more` its own.
func reaper(i: int, at: Vector2, r: float, under: float, dur: float, more := {}) -> void:
	if not open(at):
		return
	var z := {"kind": "reaper", "x": at.x, "y": at.y, "r": r, "t": 0.0, "dur": dur, "dmg": under, "tick": 0.0, "skill": i}
	z.merge(more)
	lw.zones.append(z)
	hero._tell({"t": "zone", "kind": "reaper", "x": at.x, "y": at.y, "r": r, "el": "phys", "dur": dur})


## A ground of the words of move `i`: "burn", "ice", "storm" ground; "venom" cloud; "vortex", "hex", "bubble", "ward"; "cracks";
## "snare"; "rune". `power`: what it does (burn/ice a second, storm a strike, venom a second, the zones' share, the rune's hit).
func ground(kind: String, i: int, at: Vector2, r: float, dur: float, power: float, el := "") -> void:
	var W = hero.wakes
	if W == null or not is_instance_valid(W):
		return
	match kind:
		"burn":
			W.add_patch(i, "burn", at, r, dur, maxf(1.0, power), "fire", "high")
		"ice":
			W.add_ground({"kind": "ice", "element": "frost", "dps": 0.25, "slow": 0.4, "dur": dur}, i, at, r, maxf(1.0, power) * 4.0)
		"storm":
			W.add_ground({"kind": "storm", "element": "lightning", "dps": 0.5, "slow": 0.0, "dur": dur}, i, at, r, maxf(1.0, power) * 2.0)
		"venom":
			W.add_cloud(i, at, r, maxf(1.0, power), dur)
		"vortex", "hex", "bubble":
			W.add_zone(kind, i, at, r, dur, power)
		"ward":
			W.add_ward(i, at, r, dur, power)
		"cracks":
			W.add_cracks(i, at, r, dur)
		"snare":
			W.add_snare(i, at, power)
		"rune":
			W.add_rune(i, at, r, maxf(1.0, power), el if el != "" else str(hero.loadout.r(i)["element"]))


## A spirit of his of move `i` risen at `at`, its strength `share` of the move's hit (Reaping behind's own).
func raise_at(at: Vector2, i: int, share: float) -> void:
	var R: Dictionary = lw.L()["reap"]
	if lw.spirits.size() >= int(R["spirits"]):
		lw.spirits.pop_front()
	var sp := {"id": lw._next_id, "x": at.x, "y": at.y, "t": 0.0, "life": R["spiritSecs"], "next": 0.3, "skill": i, "share": share}
	lw._next_id += 1
	reap.spirit_new(sp, i)
	lw.spirits.append(sp)
	hero._tell({"t": "spirit", "id": sp["id"], "x": sp["x"], "y": sp["y"], "life": sp["life"], "kind": sp.get("kind", "")})
	lw.rec("reap_spirit")


# --- the 52's moments, handed on to the parts ---

## A hit of move `i` has landed on `m` for `dmg` (`c`: a critical).
func struck(m, i: int, dmg: float, c: bool, at: Vector2) -> void:
	if busy > 0 or not M52.HIGH_ON:
		return
	if c and ok(m):
		m.m52["crit_at"] = clock()
	bleed.struck(m, i, dmg, c, at)
	cull.struck(m, i, dmg, c, at)
	surge.struck(m, i, dmg, c, at)
	reap.struck(m, i, dmg, c, at)


## A kill of move `i` (before Reaping's soul and spirit: last_words.gd killed).
func killed(m, i: int) -> void:
	if not M52.HIGH_ON:
		return
	pierce.killed(m, i)
	bleed.killed(m, i)
	cull.killed(m, i)
	surge.killed(m, i)


## Any enemy dead, by whatever hand (monster.gd die).
func died(m) -> void:
	if not M52.HIGH_ON:
		return
	reap.died(m)


func used(i: int) -> void:
	if not M52.HIGH_ON:
		return
	pierce.used(i)
	bleed.used(i)
	cull.used(i)
	surge.used(i)


## A lightning arc of move `i` has struck `o` from `from`.
func arc(o, i: int, from: Vector2) -> void:
	if busy > 0 or not M52.HIGH_ON:
		return
	bleed.arc(o, i, from)
	cull.arc(o, i, from)


## Precise behind has marked `m` (move `i`).
func marked(m, i: int) -> void:
	if not M52.HIGH_ON:
		return
	bleed.marked(m, i)
	cull.marked(m, i)


## A blow on him from `src` (a monster, or null).
func struck_him(src) -> void:
	if not M52.HIGH_ON:
		return
	bleed.struck_him(src)


## How much less harm he takes, of these (Gravewarden's spirit by him): a multiplier.
func hurt_k() -> float:
	if not M52.HIGH_ON:
		return 1.0
	return reap.hurt_k()


## A copy or a shard of Splitting of move `i` striking `o` (`kind` "copy" or "shard").
func copy_hit(o, i: int, kind := "copy") -> void:
	if busy > 0 or not M52.HIGH_ON:
		return
	if kind == "copy":
		bleed.copy_hit(o, i)
	cull.copy_hit(o, i, kind)


## What move `i` leaves where it ends, of these (last_words.gd leaves).
func leaves(i: int, at: Vector2, rad: float) -> void:
	if not M52.HIGH_ON:
		return
	reap.leaves(i, at, rad)


func step(dt: float) -> void:
	if not M52.HIGH_ON:
		_later = []
		return
	for k in range(_later.size() - 1, -1, -1):
		if clock() >= float(_later[k]["t"]):
			var fn: Callable = _later[k]["fn"]
			_later.remove_at(k)
			fn.call()
	pierce.step(dt)
	bleed.step(dt)
	reap.step(dt)
	cull.step(dt)
	surge.step(dt)


func fresh_place() -> void:
	_later = []
	pierce.fresh()
	bleed.fresh()
	reap.fresh()
	cull.fresh()
	surge.fresh()
