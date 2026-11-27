## ALL MELDS: THE LEAST EXCITING REDONE, AS THE FIGHT SHOWS THEM (behind melds52.gd REDO_ON until his yes): the new moments each
## redone meld tells (meldsredo_rules.gd; on a monster, foe_meldsredo.gd), painted with the High City painter's brushes
## (fx_m52p_high.gd, fx_m52kit.gd). What each meld showed before stays drawn by its own painter; fx_melds52.gd hands this one only the
## moments these add (`knows`). Each is drawn as a look the melds already share where one fits (a burst's flash and spray, a stun's
## stars, a curse's eye, a cloud's haze, a drag's wisps: MOMENTS, its first) and, where the moment is a thing of its own, as that
## thing (its second): Doom's falling hammer, Duelist's crossed blades, Eternity's clock, the Hourglass, Manacle's chain, Lamprey's
## red tether, Fury's ring of flame. BY HIS ART RULEBOOK: every shape the thing it is; the heavy ones kick and hold; on his side
## never the enemy's pink and gold, and what a monster lays on him in them.
extends "res://scripts/fx_m52p_high.gd"

## "id:what" -> [the shared look it is drawn as ("" none), the thing of its own ("" none)]
const MOMENTS := {
	"ambush:reel": ["stun", ""], "ambush:flinch": ["push", ""], "ambush:ring": ["", "closing"], "ambush:snap": ["burst", ""],
	"ambush:lunge": ["lunge", ""],
	"berserk:quake": ["quake", ""], "berserk:roar": ["slam", "roar"], "berserk:swell": ["frenzy", ""], "berserk:throw": ["stun", ""],
	"blight:wither": ["rot", ""], "blight:puff": ["cloud", ""], "blight:boil": ["cloud", ""],
	"bulwark:shove": ["wide", ""], "bulwark:wall": ["ward", "shieldring"], "bulwark:bash": ["shield", ""], "bulwark:charge": ["dash", ""],
	"bulwark:shove2": ["stun", ""],
	"canker:sore": ["cloud", "sore"], "canker:rot": ["rot", ""], "canker:burst": ["cloud", "sore"],
	"delirium:mad": ["curse", "spiral"], "delirium:flail": ["blade", ""], "delirium:shriek": ["curse", "roar"], "delirium:rave": ["dash", ""],
	"doom:hammer": ["", "hammer"], "doom:fall": ["slam", ""], "doom:crush": ["slam", "weight"], "doom:shadow": ["", "shadow"],
	"duelist:challenge": ["", "blades"], "duelist:ring": ["", "duelring"], "duelist:out": ["push", ""], "duelist:salute": ["", "blades"],
	"duelist:lunge": ["lunge", ""],
	"eternity:stop": ["", "clock"], "eternity:clock": ["", "clockzone"],
	"evileye:open": ["eye", "eyelong"], "evileye:stare": ["sight", ""], "evileye:mark": ["", "eyelong"], "evileye:burst": ["burst", "eyelong"],
	"evileye:gaze": ["beam", ""],
	"fervor:flare": ["pyre", ""], "fervor:sparks": ["hurl", ""], "fervor:fed": ["ablaze", ""], "fervor:blaze": ["pyre", ""],
	"fever:haze": ["cloud", ""], "fever:pulse": ["stream", ""], "fever:sweat": ["cloud", ""],
	"fury:aura": ["", "furyring"], "fury:ember": ["", "ember"], "fury:take": ["frenzy", ""], "fury:roar": ["frenzy", "roar"],
	"fury:charge": ["dash", ""],
	"glide:skate": ["rush", ""], "glide:aside": ["freeze", ""], "glide:strip": ["freeze", ""],
	"grudge:mark": ["", "redmark"], "grudge:pay": ["slam", ""], "grudge:seal": ["", "sigil"], "grudge:again": ["cut", ""],
	"grudge:chain": ["", "chainline"],
	"haymaker:fly": ["thrown", ""], "haymaker:crash": ["slam", ""], "haymaker:crack": ["quake", ""], "haymaker:down": ["stun", ""],
	"hourglass:turn": ["", "hourglass"], "hourglass:fall": ["burst", ""], "hourglass:stand": ["", "hourstand"],
	"hourglass:flare": ["surge", ""], "hourglass:hang": ["", "hourglass"],
	"lamprey:latch": ["", "tether"], "lamprey:drain": ["drink", ""], "lamprey:bite": ["bite", ""], "lamprey:drip": ["drink", ""],
	"lancet:lance": ["seek", ""], "lancet:drive": ["cut", "dagger"], "lancet:blade": ["", "dagger"], "lancet:drain": ["drink", ""],
	"lancet:cut": ["seek", ""],
	"manacle:chain": ["bind", "chainline"], "manacle:link": ["", "chainline"], "manacle:snap": ["", "chainline"],
	# --- ROUND 2
	"mauler:fling": ["thrown", ""], "mauler:whip": ["", "chainline"], "mauler:maul": ["stun", ""],
	"momentum:roll": ["wide", ""], "momentum:drum": ["slam", "roar"], "momentum:barrel": ["stun", ""],
	"needle:mist": ["cloud", ""], "needle:needles": ["hurl", ""], "needle:needle": ["", "dagger"], "needle:sting": ["dose", ""],
	"onrush:rush": ["rush", ""], "onrush:bowl": ["push", ""],
	"pin:spike": ["", "spike"],
	"quickdraw:draw": ["flick", ""], "quickdraw:glance": ["flick", ""], "quickdraw:gleam": ["flick", ""],
	"quickening:ripple": ["still", "roar"], "quickening:pulse": ["still", "roar"], "quickening:image": ["", "image"],
	"rapier:thrust": ["lance", ""], "rapier:flourish": ["", "slashring"], "rapier:lunge": ["lunge", ""],
	"reverb:echo": ["", "roar"], "reverb:ring": ["push", "roar"],
	"riposte:answer": ["blade", ""], "riposte:blade": ["blade", ""], "riposte:counter": ["blade", ""],
	"siphon:thread": ["drain", ""], "siphon:motes": ["drink", ""],
	"stillpoint:shards": ["still", "shards"], "stillpoint:ring": ["", "duelring"], "stillpoint:hush": ["still", ""],
	"stillpoint:stop": ["", "clock"],
	"sunder:plates": ["", "plates"], "sunder:crack": ["quake", ""], "sunder:trip": ["stun", ""],
	"tailwind:gust": ["push", ""], "tailwind:trail": ["push", ""], "tailwind:grit": ["spread", ""],
	"tempo:beat": ["slam", "roar"],
	"timeslip:image": ["", "image"], "timeslip:slip": ["blink", ""],
	"transfusion:orb": ["heal", "orb"], "transfusion:pool": ["", "pool"], "transfusion:pulse": ["heal", ""], "transfusion:thread": ["drain", ""],
	"vendetta:sigil": ["", "sigil"], "vendetta:pass": ["pass", ""], "vendetta:slashes": ["cut", "slashring"],
	"windward:whirl": ["", "windring"], "windward:gust": ["push", ""],
	"amber:seal": ["", "amberblock"], "amber:stick": ["thread", ""], "amber:shatter": ["burst", "shards"], "amber:amber": ["", "amberblock"],
	"amber:crack": ["burst", ""],
	# --- ROUND 3
	"beckon:hand": ["drag", "handup"], "beckon:pass": ["pass", ""], "beckon:hands": ["bind", "handup"],
	"bedrock:ring": ["quake", "rockring"], "bedrock:stone": ["slam", "stone"], "bedrock:rock": ["stun", "stone"],
	"blink:streak": ["rush", ""], "blink:cut": ["cut", ""], "blink:flash": ["burst", ""],
	"bloodcurse:drops": ["drink", ""], "bloodcurse:thread": ["drain", ""],
	"bloodlust:spray": ["spray", ""], "bloodlust:wave": ["slam", "roar"], "bloodlust:charge": ["dash", ""], "bloodlust:mist": ["frenzy", ""],
	"bloodtide:tide": ["stream", ""], "bloodtide:wave": ["roll", ""], "bloodtide:stream": ["stream", ""],
	"blur:blur": ["", "image"], "blur:pass": ["cut", ""], "blur:flicker": ["", "image"],
	"brimstone:gout": ["pyre", ""], "brimstone:jet": ["pyre", ""], "brimstone:brimstone": ["ablaze", ""],
	"bullseye:rings": ["push", "target"], "bullseye:target": ["", "target"], "bullseye:burst": ["burst", "target"],
	"burden:weight": ["", "weighton"], "burden:chains": ["bind", ""], "burden:crash": ["slam", ""],
	"cataclysm:split": ["quake", "rockring"], "cataclysm:rock": ["quake", ""],
	"cauterize:sear": ["hurl", ""], "cauterize:embers": ["pyre", ""], "cauterize:flare": ["pyre", ""],
	"coldblood:warmth": ["drink", ""], "coldblood:shatter": ["shatter", ""],
	"daze:stars": ["hurl", ""], "daze:jolt": ["stun", ""],
	"doubletap:double": ["slam", ""], "doubletap:link": ["", "chainline"], "doubletap:echo": ["flick", ""], "doubletap:down": ["stun", ""],
	"feedingfrenzy:feed": ["stream", ""], "feedingfrenzy:orb": ["drink", ""], "feedingfrenzy:gorge": ["frenzy", ""],
	"fetters:cuff": ["", "chainline"], "fetters:link": ["", "chainline"],
	"flechette:dart": ["", "dagger"], "flechette:darts": ["", "dartring"],
	"fortress:slab": ["slam", "weight"], "fortress:stone": ["hurl", ""], "fortress:wall": ["stun", "stone"],
	"frostbite:burst": ["freeze", ""], "frostbite:creep": ["trail", ""], "frostbite:freeze": ["freeze", ""],
}
## (how long a thing of its own stands, where its moment says not)
const LASTS := {"hammer": 0.45, "shadow": 0.9, "blades": 0.9, "clock": 1.2, "roar": 0.6, "weight": 0.5, "spiral": 0.9, "sore": 0.6,
	"redmark": 1.2, "dagger": 0.8, "tether": 1.5, "chainline": 0.5, "furyring": 0.5, "shieldring": 5.0,
	"spike": 0.9, "plates": 0.8, "image": 1.0, "slashring": 0.5, "shards": 0.7, "orb": 0.8, "pool": 5.0, "windring": 0.5,
	"amberblock": 1.5, "handup": 0.9, "rockring": 0.7, "stone": 0.8, "target": 0.9, "weighton": 1.0, "dartring": 4.0}
