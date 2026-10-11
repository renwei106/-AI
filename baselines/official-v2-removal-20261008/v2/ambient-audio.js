(() => {
  'use strict';

  const STORAGE_KEY = 'shiyu-official-audio-muted';
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  window.createShiyuAudio = button => {
    if (!button) return null;

    const label = button.querySelector('.sound-label');
    let context = null;
    let master = null;
    let toneFilter = null;
    let shimmerBus = null;
    let noteTimer = 0;
    let noteIndex = 0;
    let started = false;
    let desiredProgress = 0;
    let muted = false;

    try { muted = localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}

    function setState(state) {
      button.dataset.audioState = state;
      button.setAttribute('aria-pressed', String(state === 'playing'));
      if (state === 'playing') {
        button.setAttribute('aria-label', '关闭背景音乐');
        label.textContent = '声音';
      } else if (state === 'muted') {
        button.setAttribute('aria-label', '开启背景音乐');
        label.textContent = '已静音';
      } else if (state === 'unavailable') {
        button.setAttribute('aria-label', '当前浏览器不支持背景音乐');
        label.textContent = '声音';
        button.disabled = true;
      } else {
        button.setAttribute('aria-label', '开启背景音乐');
        label.textContent = '声音';
      }
    }

    function createImpulse(seconds, decay) {
      const length = Math.floor(context.sampleRate * seconds);
      const impulse = context.createBuffer(2, length, context.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          const envelope = Math.pow(1 - i / length, decay);
          data[i] = (Math.random() * 2 - 1) * envelope;
        }
      }
      return impulse;
    }

    function addDrone(destination, frequency, type, gainValue, detune) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      gain.gain.value = gainValue;
      oscillator.connect(gain).connect(destination);
      oscillator.start();
    }

    function scheduleNote() {
      if (!started || !context) return;
      const notes = [220, 261.63, 329.63, 392, 293.66, 440, 246.94];
      const now = context.currentTime + .03;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const highCut = context.createBiquadFilter();
      const panner = context.createStereoPanner ? context.createStereoPanner() : null;
      const frequency = notes[noteIndex % notes.length];

      noteIndex++;
      oscillator.type = noteIndex % 3 === 0 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.detune.setValueAtTime((noteIndex % 2 ? -1 : 1) * 3, now);
      highCut.type = 'lowpass';
      highCut.frequency.value = 1250;
      highCut.Q.value = .5;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.014, now + 1.35);
      gain.gain.exponentialRampToValueAtTime(.0001, now + 6.4);
      if (panner) {
        panner.pan.value = ((noteIndex % 5) - 2) * .18;
        oscillator.connect(gain).connect(highCut).connect(panner).connect(shimmerBus);
      } else {
        oscillator.connect(gain).connect(highCut).connect(shimmerBus);
      }
      oscillator.start(now);
      oscillator.stop(now + 6.5);
      noteTimer = window.setTimeout(scheduleNote, 5700 + (noteIndex % 4) * 900);
    }

    function build() {
      if (started) return true;
      if (!AudioContextClass) {
        setState('unavailable');
        return false;
      }

      context = new AudioContextClass();
      master = context.createGain();
      const compressor = context.createDynamicsCompressor();
      const padBus = context.createGain();
      toneFilter = context.createBiquadFilter();
      shimmerBus = context.createGain();
      const reverb = context.createConvolver();
      const reverbGain = context.createGain();
      const amplitudeLfo = context.createOscillator();
      const amplitudeDepth = context.createGain();
      const filterLfo = context.createOscillator();
      const filterDepth = context.createGain();

      master.gain.value = 0;
      compressor.threshold.value = -24;
      compressor.knee.value = 18;
      compressor.ratio.value = 3;
      compressor.attack.value = .08;
      compressor.release.value = .8;
      toneFilter.type = 'lowpass';
      toneFilter.frequency.value = 430;
      toneFilter.Q.value = .65;
      padBus.gain.value = .74;
      shimmerBus.gain.value = .72;
      reverb.buffer = createImpulse(3.6, 3.1);
      reverbGain.gain.value = .24;

      padBus.connect(toneFilter);
      toneFilter.connect(master);
      toneFilter.connect(reverb).connect(reverbGain).connect(master);
      shimmerBus.connect(master);
      shimmerBus.connect(reverb);
      master.connect(compressor).connect(context.destination);

      addDrone(padBus, 43.65, 'sine', .058, -6);
      addDrone(padBus, 55, 'sine', .038, 5);
      addDrone(padBus, 65.41, 'triangle', .018, -3);
      addDrone(padBus, 82.41, 'sine', .012, 4);

      amplitudeLfo.type = 'sine';
      amplitudeLfo.frequency.value = .047;
      amplitudeDepth.gain.value = .11;
      amplitudeLfo.connect(amplitudeDepth).connect(padBus.gain);
      amplitudeLfo.start();

      filterLfo.type = 'sine';
      filterLfo.frequency.value = .031;
      filterDepth.gain.value = 95;
      filterLfo.connect(filterDepth).connect(toneFilter.frequency);
      filterLfo.start();

      started = true;
      setProgress(desiredProgress);
      noteTimer = window.setTimeout(scheduleNote, 2200);
      return true;
    }

    function applyVolume(audible) {
      if (!context || !master) return;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.setTargetAtTime(audible ? .19 : 0, now, audible ? 1.2 : .35);
    }

    async function start() {
      if (muted || !build()) return false;
      try {
        await context.resume();
        applyVolume(true);
        setState('playing');
        return true;
      } catch (_) {
        setState('ready');
        return false;
      }
    }

    function saveMuted() {
      try { localStorage.setItem(STORAGE_KEY, muted ? '1' : '0'); } catch (_) {}
    }

    async function toggle() {
      if (!started) {
        muted = false;
        saveMuted();
        await start();
        return;
      }
      muted = !muted;
      saveMuted();
      if (muted) {
        applyVolume(false);
        setState('muted');
      } else {
        try { await context.resume(); } catch (_) {}
        applyVolume(true);
        setState('playing');
      }
    }

    function setProgress(value) {
      desiredProgress = Math.max(0, Math.min(1, value));
      if (!context || !toneFilter || !shimmerBus) return;
      const now = context.currentTime;
      toneFilter.frequency.setTargetAtTime(390 + desiredProgress * 270, now, 1.8);
      shimmerBus.gain.setTargetAtTime(.68 + desiredProgress * .16, now, 2.2);
    }

    const gestureOptions = { passive: true };
    async function beginOnGesture(event) {
      if (muted || event.target.closest?.('.sound-toggle')) return;
      if (event.type === 'keydown' && !['ArrowDown', 'PageDown', ' ', 'Enter'].includes(event.key)) return;
      if (await start()) disarm();
    }
    function arm() {
      addEventListener('wheel', beginOnGesture, gestureOptions);
      addEventListener('pointerdown', beginOnGesture, gestureOptions);
      addEventListener('touchstart', beginOnGesture, gestureOptions);
      addEventListener('keydown', beginOnGesture);
    }
    function disarm() {
      removeEventListener('wheel', beginOnGesture, gestureOptions);
      removeEventListener('pointerdown', beginOnGesture, gestureOptions);
      removeEventListener('touchstart', beginOnGesture, gestureOptions);
      removeEventListener('keydown', beginOnGesture);
    }

    button.addEventListener('click', toggle);
    document.addEventListener('visibilitychange', async () => {
      if (!context) return;
      if (document.hidden) {
        try { await context.suspend(); } catch (_) {}
      } else if (!muted) {
        try { await context.resume(); } catch (_) {}
      }
    });
    addEventListener('pagehide', () => {
      clearTimeout(noteTimer);
      if (context) context.close().catch(() => {});
    }, { once: true });

    setState(muted ? 'muted' : 'ready');
    if (!muted) arm();

    return { setProgress, start, toggle };
  };
})();
