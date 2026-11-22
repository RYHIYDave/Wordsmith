## WHAT THE WARPED WORDSMITH LAYS ON THE FLOOR AND SENDS OVER IT (game/act1_rules/wsboss.ts peril, wsboss2.ts meldPeril), stepped as
## his rules step them: what strikes the hero, and when. Drawn by act3/ws_paint.gd (render/act1_fx/wsboss.ts, wsboss2.ts).
##   IN THE SADDLE  wsboss:rings (the stomp's three shock rings rolling out, each striking him once as it passes under him),
##                  wsboss:crater (where the hammer fell), wsboss:meteor (striking as it lands, then the floor burning where it fell),
##                  wsboss:ice (each cluster of spikes as it bursts up under him; the frozen floor behind them, chilling him),
##                  wsboss:orb (drifting after him, zapping him within its reach, swelling at the last and bursting), wsboss:trap
##                  (set once its rune has burned in; come near, it snaps into a cloud that bites him in it).
##   THE FALL       wsboss:fallring, wsboss:scorch: harming nothing.
##   ON FOOT        wsboss:slamring (cannot be dodged), and each meld's own: wsboss:eruption, hailstorm, thunder, avalanche,
##                  contagion, scald, blight, fumes, wildfire, frostbite.
##   HIS DEATH      wsboss:deathring.
##   HIS MOVES      wsboss:show, laid as each of his moves that shows something begins (its warnings, its runes, the hammer, the
##                  spores in flight: ws_paint.gd), gone as it ends.
extends RefCounted

const WS := preload("res://scripts/act3/wsboss.gd")
const A1 := preload("res://scripts/act1/act1.gd")


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _moving(hero) -> bool:
	return hero._act == "lunge"


static func _hurt(P, p: Dictionary, mult: float, at := Vector2.INF, dodge := true) -> bool:
	var hero = P.hero
	if dodge and _moving(hero):
		return false
	P._hurt(p, float(p["dmg"]) * mult, at if at != Vector2.INF else Vector2(p["x"], p["y"]), str(p.get("el", "")))
	return true


static func _tick(P, p: Dictionary, dt: float, every: float, mult: float) -> void:
	p["d"] = float(p["d"]) - dt
	if float(p["d"]) <= 0.0:
		p["d"] = every
		_hurt(P, p, mult, P.hero.world, false)


static func _chill(hero, k: float, secs := 0.5) -> void:
	hero.chill(secs, k)


