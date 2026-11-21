## THE FLESHMANCER'S SHARDS, THE CRACKS OF HIS RINGS AND HIS FIRE, PAINTED AS THE GAME PAINTS THEM. The game does not keep
## films of these three: it paints each afresh, a frame of its own clock at a time, with the art's own painters
## (art/fleshmancer_action_fx.ts paintShards, paintRingCracks, paintFire; laid by render/act1_fx/fm.ts on a picture made by
## render/act1_fx/live.ts). This is those painters, line for line: the same loops, the same numbers, the same noise
## (art/kit.ts hash), the same rounding, onto a picture of plain pixels as the game's is (engine/px.ts Px).
##   HIS SHARDS (paintShards, shardsAt, shardPix): `floor`, each one's lane marked in his pink and its shadow; `air`, the shards
##     drawn up, hanging, flung, bursting. Each fan painted by its own aim.
##   HIS RINGS' CRACKS (paintRingCracks, ringHands, ringBurst): lit in the floor, flashing as their hands burst up, going dark.
##     (The hands themselves are the game's films: perils.gd _fm_hands.)
##   HIS FIRE, AND A MINI FLESHMANCER'S (paintFire): `floor`, the char under the lanes; `air`, HIS FIRE AS FLAMES, as the game
##     has painted it since the owner's yes to his redo (art/fm2_switch.ts FLESH2, on; paintFlames, flame: commit 669fda3):
##     each lane a bed of embers with flames standing on it, the stream a river of tall flames, the gout out of the skull's
##     jaws. The spikes it painted before, which that switch turns off, are not here.
## NUMBERS. Every sum is made in the order the game makes it, in the same 64-bit numbers. A half is rounded up, also below
## nought, as Math.round does (_jsr); Math.hypot is summed as the game's engine sums it (hypot2); the noise is the game's
## 32-bit one. sin, cos and pow are Godot's own, which can differ from a browser's in a number's last bit (as one browser's
## do from another's): that moves a pixel only where a sum lands within that last bit of a half.
## SHORT CUTS. Where the game lays a run of pixels one at a time (a row of a flame, a flame's white heart, a lick, the gout),
## the run is laid here in one go, the same pixels; `literal` lays them one at a time as the game does (for the checks).
## What does not change from frame to frame is worked out once (the rings' places round, the shapes of a flame's rows).
## NOT HERE: the lights (render/act1_fx/fm.ts c.spot: the holes his fire and his hands cut in the dark). They are cut by
## perils.gd _spots_of (look.gd spot).
## HOW THEY ARE SHOWN (Live, below). The game paints a picture the moment the frame of its clock changes, on the spot. Here
## that would hold the screen: in GDScript a picture of his fire takes 10 to 17 ms to paint (the stream pouring with its
## lanes burning; a desk machine, 2.1 GHz), his rings' cracks 4 to 6 ms, his shards 1 to 2 ms, a mini's fire up to 5 ms. So
## each frame's pictures are painted ahead of their time on the engine's worker threads, each at its frame's own moment
## (frame k at k / 30 s; the game paints it with its clock as it stands when the frame comes round, less than one frame of
## the screen later), still 30 a second, and the screen only takes what is done: it never waits for a picture. (Where the
## engine has no threads, `threads` below: painted on the spot after all, and then 15 a second.)
extends RefCounted

# --- his pictures' own numbers (art/fleshmancer_action.ts: seconds, his frames at 30 a second; fleshmancer.gd has them too,
# for his rules) ---

## (SHARD_HITS, SHARD_DRAW: each fan flies at its hit; when each is drawn up out of the floor, from and to)
const SHARD_HITS: Array[float] = [26.0 / 30.0, 52.0 / 30.0]
const SHARD_DRAW: Array[float] = [3.0 / 30.0, 14.0 / 30.0, 34.0 / 30.0, 44.0 / 30.0]
## (RING_HITS: his two slams)
const RING_HITS: Array[float] = [36.0 / 30.0, 60.0 / 30.0]
## (FIRE_HIT, FIRE_STOP, WHIP; MINI_HIT, MINI_STOP, MINI_WHIP: when the stream pours, where it starts, how far round, its ease)
const FIRE_HIT := 32.0 / 30.0
const FIRE_STOP := 68.0 / 30.0
const WHIP_FROM := -0.75
const WHIP_ROUND := (385.0 * PI) / 180.0
const WHIP_EASE := 1.45
const MINI_HIT := 26.0 / 30.0
const MINI_STOP := 44.0 / 30.0
const MINI_WHIP_FROM := -1.3
const MINI_WHIP_ROUND := 2.6
const MINI_WHIP_EASE := 1.35

# --- what he sends out (art/fleshmancer_action_fx.ts SHARDS, RINGS, FIRE, MINI_FIRE) ---

const SHARD_FAN: Array[int] = [9, 8]
const SHARD_APART := 12.0
const SHARD_HANG_R := 1.6
const SHARD_HANG_Z := 40.0
const SHARD_SPEED := 15.0
const SHARD_REACH := 10.0
const SHARD_LANE := 6.5
const SHARD_BURST := 0.35
const RING_RADII: Array[float] = [1.4, 2.6, 3.8, 5.0, 6.2]
const RING_APART := 0.62
const RING_GAP_HANDS := 3.0
const RING_TURN := 1.15
const RING_LIT := 6.0 / 30.0
const RING_RIPPLE := 1.0 / 30.0
## (FIRE, MINI_FIRE: land, reach, half, every, laneHalf, burn, die, scorch)
const FIRE: Array[float] = [0.9, 7.0, 0.5, (40.0 * PI) / 180.0, 0.3, 3.0, 0.8, 1.2]
const MINI_FIRE: Array[float] = [0.5, 3.6, 0.38, (32.0 * PI) / 180.0, 0.24, 2.0, 0.6, 0.9]

# --- the colours (art/mkit.ts FLAME, the enemy's fire from its dark rim to its gold; art/fleshmancer_action_fx.ts WHITE, the
# heart of a flame; BONE, lit to deep; INK, the floor's cracks; CHAR, scorched stone) ---

const F0 := Color("#7a1058")
const F1 := Color("#c0206a")
const F2 := Color("#ff4f8a")
const F3 := Color("#ffb070")
const F4 := Color("#fff0a0")
const WHITE := Color("#fff6e0")
const BONE0 := Color("#f2e8d4")
const BONE1 := Color("#d6c4a2")
const BONE2 := Color("#a48a6e")
const BONE3 := Color("#6a5450")
const INK := Color("#0b0710")
const CHAR0 := Color("#170b14")
const CHAR1 := Color("#26121c")
const CHAR2 := Color("#3a1a24")
const CHAR: Array[Color] = [CHAR0, CHAR1, CHAR2]
## (paintFlames SHELLS: a flame's shells, outside in: how wide each is of the whole, and its colour)
const SHELL_S: Array[float] = [1.0, 0.88, 0.68, 0.46, 0.28]
const SHELL_C: Array[Color] = [F0, F1, F2, F3, F4]

## (shardsAt: what a shard is doing)
const RISING := 0
const HANGING := 1
const FLYING := 2
const BURST := 3

# --- the pictures' rooms (render/act1_fx/fm.ts room, SHARD_ROOM, RING_ROOM, FIRE_ROOM, MINI_ROOM): [w, h, ax, ay], a picture
# big enough for so many tiles of floor all round its floor point (ax, ay) and so many pixels over it ---

static var SHARD_ROOM := room(SHARD_REACH + 0.6, 70)
static var RING_ROOM := room(RING_RADII[RING_RADII.size() - 1] + 0.6, 0)
static var FIRE_ROOM := room(FIRE[1] + 0.5, 130)
static var MINI_ROOM := room(MINI_FIRE[1] + 0.5, 80)

