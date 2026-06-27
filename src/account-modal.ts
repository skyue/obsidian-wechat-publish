var import_obsidian = require("obsidian");


function runAsync(action) {
  void action().catch((error3) => {
    console.error(error3);
    new import_obsidian.Notice(`操作失败：${error3 instanceof Error ? error3.message : "未知错误"}`, 1e4);
  });
}
function addSecretTextField(setting, value2, onChange) {
  let visible = false;
  let textComponent = null;
  const updateVisibility = (button) => {
    if (textComponent) {
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
var AccountConfigModal = class extends import_obsidian.Modal {
  constructor(plugin23) {
    super(plugin23.app);
    this.plugin = plugin23;
  }
  selectedIndex = 0;
  showPasteImport = false;
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("公众号账号配置");
    contentEl.empty();
    contentEl.createEl("p", {
      text: "账号信息只保存在本地插件配置，用于直接调用微信草稿接口。个人使用完全免费。"
    });
    new import_obsidian.Setting(contentEl).addButton((button) => {
      button.setButtonText("手动新增账号");
      button.onClick(() => {
        const newAccount = createEmptyAccount();
        this.plugin.settings.accounts.push(newAccount);
        this.selectedIndex = this.plugin.settings.accounts.length - 1;
        this.showPasteImport = false;
        this.onOpen();
      });
    }).addButton((button) => {
      button.setButtonText("快速粘贴新建账号");
      button.onClick(() => {
        this.showPasteImport = !this.showPasteImport;
        this.onOpen();
      });
    });
    if (this.showPasteImport) {
      const importEl = contentEl.createDiv({ cls: "wechat-mp-publisher-paste-import" });
      importEl.createEl("p", {
        cls: "wechat-mp-publisher-paste-import__hint",
        text: "将微信公众号后台「基础信息」页的内容全选复制后粘贴到下方，自动识别账号名、AppID 和 AppSecret："
      });
      const textarea = importEl.createEl("textarea", {
        cls: "wechat-mp-publisher-paste-import__textarea",
        attr: { placeholder: "公众号\n你的公众号名称\nAppID\nwx...\nAppSecret\n..." }
      });
      const resultEl = importEl.createEl("div", { cls: "wechat-mp-publisher-paste-import__result" });
      new import_obsidian.Setting(importEl).addButton((button) => {
        button.setButtonText("识别并新增账号");
        button.setCta();
        button.onClick(() => {
          const text6 = textarea.value;
          const lines = text6.split(/\r?\n/).map((l4) => l4.trim()).filter((l4) => l4);
          const gzhIdx = lines.findIndex((l4) => l4 === "公众号");
          const appidIdx = lines.findIndex((l4) => l4 === "AppID");
          const secretIdx = lines.findIndex((l4) => l4 === "AppSecret");
          const name = gzhIdx >= 0 ? lines[gzhIdx + 1] : null;
          const appId = appidIdx >= 0 ? lines[appidIdx + 1] : null;
          const appSecret = secretIdx >= 0 ? lines[secretIdx + 1] : null;
          const isValidAppId = appId && /^wx[a-zA-Z0-9]+$/.test(appId);
          const isValidSecret = appSecret && /^[a-zA-Z0-9]+$/.test(appSecret);
          if (!name || !isValidAppId || !isValidSecret) {
            resultEl.textContent = "❌ 未能识别格式，请确认已复制微信公众号平台「基础信息」页的完整内容（包含「公众号」「AppID」「AppSecret」字样）。";
            resultEl.className = "wechat-mp-publisher-paste-import__result wechat-mp-publisher-paste-import__result--error";
            return;
          }
          const newAccount = createEmptyAccount();
          newAccount.name = name.trim();
          newAccount.appId = appId.trim();
          newAccount.appSecret = appSecret.trim();
          this.plugin.settings.accounts.push(newAccount);
          this.selectedIndex = this.plugin.settings.accounts.length - 1;
          this.showPasteImport = false;
          this.onOpen();
        });
      }).addButton((button) => {
        button.setButtonText("取消");
        button.onClick(() => {
          this.showPasteImport = false;
          this.onOpen();
        });
      });
    }
    const accounts = this.plugin.settings.accounts;
    if (accounts.length === 0) {
      contentEl.createEl("p", { text: "当前还没有账号，先新增一个再保存。" });
    } else {
      if (this.selectedIndex >= accounts.length) {
        this.selectedIndex = accounts.length - 1;
      }
      const tabRowEl = contentEl.createDiv({ cls: "wechat-mp-publisher-account-tabs" });
      accounts.forEach((account2, idx) => {
        const isSelected = idx === this.selectedIndex;
        const tabEl = tabRowEl.createDiv({
          cls: "wechat-mp-publisher-account-tab" + (isSelected ? " wechat-mp-publisher-account-tab--selected" : "")
        });
        tabEl.createEl("span", {
          cls: "wechat-mp-publisher-account-tab__name",
          text: account2.name || "未命名账号"
        });
        tabEl.addEventListener("click", () => {
          this.selectedIndex = idx;
          this.onOpen();
        });
      });
      const account = accounts[this.selectedIndex];
      const cardEl = contentEl.createDiv({ cls: "wechat-mp-publisher-account-card" });
      new import_obsidian.Setting(cardEl).setName("账号名称").setDesc("例如：主号 / 备用号").addText((text6) => {
        text6.setValue(account.name).onChange((value2) => {
          account.name = value2.trim() || "未命名账号";
          const tabNameEl = tabRowEl.querySelectorAll(".wechat-mp-publisher-account-tab__name")[this.selectedIndex];
          if (tabNameEl) tabNameEl.textContent = account.name;
        });
      }).addExtraButton((button) => {
        button.setIcon("trash");
        button.setTooltip("删除账号");
        button.onClick(() => {
          runAsync(async () => {
            const confirmed = window.confirm(
              `确定要删除账号「${account.name || "未命名账号"}」吗？`
            );
            if (!confirmed) return;
            await this.plugin.clearAccountDefaultCover(account.id);
            this.plugin.settings.accounts = this.plugin.settings.accounts.filter(
              (item) => item.id !== account.id
            );
            if (this.plugin.settings.preferredAccountId === account.id) {
              this.plugin.settings.preferredAccountId = null;
            }
            if (this.selectedIndex > 0) this.selectedIndex--;
            await this.plugin.saveSettings();
            this.onOpen();
          });
        });
      });
      new import_obsidian.Setting(cardEl).setName("AppID").addText((text6) => {
        text6.setPlaceholder("wx1234567890").setValue(account.appId).onChange((value2) => {
          account.appId = value2.trim();
        });
      });
      const appSecretSetting = new import_obsidian.Setting(cardEl).setName("AppSecret");
      addSecretTextField(appSecretSetting, account.appSecret, (value2) => {
        account.appSecret = value2;
      });
      const publicIpStatus = this.plugin.getPublicIpStatus();
      new import_obsidian.Setting(cardEl).setName("IP 白名单辅助").setDesc(this.plugin.getPublicIpStatusText()).addButton((button) => {
        button.setButtonText("检测微信出口 IP");
        button.onClick(() => {
          runAsync(async () => {
            try {
              const ip = await this.plugin.detectPublicIp(account);
              new import_obsidian.Notice(`已检测到公网 IP：${ip}`);
            } catch (error3) {
              new import_obsidian.Notice(`检测公网 IP 失败：${error3 instanceof Error ? error3.message : "未知错误"}`, 1e4);
            }
            this.onOpen();
          });
        });
      }).addButton((button) => {
        button.setButtonText("复制");
        button.setDisabled(!publicIpStatus.value);
        button.onClick(() => {
          runAsync(async () => {
            if (!publicIpStatus.value) return;
            try {
              await this.plugin.copyTextToClipboard(
                publicIpStatus.value,
                `已复制公网 IP：${publicIpStatus.value}`
              );
            } catch (error3) {
              new import_obsidian.Notice(`复制失败：${error3 instanceof Error ? error3.message : "未知错误"}`);
            }
          });
        });
      }).addButton((button) => {
        button.setButtonText("IP 设置");
        button.onClick(() => {
          this.plugin.openWechatDeveloperPlatform();
        });
      });
      new import_obsidian.Setting(cardEl).setName("默认作者").setDesc("可选。右侧发布资料里没有作者时，自动先填这个名字。").addText((text6) => {
        text6.setPlaceholder("例如：冉策 / HelloRanceLee").setValue(account.defaultAuthor ?? "").onChange((value2) => {
          account.defaultAuthor = value2.trim();
        });
      });
      new import_obsidian.Setting(cardEl).setName("默认封面").setDesc(
        account.defaultCoverPath ? `已设置：${account.defaultCoverPath}` : "可选。未手动选择封面时，可用作该账号的默认封面。"
      ).addButton((button) => {
        button.setButtonText(account.defaultCoverPath ? "重新选择默认封面" : "选择默认封面");
        button.onClick(() => {
          runAsync(async () => {
            await this.plugin.pickAccountDefaultCover(account.id);
            this.onOpen();
          });
        });
      }).addButton((button) => {
        button.setButtonText("清空默认封面");
        button.setDisabled(!account.defaultCoverPath);
        button.onClick(() => {
          runAsync(async () => {
            await this.plugin.clearAccountDefaultCover(account.id);
            new import_obsidian.Notice("已清空账号默认封面。");
            this.onOpen();
          });
        });
      });
      new import_obsidian.Setting(cardEl).setName("设为默认账号").addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.preferredAccountId === account.id);
        toggle.onChange((value2) => {
          this.plugin.settings.preferredAccountId = value2 ? account.id : null;
        });
      });
    }
    new import_obsidian.Setting(contentEl).addButton((button) => {
      button.setButtonText("保存");
      button.setCta();
      button.onClick(() => {
        runAsync(async () => {
          await this.plugin.saveSettings();
          new import_obsidian.Notice("公众号账号已保存。");
          this.close();
        });
      });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

