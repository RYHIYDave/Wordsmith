## The game's recorded sounds (assets/sound; engine/audio.ts RECORDED_SFX): a sound by its name, and its takes on disk
## as name_1.mp3, name_2.mp3, ...; each play picks one of them. And the floor's own background: its loop under
## everything, and now and then one of its sounds (a drip, a far door).
extends Node

const DIR := "res://assets/sound/"
const VOICES := 12

var _takes := {}
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
	if _amb_name == "":
		return
	_amb_in -= dt
	if _amb_in <= 0.0:
		play(_amb_name, -4.0)
		_amb_in = randf_range(6.0, 14.0)


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
