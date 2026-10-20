# Verification record — 2026-10-21

- Source order checked against supplied PDF, with visual confirmation of numbering skips. 68 actual grammar entries, 80 assigned question slots.
- npm test: 7/7 passed. Includes all lesson mappings, wrap, question schema, shuffle/grade lock, review filtering, storage recovery and stale-review regression.
- npm run build: passed; quiz.html and dist/index.html are self-contained, ~347 KB.
- Local HTTP preview: status 200.
- Browser: wrong answer feedback, correct review removes mistake, reload retains answer and option order, Enter result screen, lesson switch and empty review state, lesson 10 wraps in grammar modal, numeric shortcut after closing modal.
- Responsive: 390px viewport; document clientWidth 375, scrollWidth 375 after fixing lesson buttons.
- Independent review found two important issues: stale wrong-session membership and ambiguous 未定な distractor. Both fixed with failing-then-passing regression checks.
- Final screenshot: docs/preview.png.
- Browser security blocks file:// navigation, so direct-file runtime was not exercised through automation. The same bundled HTML was tested via localhost; no external scripts, styles, fonts or API calls are used.
- Static bank of 80 authored questions, not complete vocabulary coverage and not automatic generation.
