## WHAT THE HERO AND THE TOWN'S PEOPLE SAY, shown on a dark slip over whoever says it and heard in their own voice (render/fx.ts
## quip, say, tag; main.ts speak, `arrived`; game.ts quip, tags). The voices are the game's own made in code, said by it offline into
## files (tools/godot_voices.mjs: assets/voices/hero, assets/voices/town; voices.json their tables, QUIPS, ARRIVAL_LINES, TAGS).
##   THE HERO'S WORD ON A BIG KILL (game.ts quip): a boss always earns one; an elite or a champion now and then (3 in 10), never
##   within 45 s of the last. The lists that fit the kill: the boss's own, one of the words on the move that killed it, the move's
##   own, his weapon's, his highest attribute's, his class's, any; one picked by their weights (3, 3, 2, 2, 2, 2, 2), no line said
##   again till every line that fits has been. Over his head for 2.6 s, white (gold its first tenth of a second).
##   HIS LINE AS HE COMES INTO A DUNGEON (main.ts `arrived`): a new run begun in a dungeon, 0.75 s after he is there; up for
##   1.3 s and 0.065 s a letter, 2.6 at least.
##   WHAT THE TOWN'S PEOPLE SAY (game.ts tags, TAGS): as he comes within 3.2 tiles of one, 4 times in 10, never within 90 s of their
##   last nor 30 s of anyone's; a line of theirs not said yet. Over their head for 3 s; their voice at 0.55.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const PF := preload("res://scripts/pixel_font.gd")
const DIR := "res://assets/voices/"
const INK := Color("#120d18")
const GD5 := Color("#fff6c0")
const QUIP_TIME := 2.6
const TAG_TIME := 3.0
const ARRIVAL_SAYS := 0.75
## (render/fx.ts TAG_LIFT: how far over where each stands their line is)
const TAG_LIFT := {"armourer": 66.0, "mystic": 102.0, "wordsmith": 62.0, "stranger": 56.0}

var main
var V := {}
var _run := 0.0
var _quip_at := -1e9
var _said := {}
## (the hero's line up now: text, how long it has been up, for how long)
var quip := {}
## (the town's line up now: who, text, where, how long)
var tag := {}
var _tag_near := {}
var _tag_at := {}
var _tag_all := -1e9
var _tag_said := {}
var _arrival := {}
## (for the checks: each line said aloud, [who, text])
var heard: Array = []


func _ready() -> void:
	z_index = 60
	process_mode = Node.PROCESS_MODE_PAUSABLE
	if FileAccess.file_exists(DIR + "voices.json"):
		V = JSON.parse_string(FileAccess.get_file_as_string(DIR + "voices.json"))


func _hero():
	return main.hero if main != null else null


## (main.ts lineTime) How long a line is up.
static func line_time(text: String) -> float:
	return maxf(2.6, 1.3 + text.length() * 0.065)


## The hero says a line: over his head (render/fx.ts say), and in his voice.
func say(text: String, secs := QUIP_TIME) -> void:
	var h = _hero()
	if h == null or text == "":
		return
	quip = {"text": text, "t": 0.0, "long": secs}
	var f = V.get("hero", {}).get(h.cls, {}).get(text)
	if f != null:
		main.sfx.play_path(DIR + str(f))
	heard.append([h.cls, text])


## A new run begun in a dungeon: his line once he has come together (main.ts enter, `arrived`).
func arrived() -> void:
	var h = _hero()
	if h == null or main.is_home(main.place):
		return
	var lines: Array = V.get("arrival", {}).get(h.cls, [])
	if not lines.is_empty():
		_arrival = {"t": 0.0, "line": lines.pick_random()}


