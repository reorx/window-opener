import { createChromeStorageStateHookSync } from 'use-chrome-storage';

import { WindowData } from './window';


/* settings */

const STORAGE_KEY = 'settings'

export interface Settings {
  iconAction: IconAction
  windows: WindowData[]
}

export enum IconAction {
  windowList = 'windowList',
  defaultWindow = 'defaultWindow',
}

export const INITIAL_SETTINGS = {
  iconAction: IconAction.defaultWindow,
  windows: [],
}

export const useSettingsStore = createChromeStorageStateHookSync(STORAGE_KEY, INITIAL_SETTINGS);

export const getSettings = async (): Promise<Settings>  => {
  const data = await chrome.storage.sync.get(STORAGE_KEY)
  let settings = data[STORAGE_KEY]
  if (!settings)
    settings = INITIAL_SETTINGS
  return settings as Settings
}
