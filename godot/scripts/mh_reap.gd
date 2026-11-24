## REAPING'S MELDS AT WORK (meldshigh_rules.gd; his doc High City Melds, "Reaping"; its five with the damage runes are
## meldsreap_rules.gd's). In front, a kill leaves a soul that takes time off his waits (last_words.gd killed, which hands each soul
## to `soul`); behind, a kill rises as a spirit fighting for him (_raise_spirit, _step_spirits, which ask `spirit_new`, `spirit_tick`,
## `spirit_pick`, `spirit_hit`, `spirit_end`). Each meld's soul or spirit does something of its own:
##   Wraithstep  each soul a burst of speed; while his speed lasts, his spirits move and strike as fast
##   Tombstone   a soul falls with a thud, staggering those near; a slow, heavy spirit whose blows stun
##   Revenants   two souls; two spirits, each weaker
##   Ghoul       each soul heals him; each blow of his spirits heals him
##   Soulburst   the soul bursts from the body, striking those near; a spirit that bursts as its time ends
##   Deadeye     a kill by a critical a bright soul, twice the time off; spirits go for the marked first, certain criticals on it
##   Macabre     each soul a step of frenzy; his spirits strike faster for each step
##   Gravewarden each soul tops his shield up; a spirit that stands guard by him: near it he takes less harm
##   Undying     a soul half as much again; a spirit half as long again, rising once more as it ends
##   Fetch       a soul the instant it falls, more for each other kill just before; a spirit for less time, striking oftener
##   Legion      a soul flying to him through those near, striking them; a spirit whose blows strike all round what it hits
##   Gravewell   a soul drags those near to where it fell; a vortex where any enemy that dies rises as his spirit
##   Poltergeist each soul hurls a shard at the nearest; a spirit that hurls shards at what it fights
##   Haunting    a cursed one's soul curses those near; a hex circle, and spirits that curse what they strike
##   Limbo       time slows round where a soul rises; a spirit in a bubble of slow time that goes with it
##   Gravebind   a soul binds the nearest; a spirit whose blows hold what they strike
##   with the High City's others: Wraithspear (a spirit hurling lances), Bloodharvest (a red soul; spirits that make bleed),
##   Harvest and Soulstorm (mh_cull.gd, mh_surge.gd)
extends RefCounted

const Words := preload("res://scripts/words.gd")

var H
## (Fetch: when the last kills were)
var _kills: Array = []
## (Gravewell behind: its vortexes {at, r, t, dur, i})
var _wells: Array = []
## (Soulstorm: when the souls he gathered came)
var souls: Array = []


func _init(h) -> void:
	H = h


func fresh() -> void:
	_kills = []
	_wells = []
	souls = []


func _r(i: int) -> Dictionary:
	return H.hero.loadout.r(i)


# --- in front: the soul ---

