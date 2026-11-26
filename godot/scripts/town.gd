## THE TOWN as a new Warrior's game begins in it (game/level.ts makeTown, Game.enterTown; tools/godot_town.ts saved it):
## the walled square in the vault's stone, its braziers, pillars, barrels and urn; the smithy (the forge, its fire, the
## anvil, the rack of arms, the trough) and the armourer; the bazaar (the tent, its table of wares, the rug) and the mystic;
## the wordsmith in his ring of six standing stones, the circle cut in the floor, the slab made for the master rune-stone;
## the stranger in the dark corner; the Lexicon, the stash; the stairs down to floor 1 and the shaft's head.
##   ITS PEOPLE (art/townscene.ts, townsfolk3.ts): each at his work, 30 frames a second, his loop three times (the
##   stranger's twice) and then what he does; turned to the hero when he comes within 1.45 tiles, back past 1.95.
##   THE RING (art/quest3.ts POWER): dark until the stone is given; given, the stone is laid in the slab (1.9 s), its rune
##   catches (2.3), the slab's four runes (2.9), the light runs round the circle both ways catching each stone as it
##   reaches it (to 4.1), all flare, and at 4.7 it is the ring burning, its pulse going stone to stone. The wordsmith's
##   own runes are cold while it is dark, and catch as it flares.
##   USING THINGS (E; game.ts interact, TUNE.useRange 1.9): the wordsmith, the armourer, the mystic (across her table);
##   the stairs' top step takes him down (ways.ts onTopStep).
##   THE ARMOURER'S QUEST (game/quests15.ts; game.ts handIn, armourerHandIn): once the wordsmith's ring is lit the armourer
##   has a task ("Armourer: a task"): used, he asks the hero to put out floor 3's furnace; the furnace out ("Armourer: the
##   furnace is out"), used, he gives his word, HEAVY. While he has either, using him gives it in place of his shelves; with
##   neither, his shelves. Where the hero stands in it is his own (loot.gd `furnace`).
##   THE WORDSMITH'S QUEST (game/quests15.ts; game.ts handIn 'meldAsk', 'meldstone', takeMeldstone): the armourer's reward
##   given, the wordsmith has a task ("Wordsmith: a task"): used, he asks for the MELDSTONE from the cult's stronghold under the
##   ossuary (floor 5, the Fleshmancer's: loot.gd). Carried back ("Give the Meldstone"), used, he takes it: he can meld, he
##   gives the two words to meld and the lesson, and the gate down the mountain is unbarred; from then on, used ("E: Wordsmith"),
##   he opens his half of the screen, its second page MELDING (inventory.gd, THE WORDSMITH'S HALF; loot.gd meld_words); the stone goes round
##   the column of light over his slab, turning as it goes (render.ts standMeldMoments, KEPT; its flight to the slab and its
##   halves whirling there are not brought over).
##   THE GATE in the back wall (game/ways.ts, game.ts updateWays, raiseGate, enterTown; the layout's `gate`: tools/godot_town.ts):
##   barred until the Meldstone is brought (main.gd way_depth under 6): it does not rise, and once a visit, as he comes within 4
##   tiles of it, "The gate is barred.". Unbarred, the first time he comes within 6 tiles of it (UNBAR_SEEN) its bars are
##   struck off (its film, UNBAR_SECS; "The gate is unbarred. Beyond it, the mountain road."), the gate staying down while it
##   plays; from then on it rises as he comes within 6 (GATE_RISE_AT, 1.1 s up) and falls once he is further than 8
##   (GATE_FALL_AT, 0.22 s down); up, walking into its doorway takes him out onto the mountain: floor 6, the Quarry. Come in
##   through it from floor 10, it stands up behind him. Its pictures are the game's own (render.ts standDoors: the portcullis at
##   its height, art/gates.ts; the bars, their unbarring and what is left of them, art/town_ways.ts: tools/godot_fx.ts `tg_`),
##   strip by strip, each at its own depth; until those films are made, the castle hall's look shows the gate barred.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Loot := preload("res://scripts/loot.gd")
const Perils := preload("res://scripts/perils.gd")
## (game/ways.ts: the gate rises within GATE_RISE_AT tiles of its middle and falls past GATE_FALL_AT; its unbarring seen within
## UNBAR_SEEN and as long as its film, UNBAR_SECS; game/doors.ts GATE_RISE, GATE_FALL: how long it takes to go up and to come
## down)
const GATE_RISE_AT := 6.0
const GATE_FALL_AT := 8.0
const UNBAR_SEEN := 6.0
const UNBAR_SECS := 78.0 / 30.0
const GATE_RISE := 1.1
const GATE_FALL := 0.22
## (render/meld_drops.ts: the kept Meldstone, round the column of light over the slab: how far out, once round in so many
## seconds, how high, how far it bobs, how much bigger)
const ORBIT := {"r": 0.75, "secs": 7.0, "z": 40.0, "bob": 1.5, "scale": 1.35}

const DIR := "res://assets/town"
const FOLK_DIR := "res://assets/townsfolk"
const FPS := 30.0
const TURN_TO := 1.45
const TURN_BACK := 1.95
## THE TOWN'S SERVICES' NAMES (render.ts STATION_NAME, NAME_LIFT): over each, so a newcomer can see what is where
## THE LEXICON IN THE STASH (his words, 24 Nov 2026: “I'd also like to get rid of the lexicon in the middle of town and add it to the
## stash chest.  We have a new UI for the rune bag and lexicon in the inventory screen so information on runes is all right there.”):
## the town, Vellum's camp and the Rim have no Lexicon of their own; its shelf of kept words opens from the stash (inventory.gd, the
## LEXICON button on the stash's half). ON at his “Yes” to its three pictures (24 Nov 2026).
static var LEXICON_IN_STASH := true
const STATION_NAME := {"gate": "GATE", "wordsmith": "WORDSMITH", "armourer": "ARMOURER", "mystic": "MYSTIC", "lexicon": "LEXICON", "stash": "STASH", "stranger": "STRANGER"}
const NAME_LIFT := {"gate": 74.0, "stash": 26.0, "lexicon": 40.0, "mystic": 86.0, "wordsmith": 44.0, "armourer": 50.0, "stranger": 40.0}
const PF := preload("res://scripts/pixel_font.gd")
const Glow := preload("res://scripts/figure_glow.gd")
## THE RING'S MOMENTS (render.ts standRing3; art/ring3.ts swirlAt, art/townscene.ts swirlNow, columnSprite; art/quest3.ts floatingOf):
## the letters of light that swirl round the wordsmith, the column of light over his slab, and the master rune-stone given, rising
## out of the hero, floating over the slab, lying down and laid in with a burst of its light. Their pictures: tools/godot_ring.ts.
const RFX_DIR := "res://assets/town/ring_fx"
const USE := 1.9
## (townscene.ts: each person's clock, how many times his loop goes round before he does his thing, the way he works)
const FOLK := {
	"armourer": {"phase": 0.0, "loops": 3, "work": "sw", "sound": ["anvil", 26.0 / 30.0]},
	"mystic": {"phase": 3.1, "loops": 3, "work": "sw", "sound": ["crystal", 34.0 / 30.0]},
	"wordsmith": {"phase": 6.4, "loops": 3, "work": "sw", "sound": ["rune_write", 0.3]},
	"stranger": {"phase": 4.7, "loops": 2, "work": "se", "sound": ["coin", 16.0 / 30.0]},
}
const ASK := "The wordsmith: \"My ring is dark. Another of my craft took the MASTER RUNE-STONE down into the crypt, and never came back. Find him. Bring me the stone.\""

