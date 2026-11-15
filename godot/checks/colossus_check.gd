## SHOT MODE, FLOOR 10'S BOSS, THE SWAMP COLOSSUS (--only=boss --floor=10; main.gd _boss_shots hands floor 10 here): his whole fight
## as the game has it, a picture and a line at each step, and the sum, `BOSS floor 10`:
##   his ground come into (he wakes, his line, his name across the screen); the landing walked to, the hero carried across to the
##   stone's jetty, the picture drawn back; onto the stone: the still water, the boil, his two tentacles bursting up, his bar; PHASE 1,
##   a slam's line laid, the slam, the hero struck; both tentacles killed, the flasks refilled; HIS ENTRANCE, its three tentacles
##   bursting up; PHASE 2, each of its moves as it first comes (the slams, the water slams and their waves, the crash, the shovel, its
##   hooks, his snap, the bile arc and its pool, the gaze), the hero struck by them; its three killed, the flasks refilled; HIS SLIDE
##   and his grip; PHASE 3, his eye's gaze and slam, the siege's bolts, his eye struck; him struck dead, his death played; the way
##   home waking and open. The hero is unhurt in shot mode: each blow that would have struck him is told, and counted.
extends RefCounted

const F := preload("res://scripts/act1/colossus_fight.gd")
const Art := preload("res://scripts/act1/colossus_art.gd")

static var _bad: Array = []
static var _n := 0
static var _struck := {}


static func _line(name: String, ok: bool, what: String) -> void:
	_n += 1
	if not ok:
		_bad.append(name)
	print("BOSS10 %02d %s %s: %s" % [_n, name, "ok" if ok else "WRONG", what])


static func _boss(M):
	for m in M._monsters.list:
		if is_instance_valid(m) and m.boss:
			return m
	return null


static func _arms(M) -> Array:
	var out: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.boss and m.kind == "eye" and m.h2 != null and m.h2.a1.has("arm"):
			out.append(m)
	return out


## Frames until `cond` holds, or `most` seconds; how long it took.
static func _until(M, cond: Callable, most: float) -> float:
	var t := 0.0
	while not cond.call() and t < most:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	return t


## A picture, once every group of his pictures wanted is here (a second at most).
static func _pic(M, path: String) -> void:
	var t := 0.0
	while t < 1.5:
		var all := true
		for g in Art.held:
			for i in Art.held[g]["paths"].size():
				if Art.held[g]["sheets"][i] == null and ResourceLoader.load_threaded_get_status(Art.held[g]["paths"][i]) == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
					all = false
		if all:
			break
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	await M._snap(path)


static func _put(M, S: Vector2, u: float, v: float) -> void:
	M.hero.world = F.stone_to_world(S, u, v)


static func _used(M, k: String) -> int:
	return int(M._monsters.used.get(k, 0))


