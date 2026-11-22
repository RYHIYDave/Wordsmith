## THE WORDS MELDING MAKES, IN THE FIGHT (game/melds.ts, melds8.ts; game.ts meldHit, meldArc, meldPatch, meldZone, runeTwist,
## explodeKill, chainArcs, shatterKill, ruptureKill, meld8, meld8Struck, updateMelds8, fervorPct; and the lines of hitMonster,
## damageMonster, kill, hurtHero, updateDots, updateMonsters and updateZones that read a melded word), as the game starts (MELD,
## RANK2, VOLT_MELDS, MELDS8 on). A melded word set in a move does the work of both its words already (words.gd resolve: it is both
## of them for every rule, and the fight reads it so, loadout.gd wfronts); a ranked word is its word, stronger (resolve has it all).
## What is here is each melded word's TWIST, in front (the hit) and behind (what the move leaves), as game.ts does it, its numbers
## the game's own (words.json `melds`: MELD_TUNE, MELD8_TUNE):
##   THE TEN (two damage words):
##     ERUPTION     in front, the blast leaves a pool of molten ground (0.9 round, 3 s, burning for 30% of the hit a second);
##                  behind, each hit builds heat, and at 5 the next hit erupts round what it struck (2 round, 150%)
##     AVALANCHE    in front, what it hits is shoved 1.2 tiles back from him, and one stopped short by a wall or another is frozen
##                  (not a boss); behind, a hit on one chilled, 30% harder
##     THUNDER      in front, one bolt out of the sky in place of the arcs (resolve: no arcs, 50% harder, it stuns 0.5 s);
##                  behind, every 4th hit a thunderclap round him (2.4 round, 80%)
##     BLIGHT       in front, the hit not weakened (resolve), its poison up to twice as hard as the enemy's life runs out;
##                  behind, one it touches takes 20% more from everything for 5 s while poisoned
##     SCALD        in front, a burning one chilled or a chilled one set burning cracks for 60% (no oftener than each 1 s on one);
##                  behind, steam in place of the burning ground (resolve), slowing as ice does; he is hidden while he stands in
##                  it: nothing sees him to attack
##     WILDFIRE     in front, each arc sets burning what it strikes; behind, the burning ground throws a spark at one within 2.5
##                  tiles of it every 0.6 s (1.2 times its burning)
##     FUMES        in front, one both burning and poisoned gives off a toxic cloud (1.5 round, 3 s, as hard as its poison; no
##                  oftener than each 2 s on one); behind, the cloud explodes (four times its poison) as anything burning comes in
##     HAILSTORM    in front, each arc chills, and one frozen passes it on to one more; behind, a storm of ice (resolve) that slows
##     FROSTBITE    in front, a chilled one loses 15% of the hit a second, a frozen one twice that; behind, the ice poisons
##     CONTAGION    in front, each arc poisons; behind, the cloud shocks one in it each half second (twice its poison)
##   VOLATILE'S FIVE (a damage word and Volatile): what Volatile's kills explode with (explodeKill) and its rune do more:
##     DEMOLITION   in front, the explosions half as big again, in size and harm; an elite or a boss bursts once at half its life;
##                  behind, one huge rune at a time, twice as wide and hard, slow to go off (2.4 s)
##     POWDERKEG    in front, a burning one killed explodes half as hard again, setting what it strikes burning; behind, the rune
##                  leaves burning ground
##     SHATTER      in front, a frozen one killed bursts into shards (a quarter of its life to each within 2.2); behind, the rune
##                  freezes what is in it 40% through its wait
##     CHAIN REACTION  in front, an explosion arcs to the 3 nearest (half of it); behind, a rune going off sets off the nearest
##                  other linked one within 6 tiles, 0.12 s on, and so on
##     RUPTURE      in front, a poisoned one killed bursts its poison over each within 2; behind, the rune leaves a poison cloud
##   THE EIGHT ACROSS THE GROUPS (melds8.ts; behind, half as strong: MELD8_TUNE.behind):
##     SIPHON (his poison heals him 30% of what it does), CAUTERIZE (a burning one killed heals him 6% of his life), FORKING (each
##     hit arcs to the nearest other within 3 tiles for half of it), SHIVER (a critical hit freezes 0.8 s), SUNDER (one stunned
##     takes 30% more while stunned), FERVOR (each kill: 10% more fire harm for 4 s, five at most), RIME WARD (a blow he blocks
##     chills its maker 2 s), IMPLODE (those within 3 tiles drawn 1.6 toward where it struck, then 0.4 s on a burst there, 2.2
##     round, 80%).
## (Left out, as not here: Pulling's own drag and vortex, which Implode does as one of its two words: the city's words are not in
## the Godot version.)
##
## THE HOOKS FOR THEIR LOOKS (render/melds3.ts, volatile3.ts, melds8.ts read the same; nothing of theirs is drawn here):
##   tellings (fx.gd event), as the game emits them: `arc` with `meld` (Thunder's bolt, the arcs of a melded word in front, Forking's,
##     Hailstorm's passed on, Wildfire's sparks, Contagion's shocks, a storm of ice's bolts); `burst` with `meld` (Scald's crack,
##     Eruption's eruption, Thunder's clap, Fumes' explosion, Implode's burst, Volatile's explosions and runes); `zone` with `meld`
##     (ground, clouds and runes laid by a melded word behind, the pools and clouds of Eruption and Fumes in front); `meldFx`
##     ({what: "crush" | "shove", id, x, y, x1, y1, frozen}); `volFx` ({meld, what: "catch" | "arc" | "shard" | "splash" | "freeze" |
##     "link" | "half", ...}); `meld8` ({id, k, on | x, y, ...}); `stun` with `meld` "thunder"; `text` "HEAT"; `shake`.
##   state: `heat[i]` and `hits[i]` (Eruption's heat and Thunder's hits toward their next, game.ts meldHeat, meldHits);
##     `implosions` (Implode's bursts to come); `fervor_n`, `fervor_t`; on a monster (monster.gd), `scald_cd`, `fumes_cd`,
##     `blight_t`, `bite_dps`, `sunder`, `sunder_t`, `demolished`; on a patch (wakes.gd), `meld` (the melded word behind whose
##     twist it does), `look` (a melded word in front whose pool or cloud it is: the look only), `froze`, `linked`, `meld_t`.
extends RefCounted

