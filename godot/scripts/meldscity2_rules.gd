## THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES AT WORK ON HIS MOVES (his “Then finish the melds”, 24 Nov 2026, the next group his
## Floor 11–15 doc named; their text tools/meldscity/docs_city2.txt; behind melds52.gd CITY2_ON). As meldscity_rules.gd is for the 45
## before them: a melded word does the work of both its words already (words.gd resolve, city_words.gd), and here is each one's TWIST,
## in front and behind, its numbers melds52.json `tune`. The 52's rules (`p`, melds52_rules.gd) hand on to this from each of their
## own moments (`z`); the city's words reach it through meldscity_rules.gd (`y`), which hands on to it from each of theirs.
##   PULLING:   Backwash (dragged by both strikes, staggered; behind, its vortex pulls again), Gullet (each dragged heals; behind,
##              orbs from what dies in its vortex), Harpoon (dragged into the middle, marked; behind, the marked pulled twice as
##              hard), Whirlpool (the frenzy drags from farther; behind, its vortex pulls harder with it), Haven (a shield for each
##              dragged; behind, its ward and vortex one), Eddy (the dragged drawn on two seconds; behind, a longer vortex pulling
##              harder as it holds), Whiplash (the yanked staggered; behind, a short vortex snapping all to its middle), Maelstrom
##              (drags twice as far; behind, a vortex twice as wide)
##   SPLITTING: Hydra (the second strike four copies; behind, its shards again), Swarm (each copy heals; behind, a shard's kill an
##              orb), Shellburst (copies burst; behind, a rune where each lands), Pinpoint (all copies at the toughest; behind, the
##              first a shard hits marked), Riot (five copies at full frenzy; behind, a shard's kill a step), Phalanx (each copy a
##              stronger shield; behind, a ward where each lands), Rebound (each copy flies on once more; behind, each shard
##              too), Flechette (copies twice as fast and a third harder; behind, shards twice as fast and far), Starburst (five
##              copies; behind, twice the shards, twice as far)
##   HEXING:    Refrain (the second strike deepens the curse; behind, a second circle), Bloodcurse (the cursed heal twice as
##              much; behind, orbs from its circle), Hexblast (a cursed kill's blast curses; behind, its rune's blast curses),
##              Evil Eye (criticals on the cursed harder; behind, the marked cursed), Delirium (the cursed add a step; behind,
##              his frenzy held in its circle), Talisman (what strikes his shield cursed), Grudge (a curse twice as long and
##              deepening; behind, a longer circle that leaves its curse on them), Omen (a shorter, deeper curse; behind, its
##              circle curses deeper as it goes), Pall (deeper for the cursed near; behind, a circle twice as wide)
##   STILLING:  Rewind (the second strike slows twice as long; behind, a second bubble), Sap (the slowed heal twice as much;
##              behind, orbs from its bubble), Slow Fuse (a slowed kill's blast late and twice as hard; behind, its rune's blast
##              slows), Stillpoint (the slowed more often critical; behind, the marked slowed), Quickening (at full frenzy a slow
##              twice as deep; behind, his frenzy builds twice as fast in its bubble), Respite (what strikes his shield slowed),
##              Eternity (a slow twice as long and deepening; behind, a longer bubble), Stutter (a shorter, deeper slow, stunned as
##              it ends; behind, its bubble stuns as it goes), Doldrums (those near slowed too; behind, a bubble twice as wide)
##   BINDING:   Fetters (the second strike holds again; behind, a second snare), Thrall (the held heal twice as much; behind,
##              what its snare holds drained), Tripwire (a held kill's blast twice as hard; behind, its snare bursts), Pin (the
##              first hit on the held certain critical; behind, what its snare catches marked), Mauler (the held add a step;
##              behind, a catch a step), Stockade (a shield for each held), Manacle (held twice as long; behind, its snare lasts
##              and holds twice as long), Snag (held shorter, hit harder; behind, a short snare catching all), Dragnet (those near
##              held too; behind, a snare twice as wide catching three)
## THE LOOKS read the tellings sent (fx_m52p_city2.gd), `m52` {id, what, ...}, told through the 52's (`p._tell`).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Words := preload("res://scripts/words.gd")

var h
## (the 52's rules: who has what, the tellings, the clock, the patches followed)
var p
## (the city's melds' rules: their helpers, the curse, the slow, the hold)
var y
## (what each use's strikes dragged: Backwash {i: {use, ids: {id: blow}}})
var _dragged := {}
## (each use's once-only twists: Delirium's, Mauler's step {i: use})
var _stepped := {}
## (a critical just struck, for Evil Eye: {monster id: true})
var _crit := {}
## (what Eddy keeps drawing in: [{m, at, t}])
var _eddies: Array = []
## (what Thrall's snare drains: [{m, i}])
var _thralls: Array = []
## (Hydra behind: its shards thrown again, not a third time)
var _again := false
## (Rebound: a copy flying on is not flown on again)
var _bouncing := false
## (Pinpoint behind: whom this throw's shards have marked {i: use})
var _pin_marked := {}


