## FLOOR 9'S TWO SIDE BOSSES, what they share (game/act1_rules/f9_bosses.ts F9_TUNE, begin, keepTime, squareUp, carried, beat,
## spot, nearLine; art/f9_bosses_moves.ts chiefCarry, wolfCarry, TILE3; art/f9_bosses_sculpt.ts CK, WK): warchief.gd (the Troll
## Chieftain, in his camp) and mistwolf.gd (the Mist Wolf, in its glade) extend it. His words, 13 Nov 2026: “I need two side bosses
## for level 9. ... The deer boss drops one, I was a spectral wolf boss, and I want a guardian boss, the troll guys from the
## prison”; his word to build them in, 14 Nov 2026: “Yes, build them in (Recommended)”. (Their lairs as places, their gates and
## the pieces of the ward-stone they guard are not here: only their fights.)
##   EACH IS DRAWN IN THE FRAME ITS PICTURE HAS (game/act1_rules/stoker.ts FRAMES, stoker.gd): as each act begins it is turned
##     square to the nearest of the four ways toward the hero, and every blow is reckoned in that frame, where its picture lands
##     (its own lengths: CK 1.5 to a length of his, WK 1.1 of its; 39.19 to a tile).
##   EACH MOVE KEEPS IT OVER THE FLOOR POINT UNDER IT as its picture has it: the ground the move covers is covered here, a little
##     at a time, not through a wall (`carried`; how far, the art's own curves, kept here 120 to a second).
##   AS A MOVE COMES, IT SQUARES UP (within 0.6 s of being ready, the hero in its sight and no further than 2 tiles past its
##     reach): it walks, at 1.3 times its pace, to stand with the hero square before it along one of its four ways (within 0.4 to
##     either side), as far off as its blows reach him; 2.6 s at most, or until something bars it, then not again for 2.5 s.
##   EACH MOVE'S MARK (`<kind>:fx:<move>`, marks9.gd): laid where it stood as the move began, in its frame, its clock the act's
##     (quickened, slowed) while the act goes on; gone with it if the act is cut off before its blow; seen 0.6 s past its end.
##   HEAVY BLOWS LAND with the game held still a moment and the screen kicked (his rulebook, Movement 7), felt within 14 tiles.
extends "res://scripts/act1/act1.gd"

const Stoker := preload("res://scripts/stoker.gd")

## (art/f9_bosses_moves.ts TILE3: so many of a figure's own lengths to a tile)
const TILE3 := 39.191835884530846
## (F9_TUNE.square, beat, beatNear)
const SQUARE := {"ready": 0.6, "most": 2.6, "rest": 2.5, "off": 0.4, "pace": 1.3}
const BEAT := {"smash": [0.14, 8.0], "slam": [0.18, 11.0], "warcry": [0.12, 8.0], "rush": [0.14, 9.0],
	"bite": [0.08, 4.0], "claw": [0.12, 6.0], "howl": [0.06, 4.0], "lunge": [0.1, 5.0], "cloud": [0.06, 4.0]}
const BEAT_NEAR := 14.0
## (F9_FX_AFTER: how long after a move begins what it left is still to be seen past its end)
const AFTER := 0.6


## Its own lengths (`k` to a length) in tiles.
static func tiles(u: float, k: float) -> float:
	return u * k / TILE3


## The move an act is (its id after its kind's name).
static func move_of(id: String) -> String:
	return id.substr(id.find(":") + 1)


## How far a move has carried it, its own lengths forward, `t` seconds into it: from a table of the art's curve, 120 to a second.
static func carry_of(table: Array, t: float) -> float:
	if table.is_empty():
		return 0.0
	var u := clampf(t, 0.0, (table.size() - 1) / 120.0) * 120.0
	var i := mini(floori(u), table.size() - 2)
	return lerpf(float(table[i]), float(table[i + 1]), u - i)


## spot: where on the floor a point of its own lengths (`k` to a length) is, from the mark of the act it began.
static func spot(p: Dictionary, k: float, f: float, l: float) -> Vector2:
	return Stoker.spot_of(int(p["a"]), Vector2(p["x"], p["y"]), tiles(f, k), tiles(l, k))


## nearLine: how near `h` is to the line from `a` to `b`.
static func near_line(h: Vector2, a: Vector2, b: Vector2) -> float:
	var d := b - a
	var L := d.length_squared()
	var k := clampf((h - a).dot(d) / L, 0.0, 1.0) if L > 1e-9 else 0.0
	return h.distance_to(a + d * k)


## carried: its body carried `d` tiles along the way it faces, over the floor as it lets it (a little at a time, not through a wall).
static func carried(m, d: float) -> void:
	if absf(d) < 1e-6:
		return
	var n := maxi(1, ceili(absf(d) / 0.2))
	for i in n:
		slide(m, m.face * (d / n))


