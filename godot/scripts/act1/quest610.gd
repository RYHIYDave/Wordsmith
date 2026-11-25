## THE QUEST LINE OF FLOORS 6 TO 10 (game/quests610.ts QUESTS610, F9_LAIRS; game/quest_marks.ts QUEST_MARKS, SPEAK_NEW,
## SPEAK_RETURN; game.ts mysticDue, mysticHandIn, queenDown, sceneStep, scenePan, sceneBars, wantsPiece, dropPiece, piecesMade,
## huntLines, questGivers, turnInFor, updateDrops; render.ts questMarks, drops, standMeldDrop, standMeldMoments, sceneLean;
## render/quest_mark.ts; ui/guide.ts huntBanner), as the game starts. What the hero has done of it is his, and outlasts the place.
##   1. THE MYSTIC'S ASK: once the gate down the mountain is open (way_depth 6), the mystic has a task ("Mystic: a task"): used,
##      she asks for a feather of the Queen vulture, floor 7's boss (town.gd asks `mystic_due`, `mystic_hand_in`).
##   2. THE EYRIE: the first time the Queen falls, "A FEATHER" over her and the feather is plucked ("You pluck the Queen's
##      FEATHER."); and, the first time for this hero, THE SCENE: her death played out (2.2 s), black bars come in across the top
##      and the bottom of the screen and the screen's buttons go; he is walked to the eyrie's edge at 0.7 of his pace (where the
##      game's own queenDown puts it: holds.json `eyrie`), turns to the drop, the picture pans out over it (1.6 s, eased) toward the
##      town far below under the cult's dome (the Ledge Road's sky carries it: look.gd _Sky), the wind swells, it holds on the
##      town (3.4 s) and half a second in he says his line ("So that is what they did to the town."), and it pans back (1.2 s).
##      Nothing harms him while it plays; the player's hands are off him.
##   3. THE FEATHER BROUGHT ("Mystic: the Queen's feather"): she reads the dome in it, and the beasts of the Pinewood carry the
##      ward-stone's pieces (F9_LAIRS: the Mist Wolf, the Troll Chieftain, the Hollow Stag).
##   4. THE PIECES (floor 9, the feather given): each of the three carries its piece; as it falls the piece lies where it fell ("A
##      PIECE OF THE WARD-STONE"), the Meldstone's small picture standing in for it as the game has it, named "Ward-stone piece";
##      taken by walking to it ("You take a piece of the WARD-STONE (k of 3).", and with the third "All three pieces ..."). Coming
##      into the Pinewood after them, the line at the top reads DEFEAT for each boss, ticked off as each falls; 6 s, and 4 s again
##      as each falls (HUNT_LINE), counted only while it is seen.
##   5. THE PILLARS in the Fen (pillars.gd): where the pieces are set.
##   THE QUEST MARKS: the flashing rune of the wordsmith (the friend's cyan) over whoever in town has a quest to give or something
##   to take now, over their head; on a floor, over its waypoint while he brings something back. Not while a scene plays.
##   "SPEAK TO" / "RETURN TO" THE MYSTIC on the line at the top (guide.gd: its givers and whom he brings something back for).
## THE THINGS THAT LIE (the game's drops 'dust', 'piece', 'quest' roll): RUNEDUST (the strongholds' reward: holds.gd) bursting
## up out of the floor, lying in its heap and glittering, coming to him, whirling up round him and into him ("+N RUNEDUST");
## counted as the game counts it (`dust`, shown on the gear screen by the bag; spent at the wordsmith, a meld a runedust: loot.gd
## meld_words); A PAGE OF THE CULT'S MUSTER ROLL (MUSTER: each stronghold won gives one, three at most: `roll_pages`; the
## mystic's ask for the roll and her reward for it are not brought over).
extends Node

const Iso := preload("res://scripts/iso.gd")
const Loot := preload("res://scripts/loot.gd")
const Pillars := preload("res://scripts/act1/pillars.gd")
const Holds := preload("res://scripts/act1/holds.gd")
const AltarRooms := preload("res://scripts/act1/altar_rooms.gd")
const DoorWords := preload("res://scripts/door_words.gd")
const PF := preload("res://scripts/pixel_font.gd")

## (the bug hunt's fourth round: a quest's rune over a townsman's head, but on his name, put over the name; on at his yes, 25 Nov 2026, "3. Marker clear (Recommended)")
static var MARK_CLEAR := true
const MSG_QUEST := Color("#7af8f0")
const PIECE := Color("#e8dcc0")
const PULL := 3.2
const TAKE := 0.75
const FLY := 9.0
const WAIT := 0.4
## (render/fx.ts QUIP_TIME: how long his line is up)
const QUIP_TIME := 2.6

