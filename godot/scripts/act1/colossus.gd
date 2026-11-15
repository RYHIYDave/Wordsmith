## THE SWAMP COLOSSUS, floor 10's boss (the Drowned Eye redone; COLOSSUS on as the game starts), run on floor 10 as the game runs him
## (game/act1_rules/colossus.ts COLOSSUS_RULES: tick, handle, sounds, bossAt, reachable, lifeFloor, died, hittable, peril). The fight
## itself, what hurts and when, is colossus_fight.gd; here:
##   HE IS THE FLOOR'S BOSS (kind "eye", as the Drowned Eye was), at his place in the water off his stone; the fight begins as the
##     hero first steps onto the stone (stone.gd carries him across from the landing on the boss's ground), and is stepped with
##     where he stands on it and whether he is rolling or leaping through (in the air of his Lunge: his `_invuln`).
##   HIS TENTACLES ARE MONSTERS OF THEIR OWN (of his kind, `a1.arm` naming which of the fight's), each burst up where its root is in
##     the water, its life its phase's share of his (a half each in phase 1, a third in phase 2), struck and killed as any is, but
##     only while the fight says its blows reach it (standing, slamming, smashing, or most of the way up); killed, the fight is told.
##   ITS BLOWS land on the hero with his own blow's weight (BossRules.blow: his roll times the move's share, his words on it); its
##     knocks shove the hero as a shove does (Hero.step: so far over so long, stopped by the water's edge).
##   HIS LIFE BAR is his phase's: in phases 1 and 2 his tentacles' life together (he himself not reached), in phase 3 his own; it
##     comes up as his first tentacles stand, after his waking (`hittable`). Each phase's bar full again as it begins.
##   THE FLASKS are refilled as the last of a phase's tentacles is killed (his “flasks reset in between each phase for now”):
##     "Flasks refilled".
##   HIS BODY: where the fight has him (at his place, slid forward in phase 3 where his eye is struck, at an end of the stone in his
##     shovel); his blows reached only in phase 3 (`reachable`); struck there, his eye flinches (`eye_hit`).
##   HIS SOUNDS: the sound chat's fifth and seventh batches, each at the fight's beat the game plays it at (`_sounds`), and the
##     screen shaken at the art's beats.
##   HIS DEATH: the fight won; his death's own sound whole from the killing blow; his death played on the fight's mark from then
##     (12.5 s), the screen shaken at its beats.
## What is drawn of it all hangs on one mark kept by the hero, "eye:fight" (perils.gd kind "a1"; drawn by colossus_draw.gd), so that
## it is drawn wherever he is. THE CULT'S PILLARS of his phase 3 (game/quests610.ts PILLARS: lit as it begins, his ward holding while
## one burns, the siege's bolts falling while one burns) are the descent's quest's, not here yet: with none standing, as the game
## has it where none stand, his ward is down and the siege's bolts fall throughout phase 3 (`pillars`, for the quest to set).
extends "res://scripts/act1/act1.gd"

const F := preload("res://scripts/act1/colossus_fight.gd")
## (defs.ts MSG.life: the line that says the flasks are refilled)
const MSG_LIFE := Color("#ff9aa0")
## (defs.ts MONSTERS.eye.radius: his body's size at his place)
const BODY_R := 3.3
## (defs.ts BOSS_LINES.eye: his line as he is met; BOSS_INTRO: how long his name is across the screen and his line said)
const LINES := ["You are seen.", "Drown.", "The siege is my dream. Sleep in it."]
const INTRO := {"secs": 3.2, "sayFor": 1.9}

## (the cult's pillars of phase 3, the descent's quest's, as game/quests610.ts keeps them: each {burning}. Empty: none stand.)
var pillars: Array = []


# --- the game's Act1Rules for him ---

## (ACT 1's EYE_RULES.gait: he goes nowhere; his tick is all he does)
func gait() -> Dictionary:
	return {"pace": 1.0, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 99.0, "slack": 99.0, "trueBack": false}


