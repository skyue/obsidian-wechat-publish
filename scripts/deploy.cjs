/**
 * Deploy built files to local Obsidian test vault.
 * Usage: node scripts/deploy.cjs [vault-plugins-dir]
 *
 * Default target: ~/Downloads/obsidian_test/.obsidian/plugins/weixin-mp-publisher
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const defaultTarget = path.join(
  require('os').homedir(),
  'Downloads/obsidian_test/.obsidian/plugins/weixin-mp-publisher'
);

const target = process.argv[2] || defaultTarget;

if (!fs.existsSync(path.dirname(target))) {
  console.error(`Target directory does not exist: ${path.dirname(target)}`);
  process.exit(1);
}

fs.mkdirSync(target, { recursive: true });

const files = ['main.js', 'manifest.json', 'styles.css'];
for (const file of files) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(target, file));
    console.log(`  ${file} → ${target}/${file}`);
  }
}

console.log(`Deployed to ${target}`);
