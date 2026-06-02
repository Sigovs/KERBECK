# KERBECK — Portal Page (split-screen витрина)

## ⚠️ ЧТО ЭТО ТАКОЕ

Публичная Portal-страница для kerbeckcars.com. Чистый HTML/CSS/JS, БЕЗ сборщика,
БЕЗ npm, БЕЗ React. Tailwind ТОЛЬКО через CDN. Без бэкенда, без админки.

Файлы: index.html + styles.css + script.js + папка images/. Больше ничего.
НЕ создавать package.json, vite.config, node_modules, src/.

FC Kerbeck — люксовый авто-дилер (Палмира, NJ, с 1899).

## LAYOUT (split-screen)

### Desktop
Экран делится на две части по вертикали:
- ЛЕВО (~40%): три блока ДРУГ НАД ДРУГОМ (горизонтальные полосы):
  1. Premium Vehicles
  2. Buick GMC
  3. Pre-owned Cadillacs
  Каждый блок: приглушённое фоновое фото + текст (название серифом) поверх.
- ПРАВО (~60%): большая область с фоновым ИЗОБРАЖЕНИЕМ.

Хедер сверху: логотип KERBECK слева + бургер-меню справа.

### СОСТОЯНИЯ ПРАВОЙ ЧАСТИ — всего 4 изображения
- ДЕФОЛТ (мышь никуда не наведена): справа показывается ДЕФОЛТНОЕ фото
  (общее имиджевое — салон/люкс-авто). Это исходное состояние лендинга.
- Hover на блок → справа фото этого блока (плавная анимация, fade + лёгкий zoom).
- Мышь УШЛА с блоков → справа ВОЗВРАЩАЕТСЯ дефолтное фото.
Итого 4 фона: default + premium + gmc + cadillac.

### Поведение (Desktop)
- Hover «Premium Vehicles» → справа фон premium + СПИСОК 5 марок (каждая ссылка):
    Rolls-Royce  → https://www.fckerbeckrollsroyce.com/
    Lamborghini  → https://www.fckerbecklamborghini.com/
    Bentley      → https://www.bentleypalmyra.com/
    Aston Martin → https://www.astonmartinphiladelphia.com/
    Maserati     → https://www.fckerbeckmaserati.com/
- Hover «Buick GMC» → справа фон gmc; клик по блоку → https://www.fckerbeckbuickgmc.com/
- Hover «Pre-owned Cadillacs» → справа фон cadillac; клик → https://www.fckerbeckcadillacs.com/
- Фото в полосе слева = то же фото, что показывается справа в полном размере.

### Mobile
- ТОЛЬКО левая колонка: три блока друг под другом (приглушённое фото + текст).
- Правой части НЕТ (дефолтное фото и hover-превью не показываются).
- Premium Vehicles раскрывает список 5 марок по ТАПУ (toggle, простой JS).
- Buick GMC / Cadillac — вся плитка кликабельна (ссылка).

## ⚠️ ABOVE THE FOLD
На desktop весь экран (хедер + split-screen) помещается в один вьюпорт
без скролла. Высоту считать от 100vh.

## ⚠️ ДИЗАЙН — «тёмный люкс», НЕ generic
НЕ использовать стандартный AI/Claude design base, НЕ дефолтные Tailwind-цвета
напрямую. Уровень сайтов Rolls-Royce / Bentley: дорого, минималистично, воздух.

Палитра (задать в tailwind.config внутри <head>):
- bg: #0A0A0A (чёрный)
- text: #F5F2EC (тёплый белый)
- muted: #9A938A
- gold: #C9A24B (акцент СДЕРЖАННО: линии, hover, мелкие подписи)

Типографика (Google Fonts):
- Заголовки / названия блоков / марки: Playfair Display (serif)
- Подписи / интерфейс: Inter (sans), uppercase + широкий letter-spacing для лейблов

Анимации: плавные, неспешные (0.4–0.8s, ease). Смена фото справа — fade + лёгкий
zoom. Hover на блок слева — фото проявляется ярче, золотая линия/акцент.

## ФОТО (4 плейсхолдера)
Пока реальных фото нет → тёмные плейсхолдеры (radial-gradient, имитирующий
подсветку), РАЗНЫЕ для каждого состояния:
- images/default.jpg  (дефолтное имиджевое)
- images/premium.jpg
- images/gmc.jpg
- images/cadillac.jpg
Код должен работать сразу с плейсхолдерами; позже заменим на реальные фото в images/.

## Структура файлов
- index.html  — разметка + Tailwind CDN + tailwind.config + шрифты + подключение styles.css, script.js
- styles.css  — кастомные стили (анимации, фоны блоков, переходы)
- script.js   — логика: дефолтное фото, hover-смена справа (desktop),
                возврат к дефолту, tap-раскрытие Premium (mobile)
- images/     — 4 фото (плейсхолдеры пока)

## Правила
- Семантичный HTML, доступность (aria, alt, контраст, клавиатура)
- Mobile-first, адаптивность через брейкпоинты Tailwind
- Цвета через токены tailwind.config, без хардкод-hex где возможно
- Данные марок (название + ссылка) и пути к фото — в одном месте в script.js (массивы)

## Рабочий процесс (по частям, с проверкой)
1. Разметка: хедер + split (лево: 3 блока; право: слой дефолт + 3 слоя hover) — БЕЗ стилей
2. Стили: «тёмный люкс», раскладка split-screen, above the fold
3. JS: дефолтное фото + hover-смена + возврат к дефолту + список марок Premium
4. Mobile: правая часть скрыта, Premium раскрывается по тапу
5. Замена 4 плейсхолдеров на реальные фото
