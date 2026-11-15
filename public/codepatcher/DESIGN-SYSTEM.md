# CodePatcher Design System

This document defines the unified 5-layer Design System and the strict ownership boundary separating visual styling from operational JavaScript.

## 5-Layer CSS Architecture

| File | Owns | Must not own |
|---|---|---|
| `css/tokens.css` | **Central File #1 (Geometry & Presets)**: Core Obsidian Sapphire palette, `IBM Plex Sans Arabic` + `JetBrains Mono` typography, architectural radius scale, density presets (`[data-density="compact"|"spacious"]`), corner radius presets (`[data-radius="sharp"|"soft"]`), accent presets (`[data-accent="gold"|"indigo"|"cyan"|"emerald"|"amber"|"rose"]`), button/input dimensions, touch targets, explorer geometry (`--dw`, `--explorer-row-height`, `--explorer-tool-columns`, `--explorer-inset`) and workspace geometry (`--panel-inset`, `--panel-gap`, `--panel-card-pad`, `--panel-editor-min`, `--panel-content-max`, `--panel-toolbar-height`, `--editor-gutter-width`, `--editor-pad-inline`, `--editor-pad-block`, `--editor-tab-gap`), motion & z-index tokens | Theme surface palettes, component selectors, or screen layouts |
| `css/themes.css` | **Central File #2 (Themes & Colors)**: Surface, Sheen highlight, border, shadow, syntax highlight, diff, and file-icon tokens across 6 curated themes (`dark`, `royal`, `light`, `ocean`, `paper`, `contrast`) via `[data-theme]` + legacy variable bridge | Structural layout rules or JS logic |
| `css/components.css` | Hairline single-elevation buttons (`.btn`, `.hbtn`, `.pmini`, `.copy-ai`), inputs/textareas, modals/bottom sheets (`.modal`, `.sheet`), shared menu/list rows (`.mi`, `.mi-body`, `.scroll-box`, `.issue`), badges, collapsible `.help-box`, error cards, patch/log cards, context popups, and toasts | Screen-specific grid positioning or breakpoint overrides |
| `css/layouts.css` | App shell, header, IDE chrome tabbar, bottom/top nav, `#p-home` Bento workspace + Recent Files quick switcher, `#p-edit` + keyboard-navigable open-file groups, find bar, tokenized gutter/editor padding, native status controls, symbol/bottom bars, `#p-patch` split compose/inspector workspace, `#p-run` + console + FABs, `#p-log`, `#p-v1` timeline, and RTL-first explorer `.drawer` with semantic file/folder rows, keyboard-operable actions, and a right-edge mobile gesture | Duplicate token definitions or inline runtime logic |
| `css/responsive.css` | Interaction states (`body.sym`, `body.runfs`, `body.side-open`), small-phone (`<=370px`, right-side drawer), tablet (`>=680px`), full desktop IDE studio (`>=960px`, 2-column Bento `#p-home`, split `#p-patch`, simultaneous version timeline/comparison), and `prefers-reduced-motion` | Operational business behavior |

## Required Stylesheet Order (`index.html`)

Keep this exact load order:

1. `css/tokens.css`
2. `css/themes.css`
3. `css/components.css`
4. `css/layouts.css`
5. `css/responsive.css`

All 5 CSS files are registered in `sw.js` (`codepatcher-v19`).

## Central Theme & Customization Mechanism

- **1–2 File Control**: Editing colors or adding a new theme only requires updating `css/themes.css`. Editing spacing, button heights, touch targets, density, radius, accent colors, or explorer geometry only requires `css/tokens.css`.
- `18-settings.js` syncs `document.body.dataset.theme` (`dark` | `royal` | `light` | `ocean` | `paper` | `contrast`), `dataset.density` (`compact` | `normal` | `spacious`), `dataset.radius` (`sharp` | `round` | `soft`), and `dataset.accent` (`default` | `gold` | `indigo` | `cyan` | `emerald` | `amber` | `rose`), while keeping `body.light` synced for light/paper modes.
- `<meta name="theme-color">` reads `--surface-app` dynamically from computed styles.
- Every dialog — including Project Management (`openManage`), Save (`saveMenu`, `saveAsDialog`), Export (`exportDialog`, `exportBundleDialog`), Bundle Import (`importBundleText`), Settings, Palette, Snapshots, Self-Test, Ambiguity Picker, and Patch History — uses semantic classes and shared UI template helpers (`uiRow`, `uiScroll`, `uiNote`, `uiEmpty`, `uiSub`) defined in `js/06-ui-core.js`, with zero hardcoded visual `style="..."` leaks.

## JavaScript Boundaries

- Operational modules (`04`–`17`, `19`–`29`) retain full ownership of the patch engine, file CRUD, tabs, import/export, clipboard, versioning, storage, and self-tests.
- `js/06-ui-core.js` provides declarative UI template helpers without altering any operational state or engine behavior.
- The patch studio, version timeline/comparison, preview/console, and operation history use a shared mobile-first spacing and card system. Their geometry is token-driven; responsive.css only defines breakpoint behavior.\n- `17-drawer.js` owns RTL-aware drawer opening/closing gestures; `25-storage.js` renders semantic file/folder rows and keyboard-operable context actions without changing storage behavior.\n- `30-mobile-redesign.js` manages the Workspace Command Center (`#p-home`), live Recent Files quick switcher, and adaptive navigation shell.\n- `npm run check` runs `public/codepatcher/Tools/check.js` as an ES module and checks JavaScript syntax, script/style registration, and duplicate top-level declarations.
- CSS describes appearance and state; JavaScript remains the single authority for application state.
