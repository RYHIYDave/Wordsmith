## A GAME CONTROLLER (engine/gamepad.ts; main.ts padFrame, padControls, drawPadPointer), on in the released game since Version 20.1
## (his answer of 9 Oct 2026, 07:28, to the controller as drawn: "Yes, with the trees (Recommended)"). The common pads (Xbox,
## PlayStation and others) by the one standard layout:
##   LEFT STICK    move, at one speed (past its still middle, full speed, as the touch stick)
##   RIGHT STICK   aim: the attacks go where it points, at an enemy near that line if there is one, and he turns that way; let go,
##                 and the game aims as on a phone (the aim help's lock, a blade first for one it can reach, a slam for one it
##                 would catch)
##   RT            the quick attack; held, it goes on       LT  the slow attack; held, Whirlwind and Beam go on
##   A             the evasive move, the way he is going (or faces), 6 tiles
##   B             use (search, talk, pick up)              X   a flask        RB  the Warlock's change, his pact full
##   Y             the inventory (at the attack the first dungeon's prompt asks a word onto)
##   START         pause                                    BACK  the map
##   D-PAD UP      the prompt over the attacks: LEVEL UP, or NEW TALENT
##   in screens    the left stick moves a pointer (a small arrow), A presses where it is, B or START goes back (as Esc), Y closes
##                 the inventory, BACK the map
## While a pad is played with (moved or pressed in the last 8 seconds: `live`), the prompts, the HUD and the pause panel name its
## buttons (main.gd `pad_live`).
extends CanvasLayer

const Iso := preload("res://scripts/iso.gd")

## (gamepad.ts DEAD, TRIGGER, POINTER_SPEED)
const DEAD := 0.24
const TRIGGER := 0.35
const POINTER_SPEED := 230.0
const BUTTONS := {"A": JOY_BUTTON_A, "B": JOY_BUTTON_B, "X": JOY_BUTTON_X, "Y": JOY_BUTTON_Y, "LB": JOY_BUTTON_LEFT_SHOULDER,
	"RB": JOY_BUTTON_RIGHT_SHOULDER, "BACK": JOY_BUTTON_BACK, "START": JOY_BUTTON_START, "UP": JOY_BUTTON_DPAD_UP}

var main
var connected := false
var left := {"x": 0.0, "y": 0.0, "m": 0.0}
var right := {"x": 0.0, "y": 0.0, "m": 0.0}
var _now := {}
var _was := {}
## Seconds since anything on the pad was last moved or pressed.
var idle := 1e9
## The screens' pointer, in game pixels, and whether it is out.
var px := 0.0
var py := 0.0
var pointer := false
## (for the checks: a pad of their own, {axes: [lx, ly, rx, ry, lt, rt], buttons: [names held]}, read in place of a real one)
var fake = null
var _moved_him := false
var _held := {}
var _keys_up: Array = []
var _drawer: Node2D


func _ready() -> void:
	layer = 120
	process_mode = Node.PROCESS_MODE_ALWAYS
	process_priority = -90
	_drawer = _Pointer.new()
	_drawer.pad = self
	add_child(_drawer)


## (Pad.poll) The first pad connected, read once a frame: its sticks with their still middles taken out, its buttons, the triggers
## as buttons past a third of the way down.
func _poll(dt: float) -> void:
	_was = _now
	var axes: Array = []
	var held: Array = []
	if fake != null:
		connected = true
		axes = fake.get("axes", [0, 0, 0, 0, 0, 0])
		held = fake.get("buttons", [])
	else:
		var pads := Input.get_connected_joypads()
		connected = not pads.is_empty()
		if connected:
			var d: int = pads[0]
			for a in [JOY_AXIS_LEFT_X, JOY_AXIS_LEFT_Y, JOY_AXIS_RIGHT_X, JOY_AXIS_RIGHT_Y, JOY_AXIS_TRIGGER_LEFT, JOY_AXIS_TRIGGER_RIGHT]:
				axes.append(Input.get_joy_axis(d, a))
			for k in BUTTONS:
				if Input.is_joy_button_pressed(d, BUTTONS[k]):
					held.append(k)
	if not connected:
		_now = {}
		left = {"x": 0.0, "y": 0.0, "m": 0.0}
		right = {"x": 0.0, "y": 0.0, "m": 0.0}
		idle += dt
		return
	_now = {}
	for k in held:
		_now[k] = true
	if float(axes[4]) > TRIGGER:
		_now["LT"] = true
	if float(axes[5]) > TRIGGER:
		_now["RT"] = true
	left = _dead(float(axes[0]), float(axes[1]))
	right = _dead(float(axes[2]), float(axes[3]))
	idle = 0.0 if left["m"] > 0.0 or right["m"] > 0.0 or not _now.is_empty() else idle + dt


