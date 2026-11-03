// THE GRAPHICS CHIP TEST PAGE, for the owner's phone (docs/mockups/gpu_sculpt/README.md): one file, opened by a link.
//   node tools/gpu_speed_page.mjs [dist/gpu_speed.html]
import { bundle, write } from './lib.mjs';

const [out = 'dist/gpu_speed.html'] = process.argv.slice(2);
const js = await bundle('src/dev/gpu_speed_main.ts', { minify: true, define: { __BUILD__: '"gpu-speed"', __DEV__: 'false' } });
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Graphics chip test</title>
<style>:root{color-scheme:dark}body{margin:0;background:#0d0b14;color:#ece6dc}</style>
</head>
<body>
<script>${js.replace(/<\/script/gi, '<\\/script')}</script>
</body>
</html>
`;
const p = write(out, html);
console.log(`built ${p} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
