# Mohammed Nady — HR Operations Hub

Responsive bilingual HR operations website and payroll calculator for Egypt's private sector.

## Stable baseline

- Baseline date: 2026-09-25
- Restore tag: `stable-2026-09-25`
- Production: https://mohammed-nady-ch.github.io/mohammed-nady-hr-hub/
- Stack: React, TypeScript, Vite, GitHub Actions, and GitHub Pages
- Languages: English and Arabic with page-level RTL support
- Payroll scope: Egypt, private sector, 2026
- Rules location: `src/features/payroll/rules/egypt/2026.ts`
- Calculation engine: `src/features/payroll/engine.ts`

To inspect this baseline without changing the current branch, run `git switch --detach stable-2026-09-25`. To resume work from it, create a new branch from the tag. Do not move the tag after publication.

## Run locally
```bash
npm install
npm run dev
```

## Verify

```bash
npm run test:payroll
npm run build
```

## Build
```bash
npm run build
```

## Current scope

- Responsive Home, About, and HR Tools pages
- Accessible desktop and mobile navigation
- English/Arabic language switch with RTL
- Gross-to-Net and Net-to-Gross payroll calculator
- Separated 2026 payroll rules and calculation engine
- Automated test, build, and GitHub Pages deployment workflow