## beat: a heavy blow landing: the game held still a moment, the screen kicked, if the hero is near enough to feel it.
static func beat(m, hero, move: String) -> void:
	if not BEAT.has(move) or hero.world.distance_to(m.world) > BEAT_NEAR:
		return
	var b: Array = BEAT[move]
	hero.kick(b[1])
	if m.mgr.fx != null:
		m.mgr.fx.hold(b[0])


## A blow of its own on the hero, `mult` times the roll its act's mark took (`p.dmg`), from `from` (game.ts hurtHero, its src).
static func strike_hero(m, hero, p: Dictionary, mult: float, from: Vector2) -> void:
	var by: Dictionary = p.get("by", {})
	hero.hurt_by(float(p["dmg"]) * mult, str(by.get("el", "phys")), by.get("words", []), by.get("half", {}), m, from)


## begin: as an act begins, turned square to the nearest of its four ways toward the hero; its move's mark laid where it stands;
## quicker if raging. `prefix` its marks' names' head.
func begin(m, a: Dictionary, hero, prefix: String) -> void:
	var k := Stoker.nearest_frame(hero.world - m.world)
	m.face = Stoker.FRAMES[k]["f"]
	if raging():
		act["rate"] = 1.3
	var p := peril(m, prefix + move_of(a["id"]), m.world, {"fx": m.face.x, "fy": m.face.y, "t": 0.0, "dur": float(a["long"]) + AFTER, "hit": a["hit"], "dmg": m._roll(), "a": k, "d": 0, "act": act})
	a1["p"] = p
	a1["px"] = m.world.x
	a1["py"] = m.world.y


## Is it raging now (the war cry's rage)? None but the Chieftain's.
func raging() -> bool:
	return float(a1.get("rage", 0.0)) > 0.0


## The mark of the act it is making now (empty: none).
func act_peril() -> Dictionary:
	var p = a1.get("p")
	return p if p is Dictionary and act != null and is_same(p.get("act"), act) else {}


## keepTime: the mark's clock kept with its act's while the act goes on; gone with it if it is cut off before its blow.
static func keep_time(p: Dictionary) -> void:
	var m = p.get("src")
	var acting: bool = m != null and is_instance_valid(m) and not m.dead and m.state == "act" and m.h2.act != null and is_same(m.h2.act, p.get("act"))
	if acting:
		p["t"] = m.h2.act["t"]
	elif float(p["t"]) < float(p["hit"]):
		p["dur"] = p["t"]


## SQUARING UP (F9_TUNE.square) as a move comes: to the spot on the hero's line along the nearest of its four ways, as far off as
## its blows reach him (`near` to `far` tiles), walking. True while it goes there (that step is all it does).
func square_up(m, dt: float, hero, near: float, far: float, pace: float) -> bool:
	if m.state == "act" or m._cd > float(SQUARE["ready"]) or not hero.alive:
		a1["sq"] = 0.0
		return false
	if float(a1.get("sqRest", 0.0)) > 0.0:
		a1["sqRest"] = maxf(0.0, float(a1["sqRest"]) - dt)
		return false
	var d: Vector2 = hero.world - m.world
	if d.length() > far + 2.0 or not m.mgr.sees(m.world, hero.world):
		a1["sq"] = 0.0
		return false
	var k := Stoker.nearest_frame(d)
	var r := Stoker.in_frame(k, m.world, hero.world)
	if absf(r.y) <= float(SQUARE["off"]) and r.x >= near and r.x <= far:
		return _squared(0.0)
	var fwd := clampf(r.x, near, far)
	var to: Vector2 = hero.world - Stoker.FRAMES[k]["f"] * fwd
	var off: float = to.distance_to(m.world)
	if off < 0.15:
		return _squared(0.0)
	if float(a1.get("sq", 0.0)) > float(SQUARE["most"]):
		return _squared(SQUARE["rest"])
	a1["sq"] = float(a1.get("sq", 0.0)) + dt
	var step := minf(off, m.speed * float(SQUARE["pace"]) * dt)
	var u: Vector2 = (to - m.world) / off
	var was: Vector2 = m.world
	slide(m, u * step)
	# (barred: it gives up, and makes its move as it stands)
	if m.world.distance_to(was) < step * 0.3:
		return _squared(SQUARE["rest"])
	m.face = u
	m.state = "chase"
	if mode != "walk":
		_to("walk")
	gt += step / pace
	return true


## (there: it stands, and makes its move)
func _squared(rest: float) -> bool:
	if float(a1.get("sq", 0.0)) > 0.0:
		_to("stand")
	a1["sq"] = 0.0
	a1["sqRest"] = rest
	return false
