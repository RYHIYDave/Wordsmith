## TOUCH, FOR A PHONE (engine/input.ts; main.ts, its touch controls; game/lock.ts, the aim help; ui/panels.ts aimLabel). The game
## played with fingers, as the game is: no buttons for the moves.
##   THE LEFT THUMB is a movement stick that appears wherever it lands on the left 40% of the screen: past a small still middle
##   (0.18 of its 26 game pixels) he goes at full speed whatever the thumb's distance (the owner, 8 Oct 2026, 22:25: “Also can you
##   change the movement speed so it’s constant no matter where the joystick is in relation to the center”). Put down and lifted
##   again without steering, it was a touch on the world.
##   THE RIGHT THUMB: a TAP (lifted within 0.3 s, moved under 10 game pixels) is the quick attack; a HOLD (kept down 0.25 s and
##   still, or 0.3 s at all) is the slow one, kept going while it is held where it goes on; a SWIPE (18 game pixels within 0.3 s)
##   is the evasive move, the way it is swiped (6 tiles).
##   WHERE THE ATTACKS GO, the player's pick (AIM_MODES, in the pause panel, kept with the device): ATTACKS: AUTO AIM (the game's
##   first way: each at the enemy the aim help locks onto, the nearest awake and in sight within 10 tiles, kept till 12.5 off or
##   0.8 s out of sight, given up for another only 1.5 tiles nearer; a blade first for one it can reach, a slam for one it would
##   catch; a volley and a vial put where it is going), WHERE YOU TAP (at the monster under the thumb, else one near where it
##   points, else the point), THE WAY YOU FACE (the enemy locked onto, else one roughly ahead, else straight ahead), ONE HAND (one
##   thumb: kept down it is the stick; the quick attack goes by itself at the enemy picked once it is in reach; a tap throws the
##   slow one). A gold ring of dots turns round the one locked onto (render.ts lockRing).
##   A TOUCH ON WHAT IS USED BY STANDING AT IT (a service in town, a waypoint, the fallen wordsmith: main.ts spotAt, SPOT_SIZE) sends
##   him there, and it is used when he gets there (the errand); steering, or anything else, calls it off.
##   A TOUCH ON THE SCREEN'S OWN THINGS (the INVENTORY button, the flask, a move's plate, the small map, the pause button), and every
##   touch while a screen of the game's is up, is a press of it, as a mouse's.
extends Node2D

const Iso := preload("res://scripts/iso.gd")

const STICK_RADIUS := 26.0
const TAP_MOVE := 10.0
const FLICK_MOVE := 18.0
const FLICK_MS := 300.0
const HOLD_MS := 250.0
const DEAD := 0.18
## (game/lock.ts LOCK)
const LOCK := {"take": 10.0, "keep": 12.5, "lostFor": 0.8, "switchBy": 1.5, "cone": 0.85, "ahead": 10.0}
## (game/state.ts AIM_MODES, in the order the switch goes through them; ui/panels.ts aimLabel)
const MODES := ["auto", "tap", "face", "one"]
const LABEL := {"auto": "ATTACKS: AUTO AIM", "tap": "ATTACKS: WHERE YOU TAP", "face": "ATTACKS: THE WAY YOU FACE", "one": "ATTACKS: ONE HAND"}
## (main.ts SPOT_SIZE: how wide either side and how tall a thing is touched, game pixels)
const SPOT_SIZE := {"way": [24, 26], "body": [22, 20], "wordsmith": [18, 54], "armourer": [18, 54], "mystic": [34, 40], "lexicon": [18, 44],
	"stash": [20, 28], "stranger": [18, 54], "chained": [16, 42]}
const KEEP := "user://touch.cfg"
## (render.ts lockRing: its dots, dark under them)
const RING := [Color("#120d18"), Color("#e8b030"), Color("#ffe070"), Color("#fff6c0")]

var main
## Whether he is playing with fingers (true once a finger has touched the game; false again when a mouse is used).
var on := false
var mode := "auto"
var stick := {"active": false, "id": -1, "ox": 0.0, "oy": 0.0, "dx": 0.0, "dy": 0.0, "t0": 0, "moved": 0.0}
var aim := {"active": false, "id": -1, "x": 0.0, "y": 0.0, "sx": 0.0, "sy": 0.0, "t0": 0, "moved": 0.0, "held": false}
## (touches that are presses of the screen's own things, forwarded as a mouse's; their positions)
var _ui := {}
## (this frame's tap, touch on the world and swipe, game pixels; null: none)
var _tap = null
var _poke = null
var _flick = null
## (the one the aim help is locked onto; how long it has been out of sight)
var lock = null
var _lost := 0.0
## (walking to what was touched: where, what, how long)
var errand := {}
var _pressed := {}
## (for the checks: what the touches asked for last: [what, where])
var asked: Array = []


