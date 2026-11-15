## What the monsters' moves mark on the floor, and what each does when its time comes (game.ts zones and perils; game/
## action_f1.ts). Pink and gold are the enemy's (CLAUDE.md: what glows on a friend is cyan). Drawn on the floor, under
## everyone; the game's own pictures of them (render/act1_fx, art/action_f1_fx.ts) are to come: these are stand-ins.
##   warn  a slam's red circle: when its time is out, whoever is within it (and 0.1) is struck.
##   lane  a charge's line, from the troll through where the hero stood and on: drawn while he winds up and as he runs it.
##   aim   the marksman's line of aim, run out as he draws (it follows the hero until 0.4 s before he looses).
##   rain  the arrow rain's ring, where the hero stood as the archer loosed: struck 1.5 s later, the arrows standing a while.
##   bars  the Lockdown: the bars' shadows in rows across the Warden's hall as his keys go up; at the crash a hero within 0.42
##         of a row is struck, a cell is safe; then the bars stand 1.5 s as a cage the hero cannot walk through.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const MM := preload("res://scripts/monster_moves.gd")

const ENEMY := Color(0.96, 0.27, 0.47)
const GOLD := Color(1.0, 0.78, 0.35)
const SHADOW := Color(0.02, 0.02, 0.07)

var map: FloorMap
var hero  # hero.gd
var sfx  # sfx.gd
var list: Array = []


func warn(x: float, y: float, r: float, dur: float, dmg: float, src: Object) -> void:
	list.append({"kind": "warn", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "dmg": dmg, "src": src})


func lane(src: Object, a: Vector2, b: Vector2, half: float, dur: float) -> void:
	list.append({"kind": "lane", "a": a, "b": b, "half": half, "t": 0.0, "dur": dur, "gone": 0.0, "src": src})


func aim(src: Object, a: Vector2, b: Vector2, dur: float) -> Dictionary:
	var p := {"kind": "aim", "a": a, "b": b, "t": 0.0, "dur": dur, "src": src}
	list.append(p)
	return p


func rain(x: float, y: float, dmg: float) -> void:
	var sticks := PackedVector2Array()
	for i in 26:
		var ang := randf() * TAU
		var d := sqrt(randf()) * MM.RAIN["radius"]
		sticks.append(Vector2(x + cos(ang) * d, y + sin(ang) * d))
	list.append({"kind": "rain", "x": x, "y": y, "t": 0.0, "dmg": dmg, "done": false, "sticks": sticks})


## The Lockdown, cast with the Warden at (x, y): its rows across the room he stands in (action_f1.ts barRows).
func bars(src: Object, x: float, y: float, dmg: float, windup: float) -> void:
	var room = _room_at(x, y)
	if room == null:
		return
	var cell: float = MM.LOCKDOWN["cell"]
	var reach: float = maxf(room["w"], room["h"]) + cell
	var rows_x := PackedFloat32Array()  # rows along x, at a fixed y
	var rows_y := PackedFloat32Array()  # rows along y, at a fixed x
	for k in range(-ceili(reach / cell) - 1, ceili(reach / cell) + 2):
		var d := cell / 2.0 + k * cell
		if absf(d) > reach:
			continue
		if y + d > room["y"] and y + d < room["y"] + room["h"]:
			rows_x.append(y + d)
		if x + d > room["x"] and x + d < room["x"] + room["w"]:
			rows_y.append(x + d)
	list.append({"kind": "bars", "x": x, "y": y, "t": -windup, "dmg": dmg, "done": false, "src": src, "room": room, "rx": rows_x, "ry": rows_y})


## A monster that falls takes its marks with it (game.ts: its warn, lane and aim go).
## A red circle marked on the floor for `dur` seconds, harmless of itself (the Headsman's vault: his own blow does the harm).
func mark(x: float, y: float, r: float, dur: float, src: Object) -> void:
	list.append({"kind": "warn", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "dmg": 0.0, "src": src, "mark": true})


## A ring going out over the floor where a blow came down.
func blast(x: float, y: float, r: float) -> void:
	list.append({"kind": "blast", "x": x, "y": y, "r": r, "t": 0.0})


## THE CULTIST'S FIRE SIGIL (game/action_f2.ts): its clock from -windup (the cast) to its eruption at 0, then the floor burning.
func sigil(x: float, y: float, dmg: float, windup: float, src: Object) -> void:
	list.append({"kind": "sigil", "x": x, "y": y, "t": -windup, "cast": windup, "dmg": dmg, "src": src, "done": 0})


## THE SHADE'S RIME (game/action_f2.ts): frost on the floor that slows the hero while he stands in it.
func rime(x: float, y: float, src: Object) -> void:
	list.append({"kind": "rime", "x": x, "y": y, "t": 0.0, "src": src})


func drop(src: Object, kinds := ["warn", "lane", "aim"]) -> void:
	list = list.filter(func(p): return not (p.get("src") == src and p["kind"] in kinds))


