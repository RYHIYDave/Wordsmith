// The lettering (engine/font.ts). Since Version 13 a glyph is drawn at twice the grain it is
// designed at: these tests hold the two things that must not move when that drawing is changed.
// One: the measures every screen is laid out with (a letter's advance, a line's width, where a
// line wraps) are the old ones, to the pixel. Two: what the finer drawing may and may not do to
// a letter's shape (fineGlyph, boldGlyph).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore - node typings are not part of this project
import assert from 'node:assert/strict';
import { FONT_BOLD, FONT_GRAIN, LINE_H, boldGlyph, fineGlyph, textWidth, wrapText } from '../src/engine/font';

const inked = (rows: readonly string[]): number => rows.join('').split('#').length - 1;

test('the measures every screen is laid out with are what they were', () => {
  // normal font: capitals and digits five wide, one pixel between letters, a space three wide
  assert.equal(textWidth('A'), 5);
  assert.equal(textWidth('AB'), 11);
  assert.equal(textWidth('i'), 1);
  assert.equal(textWidth('l'), 2);
  assert.equal(textWidth('A B'), 5 + 1 + 3 + 1 + 5);
  assert.equal(textWidth('0123456789'), 10 * 5 + 9);
  assert.equal(textWidth('INVENTORY'), 5 + 5 + 5 + 5 + 5 + 5 + 5 + 5 + 5 + 8 - 2); // I is three wide
  // small font: three wide, M and W five, N four, a space two
  assert.equal(textWidth('A', 'small'), 3);
  assert.equal(textWidth('M', 'small'), 5);
  assert.equal(textWidth('W', 'small'), 5);
  assert.equal(textWidth('N', 'small'), 4);
  assert.equal(textWidth('A A', 'small'), 3 + 1 + 2 + 1 + 3);
  assert.equal(textWidth('LV 10', 'small'), 3 + 1 + 3 + 1 + 2 + 1 + 3 + 1 + 3);
  // lower case is drawn with the capitals in the small font, and is as wide
  assert.equal(textWidth('your words', 'small'), textWidth('YOUR WORDS', 'small'));
  assert.equal(textWidth(''), 0);
  assert.equal(textWidth('AB', 'normal', 2), 22);
  assert.deepEqual(LINE_H, { normal: 9, small: 6 });
});

test('a line wraps where it always did', () => {
  assert.deepEqual(wrapText('one two three', 1000), ['one two three']);
  const w = textWidth('one two');
  assert.deepEqual(wrapText('one two three', w), ['one two', 'three']);
  assert.deepEqual(wrapText('one two three', w - 1), ['one', 'two', 'three']);
  assert.deepEqual(wrapText('a\n\nb', 100), ['a', '', 'b']);
  // a word too long for the line is cut, and wrapping always moves on
  assert.ok(wrapText('abcdefghij', 12).length > 1);
  assert.deepEqual(wrapText('', 50), ['']);
});

test('the finer grain: two picture pixels to a font pixel, and no ink is ever taken away', () => {
  assert.equal(FONT_GRAIN, 2);
  const glyphs: string[][] = [
    ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'], // D
    ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], // O
    ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'], // X
    ['.#.', '###', '.#.'], // a plus
  ];
  for (const rows of glyphs) {
    const fine = fineGlyph(rows);
    assert.equal(fine.length, rows.length * 2);
    for (const row of fine) assert.equal(row.length, rows[0].length * 2);
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[0].length; x++) {
      if (rows[y][x] !== '#') continue;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) assert.equal(fine[y * 2 + dy][x * 2 + dx], '#', `the ink at ${x},${y} is whole`);
    }
  }
});

test('the finer grain: a straight stroke and a right angle are left exactly as drawn', () => {
  const plus = ['.#.', '###', '.#.'];
  assert.deepEqual(fineGlyph(plus), ['..##..', '..##..', '######', '######', '..##..', '..##..']);
  const ell = ['#..', '#..', '###'];
  assert.equal(inked(fineGlyph(ell)), inked(ell) * 4, 'the crook of an L is not filled');
  const bar = ['.....', '#####', '.....'];
  assert.equal(inked(fineGlyph(bar)), inked(bar) * 4);
});

test('the finer grain: a diagonal is filled to a slope, and a round letter comes out round', () => {
  // two pixels that touch only at their corners: each of the two empty pixels between gets a quarter
  const step = ['#.', '.#'];
  assert.deepEqual(fineGlyph(step), ['##..', '###.', '.###', '..##']);
  // D against O: what tells them apart is the square corner, and it is still square
  const d = fineGlyph(['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.']);
  const o = fineGlyph(['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.']);
  assert.equal(d[0].slice(0, 2), '##', 'the top left of a D is a square corner');
  assert.equal(d[13].slice(0, 2), '##');
  assert.equal(o[0].slice(0, 2), '..', 'the top left of an O is cut away');
  assert.equal(o[1].slice(0, 2), '.#', 'and eased with one quarter');
  // both are round on the right
  assert.equal(d[1].slice(8, 10), '#.');
  assert.equal(o[1].slice(8, 10), '#.');
});

test('the bold drawing: every stem one picture pixel thicker, the glyph one wider, nothing else', () => {
  assert.deepEqual(FONT_BOLD, { normal: true, small: false });
  const fine = ['##..##', '##..##', '######'];
  const bold = boldGlyph(fine);
  assert.deepEqual(bold, ['###.###', '###.###', '#######']);
  // a level stroke is no taller
  assert.equal(boldGlyph(['....', '####', '....']).filter((r) => r.includes('#')).length, 1);
  assert.deepEqual(boldGlyph([]), []);
});