## game.ts quip: the hero's word on killing something big.
func killed(m) -> void:
	var h = _hero()
	if h == null or V.is_empty() or not (m.boss or m.elite or m.champion):
		return
	var Q: Dictionary = V["quips"]
	if not m.boss and (_run - _quip_at < float(Q["gap"]) or randf() >= float(Q["chance"])):
		return
	var W: Dictionary = Q["weight"]
	var lists: Array = []
	if m.boss:
		lists.append([float(W["boss"]), Q["boss"]])
	var i: int = m.last_skill
	if i >= 0 and i <= 2 and h.loadout != null:
		var words: Array = (h.loadout.fronts(i) as Array) + (h.loadout.behinds(i) as Array)
		words = words.filter(func(w): return w != null and str(w) != "")
		if not words.is_empty():
			var w := str(words.pick_random()).split(":")[0]
			if Q["word"].has(w):
				lists.append([float(W["word"]), Q["word"][w]])
		var sk := str(h.loadout.id(i))
		if Q["skill"].has(sk):
			lists.append([float(W["skill"]), Q["skill"][sk]])
	var mh = main.loot.gear.get("mainhand") if main.loot != null else null
	if mh != null and mh.get("weapon", false):
		var wk := str(mh.get("kind", "")).to_lower().replace(" ", "")
		if Q["weapon"].has(wk):
			lists.append([float(W["weapon"]), Q["weapon"][wk]])
	lists.append([float(W["attr"]), Q["attr"][_top_attr()]])
	lists.append([float(W["cls"]), Q["cls"].get(h.cls, [])])
	lists.append([float(W["any"]), Q["any"]])
	var open: Array = []
	for l in lists:
		var left: Array = (l[1] as Array).filter(func(t): return not _said.has(t))
		if not left.is_empty():
			open.append([l[0], left])
	if open.is_empty():
		# (every line that fits has been said: they may all be said again)
		for l in lists:
			for t in l[1]:
				_said.erase(t)
		for l in lists:
			if not (l[1] as Array).is_empty():
				open.append([l[0], (l[1] as Array).duplicate()])
	if open.is_empty():
		return
	var total := 0.0
	for l in open:
		total += float(l[0])
	var r := randf() * total
	var pick: Array = open[open.size() - 1]
	for l in open:
		r -= float(l[0])
		if r < 0.0:
			pick = l
			break
	var line: String = (pick[1] as Array).pick_random()
	_said[line] = true
	_quip_at = _run
	say(line)


## (game.ts topAttr) His highest attribute, his class's own first where it ties.
func _top_attr() -> String:
	var h = _hero()
	var s: Dictionary = h.stats
	var best := maxf(float(s["str"]), maxf(float(s["dex"]), float(s["int"])))
	var cls_def = preload("res://scripts/words.gd").data()["classes"].get(h.cls)
	var own := str(cls_def.get("primary", "str")) if cls_def != null else "str"
	if float(s.get(own, 0.0)) == best:
		return own
	return "str" if float(s["str"]) == best else ("dex" if float(s["dex"]) == best else "int")


func _process(dt: float) -> void:
	var h = _hero()
	if h == null:
		return
	_run += dt
	if not quip.is_empty():
		quip["t"] = float(quip["t"]) + dt
		if float(quip["t"]) > float(quip["long"]):
			quip = {}
	if not tag.is_empty():
		tag["t"] = float(tag["t"]) + dt
		# (a townsperson's line ends as he leaves the town: THE BUG HUNT, 24 Nov 2026, it followed him down the waypoint)
		if float(tag["t"]) > TAG_TIME or main.town == null or not is_instance_valid(main.town):
			tag = {}
	if not _arrival.is_empty():
		_arrival["t"] = float(_arrival["t"]) + dt
		if float(_arrival["t"]) >= ARRIVAL_SAYS:
			var line: String = _arrival["line"]
			_arrival = {}
			if h.alive:
				say(line, line_time(line))
	_tags()
	queue_redraw()


## game.ts tags: one of the town's people has a word for him as he comes up.
func _tags() -> void:
	var h = _hero()
	var town = main.town
	if town == null or not main.is_home(main.place) or V.is_empty():
		return
	var T: Dictionary = V["tags"]
	for who in T["lines"]:
		var at = _where(town, who)
		if at == null:
			continue
		var near: bool = h.world.distance_to(at) < float(T["near"])
		var was: bool = _tag_near.get(who, false)
		_tag_near[who] = near
		if not near or was:
			continue
		if _run - _tag_all < float(T["gapAll"]) or _run - float(_tag_at.get(who, -1e9)) < float(T["gapOne"]):
			continue
		if randf() >= float(T["chance"]):
			continue
		if not _tag_said.has(who):
			_tag_said[who] = []
		var said: Array = _tag_said[who]
		var all: Array = T["lines"][who]
		var open: Array = all.filter(func(l): return not said.has(l))
		if open.is_empty():
			# (every line of theirs has been said: they may all be said again, but not the last one first)
			var last = said.back() if not said.is_empty() else null
			said.clear()
			open = all.filter(func(l): return l != last or all.size() == 1)
		if open.is_empty():
			continue
		var line: String = open.pick_random()
		said.append(line)
		_tag_at[who] = _run
		_tag_all = _run
		tag = {"who": who, "text": line, "at": at, "t": 0.0}
		var f = V.get("town", {}).get(who, {}).get(line)
		if f != null:
			main.sfx.play_path(DIR + str(f))
		heard.append([who, line])


