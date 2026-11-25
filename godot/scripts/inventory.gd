## THE GEAR SCREEN (I or Tab; the game's ui/inventory.ts): on the right half of the screen (invRect), the game seen in the other
## half with the hero in its middle (main.ts renderer.view; beside a service the picture stays where it was), held still while it
## is open, the HUD and the small map put by. In the game's own letters (pixel_font.gd) and colours (ui.ts THEME), its boxes with
## their corners cut (ui.ts box), cyan for what is picked, pink for the one thing to press.
## LAID OUT AS THE GAME LAYS ITS OWN (ui/inventory.ts drawInventory, two of the screen's pixels to one of the game's): along
## the top the names of its pages and DONE; the page; and a bottom that never changes, YOUR WORDS over the BAG.
##   GEAR: the hero as he stands, twice his size, his scarf moving, on a ground of his own between two columns of slots in the
##     order of the body (DOLL_SLOT; an empty one shows faintly what goes there); a press takes a piece off, into the bag. Beside
##     him his numbers at a glance (drawGlance), and +5 to place after a level (game.ts chooseAttr).
##   STATS: the attributes and the level, how far to the next; the defences and the attack side by side (drawStats).
##   ATTACKS: each of his moves that is open a line, as it reads: its slots IN FRONT, the move on its plate (its picture, its
##     name, how it is made), its slots BEHIND, and what A HIT of it does (game.ts hitRange) and how often. A slot is a socket
##     the size of a bag's cell; a word set in it shows as its rune stone. A move not yet open is not shown, nor a slot not
##     yet open (THE FIRST LEVELS: none until the wordsmith's ring is lit; one in front at once, one behind from level 4, the
##     second in front at 15 and behind at 20: loadout.gd). Under the three lines the move last touched is read out: its
##     whole name in its words' colours, its damage, and its lines (words.gd resolve): its card.
##   YOUR WORDS: the words he holds, each a tile (its rune stone, its name, how many). A WORD IS READ BY PRESSING IT, and put
##     somewhere by dragging it there, or by pressing it and then the place (ui/inventory.ts, the owner's words there). On a
##     move it is only lent (game.ts placeWord): it is set at once, the word that was there goes back to his words, and it is
##     taken out again by dragging it out, a second press on it, or the right button (unsocket). What a slot refuses is said in
##     the game's own words (loadout.gd problem: "One damage word per side", "Already there"). On a piece of gear it is used
##     up (game.ts imbue): the screen asks once (BURN IT, CANCEL), what it becomes is rolled, and the card says what it
##     became.
##   THE BAG: 24, eight to a row. A press wears the piece (what was worn there goes to the bag in its place). Under each
##     piece its four places for properties (ui/panels.ts drawItemPips): those it was found with, the words burned in, each
##     in its word's colour, and the room left.
## WHAT IS READ (a word, what it would do in a slot or on a piece, the question before it is burned in, what it became) is on
## a card over the other half of the screen, against the panel's edge, level with the thing it is about. Pointing at a
## piece shows its own card: its name in its rarity's colour, its kind, its properties, the words burned into it, the room
## it has left.
## A NEW PLAYER'S FIRST WORD (ui/guide.ts guideCoach): while it waits, the page is the attacks', a line under them says where
## it goes, and it goes nowhere else ("Your first word goes on an attack").
## LEXICON beside the bag (WORD_LEX): every word he holds on a panel of its own over the game's half. At a service, the tile at
## the end of the words' line (WORD_ROOM): ALL turns the bottom to every word, BAG back to the bag.
## THE RUNE BAG AND THE MELDING STONE (RUNE_BAG, on at his yes, 23 Nov 2026: “Build both in the game (Recommended)”): the LEXICON
## panel is the RUNE BAG (rune_bag.gd: groups, a search, sorting, a card when a rune is held), opened by RUNES; at the wordsmith,
## while he melds, the bag stands on this panel's half and his half is the MELDING STONE (meld_stone.gd), the meld played out on
## it. docs/mockups/rune_bag is the picture he said yes to.
extends Control

const RuneBag := preload("res://scripts/rune_bag.gd")
const MeldStone := preload("res://scripts/meld_stone.gd")
## (his yes to the mock-up, 23 Nov 2026: “Build both in the game (Recommended)”)
const RUNE_BAG := {"on": true}
var _rb  # rune_bag.gd
var _ms  # meld_stone.gd
## (when each hollow above was last laid in, on the stone's clock: the rune drops in and settles)
var _ms_drop := [-9.0, -9.0]
## (whether the bag was drawn this frame, and on which half: "game", "panel" or "")
var _rb_on := ""

const Words := preload("res://scripts/words.gd")
const FoeWords := preload("res://scripts/foe_words.gd")
const Melds52 := preload("res://scripts/melds52.gd")
const DoorWords := preload("res://scripts/door_words.gd")
## THE GAME'S LETTERS (engine/font.ts: pixel_font.gd), its normal and its small
const PF := preload("res://scripts/pixel_font.gd")

const PANEL := Color("#0e0c24")
const BOX := Color("#1a1648")
## (ui.ts THEME: bg2, the ground of a button; edgeHi, the rim of a lit one; slot, an empty cell's ground)
const BG2 := Color("#2a2466")
const EDGE_HI := Color("#7a74c8")
const SLOT := Color("#0e0c24")
const HOT := Color("#4640a0")
const INK := Color("#0e0c24")
const EDGE := Color("#3a3478")
const PICK := Color("#7af8f0")
const PICK_LO := Color("#22a8c0")
const PICK_BG := Color("#12506a")
const PRESS := Color("#e0287a")
const PRESS_HI := Color("#ff7aa8")
const DIM := Color("#9c96dc")
const FAINT := Color("#5a54b0")
const TEXT := Color("#f0e8ff")
const BAD := Color("#ff6e80")
const MAGIC := Color("#9cb0ff")
const GOLD := Color("#ffe070")
## (game/vendors.ts VENDORS: whose shelf is whose)
const SHOP_NAME := {"armourer": "Armourer", "mystic": "Mystic"}
## (types.ts RARITY_NAMES)
const RARITY_NAMES := ["Normal", "Magic", "Rare", "Unique"]
const SLOT_NAMES := {"mainhand": "WEAPON", "offhand": "OFF-HAND", "helm": "HELM", "chest": "CHEST", "gloves": "GLOVES",
	"belt": "BELT", "boots": "BOOTS", "amulet": "AMULET", "ring1": "RING", "ring2": "RING"}
const PAGES := ["gear", "attacks", "stats", "talents"]
const PAGE_LABEL := {"gear": "GEAR", "attacks": "ATTACKS", "stats": "STATS", "talents": "TALENTS"}
## THE HERO AND THE SLOTS BESIDE HIM (ui/inventory.ts DOLL_W, DOLL_SLOT): a column of slots, the hero, a column of slots, game
## pixels; which column (0 screen-left of him, 1 right) and row each thing worn has its slot in, in the order of the body, a pair
## to a row: head and neck; chest and waist; the two hands' weapons; hands and feet; the two rings.
const DOLL_W := 116.0
const DOLL_ROWS := 5
const DOLL_SLOT := {"helm": [0, 0], "amulet": [1, 0], "chest": [0, 1], "belt": [1, 1], "mainhand": [0, 2], "offhand": [1, 2],
	"gloves": [0, 3], "boots": [1, 3], "ring1": [0, 4], "ring2": [1, 4]}
## (what an empty slot shows, faintly: the kind of thing that goes there: ui/inventory.ts GHOST)
const GHOST := {"mainhand": "greatsword:0", "offhand": "shield:0", "helm": "helm:0", "chest": "armor:0", "gloves": "gloves:0",
	"belt": "belt:0", "boots": "boots:0", "amulet": "amulet:0", "ring1": "ring:0", "ring2": "ring:0"}
## (the attributes' names and colours: defs.ts ATTR_NAME, ui/panels.ts ATTR_COLOR)
const ATTR_NAME := {"str": "STRENGTH", "dex": "DEXTERITY", "int": "INTELLIGENCE"}
const ATTR_COLOR := {"str": Color("#e03c44"), "dex": Color("#84c84c"), "int": Color("#58a8f0")}
const Tails := preload("res://scripts/tails.gd")
## (defs.ts CLASSES: who he is, under his level beside the bag)
const CLASS_NAME := {"warrior": "Warrior", "ranger": "Ranger", "mage": "Mage", "warlock": "Warlock", "tinkerer": "Tinkerer", "brawler": "Veteran"}
const BakedHero := preload("res://scripts/baked_hero.gd")
## THE SKILL TREES' PAGE (ui/talents.ts: talents_page.gd), and its talents' rules (talents.gd)
const TalentsPage := preload("res://scripts/talents_page.gd")
const Talents := preload("res://scripts/talents.gd")
## (how each move is made, with a mouse: ui/inventory.ts)
const HOW := ["LEFT", "RIGHT", "SPACE"]

## The game's own measures (ui/inventory.ts, ui/panels.ts), two of the screen's pixels to one of the game's: the panel's
## margin, the height of its head, a word's tile and a slot, a bag's cell and the step from one to the next, the air
## between things, a line of words, a caption with the air under it, the room the page likes to have, and how many of the
## bag's cells go in a row.
const K := 2.0
const M := 6.0 * K
const HEAD := 16.0 * K
const TH := 20.0 * K
const CELL := 20.0 * K
const PITCH := 22.0 * K
const GAP := 3.0 * K
const LINE := 22.0 * K
const CAP := 7.0 * K
const PAGE_ROOM := 118.0 * K
const BAG_COLS := 8
## (the plain letters: where the game writes in its ordinary letters, and in its small ones)
const NORMAL := 12
const SMALL := 9

var loot  # loot.gd
var main  # main.gd
var hero  # hero.gd
var _font: Font
## (the halves changed round: the panel drawn on the right: _half)
var _xf := Vector2.ZERO
var _hits: Array = []  # [Rect2, action, arg, item]
var _hover := {}
## THE VENDORS (game.ts, ui/town.ts vendorSide): open at a vendor's, his shelf on the right half; a piece there bought for
## its price (items.ts itemValue) into the bag; a piece in the bag sold for a quarter of it (game.ts sell).
var shop := ""

## (the HUD's pictures and tables, tools/godot_hud.ts: the moves' pictures, each word's forms and what it grows with, the
## colours of a move whose words have given it an element)
var _hud := {}
var _hud_tex: Texture2D

## WHAT IS IN HAND AND WHAT IS BEING READ (ui/inventory.ts InvUi): the page; the word in hand; the set word being looked at
## ([move, side, slot]); a word dropped on a piece and waiting for a yes or a no ({word, where}); what a word has just
## become on a piece ({word, item, text, t}); a line of refusal and how long it stays; the move last touched; the move a
## word has just gone into, its new name shown large for a moment ({skill, t, word}); a press on a word that may turn into
## a drag ({word, from, at, moving, was}).
var _page := "gear"
var _word := ""
var _look = null
var _pending := {}
var _result := {}
var _note := ""
var _note_t := 0.0
var _focus := 0
var _flash := {}
var _drag := {}
var _mouse := Vector2(-1000, -1000)
var _t := 0.0
## (the first word has been set while the screen is open: the coach's line says to go and try it)
var _coached := false
## (the checks that came before the pages: the next piece pressed takes the word in hand at once, unasked)
var _burn_now := false

# (where things are, laid afresh each frame: _lay)
var _tabs: Array = []
var _done := Rect2()
var _slots: Array = []   # {r, i, side, k, word}
var _plates: Array = []  # a Rect2 for each move, null for one not open
var _nums: Array = []
var _caps: Array = []
var _pouch: Array = []   # {r, w, bare, stone}
var _cells: Array = []   # {r, where, item, worn}
var _over := {}
var _card_buttons: Array = []  # [Rect2, id]
var _tal  # talents_page.gd
var _tal_buttons: Array = []  # [Rect2, action, arg]
var _dt := 0.0
var _page_y := 0.0
var _page_h := 0.0
var _strip_y := 0.0
var _pouch_y := 0.0
var _bag_y := 0.0
var _rows_end := 0.0
## (the GEAR page: the rows of the hero's slots, how far apart, how tall, where they begin; his figure's scarf, and its clock)
var _doll_pitch := 0.0
var _doll_h := 0.0
var _doll_y := 0.0
var _doll_tails = null
## (the HUD and the small map as they were before the panel came up)
var _hud_was: Array = []
var _doll_t := -10.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	process_mode = Node.PROCESS_MODE_ALWAYS
	_font = ThemeDB.fallback_font
	_hud = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hud/hud.json"))
	# (THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES: their names and colours, melds52.gd)
	Melds52.add_hud(_hud)
	_hud_tex = load("res://assets/hud/hud.png")
	_tal = TalentsPage.new(self, _hud["theme"], _hud["palette"])
	_rb = RuneBag.new(self)
	_ms = MeldStone.new(self)
	visible = false
	if not InputMap.has_action("inventory"):
		InputMap.add_action("inventory")
		for k in [KEY_I, KEY_TAB]:
			var e := InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event("inventory", e)


func _process(dt: float) -> void:
	# (not over the death screen, nor for one fallen: it closed the screen and he spent points dead; the bug hunt's sixth round)
	var fallen: bool = main != null and main.hero != null and not main.hero.alive
	if Input.is_action_just_pressed("inventory") and not fallen and not (main != null and (main._title != null or main._cards != null)) and not (_rb != null and _rb.typing()):
		toggle()
	if not visible:
		return
	_t += dt
	_dt = dt
	if RUNE_BAG.on:
		_rb.step(dt)
		_ms.step(dt)
	_note_t = maxf(0.0, _note_t - dt)
	if not _flash.is_empty():
		_flash["t"] += dt
		if _flash["t"] > 1.3:
			_flash = {}
	if not _result.is_empty():
		_result["t"] += dt
	queue_redraw()


## Opened or closed. It opens as the game's does (ui/inventory.ts resetInvUi): nothing in hand, nothing waiting; on GEAR,
## or, opened on a word just come by (loot.gd `offered`), on ATTACKS with that word in hand. A new player's first word is
## left on its tile, so that it is seen where it lies.
func toggle() -> void:
	visible = not visible
	get_tree().paused = visible
	_burn_now = false
	_word = ""
	_look = null
	_pending = {}
	_result = {}
	_note_t = 0.0
	_flash = {}
	_drag = {}
	_hover = {}
	_coached = false
	var on: String = loot.offered
	loot.offered = ""
	if visible:
		_page = "attacks" if on != "" or loot.first_word_waits() else "gear"
		if on != "" and int(loot.words.get(on, 0)) > 0 and not loot.first_word_waits():
			_word = on
	else:
		shop = ""
		altar = -1
		wsmith = ""
		svc = ""
		if _rb != null:
			_rb.closed()
			_ms.anim = {}
			_ms.parts = []
	mouse_filter = Control.MOUSE_FILTER_STOP if visible else Control.MOUSE_FILTER_IGNORE
	# (the HUD and the small map are not over the game's half while the panel is up: ui/inventory.ts, the game draws neither)
	if main != null:
		if visible:
			_hud_was = [main._hud.visible, main._mini.visible]
			main._hud.visible = false
			main._mini.visible = false
		elif not _hud_was.is_empty():
			main._hud.visible = _hud_was[0]
			main._mini.visible = _hud_was[1]
			_hud_was = []


## Opened on a move (the HUD: a press on its plate at the bottom of the screen): the ATTACKS page, that move read out.
## Opened on THE SKILL TREES' page (the HUD's NEW TALENT).
func open_talents() -> void:
	if not visible:
		toggle()
	if not loot.first_word_waits():
		_page = "talents"


func open_on(i: int) -> void:
	if not visible:
		toggle()
	_page = "attacks"
	_focus = clampi(i, 0, 2)


func _gui_input(ev: InputEvent) -> void:
	# (the screen's two halves changed round to the lay the panel is laid out in: _to_panel)
	var e := ev
	if ev is InputEventMouse:
		e = ev.duplicate()
		e.position = _to_panel(ev.position)
	if e is InputEventMouseMotion:
		_mouse = e.position
		_hover = {}
		if _rb != null and not _rb.ptr.is_empty():
			_rb.motion(e.position)
		for h in _hits:
			if _rb_on != "" and _rb.rect.has_point(e.position):
				break
			if h[0].has_point(e.position) and (h[1] == "worn" or h[1] == "bag" or h[1] == "buy" or h[1] == "buyback" or h[1] == "st_take"):
				_hover = {"item": h[3], "at": e.position}
		if not _drag.is_empty() and not _drag["moving"] and e.position.distance_to(_drag["at"]) > 5.0 * K:
			_begin_drag()
		for dd in [_shelf_drag, _piece_drag]:
			if not dd.is_empty() and not dd["moving"] and e.position.distance_to(dd["at"]) > 5.0 * K:
				dd["moving"] = true
	if e is InputEventMouseButton:
		_mouse = e.position
		if e.pressed and (e.button_index == MOUSE_BUTTON_WHEEL_UP or e.button_index == MOUSE_BUTTON_WHEEL_DOWN) and _rb_on != "" and _rb.rect.has_point(e.position):
			_rb.wheel(-1.0 if e.button_index == MOUSE_BUTTON_WHEEL_UP else 1.0)
			accept_event()
			return
		if e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
			_pressed(e.position)
			accept_event()
		elif e.pressed and e.button_index == MOUSE_BUTTON_RIGHT:
			# (the right button on a word that is set takes it straight back to his words)
			for c in _slots:
				if c["r"].has_point(e.position) and _set_in(c) != null:
					_unsocket(c["i"], c["side"], c["k"])
			# (THE WORDSMITH'S TRADE: on one of his words, it is bought at once, as everywhere: ui/trades.ts; THE STRANGER: on a kind
			# of piece, a throw at once; THE VENDOR: on a piece of his, bought at once; on a piece of the bag, sold at once)
			for h in _hits:
				if (h[1] == "buy" or h[1] == "buyback") and h[0].has_point(e.position):
					_press(h[1], h[2])
					_shelf_pick = []
				elif h[1] == "bag" and shop != "" and h[0].has_point(e.position) and _word == "" and _pending.is_empty():
					_press("bag", h[2])
				if h[1] == "ws_cell" and h[0].has_point(e.position):
					_ws_quick(h[2])
				elif h[1] == "gm_kind" and h[0].has_point(e.position):
					gm_pick = int(h[2])
					var why: String = loot.gamble_problem(gm_pick)
					_say(why if why != "" else loot.gamble(gm_pick))
			accept_event()
		elif not e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
			_released(e.position)
			accept_event()


# --- presses, the top-most first (ui/inventory.ts) ---

func _pressed(at: Vector2) -> void:
	for b in _card_buttons:
		if b[0].has_point(at):
			_press(b[1], null)
			return
	# (THE RUNE BAG: a press on it is its own)
	if _rb_on != "" and _rb.press(at):
		return
	if _done.has_point(at):
		_press("close", null)
		return
	for tb in _tabs:
		if tb["r"].has_point(at):
			_press("tab", tb["page"])
			return
	# (THE SKILL TREES' page: its card's buttons, then a stone, read)
	if _page == "talents":
		for b in _tal_buttons:
			if b[0].has_point(at):
				_tal_press(b[1], b[2])
				return
		var id: String = _tal.stone_at(at / K)
		if id != "":
			_tal.sel = id
			return
		_tal.sel = ""
		return
	for c in _pouch:
		if c["r"].has_point(at):
			# a word is pressed: it is in hand (to be read), and may be dragged from here
			var was: bool = _word == c["w"] and _pending.is_empty()
			_press("word", c["w"])
			_drag = {"word": c["w"], "from": null, "at": at, "moving": false, "was": was}
			return
	for c in _slots:
		if c["r"].has_point(at):
			var there = _set_in(c)
			if _word != "" or there == null:
				_press("slot", [c["i"], c["side"], c["k"]])
			else:
				# a word that is set: pressing it reads it, dragging it lifts it out, a second press takes it back
				var again: bool = _look != null and _look == [c["i"], c["side"], c["k"]]
				_press("slot", [c["i"], c["side"], c["k"]])
				_drag = {"word": there, "from": [c["i"], c["side"], c["k"]], "at": at, "moving": false, "was": again}
			return
	for i in _plates.size():
		if _plates[i] != null and _plates[i].has_point(at):
			_press("plate", i)
			return
	for h in _hits:
		if h[0].has_point(at):
			# (THE VENDOR'S HALF: a piece of his pressed is picked, and may be carried across; pressed again, it is bought)
			if h[1] == "buy" or h[1] == "buyback":
				if _shelf_pick == [h[1], h[2]]:
					_press(h[1], h[2])
					_shelf_pick = []
				else:
					_shelf_pick = [h[1], h[2]]
					_shelf_drag = {"what": [h[1], h[2]], "at": at, "moving": false}
				return
			# (and a piece of the bag pressed there may be carried across to him, or sold where it is let go)
			if h[1] == "bag" and shop != "" and _word == "" and _pending.is_empty() and not loot.first_word_waits():
				_piece_drag = {"i": h[2], "at": at, "moving": false}
				return
			_press(h[1], h[2])
			return
	_shelf_pick = []
	# a press on nothing: whatever was in hand is put down
	_word = ""
	_look = null
	_pending = {}
	_result = {}
	_burn_now = false


func _released(at: Vector2) -> void:
	if _rb != null and not _rb.ptr.is_empty():
		_rb.release(at)
		return
	var W := _hw()
	if not _shelf_drag.is_empty():
		var d := _shelf_drag
		_shelf_drag = {}
		# (carried across to the panel and let go there: bought)
		if d["moving"] and at.x < W:
			_press(d["what"][0], d["what"][1])
			_shelf_pick = []
	if not _piece_drag.is_empty():
		var d := _piece_drag
		_piece_drag = {}
		# (pressed and let go where it lies, as before; or carried over to the vendor's half and let go there: sold)
		if not d["moving"] or at.x >= W:
			_press("bag", d["i"])
	if _drag.is_empty():
		return
	var d := _drag
	_drag = {}
	if d["moving"]:
		var to := _target_at(at)
		if not to.is_empty() and _word == d["word"]:
			_drop(d["word"], to)
	elif d["from"] != null:
		# pressed and let go without carrying it anywhere: a second press on a set word takes it out
		if d["was"]:
			_unsocket(d["from"][0], d["from"][1], d["from"][2])
	elif d["was"]:
		# a second press on the word in hand puts it down
		_word = ""


## The word set in a slot as it stands now (a slot laid out a moment ago may have been filled or emptied since), or null.
func _set_in(c: Dictionary):
	var g: Array = hero.loadout.slots(c["i"], c["side"])
	return g[c["k"]] if c["k"] < g.size() else null


## A press that has become a drag: a word that is set leaves its slot (it is one of his words again, and in hand).
func _begin_drag() -> void:
	_drag["moving"] = true
	if _drag["from"] != null:
		var f: Array = _drag["from"]
		_drag["from"] = null
		if _unsocket(f[0], f[1], f[2]):
			_word = _drag["word"]
		else:
			_drag = {}


