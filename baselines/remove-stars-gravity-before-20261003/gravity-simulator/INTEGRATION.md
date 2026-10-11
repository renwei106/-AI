# 星体 scene integration

Pinned upstream: see UPSTREAM.json. MIT license is retained in LICENSE and the
distributed gravity-LICENSE.txt. Upstream src/ files are unmodified.

The fourth scene (`gravity`) additionally installs the local `periodic.ts`
adapter. It uses minimum-image toroidal distances for forces and field samples,
opens Barnes-Hut cells crossing an image discontinuity, and resolves swept seam
contacts in a common local chart before conserving merge mass/momentum. Other
scenes retain the upstream non-periodic solver. The canvas renderer clips to the
fixed world rectangle and renders edge-straddling copies without duplicating
physical bodies. Rebuild the bundle after changing this adapter.

Run `node vendor/gravity-simulator/build.cjs` from the navigation repository.
The build uses the sibling admin project's installed Vite/esbuild dependency.
Physics and the unmodified upstream Renderer are bundled. A small Canvas2D
bridge implements its drawing calls; p5 itself and the original interface are
not bundled. The stars adapter is dist/assets/emergence/stars-engine.js.

Physics: upstream Verlet with adaptive substeps, Barnes–Hut for larger populations,
contact merging with conserved mass and momentum. G=0.5 simulation units.
Width=240 simulation length units, base dust speed=0.15–0.35 units/time,
mass=0.35–0.65 simulation mass units. These are toy units, not SI or light years.
Playback 1× advances 3 simulated time units per wall-clock second; CPU work is
bounded per frame, so heavily loaded devices may run below the requested rate.

Initial population=600; subsequent finite reserve=400 (8 released per 3 simulated
time units). At most 1200 active bodies. Merges do not replenish the reserve.
Restart resets the budget; pause freezes supply as well as movement.

Visual tier mass thresholds: dust 0, fragment 2, rock 8, asteroid 16, planet 32,
galaxy source 128, black hole 384. Tier names and radii are theme abstractions;
they do not change the upstream force law or impose orbital systems.

This scene is 2D. Existing birds/cosmos engines and their parameters are unchanged.

## Independent 引力 scene

gravity-engine.js uses the same unmodified physics plus upstream Renderer,
VectorField, streamlines and contours. gravity-canvas.js adapts drawing calls
to the existing theme canvas. The renderer background is transparent to preserve
the page theme; force/velocity arrows and labels have separate visibility gates.
No mass tiers, injected drag or altered collision law. Size follows upstream
radiusForMass, and merging conserves both mass and momentum.

Opening: 3 visible seconds charging, then a finite 400-body dust budget emitted
radially over 2.5 seconds. Dust mass 0.1–0.4, speed 5–12 simulation units/time;
G=0.5, viewport width=1000 simulation length units, 1× playback=6 units/time per
wall-clock second. Initial velocities are never reset after emission. No automatic
replenishment. Manual drag uses upstream's 0.05 displacement-to-velocity factor.
Ctrl/middle drag pans, wheel zooms around the cursor. CPU stepping is budgeted;
field sampling refreshes at most 5 times/sec while rendering stays per frame.
The original project is 2D only; no invented 3D projection is presented as physics.