func _process(dt: float) -> void:
	var keep: Array = []
	for p in list:
		p["t"] += dt
		var stays := true
		match p["kind"]:
			"warn":
				if p["t"] >= p["dur"]:
					if not p.get("mark", false):
						sfx.play("slam", -2.0)
						hero.shake()
						if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= p["r"] + 0.1:
							hero.hurt(p["dmg"])
						keep.append({"kind": "blast", "x": p["x"], "y": p["y"], "r": p["r"], "t": 0.0})
					stays = false
				elif p.get("mark", false) and (not is_instance_valid(p["src"]) or p["src"].dead):
					stays = false
			"sigil":
				var at := Vector2(p["x"], p["y"])
				var w = p["src"]
				if p["t"] < -0.05:
					# (its cultist still casting: if it has fallen, or been stopped in its cast, nothing erupts)
					if not is_instance_valid(w) or w.dead or w.state != "windup":
						stays = false
				elif p["done"] == 0 and p["t"] >= 0.0:
					p["done"] = 1
					if hero.alive and hero.world.distance_to(at) <= MM.SIGIL["radius"]:
						hero.hurt(p["dmg"])
					sfx.play("fire")
					hero.kick(2.5)
				elif p["done"] > 0 and p["t"] > MM.SIGIL["strike"]:
					# (the floor burning on: a tick every 0.5 s while he stands in what still burns)
					var next: float = MM.SIGIL["strike"] + MM.SIGIL["every"] * p["done"]
					if p["t"] >= next:
						p["done"] += 1
						if hero.alive and hero.world.distance_to(at) <= MM.burn_radius(p["t"]):
							hero.hurt(p["dmg"] * MM.SIGIL["share"])
				if p["t"] >= MM.SIGIL["pillar"] + MM.SIGIL["fall"] + MM.SIGIL["burn"]:
					stays = false
			"rime":
				var d: Vector2 = hero.world - Vector2(p["x"], p["y"])
				var e := MM.rime_edge(p["t"], atan2(d.y, d.x))
				if e > 0.0 and d.length() <= e:
					hero.chill(0.12, MM.RIME["slow"])
				stays = p["t"] < MM.RIME["lie"]
			"fm_shards", "fm_rings", "fm_fire", "fm_heap", "fm_pit", "fm_rise", "fm_glow":
				# (THE FLESHMANCER'S: its own block below)
				stays = _step_fm(p)
			"blast":
				stays = p["t"] < 0.3
			"rain":
				if not p["done"] and p["t"] >= MM.RAIN["delay"]:
					p["done"] = true
					sfx.play("hit", -4.0)
					if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= MM.RAIN["radius"]:
						hero.hurt(p["dmg"])
				stays = p["t"] < MM.RAIN["delay"] + MM.RAIN["stuck"] + MM.RAIN["gone"]
			"bars":
				var w = p["src"]
				if p["t"] < -0.1 and (not is_instance_valid(w) or w.dead or w.state != "windup"):
					stays = false
				elif not p["done"] and p["t"] >= 0.0:
					p["done"] = true
					sfx.play("slam")
					hero.shake()
					if hero.alive and _on_a_row(p, hero.world):
						hero.hurt(p["dmg"])
				if p["t"] >= MM.LOCKDOWN["stand"] + MM.LOCKDOWN["rise"]:
					stays = false
			_:
				var s = p.get("src")
				if s != null and not is_instance_valid(s):
					stays = false
		if stays:
			keep.append(p)
	list = keep
	queue_redraw()


func _on_a_row(p: Dictionary, at: Vector2) -> bool:
	var band: float = MM.LOCKDOWN["band"]
	for ry in p["rx"]:
		if absf(at.y - ry) <= band:
			return true
	for rx in p["ry"]:
		if absf(at.x - rx) <= band:
			return true
	return false


## THE CAGE (action_f1.ts cageHero): a hero who walked from `was` to `now` is kept on his own side of every row of standing
## bars in the room he was in; where that would put him in a wall, he stays where he was.
func cage(was: Vector2, now: Vector2, r: float) -> Vector2:
	var b := now
	for p in list:
		if p["kind"] != "bars" or p["t"] < 0.0 or p["t"] >= MM.LOCKDOWN["stand"]:
			continue
		var room: Dictionary = p["room"]
		if was.x < room["x"] or was.x >= room["x"] + room["w"] or was.y < room["y"] or was.y >= room["y"] + room["h"]:
			continue
		var b0 := b
		for line in p["rx"]:
			b.y = maxf(b.y, line + r) if was.y >= line else minf(b.y, line - r)
		for line in p["ry"]:
			b.x = maxf(b.x, line + r) if was.x >= line else minf(b.x, line - r)
		if b != b0 and not _fits(b, r):
			b = was
	return b


func _fits(at: Vector2, r: float) -> bool:
	var k := r * 0.95
	for c in [Vector2(-k, -k), Vector2(k, -k), Vector2(-k, k), Vector2(k, k)]:
		var t := map.tile(floori(at.x + c.x), floori(at.y + c.y))
		if t != FloorMap.FLOOR and t != FloorMap.PIT:
			return false
	return true


