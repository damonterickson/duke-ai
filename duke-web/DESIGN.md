# Design System Specification: Kinetic Command & Editorial Depth

## 1. Overview & Creative North Star

**Creative North Star: The Tactical Vanguard**

This design system moves beyond the standard collegiate aesthetic, positioning the JMU ROTC experience as a high-performance command center. It blends the authority of traditional military editorial—think bold, heavy typography and structured layouts—with a kinetic, futuristic interface.

The system rejects the "flat web" in favor of **Atmospheric Depth**. By utilizing heavy glassmorphism, glowing status indicators, and an absolute "No-Line" policy, we create a UI that feels like it's projected onto a heads-up display (HUD). Asymmetry and overlapping elements are encouraged to break the rigid grid, providing a sense of forward motion and high-stakes engagement.

---

## 2. Color & Tonal Architecture

The palette is rooted in JMU tradition but evolved through tactical application. We use deep purples for structural depth and Duke Gold/Tactical Olive for high-action highlights.

### The "No-Line" Rule
**Lines are prohibited for sectioning.** Hierarchy must be achieved through:
- **Surface Transitions:** Moving from `surface` (#151317) to `surface_container_low` (#1d1b1f).
- **Hard Shifting:** A background color shift from a neutral surface to a `primary_container` (#450084) block.
- **Blur Boundaries:** Using `backdrop-blur` (20px+) on glass containers to naturally diffuse the background.

### Surface Hierarchy & Glassmorphism
To achieve the "Command Center" feel, we treat the UI as stacked translucent plates:
1. **Base Layer:** `surface` (#151317) – The void.
2. **Muted Content:** `surface_container` (#211f23) – Secondary information.
3. **Active Tactical Layer:** Glassmorphism using `surface_variant` (#373438) at 60% opacity with a heavy blur.
4. **Action Layer:** `primary_container` (#450084) for high-impact editorial blocks.

### Signature Textures
Main CTAs and "Hero" cards should utilize a linear gradient: `primary` (#d9b9ff) to `primary_container` (#450084) at a 135-degree angle. This adds a "lithic" quality that flat fills cannot replicate.

---

## 3. Typography: The Editorial Impact

Typography is the primary engine of the kinetic aesthetic. We use a high-contrast scale to create an "Information First" hierarchy.

* **Display (Public Sans Black):** Use `display-lg` (3.5rem) and `display-md` (2.75rem) for bold, declarative statements. These should often be set in All-Caps with a tight `-2%` letter spacing to feel "Tactical."
* **Headlines:** Use `headline-lg` (2rem) for section headers. These are the anchors of the page.
* **Data Labels (Space Grotesk):** Use `label-md` (0.75rem) for all technical data, ranks, and metadata. This monospaced-leaning font provides the "Command Center" feel.
* **Body (Inter):** Reserved for instructional text. Use `body-lg` (1rem) for readability against dark surfaces.

---

## 4. Elevation & Depth: The Layering Principle

We move away from the "shadow-on-white" paradigm. In this system, light comes from within the components.

* **Tonal Stacking:** Place a `surface_container_highest` (#373438) card on a `surface_container_low` (#1d1b1f) background. The delta in luminance creates an organic lift.
* **The Glow (Ambient Shadows):** Instead of black shadows, use "Glow Drops." For a secondary element, use `secondary_container` (#544511) as the shadow color at 15% opacity with a 30px blur. This mimics a backlit LED screen.
* **The Ghost Border:** If separation is failing accessibility tests, use a 1px stroke of `outline_variant` (#4b4452) at **15% opacity**. It should be felt, not seen.

---

## 5. Tactical Components

### The "Squad Rank" Badge
* **Visuals:** A combination of `secondary` (Duke Gold) and `tertiary` (Tactical Olive).
* **Style:** No background. Use a heavy `outline` (#968d9d) at 20% and a `label-md` Space Grotesk tag.
* **Gamification:** Use a `box-shadow` glow of the `secondary` color when a user levels up.

### Interactive Data Cards
* **Container:** Glassmorphism (Surface Variant @ 50% opacity, 24px blur).
* **Header:** Bold `title-sm` Inter text, All-Caps.
* **Content:** No dividers. Use `spacing-6` (2rem) to separate data points.
* **Footer:** A `surface_bright` (#3b383d) angled corner-cut (using clip-path) to reinforce the kinetic, non-square aesthetic.

### Achievement Progress Rings
* **Track:** `surface_container_highest` (#373438).
* **Progress:** `secondary` (#dbc585) with a "Neon" drop shadow of the same color.
* **Center:** Use `display-sm` for the percentage, centered with a slight `tertiary` (#c3cc8c) glow.

### Buttons (Tactical CTAs)
* **Primary:** `primary_container` (#450084) background, `on_primary_container` (#b27ff5) text. Roundedness: `sm` (0.125rem) for a sharper, military feel.
* **Kinetic State:** On hover, the button should expand by `spacing-0.5` and increase its shadow glow intensity.

---

## 6. Do's and Don'ts

### Do:
* **Use Asymmetry:** Place a large `display-lg` header overlapping a glass container.
* **Embrace the Dark:** Keep the background at `surface` (#151317) to make the `secondary_fixed` (#f8e19e) highlights pop.
* **Use Spacing as a Divider:** Use `spacing-8` (2.75rem) to separate content blocks instead of lines.

### Don't:
* **Don't Use 100% Opacity Borders:** This kills the HUD/Glass effect.
* **Don't Use Standard "Web Blue":** All links and actions must stay within the JMU Purple, Duke Gold, or Tactical Olive spectrum.
* **Don't Center-Align Everything:** High-end editorial design thrives on left-aligned, "staggered" layouts that lead the eye through the data.
* **Don't Use Default Shadows:** Avoid `#000000` shadows. Always tint shadows with the `primary_container` or `secondary_container` hues.
