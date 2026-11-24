## CULLING'S MELDS AT WORK (meldshigh_rules.gd; his doc High City Melds, "Culling"). In front, an enemy its hit leaves nearly dead
## dies outright (last_words.gd cull_monster, which asks `under` how near and tells `culled`); behind, a reaper's mark takes the first
## weak enemy to cross it (add_reaper, _step_zones, which ask `reaper` and `reaper_step`). Each meld's cull does something of its own:
##   Guillotine  the culled body thrown, striking those it lands among; a mark that falls like a blade on all near it
##   Nightshade  one whose poison would finish it dies now; a cloud of poison where the nearly dead die
##   Coldcut     one culled chilled or frozen shatters, chilling those near; ice where a weak one slipping is culled and shatters
##   Cremate     one culled goes up in a column of flame, setting those near burning; burning ground that burns the weak to ash
##   Smite       each arc culls, and an arc that culls jumps on; a storm whose strikes cull the weak
##   Coup        a cull takes the move's whole wait away; each cull a burst of speed
##   Crusher     a cull lands with a quake that stuns those near; cracked ground where the staggered weak are culled
##   Scissors    each cull a second cut at the weakest near; two marks side by side
##   Bloodprice  a cull splits the life it had left: half heals him, half bursts from the body as a red blast on those near; the
##               mark takes a price: all near it lose as much life as the one it culled had left
##   Deathburst  its kills' blasts cull the weak they strike; a rune whose blast culls the weak it leaves alive
##   Mercy       a critical culls from twice as high, and each cull sets a sight on the weakest near; once the marked one is
##               nearly dead, the mark culls it wherever it stands and passes to the weakest near
##   Massacre    each cull two steps of frenzy; at a full frenzy every kill leaves a mark where it fell
##   Last Rites  each cull adds to his shield, and rites said over it: the next to strike him while it holds is struck down if
##               weak, else thrown back; a ward where the weak who step in are culled, growing with each it takes
##   Deathwatch  one it hits is watched a while: brought nearly dead by anything, it dies; a mark half as long again, taking two
##   Quietus     a cull leaves a brief mark where it fell; a short mark that is not spent, taking every weak one that crosses
##   Purge       it culls from higher up the more it hits at once; a mark three times as wide
##   Gallows     the weak dragged together are culled where they meet; a vortex whose heart culls the weak drawn to it
##   Decimate    a copy that culls splits into three again; shards that cull the weak they strike
##   Condemn     a cursed one culled passes its curse to the nearest; a hex circle whose weak still in it at its end are culled
##   Final Hour  the slow the deeper the nearer death; a bubble where the weak stop still, till the mark at its heart takes them
##   Noose       held, the hold tightens, taking life, and one nearly dead dies; a snare where the weak caught are culled
##   with the High City's others: Harvest (a culled one's soul twice; the mark's raised as his spirit), Butcher (mh_bleed.gd),
##   Deathblow (mh_pierce.gd), Deathknell (mh_surge.gd)
extends RefCounted

var H
## (Purge: how many each move's use has struck)
var _hits: Array = [0, 0, 0]
## (Deathwatch: those watched {m, until, under, i}; Noose: those held tightening {m, i})
var _watched: Array = []
var _held: Array = []
## (Mercy behind: the marked {m, i})
var _mercy: Array = []
## (Last Rites in front: the rites said over his shield {i, until})
var _rites := {}


func _init(h) -> void:
	H = h


func fresh() -> void:
	_hits = [0, 0, 0]
	_watched = []
	_held = []
	_mercy = []
	_rites = {}


func _cull(i: int) -> float:
	return float(H.hero.loadout.r(i)["cull"])


func _mark(i: int) -> float:
	return float(H.hero.loadout.r(i)["cull_mark"])


# --- in front ---