const Words := preload("res://scripts/words.gd")

var hero  # hero.gd
## Eruption behind: each move's heat (to 5); Thunder behind: each move's hits toward its thunderclap (game.ts meldHeat, meldHits).
var heat: Array = [0, 0, 0]
var hits: Array = [0, 0, 0]
## IMPLODE's bursts to come: {x, y, t (seconds still), dmg, r, i, el}.
var implosions: Array = []
## FERVOR: kills counted (five at most) and the seconds they last.
var fervor_n := 0.0
var fervor_t := 0.0


func _init(h) -> void:
	hero = h


static func T() -> Dictionary:
	return Words.data()["melds"]["tune"]


static func E() -> Dictionary:
	return Words.data()["melds"]["eightTune"]


func _tell(e: Dictionary) -> void:
	hero._tell(e)


func _sfx(name: String, vol: float) -> void:
	if hero.sfx != null:
		hero.sfx.play(name, linear_to_db(vol))


func _list() -> Array:
	return hero.monsters.list if hero.monsters != null else []


func _shut(o) -> bool:
	return hero.monsters != null and hero.monsters.shut_in(o)


## (game.ts meldPatch: Eruption's molten pool, Fumes' cloud: wakes.gd add_patch)
func _patch(i: int, kind: String, at: Vector2, rad: float, dur: float, dps: float, el: String) -> void:
	if hero.wakes != null and is_instance_valid(hero.wakes):
		hero.wakes.add_patch(i, kind, at, rad, dur, dps, el, hero.loadout.r(i)["meld"])


## How strongly move `i` carries meld `id` (game.ts meld8): 1 in front, MELD8_TUNE.behind behind, 0 not at all.
func k8(i: int, id: String) -> float:
	if i < 0 or i > 2:
		return 0.0
	var r: Dictionary = hero.loadout.r(i)
	if r["meld"] == id:
		return 1.0
	return float(E()["behind"]) if r["meld_behind"] == id else 0.0


## A telling of move `r`'s, marked with the melded word in front where it has one (the game's `...(r.meld ? { meld } : {})`).
static func tag(r: Dictionary, e: Dictionary) -> Dictionary:
	if r.get("meld") != null:
		e["meld"] = r["meld"]
	return e


