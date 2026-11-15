// Dev page: THE ISLE OF STONES' OWN PEOPLE (dev/sculpt_isle_folk.ts) beside the town's (dev/sculpt_townsfolk.ts), each at his
// work, turned the other three ways, and at the height of what he does now and then; at three times the game's size.
//   node tools/preview.mjs src/dev/preview_isle_folk.ts out.png 1500 1100 "3"
//   hash = <scale>[:<town>]   town = isle (default) | mere | fen
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { toSprite } from '../art/kit';
import { FACING_TURN3 } from '../art/townsfolk3';
import { TOWN_CANVAS, paintFigure, sculptArmourer, sculptMystic, sculptStranger } from './sculpt_townsfolk';
import type { TownFigure } from './sculpt_townsfolk';
import { ARMOURER_MOVES, A_BLOW, MYSTIC_MOVES, M_FLARE, STRANGER_MOVES, S_TOSS } from './townsfolk_moves';
import { sculptIsleSeer, sculptIsleSmith, sculptIsleStranger } from './sculpt_isle_folk';
import { sculptMereSeller, sculptMereSmith, sculptMereStranger } from './sculpt_mere_folk';
import { sculptFenHerbalist, sculptFenSmith, sculptFenStranger } from './sculpt_fen_folk';

const [scaleArg = '', townArg = 'isle'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 3;
const MERE = townArg === 'mere';
const FEN = townArg === 'fen';
const smithOf = FEN ? sculptFenSmith : MERE ? sculptMereSmith : sculptIsleSmith;
const seerOf = FEN ? sculptFenHerbalist : MERE ? sculptMereSeller : sculptIsleSeer;
const strangerOf = FEN ? sculptFenStranger : MERE ? sculptMereStranger : sculptIsleStranger;
const HERE = FEN ? "the stilt town's" : MERE ? "the mere's" : "the isle's";
const AURA: Light = { x: TOWN_CANVAS.ax - 4, y: TOWN_CANVAS.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const spr = (fig: TownFigure, aura: Light | null): Sprite => toSprite(paintFigure(fig), aura, TOWN_CANVAS.ax, TOWN_CANVAS.ay);

interface Cell { s: Sprite; cap: string }
interface Row { title: string; cells: Cell[] }
const rows: Row[] = [
  {
    title: 'THE SMITH',
    cells: [
      { s: spr(sculptArmourer(ARMOURER_MOVES.idle(0), FACING_TURN3.sw), AURA), cap: "the town's" },
      { s: spr(smithOf(ARMOURER_MOVES.idle(0), FACING_TURN3.sw), AURA), cap: HERE },
      { s: spr(smithOf(ARMOURER_MOVES.idle(0), FACING_TURN3.se), AURA), cap: 'turned' },
      { s: spr(smithOf(ARMOURER_MOVES.idle(0), FACING_TURN3.ne), AURA), cap: 'turned' },
      { s: spr(smithOf(ARMOURER_MOVES.act(A_BLOW.top), FACING_TURN3.sw), AURA), cap: 'the blow' },
      { s: spr(smithOf(ARMOURER_MOVES.act(A_BLOW.lands + 1), FACING_TURN3.sw), AURA), cap: 'it lands' },
    ],
  },
  {
    title: FEN ? 'THE HERBALIST' : MERE ? 'THE SELLER' : 'THE SEER',
    cells: [
      { s: spr(sculptMystic(MYSTIC_MOVES.idle(0), FACING_TURN3.sw), AURA), cap: "the town's" },
      { s: spr(seerOf(MYSTIC_MOVES.idle(0), FACING_TURN3.sw), AURA), cap: HERE },
      { s: spr(seerOf(MYSTIC_MOVES.idle(0), FACING_TURN3.se), AURA), cap: 'turned' },
      { s: spr(seerOf(MYSTIC_MOVES.idle(0), FACING_TURN3.ne), AURA), cap: 'turned' },
      { s: spr(seerOf(MYSTIC_MOVES.act(M_FLARE.lifts + 10), FACING_TURN3.sw), AURA), cap: 'it lifts' },
      { s: spr(seerOf(MYSTIC_MOVES.act(M_FLARE.blaze), FACING_TURN3.sw), AURA), cap: 'it blazes' },
    ],
  },
  {
    title: 'THE STRANGER',
    cells: [
      { s: spr(sculptStranger(STRANGER_MOVES.idle(0), 0), null), cap: "the town's" },
      { s: spr(strangerOf(STRANGER_MOVES.idle(0), 0), null), cap: HERE },
      { s: spr(strangerOf(STRANGER_MOVES.act(S_TOSS.flick + 8), 0), null), cap: 'the coin' },
    ],
  },
];

const CW = 74;
const CH = 92;
const FOOT = 80;
const W = 6 * CW * S + 24;
const H = rows.length * (CH * S + 40) + 16;
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#05060e';
g.fillRect(0, 0, W, H);
let y = 10;
for (const r of rows) {
  drawText(g, r.title, 12, y, '#e9ecff', { scale: 3 });
  y += 30;
  r.cells.forEach((c, i) => {
    const cx = 12 + i * CW * S;
    g.save();
    g.translate(cx, y);
    g.scale(S, S);
    // (the isle's turf under them; the town's own floor under the town's)
    g.fillStyle = i === 0 ? '#1a1848' : FEN ? '#3a3024' : MERE ? '#2c3a58' : '#16221a';
    g.fillRect(0, 0, CW - 2, CH - 2);
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.beginPath();
    g.ellipse(CW / 2, FOOT, 9, 3.5, 0, 0, Math.PI * 2);
    g.fill();
    if (c.s.aura) drawAura(g, c.s, CW / 2, FOOT);
    g.drawImage(c.s.img, CW / 2 - c.s.ax, FOOT - c.s.ay, c.s.w, c.s.h);
    if (c.s.lights) drawLights(g, c.s, CW / 2, FOOT);
    g.restore();
    drawText(g, c.cap.toUpperCase(), cx + 6, y + (CH - 12) * S, i === 0 ? '#8a90b0' : '#e9ecff', { scale: 2 });
  });
  y += CH * S + 10;
}
(window as unknown as { __ready: boolean }).__ready = true;
