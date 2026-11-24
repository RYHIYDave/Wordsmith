## THE HIGH CITY'S RUNES MELDED IN THE FIGHT (his "Then we gotta get back to these melds.  I'd like to finish them today.", 24 Nov
## 2026; their text tools/meldshigh/docs_high.txt, made by tools/meldshigh/design.py; behind melds52.gd HIGH_ON). Each does the work
## of both its runes (words.gd resolve), and ONE TWIST FOR ALL: the High City rune's own act CARRIES the other rune to what it
## strikes, or to him:
##   PIERCING: each enemy the blow goes on through (last_words.gd pierce_on), and each its lance strikes (_lance_lands).
##   BLEEDING: each fresh wound it opens (struck), and each cut of its thorns (_step_zones), a thorn's again no sooner than
##     `thornAgain` seconds on one.
##   REAPING: the soul a kill leaves flies at the nearest enemy (killed); the spirit's every blow (_step_spirits).
##   CULLING: the killing blow, and the reaper's mark's, bursting out to those near the culled (cull_monster).
##   SURGING: each its shockwave strikes, in front (cast) and from his dodge (dodge_surge).
## What each rune brings, carried: Power more force (and a shove); Poison a dose; Frost a chill (a second freezes); Flame burning;
## Lightning an arc to the next; Heavy a stun; Twin a second strike; Volatile a burst round it; Precise a certain critical; Lasting
## what ails it lasting longer; Vast a strike round it; Pulling a pull toward him; Splitting a split to two more; Hexing a curse;
## Stilling a stillness; Binding a root; Bleeding bleeding; Piercing a strike through to the one behind; Reaping death's hold (if it
## dies within a while it rises as his spirit); Culling a cull of the weak; Surging a shockwave from it. Swift, Leech, Frenzied,
## Guarding and Fleeting give him something instead: haste, life, frenzy, a shield, time off his waits (once a moment).
## Numbers melds52.json `tune` `_carry` (tools/melds52/tune.json). Looks: fx_m52p_high.gd.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const SELF := ["swift", "leech", "frenzied", "guarding", "fleeting"]
const EL := {"poison": "poison", "frost": "frost", "fire": "fire", "lightning": "lightning"}

var lw
var hero
var _self_at := {}


func _init(l) -> void:
	lw = l
	hero = l.hero


static func C() -> Dictionary:
	return M52.tune("_carry")


func _list() -> Array:
	return hero.monsters.list if hero.monsters != null and is_instance_valid(hero.monsters) else []


func _ok(o) -> bool:
	return is_instance_valid(o) and not o.dead and o.state != "rise" and not lw._shut(o)


## The meld at `side` of move `i` and what it carries when `hc`'s act fires, or "".
func _partner(hc: String, i: int, side: String) -> Array:
	if not M52.HIGH_ON or i < 0 or i > 2:
		return []
	var r: Dictionary = hero.loadout.r(i)
	var id = r.get("meld") if side == "front" else r.get("meld_behind")
	if id == null or not M52.is_high(id) or M52.is_new_rank(id):
		return []
	var of: Array = M52.T()["of"].get(str(id), [])
	if of.size() != 2:
		return []
	if of[0] == hc:
		return [str(id), str(of[1])]
	if of[1] == hc:
		return [str(id), str(of[0])]
	return []


## `hc`'s act of move `i` (`side` "front" or "behind") has struck `o` (from `from`): what it carries.
func carry(hc: String, i: int, side: String, o, from := Vector2.INF) -> void:
	var pr := _partner(hc, i, side)
	if pr.is_empty() or o == null or not is_instance_valid(o):
		return
	_apply(pr[0], pr[1], i, o, from if from != Vector2.INF else hero.world)


## `hc`'s act of move `i` has burst at `at`: it carries to each within `r` (all but `but`), or to him once.
func carry_round(hc: String, i: int, side: String, at: Vector2, r: float, but = null) -> void:
	var pr := _partner(hc, i, side)
	if pr.is_empty():
		return
	if SELF.has(pr[1]):
		_apply(pr[0], pr[1], i, null, at)
		return
	var n := 0
	for o in _list().duplicate():
		if not _ok(o) or o == but or o.world.distance_to(at) > r + o.r * 0.5:
			continue
		_apply(pr[0], pr[1], i, o, at)
		n += 1
	if n == 0:
		_tell(pr[0], "burst", at, at)


func _tell(id: String, what: String, at: Vector2, from: Vector2, more := {}) -> void:
	var e := {"id": id, "what": what, "x": at.x, "y": at.y, "x1": from.x, "y1": from.y}
	e.merge(more)
	if hero.m52 != null:
		hero.m52._tell(e)


func _hit(o, i: int, share: float, el := "phys", crit := false) -> void:
	if not _ok(o):
		return
	var dmg: float = maxf(1.0, roundf(hero.avg_hit(i, share)))
	o.damage(hero.side(o, dmg, i), el, crit, false, [], el == "poison", false, i)


func _near(o, r: float, n: int, but: Array) -> Array:
	var c: Array = []
	for q in _list():
		if not _ok(q) or but.has(q) or q.world.distance_to(o.world) > r:
			continue
		c.append(q)
	c.sort_custom(func(a, b): return a.world.distance_to(o.world) < b.world.distance_to(o.world))
	return c.slice(0, n)


