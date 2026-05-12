# Как мы построили дизайн-систему Kanso вдвоём с AI

> Kanso Protocol — Angular-дизайн-система с 63 npm-пакетами, 427
> юнит-тестами, зеркальной Figma-библиотекой и MCP-сервером для AI
> tooling. Делал я один + Claude как партнёр-junior. Три месяца от
> первой строки до стабильной 2.0. Эта статья — про то, почему
> не взяли готовое, как делили задачи с моделью, какие выводы
> остались на бумаге, и куда дальше.

**TL;DR**: готовых решений на рынке хватает, но ни одно не закрывало
сразу четыре пункта: real-time Figma↔code sync, AI-friendly API,
полная W3C DTCG токенизация, и monorepo с per-component npm пакетами.
Пришлось писать своё.

Репо: [github.com/GregNBlack/kanso-protocol](https://github.com/GregNBlack/kanso-protocol) ·
Live Storybook: [gregnblack.github.io/kanso-protocol](https://gregnblack.github.io/kanso-protocol)

---

## Зачем это нужно было

Контекст: я работаю на пересечении проектов, где у каждой команды
свой UI-стек — где-то Angular, где-то React, и почти у всех — свой
custom-нарисованный набор компонентов, на ad-hoc токенах, без
Figma-зеркала, без a11y-проверок, без single source of truth.
Дизайнеры и фронтенд-инженеры спорят про "у вас на mock'апе кнопка
синяя 600, а в коде 700".

Хотелось одного: чтобы дизайнер открывал Figma, верстал из готовых
компонентов, и инженер не "пиксель-перфектил" эту картинку руками, а
вставлял уже существующий компонент с тем же именем. Чтобы тёмная
тема работала через переключатель токенов, не через копию всех
компонентов. Чтобы accessibility не была "добавим потом, когда
будет время".

И отдельный пункт — **AI tooling**. У меня уже год вторая половина
кода пишется в паре с моделью. Хотелось чтобы любой дизайн-системный
компонент имел машиночитаемое описание: какие props, какие slots,
как мапится с Figma-нодой, какая npm-команда установки. Чтобы я
писал "сделай форму логина" — модель сама знала какой компонент
взять, как импортнуть, какие токены использовать.

Поэтому **Kanso** (от японского принципа "простота через убирание
лишнего") — это не "ещё одна Angular DS". Это конкретные четыре
требования:

1. **Per-component npm**: каждый компонент — отдельный пакет, чтобы
   приложение брало только то, что использует (никакой mega-bundle).
2. **W3C DTCG токены** через Style Dictionary: один JSON-исходник →
   CSS-переменные + SCSS + TypeScript константы.
3. **Real Figma sync**: каждый компонент существует параллельно в
   Figma и в коде, и changes в одном месте отражаются в другом
   через скрипты (не через ручную перерисовку).
4. **MCP server**: компоненты описаны машиночитаемо для AI-агентов.

## Кто на рынке и чего не хватало

Прежде чем писать — посмотрел альтернативы. На рынке достаточно
сильных решений:

| Что | Чем хорошо | Чего не хватило |
|---|---|---|
| **Angular Material** | Поддержка Google, зрелые компоненты, accessibility | Material Design эстетика навязана; кастомизация через CSS custom properties неудобная; темизация через SCSS-миксины тяжёлая |
| **PrimeNG** | Богатый набор компонентов, активная разработка | Качество визуала местами слабое; не самые modern primitives (роли вместо нативного HTML); миграции между мажорами болезненные |
| **Taiga UI** | Очень качественная, российская | Заточена под Tinkoff-style; нет MCP интеграции; нет per-component packaging |
| **ng-zorro-antd** | Ant Design эстетика | Сильная зависимость от китайского визуального языка; темы — это полные форки |
| **shadcn/ui** (для вдохновения) | "Copy-paste components" pattern, очень популярна | Только React; нет npm packaging, что не подходит командам которые хотят update path |
| **Radix UI** (для inspiration) | Headless primitives, отличный foundation | Только React |

**Чего не было ни у кого вместе**:
- W3C DTCG токенизация из коробки + 3 output формата (CSS/SCSS/TS)
- Реальный bi-directional Figma sync (не статичные скриншоты в доке)
- AI-friendly machine-readable manifest каждого компонента
- Templates as code (как у shadcn) **+ npm packages** для core
- Native HTML primitives как принцип (большинство DS живут на
  custom elements с `role="..."`)

Можно было бы форкнуть Angular Material и допилить под себя. Но
тогда я бы вкладывался не в фундамент, а в обход чужих архитектурных
решений. Решил писать с нуля, осознавая что это много работы.

## Состав дизайн-системы

Сейчас, после 3 месяцев работы:

**63 npm-пакета** в одном monorepo:
- `@kanso-protocol/core` — токены + утилиты
- `@kanso-protocol/{button,input,checkbox,...}` — 42 компонента
- `@kanso-protocol/{app-shell,sidebar,header,...}` — 20 паттернов
  (composed из компонентов)
- `@kanso-protocol/i18n` — словарь UI-строк для локализации
- `@kanso-protocol/mcp` — MCP server для AI tooling

**Templates** (code-as-template, не npm-пакеты — копируешь файл
себе в проект):
- Workspace template — productivity-приложение с sidebar, header,
  pane resize, theme toggle

**Examples** (storybook stories) — целые применения:
- Login screen, Dashboard, List view, Detail view, Settings

**Tooling**:
- Style Dictionary 4 для генерации токенов
- Storybook 8 для документации
- Vitest для unit-тестов (427 тестов, 44 spec-файла)
- Playwright + axe-playwright для visual-regression и a11y
- changesets для версионирования с fixed-group политикой

**Figma** — отдельный файл с зеркальными компонентами, токенами,
вариантами. Sync через Figma Plugin API (через MCP во время разработки).

### Что получилось интересного

**MCP server**. Компонент описан в одном JSON-манифесте:

```json
{
  "button": {
    "npm": "@kanso-protocol/button",
    "primaryClass": "KpButtonComponent",
    "selector": "button[kpButton]",
    "import": "import { KpButtonComponent } from '@kanso-protocol/button';",
    "docs": "docs/components/button.md",
    "storybook": "components-button--docs",
    "figmaNodeId": "3805:11028"
  }
}
```

AI-агент дёргает `mcp.searchComponent("button")` — получает всё,
что нужно для использования. От npm-команды установки до Figma-ноды
которую можно открыть и посмотреть как компонент выглядит.

**Per-component npm packages**. Я начинал с одного `@kanso-protocol/ui`,
куда мог попасть весь компонент-сет. Через две недели стало понятно,
что приложение, которому нужны только Button + Input, всё равно
тянет 2MB ts-кода. Разделил: каждый компонент → отдельный пакет с
peer dependency на core. Сейчас типичная установка:

```bash
npm i @kanso-protocol/{core,button,input,checkbox,form-field}
```

И tree-shake'ится только то, что реально импортнуто.

**Templates as code**. Самые большие компоненты дизайн-системы —
"templates": готовые scaffolds для типовых приложений. Я не хотел
публиковать их на npm — каждый проект всё равно их тюнит, и
"подписка на upstream обновления" быстро становится конфликтом
merge'ей. Поэтому templates распространяются как файлы:

```bash
curl -o src/templates/workspace.component.ts \
  https://raw.githubusercontent.com/.../template-workspace.component.ts
```

Такой же подход у shadcn/ui — оказалось, работает.

**Visual regression на 200+ stories × 2 темы**. Каждая story
скриншотится в light и dark, baseline лежит в репо. PR проверяет
diff на pixel-level. Кейс: я подкрутил padding-bottom на sidebar
с 16 на 8 — Playwright поймал 6 пикселей разницы по высоте.
Помог найти регрессии задолго до code-review.

**Token-flattening** — об этом ниже отдельно, потому что это
самая болезненная история.

## Путь от первой версии до стабильной

Хронология:

| Версия | Дата | Что значимое |
|---|---|---|
| `0.1.0` | начало | Первый прототип: 3 компонента, токены через CSS |
| `0.5.0` | мес 1 | Большая часть компонентов готова в custom-element форме |
| `0.5.3` | мес 2 | "polish batch": Card subtle, ThemeToggle, workspace template |
| `1.0.0` | мес 2.5 | **Случайно**: changeset с `minor` бампом и `fixed`-group превратился в major. Стабилизировал, переименовал в "first stable". |
| `1.0.1` | +1 час | Hotfix контраста popover-bg в dark mode |
| `2.0.0` | мес 3 | **Большой**: 10 компонентов переписаны с custom elements на native HTML primitives |
| `2.0.1` | +час | a11y fix: `opacity:0` → `clip-path` для radio inputs |

### Чего ждал и что получил

Думал — пишу либу за месяц. Получил три. Главные неожиданности:

**1. Архитектура токенов "alias через коллекции"** оказалась
семвер-багом, который проявился через два месяца. В Figma я
разделил переменные на две коллекции: `primitive/color` (raw —
gray.500, blue.600) и `semantic/color` (роли — text.muted,
popover.bg). Семантика ссылается на примитив через alias.

Звучит классически. Проблема: каждая коллекция в Figma имеет
**свой mode switcher**. Когда дизайнер хочет dark, нужно
переключать обе коллекции одновременно — иначе токены резолвятся в
смешанные значения. Я обнаружил это когда коллега сказал "у тебя
попап-фон при переключении dark остаётся почти белым".

Решение: **flatten** семантической коллекции. Через MCP-скрипт
прошёлся по всем 758 семантическим переменным, рассолвил все
alias'ы в hardcoded RGB:

```js
for (const v of semanticVars) {
  for (const mode of [LIGHT_MODE, DARK_MODE]) {
    const value = v.valuesByMode[mode];
    if (value?.type === 'VARIABLE_ALIAS') {
      const resolved = await resolveChain(value, mode);
      v.setValueForMode(mode, resolved);
    }
  }
}
```

1104 alias'а превратились в hardcoded значения за один прогон.
Теперь семантика самодостаточна, primitive остаётся как internal
authoring source. Один переключатель — всё работает.

**Урок**: alias-цепочки между коллекциями экономят размер JSON на
10%, но добавляют столько же hidden complexity. На размерах < 1000
токенов — пишите оба значения hardcoded.

**2. Custom-elements vs native HTML**. Версии 0.5.x → 1.0.1
жили на схеме "кастомный элемент + `role` атрибут + ручной keyboard
handler". То есть мой `<kp-checkbox>` это `<span>` со SVG-галочкой,
без `<input type="checkbox">` внутри. И ровно ничто из этого не
работало в `<form>`: не сабмитилось, не попадало в FormData, не
триггерило HTML5 validation.

Понял я это когда коллега спросил "а почему `<kp-button>` не
пробрасывает `type="submit"`?". Я открыл компонент — никакого
внутреннего `<button>` нет. Это `<kp-button>` с `role="button"`
и ручным `(click)`.

Через две сессии за один день переписали все 10 проблемных
компонентов на native HTML:

```diff
- <kp-button variant="default">Save</kp-button>
+ <button kpButton variant="default" type="submit">Save</button>
```

```diff
- <kp-checkbox [(checked)]="ok">Agree</kp-checkbox>  <!-- span + SVG -->
+ <kp-checkbox [(checked)]="ok" name="agree">Agree</kp-checkbox>
                                ↑ внутри теперь <label><input type=checkbox>...
```

`kp-button` стал `button[kpButton]` (attribute selector). `kp-checkbox`,
`kp-radio`, `kp-toggle` — обернули нативный input в label. `kp-dialog`
переехал на нативный `<dialog>` элемент (с `.showModal()` / `.close()`
и `::backdrop`).

После этого:
- Forms работают
- Native `disabled` блокирует events
- Browser-native arrow-key navigation в radio groups
- Screen readers получают всё из коробки

**Урок**: каждый раз когда DS пишет custom element с `role="..."` —
есть нативный HTML примитив, который делает то же лучше. Используй
платформу.

**3. Релизный пайплайн с GitHub Actions** — про него обычно не пишут,
но он съел больше всего нервов. Сначала по дефолту делал релизы
через **changesets Version PR**: создаёшь .changeset → бот открывает
PR с пересчитанными версиями → ты merge'ишь → workflow публикует на
npm. Outwardly чисто. На практике:

- GitHub при squash-merge PR'а берёт автора из коммитов в PR
- changeset-action создаёт коммиты от `github-actions[bot]`
- → бот появляется в Contributors на странице репо

Я переписал историю через `git filter-branch` чтобы переписать автора.
Force-push. Бот всё равно остался в Contributors — потому что
GitHub этот widget кеширует **сутки**.

Финальный canonical рецепт после двух потерянных часов:

```bash
# 1. Переписать commit author
git filter-branch --env-filter '...' -- HEAD

# 2. Force-push
git push --force origin main

# 3. Swap default branch для инвалидации UI-cache
gh api -X PATCH repos/own/repo -f default_branch=temp-main
# wait 3-5 min
gh api -X PATCH repos/own/repo -f default_branch=main
gh api -X DELETE repos/own/repo/git/refs/heads/temp-main

# 4. Empty nudge commit на main
git commit --allow-empty -m "ci: nudge"
git push
```

После этого перешёл на **local-bump flow**: `npx changeset version`
локально, commit под моим именем, push. Никаких bot-коммитов в
принципе.

И ещё одно: **первый "major" получился случайно**. У меня был
`{"core": "minor"}` changeset на версии `0.5.3`. Changesets с
`fixed`-группой решил, что minor на семействе `0.x.x` ведёт в
`1.0.0`. Я обнаружил после публикации. Откатить нельзя — npm
unpublish после 72 часов невозможен. Прагматично переименовал
"случайный" релиз в "first stable" и пошёл дальше. Урок: всегда
делать `npx changeset version --dry-run` перед коммитом, особенно
на ранних мажорах.

## Помощь нейронки на разных этапах

Половина работы делалась Claude'ом. Это не "ChatGPT-помогает-с-кодом"
формат, а парная разработка. Я открываю задачу, скриню ему контекст,
он пишет код, я ревьюю. Дальше — итерации.

### Где AI хорош

**Bulk operations**. Когда переписывали `<kp-button>` → `<button kpButton>`,
надо было обновить 39 файлов-консьюмеров (templates, паттерны, истории,
docs). Sed-команда через bash + проверка typecheck — заняла одну
сессию. Без AI я бы делал это в IDE с regex-replace и пропустил бы
3-4 случая.

**Figma-bulk-операции**. Через MCP plugin прошёлся по 190 master
components и переписал 2790 fill/stroke bindings с primitive на
semantic. В UI Figma это была бы неделя кликов.

**Tooling**. Скрипт для подсчёта тестов (написал я → Claude улучшил
до правильной обработки subdirs). Скрипт для генерации shields.io
badge endpoint. Скрипт для проверки contributor cleanup. Всё это —
готовые однострочники, которые быстрее написать вдвоём, чем читать
документацию каждого инструмента.

**Архитектурные дискуссии**. Когда я не знаю как лучше — спорим. Я
спросил "что правильно для button — обернуть в внутренний `<button>`
или сменить селектор на `button[kpButton]`?" Он ответил, что
**B — правильно, A — костыль**, и объяснил почему (атрибутный
селектор позволяет native button получать `type/form/name/value`
без проксирования через @Input'ы). Сам бы я выбрал A — это меньше
breaking changes — и закопался бы дальше.

**Дока**. Половина docs/templates/workspace.md (~620 строк cookbook
с decision trees и troubleshooting) написана им за одну сессию по
моему outline.

### Где AI косячил

**Архитектура по линии наименьшего сопротивления**. Когда я писал
"сделай checkbox" — Claude делал custom element с `role="checkbox"`.
Это работало, выглядело правильно, axe не жаловался — и я апрувил.
Через три месяца обнаружил что вся форма не сабмитится. Корень: я
не спросил "а как это поведёт себя в `<form>`?". Модель не
проактивно поднимает такие вопросы.

**Памятка**. Я сохранил в её "memory" feedback: "используй
local-bump release flow, не PR-flow". Через две сессии она опять
пошла по PR-flow. Memory есть, но не самоприменяющаяся — нужно
напоминать или формализовать через CLAUDE.md.

**Half-done implementations**. На запросе "переделай все 10
компонентов" — первый ответ был "давай начнём с button, остальные
9 разнесём по сессиям". Только после прямого "никаких минимумов,
делай всё" — начала работать без остановки.

**Самоуверенность с тестами**. Я локально прогонял `npm test` —
427 зелёных. Запушил v2.0.0 — а в CI рухнул a11y gate. Корень:
Claude использовал `opacity: 0; position: absolute` для скрытия
нативных input'ов, что **axe воспринимает как удалённый из a11y
tree элемент**. Локально я этот flow не запускал. Урок: AI и я
оба пропускали этот класс багов; CI ловит, локально жмёшь
"всё работает".

### Особенности взаимодействия

Что сработало:

1. **Спорить — обязательно**. Не "сделай X" а "X или Y, что
   правильнее?". Половина решений изменилась после моего
   "это правильный вариант или костыль?".
2. **Запоминать ошибки через memory**. Memory у Claude между
   сессиями работает. Я сохраняю каждый раз когда он делает
   что-то не так — следующая сессия начинает осознавая урок.
3. **Local-bump для релизов**. После одного случая, когда merge
   PR'а через GitHub UI добавил бота — я больше никогда не пускаю
   release через PR. Memory это сохранила.
4. **Tests + CI как safety net**. Я научился доверять CI больше,
   чем чувству "локально работает". Особенно для visual + a11y.

Что не сработало:

1. **Делегирование выбора архитектуры**. Когда я давал общее
   "сделай checkbox", модель выбирала шаблон с custom element +
   role. Правильный путь был "native input + label обёртка". Без
   моего вмешательства модель не предложит лучший pattern сама.
2. **Полагаться на её знание новых API**. Native `<dialog>`,
   `<input type=color>`, View Transitions API — она знает на
   уровне общих фактов, но конкретные edge-cases (jsdom без
   `.showModal()`, fallback'и для iOS Safari) я доставал руками.

## Выводы и планы

**За 3 месяца:**
- 63 npm-пакета, опубликованных на 2.0.1
- 427 unit-тестов, 200+ stories, visual + a11y CI gates
- Figma-зеркало с 60+ master компонентами, 758 семантических токенов
- MCP server для AI tooling
- Workspace template + 5 examples приложений

**Главные уроки**:

1. **AI — это accelerator, не architect**. Половина работы
   получается быстрее. Но архитектурные выборы должны оставаться
   за человеком. Модель отлично имплементирует, но не задаёт
   "а нужно ли это вообще?" вопросы.
2. **Native HTML почти всегда правильнее custom element**.
   Если для controlа есть `<input type=*>`, `<button>`, `<dialog>` —
   используй его. Любая re-implementation будет хуже.
3. **Token-flatten >> token-alias** в маленьких проектах.
   Меньше 1000 токенов — пиши hardcoded оба значения. Alias-cycle
   через две коллекции это hidden complexity, которая всплывает
   через месяцы.
4. **CI важнее интуиции**. Локально жмёшь — работает. CI ловит то,
   что человеческий тест-цикл пропускает (a11y, visual diff,
   browser-specific behaviour).
5. **Каждое решение, принятое "потому что меньше работы" —
   откатится через 3 месяца**. Это true для AI и для меня. Если
   ответ "сделать правильно займёт 2 дня, по-быстрому — 2 часа" —
   делай правильно сразу.

6. **Концентрические радиусы — это правило, а не вкус**. Когда
   контейнер собран из компонентов, его `border-radius` должен быть
   **на один шаг больше** радиуса внутренних элементов. Default
   size во всей системе `md` (12px), значит большинство контейнеров
   (Dialog, DropdownMenu, Popover, NotificationCenter, Card)
   автоматически получают `radius.comp.lg` (14px). Внутренние
   элементы визуально "сидят" в контейнере, а не торчат углами в его
   углы. Зафиксировал как ADR §7.3 — теперь это не "на глаз
   решает дизайнер", а контракт в коде.

7. **Позиционные контракты vs позиционная логика в компоненте**.
   Tooltip сам не знает где триггер — это валидная позиция: он
   рендерит только визуальную часть, а позиционирование — задача
   директивы. Но за этим стоит ОПИСАННЫЙ контракт: какой
   `arrowPosition` выбрать по `getBoundingClientRect()`, какой
   `arrowAlign` по координатам триггера, как считать body offset
   так чтобы стрелка попадала ровно над центром. Контракт в
   `docs/components/tooltip.md` написан как пошаговый recipe — кто
   пишет директиву, копирует один-в-один. Альтернатива "встроить
   автологику в компонент" — это связать визуал с runtime DOM
   (overlay, portal, z-index), что превращает компонент в фреймворк.

8. **Skill-файлы как форма памяти для следующей сессии**. AI
   между сессиями помнит "feedback memory" — короткие правила. Но
   когда правил становится 15+ (как у меня: компонент-селект,
   нативный HTML, sr-only клип, иконы через wrapper, концентрические
   радиусы, surface tokens, hover-direction, size mixing, slot-first
   templates, dark-mode workflow, release flow, тестовые гейты,
   commit hygiene, AI etiquette, где смотреть) — memory не вмещает.
   Решение: `.claude/skills/build-with-kanso.md` — машинно-читаемый
   skill с фронт-матером (`name`/`description`), который AI
   подгружает явно при работе с этим репо. По сути это
   project-specific runbook, который ставится один раз и работает
   автоматом.

**Что дальше**:

- **3-pane workspace template** для IDE-приложений
- **SSR support** через Angular SSR — пройти все компоненты на
  гидратацию, поубирать `typeof document !== 'undefined'` костыли
- **Form components batch**: input, textarea, form-field на тех же
  принципах что button/checkbox — нативщина first
- **Theming as code**: возможность собрать свою тему через override
  JSON-файла без форка
- **MCP enrichment**: добавить в манифест usage-examples, common
  pitfalls — чтобы AI-агенты учили лучшие практики автоматически
- **Расширить AI-память через CLAUDE.md** в репо. Не надеяться на
  per-conversation memory, а зафиксировать конвенции в файле,
  который читается каждый раз.

**Если есть интерес**: репо публичный,
[GitHub Discussions](https://github.com/GregNBlack/kanso-protocol/discussions)
открыт. Заходите, обсуждать.

---

**Ссылки**:
- [Репозиторий](https://github.com/GregNBlack/kanso-protocol)
- [Live Storybook](https://gregnblack.github.io/kanso-protocol)
- [Migration v1 → v2](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/MIGRATION-v2.md)
- [Style Dictionary 4](https://styledictionary.com)
- [Native `<dialog>` MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [W3C Design Tokens spec](https://design-tokens.github.io/community-group/format/)