func _room_at(x: float, y: float):
	for r in map.rooms:
		if x >= r["x"] and x < r["x"] + r["w"] and y >= r["y"] and y < r["y"] + r["h"]:
			return r
	return null


# =============================================================================================================================
# THE FLESHMANCER'S, AND THE MINI FLESHMANCER'S FIRE (game/fm_action.ts stepFm; fleshmancer.gd, minifm.gd): what his moves,
# done the action way, send out. Each has its own clock from his act's beginning (0 as it begins, unless said) and its harm
# rolled once as the act begins. As in the game they go on by themselves once begun, whether he still stands or not. Their
# numbers are his pictures' own, kept in fleshmancer.gd. Drawn as stand-ins for the art chat's painters
# (art/fleshmancer_action_fx.ts, render/act1_fx/fm.ts), on the floor only: what of them would lie across a wall is left out
# (his rules take no heed of walls: what strikes is as the game has it).
#   fm_shards  his two fans of bone shards: drawn up out of the floor and hung before him, each its lane marked; flung at his
#              hammer, 15 tiles a second out to 10 tiles; a hero within 0.3 of a flying shard is struck, once by each. `aim`
#              the first fan's (taken as he begins), `aim2` the second's (taken as it is drawn up, in the first's gaps).
#   fm_rings   his five rings of hands round where he stood: the cracks lit; rings 1, 3 and 5 burst up at his first slam, 2
#              and 4 at his second; a hero within 0.5 of a hand as its ring comes up (and 0.3 s after) is struck, once a ring.
#   fm_fire    his fire, or a mini fleshmancer's (`mini`): the stream whipped round, the floor left burning in lanes where it
#              gouted; a hero in the stream, or in a lane burning, is burned every 0.22 s (in a lane, half as much).
#   fm_heap    a bone heap of his hall shaking while he summons and bursting as its dead come up (drawn only).
#   fm_pit     the pit of his dead under him as he is dragged down (drawn only).
#   fm_rise    where he will rise, marked a second before he erupts; its 0 his eruption: a hero within 2 tiles of it then is
#              struck and thrown back.
#   fm_glow    his light on the floor where one of the dead he has called comes up (drawn only).

const FM := preload("res://scripts/fleshmancer.gd")

## (art/mkit.ts FLAME, the enemy's fire, hot and white-hot; bone; his dead's flesh, dark and lit; scorched stone)
const FM_HOT := Color("#ffb070")
const FM_WHITE := Color("#fff6e0")
const FM_BONE := Color("#f2e8d4")
const FM_FLESH := Color("#1c0a1e")
const FM_FLESH_LIT := Color("#82306e")
const FM_CHAR := Color("#170b14")
## (art/fleshmancer.ts FM_HAND_FRAMES at FM_HAND_FPS: how long a ring's hands stand up out of the floor)
const FM_HAND_TIME := 24.0 / 20.0


func fm_shards(at: Vector2, aim: float, dmg: float) -> void:
	list.append({"kind": "fm_shards", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.FM2["lasts"]["shards"], "dmg": dmg, "aim": aim, "aim2": NAN, "struck": 0})


func fm_rings(at: Vector2, aim: float, dmg: float) -> void:
	list.append({"kind": "fm_rings", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.FM2["lasts"]["rings"], "dmg": dmg, "aim": aim, "struck": 0})


## `face`, `hand`: the way he faced as he began, and the hand he is drawn with (the stream turns to the left he is drawn with).
func fm_fire(at: Vector2, face: Vector2, hand: int, dmg: float, mini: bool) -> void:
	var dur: float = FM.FM2["lasts"]["mini" if mini else "fire"]
	list.append({"kind": "fm_fire", "x": at.x, "y": at.y, "t": 0.0, "dur": dur, "dmg": dmg, "face": face, "hand": hand, "mini": mini, "last": -1.0})


## `which`: which of the heaps he calls on it is (each bursts a little after the one before).
func fm_heap(at: Vector2, which: int) -> void:
	list.append({"kind": "fm_heap", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.RAISE_LONG + 0.8, "which": which})


func fm_pit(at: Vector2) -> void:
	list.append({"kind": "fm_pit", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.FM2["sink"]})


## `before`: how long until he erupts there.
func fm_rise(at: Vector2, before: float, dmg: float) -> void:
	list.append({"kind": "fm_rise", "x": at.x, "y": at.y, "t": -before, "dur": 1.0, "dmg": dmg, "done": false})


## `before`: how long until it begins; `secs`: how long it burns before the dead one stands.
func fm_glow(at: Vector2, before: float, secs: float) -> void:
	list.append({"kind": "fm_glow", "x": at.x, "y": at.y, "t": -before, "dur": secs + 0.3, "secs": secs})