var main  # main.gd
var hero
var loot
var sfx
var stands: Node2D
var flats: Node2D
var data: Dictionary
## what is said to him now, and what E would do: [text, action]
var prompt := ["", ""]
var given_at := -1.0
## (the place has its recorded look, the castle's hall: look.gd draws its things; here only the ring and the people)
var looked := false

var _pics := {}
var _sheet: Texture2D
var _folk_data: Dictionary
var _folk_lists := {}
var _folk_sheets: Array[Texture2D] = []
var _folk_cache := {}
var _things: Array = []  # {kind, node, variant, x, y}
## (the ring's moments: their pictures, the sprites they are shown on, the layer of their lights, where the ring and the slab are)
var _rfx := {}
var _rfx_tune := {}
var _rfx_tex: Texture2D
var _letters: Array = []
var _column: Sprite2D
var _stone: Sprite2D
var _flash: Sprite2D
var _rfx_lights: Node2D
var _rfx_lit: Array = []
var _ring_mid = null
var _slab_mid = null
var _folk: Array = []  # {kind, node, x, y, to, last_act}
var _names: Node2D
var _t := 0.0
var _ring := {}
var _word_due := -1.0
## THE GATE (game.ts Ways.barred, Ways.unbar, the gate's DoorInst want and open): barred; its unbarring (-1 waiting for him to
## come in sight of it, 0 and on how long since it began, null none to play); the line said this visit; down or up.
var barred := true
var unbar = null
var told_barred := false
var gate_want := 0.0
var gate_open := 0.0
var _gate := {}
## (the gate's strips: the portcullis's and the bars', each a picture of the game's own, by its place along the plane; where
## each stands, tools/godot_fx.ts `tables.tg`; the unbarring's last frame played, for its jolts)
var _port := {}
var _bars := {}
var _unbar_f := -1
var _kept: Array = []
## THE CAMP INSIDE VELLUM'S GATE (game/camp.ts), his town from floor 10 on: its layout assets/camp/layout.json (tools/godot_town.ts),
## its look recorded whole from the game, its keepers and its three people by the fire among it (tools/godot_record.mjs camp);
## its services used as the town's are (the same hand-ins, the wordsmith's half, the armourer's and the mystic's); the prison
## town's own pieces (its ring of stones drawn here, its people, its stairs, its gate) not in it. No loop under it: the game's
## world loops are off (game/world_sounds.ts WORLD_LOOPS).
var camp := false
const CAMP_DIR := "res://assets/camp"
## THE SHAFT'S RIM (game/rim.ts), endless mode's town, his once it is open to him: its layout assets/rim/layout.json, its look
## recorded whole (as the camp's), what changes on it and its round walking rim.gd; its gate a service: the words burned into the
## next endless level (inventory.gd gate).
var rim := false
const RIM_DIR := "res://assets/rim"
var rim_node = null


func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string((RIM_DIR if rim else CAMP_DIR if camp else DIR) + "/layout.json"))
	# (LEXICON_IN_STASH: no Lexicon of its own in the middle of the place, nor its book on its stand; it is the stash's now)
	if LEXICON_IN_STASH:
		data["stations"] = (data["stations"] as Array).filter(func(s): return str(s["kind"]) != "lexicon")
		data["props"] = (data.get("props", []) as Array).filter(func(p): return str(p["kind"]) != "lexicon")
	# (DELVE DEEPER: the Shaft's Rim's record stone is used, the way deeper: main.gd delve_deeper)
	if rim and main != null and main.delve_on() and data.get("at", {}).has("record"):
		var r: Dictionary = data["at"]["record"]
		(data["stations"] as Array).append({"kind": "record", "x": float(r["x"]) + 0.3, "y": float(r["y"]) + 0.3})
	# (the services' names, over everything: render.ts, its labels drawn last)
	_names = Node2D.new()
	_names.z_index = 60
	_names.draw.connect(_draw_names)
	add_child(_names)
	_sheet = load(DIR + "/pics.png")
	for p in JSON.parse_string(FileAccess.get_file_as_string(DIR + "/pics.json")):
		_pics[p["name"]] = {"rect": Rect2(p["x"], p["y"], p["w"], p["h"]), "anchor": Vector2(p["ax"], p["ay"]), "tex": _sheet}
	# (the castle hall's own pictures of the ring, where its look has them: in its sheet under the same names)
	if looked and FileAccess.file_exists("res://assets/looks/town_pics.json"):
		var ls: Texture2D = load("res://assets/looks/town.png")
		var lp: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/looks/town_pics.json"))
		for k in lp:
			if _pics.has(k):
				var a: Array = lp[k]
				_pics[k] = {"rect": Rect2(a[0], a[1], a[2], a[3]), "anchor": Vector2(a[4], a[5]), "tex": ls}
	_folk_data = JSON.parse_string(FileAccess.get_file_as_string(FOLK_DIR + "/townsfolk.json"))
	for s in _folk_data["sheets"]:
		_folk_sheets.append(load(FOLK_DIR + "/" + s))
	for l in _folk_data["lists"]:
		_folk_lists[l["name"]] = l["at"]
	_ring = data["ring"] if data.get("ring") != null else {"power": {"done": 0.0, "flare": 0.0}, "stones": []}
	if camp or rim:
		_sounds()
		_lay_gate()
		if rim:
			_rim_ready()
		return
	for p in data["props"]:
		var kind: String = p["kind"]
		var at := Vector2(p["x"], p["y"])
		if FOLK.has(kind):
			var n := Sprite2D.new()
			n.centered = false
			n.position = Iso.to_screen(at.x, at.y)
			stands.add_child(n)
			_folk.append({"kind": kind, "node": n, "x": at.x, "y": at.y, "to": "", "act": -1})
			continue
		if looked and not (kind == "runeRing" or kind == "runeSlab" or kind == "runeStone"):
			continue
		var flat: bool = kind == "rug" or kind == "runeRing"
		var n := Sprite2D.new()
		n.texture = _sheet
		n.region_enabled = true
		n.centered = false
		n.position = Iso.to_screen(at.x, at.y)
		(flats if flat else stands).add_child(n)
		_things.append({"kind": kind, "node": n, "variant": int(p["variant"])})
	# the stairs down, flat on the floor (render.ts flatWays: at the stairs' own corner), and the shaft's head standing
	var st = data["stair"] if not looked else null
	if st != null:
		_flat_pic("stairs down", Vector2(st["x"], st["y"]))
	var sh = data["shaft"] if not looked else null
	if sh != null:
		var at := Vector2(sh["x"] + 0.5, sh["y"] + 0.5)
		var d: float = sh["x"] + sh["y"] + 1.0
		_stand_pic("shaft back", at, d - 0.01)
		_stand_pic("shaft front", at, d + 0.01)
	_sounds()
	_lay_gate()
	_show()


func _flat_pic(name: String, at: Vector2) -> void:
	var n := Sprite2D.new()
	_pic_on(n, name)
	n.position = Iso.to_screen(at.x, at.y)
	flats.add_child(n)


## A picture standing at `at`, sorted among the figures at depth `d` (x + y).
func _stand_pic(name: String, at: Vector2, d: float) -> void:
	var n := Sprite2D.new()
	_pic_on(n, name)
	var top := Iso.to_screen(at.x, at.y)
	n.position = Vector2(top.x, d * Iso.HH)
	n.offset += Vector2(0, top.y - d * Iso.HH)
	stands.add_child(n)


