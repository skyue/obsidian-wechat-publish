var BUILTIN_THEMES = [
  {
    id: "classic",
    label: "经典蓝",
    description: "经典蓝白，接近公众号常见教程排版。",
    radius: "8px",
    palette: {
      primary: "#0F4C81",
      primarySoft: "#EAF2FA",
      secondary: "#576B95",
      text: "#2F3440",
      background: "#FFFFFF",
      surface: "#F6F8FB",
      border: "#D9E2EC",
      link: "#576B95",
      codeBackground: "#0D1117",
      codeText: "#E6EDF3",
      quoteBackground: "#F7F7F7"
    },
    typography: {
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.75,
      letterSpacing: "0.04em",
      headingWeight: 700
    }
  },
  {
    id: "graphite",
    label: "石墨灰",
    description: "冷静的深灰金属风，适合产品说明。",
    radius: "10px",
    palette: {
      primary: "#2F3A4A",
      primarySoft: "#EEF2F7",
      secondary: "#5D7285",
      text: "#25303B",
      background: "#FFFFFF",
      surface: "#F3F5F7",
      border: "#CED6DE",
      link: "#415B76",
      codeBackground: "#161B22",
      codeText: "#E6EDF3",
      quoteBackground: "#F5F7FA"
    },
    typography: {
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.78,
      letterSpacing: "0.03em",
      headingWeight: 700
    }
  },
  {
    id: "maple",
    label: "枫糖棕",
    description: "暖色杂志感，适合故事和观点文。",
    radius: "10px",
    palette: {
      primary: "#9E4B32",
      primarySoft: "#FBEEE8",
      secondary: "#7C6857",
      text: "#473B35",
      background: "#FFFDF9",
      surface: "#FBF5EE",
      border: "#E9D6C7",
      link: "#8A4A35",
      codeBackground: "#2B211D",
      codeText: "#F6E9E2",
      quoteBackground: "#F9F0E8"
    },
    typography: {
      fontFamily: "'Georgia', 'PingFang SC', 'Hiragino Sans GB', serif",
      fontSize: "17px",
      lineHeight: 1.85,
      letterSpacing: "0.03em",
      headingWeight: 700
    }
  },
  {
    id: "mint",
    label: "薄荷绿",
    description: "清爽的薄荷绿，适合轻教程和知识卡片。",
    radius: "12px",
    palette: {
      primary: "#1F8A70",
      primarySoft: "#E8F7F3",
      secondary: "#3C7D73",
      text: "#26433C",
      background: "#FFFFFF",
      surface: "#F3FBF8",
      border: "#CCE8E0",
      link: "#1E7F68",
      codeBackground: "#0F2420",
      codeText: "#D9F4EC",
      quoteBackground: "#EEF8F4"
    },
    typography: {
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Trebuchet MS', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.8,
      letterSpacing: "0.035em",
      headingWeight: 700
    }
  },
  {
    id: "sunrise",
    label: "朝阳橙",
    description: "高对比橙黄，适合运营和增长内容。",
    radius: "12px",
    palette: {
      primary: "#C96A1B",
      primarySoft: "#FFF3E6",
      secondary: "#A55D24",
      text: "#4B3B2B",
      background: "#FFFDF8",
      surface: "#FFF7EE",
      border: "#F0D7BB",
      link: "#B85F18",
      codeBackground: "#2A1D11",
      codeText: "#FFEBD7",
      quoteBackground: "#FFF3E4"
    },
    typography: {
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.78,
      letterSpacing: "0.04em",
      headingWeight: 800
    }
  },
  {
    id: "lake",
    label: "湖水青",
    description: "偏青色的内容页，适合专业讲解。",
    radius: "10px",
    palette: {
      primary: "#15616D",
      primarySoft: "#E7F4F6",
      secondary: "#3C7680",
      text: "#244047",
      background: "#FFFFFF",
      surface: "#F2FAFB",
      border: "#C9E0E4",
      link: "#165C68",
      codeBackground: "#102125",
      codeText: "#D7EEF2",
      quoteBackground: "#EEF7F8"
    },
    typography: {
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.8,
      letterSpacing: "0.03em",
      headingWeight: 700
    }
  },
  {
    id: "newspaper",
    label: "报刊风",
    description: "更像专栏文章的报刊风。",
    radius: "4px",
    palette: {
      primary: "#111111",
      primarySoft: "#F3F0E7",
      secondary: "#555555",
      text: "#222222",
      background: "#FFFDF7",
      surface: "#FAF6EC",
      border: "#DDD3BD",
      link: "#3E5C76",
      codeBackground: "#1C1C1C",
      codeText: "#F5F5F5",
      quoteBackground: "#F3EEE1"
    },
    typography: {
      fontFamily: "'Georgia', 'Songti SC', 'PingFang SC', serif",
      fontSize: "17px",
      lineHeight: 1.9,
      letterSpacing: "0.02em",
      headingWeight: 700
    },
    cssOverrides: "h1,h2{text-transform:none;} blockquote{font-style:italic;} table{background:#fff;}"
  },
  {
    id: "forest",
    label: "森林绿",
    description: "深绿系，适合方法论和长期主义主题。",
    radius: "12px",
    palette: {
      primary: "#365B43",
      primarySoft: "#EEF5F0",
      secondary: "#56745B",
      text: "#25352B",
      background: "#FCFEFC",
      surface: "#F4F8F4",
      border: "#D5E2D6",
      link: "#41684E",
      codeBackground: "#172019",
      codeText: "#D8E8DA",
      quoteBackground: "#EFF5EF"
    },
    typography: {
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.82,
      letterSpacing: "0.035em",
      headingWeight: 700
    }
  },
  {
    id: "minimal",
    label: "极简白",
    description: "黑白灰 \xB7 大留白，适合观点长文和深度阅读。",
    radius: "4px",
    palette: {
      primary: "#222222",
      primarySoft: "#F5F5F5",
      secondary: "#666666",
      text: "#222222",
      background: "#FFFFFF",
      surface: "#FAFAFA",
      border: "#E5E5E5",
      link: "#222222",
      codeBackground: "#1A1A1A",
      codeText: "#F0F0F0",
      quoteBackground: "#FFFFFF"
    },
    typography: {
      fontFamily: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.9,
      letterSpacing: "0.02em",
      headingWeight: 700
    },
    cssOverrides: ".wxp-root blockquote{border-left-width:2px!important;background:transparent!important;padding-left:18px!important;color:#333!important;font-style:normal!important;}.wxp-root h1,.wxp-root h2,.wxp-root h3,.wxp-root h4{letter-spacing:-0.2px;}"
  },
  {
    id: "editorial",
    label: "编辑部",
    description: "厚横线 + 高对比，像专栏杂志的版式。",
    radius: "2px",
    palette: {
      primary: "#1A1A1A",
      primarySoft: "#F4F2ED",
      secondary: "#555555",
      text: "#1A1A1A",
      background: "#FFFFFF",
      surface: "#FAFAFA",
      border: "#E3E0D7",
      link: "#1A1A1A",
      codeBackground: "#0F0F0F",
      codeText: "#F5F5F5",
      quoteBackground: "#F4F2ED"
    },
    typography: {
      fontFamily: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "16px",
      lineHeight: 1.85,
      letterSpacing: "0",
      headingWeight: 800
    },
    cssOverrides: ".wxp-root h1{letter-spacing:-0.5px;border-bottom:4px solid #1A1A1A;padding-bottom:6px;}.wxp-root hr{border:none;border-top:4px solid #1A1A1A;}.wxp-root blockquote{border-left:none!important;border-radius:2px!important;padding:18px 22px!important;font-weight:500!important;color:#2a2a2a!important;background:#F4F2ED!important;}"
  },
  {
    id: "ink",
    label: "墨卡",
    description: "米色卡片 \xB7 温润克制，像一页淡雅的韩系博客。",
    radius: "8px",
    palette: {
      primary: "#5A5145",
      primarySoft: "#F7F6F3",
      secondary: "#9A8F82",
      text: "#3A3A3A",
      background: "#FFFFFF",
      surface: "#F7F6F3",
      border: "#D9CFBF",
      link: "#5A5145",
      codeBackground: "#2B221B",
      codeText: "#F0E8DC",
      quoteBackground: "#F7F6F3"
    },
    typography: {
      fontFamily: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "15.5px",
      lineHeight: 1.9,
      letterSpacing: "0.02em",
      headingWeight: 600
    },
    cssOverrides: ".wxp-root blockquote{border-left:none!important;color:#5A5145!important;}.wxp-root h2{border-bottom:2px solid #D9CFBF;padding-bottom:3px;display:inline-block;}"
  },
  {
    id: "warm",
    label: "暖栗色",
    description: "米黄底 + 栗色主色 + 圆角，手感柔和。",
    radius: "10px",
    palette: {
      primary: "#8A4B28",
      primarySoft: "#F4E8D4",
      secondary: "#A48060",
      text: "#3A2A1A",
      background: "#FDF8EF",
      surface: "#F4E8D4",
      border: "#E6D3B3",
      link: "#6A3820",
      codeBackground: "#2B1F14",
      codeText: "#F6E9D8",
      quoteBackground: "#F4E8D4"
    },
    typography: {
      fontFamily: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "15.5px",
      lineHeight: 1.9,
      letterSpacing: "0.03em",
      headingWeight: 700
    },
    cssOverrides: ".wxp-root h2{color:#6A3820!important;}.wxp-root blockquote{border:1px solid #E6D3B3!important;color:#6A4020!important;}"
  },
  {
    id: "techno",
    label: "技术流",
    description: "深蓝标题 + 薄荷引用 + 代码块友好，适合技术/工具文。",
    radius: "4px",
    palette: {
      primary: "#3A5A7A",
      primarySoft: "#E6F3F0",
      secondary: "#6A7A8A",
      text: "#2A2A2A",
      background: "#FFFFFF",
      surface: "#F6F8FA",
      border: "#D8DDE4",
      link: "#3A5A7A",
      codeBackground: "#0D1117",
      codeText: "#E6EDF3",
      quoteBackground: "#E6F3F0"
    },
    typography: {
      fontFamily: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
      fontSize: "15.5px",
      lineHeight: 1.85,
      letterSpacing: "0.02em",
      headingWeight: 700
    },
    cssOverrides: (
      // Latin 走等宽，CJK 退回到 Noto Sans SC — 避免中文 h2 被强行 fallback 到 SFMono 造成字宽抖动
      ".wxp-root h2{font-family:'JetBrains Mono','Fira Code',ui-monospace,SFMono-Regular,Menlo,'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;color:#3A5A7A!important;}.wxp-root blockquote{color:#2A5A52!important;border-radius:0 4px 4px 0!important;}"
    )
  }
];
function getThemeById(themeId) {
  return BUILTIN_THEMES.find((theme) => theme.id === themeId) ?? BUILTIN_THEMES[0];
}
var BUILTIN_STYLE_PROFILES = [
  {
    id: "balanced",
    label: "均衡版",
    description: "默认的公众号阅读节奏，适合大多数文章。",
    fontPreset: "sans",
    fontSize: "16px",
    lineHeight: 1.8,
    letterSpacing: "0.02em",
    paragraphMargin: "1.2em 8px",
    headingTopMargin: "2.2em",
    headingBottomMargin: "1em",
    blockquotePadding: "1em 1.1em",
    textAlign: "left",
    paragraphIndent: false,
    imageBorderRadius: "8px",
    h1Style: "underline",
    h2Style: "solid",
    h3Style: "bar",
    h4Style: "accent",
    calloutStyleMode: "card-soft",
    codeTheme: "github-dark",
    showMacCodeHeader: true,
    showCodeLineNumbers: false,
    figureCaptionMode: "none"
  },
  {
    id: "compact",
    label: "紧凑版",
    description: "更省篇幅，适合资讯、清单和短内容。",
    fontPreset: "sans",
    fontSize: "15px",
    lineHeight: 1.65,
    letterSpacing: "0.015em",
    paragraphMargin: "0.9em 8px",
    headingTopMargin: "1.7em",
    headingBottomMargin: "0.75em",
    blockquotePadding: "0.85em 1em",
    textAlign: "left",
    paragraphIndent: false,
    imageBorderRadius: "6px",
    h1Style: "underline",
    h2Style: "plain",
    h3Style: "plain",
    h4Style: "plain",
    calloutStyleMode: "bar-square",
    codeTheme: "github",
    showMacCodeHeader: false,
    showCodeLineNumbers: false,
    figureCaptionMode: "alt-only"
  },
  {
    id: "airy",
    label: "舒展版",
    description: "留白更多，适合长文和叙事内容。",
    fontPreset: "rounded",
    fontSize: "17px",
    lineHeight: 1.95,
    letterSpacing: "0.025em",
    paragraphMargin: "1.45em 8px",
    headingTopMargin: "2.6em",
    headingBottomMargin: "1.15em",
    blockquotePadding: "1.15em 1.2em",
    textAlign: "justify",
    paragraphIndent: true,
    imageBorderRadius: "10px",
    h1Style: "underline",
    h2Style: "solid",
    h3Style: "capsule",
    h4Style: "eyebrow",
    calloutStyleMode: "card-rounded",
    codeTheme: "github-dark",
    showMacCodeHeader: true,
    showCodeLineNumbers: false,
    figureCaptionMode: "title-first"
  },
  {
    id: "magazine",
    label: "专栏版",
    description: "更像专栏排版，适合观点和品牌内容。",
    fontPreset: "serif",
    fontFamily: "'Georgia', 'PingFang SC', 'Hiragino Sans GB', serif",
    fontSize: "17px",
    lineHeight: 1.88,
    letterSpacing: "0.025em",
    paragraphMargin: "1.3em 8px",
    headingTopMargin: "2.4em",
    headingBottomMargin: "1em",
    blockquotePadding: "1em 1.15em",
    textAlign: "justify",
    paragraphIndent: true,
    imageBorderRadius: "4px",
    h1Style: "solid",
    h2Style: "plain",
    h3Style: "plain",
    h4Style: "eyebrow",
    calloutStyleMode: "bar-rounded",
    codeTheme: "github-dark",
    showMacCodeHeader: true,
    showCodeLineNumbers: false,
    figureCaptionMode: "title-first"
  }
];
function getStyleProfileById(styleId) {
  return BUILTIN_STYLE_PROFILES.find((style3) => style3.id === styleId) ?? BUILTIN_STYLE_PROFILES[0];
}