func acts() -> Array:
	return []


## (render/act1_fx/colossus.ts COLOSSUS_FX.hidden: his figure and his tentacles' are not drawn as figures; the fight draws them)
func shown(_m) -> Dictionary:
	return {"hide": true}


## (seenBy: always)
func seen_by(_m) -> bool:
	return true


## The stone's middle (the world point), or INF where the floor has none.
static func stone_of(m) -> Vector2:
	var s = m.mgr.map.stone if m.mgr != null and m.mgr.map != null else null
	return Vector2(float(s["cx"]), float(s["cy"])) if s != null else Vector2.INF


## (colossusOf) Him, the boss who keeps the fight, among the floor's monsters.
static func boss_of(mgr):
	for o in mgr.list:
		if is_instance_valid(o) and o.kind == "eye" and not o.dead and o.h2 != null and o.h2.a1.has("fight"):
			return o
	return null


## (bossAt) Where he stands as the floor is laid: his middle at his place, facing up the screen toward the stone.
static func boss_at(S: Vector2) -> Vector2:
	return F.stone_to_world(S, F.HIS_PLACE.x, F.HIS_PLACE.y)


## (reachable) A tentacle as the fight says it can be struck now; his body in phase 3 only, where he is.
func reachable(_m) -> bool:
	if a1.has("arm"):
		var f = a1.get("armOf")
		var a = f.arm_of(int(a1["arm"])) if f != null else null
		return f != null and a != null and f.arm_struck(a)
	var f = a1.get("fight")
	return f != null and not f.body_struck().is_empty()


## (hittable) His bar comes up as his first tentacles stand, after his waking; and stays (game.ts bossShown).
func hittable(_m) -> bool:
	if a1.get("barUp", false):
		return true
	var f = a1.get("fight")
	if f == null or f.mode == "idle" or f.wake_t >= 0.0:
		return false
	for a in f.arms:
		if a.state != "rise":
			a1["barUp"] = true
			return true
	return false


## (tick) A step of him every frame he is awake: all he does.
func tick(m, dt: float, _dist: float, hero) -> bool:
	# (a tentacle: its fight's arm, kept where its root is; nothing of its own)
	if a1.has("arm"):
		return true
	var S := stone_of(m)
	if S == Vector2.INF:
		return true
	if not a1.has("fight"):
		a1["fight"] = F.new()
	var f = a1["fight"]
	var p := F.world_to_stone(S, hero.world.x, hero.world.y)
	# (his bar is the screen's: none over him, as the game draws none over a boss)
	m._bar = 0.0
	_shove(hero, dt)
	if f.mode == "idle":
		if not F.on_stone(p):
			return true
		_handle(m, S, f.begin())
	# (phase 3: the cult's pillars: while one burns his ward holds and the siege's bolts fall; with none standing, no ward, and the
	# bolts fall, as the game has it where none stand)
	var burning := 0
	for q in pillars:
		if q.get("burning", false):
			burning += 1
	f.shielded = f.ph == 3 and burning > 0
	f.siege = pillars.is_empty() or burning > 0
	# (his eye struck: his life dropped)
	if f.ph == 3 and f.mode == "fight" and a1.has("life0") and m.life < float(a1["life0"]):
		f.eye_hit()
		a1["hitAt"] = f.time
	a1["life0"] = m.life
	# (what is drawn of his fight hangs on one mark kept by the hero, so that it is drawn wherever he is: colossus_draw.gd)
	var fp := _fight_mark(m)
	fp["x"] = hero.world.x
	fp["y"] = hero.world.y
	_handle(m, S, f.step(dt, p, hero._invuln > 0.0))
	# (his tentacles' life together, his bar in phases 1 and 2)
	if f.ph < 3 or f.mode != "fight":
		var left := 0.0
		var all := 0.0
		var arms: Dictionary = a1.get("arms", {})
		for a in f.arms:
			var t = arms.get(a.id)
			if t == null or not is_instance_valid(t):
				continue
			all += t.max_life
			left += 0.0 if t.dead else t.life
		if all > 0.0 and f.mode == "fight":
			m.life = maxf(1.0, m.max_life * left / all)
	m.world = _body_where(S, f)
	m.r = float(F.FORWARD["r"]) if f.ph == 3 else BODY_R
	return true


