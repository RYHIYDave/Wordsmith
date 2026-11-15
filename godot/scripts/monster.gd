## A monster on the floor, as game.ts updateMonsters runs one:
##   SLEEP until it sees the hero within 9 tiles (TUNE.aggroRadius), and then its pack wakes with it (wakeUp: within 14).
##   CHASE: straight at him when it sees him and he is within 2.5 tiles, else down the flow field (nav.ts flowField). A
##     melee monster stops at reach * 0.8 + his radius; one that shoots stands once it sees him within keepMax.
##   ITS MOVES (THE MONSTERS' ATTACKS, game.ts pickMove / startMove / landMove; monster_moves.gd): when its wait is out, the
##     biggest of its moves that is ready and that he is in reach of (and it sees him, but for calling the dead): it winds
##     up, what it is about to do marked on the floor (a slam's circle, a charge's line, a line of aim, the Lockdown's
##     bars); it lands; it recovers; it waits `after`, the move its own cooldown. One without moves has its one blow.
##   WINDUP, then the blow if he is still within range + (r - 0.32) + 0.45 + his radius, or an arrow loosed.
##   RECOVER, its wait set (cooldown, or the move's `after`, times 0.9 to 1.2).
##   CHARGE (the red troll): down his line at 10 tiles a second; the hero met on it struck once and knocked aside; at the
##     line's end, or anything that stops him, he pulls up.
##   RISE (the dead the Warden calls): crawling out of the ground, no more than a picture, then into the fight.
##   FLOORS 3 TO 5 (ACTION_F3, ACTION_F4, THE NEW MONSTERS): the green troll's RAMPAGE (two swings and a leaping slam, he
##     carried on through it) and his BULL RUSH (his stop carrying him on); the BONEWARD's thrust, its spear thrown (then it
##     fights with its shield, goes for its spear and stoops for it: PICKUP) and its SHIELD WALL (a blow from before it
##     glances off); the high priest's fire bolt and his CENSER's burning smoke; the dagger cultist's FRENZY of four stabs.
##   Struck: it flashes (0.12 s), shows its life for 4 s, wakes. Killed: it falls (its die list) and lies 30 s, fading
##   over the last 1.5 (BODIES); its marks on the floor go with it.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const MM := preload("res://scripts/monster_moves.gd")
const Headsman := preload("res://scripts/headsman.gd")
const Amalgam := preload("res://scripts/amalgam.gd")
const Chained := preload("res://scripts/chained.gd")
const Stoker := preload("res://scripts/stoker.gd")
const Fleshmancer := preload("res://scripts/fleshmancer.gd")
const MiniFm := preload("res://scripts/minifm.gd")
## THE BOSSES THAT FIGHT BY THEIR OWN RULES (game/bosses.ts BossRules), each a script of its own with `step(m, dt, hero)`, handed
## the monster every frame it is awake in place of the common rules below (and `died(m)`, if it has one, as it falls): by kind.
const BOSS_AI := {
	"headsman": Headsman,
	"amalgam": Amalgam, "mite": Amalgam.Mite, "beast": Amalgam.Beast,
	"chained": Chained,
	"stoker": Stoker,
	"fleshmancer": Fleshmancer,
	"minifm": MiniFm,
}

const AGGRO := 9.0
const WAKE_PACK := 14.0
const HERO_R := 0.3
const RECOVER := 0.3
const BODY_LIES := 30.0
const BODY_FADES := 1.5
const BAR_FOR := 4.0
## (game.ts: the voice of each kind, sound_families.ts VOICE, and its blow's sound, ATK; each name has two takes)
const VOICE := {"skeleton": "bones", "archer": "bones", "champion": "bones", "marksman": "bones", "brute": "troll", "bat": "bat", "shade": "spirit"}
const ATK := {"skeleton": "atkBones", "champion": "atkBones", "brute": "atkTroll", "bat": "atkBat", "cultist": "atkHex", "shade": "atkSpirit"}

var mgr  # monsters.gd
var art: BakedFigure
var def: Dictionary
var kind := ""
var world := Vector2.ZERO
var face := Vector2(0.7071, 0.7071)
var r := 0.32
var life := 1.0
var max_life := 1.0
var dmg_min := 1.0
var dmg_max := 1.0
var speed := 1.0
var pack_id := -1
var boss := false
var champion := false
var elite := false
## (one the Warden called up: it leaves nothing)
var summoned := false
var xp := 0.0
var state := "sleep"
var dead := false
## (its tile is in sight now: sight.gd; where there is no sight, always)
var seen := true
## (BOSS_INTRO: doors.gd) the boss waits: he stands looking at the hero and nothing harms him, until his gate has fallen and his
## line is said. `title` his name as the game gives it; what he says over his head, and for how long.
var waits := false
var title := ""
var _said := ""
var _said_t := 0.0
var _said_secs := 0.0
var _not_yet := 0.0
var _not_yet_t := 0.0

