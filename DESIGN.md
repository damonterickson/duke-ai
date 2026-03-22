# Modern Vanguard Design System

## Creative North Star: "Tactical Precision"

Every pixel serves a purpose. Duke Vanguard's interface communicates with the quiet confidence of a well-maintained field manual: structured, purposeful, and devoid of unnecessary ornamentation. Surfaces layer like topographic contours; color is deployed with strategic intent; motion is deliberate, never decorative.

---

## 7 Design System Rules

### 1. No-Line Rule
**No 1px solid borders anywhere.** Visual separation is achieved exclusively through background color shifts between surface tiers. Cards sit on `surface_container_low`; the card itself uses `surface`. Section groupings step through the surface tier ladder. If you need to distinguish two regions, change the background — never draw a line.

### 2. Glassmorphism
Floating elements (sheets, overlays, tooltips) use a frosted-glass treatment:
- Background: `rgba(245, 250, 255, 0.80)`
- Backdrop blur: `12px`
- Implemented via `expo-blur` BlurView with an rgba overlay

### 3. Ghost Border
Input fields and text areas use an ultra-subtle "ghost border" on focus:
- Color: `outline_variant` (`#c8c7b8`) at **20% opacity**
- Width: 1.5px (only visible on focus, invisible at rest)
- This is the sole exception to the No-Line Rule

### 4. Gradient CTAs
Primary action buttons use a diagonal linear gradient:
- `linear-gradient(135deg, #343c0a, #4b5320)`
- Text: `on_primary` (`#ffffff`)
- Built with `expo-linear-gradient`

### 5. No Pure Black
The darkest color in the system is `on_surface` (`#0e1d26`), a deep blue-black. Pure `#000000` is never used for text, icons, or backgrounds.

### 6. No Rounded-Full
Pill shapes and full-circle radii are prohibited. All corners use the roundness scale:
| Token | Value |
|-------|-------|
| `sm`  | 2px   |
| `md`  | 6px   |
| `lg`  | 8px   |
| `xl`  | 12px  |

### 7. Gold is Reward
The tertiary palette (`#735c00` / `#cca730`) is reserved for achievements, milestones, and positive reinforcement. It must never be used for navigation chrome, structural layout, or status indicators unrelated to accomplishment.

---

## Color Palette

### Primary (Olive Drab)
| Token               | Hex       | Usage                        |
|---------------------|-----------|------------------------------|
| `primary`           | `#343c0a` | Active tab, key actions       |
| `primary_container` | `#4b5320` | Chat bubbles (user), chips    |

### Secondary (Field Khaki)
| Token                 | Hex       | Usage                        |
|-----------------------|-----------|------------------------------|
| `secondary`           | `#6d5d2f` | Supporting text, icons        |
| `secondary_container` | `#f5dea5` | Rank badges, patch chips      |

### Tertiary (Achievement Gold)
| Token                | Hex       | Usage                         |
|----------------------|-----------|-------------------------------|
| `tertiary`           | `#735c00` | Milestones, reward accents    |
| `tertiary_container` | `#cca730` | Progress bar fill, glow       |

### Surface Tiers
| Token                        | Hex       | Usage                             |
|------------------------------|-----------|-----------------------------------|
| `surface`                    | `#f5faff` | Page background                   |
| `surface_container_lowest`   | `#ffffff` | Elevated cards, inputs            |
| `surface_container_low`      | `#e9f5ff` | Card backgrounds, chat AI bubbles |
| `surface_container`          | `#e0f0fd` | Section backgrounds               |
| `surface_container_high`     | `#daeaf7` | Skeleton shimmer base             |
| `surface_container_highest`  | `#d5e5f1` | Pressed states, shimmer highlight |

### Semantic
| Token             | Hex       | Usage                  |
|-------------------|-----------|------------------------|
| `on_surface`      | `#0e1d26` | Primary text           |
| `on_primary`      | `#ffffff` | Text on primary bg     |
| `error`           | `#ba1a1a` | Destructive actions    |
| `outline`         | `#77786b` | Inactive icons         |
| `outline_variant` | `#c8c7b8` | Ghost borders (20%)    |

---

## Typography

### Font Families
- **Display / Headlines / Body:** Public Sans
- **Labels / Captions:** Inter

### Type Scale
| Token        | Size  | Weight     | Letter Spacing | Family      |
|--------------|-------|------------|----------------|-------------|
| `display_lg` | 57px  | 400        | -0.25px        | Public Sans |
| `display_md` | 45px  | 400        | 0px            | Public Sans |
| `display_sm` | 36px  | 400        | 0px            | Public Sans |
| `headline_lg`| 32px  | 400        | 0px            | Public Sans |
| `headline_md`| 28px  | 400        | 0px            | Public Sans |
| `headline_sm`| 24px  | 400        | 0px            | Public Sans |
| `title_lg`   | 22px  | 500        | 0px            | Public Sans |
| `title_md`   | 16px  | 500        | 0.15px         | Public Sans |
| `title_sm`   | 14px  | 500        | 0.1px          | Public Sans |
| `body_lg`    | 16px  | 400        | 0.5px          | Public Sans |
| `body_md`    | 14px  | 400        | 0.25px         | Public Sans |
| `body_sm`    | 12px  | 400        | 0.4px          | Public Sans |
| `label_lg`   | 14px  | 500        | 0.1px          | Inter       |
| `label_md`   | 12px  | 500        | 0.5px          | Inter       |
| `label_sm`   | 11px  | 500        | 0.5px          | Inter       |

---

## Spacing Scale

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

## Do's and Don'ts

### Do
- Use surface tier stepping to create visual hierarchy between nested containers
- Apply the gradient CTA style to every primary action button
- Keep gold/tertiary usage exclusive to reward moments (PR score milestones, rank achievements)
- Use `on_surface` (#0e1d26) for all text — never pure black
- Pair trend arrows (shape indicator) with color so information is not color-only
- Test with Reduce Motion enabled; replace animations with static placeholders
- Rely on spacing (not lines) to separate list items and sections

### Don't
- Add `borderWidth: 1` or any `border` style to cards, rows, or sections
- Use `borderRadius: 9999` or any "pill" radius — use sm/md/lg/xl only
- Apply tertiary gold to navigation tabs, status badges, or structural elements
- Use `#000000` anywhere in the UI
- Rely solely on color to convey information (always pair with shape or text)
- Use decorative animations that serve no informational purpose
- Create custom spacing values outside the 4px-increment scale
