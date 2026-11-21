## THE CANTOR (floor 8's boss, Echo Canyon, "The Cantor's Gorge"), as the game fights him (game/act1_rules/cantor.ts RULES,
## CANTOR_GAIT, CANTOR_ACTS, CANTOR, ECHOED, ECHO_MOVES, COPY, onPicture, shoutOut, shoutBack, shoutFrom, strikeSpot, sing, rock,
## rocksRound, rocksOver; game/boss_calls.ts his lines). The owner's doc: "The cult's choirmaster, leading the chant down the
## supply road. Everything he does echoes off the canyon walls a beat later." His pictures are the art chat's (his baked figure:
## its lists `attack`, `shout`, `copies`, `rockfall` paint his bell's rings and cracks, his shout's waves, his copies tearing
## away, his six rocks and their shadows); what he lays on the floor besides is act1/cantor_marks.gd's.
##   HIS PROCESSION: 1.4 tiles a second (the bosses' paces), his walk painted for 0.8 and played faster to match, 1.5 s round;
##     he stops as it comes round, from 2.3 tiles, and sets off again beyond 2.9. Struck as he walks, he walks on.
##   HIS STAFF STRIKE (his basic blow, within 3.1 tiles; list `attack`, 2.2 s): brought down at 1.0 s: a hero from 0.2 behind
##     him to 0.35 past where the bell comes down (2.73 tiles before him, 0.29 to his right) and within 0.6 of its line is
##     struck, x1; the screen kicked 4. A beat later (0.45 s) its echo strikes the same spot again: within 0.8 of it, x0.5; the
##     spot glows meanwhile (from 0.1 s after the blow).
##   HIS SHOUT (within 5 tiles, every 8 s, first 3 s in; list `shout`, 2.2 s, x0.8): its reach marked from 0.3 s; at 1.0 s the
##     wave rolls out from 0.18 before him, from 0.41 to 4.87 tiles in 0.5 s, 1.15 radians to either side: whoever its front
##     passes is struck and thrown back from him; at 1.45 s it comes back from beyond him, from 5.23 down to 0.77 tiles, 1.0
##     radian to either side: struck again, thrown toward him once the going out is over. Each once.
##   HIS SOUND-COPIES (within 7 tiles, every 13 s, first 6 s in, and not while those he sent out last are about; list
##     `copies`, 2.2 s): the bell rung three times; at 0.62 s "rings out his echoes"; as the move ends two copies stand where
##     his picture tore them away, 1.17 tiles to either side, still a beat (0.18 s, 0.36 s) behind him; each plays its end of
##     his move, then turns to the hero and REPEATS HIS LAST MOVE (his strike, his shout or his rockfall) from where it stands,
##     each blow x0.6 of a roll of his; then it rings out (0.4 s) and is gone. They are sound: nothing strikes them.
##   HIS ROCKFALL (within 9 tiles, every 14 s, first 8 s in; list `rockfall`, 2.6 s): the staff planted (0.4 s, the bell
##     tolls); he sings from 0.75 to 1.9 s (the rim rumbling); the six rocks his picture brings down round him land from 1.3 to
##     1.9 s where it lays them, each harming within 0.55 of where it lands; and his voice shakes three more loose over the
##     hero, the first on his tile, the others a tile or two from it, landing at 1.42, 1.66 and 1.9 s, each harming whoever
##     is on its tile; each struck is knocked 0.5 of a step.
##   HIS LINES as he begins his shout, his copies, his rockfall (never two within 5 s): "LISTEN!", "My choir, sing!", "Let the
##     stones sing.".
##   AS HE DIES his copies ring out and fade, and what of his own rocks is still to fall round him falls no more.
## His marks (perils.gd "a1"; act1/cantor_marks.gd steps and draws them):
##   cantor:sing  drawn only: the warning of his strike or his shout as he makes it (the echo's spot, the shout's reach).
##   cantor:rock  a rock coming down at (x, y), landing at `hit`: `a` 0 one his picture paints, 1 one of floor 8's rockfall.
##   cantor:copy  one of his copies: `a` the move it repeats (0 strike, 1 shout, 2 rockfall), `b` how far into his copies move
##                it is as it stands, `c` which (0 his left, 1 his right), `d` its tail; `done` its marks (1, 2 its blows
##                landed; 32 begun; 64 ringing out).
extends "res://scripts/act1/act1.gd"