## A kill of move `i` has left its soul (Reaping in front's own time off already taken).
func soul(m, i: int) -> void:
	var now: float = H.clock()
	_kills.append(now)
	while not _kills.is_empty() and now - float(_kills[0]) > 1.0:
		_kills.pop_front()
	souls.append(now)
	while not souls.is_empty() and now - float(souls[0]) > H.n("soulstorm", "keep", 4.0):
		souls.pop_front()
	var id: String = H.f(i)
	if id == "":
		return
	var at: Vector2 = m.world
	var reap_k: float = float(_r(i)["reap"])
	match id:
		"wraithstep":
			H.haste(H.n("wraithstep", "haste", 0.35), H.n("wraithstep", "secs", 1.5), id)
		"tombstone":
			H.tell(id, "thud", at)
			for q in H.near(at, H.n("tombstone", "r", 1.6), 8, [m]):
				H.stun(q, H.n("tombstone", "stun", 0.5))
		"revenants":
			H.hero.cool_by(reap_k)
			H.tell(id, "second", at)
		"ghoul":
			H.heal_life(H.hero.max_life * H.n("ghoul", "heal", 0.02), id)
		"soulburst":
			H.tell(id, "burst", at)
			for q in H.near(at, H.n("soulburst", "r", 1.5), 8, [m]):
				H.hit(q, i, H.n("soulburst", "share", 0.45))
		"deadeye":
			if now - float(m.m52.get("crit_at", -9.0)) < 0.2:
				H.hero.cool_by(reap_k)
				H.tell(id, "bright", at)
		"macabre":
			H.frenzy_up(i, 1, id)
		"gravewarden":
			H.shield(H.n("gravewarden", "shield", 0.02), id)
		"undying":
			H.hero.cool_by(reap_k * H.n("undying", "more", 0.5))
			H.tell(id, "longer", at)
		"fetch":
			var more: int = _kills.size() - 1
			if more > 0:
				H.hero.cool_by(H.n("fetch", "per", 0.2) * more)
			H.tell(id, "fetch", at, {"n": more})
		"legion":
			var to: Vector2 = H.hero.world
			H.tell(id, "fly", at, {"x1": to.x, "y1": to.y})
			for q in H.list():
				if not H.ok(q) or q == m:
					continue
				var p: Vector2 = q.world - at
				var w: Vector2 = (to - at).normalized() if to.distance_to(at) > 0.1 else Vector2.ZERO
				var along := p.dot(w)
				if along < 0.0 or along > to.distance_to(at):
					continue
				if absf(p.y * w.x - p.x * w.y) <= 0.7 + q.r:
					H.hit(q, i, H.n("legion", "share", 0.3))
		"gravewell":
			H.tell(id, "drag", at)
			for q in H.near(at, H.n("gravewell", "r", 2.2), 8, [m]):
				H.drag(q, at, 0.5)
		"poltergeist":
			var nx: Array = H.near(at, H.n("poltergeist", "reach", 4.0), 1, [m])
			if not nx.is_empty():
				H.hit(nx[0], i, H.n("poltergeist", "shard", 0.35))
				H.tell(id, "hurl", at, {"x1": nx[0].world.x, "y1": nx[0].world.y})
		"haunting":
			if m.hex_t > 0.0:
				H.tell(id, "haunt", at)
				for q in H.near(at, H.n("haunting", "r", 1.8), 8, [m]):
					H.curse(q, 4.0, maxf(0.15, m.hex_more))
		"limbo":
			H.ground("bubble", i, at, H.n("limbo", "r", 1.3), H.n("limbo", "secs", 1.5), H.n("limbo", "crawl", 0.5))
			H.tell(id, "still", at)
		"gravebind":
			var nx: Array = H.near(at, H.n("gravebind", "reach", 3.0), 1, [m])
			if not nx.is_empty() and H.bind(nx[0], H.n("gravebind", "hold", 1.0)) > 0.0:
				H.tell(id, "bind", at, {"x1": nx[0].world.x, "y1": nx[0].world.y})
		"bloodharvest":
			if m.bleed_t > 0.0:
				H.hero.cool_by(reap_k)
				H.tell(id, "red", at)


func struck(_m, _i: int, _dmg: float, _c: bool, _at: Vector2) -> void:
	pass


# --- behind: the spirits ---

## A spirit `sp` of move `i` is rising: its meld's own.
func spirit_new(sp: Dictionary, i: int) -> void:
	var id: String = H.b(i)
	if id == "":
		return
	sp["meld"] = id
	match id:
		"tombstone":
			sp["speed_k"] = H.n("tombstone", "slow", 0.6)
		"revenants":
			sp["share"] = float(sp["share"]) * H.n("revenants", "each", 0.6)
			if not sp.has("twin"):
				var two := sp.duplicate()
				two["id"] = H.lw._next_id
				H.lw._next_id += 1
				two["x"] = float(sp["x"]) + 0.5
				two["twin"] = true
				sp["twin"] = true
				H.lw.spirits.append(two)
				H.hero._tell({"t": "spirit", "id": two["id"], "x": two["x"], "y": two["y"], "life": two["life"], "kind": ""})
				H.tell(id, "two", Vector2(sp["x"], sp["y"]))
		"undying":
			sp["life"] = float(sp["life"]) * H.n("undying", "long", 1.5)
			sp["again"] = true
		"fetch":
			sp["life"] = float(sp["life"]) * H.n("fetch", "short", 0.67)
			H.tell(id, "short", Vector2(sp["x"], sp["y"]))
		"gravewarden":
			sp["guard"] = true
	H.tell(id, "spirit", Vector2(sp["x"], sp["y"]))