## The mark his fight is drawn by ("eye:fight"), kept by the hero; made when first wanted.
func _fight_mark(m) -> Dictionary:
	for q in m.mgr.perils.list:
		if q.get("kind") == "a1" and q.get("a1") == "eye:fight":
			return q
	# (no one's: nothing drops it as he falls but his death's end; his fight and he kept on it)
	var q := {"kind": "a1", "a1": "eye:fight", "x": m.world.x, "y": m.world.y, "fx": 0.0, "fy": 0.0, "t": 0.0, "hit": 0.0, "dur": 1e9, "dmg": 0.0,
		"done": 0, "a": 0.0, "b": 0.0, "c": 0.0, "d": 0.0, "hand": 1, "src": null, "by": {}, "fig": null, "boss": m, "stone": stone_of(m)}
	m.mgr.perils.list.append(q)
	return q


## (bodyWhere) Where his body is now: at his place; slid forward in phase 3 (his eye before him, or lying where it slammed down: where
## blows reach him); coming forward as he slides; at an end of the stone as he gapes there in his shovel.
static func _body_where(S: Vector2, f) -> Vector2:
	if f.ph == 3 and f.mode == "fight":
		var bs: Dictionary = f.body_struck()
		var at: Vector2 = bs["at"] if not bs.is_empty() else F.eye_home()
		return F.stone_to_world(S, at.x, at.y)
	if f.ph == 2 and f.mode == "change":
		var k := clampf((f.ph_t - F.CHANGE3["slide"]) / (F.CHANGE3["long"] - F.CHANGE3["slide"]), 0.0, 1.0)
		return F.stone_to_world(S, F.HIS_PLACE.x, F.HIS_PLACE.y + (F.eye_home().y - F.HIS_PLACE.y) * k)
	var sh = f.shovel
	if sh != null and sh.t >= F.SHOVEL["burst"] and sh.t < F.SHOVEL["back"] + 0.47:
		return F.stone_to_world(S, -F.SHOVEL["out"] if sh.end == "l" else F.STONE["w"] + F.SHOVEL["out"], F.STONE["d"] / 2.0)
	return F.stone_to_world(S, F.HIS_PLACE.x, F.HIS_PLACE.y)


## (Hero.step) A shove under way on the hero: carried so far over so long, stopped by the water's edge.
func _shove(hero, dt: float) -> void:
	var st = a1.get("shove")
	if st == null:
		return
	if not hero.alive:
		a1.erase("shove")
		return
	var k := minf(1.0, dt / maxf(1e-6, float(st["t"])))
	var s: Vector2 = st["d"] * k
	hero._slide(s)
	st["d"] -= s
	st["t"] = float(st["t"]) - dt
	if float(st["t"]) <= 0.0:
		a1.erase("shove")


## (handle) What the fight says happens, done.
func _handle(m, S: Vector2, ev: Array) -> void:
	var hero = m.mgr.hero
	var f = a1["fight"]
	for e in ev:
		match str(e["t"]):
			"hurt":
				m.mgr.used["colossus_hurt_" + str(e["by"])] = m.mgr.used.get("colossus_hurt_" + str(e["by"]), 0) + 1
				blow(m, hero, float(e["mult"]))
				if (float(e["du"]) != 0.0 or float(e["dv"]) != 0.0) and hero.life > 0.0:
					var o := F.stone_to_world(S, 0.0, 0.0)
					var to := F.stone_to_world(S, float(e["du"]), float(e["dv"]))
					a1["shove"] = {"d": to - o, "t": maxf(0.05, float(e["secs"]))}
			"armUp":
				_arm_up(m, S, f, int(e["id"]))
			"flasks":
				if m.mgr.loot != null:
					m.mgr.loot.potions = m.mgr.loot.POTIONS
					m.mgr.loot.say("Flasks refilled", MSG_LIFE)
			"change", "phase":
				m.life = m.max_life
		_sounds(m, f, e)
		_shake(hero, str(e["t"]))
		# (shot mode: what the fight has made, by its own names)
		var named := _named(e)
		if named != "":
			m.mgr.used[named] = m.mgr.used.get(named, 0) + 1