var _moves: Array = []
var _move_cd: Array = []
var _move := -1
var _charge := {}
var _aim := {}
## (the green troll's rampage and the dagger cultist's frenzy: where it began, the way he faced, how far he has been carried
## and which of its blows are made: game.ts m.rampage, m.frenzy)
var _carry := {}
## (the bull rush's stop: how far it has carried him on; less than 0, none)
var _rush_stop := -1.0
## (THE BONEWARD: its spear is gone; where it lies and the way to it; how long since it picked it up, since a blow glanced
## off its shield; less than 0, never)
var bare := false
var _spear := {}
var _raised_t := -1.0
var _glance_t := -1.0
var _t := 0.0
var _cd := 0.0
var _list := "idle"
var _anim_t := 0.0
var _flash := 0.0
var _bar := 0.0
var _dead_for := 0.0
var _weave := randf() * TAU
var _sprite: Sprite2D
## (how high the ground it stands on lifts it on the screen, picture pixels)
var _lift := 0.0
## (THE HEADSMAN MADE NEW: his prowl and his acts are his own: headsman.gd)
var h2 = null


func setup(m: Dictionary, kind_def: Dictionary, figure: BakedFigure) -> void:
	kind = m["kind"]
	def = kind_def
	art = figure
	world = Vector2(m["x"], m["y"])
	face = Vector2(m["fx"], m["fy"])
	r = m["r"]
	life = m["life"]
	max_life = m["maxLife"]
	dmg_min = m["dmgMin"]
	dmg_max = m["dmgMax"]
	speed = m["speed"]
	pack_id = int(m["packId"])
	boss = m["boss"]
	title = str(m.get("name", kind))
	champion = m.get("champion", false)
	elite = m.get("elite", false)
	summoned = not m.has("xp")
	xp = float(m.get("xp", kind_def.get("xp", 0)))
	_anim_t = m.get("animT", 0.0)
	_moves = MM.moves_of(kind, champion)
	if BOSS_AI.has(kind):
		h2 = BOSS_AI[kind].new()


## Called up out of the ground (the Warden's dead): `secs` till it is out.
func rise(secs: float) -> void:
	state = "rise"
	_t = secs
	_set_list("crawl")


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	_place()
	_show()


func step(dt: float, hero) -> void:
	if dead:
		_dead_for += dt
		_anim_t += dt
		if _dead_for > BODY_LIES - BODY_FADES:
			modulate.a = clampf((BODY_LIES - _dead_for) / BODY_FADES, 0.0, 1.0)
		if _dead_for >= BODY_LIES:
			queue_free()
		_show()
		return
	_anim_t += dt
	_flash = maxf(0.0, _flash - dt)
	_bar = maxf(0.0, _bar - dt)
	_said_t = maxf(0.0, _said_t - dt)
	_not_yet = maxf(0.0, _not_yet - dt)
	_not_yet_t = maxf(0.0, _not_yet_t - dt)
	if _glance_t >= 0.0:
		_glance_t += dt
	if _raised_t >= 0.0:
		_raised_t += dt
	# (BOSS_INTRO: until his gate has fallen and his line is said, the boss stands and looks at the hero)
	if waits:
		var d0: float = hero.world.distance_to(world)
		if state != "sleep" or (hero.alive and d0 <= 32.0 and mgr.sees(world, hero.world)):
			_turn_to(hero.world - world, d0)
		_set_list("idle")
		_place()
		_show()
		queue_redraw()
		return
	# (the Headsman, awake: his own prowl and acts)
	if h2 != null and state != "sleep" and state != "rise":
		h2.step(self, dt, hero)
		_place()
		_show()
		queue_redraw()
		return
	_cd -= dt
	for i in _move_cd.size():
		_move_cd[i] = maxf(0.0, _move_cd[i] - dt)
	var to: Vector2 = hero.world - world
	var dist := to.length()
	var sees: bool = hero.alive and dist <= 15.0 and mgr.sees(world, hero.world)
	var reach := _reach()
	var moved := false
	match state:
		"rise":
			_t -= dt
			if _t <= 0.0:
				state = "chase"
				_cd = 0.8
		"sleep":
			if sees and dist <= AGGRO:
				mgr.wake(self)
		"chase":
			if not hero.alive:
				pass
			elif not _moves.is_empty() and _cd <= 0.0 and _pick(dist, sees) >= 0:
				_start(_pick(dist, sees), hero, dist)
			elif bare and _for_spear(dt, dist):
				moved = state == "chase"
			elif _moves.is_empty() and _cd <= 0.0 and sees and ((def["ranged"] and dist <= float(def["range"])) or (not def["ranged"] and dist <= reach + HERO_R)):
				_turn_to(to, dist)
				state = "windup"
				_t = float(def["windup"])
				_move = -1
				_set_list("attack", true)
			elif def["ranged"]:
				if sees:
					_turn_to(to, dist)
				if not (sees and dist <= float(def["keepMax"])):
					moved = _go(dt, to, dist, sees)
			elif dist > reach * 0.8 + HERO_R:
				moved = _go(dt, to, dist, sees)
			else:
				_turn_to(to, dist)
		"windup":
			var id: String = _moves[_move]["id"] if _move >= 0 else ""
			if id == "pierce":
				_hold_aim(hero)
			elif not id in ["charge", "lockdown", "rampage", "frenzy", "throw", "censer", "bash"]:
				_turn_to(to, dist)
			_t -= dt
			if id == "rampage" or id == "frenzy":
				_carried(hero)
			if _t <= 0.0:
				_land(hero, dist, reach)
		"charge":
			_run_charge(dt, hero)
		"pickup":
			# (it stoops for its spear: in its hand SPEAR.grab into the stoop; its shield raised again a moment after)
			_t -= dt
			if bare and MM.SPEAR["stoop"] - _t >= MM.SPEAR["grab"]:
				bare = false
				_spear = {}
			if _t <= 0.0:
				state = "chase"
				_raised_t = 0.0
		"recover":
			_t -= dt
			var rid: String = _moves[_move]["id"] if _move >= 0 and _move < _moves.size() else ""
			if rid == "frenzy" and not _carry.is_empty():
				_carried(hero)
			# (the green troll's bull rush carries him on through his stop, less and less)
			if _rush_stop >= 0.0 and rid == "charge":
				var want := MM.rush_stop_travel(_moves[_move]["recover"] - maxf(0.0, _t))
				if want > _rush_stop:
					var on := face * (want - _rush_stop)
					var rr0 := minf(r, 0.42)
					if mgr.clear(world.x + on.x, world.y, rr0):
						world.x += on.x
					if mgr.clear(world.x, world.y + on.y, rr0):
						world.y += on.y
				_rush_stop = want
			if _t <= 0.0:
				_rush_stop = -1.0
				state = "chase"
	if state == "sleep" or state == "chase":
		if _glance_t >= 0.0 and _glance_t < MM.WALL["glance"] and art.has("glance"):
			_set_list("glance")
		elif bare and art.has("walkBare"):
			_set_list("walkBare" if moved else "standBare")
		else:
			_set_list("walk" if moved else "idle")
	_place()
	_show()
	queue_redraw()


