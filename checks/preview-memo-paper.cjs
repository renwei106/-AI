// Review the actual home → 我的一隅 → 我的小记 flow, including its shared
// close entry, theme cords, login and account persistence. No standalone UI.
// Retain the old origin and its browser storage, using the unified config.
process.env.SHIYU_REVIEW_PORT=String(Number(process.env.MEMO_PREVIEW_PORT)||4330);
require('./preview-unified.cjs');
