import { App, PluginSettingTab, Notice, Setting, TextComponent, ExtraButtonComponent } from 'obsidian';
import type WeiXinMpPublisherPlugin from './main.ts';
import { createEmptyAccount } from './types.ts';
function runAsync3(action: () => Promise<void>) {
  void action().catch((error3) => {
    console.error(error3);
    new Notice(`操作失败：${error3 instanceof Error ? error3.message : "未知错误"}`, 1e4);
  });
}
function addSecretTextField2(setting: Setting, value2: string, onChange: (value: string) => void) {
  let visible = false;
  let textComponent: TextComponent | null = null;
  const updateVisibility = (button?: ExtraButtonComponent) => {
    if (textComponent !== null) {
      textComponent.inputEl.type = visible ? "text" : "password";
    }
    button?.setIcon(visible ? "eye-off" : "eye");
    button?.setTooltip(visible ? "隐藏 AppSecret" : "显示 AppSecret");
  };
  setting.addText((text6) => {
    textComponent = text6;
    text6.setPlaceholder("请输入 AppSecret").setValue(value2).onChange((nextValue) => {
      onChange(nextValue.trim());
    });
    updateVisibility();
  });
  setting.addExtraButton((button) => {
    updateVisibility(button);
    button.onClick(() => {
      visible = !visible;
      updateVisibility(button);
    });
  });
}
export const WeiXinMpPublisherSettingTab = class extends PluginSettingTab {
  plugin: WeiXinMpPublisherPlugin;
  constructor(app: App, plugin23: WeiXinMpPublisherPlugin) {
    super(app, plugin23);
    this.plugin = plugin23;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "WeiXin MP Publisher 设置" });
    new Setting(containerEl).setName("默认主题").setDesc("用于预览和复制 HTML 的默认主题。").addDropdown((dropdown) => {
      for (const theme of this.plugin.getAvailableThemes()) {
        dropdown.addOption(theme.id, `${theme.label} \xB7 ${theme.description}`);
      }
      dropdown.setValue(this.plugin.resolveAccessibleThemeId(this.plugin.settings.defaultThemeId));
      dropdown.onChange((value2) => {
        runAsync3(async () => {
          await this.plugin.updateDefaultTheme(value2);
        });
      });
    });
    new Setting(containerEl).setName("默认排版模板").setDesc("控制字号、留白和阅读节奏，独立于主题风格。").addDropdown((dropdown) => {
      for (const styleProfile of this.plugin.styleProfiles) {
        dropdown.addOption(styleProfile.id, `${styleProfile.label} \xB7 ${styleProfile.description}`);
      }
      dropdown.setValue(this.plugin.settings.defaultStyleId);
      dropdown.onChange((value2) => {
        runAsync3(async () => {
          await this.plugin.updateDefaultStyle(value2);
        });
      });
    });
    containerEl.createEl("h3", { text: "公众号账号" });
    if (this.plugin.settings.accounts.length === 0) {
      containerEl.createDiv({
        cls: "weixin-mp-publisher-settings-note",
        text: "还没有配置公众号账号。配置后即可用于发布草稿。"
      });
    }
    this.plugin.settings.accounts.forEach((account) => {
      const cardEl = containerEl.createDiv({
        cls: "weixin-mp-publisher-account-card"
      });
      new Setting(cardEl).setName("账号名称").setDesc("例如：主号 / 备用号").addText((text6) => {
        text6.setPlaceholder("我的公众号").setValue(account.name).onChange((value2) => {
          runAsync3(async () => {
            account.name = value2.trim() || "未命名账号";
            await this.plugin.saveSettings();
          });
        });
      }).addExtraButton((button) => {
        button.setIcon("trash");
        button.setTooltip("删除账号");
        button.onClick(() => {
          runAsync3(async () => {
            await this.plugin.clearAccountDefaultCover(account.id);
            this.plugin.settings.accounts = this.plugin.settings.accounts.filter(
              (item) => item.id !== account.id
            );
            if (this.plugin.settings.preferredAccountId === account.id) {
              this.plugin.settings.preferredAccountId = null;
            }
            await this.plugin.saveSettings();
            this.display();
          });
        });
      });
      new Setting(cardEl).setName("AppID").addText((text6) => {
        text6.setPlaceholder("wx1234567890").setValue(account.appId).onChange((value2) => {
          runAsync3(async () => {
            account.appId = value2.trim();
            await this.plugin.saveSettings();
          });
        });
      });
      const appSecretSetting = new Setting(cardEl).setName("AppSecret").setDesc("微信公众号的 AppSecret，仅保存在本地。");
      addSecretTextField2(appSecretSetting, account.appSecret, (value2) => {
        account.appSecret = value2;
        void this.plugin.saveSettings();
      });
      const apiKeyDesc = new DocumentFragment();
      apiKeyDesc.append("使用中转服务 API Key，享受稳定IP地址和发布服务，中转服务加密保存 AppID，绝不保存 AppSecret。");
      const helpLink = document.createElement("a");
      helpLink.href = "https://www.skyue.com/weixin-mp-publisher.html";
      helpLink.textContent = "联系帮助";
      apiKeyDesc.appendChild(helpLink);
      const apiKeySetting = new Setting(cardEl).setName("API Key").setDesc(apiKeyDesc);
      addSecretTextField2(apiKeySetting, account.apiKey ?? "", (value2) => {
        account.apiKey = value2;
        void this.plugin.saveSettings();
      });
      apiKeySetting.addButton((button) => {
        button.setButtonText("激活");
        button.onClick(() => {
          runAsync3(async () => {
            const result = await this.plugin.bindApiKey(account);
            if (result.success) {
              apiKeySetting.setDesc("API Key 已激活，已绑定当前 AppID");
              new Notice("API Key 激活成功");
            } else {
              apiKeySetting.setDesc(result.error ?? "激活失败");
              new Notice(result.error ?? "激活失败");
            }
          });
        });
      });
      const publicIpStatus = this.plugin.getPublicIpStatus();
      new Setting(cardEl).setName("IP 白名单辅助").setDesc(this.plugin.getPublicIpStatusText()).addButton((button) => {
        button.setButtonText("检测微信出口 IP");
        button.onClick(() => {
          runAsync3(async () => {
            try {
              const ip = await this.plugin.detectPublicIp(account);
              new Notice(`已检测到公网 IP：${ip}`);
            } catch (error3) {
              new Notice(`检测公网 IP 失败：${error3 instanceof Error ? error3.message : "未知错误"}`, 1e4);
            }
            this.display();
          });
        });
      }).addButton((button) => {
        button.setButtonText("复制");
        button.setDisabled(!publicIpStatus.value);
        button.onClick(() => {
          runAsync3(async () => {
            if (!publicIpStatus.value) {
              return;
            }
            try {
              await this.plugin.copyTextToClipboard(
                publicIpStatus.value,
                `已复制公网 IP：${publicIpStatus.value}`
              );
            } catch (error3) {
              new Notice(`复制失败：${error3 instanceof Error ? error3.message : "未知错误"}`);
            }
          });
        });
      }).addButton((button) => {
        button.setButtonText("IP 设置");
        button.onClick(() => {
          this.plugin.openWechatDeveloperPlatform();
        });
      });
      new Setting(cardEl).setName("默认作者").setDesc("可选。右侧发布资料没有作者时，会先用这里自动填充。").addText((text6) => {
        text6.setPlaceholder("例如：拾月 / SKYue").setValue(account.defaultAuthor ?? "").onChange((value2) => {
          runAsync3(async () => {
            account.defaultAuthor = value2.trim();
            await this.plugin.saveSettings();
          });
        });
      });
      new Setting(cardEl).setName("默认封面").setDesc(
        account.defaultCoverPath ? `已设置：${account.defaultCoverPath}` : "可选。没有单独封面时，会优先使用这个账号的默认封面。"
      ).addButton((button) => {
        button.setButtonText(account.defaultCoverPath ? "重新选择默认封面" : "选择默认封面");
        button.onClick(() => {
          runAsync3(async () => {
            await this.plugin.pickAccountDefaultCover(account.id);
            this.display();
          });
        });
      }).addButton((button) => {
        button.setButtonText("清空默认封面");
        button.setDisabled(!account.defaultCoverPath);
        button.onClick(() => {
          runAsync3(async () => {
            await this.plugin.clearAccountDefaultCover(account.id);
            new Notice("已清空账号默认封面。");
            this.display();
          });
        });
      });
      new Setting(cardEl).setName("设为默认账号").setDesc("后续发布草稿时优先使用这个账号。").addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.preferredAccountId === account.id);
        toggle.onChange((value2) => {
          runAsync3(async () => {
            this.plugin.settings.preferredAccountId = value2 ? account.id : null;
            await this.plugin.saveSettings();
            this.display();
          });
        });
      });
    });
    new Setting(containerEl).addButton((button) => {
      button.setButtonText("新增账号");
      button.setCta();
      button.onClick(() => {
        runAsync3(async () => {
          if (this.plugin.settings.accounts.length > 0 && !await this.plugin.ensureFeatureAccess("multi-account", "多账号配置")) {
            return;
          }
          this.plugin.settings.accounts.push(createEmptyAccount());
          await this.plugin.saveSettings();
          this.display();
          new Notice("已新增一个本地公众号账号配置。");
        });
      });
    });
  }
};