static func run(M, h, dir: String) -> void:
	_bad = []
	_n = 0
	var tag := dir + "/b10_"
	M.go_to("floor10", "down")
	await M._wait(1.8)
	var b = _boss(M)
	var map = M.map
	if b == null or map.stone == null or map.landing == null or M.stone == null:
		print("BOSS floor 10: no boss (%s), stone (%s) or landing (%s)" % [b != null, map.stone != null, map.landing != null])
		return
	var S := Vector2(float(map.stone["cx"]), float(map.stone["cy"]))
	var L := Vector2(float(map.landing["x"]), float(map.landing["y"]))
	var f = null
	# --- his ground: he wakes, his line, his name ---
	h.world = M._free_near(L + Vector2(2.6, 0.0))
	await M._wait(1.2)
	await _pic(M, tag + "01_his_ground.png")
	_line("his_ground", M.stone.met and b.state != "sleep" and b._said != "" and not M._hud.card.is_empty(),
		"his ground come into at (%.1f, %.1f): he wakes (%s), says \"%s\", %s across the screen" % [h.world.x, h.world.y, b.state, b._said, M._hud.card.get("name", "no name")])
	# --- the landing: carried across to the stone's jetty ---
	h.world = L
	await _until(M, func(): return M.stone.on_stone(), 2.5)
	await M._wait(1.6)
	var p := F.world_to_stone(S, h.world.x, h.world.y)
	await _pic(M, tag + "02_carried.png")
	_line("carried", M.stone.on_stone() and absf(p.x - 8.5) < 0.05 and absf(p.y - 13.4) < 0.05 and h.face.distance_to(Vector2(-sqrt(0.5), -sqrt(0.5))) < 0.01 and M.stone.zoom < 0.9,
		"the landing walked to: he is carried across, set down on the jetty at (u %.2f, v %.2f) facing the stone; the picture drawn back (%.3f)" % [p.x, p.y, M.stone.zoom])
	# --- onto the stone: his waking ---
	M._monsters.used = {}
	_put(M, S, 8.5, 6.5)
	await M._wait(0.2)
	f = b.h2.a1.get("fight")
	_line("fight_begins", f != null and f.mode == "fight" and f.ph == 1 and f.wake_t >= 0.0, "onto the stone: the fight begins, phase 1, the water still")
	await _until(M, func(): return f.wake_t < 0.0 or f.wake_t >= 0.9, 2.0)
	await _pic(M, tag + "03_still.png")
	await _until(M, func(): return f.wake_t < 0.0 or f.wake_t >= 3.4, 4.0)
	await _pic(M, tag + "04_boil.png")
	await _until(M, func(): return f.wake_t < 0.0 and not f.arms.is_empty() and f.arms.all(func(a): return a.state != "rise"), 4.0)
	await M._wait(0.2)
	await _pic(M, tag + "05_tentacles_up.png")
	var arms := _arms(M)
	var each := roundf(b.max_life * 0.5)
	_line("phase1_tentacles", arms.size() == 2 and arms.all(func(t): return t.max_life == each) and b.h2.hittable(b) and absf(b.life - b.max_life) < 1.0,
		"his two tentacles burst up (%d, each %.0f of his %.0f), his bar up (%.0f of %.0f)" % [arms.size(), arms[0].max_life if arms.size() > 0 else 0.0, b.max_life, b.life, b.max_life])
	# --- phase 1: a slam ---
	await _until(M, func(): return _used(M, "colossus_warn") > 0, 8.0)
	await M._wait(0.45)
	await _pic(M, tag + "06_p1_slam_warn.png")
	await _until(M, func(): return _used(M, "colossus_slam") > 0, 3.0)
	await M._wait(0.12)
	await _pic(M, tag + "07_p1_slam.png")
	await M._wait(0.6)
	await _pic(M, tag + "08_p1_slam_lying.png")
	_line("phase1_slam", _used(M, "colossus_slam") > 0, "a slam: its line laid toward him, the hit, lying along it (slams %d, the hero struck by them %d)" % [_used(M, "colossus_slam"), _used(M, "colossus_hurt_slam")])
	# --- both killed: the flasks refilled ---
	M.loot.potions = 1
	var kill_all := func() -> bool:
		for q in _arms(M):
			if not q.dead:
				q.hurt(q.life + 1.0)
		return f.mode != "fight"
	await _until(M, kill_all, 12.0)
	await M._wait(0.4)
	await _pic(M, tag + "09_p1_killed.png")
	_line("phase1_killed", f.mode == "between" and M.loot.potions == M.loot.POTIONS and M._wu_said("Flasks refilled") != "",
		"both tentacles killed (%s): the flasks refilled (%d of %d), \"%s\"" % [f.mode, M.loot.potions, M.loot.POTIONS, M._wu_said("Flasks refilled")])
	# --- his entrance ---
	await _until(M, func(): return f.mode == "change", 4.0)
	for q in [[1.2, "10_entrance_a"], [4.2, "11_entrance_b"], [7.7, "12_entrance_tentacles"]]:
		await _until(M, func(): return f.mode != "change" or f.ph_t >= float(q[0]), 9.0)
		await _pic(M, tag + q[1] + ".png")
	await _until(M, func(): return f.ph == 2 and f.mode == "fight", 4.0)
	await M._wait(0.3)
	await _pic(M, tag + "13_phase2.png")
	arms = _arms(M).filter(func(t): return not t.dead)
	each = roundf(b.max_life / 3.0)
	_line("entrance", f.ph == 2 and f.mode == "fight" and arms.size() == 3 and arms.all(func(t): return t.max_life == each) and absf(b.life - b.max_life) < 1.0,
		"his entrance (9 s), his three tentacles bursting up (%d, each %.0f); phase 2, his bar full again" % [arms.size(), arms[0].max_life if arms.size() > 0 else 0.0])
	# --- phase 2: each of its moves as it first comes ---
	var want := ["colossus_slam", "colossus_smash", "colossus_crash", "colossus_sink", "colossus_burst", "colossus_hook", "colossus_snap", "colossus_bile", "colossus_gazeWarn"]
	var shots := {"colossus_warn": [0.45], "colossus_slam": [0.12], "colossus_smashWarn": [0.5], "colossus_smash": [0.35, 1.3], "colossus_crash": [0.2, 1.2],
		"colossus_sink": [0.5], "colossus_burst": [0.3], "colossus_hook": [0.9], "colossus_twitch": [0.1], "colossus_snap": [0.05], "colossus_bileWarn": [0.8],
		"colossus_bile": [0.05, 1.0], "colossus_gazeWarn": [0.6, 1.4]}
	var seen := {}
	# (what phase 1 made is not counted again)
	var base: Dictionary = M._monsters.used.duplicate()
	var pending: Array = []
	var t := 0.0
	var shov := ""
	while t < 70.0 and not want.all(func(k): return seen.has(k)):
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		# (where he stands: in the middle of the stone; in a shovel, in the hooks' way and then by his maw)
		if f.shovel != null:
			if shov == "":
				shov = f.shovel.end
				_put(M, S, 12.0 if shov == "l" else 5.0, 5.5)
		elif shov != "":
			shov = ""
			_put(M, S, 8.5, 6.5)
		for k in shots:
			if not seen.has(k) and _used(M, k) > int(base.get(k, 0)):
				seen[k] = true
				for d in shots[k]:
					pending.append([t + float(d), "%s_%.1f" % [k.substr(9), d]])
		var keep: Array = []
		for q in pending:
			if t >= float(q[0]):
				await _pic(M, tag + "2%s.png" % q[1])
			else:
				keep.append(q)
		pending = keep
	for q in pending:
		await _pic(M, tag + "2%s.png" % q[1])
	var missing := want.filter(func(k): return not seen.has(k))
	_line("phase2_moves", missing.is_empty(), "phase 2 over %.0f s: made %s%s" % [t, ", ".join(seen.keys().map(func(k): return "%s %d" % [k.substr(9), _used(M, k) - int(base.get(k, 0))])), ("; not made: " + ", ".join(missing)) if not missing.is_empty() else ""])
	# --- its three killed: the flasks refilled; his slide ---
	await _until(M, func(): return f.shovel == null, 14.0)
	_put(M, S, 8.5, 6.5)
	M.loot.potions = 1
	M.loot.msgs.clear()
	await _until(M, kill_all, 14.0)
	await M._wait(0.3)
	await _pic(M, tag + "30_p2_killed.png")
	_line("phase2_killed", f.mode == "between" and M.loot.potions == M.loot.POTIONS and M._wu_said("Flasks refilled") != "",
		"its three tentacles killed (%s): the flasks refilled (%d of %d)" % [f.mode, M.loot.potions, M.loot.POTIONS])
	await _until(M, func(): return f.mode == "change", 4.0)
	for q in [[1.4, "31_slide_a"], [3.0, "32_slide_b"], [127.0 / 30.0 + 0.1, "33_grip"]]:
		await _until(M, func(): return f.mode != "change" or f.ph_t >= float(q[0]), 6.0)
		await _pic(M, tag + q[1] + ".png")
	await _until(M, func(): return f.ph == 3 and f.mode == "fight", 3.0)
	_line("slide", f.ph == 3 and f.mode == "fight" and _used(M, "colossus_grip") > 0 and absf(b.life - b.max_life) < 1.0 and (f.arms.is_empty() or f.arms.all(func(a): return a.state == "dead")),
		"his slide forward and his grip on the stone's edge; phase 3, his bar his own and full (%.0f of %.0f)" % [b.life, b.max_life])
	# --- phase 3: his eye's attacks, the bolts; his eye struck ---
	_put(M, S, 8.5, 5.5)
	var want3 := ["colossus_eyeWarn", "colossus_eyeSlam", "colossus_gazeWarn", "colossus_rainWarn"]
	var shots3 := {"colossus_eyeWarn": [0.6], "colossus_eyeSlam": [0.1, 1.0], "colossus_gazeWarn": [0.5, 1.4], "colossus_rainWarn": [0.7, 1.15]}
	var g0 := _used(M, "colossus_gazeWarn")
	seen = {}
	pending = []
	t = 0.0
	var hit_ok := false
	var life0: float = b.life
	while t < 25.0 and not (want3.all(func(k): return seen.has(k)) and hit_ok):
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		for k in shots3:
			var n: int = _used(M, k) - (g0 if k == "colossus_gazeWarn" else 0)
			if not seen.has(k) and n > 0:
				seen[k] = true
				for d in shots3[k]:
					pending.append([t + float(d), "%s_%.1f" % [k.substr(9), d]])
		# (his eye struck at rest, once the rest is seen)
		if not hit_ok and seen.size() >= 3 and f.eye == null and b.h2.reachable(b):
			b.hurt(50.0)
			await M._wait(0.12)
			hit_ok = not f.struck.is_empty() and b.life < life0
			await _pic(M, tag + "45_eye_struck.png")
		var keep: Array = []
		for q in pending:
			if t >= float(q[0]):
				await _pic(M, tag + "4%s.png" % q[1])
			else:
				keep.append(q)
		pending = keep
	missing = want3.filter(func(k): return not seen.has(k))
	_line("phase3_moves", missing.is_empty() and hit_ok, "phase 3 over %.0f s: made %s; his eye struck at rest flinches (%s, his life %.0f to %.0f)%s" % [t, ", ".join(seen.keys().map(func(k): return k.substr(9))), hit_ok, life0, b.life, ("; not made: " + ", ".join(missing)) if not missing.is_empty() else ""])
	# --- struck dead: his death; the way home ---
	var hurts := {}
	for k in M._monsters.used:
		if str(k).begins_with("colossus_hurt_"):
			hurts[str(k).substr(14)] = M._monsters.used[k]
	await _until(M, func(): return f.eye == null and b.h2.reachable(b), 4.0)
	b.hurt(1e9)
	await M._wait(0.05)
	var fp := {}
	for q in M._monsters.perils.list:
		if q.get("a1") == "eye:fight":
			fp = q
	_line("struck_dead", b.dead and f.mode == "won" and not fp.is_empty() and float(fp["a"]) == 1.0 and M.ways != null and M.ways.state == "opening",
		"struck dead: the fight won, his death begun on his fight's mark, the way home waking (%s)" % (M.ways.state if M.ways != null else "none"))
	# (the way home's line, heard as it opens while his death plays)
	var said := {"home": "", "at": -1.0}
	for q in [[0.7, "50_death_seize"], [1.3, "51_death_burst"], [1.9, "52_death_spray"], [4.0, "53_death_melt"], [4.6, "54_way_home_open"], [7.0, "55_death_sink"], [10.5, "56_death_still"]]:
		var upto := func() -> bool:
			if said["home"] == "" and M.ways.state == "open":
				said["home"] = M._wu_said(M.ways.HOME_OPEN)
				said["at"] = float(fp["t"]) - float(fp["c"])
			return fp.is_empty() or float(fp["t"]) - float(fp["c"]) >= float(q[0])
		await _until(M, upto, 12.0)
		await _pic(M, tag + q[1] + ".png")
	var home: String = said["home"]
	await _until(M, func(): return fp.is_empty() or float(fp["t"]) - float(fp["c"]) >= 12.6, 4.0)
	var gone := true
	for q in M._monsters.perils.list:
		if q.get("a1") == "eye:fight":
			gone = false
	await _pic(M, tag + "57_way_home.png")
	_line("way_home", M.ways.state == "open" and home != "" and gone and absf(float(said["at"]) - float(M.ways.ONWARD[10]["secs"])) < 0.25,
		"the way home open %.2f s after the killing blow (its film %.2f s): \"%s\"; his death over (its mark gone: %s)" % [said["at"], float(M.ways.ONWARD[10]["secs"]), home, gone])
	var struck_n := 0
	for k in hurts:
		struck_n += int(hurts[k])
	print("BOSS floor 10 (%s, %s): carried to the stone; phases 1, 2 and 3; the hero struck %d times (%s); the flasks refilled twice; his death and the way home; %d of %d steps as the game has them%s" % [b.kind, b.title, struck_n, ", ".join(hurts.keys().map(func(k): return "%s %d" % [k, hurts[k]])), _n - _bad.size(), _n, ("; not: " + ", ".join(_bad)) if not _bad.is_empty() else ""])
