## The game's recorded sounds (assets/sound; engine/audio.ts RECORDED_SFX): a sound by its name, and its takes on disk
## as name_1.mp3, name_2.mp3, ...; each play picks one of them. And the floor's own background: its loop under
## everything, and now and then one of its sounds (a drip, a far door).
extends Node

const DIR := "res://assets/sound/"
const VOICES := 12

var _takes := {}
var _files := {}
var _voices: Array[AudioStreamPlayer] = []
var _next := 0
var _bed: AudioStreamPlayer
var _amb_name := ""
var _amb_in := 0.0


func _ready() -> void:
	for i in VOICES:
		var p := AudioStreamPlayer.new()
		add_child(p)
		_voices.append(p)


func play(name: String, volume_db := 0.0) -> void:
	var takes: Array = _takes_of(name)
	if takes.is_empty():
		return
	var p := _voices[_next]
	_next = (_next + 1) % VOICES
	p.stream = takes.pick_random()
	p.volume_db = volume_db
	p.play()


## A HERO'S VOICE (engine/audio.ts heroVoice, CRIES, VOICE_TUNE): his own (`who`: his class), as he begins an attack, is hurt,
## dies. Not every time: on an attack one in 42, never within 14.4 s of the last; hurt, a grunt, never within 2.1 s of the last, or
## in its place, rarely, a line (one hurt in 8, never within 25 s of the last); his death always. Each picks one of its takes:
## <who>_attack_a/_b, _hurt_a (the grunts), _hurt_b (the lines), _death, each _1 and _2. At 0.9.
const VOICE_TUNE := {"attackOne": 42.0, "attackGap": 14.4, "gruntGap": 2.1, "lineOne": 8.0, "lineGap": 25.0, "vol": 0.9}
const CRIES := {"attack": ["attack_a", "attack_b"], "grunt": ["hurt_a"], "line": ["hurt_b"], "death": ["death"]}
var _cried := {"attack": -1e9, "grunt": -1e9, "line": -1e9}
## (the seconds the voices go by; and, for the checks, the last cry heard: [who, kind])
var _clock := 0.0
var last_cry: Array = []


func voice(who: String, cry: String) -> void:
	var s := _clock
	if cry == "attack":
		if s - _cried["attack"] < VOICE_TUNE["attackGap"] or randf() * VOICE_TUNE["attackOne"] >= 1.0:
			return
		if _cry(who, "attack"):
			_cried["attack"] = s
		return
	if cry == "hurt":
		if s - _cried["line"] >= VOICE_TUNE["lineGap"] and randf() * VOICE_TUNE["lineOne"] < 1.0 and _cry(who, "line"):
			_cried["line"] = s
			_cried["grunt"] = s
			return
		if s - _cried["grunt"] < VOICE_TUNE["gruntGap"]:
			return
		if _cry(who, "grunt"):
			_cried["grunt"] = s
		return
	_cry(who, "death")


func _cry(who: String, kind: String) -> bool:
	var takes: Array = []
	for t in CRIES[kind]:
		takes.append_array(_takes_of("%s_%s" % [who, t]))
	if takes.is_empty():
		return false
	var p := _voices[_next]
	_next = (_next + 1) % VOICES
	p.stream = takes.pick_random()
	p.volume_db = linear_to_db(VOICE_TUNE["vol"])
	p.play()
	last_cry = [who, kind]
	return true


## The floor's background: `bed` a loop played all the while (bed_f1_loop.wav), `amb` the name of its now-and-then
## sounds (amb_f1), one every 6 to 14 seconds.
func background(bed: String, amb: String) -> void:
	# (a new place: the last one's loop stops)
	if _bed != null:
		_bed.queue_free()
		_bed = null
	if ResourceLoader.exists(DIR + bed):
		_bed = AudioStreamPlayer.new()
		_bed.stream = load(DIR + bed)
		_bed.volume_db = -6.0
		add_child(_bed)
		_bed.finished.connect(_bed.play)
		_bed.play()
	_amb_name = amb
	_amb_in = randf_range(3.0, 8.0)


func _process(dt: float) -> void:
	_clock += dt
	if _amb_name == "":
		return
	_amb_in -= dt
	if _amb_in <= 0.0:
		play(_amb_name, -4.0)
		_amb_in = randf_range(6.0, 14.0)


## A sound file of its own (a boss's called line in his voice, assets/voices: monsters.gd speak), played as a take is.
func play_path(path: String, volume_db := 0.0) -> void:
	if not _files.has(path):
		_files[path] = load(path) if ResourceLoader.exists(path) else null
	if _files[path] == null:
		return
	var p := _voices[_next]
	_next = (_next + 1) % VOICES
	p.stream = _files[path]
	p.volume_db = volume_db
	p.play()


func _takes_of(name: String) -> Array:
	if _takes.has(name):
		return _takes[name]
	var takes := []
	for i in range(1, 10):
		var path := "%s%s_%d.mp3" % [DIR, name, i]
		if not ResourceLoader.exists(path):
			break
		takes.append(load(path))
	_takes[name] = takes
	return takes