## (the redone ones whose moments are their blood's, fire's or ice's)
const BLOOD_IDS := ["lamprey", "lancet", "transfusion", "bloodcurse", "bloodlust", "bloodtide", "feedingfrenzy"]
const FIRE_IDS := ["fervor", "brimstone", "cauterize"]
const ICE_IDS := ["glide", "frostbite"]


## (not found by its id: fx_melds52.gd hands it only the moments these add)
func ids() -> Array:
	return []


func knows(id: String, what: String) -> bool:
	return M52.REDO_ON and MOMENTS.has(id + ":" + what)


func _R(b: Dictionary) -> PackedColorArray:
	if b.get("foe", false):
		return ENEMY
	var id := str(b["id"])
	# (what is drawn out of a body, life or warmth, in blood's red, whatever the meld)
	if id in BLOOD_IDS or str(b.get("told", "")) == "warmth":
		return BLOOD
	if id in FIRE_IDS:
		return PackedColorArray(FIRE)
	if id in ICE_IDS:
		return PackedColorArray(ICE)
	return super._R(b)


func begin(b: Dictionary, e: Dictionary) -> bool:
	var key := str(b["id"]) + ":" + str(b["what"])
	var mo: Array = MOMENTS.get(key, ["burst", ""])
	b["own"] = mo[1]
	b["told"] = b["what"]
	if e.get("minor", false):
		b["minor"] = true
	if e.get("stay", false):
		b["stay"] = true
	if e.has("m") and e["m"] != null and is_instance_valid(e["m"]):
		b["m"] = e["m"]
	var alias: String = mo[0]
	if alias != "":
		b["what"] = alias
		super.begin(b, e)
	else:
		b["what"] = "own"
		b["line"] = absf(float(b["x1"]) - float(b["x"])) + absf(float(b["y1"]) - float(b["y"])) > 0.05
		b["end"] = 0.6
		if fx != null:
			var R := _R(b)
			fx.flash(b["x"], b["y"], 10.0, 0.6, 0.14, PackedColorArray([Color.WHITE, R[5], R[4]]))
	var own: String = b["own"]
	# (an after-image is of him as he stood when it began)
	if own == "image":
		_catch_ghost(b)
	if LASTS.has(own):
		b["end"] = maxf(float(b["end"]), float(LASTS[own]))
	if e.has("secs"):
		b["end"] = maxf(float(b["end"]), float(e["secs"]))
	if own == "hammer" and fx != null:
		fx.kick(0.2)
	return true


