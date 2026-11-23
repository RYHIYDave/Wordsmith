## THE LAST FLOOR 1–10 MELDS AS THE FIGHT SHOWS THEM (his doc Last Floor 1–10 Meld Animations, “Good”, 23 Nov 2026), painted beat by
## beat as the game's own melds are (fx_melds8.gd) and the 52 before them (fx_m52p_*.gd), with the same brushes (fx_m52kit.gd). The
## rules tell the moments (melds46_rules.gd, foe_melds46.gd); what each of a meld's two runes shows already stays as it is, and a
## monster carrying one smoulders in its colour (fx_melds52.gd). Each meld's colour is its stone's (melds52.json `color`).
## What goes on while it holds is painted every frame (paint_*_more): the Guarding melds' shells, round him and round a monster;
## Onrush's band, Quicksilver's crackle and Charge's dust while his burst lasts; the grounds these leave (Glide's ice, the
## Heavy melds' cracks, Firewalk's footprints, the wards, the runes); Vendetta's tally and Detonator's charge on what they marked;
## Aftermath's smoke where it struck.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["onrush", "hornet", "glide", "firewalk", "quicksilver", "charge", "mire", "icebreaker", "anvil", "fulgurite",
	"lamprey", "cluster", "doubletap", "tempo", "redoubt", "reverb", "staccato", "ripple",
	"bloodbloom", "lancet", "feedingfrenzy", "carapace", "transfusion", "lifeline", "bloodtide",
	"detonator", "mayhem", "minefield", "timebomb", "hairtrigger", "blastwave",
	"rapier", "riposte", "vendetta", "ambush", "bullseye", "shieldwall", "fury", "spree", "rampage",
	"sanctuary", "parry", "aegis", "hourglass", "aftermath", "whipcrack"]
## (the Guarding melds and Carapace: a shell of their own)
const SHELLS := ["redoubt", "carapace", "minefield", "riposte", "shieldwall", "sanctuary", "parry", "aegis"]
const EARTH := [Color("#1c140c"), Color("#3e2c1c"), Color("#6a4e32"), Color("#a27a50"), Color("#d0aa7c"), Color("#f0dcb8")]
const STORM := [Color("#181a28"), Color("#262a40"), Color("#3a3e5a"), Color("#565c7e"), Color("#7c82a6")]
## (how long each moment shows, seconds)
const LONG := {
	"onrush:rush": 0.35, "onrush:hold": 0.5, "onrush:foe": 0.45, "hornet:barb": 1.0, "hornet:sting": 0.4, "hornet:foe": 0.8,
	"glide:skate": 0.5, "glide:ice": 0.6, "firewalk:bloom": 0.5, "firewalk:step": 0.2, "quicksilver:thread": 0.35, "quicksilver:pass": 0.3,
	"quicksilver:foe": 0.3, "charge:ram": 0.6, "charge:bump": 0.4, "charge:foe": 0.5, "mire:mud": 1.2, "mire:seep": 0.5, "mire:foe": 1.0,
	"icebreaker:shatter": 0.6, "icebreaker:glaze": 0.6, "icebreaker:foe": 0.6, "anvil:sparks": 0.45, "anvil:forge": 0.5, "anvil:foe": 0.6,
	"fulgurite:stun": 0.5, "fulgurite:bolt": 0.3, "fulgurite:foe": 3.0,
	"lamprey:drink": 0.6, "lamprey:echo": 0.5, "lamprey:foe": 0.6, "cluster:bomblets": 0.42, "cluster:pop": 0.4, "cluster:second": 0.5,
	"cluster:foe": 0.6, "doubletap:tap": 0.4, "doubletap:marks": 0.6, "doubletap:foe": 0.5, "tempo:beat": 0.5, "tempo:hold": 0.4,
	"tempo:foe": 0.4, "redoubt:second": 0.5, "redoubt:inner": 0.6, "redoubt:foe": 0.5, "reverb:ring": 0.8, "reverb:foe": 0.8,
	"staccato:tick": 0.25, "staccato:quick": 0.25, "staccato:foe": 0.25, "ripple:ripple": 0.6, "ripple:wide": 0.7, "ripple:foe": 0.5,
	"bloodbloom:bloom": 0.7, "bloodbloom:orb": 0.4, "bloodbloom:foe": 0.7, "lancet:cut": 0.6, "lancet:markcut": 0.6, "lancet:mark": 0.5,
	"lancet:foe": 0.6, "feedingfrenzy:jaws": 0.5, "feedingfrenzy:orb": 0.4, "feedingfrenzy:foe": 0.6, "carapace:plate": 0.6,
	"carapace:motes": 0.5, "carapace:foe": 0.5, "transfusion:drip": 1.2, "transfusion:orb": 1.2, "transfusion:foe": 1.0,
	"lifeline:beat": 0.6, "lifeline:pull": 0.4, "lifeline:foe": 0.6, "bloodtide:tide": 0.6, "bloodtide:splash": 0.5, "bloodtide:foe": 0.7,
	"detonator:charge": 0.8, "detonator:burst": 0.45, "detonator:boom": 0.6, "detonator:mark": 0.4, "detonator:foe": 0.8,
	"mayhem:spark": 0.45, "mayhem:burst": 0.45, "minefield:mine": 0.45, "minefield:ward": 0.5, "timebomb:tick": 1.0,
	"timebomb:boom": 0.6, "timebomb:wait": 0.6, "hairtrigger:trigger": 0.4, "hairtrigger:touch": 0.4, "hairtrigger:set": 0.5,
	"hairtrigger:foe": 0.4, "blastwave:wave": 0.55, "blastwave:wide": 0.6, "blastwave:foe": 0.55,
	"rapier:flick": 0.25, "rapier:two": 0.4, "rapier:mark": 0.4, "rapier:foe": 0.3, "riposte:riposte": 0.5, "riposte:ward": 0.4,
	"riposte:mark": 0.4, "riposte:foe": 0.5, "vendetta:tally": 1.0, "vendetta:third": 0.4, "vendetta:mark": 0.6, "vendetta:foe": 0.8,
	"ambush:glint": 0.4, "ambush:snap": 0.4, "ambush:mark": 1.2, "ambush:foe": 0.4, "bullseye:ring": 0.45, "bullseye:marks": 0.6,
	"bullseye:mark": 0.4, "bullseye:foe": 0.45, "doubletap:mark": 0.4,
	"shieldwall:band": 0.6, "shieldwall:pulse": 0.5, "shieldwall:ward": 0.5, "shieldwall:foe": 0.5, "fury:ember": 0.6, "fury:hold": 0.5,
	"spree:burst": 0.4, "spree:two": 0.4, "rampage:swell": 0.5, "rampage:foe": 0.5,
	"sanctuary:hold": 0.6, "sanctuary:ward": 0.6, "sanctuary:foe": 0.6, "parry:flash": 0.35, "parry:glance": 0.35, "parry:ward": 0.5,
	"parry:foe": 0.4, "aegis:dome": 0.6, "aegis:wide": 0.6, "aegis:foe": 0.6, "hourglass:turn": 0.9, "hourglass:sand": 0.6,
	"hourglass:foe": 0.9, "aftermath:smoke": 0.4, "aftermath:bite": 0.35, "aftermath:linger": 0.3, "aftermath:foe": 0.4,
	"whipcrack:crack": 0.3, "whipcrack:snap": 0.3, "whipcrack:foe": 0.3, "carapace:ward": 0.4, "riposte:wardlaid": 0.4,
	"minefield:wardlaid": 0.4,
}


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var key := "%s:%s" % [b["id"], b["what"]]
	if not LONG.has(key):
		return false
	b["end"] = float(e.get("secs", LONG[key])) if key in ["detonator:charge", "timebomb:tick", "fulgurite:foe", "detonator:foe"] else float(LONG[key])
	var R := ramp(b["id"])
	var mid := _mid(b["m"])
	match key:
		"hornet:sting", "bloodbloom:orb", "feedingfrenzy:orb":
			for i in 6:
				_bit(b["x"], b["y"], mid, "dot", PackedColorArray([R[3], R[4], R[5]]), 1.2, 0.4, 40, 10, 40)
		"glide:skate":
			var hh := _hero_at(b)
			for i in 8:
				_bit(hh.x, hh.y, 2, "dot", PackedColorArray([ICE[3], ICE[4], ICE[5]]), 1.6, 0.4, 60, 6, 24)
		"firewalk:bloom":
			for i in 16:
				_bit(b["x"], b["y"], 8, "streak", PackedColorArray([R[3], R[4], R[5], Color.WHITE]), 3.2, 0.45, 80, 20, 70)
		"charge:ram", "charge:bump", "charge:foe":
			for i in (10 if key == "charge:ram" else 6):
				_bit(b["x"], b["y"], 2, "puff", PackedColorArray(DUST), 1.4, 0.6, 0, 4, 12)
			if key == "charge:ram":
				fx.kick(2.0)
		"mire:mud", "mire:seep", "mire:foe":
			for i in 8:
				_bit(b["x"], b["y"], 2, "bubble", PackedColorArray([R[4], R[5], R[3]]), 0.5, 0.8, -10, 6, 18)
		"icebreaker:shatter":
			fx.kick(2.0)
			for i in 18:
				_bit(b["x"], b["y"], mid, "streak", PackedColorArray([ICE[3], ICE[4], ICE[5], Color.WHITE]), 3.4, 0.5, 160, 20, 90)
		"anvil:sparks", "anvil:foe":
			var dx: float = b["dx"]
			var dy: float = b["dy"]
			for i in 16:
				var a := atan2(dy, dx) + (randf() - 0.5) * 1.6 if absf(dx) + absf(dy) > 0.01 else randf() * TAU
				var s := 2.0 + randf() * 3.0
				bits.append({"x": b["x"], "y": b["y"], "z": mid, "vx": cos(a) * s, "vy": sin(a) * s, "vz": 30.0 + randf() * 70.0, "fall": 180.0,
					"t": 0.0, "life": 0.35 + randf() * 0.25, "ramp": PackedColorArray([FIRE[3], FIRE[4], FIRE[5], Color.WHITE]), "kind": "streak", "size": 1.0})
		"anvil:forge":
			for i in 6:
				_bit(b["x"], b["y"], 4, "dot", PackedColorArray([FIRE[3], FIRE[4], FIRE[5]]), 0.4, 0.6, -20, 10, 30)
		"whipcrack:crack", "whipcrack:snap", "whipcrack:foe":
			fx.kick(2.0)
		"cluster:pop", "detonator:burst", "detonator:boom", "mayhem:burst", "minefield:mine", "timebomb:boom", "hairtrigger:trigger", "blastwave:wave":
			fx.kick(3.0 if key in ["detonator:boom", "timebomb:boom", "blastwave:wave"] else 1.5)
			for spot in _spots(b, e):
				for i in 10:
					_bit(spot.x, spot.y, 6, "streak", PackedColorArray([R[3], R[4], R[5], Color.WHITE]), 3.0, 0.4, 120, 20, 80)
				for i in 4:
					_bit(spot.x, spot.y, 3, "puff", PackedColorArray(DUST), 1.0, 0.6, 0, 6, 14)
		"bloodbloom:bloom":
			for i in 12:
				_bit(b["x"], b["y"], mid, "dot", PackedColorArray([R[2], R[3], R[4], R[5]]), 2.2, 0.5, 40, 10, 40)
		"transfusion:drip", "transfusion:orb", "transfusion:foe":
			b["drip"] = 0.0
		"spree:burst", "spree:two", "mayhem:spark", "rapier:two":
			var hh := _hero_at(b)
			for i in 8:
				_bit(hh.x, hh.y, 14, "streak", PackedColorArray([R[3], R[4], R[5], Color.WHITE]), 2.0, 0.35, 60, 30, 70)
		"fury:ember":
			var hh := _hero_at(b)
			for i in 5:
				_bit(hh.x, hh.y, 16, "dot", PackedColorArray([R[1], R[2], R[3], R[4]]), 0.6, 0.6, -30, 10, 20)
		"hourglass:sand":
			for i in 10:
				_bit(b["x"], b["y"], 6, "dot", PackedColorArray([R[3], R[4], R[5]]), 1.0, 0.6, 30, 5, 15)
	return true