func _init(hero, rules, city) -> void:
	h = hero
	p = rules
	y = city


func _t(id: String) -> Dictionary:
	return M52.tune(id)


func _tell(e: Dictionary) -> void:
	p._tell(e)


func _C() -> Dictionary:
	return Words.data().get("city", {})


## His meld of these in front of move `i`, or "".
func f(i: int) -> String:
	var m: String = p.fid(i)
	return m if M52.is_city2(m) else ""


## His meld of these behind move `i`, or "".
func b(i: int) -> String:
	var m: String = p.bid(i)
	return m if M52.is_city2(m) else ""


func _r(i: int) -> Dictionary:
	return h.loadout.r(i)


func _here(o, but = null) -> bool:
	return p._alive(o) and o != but


## His frenzy one step up, as Frenzied's own (hero.gd: each use a stack, held a while).
func _step(i: int, at: Vector2, why: String) -> void:
	var F: Dictionary = Words.data()["frenzy"]
	h.frenzy = mini(int(F["max"]), h.frenzy + 1)
	h.frenzy_t = maxf(h.frenzy_t, float(F["hold"]) * float(_r(i)["last"]))
	_tell({"id": why, "what": "step", "x": at.x, "y": at.y, "n": h.frenzy, "x1": h.world.x, "y1": h.world.y})


## A shield on him, as Guarding's own, `share` more of his life (its most twice Guarding's own).
func _shield(share: float, id: String) -> void:
	var G: Dictionary = Words.data()["guard"]
	var most: float = roundf(h.max_life * float(G["shield"]) * 2.0)
	h.shield = minf(most, maxf(h.shield, 0.0) + roundf(h.max_life * share))
	h.shield_t = maxf(h.shield_t, float(G["shieldTime"]))
	_tell({"id": id, "what": "shield", "x": h.world.x, "y": h.world.y, "n": h.shield})


## Precise's mark on `o`, as Precise behind lays it.
func _mark(o, id: String) -> void:
	if not _here(o):
		return
	o.mark_t = float(Words.data()["precise"]["markTime"])
	_tell({"id": id, "what": "mark", "x": o.world.x, "y": o.world.y, "m": o})


func _heal(share: float, o, id: String) -> void:
	h.heal(share)
	if o != null and is_instance_valid(o):
		_tell({"id": id, "what": "drink", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y, "m": o})


func _blast(at: Vector2, rad: float, dmg: float, el: String, i: int, but = null) -> int:
	return p.x._burst(at, rad, dmg, el, i, but)


# --- a use ---

func used(i: int, echo: bool, _at: Vector2) -> void:
	if echo:
		return
	# (Quickening behind: inside its bubble, his frenzy builds twice as fast)
	if bool(_r(i)["frenzy"]) and h.wakes != null:
		var z = h.wakes.patch_at("bubble", h.world)
		if z != null and str(z.get("m52", "")) == "quickening":
			var F: Dictionary = Words.data()["frenzy"]
			h.frenzy = mini(int(F["max"]), h.frenzy + 1)
			_tell({"id": "quickening", "what": "step", "x": h.world.x, "y": h.world.y, "n": h.frenzy, "x1": h.world.x, "y1": h.world.y})


## Blow `k` of a use of move `i` is landing (melds52_rules.gd blow): Hydra's second strike splits again.
func blow(i: int, k: int) -> void:
	if k >= 1 and f(i) == "hydra" and h.city != null:
		h.city._split_use[i] = -1


# --- how a hit lands ---

## A critical or not: Pin's first on the held, Stillpoint's more often on the slowed (and what Evil Eye reads after).
func crit(m, i: int, c: bool, quiet: bool) -> bool:
	var id := f(i)
	match id:
		"pin":
			if m.bind_t > 0.0 and not bool(m.m52.get("pinned", false)):
				m.m52["pinned"] = true
				c = true
				if not quiet:
					_tell({"id": "pin", "what": "pierce", "x": m.world.x, "y": m.world.y, "m": m})
		"stillpoint":
			if not c and m.still_t > 0.0 and randf() < float(_t("stillpoint")["chance"]):
				c = true
				if not quiet:
					_tell({"id": "stillpoint", "what": "true", "x": m.world.x, "y": m.world.y, "m": m})
	_crit[m.id] = c
	return c


func more(m, i: int, quiet: bool) -> float:
	var k := 1.0
	match f(i):
		"evileye":
			if bool(_crit.get(m.id, false)) and m.hex_t > 0.0:
				k *= 1.0 + float(_t("evileye")["crit"])
				if not quiet:
					_tell({"id": "evileye", "what": "glare", "x": m.world.x, "y": m.world.y, "m": m})
		"snag":
			if m.bind_t > 0.0:
				k *= 1.0 + float(_t("snag")["more"])
				if not quiet:
					_tell({"id": "snag", "what": "hook", "x": m.world.x, "y": m.world.y, "m": m})
	return k


