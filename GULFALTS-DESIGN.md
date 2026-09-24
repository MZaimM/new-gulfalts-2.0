# Gulfalts 2.0 Design System

This document is the single source of truth for the Gulfalts 2.0 website. Use it when creating screens in Figma, Google Stitch, Webflow, or production code. When a design decision conflicts with this document, follow this document unless the project owner explicitly approves a change.

## 1. Brand foundation

### Brand idea

**Conviction, built into place.**

Gulfalts develops and manages institutional-grade commercial destinations shaped by Dubai's structural growth. The experience must make institutional investors, family offices, development partners, and prospective tenants feel that Gulfalts combines local operating intelligence with globally legible governance and execution.

### Positioning statement

> Gulfalts develops and manages institutional-grade commercial assets across the UAE's fastest-growing sectors.

### Brand promise

Gulfalts identifies durable demand, structures disciplined investment, and operates category-defining commercial real estate for long-term performance.

### Brand attributes

- Disciplined, never speculative
- Locally informed, never provincial
- Institutional, never corporate-generic
- Architectural, never decorative
- Forward-looking, never trend-driven
- Quietly premium, never ostentatious

### Naming consistency

- Use **Gulfalts** in interface copy, headings, metadata, and prose.
- Use **Gulf Alternatives** only where the full corporate or legal name is required.
- Do not alternate between `Gulfalts`, `GulfALTS`, and `Gulf Alts` within the same experience.
- Project names must always appear as **Dubai Creative Park** and **Dubai Fintech District**.

## 2. Visual theme and atmosphere

The visual atmosphere is a warm, gallery-airy institutional experience with architectural scale and controlled asymmetry. It should feel like an investment memorandum expressed through a high-end architecture publication: clear, composed, tactile, and confident.

- **Density:** 3/10 — generous macro-whitespace and short text blocks.
- **Variance:** 6/10 — asymmetric compositions inside a disciplined grid.
- **Motion:** 6/10 — one cinematic scroll sequence supported by quiet micro-interactions.
- **Tone:** warm, assured, spatial, evidence-led.
- **Primary visual tension:** soft mineral surfaces against rigorous black structure and deliberate burgundy signals.

Use the references selectively:

- Archline contributes architectural pacing, spatial restraint, and image-led storytelling.
- TREF contributes institutional gravity and direct investor communication.
- Luneo contributes typographic scale, section indexing, and asymmetric project presentation.
- Do not reproduce any reference's exact layout, typography, navigation, or animation.

## 3. Color palette and roles

The palette has one accent family: Burgundy. Do not introduce blue, green, gold, orange, purple, or neon accents.

### Core tokens

| Token | Value | Functional role |
|---|---:|---|
| Gulfalts Ink | `#101010` | Primary text, dark chapters, structural authority |
| Warm Canvas | `#F3E9E3` | Default page background and human warmth |
| Warm Surface | `#E0D3CC` | Secondary surfaces, map panels, quiet separation |
| Conviction Burgundy | `#801B2B` | Primary actions, selected states, focus, data emphasis |
| Burgundy Hover | `#6A1724` | Hover state for Burgundy actions |
| Burgundy Pressed | `#55121D` | Pressed state for Burgundy actions |
| Burgundy Soft | `#E5D1D5` | Low-emphasis highlights and selected backgrounds |
| Paper White | `#FFFDFC` | Rare high-contrast surface over dark imagery |

`#801B2B` is the canonical Burgundy. The moodboard also contains `#7F1B2B`; do not use that competing base value.

### Derived tokens

| Token | Value | Usage |
|---|---:|---|
| Primary text | `#101010` | Headlines and body text |
| Secondary text | `rgba(16, 16, 16, 0.64)` | Supporting copy and metadata |
| Inverse text | `#F3E9E3` | Text on Ink or Burgundy surfaces |
| Structural line | `rgba(16, 16, 16, 0.14)` | Dividers and section rules |
| Inverse line | `rgba(243, 233, 227, 0.22)` | Dividers on dark surfaces |
| Image scrim | `rgba(16, 16, 16, 0.30)` | Text protection over photography |
| Focus ring | `#801B2B` | Keyboard focus indicator |

### Usage ratio

- Warm Canvas: approximately 65%
- Warm Surface: approximately 20%
- Gulfalts Ink: approximately 10%
- Burgundy family: no more than 5%

Use Burgundy as a signal, not as decoration. A section should not become Burgundy simply to create visual variety.

