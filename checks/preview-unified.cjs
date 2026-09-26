// Canonical review for the combined home interactions and paper memo UI.
// All assets come directly from ../dist; no generated copy or online writes.
process.env.PORT=String(Number(process.env.SHIYU_REVIEW_PORT)||4337);
process.env.HOST='127.0.0.1';
process.env.SHIYU_PREVIEW_REVIEW='1';
require('../preview.cjs');
