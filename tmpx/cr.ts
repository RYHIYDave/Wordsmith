import { paintShout, paintDecree, paintCall } from '../src/art/crier_action_fx';
import { Px } from '../src/engine/px';
const at = (x: number, y: number, z = 0): [number, number] => [500 + 32 * (x - y), 300 + 16 * (x + y) - z];
const time = (name: string, n: number, f: (i: number) => void) => { const t0 = performance.now(); for (let i = 0; i < n; i++) f(i); console.log(name, ((performance.now() - t0) / n).toFixed(2), 'ms'); };
const sq = { x0: -8, x1: 8, y0: -8, y1: 8 };
time('shout warn', 6, (i) => paintShout(new Px(1000, 600), at, 0.8 + i * 0.1, [0, 0], 0, sq));
time('shout run', 6, (i) => paintShout(new Px(1000, 600), at, 1.8 + i * 0.15, [0, 0], 0, sq));
time('decree', 6, (i) => paintDecree(new Px(1000, 600), at, 1.0 + i * 0.4, [0, 0], 0.3));
time('call', 6, (i) => paintCall(new Px(1000, 600), at, 1.0 + i * 0.3, [0, 0], [[4, 4], [-4, 4], [4, -4], [-4, -4], [6, 0], [-6, 0]]));