## What the pointer is over that a word could go to: an exact slot of a move, or a piece of gear.
func _target_at(at: Vector2) -> Dictionary:
	if altar >= 0 and at.x >= _hw():
		return {"kind": "altar", "r": Rect2(_hw(), 0, _hw(), _vh())}
	# (THE SHAFT'S RIM'S GATE: anywhere over its half, the next free socket)
	if svc == "gate" and at.x >= _hw():
		return {"kind": "gate", "r": Rect2(_hw(), 0, _hw(), _vh())}
	# (WORDMELDING: over the wordsmith's half, melding: the next free hollow)
	if wsmith == "meld" and at.x >= _hw():
		var nx: int = meld_in.find(null)
		return {"kind": "meld", "r": _ws_hollows()[nx] if nx >= 0 else Rect2(_hw(), 0, _hw(), _vh())}
	# (THE WORDSMITH'S TRADE: over his half, a spare word is sold him: where the next he is sold will lie)
	if wsmith == "trade" and at.x >= _hw():
		return {"kind": "sell", "r": _ws_next_sold()}
	for c in _slots:
		if c["r"].grow_individual(2.0 * K, 3.0 * K, 2.0 * K, 3.0 * K).has_point(at):
			return {"kind": "slot", "i": c["i"], "side": c["side"], "k": c["k"], "r": c["r"]}
	for c in _cells:
		if c["item"] != null and c["r"].grow(K).has_point(at):
			return {"kind": "piece", "where": c["where"], "r": c["r"]}
	return {}


## One thing pressed. (The checks press these by name; "front", "behind" and "burn" are the two boxes and the button this
## screen had before its pages: Strike's first slot of that side with the first word he holds, and that word burned
## unasked into the next piece pressed.)
func _press(action: String, arg) -> void:
	match action:
		"change":
			hero.change_move(int(arg))
		"tab":
			if arg != _page:
				if loot.first_word_waits() and arg != "attacks":
					_say("Your first word goes on an attack")
				else:
					# (a word in hand is carried to the new page; whatever was being read is put down)
					_page = arg
					_look = null
					_pending = {}
					_result = {}
		"word":
			_word = arg
			_pending = {}
			_look = null
			_result = {}
		"slot":
			_focus = arg[0]
			var held = hero.loadout.slots(arg[0], arg[1])[arg[2]]
			if _word != "":
				_drop(_word, {"kind": "slot", "i": arg[0], "side": arg[1], "k": arg[2]})
			elif held != null:
				_pending = {}
				_result = {}
				_look = arg
			else:
				_look = null
				_say("Pick a word first, or drag it here" if loot.spare() > 0 else "No spare words")
		"plate":
			# a move is pressed: it is the one read out (a word in hand stays in hand)
			_focus = arg
			_look = null
			_result = {}
		"worn", "bag":
			var where = arg
			# (BINDING: the second piece, pressed while the question waits for it: ui/inventory.ts)
			if not _pending.is_empty() and _pending["word"] == "binding" and loot.piece(where) != null and not (typeof(where) == typeof(_pending["where"]) and where == _pending["where"]):
				var why: String = loot.bind_problem(_pending["where"], where)
				if why != "":
					_say(why)
				else:
					_pending["with"] = where
				return
			if _word != "" and loot.piece(where) != null:
				# a word is in hand: it is burned into this piece (asked first)
				if _burn_now:
					_say(loot.burn(_word, where))
					_burned()
				else:
					_drop(_word, {"kind": "piece", "where": where})
			elif loot.first_word_waits():
				# (a new player's first word is waiting: everything but the word and the attacks stands back)
				pass
			elif action == "worn":
				loot.unequip(arg)
			elif shop != "":
				loot.sell(arg)
			elif svc == "stash":
				# (THE STASH: a piece of the bag put away: game.ts stashItem)
				_say(loot.stash_item(int(arg)))
			else:
				loot.equip_from_bag(arg)
		"collar":
			# (THE PACK COLLAR: its companion picked, in town; out of town a tap says so: companions.gd pick_collar)
			var why: String = main._companions.pick_collar(str(arg))
			if why != "":
				_say(why)
			queue_redraw()
		"yes":
			# yes: the word is burned into the piece; (SPLITTING AND BINDING) the piece split in two, or the second bound into it
			if not _pending.is_empty():
				var p := _pending
				if p["word"] == "binding" and not p.has("with"):
					return
				_pending = {}
				_word = ""
				if p["word"] == "splitting":
					_say(loot.split_piece(p["where"]))
				elif p["word"] == "binding":
					_say(loot.bind_pieces(p["where"], p["with"]))
				else:
					_say(loot.burn(p["word"], p["where"]))
				_burned()
		"no":
			_pending = {}
		"buy":
			loot.buy(shop, arg)
		"buyback":
			_say(loot.buy_back(arg))
		"lex":
			_lex = not _lex
			if RUNE_BAG.on:
				if _lex:
					_rb.opened()
				else:
					_rb.closed()
		"ms_take":
			_ms.take()
		"swap":
			_all = not _all
		"shelf_take":
			if not _shelf_pick.is_empty():
				_press(_shelf_pick[0], _shelf_pick[1])
				_shelf_pick = []
		"attr":
			loot.choose_attr(arg)
		"front", "behind":
			var g: Array = hero.loadout.slots(0, action)
			if g.is_empty():
				_say("No socket there")
			elif g[0] != null:
				_unsocket(0, action, 0)
			elif loot.spare() > 0:
				_drop(loot.first_spare(), {"kind": "slot", "i": 0, "side": action, "k": 0})
		"burn":
			_word = loot.first_spare()
			_burn_now = _word != ""
		"close":
			toggle()
		"altar_put", "altar_take", "altar_open":
			_altar_press(action, arg)
		"gate_put", "gate_take", "gate_enter":
			_gate_press(action, arg)
		"ws_tab", "ws_hollow", "ws_meld", "ws_to_meld", "ws_cell", "ws_buy", "ws_sell":
			_ws_press(action, arg)
		"gm_kind", "gm_throw", "st_take", "lx_tab", "lx_word", "lx_kept", "lx_take", "lx_keep", "svc_swap":
			_svc_press(action, arg)
	_hover = {}


## THE SKILL TREES: a talent taken with a point (game.ts takeTalent), undone in town for gold (unlearnTalent), its pick of two
## made (choosePick); a press elsewhere on its card is the card's.
func _tal_press(action: String, arg) -> void:
	match action:
		"tal_take":
			var why := Talents.take_problem(hero.cls, loot.talent_level(), hero.talents, arg)
			if why != "":
				_say(why)
				return
			# (THE WARRIOR'S WEAPON, FREE: another taken in the one's place he had)
			var out := Talents.swap_out(hero.cls, hero.talents, arg)
			if out != "":
				hero.talents.erase(out)
			hero.talents.append(arg)
			hero.talents_changed()
			# (the game waits under the page: his picture made again at once, the new weapon in his hands beside it)
			if out != "" and hero.has_method("_show"):
				hero._show()
			_tal.flash = {"id": arg, "t": 0.0}
			if loot.sfx != null:
				loot.sfx.play("equip")
		"tal_undo":
			var why := Talents.unlearn_problem(hero.cls, hero.talents, arg)
			if why == "" and not main.is_home(main.place):
				why = "Undone in town only"
			if why == "" and loot.gold < Talents.unlearn_price(loot.level):
				why = "Needs %d gold" % Talents.unlearn_price(loot.level)
			if why != "":
				_say(why)
				return
			loot.gold -= Talents.unlearn_price(loot.level)
			hero.talents.erase(arg)
			var d := Talents.of(hero.cls, arg)
			if d.get("pick") != null and d["pick"].get("lock", false):
				hero.picks.erase(arg)
			hero.talents_changed()
			if loot.sfx != null:
				loot.sfx.play("gold")
		"tal_pet":
			# (THE RANGER'S COMPANIONS: in town, one of its three picked; out of town a tap says where: companions.gd)
			var why: String = main._companions.pick(str(arg)) if main != null and main.get("_companions") != null else ""
			if why != "":
				_say(why)
			queue_redraw()
		"tal_pick":
			var d := Talents.of(hero.cls, _tal.sel)
			if d.get("pick") != null and d["pick"].get("lock", false) and hero.picks.has(_tal.sel):
				_say("Unlearn to change")
				return
			hero.picks[_tal.sel] = arg
			hero.talents_changed()
			_tal.flash = {"id": _tal.sel, "t": 0.0}
			if loot.sfx != null:
				loot.sfx.play("equip")


func _say(why: String) -> void:
	if why != "":
		_note = why
		_note_t = 2.4


## What a word has just become on a piece is read on the card (ui/inventory.ts `result`).
func _burned() -> void:
	_burn_now = false
	_word = ""
	if not loot.burned.is_empty():
		_result = loot.burned.duplicate()
		_result["t"] = 0.0
		loot.burned = {}


# --- a word on a move (game.ts placeProblem, placeWord, unsocket) ---

## Why that word cannot be set into that exact slot, or "" if it can: what the side would refuse with the word that is
## there now gone back to his words (words.gd socket_problem, the rule loadout.gd problem asks).
func place_problem(i: int, side: String, k: int, w: String) -> String:
	var g: Array = hero.loadout.slots(i, side)
	if k < 0 or k >= g.size():
		return "No socket there"
	if int(loot.words.get(w, 0)) <= 0:
		return "No spare word"
	if g[k] == w:
		return "Already there"
	if g[k] == null:
		return hero.loadout.problem(i, side, w)
	var after: Array = g.duplicate()
	after[k] = null
	return Words.socket_problem(after, w)


## Set a word he holds into a slot of a move: the word that was there goes back to his words. "" if it went in, else why
## not (nothing changed). INTO THAT EXACT SLOT (game.ts placeWord): loadout.gd `put` sets a word into the first empty slot
## of the side, which is the slot pressed wherever a side has one slot (every level under 15) or its earlier slot is full;
## where it is not (a side of two, the first empty, the word pressed onto the second) the slot is written here, and he is
## made up anew as the game's placeWord does (refresh: loot.gd derive), his moves with him.
func place(i: int, side: String, k: int, w: String) -> String:
	var why := place_problem(i, side, k, w)
	if why != "":
		return why
	var first: bool = loot.lesson()
	var g: Array = hero.loadout.slots(i, side)
	var back = g[k]
	if back != null:
		hero.loadout.take(i, side, k)
	if g.find(null) == k:
		why = hero.loadout.put(i, side, w)
		if why != "":
			if back != null:
				hero.loadout.put(i, side, back)
			return why
	else:
		g[k] = w
		loot.derive()
	loot.words[w] = int(loot.words[w]) - 1
	if back != null:
		loot.words[back] = int(loot.words.get(back, 0)) + 1
	loot.sfx.play("word")
	# (the prompt follows the word: the move it was last set on is the one to try. A new player's first word is on: the end
	# of the lesson, and the guide shows for a while what it does: guide.gd)
	if main != null:
		main.guide.at = i
		if first:
			_coached = true
			main.word_placed()
	loot.taught = true
	return ""


## Take a word back out of a move: it is one of his words again. True if there was one.
func _unsocket(i: int, side: String, k: int) -> bool:
	var w: String = hero.loadout.take(i, side, k)
	if w == "":
		_say("Nothing there")
		return false
	loot.words[w] = int(loot.words.get(w, 0)) + 1
	loot.sfx.play("equip", -4.0)
	_look = null
	return true


## The word has been let go over a place. On a move it is set at once (it can be taken out again); gear asks first.
func _drop(w: String, to: Dictionary) -> void:
	_result = {}
	_look = null
	if to["kind"] == "altar":
		var why: String = altar_holds.lay(altar, w)
		if why != "":
			_say(why)
		else:
			_word = ""
		return
	if to["kind"] == "gate":
		var why: String = main.plan_word(w)
		if why != "":
			_say(why)
		else:
			_word = ""
		return
	if to["kind"] == "meld":
		var why := _ws_lay(w)
		if why != "":
			_say(why)
		else:
			_word = ""
		return
	if to["kind"] == "sell":
		var why: String = loot.sell_word(w)
		_say(why)
		if why == "":
			_word = ""
		return
	if to["kind"] == "slot":
		var why := place(to["i"], to["side"], to["k"], w)
		if why != "":
			_say(why)
			return
		_word = ""
		_focus = to["i"]
		_flash = {"skill": to["i"], "t": 0.0, "word": w}
		return
	var bad: String = loot.burn_problem(w, to["where"])
	if bad != "":
		_say(bad)
		return
	_pending = {"word": w, "where": to["where"]}


# --- where things are (ui/inventory.ts, the same sums at twice the size) ---

func _lay() -> void:
	var W := _hw()
	var H := _vh()
	var body_w := W - 2.0 * M
	var top := 2.0 * K
	_page_y = top + HEAD + 2.0 * K
	# the bottom that never changes: his words in a line or two (more where the panel is tall enough to leave the page the
	# room it likes), and the bag
	var bag_rows := ceili(float(loot.BAG) / BAG_COLS)
	var bag_h := bag_rows * PITCH - 2.0 * K
	var fixed := 2.0 * K + HEAD + 2.0 * K + 3.0 * K + CAP + 3.0 * K + CAP + bag_h + 2.0 * K
	var room := clampi(floori((H - fixed - PAGE_ROOM + 2.0 * K) / LINE), 1, 3)
	var strip_h := CAP + (room * LINE - 2.0 * K) + 3.0 * K + CAP + bag_h + 2.0 * K
	_strip_y = H - strip_h
	_pouch_y = _strip_y + CAP
	_bag_y = _pouch_y + (room * LINE - 2.0 * K) + 3.0 * K + CAP
	_page_h = _strip_y - 3.0 * K - _page_y
	# (THE SKILL TREES' page: no bag at its foot, nor his words; the tree has the panel down to its bottom: ui/inventory.ts `bare`,
	# his words of 31 Oct 2026, "The bag covers the tree")
	if _page == "talents":
		_strip_y = H
		_page_h = H - M - _page_y
	# the names of the pages, and DONE
	_tabs = []
	var x := M
	# (as much air round each name as the panel leaves once DONE has its room: ui/inventory.ts)
	var names := 0.0
	for pg in PAGES:
		names += _width(PAGE_LABEL[pg], NORMAL)
	var pad := clampf(floorf((body_w - 44.0 * K - 6.0 * K - names - 2.0 * K * (PAGES.size() - 1)) / (PAGES.size() * K)), 4.0, 10.0) * K
	for pg in PAGES:
		var w := _width(PAGE_LABEL[pg], NORMAL) + pad
		_tabs.append({"r": Rect2(x, top + K, w, HEAD - 3.0 * K), "page": pg})
		x += w + 2.0 * K
	_done = Rect2(W - M - 44.0 * K, top + K, 44.0 * K, HEAD - 3.0 * K)
	# (WORD_ROOM: at a service, the tile at the end of the words' first line that turns the bottom from the bag to every word and
	# back; WORD_LEX: elsewhere, LEXICON beside the bag, every word in a panel of its own over the game's half)
	var service := shop != "" or altar >= 0 or wsmith != "" or svc != ""
	if not service:
		_all = false
	_swap_r = Rect2(M + body_w - SWAP_W * K, _pouch_y, SWAP_W * K, TH) if service and _page != "talents" else Rect2()
	_lex_r = Rect2()
	var ix := M + BAG_COLS * PITCH - 2.0 * K + 8.0 * K
	if not service and _page != "talents" and W - M - ix >= 30.0 * K:
		_lex_r = Rect2(ix, _bag_y + bag_h - 15.0 * K, minf(W - M - ix, 64.0 * K), 15.0 * K)
	if _all:
		# (every word, in the room the words' line and the bag both take; the bag not there)
		room = maxi(room, floori((strip_h - CAP - 2.0 * K + 2.0 * K) / LINE))
	var line_w := body_w - (SWAP_W * K + GAP if _swap_r.has_area() else 0.0)
	# his words: tiles in lines; without their rune stones if they do not go in so, then as their rune stones alone
	_pouch = []
	var held: Array = loot.held()
	var how := 0
	var lines := 99
	while how < 3:
		_pouch = []
		var px := 0.0
		var line := 0
		for w in held:
			var tw: float = CELL if how == 2 else minf(line_w, _tile_w(w, "name", int(loot.words[w]), how == 1))
			if px > 0.0 and px + tw > line_w:
				px = 0.0
				line += 1
			_pouch.append({"r": Rect2(M + px, _pouch_y + line * LINE, tw, TH), "w": w, "bare": how == 1, "stone": how == 2, "line": line})
			px += tw + GAP
		lines = line + 1
		if lines <= room:
			break
		how += 1
	_pouch = _pouch.filter(func(c): return c["line"] < room)
	if _page == "talents":
		_pouch = []
	# (WORD_LEX, open: every word as its rune stone, in lines over the game's half at its foot, on a panel of its own: ui/inventory.ts
	# halfRoom, layPouch with `runes`; laid in the other half's lay, from W)
	_lex_panel = Rect2()
	if _lex and _lex_r.has_area() and _page != "talents" and not RUNE_BAG.on:
		var half_w := W - 2.0 * 6.0 * K
		var half_lines := maxi(1, floori((H - 2.0 * 6.0 * K - CAP - 4.0 * K + 2.0 * K) / LINE))
		var cells: Array = []
		var px := 0.0
		var line := 0
		for w in held:
			if px > 0.0 and px + CELL > half_w:
				px = 0.0
				line += 1
			cells.append([w, px, line])
			px += CELL + GAP
		cells = cells.filter(func(c): return c[2] < half_lines)
		var used: int = (int(cells[-1][2]) + 1) if not cells.is_empty() else 1
		var pouch_h: float = used * LINE - 2.0 * K
		_lex_panel = Rect2(W + (6.0 - 4.0) * K, H - 6.0 * K - pouch_h - CAP - 8.0 * K, half_w + 8.0 * K, pouch_h + CAP + 10.0 * K)
		var py := _lex_panel.position.y + 4.0 * K + CAP
		for c in cells:
			_pouch.append({"r": Rect2(_lex_panel.position.x + 4.0 * K + c[1], py + c[2] * LINE, CELL, TH), "w": c[0], "bare": false, "stone": true, "line": c[2], "lex": true})
	# the ATTACKS page: each move a line, laid out as it reads
	_slots = []
	_plates = [null, null, null]
	_nums = []
	_caps = []
	_rows_end = _page_y
	if _page == "attacks":
		var most: Array = Words.socket_count(999)
		var max_f := int(most[0])
		var max_b := int(most[1])
		var name_w := 0.0
		for i in 3:
			max_f = maxi(max_f, hero.loadout.front[i].size())
			max_b = maxi(max_b, hero.loadout.behind[i].size())
			name_w = maxf(name_w, _width(_skill(i)["name"].to_upper(), NORMAL))
		var AW := maxf(66.0 * K, 22.0 * K + name_w + 4.0 * K)
		var SQ := CELL + 2.0 * K
		var NUMW := 40.0 * K
		var front_w := max_f * SQ
		var behind_w := max_b * SQ
		var row_w := front_w + AW + GAP + behind_w - 2.0 * K
		var with_nums := row_w + 6.0 * K + NUMW <= body_w
		var x0 := M + maxf(0.0, floorf((body_w - row_w - (6.0 * K + NUMW if with_nums else 0.0)) / 2.0))
		var row_h := TH + 3.0 * K
		for s in 3:
			var y := _page_y + CAP + s * row_h
			if Words.move_open(s, loot.level):
				# (they stand in the order the name is read in: in front the first word furthest from the move; a slot not open
				# yet is not shown at all)
				var nf: int = hero.loadout.front[s].size()
				for j in max_f:
					var idx := j - (max_f - nf)
					if idx >= 0:
						_slots.append({"r": Rect2(x0 + j * SQ, y, CELL, CELL), "i": s, "side": "front", "k": idx, "word": hero.loadout.front[s][idx]})
				for j in hero.loadout.behind[s].size():
					_slots.append({"r": Rect2(x0 + front_w + AW + GAP + j * SQ, y, CELL, CELL), "i": s, "side": "behind", "k": j, "word": hero.loadout.behind[s][j]})
				_plates[s] = Rect2(x0 + front_w, y, AW, TH)
			_nums.append(Vector2(x0 + row_w + 6.0 * K, y) if with_nums else null)
		_caps.append(["IN FRONT", x0 + front_w - 2.0 * K, true])
		_caps.append(["BEHIND", x0 + front_w + AW + GAP, false])
		if with_nums:
			_caps.append(["A HIT", x0 + row_w + 6.0 * K, false])
		_rows_end = _page_y + CAP + 2.0 * row_h + TH
	# his gear: what he wears, on the GEAR page; and, on every page, the bag
	_cells = []
	if _page == "gear":
		# (the hero between two columns of slots, the rows as far apart as the page allows: ui/inventory.ts dollAt)
		_doll_pitch = clampf(floorf((_page_h - CELL) / ((DOLL_ROWS - 1) * K)) * K, CELL, PITCH)
		_doll_h = (DOLL_ROWS - 1) * _doll_pitch + CELL
		_doll_y = _page_y + maxf(0.0, floorf((_page_h - _doll_h) / (2.0 * K)) * K)
		for slot in loot.EQUIP:
			var cr: Array = DOLL_SLOT[slot]
			_cells.append({"r": Rect2(M + int(cr[0]) * (DOLL_W * K - CELL), _doll_y + int(cr[1]) * _doll_pitch, CELL, CELL), "where": slot, "item": loot.gear[slot], "worn": true})
	for i in (0 if _page == "talents" or _all else loot.BAG):
		_cells.append({"r": Rect2(M + (i % BAG_COLS) * PITCH, _bag_y + floorf(float(i) / BAG_COLS) * PITCH, CELL, CELL), "where": i, "item": loot.bag[i] if i < loot.bag.size() else null, "worn": false})
	# what the word in hand hangs over: under the pointer
	_over = _target_at(_mouse) if _word != "" and _pending.is_empty() else {}


func _skill(i: int) -> Dictionary:
	return Words.skill(hero.loadout.id(i))


# --- the screen ---

