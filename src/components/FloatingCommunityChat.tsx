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
  Move,
  GripVertical,
  ArrowLeftRight,
  SlidersHorizontal,
  Check,
  Compass,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useCommunityChat, CommunityMessage } from '../hooks/useCommunityChat';
import { sound } from '../utils/sound';

interface FloatingCommunityChatProps {
  profile: UserProfile | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ButtonPosition {
  x: number;
  y: number;
  dock?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'custom';
}

const STORAGE_KEY = 'im_community_btn_pos';
const COMPACT_KEY = 'im_community_btn_compact';

function getInitialPosition(): ButtonPosition {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0, dock: 'bottom-right' };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dock && ['bottom-right', 'bottom-left', 'top-left', 'top-right'].includes(parsed.dock)) {
        return { x: 0, y: 0, dock: parsed.dock };
      }
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number' && parsed.dock === 'custom') {
        const safeX = Math.min(Math.max(10, parsed.x), window.innerWidth - 80);
        const safeY = Math.min(Math.max(70, parsed.y), window.innerHeight - 80);
        return { x: safeX, y: safeY, dock: 'custom' };
      }
    }
  } catch {}

  // Default: Bottom-right corner (raised above Run button on mobile)
  return { x: 0, y: 0, dock: 'bottom-right' };
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

  // Position, dragging and compact mode states
  const [position, setPosition] = useState<ButtonPosition>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COMPACT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    moved: boolean;
  } | null>(null);

  // Keep inside screen bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const btnWidth = isCompact ? 56 : 180;
        const btnHeight = 56;
        const safeX = Math.min(Math.max(10, prev.x), Math.max(10, window.innerWidth - btnWidth - 10));
        const safeY = Math.min(Math.max(10, prev.y), Math.max(10, window.innerHeight - btnHeight - 10));
        return { ...prev, x: safeX, y: safeY };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCompact]);

  // Pointer drag events for smooth 60fps positioning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
      moved: false,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (!dragStartRef.current.moved && Math.hypot(dx, dy) > 6) {
      dragStartRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragStartRef.current.moved) {
      const btnWidth = buttonRef.current?.offsetWidth || (isCompact ? 56 : 180);
      const btnHeight = buttonRef.current?.offsetHeight || 56;
      const maxX = Math.max(10, window.innerWidth - btnWidth - 10);
      const maxY = Math.max(10, window.innerHeight - btnHeight - 10);

      const nextX = Math.min(Math.max(10, dragStartRef.current.initX + dx), maxX);
      const nextY = Math.min(Math.max(10, dragStartRef.current.initY + dy), maxY);

      setPosition({ x: nextX, y: nextY, dock: 'custom' });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasMoved = dragStartRef.current.moved;
    dragStartRef.current = null;

    if (wasMoved) {
      setIsDragging(false);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch {}
    } else {
      // It was a tap/click!
      handleOpen();
    }
  };

  const applyPreset = (preset: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'mid-left' | 'mid-right') => {
    sound.playClick();
    const btnWidth = isCompact ? 56 : 180;
    const btnHeight = 56;
    let nextX = 16;
    let nextY = window.innerHeight - btnHeight - 20;

    if (preset === 'bottom-left') {
      nextX = 16;
      nextY = window.innerHeight - btnHeight - 20;
    } else if (preset === 'bottom-right') {
      nextX = window.innerWidth - btnWidth - 16;
      nextY = window.innerHeight - btnHeight - 20;
    } else if (preset === 'top-left') {
      nextX = 16;
      nextY = 75;
    } else if (preset === 'top-right') {
      nextX = window.innerWidth - btnWidth - 16;
      nextY = 75;
    } else if (preset === 'mid-left') {
      nextX = 16;
      nextY = Math.max(75, window.innerHeight / 2 - 28);
    } else if (preset === 'mid-right') {
      nextX = window.innerWidth - btnWidth - 16;
      nextY = Math.max(75, window.innerHeight / 2 - 28);
    }

    const newPos: ButtonPosition = {
      x: Math.max(10, nextX),
      y: Math.max(10, nextY),
      dock: preset,
    };
    setPosition(newPos);
    setShowPositionMenu(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));
    } catch {}
  };

  const toggleCompact = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setIsCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COMPACT_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const isLeftSide = position.x < (typeof window !== 'undefined' ? window.innerWidth / 2 : 400);

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
        <div
          ref={buttonRef}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: 'none',
          }}
          className={`fixed top-0 left-0 z-[9999] select-none pointer-events-auto ${
            isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-transform duration-75'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Tooltip while dragging */}
          {isDragging && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-950/95 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-xl pointer-events-none animate-pulse flex items-center gap-1">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>Release to place here</span>
            </div>
          )}

          <div className="relative flex items-center gap-1.5">
            {/* The Main Action Button */}
            <div
              className={`group relative flex items-center ${
                isCompact ? 'p-3 rounded-full' : 'gap-2.5 px-3.5 sm:px-4 py-3 rounded-full'
              } bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right active:scale-95 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] border-2 border-cyan-300/90 transition-all duration-300 ${
                isDragging ? 'scale-105 shadow-[0_0_40px_rgba(6,182,212,0.8)] border-cyan-200 ring-2 ring-cyan-400' : ''
              }`}
              title="Click to open Live Community • Hold & drag anywhere to move!"
            >
              {/* Glowing Backdrop Ring */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse" />

              {/* Drag Grip indicator (Desktop/Tablet) */}
              <div className="relative text-cyan-200/60 group-hover:text-cyan-200 transition-colors pointer-events-none pr-0.5 hidden sm:block">
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* Big Speech Bubble Emoji 💬 */}
              <span className="text-2xl leading-none select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none">
                💬
              </span>

              {!isCompact && (
                <div className="flex flex-col text-left pointer-events-none pr-1">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-display font-black text-xs uppercase tracking-wider text-white drop-shadow">
                      Community
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 border border-emerald-500/60 text-[9px] text-emerald-300 font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{Math.max(1, onlineUsers.length)}</span>
                    </span>
                  </div>
                  <span className="text-[9px] text-cyan-100/90 font-semibold tracking-wide">
                    {onlineUsers.length > 1
                      ? `${onlineUsers.length} online`
                      : 'Chat live'}
                  </span>
                </div>
              )}

              {/* Compact mode online indicator */}
              {isCompact && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 pointer-events-none animate-ping" />
              )}

              {/* Unread Counter Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-1.5 min-w-[22px] h-5 px-1 rounded-full bg-rose-500 text-white font-display font-black text-[10px] flex items-center justify-center border-2 border-slate-950 shadow-lg animate-bounce pointer-events-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {/* Quick Position / Menu Pill Button */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                setShowPositionMenu(!showPositionMenu);
              }}
              className="p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/50 shadow-md transition-all active:scale-90 cursor-pointer"
              title="Change button position (e.g. Move to Bottom-Left away from Run button)"
            >
              <Move className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Position Docking Menu */}
          {showPositionMenu && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute z-[10000] p-3 w-60 rounded-2xl bg-slate-950/98 backdrop-blur-xl border border-cyan-500/50 shadow-2xl shadow-cyan-500/30 text-xs text-white space-y-2 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: isLeftSide ? '0' : 'auto',
                right: isLeftSide ? 'auto' : '0',
                top: position.y > (typeof window !== 'undefined' ? window.innerHeight - 250 : 400) ? 'auto' : '100%',
                bottom: position.y > (typeof window !== 'undefined' ? window.innerHeight - 250 : 400) ? '100%' : 'auto',
                marginBottom: position.y > (typeof window !== 'undefined' ? window.innerHeight - 250 : 400) ? '8px' : '0',
                marginTop: position.y > (typeof window !== 'undefined' ? window.innerHeight - 250 : 400) ? '0' : '8px',
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-display font-bold text-[11px] uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>💬 Position & Docking</span>
                </span>
                <button
                  onClick={() => setShowPositionMenu(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[10px] text-cyan-200/90 leading-tight bg-cyan-950/40 p-2 rounded-lg border border-cyan-900/50">
                💡 <strong>Bottom-Left</strong> is recommended while coding so the <strong>▶ RUN</strong> button is 100% unobstructed!
              </div>

              {/* Presets grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => applyPreset('bottom-left')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    position.dock === 'bottom-left'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>↙ Bottom-Left</span>
                  {position.dock === 'bottom-left' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('bottom-right')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    position.dock === 'bottom-right'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>↘ Bottom-Right</span>
                  {position.dock === 'bottom-right' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('top-left')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    position.dock === 'top-left'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>↖ Top-Left</span>
                  {position.dock === 'top-left' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('top-right')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    position.dock === 'top-right'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>↗ Top-Right</span>
                  {position.dock === 'top-right' && <Check className="w-3 h-3 text-cyan-400" />}
                </button>
              </div>

              {/* Compact mode toggle */}
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-medium">Mini Bubble Mode:</span>
                <button
                  type="button"
                  onClick={toggleCompact}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    isCompact
                      ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {isCompact ? 'Small Bubble ✓' : 'Full Pill'}
                </button>
              </div>

              <div className="text-[9px] text-slate-400 italic text-center pt-0.5">
                🖐️ Or hold & drag the button anywhere!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Window (when open) */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all duration-200 ${
            isExpanded
              ? 'inset-2 sm:inset-6 max-w-4xl mx-auto'
              : isLeftSide
              ? 'bottom-3 left-3 sm:bottom-6 sm:left-6 w-[calc(100vw-24px)] sm:w-[420px] h-[580px] max-h-[85vh]'
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
            <div className="flex items-center gap-1 relative">
              {/* Reposition button inside chat window */}
              <button
                type="button"
                onClick={() => setShowPositionMenu(!showPositionMenu)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                  showPositionMenu ? 'text-cyan-400 border border-cyan-500/60' : ''
                }`}
                title="Change floating button position (e.g. Move to Bottom-Left)"
              >
                <Move className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Position</span>
              </button>

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

          {/* Quick Position Docking Dialog inside Chat Header if opened */}
          {showPositionMenu && (
            <div className="p-3 bg-slate-900 border-b border-cyan-500/40 text-xs animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-xs uppercase text-cyan-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Choose Button Direction:</span>
                </span>
                <button
                  onClick={() => setShowPositionMenu(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Done
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <button
                  onClick={() => applyPreset('bottom-left')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                    position.dock === 'bottom-left'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>↙ Bottom-Left</div>
                  <div className="text-[9px] text-emerald-400 font-normal">Frees Run button</div>
                </button>
                <button
                  onClick={() => applyPreset('bottom-right')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                    position.dock === 'bottom-right'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>↘ Bottom-Right</div>
                  <div className="text-[9px] text-slate-500 font-normal">Default corner</div>
                </button>
                <button
                  onClick={() => applyPreset('top-left')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                    position.dock === 'top-left'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>↖ Top-Left</div>
                  <div className="text-[9px] text-slate-500 font-normal">Top bar</div>
                </button>
                <button
                  onClick={() => applyPreset('top-right')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                    position.dock === 'top-right'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>↗ Top-Right</div>
                  <div className="text-[9px] text-slate-500 font-normal">Header edge</div>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                <span>Or touch & drag the 💬 button anywhere when closed</span>
                <button
                  onClick={toggleCompact}
                  className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-bold"
                >
                  {isCompact ? 'Small Bubble Mode' : 'Full Pill Mode'}
                </button>
              </div>
            </div>
          )}

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