## FERVOR's fire harm now, % (game.ts fervorPct): a fire hit's.
func fervor_pct(el: String) -> float:
	if el != "fire" or fervor_t <= 0.0:
		return 0.0
	return fervor_n * float(E()["fervor"]["burn"]) * 100.0


## A step of Implode's bursts and Fervor's time (game.ts updateMelds8).
func step(dt: float) -> void:
	if fervor_t > 0.0:
		fervor_t = maxf(0.0, fervor_t - dt)
	if implosions.is_empty():
		return
	for b in implosions:
		b["t"] -= dt
		if b["t"] > 0.0:
			continue
		_tell({"t": "burst", "x": b["x"], "y": b["y"], "r": b["r"], "el": b["el"], "style": "shock", "meld": "implode"})
		for o in _list().duplicate():
			if is_instance_valid(o) and not o.dead and o.world.distance_to(Vector2(b["x"], b["y"])) < float(b["r"]):
				o.damage(b["dmg"], b["el"], false, false, [], false, false, int(b["i"]))
	implosions = implosions.filter(func(b): return b["t"] > 0.0)


## Frozen where it stands, as a second chilling hit freezes it (game.ts freezeMonster): never a boss.
func freeze(m) -> void:
	if m.dead or m.boss:
		return
	m.frozen_t = maxf(m.frozen_t, 0.6 if m.elite else 1.1)
	m.freeze_immune = 4.0
	m.chill = maxf(m.chill if m.chill_t > 0.0 else 0.0, 0.3)
	m.chill_t = 2.5
	if m.state == "charge":
		m._end_charge()
	_tell({"t": "freeze", "x": m.world.x, "y": m.world.y})


## (game.ts slide, as a monster is moved by the words: the step along x where its body fits, then along y; a bat by the open
## ground; `steps` steps)
func _slide(m, by: Vector2, steps: int) -> void:
	if hero.monsters == null:
		return
	var rr := minf(m.r, 0.42)
	var fly: bool = m.kind == "bat"
	for k in steps:
		var s: Vector2 = by / float(steps)
		if hero.monsters.clear(m.world.x + s.x, m.world.y, rr, fly):
			m.world.x += s.x
		if hero.monsters.clear(m.world.x, m.world.y + s.y, rr, fly):
			m.world.y += s.y


# --- a hit (game.ts hitMonster) ---

## AVALANCHE behind: a hit on one chilled, harder (before it is rounded).
func avalanche(m, r: Dictionary, dmg: float, quiet: bool) -> float:
	if r["meld_behind"] == "avalanche" and m.chill_t > 0.0:
		dmg *= 1.0 + float(T()["avalanche"]["chilled"])
		if not quiet:
			_tell({"t": "meldFx", "what": "crush", "id": m.id, "x": m.world.x, "y": m.world.y, "x1": m.world.x, "y1": m.world.y})
	return dmg


## THUNDER in front: one big bolt out of the sky on the one it hits, in place of the arcs.
func thunder_bolt(r: Dictionary, at: Vector2, quiet: bool) -> void:
	if r["meld"] == "thunder" and not quiet:
		_tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": at.x, "y1": at.y, "sky": true, "meld": "thunder"})
		_sfx("thunder", 0.6)


## BLIGHT in front: how much harder its poison bites on `m` as its life has run out (1: none).
static func blight_k(r: Dictionary, m) -> float:
	if r["meld"] != "blight" or m.dead:
		return 1.0
	return 1.0 + (float(T()["blight"]["most"]) - 1.0) * (1.0 - maxf(0.0, m.life) / m.max_life)