func _draw() -> void:
	_hits = []
	_card_buttons = []
	_lay()
	var W := _hw()
	var blink := sin(_t * 7.0) > 0.0
	# (THE VIEW: with the panel up and no service beside it, the game is seen with the hero in the middle of the half it has
	# (main.ts renderer.view, gameRect); beside a service the picture stays where it was)
	if hero != null and hero._cam != null and shop == "" and altar < 0 and wsmith == "" and svc == "":
		if _tall():
			hero._cam.offset = Vector2(0.0, -24.0 + _ph() / 2.0 / maxf(0.01, hero._cam.zoom.y))
		else:
			hero._cam.offset.x = W / 2.0 / maxf(0.01, hero._cam.zoom.x)
	# (THE PANEL, on the right half: ui/inventory.ts invRect; laid out from 0 and drawn moved over: _half)
	_half(1)
	# (A PHONE'S NOTCH AND CORNERS: the screen within the safe part of it, main.gd place_safe; the panel's grounds carried out
	# under them to the screen's edges, on its own sides: sideways, not the game's half's)
	var gl := offset_left if _tall() else 0.0
	var gt := 0.0 if _tall() else offset_top
	var gr := -offset_right
	var gb := -offset_bottom
	draw_rect(Rect2(-gl, -gt, W + gl + gr, _vh() + gt + gb), PANEL)
	var first: bool = loot.first_word_waits()
	_rb_on = ""
	if RUNE_BAG.on and wsmith == "meld":
		# (THE RUNE BAG beside the melding stone, on this panel's half)
		_rb_on = "panel"
		_rb.draw(Rect2(0, 0, W, _vh()), true)
		_half(1)
	else:
		# (the bottom that never changes stands on a ground of its own; not on THE SKILL TREES' page)
		if _page != "talents":
			draw_rect(Rect2(-gl, _strip_y - 3.0 * K, W + gl + gr, _vh() - _strip_y + 3.0 * K + gb), BOX)
			draw_rect(Rect2(-gl, _strip_y - 3.0 * K, W + gl + gr, 1), EDGE)
		# (its edge against the game: a line, and a hair of light along it)
		draw_rect(Rect2(0, -gt, K, _vh() + gt + gb), EDGE_HI)
		draw_rect(Rect2(0, -gt, 1, _vh() + gt + gb), PICK_LO)
		for tb in _tabs:
			var on: bool = tb["page"] == _page
			var off: bool = first and tb["page"] != "attacks"
			var r: Rect2 = tb["r"]
			var hot: bool = not off and not on and r.has_point(_mouse)
			_gbox(r, HOT if on else (BG2 if hot else BOX), PICK if on else (EDGE_HI if hot else EDGE))
			_mid(r, PAGE_LABEL[tb["page"]], NORMAL, FAINT if off else (PICK if on else TEXT))
		# (pink is the one thing to press: DONE)
		_gbutton(_done, "DONE", true, (_coached and blink) or _done.has_point(_mouse))
		_tal_buttons = []
		if _page == "attacks":
			_draw_attacks(blink, first)
		elif _page == "talents":
			_tal.lay_out(hero.cls, Rect2(M / K, _page_y / K, (W - 2.0 * M) / K, _page_h / K))
			_tal.draw(hero, loot.talent_level(), _t, _dt)
		elif _page == "stats":
			_draw_stats(Rect2(M, _page_y, W - 2.0 * M, _page_h))
		else:
			_draw_gear()
		if _page != "talents":
			_draw_bag(blink, first)
			_draw_words(first)
		if _note_t > 0.0:
			var nw := minf(W - 8.0, _width(_note, NORMAL) + 16.0)
			var nr := Rect2(floorf((W - nw) / 2.0), _strip_y - 16.0 * K, nw, 11.0 * K)
			draw_rect(nr, Color.BLACK)
			_mid(nr, _note, NORMAL, BAD)
	# (THE SERVICES, on the left half: ui/inventory.ts gameRect; laid out from W)
	_half(-1)
	# (UPRIGHT: the part above the panel is a game pixel or so taller than a half is laid out: a service's ground reaches down to it)
	if _tall() and (shop != "" or altar >= 0 or wsmith != "" or svc != ""):
		draw_rect(Rect2(W, _vh() - 2.0 * K, W, size.y - _ph() - _vh() + 2.0 * K), PANEL)
	if shop != "":
		_shelf()
	if altar >= 0:
		_altar_side(blink)
	if wsmith != "":
		_ws_side(blink)
	if svc != "":
		_svc_side(blink)
	# (WORD_LEX: his lexicon open, every word on a panel of its own over the game's half)
	if _lex_panel.has_area():
		_draw_lex()
	# (THE RUNE BAG over the game's half: RUNES pressed, away from the services)
	if RUNE_BAG.on and _lex and _lex_r.has_area() and _page != "talents" and _rb_on == "":
		_rb_on = "game"
		_rb.draw(Rect2(W, 0, W, _vh()), false)
		_half(-1)
	elif RUNE_BAG.on and _rb_on == "":
		_rb.closed()
	# (what is read, on a card over the game's half against the panel's edge; with the bag over it or the stone there, only a
	# question waiting or what came of it)
	if _rb_on == "" or not _pending.is_empty() or not _result.is_empty():
		_draw_reading(blink, first)
	# (THE SKILL TREES: the card of the talent being read, over the game's half)
	if _page == "talents":
		_tal_buttons = _tal.draw_card(hero, loot.talent_level(), loot.gold, main.is_home(main.place), W / K, _vh() / K, loot.level)
	_half(0)
	_draw_flash()
	# the word being dragged follows the pointer (over a slot it may go in it is shown sitting there)
	if not _drag.is_empty() and _drag["moving"] and _word != "":
		var fits: bool = not _over.is_empty() and _over["kind"] == "slot" and place_problem(_over["i"], _over["side"], _over["k"], _word) == ""
		if not fits:
			var form: String = _over["side"] if not _over.is_empty() and _over["kind"] == "slot" else "name"
			var tw := _tile_w(_word, form)
			var m := _to_screen(_mouse)
			_tile(Rect2(roundf(m.x - tw / 2.0), roundf(m.y - TH - 4.0 * K), tw, TH), _word, form, {"lit": true, "edge": PICK})
	# a piece carried across to or from the vendor follows the pointer
	var carried = null
	if not _shelf_drag.is_empty() and _shelf_drag["moving"]:
		var items: Array = loot.shops.get(shop, []) if _shelf_drag["what"][0] == "buy" else loot.sold
		carried = items[_shelf_drag["what"][1]] if _shelf_drag["what"][1] < items.size() else null
	elif not _piece_drag.is_empty() and _piece_drag["moving"] and int(_piece_drag["i"]) < loot.bag.size():
		carried = loot.bag[int(_piece_drag["i"])]
	if carried != null:
		var m := _to_screen(_mouse)
		_icon_at(carried["icon"], Rect2(m - Vector2(CELL, CELL) / 2.0, Vector2(CELL, CELL)))
	# the card of the piece pointed at
	elif not _hover.is_empty() and _hover["item"] != null and _word == "" and _pending.is_empty():
		_card(_hover["item"], _to_screen(_hover["at"]))


# --- the ATTACKS page ---

func _draw_attacks(blink: bool, first: bool) -> void:
	for c in _caps:
		_small(Vector2(c[1], _page_y), c[0], DIM, c[2])
	for s in 3:
		if _plates[s] == null:
			continue
		var a: Rect2 = _plates[s]
		var def := _skill(s)
		var r: Dictionary = hero.loadout.r(s)
		_gbox(a, HOT if _focus == s else BOX, PICK if _focus == s else EDGE)
		_hud_pic("ability:" + str(def["icon"]), Rect2(a.position + Vector2(2.0 * K, 2.0 * K), Vector2(16.0 * K, 16.0 * K)))
		_top(a.position + Vector2(22.0 * K, 3.0 * K), str(def["name"]).to_upper(), NORMAL, Color.WHITE)
		# (what makes it: with a controller its buttons, ui/inventory.ts `how`)
		_top(a.position + Vector2(22.0 * K, 12.0 * K), ["RT", "LT", "A"][s] if main != null and main.pad_live else (["TAP", "HOLD", "SWIPE"][s] if main != null and main._touch != null and main._touch.on else HOW[s]), SMALL, DIM)
		# its numbers: one hit, and how often
		if _nums[s] != null:
			var at: Vector2 = _nums[s]
			var hit := hit_range(s)
			var ramp = _hud["element_ramp"].get(r["element"]) if r["element"] != "phys" else null
			_top(at + Vector2(0, 3.0 * K), ("%d" % hit[0]) if hit[0] == hit[1] else ("%d-%d" % hit), NORMAL, Color(ramp[3]) if ramp != null else Color.WHITE)
			_top(at + Vector2(0, 12.0 * K), _pace(s)[0], SMALL, DIM)
	for c in _slots:
		var r: Rect2 = c["r"]
		var ok: bool = _word != "" and place_problem(c["i"], c["side"], c["k"], _word) == ""
		var hot: bool = r.has_point(_mouse)
		var over: bool = not _over.is_empty() and _over["kind"] == "slot" and _over["i"] == c["i"] and _over["side"] == c["side"] and _over["k"] == c["k"]
		if ok and over:
			# the word in hand, held over a slot it may go in: it is shown sitting there
			_tile(r, _word, c["side"], {"lit": true, "edge": Color.WHITE, "stone": true})
		elif c["word"] != null:
			var looked: bool = _look != null and _look == [c["i"], c["side"], c["k"]]
			# (a word in hand could take this one's place: its edge says so)
			var opts := {"lit": looked or hot, "stone": true}
			if ok:
				opts["edge"] = PICK if blink else PICK_LO
			elif looked:
				opts["edge"] = PICK
			_tile(r, c["word"], c["side"], opts)
		else:
			# an empty slot: a dark notch with a plus in the middle, lit while the word in hand could go in
			var wanted: bool = first and c["i"] == 0 and c["side"] == "front" and c["k"] == 0
			_gbox(r, (PICK_BG if blink else Color(0.06, 0.21, 0.33)) if ok else INK, ((PICK if blink else PICK_LO) if ok else (DIM if wanted or hot else EDGE)))
			var mid := r.position + (r.size / 2.0).floor()
			var plus: Color = PICK if ok else EDGE
			draw_rect(Rect2(mid.x - 3.0 * K, mid.y - K / 2.0, 7.0 * K, K), plus)
			draw_rect(Rect2(mid.x - K / 2.0, mid.y - 3.0 * K, K, 7.0 * K), plus)
	# under the three lines: the coach's line (a new player's first word); and, with nothing else being read, the move
	# last touched read out, as much of it as there is room for
	var x := M
	var w := _hw() - 2.0 * M
	var y := _rows_end + 4.0 * K
	var end := _page_y + _page_h
	var coach := _coach()
	if coach != "":
		for row in _wrap(coach, w, NORMAL).slice(0, 2):
			_top(Vector2(x + floorf((w - _width(row, NORMAL)) / 2.0), y), row, NORMAL, PICK)
			y += 9.0 * K
		y += K
	if first or _reading() != "":
		return
	var which := clampi(_focus, 0, 2)
	if not Words.move_open(which, loot.level):
		return
	var move: Dictionary = hero.loadout.r(which)
	for ln in _name_lines(_name_parts(which, hero.loadout.front[which], hero.loadout.behind[which]), w, NORMAL):
		if y + 8.0 * K <= end:
			_draw_name(ln, x, y, NORMAL)
		y += 10.0 * K
	var hits := hit_range(which)
	var el: String = "" if move["element"] == "phys" else str(move["element"]) + " "
	var pace: String = _pace(which)[1]
	var rows: Array = [["%s %sdamage a hit%s." % [("%d" % hits[0]) if hits[0] == hits[1] else ("%d to %d" % hits), el, (", " + pace) if pace != "" else ""], Color.WHITE]]
	for i in move["lines"].size():
		rows.append([move["lines"][i], DIM if i == 0 else TEXT])
	# (THE MAGE'S AND THE RANGER'S MOVES TO LEARN, game/swap_moves.ts: the move in this place changed to the next it could be, at the
	# foot of what is read; hers, “She sets tap and hold (Recommended)”; his hold, Snipe or Rally where he has both: ui/inventory.ts)
	var choices: Array = hero.move_choices(which)
	var bh := 14.0 * K / 2.0 + 8.0
	if choices.size() > 1:
		var nxt: String = choices[(choices.find(hero.loadout.id(which)) + 1) % choices.size()]
		var label := "CHANGE TO %s" % str(Words.skill(nxt)["name"]).to_upper()
		var bw := _width(label, 10) + 14.0
		_button(Rect2(x + w - bw, end - bh, bw, bh), label, "change", which, PICK)
		end -= bh + 2.0
	# (a sentence is written whole or not at all: one that stops half way reads as a fault)
	for row in rows:
		var parts := _wrap(row[0], w, SMALL)
		if y + parts.size() * 6.0 * K > end:
			break
		for p in parts:
			_top(Vector2(x, y), p, SMALL, row[1])
			y += 6.0 * K


## The coach's line while a new player's first word waits for its place, or has just been given one (ui/guide.ts
## guideCoach, as with a mouse): "" when there is nothing to say. Set in town, at the wordsmith's, that is the end of the
## lesson and nothing more is said (game.ts placeWord: "No special moment"); set on a floor, the move's new name, and to
## close this and try it.
func _coach() -> String:
	if _coached:
		if main == null or main.is_home(main.place):
			return ""
		return "%s! %s" % [str(hero.loadout.r(main.guide.at)["name"]).to_upper(), "Press B and try it." if main.pad_live else "Close this and try it."]
	if not loot.first_word_waits():
		return ""
	# (with a controller, A is a click where its pointer is: ui/guide.ts guideCoach)
	var wn: String = str(Words.word(loot.first_spare())["name"]).to_upper()
	var sn: String = str(_skill(0)["name"]).to_upper()
	if main != null and main.pad_live:
		return "Press A on %s, then on %s's slot." % [wn, sn]
	return "Drag %s onto %s, or click the word and then the slot." % [wn, sn]


## One hit of a move, lowest to highest, as the ATTACKS page gives it (game.ts hitRange, baseFor): with all that his gear
## and attributes add, without what comes and goes in a fight and before a critical hit.
func hit_range(i: int) -> Array:
	var r: Dictionary = hero.loadout.r(i)
	var st: Dictionary = hero.stats
	var el: String = r["element"]
	var pct: float = st["fire_pct"] if el == "fire" else (st["frost_pct"] if el == "frost" else (st["light_pct"] if el == "lightning" else st["phys_pct"]))
	var k: float = float(r["dmg_mult"]) * (1.0 + (float(st["dmg_pct"]) + pct) / 100.0)
	var key: String = "fire" if el == "fire" else ("frost" if el == "frost" else ("light" if el == "lightning" else ""))
	var lo: float = float(st["dmg_min"]) + (float(st.get(key + "_min", 0.0)) if key != "" else 0.0)
	var hi: float = float(st["dmg_max"]) + (float(st.get(key + "_max", 0.0)) if key != "" else 0.0)
	return [maxi(1, roundi(lo * k)), maxi(1, roundi(hi * k))]


## How a move is limited, said short ("1.09/S", "3.5 S") and long (ui/inventory.ts paceText).
func _pace(i: int) -> Array:
	var r: Dictionary = hero.loadout.r(i)
	# (ABILITIES: MANA: what it costs)
	if hero.by_mana() and float(r.get("mana", 0)) > 0.0:
		return ["%d MANA" % roundi(float(r["mana"])), "costs %d mana" % roundi(float(r["mana"]))]
	if float(_skill(i)["cooldown"]) > 0.0 and float(r["cooldown"]) > 0.0:
		return ["%.1f S" % r["cooldown"], "once every %.1f seconds" % r["cooldown"]]
	if float(r["rate"]) > 0.0:
		return ["%.2f/S" % r["rate"], "%.2f a second" % r["rate"]]
	return ["", ""]


# --- the GEAR page: what he wears, and his numbers ---

func _draw_gear() -> void:
	var W := _hw()
	# the hero, as he stands in the game and twice the size, on a ground of his own between the two columns of slots
	var hero_x := M + CELL + 3.0 * K
	var hero_w := DOLL_W * K - 2.0 * CELL - 6.0 * K
	var box := Rect2(hero_x, _doll_y, hero_w, _doll_h)
	_gbox(box, BOX, BOX)
	_draw_doll(box, Vector2(M + DOLL_W * K / 2.0, _doll_y + floorf((_doll_h / K + 70.0) / 2.0) * K))
	for c in _cells:
		if not c["worn"]:
			continue
		var r: Rect2 = c["r"]
		var it = c["item"]
		var slot: String = c["where"]
		var lit: bool = r.has_point(_mouse)
		_gbox(r, BG2 if lit else SLOT, _cell_edge(c))
		if it != null:
			_icon_at(it["icon"], r)
			_pips(it, r)
		else:
			# (an empty slot shows, faintly, the kind of thing that goes in it)
			_icon_at(GHOST[slot], r, 0.3)
		_hits.append([r, "worn", slot, it])
	# beside him: his numbers at a glance (what changes when a piece is put on: ui/inventory.ts drawGlance)
	var gx := M + DOLL_W * K + 8.0 * K
	# (a level gained: +5 to place, as the game's level-up asks (game.ts chooseAttr): a row of its own at the foot of his numbers)
	var ask := 16.0 * K if loot.points > 0 else 0.0
	# (THE PACK COLLAR's companions to pick from: rows of their own at the foot of his numbers, over the level-up's)
	var pets := _collar_kinds()
	var pet_h := 7.0 * K + ceilf(pets.size() / 2.0) * 14.0 * K if not pets.is_empty() else 0.0
	_draw_glance(Rect2(gx, _page_y + K, W - M - gx, _page_h - K - ask - pet_h))
	if not pets.is_empty():
		_draw_collar_row(pets, Rect2(gx, _page_y + _page_h - ask - pet_h, W - M - gx, pet_h))
	if loot.points > 0:
		var bw := floorf((W - M - gx - 4.0 * K) / (3.0 * K)) * K
		var bx := gx
		for a in ["str", "dex", "int"]:
			var r := Rect2(bx, _page_y + _page_h - 13.0 * K, bw, 12.0 * K)
			_gbutton(r, "+5 %s" % a.to_upper(), true, r.has_point(_mouse), true)
			_hits.append([r, "attr", a, null])
			bx += bw + 2.0 * K


## The figure on the GEAR page (ui/inventory.ts dollFigure): he stands in his loop, facing down and to the right, twice his size,
## his scarf moving, cut to his ground.
func _draw_doll(box: Rect2, feet: Vector2) -> void:
	var art = hero.art
	if art == null:
		return
	var side := 0 if art.sides() == 2 else BakedHero.SIDES.find("toward")
	var n: int = art.count(side, BakedHero.IDLE)
	if n == 0:
		return
	var f: Dictionary = art.frame(side, BakedHero.IDLE, int(_t * 30.0) % n)
	var p: Dictionary = f["part"]
	var ax := float(p["ax"])
	var ay := float(p["ay"])
	var w := float(p["w"])
	var h := float(p["h"])
	# (a game pixel of the figure is four of the screen's here: two of the panel's game pixels)
	var u := 2.0 * K
	if _doll_tails == null:
		_doll_tails = Tails.new(JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))["tails"])
	if _t - _doll_t > 0.5 or _t < _doll_t:
		_doll_tails.reset()
	_doll_t = _t
	_doll_tails.step(_dt, p.get("tails", []), ax, ay, 1.0, 0.0, 0.0)
	_doll_tails.refresh()
	var at := feet
	for over in [false, true]:
		var t = _doll_tails
		var tr: Rect2i = t.box[over]
		if tr.size.x > 0 and t.tex[over] != null:
			_clip_blit(t.tex[over], Rect2(at.x + (tr.position.x - t.HW) / 2.0 * u, at.y + (tr.position.y - t.UP) / 2.0 * u, tr.size.x / 2.0 * u, tr.size.y / 2.0 * u), Rect2(tr.position, tr.size), box)
		if not over:
			var tex: AtlasTexture = f["tex"]
			_clip_blit(tex.atlas, Rect2(at.x - ax * u, at.y - ay * u, w * u, h * u), tex.region, box)


## A picture drawn into `dest`, only what of it lies within `clip` (the source cut to match).
func _clip_blit(tex: Texture2D, dest: Rect2, src: Rect2, clip: Rect2) -> void:
	var c := dest.intersection(clip)
	if not c.has_area():
		return
	var kx := src.size.x / dest.size.x
	var ky := src.size.y / dest.size.y
	var s := Rect2(src.position + Vector2((c.position.x - dest.position.x) * kx, (c.position.y - dest.position.y) * ky), Vector2(c.size.x * kx, c.size.y * ky))
	draw_texture_rect_region(tex, c, s)


## A piece's picture in a cell, at its own size in game pixels, in the middle (ui.ts slot).
func _icon_at(key: String, r: Rect2, alpha := 1.0) -> void:
	if not loot.pics.has(key):
		return
	var src: Rect2 = loot.pics[key]["rect"]
	var d := (src.size / 2.0).floor() * K
	draw_texture_rect_region(loot.sheet, Rect2((r.position + (r.size - d) / 2.0).floor(), d), src, Color(1, 1, 1, alpha))


## (ui/inventory.ts statRow) A name in the small letters, its number at the right in the normal ones, white.
func _stat_row(label: String, value: String, x: float, y: float, w: float, c := DIM) -> void:
	_top(Vector2(x, y + 2.0 * K), label, SMALL, c)
	_top(Vector2(x + w - _width(value, NORMAL), y), value, NORMAL, Color.WHITE)


## (ui/inventory.ts drawGlance) Beside the hero on the GEAR page: the numbers that a piece of gear changes, at a glance, as many as
## there is room for, the most telling first.
func _draw_glance(r: Rect2) -> void:
	if r.size.x < 60.0 * K:
		return
	var s: Dictionary = hero.stats
	var rows := [
		["LIFE", "%d" % roundi(hero.max_life)],
		["ARMOUR", "%d" % roundi(s.get("armor", 0.0))],
	] + ([["BARRIER", "%d" % roundi(hero.max_barrier)], ["DODGE", "%d%%" % roundi(hero.dodge_chance() * 100.0)]] if loot.DEFENCE_LAYERS else []) + [
		["DAMAGE", "%d-%d" % [roundi(s["dmg_min"]), roundi(s["dmg_max"])]],
		["A SECOND", "%.2f" % s["aps"]],
		["CRITICAL", "%.1f%%" % s["crit_chance"]],
		["FIRE", "%d%%" % roundi(s.get("res_fire", 0.0))],
		["FROST", "%d%%" % roundi(s.get("res_frost", 0.0))],
		["LIGHTNING", "%d%%" % roundi(s.get("res_light", 0.0))],
		["POISON", "%d%%" % roundi(s.get("res_poison", 0.0))],
	]
	var pitch := clampf(floorf(r.size.y / (rows.size() * K)), 9.0, 12.0) * K
	var y := r.position.y + maxf(0.0, floorf((r.size.y - (rows.size() - 1) * pitch - 8.0 * K) / (2.0 * K)) * K)
	for row in rows:
		if y + 8.0 * K > r.end.y:
			break
		_stat_row(row[0], row[1], r.position.x, y, r.size.x)
		y += pitch


