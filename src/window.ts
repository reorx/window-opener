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

/* context */

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
