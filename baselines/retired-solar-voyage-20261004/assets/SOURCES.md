# 逐光星旅 / SOLAR VOYAGE

Independent implementation, added 2026-10-04. Does not import, replace or alter the existing cosmos, globe or emergence scenes. No GRAVITY source code copied. Its solar-system preset was a conceptual reference; this renderer uses Canvas sphere projection and analytical orbits, not an editable N-body simulation.

## Data
- Planetary J2000 elements: https://ssd.jpl.nasa.gov/planets/approx_pos.html (Table 1).
- Planetary mean radii / periods: https://ssd.jpl.nasa.gov/planets/phys_par.html
- Satellite mean elements: https://ssd.jpl.nasa.gov/sats/elem/ (snapshot 2026-10-04).
- Satellite discovery catalog: https://ssd.jpl.nasa.gov/sats/discovery.html
- Major moon radii: https://ssd.jpl.nasa.gov/sats/phys_par/
- Main asteroid belt: https://science.nasa.gov/solar-system/asteroids/facts/
- Kuiper belt: https://science.nasa.gov/solar-system/kuiper-belt/facts/
- Earth texture reuses the project's NASA Blue Marble asset. Its original provenance is retained in assets/earth/SOURCE.txt. Other body surfaces are procedural illustrations, not spacecraft photography.

## Scope and conventions
Positions use Kepler's equation with the J2000 mean elements, not present-day precision ephemerides. The century secular rates are not applied for this illustrative loop. Satellite phase is illustrative when the source epoch is not J2000. Laplace-plane pole RA/Dec are transformed from equatorial to ecliptic coordinates. Satellite counts shown in the view count only usable mean-orbit records in this snapshot; they are not asserted to be the latest discovery total.

Planet orbital semimajor axes are compressed logarithmically while retaining each ellipse's eccentricity, orbital plane and phase. Planet apparent radii use an explicit monotonic power mapping; Sun is independently compressed. Physical distances and body diameters cannot share a single readable full-screen scale. Focus uses a local satellite distance scale, physical major-moon/parent size ratios with a 2.2 px visibility floor, and a small Earth-Moon barycentre offset. Unknown small-moon sizes are marker points rather than invented physical radii. Belts are deterministic illustrative particle samples, not individual asteroid ephemerides.

The overview clock advances 3.5 simulated days per second. Focus smoothly slows the single shared clock to at most 0.3 day/s, or one innermost moon period per 35 seconds, whichever is slower. Returning smoothly restores the overview clock without resetting phases. This automatic viewing treatment exposes no user speed controls. Galactic travel is suggested by background drift and short translated trails, not a literal measurement of the Sun's galactic orbit.

## Integration
Theme ID: solarVoyage. Registration: solar-voyage.js. Backend resources.json and shiyu-feature-config.ts provide the catalog, availability, naming and existing membership policies. Local direct preview is /preview/solar-voyage; its fixture exists under checks and is not part of the release assets.
