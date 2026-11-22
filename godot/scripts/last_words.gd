## THE HIGH CITY'S SEVEN LAST WORDS IN HIS MOVES (game.ts pierceOn, throwLance, bleedMonster, addThorns, cullMonster, addReaper,
## lastWordsCast, dodgeSurge, lastWordsKill, raiseSpirit, updateSpirits; their zones in updateZones; defs.ts PIERCE to MIRRORING;
## words.gd gives each move its numbers). His words, 8 Nov 2026: “I want 6 more words for the last levels”, “Add mirroring as
## well”; found only from floor 16 down.
##   PIERCING in front: a blow that has struck the first goes on through it, 3 tiles, striking every enemy in that line. Behind: a
##     moment after (0.5 s), a lance of light strikes down the line from him to where it ended (no oftener than 0.4 s a move).
##   BLEEDING in front: what it hits bleeds, more while it walks (monster.gd). Behind: thorns where it ends, cutting whatever walks
##     in them each half second, and making it bleed.
##   REAPING in front: a kill leaves a soul that takes time off every wait. Behind: a kill rises as a spirit fighting for him 6 s.
##   CULLING in front: one its hit leaves nearly dead dies outright (an elite under half that, a boss never). Behind: a reaper's
##     mark that takes the first weak enemy to cross it.
##   SURGING in front: every third use, a shockwave round him. Behind (of any of his moves): his dodge releases a surge.
##   PLUNDERING in front: a kill drops more gold, and now and then an extra piece. Behind: a kill's gold bursts into his purse.
##   MIRRORING in front: his reflection beside him makes the same attack, weaker. Behind: a mirror where he stood makes his next
##     attack again, and is spent.
## On a monster (monster.gd, hero.gd hurt_by): Piercing's shots go through walls; Bleeding makes him bleed; Reaping rises once;
## Culling hits harder while he is low; Surging sends out a shockwave every few seconds; Plundering steals gold, dropped as it dies;
## Mirroring sends back part of the harm he does it.
extends RefCounted

const Words := preload("res://scripts/words.gd")

## (game/word_sounds.ts WORD_SOUND: how loud each is, and no oftener than)
const SOUND := {"pierce_shot": [0.8, 0.12], "pierce_lance": [0.9, 0.3], "bleed_open": [0.7, 0.15], "bleed_thorns": [0.8, 0.25],
	"bleed_cut": [0.55, 0.34], "reap_soul": [0.7, 0.5], "reap_spirit": [0.8, 0.4], "reap_rake": [0.6, 0.12], "reap_rise": [0.9, 0.3],
	"cull_kill": [0.9, 0.2], "cull_mark": [0.9, 0.2], "cull_kindle": [0.8, 3.0], "surge_wave": [0.9, 0.2], "surge_warn": [0.8, 0.3],
	"surge_foe": [0.9, 0.2], "plunder_spray": [0.7, 0.25], "plunder_stream": [0.7, 0.5], "plunder_steal": [0.9, 0.3],
	"mirror_swing": [0.7, 0.15], "mirror_rise": [0.8, 0.2], "mirror_break": [0.9, 0.2], "mirror_back": [0.9, 0.3]}
## (WORD_SOUND_SOFT; WORD_AT: the pane's break after it makes his attack again)
const SOFT := {"reflection": 0.7, "spiritAway": 0.5}
const MIRROR_BREAK := 0.38

var hero
var _clock := 0.0
var _heard := {}
## (when each move last threw a lance, laid thorns, laid a reaper's mark)
var _lance_at: Array = [-9.0, -9.0, -9.0]
var _thorn_at: Array = [-9.0, -9.0, -9.0]
var _reaper_at: Array = [-9.0, -9.0, -9.0]
## THEIR ZONES ({kind: "thorns" | "reaper" | "mirror", x, y, r, t, dur, dmg, tick, skill}) and the spirits fighting for him ({id, x,
## y, t, life, next, skill, share}); the lances on their way ({x0, y0, dx, dy, len, at, skill, share, id})
var zones: Array = []
var spirits: Array = []
var _lances: Array = []
var _next_id := 1
## (CULLING on a monster: its fire kindling as he comes low, heard once each time)
var _kindled := false


