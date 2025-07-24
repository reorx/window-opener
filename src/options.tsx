import React, { ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';

import { css } from '@emotion/react';

import { BackupManager } from './BackupManager';
import { IconAction, useSettingsStore, useStore } from './store';
import { setActionBehavior } from './utils/action';
import { colors, getLogger } from './utils/log';
import { WindowsManager, variableMeaningMap } from './WindowsManager';
import { createWindow, getStaticContext } from './window';


const lg = getLogger('options', colors.bgYellowBright)

lg.info('options.ts')

chrome.windows.getCurrent().then(window => {
  useStore.setState({
    chromeWindow: window
  })
})

let boundsChangedTs = new Date().getTime()

chrome.windows.onBoundsChanged.addListener(window => {
  const nowTs = new Date().getTime()
  if (nowTs - boundsChangedTs > 300) {
    boundsChangedTs = nowTs
    lg.info('bounds changed 300ms after last time')
    chrome.windows.getCurrent().then(window => {
      useStore.setState({
        chromeWindow: window
      })
    })
  }
})

const Options = () => {
  const [settings, setSettings, isPersistent, error, isInitialStateResolved] = useSettingsStore();
  // lg.log('render Options', isPersistent, isInitialStateResolved)

  const chromeWindow = useStore((state) => state.chromeWindow)

  // useEffect(() => {
  // }, [])

  const setSettingsSingle = (key: string, value: any) => {
    setSettings(prevState => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsSingle(name, value);
  }

  const handleIconActionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActionBehavior(e.target.value as IconAction)
    handleValueChange(e)
  }

  if (!isInitialStateResolved || !chromeWindow) {
    return (
      <div>loading</div>
    )
  }

  const createExampleWindow = (example: 'fill-right' | 'center') => {
    const win = createWindow()
    win.name = example === 'fill-right' ? 'Fill Right Side' : 'Centered Window'
    
    if (example === 'fill-right') {
      win.left = 'windowWidth + xOffset'
      win.top = 'yOffset'
      win.width = 'screenWidth - windowWidth - xOffset'
      win.height = 'screenHeight - yOffset'
    } else {
      win.width = 'screenWidth / 3'
      win.height = 'screenHeight / 2'
      win.left = '(screenWidth - width) / 2'
      win.top = '(screenHeight - height) / 2'
    }
    
    const updatedWindows = [...settings.windows, win]
    setSettingsSingle('windows', updatedWindows)
  }

  return (
    <div css={css`
      display: flex;
      gap: 20px;
      padding: 15px;
    `}>
      <div css={css`
        flex: 1;
        min-width: 0;
      `}>
        <h2>General</h2>
        <label>Icon action:</label>
        <br />
        <label htmlFor={'input-' + IconAction.defaultWindow}>
          <input id={'input-' + IconAction.defaultWindow}
            type="radio"
            name="iconAction"
            value={IconAction.defaultWindow}
            onChange={handleIconActionChange}
            checked={settings.iconAction === IconAction.defaultWindow}
          />
          Open Default Window
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="iconAction"
            value={IconAction.windowList}
            onChange={handleIconActionChange}
            checked={settings.iconAction === IconAction.windowList}
          />
          Open Windows List
        </label>

        {!isPersistent && <div>Error writing to the chrome.storage: {error}</div>}

        <h2>Windows</h2>

        <WindowsManager
          windows={settings.windows}
          onWindowsChange={(windows) => {
            lg.log('onWindowsChange', windows)
            setSettingsSingle('windows', windows);
          }}
        ></WindowsManager>

        <h2>Backup and restore</h2>
        <BackupManager />
      </div>

      <div css={css`
        width: 350px;
        border: 1px solid #ccc;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 5px;
        height: fit-content;
        position: sticky;
        top: 15px;
        color: #333;
      `}>
      <h3 css={css`margin-top: 0; font-size: 18px;`}>Window Positioning Tips</h3>
        
        <p css={css`
          font-size: 14px;
          margin-bottom: 15px;
        `}>
          Use mathematical expressions to set window dimensions and positions.
        </p>
        
        <div css={css`margin-bottom: 20px;`}>
          <h4 css={css`margin: 0 0 8px 0; font-size: 13px; color: #555;`}>Dynamic Variables:</h4>
          <ul css={css`
            font-size: 13px;
            margin: 0 0 12px 0;
            padding-left: 20px;
          `}>
            <li><code>windowWidth</code> - {variableMeaningMap.windowWidth}</li>
            <li><code>windowHeight</code> - {variableMeaningMap.windowHeight}</li>
          </ul>
          
          <h4 css={css`margin: 0 0 8px 0; font-size: 13px; color: #555;`}>Static Variables:</h4>
          <ul css={css`
            font-size: 13px;
            margin: 0;
            padding-left: 20px;
          `}>
            <li><code>screenWidth</code> - {variableMeaningMap.screenWidth}</li>
            <li><code>screenHeight</code> - {variableMeaningMap.screenHeight}</li>
            <li><code>xOffset</code> - {variableMeaningMap.xOffset}</li>
            <li><code>yOffset</code> - {variableMeaningMap.yOffset}</li>
          </ul>
        </div>

        <div css={css`
          margin-bottom: 25px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        `}>
          <h4 css={css`margin: 0 0 10px 0; color: #333;`}>Fill Right of Current Window</h4>
          <div css={css`
            font-family: monospace;
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.4;
          `}>
            left = windowWidth + xOffset<br/>
            top = yOffset<br/>
            width = screenWidth - windowWidth - xOffset<br/>
            height = screenHeight - yOffset
          </div>
          <button onClick={() => createExampleWindow('fill-right')}>
            Copy example
          </button>
        </div>

        <div css={css`
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        `}>
          <h4 css={css`margin: 0 0 10px 0; color: #333;`}>Center on Screen</h4>
          <div css={css`
            font-family: monospace;
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.4;
          `}>
            width = screenWidth / 3<br/>
            height = screenHeight / 2<br/>
            left = (screenWidth - width) / 2<br/>
            top = (screenHeight - height) / 2
          </div>
          <button onClick={() => createExampleWindow('center')}>
            Copy example
          </button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