func _ready() -> void:
	process_priority = -100
	process_mode = Node.PROCESS_MODE_ALWAYS
	z_index = 2
	var over := _Over.new()
	over.t = self
	over.z_index = 60
	add_child(over)
	# (a finger is a finger: it is not made a mouse as well, so that a thumb on the stick is no click on the world)
	Input.emulate_mouse_from_touch = false
	var cf := ConfigFile.new()
	if cf.load(KEEP) == OK:
		mode = str(cf.get_value("touch", "aim", "auto"))
	if not MODES.has(mode):
		mode = "auto"


## The switch in the pause panel: the next way the attacks are aimed, kept with the device (main.ts setAim, flipAim).
func flip_aim() -> void:
	set_mode(MODES[(MODES.find(mode) + 1) % MODES.size()])


func set_mode(m: String) -> void:
	mode = m
	lock = null
	_release_all()
	var cf := ConfigFile.new()
	cf.load(KEEP)
	cf.set_value("touch", "aim", mode)
	cf.save(KEEP)


func label() -> String:
	return LABEL[mode]


func _hero():
	return main.hero if main != null else null


## Is the game on the screen in play (not a screen of its own up, nor paused, nor he fallen)?
func _playing() -> bool:
	var h = _hero()
	return h != null and h.alive and not get_tree().paused and main._title == null and main._cards == null


## Where a place on the floor is on the screen, in game pixels (two picture pixels each), and the screen's size in them.
func to_view(w: Vector2) -> Vector2:
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	return (Iso.to_screen(w.x, w.y) - tl) / 2.0


func view_size() -> Vector2:
	return get_viewport_rect().size / 2.0


## Does a touch here belong to the screen's own things (main.ts isUi): the HUD's buttons and the flask, the small map and the pause
## button; or a screen of the game's is up?
func _is_ui(p: Vector2) -> bool:
	if not _playing():
		return true
	if main._hud != null and main._hud.claims(p):
		return true
	if main._mini != null and main._mini.claims(p):
		return true
	return false


func _input(e: InputEvent) -> void:
	if e is InputEventMouseButton or e is InputEventMouseMotion:
		# (a real mouse's button: he is not on a phone, or not now; its moving alone says nothing, the screen's own presses move it)
		if e is InputEventMouseButton and e.device != InputEvent.DEVICE_ID_EMULATION and not _forwarding:
			if on:
				on = false
				_release_all()
		return
	if e is InputEventScreenTouch:
		var p: Vector2 = e.position / 2.0
		if e.pressed:
			on = true
			if _is_ui(p):
				_ui[e.index] = e.position
				_mouse(e.position, true)
				# (in play, a press of a button is a click: it is let go at once, so that it is no blow as well)
				if _playing():
					_mouse(e.position, false)
					_ui[e.index] = null
				get_viewport().set_input_as_handled()
				return
			_down(e.index, p)
		else:
			if _ui.has(e.index):
				if _ui[e.index] != null:
					_mouse(e.position, false)
				_ui.erase(e.index)
				get_viewport().set_input_as_handled()
				return
			_up(e.index)
		get_viewport().set_input_as_handled()
	elif e is InputEventScreenDrag:
		if _ui.has(e.index):
			if _ui[e.index] != null:
				_ui[e.index] = e.position
				_motion(e.position)
			get_viewport().set_input_as_handled()
			return
		_move(e.index, e.position / 2.0)
		get_viewport().set_input_as_handled()


var _forwarding := false


## (a touch on the screen's own things, given to them as a mouse's press)
func _mouse(pos: Vector2, pressed: bool) -> void:
	_forwarding = true
	_motion(pos)
	var b := InputEventMouseButton.new()
	b.button_index = MOUSE_BUTTON_LEFT
	b.pressed = pressed
	b.button_mask = MOUSE_BUTTON_MASK_LEFT if pressed else 0
	b.position = pos
	b.global_position = pos
	b.device = InputEvent.DEVICE_ID_EMULATION
	get_viewport().push_input(b, true)
	_forwarding = false


func _motion(pos: Vector2) -> void:
	_forwarding = true
	var m := InputEventMouseMotion.new()
	m.position = pos
	m.global_position = pos
	m.device = InputEvent.DEVICE_ID_EMULATION
	get_viewport().warp_mouse(pos)
	get_viewport().push_input(m, true)
	_forwarding = false


func _now() -> int:
	return Time.get_ticks_msec()


func _down(id: int, p: Vector2) -> void:
	# (ONE HAND: a thumb anywhere is first a touch that may be a tap or a swipe; held on, it becomes the stick: _begin)
	if mode == "one":
		if not aim["active"] and not stick["active"]:
			aim = {"active": true, "id": id, "x": p.x, "y": p.y, "sx": p.x, "sy": p.y, "t0": _now(), "moved": 0.0, "held": false}
		return
	var W: float = get_viewport_rect().size.x / 2.0
	if p.x < W * 0.4 and not stick["active"]:
		stick = {"active": true, "id": id, "ox": p.x, "oy": p.y, "dx": 0.0, "dy": 0.0, "t0": _now(), "moved": 0.0}
	elif not aim["active"]:
		aim = {"active": true, "id": id, "x": p.x, "y": p.y, "sx": p.x, "sy": p.y, "t0": _now(), "moved": 0.0, "held": false}


