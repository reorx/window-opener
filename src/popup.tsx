import React from 'react';
import { createRoot } from 'react-dom/client';

import { css } from '@emotion/react';

import { useSettingsStore } from './store';
import { textButton, themeColor } from './styles';
import { colors, getLogger } from './utils/log';
import { openWindow, WindowData } from './window';


const lg = getLogger('popup', colors.bgYellowBright)

lg.info('popup.ts')

const Popup = () => {
  const [settings, setSettings, isPersistent, error, isInitialStateResolved] = useSettingsStore();
  const windows = settings.windows as WindowData[]

  if (!isInitialStateResolved) {
    return (
      <div>loading</div>
    )
  }

  return (
    <div>
      <div>
        {windows.map(item => (
          <WindowItem key={item.id} data={item} />
        ))}
      </div>

      <div css={css`
        display: flex;
        justify-content: center;
        margin-top: 10px;
        padding: 5px;
      `}>
        <button css={textButton}
          onClick={() => {
            chrome.tabs.create({
              url: 'options.html'
            })
          }}
        >
          Settings
        </button>
      </div>
    </div>
  )
};

const WindowItem = ({data}: {data: WindowData}) => {
  const domain = new URL(data.url).hostname
  return (
    <div
      css={css`
        padding: 8px 10px;
        width: 200px;
        font-size: 15px;
        border: 1px solid transparent;
        cursor: pointer;
        &:hover {
          border-color: ${themeColor};
          background-color: #eee;
        }
      `}
      onClick={() => {
        openWindow(data)
        window.close()
      }}
    >
      {domain}
    </div>
  )
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