func _pic_on(n: Sprite2D, name: String) -> void:
	var p: Dictionary = _pics[name]
	n.texture = p.get("tex", _sheet)
	n.region_enabled = true
	n.region_rect = p["rect"]
	n.centered = false
	n.offset = -p["anchor"]


## (THE WORLD'S SOUNDS, world_sounds.ts) No loops (the fifteenth batch: WORLD_LOOPS off, no constant sound but the music): the
## braziers' crackle, the forge's and the ring's hum gone; a brazier's pop now and then (sfx.gd AMBIENT fire), heard only right
## beside one, by the nearest (FIRE_REACH).
var _braziers: Array[Vector2] = []
func _sounds() -> void:
	for t in data["props"]:
		if t["kind"] == "brazier" and int(t.get("state", 0)) != 1:
			_braziers.append(Vector2(t["x"], t["y"]))


func _fire_near() -> void:
	if sfx == null or hero == null:
		return
	var fire := 0.0
	for b in _braziers:
		fire = maxf(fire, sfx.by_nearness(b.distance_to(hero.world), sfx.FIRE_REACH["near"], sfx.FIRE_REACH["far"]))
	sfx.amb_near["fire_pop"] = fire


func _process(dt: float) -> void:
	_t += dt
	_fire_near()
	if given_at >= 0.0 and _word_due > 0.0 and _t >= _word_due:
		_word_due = -1.0
		loot.give_word(loot.first_word())
	if not camp and not rim:
		_show()
	elif camp:
		_camp_onward()
	else:
		rim_node.show_state()
	_use()
	if not camp and not rim:
		_ring_moments()
	_names.queue_redraw()
	_step_gate(dt)
	_show_gate()
	_show_kept()
	if not _kept.is_empty():
		_show_given(dt)
	# THE STAIRS DOWN: on their top step he goes down to floor 1 (ways.ts onTopStep)
	var st = data["stair"]
	if st != null and hero.alive:
		var along: float = hero.world.x - st["x"]
		var across: float = hero.world.y - st["y"]
		if along >= -0.1 and along < 0.95 and across >= 0.05 and across < float(st["wide"]) - 0.05:
			main.go_to("floor1", "stairs")


## THE SERVICES' NAMES (render.ts: each station's name `lift` game pixels over it, NAME_LIFT or the place's own; in the friend's pale
## cyan, white for the one he is near enough to use; on a dark plate, in the small letters; one that would lie on another put up
## over it, eight at a time: the labels' own rule).
func _draw_names() -> void:
	var near := station_near()
	var labels: Array = []
	for s in data["stations"]:
		var k := str(s["kind"])
		if not STATION_NAME.has(k):
			continue
		var at: Vector2 = Iso.to_screen(float(s["x"]), float(s["y"])) / 2.0
		labels.append({"x": at.x, "y": at.y - float(s.get("lift", NAME_LIFT[k])), "text": STATION_NAME[k], "color": Color.WHITE if k == near else Color("#b0f0dc")})
	# (THE SHAFT'S RIM: the record stone's name, the endless level reached, and the trophies wall's: render/rim.ts names)
	if rim and rim_node != null:
		for q in rim_node.names():
			var at: Vector2 = Iso.to_screen(q["at"].x, q["at"].y) / 2.0
			labels.append({"x": at.x, "y": at.y - float(q["lift"]), "text": q["text"], "color": Color("#b0f0dc")})
	labels.sort_custom(func(a, b): return a["y"] > b["y"])
	_names.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var placed: Array = []
	for l in labels:
		var w: float = PF.width(l["text"], "small") + 4.0
		var x: float = roundf(l["x"] - w / 2.0)
		var y: float = roundf(l["y"])
		for tries in 12:
			if not placed.any(func(p): return absf(p[1] - y) < 8.0 and x < p[0] + p[2] and p[0] < x + w):
				break
			y -= 8.0
		placed.append([x, y, w])
		_names.draw_rect(Rect2(x, y - 1.0, w, 7.0), Color(Color("#07050a"), 0.78))
		PF.draw(_names, l["text"], x + 2.0, y, l["color"], {"font": "small"})


# --- what each thing shows now ---

func _show() -> void:
	var pw := _power()
	for t in _things:
		var name := _pic_of(t["kind"], t["variant"], pw)
		if name != "":
			var p: Dictionary = _pics[name]
			t["node"].texture = p.get("tex", _sheet)
			t["node"].region_rect = p["rect"]
			t["node"].offset = -p["anchor"]
	for f in _folk:
		_folk_frame(f, pw)


## Where the ring is (art/townscene.ts ringPower): {dark}, or {g: seconds since the stone was given}, or {} burning.
func _power() -> Dictionary:
	if given_at >= 0.0:
		var g := _t - given_at
		if g < float(_ring["power"]["done"]):
			return {"g": g}
		return {}
	return {"dark": true} if not loot.ring_lit else {}


func _pic_of(kind: String, variant: int, pw: Dictionary) -> String:
	var P: Dictionary = _ring["power"]
	match kind:
		"lexicon": return "lexicon %d" % (int(_t * 5) % 4)
		"stash": return "stash"
		"anvil": return "anvil"
		"forge": return "forge %d" % (int(_t * 8) % 4)
		"rack": return "rack"
		"trough": return "trough"
		"rug": return "rug"
		"tentBack": return "tentBack"
		"tentTable": return "tentTable"
		"brazier": return "brazier %d" % ((int(_t * 8) + variant) % 4)
		"pillar", "barrel", "urn": return kind
		"runeRing":
			if pw.has("dark") or (pw.has("g") and pw["g"] < P["slab"]):
				return "ring dark"
			if pw.has("g") and pw["g"] < P["round"]:
				var fuse := clampf((pw["g"] - P["slab"]) / (P["round"] - P["slab"]), 0.0, 1.0)
				return "fuse %d" % roundi(fuse * 16)
			return "ring %d" % (int(_t * 10) % 16)
		"runeSlab":
			if pw.has("dark") or (pw.has("g") and pw["g"] < P["set"]):
				return "slab empty"
			if pw.has("g") and pw["g"] < P["lit"]:
				return "slab set %d" % mini(4, int((pw["g"] - P["set"]) / (P["lit"] - P["set"]) * 5))
			if pw.has("g") and pw["g"] < P["slab"]:
				var n := mini(4, int((pw["g"] - P["lit"]) / (P["slab"] - P["lit"]) * 4 + 1e-9))
				return "slab runes %d" % (n - 1) if n > 0 else "slab set 4"
			return "slab %d" % (int(_t * 5) % _count("slab "))
		"runeStone":
			var b := 1
			if pw.has("dark"):
				b = 0
			elif pw.has("g"):
				var at: Array = _ring["stones"][variant % 6]
				var c := _catches(at[0], at[1])
				b = 0 if pw["g"] < c else (3 if pw["g"] < c + 0.4 or (pw["g"] >= P["flare"] and pw["g"] < P["flare"] + 0.6) else 1)
			else:
				# (a pulse goes round, stone to stone: ring3.ts stoneBlaze)
				b = 2 if int(_t * 2.4) % 6 == variant % 6 else 1
			var n := _count("stone %d %d " % [variant % 6, b])
			return "stone %d %d %d" % [variant % 6, b, int(_t * 9 + variant * 1.7) % maxi(1, n)]
	return ""


## When the stone at (dx, dy) from the ring's middle catches: as the light running round from the slab's side reaches it.
func _catches(dx: float, dy: float) -> float:
	var P: Dictionary = _ring["power"]
	var a := atan2(dy, dx)
	var d := fmod(absf(a - PI / 2.0), TAU)
	if d > PI:
		d = TAU - d
	return P["slab"] + d / PI * (P["round"] - P["slab"])