func _init(h) -> void:
	hero = h


static func L() -> Dictionary:
	return Words.data().get("last", {})


func _list() -> Array:
	return hero.monsters.list if hero.monsters != null else []


func _shut(o) -> bool:
	return hero.monsters.shut_in(o)


## A word's recorded sound (game.ts wordRec), as loud as the game plays it, no oftener than its gap.
func rec(name: String, soft := 1.0) -> void:
	var S: Array = SOUND.get(name, [0.8, 0.2])
	if _clock - float(_heard.get(name, -99.0)) < float(S[1]):
		return
	_heard[name] = _clock
	hero.sfx.play(name, linear_to_db(float(S[0]) * soft))


func fresh_place() -> void:
	zones = []
	spirits = []
	_lances = []


func _open(at: Vector2) -> bool:
	return hero.map != null and hero.map.open_at(floori(at.x), floori(at.y)) and not hero.map.in_wall(at.x, at.y)


# --- in front ---

## PIERCING in front: a blow of move `i` that has struck `first` at `at` goes on through it along `way`, striking every enemy in
## a line PIERCE.line tiles on, for `frac`.
func pierce_on(i: int, first, at: Vector2, way: Vector2, frac: float) -> void:
	var line: float = L()["pierce"]["line"]
	hero._tell({"t": "pierceLine", "x0": at.x, "y0": at.y, "x1": at.x + way.x * line, "y1": at.y + way.y * line})
	rec("pierce_shot")
	for o in _list().duplicate():
		if not is_instance_valid(o) or o.dead or o == first or _shut(o):
			continue
		var p: Vector2 = o.world - at
		var along := p.dot(way)
		if along < 0.0 or along > line + o.r:
			continue
		if absf(p.y * way.x - p.x * way.y) <= 0.45 + o.r:
			hero.hit_monster(o, i, frac, true)


## BLEEDING: `m` bleeds for `secs`, `dps` a second (the stronger of this and what it bled already), more while it walks.
func bleed_monster(m, dps: float, secs: float) -> void:
	if m.dead:
		return
	var fresh: bool = m.bleed_t < 0.5
	m.bleed_dps = maxf(m.bleed_dps if m.bleed_t > 0.0 else 0.0, dps)
	m.bleed_t = secs
	m.bleed_move = float(L()["bleed"]["moving"])
	if fresh:
		hero._tell({"t": "bleedOn", "id": m.id, "m": m, "x": m.world.x, "y": m.world.y, "secs": secs})
		rec("bleed_open")


## CULLING: `m` dies outright if it is under `under` of its life (an elite under CULL.elite of that; a boss never), struck down by
## move `i`; whether it was. `mark`: by a reaper's mark.
func cull_monster(m, under: float, i: int, mark := false) -> bool:
	if not is_instance_valid(m) or m.dead or m.boss or m.life <= 0.0 or _shut(m):
		return false
	var C: Dictionary = L()["cull"]
	if m.life > m.max_life * under * (float(C["elite"]) if m.elite or m.champion else 1.0):
		return false
	var e := {"t": "culled", "id": m.id, "m": m, "x": m.world.x, "y": m.world.y}
	if mark:
		e["mark"] = true
	# (ONE OF THE HUSHED IS NOT CUT IN TWO: the Hush leaves them and they lie alive, people again; his rule, never gory)
	if bool(C.get("hushedWhole", true)) and L()["hushLeaves"].has(m.kind):
		e["whole"] = true
	hero._tell(e)
	rec("cull_mark" if mark else "cull_kill")
	m.damage(maxf(1.0, ceilf(m.life + m.shield)), "phys", false, false, [], false, false, i)
	return true


## (game.ts hitMonster) What move `i`'s last words in front do to `m`, struck for `dmg` and still alive: Bleeding, Culling.
func struck(m, i: int, dmg: float) -> void:
	var r: Dictionary = hero.loadout.r(i)
	if float(r["bleed"]) > 0.0:
		bleed_monster(m, dmg * float(r["bleed"]) * float(r["pace"]), float(L()["bleed"]["secs"]) * float(r["last"]))
	if float(r["cull"]) > 0.0:
		cull_monster(m, float(r["cull"]), i)


