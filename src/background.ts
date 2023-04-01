import { getSettings, IconAction } from './store';
import { setActionBehavior } from './utils/action';
import { colors, getLogger } from './utils/log';
import { calFigures, WindowData } from './window';


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

function openWindow(data: WindowData) {
  const figures = calFigures(data)

  try {
    chrome.windows.create({
      url: data.url,
      type: data.type as chrome.windows.createTypeEnum,
      focused: data.focused,
      left: figures.left,
      top: figures.top,
      width: figures.width,
      height: figures.height,
    })
  } catch (err) {
    // create a centered window that shows error message
    // console.warn('openWindow error', err)
    const context = data.context
    const [width, height] = [600, 160]

    chrome.windows.create({
      url: `data:text/html,${createErrorHtml(err, data.url)}`,
      type: 'popup',
      focused: true,
      left: (context.screenWidth - width) / 2,
      top: (context.screenHeight - height) / 2,
      width,
      height,
    })
  }
}

function createErrorHtml(err: any, url: string) {
  return `
<html>
  <head><title>Window Opener Error</title></head>
  <body>
    <h3>Error while opening window for ${url}</h3>
    <code><pre style="white-space: pre-wrap">${err}</pre></code>
  </body>
</html>`
}
