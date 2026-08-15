document.documentElement.classList.remove('no-js');
// AM & PM · Nuestra historia
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Cielo vivo: estrellas ligeras, sin canvas ni imágenes externas para rendir bien en Safari/iPhone.

// iOS Safari: viewport is intentionally locked at scale 1.
// The login stays fixed while the keyboard is open; no visualViewport layout mutations.

const stars = $('#stars');
if (stars) {
  const starCount = matchMedia('(max-width: 600px)').matches ? 112 : 150;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < starCount; i += 1) {
    const star = document.createElement('span');
    const bright = Math.random() > .88;
    star.className = `star${bright ? ' star-bright' : ''}`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--star-opacity', `${0.22 + Math.random() * 0.58}`);
    star.style.setProperty('--star-scale', `${0.72 + Math.random() * 0.72}`);
    star.style.animationDelay = `${-Math.random() * 8}s`;
    star.style.animationDuration = `${3.3 + Math.random() * 5.7}s`;
    fragment.appendChild(star);
  }
  stars.appendChild(fragment);
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

// Acceso privado general. En GitHub Pages es una barrera de privacidad casual,
// no autenticación de servidor. Solo se almacena el hash de la contraseña.
const SITE_PASSWORD_HASH = '961a25ce327549145fa31a67642b36a1b7dd4d103411130dfc1e8dc2cca53e4c';
const loginGate = $('#loginGate');
const siteLoginForm = $('#siteLoginForm');
const sitePassword = $('#sitePassword');
const siteLoginError = $('#siteLoginError');

async function validSiteLogin(password) {
  return (await sha256((password || '').trim())) === SITE_PASSWORD_HASH;
}
function showUnlockedSite() {
  document.body.classList.remove('private-locked');
  loginGate?.classList.add('hidden');
}
function finishSiteLogin() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  sessionStorage.setItem('ampm-site-auth','1');
  // A fresh navigation is deliberate: iOS Safari can retain the visual viewport
  // used by a focused field after it closes. Reloading restores a true 1:1 viewport.
  const next = new URLSearchParams(location.search).get('next');
  const destination = next === 'capitulo-2.html' ? 'index.html?chapter=2' : (next === 'capitulo-1.html' ? next : 'index.html?opened=1');
  setTimeout(() => location.replace(destination), 40);
}
if (loginGate) {
  if (sessionStorage.getItem('ampm-site-auth') === '1') showUnlockedSite();
  else sitePassword?.removeAttribute('autofocus');
  $('#toggleSitePassword')?.addEventListener('click', () => {
    if (!sitePassword) return;
    sitePassword.type = sitePassword.type === 'password' ? 'text' : 'password';
  });
  siteLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await validSiteLogin(sitePassword?.value)) {
      finishSiteLogin();
    } else {
      if (siteLoginError) siteLoginError.textContent = 'Contraseña incorrecta';
      $('.login-minimal')?.classList.remove('shake');
      requestAnimationFrame(() => $('.login-minimal')?.classList.add('shake'));
      sitePassword?.select();
    }
  });
}
$('#logoutButton')?.addEventListener('click', () => {
  sessionStorage.removeItem('ampm-site-auth');
  sessionStorage.removeItem('ampm-ch2-unlocked');
  sessionStorage.removeItem('ampm-preview-ch2');
  location.href = 'index.html';
});


// Home → índice: one intentional, smooth viewport transition on iPhone Safari.
const editorialCta = $('.editorial-cta');
const contentsSection = $('#biblioteca');
editorialCta?.addEventListener('click', (e) => {
  if (!contentsSection) return;
  e.preventDefault();
  contentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  try { history.replaceState(null, '', '#biblioteca'); } catch (_) {}
});

// Capítulo II: se habilita el 17 de agosto de 2026 a las 00:00 en España peninsular (CEST, UTC+2).
const chapterTwoCard = $('#chapterTwoCard');
const chapterTwoCountdown = $('#chapterTwoCountdown');
const keyModal = $('#keyModal');
const keyForm = $('#keyForm');
const storyKey = $('#storyKey');
const keyError = $('#keyError');
const CHAPTER_TWO_RELEASE = new Date('2026-08-17T00:00:00+02:00');