var _counts := {}
func _count(prefix: String) -> int:
	if not _counts.has(prefix):
		var n := 0
		while _pics.has(prefix + str(n)):
			n += 1
		_counts[prefix] = n
	return _counts[prefix]


# --- the people ---

func _folk_frame(f: Dictionary, pw: Dictionary) -> void:
	var kind: String = f["kind"]
	var info: Dictionary = FOLK[kind]
	# (turned to the hero if he has come right up to them: townscene.ts turnedTo, facingToward)
	var dist := Vector2(f["x"], f["y"]).distance_to(hero.world)
	var was: String = f["to"]
	var to := ""
	if dist < (TURN_TO if was == "" else TURN_BACK):
		var dx: float = hero.world.x - f["x"]
		var dy: float = hero.world.y - f["y"]
		to = (("se" if dx >= 0 else "nw") if absf(dx) >= absf(dy) else ("sw" if dy >= 0 else "ne"))
		if was != "":
			var along: float = dx if was == "se" else (-dx if was == "nw" else (dy if was == "sw" else -dy))
			var across: float = absf(dy) if was == "se" or was == "nw" else absf(dx)
			if along > 0 and along >= across - 0.35:
				to = was
	f["to"] = to
	var who := kind
	# (the wordsmith's runes are cold while his ring is dark, and catch as it flares)
	if kind == "wordsmith" and (pw.has("dark") or (pw.has("g") and pw["g"] < float(_ring["power"]["flare"]))):
		who = "smithDark"
	var k := int((_t + info["phase"]) * FPS)
	var list := ""
	var i := 0
	if to != "" and to != info["work"]:
		list = "%s:%s" % [who, to]
		if kind == "stranger":
			list = "stranger:se" if to == "se" or to == "ne" else "stranger:sw"
		if not _folk_lists.has(list):
			list = who + ":idle"
		i = k % _folk_lists[list].size()
	else:
		var idle: String = (who + ":idle") if _folk_lists.has(who + ":idle") else "stranger:se"
		var act := who + ":act"
		var loop: int = _folk_lists[idle].size()
		var acts: int = _folk_lists[act].size() if _folk_lists.has(act) else 0
		var round_: int = loop * int(info["loops"]) + acts
		var r := k % round_
		if r < loop * int(info["loops"]) or acts == 0:
			list = idle
			i = r % loop
		else:
			list = act
			i = r - loop * int(info["loops"])
			# (what he does is heard as he does it: world_sounds.ts folkSound, near enough to hear)
			var round_no := k / round_
			if f["act"] != round_no and float(i) / FPS >= info["sound"][1]:
				f["act"] = round_no
				if dist < 9.0:
					sfx.play(info["sound"][0], -6.0 - dist)
	var frame := _folk_tex(_folk_lists[list][i])
	f["node"].texture = frame["tex"]
	f["node"].offset = frame["offset"]


func _folk_tex(idx: int) -> Dictionary:
	if _folk_cache.has(idx):
		return _folk_cache[idx]
	var fr: Array = _folk_data["frames"][idx]
	var p: Dictionary = _folk_data["parts"][int(fr[5])]
	var d := float(p.get("density", 1))
	var t := AtlasTexture.new()
	t.atlas = _folk_sheets[int(fr[0])]
	t.region = Rect2(fr[1], fr[2], fr[3], fr[4])
	var out := {"tex": t, "offset": -Vector2(p["ax"], p["ay"]) * d}
	_folk_cache[idx] = out
	return out


# --- using things ---

## The service within his reach, the nearest where several are (game.ts stationNear). THE GATE IS NOT ONE: his towns' ways are
## walked (game.ts: "THE WAYS: the gate is walked through, not used"): the castle hall's rises as he comes and takes him out
## through its doorway (below); the camp's, the city gate held, is the way he came in from floor 10 and leads nowhere back. Its
## name is written over it all the same, never lit as the one in reach (render.ts: `near` is stationNear's).
func station_near() -> String:
	if hero == null:
		return ""
	var best := ""
	var best_d := USE
	for s in data["stations"]:
		# (THE SHAFT'S RIM: its gate is a service, the words burned into the next endless level: game/rim.ts)
		if str(s["kind"]) == "gate" and not rim:
			continue
		var d := Vector2(s["x"], s["y"]).distance_to(hero.world)
		if d < best_d:
			best_d = d
			best = str(s["kind"])
	return best


func _use() -> void:
	prompt = ["", ""]
	if not hero.alive:
		return
	# (on the waypoint, the use button is the waypoint's: waypoint.gd)
	if main._way != null and main._way.here():
		return
	var best := station_near()
	match best:
		"wordsmith":
			# (game.ts handInNear: the rune-stone; the Meldstone (MELD_HAND_IN); his ask for it (QUEST_TEXT.meldAskPrompt))
			if given_at >= 0.0 and _word_due > 0.0:
				prompt = ["", ""]
			elif main.tablet_due():
				# (ENDLESS_KEY: at the Shaft's Rim, the four shards held: game.ts handInNear, KEY_TEXT.prompt)
				prompt = ["E: Wordsmith: set the four shards in the bench", "tablet"]
			elif loot.quest == "heart":
				prompt = ["E: Give the rune-stone", "give"]
			elif loot.meld == "stone":
				prompt = ["E: Give the Meldstone", "meld"]
			elif loot.meld_ask_due():
				prompt = ["E: Wordsmith: a task", "meldask"]
			elif not loot.ring_lit and not loot.quest_given:
				prompt = ["E: Talk to the wordsmith", "talk"]
			else:
				# (his half of the screen, his trade in words its first page (game.ts interactHint 'Wordsmith', ui/trades.ts); the
				# Meldstone his, MELD turns it to melding, its second: inventory.gd)
				prompt = ["E: Wordsmith", "wordsmith"]
		"armourer":
			# (THE ARMOURER'S QUEST, game.ts handInNear, interactHint: while he has a quest to give or its reward, his prompt
			# says so, and using him gives it in place of his shelves; used again, his shelves)
			# (QUESTS1115: and his clapper, act2/quest1115.gd; what he brings back first, before any new ask)
			# (QUESTS1620: and the songbird, act3/quest1620.gd)
			var due: String = loot.armourer_due()
			var clap: String = main.quest1115.clapper_due() if main.quest1115 != null else ""
			var song: String = main.quest1620.bird_due() if main.quest1620 != null else ""
			if due == "reward":
				prompt = ["E: " + str(loot.quest_text["rewardPrompt"]), "task"]
			elif clap == "clapperGive":
				prompt = ["E: " + main.quest1115.prompt_of(clap), "clapper"]
			elif song == "birdGive":
				prompt = ["E: " + main.quest1620.prompt_of(song), "bird"]
			elif due == "furnace":
				prompt = ["E: " + str(loot.quest_text["furnaceAskPrompt"]), "task"]
			elif clap != "":
				prompt = ["E: " + main.quest1115.prompt_of(clap), "clapper"]
			elif song != "":
				prompt = ["E: " + main.quest1620.prompt_of(song), "bird"]
			else:
				prompt = ["E: Armourer", "armourer"]
		"mystic":
			# (QUESTS610, game.ts handInNear, mysticDue: her ask for the Queen's feather, or the feather taken from him: act1/quest610.gd)
			# (QUESTS1115: and her jar, act2/quest1115.gd; what he brings back first, before any new ask)
			var feather: String = main.quest610.mystic_due() if main.quest610 != null else ""
			var jar: String = main.quest1115.jar_due() if main.quest1115 != null else ""
			if feather == "featherGive" or (feather != "" and jar != "jarGive"):
				prompt = ["E: " + main.quest610.mystic_prompt(), "feather"]
			elif jar != "":
				prompt = ["E: " + main.quest1115.prompt_of(jar), "jar"]
			else:
				prompt = ["E: Mystic", "mystic"]
		"gate":
			# (THE SHAFT'S RIM: game.ts interactHint, "Gate: words for Endless N")
			prompt = ["E: Gate: words for %s" % main.endless_name(main.endless), "gate"]
		"record":
			# (DELVE DEEPER: the record stone, his deepest with each hero: inventory.gd _rec_side; the way deeper is at the gate)
			prompt = ["E: Record stone", "record"]
		"stash", "lexicon", "stranger":
			# (his half beside the gear screen: the stranger's gamble, the stash, the Lexicon: inventory.gd)
			# (QUESTS1620: the stranger's whole court, asked for or brought, before his half: game.ts handInNear)
			var court: String = main.quest1620.court_due() if best == "stranger" and main.quest1620 != null else ""
			if court != "":
				prompt = ["E: " + main.quest1620.prompt_of(court), "court"]
			else:
				prompt = ["E: %s" % best.capitalize(), best]
	if prompt[1] != "" and Input.is_action_just_pressed("interact"):
		_do(prompt[1])


