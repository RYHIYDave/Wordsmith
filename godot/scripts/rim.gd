## THE SHAFT'S RIM, ENDLESS MODE'S TOWN (game/rim.ts; render/rim.ts; art/shaft_rim.ts, art/shaft_props.ts: the art chat's, his yes to
## all of it, 11 Nov 2026, by 13:43, “Yes, hand it to main (Recommended)”, and to it in the game by 20:31). His town once endless mode
## is open to him (his pick, “Once endless opens (Recommended)”). Its look is recorded whole from the game (tools/godot_record.mjs
## rim: its ground, the shaft and its stair, the game's own things in its stone, its keepers, its torches and posts, with the record
## stone uncut, the trophies wall empty and the gate bare); its layout assets/rim/layout.json (tools/godot_town.ts); what changes
## on it drawn here over that, each the art's own painting (tools/godot_rim.ts, assets/rim/pics.png):
##   THE RECORD STONE  a notch for each endless level this hero has reached (his pick, “Every endless level (Recommended)”), at most
##                     seventy; the newest glowing on the visit it is cut; its name the level reached, and his best where a hero
##                     before went deeper ("ENDLESS 4, BEST 9"). Cut as he comes in: "A notch is cut in the record stone: Endless N."
##                     DELVE DEEPER (main.gd DELVE): the stone is used ("E: Record stone: delve deeper"), asked twice, and names
##                     the hero's depth first ("DEPTH 2, ENDLESS 14").
##   THE TROPHIES WALL four mounts, the bosses of floors 5, 10, 15 and 20: filled while he holds that boss's shard of the tablet
##                     (the account's, kept with the stash: main.gd quarters).
##   THE GATE          its three sockets holding the words laid on it (main.gd plan), each a small round of the word's own colour.
##   WALKING           round, as the town is: the pit's brink, the six standing stones and the six braziers hold a body off by their
##                     own round (`rounds`), all the way round the kerb; out on the tongue to the portal's landing (`way_out`); a
##                     step one of them refuses taken round it (`round_step`).
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const DIR := "res://assets/rim/"

var main
var town
var stands: Node2D
var look

var data: Dictionary = {}
var P: Dictionary = {}
var _sheet: Texture2D
var _pieces := {}  # kind -> {node, at, d}
var _gems: Array = []
var _gem_tex := {}
## (what it shows now: game.ts comeToRim)
var notches := 0
var fresh := false
var reached := 0
var best := 0
## (DELVE DEEPER: the hero's depth, written on the stone; 0 while it is off: main.gd delve)
var depth := 0
var held: Array = [false, false, false, false]
var _shown := ""
## (ENDLESS_KEY, game/endless_key.ts) The tablet set in the bench: seconds since it was set (a large number if set on an earlier
## visit), and the landing open; {} not set. What is drawn of it: the tablet in the bench's socket over the slab (the shards held
## lying in it dark; set, burning: art/endless_tablet.ts SOCKET_LIT), and the landing's portal opening and standing open.
var key := {}
var _socket: Sprite2D
var _portal_floor: Sprite2D
var _portal_rise: Sprite2D
var _slab := Vector2(-1, -1)
var flats: Node2D


func _ready() -> void:
	P = JSON.parse_string(FileAccess.get_file_as_string(DIR + "pics.json"))
	_sheet = load(DIR + "pics.png")
	for pc in P["pieces"]:
		var at := Vector2(float(pc["at"][0]), float(pc["at"][1]))
		var d := float(pc["d"])
		# (the gate's own picture is the recorded one, its words laid over it)
		if str(pc["kind"]) == "gate":
			_pieces["gate"] = {"node": null, "at": at, "d": d}
			continue
		# (the recorded one, as it stood uncut or empty, hidden: this one in its place)
		if look != null and look.has_method("hide_stands_at"):
			look.hide_stands_at(Vector2((at.x - at.y) * 16.0, (at.x + at.y) * 8.0))
		var n := Sprite2D.new()
		n.centered = false
		n.region_enabled = true
		n.texture = _sheet
		stands.add_child(n)
		_pieces[str(pc["kind"])] = {"node": n, "at": at, "d": d}
	for p in town.data["props"]:
		if p["kind"] == "runeSlab":
			_slab = Vector2(float(p["x"]), float(p["y"]))
	_socket = _sprite(stands)
	_portal_floor = _sprite(flats if flats != null else stands)
	_portal_rise = _sprite(stands)
	show_state()


func _sprite(into: Node2D) -> Sprite2D:
	var n := Sprite2D.new()
	n.centered = false
	n.region_enabled = true
	n.texture = _sheet
	n.visible = false
	into.add_child(n)
	return n