function chapterTwoPreviewEnabled() { return sessionStorage.getItem('ampm-preview-ch2') === '1'; }
function chapterTwoIsReleased() { return chapterTwoPreviewEnabled() || Date.now() >= CHAPTER_TWO_RELEASE.getTime(); }
function updateChapterTwoCountdown() {
  if (!chapterTwoCard || !chapterTwoCountdown) return;
  const preview = chapterTwoPreviewEnabled();
  const remaining = preview ? 0 : CHAPTER_TWO_RELEASE.getTime() - Date.now();
  const meta = chapterTwoCountdown.closest('.chapter-row-meta');
  if (remaining <= 0) {
    chapterTwoCountdown.textContent = preview ? 'VISTA PREVIA' : 'YA DISPONIBLE';
    chapterTwoCard.classList.add('chapter-released');
    chapterTwoCard.removeAttribute('aria-disabled');
    if (meta) {
      const label = meta.querySelector('small');
      if (label) label.textContent = preview ? 'Modo pruebas' : '';
      const icon = meta.querySelector('b');
      if (icon) {
        icon.classList.remove('status-icon-clock');
        icon.innerHTML = preview
          ? '<svg viewBox="0 0 24 24" focusable="false"><path d="M8 16 16 8"></path><path d="M10 8h6v6"></path></svg>'
          : '<svg viewBox="0 0 24 24" focusable="false"><path d="m7.5 12.5 3 3 6-7"></path></svg>';
      }
    }
    return;
  }
  chapterTwoCard.setAttribute('aria-disabled','true');
  chapterTwoCard.classList.remove('chapter-released');
  if (meta) {
    const label = meta.querySelector('small');
    if (label) label.textContent = 'Se desbloquea en';
    const icon = meta.querySelector('b');
    if (icon && !icon.classList.contains('status-icon-clock')) {
      icon.classList.add('status-icon-clock');
      icon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="8.25"></circle><path d="M12 7.5v5l3.5 2"></path></svg>';
    }
  }
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  chapterTwoCountdown.textContent = `${days}d ${String(hours).padStart(2,'0')}h ${String(minutes).padStart(2,'0')}m ${String(seconds).padStart(2,'0')}s`;
}
if (chapterTwoCountdown) {
  updateChapterTwoCountdown();
  setInterval(updateChapterTwoCountdown, 1000);
}

const previewHotspot = $('#previewHotspot');
previewHotspot?.addEventListener('click', () => {
  sessionStorage.setItem('ampm-preview-ch2','1');
  updateChapterTwoCountdown();
  if (keyModal) {
    keyModal.hidden = false;
    setTimeout(() => storyKey?.focus(), 80);
  }
});

if (chapterTwoCard && keyModal) {
  const openKeyModal = () => {
    if (!chapterTwoIsReleased()) return;
    keyModal.hidden = false;
    setTimeout(() => storyKey?.focus(), 80);
  };
  const closeKeyModal = () => { keyModal.hidden = true; if (keyError) keyError.textContent = ''; };
  chapterTwoCard.addEventListener('click', openKeyModal);
  $$('[data-close-key]').forEach(el => el.addEventListener('click', closeKeyModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !keyModal.hidden) closeKeyModal(); });
  $('#toggleKey')?.addEventListener('click', () => { if (!storyKey) return; storyKey.type = storyKey.type === 'password' ? 'text' : 'password'; });
  keyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await validStoryKey(storyKey.value)) {
      sessionStorage.setItem('ampm-ch2-unlocked', '1');
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      keyModal.hidden = true;
      openChapterTwoInApp(true);
    } else {
      keyError.textContent = 'Esa no es nuestra clave ♡';
      $('.key-panel')?.classList.remove('shake');
      requestAnimationFrame(() => $('.key-panel')?.classList.add('shake'));
      storyKey.select();
    }
  });
}

// Capítulo II dentro de la misma Web App. En iPhone nunca abandonamos index.html:
// el capítulo se monta en un iframe de mismo origen a pantalla completa. Así Safari
// no abre una ventana/navegador independiente al pasar la segunda contraseña.
const chapterAppShell = $('#chapterAppShell');
const chapterAppFrame = $('#chapterAppFrame');
let chapterShellOpening = false;

function openChapterTwoInApp(updateHistory = true) {
  if (!chapterAppShell || !chapterAppFrame || chapterShellOpening) return;
  chapterShellOpening = true;
  sessionStorage.setItem('ampm-ch2-unlocked', '1');
  document.body.classList.add('chapter-shell-open');
  chapterAppShell.hidden = false;
  if (!chapterAppFrame.src || chapterAppFrame.src === 'about:blank') {
    chapterAppFrame.src = 'capitulo-2.html?embedded=1';
  }
  if (updateHistory) {
    try { history.pushState({ ampmChapter: 2 }, '', 'index.html?chapter=2'); } catch (_) {}
  }
  requestAnimationFrame(() => {
    chapterAppShell.classList.add('is-open');
    chapterShellOpening = false;
  });
}

