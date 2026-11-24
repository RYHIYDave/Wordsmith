# The city's 45 meld runes

The stones for the 45 melds of Floor 11–15 Melds (his doc, https://claude.ai/artifact/CMMUpdDX2f9DwDPe8avGqQ; his word, 24 Nov
2026: “Good”): the city's five runes (Pulling, Splitting, Hexing, Stilling, Binding) with the floor 1–5 runes and with each
other, and their 5 level 2 runes, drawn as the 98 before them were (../meld_runes, ../meld_runes2, which he said were good).
Picture page: https://claude.ai/artifact/2G83AArSTRDzTR29T9Kr6y (meld_runes3.html, made by page3.py). Waiting on his word.

- design.py: each meld's symbol ('X' its colour, 'o' its glow), its colour, its two runes (for the foot), what it shows; no
  symbol the same as one of the 98 before.
- render3.py: draws them with ../meld_runes/render.py's own stone(); writes stones/ and runes.json.
- page3.py: the picture page, and the level 2 stones (the rune's own stone, two bright marks along its foot, as
  tools/melds52/make.py rank_stone draws Power II and the rest).