# --- the moves ---

## pickMove: the biggest of its moves that is ready and in reach; -1 for none (it comes on).
func _pick(dist: float, sees: bool) -> int:
	if _move_cd.size() != _moves.size():
		_move_cd = []
		for mv in _moves:
			_move_cd.append(mv["first"] * randf_range(0.5, 1.5))
	var reach := float(def["range"]) if def["ranged"] else _reach() + HERO_R
	for i in range(_moves.size() - 1, -1, -1):
		var mv: Dictionary = _moves[i]
		if _move_cd[i] > 0.0:
			continue
		# (the Boneward's thrust and its throw want its spear in hand; its shield, the spear gone)
		if kind == "boneward" and (mv["id"] == "bash") != bare:
			continue
		if dist < mv["near"] or dist > (mv["far"] if mv["far"] > 0.0 else reach):
			continue
		if mv["id"] == "summon":
			if mgr.called(self) >= MM.SUMMON["most"]:
				continue
		elif not sees:
			continue
		# (the champion's cry is heard only by minions carrying his words: none on floor 1)
		if mv["id"] == "rally":
			continue
		if mv["id"] == "charge" and _lane(dist).is_empty():
			continue
		return i
	return -1


## startMove: it winds up, and what it is about to do is marked on the floor.
func _start(i: int, hero, dist: float) -> void:
	var mv: Dictionary = _moves[i]
	_move = i
	state = "windup"
	_t = mv["windup"]
	_turn_to(hero.world - world, dist)
	_set_list(MM.picture_of(art.name, mv["id"]), true)
	mgr.used[mv["id"]] = mgr.used.get(mv["id"], 0) + 1
	match mv["id"]:
		"slam":
			var at := minf(dist, float(def["range"]))
			mgr.perils.warn(world.x + face.x * at, world.y + face.y * at, float(def["aoe"]), mv["windup"], _roll() * mv["dmg"], self)
		"charge":
			# (the green troll's bull rush runs RUSH.past beyond the hero, and its lane is drawn on to where his stop takes him)
			var lane := _lane(dist)
			var P := _charge_of()
			_charge = {"a": lane["a"], "b": lane["b"], "hit": false, "run": minf((lane["b"] - lane["a"]).length(), dist + P["run"])}
			mgr.perils.lane(self, lane["a"], lane["b"], P["half"], mv["windup"])
			mgr.sfx.play("boss_roar", -8.0)
		"rampage":
			# (its two swings in its wind-up; its ring marked as the club goes up over his head; the slam as it lands: _carried)
			_carry = {"at": world, "f": face, "went": 0.0, "n": 0, "marked": false, "ring": Vector2.ZERO}
		"frenzy":
			# (its first three stabs in its wind-up, the fourth as it lands)
			_carry = {"at": world, "f": face, "went": 0.0, "n": 0}
		"summon":
			mgr.sfx.play("boss_roar")
		"lockdown":
			mgr.perils.bars(self, world.x, world.y, _roll() * mv["dmg"], mv["windup"])
			mgr.sfx.play("boss_roar", -6.0)
		"pierce":
			_aim = mgr.perils.aim(self, world, _aim_end(face), mv["windup"])
		"sigil":
			# (FLOOR 2: the cultist's fire sigil, its ring under where the hero stands as it begins its cast: game/action_f2.ts)
			mgr.perils.sigil(hero.world.x, hero.world.y, _roll() * mv["dmg"], mv["windup"], self)
			mgr.sfx.play("fire", -8.0)