## WHERE THE SKULL'S JAWS ARE over his floor point, once a frame of his fire (0 to 120): tiles before him, tiles to his left,
## picture pixels up (render/act1_fx/fm.ts jaws: skullAt('fire', k / 30) of art/fleshmancer_action.ts, his own lengths made
## tiles and pixels). His skeleton is not in the port, so the game made the table: three numbers a frame, each written as
## the whole number its 64 bits make (the engine does not read every number written out to seventeen places back as the
## same number). Made, from the game's folder, by this (one line):
##   npx tsx -e "import { skullAt } from './src/art/fleshmancer_action'; import { TILE3 } from './src/art/new_mobs3';
##     import { GRID } from './src/art/skeleton'; const b = new DataView(new ArrayBuffer(8));
##     const bits = (v: number) => (b.setFloat64(0, v), b.getBigInt64(0).toString());
##     for (let k = 0; k <= 120; k++) { const s = skullAt('fire', k / 30);
##       console.log('\t' + [s[0] / TILE3, s[1] / TILE3, s[2] * GRID].map(bits).join(', ') + ','); }"
const JAWS_BITS: Array[int] = [
	4580947230635753652, -4618582189359809304, 4634436044483820455,
	4575804740108218128, -4618624908949995083, 4634467011660332616,
	-4641722869764489604, -4618745105056813271, 4634552503645994636,
	-4634007749395000713, -4618931217194185925, 4634680279601107745,
	-4629907472368336339, -4619171555272260457, 4634837455069946839,
	-4627424357634827095, -4619453688245087021, 4635011458711331712,
	-4625019808705087335, -4619764169755482516, 4635190842485808943,
	-4623693756731691283, -4620088648680309217, 4635365890312662619,
	-4622396803577578606, -4620412309794559071, 4635528951132768561,
	-4621188242596307379, -4620747766563141553, 4635674450120011605,
	-4620406271762330284, -4621305334443961389, 4635798593772291341,
	-4619962659407412657, -4621778464559997762, 4635898848726206402,
	-4619626913625037455, -4622143718906280924, 4635973306067496459,
	-4619413844979625704, -4622379103316369216, 4636020024735389135,
	-4619338849067387175, -4622462669147875022, 4636036383617710657,
	-4619338849067387175, -4622462669147875022, 4636025760551206598,
	-4619338849067387175, -4622462669147875022, 4636030095586729139,
	-4619338849067387175, -4622462669147875022, 4636047675116025609,
	-4619338849067387175, -4622462669147875022, 4636044210455691816,
	-4619338849067387175, -4622462669147875022, 4636027511894583568,
	-4619338849067387175, -4622462669147875022, 4636024640248594553,
	-4619338849067387175, -4622462669147875022, 4636043062812776177,
	-4619338849067387175, -4622462669147875022, 4636058634853589189,
	-4619338849067387175, -4622462669147875022, 4636047620275431189,
	-4619338849067387175, -4622462669147875022, 4636020070761984107,
	-4619338849067387175, -4622462669147875022, 4636008999288109247,
	-4619338849067387175, -4622462669147875022, 4636028365361959644,
	-4619338849067387175, -4622462669147875022, 4636054876588019851,
	-4619338849067387175, -4622462669147875022, 4636057685863950914,
	-4619338849067387175, -4622462669147875022, 4636036728774826567,
	-4619338849067387175, -4622462669147875022, 4636036383617710657,
	4581272138451312955, -4622464040825222403, 4636289793741460014,
	4604490903345251618, -4622468352308815181, 4635870041117997975,
	4603634590581586757, -4622421889726587360, 4635957876808157172,
	4603017484341742971, -4622393281428431943, 4636021208152442990,
	4602595631178208779, -4622497472407775866, 4636078529320459524,
	4602178944157760379, -4622769864168215285, 4636136492172263160,
	4601909236731310065, -4623156158102077016, 4636189700332622342,
	4601590956328595151, -4623507249898144778, 4636225754662458821,
	4601242707734477357, -4623735606074406699, 4636240689189517192,
	4600956396451361785, -4623882732443247584, 4636240810760421719,
	4600645713185951962, -4623939753121923374, 4636229879140879422,
	4600286679180833223, -4623906130498852599, 4636210692292094158,
	4599903392060265216, -4623789042943232407, 4636185425454412583,
	4599519092818278266, -4623601856415238547, 4636156847603306820,
	4599154624104648707, -4623362039442479921, 4636128025602224139,
	4598827297626843508, -4623088863855884255, 4636101969701038078,
	4598550229191399420, -4622801241542055553, 4636081258019993940,
	4598332153788446228, -4622515995324712201, 4636067694718996509,
	4598177655712719659, -4622246752720510045, 4636062063063996271,
	4598000144909152074, -4622003503904535785, 4636064024606801215,
	4597945159933768145, -4621792724609676914, 4636072190231226005,
	4598006383892915445, -4621617875105028399, 4636084355213584653,
	4598171604152338936, -4621480066658753224, 4636097858555903088,
	4598300713464236435, -4621378724830899243, 4636110004857017593,
	4598464661176974145, -4621312144597291705, 4636118478885515299,
	4598656874716804405, -4621277896484339127, 4636121688432479846,
	4598868989567956434, -4621273088771349448, 4636118986628947859,
	4599092953735361514, -4621294515054930096, 4636110746291360344,
	4599321268691463548, -4621338723838478784, 4636098281859027781,
	4599547173893654269, -4621402044000850454, 4636083635849064815,
	4599764775215374651, -4621480591969615855, 4636069264150971605,
	4599969116009415422, -4621570275539777315, 4636057666349792005,
	4600122764606924298, -4621722011879659183, 4636056831292503525,
	4600162119157872959, -4621938736791941711, 4636071587051359477,
	4600082688498027310, -4622155821418801064, 4636094923414732774,
	4599925443969676802, -4622327675406127259, 4636116929366695249,
	4599764507334491629, -4622431832565560403, 4636130022506386547,
	4599690659632283787, -4622465715697939304, 4636133264871103788,
	4599677190715779445, -4622451133231143183, 4636129476190688231,
	4599637811424324377, -4622408504978221423, 4636118399627333626,
	4599574000678923130, -4622339451188107365, 4636100451946307427,
	4599487172402355843, -4622245532459384680, 4636076030409390774,
	4599378697774540242, -4622128272703301444, 4636045517105588082,
	4599249926630137003, -4621989181407796871, 4636009282954079548,
	4599102207466434560, -4621829774418269673, 4635967691497036886,
	4598936905598987388, -4621651592567222086, 4635921102568609089,
	4598755419054765974, -4621456217580372353, 4635869875894504445,
	4598559191841593066, -4621245284778272549, 4635814374645100512,
	4598349724289321973, -4621020492192923438, 4635754968934942855,
	4598081940915321439, -4620783605837052691, 4635692039234051012,
	4597619562211495305, -4620614839342880651, 4635625979632991085,
	4597140491210188303, -4620487088658058964, 4635557200885595025,
	4596648256697386547, -4620356140825501926, 4635486133141775497,
	4596146506611685975, -4620223002280246485, 4635413228279036953,
	4595638991474982556, -4620088698561373301, 4635338961745421588,
	4595129543615903454, -4619954267087197600, 4635263833838474706,
	4594622053418503012, -4619820749336408012, 4635188370363342023,
	4594120443980604535, -4619689182890866369, 4635113122636591934,
	4593585671360898491, -4619560593804592694, 4635038666828509503,
	4592629523700065510, -4619435989744523400, 4634965602662852361,
	4591708575034202906, -4619316354303678402, 4634894551516801129,
	4590830463131971992, -4619202642820572247, 4634826153982778299,
	4590002687734624815, -4619095779956005600, 4634761066966187004,
	4589232595570503484, -4618996659186612674, 4634699960397869334,
	4587886733534797627, -4618906144280435188, 4634643513636885093,
	4586620127254680655, -4618825072729013324, 4634592411628444309,
	4585511178165584465, -4618754261026897228, 4634547340864434221,
	4584482606037006439, -4618694511614647963, 4634508985171300261,
	4582976852459547162, -4618646621234348081, 4634478021323631844,
	4581867612730951773, -4618611390383855634, 4634455114453325656,
	4581181946795898804, -4618589633491619550, 4634440913195359586,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
	4580947230635753685, -4618582189359809304, 4634436044483820455,
]