var main  # main.gd
var Q := {}
var T := {}
## WHAT HE HAS DONE OF IT (game.ts Hero: feather, citySeen, pieces, rollPages, dust)
var feather := ""
var city_seen := false
var pieces := 0
var roll_pages := 0
var dust := 0
## (the ward-stone's hunt on the line at the top: {t, fallen}; the eyrie's scene playing: {phase, t, to, side, said})
var hunt := {}
var scene := {}
## (floor 10's pillars: pillars.gd)
var pillars
var holds
## (THE DOOR WORDS: Siege burned in on a floor with strongholds of its own, the cult's altar rooms beside them: door_words.gd)
var rooms = null
## (what lies on this floor: {what ("dust", "piece", "roll"), at, node, age, n})
var _things: Array = []
var _marks: Node2D
var _bars: CanvasLayer
var _bar_rects: Array = []
var _quip: Node2D
var _whirls: Array = []
var _clock := 0.0
var _prompt := ["", ""]


func _ready() -> void:
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act1/quest610.json"))
	T = Q["text"]
	_bars = CanvasLayer.new()
	_bars.layer = 20
	for i in 2:
		var r := ColorRect.new()
		r.color = Color.BLACK
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		r.visible = false
		_bars.add_child(r)
		_bar_rects.append(r)
	add_child(_bars)


func on() -> bool:
	return bool(Q["switches"]["quests610"])


# --- a place come into (main.gd _build) ---

## A place laid out: what of the quest line is on it (game.ts enterDungeon: piecesMade; PILLARS on floor 10's stone), the quest
## marks, the strongholds (holds.gd).
func enter(where: String) -> void:
	_things = []
	_whirls = []
	scene = {}
	hunt = {}
	_scene_off()
	pillars = null
	holds = null
	rooms = null
	main.hero.pillars = null
	var stands: Node2D = main.hero.get_parent()
	var place: Node2D = main._place
	_marks = _Marks.new()
	_marks.q = self
	# (drawn last in the game, after the services' names: over the place's dark and over the names, z 60)
	_marks.z_index = 61
	place.add_child(_marks)
	_quip = _Quip.new()
	_quip.q = self
	_quip.z_index = 60
	place.add_child(_quip)
	if where == "town":
		return
	var depth: int = main.map.depth
	# (THE CULT'S STRONGHOLDS: holds.gd, where the floor has any)
	if FileAccess.file_exists(Holds.file_of(depth)):
		var h := Holds.new()
		h.main = main
		h.map = main.map
		h.hero = main.hero
		h.monsters = main._monsters
		h.loot = main.loot
		h.sfx = main.sfx
		h.look = main.look
		h.fx = main.fx
		h.stands = stands
		h.flats = main._place.get_child(3)
		place.add_child(h)
		holds = h
		# (THE DOOR WORDS: Siege burned in, the cult's gates at the map's edge beside the floor's own strongholds: door_words.gd)
		var more: int = AltarRooms.gates_for(main, where)
		if more > 0:
			rooms = _altar_rooms(stands, place, more)
	# (STRONGHOLDS ON ANY ENDLESS LEVEL: on a floor with none of its own, the cult's gates at the map's edge: altar_rooms.gd; Siege
	# burned in, twice as many: door_words.gd)
	elif AltarRooms.wanted(main, where):
		holds = _altar_rooms(stands, place, AltarRooms.gates_for(main, where))
	# (ENDLESS MODE, NO STORY: the Pinewood's pieces and the Fen's pillars not on an endless level; the strongholds stay: storyHere)
	var story: bool = main.story_here()
	if depth == 9 and story:
		_pieces_made()
	# (FLOOR 10, THE FEN: the cult's three obelisks, the pillars of the Swamp Colossus's third phase)
	if depth == 10 and story and holds != null and holds.data.has("pillars"):
		var p := Pillars.new()
		p.q = self
		p.main = main
		p.at = holds.data["pillars"]
		main._place.get_child(3).add_child(p)
		pillars = p
		main.hero.pillars = p


# --- the mystic (game.ts mysticDue, mysticHandIn) ---

## What the mystic has for this hero: her ask for the feather (the gate down the mountain open), or the feather taken from him; "".
func mystic_due() -> String:
	if not on():
		return ""
	if feather == "got":
		return "featherGive"
	if feather == "" and int(main.way_depth) >= 6:
		return "featherAsk"
	return ""


func mystic_prompt() -> String:
	var due := mystic_due()
	return str(T["featherAskPrompt"]) if due == "featherAsk" else (str(T["featherGivePrompt"]) if due == "featherGive" else "")


