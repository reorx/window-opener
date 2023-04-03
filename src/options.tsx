import React, { ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';

import { css } from '@emotion/react';

import { IconAction, useSettingsStore, useStore } from './store';
import { setActionBehavior } from './utils/action';
import { colors, getLogger } from './utils/log';
import { WindowsManager } from './WindowsManager';


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

  return (
    <div css={css`
      padding: 15px;
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
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
