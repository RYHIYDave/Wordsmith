## THE WAYS ON FROM A FLOOR (game/ways.ts, game.ts updateWays and the boss's death in `kill`; the layout's `ways`, as the
## game keeps them: tools/godot_export.ts).
##   THE STAIRWELL DOWN, in the boss's hall (floors 1 and 2): it opens in the floor when the boss dies, at the first of its
##     places clear of where he fell (2 tiles) and of where the hero stands (ways.ts stairFor); it breaks open over 3.5 s
##     (STAIR_OPENING), and then stepping onto its top step takes him down to the next floor. Its tiles past the top step are
##     walked on by nobody.
##   FLOOR 3'S DOOR OUT THE BACK OF HIS HALL (prison_way.ts): it unbars and swings open when the boss dies (DOOR_OPENING, its
##     film's length); open, walking into its doorway takes him down.
##   FLOOR 4'S CAVE (ways.ts placeCave): the wall over its mouth crumbles when the boss dies (CAVE_OPENING, 4.2 s); then
##     walking into the mouth takes him down.
##   FLOOR 5'S SHAFT: the cage comes down the shaft when the boss dies (SHAFT.down, 4.3 s); walking into it takes him up to
##     town ("Prison Level 5 cleared"; with the Meldstone already given, the town's gate unbarred as he comes in sight of it).
##   FLOORS 6 TO 10, THE DESCENT'S WAY ON (ways.ts ONWARD, layOnward, thrownTiles, onTakes; game.ts kill, updateWays, takeWay
##     'on'; the layout's `ways.a1` and `ways.onward`): at the far end of the boss's ground, leading on the way from where he
##     stood (its `dir`); what of it is solid already out of the walk grid (the export's own). It wakes as the boss dies and its
##     film plays (the quarry's blocks thrown down, the flock bursting from the nest, the slot's plug blasted out, the roots
##     withering, the causeway rising: ONWARD secs); then it is open, what it threw out lying solid where it fell (but never
##     where someone stands), and "The way on is open." (on the Fen, "The siege magic falters. The way home is open."); then
##     stepping onto its way in (`takes`, tiles in the way's own frame: along it, across it) takes him on, down the mountain to
##     the next floor, where he comes in at its start; from the tenth, the Fen, home: in the game to the camp inside Vellum's
##     gate, here (no floor 11 yet) through the town's gate ("The Sunken Fen, Level 10 cleared. The siege is broken.").
## Their pictures as they open are the look's own, recorded from the game state by state (look.gd `show_variant`; the way on's
## as the state "onward", where its look has it).
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")

const STAIR_OPENING := 3.5
const STAIR_WIDE := 1.25
const STAIR_CLEAR := 2.0
const CAVE_OPENING := 126.0 / 30.0
const SHAFT_DOWN := 129.0 / 30.0
## (ways.ts ONWARD, floors 6 to 10: its film's length; the tiles that take him on and those it throws out, [along, across])
const ONWARD := {
	6: {"secs": 112.0 / 30.0, "takes": [[0, 0], [1, 0]], "thrown": [[-1, -2], [0, -4], [0, 3], [-1, 1], [1, 2]]},
	7: {"secs": 120.0 / 30.0, "takes": [[-2, 0], [-1, 0], [0, 0]], "thrown": []},
	8: {"secs": 124.0 / 30.0, "takes": [[0, 0], [1, 0], [2, 0]], "thrown": []},
	9: {"secs": 126.0 / 30.0, "takes": [[0, 0], [1, 0], [2, 0], [3, 0]], "thrown": []},
	10: {"secs": 130.0 / 30.0, "takes": [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], "thrown": []},
	# (THE CITY: the Crier's grate; the Rat King's outfall, the postern, the stitched door, the great doors: a door's way in shut
	# till it opens, `shut_takes`)
	11: {"secs": 104.0 / 30.0, "takes": [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]], "thrown": []},
	12: {"secs": 116.0 / 30.0, "takes": [[0, 0]], "thrown": [[-1, -1]], "shut_takes": true},
	13: {"secs": 120.0 / 30.0, "takes": [[1, 0]], "thrown": [], "shut_takes": true},
	14: {"secs": 110.0 / 30.0, "takes": [[0, 0]], "thrown": [], "shut_takes": true},
	15: {"secs": 130.0 / 30.0, "takes": [[0, 0]], "thrown": [], "shut_takes": true},
	# (THE HIGH CITY, FLOOR 16: the Swan Gardens' gate on up the hill, swung open as the Princess falls: GARDEN_GATE.secs)
	16: {"secs": 18.0 / 30.0, "takes": [[0, 0]], "thrown": [], "shut_takes": true},
}
## (game.ts wayOpenLine)
const ON_OPEN := "The way on is open."
const HOME_OPEN := "The siege magic falters. The way home is open."

