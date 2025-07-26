import React, { ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';

import { css } from '@emotion/react';

import { BackupManager } from './BackupManager';
import { IconAction, useSettingsStore } from './store';
import { setActionBehavior } from './utils/action';
import { colors, getLogger } from './utils/log';
import { WindowsManager } from './WindowsManager';
import { createWindow, variableMeaningMap, getContext, exampleWindows } from './window';
import { themeColor } from './styles';
import {useStore} from './store';


const lg = getLogger('options', colors.bgYellowBright)

lg.info('options.ts')

getContext().then(context => {
  useStore.setState({
    context,
  })
})

let boundsChangedTs = new Date().getTime()

chrome.windows.onBoundsChanged.addListener(() => {
  const nowTs = new Date().getTime()
  if (nowTs - boundsChangedTs > 300) {
    boundsChangedTs = nowTs
    lg.info('bounds changed 300ms after last time')
    getContext().then(context => {
      useStore.setState({
        context,
      })
    })
  }
})

const Options = () => {
  const [settings, setSettings, isPersistent, error, isInitialStateResolved] = useSettingsStore();
  // lg.log('render Options', isPersistent, isInitialStateResolved)

  const context = useStore((state) => state.context)

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

  if (!isInitialStateResolved || !context) {
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
          <button
            css={css`
              background: none;
              color: ${themeColor};
              border: none;
              cursor: pointer;
              text-decoration: underline;
              font-size: 14px;
              padding: 0;
              margin-left: 5px;
            `}
            onClick={() => {
              (document.getElementById('context-explain-modal')! as HTMLDialogElement).showModal()
            }}
          >
            Explain more
          </button>
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
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
