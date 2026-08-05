/* ==========================================================================
   Dunia Main & Belajar Balita - Application Logic
   ========================================================================== */

// --- Global State ---
let currentLevel = 1;
let audioEnabled = true;
let audioCtx = null;

// Praise phrases in Indonesian
const PRAISE_PHRASES = [
  "Pintar!",
  "Hebat!",
  "Bagus Sekali!",
  "Wah Luar Biasa!",
  "Kerja Bagus!"
];

// --- Audio Synthesizer & Web Speech Engine ---

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
  return audioCtx;
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  const icon = document.getElementById('audioIcon');
  if (icon) {
    icon.textContent = audioEnabled ? '🔊' : '🔇';
  }
  if (audioEnabled) {
    playAudioEffect('pop');
    speakIndonesian("Suara aktif");
  }
}

// Speak text using Web Speech API in Indonesian (Crystal Clear Pitch)
function speakIndonesian(text, delayMs = 0) {
  if (!audioEnabled || !('speechSynthesis' in window)) return;
  
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setTimeout(() => {
      // Cancel previous speech gently
      window.speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.92; // Smooth, natural clear rate
        utterance.pitch = 1.05; // Natural clear tone
        utterance.volume = 1.0;

        // Find Indonesian voice if available
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        if (idVoice) {
          utterance.voice = idVoice;
        }

        window.speechSynthesis.speak(utterance);
      }, 30);
    }, delayMs);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

// Local Real Sound Audio Files (100% Offline Real Audio Clips)
const REAL_AUDIO_URLS = {
  // Animals
  cat: 'sounds/cat.wav',
  dog: 'sounds/dog.wav',
  bird: 'sounds/bird.wav',
  cow: 'sounds/cow.wav',
  duck: 'sounds/duck.wav',
  elephant: 'sounds/elephant.wav',
  lion: 'sounds/lion.wav',
  monkey: 'sounds/monkey.wav',
  goat: 'sounds/goat.wav',
  horse: 'sounds/horse.wav',
  rabbit: 'sounds/rabbit.wav',
  tiger: 'sounds/tiger.wav',

  // Heavy Equipment
  excavator: 'sounds/excavator.wav',
  bulldozer: 'sounds/bulldozer.wav',
  dumptruck: 'sounds/dumptruck.wav',
  mixertruck: 'sounds/mixertruck.wav',
  crane: 'sounds/crane.wav',
  roadroller: 'sounds/roadroller.wav',
  loader: 'sounds/loader.wav',
  tractor: 'sounds/tractor.wav',

  // Toy Vehicles
  firetruck: 'sounds/firetruck.wav',
  policecar: 'sounds/policecar.wav',
  ambulance: 'sounds/ambulance.wav',
  schoolbus: 'sounds/schoolbus.wav',
  racecar: 'sounds/racecar.wav',
  garbagetruck: 'sounds/garbagetruck.wav',
  taxi: 'sounds/taxi.wav',
  towtruck: 'sounds/towtruck.wav'
};

// Hybrid Audio Player (Real Audio Files + Web Audio Synthesizer Fallback)
function playAudioEffect(type) {
  if (!audioEnabled) return;

  // Try playing realistic audio clip from local sounds/ folder
  if (REAL_AUDIO_URLS[type]) {
    try {
      const audio = new Audio(REAL_AUDIO_URLS[type]);
      audio.currentTime = 0;
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Fallback to synth audio for type:", type, err);
          playSynthesizedAudioEffect(type);
        });
      }
      return;
    } catch (e) {
      console.warn("Real audio failed, using synth:", e);
    }
  }

  playSynthesizedAudioEffect(type);
}

