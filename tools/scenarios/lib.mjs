// Helpers shared by the playtest scenarios: press named things on screen with a mouse or a finger.
export async function makeHands(page) {
  const touch = await page.evaluate(() => window.__dbg.screen.touch);
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);
  /** Press a point given in game pixels. button: 0 left / finger, 2 right (mouse only). */
  const pressAt = async (gx, gy, button = 0) => {
    const c = await client(gx, gy);
    if (cdp) {
      // (the finger's coming down is sent and NOT waited for before its going up is: on a busy
      // machine the browser may take a third of a second to answer, and a tap that lasts that long
      // is a hold. Version 13.2's regression: a mage's tap set an orb instead of sending a wave.)
      const pt = [{ x: Math.round(c.x), y: Math.round(c.y), id: 7 }];
      const down = cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
      await page.waitForTimeout(40);
      await Promise.all([down, cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]);
    } else {
      await page.mouse.click(c.x, c.y, { button: button === 2 ? 'right' : 'left' });
    }
    await page.waitForTimeout(140);
  };
  const marks = () => page.evaluate(() => [...window.__dbg.ui.marks.keys()]);
  /** Find a named widget; `name` may be a prefix ("button:Buy"). */
  const mark = (name) => page.evaluate((n) => {
    const m = window.__dbg.ui.marks;
    let key = m.has(n) ? n : null;
    if (!key) for (const k of m.keys()) if (k.startsWith(n)) { key = k; break; }
    if (!key) return null;
    const r = m.get(key);
    return { name: key, x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w, h: r.h };
  }, name);
  /**
   * Press a named widget. Returns its full name, or null (and says so) if it is not on screen.
   * A HERO WHO HAS BEEN PICKED MAKES READY ON THEIR CARD BEFORE THE RUN BEGINS (Version 16:
   * main.ts, `entering`): a playtest that presses a class card means to play, so the press is not
   * over until they have gone and the run has begun (see `entered`). `stay`: do not wait
   * (enter.mjs looks at the entrance itself).
   */
  const press = async (name, button = 0, stay = false) => {
    const m = await mark(name);
    if (!m) { console.log(`  !! nothing on screen called "${name}". On screen: ${(await marks()).join(', ')}`); return null; }
    await pressAt(m.x, m.y, button);
    if (m.name.startsWith('class:') && !stay) await entered(page);
    return m.name;
  };
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(140); };
  /** Press on one point, carry the pointer to another without letting go, and let go there (game pixels). */
  const dragAt = async (ax, ay, bx, by) => {
    const a = await client(ax, ay); const b = await client(bx, by);
    if (cdp) {
      const pt = (p) => [{ x: Math.round(p.x), y: Math.round(p.y), id: 8 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(a) });
      await page.waitForTimeout(50);
      for (let i = 1; i <= 4; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt({ x: a.x + ((b.x - a.x) * i) / 4, y: a.y + ((b.y - a.y) * i) / 4 }) }); await page.waitForTimeout(30); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      await page.waitForTimeout(50);
      await page.mouse.move(b.x, b.y, { steps: 4 });
      await page.waitForTimeout(40);
      await page.mouse.up();
    }
    await page.waitForTimeout(140);
  };
  /** The same, in two halves, so that a picture can be taken while the thing is still held over its target. */
  let held = null;
  const dragStart = async (ax, ay, bx, by) => {
    const a = await client(ax, ay); const b = await client(bx, by);
    held = b;
    if (cdp) {
      const pt = (p) => [{ x: Math.round(p.x), y: Math.round(p.y), id: 8 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(a) });
      await page.waitForTimeout(50);
      for (let i = 1; i <= 4; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt({ x: a.x + ((b.x - a.x) * i) / 4, y: a.y + ((b.y - a.y) * i) / 4 }) }); await page.waitForTimeout(30); }
    } else {
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      await page.waitForTimeout(50);
      await page.mouse.move(b.x, b.y, { steps: 4 });
    }
    await page.waitForTimeout(160);
  };
  /** While something is held (after dragStart): carry it on to another point, still without letting go. */
  const dragOn = async (bx, by) => {
    if (!held) return;
    const a = held; const b = await client(bx, by);
    held = b;
    if (cdp) {
      const pt = (p) => [{ x: Math.round(p.x), y: Math.round(p.y), id: 8 }];
      for (let i = 1; i <= 4; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt({ x: a.x + ((b.x - a.x) * i) / 4, y: a.y + ((b.y - a.y) * i) / 4 }) }); await page.waitForTimeout(30); }
    } else await page.mouse.move(b.x, b.y, { steps: 4 });
    await page.waitForTimeout(160);
  };
  const dragEnd = async () => {
    if (!held) return;
    held = null;
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await page.mouse.up();
    await page.waitForTimeout(140);
  };
  /**
   * A swipe of a finger: down at a point, across (dx, dy) game pixels and up, all of it sent to the
   * browser at once. (A swipe is over in a tenth of a second, and the game takes a touch that
   * lasts more than three tenths for a hold. Sent one event at a time, each waiting for the last
   * to be answered, a swipe lasted longer than that when four playtests shared the machine:
   * Version 13.1's regression, where a ranger's swipe loosed a volley instead of laying a trap.)
   */
  const flickAt = async (gx, gy, dx, dy, id = 6) => {
    if (!cdp) return;
    const pts = [];
    for (const k of [0, 1 / 3, 2 / 3, 1]) { const c = await client(gx + dx * k, gy + dy * k); pts.push([{ x: Math.round(c.x), y: Math.round(c.y), id }]); }
    const send = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    await Promise.all([send('touchStart', pts[0]), send('touchMove', pts[1]), send('touchMove', pts[2]), send('touchMove', pts[3]), send('touchEnd', [])]);
  };
  /** Move the mouse over a point without pressing (a finger cannot do this). */
  const hoverAt = async (gx, gy) => {
    if (cdp) return;
    const c = await client(gx, gy);
    await page.mouse.move(c.x, c.y, { steps: 3 });
    await page.waitForTimeout(160);
  };
  /** Wait until something is true in the page (checked every 100 ms); false if it never was. */
  const until = async (fn, ms = 4000) => {
    for (let t = 0; t < ms; t += 100) {
      if (await page.evaluate(fn)) return true;
      await page.waitForTimeout(100);
    }
    return false;
  };
  /**
   * Wait until the picture stands still. When the inventory closes (or opens) the picture glides
   * for a third of a second, to put the hero back in the middle of what is seen; a thing of the
   * world measured on the screen meanwhile is not where it will be a moment later, and a press
   * aimed by that measure lands beside it. (Two frames are let go by first: the frame a panel
   * closes in has not yet turned the picture round.) Found by Version 14.3's regression, where
   * two playtests that measured at once had been passing by a margin of a tenth of a second.
   */
  const settle = async (ms = 3000) => {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    for (let t = 0; t < ms; t += 50) {
      if (!(await page.evaluate(() => window.__dbg.renderer.gliding))) return true;
      await page.waitForTimeout(50);
    }
    return false;
  };
  return { touch, pressAt, press, mark, marks, key, client, dragAt, dragStart, dragOn, dragEnd, flickAt, hoverAt, until, settle };
}

/**
 * Wait until no hero is making ready on a class card (main.ts, `entering`): at once if none is
 * (the first of the two presses it takes to start over a saved character begins nothing), and
 * for as long as the entrance lasts if one is (a second or two; ten at the outside). False if one
 * was still going on at the end of that.
 */
export async function entered(page, ms = 10000) {
  for (let t = 0; t <= ms; t += 100) {
    if (!(await page.evaluate(() => !!window.__dbg.entering && window.__dbg.entering() !== null))) return true;
    await page.waitForTimeout(100);
  }
  console.log('  !! a hero picked on a class card was still making ready after ten seconds');
  return false;
}

export const log = (label, v) => console.log(label.padEnd(44), typeof v === 'string' ? v : JSON.stringify(v));