## How near death `m` must be to be culled by move `i` (`under`: Culling's own share; `mark`: by a reaper's mark).
func under(m, i: int, u: float, mark: bool) -> float:
	if mark or i < 0:
		return u
	match H.f(i):
		"mercy":
			if H.clock() - float(m.m52.get("crit_at", -9.0)) < 0.2:
				if H.once("mercy%d" % m.get_instance_id(), 0.5):
					H.tell("mercy", "mercy", m.world)
				return u * H.n("mercy", "crit", 2.0)
		"purge":
			if _hits[i] > 1 and H.once("purge%d" % i, 0.3):
				H.tell("purge", "purge", m.world, {"n": _hits[i]})
			return u * minf(H.n("purge", "most", 2.0), 1.0 + H.n("purge", "per", 0.15) * maxf(0.0, _hits[i] - 1))
	return u


## `m` has been culled by move `i` (`mark`: by a reaper's mark), where it stood `at`, with `life` left.
func culled(m, i: int, mark: bool, at: Vector2, life: float) -> void:
	m.m52["culled_at"] = H.clock()
	if i < 0 or i > 2:
		return
	var id: String = H.b(i) if mark else H.f(i)
	if id == "":
		return
	if mark:
		_mark_took(id, m, i, at, life)
		return
	match id:
		"guillotine":
			var w: Vector2 = (at - H.hero.world).normalized() if at.distance_to(H.hero.world) > 0.1 else H.hero.face
			var land: Vector2 = at + w * H.n("guillotine", "far", 1.8)
			H.tell(id, "throw", at, {"x1": land.x, "y1": land.y})
			H.later(0.25, func() -> void:
				for q in H.near(land, H.n("guillotine", "r", 1.2)):
					H.hit(q, i, H.n("guillotine", "land", 0.6)))
		"coldcut":
			if m.chill_t > 0.0 or m.frozen_t > 0.0:
				H.tell(id, "shatter", at)
				for q in H.near(at, H.n("coldcut", "r", 1.6), 8, [m]):
					H.hit(q, i, H.n("coldcut", "shard", 0.35), "frost")
					q.chill_by(H.n("coldcut", "chill", 0.4))
		"cremate":
			H.tell(id, "pyre", at)
			for q in H.near(at, H.n("cremate", "r", 1.5), 8, [m]):
				q.set_alight(maxf(1.0, H.hero.avg_hit(i, H.n("cremate", "burn", 0.3))), 3.0)
		"coup":
			H.cool_move(i, 99.0)
			H.tell(id, "coup", at)
		"crusher":
			H.tell(id, "quake", at)
			for q in H.near(at, H.n("crusher", "r", 1.6), 8, [m]):
				H.stun(q, H.n("crusher", "stun", 0.8))
		"scissors":
			var me = self
			H.later(H.n("scissors", "after", 0.2), func() -> void: me._snip(i, at))
		"bloodprice":
			# (the life it had left split: half heals him, half bursts from the body on those near)
			H.heal_life(minf(H.hero.max_life * 0.1, life * H.n("bloodprice", "share", 0.5)), id)
			H.tell(id, "draw", at, {"x1": H.hero.world.x, "y1": H.hero.world.y})
			H.tell(id, "price", at)
			for q in H.near(at, H.n("bloodprice", "r", 1.6), 8, [m]):
				q.damage(maxf(1.0, roundf(life * H.n("bloodprice", "blast", 0.5))), "phys", false, false, [], false, true, i)
		"massacre":
			H.frenzy_up(i, int(H.n("massacre", "steps", 2.0)), id)
		"lastrites":
			H.shield(H.n("lastrites", "shield", 0.03), id)
			# (rites said over his shield: the next to strike him while it holds is struck down if weak, else thrown back)
			_rites = {"i": i, "until": H.clock() + H.n("lastrites", "secs", 6.0)}
			H.tell(id, "rites", H.hero.world)
		"quietus":
			H.reaper(i, at, H.n("quietus", "r", 0.9), _cull(i), H.n("quietus", "brief", 1.0), {"meld": "quietus_f", "keep": true})
			H.tell(id, "brief", at)
		"decimate":
			if H.clock() - float(m.m52.get("copy_at", -9.0)) < 0.25:
				H.tell(id, "split", at)
				for q in H.near(at, H.n("decimate", "reach", 4.0), 3, [m]):
					H.hit(q, i, H.n("decimate", "copy", 0.4))
					q.m52["copy_at"] = H.clock()
					H.tell(id, "copy", at, {"x1": q.world.x, "y1": q.world.y})
					H.lw.cull_monster(q, _cull(i), i)
		"mercy":
			# (a sight on the weakest near: his next hit on it a certain critical)
			var best = null
			var low := 2.0
			for q in H.near(at, H.n("mercy", "reach", 3.5), 8, [m]):
				var f: float = q.life / maxf(1.0, q.max_life)
				if f < low:
					low = f
					best = q
			if best != null:
				H.mark(best, "mercy")
				H.tell(id, "sight", at, {"x1": best.world.x, "y1": best.world.y})
		"condemn":
			if m.hex_t > 0.0:
				var nx: Array = H.near(at, H.n("condemn", "reach", 3.0), 1, [m])
				if not nx.is_empty():
					H.curse(nx[0], maxf(m.hex_t, 3.0), m.hex_more)
					H.tell(id, "pass", at, {"x1": nx[0].world.x, "y1": nx[0].world.y})
		"harvest":
			H.hero.cool_by(float(H.hero.loadout.r(i)["reap"]) * 2.0 if float(H.hero.loadout.r(i)["reap"]) > 0.0 else H.n("harvest", "soul", 0.5))
			H.tell(id, "soul", at)
		"butcher":
			H.tell(id, "fling", at)
			for q in H.near(at, H.n("butcher", "r", 1.6), 8, [m]):
				H.lw.bleed_monster(q, maxf(1.0, H.hero.avg_hit(i, H.n("butcher", "bleed", 0.5))), 4.0)
	H.tell(id, "cull", at)


