import { css } from '@emotion/react';

import { useStore } from './store';
import { textButton, themeColor } from './styles';
import {
  contextKeys, WindowData, windowFigureKeys, calFigure, openWindow, getStaticContext,
  staticContextKeys, getContext,
} from './window';


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
            onDataChanged={(data) => {
              // console.log('onDataChanged', data)
              Object.assign(item, data);
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
              focused: false,
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
  onDataChanged: (data: WindowData) => void;
  onDelete: (data: WindowData) => void;
}

const WindowItem = ({data, defaultId, onDataChanged, onDelete}: WindowItemProps) => {
  const chromeWindow = useStore(state => state.chromeWindow)

  let dataError = ''
  if (!data.url) {
    dataError = 'URL is required'
  } else if (!data.url.match(/^\w+:\/\//)) {
    dataError = 'Invalid URL format'
  }
  if (!data.staticContext) {
    data.staticContext = getStaticContext()
  }

  const context = getContext(data.staticContext, chromeWindow!)
  const getContextValue = (key: string) => {
    return context[key]
  }

  return (
    <div css={css`
      border: 1px solid ${data.default ? themeColor : '#aaa'};
      padding: 15px;
      margin-bottom: 15px;
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
      </div>
      <div css={rowFullWidth}>
        <div css={inputItem}>
          <label>URL:</label>
          <input type="text" name="url"
            defaultValue={data.url}
            onChange={e => onDataChanged({
              ...data,
              url: e.target.value,
            })}
          />
        </div>
      </div>

      <div css={[rowCols, cols4]}>
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
        <div css={inputItem}>
        </div>
        <div css={inputItem}>
          <label htmlFor={data.id + "-input-focused"}>Focused:</label>
          <input type="checkbox" name="focused" id={data.id + "-input-focused"}
            defaultChecked={data.focused}
            onChange={e => onDataChanged({
              ...data,
              focused: e.target.checked,
            })}
          />
        </div>
        <div css={inputItem}>
          <label htmlFor={data.id + "-input-default"}>Default:</label>
          <input type="checkbox" name="default" id={data.id + "-input-default"}
            defaultChecked={data.default}
            disabled={!!defaultId && defaultId !== data.id}
            onChange={e => onDataChanged({
              ...data,
              default: e.target.checked,
            })}
          />
        </div>
      </div>

      <div css={[rowCols, cols2]}>
        {windowFigureKeys.map(key => (
          <div key={key} css={inputItem}>
            <label>{key}:</label>
            <input type="text" name={key}
              defaultValue={(data as any)[key]}
              onChange={e => onDataChanged({
                ...data,
                [key]: e.target.value,
              })}
            />

            <div css={css`
              width: 50px;
            `}><span css={css`
              padding-inline-start: 5px;
              padding-inline-end: 5px;
            `}>=</span>{numToString(calFigure(data, key, context))}</div>
          </div>
        ))}
      </div>

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
      `}>
        <button onClick={() => {
          openWindow(data)
        }}>Open</button>
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
              <li><b>windowWidth</b>: the width of the current window, useful if you want to open the window in a relative position.</li>
              <li><b>windowHeight</b>: the height of the current window.</li>
            </ul>
            <p><b>Here's the list of static variables:</b></p>
            <ul>
              <li><b>screenWidth</b>: the width of the screen</li>
              <li><b>screenHeight</b>: the height of the screen</li>
              <li><b>xOffset</b>: the unavailable space in the x-axis of screen, such as MacOS Dock put on the left/right side of the screen</li>
              <li><b>yOffset</b>: the unavailable space in the y-axis of screen, such as MacOS menubar and Windows taskbar</li>
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