// Synthesize pleasant cartoon sound effects with Web Audio API
function playSynthesizedAudioEffect(type) {
  if (!audioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'pop') {
    // Bubble Pop sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

  } else if (type === 'chime' || type === 'success') {
    // Cheerful 4-note ascending chord (C5, E5, G5, C6)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.6, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });

  } else if (type === 'snap') {
    // Snap/Click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);

  } else if (type === 'soft_error') {
    // Gentle wiggle sound for wrong match (non-punitive)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

  } else if (type === 'cat') {
    // Meow sound (Dual tone vibrato ramp)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(450, now);
    osc1.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    osc1.frequency.exponentialRampToValueAtTime(380, now + 0.55);

    osc2.frequency.setValueAtTime(455, now);
    osc2.frequency.exponentialRampToValueAtTime(905, now + 0.25);
    osc2.frequency.exponentialRampToValueAtTime(385, now + 0.55);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);

  } else if (type === 'dog') {
    // Dog bark sound (Realistic double bark pulse)
    [0, 0.22].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now + delay);
      osc.frequency.exponentialRampToValueAtTime(105, now + delay + 0.14);

      gain.gain.setValueAtTime(0.7, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.14);
    });

  } else if (type === 'bird') {
    // Bird tweet (Realistic bright double chirp)
    [0, 0.14].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now + delay);
      osc.frequency.exponentialRampToValueAtTime(2900, now + delay + 0.08);
      osc.frequency.exponentialRampToValueAtTime(2100, now + delay + 0.12);

      gain.gain.setValueAtTime(0.5, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    });

  } else if (type === 'cow') {
    // Cow moo (Rich low frequency pitch sweep)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.linearRampToValueAtTime(155, now + 0.35);
    osc.frequency.linearRampToValueAtTime(95, now + 0.8);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);

  } else if (type === 'duck') {
    // Duck quack (Two nasal quack pulses)
    [0, 0.22].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now + delay);
      osc.frequency.exponentialRampToValueAtTime(190, now + delay + 0.18);

      gain.gain.setValueAtTime(0.65, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });

  } else if (type === 'elephant') {
    // Elephant Trumpet (Brassy pitch ramp up)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(780, now + 0.35);
    osc1.frequency.linearRampToValueAtTime(600, now + 0.65);

    osc2.frequency.setValueAtTime(325, now);
    osc2.frequency.exponentialRampToValueAtTime(785, now + 0.35);
    osc2.frequency.linearRampToValueAtTime(605, now + 0.65);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);

  } else if (type === 'lion') {
    // Lion Roar (Low frequency growl rumble)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.25);
    osc.frequency.linearRampToValueAtTime(60, now + 0.75);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);

  } else if (type === 'monkey') {
    // Monkey Screech (Rapid double pulse)
    [0, 0.15, 0.3].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now + delay);
      osc.frequency.exponentialRampToValueAtTime(1600, now + delay + 0.08);

      gain.gain.setValueAtTime(0.6, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });

  } else if (type === 'goat') {
    // Goat Bleat (Mbekk! Vibrato pulse)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(340, now + 0.15);
    osc.frequency.linearRampToValueAtTime(280, now + 0.45);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);

  } else if (type === 'siren') {
    // Emergency Siren Wail (Police / Fire Truck)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(1150, now + 0.35);
    osc.frequency.linearRampToValueAtTime(650, now + 0.7);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);

  } else if (type === 'horn') {
    // Heavy Dump Truck Air Horn & Pneumatic release
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(180, now);
    osc2.frequency.setValueAtTime(235, now);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);

  } else if (type === 'telolet') {
    // School Bus Telolet Melodic Horn (4 cute notes)
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.6, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });

  } else if (type === 'engine') {
    // Heavy Caterpillar Bulldozer Engine Rumble & Track treads
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.25);
    osc.frequency.linearRampToValueAtTime(75, now + 0.6);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);

  } else if (type === 'hydraulic') {
    // Realistic Excavator Hydraulic Lift + Piston Pressure Hiss
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.3);
    osc.frequency.linearRampToValueAtTime(110, now + 0.55);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);

  } else if (type === 'vroom') {
    // Race Car Vroom sound (Revving frequency pitch up)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.35);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

function getRandomPraise() {
  return PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
}

// --- Navigation & Level Management ---

function switchLevel(levelNum) {
  getAudioContext();
  currentLevel = levelNum;

  // Update Header Buttons
  document.querySelectorAll('.nav-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === levelNum);
  });

  // Update Sections
  document.querySelectorAll('.level-section').forEach((sec, idx) => {
    sec.classList.toggle('active', idx + 1 === levelNum);
  });

  playAudioEffect('snap');

  if (levelNum === 1) {
    speakIndonesian("Ayo pasangkan bentuk!");
    initLevel1();
  } else if (levelNum === 2) {
    speakIndonesian("Dunia Hewan!");
    initLevel2();
  } else if (levelNum === 3) {
    speakIndonesian("Ayo pecahkan gelembung!");
    initLevel3();
  } else if (levelNum === 4) {
    speakIndonesian("Kenali dan tebak Alat Berat!");
    initLevel4();
  } else if (levelNum === 5) {
    speakIndonesian("Dunia Mobil-mobilan dan Sirine!");
    initLevel5();
  }
}

// ==========================================================================
// LEVEL 1: SORTING SHAPES
// ==========================================================================

const SHAPES_DATA = [
  {
    id: 'circle',
    name: 'Lingkaran',
    color: '#ff5252',
    svg: `<svg viewBox="0 0 100 100" class="shape-svg"><circle cx="50" cy="50" r="42" fill="#ff5252"/><circle cx="35" cy="40" r="6" fill="#fff"/><circle cx="65" cy="40" r="6" fill="#fff"/><path d="M 35 62 Q 50 74 65 62" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`
  },
  {
    id: 'triangle',
    name: 'Segitiga',
    color: '#4caf50',
    svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,10 90,85 10,85" fill="#4caf50"/><circle cx="40" cy="50" r="5" fill="#fff"/><circle cx="60" cy="50" r="5" fill="#fff"/><path d="M 42 65 Q 50 73 58 65" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`
  },
  {
    id: 'square',
    name: 'Persegi',
    color: '#29b6f6',
    svg: `<svg viewBox="0 0 100 100" class="shape-svg"><rect x="12" y="12" width="76" height="76" rx="16" fill="#29b6f6"/><circle cx="38" cy="42" r="6" fill="#fff"/><circle cx="62" cy="42" r="6" fill="#fff"/><path d="M 38 64 Q 50 74 62 64" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`
  },
  {
    id: 'star',
    name: 'Bintang',
    color: '#ffca28',
    svg: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,5 64,36 98,39 72,62 80,95 50,77 20,95 28,62 2,39 36,36" fill="#ffca28"/><circle cx="42" cy="45" r="4" fill="#333"/><circle cx="58" cy="45" r="4" fill="#333"/><path d="M 44 58 Q 50 64 56 58" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`
  }
];

