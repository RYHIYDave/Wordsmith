## THE CULT'S STRONGHOLDS, FLOORS 6 TO 10 (game/act1_holds.ts; game.ts holdsMade, altarNear, altarProblem, altarWord, unaltarWord,
## openHold, updateHolds, throughHoldDoor, holdWave; game/act1_layout.ts Hold, HOLD_HALLWAY; ui/town.ts altarSide), as the game
## starts (HOLD_WAVES, ALTAR_GOES, HOLD_HALLWAY on). Where they are, the game's own map-maker says (tools/godot_holds.ts:
## assets/floor<N>/holds.json); how they look, the floor's recorded look (its gatehouse, court, altar, braziers and banners; its
## state `hold<n>`, the seal broken and the altar gone) and each hall's own (assets/looks/floor<N>_hold<n>: the hall as the game
## draws it from in it, a dungeon's room in the dark in the redoubt's stone).
##   ONE OR TWO on every floor 6 to 10, off the main way: a yard with the cult's gate at its far side.
##   THE GUARDS: two of the cult before the door, each alone and rare (a mini fleshmancer and a dagger cultist), one of them
##     carrying a word (the floor's own monsters: monsters.json, packs 9100 and on).
##   THE ALTAR (E within HOLD_TUNE.near of it, its door shut): the gear screen opens with the altar beside it (inventory.gd, its
##     block `THE ALTAR OF THE WORDS`): up to three of his spare words laid in its three hollows, taken back free until the door
##     is opened; OPEN THE DOOR burns them: the door's seal breaks (the burst, the screen shaken, the seal's burning heard,
##     "The altar takes ..."), and the altar is gone, its two tiles floor again.
##   THE DOOR, open: walking into its doorway, the screen darkens and he is at the far end of the hall's hallway; walking out by
##     it, before the door.
##   THE HALL'S FIVE WAVES (HOLD_WAVES): the first as he first comes in, each next HOLD_WAVES.gap after the last is dead ("Wave
##     2 of 5"), each of the floor's own creatures and the cult as the game itself spawns it (holds.json), every one with the words
##     burned at the door, harder by HOLD_TUNE.life for each word past the first and by HOLD_WAVES.life for each wave on; each
##     coming up out of a rift in the hall's floor a little after the one before (ARRIVALS: render/arrivals.ts drawRift, risenBy,
##     risingSprite: the tear opening, its one rising out of it dark, then out and in the fight).
##   THE REWARD, the last wave dead: runedust (HOLD_TUNE.dust by the words burned, x LOOT2.dust), pieces of gear (LOOT2.hold),
##     gold (15 to 30 x the floor's power x the words x LOOT2.gold), a page of the cult's muster roll (MUSTER), "The stronghold
##     falls."
##   Words laid on an altar and not burned go back to him when he leaves the floor (game.ts leave).
## RUNEDUST is the meld's material, and melding is not in the Godot version: it is counted as the game counts it (loot.gd `dust`,
## shown beside the bag on the gear screen) and lies and is taken as the game draws it (quest610.gd `Thing`).
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Look := preload("res://scripts/look.gd")
const Monster := preload("res://scripts/monster.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const Words := preload("res://scripts/words.gd")
const PF := preload("res://scripts/pixel_font.gd")

const MSG_WORD := Color("#7af8f0")
const MSG_FOE := Color("#ff8a3a")
const MSG_GOOD := Color("#8af078")

var main  # main.gd
var map
var hero
var monsters
var loot
var sfx
var look
var fx
var stands: Node2D
var flats: Node2D
## (assets/floor<N>/holds.json and assets/act1/quest610.json)
var data := {}
var Q := {}
var T := {}
## (each stronghold as it stands now, game.ts HoldState: {words, open, entered, won, wave, packs, coming})
var st: Array = []
## (the hall he is in now, or -1; each hall's look, made the first time he comes into it)
var inside := -1
var _halls := {}
var _going := false
## (what E would do here: [shown, the stronghold's number])
var prompt := ["", -1]
## (ARRIVALS: one coming in up out of a rift: {d, fig, at, t, rise, r, seed, n, node})
var _risers: Array = []
var _later: Array = []
var _rifts: Node2D
var _t := 0.0


static func file_of(depth: int) -> String:
	return "res://assets/floor%d/holds.json" % depth


func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string(file_of(map.depth)))
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act1/quest610.json"))
	T = Q["hold"]["tune"]
	for q in data["holds"]:
		st.append({"words": [], "open": false, "entered": false, "won": false, "wave": 0, "packs": [], "coming": false})
	# (the kinds its waves bring that the floor's own monsters have not: their numbers)
	for k in data["defs"]:
		if not monsters._defs.has(k):
			monsters._defs[k] = data["defs"][k]
	_rifts = _RiftLayer.new()
	_rifts.holds = self
	flats.add_child(_rifts)
	if look != null:
		look.set_cull(FLOOR_BIT)


