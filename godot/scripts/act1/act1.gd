## A KIND OF THE DESCENT'S OWN, run as the game runs it (game/act1_rules/types.ts Act1Rules; game/bosses.ts BossRules step,
## forcedAct, pickAct, startAct, stepAct, endAct, breakOff, blow, rel, peril; render/figure.ts gaitFrame): the common monsters
## of floors 6 to 8 that fight by rules of their own, each a script of its own beside this one, extending it:
##   qgolem.gd (the quarry golem), rubbling.gd, firepot.gd (the firepot thrower), chanter.gd, vulture.gd, crawler.gd (the cliff
##   crawler), devil.gd (the dust devil), scorpion.gd (the canyon scorpion).
## Each is handed its monster every frame it is awake (monster.gd BOSS_AI, `step`), and as it comes into the world (`begun`:
## the game's `spawned`) and as it falls (`died`).
##   ITS GAIT: it stands; it sets off after a hero further off than it likes (`stopAt` + `slack`), or out of its sight; it is
##     carried over the floor at its pace (straight at him within 2.5 tiles in its sight, else down the flow field), and
##     stops as its walk comes round to its first frame (every `cycle` of it), as near him as it likes to stand, or where an
##     act is ready and he is in its reach. Setting off and stopping are pictures of their own where it has them (`setOff`,
##     `halt`, seconds; 0: its walk loops from its stand). Chilled, it goes slower by the chill's share.
##   ITS ACTS, its basic blow first and its biggest last: the biggest that is ready and that the hero is in reach of (`near`
##     to `far`), in its sight; or one its rules bring (`forced`). It turns to him as one begins and no more; the act's clock
##     runs (chilled, its wind-up slower by two fifths of the chill, until its blow), its pictures by it; what it does at each
##     moment is its kind's (`acting`). Then it waits `after` (Swift: 30% less; a minion's 15%), the act its own `cooldown`.
##   ITS PICTURE when it makes no act: struck, it reels as its picture has it, from the blow; else its setting off, its walk
##     or its stopping by the gait's clock, or its stand.
## What it lays on the floor or sends over it is a mark of perils.gd's, kind "a1", named by the game's own name for it
## (`a1`: "qgolem:boulder"), stepped and drawn by marks.gd as the game's act1 rules and render/act1_fx have it.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const Chained := preload("res://scripts/chained.gd")
## (defs.ts TUNE.heroRadius; HEAVY.knock: tiles a heavy blow's step knocks him; TUNE.poisonTime)
const HERO_R := 0.3
const HEAVY_KNOCK := 0.6
const POISON_TIME := 4.0
## (sound_families.ts ATK: its attack's sound by its family, heard as each act begins, no oftener than every 0.25 s: game.ts
## atkSound, enemyRec)
const ATK := {"qgolem": "atkStone", "rubbling": "atkStone", "firepot": "atkFirepot", "chanter": "atkHex", "vulture": "atkVulture", "crawler": "atkSting", "scorpion": "atkSting",
	# (floor 9's boss; a boss's heard at 0.9; the Cantor has none)
	"stag": "atkAntler"}
## (chanter.ts CHANTER.ward: the cult's kinds a chanter shields, within `r` tiles of it, each taking `share` less harm)
const WARD := {"r": 4.5, "share": 0.4, "kinds": ["dagger", "cultist", "firepot", "minifm", "priest"]}

## (Monster.gait: how it goes, and how long it has gone so)
var mode := "stand"
var gt := 0.0
## (Monster.moveCd: each act's own wait)
var cds: Array = []
## The act it is making: {i, t, hand, x, y: where the hero stood as it began}; null: none (Monster.act).
var act = null
## What its kind keeps (Monster.a1), by name.
var a1 := {}
## (how long since a blow last landed on it: game.ts struckT)
var _struck := INF


# --- what each kind gives (Act1Rules) ---

## Its gait: {pace, cycle, setOff, halt, stopAt, slack, trueBack}.
func gait() -> Dictionary:
	return {}


## Its acts: {id, clip, long, hit, dmg, cooldown, first, after, near, far, forced}.
func acts() -> Array:
	return []


## A step of it every frame it is awake, before its gait and acts: true if this step is all it does.
func tick(_m, _dt: float, _dist: float, _hero) -> bool:
	return false


## An act its rules bring whatever else it would do: its index, or -1.
func forced(_m) -> int:
	return -1


