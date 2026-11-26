# python3 rank.py <measure.json> <groups.json> <ranking.json>: each meld scored against the game's first 23 (their median, side by
# side: half its sum, half its peak), in front and behind counted twice, on a monster once (capped at twice the median); weakest first
import json, statistics as st, sys
M = json.load(open(sys.argv[1]))
G = json.load(open(sys.argv[2]))
grp = {}
for g in ['first23', 'city', 'city2', 'reap', 'redo', 'high']:
    for m in G[g]: grp.setdefault(m, g)
redo = set(G['redo'])
ref = {}
for side in ['front', 'behind', 'foe']:
    for k in ['sum', 'peak']:
        ref[(side, k)] = st.median([M[m]['sides'][side][k] for m in G['first23'] if m in M])
rows = []
for m, r in M.items():
    S = r['sides']; sc = {}
    for side in S:
        sc[side] = 0.5 * S[side]['sum'] / ref[(side, 'sum')] + 0.5 * S[side]['peak'] / ref[(side, 'peak')]
    tot = (sc['front'] * 2 + sc['behind'] * 2 + min(sc['foe'], 2.0)) / 5
    rows.append((tot, m, grp.get(m) + ('+redo' if m in redo and grp.get(m) != 'redo' else ''), sc))
rows.sort()
json.dump([{'id': m, 'score': round(t, 3), 'group': g, 'front': round(sc['front'], 2), 'behind': round(sc['behind'], 2), 'foe': round(sc['foe'], 2)} for t, m, g, sc in rows], open(sys.argv[3], 'w'), indent=0)
for tot, m, g, sc in rows[:999]:
    print(f"{tot:5.2f} {m:14s} {g:12s} F{sc['front']:.2f} B{sc['behind']:.2f} M{sc['foe']:.2f}")
