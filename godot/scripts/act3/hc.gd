## WHAT THE HIGH CITY'S OWN SHARE (floors 16 to 20), over the rules every kind of its own has (act1/act1.gd).
extends "res://scripts/act1/act1.gd"


## A WARNING ON THE FLOOR through this act's wind-up (render/act1_fx/*.ts ground: garden_warn.gd, drawn by act3/marks16.gd), read
## from the one acting each frame as the game reads it (where it stands, the way it faces, its act's own clock): from `from` to
## the blow at `hit` of act `act_id`; `strips` [from, to, left0, left1] before it (and, where it has them, [.., w0, w1]: along a
## way turned off its facing, the way's forward share and its left share), `fans` [b0, b1, r] round it (and [.., ahead]: round a
## point so far before it), or round the hero where `on_hero` (the javelin's fall); `more`: `at_act`, laid from where the hero stood
## as the act began (act.x, act.y: the thrown lady's lane), `kmul`, the warning that much as strong. Gone when its act is: this act
## of it, not the next of its kind.
func warn(m, act_id: String, from: float, hit: float, strips: Array, fans: Array, on_hero := false, more := {}) -> void:
	var q := {"w0": from, "hit": hit, "dur": 1e9, "strips": strips, "fans": fans, "act_id": act_id, "on_hero": on_hero, "act": act}
	q.merge(more, true)
	peril(m, act_id.split(":")[0] + ":warn", m.world, q)
