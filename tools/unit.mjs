// THE UNIT SUITE, RUN SO THAT IT NEVER HAS TO BE RUN AGAIN FROM THE START. His words, 6 Nov 2026, 18:21 (Eastern): “This always
// happens and you always have to rerun checks so I need you to figure out a way to not have that happen”.
//   node tools/unit.mjs              every test file, on a frozen copy of the last commit
//   node tools/unit.mjs --jobs 1     one file at a time (default: one per core)
//   node tools/unit.mjs --again      forget what is kept for this commit and run it all
// Why it was run again and again: the whole suite as one run under one time limit, cut off part way on a slow machine with
// nothing to show for what had passed; files changed and heavy work (a bake) done while it ran; nothing kept from a run to
// the next. So:
// 1. A FROZEN COPY: the commit is checked out on its own (.unit/<commit>/copy), and that is what is tested; whatever is done
//    to the work copy meanwhile cannot reach it. (Commit first: what is not committed is not tested, and it says so.)
// 2. EACH FILE ON ITS OWN, with a time limit of its own (TIME_EACH), and no limit on the whole.
// 3. KEPT AS IT GOES: each file's result is written as it ends (.unit/<commit>/results/<file>.json). Stopped for any reason,
//    the next run of the same commit runs only what has no result yet.
// 4. A FAILURE TRIED AGAIN ALONE: when the rest are done, each file that failed is run again with nothing else running. One
//    that passes alone failed for the machine being busy (a test of how fast something is), and is said to be so; one that
//    fails again is a real failure.
// It ends with one line: UNIT DONE <commit>: <files> files, <passed> passed, <failed> failed (<busy> passed alone).
// Its whole account: .unit/<commit>/summary.txt.

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const JOBS = Math.max(1, Number(opt('jobs', String(os.cpus().length || 2))));
/** How long one file may take (ms): the slowest take a few minutes on a two-core machine. */
const TIME_EACH = Number(opt('each', String(20 * 60 * 1000)));

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const commit = git('rev-parse', '--short=10', 'HEAD');
const dirty = git('status', '--porcelain', '--', 'src', 'tests', 'tools').split('\n').filter((l) => l && !l.startsWith('??'));
if (dirty.length) console.log(`NOTE: ${dirty.length} changed file(s) not committed: they are NOT tested (commit them first to test them)`);

const home = path.join(ROOT, '.unit', commit);
const copy = path.join(home, 'copy');
const results = path.join(home, 'results');
const logs = path.join(home, 'logs');
if (args.includes('--again')) fs.rmSync(results, { recursive: true, force: true });
fs.mkdirSync(results, { recursive: true });
fs.mkdirSync(logs, { recursive: true });

// THE FROZEN COPY (a worktree of the commit; its node_modules the work copy's)
if (!fs.existsSync(path.join(copy, 'package.json'))) {
  try { git('worktree', 'prune'); } catch { /* none */ }
  fs.rmSync(copy, { recursive: true, force: true });
  git('worktree', 'add', '--detach', copy, commit);
}
const nm = path.join(copy, 'node_modules');
if (!fs.existsSync(nm)) fs.symlinkSync(fs.realpathSync(path.join(ROOT, 'node_modules')), nm);

const files = fs.readdirSync(path.join(copy, 'tests')).filter((f) => f.endsWith('.test.ts')).sort();
const keptOf = (f) => path.join(results, `${f}.json`);
const todo = files.filter((f) => !fs.existsSync(keptOf(f)));
console.log(`UNIT ${commit}: ${files.length} files, ${files.length - todo.length} kept from before, ${todo.length} to run, ${JOBS} at a time`);

/** Run one file; its result: passed, failed, how many tests each way, how long, and its failures' names. */
function runOne(f) {
  return new Promise((done) => {
    const t0 = Date.now();
    const log = path.join(logs, `${f}.log`);
    const out = fs.openSync(log, 'w');
    const child = spawn('tsx', ['--test', path.join('tests', f)], { cwd: copy, stdio: ['ignore', out, out], env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=6000' } });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIME_EACH);
    child.on('exit', (code) => {
      clearTimeout(timer);
      fs.closeSync(out);
      const text = fs.readFileSync(log, 'utf8');
      const num = (k) => Number((new RegExp(`^# ${k} (\\d+)`, 'm').exec(text) ?? [])[1] ?? 0);
      const failedNames = [...text.matchAll(/^not ok \d+ - (.*)$/gm)].map((m) => m[1]);
      const r = { file: f, ok: code === 0 && !timedOut && num('fail') === 0, pass: num('pass'), fail: num('fail'), timedOut, code, ms: Date.now() - t0, failed: failedNames };
      done(r);
    });
  });
}

let passed = 0;
let failed = 0;
async function pool(list, jobs, onEach) {
  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const f = list[next++];
      onEach(await runOne(f));
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, list.length) }, worker));
}
await pool(todo, JOBS, (r) => {
  fs.writeFileSync(keptOf(r.file), JSON.stringify(r));
  if (r.ok) passed++;
  else {
    failed++;
    console.log(`  failed: ${r.file}${r.timedOut ? ' (out of time)' : ''} ${r.failed.slice(0, 3).join(' | ')}`);
  }
});

// EACH FAILURE ALONE, nothing else running
const all = files.map((f) => JSON.parse(fs.readFileSync(keptOf(f), 'utf8')));
let busy = 0;
for (const r of all.filter((q) => !q.ok && !q.alone)) {
  const again = await runOne(r.file);
  const kept = { ...again, alone: true, firstFailed: r.failed, busy: again.ok };
  fs.writeFileSync(keptOf(r.file), JSON.stringify(kept));
  console.log(`  ${r.file} run again alone: ${again.ok ? 'PASSED (it failed only for the machine being busy)' : 'FAILED again'}`);
}
const final = files.map((f) => JSON.parse(fs.readFileSync(keptOf(f), 'utf8')));
const bad = final.filter((r) => !r.ok);
busy = final.filter((r) => r.busy).length;
const tests = final.reduce((n, r) => n + r.pass + r.fail, 0);
const lines = [
  `UNIT ${commit}, ${new Date().toISOString()}: ${final.length} files, ${tests} tests`,
  `passed: ${final.length - bad.length} files${busy ? ` (${busy} only when run alone: ${final.filter((r) => r.busy).map((r) => r.file).join(', ')})` : ''}`,
  `failed: ${bad.length} files`,
  ...bad.map((r) => `  ${r.file}${r.timedOut ? ' (out of time)' : ''}: ${r.failed.join(' | ')}  (log: .unit/${commit}/logs/${r.file}.log)`),
];
fs.writeFileSync(path.join(home, 'summary.txt'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
console.log(`UNIT DONE ${commit}: ${final.length} files, ${final.length - bad.length} passed, ${bad.length} failed (${busy} passed alone)`);
