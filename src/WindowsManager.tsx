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
    <div>
      <div>
        {windows.map(item => (
          <WindowItem
            key={item.id}
            data={item}
            onDataChanged={(data) => {
              console.log('onDataChanged', data)
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

interface WindowItemProps {
  data: WindowData;
  onDataChanged: (data: WindowData) => void;
  onDelete: (data: WindowData) => void;
}

const WindowItem = ({data, onDataChanged, onDelete}: WindowItemProps) => {
  return (
    <div>
      <div>
        <div>
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

      <div>
        <div>
          <label>Default:</label>
          <input type="checkbox" name="default"
            defaultChecked={data.default}
            onChange={e => onDataChanged({
              ...data,
              default: e.target.checked,
            })}
          />
        </div>
        <div>
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

      <div>
        <div>
          <label>Left:</label>
          <input type="text" name="left"
            defaultValue={data.left}
            onChange={e => onDataChanged({
              ...data,
              left: e.target.value,
            })}
          />
        </div>
        <div>
          <label>Top:</label>
          <input type="text" name="top"
            defaultValue={data.top}
            onChange={e => onDataChanged({
              ...data,
              top: e.target.value,
            })}
          />
        </div>
        <div>
          <label>Width:</label>
          <input type="text" name="width"
            defaultValue={data.width}
            onChange={e => onDataChanged({
              ...data,
              width: e.target.value,
            })}
          />
        </div>
        <div>
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