let selectedShapeId = null;
let level1PlacedCount = 0;

function initLevel1() {
  selectedShapeId = null;
  level1PlacedCount = 0;

  const slotsContainer = document.getElementById('slotsContainer');
  const shapesContainer = document.getElementById('shapesContainer');

  slotsContainer.innerHTML = '';
  shapesContainer.innerHTML = '';

  // Shuffle shapes for variety
  const shuffledShapes = [...SHAPES_DATA].sort(() => Math.random() - 0.5);

  // Render Slots
  SHAPES_DATA.forEach(shape => {
    const slot = document.createElement('div');
    slot.className = 'shape-slot';
    slot.dataset.shapeId = shape.id;
    slot.innerHTML = `
      <div style="opacity: 0.25">${shape.svg}</div>
      <span class="slot-label">${shape.name}</span>
    `;

    // Drop Event Listeners for Drag & Drop
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const shapeId = e.dataTransfer.getData('text/plain');
      handlePlacement(shapeId, slot);
    });

    // Tap target selection for Toddler tap-tap mode
    slot.addEventListener('click', () => {
      if (selectedShapeId) {
        handlePlacement(selectedShapeId, slot);
      }
    });

    slotsContainer.appendChild(slot);
  });

  // Render Draggable Shapes
  shuffledShapes.forEach(shape => {
    const item = document.createElement('div');
    item.className = 'shape-item';
    item.id = `shape-item-${shape.id}`;
    item.dataset.shapeId = shape.id;
    item.draggable = true;
    item.innerHTML = shape.svg;

    // HTML5 Drag handlers
    item.addEventListener('dragstart', (e) => {
      getAudioContext();
      item.classList.add('dragging');
      e.dataTransfer.setData('text/plain', shape.id);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });

    // Tap-to-select for Toddler ease
    item.addEventListener('click', () => {
      getAudioContext();
      if (item.classList.contains('placed')) return;

      // Unselect previous
      document.querySelectorAll('.shape-item').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.shape-slot').forEach(el => el.classList.remove('selected-target'));

      if (selectedShapeId === shape.id) {
        selectedShapeId = null;
      } else {
        selectedShapeId = shape.id;
        item.classList.add('selected');
        playAudioEffect('snap');
        speakIndonesian(shape.name);

        // Highlight matching slot gently
        const matchingSlot = document.querySelector(`.shape-slot[data-shape-id="${shape.id}"]`);
        if (matchingSlot) matchingSlot.classList.add('selected-target');
      }
    });

    shapesContainer.appendChild(item);
  });
}

function handlePlacement(shapeId, slotElement) {
  const targetShapeId = slotElement.dataset.shapeId;
  const shapeData = SHAPES_DATA.find(s => s.id === shapeId);
  const shapeItemElement = document.getElementById(`shape-item-${shapeId}`);

  if (shapeId === targetShapeId) {
    // CORRECT MATCH!
    slotElement.classList.add('filled');
    slotElement.innerHTML = `
      ${shapeData.svg}
      <span class="slot-label" style="color: #2e7d32; font-weight:bold;">${shapeData.name} ✓</span>
    `;

    if (shapeItemElement) {
      shapeItemElement.classList.remove('selected');
      shapeItemElement.classList.add('placed');
    }

    selectedShapeId = null;
    document.querySelectorAll('.shape-slot').forEach(el => el.classList.remove('selected-target'));

    level1PlacedCount++;
    playAudioEffect('chime');

    const praise = getRandomPraise();
    speakIndonesian(`${praise} Ini ${shapeData.name}!`, 350);

    // Check if Level 1 Completed
    if (level1PlacedCount >= SHAPES_DATA.length) {
      setTimeout(() => {
        showCelebrationModal(
          "Hebat Sekali! 🌟",
          "Kamu berhasil memasukkan semua bentuk dengan pas!",
          () => switchLevel(2)
        );
      }, 800);
    }
  } else {
    // WRONG MATCH - Gentle feedback, no punishment!
    playAudioEffect('soft_error');
    slotElement.style.transform = 'scale(0.95)';
    setTimeout(() => slotElement.style.transform = 'none', 200);

    if (shapeItemElement) {
      shapeItemElement.style.animation = 'wiggle 0.4s ease';
      setTimeout(() => shapeItemElement.style.animation = 'none', 400);
    }
  }
}

function resetLevel1() {
  initLevel1();
  speakIndonesian("Ayo coba lagi!");
}

