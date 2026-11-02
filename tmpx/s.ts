import { wallClumpPainted, wallAt, WALL, CLEARING } from '../src/art/stag_action_fx';
import { CLOSE, CHARGE9, CHARGE9_CARRIED, STOT9, STARE, GORE9, makeStagActionArt } from '../src/art/stag_action';
import { toSprite } from '../src/art/kit';
console.log('wall n', wallAt(0.8).length, wallAt(0.6).length, wallAt(0.4).length, JSON.stringify(WALL), JSON.stringify(CLOSE));
console.log('charge', JSON.stringify(CHARGE9), CHARGE9_CARRIED, JSON.stringify(STARE), JSON.stringify(GORE9));
let t0 = performance.now(); let px = 0;
for (let i = 0; i < 20; i++) { const p = wallClumpPainted(i % 10, 0.05 + i * 0.033, 'air'); const b = p.px.bounds(2); px += b ? b.w * b.h : 0; }
console.log('air ms', (performance.now() - t0) / 20, 'avg px', px / 20);
t0 = performance.now();
for (let i = 0; i < 20; i++) wallClumpPainted(i % 10, 0.05 + i * 0.033, 'floor');
console.log('floor ms', (performance.now() - t0) / 20);
const a = makeStagActionArt(); console.log(Object.keys(a.front.clips?.moves ?? {}), a.front.walkFps, a.front.walk?.length);
