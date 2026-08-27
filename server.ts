import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Store multiplayer rooms
interface RoomPlayer {
  ws: WebSocket;
  character: 'AETHER' | 'CHRONO';
  connectedAt: number;
}

interface RoomState {
  code: string;
  p1?: RoomPlayer;
  p2?: RoomPlayer;
  chapter: number;
  puzzleIndex: number;
  gameState: any; // Authoritative game state (positions, levers, platforms)
  createdAt: number;
}

const rooms = new Map<string, RoomState>();

// Helper to generate 6-character room codes
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Clean up stale rooms older than 4 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > 4 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000);

// API Route: AI Story Companion & Puzzle Hint
app.post('/api/hint', async (req, res) => {
  try {
    const { chapterTitle, puzzleDescription, p1Ability, p2Ability, lang = 'fa' } = req.body;

    if (!ai) {
      return res.json({
        hint: lang === 'fa' 
          ? 'پیشگوی معبد: برای حل این معما، یک نفر باید اهرم نور را نگه دارد و دیگری با کنترل زمان سکو را ثابت کند!'
          : 'Temple Oracle: One player must hold the light lever while the other freezes time to lock the platform!'
      });
    }

    const prompt = lang === 'fa'
      ? `شما "کتاب جادویی دلدار (Dr. Love Book)" هستید در یک بازی ۳بعدی داستانی، رمانتیک و چالشی دو‌نفره به نام "رز و آریا: پیوند عروسک‌های چوبی" (مشابه It Takes Two).
دو شخصیت اصلی (رز: عروسک چوبی با نماد قلب سرخ و شلاق گل رز، و آریا: عروسک چوبی کوکی با کلید برنجی و کنترل زمان) در مرحله زیر در اتاق کاری‌شان گیر کرده‌اند:
نام فصل: ${chapterTitle || 'کارگاه عروسک‌سازی و ساعت قلب‌شکل'}
توضیح معما: ${puzzleDescription || 'سکوهای کتابی، چرخ‌دنده‌های خاموش و اهرم‌های جفت'}
توانایی رز: ${p1Ability || 'شلاق رز و آهنربای عشق'}
توانایی آریا: ${p2Ability || 'انجماد زمان و کوک برنجی'}

لطفاً یک راهنمایی بسیار رمانتیک، شیرین، انگیزشی و هوشمندانه در قالب ۲ تا ۳ جمله به زبان فارسی بدهید تا این زوج یاد بگیرند چطور با عشق، فداکاری و هماهنگی معما را حل کنند. پاسخ را مستقیماً بگویید بدون هیچ مقدمه اضافه.`
      : `You are the "Magical Book of Love" in a 3D co-op romantic puzzle adventure game named "Rose & Arya: Wooden Hearts" (like It Takes Two).
Two wooden dolls (Rose: wooden doll with rose whip & heart magnet, Arya: clockwork doll with time freeze & brass key) are stuck in their workshop room puzzle:
Chapter: ${chapterTitle || 'The Workshop & Heart Clock'}
Puzzle Description: ${puzzleDescription || 'Stacked storybooks, silent gears, dual levers'}
Rose's Ability: ${p1Ability || 'Rose Whip & Heart Magnet'}
Arya's Ability: ${p2Ability || 'Time Freeze & Clockwork Key'}

Please give a warm, romantic, encouraging, and clever 2-3 sentence hint guiding them to cooperate and overcome the puzzle together with love. Direct answer only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const hintText = response.text || (lang === 'fa' 
      ? 'نور و زمان باید همگام شوند! یکی راه را باز می‌کند و دیگری لحظه را منجمد می‌سازد.'
      : 'Light and time must sync! One opens the path while the other freezes the moment.');

    return res.json({ hint: hintText });
  } catch (err: any) {
    console.error('Gemini Hint Error:', err);
    return res.json({
      hint: req.body?.lang === 'fa'
        ? 'پیشگوی معبد: همزمانی کلید شماست! هر دو اهرم را ظرف ۰.۵ ثانیه از یکدیگر فشار دهید.'
        : 'Temple Oracle: Synchronization is key! Press both levers within 0.5s of each other.'
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomCode: string | null = null;
  let playerRole: 'AETHER' | 'CHRONO' | null = null;

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data.toString());
      const { type, payload } = message;

      switch (type) {
        case 'CREATE_ROOM': {
          let code = generateRoomCode();
          while (rooms.has(code)) {
            code = generateRoomCode();
          }
          const chosenCharacter = payload?.character || 'AETHER';
          const newRoom: RoomState = {
            code,
            chapter: 1,
            puzzleIndex: 0,
            gameState: null,
            createdAt: Date.now(),
          };

          if (chosenCharacter === 'AETHER') {
            newRoom.p1 = { ws, character: 'AETHER', connectedAt: Date.now() };
            playerRole = 'AETHER';
          } else {
            newRoom.p2 = { ws, character: 'CHRONO', connectedAt: Date.now() };
            playerRole = 'CHRONO';
          }

          rooms.set(code, newRoom);
          currentRoomCode = code;

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            payload: {
              code,
              role: playerRole,
              isHost: true,
              waitingForPlayer: true,
            }
          }));
          break;
        }

        case 'JOIN_ROOM': {
          const code = (payload?.code || '').toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'کد اتاق یافت نشد یا منقضی شده است. / Room code not found.' }
            }));
            return;
          }

          if (room.p1 && room.p2) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'اتاق پر است! هر دو بازیکن متصل شده‌اند. / Room is full.' }
            }));
            return;
          }

          // Assign remaining character
          if (!room.p1) {
            room.p1 = { ws, character: 'AETHER', connectedAt: Date.now() };
            playerRole = 'AETHER';
          } else {
            room.p2 = { ws, character: 'CHRONO', connectedAt: Date.now() };
            playerRole = 'CHRONO';
          }

          currentRoomCode = code;

          // Notify joined player
          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: {
              code,
              role: playerRole,
              isHost: false,
              chapter: room.chapter,
              puzzleIndex: room.puzzleIndex,
              gameState: room.gameState
            }
          }));

          // Notify existing player that partner joined!
          const otherPlayer = playerRole === 'AETHER' ? room.p2 : room.p1;
          if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
            otherPlayer.ws.send(JSON.stringify({
              type: 'PARTNER_JOINED',
              payload: {
                partnerRole: playerRole,
                chapter: room.chapter,
                puzzleIndex: room.puzzleIndex
              }
            }));

            // Notify both that game is ready to start!
            const startPayload = {
              code,
              chapter: room.chapter,
              puzzleIndex: room.puzzleIndex
            };
            ws.send(JSON.stringify({ type: 'GAME_READY', payload: startPayload }));
            otherPlayer.ws.send(JSON.stringify({ type: 'GAME_READY', payload: startPayload }));
          }
          break;
        }

        case 'SYNC_STATE': {
          // Relays player movement, position, abilities to partner
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          // Update authoritative state
          if (payload?.state) {
            room.gameState = { ...room.gameState, ...payload.state };
          }

          const otherPlayer = playerRole === 'AETHER' ? room.p2 : room.p1;
          if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
            otherPlayer.ws.send(JSON.stringify({
              type: 'PARTNER_STATE',
              payload: {
                role: playerRole,
                data: payload
              }
            }));
          }
          break;
        }

        case 'PUZZLE_ACTION': {
          // Broadcast lever pull, button hold, item throw, platform trigger
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const otherPlayer = playerRole === 'AETHER' ? room.p2 : room.p1;
          if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
            otherPlayer.ws.send(JSON.stringify({
              type: 'PUZZLE_ACTION',
              payload: {
                role: playerRole,
                action: payload
              }
            }));
          }
          break;
        }

        case 'CHAPTER_PROGRESS': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          room.chapter = payload.chapter ?? room.chapter;
          room.puzzleIndex = payload.puzzleIndex ?? room.puzzleIndex;

          const broadcastMsg = JSON.stringify({
            type: 'CHAPTER_PROGRESS',
            payload: {
              chapter: room.chapter,
              puzzleIndex: room.puzzleIndex
            }
          });

          if (room.p1 && room.p1.ws.readyState === WebSocket.OPEN) room.p1.ws.send(broadcastMsg);
          if (room.p2 && room.p2.ws.readyState === WebSocket.OPEN) room.p2.ws.send(broadcastMsg);
          break;
        }

        case 'CHAT_MESSAGE': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const msgPayload = {
            sender: playerRole,
            text: payload.text,
            time: Date.now()
          };

          if (room.p1 && room.p1.ws.readyState === WebSocket.OPEN) {
            room.p1.ws.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: msgPayload }));
          }
          if (room.p2 && room.p2.ws.readyState === WebSocket.OPEN) {
            room.p2.ws.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: msgPayload }));
          }
          break;
        }

        case 'SYNC_CUSTOMIZATION': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const otherPlayer = ((playerRole as string) === 'ROSE' || playerRole === 'AETHER') ? room.p2 : room.p1;
          if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
            otherPlayer.ws.send(JSON.stringify({
              type: 'CUSTOMIZATION_UPDATED',
              payload: { customization: payload.customization }
            }));
          }
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.error('WS Parse Error:', e);
    }
  });

  ws.on('close', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    if (room.p1 && room.p1.ws === ws) {
      room.p1 = undefined;
    } else if (room.p2 && room.p2.ws === ws) {
      room.p2 = undefined;
    }

    // Notify remaining partner
    const remaining = room.p1 || room.p2;
    if (remaining && remaining.ws.readyState === WebSocket.OPEN) {
      remaining.ws.send(JSON.stringify({
        type: 'PARTNER_LEFT',
        payload: { message: 'بازیکن مقابل قطع شد. در حال انتظار برای اتصال مجدد...' }
      }));
    } else {
      // If no players left, remove room
      rooms.delete(currentRoomCode);
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