func mystic_hand_in() -> void:
	var due := mystic_due()
	if due == "featherAsk":
		feather = "asked"
		main.sfx.play("power", linear_to_db(0.6))
		main.loot.say(str(T["featherAsk"]), MSG_QUEST)
	elif due == "featherGive":
		feather = "given"
		main.sfx.play("rare")
		main.loot.say(str(T["featherGivenBosses"]) if bool(Q["switches"]["f9Lairs"]) else str(T["featherGiven"]), MSG_QUEST)


# --- who has something for him (game.ts questGivers, turnInFor) ---

## Who in town has a quest for this hero now, to give it or to take what it asked for: a marker floats over each.
func givers() -> Array:
	var loot = main.loot
	var out: Array = []
	if loot.quest != "" or loot.meld == "stone" or (not loot.ring_lit and not loot.quest_given) or loot.meld_ask_due():
		out.append("wordsmith")
	# (QUESTS1115: the armourer's clapper, the mystic's jar: act2/quest1115.gd)
	var q11 = main.quest1115
	if loot.armourer_due() != "" or (q11 != null and q11.clapper_due() != ""):
		out.append("armourer")
	if mystic_due() != "" or (q11 != null and q11.jar_due() != ""):
		out.append("mystic")
	# (QUESTS1620: the armourer's songbird, the stranger's whole court: act3/quest1620.gd)
	var q16 = main.get("quest1620")
	if q16 != null and q16.bird_due() != "" and not out.has("armourer"):
		out.append("armourer")
	if q16 != null and q16.court_due() != "":
		out.append("stranger")
	return out


## Whom he brings something back for now (a marker over the floor's waypoint home), or "".
func turn_in_for() -> String:
	var loot = main.loot
	if loot.quest != "" or loot.meld == "stone":
		return "wordsmith"
	if loot.ring_lit and loot.furnace == "out":
		return "armourer"
	if on() and feather == "got":
		return "mystic"
	# (QUESTS1115)
	if main.quest1115 != null and main.quest1115.on():
		if main.quest1115.jar == "got":
			return "mystic"
		if main.quest1115.clapper == "got":
			return "armourer"
	# (QUESTS1620)
	var q16 = main.get("quest1620")
	if q16 != null and q16.on():
		if q16.bird != "mended" and q16.bird_parts == int(q16.Q["bits"]["all"]):
			return "armourer"
		if q16.court_due() == "courtGive":
			return "stranger"
	return ""


# --- a monster fallen (loot.gd on_kill) ---

func killed(m) -> void:
	if not on():
		return
	if m.has_meta("piece"):
		_drop_piece(int(m.get_meta("piece")), m.world)
	if not hunt.is_empty() and main.map != null and main.map.depth == 9:
		for b in Q["pieces"]:
			if b["kind"] == m.kind:
				hunt = {"t": float(Q["hunt"]["fallen"]), "fallen": int(hunt["fallen"]) | (1 << int(b["piece"]))}
	if m.boss and m.kind == "queen":
		_queen_down(m)


## (game.ts queenDown) The Queen fallen: her feather, the first time; and the eyrie's scene, the first time for this hero.
func _queen_down(m) -> void:
	if feather != "got" and feather != "given":
		feather = "got"
		main.fx.float_text(m.world.x, m.world.y, "A FEATHER", PIECE)
		main.loot.say(str(T["featherGot"]), MSG_QUEST)
	if city_seen or holds == null or not holds.data.has("eyrie"):
		return
	var e: Dictionary = holds.data["eyrie"]
	scene = {"phase": "wait", "t": 0.0, "to": Vector2(e["to"]["x"], e["to"]["y"]), "side": float(e["side"]), "said": false, "quip": -1.0}


# --- the pieces (game.ts wantsPiece, dropPiece, piecesMade) ---

func taken() -> int:
	return (pieces & 1) + ((pieces >> 1) & 1) + ((pieces >> 2) & 1)


func wants_piece(n: int) -> bool:
	return on() and feather == "given" and (pieces & (1 << n)) == 0


func _drop_piece(n: int, at: Vector2) -> void:
	if not wants_piece(n):
		return
	for t in _things:
		if t["what"] == "piece" and int(t["n"]) == n:
			return
	_thing("piece", main.loot._scatter(at), n)
	main.fx.float_text(at.x, at.y, "A PIECE OF THE WARD-STONE", PIECE)


