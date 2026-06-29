/**
 * Build script for WeiXin MP Publisher.
 *
 * Bundles src/main.ts with esbuild, resolving all ESM imports.
 * Post-processes the output to destructure obsidian imports for lint compliance.
 */
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'main.js');

const isWatch = process.argv.includes('--watch');

/**
 * Post-process esbuild CJS output to replace namespace obsidian imports
 * with destructured requires. This eliminates `no-unsafe-member-access` warnings
 * caused by `import_obsidian.Symbol` patterns.
 */
function destructureObsidianImports(output) {
  // Find all unique obsidian symbols used across all import_obsidianN variables
  const symbolSet = new Set();
  const memberPattern = /(?:\b|\(0,\s*)import_obsidian\d*\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let match;
  while ((match = memberPattern.exec(output)) !== null) {
    symbolSet.add(match[1]);
  }

  if (symbolSet.size === 0) return output;

  const symbols = [...symbolSet].sort().join(', ');

  // Remove all `var import_obsidianN = require("obsidian");` lines
  output = output.replace(/^var import_obsidian\d* = require\("obsidian"\);\s*$/gm, '');

  // Replace `(0, import_obsidianN.Symbol)(...)` → `Symbol(...)`
  output = output.replace(/\(0,\s*import_obsidian\d*\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\)/g, '$1');

  // Replace `import_obsidianN.Symbol` → `Symbol`
  output = output.replace(/\bimport_obsidian\d*\s*\.\s*/g, '');

  // Insert destructured require after "use strict"
  const destructureLine = `var { ${symbols} } = require("obsidian");`;
  output = output.replace(/^"use strict";$/m, `"use strict";\n${destructureLine}`);

  return output;
}

async function build() {
  const ctx = await esbuild.context({
    entryPoints: [path.join(ROOT, 'src', 'main.ts')],
    bundle: true,
    outfile: OUT_FILE,
    platform: 'node',
    format: 'cjs',
    target: 'es2022',
    external: ['obsidian'],
    sourcemap: false,
    minify: true,
    loader: { '.css': 'text' },
    treeShaking: true,
    banner: { js: '"use strict";' },
    write: !isWatch, // In watch mode, we need to post-process manually
  });

  if (isWatch) {
    await ctx.watch({
      onRebuild(err) {
        if (err) { console.error('Watch build failed:', err); return; }
        try {
          let output = fs.readFileSync(OUT_FILE, 'utf8');
          output = destructureObsidianImports(output);
          fs.writeFileSync(OUT_FILE, output, 'utf8');
          console.log('Rebuilt main.js');
        } catch (e) {
          console.error('Post-process failed:', e);
        }
      },
    });
    console.log('Watching for changes...');
  } else {
    const start = Date.now();
    await ctx.rebuild();
    // Post-process the output
    let output = fs.readFileSync(OUT_FILE, 'utf8');
    output = destructureObsidianImports(output);
    fs.writeFileSync(OUT_FILE, output, 'utf8');
    console.log(`Built main.js in ${Date.now() - start}ms`);
    await ctx.dispose();
  }
}

build().catch(err => { console.error('Build failed:', err); process.exit(1); });