## (ENDLESS_KEY: game.ts updateKey) Each frame: the key's clock; the landing open ("The landing at the shaft stands open."); the
## open landing walked into, down through it (main.gd enter_final).
func _process(dt: float) -> void:
	if main == null:
		return
	if key.is_empty() and main.final_open:
		key = {"age": 1e4, "open": true}
	if not key.is_empty():
		key["age"] = float(key["age"]) + dt
		var K: Dictionary = P["key"]
		if not key["open"] and float(key["age"]) >= float(K["portalAt"]) + float(K["portalOpen"]) / 30.0:
			key["open"] = true
			main.loot.say(str(K["text"]["open"]), Color("#8af078"))
		var land := Vector2(float(town.data["wayOut"]["landing"][0]), float(town.data["wayOut"]["landing"][1]))
		if key["open"] and not main._going and main.hero.alive and main.hero.world.distance_to(land) < float(K["near"]):
			main.enter_final()
	_show_key()


func _show_key() -> void:
	var K: Dictionary = P["key"]
	var sk := ""
	if not key.is_empty():
		var f := floori(float(key["age"]) * 30.0)
		var burn: int = int(K["lit"]["kindle"]) + int(K["lit"]["flare"])
		sk = "lit|%d" % (f if f < int(K["litFrames"]) else burn + (f - burn) % int(K["lit"]["burn"]))
	else:
		var bits := 0
		for k in 4:
			if k < held.size() and held[k]:
				bits |= 1 << k
		sk = "socket|%d" % bits if bits > 0 else ""
	_on(_socket, sk, _slab, _slab.x + _slab.y + 0.002)
	var pf := -1
	if not key.is_empty():
		var g := floori((float(key["age"]) - float(K["portalAt"])) * 30.0)
		if g >= 0:
			var o := int(K["portalOpen"])
			pf = g if g < o else o + (g - o) % int(K["portalIdle"])
	var land := Vector2(float(town.data["wayOut"]["landing"][0]), float(town.data["wayOut"]["landing"][1]))
	_on(_portal_floor, "portal|floor|%d" % pf if pf >= 0 else "", land, -1.0)
	_on(_portal_rise, "portal|rise|%d" % pf if pf >= 0 else "", land, land.x + land.y)


func _on(n: Sprite2D, k: String, at: Vector2, d: float) -> void:
	if n == null:
		return
	if k == "" or not P["pics"].has(k) or at.x < 0.0:
		n.visible = false
		return
	var q: Array = P["pics"][k]
	n.visible = true
	n.region_rect = Rect2(q[0], q[1], q[2], q[3])
	n.offset = -Vector2(q[4], q[5])
	if d < 0.0:
		n.position = Iso.to_screen(at.x, at.y)
	else:
		_lay(n, at, d)


## Set it as it stands now: the record stone, the trophies wall, the gate's words (main.gd come_to_rim; the gate's panel).
func show_state() -> void:
	var words: Array = main.plan if main != null else []
	var key := "%d|%s|%s|%s" % [notches, fresh, held, words]
	if key == _shown:
		return
	_shown = key
	var n := clampi(notches, 0, int(P["room"]))
	_put("record", "record|%d|%d" % [n, 1 if fresh and n > 0 else 0])
	var bits := 0
	for k in 4:
		if k < held.size() and held[k]:
			bits |= 1 << k
	_put("trophies", "trophies|%d" % bits)
	for g in _gems:
		g.queue_free()
	_gems = []
	var gate: Dictionary = _pieces.get("gate", {})
	if gate.is_empty():
		return
	for i in mini(words.size(), (P["sockets"] as Array).size()):
		var s: Array = P["sockets"][i]
		var at: Vector2 = gate["at"] + Vector2(float(s[0]), float(s[1]))
		var g := Sprite2D.new()
		g.texture = _gem(str(words[i]))
		g.centered = false
		g.offset = -Vector2(5, 5)
		_lay(g, at, float(gate["d"]) + 0.002)
		stands.add_child(g)
		_gems.append(g)


## One of the pieces as its picture `key`.
func _put(kind: String, key: String) -> void:
	var p: Dictionary = _pieces.get(kind, {})
	if p.is_empty() or p["node"] == null:
		return
	var n: Sprite2D = p["node"]
	if not P["pics"].has(key):
		n.visible = false
		return
	var q: Array = P["pics"][key]
	n.visible = true
	n.region_rect = Rect2(q[0], q[1], q[2], q[3])
	n.offset = -Vector2(q[4], q[5])
	_lay(n, p["at"], float(p["d"]))


## Stood at `at` (tiles), sorted among the figures at depth `d` (town.gd _stand_pic).
func _lay(n: Sprite2D, at: Vector2, d: float) -> void:
	var top := Iso.to_screen(at.x, at.y)
	n.position = Vector2(top.x, d * Iso.HH)
	n.offset = Vector2(n.offset.x, n.offset.y) + Vector2(0, top.y - d * Iso.HH)


