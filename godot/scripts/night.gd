## NIGHT IN THE TOWN AND ON FLOOR 1 (his words, 27 Nov 2026, 17:13: “I'm making some changes to the first town and floor 1. I'd
## like them both to be at night. I don't want to change the look of either of them, but they do just need to be at night. And
## also, I need the gate that leads out to the wilds from the town to be like solid wood instead of like a wrought iron sort of
## open thing. And then floor 1, I think you want like moonlight instead of like sunlight beaming in. Same thing with the town,
## sorry. And it also makes the owl seem more natural.”)
##
## WITH IT ON, nothing they are drawn with changes, only their light (look.gd, as each place's look is laid out):
##   THE DARK over each deeper and blue (PLACES dark), its vignette a little heavier;
##   THE SUN AND THE DAYLIGHT (the light the look's own windows and shafts cut in the dark, its glows, and its pictures of light
##     added over the floor and in the air: the town's sun on the floor and in the air through its windows, floor 1's pools and
##     shafts of daylight) MOONLIGHT: cut less deep, their glows the moon's pale blue, their pictures tinted to it and fainter;
##   every fire as it was (braziers, torches, the forge, the lamps): warm against the blue;
##   (the town) THE WAY OUT THROUGH THE GATE, seen as it rises, night beyond it; its light through the gate gone, the gate shut;
##   THE TOWN GATE IN WOOD: its portcullis a solid gate of planks banded with iron (assets/fx/tg_wood.png, painted by
##     tools/wood_gate.py frame for frame with the iron's, so it rises and falls as that did: town.gd). The bars across it and
##     their striking off as they were.
## THE MORNING: his words, 27 Nov 2026, by 18:00, on the first pictures: “Okay I kinda like the town, not quite night enough but
## fine.  The floor one pictures look the same.  I want when you come up from floor 5 back to town in the elevator, it’s morning.
## And then you go out to the wilds and it’s light out.  On second thought no, the town is not good enough as night”. So the night
## lasts until the ride up from floor 5 (ways.gd, loot.morning, saved with the run); from then on the town and floor 1 are as by
## day, the gate still wood.
## OFF: as it was by day. Pictured: check_night.gd, `--only=night` (`--night=1` on for a run).
extends RefCounted

static var on := false
## (the ride up from floor 5 has brought the morning (loot.morning, set here as each place is laid: main.gd): from then on the town
## and floor 1 are as by day; the gate stays wood)
static var morning := false


## Whether it is night now: on, and the morning not come.
static func now() -> bool:
	return on and not morning

## Each place's night: the dark (alpha, colour), its vignette, how deep the daylight's holes still cut (times as deep), its glows'
## colour and strength (times), its pictures of light tinted (and how strong).
const PLACES := {
	"town": {"dark": 0.78, "rgb": [8, 12, 34], "vignette": 0.5, "holes": 0.25, "glow": "#a9c2ff", "glow_k": 0.6,
		"moon": Color(0.45, 0.6, 1.0, 0.6), "beyond": Color(0.18, 0.22, 0.45), "grade": Color(0.5, 0.6, 0.95)},
	"floor1v2": {"dark": 0.6, "rgb": [6, 9, 22], "vignette": 0.7, "holes": 0.6, "glow": "#9fb8f2", "glow_k": 1.0,
		"moon": Color(0.55, 0.72, 1.0, 1.0), "grade": Color(0.5, 0.62, 1.0)},
	"floor1": {"dark": 0.6, "rgb": [6, 9, 22], "vignette": 0.7, "holes": 0.6, "glow": "#9fb8f2", "glow_k": 1.0,
		"moon": Color(0.55, 0.72, 1.0, 1.0), "grade": Color(0.5, 0.62, 1.0)},
}
## THE GLASS OF THE TOWN'S WINDOWS: by day the sun's cream, at night the moon's blue. In the pictures whose names begin so (the
## hall's roof with its high windows, the walls' faces with theirs), each colour the glass is painted in -> its colour at night.
const GLASS := {"town": {"pics": ["roof", "face "], "colours": {"fff0c4": "aac4f6", "e8d6a6": "8ea6dc"}}}
## (the town's lights that were the day's, through its gate: gone at night, the gate shut and solid)
const GONE := ["gate"]

const FX_DIR := "res://assets/fx/"


