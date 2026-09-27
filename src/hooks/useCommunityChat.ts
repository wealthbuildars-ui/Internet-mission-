import { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';
import { getLevelInfo } from '../data/levels';

export interface CommunityUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  lastActive?: number;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  text: string;
  timestamp: number;
  reactions?: Record<string, string[]>;
}

function getEffectiveUser(profile: UserProfile | null) {
  if (profile) {
    const levelInfo = getLevelInfo(profile.xp);
    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar || '👨‍🚀',
      level: levelInfo.currentLevel.level,
      xp: profile.xp,
    };
  }

  let guestId = 'cadet-guest';
  try {
    const stored = sessionStorage.getItem('im_guest_user_id');
    if (stored) {
      guestId = stored;
    } else {
      guestId = 'cadet-' + Math.random().toString(36).substring(2, 6);
      sessionStorage.setItem('im_guest_user_id', guestId);
    }
  } catch {}

  return {
    id: guestId,
    name: 'New Cadet',
    username: guestId,
    avatar: '👨‍🚀',
    level: 1,
    xp: 0,
  };
}

export function useCommunityChat(profile: UserProfile | null) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<CommunityUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const typingTimerRef = useRef<Record<string, any>>({});
  const isMountedRef = useRef(true);

  const currentUser = getEffectiveUser(profile);

  // Connect WebSocket
  const connectSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/community`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);

        // Send identity packet
        ws.send(
          JSON.stringify({
            type: 'join',
            user: currentUser,
          })
        );
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'init') {
            if (Array.isArray(data.messages)) {
              setMessages(data.messages);
            }
            if (Array.isArray(data.onlineUsers)) {
              setOnlineUsers(data.onlineUsers);
            }
          } else if (data.type === 'presence') {
            if (Array.isArray(data.onlineUsers)) {
              setOnlineUsers(data.onlineUsers);
            }
          } else if (data.type === 'message' && data.message) {
            setMessages((prev) => {
              // Deduplicate
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            // If sender is not ourselves, increment unread
            if (data.message.username !== currentUser.username) {
              setUnreadCount((c) => c + 1);
            }
          } else if (data.type === 'reaction' && data.messageId) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.messageId
                  ? { ...msg, reactions: data.reactions }
                  : msg
              )
            );
          } else if (data.type === 'typing' && data.username) {
            const { username, isTyping } = data;
            if (username === currentUser.username) return;

            if (isTyping) {
              setTypingUsers((prev) =>
                prev.includes(username) ? prev : [...prev, username]
              );
              // Clear previous auto-removal
              if (typingTimerRef.current[username]) {
                clearTimeout(typingTimerRef.current[username]);
              }
              typingTimerRef.current[username] = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((u) => u !== username));
              }, 3000);
            } else {
              setTypingUsers((prev) => prev.filter((u) => u !== username));
            }
          }
        } catch (e) {
          console.warn('Community message parse error:', e);
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        // Schedule reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setIsConnected(false);
    }
  }, [currentUser.username, currentUser.id, currentUser.name, currentUser.level, currentUser.xp]);

  useEffect(() => {
    isMountedRef.current = true;
    connectSocket();

    // Fallback initial poll
    fetch('/api/community/messages')
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => (prev.length === 0 ? data.messages : prev));
        }
      })
      .catch(() => {});

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  // Send message
  const sendMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'message', text: clean }));
      } else {
        // Fallback HTTP POST
        fetch('/api/community/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: currentUser,
            text: clean,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              setMessages((prev) => [...prev, data.message]);
            }
          })
          .catch(() => {});
      }
    },
    [currentUser]
  );

  // Send reaction
  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'reaction', messageId, emoji }));
    }
  }, []);

  // Broadcast typing
  const sendTyping = useCallback((isTyping: boolean) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing', isTyping }));
    }
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    unreadCount,
    sendMessage,
    toggleReaction,
    sendTyping,
    clearUnread,
  };
}
