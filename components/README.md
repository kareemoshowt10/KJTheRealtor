# React / shadcn components (optional path)

## Important: this production site is static HTML

`kareemjamaltherealtor.com` is a **multi-page static HTML/CSS/JS** site (Vercel clean URLs).  
It does **not** currently run React, Tailwind, TypeScript, or shadcn.

| Stack requirement | Status on this repo |
|-------------------|---------------------|
| React + TypeScript | ❌ Not configured |
| Tailwind CSS | ❌ Not configured |
| shadcn/ui (`components.json`) | ❌ Not configured |
| Default `components/ui` | ⚠️ Folder created for future use |

### What shipped on production instead

The **21st.dev testimonials columns** pattern is implemented on the homepage as a **vanilla port**:

- Section: `#testimonials` in `index.html`
- CSS marquee (`translateY` loop) instead of `motion/react`
- Brand-aligned kitchen-table / senior-family copy
- Unsplash face crops for avatars

Open: https://kareemjamaltherealtor.com/#testimonials

---

## Why `components/ui` matters (for a React app)

shadcn CLI installs primitives into **`components/ui`** by default. Keeping that path:

1. Matches docs and codegen (`npx shadcn@latest add …`)
2. Keeps design-system components separate from app pages
3. Makes `@/components/ui/...` imports predictable

Files staged here for a future React app:

- `ui/testimonials-columns-1.tsx` — column marquee primitive  
- `ui/testimonials-demo.tsx` — full section + sample data  

---

## How to set up a React + shadcn app (if you migrate)

Do this in a **new** Next.js (or Vite) app — do not overwrite the static HTML deploy until the migration is intentional.

### Next.js (recommended for shadcn)

```bash
npx create-next-app@latest kjr-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd kjr-app
npx shadcn@latest init
# choose: style, base color, CSS variables = yes
# default components path: components/ui  ✓ keep this
npm install motion
```

Copy:

```bash
cp ../KJTheRealtor/components/ui/testimonials-columns-1.tsx ./components/ui/
cp ../KJTheRealtor/components/ui/testimonials-demo.tsx ./components/ui/
```

Import on a page:

```tsx
import { Testimonials } from "@/components/ui/testimonials-demo";

export default function Page() {
  return <Testimonials />;
}
```

### Vite + React + TS (alternative)

```bash
npm create vite@latest kjr-app -- --template react-ts
cd kjr-app
npm install
npm install -D tailwindcss @tailwindcss/vite
# configure Tailwind v4 per https://tailwindcss.com/docs/installation/using-vite
npm install motion
# optional: npx shadcn@latest init (if using shadcn with Vite)
```

---

## Dependencies for the React component

```bash
npm install motion
# peer: react, react-dom (from Next/Vite)
```

No Lucide icons required for this component.

---

## Compliance note

Replace sample testimonial names/quotes with **verified Google / client reviews** before heavy ad spend. The live static section is written in a representative voice matching the senior/family brand; swap in real reviews as you collect them.