## THE SHAFT'S RIM (game/rim.ts): what changes on it drawn over its look (rim.gd), its round walking set on the map (the pit's
## brink, the standing stones, the braziers; the tongue out to the landing), and its record stone cut as he comes in (main.gd).
func _rim_ready() -> void:
	var R := preload("res://scripts/rim.gd")
	rim_node = R.new()
	rim_node.main = main
	rim_node.town = self
	rim_node.stands = stands
	rim_node.flats = flats
	rim_node.look = main.look if looked else null
	add_child(rim_node)
	var L: Dictionary = data
	if main.map != null:
		main.map.fence = func(x: float, y: float, r: float) -> bool: return R.holds(L, x, y, r)
		main.map.rounder = func(at: Vector2, r: float, d: Vector2): return R.round_step(L, at, r, d)
	main.come_to_rim(rim_node)


func _do(what: String) -> void:
	match what:
		"gate":
			main._inv.open_service("gate")
		"tablet":
			main.set_tablet()
		"record":
			main._inv.open_service("record")
		"talk":
			if loot.ring_lit:
				loot.say("The wordsmith: \"The ring burns. Go, and use what it gives you.\"", Color(0.35, 0.9, 1.0))
			else:
				loot.quest_given = true
				main.show_words(ASK)
		"give":
			# (game.ts lightRing: the quest done, the ring lit; 4.7 s later, giveRingWord)
			loot.quest = ""
			loot.ring_lit = true
			loot.derive()
			given_at = _t
			_word_due = _t + float(_ring["power"]["done"])
			loot.say("The ring is lit.", Color(0.35, 0.9, 1.0))
			sfx.play("ring_power")
		"task":
			# (game.ts armourerHandIn: he asks the hero to put out floor 3's furnace; or, the furnace out, gives his word, HEAVY)
			loot.armourer_hand_in()
		"meldask":
			loot.ask_meld()
		"wordsmith":
			# (WORDMELDING: his half beside the gear screen, its first page; MELD turns it to melding: inventory.gd)
			main._inv.open_wordsmith()
		"meld":
			# (game.ts takeMeldstone: he takes it, gives the two words and the lesson; and the gate down the mountain unbarred)
			loot.give_meldstone()
			# (its flight to his slab: render/meld_drops.ts givenOf, from 'stoneGiven')
			var gp: Array = []
			for i in 4:
				var q := Loot._FilmPic.new()
				stands.add_child(q)
				gp.append(q)
			_given = {"g": 0.0, "hero": hero.world, "slammed": false, "pics": gp}
			if int(main.way_depth) < 6:
				main.way_depth = 6
				barred = true
				unbar = -1.0
				told_barred = true
				loot.say("The wordsmith unbars the gate down the mountain.", loot.MSG_QUEST)
		"armourer", "mystic":
			main.open_shop(what)
		"feather":
			main.quest610.mystic_hand_in()
		"jar":
			main.quest1115.hand_in(main.quest1115.jar_due(), hero.world)
		"clapper":
			main.quest1115.hand_in(main.quest1115.clapper_due(), hero.world)
		"bird":
			main.quest1620.hand_in(main.quest1620.bird_due(), hero.world)
		"court":
			main.quest1620.hand_in(main.quest1620.court_due(), hero.world)
		"stash", "lexicon", "stranger":
			main._inv.open_service(what)


# --- the gate out to the Quarry ---

## The gate as he comes into town (game.ts enterTown): barred until the Meldstone is brought; to be unbarred as he comes in sight
## of it, where the ride up from floor 5 has unbarred it (main.gd unbar_due); up behind him, come in through it from floor 10.
## Its strips, where its films are made: the castle hall's look's own still bars put away for them.
func _lay_gate() -> void:
	_gate = data.get("gate", {}) if data.get("gate") != null else {}
	if _gate.is_empty():
		return
	_gate["tiles"] = _gate["tiles"].map(func(i): return int(i))
	barred = int(main.way_depth) < 6
	if main.unbar_due:
		main.unbar_due = false
		barred = true
		unbar = -1.0
		told_barred = true
	if main.came_in_gate:
		gate_open = 1.0
		gate_want = 1.0
	_gate_walk(gate_want == 1.0)
	var tg = Perils._fx.get("tables", {}).get("tg")
	if tg == null or not Perils._fx.get("films", {}).has("tg_bars_1"):
		return
	for k in tg["port"].size():
		if tg["port"][k] != null and Perils._fx["films"].has("tg_port_%d" % k):
			_port[k] = _strip(tg["port"][k])
	for k in tg["bars"].size():
		if tg["bars"][k] != null and Perils._fx["films"].has("tg_bars_%d" % k):
			_bars[k] = _strip(tg["bars"][k])
	# (the look's still bars, under the same names in its sheet, put away: these are drawn as they stand now)
	if looked and FileAccess.file_exists("res://assets/looks/town_pics.json"):
		var rects := {}
		var lp: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/looks/town_pics.json"))
		for key in lp:
			if str(key).begins_with("town gate bars"):
				var a: Array = lp[key]
				rects[Rect2(a[0], a[1], a[2], a[3])] = true
		for n in stands.get_children():
			if n is Sprite2D and n.region_enabled and rects.has(n.region_rect):
				n.visible = false


func _strip(at: Array) -> Dictionary:
	var pic := Loot._FilmPic.new()
	stands.add_child(pic)
	return {"pic": pic, "at": Iso.to_screen(float(at[0]), float(at[1])), "d": float(at[2])}


## Its doorway in the walk grid or out of it (game.ts raiseGate, and as it falls).
func _gate_walk(up: bool) -> void:
	for i in _gate.get("tiles", []):
		main.map.walk[int(i)] = 1 if up else 0


