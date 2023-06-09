import React from 'react';
import { createRoot } from 'react-dom/client';

import { css } from '@emotion/react';

import { useSettingsStore } from './store';
import { textButton, themeColor } from './styles';
import { openOptionsPage } from './utils/action';
import { colors, getLogger } from './utils/log';
import { createWindowFromCurrent, openWindow, WindowData } from './window';


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
      {windows.length > 0 && (
        <div css={css`
          padding: 10px;
          border-bottom: 1px solid #aaa;
          margin-bottom: 10px;
        `}>
          {windows.map(item => (
            <WindowItem key={item.id} data={item} />
          ))}
        </div>
      )}

      <div css={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 5px 0;
        min-width: 220px;

        button {
          margin: 8px;
        }
      `}>
        <button css={textButton}
          onClick={openOptionsPage}
        >
          Settings
        </button>
        <button css={textButton}
          onClick={async () => {
            const win = await createWindowFromCurrent()
            setSettings(prevState => {
              return {
                ...prevState,
                windows: [...prevState.windows, win],
              }
            })
            openOptionsPage()
          }}
        >
          Create from current window
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
        max-width: 300px;
        min-width: 200px;
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
      <div css={css`
        .name {
          margin-inline-end: 10px;
        }
        .star {
          color: ${themeColor};
        }
      `}>
        {data.name && (
          <span className='name'>{data.name}</span>
        )}
        {data.default && <span className='star'>★</span>}
      </div>
      <div css={css`
        font-size: 13px;
        color: #999;
      `}>{domain}</div>
    </div>
  )
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
