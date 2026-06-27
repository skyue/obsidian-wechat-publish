let import_juice = __toESM(require_client(), 1);

let MAC_DOTS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 130" width="45" height="13" aria-hidden="true"><ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)"/><ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)"/><ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)"/></svg>`;
core_default.registerLanguage("bash", bash);
core_default.registerLanguage("sh", bash);
core_default.registerLanguage("shell", bash);
core_default.registerLanguage("zsh", bash);
core_default.registerLanguage("css", css);
core_default.registerLanguage("javascript", javascript);
core_default.registerLanguage("js", javascript);
core_default.registerLanguage("json", json);
core_default.registerLanguage("markdown", markdown);
core_default.registerLanguage("md", markdown);
core_default.registerLanguage("python", python);
core_default.registerLanguage("py", python);
core_default.registerLanguage("typescript", typescript);
core_default.registerLanguage("ts", typescript);
core_default.registerLanguage("xml", xml);
core_default.registerLanguage("html", xml);
core_default.registerLanguage("yaml", yaml);
core_default.registerLanguage("yml", yaml);
let GITHUB_DARK_HIGHLIGHT_CSS = `
.hljs{color:#e6edf3;background:#0d1117}
.hljs-comment,.hljs-quote{color:#8b949e}
.hljs-variable,.hljs-template-variable,.hljs-tag,.hljs-name,.hljs-selector-id,.hljs-selector-class,.hljs-regexp,.hljs-deletion{color:#ff7b72}
.hljs-number,.hljs-built_in,.hljs-builtin-name,.hljs-literal,.hljs-type,.hljs-params,.hljs-meta,.hljs-link{color:#79c0ff}
.hljs-attribute{color:#d2a8ff}
.hljs-string,.hljs-symbol,.hljs-bullet,.hljs-addition{color:#a5d6ff}
.hljs-title,.hljs-section{color:#d2a8ff}
.hljs-keyword,.hljs-selector-tag{color:#ff7b72}
.hljs-emphasis{font-style:italic}
.hljs-strong{font-weight:700}
`;
let GITHUB_HIGHLIGHT_CSS = `
.hljs{color:#24292e;background:#f6f8fa}
.hljs-comment,.hljs-quote{color:#6a737d}
.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#d73a49}
.hljs-string,.hljs-doctag,.hljs-title,.hljs-section,.hljs-selector-id,.hljs-selector-class,.hljs-attribute,.hljs-name,.hljs-type,.hljs-symbol,.hljs-bullet,.hljs-addition,.hljs-variable,.hljs-template-tag,.hljs-template-variable{color:#032f62}
.hljs-number,.hljs-literal,.hljs-link,.hljs-meta,.hljs-selector-attr{color:#005cc5}
.hljs-built_in,.hljs-builtin-name{color:#e36209}
.hljs-deletion{color:#b31d28}
.hljs-emphasis{font-style:italic}
.hljs-strong{font-weight:700}
`;
let FONT_PRESET_STACKS = {
  "theme-default": "",
  sans: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Georgia', 'Songti SC', 'Noto Serif SC', serif",
  mono: "'SFMono-Regular', 'JetBrains Mono', 'Fira Code', 'Microsoft YaHei Mono', monospace",
  rounded: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
};
let CALLOUT_LABELS = {
  abstract: "摘要",
  attention: "注意",
  bug: "问题",
  caution: "提醒",
  check: "检查",
  danger: "警告",
  error: "错误",
  example: "示例",
  fail: "失败",
  faq: "问答",
  help: "帮助",
  hint: "提示",
  important: "重点",
  info: "说明",
  note: "笔记",
  question: "问题",
  quote: "引用",
  success: "完成",
  tip: "技巧",
  todo: "待办",
  warning: "警示"
};
function stripFrontmatter(markdown2) {
  if (!markdown2.startsWith("---")) {
    return { content: markdown2, data: {} };
  }
  const lines = markdown2.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return { content: markdown2, data: {} };
  }
  const closingIndex = lines.findIndex((line2, index2) => index2 > 0 && line2.trim() === "---");
  if (closingIndex < 0) {
    return { content: markdown2, data: {} };
  }
  const data6 = {};
  for (const line2 of lines.slice(1, closingIndex)) {
    const match2 = line2.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match2) {
      continue;
    }
    const [, key, rawValue] = match2;
    const value2 = rawValue.trim();
    const quoted = value2.match(/^(['"])(.*)\1$/);
    data6[key] = quoted ? quoted[2] : value2;
  }
  return {
    content: lines.slice(closingIndex + 1).join("\n").replace(/^\n/, ""),
    data: data6
  };
}
function escapeHtml(text6) {
  return text6.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function preserveCodeWhitespace(html5) {
  return html5.split(/(<[^>]+>)/g).map((segment) => {
    if (!segment || segment.startsWith("<")) {
      return segment;
    }
    return segment.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/ /g, "&nbsp;");
  }).join("");
}
function highlightCodeLine(line2, lang) {
  if (!line2) {
    return "&nbsp;";
  }
  try {
    const highlighted = lang && core_default.getLanguage(lang) ? core_default.highlight(line2, { language: lang, ignoreIllegals: true }).value : core_default.highlightAuto(line2).value;
    return preserveCodeWhitespace(highlighted);
  } catch {
    return preserveCodeWhitespace(escapeHtml(line2));
  }
}
function stripHtmlTags(html5) {
  return html5.replace(/<\/p>\s*<p>/gi, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}
function stripMarkdownSyntax(text6) {
  return stripHtmlTags(
    text6.replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/[*_~]+/g, "")
  );
}
function toPlainText(markdown2) {
  return markdown2.replace(/^#{1,6}\s+/gm, "").replace(/```[\s\S]*?```/g, "").replace(/`([^`]+)`/g, "$1").replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/[>*_-]{2,}/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeCalloutLabel(rawType, rawTitle) {
  const cleanTitle = rawTitle.trim();
  if (cleanTitle) {
    return cleanTitle;
  }
  const key = rawType.trim().toLowerCase();
  return CALLOUT_LABELS[key] ?? key.toUpperCase();
}
function quoteifyMarkdown(content) {
  return content.split("\n").map((line2) => line2.trim()).filter((line2, index2, lines) => line2.length > 0 || index2 > 0 && lines[index2 - 1].length > 0).map((line2) => line2 ? `> ${line2}` : ">").join("\n");
}
function transformCallouts(markdown2) {
  const lines = markdown2.split("\n");
  const output2 = [];
  for (let index2 = 0; index2 < lines.length; index2 += 1) {
    const line2 = lines[index2];
    const match2 = line2.match(/^>\s*\[!([^\]]+)\][+-]?\s*(.*)$/i);
    if (!match2) {
      output2.push(line2);
      continue;
    }
    const inlineRest = (match2[2] ?? "").trim();
    if (inlineRest.length > 0) {
      output2.push(`> ${inlineRest}`);
    }
    let bodyIndex = index2 + 1;
    while (bodyIndex < lines.length && /^>\s?/.test(lines[bodyIndex])) {
      output2.push(lines[bodyIndex]);
      bodyIndex += 1;
    }
    index2 = bodyIndex - 1;
  }
  return output2.join("\n");
}
function transformDetailsBlocks(markdown2) {
  return markdown2.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi,
    (_match, rawSummary, rawBody) => {
      const summary = stripHtmlTags(rawSummary) || "展开内容";
      const body = stripHtmlTags(rawBody);
      const quotedBody = body.split("\n").map((line2) => line2.trim()).filter(Boolean).map((line2) => `> ${line2}`).join("\n");
      return quotedBody ? `> **${summary}**
${quotedBody}` : `> **${summary}**`;
    }
  );
}
function transformHighlights(markdown2) {
  return markdown2.replace(/==([^=\n]+)==/g, (_match, text6) => {
    return `<span class="wxp-highlight">${escapeHtml(text6.trim())}</span>`;
  });
}
function transformRawMarkTags(markdown2) {
  return markdown2.replace(/<mark>([\s\S]*?)<\/mark>/gi, (_match, text6) => {
    return `<span class="wxp-highlight">${escapeHtml(stripHtmlTags(text6))}</span>`;
  });
}
function transformUnderlines(markdown2) {
  return markdown2.replace(/\+\+([^+\n]+)\+\+/g, (_match, text6) => {
    return `<span class="wxp-underline">${escapeHtml(text6.trim())}</span>`;
  });
}
function transformWavyLines(markdown2) {
  return markdown2.replace(/(^|[^~])~([^~\n]+)~(?!~)/g, (_match, prefix, text6) => {
    return `${prefix}<span class="wxp-wavyline">${escapeHtml(text6.trim())}</span>`;
  });
}
function transformInlineMath(markdown2) {
  return markdown2.replace(
    /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`|\$\$[\s\S]*?\$\$)|\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    (match2, codeBlock, expression) => {
      if (codeBlock !== void 0) return codeBlock;
      return `<span class="wxp-math-inline">${escapeHtml(expression.trim())}</span>`;
    }
  );
}
function transformInlineLatexMath(markdown2) {
  return markdown2.replace(/\\\(([\s\S]*?)\\\)/g, (_match, expression) => {
    return `<span class="wxp-math-inline">${escapeHtml(expression.trim())}</span>`;
  });
}
function transformBlockMath(markdown2) {
  return markdown2.replace(/^\$\$\s*\n?([\s\S]*?)\n?\$\$\s*$/gm, (_match, expression) => {
    return `
\`\`\`math
${expression.trim()}
\`\`\`
`;
  });
}
function transformBlockLatexMath(markdown2) {
  return markdown2.replace(/\\\[([\s\S]*?)\\\]/g, (_match, expression) => {
    return `
\`\`\`math
${expression.trim()}
\`\`\`
`;
  });
}
function renderRubyHtml(baseText, rubyText) {
  const separators = /[・．。-]/;
  const rubyParts = rubyText.split(separators).filter(Boolean);
  if (rubyParts.length === 0) {
    return `<span class="wxp-ruby"><span class="wxp-ruby-base">${escapeHtml(baseText)}</span><span class="wxp-ruby-text">${escapeHtml(rubyText)}</span></span>`;
  }
  const chars = Array.from(baseText);
  if (rubyParts.length === chars.length) {
    return chars.map((char2, index2) => {
      return `<span class="wxp-ruby"><span class="wxp-ruby-base">${escapeHtml(char2)}</span><span class="wxp-ruby-text">${escapeHtml(rubyParts[index2])}</span></span>`;
    }).join("");
  }
  return `<span class="wxp-ruby"><span class="wxp-ruby-base">${escapeHtml(baseText)}</span><span class="wxp-ruby-text">${escapeHtml(rubyText)}</span></span>`;
}
function transformHashtags(markdown2) {
  return markdown2.replace(
    /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)|(?<!\w)#([\p{L}\p{N}_\-\/]+)/gu,
    (match2, codeBlock, tagContent) => {
      if (codeBlock !== void 0) return codeBlock;
      if (!tagContent) return match2;
      return `<span class="wxp-tag">#${escapeHtml(tagContent)}</span>`;
    }
  );
}
function transformRuby(markdown2) {
  let output2 = markdown2.replace(/\[([^\]]+)\]\{([^}]+)\}/g, (_match, text6, ruby) => {
    return renderRubyHtml(text6.trim(), ruby.trim());
  });
  output2 = output2.replace(/\[([^\]]+)\]\^\(([^)]+)\)/g, (_match, text6, ruby) => {
    return renderRubyHtml(text6.trim(), ruby.trim());
  });
  return output2;
}
function transformAlertContainers(markdown2) {
  return markdown2.replace(/^:::\s*(\w+)\s*\n([\s\S]*?)\n:::\s*$/gm, (_match, rawType, body) => {
    const title2 = normalizeCalloutLabel(rawType, "");
    const quoted = quoteifyMarkdown(body);
    return quoted ? `> **${title2}**
${quoted}` : `> **${title2}**`;
  });
}
function parseMarkdownImageToken(token2) {
  const match2 = token2.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match2) {
    return null;
  }
  return {
    alt: match2[1].trim(),
    src: match2[2].trim()
  };
}
function transformSliders(markdown2) {
  return markdown2.replace(/^<((?:!\[[^\]]*]\([^)]+\)\s*,\s*)*!\[[^\]]*]\([^)]+\))>\s*$/gm, (_match, inner2) => {
    const images = inner2.split(/\s*,\s*/).map((token2) => parseMarkdownImageToken(token2)).filter((item) => Boolean(item));
    if (images.length === 0) {
      return "";
    }
    const itemsHtml = images.map(({ alt, src }) => {
      const caption = alt ? `<p class="wxp-slider-caption">${escapeHtml(alt)}</p>` : "";
      return `<section class="wxp-slider-item"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${caption}</section>`;
    }).join("");
    return `
<section class="wxp-slider"><section class="wxp-slider-track">${itemsHtml}</section><p class="wxp-slider-hint">左右滑动看更多</p></section>
`;
  });
}
function transformInfographicBlocks(markdown2) {
  return markdown2.replace(/^```infographic\r?\n([\s\S]*?)\r?\n```\s*$/gm, (_match, body) => {
    return `
<section class="wxp-diagram-fallback"><div class="wxp-diagram-title">Infographic 配置</div><pre>${escapeHtml(body.trim())}</pre></section>
`;
  });
}
function transformPlantUmlBlocks(markdown2) {
  return markdown2.replace(/^```plantuml\r?\n([\s\S]*?)\r?\n```\s*$/gm, (_match, body) => {
    return `
<section class="wxp-diagram-fallback"><div class="wxp-diagram-title">PlantUML 图表源码</div><pre>${escapeHtml(body.trim())}</pre></section>
`;
  });
}
function transformTocPlaceholder(markdown2) {
  return markdown2.replace(/^\[TOC\]\s*$/gm, '\n<section class="wxp-toc-placeholder"></section>\n');
}
function transformFootnotes(markdown2) {
  const lines = markdown2.split("\n");
  const footnotes = /* @__PURE__ */ new Map();
  const bodyLines = [];
  for (let index2 = 0; index2 < lines.length; index2 += 1) {
    const line2 = lines[index2];
    const definitionMatch = line2.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if (!definitionMatch) {
      bodyLines.push(line2);
      continue;
    }
    const id30 = definitionMatch[1];
    const definitionLines = [definitionMatch[2]];
    let nextIndex = index2 + 1;
    while (nextIndex < lines.length) {
      const continuation = lines[nextIndex];
      if (/^( {2,}|\t)/.test(continuation)) {
        definitionLines.push(continuation.trim());
        nextIndex += 1;
        continue;
      }
      if (continuation.trim() === "") {
        nextIndex += 1;
        break;
      }
      break;
    }
    footnotes.set(id30, definitionLines.filter(Boolean));
    index2 = nextIndex - 1;
  }
  if (footnotes.size === 0) {
    return markdown2;
  }
  const orderedIds = [];
  const replacedBody = bodyLines.join("\n").replace(/\[\^([^\]]+)\]/g, (_match, rawId) => {
    let order2 = orderedIds.indexOf(rawId);
    if (order2 === -1) {
      orderedIds.push(rawId);
      order2 = orderedIds.length - 1;
    }
    return `<sup class="wxp-footnote-ref">[${order2 + 1}]</sup>`;
  });
  if (orderedIds.length === 0) {
    return replacedBody;
  }
  const footnoteLines = orderedIds.map((id30, index2) => {
    const text6 = footnotes.get(id30)?.join(" ") ?? "";
    return `${index2 + 1}. ${text6}`;
  });
  return `${replacedBody}

---

#### 注释

${footnoteLines.join("\n")}`;
}
function preprocessWechatMarkdown(markdown2) {
  return [
    transformTocPlaceholder,
    transformDetailsBlocks,
    transformAlertContainers,
    transformCallouts,
    transformSliders,
    transformInfographicBlocks,
    transformPlantUmlBlocks,
    transformBlockMath,
    transformBlockLatexMath,
    transformInlineMath,
    transformInlineLatexMath,
    transformRawMarkTags,
    transformHashtags,
    transformHighlights,
    transformUnderlines,
    transformWavyLines,
    transformRuby,
    transformFootnotes
  ].reduce((current, transformer2) => transformer2(current), markdown2);
}
function resolvePalette(theme, styleProfile) {
  if (!styleProfile.customPrimaryColor && !styleProfile.customPageBackgroundColor) {
    return theme.palette;
  }
  return {
    ...theme.palette,
    primary: styleProfile.customPrimaryColor ?? theme.palette.primary,
    background: styleProfile.customPageBackgroundColor ?? theme.palette.background
  };
}
function resolveFontFamily(theme, styleProfile) {
  if (styleProfile.fontPreset && styleProfile.fontPreset !== "theme-default") {
    return FONT_PRESET_STACKS[styleProfile.fontPreset];
  }
  return styleProfile.fontFamily ?? theme.typography.fontFamily;
}
function buildCss(theme, styleProfile) {
  const palette = resolvePalette(theme, styleProfile);
  const { typography, radius: radius2 } = theme;
  const fontFamily = resolveFontFamily(theme, styleProfile);
  const codeHighlightCss = styleProfile.codeTheme === "github" ? GITHUB_HIGHLIGHT_CSS : GITHUB_DARK_HIGHLIGHT_CSS;
  const calloutStyleMode = styleProfile.calloutStyleMode ?? "card-rounded";
  const h1Block = styleProfile.h1Style === "solid" ? `
  .wxp-root h1 {
    display: block;
    margin: ${styleProfile.headingTopMargin} 8px ${styleProfile.headingBottomMargin};
    padding: 0.45em 0.8em;
    border-radius: ${radius2};
    background: ${palette.primary};
    color: ${palette.background};
    font-size: 1.45em;
    text-align: center;
  }` : styleProfile.h1Style === "outline" ? `
  .wxp-root h1 {
    display: table;
    margin: ${styleProfile.headingTopMargin} auto ${styleProfile.headingBottomMargin};
    padding: 0.35em 1.05em;
    border: 2px solid ${palette.primary};
    border-radius: 999px;
    color: ${palette.primary};
    font-size: 1.45em;
    text-align: center;
  }` : `
  .wxp-root h1 {
    display: table;
    margin: ${styleProfile.headingTopMargin} auto ${styleProfile.headingBottomMargin};
    padding: 0 1.1em 0.35em;
    border-bottom: 3px solid ${palette.primary};
    font-size: 1.45em;
    text-align: center;
  }`;
  const h2Block = styleProfile.h2Style === "plain" ? `
  .wxp-root h2 {
    display: block;
    margin: calc(${styleProfile.headingTopMargin} + 0.5em) 8px calc(${styleProfile.headingBottomMargin} + 0.2em);
    padding-left: 10px;
    border-left: 4px solid ${palette.primary};
    color: ${palette.primary};
    font-size: 1.2em;
  }` : styleProfile.h2Style === "capsule" ? `
  .wxp-root h2 {
    display: table;
    margin: calc(${styleProfile.headingTopMargin} + 0.45em) 8px calc(${styleProfile.headingBottomMargin} + 0.2em);
    padding: 0.18em 0.95em;
    border: 1px solid ${palette.primary};
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primary};
    font-size: 1.16em;
  }` : `
  .wxp-root h2 {
    display: table;
    margin: calc(${styleProfile.headingTopMargin} + 0.5em) auto calc(${styleProfile.headingBottomMargin} + 0.2em);
    padding: 0.2em 0.95em;
    border-radius: ${radius2};
    background: ${palette.primary};
    color: ${palette.background};
    font-size: 1.25em;
    text-align: center;
  }`;
  const h3Block = styleProfile.h3Style === "capsule" ? `
  .wxp-root h3 {
    display: table;
    margin: calc(${styleProfile.headingTopMargin} - 0.2em) 8px ${styleProfile.headingBottomMargin};
    padding: 0.16em 0.8em;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primary};
    font-size: 1.08em;
  }` : styleProfile.h3Style === "plain" ? `
  .wxp-root h3 {
    margin: calc(${styleProfile.headingTopMargin} - 0.2em) 8px ${styleProfile.headingBottomMargin};
    color: ${palette.primary};
    font-size: 1.08em;
  }` : `
  .wxp-root h3 {
    margin: calc(${styleProfile.headingTopMargin} - 0.2em) 8px ${styleProfile.headingBottomMargin};
    padding-left: 10px;
    border-left: 4px solid ${palette.primary};
    font-size: 1.12em;
  }`;
  const h4Block = styleProfile.h4Style === "plain" ? `
  .wxp-root h4,
  .wxp-root h5,
  .wxp-root h6 {
    margin: calc(${styleProfile.headingTopMargin} - 0.7em) 8px calc(${styleProfile.headingBottomMargin} - 0.2em);
    color: ${palette.primary};
    font-size: 1em;
  }` : styleProfile.h4Style === "eyebrow" ? `
  .wxp-root h4,
  .wxp-root h5,
  .wxp-root h6 {
    display: table;
    margin: calc(${styleProfile.headingTopMargin} - 0.7em) 8px calc(${styleProfile.headingBottomMargin} - 0.15em);
    padding-bottom: 0.28em;
    border-bottom: 2px solid ${palette.primarySoft};
    color: ${palette.secondary};
    letter-spacing: 0.08em;
    font-size: 0.96em;
  }` : `
  .wxp-root h4,
  .wxp-root h5,
  .wxp-root h6 {
    display: table;
    margin: calc(${styleProfile.headingTopMargin} - 0.7em) 8px calc(${styleProfile.headingBottomMargin} - 0.15em);
    padding: 0.05em 0.65em;
    border-radius: 999px;
    background: ${palette.primarySoft};
    color: ${palette.primary};
    font-size: 0.96em;
  }`;
  const blockquoteBlock = calloutStyleMode === "card-soft" ? `
  .wxp-root blockquote {
    margin: ${styleProfile.paragraphMargin};
    padding: ${styleProfile.blockquotePadding};
    border-top: 1px solid ${palette.border};
    border-bottom: 1px solid ${palette.border};
    border-radius: 10px;
    background: #EEF4FA;
  }` : calloutStyleMode === "card-square" ? `
  .wxp-root blockquote {
    margin: ${styleProfile.paragraphMargin};
    padding: ${styleProfile.blockquotePadding};
    border: 1px solid ${palette.border};
    border-left: 4px solid ${palette.primary};
    border-radius: 0;
    background: ${palette.quoteBackground};
  }` : calloutStyleMode === "bar-rounded" ? `
  .wxp-root blockquote {
    margin: ${styleProfile.paragraphMargin};
    padding: ${styleProfile.blockquotePadding};
    border-left: 4px solid ${palette.primary};
    border-radius: ${radius2};
    background: transparent;
  }` : calloutStyleMode === "bar-square" ? `
  .wxp-root blockquote {
    margin: ${styleProfile.paragraphMargin};
    padding: ${styleProfile.blockquotePadding};
    border-left: 4px solid ${palette.primary};
    border-radius: 0;
    background: transparent;
  }` : `
  .wxp-root blockquote {
    margin: ${styleProfile.paragraphMargin};
    padding: ${styleProfile.blockquotePadding};
    border: 1px solid ${palette.border};
    border-left: 4px solid ${palette.primary};
    border-radius: ${radius2};
    background: ${palette.quoteBackground};
  }`;
  return `
  .wxp-root {
    font-family: ${fontFamily};
    font-size: ${styleProfile.fontSize};
    line-height: ${styleProfile.lineHeight};
    color: ${palette.text};
    letter-spacing: ${styleProfile.letterSpacing};
    font-variant-numeric: lining-nums;
    background: ${palette.background};
    word-break: break-word;
    text-align: ${styleProfile.textAlign ?? "left"};
    padding-left: ${styleProfile.contentSideIndent ?? "0px"};
    padding-right: ${styleProfile.contentSideIndent ?? "0px"};
  }
  .wxp-root * {
    box-sizing: border-box;
  }
  .wxp-root h1,
  .wxp-root h2,
  .wxp-root h3,
  .wxp-root h4,
  .wxp-root h5,
  .wxp-root h6 {
    color: ${palette.text};
    font-weight: ${typography.headingWeight};
    line-height: 1.35;
  }
  ${h1Block}
  ${h2Block}
  ${h3Block}
  ${h4Block}
  .wxp-root p,
  .wxp-root ul,
  .wxp-root ol,
  .wxp-root figure,
  .wxp-root table {
    margin: ${styleProfile.paragraphMargin};
  }
  .wxp-root p {
    color: ${palette.text};
    margin: ${styleProfile.paragraphMargin};
    text-indent: ${styleProfile.paragraphIndent ? "2em" : "0"};
  }
  .wxp-root p .wxp-br-line {
    display: block;
    text-indent: ${styleProfile.paragraphIndent ? "2em" : "0"};
  }
  .wxp-root ul,
  .wxp-root ol {
    margin-left: 0;
    padding-left: 1.6em;
    list-style-position: outside;
  }
  .wxp-root ul {
    list-style-type: disc;
  }
  .wxp-root ol {
    list-style-type: decimal;
  }
  .wxp-root li {
    display: list-item;
    margin: 0.35em 0;
  }
  .wxp-root li > ul,
  .wxp-root li > ol {
    margin: 0.45em 0 0.1em;
  }
  .wxp-root ol ol {
    list-style-type: lower-alpha;
  }
  .wxp-root ol ol ol {
    list-style-type: lower-roman;
  }
  .wxp-root li > .wxp-li-paragraph {
    display: inline;
  }
  .wxp-root a {
    color: ${palette.link};
    text-decoration: none;
  }
  .wxp-root .wxp-highlight {
    padding: 0 0.3em;
    border-radius: 0.35em;
    background: ${palette.primarySoft};
    color: ${palette.primary};
  }
  .wxp-root .wxp-footnote-ref {
    margin: 0 0.12em;
    color: ${palette.primary};
    font-size: 0.78em;
    vertical-align: super;
  }
  .wxp-root .wxp-underline {
    text-decoration: underline;
    text-decoration-color: ${palette.primary};
    text-decoration-thickness: 2px;
    text-underline-offset: 0.16em;
  }
  .wxp-root .wxp-wavyline {
    text-decoration: underline wavy ${palette.primary};
    text-underline-offset: 0.18em;
  }
  .wxp-root .wxp-ruby {
    display: inline-flex;
    flex-direction: column-reverse;
    align-items: center;
    vertical-align: middle;
    margin: 0 0.08em;
    line-height: 1.2;
  }
  .wxp-root .wxp-ruby-base {
    color: inherit;
  }
  .wxp-root .wxp-ruby-text {
    margin-bottom: 0.08em;
    color: ${palette.secondary};
    font-size: 0.68em;
  }
  .wxp-root strong {
    color: ${palette.primary};
  }
  ${blockquoteBlock}
  .wxp-root blockquote {
    font-size: ${styleProfile.fontSize};
    line-height: ${styleProfile.lineHeight};
    color: ${palette.text};
  }
  .wxp-root blockquote,
  .wxp-root blockquote p,
  .wxp-root blockquote section,
  .wxp-root blockquote span,
  .wxp-root blockquote strong,
  .wxp-root blockquote em,
  .wxp-root blockquote code,
  .wxp-root blockquote a {
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }
  .wxp-root blockquote p {
    text-indent: 0;
  }
  .wxp-root blockquote > :first-child {
    margin-top: 0;
  }
  .wxp-root blockquote > :last-child {
    margin-bottom: 0;
  }
  .wxp-root img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0.4em auto 0.8em;
    border-radius: ${styleProfile.imageBorderRadius ?? radius2};
  }
  .wxp-root img.wxp-inline-math-image {
    display: inline-block;
    height: 1.15em;
    margin: 0 0.16em;
    vertical-align: -0.12em;
    border-radius: 0;
  }
  .wxp-root img.wxp-rendered-mermaid,
  .wxp-root img.wxp-rendered-math {
    background: #ffffff;
    padding: 0.4em;
  }
  .wxp-root figcaption {
    margin: -0.2em 8px 1em;
    color: ${palette.secondary};
    font-size: 0.88em;
    text-align: center;
  }
  .wxp-root hr {
    margin: 2em 0;
    border: 0;
    border-top: 2px solid ${palette.border};
  }
  .wxp-root .wxp-math-inline {
    display: inline-block;
    padding: 0 0.35em;
    border-radius: 0.4em;
    background: ${palette.primarySoft};
    color: ${palette.primary};
    font-family: 'Times New Roman', 'STSong', serif;
    font-size: 0.95em;
  }
  .wxp-root .wxp-math-block,
  .wxp-root .wxp-mermaid {
    margin: ${styleProfile.paragraphMargin};
    padding: 0.95em 1em;
    border: 1px solid ${palette.border};
    border-radius: ${radius2};
    background: ${palette.quoteBackground};
  }
  .wxp-root .wxp-math-block {
    text-align: center;
    color: ${palette.primary};
    font-family: 'Times New Roman', 'STSong', serif;
  }
  .wxp-root .wxp-mermaid-title {
    margin-bottom: 0.6em;
    color: ${palette.primary};
    font-weight: 600;
  }
  .wxp-root .wxp-mermaid pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'SFMono-Regular', 'JetBrains Mono', monospace;
    font-size: 0.9em;
    line-height: 1.6;
  }
  .wxp-root .wxp-toc {
    margin: ${styleProfile.paragraphMargin};
    padding: 1em 1.1em;
    border: 1px solid ${palette.border};
    border-radius: ${radius2};
    background: ${palette.quoteBackground};
  }
  .wxp-root .wxp-toc-title {
    margin: 0 0 0.8em;
    color: ${palette.primary};
    font-weight: 700;
  }
  .wxp-root .wxp-toc ul {
    margin: 0.45em 0 0.45em 1em;
    padding-left: 1.1em;
  }
  .wxp-root .wxp-toc li {
    margin: 0.3em 0;
  }
  .wxp-root .wxp-toc a {
    color: inherit;
    text-decoration: none;
    pointer-events: none;
  }
  .wxp-root .wxp-slider {
    margin: ${styleProfile.paragraphMargin};
  }
  .wxp-root .wxp-slider-track {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  .wxp-root .wxp-slider-item {
    display: inline-block;
    width: 88%;
    margin-right: 12px;
    vertical-align: top;
  }
  .wxp-root .wxp-slider-item img {
    margin-bottom: 0.3em;
  }
  .wxp-root .wxp-slider-caption,
  .wxp-root .wxp-slider-hint {
    margin: 0.25em 0 0;
    color: ${palette.secondary};
    font-size: 0.86em;
    text-align: center;
    text-indent: 0;
  }
  .wxp-root .wxp-diagram-fallback {
    margin: ${styleProfile.paragraphMargin};
    padding: 0.95em 1em;
    border: 1px solid ${palette.border};
    border-radius: ${radius2};
    background: ${palette.quoteBackground};
  }
  .wxp-root .wxp-diagram-title {
    margin-bottom: 0.55em;
    color: ${palette.primary};
    font-weight: 600;
  }
  .wxp-root .wxp-diagram-fallback pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'SFMono-Regular', 'JetBrains Mono', monospace;
    font-size: 0.88em;
    line-height: 1.65;
  }
  .wxp-root table {
    width: calc(100% - 16px);
    border-collapse: collapse;
    background: ${palette.background};
  }
  .wxp-root th,
  .wxp-root td {
    padding: 0.55em 0.7em;
    border: 1px solid ${palette.border};
    text-align: left;
  }
  .wxp-root th {
    background: ${palette.primarySoft};
  }
  .wxp-root .wxp-code-block {
    margin: ${styleProfile.paragraphMargin};
    overflow: hidden;
    border-radius: ${radius2};
    background: ${palette.codeBackground};
  }
  .wxp-root .wxp-code-block code {
    display: block;
    overflow-x: auto;
    padding: 0.8em 1em 1em;
    color: ${palette.codeText};
    background: ${palette.codeBackground};
    white-space: normal;
    line-height: 1.42;
  }
  .wxp-root .wxp-code-line {
    display: block;
    white-space: normal;
    line-height: inherit;
  }
  .wxp-root code:not(pre code) {
    padding: 3px 6px;
    border-radius: 6px;
    background: ${palette.primarySoft};
    color: ${palette.primary};
    font-size: 0.92em;
  }
  .wxp-root .wxp-code-header {
    display: flex;
    align-items: center;
    padding: 7px 12px;
    background: rgba(255,255,255,0.06);
    ${styleProfile.showMacCodeHeader === false ? "display:none;" : ""}
  }
  .wxp-root .wxp-code-line-number {
    display: inline-block;
    width: 2em;
    margin-right: 0.9em;
    color: rgba(127,127,127,0.9);
    user-select: none;
  }
  ${styleProfile.tagStyle === "plain" ? `.wxp-root .wxp-tag { color: ${palette.primary}; }` : `.wxp-root .wxp-tag {
    display: inline-block;
    padding: 0.15em 0.55em;
    margin: 0 0.1em;
    border-radius: 1em;
    background: ${palette.primarySoft};
    color: ${palette.primary};
    font-size: 0.88em;
    font-weight: 500;
    vertical-align: middle;
    line-height: 1.4;
  }`}
  ${codeHighlightCss}
  ${theme.cssOverrides ?? ""}
  `;
}
function extractCaption(href, text6, title2, styleProfile) {
  const cleanText = (text6 ?? "").trim();
  const cleanTitle = (title2 ?? "").trim();
  switch (styleProfile.figureCaptionMode) {
    case "title-first":
      return cleanTitle || cleanText;
    case "alt-first":
      return cleanText || cleanTitle;
    case "alt-only":
      return cleanText;
    case "none":
      return "";
    default:
      return cleanTitle || cleanText;
  }
}
function configureWechatRenderer(md, styleProfile) {
  md.renderer.rules.fence = function(tokens, idx) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim().split(/\s+/g)[0] : '';
    const text = token.content;
    if (info === 'math') {
      return `<section class="wxp-math-block">${escapeHtml(text)}</section>`;
    }
    if (info === 'mermaid') {
      return `<section class="wxp-mermaid"><div class="wxp-mermaid-title">Mermaid 图表示意</div><pre>${escapeHtml(text)}</pre></section>`;
    }
    const lines = text.split('\n');
    const highlighted = lines.map((line2, index2) => {
      const lineNumberHtml = styleProfile.showCodeLineNumbers ? `<span class="wxp-code-line-number">${index2 + 1}</span>` : '';
      return `<span class="wxp-code-line">${lineNumberHtml}${highlightCodeLine(line2, info)}</span>`;
    }).join('');
    const macHeader = styleProfile.showMacCodeHeader === false ? '' : `<div class="wxp-code-header">${MAC_DOTS}</div>`;
    return `<section class="wxp-code-block">${macHeader}<code class="hljs">${highlighted}</code></section>`;
  };
  md.renderer.rules.code_inline = function(tokens, idx) {
    return `<code>${escapeHtml(tokens[idx].content)}</code>`;
  };
  md.renderer.rules.image = function(tokens, idx) {
    const token = tokens[idx];
    const href = token.attrGet('src') || '';
    const alt = token.content || '';
    const title = token.attrGet('title') || '';
    const caption = extractCaption(href, alt, title, styleProfile);
    const imageHtml = `<img src="${href}" alt="${escapeHtml(alt)}" />`;
    if (!caption) {
      return imageHtml;
    }
    return `<figure>${imageHtml}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  };
  md.renderer.rules.link_open = function(tokens, idx) {
    const href = tokens[idx].attrGet('href') || '';
    return `<a href="${href}">`;
  };
}
function transformParagraphBreaks(html5) {
  return html5.replace(/<p>([\s\S]*?)<\/p>/g, (match, inner) => {
    if (!inner.includes('<br')) return match;
    const lines = inner.split(/(?:<br\s*\/?>\s*)+/i).map((line2) => line2.trim()).filter(Boolean);
    if (lines.length <= 1) return match;
    const [firstLine, ...restLines] = lines;
    const continuationHtml = restLines.map((line2) => `<span class="wxp-br-line">${line2}</span>`).join('');
    return `<p>${firstLine}${continuationHtml}</p>`;
  });
}
function transformListItems(html5) {
  html5 = html5.replace(/<li><p>/g, '<li><span class="wxp-li-paragraph">');
  html5 = html5.replace(/<\/p>\s*<\/li>/g, '</span></li>');
  html5 = html5.replace(/<\/p>\s*(<[ou]l)/g, '</span>$1');
  return html5;
}
function extractImages(html5) {
  const matches33 = html5.matchAll(/<img[^>]+src="([^"]+)"/g);
  return [...new Set(Array.from(matches33, (match2) => match2[1]))];
}
function collectHeadings(html5) {
  const headings = [];
  let index2 = 0;
  for (const match2 of html5.matchAll(/<h([1-6])>([\s\S]*?)<\/h\1>/g)) {
    index2 += 1;
    const rawLevel = match2[1];
    const inner2 = match2[2];
    const text6 = stripMarkdownSyntax(inner2);
    headings.push({
      id: `wxp-heading-${index2}`,
      level: Number(rawLevel),
      text: text6
    });
  }
  return headings;
}
function buildTocHtml(headings) {
  if (headings.length === 0) {
    return "";
  }
  const items = headings.filter((heading2) => heading2.level >= 2 && heading2.level <= 4).map((heading2) => {
    return `<li class="wxp-toc-level-${heading2.level}"><span>${escapeHtml(heading2.text)}</span></li>`;
  }).join("");
  if (!items) {
    return "";
  }
  return `<section class="wxp-toc"><p class="wxp-toc-title">目录</p><ul>${items}</ul></section>`;
}
function normalizeWechatHtml(html5) {
  return html5.replace(/<(ol|ul)([^>]*)>\s+/g, "<$1$2>").replace(/\s+<\/(ol|ul)>/g, "</$1>").replace(/<\/li>\s+(?=<li\b)/g, "</li>").replace(/<(li\b[^>]*)>\s+/g, "<$1>").replace(/\s+<\/li>/g, "</li>");
}
function renderMarkdownToWechatHtml(markdown2, options3) {
  const { content, data: data6 } = stripFrontmatter(markdown2);
  const normalizedContent = preprocessWechatMarkdown(content);
  const md = markdownit({ html: true, breaks: true, linkify: true });
  configureWechatRenderer(md, options3.styleProfile);
  let parsedHtml = md.render(normalizedContent);
  parsedHtml = transformParagraphBreaks(parsedHtml);
  parsedHtml = transformListItems(parsedHtml);
  const headings = collectHeadings(parsedHtml);
  const tocHtml = buildTocHtml(headings);
  const rawHtml = parsedHtml.replace(/<section class="wxp-toc-placeholder"><\/section>/g, tocHtml);
  const wrappedHtml = `<section class="wxp-root">${rawHtml}</section>`;
  const html5 = normalizeWechatHtml(
    import_juice.default.inlineContent(wrappedHtml, buildCss(options3.theme, options3.styleProfile), {
      preserveImportant: true,
      removeStyleTags: true
    })
  );
  return {
    html: html5,
    metadata: {
      title: typeof data6.title === "string" ? data6.title : void 0,
      excerpt: toPlainText(normalizedContent).slice(0, 140),
      images: extractImages(html5)
    }
  };
}