func _move(id: int, p: Vector2) -> void:
	if stick["active"] and id == int(stick["id"]):
		var d := Vector2(p.x - float(stick["ox"]), p.y - float(stick["oy"])) / STICK_RADIUS
		stick["moved"] = maxf(float(stick["moved"]), Vector2(p.x - float(stick["ox"]), p.y - float(stick["oy"])).length())
		if d.length() > 1.0:
			d = d.normalized()
		stick["dx"] = d.x
		stick["dy"] = d.y
	elif aim["active"] and id == int(aim["id"]):
		aim["x"] = p.x
		aim["y"] = p.y
		aim["moved"] = maxf(float(aim["moved"]), Vector2(p.x - float(aim["sx"]), p.y - float(aim["sy"])).length())


func _up(id: int) -> void:
	if stick["active"] and id == int(stick["id"]):
		# (the stick thumb, put down and lifted again without steering, was a touch on the world)
		if float(stick["moved"]) < TAP_MOVE and _now() - int(stick["t0"]) < FLICK_MS:
			_poke = Vector2(stick["ox"], stick["oy"])
		stick["active"] = false
		stick["dx"] = 0.0
		stick["dy"] = 0.0
	elif aim["active"] and id == int(aim["id"]):
		var ms := _now() - int(aim["t0"])
		if not aim["held"]:
			if float(aim["moved"]) < TAP_MOVE and ms < FLICK_MS:
				_tap = Vector2(aim["sx"], aim["sy"])
				_poke = _tap
			elif float(aim["moved"]) >= FLICK_MOVE and ms < FLICK_MS:
				_flick = Vector2(float(aim["x"]) - float(aim["sx"]), float(aim["y"]) - float(aim["sy"]))
		aim["active"] = false
		aim["held"] = false


## (Input.beginFrame) When a resting thumb becomes a hold; ONE HAND, a thumb kept down past a tap's or a swipe's time is the stick.
func _begin() -> void:
	if mode == "one" and aim["active"] and _now() - int(aim["t0"]) > FLICK_MS:
		var d := Vector2(float(aim["x"]) - float(aim["sx"]), float(aim["y"]) - float(aim["sy"])) / STICK_RADIUS
		if d.length() > 1.0:
			d = d.normalized()
		stick = {"active": true, "id": aim["id"], "ox": aim["sx"], "oy": aim["sy"], "dx": d.x, "dy": d.y, "t0": aim["t0"], "moved": aim["moved"]}
		aim["active"] = false
		aim["held"] = false
		return
	if mode == "one":
		return
	if aim["active"] and not aim["held"]:
		var ms := _now() - int(aim["t0"])
		if (ms > HOLD_MS and float(aim["moved"]) < FLICK_MOVE) or ms > FLICK_MS:
			aim["held"] = true


func _press(action: String) -> void:
	Input.action_press(action)
	_pressed[action] = true


func _release_all() -> void:
	for a in _pressed:
		Input.action_release(a)
	_pressed = {}
	var h = _hero()
	if h != null:
		h.touch_aim = {}
		h.auto_dir = Vector2.ZERO
	stick["active"] = false
	aim["active"] = false
	errand = {}


# --- the aim help (game/lock.ts) ---

## A point of the screen (game pixels) on the floor, as the game reads a touch: a little below it, where feet are (main.ts world).
func _world(p: Vector2, below := 8.0) -> Vector2:
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	return Iso.to_world(tl + (p + Vector2(0, below)) * 2.0)


## The monster drawn under a point of the screen (main.ts monsterAt), or null.
func _monster_at(p: Vector2):
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	var at := tl / 2.0 + p
	var best = null
	var bd := 1e9
	for m in main._monsters.list:
		# (THE CHAINED RARE in his chains is no one to strike: a touch on him is a touch on what is used, _spot_at)
		if not is_instance_valid(m) or m.dead or not m.seen or m.chained == 1:
			continue
		var s: Vector2 = Iso.to_screen(m.world.x, m.world.y) / 2.0
		var tall: float = 18.0 + m.r * 30.0
		var wide: float = 6.0 + m.r * 14.0
		if absf(at.x - s.x) > wide or at.y > s.y + 5.0 or at.y < s.y - tall:
			continue
		var d := absf(at.x - s.x) + absf(at.y - (s.y - tall / 2.0)) * 0.5
		if d < bd:
			bd = d
			best = m
	return best


