# 引力模式

Independent `accretion` scene; existing flock/cosmos engines and saved settings are unchanged.

Physics source: https://github.com/Dimitriuses/gravity-simulator, pinned commit
74d04421fb5f260393e43bae4a360909ce0bd774. MIT license and provenance are retained in vendor/.
gravity-core.js is the previously built bundle, including our periodic boundary adapter;
its upstream force law, adaptive velocity Verlet and collision merger are reused unchanged.
The new renderer uses the current theme palette rather than the upstream interface.

World width is 700 toy length units; aspect ratio matches the full viewport.
All newborns have mass 0.2. Opening charge lasts 1.2 simulated seconds, followed
by 2.2 seconds of launches at speeds 18–83. Gravity is 120 × the configured factor.
Simulation advances three physics time units per scene second. These are illustrative
units and initial conditions, not a cosmological Big Bang model or SI measurements.

Opposite edges connect for forces, swept contacts and drawing. Mouse clicks and drags
never create particles. Pause freezes both motion and replenishment; restart resets both.
The count slider controls the minimum-mass population target (100–1000), not total
population including grown bodies. After the opening, random births restore that target
gradually at max(12, target × 0.16) per scene second. Births avoid existing physical
surfaces and have random initial velocities. Injection intentionally adds mass to the
open system; between injections mergers conserve mass and momentum. Continuous
injection can keep growing accumulated stars; no hidden mass deletion is applied.

Physics runs in a module Web Worker, with at most one step in flight. The main
thread interpolates periodic positions between snapshots. Steps use a bounded
1/60 scene second multiplied by the existing speed control; under heavy load
simulation time can advance more slowly instead of accumulating catch-up steps.
Gravity, masses, contact surfaces and the upstream integrator are unchanged.