## (art/new_mobs3.ts TILE3: so many of his own lengths to a tile)
const T3 := 39.191835884530846
const GAIT := {"pace": 0.8, "cycle": 1.5, "setOff": 0.0, "halt": 0.0, "stopAt": 2.3, "slack": 0.6, "trueBack": true}
const ACTS := [
	{"id": "cantor:strike", "clip": "attack", "long": 2.2, "hit": 1.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 3.1},
	{"id": "cantor:shout", "clip": "shout", "long": 2.2, "hit": 1.0, "dmg": 0.8, "cooldown": 8.0, "first": 3.0, "after": 0.6, "near": 0.0, "far": 5.0},
	{"id": "cantor:copies", "clip": "copies", "long": 2.2, "hit": 0.62, "dmg": 0.6, "cooldown": 13.0, "first": 6.0, "after": 0.5, "near": 0.0, "far": 7.0},
	{"id": "cantor:rockfall", "clip": "rockfall", "long": 2.6, "hit": 1.3, "dmg": 1.0, "cooldown": 14.0, "first": 8.0, "after": 0.7, "near": 0.0, "far": 9.0},
]
## (CANTOR: his pictures' numbers, in tiles and seconds, and what they hurt)
const STRIKE := {"spot": [2.729, -0.293], "beyond": 0.35, "half": 0.6, "echo": 0.45, "echoR": 0.8, "echoDmg": 0.5, "glow": 0.1}
const SHOUT := {"at": 0.18, "out": 0.5, "r0": 16.0 / T3, "reach": 175.0 / T3, "half": 1.15, "back": 1.45, "r0Back": 30.0 / T3, "halfBack": 1.0, "thick": 0.3, "knock": 0.7, "warnFrom": 0.3}
const COPIES := {"tear": [0.62, 0.86], "delay": [0.18, 0.36], "side": 46.0 / T3, "long": 2.2, "fade": 0.4}
## (rocks: [when it lands, tiles before him, tiles to his left in his picture, its size (tiles)])
const ROCKFALL := {"plant": 0.4, "sing": 0.75, "hush": 1.9, "fall": 0.5, "r": 0.55,
	"rocks": [[1.3, 70.0 / T3, 40.0 / T3, 12.0 / T3], [1.42, -40.0 / T3, -78.0 / T3, 10.0 / T3], [1.54, 104.0 / T3, -46.0 / T3, 13.0 / T3],
		[1.66, -66.0 / T3, 66.0 / T3, 11.0 / T3], [1.78, 36.0 / T3, 96.0 / T3, 9.0 / T3], [1.9, 20.0 / T3, -104.0 / T3, 12.0 / T3]],
	"heroAt": [1.42, 1.66, 1.9], "heroR": 0.65}
## (the moves his copies can repeat, in the order a copy keeps them; each one's length and its copies' picture among his)
const ECHOED := ["cantor:strike", "cantor:shout", "cantor:rockfall"]
const ECHO_MOVES := [{"long": 2.2, "clip": "echoAttack"}, {"long": 2.2, "clip": "echoShout"}, {"long": 2.6, "clip": "echoRockfall"}]
## (COPY: a copy's marks; art/act1_figs/cantor.ts ECHO_FPS, ECHO_FROM: its pictures' frames a second, where the copies' own
## picture of the end of his copies move begins)
const BEGUN := 32
const FADING := 64
const ECHO_FPS := 15.0
const ECHO_FROM := 1.8
## (game/boss_calls.ts BOSS_CALL_LINES.cantor, BOSS_CALLS.gap, sayFor; defs.ts MSG.foe)
const CALLS := {"cantor:shout": "LISTEN!", "cantor:copies": "My choir, sing!", "cantor:rockfall": "Let the stones sing."}
const CALL_GAP := 5.0
const SAY_FOR := 1.8
const FOE := Color("#ff8a3a")

var _last_call := -1000.0


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (Monster.a1: `last`, the move his copies will repeat)
func spawned(_m) -> void:
	a1 = {"last": 0}


## (his copies: not while those he sent out last are still about)
func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	if a["id"] == "cantor:copies":
		return copies_of(m).is_empty()
	return true


