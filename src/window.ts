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
  dynamicLeft?: boolean;
  dynamicTop?: boolean;
  dynamicWidth?: boolean;
  dynamicHeight?: boolean;
  staticContext: StaticContext;
}

export const windowFigureKeys = ['left', 'top', 'width', 'height']

export async function openWindow(data: WindowData) {
  let chromeWindow: chrome.windows.Window | null = null;
  let figures: any = null;
  let createArgs: any = null;
  
  try {
    chromeWindow = await chrome.windows.getCurrent()
    const context = getContext(data.staticContext, chromeWindow)
    figures = calFigures(data, context)
    
    createArgs = {
      url: data.url || undefined,
      type: data.type as chrome.windows.createTypeEnum,
      focused: data.focused,
      ...figures
    }
    
    await chrome.windows.create(createArgs)
  } catch (err) {
    // Create detailed error context for debugging
    const errorContext = {
      windowData: {
        id: data.id,
        name: data.name,
        url: data.url,
        type: data.type,
        focused: data.focused,
        default: data.default,
        expressions: {
          left: data.left,
          top: data.top,
          width: data.width,
          height: data.height
        },
        dynamicFlags: {
          dynamicLeft: data.dynamicLeft,
          dynamicTop: data.dynamicTop,
          dynamicWidth: data.dynamicWidth,
          dynamicHeight: data.dynamicHeight
        }
      },
      staticContext: data.staticContext,
      currentWindow: chromeWindow ? {
        left: chromeWindow.left,
        top: chromeWindow.top,
        width: chromeWindow.width,
        height: chromeWindow.height
      } : 'Failed to get current window',
      calculatedFigures: figures,
      createArgs: createArgs,
      error: {
        name: (err as Error).name || 'Unknown Error',
        message: (err as Error).message || String(err),
        stack: (err as Error).stack || 'No stack trace available'
      },
      timestamp: new Date().toISOString()
    }

    console.error('Window creation failed:', errorContext);

    // Create error display window
    const {staticContext} = data
    const [width, height] = [800, 600]

    try {
      await chrome.windows.create({
        url: `data:text/html,${encodeURIComponent(createEnhancedErrorHtml(errorContext))}`,
        type: 'popup',
        focused: true,
        left: Math.max(0, (staticContext.screenWidth - width) / 2),
        top: Math.max(0, (staticContext.screenHeight - height) / 2),
        width,
        height,
      })
    } catch (secondaryErr) {
      // If even the error window fails, log to console
      console.error('Failed to create error window:', secondaryErr);
      console.error('Original error context:', errorContext);
    }
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

function createEnhancedErrorHtml(errorContext: any) {
  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Window Opener - Detailed Error Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #d32f2f;
      border-bottom: 2px solid #d32f2f;
      padding-bottom: 10px;
    }
    h2 {
      color: #1976d2;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #388e3c;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .error-summary {
      background-color: #ffebee;
      border-left: 4px solid #d32f2f;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .code-block {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      overflow-x: auto;
      margin: 10px 0;
    }
    .section {
      margin-bottom: 25px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 15px;
    }
    .timestamp {
      color: #666;
      font-style: italic;
      text-align: right;
      margin-top: 20px;
      border-top: 1px solid #e0e0e0;
      padding-top: 10px;
    }
    .highlight {
      background-color: #fff3e0;
      padding: 2px 4px;
      border-radius: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .value {
      font-family: monospace;
      background-color: #f8f8f8;
      padding: 2px 4px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Window Opener Error Report</h1>
    
    <div class="error-summary">
      <strong>${errorContext.error.name}:</strong> ${errorContext.error.message}
    </div>

    <div class="section">
      <h2>📋 Window Configuration</h2>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Name</td><td class="value">${errorContext.windowData.name || '(empty)'}</td></tr>
        <tr><td>URL</td><td class="value">${errorContext.windowData.url || '(empty - blank page)'}</td></tr>
        <tr><td>Type</td><td class="value">${errorContext.windowData.type}</td></tr>
        <tr><td>Focused</td><td class="value">${errorContext.windowData.focused}</td></tr>
        <tr><td>Default</td><td class="value">${errorContext.windowData.default}</td></tr>
      </table>

      <h3>📐 Position & Size Expressions</h3>
      <table>
        <tr><th>Property</th><th>Expression</th><th>Dynamic</th></tr>
        <tr>
          <td>Left</td>
          <td class="value">${errorContext.windowData.expressions.left || '(empty)'}</td>
          <td class="value">${errorContext.windowData.dynamicFlags.dynamicLeft || false}</td>
        </tr>
        <tr>
          <td>Top</td>
          <td class="value">${errorContext.windowData.expressions.top || '(empty)'}</td>
          <td class="value">${errorContext.windowData.dynamicFlags.dynamicTop || false}</td>
        </tr>
        <tr>
          <td>Width</td>
          <td class="value">${errorContext.windowData.expressions.width || '(empty)'}</td>
          <td class="value">${errorContext.windowData.dynamicFlags.dynamicWidth || false}</td>
        </tr>
        <tr>
          <td>Height</td>
          <td class="value">${errorContext.windowData.expressions.height || '(empty)'}</td>
          <td class="value">${errorContext.windowData.dynamicFlags.dynamicHeight || false}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h2>🖥️ Context Information</h2>
      
      <h3>Static Context (Screen Info)</h3>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Screen Width</td><td class="value">${errorContext.staticContext.screenWidth}px</td></tr>
        <tr><td>Screen Height</td><td class="value">${errorContext.staticContext.screenHeight}px</td></tr>
        <tr><td>X Offset</td><td class="value">${errorContext.staticContext.xOffset}px</td></tr>
        <tr><td>Y Offset</td><td class="value">${errorContext.staticContext.yOffset}px</td></tr>
      </table>

      <h3>Current Window</h3>
      <div class="code-block">${formatJson(errorContext.currentWindow)}</div>
    </div>

    <div class="section">
      <h2>🔢 Calculated Results</h2>
      
      <h3>Figure Calculation Results</h3>
      <div class="code-block">${formatJson(errorContext.calculatedFigures)}</div>
      
      <h3>Chrome API Arguments</h3>
      <p>The following arguments were passed to <span class="highlight">chrome.windows.create()</span>:</p>
      <div class="code-block">${formatJson(errorContext.createArgs)}</div>
    </div>

    <div class="section">
      <h2>🐛 Error Details</h2>
      
      <h3>Error Message</h3>
      <div class="code-block">${errorContext.error.message}</div>
      
      <h3>Stack Trace</h3>
      <div class="code-block">${errorContext.error.stack}</div>
    </div>

    <div class="section">
      <h2>💡 Troubleshooting Tips</h2>
      <ul>
        <li><strong>Invalid dimensions:</strong> Check if calculated left/top/width/height values are valid numbers</li>
        <li><strong>Out of bounds:</strong> Ensure window position is within screen boundaries</li>
        <li><strong>Expression errors:</strong> Verify mathematical expressions use valid syntax and available variables</li>
        <li><strong>Chrome API limits:</strong> Some window configurations may not be supported by Chrome</li>
        <li><strong>Invalid URL:</strong> Check if the URL format is correct (should start with http://, https://, or be empty for blank page)</li>
      </ul>
    </div>

    <div class="timestamp">
      Error occurred at: ${errorContext.timestamp}
    </div>
  </div>
</body>
</html>`;
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
export const contextKeys = ['windowWidth', 'windowHeight', 'left', 'top', 'width', 'height', ...staticContextKeys]

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

export function getContext(staticContext: StaticContext, chromeWindow: chrome.windows.Window): Context {
  const [windowWidth, windowHeight] = [chromeWindow.width?? 0, chromeWindow.height?? 0];
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

export function calFigure(data: WindowData, key: string, context: Context): number|undefined {
  const expr = (data as any)[key]
  if (!expr) return undefined
  try {
    return exprParser.parse(expr).evaluate(context)
  } catch (err) {
    return NaN
  }
}

export function calFigures(data: WindowData, context: Context): Figures {
  const figures: {[key: string]: number|undefined} = {}
  
  // Calculate non-dynamic values first
  for (const key of windowFigureKeys) {
    const isDynamic = (data as any)[`dynamic${key.charAt(0).toUpperCase() + key.slice(1)}`]
    if (!isDynamic) {
      const v = calFigure(data, key, context)
      if (v !== undefined) {
        figures[key] = v
      }
    }
  }
  
  // Create enhanced context with calculated non-dynamic values
  const enhancedContext = {
    ...context,
    left: figures.left || 0,
    top: figures.top || 0,
    width: figures.width || 0,
    height: figures.height || 0
  }
  
  // Then calculate dynamic values with access to other calculated values
  for (const key of windowFigureKeys) {
    const isDynamic = (data as any)[`dynamic${key.charAt(0).toUpperCase() + key.slice(1)}`]
    if (isDynamic) {
      const v = calFigure(data, key, enhancedContext)
      if (v !== undefined) {
        figures[key] = v
      }
    }
  }
  
  return figures as Figures
}

function numToString(num: number) {
  return num.toString()
}