# --- behind: what a move leaves where it ends (game.ts leavePatches) ---

## PIERCING behind: a lance of light down the line from where he stands to where move `i` ended (on along his facing, PIERCE.line
## tiles at the least), landing PIERCE.lanceDelay later on every enemy in it; one a move each lanceEvery seconds.
func throw_lance(i: int, at: Vector2, frac: float) -> void:
	var P: Dictionary = L()["pierce"]
	if _clock - float(_lance_at[i]) < float(P["lanceEvery"]):
		return
	_lance_at[i] = _clock
	var from: Vector2 = hero.world
	var len := from.distance_to(at)
	var way: Vector2 = (at - from) / len if len > 0.3 else hero.face
	var long := maxf(len, float(P["line"]))
	var share := frac * float(hero.loadout.r(i)["lance"])
	# (its look from a step in front of him; what it strikes, the whole line from where he stands)
	var lead := minf(float(P["lanceLead"]), long - 0.5)
	hero._tell({"t": "lance", "x0": from.x + way.x * lead, "y0": from.y + way.y * lead, "x1": from.x + way.x * long, "y1": from.y + way.y * long, "w": P["lanceW"], "delay": P["lanceDelay"]})
	rec("pierce_lance")
	_lances.append({"from": from, "way": way, "len": long, "at": _clock + float(P["lanceDelay"]), "skill": i, "share": share, "id": hero.loadout.r(i)["id"]})


func _lance_lands(q: Dictionary) -> void:
	var i: int = q["skill"]
	if str(hero.loadout.r(i)["id"]) != str(q["id"]):
		return
	var w: float = L()["pierce"]["lanceW"]
	for m in _list().duplicate():
		if not is_instance_valid(m) or m.dead or _shut(m):
			continue
		var p: Vector2 = m.world - q["from"]
		var along := p.dot(q["way"])
		if along < -0.3 or along > float(q["len"]) + m.r:
			continue
		var way: Vector2 = q["way"]
		if absf(p.y * way.x - p.x * way.y) <= w + m.r:
			hero.hit_monster(m, i, q["share"], true)


## BLEEDING behind: thorns at `at`, cutting whatever walks in them; one a move each BLEED.thornEvery seconds.
func add_thorns(i: int, at: Vector2, rad: float, frac: float) -> void:
	var B: Dictionary = L()["bleed"]
	if _clock - float(_thorn_at[i]) < float(B["thornEvery"]):
		return
	_thorn_at[i] = _clock
	if not _open(at):
		return
	var r: Dictionary = hero.loadout.r(i)
	var dmg: float = hero.avg_hit(i, frac) * float(r["thorns"]) * float(r["pace"])
	var dur: float = float(B["thornLife"]) * float(r["last"])
	zones.append({"kind": "thorns", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "dmg": dmg, "tick": 0.0, "skill": i})
	hero._tell({"t": "zone", "kind": "thorns", "x": at.x, "y": at.y, "r": rad, "el": "phys", "dur": dur})
	rec("bleed_thorns")


## CULLING behind: a reaper's mark at `at` for the first weak enemy to cross it; one a move each CULL.markEvery seconds.
func add_reaper(i: int, at: Vector2, under: float) -> void:
	var C: Dictionary = L()["cull"]
	if _clock - float(_reaper_at[i]) < float(C["markEvery"]):
		return
	_reaper_at[i] = _clock
	if not _open(at):
		return
	var dur: float = float(C["markLife"]) * float(hero.loadout.r(i)["last"])
	zones.append({"kind": "reaper", "x": at.x, "y": at.y, "r": C["markR"], "t": 0.0, "dur": dur, "dmg": under, "tick": 0.0, "skill": i})
	hero._tell({"t": "zone", "kind": "reaper", "x": at.x, "y": at.y, "r": C["markR"], "el": "phys", "dur": dur})


