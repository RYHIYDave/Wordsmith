## THE BRAWLER REMADE (his ideas, 26 Nov 2026, asked whether to give him a dash: “He needs some work.  I’m not happy with how his
## whole kit works.  I have few ideas tho.  We need a different way to work in the empowered hits that jump provide.  Maybe in the
## talent tree.  And I was thinking that it takes three taps to fill one of his globes with a punch.  Then have a branching talent
## tree where one way has a single tap fills a globe, and the other has attack speed modifiers now affect crit damage at 200% or
## something like that.  Taking either a fast attacking path or a very hard hitting slow path.  Then his swipe can be something like
## an interrupt to the combo, but whatever globe is next is now added to the swipe, so either a flying double hamerfist or a flying
## knee”; asked how many holds fill a globe, “One hold fills it (Recommended)”; to the short plan, “Short plan first (Recommended)”,
## and of its two flying moves: “Send the hammer fist and flying knee to the queue and art chat.  I don’t trust you to do it”).
##
## WITH IT ON (heroes/brawler.gd): every tap a punch, as before (jab, cross, hook), and every third punch lights a punch globe; every
## hold a kick, and every kick lights a kick globe; the globes lit stay till he spends them or has struck nothing for KEEP seconds. A
## SWIPE breaks off whatever he is doing and spends his jump as before: a globe lit, he flies at the enemy where it points with the
## first one (a punch globe the FLYING DOUBLE HAMMERFIST, driving back and staggering all round where he lands, none knocked down; a kick globe the FLYING KNEE, driven
## through the one before him), going as far as LEAP past the move's own carry to reach it; none lit, the hop as before. No tap or
## hold in the jump sets a globe in fire any more. THE FORK in his tree, a stone each side of Stiff Jab, only one of them his: QUICK
## HANDS, every punch lights a globe; HEAVY HANDS, his attack speed no longer makes him faster, each 1% of it HEAVY% more critical
## damage instead. His other talents bent to fit (TEXT). The art chat draws the two flying moves (the queue's
## draw-brawler-hammerfist-and-flying-knee); till then the uppercut's frames stand for the hammerfist, the knee's for the knee (ART).
## OFF: he is exactly as he was. ON for him to try, 26 Nov 2026, asked how to: “I'd like to try the new changes to the brawler.
## How do I do that?”, then “Can you just update the game?”.
extends RefCounted

static var on := true

## (how many punches light a punch globe; Quick Hands: one)
const NEED := 3
## (how long the lit globes stay after his last blow, seconds)
const KEEP := 3.0
## (how much further than its own carry a flying move may go to reach its enemy, tiles)
const LEAP := 3.5
## (Heavy Hands: each 1% of attack speed, this many % of critical damage)
const HEAVY := 2.0
## HOW HEAVY HANDS MAKES HIS CRITICALS HARDER (talked through with him, 26 Nov 2026; fought side by side, his “K let's fight it.  Do
## it the fast hands way and both of our calcs for slow”), `k` his attack speed's pace (2 at +100%):
##   "add"    his first words: each 1% of attack speed 2% more critical damage, added to what he has (HEAVY);
##   "whole"  the main chat's: his whole critical hit k times as hard;
##   "base"   his: the base critical (2.5 times a regular hit) k times as big, and his gear's critical damage multiplying that
##            (“That would take a normal crit 2.5 times your regular damage up to 5 times your regular damage. Then you're
##            multiplying that by your crit damage percent”).
static var HEAVY_MODE := "add"
## (his presses waiting their turn, at most: no combo locks now)
const WAITING := 2
## (the frames each flying move is drawn with till the art chat's come)
const ART := {"hammerfist": "uppercut", "flyknee": "knee"}
const FLYING := ["hammerfist", "flyknee"]

## THE FORK, a stone each side of Stiff Jab (talents.gd tree): only one of the two.
const FORK := {
	"vquickhands": {"name": "Quick Hands", "at": [-1.15, 3.05],
		"text": "Every punch lights a punch globe, not every third. (Quick Hands or Heavy Hands: only one.)"},
	"vheavyhands": {"name": "Heavy Hands", "at": [1.15, 3.05],
		"text": "Attack speed no longer makes him faster: each 1% of it is 2% more critical damage instead. (Quick Hands or Heavy Hands: only one.)"},
}

## His talents bent to fit (their cards).
const TEXT := {
	"vknockdown": "Every third punch in a row knocks everything it hits off its feet: down for two seconds.",
	"vlauncher": "His flying hammerfist throws up everything round where he lands; while they hang in the air, his blows on them land twice as hard.",
	"vlightfeet": "His jump comes back a third sooner: more flying blows.",
	"vfirestarter": "Landing from a plain hop, he lights a punch globe.",
	"vstoke": "Each flying blow that lands takes two seconds off his jump’s wait.",
	"vhangtime": "In the air nothing touches him: through every jump and every flying blow, from take-off to landing.",
	"vfullset": "With all his globes lit, a swipe spends them all: his flying blow lands three times as hard and throws them.",
	"vthunderknee": "His flying knee cracks with lightning: it jumps on to three more enemies near each one it hits, and stuns them.",
}


## The list a move is drawn from: its own once the art chat's are baked in (`lists` naming it), else its stand-in's.
static func art_of(id: String, lists: Array) -> String:
	return id if lists.has(id) else ART.get(id, id)


## The two flying moves put in his numbers (assets/heroes/veteran.json, as loaded): their frames the stand-ins', their rules their
## own (the hammerfist a round blow where he lands that drives back and staggers; the knee the knee's).
static func alias(V: Dictionary) -> void:
	if V.has("_brawler2"):
		return
	V["_brawler2"] = true
	var R: Dictionary = V["rules"]
	# (THE ART CHAT'S OWN TWO, baked in (art/brawler-flying-blows, his “Yes, both are right (Recommended)”): their numbers as the art has
	# them, the hammerfist's ring of force round where his fists strike the floor; what it does to them, driven back and staggered, at
	# his word, and the globes they carry the plain ones)
	if (V["lists"] as Array).has("hammerfist") and R.has("hammerfist"):
		(R["hammerfist"]["force"] as Dictionary)["react"] = "slam"
		R["hammerfist"]["globe"] = "punch"
		R["flyknee"]["globe"] = "kick"
		V["react"]["slam"] = {"back": 1.0, "stagger": 0.5}
		return
	for id in ART:
		V["moves"][id] = V["moves"][ART[id]]
	var hf: Dictionary = (R["uppercut"] as Dictionary).duplicate(true)
	hf["force"] = {"shape": "round", "reach": 2.5, "deg": 360, "long": 4, "react": "slam"}
	hf["share"] = 2.0
	hf["globe"] = "punch"
	R["hammerfist"] = hf
	var fk: Dictionary = (R["knee"] as Dictionary).duplicate(true)
	fk["globe"] = "kick"
	R["flyknee"] = fk
	# (struck, driven back and staggered, not knocked down: his word to its knocking everything down, 26 Nov 2026, “Just don’t have
	# them fall over?  Maybe they stagger or are knocked back but a full stun should be harder and more rare in all instances”)
	V["react"]["slam"] = {"back": 1.0, "stagger": 0.5}
