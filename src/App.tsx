/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, CharacterType, DialogueLine, CustomizationSettings } from './types/game';
import { STORY_CHAPTERS_3D, CUTSCENE_DIALOGUES_3D } from './data/storyData';
import { HeaderNavbar } from './components/HeaderNavbar';
import { GameCanvas3D } from './components/GameCanvas3D';
import { RoomModal } from './components/RoomModal';
import { CoOpControlsHelp } from './components/CoOpControlsHelp';
import { StoryDialogueModal } from './components/StoryDialogueModal';
import { AIHintModal } from './components/AIHintModal';
import { VictoryModal } from './components/VictoryModal';
import { CustomizerModal } from './components/CustomizerModal';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [gameMode, setGameMode] = useState<GameMode>('LOCAL');
  const [isMuted, setIsMuted] = useState(false);

  // Chapter & Puzzle Index
  const [chapterIdx, setChapterIdx] = useState(0);
  const [puzzleIdx, setPuzzleIdx] = useState(0);

  // Customization Settings State
  const [customization, setCustomization] = useState<CustomizationSettings>({
    rose: {
      hairColor: '#f43f5e',
      dressColor: '#881337',
      heartColor: '#ff2a6d',
      woodTint: '#fcd34d',
    },
    arya: {
      woodTint: '#78350f',
      keyFinish: '#fbbf24',
      heartColor: '#38bdf8',
    },
    room: {
      theme: 'WORKSHOP',
      deskStyle: 'CARVED_WOOD',
      particles: 'SPARKLES',
    },
  });

  // Online Multiplayer WebSocket State
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<CharacterType>('ROSE');
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [partnerState, setPartnerState] = useState<any>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(true); // Open intro cutscene on start!
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);

  const [activeDialogues, setActiveDialogues] = useState<DialogueLine[]>(CUTSCENE_DIALOGUES_3D['intro']);

  const currentChapter = STORY_CHAPTERS_3D[chapterIdx] || STORY_CHAPTERS_3D[0];
  const currentPuzzle = currentChapter.puzzles[puzzleIdx] || currentChapter.puzzles[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log('Fullscreen request ignored:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Auto-join room from URL search query (e.g. ?room=X7K29B)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setGameMode('ONLINE');
      setIsRoomModalOpen(true);
    }
  }, []);

  // Connect WebSocket for Online Remote Co-Op
  const connectWs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to Co-op WebSocket server');
      setWsError(null);

      // If URL had room param, auto join
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { code: roomParam } }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;

        switch (type) {
          case 'ROOM_CREATED':
            setRoomCode(payload.code);
            setMyRole(payload.role === 'AETHER' ? 'ROSE' : payload.role);
            setPartnerConnected(false);
            break;

          case 'ROOM_JOINED':
            setRoomCode(payload.code);
            setMyRole(payload.role === 'AETHER' ? 'ROSE' : payload.role);
            setPartnerConnected(true);
            break;

          case 'PARTNER_JOINED':
            setPartnerConnected(true);
            break;

          case 'PARTNER_STATE':
            setPartnerState(payload);
            break;

          case 'PARTNER_LEFT':
            setPartnerConnected(false);
            setWsError(payload.message);
            break;

          case 'ERROR':
            setWsError(payload.message);
            break;

          default:
            break;
        }
      } catch (e) {
        console.error('WS Parse Error:', e);
      }
    };

    ws.onerror = (e) => {
      console.error('WS Error:', e);
      setWsError('خطا در اتصال به سرور آنلاین / WebSocket connection failed.');
    };

    ws.onclose = () => {
      console.log('WS Connection closed');
    };

    wsRef.current = ws;
  }, []);

  const sendWsMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const createRoom = (character: CharacterType) => {
    setGameMode('ONLINE');
    connectWs();
    setTimeout(() => {
      sendWsMessage('CREATE_ROOM', { character });
    }, 300);
  };

  const joinRoom = (code: string) => {
    setGameMode('ONLINE');
    connectWs();
    setTimeout(() => {
      sendWsMessage('JOIN_ROOM', { code });
    }, 300);
  };

  // Handle puzzle completion
  const handlePuzzleComplete = () => {
    if (puzzleIdx < currentChapter.puzzles.length - 1) {
      setPuzzleIdx(puzzleIdx + 1);
    } else {
      // Chapter completed!
      setIsVictoryModalOpen(true);
    }
  };

  const handleNextChapter = () => {
    setIsVictoryModalOpen(false);
    if (chapterIdx < STORY_CHAPTERS_3D.length - 1) {
      setChapterIdx(chapterIdx + 1);
      setPuzzleIdx(0);
      setActiveDialogues(CUTSCENE_DIALOGUES_3D['c1_complete']);
      setIsStoryModalOpen(true);
    } else {
      // Reached ultimate victory!
      setActiveDialogues(CUTSCENE_DIALOGUES_3D['game_victory']);
      setIsStoryModalOpen(true);
    }
  };

  const handleReplayChapter = () => {
    setIsVictoryModalOpen(false);
    setPuzzleIdx(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-slate-950">
      
      {/* Header Navigation */}
      <HeaderNavbar
        lang={lang}
        setLang={setLang}
        gameMode={gameMode}
        setGameMode={(mode) => {
          setGameMode(mode);
          if (mode === 'ONLINE') {
            setIsRoomModalOpen(true);
          }
        }}
        roomCode={roomCode}
        myRole={myRole}
        openRoomModal={() => setIsRoomModalOpen(true)}
        openHintModal={() => setIsHintModalOpen(true)}
        openControlsModal={() => setIsControlsModalOpen(true)}
        openStoryModal={() => {
          setActiveDialogues(CUTSCENE_DIALOGUES_3D['intro']);
          setIsStoryModalOpen(true);
        }}
        openCustomizerModal={() => setIsCustomizerModalOpen(true)}
        toggleFullscreen={toggleFullscreen}
        currentChapterTitle={lang === 'fa' ? currentChapter.title.fa : currentChapter.title.en}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Game Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 md:p-4 flex flex-col items-center justify-center">
        
        {/* Chapter Title Banner */}
        <div className="w-full mb-2 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-rose-500/30 shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              {lang === 'fa' ? `فصل ${currentChapter.id} از ${STORY_CHAPTERS_3D.length}` : `Chapter ${currentChapter.id} of ${STORY_CHAPTERS_3D.length}`}
            </span>
            <h2 className="text-xs md:text-sm font-bold text-slate-100">
              {lang === 'fa' ? currentChapter.title.fa : currentChapter.title.en}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-sky-400 block">
              {lang === 'fa' ? `معمای ${puzzleIdx + 1} از ${currentChapter.puzzles.length}` : `Puzzle ${puzzleIdx + 1} of ${currentChapter.puzzles.length}`}
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              {lang === 'fa' ? currentPuzzle.title.fa : currentPuzzle.title.en}
            </span>
          </div>
        </div>

        {/* Dynamic 3D Game Canvas Engine */}
        <GameCanvas3D
          gameMode={gameMode}
          playerRole={myRole}
          lang={lang}
          puzzle={currentPuzzle}
          onPuzzleComplete={handlePuzzleComplete}
          onOpenHint={() => setIsHintModalOpen(true)}
          wsSocket={wsRef.current}
          roomCode={roomCode}
          customizationSettings={customization}
        />

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-2 text-center text-[11px] text-slate-500">
        {lang === 'fa'
          ? 'رز و آریا: بازی ۳ بعدی داستانی و رمانتیک دونفره محلی و آنلاین در اتاق کارگاه'
          : 'Rose & Arya: 3D Co-op Romantic Puzzle Adventure in the Workshop Room'}
      </footer>

      {/* Modals */}
      <CustomizerModal
        isOpen={isCustomizerModalOpen}
        onClose={() => setIsCustomizerModalOpen(false)}
        lang={lang}
        settings={customization}
        updateSettings={setCustomization}
        onSendSync={(newSettings) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomCode) {
            wsRef.current.send(JSON.stringify({
              type: 'SYNC_CUSTOMIZATION',
              payload: { roomCode, customization: newSettings }
            }));
          }
        }}
      />

      {/* Modals */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        lang={lang}
        roomCode={roomCode}
        createRoom={createRoom}
        joinRoom={joinRoom}
        myRole={myRole}
        partnerConnected={partnerConnected}
        errorMessage={wsError}
      />

      <CoOpControlsHelp
        isOpen={isControlsModalOpen}
        onClose={() => setIsControlsModalOpen(false)}
        lang={lang}
      />

      <StoryDialogueModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        lang={lang}
        dialogues={activeDialogues}
      />

      <AIHintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        lang={lang}
        currentPuzzle={currentPuzzle as any}
        chapterTitle={lang === 'fa' ? currentChapter.title.fa : currentChapter.title.en}
      />

      <VictoryModal
        isOpen={isVictoryModalOpen}
        onNextChapter={handleNextChapter}
        onReplay={handleReplayChapter}
        lang={lang}
        chapterTitle={lang === 'fa' ? currentChapter.title.fa : currentChapter.title.en}
        isFinalChapter={chapterIdx === STORY_CHAPTERS_3D.length - 1}
      />

    </div>
  );
}
