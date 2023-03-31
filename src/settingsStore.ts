import { createChromeStorageStateHookSync } from 'use-chrome-storage';


const STORAGE_KEY = 'settings'

export enum SETTINGS_KEYS  {
  iconAction = 'iconAction',
  windows = 'windows',
}

export enum ICON_ACTION_VALUES {
  windowList = 'windowList',
  defaultWindow = 'defaultWindow',
}

export const INITIAL_VALUE = {
  [SETTINGS_KEYS.iconAction]: ICON_ACTION_VALUES.defaultWindow,
  [SETTINGS_KEYS.windows]: [],
}

export const useSettingsStore = createChromeStorageStateHookSync(STORAGE_KEY, INITIAL_VALUE);