## Where a moment's blasts go off: its `to` (Cluster's bomblets), or its own place.
func _spots(b: Dictionary, e: Dictionary) -> Array:
	var to = e.get("to", [])
	if to is Array and not (to as Array).is_empty():
		return to
	return [Vector2(b["x"], b["y"])]


func tick(b: Dictionary, dt: float) -> void:
	match "%s:%s" % [b["id"], b["what"]]:
		"transfusion:drip", "transfusion:orb", "transfusion:foe":
			# (the drip: a mote at a time running along to him, for a second)
			b["drip"] = float(b["drip"]) - dt
			if float(b["drip"]) <= 0.0 and float(b["t"]) < 0.9:
				b["drip"] = 0.12
				var R := ramp("transfusion")
				var to := _hero_at(b) if b["what"] != "foe" else Vector2(b["x1"], b["y1"])
				var from := Vector2(b["x"], b["y"]) if b["what"] != "foe" else _hero_at(b)
				var d: Vector2 = to - from
				var l: float = maxf(0.3, d.length())
				bits.append({"x": from.x, "y": from.y, "z": 12.0, "vx": d.x / l * l / 0.6, "vy": d.y / l * l / 0.6, "vz": 4.0, "fall": 0.0,
					"t": 0.0, "life": 0.6, "ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "dot", "size": 3.0})


func paint_floor(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade: float = 1.0 - u
	var key := "%s:%s" % [b["id"], b["what"]]
	match key:
		"charge:ram", "charge:foe", "charge:bump":
			# (a brass shock ring rolling out)
			var rr: float = (1.4 if key != "charge:bump" else 0.7) * _ease(u)
			_ga(0.9 * fade)
			_fs(R[1])
			_ring(b["x"], b["y"], rr + 0.04)
			_fs(R[4])
			_ring(b["x"], b["y"], rr)
		"mire:mud", "mire:foe":
			# (a bubbling olive mud on the floor where it stands)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var s := 18.0 * _ease(bt / 0.25)
			_ga(0.85 * fade)
			_fs(R[0])
			_fill(_ri(cx - s), _ri(cy - s * 0.4), _ri(s * 2.0), _ri(s * 0.8))
			_fs(R[1])
			_fill(_ri(cx - s * 0.85), _ri(cy - s * 0.32), _ri(s * 1.7), _ri(s * 0.64))
			_fs(R[2])
			_fill(_ri(cx - s * 0.6), _ri(cy - s * 0.25), _ri(s * 1.2), _ri(s * 0.4))
			for i in 4:
				var a := _rh(sd, i) * TAU
				var x := cx + cos(a) * s * 0.6
				var y := cy + sin(a) * s * 0.25
				var pop := fmod(bt * 2.5 + _rh(sd, i + 9), 1.0)
				_ga(fade * (1.0 - pop))
				_fs(R[4])
				_fill(_ri(x) - 1, _ri(y) - 1 - _ri(pop * 2.0), 3, 2)
		"icebreaker:shatter":
			var rr: float = float(b["r"]) * _ease(u * 1.5)
			_ga(0.9 * fade)
			_fs(ICE[4])
			_ring(b["x"], b["y"], rr)
			_fs(R[3])
			_ring(b["x"], b["y"], rr * 0.8, 3)
		"icebreaker:foe":
			_ga(0.8 * fade)
			_fs(ICE[4])
			_ring(b["x"], b["y"], 0.5)
		"anvil:foe":
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			_glow(cx, cy, 16.0, FIRE[3], 0.6 * fade)
		"fulgurite:foe":
			# (the floor crackling with small bolts where its blow landed)
			if _rh(sd, int(t * 14.0)) < 0.5:
				var a := _rh(sd + 3, int(t * 14.0)) * TAU
				var cx := _wx(b["x"], b["y"])
				var cy := _wy(b["x"], b["y"])
				_bolt(cx, cy, cx + cos(a) * 14.0, cy + sin(a) * 6.0, R, sd + int(t * 14.0), 0.8, 1)
		"tempo:beat", "tempo:hold", "tempo:foe":
			var hh := _hero_at(b) if b["what"] != "foe" else Vector2(b["x"], b["y"])
			var rr := 0.3 + 1.4 * _ease(u)
			_ga(0.85 * fade)
			_fs(R[4])
			_ring(hh.x, hh.y, rr)
			_fs(R[2])
			_ring(hh.x, hh.y, rr * 0.92, 2)
		"redoubt:inner", "sanctuary:ward", "parry:ward", "aegis:wide", "minefield:ward", "riposte:ward", "shieldwall:ward", "carapace:ward", "shieldwall:pulse":
			var rr: float = float(b["r"]) * (0.4 + 0.6 * _ease(u))
			_ga(0.8 * fade)
			_fs(R[4])
			_ring(b["x"], b["y"], rr)
		"reverb:ring", "reverb:foe":
			# (the blow ringing out again and again: broken sound-waves going out, each fainter)
			for k in 3:
				var v := _c01((bt - k * 0.15) / 0.5)
				if v <= 0.0 or v >= 1.0:
					continue
				_front(b["x"], b["y"], 0.3 + 1.2 * v, [R[1], R[2], R[3], R[4] if k == 0 else R[3], R[5]], sd + k, 1.0 - v, "sound")
		"ripple:ripple", "ripple:wide", "ripple:foe", "rampage:swell", "rampage:foe", "blastwave:wave", "blastwave:wide", "blastwave:foe", "aegis:dome":
			# (a wave going out: Ripple's water, the others' blast kicking grit out along its front)
			var rr: float = float(b["r"]) * _ease(u)
			_front(b["x"], b["y"], rr, [R[1], R[2], R[3], R[4], R[5]], sd, 0.9 * fade, "water" if b["id"] == "ripple" else "shock")
		"bullseye:ring", "bullseye:foe":
			# (rings closing on the one at its heart)
			# (a target's sight closing on the one at its heart)
			var r0: float = float(b.get("r", 2.0))
			var rr := r0 * (1.0 - _ease(u)) + 0.35
			var C: Array = [R[0], R[2], R[3], R[4], R[5]] if b["what"] != "foe" else [Color("#3a0c1c"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
			_reticle(b["x"], b["y"], rr, C, 0.95 * fade)
		"aftermath:smoke", "aftermath:linger":
			# (smoke rolling out over the struck ground, in curls)
			var rr: float = float(b["r"]) * _ease(u * 1.5)
			for i in 7:
				var a := float(i) / 7.0 * TAU + _rh(sd, i) * 0.5
				_curl(_wx(b["x"], b["y"]) + cos(a) * rr * 22.6, _wy(b["x"], b["y"]) + sin(a) * rr * 11.3, 8.0 + 4.0 * _rh(sd, i + 3), [R[1], R[2], R[4]], sd + i, 0.75 * fade)
		"whipcrack:crack", "whipcrack:snap", "whipcrack:foe":
			# (the whole area snapping at once: a sand-coloured crack across it)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var rr: float = float(b.get("r", 1.5)) * 22.6
			var px := cx - rr
			var py := cy
			for i in 10:
				var v := float(i + 1) / 10.0
				var qx := cx - rr + rr * 2.0 * v
				var qy := cy + (_rh(sd, i) - 0.5) * 8.0
				_ga(fade)
				_fs(R[1])
				_line(px, py + 1.0, qx, qy + 1.0, 3)
				_fs(R[4])
				_line(px, py, qx, qy, 2)
				px = qx
				py = qy
			_ga(0.7 * fade)
			_fs(R[5])
			_ring(b["x"], b["y"], float(b.get("r", 1.5)))
		"hairtrigger:set", "timebomb:wait", "cluster:second":
			_ga(0.8 * fade)
			_fs(R[4])
			_ring(b["x"], b["y"], float(b["r"]) * (0.6 + 0.4 * u), 2, t * 3.0)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade: float = 1.0 - u
	var p := _mid_px(b)
	var key := "%s:%s" % [b["id"], b["what"]]
	match key:
		"onrush:rush", "onrush:foe":
			# (coral streaks of speed behind the blow, and a heavier flash)
			var d := Vector2(b["dx"], b["dy"])
			d = d.normalized() if d.length() > 0.01 else Vector2(1, 0)
			var sx := (d.x - d.y) * 16.0
			var sy := (d.x + d.y) * 8.0
			var l := maxf(1.0, Vector2(sx, sy).length())
			sx /= l
			sy /= l
			# (speed lines torn off the blow: each thick at the blow and thinning to a wisp, fanned and ragged, not a block)
			for k in 6:
				var off := (float(k) - 2.5) * (5.0 + 4.0 * u)
				var len := (26.0 + 16.0 * _rh(sd, k)) * (0.6 + 0.6 * u)
				var bx := p.x - sx * (4.0 + 3.0 * _rh(sd, k + 7)) - sy * off
				var by := p.y - sy * (4.0 + 3.0 * _rh(sd, k + 7)) + sx * off
				var segs := 6
				for j in segs:
					var v0 := float(j) / segs
					var v1 := float(j + 1) / segs
					if _rh(sd, k * 10 + j) < 0.15:
						continue
					var x0 := bx - sx * len * v0 - sy * off * v0 * 0.4
					var y0 := by - sy * len * v0 + sx * off * v0 * 0.4
					var x1 := bx - sx * len * v1 - sy * off * v1 * 0.4
					var y1 := by - sy * len * v1 + sx * off * v1 * 0.4
					var w := maxi(1, 3 - j / 2)
					_ga(fade * (1.0 - v0 * 0.7))
					_fs(R[3] if j > 2 else (R[4] if k % 2 else R[5]))
					_line(x0, y0, x1, y1, w)
			_glow(p.x, p.y, 24.0, R[4], fade)
			_glow(p.x, p.y, 10.0, Color.WHITE, 0.7 * fade)
		"hornet:barb", "hornet:foe":
			# (barbs standing in it, dripping venom)
			var n := int(b["n"]) if b["what"] != "foe" else 2
			var q := p if b["what"] != "foe" else Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0)
			for k in maxi(1, n):
				var a := -1.2 + float(k) * 0.9 + (_rh(sd, k) - 0.5) * 0.4
				var bx := q.x + cos(a) * 6.0
				var by := q.y + sin(a) * 4.0
				var tx := bx + cos(a - 0.6) * 12.0
				var ty := by - 11.0
				_ga(minf(1.0, fade * 1.5))
				_fs(R[0])
				_line(bx, by + 1.0, tx, ty + 1.0, 4)
				_fs(R[4])
				_line(bx, by, tx, ty, 2)
				_fs(ramp("hornet")[5])
				_fill(_ri(tx) - 1, _ri(ty) - 1, 3, 3)
				var drip := fmod(bt * 2.0 + _rh(sd, k + 5), 1.0)
				_fs(Color("#b4cc24"))
				_fill(_ri(bx), _ri(by + drip * 6.0), 1, 2)
			_glow(q.x, q.y, 12.0, R[3], 0.4 * fade)
		"glide:skate":
			var hh := _hero_at(b)
			_wisps(b["x"], b["y"], hh.x, hh.y, _ease(u * 1.6), 2, PackedColorArray([ICE[0], ICE[2], ICE[3], ICE[4], ICE[5], Color.WHITE]), sd, 1, 4.0, 2.0)
		"firewalk:bloom":
			_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 8.0, 26.0 * _ease(u * 2.0), R[4], fade)
		"quicksilver:thread":
			var hh := _hero_at(b)
			_bolt(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 12.0, _wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, R, sd, fade, 2)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, 26.0, R[5], 0.9 * fade)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, 10.0, Color.WHITE, 0.6 * fade)
		"quicksilver:pass", "quicksilver:foe":
			var hh := _hero_at(b)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, 18.0, R[4], 0.6 * fade)
		"charge:ram", "fulgurite:stun":
			# (stars over what it stunned)
			var top := _mid(b["m"]) * 2.0 + 4.0
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - top
			for k in 4:
				var a := bt * 14.0 + float(k) * TAU / 4.0
				var x := cx + cos(a) * 8.0
				var y := cy + sin(a) * 3.0
				_ga(fade)
				_fs(R[5])
				_fill(_ri(x) - 1, _ri(y), 3, 1)
				_fill(_ri(x), _ri(y) - 1, 1, 3)
			if key == "fulgurite:stun":
				_bolt(cx, cy + top - 30.0, cx, cy + top, R, sd, fade, 1)
			_glow(p.x, p.y, 18.0, R[4], 0.6 * fade)
		"icebreaker:shatter", "icebreaker:glaze", "icebreaker:foe":
			# (a steel-blue split down it, or frost crusting it)
			var top := _mid(b["m"]) * 2.0 if b["m"] != null else 26.0
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			if key == "icebreaker:shatter":
				var px := cx - 2.0
				var py := cy - top
				for i in 6:
					var qx := cx + (_rh(sd, i) - 0.5) * 8.0
					var qy := cy - top + top * float(i + 1) / 6.0
					_ga(fade)
					_fs(ICE[5])
					_line(px, py, qx, qy, 2)
					_fs(R[3])
					_line(px + 1.0, py, qx + 1.0, qy, 1)
					px = qx
					py = qy
				_glow(cx, cy - top * 0.5, 30.0, ICE[4], fade)
			else:
				for i in 7:
					var x := cx - 8.0 + 16.0 * float(i) / 6.0
					var hh := 4.0 + 7.0 * _rh(sd, i)
					_ga(0.9 * fade)
					_fs(ICE[2])
					_fill(_ri(x) - 1, _ri(cy - hh), 3, _ri(hh))
					_fs(ICE[5])
					_fill(_ri(x), _ri(cy - hh), 1, 2)
				_glow(cx, cy - 6.0, 16.0, ICE[4], 0.5 * fade)
		"anvil:sparks":
			_glow(p.x, p.y, 22.0, FIRE[4], fade)
			_glow(p.x, p.y, 9.0, Color.WHITE, 0.6 * fade)
		"anvil:forge":
			_flames(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]), 3, 12.0, 12.0, fade, PackedColorArray([FIRE[1], FIRE[2], FIRE[3], FIRE[4], FIRE[5]]), sd)
		"lamprey:drink", "lamprey:echo", "lancet:cut", "lancet:markcut", "feedingfrenzy:jaws", "bloodbloom:bloom", "bloodtide:tide", "bloodtide:splash", "lifeline:beat":
			# (life drawn back to him: wisps in its colour, thicker for what draws deeper)
			var thick := 2
			var n := 3
			if key == "lamprey:drink" and int(b["n"]) >= 1:
				thick = 3
				n = 4
			if key == "feedingfrenzy:jaws":
				thick = 1 + mini(2, int(b["n"]) / 2)
				n = 2 + mini(3, int(b["n"]))
			if key == "lancet:cut" or key == "lancet:markcut":
				n = 3
			if key == "bloodtide:tide":
				n = 6
			if key != "lifeline:beat":
				_wisps(b["x"], b["y"], b["x1"], b["y1"], _ease(u * 1.4), n, R, sd, thick)
			if key == "lamprey:drink" and int(b["n"]) >= 1:
				# (a ring of teeth flashing where it bites)
				for k in 10:
					var a := float(k) / 10.0 * TAU
					_ga(1.0 - _c01(bt / 0.25))
					_fs(R[5])
					_fill(_ri(p.x + cos(a) * 7.0), _ri(p.y + sin(a) * 4.0), 2, 2)
			if key == "lancet:cut" or key == "lancet:markcut":
				_ga(1.0 - _c01(bt / 0.3))
				_fs(R[5])
				_line(p.x - 9.0, p.y - 6.0, p.x + 9.0, p.y + 6.0, 2)
				_fs(Color.WHITE)
				_line(p.x - 7.0, p.y - 5.0, p.x + 7.0, p.y + 5.0, 1)
			if key == "feedingfrenzy:jaws" and int(b["n"]) >= 5:
				var close := _ease(_c01(bt / 0.2))
				for k in 2:
					var sgn := -1.0 if k == 0 else 1.0
					var y0 := p.y + sgn * (12.0 - 9.0 * close)
					_ga(fade)
					_fs(R[1])
					_fill(_ri(p.x - 10.0), _ri(y0) - 1, 21, 3)
					_fs(R[4])
					for j in 5:
						_fill(_ri(p.x - 9.0 + j * 4.0), _ri(y0) + (1 if k == 0 else -3), 2, 3)
			if key == "bloodbloom:bloom":
				for k in 8:
					var a := float(k) / 8.0 * TAU + bt
					var rr := 6.0 + 12.0 * _ease(u * 1.5)
					_ga(fade)
					_fs(R[3] if k % 2 else R[4])
					_fill(_ri(p.x + cos(a) * rr) - 1, _ri(p.y + sin(a) * rr * 0.6) - 1, 3, 3)
				_glow(p.x, p.y, 20.0, R[4], fade)
			if key == "lifeline:beat":
				# (a pink heartbeat line pulsing across him)
				var hh := _hero_at(b)
				var cx := _wx(hh.x, hh.y)
				var cy := _wy(hh.x, hh.y) - 34.0
				var pts := [Vector2(-12, 0), Vector2(-5, 0), Vector2(-3, -6), Vector2(0, 5), Vector2(2, -3), Vector2(4, 0), Vector2(12, 0)]
				for k in range(1, pts.size()):
					var a2: Vector2 = pts[k - 1]
					var b2: Vector2 = pts[k]
					_ga(fade)
					_fs(R[1])
					_line(cx + a2.x, cy + a2.y + 1.0, cx + b2.x, cy + b2.y + 1.0, 3)
					_fs(R[4])
					_line(cx + a2.x, cy + a2.y, cx + b2.x, cy + b2.y, 1)
				_glow(cx, cy, 16.0, R[4], 0.6 * fade)
		"lamprey:foe", "lancet:foe", "feedingfrenzy:foe", "transfusion:foe":
			var hh := _hero_at(b)
			_wisps(hh.x, hh.y, b["x1"], b["y1"], _ease(u * 1.4), 2, R, sd, 2 if b["id"] == "lamprey" else 1)
		"lifeline:foe", "bloodbloom:foe", "bloodtide:foe":
			_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0, 22.0, R[4], 0.7 * fade)
		"cluster:bomblets":
			# (two small bomblets arcing out to where they land)
			for s in b["e"].get("to", []):
				var x0 := _wx(b["x"], b["y"])
				var y0 := _wy(b["x"], b["y"]) - 10.0
				var x1 := _wx(s.x, s.y)
				var y1 := _wy(s.x, s.y)
				var x := lerpf(x0, x1, u)
				var y := lerpf(y0, y1, u) - sin(u * PI) * 22.0
				_ga(1.0)
				_fs(R[1])
				_fill(_ri(x) - 2, _ri(y) - 2, 5, 5)
				_fs(R[4])
				_fill(_ri(x) - 1, _ri(y) - 2, 3, 3)
				_fs(FIRE[5])
				_fill(_ri(x) + 1, _ri(y) - 4, 1, 2)
		"cluster:pop", "cluster:foe", "detonator:burst", "detonator:boom", "mayhem:burst", "minefield:mine", "timebomb:boom", "hairtrigger:trigger", "hairtrigger:touch", "hairtrigger:foe":
			for s in _spots(b, b["e"]):
				var big := 1.6 if key in ["detonator:boom", "timebomb:boom"] else 1.0
				_glow(_wx(s.x, s.y), _wy(s.x, s.y) - 6.0, 30.0 * big * _ease(u * 2.0), R[4], fade)
				_glow(_wx(s.x, s.y), _wy(s.x, s.y) - 6.0, 12.0 * big, Color.WHITE, 0.8 * fade)
		"doubletap:tap", "doubletap:foe", "riposte:riposte", "riposte:foe":
			var q := p if b["what"] != "foe" else Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0)
			var col: PackedColorArray = R if b["what"] != "foe" else PackedColorArray([Color("#3a1020"), Color("#7a2040"), Color("#c04070"), Color("#ff8aa8"), Color("#ffd27a"), Color.WHITE])
			_sight(q.x, q.y, _ease(u * 2.0), col, fade)
			if key == "doubletap:tap":
				# (two hard glints, one after the other: four-pointed stars of light where both blows found the gap)
				_glow(q.x, q.y, 26.0, R[4], fade)
				for k in 2:
					var x := q.x - 5.0 + k * 10.0
					var y := q.y - 2.0 + k * 4.0
					var rr := (7.0 if k == 0 else 9.0) * (0.6 + 0.4 * fade)
					_ga(fade)
					_fs(R[0])
					_line(x - rr, y, x + rr, y, 3)
					_line(x, y - rr, x, y + rr, 3)
					_fs(R[5])
					_line(x - rr, y, x + rr, y, 1)
					_line(x, y - rr, x, y + rr, 1)
					_fs(Color.WHITE)
					_fill(_ri(x) - 1, _ri(y) - 1, 3, 3)
		"doubletap:marks", "bullseye:marks", "doubletap:mark", "bullseye:mark", "rapier:mark", "riposte:mark", "lancet:mark", "detonator:mark":
			_sight(p.x, p.y, _ease(u * 2.0), R, fade)
		"tempo:beat":
			var hh := _hero_at(b)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, 14.0, R[4], 0.5 * fade)
		"redoubt:second", "redoubt:foe", "carapace:plate", "carapace:foe", "sanctuary:hold", "sanctuary:foe", "parry:flash", "parry:foe", "shieldwall:band", "shieldwall:foe":
			# (a shell flashing in as it forms)
			var who = b["m"]
			var cx: float = _wx(b["x"], b["y"])
			var cy: float = _wy(b["x"], b["y"]) - (_mid(who) if who != null else 17.0)
			var rx: float = (_half(who) + 4.0) if who != null else 17.0
			var ry: float = (_mid(who) + 3.0) if who != null else 23.0
			var k := 0.8 if b["id"] == "redoubt" and b["what"] == "second" else 1.0
			_glow(cx, cy, rx * 1.4, R[4], 0.6 * fade)
			_shell(b["id"], cx, cy, rx * k, ry * k, sd, fade, int(b.get("n", 1)))
		"parry:glance":
			var hh := _hero_at(b)
			var cx := _wx(hh.x, hh.y)
			var cy := _wy(hh.x, hh.y) - 17.0
			_glow(cx, cy, 30.0, R[5], fade)
			_glow(cx, cy, 14.0, Color.WHITE, fade)
			_ga(fade)
			_fs(R[5])
			_ring(hh.x, hh.y, 0.3 + 0.7 * _ease(u), 0, 0.0, 17.0)
		"aegis:dome", "aegis:foe":
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var rx: float = float(b.get("r", 3.0)) * 22.6 * 0.5
			for k in 24:
				var a := PI + float(k) / 23.0 * PI
				_ga(0.8 * fade)
				_fs(R[4] if k % 2 else R[5])
				_fill(_ri(cx + cos(a) * rx), _ri(cy + sin(a) * rx * 0.9 - 6.0), 2, 2)
			_glow(cx, cy - rx * 0.5, rx, R[4], 0.4 * fade)
		"reverb:ring":
			_glow(p.x, p.y, 24.0, R[4], 0.9 * fade)
			for k in 3:
				var rr := 6.0 + 14.0 * _ease(_c01((bt - k * 0.12) / 0.5))
				_ga((1.0 - _c01((bt - k * 0.12) / 0.5)) * 0.9)
				_fs(R[5])
				for j in 16:
					var a := float(j) / 16.0 * TAU
					_fill(_ri(p.x + cos(a) * rr), _ri(p.y + sin(a) * rr * 0.6), 2, 2)
		"staccato:tick", "staccato:quick", "staccato:foe":
			# (two sharp ticks side by side, where the blow lands: never on him, his Art Rulebook's Animations 4)
			var q := p
			var hh = fx.hero()
			if hh != null and b["what"] != "foe":
				var hp := Vector2(_wx(hh.world.x, hh.world.y), _wy(hh.world.x, hh.world.y) - 16.0)
				if q.distance_to(hp) < 22.0:
					var f: Vector2 = hh.face
					q = hp + Vector2((f.x - f.y) * 16.0, (f.x + f.y) * 8.0).normalized() * 30.0
			for k in 2:
				var x := q.x - 7.0 + k * 14.0
				_ga(fade)
				_fs(R[1])
				_line(x - 5.0, q.y + 10.0, x + 5.0, q.y - 10.0, 5)
				_fs(R[4])
				_line(x - 5.0, q.y + 10.0, x + 5.0, q.y - 10.0, 3)
				_fs(Color.WHITE)
				_line(x - 4.0, q.y + 8.0, x + 4.0, q.y - 8.0, 1)
			_glow(q.x, q.y, 24.0, R[4], fade)
		"detonator:charge", "detonator:foe":
			# (a small charge stuck on it, blinking faster and faster)
			var q := p if b["what"] != "foe" else Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0)
			var rate: float = 3.0 + 14.0 * u
			var on: bool = fmod(bt * rate, 1.0) < 0.5
			_charge(q.x, q.y, R, on)
		"mayhem:spark":
			var hh := _hero_at(b)
			var v := _ease(u * 1.5)
			var x := lerpf(_wx(b["x"], b["y"]), _wx(hh.x, hh.y), v)
			var y := lerpf(_wy(b["x"], b["y"]) - 10.0, _wy(hh.x, hh.y) - 16.0, v) - sin(v * PI) * 16.0
			_ga(fade)
			_fs(R[5])
			_fill(_ri(x) - 1, _ri(y) - 1, 3, 3)
			_glow(x, y, 12.0, R[4], fade)
		"timebomb:tick":
			# (a plum bomb with a clock face, its hand going round once)
			# (a round iron bomb, a clock face set in it, its hand going round once; its fuse burning down, spitting sparks)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - 12.0
			_glow(cx, cy, 14.0 + 12.0 * u, R[4], 0.35 + 0.55 * u)
			_disc(cx, cy, 8.0, [R[0], R[1], R[2], R[3], R[5]])
			_fs(R[0])
			_fill(_ri(cx) - 3, _ri(cy) - 9, 5, 2)
			_disc(cx + 0.5, cy + 0.5, 4.0, [R[2], R[4], R[5], R[5], Color.WHITE])
			var a := -PI * 0.5 + u * TAU
			_ga(1.0)
			_fs(R[0])
			_line(cx, cy, cx + cos(a) * 3.0, cy + sin(a) * 3.0, 1)
			var fl := 7.0 * (1.0 - u) + 1.0
			_fs(DUST[2])
			_line(cx + 1.0, cy - 9.0, cx + 1.0 + fl * 0.5, cy - 9.0 - fl, 1)
			var fx0 := cx + 1.0 + fl * 0.5
			var fy0 := cy - 9.0 - fl
			_glow(fx0, fy0, 7.0, FIRE[4], 0.9)
			_fs(FIRE[5])
			_fill(_ri(fx0) - 1, _ri(fy0) - 1, 2, 2)
			for k in 3:
				var sa := _rh(sd, int(bt * 20.0) + k) * TAU
				var sr := 2.0 + 4.0 * _rh(sd, int(bt * 20.0) + k + 5)
				_fs(FIRE[4] if k else FIRE[5])
				_fill(_ri(fx0 + cos(sa) * sr), _ri(fy0 + sin(sa) * sr), 1, 1)
		"rapier:flick", "rapier:foe":
			var d := Vector2(b["dx"], b["dy"])
			d = d.normalized() if d.length() > 0.01 else Vector2(1, 0)
			var sx := (d.x - d.y) * 16.0
			var sy := (d.x + d.y) * 8.0
			var l := maxf(1.0, Vector2(sx, sy).length())
			# (a fencer's flurry of thrusts: a long bright needle of a line for each, after-images trailing, a gleam at the point)
			var n := clampi(int(b.get("n", 1)) + 1, 2, 5)
			for k in n:
				var spread := (float(k) - (n - 1) * 0.5) * 0.18
				var dx := sx / l * cos(spread) - sy / l * sin(spread)
				var dy := sx / l * sin(spread) + sy / l * cos(spread)
				var reach := 34.0 + 8.0 * _rh(sd, k)
				var tipx := p.x + dx * 10.0
				var tipy := p.y + dy * 10.0
				var kt := _c01(u * 2.0 - k * 0.15)
				_ga(fade * (1.0 - kt * 0.5))
				_fs(R[2])
				_line(tipx - dx * reach, tipy - dy * reach + 1.0, tipx, tipy + 1.0, 2)
				_fs(R[5] if k % 2 else Color.WHITE)
				_line(tipx - dx * reach, tipy - dy * reach, tipx, tipy, 1)
				_fs(Color.WHITE)
				_line(tipx - 3.0, tipy, tipx + 3.0, tipy, 1)
				_line(tipx, tipy - 3.0, tipx, tipy + 3.0, 1)
			_glow(p.x, p.y, 22.0, R[4], 0.8 * fade)
			if bool(b["e"].get("crit", false)):
				for k in 4:
					var a := float(k) * PI * 0.5 + PI * 0.25
					_line(p.x, p.y, p.x + cos(a) * 6.0 * (1.0 - u), p.y + sin(a) * 6.0 * (1.0 - u), 1)
				_glow(p.x, p.y, 14.0, Color.WHITE, fade)
		"vendetta:tally", "vendetta:third", "vendetta:foe":
			var q := p if b["what"] != "foe" else Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0)
			_tally(q.x, q.y - 18.0, int(b.get("n", 3)), R, fade, b["what"] == "third")
		"ambush:glint", "ambush:snap", "ambush:foe":
			var q := p if b["what"] != "foe" else Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0)
			_glow(q.x, q.y, 22.0 * (2.0 if b["what"] == "snap" else 1.0), R[4], fade)
			_glow(q.x, q.y, 10.0, Color.WHITE, fade)
			_ga(fade)
			_fs(R[5])
			_line(q.x - 8.0, q.y, q.x + 8.0, q.y, 1)
			_line(q.x, q.y - 8.0, q.x, q.y + 8.0, 1)
		"ambush:mark":
			_sight(p.x, p.y, u, R, 1.0 - _c01((bt - float(b["end"]) + 0.2) / 0.2))
		"bullseye:ring":
			_glow(p.x, p.y, 16.0, R[4], fade)
		"fury:ember", "fury:hold":
			var hh := _hero_at(b)
			var hx := _wx(hh.x, hh.y)
			var hy := _wy(hh.x, hh.y)
			_glow(hx, hy - 16.0, 22.0, R[3], 0.8 * fade)
			if b["what"] == "ember":
				# (his frenzy's embers over his head, one fewer: the lost one drops, cooling)
				var n := clampi(int(b.get("n", 1)), 0, 5)
				for k in n + 1:
					var x := hx - float(n) * 3.5 + k * 7.0
					var y := hy - 36.0
					var lost := k == n
					if lost:
						y += 18.0 * _ease(u)
						x += 4.0 * u
					# (each a flame tongue; the lost one guttering down to a dull coal)
					if lost:
						_flames(x, y + 3.0, 1, 3.0, 5.0 * (1.0 - u), 1.0 - u, PackedColorArray([FIRE[1], FIRE[2], FIRE[3]]), sd + k)
					else:
						_flames(x, y + 3.0, 1, 4.0, 9.0, fade, PackedColorArray([FIRE[2], FIRE[3], FIRE[4], FIRE[5]]), sd + k + int(t * 8.0))
						_glow(x, y, 8.0, FIRE[4], 0.6 * fade)
		"spree:burst", "spree:two", "rapier:two":
			var hh := _hero_at(b)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 16.0, 16.0, R[4], 0.8 * fade)
		"hourglass:turn", "hourglass:foe":
			var q := p if b["what"] != "foe" else Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0)
			_hourglass(q.x, q.y - 22.0, u, R, fade, b["what"] == "foe")
		"aftermath:bite":
			_glow(p.x, p.y, 14.0, R[4], fade)
		"whipcrack:crack", "whipcrack:snap", "whipcrack:foe":
			# (a lash thrown from him across the whole area, its wave running out and snapping straight, and the crack at its tip:
			# a white star of a flash, sound-lines thrown off it)
			var hh := _hero_at(b)
			var sx := _wx(hh.x, hh.y)
			var sy := _wy(hh.x, hh.y) - 18.0
			var ex := _wx(b["x"], b["y"])
			var ey := _wy(b["x"], b["y"]) - 8.0
			var dx := ex - sx
			var dy := ey - sy
			var l := maxf(1.0, sqrt(dx * dx + dy * dy))
			var nx := -dy / l
			var ny := dx / l
			var snap := _ease(_c01(bt / 0.12))
			var px := sx
			var py := sy
			for i in 24:
				var v := float(i + 1) / 24.0
				var amp := (1.0 - snap) * 14.0 * sin(v * PI * 2.5 - bt * 40.0) * v
				var x := sx + dx * v * (0.6 + 0.4 * snap) + nx * amp
				var y := sy + dy * v * (0.6 + 0.4 * snap) + ny * amp
				_ga(fade)
				_fs(R[1])
				_line(px, py + 1.0, x, y + 1.0, 3 if v < 0.5 else 2)
				_fs(R[4] if v < 0.8 else R[5])
				_line(px, py, x, y, 2 if v < 0.5 else 1)
				px = x
				py = y
			if bt >= 0.1:
				var c := 1.0 - _c01((bt - 0.1) / 0.2)
				_glow(px, py, 30.0, R[5], c)
				_glow(px, py, 12.0, Color.WHITE, c)
				for k in 8:
					var a := float(k) / 8.0 * TAU + _rh(sd, k) * 0.3
					var r0 := 4.0 + 10.0 * (1.0 - c)
					var r1 := r0 + 6.0 + 8.0 * _rh(sd, k + 9)
					_ga(c)
					_fs(Color.WHITE if k % 2 == 0 else R[5])
					_line(px + cos(a) * r0, py + sin(a) * r0 * 0.7, px + cos(a) * r1, py + sin(a) * r1 * 0.7, 1)
		"onrush:hold", "hornet:sting", "lifeline:pull", "transfusion:drip", "transfusion:orb", "carapace:motes", "bloodbloom:orb", "feedingfrenzy:orb", "tempo:hold", "tempo:foe", "fulgurite:bolt", "mire:seep", "charge:bump":
			if key == "fulgurite:bolt":
				_bolt(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]), _wx(b["x1"], b["y1"]), _wy(b["x1"], b["y1"]) - 8.0, R, sd, fade, 1)
			else:
				var hh := _hero_at(b) if key in ["onrush:hold", "lifeline:pull", "carapace:motes", "tempo:hold"] else Vector2(b["x"], b["y"])
				_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 12.0, 14.0, R[4], 0.5 * fade)
	_ga(1.0)


