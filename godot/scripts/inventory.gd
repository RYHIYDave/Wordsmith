## THE GEAR SCREEN (I or Tab; the game's ui/inventory.ts): on the left half of the screen, the game seen in the other half
## (Version 14.2), the game held still while it is open. In the heroes' colours (Version 13.0): deep blue panels, cyan for
## what is picked, pink for the one thing to press.
## LAID OUT AS THE GAME LAYS ITS OWN (ui/inventory.ts drawInventory, two of the screen's pixels to one of the game's): along
## the top the names of its pages and DONE; the page; and a bottom that never changes, YOUR WORDS over the BAG.
##   GEAR: his ten slots (a press takes a piece off, into the bag) and his numbers: damage, attacks a second, life, armour,
##     Str / Dex / Int, and +5 to place after a level (game.ts chooseAttr).
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
## The letters and frames are still Godot's plain ones, not the game's own; the game's STATS page is here on the GEAR page,
## beside what he wears, and its own lexicon of words is not here.
extends Control

const Words := preload("res://scripts/words.gd")

const PANEL := Color(0.05, 0.07, 0.2, 1.0)
const BOX := Color(0.09, 0.12, 0.32)
const HOT := Color(0.16, 0.2, 0.5)
const INK := Color(0.03, 0.04, 0.13)
const EDGE := Color(0.22, 0.28, 0.62)
const PICK := Color(0.35, 0.9, 1.0)
const PICK_LO := Color(0.13, 0.66, 0.75)
const PICK_BG := Color(0.07, 0.31, 0.42)
const PRESS := Color(0.96, 0.27, 0.47)
const DIM := Color(0.55, 0.6, 0.8)
const FAINT := Color(0.35, 0.38, 0.55)
const TEXT := Color(0.86, 0.88, 0.96)
const BAD := Color("#ff6e80")
const MAGIC := Color(0.55, 0.7, 1.0)
const GOLD := Color(1.0, 0.85, 0.4)
const SLOT_NAMES := {"mainhand": "WEAPON", "offhand": "OFF-HAND", "helm": "HELM", "chest": "CHEST", "gloves": "GLOVES",
	"belt": "BELT", "boots": "BOOTS", "amulet": "AMULET", "ring1": "RING", "ring2": "RING"}
const PAGES := ["gear", "attacks"]
const PAGE_LABEL := {"gear": "GEAR", "attacks": "ATTACKS"}
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
var _page_y := 0.0
var _page_h := 0.0
var _strip_y := 0.0
var _pouch_y := 0.0
var _bag_y := 0.0
var _rows_end := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	process_mode = Node.PROCESS_MODE_ALWAYS
	_font = ThemeDB.fallback_font
	_hud = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hud/hud.json"))
	_hud_tex = load("res://assets/hud/hud.png")
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


func _process(dt: float) -> void:
	if Input.is_action_just_pressed("inventory"):
		toggle()
	if not visible:
		return
	_t += dt
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
	mouse_filter = Control.MOUSE_FILTER_STOP if visible else Control.MOUSE_FILTER_IGNORE


## Opened on a move (the HUD: a press on its plate at the bottom of the screen): the ATTACKS page, that move read out.
func open_on(i: int) -> void:
	if not visible:
		toggle()
	_page = "attacks"
	_focus = clampi(i, 0, 2)


func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseMotion:
		_mouse = e.position
		_hover = {}
		for h in _hits:
			if h[0].has_point(e.position) and (h[1] == "worn" or h[1] == "bag" or h[1] == "buy"):
				_hover = {"item": h[3], "at": e.position}
		if not _drag.is_empty() and not _drag["moving"] and e.position.distance_to(_drag["at"]) > 5.0 * K:
			_begin_drag()
	if e is InputEventMouseButton:
		_mouse = e.position
		if e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
			_pressed(e.position)
			accept_event()
		elif e.pressed and e.button_index == MOUSE_BUTTON_RIGHT:
			# (the right button on a word that is set takes it straight back to his words)
			for c in _slots:
				if c["r"].has_point(e.position) and _set_in(c) != null:
					_unsocket(c["i"], c["side"], c["k"])
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
	if _done.has_point(at):
		_press("close", null)
		return
	for tb in _tabs:
		if tb["r"].has_point(at):
			_press("tab", tb["page"])
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
			_press(h[1], h[2])
			return
	# a press on nothing: whatever was in hand is put down
	_word = ""
	_look = null
	_pending = {}
	_result = {}
	_burn_now = false


