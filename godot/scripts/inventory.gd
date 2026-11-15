## THE GEAR SCREEN (I or Tab; the game's ui/inventory.ts, at its smallest): on the left half of the screen, the game
## seen in the other half (Version 14.2), the game held still while it is open. In the heroes' colours (Version 13.0):
## deep blue panels, cyan for what is picked, pink for the one thing to press.
##   WORN: his ten slots. A click takes a piece off, into the bag.
##   THE BAG: 24. A click wears the piece (what was worn there goes to the bag in its place).
##   HIS STATS: damage, attacks a second, life, armour, Str / Dex / Int; and +5 to place after a level (game.ts chooseAttr).
##   HIS WORDS: the Power word, put in Strike's front slot or its behind slot (free, and taken back with a click: game.ts
##     placeWord, unsocket), or BURNED into a worn piece (it is used up: game.ts imbue). Strike's behind slot opens at level 4
##     (SLOT_OPENS_FIRST, behind [4, 20]).
## Pointing at a piece shows its card: name in its rarity's colour, its kind, its own property, the rest. A stand-in for the
## game's own frames and lettering.
extends Control

const PANEL := Color(0.05, 0.07, 0.2, 1.0)
const BOX := Color(0.09, 0.12, 0.32)
const EDGE := Color(0.22, 0.28, 0.62)
const PICK := Color(0.35, 0.9, 1.0)
const PRESS := Color(0.96, 0.27, 0.47)
const DIM := Color(0.55, 0.6, 0.8)
const TEXT := Color(0.86, 0.88, 0.96)
const SLOT_NAMES := {"mainhand": "WEAPON", "offhand": "OFF-HAND", "helm": "HELM", "chest": "CHEST", "gloves": "GLOVES",
	"belt": "BELT", "boots": "BOOTS", "amulet": "AMULET", "ring1": "RING", "ring2": "RING"}
const BEHIND_OPENS := 4

var loot  # loot.gd
var hero  # hero.gd
var _font: Font
var _hits: Array = []  # [Rect2, action, arg]
var _hover := {}
var _burning := false


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	process_mode = Node.PROCESS_MODE_ALWAYS
	_font = ThemeDB.fallback_font
	visible = false
	if not InputMap.has_action("inventory"):
		InputMap.add_action("inventory")
		for k in [KEY_I, KEY_TAB]:
			var e := InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event("inventory", e)
		var b := InputEventJoypadButton.new()
		b.button_index = JOY_BUTTON_BACK
		InputMap.action_add_event("inventory", b)


func _process(_dt: float) -> void:
	if Input.is_action_just_pressed("inventory"):
		toggle()
	if visible:
		queue_redraw()


func toggle() -> void:
	visible = not visible
	get_tree().paused = visible
	_burning = false
	mouse_filter = Control.MOUSE_FILTER_STOP if visible else Control.MOUSE_FILTER_IGNORE


func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseMotion:
		_hover = {}
		for h in _hits:
			if h[0].has_point(e.position) and (h[1] == "worn" or h[1] == "bag"):
				_hover = {"item": h[3], "at": e.position}
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		for h in _hits:
			if h[0].has_point(e.position):
				_press(h[1], h[2])
				accept_event()
				return


func _press(action: String, arg) -> void:
	match action:
		"worn":
			if _burning:
				var why: String = loot.burn("power", arg)
				if why != "":
					loot.say(why, PRESS)
				_burning = false
			else:
				loot.unequip(arg)
		"bag":
			loot.equip_from_bag(arg)
		"attr":
			loot.choose_attr(arg)
		"front", "behind":
			if hero.strike_words[action] == "power":
				hero.strike_words[action] = ""
				loot.words["power"] += 1
			elif loot.words["power"] > 0 and (action == "front" or loot.level >= BEHIND_OPENS):
				hero.strike_words[action] = "power"
				loot.words["power"] -= 1
		"burn":
			_burning = not _burning and loot.words["power"] > 0
		"close":
			toggle()
	_hover = {}


