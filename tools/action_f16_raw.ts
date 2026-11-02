// (the floors 16 to 19 helper's own, while drawing) every finding of one kind in one move, frame by frame.
//   npx tsx tools/action_f16_raw.ts <who> <row> <move> <kind>
import { checkBoss } from '../src/art/boss_checks';
void (async (): Promise<void> => {
  const [who, row, move, kind] = process.argv.slice(2);
  const sh = (await import('../tests/action_f16_shapes')) as unknown as Record<string, () => [string, unknown, unknown, string[]][]>;
  const r = sh[`${who}Rows`]().find((x) => x[0] === row);
  if (!r) return;
  const found = checkBoss(r[1] as never, r[2] as never, [move]).filter((f) => !kind || f.kind === kind);
  for (const f of found) console.log(f.t.toFixed(3), f.kind, f.what, f.by.toFixed(2));
})();