## Scissors: the second cut, at the weakest near where it culled.
func _snip(i: int, at: Vector2) -> void:
	var best = null
	var low := 2.0
	for q in H.near(at, H.n("scissors", "reach", 2.5)):
		var f: float = q.life / maxf(1.0, q.max_life)
		if f < low:
			low = f
			best = q
	if best != null:
		H.tell("scissors", "snip", at, {"x1": best.world.x, "y1": best.world.y})
		H.hit(best, i, H.n("scissors", "cut", 0.5))
		H.lw.cull_monster(best, _cull(i), i)


## What a reaper's mark of meld `id` does as it takes `m`.
func _mark_took(id: String, m, i: int, at: Vector2, life := 0.0) -> void:
	match id:
		"guillotine":
			H.tell(id, "blade", at)
			for q in H.near(at, H.n("guillotine", "blade", 1.4), 8, [m]):
				H.hit(q, i, H.n("guillotine", "bladeShare", 0.8))
		"coldcut":
			for q in H.near(at, 1.4, 6, [m]):
				q.chill_by(0.5)
			H.tell(id, "shatter", at)
		"coup":
			H.haste(H.n("coup", "haste", 0.35), 1.5, id)
		"bloodprice":
			# (the price: all near it lose as much life as the one it took had left)
			H.tell(id, "price", at, {"r": H.n("bloodprice", "markR", 2.0)})
			for q in H.near(at, H.n("bloodprice", "markR", 2.0), 8, [m]):
				q.damage(maxf(1.0, roundf(life)), "phys", false, false, [], false, true, i)
		"harvest":
			H.raise_at(at, i, maxf(float(H.hero.loadout.r(i)["spirit"]), H.n("harvest", "spirit", 0.5)))
			H.tell(id, "rise", at)
	if not id in ["guillotine", "coldcut", "coup", "bloodprice", "harvest"]:
		H.tell(id, "take", at)


