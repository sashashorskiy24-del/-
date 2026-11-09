"""Builds scenes/<scene>/timing.json: word timestamps (from ASR tokens) + per-frame
voice loudness envelope (used for lip-sync).  Usage: python3 tools/build_timing.py scene_01 17.2"""
import json, sys, wave, numpy as np
scene, dur = sys.argv[1], float(sys.argv[2]); FPS = 30
d = json.load(open('tools/voiceover_full_tokens.json'))
words = []
for t, s in zip(d['tokens'], d['ts']):
    if t.startswith(' ') or not words: words.append({'w': t.strip(), 's': round(s, 3)})
    else: words[-1]['w'] += t
words = [w for w in words if w['s'] < dur]
w = wave.open(f'scenes/{scene}/audio.wav'); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
n = int(round(dur * FPS)); hop = sr // FPS
env = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
db = 20 * np.log10(env); env = np.clip((db + 45) / 30, 0, 1)
# word end = moment loudness drops (or next word start)
for i, x in enumerate(words):
    nxt = words[i+1]['s'] if i+1 < len(words) else dur
    e = x['s'] + 0.12; f = int(e * FPS)
    while f < n and f / FPS < nxt and env[f] > 0.15: f += 1
    x['e'] = round(min(max(f / FPS, x['s'] + 0.15), nxt), 3)
json.dump({'fps': FPS, 'duration': dur, 'words': words, 'env': [round(float(v), 3) for v in env]},
          open(f'scenes/{scene}/timing.json', 'w'), indent=1)
open(f'scenes/{scene}/timing.js', 'w').write('window.TIMING = ' + open(f'scenes/{scene}/timing.json').read() + ';\n')
print(' '.join(f"{x['w']}[{x['s']}-{x['e']}]" for x in words))
