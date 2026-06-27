/**
 * Transform extracted JS source files back into compilable TypeScript.
 *
 * What this does:
 * 1. Replace `var import_obsidianN = require("obsidian")` with proper imports
 * 2. Replace `import_obsidianN.X` with `Obsidian.X`
 * 3. Replace juice require pattern with `import juice from 'juice'`
 * 4. Convert mathjax dynamic requires to dynamic imports
 * 5. Generate a combined entry file that imports all modules as side effects
 *    (shared global scope, as in the original bundle)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PKG = path.join(ROOT, 'packages');

const files = [
  'packages/render-core/src/index.ts',
  'packages/theme-pack/src/index.ts',
  'packages/shared-types/src/index.ts',
  'src/types.ts',
  'src/account-modal.ts',
  'src/format-modal.ts',
  'src/markdown-pipeline.ts',
  'src/preview-view.ts',
  'src/settings-tab.ts',
  'src/about-modal.ts',
  'src/style-config-modal.ts',
  'src/update-modal.ts',
  'src/wechat-api.ts',
  'src/main.ts',
];

for (const rel of files) {
  const filePath = path.join(ROOT, rel);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove `var import_obsidianN = require("obsidian");`
  content = content.replace(/^var import_obsidian\d*\s*=\s*require\("obsidian"\);?\s*$/gm, '');

  // Replace `import_obsidianN.` with `Obsidian.`
  content = content.replace(/\bimport_obsidian\d*\b/g, 'Obsidian');

  // Fix double Obsidian.Obsidian if any (from replacing import_obsidianN.Obsidian)
  content = content.replace(/\bObsidian\.Obsidian\b/g, 'Obsidian');

  // Remove `var import_juice = __toESM(require_client(), 1);`
  content = content.replace(/^var import_juice\s*=\s*__toESM\(require_client\(\),\s*1\);?\s*$/gm, '');

  // Replace `import_juice.default.` with `juice.`
  content = content.replace(/\bimport_juice\.default\b/g, 'juice');

  // Convert mathjax dynamic requires to proper dynamic imports
  // Pattern: Promise.resolve().then(() => __toESM(require_xxxx(), 1))
  const mathjaxMap = {
    require_mathjax: 'mathjax-full/js/mathjax.js',
    require_tex: 'mathjax-full/js/input/tex.js',
    require_svg: 'mathjax-full/js/output/svg.js',
    require_liteAdaptor: 'mathjax-full/js/adaptors/liteAdaptor.js',
    require_html: 'mathjax-full/js/handlers/html.js',
    require_AllPackages: 'mathjax-full/js/input/tex/AllPackages.js',
  };

  for (const [reqName, importPath] of Object.entries(mathjaxMap)) {
    content = content.replace(
      new RegExp(`Promise\\.resolve\\(\\)\\.then\\(\\(\\)\\s*=>\\s*__toESM\\(${reqName}\\(\\),\\s*1\\)\\)`, 'g'),
      `import('${importPath}')`
    );
  }

  // Remove blank lines at the start
  content = content.replace(/^\n+/, '');

  fs.writeFileSync(filePath, content);
  console.log(`Transformed: ${rel}`);
}

// Create a combined entry file that imports all modules as side effects
// (to preserve the shared global scope behavior of the original bundle)
const entryPath = path.join(SRC, '_entry.ts');

const entryLines = [
  '// Auto-generated entry point. Imports all modules in dependency order.',
  '// Each module adds its exports to the global scope (original bundle behavior).',
  '',
  'import \'../packages/render-core/src/index\';',
  'import \'../packages/theme-pack/src/index\';',
  'import \'../packages/shared-types/src/index\';',
  'import \'./types\';',
  'import \'./account-modal\';',
  'import \'./format-modal\';',
  'import \'./markdown-pipeline\';',
  'import \'./preview-view\';',
  'import \'./settings-tab\';',
  'import \'./about-modal\';',
  'import \'./style-config-modal\';',
  'import \'./update-modal\';',
  'import \'./wechat-api\';',
  'import \'./main\';',
  '',
];

fs.writeFileSync(entryPath, entryLines.join('\n'));
console.log(`\nCreated: src/_entry.ts`);
console.log('Done. All files transformed.');
