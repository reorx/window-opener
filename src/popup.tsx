import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Set initial selection to default window or first window
  useEffect(() => {
    if (windows.length > 0) {
      const defaultIndex = windows.findIndex(w => w.default)
      setSelectedIndex(defaultIndex >= 0 ? defaultIndex : 0)
    }
  }, [windows])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      //if (windows.length === 0) return

      // Allow Tab key to pass through for focus management
      if (e.key === 'Tab') {
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev <= 0 ? windows.length - 1 : prev - 1)
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => prev >= windows.length - 1 ? 0 : prev + 1)
          break
        case 'Enter':
          e.preventDefault()
          if (windows[selectedIndex]) {
            openWindow(windows[selectedIndex])
            //window.close()
          }
          break
      }

      // Handle Ctrl+N and Ctrl+P
      if (e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            setSelectedIndex(prev => prev >= windows.length - 1 ? 0 : prev + 1)
            break
          case 'p':
            e.preventDefault()
            setSelectedIndex(prev => prev <= 0 ? windows.length - 1 : prev - 1)
            break
        }
      }
    }

    if (containerRef.current) {
      containerRef.current.addEventListener('keydown', handleKeyDown)
      return () => containerRef.current?.removeEventListener('keydown', handleKeyDown)
    }
  }, [windows, selectedIndex])

  // Focus container on mount for keyboard events
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [windows])

  return (
    <div
      css={css`
        *:focus {
          outline: 1px solid #999;
          outline-offset: 2px;
        }
      `}
    >
      {windows.length > 0 && (
        <div
        tabIndex={0}
        ref={containerRef}
        css={css`
          padding: 10px;
          margin-bottom: 10px;
        `}>
          {windows.map((item, index) => (
            <WindowItem
              key={item.id}
              data={item}
              isSelected={index === selectedIndex}
              onClick={() => {
                openWindow(item)
                setTimeout(() => window.close(), 100)
              }}
            />
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
        gap: 8px;
      `}>
        <button css={textButton}
          tabIndex={1}
          onClick={openOptionsPage}
        >
          Settings
        </button>
        <button css={textButton}
          tabIndex={2}
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

const WindowItem = ({data, isSelected, onClick}: {data: WindowData, isSelected: boolean, onClick: () => void}) => {
  let domain = 'New Tab'
  try {
    if (data.url) {
      domain = new URL(data.url).hostname
    }
  } catch (error) {
    domain = 'Invalid URL'
  }
  return (
    <div
      css={css`
        padding: 8px 10px;
        max-width: 300px;
        min-width: 200px;
        font-size: 15px;
        border: 2px solid transparent;
        cursor: pointer;
        ${isSelected && `
          border-color: ${themeColor};
          background-color: #eee;
        `}
        &:hover {
          background-color: #ddd;
        }
      `}
      onClick={onClick}
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
        font-size: 12px;
        margin-top: 3px;
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
