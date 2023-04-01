import { getSettings, IconAction } from './store';
import { setActionBehavior } from './utils/action';
import { colors, getLogger } from './utils/log';
import { openWindow } from './window';


const lg = getLogger('background', colors.green)

lg.log('background.ts')

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
      const defaultWindow = settings.windows.find(w => w.default)
      if (defaultWindow) {
        openWindow(defaultWindow)
      }
      break
  }
})