## What move `i` leaves of the last words where it ends (game.ts leavePatches): the lance, the thorns, the reaper's mark.
func leaves(i: int, at: Vector2, rad: float, frac: float) -> void:
	var r: Dictionary = hero.loadout.r(i)
	if float(r["lance"]) > 0.0:
		throw_lance(i, at, frac)
	if float(r["thorns"]) > 0.0:
		add_thorns(i, at, maxf(float(L()["bleed"]["thornR"]), rad), frac)
	if float(r["cull_mark"]) > 0.0:
		add_reaper(i, at, r["cull_mark"])


# --- a use, a dodge, a kill ---

## (game.ts mirrorSide) Which way his reflection stands from him: square to the way he faces, on the side of him the more ahead of
## him on the screen.
static func mirror_side(f: Vector2) -> Vector2:
	var l := maxf(f.length(), 1e-9)
	var u := f / l
	var sfx := (u.x - u.y) * 16.0
	var sfy := (u.x + u.y) * 8.0
	var ahead := (-u.y - u.x) * 16.0 * sfx + (-u.y + u.x) * 8.0 * sfy
	var side := 1.0 if ahead >= 0.0 else -1.0
	return Vector2(-u.y * side, u.x * side)


## What the last words make of a use of move `i`, made from `from` the way `way` (game.ts lastWordsCast): SURGING in front, every
## third use a shockwave round him; MIRRORING in front, his reflection beside him makes the same attack; a mirror lying makes it
## again from where it stands, and is spent; MIRRORING behind leaves a mirror where he stands. `again(from, way, frac)` makes the
## attack.
func cast(i: int, from: Vector2, way: Vector2, frac: float, again: Callable) -> void:
	var r: Dictionary = hero.loadout.r(i)
	var S: Dictionary = L()["surge"]
	if float(r["surge"]) > 0.0 and hero.uses[i] > 0 and hero.uses[i] % int(S["every"]) == 0:
		hero._tell({"t": "surge", "x": hero.world.x, "y": hero.world.y, "r": S["radius"]})
		rec("surge_wave")
		hero._blast(i, hero.world, float(S["radius"]), frac * float(r["surge"]), "nova", false, -6.0)
	if float(r["mirror"]) > 0.0:
		var side := mirror_side(hero.face)
		var at: Vector2 = from + side * float(L()["mirroring"]["side"])
		if not _open(at):
			at = from
		hero._tell({"t": "reflection", "x": at.x, "y": at.y, "dx": way.x, "dy": way.y, "kind": "melee"})
		rec("mirror_rise", float(SOFT["reflection"]))
		rec("mirror_swing")
		again.call(at, way, frac * float(r["mirror"]))
	for k in range(zones.size() - 1, -1, -1):
		var z: Dictionary = zones[k]
		if z["kind"] != "mirror":
			continue
		zones.remove_at(k)
		var zat := Vector2(z["x"], z["y"])
		var to: Vector2 = from + way * 2.0 - zat
		var zw: Vector2 = to.normalized() if to.length() > 1e-6 else way
		hero._tell({"t": "mirrorCast", "x": zat.x, "y": zat.y, "dx": zw.x, "dy": zw.y, "kind": "melee"})
		rec("mirror_swing")
		hero._after(MIRROR_BREAK, func() -> void: rec("mirror_break"))
		again.call(zat, zw, frac * float(z["dmg"]))
	if float(r["mirror_leave"]) > 0.0 and _open(hero.world):
		var dur: float = float(L()["mirroring"]["leaveLife"]) * float(r["last"])
		zones.append({"kind": "mirror", "x": hero.world.x, "y": hero.world.y, "r": 0.5, "t": 0.0, "dur": dur, "dmg": r["mirror_leave"], "tick": 0.0, "skill": i})
		hero._tell({"t": "zone", "kind": "mirror", "x": hero.world.x, "y": hero.world.y, "r": 0.5, "el": "phys", "dur": dur})


