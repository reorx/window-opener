import { css } from '@emotion/react';


interface WindowData {
  id: string;
  url: string;
  default: boolean;
  focused: boolean;
  left: string;
  top: string;
  width: string;
  height: string;
}

interface WindowsManagerProps {
  windows: any[];
  onWindowsChange: (windows: any[]) => void;
}

export const WindowsManager = ({windows, onWindowsChange}: WindowsManagerProps) => {
  return (
    <div css={css`
      max-width: 500px;
    `}>
      <div>
        {windows.map(item => (
          <WindowItem
            key={item.id}
            data={item}
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
              default: false,
              focused: false,
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
  }
  input[type=text] {
    display: block;
    flex-grow: 1;
    padding: 2px;
  }
  input[type=checkbox] {
    margin: 0;
  }
`

const rowFullWidth = css`
  display: flex;
  margin-bottom: 8px;
`

const rowCols2 = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 8px;
`

interface WindowItemProps {
  data: WindowData;
  onDataChanged: (data: WindowData) => void;
  onDelete: (data: WindowData) => void;
}

const WindowItem = ({data, onDataChanged, onDelete}: WindowItemProps) => {
  return (
    <div css={css`
      border: 1px solid #aaa;
      padding: 10px;
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

      <div css={rowCols2}>
        <div css={inputItem}>
          <label>Default:</label>
          <input type="checkbox" name="default"
            defaultChecked={data.default}
            onChange={e => onDataChanged({
              ...data,
              default: e.target.checked,
            })}
          />
        </div>
        <div css={inputItem}>
          <label>Focused:</label>
          <input type="checkbox" name="focused"
            defaultChecked={data.focused}
            onChange={e => onDataChanged({
              ...data,
              focused: e.target.checked,
            })}
          />
        </div>
      </div>

      <div css={rowCols2}>
        <div css={inputItem}>
          <label>Left:</label>
          <input type="text" name="left"
            defaultValue={data.left}
            onChange={e => onDataChanged({
              ...data,
              left: e.target.value,
            })}
          />
        </div>
        <div css={inputItem}>
          <label>Top:</label>
          <input type="text" name="top"
            defaultValue={data.top}
            onChange={e => onDataChanged({
              ...data,
              top: e.target.value,
            })}
          />
        </div>
        <div css={inputItem}>
          <label>Width:</label>
          <input type="text" name="width"
            defaultValue={data.width}
            onChange={e => onDataChanged({
              ...data,
              width: e.target.value,
            })}
          />
        </div>
        <div css={inputItem}>
          <label>Height:</label>
          <input type="text" name="height"
            defaultValue={data.height}
            onChange={e => onDataChanged({
              ...data,
              height: e.target.value,
            })}
          />
        </div>
      </div>
      <div>
        <button onClick={() => onDelete(data)}>Delete</button>
      </div>
    </div>
  )
}