## landMove: the end of its wind-up.
func _land(hero, dist: float, reach: float) -> void:
	if _move < 0:
		# (its one blow, or its one shot)
		state = "recover"
		_t = RECOVER
		_cd = float(def["cooldown"]) * randf_range(0.9, 1.2)
		if def["ranged"]:
			mgr.shoot(self, (hero.world - world).normalized(), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll())
			mgr.sfx.play("shot", -6.0)
		else:
			_blow(hero, dist, reach, 1.0)
		return
	var mv: Dictionary = _moves[_move]
	state = "recover"
	_t = mv["recover"]
	_cd = mv["after"] * randf_range(0.9, 1.2)
	if mv["cooldown"] > 0.0:
		_move_cd[_move] = mv["cooldown"]
	match mv["id"]:
		"swing":
			_blow(hero, dist, reach, mv["dmg"])
		"bash":
			# (the Boneward's shield, while its spear is gone, shoves the hero back too)
			if _blow(hero, dist, reach, mv["dmg"]):
				hero.knock((hero.world - world).normalized() if dist > 0.01 else face, MM.SPEAR["knock"])
		"throw":
			# (its spear, from its hand, at where the hero stands; its hand is empty till it picks the spear up again)
			var hand := world + face * MM.SPEAR["hand"]
			if not mgr.map.open_at(floori(hand.x), floori(hand.y)):
				hand = world
			var th: Vector2 = hero.world - hand
			var tl := maxf(th.length(), 0.001)
			mgr.throw_spear(self, hand, th / tl, tl, _roll() * mv["dmg"])
			bare = true
			mgr.sfx.play("swing", -4.0)
		"censer":
			# (its burning smoke settles before him, as far as SMOKE.at, or where the hero stands if nearer)
			var far := maxf(MM.SMOKE["near"], minf(MM.SMOKE["at"], dist))
			var sm := world + face * far
			if not mgr.map.open_at(floori(sm.x), floori(sm.y)):
				sm = world + face * MM.SMOKE["near"]
			var ticks := maxi(1, roundi(MM.SMOKE["dur"] / MM.SMOKE["tick"]))
			mgr.perils.smoke(sm.x, sm.y, _roll() * mv["dmg"] / ticks, self)
			mgr.sfx.play("fire", -3.0)
		"rampage":
			# (the slam: the ring where it was marked, or before him if it never was, and out it goes)
			var rg: Vector2 = _carry["ring"] if _carry.get("marked", false) else world + face * MM.RING["ahead"]
			if hero.alive and hero.world.distance_to(rg) <= MM.RING["radius"]:
				hero.hurt(_roll() * mv["dmg"] * MM.RAMPAGE["slam"])
			mgr.perils.drop(self, ["warn"])
			mgr.perils.ring(rg.x, rg.y, MM.RING["radius"])
			hero.kick(3.0)
			mgr.sfx.play("slam", -1.0)
			if not _carry.is_empty():
				face = _carry["f"]
		"frenzy":
			# (its fourth stab, then winded where it has carried him)
			if not _carry.is_empty():
				_frenzy_stab(hero, _carry["at"] + _carry["f"] * MM.FRENZY["travel"], mv)
				face = _carry["f"]
		"shoot":
			# (a leader who shoots, as those he leads shoot: the marksman's and the archer's arrow, the high priest's fire bolt)
			var arrow := kind == "marksman" or kind == "archer"
			mgr.shoot(self, (hero.world - world).normalized(), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll() * mv["dmg"], "arrow" if arrow else "bolt")
			mgr.sfx.play("shot" if arrow else "fire", -6.0)
		"rain":
			mgr.perils.rain(hero.world.x, hero.world.y, _roll() * mv["dmg"])
			mgr.sfx.play("shot", -4.0)
		"pierce":
			var way := face
			if not _aim.is_empty():
				way = (_aim["b"] - _aim["a"]).normalized()
			mgr.perils.drop(self, ["aim"])
			_aim = {}
			mgr.shoot(self, way, MM.AIM["speed"], MM.AIM["range"], _roll() * mv["dmg"], "great", MM.AIM["r"], true)
			mgr.sfx.play("shot")
			hero.shake()
		"bolts":
			var base := atan2(hero.world.y - world.y, hero.world.x - world.x)
			var n: int = MM.BOLTS["n"]
			for k in range(-(n / 2), n / 2 + 1):
				var a: float = base + k * MM.BOLTS["apart"]
				mgr.shoot(self, Vector2(cos(a), sin(a)), float(def["projSpeed"]), MM.BOLTS["range"], _roll() * mv["dmg"], "bolt")
			mgr.sfx.play("fire", -4.0)
		"slam":
			pass  # (the red circle does the harm: perils.gd)
		"lockdown":
			pass  # (its bars crash at the peril's own clock: perils.gd)
		"sigil":
			pass  # (its sigil erupts at the peril's own clock: perils.gd)
		"summon":
			mgr.summon(self)
		"charge":
			if not _charge.is_empty():
				state = "charge"
				_t = (_charge["b"] - _charge["a"]).length() / _charge_of()["speed"] + 0.5
				_set_list("charge", true)
				mgr.sfx.play("slam", -6.0)


