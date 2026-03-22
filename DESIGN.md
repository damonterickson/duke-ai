# Design System: Kinetic Command & Editorial Depth

## 1. Overview & Creative North Star

**Creative North Star: "The Tactical Vanguard"**

A dark-first HUD aesthetic that transforms every screen into a command center. Atmospheric depth replaces flat layouts. Surfaces float in void-black space with colored glow effects emanating from within. The no-line policy is absolute — visual hierarchy comes from surface tiers, glassmorphism, and luminous accents. Typography is editorial: bold, confident, and immediate.

---

## 2. Color & Tonal Architecture

### Primary (Command Purple)
| Token               | Hex       | Usage                          |
|---------------------|-----------|--------------------------------|
| `primary`           | `#d9b9ff` | Active elements, key actions   |
| `primary_container` | `#450084` | Chat bubbles (user), chips     |
| `on_primary`        | `#460185` | Text/icons on primary surfaces |
| `on_primary_container` | `#b27ff5` | Text on primary containers  |

### Secondary (Duke Gold)
| Token                    | Hex       | Usage                        |
|--------------------------|-----------|------------------------------|
| `secondary`              | `#dbc585` | Highlights, achievements     |
| `secondary_container`    | `#544511` | Rank badges, patch chips     |
| `on_secondary`           | `#3c2f00` | Text/icons on secondary      |
| `on_secondary_container` | `#c9b475` | Text on secondary containers |

### Tertiary (Tactical Olive)
| Token                    | Hex       | Usage                         |
|--------------------------|-----------|-------------------------------|
| `tertiary`               | `#c3cc8c` | Supporting accents, tags      |
| `tertiary_container`     | `#2c3303` | Olive chip backgrounds        |
| `on_tertiary`            | `#2d3404` | Text/icons on tertiary        |

### Surface Tiers (The Void)
| Token                        | Hex       | Usage                             |
|------------------------------|-----------|-----------------------------------|
| `surface`                    | `#151317` | Page background (the void)        |
| `surface_container_lowest`   | `#0f0d11` | Deepest recessed areas            |
| `surface_container_low`      | `#1d1b1f` | Card backgrounds, chat AI bubbles |
| `surface_container`          | `#211f23` | Section backgrounds               |
| `surface_container_high`     | `#2c292d` | Elevated cards, modals            |
| `surface_container_highest`  | `#373438` | Pressed states, top-layer content |

### Semantic
| Token             | Hex       | Usage                     |
|-------------------|-----------|---------------------------|
| `on_surface`      | `#e7e1e6` | Primary text              |
| `error`           | `#ffb4ab` | Destructive actions       |
| `error_container` | `#93000a` | Error backgrounds         |
| `outline`         | `#968d9d` | Inactive icons, dividers  |
| `outline_variant` | `#4b4452` | Ghost borders (15%)       |

---

## 3. Design System Rules

### Rule 1: No-Line Rule
**No 1px solid borders anywhere.** Visual separation is achieved exclusively through background color shifts between surface tiers. Cards sit on `surface_container_low`; the card itself uses `surface_container`. Section groupings step through the surface tier ladder. If you need to distinguish two regions, change the background — never draw a line.

### Rule 2: Glassmorphism
Floating elements (sheets, overlays, tooltips) use a frosted-glass treatment:
- Background: `surface_container` at **60% opacity** (`rgba(33, 31, 35, 0.60)`)
- Backdrop blur: **16px** (heavier than v1 for dark mode contrast)
- Subtle inner glow: `0 0 30px rgba(217, 185, 255, 0.05)` (purple tint)
- Implemented via `expo-blur` BlurView with an rgba overlay

### Rule 3: Ghost Border
Input fields and text areas use an ultra-subtle "ghost border" on focus:
- Color: `outline_variant` (`#4b4452`) at **15% opacity**
- Width: 1.5px (only visible on focus, invisible at rest)
- This is the sole exception to the No-Line Rule

### Rule 4: Gradient CTAs
Primary action buttons use a diagonal linear gradient:
- `linear-gradient(135deg, #450084, #d9b9ff)`
- Text: `on_primary` (`#460185`)
- Built with `expo-linear-gradient`

### Rule 5: No Pure Black or Pure White
The darkest color in the system is `surface_container_lowest` (`#0f0d11`). Pure `#000000` is never used. The lightest text is `on_surface` (`#e7e1e6`). Pure `#ffffff` is reserved only for high-emphasis interactive states.

### Rule 6: No Rounded-Full
Pill shapes and full-circle radii are prohibited. All corners use the roundness scale (sharper for military feel):
| Token | Value |
|-------|-------|
| `sm`  | 2px   |
| `md`  | 4px   |
| `lg`  | 8px   |
| `xl`  | 12px  |

### Rule 7: Gold is Reward
The secondary palette (`#dbc585`) is reserved for achievements, milestones, and positive reinforcement. It must never be used for navigation chrome, structural layout, or status indicators unrelated to accomplishment.

---

## 4. Glow Drops (Elevation & Depth)

Traditional drop shadows are replaced with **Glow Drops** — colored shadows that appear to emanate from within the element:

| Elevation Level | Shadow Spec                                              | Usage                    |
|-----------------|----------------------------------------------------------|--------------------------|
| Level 0         | None                                                     | Flat content             |
| Level 1         | `0 4px 20px rgba(69, 0, 132, 0.12)`                     | Cards, list items        |
| Level 2         | `0 8px 30px rgba(69, 0, 132, 0.18)`                     | Modals, floating sheets  |
| Level 3         | `0 12px 40px rgba(69, 0, 132, 0.25)`                    | Popovers, elevated CTAs  |
| Gold Glow       | `0 4px 30px rgba(219, 197, 133, 0.15)`                  | Achievement elements     |

Glow color is derived from `primary_container` (#450084) for standard elements and `secondary` (#dbc585) for reward/achievement elements.

---

## 5. Typography

### Font Families
- **Display / Headlines:** Public Sans Black (900 weight for display, 700 for headlines)
- **Labels / Metadata:** Space Grotesk Medium
- **Body:** Inter Regular / Medium

### Type Scale
| Token        | Size  | Weight | Letter Spacing | Family       |
|--------------|-------|--------|----------------|--------------|
| `display_lg` | 57px  | 900    | -0.25px        | Public Sans  |
| `display_md` | 45px  | 900    | 0px            | Public Sans  |
| `display_sm` | 36px  | 900    | 0px            | Public Sans  |
| `headline_lg`| 32px  | 700    | 0px            | Public Sans  |
| `headline_md`| 28px  | 700    | 0px            | Public Sans  |
| `headline_sm`| 24px  | 700    | 0px            | Public Sans  |
| `title_lg`   | 22px  | 500    | 0px            | Public Sans  |
| `title_md`   | 16px  | 500    | 0.15px         | Public Sans  |
| `title_sm`   | 14px  | 500    | 0.1px          | Public Sans  |
| `body_lg`    | 16px  | 400    | 0.5px          | Inter        |
| `body_md`    | 14px  | 400    | 0.25px         | Inter        |
| `body_sm`    | 12px  | 400    | 0.4px          | Inter        |
| `label_lg`   | 14px  | 500    | 0.1px          | Space Grotesk|
| `label_md`   | 12px  | 500    | 0.5px          | Space Grotesk|
| `label_sm`   | 11px  | 500    | 0.5px          | Space Grotesk|

---

## 6. Spacing Scale

Base unit: `1rem` (16px). All spacing derives from 4px increments.

| Token | Value |
|-------|-------|
| 1     | 4px   |
| 2     | 8px   |
| 3     | 12px  |
| 4     | 16px  |
| 5     | 20px  |
| 6     | 24px  |
| 7     | 28px  |
| 8     | 32px  |
| 9     | 36px  |
| 10    | 40px  |
| 11    | 44px  |
| 12    | 48px  |
| 13    | 52px  |
| 14    | 56px  |
| 15    | 60px  |
| 16    | 64px  |

---

## 7. Component Specifications

### Cards
- Background: `surface_container_low` (#1d1b1f)
- Corner radius: `lg` (8px)
- Elevation: Level 1 Glow Drop
- No borders (surface tier contrast only)

### Buttons (Primary CTA)
- Gradient fill: `linear-gradient(135deg, #450084, #d9b9ff)`
- Text: `on_primary` (#460185)
- Corner radius: `sm` (2px) — sharp, military
- Elevation: Level 2 Glow Drop on press

### Buttons (Secondary)
- Background: `surface_container_high` (#2c292d)
- Text: `on_surface` (#e7e1e6)
- Corner radius: `sm` (2px)
- No glow at rest; Level 1 on hover/press

### Input Fields
- Background: `surface_container` (#211f23)
- Text: `on_surface` (#e7e1e6)
- Placeholder: `outline` (#968d9d)
- Focus: ghost border (`outline_variant` at 15%)
- Corner radius: `md` (4px)

### Chat Bubbles
- User: `primary_container` (#450084) with `on_primary_container` (#b27ff5) text
- AI: `surface_container_low` (#1d1b1f) with `on_surface` (#e7e1e6) text

### Navigation Bar
- Background: `surface` (#151317) with glassmorphism overlay
- Active icon: `primary` (#d9b9ff)
- Inactive icon: `outline` (#968d9d)
- No top border line (use surface contrast or subtle glow)

### Achievement / Reward Elements
- Accent: `secondary` (#dbc585)
- Glow: Gold Glow Drop
- Background: `secondary_container` (#544511)

---

## 8. Do's and Don'ts

### Do
- Use surface tier stepping to create visual hierarchy between nested containers
- Apply Glow Drop shadows instead of traditional black box-shadows
- Apply the gradient CTA style to every primary action button
- Keep gold/secondary usage exclusive to reward moments (OML milestones, rank achievements)
- Use `on_surface` (#e7e1e6) for all text — never pure white
- Pair trend arrows (shape indicator) with color so information is not color-only
- Test with Reduce Motion enabled; replace animations with static placeholders
- Rely on spacing (not lines) to separate list items and sections
- Use Space Grotesk for labels, metadata, and small UI text
- Make dark mode the default experience

### Don't
- Add `borderWidth: 1` or any `border` style to cards, rows, or sections
- Use `borderRadius: 9999` or any "pill" radius — use sm/md/lg/xl only
- Apply gold/secondary to navigation tabs, status badges, or structural elements
- Use `#000000` or `#ffffff` as literal values anywhere in the UI
- Rely solely on color to convey information (always pair with shape or text)
- Use decorative animations that serve no informational purpose
- Create custom spacing values outside the 4px-increment scale
- Use traditional black drop shadows — always use colored Glow Drops
