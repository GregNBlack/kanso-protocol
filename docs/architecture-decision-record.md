# Kanso Protocol Design System — Architecture Decision Record

> Version: 0.1.0
> Status: Draft
> Date: 2026-04-08

---

## 1. Mission

Kanso Protocol — open source дизайн-система для Angular, построенная на принципе архитектурной консистентности. Название отражает японский эстетический принцип 簡素 (kanso) — простота, устранение лишнего. Каждое визуальное и поведенческое правило зафиксировано на уровне токенов и структуры, а не на уровне договорённостей.

Design Tokens в формате W3C DTCG являются single source of truth для Figma Variables и кода.

---

## 2. Design Tokens

### 2.1. Формат

W3C Design Token Community Group (DTCG) — JSON.
Двухуровневая архитектура:

| Уровень    | Роль                          | Пример                          |
|------------|-------------------------------|---------------------------------|
| Primitive  | Сырые значения палитры        | `color.blue.500: #3B82F6`       |
| Semantic   | Роль в интерфейсе             | `color.primary.default: {color.blue.500}` |

### 2.2. Naming Convention

```
{category}.{role}.{variant}.{property}.{state}
```

Примеры:
- `color.primary.default.bg.rest`
- `color.primary.default.bg.hover`
- `color.primary.default.fg.active`
- `color.primary.default.border.disabled`
- `color.danger.subtle.bg.rest`
- `color.danger.subtle.fg.hover`
- `spacing.xs`
- `radius.comp.sm`
- `elevation.overlay`

**Properties:** `bg` (background), `fg` (foreground/text), `border`.

Состояния: `rest`, `hover`, `active`, `focus`, `disabled`, `loading`.

---

## 3. Spacing

### 3.1. Base Unit

**4px**

### 3.2. Шкала (с ускорением)

| Token         | Value |
|---------------|-------|
| `spacing.4xs` | 2px   |
| `spacing.3xs` | 4px   |
| `spacing.2xs` | 8px   |
| `spacing.xs`  | 12px  |
| `spacing.sm`  | 16px  |
| `spacing.md`  | 20px  |
| `spacing.lg`  | 24px  |
| `spacing.xl`  | 32px  |
| `spacing.2xl` | 40px  |
| `spacing.3xl` | 48px  |
| `spacing.4xl` | 64px  |

> Шкала линейна до 24px, далее ускоряется. Покрывает от микро-отступов (gap между иконкой и текстом) до макро-отступов (секции страницы).

---

## 4. Sizing

### 4.1. Шкала интерактивных компонентов

| Token     | Height | Использование                  |
|-----------|--------|--------------------------------|
| `size.xs` | 24px   | Dense UI, таблицы, теги        |
| `size.sm` | 28px   | Вторичные действия, фильтры    |
| `size.md` | 36px   | **Базовый размер** — кнопки, инпуты |
| `size.lg` | 44px   | Touch-friendly, primary CTA    |
| `size.xl` | 52px   | Hero-кнопки, промо-элементы    |

### 4.2. Правило

Все интерактивные компоненты (Button, Input, Select, Toggle и т.д.) обязаны поддерживать все 5 размеров. Исключения фиксируются в ADR компонента с обоснованием.

---

## 5. Typography

### 5.1. Шрифт

**Onest** (Google Fonts, кириллица).
Токен `font.family.sans` — позволяет заменить на уровне темы. Для кода используется `font.family.mono`.

### 5.2. Шкала (компактная)

| Token              | Size  | Line-height | Computed LH | Weight        |
|--------------------|-------|-------------|-------------|---------------|
| `font.size.2xs`    | 11px  | 1.455       | 16px (≈4×4) | 500           |
| `font.size.xs`     | 12px  | 1.333       | 16px (≈4×4) | 400           |
| `font.size.sm`     | 14px  | 1.428       | 20px (≈4×5) | 400           |
| `font.size.md`     | 16px  | 1.5         | 24px (≈4×6) | 400           |
| `font.size.lg`     | 20px  | 1.4         | 28px (≈4×7) | 500           |
| `font.size.xl`     | 24px  | 1.333       | 32px (≈4×8) | 600           |
| `font.size.2xl`    | 32px  | 1.25        | 40px (≈4×10)| 600           |