## A shell round (cx, cy), `rx` by `ry` px, in meld `id`'s colour and way, `fade` its strength; `n` Shieldwall's bands.
func _shell(id: String, cx: float, cy: float, rx: float, ry: float, sd: int, fade: float, n := 1) -> void:
	var R := ramp(id)
	var dots := 28
	for i in dots:
		var a := float(i) / dots * TAU
		var x := cx + cos(a) * rx
		var y := cy + sin(a) * ry
		var lit := 0.55 + 0.45 * sin(a + PI * 0.75)
		match id:
			"carapace":
				# (plates of a dusky-rose shell)
				if i % 2 == 0:
					_ga(0.9 * fade)
					_fs(R[1])
					_fill(_ri(x) - 2, _ri(y) - 1, 4, 3)
					_fs(R[3] if lit < 0.7 else R[4])
					_fill(_ri(x) - 1, _ri(y) - 1, 3, 2)
			"parry":
				_ga((0.6 + 0.4 * lit) * fade)
				_fs(R[5] if lit > 0.6 else R[4])
				_fill(_ri(x), _ri(y), 2, 2)
			_:
				_ga((0.55 + 0.35 * lit) * fade)
				_fs(R[4] if lit > 0.7 else R[3])
				_fill(_ri(x), _ri(y), 1, 1)
		match id:
			"minefield":
				if i % 7 == 0:
					var on: bool = fmod(t * 2.0 + float(i) * 0.1, 1.0) < 0.5
					_ga(fade)
					_fs(R[1])
					_fill(_ri(x) - 1, _ri(y) - 1, 3, 3)
					_fs(FIRE[4] if on else R[4])
					_fill(_ri(x), _ri(y), 1, 1)
			"riposte":
				if i % 7 == 0:
					_ga(fade)
					_fs(R[5])
					_line(x, y, cx + cos(a) * (rx - 4.0), cy + sin(a) * (ry - 4.0), 1)
			"sanctuary":
				pass
	if id == "shieldwall":
		for k in range(1, clampi(n, 1, 5)):
			var kk := 1.0 - float(k) * 0.12
			for i in dots:
				var a := float(i) / dots * TAU
				_ga(0.6 * fade)
				_fs(R[4] if k % 2 else R[3])
				_fill(_ri(cx + cos(a) * rx * kk), _ri(cy + sin(a) * ry * kk), 1, 1)
	if id == "sanctuary":
		_glow(cx, cy, rx * (1.0 + 0.15 * sin(t * 3.0)), R[4], 0.35 * fade)
	if id == "redoubt":
		for i in dots:
			var a := float(i) / dots * TAU
			_ga(0.5 * fade)
			_fs(R[5])
			_fill(_ri(cx + cos(a) * rx * 0.7), _ri(cy + sin(a) * ry * 0.7), 1, 1)
	_ga(1.0)