func _blow(hero, dist: float, reach: float, share: float) -> bool:
	mgr.sfx.play(ATK.get(kind, "atkBones"), -4.0)
	mgr.sfx.play("swing", -10.0)
	var struck: bool = hero.alive and dist <= reach + 0.45 + HERO_R
	if struck:
		hero.hurt(_roll() * share)
	# (FLOOR 2: the Shade's rake, cold: a patch of rime before it as it lands: game/action_f2.ts)
	if kind == "shade":
		mgr.perils.rime(world.x + face.x * MM.RIME["ahead"], world.y + face.y * MM.RIME["ahead"], self)
	return struck


## How far its blow reaches beyond its body (game.ts reachOf): a Boneward whose spear is gone, its shield's.
func _reach() -> float:
	return (MM.SPEAR["bash"] if bare else float(def["range"])) + (r - 0.32)


## A charge's numbers by whose it is (action_f3.ts chargeOf): the red troll's, or the green troll's bull rush. `past`: how
## far beyond the hero his lane goes; `run`: how far beyond him his run; `stop`: how far his stop carries him on after it.
func _charge_of() -> Dictionary:
	if kind == "brute" and not champion:
		return {"speed": MM.RUSH["speed"], "half": MM.RUSH["half"], "past": MM.RUSH["past"] + MM.RUSH["stop"], "run": MM.RUSH["past"], "stop": MM.RUSH["stop"], "knock": MM.RUSH["knock"]}
	return {"speed": MM.CHARGE["speed"], "half": MM.CHARGE["half"], "past": MM.CHARGE["past"], "run": MM.CHARGE["past"], "stop": 0.0, "knock": MM.CHARGE["knock"]}


## THE GREEN TROLL THROUGH HIS RAMPAGE, THE DAGGER CULTIST THROUGH HIS FRENZY: the blows of it that come before its end, and he
## carried along the way he faced as it began, as his pictures have him go (game.ts startMove's blows, carryAlong, carryFrenzy).
func _carried(hero) -> void:
	if _carry.is_empty() or _move < 0:
		return
	var mv: Dictionary = _moves[_move]
	var age := MM.move_age(state, _t, mv["windup"], mv["recover"])
	if mv["id"] == "rampage":
		var hits: Array = MM.RAMPAGE["hits"]
		while _carry["n"] < hits.size() and age >= hits[_carry["n"]]:
			_carry["n"] += 1
			_rampage_swing(hero, mv)
		if not _carry["marked"] and age >= MM.RAMPAGE["raise"]:
			# (the club is up over his head: the ring marked where it will come down, before where he will land)
			_carry["marked"] = true
			var go := _carry_reach(hero, MM.RAMPAGE["travel"])
			var rg: Vector2 = _carry["at"] + _carry["f"] * (go + MM.RING["ahead"])
			_carry["ring"] = rg
			mgr.perils.mark(rg.x, rg.y, MM.RING["radius"], maxf(0.05, _t), self)
		_carry_along(hero, MM.rampage_travel(age))
	else:
		if state == "windup":
			var stabs: Array = MM.FRENZY["hits"]
			while _carry["n"] < stabs.size() and age >= stabs[_carry["n"]]:
				var at: float = stabs[_carry["n"]]
				_carry["n"] += 1
				_frenzy_stab(hero, _carry["at"] + _carry["f"] * MM.frenzy_travel(at), mv)
		_carry_along(hero, MM.frenzy_at(age))


## How far a move of its own may carry it toward `want` tiles from where it began: not on through the hero (as far as to him).
func _carry_to(hero, want: float) -> float:
	var f: Vector2 = _carry["f"]
	var rel: Vector2 = hero.world - _carry["at"]
	var along := rel.dot(f)
	var aside := absf(rel.x * f.y - rel.y * f.x)
	var body := r + HERO_R
	if along > 0.0 and aside < body:
		return minf(want, maxf(_carry["went"], along - sqrt(body * body - aside * aside)))
	return want


## Carried `want` tiles along the way it faced as its move began: not on through the hero, nor into a wall (carryAlong).
func _carry_along(hero, want: float) -> void:
	var go := _carry_to(hero, want)
	if absf(go - _carry["went"]) < 1e-6:
		return
	var p: Vector2 = _carry["at"] + _carry["f"] * go
	if not mgr.clear(p.x, p.y, r):
		return
	world = p
	_carry["went"] = go