## (ui/inventory.ts drawStats) THE STATS PAGE: the attributes and the level across the top (how far to the next level as a bar
## under them); then, side by side, the defences and the attack.
func _draw_stats(r: Rect2) -> void:
	var s: Dictionary = hero.stats
	var cells: Array = []
	for a in ["str", "dex", "int"]:
		cells.append([ATTR_NAME[a], "%d" % roundi(s[a]), ATTR_COLOR[a]])
	cells.append(["LEVEL", "%d" % loot.level, DIM])
	var widths: Array = cells.map(func(c): return maxf(_width(c[0], SMALL), _width(c[1], NORMAL)))
	var sum := 0.0
	for w in widths:
		sum += w
	var air := maxf(4.0 * K, floorf((r.size.x - sum) / ((cells.size() - 1) * K)) * K)
	var x := r.position.x
	for i in cells.size():
		_top(Vector2(x, r.position.y + K), cells[i][0], SMALL, cells[i][2])
		_top(Vector2(x, r.position.y + 8.0 * K), cells[i][1], NORMAL, Color.WHITE)
		x += widths[i] + air
	# (how far to the next level)
	var frac := clampf(loot.xp / maxf(1.0, loot.xp_to_next(loot.level)), 0.0, 1.0)
	draw_rect(Rect2(r.position.x, r.position.y + 19.0 * K, r.size.x, 1.5 * K), SLOT)
	draw_rect(Rect2(r.position.x, r.position.y + 19.0 * K, roundf(r.size.x * frac / K) * K, 1.5 * K), PICK)
	var stop := roundi(hero.armour_cut() * 100.0) if hero.has_method("armour_cut") else 0
	var armor := float(s.get("armor", 0.0))
	var defence := [
		["LIFE", "%d / %d" % [ceili(hero.life), roundi(hero.max_life)]],
		["LIFE A SECOND", "%.1f" % s.get("life_regen", 0.0)],
		["ARMOUR", ("%d (%d%%)" % [roundi(armor), stop]) if armor > 0.0 else "0"],
	]
	# (THE THREE DEFENCES, loot.gd DEFENCE_LAYERS: his dodge, and its chance here; his barrier)
	if loot.DEFENCE_LAYERS:
		defence.append(["DODGE", ("%d (%d%%)" % [roundi(s.get("dodge", 0.0)), roundi(hero.dodge_chance() * 100.0)]) if s.get("dodge", 0.0) > 0.0 else "0"])
		defence.append(["BARRIER", "%d / %d" % [ceili(hero.barrier), roundi(hero.max_barrier)]])
	defence += [
		["FIRE RESIST", "%d%%" % roundi(s.get("res_fire", 0.0))],
		["FROST RESIST", "%d%%" % roundi(s.get("res_frost", 0.0))],
		["LIGHTNING RESIST", "%d%%" % roundi(s.get("res_light", 0.0))],
		["POISON RESIST", "%d%%" % roundi(s.get("res_poison", 0.0))],
		["FLASKS", "%d" % loot.potions],
	]
	var attack := [
		["WEAPON DAMAGE", "%d-%d" % [roundi(s["dmg_min"]), roundi(s["dmg_max"])]],
		["ATTACKS A SECOND", "%.2f" % s["aps"]],
		["CRITICAL CHANCE", "%.1f%%" % s["crit_chance"]],
		["CRITICAL DAMAGE", "+%d%%" % roundi(s.get("crit_mult", 0.0))],
	]
	var mana: bool = hero.loadout.limit == "mana"
	if mana:
		attack.append(["MANA", "%d / %d" % [floori(hero.mana), roundi(hero.max_mana)]])
		attack.append(["MANA A SECOND", "%.1f" % hero.mana_regen])
	if float(s.get("cdr", 0.0)) > 0.0:
		attack.append(["MANA COST" if mana else "COOLDOWNS", "-%d%%" % roundi(float(s["cdr"]) * 100.0)])
	if float(s.get("area", 1.0)) != 1.0:
		attack.append(["AREA", "+%d%%" % roundi((float(s["area"]) - 1.0) * 100.0)])
	if float(s.get("move_speed", 0.0)) != 0.0:
		attack.append(["MOVE SPEED", "+%d%%" % roundi(float(s["move_speed"]))])
	var gutter := 10.0 * K
	var col_w := floorf((r.size.x - gutter) / (2.0 * K)) * K
	var top := r.position.y + 25.0 * K
	var most := maxi(defence.size(), attack.size())
	var pitch := clampf(floorf((r.end.y - top - 9.0 * K) / (most * K)), 9.0, 11.0) * K
	var blocks := [["DEFENCE", defence], ["ATTACK", attack]]
	for i in 2:
		var bx := r.position.x + i * (col_w + gutter)
		var y := top
		_top(Vector2(bx, y), blocks[i][0], SMALL, PICK)
		draw_rect(Rect2(bx, y + 6.5 * K, col_w, K), EDGE)
		y += 9.0 * K
		for row in blocks[i][1]:
			if y + 8.0 * K > r.end.y:
				break
			_stat_row(row[0], row[1], bx, y, col_w)
			y += pitch


## The rim of a piece's cell: lit while a word in hand could be burned into it, or waits on it for a yes or a no; else its
## rarity's colour.
func _cell_edge(c: Dictionary) -> Color:
	var it = c["item"]
	if it == null:
		return EDGE
	if not _pending.is_empty() and typeof(_pending["where"]) == typeof(c["where"]) and _pending["where"] == c["where"]:
		return PICK
	if _word != "" and _pending.is_empty() and loot.burn_problem(_word, c["where"]) == "":
		return PICK if sin(_t * 7.0) > 0.0 else PICK_LO
	return loot.RARITY_COLOR[int(it["rarity"])] if not c["worn"] else EDGE


## The four places a piece has for properties, as pips along the bottom of its cell (ui/panels.ts drawItemPips): a pale blue
## one for each it was found with, one in the word's colour for each word burned into it, a dim one for each still free
## (a unique piece takes no word, and shows none free).
func _pips(it: Dictionary, r: Rect2) -> void:
	var lit: Array = []
	for i in int(it.get("affixes", 0)):
		lit.append(MAGIC)
	for im in it.get("imbues", []):
		lit.append(loot.word_color(im["word"]))
	var unique: bool = int(it["rarity"]) == 3
	# (in the game's own pixels: each 3 wide, 1 apart, 1.5 tall, 2.5 up from the cell's foot; here as the cell is sized)
	var u := r.size.x / 20.0
	var px := r.position.x + floorf((r.size.x - 15.0 * u) / 2.0)
	for i in 4:
		if i < lit.size() or not unique:
			draw_rect(Rect2(px, r.end.y - 2.5 * u, 3.0 * u, 1.5 * u), lit[i] if i < lit.size() else EDGE)
		px += 4.0 * u


# --- the bottom that never changes: his words, and the bag ---

func _draw_bag(_blink: bool, first: bool) -> void:
	var W := _hw()
	# (WORD_LEX: LEXICON, under the gold and the level beside the bag)
	if _lex_r.has_area():
		if RUNE_BAG.on:
			# (RUNES: a rune's stone, RUNES, and how many he holds; lit while the bag is open)
			var lit: bool = _lex or _lex_r.has_point(_mouse)
			_gbox(_lex_r, PICK_BG if _lex else (HOT if lit else BG2), PICK if lit else EDGE_HI)
			var cy := _lex_r.position.y + floorf((_lex_r.size.y - 12.0 * K) / (2.0 * K)) * K
			if loot.pics.has("word:eruption"):
				_icon("word:eruption", Rect2(_lex_r.position.x + 2.0 * K, cy, 12.0 * K, 12.0 * K))
			_top(Vector2(_lex_r.position.x + 16.0 * K, _lex_r.position.y + 4.0 * K), "RUNES", NORMAL, PICK if _lex else TEXT)
			var nheld := "%d" % loot.held().size()
			if 16.0 * K + _width("RUNES", NORMAL) + 4.0 * K + _width(nheld, SMALL) + 3.0 * K <= _lex_r.size.x:
				_small(Vector2(_lex_r.end.x - 3.0 * K, _lex_r.position.y + 6.0 * K), nheld, DIM, true)
		else:
			_gbutton(_lex_r, "LEXICON", false, _lex or _lex_r.has_point(_mouse))
		_hits.append([_lex_r, "lex", null, null])
	if _all:
		return
	_small(Vector2(M, _bag_y - CAP), "BAG", DIM)
	for c in _cells:
		if c["worn"]:
			continue
		var r: Rect2 = c["r"]
		var it = c["item"]
		# (ui.ts slot: a dark cell, its rim the piece's rarity; lit while pointed at; the piece at its own size in the middle)
		_gbox(r, BG2 if r.has_point(_mouse) and it != null else SLOT, _cell_edge(c))
		if it != null:
			_icon_at(it["icon"], r, 0.3 if first else 1.0)
			_pips(it, r)
			_hits.append([r, "bag", c["where"], it])
	# beside the bag: what he has, and who he is
	var ix := M + BAG_COLS * PITCH - 2.0 * K + 8.0 * K
	if M + (W - 2.0 * M) - ix >= 30.0 * K:
		_hud_pic("gold", Rect2(ix, _bag_y, 16, 16))
		_top(Vector2(ix + 9.0 * K, _bag_y + 2.0 * K), "%d" % loot.gold, SMALL, GOLD)
		# (WORDMELDING: the runedust carried, beside the gold, once there is any or the Meldstone has been found: act1/quest610.gd)
		var q6 = main.quest610 if main != null else null
		if q6 != null and (q6.dust > 0 or loot.meld != ""):
			var dx := ix + 20 + _width("%d" % loot.gold, SMALL) + 6.0 * K
			_film_pic("rd_icon", Vector2(dx, _bag_y + K))
			_top(Vector2(dx + 12.0 * K, _bag_y + 2.0 * K), "%d" % q6.dust, SMALL, Color(str(q6.Q["dust"]["color"])))
		_top(Vector2(ix, _bag_y + 14.0 * K), "LEVEL %d" % loot.level, SMALL, DIM)
		_top(Vector2(ix, _bag_y + 22.0 * K), str(hero.cls_name() if hero.has_method("cls_name") else CLASS_NAME.get(hero.cls, hero.cls)).to_upper(), SMALL, FAINT)


func _draw_words(first: bool) -> void:
	_small(Vector2(M, _pouch_y - CAP), "YOUR WORDS", DIM)
	if _pouch.is_empty():
		# (before the ring is lit, what opens wordsmithing; after, "empty")
		var dark := ""
		if not loot.ring_lit:
			dark = "Slots open at the wordsmith: bring him the MASTER RUNE-STONE." if loot.quest != "" else "No word slots until his ring is lit."
		_top(Vector2(M, _pouch_y + floorf((TH - 5.0 * K) / 2.0)), dark if dark != "" else "empty", SMALL, DIM if dark != "" else FAINT)
	var line: Array = _pouch.filter(func(c): return not c.get("lex", false))
	var hidden: int = loot.held().size() - line.size()
	if hidden > 0:
		_small(Vector2(_hw() - M - (_swap_r.size.x + GAP if _swap_r.has_area() else 0.0), _pouch_y - CAP), "+%d MORE" % hidden, DIM, true)
	# (WORD_ROOM: the tile that turns the bottom: ALL, and how many words he holds; or BAG, and how full it is)
	if _swap_r.has_area():
		var hot := _swap_r.has_point(_mouse)
		_gbox(_swap_r, BG2 if hot else BOX, EDGE_HI if hot else (PICK_LO if hidden > 0 and not _all else EDGE))
		var mid := _swap_r.position.x + floorf(_swap_r.size.x / (2.0 * K)) * K
		var top_line := "BAG" if _all else "ALL"
		var low_line := ("%d/%d" % [loot.bag.size(), loot.BAG]) if _all else "%d" % loot.held().size()
		_top(Vector2(mid - floorf(_width(top_line, SMALL) / (2.0 * K)) * K, _swap_r.position.y + 3.0 * K), top_line, SMALL, PICK if hidden > 0 and not _all else TEXT)
		_top(Vector2(mid - floorf(_width(low_line, SMALL) / (2.0 * K)) * K, _swap_r.position.y + 11.0 * K), low_line, SMALL, DIM)
		_hits.append([_swap_r, "swap", null, null])
	for c in line:
		var sel: bool = _word == c["w"] or (not _pending.is_empty() and _pending["word"] == c["w"])
		var n := int(loot.words[c["w"]])
		# (the one being carried, or waiting on a piece, has left its tile when it is the last of its kind)
		var gone: bool = sel and n <= 1 and ((not _drag.is_empty() and _drag["moving"]) or not _pending.is_empty())
		if not gone:
			var r: Rect2 = c["r"]
			if sel:
				r.position.y -= K
			_tile(r, c["w"], "name", {"lit": sel or c["r"].has_point(_mouse), "edge": PICK if sel else null, "count": n, "bare": c["bare"], "stone": c["stone"]})
		if first and c["w"] == loot.first_spare() and _word == "":
			_arrow(Vector2(c["r"].end.x + 2.0 * K, c["r"].position.y + c["r"].size.y / 2.0))


## (WORD_LEX, ui.ts panel) His lexicon: a panel with a soft shadow under it and a hair of light along its top, LEXICON and how many
## words he holds, and every word as its rune stone; a word pressed is in hand as from the line over the bag.
func _draw_lex() -> void:
	var r := _lex_panel
	draw_rect(Rect2(r.position + Vector2(2.0 * K, 2.0 * K), r.size), Color(Color("#07050a"), 0.55))
	_gbox(r, BOX, EDGE)
	draw_rect(Rect2(r.position.x + 2.0 * K, r.position.y + 1, r.size.x - 4.0 * K, 1), PICK_LO)
	var cells: Array = _pouch.filter(func(c): return c.get("lex", false))
	_small(Vector2(r.position.x + 4.0 * K, r.position.y + 4.0 * K), "LEXICON  %d" % loot.held().size(), DIM)
	if cells.is_empty():
		_top(Vector2(r.position.x + 4.0 * K, r.position.y + 4.0 * K + CAP + floorf((TH - 5.0 * K) / 2.0)), "empty", SMALL, FAINT)
	for c in cells:
		var sel: bool = _word == c["w"] or (not _pending.is_empty() and _pending["word"] == c["w"])
		var rr: Rect2 = c["r"]
		if sel:
			rr.position.y -= K
		_tile(rr, c["w"], "name", {"lit": sel or c["r"].has_point(_mouse), "edge": PICK if sel else null, "count": int(loot.words[c["w"]]), "bare": false, "stone": true})


## A small arrow that bobs beside a thing to be pressed, its tip at `at`, standing to its right (ui/words.ts arrow 'left').
func _arrow(at: Vector2) -> void:
	var bob := roundf(absf(sin(_t * 5.0)) * 3.0) * K
	var rows := [[0, 0], [-1, 1], [-2, 2], [-3, 3], [-1, 1], [-1, 1], [-1, 1]]
	for i in rows.size():
		var k: float = (i + 1) * K + bob
		draw_rect(Rect2(at.x + k, at.y + rows[i][0] * K, K, (rows[i][1] - rows[i][0] + 1) * K), PICK)


# --- a word's tile, and a move's name in its words' colours (ui/words.ts) ---

## How a word reads in a place: its own name, its name in front ("FLAME") or behind ("VENOM", after a small "of").
func _form(w: String, form: String) -> String:
	if form == "name":
		return str(_hud["words"][w]["name"]).to_upper()
	return _hud["words"][w][form]


## How wide a word's tile is: its rune stone, the small "of" of a word behind, the word, how many (ui/words.ts tileWidth).
func _tile_w(w: String, form: String, count := 1, bare := false) -> float:
	return (4.0 if bare else 16.0) * K + (_width("of", SMALL) + 3.0 * K if form == "behind" else 0.0) + _width(_form(w, form), NORMAL) + (_width("x%d" % count, SMALL) + 4.0 * K if count > 1 else 0.0) + 5.0 * K


## One word as a tile (ui/words.ts drawWordTile): a plate edged in the word's colour, its rune stone, the word. `stone`: the
## rune stone alone, in the middle (a word set in a slot; a pouch too full to write its words out).
func _tile(r: Rect2, w: String, form: String, opts := {}) -> void:
	var c: Color = loot.word_color(w)
	draw_rect(r, HOT if opts.get("lit", false) else BOX)
	# (a lighter top edge, so that it reads as a thing that can be picked up)
	draw_rect(Rect2(r.position + Vector2(K, K), Vector2(r.size.x - 2.0 * K, K)), Color(1, 1, 1, 0.12 if opts.get("lit", false) else 0.05))
	var edge = opts.get("edge")
	draw_rect(r, edge if edge != null else c, false, 1.5)
	var count: int = maxi(1, int(opts.get("count", 1)))
	if opts.get("stone", false):
		_icon("word:" + w, Rect2(r.position + ((r.size - Vector2(12.0 * K, 12.0 * K)) / 2.0).floor(), Vector2(12.0 * K, 12.0 * K)))
		if count > 1:
			_small(Vector2(r.end.x - K, r.end.y - 7.0 * K), "%d" % count, Color.WHITE, true)
		return
	var tx := r.position.x + 4.0 * K
	if not opts.get("bare", false):
		_icon("word:" + w, Rect2(r.position.x + 2.0 * K, r.position.y + floorf((r.size.y - 12.0 * K) / 2.0), 12.0 * K, 12.0 * K))
		tx = r.position.x + 16.0 * K
	var ty := r.position.y + floorf((r.size.y - 8.0 * K) / 2.0) + K
	if form == "behind":
		_top(Vector2(tx, ty + 2.0 * K), "of", SMALL, DIM)
		tx += _width("of", SMALL) + 3.0 * K
	_top(Vector2(tx, ty), _form(w, form), NORMAL, c)
	tx += _width(_form(w, form), NORMAL)
	if count > 1:
		_top(Vector2(tx + 3.0 * K, ty + 2.0 * K), "x%d" % count, SMALL, TEXT)


## The pieces of a move's whole name, each in its colour: FLAME STRIKE of POWER and VENOM (ui/words.ts nameParts).
func _name_parts(i: int, front: Array, behind: Array) -> Array:
	var parts: Array = []
	for w in front:
		if w != null:
			parts.append({"text": _form(w, "front"), "color": loot.word_color(w), "small": false})
	parts.append({"text": str(_skill(i)["name"]).to_upper(), "color": Color.WHITE, "small": false})
	var first := true
	for w in behind:
		if w == null:
			continue
		parts.append({"text": "of" if first else "and", "color": DIM, "small": true})
		parts.append({"text": _form(w, "behind"), "color": loot.word_color(w), "small": false})
		first = false
	return parts


func _name_w(parts: Array, px: int) -> float:
	var w := 0.0
	for i in parts.size():
		w += _width(parts[i]["text"], SMALL if parts[i]["small"] else px) + (px / 3.0 if i < parts.size() - 1 else 0.0) * K
	return w


## A move's name broken into lines no wider than `max_w`: a small "of" or "and" goes to the next line with the word it
## leads (ui/words.ts nameLines).
func _name_lines(parts: Array, max_w: float, px: int) -> Array:
	var lines: Array = []
	var cur: Array = []
	for p in parts:
		if not cur.is_empty() and _name_w(cur + [p], px) > max_w:
			var lead = cur.pop_back() if cur.size() > 1 and cur[cur.size() - 1]["small"] else null
			lines.append(cur)
			cur = [lead] if lead != null else []
		cur.append(p)
	if not cur.is_empty():
		lines.append(cur)
	return lines


## A move's name in its colours, from the left at x, its letters' tops at y.
func _draw_name(parts: Array, x: float, y: float, px: int) -> void:
	for p in parts:
		if p["small"]:
			_top(Vector2(x, y + px * 0.3), p["text"], SMALL, p["color"])
			x += _width(p["text"], SMALL) + px / 3.0 * K
		else:
			_top(Vector2(x, y), p["text"], px, p["color"])
			x += _width(p["text"], px) + px / 3.0 * K


# --- what is being read: on a card over the other half, against the panel's edge ---

## Which of the things that can be read is being read (the first that applies), or "".
func _reading() -> String:
	if not _pending.is_empty():
		return "pending"
	if _word != "" and not _over.is_empty():
		return "over"
	if not _result.is_empty():
		return "result"
	if _word != "":
		return "hand"
	if _look != null:
		return "look"
	return ""