## (main.ts onHim) Whether a touch at `p` (game pixels) is on the hero, and he has a use for it there: the box of him, 12 either
## side and from 44 over his feet to 6 under (`body`: to 8 over them, his feet left to a way he stands on); the Brawler's globes
## over his head too.
func _self_touch(h, p: Vector2, body := false) -> bool:
	var kit = h.kit
	if kit == null:
		return false
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	var at := tl / 2.0 + p
	var s: Vector2 = Iso.to_screen(h.world.x, h.world.y) / 2.0
	var on_him: bool = absf(at.x - s.x) <= 12.0 and at.y >= s.y - 44.0 and at.y <= s.y + (-8.0 if body else 6.0)
	match str(h.cls):
		"warlock":
			if not on_him or h.in_town or not kit.change.is_empty():
				return false
			if kit.form == "demon":
				return kit.feeding
			return float(kit.pact) >= float(kit.W["pact"]["full"])
		"mage":
			return on_him and kit.has_method("aura_kind") and kit.aura_kind() != ""
		"brawler":
			var going: bool = not kit.globes.is_empty() or not kit.mv.is_empty() or not kit.queue.is_empty()
			var on_globes: bool = absf(at.x - s.x) <= 22.0 and at.y >= s.y - 72.0 and at.y <= s.y - 40.0
			return going and (on_him or on_globes)
	return false


func _awake_near(at: Vector2, reach: float):
	var best = null
	var bd := reach
	for m in main._monsters.list:
		if is_instance_valid(m) and not m.dead and m.seen and m.state != "sleep" and m.world.distance_to(at) <= bd:
			bd = m.world.distance_to(at)
			best = m
	return best


## LockOn.update: the enemy it is locked onto now.
func _lock_update(dt: float):
	var h = _hero()
	var cur = lock if lock != null and is_instance_valid(lock) and not lock.dead else null
	if cur != null:
		var in_sight: bool = cur.seen and main.sees(h.world, cur.world)
		_lost = 0.0 if in_sight else _lost + dt
		if h.world.distance_to(cur.world) > LOCK["keep"] or _lost > LOCK["lostFor"] or cur.state == "sleep":
			cur = null
	var best = null
	var bd := INF
	for m in main._monsters.list:
		if not is_instance_valid(m) or m.dead or not m.seen or m.state == "sleep":
			continue
		var d: float = h.world.distance_to(m.world)
		if d > LOCK["take"] or d >= bd or not main.sees(h.world, m.world):
			continue
		bd = d
		best = m
	if best != null and best != cur and (cur == null or bd < h.world.distance_to(cur.world) - LOCK["switchBy"]):
		cur = best
		_lost = 0.0
	lock = cur
	return cur


## A move's own: its kind and reach (the Warrior's Strike and Whirlwind; any other hero's from his kit's table).
func _skill(i: int) -> Dictionary:
	var h = _hero()
	if h.kit != null:
		var d: Dictionary = h.kit._def(i)
		return {"kind": str(d.get("kind", "")), "range": float(d.get("range", 0.0)), "radius": float(d.get("radius", 0.0)), "channel": float(d.get("channel", 0.0)) > 0.0}
	return {"kind": "melee", "range": h.STRIKE["reach"], "radius": 0.0, "channel": false} if i == 0 else {"kind": "burst", "range": 0.0, "radius": h.WHIRL["radius"], "channel": true}


## placedAim: on it, but a volley and a vial where it is going.
func _placed(m, i: int) -> Vector2:
	var h = _hero()
	var k := str(_skill(i)["kind"])
	if h.kit != null and (k == "volley" or k == "vialtoss"):
		return h.kit._aim(99.0, k, -2)
	return m.world


# --- each frame ---