## How many times what Leech heals: the cursed, the slowed, the held.
func heal_k(m, i: int) -> float:
	var id := f(i)
	var k := 1.0
	match id:
		"bloodcurse":
			if m.hex_t > 0.0:
				k *= float(_t("bloodcurse")["heal"])
				_tell({"id": id, "what": "drink", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y, "m": m})
		"sap":
			if m.still_t > 0.0:
				k *= float(_t("sap")["heal"])
				_tell({"id": id, "what": "drink", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y, "m": m})
		"thrall":
			if m.bind_t > 0.0:
				k *= float(_t("thrall")["heal"])
				_tell({"id": id, "what": "drink", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y, "m": m})
	return k


# --- what a hit has done ---

func struck(m, i: int, dmg: float, c: bool, at: Vector2, quiet: bool) -> void:
	var id := f(i)
	if id == "" or m.dead:
		return
	var r: Dictionary = _r(i)
	var second: bool = int(p.blow_n) >= 1
	p._tag(m)
	match id:
		"backwash":
			# (dragged by the first strike, struck by the second: staggered, once a use)
			# (the second strike lands among those the first dragged in: each of them near it is staggered, once a use)
			var d: Dictionary = _dragged.get(i, {})
			if second and int(d.get("use", -1)) == int(h.uses[i]) and not bool(d.get("done", false)):
				d["done"] = true
				for o in p._mons():
					if p._alive(o) and d["ids"].has(o.id) and o.world.distance_to(at) <= float(_t("backwash")["near"]) and not o.boss:
						o.stun_for(float(_t("backwash")["stagger"]), "backwash")
						_tell({"id": id, "what": "stagger", "x": o.world.x, "y": o.world.y, "m": o})
		"refrain":
			if second and m.hex_t > 0.0:
				m.hex_more = minf(float(_C()["hex"]["most"]) * 1.5, m.hex_more * (1.0 + float(_t("refrain")["deeper"])))
				if not quiet:
					_tell({"id": id, "what": "deeper", "x": m.world.x, "y": m.world.y, "m": m})
		"rewind":
			if second and m.still_t > 0.0 and not bool(m.m52.get("rewound", false)):
				m.m52["rewound"] = true
				m.still_t *= float(_t("rewind")["longer"])
				_tell({"id": id, "what": "turn", "x": m.world.x, "y": m.world.y, "m": m})
		"fetters":
			if second and m.bind_t > 0.0:
				var secs: float = float(r["bind"]) * float(_t("fetters")["again"])
				m.bind_again = 0.0
				var held: float = h.city.bind_monster(m, secs)
				if held > 0.0:
					h._tell({"t": "bind", "id": m.id, "m": m, "secs": held})
					_tell({"id": id, "what": "cuff", "x": m.world.x, "y": m.world.y, "m": m})
		"delirium":
			if m.hex_t > 0.0 and int(_stepped.get(i, -1)) != int(h.uses[i]):
				_stepped[i] = h.uses[i]
				_step(i, m.world, id)
		"mauler":
			if m.bind_t > 0.0 and int(_stepped.get(i, -1)) != int(h.uses[i]):
				_stepped[i] = h.uses[i]
				_step(i, m.world, id)
		"quickening":
			if h.frenzy >= int(Words.data()["frenzy"]["max"]) and m.still_t > 0.0:
				m.still_k = minf(float(_C()["still"]["most"]), m.still_k * float(_t("quickening")["deeper"]))
				if not quiet:
					_tell({"id": id, "what": "deep", "x": m.world.x, "y": m.world.y, "m": m})
		"grudge":
			if m.hex_t > 0.0 and not bool(m.m52.get("grudge", false)):
				m.m52["grudge"] = true
				m.hex_t *= float(_t("grudge")["longer"])
				_tell({"id": id, "what": "brand", "x": m.world.x, "y": m.world.y, "m": m})
		"omen":
			if m.hex_t > 0.0 and not bool(m.m52.get("omen", false)):
				m.m52["omen"] = true
				m.hex_t *= float(_t("omen")["short"])
				m.hex_more = minf(float(_C()["hex"]["most"]) * 1.5, m.hex_more * float(_t("omen")["deeper"]))
				_tell({"id": id, "what": "fall", "x": m.world.x, "y": m.world.y, "m": m})
		"pall":
			if m.hex_t > 0.0 and not quiet:
				var T := _t("pall")
				var n := 0
				for o in y._near(m.world, float(T["near"]), m):
					if o.hex_t > 0.0:
						n += 1
				n = mini(n, int(T["most"]))
				if n > 0:
					m.hex_more = minf(float(_C()["hex"]["most"]) * 1.5, maxf(m.hex_more, float(r["hex"]) * (1.0 + float(T["each"]) * n)))
					_tell({"id": id, "what": "veil", "x": m.world.x, "y": m.world.y, "n": n, "m": m})
		"eternity":
			if m.still_t > 0.0 and not bool(m.m52.get("eternity", false)):
				m.m52["eternity"] = true
				m.still_t *= float(_t("eternity")["longer"])
				_tell({"id": id, "what": "loop", "x": m.world.x, "y": m.world.y, "m": m})
		"stutter":
			if m.still_t > 0.0 and not m.m52.has("stutter"):
				m.m52["stutter"] = i
				m.still_t *= float(_t("stutter")["short"])
				m.still_k = minf(float(_C()["still"]["most"]), m.still_k * float(_t("stutter")["deeper"]))
				_tell({"id": id, "what": "catch", "x": m.world.x, "y": m.world.y, "m": m})
		"doldrums":
			if not quiet:
				var k: float = float(r["still"]) if float(r.get("still", 0.0)) > 0.0 else float(_C()["still"]["slower"])
				var n := 0
				for o in y._near(m.world, float(_t("doldrums")["near"]), m):
					if o.still_t <= 0.0:
						y._still(o, k)
						n += 1
				if n > 0:
					_tell({"id": id, "what": "spread", "x": m.world.x, "y": m.world.y, "r": float(_t("doldrums")["near"]), "n": n})
		"dragnet":
			if not quiet:
				var n := 0
				for o in y._near(m.world, float(_t("dragnet")["near"]), m):
					if o.bind_t <= 0.0:
						var held: float = h.city.bind_monster(o, float(r["bind"]))
						if held > 0.0:
							h._tell({"t": "bind", "id": o.id, "m": o, "secs": held})
							n += 1
				if n > 0:
					_tell({"id": id, "what": "net", "x": m.world.x, "y": m.world.y, "r": float(_t("dragnet")["near"]), "n": n})
		"hexblast", "slowfuse", "tripwire":
			m.m52[id] = i