func start(m, a: Dictionary, _hero) -> void:
	act["b"] = 0
	# (his strike's and his shout's warnings, drawn as he makes them: cantor_marks.gd)
	if a["id"] == "cantor:strike" or a["id"] == "cantor:shout":
		peril(m, "cantor:sing", m.world, {"dur": float(a["long"]) + 0.1, "a": 0 if a["id"] == "cantor:strike" else 1})
	# (THE BOSSES CALL OUT THEIR BIG MOVES: bossCall)
	var now := Time.get_ticks_msec() / 1000.0
	if CALLS.has(a["id"]) and now - _last_call >= CALL_GAP:
		_last_call = now
		m.call_line(CALLS[a["id"]], SAY_FOR)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var me := singer(m.world, m.face, act["hand"])
	var hurt := func(mult: float, _from: Vector2) -> bool:
		var was: float = hero.life
		blow(m, hero, float(a["dmg"]) * mult)
		return hero.life < was
	var seen := {"v": int(act.get("b", 0))}
	match str(a["id"]):
		"cantor:strike":
			sing(m.mgr, hero, 0, me, t0, t1, seen, hurt, false)
		"cantor:shout":
			sing(m.mgr, hero, 1, me, t0, t1, seen, hurt, false)
		"cantor:copies":
			# (the bell rung three times; the copies torn away from him, in his picture)
			if crossed(t0, t1, 0.55) or crossed(t0, t1, 0.78) or crossed(t0, t1, 1.0):
				sound(m, "echo", 0.45)
			if crossed(t0, t1, COPIES["tear"][0]) and m.mgr.loot != null:
				m.mgr.loot.say("%s rings out his echoes" % m.title, FOE)
		"cantor:rockfall":
			if crossed(t0, t1, ROCKFALL["plant"]):
				sound(m, "slam", 0.5)
				hero.kick(2.0)
			if crossed(t0, t1, ROCKFALL["sing"]):
				m.mgr.sfx.play("boss_roar", linear_to_db(0.7))
				var dmg: float = m._roll() * float(a["dmg"])
				rocks_round(m.mgr.perils, m, m.blow(), me, dmg, true)
				rocks_over(m, dmg, hero)
			# (the rim rumbles as he sings)
			if t1 > float(ROCKFALL["sing"]) and t0 < float(ROCKFALL["hush"]) and floori(t1 * 8.0) != floori(t0 * 8.0):
				hero.kick(1.0)
	act["b"] = seen["v"]


func end(m, a: Dictionary, _hero) -> void:
	if a["id"] != "cantor:copies":
		a1["last"] = maxi(0, ECHOED.find(a["id"]))
		return
	# HIS COPIES, torn away to either side where his picture put them, each a beat behind him still
	var which := int(a1.get("last", 0))
	var dmg: float = m._roll() * float(a["dmg"])
	for j in 2:
		var o := on_picture(m.face, 0.0, (1.0 if j == 0 else -1.0) * float(COPIES["side"]))
		# (how far into his move it is as he ends it, and so how much of its end it has still to play)
		var from: float = float(COPIES["long"]) - float(COPIES["delay"][j])
		var tail: float = float(COPIES["long"]) - from
		peril(m, "cantor:copy", m.world + o, {"a": which, "b": from, "c": j, "d": tail, "dmg": dmg, "dur": tail + float(ECHO_MOVES[which]["long"]) + float(COPIES["fade"]), "hit": 1e9, "hand": hand_of(true, m.face)})


## His last note: his copies ring out and fade; his own rocks still to fall round him fall no more.
func died(m) -> void:
	for p in copies_of(m):
		p["done"] = int(p["done"]) | FADING
		p["dur"] = minf(float(p["dur"]), float(p["t"]) + float(COPIES["fade"]))
	for p in m.mgr.perils.list:
		if p["kind"] == "a1" and p["a1"] == "cantor:rock" and int(p["a"]) == 0 and int(p["done"]) == 0 and p.get("src") == m:
			p["done"] = 1
			p["gone"] = true
			p["dur"] = p["t"]