## A step of one of his perils (stepFm). False: it is over.
func _step_fm(p: Dictionary) -> bool:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var h: Vector2 = hero.world
	match p["kind"]:
		"fm_shards":
			# (the second fan's aim, as it is drawn up: turned toward where the hero is then by whole steps of the first fan's,
			# so that it still hangs in the first one's gaps: who stood in a gap of the first is struck by the second)
			if is_nan(p["aim2"]) and t >= FM.SHARD_DRAW[1][0]:
				var step: float = FM.SHARDS["apart"] * PI / 180.0
				var off: float = atan2(h.y - at.y, h.x - at.x) - float(p["aim"])
				p["aim2"] = float(p["aim"]) + step * floorf(atan2(sin(off), cos(off)) / step + 0.5)
			if t >= FM.SHARD_HITS[0]:
				for s in FM.shards_now(t, p["aim"], p["aim2"]):
					var bit: int = 1 << int(s["i"])
					if s["state"] != "flying" or (int(p["struck"]) & bit) != 0:
						continue
					if h.distance_to(at + Vector2(s["x"], s["y"])) > FM.SHARDS["r"]:
						continue
					p["struck"] = int(p["struck"]) | bit
					hero.hurt(p["dmg"])
		"fm_rings":
			for i in FM.RINGS["radii"].size():
				var burst := FM.ring_burst(i)
				if t < burst or t > burst + FM.FM2["handUp"] or (int(p["struck"]) & (1 << i)) != 0:
					continue
				if not FM.ring_strikes(i, h - at, p["aim"]):
					continue
				p["struck"] = int(p["struck"]) | (1 << i)
				hero.hurt(p["dmg"])
				hero.kick(1.5)
		"fm_fire":
			if t - float(p["last"]) >= FM.FM2["tick"]:
				var rel := FM.from_figure(at, p["face"], p["hand"], h)
				if FM.fire_strikes(t, rel.x, rel.y, p["mini"]):
					p["last"] = t
					hero.hurt(float(p["dmg"]) * (1.0 if FM.in_stream(t, rel.x, rel.y, p["mini"]) else float(FM.FM2["laneShare"])))
		"fm_rise":
			if not p["done"] and t >= 0.0:
				p["done"] = true
				if hero.alive and h.distance_to(at) <= FM.RISE_MARK["r"]:
					hero.hurt(p["dmg"])
					var way := h - at
					hero.knock(way.normalized() if way.length() >= 0.01 else -hero.face, FM.HEAVY_KNOCK)
				hero.kick(4.0)
				sfx.play("slam", -2.0)
	return t < float(p["dur"])


## Is there floor at a place? (His stand-ins are drawn on the floor only, not across a wall into the dark beyond it. What
## strikes goes by his rules alone, as in the game: his shards, rings and fire take no heed of walls.)
func _fm_floor(at: Vector2) -> bool:
	return map.open_at(floori(at.x), floori(at.y))


## How far the floor runs unbroken from `at` the way `u`: from `from` tiles out, to `to` at most.
func _fm_floor_to(at: Vector2, u: Vector2, from: float, to: float) -> float:
	if not _fm_floor(at + u * from):
		return from
	var d := from
	while d < to:
		var next := minf(to, d + 0.25)
		if not _fm_floor(at + u * next):
			return d
		d = next
	return to


