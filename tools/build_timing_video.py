"""Timing for a short made from a recorded video's own voice track.

    python3 tools/build_timing_video.py <scene> <video> <words.json> [<pad_sec>]

* extracts the video's audio -> scenes/<scene>/audio.wav (+ <pad_sec> of silence)
* words.json: [{"w", "s", "e"}, ...] (checked/corrected ASR word timings, seconds)
* per-frame loudness envelope (lip-sync), same format as build_timing.py
"""
import json, sys, wave, subprocess, numpy as np

scene, video, wfile = sys.argv[1], sys.argv[2], sys.argv[3]
PAD = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
FPS = 30
wav = f'scenes/{scene}/audio.wav'
src = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
                           capture_output=True, text=True, check=True).stdout)
dur = round(src + PAD, 3)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', video, '-vn', '-ac', '1', '-ar', '44100',
                '-af', f'apad=whole_dur={dur},afade=t=in:st=0:d=0.03,afade=t=out:st={src - 0.3}:d=0.3',
                '-c:a', 'pcm_s16le', wav], check=True)
words = json.load(open(wfile))
w = wave.open(wav); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
n = int(round(dur * FPS)); hop = sr // FPS
env = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) if i*hop < len(a) else 1e-6 for i in range(n)])
db = 20 * np.log10(env); env = np.clip((db + 45) / 30, 0, 1)
data = {'fps': FPS, 'duration': dur, 'source_start': 0, 'words': words, 'env': [round(float(v), 3) for v in env]}
open(f'scenes/{scene}/timing.js', 'w').write('window.TIMING = ' + json.dumps(data, ensure_ascii=False) + ';\n')
print(f'{scene}: {dur}s, {n} frames, {len(words)} words')