func _process(dt: float) -> void:
	var h = _hero()
	if not on or h == null or not _playing():
		if not _pressed.is_empty() or (h != null and not h.touch_aim.is_empty()):
			_release_all()
		_tap = null
		_poke = null
		_flick = null
		queue_redraw()
		return
	_begin()
	for a in _pressed.keys():
		if a == "attack" or a == "change":
			Input.action_release(a)
			_pressed.erase(a)
	# THE STICK: past its still middle, at full speed (main.ts)
	var d := Vector2(float(stick["dx"]), float(stick["dy"])) if stick["active"] else Vector2.ZERO
	var moving := d.length() > DEAD
	h.auto_dir = d.normalized() if moving else Vector2.ZERO
	var aims := {}
	var quick := _skill(0)
	var slow := _skill(1)
	# A TOUCH ON WHAT IS USED BY STANDING AT IT: walked to, and used there
	var spot := {}
	if _poke != null and _monster_at(_poke) == null:
		spot = _spot_at(_poke)
	# A TOUCH ON HIM HIMSELF (main.ts): the Warlock's pact full, it changes him (his words, “then you tap on the warlock and he
	# transforms”), the demon fed by the Unsigned Pact, it lets him go; the Mage's Aura, “a tap on the hero ability called Aura”; the
	# Brawler's combo going, on him or his globes, it is cancelled. No attack. On his body it is his, though he stand on a way; at
	# his feet a way there is used. (Nothing on a touch screen pressed R: the bug hunt's fourth round, 25 Nov 2026.)
	var selfed := false
	if _poke != null and _monster_at(_poke) == null and _self_touch(h, _poke, not spot.is_empty()):
		_press("change")
		_tap = null
		_poke = null
		spot = {}
		selfed = true
	if not spot.is_empty():
		errand = {"at": spot["at"], "kind": spot["kind"], "t": 0.0, "path": _path_to(spot["at"]), "i": 0}
		asked = ["errand", spot["kind"]]
	elif _poke != null:
		errand = {}
	if mode == "auto" or mode == "one":
		var locked = _lock_update(dt)
		var blade = _awake_near(h.world, float(quick["range"]) * 0.9) if quick["kind"] == "melee" else null
		var slam = _awake_near(h.world, float(slow["range"]) + float(slow["radius"]) * 0.8) if slow["kind"] == "burst" else null
		var q = blade if blade != null else locked
		var s = slam if slam != null else locked
		if q != null:
			aims[0] = _placed(q, 0)
		var reach := minf(float(slow["range"]) if float(slow["range"]) > 0.0 else 3.0, 4.0)
		aims[1] = _placed(s, 1) if s != null else h.world + h.face * reach
		var touched = _tap if _tap != null else (_poke if _poke != null and spot.is_empty() and _monster_at(_poke) != null else null)
		if mode == "one":
			# (the quick attack by itself at the one picked, once it is in reach; a tap throws the slow one)
			var in_reach: bool = q != null and h.world.distance_to(q.world) <= (float(quick["range"]) * 0.9 + 0.4 if quick["kind"] == "melee" else maxf(3.0, float(quick["range"]) if float(quick["range"]) > 0.0 else 8.0))
			# (not in the frame a touch on him cancelled the Brawler's combo: it pressed again at once; the bug hunt's fifth round)
			if in_reach and not moving and not selfed:
				_press("attack")
				asked = ["quick", aims.get(0)]
			if touched != null and spot.is_empty():
				_tap_slow()
		elif touched != null and spot.is_empty():
			_press("attack")
			asked = ["quick", aims.get(0, h.world + h.face)]
	elif mode == "face":
		var locked = _lock_update(dt)
		if locked != null:
			aims[0] = _placed(locked, 0)
			aims[1] = _placed(locked, 1)
			h.face = (locked.world - h.world).normalized() if locked.world.distance_to(h.world) > 0.01 else h.face
		else:
			var ahead := _ahead(minf(float(slow["range"]), 4.0))
			aims[0] = ahead
			aims[1] = ahead
		var touched = _tap if _tap != null else (_poke if _poke != null and spot.is_empty() else null)
		if touched != null and spot.is_empty():
			_press("attack")
			asked = ["quick", aims[0]]
	else:
		# WHERE YOU TAP: the monster under the thumb, else one near where it points, else the point
		lock = null
		var tap = _tap
		if tap == null and _poke != null and spot.is_empty():
			var q0 := _world(_poke)
			if _monster_at(_poke) != null or _awake_near(q0, 1.0) != null:
				tap = _poke
		if tap != null and spot.is_empty():
			var p := _world(tap)
			var t = _monster_at(tap)
			if t == null and quick["kind"] == "melee":
				t = _awake_near(h.world, float(quick["range"]) * 0.9)
			if t == null:
				t = _awake_near(p, 1.5)
			aims[0] = t.world if t != null else p
			if t != null:
				_mark = t
				_mark_t = Time.get_ticks_msec() / 1000.0
			_press("attack")
			asked = ["quick", aims[0]]
		if aim["active"] and aim["held"]:
			var w0 := _world(Vector2(aim["x"], aim["y"]))
			var on_it = _monster_at(Vector2(aim["x"], aim["y"]))
			if on_it == null and slow["kind"] == "burst":
				on_it = _awake_near(h.world, float(slow["range"]) + float(slow["radius"]) * 0.8)
			if on_it == null:
				on_it = _awake_near(w0, 1.2)
			aims[1] = on_it.world if on_it != null else w0
	# HOLD: the slow attack, at its aim, kept going while held
	if aim["active"] and aim["held"] and mode != "one":
		if not _pressed.has("whirl"):
			_press("whirl")
			asked = ["slow", aims.get(1)]
	elif _pressed.has("whirl") and not _one_tap:
		Input.action_release("whirl")
		_pressed.erase("whirl")
	if _one_tap:
		_one_tap = false
	# SWIPE: the evasive move, the way it is swiped
	if _flick != null:
		var v: Vector2 = Iso.screen_dir_to_world((_flick as Vector2).normalized())
		h.auto_lunge = h.world + v * 6.0
		asked = ["evade", h.auto_lunge]
		errand = {}
	h.touch_aim = aims
	# THE ERRAND: walked to, used once there; steering, or anything else, calls it off
	if not errand.is_empty():
		errand["t"] = float(errand["t"]) + dt
		var at: Vector2 = errand["at"]
		var dd: float = h.world.distance_to(at)
		if moving or float(errand["t"]) > 12.0 or (aim["active"] and aim["held"]):
			errand = {}
		elif dd < (0.4 if errand["kind"] == "way" else (1.0 if errand["kind"] == "body" else (2.0 if errand["kind"] == "chained" else 1.6))):
			if errand["kind"] != "body":
				_press("interact")
				_after_interact = true
			asked = ["used", errand["kind"]]
			errand = {}
		else:
			# (along its way round what stands in it, a tile's middle at a time: main.ts errand, its flow field)
			var path: PackedVector2Array = errand["path"]
			var i: int = errand["i"]
			while i < path.size() - 1 and h.world.distance_to(path[i]) < 0.35:
				i += 1
			errand["i"] = i
			var to: Vector2 = path[i] if i < path.size() else at
			h.auto_dir = _screen_way(to - h.world)
	elif _after_interact:
		_after_interact = false
		Input.action_release("interact")
		_pressed.erase("interact")
	_tap = null
	_poke = null
	_flick = null
	queue_redraw()