## A kill: Hexblast's cursing blast, Slow Fuse's late one, Tripwire's harder one; what dies in Gullet's vortex, Bloodcurse's circle
## or Sap's bubble drops a life orb; Riot's shard kills a step (copy_hit).
func killed(m, i: int) -> void:
	var id := f(i)
	var r: Dictionary = _r(i)
	var at: Vector2 = m.world
	match id:
		"hexblast":
			if m.hex_t > 0.0:
				var T := _t("hexblast")
				var more: float = maxf(m.hex_more, float(r["hex"]))
				for o in y._near(at, float(T["r"]), m):
					y._curse(o, more)
				_tell({"id": id, "what": "burst", "x": at.x, "y": at.y, "r": float(T["r"])})
		"slowfuse":
			if m.still_t > 0.0:
				var T := _t("slowfuse")
				var hurt: float = maxf(1.0, roundf(float(m.max_life) * float(r["volatile"]) * float(T["k"])))
				var el: String = str(r["element"])
				_tell({"id": id, "what": "fuse", "x": at.x, "y": at.y, "secs": float(T["wait"])})
				p._later_do(float(T["wait"]), func() -> void:
					_blast(at, 1.8, hurt, el, i)
					_tell({"id": "slowfuse", "what": "boom", "x": at.x, "y": at.y, "r": 1.8}))
		"tripwire":
			if m.bind_t > 0.0:
				var hurt: float = maxf(1.0, roundf(float(m.max_life) * float(r["volatile"]) * float(_t("tripwire")["k"])))
				_blast(at, 1.8, hurt, str(r["element"]), i, m)
				_tell({"id": id, "what": "boom", "x": at.x, "y": at.y, "r": 1.8})
	# (Gullet, Bloodcurse, Sap behind: what dies in their ground drops a life orb)
	if h.wakes != null:
		for pair in [["vortex", "gullet"], ["hex", "bloodcurse"], ["bubble", "sap"]]:
			var z = h.wakes.patch_at(pair[0], at)
			if z != null and str(z.get("m52", "")) == pair[1]:
				if h.monsters != null and h.monsters.loot != null:
					h.monsters.loot.orb_at(at)
				_tell({"id": pair[1], "what": "orb", "x": at.x, "y": at.y})
				break


## Precise behind has marked `m`: Evil Eye curses it, Stillpoint slows it.
func marked(m, i: int) -> void:
	match b(i):
		"evileye":
			y._curse(m, float(_r(i)["hex"]) if float(_r(i)["hex"]) > 0.0 else float(_C()["hex"]["more"]))
			_tell({"id": "evileye", "what": "eye", "x": m.world.x, "y": m.world.y, "m": m})
		"stillpoint":
			y._still(m, float(_C()["still"]["slower"]))
			_tell({"id": "stillpoint", "what": "still", "x": m.world.x, "y": m.world.y, "m": m})


# --- Pulling (city_words.gd pull_in, through meldscity_rules.gd) ---

func pull_reach(i: int, reach: float) -> float:
	if f(i) == "whirlpool":
		return reach * (1.0 + float(_t("whirlpool")["each"]) * h.frenzy)
	return reach


func pull_k(i: int, _o) -> float:
	match f(i):
		"maelstrom":
			return float(_t("maelstrom")["far"])
		"whirlpool":
			return 1.0 + float(_t("whirlpool")["each"]) * h.frenzy
	return 1.0