## SURGING behind (of any of his moves): his dodge releases a surge at `at`, as strong as the strongest of them makes it.
func dodge_surge(at: Vector2) -> void:
	var best := -1
	var most := 0.0
	for k in 3:
		var s: float = hero.loadout.r(k)["dodge_surge"]
		var a: float = hero.avg_hit(k, s) if s > 0.0 else 0.0
		if a > most:
			most = a
			best = k
	if best < 0:
		return
	var S: Dictionary = L()["surge"]
	hero._tell({"t": "surge", "x": at.x, "y": at.y, "r": S["dodgeRadius"], "dodge": true})
	rec("surge_wave")
	hero._blast(best, at, float(S["dodgeRadius"]), float(hero.loadout.r(best)["dodge_surge"]), "nova", false, -6.0)


## (game.ts plunderGold) What the gold an enemy drops is worth, for Plundering: an ordinary one's, more for an elite, a guardian, a
## boss.
func _plunder_gold(m) -> float:
	var G: Array = L()["gold"]
	var power: int = hero.monsters.map.depth if hero.monsters != null and hero.monsters.map != null else 1
	var each := (float(G[0]) + float(G[1])) / 2.0 * maxf(1.0, power)
	return each * (8.0 if m.boss else (4.0 if m.champion else (2.5 if m.elite else 1.0)))


## What the last words of the move that killed `m` make of the kill (game.ts lastWordsKill): Reaping's soul and spirit, Plundering's
## gold.
func killed(m, i: int) -> void:
	if i < 0 or i > 2:
		return
	var r: Dictionary = hero.loadout.r(i)
	if float(r["reap"]) > 0.0:
		hero.cool_by(float(r["reap"]))
		hero._tell({"t": "reapSoul", "x": m.world.x, "y": m.world.y})
		rec("reap_soul")
	if float(r["spirit"]) > 0.0 and not m.boss:
		_raise_spirit(m, i, r["spirit"])
	if float(r["plunder"]) > 0.0 or float(r["plunder_burst"]) > 0.0:
		var base := _plunder_gold(m)
		var loot = hero.monsters.loot if hero.monsters != null else null
		var P: Dictionary = L()["plunder"]
		if float(r["plunder"]) > 0.0 and loot != null:
			loot._gold(m.world, maxi(1, roundi(base * float(r["plunder"]))))
			var item: bool = randf() < float(P["eliteItem"] if m.elite or m.champion or m.boss else P["item"])
			if item:
				loot._item(m.world, 1)
			hero._tell({"t": "goldSpray", "x": m.world.x, "y": m.world.y, "item": item})
			rec("plunder_spray")
		if float(r["plunder_burst"]) > 0.0 and loot != null:
			var n := maxi(1, roundi(base * float(r["plunder_burst"]) * (1.0 + float(hero.stats.get("gold_find", 0.0)) / 100.0)))
			loot.gold += n
			hero._tell({"t": "goldBurst", "x": m.world.x, "y": m.world.y, "n": n})
			hero._tell({"t": "text", "x": hero.world.x, "y": hero.world.y, "text": "+%d" % n, "color": "#ffe070"})
			rec("plunder_spray")
			rec("plunder_stream")


## REAPING behind: a spirit risen where `m` fell, fighting for him REAP.spiritSecs (the oldest gives way past REAP.spirits).
func _raise_spirit(m, i: int, share: float) -> void:
	var R: Dictionary = L()["reap"]
	if spirits.size() >= int(R["spirits"]):
		spirits.pop_front()
	var sp := {"id": _next_id, "x": m.world.x, "y": m.world.y, "t": 0.0, "life": R["spiritSecs"], "next": 0.3, "skill": i, "share": share}
	_next_id += 1
	spirits.append(sp)
	hero._tell({"t": "spirit", "id": sp["id"], "x": sp["x"], "y": sp["y"], "life": sp["life"]})
	rec("reap_spirit")


# --- each step ---

