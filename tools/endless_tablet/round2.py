import sys
from PIL import Image
import sheets, beasts
OUT = sys.argv[1]
sheets.runes_sheet().save(f'{OUT}/endless_5_tablet_runes.png')
sheets.beast_sheet(beasts.TAKES[:2], 'THE FINAL BOSS, ROUND 2: big four-legged beasts, none a dragon. Takes 1 and 2, beside the Brawler.').save(f'{OUT}/endless_6_beasts_a.png')
sheets.beast_sheet(beasts.TAKES[2:], 'THE FINAL BOSS, ROUND 2: takes 3 and 4, beside the Brawler.').save(f'{OUT}/endless_7_beasts_b.png')
for n in ('endless_5_tablet_runes', 'endless_6_beasts_a', 'endless_7_beasts_b'):
    print(n, Image.open(f'{OUT}/{n}.png').size)
