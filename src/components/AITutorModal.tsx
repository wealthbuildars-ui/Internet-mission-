import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, Lightbulb, HelpCircle, Code, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Mission, MissionCode } from '../types';
import { sound } from '../utils/sound';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission;
  userCode: MissionCode | string;
  currentMistake?: string;
  onApplySolution?: (code: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  isSolution?: boolean;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  mission,
  userCode,
  currentMistake,
  onApplySolution,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Greetings, recruit! I am your AI Mission Tutor. You're working on "${mission.title}". I see your current code. How can I guide you?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  React.useEffect(() => {
    const handleOn = () => setIsOnline(true);
    const handleOff = () => setIsOnline(false);
    window.addEventListener('online', handleOn);
    window.addEventListener('offline', handleOff);
    return () => {
      window.removeEventListener('online', handleOn);
      window.removeEventListener('offline', handleOff);
    };
  }, []);

  if (!isOpen) return null;

  const sendMessage = async (customPrompt?: string, wantsDirectSolution = false) => {
    const question = customPrompt || inputText.trim();
    if (!question && !wantsDirectSolution) return;

    sound.playClick();

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: wantsDirectSolution ? 'I give up, please show me the full solution.' : question,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');

    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor',
          text: `📡 OFFLINE: The AI Tutor requires an active internet connection to communicate with the neural models. Your 3 offline mission hints (HINT 1, HINT 2, HINT 3) and automatic code validation continue to work 100% offline!`,
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode,
          missionTitle: mission.title,
          missionGoal: mission.tryTask,
          missionConcept: mission.conceptShort,
          userQuestion: question,
          currentMistake,
          wantsSolution: wantsDirectSolution,
        }),
      });

      const data = await res.json();
      const tutorReply = data.advice || mission.hints[0];

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor',
          text: tutorReply,
          isSolution: wantsDirectSolution,
        },
      ]);
    } catch (err) {
      console.error('Failed to query tutor:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor',
          text: `📡 Connection unavailable: The AI Tutor could not be reached right now. Hint: "${mission.tryTask}". Review your opening and closing tags carefully!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] cyber-glow-cyan">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-cyan-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span>AI Tutor Station</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                    isOnline
                      ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
                      : 'bg-amber-950 border-amber-800 text-amber-300'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Patient coding mentor • Explains WHY without spoiling
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission Goal Tracker Strip */}
        <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-900/40 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-200">
            <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-cyan-400">Goal:</span>
            <span className="truncate max-w-[280px]">{mission.tryTask}</span>
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.isSolution && onApplySolution && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onApplySolution(mission.fullSolutionCode);
                      onClose();
                    }}
                    className="mt-2.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <span>Insert Code into Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs italic bg-slate-950/50 p-2.5 rounded-xl w-fit">
              <Bot className="w-4 h-4 animate-bounce" />
              <span>Analyzing your code and preparing step-by-step guidance...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap gap-1.5">
          <button
            onClick={() => sendMessage('Give me a small hint based on my code')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-900/60 text-[11px] font-medium transition-colors"
          >
            💡 Give a hint
          </button>

          <button
            onClick={() => sendMessage('Explain what is wrong with my current code')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-900/60 text-[11px] font-medium transition-colors"
          >
            🔍 Review my code
          </button>

          <button
            onClick={() => sendMessage('Explain why opening and closing tags matter')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-900/60 text-[11px] font-medium transition-colors hidden sm:inline-block"
          >
            📖 Explain syntax
          </button>

          {/* Reveal Full Answer Button (Only on learner's explicit demand) */}
          <button
            onClick={() => sendMessage(undefined, true)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-900/50 text-[11px] font-medium transition-colors ml-auto"
          >
            Show full answer
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-cyan-900/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your AI tutor a question about your code..."
            className="flex-1 bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
