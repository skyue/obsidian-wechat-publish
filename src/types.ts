var DRAFT_RECORD_RETENTION_DAYS = 14;
var DRAFT_RECORD_LIMIT = 200;
var COVER_MEDIA_RECORD_RETENTION_DAYS = 365;
var COVER_MEDIA_RECORD_LIMIT = 500;
var DEFAULT_SETTINGS = {
  defaultThemeId: "classic",
  defaultStyleId: "balanced",
  styleOverrides: {
    fontPreset: "sans",
    textAlign: "left",
    paragraphIndent: false,
    figureCaptionMode: "none"
  },
  preferredAccountId: null,
  accounts: [],
  savedStylePresets: [],
  draftRecords: [],
  coverMediaRecords: [],
  entitlements: createEntitlementsForPlan("free")
};
function createEmptyAccount() {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `account-${Date.now()}`,
    name: "新账号",
    appId: "",
    appSecret: "",
    apiKey: "",
    defaultAuthor: "",
    defaultCoverPath: "",
    licenseCode: "",
    licenseToken: "",
    licenseId: "",
    licensePlan: "free",
    licenseStatus: "inactive",
    licenseCodeMasked: "",
    licenseBoundAppId: "",
    licenseActivatedAt: null,
    licenseLastValidatedAt: null
  };
}
function createStylePresetId() {
  return globalThis.crypto?.randomUUID?.() ?? `style-preset-${Date.now()}`;
}
function cloneStyleOverrides(styleOverrides) {
  return { ...styleOverrides };
}
function normalizePublisherAccount(account) {
  return {
    ...createEmptyAccount(),
    ...account ?? {},
    id: typeof account?.id === "string" && account.id.trim() ? account.id : globalThis.crypto?.randomUUID?.() ?? `account-${Date.now()}`,
    name: typeof account?.name === "string" && account.name.trim() ? account.name : "未命名账号",
    appId: typeof account?.appId === "string" ? account.appId : "",
    appSecret: typeof account?.appSecret === "string" ? account.appSecret : "",
    apiKey: typeof account?.apiKey === "string" ? account.apiKey : "",
    defaultAuthor: typeof account?.defaultAuthor === "string" ? account.defaultAuthor : "",
    defaultCoverPath: typeof account?.defaultCoverPath === "string" ? account.defaultCoverPath : "",
    licenseCode: typeof account?.licenseCode === "string" ? account.licenseCode : "",
    licenseToken: typeof account?.licenseToken === "string" ? account.licenseToken : "",
    licenseId: typeof account?.licenseId === "string" ? account.licenseId : "",
    licensePlan: account?.licensePlan === "pro" ? "pro" : "free",
    licenseStatus: account?.licenseStatus === "active" || account?.licenseStatus === "expired" || account?.licenseStatus === "revoked" ? account.licenseStatus : "inactive",
    licenseCodeMasked: typeof account?.licenseCodeMasked === "string" ? account.licenseCodeMasked : "",
    licenseBoundAppId: typeof account?.licenseBoundAppId === "string" ? account.licenseBoundAppId : "",
    licenseActivatedAt: typeof account?.licenseActivatedAt === "string" ? account.licenseActivatedAt : null,
    licenseLastValidatedAt: typeof account?.licenseLastValidatedAt === "string" ? account.licenseLastValidatedAt : null
  };
}
function cloneDraftRecords(draftRecords) {
  const normalizedRecords = Array.isArray(draftRecords) ? draftRecords.filter(
    (record) => Boolean(record?.notePath && record?.accountId && record?.mediaId)
  ).map((record) => ({
    notePath: String(record.notePath),
    accountId: String(record.accountId),
    mediaId: String(record.mediaId),
    title: typeof record.title === "string" ? record.title : "",
    updatedAt: typeof record.updatedAt === "string" && record.updatedAt ? record.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
  })) : [];
  return pruneDraftRecords(normalizedRecords);
}
function cloneCoverMediaRecords(coverMediaRecords) {
  const normalizedRecords = Array.isArray(coverMediaRecords) ? coverMediaRecords.filter(
    (record) => Boolean(record?.accountId && record?.sourceKey && record?.mediaId)
  ).map((record) => ({
    accountId: String(record.accountId),
    sourceKey: String(record.sourceKey),
    mediaId: String(record.mediaId),
    updatedAt: typeof record.updatedAt === "string" && record.updatedAt ? record.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
  })) : [];
  return pruneCoverMediaRecords(normalizedRecords);
}
function pruneDraftRecords(draftRecords) {
  const cutoffTime = Date.now() - DRAFT_RECORD_RETENTION_DAYS * 24 * 60 * 60 * 1e3;
  return draftRecords.filter((record) => {
    const updatedAtTime = new Date(record.updatedAt).getTime();
    return Number.isFinite(updatedAtTime) && updatedAtTime >= cutoffTime;
  }).sort((left3, right3) => {
    return new Date(right3.updatedAt).getTime() - new Date(left3.updatedAt).getTime();
  }).slice(0, DRAFT_RECORD_LIMIT);
}
function pruneCoverMediaRecords(coverMediaRecords) {
  const cutoffTime = Date.now() - COVER_MEDIA_RECORD_RETENTION_DAYS * 24 * 60 * 60 * 1e3;
  return coverMediaRecords.filter((record) => {
    const updatedAtTime = new Date(record.updatedAt).getTime();
    return Number.isFinite(updatedAtTime) && updatedAtTime >= cutoffTime;
  }).sort((left3, right3) => {
    return new Date(right3.updatedAt).getTime() - new Date(left3.updatedAt).getTime();
  }).slice(0, COVER_MEDIA_RECORD_LIMIT);
}