## Each step of spirit `sp`: its meld's own (its pace `speed_k`, its strikes sooner by `next`).
func spirit_tick(sp: Dictionary, dt: float) -> void:
	var id: String = str(sp.get("meld", ""))
	match id:
		"wraithstep":
			if H.hero.haste_t > 0.0:
				sp["speed_k"] = H.n("wraithstep", "fast", 2.0)
				sp["next"] = float(sp["next"]) - dt
				if H.once("ws%d" % int(sp["id"]), 1.0):
					H.tell(id, "fast", Vector2(sp["x"], sp["y"]))
			else:
				sp["speed_k"] = 1.0
		"macabre":
			sp["next"] = float(sp["next"]) - dt * H.n("macabre", "per", 0.2) * H.hero.frenzy
			if H.hero.frenzy > 0 and H.once("mac%d" % int(sp["id"]), 1.0):
				H.tell(id, "dance", Vector2(sp["x"], sp["y"]), {"n": H.hero.frenzy})
		"fetch":
			sp["next"] = float(sp["next"]) - dt * 0.5
		"limbo":
			if H.once("limbo%d" % int(sp["id"]), 0.4):
				H.tell(id, "bubble", Vector2(sp["x"], sp["y"]))
				for q in H.near(Vector2(sp["x"], sp["y"]), H.n("limbo", "bubble", 1.5)):
					H.still(q, 0.6, H.n("limbo", "crawl", 0.5))
		"gravewarden":
			if Vector2(sp["x"], sp["y"]).distance_to(H.hero.world) <= H.n("gravewarden", "near", 2.5) and H.once("gw%d" % int(sp["id"]), 1.0):
				H.tell(id, "guard", Vector2(sp["x"], sp["y"]))


## Whom spirit `sp` goes for (`best`: the nearest).
func spirit_pick(sp: Dictionary, best):
	if str(sp.get("meld", "")) == "deadeye":
		var at := Vector2(sp["x"], sp["y"])
		for o in H.list():
			if H.ok(o) and o.mark_t > 0.0 and o.world.distance_to(at) < 8.0:
				return o
	if str(sp.get("meld", "")) == "gravewarden" and best != null and best.world.distance_to(H.hero.world) > H.n("gravewarden", "keep", 3.0):
		return null
	return best


## Spirit `sp` has struck `o` from `at`.
func spirit_hit(sp: Dictionary, o, at: Vector2) -> void:
	var id: String = str(sp.get("meld", ""))
	var i: int = int(sp["skill"])
	if not H.ok(o):
		return
	match id:
		"tombstone":
			H.stun(o, H.n("tombstone", "blow", 0.6))
		"ghoul":
			H.heal_life(H.hero.max_life * H.n("ghoul", "blow", 0.008), id)
		"deadeye":
			if o.mark_t > 0.0:
				H.hit(o, i, float(sp["share"]), "", true)
				H.tell(id, "crit", o.world)
		"legion":
			for q in H.near(o.world, H.n("legion", "splash", 1.2), 6, [o]):
				H.hit(q, i, float(sp["share"]) * 0.5)
		"poltergeist":
			for q in H.near(o.world, H.n("poltergeist", "reach", 3.0), 2, [o]):
				H.hit(q, i, H.n("poltergeist", "shard", 0.35))
				H.tell(id, "hurl", at, {"x1": q.world.x, "y1": q.world.y})
		"haunting":
			H.curse(o, 4.0, H.n("haunting", "curse", 0.15))
		"gravebind":
			H.bind(o, H.n("gravebind", "blow", 0.8))
		"bloodharvest":
			H.lw.bleed_monster(o, maxf(1.0, H.hero.avg_hit(i, H.n("bloodharvest", "bleed", 0.3))), 3.0)
		"wraithspear":
			var w: Vector2 = (o.world - at).normalized() if o.world.distance_to(at) > 0.1 else H.hero.face
			H.tell(id, "lance", at, {"x1": at.x + w.x * 3.0, "y1": at.y + w.y * 3.0})
			for q in H.on_line(at, w, H.n("wraithspear", "len", 3.0), 0.4, [o]):
				H.hit(q, i, H.n("wraithspear", "lance", 0.4))
	var HIT := {"tombstone": "stun", "ghoul": "feed", "legion": "splash", "haunting": "curse", "gravebind": "bind", "bloodharvest": "bleed"}
	if HIT.has(id):
		H.tell(id, HIT[id], o.world)
	elif id != "":
		H.tell(id, "blow", o.world)