## (for the checks: true lays every pixel one at a time as the game's loops do, none of the short cuts)
static var literal := false
## (false where the engine is built without threads, or set so by hand: nothing is painted ahead; each picture is painted on
## the spot as its frame comes, holding the screen while it is, and then only every other frame is painted: 15 a second)
static var threads := not OS.has_feature("nothreads")

static var _jaws := PackedFloat64Array()
## (fireLanes: his, and the mini's: the way each lane burns and when the stream passed it, one after the other)
static var _lanes: Array[PackedFloat64Array] = []
## (paintShards: the dashes of a shard's lane that are drawn: how far out, its noise's seed, how faint so far out)
static var _lane_d := PackedFloat64Array()
static var _lane_h := PackedInt32Array()
static var _lane_far := PackedFloat64Array()
## (paintRingCracks: each ring's steps round: is it out of the gaps; its angle; its noise as it grows in and as it fades;
## how far out its jag puts it; which way its branch goes)
static var _ring_n := PackedInt32Array()
static var _ring_open: Array[PackedByteArray] = []
static var _ring_a: Array[PackedFloat64Array] = []
static var _ring_grow: Array[PackedFloat64Array] = []
static var _ring_fade: Array[PackedFloat64Array] = []
static var _ring_rr: Array[PackedFloat64Array] = []
static var _ring_out: Array[PackedFloat64Array] = []
## (flame: how far up a shell each of its rows is, and how wide the flame is there, for a shell of 1 to TAB_ROWS rows: those
## of `rows` rows from rows * (rows - 1) / 2 on)
const TAB_ROWS := 64
static var _u := PackedFloat64Array()
static var _prof := PackedFloat64Array()
## (paintFlames: Math.hypot(k, j * 1.2) for the gout's pixels, k and j from 0 to 7)
static var _gout := PackedFloat64Array()


static func _static_init() -> void:
	var b := PackedByteArray()
	b.resize(8)
	_jaws.resize(JAWS_BITS.size())
	for i in JAWS_BITS.size():
		b.encode_s64(0, JAWS_BITS[i])
		_jaws[i] = b.decode_double(0)
	for mini: bool in [false, true]:
		_lanes.append(fire_lanes(mini))
	# (paintShards: for (let d = SHARDS.hang.r + 0.2; d < SHARDS.lane; d += 0.05), three dashes in four)
	var d := SHARD_HANG_R + 0.2
	while d < SHARD_LANE:
		if floori(d / 0.05) % 4 != 0:
			_lane_d.append(d)
			_lane_h.append(floori(d * 40.0))
			_lane_far.append(d / SHARD_LANE * 0.4)
		d += 0.05
	for i in RING_RADII.size():
		var r := RING_RADII[i]
		var hands := ring_hands(i)
		var step := TAU / hands[0]
		var half := (RING_GAP_HANDS * step) / 2.0 + 0.02
		var n := maxi(120, _jsr(r * 230.0))
		var open := PackedByteArray()
		var angles := PackedFloat64Array()
		var grow := PackedFloat64Array()
		var fade := PackedFloat64Array()
		var rr := PackedFloat64Array()
		var out := PackedFloat64Array()
		for s in n:
			var a := (float(s) / n) * TAU
			var gap := absf(fmod(a - hands[1] + PI * 3.0, TAU) - PI) < half or absf(fmod(a - hands[2] + PI * 3.0, TAU) - PI) < half
			open.append(0 if gap else 1)
			angles.append(a)
			grow.append(hash3(s, i, 561))
			fade.append(hash3(s, i, 562))
			rr.append(r + (hash3(floori(s / 3.0), i, 563) - 0.5) * 0.09)
			out.append(1.0 if hash3(s, i, 564) > 0.5 else -1.0)
		_ring_n.append(n)
		_ring_open.append(open)
		_ring_a.append(angles)
		_ring_grow.append(grow)
		_ring_fade.append(fade)
		_ring_rr.append(rr)
		_ring_out.append(out)
	for rows in range(1, TAB_ROWS + 1):
		for i in rows:
			var u := float(i) / maxi(1, rows - 1)
			_u.append(u)
			_prof.append(_profile(u))
	for k in 8:
		for j in 8:
			_gout.append(hypot2(float(k), float(j) * 1.2))


# =============================================================================================================================
# THE NUMBERS' OWN WAYS

## Math.round: to the nearest whole number, a half up (also below nought: -2.5 to -2).
static func _jsr(v: float) -> int:
	var f := floori(v)
	if v - f >= 0.5:
		f += 1
	return f


## Is a number far enough from a half that adding a whole number to it rounds as it does by itself? (Where it is, a run of
## the game's pixels, each rounded for itself, is that many in a row.)
static func _whole(v: float) -> bool:
	return absf(v - floorf(v) - 0.5) > 1e-6


## clamp01 (art/fleshmancer_action_fx.ts).
static func clamp01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


## smooth.
static func smooth(u: float) -> float:
	var k := clamp01(u)
	return k * k * (3.0 - 2.0 * k)


## The game's noise (art/kit.ts hash): three whole numbers to one from 0 to 1, by 32-bit sums that wrap.
static func hash3(x: int, y: int, k: int) -> float:
	var h := (x * 374761393 + y * 668265263 + k * 2147483647) & 0xFFFFFFFF
	h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
	return (h ^ (h >> 16)) / 4294967296.0


## Math.hypot of two numbers, as the game's engine makes it (each as a share of the greater, squared and summed, the root,
## times the greater): not the same in its last bit as the root of the sum of the squares.
static func hypot2(a: float, b: float) -> float:
	a = absf(a)
	b = absf(b)
	var m := maxf(a, b)
	if m == 0.0:
		return 0.0
	var p := a / m
	var q := b / m
	return sqrt(p * p + q * q) * m


## render/act1_fx/fm.ts room.
static func room(r: float, up: int) -> Array[int]:
	var hw := ceili(45.3 * r) + 12
	var hh := ceili(22.7 * r) + 12
	return [hw * 2, hh * 2 + up, hw, hh + up]


## ringBurst: when a ring's hands burst up, seconds into his rings (the first, third and fifth at his first slam).
static func ring_burst(i: int) -> float:
	return (RING_HITS[0] if i % 2 == 0 else RING_HITS[1]) + floorf(i / 2.0) * RING_RIPPLE


## ringHands: [how many places for a hand round ring i, its two gaps' middles (radians round, from the way he faced)].
static func ring_hands(i: int) -> Array[float]:
	var n := _jsr((TAU * RING_RADII[i]) / RING_APART)
	var g0 := fmod(i * RING_TURN + 0.6, TAU)
	return [float(n), g0, g0 + PI]


## fireWay, miniWay: which way the stream pours `t` seconds into the fire (radians to his left of the way he faces); NAN
## while it does not.
static func fire_way(t: float, mini: bool) -> float:
	var hit := MINI_HIT if mini else FIRE_HIT
	var stop := MINI_STOP if mini else FIRE_STOP
	if t < hit - 1e-6 or t > stop + 1e-6:
		return NAN
	var k := clamp01((t - hit) / (stop - hit))
	if mini:
		return MINI_WHIP_FROM + MINI_WHIP_ROUND * (1.0 - pow(1.0 - k, MINI_WHIP_EASE))
	return WHIP_FROM + WHIP_ROUND * (1.0 - pow(1.0 - k, WHIP_EASE))


