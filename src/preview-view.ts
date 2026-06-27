const import_obsidian4 = require("obsidian");
const PREVIEW_VIEW_TYPE = "weixin-mp-publisher-preview";
const SVG_NS = "http://www.w3.org/2000/svg";
const WeiXinMpPublisherPreviewView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin23) {
    super(leaf);
    this.plugin = plugin23;
  }
  // Toolbar / drawer structure
  toolbarEl = null;
  drawerEl = null;
  metaCardEl = null;
  metaCoverEl = null;
  metaTitleEl = null;
  metaSubEl = null;
  metaCaretEl = null;
  drawerOpen = false;
  // Drawer inputs
  titleInputEl = null;
  authorInputEl = null;
  coverInputEl = null;
  coverThumbEl = null;
  // Account pill + dropdown
  accountPillEl = null;
  accountPillStatusEl = null;
  accountPillNameEl = null;
  accountMenuWrapEl = null;
  accountMenuEl = null;
  accountMenuOpen = false;
  // Theme/layout pill + dropdown
  themePillEl = null;
  themePillNameEl = null;
  themeMenuWrapEl = null;
  themeMenuEl = null;
  themeMenuOpen = false;
  // More (⋯) menu
  moreButtonEl = null;
  moreMenuWrapEl = null;
  moreMenuEl = null;
  moreMenuOpen = false;
  // Hidden-toolbar tab handle
  toolbarHiddenHandleEl = null;
  toolbarHidden = false;
  // Status meta + preview
  metaEl = null;
  previewEl = null;
  // Scroll sync state (preserved from previous implementation)
  syncEnabled = false;
  syncRAF = null;
  isSyncing = false;
  onPreviewScrollBound = null;
  onEditorScrollBound = null;
  editorScrollEl = null;
  editorScrollCaptureCleanup = null;
  syncStatusLabel = "已关闭";
  // Document-level listener for closing popovers
  onDocumentMouseDown = null;
  getViewType() {
    return PREVIEW_VIEW_TYPE;
  }
  getDisplayText() {
    return "WeiXin MP Publisher";
  }
  getIcon() {
    return "newspaper";
  }
  async onOpen() {
    this.containerEl.empty();
    this.containerEl.addClass("weixin-mp-publisher-view");
    this.renderToolbarHiddenHandle();
    this.renderToolbar();
    this.renderDrawer();
    this.metaEl = this.containerEl.createDiv({ cls: "wp-status" });
    this.previewEl = this.containerEl.createDiv({ cls: "wp-preview-wrap" });
    this.onDocumentMouseDown = (e3) => this.handleDocumentMouseDown(e3);
    document.addEventListener("mousedown", this.onDocumentMouseDown);
    await this.refresh();
  }
  async onClose() {
    this.stopScrollSync();
    if (this.onDocumentMouseDown) {
      document.removeEventListener("mousedown", this.onDocumentMouseDown);
      this.onDocumentMouseDown = null;
    }
    await super.onClose();
  }
  // ============================================================
  // Toolbar
  // ============================================================
  renderToolbarHiddenHandle() {
    this.toolbarHiddenHandleEl = this.containerEl.createDiv({
      cls: "wp-toolbar-hidden-handle"
    });
    this.toolbarHiddenHandleEl.setAttr("title", "显示工具栏");
    this.toolbarHiddenHandleEl.setText("⌄ 显示工具栏");
    this.toolbarHiddenHandleEl.addEventListener("click", () => {
      this.setToolbarHidden(false);
    });
    this.toolbarHiddenHandleEl.hide();
  }
  renderToolbar() {
    this.toolbarEl = this.containerEl.createDiv({ cls: "wp-toolbar" });
    this.metaCardEl = this.toolbarEl.createDiv({ cls: "wp-meta" });
    this.metaCardEl.setAttr("title", "点击编辑本次发布的标题 / 作者 / 封面");
    this.metaCoverEl = this.metaCardEl.createDiv({ cls: "wp-cover empty" });
    this.appendIcon(this.metaCoverEl, "image");
    const metaText = this.metaCardEl.createDiv({ cls: "wp-meta-text" });
    this.metaTitleEl = metaText.createDiv({ cls: "wp-title untitled" });
    this.metaTitleEl.setText("未命名草稿");
    this.metaSubEl = metaText.createDiv({ cls: "wp-sub" });
    this.metaCaretEl = this.metaCardEl.createEl("span", { cls: "wp-caret" });
    this.appendIcon(this.metaCaretEl, "chevronDown", { size: 12 });
    this.metaCardEl.addEventListener("click", () => this.toggleDrawer());
    this.accountMenuWrapEl = this.toolbarEl.createDiv({ cls: "wp-menu-wrap" });
    this.accountPillEl = this.accountMenuWrapEl.createEl("button", {
      cls: "wp-account"
    });
    this.accountPillStatusEl = this.accountPillEl.createEl("span", {
      cls: "wp-account-status none"
    });
    this.accountPillNameEl = this.accountPillEl.createEl("span", {
      cls: "wp-account-name"
    });
    const caretWrap = this.accountPillEl.createEl("span", { cls: "wp-account-caret" });
    this.appendIcon(caretWrap, "chevronDown", { size: 10 });
    this.accountPillEl.addEventListener("click", (e3) => {
      e3.stopPropagation();
      this.toggleAccountMenu();
    });
    this.themeMenuWrapEl = this.toolbarEl.createDiv({ cls: "wp-menu-wrap" });
    this.themePillEl = this.themeMenuWrapEl.createEl("button", {
      cls: "wp-theme-pill"
    });
    const themeIconWrap = this.themePillEl.createEl("span", { cls: "wp-theme-pill-icon" });
    this.appendIcon(themeIconWrap, "type", { size: 13 });
    this.themePillNameEl = this.themePillEl.createEl("span", {
      cls: "wp-theme-pill-name"
    });
    const themeCaret = this.themePillEl.createEl("span", { cls: "wp-account-caret" });
    this.appendIcon(themeCaret, "chevronDown", { size: 10 });
    this.themePillEl.addEventListener("click", (e3) => {
      e3.stopPropagation();
      this.toggleThemeMenu();
    });
    this.renderIconButton(this.toolbarEl, "refresh", "刷新渲染", () => {
      void this.refresh();
    });
    this.renderIconButton(this.toolbarEl, "copy", "复制 HTML（免费）", () => {
      void this.plugin.copyActiveNoteHtml(this.plugin.settings.defaultThemeId);
    });
    this.toolbarEl.createDiv({ cls: "wp-divider" });
    const primaryBtn = this.toolbarEl.createEl("button", { cls: "wp-primary" });
    primaryBtn.setAttr("title", "发布到微信公众号草稿箱");
    this.appendIcon(primaryBtn, "send", { size: 14 });
    primaryBtn.createEl("span", { text: "发布草稿" });
    primaryBtn.addEventListener("click", () => {
      void this.plugin.publishActiveNoteDraft(this.plugin.settings.defaultThemeId);
    });
    this.moreMenuWrapEl = this.toolbarEl.createDiv({ cls: "wp-menu-wrap" });
    this.moreButtonEl = this.moreMenuWrapEl.createEl("button", {
      cls: "wp-icon-btn"
    });
    this.moreButtonEl.setAttr("title", "更多");
    this.appendIcon(this.moreButtonEl, "more");
    this.moreButtonEl.addEventListener("click", (e3) => {
      e3.stopPropagation();
      this.toggleMoreMenu();
    });
  }
  renderDrawer() {
    this.drawerEl = this.containerEl.createDiv({ cls: "wp-drawer" });
    const titleField = this.drawerEl.createDiv({ cls: "wp-field" });
    titleField.createEl("span", { cls: "wp-field-label", text: "标题" });
    this.titleInputEl = titleField.createEl("input", {
      type: "text",
      cls: "wp-input"
    });
    this.titleInputEl.placeholder = "仅用于本次发布，不写入笔记属性";
    this.titleInputEl.addEventListener("input", () => {
      this.plugin.updatePublishMetaDraft({
        title: this.titleInputEl?.value ?? ""
      });
      this.updateMetaCard();
    });
    const authorField = this.drawerEl.createDiv({ cls: "wp-field" });
    authorField.createEl("span", { cls: "wp-field-label", text: "作者" });
    this.authorInputEl = authorField.createEl("input", {
      type: "text",
      cls: "wp-input"
    });
    this.authorInputEl.placeholder = "署名（留空走账号默认署名）";
    this.authorInputEl.addEventListener("input", () => {
      this.plugin.updatePublishMetaDraft({
        author: this.authorInputEl?.value ?? ""
      });
      this.updateMetaCard();
    });
    const coverField = this.drawerEl.createDiv({ cls: "wp-field wide" });
    coverField.createEl("span", { cls: "wp-field-label", text: "封面" });
    const coverRow = coverField.createDiv({ cls: "wp-cover-row" });
    this.coverThumbEl = coverRow.createDiv({ cls: "wp-cover-thumb empty" });
    const coverMain = coverRow.createDiv({ cls: "wp-cover-main" });
    this.coverInputEl = coverMain.createEl("input", {
      type: "text",
      cls: "wp-input wp-cover-input"
    });
    this.coverInputEl.placeholder = "点击下方按钮从电脑选图；留空则用占位封面或账号默认封面";
    this.coverInputEl.addEventListener("input", () => {
      this.plugin.updatePublishMetaDraft({
        cover: this.coverInputEl?.value ?? ""
      });
      this.updateMetaCard();
    });
    const coverActions = coverMain.createDiv({ cls: "wp-cover-actions" });
    const pickBtn = coverActions.createEl("button", {
      cls: "wp-btn-ghost",
      text: "从电脑选择…"
    });
    pickBtn.addEventListener("click", () => {
      void (async () => {
        const path4 = await this.plugin.pickLocalCoverImage();
        if (path4 && this.coverInputEl) {
          this.coverInputEl.value = path4;
          this.plugin.updatePublishMetaDraft({ cover: path4 });
          this.updateMetaCard();
        }
      })();
    });
    const defaultBtn = coverActions.createEl("button", {
      cls: "wp-btn-ghost",
      text: "使用账号默认封面"
    });
    defaultBtn.addEventListener("click", () => {
      void (async () => {
        const defaultCover = this.plugin.getPreferredAccountDefaultCover();
        if (!defaultCover) {
          const account = this.plugin.getPreferredAccount();
          if (!account) {
            new import_obsidian4.Notice("请先配置公众号账号，才能设置默认封面。");
            return;
          }
          const picked = await this.plugin.pickAccountDefaultCover(account.id);
          if (picked && this.coverInputEl) {
            this.coverInputEl.value = picked;
            this.plugin.updatePublishMetaDraft({ cover: picked });
            this.updateMetaCard();
          }
          return;
        }
        if (this.coverInputEl) {
          this.coverInputEl.value = defaultCover;
          this.plugin.updatePublishMetaDraft({ cover: defaultCover });
          this.updateMetaCard();
        }
      })();
    });
    const resetBtn = coverActions.createEl("button", {
      cls: "wp-btn-ghost",
      text: "恢复默认"
    });
    resetBtn.setAttr(
      "title",
      "清除本次发布的封面设置，回到「笔记 frontmatter > 账号默认封面 > 正文首图 > 占位封面」自动回落"
    );
    resetBtn.addEventListener("click", () => {
      this.plugin.resetPublishMetaDraftField("cover");
      void this.refresh();
    });
  }
  renderIconButton(container2, icon2, title2, onClick) {
    const btn = container2.createEl("button", { cls: "wp-icon-btn" });
    btn.setAttr("title", title2);
    this.appendIcon(btn, icon2);
    btn.addEventListener("click", onClick);
    return btn;
  }
  // ============================================================
  // Popovers
  // ============================================================
  handleDocumentMouseDown(e3) {
    const target = e3.target;
    if (this.accountMenuOpen && this.accountMenuWrapEl && !this.accountMenuWrapEl.contains(target)) {
      this.closeAccountMenu();
    }
    if (this.themeMenuOpen && this.themeMenuWrapEl && !this.themeMenuWrapEl.contains(target)) {
      this.closeThemeMenu();
    }
    if (this.moreMenuOpen && this.moreMenuWrapEl && !this.moreMenuWrapEl.contains(target)) {
      this.closeMoreMenu();
    }
  }
  toggleAccountMenu() {
    if (this.accountMenuOpen) {
      this.closeAccountMenu();
    } else {
      this.closeMoreMenu();
      this.closeThemeMenu();
      this.openAccountMenu();
    }
  }
  openAccountMenu() {
    if (!this.accountMenuWrapEl) return;
    this.closeAccountMenu();
    this.accountMenuOpen = true;
    this.accountMenuEl = this.accountMenuWrapEl.createDiv({
      cls: "wp-account-menu"
    });
    this.populateAccountMenu();
  }
  closeAccountMenu() {
    this.accountMenuOpen = false;
    this.accountMenuEl?.remove();
    this.accountMenuEl = null;
  }
  populateAccountMenu() {
    if (!this.accountMenuEl) return;
    this.accountMenuEl.empty();
    const items = this.getAccountListItems();
    const currentId = this.plugin.getPreferredAccount()?.id ?? null;
    if (items.length === 0) {
      const empty4 = this.accountMenuEl.createDiv({
        cls: "wp-account-empty"
      });
      empty4.setText("尚未配置公众号账号");
    }
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const rowEl = this.accountMenuEl.createDiv({
        cls: "wp-account-item"
      });
      if (item.account.id === currentId) rowEl.addClass("current");
      rowEl.addClass("acc-" + (idx % 3 + 1));
      const avatar = rowEl.createDiv({ cls: "wp-account-avatar" });
      avatar.setText(item.initial);
      const body = rowEl.createDiv({ cls: "wp-account-item-body" });
      body.createDiv({
        cls: "wp-account-item-name",
        text: item.account.name || "未命名账号"
      });
      const statusLine = body.createDiv({ cls: "wp-account-item-status" });
      statusLine.createEl("span", {
        cls: "wp-account-status wp-account-item-dot " + item.status
      });
      statusLine.appendText(item.hint);
      if (item.account.id === currentId) {
        const check = rowEl.createEl("span", { cls: "wp-account-item-check" });
        this.appendIcon(check, "check", { size: 14 });
      }
      rowEl.addEventListener("click", () => {
        void this.handleAccountSwitch(item.account.id);
      });
    }
    this.accountMenuEl.createDiv({ cls: "wp-menu-sep" });
    const configRow = this.accountMenuEl.createDiv({ cls: "wp-menu-item" });
    const plusIcon = configRow.createEl("span", { cls: "wp-menu-icon" });
    this.appendIcon(plusIcon, "plus");
    configRow.appendText("新建 / 管理账号…");
    configRow.addEventListener("click", () => {
      this.closeAccountMenu();
      this.plugin.openAccountConfigModal();
    });
  }
  async handleAccountSwitch(accountId) {
    this.plugin.settings.preferredAccountId = accountId;
    await this.plugin.saveSettings();
    this.closeAccountMenu();
    await this.refresh();
  }
  toggleMoreMenu() {
    if (this.moreMenuOpen) {
      this.closeMoreMenu();
    } else {
      this.closeAccountMenu();
      this.closeThemeMenu();
      this.openMoreMenu();
    }
  }
  toggleThemeMenu() {
    if (this.themeMenuOpen) {
      this.closeThemeMenu();
    } else {
      this.closeAccountMenu();
      this.closeMoreMenu();
      this.openThemeMenu();
    }
  }
  openThemeMenu() {
    if (!this.themeMenuWrapEl) return;
    this.closeThemeMenu();
    this.themeMenuOpen = true;
    this.themeMenuEl = this.themeMenuWrapEl.createDiv({ cls: "wp-theme-menu" });
    this.populateThemeMenu();
  }
  closeThemeMenu() {
    this.themeMenuOpen = false;
    this.themeMenuEl?.remove();
    this.themeMenuEl = null;
  }
  populateThemeMenu() {
    if (!this.themeMenuEl) return;
    this.themeMenuEl.empty();
    const currentThemeId = this.plugin.resolveAccessibleThemeId(
      this.plugin.settings.defaultThemeId
    );
    const currentStyleId = this.plugin.settings.defaultStyleId;
    const allThemes = this.plugin.themes;
    const advRow = this.themeMenuEl.createDiv({ cls: "wp-menu-item" });
    const advIcon = advRow.createEl("span", { cls: "wp-menu-icon" });
    this.appendIcon(advIcon, "key");
    advRow.createEl("span", {
      cls: "wp-menu-text",
      text: "高级微调 / 我的方案…"
    });
    advRow.addEventListener("click", () => {
      this.closeThemeMenu();
      this.plugin.openFormatModal();
    });
    this.themeMenuEl.createDiv({ cls: "wp-menu-sep" });
    const themeHeader = this.themeMenuEl.createDiv({ cls: "wp-theme-section-header" });
    themeHeader.setText("主题风格");
    for (const theme of allThemes) {
      const row = this.themeMenuEl.createDiv({
        cls: "wp-menu-item wp-theme-menu-item"
      });
      if (theme.id === currentThemeId) row.addClass("current");
      const body = row.createDiv({ cls: "wp-theme-item-body" });
      const nameLine = body.createDiv({ cls: "wp-theme-item-name" });
      nameLine.setText(theme.label);
      body.createDiv({
        cls: "wp-theme-item-desc",
        text: theme.description
      });
      if (theme.id === currentThemeId) {
        const check = row.createEl("span", { cls: "wp-account-item-check" });
        this.appendIcon(check, "check", { size: 14 });
      }
      row.addEventListener("click", () => {
        void (async () => {
          await this.plugin.updateDefaultTheme(theme.id);
          this.closeThemeMenu();
          await this.refresh();
        })();
      });
    }
    this.themeMenuEl.createDiv({ cls: "wp-menu-sep" });
    const styleHeader = this.themeMenuEl.createDiv({ cls: "wp-theme-section-header" });
    styleHeader.setText("排版模板");
    for (const styleProfile of this.plugin.styleProfiles) {
      const row = this.themeMenuEl.createDiv({
        cls: "wp-menu-item wp-theme-menu-item"
      });
      if (styleProfile.id === currentStyleId) row.addClass("current");
      const body = row.createDiv({ cls: "wp-theme-item-body" });
      body.createDiv({ cls: "wp-theme-item-name", text: styleProfile.label });
      body.createDiv({
        cls: "wp-theme-item-desc",
        text: styleProfile.description
      });
      if (styleProfile.id === currentStyleId) {
        const check = row.createEl("span", { cls: "wp-account-item-check" });
        this.appendIcon(check, "check", { size: 14 });
      }
      row.addEventListener("click", () => {
        void (async () => {
          await this.plugin.updateDefaultStyle(styleProfile.id);
          this.closeThemeMenu();
          await this.refresh();
        })();
      });
    }
  }
  updateThemePill() {
    if (!this.themePillNameEl) return;
    const resolvedId = this.plugin.resolveAccessibleThemeId(
      this.plugin.settings.defaultThemeId
    );
    const theme = this.plugin.themes.find((t4) => t4.id === resolvedId);
    const style3 = this.plugin.styleProfiles.find(
      (s2) => s2.id === this.plugin.settings.defaultStyleId
    );
    const themeLabel = theme?.label ?? "主题";
    const styleLabel = style3?.label ?? "排版";
    this.themePillNameEl.setText(themeLabel);
    this.themePillEl?.setAttr("title", `主题：${themeLabel} \xB7 排版：${styleLabel} \xB7 点击切换`);
  }
  openMoreMenu() {
    if (!this.moreMenuWrapEl) return;
    this.closeMoreMenu();
    this.moreMenuOpen = true;
    this.moreMenuEl = this.moreMenuWrapEl.createDiv({ cls: "wp-menu" });
    this.populateMoreMenu();
  }
  closeMoreMenu() {
    this.moreMenuOpen = false;
    this.moreMenuEl?.remove();
    this.moreMenuEl = null;
  }
  populateMoreMenu() {
    if (!this.moreMenuEl) return;
    this.moreMenuEl.empty();
    this.addMoreMenuItem("externalLink", "去公众号后台粘贴", null, () => {
      this.closeMoreMenu();
      this.plugin.openWechatPlatform();
    });
    this.moreMenuEl.createDiv({ cls: "wp-menu-sep" });
    this.addMoreMenuItem(
      "arrowLeftRight",
      "滚动同步",
      this.syncStatusLabel,
      () => {
        this.closeMoreMenu();
        this.toggleScrollSync();
      }
    );
    this.addMoreMenuItem("panelRight", "隐藏工具栏", null, () => {
      this.closeMoreMenu();
      this.setToolbarHidden(true);
    });
    this.moreMenuEl.createDiv({ cls: "wp-menu-sep" });
    this.addMoreMenuItem("user", "账号配置", null, () => {
      this.closeMoreMenu();
      this.plugin.openAccountConfigModal();
    });
    this.moreMenuEl.createDiv({ cls: "wp-menu-sep" });
    this.addMoreMenuItem("help", "用户指南", null, () => {
      this.closeMoreMenu();
      this.plugin.openExternalUrl("https://blog.discoverlabs.ac.cn/downloads/weixin-mp-publisher/");
    });
  }
  addMoreMenuItem(icon2, text6, meta3, onClick, metaVariant = null) {
    if (!this.moreMenuEl) return;
    const row = this.moreMenuEl.createDiv({ cls: "wp-menu-item" });
    const iconEl = row.createEl("span", { cls: "wp-menu-icon" });
    this.appendIcon(iconEl, icon2);
    row.createEl("span", { cls: "wp-menu-text", text: text6 });
    if (meta3) {
      const metaEl = row.createEl("span", { cls: "wp-menu-meta" });
      if (metaVariant === "badge") {
        metaEl.createEl("span", { cls: "wp-badge-warn", text: meta3 });
      } else {
        metaEl.setText(meta3);
      }
    }
    row.addEventListener("click", onClick);
  }
  // ============================================================
  // Drawer + toolbar hidden state
  // ============================================================
  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
    this.drawerEl?.toggleClass("open", this.drawerOpen);
    if (this.metaCaretEl) {
      this.metaCaretEl.empty();
      this.appendIcon(
        this.metaCaretEl,
        this.drawerOpen ? "chevronUp" : "chevronDown",
        { size: 12 }
      );
    }
  }
  setToolbarHidden(hidden) {
    this.toolbarHidden = hidden;
    if (hidden) {
      this.toolbarEl?.hide();
      this.drawerEl?.hide();
      this.toolbarHiddenHandleEl?.show();
      this.containerEl.addClass("weixin-mp-publisher-view--toolbar-hidden");
    } else {
      this.toolbarEl?.show();
      this.drawerEl?.show();
      this.toolbarHiddenHandleEl?.hide();
      this.containerEl.removeClass("weixin-mp-publisher-view--toolbar-hidden");
    }
  }
  // ============================================================
  // Scroll sync (preserved behavior)
  // ============================================================
  toggleScrollSync() {
    this.syncEnabled = !this.syncEnabled;
    if (this.syncEnabled) {
      this.syncStatusLabel = "同步中…";
      this.startScrollSync();
    } else {
      this.syncStatusLabel = "已关闭";
      this.stopScrollSync();
    }
  }
  /**
   * 计算元素相对于滚动容器顶部的偏移量（考虑滚动位置）
   */
  offsetInContainer(el, container2) {
    const elRect = el.getBoundingClientRect();
    const cRect = container2.getBoundingClientRect();
    return elRect.top - cRect.top + container2.scrollTop;
  }
  /**
   * 标题锚点同步：按标题分段，在段落内比例对齐。
   * 返回 true 表示成功；false 表示没有找到匹配标题，调用方应降级为纯比例。
   */
  syncByHeading(srcEl, tgtEl, srcSelector, tgtSelector) {
    const srcHeadings = Array.from(srcEl.querySelectorAll(srcSelector));
    const tgtHeadings = Array.from(tgtEl.querySelectorAll(tgtSelector));
    if (srcHeadings.length === 0 || tgtHeadings.length === 0) return false;
    const visibleTop = srcEl.scrollTop;
    let activeIdx = -1;
    for (let i3 = 0; i3 < srcHeadings.length; i3++) {
      if (this.offsetInContainer(srcHeadings[i3], srcEl) <= visibleTop + 30) {
        activeIdx = i3;
      } else {
        break;
      }
    }
    if (activeIdx < 0) {
      tgtEl.scrollTop = 0;
      return true;
    }
    const activeH = srcHeadings[activeIdx];
    const headingText = (activeH.textContent ?? "").replace(/^#+\s*/, "").trim().toLowerCase();
    const matchH = tgtHeadings.find(
      (h2) => (h2.textContent ?? "").trim().toLowerCase() === headingText
    );
    if (!matchH) return false;
    const srcSectionStart = this.offsetInContainer(activeH, srcEl);
    const srcSectionEnd = activeIdx + 1 < srcHeadings.length ? this.offsetInContainer(srcHeadings[activeIdx + 1], srcEl) : srcEl.scrollHeight;
    const progress2 = srcSectionEnd > srcSectionStart ? Math.max(
      0,
      Math.min(1, (visibleTop - srcSectionStart) / (srcSectionEnd - srcSectionStart))
    ) : 0;
    const tgtIdx = tgtHeadings.indexOf(matchH);
    const tgtSectionStart = this.offsetInContainer(matchH, tgtEl);
    const tgtSectionEnd = tgtIdx + 1 < tgtHeadings.length ? this.offsetInContainer(tgtHeadings[tgtIdx + 1], tgtEl) : tgtEl.scrollHeight;
    tgtEl.scrollTop = Math.max(
      0,
      tgtSectionStart + progress2 * (tgtSectionEnd - tgtSectionStart) - 16
    );
    return true;
  }
  startScrollSync() {
    this.syncStatusLabel = "请先滚动编辑器校准";
    const captureHandler = (e3) => {
      const target = e3.target;
      if (!target || target === document.documentElement || target === document.body) return;
      if (target === this.previewEl || this.previewEl?.contains(target)) return;
      if (target.scrollHeight <= target.clientHeight + 10) return;
      document.removeEventListener("scroll", captureHandler, true);
      this.editorScrollCaptureCleanup = null;
      this.editorScrollEl = target;
      this.syncStatusLabel = "已开启";
      this.onEditorScrollBound = () => {
        if (this.isSyncing || !this.previewEl || !this.syncEnabled || !this.editorScrollEl) return;
        this.isSyncing = true;
        try {
          const synced = this.syncByHeading(
            this.editorScrollEl,
            this.previewEl,
            '[class*="HyperMD-header"]',
            "h1,h2,h3,h4,h5,h6"
          );
          if (!synced) {
            const maxE = this.editorScrollEl.scrollHeight - this.editorScrollEl.clientHeight;
            const maxP = this.previewEl.scrollHeight - this.previewEl.clientHeight;
            if (maxE > 0 && maxP > 0) {
              this.previewEl.scrollTop = this.editorScrollEl.scrollTop / maxE * maxP;
            }
          }
        } catch (err) {
          console.error("[Sync E→P] error:", err);
        } finally {
          setTimeout(() => {
            this.isSyncing = false;
          }, 80);
        }
      };
      target.addEventListener("scroll", this.onEditorScrollBound);
    };
    document.addEventListener("scroll", captureHandler, { capture: true });
    this.editorScrollCaptureCleanup = () => {
      document.removeEventListener("scroll", captureHandler, true);
    };
    this.onPreviewScrollBound = () => {
      if (this.isSyncing || !this.previewEl || !this.syncEnabled || !this.editorScrollEl) return;
      this.isSyncing = true;
      try {
        const synced = this.syncByHeading(
          this.previewEl,
          this.editorScrollEl,
          "h1,h2,h3,h4,h5,h6",
          '[class*="HyperMD-header"]'
        );
        if (!synced) {
          const maxP = this.previewEl.scrollHeight - this.previewEl.clientHeight;
          const maxE = this.editorScrollEl.scrollHeight - this.editorScrollEl.clientHeight;
          if (maxP > 0 && maxE > 0) {
            this.editorScrollEl.scrollTop = this.previewEl.scrollTop / maxP * maxE;
          }
        }
      } catch (err) {
        console.error("[Sync P→E] error:", err);
      } finally {
        setTimeout(() => {
          this.isSyncing = false;
        }, 80);
      }
    };
    if (this.previewEl) {
      this.previewEl.addEventListener("scroll", this.onPreviewScrollBound);
    }
  }
  stopScrollSync() {
    this.editorScrollCaptureCleanup?.();
    this.editorScrollCaptureCleanup = null;
    if (this.syncRAF !== null) {
      cancelAnimationFrame(this.syncRAF);
      this.syncRAF = null;
    }
    if (this.previewEl && this.onPreviewScrollBound) {
      this.previewEl.removeEventListener("scroll", this.onPreviewScrollBound);
      this.onPreviewScrollBound = null;
    }
    if (this.editorScrollEl && this.onEditorScrollBound) {
      this.editorScrollEl.removeEventListener("scroll", this.onEditorScrollBound);
      this.onEditorScrollBound = null;
    }
    this.editorScrollEl = null;
  }
  // ============================================================
  // Refresh — data → DOM
  // ============================================================
  async refresh() {
    this.updateAccountPill();
    this.updateThemePill();
    this.updateMoreMenuBadge();
    if (!this.metaEl || !this.previewEl) return;
    const payload = await this.plugin.getRenderPayload(this.plugin.settings.defaultThemeId);
    this.previewEl.empty();
    if (!payload) {
      this.metaEl.setText("请先在主编辑区打开一篇 Markdown 笔记。");
      this.previewEl.createDiv({
        cls: "wp-empty",
        text: "当前没有可预览的 Markdown 文件。"
      });
      this.setMetaCardEmpty();
      return;
    }
    const publishMetaDraft = this.plugin.getPublishMetaDraft(payload.file, payload.frontmatter);
    if (this.titleInputEl) this.titleInputEl.value = publishMetaDraft.title;
    if (this.authorInputEl) this.authorInputEl.value = publishMetaDraft.author;
    if (this.coverInputEl) this.coverInputEl.value = publishMetaDraft.cover;
    this.metaEl.setText(
      `${payload.file.path} \xB7 主题 ${payload.theme.label} \xB7 排版 ${payload.styleProfile.label} \xB7 图片 ${payload.result.metadata.images.length} 张`
    );
    const articleEl = this.previewEl.createDiv({ cls: "wp-article" });
    articleEl.empty();
    const range = document.createRange();
    range.selectNode(articleEl);
    articleEl.appendChild(range.createContextualFragment(`${payload.result.html}`));
    this.updateMetaCard(publishMetaDraft);
  }
  setMetaCardEmpty() {
    if (this.metaTitleEl) {
      this.metaTitleEl.setText("未命名草稿");
      this.metaTitleEl.addClass("untitled");
    }
    if (this.metaSubEl) {
      this.metaSubEl.empty();
      this.metaSubEl.createEl("span", { text: "打开一篇笔记以开始" });
    }
    if (this.metaCoverEl) {
      this.metaCoverEl.empty();
      this.metaCoverEl.removeClass("has-image");
      this.metaCoverEl.addClass("empty");
      this.appendIcon(this.metaCoverEl, "image");
    }
  }
  updateMetaCard(draft) {
    const title2 = draft?.title ?? this.titleInputEl?.value ?? "";
    const author = draft?.author ?? this.authorInputEl?.value ?? "";
    const cover = draft?.cover ?? this.coverInputEl?.value ?? "";
    const trimmedTitle = title2.trim();
    if (this.metaTitleEl) {
      if (trimmedTitle) {
        this.metaTitleEl.setText(trimmedTitle);
        this.metaTitleEl.removeClass("untitled");
        this.metaTitleEl.setAttr("title", trimmedTitle);
      } else {
        this.metaTitleEl.setText("未命名草稿");
        this.metaTitleEl.addClass("untitled");
        this.metaTitleEl.removeAttribute("title");
      }
    }
    const coverSource = this.inferCoverSource(cover);
    if (this.metaSubEl) {
      this.metaSubEl.empty();
      this.metaSubEl.createEl("span", { text: author.trim() || "未署名" });
      this.metaSubEl.createEl("span", { cls: "sep", text: "\xB7" });
      const coverHint = coverSource === "account-default" ? "默认封面" : cover.trim() ? "封面已设置" : "无封面";
      this.metaSubEl.createEl("span", { text: coverHint });
      this.metaSubEl.createEl("span", { cls: "sep", text: "\xB7" });
      this.metaSubEl.createEl("span", {
        cls: "edit-hint",
        text: this.drawerOpen ? "收起 ↑" : "点击编辑 →"
      });
    }
    if (this.metaCoverEl) {
      this.renderCoverThumb(this.metaCoverEl, cover, 14);
    }
    if (this.coverThumbEl) {
      this.renderCoverThumb(this.coverThumbEl, cover, 24);
    }
  }
  inferCoverSource(cover) {
    const trimmed = cover.trim();
    if (!trimmed) return "none";
    const defaultCover = this.plugin.getPreferredAccountDefaultCover().trim();
    if (defaultCover && defaultCover === trimmed) return "account-default";
    return "explicit";
  }
  renderCoverThumb(el, coverPath, iconSize) {
    el.empty();
    const trimmed = coverPath.trim();
    if (!trimmed) {
      el.removeClass("has-image");
      el.addClass("empty");
      this.appendIcon(el, "image", { size: iconSize });
      return;
    }
    el.removeClass("empty");
    el.addClass("has-image");
    const src = this.resolveCoverSrc(trimmed);
    if (!src) {
      this.appendIcon(el, "image", { size: iconSize });
      return;
    }
    const img = document.createElement("img");
    img.src = src;
    img.alt = "cover";
    img.className = "wp-cover-img";
    img.addEventListener("error", () => {
      el.empty();
      el.removeClass("has-image");
      el.addClass("empty");
      this.appendIcon(el, "image", { size: iconSize });
    });
    el.appendChild(img);
  }
  resolveCoverSrc(path4) {
    if (/^https?:\/\//i.test(path4) || path4.startsWith("data:")) {
      return path4;
    }
    if (path4.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path4) || path4.startsWith("file://")) {
      return null;
    }
    const adapter2 = this.app.vault.adapter;
    try {
      const normalized = (0, import_obsidian4.normalizePath)(path4);
      if (typeof adapter2.getResourcePath !== "function") return null;
      let base = adapter2.getResourcePath(normalized);
      const abstract = this.app.vault.getAbstractFileByPath(normalized);
      const mtime = abstract instanceof import_obsidian4.TFile ? abstract.stat.mtime : 0;
      if (mtime && !base.includes("?")) base += "?t=" + mtime;
      return base;
    } catch (e3) {
      return null;
    }
  }
  // ============================================================
  // Accounts
  // ============================================================
  getAccountListItems() {
    const all = this.plugin.settings.accounts ?? [];
    return all.map((account) => {
      const hasCredentials = Boolean(account.appId.trim() && account.appSecret.trim());
      const status = hasCredentials ? "active" : "warn";
      const hint = hasCredentials ? "已就绪" : "未填写 AppID / AppSecret";
      return {
        account,
        status,
        hint,
        initial: this.getInitial(account.name)
      };
    });
  }
  updateAccountPill() {
    const current = this.plugin.getPreferredAccount();
    const all = this.plugin.settings.accounts ?? [];
    if (!this.accountPillEl || !this.accountPillStatusEl || !this.accountPillNameEl) return;
    if (all.length === 0) {
      this.accountPillStatusEl.className = "wp-account-status none";
      this.accountPillNameEl.setText("未配置账号");
      return;
    }
    if (!current) {
      this.accountPillStatusEl.className = "wp-account-status warn";
      this.accountPillNameEl.setText("未选择");
      return;
    }
    const hasCredentials = Boolean(current.appId.trim() && current.appSecret.trim());
    this.accountPillStatusEl.className = "wp-account-status " + (hasCredentials ? "active" : "warn");
    this.accountPillNameEl.setText(current.name || "未命名账号");
  }
  updateMoreMenuBadge() {
    if (!this.moreButtonEl) return;
    this.moreButtonEl.removeClass("has-badge");
  }
  getInitial(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return "?";
    return Array.from(trimmed)[0] ?? "?";
  }
  // ============================================================
  // Icon helpers
  // ============================================================
  appendIcon(container2, name, opts = {}) {
    const size4 = opts.size;
    const svg2 = document.createElementNS(SVG_NS, "svg");
    svg2.setAttribute("viewBox", "0 0 24 24");
    svg2.setAttribute("fill", "none");
    svg2.setAttribute("stroke", "currentColor");
    svg2.setAttribute("stroke-width", "1.8");
    svg2.setAttribute("stroke-linecap", "round");
    svg2.setAttribute("stroke-linejoin", "round");
    if (size4) {
      svg2.setAttribute("width", String(size4));
      svg2.setAttribute("height", String(size4));
    }
    const paths = ICON_PATHS[name] ?? [];
    for (const spec of paths) {
      const el = document.createElementNS(SVG_NS, spec.tag);
      for (const [k3, v3] of Object.entries(spec.attrs)) {
        el.setAttribute(k3, v3);
      }
      svg2.appendChild(el);
    }
    container2.appendChild(svg2);
    return svg2;
  }
};
const ICON_PATHS = {
  send: [
    { tag: "path", attrs: { d: "M22 2L11 13" } },
    { tag: "path", attrs: { d: "M22 2L15 22L11 13L2 9L22 2Z" } }
  ],
  refresh: [
    { tag: "path", attrs: { d: "M3 12a9 9 0 0 1 15.3-6.4L21 8" } },
    { tag: "path", attrs: { d: "M21 3v5h-5" } },
    { tag: "path", attrs: { d: "M21 12a9 9 0 0 1-15.3 6.4L3 16" } },
    { tag: "path", attrs: { d: "M3 21v-5h5" } }
  ],
  copy: [
    { tag: "rect", attrs: { x: "9", y: "9", width: "12", height: "12", rx: "2" } },
    {
      tag: "path",
      attrs: { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }
    }
  ],
  more: [
    { tag: "circle", attrs: { cx: "5", cy: "12", r: "1.3" } },
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "1.3" } },
    { tag: "circle", attrs: { cx: "19", cy: "12", r: "1.3" } }
  ],
  chevronDown: [{ tag: "path", attrs: { d: "M6 9l6 6 6-6" } }],
  chevronUp: [{ tag: "path", attrs: { d: "M6 15l6-6 6 6" } }],
  externalLink: [
    { tag: "path", attrs: { d: "M15 3h6v6" } },
    { tag: "path", attrs: { d: "M10 14L21 3" } },
    {
      tag: "path",
      attrs: { d: "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" }
    }
  ],
  type: [
    { tag: "path", attrs: { d: "M4 7V5h16v2" } },
    { tag: "path", attrs: { d: "M9 20h6" } },
    { tag: "path", attrs: { d: "M12 5v15" } }
  ],
  user: [
    { tag: "path", attrs: { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" } },
    { tag: "circle", attrs: { cx: "12", cy: "7", r: "4" } }
  ],
  key: [
    {
      tag: "path",
      attrs: {
        d: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15 8m0 0l3 3m-3-3l2-2"
      }
    }
  ],
  help: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
    { tag: "path", attrs: { d: "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" } },
    {
      tag: "circle",
      attrs: { cx: "12", cy: "17", r: "0.6", fill: "currentColor", stroke: "none" }
    }
  ],
  panelRight: [
    { tag: "rect", attrs: { x: "3", y: "3", width: "18", height: "18", rx: "2" } },
    { tag: "path", attrs: { d: "M15 3v18" } }
  ],
  arrowLeftRight: [
    { tag: "path", attrs: { d: "M8 3L4 7l4 4" } },
    { tag: "path", attrs: { d: "M4 7h16" } },
    { tag: "path", attrs: { d: "M16 21l4-4-4-4" } },
    { tag: "path", attrs: { d: "M20 17H4" } }
  ],
  image: [
    { tag: "rect", attrs: { x: "3", y: "3", width: "18", height: "18", rx: "2" } },
    { tag: "circle", attrs: { cx: "8.5", cy: "8.5", r: "1.5" } },
    { tag: "path", attrs: { d: "M21 15l-5-5L5 21" } }
  ],
  check: [{ tag: "path", attrs: { d: "M20 6L9 17l-5-5" } }],
  plus: [{ tag: "path", attrs: { d: "M12 5v14M5 12h14" } }]
};

