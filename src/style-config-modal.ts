import { Modal, Notice, Setting, TextComponent, SliderComponent, ColorComponent } from 'obsidian';
import type WeiXinMpPublisherPlugin from './main.ts';
import { getStyleProfileById } from '../packages/theme-pack/src/index.ts';
const FONT_PRESET_OPTIONS = [
  { value: "theme-default", label: "跟随当前主题" },
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
  { value: "rounded", label: "圆润" }
];
const H1_STYLE_OPTIONS = [
  { value: "underline", label: "居中下划线" },
  { value: "solid", label: "整块色带" },
  { value: "outline", label: "描边圆角框" }
];
const H2_STYLE_OPTIONS = [
  { value: "solid", label: "整块色带" },
  { value: "plain", label: "左侧竖线" },
  { value: "capsule", label: "胶囊标签" }
];
const H3_STYLE_OPTIONS = [
  { value: "bar", label: "左侧竖线" },
  { value: "capsule", label: "浅底胶囊" },
  { value: "plain", label: "纯文字强调" }
];
const H4_STYLE_OPTIONS = [
  { value: "accent", label: "浅底标签" },
  { value: "plain", label: "纯文字强调" },
  { value: "eyebrow", label: "细下划线" }
];
const CALLOUT_STYLE_OPTIONS = [
  { value: "card-soft", label: "柔和卡片（推荐）" },
  { value: "card-rounded", label: "包裹 + 圆角" },
  { value: "card-square", label: "包裹 + 方角" },
  { value: "bar-rounded", label: "不包裹 + 圆角" },
  { value: "bar-square", label: "不包裹 + 方角" }
];
const FIGURE_CAPTION_OPTIONS = [
  { value: "title-first", label: "title 优先" },
  { value: "alt-first", label: "alt 优先" },
  { value: "alt-only", label: "只显示 alt" },
  { value: "none", label: "不显示" }
];
function clamp(value2: number, min9: number, max10: number): number {
  return Math.min(max10, Math.max(min9, value2));
}
function countDecimals(step3: number): number {
  const value2 = String(step3);
  const dotIndex = value2.indexOf(".");
  return dotIndex === -1 ? 0 : value2.length - dotIndex - 1;
}
function formatNumber(value2: number, step3: number): string {
  const precision = countDecimals(step3);
  return precision === 0 ? String(Math.round(value2)) : value2.toFixed(precision).replace(/\.?0+$/, "");
}
function extractUnitValue(value2: string | undefined, fallback: number): number {
  if (!value2) {
    return fallback;
  }
  const match2 = value2.trim().match(/-?\d+(\.\d+)?/);
  return match2 ? Number(match2[0]) : fallback;
}
function extractPairValue(value2: string | undefined, fallback: [number, number]): [number, number] {
  if (!value2) {
    return fallback;
  }
  const matches33 = Array.from(value2.matchAll(/-?\d+(\.\d+)?/g), (match2) => Number(match2[0]));
  const first4 = Number.isFinite(matches33[0]) ? matches33[0] : fallback[0];
  const second2 = Number.isFinite(matches33[1]) ? matches33[1] : fallback[1];
  return [first4, second2];
}
function buildUnitValue(value2: number, step3: number, unit2: string): string {
  return `${formatNumber(value2, step3)}${unit2}`;
}
function buildPairValue(current: string, index2: number, nextValue: number, fallback: [number, number], unit2: string, step3: number): string {
  const pair = extractPairValue(current, fallback);
  pair[index2] = nextValue;
  return `${formatNumber(pair[0], step3)}${unit2} ${formatNumber(pair[1], step3)}${unit2}`;
}
function buildMixedPairValue(current: string, index2: number, nextValue: number, fallback: [number, number], units: [string, string], steps: [number, number]): string {
  const pair = extractPairValue(current, fallback);
  pair[index2] = nextValue;
  return `${formatNumber(pair[0], steps[0])}${units[0]} ${formatNumber(pair[1], steps[1])}${units[1]}`;
}
function addNumberField(options3: { container: HTMLElement; name: string; desc?: string; key?: string; min: number; max: number; step: number; unit?: string; onChange(value: number): void; afterChange?(): void; value: number }) {
  let sliderRef: SliderComponent | null = null;
  let inputRef: TextComponent | null = null;
  const setting = new Setting(options3.container).setName(options3.name).setDesc(options3.desc ?? "");
  setting.settingEl.addClass("weixin-mp-publisher-slider-setting");
  setting.controlEl.addClass("weixin-mp-publisher-slider-control");
  setting.addSlider((slider) => {
    sliderRef = slider;
    slider.setLimits(options3.min, options3.max, options3.step);
    slider.setDynamicTooltip();
    slider.setValue(clamp(options3.value, options3.min, options3.max));
    slider.onChange((value2) => {
      const normalized = clamp(value2, options3.min, options3.max);
      inputRef?.setValue(formatNumber(normalized, options3.step));
      options3.onChange(normalized);
      options3.afterChange?.();
    });
  }).addText((text6) => {
    inputRef = text6;
    text6.inputEl.type = "number";
    text6.inputEl.step = String(options3.step);
    text6.setValue(formatNumber(options3.value, options3.step));
    text6.onChange((rawValue) => {
      const parsed = Number(rawValue);
      if (!Number.isFinite(parsed)) {
        return;
      }
      const normalized = clamp(parsed, options3.min, options3.max);
      sliderRef?.setValue(normalized);
      if (rawValue !== formatNumber(normalized, options3.step)) {
        text6.setValue(formatNumber(normalized, options3.step));
      }
      options3.onChange(normalized);
      options3.afterChange?.();
    });
  });
}
export const StyleConfigModal = class extends Modal {
  plugin: WeiXinMpPublisherPlugin;
  constructor(plugin23: WeiXinMpPublisherPlugin) {
    super(plugin23.app);
    this.plugin = plugin23;
  }
  presetNameDraft = "";
  onOpen() {
    const { titleEl, contentEl } = this;
    titleEl.setText("高级微调");
    contentEl.empty();
    this.modalEl.addClass("weixin-mp-publisher-style-modal");
    this.buildSavedPresetsSection(contentEl);
    this.buildTypographySection(contentEl);
    this.buildHeadingSection(contentEl);
    this.buildQuoteAndMediaSection(contentEl);
    this.buildCodeSection(contentEl);
    this.buildTagSection(contentEl);
    new Setting(contentEl).setClass("weixin-mp-publisher-style-actions").addButton((button) => {
      button.setButtonText("恢复默认");
      button.onClick(async () => {
        this.plugin.settings.styleOverrides = {};
        await this.plugin.saveSettings();
        this.onOpen();
      });
    }).addButton((button) => {
      button.setButtonText("保存");
      button.setCta();
      button.onClick(async () => {
        await this.plugin.saveSettings();
        new Notice("高级微调已保存。");
        this.close();
      });
    });
  }
  onClose() {
    this.modalEl.removeClass("weixin-mp-publisher-style-modal");
    this.contentEl.empty();
  }
  buildSavedPresetsSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "我的方案",
      "最多保存 5 个带别名的格式方案，后面可以一键套用。"
    );
    new Setting(section).setName("方案别名").setDesc("保存的是当前排版模板 + 当前高级微调配置。").addText((text6) => {
      text6.setPlaceholder("例如：佛教长文 / 快讯版 / 课程封面版").setValue(this.presetNameDraft).onChange((value2) => {
        this.presetNameDraft = value2;
      });
    }).addButton((button) => {
      button.setButtonText("保存为方案").setCta().onClick(async () => {
        const result = await this.plugin.saveCurrentStylePreset(this.presetNameDraft);
        if (!result) {
          return;
        }
        this.presetNameDraft = "";
        new Notice(result === "updated" ? "已覆盖同名格式方案。" : "已保存格式方案。");
        this.onOpen();
      });
    });
    if (this.plugin.settings.savedStylePresets.length === 0) {
      section.createDiv({
        cls: "weixin-mp-publisher-style-empty",
        text: "还没有保存格式方案。先调好一套，再起个别名保存。"
      });
      return;
    }
    for (const preset of this.plugin.settings.savedStylePresets) {
      new Setting(section).setName(preset.name).setDesc(`排版模板：${getStyleProfileById(preset.baseStyleId).label}`).addButton((button) => {
        button.setButtonText("套用");
        button.onClick(async () => {
          await this.plugin.applySavedStylePreset(preset.id);
          new Notice(`已套用格式方案：${preset.name}`);
          this.onOpen();
        });
      }).addExtraButton((button) => {
        button.setIcon("trash");
        button.setTooltip("删除方案");
        button.onClick(async () => {
          await this.plugin.deleteSavedStylePreset(preset.id);
          new Notice(`已删除格式方案：${preset.name}`);
          this.onOpen();
        });
      });
    }
  }
  buildTypographySection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "字体与正文",
      "控制阅读节奏：字体、字号、间距和段落排版。"
    );
    const effective = this.getEffectiveStyle();
    const overrides = this.plugin.settings.styleOverrides;
    new Setting(section).setName("字体方案").setDesc("默认推荐无衬线，字号仍由下面单独控制。").addDropdown((dropdown) => {
      for (const option2 of FONT_PRESET_OPTIONS) {
        dropdown.addOption(option2.value, option2.label);
      }
      dropdown.setValue(effective.fontPreset ?? "theme-default").onChange((value2) => {
        overrides.fontPreset = value2;
        this.refreshPreview();
      });
    });
    addNumberField({
      container: section,
      name: "字号",
      min: 14,
      max: 22,
      step: 0.5,
      value: extractUnitValue(effective.fontSize, 16),
      onChange: (value2) => {
        overrides.fontSize = buildUnitValue(value2, 0.5, "px");
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "行高",
      min: 1.4,
      max: 2.4,
      step: 0.05,
      value: effective.lineHeight,
      onChange: (value2) => {
        overrides.lineHeight = value2;
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "字间距",
      min: -0.02,
      max: 0.12,
      step: 5e-3,
      value: extractUnitValue(effective.letterSpacing, 0.035),
      onChange: (value2) => {
        overrides.letterSpacing = buildUnitValue(value2, 5e-3, "em");
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "段落上下间距",
      min: 0.6,
      max: 2.2,
      step: 0.05,
      value: extractPairValue(effective.paragraphMargin, [1.2, 8])[0],
      onChange: (value2) => {
        overrides.paragraphMargin = buildMixedPairValue(
          overrides.paragraphMargin ?? effective.paragraphMargin,
          0,
          value2,
          [1.2, 8],
          ["em", "px"],
          [0.05, 1]
        );
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "两端缩进",
      desc: "对应微信编辑器里的两端缩进，单位为 px。",
      min: 0,
      max: 48,
      step: 1,
      value: extractUnitValue(effective.contentSideIndent as string | undefined, 0),
      onChange: (value2) => {
        overrides.contentSideIndent = buildUnitValue(value2, 1, "px");
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "标题上间距",
      min: 1.2,
      max: 3.6,
      step: 0.05,
      value: extractUnitValue(effective.headingTopMargin, 2.2),
      onChange: (value2) => {
        overrides.headingTopMargin = buildUnitValue(value2, 0.05, "em");
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "标题下间距",
      min: 0.4,
      max: 1.8,
      step: 0.05,
      value: extractUnitValue(effective.headingBottomMargin, 1),
      onChange: (value2) => {
        overrides.headingBottomMargin = buildUnitValue(value2, 0.05, "em");
      },
      afterChange: () => this.refreshPreview()
    });
    new Setting(section).setName("段落两端对齐").setDesc("适合长文，短句和清单内容通常建议关闭。").addToggle((toggle) => {
      toggle.setValue(effective.textAlign === "justify");
      toggle.onChange((value2) => {
        overrides.textAlign = value2 ? "justify" : "left";
        this.refreshPreview();
      });
    });
    new Setting(section).setName("段落首行缩进").setDesc("更像杂志或专栏排版。").addToggle((toggle) => {
      toggle.setValue(Boolean(effective.paragraphIndent));
      toggle.onChange((value2) => {
        overrides.paragraphIndent = value2;
        this.refreshPreview();
      });
    });
  }
  buildHeadingSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "标题结构",
      "H1-H4 单独控制，H5 和 H6 跟随 H4。"
    );
    const effective = this.getEffectiveStyle();
    const overrides = this.plugin.settings.styleOverrides;
    this.addDropdownSetting(section, "一级标题", effective.h1Style ?? "underline", H1_STYLE_OPTIONS, (value2) => {
      overrides.h1Style = value2;
    });
    this.addDropdownSetting(section, "二级标题", effective.h2Style ?? "solid", H2_STYLE_OPTIONS, (value2) => {
      overrides.h2Style = value2;
    });
    this.addDropdownSetting(section, "三级标题", effective.h3Style ?? "bar", H3_STYLE_OPTIONS, (value2) => {
      overrides.h3Style = value2;
    });
    this.addDropdownSetting(section, "四级标题", effective.h4Style ?? "accent", H4_STYLE_OPTIONS, (value2) => {
      overrides.h4Style = value2;
    });
  }
  buildQuoteAndMediaSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "引用与图片",
      "这里控制 callout / 引用块的包裹感，以及图片圆角和图注。"
    );
    const effective = this.getEffectiveStyle();
    const overrides = this.plugin.settings.styleOverrides;
    this.addDropdownSetting(
      section,
      "引用块样式",
      effective.calloutStyleMode ?? "card-rounded",
      CALLOUT_STYLE_OPTIONS,
      (value2) => {
        overrides.calloutStyleMode = value2;
      }
    );
    addNumberField({
      container: section,
      name: "引用上下内边距",
      min: 0.4,
      max: 1.8,
      step: 0.05,
      value: extractPairValue(effective.blockquotePadding, [1, 1.1])[0],
      onChange: (value2) => {
        overrides.blockquotePadding = buildPairValue(
          overrides.blockquotePadding ?? effective.blockquotePadding,
          0,
          value2,
          [1, 1.1],
          "em",
          0.05
        );
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "引用左右内边距",
      min: 0.6,
      max: 2.4,
      step: 0.05,
      value: extractPairValue(effective.blockquotePadding, [1, 1.1])[1],
      onChange: (value2) => {
        overrides.blockquotePadding = buildPairValue(
          overrides.blockquotePadding ?? effective.blockquotePadding,
          1,
          value2,
          [1, 1.1],
          "em",
          0.05
        );
      },
      afterChange: () => this.refreshPreview()
    });
    addNumberField({
      container: section,
      name: "图片圆角",
      min: 0,
      max: 24,
      step: 1,
      value: extractUnitValue(effective.imageBorderRadius, 8),
      onChange: (value2) => {
        overrides.imageBorderRadius = buildUnitValue(value2, 1, "px");
      },
      afterChange: () => this.refreshPreview()
    });
    this.addDropdownSetting(
      section,
      "图片标题样式",
      effective.figureCaptionMode ?? "title-first",
      FIGURE_CAPTION_OPTIONS,
      (value2) => {
        overrides.figureCaptionMode = value2;
      }
    );
    let textRef: TextComponent | null = null;
    let colorRef: ColorComponent | null = null;
    new Setting(section).setName("自定义主色").setDesc("留空时沿用当前主题主色。").addColorPicker((picker) => {
      colorRef = picker;
      picker.setValue((effective.customPrimaryColor as string) ?? "#0f4c81");
      picker.onChange((value2) => {
        overrides.customPrimaryColor = value2;
        textRef?.setValue(value2);
        this.refreshPreview();
      });
    }).addText((text6) => {
      textRef = text6;
      text6.setPlaceholder("#0F4C81").setValue((effective.customPrimaryColor as string) ?? "");
      text6.onChange((value2) => {
        const next4 = value2.trim();
        overrides.customPrimaryColor = next4 || void 0;
        if (next4) {
          colorRef?.setValue(next4);
        }
        this.refreshPreview();
      });
    });
    let pageTextRef: TextComponent | null = null;
    let pageColorRef: ColorComponent | null = null;
    new Setting(section).setName("纸张颜色").setDesc("控制正文承载区域的底色，也就是文字下面那层页面颜色。").addColorPicker((picker) => {
      pageColorRef = picker;
      picker.setValue((effective.customPageBackgroundColor as string) ?? "#ffffff");
      picker.onChange((value2) => {
        overrides.customPageBackgroundColor = value2;
        pageTextRef?.setValue(value2);
        this.refreshPreview();
      });
    }).addText((text6) => {
      pageTextRef = text6;
      text6.setPlaceholder("#FFFFFF").setValue((effective.customPageBackgroundColor as string) ?? "");
      text6.onChange((value2) => {
        const next4 = value2.trim();
        overrides.customPageBackgroundColor = next4 || void 0;
        if (next4) {
          pageColorRef?.setValue(next4);
        }
        this.refreshPreview();
      });
    });
  }
  buildCodeSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "代码块",
      "代码块主题和结构独立控制，避免跟正文排版绑死。"
    );
    const effective = this.getEffectiveStyle();
    const overrides = this.plugin.settings.styleOverrides;
    new Setting(section).setName("代码块主题").addDropdown((dropdown) => {
      dropdown.addOption("github-dark", "github-dark").addOption("github", "github").setValue(effective.codeTheme ?? "github-dark").onChange((value2) => {
        overrides.codeTheme = value2;
        this.refreshPreview();
      });
    });
    new Setting(section).setName("Mac 代码块头").addToggle((toggle) => {
      toggle.setValue(effective.showMacCodeHeader ?? true);
      toggle.onChange((value2) => {
        overrides.showMacCodeHeader = value2;
        this.refreshPreview();
      });
    });
    new Setting(section).setName("代码块行号").addToggle((toggle) => {
      toggle.setValue(Boolean(effective.showCodeLineNumbers));
      toggle.onChange((value2) => {
        overrides.showCodeLineNumbers = value2;
        this.refreshPreview();
      });
    });
  }
  buildTagSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "标签样式",
      "控制正文中 #标签 的渲染方式。"
    );
    const effective = this.getEffectiveStyle();
    const overrides = this.plugin.settings.styleOverrides;
    this.addDropdownSetting(
      section,
      "标签外观",
      (effective.tagStyle as string) ?? "pill",
      [
        { value: "pill", label: "胶囊（带背景色）" },
        { value: "plain", label: "纯文字（仅主色）" }
      ],
      (value2) => {
        overrides.tagStyle = value2;
      }
    );
  }
  createSection(container2: HTMLElement, title2: string, desc: string): HTMLElement {
    const section: HTMLElement = container2.createDiv({ cls: "weixin-mp-publisher-style-section" });
    section.createEl("h3", { text: title2, cls: "weixin-mp-publisher-style-section-title" });
    section.createEl("p", { text: desc, cls: "weixin-mp-publisher-style-section-desc" });
    return section;
  }
  addDropdownSetting(container2: HTMLElement, name: string, value2: string, options3: Array<{ value: string; label: string }>, onChange: (value: string) => void) {
    new Setting(container2).setName(name).addDropdown((dropdown) => {
      for (const option2 of options3) {
        dropdown.addOption(option2.value, option2.label);
      }
      dropdown.setValue(value2).onChange((nextValue: string) => {
        onChange(nextValue);
        this.refreshPreview();
      });
    });
  }
  refreshPreview() {
    void this.plugin.refreshPreviewLeaves();
  }
  getEffectiveStyle() {
    return {
      ...getStyleProfileById(this.plugin.settings.defaultStyleId),
      ...this.plugin.settings.styleOverrides
    };
  }
};

