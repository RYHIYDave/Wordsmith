## THE QUEST LINE OF FLOORS 16 TO 20 (game/quests1620.ts QUESTS1620, SONG, QUEST1620_TEXT; game.ts birdDue, courtDue, handIn1620,
## towerShut, birdBossDown, birdPartTaken, quests1620Made, tick1620, captainUsed, songReady, sing; render.ts the knight-captain,
## the quest drops), as the game has it. What the hero has done of it is his, and outlasts the place (save.gd). Planned with him,
## 13 Nov 2026: of the songbird, “I like it but I’d like another couple of side quests in there”; the bird required to open the
## tower, “Yes, required (Recommended)”; “Only The Whole Court”; the Captain's Voice, “Yes, add it (Recommended)”.
##   THE CLOCKWORK SONGBIRD (the armourer; required):
##   1. HIS ASK ("Armourer: a task"), once the Princess (16) has fallen: the King's clockwork songbird, broken.
##   2. ITS PARTS, each once (a bit each), asked for or not: the Prince (17) drops its KEY as he falls, the Queen (18) its SPRING;
##      the bird itself lies broken before the King's throne (19), taken by walking up to it once he has fallen.
##   3. MENDED ("Armourer: the songbird"): one of the deepest words for it (birdWords); its song opens the Quiet Tower: from the
##      Keep the way on takes one whose bird is not mended home to the camp, the tower's door shut; mended (the King fallen), the
##      camp's waypoint takes him up to the tower, 20.
##   4. AGAINST THE MOTH (20): once each of its phases, E: the bird sings: every cloud of its dust blows away, his words come back,
##      the Moth is stunned SONG.stun seconds (act3/moth.gd asks `song_ready` and calls `sing`).
##   THE WHOLE COURT (the stranger): once he holds a royal's card, the stranger asks for one of each royal's; brought, they are taken
##   from his hand, and a piece that is worth more than any hand lies at his feet.
##   THE CAPTAIN'S VOICE: on floor 12 a second bottled voice lies in a side chamber of the sewers, the knight-captain's (the Crier's
##   jar's picture, labelled), his by walking up to it; on floor 19 the King's knight-captain stands silent in the barracks (the
##   knights' lair) and does not fight; brought his voice, he speaks, his knights stand down (gone from the floor, and every time
##   after), and he gives a weapon of the King's armoury.
## (THE UNIQUES are not in the Godot version: where the game gives a unique of his pool, the court and the captain give the piece it
## gives where there is none, a fully modded rare: tools/godot_loot.ts fullRares.)
extends Node

const Iso := preload("res://scripts/iso.gd")
const Loot := preload("res://scripts/loot.gd")
const Words := preload("res://scripts/words.gd")
const RoyalCards := preload("res://scripts/act3/royal_cards.gd")

const MSG_QUEST := Color("#7af8f0")
const PIECE := Color("#e8dcc0")
## (the quest drops: as loot.gd takes what lies, PULL, TAKE, FLY, WAIT)
const PULL := 3.2
const TAKE := 0.75
const FLY := 9.0
const WAIT := 0.4

var main  # main.gd
var Q := {}
var T := {}
## WHAT HE HAS DONE OF IT (game.ts Hero: bird ("asked", "mended"), birdParts (a bit each: 1 the key, 2 the spring, 4 the bird),
## court ("asked", "given"), captainJar ("got", "given"))
var bird := ""
var bird_parts := 0
var court := ""
var captain_jar := ""
## THIS FLOOR'S: the captain's jar while it lies untaken (floor 12); the broken bird before the throne while he has not taken it
## (floor 19); the knight-captain at his post and his figure; the phases of the Moth's fight the bird has sung in (Level.sungIn);
## what lies ({what ("key", "spring"), at, node, age})
var _jar = null
var _bird_at = null
var captain = null
var _captain_node: Node2D
var sung_in := 0
var _things: Array = []
var _prompt := ["", ""]


func _ready() -> void:
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act2/quest1620.json"))
	T = Q["text"]


func on() -> bool:
	return bool(Q.get("on", false))


