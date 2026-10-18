import { setupGame } from './game.js';
import { createCalmMusic } from './music.js';

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

let audioContext, calmMusic, suspendTimer, soundOn = false, soundBusy = false;
document.getElementById('sound-toggle').addEventListener('click', async event => {
  if (soundBusy) return;
  soundBusy = true;
  const button = event.currentTarget;
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      calmMusic = createCalmMusic(audioContext);
    }
    clearTimeout(suspendTimer);
    await audioContext.resume(); soundOn = !soundOn;
    if (soundOn) calmMusic.start();
    else {
      calmMusic.stop();
      suspendTimer = setTimeout(() => audioContext.suspend().catch(() => {}), 1300);
    }
    button.setAttribute('aria-pressed', String(soundOn)); button.setAttribute('aria-label', soundOn ? 'Pause calm background music' : 'Play calm background music');
    document.getElementById('sound-label').textContent = soundOn ? 'Music on' : 'Music off';
  } catch { toast('Sound isn’t available in this browser.'); }
  finally { soundBusy = false; }
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext) return;
  if (document.hidden) audioContext.suspend().catch(() => {}); else if (soundOn) audioContext.resume().catch(() => {});
});
if (location.protocol === 'file:') {
  const warning = document.createElement('p'); warning.className = 'file-protocol-warning';
  warning.textContent = 'To play Connect X, open this site through its web address or run npm run dev in the project folder.'; document.body.prepend(warning);
}
const game = setupGame();
const workshop = document.getElementById('workshop-view');
let room, roomPromise, opening = 0;
async function enterRoom(target = 'overview', project = null) {
  const request = ++opening;
  if (!workshop.open) workshop.showModal();
  document.body.classList.add('in-workshop');
  document.getElementById('room-loading').hidden = Boolean(room);
  document.getElementById('room-error').hidden = true;
  try {
    roomPromise ??= import('./room3d.js').then(({ createWorkshop }) => createWorkshop({ dialog: workshop, game }));
    room = await roomPromise;
    if (request !== opening || !workshop.open) return;
    document.getElementById('room-loading').hidden = true;
    room.open(target);
    if (project) room.openProject(project);
  } catch (error) {
    roomPromise = null;
    document.getElementById('room-loading').hidden = true;
    document.getElementById('room-error').hidden = false;
    console.warn('3D workshop unavailable:', error.message);
  }
}
function leaveRoom() {
  opening++; room?.close(); workshop.close(); document.body.classList.remove('in-workshop');
  document.getElementById('enter-workshop').focus({ preventScroll: true });
}
document.getElementById('enter-workshop').addEventListener('click', () => enterRoom());
for (const button of document.querySelectorAll('[data-scroll]')) button.addEventListener('click', () => {
  enterRoom({ work: 'monitor', about: 'notebook', play: 'game' }[button.dataset.scroll]);
});
document.getElementById('room-exit').addEventListener('click', leaveRoom);
document.getElementById('room-fallback').addEventListener('click', leaveRoom);
document.getElementById('room-back').addEventListener('click', () => {
  if (room && room.view !== 'overview') room.focus('overview'); else leaveRoom();
});
workshop.addEventListener('cancel', event => {
  event.preventDefault();
  if (room && room.view !== 'overview') room.focus('overview'); else leaveRoom();
});

document.addEventListener('click', event => {
  const readProject = event.target.closest('[data-read-project]');
  if (readProject) {
    event.preventDefault();
    if (workshop.open && room) room.openProject(readProject.dataset.readProject);
    else enterRoom('monitor', readProject.dataset.readProject);
    return;
  }
  const storyLink = event.target.closest('[data-open-story]');
  if (storyLink) {
    const monitorContent = storyLink.closest('.monitor-content');
    const story = monitorContent
      ? [...monitorContent.querySelectorAll('[data-story]')].find(element => element.dataset.story === storyLink.dataset.openStory)
      : document.getElementById(storyLink.dataset.openStory);
    if (story) {
      story.open = true;
      if (monitorContent) {
        event.preventDefault();
        monitorContent.scrollTop = story.offsetTop - 18;
      }
    }
  }
  if (event.target.closest('[data-best-challenge]')) {
    document.querySelector('input[name="opponent"][value="best"]').checked = true;
    document.getElementById('connect-target').value = '4';
    document.getElementById('first-player').value = 'bot';
    document.getElementById('first-player').dispatchEvent(new Event('change', { bubbles: true }));
  }
  const gameLink = event.target.closest('a[href="#play"]');
  if (gameLink && workshop.contains(gameLink) && room) {
    event.preventDefault(); room.focus('game');
  }
  if (storyLink && workshop.open && !storyLink.closest('.monitor-content') && room) {
    event.preventDefault(); room.openProject('connect-x');
  }
});
function openLinkedStory() {
  const story = document.getElementById(location.hash.slice(1));
  if (story?.classList.contains('project-story')) story.open = true;
}
window.addEventListener('hashchange', openLinkedStory);
openLinkedStory();
