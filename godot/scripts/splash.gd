## THE HANNAR MANOR GAMES SPLASH, before the start screen, each time the game begins. His words, 26 Nov 2026, 17:07: “I’d like a
## title splash screen before the wordsmith title screen.  I’d like it to fade up from black.  The smoke line is squiggling above
## the chimney.  The door opens I guess to black, and you zoom fly through the door to a black screen then to the wordsmith title
## screen.” Shown as films in Night and White, his pick: “White”; then, 17:24: “Can we change the color inside the door to the line
## color of the door frame or vise versa?”: the doorway's inside is the navy of every line.
##
## A film made for the game (tools/hannar_manor_splash.py --game: assets/splash/hannar_manor_splash.ogv, 960x540, the game's own
## size): up from black, the house (his drawing: its walls spell H and M) with HANNAR MANOR GAMES, the smoke squiggling, the door
## swinging in, the flight through the doorway into its navy, to black. Then the start screen comes up from black under this layer's
## black, as it fades away. A tap, a click or a key skips it. No film found: straight to the start screen.
##   main.gd _splash_up (SPLASH): the tree held still under it, as under the start screen; `done` raises the start screen.
extends CanvasLayer

signal done

const FILM := "res://assets/splash/hannar_manor_splash.ogv"
## how long the start screen takes to come up from black once the film is over
const REVEAL := 1.3

var _player: VideoStreamPlayer = null
var _black: ColorRect = null
var _over := false


func _ready() -> void:
	layer = 60
	process_mode = Node.PROCESS_MODE_ALWAYS
	_black = ColorRect.new()
	_black.color = Color.BLACK
	_black.set_anchors_preset(Control.PRESET_FULL_RECT)
	_black.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_black)
	var film: VideoStream = load(FILM) as VideoStream if ResourceLoader.exists(FILM) else null
	if film == null:
		_end.call_deferred()
		return
	_player = VideoStreamPlayer.new()
	_player.stream = film
	_player.expand = true
	_player.set_anchors_preset(Control.PRESET_FULL_RECT)
	_player.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_player.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(_player)
	_player.finished.connect(_end)
	_player.play()


func playing() -> bool:
	return _player != null and _player.is_playing()


func _input(event: InputEvent) -> void:
	if _over:
		return
	var press := (event is InputEventScreenTouch or event is InputEventMouseButton or event is InputEventKey) \
		and event.is_pressed() and not event.is_echo()
	if press:
		get_viewport().set_input_as_handled()
		_end()


## The film over (or skipped): the start screen raised under the black, the black faded away.
func _end() -> void:
	if _over:
		return
	_over = true
	if _player != null:
		_player.stop()
		_player.visible = false
	done.emit()
	_black.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var tw := create_tween()
	tw.set_pause_mode(Tween.TWEEN_PAUSE_PROCESS)
	tw.tween_property(_black, "color:a", 0.0, REVEAL)
	tw.tween_callback(queue_free)
