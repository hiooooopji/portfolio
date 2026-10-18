export const ROWS = 6;
export const COLS = 7;
export function emptyBoard() { return Array(ROWS * COLS).fill(0); }
export function landingIndex(board, column) {
  if (!Number.isInteger(column) || column < 0 || column >= COLS) return -1;
  for (let row = ROWS - 1; row >= 0; row--) if (!board[row * COLS + column]) return row * COLS + column;
  return -1;
}
export function winningLine(board, index, target = 4) {
  const mark = board[index];
  if (!mark) return [];
  const row = Math.floor(index / COLS), column = index % COLS;
  for (const [dr, dc] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const line = [index];
    for (const sign of [-1, 1]) {
      let r = row + dr * sign, c = column + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r * COLS + c] === mark) {
        line.push(r * COLS + c); r += dr * sign; c += dc * sign;
      }
    }
    if (line.length >= target) return line;
  }
  return [];
}

export class BotEngine {
  constructor() { this.worker = null; this.pending = new Map(); this.sequence = 0; }
  connect() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./bot-worker.js', import.meta.url), { type: 'module' });
    this.worker.onmessage = ({ data }) => {
      const request = this.pending.get(data.id);
      if (!request) return;
      clearTimeout(request.timer); this.pending.delete(data.id);
      data.error ? request.reject(new Error(data.error)) : request.resolve(data);
    };
    this.worker.onerror = () => this.destroy(new Error('The game engine could not start. Please try again.'));
  }
  request(type, data = {}) {
    this.connect();
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.destroy(new Error('The game engine took too long to respond. Please try again.')), type === 'init' ? 60000 : 15000);
      this.pending.set(id, { resolve, reject, timer });
      this.worker.postMessage({ id, type, ...data });
    });
  }
  destroy(reason = new Error('Game restarted.')) {
    this.worker?.terminate(); this.worker = null;
    for (const request of this.pending.values()) { clearTimeout(request.timer); request.reject(reason); }
    this.pending.clear();
  }
}