## fireLanes: the lanes the fire leaves burning: [the way the first burns, when the stream passed it, the second's, ...].
static func fire_lanes(mini: bool) -> PackedFloat64Array:
	var hit := MINI_HIT if mini else FIRE_HIT
	var stop := MINI_STOP if mini else FIRE_STOP
	var from := MINI_WHIP_FROM if mini else WHIP_FROM
	var around := MINI_WHIP_ROUND if mini else WHIP_ROUND
	var easing := MINI_WHIP_EASE if mini else WHIP_EASE
	var every: float = (MINI_FIRE if mini else FIRE)[3]
	var out := PackedFloat64Array()
	var n := floori(around / every + 1e-6)
	for k in n + 1:
		var a := from + k * every
		# (when it got there: the whip's ease undone)
		var u := 1.0 - pow(1.0 - (a - from) / around, 1.0 / easing)
		out.append(a)
		out.append(hit + u * (stop - hit))
	return out


## render/act1_fx/fm.ts jaws: [tiles before him, tiles to his left, picture pixels up], `t` seconds into his fire.
static func jaws(t: float) -> Array[float]:
	var k := maxi(0, mini(120, floori(t * 30.0))) * 3
	return [_jaws[k], _jaws[k + 1], _jaws[k + 2]]


## flame: how wide a flame is `u` of the way up it (full at its foot, round under it; then licking up to its tip).
static func _profile(u: float) -> float:
	if u < 0.22:
		var v := (0.22 - u) / 0.22
		return sqrt(maxf(0.0, 1.0 - v * v * 0.7))
	return pow(cos(((u - 0.22) / 0.78) * (PI / 2.0)), 0.75)


# =============================================================================================================================
# THE PICTURE PAINTED ON (engine/px.ts Px: plain pixels, each set whole; what falls outside it is not painted)

var img: Image
var w := 0
var h := 0
## (how far it has been painted, or a little further: what it is cut down to, `cut`)
var _x0 := 1 << 30
var _y0 := 1 << 30
var _x1 := -(1 << 30)
var _y1 := -(1 << 30)
## (render/act1_fx/live.ts picAt, picAtFacing: where a floor point is on the picture)
var _ax := 0.0
var _ay := 0.0
var _turned := false
var _fx := 1.0
var _fy := 0.0
var _fxh := 1.0
var _fyh := 0.0
## (where `at` last put a point)
var qx := 0.0
var qy := 0.0
## (shardsAt: the shards now)
var _sn := 0
var _sx := PackedFloat64Array()
var _sy := PackedFloat64Array()
var _sz := PackedFloat64Array()
var _sa := PackedFloat64Array()
var _sk := PackedFloat64Array()
var _sstate := PackedInt32Array()
var _sfan := PackedInt32Array()


func _init(room_of: Array[int]) -> void:
	w = room_of[0]
	h = room_of[1]
	_ax = room_of[2]
	_ay = room_of[3]
	img = Image.create_empty(w, h, false, Image.FORMAT_RGBA8)


## picAtFacing: painted as one facing +x with his left along -y, turned to one facing (fx, fy) drawn with `hand`.
func facing(fx: float, fy: float, hand: int) -> void:
	_turned = true
	_fx = fx
	_fy = fy
	_fxh = fx * hand
	_fyh = fy * hand


## A floor point (tiles from the picture's floor point) and a height over it (picture pixels) to the picture: into qx, qy.
func at(x: float, y: float, z: float = 0.0) -> void:
	if _turned:
		# (art: x before him, -y to his left)
		var left := -y
		var bx := _fx * x + _fyh * left
		var by := _fy * x - _fxh * left
		qx = _ax + 32.0 * (bx - by)
		qy = _ay + 16.0 * (bx + by) - z
	else:
		qx = _ax + 32.0 * (x - y)
		qy = _ay + 16.0 * (x + y) - z


## Px.set: one pixel.
func _pixel(x: int, y: int, c: Color) -> void:
	img.fill_rect(Rect2i(x, y, 1, 1), c)
	_grow(x, y, x, y)


## What is painted reaches so far.
func _grow(x0: int, y0: int, x1: int, y1: int) -> void:
	if x0 < _x0:
		_x0 = x0
	if y0 < _y0:
		_y0 = y0
	if x1 > _x1:
		_x1 = x1
	if y1 > _y1:
		_y1 = y1


## dot (art/fleshmancer_action_fx.ts): a square of `size` pixels at a point of the picture, rounded.
func dot(x: float, y: float, c: Color, size: int = 1) -> void:
	var px := floori(x)
	if x - px >= 0.5:
		px += 1
	var py := floori(y)
	if y - py >= 0.5:
		py += 1
	px -= size >> 1
	py -= size >> 1
	img.fill_rect(Rect2i(px, py, size, size), c)
	if px < _x0:
		_x0 = px
	if py < _y0:
		_y0 = py
	if px + size - 1 > _x1:
		_x1 = px + size - 1
	if py + size - 1 > _y1:
		_y1 = py + size - 1


## The picture cut down to what is painted of it: [the picture, where its corner lies in the whole one], or [null, (0, 0)]
## where nothing is. (Cut on a grid of 32 pixels, so that from one frame to the next it is seldom of another size, and the
## texture it is shown by can be kept.)
func cut() -> Array:
	var x0 := maxi(_x0 & ~31, 0)
	var y0 := maxi(_y0 & ~31, 0)
	var x1 := mini(_x1 | 31, w - 1)
	var y1 := mini(_y1 | 31, h - 1)
	if x1 < x0 or y1 < y0:
		return [null, Vector2i.ZERO]
	return [img.get_region(Rect2i(x0, y0, x1 - x0 + 1, y1 - y0 + 1)), Vector2i(x0, y0)]


# =============================================================================================================================
# THE SHARDS (art/fleshmancer_action_fx.ts)

## shardsAt: the shards `t` seconds into his shards, both fans aimed along `aim` (radians on the floor): where each is (tiles
## from his middle, and up), the way it points, what it is doing and how far through. Into _sx, _sy, ...
func _shards_at(t: float, aim: float) -> void:
	_sx.clear()
	_sy.clear()
	_sz.clear()
	_sa.clear()
	_sk.clear()
	_sstate.clear()
	_sfan.clear()
	for fan in 2:
		var d0 := SHARD_DRAW[fan * 2]
		var d1 := SHARD_DRAW[fan * 2 + 1]
		var hit := SHARD_HITS[fan]
		var n := SHARD_FAN[fan]
		for j in n:
			# (shardAngles)
			var a := aim + ((j - (n - 1) / 2.0) * SHARD_APART * PI) / 180.0
			var ux := cos(a)
			var uy := sin(a)
			# (each drawn up a little after the one beside it, from the middle out)
			var lag := absf(j - (n - 1) / 2.0) * 0.012
			var rise := (t - d0 - lag) / (d1 - d0 - 0.06)
			if rise <= 0.0:
				continue
			var hr := SHARD_HANG_R
			if t < hit:
				var k := smooth(rise)
				# (up out of the floor where it will hang, turning from upright to its way)
				_shard(ux * hr, uy * hr, SHARD_HANG_Z * (1.0 - (1.0 - k) * (1.0 - k)), a, RISING if rise < 1.0 else HANGING, k, fan)
				continue
			var d := hr + SHARD_SPEED * (t - hit)
			var end := SHARD_REACH
			if d < end:
				_shard(ux * d, uy * d, SHARD_HANG_Z - (SHARD_HANG_Z - 10.0) * clamp01((d - hr) / 3.0), a, FLYING, (d - hr) / (end - hr), fan)
			else:
				var tb := t - hit - (end - hr) / SHARD_SPEED
				if tb < SHARD_BURST:
					_shard(ux * end, uy * end, 10.0, a, BURST, tb / SHARD_BURST, fan)
	_sn = _sx.size()


func _shard(x: float, y: float, z: float, a: float, state: int, k: float, fan: int) -> void:
	_sx.append(x)
	_sy.append(y)
	_sz.append(z)
	_sa.append(a)
	_sk.append(k)
	_sstate.append(state)
	_sfan.append(fan)