func _released(at: Vector2) -> void:
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
	if altar >= 0 and at.x >= size.x / 2.0:
		return {"kind": "altar", "r": Rect2(size.x / 2.0, 0, size.x / 2.0, size.y)}
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
			else:
				loot.equip_from_bag(arg)
		"yes":
			# yes: the word is burned into the piece
			if not _pending.is_empty():
				var p := _pending
				_pending = {}
				_word = ""
				_say(loot.burn(p["word"], p["where"]))
				_burned()
		"no":
			_pending = {}
		"buy":
			loot.buy(shop, arg)
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
	_hover = {}


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
	var W := size.x / 2.0
	var H := size.y
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
	# the names of the pages, and DONE
	_tabs = []
	var x := M
	for pg in PAGES:
		var w := _width(PAGE_LABEL[pg], NORMAL) + 10.0 * K
		_tabs.append({"r": Rect2(x, top + K, w, HEAD - 3.0 * K), "page": pg})
		x += w + 2.0 * K
	_done = Rect2(W - M - 44.0 * K, top + K, 44.0 * K, HEAD - 3.0 * K)
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
			var tw: float = CELL if how == 2 else minf(body_w, _tile_w(w, "name", int(loot.words[w]), how == 1))
			if px > 0.0 and px + tw > body_w:
				px = 0.0
				line += 1
			_pouch.append({"r": Rect2(M + px, _pouch_y + line * LINE, tw, TH), "w": w, "bare": how == 1, "stone": how == 2, "line": line})
			px += tw + GAP
		lines = line + 1
		if lines <= room:
			break
		how += 1
	_pouch = _pouch.filter(func(c): return c["line"] < room)
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
		for i in loot.EQUIP.size():
			var slot: String = loot.EQUIP[i]
			_cells.append({"r": Rect2(16 + (i % 2) * 112, _page_y + 4 + floorf(i / 2.0) * 40, 106, 36), "where": slot, "item": loot.gear[slot], "worn": true})
	for i in loot.BAG:
		_cells.append({"r": Rect2(M + (i % BAG_COLS) * PITCH, _bag_y + floorf(float(i) / BAG_COLS) * PITCH, CELL, CELL), "where": i, "item": loot.bag[i] if i < loot.bag.size() else null, "worn": false})
	# what the word in hand hangs over: under the pointer
	_over = _target_at(_mouse) if _word != "" and _pending.is_empty() else {}


func _skill(i: int) -> Dictionary:
	return Words.skill(Words.moves()[i])


# --- the screen ---