static func step(P, p: Dictionary, dt: float) -> bool:
	var hero = P.hero
	var t: float = p["t"]
	if str(p["a1"]) == "wsboss:show":
		# (what his move shows, its warnings, its runes and what he wields: for as long as the move it was laid for)
		var src = p.get("src")
		if not (src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and is_same(src.h2.act, p["act"])):
			p["dur"] = t
		return t < float(p["dur"])
	if hero == null or not hero.alive:
		return t < float(p["dur"])
	var name := str(p["a1"]).substr(7)
	if WS.D()["melds"].has(name) or name == "slamring":
		_meld(P, p, dt, name)
		return t < float(p["dur"])
	var h: Vector2 = hero.world
	var at := Vector2(p["x"], p["y"])
	var TU: Dictionary = WS.D()["tune"]
	match name:
		"rings":
			for j in 3:
				var bit := 1 << j
				if (int(p["done"]) & bit) != 0 or _moving(hero):
					continue
				var r := WS.ring_at(j, t)
				if r < 0.0:
					continue
				if absf(h.distance_to(at) - r) <= float(TU["stomp"]["band"]):
					p["done"] = int(p["done"]) | bit
					_hurt(P, p, float(TU["stomp"]["dmg"][j]))
					if j == 0:
						A1.knock(hero, at, 0.8)
		"meteor":
			var t0 := t - dt
			if t0 < 0.0 and t >= 0.0:
				hero.kick(2.0)
				if not _moving(hero) and h.distance_to(at) <= float(TU["flame"]["reach"]):
					_hurt(P, p, float(TU["flame"]["dmg"]))
			if t >= 0.3 and t <= float(p["dur"]) - 0.6:
				var B: Dictionary = TU["flame"]["burn"]
				if h.distance_to(at) <= float(B["r"]):
					p["d"] = float(p["d"]) - dt
					if float(p["d"]) <= 0.0:
						p["d"] = B["every"]
						_hurt(P, p, float(B["dmg"]), at, false)
		"ice":
			var steps: Array = WS.D()["ice"]["steps"]
			for s in steps:
				var u := t - float(s["t"])
				if u < 0.0 or u > 0.12 or int(p["done"]) != 0 or _moving(hero):
					continue
				var w := WS.art_at(at.x, at.y, float(p["fx"]), float(p["fy"]), float(s["a"]), float(s["b"]))
				if h.distance_to(w) <= float(TU["frost"]["reach"]) + 0.25:
					p["done"] = 1
					_hurt(P, p, float(TU["frost"]["dmg"]), w)
			if t <= float(p["dur"]) - 0.5:
				var F: Dictionary = WS.A("FROST")
				var r := WS.rel_of(at.x, at.y, float(p["fx"]), float(p["fy"]), h.x, h.y)
				var ang := absf(atan2(r.y, r.x))
				var reach := (0.6 + (float(F["steps"]) - 1.0) * float(F["step"])) + 0.4
				if r.x > 0.2 and r.x < reach and ang <= deg_to_rad(float(F["fan"]) / 2.0 + 6.0):
					var reached := 0.6 + maxf(0.0, (t - float(F["hit"]) - 0.04) / float(F["race"])) * float(F["step"])
					if r.length() <= reached:
						_chill(hero, float(TU["frost"]["rime"]["chill"]), float(TU["frost"]["rime"]["every"]) * 2.0)
		"orb":
			var B: Dictionary = TU["bolt"]
			if t < float(B["life"]):
				var d := h - at
				if d.length() > 0.4 and WS.orb_swell(t) <= 0.0:
					var stepl := minf(d.length() - 0.4, float(B["pace"]) * dt)
					at += d.normalized() * stepl
					p["x"] = at.x
					p["y"] = at.y
				p["a"] = float(p["a"]) - dt
				if float(p["a"]) <= 0.0 and WS.orb_swell(t) <= 0.0:
					p["a"] = B["zap"]["every"]
					if d.length() <= float(B["zap"]["reach"]) and not _moving(hero):
						p["b"] = h.x
						p["c"] = h.y
						_hurt(P, p, float(B["zap"]["dmg"]), at)
					else:
						var ang := randf_range(0.0, TAU)
						p["b"] = at.x + cos(ang) * 1.5
						p["c"] = at.y + sin(ang) * 1.5
					p["d"] = t
					P.sfx.play("zap", linear_to_db(0.35))
			elif int(p["done"]) == 0:
				p["done"] = 1
				P.sfx.play("zap")
				hero.kick(6.0)
				if not _moving(hero) and h.distance_to(at) <= float(B["burst"]["reach"]):
					_hurt(P, p, float(B["burst"]["dmg"]))
					A1.knock(hero, at, 1.0)
		"trap":
			var S: Dictionary = TU["spore"]
			var SP: Dictionary = WS.A("SPORE")
			if t < float(SP["sprout"]):
				return t < float(p["dur"])
			if float(p["a"]) == 0.0:
				if t <= float(p["dur"]) - 1.0 and h.distance_to(at) <= float(S["near"]):
					p["a"] = t
					P.sfx.play("poison", linear_to_db(0.6))
					p["dur"] = minf(float(p["dur"]), t + float(S["swell"]) + float(S["long"]) + 0.1)
				return t < float(p["dur"])
			var u := t - float(p["a"]) - float(S["swell"])
			if u >= 0.0 and u <= float(S["long"]) and h.distance_to(at) <= float(S["cloud"]["r"]):
				p["d"] = float(p["d"]) - dt
				if float(p["d"]) <= 0.0:
					p["d"] = S["cloud"]["every"]
					_hurt(P, p, float(S["cloud"]["dmg"]), at, false)
	return t < float(p["dur"])


# --- HIS MELDS (wsboss2.ts meldPeril) ---

## How far the slam's ring has rolled out, `t` seconds on (tiles).
static func slam_ring_at(t: float) -> float:
	return 0.6 + float(WS.TU2("ring")["pace"]) * t


## A Scald's beam: where it points (radians, his own: 0 the way he aimed it), and whether it is firing; {} before or after.
static func scald_beam_at(t: float, kind: String) -> Dictionary:
	var SC: Dictionary = WS.A("SCALD")
	if t < float(SC["tele"][0]) or t > float(SC["beams"][1]):
		return {}
	var u := maxf(0.0, t - float(SC["beams"][0]))
	var deg := float(SC["fire0"]) - float(SC["turn"]) * u if kind == "fire" else float(SC["frost0"]) + float(SC["turn"]) * u
	return {"ang": deg_to_rad(deg), "on": 0.0 if t < float(SC["beams"][0]) else minf(1.0, (t - float(SC["beams"][0])) / 0.08)}