## game.ts updateWays, the gate of the way, in town.
func _step_gate(dt: float) -> void:
	if _gate.is_empty():
		return
	var mid := Vector2(_gate["middle"]["x"], _gate["middle"]["y"])
	var far := mid.distance_to(hero.world)
	# (its bars struck off the first time he comes in sight of it after the Meldstone is brought, the gate shut while they come down)
	if unbar != null:
		if unbar < 0.0 and far < UNBAR_SEEN:
			unbar = 0.0
			loot.say("The gate is unbarred. Beyond it, the mountain road.", Color("#8af078"))
		elif unbar >= 0.0:
			unbar += dt
			if unbar >= UNBAR_SECS:
				unbar = null
				barred = false
	# (barred, it does not rise; once, as he comes near, a line says so)
	if barred:
		if not told_barred and far < GATE_RISE_AT - 2.0:
			told_barred = true
			loot.say("The gate is barred.", Color("#f0e8ff"))
	elif gate_want == 0.0 and far < GATE_RISE_AT:
		gate_want = 1.0
		_gate_walk(true)
		sfx.play("gate_rise", linear_to_db(0.8))
	elif gate_want == 1.0 and far > GATE_FALL_AT:
		gate_want = 0.0
		_gate_walk(false)
		sfx.play("gate_fall", linear_to_db(0.35))
	# (game/doors.ts stepDoors: up over GATE_RISE, down over GATE_FALL)
	if gate_open != gate_want:
		gate_open = minf(1.0, gate_open + dt / GATE_RISE) if gate_want == 1.0 else maxf(0.0, gate_open - dt / GATE_FALL)
	# (up, walking into its doorway takes him through: out to the Quarry, floor 6)
	var here := floori(hero.world.y) * int(main.map.w) + floori(hero.world.x)
	if hero.alive and gate_open > 0.85 and _gate.get("tiles", []).has(here) and main.has_floor(6):
		main.go_to("floor6", "down")


## The gate's strips as it stands now (render.ts standDoors): the portcullis at its height (d.open x GATE_UP, as art/gates.ts
## rounds it, 2 game pixels a step); the bars across it while it is barred, struck off frame by frame as it is unbarred (each
## jolt kicks the screen and is heard), what is left of them at its foot from then on.
func _show_gate() -> void:
	if _port.is_empty() and _bars.is_empty():
		return
	var tg: Dictionary = Perils._fx["tables"]["tg"]
	var step := clampi(roundi(gate_open * float(tg["up"]) / 2.0), 0, int(tg["heights"]) - 1)
	for k in _port:
		var p: Dictionary = _port[k]
		p["pic"].put("tg_port_%d" % k, step, p["at"], p["d"])
	var film := "tg_unbar_%d"
	var f := 77
	if unbar != null and unbar >= 0.0:
		f = mini(77, floori(unbar * 30.0))
		for j in range(_unbar_f + 1, f + 1):
			if (tg["jolts"] as Array).has(j):
				hero.kick(4.0)
				sfx.play("slam", linear_to_db(0.6))
		_unbar_f = f
	elif barred:
		film = "tg_bars_%d"
		f = 0
	for k in _bars:
		var b: Dictionary = _bars[k]
		b["pic"].put(film % k, f, b["at"], b["d"])


## GIVEN (render/meld_drops.ts givenOf, GIVEN; render.ts standMeldMoments): the Meldstone given, `g` seconds after, from him
## (`hero`, tiles) to over the slab (`slab`): it rises out of him and floats over the slab; a shudder, its halves straining;
## torn apart, they whirl round each other faster and faster and crash back together in a great burst (the screen kicked);
## and it goes out to its round of the column of light, still spinning. {stone: {x, y, z, shown, yaw, scale} or null, halves:
## [{x, y, z, yaw}] or null, burst: {scale, alpha} or null, slammed}; {} once it has settled.
const GIVEN := {"risen": 0.5, "over": 1.3, "split": 1.45, "slam": 2.25, "burst": 0.45, "settled": 2.9, "riseZ": 34.0}
## (the Meldstone given: {g, hero, slammed, pics}: empty when none is being given)
var _given := {}


static func _ease(k: float) -> float:
	return k * k * (3.0 - 2.0 * k)


func _orbit_at(t: float, slab: Vector2) -> Vector3:
	var a := t / float(ORBIT["secs"]) * TAU
	return Vector3(slab.x + cos(a) * float(ORBIT["r"]), slab.y + sin(a) * float(ORBIT["r"]), float(ORBIT["z"]) + float(ORBIT["bob"]) * sin(t * PI))


func given_of(g: float, t: float, hero_at: Vector2, slab: Vector2) -> Dictionary:
	if g < 0.0 or g >= float(GIVEN["settled"]):
		return {}
	var kz: float = ORBIT["z"]
	var since: float = g - float(GIVEN["slam"])
	var burst = {"scale": 0.6 + (since / float(GIVEN["burst"])) * 1.8, "alpha": 1.0 - since / float(GIVEN["burst"])} if since >= 0.0 and since < float(GIVEN["burst"]) else null
	var whole := func(x: float, y: float, z: float, shown: String, yaw: float, scale: float, slammed: bool) -> Dictionary:
		return {"stone": {"x": x, "y": y, "z": z, "shown": shown, "yaw": yaw, "scale": scale}, "halves": null, "burst": burst, "slammed": slammed}
	var rz: float = GIVEN["riseZ"]
	if g < float(GIVEN["risen"]):
		# up out of him
		var k := _ease(g / float(GIVEN["risen"]))
		return whole.call(hero_at.x, hero_at.y, 16.0 + (rz - 16.0) * k, "hang", 0.0, 0.4 + 0.6 * k, false)
	if g < float(GIVEN["over"]):
		# over to the slab
		var k := _ease((g - float(GIVEN["risen"])) / (float(GIVEN["over"]) - float(GIVEN["risen"])))
		return whole.call(hero_at.x + (slab.x - hero_at.x) * k, hero_at.y + (slab.y - hero_at.y) * k, rz + (kz + 2.0 - rz) * k + 6.0 * sin(k * PI), "hang", 0.0, 1.0, false)
	if g < float(GIVEN["split"]):
		# a shudder, its halves straining
		var k := (g - float(GIVEN["over"])) / (float(GIVEN["split"]) - float(GIVEN["over"]))
		return whole.call(slab.x, slab.y, kz + 2.0, "apart", 30.0 * sin(k * PI * 4.0), 1.0 + 0.1 * k, false)
	if g < float(GIVEN["slam"]):
		# its halves torn apart, whirling round each other, faster and faster; then crashing back in
		var k := (g - float(GIVEN["split"])) / (float(GIVEN["slam"]) - float(GIVEN["split"]))
		var turn := TAU * (0.5 * k + 2.2 * k * k)
		var r := 0.55 * minf(1.0, k / 0.22) * ((1.0 - (k - 0.8) / 0.2) if k > 0.8 else 1.0)
		var z := kz + 2.0 + 4.0 * sin(k * PI)
		var halves: Array = []
		for n in 2:
			var a := turn + n * PI
			halves.append({"x": slab.x + cos(a) * r, "y": slab.y + sin(a) * r, "z": z + 2.0 * sin(a * 2.0), "yaw": a * 180.0 / PI + 90.0})
		return {"stone": null, "halves": halves, "burst": null, "slammed": false}
	# slammed together; it goes out to its round of the column of light, still spinning
	var o := _orbit_at(t, slab)
	var k2 := _ease(clampf((g - float(GIVEN["slam"])) / (float(GIVEN["settled"]) - float(GIVEN["slam"])), 0.0, 1.0))
	return whole.call(slab.x + (o.x - slab.x) * k2, slab.y + (o.y - slab.y) * k2, kz + 2.0 + (o.z - kz - 2.0) * k2, "whole", 720.0 * (1.0 - k2), 1.2 - 0.2 * k2, true)


