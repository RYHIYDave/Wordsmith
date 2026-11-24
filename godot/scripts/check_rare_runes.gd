## CHECKS: THE RARE RUNES (loot.gd ENDLESS_DROPS, QUEEN_ONLY: his words, 24 Nov 2026, “plundering ... and mirroring should only drop in
## endless. Mirroring should be very, extremely rare ... Drops only from the queen in endless”), `--only=rarerunes`: on floor 18 as
## the story has it, neither drops (what lies about, what a monster carries, what a chained rare leaves); on an endless level,
## Plundering may and Mirroring may not; the Glass Queen on an endless level leaves Mirroring MIRROR_CHANCE of her kills, and never
## on floor 18 as the story has it.
extends RefCounted

var M
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("RARERUNES %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _draws(k: int) -> Dictionary:
	var out := {}
	for i in k:
		var w: String = M.loot.drop_ok(M.loot.tilt_word(M.loot.drops_at(M.loot.power()).pick_random()))
		out[w] = int(out.get(w, 0)) + 1
	return out


func run(main, _hero, _dir: String) -> void:
	M = main
	var L = M.loot
	M.endless = 0
	M.in_endless = false
	var story: Array = L.words_found_at(18)
	var here: Array = L.drops_at(18)
	_line(story.has("plundering") and story.has("mirroring") and not here.has("plundering") and not here.has("mirroring") and here.size() == story.size() - 2,
		"floor 18 as the story has it: of the %d runes found there, these may drop: %d, no Plundering, no Mirroring" % [story.size(), here.size()])
	_line(L.drop_ok("plundering") != "plundering" and L.drop_ok("mirroring") != "mirroring" and L.drop_ok("twin") == "twin",
		"there, a monster carrying Plundering or Mirroring carries another instead (%s, %s); Twin stays Twin" % [L.drop_ok("plundering"), L.drop_ok("mirroring")])
	M.in_endless = true
	M.endless = 6
	var e: Array = L.drops_at(20)
	_line(e.has("plundering") and not e.has("mirroring"), "on an endless level: Plundering may drop (%s), Mirroring may not (%s)" % [e.has("plundering"), e.has("mirroring")])
	var queen := {"kind": "gqueen", "boss": true}
	var lady := {"kind": "lady", "boss": false}
	var hits := 0
	for i in 20000:
		if L.queen_mirror(queen):
			hits += 1
	_line(L.queen_mirror(queen, 0.0) and not L.queen_mirror(queen, 0.5) and not L.queen_mirror(lady, 0.0) and absf(hits / 20000.0 - L.MIRROR_CHANCE) < 0.004,
		"the Glass Queen on an endless level leaves Mirroring %.2f%% of her kills (%.0f%%); no one else" % [100.0 * hits / 20000.0, 100.0 * L.MIRROR_CHANCE])
	M.in_endless = false
	M.endless = 0
	_line(not L.queen_mirror(queen, 0.0), "the Glass Queen on floor 18 as the story has it: never")
	print("RARERUNES: %d checks, %d wrong" % [n, bad.size()])
