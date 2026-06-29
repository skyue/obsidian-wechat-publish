import { App, TFile, MarkdownRenderer, Component } from 'obsidian';
import katex from 'katex';
// @ts-ignore - imported as text via esbuild loader
import katexCSS from 'katex/dist/katex.min.css';
const IMAGE_EXTENSIONS = /* @__PURE__ */ new Map([
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["gif", "image/gif"],
  ["webp", "image/webp"],
  ["svg", "image/svg+xml"],
  ["bmp", "image/bmp"]
]);
let mermaidPromise = null;
const RESOLVED_ASSET_SOURCE_MAP: Map<string, string> = /* @__PURE__ */ new Map();
const RESOLVED_ASSET_SOURCE_PREFIX_MAP: Map<string, string> = /* @__PURE__ */ new Map();
const RESOLVED_ASSET_PREFIX_LENGTH = 256;
function rememberResolvedAssetSource(resolvedUrl: string, originalPath: string): void {
  RESOLVED_ASSET_SOURCE_MAP.set(resolvedUrl, originalPath);
  RESOLVED_ASSET_SOURCE_PREFIX_MAP.set(
    resolvedUrl.slice(0, RESOLVED_ASSET_PREFIX_LENGTH),
    originalPath
  );
}
function getMimeTypeByPath(path4: string): string | null {
  const ext = path4.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.get(ext) ?? null;
}
function stringToBase64(value2: string): string {
  const encoded = new TextEncoder().encode(value2);
  let binary2 = "";
  for (const byte of encoded) {
    binary2 += String.fromCharCode(byte);
  }
  return btoa(binary2);
}
function createSvgDataUrl(svg2: string): string {
  return `data:image/svg+xml;base64,${stringToBase64(svg2)}`;
}
function parseSvgLength(rawValue: string): number | null {
  if (!rawValue) {
    return null;
  }
  const value2 = rawValue.trim();
  if (!value2 || value2.endsWith("%")) {
    return null;
  }
  const match2 = value2.match(/^([0-9]*\.?[0-9]+)(px|pt|pc|mm|cm|in|em|rem|ex)?$/i);
  if (!match2) {
    return null;
  }
  const numeric = Number.parseFloat(match2[1]);
  const unit2 = (match2[2] ?? "px").toLowerCase();
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  switch (unit2) {
    case "px":
      return numeric;
    case "pt":
      return numeric * (96 / 72);
    case "pc":
      return numeric * 16;
    case "mm":
      return numeric * (96 / 25.4);
    case "cm":
      return numeric * (96 / 2.54);
    case "in":
      return numeric * 96;
    case "em":
    case "rem":
      return numeric * 16;
    case "ex":
      return numeric * 8;
    default:
      return numeric;
  }
}
function normalizeSvgMarkup(svgMarkup: string): { markup: string; width: number; height: number } {
  const fallbackWidth = 800;
  const fallbackHeight = 450;
  const parser27 = new DOMParser();
  const svgDocument = parser27.parseFromString(svgMarkup, "image/svg+xml");
  let svgEl = svgDocument.documentElement;
  if (!svgEl || svgEl.nodeName.toLowerCase() !== "svg") {
    const htmlDocument = parser27.parseFromString(svgMarkup, "text/html");
    svgEl = htmlDocument.querySelector("svg");
  }
  if (!svgEl || svgEl.nodeName.toLowerCase() !== "svg") {
    throw new Error("SVG 内容无效");
  }
  const viewBox = svgEl.getAttribute("viewBox")?.trim() ?? "";
  const viewBoxParts = viewBox.split(/[\s,]+/).map((part) => Number.parseFloat(part)).filter((part) => Number.isFinite(part));
  const viewBoxWidth = viewBoxParts.length === 4 && viewBoxParts[2] > 0 ? viewBoxParts[2] : null;
  const viewBoxHeight = viewBoxParts.length === 4 && viewBoxParts[3] > 0 ? viewBoxParts[3] : null;
  const width3 = Math.max(
    1,
    Math.round(parseSvgLength(svgEl.getAttribute("width")) ?? viewBoxWidth ?? fallbackWidth)
  );
  const height2 = Math.max(
    1,
    Math.round(parseSvgLength(svgEl.getAttribute("height")) ?? viewBoxHeight ?? fallbackHeight)
  );
  if (!svgEl.getAttribute("xmlns")) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  svgEl.setAttribute("width", String(width3));
  svgEl.setAttribute("height", String(height2));
  if (!viewBoxWidth || !viewBoxHeight) {
    svgEl.setAttribute("viewBox", `0 0 ${width3} ${height2}`);
  }
  return {
    markup: new XMLSerializer().serializeToString(svgEl),
    width: width3,
    height: height2
  };
}
async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return await new Promise((resolve2, reject3) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve2(image);
    image.onerror = () => reject3(new Error("SVG 图片栅格化失败"));
    image.src = url;
  });
}
async function svgMarkupToPngDataUrl(svgMarkup: string): Promise<string> {
  const normalized = normalizeSvgMarkup(svgMarkup);
  const image = await loadImageFromUrl(createSvgDataUrl(normalized.markup));
  const canvas = activeDocument.createElement("canvas");
  canvas.width = normalized.width;
  canvas.height = normalized.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法创建 SVG 栅格化画布");
  }
  context.clearRect(0, 0, normalized.width, normalized.height);
  context.drawImage(image, 0, 0, normalized.width, normalized.height);
  return canvas.toDataURL("image/png");
}
function stripMarkdownLinkTarget(target: string): string {
  const trimmed = target.trim().replace(/^<|>$/g, "");
  const spaceIndex = trimmed.search(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex);
}
function normalizeLookupKey(value2: string): string {
  return value2.normalize("NFC").trim();
}
function normalizeMathExpression(expression: string): string {
  return expression.trim().replace(/\\\\(?=[A-Za-z])/g, "\\").replace(/\\\\(?=[,;:!])/g, "\\");
}
function extractWikiEmbedParts(inner2: string): { rawPath: string; alt: string } {
  const [rawPath = "", ...restParts] = inner2.split("|");
  const alt = restParts.map((part: string) => part.trim()).find((part: string) => part.length > 0 && !/^\d+(x\d+)?$/i.test(part)) ?? "";
  return {
    rawPath: rawPath.trim(),
    alt
  };
}
function escapeHtml2(text6: string): string {
  return text6.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function createHtmlImageTag(dataUrl: string, alt: string, className: string, originalSource?: string): string {
  const sourceAttr = originalSource ? ` data-wxp-source="${escapeHtml2(originalSource)}"` : "";
  return `<img class="${className}" src="${dataUrl}" alt="${escapeHtml2(alt)}"${sourceAttr} />`;
}
function dataUrlToBlobUrl(dataUrl: string): string {
  const match2 = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match2) {
    return dataUrl;
  }
  const [, mimeType, base64] = match2;
  const binary2 = atob(base64);
  const bytes = new Uint8Array(binary2.length);
  for (let i3 = 0; i3 < binary2.length; i3++) {
    bytes[i3] = binary2.charCodeAt(i3);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}
function buildBlockImageHtml(dataUrl: string, alt: string, className: string): string {
  return `
${createHtmlImageTag(dataUrlToBlobUrl(dataUrl), alt, className)}
`;
}
function buildInlineImageHtml(dataUrl: string, alt: string, className: string): string {
  return createHtmlImageTag(dataUrlToBlobUrl(dataUrl), alt, className);
}
function buildResolvedImageReplacement(dataUrl: string, alt: string, originalSource?: string): string {
  return `
<figure class="wxp-resolved-figure">
${createHtmlImageTag(
    dataUrl,
    alt,
    "wxp-resolved-image",
    originalSource
  )}
</figure>
`;
}
function buildMathFallbackHtml(expression: string, display: boolean): string {
  const text6 = escapeHtml2(normalizeMathExpression(expression));
  return display ? `
<section class="wxp-math-block">${text6}</section>
` : `<span class="wxp-math-inline">${text6}</span>`;
}
function findVaultFile(app: App, sourceFile: TFile, rawLink: string): TFile | null {
  const link3 = decodeURIComponent(rawLink).split("#")[0]?.trim();
  if (!link3 || /^(https?:|data:)/i.test(link3)) {
    return null;
  }
  if (link3.startsWith("./") || link3.startsWith("../") || link3.startsWith("..\\")) {
    const parts = sourceFile.path.split("/").slice(0, -1);
    for (const segment of link3.replace(/\\/g, "/").split("/")) {
      if (segment === "..") parts.pop();
      else if (segment !== ".") parts.push(segment);
    }
    const resolvedPath = parts.join("/");
    const resolvedFile = app.vault.getAbstractFileByPath(resolvedPath);
    if (resolvedFile instanceof TFile) return resolvedFile;
  }
  const direct = app.metadataCache.getFirstLinkpathDest(link3, sourceFile.path) ?? app.vault.getAbstractFileByPath(link3);
  if (direct instanceof TFile) {
    return direct;
  }
  const basename = link3.split("/").pop()?.trim();
  if (!basename) {
    return null;
  }
  const normalizedBasename = normalizeLookupKey(basename);
  return app.vault.getFiles().find((file) => normalizeLookupKey(file.name) === normalizedBasename) ?? null;
}
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await -- Mermaid loaded dynamically via globals, no TS types available */

async function getMermaidRenderer(): Promise<{ render(id: string, code: string, host: HTMLElement): Promise<{ svg: string }> }> {
  if (!mermaidPromise) {
    mermaidPromise = Promise.resolve().then(() => (init_mermaid_core(), mermaid_core_exports)).then(async (module2) => {
      const mermaid2 = module2.default;
      mermaid2.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "default"
      });
      return mermaid2;
    });
  }
  return mermaidPromise;
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await -- Mermaid loaded dynamically via globals, no TS types available */

