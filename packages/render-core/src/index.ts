var import_juice = __toESM(require_client(), 1);

function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
var noopTest = { exec: () => null };
function edit(regex2, opt = "") {
  let source = typeof regex2 === "string" ? regex2 : regex2.source;
  const obj = {
    replace: (name, val2) => {
      let valSource = typeof val2 === "string" ? val2 : val2.source;
      valSource = valSource.replace(other.caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
var other = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (bull) => new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`),
  htmlBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, "i")
};
var newline = /^(?:[ \t]*(?:\n|$))+/;
var blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var bullet = /(?:[*+-]|\d{1,9}[.)])/;
var lheadingCore = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var lheading = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var lheadingGfm = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var blockText = /^[^\n]+/;
var _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
var def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
var _tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var html3 = edit(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
var blockNormal = {
  blockquote,
  code: blockCode,
  def,
  fences,
  heading,
  hr,
  html: html3,
  lheading,
  list,
  newline,
  paragraph,
  table: noopTest,
  text: blockText
};
var gfmTable = edit(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockGfm = {
  ...blockNormal,
  lheading: lheadingGfm,
  table: gfmTable,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
};
var blockPedantic = {
  ...blockNormal,
  html: edit(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", _comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
};
var escape3 = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var br = /^( {2,}|\\)\n(?!\s*$)/;
var inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _punctuation = /[\p{P}\p{S}]/u;
var _punctuationOrSpace = /[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpace = /[^\s\p{P}\p{S}]/u;
var punctuation = edit(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, _punctuationOrSpace).getRegex();
var _punctuationGfmStrongEm = /(?!~)[\p{P}\p{S}]/u;
var _punctuationOrSpaceGfmStrongEm = /(?!~)[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpaceGfmStrongEm = /(?:[^\s\p{P}\p{S}]|~)/u;
var blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
var emStrongLDelimCore = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var emStrongLDelim = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuation).getRegex();
var emStrongLDelimGfm = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimAstCore = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var emStrongRDelimAst = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimAstGfm = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpaceGfmStrongEm).replace(/punctSpace/g, _punctuationOrSpaceGfmStrongEm).replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimUnd = edit(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var anyPunctuation = edit(/\\(punct)/, "gu").replace(/punct/g, _punctuation).getRegex();
var autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
var tag = edit(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
var link = edit(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
var nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
var reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
var inlineNormal = {
  _backpedal: noopTest,
  // only used for GFM url
  anyPunctuation,
  autolink,
  blockSkip,
  br,
  code: inlineCode,
  del: noopTest,
  emStrongLDelim,
  emStrongRDelimAst,
  emStrongRDelimUnd,
  escape: escape3,
  link,
  nolink,
  punctuation,
  reflink,
  reflinkSearch,
  tag,
  text: inlineText,
  url: noopTest
};
var inlinePedantic = {
  ...inlineNormal,
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
};
var inlineGfm = {
  ...inlineNormal,
  emStrongRDelimAst: emStrongRDelimAstGfm,
  emStrongLDelim: emStrongLDelimGfm,
  url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
var inlineBreaks = {
  ...inlineGfm,
  br: edit(br).replace("{2,}", "*").getRegex(),
  text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var block = {
  normal: blockNormal,
  gfm: blockGfm,
  pedantic: blockPedantic
};
var inline = {
  normal: inlineNormal,
  gfm: inlineGfm,
  breaks: inlineBreaks,
  pedantic: inlinePedantic
};
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape22(html22, encode) {
  if (encode) {
    if (other.escapeTest.test(html22)) {
      return html22.replace(other.escapeReplace, getEscapeReplacement);
    }
  } else {
    if (other.escapeTestNoEncode.test(html22)) {
      return html22.replace(other.escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html22;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(other.percentDecode, "%");
  } catch {
    return null;
  }
  return href;
}
function splitCells(tableRow, count2) {
  const row = tableRow.replace(other.findPipe, (match2, offset, str2) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str2[curr] === "\\") escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(other.splitPipe);
  let i3 = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells.at(-1)?.trim()) {
    cells.pop();
  }
  if (count2) {
    if (cells.length > count2) {
      cells.splice(count2);
    } else {
      while (cells.length < count2) cells.push("");
    }
  }
  for (; i3 < cells.length; i3++) {
    cells[i3] = cells[i3].trim().replace(other.slashPipe, "|");
  }
  return cells;
}
function rtrim(str2, c3, invert2) {
  const l4 = str2.length;
  if (l4 === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l4) {
    const currChar = str2.charAt(l4 - suffLen - 1);
    if (currChar === c3 && !invert2) {
      suffLen++;
    } else if (currChar !== c3 && invert2) {
      suffLen++;
    } else {
      break;
    }
  }
  return str2.slice(0, l4 - suffLen);
}
function findClosingBracket(str2, b3) {
  if (str2.indexOf(b3[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i3 = 0; i3 < str2.length; i3++) {
    if (str2[i3] === "\\") {
      i3++;
    } else if (str2[i3] === b3[0]) {
      level++;
    } else if (str2[i3] === b3[1]) {
      level--;
      if (level < 0) {
        return i3;
      }
    }
  }
  if (level > 0) {
    return -2;
  }
  return -1;
}
function outputLink(cap, link22, raw, lexer2, rules) {
  const href = link22.href;
  const title2 = link22.title || null;
  const text6 = cap[1].replace(rules.other.outputLinkReplace, "$1");
  lexer2.state.inLink = true;
  const token2 = {
    type: cap[0].charAt(0) === "!" ? "image" : "link",
    raw,
    href,
    title: title2,
    text: text6,
    tokens: lexer2.inlineTokens(text6)
  };
  lexer2.state.inLink = false;
  return token2;
}
function indentCodeCompensation(raw, text6, rules) {
  const matchIndentToCode = raw.match(rules.other.indentCodeCompensation);
  if (matchIndentToCode === null) {
    return text6;
  }
  const indentToCode = matchIndentToCode[1];
  return text6.split("\n").map((node2) => {
    const matchIndentInNode = node2.match(rules.other.beginningSpace);
    if (matchIndentInNode === null) {
      return node2;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node2.slice(indentToCode.length);
    }
    return node2;
  }).join("\n");
}
var _Tokenizer = class {
  options;
  rules;
  // set by the lexer
  lexer;
  // set by the lexer
  constructor(options22) {
    this.options = options22 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text6 = cap[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text6, "\n") : text6
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text6 = indentCodeCompensation(raw, cap[3] || "", this.rules);
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text: text6
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text6 = cap[2].trim();
      if (this.rules.other.endingHash.test(text6)) {
        const trimmed = rtrim(text6, "#");
        if (this.options.pedantic) {
          text6 = trimmed.trim();
        } else if (!trimmed || this.rules.other.endingSpaceChar.test(trimmed)) {
          text6 = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text: text6,
        tokens: this.lexer.inline(text6)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], "\n")
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines = rtrim(cap[0], "\n").split("\n");
      let raw = "";
      let text6 = "";
      const tokens2 = [];
      while (lines.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i3;
        for (i3 = 0; i3 < lines.length; i3++) {
          if (this.rules.other.blockquoteStart.test(lines[i3])) {
            currentLines.push(lines[i3]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines[i3]);
          } else {
            break;
          }
        }
        lines = lines.slice(i3);
        const currentRaw = currentLines.join("\n");
        const currentText = currentRaw.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text6 = text6 ? `${text6}
${currentText}` : currentText;
        const top2 = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens2, true);
        this.lexer.state.top = top2;
        if (lines.length === 0) {
          break;
        }
        const lastToken = tokens2.at(-1);
        if (lastToken?.type === "code") {
          break;
        } else if (lastToken?.type === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.blockquote(newText);
          tokens2[tokens2.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text6 = text6.substring(0, text6.length - oldToken.text.length) + newToken.text;
          break;
        } else if (lastToken?.type === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.list(newText);
          tokens2[tokens2.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text6 = text6.substring(0, text6.length - oldToken.raw.length) + newToken.raw;
          lines = newText.substring(tokens2.at(-1).raw.length).split("\n");
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens: tokens2,
        text: text6
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list2 = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = this.rules.other.listItemRegex(bull);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line2 = cap[2].split("\n", 1)[0].replace(this.rules.other.listReplaceTabs, (t4) => " ".repeat(3 * t4.length));
        let nextLine = src.split("\n", 1)[0];
        let blankLine = !line2.trim();
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line2.trimStart();
        } else if (blankLine) {
          indent = cap[1].length + 1;
        } else {
          indent = cap[2].search(this.rules.other.nonSpaceChar);
          indent = indent > 4 ? 1 : indent;
          itemContents = line2.slice(indent);
          indent += cap[1].length;
        }
        if (blankLine && this.rules.other.blankLine.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = this.rules.other.nextBulletRegex(indent);
          const hrRegex = this.rules.other.hrRegex(indent);
          const fencesBeginRegex = this.rules.other.fencesBeginRegex(indent);
          const headingBeginRegex = this.rules.other.headingBeginRegex(indent);
          const htmlBeginRegex = this.rules.other.htmlBeginRegex(indent);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(this.rules.other.listReplaceNesting, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(this.rules.other.tabCharGlobal, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(this.rules.other.nonSpaceChar) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLineWithoutTabs.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line2.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line2)) {
                break;
              }
              if (headingBeginRegex.test(line2)) {
                break;
              }
              if (hrRegex.test(line2)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line2 = nextLineWithoutTabs.slice(indent);
          }
        }
        if (!list2.loose) {
          if (endsWithBlankLine) {
            list2.loose = true;
          } else if (this.rules.other.doubleBlankLine.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = this.rules.other.listIsTask.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(this.rules.other.listReplaceTask, "");
          }
        }
        list2.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list2.raw += raw;
      }
      const lastItem = list2.items.at(-1);
      if (lastItem) {
        lastItem.raw = lastItem.raw.trimEnd();
        lastItem.text = lastItem.text.trimEnd();
      } else {
        return;
      }
      list2.raw = list2.raw.trimEnd();
      for (let i3 = 0; i3 < list2.items.length; i3++) {
        this.lexer.state.top = false;
        list2.items[i3].tokens = this.lexer.blockTokens(list2.items[i3].text, []);
        if (!list2.loose) {
          const spacers = list2.items[i3].tokens.filter((t4) => t4.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t4) => this.rules.other.anyLine.test(t4.raw));
          list2.loose = hasMultipleLineBreaks;
        }
      }
      if (list2.loose) {
        for (let i3 = 0; i3 < list2.items.length; i3++) {
          list2.items[i3].loose = true;
        }
      }
      return list2;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token2 = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token2;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag2 = cap[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " ");
      const href = cap[2] ? cap[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title2 = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag: tag2,
        raw: cap[0],
        href,
        title: title2
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!this.rules.other.tableDelimiter.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(this.rules.other.tableAlignChars, "").split("|");
    const rows = cap[3]?.trim() ? cap[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (this.rules.other.tableAlignRight.test(align)) {
        item.align.push("right");
      } else if (this.rules.other.tableAlignCenter.test(align)) {
        item.align.push("center");
      } else if (this.rules.other.tableAlignLeft.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i3 = 0; i3 < headers.length; i3++) {
      item.header.push({
        text: headers[i3],
        tokens: this.lexer.inline(headers[i3]),
        header: true,
        align: item.align[i3]
      });
    }
    for (const row of rows) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i3) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i3]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text6 = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text: text6,
        tokens: this.lexer.inline(text6)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: cap[1]
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && this.rules.other.startATag.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && this.rules.other.endATag.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(trimmedUrl)) {
        if (!this.rules.other.endAngleBracket.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex === -2) {
          return;
        }
        if (lastParenIndex > -1) {
          const start3 = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start3 + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title2 = "";
      if (this.options.pedantic) {
        const link22 = this.rules.other.pedanticHrefTitle.exec(href);
        if (link22) {
          href = link22[1];
          title2 = link22[3];
        }
      } else {
        title2 = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (this.rules.other.startAngleBracket.test(href)) {
        if (this.options.pedantic && !this.rules.other.endAngleBracket.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title2 ? title2.replace(this.rules.inline.anyPunctuation, "$1") : title2
      }, cap[0], this.lexer, this.rules);
    }
  }
  reflink(src, links3) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(this.rules.other.multipleSpaceGlobal, " ");
      const link22 = links3[linkString.toLowerCase()];
      if (!link22) {
        const text6 = cap[0].charAt(0);
        return {
          type: "text",
          raw: text6,
          text: text6
        };
      }
      return outputLink(cap, link22, cap[0], this.lexer, this.rules);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match2 = this.rules.inline.emStrongLDelim.exec(src);
    if (!match2) return;
    if (match2[3] && prevChar.match(this.rules.other.unicodeAlphaNumeric)) return;
    const nextChar = match2[1] || match2[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match2[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match2[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match2 = endReg.exec(maskedSrc)) != null) {
        rDelim = match2[1] || match2[2] || match2[3] || match2[4] || match2[5] || match2[6];
        if (!rDelim) continue;
        rLength = [...rDelim].length;
        if (match2[3] || match2[4]) {
          delimTotal += rLength;
          continue;
        } else if (match2[5] || match2[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0) continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [...match2[0]][0].length;
        const raw = src.slice(0, lLength + match2.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text22 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text22,
            tokens: this.lexer.inlineTokens(text22)
          };
        }
        const text6 = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text: text6,
          tokens: this.lexer.inlineTokens(text6)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text6 = cap[2].replace(this.rules.other.newLineCharGlobal, " ");
      const hasNonSpaceChars = this.rules.other.nonSpaceChar.test(text6);
      const hasSpaceCharsOnBothEnds = this.rules.other.startingSpaceChar.test(text6) && this.rules.other.endingSpaceChar.test(text6);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text6 = text6.substring(1, text6.length - 1);
      }
      return {
        type: "codespan",
        raw: cap[0],
        text: text6
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text6, href;
      if (cap[2] === "@") {
        text6 = cap[1];
        href = "mailto:" + text6;
      } else {
        text6 = cap[1];
        href = text6;
      }
      return {
        type: "link",
        raw: cap[0],
        text: text6,
        href,
        tokens: [
          {
            type: "text",
            raw: text6,
            text: text6
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text6, href;
      if (cap[2] === "@") {
        text6 = cap[0];
        href = "mailto:" + text6;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? "";
        } while (prevCapZero !== cap[0]);
        text6 = cap[0];
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text: text6,
        href,
        tokens: [
          {
            type: "text",
            raw: text6,
            text: text6
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      const escaped = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        escaped
      };
    }
  }
};
var _Lexer = class __Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options22) {
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options22 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      other,
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options22) {
    const lexer2 = new __Lexer(options22);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options22) {
    const lexer2 = new __Lexer(options22);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(other.carriageReturn, "\n");
    this.blockTokens(src, this.tokens);
    for (let i3 = 0; i3 < this.inlineQueue.length; i3++) {
      const next4 = this.inlineQueue[i3];
      this.inlineTokens(next4.src, next4.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens2 = [], lastParagraphClipped = false) {
    if (this.options.pedantic) {
      src = src.replace(other.tabCharGlobal, "    ").replace(other.spaceLine, "");
    }
    while (src) {
      let token2;
      if (this.options.extensions?.block?.some((extTokenizer) => {
        if (token2 = extTokenizer.call({ lexer: this }, src, tokens2)) {
          src = src.substring(token2.raw.length);
          tokens2.push(token2);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token2 = this.tokenizer.space(src)) {
        src = src.substring(token2.raw.length);
        const lastToken = tokens2.at(-1);
        if (token2.raw.length === 1 && lastToken !== void 0) {
          lastToken.raw += "\n";
        } else {
          tokens2.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.code(src)) {
        src = src.substring(token2.raw.length);
        const lastToken = tokens2.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.text;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens2.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.fences(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.heading(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.hr(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.blockquote(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.list(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.html(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.def(src)) {
        src = src.substring(token2.raw.length);
        const lastToken = tokens2.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.raw;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else if (!this.tokens.links[token2.tag]) {
          this.tokens.links[token2.tag] = {
            href: token2.href,
            title: token2.title
          };
        }
        continue;
      }
      if (token2 = this.tokenizer.table(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.lheading(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token2 = this.tokenizer.paragraph(cutSrc))) {
        const lastToken = tokens2.at(-1);
        if (lastParagraphClipped && lastToken?.type === "paragraph") {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens2.push(token2);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token2.raw.length);
        continue;
      }
      if (token2 = this.tokenizer.text(src)) {
        src = src.substring(token2.raw.length);
        const lastToken = tokens2.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens2.push(token2);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens2;
  }
  inline(src, tokens2 = []) {
    this.inlineQueue.push({ src, tokens: tokens2 });
    return tokens2;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens2 = []) {
    let maskedSrc = src;
    let match2 = null;
    if (this.tokens.links) {
      const links3 = Object.keys(this.tokens.links);
      if (links3.length > 0) {
        while ((match2 = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links3.includes(match2[0].slice(match2[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match2.index) + "[" + "a".repeat(match2[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match2 = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match2.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while ((match2 = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match2.index) + "[" + "a".repeat(match2[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    let keepPrevChar = false;
    let prevChar = "";
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      let token2;
      if (this.options.extensions?.inline?.some((extTokenizer) => {
        if (token2 = extTokenizer.call({ lexer: this }, src, tokens2)) {
          src = src.substring(token2.raw.length);
          tokens2.push(token2);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token2 = this.tokenizer.escape(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.tag(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.link(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token2.raw.length);
        const lastToken = tokens2.at(-1);
        if (token2.type === "text" && lastToken?.type === "text") {
          lastToken.raw += token2.raw;
          lastToken.text += token2.text;
        } else {
          tokens2.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.codespan(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.br(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.del(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.autolink(src)) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      if (!this.state.inLink && (token2 = this.tokenizer.url(src))) {
        src = src.substring(token2.raw.length);
        tokens2.push(token2);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token2 = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token2.raw.length);
        if (token2.raw.slice(-1) !== "_") {
          prevChar = token2.raw.slice(-1);
        }
        keepPrevChar = true;
        const lastToken = tokens2.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += token2.raw;
          lastToken.text += token2.text;
        } else {
          tokens2.push(token2);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens2;
  }
};
var _Renderer = class {
  options;
  parser;
  // set by the parser
  constructor(options22) {
    this.options = options22 || _defaults;
  }
  space(token2) {
    return "";
  }
  code({ text: text6, lang, escaped }) {
    const langString = (lang || "").match(other.notSpaceStart)?.[0];
    const code = text6.replace(other.endingNewline, "") + "\n";
    if (!langString) {
      return "<pre><code>" + (escaped ? code : escape22(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape22(langString) + '">' + (escaped ? code : escape22(code, true)) + "</code></pre>\n";
  }
  blockquote({ tokens: tokens2 }) {
    const body = this.parser.parse(tokens2);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text: text6 }) {
    return text6;
  }
  heading({ tokens: tokens2, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens2)}</h${depth}>
`;
  }
  hr(token2) {
    return "<hr>\n";
  }
  list(token2) {
    const ordered = token2.ordered;
    const start3 = token2.start;
    let body = "";
    for (let j3 = 0; j3 < token2.items.length; j3++) {
      const item = token2.items[j3];
      body += this.listitem(item);
    }
    const type3 = ordered ? "ol" : "ul";
    const startAttr = ordered && start3 !== 1 ? ' start="' + start3 + '"' : "";
    return "<" + type3 + startAttr + ">\n" + body + "</" + type3 + ">\n";
  }
  listitem(item) {
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (item.tokens[0]?.type === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + escape22(item.tokens[0].tokens[0].text);
            item.tokens[0].tokens[0].escaped = true;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " ",
            escaped: true
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: tokens2 }) {
    return `<p>${this.parser.parseInline(tokens2)}</p>
`;
  }
  table(token2) {
    let header = "";
    let cell = "";
    for (let j3 = 0; j3 < token2.header.length; j3++) {
      cell += this.tablecell(token2.header[j3]);
    }
    header += this.tablerow({ text: cell });
    let body = "";
    for (let j3 = 0; j3 < token2.rows.length; j3++) {
      const row = token2.rows[j3];
      cell = "";
      for (let k3 = 0; k3 < row.length; k3++) {
        cell += this.tablecell(row[k3]);
      }
      body += this.tablerow({ text: cell });
    }
    if (body) body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow({ text: text6 }) {
    return `<tr>
${text6}</tr>
`;
  }
  tablecell(token2) {
    const content = this.parser.parseInline(token2.tokens);
    const type3 = token2.header ? "th" : "td";
    const tag2 = token2.align ? `<${type3} align="${token2.align}">` : `<${type3}>`;
    return tag2 + content + `</${type3}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens: tokens2 }) {
    return `<strong>${this.parser.parseInline(tokens2)}</strong>`;
  }
  em({ tokens: tokens2 }) {
    return `<em>${this.parser.parseInline(tokens2)}</em>`;
  }
  codespan({ text: text6 }) {
    return `<code>${escape22(text6, true)}</code>`;
  }
  br(token2) {
    return "<br>";
  }
  del({ tokens: tokens2 }) {
    return `<del>${this.parser.parseInline(tokens2)}</del>`;
  }
  link({ href, title: title2, tokens: tokens2 }) {
    const text6 = this.parser.parseInline(tokens2);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text6;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title2) {
      out += ' title="' + escape22(title2) + '"';
    }
    out += ">" + text6 + "</a>";
    return out;
  }
  image({ href, title: title2, text: text6, tokens: tokens2 }) {
    if (tokens2) {
      text6 = this.parser.parseInline(tokens2, this.parser.textRenderer);
    }
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return escape22(text6);
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text6}"`;
    if (title2) {
      out += ` title="${escape22(title2)}"`;
    }
    out += ">";
    return out;
  }
  text(token2) {
    return "tokens" in token2 && token2.tokens ? this.parser.parseInline(token2.tokens) : "escaped" in token2 && token2.escaped ? token2.text : escape22(token2.text);
  }
};
var _TextRenderer = class {
  // no need for block level renderers
  strong({ text: text6 }) {
    return text6;
  }
  em({ text: text6 }) {
    return text6;
  }
  codespan({ text: text6 }) {
    return text6;
  }
  del({ text: text6 }) {
    return text6;
  }
  html({ text: text6 }) {
    return text6;
  }
  text({ text: text6 }) {
    return text6;
  }
  link({ text: text6 }) {
    return "" + text6;
  }
  image({ text: text6 }) {
    return "" + text6;
  }
  br() {
    return "";
  }
};
var _Parser = class __Parser {
  options;
  renderer;
  textRenderer;
  constructor(options22) {
    this.options = options22 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens2, options22) {
    const parser27 = new __Parser(options22);
    return parser27.parse(tokens2);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens2, options22) {
    const parser27 = new __Parser(options22);
    return parser27.parseInline(tokens2);
  }
  /**
   * Parse Loop
   */
  parse(tokens2, top2 = true) {
    let out = "";
    for (let i3 = 0; i3 < tokens2.length; i3++) {
      const anyToken = tokens2[i3];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token2 = anyToken;
      switch (token2.type) {
        case "space": {
          out += this.renderer.space(token2);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token2);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token2);
          continue;
        }
        case "code": {
          out += this.renderer.code(token2);
          continue;
        }
        case "table": {
          out += this.renderer.table(token2);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token2);
          continue;
        }
        case "list": {
          out += this.renderer.list(token2);
          continue;
        }
        case "html": {
          out += this.renderer.html(token2);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token2);
          continue;
        }
        case "text": {
          let textToken = token2;
          let body = this.renderer.text(textToken);
          while (i3 + 1 < tokens2.length && tokens2[i3 + 1].type === "text") {
            textToken = tokens2[++i3];
            body += "\n" + this.renderer.text(textToken);
          }
          if (top2) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [{ type: "text", raw: body, text: body, escaped: true }]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token2.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens2, renderer12 = this.renderer) {
    let out = "";
    for (let i3 = 0; i3 < tokens2.length; i3++) {
      const anyToken = tokens2[i3];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token2 = anyToken;
      switch (token2.type) {
        case "escape": {
          out += renderer12.text(token2);
          break;
        }
        case "html": {
          out += renderer12.html(token2);
          break;
        }
        case "link": {
          out += renderer12.link(token2);
          break;
        }
        case "image": {
          out += renderer12.image(token2);
          break;
        }
        case "strong": {
          out += renderer12.strong(token2);
          break;
        }
        case "em": {
          out += renderer12.em(token2);
          break;
        }
        case "codespan": {
          out += renderer12.codespan(token2);
          break;
        }
        case "br": {
          out += renderer12.br(token2);
          break;
        }
        case "del": {
          out += renderer12.del(token2);
          break;
        }
        case "text": {
          out += renderer12.text(token2);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token2.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};
var _Hooks = class {
  options;
  block;
  constructor(options22) {
    this.options = options22 || _defaults;
  }
  static passThroughHooks = /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess",
    "processAllTokens"
  ]);
  /**
   * Process markdown before marked
   */
  preprocess(markdown2) {
    return markdown2;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html22) {
    return html22;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(tokens2) {
    return tokens2;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? _Lexer.lex : _Lexer.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? _Parser.parse : _Parser.parseInline;
  }
};
var Marked = class {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = _Parser;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens2, callback) {
    let values2 = [];
    for (const token2 of tokens2) {
      values2 = values2.concat(callback.call(this, token2));
      switch (token2.type) {
        case "table": {
          const tableToken = token2;
          for (const cell of tableToken.header) {
            values2 = values2.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values2 = values2.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token2;
          values2 = values2.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token2;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens22 = genericToken[childTokens].flat(Infinity);
              values2 = values2.concat(this.walkTokens(tokens22, callback));
            });
          } else if (genericToken.tokens) {
            values2 = values2.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values2;
  }
  use(...args) {
    const extensions2 = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions2.renderers[ext.name];
            if (prevRenderer) {
              extensions2.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions2.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions2[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions2[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions2.startBlock) {
                  extensions2.startBlock.push(ext.start);
                } else {
                  extensions2.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions2.startInline) {
                  extensions2.startInline.push(ext.start);
                } else {
                  extensions2.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions2.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions2;
      }
      if (pack.renderer) {
        const renderer12 = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop2 in pack.renderer) {
          if (!(prop2 in renderer12)) {
            throw new Error(`renderer '${prop2}' does not exist`);
          }
          if (["options", "parser"].includes(prop2)) {
            continue;
          }
          const rendererProp = prop2;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer12[rendererProp];
          renderer12[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer12, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer12, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer12;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop2 in pack.tokenizer) {
          if (!(prop2 in tokenizer)) {
            throw new Error(`tokenizer '${prop2}' does not exist`);
          }
          if (["options", "rules", "lexer"].includes(prop2)) {
            continue;
          }
          const tokenizerProp = prop2;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop2 in pack.hooks) {
          if (!(prop2 in hooks)) {
            throw new Error(`hook '${prop2}' does not exist`);
          }
          if (["options", "block"].includes(prop2)) {
            continue;
          }
          const hooksProp = prop2;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop2)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token2) {
          let values2 = [];
          values2.push(packWalktokens.call(this, token2));
          if (walkTokens2) {
            values2 = values2.concat(walkTokens2.call(this, token2));
          }
          return values2;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  lexer(src, options22) {
    return _Lexer.lex(src, options22 ?? this.defaults);
  }
  parser(tokens2, options22) {
    return _Parser.parse(tokens2, options22 ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse23 = (src, options22) => {
      const origOpt = { ...options22 };
      const opt = { ...this.defaults, ...origOpt };
      const throwError2 = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError2(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError2(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError2(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer2 = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser27 = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens2) => opt.hooks ? opt.hooks.processAllTokens(tokens2) : tokens2).then((tokens2) => opt.walkTokens ? Promise.all(this.walkTokens(tokens2, opt.walkTokens)).then(() => tokens2) : tokens2).then((tokens2) => parser27(tokens2, opt)).then((html22) => opt.hooks ? opt.hooks.postprocess(html22) : html22).catch(throwError2);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens2 = lexer2(src, opt);
        if (opt.hooks) {
          tokens2 = opt.hooks.processAllTokens(tokens2);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens2, opt.walkTokens);
        }
        let html22 = parser27(tokens2, opt);
        if (opt.hooks) {
          html22 = opt.hooks.postprocess(html22);
        }
        return html22;
      } catch (e3) {
        return throwError2(e3);
      }
    };
    return parse23;
  }
  onError(silent, async) {
    return (e3) => {
      e3.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape22(e3.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e3);
      }
      throw e3;
    };
  }
};
var markedInstance = new Marked();
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options22) {
  markedInstance.setOptions(options22);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens2, callback) {
  return markedInstance.walkTokens(tokens2, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

var MAC_DOTS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 130" width="45" height="13" aria-hidden="true"><ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)"/><ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)"/><ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)"/></svg>`;
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
var GITHUB_DARK_HIGHLIGHT_CSS = `
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
var GITHUB_HIGHLIGHT_CSS = `
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
var FONT_PRESET_STACKS = {
  "theme-default": "",
  sans: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Georgia', 'Songti SC', 'Noto Serif SC', serif",
  mono: "'SFMono-Regular', 'JetBrains Mono', 'Fira Code', 'Microsoft YaHei Mono', monospace",
  rounded: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
};
var CALLOUT_LABELS = {
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
function buildRenderer(styleProfile) {
  const renderer12 = new _Renderer();
  renderer12.code = ({ text: text6, lang }) => {
    if (lang?.toLowerCase() === "math") {
      return `<section class="wxp-math-block">${escapeHtml(text6)}</section>`;
    }
    if (lang?.toLowerCase() === "mermaid") {
      return `<section class="wxp-mermaid"><div class="wxp-mermaid-title">Mermaid 图表示意</div><pre>${escapeHtml(text6)}</pre></section>`;
    }
    const lines = text6.split("\n");
    const highlighted = lines.map((line2, index2) => {
      const lineNumberHtml = styleProfile.showCodeLineNumbers ? `<span class="wxp-code-line-number">${index2 + 1}</span>` : "";
      return `<span class="wxp-code-line">${lineNumberHtml}${highlightCodeLine(line2, lang)}</span>`;
    }).join("");
    const macHeader = styleProfile.showMacCodeHeader === false ? "" : `<div class="wxp-code-header">${MAC_DOTS}</div>`;
    return `<section class="wxp-code-block">${macHeader}<code class="hljs">${highlighted}</code></section>`;
  };
  renderer12.codespan = ({ text: text6 }) => `<code>${escapeHtml(text6)}</code>`;
  renderer12.paragraph = function({ tokens: tokens2 = [] }) {
    const inlineHtml = this.parser.parseInline(tokens2);
    if (!inlineHtml.includes("<br") && !inlineHtml.includes("\n")) {
      return `<p>${inlineHtml}</p>`;
    }
    const lines = inlineHtml.split(/(?:<br\s*\/?>|\n)+/i).map((line2) => line2.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return `<p>${inlineHtml}</p>`;
    }
    const [firstLine, ...restLines] = lines;
    const continuationHtml = restLines.map((line2) => `<span class="wxp-br-line">${line2}</span>`).join("");
    return `<p>${firstLine}${continuationHtml}</p>`;
  };
  renderer12.image = ({ href, text: text6, title: title2 }) => {
    const caption = extractCaption(href, text6, title2, styleProfile);
    const imageHtml = `<img src="${href}" alt="${escapeHtml(text6 || "")}" />`;
    if (!caption) {
      return imageHtml;
    }
    return `<figure>${imageHtml}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  };
  renderer12.link = ({ href, text: text6 }) => `<a href="${href}">${text6}</a>`;
  renderer12.listitem = function({ tokens: tokens2 }) {
    const inlineTokens = tokens2.filter((token2) => token2.type !== "list");
    const blockTokens = tokens2.filter((token2) => token2.type === "list");
    const inlineHtml = inlineTokens.length > 0 ? this.parser.parseInline(inlineTokens) : "";
    const blockHtml = blockTokens.length > 0 ? this.parser.parse(blockTokens) : "";
    return inlineHtml ? `<li><span class="wxp-li-paragraph">${inlineHtml}</span>${blockHtml}</li>` : `<li>${blockHtml}</li>`;
  };
  return renderer12;
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
  const marked2 = new Marked({
    breaks: true,
    gfm: true
  });
  marked2.use({ renderer: buildRenderer(options3.styleProfile) });
  const parsedHtml = marked2.parse(normalizedContent);
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