// ==========================================================================
// LEVEL 2: ANIMAL WORLD & SOUNDS
// ==========================================================================

const ANIMALS_DATA = [
  {
    id: 'kucing',
    name: 'Kucing',
    soundText: 'Meow! Meow!',
    audioType: 'cat',
    speech: 'Meow! Ini Kucing!',
    imgSrc: 'images/cat_real.jpg'
  },
  {
    id: 'anjing',
    name: 'Anjing',
    soundText: 'Guk! Guk!',
    audioType: 'dog',
    speech: 'Guk Guk! Ini Anjing!',
    imgSrc: 'images/dog_real.jpg'
  },
  {
    id: 'burung',
    name: 'Burung',
    soundText: 'Cuit! Cuit!',
    audioType: 'bird',
    speech: 'Cuit Cuit! Ini Burung!',
    imgSrc: 'images/bird_real.jpg'
  },
  {
    id: 'sapi',
    name: 'Sapi',
    soundText: 'Moo! Mooo!',
    audioType: 'cow',
    speech: 'Mooo! Ini Sapi!',
    imgSrc: 'images/cow_real.jpg'
  },
  {
    id: 'bebek',
    name: 'Bebek',
    soundText: 'Kwek! Kwek!',
    audioType: 'duck',
    speech: 'Kwek Kwek! Ini Bebek!',
    imgSrc: 'images/duck_real.jpg'
  },
  {
    id: 'gajah',
    name: 'Gajah',
    soundText: 'Tet! Tet!',
    audioType: 'elephant',
    speech: 'Tet Tet! Ini Gajah!',
    imgSrc: 'images/elephant_real.jpg'
  },
  {
    id: 'singa',
    name: 'Singa',
    soundText: 'Roar! Roar!',
    audioType: 'lion',
    speech: 'Roar! Ini Singa Raja Hutan!',
    imgSrc: 'images/lion_real.jpg'
  },
  {
    id: 'monyet',
    name: 'Monyet',
    soundText: 'U-u A-a!',
    audioType: 'monkey',
    speech: 'U-u A-a! Ini Monyet!',
    imgSrc: 'images/monkey_real.jpg'
  },
  {
    id: 'kambing',
    name: 'Kambing',
    soundText: 'Mbekk! Mbekk!',
    audioType: 'goat',
    imgSrc: 'images/goat_real.jpg'
  },
  {
    id: 'kuda',
    name: 'Kuda',
    soundText: 'Hiii-hiii!',
    audioType: 'horse',
    imgSrc: 'images/horse_real.jpg'
  },
  {
    id: 'kelinci',
    name: 'Kelinci',
    soundText: 'Ciap! Ciap!',
    audioType: 'rabbit',
    imgSrc: 'images/rabbit_real.jpg'
  },
  {
    id: 'harimau',
    name: 'Harimau',
    soundText: 'Roar! Roar!',
    audioType: 'tiger',
    imgSrc: 'images/tiger_real.jpg'
  }
];

let quizTargetAnimal = null;

function initLevel2() {
  const animalsGrid = document.getElementById('animalsGrid');
  if (!animalsGrid) return;
  animalsGrid.innerHTML = '';

  ANIMALS_DATA.forEach(animal => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.dataset.animalId = animal.id;
    const avatarContent = animal.imgSrc 
      ? `<img src="${animal.imgSrc}" alt="${animal.name}" class="real-photo-img" />` 
      : animal.svg;

    card.innerHTML = `
      <div class="animal-avatar">${avatarContent}</div>
      <div class="animal-name">${animal.name}</div>
      <div class="animal-sound-text">${animal.soundText}</div>
    `;

    card.addEventListener('click', () => {
      getAudioContext();
      card.classList.add('animating');
      setTimeout(() => card.classList.remove('animating'), 600);

      // Play real audio sound effect directly
      playAudioEffect(animal.audioType);

      // Check quiz mode if active
      if (quizTargetAnimal && quizTargetAnimal.id === animal.id) {
        setTimeout(() => {
          showCelebrationModal(
            "Jawaban Benar! 🎉",
            `Kamu pintar sekali menebak suara ${animal.name}!`,
            () => startNewAnimalQuiz()
          );
        }, 600);
      }
    });

    animalsGrid.appendChild(card);
  });

  startNewAnimalQuiz();
}

function startNewAnimalQuiz() {
  quizTargetAnimal = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
  const quizText = document.getElementById('quizQuestionText');
  if (quizText) {
    quizText.textContent = `Tebak: Mana hewan yang bersuara ini?`;
  }
}

function playCurrentQuizSound() {
  getAudioContext();
  if (quizTargetAnimal) {
    // Add visual button feedback
    const btn = document.getElementById('btnPlayAnimalQuiz');
    if (btn) {
      btn.style.transform = 'scale(1.1)';
      btn.style.background = '#ffe082';
      setTimeout(() => {
        btn.style.transform = 'none';
        btn.style.background = '#ffe0b2';
      }, 400);
    }

    // 1. Play animal sound effect first
    playAudioEffect(quizTargetAnimal.audioType);

    // 2. Speak question prompt AFTER sound effect finishes
    speakIndonesian("Mana hewan yang bersuara tadi?", 750);
  }
}

