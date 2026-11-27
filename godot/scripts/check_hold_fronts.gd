## THE STORY'S STRONGHOLDS' OWN FRONTS, PICTURED (the art chat's OWN_FRONTS; his “Yes, story and endless alike (Recommended)”):
## `--only=holdfronts --shots=<dir>`. On floors 7, 9 and 10 (each as the game lays it: the remade 7 and 10), the hero set down in
## each stronghold's yard (he is not to be harmed), a few steps before the cult's gate: one picture each, `hold_<floor>_<n>.png`.
extends RefCounted

func run(M, h, dir: String) -> void:
	h.unhurt = true
	for f in [7, 9, 10]:
		M.go_to("floor%d" % f, "down")
		await M._wait(1.0)
		var at: String = M.dir_of("floor%d" % f) + "/holds.json"
		var holds: Array = (JSON.parse_string(FileAccess.get_file_as_string(at)) as Dictionary).get("holds", [])
		for q in holds:
			h.world = Vector2(float(q["gx"]) + 0.5, float(q["gy"]) + 5.5)
			h._place()
			await M._wait(1.2)
			M._snap(dir + "/hold_%d_%d.png" % [f, int(q["n"])])
			await M._wait(0.2)
			print("HOLDFRONTS floor %d stronghold %d: gate at %d,%d, pictured" % [f, int(q["n"]), int(q["gx"]), int(q["gy"])])
	print("HOLDFRONTS DONE")