function closeChapterTwoInApp(updateHistory = true) {
  if (!chapterAppShell || !chapterAppFrame) return;
  chapterAppShell.classList.remove('is-open');
  document.body.classList.remove('chapter-shell-open');
  if (updateHistory) {
    try { history.replaceState({ ampmHome: true }, '', 'index.html?opened=1#biblioteca'); } catch (_) {}
  }
  window.setTimeout(() => {
    chapterAppShell.hidden = true;
    chapterAppFrame.src = 'about:blank';
    document.getElementById('biblioteca')?.scrollIntoView({ block: 'start' });
  }, 240);
}

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin) return;
  if (event.data === 'ampm-close-chapter2') closeChapterTwoInApp(true);
});

window.addEventListener('popstate', () => {
  const wantsChapter = new URLSearchParams(location.search).get('chapter') === '2';
  if (wantsChapter && sessionStorage.getItem('ampm-ch2-unlocked') === '1') openChapterTwoInApp(false);
  else if (chapterAppShell && !chapterAppShell.hidden) closeChapterTwoInApp(false);
});

if (chapterAppShell && new URLSearchParams(location.search).get('chapter') === '2' && sessionStorage.getItem('ampm-ch2-unlocked') === '1') {
  requestAnimationFrame(() => openChapterTwoInApp(false));
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

// El juego de los nombres: al llegar con el swipe/scroll, las tres
// interrogaciones se transforman una sola vez en María · Elena · del Carmen.
const namesScene = $('.names-scene');
if (namesScene) {
  const revealNames = () => namesScene.classList.add('names-revealed');
  if ('IntersectionObserver' in window) {
    const namesObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .34)) {
        requestAnimationFrame(() => revealNames());
        namesObserver.disconnect();
      }
    }, { threshold:[.18,.34,.55], rootMargin:'0px 0px -8% 0px' });
    namesObserver.observe(namesScene);
  } else {
    revealNames();
  }
}

// Cuando Capítulo II vive dentro del shell de la Web App, sus botones de volver
// cierran el capítulo en el padre en vez de navegar a otra página de Safari.
if (new URLSearchParams(location.search).get('embedded') === '1' && window.parent !== window) {
  document.body.classList.add('embedded-chapter');
  $$('.story-nav, .back-top').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.parent.postMessage('ampm-close-chapter2', location.origin);
    });
  });
}

/* ==========================================================
   V12 · Capítulo II vivo
   Cada dinámica importante tiene entrada propia + interacción táctil.
   ========================================================== */
