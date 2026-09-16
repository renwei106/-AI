(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const ramp = (a, b, value) => ease((value - a) / (b - a));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = $('#atmosphere');
  const scenes = [...document.querySelectorAll('.scene')];
  const copies = scenes.map(scene => scene.querySelector('.scene-copy'));
  const depth = $('.depth-image'), sea = $('.sea-image'), night = $('.night-image');
  const memories = [...document.querySelectorAll('.memory')];
  const memoryWorld = $('.memory-world'), light = $('.light-source');
  const column = $('.light-column'), haze = $('.final-haze'), frame = $('.quiet-frame');
  const cue = $('.scroll-cue'), label = $('.cue-label'), count = $('#scene-number');
  const fill = $('#progress-fill');
  let width = innerWidth, height = innerHeight;
  let maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
  let progress = 0, target = 0, active = -1, raf = 0, previousTime = 0;
  let renderer;

  // One particle field changes its shape along the same scroll timeline.
  // A seeded buffer keeps every point identifiable through all five chapters.
  function createAtmosphere() {
    const gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, powerPreference: 'low-power'
    });
    if (!gl) return createCanvasAtmosphere();
    const vertex = `
      precision highp float;
      attribute vec4 aSeed;
      uniform float uTime;
      uniform float uProgress;
      uniform float uAspect;
      uniform float uDpr;
      uniform float uMotion;
      varying vec3 vColor;
      varying float vAlpha;
      const float PI = 3.14159265;
      vec3 shape(float stage, vec4 s, float time) {
        float u = s.x;
        float v = s.y;
        float a = u * PI * 2.0;
        float ribbon = (v - 0.5);
        float shiver = sin(u * 18.0 + time * 0.35) * 0.025;
        if (stage < 0.5) {
          float r = pow(v, 0.55) * 0.013;
          return vec3(cos(a) * r, sin(a) * r, (s.z - 0.5) * 0.015);
        }
        if (stage < 1.5) {
          float taper = pow(sin(u * PI), 0.65);
          float x = (u - 0.5) * 3.5;
          float y = sin(u * PI * 2.0 - 0.7) * 0.27 + ribbon * 0.5 * taper;
          float z = cos(u * PI * 2.0 + ribbon * 3.0) * 0.36 + shiver;
          y += sin(ribbon * 11.0 + u * 6.0 + time * 0.22) * 0.05;
          return vec3(x, y, z);
        }
        if (stage < 2.5) {
          float fold = a * 1.65;
          float radius = 0.34 + v * 0.51;
          float x = cos(fold) * radius + (u - 0.5) * 1.18;
          float y = sin(fold) * 0.30 + (u - 0.5) * 0.56;
          float z = sin(fold * 0.8 + v * 1.8) * 0.39;
          return vec3(x, y, z);
        }
        if (stage < 3.5) {
          float x = (u - 0.5) * 5.0;
          float z = (v - 0.5) * 2.1;
          float r = length(vec2(x, z * 1.4));
          float y = -0.55 + sin(r * 8.0 - time * 0.3) * 0.035 + z * 0.19;
          return vec3(x, y, z);
        }
        float r = pow(v, 0.55) * 0.009;
        float x = cos(a) * r;
        float y = sin(a) * r;
        float z = (s.z - 0.5) * 0.012;
        return vec3(x, y, z);
      }
      void main() {
        float stage = min(3.0, floor(uProgress));
        float t = smoothstep(0.02, 0.95, uProgress - stage);
        float tm = uTime * uMotion;
        vec3 p = mix(shape(stage, aSeed, tm), shape(stage + 1.0, aSeed, tm), t);
        float open = smoothstep(0.02, 0.8, uProgress);
        p.y += sin(tm * 0.25 + aSeed.x * 7.0) * 0.012 * open;
        float turn = sin(tm * 0.065) * 0.09;
        p.xz = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * p.xz;
        float dust = step(0.94, aSeed.w);
        vec3 scatter = vec3((aSeed.x - 0.5) * 7.5, (aSeed.y - 0.5) * 4.2, (aSeed.z - 0.5) * 2.0);
        scatter.y += sin(tm * 0.1 + aSeed.z * 9.0) * 0.07;
        p = mix(p, scatter, dust);
        float focal = 2.8 / (3.3 + p.z);
        float scale = min(1.0, uAspect / 1.55);
        float originCenter = uAspect < 1.0 ? 0.34 : 0.32;
        float center = mix(originCenter, 0.43, smoothstep(0.12, 0.8, uProgress));
        center += smoothstep(1.15, 2.0, uProgress) * 0.09;
        center = mix(center, 0.08, smoothstep(2.0, 3.0, uProgress));
        center = mix(center, originCenter, smoothstep(3.15, 4.0, uProgress));
        gl_Position = vec4(p.x * focal / uAspect * scale, p.y * focal * scale + center, 0.0, 1.0);
        float size = mix(1.15 + aSeed.z * 2.4, 0.65 + aSeed.z * 1.6, dust) * focal;
        gl_PointSize = max(0.6, size * uDpr);
        vec3 warm = vec3(0.91, 0.79, 0.56);
        vec3 silver = vec3(0.62, 0.77, 0.68);
        vec3 copper = vec3(0.90, 0.73, 0.51);
        vec3 sea = vec3(0.56, 0.74, 0.72);
        vec3 color = mix(warm, silver, smoothstep(0.0, 1.0, uProgress));
        color = mix(color, copper, smoothstep(1.1, 2.0, uProgress));
        color = mix(color, sea, smoothstep(2.1, 3.0, uProgress));
        color = mix(color, warm, smoothstep(3.15, 4.0, uProgress));
        vColor = mix(color, vec3(1.0, 0.97, 0.84), aSeed.z * 0.32);
        float breathing = 0.8 + sin(tm * 0.55 + aSeed.x * 8.0) * 0.2;
        float coreAlpha = mix(0.025, 0.72, open) * breathing;
        coreAlpha *= 1.0 - smoothstep(3.05, 4.0, uProgress) * 0.97;
        vAlpha = mix(coreAlpha, (0.035 + open * 0.22) * aSeed.z, dust);
      }
    `;
    const fragment = `
      precision mediump float;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float alpha = (1.0 - smoothstep(0.08, 1.0, r)) * vAlpha;
        gl_FragColor = vec4(vColor * alpha, alpha);
      }
    `;
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('Atmosphere shader unavailable');
      }
      return shader;
    }
    try {
      const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
      const program = gl.createProgram();
      gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Atmosphere unavailable');
      gl.useProgram(program);
      gl.deleteShader(vs); gl.deleteShader(fs);
      const total = innerWidth < 700 ? 7500 : 19000;
      const seeds = new Float32Array(total * 4);
      let seed = 5721;
      for (let i = 0; i < seeds.length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        seeds[i] = seed / 4294967296;
      }
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
      const attr = gl.getAttribLocation(program, 'aSeed');
      gl.enableVertexAttribArray(attr); gl.vertexAttribPointer(attr, 4, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      const uniforms = {};
      for (const name of ['uTime', 'uProgress', 'uAspect', 'uDpr', 'uMotion']) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      let lost = false;
      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault(); lost = true; canvas.style.opacity = '0';
      }, { once: true });
      canvas.addEventListener('webglcontextrestored', () => {
        renderer = createAtmosphere(); renderer.resize(); canvas.style.opacity = ''; requestFrame();
      }, { once: true });
      return {
        resize() {
          const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.75);
          canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.uniform1f(uniforms.uAspect, width / height);
          gl.uniform1f(uniforms.uDpr, dpr);
        },
        paint(now, value) {
          if (lost) return;
          gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(uniforms.uTime, now / 1000);
          gl.uniform1f(uniforms.uProgress, value);
          gl.uniform1f(uniforms.uMotion, reduced.matches ? 0 : 1);
          gl.drawArrays(gl.POINTS, 0, total);
        }
      };
    } catch {
      canvas.style.display = 'none';
      return { resize() {}, paint() {} };
    }
  }

  // Lightweight fallback retains scroll-driven depth if WebGL is unavailable.
  function createCanvasAtmosphere() {
    const ctx = canvas.getContext('2d');
    return {
      resize() { canvas.width = width; canvas.height = height; },
      paint(now, value) {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        const open = ramp(0, 0.8, value);
        const time = reduced.matches ? 0 : now / 5000;
        for (let i = 0; i < 240; i++) {
          const u = i / 239;
          const x = width * .5 + (u - .5) * width * .84 * open;
          const y = height * .33 + Math.sin(u * 9 + time) * height * .1 * open;
          ctx.fillStyle = 'rgba(220,216,175,' + (0.1 + open * .32) + ')';
          ctx.beginPath(); ctx.arc(x, y, .5 + (i % 4) * .22, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
  }

  function markActive(index) {
    if (index === active) return;
    active = index;
    scenes.forEach((scene, i) => {
      scene.inert = i !== index;
      scene.setAttribute('aria-hidden', String(i !== index));
    });
    count.textContent = String(index).padStart(2, '0');
    label.textContent = index === 4 ? '你的一隅，自有光' : '向下滚动';
    $('.experience').dataset.chapter = String(index);
  }

  function render(value, now) {
    const base = Math.min(4, Math.floor(value));
    const transition = base === 4 ? 0 : ramp(.30, .84, value - base);
    const weights = scenes.map((_, i) => i === base ? 1 - transition : i === base + 1 ? transition : 0);
    const nextActive = transition >= .5 ? Math.min(4, base + 1) : base;
    markActive(nextActive);
    scenes.forEach((scene, i) => {
      const weight = weights[i];
      scene.style.visibility = weight > .001 ? 'visible' : 'hidden';
      scene.style.opacity = String(weight);
      if (weight <= .001) return;
      // Images share the transition; each sentence gets its own reading moment.
      const clarity = ramp(.50, .90, weight);
      copies[i].style.opacity = String(clarity);
      copies[i].style.filter = reduced.matches ? 'none' : 'blur(' + ((1 - clarity) * 7).toFixed(2) + 'px)';
      copies[i].style.transform = 'translate(-50%, -50%) scale(' + (reduced.matches ? 1 : .97 + .03 * clarity).toFixed(4) + ')';
    });

    const unfold = ramp(0, .86, value);
    const remembering = ramp(1.23, 1.9, value) * (1 - ramp(2.28, 2.87, value));
    const inward = ramp(2.25, 3.05, value);
    const home = ramp(3.12, 3.98, value);
    const seaAmount = ramp(2.30, 2.98, value) * (1 - ramp(3.2, 3.9, value));
    const depthAmount = mix(.055, .90, unfold) * (1 - ramp(1.15, 2.05, value) * .82) * (1 - inward);
    depth.style.opacity = depthAmount.toFixed(4);
    depth.style.transform = 'scale(' + (reduced.matches ? 1.04 : mix(1.65, 1.02, ramp(0, 1.30, value))).toFixed(4) + ')';
    sea.style.opacity = (seaAmount * .85).toFixed(4);
    sea.style.transform = 'scale(' + (reduced.matches ? 1 : mix(1.22, 1.02, ramp(2.3, 3.8, value))).toFixed(4) + ')';
    night.style.opacity = (home * .32).toFixed(4);
    night.style.transform = 'scale(' + (reduced.matches ? 1 : 1.13 - .09 * home).toFixed(4) + ')';
    haze.style.opacity = (ramp(1.2, 2.0, value) * .4 + home * .6).toFixed(4);
    memoryWorld.style.opacity = remembering.toFixed(4);
    memories.forEach((memory, i) => {
      const local = ramp(1.15 + i * .08, 2 + i * .06, value);
      const recede = ramp(2.2, 2.85, value);
      const x = [32, -23, -30][i] * (1 - local) + [-22, 18, 25][i] * recede;
      const y = [14, 20, -12][i] * (1 - local);
      const rotation = [-7, 8, 6][i] * (1 - recede * .6);
      memory.style.transform = reduced.matches ? 'none' : 'translate3d(' + x + '%, ' + y + '%, 0) rotate(' + rotation + 'deg) scale(' + (1 - recede * .1) + ')';
      memory.style.opacity = String(.75 - i * .08);
    });
    light.style.opacity = String((1 - unfold * .65) * (1 - inward) + home * .7);
    light.style.transform = 'translate(-50%, -50%) scale(' + (1 + Math.sin((reduced.matches ? 0 : now) / 1400) * .06) + ')';
    column.style.opacity = String(.04 + unfold * .42 * (1 - inward) + home * .12);
    frame.style.opacity = String(home * .38);
    frame.style.transform = 'translate(-50%, -50%) scale(' + (reduced.matches ? 1 : .92 + home * .08) + ')';
    cue.style.opacity = String((1 - ramp(.06, .85, value) * .4) * (1 - home));
    fill.style.transform = 'scaleX(' + value / 4 + ')';
    renderer.paint(now, value);
  }

  function tick(now) {
    raf = 0;
    const dt = previousTime ? Math.min(64, now - previousTime) : 16;
    previousTime = now;
    const damping = reduced.matches ? 1 : 1 - Math.exp(-dt / 135);
    progress += (target - progress) * damping;
    if (Math.abs(target - progress) < .0001) progress = target;
    render(progress, now);
    if (!document.hidden && (!reduced.matches || progress !== target)) requestFrame();
  }
  function requestFrame() { if (!raf && !document.hidden) raf = requestAnimationFrame(tick); }
  function readScroll() {
    target = clamp(scrollY / maxScroll) * 4;
    requestFrame();
  }
  function measure() {
    width = innerWidth; height = innerHeight;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
    renderer.resize();
    readScroll();
  }

  renderer = createAtmosphere();
  history.scrollRestoration = 'manual';
  scrollTo({ top: 0, behavior: 'instant' });
  addEventListener('scroll', readScroll, { passive: true });
  let resizeRaf = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(measure);
  }, { passive: true });
  addEventListener('pageshow', event => {
    if (event.persisted) { measure(); progress = target; requestFrame(); }
  });
  $('.brand').addEventListener('click', event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else { previousTime = 0; requestFrame(); }
  });
  reduced.addEventListener('change', () => { previousTime = 0; requestFrame(); });
  measure();
})();
