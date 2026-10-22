# VolunteerConnect Saskatchewan Design System

Calm, trustworthy and easy to read. The site is for older adults, families and
small nonprofits, so every choice favours large readable text, clear actions
and very few colours, each with one job.

Tokens live in `frontend/src/index.css` (light) and `frontend/src/themes.css`
(dark and high contrast). Pages use token names, never raw values.

## Colour

Three brand colours, each with one role. Everything else is neutral.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-dark` | `#1f2f5c` navy | `#232c45` | Structure: header bands, footer, dashboard sidebar |
| `--color-dark-hover` | `#16224a` | `#2c3757` | Hover on navy surfaces |
| `--color-accent` | `#1d5fbf` blue | `#7fb0ff` | Action: primary buttons, links, selected states, logo |
| `--color-accent-hover` | `#174c99` | `#a3c6ff` | Hover on primary buttons and links |
| `--color-highlight` | `#e3a008` gold | `#f2c14e` | Trust marks only: verified badge icon, role card top rule. Never text on white |
| `--color-text` | `#1c2033` | `#eef1f7` | Body text and headings |
| `--color-text-muted` | `#4a5068` | `#b4bccd` | Secondary text. Never below 16px |
| `--color-surface` | `#ffffff` | `#1a1f2d` | Page content, cards, forms |
| `--color-bg` | `#f4f6fb` | `#12151f` | Tinted bands, dashboard background |
| `--color-border` | `#d9dee8` | `#343c52` | Dividers, card and input borders |
| `--color-placeholder` | `#6b7186` | `#9aa3b8` | Input placeholders |
| `--color-focus` | `#1d5fbf` | `#ffffff` | Keyboard focus ring |

Status colours (`--color-success-*`, `--color-danger-*`, `--color-warning-*`)
are for messages only, never decoration. Green appears nowhere else.

Contrast, light: text 16.1:1, muted 8.0:1, white on blue 6.1:1, white on navy
13.0:1, gold on navy 5.7:1. Dark: text 16.1:1, muted 9.6:1, blue 8.3:1.

## Typography

- Headings: `Noticia Text` 700 (`--font-heading`). Warm serif, headings only.
- Everything else: `Source Sans 3` 400, 600, 700 (`--font-body`).

| Token | Size / line height | Use |
|---|---|---|
| `--text-xs` | 14px / 1.4 | Badges, table meta. Not for sentences |
| `--text-sm` | 16px / 1.5 | Form hints, captions, footer |
| `--text-base` | 18px / 1.6 | Body text, inputs, buttons |
| `--text-lg` | 20px / 1.5 | Lead paragraphs, card titles |
| `--text-xl` | 24px / 1.3 | h3 |
| `--text-2xl` | 32px / 1.2 | h2 |
| `--text-3xl` | 44px / 1.15 | h1 on inner pages, section titles |
| `--text-4xl` | 56px / 1.1 | Home hero only |

Body text is dark (`--color-text`), not grey. Lines stay under 70 characters
(`max-width: 68ch`). Eyebrow labels use `--text-xs`, 700, uppercase, 0.08em
tracking, and appear at most once per section.

## Spacing

One 4/8 scale: `--space-1` 4, `--space-2` 8, `--space-3` 16, `--space-4` 24,
`--space-5` 32, `--space-6` 48, `--space-7` 80.

- Section padding: `--space-7` top and bottom on desktop, `--space-6` on phones.
- Content width: `--max-width` 1200px; reading width 68ch.
- Group related items with space, not boxes. Use a 1px `--color-border` divider
  before reaching for a card.

## Shape and depth

| Token | Value | Use |
|---|---|---|
| `--radius` | 6px | Buttons, inputs, small panels |
| `--radius-lg` | 12px | Cards, modals, the interest form |
| `--radius-pill` | 999px | Chips and badges only, never buttons |
| `--shadow-card` | `0 1px 3px rgba(28, 32, 51, 0.08)` | Cards, together with a border |
| `--shadow-dropdown` | `0 8px 24px rgba(28, 32, 51, 0.14)` | Menus, modals, anything floating |

## Components

**Buttons.** Three kinds only, all `--radius`, 48px minimum height, `--text-base` 600.

- Primary (`.btn-primary`): blue fill, white text. One per view, for the main action.
- Secondary (`.btn-outline`): white fill, navy 1.5px border, navy text. Hover fills `--color-bg`.
- Quiet (`.arrow-link`): blue text link, underline on hover.
- On navy bands, primary stays blue; secondary becomes white border and white text.
- Focus: 3px `--color-focus` ring, 3px offset. Disabled: 50% opacity, no hover.

**Links.** `--color-accent`, underlined in body text, no underline in navigation.

**Inputs.** White, 1px `--color-border`, `--radius`, 48px high, `--text-base`.
Label above in 600. Hover border `--color-text-muted`, focus ring as above.
Errors in `--color-danger` with a message below, never colour alone.

**Cards.** Only for repeated items a person picks from (organizations, roles,
resources). White, 1px border, `--radius-lg`, `--shadow-card`. No card inside a card.
Role cards carry a 4px `--color-highlight` top rule.

**Badges.** `--radius-pill`, `--text-xs` 700. Verified uses a gold icon with a text label.

**Navigation.** One white bar: logo, four main links, then Sign in (quiet) and
Sign up (primary). Language and display settings sit in a single icon menu.

**Footer.** Navy band, white text, three short columns at most.

**Dashboards.** Navy sidebar, `--color-bg` main area, white panels.

## Imagery and icons

- Icons: Material icons from `react-icons/md` only. No emoji as icons.
- Photos: real Saskatchewan community and volunteering scenes. Each photo is
  used once. No hospital wards or patient gowns, no stock illustrations.
- No gradients, glass effects or gradient text.
