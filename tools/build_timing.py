"""Cuts a scene's voice-over fragment and builds its timing data.

    python3 tools/build_timing.py <scene> <start_sec> <end_sec> [<full_voiceover.mp3> <asr_tokens.json>]

* cuts assets/audio/voiceover_full.mp3 [start, end] -> scenes/<scene>/audio.wav
  (original speed, 30 ms fade-in, 200 ms fade-out placed in the pause after the last word;
   if <end_sec> is past the end of the file, the rest is padded with silence)
* word timestamps (from the ASR tokens in tools/voiceover_full_tokens.json), shifted to scene time
* per-frame voice loudness envelope (lip-sync)
Writes scenes/<scene>/timing.json and timing.js.

scene_01 was made with: start 0, end 17.2.
"""
import json, sys, wave, subprocess, numpy as np

scene, start, end = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
SRC = sys.argv[4] if len(sys.argv) > 4 else 'assets/audio/voiceover_full.mp3'
TOK = sys.argv[5] if len(sys.argv) > 5 else 'tools/voiceover_full_tokens.json'
dur = round(end - start, 3)
FPS = 30
wav = f'scenes/{scene}/audio.wav'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(start), '-i', SRC,
                '-t', str(dur), '-af', f'apad=whole_dur={dur},afade=t=in:st=0:d=0.03,afade=t=out:st={dur - 0.2}:d=0.2',
                '-c:a', 'pcm_s16le', wav], check=True)

d = json.load(open(TOK))
words = []
for t, s in zip(d['tokens'], d['ts']):
    if t.startswith(' ') or not words: words.append({'w': t.strip(), 's': s})
    else: words[-1]['w'] += t
words = [{'w': x['w'], 's': round(x['s'] - start, 3)} for x in words if start - 0.05 <= x['s'] < end]

w = wave.open(wav); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
n = int(round(dur * FPS)); hop = sr // FPS
env = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) if i*hop < len(a) else 1e-6 for i in range(n)])
db = 20 * np.log10(env); env = np.clip((db + 45) / 30, 0, 1)
for i, x in enumerate(words):
    nxt = words[i+1]['s'] if i+1 < len(words) else dur
    f = int((x['s'] + 0.12) * FPS)
    while f < n and f / FPS < nxt and env[f] > 0.15: f += 1
    x['e'] = round(min(max(f / FPS, x['s'] + 0.15), nxt), 3)
data = {'fps': FPS, 'duration': dur, 'source_start': start, 'words': words, 'env': [round(float(v), 3) for v in env]}
json.dump(data, open(f'scenes/{scene}/timing.json', 'w'), indent=1)
open(f'scenes/{scene}/timing.js', 'w').write('window.TIMING = ' + json.dumps(data, indent=1) + ';\n')
print(f'{scene}: {dur}s, {n} frames')
print(' '.join(f"{i}:{x['w']}[{x['s']}]" for i, x in enumerate(words)))
