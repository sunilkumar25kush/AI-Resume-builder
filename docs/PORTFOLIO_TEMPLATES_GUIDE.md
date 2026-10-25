# Portfolio Templates Design & Contribution Guide

## Guidelines for Building Portfolio Templates

All templates adhere to strict rendering and styling principles to guarantee 100% responsiveness and data isolation.

### 1. Template Structure Contract
Every template must implement the `PortfolioTemplateProps` contract:
```typescript
export interface PortfolioTemplateProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  previewMode?: "desktop" | "tablet" | "mobile";
}
```

### 2. Immutability
- Templates must **never mutate** the input `portfolio` object or its child arrays.
- Filter and sort operations must create shallow copies (e.g. `[...skills]`).

### 3. Graceful Empty States
- If experience, education, or projects are empty, templates must render cleanly without layout collapse or throwing undefined property errors.
- Always provide fallback defaults or check array lengths before mapping.

### 4. Responsiveness
- Test at `375px` (mobile), `768px` (tablet), `1024px` (laptop), and `1440px` (large desktop).
- Use clamp-based typography (e.g. `text-[clamp(32px,5vw,72px)]`) for fluid scaling without media query jumps.
- Ensure all fixed elements leave touch-safe tap targets of at least `44x44px`.