var _one_tap := false
var _after_interact := false


## (ONE HAND) A tap throws the slow attack: pressed for this frame only.
func _tap_slow() -> void:
	_press("whirl")
	_one_tap = true
	asked = ["slow", _hero().touch_aim.get(1)]


## aimAhead: the nearest monster roughly the way he faces and in sight, else `reach` straight ahead.
func _ahead(reach: float) -> Vector2:
	var h = _hero()
	var best = null
	var bd := INF
	for m in main._monsters.list:
		if not is_instance_valid(m) or m.dead or not m.seen:
			continue
		var to: Vector2 = m.world - h.world
		var d := to.length()
		if d > LOCK["ahead"] or d >= bd:
			continue
		var c: float = to.dot(h.face) / d if d > 0.6 else 1.0
		if c < LOCK["cone"] or not main.sees(h.world, m.world):
			continue
		bd = d
		best = m
	return best.world if best != null else h.world + h.face * reach


## The way to a place on the floor: the middles of the tiles from his to the open one nearest it (an A* on the walk grid, cutting
## a corner only where both its sides are open).
func _path_to(at: Vector2) -> PackedVector2Array:
	var h = _hero()
	var map = main.map
	var out := PackedVector2Array()
	if map == null:
		out.append(at)
		return out
	if _grid == null or _grid_of != map:
		_grid_of = map
		_grid = AStarGrid2D.new()
		_grid.region = Rect2i(0, 0, map.w, map.h)
		_grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
		_grid.update()
		for y in map.h:
			for x in map.w:
				if not map.walkable(x, y):
					_grid.set_point_solid(Vector2i(x, y))
	var goal := Vector2i(floori(at.x), floori(at.y))
	# (the open tile nearest it: what it is may stand in the way itself)
	var best := goal
	var bd := INF
	for dy in range(-3, 4):
		for dx in range(-3, 4):
			var c := goal + Vector2i(dx, dy)
			if c.x < 0 or c.y < 0 or c.x >= map.w or c.y >= map.h or _grid.is_point_solid(c):
				continue
			var d := Vector2(c.x + 0.5, c.y + 0.5).distance_to(at)
			if d < bd:
				bd = d
				best = c
	var from := Vector2i(floori(h.world.x), floori(h.world.y))
	if _grid.is_point_solid(from) or _grid.is_point_solid(best):
		out.append(at)
		return out
	for c in _grid.get_id_path(from, best):
		out.append(Vector2(c.x + 0.5, c.y + 0.5))
	if out.is_empty():
		out.append(at)
	return out


var _grid: AStarGrid2D = null
var _grid_of = null


## A way on the floor as the screen direction that walks it (the stick's own measure).
func _screen_way(w: Vector2) -> Vector2:
	if w.length() < 0.001:
		return Vector2.ZERO
	var s := Iso.to_screen(w.x, w.y)
	return s.normalized()


## main.ts spotAt: the service, the waypoint or the fallen wordsmith whose picture or name is under a point of the screen.
func _spot_at(p: Vector2) -> Dictionary:
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	var at := tl / 2.0 + p
	# (the nearest found so far: kept in a dictionary, which the test below can change)
	var found := {"best": {}, "bd": 1e9}
	var test := func(kind: String, size: String, w: Vector2, go: Vector2) -> void:
		var sz: Array = SPOT_SIZE.get(size, [20, 40])
		var s: Vector2 = Iso.to_screen(w.x, w.y) / 2.0
		if absf(at.x - s.x) > float(sz[0]) or at.y > s.y + 10.0 or at.y < s.y - float(sz[1]):
			return
		var d := at.distance_to(Vector2(s.x, s.y - float(sz[1]) / 2.0))
		if d < float(found["bd"]):
			found["bd"] = d
			found["best"] = {"kind": kind, "at": go}
	var way = main._way
	if way != null and (not main.is_home(main.place) or way.awake):
		test.call("way", "way", way.at, way.at)
	var town = main.town
	if town != null:
		for st in town.data["stations"]:
			var k := str(st["kind"])
			if k == "gate":
				continue
			var w := Vector2(float(st["x"]), float(st["y"]))
			test.call(k, k, w, w)
	elif main.loot != null and main.loot._body != null and not main.loot._body["searched"]:
		var b: Vector2 = main.loot._body["at"]
		test.call("body", "body", b, b)
	# (THE CHAINED RARE, while his chains hold him: touched, he is walked to and his chains broken there: chained_rare.gd)
	for cr in main.get("chained_rares"):
		if town == null and cr != null and is_instance_valid(cr) and cr.held():
			var c: Vector2 = cr.m.world
			test.call("chained", "chained", c, c)
	return found["best"]


