import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Bot,
  Lightbulb,
  FileCode,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CodeLanguage, MissionCode } from '../types';
import { normalizeMissionCode } from '../utils/domValidator';
import { sound } from '../utils/sound';

interface CodeEditorProps {
  code: MissionCode | string;
  onChange: (newCode: MissionCode) => void;
  onRunCode: () => void;
  onResetCode: () => void;
  onClearCode?: () => void;
  onOpenAITutor: () => void;
  onToggleHint?: () => void;
  hintLevel?: number;
  availableLanguages?: CodeLanguage[];
  defaultLanguage?: CodeLanguage;
  isRunning?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRunCode,
  onResetCode,
  onClearCode,
  onOpenAITutor,
  onToggleHint,
  hintLevel = 0,
  availableLanguages = ['html'],
  defaultLanguage,
  isRunning = false,
}) => {
  const normalizedCode = normalizeMissionCode(code);
  const [activeTab, setActiveTab] = useState<CodeLanguage>(() => {
    if (defaultLanguage && availableLanguages.includes(defaultLanguage)) {
      return defaultLanguage;
    }
    return availableLanguages[0] || 'html';
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If availableLanguages or defaultLanguage changes, ensure active tab is synced
  useEffect(() => {
    if (defaultLanguage && availableLanguages.includes(defaultLanguage)) {
      setActiveTab(defaultLanguage);
    } else if (!availableLanguages.includes(activeTab)) {
      setActiveTab(availableLanguages[0] || 'html');
    }
  }, [availableLanguages, defaultLanguage]);

  // Current tab code
  const currentCode =
    activeTab === 'html'
      ? normalizedCode.html
      : activeTab === 'css'
      ? normalizedCode.css
      : normalizedCode.js;

  const handleTextChange = (text: string) => {
    const updated: MissionCode = {
      ...normalizedCode,
      [activeTab === 'javascript' ? 'js' : activeTab]: text,
    };
    onChange(updated);
  };

  // Helper key inserter for comfortable mobile / Android typing
  const insertSnippet = (snippet: string) => {
    sound.playClick();
    if (!textareaRef.current) {
      handleTextChange(currentCode + snippet);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      currentCode.substring(0, start) + snippet + currentCode.substring(end);
    handleTextChange(newText);

    // Restore cursor position inside or after inserted snippet
    setTimeout(() => {
      textarea.focus();
      let offset = snippet.length;
      if (snippet === '<>' || snippet === '</>' || snippet === '""' || snippet === "''" || snippet === '()' || snippet === '{}') {
        offset = 1;
      } else if (snippet.startsWith('<') && snippet.endsWith('>') && snippet.includes('</')) {
        const firstClose = snippet.indexOf('>');
        offset = firstClose + 1;
      }
      textarea.setSelectionRange(start + offset, start + offset);
    }, 10);
  };

  // Tab-specific shortcuts tailored for speed on touch devices
  const htmlShortcuts = [
    { label: '< >', insert: '<>' },
    { label: '</ >', insert: '</>' },
    { label: '<', insert: '<' },
    { label: '>', insert: '>' },
    { label: '/', insert: '/' },
    { label: '"', insert: '""' },
    { label: '=', insert: '="' },
    { label: 'h1', insert: '<h1></h1>' },
    { label: 'p', insert: '<p></p>' },
    { label: 'button', insert: '<button></button>' },
    { label: 'div', insert: '<div class=""></div>' },
    { label: 'class', insert: 'class=""' },
    { label: 'id', insert: 'id=""' },
  ];

  const cssShortcuts = [
    { label: '{ }', insert: ' {\n  \n}' },
    { label: ':', insert: ': ' },
    { label: ';', insert: ';' },
    { label: '.', insert: '.' },
    { label: '#', insert: '#' },
    { label: 'px', insert: 'px' },
    { label: 'color', insert: 'color: ' },
    { label: 'bg', insert: 'background-color: ' },
    { label: 'font-size', insert: 'font-size: ' },
    { label: 'border', insert: 'border: ' },
    { label: 'padding', insert: 'padding: ' },
  ];

  const jsShortcuts = [
    { label: '( )', insert: '()' },
    { label: '{ }', insert: ' {\n  \n}' },
    { label: ';', insert: ';' },
    { label: '=>', insert: ' => ' },
    { label: '=', insert: ' = ' },
    { label: '===', insert: ' === ' },
    { label: "' '", insert: "''" },
    { label: 'document', insert: 'document.' },
    { label: 'getElementById', insert: "getElementById('')" },
    { label: 'querySelector', insert: "querySelector('')" },
    { label: 'addEventListener', insert: "addEventListener('click', () => {\n  \n})" },
    { label: 'textContent', insert: "textContent = ''" },
  ];

  const activeShortcuts =
    activeTab === 'html'
      ? htmlShortcuts
      : activeTab === 'css'
      ? cssShortcuts
      : jsShortcuts;

  const lineCount = Math.max(currentCode.split('\n').length, 6);

  // Tab labels and styling
  const tabIcons: Record<CodeLanguage, React.ReactNode> = {
    html: <FileCode className="w-3.5 h-3.5 text-orange-400" />,
    css: <Layers className="w-3.5 h-3.5 text-cyan-400" />,
    javascript: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  };

  const tabLabels: Record<CodeLanguage, string> = {
    html: 'HTML',
    css: 'CSS',
    javascript: 'JAVASCRIPT',
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-cyan-900/50 bg-slate-950 shadow-xl">
      {/* Code Editor Header & Language Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-cyan-950/70 select-none">
        {/* Dynamic Tabs — ONLY show languages needed for this mission */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {availableLanguages.map((lang) => {
            const isActive = activeTab === lang;
            return (
              <button
                key={lang}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(lang);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tabIcons[lang]}
                <span>{tabLabels[lang]}</span>
                {defaultLanguage === lang && availableLanguages.length > 1 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1 ${
                    isActive ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}>
                    Code Here
                  </span>
                )}
                {isActive && defaultLanguage !== lang && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action icons (Reset & Hint) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onResetCode();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Reset code to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Text Area with Line Numbers */}
      <div className="relative flex-1 flex bg-[#030712] font-code text-xs sm:text-sm min-h-[200px]">
        {/* Line Numbers */}
        <div className="select-none py-3 px-2 text-right text-slate-700 bg-slate-950/70 border-r border-slate-900 text-xs font-mono w-9 sm:w-11 shrink-0">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={currentCode}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={
            activeTab === 'html'
              ? '<!-- Write your HTML code here -->'
              : activeTab === 'css'
              ? '/* Write your CSS rules here */'
              : '// Write your JavaScript code here'
          }
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 w-full bg-transparent text-slate-100 p-3 leading-6 resize-none outline-none font-code text-xs sm:text-sm focus:ring-1 focus:ring-cyan-500/20 selection:bg-cyan-500/30 selection:text-white"
        />
      </div>

      {/* Android / Mobile Keyboard Shortcuts Bar */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950/90 border-t border-slate-900 overflow-x-auto scrollbar-none select-none">
        <span className="text-[10px] uppercase font-bold text-slate-500 px-1 shrink-0 hidden sm:inline">
          {tabLabels[activeTab]} Keys:
        </span>
        {activeShortcuts.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => insertSnippet(item.insert)}
            className="shrink-0 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-code font-medium active:scale-95 transition-transform cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Action Footer: [▶ RUN] [↻ RESET] [💡 HINT] [🤖 ASK AI] */}
      <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-900/95 border-t border-cyan-950/60 gap-2">
        <div className="flex items-center gap-2">
          {/* 💡 HINT Button */}
          {onToggleHint && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleHint();
              }}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-950/40 text-amber-300 border border-amber-800/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{hintLevel > 0 ? `Hint ${hintLevel}/3` : 'Hint'}</span>
            </button>
          )}

          {/* 🤖 ASK AI Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAITutor();
            }}
            className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask AI</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* ↻ RESET Button */}
          <button
            onClick={() => {
              sound.playClick();
              onResetCode();
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* ▶ RUN Primary Button */}
          <button
            onClick={() => {
              sound.playClick();
              onRunCode();
            }}
            disabled={isRunning}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RUN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