func _t(key: String, k := -1, w := "") -> String:
	return str(T[key]).replace("{k}", str(k)).replace("{w}", w)


# --- a place come into (main.gd _build) ---

## (game.ts quests1620Made) What of these is in this place: the captain's jar on 12; the broken bird and the knight-captain on 19.
func enter(where: String) -> void:
	_things = []
	_jar = null
	_bird_at = null
	captain = null
	if _captain_node != null and is_instance_valid(_captain_node):
		_captain_node.queue_free()
	_captain_node = null
	sung_in = 0
	if not on() or main.is_home(where) or main.map == null:
		return
	var depth: int = main.map.depth
	if depth == 12 and main.map.captain_jar != null:
		# (in the side chamber nearest the Rat King's cistern; once taken, not there again: the look's state of its jar)
		var cj: Dictionary = main.map.captain_jar
		var k := _jar_variant(cj)
		if captain_jar == "":
			_jar = cj
			if k != "":
				main.look.clear_variant(k)
		elif k != "":
			main.look.show_variant(k, 1.0)
			main.map.walk[int(cj["ty"]) * main.map.w + int(cj["tx"])] = 1
	if depth == 19:
		# (the broken bird before the throne: his to take once the King has fallen; taken, it is not there again)
		var keep = main.map.land.get("keep") if main.map.land != null else null
		if keep != null and keep.get("bird") != null:
			if (bird_parts & int(Q["bits"]["body"])) == 0:
				_bird_at = Vector2(float(keep["bird"]["x"]), float(keep["bird"]["y"]))
			elif main.look != null and main.look.data.get("variants", {}).has("bird"):
				main.look.show_variant("bird", 1.0)
		# (the knight-captain, silent in the barracks, the knights' lair: at its middle, stood on no more)
		if main.map.captain != null:
			captain = Vector2(float(main.map.captain["x"]), float(main.map.captain["y"]))
			_make_captain()
		# (his voice given him: his knights stand down, every time after)
		if captain_jar == "given":
			_stand_down(false)
		elif captain_jar == "got":
			_speak_captain()


## The look's state that is this jar's (`jar<i>`), or "".
func _jar_variant(cj: Dictionary) -> String:
	if main.look == null:
		return ""
	for k in main.look.data.get("variants", {}):
		var v: Dictionary = main.look.data["variants"][k]
		if str(v.get("kind", "")) == "jar" and int(v["at"]["tx"]) == int(cj["tx"]) and int(v["at"]["ty"]) == int(cj["ty"]):
			return k
	return ""


# --- the armourer and the stranger (game.ts birdDue, courtDue, handIn1620) ---

## What the armourer has for this hero of the songbird: his ask (the Princess fallen), or the three parts brought; "".
func bird_due() -> String:
	if not on():
		return ""
	if bird != "mended" and bird_parts == int(Q["bits"]["all"]):
		return "birdGive"
	if bird == "" and int(main.loot.cleared) >= 16:
		return "birdAsk"
	return ""


## What the stranger has for this hero: his ask for a whole court (a royal's card held), or the four brought; "".
func court_due() -> String:
	if not on() or court == "given":
		return ""
	var cards: Dictionary = main.loot.cards
	var all := true
	var any := false
	for r in RoyalCards.ROYALS:
		if int(cards.get(r, 0)) > 0:
			any = true
		else:
			all = false
	if all:
		return "courtGive"
	if court == "" and any:
		return "courtAsk"
	return ""


func prompt_of(due: String) -> String:
	match due:
		"birdAsk":
			return _t("birdAskPrompt")
		"birdGive":
			return _t("birdGivePrompt")
		"courtAsk":
			return _t("courtAskPrompt")
		"courtGive":
			return _t("courtGivePrompt")
	return ""