# --- what is drawn ---

## What the game draws of the touches (ui/hud.ts, its touch feedback; render.ts lockRing): the gold ring round the one locked onto;
## the stick, a ring of dots 18 game pixels round where the thumb came down and a small square where it is pushed to; the reticle
## on what a tap's aim help picked (WHERE YOU TAP); and a ring closing over the right thumb as a press turns into a hold.
func _draw() -> void:
	var h = _hero()
	# (the gold ring is drawn for a game controller's aim too: main.ts renderer.lockId)
	if not (on or main.pad_live) or h == null or not _playing():
		return
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	var now := Time.get_ticks_msec() / 1000.0
	if lock != null and is_instance_valid(lock) and not lock.dead and mode != "tap":
		var c: Vector2 = Iso.to_screen(lock.world.x, lock.world.y)
		_lock_ring(c, maxf(0.62, float(lock.r) * 1.9), now)


## What the game draws of the touches over everything (ui/hud.ts, its touch feedback, drawn in the HUD): on a node of its own above
## the dungeon's darkness (look.gd, z 50), `c`.
func _draw_screen(c: CanvasItem) -> void:
	var h = _hero()
	if not on or h == null or not _playing():
		return
	var cam := get_viewport().get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - get_viewport_rect().size / 2.0 if cam != null else Vector2.ZERO
	var now := Time.get_ticks_msec() / 1000.0
	var T: Dictionary = main._hud.T if main._hud != null else {}
	var edge_hi: Color = T.get("edgeHi", Color("#7a6aa8"))
	var edge: Color = T.get("edge", Color("#3a3058"))
	var accent: Color = T.get("accent", Color("#b0f0dc"))
	# (a game pixel on the screen, as a square of two picture pixels)
	var dot := func(p: Vector2, col: Color, sz := 1.0) -> void:
		c.draw_rect(Rect2(tl + p.round() * 2.0, Vector2(sz, sz) * 2.0), col)
	if stick["active"]:
		var o := Vector2(stick["ox"], stick["oy"])
		for i in 28:
			var a := float(i) / 28.0 * TAU
			dot.call(o + Vector2(cos(a), sin(a)) * 18.0, edge_hi)
		var k := Vector2(roundf(float(stick["ox"]) + float(stick["dx"]) * 14.0) - 3.0, roundf(float(stick["oy"]) + float(stick["dy"]) * 14.0) - 3.0)
		c.draw_rect(Rect2(tl + k * 2.0, Vector2(12, 12)), Color(edge_hi, 0.6))
	if mode == "tap" and _mark != null and is_instance_valid(_mark) and not _mark.dead and now - _mark_t < 3.0:
		var ms: Vector2 = (Iso.to_screen(_mark.world.x, _mark.world.y) - tl) / 2.0 - Vector2(0, roundf(float(_mark.r) * 30.0 * 0.4 + 8.0))
		var off := 6.0 + float(floori(now * 6.0) % 2)
		for q in [[Vector2(-off - 2, 0), Vector2(3, 1)], [Vector2(off, 0), Vector2(3, 1)], [Vector2(0, -off - 2), Vector2(1, 3)], [Vector2(0, off), Vector2(1, 3)]]:
			c.draw_rect(Rect2(tl + (ms.round() + q[0]) * 2.0, q[1] * 2.0), accent)
	# (THE FIRST DUNGEON: a ghost of the gesture its prompt asks for, where it should be made: guide.gd `gesture`)
	var q: Dictionary = main.guide.gesture if main.guide != null else {}
	if not q.is_empty():
		var V := view_size()
		var white: Color = main._hud.P["white"] if main._hud != null else Color.WHITE
		if q["kind"] == "stick" and not stick["active"]:
			_ghost(c, tl, "stick", Vector2(roundf(V.x * 0.17), roundf(V.y * 0.62)), q["dir"], now, edge_hi, accent, edge, white)
		elif q["kind"] == "flick" and not aim["active"]:
			_ghost(c, tl, "flick", Vector2(roundf(V.x * 0.62), roundf(V.y * 0.6)), Vector2(1, 0), now, edge_hi, accent, edge, white)
		elif (q["kind"] == "tap" or q["kind"] == "hold") and not aim["active"]:
			_ghost(c, tl, q["kind"], q["at"], Vector2.ZERO, now, edge_hi, accent, edge, white)
	var hold := _hold_progress()
	if aim["active"] and hold > 0.35:
		var at := Vector2(roundf(float(aim["x"])), roundf(float(aim["y"])) - 20.0)
		var lit := roundi((hold - 0.35) / 0.65 * 16.0)
		for i in 16:
			var a := -PI / 2.0 + float(i) / 16.0 * TAU
			dot.call(at + Vector2(cos(a), sin(a)) * 7.0, (accent if hold >= 1.0 else edge_hi) if i < lit else edge, 2.0 if hold >= 1.0 else 1.0)