export function setupGame() {
  const $ = (id) => document.getElementById(id);
  const engine = new BotEngine();
  const boardElement = $('board'), status = $('game-status'), start = $('start-game');
  let board = emptyBoard(), target = 4, bot = 'worst', humanMark = 1, botMark = 2;
  let active = false, busy = false, session = 0, lastIndex = -1, winners = [];
  const score = { human: 0, bot: 0, draw: 0 };
  const listeners = new Set();
  const snapshot = () => ({ board: [...board], target, bot, humanMark, botMark, active, busy, lastIndex, winners: [...winners], score: { ...score }, status: status.textContent });
  const columns = [];
  for (let c = 0; c < COLS; c++) {
    const button = document.createElement('button');
    button.className = 'board-column'; button.dataset.column = c;
    button.setAttribute('aria-label', `Drop your piece in column ${c + 1}`);
    for (let r = 0; r < ROWS; r++) {
      const slot = document.createElement('span'); slot.className = 'slot'; slot.dataset.index = r * COLS + c;
      button.append(slot);
    }
    const number = document.createElement('span'); number.className = 'column-number'; number.textContent = c + 1; number.setAttribute('aria-hidden', 'true'); button.append(number);
    button.addEventListener('click', () => humanMove(c));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); const direction = event.key === 'ArrowLeft' ? -1 : 1;
        for (let n = 1; n < COLS; n++) { const next = columns[(c + direction * n + COLS) % COLS]; if (!next.disabled) { next.focus(); break; } }
      }
    });
    boardElement.append(button); columns.push(button);
  }
  function setStatus(text, turn = 'human', error = false) {
    status.textContent = text;
    status.parentElement.classList.toggle('error', error);
    $('turn-dot').className = turn === 'bot' ? 'bot-dot' : 'player-dot';
  }
  function render() {
    for (let c = 0; c < COLS; c++) {
      columns[c].disabled = !active || busy || landingIndex(board, c) < 0;
      const contents = [];
      for (let r = 0; r < ROWS; r++) {
        const i = r * COLS + c, slot = columns[c].children[r];
        slot.classList.toggle('winner', winners.includes(i)); slot.replaceChildren();
        if (board[i]) {
          const disc = document.createElement('span');
          disc.className = `disc ${board[i] === humanMark ? 'human' : 'bot'}${i === lastIndex ? ' new' : ''}`;
          slot.append(disc); contents.push(`row ${r + 1}: ${board[i] === humanMark ? 'you' : 'bot'}`);
        }
      }
      columns[c].setAttribute('aria-label', `Column ${c + 1}${landingIndex(board, c) < 0 ? ', full' : ', drop a piece'}. ${contents.length ? contents.join('; ') : 'Empty'}`);
    }
    boardElement.setAttribute('aria-busy', String(busy));
    for (const listener of listeners) listener(snapshot());
  }
  function finishMove(index) {
    winners = winningLine(board, index, target);
    if (winners.length) {
      const humanWon = board[index] === humanMark;
      active = false; busy = false;
      score[humanWon ? 'human' : 'bot']++;
      setStatus(humanWon ? 'You got it. Nicely played!' : 'The bot takes this one. Rematch?', humanWon ? 'human' : 'bot');
      $('game-caption').textContent = humanWon && bot === 'worst' ? 'Your biggest supporter is very proud of you.' : 'There’s always room for one more round.';
    } else if (board.every(Boolean)) {
      active = false; busy = false; score.draw++;
      setStatus('A full board. A worthy draw.'); $('game-caption').textContent = 'Great minds, evenly matched.';
    } else return false;
    for (const key of ['human', 'bot', 'draw']) $(`${key}-score`).textContent = score[key];
    start.innerHTML = 'Play again <span>↗</span>'; start.disabled = false;
    render(); return true;
  }
  async function botMove(currentSession) {
    busy = true; setStatus(bot === 'best' ? 'The Best Bot is thinking…' : 'The Worst Bot is plotting your victory…', 'bot'); render();
    try {
      const result = await engine.request('move', { board, mark: botMark, target, bot });
      if (currentSession !== session) return;
      const index = landingIndex(board, result.column);
      if (index < 0) throw new Error('The bot returned an invalid move. Start a new round to retry.');
      board[index] = botMark; lastIndex = index; busy = false;
      if (!finishMove(index)) { setStatus('Your turn. Pick a column.'); render(); }
    } catch (error) { if (currentSession === session) showError(error); }
  }
  async function humanMove(column) {
    if (!active || busy) return;
    const index = landingIndex(board, column); if (index < 0) return;
    board[index] = humanMark; lastIndex = index;
    if (finishMove(index)) return;
    const currentSession = session; busy = true;
    setStatus(bot === 'best' ? 'The Best Bot is thinking…' : 'The Worst Bot is plotting your victory…', 'bot');
    render();
    await new Promise(resolve => setTimeout(resolve, 240));
    if (currentSession === session) await botMove(currentSession);
  }
  function showError(error) {
    active = false; busy = false; engine.destroy();
    setStatus('Couldn’t load the bots. Please try again.', 'human', true);
    $('game-caption').textContent = error.message;
    start.innerHTML = 'Try again <span>↗</span>'; start.disabled = false; render();
  }
  async function newGame() {
    const currentSession = ++session;
    active = false; busy = true; winners = []; board = emptyBoard(); lastIndex = -1;
    bot = document.querySelector('input[name=opponent]:checked').value;
    target = Number($('connect-target').value); humanMark = $('first-player').value === 'human' ? 1 : 2; botMark = 3 - humanMark;
    start.disabled = true; setStatus('Waking up the bots…'); start.innerHTML = 'Setting the table…';
    $('game-caption').textContent = 'The Python engine loads once. Then it’s all yours.'; render();
    try {
      await engine.request('init');
      if (currentSession !== session) return;
      active = true; busy = false; start.disabled = false; start.innerHTML = 'Start a new round <span>↻</span>';
      $('game-caption').textContent = 'No sign-up. No stakes. Maybe a little pride.';
      if (botMark === 1) await botMove(currentSession);
      else { setStatus('Your turn. Pick a column.'); render(); }
    } catch (error) { if (currentSession === session) showError(error); }
  }
  function settingsChanged() {
    session++; active = false; busy = false; board = emptyBoard(); winners = []; lastIndex = -1;
    target = Number($('connect-target').value); bot = document.querySelector('input[name=opponent]:checked').value;
    $('target-description').textContent = target; $('game-title-x').textContent = target;
    $('bot-note').textContent = bot === 'worst'
      ? 'A bot that deliberately helps its opponent win. Yes, really.'
      : target === 4 && $('first-player').value === 'bot'
        ? 'Standard Connect 4, bot first: the setup for its complete first-player strategy.'
        : 'Timed-search challenge. Choose Connect 4 + Bot first to try its complete first-player strategy.';
    setStatus('Fresh settings. Ready when you are.'); start.disabled = false; start.innerHTML = 'Let’s play <span>↗</span>';
    $('game-caption').textContent = 'No sign-up. No stakes. Maybe a little pride.'; render();
  }
  document.querySelectorAll('input[name=opponent], #connect-target, #first-player').forEach(input => input.addEventListener('change', settingsChanged));
  start.addEventListener('click', newGame);
  document.addEventListener('keydown', event => {
    if (/^[1-7]$/.test(event.key) && event.target.closest('#play') && !/INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) humanMove(Number(event.key) - 1);
  });
  window.addEventListener('pagehide', () => engine.destroy());
  render();
  return {
    getState: snapshot,
    playColumn: humanMove,
    newGame,
    subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); },
  };
}