## (render/rim.ts gem) A word set in one of the gate's sockets: a small round of its own colour (five game pixels across), lighter
## at its upper left, a dark seam round it.
func _gem(w: String) -> Texture2D:
	if _gem_tex.has(w):
		return _gem_tex[w]
	var col: Color = main.loot.word_color(w) if main != null else Color("#7af8f0")
	var img := Image.create(10, 10, false, Image.FORMAT_RGBA8)
	for y in 10:
		for x in 10:
			var d := Vector2(x + 0.5 - 5.0, y + 0.5 - 5.0).length()
			if d > 5.0:
				continue
			var c: Color = Color("#07060f") if d > 4.0 else col
			if d <= 4.0 and d > 3.0 and x + y > 10:
				c = c.lerp(Color("#07060f"), 0.45)
			elif d <= 2.2 and x + y < 9:
				c = c.lerp(Color.WHITE, 0.5)
			img.set_pixel(x, y, c)
	var t := ImageTexture.create_from_image(img)
	_gem_tex[w] = t
	return t


## (game/rim.ts recordLine) What is written over the record stone.
func record_line() -> String:
	# (DELVE DEEPER: the stone is where he delves; it names his depth first: "DEPTH 2, ENDLESS 14")
	if depth > 0:
		return "DEPTH %d, ENDLESS %d" % [depth, maxi(1, reached)]
	if reached <= 0:
		return "RECORD"
	var here := ("Endless %d" % reached).to_upper()
	return "%s, BEST %d" % [here, best] if best > reached else here


## Its names: the record stone's and the trophies wall's (render/rim.ts names, NAME_AT), as the services' are written.
func names() -> Array:
	var out: Array = []
	for k in ["record", "trophies"]:
		var p: Dictionary = _pieces.get(k, {})
		if p.is_empty():
			continue
		out.append({"at": p["at"], "lift": float(P["names"][k]), "text": record_line() if k == "record" else "TROPHIES"})
	return out


# --- WALKING ROUND (game/rim.ts rimHolds, onWayOut, roundStep) ---

## Is (x, y) on the portal's tongue or its landing, far enough in from their edges for a body's middle?
static func on_way_out(L: Dictionary, x: float, y: float, more := 0.0) -> bool:
	var W: Dictionary = L["wayOut"]
	var T: Dictionary = W["tongue"]
	var land := Vector2(float(W["landing"][0]), float(W["landing"][1]))
	if Vector2(x, y).distance_to(land) <= float(T["r"]) - float(W["landIn"]) - more:
		return true
	var a := deg_to_rad(float(T["at"]))
	var ax := cos(a)
	var ay := sin(a)
	var ox := x - float(W["cx"])
	var oy := y - float(W["cy"])
	var along := ox * ax + oy * ay
	var across := absf(-ox * ay + oy * ax)
	return along >= float(T["out"]) and along <= float(W["brink"]) + 0.6 and across <= float(T["half"]) - float(W["tongueIn"]) - more


## May a body of radius `r` stand at (x, y) for the town's round things?
static func holds(L: Dictionary, x: float, y: float, r: float) -> bool:
	for q in L["rounds"]:
		var d := Vector2(x, y).distance_to(Vector2(float(q["x"]), float(q["y"])))
		if q.get("pit", false):
			if d < float(q["r"]) and not on_way_out(L, x, y):
				return false
		elif d < float(q["r"]) + r:
			return false
	return true


## A step a round thing refused, taken round it, as far as the step went that way; null where none refused it.
static func round_step(L: Dictionary, at: Vector2, r: float, d: Vector2):
	var n := at + d
	var c = null
	for q in L["rounds"]:
		var m := Vector2(float(q["x"]), float(q["y"]))
		var pit: bool = q.get("pit", false)
		var dd := n.distance_to(m)
		if (dd < float(q["r"]) and not on_way_out(L, n.x, n.y)) if pit else dd < float(q["r"]) + r:
			c = {"m": m, "keep": float(q["r"]) if pit else float(q["r"]) + r}
			break
	if c == null:
		return null
	var o: Vector2 = at - c["m"]
	if o.length() < 1e-6:
		return null
	var t := Vector2(-o.y, o.x) / o.length()
	var along := d.dot(t)
	if absf(along) < 1e-6:
		return null
	var p := at + t * along
	var pd: float = p.distance_to(c["m"])
	if pd < 1e-6:
		return null
	var k := maxf(pd, float(c["keep"]) + 1e-4) / pd
	return c["m"] + (p - c["m"]) * k
