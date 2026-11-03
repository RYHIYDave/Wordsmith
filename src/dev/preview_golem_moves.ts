// Dev page: HER GOLEM'S MOVES, frame by frame (dev/golem_moves.ts), as the game draws it. NOT IN THE GAME.
//   node tools/preview.mjs src/dev/preview_golem_moves.ts previews/golem_punch.png 1600 900 "punch:45:4:2"
//   hash = <move: punch | upper | pound | walk | rest | shell | beam>:<turn: 45 front, 135 back>:<screen pixels to a picture pixel>:<every nth frame>
//   (shell, beam: its charged shots, dev/golem_moves.ts GCHARGE_SHELL and GCHARGE_BEAM, with the cannon and the tesla coil)
import { CANVAS3 } from '../art/skin';
import { GCHARGE_BEAM, GCHARGE_SHELL, GP, GPUNCH, GUPPER, GWALK, golemChargeBeam, golemChargeShell, golemPunch, golemUppercut, golemWalk, groundPound } from './golem_moves';
import { GOLEM_GUN, GOLEM_PICK, GOLEM_POSE, sculptGolemBuild } from './sculpt_golem';
import type { GolemGun } from './sculpt_golem';

const [moveArg = 'punch', turnArg = '45', scaleArg = '4', everyArg = '2'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const EVERY = Math.max(1, Number(everyArg) || 2);
const TURN = Number(turnArg) || 45;

type Pose = Partial<typeof GOLEM_POSE> & { aim?: number; kick?: number; charge?: number; gunLevel?: number };
const MOVES: Record<string, { end: number; at: (f: number) => Pose; hit?: number; gun?: GolemGun }> = {
  shell: { end: GCHARGE_SHELL.end, at: golemChargeShell, hit: GCHARGE_SHELL.fire, gun: 'cannon' },
  beam: { end: GCHARGE_BEAM.end, at: golemChargeBeam, hit: GCHARGE_BEAM.fire, gun: 'tesla' },
  punch: { end: GPUNCH.end, at: golemPunch, hit: GPUNCH.hit },
  upper: { end: GUPPER.end, at: golemUppercut, hit: GUPPER.hit },
  pound: { end: GP.end, at: groundPound, hit: GP.hit },
  walk: { end: GWALK.round, at: golemWalk },
  rest: { end: 1, at: () => ({}) },
};
const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };

const build = (): void => {
  const mv = MOVES[moveArg] ?? MOVES.punch;
  const frames: number[] = [];
  for (let f = 0; f <= mv.end; f += EVERY) frames.push(f);
  if (mv.hit !== undefined && !frames.includes(mv.hit)) frames.push(mv.hit);
  frames.sort((a, b) => a - b);
  const paneW = 116 * S;
  const paneH = 128 * S;
  const cols = Math.max(1, Math.floor((innerWidth - 20) / paneW));
  const rows = Math.ceil(frames.length / cols);
  const cv = document.createElement('canvas');
  cv.width = cols * paneW + 20;
  cv.height = rows * (paneH + 18) + 40;
  document.body.style.margin = '0';
  document.body.style.background = '#14122a';
  document.body.appendChild(cv);
  const g = cv.getContext('2d')!;
  g.fillStyle = '#14122a';
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#d8d4ff';
  g.font = '16px monospace';
  g.fillText(`Golem ${moveArg}, turned ${TURN}, every ${EVERY} frame(s) (30 a second)${mv.hit !== undefined ? `, blow at ${mv.hit}` : ''}`, 10, 24);
  frames.forEach((f, k) => {
    const x = 10 + (k % cols) * paneW;
    const y = 40 + Math.floor(k / cols) * (paneH + 18);
    g.fillStyle = (k % 2) ? '#221f44' : '#1b1938';
    g.fillRect(x, y + 18, paneW, paneH);
    g.fillStyle = f === mv.hit ? '#ffd860' : '#d8d4ff';
    g.fillText(`f${f}${f === mv.hit ? ' BLOW' : ''}`, x + 4, y + 14);
    const q = mv.at(f);
    Object.assign(GOLEM_POSE, REST, q);
    const d = sculptGolemBuild('front', GOLEM_PICK.build, TURN, -14, GOLEM_PICK.giant, mv.gun ?? GOLEM_GUN.gun, q.aim ?? 0, q.kick ?? 0, q.charge ?? 0, q.gunLevel ?? 0);
    Object.assign(GOLEM_POSE, REST);
    const feetX = x + (TURN > 90 ? 64 : 52) * S;
    const feetY = y + 18 + paneH - 22 * S;
    g.strokeStyle = '#34306c';
    g.beginPath();
    g.moveTo(x, feetY);
    g.lineTo(x + paneW, feetY);
    g.stroke();
    g.imageSmoothingEnabled = false;
    g.drawImage(d.px.toCanvas(), feetX - CANVAS3.ax * S, feetY - CANVAS3.ay * S, d.px.w * S, d.px.h * S);
  });
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(build, 50);
else window.addEventListener('load', () => setTimeout(build, 50));
