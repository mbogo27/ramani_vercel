# Arrow Dental — Global Design System Specification

## Brand Overview

**Brand Name:** Arrow Dental
**Tagline:** *Sharpening smiles. Touching lives.*
**Brand Personality:**

* Warm
* Trustworthy
* Professional
* Family-oriented
* Accessible
* Modern healthcare

The visual identity combines:

* Clinical professionalism
* Warm hospitality
* Friendly community care
* Modern dental technology

---

# 1. Brand Foundations

## 1.1 Logo System

### Primary Logo

* Tooth mascot illustration
* “Arrow Dental” wordmark
* Supporting tagline

### Logo Usage Rules

* Maintain minimum clear space equal to height of mascot eye
* Never distort proportions
* Never place on low-contrast backgrounds
* Use full-color version on light backgrounds
* Use white version on dark backgrounds

### Recommended Sizes

| Context       | Minimum Width |
| ------------- | ------------- |
| Header        | 140px         |
| Mobile Header | 100px         |
| Footer        | 120px         |
| Social Media  | 180px         |

---

# 2. Color System

## 2.1 Primary Palette

### Primary Orange

Used for:

* CTAs
* Buttons
* Links
* Accent headlines
* Icons

| Token       | Value     |
| ----------- | --------- |
| Primary 500 | `#F47C2C` |
| Primary 600 | `#E46E1F` |
| Primary 700 | `#C85A15` |

---

### Warm Beige

Used for:

* Section backgrounds
* Cards
* Soft panels
* Footer background

| Token     | Value     |
| --------- | --------- |
| Beige 100 | `#F6EAD7` |
| Beige 200 | `#EEDFC5` |
| Beige 300 | `#E4D2B3` |

---

### Dark Brown

Used for:

* Footer
* Secondary buttons
* Icons
* Supporting text

| Token     | Value     |
| --------- | --------- |
| Brown 700 | `#6B3D16` |
| Brown 800 | `#4F2A0F` |

---

## 2.2 Neutral Palette

| Token    | Value     |
| -------- | --------- |
| Gray 50  | `#FAFAFA` |
| Gray 100 | `#F3F3F3` |
| Gray 200 | `#E5E5E5` |
| Gray 300 | `#D1D1D1` |
| Gray 500 | `#7A7A7A` |
| Gray 700 | `#4B4B4B` |
| Gray 900 | `#1E1E1E` |

---

## 2.3 Semantic Colors

| Purpose | Color     |
| ------- | --------- |
| Success | `#2E9E57` |
| Error   | `#D64545` |
| Warning | `#E7A52B` |
| Info    | `#2D7EF7` |

---

# 3. Typography System

## Primary Typeface

### Recommended Font

**Poppins**

Fallback:

```css
font-family: 'Poppins', sans-serif;
```

---

## Typography Scale

### Headings

| Style | Size | Weight | Line Height |
| ----- | ---- | ------ | ----------- |
| H1    | 56px | 700    | 1.1         |
| H2    | 42px | 700    | 1.2         |
| H3    | 32px | 600    | 1.25        |
| H4    | 24px | 600    | 1.3         |
| H5    | 20px | 600    | 1.4         |

---

### Body Text

| Style      | Size | Weight | Line Height |
| ---------- | ---- | ------ | ----------- |
| Large Body | 18px | 400    | 1.7         |
| Body       | 16px | 400    | 1.7         |
| Small      | 14px | 400    | 1.6         |
| Caption    | 12px | 400    | 1.5         |

---

### Typography Rules

* Headings use dark neutral (`#1E1E1E`)
* Body text uses gray (`#4B4B4B`)
* Accent words in headings use Primary Orange
* Maximum paragraph width: 70 characters

---

# 4. Layout System

## 4.1 Container Widths

| Breakpoint | Max Width |
| ---------- | --------- |
| Desktop    | 1200px    |
| Tablet     | 960px     |
| Mobile     | 100%      |

---

## 4.2 Grid System

### Desktop

* 12-column grid
* 24px gutters

### Tablet

* 8-column grid
* 20px gutters

### Mobile

* 4-column grid
* 16px gutters

---

## 4.3 Spacing Scale

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 40px  |
| 2xl   | 64px  |
| 3xl   | 96px  |

---

# 5. Header & Navigation

## Header Structure

### Top Header

* Rounded beige container
* Center CTA button
* Logos aligned left/right

### Navigation

* Center-aligned
* Small uppercase feel
* Orange hover state

---

## Navigation Specs

| Property   | Value                        |
| ---------- | ---------------------------- |
| Height     | 80px                         |
| Sticky     | Yes                          |
| Background | `#FFF`                       |
| Shadow     | `0 2px 8px rgba(0,0,0,0.05)` |

---

# 6. Buttons

## Primary Button

### Specs

* Orange background
* White text
* Slight radius
* Medium weight

```css
background: #F47C2C;
color: white;
border-radius: 4px;
padding: 14px 28px;
```

---

## Secondary Button