## (ui/hud.ts drawGesture) A ghost of a gesture at `at` (game pixels on the screen), `dir` the way the walking thumb is pushed:
## STICK, a ring of dots 18 round, a thumb put down and pushed 14 the way to go; TAP, a ring closing in and the thumb on it;
## HOLD, the thumb down and a ring of 20 dots filling round it; FLICK, a quick stroke 46 across, the thumb at its end.
func _ghost(c: CanvasItem, tl: Vector2, kind: String, at: Vector2, dir: Vector2, t: float, edge_hi: Color, accent: Color, edge: Color, white: Color) -> void:
	var px := func(p: Vector2, col: Color, sz := 1.0) -> void:
		c.draw_rect(Rect2(tl + p.round() * 2.0, Vector2(sz, sz) * 2.0), col)
	var ring := func(o: Vector2, r: float, color: Color, n: int) -> void:
		for i in n:
			var a := float(i) / n * TAU
			px.call(o + Vector2(cos(a), sin(a)) * r, color)
	var thumb := func(p: Vector2, alpha: float) -> void:
		var o := p.round()
		# (the two crossing as the game's do, the middle where they cross the whiter)
		c.draw_rect(Rect2(tl + (o + Vector2(-3, -2)) * 2.0, Vector2(6, 4) * 2.0), Color(white, alpha))
		c.draw_rect(Rect2(tl + (o + Vector2(-2, -3)) * 2.0, Vector2(4, 6) * 2.0), Color(white, alpha))
	match kind:
		"stick":
			# (a thumb is put down, and pushed the way to go)
			var k := fmod(t * 0.8, 1.0)
			var push := 0.0 if k < 0.2 else minf(1.0, (k - 0.2) / 0.35)
			var d: Vector2 = dir / dir.length() if dir.length() > 0.0 else Vector2(1, 0)
			ring.call(at, 18.0, edge_hi, 28)
			thumb.call(at + d * 14.0 * push, (1.0 - k) / 0.15 if k > 0.85 else minf(1.0, k / 0.1) * 0.9)
		"tap":
			var k := fmod(t * 1.5, 1.0)
			ring.call(at, 13.0 - k * 8.0, accent, 20)
			if k > 0.6:
				thumb.call(at, 0.9)
		"hold":
			# (the thumb stays down, and the ring closes round it)
			var k := fmod(t * 0.8, 1.0)
			var lit := roundi(minf(1.0, k / 0.7) * 20.0)
			for i in 20:
				var a := -PI / 2.0 + float(i) / 20.0 * TAU
				px.call(at + Vector2(cos(a), sin(a)) * 11.0, accent if i < lit else edge, 2.0 if k > 0.7 else 1.0)
			thumb.call(at, 0.9)
		_:
			# (a quick stroke across the screen)
			var k := fmod(t * 0.9, 1.0)
			var go := minf(1.0, k / 0.22)
			var a := maxf(0.0, 1.0 - (k - 0.6) / 0.25) if k > 0.6 else 1.0
			c.draw_rect(Rect2(tl + Vector2(at.x, at.y - 1.0).round() * 2.0, Vector2(roundf(46.0 * go), 2.0) * 2.0), Color(white, 0.5 * a))
			thumb.call(at + Vector2(46.0 * go, 0), 0.9 * a)


## (Input.holdProgress) How far the right thumb is toward counting as a hold, 0 to 1.
func _hold_progress() -> float:
	if not aim["active"]:
		return 0.0
	return 1.0 if aim["held"] else minf(1.0, float(_now() - int(aim["t0"])) / HOLD_MS)


## (WHERE YOU TAP: the one a tap's aim help picked, for the reticle on it, and since when)
var _mark = null
var _mark_t := -10.0


func _lock_ring(c: Vector2, r: float, t: float) -> void:
	var n := maxi(8, roundi(r * 16.0)) * 4
	var quarter := n / 4
	var lit := roundi(quarter * 0.62)
	var turn := floori(t * 10.0)
	for i in n:
		var k := posmod(i - turn, quarter)
		if k >= lit:
			continue
		var a := float(i) / n * TAU
		var ux := cos(a) - sin(a)
		var uy := cos(a) + sin(a)
		var px := func(rr: float) -> Vector2:
			return (c / 2.0 + Vector2(roundf(ux * 16.0 * rr), roundf(uy * 8.0 * rr))).floor() * 2.0
		draw_rect(Rect2(px.call(r + 0.09), Vector2(2, 2)), RING[0])
		draw_rect(Rect2(px.call(r), Vector2(2, 2)), RING[1] if k == 0 or k == lit - 1 else RING[2])
		draw_rect(Rect2(px.call(r - 0.06), Vector2(2, 2)), RING[2] if k == 0 or k == lit - 1 else RING[3])


## (the touches' marks over the darkness: _draw_screen)
class _Over extends Node2D:
	var t

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		t._draw_screen(self)