## How far it could be carried on to `want`, as things stand: up to the hero, or a wall (carryReach).
func _carry_reach(hero, want: float) -> float:
	var go := _carry_to(hero, want)
	var ok: float = _carry["went"]
	var a: float = _carry["went"]
	while a <= go + 1e-6:
		var p: Vector2 = _carry["at"] + _carry["f"] * a
		if not mgr.clear(p.x, p.y, r):
			break
		ok = a
		if a >= go:
			break
		a = minf(go, a + 0.1)
	return ok


## A swing of the rampage: the hero within its reach, in the half of the floor before him, is struck (rampageSwing).
func _rampage_swing(hero, mv: Dictionary) -> void:
	var d: Vector2 = hero.world - world
	if hero.alive and d.length() <= MM.RAMPAGE["reach"] + HERO_R and d.dot(_carry["f"]) >= -HERO_R:
		hero.hurt(_roll() * mv["dmg"] * MM.RAMPAGE["swing"])
	mgr.sfx.play("atkTroll", -4.0)
	mgr.sfx.play("swing", -4.0)
	mgr.used["rampage_swing"] = mgr.used.get("rampage_swing", 0) + 1


## A stab of the frenzy from `at`: the hero within its reach and its arc before him is struck (frenzyStab).
func _frenzy_stab(hero, at: Vector2, mv: Dictionary) -> void:
	var d: Vector2 = hero.world - at
	var l := d.length()
	var ahead: bool = l < 1e-6 or d.dot(_carry["f"]) / l >= cos(deg_to_rad(MM.FRENZY["arc"] / 2.0))
	if hero.alive and l <= MM.FRENZY["reach"] + HERO_R and ahead:
		hero.hurt(_roll() * mv["dmg"])
	mgr.sfx.play("swing", -9.0)
	mgr.used["frenzy_stab"] = mgr.used.get("frenzy_stab", 0) + 1


## THE BONEWARD WHOSE SPEAR IS GONE goes for it, unless the hero is near and the spear is not; within reach of it, it stoops
## for it, facing it (game.ts spearWay, beginStoop). Whether it did either.
func _for_spear(dt: float, dist: float) -> bool:
	if _spear.is_empty():
		return false
	var at: Vector2 = _spear["at"]
	var d := at.distance_to(world)
	if not (dist > MM.SPEAR["near"] or d <= MM.SPEAR["close"]):
		return false
	if d <= MM.SPEAR["pick"]:
		if d > 0.01:
			face = (at - world) / d
		state = "pickup"
		_t = MM.SPEAR["stoop"]
		_set_list("pickUp", true)
		mgr.used["pickup"] = mgr.used.get("pickup", 0) + 1
		return true
	var way: Vector2 = (at - world) / d if d < 2.5 and mgr.sees(world, at) else mgr.flow_dir(world, _spear["flow"])
	if way == Vector2.ZERO:
		return false
	face = way
	var step := way * speed * dt
	var rr := minf(r, 0.42)
	if mgr.clear(world.x + step.x, world.y, rr):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, rr):
		world.y += step.y
	return true


## Its spear has come down (monsters.gd _lay_spear): where it lies, and the way to it from anywhere near.
func spear_lies(at: Vector2, way: Vector2, flow: PackedInt32Array) -> void:
	_spear = {"at": at, "way": way, "flow": flow}


## IS THE BONEWARD'S SHIELD WALL UP (game.ts wallUp)? While it stands or walks with its spear in hand, and through its
## thrust's wind-up to WALL.thrust_open; down from the start of its throw, all the while its spear is gone, and until
## WALL.raised_again after it has picked it up.
func wall_up() -> bool:
	if kind != "boneward" or bare or state == "pickup" or dead:
		return false
	if _raised_t >= 0.0 and _raised_t < MM.WALL["raised_again"]:
		return false
	if _move >= 0 and (state == "windup" or state == "recover"):
		var id: String = _moves[_move]["id"]
		if id == "throw":
			return false
		if id == "swing" and (state == "recover" or _moves[_move]["windup"] - _t >= MM.WALL["thrust_open"]):
			return false
	return true


## THE RED TROLL'S CHARGE: his line, from him through where the hero stands and 1.5 on, if he has a clear run there (no wall
## between, and long enough to get past the hero); empty if not (game.ts chargeLane).
func _lane(dist: float) -> Dictionary:
	if dist < 0.01:
		return {}
	var hero = mgr.hero
	var f: Vector2 = (hero.world - world) / dist
	var rr := minf(r, 0.42)
	var len := 0.0
	var a := 0.2
	while a <= dist + _charge_of()["past"] + 1e-6:
		var p: Vector2 = world + f * a
		if not mgr.clear(p.x, p.y, rr):
			break
		len = a
		a += 0.2
	if len < dist + 0.4:
		return {}
	return {"a": world, "b": world + f * len}


