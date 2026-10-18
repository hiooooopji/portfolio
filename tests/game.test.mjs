import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBoard, landingIndex, winningLine } from '../dist/game.js';

test('gravity fills a column bottom-up and rejects full or invalid columns', () => {
  const board = emptyBoard();
  for (let row = 5; row >= 0; row--) {
    assert.equal(landingIndex(board, 3), row * 7 + 3);
    board[row * 7 + 3] = 1;
  }
  assert.equal(landingIndex(board, 3), -1);
  for (const column of [-1, 7, 1.5, NaN]) assert.equal(landingIndex(board, column), -1);
});
test('recognizes horizontal, vertical, and both diagonal wins for each target', () => {
  for (const target of [3, 4, 5]) for (const [dr, dc, row, col] of [[0, 1, 5, 0], [1, 0, 0, 2], [1, 1, 0, 0], [1, -1, 0, 6]]) {
    const board = emptyBoard(); let last;
    for (let n = 0; n < target; n++) { last = (row + dr * n) * 7 + col + dc * n; board[last] = 2; }
    assert.equal(winningLine(board, last, target).length, target);
    board[last] = 0; assert.deepEqual(winningLine(board, last, target), []);
  }
});
test('does not treat wrapped rows or mixed pieces as a win', () => {
  const board = emptyBoard();
  for (const index of [33, 34, 35, 36]) board[index] = 1;
  assert.deepEqual(winningLine(board, 35, 4), []);
  board.fill(0); [1, 1, 2, 1].forEach((mark, i) => board[35 + i] = mark);
  assert.deepEqual(winningLine(board, 38, 4), []);
});
test('a full board can be a draw', () => {
  const rows = ['1122112', '2211221', '1122112', '2211221', '1122112', '2211221'];
  const board = rows.join('').split('').map(Number);
  assert.ok(board.every(Boolean));
  for (let i = 0; i < board.length; i++) assert.deepEqual(winningLine(board, i, 4), []);
});
