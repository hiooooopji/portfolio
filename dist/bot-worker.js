import { loadPyodide } from './vendor/pyodide/pyodide.mjs';

let ready;
async function boot() {
  const pyodide = await loadPyodide({ indexURL: new URL('./vendor/pyodide/', import.meta.url).href });
  for (const file of ['submission.py', 'opponent_win.py']) {
    const response = await fetch(new URL(`./agents/${file}`, import.meta.url));
    if (!response.ok) throw new Error(`Unable to load ${file}.`);
    pyodide.FS.writeFile(`/home/pyodide/${file}`, await response.text());
  }
  await pyodide.runPythonAsync('import json, submission, opponent_win');
  return pyodide;
}

// Serialize initialization and moves: Pyodide runs one Python invocation at a time.
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  queue = queue.then(async () => {
    try {
      ready ??= boot();
      const pyodide = await ready;
      if (data.type === 'init') {
        pyodide.runPython('submission._ACTIVE = None\nsubmission._LAST_MODE = None');
        self.postMessage({ id: data.id, ready: true }); return;
      }
      if (data.type !== 'move') throw new Error('Unknown game request.');
      if (!Array.isArray(data.board) || data.board.length !== 42 || !data.board.every(x => [0, 1, 2].includes(x)) || ![1, 2].includes(data.mark) || ![3, 4, 5].includes(data.target) || !['best', 'worst'].includes(data.bot)) throw new Error('Invalid game position.');
      pyodide.globals.set('_request_json', JSON.stringify(data));
      const column = pyodide.runPython(`
_request = json.loads(_request_json)
_module = submission if _request['bot'] == 'best' else opponent_win
_column = _module.agent(
    {'board': _request['board'], 'mark': _request['mark']},
    {'rows': 6, 'columns': 7, 'inarow': _request['target'], 'actTimeout': 2.0}
)
int(_column)
`);
      self.postMessage({ id: data.id, column });
    } catch (error) { self.postMessage({ id: data.id, error: error.message || String(error) }); }
  });
};