## THE EIGHT, after a hit lands (game.ts meld8Struck): SHIVER, a critical hit freezes; SUNDER, one it stunned takes more; CAUTERIZE
## and FERVOR, a kill.
func struck8(m, i: int, crit: bool, was_burning: bool) -> void:
	var M8 := E()
	var shiver := k8(i, "shiver")
	if crit and shiver > 0.0 and not m.dead and not m.boss:
		m.frozen_t = maxf(m.frozen_t, float(M8["shiver"]["secs"]) * shiver * (0.5 if m.elite else 1.0))
		_tell({"t": "meld8", "id": "shiver", "on": m.id, "k": shiver})
	var sunder := k8(i, "sunder")
	if sunder > 0.0 and not m.dead:
		m.sunder = float(M8["sunder"]["more"]) * sunder
		# (stunned by it: its crack, while the stun lasts; a blow on it then is its look's "hit": monster.gd)
		if m.stun_t > 0.0 and m.sunder_t <= 0.0:
			m.sunder_t = m.stun_t
			_tell({"t": "meld8", "id": "sunder", "on": m.id, "secs": m.stun_t, "k": sunder})
	if not m.dead:
		return
	var caut := k8(i, "cauterize")
	if caut > 0.0 and was_burning:
		hero.heal_flat(hero.max_life * float(M8["cauterize"]["heal"]) * caut)
		_tell({"t": "meld8", "id": "cauterize", "x": m.world.x, "y": m.world.y, "k": caut})
	var ferv := k8(i, "fervor")
	if ferv > 0.0:
		fervor_n = minf(float(M8["fervor"]["most"]), (fervor_n if fervor_t > 0.0 else 0.0) + ferv)
		fervor_t = float(M8["fervor"]["secs"])
		_tell({"t": "meld8", "id": "fervor", "x": m.world.x, "y": m.world.y, "n": ceili(fervor_n), "most": M8["fervor"]["most"], "secs": M8["fervor"]["secs"], "k": ferv})


