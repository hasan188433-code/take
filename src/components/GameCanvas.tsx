import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameMode, CharacterType, PlayerPos, PuzzleDefinition, InteractiveObject } from '../types/game';
import { sound } from '../utils/sound';
import { Sparkles, ArrowUp, ArrowLeft, ArrowRight, Zap, Clock, Lock } from 'lucide-react';

interface Props {
  gameMode: GameMode;
  myRole: CharacterType;
  lang: 'fa' | 'en';
  currentPuzzle: PuzzleDefinition;
  onPuzzleComplete: () => void;
  sendWsMessage?: (type: string, payload: any) => void;
  partnerState?: any;
  partnerConnected?: boolean;
}

export const GameCanvas: React.FC<Props> = ({
  gameMode,
  myRole,
  lang,
  currentPuzzle,
  onPuzzleComplete,
  sendWsMessage,
  partnerState,
  partnerConnected = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player States
  const [p1, setP1] = useState<PlayerPos>({
    x: currentPuzzle.p1Spawn.x,
    y: currentPuzzle.p1Spawn.y,
    vx: 0,
    vy: 0,
    facing: 'right',
    isGrounded: false,
    isJumping: false,
    isUsingAbility: false,
    energy: 100,
    carryingItemId: null,
    score: 0,
  });

  const [p2, setP2] = useState<PlayerPos>({
    x: currentPuzzle.p2Spawn.x,
    y: currentPuzzle.p2Spawn.y,
    vx: 0,
    vy: 0,
    facing: 'right',
    isGrounded: false,
    isJumping: false,
    isUsingAbility: false,
    energy: 100,
    carryingItemId: null,
    score: 0,
  });

  // Puzzle Objects State
  const [objects, setObjects] = useState<InteractiveObject[]>(currentPuzzle.objects);

  // Time Freeze Effect Timer (for Chrono)
  const [frozenTimeUntil, setFrozenTimeUntil] = useState<number>(0);

  // Particle System
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }>>([]);

  // Reset positions whenever puzzle changes
  useEffect(() => {
    setP1({
      x: currentPuzzle.p1Spawn.x,
      y: currentPuzzle.p1Spawn.y,
      vx: 0,
      vy: 0,
      facing: 'right',
      isGrounded: false,
      isJumping: false,
      isUsingAbility: false,
      energy: 100,
      carryingItemId: null,
      score: 0,
    });
    setP2({
      x: currentPuzzle.p2Spawn.x,
      y: currentPuzzle.p2Spawn.y,
      vx: 0,
      vy: 0,
      facing: 'right',
      isGrounded: false,
      isJumping: false,
      isUsingAbility: false,
      energy: 100,
      carryingItemId: null,
      score: 0,
    });
    setObjects(currentPuzzle.objects);
  }, [currentPuzzle]);

  // Sync remote partner state when receiving WS updates
  useEffect(() => {
    if (gameMode === 'ONLINE' && partnerState) {
      if (myRole === 'AETHER') {
        // Partner is Chrono
        setP2((prev) => ({
          ...prev,
          ...partnerState.data,
        }));
      } else {
        // Partner is Aether
        setP1((prev) => ({
          ...prev,
          ...partnerState.data,
        }));
      }
    }
  }, [partnerState, gameMode, myRole]);

  // Keyboard Input Tracking
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Physics & Loop
  useEffect(() => {
    let animId: number;
    const gravity = 0.65;
    const speed = 4.8;
    const jumpForce = -12.5;

    const spawnParticles = (x: number, y: number, color: string, count = 5) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          color,
          life: 0,
          maxLife: 20 + Math.random() * 20,
        });
      }
    };

    const updatePhysics = () => {
      const keys = keysRef.current;
      const now = Date.now();

      // === PLAYER 1 (AETHER) CONTROLS ===
      if (gameMode === 'LOCAL' || (gameMode === 'ONLINE' && myRole === 'AETHER') || gameMode === 'PRACTICE') {
        setP1((prev) => {
          let vx = 0;
          let vy = prev.vy + gravity;
          let facing = prev.facing;
          let isGrounded = prev.isGrounded;
          let isJumping = prev.isJumping;
          let isUsingAbility = keys['KeyG'] || false;
          let carryingItemId = prev.carryingItemId;

          if (keys['KeyA']) {
            vx = -speed;
            facing = 'left';
          }
          if (keys['KeyD']) {
            vx = speed;
            facing = 'right';
          }

          if (keys['Space'] && isGrounded) {
            vy = jumpForce;
            isGrounded = false;
            isJumping = true;
            sound.playJump();
            spawnParticles(prev.x + 18, prev.y + 45, '#38bdf8', 6);
          }

          // Ability F (Light Bridge / Grab)
          if (keys['KeyF']) {
            sound.playAbilityAether();
            spawnParticles(prev.x + 18, prev.y + 20, '#38bdf8', 4);
          }

          let x = prev.x + vx;
          let y = prev.y + vy;

          // Platform collisions
          let newGrounded = false;
          currentPuzzle.platforms.forEach((plat) => {
            if (
              x + 36 > plat.x &&
              x < plat.x + plat.width &&
              prev.y + 48 <= plat.y &&
              y + 48 >= plat.y
            ) {
              y = plat.y - 48;
              vy = 0;
              newGrounded = true;
              isJumping = false;
            }
          });

          // Also collide with light bridges / active platforms
          objects.forEach((obj) => {
            if (obj.type === 'LIGHT_BRIDGE' && obj.state) {
              if (
                x + 36 > obj.x &&
                x < obj.x + obj.width &&
                prev.y + 48 <= obj.y &&
                y + 48 >= obj.y
              ) {
                y = obj.y - 48;
                vy = 0;
                newGrounded = true;
              }
            }
          });

          // Screen boundaries
          x = Math.max(10, Math.min(1050, x));
          if (y > 600) {
            // Respawn
            x = currentPuzzle.p1Spawn.x;
            y = currentPuzzle.p1Spawn.y;
            vy = 0;
          }

          const newState = {
            ...prev,
            x,
            y,
            vx,
            vy,
            facing,
            isGrounded: newGrounded,
            isJumping,
            isUsingAbility,
            carryingItemId,
          };

          // Send WS updates if in Online mode
          if (gameMode === 'ONLINE' && myRole === 'AETHER' && sendWsMessage) {
            sendWsMessage('SYNC_STATE', { state: newState });
          }

          return newState;
        });
      }

      // === PLAYER 2 (CHRONO) CONTROLS ===
      if (gameMode === 'LOCAL' || (gameMode === 'ONLINE' && myRole === 'CHRONO') || gameMode === 'PRACTICE') {
        setP2((prev) => {
          let vx = 0;
          let vy = prev.vy + gravity;
          let facing = prev.facing;
          let isGrounded = prev.isGrounded;
          let isJumping = prev.isJumping;
          let isUsingAbility = keys['KeyL'] || false;

          if (keys['ArrowLeft']) {
            vx = -speed;
            facing = 'left';
          }
          if (keys['ArrowRight']) {
            vx = speed;
            facing = 'right';
          }

          if ((keys['ArrowUp'] || keys['ShiftRight'] || keys['Enter']) && isGrounded) {
            vy = jumpForce;
            isGrounded = false;
            isJumping = true;
            sound.playJump();
            spawnParticles(prev.x + 18, prev.y + 45, '#c084fc', 6);
          }

          // Ability K (Time Freeze)
          if (keys['KeyK']) {
            sound.playAbilityChrono();
            setFrozenTimeUntil(now + 5000);
            spawnParticles(prev.x + 18, prev.y + 20, '#c084fc', 8);
          }

          let x = prev.x + vx;
          let y = prev.y + vy;

          // Platform collisions
          let newGrounded = false;
          currentPuzzle.platforms.forEach((plat) => {
            if (
              x + 36 > plat.x &&
              x < plat.x + plat.width &&
              prev.y + 48 <= plat.y &&
              y + 48 >= plat.y
            ) {
              y = plat.y - 48;
              vy = 0;
              newGrounded = true;
              isJumping = false;
            }
          });

          // Screen boundaries
          x = Math.max(10, Math.min(1050, x));
          if (y > 600) {
            x = currentPuzzle.p2Spawn.x;
            y = currentPuzzle.p2Spawn.y;
            vy = 0;
          }

          const newState = {
            ...prev,
            x,
            y,
            vx,
            vy,
            facing,
            isGrounded: newGrounded,
            isJumping,
            isUsingAbility,
          };

          if (gameMode === 'ONLINE' && myRole === 'CHRONO' && sendWsMessage) {
            sendWsMessage('SYNC_STATE', { state: newState });
          }

          return newState;
        });
      }

      // === INTERACTION & PUZZLE MECHANICS ===
      setObjects((prevObjs) => {
        let updated = [...prevObjs];

        // Pressure plates detection
        updated = updated.map((obj) => {
          if (obj.type === 'PRESSURE_PLATE') {
            const p1On =
              p1.x + 36 > obj.x &&
              p1.x < obj.x + obj.width &&
              p1.y + 48 >= obj.y &&
              p1.y <= obj.y + obj.height;

            const p2On =
              p2.x + 36 > obj.x &&
              p2.x < obj.x + obj.width &&
              p2.y + 48 >= obj.y &&
              p2.y <= obj.y + obj.height;

            let isPressed = p1On || p2On;
            if (obj.requiresBoth) {
              isPressed = p1On && p2On;
            }

            if (isPressed && !obj.state) {
              sound.playPlatePress();
            }

            return { ...obj, state: isPressed };
          }

          if (obj.type === 'LEVER') {
            // Toggle lever if Aether or Chrono presses F / K near it
            const p1Near = Math.abs(p1.x - obj.x) < 45 && Math.abs(p1.y - obj.y) < 45 && keys['KeyF'];
            const p2Near = Math.abs(p2.x - obj.x) < 45 && Math.abs(p2.y - obj.y) < 45 && keys['KeyK'];

            if (p1Near || p2Near) {
              sound.playLeverClick();
              return { ...obj, state: !obj.state };
            }
          }

          if (obj.type === 'LIGHT_BRIDGE') {
            // Active if target lever is on
            const targetLever = prevObjs.find((o) => o.targetId === obj.id);
            if (targetLever) {
              return { ...obj, state: targetLever.state };
            }
          }

          if (obj.type === 'DOOR') {
            // Door opens if all associated pressure plates / receivers are active
            const requiredPlates = prevObjs.filter((o) => o.targetId === obj.id);
            const allActive = requiredPlates.length > 0 && requiredPlates.every((p) => p.state);
            return { ...obj, state: allActive };
          }

          return obj;
        });

        return updated;
      });

      // === CHECK PUZZLE GOAL REACHED ===
      const doorObj = objects.find((o) => o.type === 'DOOR');
      const doorOpen = doorObj ? doorObj.state : true;

      const p1InGoal =
        p1.x + 36 > currentPuzzle.goalX &&
        p1.x < currentPuzzle.goalX + currentPuzzle.goalWidth &&
        p1.y + 48 > currentPuzzle.goalY;

      const p2InGoal =
        p2.x + 36 > currentPuzzle.goalX &&
        p2.x < currentPuzzle.goalX + currentPuzzle.goalWidth &&
        p2.y + 48 > currentPuzzle.goalY;

      if (p1InGoal && p2InGoal && doorOpen) {
        onPuzzleComplete();
      }
    };

    // Rendering Frame
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Canvas
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid / Stars Background
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Platforms
      currentPuzzle.platforms.forEach((plat) => {
        ctx.fillStyle = plat.color || '#334155';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        // Bevel border
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      });

      // Draw Interactive Objects
      objects.forEach((obj) => {
        if (obj.type === 'LEVER') {
          ctx.fillStyle = obj.state ? '#10b981' : '#f43f5e';
          ctx.fillRect(obj.x + 12, obj.y + 15, 16, 35);
          // Handle
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(obj.x + 20, obj.state ? obj.y + 15 : obj.y + 35, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (obj.type === 'LIGHT_BRIDGE') {
          if (obj.state) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 15;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            ctx.shadowBlur = 0;
          }
        } else if (obj.type === 'PRESSURE_PLATE') {
          ctx.fillStyle = obj.state ? '#34d399' : '#f59e0b';
          const platHeight = obj.state ? 6 : 14;
          ctx.fillRect(obj.x, obj.y + (15 - platHeight), obj.width, platHeight);
        } else if (obj.type === 'DOOR') {
          ctx.fillStyle = obj.state ? 'rgba(16, 185, 129, 0.2)' : '#f43f5e';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.strokeStyle = obj.state ? '#10b981' : '#fb7185';
          ctx.lineWidth = 3;
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

          // Door label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Vazirmatn, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(obj.state ? 'باز (OPEN)' : 'قفل (LOCKED)', obj.x + obj.width / 2, obj.y - 8);
        } else if (obj.type === 'BATTERY_ORB') {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(obj.x + 15, obj.y + 15, 14, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Exit Portal Goal Zone
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
      ctx.fillRect(currentPuzzle.goalX, currentPuzzle.goalY, currentPuzzle.goalWidth, currentPuzzle.goalHeight);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentPuzzle.goalX, currentPuzzle.goalY, currentPuzzle.goalWidth, currentPuzzle.goalHeight);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'fa' ? 'دروازه خروج' : 'Exit Gate', currentPuzzle.goalX + currentPuzzle.goalWidth / 2, currentPuzzle.goalY + 20);

      // Draw Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      // Draw Player 1: Aether (☀️ Solar Light)
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#38bdf8'; // Cyan Light
      ctx.fillRect(p1.x, p1.y, 36, 48);
      // Head
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p1.x + 18, p1.y + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p1.facing === 'right' ? p1.x + 20 : p1.x + 12, p1.y + 10, 4, 4);
      ctx.restore();

      // Label P1
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☀️ اتیر', p1.x + 18, p1.y - 8);

      // Draw Player 2: Chrono (⏳ Time Purple)
      ctx.save();
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#a855f7'; // Purple Time
      ctx.fillRect(p2.x, p2.y, 36, 48);
      // Head
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(p2.x + 18, p2.y + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p2.facing === 'right' ? p2.x + 20 : p2.x + 12, p2.y + 10, 4, 4);
      ctx.restore();

      // Label P2
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏳ کرونو', p2.x + 18, p2.y - 8);
    };

    const loop = () => {
      updatePhysics();
      render();
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [p1, p2, objects, currentPuzzle, gameMode, myRole, sendWsMessage, lang, onPuzzleComplete]);

  // Touch / Mobile Controls Trigger
  const simulateKey = (code: string, isDown: boolean) => {
    keysRef.current[code] = isDown;
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      
      {/* Canvas Frame */}
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1080}
          height={600}
          className="w-full h-auto block aspect-[18/10]"
        />

        {/* Puzzle Role Hint Bar */}
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-200">
          <div className="flex items-center gap-2 text-sky-300">
            <span className="font-bold">☀️ {lang === 'fa' ? 'وظیفه اتیر:' : 'Aether Role:'}</span>
            <span>{lang === 'fa' ? currentPuzzle.aetherRoleText.fa : currentPuzzle.aetherRoleText.en}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 text-purple-300">
            <span className="font-bold">⏳ {lang === 'fa' ? 'وظیفه کرونو:' : 'Chrono Role:'}</span>
            <span>{lang === 'fa' ? currentPuzzle.chronoRoleText.fa : currentPuzzle.chronoRoleText.en}</span>
          </div>
        </div>
      </div>

      {/* On-screen Controls for Mobile & Quick Interaction */}
      <div className="mt-4 w-full max-w-5xl grid grid-cols-2 gap-4">
        
        {/* Aether Quick Touch Panel */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-sky-500/30 flex items-center justify-between">
          <span className="text-xs font-bold text-sky-400">☀️ اتیر (WASD + F/G)</span>
          <div className="flex gap-1.5">
            <button
              onMouseDown={() => simulateKey('KeyA', true)}
              onMouseUp={() => simulateKey('KeyA', false)}
              onTouchStart={() => simulateKey('KeyA', true)}
              onTouchEnd={() => simulateKey('KeyA', false)}
              className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-200 rounded-lg text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => simulateKey('Space', true)}
              onMouseUp={() => simulateKey('Space', false)}
              onTouchStart={() => simulateKey('Space', true)}
              onTouchEnd={() => simulateKey('Space', false)}
              className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-200 rounded-lg text-xs font-bold px-3"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => simulateKey('KeyD', true)}
              onMouseUp={() => simulateKey('KeyD', false)}
              onTouchStart={() => simulateKey('KeyD', true)}
              onTouchEnd={() => simulateKey('KeyD', false)}
              className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-200 rounded-lg text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => simulateKey('KeyF', true)}
              onMouseUp={() => simulateKey('KeyF', false)}
              onTouchStart={() => simulateKey('KeyF', true)}
              onTouchEnd={() => simulateKey('KeyF', false)}
              className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold"
            >
              F (قدرت)
            </button>
          </div>
        </div>

        {/* Chrono Quick Touch Panel */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-purple-500/30 flex items-center justify-between">
          <span className="text-xs font-bold text-purple-400">⏳ کرونو (Arrow + K/L)</span>
          <div className="flex gap-1.5">
            <button
              onMouseDown={() => simulateKey('ArrowLeft', true)}
              onMouseUp={() => simulateKey('ArrowLeft', false)}
              onTouchStart={() => simulateKey('ArrowLeft', true)}
              onTouchEnd={() => simulateKey('ArrowLeft', false)}
              className="p-2 bg-slate-800 hover:bg-purple-600 text-slate-200 rounded-lg text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => simulateKey('ArrowUp', true)}
              onMouseUp={() => simulateKey('ArrowUp', false)}
              onTouchStart={() => simulateKey('ArrowUp', true)}
              onTouchEnd={() => simulateKey('ArrowUp', false)}
              className="p-2 bg-slate-800 hover:bg-purple-600 text-slate-200 rounded-lg text-xs font-bold px-3"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => simulateKey('ArrowRight', true)}
              onMouseUp={() => simulateKey('ArrowRight', false)}
              onTouchStart={() => simulateKey('ArrowRight', true)}
              onTouchEnd={() => simulateKey('ArrowRight', false)}
              className="p-2 bg-slate-800 hover:bg-purple-600 text-slate-200 rounded-lg text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => simulateKey('KeyK', true)}
              onMouseUp={() => simulateKey('KeyK', false)}
              onTouchStart={() => simulateKey('KeyK', true)}
              onTouchEnd={() => simulateKey('KeyK', false)}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
            >
              K (قدرت)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
