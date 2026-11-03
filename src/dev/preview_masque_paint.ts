// Dev page: FLOOR 17, THE MASQUE, a first look (dev/masque_paint.ts), with the knight in the violet room for scale.
// Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_masque_paint.ts shots/masque/look.png 1200 840 "overview"
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_masque_paint.ts shots/masque/look_close.png 1200 840 "close"
//     overview  the corner (600 x 420 game pixels at two picture pixels each)
//     close     twice as big, the knight at the black room's doorway and the clock
//     close:X:Y twice as big round picture pixel (X, Y) of the overview
import { H, W, paintMasqueCorner } from './masque_paint';

const [mode = 'overview', cxArg, cyArg] = decodeURIComponent(location.hash.slice(1)).split(':');

function main(): void {
  const cv = document.createElement('canvas');
  cv.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  const [kx, ky] = paintMasqueCorner(cv);
  if (mode === 'close') {
    // twice as big: the knight at the doorway, the black room and its clock beyond
    const cx = cxArg ? Number(cxArg) : kx - 70;
    const cy = cyArg ? Number(cyArg) : ky - 170;
    const src = document.createElement('canvas');
    src.width = W;
    src.height = H;
    (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
    const g2 = cv.getContext('2d') as CanvasRenderingContext2D;
    g2.imageSmoothingEnabled = false;
    g2.fillStyle = '#08070c';
    g2.fillRect(0, 0, W, H);
    g2.drawImage(src, Math.round(cx - W / 4), Math.round(cy - H / 4), W / 2, H / 2, 0, 0, W, H);
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}
// (after the page has loaded: the painting takes a while)
setTimeout(main, 0);