## THE PINEWOOD come into after the ward-stone: the Mist Wolf carries the first piece, the Troll Chieftain the second, the Stag the
## third; where one of the first two is not on the floor, its area's piece lies there, or with its lair's guardian.
func _pieces_made() -> void:
	if not on() or feather != "given" or taken() >= 3:
		return
	var wolf = null
	var chief = null
	var stag = null
	for m in main._monsters.list:
		if not is_instance_valid(m) or m.dead:
			continue
		if m.kind == "mistwolf" and wolf == null:
			wolf = m
		elif m.kind == "warchief" and chief == null:
			chief = m
		elif m.kind == "stag" and m.boss and stag == null:
			stag = m
	if wolf != null and wants_piece(0):
		wolf.set_meta("piece", 0)
	if chief != null and wants_piece(1):
		chief.set_meta("piece", 1)
	var land = main.map.land
	if land != null:
		for a in land.get("areas", []):
			var b := Vector2(a["blob"]["x"], a["blob"]["y"])
			if a["role"] == "side" and wolf == null and wants_piece(0):
				_thing("piece", b, 0)
			elif a["role"] == "lair" and chief == null and wants_piece(1):
				var guard = null
				for m in main._monsters.list:
					if is_instance_valid(m) and not m.dead and not m.boss and (m.champion or m.rarity == "leader") and (guard == null or m.world.distance_to(b) < guard.world.distance_to(b)):
						guard = m
				if guard != null and guard.world.distance_to(b) < maxf(float(a["blob"]["rx"]), float(a["blob"]["ry"])) + 2.0:
					guard.set_meta("piece", 1)
				else:
					_thing("piece", b, 1)
	if stag != null and wants_piece(2):
		stag.set_meta("piece", 2)
	if wolf != null or chief != null:
		main.loot.say(str(T["piecesHereBosses"]), MSG_QUEST)
		hunt = {"t": float(Q["hunt"]["enter"]), "fallen": 0}
	else:
		main.loot.say(str(T["piecesHere"]), MSG_QUEST)


## (ui/guide.ts huntBanner) The ward-stone's hunt on the line at the top while it is up: DEFEAT each boss, ticked once he has
## fallen here or his piece is already the hero's. `seen`: it is on the screen, and its time runs.
func hunt_banner(seen: bool, dt: float) -> Dictionary:
	if hunt.is_empty() or float(hunt["t"]) <= 0.0 or main.map == null or main.map.depth != 9 or main.place == "town":
		return {}
	# (it waits behind the floor's name across the screen, as every line at the top does: main.ts FLOOR_CARD_FIRST)
	if main._hud != null and not main._hud.floor_card.is_empty():
		return {}
	if seen:
		hunt["t"] = float(hunt["t"]) - dt
	var lines: Array = []
	for b in Q["pieces"]:
		lines.append({"id": "hunt%d" % int(b["piece"]), "how": "DEFEAT", "what": b["name"], "done": ((int(hunt["fallen"]) | pieces) & (1 << int(b["piece"]))) != 0})
	return {"caption": "QUEST", "text": "", "sub": "", "lines": lines}


# --- the strongholds' reward (holds.gd): runedust, a page of the muster roll ---

func drop_dust(at: Vector2, n: int) -> void:
	_thing("dust", main.loot._scatter(at), n)


## (game.ts rollPageAt, MUSTER) A page of the cult's muster roll, where the stronghold fell, until he has them all.
func roll_page_at(at: Vector2) -> void:
	if not bool(Q["switches"]["muster"]):
		return
	var lying := 0
	for t in _things:
		if t["what"] == "roll":
			lying += 1
	if roll_pages + lying >= int(Q["muster"]["pages"]):
		return
	_thing("roll", main.loot.floor_near(at), 0)


func _thing(what: String, at: Vector2, n: int) -> void:
	var node := _Thing.new()
	node.q = self
	node.what = what
	node.n = n
	node.position = Iso.to_screen(at.x, at.y)
	main.hero.get_parent().add_child(node)
	var label = null
	if what != "dust":
		label = Loot._Tag.new()
		label.text = str(T["pieceLabel"]) if what == "piece" else str(T["rollLabel"])
		label.color = PIECE
		label.z_index = 60
		node.add_child(label)
	_things.append({"what": what, "at": at, "node": node, "age": 0.0, "n": n})