## What rune `p` (of meld `id`, on move `i`) brings to `o` (null: to him), carried from `from`.
func _apply(id: String, p: String, i: int, o, from: Vector2) -> void:
	var T := C()
	if SELF.has(p):
		# (what gives him something gives it once a moment)
		var now: float = lw._clock
		if now - float(_self_at.get(id, -9.0)) < float(T["selfEvery"]):
			return
		_self_at[id] = now
		match p:
			"swift":
				hero.haste = maxf(hero.haste, float(T["swift"]))
				hero.haste_t = maxf(hero.haste_t, float(T["swiftSecs"]))
			"leech":
				hero.life = minf(hero.max_life, hero.life + roundf(hero.max_life * float(T["leech"])))
			"frenzied":
				var F: Dictionary = preload("res://scripts/words.gd").data()["frenzy"]
				hero.frenzy = mini(int(F["max"]), hero.frenzy + 1)
				hero.frenzy_t = maxf(hero.frenzy_t, float(F["hold"]))
			"guarding":
				var add := roundf(hero.max_life * float(T["guarding"]))
				if hero.max_barrier > 0.0:
					hero.barrier = minf(hero.max_barrier, hero.barrier + add)
				else:
					hero.shield = maxf(hero.shield, add)
					hero.shield_t = maxf(hero.shield_t, 3.0)
			"fleeting":
				hero.cool_by(float(T["fleeting"]))
		var at: Vector2 = o.world if o != null and is_instance_valid(o) else from
		_tell(id, "self", hero.world, at, {"kind": p})
		return
	if not _ok(o):
		return
	var at: Vector2 = o.world
	var more := {"kind": p}
	match p:
		"power":
			_hit(o, i, float(T["power"]))
			if not o.dead and not o.boss and o.has_method("throw_from"):
				o.throw_from(from, float(T["powerThrow"]))
		"poison":
			o.dose(maxf(1.0, hero.avg_hit(i, float(T["poison"]))))
		"frost":
			o.chill_by(float(T["frost"]))
		"fire":
			o.set_alight(maxf(1.0, hero.avg_hit(i, float(T["fire"]))), float(T["fireSecs"]))
		"lightning":
			var nx: Array = _near(o, float(T["reach"]), 1, [o])
			if not nx.is_empty():
				_hit(nx[0], i, float(T["lightning"]), "lightning")
				more["x2"] = nx[0].world.x
				more["y2"] = nx[0].world.y
		"heavy":
			if not o.boss:
				o.stun_for(float(T["heavy"]))
		"twin":
			var me = self
			hero._after(float(T["twinAfter"]), func() -> void: me._hit(o, i, float(T["twin"])))
		"volatile":
			for q in _near(o, float(T["volatileR"]), 6, [o]):
				_hit(q, i, float(T["volatile"]))
		"precise":
			_hit(o, i, float(T["precise"]), "phys", true)
		"lasting":
			var k: float = float(T["lasting"])
			var most: float = float(T["lastingMost"])
			for f in ["burn_t", "poison_t", "chill_t", "bleed_t", "hex_t", "still_t"]:
				var v: float = float(o.get(f))
				if v > 0.0:
					o.set(f, minf(v + most, v * k))
		"vast":
			for q in _near(o, float(T["vastR"]), 6, [o]):
				_hit(q, i, float(T["vast"]))
		"pulling":
			if not o.boss and o.has_method("throw_from"):
				var d: Vector2 = o.world - hero.world
				if d.length() > 0.9:
					o.throw_from(o.world + d.normalized(), float(T["pulling"]))
		"splitting":
			var nx: Array = _near(o, float(T["reach"]), 2, [o])
			for q in nx:
				_hit(q, i, float(T["splitting"]))
			if not nx.is_empty():
				more["x2"] = nx[0].world.x
				more["y2"] = nx[0].world.y
		"hexing":
			o.hex_t = maxf(o.hex_t, float(T["hexSecs"]))
			o.hex_more = maxf(o.hex_more, float(T["hex"]))
		"stilling":
			o.still_t = maxf(o.still_t, float(T["stillSecs"]))
			o.still_k = maxf(o.still_k, float(T["still"]))
		"binding":
			if not o.boss:
				o.bind_t = maxf(o.bind_t, float(T["bind"]))
		"bleeding":
			lw.bleed_monster(o, maxf(1.0, hero.avg_hit(i, float(T["bleed"]))), float(T["bleedSecs"]))
		"piercing":
			var way: Vector2 = (o.world - from).normalized() if o.world.distance_to(from) > 0.1 else hero.face
			var best = null
			var bd := float(T["reach"])
			for q in _list():
				if not _ok(q) or q == o:
					continue
				var v: Vector2 = q.world - o.world
				var along := v.dot(way)
				if along <= 0.0 or along > bd or absf(v.y * way.x - v.x * way.y) > 0.6 + q.r:
					continue
				bd = along
				best = q
			if best != null:
				_hit(best, i, float(T["piercing"]))
				more["x2"] = best.world.x
				more["y2"] = best.world.y
		"reaping":
			o.m52["high_reap"] = lw._clock + float(T["reapSecs"])
			o.m52["high_reap_i"] = i
		"culling":
			lw.cull_monster(o, float(T["cull"]), i)
		"surging":
			hero._blast(i, o.world, float(T["surgeR"]), float(T["surge"]), "nova", false, -8.0)
	_tell(id, "carry", at, from, more)


## (REAPING carried: one struck by death's hold that dies within its while rises as his spirit: last_words.gd killed)
func reap_hold(m) -> void:
	if not M52.HIGH_ON or m == null or m.boss:
		return
	if float(m.m52.get("high_reap", -1.0)) < lw._clock:
		return
	var i: int = int(m.m52.get("high_reap_i", 0))
	m.m52.erase("high_reap")
	lw._raise_spirit(m, i, float(C()["reapShare"]))