## THE TWIST OF A MELDED WORD ON ONE HIT of move `i`, which did `dmg` to `m` at `at` (game.ts meldHit): in front, what the hit does;
## behind, its heat and its thunderclaps. `was_burning`, `was_chilled`: how it was before the hit.
func hit(m, i: int, dmg: float, at: Vector2, quiet: bool, was_burning: bool, was_chilled: bool) -> void:
	var r: Dictionary = hero.loadout.r(i)
	var TT := T()
	var M8 := E()
	var mf = r["meld"]
	# (THE EIGHT: FORKING's arc, IMPLODE's burst to come)
	if not quiet:
		var fork := k8(i, "forking")
		if fork > 0.0:
			var near = null
			var best: float = M8["forking"]["reach"]
			for o in _list():
				if not is_instance_valid(o) or o == m or o.dead:
					continue
				var dd: float = o.world.distance_to(m.world)
				if dd < best:
					best = dd
					near = o
			if near != null:
				_tell({"t": "arc", "x0": m.world.x, "y0": m.world.y, "x1": near.world.x, "y1": near.world.y, "meld": "forking"})
				_tell({"t": "meld8", "id": "forking", "x": m.world.x, "y": m.world.y, "x1": near.world.x, "y1": near.world.y, "k": fork})
				near.damage(dmg * float(M8["forking"]["share"]) * fork, r["element"], false, false, [], false, false, i)
		var imp := k8(i, "implode")
		if imp > 0.0:
			var I: Dictionary = M8["implode"]
			var br: float = float(I["r"]) * (0.7 if imp < 1.0 else 1.0)
			# (those within its reach drawn toward where it landed, not through walls; no boss)
			for o in _list():
				if not is_instance_valid(o) or o.dead or o.boss or _shut(o):
					continue
				var d0: float = at.distance_to(o.world)
				if d0 > float(I["reach"]) or d0 < 0.05:
					continue
				var go := minf(float(I["pull"]) * imp, maxf(0.0, d0 - o.r))
				_slide(o, (at - o.world) / d0 * go, 6)
			implosions.append({"x": at.x, "y": at.y, "t": float(I["wait"]), "dmg": dmg * float(I["share"]) * imp, "r": br, "i": i, "el": r["element"]})
			_tell({"t": "meld8", "id": "implode", "x": at.x, "y": at.y, "reach": I["reach"], "r": br, "wait": I["wait"], "k": imp})
	if mf == "eruption" and not quiet:
		# (the blast leaves a pool of molten ground)
		var Er: Dictionary = TT["eruption"]
		_patch(i, "burn", at, float(Er["pool"]), float(Er["poolDur"]), dmg * float(Er["poolDps"]), "fire")
	elif mf == "avalanche" and not m.dead and not m.boss:
		# (shoved back from him; one stopped short by a wall or another is frozen where it stands)
		var way: Vector2 = m.world - hero.world
		way = way / way.length() if way.length() > 0.0 else Vector2(1, 0)
		var x0: Vector2 = m.world
		var shove: float = TT["avalanche"]["shove"]
		_slide(m, way * shove, 6)
		var went: float = m.world.distance_to(x0)
		var crowded := false
		for o in _list():
			if is_instance_valid(o) and o != m and not o.dead and o.world.distance_to(m.world) < o.r + m.r:
				crowded = true
		if went < shove * 0.8 or crowded:
			m.chill_t = maxf(m.chill_t, 0.01)
			m.chill_by(maxf(m.chill, 0.3))
		if not quiet:
			var e := {"t": "meldFx", "what": "shove", "id": m.id, "x": x0.x, "y": x0.y, "x1": m.world.x, "y1": m.world.y}
			if m.frozen_t > 0.0:
				e["frozen"] = true
			_tell(e)
	elif mf == "scald" and not m.dead and m.scald_cd <= 0.0 and ((was_burning and r["chill"] > 0.0) or (was_chilled and r["ignite"] > 0.0)):
		# (fire meets ice in it: it cracks)
		m.scald_cd = float(TT["scald"]["again"])
		_tell({"t": "burst", "x": at.x, "y": at.y, "r": 0.9, "el": "frost", "style": "blast", "meld": "scald"})
		_sfx("shatter", 0.7)
		m.damage(maxf(1.0, roundf(dmg * float(TT["scald"]["crack"]))), r["element"], false, false, [], false, false, i)
	elif mf == "fumes" and not m.dead and m.fumes_cd <= 0.0 and m.burn_t > 0.0 and m.poison_t > 0.0:
		# (burning and poisoned, it gives off a toxic cloud)
		var F: Dictionary = TT["fumes"]
		m.fumes_cd = float(F["again"])
		_patch(i, "venom", at, float(F["cloud"]), float(F["dur"]), m.poison_dps, "phys")
	elif mf == "frostbite" and not m.dead and (m.chill_t > 0.0 or m.frozen_t > 0.0):
		m.bite_dps = maxf(m.bite_dps, dmg * float(TT["frostbite"]["bite"]))
	if quiet:
		return
	var mb = r["meld_behind"]
	if mb == "eruption":
		# (heat builds a hit at a time; at full heat, the next hit erupts round what it strikes)
		var Er: Dictionary = TT["eruption"]
		if heat[i] >= int(Er["heat"]):
			heat[i] = 0
			var blast := maxf(1.0, roundf(dmg * float(Er["blast"])))
			_tell({"t": "burst", "x": at.x, "y": at.y, "r": Er["blastR"], "el": "fire", "style": "blast", "meld": "eruption"})
			_tell({"t": "shake", "amount": 3})
			hero.kick(3.0)
			_sfx("explode", 0.8)
			for o in _list().duplicate():
				if is_instance_valid(o) and not o.dead and o.world.distance_to(at) <= float(Er["blastR"]) + o.r:
					o.damage(blast, "fire", false, false, [], false, false, i)
		else:
			heat[i] += 1
			if heat[i] >= int(Er["heat"]):
				_tell({"t": "text", "x": hero.world.x, "y": hero.world.y, "text": "HEAT", "color": Words.data()["melds"]["heat"]})
	elif mb == "thunder":
		# (every few hits, a thunderclap round him)
		var Th: Dictionary = TT["thunder"]
		hits[i] += 1
		if hits[i] >= int(Th["every"]):
			hits[i] = 0
			var clap := maxf(1.0, roundf(dmg * float(Th["clap"])))
			_tell({"t": "burst", "x": hero.world.x, "y": hero.world.y, "r": Th["clapR"], "el": "lightning", "style": "blast", "meld": "thunder"})
			_tell({"t": "shake", "amount": 3})
			hero.kick(3.0)
			_sfx("thunder", 0.8)
			for o in _list().duplicate():
				if is_instance_valid(o) and not o.dead and o.world.distance_to(hero.world) <= float(Th["clapR"]) + o.r:
					o.damage(clap, "lightning", false, false, [], false, false, i)
	elif mb == "blight" and not m.dead:
		m.blight_t = float(TT["blight"]["secs"])