## The Avalanche: how far its front has come and its tail gone along its way across the floor, and how wide the floor is that way.
static func avalanche_at(t: float) -> Dictionary:
	var AV: Dictionary = WS.A("AVAL")
	var span := float(WS.place()["floor"]) * 2.0
	var out := float(AV["rumble"][1])
	var f := clampf((t - out) / float(AV["cross"]), 0.0, 1.0)
	var g := clampf((t - out - float(AV["cross"]) - float(AV["stream"])) / float(AV["tail"]), 0.0, 1.0)
	return {"front": f * span, "tail": g * span, "span": span}


static func avalanche_spared(p: Dictionary, x: float, y: float) -> bool:
	var side := float(p["lay"].get("side", 1))
	var Pl := WS.place()
	var across := (x - float(Pl["cx"])) * float(p["fy"]) - (y - float(Pl["cy"])) * float(p["fx"])
	return across * side >= float(Pl["floor"]) - float(WS.TU2("avalanche")["safe"])


## Blight: whether its rot has reached (px, py) `t` seconds from the slam.
static func blight_reached(p: Dictionary, t: float, px: float, py: float) -> bool:
	var T := WS.tile()
	var dx := (px - float(p["x"])) * T
	var dy := (py - float(p["y"])) * T
	var a := dx * float(p["fx"]) + dy * float(p["fy"])
	var b := dx * float(p["fy"]) - dy * float(p["fx"])
	var F: Dictionary = WS.A("BLIGHT_FIELD")
	var i := roundi(a) - int(F["x0"])
	var j := roundi(b) - int(F["y0"])
	if i < 0 or j < 0 or i >= int(F["w"]) or j >= int(F["h"]):
		return false
	var d := float(F["at"][j * int(F["w"]) + i])
	if d < 0.0:
		return false
	var BL: Dictionary = WS.A("BLIGHT")
	var u := clampf((t - float(BL["spread"][0])) / (float(BL["spread"][1]) - float(BL["spread"][0])), 0.0, 1.0)
	return d <= u * float(F["far"])


## Fumes: how far a cloud has spread (0 ... 1) `t` seconds from the slam.
static func fumes_spread_at(c: Dictionary, t: float) -> float:
	var u := clampf((t - float(c["t"])) / float(WS.A("FUMES")["spread"]), 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)


## Wildfire: when the whole web goes up (seconds from the slam).
static func wild_boom() -> float:
	var W: Dictionary = WS.A("WILDFIRE")
	return float(W["link"]) + float(W["hold"])


