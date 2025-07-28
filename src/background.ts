import { getSettings, IconAction } from './store';
import { openOptionsPage, setActionBehavior } from './utils/action';
import { colors, getLogger } from './utils/log';
import { openWindow } from './window';


const lg = getLogger('background', colors.green)

lg.log('background.ts')

// Version check and changelog display
chrome.runtime.onInstalled.addListener(async (details) => {
  const currentVersion = chrome.runtime.getManifest().version;
  
  if (details.reason === 'install') {
    lg.log('Extension installed, version:', currentVersion);
  } else if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    lg.log('Extension updated from', previousVersion, 'to', currentVersion);
    
    // Show changelog if version has changed
    if (previousVersion !== currentVersion) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('changelog.html')
      });
    }
  }

  // Create context menu
  chrome.contextMenus.create({
    id: 'changelog',
    title: 'What\'s New',
    contexts: ['action']
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'changelog') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('changelog.html')
    });
  }
});

getSettings().then((settings) => {
  setActionBehavior(settings.iconAction)
})

chrome.action.onClicked.addListener(async () => {
  const settings = await getSettings()

  switch (settings.iconAction) {
    case IconAction.windowList:
      // 2023-04-01: chrome.action.openPopup is not availabe to stable channel as to this issue
      // https://github.com/GoogleChrome/developer.chrome.com/issues/2602
      // so we use chrome.action.setPopup as a workaround, this case will never be triggered
      // chrome.action.openPopup()
      break
    case IconAction.defaultWindow:
      let defaultWindow = settings.windows.find(w => w.default) || settings.windows[0]
      if (defaultWindow) {
        openWindow(defaultWindow)
      } else {
        openOptionsPage()
      }
      break
  }
})
