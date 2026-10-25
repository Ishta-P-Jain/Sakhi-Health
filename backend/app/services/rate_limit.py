"""Tiny in-memory sliding-window limiter to protect the LLM key on a public demo URL.
Single-process only; use Redis if you ever run several workers."""
import time
from collections import defaultdict, deque

_hits: dict[str, deque] = defaultdict(deque)


def allow(key: str, limit: int, window: int = 60) -> bool:
    now = time.monotonic()
    q = _hits[key]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return False
    q.append(now)
    if len(_hits) > 5000:  # crude memory guard
        for k in [k for k, v in _hits.items() if not v or now - v[-1] > window]:
            _hits.pop(k, None)
    return True