## Vendetta's tally: `n` strokes scratched over (cx, cy), struck through at three, flashing when `hot`.
func _tally(cx: float, cy: float, n: int, R: PackedColorArray, fade: float, hot: bool) -> void:
	# (scratched marks, as a blade scores them: each a leaning gash, deep in the middle and tapering to its ends; the third a
	# slash struck through them)
	var strokes := clampi(n, 1, 5)
	for k in strokes:
		var x := cx - 10.0 + k * 5.0
		var lean := 2.0 + (float(k % 2) - 0.5)
		_ga(fade)
		_fs(R[0])
		_line(x - lean, cy + 8.0, x + lean, cy - 8.0, 4)
		_fs(R[5] if hot else R[4])
		_line(x - lean * 0.9, cy + 6.0, x + lean * 0.9, cy - 6.0, 2)
		_line(x - lean, cy + 8.0, x + lean, cy - 8.0, 1)
		_fs(Color.WHITE)
		_fill(_ri(x) - 1, _ri(cy) - 1, 1, 2)
	if strokes >= 3:
		_fs(R[0])
		_line(cx - 14.0, cy + 6.0, cx + 14.0, cy - 6.0, 4)
		_fs(R[5])
		_line(cx - 13.0, cy + 5.0, cx + 13.0, cy - 5.0, 2)
		_line(cx - 15.0, cy + 7.0, cx + 15.0, cy - 7.0, 1)
	_glow(cx, cy, 22.0 if hot else 14.0, R[4], fade * (1.0 if hot else 0.5))
	_ga(1.0)


