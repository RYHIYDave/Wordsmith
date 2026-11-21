## FLOOR 17, THE MASQUE: THE GREAT EBONY CLOCK (game/act2/masque_rules.ts stepClock; game.ts, the floor's step). His doc, level 17:
## "the great ebony clock in the black room. Every so often it chimes: every dancer stops dead and turns to look at you, then the
## music starts again and they all come at once." It first chimes 20 s after he comes onto the floor, then every 40 s; its bell
## rings 2 s (the look's state `clock<i>`, its hammer and bell drawn); every masked dancer within 18 tiles of him is called to the
## chime (act3/dancer.gd call_to_chime: stopped dead, the masks round to him, held, then at him), the waltzing ones woken by it.
## Heard: the clock's chime; said: "The ebony clock chimes." The Prince's Midnight sets it striking too (act3/prince.gd).
extends Node

const CHIME := {"first": 20.0, "every": 40.0, "reach": 18.0, "ring": 2.0}
## (defs.ts MSG.omen)
const OMEN := Color("#ffc24a")

var main
var _on := false
var _t := 0.0
var _next := 0.0
var _ring := 0.0
var _clock := ""
## (where the clock stands: the Prince's Midnight rolls out from it)
var at := Vector2.ZERO


func on() -> bool:
	return _on


func enter(where: String) -> void:
	_on = false
	_t = 0.0
	_next = float(CHIME["first"])
	_ring = 0.0
	_clock = ""
	if main.is_home(where) or main.map == null or main.map.land == null or main.map.land.get("masque") == null:
		return
	_on = true
	var c: Dictionary = main.map.land["masque"]["clock"]
	at = Vector2(float(c["x"]), float(c["y"]))
	if main.look != null:
		var V: Dictionary = main.look.data.get("variants", {})
		for name in V:
			if str(V[name].get("kind", "")) == "clock":
				_clock = name


## The clock's picture striking (its hammer and bell) or still.
func strike(on: bool) -> void:
	if _clock == "" or main.look == null:
		return
	if on:
		main.look.show_variant(_clock, 1.0)
	else:
		main.look.clear_variant(_clock)


## (for the checks) make it chime at its next step
func chime_now() -> void:
	_next = _t


func _process(dt: float) -> void:
	if not _on or main == null or get_tree().paused or main.hero == null or not main.hero.alive:
		return
	_t += dt
	if _ring > 0.0:
		_ring -= dt
		if _ring <= 0.0:
			strike(false)
	if _t < _next:
		return
	_next = _t + float(CHIME["every"])
	_ring = float(CHIME["ring"])
	strike(true)
	if main.sfx != null:
		main.sfx.play("clock_chime", linear_to_db(0.9))
	main.loot.say("The ebony clock chimes.", OMEN)
	var h: Vector2 = main.hero.world
	if main._monsters == null:
		return
	for m in main._monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "dancer" and m.world.distance_to(h) <= float(CHIME["reach"]) and m.h2 != null:
			m.h2.call_to_chime(m)