## (gamepad.ts deadZone) 0 inside the still middle, rising to 1 at the rim, the stick's own way.
static func _dead(x: float, y: float) -> Dictionary:
	var m := Vector2(x, y).length()
	if m <= DEAD:
		return {"x": 0.0, "y": 0.0, "m": 0.0}
	var k := minf(1.0, (m - DEAD) / (1.0 - DEAD))
	return {"x": x / m * k, "y": y / m * k, "m": k}


func down(b: String) -> bool:
	return _now.has(b)


func pressed(b: String) -> bool:
	return _now.has(b) and not _was.has(b)


## (Pad.live) The pad is being played with.
func live() -> bool:
	return connected and idle < 8.0


func _process(dt: float) -> void:
	for k in _keys_up:
		_key(k, false)
	_keys_up = []
	_poll(dt)
	var was_live: bool = main.pad_live
	main.pad_live = live()
	var h = main.hero
	if not main.pad_live:
		pointer = false
		if was_live:
			_let_go(h)
		_drawer.queue_redraw()
		return
	var in_play: bool = main._title == null and main._cards == null and h != null and h.alive and not get_tree().paused \
		and (main._inv == null or not main._inv.visible) and (main._mini == null or main._mini.open == "")
	if in_play:
		pointer = false
		if pressed("START"):
			_tap_key(KEY_ESCAPE)
		if pressed("Y"):
			# (while the first dungeon's prompt asks for a word to be put on an attack, the inventory opens at that attack)
			var at: int = main.guide.ask_at if main.guide != null else -1
			if at >= 0:
				main._inv.open_on(at)
			else:
				main._inv.toggle()
		if pressed("BACK"):
			_tap_key(KEY_M)
		if pressed("UP"):
			_prompt()
		_controls(h, dt)
	else:
		_let_go(h)
		if not pointer:
			var v: Vector2 = get_viewport().get_visible_rect().size / 2.0
			px = floorf(v.x / 2.0)
			py = floorf(v.y / 2.0)
			pointer = true
		var size: Vector2 = get_viewport().get_visible_rect().size / 2.0
		var before := Vector2(px, py)
		px = clampf(px + float(left["x"]) * POINTER_SPEED * dt, 0.0, size.x - 1.0)
		py = clampf(py + float(left["y"]) * POINTER_SPEED * dt, 0.0, size.y - 1.0)
		if Vector2(px, py) != before:
			var mm := InputEventMouseMotion.new()
			mm.position = _win(Vector2(px, py))
			mm.relative = (Vector2(px, py) - before) * 2.0
			Input.parse_input_event(mm)
		if pressed("A"):
			for down_ in [true, false]:
				var e := InputEventMouseButton.new()
				e.button_index = MOUSE_BUTTON_LEFT
				e.pressed = down_
				e.position = _win(Vector2(px, py))
				Input.parse_input_event(e)
		if pressed("B") or pressed("START"):
			_tap_key(KEY_ESCAPE)
		if pressed("Y") and main._inv != null and main._inv.visible:
			main._inv.toggle()
		# (BACK, which opened the map, closes it again, as M does)
		if pressed("BACK") and main._mini != null and main._mini.open == "map":
			_tap_key(KEY_M)
	_drawer.queue_redraw()