func paint_floor(b: Dictionary) -> void:
	if b["what"] != "own":
		super.paint_floor(b)
	var own: String = b.get("own", "")
	if own == "":
		return
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var fade := 1.0 - u
	var R := _R(b)
	var sd: int = int(b["seed"])
	var x: float = b["x"]
	var y: float = b["y"]
	match own:
		"closing":
			# (Ambush's mark: a sight of light closing in round it; strike before it closes)
			_reticle(x, y, 1.7 - 1.25 * u, R, 0.95)
			_reticle(x, y, 1.75 - 1.25 * u + 0.2, R, 0.35)
		"duelring":
			# (the duel's circle: blades planted round its edge, points down, and its edge of light)
			var r: float = float(b["r"])
			var a := minf(1.0, fade * 4.0)
			_front(x, y, r, R, sd, a * 0.6, "water")
			for k in 8:
				var ang := k * TAU / 8.0 + 0.2
				var p := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * r
				_planted_blade(_wx(p.x, p.y), _wy(p.x, p.y), R, a, k)
		"shieldring":
			# (Bulwark's ward: its edge on the floor, the shields standing round it drawn over)
			_front(x, y, float(b["r"]), R, sd, 0.6 * minf(1.0, fade * 4.0), "sound")
		"clockzone":
			# (Eternity's bubble: a clock's face on the floor, its rim doubled, its hours, its hand sweeping round as the rules' does)
			var r: float = float(b["r"])
			var a := minf(1.0, fade * 4.0)
			_fs(R[2])
			_ga(0.6 * a)
			_ring(x, y, r * 1.06, 0, 0.0)
			_fs(R[4])
			_ga(0.8 * a)
			_ring(x, y, r, 0, 0.0)
			for k in 12:
				var ang := k * TAU / 12.0
				var p0 := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * r * (0.78 if k % 3 == 0 else 0.86)
				var p1 := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * r
				_fs(R[5] if k % 3 == 0 else R[4])
				_line(_wx(p0.x, p0.y), _wy(p0.x, p0.y), _wx(p1.x, p1.y), _wy(p1.x, p1.y), 2)
			var ang2 := fmod(1.4 * float(b["t"]), TAU)
			var tip := Vector2(x, y) + Vector2(cos(ang2), sin(ang2)) * r * 0.92
			_fs(R[3])
			_ga(0.9 * a)
			_line(_wx(x, y), _wy(x, y) + 1.0, _wx(tip.x, tip.y), _wy(tip.x, tip.y) + 1.0, 3)
			_fs(R[5])
			_line(_wx(x, y), _wy(x, y), _wx(tip.x, tip.y), _wy(tip.x, tip.y), 2)
			_glow(_wx(tip.x, tip.y), _wy(tip.x, tip.y), 10.0, R[5], 0.6 * a)
		"shadow":
			# (Doom on him: the hammer's shadow gathering where the blow will fall, its edge warning)
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			var g := 0.3 + 0.7 * minf(1.0, u * 1.4)
			_fs(Color(0.05, 0.0, 0.05))
			for k in 5:
				var f := float(k) / 5.0
				_ga(0.18 + 0.1 * k)
				_fill(cx - 16.0 * g * (1.0 - f * 0.5), cy - 5.0 * g * (1.0 - f * 0.5), 32.0 * g * (1.0 - f * 0.5), 10.0 * g * (1.0 - f * 0.5))
			_front(x, y, 1.1 * g, R, sd, 0.8, "shock")
		"hourstand":
			_hourglass(_wx(x, y), _wy(x, y) - 26.0, 13.0, R, minf(1.0, fade * 4.0), u)
		"rockring":
			# (rock bursting up round it: standing stones heaving up in a ring and sinking back, dust off their feet)
			var rise := sin(minf(1.0, u * 1.4) * PI)
			for k in 8:
				var ang := k * TAU / 8.0 + 0.3
				var p := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * float(b["r"]) * (0.6 + 0.4 * u)
				_stone(_wx(p.x, p.y), _wy(p.x, p.y), 7.0 + 2.0 * _rh(sd, k), maxf(2.0, (11.0 + 5.0 * _rh(sd, k + 3)) * rise), STONE, sd + k, minf(1.0, fade * 2.0))
			_front(x, y, float(b["r"]) * (0.4 + 0.8 * u), DUST6, sd, fade * 0.8, "shock")
		"dartring":
			# (Flechette's darts stuck in the ground round where it ended: shafts slanting, their flights, their heads glinting)
			for k in 7:
				var ang := k * TAU / 7.0
				var p := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * float(b["r"])
				var px := _wx(p.x, p.y)
				var py := _wy(p.x, p.y)
				var a := minf(1.0, fade * 4.0)
				_ga(a)
				_fs(DUST6[3])
				_line(px, py, px + 4.0, py - 11.0, 1)
				_fs(R[3])
				_line(px + 3.0, py - 9.0, px + 1.0, py - 12.0, 1)
				_line(px + 5.0, py - 9.0, px + 7.0, py - 12.0, 1)
				_fs(R[5])
				_fill(_ri(px), _ri(py) - 1, 2, 2)
				_glow(px, py, 5.0, R[4], 0.5 * a)
		"pool":
			# (Transfusion's pool of life where it fell: a puddle of blood, its edge uneven, lit on its far side, its glints, and
			# ripples running across it as it pulses)
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			var rx: float = float(b["r"]) * 22.6
			var ry := rx * 0.5
			var a := 0.75 * minf(1.0, fade * 4.0)
			_ga(a)
			for dy in range(-_ri(ry), _ri(ry) + 1):
				var v := float(dy) / ry
				var half := rx * sqrt(maxf(0.0, 1.0 - v * v)) * (1.0 + 0.1 * sin(dy * 1.3 + sd))
				var x0 := _ri(cx - half)
				var w := _ri(half * 2.0)
				if w <= 0:
					continue
				_fs(R[1])
				_fill(x0, _ri(cy) + dy, w, 1)
				_fs(R[2])
				_fill(x0, _ri(cy) + dy, maxi(1, w / 3), 1)
				_fs(R[0])
				_fill(x0 + w - 1, _ri(cy) + dy, 1, 1)
			_fs(R[3])
			_fill(_ri(cx - rx * 0.7), _ri(cy - ry * 0.4), _ri(rx * 0.5), 1)
			var pulse := fmod(float(b["t"]) * 0.9, 1.0)
			_front(x, y, float(b["r"]) * 0.85 * pulse, R, sd, a * (1.0 - pulse), "water")
			_fs(R[5])
			for k in 4:
				_fill(_ri(cx + (_rh(sd, k) - 0.5) * rx * 1.2), _ri(cy + (_rh(sd, k + 4) - 0.5) * ry), 1, 1)
		"windring":
			# (Windward's whirl: ribbons of wind curling round, white at their heads, grit carried in them)
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			for k in 3:
				var base := t * 7.0 + k * TAU / 3.0
				var rr := 14.0 + k * 6.0 + u * 14.0
				for j in 14:
					var f := float(j) / 14.0
					var ang := base - f * 1.8
					var px := cx + cos(ang) * rr * (1.0 + f * 0.15)
					var py := cy - 6.0 + sin(ang) * rr * 0.5 * (1.0 + f * 0.15) - f * 4.0
					_ga(fade * (1.0 - f))
					_fs(Color.WHITE if j == 0 else (R[5] if j < 4 else R[4]))
					_fill(_ri(px), _ri(py), 2 if j < 8 else 1, 1)
			for k in 6:
				var ang := t * 9.0 + k * 1.1
				_fs(DUST6[3])
				_ga(fade)
				_fill(_ri(cx + cos(ang) * (18.0 + k * 2.0)), _ri(cy - 8.0 + sin(ang) * 8.0), 1, 1)
		"furyring":
			for k in 8:
				var ang := k * TAU / 8.0 + t * 2.0
				var p := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * 1.4
				_flames(_wx(p.x, p.y), _wy(p.x, p.y), 2, 6.0, 16.0 * fade, fade, R, int(b["seed"]) + k)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	if b["what"] != "own":
		super.paint_air(b)
	var own: String = b.get("own", "")
	if own == "":
		return
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var fade := 1.0 - u
	var R := _R(b)
	var sd: int = int(b["seed"])
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"]) - 12.0
	var x1 := _wx(b["x1"], b["y1"])
	var y1 := _wy(b["x1"], b["y1"]) - 12.0
	match own:
		"hammer":
			# (Doom: a great iron maul dropping out of the dark onto it, a rune band glowing round its head, speed lines over it as it
			# falls; it strikes as the rules' blow lands, bounces, and the stars fly)
			var drop: float = minf(1.0, u / 0.78)
			var hy := cy - 2.0 - 90.0 * (1.0 - drop * drop)
			if drop >= 1.0:
				hy -= sin(minf(1.0, (u - 0.78) / 0.22) * PI) * 3.0
			var a := minf(1.0, fade * 3.0)
			if drop < 1.0:
				for k in 5:
					_ga(a * 0.7)
					_fs(R[4] if k % 2 else R[3])
					var lx := cx - 14.0 + k * 7.0
					_line(lx, hy - 30.0 - 10.0 * drop, lx, hy - 12.0, 1)
			_maul(cx, hy, R, a)
			if drop >= 1.0:
				_stars(cx, cy - 6.0, 5, R, fade, t * 6.0)
		"weight":
			# (Doom's crushing weight: an iron weight dropping onto it)
			var drop: float = minf(1.0, u / 0.5)
			_weight(cx, cy - 4.0 - 60.0 * (1.0 - drop * drop), R, fade, false)
		"roar":
			# (a roar: its front going out from it in breaking waves, and streaks thrown off)
			for k in 3:
				var rr: float = (0.5 + k * 0.45) * (0.6 + u * 1.4)
				_front(b["x"], b["y"], rr, R, sd + k, fade * (1.0 - k * 0.25), "sound")
			for k in 8:
				var ang := k * TAU / 8.0 + 0.3
				var r0 := 10.0 + u * 30.0
				_ga(fade * 0.8)
				_fs(R[4])
				_line(cx + cos(ang) * r0, cy + sin(ang) * r0 * 0.5, cx + cos(ang) * (r0 + 7.0), cy + sin(ang) * (r0 + 7.0) * 0.5, 1)
			_glow(cx, cy, 16.0, R[4], 0.4 * fade)
		"blades":
			# (Duelist: two swords crossing over it, flashing where they meet)
			var by := cy - 26.0 - u * 4.0
			var a := minf(1.0, fade * 2.5)
			var sw := minf(1.0, u / 0.2)
			for s in [-1.0, 1.0]:
				_sword(cx + 12.0 * s * (1.0 - sw), by, s, R, a)
			if sw >= 1.0:
				_glow(cx, by, 16.0, R[5], 0.7 * fade)
				_fs(Color.WHITE)
				_ga(fade)
				_fill(_ri(cx) - 4, _ri(by), 9, 1)
				_fill(_ri(cx), _ri(by) - 4, 1, 9)
		"clock":
			_clock(cx, cy - 28.0, 13.0, R, fade, u)
		"eyelong":
			_eye(cx, cy - 22.0, R, minf(1.0, fade * 3.0))
		"spiral":
			# (Delirium: its mind spinning: two arms of light spiralling over it, and stars reeling)
			for arm in 2:
				for k in 14:
					var ang := k * 0.55 + t * 7.0 + arm * PI
					var rr := 2.0 + k * 1.3
					_fs(R[5] if k < 3 else (R[4] if k % 2 == 0 else R[3]))
					_ga(fade * (1.0 - k * 0.04))
					_fill(_ri(cx + cos(ang) * rr), _ri(cy - 24.0 + sin(ang) * rr * 0.5), 2, 2 if k < 6 else 1)
			_stars(cx, cy - 24.0, 3, R, fade, -t * 5.0)
		"sore":
			# (Canker: boils swelling on it, glistening, and bursting)
			for k in 4:
				var dx := (_rh(sd, k) - 0.5) * 18.0
				var dy := -_rh(sd, k + 2) * 14.0
				var rr := 2.0 + minf(1.0, u * 1.4) * 4.0 * (0.7 + 0.5 * _rh(sd, k + 5))
				if u > 0.75 + _rh(sd, k + 8) * 0.15:
					for j in 5:
						var ang := j * TAU / 5.0 + k
						_fs(R[4])
						_ga(fade)
						_fill(_ri(cx + dx + cos(ang) * (rr + 3.0)), _ri(cy + dy + sin(ang) * (rr + 3.0) * 0.6), 1, 1)
					continue
				_boil(cx + dx, cy + dy, rr, R, fade)
		"redmark":
			# (Grudge on him: a brand burning over him, its next blow twice as hard)
			var a := minf(1.0, fade * 3.0)
			_ga(a)
			_fs(R[1])
			_line(cx - 9.0, cy - 33.0, cx + 9.0, cy - 15.0, 3)
			_line(cx + 9.0, cy - 33.0, cx - 9.0, cy - 15.0, 3)
			_fs(R[4])
			_line(cx - 9.0, cy - 34.0, cx + 9.0, cy - 16.0, 2)
			_line(cx + 9.0, cy - 34.0, cx - 9.0, cy - 16.0, 2)
			_fs(R[5])
			_fill(_ri(cx) - 1, _ri(cy) - 26, 3, 3)
			_flames(cx, cy - 30.0, 3, 10.0, 9.0, a, R, sd)
			_glow(cx, cy - 24.0, 14.0, R[4], 0.6 * a)
		"sigil":
			_glyph(str(b["id"]), cx, cy - 26.0, 2, R[2], R[4], minf(1.0, fade * 3.0))
			_glow(cx, cy - 26.0, 14.0, R[4], 0.5 * fade)
		"hourglass":
			_hourglass(cx, cy - 30.0, 11.0, R, minf(1.0, fade * 3.0), u)
		"dagger":
			# (Lancet, Needle, Flechette: a blade hanging over it, then driven in)
			var dy := -30.0 + (20.0 * minf(1.0, u * 3.0) if b.get("told", "") == "drive" else sin(t * 4.0) * 2.0)
			_dagger(cx, cy + dy, R, minf(1.0, fade * 3.0))
		"tether":
			# (Lamprey: a red line latched from it to him, writhing, pulsing as it drinks)
			_ga(fade)
			var n := 12
			var px := cx
			var py := cy
			for k in range(1, n + 1):
				var f := float(k) / n
				var qx := cx + (x1 - cx) * f
				var qy := cy + (y1 - cy) * f + sin(f * TAU * 1.5 + t * 10.0) * 3.0
				_fs(R[1])
				_line(px, py + 1.0, qx, qy + 1.0, 3)
				_fs(R[3])
				_line(px, py, qx, qy, 2)
				px = qx
				py = qy
			for k in 3:
				var pulse: float = fmod(t * 1.6 + k / 3.0, 1.0)
				_drop(cx + (x1 - cx) * pulse, cy + (y1 - cy) * pulse + sin(pulse * TAU * 1.5 + t * 10.0) * 3.0, R, fade)
		"chainline":
			# (Manacle, Grudge, Fetters...: a chain of iron links from where it holds to what it holds, sagging)
			var len := Vector2(x1 - cx, y1 - cy).length()
			var n := maxi(3, int(len / 5.0))
			var a := minf(1.0, fade * 3.0)
			for k in n + 1:
				var f := float(k) / n
				var px := cx + (x1 - cx) * f
				var py := cy + 8.0 + (y1 - cy) * f + sin(f * PI) * 6.0
				_ga(a)
				if k % 2 == 0:
					_fs(IRON[3])
					_fill(_ri(px) - 3, _ri(py) - 2, 6, 1)
					_fill(_ri(px) - 3, _ri(py) + 1, 6, 1)
					_fill(_ri(px) - 3, _ri(py) - 1, 1, 2)
					_fill(_ri(px) + 2, _ri(py) - 1, 1, 2)
					_fs(R[4])
					_fill(_ri(px) - 2, _ri(py) - 2, 3, 1)
				else:
					_fs(IRON[4])
					_fill(_ri(px) - 3, _ri(py) - 1, 6, 1)
					_fs(IRON[2])
					_fill(_ri(px) - 3, _ri(py), 6, 1)
			_glow(x1, y1 + 8.0, 10.0, R[4], 0.5 * a)
		"ember":
			_flames(cx, cy + 10.0, 4, 10.0, 16.0, minf(1.0, fade * 4.0), R, sd)
		"spike":
			# (Pin: a spike of light driven down through it into the floor, the ground cracking round its foot)
			var drop: float = minf(1.0, u / 0.25)
			var sy := cy - 64.0 * (1.0 - drop)
			var a := minf(1.0, fade * 3.0)
			_ga(a)
			_fs(R[2])
			_line(cx + 1.0, sy - 34.0, cx + 1.0, sy + 12.0, 3)
			_fs(R[4])
			_line(cx, sy - 34.0, cx, sy + 12.0, 3)
			_fs(Color.WHITE)
			_line(cx, sy - 32.0, cx, sy + 10.0, 1)
			_fs(R[3])
			for row in 7:
				var hw := 3 - absi(row - 3)
				_fill(_ri(cx) - hw, _ri(sy) - 40 + row, hw * 2 + 1, 1)
			_fs(R[5])
			_fill(_ri(cx) - 4, _ri(sy) - 33, 9, 2)
			if drop < 1.0:
				_fs(R[4])
				_ga(a * 0.6)
				_line(cx - 3.0, sy - 60.0, cx - 3.0, sy - 40.0, 1)
				_line(cx + 3.0, sy - 56.0, cx + 3.0, sy - 40.0, 1)
			else:
				_fs(DUST6[1])
				_ga(a)
				for k in 6:
					var ang := k * TAU / 6.0 + 0.4
					_line(cx, cy + 12.0, cx + cos(ang) * (8.0 + u * 10.0), cy + 12.0 + sin(ang) * (4.0 + u * 5.0), 1)
				_glow(cx, cy + 10.0, 14.0, R[5], 0.7 * fade)
		"plates":
			# (Sunder: plates of its guard torn off it, tumbling as they fly, rivets and all, sparks off them)
			for k in 6:
				var ang := -PI * 0.5 + (_rh(sd, k) - 0.5) * 2.6
				var d := 8.0 + u * 30.0
				var px := cx + cos(ang) * d
				var py := cy - 8.0 + sin(ang) * d * 0.8 + u * u * 22.0
				var spin := absf(cos(t * 9.0 + k * 1.3))
				_plate(px, py, 10.0 * (0.35 + 0.65 * spin), R, fade, k)
			if u < 0.3:
				_glow(cx, cy - 6.0, 16.0, R[5], 0.7 * (1.0 - u / 0.3))
		"image":
			_afterimage(cx, cy + 12.0, fade, u, b, R)
		"slashring":
			# (a flourish: blade slashes sweeping round it)
			for k in 8:
				var ang := k * TAU / 8.0 + u * 2.4
				var p0 := Vector2(cos(ang), sin(ang) * 0.5) * 20.0
				var p1 := Vector2(cos(ang + 0.6), sin(ang + 0.6) * 0.5) * 34.0
				_fs(R[3])
				_ga(fade)
				_line(cx + p0.x, cy + p0.y + 1.0, cx + p1.x, cy + p1.y + 1.0, 3)
				_fs(R[5])
				_line(cx + p0.x, cy + p0.y, cx + p1.x, cy + p1.y, 2)
				_fs(Color.WHITE)
				_line(cx + p0.x, cy + p0.y, cx + (p0.x + p1.x) * 0.5, cy + (p0.y + p1.y) * 0.5, 1)
		"shards":
			for k in 7:
				var ang := k * TAU / 7.0 + 0.4
				_shard(cx + cos(ang) * 10.0 * (0.4 + u * 1.8), cy + sin(ang) * 5.0 * (0.4 + u * 1.8), 5.0, 10.0, R, sd + k, fade)
		"orb":
			# (Transfusion: a globe of blood gathered over him, swirling, dripping, then bursting into drops)
			# (over his head, clear of him)
			var oy := cy - 48.0
			if u < 0.75:
				_globe(cx, oy, 6.0 + u * 8.0, R, minf(1.0, fade * 3.0))
			else:
				var f := (u - 0.75) / 0.25
				for k in 8:
					var ang := k * TAU / 8.0
					_drop(cx + cos(ang) * (8.0 + f * 18.0), oy + sin(ang) * (5.0 + f * 9.0) + f * f * 10.0, R, 1.0 - f)
				_glow(cx, oy, 18.0, R[4], 0.7 * (1.0 - f))
		"amberblock":
			# (Amber: a lump of amber sealing it, its faces lit, cracking as it goes)
			_amber(cx, cy + 10.0, R, minf(1.0, fade * 3.0), u, sd)
		"handup":
			_hand_up(cx, cy + 12.0, minf(1.0, fade * 3.0), u)
		"stone":
			# (a standing stone heaving up from the ground under it, dust rolling off its foot; under him from a monster, three
			# stones heaving up round his feet, never over him: Animations 4)
			if b.get("foe", false):
				for k in 3:
					var ox: float = [-13.0, 13.0, 0.0][k]
					var oy: float = [3.0, 3.0, -5.0][k]
					var hk := 15.0 * sin(minf(1.0, u * 1.6) * PI * 0.5)
					_stone(cx + ox, cy + 14.0 + oy, 8.0, maxf(2.0, hk), STONE, sd + k, minf(1.0, fade * 3.0))
				_curl(cx, cy + 14.0 - u * 6.0, 10.0, [DUST6[1], DUST6[2], DUST6[3]], sd, fade)
			else:
				var hgt := 26.0 * sin(minf(1.0, u * 1.6) * PI * 0.5)
				_stone(cx, cy + 14.0, 14.0, maxf(3.0, hgt), STONE, sd, minf(1.0, fade * 3.0))
				if u > 0.25:
					_curl(cx - 10.0, cy + 12.0 - u * 6.0, 9.0, [DUST6[1], DUST6[2], DUST6[3]], sd, fade)
					_curl(cx + 10.0, cy + 12.0 - u * 6.0, 8.0, [DUST6[1], DUST6[2], DUST6[3]], sd + 3, fade)
		"target":
			# (Bullseye: a target's face over it, its bands painted, cross-hairs closing on its heart)
			_target(cx, cy - 4.0, 12.0 - (3.0 * u if b.get("foe", false) else 0.0), R, minf(1.0, fade * 3.0), u)
		"weighton":
			# (Burden: an iron weight settled on it, swaying, chained down)
			_weight(cx, cy - 32.0 + sin(t * 3.0) * 1.5, R, minf(1.0, fade * 3.0), true)
		"shieldring":
			# (Bulwark's ward: raised shields standing round its edge)
			var r: float = float(b["r"])
			for k in 8:
				var ang := k * TAU / 8.0
				var p := Vector2(b["x"], b["y"]) + Vector2(cos(ang), sin(ang)) * r
				_shield_face(_wx(p.x, p.y), _wy(p.x, p.y) - 10.0, 13.0, R, minf(1.0, fade * 4.0))
	_ga(1.0)