## Struck as he walks in procession, he walks on: his flinch is a standing one (render/act1_fx/cantor.ts sprite).
func shown(m) -> Dictionary:
	if m.dead or m.state == "act" or mode != "walk" or not m.art.has("reel") or m.struck_t >= m.art.length("reel"):
		return {}
	var n: int = m.art.count(0, "walk")
	return {"list": "walk", "i": floori(maxf(0.0, gt) * m.art.fps("walk") + 1e-6) % maxi(1, n)} if n > 0 else {}


## His copies on the floor.
static func copies_of(m) -> Array:
	var out := []
	for p in m.mgr.perils.list:
		if p["kind"] == "a1" and p["a1"] == "cantor:copy" and p.get("src") == m:
			out.append(p)
	return out


# --- his sums (game/act1_rules/cantor.ts) ---

## One who makes his moves (him, or one of his copies): where, the way it faces, the hand its picture is drawn with.
static func singer(at: Vector2, f: Vector2, hand: int) -> Dictionary:
	return {"at": at, "f": f, "hand": hand}


## onPicture: where a point of his picture is on the floor from where he stands (tiles before him and to his left in the
## picture, as it is painted): his picture is one of four ways round, so what it paints round him is where it shows it.
static func on_picture(f: Vector2, fwd: float, left: float) -> Vector2:
	var a := fwd
	var b := -left
	if f.x + f.y < -0.2:
		a = -left
		b = -fwd
	if f.x - f.y < 0.0:
		var t := a
		a = b
		b = t
	return Vector2(a, b)


## shoutOut: the radius of the shout's wave going out, `t` seconds into the shout; -1 while it does not roll.
static func shout_out(t: float) -> float:
	var u := (t - 1.0) / float(SHOUT["out"])
	if u < 0.0 or u >= 1.0:
		return -1.0
	return float(SHOUT["r0"]) + float(SHOUT["reach"]) * (1.0 - (1.0 - u) * (1.0 - u))


## shoutBack: and coming back.
static func shout_back(t: float) -> float:
	var u := (t - float(SHOUT["back"])) / float(SHOUT["out"])
	if u < 0.0 or u >= 1.0:
		return -1.0
	return float(SHOUT["reach"]) + float(SHOUT["r0Back"]) - float(SHOUT["reach"]) * (1.0 - (1.0 - u) * (1.0 - u))


static func shout_from(s: Dictionary) -> Vector2:
	return beside(s["at"], s["f"], s["hand"], SHOUT["at"], 0.0)


static func strike_spot(s: Dictionary) -> Vector2:
	return beside(s["at"], s["f"], s["hand"], STRIKE["spot"][0], STRIKE["spot"][1])


