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
##   THE GATE in the back wall is barred on a new game (it opens much later): drawn as wall here for now.
extends Node2D

const Iso := preload("res://scripts/iso.gd")

const DIR := "res://assets/town"
const FOLK_DIR := "res://assets/townsfolk"
const FPS := 30.0
const TURN_TO := 1.45
const TURN_BACK := 1.95
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
var _folk: Array = []  # {kind, node, x, y, to, last_act}
var _t := 0.0
var _ring := {}
var _word_due := -1.0


func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/layout.json"))
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
	_ring = data["ring"]
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


## (THE WORLD'S SOUNDS, world_sounds.ts) the braziers' fire, the forge's, the ring's hum: each heard from where it is.
func _sounds() -> void:
	for t in data["props"]:
		var file := ""
		var vol := -10.0
		match t["kind"]:
			"brazier":
				file = "fire_small_loop.wav"
			"forge":
				file = "fire_big_loop.wav"
				vol = -8.0
			"runeSlab":
				file = "ring_hum_loop.wav"
		if file == "" or not ResourceLoader.exists("res://assets/sound/" + file):
			continue
		var p := AudioStreamPlayer2D.new()
		p.stream = load("res://assets/sound/" + file)
		p.volume_db = vol
		p.max_distance = 420.0
		p.attenuation = 1.6
		p.position = Iso.to_screen(t["x"], t["y"])
		p.finished.connect(p.play)
		add_child(p)
		p.play()


func _process(dt: float) -> void:
	_t += dt
	if given_at >= 0.0 and _word_due > 0.0 and _t >= _word_due:
		_word_due = -1.0
		loot.give_word("power")
	_show()
	_use()
	# THE STAIRS DOWN: on their top step he goes down to floor 1 (ways.ts onTopStep)
	var st = data["stair"]
	if st != null and hero.alive:
		var along: float = hero.world.x - st["x"]
		var across: float = hero.world.y - st["y"]
		if along >= -0.1 and along < 0.95 and across >= 0.05 and across < float(st["wide"]) - 0.05:
			main.go_to("floor1", "stairs")


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

func _use() -> void:
	prompt = ["", ""]
	if not hero.alive:
		return
	# (on the waypoint, the use button is the waypoint's: waypoint.gd)
	if main._way != null and main._way.here():
		return
	var best := ""
	var best_d := USE
	for s in data["stations"]:
		var d := Vector2(s["x"], s["y"]).distance_to(hero.world)
		if d <= best_d:
			best_d = d
			best = s["kind"]
	match best:
		"wordsmith":
			if given_at >= 0.0 and _word_due > 0.0:
				prompt = ["", ""]
			elif loot.quest == "heart":
				prompt = ["E: Give the rune-stone", "give"]
			else:
				prompt = ["E: Talk to the wordsmith", "talk"]
		"armourer":
			prompt = ["E: Armourer", "armourer"]
		"mystic":
			prompt = ["E: Mystic", "mystic"]
		"stash", "lexicon", "stranger":
			prompt = ["E: %s" % best.capitalize(), "later"]
	# (the gate: barred, as said within 4 tiles of it)
	if prompt[1] == "":
		for s in data["stations"]:
			if s["kind"] == "gate" and Vector2(s["x"], s["y"]).distance_to(hero.world) < 4.0:
				prompt = ["The gate is barred.", ""]
	if prompt[1] != "" and Input.is_action_just_pressed("interact"):
		_do(prompt[1])


func _do(what: String) -> void:
	match what:
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
		"armourer", "mystic":
			main.open_shop(what)
		"later":
			loot.say("Not in the Godot version yet.", Color(0.55, 0.6, 0.8))
