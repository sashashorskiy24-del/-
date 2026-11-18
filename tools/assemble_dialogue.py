"""Builds a scene's voice track from separately generated TTS takes (one file per character).

    python3 tools/assemble_dialogue.py <scene>

Reads scenes/<scene>/dialogue.json:
  lines[]: {who, src, a, b, gap, text}  — cut [a, b] from src, placed `gap` s after the previous line ends
  tail: silence after the last line, fps: frame rate
Writes scenes/<scene>/audio.wav, timing.json and timing.js (same format as build_timing.py plus `lines`).

There is no ASR here, so word times are estimated: the line's text is split at punctuation
into chunks; if the take has the same number of voiced stretches, chunks map onto them one-to-one,
otherwise words are spread over the voiced time by syllable count.
"""
import json, re, subprocess, sys, wave
import numpy as np

scene = sys.argv[1]
cfg = json.load(open(f'scenes/{scene}/dialogue.json'))
FPS, SR = cfg.get('fps', 30), 44100

def load(src):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768

def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower())
    n = len(re.findall(r'[aeiouy]+', w)) - (1 if w.endswith('e') and len(w) > 3 and not w.endswith('le') else 0)
    return max(1, n)

def voiced(seg, min_gap=0.09):
    hop = SR // 100
    e = np.array([np.sqrt(np.mean(seg[i:i + hop] ** 2) + 1e-12) for i in range(0, len(seg), hop)])
    on = 20 * np.log10(e) > -38
    runs, s = [], None
    for i, v in enumerate(on):
        if v and s is None: s = i
        if not v and s is not None: runs.append([s, i]); s = None
    if s is not None: runs.append([s, len(on)])
    merged = []
    for r in runs:
        if merged and (r[0] - merged[-1][1]) / 100 < min_gap: merged[-1][1] = r[1]
        else: merged.append(r)
    return [[a / 100, b / 100] for a, b in merged if (b - a) >= 4]

cache, track, words, lines = {}, [], [], []
t = 0.0
for ln in cfg['lines']:
    if ln['src'] not in cache: cache[ln['src']] = load(ln['src'])
    seg = cache[ln['src']][int(ln['a'] * SR):int(ln['b'] * SR)].copy()
    fade = int(0.012 * SR); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    t += ln['gap']
    start = t
    track.append((int(round(start * SR)), seg))
    toks = ln['text'].split()
    # chunks split after punctuation
    chunks, cur = [], []
    for w in toks:
        cur.append(w)
        if re.search(r'[.,?!]$', w): chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    vs = voiced(seg)
    i0 = len(words)
    def spread(ws, a, b):
        tot = sum(syl(w) for w in ws); x = a
        for w in ws:
            d = (b - a) * syl(w) / tot
            words.append({'w': w, 's': round(start + x, 3), 'e': round(start + x + d, 3)}); x += d
    if len(vs) == len(chunks):
        for ch, (a, b) in zip(chunks, vs): spread(ch, a, b)
    else:
        # map syllable positions through the concatenated voiced time
        tot_v = sum(b - a for a, b in vs)
        def at(k):
            for a, b in vs:
                if k <= b - a: return a + k
                k -= b - a
            return vs[-1][1]
        tot = sum(syl(w) for w in toks); acc = 0
        for w in toks:
            s = at(tot_v * acc / tot); acc += syl(w); e = at(tot_v * acc / tot)
            words.append({'w': w, 's': round(start + s, 3), 'e': round(start + e, 3)})
    lines.append({'who': ln['who'], 's': round(start + vs[0][0], 3), 'e': round(start + vs[-1][1], 3),
                  'w': [i0, len(words) - 1], 'text': ln['text'], 'chunks_matched': len(vs) == len(chunks)})
    t = start + len(seg) / SR

dur = round(t + cfg.get('tail', 1.5), 3)
out = np.zeros(int(dur * SR) + 1, dtype=np.float32)
for off, seg in track: out[off:off + len(seg)] += seg
pk = np.max(np.abs(out)); out = out / pk * 0.89 if pk > 0 else out
w = wave.open(f'scenes/{scene}/audio.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()

n, hop = int(round(dur * FPS)), SR // FPS
env = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2) + 1e-12) if i * hop < len(out) else 1e-6 for i in range(n)])
env = np.clip((20 * np.log10(env) + 45) / 30, 0, 1)
data = {'fps': FPS, 'duration': dur, 'source_start': 0.0, 'words': words, 'lines': lines, 'env': [round(float(v), 3) for v in env]}
json.dump(data, open(f'scenes/{scene}/timing.json', 'w'), indent=1)
open(f'scenes/{scene}/timing.js', 'w').write('window.TIMING = ' + json.dumps(data, indent=1) + ';\n')
print(f'{scene}: {dur}s, {n} frames')
for L in lines: print(f"{L['who']:6} {L['s']:6.2f}-{L['e']:6.2f} {'ok ' if L['chunks_matched'] else 'est'} w{L['w']} {L['text']}")
print(' '.join(f"{i}:{x['w']}[{x['s']}]" for i, x in enumerate(words)))