var main
var map: FloorMap
var hero
var monsters
var look
var sfx

var _w := {}
## (the stairwell that opened, and for how long it has been opening)
var _stair := {}
var _stair_t := -1.0
## ("": nothing yet; "opening": the way is breaking open; "open")
var state := ""
var _t := 0.0
var _boss_dead := false
var _secs := 0.0


func _ready() -> void:
	_w = map.ways if map.ways != null else {}


func _process(dt: float) -> void:
	if hero == null or monsters == null or main == null:
		return
	if not _boss_dead and _boss_fallen():
		_boss_dead = true
		_open()
	if state == "opening":
		_t += dt
		_show()
		if _t >= _secs:
			state = "open"
			_opened()
	if state == "open" and hero.alive and _taken():
		state = "gone"
		_go()


## Whether the floor's boss has fallen (there was one, and he is dead).
func _boss_fallen() -> bool:
	var had := false
	for m in monsters.list:
		if is_instance_valid(m) and m.boss:
			had = true
			if not m.dead:
				return false
	return had or monsters.boss_fell


## The boss is dead: the floor's way on begins to open.
func _open() -> void:
	var kind := way_kind()
	if kind == "":
		return
	state = "opening"
	_t = 0.0
	match kind:
		"stair":
			_stair = _stair_for()
			_secs = STAIR_OPENING
			# (its tiles past the top step are nobody's to walk on: ways.ts stairTiles)
			for i in _stair_tiles(_stair):
				map.walk[i] = 0
			_aside()
		"exit":
			_secs = float(_w["exit"].get("secs", 3.0))
		"cave":
			_secs = CAVE_OPENING
		"shaft":
			_secs = SHAFT_DOWN
		"onward":
			# (game.ts kill: the way on wakes, Ways.onward awake, its film from now)
			_secs = float(ONWARD.get(int(_w["a1"]["floor"]), {}).get("secs", 4.0))
		"plain":
			# (game.ts kill: awake at once, its column flaring over its dais as it wakes, its loop after: the look's states
			# `onwarp`, `onway`; render.ts drawWays, standWays)
			_secs = 0.0
			if look != null:
				look.play_variant("onwarp")
				look.play_variant("onway", 0.0, true)
			if sfx != null:
				sfx.play("power", linear_to_db(0.8))
	if sfx != null and kind != "onward" and kind != "plain":
		sfx.play("thunder", -8.0)
	main.say_way(kind, false)
	_show()


## Which way on this floor has: the stairwell, floor 3's door, floor 4's cave, floor 5's shaft, the descent's way on ("" none).
func way_kind() -> String:
	if _w.get("a1") != null and _w.get("onward") != null:
		return "onward"
	# (THE HIGH CITY, floors 17 to 20: a way on no one painted: a waypoint's dais where it stands, awake as he falls, walked into)
	if _w.get("onward") != null:
		return "plain"
	if _w.get("shaft") != null:
		return "shaft"
	if _w.get("exit") != null:
		return "exit"
	if _w.get("cave") != null:
		return "cave"
	if not _w.get("stairs", []).is_empty():
		return "stair"
	return ""


## Where the stairwell opens: the first of its places clear of the boss's body and of the hero (ways.ts stairFor).
func _stair_for() -> Dictionary:
	var spots: Array = _w["stairs"]
	var body: Vector2 = monsters.boss_at
	for s in spots:
		if not _near_stair(s, body, STAIR_CLEAR) and not _near_stair(s, hero.world, 0.5):
			return s
	for s in spots:
		if not _near_stair(s, body, STAIR_CLEAR):
			return s
	return spots[0]


## Whether a point is within `pad` tiles of a stairwell's opening (ways.ts nearStair: 2.4 long, 1.25 wide).
func _near_stair(s: Dictionary, p: Vector2, pad: float) -> bool:
	var along: float = p.x - float(s["x"]) if s["way"] == "x" else p.y - float(s["y"])
	var across: float = p.y - float(s["y"]) if s["way"] == "x" else p.x - float(s["x"])
	return along > -pad and along < 2.4 + pad and across > -pad and across < STAIR_WIDE + pad