// ==========================================================================
// LEVEL 3: BUBBLE POP GAME (NUMBERS & FRUITS)
// ==========================================================================

const BUBBLE_ITEMS = [
  { type: 'num', label: '1', speech: 'Satu!', color: 'linear-gradient(135deg, #ff4081, #ff80ab)' },
  { type: 'num', label: '2', speech: 'Dua!', color: 'linear-gradient(135deg, #ab47bc, #ea80fc)' },
  { type: 'num', label: '3', speech: 'Tiga!', color: 'linear-gradient(135deg, #29b6f6, #80d8ff)' },
  { type: 'num', label: '4', speech: 'Empat!', color: 'linear-gradient(135deg, #66bb6a, #b9f6ca)' },
  { type: 'num', label: '5', speech: 'Lima!', color: 'linear-gradient(135deg, #ffa726, #ffe082)' },
  { type: 'fruit', label: '🍎', speech: 'Apel!', color: 'linear-gradient(135deg, #ef5350, #ff8a80)' },
  { type: 'fruit', label: '🍌', speech: 'Pisang!', color: 'linear-gradient(135deg, #ffee58, #ffff8d)' },
  { type: 'fruit', label: '🍊', speech: 'Jeruk!', color: 'linear-gradient(135deg, #ff7043, #ff9e80)' },
  { type: 'fruit', label: '🍓', speech: 'Stroberi!', color: 'linear-gradient(135deg, #ec407a, #ff80ab)' },
  { type: 'fruit', label: '🍇', speech: 'Anggur!', color: 'linear-gradient(135deg, #7e57c2, #b388ff)' }
];

let popCounter = 0;
let bubbleSpawnInterval = null;

function initLevel3() {
  popCounter = 0;
  updatePopCounterDisplay();

  const stage = document.getElementById('bubblesStage');
  stage.innerHTML = '';

  if (bubbleSpawnInterval) clearInterval(bubbleSpawnInterval);

  // Spawn initial bubbles
  for (let i = 0; i < 4; i++) {
    spawnBubble();
  }

  // Continuously spawn bubbles every 1.8 seconds
  bubbleSpawnInterval = setInterval(() => {
    if (currentLevel === 3) {
      const activeBubbles = stage.querySelectorAll('.floating-bubble').length;
      if (activeBubbles < 7) {
        spawnBubble();
      }
    } else {
      clearInterval(bubbleSpawnInterval);
    }
  }, 1800);
}

function spawnBubble() {
  const stage = document.getElementById('bubblesStage');
  if (!stage || currentLevel !== 3) return;

  const item = BUBBLE_ITEMS[Math.floor(Math.random() * BUBBLE_ITEMS.length)];
  const bubble = document.createElement('div');
  bubble.className = 'floating-bubble';

  const size = Math.floor(Math.random() * 30) + 85; // 85px to 115px size for easy tap
  const posX = Math.random() * (stage.clientWidth - size - 20) + 10;
  const speed = Math.random() * 4 + 7; // Slow toddler speed 7s-11s

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.background = item.color;
  bubble.style.left = `${posX}px`;
  bubble.style.bottom = `-${size}px`;

  bubble.innerHTML = `
    <div class="bubble-shine"></div>
    <div class="bubble-inner">${item.label}</div>
  `;

  // Tap handler to POP bubble
  const handlePop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    getAudioContext();

    playAudioEffect('pop');
    speakIndonesian(item.speech);

    createBurstParticles(stage, posX + size / 2, stage.clientHeight - parseFloat(bubble.style.bottom || '0') - size / 2);

    bubble.remove();
    popCounter++;
    updatePopCounterDisplay();

    // Spawn a replacement bubble
    setTimeout(spawnBubble, 400);

    // Milestone celebration every 10 pops!
    if (popCounter % 10 === 0) {
      playAudioEffect('chime');
      showCelebrationModal(
        "Wah Luar Biasa! 🎉",
        `Kamu sudah memecahkan ${popCounter} gelembung!`,
        () => {}
      );
    }
  };

  bubble.addEventListener('pointerdown', handlePop);

  stage.appendChild(bubble);

  // Floating animation using requestAnimationFrame
  let currentY = -size;
  const animateBubble = () => {
    if (!bubble.parentElement) return;
    currentY += 1.2;
    bubble.style.bottom = `${currentY}px`;

    if (currentY > stage.clientHeight + size) {
      bubble.remove();
      spawnBubble();
    } else if (currentLevel === 3) {
      requestAnimationFrame(animateBubble);
    }
  };

  requestAnimationFrame(animateBubble);
}

function updatePopCounterDisplay() {
  const el = document.getElementById('popCount');
  if (el) el.textContent = popCounter;
}

