var PublishModal = class extends import_obsidian10.Modal {
  constructor(plugin2, fileName) {
    super(plugin2.app);
    this.plugin = plugin2;
    this.fileName = fileName;
  }
  onOpen() {
    this.modalEl.addClass("wechat-publish-publish-modal");
    this.titleEl.setText(`发布《${this.fileName}》`);
    this.progressEl = this.contentEl.createDiv({ cls: "wechat-publish-publish-progress" });
    this.progressEl.setText("正在准备……");
  }
  onClose() {
    this.contentEl.empty();
    this.modalEl.removeClass("wechat-publish-publish-modal");
  }
  setProgress(message) {
    if (this.progressEl) {
      this.progressEl.setText(message);
    }
  }
  showSuccess(message) {
    this.titleEl.setText("发布成功");
    this.contentEl.empty();
    this.contentEl.createDiv({ cls: "wechat-publish-publish-result", text: message });
    var buttonContainer = this.contentEl.createDiv({ cls: "wechat-publish-publish-buttons" });
    new import_obsidian10.Setting(buttonContainer).addButton((btn) => {
      btn.setButtonText("打开公众号后台").setCta().onClick(() => {
        this.plugin.openWechatPlatform();
        this.close();
      });
    }).addButton((btn) => {
      btn.setButtonText("关闭").onClick(() => this.close());
    });
  }
  showFailure(message) {
    this.titleEl.setText("发布失败");
    this.contentEl.empty();
    this.contentEl.createDiv({ cls: "wechat-publish-publish-result wechat-publish-publish-failure", text: message });
    var buttonContainer = this.contentEl.createDiv({ cls: "wechat-publish-publish-buttons" });
    new import_obsidian10.Setting(buttonContainer).addButton((btn) => {
      btn.setButtonText("关闭").setCta().onClick(() => this.close());
    });
  }
};
var WeChatMpPublisherPlugin = class extends import_obsidian10.Plugin {
  settings = DEFAULT_SETTINGS;
  themes = BUILTIN_THEMES;
  styleProfiles = BUILTIN_STYLE_PROFILES;
  lastMarkdownFilePath = null;
  publishMetaDrafts = /* @__PURE__ */ new Map();
  isPublishing = false;
  publicIpStatus = {
    value: null,
    sourceLabel: null,
    checkedAt: null,
    error: null
  };
  async onload() {
    await this.loadSettings();
    const resolvedThemeId = this.resolveAccessibleThemeId(this.settings.defaultThemeId);
    if (resolvedThemeId !== this.settings.defaultThemeId) {
      this.settings.defaultThemeId = resolvedThemeId;
      await this.saveSettings({ refreshPreview: false });
    }
    this.captureMarkdownContext();
    this.registerView(
      PREVIEW_VIEW_TYPE,
      (leaf) => new WeChatMpPublisherPreviewView(leaf, this)
    );
    this.addRibbonIcon("newspaper", "打开微信公众号预览", () => {
      void this.activatePreview();
    });
    this.addCommand({
      id: "open-wechat-preview",
      name: "打开微信公众号预览",
      callback: () => {
        void this.activatePreview();
      }
    });
    this.addCommand({
      id: "copy-current-note-html",
      name: "复制当前笔记的微信 HTML",
      checkCallback: (checking) => {
        const file = this.getActiveMarkdownFile();
        if (!file) {
          return false;
        }
        if (!checking) {
          void this.copyActiveNoteHtml();
        }
        return true;
      }
    });
    this.addCommand({
      id: "publish-current-note-draft",
      name: "发布到公众号草稿箱",
      checkCallback: (checking) => {
        const file = this.getActiveMarkdownFile();
        if (!file) {
          return false;
        }
        if (!checking) {
          void this.publishActiveNoteDraft();
        }
        return true;
      }
    });
    this.addSettingTab(new WeChatMpPublisherSettingTab(this.app, this));
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file instanceof import_obsidian10.TFile && file.extension === "md") {
          this.lastMarkdownFilePath = file.path;
        }
        void this.refreshPreviewLeaves();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.view instanceof import_obsidian10.MarkdownView) {
          this.captureMarkdownContext(leaf);
          void this.refreshPreviewLeaves();
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        void this.refreshPreviewLeaves();
      })
    );
  }
  onunload() {
  }
  async loadSettings() {
    const loaded = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      entitlements: loaded?.entitlements && typeof loaded.entitlements === "object" ? {
        enabled: {
          ...DEFAULT_SETTINGS.entitlements.enabled,
          ...loaded.entitlements.enabled ?? {}
        }
      } : {
        enabled: {
          ...DEFAULT_SETTINGS.entitlements.enabled
        }
      },
      styleOverrides: {
        ...DEFAULT_SETTINGS.styleOverrides,
        ...loaded?.styleOverrides ?? {}
      },
      accounts: Array.isArray(loaded?.accounts) ? loaded.accounts.map(
        (account) => normalizePublisherAccount(account)
      ) : [],
      draftRecords: cloneDraftRecords(loaded?.draftRecords),
      coverMediaRecords: cloneCoverMediaRecords(loaded?.coverMediaRecords),
      articleImageRecords: cloneArticleImageRecords(loaded?.articleImageRecords),
      savedStylePresets: Array.isArray(loaded?.savedStylePresets) ? loaded.savedStylePresets.slice(0, 5).map((preset) => ({
        id: typeof preset.id === "string" && preset.id ? preset.id : createStylePresetId(),
        name: typeof preset.name === "string" && preset.name.trim() ? preset.name.trim() : "未命名样式",
        baseStyleId: typeof preset.baseStyleId === "string" && preset.baseStyleId ? getStyleProfileById(preset.baseStyleId).id : DEFAULT_SETTINGS.defaultStyleId,
        styleOverrides: cloneStyleOverrides(preset.styleOverrides ?? {})
      })) : []
    };
  }
  async saveSettings(options3) {
    await this.saveData(this.settings);
    if (options3?.refreshPreview !== false) {
      await this.refreshPreviewLeaves();
    }
  }
  async updateDefaultTheme(themeId) {
    this.settings.defaultThemeId = this.resolveAccessibleThemeId(themeId);
    await this.saveSettings();
  }
  async updateDefaultStyle(styleId) {
    this.settings.defaultStyleId = getStyleProfileById(styleId).id;
    await this.saveSettings();
  }
  getActiveMarkdownFile() {
    const activeFile = this.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView)?.file ?? null;
    if (activeFile) {
      this.lastMarkdownFilePath = activeFile.path;
      return activeFile;
    }
    if (this.lastMarkdownFilePath) {
      const cached = this.app.vault.getAbstractFileByPath(this.lastMarkdownFilePath);
      if (cached instanceof import_obsidian10.TFile && cached.extension === "md") {
        return cached;
      }
    }
    const markdownLeaf = this.findMarkdownLeaf();
    const markdownFile = markdownLeaf?.view instanceof import_obsidian10.MarkdownView ? markdownLeaf.view.file : null;
    if (markdownFile) {
      this.lastMarkdownFilePath = markdownFile.path;
      return markdownFile;
    }
    return null;
  }
  async getRenderPayload(themeId) {
    const file = this.getActiveMarkdownFile();
    if (!file) {
      return null;
    }
    const rawMarkdown = await this.app.vault.cachedRead(file);
    const markdown2 = await preprocessMarkdownForWechat(this.app, file, rawMarkdown);
    const resolvedThemeId = this.resolveAccessibleThemeId(themeId ?? this.settings.defaultThemeId);
    const theme = getThemeById(resolvedThemeId);
    const styleProfile = this.getCurrentStyleProfile();
    const result = renderMarkdownToWechatHtml(markdown2, { theme, styleProfile });
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    return {
      file,
      markdown: markdown2,
      frontmatter,
      theme,
      styleProfile,
      result
    };
  }
  async copyActiveNoteHtml(themeId) {
    if (!await this.ensureFeatureAccess("copy-html", "复制 HTML")) {
      return;
    }
    const payload = await this.getRenderPayload(themeId);
    if (!payload) {
      new import_obsidian10.Notice("请先打开一个 Markdown 文件。");
      return;
    }
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        const item = new ClipboardItem({
          "text/html": new Blob([payload.result.html], { type: "text/html" }),
          "text/plain": new Blob([payload.result.html], { type: "text/plain" })
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(payload.result.html);
      }
      new import_obsidian10.Notice(`已复制 ${payload.file.basename} 的微信 HTML。`);
    } catch (error3) {
      console.error(error3);
      new import_obsidian10.Notice("复制失败，当前环境不支持剪贴板写入。");
    }
  }
  openExternalUrl(url, failureMessage = "打开链接失败，请稍后重试。") {
    try {
      const safeUrl = normalizeHttpUrl(url);
      if (!safeUrl) {
        new import_obsidian10.Notice("只支持打开 http(s) 外部链接。");
        return;
      }
      const electronShell = globalThis.require?.(
        "electron"
      );
      if (electronShell?.shell?.openExternal) {
        void electronShell.shell.openExternal(safeUrl);
        return;
      }
      window.open(safeUrl, "_blank", "noopener,noreferrer");
    } catch (error3) {
      console.error(error3);
      new import_obsidian10.Notice(failureMessage);
    }
  }
  openWechatPlatform() {
    this.openExternalUrl(
      "https://mp.weixin.qq.com/",
      "打开公众号平台失败，请手动访问 mp.weixin.qq.com。"
    );
  }
  openWechatDeveloperPlatform() {
    this.openExternalUrl(
      "https://developers.weixin.qq.com/platform",
      "打开微信开放平台失败，请手动访问 developers.weixin.qq.com/platform。"
    );
  }
  getPublicIpStatus() {
    return { ...this.publicIpStatus };
  }
  getAvailableThemes() {
    return this.themes;
  }
  getAvailableAccounts() {
    return this.settings.accounts;
  }
  hasPremiumThemeAccess() {
    return true;
  }
  resolveAccessibleThemeId(themeId) {
    return getThemeById(themeId).id;
  }
  async ensureFeatureAccess(_feature, _label, _options) {
    return true;
  }
  getPublicIpStatusText() {
    if (this.publicIpStatus.value) {
      const checkedAt = this.publicIpStatus.checkedAt ? new Date(this.publicIpStatus.checkedAt).toLocaleString("zh-CN", {
        hour12: false
      }) : "刚刚";
      const sourceText = this.publicIpStatus.sourceLabel ? ` \xB7 来源 ${this.publicIpStatus.sourceLabel}` : "";
      return `当前公网 IP：${this.publicIpStatus.value}${sourceText} \xB7 检测时间 ${checkedAt}`;
    }
    if (this.publicIpStatus.error) {
      return `检测失败：${this.publicIpStatus.error}`;
    }
    return "用于微信 API 白名单。优先检测微信接口实际看到的出口 IP。";
  }
  async detectPublicIp(account) {
    const wechatIp = await this.detectWechatApiIp(account);
    if (wechatIp) {
      this.publicIpStatus = {
        value: wechatIp,
        sourceLabel: "微信接口",
        checkedAt: Date.now(),
        error: null
      };
      return wechatIp;
    }
    const providers = [
      {
        url: "https://api.ipify.org?format=json",
        label: "ipify",
        parse: (response) => {
          const ip = response.json && typeof response.json === "object" && "ip" in response.json && typeof response.json.ip === "string" ? response.json.ip : response.text;
          return extractIpv4(ip);
        }
      },
      {
        url: "https://4.ipw.cn",
        label: "ipw.cn",
        parse: (response) => extractIpv4(response.text)
      },
      {
        url: "https://ipv4.icanhazip.com",
        label: "icanhazip",
        parse: (response) => extractIpv4(response.text)
      }
    ];
    const errors = [];
    for (const provider of providers) {
      try {
        const response = await (0, import_obsidian10.requestUrl)({
          url: provider.url,
          method: "GET",
          throw: false
        });
        if (response.status >= 400) {
          errors.push(`${provider.label}: HTTP ${response.status}`);
          continue;
        }
        const ip = provider.parse(response);
        if (!ip) {
          errors.push(`${provider.label}: 返回内容里没有可用 IPv4`);
          continue;
        }
        this.publicIpStatus = {
          value: ip,
          sourceLabel: provider.label,
          checkedAt: Date.now(),
          error: null
        };
        return ip;
      } catch (error3) {
        errors.push(`${provider.label}: ${error3 instanceof Error ? error3.message : "未知错误"}`);
      }
    }
    this.publicIpStatus = {
      value: null,
      sourceLabel: null,
      checkedAt: Date.now(),
      error: errors.join("；") || "没有拿到公网 IP"
    };
    throw new Error(this.publicIpStatus.error ?? "没有拿到公网 IP");
  }
  async detectWechatApiIp(account) {
    const targetAccount = account ?? this.getPreferredAccount();
    if (!targetAccount?.appId || !targetAccount.appSecret) {
      return null;
    }
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(targetAccount.appId)}&secret=${encodeURIComponent(targetAccount.appSecret)}`;
    try {
      const req = buildWechatRequest(targetAccount, url, {
        method: "GET",
        requestLabel: "检测微信出口IP"
      });
      const response = await (0, import_obsidian10.requestUrl)(req);
      const data6 = response.json;
      const message = data6?.errmsg ?? response.text ?? "";
      if (data6?.errcode === 40164 || /invalid ip/i.test(message)) {
        return extractIpv4(message);
      }
      return null;
    } catch {
      return null;
    }
  }
  async copyTextToClipboard(value2, successMessage = "已复制。") {
    await navigator.clipboard.writeText(value2);
    new import_obsidian10.Notice(successMessage);
  }
  async activatePreview() {
    this.captureMarkdownContext(this.app.workspace.activeLeaf ?? void 0);
    let leaf = this.app.workspace.getLeavesOfType(PREVIEW_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(false);
      await leaf.setViewState({ type: PREVIEW_VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
    await leaf.view.refresh();
  }
  async refreshPreviewLeaves() {
    const leaves = this.app.workspace.getLeavesOfType(PREVIEW_VIEW_TYPE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (typeof view.refresh === "function") {
        await view.refresh();
      }
    }
  }
  findMarkdownLeaf() {
    return this.app.workspace.getLeavesOfType("markdown").find((leaf) => {
      return leaf.view instanceof import_obsidian10.MarkdownView && Boolean(leaf.view.file);
    }) ?? null;
  }
  captureMarkdownContext(leaf) {
    const targetLeaf = leaf ?? this.app.workspace.activeLeaf ?? this.findMarkdownLeaf();
    if (!targetLeaf || !(targetLeaf.view instanceof import_obsidian10.MarkdownView) || !targetLeaf.view.file) {
      return;
    }
    this.lastMarkdownFilePath = targetLeaf.view.file.path;
  }
  getPreferredAccount() {
    const accessibleAccounts = this.getAvailableAccounts();
    const preferred = accessibleAccounts.find((account) => account.id === this.settings.preferredAccountId) ?? accessibleAccounts[0];
    return preferred ?? null;
  }
  getPreferredAccountDefaultAuthor() {
    return this.getPreferredAccount()?.defaultAuthor?.trim() ?? "";
  }
  getPreferredAccountDefaultCover() {
    return this.getPreferredAccount()?.defaultCoverPath?.trim() ?? "";
  }
  getPublishMetaDraft(file, frontmatter) {
    const draft = this.publishMetaDrafts.get(file.path) ?? {};
    return {
      title: Object.prototype.hasOwnProperty.call(draft, "title") ? draft.title?.trim() ?? "" : typeof frontmatter.title === "string" && frontmatter.title.trim() ? frontmatter.title.trim() : file.basename,
      author: Object.prototype.hasOwnProperty.call(draft, "author") ? draft.author?.trim() ?? "" : typeof frontmatter.author === "string" && frontmatter.author.trim() ? frontmatter.author.trim() : this.getPreferredAccountDefaultAuthor(),
      cover: Object.prototype.hasOwnProperty.call(draft, "cover") ? draft.cover?.trim() ?? "" : typeof frontmatter.cover === "string" && frontmatter.cover.trim() ? frontmatter.cover.trim() : this.getPreferredAccountDefaultCover()
    };
  }
  updatePublishMetaDraft(fields) {
    const file = this.getActiveMarkdownFile();
    if (!file) {
      return;
    }
    const nextDraft = {
      ...this.publishMetaDrafts.get(file.path) ?? {}
    };
    for (const [key, value2] of Object.entries(fields)) {
      nextDraft[key] = value2;
    }
    this.publishMetaDrafts.set(file.path, nextDraft);
  }
  /** 清掉当前笔记 draft 中的某个字段，让 getPublishMetaDraft 回落到 frontmatter / 账号默认值。 */
  resetPublishMetaDraftField(field) {
    const file = this.getActiveMarkdownFile();
    if (!file) return;
    const currentDraft = this.publishMetaDrafts.get(file.path);
    if (!currentDraft) return;
    const { [field]: _removed, ...rest } = currentDraft;
    if (Object.keys(rest).length === 0) {
      this.publishMetaDrafts.delete(file.path);
    } else {
      this.publishMetaDrafts.set(file.path, rest);
    }
  }
  buildPublishFrontmatter(file, frontmatter, account) {
    const nextFrontmatter = { ...frontmatter };
    const draft = this.publishMetaDrafts.get(file.path) ?? {};
    if (Object.prototype.hasOwnProperty.call(draft, "title")) {
      const title2 = draft.title?.trim() ?? "";
      if (title2) {
        nextFrontmatter.title = title2;
      } else {
        delete nextFrontmatter.title;
      }
    }
    if (Object.prototype.hasOwnProperty.call(draft, "author")) {
      const author = draft.author?.trim() ?? "";
      if (author) {
        nextFrontmatter.author = author;
      } else {
        delete nextFrontmatter.author;
      }
    } else if (!(typeof nextFrontmatter.author === "string" && nextFrontmatter.author.trim()) && account.defaultAuthor) {
      nextFrontmatter.author = account.defaultAuthor;
    }
    if (Object.prototype.hasOwnProperty.call(draft, "cover")) {
      const cover = draft.cover?.trim() ?? "";
      if (cover) {
        nextFrontmatter.cover = cover;
      } else {
        delete nextFrontmatter.cover;
      }
    }
    return nextFrontmatter;
  }
  getCurrentStyleProfile() {
    return {
      ...getStyleProfileById(this.settings.defaultStyleId),
      ...this.settings.styleOverrides
    };
  }
  getDraftRecord(filePath, accountId) {
    return this.settings.draftRecords.find(
      (record) => record.notePath === filePath && record.accountId === accountId
    ) ?? null;
  }
  async upsertDraftRecord(record) {
    const existingIndex = this.settings.draftRecords.findIndex(
      (item) => item.notePath === record.notePath && item.accountId === record.accountId
    );
    if (existingIndex >= 0) {
      this.settings.draftRecords[existingIndex] = record;
    } else {
      this.settings.draftRecords.unshift(record);
    }
    this.settings.draftRecords = pruneDraftRecords(this.settings.draftRecords);
    await this.saveSettings({ refreshPreview: false });
  }
  async upsertCoverMediaRecord(record) {
    const existingIndex = this.settings.coverMediaRecords.findIndex(
      (item) => item.accountId === record.accountId && item.sourceKey === record.sourceKey
    );
    if (existingIndex >= 0) {
      this.settings.coverMediaRecords[existingIndex] = record;
    } else {
      this.settings.coverMediaRecords.unshift(record);
    }
    this.settings.coverMediaRecords = pruneCoverMediaRecords(this.settings.coverMediaRecords);
    await this.saveSettings({ refreshPreview: false });
  }
  async upsertArticleImageRecords(records) {
    if (!Array.isArray(records) || records.length === 0) return;
    for (const record of records) {
      const existingIndex = this.settings.articleImageRecords.findIndex(
        (item) => item.accountId === record.accountId && item.sourceKey === record.sourceKey
      );
      if (existingIndex >= 0) {
        this.settings.articleImageRecords[existingIndex] = record;
      } else {
        this.settings.articleImageRecords.unshift(record);
      }
    }
    this.settings.articleImageRecords = pruneArticleImageRecords(this.settings.articleImageRecords);
    await this.saveSettings({ refreshPreview: false });
  }
  async saveCurrentStylePreset(name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      new import_obsidian10.Notice("请先给样式方案起一个名字。");
      return null;
    }
    const existingPreset = this.settings.savedStylePresets.find(
      (preset) => preset.name === trimmedName
    );
    if (existingPreset) {
      existingPreset.baseStyleId = getStyleProfileById(this.settings.defaultStyleId).id;
      existingPreset.styleOverrides = cloneStyleOverrides(this.settings.styleOverrides);
      await this.saveSettings();
      return "updated";
    }
    if (this.settings.savedStylePresets.length >= 5) {
      new import_obsidian10.Notice("最多只能保存 5 个样式方案。请先删除不用的方案。");
      return null;
    }
    this.settings.savedStylePresets.push({
      id: createStylePresetId(),
      name: trimmedName,
      baseStyleId: getStyleProfileById(this.settings.defaultStyleId).id,
      styleOverrides: cloneStyleOverrides(this.settings.styleOverrides)
    });
    await this.saveSettings();
    return "created";
  }
  async applySavedStylePreset(presetId) {
    const preset = this.settings.savedStylePresets.find((item) => item.id === presetId);
    if (!preset) {
      new import_obsidian10.Notice("没有找到这个样式方案。");
      return false;
    }
    this.settings.defaultStyleId = getStyleProfileById(preset.baseStyleId).id;
    this.settings.styleOverrides = cloneStyleOverrides(preset.styleOverrides);
    await this.saveSettings();
    return true;
  }
  async deleteSavedStylePreset(presetId) {
    const beforeLength = this.settings.savedStylePresets.length;
    this.settings.savedStylePresets = this.settings.savedStylePresets.filter(
      (preset) => preset.id !== presetId
    );
    if (this.settings.savedStylePresets.length === beforeLength) {
      return false;
    }
    await this.saveSettings();
    return true;
  }
  async pickAccountDefaultCover(accountId) {
    if (!await this.ensureFeatureAccess("cover-upload", "默认封面")) {
      return null;
    }
    const account = this.settings.accounts.find((item) => item.id === accountId);
    if (!account) {
      new import_obsidian10.Notice("没有找到对应账号。");
      return null;
    }
    const pickedFile = await this.pickImageFile();
    if (!pickedFile) {
      return null;
    }
    const validationMessage = await validateWechatCoverCandidate(pickedFile);
    const storedPath = await this.saveImageIntoPluginFolder(accountId, pickedFile);
    account.defaultCoverPath = storedPath;
    await this.saveSettings();
    if (validationMessage) {
      new import_obsidian10.Notice(`已保存默认封面。提示：${validationMessage}`, 8e3);
    } else {
      new import_obsidian10.Notice("已保存默认封面。");
    }
    return storedPath;
  }
  async clearAccountDefaultCover(accountId) {
    const account = this.settings.accounts.find((item) => item.id === accountId);
    if (!account || !account.defaultCoverPath) {
      return false;
    }
    const adapter2 = this.app.vault.adapter;
    const targetPath = (0, import_obsidian10.normalizePath)(account.defaultCoverPath);
    if (await adapter2.exists(targetPath)) {
      await adapter2.remove(targetPath);
    }
    account.defaultCoverPath = "";
    await this.saveSettings();
    return true;
  }
  async publishActiveNoteDraft(themeId) {
    if (this.isPublishing) {
      new import_obsidian10.Notice("正在发布中，请稍候...");
      return;
    }
    if (!await this.ensureFeatureAccess("draft-publish", "发布草稿")) {
      return;
    }
    const payload = await this.getRenderPayload(themeId);
    if (!payload) {
      new import_obsidian10.Notice("请先打开一个 Markdown 文件。");
      return;
    }
    const account = this.getPreferredAccount();
    if (!account) {
      new import_obsidian10.Notice("请先在插件设置里配置一个公众号账号。");
      return;
    }
    if (!account.appId || !account.appSecret) {
      new import_obsidian10.Notice("当前默认账号缺少 AppID 或 AppSecret。");
      return;
    }
    this.isPublishing = true;
    const publishModal = new PublishModal(this, payload.file.basename);
    publishModal.open();
    try {
      const frontmatter = this.buildPublishFrontmatter(payload.file, payload.frontmatter, account);
      const existingDraftRecord = this.getDraftRecord(payload.file.path, account.id);
      const result = await publishDraftToWechat({
        app: this.app,
        account,
        file: payload.file,
        html: payload.result.html,
        frontmatter,
        existingDraftMediaId: existingDraftRecord?.mediaId ?? null,
        coverMediaRecords: this.settings.coverMediaRecords,
        articleImageRecords: this.settings.articleImageRecords,
        onProgress: (message) => {
          publishModal.setProgress(message);
        }
      });
      if (result.coverMediaRecord) {
        await this.upsertCoverMediaRecord(result.coverMediaRecord);
      }
      if (result.articleImageRecords?.length) {
        await this.upsertArticleImageRecords(result.articleImageRecords);
      }
      await this.upsertDraftRecord({
        notePath: payload.file.path,
        accountId: account.id,
        mediaId: result.mediaId,
        title: result.title,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      publishModal.showSuccess(
        `${result.action === "updated" ? "已更新草稿" : "发布成功"}：${result.title}，已上传 ${result.imageCount} 张图片。`
      );
    } catch (error3) {
      console.error(error3);
      publishModal.showFailure(
        `发布失败：${error3 instanceof Error ? error3.message : "未知错误"}`
      );
    } finally {
      this.isPublishing = false;
    }
  }
  openAccountConfigModal() {
    new AccountConfigModal(this).open();
  }
  openStyleConfigModal() {
    new StyleConfigModal(this).open();
  }
  openFormatModal() {
    new FormatModal(this).open();
  }
  async pickLocalCoverImage() {
    if (!await this.ensureFeatureAccess("cover-upload", "封面上传")) {
      return null;
    }
    const noteFile = this.getActiveMarkdownFile();
    if (!noteFile) {
      new import_obsidian10.Notice("请先打开一个 Markdown 文件。");
      return null;
    }
    const pickedFile = await this.pickImageFile();
    if (!pickedFile) {
      return null;
    }
    const attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(
      pickedFile.name,
      noteFile.path
    );
    const arrayBuffer = await pickedFile.arrayBuffer();
    const savedFile = await this.app.vault.createBinary(attachmentPath, arrayBuffer);
    return savedFile.path;
  }
  async pickImageFile() {
    return new Promise((resolve2) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml";
      input.onchange = () => {
        resolve2(input.files?.[0] ?? null);
      };
      input.click();
    });
  }
  async saveImageIntoPluginFolder(accountId, file) {
    const adapter2 = this.app.vault.adapter;
    const coversDir = (0, import_obsidian10.normalizePath)(
      `${this.app.vault.configDir}/plugins/${this.manifest.id}/covers`
    );
    await ensureAdapterFolder(adapter2, coversDir);
    const extension5 = pickFileExtension(file);
    const targetPath = (0, import_obsidian10.normalizePath)(`${coversDir}/${accountId}.${extension5}`);
    const arrayBuffer = await file.arrayBuffer();
    await adapter2.writeBinary(targetPath, arrayBuffer);
    return targetPath;
  }
};
async function ensureAdapterFolder(adapter2, targetPath) {
  const segments = targetPath.split("/").filter(Boolean);
  let currentPath = "";
  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    const normalized = (0, import_obsidian10.normalizePath)(currentPath);
    if (!await adapter2.exists(normalized)) {
      await adapter2.mkdir(normalized);
    }
  }
}
function pickFileExtension(file) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^(png|jpg|jpeg|gif|webp|svg)$/.test(fromName)) {
    return fromName;
  }
  if (file.type.includes("png")) return "png";
  if (file.type.includes("gif")) return "gif";
  if (file.type.includes("webp")) return "webp";
  if (file.type.includes("svg")) return "svg";
  return "jpg";
}
async function validateWechatCoverCandidate(file) {
  const image = await loadImageFromFile(file);
  const width3 = image.naturalWidth || image.width;
  const height2 = image.naturalHeight || image.height;
  const ratio = width3 / Math.max(height2, 1);
  const warnings3 = [];
  if (!/(image\/png|image\/jpeg|image\/jpg|image\/gif|image\/webp|image\/svg\+xml)/i.test(file.type)) {
    warnings3.push("格式不是常见的 PNG/JPG/GIF");
  }
  if (width3 < 900 || height2 < 383) {
    warnings3.push(`尺寸偏小（当前 ${width3}\xD7${height2}，常用公众号头图建议不低于 900\xD7383）`);
  }
  if (Math.abs(ratio - 2.35) > 0.18) {
    warnings3.push(`比例偏离较大（当前 ${ratio.toFixed(2)}，常见公众号头图比例约为 2.35:1）`);
  }
  if (file.size > 10 * 1024 * 1024) {
    warnings3.push("文件过大（建议控制在 10MB 内）");
  }
  return warnings3.length ? warnings3.join("；") : null;
}
async function loadImageFromFile(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve2, reject3) => {
      const image = new Image();
      image.onload = () => resolve2(image);
      image.onerror = () => reject3(new Error("图片读取失败"));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
function normalizeHttpUrl(value2) {
  try {
    const url = new URL(value2);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
function extractIpv4(raw) {
  const match2 = raw.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  if (!match2) {
    return null;
  }
  const candidate = match2[0];
  const octets = candidate.split(".").map((part) => Number.parseInt(part, 10));
  if (octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null;
  }
  return candidate;
}
/*! Bundled license information:

juice/lib/utils.js:
  (**
   * Returns an array of the selectors.
   *
   * @license Sizzle CSS Selector Engine - MIT
   * @param {String} selectorText from mensch
   * @api public
   *)

dompurify/dist/purify.es.mjs:
  (*! @license DOMPurify 3.3.3 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.3/LICENSE *)

mermaid/dist/chunks/mermaid.core/chunk-XPW4576I.mjs:
  (*! Bundled license information:
  
  js-yaml/dist/js-yaml.mjs:
    (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
  *)

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)

cytoscape/dist/cytoscape.esm.mjs:
  (*!
  Embeddable Minimum Strictly-Compliant Promises/A+ 1.1.1 Thenable
  Copyright (c) 2013-2014 Ralf S. Engelschall (http://engelschall.com)
  Licensed under The MIT License (http://opensource.org/licenses/MIT)
  *)
  (*!
  Event object based on jQuery events, MIT license
  
  https://jquery.org/license/
  https://tldrlegal.com/license/mit-license
  https://github.com/jquery/jquery/blob/master/src/event.js
  *)
  (*! Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License *)
  (*! Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License *)

mermaid/dist/mermaid.core.mjs:
  (*! Check if previously processed *)
  (*!
   * Wait for document loaded before starting the execution
   *)

mhchemparser/dist/mhchemParser.js:
  (*!
   *************************************************************************
   *
   *  mhchemParser.ts
   *  4.2.1
   *
   *  Parser for the \ce command and \pu command for MathJax and Co.
   *
   *  mhchem's \ce is a tool for writing beautiful chemical equations easily.
   *  mhchem's \pu is a tool for writing physical units easily.
   *
   *  ----------------------------------------------------------------------
   *
   *  Copyright (c) 2015-2023 Martin Hensel
   *
   *  Licensed under the Apache License, Version 2.0 (the "License");
   *  you may not use this file except in compliance with the License.
   *  You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   *  Unless required by applicable law or agreed to in writing, software
   *  distributed under the License is distributed on an "AS IS" BASIS,
   *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *  See the License for the specific language governing permissions and
   *  limitations under the License.
   *
   *  ----------------------------------------------------------------------
   *
   *  https://github.com/mhchem/mhchemParser
   *
   *)
*/