func _took(t: Dictionary) -> void:
	var h = main.hero
	match t["what"]:
		"dust":
			var n := int(t["n"])
			dust += n
			main.sfx.play("word", linear_to_db(0.7))
			main.fx.float_text(h.world.x, h.world.y, "+%d RUNEDUST" % n, Color(str(Q["dust"]["color"])))
			var w := _Whirl.new()
			w.q = self
			w.n = n
			main._place.add_child(w)
		"piece":
			pieces |= 1 << int(t["n"])
			var k := taken()
			main.fx.float_text(h.world.x, h.world.y, "WARD-STONE %d / 3" % k, PIECE)
			main.sfx.play("rare")
			main.loot.say(str(T["pieceGot"][k - 1]), MSG_QUEST)
			if k >= 3:
				main.loot.say(str(T["piecesWhole"]), MSG_QUEST)
		"roll":
			roll_pages = mini(int(Q["muster"]["pages"]), roll_pages + 1)
			main.sfx.play("rare")
			main.loot.say(str(T["rollGot"][roll_pages - 1]), MSG_QUEST)
			main.fx.float_text(h.world.x, h.world.y, "MUSTER ROLL %d / %d" % [roll_pages, int(Q["muster"]["pages"])], PIECE)


# --- each frame ---

func _process(dt: float) -> void:
	_clock += dt
	if main == null or main.hero == null:
		return
	_step_scene(dt)
	_take_things(dt)
	_prompt = ["", ""]
	if pillars != null and is_instance_valid(pillars) and pillars.near() >= 0:
		_prompt = ["E: " + str(T["pillarPrompt"]), "pillar"]
		if Input.is_action_just_pressed("interact") and main.hero.alive and not main._inv.visible:
			pillars.set_piece(pillars.near())


## What E would do here, of the quest line: [shown, what].
func prompt() -> Array:
	if holds != null and is_instance_valid(holds) and str(holds.prompt[0]) != "":
		return [holds.prompt[0], "altar"]
	if rooms != null and is_instance_valid(rooms) and str(rooms.prompt[0]) != "":
		return [rooms.prompt[0], "altar"]
	return _prompt


## The cult's altar rooms on this floor, `want` of them at most (altar_rooms.gd), or null where none could be laid.
func _altar_rooms(stands: Node2D, place: Node2D, want: int):
	var ar = AltarRooms.new()
	ar.main = main
	ar.map = main.map
	ar.hero = main.hero
	ar.monsters = main._monsters
	ar.loot = main.loot
	ar.sfx = main.sfx
	ar.look = main.look
	ar.fx = main.fx
	ar.stands = stands
	ar.flats = main._place.get_child(3)
	ar.mdata = main.floor_mdata
	ar.seed = main.altar_seed
	ar.want = want
	place.add_child(ar)
	if ar.data["holds"].is_empty():
		ar.queue_free()
		return null
	return ar


func _take_things(dt: float) -> void:
	var h = main.hero
	var keep: Array = []
	for t in _things:
		if not is_instance_valid(t["node"]):
			continue
		t["age"] = float(t["age"]) + dt
		t["node"].age = t["age"]
		var took := false
		if h.alive and float(t["age"]) >= WAIT:
			if t["at"].distance_to(h.world) <= PULL:
				t["at"] = t["at"].move_toward(h.world, FLY * dt)
				t["node"].position = Iso.to_screen(t["at"].x, t["at"].y)
			if t["at"].distance_to(h.world) <= TAKE:
				took = true
		if took:
			t["node"].queue_free()
			_took(t)
		else:
			keep.append(t)
	_things = keep


# --- THE EYRIE'S SCENE (game.ts sceneStep, scenePan, sceneBars; render.ts sceneLean; main.ts its black bars) ---

