## THE CITY'S FIVE WORDS IN HIS MOVES (Version 23.8; game.ts pullIn, splitOff, copyHit, throwShards, bindMonster, addSnare; defs.ts
## PULL, SPLIT, HEX, STILL, BIND; words.gd gives each move its numbers). The hero carries one of these (hero.gd `city`):
##   PULLING in front: what a blow hits is dragged toward where it struck, up to the pull's length and no nearer than 0.62 of a tile
##     (an elite half as far, a boss not at all; what sleeps wakes): a blow on one enemy drags what is within 2.2 tiles of it, an area
##     what is within the area. Behind: a vortex where it ends (wakes.gd), drawing what is in it in to its middle.
##   SPLITTING in front: the first hit of each use breaks into 3 copies of its share, flying on at 9 tiles a second to the nearest other
##     enemies within 3.2, each striking as it lands. Behind: where it ends, 6 shards fly out in every direction, each its share, each
##     striking the first enemy on its line within 3 tiles (no oftener than every 0.3 s a move).
##   HEXING in front: what it hits is cursed 4 s, taking more from everything (monster.gd). Behind: a hex circle; enemies in it deal
##     less (hero.gd hurt_by).
##   STILLING in front: what it hits is slowed in time 2 s, moving, attacking and shooting slower (a boss half as much: monster.gd).
##     Behind: a bubble where enemies and their shots crawl.
##   BINDING in front: what it hits is held where it stands (an elite half as long, a boss never, nor one held not long since): it
##     strikes still, but goes nowhere. Behind: a snare for the next enemy to cross (wakes.gd), at most one each half second a move.
extends RefCounted

const Words := preload("res://scripts/words.gd")

var hero
## (each move's use its first hit split on; when each last threw shards, laid a snare, showed its pull)
var _split_use: Array = [-1, -1, -1]
var _shards_at: Array = [-9.0, -9.0, -9.0]
var _snare_at: Array = [-9.0, -9.0, -9.0]
var _pull_shown: Array = [-9.0, -9.0, -9.0]
## (a copy or a shard striking: it breaks no further)
var copying := false
var _clock := 0.0


func _init(h) -> void:
	hero = h


func step(dt: float) -> void:
	_clock += dt


static func C() -> Dictionary:
	return Words.data().get("city", {})


func _list() -> Array:
	return hero.monsters.list if hero.monsters != null else []


func _shut(o) -> bool:
	return hero.monsters.shut_in(o)


## PULLING in front: what move `i` hit about `at` is dragged toward it (`single`: a blow on one enemy, reaching PULL.reach round it).
func pull_in(i: int, at: Vector2, rad: float, single: bool) -> void:
	var r: Dictionary = hero.loadout.r(i)
	if float(r["pull"]) <= 0.0:
		return
	var P: Dictionary = C()["pull"]
	var reach: float = maxf(rad, float(P["reach"])) if single else rad
	# (THE CITY'S MELDS: Gravity drags in all near, Firewhirl its blast's edge; Drift, Beckon, Riptide drag farther: meldscity_rules.gd)
	var Y = hero.m52.y
	reach = Y.pull_reach(i, reach, single)
	var moved: Array = []
	for o in _list():
		if not is_instance_valid(o) or o.dead or o.boss or _shut(o):
			continue
		var d: float = o.world.distance_to(at)
		if d > reach + o.r or d <= float(P["stop"]):
			continue
		var far := minf(float(r["pull"]) * (0.5 if o.elite else 1.0) * Y.pull_k(i, o), d - float(P["stop"]))
		if far < 0.05:
			continue
		if o.state == "sleep":
			hero.monsters.wake(o)
		hero.melds._slide(o, (at - o.world) / d * far, 6)
		moved.append(o)
	# (its look, a ring closing in, at most every quarter second for one move: a whirlwind's turns are many)
	if _clock - float(_pull_shown[i]) >= 0.25:
		_pull_shown[i] = _clock
		hero._tell({"t": "pull", "x": at.x, "y": at.y, "r": reach})
	Y.pulled(i, at, moved)