## A clock's face: its rim, its twelve hours (the quarters bolder), its hands standing still, its light.
func _clock(cx: float, cy: float, r: float, R: PackedColorArray, a: float, _u: float) -> void:
	_ga(a)
	_fs(R[1])
	for k in 36:
		var ang := k * TAU / 36.0
		_fill(cx + cos(ang) * (r + 1.0) - 1.0, cy + sin(ang) * (r + 1.0) - 1.0, 2.0, 2.0)
	_fs(R[3])
	for k in 36:
		var ang := k * TAU / 36.0
		_fill(cx + cos(ang) * r - 1.0, cy + sin(ang) * r - 1.0, 1.0, 1.0)
	for k in 12:
		var ang := k * TAU / 12.0
		_fs(R[5] if k % 3 == 0 else R[4])
		_fill(cx + cos(ang) * (r - 3.0), cy + sin(ang) * (r - 3.0), 2.0 if k % 3 == 0 else 1.0, 2.0 if k % 3 == 0 else 1.0)
	_fs(Color.WHITE)
	_line(cx, cy, cx, cy - r + 4.0, 2)
	_line(cx, cy, cx + r * 0.55, cy, 1)
	_fs(R[5])
	_fill(cx - 1.0, cy - 1.0, 3.0, 3.0)
	_glow(cx, cy, r * 1.6, R[4], 0.5 * a)