func _step_scene(dt: float) -> void:
	if scene.is_empty():
		return
	var h = main.hero
	var E: Dictionary = Q["eyrie"]
	h._invuln = maxf(h._invuln, 0.2)
	h.scene_pace = 0.0001
	h.auto_dir = Vector2.ZERO
	scene["t"] = float(scene["t"]) + dt
	var t: float = scene["t"]
	match scene["phase"]:
		"wait":
			if t >= float(E["after"]):
				scene["phase"] = "walk"
				scene["t"] = 0.0
		"walk":
			var d: Vector2 = scene["to"] - h.world
			if d.length() > 0.25 and t < float(E["walk"]):
				var way := d.normalized()
				h.scene_pace = float(E["pace"])
				h.auto_dir = Iso.to_screen(way.x, way.y).normalized()
			else:
				# (there: he turns to the drop, and the picture pans out over it; the wind swells)
				var side: float = scene["side"]
				h.face = Vector2(side, -side).normalized()
				scene["phase"] = "out"
				scene["t"] = 0.0
				main.sfx.play("eyrie_wind")
		"out":
			if t >= float(E["out"]):
				scene["phase"] = "hold"
				scene["t"] = 0.0
		"hold":
			if not scene["said"] and t >= float(E["say"]):
				scene["said"] = true
				scene["quip"] = 0.0
			if t >= float(E["hold"]):
				scene["phase"] = "back"
				scene["t"] = 0.0
		"back":
			if t >= float(E["back"]):
				city_seen = true
				scene = {}
				_scene_off()
				return
	if float(scene.get("quip", -1.0)) >= 0.0:
		scene["quip"] = float(scene["quip"]) + dt
	# (the picture's lean: out over the drop toward the town, a share of the screen's width at most, and up a tenth of its height)
	var vs: Vector2 = main.get_viewport().get_visible_rect().size / 2.0
	var pan := scene_pan()
	h.lean = Vector2(float(scene["side"]) * minf(vs.x * float(E["share"]), float(E["most"])) * pan, -vs.y * 0.1 * pan) * 2.0
	# (no buttons; black bars across the top and the bottom of the screen, as a film's)
	main._hud.visible = false
	main._mini.visible = false
	var full: Vector2 = main.get_viewport().get_visible_rect().size
	var bar := roundf(full.y * 0.11 * scene_bars())
	_bar_rects[0].visible = true
	_bar_rects[1].visible = true
	_bar_rects[0].position = Vector2.ZERO
	_bar_rects[0].size = Vector2(full.x, bar)
	_bar_rects[1].position = Vector2(0, full.y - bar)
	_bar_rects[1].size = Vector2(full.x, bar)


func scene_pan() -> float:
	if scene.is_empty():
		return 0.0
	var E: Dictionary = Q["eyrie"]
	var t: float = scene["t"]
	match scene["phase"]:
		"out":
			return _ease(minf(1.0, t / float(E["out"])))
		"hold":
			return 1.0
		"back":
			return 1.0 - _ease(minf(1.0, t / float(E["back"])))
	return 0.0


func scene_bars() -> float:
	if scene.is_empty():
		return 0.0
	var t: float = scene["t"]
	if scene["phase"] == "wait":
		return minf(1.0, t / 0.6)
	if scene["phase"] == "back":
		return 1.0 - minf(1.0, t / float(Q["eyrie"]["back"]))
	return 1.0


static func _ease(k: float) -> float:
	return k * k * (3.0 - 2.0 * k)


func _scene_off() -> void:
	if main == null:
		return
	if main.hero != null:
		main.hero.scene_pace = 0.0
		main.hero.auto_dir = Vector2.ZERO
		main.hero.lean = Vector2.ZERO
	if main._hud != null:
		main._hud.visible = true
	if main._mini != null:
		main._mini.visible = true
	for r in _bar_rects:
		r.visible = false


## A THING LYING (render.ts drops, standMeldDrop): runedust bursting up out of the floor and lying in its heap (art/meld_drops.ts:
## its spill over 0.75 s, then its heap's round of 16 at 10 a second; heapOf: two or fewer, four or fewer, more), glittering, its
## light on the floor; a piece of the ward-stone or a page of the muster roll, hopping as it lands (9 game pixels over 0.4 s),
## named over it. Each the game's own picture (tools/godot_fx.ts `rd_`, `q6_`), where its film is made.
class _Thing extends Node2D:
	var q
	var what := ""
	var n := 0
	var age := 0.0
	var _pic

	func _ready() -> void:
		# (its picture stands among the figures by its own depth: loot.gd _FilmPic, beside this in the same layer)
		_pic = Loot._FilmPic.new()
		get_parent().add_child.call_deferred(_pic)

	func _exit_tree() -> void:
		if _pic != null and is_instance_valid(_pic):
			_pic.queue_free()

	func _process(_dt: float) -> void:
		if _pic == null or not _pic.is_inside_tree():
			return
		var d := position.y / 16.0
		if what == "dust":
			var heap := 0 if n <= 2 else (1 if n <= 4 else 2)
			var spill: float = float(q.Q["dust"]["spill"])
			if age < spill:
				_pic.put("rd_spill_%d" % heap, mini(floori(age * 30.0), floori(spill * 30.0) - 1), position, d - 0.2)
			else:
				_pic.put("rd_heap_%d" % heap, floori(q._clock * float(q.Q["dust"]["fps"])) % 16, position, d - 0.2)
			# (its glow on the floor round it)
			if q.main.look != null:
				q.main.look.spot(position / 2.0 + Vector2(0, -3), 14.0, 0.35)
			return
		var pop := sin(age / 0.4 * PI) * 9.0 if age < 0.4 else 0.0
		_pic.put("q6_piece" if what == "piece" else "q6_roll", 0, position, d - 0.2, pop * 2.0)


