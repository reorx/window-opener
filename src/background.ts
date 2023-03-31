import {
  colors,
  getLogger,
} from './utils/log';

const lg = getLogger('background', colors.green)

lg.log('background.ts')

chrome.action.onClicked.addListener(async () => {
  const window = await chrome.windows.getCurrent()
  const context = {
    windowWidth: window.width ?? 0,
    windowHeight: window.height ?? 0,
    screenWidth: 2560,
    screenHeight: 1440,
    xOffset: 58,
  }

  const windowArgs = {
    left: context.windowWidth + context.xOffset,
    top: 0,
    width: context.screenWidth - context.windowWidth - context.xOffset,
    height: context.screenHeight,
  }

  chrome.windows.create({
    url: 'https://twitter.com',
    focused: true,
    ...windowArgs,
  })
})
