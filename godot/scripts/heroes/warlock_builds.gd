## THE WARLOCK'S BUILDS (asked after the Brawler's, 27 Nov 2026: whether to start on the Warlock, second weakest, his “Yes, the Warlock
## next”). To the plan: “Well you can also go all in on burns, then take the talent that gives you more damage when your pact is full
## and never transform.  Thats a play style.  We need an all in demon play style.”; Blood Pact's price, his “attacks don’t cost.
## Okay, so what is the cost for blood pact?”, and his pick “Drop Blood Pact”; Embrace made not to be the Unsigned Pact's own, his
## “Yes, build those three (Recommended)”. And his tree: “And I’d like his talent tree to look a little better” (13:37).
##
## WITH IT ON: three new talents, each a way to play:
##   EMBRACE (Pact): as the demon, every kill fills the pact back to full: the demon lasts as long as he keeps killing (with the
##     Unsigned Pact, when the killing stops it feeds on his life).
##   DEVOUR (Demon): a rake on one below DEVOUR below of its life devours it whole: it dies at once, he heals DEVOUR heal of his life,
##     DEVOUR secs back on the pact; a boss is not devoured, it takes the rake DEVOUR boss times over.
##   SOUL LINK (Man): every cursed enemy is linked: LINK share of each hit of his on one cursed is dealt to every other cursed within
##     LINK far.
## His tree laid out again as a claw: the palm (Blazing Arm), a thumb above and below (the demon's and the man's first talents), three
## talons fanning out (the demon's, the pact's, the man's), each ending in its biggest talent; every twig off the outside of its own.
## OFF (`--wbuilds=0`): as he was. Checked and pictured: check_wbuilds.gd, `--only=wbuilds`.
extends RefCounted

## Switched on at his word, 27 Nov 2026, by 13:54, asked after the tree before and after, the cards and the film: “Yes, switch them
## on (Recommended)”.
static var on := true

const EMBRACE := {}
const DEVOUR := {"below": 0.2, "heal": 0.05, "secs": 2.0, "boss": 3.0}
const LINK := {"share": 0.25, "far": 8.0, "show": 0.4}

## The new stones (talents.gd _wbuilds): what each hangs from, its card.
const NODES := {
	"embrace": {"name": "Embrace", "path": "pact", "from": ["lastrites"], "big": true,
		"text": "As the demon, every kill fills the pact back to full: the demon lasts as long as you keep killing."},
	"devour": {"name": "Devour", "path": "demon", "from": ["bloodlust"], "big": true,
		"text": "As the demon, your rake devours an enemy below 20% life: it dies at once, you heal 5% of your life and the pact gets 2 seconds back. A boss takes triple damage instead."},
	"soullink": {"name": "Soul Link", "path": "man", "from": ["withering"], "big": true,
		"text": "Cursed enemies are linked: 25% of the damage you deal to one is dealt to every other cursed enemy."},
}

## HIS TREE AS A CLAW: where each stone is (the tree's own units), the room round it, and the faint pictures behind it.
const AT := {
	"hunger": [0.0, 1.0], "terribleroar": [0.85, 1.55], "feast": [1.15, 0.6], "hellhide": [2.0, 0.35],
	"branded": [0.0, 3.4], "hexchain": [0.85, 2.85], "phantomstep": [1.15, 3.8],
	"blazingarm": [1.9, 2.2],
	"bloodlust": [3.0, 1.15], "hellwave": [4.05, 0.7], "damnedsouls": [5.2, 0.55], "devour": [3.3, 0.45],
	"souldebt": [3.0, 2.2], "lastrites": [4.1, 2.2], "embrace": [5.3, 2.2], "soulward": [3.5, 1.72],
	"withering": [3.0, 3.25], "pyre": [4.05, 3.7], "bounddemon": [5.2, 3.85], "soullink": [3.3, 3.95],
}
const ROOM := [0.0, 0.25, 5.75, 4.15]
const FIGURES := [
	{"kind": "fill", "path": "pact", "ids": ["hunger", "terribleroar", "blazingarm", "hexchain", "branded"]},
	{"kind": "talon", "path": "demon", "ids": ["terribleroar", "feast", "hellhide"], "width": 3, "hook": 0.5},
	{"kind": "talon", "path": "man", "ids": ["hexchain", "phantomstep"], "width": 3, "hook": -0.5},
	{"kind": "talon", "path": "demon", "ids": ["blazingarm", "bloodlust", "hellwave", "damnedsouls"], "width": 6, "hook": 0.9},
	{"kind": "talon", "path": "pact", "ids": ["blazingarm", "souldebt", "lastrites", "embrace"], "width": 6, "hook": 0.9},
	{"kind": "talon", "path": "man", "ids": ["blazingarm", "withering", "pyre", "bounddemon"], "width": 6, "hook": 0.9},
]
