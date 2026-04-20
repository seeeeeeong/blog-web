export const PAGINATION = {
  POSTS_PER_PAGE: 10,
  ADMIN_POSTS_PER_PAGE: 20,
  POPULAR_POSTS_LIMIT: 5,
} as const;

export const POST_LIMITS = {
  TITLE_MAX_LENGTH: 200,
} as const;

export const COMMENT_LIMITS = {
  CONTENT_MAX_LENGTH: 1000,
} as const;

export const IMAGE_UPLOAD = {
  MAX_SIZE_MB: 1,
  MAX_WIDTH_OR_HEIGHT: 1920,
  USE_WEB_WORKER: true,
  FALLBACK_CONTENT_TYPE: "image/png",
} as const;

export const ALERT_DURATION = {
  SUCCESS: 2500,
  ERROR: 3000,
  WARNING: 3000,
  INFO: 2500,
} as const;

export const TABLE_DEFAULTS = {
  ROWS: 3,
  COLS: 3,
  MAX: 20,
  MIN: 1,
} as const;

export const CHAT_LIMITS = {
  QUESTION_MAX_LENGTH: 500,
  MAX_MESSAGES_PER_SESSION: 30,
} as const;