function measureKatex(expression: string, display: boolean): { width: number; height: number } {
  const host = activeDocument.createElement("div");
  host.style.cssText = "position:absolute;visibility:hidden;top:-9999px;left:-9999px;";
  host.innerHTML = katex.renderToString(expression, {
    throwOnError: false,
    displayMode: display,
    output: "html"
  });
  activeDocument.body.appendChild(host);
  const rect = host.getBoundingClientRect();
  const w = Math.max(1, Math.ceil(rect.width || 200));
  const h = Math.max(1, Math.ceil(rect.height || 40));
  host.remove();
  return { width: w, height: h };
}
function createHiddenRenderHost(className: string): HTMLElement {
  const host = activeDocument.createElement("div");
  host.className = `weixin-mp-publisher-hidden-host ${className}`;
  activeDocument.body.appendChild(host);
  return host;
}
function waitForMermaidSvg(container2: HTMLElement, timeout2: number): Promise<SVGSVGElement> {
  return new Promise((resolve2) => {
    const existing = container2.querySelector("svg");
    if (existing) {
      resolve2(existing);
      return;
    }
    const observer = new MutationObserver(() => {
      const el = container2.querySelector("svg");
      if (el) {
        observer.disconnect();
        window.clearTimeout(timer3);
        resolve2(el);
      }
    });
    observer.observe(container2, { childList: true, subtree: true });
    const timer3 = window.setTimeout(() => {
      observer.disconnect();
      const el = container2.querySelector("svg");
      resolve2(el ?? null);
    }, timeout2);
  });
}
async function renderMermaidViaObsidian(app: App, sourceFile: TFile, code: string): Promise<string> {
  const container2 = activeDocument.createElement("div");
  container2.className = "wxp-mermaid-obsidian-render";
  activeDocument.body.appendChild(container2);
  const component2 = new Component();
  component2.load();
  try {
    await MarkdownRenderer.render(
      app,
      "```mermaid\n" + code + "\n```",
      container2,
      sourceFile.path,
      component2
    );
    const svgEl = await waitForMermaidSvg(container2, 8e3);
    if (!svgEl) {
      throw new Error("Obsidian Mermaid 渲染超时，未获得 SVG");
    }
    const svgMarkup = new XMLSerializer().serializeToString(svgEl);
    return svgMarkupToPngDataUrl(svgMarkup);
  } finally {
    component2.unload();
    container2.remove();
  }
}
async function renderMermaidToDataUrl(app: App, sourceFile: TFile, code: string): Promise<string> {
  try {
    return await renderMermaidViaObsidian(app, sourceFile, code);
  } catch (obsidianError) {
    console.warn("Obsidian Mermaid 渲染失败，回退到 npm mermaid", obsidianError);
  }
  const mermaid2 = await getMermaidRenderer();
  const uid = window.crypto?.randomUUID?.().replaceAll("-", "") ?? Date.now().toString(16);
  const renderId = `wxpmermaid${uid}`;
  const host = createHiddenRenderHost("wxp-mermaid-render-host");
  try {
    const { svg: svg2 } = await mermaid2.render(renderId, code.trim(), host);
    return svgMarkupToPngDataUrl(svg2);
  } finally {
    host.remove();
  }
}
async function renderMathToDataUrl(expression: string, display: boolean): Promise<string> {
  const normalized = normalizeMathExpression(expression);
  const html = katex.renderToString(normalized, {
    throwOnError: false,
    displayMode: display,
    output: "html"
  });
  const dims = measureKatex(normalized, display);
  const padding = 8;
  const svgWidth = dims.width + padding * 2;
  const svgHeight = dims.height + padding * 2;
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
<foreignObject width="100%" height="100%">
<div xmlns="http://www.w3.org/1999/xhtml" style="padding:${padding}px">
<style>${katexCSS}</style>
${html}
</div>
</foreignObject>
</svg>`;
  return svgMarkupToPngDataUrl(svgMarkup);
}
// eslint-disable-next-line @typescript-eslint/require-await -- function signature requires Promise return for API consistency
async function resolveVaultImageToDataUrl(app: App, sourceFile: TFile, rawLink: string): Promise<string | null> {
  const link3 = decodeURIComponent(rawLink).trim().replace(/^<|>$/g, "");
  if (/^(https?:|data:)/i.test(link3)) {
    return link3;
  }
  const file = findVaultFile(app, sourceFile, link3);
  if (!(file instanceof TFile)) {
    return null;
  }
  const mimeType = getMimeTypeByPath(file.path);
  if (!mimeType) {
    return null;
  }
  const resourcePath = app.vault.getResourcePath(file);
  rememberResolvedAssetSource(resourcePath, file.path);
  return resourcePath;
}
export async function resolveAssetLinkForWechat(app: App, sourceFile: TFile, rawLink: string): Promise<string | null> {
  return resolveVaultImageToDataUrl(app, sourceFile, rawLink);
}
export function lookupOriginalAssetSource(resolvedUrl: string): string | null {
  return RESOLVED_ASSET_SOURCE_MAP.get(resolvedUrl) ?? RESOLVED_ASSET_SOURCE_PREFIX_MAP.get(
    resolvedUrl.slice(0, RESOLVED_ASSET_PREFIX_LENGTH)
  ) ?? null;
}
export async function preprocessMarkdownForWechat(app: App, sourceFile: TFile, markdown2: string): Promise<string> {
  let output2 = markdown2.replace(
    /(?<!!)\[\[([^[\]]+?)\]\]/g,
    (_match: string, inner2: string) => {
      const parts2 = inner2.split("|");
      const target3 = parts2[0]?.trim() ?? "";
      const alias = parts2.slice(1).filter((p2) => p2.trim()).at(-1)?.trim();
      return alias || target3;
    }
  );
  output2 = await replaceAsync(
    output2,
    /^```mermaid\r?\n([\s\S]*?)\r?\n```\s*$/gm,
    async (_match, code) => {
      try {
        const dataUrl = await renderMermaidToDataUrl(app, sourceFile, code);
        return buildBlockImageHtml(dataUrl, "Mermaid 图表", "wxp-rendered-mermaid");
      } catch (error3) {
        console.error("Mermaid 渲染失败", error3);
        return _match;
      }
    }
  );
  output2 = await replaceAsync(
    output2,
    /^\$\$\s*\n?([\s\S]*?)\n?\$\$\s*$/gm,
    async (_match, expression) => {
      try {
        const dataUrl = await renderMathToDataUrl(expression, true);
        return buildBlockImageHtml(dataUrl, "数学公式", "wxp-rendered-math");
      } catch (error3) {
        console.error("块级公式渲染失败", error3);
        return buildMathFallbackHtml(expression, true);
      }
    }
  );
  output2 = await replaceAsync(
    output2,
    /\\\[([\s\S]*?)\\\]/g,
    async (_match, expression) => {
      try {
        const dataUrl = await renderMathToDataUrl(expression, true);
        return buildBlockImageHtml(dataUrl, "数学公式", "wxp-rendered-math");
      } catch (error3) {
        console.error("LaTeX 块级公式渲染失败", error3);
        return buildMathFallbackHtml(expression, true);
      }
    }
  );
  output2 = await replaceAsync(
    output2,
    /\\\(([\s\S]*?)\\\)/g,
    async (_match, expression) => {
      try {
        const dataUrl = await renderMathToDataUrl(expression, false);
        return buildInlineImageHtml(dataUrl, "公式", "wxp-inline-math-image");
      } catch (error3) {
        console.error("LaTeX 行内公式渲染失败", error3);
        return buildMathFallbackHtml(expression, false);
      }
    }
  );
  output2 = await replaceAsync(
    output2,
    /\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    async (_match, expression) => {
      try {
        const dataUrl = await renderMathToDataUrl(expression, false);
        return buildInlineImageHtml(dataUrl, "公式", "wxp-inline-math-image");
      } catch (error3) {
        console.error("行内公式渲染失败", error3);
        return buildMathFallbackHtml(expression, false);
      }
    }
  );
  output2 = await replaceAsync(
    output2,
    /!\[\[([^[\]]+?)\]\]/g,
    async (token2, inner2) => {
      const { rawPath, alt: alias } = extractWikiEmbedParts(inner2.trim());
      try {
        const dataUrl = await resolveVaultImageToDataUrl(app, sourceFile, rawPath);
        if (!dataUrl) {
          return token2;
        }
        const alt = alias.trim() || rawPath.split("/").pop() || "image";
        return buildResolvedImageReplacement(dataUrl, alt, rawPath);
      } catch (error3) {
        console.error("处理 Wiki 图片失败", rawPath, error3);
        return token2;
      }
    }
  );
  output2 = await replaceAsync(
    output2,
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    async (token2, alt, target) => {
      try {
        const dataUrl = await resolveVaultImageToDataUrl(
          app,
          sourceFile,
          stripMarkdownLinkTarget(target)
        );
        if (!dataUrl || dataUrl === stripMarkdownLinkTarget(target)) {
          return token2;
        }
        return buildResolvedImageReplacement(
          dataUrl,
          alt,
          stripMarkdownLinkTarget(target)
        );
      } catch (error3) {
        console.error("处理 Markdown 图片失败", target, error3);
        return token2;
      }
    }
  );
  return output2;
}
async function replaceAsync(input: string, pattern: RegExp, replacer: (...matches: string[]) => string | Promise<string>): Promise<string> {
  const matches33 = Array.from(input.matchAll(pattern));
  if (matches33.length === 0) {
    return input;
  }
  let output2 = input;
  for (const match2 of matches33) {
    const token2 = match2[0];
    const replacement = await replacer(...match2);
    output2 = output2.replace(token2, replacement);
  }
  return output2;
}

