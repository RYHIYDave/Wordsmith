## The game's recorded sounds (assets/sound; engine/audio.ts RECORDED_SFX): a sound by its name, and its takes on disk
## as name_1.mp3, name_2.mp3, ...; each play picks one of them, and where there are three takes or more never the one that name
## played last (engine/audio.ts playTake: the sound chat's fourteenth batch; two would only alternate). And each place's sounds
## now and then (a drip, a far door, the breeze): NO CONSTANT SOUND BUT THE MUSIC (the fifteenth batch: game/world_sounds.ts
## WORLD_LOOPS off), so no loop under anything.
extends Node

const DIR := "res://assets/sound/"
const VOICES := 12

var _takes := {}
var _last_take := {}
var _files := {}
var _voices: Array[AudioStreamPlayer] = []
var _next := 0
var _amb: Array = []
## (how loud each of the place's sounds now and then is heard now, a share of its own: the braziers' pop by the nearest one,
## town.gd; one not here, at its own)
var amb_near := {}


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
	p.stream = _pick(name, takes)
	p.volume_db = volume_db
	p.play()
	heard.append([name, p.stream.resource_path.get_file()])
	if heard.size() > 80:
		heard.pop_front()


## One of its takes; where it has three or more, not the one `key` played last (engine/audio.ts playTake).
func _pick(key: String, takes: Array):
	var pool := takes
	if takes.size() >= 3 and _last_take.has(key):
		pool = takes.filter(func(t): return t != _last_take[key])
	var t = pool.pick_random()
	_last_take[key] = t
	return t


## A HERO'S VOICE (engine/audio.ts heroVoice, CRIES, VOICE_TUNE): his own (`who`: his class), as he begins an attack, is hurt,
## dies. Not every time: on an attack one in 42, never within 14.4 s of the last; hurt, a grunt, never within 2.1 s of the last, or
## in its place, rarely, a line (one hurt in 8, never within 25 s of the last); his death always. AND A THIRD AS OFTEN AGAIN, WITH
## MORE TAKES (the sound chat's fourteenth batch, his picks “Hero grunting when hit (Recommended), Hero attack shouts” and “Rarer,
## and more takes (Recommended)”): where those rules would play a shout or a grunt, it plays one time in `keep`, the gap counted
## from the one passed over too. Each picks one of its takes: <who>_attack_a/_b/_c (the shouts), _hurt_a/_c (the grunts), _hurt_b
## (the lines), _death, each _1 and _2. At 0.9.
const VOICE_TUNE := {"attackOne": 42.0, "attackGap": 14.4, "gruntGap": 2.1, "lineOne": 8.0, "lineGap": 25.0, "keep": 3.0, "vol": 0.9}
const CRIES := {"attack": ["attack_a", "attack_b", "attack_c"], "grunt": ["hurt_a", "hurt_c"], "line": ["hurt_b"], "death": ["death"]}
var _cried := {"attack": -1e9, "grunt": -1e9, "line": -1e9}
## (the seconds the voices go by; and, for the checks, the last cry heard: [who, kind])
var _clock := 0.0
var last_cry: Array = []
## (for the checks: the cries passed over, one time in `keep` heard; the last sounds played by name, [name, its take's file])
var passed_over := 0
var heard: Array = []


func voice(who: String, cry: String) -> void:
	var s := _clock
	if cry == "attack":
		if s - _cried["attack"] < VOICE_TUNE["attackGap"] or randf() * VOICE_TUNE["attackOne"] >= 1.0:
			return
		if randf() * VOICE_TUNE["keep"] >= 1.0:
			_cried["attack"] = s
			passed_over += 1
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
		if randf() * VOICE_TUNE["keep"] >= 1.0:
			_cried["grunt"] = s
			passed_over += 1
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
	p.stream = _pick("voice:%s:%s" % [who, kind], takes)
	p.volume_db = linear_to_db(VOICE_TUNE["vol"])
	p.play()
	last_cry = [who, kind]
	return true


## THE STANDOUT SOUNDS NOW AND THEN (game/world_sounds.ts AMBIENT, AMBIENT_FLOORS, ambientWants; main.ts): each of a place's on
## its own countdown, at random between `from` and `to` seconds, the first one too, from coming into the place; at `vol` (times
## amb_near's share for it, where it is heard by nearness); the countdowns stand still while the game is paused. The fifteenth
## batch's: the hearth gone, a gust of breeze in through the door in its place (three takes), every 13 to 30 s, in the camp (the
## castle hall's is the same, the castle hall not yet on: art/castle_hall.ts CASTLE_HALL); a brazier's pop every 10 to 25 s, heard
## only right beside one (FIRE_REACH: at full within 1 tile, nothing past 2.5); each floor's half as often as the eleventh batch's.
const AMBIENT := {
	"hall": {"name": "breeze", "from": 13.0, "to": 30.0, "vol": 0.9},
	"camp": {"name": "breeze", "from": 13.0, "to": 30.0, "vol": 0.9},
	"fire": {"name": "fire_pop", "from": 10.0, "to": 25.0, "vol": 2.15},
}
const AMBIENT_FLOORS := {
	1: [{"name": "amb_f1", "from": 10.0, "to": 30.0, "vol": 1.0}],
	2: [{"name": "amb_f2", "from": 16.0, "to": 40.0, "vol": 1.0}],
	3: [{"name": "amb_f3", "from": 12.0, "to": 32.0, "vol": 1.0}],
	4: [{"name": "amb_f4", "from": 16.0, "to": 40.0, "vol": 1.13}],
	6: [{"name": "amb_f6", "from": 20.0, "to": 48.0, "vol": 1.0}],
	7: [{"name": "amb_f7", "from": 20.0, "to": 50.0, "vol": 1.0}],
	8: [{"name": "amb_f8", "from": 50.0, "to": 100.0, "vol": 1.0}],
	10: [{"name": "amb_f10", "from": 6.0, "to": 20.0, "vol": 2.36}, {"name": "amb_f10_bog", "from": 12.0, "to": 30.0, "vol": 1.16}],
	14: [{"name": "amb_f14", "from": 16.0, "to": 40.0, "vol": 1.28}],
}
const FIRE_REACH := {"near": 1.0, "far": 2.5}


## A place come into: its sounds now and then (a list of AMBIENT's), each countdown begun afresh.
func ambient(list: Array) -> void:
	_amb = []
	amb_near.clear()
	for a in list:
		var d: Dictionary = a.duplicate()
		d["left"] = randf_range(float(a["from"]), float(a["to"]))
		_amb.append(d)


## (the names of the place's sounds now and then, for the checks)
func ambient_names() -> Array:
	return _amb.map(func(a): return a["name"])


## (world_sounds.ts byNearness) How loud a sound `d` tiles away is heard: full within `near`, nothing past `far`.
static func by_nearness(d: float, near: float, far: float) -> float:
	if d <= near:
		return 1.0
	if d >= far:
		return 0.0
	return 1.0 - (d - near) / (far - near)


func _process(dt: float) -> void:
	_clock += dt
	for a in _amb:
		a["left"] -= dt
		if a["left"] > 0.0:
			continue
		a["left"] = randf_range(float(a["from"]), float(a["to"]))
		var vol: float = float(a["vol"]) * float(amb_near.get(a["name"], 1.0))
		if vol > 0.02:
			play(a["name"], linear_to_db(minf(vol, 4.0)))


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
