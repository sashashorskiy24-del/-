# History of Sanya — 2D-анимация

Сцены рендерятся из кода: SVG-анимация, Chromium (Playwright) и FFmpeg.

## Структура
- `lib/anim.js` — ключевые кадры, плавность движения, моргание
- `lib/characters.js` — риг персонажей (Саня, мама, парень, девушка): части тела, мимика, кисти, предметы (лопатка, чашка), IK для рук
- `lib/subs.js` — караоке-субтитры (общие для сцен)
- `scenes/scene_cafe/` — сцена в кофейне (озвучка 29.2–44.8 с)
- `scenes/scene_01/` — сцена 1: `scene.js` (комната, тайминг, камера, эффекты, субтитры), `index.html`, `audio.wav`, `timing.json` / `timing.js`
- `assets/` — исходная озвучка, референс персонажа, шрифты
- `tools/build_timing.py <сцена> <начало> <конец>` — вырезает фрагмент озвучки, считает тайминги слов и огибающую громкости для синхронизации губ
- `tools/render.js` — рендер в MP4 или в отдельные кадры
- `output/scene_01.mp4`, `output/scene_cafe.mp4` — готовые ролики

## Команды
```bash
node tools/render.js scene_01                        # -> output/scene_01.mp4
node tools/render.js scene_cafe                      # -> output/scene_cafe.mp4
node tools/render.js scene_01 --stills 6.5,9.7,16.6  # отдельные кадры для проверки
```
Чтобы посмотреть сцену в браузере, откройте `scenes/scene_01/index.html` и кликните по экрану: включится звук.