static func _meld(P, p: Dictionary, dt: float, id: String) -> void:
	var hero = P.hero
	var h: Vector2 = hero.world
	var t: float = p["t"]
	var t0 := t - dt
	var at := Vector2(p["x"], p["y"])
	var lay: Dictionary = p.get("lay", {})
	var T2: Dictionary = WS.D()["tune2"]
	match id:
		"slamring":
			if int(p["done"]) != 0:
				return
			if absf(h.distance_to(at) - slam_ring_at(t)) <= float(T2["ring"]["band"]):
				p["done"] = 1
				_hurt(P, p, float(T2["ring"]["dmg"]), at, false)
		"eruption":
			var E: Dictionary = WS.A("ERUPT")
			for v in lay.get("spots", []):
				if int(v.get("done", 0)) != 0 or t < float(v["t"]) or t > float(v["t"]) + float(E["burst"]) + float(E["hold"]):
					continue
				var q := Vector2(v["x"], v["y"])
				if h.distance_to(q) <= float(T2["eruption"]["reach"]) and _hurt(P, p, float(T2["eruption"]["dmg"]), q):
					v["done"] = 1
		"hailstorm":
			var H: Dictionary = WS.A("HAIL")
			for s in lay.get("spots", []):
				var r := int(s.get("r", 0))
				if r == 1 and t0 < float(s["t"]) - float(H["fall"]) - float(H["warn"]) and t >= float(s["t"]) - float(H["fall"]) - float(H["warn"]):
					s["x"] = h.x + randf_range(-0.4, 0.4)
					s["y"] = h.y + randf_range(-0.4, 0.4)
				if r == 2 and t0 < float(s["t"]) - float(H["boltWarn"]) and t >= float(s["t"]) - float(H["boltWarn"]):
					s["x"] = h.x
					s["y"] = h.y
				if int(s.get("done", 0)) != 0 or t0 >= float(s["t"]) or t < float(s["t"]):
					continue
				s["done"] = 1
				var bolt := r == 2
				if bolt:
					hero.kick(4.0)
				var q := Vector2(s["x"], s["y"])
				var reach := float(T2["hail"]["bolt"]["reach"]) if bolt else float(T2["hail"]["reach"])
				if h.distance_to(q) <= reach and _hurt(P, p, float(T2["hail"]["bolt"]["dmg"]) if bolt else float(T2["hail"]["dmg"]), q) and not bolt:
					_chill(hero, float(T2["hail"]["chill"]))
		"thunder":
			var TH: Dictionary = WS.A("THUNDER")
			for s in lay.get("spots", []):
				var lock := float(s["t"])
				var bolt := float(s["t"]) + float(s.get("r", 0.6))
				if t >= lock and t < bolt - 0.25:
					var f := minf(1.0, dt * 1.5)
					s["x"] = float(s["x"]) + (h.x - float(s["x"])) * f
					s["y"] = float(s["y"]) + (h.y - float(s["y"])) * f
				var q := Vector2(s["x"], s["y"])
				if t0 < bolt and t >= bolt:
					hero.kick(6.0)
					P.sfx.play("thunder", linear_to_db(0.9))
					if h.distance_to(q) <= float(T2["thunder"]["reach"]):
						_hurt(P, p, float(T2["thunder"]["dmg"]), q)
				var u := t - bolt - float(TH["clapAfter"])
				if u > 0.0 and u < float(TH["clapLong"]) and (int(s.get("done", 0)) & 1) == 0:
					var k := 1.0 - u / float(TH["clapLong"])
					var rr := 0.3 + float(TH["clap"]) * (1.0 - k * k)
					if absf(h.distance_to(q) - rr) <= float(T2["thunder"]["clap"]["band"]) and not _moving(hero):
						s["done"] = 1
						_hurt(P, p, float(T2["thunder"]["clap"]["dmg"]), q)
						A1.knock(hero, q, float(T2["thunder"]["clap"]["knock"]))
		"avalanche":
			var AA := avalanche_at(t)
			if float(AA["front"]) <= 0.0 or int(p["done"]) != 0:
				return
			var Pl := WS.place()
			var along := (h.x - float(Pl["cx"])) * float(p["fx"]) + (h.y - float(Pl["cy"])) * float(p["fy"]) + float(Pl["floor"])
			if along <= float(AA["front"]) and along >= float(AA["tail"]) and not avalanche_spared(p, h.x, h.y):
				p["done"] = 1
				_hurt(P, p, float(T2["avalanche"]["dmg"]), h - Vector2(p["fx"], p["fy"]), false)
				hero.held = maxf(hero.held, float(T2["avalanche"]["freeze"]))
		"contagion":
			var G: Dictionary = lay.get("grid", {})
			if G.is_empty():
				return
			var i := floori((h.x - float(G["x0"])) / float(G["size"]))
			var j := floori((h.y - float(G["y0"])) / float(G["size"]))
			var n := int(G["n"])
			if i < 0 or j < 0 or i >= n or j >= n:
				return
			var a := float(G["at"][j * n + i])
			if t >= a and t < a + float(WS.A("CONTAGION")["sick"]):
				_tick(P, p, dt, float(T2["contagion"]["every"]), float(T2["contagion"]["dmg"]))
		"scald":
			var SC: Dictionary = WS.A("SCALD")
			var d := h.distance_to(at)
			if t > float(SC["flash"]) and t < float(SC["flash"]) + float(SC["hang"]) and d >= float(T2["scald"]["inner"]) and d <= float(T2["scald"]["outer"]):
				_tick(P, p, dt, float(T2["scald"]["every"]), float(T2["scald"]["dmg"]))
				_chill(hero, 0.4)
			for kind in ["fire", "frost"]:
				var B := scald_beam_at(t, kind)
				if B.is_empty() or float(B["on"]) < 1.0 or _moving(hero):
					continue
				var ca := cos(float(B["ang"]))
				var sa := sin(float(B["ang"]))
				var bx := float(p["fx"]) * ca + float(p["fy"]) * sa
				var by := float(p["fy"]) * ca - float(p["fx"]) * sa
				var along := (h.x - at.x) * bx + (h.y - at.y) * by
				var across := absf(-(h.x - at.x) * by + (h.y - at.y) * bx)
				var key := "b" if kind == "fire" else "c"
				var last := float(p[key]) if float(p[key]) != 0.0 else -9.0
				if along > 0.4 and across <= float(T2["scald"]["beam"]["half"]) and t - last > float(T2["scald"]["beam"]["every"]):
					p[key] = t
					_hurt(P, p, float(T2["scald"]["beam"]["dmg"]), at, false)
					if kind == "frost":
						_chill(hero, 0.6)
		"blight":
			var heave := float(WS.A("BLIGHT")["heave"])
			if t0 < heave and t >= heave and not _moving(hero) and blight_reached(p, heave, h.x, h.y):
				_hurt(P, p, float(T2["blight"]["dmg"]), h)
				hero.poison_t = maxf(hero.poison_t, float(T2["blight"]["poison"]))
				hero.poison_dps = maxf(hero.poison_dps, float(p["dmg"]) * 0.08)
		"fumes":
			for c in lay.get("spots", []):
				var r := float(c.get("r", 1.5)) * fumes_spread_at(c, t)
				var q := Vector2(c["x"], c["y"])
				var in_it := h.distance_to(q) <= r
				var boom := float(c.get("done", 99.0))
				if in_it and t > float(c["t"]) and t < boom:
					_tick(P, p, dt, float(T2["fumes"]["every"]), float(T2["fumes"]["dmg"]))
				if t0 < boom and t >= boom:
					hero.kick(4.0)
					P.sfx.play("explode", linear_to_db(0.8))
					if in_it:
						_hurt(P, p, float(T2["fumes"]["boom"]), q)
		"wildfire":
			var W: Dictionary = T2["wildfire"]
			var spots: Array = lay.get("spots", [])
			for s in spots:
				var q := Vector2(s["x"], s["y"])
				if t0 < float(s["t"]) and t >= float(s["t"]) and h.distance_to(q) <= float(W["reach"]):
					_hurt(P, p, float(W["dmg"]), q)
			if t < wild_boom():
				for l in lay.get("links", []):
					var a: Dictionary = spots[int(l[0])]
					var b: Dictionary = spots[int(l[1])]
					if t < maxf(float(a["t"]), float(b["t"])):
						continue
					var A := Vector2(a["x"], a["y"])
					var v := Vector2(b["x"], b["y"]) - A
					var L := maxf(0.0001, v.length())
					var u := (h - A).dot(v) / (L * L)
					if u < 0.0 or u > 1.0:
						continue
					if absf((-(h.x - A.x) * v.y + (h.y - A.y) * v.x) / L) <= float(W["arc"]["half"]):
						_tick(P, p, dt, float(W["arc"]["every"]), float(W["arc"]["dmg"]))
						break
			if t0 < wild_boom() and t >= wild_boom():
				hero.kick(7.0)
				P.sfx.play("explode")
				var near := spots.any(func(s): return h.distance_to(Vector2(s["x"], s["y"])) <= float(W["boom"]["reach"]))
				if near:
					_hurt(P, p, float(W["boom"]["dmg"]), h)
		"frostbite":
			var FB: Dictionary = WS.A("FROSTBITE")
			if t < float(FB["gale"][0]) or t > float(FB["gale"][1]):
				return
			if h.distance_to(at) <= float(T2["frostbite"]["eye"]):
				return
			_chill(hero, float(T2["frostbite"]["chill"]))
			_tick(P, p, dt, float(T2["frostbite"]["every"]), float(T2["frostbite"]["dmg"]))


# --- what it looks like: act3/ws_paint.gd ---

static func draw(P, p: Dictionary) -> void:
	preload("res://scripts/act3/ws_paint.gd").ground(P, p)


static func stands(P, p: Dictionary) -> void:
	preload("res://scripts/act3/ws_paint.gd").standing(P, p)


static func air(P, c: CanvasItem, p: Dictionary) -> void:
	preload("res://scripts/act3/ws_paint.gd").air(P, c, p)


static func glow(P, c: CanvasItem, p: Dictionary) -> void:
	preload("res://scripts/act3/ws_paint.gd").glow(P, c, p)


static func spots(P, p: Dictionary) -> void:
	preload("res://scripts/act3/ws_paint.gd").spots(P, p)