## WHAT AN ARC CARRIES (game.ts meldArc): of move `i`'s hit on `from`, to `o`, struck for `arc`; `struck`, all its arcs strike at
## once. By the melded word in front.
func arc(o, from, i: int, arc_dmg: float, struck: Array) -> void:
	if not is_instance_valid(o) or o.dead:
		return
	var r: Dictionary = hero.loadout.r(i)
	if r["meld"] == "wildfire":
		# (burning jumps along the arc)
		o.set_alight(arc_dmg * maxf(r["ignite"], 0.3) / 3.0, 3.0)
	elif r["meld"] == "contagion":
		o.dose(arc_dmg * maxf(r["poison"], 0.2), -1.0, "lightning")
		o.last_skill = i
	elif r["meld"] == "hailstorm":
		# (the arc chills; a frozen one passes it on)
		o.chill_by(maxf(r["chill"], 0.3))
		if o.frozen_t > 0.0:
			var next: Array = []
			for n in _list():
				if is_instance_valid(n) and not n.dead and n != o and n != from and not struck.has(n) and n.world.distance_to(o.world) <= 3.5:
					next.append(n)
			next.sort_custom(func(a, b) -> bool: return a.world.distance_to(o.world) < b.world.distance_to(o.world))
			if next.size() > int(T()["hailstorm"]["passOn"]):
				next.resize(int(T()["hailstorm"]["passOn"]))
			for n in next:
				_tell({"t": "arc", "x0": o.world.x, "y0": o.world.y, "x1": n.world.x, "y1": n.world.y, "meld": "hailstorm"})
				n.damage(arc_dmg, "lightning", false, false, [], false, false, i)
				n.chill_by(maxf(r["chill"], 0.3))


# --- a kill (game.ts kill, explodeKill, chainArcs, shatterKill, ruptureKill) ---