func _draw() -> void:
	_hits = []
	_card_buttons = []
	_lay()
	var W := size.x / 2.0
	var blink := sin(_t * 7.0) > 0.0
	draw_rect(Rect2(0, 0, W, size.y), PANEL)
	# (the bottom that never changes stands on a ground of its own)
	draw_rect(Rect2(0, _strip_y - 3.0 * K, W, size.y - _strip_y + 3.0 * K), Color(0.07, 0.09, 0.26))
	draw_rect(Rect2(0, _strip_y - 3.0 * K, W, 1), EDGE)
	draw_line(Vector2(W, 0), Vector2(W, size.y), EDGE, 2.0)
	var first: bool = loot.first_word_waits()
	for tb in _tabs:
		var on: bool = tb["page"] == _page
		var off: bool = first and tb["page"] != "attacks"
		var r: Rect2 = tb["r"]
		draw_rect(r, HOT if on else BOX)
		draw_rect(r, PICK if on else EDGE, false, 1.5 if on else 1.0)
		_mid(r, PAGE_LABEL[tb["page"]], NORMAL, FAINT if off else (PICK if on else TEXT))
	# (pink is the one thing to press: DONE)
	draw_rect(_done, Color(PRESS, 0.18))
	draw_rect(_done, PRESS if not (_coached and blink) else Color.WHITE, false, 1.5)
	_mid(_done, "DONE", NORMAL, PRESS)
	if _page == "attacks":
		_draw_attacks(blink, first)
	else:
		_draw_gear()
	_draw_bag(blink, first)
	_draw_words(first)
	if shop != "":
		_shelf()
	if altar >= 0:
		_altar_side(blink)
	_draw_reading(blink, first)
	if _note_t > 0.0:
		var nw := minf(W - 8.0, _width(_note, NORMAL) + 16.0)
		var nr := Rect2(floorf((W - nw) / 2.0), _strip_y - 16.0 * K, nw, 11.0 * K)
		draw_rect(nr, Color.BLACK)
		_mid(nr, _note, NORMAL, BAD)
	_draw_flash()
	# the word being dragged follows the pointer (over a slot it may go in it is shown sitting there)
	if not _drag.is_empty() and _drag["moving"] and _word != "":
		var fits: bool = not _over.is_empty() and _over["kind"] == "slot" and place_problem(_over["i"], _over["side"], _over["k"], _word) == ""
		if not fits:
			var form: String = _over["side"] if not _over.is_empty() and _over["kind"] == "slot" else "name"
			var tw := _tile_w(_word, form)
			_tile(Rect2(roundf(_mouse.x - tw / 2.0), roundf(_mouse.y - TH - 4.0 * K), tw, TH), _word, form, {"lit": true, "edge": PICK})
	# the card of the piece pointed at
	if not _hover.is_empty() and _hover["item"] != null and _word == "" and _pending.is_empty():
		_card(_hover["item"], _hover["at"])


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
		draw_rect(a, HOT if _focus == s else BOX)
		draw_rect(a, PICK if _focus == s else EDGE, false, 1.5 if _focus == s else 1.0)
		_hud_pic("ability:" + str(def["icon"]), Rect2(a.position + Vector2(2.0 * K, 2.0 * K), Vector2(16.0 * K, 16.0 * K)))
		_top(a.position + Vector2(22.0 * K, 3.0 * K), str(def["name"]).to_upper(), NORMAL, Color.WHITE)
		_top(a.position + Vector2(22.0 * K, 12.0 * K), HOW[s], SMALL, DIM)
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
			draw_rect(r, (PICK_BG if blink else Color(0.06, 0.21, 0.33)) if ok else INK)
			draw_rect(r, ((PICK if blink else PICK_LO) if ok else (DIM if wanted or hot else EDGE)), false, 1.5 if ok else 1.0)
			var mid := r.position + (r.size / 2.0).floor()
			var plus: Color = PICK if ok else EDGE
			draw_rect(Rect2(mid.x - 3.0 * K, mid.y - K / 2.0, 7.0 * K, K), plus)
			draw_rect(Rect2(mid.x - K / 2.0, mid.y - 3.0 * K, K, 7.0 * K), plus)
	# under the three lines: the coach's line (a new player's first word); and, with nothing else being read, the move
	# last touched read out, as much of it as there is room for
	var x := M
	var w := size.x / 2.0 - 2.0 * M
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
		if main == null or main.place == "town":
			return ""
		return "%s! Close this and try it." % str(hero.loadout.r(main.guide.at)["name"]).to_upper()
	if not loot.first_word_waits():
		return ""
	return "Drag %s onto %s, or click the word and then the slot." % [str(Words.word(loot.first_spare())["name"]).to_upper(), str(_skill(0)["name"]).to_upper()]


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
	if float(_skill(i)["cooldown"]) > 0.0 and float(r["cooldown"]) > 0.0:
		return ["%.1f S" % r["cooldown"], "once every %.1f seconds" % r["cooldown"]]
	if float(r["rate"]) > 0.0:
		return ["%.2f/S" % r["rate"], "%.2f a second" % r["rate"]]
	return ["", ""]


# --- the GEAR page: what he wears, and his numbers ---

