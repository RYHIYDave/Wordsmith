// Dev page: still renders of the game in low-poly 3D, for the owner to look at before anything
// is rebuilt (5 Oct 2026: "Maybe you can just give me some still renders of what the might look
// like?").
//   node tools/preview.mjs src/dev/look3d.ts shots/3d/room.png 1600 900 "room"
//   hash = <scene>[:<variant>]
import { paint } from '../gl/gl';
import { SCENES } from '../gl/scenes';

const [name = 'room', variant = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const make = SCENES[name] ?? SCENES.room;
const t0 = performance.now();
const scene = make(variant, cv.width / cv.height);
const t1 = performance.now();
paint(cv, scene);
console.log(`${name}: ${scene.mesh.triangles} triangles, built in ${Math.round(t1 - t0)} ms, painted in ${Math.round(performance.now() - t1)} ms`);
(window as unknown as { __ready: boolean }).__ready = true;