func struck(m, i: int, _dmg: float, _c: bool, at: Vector2) -> void:
	var id: String = H.f(i)
	if i >= 0 and i <= 2:
		_hits[i] += 1
	if id == "" or not H.ok(m):
		return
	match id:
		"nightshade":
			if m.poison_t > 0.0 and m.poison_dps * m.poison_t >= m.life:
				if H.lw.cull_monster(m, 1.0, i):
					H.tell(id, "counted", m.world)
		"deathwatch":
			_watched.append({"m": m, "until": H.clock() + H.n("deathwatch", "secs", 3.0), "under": _cull(i), "i": i})
		"finalhour":
			H.tell(id, "hour", m.world)
			var near_death: float = 1.0 - m.life / maxf(1.0, m.max_life)
			H.still(m, 2.0, minf(0.9, H.n("finalhour", "slow", 0.2) + H.n("finalhour", "deeper", 0.7) * near_death))
		"gallows":
			var me = self
			H.later(0.3, func() -> void: me._gallows(i, at))
		"noose":
			if m.bind_t > 0.0 and not _held.any(func(x): return x["m"] == m):
				_held.append({"m": m, "i": i, "tick": 0.5})


## A blow on him from `src`: Last Rites' rites over his shield strike it down if weak, else throw it back.
func struck_him(src) -> void:
	if _rites.is_empty() or H.clock() > float(_rites["until"]) or not H.ok(src):
		return
	if H.hero.shield <= 0.0 and H.hero.barrier <= 0.0:
		return
	var i: int = int(_rites["i"])
	_rites = {}
	if H.lw.cull_monster(src, maxf(_cull(i), H.n("lastrites", "under", 0.3)), i):
		H.tell("lastrites", "taken", src.world)
	else:
		H.throw(src, H.hero.world, H.n("lastrites", "throw", 1.6))
		H.stun(src, H.n("lastrites", "stun", 0.6))
		H.tell("lastrites", "thrown", H.hero.world, {"x1": src.world.x, "y1": src.world.y})


## Gallows: the weak dragged together where it struck are culled where they meet.
func _gallows(i: int, at: Vector2) -> void:
	for q in H.near(at, H.n("gallows", "meet", 1.1)):
		if H.lw.cull_monster(q, _cull(i), i):
			H.tell("gallows", "hang", q.world)


## Smite: an arc culls what it strikes, and one that culls jumps on.
func arc(o, i: int, _from: Vector2) -> void:
	if H.f(i) != "smite":
		return
	var cur = o
	var gone: Array = [o]
	for _k in int(H.n("smite", "jumps", 4)):
		if not H.lw.cull_monster(cur, _cull(i), i):
			return
		var nx: Array = H.near(cur.world, H.n("smite", "reach", 3.5), 1, gone)
		if nx.is_empty():
			return
		H.tell("smite", "jump", cur.world, {"x1": nx[0].world.x, "y1": nx[0].world.y})
		H.hit(nx[0], i, H.n("smite", "bolt", 0.4), "lightning")
		gone.append(nx[0])
		cur = nx[0]


func copy_hit(o, i: int, kind := "copy") -> void:
	if H.ok(o):
		o.m52["copy_at"] = H.clock()
	if kind == "shard" and H.b(i) == "decimate":
		if H.lw.cull_monster(o, maxf(_mark(i), H.n("decimate", "under", 0.2)), i, true):
			H.tell("decimate", "shard", o.world)


func marked(m, i: int) -> void:
	if H.b(i) == "mercy":
		_mercy.append({"m": m, "i": i})
		H.tell("mercy", "sign", m.world)


func killed(m, i: int) -> void:
	if H.f(i) == "deathburst":
		H.tell("deathburst", "burst", m.world)
		for q in H.near(m.world, H.n("deathburst", "r", 1.6), 8, [m]):
			H.lw.cull_monster(q, _cull(i), i)
	if H.b(i) == "massacre" and H.frenzy_full():
		H.reaper(i, m.world, float(H.lw.L()["cull"]["markR"]), maxf(_mark(i), 0.2), float(H.lw.L()["cull"]["markLife"]))
		H.tell("massacre", "killmark", m.world)


func used(i: int) -> void:
	_hits[i] = 0


# --- behind: the reaper's mark ---