## The night of place `place` laid over its look's data (look.gd _ready): its dark, its vignette, its daylight's holes and glows.
static func fall(place: String, data: Dictionary) -> void:
	if not on or not PLACES.has(place):
		return
	# (by day, the gate solid wood all the same: no light through it)
	if morning:
		data["lights"] = (data.get("lights", []) as Array).filter(func(l): return not GONE.has(str(l.get("of", ""))))
		return
	var N: Dictionary = PLACES[place]
	data["dark"] = {"a": N["dark"], "rgb": N["rgb"]}
	data["vignette"] = N["vignette"]
	var kept: Array = []
	for l in data.get("lights", []):
		var of := str(l.get("of", ""))
		if GONE.has(of):
			continue
		if of == "look":
			if l["type"] == "hole":
				l["a"] = float(l["a"]) * float(N["holes"])
			else:
				l["color"] = N["glow"]
				l["a"] = float(l["a"]) * float(N["glow_k"])
		kept.append(l)
	data["lights"] = kept


## Place `place`'s sheet `sheet` with its windows' glass the night's (GLASS), or `sheet` itself by day or where there is none;
## `pics` its pictures by name ([x, y, w, h, ...] on the sheet). Made once a place.
static var _glassed := {}
static func glass(place: String, sheet: Texture2D, pics: Dictionary) -> Texture2D:
	if not now() or not GLASS.has(place) or sheet == null:
		return sheet
	if _glassed.has(place):
		return _glassed[place]
	var G: Dictionary = GLASS[place]
	var img: Image = sheet.get_image()
	if img == null:
		return sheet
	if img.is_compressed():
		img.decompress()
	img.convert(Image.FORMAT_RGBA8)
	var swap := {}
	for k in G["colours"]:
		var a := Color(k)
		var b := Color(G["colours"][k])
		swap[(a.r8 << 16) | (a.g8 << 8) | a.b8] = PackedByteArray([b.r8, b.g8, b.b8])
	var bytes := img.get_data()
	var W := img.get_width()
	for n in pics:
		var hit := false
		for pre in G["pics"]:
			if String(n).begins_with(pre):
				hit = true
		if not hit:
			continue
		var p: Array = pics[n]
		for y in range(int(p[1]), int(p[1]) + int(p[3])):
			var i := (y * W + int(p[0])) * 4
			for x in int(p[2]):
				var key := (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
				if bytes[i + 3] > 0 and swap.has(key):
					var to: PackedByteArray = swap[key]
					bytes[i] = to[0]
					bytes[i + 1] = to[1]
					bytes[i + 2] = to[2]
				i += 4
	var out := ImageTexture.create_from_image(Image.create_from_data(img.get_width(), img.get_height(), false, Image.FORMAT_RGBA8, bytes))
	_glassed[place] = out
	return out


## The moon's blue multiplied over all of place `place` (but its fires) at night, or null.
static func grade(place: String):
	return PLACES[place].get("grade") if now() and PLACES.has(place) else null


## The tint for place `place`'s pictures of light (added over it), or null: as by day.
static func moon(place: String):
	return PLACES[place]["moon"] if now() and PLACES.has(place) else null


## (the town) the way out through the gate, as seen at night: its tint, or null.
static func beyond(place: String):
	return PLACES[place].get("beyond") if now() and PLACES.has(place) else null


## THE TOWN GATE IN WOOD: its films (tgw_port_<k>) put among the game's own (perils.gd's fx), once; the name of strip k's film.
static var _wood := false
static func port_film(k: int) -> String:
	if not on:
		return "tg_port_%d" % k
	if not _wood:
		_wood = true
		var P = preload("res://scripts/perils.gd")
		if P._fx.has("films") and FileAccess.file_exists(FX_DIR + "tg_wood.json"):
			var W: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FX_DIR + "tg_wood.json"))
			var si: int = (P._fx["sheets"] as Array).size()
			P._fx["sheets"].append(W["sheet"])
			P._fx_sheets.append(null)
			for name in W["films"]:
				var stand: Array = []
				for f in W["films"][name]:
					if (f as Array).is_empty():
						stand.append(-1)
						continue
					P._fx["pics"].append([si, f[0], f[1], f[2], f[3], f[4], f[5]])
					stand.append((P._fx["pics"] as Array).size() - 1)
				P._fx["films"][name] = {"layers": {"stand": stand}}
	return "tgw_port_%d" % k