function createBurstParticles(stage, x, y) {
  const numParticles = 8;
  const colors = ['#ff4081', '#ffd54f', '#4caf50', '#29b6f6', '#ab47bc'];

  for (let i = 0; i < numParticles; i++) {
    const p = document.createElement('div');
    p.className = 'bubble-particle';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (i / numParticles) * Math.PI * 2;
    const distance = Math.random() * 50 + 30;

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = '14px';
    p.style.height = '14px';
    p.style.background = color;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);

    stage.appendChild(p);

    setTimeout(() => p.remove(), 500);
  }
}

// ==========================================================================
// LEVEL 4: TEBAK & KENALI ALAT BERAT (HEAVY MACHINERY)
// ==========================================================================

const HEAVY_MACHINERY_DATA = [
  {
    id: 'excavator',
    name: 'Eksavator (Beko)',
    badge: 'Mengeruk Tanah! 🚜',
    audioType: 'hydraulic',
    speech: 'Eksavator! Mengeruk tanah dengan pengeruk besar!',
    hint: 'Alat berat yang punya pengeruk besar untuk keruk tanah',
    imgSrc: 'images/excavator_real_1785861487007.png'
  },
  {
    id: 'bulldozer',
    name: 'Buldoser',
    badge: 'Mendorong Batu! 🪨',
    audioType: 'engine',
    speech: 'Buldoser! Mendorong tanah dan batu-batu keras!',
    hint: 'Alat berat yang dorong batu keras pakai sekop depan',
    imgSrc: 'images/bulldozer_real_1785861502278.png'
  },
  {
    id: 'dump_truck',
    name: 'Truk Jungkit',
    badge: 'Mengangkut Pasir! ⏳',
    audioType: 'horn',
    speech: 'Truk Jungkit! Mengangkut pasir dan merobohkan muatan!',
    hint: 'Truk besar yang bisa angkut dan tuang pasir',
    imgSrc: 'images/dumptruck_real_1785861520356.png'
  },
  {
    id: 'mixer_truck',
    name: 'Truk Molen',
    badge: 'Memutar Semen! 🔄',
    audioType: 'engine',
    speech: 'Truk Molen! Memutar adonan semen agar tetap basah!',
    hint: 'Truk dengan tabung memutar adonan semen',
    imgSrc: 'images/mixertruck_real_1785861540039.png'
  },
  {
    id: 'crane',
    name: 'Mobil Crane',
    badge: 'Mengangkat Beban! 🏗️',
    audioType: 'hydraulic',
    speech: 'Mobil Crane! Mengangkat barang-barang berat ke tempat tinggi!',
    hint: 'Mobil yang punya tiang tinggi untuk angkat barang',
    imgSrc: 'images/crane_real_1785861555903.png'
  },
  {
    id: 'road_roller',
    name: 'Stoom Penggilas',
    badge: 'Meratakan Jalan! 🛣️',
    audioType: 'engine',
    speech: 'Stoom Penggilas! Meratakan jalan raya supaya mulus!',
    hint: 'Mesin dengan roda besi besar penggiles jalan',
    imgSrc: 'images/roadroller_real_1785861573500.png'
  },
  {
    id: 'loader',
    name: 'Front Loader',
    badge: 'Mengambil Tanah! ⛏️',
    audioType: 'hydraulic',
    speech: 'Front Loader! Mengambil tanah lalu memuat ke dalam truk!',
    hint: 'Tractor yang punya sekop angkat di depan',
    imgSrc: 'images/loader_real_1785861627907.png'
  },
  {
    id: 'tractor',
    name: 'Truk Traktor',
    badge: 'Membajak Sawah! 🌾',
    audioType: 'engine',
    speech: 'Truk Traktor! Membajak tanah dan tanah pertanian!',
    hint: 'Mesin traktor untuk bajak tanah dan sawah',
    imgSrc: 'images/tractor_real.jpg'
  }
];

let heavySubmode = 'learn'; // 'learn' | 'quiz'
let quizTargetHeavy = null;

function initLevel4() {
  heavySubmode = 'learn';
  updateHeavySubmodeUI();
  renderHeavyGrid();
}

function switchHeavySubmode(mode) {
  heavySubmode = mode;
  updateHeavySubmodeUI();
  renderHeavyGrid();

  if (mode === 'quiz') {
    startNewHeavyQuiz();
  } else {
    speakIndonesian("Sentuh gambar alat berat untuk dengar suaranya!");
  }
}

function updateHeavySubmodeUI() {
  const tabLearn = document.getElementById('tabHeavyLearn');
  const tabQuiz = document.getElementById('tabHeavyQuiz');
  const quizBar = document.getElementById('heavyQuizBar');

  if (tabLearn) tabLearn.classList.toggle('active', heavySubmode === 'learn');
  if (tabQuiz) tabQuiz.classList.toggle('active', heavySubmode === 'quiz');

  if (quizBar) {
    if (heavySubmode === 'quiz') {
      quizBar.classList.remove('hidden');
    } else {
      quizBar.classList.add('hidden');
    }
  }
}

