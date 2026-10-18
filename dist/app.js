import { setupGame } from './game.js';

const repositories = [
  ['cartoonize', 'Python'], ['chess-bot', 'Python'], ['discord-app', 'Python'],
  ['football-prediction', 'Python'], ['game-jam', 'GDScript'], ['gesture-rec', 'Python'],
  ['git_analyser', 'HTML'], ['Minescript-Scripts', 'Python'],
  ['MinusShorts', 'JavaScript', 'A modified YouTube experience with Shorts removed.'],
  ['ml-distribute', 'JavaScript'], ['test', 'HTML', 'A testing repository.'],
];
const list = document.getElementById('repo-list');
for (const [name, language, description] of repositories) {
  const link = document.createElement('a'); link.className = 'repo-link';
  link.href = `https://github.com/hiooooopji/${name}`; link.target = '_blank'; link.rel = 'noopener noreferrer';
  const label = document.createElement('span'); label.textContent = name;
  if (description) { const small = document.createElement('small'); small.textContent = description; label.append(small); }
  const metadata = document.createElement('span'); metadata.className = 'repo-language'; metadata.textContent = `${language} ↗`;
  link.append(label, metadata); list.append(link);
}
document.getElementById('year').textContent = new Date().getFullYear();
for (const button of document.querySelectorAll('[data-scroll]')) button.addEventListener('click', () => {
  const section = document.getElementById(button.dataset.scroll);
  section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  history.replaceState(null, '', `#${button.dataset.scroll}`);
  const focusTarget = section.querySelector('a, button, input');
  focusTarget?.focus({ preventScroll: true });
});
let toastTimer;
function toast(message) {
  const element = document.getElementById('toast'); element.textContent = message; element.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 2500);
}
document.getElementById('lamp-toggle').addEventListener('click', event => {
  const dimmed = document.getElementById('room-stage').classList.toggle('lamp-dimmed');
  event.currentTarget.setAttribute('aria-pressed', String(dimmed));
  event.currentTarget.setAttribute('aria-label', dimmed ? 'Turn up the desk lamp' : 'Dim the desk lamp');
  toast(dimmed ? 'A little quieter. A little cozier.' : 'The light’s on. Let’s make something.');
});

let audioContext, rainSource, rainGain, soundOn = false, soundBusy = false;
document.getElementById('sound-toggle').addEventListener('click', async event => {
  if (soundBusy) return;
  soundBusy = true;
  const button = event.currentTarget;
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      const length = audioContext.sampleRate * 4, buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
      const samples = buffer.getChannelData(0); let previous = 0;
      for (let i = 0; i < length; i++) { const noise = Math.random() * 2 - 1; previous = (previous + .025 * noise) / 1.025; samples[i] = previous * 4; }
      rainSource = audioContext.createBufferSource(); rainSource.buffer = buffer; rainSource.loop = true;
      const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1800;
      rainGain = audioContext.createGain(); rainGain.gain.value = 0;
      rainSource.connect(filter).connect(rainGain).connect(audioContext.destination); rainSource.start();
    }
    await audioContext.resume(); soundOn = !soundOn;
    rainGain.gain.cancelScheduledValues(audioContext.currentTime);
    rainGain.gain.setTargetAtTime(soundOn ? .22 : 0, audioContext.currentTime, .25);
    button.setAttribute('aria-pressed', String(soundOn)); button.setAttribute('aria-label', soundOn ? 'Turn off rain sounds' : 'Turn on rain sounds');
    document.getElementById('sound-label').textContent = soundOn ? 'Rain on' : 'Sound off';
  } catch { toast('Sound isn’t available in this browser.'); }
  finally { soundBusy = false; }
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext) return;
  if (document.hidden) audioContext.suspend(); else if (soundOn) audioContext.resume().catch(() => {});
});
if (location.protocol === 'file:') {
  const warning = document.createElement('p'); warning.className = 'file-protocol-warning';
  warning.textContent = 'To play Connect X, open this site through its web address or run npm run dev in the project folder.'; document.body.prepend(warning);
}
setupGame();