## RUNEDUST TAKEN (render.ts standMeldMoments, its whirls): it whirls up round him and pours into him, behind him and in front, a
## little bigger the more there was (0.85, 1, 1.15).
class _Whirl extends Node:
	var q
	var n := 0
	var t := 0.0
	var _back
	var _front

	func _ready() -> void:
		var stands: Node = q.main.hero.get_parent()
		_back = Loot._FilmPic.new()
		_front = Loot._FilmPic.new()
		stands.add_child.call_deferred(_back)
		stands.add_child.call_deferred(_front)

	func _exit_tree() -> void:
		for p in [_back, _front]:
			if p != null and is_instance_valid(p):
				p.queue_free()

	func _process(dt: float) -> void:
		t += dt
		var k := floori(t * 30.0)
		var most := floori(float(q.Q["dust"]["whirl"]) * 30.0)
		if k >= most:
			queue_free()
			return
		if not _back.is_inside_tree():
			return
		var h = q.main.hero
		var scale := 0.85 if n <= 2 else (1.0 if n <= 4 else 1.15)
		var hd: float = h.world.x + h.world.y
		_back.put("rd_whirl_back", k, h.position, hd - 0.02, 0.0, scale)
		_front.put("rd_whirl_front", k, h.position, hd + 0.02, 0.0, scale)


## THE QUEST MARKS (render.ts questMarks; render/quest_mark.ts drawRuneMark, SMALL_NOTES.questRune on): the wordsmith's great rune
## in the friend's cyan, its seam of deep indigo, at the game's fine grain, bobbing, its glow breathing; every 1.6 s it flashes
## white-hot, its glow thrown wide, rays shot out of it. In town over whoever has something for him (over his head, or over his
## name where the two would lie one on the other); on a floor over its waypoint, 40 game pixels up, while he brings something
## back and it has been seen.
class _Marks extends Node2D:
	const NAME_LIFT := {"gate": 74, "stash": 26, "lexicon": 40, "mystic": 86, "wordsmith": 44, "armourer": 50, "stranger": 40}
	const WAY_MARK_LIFT := 40.0
	var q

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		if not bool(q.Q["switches"]["questMarks"]) or not q.scene.is_empty():
			return
		var main = q.main
		var at: Array = []
		if main.is_home(main.place) and main.town != null:
			var who: Array = q.givers()
			for s in main.town.data["stations"]:
				if not who.has(s["kind"]):
					continue
				var name := Iso.to_screen(float(s["x"]), float(s["y"])) / 2.0 - Vector2(0, float(NAME_LIFT.get(s["kind"], 40)))
				var head = null
				for f in main.town._folk:
					if f["kind"] == s["kind"] and f["node"].texture != null:
						head = f["node"].position / 2.0 + Vector2(0, f["node"].offset.y / 2.0)
				var foot := Vector2(head.x, head.y - 4.0) if head != null and absf(head.y - name.y) > 14.0 else Vector2(name.x, name.y - 4.0)
				# (MARK_CLEAR, on at his yes: over his head but on his name, the rune (17 high, bobbing 2) is put over the name's
				# slip instead (town.gd: name.y - 1 to + 6); it hid the ARMOURER's middle, the bug hunt's fourth round, 25 Nov 2026)
				if q.MARK_CLEAR and foot.y + 2.5 > name.y - 1.0 and foot.y - 18.5 < name.y + 6.0:
					foot = Vector2(name.x, name.y - 4.0)
				at.append(foot)
		elif main.map != null and main.map.waypoint != null and q.turn_in_for() != "":
			var w := Vector2(float(main.map.waypoint["x"]), float(main.map.waypoint["y"]))
			if main.look != null and main.look.data.has("waypoint"):
				w = Vector2(float(main.look.data["waypoint"]["wx"]), float(main.look.data["waypoint"]["wy"]))
			if main.sight == null or main.sight.seen_at(w):
				at.append(Iso.to_screen(w.x, w.y) / 2.0 - Vector2(0, WAY_MARK_LIFT))
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		for p in at:
			_rune(p.round(), q._clock)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	static func _half(v: float) -> float:
		return roundf(v * 2.0) / 2.0

	## The glow's picture (the canvas's radial gradient): its middle the friend's cyan, or white-hot in a flash, fading straight
	## out to nothing at its rim; its strength laid on as it is drawn.
	var _glows := {}

	func _glow(hot: bool) -> Texture2D:
		if _glows.has(hot):
			return _glows[hot]
		var g := Gradient.new()
		g.set_color(0, Color8(224, 255, 252, 255) if hot else Color8(122, 248, 240, 255))
		g.set_color(1, Color8(122, 248, 240, 0))
		var tex := GradientTexture2D.new()
		tex.gradient = g
		tex.fill = GradientTexture2D.FILL_RADIAL
		tex.fill_from = Vector2(0.5, 0.5)
		tex.fill_to = Vector2(1.0, 0.5)
		tex.width = 64
		tex.height = 64
		_glows[hot] = tex
		return tex

	func _flash(t: float) -> float:
		var F: Dictionary = q.Q["marks"]["flash"]
		var every: float = F["every"]
		var p := fposmod(t, every)
		if p < float(F["rise"]):
			return p / float(F["rise"])
		var k := 1.0 - (p - float(F["rise"])) / float(F["fall"])
		return k * k if k > 0.0 else 0.0

	func _rune(foot: Vector2, t: float) -> void:
		var M: Dictionary = q.Q["marks"]
		var rows: Array = M["rune"]
		var w := float(str(rows[0]).length()) / 2.0
		var h := float(rows.size()) / 2.0
		var x0 := _half(foot.x - w / 2.0)
		var y0 := _half(foot.y - h + 0.5 + sin(t * 3.2) * 2.0)
		var f := _flash(t)
		var cx := x0 + w / 2.0
		var cy := y0 + h / 2.0
		# (its glow, soft, breathing a little; thrown wide in its flash)
		var r := 12.0 + float(M["flash"]["glow"]) / 2.0 * f * 2.0
		var a := minf(0.9, 0.3 + 0.08 * sin(t * 3.2 + 1.0) + 0.45 * f)
		draw_texture_rect(_glow(f > 0.5), Rect2(cx - r, cy - r, r * 2.0, r * 2.0), false, Color(1, 1, 1, a))
		# (its rays, in its flash: up, down and to its sides, long; between them, short)
		if f > 0.04:
			var from := minf(w, h) / 2.0 + 1.0
			for k8 in 8:
				var ang := k8 * PI / 4.0
				var long := ((float(M["flash"]["rays"]) if k8 % 2 == 0 else float(M["flash"]["rays"]) * 0.45) / 2.0) * f
				var s := 0.0
				while s < long:
					var col := Color("#ffffff") if s < long * 0.45 else (Color("#a0fcf6") if s < long * 0.8 else Color("#58ecec"))
					var thick := 1.0 if s < long * 0.5 else 0.5
					draw_rect(Rect2(_half(cx + cos(ang) * (from + s) - thick / 2.0), _half(cy + sin(ang) * (from + s) - thick / 2.0), thick, thick), col)
					s += 0.5
		var tones: Dictionary = M["hot"] if f > 0.35 else M["colors"]
		for j in rows.size():
			var row: String = rows[j]
			var i := 0
			while i < row.length():
				var c := row[i]
				var n := 1
				while i + n < row.length() and row[i + n] == c:
					n += 1
				if c != ".":
					draw_rect(Rect2(x0 + i / 2.0, y0 + j / 2.0, n / 2.0, 0.5), Color(str(tones[c])))
				i += n