## The fight's beats as the checks name them ("" none).
static func _named(e: Dictionary) -> String:
	match str(e["t"]):
		"phase":
			return "colossus_phase%d" % int(e["ph"])
		"change":
			return "colossus_change%d" % int(e["to"])
		"armUp", "armDies", "warn", "slam", "smashWarn", "smash", "crash", "burst", "hook", "twitch", "snap", "gazeWarn", "bileWarn", "bile", "eyeWarn", "eyeSlam", "rainWarn", "grip", "flasks", "won", "drag", "sink":
			return "colossus_" + str(e["t"])
	return ""


## (handle, the screen's shakes at the art's beats)
static func _shake(hero, t: String) -> void:
	var by := {"slam": 8.0, "smash": 6.0, "burst": 9.0, "snap": 10.0, "grip": 7.0, "eyeSlam": 9.0, "rain": 3.0, "crash": 7.0, "retch": 4.0, "bile": 8.0, "gaze": 9.0}
	if by.has(t):
		hero.kick(by[t])


## (handle 'armUp') A tentacle bursting up: a monster of his kind where its root is, its life its phase's share of his.
func _arm_up(m, S: Vector2, f, id: int) -> void:
	var a = f.arm_of(id)
	if a == null:
		return
	var arms: Dictionary = a1.get("arms", {})
	a1["arms"] = arms
	var old = arms.get(id)
	if old != null and is_instance_valid(old) and not old.dead:
		return
	var p := F.stone_to_world(S, a.u, -F.ROOT_OUT)
	# (its phase's share of a bar: raised as he changes, the next phase's)
	var ph: int = f.ph + 1 if f.mode == "change" else f.ph
	var life: float = maxf(1.0, roundf(m.max_life * float(F.LIFE[ph])))
	var t = m.get_script().new()
	t.mgr = m.mgr
	t.setup({"kind": "eye", "id": 900000 + id, "name": str(m.def.get("name", "The Drowned Eye")), "x": p.x, "y": p.y, "fx": -sqrt(0.5), "fy": -sqrt(0.5),
		"r": F.ARM["r"], "life": life, "maxLife": life, "dmgMin": m.dmg_min, "dmgMax": m.dmg_max, "speed": 0.0, "packId": -1, "boss": false,
		"champion": false, "elite": false, "xp": m.xp, "seed": randf()}, m.def, m.art)
	t.h2.a1["arm"] = id
	t.h2.a1["armOf"] = f
	t.state = "chase"
	m.mgr.stands.add_child(t)
	m.mgr.list.append(t)
	arms[id] = t


