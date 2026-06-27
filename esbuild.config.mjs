import esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
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
  await ctx.watch();
  console.log('esbuild watching...');
} else {
  await ctx.rebuild();
  console.log('esbuild build complete.');
  await ctx.dispose();
}