func _draw_reading(blink: bool, first: bool) -> void:
	# (a word that was being looked at in its slot and has been taken out since: nothing to look at)
	if _look != null:
		var g: Array = hero.loadout.slots(_look[0], _look[1])
		if _look[2] >= g.size() or g[_look[2]] == null:
			_look = null
	if not _pending.is_empty() and int(loot.words.get(_pending["word"], 0)) <= 0:
		_pending = {}
	if _word != "" and int(loot.words.get(_word, 0)) <= 0:
		_word = ""
	var what := _reading()
	if what == "":
		return
	var W := _hw()
	var card_w := 190.0 * K
	var inner := card_w - 10.0 * K
	var rows: Array = []  # {t, c, px} a line of letters; {parts, px} a move's name; {gap} air
	var about = null
	var buttons: Array = []
	var dragging: bool = not _drag.is_empty() and _drag["moving"]
	match what:
		"pending":
			about = _cell_rect(_pending["where"])
			_piece_rows(rows, _pending["word"], _pending["where"], true, inner)
			# (SPLITTING AND BINDING: SPLIT IT, BIND THEM; Binding's only once its second piece is pressed)
			var yes := "SPLIT IT" if _pending["word"] == "splitting" else ("BIND THEM" if _pending["word"] == "binding" else "BURN IT")
			buttons = [["CANCEL", "no"]] if _pending["word"] == "binding" and not _pending.has("with") else [[yes, "yes"], ["CANCEL", "no"]]
		"over":
			about = _over["r"]
			if _over["kind"] == "slot":
				_slot_rows(rows, _word, _over["i"], _over["side"], _over["k"], inner, dragging)
			elif _over["kind"] == "sell":
				# (THE WORDSMITH'S TRADE: what letting go does: ui/trades.ts wordRead)
				_lines(rows, "Let go, and he pays %d gold for %s." % [loot.word_sell_value(), Words.word(_word)["name"]], GOLD, SMALL, inner)
			elif _over["kind"] == "meld":
				# (WORDMELDING: over the wordsmith's half: what letting go does, or why it will not go in: ui/meld.ts wordRead)
				var no := _ws_problem(_word)
				if no != "":
					_lines(rows, no, BAD, NORMAL, inner)
				else:
					_lines(rows, "Let go, and %s is laid in to be melded." % Words.word(_word)["name"], PICK, SMALL, inner)
			elif _over.has("where"):
				_piece_rows(rows, _word, _over["where"], false, inner)
		"result":
			var lit: bool = _result["t"] < 0.7 and int(_result["t"] * 10.0) % 2 == 0
			_lines(rows, "%s was burned into %s. It became:" % [_form(_result["word"], "name"), _result["item"]], TEXT, SMALL, inner)
			var big: bool = _width(_result["text"], NORMAL * 2) <= inner
			_lines(rows, _result["text"], Color.WHITE if lit else loot.word_color(_result["word"]), NORMAL * 2 if big else NORMAL, inner)
		"hand":
			for c in _pouch:
				if c["w"] == _word:
					about = c["r"]
			rows.append({"parts": [{"text": _form(_word, "name"), "color": loot.word_color(_word), "small": false}, {"text": _hud["words"][_word]["grows"], "color": DIM, "small": true}], "px": NORMAL})
			_lines(rows, Words.word(_word)["about"], Color.WHITE, NORMAL, inner)
			# (THE DOOR WORDS, door_words.gd: only the Rim's door takes one)
			if DoorWords.is_door(_word):
				_lines(rows, "Lay it in the Rim's door: it is burned into the next endless level. %s." % DoorWords.line(_word, true).trim_suffix("."), TEXT, SMALL, inner)
			elif first:
				_lines(rows, "Drag it onto an attack, or click a slot.", TEXT, SMALL, inner)
			elif _page == "attacks":
				_lines(rows, "Drag it onto an attack, or click a slot: it can be taken out again.", TEXT, SMALL, inner)
			else:
				_lines(rows, "Click a piece of gear to burn it in: it is used up. Hold it over a piece to see what it could become.", TEXT, SMALL, inner)
			# (WORDMELDING: with the wordsmith's half melding, its hint and TO THE MELD: ui/meld.ts wordHint, wordButtons)
			if wsmith == "meld":
				var hint := _ws_hint(_word)
				if hint != "":
					_lines(rows, hint, DIM, SMALL, inner)
				buttons = [["TO THE MELD", "ws_to_meld"]]
			# (THE LEXICON: what keeping it in the book costs, and KEEP: ui/lexicon.ts wordHint, wordButtons)
			elif svc == "lexicon":
				var cost: int = loot.keep_cost()
				_lines(rows, ("Keeping it here costs %d gold: you have %d." % [cost, loot.gold]) if loot.gold < cost else "Kept here, it waits for your next character.", DIM, SMALL, inner)
				buttons = [["KEEP: %d GOLD" % cost, "lx_keep"]]
			# (THE WORDSMITH'S TRADE: his half on its first page: what he pays, and SELL: ui/trades.ts wordHint, wordButtons)
			elif wsmith == "trade":
				_lines(rows, "He pays %d gold for a spare word." % loot.word_sell_value(), DIM, SMALL, inner)
				buttons = [["SELL: %d GOLD" % loot.word_sell_value(), "ws_sell"]]
		"look":
			for c in _slots:
				if _look == [c["i"], c["side"], c["k"]]:
					about = c["r"]
			var i: int = _look[0]
			var w: String = hero.loadout.slots(i, _look[1])[_look[2]]
			for ln in _name_lines(_name_parts(i, hero.loadout.front[i], hero.loadout.behind[i]), inner, NORMAL):
				rows.append({"parts": ln, "px": NORMAL})
			# what it does on this move, numbers and all: its own line of the move's
			var label: String = Words.word(w)["front"] if _look[1] == "front" else Words.word(w)["behind"]
			for l in hero.loadout.r(i)["lines"].slice(1):
				if str(l).begins_with(label + ":"):
					_lines(rows, l, Color.WHITE, SMALL, inner)
			_lines(rows, "Drag it out, or right-click it, to take it back.", DIM, SMALL, inner)
	if rows.is_empty():
		return
	var tall := 0.0
	for r in rows:
		tall += _row_h(r)
	var bh := 15.0 * K
	var foot := bh + 5.0 * K if not buttons.is_empty() else 0.0
	var ch := 5.0 * K + tall + foot + 3.0 * K
	# (against the panel's edge, over the game's half: the panel on the right, the card to the left of it)
	var cx := 2.0 * W - 3.0 * K - card_w
	var mid: float = (about.position.y + about.size.y / 2.0) if about != null else _vh() / 2.0
	var cy := clampf(roundf(mid - ch / 2.0), 3.0 * K, _vh() - ch - 3.0 * K)
	if _tall():
		# (UPRIGHT: over the panel, against its upper edge; across the screen, over the thing it is about: ui/inventory.ts `below`)
		var ax: float = (about.position.x + about.size.x / 2.0) if about != null else size.x / 2.0
		cx = W + clampf(roundf(ax - card_w / 2.0), 3.0 * K, size.x - card_w - 3.0 * K)
		cy = maxf(2.0 * K, size.y - _ph() - ch - 3.0 * K)
	if shop != "":
		# (over a vendor's half the card lies on lettering, not on the game: a dark margin round it keeps the two apart)
		draw_rect(Rect2(cx - 3.0 * K, cy - 3.0 * K, card_w + 6.0 * K, ch + 6.0 * K), Color(INK, 0.72))
	_gbox(Rect2(cx, cy, card_w, ch), INK, EDGE)
	var y := cy + 5.0 * K
	for r in rows:
		if r.has("parts"):
			_draw_name(r["parts"], cx + 5.0 * K, y, r["px"])
		elif r.has("t"):
			_top(Vector2(cx + 5.0 * K + float(r.get("x", 0.0)), y), r["t"], r["px"], r["c"])
		y += _row_h(r)
	var bx := cx + 5.0 * K
	var bw := minf(78.0 * K, floorf((inner - 3.0 * K * (buttons.size() - 1)) / maxf(1.0, buttons.size())))
	for b in buttons:
		var r := Rect2(bx, cy + ch - 4.0 * K - bh, bw, bh)
		var pink: bool = b[1] == "yes" or (b[1] == "ws_to_meld" and _ws_problem(_word) == "")
		_gbox(r, Color(PRESS, 0.35 if blink else 0.18) if pink else BOX, PRESS if pink else EDGE)
		_mid(r, b[0], NORMAL, Color.WHITE if pink else TEXT)
		_card_buttons.append([r, b[1]])
		bx += bw + 3.0 * K


## THE PACK COLLAR, the Ranger's own (ui/inventory.ts: on its card, over its buttons, a row of the companions it may bring, the one it
## brings lit; picked in town, and out of town a tap says so). This gear screen has no card that stays up to press on, so with the
## collar worn or in the bag the row is on the GEAR page, at the foot of her numbers under PACK COLLAR, two to a line.
func _collar_kinds() -> Array:
	if main == null or main.get("_companions") == null or hero == null or hero.cls != "ranger":
		return []
	for it in loot.gear.values() + loot.bag:
		if it is Dictionary and it.get("unique") == "packcollar":
			return main._companions.collar_choices()
	return []


func _draw_collar_row(kinds: Array, r0: Rect2) -> void:
	var now: String = main._companions.collar_pick()
	_small(r0.position, "PACK COLLAR", DIM)
	var bw := floorf((r0.size.x - 2.0 * K) / (2.0 * K)) * K
	for i in kinds.size():
		var k: String = kinds[i]
		var r := Rect2(r0.position.x + (i % 2) * (bw + 2.0 * K), r0.position.y + 7.0 * K + floorf(i / 2.0) * 14.0 * K, bw, 12.0 * K)
		_gbutton(r, str(main._companions.D["info"][k]["name"]).to_upper(), k == now, k == now or r.has_point(_mouse), true)
		_hits.append([r, "collar", k, null])


func _row_h(r: Dictionary) -> float:
	if r.has("gap"):
		return float(r["gap"])
	var px := int(r["px"])
	return (6.0 * K if px <= SMALL else 9.0 * K * (px / float(NORMAL))) + (K if r.has("parts") else 0.0)


## A sentence wrapped to the card's width, a row for each line.
func _lines(rows: Array, text: String, c: Color, px: int, w: float) -> void:
	for p in _wrap(text, w, px):
		rows.append({"t": p, "c": c, "px": px})


func _cell_rect(where):
	for c in _cells:
		if typeof(c["where"]) == typeof(where) and c["where"] == where:
			return c["r"]
	return null


## A word about to go into a slot: the name the move would have, and what the word may do there (ui/inventory.ts
## slotPreview); or why it will not go in.
func _slot_rows(rows: Array, w: String, i: int, side: String, k: int, inner: float, dragging: bool) -> void:
	var why := place_problem(i, side, k, w)
	var f: Array = hero.loadout.front[i].duplicate()
	var b: Array = hero.loadout.behind[i].duplicate()
	var back = (f if side == "front" else b)[k]
	(f if side == "front" else b)[k] = w
	var parts := _name_parts(i, f, b)
	# (large on one line if it fits; otherwise in the ordinary letters, on as many lines as it needs)
	var px: int = NORMAL * 2 if why == "" and _name_w(parts, NORMAL * 2) <= inner else NORMAL
	for ln in _name_lines(parts, inner, px):
		rows.append({"parts": ln, "px": px})
	if why != "":
		_lines(rows, why, BAD, NORMAL, inner)
		return
	_lines(rows, Words.word(w)["frontText"] if side == "front" else Words.word(w)["behindText"], Color.WHITE, NORMAL, inner)
	if back != null:
		_lines(rows, "%s is there now. It goes back to your words." % _form(back, "name"), TEXT, SMALL, inner)
	_lines(rows, "Let go to set it. It can be taken out again." if dragging else "Click to set it. It can be taken out again.", DIM, SMALL, inner)


## A word about to be burned into a piece of gear: what it could become there (ui/inventory.ts itemPreview); `asking`, the
## question before it is done.
func _piece_rows(rows: Array, w: String, where, asking: bool, inner: float) -> void:
	var it = loot.piece(where)
	if it == null:
		return
	var head: Array = [{"text": _form(w, "name"), "color": loot.word_color(w), "small": false}, {"text": "on", "color": DIM, "small": true}]
	var named := {"text": it["name"], "color": loot.RARITY_COLOR[int(it["rarity"])], "small": false}
	if _name_w(head + [named], NORMAL) <= inner:
		rows.append({"parts": head + [named], "px": NORMAL})
	else:
		rows.append({"parts": head, "px": NORMAL})
		rows.append({"parts": [named], "px": NORMAL})
	var why: String = "" if asking else loot.burn_problem(w, where)
	if why != "":
		_lines(rows, why, BAD, NORMAL, inner)
		return
	# (SPLITTING AND BINDING: what it will do to the piece: ui/inventory.ts itemPreview)
	if w == "splitting":
		var n: int = int(it.get("affixes", 0)) + it.get("imbues", []).size()
		_lines(rows, "It splits in two: its %d properties shared between it and a second like it, at random." % n, Color.WHITE, SMALL, inner)
		_lines(rows, "Which go where is rolled. The word is used up." if asking else ("Let go to choose this." if not _drag.is_empty() and _drag["moving"] else "Click to choose this."), DIM, SMALL, inner)
		return
	if w == "binding":
		var other = loot.piece(_pending["with"]) if asking and _pending.has("with") else null
		if other == null:
			_lines(rows, "Now press the piece to bind into it: another of the same kind." if asking else "It takes another piece of the same kind into it.", Color.WHITE, SMALL, inner)
			_lines(rows, "The other piece is gone after." if asking else ("Let go to choose this." if not _drag.is_empty() and _drag["moving"] else "Click to choose this."), DIM, SMALL, inner)
			return
		rows.append({"parts": [{"text": "+ " + str(other["name"]), "color": loot.RARITY_COLOR[int(other["rarity"])], "small": false}], "px": NORMAL})
		_lines(rows, "It keeps its own properties and as many of the other's as there is room for, four in all, never two of a kind.", Color.WHITE, SMALL, inner)
		_lines(rows, "Which of the other's is rolled. The other piece and the word are used up.", DIM, SMALL, inner)
		return
	var opts: Array = loot.burn_options(w, it)
	var could: Array = []
	for o in opts:
		could.append(o["rangeMana"] if loot.limit == "mana" and o.has("rangeMana") else o["range"])
	_lines(rows, "It could become:  %s" % "   or   ".join(could), Color.WHITE, SMALL, inner)
	if asking:
		_lines(rows, "Which one, and how strong, is rolled. The word is used up." if opts.size() > 1 else "How strong is rolled. The word is used up.", DIM, SMALL, inner)
	else:
		_lines(rows, "Let go to choose this." if not _drag.is_empty() and _drag["moving"] else "Click to choose this.", DIM, SMALL, inner)


## A word has just been set: the move's new name, large, across the screen over its line (ui/inventory.ts `flash`).
func _draw_flash() -> void:
	if _flash.is_empty() or _flash["t"] >= 1.1 or _page != "attacks":
		return
	var s: int = _flash["skill"]
	var parts := _name_parts(s, hero.loadout.front[s], hero.loadout.behind[s])
	var px: int = NORMAL * 3 if _name_w(parts, NORMAL * 3) <= size.x - 16.0 * K else (NORMAL * 2 if _name_w(parts, NORMAL * 2) <= size.x - 16.0 * K else NORMAL)
	var k: float = _flash["t"]
	var band := 9.0 * K * (px / float(NORMAL)) + K + 9.0 * K
	var row_y: float = _plates[s].position.y if _plates[s] != null else _page_y
	row_y = _to_screen(Vector2(0, row_y)).y
	var by := clampf(row_y + floorf(TH / 2.0) - floorf(band / 2.0), 2.0 * K, size.y - band - 2.0 * K)
	var a := 0.94 if k < 0.8 else maxf(0.0, 0.94 * (1.0 - (k - 0.8) / 0.3))
	draw_rect(Rect2(0, by, size.x, band), Color(Color.WHITE if k < 0.12 else INK, a))
	var c: Color = loot.word_color(_flash["word"])
	draw_rect(Rect2(0, by, size.x, 2.0 * K), Color(c, a))
	draw_rect(Rect2(0, by + band - 2.0 * K, size.x, 2.0 * K), Color(c, a))
	if k >= 0.12:
		var lifted: Array = []
		for p in parts:
			lifted.append({"text": p["text"], "color": Color(p["color"], a), "small": p["small"]})
		_draw_name(lifted, floorf((size.x - _name_w(parts, px)) / 2.0), by + 5.0 * K + roundf(maxf(0.0, 0.25 - k) * 20.0) * K, px)


# --- a piece's card ---

func _card(it: Dictionary, at: Vector2, fixed := false) -> float:
	# (ui/panels.ts itemCard: its name in its rarity's colour; its rarity and kind, small; a weapon's damage and pace; what it was
	# made with, in the plain colour; its properties in the magic blue; the words burned in, each under its word's name and in its
	# colour; how many more words it will take; the level it needs)
	var rows: Array = [[it["name"], loot.RARITY_COLOR[int(it["rarity"])], false]]
	var kind: String = str(it.get("kind", ""))
	var slot: String = str(it.get("slot", ""))
	if slot == "mainhand":
		kind = "%s weapon" % ("Light" if int(it.get("hands", 2)) == 1 or kind == "Bow" else "Heavy")
	var base: String = str(it.get("base", it["name"]))
	rows.append(["%s %s%s" % [RARITY_NAMES[int(it["rarity"])], kind, (" - " + base) if base != str(it["name"]) else ""], DIM, true])
	var implicit: Array = loot.lines_of(it, "implicit").duplicate()
	if slot == "mainhand" and not implicit.is_empty() and str(implicit[0]).begins_with("Adds ") and str(implicit[0]).ends_with(" Damage"):
		var lohi: String = str(implicit[0]).trim_prefix("Adds ").trim_suffix(" Damage")
		rows.append(["%s damage, %.2f a second" % [lohi, float(it.get("aps", 1.0))], TEXT, false])
		implicit.remove_at(0)
	for l in implicit:
		rows.append([l, TEXT, false])
	# (THE LEVELING UNIQUES: a stat that takes away, its price, in red as a unique's price is)
	for l in loot.lines_of(it):
		rows.append([l, BAD if int(it["rarity"]) == 3 and str(l).begins_with("-") else MAGIC, false])
	for im in it.get("imbues", []):
		for l in loot.lines_of(im):
			rows.append(["%s: %s" % [Words.word(im["word"])["name"], l], loot.word_color(im["word"]), false])
	# (UNIQUE ITEMS, game/uniques.ts uniqueLines: under its ordinary stats, what it does in its own orange, its price, whose it is;
	# it takes no word)
	if int(it["rarity"]) == 3 and it.get("unique") != null:
		for l in it.get("does", []):
			rows.append([l, loot.RARITY_COLOR[3], false])
		if it.get("price") != null:
			rows.append([str(it["price"]), BAD, false])
		if it.get("ucls") != null:
			var who: String = str(it["ucls"]).capitalize()
			rows.append([("%s only" % who) if it.get("only") == true else ("The %s's" % who), DIM if it["ucls"] == loot.cls else BAD, true])
		if it.get("wordIn") == false:
			rows.append(["Its word is not in the game yet.", BAD, true])
		rows.append(["Cannot be crafted", DIM, true])
	if int(it["rarity"]) != 3:
		var left: int = loot.room(it)
		rows.append([("Room for %d %s" % [left, "word" if left == 1 else "words"]) if left > 0 else "No room for words", DIM if left > 0 else FAINT, true])
	if int(it.get("req", 1)) > 1:
		rows.append(["Needs level %d" % int(it["req"]), DIM if int(it["req"]) <= loot.level else BAD, true])
	if shop != "" and not fixed:
		rows.append(["Sells for %d gold" % loot.sell_value(it), GOLD, true])
	# (as the game's card: lines wrapped to its width, the small ones 7 apart and the normal ones 9)
	var w := 150.0 * K
	var inner := w - 10.0 * K
	var lines: Array = []
	for r in rows:
		for part in _wrap(str(r[0]), inner, SMALL if r[2] else NORMAL):
			lines.append([part, r[1], r[2]])
	var h := 5.0 * K
	for l in lines:
		h += (7.0 if l[2] else 9.0) * K
	h += 2.0 * K
	var p := at
	if not fixed:
		# (over the game's half: to the left of the pointer while it is on the panel, on the right half)
		p = at + Vector2(16, 0) if at.x < size.x / 2.0 else at - Vector2(w + 16.0, 0)
		p.x = clampf(p.x, 4.0, size.x - w - 4)
		p.y = clampf(p.y, 4.0, size.y - h - 4)
	_gbox(Rect2(p, Vector2(w, h)), BOX, loot.RARITY_COLOR[int(it["rarity"])])
	draw_rect(Rect2(p.x + 2.0 * K, p.y + 1, w - 4.0 * K, 1), PICK_LO)
	var y := p.y + 5.0 * K
	for l in lines:
		_top(Vector2(p.x + 5.0 * K, y), l[0], SMALL if l[2] else NORMAL, l[1])
		y += (7.0 if l[2] else 9.0) * K
	return h


# --- the plain drawing kit ---

func _button(r: Rect2, label: String, action: String, arg, color: Color) -> void:
	_gbox(r, Color(color, 0.18), color)
	_text(r.position + Vector2(6, r.size.y - 6), label, 10, color)
	_hits.append([r, action, arg, null])


func _icon(key: String, r: Rect2, alpha := 1.0) -> void:
	var p: Dictionary = loot.pics[key]
	var src: Rect2 = p["rect"]
	var k := minf(r.size.x / src.size.x, r.size.y / src.size.y)
	var d := src.size * k
	draw_texture_rect_region(loot.sheet, Rect2(r.position + (r.size - d) / 2.0, d), src, Color(1, 1, 1, alpha))


## A picture of the HUD's sheet (a move's, the coin), fitted into `r`.
func _hud_pic(key: String, r: Rect2) -> void:
	var p: Array = _hud["pics"].get(key, [])
	if p.is_empty():
		return
	var src := Rect2(p[0], p[1], p[2], p[3])
	var k := minf(r.size.x / src.size.x, r.size.y / src.size.y)
	var d := src.size * k
	draw_texture_rect_region(_hud_tex, Rect2(r.position + ((r.size - d) / 2.0).floor(), d), src)


## (the game's letters, engine/font.ts) The font and its scale for one of the sizes the screen was laid out with: the small
## letters for a caption (SMALL and less), the normal ones for a line (NORMAL), twice and three times those for a name large.
func _font_of(px: int) -> Array:
	if px <= 10:
		return ["small", 1]
	return ["normal", maxi(1, roundi(px / float(NORMAL)))]


func _text(at: Vector2, s: String, px: int, c: Color) -> void:
	# (the baseline the plain letters were placed by: the game's sit with their tops at it less their height)
	var f := _font_of(px)
	var y := at.y - (5.0 if f[0] == "small" else 7.0) * K * int(f[1])
	# (a line that would run past the edge of its half is broken there, as the game's wrapText breaks it)
	var W := _hw()
	var limit := (2.0 * W if at.x >= W else W) - SIDE_M * K
	if at.x + _width(s, px) > limit and limit - at.x > 40.0 * K:
		for part in _wrap(s, limit - at.x, px):
			_top(Vector2(at.x, y), part, px, c)
			y += (6.0 if f[0] == "small" else 9.0) * K * int(f[1])
		return
	_top(Vector2(at.x, y), s, px, c)


## Letters with their tops at `at.y` (as the game places its own), in the game's letters, two of the screen's pixels to one of
## the game's.
func _top(at: Vector2, s: String, px: int, c: Color) -> void:
	var f := _font_of(px)
	draw_set_transform(_xf, 0.0, Vector2(K, K))
	PF.draw(self, s, at.x / K, at.y / K, c, {"font": f[0], "scale": int(f[1])})
	draw_set_transform(_xf)


## A small caption, from the left at `at`, or ending there.
func _small(at: Vector2, s: String, c: Color, right := false) -> void:
	_top(Vector2(at.x - (_width(s, SMALL) if right else 0.0), at.y), s, SMALL, c)


## Letters in the middle of a box (ui.ts drawButton: the normal letters 8 high, the small 5).
func _mid(r: Rect2, s: String, px: int, c: Color) -> void:
	var f := _font_of(px)
	var th := (5.0 if f[0] == "small" else 8.0) * int(f[1]) * K
	_top(Vector2(r.position.x + floorf((r.size.x - _width(s, px)) / (2.0 * K)) * K, r.position.y + floorf((r.size.y - th) / (2.0 * K)) * K + (0.0 if f[0] == "small" else K)), s, px, c)


func _width(s: String, px: int) -> float:
	var f := _font_of(px)
	return PF.width(s, f[0], int(f[1])) * K


## A sentence broken into lines no wider than `w` (engine/font.ts wrapText).
func _wrap(s: String, w: float, px: int) -> Array:
	var f := _font_of(px)
	if int(f[1]) == 1:
		return PF.wrap(s, w / K, f[0])
	var out: Array = []
	var line := ""
	for word in s.split(" ", false):
		var t: String = word if line == "" else line + " " + word
		if line != "" and _width(t, px) > w:
			out.append(line)
			line = word
		else:
			line = t
	if line != "":
		out.append(line)
	return out


## (ui.ts box) A box with its corners cut: a rim of `edge` half a game pixel wide (a pixel of the screen's), `fill` within.
func _gbox(r: Rect2, fill: Color, edge: Color) -> void:
	var x := r.position.x
	var y := r.position.y
	var w := r.size.x
	var h := r.size.y
	if w < 8.0 or h < 8.0:
		draw_rect(r, edge)
		draw_rect(Rect2(x + 1, y + 1, w - 2, h - 2), fill)
		return
	draw_rect(Rect2(x + 2, y, w - 4, h), edge)
	draw_rect(Rect2(x, y + 2, w, h - 4), edge)
	draw_rect(Rect2(x + 1, y + 1, w - 2, h - 2), edge)
	draw_rect(Rect2(x + 2, y + 1, w - 4, h - 2), fill)
	draw_rect(Rect2(x + 1, y + 2, w - 2, h - 4), fill)


