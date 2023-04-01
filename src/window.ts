import { Parser } from 'expr-eval';


export interface WindowData {
  id: string;
  url: string;
  type: string;
  focused: boolean;
  default: boolean;
  left: string;
  top: string;
  width: string;
  height: string;
  context: Context;
  [key: string]: any;
}

export const windowFigureKeys = ['left', 'top', 'width', 'height']

export function openWindow(data: WindowData) {
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


/* context */

export interface Context {
  windowWidth: number;
  windowHeight: number;
  screenWidth: number;
  screenHeight: number;
  xOffset: number;
  yOffset: number;
  [key: string]: number;
}

export const contextKeys = ['windowWidth', 'windowHeight', 'screenWidth', 'screenHeight', 'xOffset', 'yOffset']

export function getContext(): Context {
  const [windowWidth, windowHeight] = [window.outerWidth, window.outerHeight];
  const [screenWidth, screenHeight] = [window.screen.width, window.screen.height];
  const [xOffset, yOffset] = [screenWidth - window.screen.availWidth, screenHeight - window.screen.availHeight];
  return {
    windowWidth,
    windowHeight,
    screenWidth,
    screenHeight,
    xOffset,
    yOffset,
  }
}


/* figures calculation */

interface Figures {
  left: number;
  top: number;
  width: number;
  height: number;
  [key: string]: number;
}

const exprParser = new Parser

export function calFigure(data: WindowData, key: string): number {
  try {
    return exprParser.parse(data[key]).evaluate(data.context)
  } catch (err) {
    return NaN
  }
}

export function calFigures(data: WindowData): Figures {
  const figures: {[key: string]: number} = {}
  for (const key of windowFigureKeys) {
    figures[key] = calFigure(data, key)
  }
  return figures as Figures
}