func pulled(i: int, at: Vector2, moved: Array) -> void:
	var id := f(i)
	if id == "" or moved.is_empty():
		return
	match id:
		"backwash":
			var use: int = h.uses[i]
			var d: Dictionary = _dragged.get(i, {})
			if int(d.get("use", -1)) != use:
				d = {"use": use, "ids": {}}
				_dragged[i] = d
			for o in moved:
				if not d["ids"].has(o.id):
					d["ids"][o.id] = int(p.blow_n)
		"gullet":
			_heal(float(_t("gullet")["heal"]) * moved.size(), moved[0], id)
		"harpoon":
			for o in moved:
				if o.world.distance_to(at) <= float(_t("harpoon")["mid"]):
					_mark(o, id)
		"haven":
			_shield(float(_t("haven")["per"]) * mini(4, moved.size()), id)
		"eddy":
			for o in moved:
				_eddies.append({"m": o, "at": at, "t": float(_t("eddy")["secs"])})
			_tell({"id": id, "what": "eddy", "x": at.x, "y": at.y})
		"whiplash":
			for o in moved:
				if not o.dead:
					o.stun_for(float(_t("whiplash")["stagger"]), "whiplash")
			_tell({"id": id, "what": "yank", "x": at.x, "y": at.y, "n": moved.size()})
		"maelstrom":
			_tell({"id": id, "what": "maw", "x": at.x, "y": at.y, "n": moved.size()})
		"whirlpool":
			if h.frenzy > 0:
				_tell({"id": id, "what": "spin", "x": at.x, "y": at.y, "n": h.frenzy})


# --- Splitting (city_words.gd split_first, throw_shards) ---

func split_n(i: int, n: int) -> int:
	match f(i):
		"hydra":
			if int(p.blow_n) >= 1:
				_tell({"id": "hydra", "what": "heads", "x": h.world.x, "y": h.world.y})
				return n + 1
			return n
		"riot":
			if h.frenzy >= int(Words.data()["frenzy"]["max"]):
				_tell({"id": "riot", "what": "step", "x": h.world.x, "y": h.world.y, "n": h.frenzy, "x1": h.world.x, "y1": h.world.y})
				return int(_t("riot")["copies"])
			return n
		"starburst":
			return int(_t("starburst")["copies"])
	return n


func split_k(i: int) -> float:
	return float(_t("flechette")["k"]) if f(i) == "flechette" else 1.0


func split_speed(i: int) -> float:
	return float(_t("flechette")["speed"]) if f(i) == "flechette" else 1.0


func shard_speed(i: int) -> float:
	return float(_t("flechette")["speed"]) if b(i) == "flechette" else 1.0


## Whom the copies fly at: Pinpoint's all at the toughest near.
func split_to(i: int, near: Array) -> Array:
	if f(i) != "pinpoint" or near.is_empty():
		return near
	var best = near[0]
	for o in near:
		if o.life > best.life:
			best = o
	var out: Array = []
	for k in near.size():
		out.append(best)
	_tell({"id": "pinpoint", "what": "aim", "x": best.world.x, "y": best.world.y, "m": best})
	return out


func copy_hit(o, i: int, kind: String) -> void:
	if o == null or not is_instance_valid(o):
		return
	var id := f(i) if kind == "copy" else b(i)
	if id == "":
		return
	var r: Dictionary = _r(i)
	match id:
		"swarm":
			if kind == "copy":
				_heal(float(_t("swarm")["heal"]), o, id)
			elif o.dead:
				if h.monsters != null and h.monsters.loot != null:
					h.monsters.loot.orb_at(o.world)
				_tell({"id": id, "what": "orb", "x": o.world.x, "y": o.world.y})
		"shellburst":
			if kind == "copy":
				var T := _t("shellburst")
				_blast(o.world, float(T["r"]), y._avg(i, float(T["k"])), str(r["element"]), i)
				_tell({"id": id, "what": "pop", "x": o.world.x, "y": o.world.y, "r": float(T["r"])})
		"pinpoint":
			if kind == "shard" and int(_pin_marked.get(i, -1)) != int(h.uses[i]) and not o.dead:
				_pin_marked[i] = h.uses[i]
				_mark(o, id)
		"riot":
			if kind == "shard" and o.dead:
				_step(i, o.world, id)
		"phalanx":
			if kind == "copy":
				_shield(float(_t("phalanx")["per"]), id)
		"rebound":
			if not _bouncing:
				var at: Vector2 = o.world
				var to = y._nearest(at, float(_C()["split"]["reach"]), o)
				if to != null:
					var secs: float = maxf(0.06, to.world.distance_to(at) / float(_C()["split"]["speed"]))
					_tell({"id": id, "what": "bounce", "x": at.x, "y": at.y, "x1": to.world.x, "y1": to.world.y, "secs": secs})
					var share: float = float(_t("rebound")["share"]) * (float(r["split"]) if kind == "copy" else float(_C()["split"]["shardShare"]))
					var t2 = to
					h._after(secs, func() -> void:
						_bouncing = true
						h.city._copy_hit(t2, i, share, kind)
						_bouncing = false)


func shard_n(i: int, n: int) -> int:
	return roundi(n * float(_t("starburst")["shards"])) if b(i) == "starburst" else n


func shard_reach(i: int) -> float:
	match b(i):
		"starburst":
			return float(_t("starburst")["far"])
		"flechette":
			return float(_t("flechette")["far"])
	return 1.0


