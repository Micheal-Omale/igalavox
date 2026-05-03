---
name: Igala Heritage
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#414944'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#717974'
  outline-variant: '#c0c8c3'
  surface-tint: '#396756'
  primary: '#00261b'
  on-primary: '#ffffff'
  primary-container: '#0b3d2e'
  on-primary-container: '#79a894'
  inverse-primary: '#a0d1bc'
  secondary: '#7c563b'
  on-secondary: '#ffffff'
  secondary-container: '#fecaa8'
  on-secondary-container: '#795338'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cba72f'
  on-tertiary-container: '#4e3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcedd7'
  primary-fixed-dim: '#a0d1bc'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#214f3f'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#efbc9b'
  on-secondary-fixed: '#2f1502'
  on-secondary-fixed-variant: '#623f25'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 2rem
  xl: 4rem
  gutter: 1.5rem
  margin: 2rem
---

## Brand & Style

The brand personality is reverent, scholarly, and warm. It aims to evoke a sense of digital preservation, positioning cultural lineage as a premium and essential asset for the modern era. The UI should feel like a high-end digital archive—clean and organized, yet deeply connected to the earth and tradition.

This design system utilizes an **Organic Minimalist** style. It strips away unnecessary decorative clutter to focus on the weight and meaning of words, using generous whitespace and intentional focal points. The aesthetic is grounded in a modern African heritage, blending traditional color palettes with contemporary layouts, soft shadows, and subtle tactile textures reminiscent of woven fabric or handmade paper.

## Colors

The palette is inspired by the natural landscape and materials of the Igala kingdom. 
- **Deep Forest Green** serves as the primary anchor, used for core navigational elements and primary actions to symbolize life and continuity. 
- **Earth Brown** provides structural depth, used for secondary text and borders. 
- **Warm Gold** is the "royal" accent, reserved for special highlights, premium features, or celebratory iconography. 
- **Off-white / Ivory** acts as the canvas, reducing eye strain and providing a soft, parchment-like background. 
- **Muted Red Clay** is used sparingly for semantic signals, interactive states, or subtle dividers to add warmth without disrupting the calm atmosphere.

## Typography

The typographic hierarchy prioritizes readability and cultural authority. **Noto Serif** is used for all headlines and display text to provide a sophisticated, literary feel that honors the weight of ancestral names. 

**Plus Jakarta Sans** is the secondary typeface for body copy and UI labels. Its soft, rounded terminals complement the organic nature of the brand while ensuring high legibility on digital screens. For name meanings and etymology descriptions, use the Body-LG size to give the content the prominence it deserves. Captions and labels should occasionally utilize uppercase styling with increased letter-spacing to create an "archival tag" aesthetic.

## Layout & Spacing

This design system uses a **Fixed Grid** model for desktop experiences (12 columns) to maintain an editorial, book-like structure. On mobile devices, it transitions to a fluid single-column layout with generous side margins.

The spacing rhythm is built on an 8px base unit. Negative space is used as a functional tool to separate distinct entries in name listings, preventing the UI from feeling cramped. Content should be grouped into logical "clusters" with consistent padding (MD) and wider gaps (LG) between sections to create a rhythmic, easy-to-scan reading experience.

## Elevation & Depth

Depth in this design system is achieved through **Ambient Shadows** and **Tonal Layers** rather than high-contrast shadows. Surfaces should feel like they are gently resting on one another.

- **Low Elevation:** Use a soft, diffused shadow with a hint of Earth Brown (#5C3A21) at 5-10% opacity for cards and input fields.
- **High Elevation:** For modals or floating menus, increase the shadow spread and blur, but maintain a low opacity to avoid a "heavy" look.
- **Texture:** Subtle grain or noise overlays should be applied to the background and primary containers to mimic the tactile feel of organic materials.
- **Dividers:** Use thin, low-opacity lines in Red Clay (#A44A3F) to separate content without creating harsh visual breaks.

## Shapes

The shape language is defined by friendliness and organic flow. Elements utilize a **Rounded** (0.5rem) base radius. This softens the interface, making it feel more approachable and less institutional.

- **Standard Elements:** Buttons, cards, and input fields use the base 0.5rem radius.
- **Large Containers:** Content sections or featured name cards should use `rounded-lg` (1rem) to emphasize their role as distinct containers of knowledge.
- **Interactive States:** When hovered or active, shapes should not change their radius, but rather their elevation or internal fill color.

## Components

### Buttons
Primary buttons use the Deep Forest Green background with Ivory text. Secondary buttons should use a ghost style with an Earth Brown border. All buttons must have a subtle transition effect on hover, increasing the shadow depth slightly.

### Cards (Name Cards)
The core component of the platform. Cards should have an Ivory background, a soft ambient shadow, and a 1px border in a muted Earth Brown. The Name itself should be in Noto Serif (Headline-MD), with the meaning in Plus Jakarta Sans.

### Input Fields
Search bars and form fields use a slightly darker version of the Ivory background to create a "recessed" look. Focus states are indicated by a 2px Warm Gold border.

### Chips & Tags
Used for categories (e.g., "Gender," "Region," "Era"). These should be pill-shaped with a background of Muted Red Clay at low opacity (10-15%) and text in the same color at full opacity.

### Audio Player
A specialized component for hearing name pronunciations. It should be minimalist, featuring a simple play icon in Warm Gold and a progress line in Earth Brown, maintaining the tactile, premium aesthetic.

### Heritage Dividers
Custom horizontal rules that may incorporate a subtle, repeating geometric pattern inspired by Igala textiles, rendered in a very faint Earth Brown.