"""ConnectX agent that deliberately helps the other player win.

Standalone, standard-library-only Kaggle submission. It never intentionally
returns an illegal move or crashes. This is a bounded heuristic search, NOT a
proof that the opponent will win. On opponent turns it models a player who
usually chooses a strong continuation and always takes an immediate win.
"""
import math
import time


def agent(observation, configuration):
    get = lambda obj, key, default: obj.get(key, default) if isinstance(obj, dict) else getattr(obj, key, default)
    started = time.perf_counter()
    rows = int(get(configuration, 'rows', 6))
    cols = int(get(configuration, 'columns', 7))
    target = int(get(configuration, 'inarow', 4))
    board = get(observation, 'board', [])
    mark = int(get(observation, 'mark', 1))
    timeout = float(get(configuration, 'actTimeout', 2))
    deadline = started + max(0.001, min(1.4, timeout * 0.70))
    stride = rows + 1
    mine = theirs = 0
    for r in range(rows):
        for c in range(cols):
            bit = 1 << (c * stride + rows - 1 - r)
            if board[r * cols + c] == mark:
                mine |= bit
            elif board[r * cols + c]:
                theirs |= bit
    full = sum(((1 << rows) - 1) << (c * stride) for c in range(cols))
    bottom = sum(1 << (c * stride) for c in range(cols))
    columns = [((1 << rows) - 1) << (c * stride) for c in range(cols)]
    # A losing standard opening gives a perfect second player a winning position.
    if not (mine | theirs) and (rows, cols, target) == (6, 7, 4):
        return 0

    def won(p):
        for shift in (1, stride, stride - 1, stride + 1):
            line = p
            for length in range(1, target):
                line &= p >> (shift * length)
            if line:
                return True
        return False

    def moves(a, b):
        possible = ((a | b) + bottom) & full
        return [(c, possible & mask) for c, mask in enumerate(columns) if possible & mask]

    legal = moves(mine, theirs)
    if not legal:
        return 0  # Terminal boards are not normally passed to an agent.
    safe = [(c, bit) for c, bit in legal if not won(mine | bit)]
    if not safe:
        return int(legal[0][0])  # An own win can be unavoidable.

    # Offer an immediate win, preferring more winning replies. A rational
    # opponent takes one, but a random or uncooperative opponent need not.
    offers = []
    for c, bit in safe:
        replies = moves(mine | bit, theirs)
        wins = sum(won(theirs | reply) for _, reply in replies)
        if wins:
            offers.append((wins / len(replies), wins, -abs(c - (cols - 1) / 2), c))
    if offers:
        return int(max(offers)[-1])

    lines = []
    for r in range(rows):
        for c in range(cols):
            for dr, dc in ((1, 0), (0, 1), (1, 1), (1, -1)):
                if 0 <= r + (target - 1) * dr < rows and 0 <= c + (target - 1) * dc < cols:
                    lines.append(sum(1 << ((c + j * dc) * stride + r + j * dr) for j in range(target)))
    weights = [0] + [4 ** n for n in range(1, target + 1)]

    def evaluate(a, b):
        potential = 0
        for line in lines:
            us, them = (line & a).bit_count(), (line & b).bit_count()
            if not us:
                potential += weights[them]
            if not them:
                potential -= weights[us]
        return 100 * math.tanh(potential / 160)

    nodes = 0
    cache = {}

    def search(a, b, our_turn, depth):
        nonlocal nodes
        nodes += 1
        if nodes % 64 == 0 and time.perf_counter() >= deadline:
            raise TimeoutError
        key = a, b, our_turn, depth
        if key in cache:
            return cache[key]
        choices = moves(a, b)
        if not choices:
            return 0.0
        if not our_turn and any(won(b | bit) for _, bit in choices):
            return 1000.0
        if depth <= 0:
            return evaluate(a, b)
        if our_turn:
            values = [(-1000.0 if won(a | bit) else
                       0.99 * search(a | bit, b, False, depth - 1)) for _, bit in choices]
            result = max(values)
        else:
            values = [0.99 * search(a, b | bit, True, depth - 1) for _, bit in choices]
            # A mixture of strongest continuation and random legal play.
            # This is a utility score, not a calibrated win probability.
            result = 0.75 * max(values) + 0.25 * sum(values) / len(values)
        if len(cache) < 100000:
            cache[key] = result
        return result

    # Static fallback remains legal and avoids our own immediate win even if
    # the first search iteration does not finish before the deadline.
    safe.sort(key=lambda move: evaluate(mine | move[1], theirs), reverse=True)
    chosen = safe[0][0]
    remaining = rows * cols - (mine | theirs).bit_count()
    for depth in range(1, min(remaining, 10) + 1):
        if time.perf_counter() >= deadline:
            break
        scores = []
        try:
            for c, bit in safe:
                score = search(mine | bit, theirs, False, depth)
                scores.append((score, c, bit))
        except TimeoutError:
            break
        scores.sort(key=lambda item: item[0], reverse=True)
        chosen = scores[0][1]
        safe = [(c, bit) for _, c, bit in scores]
    return int(chosen)