func shards_begun(i: int, at: Vector2, lands: Array) -> void:
	if b(i) != "":
		_tell({"id": b(i), "what": "shards", "x": at.x, "y": at.y, "lands": lands})
	if b(i) == "hydra" and not _again:
		_tell({"id": "hydra", "what": "heads", "x": at.x, "y": at.y})
		p._later_do(float(_t("hydra")["again"]), func() -> void:
			_again = true
			h.city._shards_at[i] = -9.0
			h.city.throw_shards(i, at, 1.0)
			_again = false)


func shard_land(i: int, pos: Vector2) -> void:
	var id := b(i)
	if id == "" or h.wakes == null:
		return
	var W = h.wakes
	var from: int = W.list.size()
	match id:
		"shellburst":
			var T := _t("shellburst")
			W.add_rune(i, pos, float(T["runeR"]), maxf(1.0, h.avg_hit(i, 1.0) * float(T["runeK"])), str(_r(i)["element"]), "shellburst")
		"phalanx":
			var T := _t("phalanx")
			W.add_ward(i, pos, float(T["wardR"]), float(T["wardSecs"]), float(Words.data()["guard"]["ward"]))
			_tell({"id": id, "what": "plate", "x": pos.x, "y": pos.y})
	for z in W.list.slice(from):
		z["m52"] = id
		if not p._wards.has(z):
			p._wards.append(z)


# --- Binding (city_words.gd bind_monster, wakes.gd _snare) ---

func bind_secs(i: int, m, secs: float) -> float:
	match f(i):
		"manacle":
			_tell({"id": "manacle", "what": "lock", "x": m.world.x, "y": m.world.y, "m": m})
			return secs * float(_t("manacle")["longer"])
		"snag":
			return secs * float(_t("snag")["short"])
		"stockade":
			_shield(float(_t("stockade")["per"]), "stockade")
	return secs


## His snare `z` has sprung on `o`: whether it is spent (null: not one of these, Binding's own answer stands).
func snared(z: Dictionary, o):
	var i: int = int(z.get("skill", -1))
	var id: String = str(z.get("m52", ""))
	if i < 0 or i > 2 or not M52.is_city2(id):
		return null
	var at := Vector2(z["x"], z["y"])
	var r: Dictionary = _r(i)
	match id:
		"thrall":
			_thralls.append({"m": o, "i": i})
			_tell({"id": id, "what": "drain", "x": at.x, "y": at.y, "m": o})
		"tripwire":
			var T := _t("tripwire")
			_blast(at, float(T["blastR"]), y._avg(i, float(T["blastK"])), str(r["element"]), i)
			_tell({"id": id, "what": "boom", "x": at.x, "y": at.y, "r": float(T["blastR"])})
		"pin":
			_mark(o, id)
		"mauler":
			_step(i, at, id)
		"snag":
			_tell({"id": id, "what": "snare", "x": at.x, "y": at.y, "m": o})
			return false
		"dragnet":
			var left: int = int(z.get("left", int(_t("dragnet")["catches"]))) - 1
			z["left"] = left
			_tell({"id": id, "what": "snare", "x": at.x, "y": at.y, "m": o, "left": left})
			return left <= 0
		_:
			_tell({"id": id, "what": "snare", "x": at.x, "y": at.y, "m": o})
	return true


# --- what a move leaves (hero.gd _wake, through meldscity_rules.gd wake_city) ---

func wake_city(i: int, from: int) -> void:
	var id := b(i)
	if id == "" or h.wakes == null:
		return
	var W = h.wakes
	var laid: Array = W.list.slice(from)
	var r: Dictionary = _r(i)
	for z in laid:
		z["m52"] = id
		var k: String = str(z["kind"])
		var at := Vector2(z["x"], z["y"])
		match id:
			"backwash":
				if k == "vortex":
					var zz = z
					p._later_do(float(_t("backwash")["again"]), func() -> void: _snap(zz, float(_t("backwash")["snap"]), "backwash", "again"))
			"eddy":
				if k == "vortex":
					z["dur"] = float(z["dur"]) * float(_t("eddy")["longer"])
			"whiplash":
				if k == "vortex":
					z["dur"] = float(z["dur"]) * float(_t("whiplash")["short"])
			"maelstrom":
				if k == "vortex":
					z["r"] = float(z["r"]) * float(_t("maelstrom")["wide"])
			"haven":
				if k == "ward":
					for q in laid:
						if str(q["kind"]) == "vortex":
							q["r"] = maxf(float(q["r"]), float(z["r"]))
			"refrain", "rewind", "fetters":
				var want := {"refrain": "hex", "rewind": "bubble", "fetters": "snare"}[id] as String
				if k == want:
					var T := _t(id)
					var off: Vector2 = (at - h.world).normalized() if at.distance_to(h.world) > 0.1 else Vector2(1, 0)
					var at2: Vector2 = at + off.orthogonal() * float(T["off"])
					var zr: float = float(z["r"])
					var zd: float = float(z["dur"])
					var zs: float = float(z["dmg"])
					p._later_do(float(T["again"]), func() -> void: _second(i, id, want, at2, zr, zd, zs))
			"grudge":
				if k == "hex":
					z["dur"] = float(z["dur"]) * float(_t("grudge")["longer"])
			"omen", "stutter":
				if k == ("hex" if id == "omen" else "bubble"):
					z["dur"] = float(z["dur"]) * float(_t(id)["short"])
			"pall", "doldrums":
				if k == ("hex" if id == "pall" else "bubble"):
					z["r"] = float(z["r"]) * float(_t(id)["wide"])
			"eternity":
				if k == "bubble":
					z["dur"] = float(z["dur"]) * float(_t("eternity")["longer"])
			"manacle":
				if k == "snare":
					z["dur"] = float(z["dur"]) * float(_t("manacle")["longer"])
					z["dmg"] = float(z["dmg"]) * float(_t("manacle")["longer"])
			"snag":
				if k == "snare":
					z["dur"] = float(z["dur"]) * float(_t("snag")["snareShort"])
			"dragnet":
				if k == "snare":
					z["r"] = float(z["r"]) * float(_t("dragnet")["wide"])
			"hexblast", "slowfuse":
				if k == "rune":
					var zz = z
					var T := _t(id)
					p._later_do(float(T["runeWait"]), func() -> void: _rune_went(zz, id, i))
		if k in ["vortex", "hex", "bubble", "snare", "ward", "rune", "cracks"] and not p._wards.has(z):
			p._wards.append(z)
	_tell({"id": id, "what": "leave", "x": float(laid[0]["x"]) if not laid.is_empty() else h.world.x, "y": float(laid[0]["y"]) if not laid.is_empty() else h.world.y})