## Hourglass: an hourglass at (cx, cy) turning over, its sand running slow (or, over him, fast).
func _hourglass(cx: float, cy: float, u: float, R: PackedColorArray, fade: float, fast: bool) -> void:
	var a := _ease(_c01(u * 3.0)) * PI
	var c := cos(a)
	var s := 1.0 if c >= 0.0 else -1.0
	var hgt := 12.0 * absf(c) + 3.0
	_glow(cx, cy, 22.0, R[4], 0.7 * fade)
	_ga(fade)
	var rows := maxi(2, _ri(hgt * 2.0))
	for k in rows + 1:
		var v := float(k) / float(rows)
		var w := 8.0 * absf(1.0 - v * 2.0) + 1.5
		var y := cy - hgt + v * hgt * 2.0
		_fs(R[0])
		_fill(_ri(cx - w) - 1, _ri(y) - 1, _ri(w * 2.0) + 2, 3)
	for k in rows + 1:
		var v := float(k) / float(rows)
		var w := 8.0 * absf(1.0 - v * 2.0) + 1.5
		var y := cy - hgt + v * hgt * 2.0
		# (the sand: the lower bulb filling, the upper emptying)
		var low := (v > 0.5) == (s > 0.0)
		_fs(R[4] if low and absf(v - 0.5) * 2.0 < 0.3 + 0.7 * _c01(u * 1.5) else R[2])
		_fill(_ri(cx - w), _ri(y), _ri(w * 2.0), 1)
	_fs(R[1])
	_fill(_ri(cx) - 10, _ri(cy - hgt) - 2, 20, 3)
	_fill(_ri(cx) - 10, _ri(cy + hgt) - 1, 20, 3)
	_fs(R[5])
	_fill(_ri(cx) - 4, _ri(cy + hgt * s) - 3 * int(s), 8, 2)
	var run := fmod(t * (2.0 if fast else 0.6), 1.0)
	_fill(_ri(cx), _ri(cy - hgt * 0.4 * s + run * hgt * 0.8 * s), 2, 3)
	_ga(1.0)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	var hx := _wx(h.world.x, h.world.y)
	var hy := _wy(h.world.x, h.world.y)
	# (his shell, one of these in front, while it holds)
	if h.shield > 0.0 or h.barrier > 0.0:
		for i in 3:
			var f: String = h.m52.fid(i)
			if SHELLS.has(f):
				_shell(f, hx, hy - 17.0, 17.0, 23.0, 7, 1.0, h.frenzy)
				break
	# (a monster's, carrying one, while its shield holds)
	if h.monsters != null and is_instance_valid(h.monsters):
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead:
				continue
			if o.shield > 0.0:
				for id in SHELLS:
					if o.words.has(id):
						_shell(id, _wx(o.world.x, o.world.y), _wy(o.world.x, o.world.y) - _mid(o), _half(o) + 4.0, _mid(o) + 3.0, o.id, 1.0, 1 + int(4.0 * clampf(1.0 - o.life / maxf(1.0, o.max_life), 0.0, 1.0)))
						break
			# (Vendetta's tally on what it has scored; Detonator's charge on what it marked)
			if int(o.m52.get("vendetta", 0)) > 0:
				_tally(_wx(o.world.x, o.world.y), _wy(o.world.x, o.world.y) - _mid(o) * 2.0 - 8.0, int(o.m52["vendetta"]), ramp("vendetta"), 0.8, false)
			if o.mark_t > 0.0 and bool(o.m52.get("det_mark", false)):
				var on: bool = fmod(t * 4.0, 1.0) < 0.5
				var cx := _wx(o.world.x, o.world.y)
				var cy := _wy(o.world.x, o.world.y) - _mid(o) * 2.0 - 6.0
				_charge(cx, cy, ramp("detonator"), on)
	# (Onrush, Quicksilver behind: his burst of speed in their colour)
	if h.haste_t > 0.0:
		if h.m52.any_has("quicksilver", false) and _rh(7, int(t * 20.0)) < 0.5:
			var R := ramp("quicksilver")
			var a := _rh(9, int(t * 20.0)) * TAU
			_bolt(hx, hy - 16.0, hx + cos(a) * 10.0, hy - 16.0 + sin(a) * 10.0, R, int(t * 20.0), 0.8, 1)
	_ga(1.0)