func _draw() -> void:
	_hits = []
	var W := size.x / 2.0
	draw_rect(Rect2(0, 0, W, size.y), PANEL)
	draw_line(Vector2(W, 0), Vector2(W, size.y), EDGE, 2.0)
	_text(Vector2(16, 22), "GEAR", 16, PICK)
	_button(Rect2(W - 70, 8, 58, 20), "CLOSE", "close", null, DIM)
	# worn: two columns of five
	for i in loot.EQUIP.size():
		var slot: String = loot.EQUIP[i]
		var r := Rect2(16 + (i % 2) * 112, 36 + floorf(i / 2.0) * 40, 106, 36)
		var it = loot.gear[slot]
		draw_rect(r, BOX)
		draw_rect(r, (PRESS if _burning and it != null else EDGE), false, 1.0)
		_text(r.position + Vector2(38, 13), SLOT_NAMES[slot], 9, DIM)
		if it != null:
			_icon(it["icon"], Rect2(r.position + Vector2(3, 3), Vector2(30, 30)))
			_text(r.position + Vector2(38, 28), _short(it["name"], 13), 10, loot.RARITY_COLOR[int(it["rarity"])])
		_hits.append([r, "worn", slot, it])
	# the bag: 6 by 4
	var by := 246.0
	_text(Vector2(16, by - 6), "BAG  %d / %d" % [loot.bag.size(), loot.BAG], 11, DIM)
	for i in loot.BAG:
		var r := Rect2(16 + (i % 6) * 36, by + floorf(i / 6.0) * 36, 32, 32)
		draw_rect(r, BOX)
		draw_rect(r, EDGE, false, 1.0)
		if i < loot.bag.size():
			var it: Dictionary = loot.bag[i]
			_icon(it["icon"], r.grow(-2))
			draw_rect(Rect2(r.position + Vector2(0, 29), Vector2(32, 3)), loot.RARITY_COLOR[int(it["rarity"])])
			_hits.append([r, "bag", i, it])
	# his stats
	var sx := 250.0
	var s: Dictionary = hero.stats
	_text(Vector2(sx, 46), "LEVEL %d" % loot.level, 13, PICK)
	var lines := [
		"DAMAGE  %d-%d" % [roundi(s["dmg_min"] * (1.0 + s["str"] / 100.0) * (1.0 + s["dmg_pct"] / 100.0)), roundi(s["dmg_max"] * (1.0 + s["str"] / 100.0) * (1.0 + s["dmg_pct"] / 100.0))],
		"ATTACKS  %.2f a second" % s["aps"],
		"LIFE  %d" % roundi(hero.max_life),
		"ARMOUR  %d" % roundi(s["armor"]),
		"CRITICAL  %.1f%%" % s["crit_chance"],
	]
	for i in lines.size():
		_text(Vector2(sx, 66 + i * 15), lines[i], 11, TEXT)
	for i in 3:
		var a: String = ["str", "dex", "int"][i]
		var y := 146.0 + i * 20
		_text(Vector2(sx, y + 13), "%s  %d" % [a.to_upper(), roundi(s[a])], 11, TEXT)
		if loot.points > 0:
			_button(Rect2(sx + 80, y, 52, 17), "+5", "attr", a, PRESS)
	if loot.points > 0:
		_text(Vector2(sx, 222), "LEVEL UP: +5 TO ONE", 10, PRESS)
	# his words
	var wy := 400.0
	_text(Vector2(16, wy), "WORDS", 13, PICK)
	_icon("word:power", Rect2(16, wy + 8, 24, 24))
	_text(Vector2(44, wy + 25), "POWER x%d" % loot.words["power"], 11, TEXT if loot.words["power"] > 0 else DIM)
	if not loot.ring_lit:
		_text(Vector2(130, wy + 25), "(the fallen wordsmith has the first)", 10, DIM)
	_text(Vector2(16, wy + 52), "STRIKE", 11, TEXT)
	for j in 2:
		var side: String = ["front", "behind"][j]
		var r := Rect2(70 + j * 112, wy + 38, 104, 22)
		var open: bool = side == "front" or loot.level >= BEHIND_OPENS
		draw_rect(r, BOX)
		var has: bool = hero.strike_words[side] == "power"
		draw_rect(r, PICK if has else (EDGE if open else Color(0.15, 0.17, 0.3)), false, 1.5)
		var label := ("POWER " if has else "") + side.to_upper()
		if not open:
			label = "BEHIND: LEVEL %d" % BEHIND_OPENS
		_text(r.position + Vector2(6, 15), label, 10, PICK if has else (DIM if open else Color(0.35, 0.38, 0.55)))
		if open:
			_hits.append([r, side, null, null])
	if loot.words["power"] > 0:
		_button(Rect2(16, wy + 70, 200, 22), "BURN INTO A WORN PIECE" if not _burning else "NOW PICK A WORN PIECE", "burn", null, PRESS)
	# the card of what is pointed at
	if not _hover.is_empty() and _hover["item"] != null:
		_card(_hover["item"], _hover["at"])


func _card(it: Dictionary, at: Vector2) -> void:
	var rows: Array = [[it["name"], loot.RARITY_COLOR[int(it["rarity"])], 13], [it["kind"], DIM, 10]]
	for l in it["implicit"]:
		rows.append([l, TEXT, 11])
	for l in it["lines"]:
		rows.append([l, Color(0.55, 0.7, 1.0), 11])
	if it["weapon"]:
		rows.append(["%.2f attacks a second" % it["aps"], DIM, 10])
	rows.append(["Level %d" % it["req"], DIM, 10])
	var w := 230.0
	var h := 10.0 + rows.size() * 16.0
	var p := at + Vector2(16, 0)
	p.x = minf(p.x, size.x - w - 4)
	p.y = minf(p.y, size.y - h - 4)
	draw_rect(Rect2(p, Vector2(w, h)), Color(0.03, 0.04, 0.13, 0.97))
	draw_rect(Rect2(p, Vector2(w, h)), loot.RARITY_COLOR[int(it["rarity"])], false, 1.5)
	for i in rows.size():
		_text(p + Vector2(8, 18 + i * 16), rows[i][0], rows[i][2], rows[i][1])


func _button(r: Rect2, label: String, action: String, arg, color: Color) -> void:
	draw_rect(r, Color(color, 0.18))
	draw_rect(r, color, false, 1.5)
	_text(r.position + Vector2(6, r.size.y - 6), label, 10, color)
	_hits.append([r, action, arg, null])


func _icon(key: String, r: Rect2) -> void:
	var p: Dictionary = loot.pics[key]
	var src: Rect2 = p["rect"]
	var k := minf(r.size.x / src.size.x, r.size.y / src.size.y)
	var d := src.size * k
	draw_texture_rect_region(loot.sheet, Rect2(r.position + (r.size - d) / 2.0, d), src)


func _text(at: Vector2, s: String, px: int, c: Color) -> void:
	draw_string(_font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, px, c)


func _short(s: String, n: int) -> String:
	return s if s.length() <= n else s.substr(0, n - 1) + "."