## SPLITTING in front: the first hit of a use of move `i`, on `m` at `at`, breaks into copies flying on to the nearest others.
## EACH ARROW (defs.ts SPLIT_EACH, his pick of 12 Nov 2026, “Every arrow splits, 21 (Recommended)”): one of several shots loosed by
## one use (a volley's, a Twin pair) breaks into copies of its own, once each; Split Shot's arrows split no more; anything else once
## a use, as before.
static var SPLIT_EACH := true
func split_first(m, i: int, frac: float, at: Vector2) -> void:
	var r: Dictionary = hero.loadout.r(i)
	var shot = hero.kit.striking if SPLIT_EACH and hero.kit != null and hero.kit.get("striking") != null else {}
	if not (shot is Dictionary and not shot.is_empty() and bool(shot.get("volley", false)) and not shot.get("split", false)):
		shot = {}
	var fresh: bool = not bool(shot.get("split_done", false)) if not shot.is_empty() else _split_use[i] != hero.uses[i]
	if float(r["split"]) <= 0.0 or copying or not fresh:
		return
	if not shot.is_empty():
		shot["split_done"] = true
	else:
		_split_use[i] = hero.uses[i]
	var S: Dictionary = C()["split"]
	var near: Array = []
	for o in _list():
		if is_instance_valid(o) and not o.dead and o != m and not _shut(o) and o.world.distance_to(at) <= float(S["reach"]) + o.r:
			near.append(o)
	near.sort_custom(func(a, b): return a.world.distance_to(at) < b.world.distance_to(at))
	# (THE CITY'S MELDS: Scatter's and Splitting II's more copies, Splinter's stronger, Constellation's hanging first)
	var Y = hero.m52.y
	near = near.slice(0, Y.split_n(i, int(S["copies"])))
	# (the city's runes with the floor 6–10 runes: Pinpoint's all at the toughest; Flechette's twice as fast)
	near = Y.split_to(i, near)
	var speed: float = float(S["speed"]) * float(Y.split_speed(i))
	var hang: float = Y.split_delay(i)
	var to: Array = []
	for o in near:
		to.append({"x": o.world.x, "y": o.world.y, "secs": hang + maxf(0.06, o.world.distance_to(at) / speed)})
	hero._tell({"t": "split", "x": at.x, "y": at.y, "dx": at.x - hero.world.x, "dy": at.y - hero.world.y, "to": to, "fly": to.is_empty()})
	Y.split_begun(i, at, to)
	var f: float = frac * float(r["split"]) * float(Y.split_k(i))
	for k in near.size():
		var o = near[k]
		hero._after(float(to[k]["secs"]), func() -> void: _copy_hit(o, i, f, "copy"))


## A copy or a shard of move `i` strikes `o` for `f` of a hit (it breaks no further); `kind` which (the city's melds' twists).
func _copy_hit(o, i: int, f: float, kind := "copy") -> void:
	if not is_instance_valid(o) or o.dead:
		return
	copying = true
	hero.hit_monster(o, i, f, true)
	copying = false
	hero.m52.y.copy_hit(o, i, kind)


## SPLITTING behind: where move `i` ends, at `at`, shards fly out in every direction, each striking the first enemy on its line.
func throw_shards(i: int, at: Vector2, frac: float) -> void:
	var r: Dictionary = hero.loadout.r(i)
	var S: Dictionary = C()["split"]
	if float(r["shards"]) <= 0.0 or copying or _clock - float(_shards_at[i]) < float(S["every"]):
		return
	_shards_at[i] = _clock
	var share := frac * float(r["shards"])
	hero._tell({"t": "shards", "x": at.x, "y": at.y, "r": float(S["shardReach"]) * 0.5})
	var a0 := fmod(_clock * 2.399, TAU)
	# (THE CITY'S MELDS: Splitting II's more shards, flying farther; where each comes down, the melds' own: meldscity_rules.gd)
	var Y = hero.m52.y
	var n: int = Y.shard_n(i, int(S["shards"]))
	var far: float = float(S["shardReach"]) * Y.shard_reach(i)
	var speed: float = float(S["speed"]) * float(Y.shard_speed(i))
	var lands: Array = []
	for k in n:
		var a := a0 + (float(k) / n) * TAU
		lands.append(at + Vector2(cos(a), sin(a)) * far)
	Y.shards_begun(i, at, lands)
	for k in n:
		var a := a0 + (float(k) / n) * TAU
		var u := Vector2(cos(a), sin(a))
		var best = null
		var along := INF
		for o in _list():
			if not is_instance_valid(o) or o.dead or _shut(o):
				continue
			var d: Vector2 = o.world - at
			var t := d.dot(u)
			# (it flies out from where the move ended: what stands there, the one it struck, it leaves)
			if t < 0.35 or t > far + o.r or t >= along:
				continue
			if absf(d.x * u.y - d.y * u.x) > float(S["shardWidth"]) + o.r:
				continue
			best = o
			along = t
		if best != null:
			var o = best
			var land: Vector2 = at + u * along
			hero._after(maxf(0.05, along / speed), func() -> void:
				_copy_hit(o, i, share, "shard")
				Y.shard_land(i, land))
		else:
			var land: Vector2 = lands[k]
			hero._after(maxf(0.05, far / speed), func() -> void: Y.shard_land(i, land))


## BINDING: holds `m` where it stands for `secs` (an elite half as long; a boss never; nor one held not long since); how long (0: not).
func bind_monster(m, secs: float) -> float:
	if m.dead or m.boss or m.bind_again > 0.0 or _shut(m):
		return 0.0
	var B: Dictionary = C()["bind"]
	var t := secs * (float(B["elite"]) if (m.elite or m.champion) else 1.0)
	m.bind_t = t
	m.bind_again = t + float(B["again"])
	return t


## BINDING behind: a snare where move `i` ended, for the next enemy to cross (at most one each BIND.every a move).
func lay_snare(i: int, at: Vector2, secs: float) -> void:
	var B: Dictionary = C()["bind"]
	if _clock - float(_snare_at[i]) < float(B["every"]):
		return
	_snare_at[i] = _clock
	if hero.wakes != null and is_instance_valid(hero.wakes):
		hero.wakes.add_snare(i, at, secs)