## (ui.ts drawButton) A button: pink for the one thing to press (lit: brighter, its rim white), else a plain one.
func _gbutton(r: Rect2, label: String, primary := false, lit := false, small := false) -> void:
	if primary:
		_gbox(r, PRESS_HI if lit else PRESS, Color.WHITE if lit else PRESS_HI)
	else:
		_gbox(r, HOT if lit else BG2, PICK if lit else EDGE_HI)
	_mid(r, label, SMALL if small else NORMAL, Color.WHITE if primary else TEXT)


## THE PANEL ON THE RIGHT HALF OF THE SCREEN (ui/inventory.ts invRect), the service's on the left (gameRect). Everything is laid
## out as before, the panel from 0 and the other half from W; it is drawn and pressed with the two halves changed round.
## UPRIGHT (a screen taller than wide, a phone held upright: invRect's `H > W`): the panel along the bottom, as tall as half the
## screen (234 to 272 game pixels) and as wide as it, the other half above it. Laid out the same way, two halves side by side each
## _hw() wide and _vh() tall; drawn and pressed with the panel moved down under the other half.
func _tall() -> bool:
	return size.y > size.x


## (invRect) The panel's height upright, in picture pixels.
func _ph() -> float:
	return minf(size.y, clampf(floorf(size.y / K / 2.0), 234.0, 272.0) * K)


## Each half's width and height as they are laid out.
func _hw() -> float:
	return size.x if _tall() else size.x / 2.0


func _vh() -> float:
	return _ph() if _tall() else size.y


func _to_panel(p: Vector2) -> Vector2:
	if _tall():
		var top := size.y - _ph()
		return p - Vector2(0, top) if p.y >= top else p + Vector2(size.x, 0)
	var W := size.x / 2.0
	return Vector2(p.x - W if p.x >= W else p.x + W, p.y)


func _to_screen(p: Vector2) -> Vector2:
	if _tall():
		return p + Vector2(0, size.y - _ph()) if p.x < size.x else p - Vector2(size.x, 0)
	var W := size.x / 2.0
	return Vector2(p.x + W if p.x < W else p.x - W, p.y)


## Draw what follows in the panel's half (+1), the other half (-1), or as the screen is (0).
func _half(which: int) -> void:
	if _tall():
		_xf = Vector2(0.0, size.y - _ph()) if which == 1 else (Vector2(-size.x, 0.0) if which == -1 else Vector2.ZERO)
	else:
		_xf = Vector2(size.x / 2.0 * which, 0.0)
	draw_set_transform(_xf)


func _short(s: String, n: int) -> String:
	return s if s.length() <= n else s.substr(0, n - 1) + "."


func open_shop(id: String) -> void:
	shop = id
	if not visible:
		toggle()


## A service's half (ui/town.ts sideFrame): its ground, and its title in the friend's cyan along its top. Returns where its own
## things begin. Laid out in the other half's lay (from W: _half).
func _side_frame(title: String) -> float:
	var W := _hw()
	draw_rect(Rect2(W, 0, W, _vh()), PANEL)
	_top(Vector2(W + (SIDE_M + 1.0) * K, (3.0 + floorf((16.0 - 3.0 - 8.0) / 2.0) + 1.0) * K), title, NORMAL, PICK)
	return (2.0 + 16.0 + 2.0) * K


## THE VENDOR'S HALF (ui/town.ts vendorSide, keeperSide): his title; FOR SALE, his shelf, and BUY BACK, what has been sold him on
## this visit (TUNE.soldKept cells), each a cell ten to a row, the piece at its own size, its rim its rarity's colour; one he cannot
## afford darkened. A piece pointed at is read on its card; pressed, it is picked (its rim the friend's cyan, its card with BUY);
## pressed again, or carried across to the panel, or the right button on it, and it is bought. A piece of the bag sold to him the
## same way (game.ts sell). How it is used, along the bottom.
const SIDE_M := 6.0
var _shelf_pick := []
var _shelf_drag := {}
var _piece_drag := {}
## (WORD_ROOM, WORD_LEX: the tile that turns the bottom, and whether it shows every word; LEXICON, whether it is open, its panel)
const SWAP_W := 22.0
var _swap_r := Rect2()
var _all := false
var _lex_r := Rect2()
var _lex := false
var _lex_panel := Rect2()


func _shelf() -> void:
	var W := _hw()
	var body_y := _side_frame(str(SHOP_NAME.get(shop, shop)).to_upper())
	var cols := clampi(floori((W / K - 2.0 * SIDE_M + 2.0) / (PITCH / K)), 1, 10)
	var gx := W + SIDE_M * K
	var y := body_y
	var shelves := [["FOR SALE", "buy", loot.shops.get(shop, []), (loot.shops.get(shop, []) as Array).size()], ["BUY BACK", "buyback", loot.sold, int(loot._tune.get("soldKept", 30))]]
	for sh in shelves:
		_small(Vector2(gx, y), sh[0], DIM)
		y += 8.0 * K
		var items: Array = sh[2]
		for i in int(sh[3]):
			var r := Rect2(gx + (i % cols) * PITCH, y + floorf(float(i) / cols) * PITCH, CELL, CELL)
			var it = items[i] if i < items.size() else null
			var away: bool = it != null and not _shelf_drag.is_empty() and _shelf_drag["moving"] and _shelf_drag["what"] == [sh[1], i]
			var picked: bool = it != null and _shelf_pick == [sh[1], i]
			var lit: bool = picked or (it != null and r.has_point(_mouse))
			_gbox(r, BG2 if lit else SLOT, PICK if picked else (loot.RARITY_COLOR[int(it["rarity"])] if it != null else EDGE))
			if it != null and not away:
				_icon_at(it["icon"], r)
				_pips(it, r)
				var price: int = int(it["value"]) if sh[1] == "buy" else loot.sell_value(it)
				if loot.gold < price:
					draw_rect(Rect2(r.position + Vector2(K, K), r.size - Vector2(2.0 * K, 2.0 * K)), Color(Color("#6e1020"), 0.45))
			if it != null:
				_hits.append([r, sh[1], i, it])
		y += ceilf(float(sh[3]) / cols) * PITCH + 2.0 * K
	var grid_end := y - 4.0 * K
	# (what is picked: its card under the cells, in line with it, and what pressing it again does)
	if not _shelf_pick.is_empty():
		var items: Array = loot.shops.get(shop, []) if _shelf_pick[0] == "buy" else loot.sold
		var i: int = _shelf_pick[1]
		if i >= items.size():
			_shelf_pick = []
		else:
			var it: Dictionary = items[i]
			var price: int = int(it["value"]) if _shelf_pick[0] == "buy" else loot.sell_value(it)
			var label := "%s %d" % ["BUY" if _shelf_pick[0] == "buy" else "BUY BACK", price]
			var poor: bool = loot.gold < price
			var cw := 150.0 * K
			var cx := clampf(gx + (i % cols) * PITCH, gx, 2.0 * W - SIDE_M * K - cw)
			var h := _card(it, Vector2(cx, grid_end + 4.0 * K), true)
			var br := Rect2(cx + 5.0 * K, grid_end + 4.0 * K + h + 3.0 * K, minf(cw - 10.0 * K, _width(label, NORMAL) + 16.0 * K), 15.0 * K)
			if poor:
				_gbox(br, BOX, EDGE)
				_mid(br, label, NORMAL, FAINT)
				_top(Vector2(br.end.x + 5.0 * K, br.position.y + 5.0 * K), "You have %d gold" % loot.gold, SMALL, BAD)
			else:
				_gbutton(br, label, true, br.has_point(_mouse))
				_card_buttons.append([br, "shelf_take"])
	# how it is used, along the bottom; or, while a piece out of the bag is carried over this half, what letting go will do
	var foot := PF.wrap("RIGHT-CLICK A PIECE TO BUY OR SELL IT, OR DRAG IT ACROSS.", W / K - 2.0 * SIDE_M, "small")
	var fy := _vh() - 3.0 * K - foot.size() * 6.0 * K
	if not _piece_drag.is_empty() and _piece_drag["moving"] and _mouse.x >= W and int(_piece_drag["i"]) < loot.bag.size():
		var it: Dictionary = loot.bag[int(_piece_drag["i"])]
		_frame_line(Rect2(W + 2.0 * K, 2.0 * K, W - 4.0 * K, _vh() - 4.0 * K), PICK if sin(_t * 7.0) > 0.0 else PICK_LO)
		var line := "LET GO TO SELL: %d GOLD" % loot.sell_value(it)
		_top(Vector2(W + floorf((W - _width(line, NORMAL)) / 2.0), minf(fy - 2.0 * K, _vh() - 14.0 * K)), line, NORMAL, PICK)
	elif fy >= grid_end + 4.0 * K and _shelf_pick.is_empty() and _word == "" and _pending.is_empty():
		for k in foot.size():
			_top(Vector2(gx, fy + k * 6.0 * K), foot[k], SMALL, FAINT)


## A frame of one game pixel round `r` (ui/town.ts: where letting go will put what is carried).
func _frame_line(r: Rect2, c: Color) -> void:
	draw_rect(Rect2(r.position.x, r.position.y, r.size.x, K), c)
	draw_rect(Rect2(r.position.x, r.end.y - K, r.size.x, K), c)
	draw_rect(Rect2(r.position.x, r.position.y, K, r.size.y), c)
	draw_rect(Rect2(r.end.x - K, r.position.y, K, r.size.y), c)


# --- THE ALTAR OF THE WORDS (act1/holds.gd; ui/town.ts altarSide): a stronghold's altar, at its door, on the right half beside the
# gear screen as a vendor's shelf is. Its three hollows (the dark slot with a cyan rim of an empty word slot, a plus in it, lit
# while the word in hand could go in; a word laid in one, its rune stone, its name in its colour and what it does to every one
# within), a word laid by pressing it and then a hollow, or dragging it there; one laid taken back by pressing it; what it refuses
# said in the game's own words; and OPEN THE DOOR, pink, which burns them and breaks the door's seal. ---

## (the stronghold whose altar is open, and its holds.gd; -1: none)
var altar := -1
var altar_holds = null


func open_altar(n: int, h) -> void:
	shop = ""
	if not visible:
		toggle()
	altar = n
	altar_holds = h


func _altar_press(action: String, arg) -> void:
	if altar < 0 or altar_holds == null:
		return
	match action:
		"altar_open":
			if altar_holds.st[altar]["words"].is_empty():
				_say("Give the altar a word first")
			elif altar_holds.open_door(altar):
				toggle()
		"altar_take":
			altar_holds.take_back(altar, int(arg))
		"altar_put":
			if _word != "":
				var why: String = altar_holds.lay(altar, _word)
				if why != "":
					_say(why)
				else:
					_word = ""
			else:
				_say("Pick one of your words first, or drag it here")


func _altar_side(blink: bool) -> void:
	var x0 := _hw() + 12.0
	var w := _hw() - 24.0
	draw_rect(Rect2(x0 - 12, 0, w + 24, _vh()), PANEL)
	_text(Vector2(x0, 22), "ALTAR OF THE WORDS", 16, PICK)
	var y := 42.0
	# (STRONGHOLDS ON ANY ENDLESS LEVEL: an altar in a room, act1/altar_rooms.gd)
	var room: bool = altar_holds.get("altar_room") == true
	var intro := "The door opens only to words given to it. Lay up to three spare words in the altar: they are burned. Each past the first makes the cult within harder, and its runedust richer."
	if room:
		intro = "The cult's altar wakes only to words given to it. Lay up to three spare words in it: they are burned, fire bars the room's ways out, and the cult rises out of its floor. Each word past the first makes them harder, and the runedust richer."
	for l in _wrap(intro, w, 10):
		_text(Vector2(x0, y), l, 10, TEXT)
		y += 13.0
	y += 8.0
	_text(Vector2(x0, y), "GIVEN TO THE ALTAR" if room else "GIVEN TO THE DOOR", 9, DIM)
	y += 8.0
	var laid: Array = altar_holds.st[altar]["words"]
	var next := laid.size()
	var hang: String = _word if _word != "" and not _over.is_empty() and _over["kind"] == "altar" else ""
	var ok: bool = _word != "" and altar_holds.problem(altar, _word) == ""
	for i in 3:
		var r := Rect2(x0, y + i * (CELL + 12.0), CELL, CELL)
		var row := Rect2(x0 - 6.0, r.position.y - 6.0, w + 12.0, CELL + 12.0)
		var tx := x0 + CELL + 10.0
		if i < laid.size():
			_tile(r, laid[i], "name", {"stone": true, "lit": row.has_point(_mouse)})
			_text(Vector2(tx, r.position.y + 16), str(Words.word(laid[i])["name"]).to_upper(), 12, loot.word_color(laid[i]))
			_text(Vector2(tx, r.position.y + 32), "Every one within: %s" % _lower(_monster_text(laid[i])), 9, TEXT)
			_hits.append([row, "altar_take", i, null])
		else:
			var here := i == next
			var lit := here and ok
			_gbox(r, (PICK_BG if blink else Color(PICK_BG, 0.6)) if lit else INK, (PICK if blink else PICK_LO) if lit else EDGE)
			var c := r.get_center().floor()
			draw_rect(Rect2(c.x - 6, c.y, 14, 2), PICK if lit else EDGE)
			draw_rect(Rect2(c.x, c.y - 6, 2, 14), PICK if lit else EDGE)
			if here and hang != "" and not ok:
				_text(Vector2(tx, r.position.y + 24), altar_holds.problem(altar, hang), 11, BAD)
			elif here and laid.is_empty():
				_text(Vector2(tx, r.position.y + 24), "Click one of your words, then here. Or drag it here.", 9, FAINT)
			_hits.append([row, "altar_put", i, null])
	y += 3.0 * (CELL + 12.0) + 6.0
	if not laid.is_empty():
		var dust := int(_holds_dust(laid.size()))
		# (THE HALL AS IT IS NOW, its waves (holds.gd HOLD_WAVES), not the yellow pack of the old hall the game's altar still
		# promises: TO_LOOK_AT 32; his go-ahead of 22 Nov 2026, "Start all that")
		var within := "Within: a yellow pack of the cult's best. Reward: %d runedust, and gear." % dust
		var waves: Dictionary = altar_holds.Q.get("hold", {}).get("waves", {}) if altar_holds != null else {}
		if bool(waves.get("on", false)):
			within = "Within: %d waves of the floor's creatures and the cult, every one bearing these words. Reward: %d runedust, gear and gold." % [int(waves["n"]), dust]
			if room:
				within = "Then: %d waves of the floor's creatures and the cult rise here, every one bearing these words, and the fire falls when the last is dead. Reward: %d runedust, gear and gold." % [int(waves["n"]), dust]
		for l in _wrap(within, w, 10):
			_text(Vector2(x0, y), l, 10, PICK)
			y += 13.0
	var label := "WAKE THE ALTAR" if room else "OPEN THE DOOR"
	var bw := _width(label, NORMAL) + 48.0
	var br := Rect2(x0 + w - bw, _vh() - 52.0, bw, 30.0)
	var can := not laid.is_empty()
	_gbox(br, Color(PRESS, (0.35 if blink else 0.18) if can else 0.06), PRESS if can else FAINT)
	_mid(br, label, NORMAL, Color.WHITE if can else FAINT)
	_hits.append([br, "altar_open", null, null])


## (ui/town.ts: HOLD_TUNE.dust by how many words are laid, as the altar's half reads it)
func _holds_dust(n: int) -> float:
	var t: Array = altar_holds.T["dust"]
	return float(t[mini(n, t.size() - 1)])


static func _lower(t: String) -> String:
	return t.substr(0, 1).to_lower() + t.substr(1)


## One of the game's own pictures of the films (perils.gd holds the sheets), its top left at `at`, twice its size.
func _film_pic(name: String, at: Vector2) -> void:
	var P = load("res://scripts/perils.gd")
	var F = P._fx.get("films", {}).get(name)
	if F == null:
		return
	var L: Array = F["layers"].get("stand", [])
	if L.is_empty() or int(L[0]) < 0:
		return
	var q: Array = P._fx["pics"][int(L[0])]
	draw_texture_rect_region(P._sheet(int(q[0])), Rect2(at, Vector2(q[3], q[4])), Rect2(q[1], q[2], q[3], q[4]))


# --- THE WORDSMITH'S HALF (ui/trades.ts wordsmithSide, ui/meld.ts meldSide; game.ts meldProblem, meldWords): at the wordsmith in
# town, once the Meldstone has been given him (loot.gd `meld` "open"), the right half beside the gear screen as a vendor's shelf
# is, its title WORDSMITH and a tab at its right that turns it from one page to the other. Its first page, TRADE, is his words for
# sale and buying back (not in the Godot version yet: the page says so). Its second, MELDING: what melding is, the runedust he
# carries and what a meld takes; two hollows, a word laid in each by pressing it and then a hollow, or dragging it there, or TO THE
# MELD on its card (still his until melded; pressed again, taken back out), the game's refusals in its own words; "=" and what
# comes out: "?" (cyan once the two meld, faint until then), not shown before it is made, but for two of one word, whose next rank
# is plain and shown beforehand ("MAKES POWER II"); MELD: 1 RUNEDUST, pink when it can be pressed, why not in red beside it; the
# word just made in the third place, "A NEW WORD, FOUND" (or "MELDED", or "POWER II, MADE"), and its page read under it (ui/lexicon.ts
# drawWordPage, tight). Godot's plain letters and frames, as the rest of the gear screen. ---

## (the wordsmith's half open, and its page: "trade" or "meld"; "": not open. The two words laid in its hollows, null where one is
## empty: still his until melded: ui/panels.ts meldIn)
var wsmith := ""
var meld_in: Array = [null, null]
## (ui/meld.ts: what melding is, RANK2 on)
## (THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES, melds52.gd, while ON)
const WS_INTRO_52 := "Two runes and runedust go in; one rune comes out. Two different runes make a melded rune, found by trying. Two of the same make that rune a level higher."
const WS_INTRO := "Two damage words and runedust go in; one word comes out. Two different words make a melded word, found by trying. Two of the same make that word a rank higher."


## Opened at the wordsmith (town.gd): his half on its first page, nothing laid (main.ts: meldPage false, meldIn emptied).
func open_wordsmith() -> void:
	shop = ""
	altar = -1
	if not visible:
		toggle()
	wsmith = "trade"
	ws_pick = ""
	meld_in = [null, null]
	loot.melded = {}


## Where its things are: the two hollows and what comes out, a row under the runedust, on the right half.
func _ws_layout() -> Dictionary:
	var x0 := _hw() + 12.0
	var w := _hw() - 24.0
	var intro: Array = _wrap(WS_INTRO_52 if Melds52.ON else WS_INTRO, w, 10)
	var dust_y := 42.0 + intro.size() * 13.0 + 6.0
	var row_y := dust_y + 22.0
	var gap := 16.0 * K
	return {"x0": x0, "w": w, "intro": intro, "dust_y": dust_y, "row_y": row_y, "gap": gap,
		"hollows": [Rect2(x0, row_y, CELL, CELL), Rect2(x0 + CELL + gap, row_y, CELL, CELL)],
		"out": Rect2(x0 + 2.0 * (CELL + gap), row_y, CELL, CELL)}


func _ws_hollows() -> Array:
	return _ws_layout()["hollows"]


## A word laid in that is no longer his to give (set in an attack or burned since) comes out (ui/meld.ts; RANK II: the same word
## laid in twice takes two of it).
func _ws_tidy() -> void:
	for i in 2:
		var w = meld_in[i]
		if w != null and int(loot.words.get(w, 0)) < meld_in.count(w):
			meld_in[i] = null


## Why word `w` cannot be laid in, or "" if it can (ui/meld.ts problem): the game's own words.
func _ws_problem(w: String) -> String:
	if w == "":
		return ""
	var laid: int = meld_in.count(w)
	if int(loot.words.get(w, 0)) <= laid:
		return "No second one to give" if laid > 0 else "No spare word"
	if Words.is_rank(w):
		return "Rank II is the top, for now"
	if Words.is_meld(w):
		return "A melded word melds no further"
	# (THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES, melds52.gd: the runes of floors 1 to 10 go in; a second of one, a damage
	# rune's or one of the eleven's that rank up)
	if Melds52.ON and Words.ids().slice(0, 16).has(w):
		if meld_in.has(w) and str(Words.word(w)["kind"]) != "damage" and Melds52.makes(w, w) == "":
			return "This rune has no level 2"
		if meld_in.find(null) < 0:
			return "Both hollows are full"
		return ""
	# (VOLATILE'S MELDS: Volatile goes in too)
	var volt := w == "volatile"
	if str(Words.word(w)["kind"]) != "damage" and not volt:
		return "Only damage words and Volatile meld"
	if volt and meld_in.has(w):
		return "Volatile melds with a damage word"
	if meld_in.find(null) < 0:
		return "Both hollows are full"
	return ""


## Word `w` laid in the next free hollow: "" if it went in, else why not.
func _ws_lay(w: String) -> String:
	var no := _ws_problem(w)
	if no != "":
		return no
	var i := meld_in.find(null)
	meld_in[i] = w
	loot.melded = {}
	if RUNE_BAG.on:
		_ms.finish_now()
		_ms_drop[i] = _ms._now
	return ""


## (THE RUNE BAG at the wordsmith) A rune pressed there, or sent TO THE MELD from its card: laid in his next hollow.
func _ms_lay(w: String) -> void:
	var no := _ws_lay(w)
	if no != "":
		_say(no)


## The hint on a word's card while his half is melding (ui/meld.ts wordHint).
func _ws_hint(w: String) -> String:
	if Melds52.ON and Words.ids().slice(0, 16).has(w):
		return "The wordsmith melds two different runes into one, or two of one rune into its next level."
	if w == "volatile":
		return "The wordsmith melds Volatile with a damage word into one."
	if str(Words.word(w)["kind"]) == "damage":
		return "The wordsmith melds two damage words into one, or two of one word into its next rank."
	return ""


