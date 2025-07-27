import { css } from '@emotion/react';
import { useMemo } from 'react';

import { useStore } from './store';
import { themeColor } from './styles';
import {
  contextKeys, WindowData, windowFigureKeys, calFigures, openWindow,
  Context, getContext, CircularDependencyError, variableMeaningMap
} from './window';


interface WindowsManagerProps {
  windows: WindowData[];
  onWindowsChange: (windows: WindowData[]) => void;
}

export const WindowsManager = ({windows, onWindowsChange}: WindowsManagerProps) => {
  const defaultId = windows.find(item => item.default)?.id
  const context = useStore((state) => state.context)

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
            context={context!}
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
  
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`

interface WindowItemProps {
  data: WindowData;
  defaultId?: string;
  windows: WindowData[];
  onDataChanged: (data: WindowData) => void;
  onDelete: (data: WindowData) => void;
  onWindowsChange: (windows: WindowData[]) => void;
  context: Context;
}

const WindowItem = ({data, defaultId, windows, context, onDataChanged, onDelete, onWindowsChange}: WindowItemProps) => {

  let dataError = ''
  if (data.url && !data.url.match(/^\w+:\/\//)) {
    dataError = 'Invalid URL format'
  }

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
          <div>Context</div>
        </div>
        <div css={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
          
          @media (max-width: 1000px) {
            justify-content: flex-start;
          }
          
          * {
            font-size: 12px;
          }

          label {
            font-family: monospace;
            margin-bottom: 3px;
            display: block;
            cursor: help;
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
            <label title={(variableMeaningMap as any)[key]}>{key}</label>
            <input type="number" name={key}
              // using defaultValue causes the value not being changed when rerender,
              // the `key` here makes sure the whole input is recreated to avoid this problem
              key={`input-${key}-${getContextValue(key)}`}
              readOnly
              defaultValue={getContextValue(key)}
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

    </div>
  )
}


function numToString(n: number|undefined) {
  if (n === undefined) {
    return ''
  }
  return n.toString()
}