## Where one of the town's people stands: the person drawn there (town.gd's folk), else where their service is.
func _where(town, who: String):
	for f in town.get("_folk"):
		if str(f.get("kind", "")) == who:
			return Vector2(float(f["x"]), float(f["y"]))
	for s in town.data.get("stations", []):
		if str(s["kind"]) == who:
			return Vector2(float(s["x"]), float(s["y"]))
	return null


# --- the slips (render/fx.ts: the hero's word, a townsperson's), in game pixels ---

func _draw() -> void:
	var h = _hero()
	if h == null:
		return
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = (cam.get_screen_center_position() - get_viewport_rect().size / 2.0) / 2.0 if cam != null else Vector2.ZERO
	var view_w: float = get_viewport_rect().size.x / 2.0
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	if not quip.is_empty():
		var q := quip
		var long: float = q["long"]
		var t: float = q["t"]
		var a: float = 1.0 if t < long - 0.4 else maxf(0.0, (long - t) / 0.4)
		var text: String = q["text"]
		var rows: Array = _wrap(text, view_w - 16.0) if PF.width(text) + 10.0 > view_w - 4.0 else [text]
		var w := 0.0
		for r in rows:
			w = maxf(w, PF.width(r))
		w += 10.0
		var hp: Vector2 = Iso.to_screen(h.world.x, h.world.y) / 2.0
		var px := roundf(hp.x)
		var x := px
		if rows.size() > 1 or w > view_w - 4.0:
			x = clampf(px, tl.x + ceilf(w / 2.0) + 2.0, tl.x + view_w - ceilf(w / 2.0) - 2.0)
		var y := roundf(hp.y) - 52.0 - roundf(minf(1.0, t / 0.12) * 4.0) - (rows.size() - 1) * 10.0
		_slip(x, y, px, w, rows, Color(INK, 0.72 * a), GD5 if t < 0.1 else Color.WHITE, a)
	if not tag.is_empty():
		var g := tag
		var t: float = g["t"]
		var a: float = 1.0 if t < TAG_TIME - 0.4 else maxf(0.0, (TAG_TIME - t) / 0.4)
		var text: String = g["text"]
		var w := PF.width(text) + 10.0
		var p: Vector2 = Iso.to_screen(g["at"].x, g["at"].y) / 2.0
		var px := roundf(p.x)
		var x := clampf(px, tl.x + ceilf(w / 2.0) + 2.0, tl.x + view_w - ceilf(w / 2.0) - 2.0) if view_w > w + 4.0 else px
		var y := maxf(tl.y + 4.0, roundf(p.y) - float(TAG_LIFT.get(g["who"], 60.0)) - roundf(minf(1.0, t / 0.12) * 4.0))
		_slip(x, y, px, w, [text], Color(INK, 0.72 * a), GD5 if t < 0.1 else Color.WHITE, a)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## A dark slip under the rows, its little tail pointing down at whoever says it (render/fx.ts).
func _slip(x: float, y: float, px: float, w: float, rows: Array, ink: Color, color: Color, a: float) -> void:
	var foot := y + 1.0 + rows.size() * 10.0
	draw_rect(Rect2(x - floorf(w / 2.0), y - 3.0, w, 4.0 + rows.size() * 10.0), ink)
	var tx := clampf(px, x - floorf(w / 2.0) + 3.0, x + floorf(w / 2.0) - 4.0)
	draw_rect(Rect2(tx - 2.0, foot, 5, 1), ink)
	draw_rect(Rect2(tx - 1.0, foot + 1.0, 3, 1), ink)
	draw_rect(Rect2(tx, foot + 2.0, 1, 1), ink)
	for i in rows.size():
		PF.draw(self, rows[i], x, y + i * 10.0, Color(color, a), {"align": "center", "shadow": Color(INK, a)})


func _wrap(text: String, width: float) -> Array:
	var out: Array = []
	var line := ""
	for word in text.split(" "):
		var next := word if line == "" else line + " " + word
		if line != "" and PF.width(next) > width:
			out.append(line)
			line = word
		else:
			line = next
	if line != "":
		out.append(line)
	return out