func _ws_press(action: String, arg) -> void:
	if wsmith == "":
		return
	_ws_tidy()
	match action:
		"ws_tab":
			wsmith = "meld" if wsmith == "trade" else "trade"
			ws_pick = ""
		"ws_cell":
			# (one of his words pressed: it is read, with the button that buys it; a second press does NOT buy: ui/trades.ts)
			_word = ""
			_pending = {}
			_look = null
			_result = {}
			ws_pick = "" if _ws_cell_word(arg) == null else str(arg)
		"ws_buy":
			var o := _ws_offer(ws_pick)
			if not o.is_empty():
				var why: String = "Not enough gold" if loot.gold < int(o["cost"]) else _ws_act(ws_pick)
				_say(why)
				if why == "":
					ws_pick = ""
		"ws_sell":
			if _word != "":
				var why: String = loot.sell_word(_word)
				_say(why)
				if why == "":
					_word = ""
		"ws_hollow":
			var i := int(arg)
			if meld_in[i] != null:
				# (a word laid in: pressing it takes it out again)
				meld_in[i] = null
				_word = ""
			elif _word != "":
				var no := _ws_lay(_word)
				if no != "":
					_say(no)
				else:
					_word = ""
			else:
				_say("Pick one of your runes first, or drag it here" if Melds52.ON else "Pick one of your damage words first, or drag it here")
		"ws_to_meld":
			var no := _ws_lay(_word)
			if no != "":
				_say(no)
			else:
				_word = ""
		"ws_meld":
			# (THE MELDING STONE: one meld at a time is played out)
			if RUNE_BAG.on:
				_ms.finish_now()
			_word = ""
			var a: String = meld_in[0] if meld_in[0] != null else ""
			var b: String = meld_in[1] if meld_in[1] != null else ""
			var no: String = loot.meld_words(a, b, RUNE_BAG.on)
			_say(no)
			if no == "":
				meld_in = [null, null]
				if RUNE_BAG.on:
					_ms.start(a, b, str(loot.melded["word"]), bool(loot.melded["first"]))


## Why the two laid in cannot be melded now, or "" (game.ts meldProblem).
func _ws_why() -> String:
	return loot.meld_problem(meld_in[0] if meld_in[0] != null else "", meld_in[1] if meld_in[1] != null else "")


func _ws_side(blink: bool) -> void:
	_ws_tidy()
	var L := _ws_layout()
	var x0: float = L["x0"]
	var w: float = L["w"]
	var stone: bool = RUNE_BAG.on and wsmith == "meld"
	if stone:
		# (THE MELDING STONE: the whole half; his name and the trade's tab over it)
		_ms.draw(x0 - 12.0, w + 24.0, _vh(), _hits)
	else:
		draw_rect(Rect2(x0 - 12, 0, w + 24, _vh()), PANEL)
	_text(Vector2(x0, 22), "WORDSMITH", 16, PICK)
	var tw := _width("WORDSMITH", 16)
	if wsmith == "meld":
		_text(Vector2(x0 + tw + 10, 22), "MELDING", 10, DIM)
	# (the tab at the right of his title that turns his half to its other page; MELD only once the Meldstone is his)
	var label := "TRADE" if wsmith == "meld" else "MELD"
	if wsmith == "meld" or loot.meld == "open":
		var bw := _width(label, SMALL) + 12.0 * K
		var tab := Rect2(x0 + w - bw, 6, bw, 22)
		_gbox(tab, HOT if wsmith == "trade" else BOX, PICK if wsmith == "trade" else EDGE)
		_mid(tab, label, SMALL, PICK if wsmith == "trade" else TEXT)
		_hits.append([tab, "ws_tab", null, null])
	if wsmith == "trade":
		_ws_trade(blink, x0, w)
		return
	if stone:
		return
	# what melding is
	var y: float = 42.0
	for l in L["intro"]:
		_text(Vector2(x0, y), l, 10, TEXT)
		y += 13.0
	# the runedust carried, and what a meld takes
	var dc := Color(str(Words.data()["melds"]["dust"]))
	var dy: float = L["dust_y"]
	_film_pic("rd_icon", Vector2(x0, dy))
	var dt := "%d RUNEDUST" % loot.dust()
	_text(Vector2(x0 + 12.0 * K, dy + 16), dt, 11, dc)
	_text(Vector2(x0 + 12.0 * K + _width(dt, 11) + 16, dy + 16), "A MELD TAKES %d" % loot.meld_cost(), 10, DIM)
	# the two hollows, and what comes out
	var hol: Array = L["hollows"]
	var nx: int = meld_in.find(null)
	var hand: String = _word
	var ok: bool = hand != "" and _ws_problem(hand) == ""
	var hang: String = hand if not _over.is_empty() and _over["kind"] == "meld" and not _drag.is_empty() and _drag["moving"] else ""
	for i in 2:
		var r: Rect2 = hol[i]
		var laid = meld_in[i]
		if laid != null:
			_tile(r, laid, "name", {"stone": true, "lit": r.has_point(_mouse)})
		elif i == nx and hang != "" and ok:
			draw_rect(r, PICK_BG)
			_tile(r, hang, "name", {"stone": true, "lit": true, "edge": Color.WHITE})
		else:
			# (an empty hollow: a dark notch with a plus, lit while the word in hand could go in)
			var lit := i == nx and ok
			_gbox(r, (PICK_BG if blink else Color(PICK_BG, 0.6)) if lit else INK, (PICK if blink else PICK_LO) if lit else EDGE)
			var c := r.get_center().floor()
			draw_rect(Rect2(c.x - 6, c.y, 14, 2), PICK if lit else EDGE)
			draw_rect(Rect2(c.x, c.y - 6, 2, 14), PICK if lit else EDGE)
		_hits.append([r, "ws_hollow", i, null])
	var gap: float = L["gap"]
	var mid: float = float(L["row_y"]) + CELL / 2.0
	_mid(Rect2(x0 + CELL, mid - 8, gap, 16), "+", NORMAL, DIM)
	_mid(Rect2(x0 + 2.0 * CELL + gap, mid - 8, gap, 16), "=", NORMAL, DIM)
	var out: Rect2 = L["out"]
	var a = meld_in[0]
	var b = meld_in[1]
	var why := _ws_why()
	var made: Dictionary = loot.melded
	# (RANK II: two of the same word: what it makes is plain, and is shown before it is made)
	var up: String = Words.rank_up(a) if made.is_empty() and a != null and a == b else ""
	if not made.is_empty():
		_tile(out, made["word"], "name", {"stone": true, "lit": true, "edge": loot.word_color(made["word"])})
	elif up != "":
		_gbox(out, INK, EDGE)
		_icon("word:" + up, Rect2(out.position + ((out.size - Vector2(12.0 * K, 12.0 * K)) / 2.0).floor(), Vector2(12.0 * K, 12.0 * K)), 0.45 if why != "" else 0.85)
	else:
		_gbox(out, INK, EDGE)
		_mid(out, "?", NORMAL, dc if a != null and b != null and why == "" else FAINT)
	# under them: the word just made, or what two of a word make, or how it is done (none while a word of his is being read)
	var reading := _word != "" or not _pending.is_empty() or not _result.is_empty() or _look != null
	var ty: float = float(L["row_y"]) + CELL + 14.0
	var label2 := "MELD: %d RUNEDUST" % loot.meld_cost()
	var bwid := _width(label2, NORMAL) + 32.0
	var br := Rect2(x0 + w - bwid, _vh() - 52.0, bwid, 30.0)
	var room: float = br.position.y - 8.0
	if not made.is_empty() and not reading:
		var mw: String = made["word"]
		var title: String = ("%s, MADE" % str(Words.word(mw)["name"]).to_upper()) if Words.is_rank(mw) else ("A NEW WORD, FOUND" if made["first"] else "MELDED")
		_text(Vector2(x0, ty), title, 9, dc if made["first"] else DIM)
		_ws_page(mw, x0, ty + 8.0, w, room)
	elif up != "" and not reading:
		_text(Vector2(x0, ty), "MAKES %s" % str(Words.word(up)["name"]).to_upper(), 10, loot.word_color(up))
		var yy := ty + 16.0
		for l in _wrap(str(Words.word(up)["about"]), w, 10):
			if yy + 13.0 > room:
				break
			_text(Vector2(x0, yy), l, 10, TEXT)
			yy += 13.0
		var ft := str(Words.word(up)["frontText"])
		for l in _wrap("In front and behind, %s%s" % [ft.substr(0, 1).to_lower(), ft.substr(1)], w, 10):
			if yy + 13.0 > room:
				break
			_text(Vector2(x0, yy), l, 10, DIM)
			yy += 13.0
	elif not reading and a == null and b == null:
		_text(Vector2(x0, ty + 4), "Click a rune of yours, then a hollow. Or drag it here." if Melds52.ON else "Click a damage word of yours, then a hollow. Or drag it here.", 9, FAINT)
	# the button, and why it cannot be pressed yet
	if why != "" and a != null and b != null:
		_text(Vector2(br.position.x - 8.0 - _width(why, 10), br.position.y + 19), why, 10, BAD)
	var can := why == ""
	_gbox(br, Color(PRESS, (0.35 if blink else 0.18) if can else 0.06), PRESS if can else FAINT)
	_mid(br, label2, NORMAL, Color.WHITE if can else FAINT)
	_hits.append([br, "ws_meld", null, null])


# --- ITS FIRST PAGE, HIS TRADE IN WORDS (ui/trades.ts wordsmithSide): his shelf, "HIS WORDS: <price> GOLD EACH", the few words
# he has for sale on this visit (a place bought from: "SOLD"); under it, BUY BACK, the words sold him on this visit, each to be
# had back for what he paid. One of his pressed is read (its page), with the button that buys it (a second press does not buy:
# a word is a floor's whole purse; the right button buys at once). One he asks more for than the hero has is dimmed. A spare
# word of the hero's is sold from its card (SELL) or carried over to this half and let go. ---

## (the word of his picked: "word:<i>" on his shelf, "wsold:<i>" among those sold him; "": none)
var ws_pick := ""


## The word in cell `id`, or null.
func _ws_cell_word(id) -> Variant:
	var p := str(id).split(":")
	if p.size() != 2:
		return null
	var i := int(p[1])
	var list: Array = loot.word_stock if p[0] == "word" else loot.words_sold
	return list[i] if i >= 0 and i < list.size() else null


## What having the word in cell `id` costs, and its button's label (ui/trades.ts offer).
func _ws_offer(id: String) -> Dictionary:
	if _ws_cell_word(id) == null:
		return {}
	if id.begins_with("wsold"):
		return {"label": "BUY BACK: %d GOLD" % loot.word_sell_value(), "cost": loot.word_sell_value()}
	return {"label": "BUY: %d GOLD" % loot.word_price(), "cost": loot.word_price()}


func _ws_act(id: String) -> String:
	var i := int(id.split(":")[1])
	return loot.buy_back_word(i) if id.begins_with("wsold") else loot.buy_word(i)


## The right button on one of his: bought at once.
func _ws_quick(id) -> void:
	if _ws_cell_word(id) == null:
		return
	_say(_ws_act(str(id)))
	ws_pick = ""


## Where his shelf, BUY BACK and its cells lie.
func _ws_trade_layout(x0: float, w: float) -> Dictionary:
	var shelf_y := 50.0
	var sold_cap := shelf_y + CELL + 10.0
	var sold_y := sold_cap + 16.0
	var cols := maxi(1, int(floorf((w + 2.0) / PITCH)))
	var kept := int(loot._tune["wordsSoldKept"])
	var cells: Array = []
	for i in loot.word_stock.size():
		cells.append({"id": "word:%d" % i, "r": Rect2(x0 + i * PITCH, shelf_y, CELL, CELL), "bought": false})
	for i in kept:
		cells.append({"id": "wsold:%d" % i, "r": Rect2(x0 + (i % cols) * PITCH, sold_y + floorf(i / float(cols)) * PITCH, CELL, CELL), "bought": true})
	var end := sold_y + ceilf(kept / float(cols)) * PITCH - 2.0
	return {"cap": 42.0, "sold_cap": sold_y - 5.0, "cells": cells, "page_y": end + 10.0, "next": cells[loot.word_stock.size() + mini(loot.words_sold.size(), kept - 1)]["r"]}


## Where the next word he is sold will lie.
func _ws_next_sold() -> Rect2:
	var L := _ws_layout()
	return _ws_trade_layout(L["x0"], L["w"])["next"]


func _ws_trade(blink: bool, x0: float, w: float) -> void:
	var T := _ws_trade_layout(x0, w)
	if ws_pick != "" and (_ws_cell_word(ws_pick) == null or _word != "" or not _pending.is_empty() or _look != null):
		ws_pick = ""
	_text(Vector2(x0, T["cap"]), "HIS WORDS: %d GOLD EACH" % loot.word_price(), 10, DIM)
	_text(Vector2(x0, T["sold_cap"]), "BUY BACK", 10, DIM)
	for c: Dictionary in T["cells"]:
		var r: Rect2 = c["r"]
		var wd = _ws_cell_word(c["id"])
		if wd == null:
			_gbox(r, INK, EDGE)
			# (a place on his shelf that is empty is a word that has been bought)
			if not c["bought"]:
				_mid(r, "SOLD", SMALL, FAINT)
			continue
		var on: bool = ws_pick == c["id"]
		_tile(r, wd, "name", {"stone": true, "lit": on or r.has_point(_mouse), "edge": PICK if on else null})
		# (one he asks more for than the hero has is dimmed)
		if loot.gold < int(_ws_offer(c["id"])["cost"]):
			draw_rect(r.grow(-1.0), Color(INK, 0.45))
		_hits.append([r, "ws_cell", c["id"], null])
	var page_y: float = T["page_y"]
	# a word of the hero's carried over this half: what letting go will do
	if not _over.is_empty() and _over["kind"] == "sell" and not _drag.is_empty() and _drag["moving"]:
		var half := Rect2(_hw() + 2.0, 2.0, _hw() - 4.0, _vh() - 4.0)
		draw_rect(half, PICK if blink else PICK_LO, false, 2.0)
		var nr: Rect2 = T["next"]
		_gbox(nr, PICK_BG, PICK)
		_mid(Rect2(x0, page_y + 6.0, w, 16.0), "LET GO TO SELL: %d GOLD" % loot.word_sell_value(), NORMAL, PICK)
		return
	if ws_pick != "":
		# the word picked: its page, and the button that buys it
		var o := _ws_offer(ws_pick)
		var bwid := _width(o["label"], NORMAL) + 32.0
		var br := Rect2(x0 + w - bwid, _vh() - 52.0, bwid, 30.0)
		var poor: bool = loot.gold < int(o["cost"])
		_ws_page(_ws_cell_word(ws_pick), x0, page_y, w, br.position.y - 6.0)
		if poor:
			var yh := "YOU HAVE %d" % loot.gold
			_text(Vector2(br.position.x - 8.0 - _width(yh, 10), br.position.y + 19), yh, 10, BAD)
		_gbox(br, Color(PRESS, (0.35 if blink else 0.18) if not poor else 0.06), PRESS if not poor else FAINT)
		_mid(br, o["label"], NORMAL, Color.WHITE if not poor else FAINT)
		_hits.append([br, "ws_buy", null, null])
		return
	# nothing of his picked: how the trade is done
	if _word != "" or not _pending.is_empty() or not _result.is_empty():
		return
	var y := page_y + 4.0
	for t in [["Click one of his words to read it. Right-click buys it.", TEXT], ["To sell a spare word of yours, click it and press SELL, or drag it here.", TEXT], ["Burn a word into your gear as you always have: on your side of the screen.", FAINT]]:
		for l in _wrap(t[0], w, 10):
			if y + 13.0 > _vh() - 8.0:
				return
			_text(Vector2(x0, y + 9.0), l, 10, t[1])
			y += 13.0
		y += 4.0


## A made word's page under it (ui/lexicon.ts drawWordPage, tight): its name and what it grows with; what it is; ON AN ATTACK, in
## (ui/lexicon.ts) A word's ON A DUNGEON, once known there: what it does to every monster there (a melded or ranked word's, its
## two words' and its twist: foe_words.gd page, and that it counts as two words).
func _dungeon_line(w: String, k: Dictionary, unknown: String) -> String:
	# (THE DOOR WORDS, door_words.gd: what each does there, known from the first)
	if DoorWords.is_door(w):
		return "%s; no monster in it carries it. %s" % [DoorWords.line(w), _burn_reward(1)]
	if not k.get("dungeon", false):
		return unknown
	var FW := preload("res://scripts/foe_words.gd")
	var meld: bool = FW.is_meld(w) or FW.is_rank(w)
	if DOOR_GOLD_LINE and loot.DOOR_GOLD_WORDS.has(w):
		return "%d%% increased gold found in it; no monster in it carries it. %s" % [roundi(loot.DOOR_GOLD), _burn_reward(1)]
	if DOOR_GOLD_LINE and loot.DOOR_MF_WORDS.has(w):
		return "%d%% increased magic find in it; no monster in it carries it. %s" % [roundi(loot.DOOR_MF), _burn_reward(1)]
	var t: String = FW.page(w) if meld else str(Words.word(w).get("monsterText", ""))
	return "Every monster in it: %s%s %s" % [t.substr(0, 1).to_lower(), t.substr(1), ("Counts as two words: " if meld else "") + _burn_reward(2 if meld else 1)]


## What words burned into a dungeon give, `n` of them, in the game's own way of saying it (his words, 24 Nov 2026: “"it's _____ 50%" is
## not the way you describe anything in an arpg.  It would be "50% increased gold found"”, and “Likelier words is bad too”): loot.gd
## on_kill (items and words, 30% each), magic_find (25 each), gain_xp (10% each).
static func _burn_reward(n: float) -> String:
	return "%d%% increased item drops, %d%% increased word drops, %d%% increased magic find, %d%% increased experience." % [roundi(30 * n), roundi(30 * n), roundi(25 * n), roundi(10 * n)]


## front and behind (known once made); ON GEAR (what it becomes there, once he has burned it into a piece); ON A DUNGEON (not in
## the Godot version: undiscovered). A part with no room left is not drawn, nor those after it.
func _ws_page(w: String, x: float, y: float, pw: float, end: float) -> void:
	var wd: Dictionary = Words.word(w)
	var k: Dictionary = loot._know(w)
	var nw := _width(str(wd["name"]).to_upper(), NORMAL)
	_top(Vector2(x, y), str(wd["name"]).to_upper(), NORMAL, loot.word_color(w))
	_top(Vector2(x + nw + 8.0 * K, y + 2.0 * K), str(_hud["words"][w]["grows"]), SMALL, DIM)
	y += 11.0 * K
	var unknown := "Undiscovered."
	var page: Dictionary = Words.data()["page"][w]
	var gear: String = (" ".join(PackedStringArray(page["gearMana"] if loot.limit == "mana" and page.has("gearMana") else page["gear"])) + " " + str(page["note"])) if k["gear"] else unknown
	# (THE DOOR WORDS, door_words.gd: no attack and no gear takes one, said from the first; what it does to a dungeon)
	if DoorWords.is_door(w):
		k = k.duplicate()
		k["front"] = true
		k["behind"] = true
		k["gear"] = true
		k["dungeon"] = true
		gear = str(page["gear"][0])
	var parts: Array = [
		[0.0, [[str(wd["about"]), Color.WHITE, NORMAL, 0.0]]],
		[4.0 * K, [["ON AN ATTACK", PICK, SMALL, 0.0],
			[str(wd["frontText"]) if DoorWords.is_door(w) else ("In front (%s ...): %s" % [str(wd["front"]).to_upper(), wd["frontText"]] if k["front"] else "In front: " + unknown), TEXT if k["front"] else FAINT, SMALL, 4.0 * K]]
			+ ([] if DoorWords.is_door(w) else [["Behind (... %s): %s" % [str(wd["behind"]).replace("of ", "OF ").to_upper(), wd["behindText"]] if k["behind"] else "Behind: " + unknown, TEXT if k["behind"] else FAINT, SMALL, 4.0 * K]])],
		[2.0 * K, [["ON GEAR", PICK, SMALL, 0.0], [gear, TEXT if k["gear"] else FAINT, SMALL, 4.0 * K]]],
		[2.0 * K, [["ON A DUNGEON", PICK, SMALL, 0.0], [_dungeon_line(w, k, unknown), TEXT if k.get("dungeon", false) else FAINT, SMALL, 4.0 * K]]],
	]
	for part in parts:
		var rows: Array = []
		for r in part[1]:
			for l in _wrap(r[0], pw - r[3], r[2]):
				rows.append([l, r[1], r[2], r[3]])
		var h := 0.0
		for r in rows:
			h += 6.0 * K if r[2] <= SMALL else 9.0 * K
		if y + part[0] + h - 1.0 > end:
			return
		y += part[0]
		for r in rows:
			_top(Vector2(x + r[3], y), r[0], r[2], r[1])
			y += 6.0 * K if r[2] <= SMALL else 9.0 * K


# =====================================================================================================================
# THE TOWN'S OTHER SERVICES, each its half beside the gear screen as a vendor's shelf is (Godot's plain letters and frames, as
# the rest of the gear screen):
#   THE STRANGER (ui/trades.ts gambleSide): "Pay, and take what comes"; A THROW FOR: the kinds of piece he throws for, each its
#     Normal picture, dimmed where a throw costs more than the hero has; one pressed: its name and THROW: <price> GOLD (why not
#     in red: YOU HAVE <gold>, BAG IS FULL); the right button throws at once; what the last throw brought: YOU GOT, its name in
#     the colour of what it is, "A <plain/magic/rare> piece. It is in your bag." (loot.gd gamble)
#   THE STASH (ui/town.ts stashSide): KEPT FOR LATER CHARACTERS, its places in rows of nine; a piece of the bag pressed is put
#     away, one of the stash's pressed is taken out (loot.gd stash_item, unstash_item).
#   THE LEXICON (ui/lexicon.ts lexiconSide, ui/lexicon28.ts 'groups'): LEXICON, N OF 28 FOUND; its five pages by what the words
#     do, a tab each; the open page's words, each its stone with four pips for what is known of it (in front, behind, on gear,
#     on a dungeon), or "?" not yet found; the word that is open, its page; along the bottom KEPT FOR YOUR NEXT CHARACTER, the
#     words kept in the book (ONE MORE: <price> GOLD), one pressed taken out (TAKE IT OUT); a spare word of the hero's kept from
#     its card (KEEP: <price> GOLD) (loot.gd keep_cost, deposit_word, withdraw_word).
# =====================================================================================================================

## (the service whose half is open: "stranger", "stash", "lexicon"; "": none)
var svc := ""
var gm_pick := -1
## (THE ROYAL CARDS: the stranger's half on his second page, his cards (ui/royal_cards.ts cardsSide), and the hand picked there)
var gm_cards := false
var cd_pick := ""
var lx_tab := 0
var lx_sel := ""
var lx_pick := ""
const RARITY_WORD := ["plain", "magic", "rare", "unique"]


## Opened at a stranger's, a stash's or a Lexicon's place in town (town.gd).
func open_service(kind: String) -> void:
	shop = ""
	altar = -1
	wsmith = ""
	if not visible:
		toggle()
	svc = kind
	gm_pick = -1
	gm_cards = false
	cd_pick = ""
	lx_pick = ""
	if kind == "lexicon":
		lx_sel = ""
		for p in Words.data()["lexPages"]:
			for w in p["words"]:
				if lx_sel == "" and _lx_found(w):
					lx_sel = w
		lx_tab = _lx_page_of(lx_sel) if lx_sel != "" else 0


func _lx_found(w: String) -> bool:
	return Words.data()["words"].has(w) and bool(loot._know(w)["found"])


func _lx_page_of(w: String) -> int:
	var pages: Array = Words.data()["lexPages"]
	for i in pages.size():
		if (pages[i]["words"] as Array).has(w):
			return i
	return 0


