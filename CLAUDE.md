# KERBECK — Home Landing (full-bleed hero)

## ⚠️ ЧТО ЭТО ТАКОЕ
Публичная home-страница для kerbeckcars.com. Чистый HTML/CSS/JS, БЕЗ сборщика,
БЕЗ npm, БЕЗ React. Tailwind ТОЛЬКО через CDN. Без бэкенда, без админки.

Файлы: index.html + styles.css + script.js + папка images/. Больше ничего.
НЕ создавать package.json, vite.config, node_modules, src/.

FC Kerbeck — люксовый авто-дилер (Палмира, NJ, с 1899).

Дизайн взят из Figma-прототипа:
https://www.figma.com/proto/D8aMizBomd2ZtTILaSDZ2M/FC-KERBECK?node-id=15-948
(fileKey D8aMizBomd2ZtTILaSDZ2M, node 15:948 «index 2 hero»).

## LAYOUT (full-bleed hero, above the fold)
Весь экран = одно фоновое ВИДЕО на 100vh (Rolls-Royce в ночном городе),
поверх него прозрачные элементы. Высота от 100vh, без скролла на desktop.

### Nav (сверху, ~100px, прозрачный поверх видео)
- ЛЕВО: иконка-меню (images/icon-menu.svg) + «Menu».
- ЦЕНТР: логотип KERBECK (images/logo-kerbeck.svg, белый).
- ПРАВО: красная кнопка «Contact» (rounded).

### Bottom dock (нижняя панель, frosted glass, backdrop-blur, rounded)
Горизонтальный ряд из трёх частей:
1. Premium bar (растягивается): лейбл «Our Premium Brands» + внутренняя тёмная
   плашка с 5 логотипами марок (ссылки) + красная кнопка «View All».
   Порядок логотипов: Lamborghini, Rolls-Royce, Aston Martin, Maserati, Bentley.
2. Плитка «Buick GMC» (ссылка, вся кликабельна).
3. Плитка «Preowned Cadillac» (ссылка, вся кликабельна).

## ССЫЛКИ (бренды)
- Rolls-Royce  → https://www.fckerbeckrollsroyce.com/
- Lamborghini  → https://www.fckerbecklamborghini.com/
- Bentley      → https://www.bentleypalmyra.com/
- Aston Martin → https://www.astonmartinphiladelphia.com/
- Maserati     → https://www.fckerbeckmaserati.com/
- Buick GMC    → https://www.fckerbeckbuickgmc.com/
- Cadillac     → https://www.fckerbeckcadillacs.com/

## ДИЗАЙН — «тёмный люкс»
Палитра (в tailwind.config внутри <head> + CSS-переменные):
- ink:   #070A0B (фон)
- panel: #091012 (плотные панели)
- bone:  #EDEAE4 (тёплый белый текст)
- red:   #E10600 (акцент: кнопки Contact / View All)
- glass: rgba(217,217,217,0.12), inner rgba(0,0,0,0.26), hairline rgba(255,255,255,0.10)

Типографика (Google Fonts):
- Дисплей/лейблы/интерфейс: Saira Condensed (замена лицензионного «Lambotype Cnd»
  из макета — он недоступен в вебе), uppercase + letter-spacing.
- Текст/подписи: Inter.

Анимации: плавные (0.3–0.6s, ease). Hover: лёгкий подъём/яркость кнопок,
проявление логотипов и плиток.

## ASSETS (images/)
- hero.mp4            — фоновое видео (autoplay, muted, loop, playsinline)
- hero-poster.jpg     — постер-фоллбэк до загрузки видео
- logo-kerbeck.svg    — логотип в навбаре (белый)
- icon-menu.svg       — иконка меню
- brand-*.svg         — 5 логотипов марок (white fill через var(--fill-0, white))
ВАЖНО про SVG: у них должны быть РЕАЛЬНЫЕ width/height (из viewBox), а не "100%",
иначе в <img> ломается размер и логотипы раздуваются.

## Структура файлов
- index.html  — разметка + Tailwind CDN + tailwind.config + шрифты + подключение styles.css, script.js
- styles.css  — кастомные стили (hero, nav, dock, стекло, кнопки, адаптив)
- script.js   — логика (меню-тоггл и пр.)
- images/     — видео, постер, логотипы

## Правила
- Семантичный HTML, доступность (aria, alt, контраст, клавиатура)
- Адаптивность через брейкпоинты; на узких экранах dock складывается в колонку
- Цвета через токены, без хардкод-hex где возможно

## Проверка рендера
Локально headless-скриншот:
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless --disable-gpu --window-size=1920,1080 \
    --screenshot=/tmp/out.png "file://$PWD/index.html"
(в headless видео не играет — виден постер.)
