const import_obsidian3 = require("obsidian");
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
let mathJaxContextPromise = null;
const RESOLVED_ASSET_SOURCE_MAP = /* @__PURE__ */ new Map();
const RESOLVED_ASSET_SOURCE_PREFIX_MAP = /* @__PURE__ */ new Map();
const RESOLVED_ASSET_PREFIX_LENGTH = 256;
function rememberResolvedAssetSource(resolvedUrl, originalPath) {
  RESOLVED_ASSET_SOURCE_MAP.set(resolvedUrl, originalPath);
  RESOLVED_ASSET_SOURCE_PREFIX_MAP.set(
    resolvedUrl.slice(0, RESOLVED_ASSET_PREFIX_LENGTH),
    originalPath
  );
}
function getMimeTypeByPath(path4) {
  const ext = path4.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.get(ext) ?? null;
}
function stringToBase64(value2) {
  const encoded = new TextEncoder().encode(value2);
  let binary2 = "";
  for (const byte of encoded) {
    binary2 += String.fromCharCode(byte);
  }
  return btoa(binary2);
}
function createSvgDataUrl(svg2) {
  return `data:image/svg+xml;base64,${stringToBase64(svg2)}`;
}
function parseSvgLength(rawValue) {
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
function normalizeSvgMarkup(svgMarkup) {
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
async function loadImageFromUrl(url) {
  return await new Promise((resolve2, reject3) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve2(image);
    image.onerror = () => reject3(new Error("SVG 图片栅格化失败"));
    image.src = url;
  });
}
async function svgMarkupToPngDataUrl(svgMarkup) {
  const normalized = normalizeSvgMarkup(svgMarkup);
  const image = await loadImageFromUrl(createSvgDataUrl(normalized.markup));
  const canvas = document.createElement("canvas");
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
function stripMarkdownLinkTarget(target) {
  const trimmed = target.trim().replace(/^<|>$/g, "");
  const spaceIndex = trimmed.search(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex);
}
function normalizeLookupKey(value2) {
  return value2.normalize("NFC").trim();
}
function normalizeMathExpression(expression) {
  return expression.trim().replace(/\\\\(?=[A-Za-z])/g, "\\").replace(/\\\\(?=[,;:!])/g, "\\");
}
function extractWikiEmbedParts(inner2) {
  const [rawPath = "", ...restParts] = inner2.split("|");
  const alt = restParts.map((part) => part.trim()).find((part) => part.length > 0 && !/^\d+(x\d+)?$/i.test(part)) ?? "";
  return {
    rawPath: rawPath.trim(),
    alt
  };
}
function escapeHtml2(text6) {
  return text6.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function createHtmlImageTag(dataUrl, alt, className, originalSource) {
  const sourceAttr = originalSource ? ` data-wxp-source="${escapeHtml2(originalSource)}"` : "";
  return `<img class="${className}" src="${dataUrl}" alt="${escapeHtml2(alt)}"${sourceAttr} />`;
}
function dataUrlToBlobUrl(dataUrl) {
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
function buildBlockImageHtml(dataUrl, alt, className) {
  return `
${createHtmlImageTag(dataUrlToBlobUrl(dataUrl), alt, className)}
`;
}
function buildInlineImageHtml(dataUrl, alt, className) {
  return createHtmlImageTag(dataUrlToBlobUrl(dataUrl), alt, className);
}
function buildResolvedImageReplacement(dataUrl, alt, originalSource) {
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
function buildMathFallbackHtml(expression, display) {
  const text6 = escapeHtml2(normalizeMathExpression(expression));
  return display ? `
<section class="wxp-math-block">${text6}</section>
` : `<span class="wxp-math-inline">${text6}</span>`;
}
function findVaultFile(app, sourceFile, rawLink) {
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
    if (resolvedFile instanceof import_obsidian3.TFile) return resolvedFile;
  }
  const direct = app.metadataCache.getFirstLinkpathDest(link3, sourceFile.path) ?? app.vault.getAbstractFileByPath(link3);
  if (direct instanceof import_obsidian3.TFile) {
    return direct;
  }
  const basename = link3.split("/").pop()?.trim();
  if (!basename) {
    return null;
  }
  const normalizedBasename = normalizeLookupKey(basename);
  return app.vault.getFiles().find((file) => normalizeLookupKey(file.name) === normalizedBasename) ?? null;
}
async function getMermaidRenderer() {
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
async function getMathJaxContext() {
  if (!mathJaxContextPromise) {
    mathJaxContextPromise = Promise.all([
      Promise.resolve().then(() => __toESM(require_mathjax(), 1)),
      Promise.resolve().then(() => __toESM(require_tex(), 1)),
      Promise.resolve().then(() => __toESM(require_svg(), 1)),
      Promise.resolve().then(() => __toESM(require_liteAdaptor(), 1)),
      Promise.resolve().then(() => __toESM(require_html(), 1)),
      Promise.resolve().then(() => __toESM(require_AllPackages(), 1))
    ]).then(([mathjaxModule, texModule, svgModule, adaptorModule, handlerModule, packagesModule]) => {
      const adaptor = adaptorModule.liteAdaptor();
      handlerModule.RegisterHTMLHandler(adaptor);
      const tex = new texModule.TeX({
        packages: packagesModule.AllPackages
      });
      const svg2 = new svgModule.SVG({
        fontCache: "none"
      });
      const document2 = mathjaxModule.mathjax.document("", {
        InputJax: tex,
        OutputJax: svg2
      });
      return {
        convert: document2.convert.bind(document2),
        adaptor: {
          outerHTML: (node2) => adaptor.outerHTML(node2)
        }
      };
    });
  }
  return await mathJaxContextPromise;
}
function createHiddenRenderHost(className) {
  const host = document.createElement("div");
  host.className = `weixin-mp-publisher-hidden-host ${className}`;
  document.body.appendChild(host);
  return host;
}
function waitForMermaidSvg(container2, timeout2) {
  return new Promise((resolve2) => {
    const existing = container2.querySelector("svg");
    if (existing instanceof SVGSVGElement) {
      resolve2(existing);
      return;
    }
    const observer = new MutationObserver(() => {
      const el = container2.querySelector("svg");
      if (el instanceof SVGSVGElement) {
        observer.disconnect();
        clearTimeout(timer3);
        resolve2(el);
      }
    });
    observer.observe(container2, { childList: true, subtree: true });
    const timer3 = setTimeout(() => {
      observer.disconnect();
      const el = container2.querySelector("svg");
      resolve2(el instanceof SVGSVGElement ? el : null);
    }, timeout2);
  });
}
async function renderMermaidViaObsidian(app, sourceFile, code) {
  const container2 = document.createElement("div");
  container2.className = "wxp-mermaid-obsidian-render";
  document.body.appendChild(container2);
  const component2 = new import_obsidian3.Component();
  component2.load();
  try {
    await import_obsidian3.MarkdownRenderer.render(
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
async function renderMermaidToDataUrl(app, sourceFile, code) {
  try {
    return await renderMermaidViaObsidian(app, sourceFile, code);
  } catch (obsidianError) {
    console.warn("Obsidian Mermaid 渲染失败，回退到 npm mermaid", obsidianError);
  }
  const mermaid2 = await getMermaidRenderer();
  const uid = globalThis.crypto?.randomUUID?.().replaceAll("-", "") ?? Date.now().toString(16);
  const renderId = `wxpmermaid${uid}`;
  const host = createHiddenRenderHost("wxp-mermaid-render-host");
  try {
    const { svg: svg2 } = await mermaid2.render(renderId, code.trim(), host);
    return svgMarkupToPngDataUrl(svg2);
  } finally {
    host.remove();
  }
}
async function renderMathToDataUrl(expression, display) {
  const { convert, adaptor } = await getMathJaxContext();
  const node2 = convert(normalizeMathExpression(expression), { display });
  const svgMarkup = adaptor.outerHTML(node2);
  return svgMarkupToPngDataUrl(svgMarkup);
}
async function resolveVaultImageToDataUrl(app, sourceFile, rawLink) {
  const link3 = decodeURIComponent(rawLink).trim().replace(/^<|>$/g, "");
  if (/^(https?:|data:)/i.test(link3)) {
    return link3;
  }
  const file = findVaultFile(app, sourceFile, link3);
  if (!(file instanceof import_obsidian3.TFile)) {
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
async function resolveAssetLinkForWechat(app, sourceFile, rawLink) {
  return resolveVaultImageToDataUrl(app, sourceFile, rawLink);
}
function lookupOriginalAssetSource(resolvedUrl) {
  return RESOLVED_ASSET_SOURCE_MAP.get(resolvedUrl) ?? RESOLVED_ASSET_SOURCE_PREFIX_MAP.get(
    resolvedUrl.slice(0, RESOLVED_ASSET_PREFIX_LENGTH)
  ) ?? null;
}
async function preprocessMarkdownForWechat(app, sourceFile, markdown2) {
  let output2 = markdown2.replace(
    /(?<!!)\[\[([^\[\]]+?)\]\]/g,
    (_match, inner2) => {
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
async function replaceAsync(input, pattern, replacer) {
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