## He runs his line: the hero met on it is struck once and knocked aside, out of the line; at its end, or at anything that
## stops him, he pulls up, skidding, and stands a moment (game.ts runCharge, endCharge).
func _run_charge(dt: float, hero) -> void:
	var a: Vector2 = _charge["a"]
	var b: Vector2 = _charge["b"]
	var len := maxf((b - a).length(), 0.01)
	var f := (b - a) / len
	var P := _charge_of()
	var step: float = P["speed"] * dt
	var was := world
	var rr := minf(r, 0.42)
	if mgr.clear(world.x + f.x * step, world.y, rr):
		world.x += f.x * step
	if mgr.clear(world.x, world.y + f.y * step, rr):
		world.y += f.y * step
	face = f
	_t -= dt
	var along := (world - a).dot(f)
	for p in mgr.perils.list:
		if p["kind"] == "lane" and p.get("src") == self:
			p["gone"] = clampf(along / len, 0.0, 1.0)
	if not _charge["hit"] and hero.alive and hero.world.distance_to(world) <= r + HERO_R + 0.15:
		_charge["hit"] = true
		hero.hurt(_roll() * _moves[_move]["dmg"])
		var o := a + f * along
		var side := 1.0 if (hero.world - o).dot(Vector2(-f.y, f.x)) >= 0.0 else -1.0
		hero.knock(Vector2(-f.y, f.x) * side, P["knock"])
		hero.shake()
		mgr.sfx.play("slam")
	# (the green troll's run ends at its own end, as its round comes to a frame his stop can take him from; then his stop
	# carries him on: action_f3.ts rushMayEnd, game.ts endCharge)
	var run: float = _charge.get("run", len)
	var may_end: bool = P["stop"] <= 0.0 or (int(_anim_t * 30.0 + 1e-6) % 6) in MM.RUSH["end_on"]
	if (along >= run - 0.05 and may_end) or world.distance_to(was) < step * 0.3 or _t <= 0.0:
		state = "recover"
		_t = _moves[_move]["recover"]
		if P["stop"] > 0.0:
			_rush_stop = 0.0
		_charge = {}
		mgr.perils.drop(self, ["lane"])
		_set_list("chargeStop", true)


## THE MARKSMAN DRAWS: his line of aim follows the hero until 0.4 s before he looses, then holds still (game.ts holdAim).
func _hold_aim(hero) -> void:
	if _aim.is_empty() or _t <= MM.AIM["lock"]:
		return
	var to: Vector2 = hero.world - world
	if to.length() < 0.01:
		return
	face = to.normalized()
	_aim["a"] = world
	_aim["b"] = _aim_end(face)


## Where a line of aim the way `f` ends: 14 tiles on, or at the first wall.
func _aim_end(f: Vector2) -> Vector2:
	var len := 0.0
	var a := 0.25
	while a <= MM.AIM["range"] + 1e-6:
		var p := world + f * a
		var t: int = mgr.map.tile(floori(p.x), floori(p.y))
		if t != 1 and t != 3:
			break
		len = a
		a += 0.25
	return world + f * len


# --- moving ---

## A step toward him: straight when it sees him close, else down the flow field; a bat weaves as it flies.
func _go(dt: float, to: Vector2, dist: float, sees: bool) -> bool:
	var way: Vector2 = to / dist if sees and dist < 2.5 else mgr.flow_dir(world)
	if way == Vector2.ZERO:
		return false
	if kind == "bat":
		_weave += dt * 7.0
		way = (way + Vector2(-way.y, way.x) * sin(_weave) * 0.6).normalized()
	face = way
	var step := way * speed * dt
	# (game.ts: a monster walks with a body no bigger than 0.42 round, so that a big one gets through a doorway)
	var rr := minf(r, 0.42)
	var fly := kind == "bat"
	if mgr.clear(world.x + step.x, world.y, rr, fly):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, rr, fly):
		world.y += step.y
	return true


func _turn_to(to: Vector2, dist: float) -> void:
	if dist > 0.01:
		face = to / dist


func _roll() -> float:
	return randf_range(dmg_min, dmg_max)


func wake_up() -> void:
	if state == "sleep":
		state = "chase"
		_cd = randf_range(0.2, 0.9)


func hurt(dmg: float) -> void:
	if dead or state == "rise":
		return
	# (nor is a boss who waits: game.ts damage, "Not yet")
	if waits:
		if _not_yet_t <= 0.0:
			_not_yet_t = 0.7
			_not_yet = 0.9
		queue_redraw()
		return
	# (nor one whose own rules say nothing reaches it now: the Fleshmancer gone under the floor, game.ts damage, blinkedAway)
	if h2 != null and h2.has_method("reachable") and not h2.reachable(self):
		return
	# (FLOOR 3: the Boneward behind its shield: a blow from before it glances off, and does nothing: game.ts hitMonster)
	if wall_up() and mgr.hero != null:
		var hd: Vector2 = mgr.hero.world - world
		var from := rad_to_deg(acos(clampf(hd.normalized().dot(face), -1.0, 1.0))) if hd.length() > 0.0001 else 0.0
		if absf(from) <= MM.WALL["arc"] / 2.0:
			_glance_t = 0.0
			if state == "sleep":
				mgr.wake(self)
			mgr.sfx.play("hit", -9.0)
			mgr.used["glance"] = mgr.used.get("glance", 0) + 1
			return
	life -= dmg
	_flash = 0.12
	_bar = BAR_FOR
	if state == "sleep":
		mgr.wake(self)
	if life <= 0.0:
		_die()


