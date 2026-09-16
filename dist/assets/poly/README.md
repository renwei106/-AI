# 棱光拾景 assets

- `delaunator.min.js`: Delaunator 5.0.1, vendored browser UMD build from https://unpkg.com/delaunator@5.0.1/delaunator.min.js
- Upstream: https://github.com/mapbox/delaunator
- License: `LICENSE-delaunator.txt` (ISC).
- Preset artwork is generated as SVG by `poly-theme.js`; no external image service is used.
- Uploaded raster images are decoded and resized locally, converted by `poly-worker.js` / `poly-engine.js`, and stored with their generated SVG in IndexedDB (`shiyu-local-art`, key `poly-cover`). Neither the source image nor the SVG is added to account preferences or sent to an API.
- `file://` environments that block Workers use the same bundled conversion function on the main thread.