func _draw_fm(p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match p["kind"]:
		"fm_shards":
			_draw_fm_shards(p, t, at)
		"fm_rings":
			_draw_fm_rings(p, t, at)
		"fm_fire":
			_draw_fm_fire(p, t, at)
		"fm_heap":
			_draw_fm_heap(int(p["which"]), t, at)
		"fm_pit":
			var open: float = FM.smooth((t - FM.PIT["open"]) / 0.12) * (1.0 - FM.smooth((t - FM.PIT["shut"]) / 0.06))
			_draw_fm_pit(at, FM.PIT["r"] * open)
		"fm_rise":
			_draw_fm_rise(t, at)
		"fm_glow":
			_draw_fm_glow(float(p["secs"]), t, at)


## His shards: each one's lane on the floor while it hangs; the sliver of bone itself, lifted over its floor point and
## pointing its way (drawn up point first, turning to it); a streak of his fire behind one that flies; a flash where it ends.
func _draw_fm_shards(p: Dictionary, t: float, at: Vector2) -> void:
	var hang: float = FM.SHARDS["hang_r"]
	var lane: float = FM.SHARDS["lane"]
	for s in FM.shards_now(t, p["aim"], p["aim2"]):
		var state: String = s["state"]
		var k: float = s["k"]
		var way := Vector2(cos(s["a"]), sin(s["a"]))
		var on := at + Vector2(s["x"], s["y"])
		var foot := Iso.to_screen(on.x, on.y)
		if not _fm_floor(on):
			continue
		if state == "burst":
			draw_polyline(_ring(on.x, on.y, 0.15 + 0.5 * k, 16), Color(FM_HOT, 1.0 - k), 3.0)
			continue
		if state != "flying":
			var a := at + way * (hang + 0.2)
			var b := at + way * _fm_floor_to(at, way, hang + 0.2, lane)
			draw_dashed_line(Iso.to_screen(a.x, a.y), Iso.to_screen(b.x, b.y), Color(ENEMY, 0.2 + 0.6 * k), 2.0, 8.0)
		var tip := foot + Vector2(0.0, -float(s["z"]))
		var dir := Iso.to_screen(way.x, way.y).normalized()
		if state == "rising":
			dir = dir.lerp(Vector2(0, -1), 1.0 - k).normalized()
		draw_line(foot + Vector2(-6, 0), foot + Vector2(6, 0), Color(SHADOW, 0.55), 3.0)
		if state == "flying":
			draw_line(tip - dir * 58.0, tip - dir * 10.0, Color(ENEMY, 0.75), 5.0)
			draw_line(tip - dir * 36.0, tip - dir * 10.0, Color(FM_HOT, 0.9), 3.0)
		draw_line(tip - dir * 30.0, tip, FM_BONE, 4.0)
		draw_line(tip - dir * 30.0, tip - dir * 25.0, ENEMY, 4.0)


## His rings: each one's crack in the floor, its two gaps left dark, lit in his pink from when he rises (the first slam's
## rings hot, the others dim until it), flashing as its hands come up, then dark, and gone; and the hands of his dead standing
## up out of it for 1.2 s (they strike only as they come up: hot then).
func _draw_fm_rings(p: Dictionary, t: float, at: Vector2) -> void:
	var lit: float = FM.RINGS["lit"]
	if t < lit:
		return
	var aim: float = p["aim"]
	var radii: Array = FM.RINGS["radii"]
	for i in radii.size():
		var r: float = radii[i]
		var since := t - FM.ring_burst(i)
		var ring: Dictionary = FM.ring_hands(i)
		if since <= 1.6:
			var up := FM.smooth((t - lit - i * 0.05) / 0.3)
			var heat := 0.38 * up
			if since >= 0.0:
				heat = clampf(1.0 - since / 0.25, 0.0, 1.0)
			elif i in FM.RINGS["first"] or t > FM.RING_HITS[0]:
				heat = up * (0.75 + 0.25 * sin(t * 16.0 + i))
			var fade := 1.0 - (since - 0.9) / 0.7 if since > 0.9 else up
			var col := Color(SHADOW, 0.85 * fade).lerp(Color(ENEMY, fade), heat)
			if since >= 0.0 and since < 0.2:
				col = FM_WHITE
			var arc := PackedVector2Array()
			for k in 97:
				var a := TAU * k / 96.0
				var on := at + Vector2(cos(aim + a), sin(aim + a)) * r
				if FM.in_gap(a, ring["gaps"], ring["step"], 0.02) or not _fm_floor(on):
					if arc.size() > 1:
						draw_polyline(arc, col, 3.0)
					arc = PackedVector2Array()
					continue
				arc.append(Iso.to_screen(on.x, on.y))
			if arc.size() > 1:
				draw_polyline(arc, col, 3.0)
		if since >= 0.0 and since < FM_HAND_TIME:
			var tall := 38.0 * clampf(since / 0.1, 0.0, 1.0) * clampf((FM_HAND_TIME - since) / 0.35, 0.0, 1.0)
			var hot: bool = since <= FM.FM2["handUp"]
			for a in ring["hands"]:
				var on := at + Vector2(cos(aim + a), sin(aim + a)) * r
				if not _fm_floor(on):
					continue
				var foot := Iso.to_screen(on.x, on.y)
				draw_line(foot, foot + Vector2(0, -tall), FM_HOT if hot else FM_FLESH_LIT, 3.0)
				draw_line(foot + Vector2(-4, -tall), foot + Vector2(4, -tall), FM_BONE, 3.0)


## His fire: the lanes left burning where the stream gouted (each dying back from its end toward him over its last moments,
## then scorched stone a while), and the stream itself, out of him to its reach, white-hot at its heart.
func _draw_fm_fire(p: Dictionary, t: float, at: Vector2) -> void:
	var mini: bool = p["mini"]
	var size: Dictionary = FM.MINI_FIRE if mini else FM.FIRE
	var face: Vector2 = p["face"]
	var hand: int = p["hand"]
	var land: float = size["land"]
	var reach: float = size["reach"]
	var burn: float = size["burn"]
	var die: float = size["die"]
	var scorch: float = size["scorch"]
	var lane_half: float = size["laneHalf"]
	for l in FM.fire_lanes(mini):
		var since: float = t - float(l["at"])
		if since < 0.0 or since > burn + scorch:
			continue
		var u := FM.beside(Vector2.ZERO, face, hand, cos(l["a"]), sin(l["a"]))
		var far := _fm_floor_to(at, u, land, reach)
		if far <= land + 0.05:
			continue
		var cool := clampf((since - burn) / scorch, 0.0, 1.0)
		draw_colored_polygon(_band(at + u * land, at + u * far, lane_half), Color(FM_CHAR, 0.6 * (1.0 - cool)))
		if since > burn:
			continue
		var out := minf(far, reach if since < burn - die else land + (reach - land) * clampf(1.0 - (since - (burn - die)) / die, 0.0, 1.0))
		if out > land + 0.05:
			var flick := 0.75 + 0.25 * sin(t * 19.0 + float(l["a"]) * 7.0)
			draw_colored_polygon(_band(at + u * land, at + u * out, lane_half), Color(ENEMY, 0.55 * flick))
			draw_colored_polygon(_band(at + u * land, at + u * out, lane_half * 0.45), Color(FM_HOT, 0.75 * flick))
	var now := FM.fire_way(t, mini)
	if is_nan(now):
		return
	var w := FM.beside(Vector2.ZERO, face, hand, cos(now), sin(now))
	var half: float = size["half"]
	var run := _fm_floor_to(at, w, land, reach)
	if run <= land + 0.05:
		return
	draw_colored_polygon(_band(at + w * land, at + w * run, half), Color(ENEMY, 0.7))
	draw_colored_polygon(_band(at + w * land, at + w * run, half * 0.6), Color(FM_HOT, 0.9))
	draw_colored_polygon(_band(at + w * land, at + w * run, half * 0.25), FM_WHITE)
	# (out of the skull's jaws, or from between a mini's claws, down onto the floor where it lands)
	var mouth := Iso.to_screen(at.x, at.y) + Vector2(0.0, -40.0 if mini else -70.0)
	draw_line(mouth, Iso.to_screen(at.x + w.x * land, at.y + w.y * land), FM_HOT, 5.0)


## A bone heap: the floor round it lit from under in his pink, beating faster, while he summons; a ring of bone and grave
## dirt thrown out as its dead come up.
func _draw_fm_heap(which: int, t: float, at: Vector2) -> void:
	var shake := FM.heap_shake(t)
	var since: float = t - (FM.RAISE_HIT + which * float(FM.HEAP["apart"]))
	var glow := shake * (0.7 + 0.3 * sin(t * (20.0 + 20.0 * shake) + which)) if since < 0.0 else clampf(1.0 - since / 0.5, 0.0, 1.0)
	if glow > 0.02:
		draw_colored_polygon(_ring(at.x, at.y, 0.62), Color(ENEMY, 0.3 * glow))
		draw_polyline(_ring(at.x, at.y, 0.62), Color(ENEMY, 0.95 * glow), 3.0)
	var long: float = FM.HEAP["long"]
	if since >= 0.0 and since <= long:
		var k := since / long
		var far: float = float(FM.HEAP["throw"]) * (1.0 - (1.0 - k) * (1.0 - k))
		draw_polyline(_ring(at.x, at.y, far), Color(FM_BONE, 1.0 - k), 3.0)
		draw_polyline(_ring(at.x, at.y, far * 0.6), Color(FM_HOT, 0.8 * (1.0 - k)), 2.0)


## The pit of his dead, `r` tiles round: a churning dark mass, his pink fire at its lip.
func _draw_fm_pit(at: Vector2, r: float) -> void:
	if r <= 0.02:
		return
	draw_colored_polygon(_ring(at.x, at.y, r), Color(FM_FLESH, 0.92))
	draw_polyline(_ring(at.x, at.y, r * 0.6), Color(FM_FLESH_LIT, 0.8), 2.0)
	draw_polyline(_ring(at.x, at.y, r), Color(ENEMY, 0.9), 2.0)


## Where he will rise, `t` seconds from his eruption (negative before): the ring of his fire filling in round it, the pit of
## his dead opening in its middle; then the burst, thrown out to the ring.
func _draw_fm_rise(t: float, at: Vector2) -> void:
	var warn: float = FM.RISE_MARK["warn"]
	var r: float = FM.RISE_MARK["r"]
	var out: float = FM.RISE_MARK["out"]
	var pit: float = FM.PIT["r"]
	if t < -warn or t > 0.9:
		return
	if t < 0.0:
		var k := 1.0 - (-t) / warn
		var ring := _ring(at.x, at.y, r, 60)
		var n := maxi(2, int(ring.size() * (0.25 + 0.75 * FM.smooth(k * 1.6))))
		var beat := 0.65 + 0.35 * sin(t * (18.0 + 30.0 * k))
		draw_colored_polygon(_ring(at.x, at.y, r), Color(ENEMY, 0.05 + 0.15 * k))
		draw_polyline(ring.slice(0, n), Color(ENEMY, 0.55 + 0.45 * beat), 3.0)
		draw_polyline(_ring(at.x, at.y, r * k * 0.9), Color(ENEMY, 0.45), 2.0)
		_draw_fm_pit(at, pit * 1.15 * minf(1.0, 0.45 + 0.75 * k))
		return
	_draw_fm_pit(at, pit * (1.0 - FM.smooth(t / 0.5)))
	if t < out + 0.12:
		var k := clampf(t / out, 0.0, 1.0)
		draw_polyline(_ring(at.x, at.y, r * FM.smooth(k)), FM_WHITE if k < 0.5 else FM_HOT, 6.0)
		draw_polyline(_ring(at.x, at.y, r * FM.smooth(k) * 0.9), Color(ENEMY, 0.9), 3.0)


## His light where one of the dead comes up: swelling as it stirs, a flash as it stands, and gone.
func _draw_fm_glow(secs: float, t: float, at: Vector2) -> void:
	if t < 0.0:
		return
	var k := FM.smooth(t / 0.3) * (1.0 - FM.smooth((t - secs) / 0.3))
	var slam := 1.0 - FM.smooth(absf(t - secs) / 0.08)
	if k <= 0.02 and slam <= 0.02:
		return
	draw_colored_polygon(_ring(at.x, at.y, 0.45 + 0.25 * slam, 24), Color(ENEMY, 0.3 * k + 0.4 * slam))
	draw_polyline(_ring(at.x, at.y, 0.45 + 0.25 * slam, 24), Color(FM_HOT, 0.6 * k + 0.4 * slam), 2.0)


# --- drawing: a circle on the floor is an ellipse on the screen ---

func _ring(x: float, y: float, r: float, n := 40) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := TAU * i / n
		pts.append(Iso.to_screen(x + cos(a) * r, y + sin(a) * r))
	return pts


func _band(a: Vector2, b: Vector2, half: float) -> PackedVector2Array:
	var d := (b - a).normalized()
	var s := Vector2(-d.y, d.x) * half
	return PackedVector2Array([Iso.to_screen((a + s).x, (a + s).y), Iso.to_screen((b + s).x, (b + s).y), Iso.to_screen((b - s).x, (b - s).y), Iso.to_screen((a - s).x, (a - s).y)])


func _draw() -> void:
	for p in list:
		match p["kind"]:
			"warn":
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				var ring := _ring(p["x"], p["y"], p["r"])
				draw_colored_polygon(ring, Color(ENEMY, 0.10 + 0.25 * k))
				draw_polyline(ring, Color(ENEMY, 0.9), 2.0)
				if k > 0.02:
					draw_polyline(_ring(p["x"], p["y"], p["r"] * k), Color(ENEMY, 0.7), 2.0)
			"blast":
				var k: float = p["t"] / 0.3
				draw_polyline(_ring(p["x"], p["y"], p["r"] * (0.6 + 0.5 * k)), Color(1, 0.75, 0.8, 1.0 - k), 4.0)
			"fm_shards", "fm_rings", "fm_fire", "fm_heap", "fm_pit", "fm_rise", "fm_glow":
				# (THE FLESHMANCER'S: its own block below)
				_draw_fm(p)
			"lane":
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				var a: Vector2 = p["a"]
				var b: Vector2 = p["b"]
				var from := a.lerp(b, p["gone"])
				draw_colored_polygon(_band(from, b, p["half"]), Color(ENEMY, 0.12 + 0.2 * k))
				var edge := _band(from, b, p["half"])
				edge.append(edge[0])
				draw_polyline(edge, Color(ENEMY, 0.85), 2.0)
			"aim":
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				var a: Vector2 = p["a"]
				var b: Vector2 = a.lerp(p["b"], k)
				var lift := Vector2(0, -40)
				draw_line(Iso.to_screen(a.x, a.y) + lift, Iso.to_screen(b.x, b.y) + lift, Color(GOLD, 0.5 + 0.5 * k), 2.0)
				draw_line(Iso.to_screen(a.x, a.y), Iso.to_screen(b.x, b.y), Color(GOLD, 0.25), 1.0)
			"rain":
				var t: float = p["t"]
				var R: float = MM.RAIN["radius"]
				var delay: float = MM.RAIN["delay"]
				if t < delay:
					var k := t / delay
					draw_colored_polygon(_ring(p["x"], p["y"], R), Color(GOLD, 0.06 + 0.2 * k))
					draw_polyline(_ring(p["x"], p["y"], R), Color(GOLD, 0.9), 2.0)
					draw_polyline(_ring(p["x"], p["y"], R * (1.0 - k)), Color(GOLD, 0.6), 2.0)
				else:
					var fade := clampf(1.0 - (t - delay - MM.RAIN["stuck"]) / MM.RAIN["gone"], 0.0, 1.0)
					for s in p["sticks"]:
						var at := Iso.to_screen(s.x, s.y)
						draw_line(at, at + Vector2(3, -14), Color(0.8, 0.72, 0.58, fade), 2.0)
			"bars":
				_draw_bars(p)
			"sigil":
				_draw_sigil(p)
			"rime":
				_draw_rime(p)


## The fire sigil (a stand-in for the art chat's pictures, art/action_f2_fx.ts sigilPainted): its ring traced round under the hero as
## the cultist casts, its inner ring and marks brightening; the pillar of fire as it erupts; the floor burning on, shrinking in.
func _draw_sigil(p: Dictionary) -> void:
	var t: float = p["t"]
	var R: float = MM.SIGIL["radius"]
	var fire := Color(1.0, 0.62, 0.22)
	var hot := Color(1.0, 0.98, 0.9)
	if t < 0.0:
		var k := clampf(1.0 - (-t) / maxf(0.01, float(p["cast"])), 0.0, 1.0)
		var traced := clampf(k / 0.4, 0.0, 1.0)
		var ring := _ring(p["x"], p["y"], R, 48)
		var n := maxi(2, int(ring.size() * traced))
		draw_polyline(ring.slice(0, n), Color(ENEMY, 0.85), 3.0)
		draw_colored_polygon(_ring(p["x"], p["y"], R), Color(fire, 0.08 + 0.22 * k))
		if k > 0.4:
			draw_polyline(_ring(p["x"], p["y"], R * 0.62), Color(fire, 0.4 + 0.5 * k), 2.0)
		return
	var pillar: float = MM.SIGIL["pillar"] + MM.SIGIL["fall"]
	if t < pillar:
		var up := 1.0 - clampf((t - MM.SIGIL["pillar"]) / MM.SIGIL["fall"], 0.0, 1.0)
		var base := Iso.to_screen(p["x"], p["y"])
		var half := R * 32.0 * 0.8
		var tall := 200.0 * up
		draw_colored_polygon(PackedVector2Array([base + Vector2(-half, 0), base + Vector2(-half * 0.7, -tall), base + Vector2(half * 0.7, -tall), base + Vector2(half, 0)]), Color(fire, 0.55 * up))
		draw_colored_polygon(PackedVector2Array([base + Vector2(-half * 0.4, 0), base + Vector2(-half * 0.25, -tall * 0.9), base + Vector2(half * 0.25, -tall * 0.9), base + Vector2(half * 0.4, 0)]), Color(hot, 0.7 * up))
	var rr := MM.burn_radius(t)
	if rr > 0.02:
		draw_colored_polygon(_ring(p["x"], p["y"], rr), Color(fire, 0.32))
		draw_polyline(_ring(p["x"], p["y"], rr), Color(ENEMY, 0.7), 2.0)


## The rime (a stand-in for art/action_f2_fx.ts rimePainted): a ragged crust of pale grey-blue frost, spreading, then melting in.
func _draw_rime(p: Dictionary) -> void:
	var t: float = p["t"]
	var pts := PackedVector2Array()
	for k in 40:
		var a := TAU * k / 40.0
		var e := MM.rime_edge(t, a)
		pts.append(Iso.to_screen(p["x"] + cos(a) * e, p["y"] + sin(a) * e))
	if MM.rime_edge(t, 0.0) <= 0.01:
		return
	var frost := Color(0.78, 0.8, 0.9)
	draw_colored_polygon(pts, Color(frost, 0.35))
	pts.append(pts[0])
	draw_polyline(pts, Color(0.62, 0.65, 0.8, 0.8), 2.0)


func _draw_bars(p: Dictionary) -> void:
	var room: Dictionary = p["room"]
	var x0: float = room["x"]
	var x1: float = room["x"] + room["w"]
	var y0: float = room["y"]
	var y1: float = room["y"] + room["h"]
	var t: float = p["t"]
	if t < 0.0:
		# (the bars' shadows across the floor as his keys go up, darker as the crash comes)
		var k := clampf(1.0 + t, 0.0, 1.0)
		var c := Color(SHADOW, 0.25 + 0.5 * k)
		for ry in p["rx"]:
			draw_line(Iso.to_screen(x0, ry), Iso.to_screen(x1, ry), c, 6.0)
		for rx in p["ry"]:
			draw_line(Iso.to_screen(rx, y0), Iso.to_screen(rx, y1), c, 6.0)
		return
	# (standing: iron bars along every row, 52 game pixels tall, sinking away at the end)
	var stand: float = MM.LOCKDOWN["stand"]
	var sink := clampf((t - stand) / MM.LOCKDOWN["rise"], 0.0, 1.0)
	var tall := 104.0 * (1.0 - sink)
	var iron := Color(0.55, 0.52, 0.66)
	var hot := Color(ENEMY, 0.6 * (1.0 - sink))
	for ry in p["rx"]:
		var x := x0 + 0.25
		while x < x1:
			var at := Iso.to_screen(x, ry)
			draw_line(at, at + Vector2(0, -tall), iron, 3.0)
			x += 0.5
		draw_line(Iso.to_screen(x0, ry) + Vector2(0, -tall), Iso.to_screen(x1, ry) + Vector2(0, -tall), hot, 3.0)
	for rx in p["ry"]:
		var y := y0 + 0.25
		while y < y1:
			var at := Iso.to_screen(rx, y)
			draw_line(at, at + Vector2(0, -tall), iron, 3.0)
			y += 0.5
		draw_line(Iso.to_screen(rx, y0) + Vector2(0, -tall), Iso.to_screen(rx, y1) + Vector2(0, -tall), hot, 3.0)
