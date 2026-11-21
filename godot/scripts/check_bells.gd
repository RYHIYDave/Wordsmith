## CHECKS: THE BELLS, the city floors' event (act2/bells.gd; game/bells.ts), `--only=bells` (`--floor=N`, 11 by default): the bells
## asleep where the plan lays them, the Hush's ground; the Muffled Bell struck (the Hush pours out, every bell awake, the clock);
## the Hush raising the floor's own round him in it; each bell rung by a blow (knocking back what is near, chipping the Hush, the
## tough one called); all rung, won (the Hush shatters with what it raised, the loot bursting out of the last bell, the clapper
## the first time; the bells ringing out and hanging still); then, come again, the clock run out (the Hush lifts). A line a step
## (BELLS nn OK or WRONG), pictures at the main ones.
extends RefCounted

var M
var h
var B
var n := 0
var bad: Array = []
var dir := ""
var shot := 0
var depth := 11


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("BELLS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/b%d_%02d_%s.png" % [dir, depth, shot, name])


## (as the floors' own checks keep him: nothing strikes him down while he looks)
func _run(secs: float, until := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		# (a word come by is not pressed on him here: the gear screen it opens holds the game, loot.gd _offer)
		M.loot.offer = ""
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


func _said(start: String) -> String:
	for m in M.loot.msgs:
		if str(m["text"]).begins_with(start):
			return str(m["text"])
	return ""


func _floor() -> void:
	await M.go_to("floor%d" % depth, "down")
	await _run(1.2)
	if M.sight != null:
		M.sight.see_all()
	# (the floor's own put away: what is seen is the Hush's)
	for o in M._monsters.list:
		if is_instance_valid(o):
			o.queue_free()
	await _run(0.1)


func run(main, hero, out: String, floor_n: int) -> void:
	M = main
	h = hero
	dir = out
	depth = floor_n if floor_n >= 11 else 11
	B = M.bells
	var loot = M.loot
	loot.level = 30
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.derive()
	h.walked = 50.0
	h.unhurt = false
	M.quest1115.clapper = "asked"
	await _floor()
	await _asleep()
	await _started()
	await _rising()
	await _rung()
	await _again_lost()
	print("BELLS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])


func _asleep() -> void:
	var plan: Dictionary = B.D.get("plan", {}) if B.on() else {}
	var have := 0
	for k in B.states.size():
		if M.look.has_variant("bell%d" % k):
			have += 1
	_line(B.phase == "asleep" and B.bells_n() >= 4 and B.first > 0 and have == B.bells_n() and M.look.has_variant("muffled"),
		"floor %d: the Bells asleep, %d bells and the Muffled Bell at %s; the Hush's ground %d tiles round %s (r %.1f); each bell's states in the look (%d of %d)" % [depth, B.bells_n(), Vector2(plan.get("muffled", {}).get("x", 0), plan.get("muffled", {}).get("y", 0)), B.first, Vector2(plan.get("hush", {}).get("x", 0), plan.get("hush", {}).get("y", 0)), float(plan.get("hush", {}).get("r", 0)), have, B.bells_n()])


func _started() -> void:
	var m: Dictionary = B.D["plan"]["muffled"]
	var at := Vector2(m["x"], m["y"])
	# THE MUFFLED BELL MADE EASIER TO SEE (render/bell_mark.ts): seen from a few tiles off, its name over it, its rings, its light,
	# its cyan mark on the map
	h.world = M._spot_near(at, 4.5, h.world)
	await _run(3.2)
	await _snap("the_muffled_bell_marked")
	var marks: Array = B.on_map(floori(at.x), floori(at.y), 8, func(_a, _b, _c, _d): pass, func(_x, _y): return true)
	var cyan: bool = not marks.is_empty() and (marks[0][2] == B.MARK_CYAN or marks[0][2] == B.MARK_HI) and int(marks[0][3]) == 3
	_line(B.marked() and B._rings != null and B._tag != null and cyan, "the Muffled Bell marked while it is gagged: its name and STRIKE TO BEGIN over it, its rings and its light, its mark on the map cyan and a size bigger (%s)" % cyan)
	h.world = M._spot_near(at, 1.6, h.world)
	await _run(0.6)
	await _snap("the_muffled_bell")
	# (a blow far off does nothing; one at it starts it)
	B.struck(at + Vector2(6, 0), 1.0)
	var still: bool = B.phase == "asleep"
	h.face = (at - h.world).normalized()
	B.struck(at, 1.0)
	await _run(0.25)
	await _snap("the_hush_pours_out")
	var awake: bool = B.states.all(func(s): return s == 1)
	_line(still and B.phase == "on" and B.muffled == 1 and awake and absf(B.limit - 15.0 * B.bells_n()) < 0.01 and _said("The Hush pours out of the Muffled Bell") != "",
		"a blow away from it nothing (%s); at the Muffled Bell: the Hush pours out (%s), every bell awake (%s), the clock %.0f s (15 a bell); '%s'" % [still, B.phase, awake, B.limit, _said("The Hush pours out")])
	await _run(1.0)
	await _snap("the_hush_over_its_ground")


func _rising() -> void:
	var before: int = B.risen
	# (in the Hush, where it raises its own round him)
	var hu: Dictionary = B.D["plan"]["hush"]
	h.world = M._spot_near(Vector2(hu["x"], hu["y"]), 0.0, h.world)
	await _run(6.0, func(): return B.risen - before >= 2)
	# (ARRIVALS: up out of rifts in the floor, nothing reaching them while they come; out in a second)
	await _run(0.55)
	var rifts: int = M.fx.rifts.size()
	var coming: int = B.ids.filter(func(m): return is_instance_valid(m) and m.state == "rise").size()
	await _snap("up_out_of_rifts")
	await _run(1.0)
	var out: int = B.ids.filter(func(m): return is_instance_valid(m) and not m.dead and m.state != "rise").size()
	_line(rifts >= 1 and coming >= 1 and out >= 2, "they come up out of rifts in the floor (%d rifts open, %d still coming up), out and in the fight a second on (%d)" % [rifts, coming, out])
	var inside := 0
	for m in B.ids:
		if is_instance_valid(m) and B.in_hush(m.world.x, m.world.y):
			inside += 1
	await _snap("the_hush_raises")
	_line(B.risen - before >= 2 and inside >= 1, "the Hush raises the floor's own round him in it: %d risen (%d still in it), %d at once to start" % [B.risen - before, inside, int(B.U["size0"])])


func _rung() -> void:
	var plan: Dictionary = B.D["plan"]
	var nb: int = B.bells_n()
	var left0: int = B.left
	var tough_ok := true
	var knocked := true
	var won_said := ""
	var raised: Array = []
	var clap := 0
	var lying := 0
	for i in nb:
		var b: Dictionary = plan["bells"][i]
		var at := Vector2(b["x"], b["y"])
		h.world = M._spot_near(at, 1.6, h.world)
		await _run(0.3)
		# (one of the Hush beside the bell, to be knocked back)
		var near = null
		for m in B.ids:
			if is_instance_valid(m) and not m.dead:
				near = m
				break
		var was := 0.0
		if near != null and i < nb - 1:
			near.world = M._spot_near(at, 1.5, near.world)
			was = near.world.distance_to(at)
		var ids0: int = B.ids.filter(func(m): return is_instance_valid(m)).size()
		B.ids = B.ids.filter(func(m): return is_instance_valid(m))
		if i == 0:
			await _snap("before_the_first_bell")
		if i == nb - 1:
			raised = B.ids.filter(func(m): return is_instance_valid(m) and not m.dead)
		B.struck(at, 1.0)
		await _run(0.2)
		# (the moment it is won, before he picks anything up: the clapper lying, the line said)
		if i == nb - 1:
			won_said = _said("Every bell peals at once")
			clap = M.quest1115._things.filter(func(t): return t["what"] == "clapper").size()
			lying = M.loot._drops.size()
		if near != null and i < nb - 1 and is_instance_valid(near) and not near.dead:
			knocked = knocked and near.world.distance_to(at) > was + 0.5
		if i < nb - 1:
			var lead = B.ids[ids0] if B.ids.size() > ids0 else null
			tough_ok = tough_ok and lead != null and str(lead.rarity) == "leader" and absf(lead.max_life - float(B.D["tough"][i][0]["maxLife"])) < 1.0
		if i == 0:
			await _snap("the_first_bell_rung")
			_line(B.rung_n() == 1 and B.states[0] == 2 and B.left < left0 and _said("A bell rings: 1 of %d" % nb) != "",
				"the first bell struck: it rings (1 of %d), the Hush chipped back round it (%d tiles to %d); '%s'" % [nb, left0, B.left, _said("A bell rings")])
		if i == nb - 2:
			await _snap("a_tough_one")
		# (what the Hush raised kept off him a while: only its own are checked)
		for m in B.ids:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) < 3.0:
				m.world = M._spot_near(h.world, 6.0, m.world)
	_line(tough_ok, "each bell but the last calls a tough one, a yellow pack's leader of the floor's guard kind, tougher each time, with what comes with it (%s)" % [str(B.D["tough"].map(func(g): return "%s %d + %d" % [g[0]["name"], int(g[0]["maxLife"]), g.size() - 1]))])
	_line(knocked, "the ring knocks back what is near the bell")
	var risen_alive := 0
	var others: Array = []
	await _run(0.3)
	for m in raised:
		if is_instance_valid(m) and not m.dead and m.state != "dead":
			risen_alive += 1
	# (what is up that the Hush did not raise: the halves a Splitting one breaks into as it dies, as in the game)
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not raised.has(m):
			others.append(m.title)
	await _snap("every_bell_peals")
	_line(B.phase == "won" and lying >= nb + 1 and risen_alive == 0 and clap == 1 and won_said != "",
		"all %d rung in time: won (%s), the Hush shattered with all it raised (%d of %d left up; up besides: %s), the loot burst out of the last bell (%d things lying), the clapper with it (%d); '%s'" % [nb, B.phase, risen_alive, raised.size(), others, lying, clap, won_said])
	await _run(4.3)
	await _snap("hanging_still")
	_line(B.states.all(func(s): return s == 3) and B.muffled == 3, "four seconds on, the bells ring out and hang still (%s, the Muffled Bell %d)" % [B.states, B.muffled])


func _again_lost() -> void:
	await _floor()
	var m: Dictionary = B.D["plan"]["muffled"]
	B.struck(Vector2(m["x"], m["y"]), 1.0)
	await _run(0.2)
	B.ring(0)
	B.t = B.limit - 0.05
	await _run(0.5)
	await _snap("the_hush_lifts")
	var still := true
	for i in B.states.size():
		still = still and (B.states[i] == 2 if i == 0 else B.states[i] == 0)
	_line(B.phase == "lost" and still and _said("The Hush lifts. The bells fall silent.") != "", "come again, the clock run out: the Hush lifts (%s), the bells not rung silent again (%s); '%s'" % [B.phase, B.states, _said("The Hush lifts")])
