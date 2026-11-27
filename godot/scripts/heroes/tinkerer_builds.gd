## THE TINKERER'S BUILDS (asked after the Warlock's, 27 Nov 2026: whether to start on the Tinkerer, his “Yes, the Tinkerer next”). To
## the plan (Tesla Fence and Coin Toss): “I need the tinkerer to get vial changed to Bomb.  Her description at the selection screen
## has bomb in it yet she deploys no bombs”; asked whether the bombs first, then the plan: “Bombs, then the plan (Recommended)”.
##
## WITH IT ON:
##   HER BOMBS: her Vial Toss is a Bomb Toss: the same throw, the same burst where it lands, but a lit bomb tumbling through the
##     air (her Contraption's little bomb) and a bomb's blast where it lands (her Contraption's), its sound a blast's; Mad Mixture's
##     brews still in their colours over it, Cluster's little ones little blasts. Every word of hers that said vial says bomb: the
##     move, her tree (the VIALS path BOMBS, Cluster Vials Cluster Bombs, Tar, Mad Mixture, Alchemy, The Big One, Growth Serum,
##     Contraption), her Contraption's card, her two uniques' (the Tarwrench, the Foreman's Wrench).
##   TESLA FENCE (off Contraption): lightning arcs between every two of her Contraptions set up within FENCE span of each other,
##     every FENCE every seconds, striking every enemy across the line between them for FENCE share of a shot of theirs.
##   COIN TOSS (off Fortune): her tap throws a fan of COIN n gold coins in place of a bomb, each costing COIN cost gold, each striking
##     the first it meets for COIN share of the toss, harder the more gold she carries (each COIN per gold more, up to COIN most
##     times over); with too little gold, a bomb as ever. It changes her tap as Contraption does: one or the other.
## OFF (`--tbuilds=0`): as she was. Checked and pictured: check_tbuilds.gd, `--only=tbuilds`.
extends RefCounted

static var on := false

## Her tree's words (talents.gd _tbuilds): names, cards, and the path's name.
const NAMES := {"clustervials": "Cluster Bombs"}
const TEXT := {
	"clustervials": "Every bomb bursts into three little ones that bounce out and burst again.",
	"tar": "Her bombs leave a puddle of tar for three seconds: whatever walks in it is slowed to a crawl.",
	"madmixture": "Every bomb carries a brew at random, burning, freezing or poisoning, on top of its own words.",
	"contraptions": "Her tap sets down a Contraption in place of the Bomb Toss, three at once. It fires her pick: little bombs (Dexterity) or energy bolts (Int).",
	"alchemy": "An enemy her bombs kill always drops gold.",
	"thebigone": "Every fifth bomb is a big one: it bursts three times as wide and knocks everything down.",
	"growthserum": "A bomb of hers that bursts by her Golem makes it grow: twice as big and twice as strong for five seconds.",
}
const PATH := {"vials": "BOMBS"}
## Her move's words (words.json skills).
const SKILL := {
	"vialtoss": {"name": "Bomb Toss", "desc": "Lob a lit bomb. It blows up where it lands, hurting everything near.", "verb": "TOSS A BOMB"},
	"contraption": {"desc": "Throw down a little mortar. It sets itself up and lobs your bombs at whatever comes near. Up to three at once."},
}
## Her uniques' words (inventory.gd does_of).
const DOES := {
	"stickywrench": ["Bombs stick to what they hit and burst a moment later, twice as wide."],
	"foremanswrench": ["Whenever you toss a bomb, each of your Golems lobs one as well."],
}
## (Tesla Fence) how far apart two Contraptions may stand to be fenced, tiles; how often it strikes; how near the line strikes; its
## share of a shot of theirs
const FENCE := {"span": 7.0, "every": 0.5, "near": 0.6, "share": 0.5}
## (Coin Toss) coins a toss, the fan's spread (radians), each one's gold, its share of the toss, its flight (tiles, tiles a second),
## and how much harder with gold: 1 more for each `per` gold, `most` times in all at most
const COIN := {"n": 5, "spread": 0.5, "cost": 1, "share": 0.45, "range": 7.0, "speed": 14.0, "per": 1000.0, "most": 3.0}
## The new stones (talents.gd _tbuilds), and the two that change her tap: only one of them.
const NODES := {
	"teslafence": {"name": "Tesla Fence", "path": "vials", "from": ["contraptions"], "at": [-0.55, -1.15], "big": false,
		"text": "Lightning arcs between your Contraptions, striking every enemy that crosses the line between two of them."},
	"cointoss": {"name": "Coin Toss", "path": "gold", "from": ["fortune"], "at": [0.0, 1.0], "big": true,
		"text": "Your tap throws a fan of 5 gold coins instead of a bomb, each costing 1 gold. Coins hit harder the more gold you carry: +100% per 1,000 gold, up to +200%. (Contraption or Coin Toss: only one.)"},
}
const ONE_TAP := ["contraptions", "cointoss"]
## (Contraption's card, with Coin Toss beside it)
const CONTRAPTION_ONE := " (Contraption or Coin Toss: only one.)"

## (the VIALS path's rune: a bomb, its fuse lit)
const BOMB_RUNE := ["....o..", "...X...", "..XXX..", ".XXoXX.", "..XXX.."]
## (a bomb's blast, the size of her Contraption's, for each of hers: Cluster's little ones smaller, The Big One's bigger)
const BLAST := {"little": 0.6, "plain": 1.0, "big": 1.8}


## Her moves' words as the switch has them (her kit, as it is made: `S` words.json's skills).
static func words(S: Dictionary) -> void:
	if not on:
		return
	for id in SKILL:
		for k in SKILL[id]:
			S[id][k] = SKILL[id][k]