## (art/meld_drops.ts spinStep: the step of its turn, of 16)
static func _spin(yaw: float) -> int:
	return posmod(roundi(yaw / 360.0 * 16.0), 16)


## The Meldstone given, as it goes (from loot.give_meldstone, `_do("meld")`).
func _show_given(dt: float) -> bool:
	if _given.is_empty():
		return false
	_given["g"] = float(_given["g"]) + dt
	var pics: Array = _given["pics"]
	var G := given_of(_given["g"], _t, _given["hero"], _kept[1])
	if G.is_empty():
		for q in pics:
			q.queue_free()
		_given = {}
		return false
	var ks: float = ORBIT["scale"]
	var st = G["stone"]
	pics[0].visible = st != null
	if st != null:
		var film: String = "ms_apart" if st["shown"] == "apart" else ("ms_whole" if st["shown"] == "whole" else "ms_stone")
		var f: int = floori(_t * 12.0) % 24 if st["shown"] == "hang" else _spin(st["yaw"])
		pics[0].put(film, f, Iso.to_screen(st["x"], st["y"]), st["x"] + st["y"] + 0.08, float(st["z"]) * 2.0, float(st["scale"]) * ks)
	var hv = G["halves"]
	for n in 2:
		pics[1 + n].visible = hv != null
		if hv != null:
			var hf: Dictionary = hv[n]
			pics[1 + n].put("ms_half%d" % n, _spin(hf["yaw"]), Iso.to_screen(hf["x"], hf["y"]), hf["x"] + hf["y"] + 0.08, float(hf["z"]) * 2.0, ks)
	var b = G["burst"]
	var slab: Vector2 = _kept[1]
	pics[3].visible = b != null and pics[3].put("ms_burst", 0, Iso.to_screen(slab.x, slab.y), slab.x + slab.y + 0.09, (float(ORBIT["z"]) + 2.0) * 2.0, b["scale"], b["alpha"])
	if G["slammed"] and not _given["slammed"]:
		_given["slammed"] = true
		hero.kick(4.0)
	return true


## KEPT (render.ts standMeldMoments): once the wordsmith has the Meldstone, it goes round the column of light over his slab,
## turning as it goes, a little bigger, to be seen (render/meld_drops.ts orbitAt).
func _show_kept() -> void:
	if loot.meld != "open":
		return
	if _kept.is_empty():
		for p in data["props"]:
			if p["kind"] == "runeSlab":
				var pic := Loot._FilmPic.new()
				stands.add_child(pic)
				_kept = [pic, Vector2(p["x"], p["y"])]
		if _kept.is_empty():
			return
	# (just given: its flight there, in place of its round)
	_kept[0].visible = _given.is_empty()
	if not _given.is_empty():
		return
	var a := _t / float(ORBIT["secs"]) * TAU
	var o: Vector2 = _kept[1] + Vector2(cos(a), sin(a)) * float(ORBIT["r"])
	var z: float = ORBIT["z"] + ORBIT["bob"] * sin(_t * PI)
	_kept[0].put("ms_stone", floori(_t * 12.0) % 24, Iso.to_screen(o.x, o.y), o.x + o.y + 0.08, z * 2.0, ORBIT["scale"])


## THE CAMP'S WAY ON INTO THE CITY (game/camp.ts CAMP.onward, ways' `onward`: the barricaded street off to the right, its carts
## hauled aside): coming onto it, he goes down it into the city, floor 11 (game.ts leave 'on' from town).
var _told_onward := false


func _camp_onward() -> void:
	var o = data.get("onward")
	if o == null or not hero.alive or main._going:
		return
	var d := Vector2(o["x"], o["y"]).distance_to(hero.world)
	if d < 1.0 and not _told_onward:
		_told_onward = true
		if main.has_floor(11):
			main.go_to("floor11", "down")
		else:
			loot.say("The way on into the city. (Floor 11 is not in the Godot version yet.)", Color(0.55, 0.6, 0.8))
	elif d > 2.5:
		_told_onward = false


# --- THE RING'S MOMENTS (render.ts standRing3) ---

func _rfx_ready() -> void:
	var d = JSON.parse_string(FileAccess.get_file_as_string(RFX_DIR + ".json"))
	_rfx_tex = load(RFX_DIR + ".png")
	_rfx_tune = d["tune"]
	for p in d["pics"]:
		_rfx[p["name"]] = p
	for t in data["props"]:
		if t["kind"] == "runeRing":
			_ring_mid = Vector2(t["x"], t["y"])
		elif t["kind"] == "runeSlab":
			_slab_mid = Vector2(t["x"], t["y"])
	for i in 14:
		_letters.append(_rfx_sprite())
	_column = _rfx_sprite()
	_stone = _rfx_sprite()
	_flash = _rfx_sprite()
	# (what they give off, over the place's dark, added: render.ts propLit)
	_rfx_lights = Node2D.new()
	_rfx_lights.material = Glow.added()
	_rfx_lights.z_index = 51
	_rfx_lights.draw.connect(_draw_rfx_lights)
	add_child(_rfx_lights)


func _rfx_sprite() -> Sprite2D:
	var n := Sprite2D.new()
	n.texture = _rfx_tex
	n.region_enabled = true
	n.centered = false
	n.visible = false
	stands.add_child(n)
	return n


## One of the ring's pictures stood at (x, y) tiles, `z` game pixels up, among what stands at depth `d`; scaled `k`, faded `a`.
func _rfx_put(n: Sprite2D, name: String, x: float, y: float, z: float, d: float, k := 1.0, a := 1.0) -> void:
	var p: Dictionary = _rfx.get(name, {})
	if p.is_empty():
		n.visible = false
		return
	var top := Iso.to_screen(x, y) - Vector2(0, z * 2.0)
	n.visible = true
	n.region_rect = Rect2(p["x"], p["y"], p["w"], p["h"])
	n.position = Vector2(top.x, d * Iso.HH)
	n.scale = Vector2(k, k)
	n.offset = -Vector2(p["ax"], p["ay"]) + Vector2(0, (top.y - d * Iso.HH) / k)
	n.modulate.a = a
	for l in p.get("lights", []):
		_rfx_lit.append([top + Vector2(float(l["x"]), float(l["y"])) * 2.0 * k, l, a])


## (art/townscene.ts smithAct) Where the wordsmith is in his work: seconds into it, or -1 (while he is turned to someone, and while
## his ring is dark or powering up).
func _smith_act(pw: Dictionary) -> float:
	if pw.has("dark") or (pw.has("g") and float(pw["g"]) < float(_ring["power"]["done"])):
		return -1.0
	for f in _folk:
		if f["kind"] == "wordsmith" and f["to"] != "" and f["to"] != FOLK["wordsmith"]["work"]:
			return -1.0
	if not _folk_lists.has("wordsmith:idle") or not _folk_lists.has("wordsmith:act"):
		return -1.0
	var loop_t: float = _folk_lists["wordsmith:idle"].size() / FPS
	var rest: float = int(FOLK["wordsmith"]["loops"]) * loop_t
	var every: float = rest + _folk_lists["wordsmith:act"].size() / FPS
	var u := fposmod(_t + float(FOLK["wordsmith"]["phase"]), every)
	return -1.0 if u < rest else u - rest


## (art/ring3.ts flareOf) How hard the ring flares at a moment of his work: 1 as the rune goes into the slab, gone 0.8 s later.
func _flare_of(act: float) -> float:
	var lands: float = _rfx_tune.get("lands", 2.12)
	if act < lands:
		return 0.0
	return maxf(0.0, 1.0 - (act - lands) / 0.8)