```css
background: transparent;
border: 1px solid #6B3D16;
color: #6B3D16;
```

---

## Hover States

| Element          | Hover              |
| ---------------- | ------------------ |
| Primary Button   | Darker orange      |
| Secondary Button | Beige fill         |
| Links            | Underline + orange |

---

# 7. Card System

## Service Cards

### Structure

* White background
* Thin gray border
* Large icon
* Title
* Supporting text

### Specs

```css
border: 1px solid #E5E5E5;
padding: 32px;
border-radius: 0;
background: white;
```

---

## Testimonial Cards

### Specs

* Soft shadow
* Beige or white background
* Minimal border
* Left aligned text

```css
box-shadow: 0 4px 16px rgba(0,0,0,0.06);
```

---

# 8. Section Patterns

## Hero Sections

### Characteristics

* Large heading
* Orange accent word
* Supporting subheading
* CTA button
* Right-side image

### Layout Ratio

* Text: 45%
* Image: 55%

---

## Split Content Sections

### Pattern

* Image + text
* Alternating layout
* Large spacing
* Light background sections

---

## Stats Section

### Metrics Displayed

* Happy clients
* Experience years
* Patients served

### Style

* Icon + bold number
* Compact horizontal cards

---

# 9. Imagery Style

## Photography Direction

### Preferred Imagery

* Real patients
* Family-oriented photos
* Bright lighting
* Clean clinic interiors
* Smiling expressions

### Avoid

* Stock-heavy aesthetics
* Dark clinical imagery
* Overly sterile environments

---

## Image Styling

| Property     | Value |
| ------------ | ----- |
| Radius       | 6px   |
| Aspect Ratio | 4:3   |
| Object Fit   | Cover |

---

# 10. Iconography

## Style

* Outline icons
* Rounded edges
* Simple shapes
* Healthcare-friendly

### Recommended Libraries

* Lucide
* Font Awesome
* Heroicons

---

# 11. Forms

## Form Inputs

```css
height: 52px;
border: 1px solid #E5E5E5;
padding: 0 16px;
background: #FAFAFA;
```

---

## Form Behavior

| State    | Style           |
| -------- | --------------- |
| Focus    | Orange border   |
| Error    | Red border      |
| Disabled | Gray background |

---

# 12. Footer System

## Footer Layout

### Structure

4-column grid:

1. Logo
2. Business Hours
3. Services
4. Quick Links

---

## Footer Colors

| Area        | Color     |
| ----------- | --------- |
| Main Footer | `#F7F1EB` |
| Bottom Bar  | `#6B3D16` |
| Text        | `#4B4B4B` |

---

# 13. Mobile Design Rules

## Mobile Navigation

* Hamburger menu
* Full-screen drawer
* Large tap targets

---

## Mobile Spacing

* Reduce horizontal padding to 16px
* Stack all split layouts vertically
* Full-width buttons

---

## Typography Scaling

| Desktop | Mobile |
| ------- | ------ |
| 56px    | 38px   |
| 42px    | 30px   |
| 32px    | 24px   |

---

# 14. Accessibility Standards

## Minimum Requirements

| Element       | Requirement |
| ------------- | ----------- |
| Text Contrast | WCAG AA     |
| Tap Targets   | 44x44px     |
| Focus States  | Visible     |
| Alt Text      | Required    |

---

# 15. Component Inventory

## Core Components

* Header
* Footer
* Hero
* CTA Banner
* Testimonial Card
* Service Card
* FAQ Accordion
* Review Grid
* Insurance Logo Grid
* Contact Form
* Stats Counter
* Map Embed
* Section Header
* Floating WhatsApp Button

---

# 16. Interaction & Motion

## Animation Style

Subtle and professional

### Timing

```css
transition: all 0.25s ease;
```

---

## Motion Guidelines

| Interaction | Motion            |
| ----------- | ----------------- |
| Hover       | Slight elevation  |
| Buttons     | Color fade        |
| Cards       | Shadow increase   |
| Sections    | Fade-in on scroll |

---

# 17. Responsive Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1440px
```

---

# 18. CSS Design Tokens

```css
:root {
  --color-primary: #F47C2C;
  --color-primary-dark: #E46E1F;
  --color-beige: #F6EAD7;
  --color-brown: #6e4b28;
  --color-text: #1E1E1E;
  --color-text-secondary: #4B4B4B;

  --radius-sm: 4px;
  --radius-md: 6px;

  --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);

  --container-width: 1200px;
}
```

---

# 19. UX Principles

## Experience Goals

* Instantly trustworthy
* Easy appointment booking
* Warm and welcoming
* Family-focused
* Mobile-first
* Fast information retrieval

---

# 20. Recommended Improvements

## Visual Refinements

* Increase whitespace consistency
* Improve heading hierarchy
* Standardize card heights
* Increase CTA prominence
* Reduce text density

---

## Future Design System Expansion

* Dark mode
* Component library in Figma
* Tokenized design system
* Animation library
* CMS content blocks
* Multi-location template system