func _draw_gear() -> void:
	for c in _cells:
		if not c["worn"]:
			continue
		var r: Rect2 = c["r"]
		var it = c["item"]
		var slot: String = c["where"]
		draw_rect(r, BOX)
		draw_rect(r, _cell_edge(c), false, 1.0)
		_text(r.position + Vector2(38, 13), SLOT_NAMES[slot], 9, DIM)
		if it != null:
			_icon(it["icon"], Rect2(r.position + Vector2(3, 3), Vector2(30, 30)))
			_text(r.position + Vector2(38, 28), _short(it["name"], 13), 10, loot.RARITY_COLOR[int(it["rarity"])])
			_pips(it, Rect2(r.position + Vector2(3, 3), Vector2(30, 30)))
		_hits.append([r, "worn", slot, it])
	var sx := 250.0
	var y0 := _page_y + 4.0
	var s: Dictionary = hero.stats
	_text(Vector2(sx, y0 + 10), "LEVEL %d" % loot.level, 13, PICK)
	var lines := [
		"DAMAGE  %d-%d" % [roundi(s["dmg_min"] * (1.0 + s["str"] / 100.0) * (1.0 + (s["dmg_pct"] + s["phys_pct"]) / 100.0)), roundi(s["dmg_max"] * (1.0 + s["str"] / 100.0) * (1.0 + (s["dmg_pct"] + s["phys_pct"]) / 100.0))],
		"ATTACKS  %.2f a second" % s["aps"],
		"LIFE  %d" % roundi(hero.max_life),
		"ARMOUR  %d" % roundi(s["armor"]),
		"CRITICAL  %.1f%%" % s["crit_chance"],
	]
	for i in lines.size():
		_text(Vector2(sx, y0 + 30 + i * 15), lines[i], 11, TEXT)
	for i in 3:
		var a: String = ["str", "dex", "int"][i]
		var y := y0 + 110.0 + i * 20
		_text(Vector2(sx, y + 13), "%s  %d" % [a.to_upper(), roundi(s[a])], 11, TEXT)
		if loot.points > 0:
			_button(Rect2(sx + 80, y, 52, 17), "+5", "attr", a, PRESS)
	if loot.points > 0:
		_text(Vector2(sx, y0 + 186), "LEVEL UP: +5 TO ONE", 10, PRESS)


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
	var W := size.x / 2.0
	_small(Vector2(M, _bag_y - CAP), "BAG", DIM)
	for c in _cells:
		if c["worn"]:
			continue
		var r: Rect2 = c["r"]
		var it = c["item"]
		draw_rect(r, INK)
		draw_rect(r, _cell_edge(c), false, 1.0)
		if it != null:
			_icon(it["icon"], r.grow(-K), 0.3 if first else 1.0)
			_pips(it, r)
			_hits.append([r, "bag", c["where"], it])
	# beside the bag: what he has, and who he is
	var ix := M + BAG_COLS * PITCH - 2.0 * K + 8.0 * K
	if M + (W - 2.0 * M) - ix >= 30.0 * K:
		_hud_pic("gold", Rect2(ix, _bag_y, 16, 16))
		_top(Vector2(ix + 20, _bag_y + 2.0 * K), "%d" % loot.gold, SMALL, GOLD)
		# (WORDMELDING: the runedust carried, beside the gold, once there is any or the Meldstone has been found: act1/quest610.gd)
		var q6 = main.quest610 if main != null else null
		if q6 != null and (q6.dust > 0 or loot.meld != ""):
			var dx := ix + 20 + _width("%d" % loot.gold, SMALL) + 6.0 * K
			_film_pic("rd_icon", Vector2(dx, _bag_y + K))
			_top(Vector2(dx + 12.0 * K, _bag_y + 2.0 * K), "%d" % q6.dust, SMALL, Color(str(q6.Q["dust"]["color"])))
		_top(Vector2(ix, _bag_y + 14.0 * K), "LEVEL %d" % loot.level, SMALL, DIM)
		_top(Vector2(ix, _bag_y + 22.0 * K), "WARRIOR", SMALL, FAINT)


