import { css } from '@emotion/react';

import { useStore } from './store';
import { textButton, themeColor } from './styles';
import {
  contextKeys, WindowData, windowFigureKeys, calFigure, calFigures, openWindow, getStaticContext,
  staticContextKeys, getContext, CircularDependencyError,
} from './window';

export const variableMeaningMap = {
  // Dynamic variables
  windowWidth: 'the width of the current window, useful if you want to open the window in a relative position',
  windowHeight: 'the height of the current window',
  
  // Static variables
  screenWidth: 'the width of the screen',
  screenHeight: 'the height of the screen',
  xOffset: 'the unavailable space in the x-axis of screen, such as MacOS Dock put on the left/right side of the screen',
  yOffset: 'the unavailable space in the y-axis of screen, such as MacOS menubar and Windows taskbar'
};


interface WindowsManagerProps {
  windows: WindowData[];
  onWindowsChange: (windows: WindowData[]) => void;
}

export const WindowsManager = ({windows, onWindowsChange}: WindowsManagerProps) => {
  const defaultId = windows.find(item => item.default)?.id
  return (
    <div css={css`
      max-width: 800px;
    `}>
      <div>
        {windows.map(item => (
          <WindowItem
            key={item.id}
            data={item}
            defaultId={defaultId}
            windows={windows}
            onWindowsChange={onWindowsChange}
            onDataChanged={(data) => {
              // console.log('onDataChanged', data)
              const wasDefault = item.default;
              Object.assign(item, data);
              // If this window is being set as default, unset others
              if (data.default && !wasDefault) {
                windows.forEach(w => {
                  if (w.id !== data.id) {
                    w.default = false;
                  }
                });
              }
              onWindowsChange(windows)
            }}
            onDelete={(data) => {
              onWindowsChange(windows.filter(item => item.id !== data.id))
            }}
          />
        ))}
      </div>
      <div>
        <button
          onClick={() => {
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
            windows.push(win)
            onWindowsChange(windows)
          }}
        >Create</button>
      </div>
    </div>
  )
}

const inputItem = css`
  flex-grow: 1;
  display: flex;
  align-items: center;
  label {
    margin-inline-end: 5px;
    width: 50px;
    text-align: right;
    font-weight: bold;
  }
  label.normal {
    font-weight: normal;
  }
  input[type=text] {
    display: block;
    flex-grow: 1;
    padding: 2px;
    border: 1px solid #aaa;
    border-radius: 2px;
  }
  input[type=checkbox] {
    margin: 0;
  }
`

const rowFullWidth = css`
  display: flex;
  margin-bottom: 8px;
`

const rowCols = css`
  display: grid;
  gap: 8px;
  margin-bottom: 8px;
`
const cols2 = css`
  grid-template-columns: repeat(2, 1fr);
`

const cols4 = css`
  grid-template-columns: repeat(4, 1fr);
`

interface WindowItemProps {
  data: WindowData;
  defaultId?: string;
  windows: WindowData[];
  onDataChanged: (data: WindowData) => void;
  onDelete: (data: WindowData) => void;
  onWindowsChange: (windows: WindowData[]) => void;
}