## Spirit `sp`'s time is up.
func spirit_end(sp: Dictionary) -> void:
	var id: String = str(sp.get("meld", ""))
	var at := Vector2(sp["x"], sp["y"])
	var i: int = int(sp["skill"])
	match id:
		"soulburst":
			H.tell(id, "end", at)
			for q in H.near(at, H.n("soulburst", "end", 1.8)):
				H.hit(q, i, H.n("soulburst", "endShare", 0.7))
		"undying":
			if sp.get("again", false):
				var R: Dictionary = H.lw.L()["reap"]
				var sp2 := sp.duplicate()
				sp2["id"] = H.lw._next_id
				H.lw._next_id += 1
				sp2["t"] = 0.0
				sp2["life"] = float(R["spiritSecs"])
				sp2["again"] = false
				H.lw.spirits.append(sp2)
				H.hero._tell({"t": "spirit", "id": sp2["id"], "x": sp2["x"], "y": sp2["y"], "life": sp2["life"], "kind": ""})
				H.tell(id, "again", at)


## What move `i` leaves where it ends (last_words.gd leaves): Gravewell's vortex, Haunting's hex circle.
func leaves(i: int, at: Vector2, _rad: float) -> void:
	match H.b(i):
		"gravewell":
			var r: float = H.n("gravewell", "well", 1.6)
			var dur: float = H.n("gravewell", "secs", 4.0)
			H.ground("vortex", i, at, r, dur, 1.0)
			_wells.append({"at": at, "r": r, "t": 0.0, "dur": dur, "i": i})
			H.tell("gravewell", "well", at)
		"haunting":
			H.ground("hex", i, at, H.n("haunting", "circle", 1.5), 4.0, 0.25)


## Gravewarden: near a spirit standing guard, he takes less harm.
func hurt_k() -> float:
	for sp in H.lw.spirits:
		if sp.get("guard", false) and Vector2(sp["x"], sp["y"]).distance_to(H.hero.world) <= H.n("gravewarden", "near", 2.5):
			return 1.0 - H.n("gravewarden", "less", 0.25)
	return 1.0


## Any enemy dead: one in Gravewell's vortex rises as his spirit.
func died(m) -> void:
	if m.boss or _wells.is_empty():
		return
	for w in _wells:
		if m.world.distance_to(w["at"]) <= float(w["r"]) + 0.3:
			var at: Vector2 = m.world
			var i: int = int(w["i"])
			# (one his own move killed rises by Reaping already: not twice)
			H.later(0.05, func() -> void:
				if is_instance_valid(m) and m.m52.get("raised", false):
					return
				H.raise_at(at, i, maxf(float(_r(i)["spirit"]), 0.5))
				H.tell("gravewell", "rise", at))
			return


func step(dt: float) -> void:
	for k in range(_wells.size() - 1, -1, -1):
		_wells[k]["t"] = float(_wells[k]["t"]) + dt
		if float(_wells[k]["t"]) >= float(_wells[k]["dur"]):
			_wells.remove_at(k)