func _draw_words(first: bool) -> void:
	_small(Vector2(M, _pouch_y - CAP), "YOUR WORDS", DIM)
	if _pouch.is_empty():
		# (before the ring is lit, what opens wordsmithing; after, "empty")
		var dark := ""
		if not loot.ring_lit:
			dark = "Slots open at the wordsmith: bring him the MASTER RUNE-STONE." if loot.quest != "" else "No word slots until his ring is lit."
		_top(Vector2(M, _pouch_y + floorf((TH - 5.0 * K) / 2.0)), dark if dark != "" else "empty", SMALL, DIM if dark != "" else FAINT)
	var hidden: int = loot.held().size() - _pouch.size()
	if hidden > 0:
		_small(Vector2(size.x / 2.0 - M, _pouch_y - CAP), "+%d MORE" % hidden, DIM, true)
	for c in _pouch:
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
	var W := size.x / 2.0
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
			buttons = [["BURN IT", "yes"], ["CANCEL", "no"]]
		"over":
			about = _over["r"]
			if _over["kind"] == "slot":
				_slot_rows(rows, _word, _over["i"], _over["side"], _over["k"], inner, dragging)
			else:
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
			if first:
				_lines(rows, "Drag it onto an attack, or click a slot.", TEXT, SMALL, inner)
			elif _page == "attacks":
				_lines(rows, "Drag it onto an attack, or click a slot: it can be taken out again.", TEXT, SMALL, inner)
			else:
				_lines(rows, "Click a piece of gear to burn it in: it is used up. Hold it over a piece to see what it could become.", TEXT, SMALL, inner)
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
	var tall := 0.0
	for r in rows:
		tall += _row_h(r)
	var bh := 15.0 * K
	var foot := bh + 5.0 * K if not buttons.is_empty() else 0.0
	var ch := 5.0 * K + tall + foot + 3.0 * K
	var cx := W + 3.0 * K
	var mid: float = (about.position.y + about.size.y / 2.0) if about != null else size.y / 2.0
	var cy := clampf(roundf(mid - ch / 2.0), 3.0 * K, size.y - ch - 3.0 * K)
	if shop != "":
		# (over a vendor's half the card lies on lettering, not on the game: a dark margin round it keeps the two apart)
		draw_rect(Rect2(cx - 3.0 * K, cy - 3.0 * K, card_w + 6.0 * K, ch + 6.0 * K), Color(INK, 0.72))
	draw_rect(Rect2(cx, cy, card_w, ch), INK)
	draw_rect(Rect2(cx, cy, card_w, ch), EDGE, false, 1.5)
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
		var pink: bool = b[1] == "yes"
		draw_rect(r, Color(PRESS, 0.35 if blink else 0.18) if pink else BOX)
		draw_rect(r, PRESS if pink else EDGE, false, 1.5)
		_mid(r, b[0], NORMAL, Color.WHITE if pink else TEXT)
		_card_buttons.append([r, b[1]])
		bx += bw + 3.0 * K


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
	var opts: Array = loot.burn_options(w, it)
	var could: Array = []
	for o in opts:
		could.append(o["range"])
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

func _card(it: Dictionary, at: Vector2) -> void:
	var rows: Array = [[it["name"], loot.RARITY_COLOR[int(it["rarity"])], 13], [it["kind"], DIM, 10]]
	for l in it["implicit"]:
		rows.append([l, TEXT, 11])
	for l in it["lines"]:
		rows.append([l, MAGIC, 11])
	# (the words burned into it, each line under its word's name and in its colour: ui/panels.ts itemCard)
	for im in it.get("imbues", []):
		for l in im["lines"]:
			rows.append(["%s: %s" % [Words.word(im["word"])["name"], l], loot.word_color(im["word"]), 11])
	# (how many more words it will take: "All items have room for 4 mods")
	if int(it["rarity"]) != 3:
		var left: int = loot.room(it)
		rows.append([("Room for %d %s" % [left, "word" if left == 1 else "words"]) if left > 0 else "No room for words", DIM if left > 0 else FAINT, 10])
	if it["weapon"]:
		rows.append(["%.2f attacks a second" % it["aps"], DIM, 10])
	rows.append(["Level %d" % it["req"], DIM, 10])
	if shop != "":
		rows.append(["Sells for %d gold" % floori(float(it.get("value", 0)) * 0.25), GOLD, 10])
	# (as wide as its longest line: a word burned in may read long)
	var w := 230.0
	for r in rows:
		w = maxf(w, _width(r[0], r[2]) + 16.0)
	var h := 10.0 + rows.size() * 16.0
	var p := at + Vector2(16, 0)
	p.x = minf(p.x, size.x - w - 4)
	p.y = minf(p.y, size.y - h - 4)
	draw_rect(Rect2(p, Vector2(w, h)), INK)
	draw_rect(Rect2(p, Vector2(w, h)), loot.RARITY_COLOR[int(it["rarity"])], false, 1.5)
	for i in rows.size():
		_text(p + Vector2(8, 18 + i * 16), rows[i][0], rows[i][2], rows[i][1])


# --- the plain drawing kit ---

func _button(r: Rect2, label: String, action: String, arg, color: Color) -> void:
	draw_rect(r, Color(color, 0.18))
	draw_rect(r, color, false, 1.5)
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


func _text(at: Vector2, s: String, px: int, c: Color) -> void:
	draw_string(_font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, px, c)


## Letters with their tops at `at.y` (as the game places its own).
func _top(at: Vector2, s: String, px: int, c: Color) -> void:
	draw_string(_font, Vector2(at.x, at.y + roundf(px * 0.8)), s, HORIZONTAL_ALIGNMENT_LEFT, -1, px, c)