const WindowItem = ({data, defaultId, windows, onDataChanged, onDelete, onWindowsChange}: WindowItemProps) => {
  const chromeWindow = useStore(state => state.chromeWindow)

  let dataError = ''
  if (data.url && !data.url.match(/^\w+:\/\//)) {
    dataError = 'Invalid URL format'
  }
  if (!data.staticContext) {
    data.staticContext = getStaticContext()
  }

  const context = getContext(data.staticContext, chromeWindow!)
  const getContextValue = (key: string) => {
    return (context as any)[key]
  }

  // Check for circular dependencies and calculate all figures
  let circularError: CircularDependencyError | null = null;
  let calculatedFigures: any = {};
  try {
    calculatedFigures = calFigures(data, context);
  } catch (err) {
    if (err instanceof CircularDependencyError) {
      circularError = err;
    }
  }

  return (
    <div css={css`
      padding: 15px;
      margin-bottom: 15px;
      border: 1px solid #aaa;
      ${data.default && 'outline: 2px solid ' + themeColor + ';'}
    `}>
      <div css={[rowCols, cols2]}>
        <div css={inputItem}>
          <label>Name:</label>
          <input type="text" name="name"
            defaultValue={data.name}
            onChange={e => onDataChanged({
              ...data,
              name: e.target.value,
            })}
          />
          <div css={css`
            width: 50px;
          `}></div>
        </div>
        <div css={inputItem}>
          <label>Type:</label>
          <select
            defaultValue={data.type}
            onChange={e => onDataChanged({
              ...data,
              type: e.target.value,
            })}
          >
            <option value="normal">normal</option>
            <option value="popup">popup</option>
          </select>
        </div>
      </div>

      <div css={rowFullWidth}>
        <div css={inputItem}>
          <label className="normal">URL:</label>
          <input type="text" name="url"
            placeholder="Optional - leave empty for blank page"
            defaultValue={data.url}
            onChange={e => onDataChanged({
              ...data,
              url: e.target.value,
            })}
          />
        </div>
      </div>

      <h4 css={css`margin: 15px 0 10px 0; color: #333;`}>Figures:</h4>

      <div css={[rowCols, cols2]}>
        {windowFigureKeys.map(key => (
          <div key={key} css={inputItem}>
            <label css={css`color: ${themeColor};`}>{key}:</label>
            <input type="text" name={key}
              defaultValue={(data as any)[key]}
              onChange={e => onDataChanged({
                ...data,
                [key]: e.target.value,
              })}
            />

            <div css={css`
              width: 50px;
              color: ${themeColor};
            `}><span css={css`
              padding-inline-start: 5px;
              padding-inline-end: 5px;
            `}>=</span>{numToString((calculatedFigures as any)[key])}</div>
          </div>
        ))}
      </div>

      {circularError && (
        <div css={css`
          color: #c00a0d;
          background-color: #ffebee;
          border: 1px solid #ffcdd2;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 4px;
        `}>
          <div css={css`
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          `}>
            <span>⚠️</span>
            <span>Circular Dependency Error</span>
          </div>
          <div css={css`
            font-size: 14px;
            line-height: 1.4;
          `}>
            {circularError.message}
          </div>
          <div css={css`
            font-size: 12px;
            margin-top: 8px;
            opacity: 0.8;
          `}>
            Fix: Ensure figure expressions don't create circular references between left, top, width, and height.
          </div>
        </div>
      )}

      <div css={css`
        color: #666;
        background-color: #eee;
        padding: 8px;
        margin-bottom: 8px;
      `}>
        <div css={css`
          margin-bottom: 8px;
          display: flex;
        `}>
          <div>Context
            <button
              css={[textButton, css`
                margin-inline-start: 10px;
              `]}
              onClick={() => {
                (document.getElementById('context-explain-modal')! as HTMLDialogElement).showModal()
              }}
          >(Explain)</button>
          </div>
          <button
            css={[textButton, css`
              margin-left: auto;
            `]}
            onClick={() => {
              const newData = {
                ...data,
                staticContext: {
                  ...data.staticContext,
                  ...getStaticContext()
                },
              }
              onDataChanged(newData)
            }}
          >(Reset)</button>
        </div>
        <div css={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          * {
            font-size: 12px;
          }

          label {
            font-family: monospace;
            margin-bottom: 3px;
            display: block;
          }

          input {
            border: none;
            outline: none;
            border-bottom: 1px solid #aaa;
            width: 50px;
            padding: 2px;
          }
          input[readonly] {
            background-color: #fafafa;
            color: #999;
          }
        `}>{contextKeys.map(key => (
          <div key={key} css={css`
          `}>
            <label>{key}</label>
            <input type="number" name={key}
              // using defaultValue causes the value not being changed when rerender,
              // the `key` here makes sure the whole input is recreated to avoid this problem
              key={`input-${key}-${getContextValue(key)}`}
              readOnly={!staticContextKeys.includes(key)}
              defaultValue={getContextValue(key)}
              onChange={e => onDataChanged({
                ...data,
                staticContext: {
                  ...data.staticContext,
                  [key]: parseInt(e.target.value),
                }
              })}
            />
          </div>))}
        </div>
      </div>

      {dataError && (
        <div css={css`
          color: #c00a0d;
          background-color: #eebebe;
          padding: 8px;
          margin-bottom: 8px;
        `}>{dataError}</div>
      )}
      <div css={css`
        display: flex;
        gap: 10px;
        margin-top: 16px;
      `}>
        <button onClick={() => {
          openWindow(data)
        }}>Open</button>
        <button 
          disabled={data.default}
          onClick={() => {
            onDataChanged({
              ...data,
              default: true,
            })
          }}
        >Set as default</button>
        <button onClick={() => {
          const duplicatedWindow = {
            ...data,
            id: new Date().getTime().toString(),
            name: data.name ? `${data.name} Copied` : 'Copied',
            default: false,
          }
          const updatedWindows = [...windows, duplicatedWindow]
          onWindowsChange(updatedWindows)
        }}>Duplicate</button>
        <button onClick={() => {
          if (confirm('Are you sure you want to delete this window?')) {
            onDelete(data)
          }
        }}>Delete</button>
      </div>

      <dialog id="context-explain-modal" css={css`
        width: 500px;
        max-width: 90%;
        padding: 20px;
        padding-top: 10px;
        font-size: 15px;
        line-height: 1.5;
        &::backdrop {
          background: rgba(100, 100, 100, 0.6);
        }
        ul {
          padding-left: 1.5em;
        }
        li {
          margin-bottom: 3px;
          b {
            font-family: monospace;
          }
        }
      `}>
        <form method="dialog">
          <div>
            <h3>What is context and how to use it?</h3>
            <p>
              Context is a set of variables that can be used to calculate the actual window size and position figures (<code>left</code>, <code>top</code>, <code>width</code>, <code>height</code>). Those figures can be defined as mathmatical expressions, such as <code>(screenWidth - 700) / 2</code> or <code>screenWidth - windowWidth - xOffset</code>, the variables used in the expressions must be from the context variables.
            </p>
            <p>There are two types of context variables, one is dynamic, the other is static. Static variables are assigned based on the current screen when the window item is created, you can click (Reset) to reset them.</p>
            <p><b>Here's the list of dynamic variables:</b></p>
            <ul>
              <li><b>windowWidth</b>: {variableMeaningMap.windowWidth}</li>
              <li><b>windowHeight</b>: {variableMeaningMap.windowHeight}</li>
            </ul>
            <p><b>Here's the list of static variables:</b></p>
            <ul>
              <li><b>screenWidth</b>: {variableMeaningMap.screenWidth}</li>
              <li><b>screenHeight</b>: {variableMeaningMap.screenHeight}</li>
              <li><b>xOffset</b>: {variableMeaningMap.xOffset}</li>
              <li><b>yOffset</b>: {variableMeaningMap.yOffset}</li>
            </ul>
          </div>
          <div css={css`
            text-align: center;
            margin-top: 20px;
          `}>
            <button value="cancel" css={css`
              font-size: 20px;
              padding: 10px;
              width: 100px;
            `}>OK</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}


function numToString(n: number|undefined) {
  if (n === undefined) {
    return ''
  }
  return n.toString()
}