func hold(n: int) -> Dictionary:
	return data["holds"][n]


# --- the altar (game.ts altarNear, altarProblem, altarWord, unaltarWord) ---

## The stronghold whose altar he stands at, its door shut; -1: none.
func altar_near() -> int:
	for q in data["holds"]:
		var s: Dictionary = st[int(q["n"])]
		if not s["open"] and Vector2(q["altar"]["x"], q["altar"]["y"]).distance_to(hero.world) < float(T["near"]):
			return int(q["n"])
	return -1


## Why word `w` may not be laid on stronghold `n`'s altar, or "" (game.ts altarProblem, with FOE_WORDS: foe_melds.ts layProblem;
## the Godot version's words are all plain ones).
func problem(n: int, w: String) -> String:
	var s: Dictionary = st[n]
	if s["open"]:
		return "The door is open"
	if int(loot.words.get(w, 0)) <= 0:
		return "No spare word"
	if s["words"].size() >= int(T["most"]):
		return "At most %d words" % int(T["most"])
	if s["words"].has(w):
		return "Already on the altar"
	var el = Words.word(w).get("element")
	if el != null:
		for o in s["words"]:
			if Words.word(o).get("element") != null:
				return "One element per stronghold"
	return ""


## Lay a spare word on stronghold `n`'s altar: burned when its door is opened, until then taken back free. The refusal, or "".
func lay(n: int, w: String) -> String:
	var why := problem(n, w)
	if why != "":
		return why
	loot.words[w] = int(loot.words[w]) - 1
	st[n]["words"].append(w)
	# (THE FLOORS' SCENE SOUNDS: a word set into the altar, the clunk, then the chime)
	sfx.play("altar_word")
	return ""


## Take word `i` back off stronghold `n`'s altar.
func take_back(n: int, i: int) -> void:
	var s: Dictionary = st[n]
	if s["open"] or i < 0 or i >= s["words"].size():
		return
	var w: String = s["words"][i]
	s["words"].remove_at(i)
	loot.words[w] = int(loot.words.get(w, 0)) + 1
	sfx.play("click", -6.0)


