# Mohammed Nady — HR Operations Hub

Responsive bilingual HR operations website featuring practical decision-support tools for Egypt's private and government sectors.

**Live website:** <https://mohammed-nady-ch.github.io/mohammed-nady-hr-hub/>

## Highlights

- Responsive Home, About, and HR Tools pages
- Accessible desktop and mobile navigation
- English and Arabic support with RTL
- Private-sector Gross-to-Net and Net-to-Gross payroll calculator
- Government civil-service Gross-to-Net salary calculator with a separate calculation engine and rules
- Salary increase budget simulator with local Excel import/export and up to three scenarios
- Separated payroll rules and calculation engine
- Automated testing and GitHub Pages deployment

## Technology

React · TypeScript · Vite · GitHub Actions · GitHub Pages

## Local development

```bash
npm install
npm run dev
npm test
npm run build
```

## Stable release

The reference production baseline is tagged `stable-2026-09-25`. Current tools cover Egypt's 2026 private-sector payroll scope, government civil-service salary estimates, and salary-increase budget planning.

Pushes to `main` are tested, built, and deployed automatically through GitHub Actions.