## Whether it may make act `a` now, besides its wait and the hero's distance.
func can(_m, _a: Dictionary, _dist: float, _los: bool) -> bool:
	return true


## As an act begins, turned to the hero already.
func start(_m, _a: Dictionary, _hero) -> void:
	pass


## From `t0` to `t1` of act `a`: what it does.
func acting(_m, _a: Dictionary, _t0: float, _t1: float, _dt: float, _hero) -> void:
	pass


## As an act ends.
func end(_m, _a: Dictionary, _hero) -> void:
	pass


## As it comes into the world.
func spawned(_m) -> void:
	pass


## As it falls.
func died(_m) -> void:
	pass


## Whether the hero's blows reach it now.
func reachable(_m) -> bool:
	return true


## Up in the air, over what is on the ground: it neither jostles nor is jostled by what stands under it.
func aloft(_m) -> bool:
	return false


## How far up off the floor it is drawn now, game pixels (less than 0: let down under the floor's edge).
func lift(_m) -> float:
	return 0.0


## Its picture in place of the one its gait and acts give: {} as they give; {list, i}; {hide: true}, nothing.
func shown(_m) -> Dictionary:
	return {}


# --- the game's running of it (game/bosses.ts) ---

## As it comes into the world (monster.gd setup: the floor's monsters.json; the game's `spawned`).
func begun(m) -> void:
	spawned(m)


## A step of it, awake (monster.gd step hands it here; not while it is frozen, stunned or staggered).
func step(m, dt: float, hero) -> void:
	_struck = m.struck_t
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	# (its wait runs down every step, whatever it is doing: game.ts updateMonsters)
	m._cd -= dt
	# (put to sleep in the middle of an act, as the hero fell, or stopped in it, and woken again: it is broken off)
	if act != null and m.state != "act":
		act = null
		_to("stand")
	if tick(m, dt, dist, hero):
		_show(m)
		return
	var G := gait()
	var A := acts()
	if cds.size() != A.size():
		cds = []
		for a in A:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	for k in cds.size():
		cds[k] -= dt
	if act != null:
		_step_act(m, A, dt, hero)
		return
	m.state = "chase"
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	var f := forced(m)
	var want := f if f >= 0 else (_pick(m, A, dist, los) if m._cd <= 0.0 and hero.alive else -1)
	var moving := mode == "setOff" or mode == "walk" or mode == "halt"
	# (it sets off after a hero who is further off than it likes, or out of its sight)
	var go: bool = hero.alive and f < 0 and want < 0 and (dist > float(G["stopAt"]) + float(G["slack"]) or (not los and dist > 1.2))
	if not moving:
		gt += dt
		if dist > 0.01:
			m.face = to / dist
		if want >= 0:
			start_act(m, A, want, hero)
			return
		if go:
			_to("setOff")
		_show(m)
		return
	# CARRIED OVER THE FLOOR AT ITS PACE, from the first moment of setting off to the last of stopping
	var sp: float = m.speed * m.slow()
	var v := Vector2.ZERO
	if dist > 0.01:
		v = to / dist if dist < 2.5 and los else m.mgr.flow_dir(m.world)
	if mode != "halt" and v != Vector2.ZERO:
		m.face = v
	slide(m, m.face * sp * dt)
	var before := gt
	gt += dt * sp / float(G["pace"])
	# (it means to stop where its walk next comes round to its first frame: an act is ready and the hero in its reach, or
	# there is no way on; or, there, stopping would leave it as near him as it likes to stand)
	var stop := want >= 0 or f >= 0 or v == Vector2.ZERO
	var here: bool = stop or (los and dist - float(G["pace"]) * float(G["halt"]) <= float(G["stopAt"]))
	if mode == "setOff":
		if gt >= float(G["setOff"]):
			_to("halt" if here else "walk")
	elif mode == "walk":
		if here and floori(gt / float(G["cycle"])) > floori(before / float(G["cycle"])):
			_to("halt")
	elif gt >= float(G["halt"]):
		_to("stand")
	_show(m)


func _to(next: String) -> void:
	mode = next
	gt = 0.0


## pickAct: the biggest ready act it is in reach of, the hero in its sight; -1, none (it comes on, or waits).
func _pick(m, A: Array, dist: float, los: bool) -> int:
	for i in range(A.size() - 1, -1, -1):
		var a: Dictionary = A[i]
		if a.get("forced", false) or cds[i] > 0.0:
			continue
		if dist < float(a["near"]) or dist > float(a["far"]):
			continue
		if not can(m, a, dist, los) or not los:
			continue
		return i
	return -1


