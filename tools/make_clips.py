#!/usr/bin/env python3
"""Нарезка 30-секундных клипов со вшитыми караоке-субтитрами.

  python3 tools/make_clips.py clips/speed_gta_rp video.mp4 [--horizontal] [--only 03_press_f_to_fix]

В папке клипа нужны moments.json (старт каждого клипа) и words.json
(слова с таймингами из субтитров YouTube). Результат: <папка>/out/*.mp4
"""
import argparse, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'assets', 'fonts')

def clean(w):
    w = w.replace('[ __ ]', '***')
    w = re.sub(r'\[(screaming|laughter|cheering|cough|music|applause)\]?', '', w, flags=re.I)
    return w.replace('>>', '').strip()

def tokens(words, a, b):
    raw = []
    for t, w in words:
        if a <= t < b:
            raw += [[t - a, part] for part in w.split()]
    out, i = [], 0
    while i < len(raw):  # «[ __ ]» бывает разбито на три токена
        if raw[i][1].startswith('[') and i + 2 < len(raw) and raw[i + 1][1] == '__' and raw[i + 2][1].startswith(']'):
            raw[i + 2][1] = '***' + raw[i + 2][1][1:]; i += 2; continue
        c = clean(raw[i][1])
        if c: out.append([raw[i][0], c])
        i += 1
    # слова в одном событии имеют одинаковое время — разносим равномерно
    for i in range(len(out)):
        j = i
        while j + 1 < len(out) and out[j + 1][0] == out[i][0]:
            j += 1
        if j > i:
            nxt = out[j + 1][0] if j + 1 < len(out) else out[i][0] + 0.3 * (j - i + 1)
            step = (nxt - out[i][0]) / (j - i + 1)
            for k in range(i, j + 1):
                out[k][0] = out[i][0] + step * (k - i)
    return out

def chunks(toks, dur, maxw=3, gap=0.6):
    groups, cur = [], []
    for i, (t, w) in enumerate(toks):
        if cur and (len(cur) >= maxw or t - cur[-1][0] > gap or cur[-1][1][-1] in '.?!'):
            groups.append(cur); cur = []
        cur.append((t, w))
    if cur: groups.append(cur)
    res = []
    for gi, g in enumerate(groups):
        end_next = groups[gi + 1][0][0] if gi + 1 < len(groups) else dur
        ends = [g[k + 1][0] if k + 1 < len(g) else min(end_next, g[-1][0] + 0.7) for k in range(len(g))]
        res.append([(t, e, w) for (t, w), e in zip(g, ends)])
    return res

def ts(s):
    s = max(0, s); h = int(s // 3600); m = int(s % 3600 // 60)
    return f"{h}:{m:02d}:{s % 60:05.2f}"

def ass(groups, w, h):
    size = int(w * 0.085)
    margin = int(h * (0.30 if h > w else 0.10))
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,Montserrat Black,{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,{max(3,size//11)},{max(2,size//18)},2,60,60,{margin},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for g in groups:
        for i, (t, e, _) in enumerate(g):
            parts = []
            for j, (_, _, wd) in enumerate(g):
                wd = wd.upper().replace('{', '(').replace('}', ')')
                parts.append('{\\c&H00E5FF&\\fscx108\\fscy108}' + wd + '{\\c&HFFFFFF&\\fscx100\\fscy100}' if j == i else wd)
            lines.append(f"Dialogue: 0,{ts(t)},{ts(e)},Main,,0,0,0,,{' '.join(parts)}")
    return head + '\n'.join(lines) + '\n'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('folder'); ap.add_argument('video')
    ap.add_argument('--horizontal', action='store_true', help='16:9 вместо вертикального 9:16')
    ap.add_argument('--only'); ap.add_argument('--subs-only', action='store_true')
    a = ap.parse_args()
    m = json.load(open(os.path.join(a.folder, 'moments.json')))
    words = json.load(open(os.path.join(a.folder, 'words.json')))
    dur = m.get('duration', 30)
    W, H = (1280, 720) if a.horizontal else (1080, 1920)
    out = os.path.join(a.folder, 'out'); os.makedirs(out, exist_ok=True)
    for c in m['clips']:
        if a.only and c['id'] != a.only: continue
        s = c['start']
        sub = os.path.join(out, c['id'] + '.ass')
        open(sub, 'w').write(ass(chunks(tokens(words, s, s + dur), dur), W, H))
        if a.subs_only: print(sub); continue
        if a.horizontal:
            vf = f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,setsar=1"
        else:  # размытый фон + видео по ширине в центре
            vf = (f"split[b][f];[b]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=20:2,eq=brightness=-0.12[bg];"
                  f"[f]scale={W}:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2-{H//14},setsar=1")
        vf += f",ass='{sub}':fontsdir='{FONTS}'"
        dst = os.path.join(out, c['id'] + '.mp4')
        cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(s), '-i', a.video, '-t', str(dur),
               '-filter_complex' if not a.horizontal else '-vf', vf,
               '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
               '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', dst]
        print('->', dst); subprocess.run(cmd, check=True)

if __name__ == '__main__':
    main()
