# History of Sanya — 2D-анимация

Сцены рендерятся из кода: SVG-анимация, Chromium (Playwright) и FFmpeg.

## Структура
- `lib/anim.js` — ключевые кадры, плавность движения, моргание
- `lib/characters.js` — риг персонажей (Саня, мама): части тела, мимика, кисти, предметы
- `scenes/scene_01/` — сцена 1: `scene.js` (комната, тайминг, камера, эффекты, субтитры), `index.html`, `audio.wav`, `timing.json` / `timing.js`
- `assets/` — исходная озвучка, референс персонажа, шрифты
- `tools/build_timing.py` — тайминги слов и огибающая громкости для синхронизации губ
- `tools/render.js` — рендер в MP4 или в отдельные кадры
- `output/scene_01.mp4` — готовый ролик

## Команды
```bash
node tools/render.js scene_01                        # -> output/scene_01.mp4
node tools/render.js scene_01 --stills 6.5,9.7,16.6  # отдельные кадры для проверки
```
Чтобы посмотреть сцену в браузере, откройте `scenes/scene_01/index.html` и кликните по экрану: включится звук.