## Backwash's second pull, Whiplash's snap as it goes: everything in `z` drawn `far` toward its middle at once.
func _snap(z: Dictionary, far: float, id: String, what: String) -> void:
	var at := Vector2(z["x"], z["y"])
	var n := 0
	for o in y._near(at, float(z["r"])):
		if o.boss:
			continue
		var d: float = o.world.distance_to(at)
		var go: float = minf(far * (0.5 if o.elite else 1.0), d - float(_C()["pull"]["stop"]))
		if go > 0.05:
			h.melds._slide(o, (at - o.world) / d * go, 6)
			n += 1
			if id == "whiplash" and not o.dead:
				o.stun_for(float(_t("whiplash")["stagger"]), "whiplash")
	_tell({"id": id, "what": what, "x": at.x, "y": at.y, "r": float(z["r"]), "n": n})


## Refrain's, Rewind's, Fetters' second ground, beside the first.
func _second(i: int, id: String, kind: String, at: Vector2, rad: float, dur: float, share: float) -> void:
	if h.wakes == null:
		return
	var W = h.wakes
	var from: int = W.list.size()
	if kind == "snare":
		W.add_snare(i, at, share)
	else:
		W.add_zone(kind, i, at, rad, dur, share)
	for z in W.list.slice(from):
		z["m52"] = id
		if not p._wards.has(z):
			p._wards.append(z)
	_tell({"id": id, "what": "again", "x": at.x, "y": at.y, "r": rad})


## Hexblast's and Slow Fuse's rune gone off: what it caught cursed, or slowed in time.
func _rune_went(z: Dictionary, id: String, i: int) -> void:
	var at := Vector2(z["x"], z["y"])
	var rad: float = float(z["r"]) + 0.4
	for o in y._near(at, rad):
		if id == "hexblast":
			y._curse(o, float(_r(i)["hex"]) if float(_r(i)["hex"]) > 0.0 else float(_C()["hex"]["more"]))
		else:
			y._still(o, float(_C()["still"]["slower"]))
	_tell({"id": id, "what": "rune", "x": at.x, "y": at.y, "r": rad})


## A patch of these at work (melds52_rules.gd _grounds): `tick` every half second.
func ground(z: Dictionary, id: String, at: Vector2, rad: float, tick: bool, dt: float) -> void:
	var i: int = int(z.get("skill", 0))
	var k: String = str(z["kind"])
	var near_end: bool = float(z["t"]) >= float(z["dur"]) - dt * 1.5
	var pace: float = float(_C()["pull"]["pace"])
	match id:
		"harpoon":
			if k == "vortex":
				for o in y._near(at, rad):
					if o.mark_t > 0.0 and not o.boss:
						_drift(o, at, pace * (float(_t("harpoon")["k"]) - 1.0) * dt)
		"whirlpool":
			if k == "vortex" and h.frenzy > 0:
				for o in y._near(at, rad):
					if not o.boss:
						_drift(o, at, pace * float(_t("whirlpool")["each"]) * h.frenzy * dt)
		"eddy":
			if k == "vortex":
				var grow: float = float(_t("eddy")["grow"]) * float(z["t"]) / maxf(1.0, float(z["dur"]))
				for o in y._near(at, rad):
					if not o.boss:
						_drift(o, at, pace * grow * dt)
		"whiplash":
			if k == "vortex" and near_end and not z.get("snapped", false):
				z["snapped"] = true
				_snap(z, rad, "whiplash", "snap")
		"delirium":
			if k == "hex" and h.world.distance_to(at) <= rad and h.frenzy > 0:
				h.frenzy_t = maxf(h.frenzy_t, 0.6)
				if tick:
					_tell({"id": id, "what": "fever", "x": h.world.x, "y": h.world.y})
		"grudge":
			if k == "hex" and tick:
				for o in y._near(at, rad):
					y._curse(o, float(z["dmg"]) if float(z["dmg"]) > 0.0 else float(_C()["hex"]["more"]), float(_t("grudge")["stay"]))
		"omen", "stutter":
			if k == ("hex" if id == "omen" else "bubble") and near_end and not z.get("went", false):
				z["went"] = true
				var n := 0
				for o in y._near(at, rad):
					if id == "omen":
						y._curse(o, float(_C()["hex"]["more"]) * float(_t("omen")["deeper"]))
					elif not o.boss:
						o.stun_for(float(_t("stutter")["stun"]), "stutter")
					n += 1
				_tell({"id": id, "what": "went", "x": at.x, "y": at.y, "r": rad, "n": n})


