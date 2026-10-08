// The colours of the interface (ui/ui.ts, THEME; Version 13: the menus in the heroes' look).
// What is held here: that every colour is a colour, that lettering can be read on what it is
// written on (by the usual measure of contrast), and that the lines the rules say in the corner
// of the screen (game/defs.ts, MSG) are in the interface's own colours.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore - node typings are not part of this project
import assert from 'node:assert/strict';
import { MSG } from '../src/game/defs';
import { THEME } from '../src/ui/ui';

/** Relative luminance of '#rrggbb' (WCAG 2). */
function luminance(hex: string): number {
  const ch = (i: number): number => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(0) + 0.7152 * ch(1) + 0.0722 * ch(2);
}

/** Contrast of two colours, 1 (none) to 21 (black on white). */
function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

test('every colour of the interface is a colour', () => {
  for (const [name, value] of Object.entries(THEME)) assert.match(value, /^#[0-9a-f]{6}$/, name);
  for (const [name, value] of Object.entries(MSG)) assert.match(value, /^#[0-9a-f]{6}$/, name);
});

test('lettering can be read on what it is written on', () => {
  // on a panel, on a block that stands on a panel, and on that block lit
  for (const ground of [THEME.bg, THEME.bg2, THEME.hot, THEME.slot]) {
    assert.ok(contrast(THEME.text, ground) >= 7, `text on ${ground}: ${contrast(THEME.text, ground).toFixed(1)}`);
    assert.ok(contrast(THEME.accent, ground) >= 6, `accent on ${ground}: ${contrast(THEME.accent, ground).toFixed(1)}`);
  }
  for (const ground of [THEME.bg, THEME.bg2, THEME.slot]) {
    assert.ok(contrast(THEME.dim, ground) >= 4.5, `dim on ${ground}: ${contrast(THEME.dim, ground).toFixed(1)}`);
    assert.ok(contrast(THEME.gold, ground) >= 7, `gold on ${ground}`);
    assert.ok(contrast(THEME.bad, ground) >= 4.5, `bad on ${ground}: ${contrast(THEME.bad, ground).toFixed(1)}`);
    assert.ok(contrast(THEME.good, ground) >= 7, `good on ${ground}`);
  }
  // lettering that is meant to be barely there is still there
  assert.ok(contrast(THEME.faint, THEME.slot) >= 2.5, `faint on a slot: ${contrast(THEME.faint, THEME.slot).toFixed(1)}`);
  assert.ok(contrast(THEME.faint, THEME.bg) >= 2.2, `faint on a panel: ${contrast(THEME.faint, THEME.bg).toFixed(1)}`);
  // the one thing to press: white on pink
  assert.ok(contrast('#ffffff', THEME.call) >= 3.5, `white on the call: ${contrast('#ffffff', THEME.call).toFixed(1)}`);
});

test('a block can be told from what it stands on, and a rim from its block', () => {
  assert.ok(contrast(THEME.bg2, THEME.bg) >= 1.15, `a block on a panel: ${contrast(THEME.bg2, THEME.bg).toFixed(2)}`);
  assert.ok(contrast(THEME.hot, THEME.bg2) >= 1.5, `a lit block: ${contrast(THEME.hot, THEME.bg2).toFixed(2)}`);
  assert.ok(contrast(THEME.edge, THEME.slot) >= 1.5, `a quiet rim on a slot: ${contrast(THEME.edge, THEME.slot).toFixed(2)}`);
  assert.ok(contrast(THEME.edgeHi, THEME.bg2) >= 2.5, `a rim that can be pressed: ${contrast(THEME.edgeHi, THEME.bg2).toFixed(2)}`);
  assert.ok(contrast(THEME.callHi, THEME.call) >= 1.5);
  assert.ok(contrast(THEME.life, THEME.ink) >= 3, 'the life in its globe');
  assert.ok(contrast(THEME.lifeHi, THEME.life) >= 1.5, 'the light on the life');
});

test('the lines the rules say are in the interface\'s colours', () => {
  assert.equal(MSG.plain, THEME.text);
  assert.equal(MSG.word, THEME.accent);
  assert.equal(MSG.good, THEME.good);
  assert.equal(MSG.bad, THEME.bad);
  assert.equal(MSG.life, THEME.lifeHi);
});