## An hourglass: its two bulbs, the sand falling from the top into the bottom as `u` runs.
func _hourglass(cx: float, cy: float, s: float, R: PackedColorArray, a: float, u: float) -> void:
	_ga(a)
	_fs(R[1])
	_fill(cx - s, cy - s * 1.4, s * 2.0, 2.0)
	_fill(cx - s, cy + s * 1.4 - 2.0, s * 2.0, 2.0)
	for k in int(s * 1.2):
		var f := float(k) / (s * 1.2)
		var w := s * (1.0 - f) + 1.0
		_fs(R[2])
		_fill(cx - w, cy - s * 1.2 + k, 1.0, 1.0)
		_fill(cx + w - 1.0, cy - s * 1.2 + k, 1.0, 1.0)
		_fill(cx - w, cy + s * 1.2 - k - 1.0, 1.0, 1.0)
		_fill(cx + w - 1.0, cy + s * 1.2 - k - 1.0, 1.0, 1.0)
		# (the sand: the top emptying, the bottom filling)
		_fs(R[4])
		if f > u:
			_fill(cx - w + 1.0, cy - s * 1.2 + k + s * 0.2, w * 2.0 - 2.0, 1.0)
		if f < u:
			_fill(cx - w + 1.0, cy + s * 1.2 - k - 1.0, w * 2.0 - 2.0, 1.0)
	_fs(R[5])
	_fill(cx, cy - 1.0, 1.0, 2.0 + u * s)