const PF := preload("res://scripts/pixel_font.gd")
const SAY_GOLD := Color("#ffd27a")
const SAY_INK := Color("#120d18")
## (render/fx.ts BOSS_SAY_LIFT: game pixels over where he stands)
const SAY_LIFT := 84.0


## His line on a dark slip over his head, a little tail pointing down at him (render/fx.ts, bossSay), in game pixels.
func _say_slip() -> void:
	var t := _said_secs - _said_t
	var a := minf(1.0, t / 0.15) if t < _said_secs - 0.4 else maxf(0.0, (_said_secs - t) / 0.4)
	var w := PF.width(_said) + 10.0
	var y := -SAY_LIFT - roundf(minf(1.0, t / 0.12) * 4.0)
	var foot := y + 1.0 + 10.0
	var ink := Color(SAY_INK, 0.8 * a)
	draw_rect(Rect2(-floorf(w / 2.0), y - 3.0, w, 14.0), ink)
	draw_rect(Rect2(-2, foot, 5, 1), ink)
	draw_rect(Rect2(-1, foot + 1, 3, 1), ink)
	draw_rect(Rect2(0, foot + 2, 1, 1), ink)
	PF.draw(self, _said, 0, y, Color(SAY_GOLD, a), {"align": "center", "shadow": Color(SAY_INK, a)})


## Say a line over his head for so many seconds (game.ts bossIntro, render/fx.ts bossSay).
func say(text: String, secs: float) -> void:
	_said = text
	_said_t = secs
	_said_secs = secs
	queue_redraw()


func _die() -> void:
	dead = true
	state = "dead"
	_bar = 0.0
	_set_list("die", true)
	mgr.perils.drop(self)
	if h2 != null and h2.has_method("died"):
		h2.died(self)
	if boss:
		mgr.boss_fell = true
		mgr.boss_at = world
	if mgr.loot != null:
		mgr.loot.on_kill(self)
	if VOICE.has(kind):
		mgr.sfx.play(VOICE[kind] + "_death", -4.0)
	elif boss:
		mgr.sfx.play("boss_roar")
	queue_redraw()


# --- its picture ---

func _set_list(list: String, again := false) -> void:
	if (_list != list or again) and art.has(list):
		_list = list
		_anim_t = 0.0


## Where it is on the screen; on raised or sunken ground and on stairs it is drawn as high as the ground is there
## (floor_map.gd lift_at).
func _place() -> void:
	position = Iso.to_screen(world.x, world.y)
	_lift = mgr.map.lift_at(world.x, world.y) if mgr != null and mgr.map != null else 0.0
	if _sprite != null:
		# (the dagger cultist's frenzy: his pictures carry him along the way they face, and the rules the way he truly faces, so
		# his picture is drawn back by what it carries him: action_f4.ts frenzyShift)
		var shift := Vector2.ZERO
		if _move >= 0 and _move < _moves.size() and (state == "windup" or state == "recover") and _moves[_move]["id"] == "frenzy":
			var c := MM.frenzy_at(MM.move_age(state, _t, _moves[_move]["windup"], _moves[_move]["recover"]))
			var ahead := MM.picture_ahead(face)
			shift = Vector2(-roundf((ahead.x - ahead.y) * 16.0 * c), -roundf((ahead.x + ahead.y) * 8.0 * c)) * 2.0
		_sprite.position = Vector2(shift.x, shift.y - _lift)


func _show() -> void:
	var n := art.count(0, _list)
	if n == 0:
		return
	var i := int(_anim_t * art.fps(_list))
	# (standing, walking and running go round; a blow, a fall, a call play once and hold their last frame)
	i = i % n if _list in ["idle", "walk", "charge", "standBare", "walkBare"] else mini(i, n - 1)
	var f := art.frame(face.x, face.y, _list, i)
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.flip_h = f["flip"]
	_sprite.scale = Vector2.ONE * float(f["scale"])
	_sprite.self_modulate = Color(2.4, 2.4, 2.4) if _flash > 0.0 else Color.WHITE


## Its life over its head for a while after it is struck (game.ts barT).
func _draw() -> void:
	var top := _sprite.offset.y * _sprite.scale.y - 10.0 - _lift
	if (_said_t > 0.0 or _not_yet > 0.0) and not dead:
		# (in the game's letters, in game pixels: render/fx.ts)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		if _said_t > 0.0:
			_say_slip()
		if _not_yet > 0.0:
			var rise := roundf((0.9 - _not_yet) * 12.0)
			PF.draw(self, "Not yet", 0, top / 2.0 - 4 - rise, Color(SAY_GOLD, clampf(_not_yet / 0.3, 0.0, 1.0)), {"align": "center", "shadow": Color(SAY_INK, clampf(_not_yet / 0.3, 0.0, 1.0))})
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	if _bar <= 0.0 or dead:
		return
	var w := 36.0 if not boss else 80.0
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 6), Color(0.04, 0.04, 0.1, 0.85))
	draw_rect(Rect2(-w / 2, top, w * clampf(life / max_life, 0.0, 1.0), 4), Color(0.86, 0.18, 0.28))
