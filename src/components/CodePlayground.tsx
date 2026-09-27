import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Code2,
  FileCode,
  Layers,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface CodePlaygroundProps {
  onCodeRun?: () => void;
}

const TEMPLATES = [
  {
    name: 'Blank Slate',
    html: `<h1>Welcome to Code Playground</h1>\n<p>Start building your HTML, CSS, and JS creations here!</p>`,
    css: `body {\n  background: #030712;\n  color: #38bdf8;\n  font-family: sans-serif;\n  padding: 30px;\n  text-align: center;\n}`,
    js: `console.log("Playground Ready!");`,
  },
  {
    name: 'Cyber Card',
    html: `<div class="cyber-card">\n  <h2>Quantum Core</h2>\n  <p>Status: Synchronized with the Web Grid.</p>\n  <button id="activate-btn">⚡ Activate Core</button>\n  <div id="output"></div>\n</div>`,
    css: `body {\n  background: #030712;\n  color: #fff;\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n\n.cyber-card {\n  background: #0f172a;\n  border: 1px solid #0284c7;\n  border-radius: 16px;\n  padding: 24px;\n  max-width: 320px;\n  text-align: center;\n  box-shadow: 0 0 20px rgba(2, 132, 199, 0.3);\n}\n\nh2 {\n  color: #38bdf8;\n  margin-top: 0;\n}\n\nbutton {\n  background: #0284c7;\n  color: #fff;\n  border: none;\n  padding: 10px 18px;\n  border-radius: 8px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 14px;\n  font-size: 13px;\n  color: #34d399;\n}`,
    js: `const btn = document.getElementById("activate-btn");\nconst out = document.getElementById("output");\n\nbtn.addEventListener("click", () => {\n  out.textContent = "⚡ Core activated at " + new Date().toLocaleTimeString();\n});`,
  },
  {
    name: 'Interactive Counter',
    html: `<div class="counter-box">\n  <h3>Energy Reactor</h3>\n  <div class="display" id="val">0</div>\n  <div class="btn-row">\n    <button id="down">- 1</button>\n    <button id="up">+ 1</button>\n  </div>\n</div>`,
    css: `body {\n  background: #030712;\n  color: #fff;\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n\n.counter-box {\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 14px;\n  padding: 24px;\n  text-align: center;\n  min-width: 240px;\n}\n\n.display {\n  font-size: 48px;\n  font-weight: bold;\n  color: #38bdf8;\n  margin: 16px 0;\n}\n\n.btn-row {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n}\n\nbutton {\n  background: #1e293b;\n  color: #38bdf8;\n  border: 1px solid #38bdf8;\n  padding: 8px 20px;\n  border-radius: 8px;\n  font-size: 18px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #38bdf8;\n  color: #030712;\n}`,
    js: `let count = 0;\nconst val = document.getElementById("val");\nconst up = document.getElementById("up");\nconst down = document.getElementById("down");\n\nup.addEventListener("click", () => {\n  count++;\n  val.textContent = count;\n});\n\ndown.addEventListener("click", () => {\n  count--;\n  val.textContent = count;\n});`,
  },
];

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ onCodeRun }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [html, setHtml] = useState<string>(TEMPLATES[0].html);
  const [css, setCss] = useState<string>(TEMPLATES[0].css);
  const [js, setJs] = useState<string>(TEMPLATES[0].js);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const executeCode = () => {
    sound.playClick();
    if (onCodeRun) onCodeRun();

    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    const newLogs: string[] = [];

    const fullSrc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    (function() {
      const origLog = console.log;
      console.log = function(...args) {
        window.parent.postMessage({ type: 'PLAYGROUND_LOG', message: args.join(' ') }, '*');
        origLog.apply(console, args);
      };
      window.onerror = function(msg) {
        window.parent.postMessage({ type: 'PLAYGROUND_ERROR', message: msg }, '*');
      };
    })();
    try {
      ${js}
    } catch(err) {
      console.log('Error: ' + err.message);
    }
  </script>
</body>
</html>`;

    iframeDoc.open();
    iframeDoc.write(fullSrc);
    iframeDoc.close();
  };

  useEffect(() => {
    executeCode();

    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PLAYGROUND_LOG') {
        setLogs((prev) => [...prev.slice(-20), `> ${e.data.message}`]);
      } else if (e.data && e.data.type === 'PLAYGROUND_ERROR') {
        setLogs((prev) => [...prev.slice(-20), `[ERR] ${e.data.message}`]);
      }
    };

    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = TEMPLATES.find((t) => t.name === e.target.value);
    if (template) {
      sound.playClick();
      setHtml(template.html);
      setCss(template.css);
      setJs(template.js);
      setLogs([]);
    }
  };

  const handleClear = () => {
    sound.playClick();
    if (confirm('Clear all code in the playground?')) {
      setHtml('');
      setCss('');
      setJs('');
      setLogs([]);
    }
  };

  const handleCopyCombined = () => {
    sound.playClick();
    const fullCode = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JAVASCRIPT\n${js}`;
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`w-full max-w-6xl mx-auto p-3 sm:p-4 flex flex-col gap-4 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#030712] p-4 overflow-y-auto' : ''
      }`}
    >
      {/* Playground Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-lg text-white flex items-center gap-2">
              <span>🧪 Code Playground</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                SANDBOX
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Free experimentation space • Practice HTML, CSS & JS with zero constraints
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Selector */}
          <select
            onChange={handleTemplateChange}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                Template: {t.name}
              </option>
            ))}
          </select>

          {/* Clear Code */}
          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear all code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Copy Combined Code */}
          <button
            onClick={handleCopyCombined}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy combined project"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen sandbox'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Run Code Button */}
          <button
            onClick={executeCode}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN CODE</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Column: Code Editor */}
        <div className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl min-h-[420px]">
          {/* Editor Tab Switcher */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('html');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'html'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>index.html</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('css');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'css'
                    ? 'bg-blue-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>style.css</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('js');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'js'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>script.js</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              {activeTab === 'html' ? 'Markup' : activeTab === 'css' ? 'Styling' : 'Logic'}
            </span>
          </div>

          {/* Textarea Code Field */}
          <div className="relative flex-1 p-2 bg-[#050b18]">
            <textarea
              value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
              onChange={(e) => {
                if (activeTab === 'html') setHtml(e.target.value);
                else if (activeTab === 'css') setCss(e.target.value);
                else setJs(e.target.value);
              }}
              placeholder={`Write ${activeTab.toUpperCase()} code here...`}
              spellCheck={false}
              className="w-full h-full min-h-[360px] p-3 rounded-xl bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30"
            />
          </div>
        </div>

        {/* Right Column: Live Preview & Console Output */}
        <div className="flex flex-col gap-3 min-h-[420px]">
          {/* Live Preview Window */}
          <div className="flex-1 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl min-h-[280px]">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
                  Live Preview Output
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Isolated Sandbox</span>
            </div>

            <div className="flex-1 bg-white relative">
              <iframe
                ref={iframeRef}
                title="Playground Preview"
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full min-h-[260px] border-none"
              />
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="h-32 rounded-2xl bg-slate-950 border border-slate-800 p-3 flex flex-col overflow-hidden text-xs font-mono">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Console Telemetry</span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-[11px] text-slate-300">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No console logs output yet.</div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={log.startsWith('[ERR]') ? 'text-rose-400' : 'text-cyan-300'}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