## VOLATILE in front (game.ts explodeKill): what move `i` killed explodes a moment after, for its share of the dead one's life
## (`share` of it: Demolition's half-life burst), harming what is round it. VOLATILE'S MELDS: Demolition's bigger; Powderkeg's
## harder for a burning one, and setting what it strikes burning; Chain Reaction's arcing on to the nearest.
func explode(m, r: Dictionary, i: int, share := 1.0) -> void:
	var TT := T()
	var at: Vector2 = m.world
	var rad := 1.8
	var boom: float = float(m.max_life) * float(r["volatile"]) * share
	if r["meld"] == "demolition":
		rad *= float(TT["demolition"]["bigger"])
		boom *= float(TT["demolition"]["bigger"])
	var keg: bool = r["meld"] == "powderkeg"
	if keg and m.burn_t > 0.0:
		boom *= float(TT["powderkeg"]["burning"])
	var hurt := maxf(1.0, roundf(boom))
	var el: String = r["element"]
	var meld = r["meld"] if r["meld"] != null and Words.data()["melds"]["volt"].has(r["meld"]) else null
	var chain: bool = r["meld"] == "chainreaction"
	hero._after(0.12, func() -> void:
		var e := {"t": "burst", "x": at.x, "y": at.y, "r": rad, "el": el, "style": "blast", "words": ["volatile"]}
		if meld != null:
			e["meld"] = meld
		_tell(e)
		_sfx("explode", 0.6)
		var struck: Array = []
		for o in _list().duplicate():
			if is_instance_valid(o) and not o.dead and o != m and o.world.distance_to(at) <= rad + o.r:
				o.damage(hurt, el, false, false, [], false, false, i)
				struck.append(o)
		if keg:
			for o in struck:
				if o.dead:
					continue
				# (a burning piece of the keg thrown onto it)
				_tell({"t": "volFx", "meld": "powderkeg", "what": "catch", "id": o.id, "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y})
				o.burn_dps = maxf(o.burn_dps if o.burn_t > 0.0 else 0.0, hurt * float(TT["powderkeg"]["burn"]))
				o.burn_t = maxf(o.burn_t, float(TT["powderkeg"]["burnSecs"]))
				if i >= 0:
					o.last_skill = i
		if chain:
			_chain_arcs(at, hurt * float(TT["chainreaction"]["share"]), i))


## CHAIN REACTION in front (game.ts chainArcs): an explosion at `at` arcs to the nearest; what they kill explodes in its turn.
func _chain_arcs(at: Vector2, dmg: float, i: int) -> void:
	var C: Dictionary = T()["chainreaction"]
	var near: Array = []
	for o in _list():
		if is_instance_valid(o) and not o.dead and not _shut(o) and o.world.distance_to(at) <= float(C["reach"]):
			near.append(o)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(at) < b.world.distance_to(at))
	if near.size() > int(C["arcs"]):
		near.resize(int(C["arcs"]))
	for o in near:
		_tell({"t": "volFx", "meld": "chainreaction", "what": "arc", "id": o.id, "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y})
		o.damage(maxf(1.0, roundf(dmg)), "lightning", false, false, [], false, false, i)
	if not near.is_empty():
		_sfx("zap", 0.6)


## A kill by move `i` (game.ts kill): SHATTER in front, a frozen one bursts into shards; RUPTURE, a poisoned one bursts its poison
## over those round it.
func killed(m, r: Dictionary, i: int) -> void:
	if r["meld"] == "shatter" and m.frozen_t > 0.0:
		var S: Dictionary = T()["shatter"]
		var dmg := maxf(1.0, roundf(float(m.max_life) * float(S["share"])))
		var at: Vector2 = m.world
		hero._after(0.12, func() -> void:
			for o in _list().duplicate():
				if not is_instance_valid(o) or o.dead or o == m or _shut(o) or o.world.distance_to(at) > float(S["reach"]) + o.r:
					continue
				_tell({"t": "volFx", "meld": "shatter", "what": "shard", "id": o.id, "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y})
				o.damage(dmg, "frost", false, false, [], false, false, i)
				if not o.dead:
					o.chill_by(0.3))
	if r["meld"] == "rupture" and m.poison_t > 0.0 and m.poison_dps > 0.0:
		var R: Dictionary = T()["rupture"]
		var dps: float = m.poison_dps * float(R["share"])
		var at: Vector2 = m.world
		hero._after(0.12, func() -> void:
			for o in _list().duplicate():
				if not is_instance_valid(o) or o.dead or o == m or _shut(o) or o.world.distance_to(at) > float(R["reach"]) + o.r:
					continue
				_tell({"t": "volFx", "meld": "rupture", "what": "splash", "id": o.id, "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y})
				o.dose(dps)
				o.last_skill = i)


## DEMOLITION in front (game.ts damageMonster): an elite or a boss struck by it down to half its life bursts, once.
func half_life(m, skill: int) -> void:
	if skill < 0 or skill > 2 or not (m.elite or m.boss) or m.demolished or m.life <= 0.0 or m.life > m.max_life * 0.5:
		return
	var rr: Dictionary = hero.loadout.r(skill)
	if rr["meld"] != "demolition" or rr["volatile"] <= 0.0:
		return
	m.demolished = true
	_tell({"t": "volFx", "meld": "demolition", "what": "half", "id": m.id, "x": m.world.x, "y": m.world.y, "r": 1.8 * float(T()["demolition"]["bigger"])})
	explode(m, rr, skill, float(T()["demolition"]["half"]))


# --- on him (game.ts hurtHero, updateDots) ---

## RIME WARD: a blow he has blocked chills its maker (the strongest of his moves' Rime Wards). As the game has it, its time only.
func blocked(src) -> void:
	if src == null or not is_instance_valid(src) or src.dead:
		return
	var k := 0.0
	for j in 3:
		k = maxf(k, k8(j, "rimeward"))
	if k > 0.0:
		var secs: float = float(E()["rimeward"]["secs"]) * k
		src.chill_t = maxf(src.chill_t, secs)
		_tell({"t": "meld8", "id": "rimeward", "on": src.id, "secs": secs, "k": k})


## SIPHON: a bite of poison `tick` on `m`, of an attack that carries it, heals him.
func siphon(m, tick: float) -> void:
	if m.last_skill < 0:
		return
	var k := k8(m.last_skill, "siphon")
	if k > 0.0:
		hero.heal_flat(tick * float(E()["siphon"]["heal"]) * k)
		_tell({"t": "meld8", "id": "siphon", "on": m.id, "k": k})


## Everything the melded words had begun, gone (a check beginning afresh).
func forget() -> void:
	heat = [0, 0, 0]
	hits = [0, 0, 0]
	implosions = []
	fervor_n = 0.0
	fervor_t = 0.0
