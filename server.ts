import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '60mb' }));

  // Initialize Gemini client with aistudio-build User-Agent
  const apiKey = process.env.GEMINI_API_KEY || '';
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // AI Tutor endpoint
  app.post('/api/tutor', async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        userCode = '',
        missionTitle = '',
        missionGoal = '',
        missionConcept = '',
        userQuestion = '',
        currentMistake = '',
        wantsSolution = false,
      } = req.body;

      let formattedCode = '';
      if (typeof userCode === 'string') {
        formattedCode = userCode || '/* editor is currently blank */';
      } else if (typeof userCode === 'object' && userCode !== null) {
        formattedCode = `HTML:\n${userCode.html || ''}\n\nCSS:\n${userCode.css || ''}\n\nJAVASCRIPT:\n${userCode.js || ''}`.trim() || '/* editor is currently blank */';
      }

      // If no API key configured, provide a smart fallback hint
      if (!ai || !apiKey) {
        let fallbackMessage = `Almost there! Take a close look at your code. Remember the mission goal is: "${missionGoal}".`;
        if (currentMistake) {
          fallbackMessage = `${currentMistake} Check your code and try running it again!`;
        }
        if (wantsSolution) {
          fallbackMessage = `Keep experimenting! Goal: ${missionGoal}. Review your syntax carefully.`;
        }
        res.json({ advice: fallbackMessage });
        return;
      }

      const prompt = `
Mission: ${missionTitle}
Concept: ${missionConcept}
Goal: ${missionGoal}

Learner's current typed code:
\`\`\`
${formattedCode}
\`\`\`

Detected validation error or mistake: ${currentMistake || 'None detected yet or learner is asking for guidance'}
Learner's question / request: "${userQuestion || 'Please give me a helpful hint on how to solve this'}"
Wants direct full answer: ${wantsSolution ? 'YES' : 'NO'}

Analyze the learner's actual code above and provide encouraging guidance.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are the patient AI Tutor inside "Internet Mission", a gamified web coding academy for beginners.
Your goal is to guide learners to discover the answer themselves without handing them the solution right away.

STRICT PEDAGOGICAL RULES:
1. Never insult or speak down to the learner. Always encourage them.
2. Keep explanations very short: 2 to 3 sentences maximum. Beginners get overwhelmed by walls of text.
3. Use beginner-friendly language (e.g. "opening tag", "closing tag", "content inside").
4. If "Wants direct full answer" is NO:
   - Identify what they did right first.
   - Look directly at their actual code and explain WHY something is wrong (e.g. "You opened <h1>, but forgot the slash in the closing </h1> tag").
   - Give 1 actionable step to fix it, and encourage them to try again.
5. If "Wants direct full answer" is YES:
   - Provide the exact code solution and explain the key syntax in 1 short sentence.
6. Tone: Warm, encouraging futuristic coding mentor / mission guide.`,
          temperature: 0.6,
        },
      });

      const advice = response.text || 'Keep going! Check your opening and closing tags.';
      res.json({ advice });
    } catch (err: any) {
      console.error('Tutor API error:', err);
      res.status(500).json({
        error: 'Failed to contact AI tutor',
        fallback: 'Take a close look at your tags and make sure all opening tags <...> have matching closing tags </...>.',
      });
    }
  });

  // Custom game theme upload endpoint
  app.post('/api/upload-theme', (req: Request, res: Response): void => {
    try {
      const { audioData } = req.body;
      if (!audioData) {
        res.status(400).json({ error: 'No audio data provided' });
        return;
      }

      const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const targetPath = path.resolve(__dirname, 'public', 'game-theme.mp3');
      fs.writeFileSync(targetPath, buffer);

      try {
        const distDir = path.resolve(__dirname, 'dist');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.resolve(distDir, 'game-theme.mp3'), buffer);
        }
      } catch {}

      res.json({ success: true, url: '/game-theme.mp3' });
    } catch (err: any) {
      console.error('Failed to save game theme:', err);
      res.status(500).json({ error: 'Failed to save theme' });
    }
  });

  // Direct route for game theme
  app.get('/game-theme.mp3', (_req: Request, res: Response): void => {
    const targetPath = path.resolve(__dirname, 'public', 'game-theme.mp3');
    if (fs.existsSync(targetPath)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.sendFile(targetPath);
    } else {
      res.status(404).send('Not found');
    }
  });

  // Direct route for source code download (for GitHub deployment)
  app.get('/api/download-source', (_req: Request, res: Response): void => {
    const zipPath = path.resolve(__dirname, 'public', 'internet-mission-source.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'internet-mission-source.zip');
    } else {
      res.status(404).send('Source zip not found');
    }
  });

  // Community Real-Time Data Types & State
  interface CommunityUser {
    id: string;
    name: string;
    username: string;
    avatar: string;
    level: number;
    xp: number;
    lastActive: number;
  }

  interface CommunityMessage {
    id: string;
    userId: string;
    name: string;
    username: string;
    avatar: string;
    level: number;
    text: string;
    timestamp: number;
    reactions: Record<string, string[]>;
  }

  const communityMessages: CommunityMessage[] = [
    {
      id: 'msg-welcome-1',
      userId: 'system-agent',
      name: 'Internet Mission HQ',
      username: 'hq',
      avatar: '🤖',
      level: 10,
      text: '🚀 Welcome to the Internet Mission live community! Chat in real-time, get advice, and share your project wins with learners everywhere.',
      timestamp: Date.now() - 3600000,
      reactions: { '🚀': ['hq'], '🔥': ['hq'] },
    },
    {
      id: 'msg-welcome-2',
      userId: 'mentor-chizi',
      name: 'Chizi Wave',
      username: 'chiziwave',
      avatar: '⚡',
      level: 8,
      text: "Welcome cadets! Remember: every bug is just a puzzle waiting to be solved. If you need help with tags, CSS flex, or JS functions, just ask!",
      timestamp: Date.now() - 1800000,
      reactions: { '💡': ['hq', 'chiziwave'], '👏': ['chiziwave'] },
    },
  ];

  // Create HTTP server wrapping Express
  const server = http.createServer(app);

  // WebSocket Server for Real-Time Community Chat & Active Presence
  const wss = new WebSocketServer({ server, path: '/ws/community' });
  const connectedClients = new Map<WebSocket, CommunityUser>();

  function broadcast(payload: any) {
    const data = JSON.stringify(payload);
    for (const [clientWs] of connectedClients) {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    }
  }

  function getOnlineUsersList(): CommunityUser[] {
    const uniqueUsers = new Map<string, CommunityUser>();
    for (const user of connectedClients.values()) {
      uniqueUsers.set(user.username, user);
    }
    return Array.from(uniqueUsers.values());
  }

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === 'join' && data.user) {
          const user: CommunityUser = {
            id: data.user.id || 'usr-' + Math.random().toString(36).substring(2, 7),
            name: data.user.name || 'Cadet',
            username: data.user.username || 'cadet',
            avatar: data.user.avatar || '👤',
            level: data.user.level || 1,
            xp: data.user.xp || 0,
            lastActive: Date.now(),
          };
          connectedClients.set(ws, user);

          // Send initial state to the connected user
          ws.send(
            JSON.stringify({
              type: 'init',
              messages: communityMessages.slice(-60),
              onlineUsers: getOnlineUsersList(),
            })
          );

          // Broadcast updated presence to all clients
          broadcast({
            type: 'presence',
            onlineUsers: getOnlineUsersList(),
          });
        } else if (data.type === 'message' && typeof data.text === 'string') {
          const sender = connectedClients.get(ws);
          if (!sender) return;
          const cleanText = data.text.trim();
          if (!cleanText || cleanText.length > 500) return;

          const newMsg: CommunityMessage = {
            id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            userId: sender.id,
            name: sender.name,
            username: sender.username,
            avatar: sender.avatar,
            level: sender.level,
            text: cleanText,
            timestamp: Date.now(),
            reactions: {},
          };

          communityMessages.push(newMsg);
          if (communityMessages.length > 200) {
            communityMessages.shift();
          }

          broadcast({
            type: 'message',
            message: newMsg,
          });
        } else if (data.type === 'reaction' && data.messageId && data.emoji) {
          const sender = connectedClients.get(ws);
          if (!sender) return;
          const targetMsg = communityMessages.find((m) => m.id === data.messageId);
          if (targetMsg) {
            if (!targetMsg.reactions) targetMsg.reactions = {};
            const list = targetMsg.reactions[data.emoji] || [];
            const idx = list.indexOf(sender.username);
            if (idx >= 0) {
              list.splice(idx, 1);
              if (list.length === 0) delete targetMsg.reactions[data.emoji];
            } else {
              list.push(sender.username);
              targetMsg.reactions[data.emoji] = list;
            }

            broadcast({
              type: 'reaction',
              messageId: targetMsg.id,
              reactions: targetMsg.reactions,
            });
          }
        } else if (data.type === 'typing') {
          const sender = connectedClients.get(ws);
          if (sender) {
            for (const [clientWs] of connectedClients) {
              if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: 'typing',
                    username: sender.username,
                    isTyping: !!data.isTyping,
                  })
                );
              }
            }
          }
        }
      } catch (err) {
        console.error('WebSocket message handling error:', err);
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
      broadcast({
        type: 'presence',
        onlineUsers: getOnlineUsersList(),
      });
    });

    ws.on('error', () => {
      connectedClients.delete(ws);
    });
  });

  // REST Fallback endpoints for community
  app.get('/api/community/messages', (_req: Request, res: Response) => {
    res.json({
      messages: communityMessages.slice(-60),
      onlineCount: getOnlineUsersList().length,
    });
  });

  app.get('/api/community/online', (_req: Request, res: Response) => {
    res.json({
      onlineUsers: getOnlineUsersList(),
      count: getOnlineUsersList().length,
    });
  });

  app.post('/api/community/messages', (req: Request, res: Response) => {
    const { user, text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Message text required' });
      return;
    }
    const cleanText = text.trim().slice(0, 500);
    const newMsg: CommunityMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: user?.id || 'anon',
      name: user?.name || 'Anonymous Cadet',
      username: user?.username || 'cadet',
      avatar: user?.avatar || '👤',
      level: user?.level || 1,
      text: cleanText,
      timestamp: Date.now(),
      reactions: {},
    };
    communityMessages.push(newMsg);
    if (communityMessages.length > 200) {
      communityMessages.shift();
    }
    broadcast({ type: 'message', message: newMsg });
    res.json({ success: true, message: newMsg });
  });

  // Vite middlewares or static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Internet Mission server with WebSocket listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