## (dark iron, for the things of iron these drop: Doom's hammer, the weights; lit from the upper left)
const IRON := [Color("#0e0c16"), Color("#221e2c"), Color("#3c3648"), Color("#5e5870"), Color("#8e88a4"), Color("#cac6dc")]


## (each frame of a beat: the things that fall land, and as they land the screen kicks and holds, his Art Rulebook's Movement 7,
## and the dust and bits fly)
func tick(b: Dictionary, dt: float) -> void:
	super.tick(b, dt)
	var own: String = b.get("own", "")
	if not own in ["hammer", "weight", "spike", "stone"] or b.get("landed", false):
		return
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var at: float = {"hammer": 0.78, "weight": 0.5, "spike": 0.25, "stone": 0.3}[own]
	if u < at:
		return
	b["landed"] = true
	if fx == null:
		return
	var R := _R(b)
	var heavy := own in ["hammer", "weight"]
	fx.kick(4.0 if heavy else 2.5)
	fx.hold(0.1 if heavy else 0.06)
	fx.flash(b["x"], b["y"], 6.0, 1.2 if heavy else 0.8, 0.16, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
	for i in (16 if heavy else 10):
		_bit(b["x"], b["y"], 4.0, "stone", DUST6, 2.5 + (1.5 if heavy else 0.5), 0.7, 40, 10, 30)
	for i in 8:
		_bit(b["x"], b["y"], 6.0, "spark", R, 3.0, 0.5, 20, 10, 24)


## A sword planted in the ground, point down: its blade lit on its edge, its guard, its grip and pommel.
func _planted_blade(px: float, py: float, R: PackedColorArray, a: float, k: int) -> void:
	var lean := (float(k % 3) - 1.0) * 1.5
	_ga(a)
	_fs(R[3])
	_line(px, py, px + lean, py - 12.0, 2)
	_fs(Color.WHITE)
	_line(px, py - 1.0, px + lean, py - 12.0, 1)
	_fs(IRON[2])
	_fill(_ri(px + lean) - 3, _ri(py) - 13, 7, 2)
	_fs(IRON[4])
	_fill(_ri(px + lean) - 3, _ri(py) - 13, 3, 1)
	_fs(IRON[1])
	_fill(_ri(px + lean), _ri(py) - 17, 2, 4)
	_fs(R[5])
	_fill(_ri(px + lean), _ri(py) - 19, 2, 2)
	_glow(px, py - 6.0, 6.0, R[4], 0.4 * a)
	_ga(1.0)


## A great iron maul, its head's middle at (cx, cy): the head bevelled and lit from the upper left, a band of runes glowing round it,
## its haft going up, bound at the grip.
func _maul(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	var ix := _ri(cx)
	var iy := _ri(cy)
	_ga(a)
	# (the haft)
	_fs(IRON[1])
	_fill(ix - 2, iy - 52, 5, 42)
	_fs(DUST6[3])
	_fill(ix - 2, iy - 52, 1, 42)
	_fs(DUST6[2])
	for k in 5:
		_fill(ix - 2, iy - 50 + k * 3, 5, 1)
	# (the head: bevelled ends, its top lit)
	for row in 20:
		var bev := 3 if row < 2 or row > 17 else (1 if row < 3 or row > 16 else 0)
		var x0 := ix - 20 + bev
		var w := 40 - bev * 2
		_fs(IRON[4] if row < 4 else (IRON[3] if row < 11 else IRON[2]))
		_fill(x0, iy - 10 + row, w, 1)
		_fs(IRON[5] if row < 11 else IRON[3])
		_fill(x0, iy - 10 + row, 2, 1)
		_fs(IRON[0])
		_fill(x0 + w - 2, iy - 10 + row, 2, 1)
	# (its striking faces)
	_fs(IRON[1])
	_fill(ix - 20, iy - 7, 1, 14)
	_fill(ix + 19, iy - 7, 1, 14)
	# (the band of runes)
	_fs(R[2])
	_fill(ix - 8, iy - 10, 16, 20)
	_fs(R[4])
	for k in 5:
		_fill(ix - 6 + k * 3, iy - 6 + (k % 2) * 4, 1, 5)
	_fs(R[5])
	_fill(ix - 8, iy - 10, 16, 1)
	_glow(cx, cy, 26.0, R[4], 0.6 * a)
	_ga(1.0)


## An iron weight at (cx, cy): its body widening to its foot, lit on the left, its mark glowing, the ring it is lifted by; `chained`,
## chains going down from it either side.
func _weight(cx: float, cy: float, R: PackedColorArray, a: float, chained: bool) -> void:
	var ix := _ri(cx)
	var iy := _ri(cy)
	_ga(a)
	# (its ring)
	_fs(IRON[3])
	_fill(ix - 3, iy - 13, 7, 1)
	_fill(ix - 4, iy - 12, 1, 3)
	_fill(ix + 4, iy - 12, 1, 3)
	_fs(IRON[5])
	_fill(ix - 2, iy - 13, 3, 1)
	for row in 16:
		var half := 6 + int(row * 0.45)
		_fs(IRON[4] if row < 2 else (IRON[3] if row < 10 else IRON[2]))
		_fill(ix - half, iy - 9 + row, half * 2, 1)
		_fs(IRON[5])
		_fill(ix - half, iy - 9 + row, 1, 1)
		_fs(IRON[0])
		_fill(ix + half - 1, iy - 9 + row, 1, 1)
	_fs(IRON[1])
	_fill(ix - 13, iy + 6, 26, 1)
	# (its mark)
	_fs(R[4])
	_fill(ix - 1, iy - 4, 3, 7)
	_fill(ix - 3, iy - 2, 7, 2)
	_fs(R[5])
	_fill(ix - 1, iy - 4, 1, 1)
	if chained:
		for s in [-1, 1]:
			for k in 6:
				_fs(IRON[3] if k % 2 == 0 else IRON[4])
				_fill(ix + s * (10 + k * 2), iy + 7 + k * 3, 2, 2)
	_glow(cx, cy - 1.0, 14.0, R[4], 0.5 * a)
	_ga(1.0)


## A sword at (cx, cy) across, slanting `s` (1 or -1): its blade with an edge of light, its guard, grip and pommel.
func _sword(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	var tip := Vector2(cx + 15.0 * s, cy - 15.0)
	var hilt := Vector2(cx - 9.0 * s, cy + 9.0)
	_ga(a)
	_fs(R[3])
	_line(hilt.x, hilt.y + 1.0, tip.x, tip.y + 1.0, 2)
	_fs(R[5])
	_line(hilt.x, hilt.y, tip.x, tip.y, 1)
	_fs(Color.WHITE)
	_line(cx + 4.0 * s, cy - 4.0, tip.x, tip.y, 1)
	# (its guard, across the blade)
	_fs(IRON[3])
	_line(hilt.x - 4.0, hilt.y - 4.0 * s, hilt.x + 4.0, hilt.y + 4.0 * s, 2)
	_fs(IRON[1])
	_line(hilt.x, hilt.y, hilt.x - 5.0 * s, hilt.y + 5.0, 2)
	_fs(R[5])
	_fill(_ri(hilt.x - 6.0 * s), _ri(hilt.y + 5.0), 2, 2)
	_ga(1.0)


## A dagger hanging point down at (cx, cy): its blade tapering, a line of light down its middle, its guard, its bound grip, its pommel.
func _dagger(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	var ix := _ri(cx)
	var iy := _ri(cy)
	_ga(a)
	for row in 16:
		var w := 3 if row < 11 else (2 if row < 14 else 1)
		_fs(R[4] if row < 13 else R[5])
		_fill(ix - w / 2, iy + row, w, 1)
		if w > 1:
			_fs(R[2])
			_fill(ix - w / 2 + w - 1, iy + row, 1, 1)
	_fs(Color.WHITE)
	_fill(ix, iy + 1, 1, 11)
	_fs(IRON[3])
	_fill(ix - 4, iy - 2, 9, 2)
	_fs(IRON[5])
	_fill(ix - 4, iy - 2, 3, 1)
	_fs(DUST6[2])
	_fill(ix - 1, iy - 7, 3, 5)
	_fs(DUST6[4])
	_fill(ix - 1, iy - 6, 1, 1)
	_fill(ix - 1, iy - 4, 1, 1)
	_fs(R[5])
	_fill(ix - 1, iy - 9, 3, 2)
	_glow(cx, cy + 6.0, 12.0, R[4], 0.5 * a)
	_ga(1.0)


## A plate of armour torn off, `w` across as it turns: curved, its rim lit, its rivets.
func _plate(px: float, py: float, w: float, R: PackedColorArray, a: float, k: int) -> void:
	var iw := maxi(2, _ri(w))
	var x0 := _ri(px - w * 0.5)
	var y0 := _ri(py) - 3
	_ga(a)
	for row in 7:
		var sag := int(round(sin(float(row) / 6.0 * PI) * 1.0))
		_fs(IRON[4] if row < 2 else (IRON[3] if row < 5 else IRON[2]))
		_fill(x0 + sag, y0 + row, iw, 1)
	_fs(R[4])
	_fill(x0, y0, iw, 1)
	_fs(IRON[0])
	_fill(x0 + 1, y0 + 6, iw, 1)
	if iw >= 5:
		_fs(R[5])
		_fill(x0 + 1, y0 + 2, 1, 1)
		_fill(x0 + iw - 2, y0 + 2, 1, 1)
	if k % 2 == 0:
		_fs(Color.WHITE)
		_fill(x0 - 1, y0 - 1, 1, 1)
	_ga(1.0)


## A boil at (cx, cy), `r` across: a swelling dome, lit on its upper left, a glistening head.
func _boil(cx: float, cy: float, r: float, R: PackedColorArray, a: float) -> void:
	var ir := maxi(1, _ri(r))
	_ga(a)
	for dy in range(-ir, 1):
		var hw := _ri(sqrt(maxf(0.0, r * r - dy * dy)))
		if hw <= 0:
			continue
		_fs(R[3])
		_fill(_ri(cx) - hw, _ri(cy) + dy, hw * 2, 1)
		_fs(R[4])
		_fill(_ri(cx) - hw, _ri(cy) + dy, maxi(1, hw / 2), 1)
		_fs(R[1])
		_fill(_ri(cx) + hw - 1, _ri(cy) + dy, 1, 1)
	_fs(R[2])
	_fill(_ri(cx) - ir, _ri(cy) + 1, ir * 2, 1)
	_fs(R[5])
	_fill(_ri(cx) - ir / 2, _ri(cy) - ir + 1, 1, 1)
	_glow(cx, cy - r * 0.5, r * 1.8, R[4], 0.4 * a)
	_ga(1.0)


## A globe of blood at (cx, cy), `r` across: lit on its upper left, a swirl in it, its glint, and drops falling from beneath.
func _globe(cx: float, cy: float, r: float, R: PackedColorArray, a: float) -> void:
	var ir := _ri(r)
	_glow(cx, cy, r * 2.2, R[4], 0.55 * a)
	_ga(a)
	for dy in range(-ir, ir + 1):
		var hw := _ri(sqrt(maxf(0.0, r * r - dy * dy)))
		if hw <= 0:
			continue
		for dx in range(-hw, hw):
			var lit := -(float(dx) + float(dy)) / (r * 1.4)
			var sw := sin(atan2(float(dy), float(dx)) * 2.0 + t * 8.0 + sqrt(float(dx * dx + dy * dy)) * 0.6)
			_fs(R[4] if lit > 0.45 else (R[3] if sw > 0.3 else R[2]))
			if sqrt(float(dx * dx + dy * dy)) > r - 1.2 and dx + dy > 0:
				_fs(R[1])
			_fill(_ri(cx) + dx, _ri(cy) + dy, 1, 1)
	_fs(Color.WHITE)
	_fill(_ri(cx - r * 0.45), _ri(cy - r * 0.5), 2, 1)
	for k in 2:
		var f := fmod(t * 1.5 + k * 0.5, 1.0)
		_drop(cx + (k - 0.5) * r * 0.6, cy + r + f * 12.0, R, a * (1.0 - f))
	_ga(1.0)


## A lump of amber sealing it, foot at (cx, cy): its faces each a tone, lit on the left, its edge dark, glints, and cracks spreading
## through it as `u` runs.
func _amber(cx: float, cy: float, R: PackedColorArray, a: float, u: float, sd: int) -> void:
	var ix := _ri(cx)
	var foot := _ri(cy)
	var H := 32
	_ga(a * 0.85)
	for row in H:
		var v := float(row) / H
		var half := 8.0 + 5.0 * sin(v * PI) + (_rh(sd, row / 4) - 0.5) * 3.0
		var x0 := _ri(cx - half)
		var w := _ri(half * 2.0)
		var y := foot - H + row
		# (three faces: the left lit, the middle, the right in shadow)
		var c1 := _ri(w * 0.3)
		var c2 := _ri(w * 0.7)
		_fs(R[4])
		_fill(x0, y, c1, 1)
		_fs(R[3])
		_fill(x0 + c1, y, c2 - c1, 1)
		_fs(R[2])
		_fill(x0 + c2, y, w - c2, 1)
		_fs(R[1])
		_fill(x0 + w - 1, y, 1, 1)
		if row == 0 or row == H - 1:
			_fs(R[1])
			_fill(x0, y, w, 1)
	_ga(a)
	_fs(R[5])
	_fill(ix - 7, foot - 26, 1, 6)
	_fill(ix - 6, foot - 27, 2, 1)
	# (the cracks)
	_fs(Color.WHITE)
	var n := int(u * 6.0)
	for k in n:
		var x0 := cx + (_rh(sd, k + 20) - 0.5) * 12.0
		var y0 := float(foot) - 6.0 - _rh(sd, k + 30) * 20.0
		_line(x0, y0, x0 + (_rh(sd, k + 40) - 0.5) * 10.0, y0 - 4.0 - _rh(sd, k + 50) * 6.0, 1)
	_glow(cx, float(foot) - 16.0, 20.0, R[4], 0.45 * a)
	_ga(1.0)


## A target's face at (cx, cy), `r` across: its bands painted in turn, cross-hairs closing on its heart, its light.
func _target(cx: float, cy: float, r: float, R: PackedColorArray, a: float, u: float) -> void:
	var ir := _ri(r)
	_ga(a)
	for dy in range(-_ri(r * 0.5), _ri(r * 0.5) + 1):
		var hw := _ri(r * sqrt(maxf(0.0, 1.0 - pow(dy / (r * 0.5), 2.0))))
		for dx in range(-hw, hw + 1):
			var d := sqrt(float(dx * dx) + float(dy * dy) * 4.0) / r
			var band := int(d * 4.0)
			_fs(R[5] if band == 0 else (R[1] if band % 2 == 1 else R[3]))
			_fill(_ri(cx) + dx, _ri(cy) + dy, 1, 1)
	var c := 6.0 + 8.0 * (1.0 - minf(1.0, u * 2.5))
	_fs(R[4])
	for q in 4:
		var ang := q * PI * 0.5
		_line(cx + cos(ang) * (r + c), cy + sin(ang) * (r + c) * 0.5, cx + cos(ang) * (r + c - 6.0), cy + sin(ang) * (r + c - 6.0) * 0.5, 2)
	_glow(cx, cy, r * 1.4, R[4], 0.45 * a)
	_ga(1.0)
