# Project rules

- Keep this a dependency-free, single-page quiz. HTML, CSS, questions, and JavaScript live in `index.html`; it must work when opened directly via `file://`.
- Follow the existing vanilla JavaScript and CSS patterns. Avoid frameworks, build tools, and external assets unless requested.
- Preserve the mission-control design and both light and dark themes. Reuse the CSS custom properties for colors.
- Keep the layout usable on narrow screens and at browser zoom.
- Use native buttons, visible keyboard focus, accessible progress information, and live feedback. Manage focus when changing questions or showing results.
- Respect `prefers-reduced-motion` for all animations and transitions, including decorative pseudo-elements. Decorations must not block interactions.
- Preserve one answer per question, correct score updates, correct/incorrect feedback, question progression, results, and replay behavior.
- After behavior changes, smoke-test in the browser: actual Tab navigation and Enter/Space activation, correct and incorrect answers, duplicate-answer prevention, final score, and replay reset. Distinguish real keyboard testing from scripted focus or clicks.
- After visual changes, check light/dark themes, narrow layouts, and reduced motion.
- Keep changes focused; do not add unrelated features or dependencies.

There is currently no build step or automated test suite. Open `index.html` in the integrated browser to run the app.
