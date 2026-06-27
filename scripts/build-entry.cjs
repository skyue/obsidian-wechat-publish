// Preprocess: concatenate all source files, normalize external imports,
// and write a single entry file for esbuild to bundle.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Files in original bundle order
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
  'src/about-modal.ts',
  'src/style-config-modal.ts',
  'src/update-modal.ts',
  'src/wechat-api.ts',
  'src/main.ts',
];

// Read and concatenate all source files
let combined = '';
for (const rel of SOURCE_FILES) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${rel}`);
    process.exit(1);
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // --- Normalize obsidian imports ---
  // Remove: var import_obsidianN = require("obsidian");
  content = content.replace(/^var import_obsidian\d*\s*=\s*require\("obsidian"\);?\s*\n/gm, '');
  // Replace: import_obsidianN.X with obsidian.X
  content = content.replace(/\bimport_obsidian\d*\b/g, '_obsidian');

  // --- Normalize juice import in render-core ---
  // Remove: var import_juice = __toESM(require_client(), 1);
  content = content.replace(/^var import_juice\s*=\s*__toESM\(require_client\(\),\s*1\);?\s*\n/gm, '');
  // Replace: import_juice.default.X with juice.X
  content = content.replace(/\bimport_juice\.default\b/g, 'juice');

  // --- Handle mathjax requires in markdown-pipeline ---
  // require_mathjax(), require_tex(), etc. are loaded dynamically
  // We'll replace the __toESM(require_xxx(), 1) patterns
  content = content.replace(
    /Promise\.resolve\(\)\.then\(\(\)\s*=>\s*__toESM\(require_(\w+)\(\),\s*1\)\)/g,
    "import('mathjax-full/js/$1.js').then(m => m.default || m)"
  );

  // Keep the esbuild helper references for now, they'll be resolved by esbuild

  combined += `// === ${rel} ===\n`;
  combined += content;
  combined += '\n';
}

// Add imports at the very top
const header = [
  'import * as _obsidian from \'obsidian\';',
  'import juice from \'juice\';',
  '',
  '// esbuild runtime helpers (needed for the inline __toESM/__toCommonJS patterns)',
  'var __toESM = (mod, isNodeMode) => (mod != null ? Object.create(Object.getPrototypeOf(mod)) : {});',
  '// Fix: actual __toESM implementation',
  '// The real __toESM is more complex. We rely on esbuild interop instead.',
  '',
].join('\n');

// Actually, __toESM is already defined in the render-core. Let me check...

// The real issue: the combined code has esbuild helper references like __toESM, __commonJS, etc.
// These are defined at the very beginning of the original main.js (lines 1-36).
// We need those helpers!

const helpers = `
// esbuild helpers (from original main.js lines 1-36)
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn3, res) => function __init() {
  return fn3 && (res = (0, fn3[__getOwnPropNames(fn3)[0]])(fn3 = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
`;

combined = header + helpers + '\n' + combined;

// Add the export at the end
combined += '\nexport default (typeof WeChatMpPublisherPlugin !== "undefined" ? WeChatMpPublisherPlugin : undefined);\n';

// Write the combined entry file
const entryPath = path.join(ROOT, 'src', '_bundle.entry.ts');
fs.writeFileSync(entryPath, combined);
console.log(`Generated ${entryPath} (${combined.length} bytes)`);