## startAct: turned to the hero, and from here on turned no more until it is over; its attack heard by its family.
func start_act(m, A: Array, i: int, hero) -> void:
	var a: Dictionary = A[i]
	var to: Vector2 = hero.world - m.world
	if to.length() > 0.01:
		m.face = to.normalized()
	m.state = "act"
	act = {"i": i, "t": 0.0, "hand": hand_of(gait()["trueBack"], m.face), "x": hero.world.x, "y": hero.world.y}
	m._set_list(a["clip"], true)
	var named: String = str(a["id"]).replace(":", "_")
	m.mgr.used[named] = m.mgr.used.get(named, 0) + 1
	if ATK.has(m.kind):
		m.mgr.voice(ATK[m.kind], 0.25, linear_to_db(0.9 if m.boss else 0.6))
	start(m, a, hero)


## stepAct: its clock runs (chilled, slower until its blow), its pictures by it, and what it does at each moment is done.
func _step_act(m, A: Array, dt: float, hero) -> void:
	var a: Dictionary = A[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(float(a["long"]), t0 + dt * ((0.6 + 0.4 * m.slow()) if t0 < float(a["hit"]) else 1.0))
	var t1: float = act["t"]
	m._anim_t = t1
	var was = act
	acting(m, a, t0, t1, dt, hero)
	# (the act itself may have ended it)
	if m.dead or act == null or not is_same(act, was):
		return
	if t1 >= float(a["long"]):
		_end(m, a, hero)


## endAct: it stands as its pictures leave it, and waits its moment (Swift: shorter).
func _end(m, a: Dictionary, hero) -> void:
	var swift: float = 1.0 - 0.3 * m.word_share("swift")
	var i: int = act["i"]
	m.state = "chase"
	act = null
	_to("stand")
	m._cd = float(a["after"]) * swift * randf_range(0.9, 1.15)
	if float(a["cooldown"]) > 0.0:
		cds[i] = float(a["cooldown"]) * swift
	m._set_list("idle", true)
	end(m, a, hero)


## render/figure.ts gaitFrame, for one making no act: struck, it reels as its picture has it, from the blow; else its setting
## off, its walk or its stopping by the gait's clock; else its stand.
func _show(m) -> void:
	if m.state == "act":
		return
	if m.art.has("reel") and _struck < m.art.length("reel"):
		m._set_list("reel")
		m._anim_t = _struck
		return
	var list := "idle"
	if mode == "walk":
		list = "walk"
	elif (mode == "setOff" or mode == "halt") and m.art.has(mode):
		list = mode
	m._set_list(list)
	m._anim_t = gt


# --- what they share (game/facing.ts, game/bosses.ts) ---

## handOf: 1 if its left in its picture is the world's left of the way it faces, -1 if its right is. `true_back`: its pictures
## from behind are painted as the camera truly sees it; the others' are painted turned over.
static func hand_of(true_back: bool, f: Vector2) -> int:
	var flipped := f.x - f.y < 0.0
	var back := f.x + f.y < -0.2
	return -1 if flipped != (back and not true_back) else 1


## beside: a point `fwd` tiles before a figure at `at` facing `f` and `left` tiles to the left it is drawn with.
static func beside(at: Vector2, f: Vector2, hand: int, fwd: float, left: float) -> Vector2:
	return Vector2(at.x + f.x * fwd + f.y * hand * left, at.y + f.y * fwd - f.x * hand * left)


## fromFigure: where `p` is from a figure at `at` facing `f`: (tiles before it, tiles to the left it is drawn with).
static func from_figure(at: Vector2, f: Vector2, hand: int, p: Vector2) -> Vector2:
	var d := p - at
	return Vector2(d.x * f.x + d.y * f.y, (d.x * f.y - d.y * f.x) * hand)


## Whether the moment `when` falls in this step, from `t0` to `t1` (the rules' `at`).
static func crossed(t0: float, t1: float, when: float) -> bool:
	return t0 < when and t1 >= when


static func clamp01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func smooth(v: float) -> float:
	var k := clamp01(v)
	return k * k * (3.0 - 2.0 * k)


## rel: where the hero is from it as it acts (tiles before it, and to the left it is drawn with).
func rel(m, hero) -> Vector2:
	return from_figure(m.world, m.face, act["hand"] if act != null else 1, hero.world)


## blow: what one of its blows does to the hero, `mult` times its blow, with its words (hurtHero(roll, monsterElement(m),
## m.words, m)).
func blow(m, hero, mult: float) -> void:
	if hero.alive:
		m.harm_hero(hero, m._roll() * mult)


## Whether the hero can be struck now (the game not over; not unhurtable; not in the air of his lunge: h.move).
static func open_to(hero) -> bool:
	return hero.alive and hero._invuln <= 0.0 and hero._act != "lunge"


## knockHero: a blow from `from` knocks the hero back `share` of a heavy blow's step (walls stop him).
static func knock(hero, from: Vector2, share: float) -> void:
	var way: Vector2 = hero.world - from
	hero.knock(way.normalized() if way.length() >= 0.01 else -hero.face, HEAVY_KNOCK * share)


## game.ts slide, for it: the step along x kept if its body (no bigger than 0.42 round) is clear there, then the step along y;
## `fly`: over the open grid (floor or pit), as what flies goes.
static func slide(m, step: Vector2, r := 0.42, fly := false) -> void:
	var rr := minf(m.r, r)
	if m.mgr.clear(m.world.x + step.x, m.world.y, rr, fly):
		m.world.x += step.x
	if m.mgr.clear(m.world.x, m.world.y + step.y, rr, fly):
		m.world.y += step.y


## game.ts isOpen: open ground, and not the wall half of a tile cut corner to corner.
static func is_open(m, p: Vector2) -> bool:
	return m.mgr.map.open_at(floori(p.x), floori(p.y)) and not m.mgr.map.in_wall(p.x, p.y)


## A sound of the game's, as loud as the game plays it (g.sfx: 1, full).
static func sound(m, name: String, vol: float) -> void:
	m.mgr.sfx.play(name, linear_to_db(vol))


## A word over the hero, rising and gone (game.ts emit 'text': "Grabbed", "Poisoned").
static func word(m, hero, text: String, color: Color) -> void:
	var w := Chained.Word.new()
	w.text = text
	w.color = color
	w.position = Iso.to_screen(hero.world.x, hero.world.y)
	m.mgr.stands.add_child(w)


## BossRules.peril: a mark of its kind's on the floor at `p`, named `name` (perils.gd "a1"; marks.gd steps and draws it), with
## the words of its blow as it was made (el, words, half); `more` its own numbers (t, hit, dur, dmg, a, b, c, d, el, ...).
func peril(m, name: String, p: Vector2, more := {}) -> Dictionary:
	var q := {"kind": "a1", "a1": name, "x": p.x, "y": p.y, "fx": m.face.x, "fy": m.face.y, "t": 0.0, "hit": 0.0, "dur": 1.0, "dmg": 0.0,
		"done": 0, "a": 0.0, "b": 0.0, "c": 0.0, "d": 0.0, "hand": act["hand"] if act != null else 1, "src": m, "by": m.blow(), "fig": m.art}
	q.merge(more, true)
	m.mgr.perils.list.append(q)
	return q


## THE CHANTER'S WARD (chanter.ts wardOf, index.ts act1Ward; game.ts damageMonster): how much less harm `m` takes now from the
## chanters round it, the strongest of them: while a chanter lives and is awake, each of the cult's other kinds within 4.5
## tiles of it takes 40% less harm from everything (not another chanter, nor itself). The harm `dmg` as it is warded: a whole
## number, 1 at least (game.ts `Math.max(1, Math.round(dmg * (1 - ward)))`).
static func warded(mgr, m, dmg: float) -> float:
	if mgr == null or not WARD["kinds"].has(m.kind) or m.dead:
		return dmg
	var best := 0.0
	for o in mgr.list:
		if not is_instance_valid(o) or o == m or o.dead or o.kind != "chanter" or o.state == "sleep":
			continue
		if o.world.distance_to(m.world) <= float(WARD["r"]):
			best = maxf(best, float(WARD["share"]))
	return maxf(1.0, floorf(dmg * (1.0 - best) + 0.5)) if best > 0.0 else dmg


## Whether `m` is away from what stands on the ground (game.ts updateMonsters `away`): up in the air, or out of reach under
## the lip: it neither jostles nor is jostled, nor is held off the hero.
static func away(m) -> bool:
	return m.h2 != null and m.h2.has_method("aloft") and (m.h2.aloft(m) or not m.h2.reachable(m))
