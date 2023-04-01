import { css } from '@emotion/react';

import { textButton, themeColor } from './styles';
import {
  Context, contextKeys, WindowData, windowFigureKeys, calFigure, getContext,
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
              url: '',
              type: 'normal',
              focused: false,
              default: false,
              left: '',
              top: '',
              width: '',
              height: '',
              context: getContext(),
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

const cols3 = css`
  grid-template-columns: repeat(3, 1fr);
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
  let dataError = ''
  if (!data.url) {
    dataError = 'URL is required'
  } else if (!data.url.match(/^\w+:\/\//)) {
    dataError = 'Invalid URL format'
  }
  if (!data.context) {
    data.context = getContext()
  }
  return (
    <div css={css`
      border: 1px solid ${data.default ? themeColor : '#aaa'};
      padding: 15px;
      margin-bottom: 15px;
    `}>
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
              defaultValue={data[key]}
              onChange={e => onDataChanged({
                ...data,
                [key]: e.target.value,
              })}
            />
            <div css={css`
              padding: 0 5px;
            `}>=</div>
            <div css={css`
              width: 40px;
            `}>{numToString(calFigure(data, key))}</div>
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
          <div>Context</div>
          <button
            css={[textButton, css`
              margin-left: auto;
            `]}
            onClick={() => {
              onDataChanged({
                ...data,
                context: getContext(),
              })
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
        `}>{contextKeys.map(key => (
          <div key={key} css={css`
          `}>
            <label>{key}</label>
            <input type="number" name={key}
              defaultValue={data.context[key]}
              onChange={e => onDataChanged({
                ...data,
                context: {
                  ...data.context,
                  [key]: e.target.value,
                } as Context,
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
      <div>
        <button onClick={() => onDelete(data)}>Delete</button>
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
