# Project Rules & Best Practices

> **Note:** These rules MUST be checked and followed when building, bugfixing, and refactoring code. All contributors and AI assistants should reference this file for every change.

## 1. Project Structure
- Use a modular, clean directory layout:
  ```
  /src
    /scenes      → Game scenes (Menu, MatchView, Career, etc.)
    /objects     → Reusable game objects/entities (Player, Ball, Club, etc.)
    /managers    → Game systems (InputManager, AudioManager, GameStateManager, etc.)
    /data        → Static/dynamic JSON, DB handlers, data loaders
    /ui          → UI components (buttons, overlays, scoreboards, etc.)
    /utils       → Helpers (math, time, sorters, formatters, etc.)
  config.js      → Central constants/settings
  main.js/ts     → App entry point and game setup
  ```

## 2. Scene Design
- Separate concerns using engine lifecycles:
  - Phaser: `init`, `preload`, `create`, `update`
  - Three.js: `setup`, `animate`, `resize`
- Keep scenes under 300 lines; extract logic to classes/modules.

## 3. Game Loop
- Keep update loops lightweight.
- Offload expensive logic to events, timed callbacks, or workers.
- Avoid unnecessary recalculations per frame; use dirty flags.

## 4. Input Handling
- Centralize input in `InputManager`.
- Support keyboard, gamepad, and touch consistently.
- Emit custom input events; don’t hardcode logic per scene.

## 5. Data Management (Large Files)
- Don’t load full datasets (e.g., 10k+ players) into memory at once.
- Use async chunked loading, paging, or indexed lookups.
- Store static data in compressed JSON/binary.
- Load only what’s needed per UI/simulation step.
- Offload heavy transforms/simulations to Web Workers.
- Use a DataManager for caching, async fetch, and virtualized lists.

## 6. Resource Loading
- Preload assets in a PreloadScene or LoaderManager.
- Use symbolic keys for asset references.
- Defer non-critical asset loading.
- Show progress/loading screens.

## 7. Debugging / Bugfixing
- Reproduce bugs in isolated steps.
- Trace inputs and states.
- Use `console.table`, `console.trace`, or engine helpers.
- Use dat.GUI/tweakpane for runtime inspection.
- Ask AI for root cause analysis and minimal, clean fixes.

## 8. Memory Management
- Manually dispose of unused objects (e.g., `geometry.dispose()`).
- In Phaser, call `.destroy()` and remove listeners on shutdown.
- Monitor memory in devtools; take heap snapshots if needed.

## 9. Performance
- Minimize draw calls; use batching/instancing.
- Use texture atlases in Phaser.
- Debounce non-essential updates.
- Profile regularly with devtools/WebGL inspectors.

## 10. Modularity & Decoupling
- Use classes and dependency injection.
- Don’t hardcode scene references or game states; use events/state managers.
- Keep UI logic separate from simulation logic.

## 11. UI Design
- Virtualize long lists (e.g., player tables).
- Use UI layers/containers for overlays and panels.
- Avoid redrawing whole UI every frame; update only changed parts.

## 12. Typing & Documentation
- Use TypeScript where possible; otherwise, use JSDoc.
- Document public APIs, key functions, and data formats.
- Use enums/constants for states/types.

## 13. Code Quality
- Use Prettier for formatting, ESLint for style/errors (Airbnb/StandardJS).
- Prefer pure functions and immutable data.
- Use destructuring, arrow functions, and ES6 imports.

## 14. Comments & Naming
- Comment on *why*, not just *what*.
- Use descriptive names; avoid abbreviations unless standardized.

## 15. Version Control
- Commit often with clear messages.
- Use feature branches; test before merging to `main`.
- Exclude large generated assets, `node_modules`, and build folders.

## 16. Scalability
- Use `GameState` or `AppContext` singleton for global data.
- Avoid global variables; pass data explicitly or via managers.
- Design for expansion: leagues, tournaments, online play.

## 17. Architectural Patterns
- Use proven patterns:
  - Factory for objects
  - Component for ECS-like entities
  - Singleton for shared managers
- Separate rendering, data, and control logic.
- Ask AI for maintainable patterns per feature.

## 18. AI Usage
- When asking AI:
  - Include file name, class/module, error/stack trace, and goal.
  - Ask for architectural guidance, not just quick fixes.
  - Use AI for refactoring, anti-pattern detection, and performance tips.

## 19. Async & Worker Strategy
- Use `async/await` for all external/file operations.
- Use Web Workers or `requestIdleCallback` for heavy simulation logic.
- Throttle/debounce frequent background updates.

## 20. Deployment & Optimization
- Minify code and compress assets.
- Lazy-load non-critical assets/scenes.
- Test on low-end devices/browsers.
- Use environment flags to disable dev tools in production. 

## AI Coding Rules (Additions)

1. For every user request or new feature, you must make a clear plan before writing or editing any code. Present the plan to the user if possible.
2. For every new feature, you must write a test (unit, integration, or end-to-end as appropriate) to verify that the feature works as intended.
3. You must ensure smooth error handling throughout the codebase. All errors should be caught and handled gracefully so that the app does not crash or present a poor user experience.
4. Always split large tasks and code edits into smaller, incremental steps and PRs. Avoid making large, monolithic changes. If a task or edit is likely to cause timeouts or excessive review burden, break it up automatically and proceed incrementally.