func _stair_tiles(s: Dictionary) -> Array:
	var out: Array = []
	for k in [1, 2]:
		var tx: int = int(s["x"]) + (k if s["way"] == "x" else 0)
		var ty: int = int(s["y"]) + (0 if s["way"] == "x" else k)
		out.append(ty * map.w + tx)
	return out


## Whoever stands on the stairwell's opening as it opens is put aside to the nearer of its long sides (game.ts openStair).
func _aside() -> void:
	var s := _stair
	var along: float = hero.world.x - float(s["x"]) if s["way"] == "x" else hero.world.y - float(s["y"])
	var across: float = hero.world.y - float(s["y"]) if s["way"] == "x" else hero.world.x - float(s["x"])
	if along > -0.35 and along < 2.5 and across > -0.3 and across < STAIR_WIDE + 0.3:
		var a: float = clampf(along, -0.4, 2.8)
		var c: float = -0.5 if across < STAIR_WIDE / 2.0 else STAIR_WIDE + 0.5
		hero.world = Vector2(float(s["x"]) + a, float(s["y"]) + c) if s["way"] == "x" else Vector2(float(s["x"]) + c, float(s["y"]) + a)


## The way's picture as far open as it is (the look's own, by its states).
func _show() -> void:
	if look == null:
		return
	var k := clampf(_t / maxf(_secs, 0.01), 0.0, 1.0)
	match way_kind():
		"stair":
			look.show_variant("stair%d" % _w["stairs"].find(_stair), k)
		"exit":
			look.show_variant("exit", k)
		"cave":
			look.show_variant("cave", k)
		"shaft":
			look.show_variant("shaft", k)
		"onward":
			if look.has_variant("onward"):
				look.show_variant("onward", k)


## It is open: what was shut to him is his to walk into.
func _opened() -> void:
	match way_kind():
		"exit", "cave":
			for i in _way_tiles():
				map.walk[i] = 1
			# (game.ts joinSteps: on a floor with heights the way's tiles are joined to the floor beside them)
			map.join_steps(_way_tiles())
		"onward":
			# (game.ts updateWays: what it threw out solid where it fell, but never where he or a living monster stands)
			var taken := {floori(hero.world.y) * map.w + floori(hero.world.x): true}
			for m in monsters.list:
				if is_instance_valid(m) and not m.dead:
					taken[floori(m.world.y) * map.w + floori(m.world.x)] = true
			for i in onward_tiles("thrown"):
				if not taken.has(i):
					map.walk[i] = 0
			# (a door's way in, shut till now, walked into: but not where a solid prop stands)
			if ONWARD.get(int(_w["a1"]["floor"]), {}).get("shut_takes", false):
				var held := {}
				for p in map.props:
					if p.get("solid", false):
						held[int(p["ty"]) * map.w + int(p["tx"])] = true
				for i in onward_tiles("takes"):
					if not held.has(i):
						map.walk[i] = 1
	main.say_way(way_kind(), true)


## The tiles of floor 3's doorway and floor 4's cave mouth (prison_way.ts prisonDoorTiles; doors.ts doorTiles of its spot).
func _way_tiles() -> Array:
	var out: Array = []
	if _w.get("exit") != null:
		var e: Dictionary = _w["exit"]
		for i in e.get("tiles", []):
			out.append(int(i))
	elif _w.get("cave") != null:
		for i in _w["cave"].get("tiles", []):
			out.append(int(i))
	return out


## The tiles of the way on, of its `takes` or its `thrown` (ways.ts tilesAB: each [along, across] from the way's tile, turned the
## way it leads: turnAB), those on the floor.
func onward_tiles(which: String) -> Array:
	var a1: Dictionary = _w["a1"]
	var ref: Dictionary = a1["way"]["ref"]
	var dir: String = a1["way"]["dir"]
	var out: Array = []
	for ab in ONWARD.get(int(a1["floor"]), {}).get(which, []):
		var d := turn_ab(dir, int(ab[0]), int(ab[1]))
		var x: int = int(ref["x"]) + d.x
		var y: int = int(ref["y"]) + d.y
		if x >= 0 and y >= 0 and x < map.w and y < map.h:
			out.append(y * map.w + x)
	return out