## (art/ring3.ts swirlAt) The fourteen letters going round him at every height: as he writes they draw in and go faster; as the
## rune goes into the slab they are thrown out to the stones, and come back. Each [x, y, z, k, heat, big] from the ring's middle.
func _swirl_at(t: float, act: float) -> Array:
	var out: Array = []
	var lands: float = _rfx_tune.get("lands", 2.12)
	var runes: int = int(_rfx_tune.get("runes", 8))
	var writing := minf(1.0, act / 0.6) if act >= 0.0 and act < lands else 0.0
	var flare := _flare_of(act)
	var spin := 0.55 + 0.9 * writing + 1.6 * flare
	for i in 14:
		var a := float(i) / 14.0 * TAU + t * spin * (1.0 if i % 2 == 0 else 0.85) + sin(t * 0.3 + i) * 0.2
		var r := (1.35 + 0.32 * sin(t * 0.7 + i * 1.9)) * (1.0 - 0.45 * writing) + 1.0 * flare
		var z := 14.0 + 16.0 * (0.5 + 0.5 * sin(t * 0.9 + i * 2.3)) + 10.0 * writing
		var flick := Perils._hash(i, floori(t * 6.0), 51)
		var heat := 2 if flare > 0.2 or flick > 0.82 else (1 if flick > 0.45 or writing > 0.5 else 0)
		out.append([cos(a) * r, sin(a) * r, z, posmod(i + floori(t * 0.4 + i * 0.37), runes), heat, i % 3 == 0])
	return out


## (art/townscene.ts swirlNow) None while the ring is dark; bursting out of the slab as it powers up; else going round him.
func _swirl_now(pw: Dictionary) -> Array:
	var P: Dictionary = _ring["power"]
	if pw.has("dark") or (pw.has("g") and float(pw["g"]) < float(P["flare"])):
		return []
	if pw.has("g") and float(pw["g"]) < float(P["done"]):
		var g: float = pw["g"]
		var k := minf(1.0, (g - float(P["flare"])) / 0.45)
		var e := 1.0 - (1.0 - k) * (1.0 - k)
		var sl: Array = _rfx_tune.get("slab", [0, 1])
		var out: Array = []
		for l in _swirl_at(_t, float(_rfx_tune.get("lands", 2.12)) + (g - float(P["flare"]))):
			out.append([float(sl[0]) + (l[0] - float(sl[0])) * e, float(sl[1]) + (l[1] - float(sl[1])) * e, 11.0 + (l[2] - 11.0) * e, l[3], 2, l[5]])
		return out
	return _swirl_at(_t, _smith_act(pw))


## (art/quest3.ts floatingOf) Where the floating stone is `g` seconds after it was given, between the hero and the slab's hollow,
## and how it is turned: [x, y, z, lie], or empty when it is not in the air.
func _floating_of(g: float, h: Vector2, slab: Vector2, slab_top: float) -> Array:
	var P: Dictionary = _ring["power"]
	if g < 0.0 or g >= float(P["set"]):
		return []
	var ease := func(k: float) -> float: return k * k * (3.0 - 2.0 * k)
	if g < float(P["risen"]):
		return [h.x, h.y, 8.0 + 20.0 * ease.call(g / float(P["risen"])), 0.0]
	if g < float(P["over"]):
		var k: float = ease.call((g - float(P["risen"])) / (float(P["over"]) - float(P["risen"])))
		return [h.x + (slab.x - h.x) * k, h.y + (slab.y - h.y) * k, 28.0 + (slab_top + 14.0 - 28.0) * k + sin(k * PI) * 6.0, 0.0]
	if g < float(P["lain"]):
		return [slab.x, slab.y, slab_top + 14.0, 90.0 * ease.call((g - float(P["over"])) / (float(P["lain"]) - float(P["over"])))]
	var k2 := (g - float(P["lain"])) / (float(P["set"]) - float(P["lain"]))
	return [slab.x, slab.y, slab_top + 14.0 - 14.0 * k2 * k2, 90.0]


## (render.ts standRing3) The letters, the column over the slab, the floating stone and its burst as it is laid in, each stood
## among what stands by how near it is, each frame.
func _ring_moments() -> void:
	if _rfx.is_empty():
		if not FileAccess.file_exists(RFX_DIR + ".json"):
			return
		_rfx_ready()
	_rfx_lit = []
	var pw := _power()
	var letters: Array = _swirl_now(pw) if _ring_mid != null else []
	for i in _letters.size():
		var n: Sprite2D = _letters[i]
		if i >= letters.size():
			n.visible = false
			continue
		var l: Array = letters[i]
		var x: float = _ring_mid.x + l[0]
		var y: float = _ring_mid.y + l[1]
		_rfx_put(n, "%s %d %d" % ["big" if l[5] else "letter", l[4], l[3]], x, y, l[2], x + y)
	# (the column of light over the slab: none while the ring is dark; rising as it powers up)
	var P: Dictionary = _ring["power"]
	_column.visible = false
	if _slab_mid != null and not pw.has("dark") and not (pw.has("g") and float(pw["g"]) < float(P["flare"])):
		var d: float = _slab_mid.x + _slab_mid.y + 0.05
		if pw.has("g") and float(pw["g"]) < float(P["flare"]) + 0.5:
			var steps: int = int(_rfx_tune.get("rise", 8))
			_rfx_put(_column, "rise %d" % mini(steps - 1, floori((float(pw["g"]) - float(P["flare"])) / 0.5 * steps)), _slab_mid.x, _slab_mid.y, 11.0, d)
		else:
			var f := 1.0 if pw.has("g") and float(pw["g"]) < float(P["done"]) else _flare_of(_smith_act(pw))
			_rfx_put(_column, "col %d" % (floori(_t * (12.0 + 12.0 * f)) % int(_rfx_tune.get("column", 8))), _slab_mid.x, _slab_mid.y, 11.0, d, 1.0, minf(1.0, 0.42 + 0.58 * f))
	# (THE MASTER RUNE-STONE given: it rises out of the hero, floats over the slab, lies down and is laid into the hollow in its top,
	# with a burst of its light)
	_stone.visible = false
	_flash.visible = false
	if _slab_mid != null and pw.has("g") and hero != null:
		var g: float = pw["g"]
		var fl := _floating_of(g, hero.world, _slab_mid, 11.0)
		if not fl.is_empty():
			var lay: int = int(_rfx_tune.get("laying", 6))
			var name := ("stone %d" % (floori(_t * 10.0) % int(_rfx_tune.get("standing", 12)))) if fl[3] <= 0.5 else ("lay %d" % mini(lay - 1, roundi(fl[3] / 90.0 * (lay - 1))))
			_rfx_put(_stone, name, fl[0], fl[1], fl[2], fl[0] + fl[1] + 0.06)
		var set_at: float = P["set"]
		if g >= set_at and g < set_at + 0.3:
			_rfx_put(_flash, "flash", _slab_mid.x, _slab_mid.y, 11.0, _slab_mid.x + _slab_mid.y + 0.07, 0.6 + (g - set_at) * 2.4, 1.0 - (g - set_at) / 0.3)
	_rfx_lights.queue_redraw()


func _draw_rfx_lights() -> void:
	for q in _rfx_lit:
		var l: Dictionary = q[1]
		var r := float(l["r"]) * 2.0
		var at: Vector2 = q[0]
		_rfx_lights.draw_texture_rect(Glow.tex(), Rect2(at.x - r, at.y - r, r * 2.0, r * 2.0), false, Glow.tint(l, float(q[2])))