## (main.ts padControls) The pad's sticks and buttons as his controls, over whatever else said otherwise.
func _controls(h, dt: float) -> void:
	# THE LEFT STICK: at one speed, as the touch stick
	if left["m"] > 0.0:
		h.auto_dir = Vector2(left["x"], left["y"]).normalized()
		_moved_him = true
	elif _moved_him:
		h.auto_dir = Vector2.ZERO
		_moved_him = false
	var T = main._touch
	var quick: Dictionary = T._skill(0)
	var slow: Dictionary = T._skill(1)
	var reach := minf(float(slow["range"]) if float(slow["range"]) > 0.0 else 4.0, 6.0)
	var aims := {0: h.world + h.face * 3.0, 1: h.world + h.face * reach}
	if right["m"] > 0.0:
		# THE RIGHT STICK: where it points, at an enemy near that line if there is one; he turns to it, walking or not
		var v: Vector2 = Iso.screen_dir_to_world(Vector2(right["x"], right["y"]).normalized())
		var m = _cone(h, v, 10.0)
		aims[0] = T._placed(m, 0) if m != null else h.world + v * 4.0
		aims[1] = T._placed(m, 1) if m != null else h.world + v * reach
		T.lock = m
		h.face = v
	else:
		# let go: the game aims, as on a phone (AUTO AIM)
		var locked = T._lock_update(dt)
		var blade = T._awake_near(h.world, float(quick["range"]) * 0.9) if quick["kind"] == "melee" else null
		var slam = T._awake_near(h.world, float(slow["range"]) + float(slow["radius"]) * 0.8) if slow["kind"] == "burst" else null
		var q = blade if blade != null else locked
		var s = slam if slam != null else locked
		if q != null:
			aims[0] = T._placed(q, 0)
		if s != null:
			aims[1] = T._placed(s, 1)
	h.touch_aim = aims
	_hold("attack", down("RT"))
	_hold("whirl", down("LT"))
	if pressed("A"):
		var way: Vector2 = Iso.screen_dir_to_world(h.auto_dir.normalized()) if h.auto_dir.length() > 0.01 else h.face
		h.auto_lunge = h.world + way.normalized() * 6.0
	_hold("potion", down("X"))
	_hold("interact", down("B"))
	# (THE WARLOCK: his pact full, the right bumper changes him, as a tap on him does)
	_hold("change", down("RB"))


func _hold(action: String, on: bool) -> void:
	if on and not _held.has(action):
		Input.action_press(action)
		_held[action] = true
	elif not on and _held.has(action):
		Input.action_release(action)
		_held.erase(action)


func _let_go(h) -> void:
	for a in _held.keys():
		Input.action_release(a)
	_held.clear()
	if _moved_him and h != null:
		h.auto_dir = Vector2.ZERO
	_moved_him = false


## (main.ts coneTarget) The enemy nearest the line from him along `v`, within `reach` and a narrow cone, in his sight.
func _cone(h, v: Vector2, reach: float):
	var best = null
	var bs := INF
	for m in main._monsters.list:
		if not is_instance_valid(m) or m.dead or m.state == "sleep":
			continue
		var to: Vector2 = m.world - h.world
		var d := to.length()
		if d > reach or d < 0.01:
			continue
		var a := acos(clampf(to.dot(v) / d, -1.0, 1.0))
		if a > 0.38 or not main._monsters.sees(h.world, m.world):
			continue
		var score := a + d * 0.03
		if score < bs:
			bs = score
			best = m
	return best


## D-PAD UP: the prompt over the attacks: LEVEL UP (his points, on the gear screen) or NEW TALENT.
func _prompt() -> void:
	if main.loot.points > 0:
		main._inv.open_on(0)
		main._inv._press("tab", "gear")
	elif main._hud != null and main._hud._talent_button.has_area():
		main._inv.open_talents()


## A screen point in game pixels, where the window has it.
func _win(p: Vector2) -> Vector2:
	return get_viewport().get_final_transform() * (p * 2.0)


func _tap_key(k: Key) -> void:
	_key(k, true)
	_keys_up.append(k)


func _key(k: Key, down_: bool) -> void:
	var e := InputEventKey.new()
	e.keycode = k
	e.physical_keycode = k
	e.pressed = down_
	Input.parse_input_event(e)


## (main.ts drawPadPointer) The screens' pointer while a pad steers it: a small arrow, dark with the friend's cyan inside.
class _Pointer extends Node2D:
	const ROWS := ["X....", "XX...", "XoX..", "XooX.", "XoooX", "XooXX", "XXoX.", "...X."]
	var pad

	func _draw() -> void:
		if not pad.pointer or not pad.main.pad_live:
			return
		var at := Vector2(roundf(pad.px), roundf(pad.py))
		for r in ROWS.size():
			for k in ROWS[r].length():
				var ch: String = ROWS[r][k]
				if ch == ".":
					continue
				draw_rect(Rect2((at + Vector2(k, r)) * 2.0, Vector2(2, 2)), Color("#0e0c24") if ch == "X" else Color("#7af8f0"))
