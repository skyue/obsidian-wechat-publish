import { App, TFile } from 'obsidian';
import { createEntitlementsForPlan } from '../packages/shared-types/src/index.ts';

/** JSON shape returned by WeChat API endpoints — all carry optional errcode/errmsg. */
export interface WechatApiJson {
  errcode?: number;
  errmsg?: string;
  [key: string]: unknown;
}

const DRAFT_RECORD_RETENTION_DAYS = 14;
const DRAFT_RECORD_LIMIT = 200;
const COVER_MEDIA_RECORD_RETENTION_DAYS = 365;
const COVER_MEDIA_RECORD_LIMIT = 500;
const ARTICLE_IMAGE_RECORD_RETENTION_DAYS = 365;
const ARTICLE_IMAGE_RECORD_LIMIT = 2000;
export const DEFAULT_SETTINGS = {
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
  articleImageRecords: [],
  entitlements: createEntitlementsForPlan("free")
};
export function createEmptyAccount() {
  return {
    id: window.crypto?.randomUUID?.() ?? `account-${Date.now()}`,
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
export function createStylePresetId() {
  return window.crypto?.randomUUID?.() ?? `style-preset-${Date.now()}`;
}
export function cloneStyleOverrides(styleOverrides: StyleOverrides): StyleOverrides {
  return { ...styleOverrides };
}
export function normalizePublisherAccount(account: Partial<PublisherAccount> | null | undefined): PublisherAccount {
  return {
    ...createEmptyAccount(),
    ...account ?? {},
    id: typeof account?.id === "string" && account.id.trim() ? account.id : window.crypto?.randomUUID?.() ?? `account-${Date.now()}`,
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
export function cloneDraftRecords(draftRecords: unknown): DraftRecord[] {
  if (!Array.isArray(draftRecords)) return [];
  const normalizedRecords = (draftRecords as Array<Record<string, unknown>>).filter(
    (record) => Boolean(record.notePath && record.accountId && record.mediaId)
  ).map((record) => ({
    notePath: typeof record.notePath === 'string' ? record.notePath : '',
    accountId: typeof record.accountId === 'string' ? record.accountId : '',
    mediaId: typeof record.mediaId === 'string' ? record.mediaId : '',
    title: typeof record.title === "string" ? record.title : "",
    updatedAt: typeof record.updatedAt === "string" && record.updatedAt ? record.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
  }));
  return pruneDraftRecords(normalizedRecords);
}
export function cloneCoverMediaRecords(coverMediaRecords: unknown): CoverMediaRecord[] {
  if (!Array.isArray(coverMediaRecords)) return [];
  const normalizedRecords = (coverMediaRecords as Array<Record<string, unknown>>).filter(
    (record) => Boolean(record.accountId && record.sourceKey && record.mediaId)
  ).map((record) => ({
    accountId: typeof record.accountId === 'string' ? record.accountId : '',
    sourceKey: typeof record.sourceKey === 'string' ? record.sourceKey : '',
    mediaId: typeof record.mediaId === 'string' ? record.mediaId : '',
    updatedAt: typeof record.updatedAt === "string" && record.updatedAt ? record.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
  }));
  return pruneCoverMediaRecords(normalizedRecords);
}
export function pruneDraftRecords(draftRecords: DraftRecord[]): DraftRecord[] {
  const cutoffTime = Date.now() - DRAFT_RECORD_RETENTION_DAYS * 24 * 60 * 60 * 1e3;
  return draftRecords.filter((record) => {
    const updatedAtTime = new Date(record.updatedAt).getTime();
    return Number.isFinite(updatedAtTime) && updatedAtTime >= cutoffTime;
  }).sort((left3, right3) => {
    return new Date(right3.updatedAt).getTime() - new Date(left3.updatedAt).getTime();
  }).slice(0, DRAFT_RECORD_LIMIT);
}
export function pruneCoverMediaRecords(coverMediaRecords: CoverMediaRecord[]): CoverMediaRecord[] {
  const cutoffTime = Date.now() - COVER_MEDIA_RECORD_RETENTION_DAYS * 24 * 60 * 60 * 1e3;
  return coverMediaRecords.filter((record) => {
    const updatedAtTime = new Date(record.updatedAt).getTime();
    return Number.isFinite(updatedAtTime) && updatedAtTime >= cutoffTime;
  }).sort((left3, right3) => {
    return new Date(right3.updatedAt).getTime() - new Date(left3.updatedAt).getTime();
  }).slice(0, COVER_MEDIA_RECORD_LIMIT);
}
export function cloneArticleImageRecords(articleImageRecords: unknown): ArticleImageRecord[] {
  if (!Array.isArray(articleImageRecords)) return [];
  const normalizedRecords = (articleImageRecords as Array<Record<string, unknown>>).filter(
    (record) => Boolean(record.accountId && record.sourceKey && record.url)
  ).map((record) => ({
    accountId: typeof record.accountId === 'string' ? record.accountId : '',
    sourceKey: typeof record.sourceKey === 'string' ? record.sourceKey : '',
    url: typeof record.url === 'string' ? record.url : '',
    updatedAt: typeof record.updatedAt === "string" && record.updatedAt ? record.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
  }));
  return pruneArticleImageRecords(normalizedRecords);
}
export function pruneArticleImageRecords(articleImageRecords: ArticleImageRecord[]): ArticleImageRecord[] {
  const cutoffTime = Date.now() - ARTICLE_IMAGE_RECORD_RETENTION_DAYS * 24 * 60 * 60 * 1e3;
  return articleImageRecords.filter((record) => {
    const updatedAtTime = new Date(record.updatedAt).getTime();
    return Number.isFinite(updatedAtTime) && updatedAtTime >= cutoffTime;
  }).sort((left3, right3) => {
    return new Date(right3.updatedAt).getTime() - new Date(left3.updatedAt).getTime();
  }).slice(0, ARTICLE_IMAGE_RECORD_LIMIT);
}

// TypeScript type definitions for lint compliance
export interface PublisherAccount {
  id: string;
  name: string;
  appId: string;
  appSecret: string;
  apiKey?: string;
  defaultAuthor?: string;
  defaultCoverPath?: string;
  licenseCode?: string;
  licenseToken?: string;
  licenseId?: string;
  licensePlan?: string;
  licenseStatus?: string;
  licenseCodeMasked?: string;
  licenseBoundAppId?: string;
  licenseActivatedAt?: string | null;
  licenseLastValidatedAt?: string | null;
}

export interface DraftRecord {
  notePath: string;
  accountId: string;
  mediaId: string;
  title: string;
  updatedAt: string;
}

export interface CoverMediaRecord {
  accountId: string;
  sourceKey: string;
  mediaId: string;
  updatedAt: string;
}

export interface ArticleImageRecord {
  accountId: string;
  sourceKey: string;
  url: string;
  updatedAt: string;
}

export interface StyleOverrides {
  fontPreset: string;
  textAlign: string;
  paragraphIndent: boolean;
  figureCaptionMode: string;
  [key: string]: string | boolean | undefined;
}

export interface StylePreset {
  id: string;
  name: string;
  styleOverrides: StyleOverrides;
}

export interface Entitlements {
  enabled: Record<string, boolean>;
}

export interface PublisherSettings {
  defaultThemeId: string;
  defaultStyleId: string;
  styleOverrides: StyleOverrides;
  preferredAccountId: string | null;
  accounts: PublisherAccount[];
  savedStylePresets: StylePreset[];
  draftRecords: DraftRecord[];
  coverMediaRecords: CoverMediaRecord[];
  articleImageRecords: ArticleImageRecord[];
  entitlements: Entitlements;
}

export interface ImageAsset {
  bytes: Uint8Array;
  contentType: string;
  filename: string;
  sourceUrl?: string;
  filePath?: string;
}

export interface HtmlImageRef {
  src: string;
  originalSource?: string;
}

export interface ParsedDataUrl {
  mimeType: string;
  data: string;
  isBase64: boolean;
}

export interface RehostResult {
  html: string;
  imageCount: number;
  articleImageRecords: ArticleImageRecord[];
}

export interface PublishInput {
  app: App;
  account: PublisherAccount;
  file: TFile;
  html: string;
  frontmatter: Record<string, unknown>;
  existingDraftMediaId: string | null;
  coverMediaRecords: CoverMediaRecord[];
  articleImageRecords: ArticleImageRecord[];
  onProgress?: (message: string) => void;
}

export interface PublishResult {
  mediaId: string;
  title: string;
  imageCount: number;
  action: string;
  coverMediaRecord?: CoverMediaRecord;
  articleImageRecords?: ArticleImageRecord[];
}