## shardPix: a shard on the picture, its point at (x, y), pointing along (ux, uy) on the picture; `big` its length's share;
## lit pink at `heat`; `sd`: its seed (which shard it is).
func _shard_pix(x: float, y: float, ux: float, uy: float, big: float, heat: float, sd: int) -> void:
	var length := _jsr(30.0 * big)
	var nx := -uy
	var ny := ux
	# (its lit side: toward the upper left)
	if nx + ny > 0.0:
		nx = -nx
		ny = -ny
	for s in length + 1:
		var u := float(s) / length
		var wide := 3.4 * big * pow(u, 0.62) * ((1.0 - (u - 0.85) * 2.4) if u > 0.85 else 1.0)
		var bend := sin(u * 3.1 + sd)
		var cx := x - ux * s + nx * bend * 0.6
		var cy := y - uy * s + ny * bend * 0.6
		var half := ceili(wide)
		for o in range(-half, half + 1):
			if absi(o) > wide + 0.35:
				continue
			var lit := o / maxf(1.0, wide)
			var c := BONE0 if u < 0.08 else (BONE0 if lit < -0.35 else (BONE1 if lit < 0.3 else (BONE2 if lit < 0.75 else (F2 if heat > 0.3 else BONE3))))
			dot(cx + nx * o, cy + ny * o, c)
		# (its broken end glowing)
		if u > 0.86:
			dot(cx, cy, F4 if heat > 0.5 else F3)


## paintShards: THE SHARDS `t` seconds into his shards, aimed along `aim`, from his middle at (cx, cy) tiles: `air` false,
## their lanes and shadows; true, the shards. `only`: that fan alone (each fan is aimed by itself: render/act1_fx/fm.ts).
func shards(t: float, cx: float, cy: float, aim: float, air: bool, only: int = -1) -> void:
	_shards_at(t, aim)
	for i in _sn:
		var fan := _sfan[i]
		if only >= 0 and fan != only:
			continue
		var state := _sstate[i]
		var k := _sk[i]
		var sx := cx + _sx[i]
		var sy := cy + _sy[i]
		at(sx, sy)
		var fx := qx
		var fy := qy
		var ux := cos(_sa[i])
		var uy := sin(_sa[i])
		if not air:
			if state == HANGING or state == RISING:
				# ITS LANE, marked on the floor in his pink: dashes out along its way, pulsing faster as the hit comes
				var hit := SHARD_HITS[fan]
				var beat := 0.6 + 0.4 * sin(t * (14.0 + 30.0 * clamp01(1.0 - (hit - t) / 0.5)) + i)
				var lit := k * beat
				var c := F3 if lit > 0.75 else (F2 if lit > 0.45 else (F1 if lit > 0.2 else CHAR2))
				for n in _lane_d.size():
					if hash3(_lane_h[n], i, 551) < _lane_far[n]:
						continue
					var d := _lane_d[n]
					at(cx + ux * d, cy + uy * d)
					dot(qx, qy, c, 2)
				# (and the crack it was drawn up out of)
				if state == RISING:
					for j in range(-4, 5):
						dot(fx + j, fy + _jsr(sin(float(j + i)) * 0.8), F3 if absi(j) < 2 else INK)
			if state != BURST:
				# its shadow, under it
				for j in range(-3, 4):
					dot(fx + j, fy, INK)
				for j in range(-2, 3):
					dot(fx + j, fy + 1.0, INK)
			continue
		at(sx, sy, _sz[i])
		var px := qx
		var py := qy
		# (the way it points on the picture)
		at(sx + ux * 0.2, sy + uy * 0.2, _sz[i])
		var wx := qx - px
		var wy := qy - py
		if state == RISING:
			# (drawn up point first, turning to its way as it comes up)
			wx = wx * k
			wy = wy * k - (1.0 - k) * 4.0
		var wl := hypot2(wx, wy)
		if wl == 0.0 or is_nan(wl):
			wl = 1.0
		wx /= wl
		wy /= wl
		if state == BURST:
			# BURST where it ends: a flash and chips of bone flung up
			if k < 0.3:
				var r := 0
				while r < 6.0 - 10.0 * k:
					for a in 8:
						dot(px + cos(float(a)) * r * 1.4, py + sin(float(a)) * r * 0.8, WHITE if r < 2 else F3)
					r += 1
			for j in 6:
				var th := hash3(j, i, 552) * TAU
				var sp := 14.0 + 18.0 * hash3(j, i, 553)
				var z := 30.0 * k * (1.0 - k) * 4.0 * hash3(j, i, 554)
				dot(px + cos(th) * sp * k, py + sin(th) * sp * k * 0.5 - z, BONE1 if j % 2 == 1 else BONE2, 2)
			continue
		if state == FLYING:
			# A STREAK OF FIRE BEHIND IT, and its after-images along the way it came
			var tail := 26.0 + 6.0 * sin(t * 40.0 + i)
			var d := 6
			while d < tail:
				var u := d / tail
				var c := F4 if u < 0.25 else (F3 if u < 0.5 else (F2 if u < 0.8 else F1))
				var wob := sin(d * 0.8 - t * 50.0 + i) * 0.8 * u
				dot(px - wx * d - wy * wob, py - wy * d + wx * wob, c, 2 if u < 0.45 else 1)
				d += 1
		else:
			# hanging: lit from round it by his pink, trembling
			var g := 0.5 + 0.5 * sin(t * 23.0 + i * 1.7)
			for a in 10:
				var th := (a / 10.0) * TAU + t * 3.0
				if hash3(a, i + floori(t * 12.0), 555) > 0.55:
					continue
				dot(px - wx * 10.0 + cos(th) * 11.0, py - wy * 10.0 + sin(th) * 7.0, F2 if g > 0.5 else F1)
		var shake := float(_jsr(sin(t * 41.0 + i * 2.3) * 0.7)) if state == HANGING else 0.0
		_shard_pix(px + shake, py, wx, wy, (0.6 + 0.4 * k) if state == RISING else 1.0, 1.0, i)


# =============================================================================================================================
# THE RINGS (art/fleshmancer_action_fx.ts)

