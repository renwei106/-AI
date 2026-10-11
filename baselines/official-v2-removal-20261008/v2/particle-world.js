/* Seven connected particle forms. All illustration is drawn locally. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const radii = [.29, .45, .63, .82, 1.08, 1.40, 1.73, 2.05];
  const angles = [-.6, 2.2, 4.1, .4, 2.85, 5.2, 3.6, .9];
  const sizes = [.025, .036, .04, .032, .095, .076, .056, .052];
  const solarTilt = -.13;
  const smoothstep = (a, b, value) => {
    const t = Math.min(1, Math.max(0, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function orbitPoint(radius, angle) {
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius * .34;
    return [x * Math.cos(solarTilt) - y * Math.sin(solarTilt), x * Math.sin(solarTilt) + y * Math.cos(solarTilt), Math.sin(angle) * radius * .28];
  }
  function moonOffset(angle) {
    const x = Math.cos(angle) * .09, y = Math.sin(angle) * .045;
    return [x * Math.cos(solarTilt) - y * Math.sin(solarTilt), x * Math.sin(solarTilt) + y * Math.cos(solarTilt), Math.sin(angle) * .035];
  }
  function atomPoint(orbit, radius, angle) {
    let x = Math.cos(angle) * radius, y = Math.sin(angle) * radius * .56, z = Math.sin(angle) * radius * .18;
    const tilt = orbit === 0 ? 0 : orbit === 1 ? 1.02 : -1.02;
    const nextX = x * Math.cos(tilt) - y * Math.sin(tilt);
    y = x * Math.sin(tilt) + y * Math.cos(tilt); x = nextX;
    if (orbit === 1) z *= -1;
    return [x, y, z];
  }
  function rotateAxis(point, axis, angle) {
    const [x, y, z] = point, [ax, ay, az] = axis;
    const cs = Math.cos(angle), sn = Math.sin(angle), dot = x * ax + y * ay + z * az;
    return [
      x * cs + (ay * z - az * y) * sn + ax * dot * (1 - cs),
      y * cs + (az * x - ax * z) * sn + ay * dot * (1 - cs),
      z * cs + (ax * y - ay * x) * sn + az * dot * (1 - cs)
    ];
  }

  function landMask() {
    const map = document.createElement('canvas'); map.width = 1024; map.height = 512;
    const ctx = map.getContext('2d', { willReadFrequently: true });
    if (!ctx) return () => false;
    ctx.fillStyle = '#fff';
    for (const polygon of window.SHIYU_LAND || []) {
      ctx.beginPath();
      for (const ring of polygon) ring.forEach(([lon, lat], index) => {
        const x = (lon + 180) / 360 * 1024, y = (90 - lat) / 180 * 512;
        if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.fill('evenodd');
    }
    const pixels = ctx.getImageData(0, 0, 1024, 512).data;
    return (lon, lat) => {
      const x = Math.max(0, Math.min(1023, Math.floor((lon + 180) / 360 * 1024)));
      const y = Math.max(0, Math.min(511, Math.floor((90 - lat) / 180 * 512)));
      return pixels[(y * 1024 + x) * 4 + 3] > 100;
    };
  }

  function buildForms(total) {
    let state = 170919;
    const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    const seeds = new Float32Array(total * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = random();
    const forms = Array.from({ length: 7 }, () => ({ position: new Float32Array(total * 4), color: new Float32Array(total * 4) }));
    const solarMeta = new Float32Array(total * 4);
    const atomMeta = new Float32Array(total * 4);
    const onLand = landMask();
    function put(stage, i, x, y, z, alpha, r, g, b, size = 1.3) {
      const offset = i * 4;
      forms[stage].position.set([x, y, z, alpha], offset);
      forms[stage].color.set([r, g, b, size], offset);
    }
    for (let i = 0; i < total; i++) {
      const offset = i * 4;
      const a = seeds[offset], b = seeds[offset + 1], c = seeds[offset + 2], d = seeds[offset + 3];
      const phi = b * TAU, sy = 1 - 2 * c, sr = Math.sqrt(1 - sy * sy);
      const sx = Math.cos(phi) * sr, sz = Math.sin(phi) * sr;
      if (i >= total * .965) {
        for (let stage = 0; stage < 7; stage++) put(stage, i, (a - .5) * 5.8, (b - .5) * 3.3, -.4, .07 + c * .16, .62, .72, .66, .55 + d * .65);
        continue;
      }
      const tiny = .0035 * Math.sqrt(b);
      put(0, i, Math.cos(phi) * tiny, Math.sin(phi) * tiny, 0, .005, .97, .87, .66, 1);

      // A living musical phrase: five flowing staff lines and five clear notes.
      let mx, my, mz, musicAlpha, musicSize;
      if (a < .65) {
        const line = Math.min(4, Math.floor(a / .65 * 5));
        mx = (b - .5) * 4.05;
        my = (line - 2) * .13 + Math.sin(mx * 1.35 + line * .34) * .075;
        mz = (c - .5) * .055;
        musicAlpha = .20 + d * .31; musicSize = .9 + d * .65;
      } else {
        const notes = [[-1.46,.03],[-.76,.23],[-.08,-.12],[.65,.18],[1.38,-.02]];
        const note = Math.min(4, Math.floor((a - .65) / .315 * 5));
        const [nx, ny] = notes[note];
        const part = ((a - .65) / .315 * 5) - note;
        if (part < .58) {
          const angle = b * TAU, radius = Math.sqrt(c);
          mx = nx + Math.cos(angle) * .105 * radius;
          my = ny + Math.sin(angle) * .067 * radius;
        } else if (part < .87) {
          mx = nx + .095 + (c - .5) * .018;
          my = ny + b * .42;
        } else {
          const curve = b;
          mx = nx + .095 + curve * .22;
          my = ny + .42 - curve * .19 + Math.sin(curve * Math.PI) * .08;
        }
        mz = (d - .5) * .045;
        musicAlpha = .34 + c * .42; musicSize = 1.25 + d * .85;
      }
      put(1, i, mx, my, mz, musicAlpha, .70 + c * .17, .80 + c * .12, .68 + c * .17, musicSize);

      // Seventeen separate gulls in a loose V, each built from small points.
      const bird = Math.floor(a * 17), rank = Math.ceil(bird / 2) / 8;
      const side = bird === 0 ? 0 : bird % 2 ? -1 : 1;
      const bx = side * rank * 1.82, by = rank * .76 - .30;
      const wing = (b - .5) * 2;
      const span = .115 - rank * .027;
      let lx, ly;
      if (c < .14) {
        lx = (b - .5) * .012;
        ly = (c / .14 - .5) * .077;
      } else {
        lx = wing * span;
        ly = Math.sin(Math.abs(wing) * Math.PI) * .034 - Math.abs(wing) * .016 + (d - .5) * .018 * (1 - Math.abs(wing));
      }
      put(2, i, bx + lx, by + ly, Math.sin(bird * 1.7) * .06, .085 + d * .075, .76 + c * .14, .78 + c * .12, .63 + c * .13, .8 + d * .7);

      // The globe uses real coastline geometry, with faint parallels/meridians.
      let lat = Math.asin(1 - 2 * a), lon = b * TAU - Math.PI;
      const wire = d < .115;
      if (wire) {
        if (c < .5) lat = Math.round(lat / (Math.PI / 12)) * Math.PI / 12;
        else lon = Math.round(lon / (Math.PI / 9)) * Math.PI / 9;
      }
      const land = onLand(lon * 180 / Math.PI, lat * 180 / Math.PI);
      const lonView = lon - .48, radius = .81;
      const gx = radius * Math.cos(lat) * Math.sin(lonView);
      const gy = radius * Math.sin(lat), gz = radius * Math.cos(lat) * Math.cos(lonView);
      put(3, i, gx, gy, gz, land ? .82 : wire ? .22 : .06, land ? .71 : .40, land ? .87 : .63, land ? .80 : .67, land ? 1.8 : 1.05);

      // A restrained, schematic solar system: eight orbits and eight planets.
      let x, y, z, alpha, color, size = 1;
      if (a < .14) {
        x = sx * .14; y = sy * .14; z = sz * .14;
        solarMeta.set([.25, 0, 0, 0], offset);
        alpha = .45; color = [1, .78 + d * .12, .40 + d * .19]; size = 1.8;
      } else if (a < .57) {
        const orbit = Math.min(7, Math.floor((a - .14) / .43 * 8));
        const r = radii[orbit], angle = b * TAU;
        x = Math.cos(angle) * r; y = Math.sin(angle) * r * .34; z = Math.sin(angle) * r * .28;
        solarMeta.set([1, orbit, angle, r], offset);
        alpha = .32; color = [.59, .65, .58]; size = 1.05;
      } else {
        const planet = Math.min(7, Math.floor((a - .57) / .395 * 8));
        const r = radii[planet], angle = angles[planet], radius = sizes[planet];
        const moon = planet === 2 && d < .12;
        const lunarAngle = 1.1;
        x = Math.cos(angle) * r + sx * (moon ? .014 : radius) + (moon ? Math.cos(lunarAngle) * .09 : 0);
        y = Math.sin(angle) * r * .34 + sy * (moon ? .014 : radius) + (moon ? Math.sin(lunarAngle) * .045 : 0);
        z = Math.sin(angle) * r * .28 + sz * (moon ? .014 : radius) + (moon ? Math.sin(lunarAngle) * .035 : 0);
        let kind = 2;
        if (planet === 5 && d > .69) {
          const ring = radius * (1.45 + c * .6);
          x = Math.cos(angle) * r + Math.cos(phi) * ring;
          y = Math.sin(angle) * r * .34 + Math.sin(phi) * ring * .38;
          z = Math.sin(angle) * r * .28 + Math.sin(phi) * ring * .25;
          kind = 3;
        }
        if (moon) kind = 4;
        solarMeta.set([kind, planet, angle, r], offset);
        alpha = .25 + (sz + 1) * .19;
        const palettes = [[.72,.70,.63],[.88,.76,.57],[.52,.76,.75],[.80,.57,.43],[.84,.76,.63],[.88,.80,.60],[.56,.78,.78],[.52,.65,.78]];
        color = palettes[planet]; size = 1.4;
        if (moon) { color = [.78,.80,.77]; alpha = .54; size = 1.25; }
        else if (planet === 2) {
          const landPatch = Math.sin(phi * 3.1 + sy * 4.6) + Math.sin(phi * 5.2 - sy * 7.0) > .38;
          color = landPatch ? [.45,.78,.61] : [.38,.68,.84]; size = 1.65;
        } else if (planet === 4) {
          const band = .5 + .5 * Math.sin(sy * 31 + Math.sin(phi * 2) * 1.8);
          const storm = Math.abs(sy - .18) < .13 && Math.cos(phi - .7) > .72;
          color = storm ? [.90,.46,.27] : [.72 + band * .19,.58 + band * .16,.42 + band * .14]; size = 1.55;
        } else if (planet === 5) {
          const band = .5 + .5 * Math.sin(sy * 27);
          color = [.78 + band * .13,.69 + band * .13,.47 + band * .13]; size = 1.5;
        }
      }
      put(4, i, x * Math.cos(solarTilt) - y * Math.sin(solarTilt), x * Math.sin(solarTilt) + y * Math.cos(solarTilt), z, alpha, ...color, size);

      // Broad, overlapping star clouds sit inside a softly filled, inclined disc.
      const normal = Math.sqrt(-2 * Math.log(Math.max(.00001, c))) * Math.cos(d * TAU);
      const core = a < .15;
      let galaxyX, galaxyY, galaxyZ, galaxyR, galaxyAlpha, galaxyColor, galaxySize;
      if (core) {
        const emissionRing = a < .022, bar = a > .075;
        if (emissionRing) {
          galaxyR = .072 + c * .018;
          galaxyX = Math.cos(phi) * galaxyR; galaxyY = Math.sin(phi) * galaxyR * .52; galaxyZ = (d - .5) * .018;
          galaxyAlpha = .66 + d * .25; galaxyColor = [1,.80 + c * .13,.43 + c * .18]; galaxySize = 1.65 + d * 1.25;
        } else if (bar) {
          const direction = b < .5 ? -1 : 1;
          galaxyR = .055 + Math.abs(b - .5) * .82;
          galaxyX = direction * galaxyR; galaxyY = normal * .085; galaxyZ = (c - .5) * .085;
          galaxyAlpha = .40 + d * .28; galaxyColor = [.90,.78,.58]; galaxySize = 1.05 + d * 1.45;
        } else {
          galaxyR = .085 + Math.pow(b, 1.65) * .29;
          galaxyX = sx * galaxyR; galaxyY = sy * galaxyR * .60; galaxyZ = sz * galaxyR * .58;
          galaxyAlpha = .40 + d * .32; galaxyColor = [.94,.82,.61]; galaxySize = 1.05 + d * 1.55;
        }
      } else {
        galaxyR = .20 + Math.pow(b, .78) * 1.92;
        const disc = a < .23, major = a < .82;
        const arm = major ? Math.max(0, Math.floor((a - .23) / .59 * 2)) * 2 : Math.min(1, Math.floor((a - .82) / .18 * 2)) * 2 + 1;
        const armWidth = (major ? .28 : .22) + galaxyR * .055;
        const angle = disc ? c * TAU : arm * TAU / 4 + galaxyR * 1.85 + normal * armWidth;
        galaxyX = Math.cos(angle) * galaxyR;
        galaxyY = Math.sin(angle) * galaxyR * .49;
        galaxyZ = Math.sin(angle) * galaxyR * .25 + (d - .5) * (disc ? .12 : .075);
        galaxyAlpha = (disc ? .10 : major ? .67 : .27) + (1 - b) * (disc ? .10 : .25);
        galaxyColor = [lerp(.96, .59, galaxyR / 2.15), lerp(.86, .72, galaxyR / 2.15), lerp(.65, .86, galaxyR / 2.15)];
        galaxySize = (disc ? .85 : major ? 1.65 : 1.15) + Math.pow(d, 5) * 1.6;
      }
      put(5, i, galaxyX, galaxyY, galaxyZ, galaxyAlpha, ...galaxyColor, galaxySize);

      // The closing portal is an atom-like field: a nucleus and three fast electrons with fading afterglow.
      if (a < .28) {
        const nucleusRadius = Math.sqrt(b) * .058, nucleusAngle = c * TAU;
        atomMeta.set([.25, 0, 0, 0], offset);
        put(6, i, Math.cos(nucleusAngle) * nucleusRadius, Math.sin(nucleusAngle) * nucleusRadius, (d - .5) * .012,
          .17 + (1 - b) * .17 + d * .08, .95 + d * .03, .82 + d * .08, .56 + d * .08, .95 + d * .72);
      } else if (a < .78) {
        const orbit = Math.min(2, Math.floor((a - .28) / .50 * 3));
        const radius = [.245,.31,.375][orbit], trail = Math.pow(b, 1.05);
        const angle = [.35,2.45,4.62][orbit] - .035 - trail * 5.75;
        const point = atomPoint(orbit, radius, angle);
        const breakup = trail * trail;
        point[0] *= 1 + (c - .5) * .025 * breakup;
        point[1] *= 1 + (c - .5) * .025 * breakup;
        point[2] += (d - .5) * .015 * breakup;
        atomMeta.set([1, orbit, angle, radius], offset);
        const trailLife = Math.pow(1 - b, .95);
        put(6, i, point[0], point[1], point[2], trailLife * (.25 + d * .25),
          .72 + d * .12, .80 + d * .12, .74 + d * .15, .58 + trailLife * .72 + d * .26);
      } else {
        const orbit = Math.min(2, Math.floor((a - .78) / .22 * 3));
        const radius = [.245,.31,.375][orbit], angle = [.35,2.45,4.62][orbit];
        const center = atomPoint(orbit, radius, angle), electronRadius = .012 * Math.cbrt(c);
        atomMeta.set([2, orbit, angle, radius], offset);
        put(6, i, center[0] + sx * electronRadius, center[1] + sy * electronRadius, center[2] + sz * electronRadius,
          .34 + d * .32, .78 + c * .18, .90, .84 + c * .14, 1.15 + d * .95);
      }
    }
    return { forms, seeds, solarMeta, atomMeta, total };
  }

  function transformPoint(p, seed, solarMeta, atomMeta, stage, time) {
    let [x, y, z] = p;
    if (stage === 1) {
      if (seed[0] < .65) y += Math.sin(x * 2.15 - time * .9 + Math.floor(seed[0] / .65 * 5) * .48) * .035;
      else y += Math.sin(time * 1.1 + Math.floor((seed[0] - .65) / .315 * 5) * .82) * .045;
    }
    if (stage === 2) {
      const id = Math.floor(seed[0] * 17);
      if (seed[2] >= .14) y += Math.sin(time * 2.0 + id * .37) * Math.abs(seed[1] - .5) * .095;
      y += Math.sin(time * .33 + id) * .018;
    }
    if (stage === 3) {
      const angle = time * .035, cs = Math.cos(angle), sn = Math.sin(angle);
      const nextX = x * cs + z * sn; z = z * cs - x * sn; x = nextX;
    }
    if (stage === 4) {
      if (solarMeta[0] > 3.5) {
        const oldCenter = orbitPoint(.63, 4.1), oldMoon = moonOffset(1.1);
        const nextCenter = orbitPoint(.63, 4.1 + time * (.17 / 2.3)), nextMoon = moonOffset(1.1 + time * 1.15);
        x += nextCenter[0] + nextMoon[0] - oldCenter[0] - oldMoon[0];
        y += nextCenter[1] + nextMoon[1] - oldCenter[1] - oldMoon[1];
        z += nextCenter[2] + nextMoon[2] - oldCenter[2] - oldMoon[2];
      } else if (solarMeta[0] > 1.5) {
        const speed = .17 / (1 + solarMeta[1] * .65);
        const oldCenter = orbitPoint(solarMeta[3], solarMeta[2]);
        const nextCenter = orbitPoint(solarMeta[3], solarMeta[2] + time * speed);
        let lx = x - oldCenter[0], ly = y - oldCenter[1], lz = z - oldCenter[2];
        const axis = solarMeta[1] === 5 ? [-.071,-.545,.835] : [.13,.992,0];
        // Rings retain their flat plane; only the planet body spins.
        if (solarMeta[0] < 2.5) [lx, ly, lz] = rotateAxis([lx, ly, lz], axis, time * (.32 + solarMeta[1] * .07));
        x = nextCenter[0] + lx; y = nextCenter[1] + ly; z = nextCenter[2] + lz;
      } else if (solarMeta[0] > .1 && solarMeta[0] < .5) {
        const pulse = 1 + Math.sin(time * .7 + seed[3] * TAU) * .035;
        x *= pulse; y *= pulse; z *= pulse;
        [x, y, z] = rotateAxis([x, y, z], [.13,.992,0], time * .12);
      }
    }
    if (stage === 5) {
      const pulse = 1 + Math.sin(time * .32) * .012;
      x *= pulse; y *= pulse; z *= pulse;
      const speed = .040 + (1 - Math.sqrt(seed[1])) * .012;
      const angle = -time * speed, cs = Math.cos(angle), sn = Math.sin(angle);
      // Rotate within the disc, then reapply its fixed inclination.
      const discY = y / .49, thickness = z - discY * .25;
      const nextX = x * cs - discY * sn, nextY = x * sn + discY * cs;
      x = nextX; y = nextY * .49; z = nextY * .25 + thickness;
    }
    if (stage === 6) {
      if (atomMeta[0] > .5) {
        const speed = 3.1 - atomMeta[1] * .35;
        const oldCenter = atomPoint(atomMeta[1], atomMeta[3], atomMeta[2]);
        const nextCenter = atomPoint(atomMeta[1], atomMeta[3], atomMeta[2] + time * speed);
        x += nextCenter[0] - oldCenter[0]; y += nextCenter[1] - oldCenter[1]; z += nextCenter[2] - oldCenter[2];
      } else if (atomMeta[0] > .1 && atomMeta[0] < .5) {
        const pulse = 1 + Math.sin(time * 2.1 + seed[3] * TAU) * .055;
        x *= pulse; y *= pulse; z *= pulse;
      }
    }
    return [x, y, z];
  }

  window.createShiyuWorld = function(canvas) {
    const total = innerWidth < 700 ? 17000 : 30000;
    const data = buildForms(total);
    let width, height, scale, center, dpr, stageScale;
    const uniforms = {}, gpu = [];
    let gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true });
    let context, program, attributes, seedBuffer, solarMetaBuffer, atomMetaBuffer, currentFrom = -1, currentTo = -1;
    let lastFrame;

    const vertex = `
      precision highp float;
      attribute vec4 aFrom, aTo, aColorFrom, aColorTo, aSeed, aSolarMeta, aAtomMeta;
      uniform vec2 uViewport;
      uniform float uTime, uFrom, uTo, uMorph, uDpr, uScale, uCenter, uScaleFrom, uScaleTo;
      varying vec3 vColor;
      varying float vAlpha;
      vec3 orbitPoint(float radius, float angle) {
        float tilt = -0.13;
        float x = cos(angle) * radius, y = sin(angle) * radius * 0.34;
        return vec3(x * cos(tilt) - y * sin(tilt), x * sin(tilt) + y * cos(tilt), sin(angle) * radius * 0.28);
      }
      vec3 moonOffset(float angle) {
        float tilt = -0.13;
        float x = cos(angle) * 0.09, y = sin(angle) * 0.045;
        return vec3(x * cos(tilt) - y * sin(tilt), x * sin(tilt) + y * cos(tilt), sin(angle) * 0.035);
      }
      vec3 atomPoint(float orbit, float radius, float angle) {
        vec3 p = vec3(cos(angle) * radius, sin(angle) * radius * 0.56, sin(angle) * radius * 0.18);
        float tilt = orbit < 0.5 ? 0.0 : orbit < 1.5 ? 1.02 : -1.02;
        p.xy = mat2(cos(tilt), sin(tilt), -sin(tilt), cos(tilt)) * p.xy;
        if (orbit > 0.5 && orbit < 1.5) p.z *= -1.0;
        return p;
      }
      vec3 rotateAxis(vec3 p, vec3 axis, float angle) {
        axis = normalize(axis);
        return p * cos(angle) + cross(axis, p) * sin(angle) + axis * dot(axis, p) * (1.0 - cos(angle));
      }
      vec3 move(vec3 p, float stage) {
        if (stage > 0.5 && stage < 1.5) {
          if (aSeed.x < 0.65) p.y += sin(p.x * 2.15 - uTime * 0.9 + floor(aSeed.x / 0.65 * 5.0) * 0.48) * 0.035;
          else p.y += sin(uTime * 1.1 + floor((aSeed.x - 0.65) / 0.315 * 5.0) * 0.82) * 0.045;
        }
        if (stage > 1.5 && stage < 2.5) {
          float id = floor(aSeed.x * 17.0);
          if (aSeed.z >= 0.14) p.y += sin(uTime * 2.0 + id * 0.37) * abs(aSeed.y - 0.5) * 0.095;
          p.y += sin(uTime * 0.33 + id) * 0.018;
        }
        if (stage > 2.5 && stage < 3.5) {
          float a = uTime * 0.035;
          p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
        }
        if (stage > 3.5 && stage < 4.5) {
          if (aSolarMeta.x > 3.5) {
            float earthSpeed = 0.17 / 2.3;
            vec3 oldCenter = orbitPoint(0.63, 4.1) + moonOffset(1.1);
            vec3 nextCenter = orbitPoint(0.63, 4.1 + uTime * earthSpeed) + moonOffset(1.1 + uTime * 1.15);
            p += nextCenter - oldCenter;
          } else if (aSolarMeta.x > 1.5) {
            float speed = 0.17 / (1.0 + aSolarMeta.y * 0.65);
            vec3 oldCenter = orbitPoint(aSolarMeta.w, aSolarMeta.z);
            vec3 local = p - oldCenter;
            float spin = uTime * (0.32 + aSolarMeta.y * 0.07);
            vec3 planetAxis = vec3(0.13, 0.992, 0.0);
            vec3 saturnAxis = vec3(-0.071, -0.545, 0.835);
            float isSaturn = step(4.5, aSolarMeta.y) * step(aSolarMeta.y, 5.5);
            if (aSolarMeta.x < 2.5) local = rotateAxis(local, mix(planetAxis, saturnAxis, isSaturn), spin);
            p = orbitPoint(aSolarMeta.w, aSolarMeta.z + uTime * speed) + local;
          } else if (aSolarMeta.x > 0.1 && aSolarMeta.x < 0.5) {
            p *= 1.0 + sin(uTime * 0.7 + aSeed.w * 6.2831853) * 0.035;
            p = rotateAxis(p, vec3(0.13, 0.992, 0.0), uTime * 0.12);
          }
        }
        if (stage > 4.5 && stage < 5.5) {
          p *= 1.0 + sin(uTime * 0.32) * 0.012;
          float speed = 0.040 + (1.0 - sqrt(aSeed.y)) * 0.012;
          float a = -uTime * speed;
          float thickness = p.z - p.y / 0.49 * 0.25;
          vec2 disc = mat2(cos(a), sin(a), -sin(a), cos(a)) * vec2(p.x, p.y / 0.49);
          p = vec3(disc.x, disc.y * 0.49, disc.y * 0.25 + thickness);
        }
        if (stage > 5.5) {
          if (aAtomMeta.x > 0.5) {
            float speed = 3.1 - aAtomMeta.y * 0.35;
            p += atomPoint(aAtomMeta.y, aAtomMeta.w, aAtomMeta.z + uTime * speed) - atomPoint(aAtomMeta.y, aAtomMeta.w, aAtomMeta.z);
          } else if (aAtomMeta.x > 0.1 && aAtomMeta.x < 0.5) {
            p *= 1.0 + sin(uTime * 2.1 + aSeed.w * 6.2831853) * 0.055;
          }
        }
        return p;
      }
      float shade(vec3 p, float stage) {
        if (stage > 2.5 && stage < 3.5) return 0.07 + 0.93 * smoothstep(-0.15, 0.6, p.z);
        return 1.0;
      }
      void main() {
        vec3 p0 = move(aFrom.xyz, uFrom), p1 = move(aTo.xyz, uTo);
        float start = 0.04 + (1.0 - clamp(aTo.w, 0.0, 1.0)) * 0.18 + aSeed.w * 0.08;
        float localMorph = smoothstep(start, 0.78 + aSeed.w * 0.12, uMorph);
        vec3 p = mix(p0 * uScaleFrom, p1 * uScaleTo, localMorph);
        float loosen = sin(clamp(uMorph, 0.0, 1.0) * 3.14159265);
        float closing = step(5.5, uFrom) * step(uTo, 6.5);
        vec3 scatter = vec3(aSeed.x - 0.5, aSeed.y - 0.5, (aSeed.z - 0.5) * 0.65);
        p += normalize(scatter + vec3(0.0001)) * loosen * (0.22 + aSeed.z * 0.34) * (1.0 + closing * 0.72);
        float perspective = 3.8 / (3.8 - p.z);
        vec2 pos = p.xy * uScale * perspective;
        gl_Position = vec4(pos.x * 2.0 / uViewport.x, pos.y * 2.0 / uViewport.y + 1.0 - 2.0 * uCenter, 0.0, 1.0);
        float size = mix(aColorFrom.w, aColorTo.w, localMorph);
        gl_PointSize = max(1.0, size * uDpr * perspective);
        vColor = mix(aColorFrom.rgb, aColorTo.rgb, localMorph);
        vAlpha = mix(aFrom.w * shade(p0, uFrom), aTo.w * shade(p1, uTo), localMorph) * (1.0 - loosen * (0.18 + aSeed.z * 0.34));
      }
    `;
    const fragment = `
      precision mediump float;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float distance = length(gl_PointCoord - 0.5) * 2.0;
        float alpha = (1.0 - smoothstep(0.15, 1.0, distance)) * vAlpha;
        gl_FragColor = vec4(vColor * alpha, alpha);
      }
    `;
    function upload(array) {
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW); return buffer;
    }
    function shader(type, source) {
      const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    }
    function setupGL() {
      gpu.length = 0;
      const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
      program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Particle program unavailable');
      gl.useProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
      attributes = {};
      for (const name of ['aFrom', 'aTo', 'aColorFrom', 'aColorTo', 'aSeed', 'aSolarMeta', 'aAtomMeta']) {
        attributes[name] = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(attributes[name]);
      }
      for (const name of ['uViewport', 'uTime', 'uFrom', 'uTo', 'uMorph', 'uDpr', 'uScale', 'uCenter', 'uScaleFrom', 'uScaleTo']) uniforms[name] = gl.getUniformLocation(program, name);
      for (const form of data.forms) gpu.push({ position: upload(form.position), color: upload(form.color) });
      seedBuffer = upload(data.seeds);
      solarMetaBuffer = upload(data.solarMeta);
      atomMetaBuffer = upload(data.atomMeta);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      currentFrom = currentTo = -1;
    }
    function useFallback() {
      const replacement = canvas.cloneNode(false); canvas.replaceWith(replacement); canvas = replacement;
      gl = null; context = canvas.getContext('2d'); canvas.dataset.renderer = 'canvas';
    }
    if (gl) {
      try { setupGL(); canvas.dataset.renderer = 'webgl'; } catch { useFallback(); }
    } else { context = canvas.getContext('2d'); canvas.dataset.renderer = 'canvas'; }
    let lost = false;
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; });
    canvas.addEventListener('webglcontextrestored', () => {
      try { setupGL(); lost = false; resize(width, height); if (lastFrame) paint(...lastFrame); } catch { useFallback(); resize(width, height); }
    });
    function resize(w, h) {
      width = w; height = h;
      const mobile = w < 700, short = h < 600 && w >= 700;
      dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      scale = Math.min(w * (mobile ? .43 : .31), h * (short ? .22 : .30));
      center = short ? .29 : mobile ? .32 : .34;
      stageScale = [1, mobile ? .52 : 1, mobile ? .58 : 1, mobile ? 1 : .92, mobile ? .49 : .97, mobile ? .50 : .86, 1];
      if (gl && !lost) {
        gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(program);
        gl.uniform2f(uniforms.uViewport, width, height);
        gl.uniform1f(uniforms.uDpr, dpr); gl.uniform1f(uniforms.uScale, scale); gl.uniform1f(uniforms.uCenter, center);
      } else if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function bind(attribute, buffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.vertexAttribPointer(attributes[attribute], 4, gl.FLOAT, false, 0, 0);
    }
    function bindPair(from, to) {
      if (from === currentFrom && to === currentTo) return;
      bind('aFrom', gpu[from].position); bind('aTo', gpu[to].position);
      bind('aColorFrom', gpu[from].color); bind('aColorTo', gpu[to].color);
      bind('aSeed', seedBuffer); bind('aSolarMeta', solarMetaBuffer); bind('aAtomMeta', atomMetaBuffer);
      currentFrom = from; currentTo = to;
    }
    function drawPass(from, to, morph, time) {
      bindPair(from, to);
      gl.uniform1f(uniforms.uTime, time); gl.uniform1f(uniforms.uFrom, from); gl.uniform1f(uniforms.uTo, to);
      gl.uniform1f(uniforms.uMorph, morph); gl.uniform1f(uniforms.uScaleFrom, stageScale[from]); gl.uniform1f(uniforms.uScaleTo, stageScale[to]);
      gl.drawArrays(gl.POINTS, 0, total);
    }
    function paint(from, to, morph, time) {
      lastFrame = [from, to, morph, time];
      if (gl && !lost) {
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        drawPass(from, to, morph, time);
      } else if (context) {
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < total; i += 5) {
          const o = i * 4, s = data.seeds.subarray(o, o + 4), solar = data.solarMeta.subarray(o, o + 4), atom = data.atomMeta.subarray(o, o + 4), f = data.forms[from], t = data.forms[to];
          const p0 = transformPoint(f.position.subarray(o, o + 3), s, solar, atom, from, time);
          const p1 = transformPoint(t.position.subarray(o, o + 3), s, solar, atom, to, time);
          const start = .04 + (1 - Math.min(1, t.position[o + 3])) * .18 + s[3] * .08;
          const localMorph = smoothstep(start, .78 + s[3] * .12, morph);
          const loosen = Math.sin(Math.min(1, Math.max(0, morph)) * Math.PI);
          const closing = from === 5 && to === 6 ? 1.72 : 1;
          const scatter = [s[0] - .5, s[1] - .5, (s[2] - .5) * .65];
          const length = Math.hypot(...scatter) || 1;
          const spread = loosen * (.22 + s[2] * .34) * closing;
          const x = lerp(p0[0] * stageScale[from], p1[0] * stageScale[to], localMorph) + scatter[0] / length * spread;
          const y = lerp(p0[1] * stageScale[from], p1[1] * stageScale[to], localMorph) + scatter[1] / length * spread;
          const z = lerp(p0[2] * stageScale[from], p1[2] * stageScale[to], localMorph) + scatter[2] / length * spread;
          const perspective = 3.8 / (3.8 - z);
          const alpha = lerp(f.position[o + 3], t.position[o + 3], localMorph) * (1 - loosen * (.18 + s[2] * .34));
          const col = [0, 1, 2].map(k => Math.round(lerp(f.color[o + k], t.color[o + k], localMorph) * 255));
          context.fillStyle = 'rgba(' + col.join(',') + ',' + Math.min(.9, alpha * 1.8) + ')';
          context.fillRect(width * .5 + x * scale * perspective, height * center - y * scale * perspective, 1.15, 1.15);
        }
      }
    }
    return { resize, paint };
  };
})();
