import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Users,
  Smile,
  Flame,
  Rocket,
  Heart,
  Lightbulb,
  ThumbsUp,
  Sparkles,
  Wifi,
  WifiOff,
  ChevronDown,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useCommunityChat, CommunityMessage } from '../hooks/useCommunityChat';
import { sound } from '../utils/sound';

interface FloatingCommunityChatProps {
  profile: UserProfile | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QUICK_EMOJIS = ['🔥', '🚀', '❤️', '💡', '👏'];
const QUICK_PROMPTS = [
  '🙌 Hello cadets!',
  '💡 Need help with HTML tags',
  '🚀 Just passed a mission!',
  '🎉 Coding my first website',
];

export const FloatingCommunityChat: React.FC<FloatingCommunityChatProps> = ({
  profile,
  isOpen: externalIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'online'>('chat');
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    unreadCount,
    sendMessage,
    toggleReaction,
    sendTyping,
    clearUnread,
  } = useCommunityChat(profile);

  const currentUsername = profile?.username || '';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      clearUnread();
    }
  }, [messages, isOpen, clearUnread]);

  // Handle opening
  const handleOpen = () => {
    sound.playClick();
    setIsOpen(true);
    clearUnread();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  // Handle closing
  const handleClose = () => {
    sound.playClick();
    setIsOpen(false);
  };

  // Handle text input and typing broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  // Send message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    sound.playClick();
    sendMessage(trimmed);
    setInputText('');
    sendTyping(false);
    setShowEmojiPicker(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    sound.playClick();
    sendMessage(prompt);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Floating Trigger Button (when chat is closed) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-[9999] sm:bottom-6 sm:right-6 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <button
            onClick={handleOpen}
            className="group relative flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right hover:scale-105 active:scale-95 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] border-2 border-cyan-300/80 transition-all duration-300 cursor-pointer"
            title="Open Live Community (Chat & Active Learners)"
          >
            {/* Glowing Backdrop Ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse" />

            <div className="relative flex items-center gap-2.5">
              {/* Big Speech Bubble Emoji 💬 */}
              <span className="text-2xl sm:text-3xl leading-none select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-bounce" style={{ animationDuration: '2s' }}>
                💬
              </span>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white drop-shadow">
                    Community
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 border border-emerald-500/60 text-[10px] text-emerald-300 font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{Math.max(1, onlineUsers.length)}</span>
                  </span>
                </div>
                <span className="text-[10px] text-cyan-100/90 font-semibold tracking-wide">
                  {onlineUsers.length > 1
                    ? `${onlineUsers.length} active online`
                    : 'Chat live with cadets'}
                </span>
              </div>
            </div>

            {/* Unread Counter Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 rounded-full bg-rose-500 text-white font-display font-black text-xs flex items-center justify-center border-2 border-slate-950 shadow-lg animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Floating Chat Window (when open) */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all duration-200 ${
            isExpanded
              ? 'inset-2 sm:inset-6 max-w-4xl mx-auto'
              : 'bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-24px)] sm:w-[420px] h-[580px] max-h-[85vh]'
          } rounded-3xl bg-slate-950/98 backdrop-blur-2xl border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                    Live Community
                  </h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{Math.max(1, onlineUsers.length)} Online</span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {isConnected ? (
                    <span className="text-cyan-400/90 flex items-center gap-1">
                      <Wifi className="w-2.5 h-2.5" /> Real-time active
                    </span>
                  ) : (
                    <span className="text-amber-400/90 flex items-center gap-1">
                      <WifiOff className="w-2.5 h-2.5" /> Reconnecting...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Restore Size' : 'Maximize'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                title="Close Community Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center border-b border-slate-800/80 bg-slate-900/60 p-1 shrink-0 text-xs font-display font-bold">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('chat');
              }}
              className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>💬 Live Chat ({messages.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('online');
              }}
              className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'online'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Online ({Math.max(1, onlineUsers.length)})</span>
            </button>
          </div>

          {/* TAB 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-sans">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-cyan-400/40 animate-bounce" />
                    <p className="text-xs font-semibold text-slate-300">
                      No messages yet!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Say hello to fellow learners or ask any question.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = !!currentUsername && msg.username === currentUsername;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isOwnMessage ? 'items-end' : 'items-start'
                        }`}
                      >
                        {/* Header: Name, level, time */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                          <span className="text-base leading-none">
                            {msg.avatar || '👨‍🚀'}
                          </span>
                          <span
                            className={`font-semibold ${
                              isOwnMessage ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                          >
                            {msg.name}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-bold">
                            LVL {msg.level || 1}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-md ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Reactions Bar */}
                        <div className="flex flex-wrap items-center gap-1 mt-1 px-1">
                          {msg.reactions &&
                            Object.entries(msg.reactions).map(
                              ([emoji, users]) => {
                                const hasReacted =
                                  !!currentUsername &&
                                  users.includes(currentUsername);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      sound.playClick();
                                      toggleReaction(msg.id, emoji);
                                    }}
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
                                      hasReacted
                                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="font-bold">{users.length}</span>
                                  </button>
                                );
                              }
                            )}

                          {/* Quick React Button */}
                          <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                            {QUICK_EMOJIS.slice(0, 3).map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  sound.playClick();
                                  toggleReaction(msg.id, emoji);
                                }}
                                className="p-1 rounded text-[11px] hover:scale-125 transition-transform cursor-pointer"
                                title={`React with ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-1 text-[11px] text-cyan-400/80 bg-slate-950/60 border-t border-slate-900 italic flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-200" />
                  </span>
                  <span>{typingUsers.join(', ')} is typing...</span>
                </div>
              )}

              {/* Quick Prompt Chips */}
              <div className="px-3 py-1.5 bg-slate-900/50 border-t border-slate-850 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="shrink-0 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700/60 text-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Drop a message to the community..."
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    title="Quick Emojis"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-around">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE ONLINE LEARNERS */}
          {activeTab === 'online' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 leading-relaxed">
                <span className="font-bold text-white">Active Learners:</span>{' '}
                These cadets are currently online coding missions or building websites right now.
              </div>

              <div className="space-y-2">
                {onlineUsers.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Scanning active signals...
                  </div>
                ) : (
                  onlineUsers.map((user) => {
                    const isSelf = !!currentUsername && user.username === currentUsername;
                    return (
                      <div
                        key={user.id || user.username}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isSelf
                            ? 'bg-cyan-950/50 border-cyan-500/60 shadow-sm shadow-cyan-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative text-2xl">
                            {user.avatar || '👨‍🚀'}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-display font-bold text-xs text-white">
                                {user.name}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              @{user.username}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-display font-bold text-cyan-300 border border-slate-700">
                            LVL {user.level || 1}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {user.xp || 0} XP
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Community Culture Footer */}
              <div className="pt-2 text-center text-[10px] text-slate-500">
                ✨ Internet Mission Community • Friendly, helpful, coding together
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