func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	var hx := _wx(h.world.x, h.world.y)
	var hy := _wy(h.world.x, h.world.y)
	if h.haste_t > 0.0:
		# (Onrush behind: a coral band of wind circling his feet)
		if h.m52.any_has("onrush", false):
			var R := ramp("onrush")
			# (two curling gusts chasing round him, each a tapering stroke of wind)
			for g in 2:
				for i in 10:
					var a0 := float(i) / 10.0 * PI * 0.9 + t * 6.0 + g * PI
					var a1 := a0 + PI * 0.09
					var rr := 12.0 + 2.0 * sin(t * 4.0 + g)
					_ga((0.25 + 0.7 * float(i) / 10.0))
					_fs(R[4] if i > 6 else R[3])
					_line(hx + cos(a0) * rr, hy + sin(a0) * rr * 0.42, hx + cos(a1) * rr, hy + sin(a1) * rr * 0.42, 2 if i > 5 else 1)
		# (Charge behind: dust wedging out in front of him)
		if h.m52.any_has("charge", false):
			var R := ramp("charge")
			var d: Vector2 = h.face
			for i in 12:
				var v := float(i) / 11.0
				var side := (v - 0.5) * 2.0
				var fwd := 0.6 + 0.5 * (1.0 - absf(side))
				var sx := hx + (d.x - d.y) * 16.0 * fwd + (-(d.x + d.y)) * 9.0 * side
				var sy := hy + (d.x + d.y) * 8.0 * fwd + (d.x - d.y) * 4.5 * side
				# (a rolling curl of dust, not a block: each billows and settles)
				var puff := 0.5 + 0.5 * sin(t * 12.0 + i)
				_curl(sx, sy - 1.0, 5.0 + 2.0 * puff, [DUST[1], DUST[2], R[3] if puff > 0.6 else DUST[3]], _hash(i, int(t * 3.0)), 0.85)
	if h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id: String = str(z.get("m52", z.get("look", z.get("foe", ""))))
		if not IDS.has(id):
			continue
		var R := ramp(id)
		var x: float = z["x"]
		var y: float = z["y"]
		var r: float = z["r"]
		var cx := _wx(x, y)
		var cy := _wy(x, y)
		var sd := _hash(_ri(x * 100.0), _ri(y * 100.0))
		var life := 1.0 - _c01((float(z["t"]) - float(z["dur"]) + 0.5) / 0.5)
		var kind: String = str(z["kind"])
		match id:
			"glide":
				# (its ice with a sea-green sheen, skate lines across it)
				for i in 5:
					var a := _rh(sd, i) * PI
					var l := r * 22.6 * (0.4 + 0.5 * _rh(sd, i + 9))
					_ga(0.6 * life)
					_fs(R[4])
					_line(cx - cos(a) * l, cy - sin(a) * l * 0.5, cx + cos(a) * l, cy + sin(a) * l * 0.5, 1)
				_glow(cx, cy, r * 22.6, R[3], 0.25 * life)
			"mire", "icebreaker", "anvil", "fulgurite":
				if kind == "cracks" or z.has("foe"):
					for i in 6:
						var a := _rh(sd, i) * TAU
						var d := r * (0.25 + 0.6 * _rh(sd, i + 7))
						var px := cx + cos(a) * d * 22.6
						var py := cy + sin(a) * d * 11.3
						match id:
							"mire":
								var pop := fmod(t * 1.5 + _rh(sd, i + 20), 1.0)
								_ga(0.7 * life * (1.0 - pop))
								_fs(R[3])
								_fill(_ri(px) - 1, _ri(py) - 1 - _ri(pop * 3.0), 3, 2)
								_fs(R[1])
								_fill(_ri(px) - 3, _ri(py), 7, 1)
							"icebreaker":
								_ga(0.8 * life)
								_fs(ICE[4])
								_fill(_ri(px) - 3, _ri(py), 7, 1)
								_fs(ICE[5])
								_fill(_ri(px) - 1, _ri(py) - 1, 3, 1)
							"anvil":
								var glow := 0.6 + 0.4 * sin(t * 4.0 + i)
								_ga(0.9 * life)
								_fs(FIRE[2])
								_fill(_ri(px) - 4, _ri(py), 9, 1)
								_fs(FIRE[4] if glow > 0.8 else FIRE[3])
								_fill(_ri(px) - 2, _ri(py), 5, 1)
							"fulgurite":
								_ga(0.8 * life)
								_fs(R[2])
								_fill(_ri(px) - 4, _ri(py), 9, 1)
								if _rh(sd + i, int(t * 12.0)) < 0.25:
									_fs(Color.WHITE)
									_fill(_ri(px) - 2, _ri(py) - 1, 5, 1)
					if id == "anvil":
						_glow(cx, cy, r * 18.0, FIRE[3], 0.3 * life)
			"firewalk":
				# (a burning footprint)
				_ga(0.9 * life)
				_fs(FIRE[1])
				_fill(_ri(cx) - 2, _ri(cy) - 1, 5, 3)
				_fs(FIRE[3])
				_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 2)
				_flames(cx, cy, 2, 4.0, 6.0 * life, 0.8 * life, PackedColorArray([FIRE[2], FIRE[3], FIRE[4], FIRE[5]]), sd)
			"redoubt", "sanctuary", "parry", "aegis", "minefield", "riposte", "shieldwall", "carapace":
				if kind != "ward":
					continue
				var pulse := 0.6 + 0.4 * sin(t * 3.0)
				_ga(0.7 * life * (pulse if id == "sanctuary" else 1.0))
				_fs(R[4])
				_ring(x, y, r)
				match id:
					"minefield":
						for i in 6:
							var a := float(i) / 6.0 * TAU + _rh(sd, i) * 0.4
							var d := r * (0.3 + 0.5 * _rh(sd, i + 5))
							var on: bool = fmod(t * 2.0 + _rh(sd, i), 1.0) < 0.5
							_ga(life)
							_fs(R[1])
							_fill(_ri(cx + cos(a) * d * 22.6) - 1, _ri(cy + sin(a) * d * 11.3) - 1, 3, 3)
							_fs(FIRE[4] if on else R[4])
							_fill(_ri(cx + cos(a) * d * 22.6), _ri(cy + sin(a) * d * 11.3), 1, 1)
					"riposte":
						for i in 8:
							var a := float(i) / 8.0 * TAU
							_ga(life)
							_fs(R[5])
							_line(cx + cos(a) * r * 22.6, cy + sin(a) * r * 11.3, cx + cos(a) * (r * 22.6 - 5.0), cy + sin(a) * (r * 11.3 - 2.5), 1)
					"carapace":
						if randf() < 0.2:
							var a := randf() * TAU
							bits.append({"x": x + cos(a) * r * 0.6, "y": y + sin(a) * r * 0.6, "z": 0.0, "vx": 0.0, "vy": 0.0, "vz": 14.0, "fall": 0.0, "t": 0.0,
								"life": 0.8, "ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "dot", "size": 1.0})
					"redoubt":
						if z.get("inner", false):
							_fs(R[5])
							_ring(x, y, r * 0.98, 2, t)
					"sanctuary":
						if randf() < 0.15:
							var a := randf() * TAU
							bits.append({"x": x + cos(a) * r, "y": y + sin(a) * r, "z": 0.0, "vx": 0.0, "vy": 0.0, "vz": 10.0, "fall": 0.0, "t": 0.0,
								"life": 0.9, "ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "dot", "size": 1.0})
			"timebomb", "hairtrigger", "blastwave", "cluster":
				if kind != "rune":
					continue
				match id:
					"timebomb":
						var a := -PI * 0.5 + float(z["t"]) / maxf(0.1, float(z["dur"])) * TAU
						_ga(0.9)
						_fs(R[5])
						_line(cx, cy - 4.0, cx + cos(a) * 5.0, cy - 4.0 + sin(a) * 5.0, 1)
					"hairtrigger":
						var j := (_rh(sd, int(t * 20.0)) - 0.5) * 2.0
						_ga(0.9)
						_fs(R[4])
						_fill(_ri(cx + j) - 1, _ri(cy) - 6, 3, 2)
						_fs(FIRE[5])
						_fill(_ri(cx + j), _ri(cy) - 8, 1, 2)
					"blastwave":
						_ga(0.5)
						_fs(R[3])
						_ring(x, y, r, 3, t)
			"hourglass":
				# (slow sand: a ring of it creeping round, grains drifting inside)
				_ga(0.8 * life)
				_fs(R[1])
				_ring(x, y, r + 0.03, 3, t * 0.2)
				_fs(R[4])
				_ring(x, y, r, 3, t * 0.2)
				if randf() < 0.6:
					var a := randf() * TAU
					var d := sqrt(randf()) * r
					bits.append({"x": x + cos(a) * d, "y": y + sin(a) * d, "z": 2.0, "vx": 0.3, "vy": 0.1, "vz": 0.0, "fall": 0.0, "t": 0.0,
						"life": 0.9, "ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "dot", "size": 2.0})
			"aftermath":
				# (a monster's: the floor smoking where it struck)
				_smoke(x, y, r, R, life, sd)
	# AFTERMATH: where his blow struck, the ground smoking
	for a in h.m52.x._after:
		var R := ramp("aftermath")
		var life: float = _c01(float(a["t"]) / 0.6)
		_smoke(a["at"].x, a["at"].y, float(a["r"]), R, life, _hash(_ri(a["at"].x * 100.0), _ri(a["at"].y * 100.0)))
	_ga(1.0)


## Umber smoke over the floor round (x, y), `r` tiles.
func _smoke(x: float, y: float, r: float, R: PackedColorArray, life: float, sd: int) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y)
	for i in 12:
		var a := _rh(sd, i) * TAU + t * 0.3
		var d := r * sqrt(_rh(sd, i + 30))
		var px := cx + cos(a) * d * 22.6
		var py := cy + sin(a) * d * 11.3 - fmod(t * 6.0 + _rh(sd, i + 60) * 10.0, 10.0)
		var s := 6.0 + 5.0 * _rh(sd, i + 90)
		_curl(px, py, s, [R[1], R[2], R[4]], sd + i, 0.75 * life)
	_ga(1.0)



## Detonator's charge: a sticky iron charge clinging by three claws, its light blinking faster as it nears bursting.
func _charge(x: float, y: float, R: PackedColorArray, on: bool) -> void:
	_ga(1.0)
	for k in 3:
		var a := PI * 0.5 + (float(k) - 1.0) * 0.9
		_fs(R[0])
		_line(x + cos(a) * 3.0, y + sin(a) * 3.0, x + cos(a) * 7.0, y + sin(a) * 6.0 + 1.0, 2)
		_fs(R[2])
		_line(x + cos(a) * 3.0, y + sin(a) * 3.0, x + cos(a) * 6.0, y + sin(a) * 5.0, 1)
	_disc(x, y, 5.0, [R[0], R[1], R[2], R[3], R[4]])
	_fs(R[0])
	_fill(_ri(x) - 1, _ri(y) - 7, 2, 2)
	_fs(R[5] if on else R[2])
	_fill(_ri(x) - 1, _ri(y) - 8, 2, 1)
	if on:
		_glow(x, y - 7.0, 16.0, R[5], 0.9)
		_glow(x, y - 7.0, 6.0, Color.WHITE, 0.7)
