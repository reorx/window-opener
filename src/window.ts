import { Parser } from 'expr-eval';


export interface WindowData {
  id: string;
  name: string;
  url: string;
  type: string;
  focused: boolean;
  default: boolean;
  left: string;
  top: string;
  width: string;
  height: string;
  staticContext: StaticContext;
}

export const windowFigureKeys = ['left', 'top', 'width', 'height']

export function openWindow(data: WindowData) {
  const figures = calFigures(data)
  const createArgs = {
    url: data.url,
    type: data.type as chrome.windows.createTypeEnum,
    focused: data.focused,
    ...figures
  }

  try {
    chrome.windows.create(createArgs)
  } catch (err) {
    // create a centered window that shows error message
    // console.warn('openWindow error', err)
    const context = getContext(data.staticContext)
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

export async function createWindowFromCurrent() {
  const win = createWindow()

  // get window position and size
  const chromeWindow = await chrome.windows.getCurrent()
  win.left = numToString(chromeWindow.left?? 0)
  win.top = numToString(chromeWindow.top?? 0)
  win.width = numToString(chromeWindow.width?? 0)
  win.height = numToString(chromeWindow.height?? 0)

  // get url
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs.length > 0) {
    const tab = tabs[0]
    win.url = tab.url?? ''
  }

  return win
}

export function createWindow() {
  const win: WindowData = {
    id: new Date().getTime().toString(),
    name: '',
    url: '',
    type: 'normal',
    focused: true,
    default: false,
    left: '',
    top: '',
    width: '',
    height: '',
    staticContext: getStaticContext(),
  }
  return win
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


/* context */

export interface StaticContext {
  screenWidth: number;
  screenHeight: number;
  xOffset: number;
  yOffset: number;
}

export interface Context extends StaticContext{
  windowWidth: number;
  windowHeight: number;
  [key: string]: number;
}


export const staticContextKeys = ['screenWidth', 'screenHeight', 'xOffset', 'yOffset']
export const contextKeys = ['windowWidth', 'windowHeight', ...staticContextKeys]

export function getStaticContext(): StaticContext {
  const [screenWidth, screenHeight] = [window.screen.width, window.screen.height];
  const [xOffset, yOffset] = [screenWidth - window.screen.availWidth, screenHeight - window.screen.availHeight];
  return {
    screenWidth,
    screenHeight,
    xOffset,
    yOffset,
  }
}

export function getContext(staticContext: StaticContext): Context {
  const [windowWidth, windowHeight] = [window.outerWidth, window.outerHeight];
  return {
    windowWidth,
    windowHeight,
    ...staticContext
  }
}


/* figures calculation */

interface Figures {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  [key: string]: number|undefined;
}

const exprParser = new Parser

export function calFigure(data: WindowData, key: string): number|undefined {
  const expr = (data as any)[key]
  if (!expr) return undefined
  try {
    return exprParser.parse(expr).evaluate(getContext(data.staticContext))
  } catch (err) {
    return NaN
  }
}

export function calFigures(data: WindowData): Figures {
  const figures: {[key: string]: number|undefined} = {}
  for (const key of windowFigureKeys) {
    const v = calFigure(data, key)
    if (v !== undefined)
      figures[key] = v
  }
  return figures as Figures
}

function numToString(num: number) {
  return num.toString()
}