## The armourer or the stranger, at `at`: asks, or takes what was asked for and rewards it.
func hand_in(due: String, at: Vector2) -> void:
	var loot = main.loot
	main.fx.event({"t": "questGiven", "x": at.x, "y": at.y})
	if due == "birdAsk" or due == "courtAsk":
		if due == "birdAsk":
			bird = "asked"
		else:
			court = "asked"
		main.sfx.play("power", linear_to_db(0.6))
		loot.say(_t(due), MSG_QUEST)
		return
	if due == "birdGive":
		# (mended: one of the deepest words for it; and, the King fallen, the camp's waypoint on up to the Quiet Tower)
		bird = "mended"
		var list: Array = Q["birdWords"]
		var w: String = list[randi() % list.size()]
		loot._know(w)["found"] = true
		loot.gain_word(w)
		var tower: bool = int(loot.cleared) >= 19 and int(main.way_depth) < 20
		if tower:
			main.way_depth = 20
		main.sfx.play("rare")
		loot.say(_t("birdMendedTower" if tower else "birdMended", -1, str(Words.word(w)["name"]).to_upper()), MSG_QUEST)
		return
	if due != "courtGive":
		return
	# (the whole court: one of each royal's card taken from his hand; a piece worth more than any hand, at his feet)
	for r in RoyalCards.ROYALS:
		loot.cards[r] = maxi(0, int(loot.cards.get(r, 0)) - 1)
		if int(loot.cards[r]) <= 0:
			loot.cards.erase(r)
	court = "given"
	var it = _reward(["amulet", "ring", "belt"][randi() % 3])
	if it != null:
		loot.lay_item(main.hero.world, it)
	main.sfx.play("rare")
	loot.say(_t("courtGiven"), MSG_QUEST)


## A fully modded rare of slot `sl` at the level the game rolls it at, max(1, power, min(20, floors cleared)) (game.ts handIn1620,
## captainUsed: rollFullRare): the game's own, for each level the High City may give.
func _reward(sl: String):
	var lv := clampi(maxi(maxi(1, int(main.last_floor)), mini(20, int(main.loot.cleared))), 10, 20)
	var pool: Array = main.loot._full_rares.get(str(lv), {}).get(sl, [])
	return pool[randi() % pool.size()].duplicate(true) if not pool.is_empty() else null


# --- the tower's door (game.ts towerShut) ---

## From the Keep (19) the way on, the songbird not mended: the Quiet Tower's door shut (not for one who has been up it).
func tower_shut() -> bool:
	return on() and main.map != null and int(main.map.depth) == 19 and bird != "mended" and int(main.way_depth) < 20


# --- the songbird's parts (game.ts birdBossDown, dropBirdPart, birdPartTaken) ---

## (loot.gd on_kill) A boss fallen: the Prince's key, the Queen's spring (each once, asked for or not).
func killed(m) -> void:
	if not on() or not m.boss:
		return
	if m.kind == "prince":
		_drop_part(int(Q["bits"]["key"]), "key", m.world)
	elif m.kind == "gqueen":
		_drop_part(int(Q["bits"]["spring"]), "spring", m.world)


func _drop_part(bit: int, what: String, at: Vector2) -> void:
	if (bird_parts & bit) != 0:
		return
	for t in _things:
		if t["what"] == what:
			return
	_thing(what, main.loot.floor_near(at))


func parts_taken() -> int:
	return (bird_parts & 1) + ((bird_parts >> 1) & 1) + ((bird_parts >> 2) & 1)


## A part of the songbird taken (the key, the spring, the bird itself).
func _part_taken(bit: int, what: String) -> void:
	var h = main.hero
	bird_parts |= bit
	main.sfx.play("rare")
	main.loot.say(_t("partGotBody" if what == "body" else ("partGotKey" if what == "key" else "partGotSpring"), parts_taken()), MSG_QUEST)
	main.fx.event({"t": "text", "x": h.world.x, "y": h.world.y, "text": "SONGBIRD %d / 3" % parts_taken(), "color": "#e8dcc0"})


# --- what lies (render.ts drops, 'quest': art/quest1620.ts keySprite, springSprite) ---