## paintRingCracks: THE RINGS' CRACKS IN THE FLOOR `t` seconds into his rings, round his middle (cx, cy), the move aimed
## along `aim`.
func ring_cracks(t: float, cx: float, cy: float, aim: float) -> void:
	if t < RING_LIT:
		return
	for i in RING_RADII.size():
		var r := RING_RADII[i]
		var burst := ring_burst(i)
		var first := i % 2 == 0
		var since := t - burst
		if since > 1.6:
			continue
		# (how hot: lit from when he rises, the first slam's rings hot, the others dim until the first slam; dark once their
		# hands are up, gone after)
		var up := smooth((t - RING_LIT - i * 0.05) / 0.3)
		var pulse := 0.75 + 0.25 * sin(t * (16.0 + 20.0 * clamp01(1.0 - absf(burst - t) / 0.5)) + i)
		var heat := clamp01(1.0 - since / 0.25) if since >= 0.0 else ((up * pulse) if (first or t > RING_HITS[0]) else 0.38 * up)
		var fade := (1.0 - (since - 0.9) / 0.7) if since > 0.9 else 1.0
		var n := _ring_n[i]
		var open := _ring_open[i]
		var angles := _ring_a[i]
		var grow := _ring_grow[i]
		var fading := _ring_fade[i]
		var jagged := _ring_rr[i]
		var outs := _ring_out[i]
		var core := F4 if heat > 0.85 else (F3 if heat > 0.6 else (F2 if heat > 0.3 else (F1 if heat > 0.12 else INK)))
		var warm := heat > 0.3
		var hot := heat > 0.6
		var lip := F2 if hot else F1
		# (the whole of the picture is its to paint on: the rings reach to its edges)
		_grow(0, 0, w - 1, h - 1)
		for s in n:
			if open[s] == 0:
				continue
			# (its reach round: grown out from the side nearest him first)
			if up < 1.0 and grow[s] > up:
				continue
			if fade < 1.0 and fading[s] > fade:
				continue
			var a := angles[s]
			var rr := jagged[s]
			at(cx + cos(aim + a) * rr, cy + sin(aim + a) * rr)
			var x := floori(qx)
			if qx - x >= 0.5:
				x += 1
			var y := floori(qy)
			if qy - y >= 0.5:
				y += 1
			# (a crack two pixels wide, its heart his fire, lit up out of it, its lip dark)
			img.fill_rect(Rect2i(x - 1, y - 1, 2, 2), core)
			img.fill_rect(Rect2i(x, _jsr(qy + 2.0), 1, 1), INK)
			if warm:
				img.fill_rect(Rect2i(x, _jsr(qy - 1.0), 1, 1), lip)
			if hot and s % 3 == 0:
				img.fill_rect(Rect2i(x, _jsr(qy - 2.0), 1, 1), F1)
			# (short cracks branching off it)
			if s % 11 == 0:
				var out := outs[s]
				for k in range(1, 6):
					var b := aim + a + 0.01 * k
					var rb := rr + out * k * 0.035
					at(cx + cos(b) * rb, cy + sin(b) * rb)
					img.fill_rect(Rect2i(_jsr(qx), _jsr(qy), 1, 1), F2 if (k < 3 and warm) else INK)
		# THE BURST: a flash of his fire round the ring as its hands come up
		if since >= 0.0 and since < 0.2:
			var k := since / 0.2
			var s := 0
			while s < n:
				if hash3(s, i, 565) >= k:
					var a := angles[s]
					at(cx + cos(aim + a) * r, cy + sin(aim + a) * r, 2.0 + 8.0 * k)
					img.fill_rect(Rect2i(_jsr(qx), _jsr(qy), 1, 1), WHITE if k < 0.4 else F3)
				s += 2


# =============================================================================================================================
# THE FIRE (art/fleshmancer_action_fx.ts)

## ptAt (paintFire, paintFlames): the floor point `d` tiles from him, `a` radians to the left of the way he faces along
## `aim`, `z` picture pixels up, on the picture: into qx, qy.
func _pt(cx: float, cy: float, aim: float, a: float, d: float, z: float = 0.0) -> void:
	var way := aim + -a
	at(cx + cos(way) * d, cy + sin(way) * d, z)


## paintFire: THE FIRE `t` seconds into his fire (or the mini fleshmancer's), from him at (cx, cy) facing `aim` (radians on
## the floor), the stream pouring out of the mouth (mx, my: a point on the picture; `mouth` false: none). `air` false: the
## char under the lanes; true: his flames (art/fm2_switch.ts FLESH2, on: paintFlames).
func fire(t: float, cx: float, cy: float, aim: float, mouth: bool, mx: float, my: float, air: bool, mini: bool) -> void:
	if air:
		_flames(t, cx, cy, aim, mouth, mx, my, mini)
		return
	var size := MINI_FIRE if mini else FIRE
	var land := size[0]
	var reach := size[1]
	var lane_half := size[4]
	var burn := size[5]
	var scorch := size[7]
	var lanes := _lanes[1 if mini else 0]
	# THE LANES LEFT BURNING
	for li in lanes.size() >> 1:
		var since := t - lanes[li * 2 + 1]
		if since < 0.0 or since > burn + scorch:
			continue
		var d := land
		while d <= reach:
			var here := d
			d += 0.14
			for o in range(-1, 2):
				var off := (o * lane_half * 0.7) / maxf(here, 0.5)
				var sd := floori(here * 20.0) * 3 + o + li * 101
				# (the char under it, thinning away as it cools)
				if since > burn and hash3(sd, 1, 571) < (since - burn) / scorch:
					continue
				_pt(cx, cy, aim, lanes[li * 2] + off, here + o * 0.03)
				dot(qx, qy, CHAR[(sd & 3) % 3], 2)
				dot(qx + 1.0, qy + 1.0, CHAR0)


## flame: A FLAME standing at (x, y) on the picture, `tall` and `wide` pixels: round and full at its foot, licking up to a
## tip that sways and forks, its sides rippling upward with the clock `t`; shells from his pink at its rim to gold and white
## at its heart (`hot`). `sd`: its seed, by which its noise is its own.
func _flame(x: float, y: float, tall: float, wide: float, t: float, sd: int, hot: float) -> void:
	if tall < 3.0 or wide < 2.0:
		return
	var sway := sin(t * 6.0 + sd * 1.7) * wide * 0.35
	var t14 := t * 14.0
	var w12 := wide / 12.0
	var notch := sin(t * 9.0 + sd) * 1.5
	var one_by_one := literal
	# (it reaches no further than this: its rows, its heart, its lick, its embers)
	_grow(floori(x - 1.05 * wide) - 5, floori(y - 2.2 * tall - 0.18 * wide) - 5, ceili(x + 1.05 * wide) + 5, ceili(y + 0.18 * wide) + 3)
	for si in 5:
		var s := SHELL_S[si]
		var c := SHELL_C[si]
		var rows := maxi(1, _jsr(tall * (0.32 + 0.68 * s)))
		var us := _u
		var profs := _prof
		var from := (rows * (rows - 1)) >> 1
		if rows > TAB_ROWS:
			# (taller than the shapes worked out beforehand: worked out here)
			us = PackedFloat64Array()
			profs = PackedFloat64Array()
			from = 0
			for i in rows:
				us.append(float(i) / (rows - 1))
				profs.append(_profile(us[i]))
		var half := (wide / 2.0) * s
		var lift := (1.0 - s) * tall * 0.06
		var forked := s >= 0.88
		for i in rows:
			var u := us[from + i]
			# (full at its foot, round under it; then licking up)
			var ripple := sin(u * 8.0 - t14 + sd) * (0.6 + 1.8 * u) * w12
			var hw := maxf(0.5, half * profs[from + i])
			var mid := x + sway * u * u + ripple
			var yv := y - i - lift
			var yy := floori(yv)
			if yv - yy >= 0.5:
				yy += 1
			var xv := mid - hw
			var x0 := floori(xv)
			if xv - x0 >= 0.5:
				x0 += 1
			xv = mid + hw
			var x1 := floori(xv)
			if xv - x1 >= 0.5:
				x1 += 1
			if not (forked and u > 0.68):
				if one_by_one:
					for px in range(x0, x1 + 1):
						_pixel(px, yy, c)
				else:
					img.fill_rect(Rect2i(x0, yy, x1 - x0 + 1, 1), c)
				continue
			# (its tip forked: a notch up its middle near the top of its outer flame: the pixels within `fork` of the notch's
			# middle are left out)
			var fork := hw * 0.55 * ((u - 0.68) / 0.32)
			if one_by_one:
				for px in range(x0, x1 + 1):
					if fork > 0.0 and absf(px - mid - notch) < fork:
						continue
					_pixel(px, yy, c)
				continue
			# (the pixels left out are a run: found from just before it, by the game's own test of each)
			var px := maxi(x0, floori(mid + notch - fork) - 1)
			while px <= x1 and px - mid - notch <= -fork:
				px += 1
			if px > x0:
				img.fill_rect(Rect2i(x0, yy, px - x0, 1), c)
			while px <= x1 and px - mid - notch < fork:
				px += 1
			if px <= x1:
				img.fill_rect(Rect2i(px, yy, x1 - px + 1, 1), c)
	if hot > 0.2:
		# (its heart white, low in it)
		var hr := maxi(1, _jsr(wide * 0.12 * hot))
		var high := _jsr(tall * 0.22)
		if not one_by_one and _whole(x) and _whole(y):
			if high > 0:
				img.fill_rect(Rect2i(_jsr(x) - hr, _jsr(y) - 2 - (high - 1), hr * 2 + 1, high), WHITE)
		else:
			for j in high:
				for px in range(-hr, hr + 1):
					_pixel(_jsr(x + px), _jsr(y - 2.0 - j), WHITE)
	# (a lick torn off its tip, rising, and an ember or two)
	var life := fmod(t * 1.7 + hash3(sd, 7, 581), 1.0)
	if life < 0.6:
		var ly := y - tall * (0.85 + life * 0.9)
		var lx := x + sway + sin(life * 9.0 + sd) * 2.0
		var r := maxi(1, _jsr(wide * 0.18 * (1.0 - life)))
		var c := F2 if life < 0.3 else F1
		if not one_by_one and _whole(lx) and _whole(ly):
			var mx := _jsr(lx)
			var my := _jsr(ly)
			for j in range(-r, r + 1):
				# (how far to either side the round of it reaches on this row)
				var m := r
				while m * m + j * j > r * r:
					m -= 1
				img.fill_rect(Rect2i(mx - m, my + j, m * 2 + 1, 1), c)
		else:
			for j in range(-r, r + 1):
				for px in range(-r, r + 1):
					if px * px + j * j <= r * r:
						_pixel(_jsr(lx + px), _jsr(ly + j), c)
	for e in 2:
		var el := fmod(t * (0.9 + 0.4 * e) + hash3(sd, e, 582), 1.0)
		var ex := x + (hash3(sd, e + 3, 582) - 0.5) * wide * 1.6 + sin(el * 7.0 + e) * 3.0
		var ey := y - tall * 0.6 - el * tall * 1.6
		if hash3(sd, e + 9, 582) < 0.6:
			img.fill_rect(Rect2i(_jsr(ex), _jsr(ey), 1, 1), F4 if el < 0.5 else F3)


