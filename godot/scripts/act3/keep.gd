## FLOOR 19, THE KEEP: ITS PORTCULLISES (game/act2/keep_rules.ts; game.ts updatePortcullises). His doc, level 19: "portcullises that
## slam down to cut a hall in two." (Its other hazard, the murder holes dropping pitch, is the floor's trap: traps.gd.)
##   A portcullis, a row of tiles right across a hall (the export's land.json keep), stands up a while (9 s; its own share of it first,
##   so the floor's do not all fall together; one further than 18 tiles from him waits up); SHAKES in its slot (the warning, 1.3 s);
##   falls (0.15 s) and SLAMS: whatever is under it struck (18% of his life, 30% of a monster's; a boss only thrown) and thrown clear to
##   the nearer side; it stays down 4.5 s, its tiles not walked by him or by anything, and is wound up again (0.6 s). Its pictures are
##   the look's states `port<j>`: up, the warning, falling, slammed, down.
extends Node

const PORT := {"up": 9.0, "warn": 1.3, "fall": 0.15, "slam": 0.35, "down": 4.5, "rise": 0.6, "hero": 0.18, "mob": 0.3, "near": 18.0}
const NEXT := {"up": "warn", "warn": "fall", "fall": "slam", "slam": "down", "down": "rise", "rise": "up"}
## (the look's state's step each phase shows: up, the warning, falling, slammed, down; wound up as falling, run back)
const STEP := {"up": 0, "warn": 1, "fall": 2, "slam": 3, "down": 4, "rise": 2}
## (scene_sounds.ts PORT_SOUND_LEAD: how long before the slam its sound begins)
const SOUND_LEAD := 0.5

var main
## [{x, y, n, along_x, phase, t, state}]
var ports: Array = []


func on() -> bool:
	return not ports.is_empty()


func enter(where: String) -> void:
	ports = []
	if main.is_home(where) or main.map == null or main.map.land == null or main.map.land.get("keep") == null:
		return
	var names := {}
	if main.look != null:
		var V: Dictionary = main.look.data.get("variants", {})
		for name in V:
			if str(V[name].get("kind", "")) == "port":
				names[Vector2i(int(V[name]["at"]["x"]), int(V[name]["at"]["y"]))] = name
	var i := 0
	for q in main.map.land["keep"].get("portcullises", []):
		# (each its own share of its first wait, so they do not all fall together)
		ports.append({"x": int(q["x"]), "y": int(q["y"]), "n": int(q["n"]), "along_x": bool(q["alongX"]), "phase": "up",
			"t": float(PORT["up"]) * (0.35 + 0.6 * fposmod(i * 0.618, 1.0)), "state": names.get(Vector2i(int(q["x"]), int(q["y"])), "")})
		i += 1


## The tiles of a portcullis's row.
func tiles_of(s: Dictionary) -> Array:
	var out: Array = []
	var w: int = main.map.w
	for k in int(s["n"]):
		out.append(int(s["y"]) * w + int(s["x"]) + k if s["along_x"] else (int(s["y"]) + k) * w + int(s["x"]))
	return out


## Whether `p` is under a portcullis's row.
static func under(s: Dictionary, p: Vector2) -> bool:
	var tx := floori(p.x)
	var ty := floori(p.y)
	if s["along_x"]:
		return ty == int(s["y"]) and tx >= int(s["x"]) and tx < int(s["x"]) + int(s["n"])
	return tx == int(s["x"]) and ty >= int(s["y"]) and ty < int(s["y"]) + int(s["n"])


## Where something under a row is thrown to: out to the nearer side of it, across the row.
static func clear_of(s: Dictionary, p: Vector2) -> Vector2:
	if s["along_x"]:
		return Vector2(p.x, float(s["y"]) - 0.4 if p.y < float(s["y"]) + 0.5 else float(s["y"]) + 1.4)
	return Vector2(float(s["x"]) - 0.4 if p.x < float(s["x"]) + 0.5 else float(s["x"]) + 1.4, p.y)


## Whether a portcullis is down across its hall (slammed or down: its tiles not walked).
static func is_down(s: Dictionary) -> bool:
	return s["phase"] == "slam" or s["phase"] == "down"


func _show(s: Dictionary) -> void:
	if str(s["state"]) == "" or main.look == null:
		return
	var k: int = STEP[s["phase"]]
	if k == 0:
		main.look.clear_variant(s["state"])
	else:
		main.look.show_variant(s["state"], k / 4.0)


func _process(dt: float) -> void:
	if ports.is_empty() or main == null or get_tree().paused or main.hero == null:
		return
	var h = main.hero
	var M = main.map
	for s in ports:
		# (one far from him stands up, and waits: it does not fall unseen)
		var mid := Vector2(float(s["x"]) + float(s["n"]) / 2.0, float(s["y"]) + 0.5) if s["along_x"] else Vector2(float(s["x"]) + 0.5, float(s["y"]) + float(s["n"]) / 2.0)
		if s["phase"] == "up" and h.world.distance_to(mid) > float(PORT["near"]):
			continue
		# (THE FLOORS' SCENE SOUNDS, game.ts updatePortcullises: its sound has the chain falling first and the slam half a second in,
		# so it is begun that long before the slam, once a fall, the louder the nearer him)
		var to_slam := float(s["t"]) + float(PORT["fall"])
		if s["phase"] == "warn" and to_slam > SOUND_LEAD and to_slam - dt <= SOUND_LEAD:
			var near := clampf(1.0 - (h.world.distance_to(mid) - 3.0) / (float(PORT["near"]) - 3.0), 0.0, 1.0)
			main.sfx.play("portcullis", linear_to_db(0.3 + 0.6 * near))
		s["t"] = float(s["t"]) - dt
		if float(s["t"]) > 0.0:
			continue
		s["phase"] = NEXT[s["phase"]]
		s["t"] = PORT[s["phase"]]
		_show(s)
		if s["phase"] == "slam":
			for i in tiles_of(s):
				M.walk[i] = 0
			_slam(s)
		elif s["phase"] == "up":
			var held := {}
			for p in M.props:
				if p.get("solid", false):
					held[int(p["ty"]) * M.w + int(p["tx"])] = true
			for i in tiles_of(s):
				if not held.has(i):
					M.walk[i] = 1


## It slams: whatever is under it struck and thrown clear (a boss only thrown).
func _slam(s: Dictionary) -> void:
	var mid := Vector2(float(s["x"]) + float(s["n"]) / 2.0, float(s["y"]) + 0.5) if s["along_x"] else Vector2(float(s["x"]) + 0.5, float(s["y"]) + float(s["n"]) / 2.0)
	# (the slam is the scene sound's own, begun with its chain: _process)
	main.fx.event({"t": "spark", "x": mid.x, "y": mid.y, "el": "phys", "n": 10})
	var h = main.hero
	if h.world.distance_to(mid) < 12.0:
		h.kick(3.0)
	if h.alive and under(s, h.world):
		h.world = clear_of(s, h.world)
		if h._act != "lunge" and h._invuln <= 0.0:
			h.hurt_by(h.max_life * float(PORT["hero"]), "phys", [], {}, null, h.world)
	if main._monsters == null:
		return
	for m in main._monsters.list:
		if not is_instance_valid(m) or m.dead or not under(s, m.world):
			continue
		m.world = clear_of(s, m.world)
		if not m.boss:
			m.hurt(maxf(1.0, roundf(m.max_life * float(PORT["mob"]))))