## A reaper's mark `z` of move `i` is being laid: its meld's own changes, and what it lays with it.
func reaper(i: int, z: Dictionary) -> void:
	var id: String = H.b(i)
	if id == "":
		return
	z["meld"] = id
	var at := Vector2(z["x"], z["y"])
	var dur: float = z["dur"]
	match id:
		"nightshade":
			z["r"] = H.n("nightshade", "cloud", 1.4)
			z["keep"] = true
			H.ground("venom", i, at, float(z["r"]), dur, H.hero.avg_hit(i, 0.15))
		"coldcut":
			z["r"] = 1.4
			z["keep"] = true
			H.ground("ice", i, at, 1.4, dur, H.hero.avg_hit(i, 0.1))
		"cremate":
			z["r"] = 1.4
			z["keep"] = true
			H.ground("burn", i, at, 1.4, dur, H.hero.avg_hit(i, 0.2))
		"smite":
			z["r"] = 1.6
			z["keep"] = true
			z["storm"] = true
			H.ground("storm", i, at, 1.6, dur, H.hero.avg_hit(i, 0.2))
		"crusher":
			z["r"] = 1.4
			z["keep"] = true
			z["staggered"] = true
			H.ground("cracks", i, at, 1.4, dur, 0.0)
		"scissors":
			var side: Vector2 = Vector2(-H.hero.face.y, H.hero.face.x) * H.n("scissors", "apart", 1.1)
			H.reaper(i, at + side, float(z["r"]), float(z["dmg"]), dur, {"meld": "scissors"})
		"deathburst":
			H.ground("rune", i, at, 1.2, 0.0, H.hero.avg_hit(i, 0.5))
			var u: float = z["dmg"]
			H.later(1.25, func() -> void:
				for q in H.near(at, 1.2):
					H.lw.cull_monster(q, u, i, true))
		"lastrites":
			z["r"] = H.n("lastrites", "ward", 1.8)
			z["keep"] = true
			H.ground("ward", i, at, float(z["r"]), dur, 0.3)
			var W = H.hero.wakes
			if W != null and not W.list.is_empty():
				z["ward"] = W.list.back()
		"deathwatch":
			z["dur"] = dur * H.n("deathwatch", "long", 1.5)
			z["takes"] = 2
		"quietus":
			z["dur"] = dur * H.n("quietus", "short", 0.67)
			z["keep"] = true
		"purge":
			z["r"] = float(z["r"]) * H.n("purge", "wide", 3.0)
		"gallows":
			z["r"] = 1.6
			z["keep"] = true
			z["heart"] = H.n("gallows", "heart", 0.6)
			H.ground("vortex", i, at, 1.6, dur, 1.0)
		"condemn":
			H.ground("hex", i, at, 1.5, dur, 0.25)
			z["r"] = 1.5
			z["keep"] = true
			z["atEnd"] = true
		"finalhour":
			z["r"] = 1.5
			z["keep"] = true
			z["hold"] = true
			H.ground("bubble", i, at, 1.5, dur, 0.6)
		"noose":
			H.ground("snare", i, at, 0.0, 0.0, 1.6)
			z["r"] = 0.9
			z["keep"] = true
			z["held"] = true
	var BEH := {"nightshade": "cloud", "coldcut": "ice", "cremate": "fire", "smite": "storm", "crusher": "cracks", "scissors": "pair",
		"deathburst": "rune", "lastrites": "ward", "deathwatch": "watch", "quietus": "keep", "purge": "wide", "gallows": "vortex",
		"condemn": "hex", "finalhour": "bubble", "noose": "snare"}
	H.tell(id, BEH.get(id, "mark"), at, {"r": z["r"]})


