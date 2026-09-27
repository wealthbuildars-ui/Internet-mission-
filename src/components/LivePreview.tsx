import React, { useState } from 'react';
import { Eye, Sun, Moon, RefreshCw, Terminal } from 'lucide-react';
import { MissionCode } from '../types';
import { normalizeMissionCode } from '../utils/domValidator';

interface LivePreviewProps {
  code?: MissionCode | string;
  htmlCode?: string;
  runtimeError?: string | null;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  code,
  htmlCode,
  runtimeError,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [reloadKey, setReloadKey] = useState<number>(0);

  const normalized = normalizeMissionCode(code || htmlCode || '');

  // Sandboxed document combining HTML, CSS, and JS safely
  const combinedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
      color: ${theme === 'dark' ? '#f8fafc' : '#0f172a'};
      padding: 16px;
      line-height: 1.5;
      margin: 0;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: ${theme === 'dark' ? '#38bdf8' : '#0284c7'};
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: ${theme === 'dark' ? '#7dd3fc' : '#0369a1'};
    }
    p {
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      color: ${theme === 'dark' ? '#cbd5e1' : '#334155'};
    }
    button {
      display: inline-block;
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 600;
      background: #0284c7;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 4px;
      margin-bottom: 8px;
      transition: background 0.2s, transform 0.1s;
    }
    button:hover {
      background: #0369a1;
    }
    button:active {
      transform: scale(0.98);
    }
    a {
      color: #38bdf8;
      text-decoration: underline;
      display: inline-block;
      margin-bottom: 8px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 8px;
      display: block;
      border: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'};
    }
    /* User custom CSS */
    ${normalized.css}
  </style>
</head>
<body>
  ${normalized.html || '<div style="color: #64748b; font-style: italic; font-size: 13px;">Nothing rendered yet. Type your code and press "Run Code".</div>'}
  
  <script>
    try {
      ${normalized.js}
    } catch (err) {
      console.warn("Script Execution Notice:", err);
    }
  </script>
</body>
</html>`;

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Top Preview Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold font-display">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live Preview</span>
          <span className="text-[10px] text-cyan-500/80 font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/40">
            Sandboxed
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} canvas`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex flex-col p-2">
        <iframe
          key={reloadKey}
          title="Internet Mission Live Preview"
          srcDoc={combinedHtml}
          sandbox="allow-scripts"
          className="w-full flex-1 rounded-xl border border-slate-800/70 bg-slate-900 shadow-inner"
        />

        {runtimeError && (
          <div className="mt-2 p-2 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{runtimeError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
