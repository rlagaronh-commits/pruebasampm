// AM & PM · Nuestra historia
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Estrellas sin imágenes externas.
const stars = $('#stars');
if (stars) {
  for (let i = 0; i < 82; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.opacity = `${0.16 + Math.random() * 0.48}`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${3 + Math.random() * 5}s`;
    stars.appendChild(star);
  }
}

// Progreso de lectura.
const progressBar = $('#progressBar');
if (progressBar) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// Aparición suave de escenas.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal:not(.visible)').forEach((el) => observer.observe(el));
} else {
  $$('.reveal').forEach((el) => el.classList.add('visible'));
}

const openStory = $('#openStory');
if (openStory) openStory.addEventListener('click', () => $('#capitulo')?.scrollIntoView({ behavior:'smooth' }));

// Corazón final + secreto.
const heartButton = $('#heartButton');
const secretMessage = $('#secretMessage');
if (heartButton && secretMessage) {
  heartButton.addEventListener('click', () => {
    secretMessage.classList.add('show');
    heartButton.textContent = '♥';
    const rect = heartButton.getBoundingClientRect();
    for (let i = 0; i < 16; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = Math.random() > .45 ? '♡' : '✦';
      heart.style.left = `${rect.left + rect.width / 2}px`;
      heart.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
      heart.style.setProperty('--x', `${(Math.random() - .5) * 230}px`);
      heart.style.setProperty('--r', `${(Math.random() - .5) * 100}deg`);
      heart.style.animationDelay = `${Math.random() * .25}s`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 2300);
    }
  });
}

// Clave: se compara el SHA-256, no se deja la clave escrita directamente en el JS.
const STORY_KEY_HASH = '866929623b48a0506d190cad9e5b96f9932c7904d2547069503cf8042696e745';
async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function validStoryKey(value) { return (await sha256(value.trim())) === STORY_KEY_HASH; }

// Modal desde la biblioteca.
const chapterTwoCard = $('#chapterTwoCard');
const keyModal = $('#keyModal');
const keyForm = $('#keyForm');
const storyKey = $('#storyKey');
const keyError = $('#keyError');
if (chapterTwoCard && keyModal) {
  const openKeyModal = () => { keyModal.hidden = false; setTimeout(() => storyKey?.focus(), 80); };
  const closeKeyModal = () => { keyModal.hidden = true; if (keyError) keyError.textContent = ''; };
  chapterTwoCard.addEventListener('click', openKeyModal);
  $$('[data-close-key]').forEach(el => el.addEventListener('click', closeKeyModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !keyModal.hidden) closeKeyModal(); });
  $('#toggleKey')?.addEventListener('click', () => { if (!storyKey) return; storyKey.type = storyKey.type === 'password' ? 'text' : 'password'; });
  keyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await validStoryKey(storyKey.value)) {
      sessionStorage.setItem('ampm-ch2-unlocked', '1');
      window.location.href = 'capitulo-2.html';
    } else {
      keyError.textContent = 'Esa no es nuestra clave ♡';
      $('.key-panel')?.classList.remove('shake');
      requestAnimationFrame(() => $('.key-panel')?.classList.add('shake'));
      storyKey.select();
    }
  });
}

// Pantalla privada del capítulo II.
const chapterLockscreen = $('#chapterLockscreen');
const chapterTwoContent = $('#chapterTwoContent');
const chapterKeyForm = $('#chapterKeyForm');
const chapterKey = $('#chapterKey');
const chapterKeyError = $('#chapterKeyError');
function revealChapterTwo(animate=true) {
  if (!chapterLockscreen || !chapterTwoContent) return;
  if (animate) chapterLockscreen.classList.add('unlocking');
  const wait = animate ? 900 : 0;
  setTimeout(() => {
    chapterLockscreen.classList.add('unlocked');
    document.body.classList.remove('locked');
    chapterTwoContent.setAttribute('aria-hidden', 'false');
  }, wait);
}
if (chapterLockscreen) {
  if (sessionStorage.getItem('ampm-ch2-unlocked') === '1') revealChapterTwo(false);
  $('#toggleChapterKey')?.addEventListener('click', () => { chapterKey.type = chapterKey.type === 'password' ? 'text' : 'password'; });
  chapterKeyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await validStoryKey(chapterKey.value)) {
      sessionStorage.setItem('ampm-ch2-unlocked', '1');
      revealChapterTwo(true);
    } else {
      chapterKeyError.textContent = 'Casi… pero esa puerta no se abre con esa clave ♡';
      chapterKeyForm.classList.remove('shake');
      requestAnimationFrame(() => chapterKeyForm.classList.add('shake'));
      chapterKey.select();
    }
  });
}

// Reloj del silencio: empieza cuando la escena entra en pantalla.
const silenceSeconds = $('#silenceSeconds');
const silenceScene = $('.silence-scene');
if (silenceSeconds && silenceScene && 'IntersectionObserver' in window) {
  let started = false;
  const silenceObserver = new IntersectionObserver(entries => {
    if (!started && entries.some(e => e.isIntersecting)) {
      started = true; let seconds = 0;
      const timer = setInterval(() => {
        seconds += 1; silenceSeconds.textContent = String(seconds).padStart(2,'0');
        if (seconds >= 12) clearInterval(timer);
      }, 1000);
      silenceObserver.disconnect();
    }
  }, { threshold:.5 });
  silenceObserver.observe(silenceScene);
}

// Puerta final interactiva.
const finalDoor = $('#finalDoor');
const doorEndingCopy = $('#doorEndingCopy');
if (finalDoor && doorEndingCopy) {
  const openDoor = () => { finalDoor.classList.add('open'); doorEndingCopy.classList.add('visible-door'); };
  finalDoor.addEventListener('click', openDoor);
  finalDoor.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDoor(); } });
}

// Ambiente: tres mini-temas generativos, suaves y sin archivos externos/copyright.
const soundToggle = $('#soundToggle');
let audioContext, masterGain, ambienceTimer, isPlaying = false, themeIndex = 0;
const themes = [
  { name:'Entre pantallas', chords:[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]] },
  { name:'La puerta', chords:[[220,277.18,329.63],[196,246.94,293.66],[164.81,220,261.63],[174.61,220,277.18]] },
  { name:'AM & PM', chords:[[261.63,329.63,440],[246.94,311.13,392],[220,277.18,349.23],[196,261.63,329.63]] }
];
function playTone(freq, when, duration, gainValue=.035) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine'; osc.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, when);
  gain.gain.exponentialRampToValueAtTime(gainValue, when + .08);
  gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
  osc.connect(gain).connect(masterGain); osc.start(when); osc.stop(when + duration + .1);
}
function scheduleTheme() {
  if (!isPlaying) return;
  const theme = themes[themeIndex % themes.length];
  const now = audioContext.currentTime + .08;
  theme.chords.forEach((chord, ci) => chord.forEach((freq, ni) => playTone(freq, now + ci*2.15 + ni*.23, 2.8, .027)));
  themeIndex += 1;
  ambienceTimer = setTimeout(scheduleTheme, 8400);
  if (soundToggle) soundToggle.title = `Ambiente: ${theme.name}`;
}
async function startAmbientSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return;
  audioContext = audioContext || new AudioContext(); await audioContext.resume();
  masterGain = masterGain || audioContext.createGain();
  try { masterGain.disconnect(); } catch (_) {}
  masterGain.connect(audioContext.destination);
  masterGain.gain.setValueAtTime(.0001, audioContext.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(.42, audioContext.currentTime + 1.2);
  isPlaying = true; soundToggle?.classList.add('active'); soundToggle?.setAttribute('aria-label','Pausar ambiente'); scheduleTheme();
}
function stopAmbientSound() {
  isPlaying = false; clearTimeout(ambienceTimer);
  if (audioContext && masterGain) masterGain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .5);
  soundToggle?.classList.remove('active'); soundToggle?.setAttribute('aria-label','Activar ambiente');
}
soundToggle?.addEventListener('click', () => isPlaying ? stopAmbientSound() : startAmbientSound());