## A small caption, from the left at `at`, or ending there.
func _small(at: Vector2, s: String, c: Color, right := false) -> void:
	_top(Vector2(at.x - (_width(s, SMALL) if right else 0.0), at.y), s, SMALL, c)


## Letters in the middle of a box.
func _mid(r: Rect2, s: String, px: int, c: Color) -> void:
	_top(Vector2(r.position.x + floorf((r.size.x - _width(s, px)) / 2.0), r.position.y + floorf((r.size.y - px * 0.8) / 2.0) - 1.0), s, px, c)


func _width(s: String, px: int) -> float:
	return _font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x


## A sentence broken into lines no wider than `w`.
func _wrap(s: String, w: float, px: int) -> Array:
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


func _short(s: String, n: int) -> String:
	return s if s.length() <= n else s.substr(0, n - 1) + "."


func open_shop(id: String) -> void:
	shop = id
	if not visible:
		toggle()


## The vendor's shelf, on the right half: each piece, its price; what he cannot afford dimmed.
func _shelf() -> void:
	var x0 := size.x / 2.0 + 12.0
	var w := size.x / 2.0 - 24.0
	draw_rect(Rect2(x0 - 12, 0, w + 24, size.y), PANEL)
	_text(Vector2(x0, 22), "THE %s" % shop.to_upper(), 16, PICK)
	_text(Vector2(x0 + 200, 22), "%d GOLD" % loot.gold, 13, GOLD)
	_text(Vector2(x0, 42), "FOR SALE: click to buy. In the bag: click to sell.", 10, DIM)
	var stock: Array = loot.shops.get(shop, [])
	for i in stock.size():
		var it: Dictionary = stock[i]
		var r := Rect2(x0, 52 + i * 40, w, 36)
		var can: bool = loot.gold >= int(it["value"])
		draw_rect(r, BOX)
		draw_rect(r, EDGE, false, 1.0)
		_icon(it["icon"], Rect2(r.position + Vector2(3, 3), Vector2(30, 30)))
		_text(r.position + Vector2(40, 15), it["name"], 11, loot.RARITY_COLOR[int(it["rarity"])] if can else Color(0.4, 0.42, 0.55))
		_text(r.position + Vector2(40, 30), it["kind"], 9, DIM)
		_text(r.position + Vector2(w - 60, 22), "%d g" % int(it["value"]), 12, GOLD if can else Color(0.45, 0.4, 0.3))
		_hits.append([r, "buy", i, it])


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
	var x0 := size.x / 2.0 + 12.0
	var w := size.x / 2.0 - 24.0
	draw_rect(Rect2(x0 - 12, 0, w + 24, size.y), PANEL)
	_text(Vector2(x0, 22), "ALTAR OF THE WORDS", 16, PICK)
	var y := 42.0
	for l in _wrap("The door opens only to words given to it. Lay up to three spare words in the altar: they are burned. Each past the first makes the cult within harder, and its runedust richer.", w, 10):
		_text(Vector2(x0, y), l, 10, TEXT)
		y += 13.0
	y += 8.0
	_text(Vector2(x0, y), "GIVEN TO THE DOOR", 9, DIM)
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
			_text(Vector2(tx, r.position.y + 32), "Every one within: %s" % _lower(str(Words.word(laid[i])["monsterText"])), 9, TEXT)
			_hits.append([row, "altar_take", i, null])
		else:
			var here := i == next
			var lit := here and ok
			draw_rect(r, (PICK_BG if blink else Color(PICK_BG, 0.6)) if lit else INK)
			draw_rect(r, (PICK if blink else PICK_LO) if lit else EDGE, false, 1.5)
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
		for l in _wrap("Within: a yellow pack of the cult's best. Reward: %d runedust, and gear." % dust, w, 10):
			_text(Vector2(x0, y), l, 10, PICK)
			y += 13.0
	var label := "OPEN THE DOOR"
	var bw := _width(label, NORMAL) + 48.0
	var br := Rect2(x0 + w - bw, size.y - 52.0, bw, 30.0)
	var can := not laid.is_empty()
	draw_rect(br, Color(PRESS, (0.35 if blink else 0.18) if can else 0.06))
	draw_rect(br, PRESS if can else FAINT, false, 1.5)
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