> Все computed line-height кратны 4px для соблюдения вертикального ритма.

### 5.3. Font Weight

| Token              | Value |
|--------------------|-------|
| `font.weight.regular`  | 400 |
| `font.weight.medium`   | 500 |
| `font.weight.semibold` | 600 |
| `font.weight.bold`     | 700 |

---

## 6. Component Anatomy

### 6.1. Единая модель

Каждый компонент строится по трёхуровневой анатомии:

```
┌─ Container ─────────────────────────────────┐
│  padding, border, border-radius, background │
│                                             │
│  ┌─ Content ─────────────────────────────┐  │
│  │  gap между дочерними элементами       │  │
│  │                                       │  │
│  │  [Element]  [Element]  [Element]      │  │
│  │  icon       label      badge          │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### 6.2. Правила

| Свойство        | Владелец    | Правило                                          |
|-----------------|-------------|--------------------------------------------------|
| `padding`       | Container   | **Симметричный** (равный со всех сторон)          |
| `border`        | Container   | 1px всегда, цвет через semantic token            |
| `border-radius` | Container   | Привязан к размеру компонента (см. §7)           |
| `background`    | Container   | Semantic color token                              |
| `gap`           | Content     | Из шкалы spacing                                 |
| `height`        | Container   | Из шкалы sizing + `line-height` для вариативности |

### 6.3. Высота компонента

Высота определяется формулой:

```
component height = padding-top + line-height + padding-bottom
```

Padding симметричный → `padding-top = padding-bottom`.
Вариативность высоты достигается через подбор `line-height` при фиксированном padding.

---

## 7. Border Radius

### 7.1. Правило

Radius привязан к размеру компонента, а не задаётся глобально.

| Component Size | Radius Token       | Value |
|----------------|--------------------|-------|
| `xs` (24px)    | `radius.comp.xs`   | 8px   |
| `sm` (28px)    | `radius.comp.sm`   | 10px  |
| `md` (36px)    | `radius.comp.md`   | 12px  |
| `lg` (44px)    | `radius.comp.lg`   | 14px  |
| `xl` (52px)    | `radius.comp.xl`   | 16px  |

### 7.2. Специальные значения

| Token              | Value  | Использование         |
|--------------------|--------|-----------------------|
| `radius.none`      | 0px    | Без скругления        |
| `radius.full`      | 9999px | Круглые кнопки, аватары|

### 7.3. Вложенный Radius

Для вложенных компонентов (например, кнопка внутри карточки):

```
inner-radius = outer-radius − gap-between-borders
```

Это правило фиксируется в коде, а не оставляется на усмотрение разработчика.

---

## 8. Color Architecture

### 8.1. Структура

**Двухуровневая: Primitive → Semantic.**

#### Primitive (палитра)

```
color.gray.50 … color.gray.950
color.blue.50 … color.blue.950
color.red.50  … color.red.950
color.green.50 … color.green.950
color.amber.50 … color.amber.950
...
```

Шаг палитры: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.

#### Semantic (роли)

```
color.{role}.{variant}.{state}
```

**Роли:** `primary`, `secondary`, `danger`, `warning`, `success`, `info`, `neutral`.

**Варианты:** `default`, `subtle`, `outline`, `ghost`.

**Состояния:** `rest`, `hover`, `active`, `focus`, `disabled`, `loading`.

### 8.2. Подход к состояниям

Каждое состояние — отдельный токен с явным цветовым значением. Никакого overlay/opacity.

```json
{
  "color": {
    "primary": {
      "default": {
        "rest":     { "$value": "{color.blue.600}" },
        "hover":    { "$value": "{color.blue.700}" },
        "active":   { "$value": "{color.blue.800}" },
        "focus":    { "$value": "{color.blue.600}" },
        "disabled": { "$value": "{color.gray.300}" },
        "loading":  { "$value": "{color.blue.500}" }
      }
    }
  }
}
```

### 8.3. Обоснование

- **Предсказуемость:** каждый цвет задан явно, результат не зависит от фона.
- **Гибкость:** разработчики и дизайнеры могут точно контролировать каждый оттенок.
- **Темизация:** при смене темы (dark mode, brand theme) меняется маппинг semantic → primitive, примитивы остаются.
- **Чистота:** отсутствие opacity исключает «грязные» наложения цветов.

---

## 9. Elevation & Shadows

### 9.1. Четыре уровня

| Token               | Offset-Y | Blur  | Использование                        |
|----------------------|----------|-------|--------------------------------------|
| `elevation.none`     | 0px      | 0px   | Карточки в потоке, инпуты            |
| `elevation.raised`   | 0–2px    | 4px   | Hover-кнопки, интерактивные карточки |
| `elevation.overlay`  | 0–4px    | 16px  | Dropdown, tooltip, context menu      |
| `elevation.floating` | 0–8px    | 40px  | Modal, sidebar, alert                |

### 9.2. Реализация: Layered Shadows

Каждый уровень — 3 слоя box-shadow:

```
Umbra:    чёткая, тёмная, близко к объекту → структура
Penumbra: мягкая, размытая → объём
Ambient:  едва заметное широкое свечение → воздух
```

### 9.3. Backdrop Filter

Для уровней `overlay` и `floating` — `backdrop-filter: blur()` для сложных случаев (прозрачные панели, overlays поверх контента).

### 9.4. Dark Mode

- Elevation через прозрачность фона: чем выше элемент, тем светлее фон (+3–5% white opacity на уровень).
- Тени сохраняются, но шире и темнее.
- На уровнях `overlay` и `floating` — дополнительный `border` (1px, `color.neutral.subtle.rest`) для визуального отделения от фона.

---

## 10. Motion

### 10.1. Duration

| Token              | Value | Использование                      |
|--------------------|-------|------------------------------------|
| `motion.fast`      | 100ms | Hover, focus, color transitions    |
| `motion.normal`    | 200ms | Expand/collapse, slide             |
| `motion.slow`      | 300ms | Modal enter/exit, page transitions |

### 10.2. Easing

| Token                | Value                    | Использование       |
|----------------------|--------------------------|----------------------|
| `motion.ease.in`     | cubic-bezier(0.4, 0, 1, 1)    | Уход элемента  |
| `motion.ease.out`    | cubic-bezier(0, 0, 0.2, 1)    | Появление      |
| `motion.ease.in-out` | cubic-bezier(0.4, 0, 0.2, 1)  | Перемещение    |

---

## 11. Icons

### 11.1. Набор

**Tabler Icons** — open source, консистентный стиль, широкое покрытие.

### 11.2. Размерная шкала (независимая)

| Token       | Value |
|-------------|-------|
| `icon.xs`   | 16px  |
| `icon.sm`   | 20px  |
| `icon.md`   | 24px  |
| `icon.lg`   | 32px  |

### 11.3. Маппинг на размер компонента

| Component Size | Рекомендуемый Icon Size |
|----------------|------------------------|
| `xs` (24px)    | `icon.xs` (16px)       |
| `sm` (28px)    | `icon.xs` (16px)       |
| `md` (36px)    | `icon.sm` (20px)       |
| `lg` (44px)    | `icon.md` (24px)       |
| `xl` (52px)    | `icon.md` (24px)       |

> Маппинг рекомендательный. Жёстко фиксируется в дефолтной конфигурации компонента, но может быть переопределён через API.

---

## 12. Component API Contract

### 12.1. Правило

Перед реализацией каждого компонента создаётся API-контракт:

```typescript
// Пример: Button API Contract
interface ButtonProps {
  size:     'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant:  'default' | 'subtle' | 'outline' | 'ghost';
  color:    'primary' | 'secondary' | 'danger' | 'neutral';
  disabled: boolean;
  loading:  boolean;
  iconLeft?:  string;
  iconRight?: string;
}
```

### 12.2. Обязательные свойства для всех интерактивных компонентов

- `size` — из шкалы sizing.
- `variant` — визуальный вариант.
- `disabled` — состояние недоступности.

### 12.3. Loading State

Loading — **отдельное состояние**, не являющееся disabled. Семантика различна: disabled = «действие недоступно», loading = «действие выполняется».

Правила для loading:

- `pointer-events: none` — блокировка повторного клика.
- `aria-busy="true"` — скринридер объявляет загрузку.
- **Фокус сохраняется** — компонент остаётся в tab order (в отличие от disabled, который убирает из tab order).
- Визуально: спиннер заменяет иконку (или текст), но компонент не «гаснет» — сохраняет цвет роли с приглушённым контрастом (токен `{state}.loading`).
- `loading` и `disabled` — взаимоисключающие состояния. Если оба true, приоритет у `loading`.

### 12.4. Accessibility

Каждый компонент обязан:
- Поддерживать клавиатурную навигацию.
- Иметь корректные ARIA-атрибуты.
- Обеспечивать контраст ≥ 4.5:1 (WCAG AA) для текста и ≥ 3:1 для UI-элементов.

---

## 13. Themability

### 13.1. Механизм

Тема = набор semantic tokens.
Переключение темы = замена маппинга semantic → primitive.
Primitive-палитра остаётся неизменной (если не требуется brand-кастомизация).

### 13.2. CSS Custom Properties

Все semantic tokens рендерятся в CSS custom properties:

```css
:root {
  --color-primary-default-rest: #2563EB;
  --color-primary-default-hover: #1D4ED8;
  --spacing-sm: 16px;
  --radius-comp-md: 12px;
}

