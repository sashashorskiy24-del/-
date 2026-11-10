# History of Sanya — 2D-анимация

Мультфильмы: «What If You Could Read Minds?» (`scene_01`, `scene_cafe`, `scene_elevator`) и «Alex Doesn’t Want to Leave Prison» (`prison_01`, …).

Сцены рендерятся из кода: SVG-анимация, Chromium (Playwright) и FFmpeg.

## Структура
- `lib/anim.js` — ключевые кадры, плавность движения, моргание
- `lib/characters.js` — риг персонажей (Саня/Алекс, мама, парень, девушка, мужчина в лифте, охранник): части тела, мимика, кисти, предметы (лопатка, чашка), IK для рук
- `lib/lipsync.js` — синхронизация губ с реальной озвучкой (только в окнах реплик персонажа)
- `lib/subs.js` — караоке-субтитры (общие для сцен)
- `scenes/scene_cafe/` — сцена в кофейне (озвучка 29.2–44.8 с)
- `scenes/scene_elevator/` — финальная сцена в лифте (озвучка 44.95–62.93 с + 1.8 с паузы); `sfx.json` — звуковые эффекты, `voice.wav` — чистый голос, `audio.wav` — голос + эффекты
- `scenes/prison_01/` — «Alex Doesn’t Want to Leave Prison», сцена 1 (озвучка `assets/audio/prison_voiceover_full.mp3`, 0–20.9 с)
- `scenes/prison_02/` — «Alex…», сцена 2: спор с охранником (озвучка 20.9–41.45 с, без субтитров)
- `scenes/scene_01/` — сцена 1: `scene.js` (комната, тайминг, камера, эффекты, субтитры), `index.html`, `audio.wav`, `timing.json` / `timing.js`
- `assets/` — исходная озвучка, референс персонажа, шрифты
- `tools/build_timing.py <сцена> <начало> <конец>` — вырезает фрагмент озвучки, считает тайминги слов и огибающую громкости для синхронизации губ
- `tools/sfx.py` — синтез звуков (урчание живота, «blorp», звонок лифта) → `assets/sfx/`
- `tools/mix_audio.py <сцена>` — накладывает эффекты из `sfx.json` на голос, приглушая их под речью
- `tools/render.js` — рендер в MP4 или в отдельные кадры
- `output/scene_01.mp4`, `output/scene_cafe.mp4`, `output/scene_elevator.mp4` — готовые ролики

## Команды
```bash
node tools/render.js scene_01                        # -> output/scene_01.mp4
node tools/render.js scene_cafe                      # -> output/scene_cafe.mp4
python3 tools/sfx.py && python3 tools/mix_audio.py scene_elevator   # звук для лифта
node tools/render.js scene_elevator                  # -> output/scene_elevator.mp4
python3 tools/build_timing.py prison_01 0 20.9 assets/audio/prison_voiceover_full.mp3 tools/prison_voiceover_full_tokens.json
node tools/render.js prison_01 --out output/scene_01_prison.mp4
python3 tools/build_timing.py prison_02 20.9 41.45 assets/audio/prison_voiceover_full.mp3 tools/prison_voiceover_full_tokens.json
node tools/render.js prison_02 --out output/scene_02_guard_argument.mp4
node tools/render.js scene_01 --stills 6.5,9.7,16.6  # отдельные кадры для проверки
```
Чтобы посмотреть сцену в браузере, откройте `scenes/scene_01/index.html` и кликните по экрану: включится звук.
