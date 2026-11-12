// THE TEN ENDLESS-TOWN SKETCHES (src/dev/endless_town_options.ts) are concept art only: nothing of the game imports them.
//   run: tsx --test tests/endless_town_options.test.ts

// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';

function files(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir) as string[]) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...files(p));
    else if (/\.(ts|mjs|js)$/.test(f)) out.push(p);
  }
  return out;
}

test('nothing of the game imports the endless-town sketches or the Shaft\'s Rim mock-up', () => {
  const bad = files('src').filter((f) => !f.startsWith(join('src', 'dev')) && /endless_town_options|preview_shaft_rim/.test(readFileSync(f, 'utf8') as string));
  assert.deepEqual(bad, []);
});