### Color rules

- Never use pure black `#000000`.
- Never use gradients, gradient text, neon light, or outer glow effects.
- Do not mix cool gray with the warm neutral palette.
- Do not use low-contrast gray text over photography.
- Large dark chapters are allowed only when they contain a complete narrative unit, not as isolated decorative strips.

## 4. Typography

### Font family

Use **DM Sans Variable** exclusively across display, body, UI, statistics, and metadata. The identity gains editorial character through scale, tracking, proportion, and whitespace rather than a second typeface.

```css
font-family: "DM Sans", sans-serif;
font-optical-sizing: auto;
```

Load only the variable font files and required character sets. Use `font-display: swap`.

### Type scale

| Style | Size | Line height | Weight | Tracking |
|---|---|---|---:|---:|
| Hero display | `clamp(3.5rem, 7.5vw, 7rem)` | `0.90` | 500 | `-0.055em` |
| Section display | `clamp(2.5rem, 5vw, 4.75rem)` | `0.98` | 500 | `-0.045em` |
| Feature heading | `clamp(1.75rem, 3vw, 3rem)` | `1.05` | 500 | `-0.03em` |
| Card/row heading | `1.5rem` | `1.15` | 500 | `-0.02em` |
| Lead body | `clamp(1.125rem, 1.5vw, 1.375rem)` | `1.45` | 400 | `-0.01em` |
| Body | `1rem` to `1.125rem` | `1.60` | 400 | `0` |
| Navigation/UI | `0.875rem` to `1rem` | `1.20` | 500 | `-0.01em` |
| Eyebrow/metadata | `0.75rem` to `0.8125rem` | `1.20` | 600 | `0.10em` |

### Typography rules

- Use weight 300 only for large, non-critical statements. Never use it for body copy.
- Use 400 for body text, 500 for headings, and 600 for controls and labels.
- Use weight 700 rarely and only for a deliberate numeric emphasis.
- Set body-copy width to a maximum of `65ch`; target `48–58ch` for important statements.
- Use sentence case for headings and buttons.
- Uppercase is reserved for short eyebrows, project indices, and verified metadata.
- Use `font-variant-numeric: tabular-nums` for statistics, dates, and project figures.
- Use balanced wrapping for display headings and pretty wrapping for body copy.
- Avoid orphaned final words in prominent headlines.

## 5. Grid, spacing, and composition

### Container

- Maximum content width: `1440px`.
- Desktop side gutter: `32px` minimum.
- Tablet side gutter: `24px`.
- Mobile side gutter: `16px`.
- Full-bleed media may extend beyond the content grid but must remain inside the viewport.

### Grid

- Desktop: 12 columns.
- Tablet: 6 columns.
- Mobile: 4 columns, collapsing content to one readable flow.
- Use CSS Grid for principal layouts.
- Do not calculate multi-column layouts with fragile Flexbox percentages.

### Spacing scale

Use only values from this scale unless an optical correction is required:

`4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160px`

- Major section spacing: `clamp(6rem, 10vw, 10rem)`.
- Section heading to content: `48–64px` desktop, `32–40px` mobile.
- Related text gap: `16–24px`.
- Component internal padding: `24–40px`.
- Optical spacing may differ between a section's top and bottom; mathematical symmetry is not required.

### Composition rules

- Default to left-aligned, asymmetric compositions.
- Use negative space as a primary design element.
- Do not overlap text, controls, and images. Every element occupies a clean spatial zone.
- Do not center the hero.
- Avoid repetitive equal-width card grids.
- Use alternating image/text proportions, offset rows, split screens, and editorial dividers.
- Use `min-height: 100dvh`, never `height: 100vh`, for viewport-scale sections.

## 6. Image and media direction

Use real Gulfalts properties and real Dubai context wherever possible.

### Preferred subjects

- Wide architectural establishing views
- Material details and structural junctions
- Landscaped pedestrian spaces
- Human-scale activity without posed stock-photo behavior
- Construction, operation, and spatial progress where credible
- Aerial or map imagery only when it communicates location or scale

### Treatment

- Warm, restrained grading with neutral highlights and controlled saturation.
- Preserve architectural verticals and avoid dramatic lens distortion.
- Pair one wide view with one tactile detail rather than repeating similar views.
- Use a subtle `2–4%` monochromatic grain layer only if it is performance-safe.
- Protect overlaid text with a restrained Ink scrim; never apply a colored gradient.