## A way's own (a along, b across) in the world's x and y (ways.ts turnAB).
static func turn_ab(dir: String, a: int, b: int) -> Vector2i:
	match dir:
		"x+":
			return Vector2i(a, b)
		"x-":
			return Vector2i(-a, -b)
		"y+":
			return Vector2i(-b, a)
	return Vector2i(b, -a)


## Has he taken it: on the stairwell's top step, in the doorway, in the cave's mouth, in the cage, on the way on's way in?
func _taken() -> bool:
	var h: Vector2 = hero.world
	match way_kind():
		"stair":
			var s := _stair
			var along: float = h.x - float(s["x"]) if s["way"] == "x" else h.y - float(s["y"])
			var across: float = h.y - float(s["y"]) if s["way"] == "x" else h.x - float(s["x"])
			return along >= -0.1 and along < 0.95 and across >= 0.05 and across < STAIR_WIDE - 0.05
		"exit", "cave":
			return _way_tiles().has(floori(h.y) * map.w + floori(h.x))
		"shaft":
			var sh: Dictionary = _w["shaft"]
			return floori(h.x) == int(sh["x"]) and floori(h.y) == int(sh["y"])
		"onward":
			return onward_tiles("takes").has(floori(h.y) * map.w + floori(h.x))
		"plain":
			# (game.ts updateWays: walking into its light, within WAY_USE of it)
			var on: Dictionary = _w["onward"]
			return h.distance_to(Vector2(float(on["x"]), float(on["y"]))) < 1.0
	return false


## On to the next floor; from the fifth, up to town; from the tenth, home.
func _go() -> void:
	var n: int = map.depth
	var good := Color("#8af078")
	# (ENDLESS MODE: from an endless level, every way on, the stairwell, the mine shaft and the way on alike, to the next: game.ts
	# takeWay, nextEndless)
	if main.in_endless:
		main.next_endless()
		return
	if way_kind() == "shaft":
		# (game.ts takeWay 'up': the Prison cleared; with the Meldstone given already, the gate unbarred as he comes in sight of it)
		if main.loot.meld == "open" and main.way_depth < 6:
			main.way_depth = 6
			main.unbar_due = true
		main.loot.say("%s cleared" % str(map.title.get("level", "")), good)
		main.go_to("town", "cage")
	elif main.get("quest1620") != null and main.quest1620.tower_shut():
		# (QUESTS1620, game.ts takeWay 'on': from the Keep, the Quiet Tower's door opens only to the songbird's song: not mended, home
		# to the camp)
		main.loot.cleared = maxi(int(main.loot.cleared), n)
		if sfx != null:
			sfx.play("portal")
		main.loot.say("%s cleared." % str(map.title.get("level", "")), good)
		main.loot.say(main.quest1620._t("towerShut"), main.quest1620.MSG_QUEST)
		main.go_to(main.home_place(), "start")
	elif (way_kind() == "onward" or way_kind() == "plain") and (n == 10 or n == 15 or not main.has_floor(n + 1)):
		# (game.ts takeWay 'on' from the Fen: the siege broken, in through the gate; from the fifteenth, the Great Library, home too
		# (HIGH_CITY, on as the game starts): the stolen words flying home, the High City's gates shut)
		var line := "%s cleared." % str(map.title.get("level", ""))
		if n == 10:
			line += " The siege is broken."
		elif n == 15:
			line += " The stolen words fly home. High above, the gates of the High City swing shut."
		main.loot.say(line, good)
		if sfx != null:
			sfx.play("portal")
		# (game.ts takeWay 'on': the next floor of the city his to warp to (wayDepth: 11 from the Fen, 16 from the Library), and
		# so his town from now on the camp inside Vellum's gate, in through its city gate from the Fen: game/camp.ts, his pick
		# “Yes, the camp from then on (Recommended)”)
		if n == 10 or n == 15:
			main.way_depth = maxi(main.way_depth, n + 1)
		# (ENDLESS MODE: the last floor built beaten, the endless levels are open to him: the town's waypoint takes him on)
		var opens: bool = main.open_endless(n)
		main.go_to(main.home_place(), "in_gate" if n == 10 else "start")
		if opens and main.has_method("endless_fanfare"):
			main.endless_fanfare()
	elif not main.has_floor(n + 1):
		main.open_endless(n)
		main.go_to("town", "cage")
	else:
		main.go_to("floor%d" % (n + 1), "down")
