"""Procedural cartoon sound effects (no external samples).

    python3 tools/sfx.py      -> assets/sfx/*.wav

growl_big   — long comic stomach growl ("grrrooouuwwl" with gurgles)
growl_small — short gurgle
blorp       — tiny bubbly 'blurp'
ding        — soft elevator chime
"""
import numpy as np, wave, os

SR = 44100
os.makedirs('assets/sfx', exist_ok=True)


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    w = wave.open(f'assets/sfx/{name}.wav', 'w')
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a) * x[i] + a * s; y[i] = s
    return y


def growl(dur, f_curve, seed, bubbles=8, rough=1.0):
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    f = np.interp(k, np.linspace(0, 1, len(f_curve)), f_curve)
    f = f * (1 + 0.06 * np.sin(2 * np.pi * 5.5 * t))                 # wobble
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1                            # buzzy source
    x = 0.7 * saw + 0.5 * np.sin(ph) + 0.3 * np.sin(2 * ph + 0.5)
    # irregular "rrrr" flutter
    flutter = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * (14 + 6 * np.sin(2 * np.pi * 1.7 * t)) * t)) ** 0.6
    x *= flutter ** rough
    x = lowpass(lowpass(x, 520), 900)
    # bubbles / gurgles: quick downward sine chirps
    for _ in range(bubbles):
        s0 = rng.uniform(0.05, dur - 0.08); L = rng.uniform(0.035, 0.07)
        i0 = int(s0 * SR); m = int(L * SR); tt = np.arange(m) / SR
        fb = np.linspace(rng.uniform(380, 600), rng.uniform(140, 200), m)
        b = np.sin(2 * np.pi * np.cumsum(fb) / SR) * np.sin(np.pi * tt / L) ** 2
        x[i0:i0 + m] += 0.6 * b[:max(0, min(m, n - i0))]
    env = np.minimum(1, t / 0.04) * np.minimum(1, (dur - t) / 0.12)
    env *= 0.75 + 0.25 * np.sin(np.pi * k) ** 0.5
    return x * env


def ding():
    dur = 1.6; t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for f0, st, g in [(1318.5, 0.0, 1.0), (1046.5, 0.32, 0.9)]:
        tt = np.clip(t - st, 0, None); on = (t >= st)
        x += on * g * np.exp(-tt * 3.2) * (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(2 * np.pi * 2 * f0 * tt) + 0.12 * np.sin(2 * np.pi * 3.01 * f0 * tt))
    return x * np.minimum(1, t / 0.005)


if __name__ == '__main__':
    save('growl_big', growl(1.05, [70, 95, 150, 175, 120, 85, 60, 55], seed=3, bubbles=10))
    save('growl_small', growl(0.32, [120, 160, 110], seed=7, bubbles=4, rough=1.3))
    save('blorp', growl(0.22, [180, 110, 70], seed=11, bubbles=3, rough=0.5))
    save('ding', ding())
    print('ok')