## HIS LINE AT THE EDGE (render/fx.ts quip): over his head on a dark slip, its tail pointing down at him, white (gold for its first
## tenth of a second), lifting 4 game pixels as it comes; up QUIP_TIME, going over its last 0.4 s.
class _Quip extends Node2D:
	var q

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var qt: float = float(q.scene.get("quip", -1.0)) if not q.scene.is_empty() else -1.0
		if qt < 0.0 or qt > QUIP_TIME:
			return
		var text: String = q.T["eyrie"]
		var h = q.main.hero
		var a := 1.0 if qt < QUIP_TIME - 0.4 else maxf(0.0, (QUIP_TIME - qt) / 0.4)
		var w := PF.width(text) + 10.0
		var p: Vector2 = h.position / 2.0
		var y := roundf(p.y) - 52.0 - roundf(minf(1.0, qt / 0.12) * 4.0)
		var foot := y + 1.0 + 10.0
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var ink := Color(Color("#120d18"), 0.72 * a)
		draw_rect(Rect2(roundf(p.x) - floorf(w / 2.0), y - 3.0, w, 14.0), ink)
		draw_rect(Rect2(roundf(p.x) - 2.0, foot, 5, 1), ink)
		draw_rect(Rect2(roundf(p.x) - 1.0, foot + 1.0, 3, 1), ink)
		draw_rect(Rect2(roundf(p.x), foot + 2.0, 1, 1), ink)
		PF.draw(self, text, roundf(p.x), y, Color(Color("#ffd27a") if qt < 0.1 else Color.WHITE, a), {"align": "center", "shadow": Color(Color("#120d18"), a)})
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
