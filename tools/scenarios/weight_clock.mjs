// THE GAME'S CLOCK, TAKEN IN HAND (the art chat's films of weight, 8 Oct 2026). `takeClock` loads
// the page again with its clock and its dice taken over from the very first frame: from then on
// the game draws a frame only when the scenario says, every frame is exactly a sixtieth of a second
// of the game's time after the last, and Math.random gives the same numbers every time. So a film
// is the same each time it is made, frame for frame and spark for spark, however slow the machine
// (the other film scenarios slow the game down and photograph it as it goes, and are only as exact
// as the machine's timing); and two films of the same moment, as it is today and with a change,
// differ only by the change.
//   const clock = await takeClock(page, 20261008); await clock.step(); ... await clock.steps(30);
// (performance.now stands still between frames too: what the game paints ahead of need within a
// budget of time, it then paints at once, the same every time.)
export async function takeClock(page, seed = 1) {
  await page.addInitScript((s) => {
    window.__frameQ = [];
    window.__now = 1000;
    window.requestAnimationFrame = (cb) => { window.__frameQ.push(cb); return window.__frameQ.length; };
    performance.now = () => window.__now;
    // (mulberry32: small, and the same everywhere)
    let a = s >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, seed);
  await page.reload();
  await page.waitForFunction('window.__ready === true', null, { timeout: 15000 });
  const step = (n = 1) => page.evaluate((n) => {
    for (let k = 0; k < n; k++) {
      window.__now += 1000 / 60;
      const q = window.__frameQ;
      window.__frameQ = [];
      for (const cb of q) cb(window.__now);
    }
  }, n);
  return { step, steps: step };
}
