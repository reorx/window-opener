import { WindowData, Context } from '../window';

export interface ErrorContext {
  windowData: {
    id: string;
    name: string;
    url: string;
    type: string;
    focused: boolean;
    default: boolean;
    expressions: {
      left: string;
      top: string;
      width: string;
      height: string;
    };
  };
  context: Context;
  currentWindow: any;
  calculatedFigures: any;
  createArgs: any;
  error: {
    name: string;
    message: string;
    stack: string;
  };
  timestamp: string;
}

export function createErrorContext(
  data: WindowData,
  context: Context,
  chromeWindow: chrome.windows.Window | null,
  figures: any,
  createArgs: any,
  err: Error
): ErrorContext {
  return {
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
    },
    context,
    currentWindow: chromeWindow ? {
      left: chromeWindow.left,
      top: chromeWindow.top,
      width: chromeWindow.width,
      height: chromeWindow.height
    } : 'Failed to get current window',
    calculatedFigures: figures,
    createArgs: createArgs,
    error: {
      name: err.name || 'Unknown Error',
      message: err.message || String(err),
      stack: err.stack || 'No stack trace available'
    },
    timestamp: new Date().toISOString()
  };
}

export function createEnhancedErrorHtml(errorContext: ErrorContext): string {
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
        <tr><th>Property</th><th>Expression</th></tr>
        <tr>
          <td>Left</td>
          <td class="value">${errorContext.windowData.expressions.left || '(empty)'}</td>
        </tr>
        <tr>
          <td>Top</td>
          <td class="value">${errorContext.windowData.expressions.top || '(empty)'}</td>
        </tr>
        <tr>
          <td>Width</td>
          <td class="value">${errorContext.windowData.expressions.width || '(empty)'}</td>
        </tr>
        <tr>
          <td>Height</td>
          <td class="value">${errorContext.windowData.expressions.height || '(empty)'}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h2>🖥️ Context Information</h2>

      <h3>Static Context (Screen Info)</h3>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Screen Width</td><td class="value">${errorContext.context.screenWidth}px</td></tr>
        <tr><td>Screen Height</td><td class="value">${errorContext.context.screenHeight}px</td></tr>
        <tr><td>X Offset</td><td class="value">${errorContext.context.xOffset}px</td></tr>
        <tr><td>Y Offset</td><td class="value">${errorContext.context.yOffset}px</td></tr>
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

export async function showErrorInNewWindow(
  data: WindowData,
  context: Context,
  chromeWindow: chrome.windows.Window | null,
  figures: any,
  createArgs: any,
  err: Error
): Promise<void> {
  const errorContext = createErrorContext(data, context, chromeWindow, figures, createArgs, err);
  
  console.error('Window creation failed:', errorContext);

  const [width, height] = [Math.floor(context.screenWidth / 2), Math.floor(context.screenHeight * 0.7)];

  try {
    await chrome.windows.create({
      url: `data:text/html,${encodeURIComponent(createEnhancedErrorHtml(errorContext))}`,
      type: 'popup',
      focused: true,
      left: Math.floor((context.screenWidth - width) / 2),
      top: Math.floor((context.screenHeight - height) / 2),
      width,
      height,
    });
  } catch (secondaryErr) {
    console.error('Failed to create error window:', secondaryErr);
    console.error('Original error context:', errorContext);
  }
}