### Media rules

- No generic Dubai skyline hero.
- No glossy luxury-property stock imagery.
- No AI-generated people or fake tenants.
- No auto-playing audio.
- Optional video must be muted, short, optimized, and supplied with a static poster.
- Meaningful images require descriptive alt text. Decorative textures use empty alt text intentionally.

## 7. Core components

### Navigation

- Use a slim sticky header that begins transparent over the hero and resolves to Warm Canvas with a structural bottom line.
- Do not use an oversized floating pill container.
- Desktop navigation: Portfolio, Approach, Locations, The Firm, and one primary inquiry action.
- Mobile navigation becomes a full-width, accessible menu with visible close control and focus management.
- Minimum control height: `44px`.
- Show a restrained active-section indicator using a Burgundy line or text color.

### Primary button

- Fill: Conviction Burgundy.
- Text: Warm Canvas.
- Height: `48px` minimum.
- Horizontal padding: `20–24px`.
- Radius: `6px`.
- Shadow: none.
- Hover: Burgundy Hover with a subtle `translateY(-1px)`.
- Pressed: Burgundy Pressed with `translateY(1px)` or `scale(0.985)`.
- Focus: `2px` Burgundy ring with `3px` offset.

### Secondary action

- Prefer a text link with a short directional line rather than a second filled button.
- Use Gulfalts Ink text and a Burgundy underline on hover.
- The hero contains only one primary CTA.

### Editorial content rows

- Replace generic cards with whitespace and `1px` structural dividers.
- Use a small index, a clear heading, concise supporting copy, and an optional link.
- Hover may shift the heading or line by `4–8px`; do not lift the entire row like a SaaS card.

### Statistics

- Use tabular figures.
- Number: section-display scale.
- Unit and label remain visually separate from the number.
- Every market statistic includes a source and reference date.
- Do not count up invented or rounded numbers.
- Animate each number once on first entry only; never loop the count animation.

### Project feature

- Use a large project image as the primary object.
- Required metadata: project name, category, location, status, and one verified distinguishing metric.
- One project link per feature.
- Active project state uses a Burgundy line or index, not a colored card background.
- Homepage project features are limited to Dubai Creative Park and Dubai Fintech District.

### Strategy disclosure

- Use an editorial accordion or vertical tab list with divider lines.
- Only one item is expanded at a time on desktop.
- On mobile, all items must remain available through accessible disclosure buttons.
- Use visible `+` and `−` states with text labels for assistive technology.

### Forms

- Labels appear above inputs; never rely on placeholders as labels.
- Input height: `52px` minimum.
- Surface: transparent or Paper White.
- Border: `1px solid rgba(16,16,16,0.24)`.
- Radius: `6px`.
- Error message appears below the field in Burgundy with plain, direct language.
- Required, disabled, loading, success, and error states must all be designed.
- Loading uses a layout-matched inline progress treatment, not a generic circular spinner.

### Map

- Preserve Leaflet and OpenStreetMap attribution.
- Use a desaturated, warm-neutral tile treatment where licensing permits.
- Active markers use Burgundy; inactive markers use Ink.
- Selecting a project in the list selects and centers its map marker, and vice versa.
- Every marker must be keyboard accessible.
- Provide a complete project-list fallback when the map cannot load.
- Map controls must meet `44 × 44px` touch targets.

### Footer

- Keep the footer compact and information-led.
- Include the logo, concise company description, main navigation, contact, social links, Privacy, Terms, and functional Cookie Settings.
- Do not create a four-column link farm.
- Do not include a newsletter form unless an actual publishing and consent workflow exists.

## 8. Motion and interaction

Motion communicates sequence, depth, and state. It must never delay access to information.

### Motion tokens

| Token | Value | Usage |
|---|---:|---|
| Instant | `120ms` | Pressed feedback |
| Quick | `220ms` | Hover and focus transitions |
| Standard | `480ms` | Component entry and state change |
| Narrative | `700ms` | Section and media reveal |
| Primary ease | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances and transitions |
| Spring | `stiffness: 100; damping: 20` | Physics-based UI when supported |

### Interaction rules