func _svc_press(action: String, arg) -> void:
	match action:
		"gm_kind":
			gm_pick = int(arg)
			_word = ""
		"gm_tab":
			gm_cards = not gm_cards
			cd_pick = ""
			gm_pick = -1
		"cd_hand":
			cd_pick = str(arg)
			_word = ""
		"cd_in":
			for h in loot.hands():
				if RoyalCards.key_of(h) == cd_pick:
					var why: String = loot.hand_problem(h)
					if why == "":
						why = loot.hand_in(h)
					_say(why)
					if why == "":
						cd_pick = ""
					break
		"gm_throw":
			if gm_pick >= 0:
				var why: String = loot.gamble_problem(gm_pick)
				_say(why if why != "" else loot.gamble(gm_pick))
		"svc_swap":
			open_service(str(arg))
		"st_take":
			_say(loot.unstash_item(int(arg)))
		"lx_tab":
			lx_tab = int(arg)
			lx_pick = ""
			for w in Words.data()["lexPages"][lx_tab]["words"]:
				if _lx_found(w):
					lx_sel = w
					break
		"lx_word":
			lx_sel = str(arg)
			lx_pick = ""
		"lx_kept":
			lx_pick = str(arg)
			_word = ""
			if _lx_found(lx_pick):
				lx_sel = lx_pick
				lx_tab = _lx_page_of(lx_pick)
		"lx_take":
			if lx_pick != "":
				var why: String = loot.withdraw_word(lx_pick)
				_say(why)
				if int(loot.lexicon.get(lx_pick, 0)) <= 0:
					lx_pick = ""
		"lx_keep":
			if _word != "":
				var why: String = loot.deposit_word(_word)
				_say(why)
				if why == "" and int(loot.words.get(_word, 0)) <= 0:
					_word = ""


func _svc_side(blink: bool) -> void:
	var x0 := _hw() + 12.0
	var w := _hw() - 24.0
	draw_rect(Rect2(x0 - 12, 0, w + 24, _vh()), PANEL)
	match svc:
		"stranger":
			_gm_side(blink, x0, w)
		"stash":
			_st_side(x0, w)
		"lexicon":
			_lx_side(blink, x0, w)
		"gate":
			_gate_side(blink, x0, w)


## What a word does on a monster, for the gate's and the altar's lines: its own text; a Rank II, which has none of its own, its rune's,
## half as strong again (on a monster it lays its rune half as strong again: foe_words.gd).
func _monster_text(w: String) -> String:
	var t := str(Words.word(w).get("monsterText", ""))
	if t == "" and FoeWords.is_rank(w):
		var of: String = FoeWords.parts_of(w)[0]
		t = str(Words.word(of).get("monsterText", "")).trim_suffix(".") + ", half as strong again."
	return t


## (THE RIM'S DOOR: the line naming what each burned rune drops more often, on the gate's page. On at his word to its picture,
## 23 Nov 2026: “K”)
static var DOOR_ODDS_LINE := true
## (THE RIM'S DOOR AND PLUNDERING: the line saying what Plundering burned in does, more gold on the level and carried by none: loot.gd
## DOOR_GOLD; and Greed's, more magic find: loot.gd DOOR_MF. ON at his “Yes” to their pictures, 24 Nov 2026.)
static var DOOR_GOLD_LINE := true

# --- THE SHAFT'S RIM'S GATE (ui/town.ts gateSide; game.ts planWord, unplanWord, planProblem, enterEndless): its three sockets, the
# words burned into the next endless level, what they add up to, and the way in (ENTER ENDLESS N). A word laid by pressing it and
# then a socket, or dragging it there; pressed again, taken back (free until he goes in).

func _gate_side(blink: bool, x0: float, w: float) -> void:
	var where: String = main.endless_name(main.endless).to_upper()
	_text(Vector2(x0, 22), "GATE: %s" % where, 16, PICK)
	var y := 42.0
	for l in _wrap("Burn up to three spare words into this dungeon. They are used up.", w, 10):
		_text(Vector2(x0, y), l, 10, TEXT)
		y += 13.0
	y += 8.0
	_text(Vector2(x0, y), "BURNED INTO THE DUNGEON", 9, DIM)
	y += 8.0
	var laid: Array = main.plan
	var next := laid.size()
	var hang: String = _word if _word != "" and not _over.is_empty() and _over["kind"] == "gate" else ""
	var ok: bool = _word != "" and main.plan_problem(_word) == ""
	for i in 3:
		var r := Rect2(x0, y + i * (CELL + 12.0), CELL, CELL)
		var row := Rect2(x0 - 6.0, r.position.y - 6.0, w + 12.0, CELL + 12.0)
		var tx := x0 + CELL + 10.0
		if i < laid.size():
			_tile(r, laid[i], "name", {"stone": true, "lit": row.has_point(_mouse)})
			_text(Vector2(tx, r.position.y + 16), str(Words.word(laid[i])["name"]).to_upper(), 12, loot.word_color(laid[i]))
			if DoorWords.is_door(laid[i]):
				_text(Vector2(tx, r.position.y + 32), "%s No monster carries it." % DoorWords.line(str(laid[i]), true), 9, TEXT)
			elif DOOR_GOLD_LINE and loot.DOOR_GOLD_WORDS.has(str(laid[i])):
				_text(Vector2(tx, r.position.y + 32), "%d%% increased gold found on this level. No monster carries it." % roundi(loot.DOOR_GOLD), 9, TEXT)
			elif DOOR_GOLD_LINE and loot.DOOR_MF_WORDS.has(str(laid[i])):
				_text(Vector2(tx, r.position.y + 32), "%d%% increased magic find on this level. No monster carries it." % roundi(loot.DOOR_MF), 9, TEXT)
			else:
				_text(Vector2(tx, r.position.y + 32), "Every monster: %s" % _lower(_monster_text(laid[i])), 9, TEXT)
			_hits.append([row, "gate_take", i, null])
		else:
			var here := i == next
			var lit := here and ok
			_gbox(r, (PICK_BG if blink else Color(PICK_BG, 0.6)) if lit else INK, (PICK if blink else PICK_LO) if lit else EDGE)
			var c := r.get_center().floor()
			draw_rect(Rect2(c.x - 6, c.y, 14, 2), PICK if lit else EDGE)
			draw_rect(Rect2(c.x, c.y - 6, 2, 14), PICK if lit else EDGE)
			if here and hang != "" and not ok:
				_text(Vector2(tx, r.position.y + 24), main.plan_problem(hang), 11, BAD)
			elif here and laid.is_empty():
				_text(Vector2(tx, r.position.y + 24), "Click one of your words, then here. Or drag it here.", 9, FAINT)
			_hits.append([row, "gate_put", i, null])
	y += 3.0 * (CELL + 12.0) + 6.0
	var n: float = FoeWords.words_weight(laid)
	if n > 0:
		for l in _wrap("Reward: " + _burn_reward(n), w, 10):
			_text(Vector2(x0, y), l, 10, PICK)
			y += 13.0
		# (THE RIM'S DOOR: what is burned in drops more, each rune by how many times: loot.gd tilt_word)
		if DOOR_ODDS_LINE:
			var B: Dictionary = loot.burned_runes(laid)
			var bits: Array = []
			for k in B:
				if not loot.DOOR_WORDS.has(k):
					bits.append("%d%% increased %s drops" % [200 * int(B[k]), str(Words.word(k)["name"]).to_upper()])
			if not bits.is_empty():
				for l in _wrap("%s." % ", ".join(PackedStringArray(bits)), w, 10):
					_text(Vector2(x0, y), l, 10, PICK)
					y += 13.0
	_text(Vector2(x0, y), "Its boss waits at the end. %s." % main.ENDLESS_WARN, 10, BAD)
	_svc_button("ENTER %s" % where, x0, w, "gate_enter", true, blink)


func _gate_press(action: String, arg) -> void:
	match action:
		"gate_take":
			main.unplan_word(int(arg))
		"gate_put":
			if _word != "":
				var why: String = main.plan_word(_word)
				if why != "":
					_say(why)
				else:
					_word = ""
			else:
				_say("Pick one of your words first, or drag it here")
		"gate_enter":
			toggle()
			main.enter_endless()


func _svc_button(label: String, x0: float, w: float, action: String, can: bool, blink: bool) -> Rect2:
	var bwid := _width(label, NORMAL) + 32.0
	var br := Rect2(x0 + w - bwid, _vh() - 52.0, bwid, 30.0)
	_gbox(br, Color(PRESS, (0.35 if blink else 0.18) if can else 0.06), PRESS if can else FAINT)
	_mid(br, label, NORMAL, Color.WHITE if can else FAINT)
	_hits.append([br, action, null, null])
	return br


# --- THE STRANGER ---

func _gm_side(blink: bool, x0: float, w: float) -> void:
	_text(Vector2(x0, 22), "THE STRANGER", 16, PICK)
	# (THE ROYAL CARDS: the tab at the right of his title that turns his half to his cards page, once a card is held: ui/royal_cards.ts
	# cardsTab, cardsOpen)
	if _cards_open():
		var label := "GAMBLE" if gm_cards else "CARDS"
		var tw := _width(label, SMALL) + 18.0
		var tr := Rect2(x0 + w - tw, 8.0, tw, 20.0)
		_gbox(tr, HOT if tr.has_point(_mouse) else INK, EDGE)
		_mid(tr, label, SMALL, TEXT)
		_hits.append([tr, "gm_tab", null, null])
		if gm_cards:
			_cd_side(blink, x0, w)
			return
	else:
		gm_cards = false
	var y := 42.0
	for l in _wrap("Pay, and take what comes: most often plain, sometimes better.", w, 10):
		_text(Vector2(x0, y), l, 10, TEXT)
		y += 13.0
	_text(Vector2(x0, y + 4.0), "A THROW FOR", 10, DIM)
	var gy := y + 12.0
	var cols := maxi(1, mini(8, int(floorf((w + 2.0) / PITCH))))
	var kinds: Array = loot.gamble_kinds()
	for k in kinds.size():
		var r := Rect2(x0 + (k % cols) * PITCH, gy + floorf(k / float(cols)) * PITCH, CELL, CELL)
		var on := k == gm_pick
		_gbox(r, HOT if on or r.has_point(_mouse) else INK, PICK if on else EDGE)
		_icon(str(kinds[k]["icon"]), r.grow(-K))
		if loot.gold < loot.gamble_price(k):
			draw_rect(r.grow(-1.0), Color(INK, 0.45))
		_hits.append([r, "gm_kind", k, null])
	y = gy + ceilf(kinds.size() / float(cols)) * PITCH + 8.0
	if _word != "" or not _pending.is_empty() or not _result.is_empty():
		return
	# what the last throw brought
	if loot.won >= 0 and loot.won < loot.bag.size():
		var it: Dictionary = loot.bag[loot.won]
		_text(Vector2(x0, y + 9.0), "YOU GOT", 9, DIM)
		y += 14.0
		for l in _wrap(str(it["name"]).to_upper(), w, NORMAL):
			_text(Vector2(x0, y + 12.0), l, NORMAL, loot.RARITY_COLOR[int(it["rarity"])])
			y += 16.0
		_text(Vector2(x0, y + 9.0), "A %s piece. It is in your bag." % RARITY_WORD[clampi(int(it["rarity"]), 0, 3)], 10, DIM)
		y += 18.0
	if gm_pick < 0:
		_text(Vector2(x0, y + 9.0), "Click a kind of piece to throw for it. Right-click throws at once.", 9, FAINT)
		return
	var cost: int = loot.gamble_price(gm_pick)
	var why: String = loot.gamble_problem(gm_pick)
	_text(Vector2(x0, y + 12.0), str(kinds[gm_pick]["name"]).to_upper(), NORMAL, PICK)
	var br := _svc_button("THROW: %d GOLD" % cost, x0, w, "gm_throw", why == "", blink)
	if why != "":
		var t := ("YOU HAVE %d" % loot.gold) if why == "Not enough gold" else why.to_upper()
		_text(Vector2(br.position.x - 8.0 - _width(t, 10), br.position.y + 19), t, 10, BAD)


# --- THE STRANGER'S CARDS (ui/royal_cards.ts cardsSide; loot.gd hand_in; act3/royal_cards.gd) ---

const RoyalCards := preload("res://scripts/act3/royal_cards.gd")


## Whether the stranger has the CARDS page: a card held (or a hand just handed in, to read what came) (cardsOpen).
func _cards_open() -> bool:
	for r in RoyalCards.ROYALS:
		if RoyalCards.held(loot.cards, r) > 0:
			return true
	return not loot.won_hand.is_empty()


## His cards: the four royals' faces with how many of each he holds; every hand they make, best first, each with what it pays; one
## pressed is picked; HAND IN: the hand's cards are the stranger's, the pieces it pays are in the bag, and named here.
func _cd_side(blink: bool, x0: float, w: float) -> void:
	var R: Dictionary = loot.royal
	var y := 42.0
	for l in _wrap("Bring me the royals\u2019 cards. A pair, two pair, three of a kind, a full house, four of a kind: the better the hand, the better what I give.", w, 10):
		_text(Vector2(x0, y), l, 10, TEXT)
		y += 13.0
	_text(Vector2(x0, y + 4.0), "YOUR CARDS", 10, DIM)
	# the four faces in a row, each with its count at its corner
	var face: Dictionary = R["face"]
	var fw := float(face["w"]) * K
	var fh := float(face["h"]) * K
	var gap := maxf(4.0 * K, minf(14.0 * K, floorf((w - 4.0 * fw) / 3.0)))
	var fy := y + 12.0
	for i in RoyalCards.ROYALS.size():
		var r: String = RoyalCards.ROYALS[i]
		var n := RoyalCards.held(loot.cards, r)
		var fr := Rect2(x0 + i * (fw + gap), fy, fw, fh)
		var pic: Dictionary = loot.pics.get("card:" + r, {})
		if not pic.is_empty():
			# (CARD_FACE is in the card's own picture pixels: the sheet holds it at its own grain)
			var src := Rect2(pic["rect"].position + Vector2(float(face["x"]), float(face["y"])), Vector2(float(face["w"]), float(face["h"])))
			draw_texture_rect_region(loot.sheet, fr, src, Color(1, 1, 1, 1.0 if n > 0 else 0.28))
		var label := str(n)
		var lw := _width(label, SMALL) + 8.0
		draw_rect(Rect2(fr.end.x - lw, fr.end.y - 14.0, lw, 14.0), INK)
		_text(Vector2(fr.end.x - lw + 4.0, fr.end.y - 3.0), label, SMALL, Color(R["label"][r]) if n > 0 else FAINT)
	y = fy + fh + 20.0
	# (something of the inventory's is being read: its card lies over the foot of this half)
	if _word != "" or not _pending.is_empty() or not _result.is_empty():
		return
	var hands: Array = loot.hands()
	_text(Vector2(x0, y), "HANDS TO HAND IN" if not hands.is_empty() else "NO HAND YET", 10, DIM)
	y += 8.0
	if hands.is_empty():
		for l in _wrap("A pair is the least I take: two of one royal.", w, 9):
			_text(Vector2(x0, y + 10.0), l, 9, FAINT)
			y += 12.0
	var row_h := 34.0
	var room := maxi(1, int(floorf((_vh() - 60.0 - y) / row_h)))
	var picked = null
	for i in mini(room, hands.size()):
		var h: Dictionary = hands[i]
		var key := RoyalCards.key_of(h)
		var rr := Rect2(x0, y, w, row_h - 4.0)
		var on := key == cd_pick
		if on:
			picked = h
		_gbox(rr, HOT if on or rr.has_point(_mouse) else INK, PICK if on else EDGE)
		_text(Vector2(x0 + 8.0, y + 13.0), RoyalCards.hand_name(h, R["names"]).to_upper(), 10, PICK if on else Color(R["label"][h["main"]]))
		_text(Vector2(x0 + 8.0, y + 26.0), RoyalCards.pays_name(RoyalCards.hand_pays(h)), 9, DIM)
		_hits.append([rr, "cd_hand", key, null])
		y += row_h
	if hands.size() > room:
		var more := "+%d MORE" % (hands.size() - room)
		_text(Vector2(x0 + w - _width(more, 9), fy + fh + 20.0), more, 9, DIM)
	if cd_pick != "" and picked == null:
		cd_pick = ""
	# what the last hand brought (when nothing is picked)
	if picked == null:
		var won: Array = []
		for i in loot.won_hand:
			if int(i) < loot.bag.size():
				won.append(loot.bag[int(i)])
		if not won.is_empty():
			_text(Vector2(x0, y + 12.0), "YOU GOT", 9, DIM)
			y += 16.0
			for it in won:
				_text(Vector2(x0, y + 12.0), str(it["name"]).to_upper(), NORMAL, loot.RARITY_COLOR[int(it["rarity"])])
				y += 16.0
			var said := ("A %s piece" % RARITY_WORD[clampi(int(won[0]["rarity"]), 0, 3)]) if won.size() == 1 else ("%d pieces" % won.size())
			_text(Vector2(x0, y + 9.0), said + ". In your bag.", 10, DIM)
		elif not hands.is_empty():
			_text(Vector2(x0, y + 12.0), "Click a hand to hand it in.", 9, FAINT)
		return
	var why: String = loot.hand_problem(picked)
	var br := _svc_button("HAND IN", x0, w, "cd_in", why == "", blink)
	if why != "":
		_text(Vector2(br.position.x - 8.0 - _width(why.to_upper(), 10), br.position.y + 19), why.to_upper(), 10, BAD)


# --- THE STASH ---

func _st_side(x0: float, w: float) -> void:
	_text(Vector2(x0, 22), "STASH", 16, PICK)
	# (THE LEXICON IN THE STASH, town.gd LEXICON_IN_STASH: its shelf of kept words a press away)
	if preload("res://scripts/town.gd").LEXICON_IN_STASH:
		var lb := Rect2(x0 + w - 104.0, 6.0, 104.0, 24.0)
		_gbutton(lb, "LEXICON", false, false, true)
		_hits.append([lb, "svc_swap", "lexicon", null])
	_text(Vector2(x0, 42), "KEPT FOR LATER CHARACTERS", 10, DIM)
	var cols := maxi(1, mini(9, int(floorf((w + 2.0) / PITCH))))
	for i in loot.stash.size():
		var r := Rect2(x0 + (i % cols) * PITCH, 50.0 + floorf(i / float(cols)) * PITCH, CELL, CELL)
		var it = loot.stash[i]
		_gbox(r, INK, (loot.RARITY_COLOR[int(it["rarity"])] if it != null else EDGE))
		if it != null:
			_icon(it["icon"], r.grow(-K))
			_hits.append([r, "st_take", i, it])
	var fy := 50.0 + ceilf(loot.stash.size() / float(cols)) * PITCH + 12.0
	_text(Vector2(x0, fy), "CLICK A PIECE TO MOVE IT ACROSS.", 9, FAINT)


# --- THE LEXICON ---

func _lx_side(blink: bool, x0: float, w: float) -> void:
	var D: Dictionary = Words.data()
	var found := 0
	for p in D["lexPages"]:
		for wd in p["words"]:
			if _lx_found(wd):
				found += 1
	_text(Vector2(x0, 22), "LEXICON", 16, PICK)
	_text(Vector2(x0 + _width("LEXICON", 16) + 10, 22), "%d OF %d FOUND" % [found, int(D["allWords"])], 10, DIM)
	# (THE LEXICON IN THE STASH: back to the stash's pieces)
	if preload("res://scripts/town.gd").LEXICON_IN_STASH:
		var sb := Rect2(x0 + w - 88.0, 6.0, 88.0, 24.0)
		_gbutton(sb, "STASH", false, false, true)
		_hits.append([sb, "svc_swap", "stash", null])
	# its five tabs
	var pages: Array = D["lexPages"]
	var tx := x0
	for i in pages.size():
		var name: String = pages[i]["name"]
		var tw := _width(name, SMALL) + 12.0 * K
		var tr := Rect2(tx, 30.0, tw, 20.0)
		var on := i == lx_tab
		_gbox(tr, HOT if on else BOX, PICK if on else EDGE)
		_mid(tr, name, SMALL, PICK if on else TEXT)
		_hits.append([tr, "lx_tab", i, null])
		tx += tw + 2.0 * K
	# the open page's words: found, its stone and what is known of it; not yet, "?"
	var words: Array = pages[lx_tab]["words"]
	for i in words.size():
		var wd: String = words[i]
		var r := Rect2(x0 + i * PITCH, 58.0, CELL, CELL)
		if not _lx_found(wd):
			_gbox(r, INK, EDGE)
			_mid(r, "?", NORMAL, FAINT)
			continue
		var on := wd == lx_sel
		_tile(r, wd, "name", {"stone": true, "lit": on or r.has_point(_mouse), "edge": PICK if on else null})
		var k: Dictionary = loot._know(wd)
		var kn := [k["front"], k["behind"], k["gear"], false]
		for j in 4:
			draw_rect(Rect2(r.position.x + 3.0 * K + j * 4.0 * K, r.end.y - 2.5 * K, 3.0 * K, 1.5 * K), loot.word_color(wd) if kn[j] else EDGE)
		_hits.append([r, "lx_word", wd, null])
	# the shelf along the bottom: the words kept in the book
	var shelf_y := _vh() - 58.0 - CELL
	var page_y := 58.0 + CELL + 10.0
	if _word == "" and _pending.is_empty() and _result.is_empty():
		if lx_sel != "" and _lx_found(lx_sel):
			_ws_page(lx_sel, x0, page_y, w, shelf_y - 10.0)
		elif found == 0:
			for l in _wrap("No word found yet. The first lies in a satchel, half way through the first dungeon.", w, 10):
				_text(Vector2(x0, page_y + 12.0), l, 10, DIM)
				page_y += 13.0
	draw_rect(Rect2(x0, shelf_y, w, 1), EDGE)
	_text(Vector2(x0, shelf_y + 14.0), "KEPT FOR YOUR NEXT CHARACTER", 9, DIM)
	var kept: Array = []
	for p in pages:
		for wd in p["words"]:
			if int(loot.lexicon.get(wd, 0)) > 0:
				kept.append(wd)
	if lx_pick != "":
		_svc_button("TAKE IT OUT", x0, w, "lx_take", true, blink)
	else:
		var price := "ONE MORE: %d GOLD" % loot.keep_cost()
		_text(Vector2(x0 + w - _width(price, 9), shelf_y + 14.0), price, 9, GOLD)
	if kept.is_empty():
		_text(Vector2(x0, shelf_y + 34.0), "None.", 9, FAINT)
	for i in kept.size():
		var wd: String = kept[i]
		var r := Rect2(x0 + i * PITCH, shelf_y + 20.0, CELL, CELL)
		var on := wd == lx_pick
		_tile(r, wd, "name", {"stone": true, "lit": on or r.has_point(_mouse), "edge": PICK if on else null, "count": int(loot.lexicon[wd])})
		_hits.append([r, "lx_kept", wd, null])
