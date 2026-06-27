/**
 * Build script for WeiXin MP.
 *
 * Approach:
 * 1. Read each extracted source file
 * 2. Transform require/import patterns to use proper ESM imports
 * 3. Concatenate all files into a single .ts file
 * 4. Run esbuild on that single file to produce main.js
 *
 * The concatenation preserves the shared global scope of the original bundle,
 * so internal cross-references (e.g., BUILTIN_THEMES, DEFAULT_SETTINGS, etc.)
 * work without needing explicit import/export between source files.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');

// Files in dependency order (lowest-level first)
const SOURCE_FILES = [
  'packages/render-core/src/index.ts',
  'packages/theme-pack/src/index.ts',
  'packages/shared-types/src/index.ts',
  'src/types.ts',
  'src/account-modal.ts',
  'src/format-modal.ts',
  'src/markdown-pipeline.ts',
  'src/preview-view.ts',
  'src/settings-tab.ts',
  'src/style-config-modal.ts',
  'src/wechat-api.ts',
  'src/main.ts',
];

// --- Phase 1: Read and transform each file ---
const transformedParts = [];

for (const rel of SOURCE_FILES) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing: ${rel}`);
    process.exit(1);
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Drop `var import_obsidianN = require("obsidian");`
  content = content.replace(/^(var|const|let)\s+import_obsidian\d*\s*=\s*require\("obsidian"\);?\s*$/gm, '');

  // Replace `import_obsidianN.Something` with `Obsidian.Something`
  content = content.replace(/\bimport_obsidian\d*\b/g, 'Obsidian');

  // Fix potential double Obsidian.Obsidian
  content = content.replace(/\bObsidian\.Obsidian\b/g, 'Obsidian');

  // Drop `var|let|const import_juice = __toESM(require_client(), 1);`
  content = content.replace(/^(?:var|let|const)\s+import_juice\s*=\s*__toESM\(require_client\(\),\s*1\);?\s*$/gm, '');

  // Replace `import_juice.default.` with `juice.`
  content = content.replace(/\bimport_juice\.default\b/g, 'juice');

  // Transform mathjax dynamic requires into dynamic imports
  const mathjaxMap = {
    require_mathjax: 'mathjax-full/js/mathjax.js',
    require_tex: 'mathjax-full/js/input/tex.js',
    require_svg: 'mathjax-full/js/output/svg.js',
    require_liteAdaptor: 'mathjax-full/js/adaptors/liteAdaptor.js',
    require_html: 'mathjax-full/js/handlers/html.js',
    require_AllPackages: 'mathjax-full/js/input/tex/AllPackages.js',
  };

  for (const [reqName, importPath] of Object.entries(mathjaxMap)) {
    const pattern = `Promise.resolve().then(() => __toESM(${reqName}(), 1))`;
    const replacement = `import('${importPath}')`;
    // Escape special regex chars in pattern
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(escaped, 'g'), replacement);
  }

  // Collapse leading blank lines
  content = content.replace(/^\n+/, '');

  transformedParts.push({ rel, content });
}

// --- Phase 2: Build the concatenated entry ---
const imports = [
  '// === Auto-generated entry — do not edit directly ===',
  '// Edit individual files under src/ or packages/, then run: node scripts/build.cjs',
  '',
  "import * as Obsidian from 'obsidian';",
  "import juice from 'juice';",
  "import hljs from 'highlight.js';",
  "import bash from 'highlight.js/lib/languages/bash';",
  "import css from 'highlight.js/lib/languages/css';",
  "import javascript from 'highlight.js/lib/languages/javascript';",
  "import json from 'highlight.js/lib/languages/json';",
  "import markdown from 'highlight.js/lib/languages/markdown';",
  "import python from 'highlight.js/lib/languages/python';",
  "import typescript from 'highlight.js/lib/languages/typescript';",
  "import xml from 'highlight.js/lib/languages/xml';",
  "import yaml from 'highlight.js/lib/languages/yaml';",
  "const core_default = hljs;",
  '',
  '// MathJax is loaded dynamically at runtime via import() calls in markdown-pipeline.',
  '// They are listed here so esbuild knows to bundle them.',
  '',
];

let combined = imports.join('\n');

for (const { rel, content } of transformedParts) {
  combined += `\n// ====== ${rel} ======\n`;
  combined += content;
  combined += '\n';
}

// Add the default export
combined += '\n// Default export for Obsidian plugin system\n';
combined += 'export default WeiXinMpPlugin;\n';

// Write the combined entry
const entryPath = path.join(ROOT, 'src', '_bundle.ts');
fs.writeFileSync(entryPath, combined, 'utf8');
console.log(`Generated ${entryPath} (${combined.length.toLocaleString()} bytes)`);

// --- Phase 3: Build with esbuild ---
const isWatch = process.argv.includes('--watch');

async function build() {
  const ctx = await esbuild.context({
    entryPoints: [entryPath],
    bundle: true,
    outfile: path.join(ROOT, 'main.js'),
    platform: 'node',
    format: 'cjs',
    target: 'es2022',
    external: ['obsidian'],
    sourcemap: false,
    minify: false,
    treeShaking: true,
    banner: {
      js: '"use strict";',
    },
  });

  if (isWatch) {
    await ctx.watch({
      onRebuild(err) {
        if (err) {
          console.error('Watch build failed:', err);
          return;
        }
        console.log('Rebuilt main.js');
      },
    });
    console.log('Watching for changes...');
  } else {
    const start = Date.now();
    await ctx.rebuild();
    console.log(`Built main.js in ${Date.now() - start}ms`);
    await ctx.dispose();
  }
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
