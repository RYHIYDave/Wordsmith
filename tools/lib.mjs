// Shared helpers for the build, preview and playtest tools.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Load a dev dependency from this project, or from a tool cache if the project has no node_modules. */
export function load(name) {
  const tries = [name, path.join(ROOT, 'node_modules', name), `/opt/npm-tools/node_modules/${name}`];
  for (const t of tries) {
    try { return require(t); } catch { /* try next */ }
  }
  throw new Error(`Cannot find "${name}". Run "npm install" in ${ROOT} first.`);
}

/** Bundle a TypeScript entry file into one browser script (IIFE). */
export async function bundle(entry, { minify = false, define = {} } = {}) {
  const esbuild = load('esbuild');
  const r = await esbuild.build({
    entryPoints: [path.resolve(ROOT, entry)],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    write: false,
    minify,
    legalComments: 'none',
    logLevel: 'warning',
    define,
  });
  return r.outputFiles[0].text;
}

/** The page's own styles: one dark, full-window stage with no scrolling, zooming or selecting. */
const STYLE = `:root{--bg:#07050a;--fg:#d8d0c6;color-scheme:dark}
html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);overflow:hidden;overscroll-behavior:none;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}`;

const safeScript = (js) => js.replace(/<\/script/gi, '<\\/script');

/** Wrap a script in the single-file HTML page the game ships as (double-click to play). */
export function page(js, title = 'ARPG Playable Build') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<title>${title}</title>
<style>
${STYLE}
</style>
</head>
<body>
<script>
${safeScript(js)}
</script>
</body>
</html>
`;
}

/**
 * The same game as a page fragment for publishing on claude.ai, which supplies its own
 * <html>, <head> and <body> around whatever it is given.
 */
export function fragment(js, title = 'ARPG Playable Build') {
  return `<title>${title}</title>
<style>
${STYLE}
</style>
<script>
${safeScript(js)}
</script>
`;
}

export function write(rel, text) {
  const p = path.resolve(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}
