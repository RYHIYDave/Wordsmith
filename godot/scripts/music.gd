## THE LEVEL MUSIC (engine/audio.ts levelMusic, game/level_music.ts; the sound chat's tenth batch, his six songs): each
## place's walk, and on the floors its fight. From assets/music (tools/godot_music.mjs: the game's .mp4s made into .ogg, each
## cut at its loop's end, and music.json, the game's table and fades).
##   A PLACE COME INTO: its walk from its start, faded up over 0.6 s (the last place's let go of over 0.6 s).
##   A FIGHT STARTS (something awake within 10 tiles of him, game.ts inFight): the fight's loop from its first big hit (its
##   "fight in at"), at full at once; the walk faded to nothing over 0.6 s, still going on underneath.
##   THE FIGHT IS OVER (4 s after the last of them has died or lost him, FIGHT_MUSIC.calm): the fight faded out over 1.5 s and
##   stopped; the walk faded back up over 1.5 s, where it had got to. Never in town.
## Each track's loudness is ramped as the game ramps its gain (straight from one to the other), and turned into decibels.
extends Node

const DIR := "res://assets/music/"
## (game/level_music.ts FIGHT_MUSIC.calm, and defs.ts GUIDE.near: the fight's reach)
const CALM := 4.0
const NEAR := 10.0

var _table := {}
var _fades := {}
var _place := ""
var _walk: _Track
var _fight: _Track
var _fight_on := false
var _calm := INF


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "music.json"))
	_table = data["places"]
	_fades = data["music"]


## Each frame: `place` a key of the table ("town", "f1" ... "f5"; "" none), `fight` whether something awake is near him.
func level_music(place: String, fight_now: bool, dt: float) -> void:
	var here := place if _table.has(place) else ""
	if here != _place:
		for t in [_walk, _fight]:
			if t != null:
				_stop(t, _fades["leave"])
		_walk = null
		_fight = null
		_fight_on = false
		_calm = INF
		_place = here
	if here == "":
		return
	var P: Dictionary = _table[here]
	if _walk == null:
		_walk = _start(P["walk"], 0.0, 0.0)
		_walk.fade(0.0 if _fight_on else _vol(), _fades["walkIn"])
	# (game/level_music.ts fightMusic: on from the moment of a fight until CALM seconds after it; never in town)
	if not P.has("fight"):
		_calm = INF
	elif fight_now:
		_calm = 0.0
	else:
		_calm += dt
	var on := P.has("fight") and _calm < CALM
	if on and not _fight_on:
		var F: Dictionary = P["fight"]
		_fight = _start(F, float(F.get("fightIn", 0.0)), _vol())
		_fight_on = true
		_walk.fade(0.0, _fades["walkDown"])
	elif not on and _fight_on:
		if _fight != null:
			_stop(_fight, _fades["fightOut"])
		_fight = null
		_fight_on = false
		_walk.fade(_vol(), _fades["walkBack"])


## Is the fight's music on (for the shots)?
func fighting() -> bool:
	return _fight_on


func _vol() -> float:
	return float(_fades["vol"])


func _start(t: Dictionary, at: float, gain: float) -> _Track:
	var s: AudioStreamOggVorbis = load(DIR + t["file"])
	s.loop = true
	var tr := _Track.new()
	tr.gain = gain
	tr.target = gain
	add_child(tr)
	tr.stream = s
	tr.apply()
	tr.play(clampf(at, 0.0, maxf(0.0, float(t["loop"]) - 0.01)))
	return tr


func _stop(t: _Track, over: float) -> void:
	t.fade(0.0, over)
	t.free_when_silent = true


## One track playing: its loudness (0 to 1, as the game's gain) ramped straight to a target over so many seconds.
class _Track extends AudioStreamPlayer:
	var gain := 0.0
	var target := 0.0
	var rate := 0.0
	var free_when_silent := false

	func _ready() -> void:
		process_mode = Node.PROCESS_MODE_ALWAYS

	func fade(to: float, over: float) -> void:
		target = to
		rate = absf(to - gain) / maxf(over, 0.001)

	func apply() -> void:
		volume_db = linear_to_db(maxf(gain, 0.00001))

	func _process(dt: float) -> void:
		if gain != target:
			gain = move_toward(gain, target, rate * dt)
			apply()
		if free_when_silent and gain <= 0.0:
			queue_free()
