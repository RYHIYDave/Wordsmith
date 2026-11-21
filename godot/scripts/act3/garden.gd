## FLOOR 16, THE SWAN GARDENS: ITS NETTLE BEDS AND HER VINE IN THE YEW (game/act2/garden_rules.ts; game.ts updateGardens, walkPace,
## the monsters' pace). His doc, level 16's hazards: "nettle beds that sting and slow whoever walks through them; the lake's deep
## water" (the lake is the floor's own: never walked). The beds are the export's (floor16/land.json `garden`: tools/godot_export.ts).
##   WHOEVER WALKS THROUGH THEM: the hero (not in the air of his leap), and every monster on foot (never the boss, nor what flies);
##   STUNG: 0.15 s after stepping in, and every 0.8 s while in them, 4% of life (the hero's before his armour, as the spike floor's;
##     a monster's its own); stepping out and back in stings no sooner than the last sting's 0.8 s;
##   SLOWED: by 0.4 while in them, and for 0.5 s after (hero.gd walk_pace, act1.gd: `nettle_k`); untinted, no chill;
##   AND THEY STIR: a patch someone is in shows stirred, and for 0.45 s after (the look's states `nettle<i>`: the art's two pictures).
## HER VINE IN THE YEW (the art's README: “show the first; as the hero comes near, play the rest once and keep the last (as the
## nettles stir)”): its first picture until he comes within 3.5 tiles, then its other three once at six a second, the last kept (the
## look's state `yew<i>`).
## Heard (the floors' scene sounds): walking into a bed, and each sting of his in one, no oftener than every half second.
extends Node

const NETTLES := {"first": 0.15, "every": 0.8, "share": 0.04, "slow": 0.4, "after": 0.5, "stir": 0.45}
const YEW_VINE := {"near": 3.5, "fps": 6.0}
const HEARD_GAP := 0.5

var main
var _bed := PackedByteArray()
var _w := 0
var _h := 0
## (what each body keeps of the nettles, by who it is: {ready: when it may next be stung, slow: how long it stays slowed, was: in
## them last step})
var _stung := {}
## (the tiles stirred, and how long yet)
var _stir := {}
## (the look's states of the patches, by tile)
var _patch := {}
var _vines: Array = []
var _shown := {}
var _time := 0.0
var _in_bed := false
var _heard := 0.0


func on() -> bool:
	return not _bed.is_empty()


## A place come into: its beds, and the look's states of its patches and of her vine.
func enter(where: String) -> void:
	_bed = PackedByteArray()
	_stung = {}
	_stir = {}
	_patch = {}
	_vines = []
	_shown = {}
	_in_bed = false
	if main.hero != null:
		main.hero.nettle_k = 1.0
	if main.is_home(where) or main.map == null or main.map.land == null:
		return
	var G = main.map.land.get("garden")
	if G == null:
		return
	var M = main.map
	_w = M.w
	_h = M.h
	_bed.resize(_w * _h)
	for r in G["nettles"]:
		for y in range(int(r[1]), int(r[3])):
			for x in range(int(r[0]), int(r[2])):
				if M.tiles[y * _w + x] != 0:
					_bed[y * _w + x] = 1
	if main.look != null:
		var V: Dictionary = main.look.data.get("variants", {})
		for name in V:
			var v: Dictionary = V[name]
			match str(v.get("kind", "")):
				"nettle":
					var i: int = int(v["at"]["ty"]) * _w + int(v["at"]["tx"])
					if not _patch.has(i):
						_patch[i] = []
					_patch[i].append(name)
				"yew":
					_vines.append({"name": name, "at": Vector2(float(v["at"]["x"]), float(v["at"]["y"])), "t": -1.0})


## Is world (x, y) in a bed of nettles?
func in_nettles(p: Vector2) -> bool:
	var tx := floori(p.x)
	var ty := floori(p.y)
	return not _bed.is_empty() and tx >= 0 and ty >= 0 and tx < _w and ty < _h and _bed[ty * _w + tx] == 1


## How fast a body goes for the nettles: 1, or 0.6 while in them and a moment after.
func slow_of(who) -> float:
	var s = _stung.get(who)
	return 1.0 - float(NETTLES["slow"]) if s != null and float(s["slow"]) > 0.0 else 1.0


func _process(dt: float) -> void:
	if _bed.is_empty() or main == null or main.map == null or get_tree().paused:
		return
	_time += dt
	_heard = maxf(0.0, _heard - dt)
	var hero = main.hero
	# (who is in the nettles is slowed, and stung when it is time)
	if hero.alive and hero._act != "lunge":
		if _step(hero, hero.world, dt):
			hero.hurt_by(hero.max_life * float(NETTLES["share"]), "phys", [], {}, null, hero.world)
			_hear(0.8)
	hero.nettle_k = slow_of(hero)
	if main._monsters != null:
		for m in main._monsters.list:
			if not is_instance_valid(m) or m.dead or m.boss or m.kind == "bat":
				continue
			if _step(m, m.world, dt):
				m.hurt(maxf(1.0, roundf(m.max_life * float(NETTLES["share"]))))
			m.nettle_k = slow_of(m)
	# (heard: walking into a bed)
	var in_bed: bool = hero.alive and hero._act != "lunge" and in_nettles(hero.world)
	if in_bed and not _in_bed:
		_hear(0.6)
	_in_bed = in_bed
	# (the nettles stirred where someone is, and a moment after)
	for i in _stir.keys():
		var left: float = float(_stir[i]) - dt
		for name in _patch.get(i, []):
			_put(name, 1.0 if left > 0.0 else 0.0)
		if left > 0.0:
			_stir[i] = left
		else:
			_stir.erase(i)
	# (her vine in the yew: its first picture until he is near, then the rest once, and the last kept)
	for v in _vines:
		if float(v["t"]) < 0.0:
			if hero.world.distance_to(v["at"]) > float(YEW_VINE["near"]):
				continue
			v["t"] = 0.0
		else:
			v["t"] = float(v["t"]) + dt
		_put(v["name"], minf(3.0, floorf(float(v["t"]) * float(YEW_VINE["fps"])) + 1.0) / 3.0)


## A step of one body: true if it is stung now.
func _step(who, at: Vector2, dt: float) -> bool:
	var tx := floori(at.x)
	var ty := floori(at.y)
	var i := ty * _w + tx
	var in_bed: bool = tx >= 0 and ty >= 0 and tx < _w and ty < _h and _bed[i] == 1
	var s = _stung.get(who)
	if not in_bed:
		if s != null:
			s["slow"] = maxf(0.0, float(s["slow"]) - dt)
			s["was"] = false
		return false
	if s == null:
		s = {"ready": 0.0, "slow": 0.0, "was": false}
		_stung[who] = s
	if not s["was"]:
		s["ready"] = maxf(float(s["ready"]), _time + float(NETTLES["first"]))
	s["was"] = true
	s["slow"] = NETTLES["after"]
	_stir[i] = NETTLES["stir"]
	if _time >= float(s["ready"]):
		s["ready"] = _time + float(NETTLES["every"])
		return true
	return false


func _hear(vol: float) -> void:
	if _heard > 0.0 or main.sfx == null:
		return
	_heard = HEARD_GAP
	main.sfx.play("nettle", linear_to_db(vol))


## A state of the look shown at `k` (0, the first: none of it shown).
func _put(name: String, k: float) -> void:
	if is_equal_approx(float(_shown.get(name, -1.0)), k):
		return
	_shown[name] = k
	if main.look == null:
		return
	if k <= 0.0:
		main.look.clear_variant(name)
	else:
		main.look.show_variant(name, k)
