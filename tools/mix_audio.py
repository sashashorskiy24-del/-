"""Mixes sound effects on top of a scene's voice-over without masking the narrator.

    python3 tools/mix_audio.py <scene>

Reads scenes/<scene>/sfx.json: [{"file": "assets/sfx/x.wav", "at": sec, "gain_db": -6}, ...]
voice:  scenes/<scene>/voice.wav (created from audio.wav on first run)
output: scenes/<scene>/audio.wav  (voice unchanged + effects, ducked -9 dB while the narrator speaks)
"""
import json, os, sys, wave, numpy as np

scene = sys.argv[1]
d = f'scenes/{scene}'
if not os.path.exists(f'{d}/voice.wav'):
    os.rename(f'{d}/audio.wav', f'{d}/voice.wav')


def load(p):
    w = wave.open(p); assert w.getnchannels() == 1
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768, w.getframerate()


voice, sr = load(f'{d}/voice.wav')
fx = np.zeros_like(voice)
for c in json.load(open(f'{d}/sfx.json')):
    x, r = load(c['file']); assert r == sr
    i0 = int(c['at'] * sr); x = x[:max(0, len(fx) - i0)]
    fx[i0:i0 + len(x)] += x * 10 ** (c.get('gain_db', 0) / 20)

# duck effects under the voice (smoothed loudness follower)
win = int(0.03 * sr)
lv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode='same'))
talking = np.clip((20 * np.log10(lv + 1e-9) + 42) / 12, 0, 1)
k = int(0.08 * sr); talking = np.convolve(talking, np.ones(k) / k, mode='same')
fx *= 10 ** (-9 * talking / 20)

mix = voice + fx
peak = np.max(np.abs(mix))
if peak > 0.98: mix *= 0.98 / peak
w = wave.open(f'{d}/audio.wav', 'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f'{scene}: mixed {len(json.load(open(f"{d}/sfx.json")))} effects, peak {peak:.2f}')
