export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
  note?: string
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2025-07-18',
    changes: [
      'Added screen and window absolute position properties (_windowLeftAbs, _windowTopAbs, _screenLeftAbs, _screenTopAbs) to Context for multi-monitor support',
      'Refactored context logic - all context variables are now live calculated, no more dynamic/static distinction',
      'Enhanced popup UI with keyboard navigation and auto-focus improvements',
      'Added duplicate button to easily copy window configurations',
      'Improved options page UI and fixed default window logic',
      'Made URL optional for windows - opens blank page if URL is empty',
      'Added smart figure calculation that handles dependencies and detects circular references',
      'Enhanced variable explanations and moved tips to dedicated box'
    ],
    note: '📝 **Recommended:** Due to significant changes in context calculation, it\'s recommended to delete your existing windows and recreate them from the examples in the options page for optimal positioning.'
  },
  {
    version: '1.2.0',
    date: '2024-11-20',
    changes: [
      'Added backup and restore functionality for extension settings',
      'Enhanced BackupManager component styling',
      'Added keyboard shortcut support (Alt+T on Windows/Linux, Command+Ctrl+T on Mac)',
      'Improved window management using chrome.windows API with Zustand state management',
      'Fixed popup UI collapse issue when no windows are configured',
      'Enhanced default star margin display when window name is not present',
      'Added link to Chrome Web Store for easier access'
    ]
  },
  {
    version: '1.1.0',
    date: '2024-09-01',
    changes: [
      'Initial release of Window Opener extension',
      'Basic window creation with custom size and position',
      'Popup interface for quick access to saved windows',
      'Options page for configuration management',
      'Chrome storage sync for cross-device settings'
    ]
  }
]

export function getCurrentVersion(): string {
  return chrome.runtime.getManifest().version
}

export function getLatestChangelogEntry(): ChangelogEntry | undefined {
  return changelog[0]
}