func _drift(o, at: Vector2, go: float) -> void:
	var d: float = o.world.distance_to(at)
	if d <= float(_C()["pull"]["middle"]) or go <= 0.0:
		return
	var s: Vector2 = (at - o.world) / d * minf(go, d - float(_C()["pull"]["middle"]))
	if h.monsters.clear(o.world.x + s.x, o.world.y, minf(o.r, 0.42), o.kind == "bat"):
		o.world.x += s.x
	if h.monsters.clear(o.world.x, o.world.y + s.y, minf(o.r, 0.42), o.kind == "bat"):
		o.world.y += s.y


# --- each frame ---

func step(dt: float) -> void:
	# (Eddy: what it dragged, drawn on to where it struck)
	if not _eddies.is_empty():
		var keep: Array = []
		var pace: float = float(_C()["pull"]["pace"]) * float(_t("eddy")["pace"])
		for e in _eddies:
			e["t"] = float(e["t"]) - dt
			var o = e["m"]
			if float(e["t"]) > 0.0 and is_instance_valid(o) and not o.dead and not o.boss:
				_drift(o, e["at"], pace * (0.5 if o.elite else 1.0) * dt)
				keep.append(e)
		_eddies = keep
	# (Thrall: what its snare holds drained, healing him)
	if not _thralls.is_empty():
		var keep: Array = []
		for e in _thralls:
			var o = e["m"]
			if is_instance_valid(o) and not o.dead and o.bind_t > 0.0:
				h.heal(float(_t("thrall")["drain"]) * dt)
				e["told"] = float(e.get("told", 0.0)) - dt
				if float(e["told"]) <= 0.0:
					e["told"] = 0.5
					_tell({"id": "thrall", "what": "drink", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y, "m": o})
				keep.append(e)
		_thralls = keep
	# (Grudge, Eternity: the curse and the slow deepen while they hold; Stutter: stunned as the slow ends)
	for m in p._tagged:
		if not is_instance_valid(m) or m.dead:
			continue
		if bool(m.m52.get("grudge", false)):
			if m.hex_t > 0.0:
				m.hex_more = minf(float(_C()["hex"]["most"]) * 1.5, m.hex_more + float(_t("grudge")["grow"]) * dt)
			else:
				m.m52.erase("grudge")
		if bool(m.m52.get("eternity", false)):
			if m.still_t > 0.0:
				m.still_k = minf(float(_C()["still"]["most"]), m.still_k + float(_t("eternity")["grow"]) * dt)
			else:
				m.m52.erase("eternity")
		if m.m52.has("stutter") and m.still_t <= 0.0:
			m.m52.erase("stutter")
			if not m.boss:
				m.stun_for(float(_t("stutter")["stun"]), "stutter")
			_tell({"id": "stutter", "what": "stun", "x": m.world.x, "y": m.world.y, "m": m})
		if bool(m.m52.get("omen", false)) and m.hex_t <= 0.0:
			m.m52.erase("omen")
		if bool(m.m52.get("rewound", false)) and m.still_t <= 0.0:
			m.m52.erase("rewound")
		if bool(m.m52.get("pinned", false)) and m.bind_t <= 0.0:
			m.m52.erase("pinned")


## A blow on him while his shield holds (hero.gd hurt_by): Talisman curses its maker, Respite slows it in time.
func struck_him(src) -> void:
	if src == null or not is_instance_valid(src) or src.dead or not p._shielded():
		return
	if p.any_has("talisman"):
		y._curse(src, float(_C()["hex"]["more"]))
		_tell({"id": "talisman", "what": "ward", "x": src.world.x, "y": src.world.y, "m": src})
	if p.any_has("respite"):
		y._still(src, float(_C()["still"]["slower"]))
		_tell({"id": "respite", "what": "ward", "x": src.world.x, "y": src.world.y, "m": src})


func forget() -> void:
	_dragged.clear()
	_stepped.clear()
	_crit.clear()
	_eddies.clear()
	_thralls.clear()
	_pin_marked.clear()
	_again = false
	_bouncing = false