## Each step of reaper's mark `z`: true if its meld's own way of taking was done here (it is spent when `z["gone"]`).
func reaper_step(z: Dictionary, dt: float) -> bool:
	var id: String = str(z.get("meld", ""))
	if id == "" or not z.get("keep", false) and not z.has("takes"):
		return false
	var at := Vector2(z["x"], z["y"])
	var i: int = int(z["skill"])
	var u: float = z["dmg"]
	if z.has("takes"):
		for o in H.near(at, float(z["r"])):
			if H.lw.cull_monster(o, u, i, true):
				z["takes"] = int(z["takes"]) - 1
				if int(z["takes"]) <= 0:
					z["gone"] = true
				return true
		return true
	if z.get("storm", false):
		z["tick"] = float(z["tick"]) - dt
		if float(z["tick"]) <= 0.0:
			z["tick"] = 0.5
			var inside: Array = H.near(at, float(z["r"]))
			if not inside.is_empty():
				var o = inside[randi() % inside.size()]
				H.tell(id, "strike", o.world)
				H.hit(o, i, 0.25, "lightning")
				H.lw.cull_monster(o, u, i, true)
		return true
	if z.get("atEnd", false):
		if float(z["t"]) + dt >= float(z["dur"]):
			for o in H.near(at, float(z["r"])):
				H.lw.cull_monster(o, u, i, true)
			H.tell(id, "end", at)
		return true
	if z.get("hold", false):
		for o in H.near(at, float(z["r"])):
			if o.life <= o.max_life * u * 1.3:
				H.bind(o, 0.6)
				o.m52["hour"] = float(o.m52.get("hour", 0.0)) + dt
				if float(o.m52["hour"]) >= H.n("finalhour", "wait", 0.8):
					H.lw.cull_monster(o, 1.0, i, true)
		return true
	var heart: float = float(z.get("heart", 99.0))
	for o in H.near(at, float(z["r"])):
		if o.world.distance_to(at) > heart:
			continue
		if z.get("staggered", false) and o.stagger_t <= 0.0:
			continue
		if z.get("held", false) and o.bind_t <= 0.0:
			continue
		if H.lw.cull_monster(o, u, i, true) and id == "lastrites":
			# (the ward grows wider with each it takes)
			z["r"] = minf(H.n("lastrites", "widest", 3.2), float(z["r"]) + H.n("lastrites", "grow", 0.35))
			if z.has("ward"):
				z["ward"]["r"] = z["r"]
			H.tell(id, "grow", at, {"r": z["r"]})
	return true


func step(dt: float) -> void:
	var now: float = H.clock()
	for k in range(_watched.size() - 1, -1, -1):
		var w: Dictionary = _watched[k]
		var m = w["m"]
		if not H.ok(m) or now > float(w["until"]):
			_watched.remove_at(k)
			continue
		if m.life <= m.max_life * float(w["under"]):
			_watched.remove_at(k)
			if H.lw.cull_monster(m, float(w["under"]), int(w["i"])):
				H.tell("deathwatch", "take", m.world)
	for k in range(_held.size() - 1, -1, -1):
		var hd: Dictionary = _held[k]
		var m = hd["m"]
		if not H.ok(m) or m.bind_t <= 0.0:
			_held.remove_at(k)
			continue
		hd["tick"] = float(hd["tick"]) - dt
		if float(hd["tick"]) <= 0.0:
			hd["tick"] = 0.5
			m.damage(maxf(1.0, roundf(m.max_life * H.n("noose", "tighten", 0.04))), "phys", false, false, [], false, true, int(hd["i"]))
			H.tell("noose", "tighten", m.world)
			H.lw.cull_monster(m, _cull(int(hd["i"])), int(hd["i"]))
	for k in range(_mercy.size() - 1, -1, -1):
		var mc: Dictionary = _mercy[k]
		var m = mc["m"]
		if not H.ok(m) or m.mark_t <= 0.0:
			_mercy.remove_at(k)
			continue
		var u: float = maxf(_mark(int(mc["i"])), 0.2)
		if m.life <= m.max_life * u:
			_mercy.remove_at(k)
			var at: Vector2 = m.world
			H.lw.cull_monster(m, u, int(mc["i"]), true)
			H.tell("mercy", "take", at)
			# (the mark passes to the weakest near)
			var best = null
			var low := 2.0
			for q in H.near(at, H.n("mercy", "pass", 4.0), 8, [m]):
				var f: float = q.life / maxf(1.0, q.max_life)
				if f < low:
					low = f
					best = q
			if best != null:
				H.mark(best, "mercy")
				_mercy.append({"m": best, "i": mc["i"]})
				H.tell("mercy", "pass", at, {"x1": best.world.x, "y1": best.world.y})
