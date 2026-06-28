import { App, TFile, requestUrl, normalizePath } from 'obsidian';
import { HtmlImageRef, PublisherAccount, PublishInput, PublishResult, ArticleImageRecord, CoverMediaRecord, ImageAsset, RehostResult, ParsedDataUrl, WechatApiJson } from './types.ts';
import { resolveAssetLinkForWechat, lookupOriginalAssetSource } from './markdown-pipeline.ts';
const PLACEHOLDER_PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAIAAAAUvlBOAAABmElEQVR4nO3SQQkAIADAQBObxDgGtIRDkIMLsMfGXBuuG88L+JKxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIvEAXiM4h0Wv2iTAAAAAElFTkSuQmCC";
const RELAY_BASE_URL = "https://mp.skyue.com/api/proxy";
const REQUEST_TIMEOUT_MS = 45e3;
const UPLOAD_TIMEOUT_MS = 12e4;

interface WechatRequestOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  contentType?: string;
  account?: PublisherAccount;
  timeoutMs?: number;
  requestLabel?: string;
}
const COVER_MAX_WIDTH = 1280;
const COVER_MAX_HEIGHT = 1280;
const COVER_JPEG_QUALITY = 0.82;
const ARTICLE_MAX_BYTES = 9e5;
const ARTICLE_MAX_WIDTH = 1920;
const ARTICLE_MAX_HEIGHT = 1920;
const ARTICLE_JPEG_QUALITY = 0.85;
const IMAGE_EXTENSIONS2 = /* @__PURE__ */ new Map([
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["gif", "image/gif"],
  ["webp", "image/webp"],
  ["svg", "image/svg+xml"],
  ["bmp", "image/bmp"]
]);
function normalizeLookupKey2(value2: string): string {
  return value2.trim().toLowerCase();
}
function extractHtmlImageRefs(html5: string): HtmlImageRef[] {
  if (typeof DOMParser !== "undefined") {
    try {
      const document2 = new DOMParser().parseFromString(html5, "text/html");
      const refs2: HtmlImageRef[] = [];
      const seen2 = /* @__PURE__ */ new Set<string>();
      for (const image of Array.from(document2.querySelectorAll("img"))) {
        const src = image.getAttribute("src")?.trim();
        if (!src) {
          continue;
        }
        const originalSource = image.getAttribute("data-wxp-source")?.trim() || void 0;
        const key = `${src}::${originalSource ?? ""}`;
        if (seen2.has(key)) {
          continue;
        }
        seen2.add(key);
        refs2.push({
          src,
          originalSource
        });
      }
      return refs2;
    } catch (error3) {
      console.warn("DOMParser 解析图片引用失败，回退正则提取", error3);
    }
  }
  const matches33 = html5.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g);
  const refs: HtmlImageRef[] = [];
  const seen = /* @__PURE__ */ new Set<string>();
  for (const match2 of matches33) {
    const tag2 = match2[0];
    const src = match2[1];
    const originalSource = tag2.match(/\bdata-wxp-source="([^"]+)"/)?.[1];
    const key = `${src}::${originalSource ?? ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    refs.push({
      src,
      originalSource
    });
  }
  return refs;
}
function extractFirstHtmlImageUrl(html5: string): string | null {
  const ref = extractHtmlImageRefs(html5)[0];
  if (!ref) return null;
  return ref.originalSource || ref.src;
}
function parseDataUrl(dataUrl: string): ParsedDataUrl | null {
  if (!dataUrl.startsWith("data:")) {
    return null;
  }
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }
  const header = dataUrl.slice("data:".length, commaIndex);
  const data6 = dataUrl.slice(commaIndex + 1);
  const headerParts = header.split(";").map((part) => part.trim()).filter(Boolean);
  const mimeType = headerParts.find((part) => part.includes("/"))?.toLowerCase() ?? "application/octet-stream";
  return {
    mimeType,
    data: data6,
    isBase64: headerParts.some((part) => part.toLowerCase() === "base64")
  };
}
function base64ToUint8Array(base64: string): Uint8Array {
  const candidates = [
    base64,
    base64.replace(/\s+/g, ""),
    base64.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
  ].map((value2) => {
    const padding2 = value2.length % 4;
    return padding2 === 0 ? value2 : value2 + "=".repeat(4 - padding2);
  });
  for (const candidate of candidates) {
    try {
      const binary2 = atob(candidate);
      const bytes = new Uint8Array(binary2.length);
      for (let index2 = 0; index2 < binary2.length; index2 += 1) {
        bytes[index2] = binary2.charCodeAt(index2);
      }
      return bytes;
    } catch {
      continue;
    }
  }
  throw new Error("base64 数据解码失败");
}
function plainDataToUint8Array(data6: string): Uint8Array {
  try {
    return new TextEncoder().encode(decodeURIComponent(data6));
  } catch {
    return new TextEncoder().encode(data6);
  }
}
function getMimeTypeByPath2(path4: string): string | null {
  const ext = path4.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS2.get(ext) ?? null;
}
function findVaultFile2(app: App, sourceFile: TFile, rawLink: string): TFile | null {
  const link3 = decodeURIComponent(rawLink).split("#")[0]?.trim().replace(/^<|>$/g, "");
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
  const normalizedBasename = normalizeLookupKey2(basename);
  return app.vault.getFiles().find((file) => normalizeLookupKey2(file.name) === normalizedBasename) ?? null;
}
function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((sum2, part) => sum2 + part.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.byteLength;
  }
  return merged;
}
function guessExtension(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  return "jpg";
}
function previewSource(value2: string, limit2: number = 160): string {
  if (!value2) {
    return "";
  }
  return value2.length > limit2 ? `${value2.slice(0, limit2)}...` : value2;
}
function compactWechatHtmlForSubmit(html5: string): string {
  return html5.replace(
    /<a\b[^>]*\bhref=(["'])https:\/\/mp\.weixin\.qq\.com\/cgi-bin\/[^"']*\1[^>]*>([\s\S]*?)<\/a>/gi,
    "$2"
  ).replace(/\sdata-wxp-source="[^"]*"/g, "").replace(/\sclass="[^"]*"/g, "").replace(/box-sizing:\s*border-box;?/gi, "").replace(/style="\s*([^"]*?)\s*"/g, (_match: string, styleText: string) => {
    const cleaned = styleText.split(";").map((part: string) => part.trim()).filter(Boolean).join(";");
    return cleaned ? ` style="${cleaned}"` : "";
  }).replace(/>[ \t\r\n\f\v]+</g, "><").replace(/[ \t\r\n\f\v]{2,}/g, " ").trim();
}
function countRemainingDataImages(html5: string): number {
  return (html5.match(/<img\b[^>]*\bsrc="data:[^"]*"/g) || []).length;
}
function safeGetVaultResourcePath(app: App, target: TFile | string): string | undefined {
  try {
    const value2 = app.vault.getResourcePath(target);
    return typeof value2 === "string" && value2.trim() ? value2 : void 0;
  } catch {
    return void 0;
  }
}
function safeGetAdapterFullPath(app: App, normalizedPath: string): string | undefined {
  try {
    const adapter2 = app.vault.adapter;
    if (typeof adapter2.getFullPath !== "function") {
      return void 0;
    }
    const value2 = (adapter2 as { getFullPath(path: string): string }).getFullPath(normalizedPath);
    return typeof value2 === "string" && value2.trim() ? value2 : void 0;
  } catch {
    return void 0;
  }
}
function isWechatPreferredArticleImageType(contentType: string): boolean {
  return /(image\/png|image\/jpeg|image\/jpg)/i.test(contentType);
}
function bytesToUtf8String(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function fallbackHashBytes(bytes: Uint8Array): string {
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return hash.toString(16).padStart(8, "0");
}
async function createCoverMediaSourceKey(asset: ImageAsset): Promise<string> {
  const cryptoApi = window.crypto;
  const hash = cryptoApi?.subtle && typeof cryptoApi.subtle.digest === "function" ? bytesToHex(
    new Uint8Array(
      await cryptoApi.subtle.digest("SHA-256", bytesToArrayBuffer(asset.bytes))
    )
  ) : fallbackHashBytes(asset.bytes);
  return `${asset.contentType.toLowerCase()}:${asset.bytes.byteLength}:${hash}`;
}
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
// Electron / Node.js interop helpers — these platform APIs have no TS types.

function toElectronBinary(bytes: Uint8Array): any {
  const runtime = window;
  return runtime.Buffer?.from ? runtime.Buffer.from(bytes) : bytes;
}
function getElectronNativeImage(): any {
  try {
    const runtime = window;
    const electronModule = runtime.require?.("electron");
    return electronModule?.nativeImage ?? null;
  } catch {
    return null;
  }
}
function getNodeRequire(): any {
  try {
    const runtime = window;
    return runtime.require ?? null;
  } catch {
    return null;
  }
}
function requireOptional(runtimeRequire: any, names: string[]): any {
  for (const name of names) {
    try {
      return runtimeRequire(name);
    } catch {
      continue;
    }
  }
  return null;
}
function convertAssetWithSips(asset: ImageAsset, targetFormat: string): ImageAsset | null {
  if (asset.sourceUrl?.startsWith("data:") || !asset.filename) {
    return null;
  }
  const runtimeRequire = getNodeRequire();
  if (!runtimeRequire) {
    return null;
  }
  try {
    const fs = requireOptional(runtimeRequire, ["node:fs", "fs"]);
    const os = requireOptional(runtimeRequire, ["node:os", "os"]);
    const path4 = requireOptional(runtimeRequire, ["node:path", "path"]);
    const childProcess = requireOptional(runtimeRequire, ["node:child_process", "child_process"]);
    const processRef = requireOptional(runtimeRequire, ["node:process", "process"]);
    if (!fs || !os || !path4 || !childProcess || !processRef) {
      return null;
    }
    if (processRef.platform !== "darwin") {
      return null;
    }
    const tmpDir = typeof os.tmpdir === "function" ? os.tmpdir() : "";
    const join = typeof path4.join === "function" ? path4.join.bind(path4) : null;
    if (!tmpDir || typeof tmpDir !== "string" || !join) {
      return null;
    }
    const tempDir = fs.mkdtempSync(join(tmpDir, "wxp-image-"));
    const inputExt = asset.filename.split(".").pop()?.toLowerCase() || guessExtension(asset.contentType);
    const outputExt = targetFormat === "jpeg" ? "jpg" : "png";
    const inputPath = join(tempDir, `input.${inputExt}`);
    const outputPath = join(tempDir, `output.${outputExt}`);
    try {
      fs.writeFileSync(inputPath, asset.bytes);
      childProcess.execFileSync(
        "sips",
        ["-s", "format", targetFormat, inputPath, "--out", outputPath],
        { stdio: "ignore" }
      );
      const converted = fs.readFileSync(outputPath);
      return {
        bytes: new Uint8Array(converted),
        contentType: targetFormat === "jpeg" ? "image/jpeg" : "image/png",
        filename: asset.filename.replace(/\.[^.]+$/, "") + `.${outputExt}`
      };
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (error3) {
    console.warn("sips 图片转换失败", {
      filename: asset.filename,
      contentType: asset.contentType,
      targetFormat,
      error: error3 as Error
    });
    return null;
  }
}
function createElectronImageFromAsset(nativeImage: any, asset: ImageAsset): any {
  if (asset.filePath && nativeImage.createFromPath) {
    try {
      const image = nativeImage.createFromPath(asset.filePath);
      if (!image.isEmpty()) {
        return image;
      }
    } catch (error3) {
      console.warn("Electron nativeImage 通过文件路径解码失败，尝试回退 data URL / Buffer", {
        filename: asset.filename,
        contentType: asset.contentType,
        filePath: asset.filePath,
        error: error3 as Error
      });
    }
  }
  if (asset.sourceUrl?.startsWith("data:") && nativeImage.createFromDataURL) {
    try {
      const image = nativeImage.createFromDataURL(asset.sourceUrl);
      if (!image.isEmpty()) {
        return image;
      }
    } catch (error3) {
      console.warn("Electron nativeImage 通过 data URL 解码失败，尝试回退 Buffer", {
        filename: asset.filename,
        contentType: asset.contentType,
        error: error3 as Error
      });
    }
  }
  try {
    const image = nativeImage.createFromBuffer(toElectronBinary(asset.bytes));
    return image.isEmpty() ? null : image;
  } catch (error3) {
    console.warn("Electron nativeImage 通过 Buffer 解码失败", {
      filename: asset.filename,
      contentType: asset.contentType,
      error: error3 as Error
    });
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
function stringToBase642(value2: string): string {
  const encoded = new TextEncoder().encode(value2);
  let binary2 = "";
  for (const byte of encoded) {
    binary2 += String.fromCharCode(byte);
  }
  return btoa(binary2);
}
function parseSvgLength2(rawValue: string): number | null {
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
function normalizeSvgMarkup2(svgMarkup: string): { markup: string; width: number; height: number } {
  const fallbackWidth = 800;
  const fallbackHeight = 450;
  const parser27 = new DOMParser();
  const document2 = parser27.parseFromString(svgMarkup, "image/svg+xml");
  const svgEl = document2.documentElement;
  if (!svgEl || svgEl.nodeName.toLowerCase() !== "svg") {
    throw new Error("SVG 内容无效");
  }
  const viewBox = svgEl.getAttribute("viewBox")?.trim() ?? "";
  const viewBoxParts = viewBox.split(/[\s,]+/).map((part) => Number.parseFloat(part)).filter((part) => Number.isFinite(part));
  const viewBoxWidth = viewBoxParts.length === 4 && viewBoxParts[2] > 0 ? viewBoxParts[2] : null;
  const viewBoxHeight = viewBoxParts.length === 4 && viewBoxParts[3] > 0 ? viewBoxParts[3] : null;
  const width3 = Math.max(
    1,
    Math.round(parseSvgLength2(svgEl.getAttribute("width")) ?? viewBoxWidth ?? fallbackWidth)
  );
  const height2 = Math.max(
    1,
    Math.round(parseSvgLength2(svgEl.getAttribute("height")) ?? viewBoxHeight ?? fallbackHeight)
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
async function loadImageFromUrl2(url: string, cleanup2: (() => void) | undefined, errorMessage: string = "图片解码失败"): Promise<HTMLImageElement> {
  return await new Promise((resolve2, reject3) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      cleanup2?.();
      resolve2(image);
    };
    image.onerror = () => {
      cleanup2?.();
      reject3(new Error(errorMessage));
    };
    image.src = url;
  });
}
async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(blob);
  return loadImageFromUrl2(objectUrl, () => URL.revokeObjectURL(objectUrl));
}
async function loadRasterImage(asset: ImageAsset): Promise<{ drawable: CanvasImageSource; width: number; height: number }> {
  if (asset.contentType.includes("svg")) {
    return loadSvgImage(asset);
  }
  const blob = new Blob(
    [bytesToArrayBuffer(asset.bytes)],
    { type: asset.contentType }
  );
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      return {
        drawable: bitmap,
        width: bitmap.width,
        height: bitmap.height
      };
    } catch (error3) {
      console.warn("createImageBitmap 解码失败，回退 HTMLImageElement", {
        filename: asset.filename,
        contentType: asset.contentType,
        error: error3 as Error
      });
    }
  }
  if (asset.sourceUrl && !asset.sourceUrl.startsWith("data:")) {
    try {
      const image = await loadImageFromUrl2(asset.sourceUrl, void 0, "图片解码失败");
      return {
        drawable: image,
        width: image.naturalWidth || image.width || 0,
        height: image.naturalHeight || image.height || 0
      };
    } catch (error3) {
      console.warn("资源路径解码失败，继续回退 Blob 解码", {
        filename: asset.filename,
        contentType: asset.contentType,
        sourceUrl: asset.sourceUrl,
        error: error3 as Error
      });
    }
  }
  try {
    const image = await loadImageFromBlob(blob);
    return {
      drawable: image,
      width: image.naturalWidth || image.width || 0,
      height: image.naturalHeight || image.height || 0
    };
  } catch (blobError) {
    if (!asset.sourceUrl?.startsWith("data:")) {
      throw new Error(
        `图片解码失败：${asset.filename} (${asset.contentType}, ${asset.bytes.byteLength} bytes)${blobError instanceof Error ? `，${blobError.message}` : ""}`
      );
    }
    try {
      const image = await loadImageFromUrl2(asset.sourceUrl, void 0, "图片解码失败");
      return {
        drawable: image,
        width: image.naturalWidth || image.width || 0,
        height: image.naturalHeight || image.height || 0
      };
    } catch (urlError) {
      throw new Error(
        `图片解码失败：${asset.filename} (${asset.contentType}, ${asset.bytes.byteLength} bytes)${blobError instanceof Error ? `，Blob 解码失败：${blobError.message}` : ""}${urlError instanceof Error ? `；data URL 解码失败：${urlError.message}` : ""}`
      );
    }
  }
}
async function loadSvgImage(asset: ImageAsset): Promise<{ drawable: HTMLImageElement; width: number; height: number }> {
  const normalized = normalizeSvgMarkup2(bytesToUtf8String(asset.bytes));
  const image = await loadImageFromUrl2(
    `data:image/svg+xml;base64,${stringToBase642(normalized.markup)}`,
    void 0,
    "SVG 图片解码失败"
  );
  return {
    drawable: image,
    width: normalized.width,
    height: normalized.height
  };
}
async function convertAssetToPng(asset: ImageAsset): Promise<ImageAsset> {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const nativeImage = getElectronNativeImage();
  if (nativeImage) {
    const image = createElectronImageFromAsset(nativeImage, asset);
    if (image) {
      return {
        bytes: new Uint8Array(image.toPNG()),
        contentType: "image/png",
        filename: asset.filename.replace(/\.[^.]+$/, "") + ".png"
      };
    }
    console.warn("Electron nativeImage 转 PNG 失败，回退浏览器画布转换", {
      filename: asset.filename,
      contentType: asset.contentType
    });
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  if (!asset.contentType.includes("svg")) {
    const sipsResult = convertAssetWithSips(asset, "png");
    if (sipsResult) {
      return sipsResult;
    }
  }
  const rasterSource = await loadRasterImage(asset);
  const canvas = activeDocument.createElement("canvas");
  canvas.width = rasterSource.width || 200;
  canvas.height = rasterSource.height || 150;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法创建图片转换画布");
  }
  context.drawImage(rasterSource.drawable, 0, 0, canvas.width, canvas.height);
  const pngBlob = await new Promise<Blob>((resolve2, reject3) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve2(blob);
      } else {
        reject3(new Error("图片转 PNG 失败"));
      }
    }, "image/png");
  });
  return {
    bytes: new Uint8Array(await pngBlob.arrayBuffer()),
    contentType: "image/png",
    filename: asset.filename.replace(/\.[^.]+$/, "") + ".png"
  };
}
async function convertAssetToJpeg(asset: ImageAsset, options3?: { maxWidth?: number; maxHeight?: number; quality?: number }): Promise<ImageAsset> {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const nativeImage = getElectronNativeImage();
  if (nativeImage) {
    let image = createElectronImageFromAsset(nativeImage, asset);
    if (image) {
      const size4 = image.getSize();
      const naturalWidth2 = size4.width || 1;
      const naturalHeight2 = size4.height || 1;
      const widthScale2 = (options3?.maxWidth ?? naturalWidth2) / naturalWidth2;
      const heightScale2 = (options3?.maxHeight ?? naturalHeight2) / naturalHeight2;
      const scale4 = Math.min(1, widthScale2, heightScale2);
      const targetWidth2 = Math.max(1, Math.round(naturalWidth2 * scale4));
      const targetHeight2 = Math.max(1, Math.round(naturalHeight2 * scale4));
      if (targetWidth2 !== naturalWidth2 || targetHeight2 !== naturalHeight2) {
        image = image.resize({
          width: targetWidth2,
          height: targetHeight2,
          quality: "best"
        });
      }
      return {
        bytes: new Uint8Array(
          image.toJPEG(Math.round((options3?.quality ?? COVER_JPEG_QUALITY) * 100))
        ),
        contentType: "image/jpeg",
        filename: asset.filename.replace(/\.[^.]+$/, "") + ".jpg"
      };
    }
    console.warn("Electron nativeImage 转 JPEG 失败，回退浏览器画布转换", {
      filename: asset.filename,
      contentType: asset.contentType
    });
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  if (!asset.contentType.includes("svg")) {
    const sipsResult = convertAssetWithSips(asset, "jpeg");
    if (sipsResult) {
      return sipsResult;
    }
  }
  const rasterSource = await loadRasterImage(asset);
  const naturalWidth = rasterSource.width || 1;
  const naturalHeight = rasterSource.height || 1;
  const widthScale = (options3?.maxWidth ?? naturalWidth) / naturalWidth;
  const heightScale = (options3?.maxHeight ?? naturalHeight) / naturalHeight;
  const scale3 = Math.min(1, widthScale, heightScale);
  const targetWidth = Math.max(1, Math.round(naturalWidth * scale3));
  const targetHeight = Math.max(1, Math.round(naturalHeight * scale3));
  const canvas = activeDocument.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法创建图片转换画布");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(rasterSource.drawable, 0, 0, targetWidth, targetHeight);
  const jpegBlob = await new Promise<Blob>((resolve2, reject3) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve2(blob);
        } else {
          reject3(new Error("图片转 JPEG 失败"));
        }
      },
      "image/jpeg",
      options3?.quality ?? COVER_JPEG_QUALITY
    );
  });
  return {
    bytes: new Uint8Array(await jpegBlob.arrayBuffer()),
    contentType: "image/jpeg",
    filename: asset.filename.replace(/\.[^.]+$/, "") + ".jpg"
  };
}
async function normalizeWechatAsset(asset: ImageAsset): Promise<ImageAsset> {
  const tooLarge = asset.bytes.byteLength > ARTICLE_MAX_BYTES;
  if (isWechatPreferredArticleImageType(asset.contentType) && !tooLarge) {
    return asset;
  }
  if (!tooLarge) {
    try {
      const png2 = await convertAssetToPng(asset);
      if (png2.bytes.byteLength <= ARTICLE_MAX_BYTES) {
        return png2;
      }
      console.debug("[WeiXin MP Publisher] 转 PNG 后体积超限，降级 JPEG 压缩", {
        filename: asset.filename,
        contentType: asset.contentType,
        originalBytes: asset.bytes.byteLength,
        pngBytes: png2.bytes.byteLength
      });
    } catch (error3) {
      console.warn("[WeiXin MP Publisher] 正文图片转 PNG 失败，回退 JPEG 压缩", {
        filename: asset.filename,
        contentType: asset.contentType,
        error: error3 as Error
      });
    }
  }
  return convertAssetToJpeg(asset, {
    maxWidth: ARTICLE_MAX_WIDTH,
    maxHeight: ARTICLE_MAX_HEIGHT,
    quality: ARTICLE_JPEG_QUALITY
  });
}
async function normalizeWechatCoverAsset(asset: ImageAsset): Promise<ImageAsset> {
  return convertAssetToJpeg(asset, {
    maxWidth: COVER_MAX_WIDTH,
    maxHeight: COVER_MAX_HEIGHT,
    quality: COVER_JPEG_QUALITY
  });
}
async function forceSafeWechatAsset(endpoint: string, asset: ImageAsset): Promise<ImageAsset> {
  if (endpoint === "material") {
    return normalizeWechatCoverAsset(asset);
  }
  return convertAssetToJpeg(asset, {
    maxWidth: ARTICLE_MAX_WIDTH,
    maxHeight: ARTICLE_MAX_HEIGHT,
    quality: ARTICLE_JPEG_QUALITY
  });
}
function buildMultipartBody(asset: ImageAsset): { body: ArrayBuffer; contentType: string } {
  const boundary = `----WeiXinMp${Date.now().toString(16)}`;
  const encoder = new TextEncoder();
  const header = encoder.encode(
    `--${boundary}\r
