// THE FILM'S CLOCK (run in the page before the game's own script: tools/playtest.mjs --init): once the film asks for it
// (window.__manual()), the page's frames come only when the film steps them (window.__tick(ms)), each `ms` after the last, so
// that every picture of the film is one thirtieth of a second of the game's time whatever the camera takes.
(() => {
  const raf = window.requestAnimationFrame.bind(window);
  let manual = false;
  let waiting = null;
  let last = 0;
  window.requestAnimationFrame = (f) => {
    if (manual) {
      waiting = f;
      return 0;
    }
    return raf((t) => {
      last = t;
      f(t);
    });
  };
  window.__manual = () => {
    manual = true;
  };
  window.__tick = (ms) => {
    const f = waiting;
    if (!f) return false;
    waiting = null;
    last += ms;
    f(last);
    return true;
  };
})();