(() => {
  if (!document.body.classList.contains('chapter-two-page')) return;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const q = (s, root=document) => root.querySelector(s);
  const qa = (s, root=document) => Array.from(root.querySelectorAll(s));

  const interactiveSelectors = [
    '.bridge-scene','.question-scene','.sims-scene','.chat-scene','.names-scene',
    '.nothing-scene','.silence-scene','.follow-scene','.ghost-scene','.fan-scene',
    '.final-chat','.timezone-scene','.door-finale'
  ];
  const scenes = qa(interactiveSelectors.join(','));
  scenes.forEach(scene => scene.classList.add('interactive-scene'));

  // Independent scene timelines. Generic .reveal still handles the surrounding prose.
  const activate = (scene) => scene.classList.add('scene-activated');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => activate(entry.target));
          sceneObserver.unobserve(entry.target);
        }
      });
    }, { threshold:[.06,.14], rootMargin:'0px 0px -3% 0px' });
    scenes.forEach(scene => sceneObserver.observe(scene));
    // Safari Web App can restore scroll before IntersectionObserver settles.
    // Reveal any scene that is already close to the viewport so nothing remains hidden.
    window.setTimeout(() => {
      scenes.forEach(scene => {
        if (scene.classList.contains('scene-activated')) return;
        const r = scene.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.12 && r.bottom > -80) activate(scene);
      });
    }, 320);
  } else {
    scenes.forEach(activate);
  }

  const makeTappable = (el, label, fn) => {
    if (!el) return;
    el.classList.add('tap-affordance');
    if (!/^(BUTTON|A|INPUT)$/.test(el.tagName)) {
      el.setAttribute('role','button');
      el.setAttribute('tabindex','0');
      if (label) el.setAttribute('aria-label',label);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); }
      });
    }
    el.addEventListener('click', fn);
  };

  const restartClass = (el, cls, ms=900) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    window.setTimeout(() => el.classList.remove(cls), ms);
  };

  const burst = (origin, chars=['✦','♡','·'], count=9) => {
    if (!origin || reduceMotion) return;
    const rect = origin.getBoundingClientRect();
    for (let i=0;i<count;i++) {
      const star = document.createElement('span');
      star.className = 'door-spark';
      star.textContent = chars[i % chars.length];
      star.style.left = `${rect.left + rect.width/2 + window.scrollX}px`;
      star.style.top = `${rect.top + rect.height/2 + window.scrollY}px`;
      star.style.setProperty('--dx', `${(Math.random()-.5)*150}px`);
      star.style.setProperty('--dy', `${-35-Math.random()*115}px`);
      star.style.setProperty('--rot', `${(Math.random()-.5)*180}deg`);
      document.body.appendChild(star);
      window.setTimeout(() => star.remove(), 1500);
    }
  };

  // 1) The work bridge sends a pulse when touched.
  const bridge = q('.bridge-scene');
  makeTappable(q('.bridge-visual'), 'Hacer latir el puente entre AM y PM', () => restartClass(bridge,'bridge-pulse',1700));

  // 2) Thoughts can be stepped through with each tap.
  const questionScene = q('.question-scene');
  const questions = qa('.question-stack p', questionScene || document);
  let questionIndex = -1;
  makeTappable(q('.question-stack'), 'Recorrer las tres preguntas', () => {
    questionIndex = (questionIndex + 1) % Math.max(questions.length,1);
    questions.forEach((p,i) => p.classList.toggle('question-focus', i === questionIndex));
  });

  // 3) Sims console: tap the plumbob/console and the traits react.
  const simsScene = q('.sims-scene');
  makeTappable(q('.sims-console'), 'Animar el Sim de PM', () => {
    restartClass(simsScene,'sim-boost',950);
    burst(q('.plumbob'), ['◆','✦','·'],7);
  });

  // 4) Every chat message accepts a tiny heart reaction.
  const chatWindow = q('.chat-window');
  qa('.chat-window .message').forEach(message => {
    makeTappable(message, 'Reaccionar a este mensaje', (event) => {
      restartClass(message,'message-reacted',650);
      const reaction = document.createElement('span');
      reaction.className = 'tap-reaction'; reaction.textContent = '♡';
      const host = chatWindow || message.parentElement;
      const hostRect = host.getBoundingClientRect();
      const msgRect = message.getBoundingClientRect();
      reaction.style.left = `${msgRect.left - hostRect.left + msgRect.width*.72}px`;
      reaction.style.top = `${msgRect.top - hostRect.top + 4}px`;
      host.style.position = 'relative'; host.appendChild(reaction);
      window.setTimeout(() => reaction.remove(), 1400);
    });
  });

  // 5) Names already reveal on scroll; each one sparkles when touched.
  qa('.name-pill').forEach(pill => makeTappable(pill, `Animar ${q('b',pill)?.textContent || 'nombre'}`, () => {
    restartClass(pill,'name-tapped',760); burst(pill,['✦','♡'],5);
  }));

  // 6) Nada: tap to make the word echo once.
  const nothingScene = q('.nothing-scene');
  makeTappable(q('.nothing-scene h3'), 'Hacer eco de Nada', () => restartClass(nothingScene,'nothing-tapped',950));

  // 7) Silence clock: one deliberate beat.
  const silence = q('.silence-scene');
  makeTappable(q('.silence-clock'), 'Tocar el reloj del silencio', () => restartClass(silence,'clock-tapped',900));

  // 8) TikTok notification buzzes and releases a tiny signal.
  const tiktokCard = q('.tiktok-card');
  makeTappable(tiktokCard, 'Animar la notificación de TikTok', () => {
    restartClass(tiktokCard,'social-tapped',620); burst(tiktokCard,['♪','✦','♡'],8);
  });

  // 9) Instagram notification + Soy tu fan both react independently.
  const instaCard = q('.insta-card');
  makeTappable(instaCard, 'Animar la notificación de Instagram', () => {
    restartClass(instaCard,'social-tapped',620); burst(instaCard,['◎','✦','♡'],7);
  });
  const fanMessage = q('.fan-message');
  makeTappable(fanMessage, 'Reaccionar a Soy tu fan', () => {
    restartClass(fanMessage,'fan-tapped',800); burst(fanMessage,['♡','♥','✦'],10);
  });

  // 10) Final risky message gets a restrained glow on tap.
  const finalChat = q('.final-chat');
  makeTappable(q('.danger-message'), 'Destacar la confesión disfrazada', () => restartClass(finalChat,'danger-tapped',1100));

  // 11) Time zone heart sends a visual pulse between both worlds.
  const timezone = q('.timezone-scene');
  const timeHeart = q('.clock-pair > i');
  makeTappable(timeHeart, 'Enviar un latido entre España y Venezuela', () => {
    restartClass(timezone,'time-pulse',1300); burst(timeHeart,['♡','✦'],8);
  });

  // 12) Enhance the existing final door with a sparkle burst, without replacing its logic.
  const door = q('#finalDoor');
  door?.addEventListener('click', () => burst(door,['✦','♡','·'],14));

  // Tiny haptics when available in the installed Web App / supported browsers.
  document.addEventListener('click', (event) => {
    if (event.target.closest('.tap-affordance,#finalDoor,.heart-button') && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }
  }, { passive:true });
})();