Content-Disposition: form-data; name="media"; filename="${asset.filename}"\r
Content-Type: ${asset.contentType}\r
\r
`
  );
  const footer = encoder.encode(`\r
--${boundary}--\r
`);
  const payload = concatUint8Arrays([header, asset.bytes, footer]);
  return {
    body: payload.buffer.slice(
      payload.byteOffset,
      payload.byteOffset + payload.byteLength
    ),
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}
async function runWithTimeout<T>(task: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: number | null = null;
  try {
    return await Promise.race([
      task,
      new Promise((_3, reject3) => {
        timeoutId = window.setTimeout(() => {
          reject3(new Error(`${label}超时，请检查网络、微信白名单或图片大小后重试`));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}
export function buildWechatRequest(account: PublisherAccount, originalUrl: string, init3?: WechatRequestOptions): Record<string, unknown> {
  if (account?.apiKey) {
    const urlObj = new URL(originalUrl);
    urlObj.searchParams.delete("access_token");
    urlObj.searchParams.delete("secret");
    urlObj.searchParams.delete("appid");
    urlObj.searchParams.delete("grant_type");
    const wechatPath2 = urlObj.pathname + urlObj.search;
    return {
      url: RELAY_BASE_URL,
      method: "POST",
      body: init3?.body,
      contentType: init3?.contentType,
      headers: Object.assign({}, init3?.headers, {
        "X-Api-Key": account.apiKey,
        "X-App-Id": account.appId,
        "X-App-Secret": account.appSecret,
        "X-Wechat-Path": wechatPath2
      }),
      throw: false
    };
  }
  return {
    url: originalUrl,
    method: init3?.method,
    body: init3?.body,
    headers: init3?.headers,
    contentType: init3?.contentType,
    throw: false
  };
}

async function requestWechatJson(url: string, init3?: WechatRequestOptions): Promise<Record<string, unknown>> {
  const account = init3?.account;
  const req = buildWechatRequest(account, url, init3);
  const response = await runWithTimeout(
    (0, requestUrl)(req),
    init3?.timeoutMs ?? REQUEST_TIMEOUT_MS,
    init3?.requestLabel ?? "微信请求"
  );
  const data6 = response.json as WechatApiJson;
  if (response.status >= 400) {
    throw new Error(`HTTP ${response.status}: ${response.text}`);
  }
  if (typeof data6?.errcode === "number" && data6.errcode !== 0) {
    throw new Error(`${data6.errmsg ?? "微信接口报错"} (${data6.errcode})`);
  }
  return data6;
}
function isInvalidImageFormatError(error3: unknown): boolean {
  if (!(error3 instanceof Error)) {
    return false;
  }
  return /invalid image format/i.test(error3.message) || /invalid image size/i.test(error3.message) || /\(40137\)/.test(error3.message) || /\(40009\)/.test(error3.message);
}
async function getAccessToken(account: PublisherAccount): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(account.appId)}&secret=${encodeURIComponent(account.appSecret)}`;
  const data6 = await requestWechatJson(url, {
    account,
    requestLabel: "获取 access_token"
  });
  if (!data6.access_token) {
    throw new Error("未拿到微信公众号 access_token");
  }
  return data6.access_token;
}
async function fetchBinaryAsset(url: string): Promise<ImageAsset> {
  if (url.startsWith("data:")) {
    const parsed = parseDataUrl(url);
    if (!parsed) {
      throw new Error("不支持的 data URL");
    }
    const ext = guessExtension(parsed.mimeType);
    let bytes: Uint8Array;
    if (parsed.isBase64) {
      try {
        bytes = base64ToUint8Array(parsed.data);
      } catch (error3) {
        console.warn("data URL 标记为 base64，但解码失败，尝试按普通文本处理", {
          mimeType: parsed.mimeType,
          error: error3 as Error,
          preview: parsed.data.slice(0, 80)
        });
        bytes = plainDataToUint8Array(parsed.data);
      }
    } else {
      bytes = plainDataToUint8Array(parsed.data);
    }
    return {
      bytes,
      contentType: parsed.mimeType,
      filename: `inline-image.${ext}`,
      sourceUrl: url
    };
  }
  const response = await runWithTimeout(
    (0, requestUrl)({
      url,
      method: "GET",
      throw: false
    }),
    REQUEST_TIMEOUT_MS,
    "下载图片"
  );
  if (response.status >= 400) {
    throw new Error(`下载图片失败: ${response.status}`);
  }
  const contentType = response.headers["content-type"] || "image/jpeg";
  return {
    bytes: new Uint8Array(response.arrayBuffer),
    contentType,
    filename: `remote-image.${guessExtension(contentType)}`,
    sourceUrl: url
  };
}
async function readBinaryAssetFromAdapterPath(app: App, rawPath: string): Promise<ImageAsset | null> {
  const normalizedPath = (0, normalizePath)(decodeURIComponent(rawPath.trim()));
  const mimeType = getMimeTypeByPath2(normalizedPath);
  if (!mimeType || !await app.vault.adapter.exists(normalizedPath)) {
    return null;
  }
  const binary2 = await app.vault.adapter.readBinary(normalizedPath);
  const filename = normalizedPath.split("/").pop() || `local-image.${guessExtension(mimeType)}`;
  return {
    bytes: new Uint8Array(binary2),
    contentType: mimeType,
    filename,
    sourceUrl: safeGetVaultResourcePath(app, normalizedPath),
    filePath: safeGetAdapterFullPath(app, normalizedPath)
  };
}
async function resolveVaultBinaryAsset(app: App, sourceFile: TFile, rawLink: string): Promise<ImageAsset | null> {
  const file = findVaultFile2(app, sourceFile, rawLink);
  if (!(file instanceof TFile)) {
    return null;
  }
  const mimeType = getMimeTypeByPath2(file.path);
  if (!mimeType) {
    return null;
  }
  const binary2 = await app.vault.readBinary(file);
  return {
    bytes: new Uint8Array(binary2),
    contentType: mimeType,
    filename: file.name,
    sourceUrl: safeGetVaultResourcePath(app, file),
    filePath: safeGetAdapterFullPath(app, file.path)
  };
}
async function resolveCoverAsset(app: App, file: TFile, coverValue: string): Promise<ImageAsset> {
  if (/^(https?:|data:)/i.test(coverValue)) {
    return fetchBinaryAsset(coverValue);
  }
  if (/^app:\/\//i.test(coverValue)) {
    try {
      const appUrl = new URL(coverValue);
      const rawPath2 = decodeURIComponent(appUrl.pathname.replace(/^\//, ""));
      const localAsset2 = await readBinaryAssetFromAdapterPath(app, rawPath2);
      if (localAsset2) return localAsset2;
    } catch {
      // ignore
    }
  }
  const vaultAsset = await resolveVaultBinaryAsset(app, file, coverValue);
  if (vaultAsset) {
    return vaultAsset;
  }
  const localAsset = await readBinaryAssetFromAdapterPath(app, coverValue);
  if (localAsset) {
    return localAsset;
  }
  const resolvedCoverUrl = await resolveAssetLinkForWechat(app, file, coverValue) ?? coverValue;
  if (/^app:\/\//i.test(resolvedCoverUrl)) {
    try {
      const resolvedUrl = new URL(resolvedCoverUrl);
      const resolvedRawPath = decodeURIComponent(resolvedUrl.pathname.replace(/^\//, ""));
      const assetFromResolved = await readBinaryAssetFromAdapterPath(app, resolvedRawPath);
      if (assetFromResolved) return assetFromResolved;
    } catch {
      // ignore
    }
  }
  return fetchBinaryAsset(resolvedCoverUrl);
}
async function resolveArticleImageAsset(app: App, file: TFile, source: string): Promise<ImageAsset> {
  if (source.startsWith("blob:")) {
     
    const response = await fetch(source);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const mimeType = blob.type || "image/png";
    return {
      bytes: new Uint8Array(arrayBuffer),
      contentType: mimeType,
      filename: `rendered-image.${guessExtension(mimeType)}`,
      sourceUrl: source
    };
  }
  if (source.startsWith("data:")) {
    const originalSource = lookupOriginalAssetSource(source);
    if (originalSource) {
      const vaultAsset2 = await resolveVaultBinaryAsset(app, file, originalSource);
      if (vaultAsset2) {
        return vaultAsset2;
      }
      const localAsset2 = await readBinaryAssetFromAdapterPath(app, originalSource);
      if (localAsset2) {
        return localAsset2;
      }
    }
    return fetchBinaryAsset(source);
  }
  if (/^https?:/i.test(source)) {
    return fetchBinaryAsset(source);
  }
  const vaultAsset = await resolveVaultBinaryAsset(app, file, source);
  if (vaultAsset) {
    return vaultAsset;
  }
  const localAsset = await readBinaryAssetFromAdapterPath(app, source);
  if (localAsset) {
    return localAsset;
  }
  const resolvedSource = await resolveAssetLinkForWechat(app, file, source) ?? source;
  if (resolvedSource !== source) {
    return fetchBinaryAsset(resolvedSource);
  }
  throw new Error(`无法解析本地图片路径：${source}`);
}
async function uploadWechatImage(account: PublisherAccount, accessToken: string, endpoint: string, asset: ImageAsset): Promise<string> {
  const uploadUrl = endpoint === "uploadimg" ? `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}` : `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${accessToken}&type=image`;
  const requestLabel = endpoint === "uploadimg" ? "上传正文图片" : "上传封面";
  let normalizedAsset: ImageAsset;
  try {
    normalizedAsset = endpoint === "material" ? await normalizeWechatCoverAsset(asset) : await normalizeWechatAsset(asset);
  } catch (error3) {
    throw new Error(
      `${endpoint === "material" ? "封面图片预处理失败" : "正文图片预处理失败"}：${error3 instanceof Error ? error3.message : "未知错误"}；文件：${asset.filename}；类型：${asset.contentType}${asset.filePath ? `；文件路径：${previewSource(asset.filePath)}` : ""}${asset.sourceUrl ? `；来源：${previewSource(asset.sourceUrl)}` : ""}`
    );
  }
  const attemptUpload = async (currentAsset: ImageAsset): Promise<Record<string, unknown>> => {
    const payload = buildMultipartBody(currentAsset);
    return requestWechatJson(uploadUrl, {
      account,
      method: "POST",
      body: payload.body,
      contentType: payload.contentType,
      timeoutMs: UPLOAD_TIMEOUT_MS,
      requestLabel
    });
  };
  let data6: Record<string, unknown>;
  try {
    data6 = await attemptUpload(normalizedAsset);
  } catch (error3) {
    if (isMediaFileCountOutOfLimitError(error3)) {
      throw createMaterialLimitError();
    }
    if (!isInvalidImageFormatError(error3)) {
      throw error3;
    }
    console.warn("微信拒绝了原始图片格式，尝试转成安全格式后重试", {
      endpoint,
      filename: normalizedAsset.filename,
      contentType: normalizedAsset.contentType,
      byteLength: normalizedAsset.bytes.byteLength,
      error: error3 as Error
    });
    normalizedAsset = await forceSafeWechatAsset(endpoint, asset);
    try {
      data6 = await attemptUpload(normalizedAsset);
    } catch (retryError) {
      if (isMediaFileCountOutOfLimitError(retryError)) {
        throw createMaterialLimitError();
      }
      throw retryError;
    }
  }
  if (endpoint === "uploadimg") {
    if (!data6.url) {
      throw new Error("正文图片上传后没有返回 URL");
    }
    return data6.url;
  }
  if (!data6.media_id) {
    throw new Error("封面上传后没有返回 media_id");
  }
  return data6.media_id;
}
async function rehostArticleImages(app: App, file: TFile, html5: string, accessToken: string, account: PublisherAccount, articleImageRecords: ArticleImageRecord[], onProgress?: (message: string) => void): Promise<RehostResult> {
  const document2 = new DOMParser().parseFromString(html5, "text/html");
  const imageElements = Array.from(document2.querySelectorAll("img"));
  const refs = extractHtmlImageRefs(html5);
  const records = articleImageRecords ? articleImageRecords.slice() : [];
  console.debug(
    "[WeiXin MP Publisher] 发布前图片清单",
    refs.map((ref, index2) => ({
      index: index2 + 1,
      srcPreview: ref.src.slice(0, 120),
      originalSource: ref.originalSource ?? null,
      mappedSource: ref.src.startsWith("data:") ? lookupOriginalAssetSource(ref.src) : null
    }))
  );
  if (imageElements.length !== refs.length) {
    console.warn("[WeiXin MP Publisher] 图片节点数量与提取结果不一致", {
      imageElementCount: imageElements.length,
      refCount: refs.length
    });
  }
  for (const [index2, ref] of refs.entries()) {
    onProgress?.(`正在上传正文图片 ${index2 + 1}/${refs.length}...`);
    let asset: ImageAsset;
    const mappedSource = ref.src.startsWith("data:") ? lookupOriginalAssetSource(ref.src) : null;
    try {
      asset = await resolveArticleImageAsset(app, file, ref.originalSource ?? ref.src);
    } catch (error3) {
      throw new Error(
        `第 ${index2 + 1} 张正文图片读取失败：${error3 instanceof Error ? error3.message : "未知错误"}；来源：${(ref.originalSource ?? ref.src).slice(0, 120)}${ref.originalSource ? `；原始来源：${ref.originalSource.slice(0, 120)}` : ""}${mappedSource ? `；映射来源：${mappedSource.slice(0, 120)}` : ""}`
      );
    }
    const sourceKey = await createCoverMediaSourceKey(asset);
    const cachedRecord = records.find(function(r) {
      return r.accountId === account.id && r.sourceKey === sourceKey;
    });
    let wechatUrl: string;
    if (cachedRecord?.url) {
      wechatUrl = cachedRecord.url;
    } else {
      try {
        wechatUrl = await uploadWechatImage(account, accessToken, "uploadimg", asset);
        records.unshift({
          accountId: account.id,
          sourceKey,
          url: wechatUrl,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (error3) {
        throw new Error(
          `第 ${index2 + 1} 张正文图片上传失败：${error3 instanceof Error ? error3.message : "未知错误"}；来源：${(ref.originalSource ?? ref.src).slice(0, 120)}${ref.originalSource ? `；原始来源：${ref.originalSource.slice(0, 120)}` : ""}${mappedSource ? `；映射来源：${mappedSource.slice(0, 120)}` : ""}`
      );
    }
    }
    imageElements[index2]?.setAttribute("src", wechatUrl);
  }
  const nextHtml = document2.body.innerHTML;
  return {
    html: nextHtml,
    imageCount: refs.length,
    articleImageRecords: records
  };
}
function pickTitle(file: TFile, frontmatter: Record<string, unknown>): string {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }
  return file.basename;
}
async function resolveExistingDraft(accessToken: string, account: PublisherAccount, options3: { mediaId?: string | null; title?: string }): Promise<{ mediaId: string; title: string; updateTime: number } | null> {
  const normalizedMediaId = options3.mediaId?.trim() ?? "";
  const normalizedTitle = options3.title?.trim() ?? "";
  if (!normalizedTitle && !normalizedMediaId) {
    return null;
  }
  let offset = 0;
  const pageSize = 20;
  let latestTitleMatch: { mediaId: string; title: string; updateTime: number } | null = null;
  while (offset < 200) {
    const data6 = await requestWechatJson(`https://api.weixin.qq.com/cgi-bin/draft/batchget?access_token=${accessToken}`, {
      account,
      method: "POST",
      body: JSON.stringify({
        offset,
        count: pageSize,
        no_content: 1
      }),
      headers: {
        "Content-Type": "application/json"
      },
      timeoutMs: UPLOAD_TIMEOUT_MS,
      requestLabel: "查询已有草稿"
    });
    const items: Array<Record<string, unknown>> = (data6.item as Array<Record<string, unknown>> | undefined) ?? [];
    for (const item of items) {
      const content = item.content as Record<string, unknown> | undefined;
      const newsItem = (content?.news_item as Array<Record<string, unknown>> | undefined)?.[0];
      const currentTitle = typeof newsItem?.title === 'string' ? newsItem.title.trim() : '';
      const resolvedDraft = {
        mediaId: item.media_id,
        title: currentTitle,
        updateTime: (item.update_time as number) ?? 0
      };
      if (normalizedMediaId && (item.media_id as string) === normalizedMediaId) {
        return resolvedDraft;
      }
      if (normalizedTitle && currentTitle === normalizedTitle && (!latestTitleMatch || resolvedDraft.updateTime > latestTitleMatch.updateTime)) {
        latestTitleMatch = resolvedDraft;
      }
    }
    if (items.length < pageSize || items.length === 0) {
      return latestTitleMatch;
    }
    offset += items.length;
  }
  return latestTitleMatch;
}
function isInvalidMediaIdError(error3: unknown): boolean {
  if (!(error3 instanceof Error)) {
    return false;
  }
  return /invalid media_id/i.test(error3.message) || /\(40007\)/.test(error3.message);
}
function isMediaFileCountOutOfLimitError(error3: unknown): boolean {
  if (!(error3 instanceof Error)) {
    return false;
  }
  return /media file count is out of limit/i.test(error3.message) || /\(45034\)/.test(error3.message);
}
function createMaterialLimitError(): Error {
  return new Error(
    "公众号图片素材库已满，微信拒绝继续上传封面图。请到公众号后台「内容与互动 > 素材库」清理图片素材，或换用已缓存过的封面后重试。"
  );
}
async function validateWechatMaterialMediaId(accessToken: string, account: PublisherAccount, mediaId: string): Promise<boolean> {
  const url = `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${accessToken}`;
  const req = buildWechatRequest(account, url, {
    method: "POST",
    body: JSON.stringify({ media_id: mediaId }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const response = await runWithTimeout(
    (0, requestUrl)(req),
    UPLOAD_TIMEOUT_MS,
    "校验封面素材"
  );
  if (response.status >= 400) {
    throw new Error(`HTTP ${response.status}: ${response.text}`);
  }
  const text6 = response.text?.trim() ?? "";
  const contentType = response.headers["content-type"] || "";
  const maybeJson = contentType.includes("application/json") || text6.startsWith("{");
  if (!maybeJson) {
    return true;
  }
  const data6 = response.json as WechatApiJson;
  if (typeof data6?.errcode !== "number" || data6.errcode === 0) {
    return true;
  }
  if (data6.errcode === 40007 || /invalid media_id/i.test(data6.errmsg ?? "")) {
    return false;
  }
  throw new Error(`${data6.errmsg ?? "微信接口报错"} (${data6.errcode})`);
}
export async function publishDraftToWechat(input: PublishInput): Promise<PublishResult> {
  if (!input.account.appId || !input.account.appSecret) {
    throw new Error("当前账号缺少 AppID 或 AppSecret");
  }
  let accessToken: string;
  if (input.account.apiKey) {
    accessToken = "";
  } else {
    input.onProgress?.("正在获取公众号 access_token...");
    accessToken = await getAccessToken(input.account);
    input.onProgress?.("access_token 获取成功");
  }
  let coverMediaRecord: CoverMediaRecord | undefined;
  let coverAction = "existing-frontmatter";
  let thumbMediaId = typeof input.frontmatter.thumb_media_id === "string" ? input.frontmatter.thumb_media_id.trim() : "";
  if (!thumbMediaId) {
    const frontmatterCover = typeof input.frontmatter.cover === "string" && input.frontmatter.cover.trim() ? input.frontmatter.cover.trim() : "";
    const defaultCoverPath = input.account.defaultCoverPath?.trim() ?? "";
    const firstHtmlImageUrl = extractFirstHtmlImageUrl(input.html) ?? "";
    const coverUrl = frontmatterCover || defaultCoverPath || firstHtmlImageUrl || PLACEHOLDER_PNG_DATA_URL;
    input.onProgress?.("正在处理封面图...");
    let coverAsset: ImageAsset;
    try {
      coverAsset = await resolveCoverAsset(input.app, input.file, coverUrl);
    } catch (error3) {
      throw new Error(
        `封面图片读取失败：${error3 instanceof Error ? error3.message : "未知错误"}；封面来源：${previewSource(
          coverUrl
        )}${frontmatterCover ? "；来源类型：frontmatter.cover" : ""}${!frontmatterCover && defaultCoverPath ? "；来源类型：账号默认封面" : ""}${!frontmatterCover && !defaultCoverPath && firstHtmlImageUrl ? "；来源类型：正文第一张图" : ""}`
      );
    }
    const coverSourceKey = await createCoverMediaSourceKey(coverAsset);
    const cachedCover = input.coverMediaRecords?.find(
      function(record) { return record.accountId === input.account.id && record.sourceKey === coverSourceKey; }
    );
    if (cachedCover?.mediaId) {
      input.onProgress?.("正在复用已上传封面图...");
      try {
        if (await validateWechatMaterialMediaId(accessToken, input.account, cachedCover.mediaId)) {
          thumbMediaId = cachedCover.mediaId;
          coverAction = "reused";
          coverMediaRecord = {
            ...cachedCover,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      } catch (error3) {
        console.warn("校验已缓存封面素材失败，将重新上传封面", {
          mediaId: cachedCover.mediaId,
          error: error3 as Error
        });
      }
    }
    if (!thumbMediaId) {
      try {
        thumbMediaId = await uploadWechatImage(input.account, accessToken, "material", coverAsset);
        coverAction = "uploaded";
        coverMediaRecord = {
          accountId: input.account.id,
          sourceKey: coverSourceKey,
          mediaId: thumbMediaId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (error3) {
        throw new Error(
          `封面图片上传失败：${error3 instanceof Error ? error3.message : "未知错误"}；封面来源：${previewSource(
            coverUrl
          )}；文件：${coverAsset.filename}；类型：${coverAsset.contentType}${coverAsset.filePath ? `；文件路径：${previewSource(coverAsset.filePath)}` : ""}${coverAsset.sourceUrl ? `；资源：${previewSource(coverAsset.sourceUrl)}` : ""}`
        );
      }
    }
  }
  input.onProgress?.("正在处理正文图片...");
  const rehostResult = await rehostArticleImages(
    input.app,
    input.file,
    input.html,
    accessToken,
    input.account,
    input.articleImageRecords ?? [],
    input.onProgress
  );
  const html5 = rehostResult.html;
  const imageCount = rehostResult.imageCount;
  const articleImageRecords = rehostResult.articleImageRecords;
  const publishHtml = compactWechatHtmlForSubmit(html5);
  const remainingDataImages = countRemainingDataImages(publishHtml);
  const htmlBytes = new TextEncoder().encode(publishHtml).length;
  const WECHAT_CONTENT_SIZE_LIMIT = 1e6;
  if (htmlBytes > WECHAT_CONTENT_SIZE_LIMIT) {
    throw new Error(
      `文章内容过长（${(htmlBytes / 1024).toFixed(0)} KB），超出微信草稿接口上限（约 1 MB）。建议拆分文章或减少内容后重试。`
    );
  }
  const title2 = pickTitle(input.file, input.frontmatter);
  const author = typeof input.frontmatter.author === "string" ? input.frontmatter.author.trim() : "";
  const resolvedDraft = await resolveExistingDraft(accessToken, input.account, {
    mediaId: input.existingDraftMediaId ?? null,
    title: title2
  });
  const existingDraftMediaId = resolvedDraft?.mediaId ?? "";
  const coverProgressPrefix = coverAction === "reused" ? "已复用历史封面" : coverAction === "uploaded" ? "已上传新封面" : "封面已处理";
  if (existingDraftMediaId) {
    input.onProgress?.(`${coverProgressPrefix}，正在更新已有草稿...`);
    try {
      await requestWechatJson(
        `https://api.weixin.qq.com/cgi-bin/draft/update?access_token=${accessToken}`,
        {
          account: input.account,
          method: "POST",
          body: JSON.stringify({
            media_id: existingDraftMediaId,
            index: 0,
            articles: {
              title: title2,
              author,
              content: publishHtml,
              thumb_media_id: thumbMediaId || void 0,
              need_open_comment: 0,
              only_fans_can_comment: 0
            }
          }),
          headers: {
            "Content-Type": "application/json"
          },
          timeoutMs: UPLOAD_TIMEOUT_MS,
          requestLabel: "更新草稿"
        }
      );
      return {
        mediaId: existingDraftMediaId,
        title: title2,
        imageCount,
        action: "updated",
        coverMediaRecord,
        articleImageRecords
      };
    } catch (error3) {
      if (!isInvalidMediaIdError(error3)) {
        throw new Error(
          `更新草稿失败：${error3 instanceof Error ? error3.message : "未知错误"}；标题：${title2}；HTML 长度：${publishHtml.length}；剩余 data 图片：${remainingDataImages}`
        );
      }
      input.onProgress?.("旧草稿记录已失效，正在改为新建草稿...");
    }
  }
  input.onProgress?.(`${coverProgressPrefix}，正在提交草稿到微信...`);
  const data6 = await requestWechatJson(
    `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`,
    {
      account: input.account,
      method: "POST",
      body: JSON.stringify({
        articles: [
          {
            title: title2,
            author,
            content: publishHtml,
            thumb_media_id: thumbMediaId || void 0,
            need_open_comment: 0,
            only_fans_can_comment: 0
          }
        ]
      }),
      headers: {
        "Content-Type": "application/json"
      },
      timeoutMs: UPLOAD_TIMEOUT_MS,
      requestLabel: "提交草稿"
    }
  ).catch((error3) => {
    throw new Error(
      `提交草稿失败：${error3 instanceof Error ? error3.message : "未知错误"}；标题：${title2}；HTML 长度：${publishHtml.length}；剩余 data 图片：${remainingDataImages}`
    );
  });
  if (!data6.media_id) {
    throw new Error("草稿发布成功响应中缺少 media_id");
  }
  return {
    mediaId: data6.media_id,
    title: title2,
    imageCount,
    action: "created",
    coverMediaRecord,
    articleImageRecords
  };
}