- Animate only `transform`, `opacity`, and safe composited clip/mask techniques.
- Never animate `top`, `left`, `width`, or `height` during continuous motion.
- Reveal lists with `60–90ms` stagger intervals.
- Scroll reveals begin no more than `12–20px` from their resting position.
- No bouncing arrows, “Scroll to explore” labels, custom cursors, magnetic-button gimmicks, or pointer trails.
- Use one restrained perpetual loop only when it communicates active state, such as a selected map marker pulse or extremely slow hero-media drift. It must stop under reduced-motion preferences.

### Signature immersive section

The homepage contains one principal pinned-scroll chapter: **Why Dubai, why now**.

- Use native page scrolling; never hijack wheel or touch input.
- Sequence three arguments: Global Capital, Population and Business Formation, Institutional Demand.
- Each step contains one concise claim, one sourced figure, and one changing visual.
- Use a Burgundy progress rule and clear active-step state.
- Text remains selectable and follows meaningful DOM order.
- On mobile, replace pinning with a simple stacked sequence.
- Do not place another aggressive pinned or horizontal scroll interaction immediately before or after this section.

### Reduced motion

Under `prefers-reduced-motion: reduce`:

- Remove pinning, parallax, count-up effects, mask travel, and ambient loops.
- Display every section in its final state.
- Preserve short color and focus transitions only.
- Keep the complete narrative and navigation available.

## 9. Responsive behavior

### Desktop: `1200px+`

- Use the 12-column grid and asymmetric image/text compositions.
- Display typography may approach the maximum scale.
- Immersive section may use sticky positioning.
- Portfolio projects may alternate `7/5` and `5/7` column relationships.

### Tablet: `768–1199px`

- Use six columns.
- Reduce large section gaps by approximately 25%.
- Keep asymmetric hierarchy but avoid narrow body-copy columns.
- Replace fragile side-by-side controls with stacked or two-column layouts.

### Mobile: `<768px`

- Collapse every multi-column layout into a single readable flow.
- No horizontal page scrolling.
- Minimum body text: `16px`.
- Minimum touch target: `44px`.
- Keep image aspect ratios intentional; do not crop important architecture blindly.
- Replace pinned storytelling with stacked chapters.
- Keep project metadata above the project CTA.
- Navigation opens as a normal document layer with focus trapping and Escape support.

## 10. Homepage architecture

The narrative order is: **identity → credibility → evidence → market thesis → work → capability → strategy → place → conversation**.

### 01. Hero

- Asymmetric, architectural, and immediately legible.
- Suggested eyebrow: `Dubai commercial real estate`.
- Suggested headline: `Institutional conviction, built for Dubai.`
- Suggested body: `Gulfalts develops and manages category-defining commercial assets across the UAE's fastest-growing sectors.`
- One primary CTA: `Explore our portfolio`.
- Do not use a generic skyline, centered headline, bouncing scroll prompt, or multiple competing CTAs.

### 02. About Gulfalts

- Explain what Gulfalts is, where it operates, who it works with, and how it creates value.
- Limit the main statement to approximately `70–100` words.
- Pair the text with one architectural detail or operational image.
- Use the full company name only once if legally or contextually necessary.

### 03. Gulfalts by the numbers

- Prioritize company proof over general Dubai market statistics.
- Current candidate proof includes `1.06M sq ft net leasable area` and `Since 2021`; confirm before publication.
- Add only verified leasing, tenant, delivery, or portfolio metrics.
- Place Dubai market statistics in a separately labelled market-proof group with source and date.

### 04. Immersive scroll — Why Dubai, why now

- One signature sequence covering Global Capital, Population and Business Formation, and Institutional Demand.
- Each step uses a maximum of one statistic and two short paragraphs.
- Close with a direct route to the full investment thesis.

### 05. Featured portfolio

- Feature only Dubai Creative Park and Dubai Fintech District on the homepage.
- Give each project a distinct spatial composition rather than two equal cards.
- Include status and verified metrics.
- V8 District and Motor Garten may remain accessible from a broader portfolio or venues page.

### 06. What we do

Use concrete capabilities:

1. Commercial development
2. Asset and property management
3. Investment and development partnerships
4. Destination operations

Do not use Conviction, Connectivity, and Scale as service names. Those are differentiators and may appear as supporting proof elsewhere.

### 07. Our strategies

Use a coherent strategy model:

1. Core income
2. Value-add and development
3. Opportunistic
4. Capital partnerships

Treat future-proofing, ESG readiness, adaptable infrastructure, and next-generation tenant needs as cross-cutting investment principles rather than a separate strategy category.

### 08. Locations and map