func _thing(what: String, at: Vector2) -> void:
	var node := _Thing.new()
	node.pic = main.loot.pics["quest:" + what]
	node.sheet = main.loot.sheet
	node.q = self
	node.at = at
	node.position = Iso.to_screen(at.x, at.y)
	main.hero.get_parent().add_child(node)
	var label := Loot._Tag.new()
	label.text = _t("keyLabel") if what == "key" else _t("springLabel")
	label.color = PIECE
	label.up = 18.0
	label.z_index = 60
	node.add_child(label)
	_things.append({"what": what, "at": at, "node": node, "age": 0.0})


# --- the knight-captain (render.ts: the Keep's own knight, silent at his post, turned to the hero; named) ---

func _make_captain() -> void:
	var figure := ""
	var M = main._monsters
	if M != null and M._plain.has("kknight"):
		figure = str(M._plain["kknight"]["figure"])
	var art = M.figure_of(figure) if M != null and figure != "" else null
	if art == null:
		return
	_captain_node = _Captain.new()
	_captain_node.art = art
	_captain_node.q = self
	_captain_node.position = Iso.to_screen(captain.x, captain.y)
	M.stands.add_child(_captain_node)
	var label := Loot._Tag.new()
	label.text = _t("captainLabel")
	label.color = PIECE
	var L = load("res://scripts/fx_looks.gd")
	var size = L.FIGURE_SIZE.get(figure, L.FIGURE_SIZE.get("kknight"))
	label.up = (float(size["top"]) if size != null else 40.0) + 8.0
	label.z_index = 60
	_captain_node.add_child(label)


## Whether he stands beside the knight-captain (game.ts captainNear).
func captain_near() -> bool:
	return captain != null and main.hero != null and main.hero.world.distance_to(captain) <= float(Q["song"]["captainNear"])


## The knight-captain spoken to: with his voice in hand, he speaks, his knights stand down, his gift; else, silent (captainUsed).
func captain_used() -> void:
	var loot = main.loot
	if captain_jar != "got":
		loot.say(_t("captainAgain") if captain_jar == "given" else _t("captainSilent"), MSG_QUEST)
		return
	captain_jar = "given"
	_stand_down(true)
	var weapon: String = str(loot.gear.get("mainhand", {}).get("weapon", "")) if loot.gear.get("mainhand") != null else ""
	var it = _reward("mainhand:" + weapon)
	if it == null:
		it = _reward("mainhand:greatsword")
	if it != null:
		loot.lay_item(main.hero.world, it)
	main.fx.event({"t": "questGiven", "x": captain.x, "y": captain.y})
	main.sfx.play("rare")
	loot.say(_t("captainSpeaks"), MSG_QUEST)
	if main.guide != null and main.guide._speak.get("who", "") == "knight-captain":
		main.guide._speak = {}


## His knights stand down: gone from the floor (said over each, as he speaks).
func _stand_down(said: bool) -> void:
	var M = main._monsters
	if M == null:
		return
	for m in M.list.duplicate():
		if is_instance_valid(m) and m.kind == "kknight" and not m.dead:
			if said:
				main.fx.event({"t": "text", "x": m.world.x, "y": m.world.y, "text": "Stands down", "color": "#e8dcc0"})
			M.list.erase(m)
			m.queue_free()


## (game.ts speakTo knight-captain, SPEAK_RETURN) "Return to the KNIGHT-CAPTAIN": with his voice in hand, taken, or come into the Keep.
func _speak_captain() -> void:
	if main.guide != null:
		main.guide._speak = {"who": "knight-captain", "t": float(main.loot.quest_text["speakSecs"]), "back": true}


# --- each frame (game.ts tick1620, interact) ---