func step(dt: float) -> void:
	_clock += dt
	if hero.monsters == null:
		return
	for k in range(_lances.size() - 1, -1, -1):
		if _clock >= float(_lances[k]["at"]):
			var q: Dictionary = _lances[k]
			_lances.remove_at(k)
			_lance_lands(q)
	_step_zones(dt)
	_step_spirits(dt)
	# (CULLING on a monster: its fire kindles as he comes low with one of them awake and near: heard once each time)
	var low: bool = hero.life > 0.0 and hero.life < hero.max_life * float(L().get("cull", {"low": 0.35})["low"])
	var lit := false
	if low:
		for m in _list():
			if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.words.has("culling") and m.world.distance_to(hero.world) <= 10.0 and not _shut(m):
				lit = true
				break
	if lit and not _kindled:
		rec("cull_kindle")
	_kindled = lit


## Bleeding's thorns cut whatever is in them each half second, and make it bleed; Culling's reaper's mark takes the first weak enemy
## to cross it, and is spent; Mirroring's mirror waits for his next attack (`cast`).
func _step_zones(dt: float) -> void:
	for k in range(zones.size() - 1, -1, -1):
		var z: Dictionary = zones[k]
		z["t"] = float(z["t"]) + dt
		var at := Vector2(z["x"], z["y"])
		if z["kind"] == "thorns":
			z["tick"] = float(z["tick"]) - dt
			if float(z["tick"]) <= 0.0:
				z["tick"] = 0.5
				for o in _list().duplicate():
					if not is_instance_valid(o) or o.dead or o.kind == "bat" or _shut(o) or o.world.distance_to(at) > float(z["r"]) + o.r * 0.5:
						continue
					o.damage(hero.side(o, maxf(1.0, roundf(float(z["dmg"]) * 0.5)), int(z["skill"])), "phys", false, false, [], false, true, int(z["skill"]))
					bleed_monster(o, float(z["dmg"]) * 0.5, float(L()["bleed"]["secs"]))
					rec("bleed_cut")
		elif z["kind"] == "reaper":
			var took := false
			for o in _list().duplicate():
				if not is_instance_valid(o) or o.dead or o.state == "sleep" or o.world.distance_to(at) > float(z["r"]) + o.r * 0.5:
					continue
				if cull_monster(o, z["dmg"], int(z["skill"]), true):
					took = true
					break
			if took:
				zones.remove_at(k)
				continue
		if float(z["t"]) >= float(z["dur"]):
			zones.remove_at(k)


## The spirits: each goes for the nearest enemy and strikes it each REAP.spiritEvery seconds (what it kills is no one's, and raises
## none); with none near, it keeps by him.
func _step_spirits(dt: float) -> void:
	var R: Dictionary = L()["reap"]
	for k in range(spirits.size() - 1, -1, -1):
		var sp: Dictionary = spirits[k]
		sp["t"] = float(sp["t"]) + dt
		sp["next"] = float(sp["next"]) - dt
		if float(sp["t"]) >= float(sp["life"]):
			spirits.remove_at(k)
			rec("reap_spirit", float(SOFT["spiritAway"]))
			continue
		var at := Vector2(sp["x"], sp["y"])
		var best = null
		var bd := 8.0
		for o in _list():
			if not is_instance_valid(o) or o.dead or o.state == "sleep" or _shut(o):
				continue
			var d: float = o.world.distance_to(at)
			if d < bd:
				bd = d
				best = o
		var to: Vector2 = best.world if best != null else hero.world
		var d := at.distance_to(to)
		var stop: float = float(R["spiritReach"]) * 0.8 if best != null else 1.2
		if d > stop:
			at += (to - at) / d * minf(d - stop, float(R["spiritSpeed"]) * dt)
			sp["x"] = at.x
			sp["y"] = at.y
		if best != null and d <= float(R["spiritReach"]) + best.r and float(sp["next"]) <= 0.0:
			sp["next"] = R["spiritEvery"]
			hero._tell({"t": "spiritHit", "id": sp["id"], "x0": at.x, "y0": at.y, "x1": best.world.x, "y1": best.world.y})
			rec("reap_rake")
			best.damage(hero.side(best, maxf(1.0, roundf(hero.avg_hit(int(sp["skill"]), float(sp["share"])))), int(sp["skill"])), hero.loadout.r(int(sp["skill"]))["element"], false, false, [], false, false, -1)