[data-theme="dark"] {
  --color-primary-default-rest: #60A5FA;
  --color-primary-default-hover: #93C5FD;
}
```

### 13.3. Angular Integration

Токены доступны через:
- CSS custom properties (основной способ).
- TypeScript-константы для программной логики.
- SCSS-переменные (опционально, для удобства миграции).

---

## 14. File Structure (Repository)

```
kanso-protocol/
├── tokens/
│   ├── primitive/
│   │   ├── color.json
│   │   ├── spacing.json
│   │   └── ...
│   ├── semantic/
│   │   ├── color.json
│   │   ├── elevation.json
│   │   └── ...
│   └── build/              ← скомпилированные токены
│       ├── css/
│       ├── scss/
│       └── ts/
├── packages/
│   ├── core/               ← базовые стили, токены, миксины
│   ├── components/         ← Angular-компоненты
│   │   ├── button/
│   │   ├── input/
│   │   ├── select/
│   │   └── ...
│   └── icons/              ← обёртка над Tabler Icons
├── apps/
│   └── docs/               ← документация и витрина (Storybook / аналог)
├── figma/
│   └── tokens.json         ← экспорт для Figma Variables
└── README.md
```

---

## 15. Component documentation

Every new component requires three artifacts in one PR:

1. **Implementation** — Angular component in `packages/components/{name}/`
2. **Figma component** — published in the Design System file
3. **API contract** — markdown file in `docs/components/{name}.md` following `docs/components/_template.md`

A PR adding a component without all three is not merged.

The API contract is the source of truth for component behavior. Figma and Angular implementations must match it. When they diverge, the contract is updated first, then implementations follow.

---

## 16. Guiding Principles

1. **Explicit over implicit.** Никаких магических значений — всё через токены.
2. **Architecture over agreements.** Правила зашиты в структуру, а не в README.
3. **Predictability over flexibility.** Лучше ограниченный, но предсказуемый API, чем гибкий, но хаотичный.
4. **Single source of truth.** Токены → Figma Variables + Code. Одно изменение — одно место.
5. **Every component is equal.** Единая анатомия, единый API-контракт, без исключений без ADR.