func _process(dt: float) -> void:
	_prompt = ["", ""]
	if main == null or main.hero == null or not on() or main.map == null or main.is_home(main.place):
		return
	_take_things(dt)
	var h = main.hero
	# (the broken bird before the throne, walked up to, the King fallen: his song at his death ends in his hands)
	if _bird_at != null and h.alive and h.world.distance_to(_bird_at) <= float(Q["song"]["reach"]) and not _king_alive():
		_bird_at = null
		var perils = main._monsters.perils if main._monsters != null else null
		if perils != null:
			for p in perils.list:
				if p.get("kind") == "a1" and p.get("a1") == "gking:bird":
					p["dur"] = minf(float(p["dur"]), float(p["t"]))
		if main.look != null and main.look.data.get("variants", {}).has("bird"):
			main.look.show_variant("bird", 1.0)
		_part_taken(int(Q["bits"]["body"]), "body")
	# (the captain's jar in the sewers, walked up to: it is his)
	if _jar != null and h.alive and h.world.distance_to(Vector2(float(_jar["x"]), float(_jar["y"]))) <= float(Q["song"]["reach"]):
		var k := _jar_variant(_jar)
		if k != "":
			main.look.show_variant(k, 1.0)
		main.map.walk[int(_jar["ty"]) * main.map.w + int(_jar["tx"])] = 1
		_jar = null
		captain_jar = "got"
		main.sfx.play("rare")
		main.loot.say(_t("captainJarGot"), MSG_QUEST)
		_speak_captain()
	# (beside the knight-captain, E speaks to him)
	if captain_near():
		_prompt = ["E: " + (_t("captainGivePrompt") if captain_jar == "got" else _t("captainPrompt")), "captain"]
		if Input.is_action_just_pressed("interact") and h.alive and not main._inv.visible:
			captain_used()


func _king_alive() -> bool:
	if main._monsters == null:
		return false
	for m in main._monsters.list:
		if is_instance_valid(m) and m.kind == "gking" and not m.dead:
			return true
	return false


## Where the broken songbird lies for him to take, the King fallen (render.ts names it), or null.
func bird_spot():
	return _bird_at if _bird_at != null and not _king_alive() else null


## What E would do here, of these: [shown, what].
func prompt() -> Array:
	return _prompt


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
				t["node"].at = t["at"]
				t["node"].position = Iso.to_screen(t["at"].x, t["at"].y)
			if t["at"].distance_to(h.world) <= TAKE:
				took = true
		if took:
			t["node"].queue_free()
			_part_taken(int(Q["bits"]["key"]) if t["what"] == "key" else int(Q["bits"]["spring"]), t["what"])
		else:
			keep.append(t)
	_things = keep


## THE SONGBIRD'S KEY OR SPRING LYING (render.ts drops, 'quest'; art/quest1620.ts): hopping as it lands (9 game pixels over 0.4 s),
## named over it, motes of the friend's cyan rising off it now and then.
class _Thing extends Node2D:
	var q
	var sheet: Texture2D
	var pic: Dictionary
	var at := Vector2.ZERO
	var age := 0.0
	var _mote := 0.0

	func _process(dt: float) -> void:
		queue_redraw()
		_mote += dt
		if _mote >= 0.1:
			_mote = 0.0
			if randf() < 0.3:
				q.main.fx.mote(at.x, at.y, PackedColorArray([Color("#7fe8ff"), Color.WHITE]))

	func _draw() -> void:
		var pop := sin(age / 0.4 * PI) * 9.0 if age < 0.4 else 0.0
		var r: Rect2 = pic["rect"]
		draw_texture_rect_region(sheet, Rect2(-pic["anchor"] + Vector2(0, -roundf(pop) * 2.0), r.size), r)


## THE KNIGHT-CAPTAIN at his post: the Keep's own knight standing, turned to the hero (render.ts actorSprite 'idle').
class _Captain extends Node2D:
	var q
	var art
	var _t := 0.0
	var _s: Sprite2D

	func _ready() -> void:
		_s = Sprite2D.new()
		_s.centered = false
		add_child(_s)

	func _process(dt: float) -> void:
		_t += dt
		var h = q.main.hero
		var d: Vector2 = h.world - q.captain if h != null else Vector2(1, 0)
		if d.length() < 1e-6:
			d = Vector2(1, 0)
		d = d.normalized()
		var n: int = art.count(0, "idle")
		if n <= 0:
			return
		var f: Dictionary = art.frame(d.x, d.y, "idle", int(_t * art.fps("idle")) % n)
		_s.texture = f["tex"]
		_s.offset = f["offset"]
		_s.flip_h = f["flip"]
		_s.scale = Vector2.ONE * float(f["scale"])
