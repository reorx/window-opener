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
      'Added screen and window left/top properties in Context to support multi-monitor setups',
      'Improved context calculation for better window positioning',
      'Enhanced support for dynamic window positioning across multiple displays'
    ],
    note: '📝 **Recommended:** Due to significant changes in context calculation, it\'s recommended to delete your existing windows and recreate them from the examples in the options page for optimal positioning.'
  },
  {
    version: '1.2.0',
    date: '2024-11-20',
    changes: [
      'Refactored context logic - removed dynamic/static distinction',
      'All context variables are now live calculated',
      'Improved chrome.system.display integration for screen information',
      'Better handling of screen dimensions and offsets'
    ]
  },
  {
    version: '1.1.0',
    date: '2024-10-15',
    changes: [
      'Added support for mathematical expressions in window positioning',
      'Introduced context variables for dynamic window placement',
      'Enhanced backup and restore functionality',
      'Improved UI with better styling and layout'
    ]
  },
  {
    version: '1.0.0',
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
