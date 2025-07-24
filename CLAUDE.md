# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Window Opener is a Chrome extension that allows users to open browser windows with customized size and position in one click. The extension uses React with Emotion for styling and Zustand for state management.

## Development Commands

### Build & Development
- use `pnpm` to manage the project
- `pnpm dev` - Start development mode with webpack watch
- `pnpm run build` - Build for production
- `pnpm run dist` - Build and package extension for Chrome Web Store (creates zip file)
- `pnpm run clean` - Remove build directory

### Testing & Formatting
- `pnpm test` - Run Jest tests
- `pnpm run format-style` - Format TypeScript/TSX files with Prettier

## Architecture

### Core Components

**Background Script** (`src/background.ts`):
- Handles extension lifecycle and icon click behavior
- Manages keyboard shortcuts and default window opening
- Sets up action behavior based on user settings

**Popup Interface** (`src/popup.tsx`):
- Main popup UI showing saved windows list
- Provides quick access to settings and "create from current window" functionality
- Uses WindowItem component for individual window entries

**Options Page** (`src/options.tsx`):
- Settings management interface
- Contains WindowsManager and BackupManager components
- Handles icon action preferences

**Window Management** (`src/window.ts`):
- Core window data structure and creation logic
- Expression evaluation for dynamic window positioning using `expr-eval`
- Context system for screen dimensions and current window properties
- Supports mathematical expressions like `(screenWidth - 700) / 2`

**State Management** (`src/store.ts`):
- Uses `use-chrome-storage` for persistent settings
- Zustand store for app state (current chrome window)
- Manages WindowData array and IconAction preferences

### Key Features

**Dynamic Window Positioning**:
- Uses mathematical expressions for window dimensions
- Context variables for window positioning
- Static context (xOffset, yOffset) for system UI offsets

**Settings Management**:
- Export/import functionality via JSON files
- Backup and restore complete extension configuration
- Chrome storage sync for cross-device settings

## File Structure

```
src/
├── background.ts          # Extension background script
├── popup.tsx             # Popup interface
├── options.tsx           # Options page
├── window.ts             # Window management logic
├── store.ts              # State management
├── WindowsManager.tsx    # Window configuration UI
├── BackupManager.tsx     # Settings backup/restore
├── styles.ts             # Shared styles
└── utils/
    ├── action.ts         # Chrome action utilities
    └── log.ts            # Logging utilities
```

## Build Configuration

- **Webpack**: Custom configuration for Chrome extension with TypeScript, React, and Sass support
- **TypeScript**: Strict mode with React JSX transform using Emotion
- **Bundling**: Separates vendor chunks from background script for optimal loading
- **Extension Reloader**: Auto-reloads extension during development

## Extension Structure

- **Manifest v3** Chrome extension
- **Popup**: Quick access to saved windows
- **Options**: Full settings management
- **Background**: Persistent service worker for shortcuts and actions
- **Storage**: Chrome sync storage for cross-device settings

## Styling Guidelines

When working with styles in this project, follow these practices:

- **Use Emotion's CSS-in-JS**: The project uses `@emotion/react` for styling
- **Avoid redundant styles**: If the same style needs to be applied to multiple elements, use CSS selectors instead of repeating the style
- **Use nested selectors**: When multiple elements share styles, define them once in a parent CSS block using nested selectors
- **Example**: Instead of `css={css\`font-weight: bold;\`}` on each label, use:
  ```tsx
  const containerStyle = css\`
    label {
      font-weight: bold;
    }
    label.normal {
      font-weight: normal;
    }
  \`
  ```
- **Prefer semantic class names**: Use descriptive class names like `normal`, `primary`, `secondary` rather than style-specific names

## Context Variables for Window Positioning

Context is a set of variables that can be used to calculate the actual window size and position figures (left, top, width, height). Those figures can be defined as mathematical expressions, such as `(screenWidth - 700) / 2` or `screenWidth - windowWidth - xOffset`. The variables used in the expressions must be from the context variables.

There are two types of context variables:

### Dynamic Variables
- `windowWidth`: the width of the current window, useful if you want to open the window in a relative position
- `windowHeight`: the height of the current window

### Static Variables  
Static variables are assigned based on the current screen when the window item is created.
- `screenWidth`: the width of the screen
- `screenHeight`: the height of the screen  
- `xOffset`: the unavailable space in the x-axis of screen, such as MacOS Dock put on the left/right side of the screen
- `yOffset`: the unavailable space in the y-axis of screen, such as MacOS menubar and Windows taskbar

## Figures Specification

- Figures can reference variables
- Figures can reference each other, but circular references are not allowed