function renderHeavyGrid() {
  const grid = document.getElementById('machineryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  HEAVY_MACHINERY_DATA.forEach(item => {
    const card = document.createElement('div');
    card.className = 'machinery-card';
    card.dataset.itemId = item.id;
    const avatarContent = item.imgSrc 
      ? `<img src="${item.imgSrc}" alt="${item.name}" class="real-photo-img" />` 
      : item.svg;

    card.innerHTML = `
      <div class="machinery-avatar">${avatarContent}</div>
      <div class="machinery-name">${item.name}</div>
      <div class="machinery-badge">${item.badge}</div>
      <div class="card-actions">
        <button class="action-chip horn">🔊 Suara</button>
      </div>
    `;

    card.addEventListener('click', () => {
      getAudioContext();
      card.classList.add('animating');
      setTimeout(() => card.classList.remove('animating'), 700);

      // Play real audio sound effect directly
      playAudioEffect(item.audioType);

      if (heavySubmode === 'quiz') {
        if (quizTargetHeavy && quizTargetHeavy.id === item.id) {
          setTimeout(() => {
            showCelebrationModal(
              "Hebat Sekali! 🎉",
              `Kamu pintar sekali menebak ${item.name}!`,
              () => startNewHeavyQuiz()
            );
          }, 600);
        } else {
          playAudioEffect('soft_error');
        }
      }
    });

    grid.appendChild(card);
  });
}

function startNewHeavyQuiz() {
  quizTargetHeavy = HEAVY_MACHINERY_DATA[Math.floor(Math.random() * HEAVY_MACHINERY_DATA.length)];
  const qText = document.getElementById('heavyQuizQuestionText');
  if (qText) {
    qText.textContent = `Tebak: Mana ${quizTargetHeavy.name}?`;
  }
  speakIndonesian(`Mana ${quizTargetHeavy.name}?`, 400);
}

function playCurrentHeavyQuizSound() {
  getAudioContext();
  if (quizTargetHeavy) {
    playAudioEffect(quizTargetHeavy.audioType);
    speakIndonesian(`Mana ${quizTargetHeavy.name}?`, 600);
  }
}

// ==========================================================================
// LEVEL 5: DUNIA MOBIL-MOBILAN & SIRINE (TOY VEHICLES)
// ==========================================================================

const VEHICLES_DATA = [
  {
    id: 'fire_truck',
    name: 'Pemadam Kebakaran',
    badge: 'Padamkan Api! 💦',
    audioType: 'firetruck',
    speech: 'Mobil Pemadam Kebakaran! Nwiu nwiu siap padamkan api!',
    imgSrc: 'images/firetruck_real_1785861647105.png'
  },
  {
    id: 'police_car',
    name: 'Mobil Polisi',
    badge: 'Patroli Keamanan! 🚓',
    audioType: 'policecar',
    speech: 'Mobil Polisi! Patroli menjaga keamanan jalan raya!',
    imgSrc: 'images/policecar_real_1785861665439.png'
  },
  {
    id: 'ambulance',
    name: 'Ambulans',
    badge: 'Bantu yang Sakit! 🚑',
    audioType: 'ambulance',
    speech: 'Ambulans! Nwiu nwiu bergegas menolong orang sakit!',
    imgSrc: 'images/ambulance_real_1785861685835.png'
  },
  {
    id: 'school_bus',
    name: 'Bus Sekolah',
    badge: 'Antar Anak Sekolah! 🚌',
    audioType: 'schoolbus',
    speech: 'Bus Sekolah! Telolet telolet antar anak-anak sekolah!',
    imgSrc: 'images/schoolbus_real_1785861705872.png'
  },
  {
    id: 'race_car',
    name: 'Mobil Balap',
    badge: 'Melaju Cepat! 🏎️',
    audioType: 'racecar',
    speech: 'Mobil Balap! Vroom vroom melaju cepat di lintasan!',
    imgSrc: 'images/racecar_real_1785861799146.png'
  },
  {
    id: 'garbage_truck',
    name: 'Truk Sampah',
    badge: 'Bersihkan Kota! 🚛',
    audioType: 'garbagetruck',
    speech: 'Truk Sampah! Menjaga kota tetap bersih dan rapi!',
    imgSrc: 'images/garbagetruck_real_1785861823365.png'
  },
  {
    id: 'taxi',
    name: 'Mobil Taksi',
    badge: 'Antar Penumpang! 🚕',
    audioType: 'taxi',
    speech: 'Mobil Taksi! Tin tin siap mengantar penumpang!',
    imgSrc: 'images/taxi_real.jpg'
  },
  {
    id: 'tow_truck',
    name: 'Mobil Derek',
    badge: 'Derek Kendaraan! 🚜',
    audioType: 'towtruck',
    speech: 'Mobil Derek! Siap menderek mobil yang mogok!',
    imgSrc: 'images/towtruck_real.jpg'
  }
];

let vehicleSubmode = 'learn'; // 'learn' | 'quiz'
let quizTargetVehicle = null;

function initLevel5() {
  vehicleSubmode = 'learn';
  updateVehicleSubmodeUI();
  renderVehiclesGrid();
}