- Retain Leaflet.
- Show a synchronized list and map.
- Prioritize the two featured projects while allowing approved additional locations to remain discoverable.
- Provide project type, status, and link without requiring marker hover.

### 09. Call to action

- Suggested headline: `Build or invest with Gulfalts.`
- Provide clear inquiry routing for investment opportunities and development partnerships.
- One visible primary action at a time.
- Avoid the vague headline `Get in Touch` when more specific intent is available.

### 10. Footer

- Conclude with concise institutional information, contact routes, social links, and legal links.
- Use functional URLs or semantic buttons; do not use `href="#"` as a production destination.

## 11. Voice and content rules

### Voice

- Calm, direct, specific, and evidence-led.
- Prefer active voice and short declarative sentences.
- Explain specialist terms when a sophisticated non-real-estate reader may not know them.
- Use concrete nouns and verbs: develop, operate, structure, manage, lease, deliver.

### Avoid

- “Elevate,” “seamless,” “unleash,” “next-gen,” “game-changer,” and “redefine luxury.”
- Unsupported superlatives such as “unmatched,” “world-class,” and “unparalleled.”
- Empty claims about innovation, excellence, or vision.
- Long paragraphs that combine company positioning, market thesis, and operating detail.
- Fake testimonials, fake logos, fake awards, or invented investment performance.

### Data integrity

- Verify every company metric with Gulfalts before publishing.
- Date and source every market statistic.
- Clearly distinguish Gulfalts portfolio data from Dubai market data.
- Never imply guaranteed investment returns.
- Ensure legal and investor-facing language receives appropriate review.

## 12. Accessibility, SEO, and performance

### Accessibility

- Target WCAG 2.2 AA contrast and interaction requirements.
- Include a visible-on-focus skip link.
- Use one meaningful page-level `h1`; the hero value proposition is the H1.
- Maintain sequential heading structure.
- Provide visible keyboard focus on every interactive element.
- Use semantic buttons for UI actions and real links for navigation.
- Connect every form control to an explicit label.
- Do not encode project state or chart meaning through color alone.
- Ensure the Leaflet experience has an equivalent accessible project list.

### SEO

- Keep a unique title, description, canonical URL, Open Graph title, description, and image.
- Use project names and Dubai commercial real-estate language naturally, not repetitively.
- Add structured data only when it accurately represents the organization, locations, and published content.
- Project pages require unique metadata and share imagery.

### Performance

- Optimize the hero as the Largest Contentful Paint element.
- Supply responsive AVIF/WebP sources with accurate intrinsic dimensions.
- Lazy-load media below the fold; never lazy-load the primary hero image.
- Avoid loading 80 full-resolution assets when only a subset is visible.
- Keep motion transforms compositor-friendly.
- Defer the Leaflet bundle until the map is near the viewport when practical.
- Prevent layout shift by reserving media, map, and font dimensions.

## 13. Banned patterns

Never introduce any of the following:

- Pure black `#000000`
- Any accent color outside the Burgundy family
- Purple/blue neon, outer glows, or gradient text
- Generic serif fonts or an unapproved second typeface
- Inter, Roboto, Open Sans, or default system-font substitutions
- Three equal feature cards in one row
- Excessive pills, oversized rounded containers, or floating capsule navigation
- Heavy drop shadows, glassmorphism, or fake 3D surfaces
- Centered hero composition
- Overlapping text and images
- Custom cursor, pointer trail, or magnetic-button behavior
- Horizontal page overflow on mobile
- Scroll hijacking
- Bouncing scroll arrows or “Scroll to explore” filler
- Emoji in interface copy
- Generic icons used as decoration
- Generic AI copywriting clichés
- Fake numbers, fake performance claims, or unsourced market data
- Placeholder content, placeholder people, or stock corporate-team photography
- Dead `#` links in production
- Animation without a reduced-motion fallback

## 14. Definition of done

A Gulfalts 2.0 screen is complete only when:

- It follows the canonical color and DM Sans typography system.
- Its content supports the identity-to-conversation narrative.
- It uses one clear primary action and avoids competing emphasis.
- Desktop, tablet, mobile, keyboard, and reduced-motion states are designed.
- Every statistic is verified and appropriately sourced.
- Every interactive state is visible and accessible.
- The page contains no horizontal overflow, layout shift, dead link, or unlabeled control.
- Motion improves comprehension without delaying content.
- The result feels recognizably Gulfalts rather than a generic architecture or investment template.
