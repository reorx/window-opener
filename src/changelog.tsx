import React from 'react';
import { createRoot } from 'react-dom/client';
import { css } from '@emotion/react';
import { changelog, getCurrentVersion, type ChangelogEntry } from './changelog';
import { themeColor } from './styles';

const pageStyle = css`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const headerStyle = css`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    color: ${themeColor};
    margin-bottom: 10px;
    font-size: 2.2em;
  }
  
  .current-version {
    font-size: 1.1em;
    color: #666;
    margin-bottom: 15px;
  }
  
  .description {
    color: #777;
    font-size: 1em;
  }
`;

const entryStyle = css`
  margin-bottom: 30px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
  
  &:first-of-type {
    border-color: ${themeColor};
    background: #f8feff;
    
    .version {
      color: ${themeColor};
    }
  }
  
  .version {
    font-size: 1.4em;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  
  .date {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 15px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 8px;
    color: #444;
  }
  
  .note {
    margin-top: 15px;
    padding: 12px;
    background: #fff3cd;
    border: 1px solid #ffecb5;
    border-radius: 5px;
    color: #856404;
    font-size: 0.9em;
    line-height: 1.5;
    
    strong {
      font-weight: bold;
    }
  }
`;

const footerStyle = css`
  text-align: center;
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #e1e1e1;
  color: #666;
  font-size: 0.9em;
`;

const ChangelogEntry: React.FC<{ entry: ChangelogEntry; isLatest: boolean }> = ({ entry, isLatest }) => {
  const renderNote = (note: string) => {
    // Simple markdown-like rendering for bold text
    const parts = note.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div css={entryStyle}>
      <div className="version">
        v{entry.version} {isLatest && <span css={css`font-size: 0.7em; color: #666;`}>(Latest)</span>}
      </div>
      <div className="date">{entry.date}</div>
      <ul>
        {entry.changes.map((change, index) => (
          <li key={index}>{change}</li>
        ))}
      </ul>
      {entry.note && (
        <div className="note">
          {renderNote(entry.note)}
        </div>
      )}
    </div>
  );
};

const Changelog: React.FC = () => {
  const currentVersion = getCurrentVersion();
  
  return (
    <div css={pageStyle}>
      <header css={headerStyle}>
        <h1>What's New</h1>
        <div className="current-version">Current Version: v{currentVersion}</div>
        <div className="description">
          Recent updates and improvements to Window Opener
        </div>
      </header>
      
      <main>
        {changelog.map((entry, index) => (
          <ChangelogEntry 
            key={entry.version} 
            entry={entry} 
            isLatest={index === 0}
          />
        ))}
      </main>
      
      <footer css={footerStyle}>
        <p>Thank you for using Window Opener! 🎉</p>
        <p>
          <button 
            css={css`
              background: ${themeColor};
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 1em;
              margin-top: 10px;
              
              &:hover {
                background: #1a8cd8;
              }
            `}
            onClick={() => window.close()}
          >
            Close
          </button>
        </p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Changelog />
  </React.StrictMode>
);