## sing: A STEP OF ONE OF HIS MOVES THAT STRIKE (his strike, 0; his shout, 1), made by him or by a copy, from `t0` to `t1` of it:
## `hurt(mult, from)` strikes the hero with `mult` of the singer's blow (true if it harmed him); `seen.v` keeps which of its
## blows have come (bits 1 and 2), so that each comes once.
static func sing(mgr, hero, which: int, s: Dictionary, t0: float, t1: float, seen: Dictionary, hurt: Callable, copy: bool) -> void:
	var h: Vector2 = hero.world
	if which == 0:
		if crossed(t0, t1, 1.0):
			var r := from_figure(s["at"], s["f"], s["hand"], h)
			if r.x > -0.2 and r.x <= float(STRIKE["spot"][0]) + float(STRIKE["beyond"]) and absf(r.y - float(STRIKE["spot"][1])) <= float(STRIKE["half"]):
				hurt.call(1.0, s["at"])
			hero.kick(2.0 if copy else 4.0)
			mgr.sfx.play("slam", linear_to_db(0.5 if copy else 0.8))
		if crossed(t0, t1, 1.0 + float(STRIKE["echo"])):
			# (its echo, on the same spot)
			var p := strike_spot(s)
			if h.distance_to(p) <= float(STRIKE["echoR"]):
				hurt.call(float(STRIKE["echoDmg"]), p)
			hero.kick(1.0)
			mgr.sfx.play("echo", linear_to_db(0.35 if copy else 0.6))
		return
	if crossed(t0, t1, 1.0):
		mgr.sfx.play("wave", linear_to_db(0.6 if copy else 1.0))
		if not copy:
			mgr.sfx.play("boss_roar", linear_to_db(0.5))
		hero.kick(2.0 if copy else 4.0)
	if crossed(t0, t1, SHOUT["back"]):
		mgr.sfx.play("echo", linear_to_db(0.5 if copy else 0.8))
	if t1 <= 1.0:
		return
	var c := shout_from(s)
	var r := from_figure(c, s["f"], s["hand"], h)
	var d := r.length()
	var bearing := absf(atan2(r.y, r.x))
	# (going out: its front passes him as it grows past where he stands)
	var o1 := shout_out(t1)
	var o0 := shout_out(maxf(1.0, t0))
	if o0 < 0.0:
		o0 = SHOUT["r0"]
	var thick: float = SHOUT["thick"]
	if not (int(seen["v"]) & 1) and o1 >= 0.0 and bearing <= float(SHOUT["half"]) and d >= o0 - thick and d <= o1 + thick * 0.5:
		seen["v"] = int(seen["v"]) | 1
		if hurt.call(1.0, c):
			knock(hero, c, SHOUT["knock"])
	# (coming back: its front passes him as it shrinks past where he stands, coming from beyond him)
	var b1 := shout_back(t1)
	var b0 := shout_back(maxf(float(SHOUT["back"]), t0))
	if b0 < 0.0:
		b0 = float(SHOUT["reach"]) + float(SHOUT["r0Back"])
	if not (int(seen["v"]) & 2) and b1 >= 0.0 and bearing <= float(SHOUT["halfBack"]) and d <= b0 + thick and d >= b1 - thick * 0.5:
		seen["v"] = int(seen["v"]) | 2
		# (thrown toward him, from beyond where he stands: once its going out is over, not back into it)
		var k := 1.0 / d if d > 0.01 else 0.0
		var bfrom := h + (h - c) * k
		if hurt.call(1.0, bfrom) and t1 >= 1.0 + float(SHOUT["out"]):
			knock(hero, bfrom, SHOUT["knock"])


## rock: A ROCK that lands `hit` seconds from now at `at`: `a` 0, one his picture paints; 1, one drawn with floor 8's rockfall's
## pictures. `by` the blow it carries ({el, words, half}); `src` whose it is.
static func rock(P, src, by: Dictionary, at: Vector2, hit: float, dmg: float, a: int, size := 0.0) -> void:
	P.list.append({"kind": "a1", "a1": "cantor:rock", "x": at.x, "y": at.y, "fx": 0.0, "fy": 1.0, "t": 0.0, "hit": hit, "dur": hit + 1.3,
		"dmg": dmg, "done": 0, "a": a, "b": size, "c": 0.0, "d": 0.0, "hand": 1, "src": src, "by": by})


## rocksRound: the six rocks round one who sings, where his picture lays them (`own`: his, which his picture paints; else a copy's).
static func rocks_round(P, src, by: Dictionary, s: Dictionary, dmg: float, own: bool) -> void:
	for q in ROCKFALL["rocks"]:
		var o := on_picture(s["f"], float(q[1]), float(q[2]))
		rock(P, src, by, s["at"] + o, float(q[0]) - float(ROCKFALL["sing"]), dmg, 0 if own else 1, float(q[3]))


## rocksOver: his voice shakes rocks loose over the hero: the first on his tile, the others on open tiles a tile or two off it.
func rocks_over(m, dmg: float, hero) -> void:
	var h: Vector2 = hero.world
	var spots: Array = [Vector2(floorf(h.x) + 0.5, floorf(h.y) + 0.5)]
	var want: int = ROCKFALL["heroAt"].size()
	var tries := 0
	while spots.size() < want and tries < 40:
		tries += 1
		var p := Vector2(floorf(h.x + randf_range(-2.5, 2.5)) + 0.5, floorf(h.y + randf_range(-2.5, 2.5)) + 0.5)
		var d := p.distance_to(h)
		if d < 0.9 or d > 2.6 or not is_open(m, p):
			continue
		var apart := true
		for q in spots:
			if q.distance_to(p) < 1.0:
				apart = false
		if apart:
			spots.append(p)
	for k in spots.size():
		rock(m.mgr.perils, m, m.blow(), spots[k], float(ROCKFALL["heroAt"][k]) - float(ROCKFALL["sing"]), dmg, 1)
