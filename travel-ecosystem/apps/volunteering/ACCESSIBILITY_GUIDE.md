# Accessibility (A11y) Guide

## Overview

This document outlines the accessibility standards and best practices implemented in the Volunteering Platform to ensure WCAG 2.1 AA compliance and inclusive design for all users.

---

## 1. Semantic HTML

### Use Proper HTML Elements

```tsx
// ✅ Good - Semantic
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/explore">Explore</a></li>
  </ul>
</nav>

// ❌ Bad - Non-semantic
<div className="nav">
  <div onClick={goHome}>Home</div>
</div>
```

### Heading Hierarchy
- One `<h1>` per page
- Headings should be sequential (h1 → h2 → h3)
- Don't skip heading levels

---

## 2. Keyboard Navigation

### Focus Management
All interactive elements are keyboard accessible:

```tsx
// Focus visible styling
.focus-visible:outline-none .focus-visible:ring-2 .focus-visible:ring-primary-500
```

### Focus Trapping in Modals
```tsx
// Modal traps focus within dialog
<Modal>
  <FocusTrap>
    <ModalContent />
  </FocusTrap>
</Modal>
```

### Skip Links
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Tab Order
- Use `tabindex="0"` for custom interactive elements
- Avoid `tabindex` > 0
- Use `tabindex="-1"` for programmatic focus

---

## 3. ARIA Attributes

### Roles
```tsx
<button role="tab" aria-selected={isActive}>Tab 1</button>
<div role="tabpanel" aria-labelledby="tab-1">Content</div>
```

### States and Properties
```tsx
// Loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Expanded state
<button aria-expanded={isOpen} aria-controls="dropdown-menu">
  Menu
</button>

// Required fields
<input aria-required="true" aria-invalid={hasError} />
```

### Live Regions
```tsx
// Toast notifications
<div role="alert" aria-live="polite">
  Your application was submitted successfully!
</div>

// Error messages
<div role="alert" aria-live="assertive">
  Please correct the errors below.
</div>
```

---

## 4. Forms

### Labels
Every input must have a label:

```tsx
// Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Hidden label (for icon-only inputs)
<label htmlFor="search" className="sr-only">Search</label>
<input id="search" type="search" placeholder="Search..." />
```

### Error Messages
```tsx
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && (
  <p id="email-error" role="alert" className="text-error-500">
    {error}
  </p>
)}
```

### Fieldsets and Legends
```tsx
<fieldset>
  <legend>Payment Method</legend>
  <input type="radio" id="card" name="payment" />
  <label htmlFor="card">Credit Card</label>
  <input type="radio" id="paypal" name="payment" />
  <label htmlFor="paypal">PayPal</label>
</fieldset>
```

---

## 5. Color and Contrast

### Contrast Ratios
| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components | 3:1 |

### Don't Rely on Color Alone
```tsx
// ✅ Good - Color + Icon
<span className="text-success-500">
  <CheckIcon /> Verified
</span>

// ❌ Bad - Color only
<span className="text-success-500">Verified</span>
```

### Focus Indicators
```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

---

## 6. Images and Media

### Alt Text
```tsx
// Informative images
<img src="..." alt="Volunteers working in an organic garden at sunset" />

// Decorative images
<img src="..." alt="" role="presentation" />

// Complex images
<figure>
  <img src="..." alt="Chart showing growth in volunteer sign-ups" />
  <figcaption>
    Volunteer sign-ups increased by 150% from 2022 to 2023
  </figcaption>
</figure>
```

### Videos
- Provide captions
- Provide audio descriptions (optional)
- Provide transcripts

```tsx
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" label="English" />
</video>
```

---

## 7. Responsive and Mobile

### Touch Targets
Minimum touch target size: 44x44 pixels

```css
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

### Zoom Support
- Don't disable zoom: `user-scalable=no`
- Content works at 200% zoom

### Orientation
Support both portrait and landscape orientations.

---

## 8. Component Patterns

### Button
```tsx
<Button
  onClick={handleClick}
  disabled={isDisabled}
  aria-label="Add to favorites" // If icon-only
>
  <HeartIcon />
</Button>
```

### Modal/Dialog
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Booking</h2>
  <p id="modal-description">Are you sure you want to apply?</p>
</div>
```

### Tabs
```tsx
<div role="tablist" aria-label="Dashboard sections">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Applications
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Content...
</div>
```

### Dropdown
```tsx
<button
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="dropdown-list"
>
  Select option
</button>
<ul id="dropdown-list" role="listbox" aria-label="Options">
  <li role="option" aria-selected={selected === 1}>Option 1</li>
  <li role="option" aria-selected={selected === 2}>Option 2</li>
</ul>
```

---

## 9. Testing

### Automated Testing
- axe-core / axe DevTools
- Lighthouse accessibility audit
- eslint-plugin-jsx-a11y

### Manual Testing
1. **Keyboard-only navigation** - Tab through entire page
2. **Screen reader testing** - NVDA, VoiceOver, JAWS
3. **Zoom testing** - Test at 200% zoom
4. **Color contrast checker** - WebAIM Contrast Checker

### Screen Reader Shortcuts
- **VoiceOver (Mac)**: Cmd + F5 to enable
- **NVDA (Windows)**: Free download
- **ChromeVox**: Chrome extension

---

## 10. Checklist

### Structure
- [ ] Semantic HTML used throughout
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Skip link to main content
- [ ] Landmarks defined (header, nav, main, footer)

### Keyboard
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] Focus indicators visible
- [ ] No keyboard traps (except modals)

### Forms
- [ ] All inputs have labels
- [ ] Error messages linked to inputs
- [ ] Required fields marked
- [ ] Form validation accessible

### Images & Media
- [ ] Alt text for all informative images
- [ ] Decorative images have empty alt
- [ ] Videos have captions

### Color & Contrast
- [ ] Text contrast ≥ 4.5:1
- [ ] Large text contrast ≥ 3:1
- [ ] Information not conveyed by color alone

### Components
- [ ] Modals trap focus
- [ ] Dropdowns keyboard accessible
- [ ] Loading states announced
- [ ] Errors announced to screen readers

---

## 11. Utility Classes

```css
/* Screen reader only (visually hidden) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Not screen reader only (visible on focus) */
.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