## paintFlames: his fire's flames: the lanes left burning, and the stream out of the jaws whipped round.
func _flames(t: float, cx: float, cy: float, aim: float, mouth: bool, mx: float, my: float, mini: bool) -> void:
	var size := MINI_FIRE if mini else FIRE
	var land := size[0]
	var reach := size[1]
	var half := size[2]
	var lane_half := size[4]
	var burn := size[5]
	var die := size[6]
	var big := 0.75 if mini else 1.0
	var lanes := _lanes[1 if mini else 0]
	var beat := floori(t * 12.0)
	# THE LANES LEFT BURNING: a bed of embers along each, and flames standing on it, close enough to run together
	for li in lanes.size() >> 1:
		var la := lanes[li * 2]
		var since := t - lanes[li * 2 + 1]
		if since < 0.0 or since > burn:
			continue
		# (it dies back from its end toward him)
		var out := reach if since < burn - die else land + (reach - land) * clamp01(1.0 - (since - (burn - die)) / die)
		var fresh := clamp01(1.0 - since / 0.35)
		var d := land
		while d <= out:
			var here := d
			d += 0.09
			_pt(cx, cy, aim, la, here)
			var sd := floori(here * 40.0) + li * 101
			dot(qx + (hash3(sd, 1, 583) - 0.5) * 6.0, qy, F1 if hash3(sd, beat, 584) < 0.5 else F2, 2)
		d = land + 0.12
		while d <= out:
			var here := d
			d += 0.3
			var off := ((hash3(floori(here * 10.0), li, 585) - 0.5) * lane_half * 1.2) / maxf(here, 0.5)
			_pt(cx, cy, aim, la + off, here)
			var sd := floori(here * 10.0) * 7 + li * 131
			var flick := 0.75 + 0.25 * sin(t * 17.0 + sd * 1.3)
			var end := (clamp01((out - here) / 0.6) * 0.8 + 0.2) if here > out - 0.6 else 1.0
			var tall := big * (17.0 + 13.0 * hash3(sd, 3, 586)) * flick * (1.0 + 0.6 * fresh) * end
			_flame(qx, qy, tall, big * (11.0 + 5.0 * hash3(sd, 4, 587)) * (0.8 + 0.2 * end), t, sd, 0.5 + 0.5 * fresh)
	var now := fire_way(t, mini)
	if is_nan(now) or not mouth:
		return
	var hit := MINI_HIT if mini else FIRE_HIT
	# THE STREAM: the whip's after-images, low and dull, then the stream itself, a roaring river of flame thick near him
	for back: int in [2, 1]:
		var a := fire_way(maxf(hit, t - back / 30.0), mini)
		if is_nan(a):
			a = now
		if absf(a - now) < 0.05:
			continue
		var d := land
		while d <= reach:
			_pt(cx, cy, aim, a, d)
			dot(qx, qy - 3.0, F2 if back == 1 else F1, 3)
			d += 0.3
	_pt(cx, cy, aim, now, land)
	var lx := qx
	var ly := qy
	# (out of the jaws, arcing down onto the floor: a gout, round and roiling)
	var midx := (mx + lx) / 2.0
	var midy := minf(my, ly) - 16.0 * big
	for i in 27:
		var u := i / 26.0
		var x := (1.0 - u) * (1.0 - u) * mx + 2.0 * u * (1.0 - u) * midx + u * u * lx
		var y := (1.0 - u) * (1.0 - u) * my + 2.0 * u * (1.0 - u) * midy + u * u * ly
		var r := big * (3.0 + 3.0 * u + sin(t * 37.0 + i) * 0.8)
		var far := ceili(r)
		_grow(floori(x) - far - 1, floori(y) - far - 1, ceili(x) + far + 1, ceili(y) + far + 1)
		if literal or far > 7 or not (_whole(x) and _whole(y)):
			for k in range(-far, far + 1):
				for j in range(-far, far + 1):
					var q := hypot2(float(k), j * 1.2) / r
					if q > 1.0:
						continue
					img.fill_rect(Rect2i(_jsr(x + k), _jsr(y + j), 1, 1), WHITE if q < 0.35 else (F4 if q < 0.6 else (F3 if q < 0.82 else F2)))
			continue
		# (a row of it at a time: how far to either side each of its colours reaches, the hotter laid over the cooler)
		var px := _jsr(x)
		var py := _jsr(y)
		for j in range(-far, far + 1):
			var n2 := 0
			var n3 := 0
			var n4 := 0
			var nw := 0
			for k in far + 1:
				var q := _gout[k * 8 + absi(j)] / r
				if q > 1.0:
					break
				n2 += 1
				if q < 0.82:
					n3 += 1
					if q < 0.6:
						n4 += 1
						if q < 0.35:
							nw += 1
			if n2 == 0:
				continue
			img.fill_rect(Rect2i(px - n2 + 1, py + j, n2 * 2 - 1, 1), F2)
			if n3 > 0:
				img.fill_rect(Rect2i(px - n3 + 1, py + j, n3 * 2 - 1, 1), F3)
			if n4 > 0:
				img.fill_rect(Rect2i(px - n4 + 1, py + j, n4 * 2 - 1, 1), F4)
			if nw > 0:
				img.fill_rect(Rect2i(px - nw + 1, py + j, nw * 2 - 1, 1), WHITE)
	var d := reach
	while d >= land:
		var far := (d - land) / (reach - land)
		for o in range(-1, 2):
			var off := (o * half * 0.6) / maxf(d, 0.5)
			_pt(cx, cy, aim, now + off, d)
			var sd := floori(d * 10.0) * 5 + o + 900
			var tall := big * (30.0 + 22.0 * (1.0 - far)) * (0.8 + 0.2 * sin(t * 29.0 + sd))
			_flame(qx, qy, tall * (1.0 if o == 0 else 0.65), big * (13.0 + 7.0 * (1.0 - far)), t, sd, 1.0 if o == 0 else 0.5)
		d -= 0.2


# =============================================================================================================================
# AS THE GAME LAYS THEM (render/act1_fx/fm.ts FX.ground, the `floor` picture, under the figures; FX.standing, the `air`
# picture, among them): each on a picture of its room, its floor point the peril's, painted at `t` seconds of its clock

