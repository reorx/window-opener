import React, { ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';

import { IconAction, useSettingsStore } from './store';
import { colors, getLogger } from './utils/log';
import { WindowsManager } from './WindowsManager';


const lg = getLogger('options', colors.bgYellowBright)

lg.info('options.ts')


const Options = () => {
  const [settings, setSettings, isPersistent, error, isInitialStateResolved] = useSettingsStore();

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

  if (!isInitialStateResolved) {
    return (
      <div>loading</div>
    )
  }

  return (
    <div>
      <h2>General</h2>
      <label>Icon action:</label>
      <br />
      <label>
        <input
          type="radio"
          value={IconAction.defaultWindow}
          onChange={handleValueChange}
          checked={settings.iconAction === IconAction.defaultWindow}
        />
        Open Default Window
      </label>
      <br />
      <label>
        <input
          type="radio"
          value={IconAction.windowList}
          onChange={handleValueChange}
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
