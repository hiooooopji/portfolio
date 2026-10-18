"""Behavior checks for the exact original Python agents shipped to browsers."""
import sys
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'dist' / 'agents'))
import submission
import opponent_win

def config(target=4):
    return dict(rows=6, columns=7, inarow=target, actTimeout=.05)

class AgentsTest(unittest.TestCase):
    def test_original_files_are_unmodified(self):
        for filename in ['submission.py', 'opponent_win.py']:
            original = root.parent / filename
            if original.exists():
                self.assertEqual(original.read_bytes(), (root/'dist'/'agents'/filename).read_bytes())

    def test_best_takes_immediate_win_and_blocks_opponent(self):
        for target in [3, 4, 5]:
            for player in [1, 2]:
                board = [0] * 42
                for col in range(target - 1): board[35 + col] = player
                self.assertEqual(submission.agent(dict(board=board, mark=2), config(target)), target - 1)

    def test_opening_policy_and_deliberately_weak_opening(self):
        board = [0] * 42
        self.assertEqual(submission.agent(dict(board=board, mark=1), config()), 3)
        self.assertEqual(opponent_win.agent(dict(board=board, mark=1), config()), 0)

    def test_worst_offers_human_win(self):
        board = [0] * 42
        board[35:38] = [1, 1, 1]
        move = opponent_win.agent(dict(board=board, mark=2), config())
        self.assertNotEqual(move, 3)
        self.assertIn(move, range(7))

    def test_only_legal_column_for_both_agents_and_all_targets(self):
        board = [1 if (r+c)%2 else 2 for r in range(6) for c in range(7)]
        board[4] = 0
        for module in [submission, opponent_win]:
            for target in [3, 4, 5]:
                self.assertEqual(module.agent(dict(board=board, mark=2), config(target)), 4)

if __name__ == '__main__': unittest.main()