## (sounds) HIS SOUNDS, each at its beat, as the game plays it (its set moves whole from their frame 0).
static func _sounds(m, f, e: Dictionary) -> void:
	var rec := func(name: String, vol: float) -> void: m.mgr.sfx.play(name, linear_to_db(vol))
	match str(e["t"]):
		"phase":
			if int(e["ph"]) == 1:
				rec.call("colossus_wake", 1.0)
		"armUp":
			# (phase 1's are in his waking's sound, the three of his entrance in its: only those that come back up after a shovel)
			if f.ph != 1:
				rec.call("colossus_tentacle", 0.9)
		"change":
			if int(e["to"]) == 2:
				rec.call("colossus_entrance", 1.0)
		"slide":
			rec.call("colossus_pour", 1.0)
			rec.call("colossus_slide", 1.0)
		"warn", "smashWarn":
			rec.call("colossus_tentacle_coil", 0.8)
		"slam":
			rec.call("colossus_tentacle_slam", 1.0)
		"drag":
			rec.call("colossus_tentacle_drag", 0.7)
		"smash":
			rec.call("colossus_water_slam", 1.0)
			rec.call("colossus_wave", 0.9)
		"crash":
			rec.call("colossus_wave_crash", 1.0)
		"armDies":
			rec.call("colossus_tentacle_death", 0.9)
		"burst":
			rec.call("colossus_burst", 1.0)
			rec.call("colossus_roar", 1.0)
		"scrape":
			rec.call("colossus_tentacle_scrape", 0.8)
		"twitch":
			rec.call("colossus_growl", 0.9)
		"snap":
			rec.call("colossus_snap", 1.0)
		"bileWarn":
			rec.call("colossus_bile", 1.0)
		"gazeWarn":
			rec.call("colossus_gaze", 1.0)
		"eyeWarn":
			rec.call("colossus_eyeslam", 1.0)
		"rain":
			rec.call("colossus_bolt", 0.8)


## (game.ts damageMonster, his voice as he is hurt: his eye struck, `colossus_eye_hurt`, on a big blow, no oftener than every 2.5 s)
func hurt_voice(m, dmg: float, crit: bool) -> void:
	if not a1.has("arm") and (crit or dmg >= m.max_life * 0.04):
		m.mgr.voice("colossus_eye_hurt", 2.5, linear_to_db(0.9))


## (died) A tentacle killed: the fight told. He killed: the fight won, his death's own sound whole from the killing blow, and his death
## played on his fight's mark from now.
func died(m) -> void:
	if a1.has("arm"):
		var boss = boss_of(m.mgr)
		var S := stone_of(m)
		if boss != null and S != Vector2.INF:
			boss.h2._handle(boss, S, boss.h2.a1["fight"].arm_killed(int(a1["arm"])))
		return
	var f = a1.get("fight")
	if f == null:
		return
	f.body_killed()
	m.mgr.sfx.play("colossus_death", 0.0)
	m.mgr.used["colossus_death"] = m.mgr.used.get("colossus_death", 0) + 1
	var fp := _fight_mark(m)
	fp["a"] = 1.0
	fp["c"] = fp["t"]


## (peril) HIS DEATH, on his fight's mark: kept by the hero while it plays; the screen shaken at its beats; gone when it is done. A
## step of the mark; false: it is gone.
static func step_mark(P, p: Dictionary, dt: float) -> bool:
	var hero = P.hero
	if hero != null:
		p["x"] = hero.world.x
		p["y"] = hero.world.y
	if float(p["a"]) != 1.0:
		var b = p.get("boss")
		return b != null and is_instance_valid(b)
	var s := float(p["t"]) - float(p["c"])
	for q in F.DEATH["shakes"]:
		var at: float = float(q[0]) / 30.0
		if s >= at and s - dt < at + 1e-9 and hero != null:
			hero.kick(float(q[1]))
	return s < float(F.DEATH["long"])


## (the checks) His fight brought to its last phase at once, his tentacles gone, so that a blow can end it as the checks strike a
## boss dead (main.gd _d_kill).
func to_the_end(m) -> void:
	var f = a1.get("fight")
	var S := stone_of(m)
	if S == Vector2.INF:
		return
	if f == null:
		a1["fight"] = F.new()
		f = a1["fight"]
	if f.mode == "idle":
		f.begin()
	f.wake_t = -1.0
	for t in a1.get("arms", {}).values():
		if is_instance_valid(t) and not t.dead:
			t.dead = true
			t.queue_free()
	f.arms = []
	f.shovel = null
	f.waves = []
	f.body2 = null
	f.ph = 3
	f.mode = "fight"
	f.ph_t = 0.0
	m.life = m.max_life
	m.state = "chase"
	m.world = _body_where(S, f)