function switchVehicleSubmode(mode) {
  vehicleSubmode = mode;
  updateVehicleSubmodeUI();
  renderVehiclesGrid();

  if (mode === 'quiz') {
    startNewVehicleQuiz();
  } else {
    speakIndonesian("Pilih mobil untuk nyalakan sirine dan klakson!");
  }
}

function updateVehicleSubmodeUI() {
  const tabLearn = document.getElementById('tabVehicleLearn');
  const tabQuiz = document.getElementById('tabVehicleQuiz');
  const quizBar = document.getElementById('vehicleQuizBar');

  if (tabLearn) tabLearn.classList.toggle('active', vehicleSubmode === 'learn');
  if (tabQuiz) tabQuiz.classList.toggle('active', vehicleSubmode === 'quiz');

  if (quizBar) {
    if (vehicleSubmode === 'quiz') {
      quizBar.classList.remove('hidden');
    } else {
      quizBar.classList.add('hidden');
    }
  }
}

function renderVehiclesGrid() {
  const grid = document.getElementById('vehiclesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  VEHICLES_DATA.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.itemId = item.id;
    const avatarContent = item.imgSrc 
      ? `<img src="${item.imgSrc}" alt="${item.name}" class="real-photo-img" />` 
      : item.svg;

    card.innerHTML = `
      <div class="vehicle-avatar">${avatarContent}</div>
      <div class="vehicle-name">${item.name}</div>
      <div class="vehicle-badge">${item.badge}</div>
      <div class="card-actions">
        <button class="action-chip siren">🚨 Sirine / Klakson</button>
      </div>
    `;

    card.addEventListener('click', () => {
      getAudioContext();
      card.classList.add('animating', 'siren-active');
      setTimeout(() => card.classList.remove('animating', 'siren-active'), 800);

      playAudioEffect(item.audioType);

      if (vehicleSubmode === 'learn') {
        speakIndonesian(item.speech, 500);
      } else if (vehicleSubmode === 'quiz') {
        if (quizTargetVehicle && quizTargetVehicle.id === item.id) {
          const praise = getRandomPraise();
          speakIndonesian(`${praise} Benar, ini ${item.name}!`, 600);
          setTimeout(() => {
            showCelebrationModal(
              "Hebat Sekali! 🎉",
              `Kamu pintar sekali menebak ${item.name}!`,
              () => startNewVehicleQuiz()
            );
          }, 700);
        } else {
          playAudioEffect('soft_error');
          speakIndonesian("Coba tebak lagi ya!", 400);
        }
      }
    });

    grid.appendChild(card);
  });
}

function startNewVehicleQuiz() {
  quizTargetVehicle = VEHICLES_DATA[Math.floor(Math.random() * VEHICLES_DATA.length)];
  const qText = document.getElementById('vehicleQuizQuestionText');
  if (qText) {
    qText.textContent = `Tebak: Mana ${quizTargetVehicle.name}?`;
  }
  speakIndonesian(`Mana ${quizTargetVehicle.name}?`, 400);
}

function playCurrentVehicleQuizSound() {
  getAudioContext();
  if (quizTargetVehicle) {
    playAudioEffect(quizTargetVehicle.audioType);
    speakIndonesian(`Mana ${quizTargetVehicle.name}?`, 600);
  }
}

// ==========================================================================
// CELEBRATION MODAL SYSTEM
// ==========================================================================

let pendingNextAction = null;

function showCelebrationModal(title, message, nextCallback) {
  const overlay = document.getElementById('celebrationOverlay');
  const titleEl = document.getElementById('celebrationTitle');
  const msgEl = document.getElementById('celebrationMessage');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  pendingNextAction = nextCallback;
  if (overlay) overlay.classList.remove('hidden');

  playAudioEffect('chime');
}

function closeCelebrationAndNext() {
  const overlay = document.getElementById('celebrationOverlay');
  if (overlay) overlay.classList.add('hidden');

  if (pendingNextAction) {
    pendingNextAction();
    pendingNextAction = null;
  }
}

// ==========================================================================
// INITIALIZATION ON DOM LOAD
// ==========================================================================

window.addEventListener('DOMContentLoaded', () => {
  // Pre-load speech voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // Create ambient background clouds
  const bgDecor = document.getElementById('bgDecorations');
  if (bgDecor) {
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'floating-cloud';
      const width = Math.floor(Math.random() * 80) + 100;
      const height = Math.floor(width * 0.4);
      cloud.style.width = `${width}px`;
      cloud.style.height = `${height}px`;
      cloud.style.top = `${Math.random() * 80}%`;
      cloud.style.animationDelay = `${i * 4}s`;
      bgDecor.appendChild(cloud);
    }
  }

  // Enable Audio Context on first user click/touch anywhere
  const enableAudioOnUserGesture = () => {
    getAudioContext();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  };
  window.addEventListener('click', enableAudioOnUserGesture, { once: true });
  window.addEventListener('touchstart', enableAudioOnUserGesture, { once: true });
  window.addEventListener('pointerdown', enableAudioOnUserGesture, { once: true });

  // Initialize Level 1
  initLevel1();
});
