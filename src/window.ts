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
}

export const windowFigureKeys = ['left', 'top', 'width', 'height']

export const variableMeaningMap = {
  windowWidth: 'the width of the current window, useful if you want to open the window in a relative position',
  windowHeight: 'the height of the current window',
  windowLeft: `the left distance of the current window relative to the screen it's in`,
  windowTop: `the top distance of the current window relative to the screen it's in`,

  screenWidth: 'the width of the screen',
  screenHeight: 'the height of the screen',
  xOffset: 'the unavailable space in the x-axis of screen, such as MacOS Dock put on the left/right side of the screen',
  yOffset: 'the unavailable space in the y-axis of screen, such as MacOS menubar and Windows taskbar'
};


export async function openWindow(data: WindowData) {
  let chromeWindow: chrome.windows.Window | null = null;
  let figures: any = null;
  let createArgs: any = null;

  chromeWindow = await chrome.windows.getCurrent()
  console.log('get current chromeWindow', chromeWindow)
  if (!chromeWindow) {
    throw new Error('failed to get current window in openWindow')
  }
  const context = await getContext()

  try {
    figures = calFigures(data, context)

    createArgs = {
      url: data.url || undefined,
      type: data.type as chrome.windows.createTypeEnum,
      focused: data.focused,
      width: figures.width,
      height: figures.height,
      left: figures.left + context._screenLeftAbs || 0,
      top: figures.top + context._screenTopAbs || 0,
    }

    await chrome.windows.create(createArgs)
  } catch (err) {
    await showErrorInNewWindow(data, context, chromeWindow, figures, createArgs, err as Error);
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
  }
  return win
}



/* context */

export interface Context {
  screenWidth: number;
  screenHeight: number;
  _screenLeftAbs: number;
  _screenTopAbs: number;
  xOffset: number;
  yOffset: number;
  windowWidth: number;
  windowHeight: number;
  windowLeft: number;
  windowTop: number;
  _windowLeftAbs: number;
  _windowTopAbs: number;
  [key: string]: number;
}

export const contextKeys = ['screenWidth', 'screenHeight', 'xOffset', 'yOffset', 'windowWidth', 'windowHeight', 'windowLeft', 'windowTop']

export async function getContext(): Promise<Context> {
  const window = await chrome.windows.getCurrent();
  console.log(`* window: left=${window.left} top=${window.top} width=${window.width} height=${window.height}`)
  const display = await getWindowDisplay(window);
  if (!display) {
    throw Error('could not get display by getWindowDisplay')
  }
  const bounds = display.bounds
  console.log(`* currentDisplay: bounds.left=${bounds.left} bounds.top=${bounds.top} bounds.width=${bounds.width} bounds.height=${bounds.height}`)

  const [screenWidth, screenHeight, _screenLeftAbs, _screenTopAbs] = [bounds.width, bounds.height, bounds.left, bounds.top];
  const [xOffset, yOffset] = [screenWidth - display.workArea.width, screenHeight - display.workArea.height];
  const [windowWidth, windowHeight, _windowLeftAbs, _windowTopAbs] = [window.width?? 0, window.height?? 0, window.left?? 0, window.top?? 0];
  const [windowLeft, windowTop] = [_windowLeftAbs - _screenLeftAbs, _windowTopAbs - _screenTopAbs];
  return {
    screenWidth,
    screenHeight,
    _screenLeftAbs,
    _screenTopAbs,
    _windowLeftAbs,
    _windowTopAbs,
    xOffset,
    yOffset,
    windowWidth,
    windowHeight,
    windowLeft,
    windowTop
  }
}

async function getWindowDisplay(window: chrome.windows.Window) {
  const displays = await chrome.system.display.getInfo();

  // Calculate window center point
  const windowCenterX = (window.left || 0) + ((window.width || 0) / 2);
  const windowCenterY = (window.top || 0) + ((window.height || 0) / 2);

  // Find display containing the window's center
  const currentDisplay = displays.find(display => {
    const bounds = display.bounds;
    return windowCenterX >= bounds.left &&
      windowCenterX < (bounds.left + bounds.width) &&
      windowCenterY >= bounds.top &&
      windowCenterY < (bounds.top + bounds.height);
  });

  return currentDisplay || displays.find(d => d.isPrimary); // Fallback to primary
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

export function calFigure(data: WindowData, key: string, context: Context): number|undefined {
  const expr = (data as any)[key]
  if (!expr) return undefined
  try {
    return Math.round(exprParser.parse(expr).evaluate(context))
  } catch (err) {
    return NaN
  }
}

// Class to represent a calculation error with circular dependencies
export class CircularDependencyError extends Error {
  constructor(public cycle: string[]) {
    super(`Circular dependency detected: ${cycle.join(' -> ')} -> ${cycle[0]}`);
    this.name = 'CircularDependencyError';
  }
}

// Analyze dependencies between figure expressions
function analyzeDependencies(data: WindowData): Map<string, string[]> {
  const dependencies = new Map<string, string[]>();

  for (const key of windowFigureKeys) {
    const expr = (data as any)[key];
    if (!expr) {
      dependencies.set(key, []);
      continue;
    }

    const deps: string[] = [];
    // Simple regex-based dependency detection for figure variables
    for (const figureKey of windowFigureKeys) {
      if (figureKey !== key && expr.includes(figureKey)) {
        // Check if it's actually a variable reference (not part of another word)
        const regex = new RegExp(`\\b${figureKey}\\b`);
        if (regex.test(expr)) {
          deps.push(figureKey);
        }
      }
    }
    dependencies.set(key, deps);
  }

  return dependencies;
}

// Topological sort to determine calculation order
function topologicalSort(dependencies: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: string[] = [];

  function visit(key: string, path: string[] = []): void {
    if (temp.has(key)) {
      // Circular dependency detected
      const cycleStart = path.indexOf(key);
      const cycle = path.slice(cycleStart);
      throw new CircularDependencyError(cycle);
    }

    if (visited.has(key)) {
      return;
    }

    temp.add(key);
    const deps = dependencies.get(key) || [];

    for (const dep of deps) {
      visit(dep, [...path, key]);
    }

    temp.delete(key);
    visited.add(key);
    result.push(key);
  }

  for (const key of windowFigureKeys) {
    if (!visited.has(key)) {
      visit(key);
    }
  }

  return result;
}

export function calFigures(data: WindowData, context: Context): Figures {
  // Analyze dependencies and determine calculation order
  const dependencies = analyzeDependencies(data);
  const calculationOrder = topologicalSort(dependencies);

  const figures: {[key: string]: number|undefined} = {};
  const enhancedContext = { ...context };

  // Calculate figures in dependency order
  for (const key of calculationOrder) {
    const v = calFigure(data, key, enhancedContext);
    if (v !== undefined) {
      figures[key] = v;
      // Add calculated value to context for subsequent calculations
      (enhancedContext as any)[key] = v;
    }
  }

  return figures as Figures;
}

function numToString(num: number) {
  return num.toString()
}
