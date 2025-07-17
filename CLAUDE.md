# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Window Opener is a Chrome extension that allows users to open browser windows with customized size and position in one click. The extension uses React with Emotion for styling and Zustand for state management.

## Development Commands

### Build & Development
- `npm start` - Start development mode with webpack watch
- `npm run build` - Build for production
- `npm run dist` - Build and package extension for Chrome Web Store (creates zip file)
- `npm run clean` - Remove build directory

### Testing & Formatting
- `npm test` - Run Jest tests
- `npm run format-style` - Format TypeScript/TSX files with Prettier

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
- Context variables include screenWidth, screenHeight, windowWidth, windowHeight
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