import { Modal, Notice, Setting } from 'obsidian';
import type WeiXinMpPublisherPlugin from './main.ts';
import { getStyleProfileById } from '../packages/theme-pack/src/index.ts';
function runAsync2(action: () => Promise<void>) {
  void action().catch((error3) => {
    console.error(error3);
    new Notice(`操作失败：${error3 instanceof Error ? error3.message : "未知错误"}`, 1e4);
  });
}
export const FormatModal = class extends Modal {
  plugin: WeiXinMpPublisherPlugin;
  constructor(plugin23: WeiXinMpPublisherPlugin) {
    super(plugin23.app);
    this.plugin = plugin23;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("格式");
    contentEl.empty();
    this.modalEl.addClass("weixin-mp-publisher-style-modal");
    this.buildThemeSection(contentEl);
    this.buildLayoutSection(contentEl);
    this.buildSavedSchemesSection(contentEl);
    this.buildAdvancedSection(contentEl);
  }
  onClose() {
    this.modalEl.removeClass("weixin-mp-publisher-style-modal");
    this.contentEl.empty();
  }
  buildThemeSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "主题风格",
      "控制整体视觉气质，比如主色、标题外观、引用块和页面氛围。"
    );
    new Setting(section).setName("当前主题风格").setDesc("适合先选气质，再决定排版。").addDropdown((dropdown) => {
      for (const theme of this.plugin.getAvailableThemes()) {
        dropdown.addOption(theme.id, `${theme.label} \xB7 ${theme.description}`);
      }
      dropdown.setValue(this.plugin.resolveAccessibleThemeId(this.plugin.settings.defaultThemeId));
      dropdown.onChange((value2) => {
        runAsync2(async () => {
          await this.plugin.updateDefaultTheme(value2);
          this.onOpen();
        });
      });
    });
  }
  buildLayoutSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "排版模板",
      "控制字号、行高、留白和阅读节奏，不直接改变主题颜色。"
    );
    new Setting(section).setName("当前排版模板").setDesc("适合文章、快讯、专栏等不同阅读场景。").addDropdown((dropdown) => {
      for (const styleProfile of this.plugin.styleProfiles) {
        dropdown.addOption(styleProfile.id, `${styleProfile.label} \xB7 ${styleProfile.description}`);
      }
      dropdown.setValue(this.plugin.settings.defaultStyleId);
      dropdown.onChange((value2) => {
        runAsync2(async () => {
          await this.plugin.updateDefaultStyle(value2);
          this.onOpen();
        });
      });
    });
  }
  buildSavedSchemesSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "我的方案",
      "你保存过的整套格式搭配，可以一键套用。"
    );
    if (this.plugin.settings.savedStylePresets.length === 0) {
      section.createDiv({
        cls: "weixin-mp-publisher-style-empty",
        text: "还没有保存过格式方案。先去高级微调里调一套，再保存成自己的方案。"
      });
    } else {
      for (const preset of this.plugin.settings.savedStylePresets) {
        new Setting(section).setName(preset.name).setDesc(`排版模板：${getStyleProfileById(preset.baseStyleId).label}`).addButton((button) => {
          button.setButtonText("套用");
          button.onClick(() => {
            runAsync2(async () => {
              await this.plugin.applySavedStylePreset(preset.id);
              new Notice(`已套用格式方案：${preset.name}`);
              this.onOpen();
            });
          });
        });
      }
    }
    new Setting(section).setName("方案管理").setDesc("保存当前搭配、覆盖同名方案或删除旧方案。").addButton((button) => {
      button.setButtonText("管理我的方案");
      button.onClick(() => {
        this.close();
        this.plugin.openStyleConfigModal();
      });
    });
  }
  buildAdvancedSection(container2: HTMLElement) {
    const section: HTMLElement = this.createSection(
      container2,
      "高级微调",
      "细调字体、标题样式、引用块、代码块、图注和纸张颜色等参数。"
    );
    new Setting(section).setName("打开高级微调").setDesc("适合需要做品牌化风格或保存新格式方案时使用。").addButton((button) => {
      button.setButtonText("进入高级微调");
      button.setCta();
      button.onClick(() => {
        this.close();
        this.plugin.openStyleConfigModal();
      });
    });
  }
  createSection(container2: HTMLElement, title2: string, description: string): HTMLElement {
    const section: HTMLElement = container2.createDiv({ cls: "weixin-mp-publisher-style-section" });
    section.createEl("h3", {
      cls: "weixin-mp-publisher-style-section-title",
      text: title2
    });
    section.createEl("p", {
      cls: "weixin-mp-publisher-style-section-desc",
      text: description
    });
    return section;
  }
};