## OPEN THE DOOR of stronghold `n` (game.ts openHold): the words on its altar burned, its seal broken, its door open; with
## ALTAR_GOES the altar gone and both its tiles floor again. False: none was given.
func open_door(n: int) -> bool:
	var s: Dictionary = st[n]
	var q := hold(n)
	if s["open"] or s["words"].is_empty():
		return false
	s["open"] = true
	if look != null:
		look.show_variant("hold%d" % n, 1.0)
	var gx := int(q["gx"])
	var gy := int(q["gy"])
	if bool(Q["switches"]["altarGoes"]):
		for tx in [gx, gx - 1]:
			map.walk[(gy + 1) * map.w + tx] = 1
		_tell({"t": "burst", "x": float(q["altar"]["x"]), "y": float(q["altar"]["y"]), "r": 1.2, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
	_tell({"t": "burst", "x": float(gx), "y": float(gy) + 0.2, "r": 1.6, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
	hero.kick(4.0)
	sfx.play("seal_burn", linear_to_db(0.9))
	var k: int = s["words"].size()
	loot.say("The altar takes %s. The door's seal breaks." % ("the word" if k == 1 else "%d words" % k), MSG_WORD)
	return true


## Words laid on an altar and not burned go back to him (game.ts leave), as he leaves the floor.
func give_back() -> void:
	for s in st:
		if not s["open"]:
			for w in s["words"]:
				loot.words[w] = int(loot.words.get(w, 0)) + 1
			s["words"] = []


# --- a step of the strongholds (game.ts updateHolds) ---

func _process(dt: float) -> void:
	_t += dt
	_step_later(dt)
	_step_risers(dt)
	prompt = ["", -1]
	if hero == null or _going or main._going:
		return
	# (the hall drawn as it is from in it while he is in it or its hallway, a tile round them counted in: render.ts hallNow, inHold;
	# so too fallen and set back there)
	var now := -1
	for q in data["holds"]:
		if _in_hold(q, hero.world):
			now = int(q["n"])
	_in_hall(now)
	if not hero.alive:
		return
	var an := altar_near()
	if an >= 0:
		prompt = ["E: Altar: give words to open the door", an]
		if Input.is_action_just_pressed("interact") and not main._inv.visible:
			main._inv.open_altar(an, self)
	var h: Vector2 = hero.world
	for q in data["holds"]:
		var n := int(q["n"])
		var s: Dictionary = st[n]
		# (into the door: the two tiles of its doorway)
		var gy := int(q["gy"])
		var gx := int(q["gx"])
		if s["open"] and floori(h.y) == gy and (floori(h.x) == gx - 1 or floori(h.x) == gx) and h.y < gy + 0.6:
			sfx.play("door", linear_to_db(0.6))
			through(n, true)
			return
		# (out by the hall's threshold, the middle of its near side; HOLD_HALLWAY, the far end of its hallway)
		var r: Dictionary = q["way"] if q.has("way") else q["inside"]
		var rx := float(r["x"])
		var ry := float(r["y"])
		var rw := float(r["w"])
		var rh := float(r["h"])
		if h.x >= rx and h.x < rx + rw and h.y >= ry and h.y < ry + rh and h.y > ry + rh - float(T["out"]) and absf(h.x - (rx + rw / 2.0)) < 1.3:
			sfx.play("door", linear_to_db(0.5))
			through(n, false)
			return
		# (HOLD_WAVES: a wave dead, the next comes; the last dead, it is won)
		var waves: Dictionary = Q["hold"]["waves"]
		if bool(waves["on"]) and s["entered"] and not s["won"] and int(s["wave"]) > 0:
			if s["coming"] or _alive(s["packs"]) or _rising(s["packs"]):
				continue
			if int(s["wave"]) < int(waves["n"]):
				s["coming"] = true
				var next := int(s["wave"]) + 1
				_after(float(waves["gap"]), func(): wave(n, next))
				continue
		if s["entered"] and not s["won"] and not _alive(s["packs"]) and not _rising(s["packs"]):
			_won(n)


## game/act1_layout.ts inHold: (x, y) in a stronghold's hall or its hallway, `m` tiles round them counted in.
static func _in_hold(q: Dictionary, p: Vector2, m := 1.0) -> bool:
	for k in ["inside", "way"]:
		if not q.has(k):
			continue
		var r: Dictionary = q[k]
		if p.x >= float(r["x"]) - m and p.y >= float(r["y"]) - m and p.x <= float(r["x"]) + float(r["w"]) + m and p.y <= float(r["y"]) + float(r["h"]) + m:
			return true
	return false


func _alive(packs: Array) -> bool:
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead and packs.has(m.pack_id):
			return true
	return false


func _rising(packs: Array) -> bool:
	for r in _risers:
		if packs.has(int(r["d"]["packId"])):
			return true
	return false


## THROUGH A STRONGHOLD'S DOOR, the screen dark (game.ts leave 'holdIn' / 'holdOut', throughHoldDoor): into its hall, at the far
## end of its hallway, looking up it, its first wave met the first time; or out of it, before its door. The hall is drawn as the
## game draws it from in it (its own look), the open ground's put away while he is in it.
func through(n: int, inward: bool) -> void:
	_going = true
	var tw := create_tween()
	tw.tween_property(main._curtain, "color:a", 1.0, main.CURTAIN)
	await tw.finished
	var q := hold(n)
	if inward:
		hero.world = Vector2(q["entry"]["x"], q["entry"]["y"])
		hero.face = Vector2(0, -1) if q.has("way") else Vector2(-0.7071, -0.7071)
	else:
		hero.world = Vector2(float(q["gx"]) - 1.5, float(q["gy"]) + 1.5)
		hero.face = Vector2(0.7071, 0.7071)
	_in_hall(n if inward else -1)
	if inward and not st[n]["entered"]:
		st[n]["entered"] = true
		if bool(Q["hold"]["waves"]["on"]):
			wave(n, 1)
	# (what is beyond is seen at once)
	if main.sight != null:
		main.sight._in = 0.0
		main.sight._look()
	var back := create_tween()
	back.tween_property(main._curtain, "color:a", 0.0, main.CURTAIN)
	await back.finished
	_going = false


## In stronghold `n`'s hall (-1: out on the open ground): its own look drawn, the floor's not (each on a layer of the screen's own:
## look.gd set_cull, the viewport's canvas_cull_mask); the dark and the vignette its (a dungeon's: render.ts VIGNETTE).
func _in_hall(n: int) -> void:
	if n == inside:
		return
	inside = n
	var place := "floor%d_hold%d" % [map.depth, n]
	if n >= 0 and not _halls.has(n) and Look.has_look(place):
		_halls[n] = _Hall.make(main, place, hero, HALL_BIT + n)
	_mask()
	if n >= 0 and _halls.has(n):
		main._veil.material.set_shader_parameter("deep", 0.62)
		main._veil.material.set_shader_parameter("veil_a", 0.0)
	else:
		main._veil.material.set_shader_parameter("deep", Look._num(look.data.get("vignette"), 0.62) if look != null else 0.82)


## (the screen's layers: the floor's look on FLOOR_BIT, each hall's on HALL_BIT + its number; only where he is drawn)
const FLOOR_BIT := 1
const HALL_BIT := 2


func _mask() -> void:
	var vp := get_viewport()
	if vp == null:
		return
	var m := vp.canvas_cull_mask
	var hall_here := inside >= 0 and _halls.has(inside)
	m = (m & ~(1 << FLOOR_BIT)) if hall_here else (m | (1 << FLOOR_BIT))
	for k in 2:
		m = (m | (1 << (HALL_BIT + k))) if hall_here and inside == k else (m & ~(1 << (HALL_BIT + k)))
	vp.canvas_cull_mask = m


func _exit_tree() -> void:
	# (the floor left: every layer drawn again, for the next place's look)
	var vp := get_viewport()
	if vp != null:
		vp.canvas_cull_mask = vp.canvas_cull_mask | (1 << FLOOR_BIT) | (1 << HALL_BIT) | (1 << (HALL_BIT + 1))
	inside = -1


# --- the hall's waves (game.ts holdWave) ---

## Wave `k` of stronghold `n`'s hall comes: every one of it as the game spawns it, with the words burned at the door, harder for
## each word past the first and for each wave on; each up out of its rift a little after the one before.
func wave(n: int, k: int) -> void:
	var s: Dictionary = st[n]
	if s["won"]:
		return
	s["wave"] = k
	s["coming"] = false
	var W: Dictionary = hold(n)["waves"][k - 1]
	s["packs"] = W["packs"].map(func(x): return int(x))
	var laid: Array = s["words"]
	var more := (1.0 + float(T["life"]) * maxf(0.0, laid.size() - 1.0)) * (1.0 + float(Q["hold"]["waves"]["life"]) * (k - 1))
	if k > 1:
		loot.say("Wave %d of %d" % [k, int(Q["hold"]["waves"]["n"])], MSG_FOE)
		sfx.play("boss_roar", linear_to_db(0.5))
	for m0 in W["monsters"]:
		var d: Dictionary = m0.duplicate(true)
		# (the words burned at the door are every one's, whole, as a word burned into a dungeon at the gate is)
		var ws: Array = d.get("words", [])
		for w in laid:
			if not ws.has(w):
				ws.append(w)
		d["words"] = ws
		d["half"] = d.get("half", []).filter(func(w): return not laid.has(w))
		d["maxLife"] = roundf(float(d["maxLife"]) * more)
		d["life"] = d["maxLife"]
		var fig: String = d["figure"]
		if not monsters._figures.has(fig):
			monsters._figures[fig] = BakedFigure.new(monsters._figures_dir, fig, monsters._info)
		var r := {"d": d, "fig": monsters._figures[fig], "at": Vector2(d["x"], d["y"]), "t": -float(d.get("after", 0.0)), "rise": float(d.get("rise", 1.0)), "r": float(d.get("rift", 0.45)), "seed": randi() % 1000000, "n": n}
		if not bool(Q["switches"]["arrivals"]) or r["rise"] <= 0.0:
			_come(r)
		else:
			var pic := _RiserPic.new()
			pic.r = r
			pic.holds = self
			pic.position = Iso.to_screen(r["at"].x, r["at"].y)
			stands.add_child(pic)
			r["node"] = pic
			_risers.append(r)
	_rifts.queue_redraw()


## One come up out of its rift: one of the monsters, in the fight.
func _come(r: Dictionary) -> void:
	var d: Dictionary = r["d"]
	var m := Monster.new()
	m.mgr = monsters
	m.setup(d, monsters._defs[d["kind"]], r["fig"])
	stands.add_child(m)
	monsters.list.append(m)
	m.state = "chase"
	m._cd = float(d.get("cd", 0.5))
	if m.h2 != null and m.h2.has_method("spawned"):
		m.h2.spawned(m)


func _step_risers(dt: float) -> void:
	if _risers.is_empty():
		return
	var keep: Array = []
	for r in _risers:
		r["t"] += dt
		if r["t"] >= r["rise"]:
			r["node"].queue_free()
			_come(r)
			# (its rift closes behind it: ARRIVALS.close)
			_rifts.closing.append({"at": r["at"], "t": 0.0, "r": r["r"], "seed": r["seed"]})
		else:
			r["node"].queue_redraw()
			keep.append(r)
	_risers = keep
	_rifts.queue_redraw()


## THE REWARD, its last wave dead (game.ts updateHolds): runedust, gear, gold, a page of the muster roll.
func _won(n: int) -> void:
	var s: Dictionary = st[n]
	s["won"] = true
	var q := hold(n)
	var k: int = s["words"].size()
	var at := Vector2(q["fight"]["x"], q["fight"]["y"])
	var L2: Dictionary = Q["hold"]["loot2"]
	var dust := roundi(_up_to(T["dust"], k) * (float(L2["dust"]) if bool(L2["on"]) else 1.0))
	if dust > 0 and main.quest610 != null:
		main.quest610.drop_dust(at, dust)
	var items := int(_up_to(L2["hold"], k)) if bool(L2["on"]) else int(_up_to(T["items"], k))
	for i in items:
		loot._item(at, (4 if i < 2 else 2) if bool(L2["on"]) else (2 if i == 0 else 1))
	loot._gold(at, randi_range(15, 30) * maxi(1, int(data["power"])) * k * (int(L2["gold"]) if bool(L2["on"]) else 1))
	if main.quest610 != null:
		main.quest610.roll_page_at(at)
	sfx.play("rare")
	loot.say("The stronghold falls.", MSG_GOOD)


## foe_melds.ts upTo: a table's value at `n`, carried on past its end by its last step.
static func _up_to(table: Array, n: int) -> float:
	var last := table.size() - 1
	if n <= last:
		return float(table[maxi(0, n)])
	return float(table[last]) + (float(table[last]) - float(table[last - 1])) * (n - last)


func _tell(e: Dictionary) -> void:
	if fx != null:
		fx.event(e)


func _after(t: float, fn: Callable) -> void:
	_later.append({"t": t, "fn": fn})


func _step_later(dt: float) -> void:
	if _later.is_empty():
		return
	var due: Array = []
	for l in _later:
		l["t"] -= dt
		if l["t"] <= 0.0:
			due.append(l)
	for l in due:
		_later.erase(l)
		l["fn"].call()


## A STRONGHOLD'S HALL AS IT IS DRAWN FROM IN IT (its recorded look, floor<N>_hold<n>): its ground, flat things and dark in layers
## of their own beside the floor's, what stands among the figures; shown while he is in it.
class _Hall extends RefCounted:
	const LookK := preload("res://scripts/look.gd")
	var look
	var light: Node

	static func make(main, place: String, hero, bit: int) -> _Hall:
		var h := _Hall.new()
		var root: Node2D = main._place
		var back := Node2D.new()
		var floor_layer := Node2D.new()
		var flat := Node2D.new()
		var at: Dictionary = {"back": main.look.back_layer, "floor": main.look.floor_layer, "flat": main.look.flat_layer}
		for pair in [[back, "back"], [floor_layer, "floor"], [flat, "flat"]]:
			root.add_child(pair[0])
			root.move_child(pair[0], at[pair[1]].get_index() + 1)
		var L = LookK.new()
		L.place = place
		L.back_layer = back
		L.floor_layer = floor_layer
		L.flat_layer = flat
		L.stands = main.look.stands
		root.add_child(L)
		h.look = L
		h.light = L.lighting(root, hero, 165.0)
		L.set_cull(bit)
		return h


## ITS ONE COMING UP (render/arrivals.ts risenBy, risingSprite; render.ts risers): its own picture, facing the hero, rising out
## of the floor, what is still under it not drawn; dark as it comes (the silhouette #160a1c at 0.85 x what is left to come), at
## least a third seen, lit as it steps out.
class _RiserPic extends Node2D:
	const DARK := Color("#160a1c")
	var r: Dictionary
	var holds

	func _draw() -> void:
		var o: float = float(holds.Q["arrivals"]["open"])
		var age: float = r["t"]
		if age <= o:
			return
		var k := minf(1.0, (age - o) / maxf(0.01, float(r["rise"]) - o))
		var up := 1.0 - (1.0 - k) * (1.0 - k)
		var d: Dictionary = r["d"]
		var to: Vector2 = holds.hero.world - r["at"]
		var f: Dictionary = r["fig"].frame(to.x, to.y, "idle", int(age * r["fig"].fps("idle")) % maxi(1, r["fig"].count(0, "idle")))
		var tex: Texture2D = f["tex"]
		var off: Vector2 = f["offset"]
		var sc: float = f["scale"]
		var above := roundf(-off.y * up)
		if above <= 0.0:
			return
		var w := tex.get_width()
		var dest := Rect2(off.x * sc, -above * sc, w * sc, above * sc)
		var src := Rect2(0, 0, w, above)
		if f["flip"]:
			draw_set_transform(Vector2(2.0 * off.x * sc + w * sc, 0.0), 0.0, Vector2(-1, 1))
		draw_texture_rect_region(tex, dest, src, Color(1, 1, 1, minf(1.0, 0.35 + up)))
		draw_texture_rect_region(tex, dest, src, Color(DARK, 0.85 * (1.0 - up)))


## THE RIFTS (render/arrivals.ts drawRift), on the floor under every figure: a dark tear opening where one is coming, its ragged
## edge and the cracks out from it the enemy's pink, flickering; holding while its one comes up; closing behind it. And ITS ONE
## COMING UP (risenBy, risingSprite): its own picture rising out of the floor, what is still under it not drawn, dark as it
## comes (render.ts: silhouette #160a1c at 0.85 x what is left to come), lit as it steps out.
class _RiftLayer extends Node2D:
	const VOID := Color("#0b0612")
	const DEEP := Color("#2a0c2c")
	const EDGE := [Color("#7a1058"), Color("#e0287a"), Color("#ff7aa8")]
	const DARK := Color("#160a1c")
	var holds
	var closing: Array = []
	var _clock := 0.0

	func _process(dt: float) -> void:
		_clock += dt
		for c in closing:
			c["t"] += dt
		var A: Dictionary = holds.Q["arrivals"]
		closing = closing.filter(func(c): return c["t"] < float(A["close"]))
		if not closing.is_empty() or not holds._risers.is_empty():
			queue_redraw()

	static func _hash(a: int, b: int) -> float:
		var h := (a * 374761393 + b * 668265263) & 0xffffffff
		h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff
		return float((h ^ (h >> 16)) & 0xffffffff) / 4294967296.0

	func _open(t: float, out: float, dur: float) -> float:
		var o: float = float(holds.Q["arrivals"]["open"])
		if t < 0.0:
			return 0.0
		if t < o:
			var c := t / o - 1.0
			return maxf(0.0, 1.0 + 2.7 * c * c * c + 1.7 * c * c)
		if t < out:
			return 1.0
		return maxf(0.0, 1.0 - (t - out) / maxf(0.01, dur - out))

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var A: Dictionary = holds.Q["arrivals"]
		for r in holds._risers:
			_rift(r["at"], _open(r["t"], r["rise"], r["rise"] + float(A["close"])), r["r"], r["seed"])
		for c in closing:
			_rift(c["at"], _open(float(A["rise"]) + c["t"], float(A["rise"]), float(A["rise"]) + float(A["close"])), c["r"], c["seed"])
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	func _rift(at: Vector2, k: float, size: float, seed: int) -> void:
		if k <= 0.02:
			return
		var c := Iso.to_screen(at.x, at.y) / 2.0
		var r := size * k
		var flick := floori(_clock * 14.0)
		_ellipse(c.round(), r * 26.0, r * 13.0, Color(VOID, 0.35 * minf(1.0, k)))
		var n := 22
		var pts := PackedVector2Array()
		for i in n:
			var a := float(i) / n * TAU
			var rag := 0.72 + 0.38 * _hash(seed + i, 3) + (-0.12 if i % 2 == 1 else 0.1)
			pts.append(Vector2(c.x + cos(a) * r * 18.0 * rag, c.y + sin(a) * r * 9.0 * rag))
		# (too small yet to be a shape: its edge alone)
		if r * 9.0 >= 1.5:
			draw_colored_polygon(pts, VOID)
		_ellipse(Vector2(roundf(c.x), roundf(c.y - r * 2.0)), r * 10.0, r * 4.5, Color(DEEP, 0.85))
		for i in n:
			var p0: Vector2 = pts[i]
			var p1: Vector2 = pts[(i + 1) % n]
			var steps := maxi(2, ceili(p0.distance_to(p1)))
			for s in steps:
				var u := float(s) / steps
				var hot := _hash(seed + i * 31 + s, flick)
				draw_rect(Rect2((p0 + (p1 - p0) * u).round(), Vector2.ONE), EDGE[2] if hot > 0.82 else (EDGE[1] if hot > 0.3 else EDGE[0]))
		for j in 5:
			var a := _hash(seed, j + 40) * TAU
			var long := (0.5 + 0.7 * _hash(seed, j + 60)) * r * minf(1.0, k * 1.2)
			var x := c.x + cos(a) * r * 17.0
			var y := c.y + sin(a) * r * 8.5
			for s in 4:
				var bend := (_hash(seed + j, s) - 0.5) * 0.9
				var nx := x + cos(a + bend) * long * 6.0
				var ny := y + sin(a + bend) * long * 3.0
				var steps := maxi(2, ceili(Vector2(nx - x, ny - y).length()))
				for q in steps:
					var u := float(q) / steps
					var al := (1.0 - s / 4.0) * (1.0 if _hash(j * 7 + q, flick) > 0.2 else 0.4)
					draw_rect(Rect2(Vector2(roundf(x + (nx - x) * u), roundf(y + (ny - y) * u)), Vector2.ONE), Color(EDGE[1] if s == 0 else EDGE[0], al))
				x = nx
				y = ny

	func _ellipse(c: Vector2, rx: float, ry: float, col: Color) -> void:
		if rx < 1.0 or ry < 0.75:
			return
		var pts := PackedVector2Array()
		for i in 32:
			var a := float(i) / 32.0 * TAU
			pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
		draw_colored_polygon(pts, col)
