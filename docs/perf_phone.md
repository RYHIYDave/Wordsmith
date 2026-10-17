# Phone report, first run (17 Oct, 05:47 to 06:12), this machine at its own speed, 844x390 dpr 3, warrior level 20 god
place: arrive worst/over50 | play fps/over34/over50 | boss fps/over34/over50 worst | canvas MB | page MB
town:  83/4  | 42.2 / 31 / 10 | - | 47.5 | 477
1:     83/2  | 57.2 / 1 / 1 (worst 267) | warden 59.6/0/0 | 86.5 | 489
3:     83/4  | 57.9 / 0 / 0 | chained 59.1/1/0 | 105.9 | 718
5:     67/5  | 56.8 / 2 / 0 | fleshmancer 55.7/5/2 worst 117 | 127 | 833
6:     117/26| 58.3 / 0 / 0 | unfinished 55.6/2/1 | 161 | 1193
7:     267/43| 58.3 / 8 / 3 | queen 43.3/73/28 worst 150 | 165 | 1204
8:     267/36| 60 / 0 / 0 | cantor 48.9/30/22 worst 250 | 134 | 972
9:     117/32| 39.1 / 16 / 4 | stag 39.5/39/13 worst 317 | 140 | 1135
10:    100/23| 59.6 / 2 / 0 | eye 56.9/5/3 worst 183; risen 59.9/0/0 | 159 | 1312

NOTE (found 17 Oct, about 07:40): the "town" line above is NOT town. The report's bot walks the hero out of town and
into the Prison's first floor, so it measured arriving on floor 1 (its monsters' pictures painted here, on the page).
From the third report on, the hero walks a loop in town instead (`stillTown` says he stayed).

# Second report (17 Oct, 06:32 to 06:50): the outdoor ground painted by the side worker
place: arrive worst/over50 | play fps/over34/over50 | boss fps/over34/over50 worst
town (floor 1): 67/9 | 42.1 / 25 / 7
6:     100/8  | 55 / 2 / 0   | unfinished 49.4/21/3 worst 83
7:     67/2   | 57.1 / 5 / 2 | queen 56.7/4/0 worst 50   (was 43.3)
8:     117/13 | 59.2 / 2 / 1 | cantor 53/17/13 worst 333 (was 48.9)
9:     133/25 | 33.3 / 35 / 8 | stag 43/17/12 worst 167
10:    83/3   | 58.4 / 1 / 1 | eye 58.3/0/0; risen 58.9/0/0
Arrivals much smoother on 6, 7, 8 and 10 (frames over 50 ms: 26 to 8, 43 to 2, 36 to 13, 23 to 3). The Pinewood the slowest.

# What is drawn and painted, each place (tools/scenarios/town_paint.mjs; 15 s of the bot playing, after 20 s settling)
Drawn a frame on the screen, before: floor 1 ~509 pictures / 3.1 screens; 6: 380 / 4.7; 8: 347 / 4.9; 10: 395 / 7.7;
THE PINEWOOD (9): 1,373 pictures covering 99 screens (its trees: up to 125 by 118 game pixels on a grid 12 by 9, some
1,300 on the screen at once, a hundred deep).
Painted on the page meanwhile (the game's own thread), before: floor 1 3.9 s; 6 6.5 s; 8 4.6 s; 9 6.1 s; 10 6.5 s, nearly
all of it the floor's monsters' pictures painted ahead (Bestiary.warm), a frame's whole time and more each on a phone.

# Done on the branch perf (none of it changes how anything looks)
1. The outdoor ground painted by a side worker (kept for the whole game), a piece at a time.
2. The minimap's tiles kept as a picture, made again twice a second.
3. The hero's pictures painted ahead by the side worker.
4. The floor's other monsters' pictures painted ahead by the side worker too (only the heavy bosses were before).
   Painted on the page after it: floor 1 1.4 s (was 3.9), 6 1.3 s (6.5), 9 4.1 s (6.1), 10 3.9 s (6.5); what is left
   is pictures shown before the worker came to them (on a machine of 2 cores the worker rests half the time).
5. THE PINEWOOD'S FOREST AS CHUNK PICTURES (render/tops_cache.ts): its trees laid, back to front, into one picture for
   each slab of depth (4 tiles) and column of the screen (64 game pixels); a chunk is drawn as its trees, as before,
   where anything comes between them or one is seen through. Drawn a frame: about 290 pictures covering 8 screens
   (was 1,300 covering 90). The SAME PICTURE TO THE PIXEL: tools/scenarios/tops_same.mjs draws the frame with and
   without, at 20 moments each for the warrior, the mage and the ranger (with the same random numbers): all the same.

# Third report (17 Oct, 08:27 to 08:47): all five changes (dist/perf7.html), this machine at its own speed
place: arrive worst/over50 | play fps/over34/over50 | boss fps/over34/over50 worst
town (really town now): 50/0 | 59.9 / 0 / 0
6:     33/0   | 60 / 0 / 0    | unfinished 59.8/0/0 worst 33  (first report 55.6, second 49.4)
7:     33/0   | 59.9 / 0 / 0  | queen 59/1/0 worst 50         (43.3, 56.7)
8:     50/0   | 59.8 / 0 / 0  | cantor 51.7/21/14 worst 467   (48.9, 53)
9:     100/1  | 38 / 16 / 6   | stag 54.8/14/8 worst 183      (39.5, 43)
10:    50/0   | 59.9 / 0 / 0  | eye 58.9/1/0; risen 59.7/0/0
Arrivals: frames over 50 ms on coming into a place, first report 23 to 43 on the outdoor floors, now 0 or 1.
(canvasMB is lower than before because pictures handed over by the workers are ImageBitmaps, not canvases, and are not
counted by tools/canvas_room.js: it is not less memory. pageMB, the page process's, is the measure of that.)
Left: the Pinewood in play (38) and one long stall in the Cantor's fight (467 ms).