## His shards: each fan by its own aim, the second's once it has one (`aim2`: NAN until it is drawn up).
static func shards_painted(t: float, aim: float, aim2: float, air: bool) -> RefCounted:
	var c := new(SHARD_ROOM)
	c.shards(t, 0.0, 0.0, aim, air, 0)
	if is_finite(aim2):
		c.shards(t, 0.0, 0.0, aim2, air, 1)
	return c


## His rings' cracks.
static func rings_painted(t: float, aim: float) -> RefCounted:
	var c := new(RING_ROOM)
	c.ring_cracks(t, 0.0, 0.0, aim)
	return c


## His fire, or a mini fleshmancer's (`mini`), painted in the frame of one facing (fx, fy), drawn with `hand`; its mouth at
## the skull's jaws (a mini's: between his claws, a fixed place).
static func fire_painted(t: float, fx: float, fy: float, hand: int, mini: bool, air: bool) -> RefCounted:
	var c := new(MINI_ROOM if mini else FIRE_ROOM)
	c.facing(fx, fy, hand)
	if not air:
		c.fire(t, 0.0, 0.0, 0.0, false, 0.0, 0.0, false, mini)
		return c
	var j: Array[float] = [0.35, -0.2, 40.0]
	if not mini:
		j = jaws(t)
	c.at(j[0], -j[1], j[2])
	c.fire(t, 0.0, 0.0, 0.0, true, c.qx, c.qy, true, mini)
	return c


## The picture of frame `k` of one of his perils' clocks (30 a second), cut down to what is painted: [the picture or null
## (nothing painted), where its corner lies from the peril's floor point (picture pixels)].
static func picture(kind: String, k: int, air: bool, aim: float, aim2: float, fx: float, fy: float, hand: int, mini: bool) -> Array:
	var t := k / 30.0
	var c
	match kind:
		"shards":
			c = shards_painted(t, aim, aim2, air)
		"rings":
			c = rings_painted(t, aim)
		_:
			c = fire_painted(t, fx, fy, hand, mini, air)
	var got: Array = c.cut()
	got[1] = Vector2(got[1]) - Vector2(c._ax, c._ay)
	return got


## The pictures of his shards as they run, for a peril that lasts `secs` (perils.gd keeps it with the peril).
static func live_shards(aim: float, secs: float) -> Live:
	var l := Live.new()
	l.kind = "shards"
	l.threads = threads
	l.aim = aim
	l.last = floori(secs * 30.0)
	l.paint = picture
	return l


## The pictures of his rings' cracks as they run.
static func live_rings(aim: float, secs: float) -> Live:
	var l := Live.new()
	l.kind = "rings"
	l.threads = threads
	l.layers = 1
	l.aim = aim
	l.last = floori(secs * 30.0)
	l.paint = picture
	return l


## The pictures of his fire, or a mini fleshmancer's, as they run: the way he faced as he began, the hand he is drawn with.
static func live_fire(face: Vector2, hand: int, mini: bool, secs: float) -> Live:
	var l := Live.new()
	l.kind = "fire"
	l.threads = threads
	l.fx = face.x
	l.fy = face.y
	l.hand = hand
	l.mini = mini
	l.last = floori(secs * 30.0)
	l.paint = picture
	return l


## THE PICTURES OF ONE OF HIS PERILS AS ITS CLOCK RUNS (render/act1_fx/live.ts livePicture: one picture for each layer,
## painted afresh when the frame of its clock changes). Each frame's pictures are painted on the engine's worker threads,
## this frame's and the next AHEAD begun as the clock comes to it, so that each is done by the time its frame comes. THE
## SCREEN NEVER WAITS FOR ONE: a picture not yet done when its frame comes (the clock has jumped, or the machine is busy) is
## shown the moment it is, the one before it staying up till then; a frame gone by before its painting began is not painted.
class Live extends RefCounted:
	## (how many frames ahead of the clock are being painted)
	const AHEAD := 3
	## (his shards' second fan is drawn up from this frame on: no picture after it can be painted until its aim is known)
	const SECOND_FAN := 34
	var kind := ""
	## (how many layers: `floor`, and `air`)
	var layers := 2
	var aim := 0.0
	var aim2 := NAN
	var fx := 1.0
	var fy := 0.0
	var hand := 1
	var mini := false
	## (the last frame of its peril)
	var last := 0
	## (fm_paint.gd picture, and its `threads`)
	var paint: Callable
	var threads := true
	## THE PICTURES NOW, `floor` then `air`: each a texture, or null (nothing is painted), and where its corner lies from
	## the peril's floor point (picture pixels).
	var tex: Array = [null, null]
	var lies: Array[Vector2] = [Vector2.ZERO, Vector2.ZERO]
	## (the frame each layer's picture on the screen is of)
	var _on: Array[int] = [-1, -1]
	var _lock := Mutex.new()
	## (frame * 2 + layer -> what `picture` made of it; -> the task painting it)
	var _made := {}
	var _tasks := {}
	var _now := 0
	var _over := false

	## The clock has come to frame `k` (called every frame of the screen): what has been painted for it is shown, and its
	## pictures and those of the frames after it are begun.
	func frame(k: int) -> void:
		if not threads:
			# (no threads: painted on the spot, every other frame)
			var even := k & ~1
			for layer in layers:
				if _on[layer] != even:
					_show(layer, paint.call(kind, even, layer == 1, aim, aim2, fx, fy, hand, mini))
					_on[layer] = even
			return
		# (the tasks that are done are claimed, as the engine asks)
		for key: int in _tasks.keys():
			if WorkerThreadPool.is_task_completed(_tasks[key]):
				WorkerThreadPool.wait_for_task_completion(_tasks[key])
				_tasks.erase(key)
		# (of the pictures painted, the newest that is not after this frame is shown; those of frames gone by are let go)
		var newest: Array[int] = [-1, -1]
		var show: Array = [null, null]
		_lock.lock()
		_now = k
		for key: int in _made.keys():
			var n := key >> 1
			if n > k:
				continue
			var layer := key & 1
			if n > newest[layer] and n > _on[layer]:
				newest[layer] = n
				show[layer] = _made[key]
			_made.erase(key)
		var have := _made.keys()
		_lock.unlock()
		for layer in layers:
			if show[layer] != null:
				_show(layer, show[layer])
				_on[layer] = newest[layer]
		for n in range(k, k + AHEAD + 1):
			if n > last or (kind == "shards" and n > SECOND_FAN and is_nan(aim2)):
				break
			for layer in layers:
				var key := n * 2 + layer
				if _on[layer] < n and not _tasks.has(key) and not have.has(key):
					_tasks[key] = WorkerThreadPool.add_task(_work.bind(key, aim2), true, "a picture of the Fleshmancer's")

	## Its peril is over: nothing more is painted or shown. The tasks still out, for the caller to claim when they are done
	## (perils.gd _film_free).
	func over() -> Array:
		_lock.lock()
		_over = true
		_made.clear()
		_lock.unlock()
		var out := _tasks.values()
		_tasks.clear()
		tex = [null, null]
		return out

	func _show(layer: int, got: Array) -> void:
		var im: Image = got[0]
		if im == null:
			tex[layer] = null
			return
		var t: ImageTexture = tex[layer]
		if t == null:
			tex[layer] = ImageTexture.create_from_image(im)
		elif t.get_width() == im.get_width() and t.get_height() == im.get_height():
			t.update(im)
		else:
			t.set_image(im)
		lies[layer] = got[1]

	## (on a worker thread) A frame's picture painted, and kept for the screen to take.
	func _work(key: int, second_aim: float) -> void:
		_lock.lock()
		var skip := _over or (key >> 1) < _now
		_lock.unlock()
		if skip:
			return
		var got: Array = paint.call(kind, key >> 1, (key & 1) == 1, aim, second_aim, fx, fy, hand, mini)
		_lock.lock()
		if not _over:
			_made[key] = got
		_lock.unlock()
