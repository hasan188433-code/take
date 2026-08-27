import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Player3DPos, PuzzleDefinition3D, InteractiveObject3D, Platform3D, CharacterType, CustomizationSettings } from '../types/game';
import { Sparkles, Heart, Zap, Globe2, Copy, Check, Users, HelpCircle } from 'lucide-react';

interface GameCanvas3DProps {
  puzzle: PuzzleDefinition3D;
  playerRole: CharacterType; // 'ROSE' | 'ARYA' or 'AETHER' | 'CHRONO'
  gameMode: 'LOCAL' | 'ONLINE' | 'PRACTICE';
  wsSocket: WebSocket | null;
  roomCode: string | null;
  onPuzzleComplete: () => void;
  onOpenHint: () => void;
  lang: 'fa' | 'en';
  customizationSettings?: CustomizationSettings;
}

export const GameCanvas3D: React.FC<GameCanvas3DProps> = ({
  puzzle,
  playerRole,
  gameMode,
  wsSocket,
  roomCode,
  onPuzzleComplete,
  onOpenHint,
  lang,
  customizationSettings,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [roseEnergy, setRoseEnergy] = useState(100);
  const [aryaEnergy, setAryaEnergy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const isCompletedRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [partnerConnected, setPartnerConnected] = useState(gameMode === 'LOCAL');

  // Active Key States
  const keysRef = useRef<Record<string, boolean>>({});

  // Internal 3D Player State
  const p1Ref = useRef<Player3DPos>({
    x: puzzle.p1Spawn.x,
    y: puzzle.p1Spawn.y,
    z: puzzle.p1Spawn.z,
    rotY: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    isGrounded: true,
    isJumping: false,
    isUsingAbility: false,
    energy: 100,
    carryingItemId: null,
    animationState: 'idle',
    score: 0,
  });

  const p2Ref = useRef<Player3DPos>({
    x: puzzle.p2Spawn.x,
    y: puzzle.p2Spawn.y,
    z: puzzle.p2Spawn.z,
    rotY: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    isGrounded: true,
    isJumping: false,
    isUsingAbility: false,
    energy: 100,
    carryingItemId: null,
    animationState: 'idle',
    score: 0,
  });

  // Dynamic Interactive Objects State
  const objectsStateRef = useRef<Record<string, { state: boolean | number; pos?: THREE.Vector3 }>>({});

  // Default Customization Fallbacks
  const customization = customizationSettings || {
    rose: { hairColor: '#f43f5e', dressColor: '#881337', heartColor: '#ff2a6d', woodTint: '#fcd34d' },
    arya: { woodTint: '#78350f', keyFinish: '#fbbf24', heartColor: '#38bdf8' },
    room: { theme: 'WORKSHOP', deskStyle: 'CARVED_WOOD', particles: 'SPARKLES' },
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Reset completion flag & player spawn positions for new puzzle
    isCompletedRef.current = false;
    setIsCompleted(false);

    p1Ref.current = {
      x: puzzle.p1Spawn.x,
      y: puzzle.p1Spawn.y,
      z: puzzle.p1Spawn.z,
      rotY: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      isGrounded: true,
      isJumping: false,
      isUsingAbility: false,
      energy: 100,
      carryingItemId: null,
      animationState: 'idle',
      score: 0,
    };

    p2Ref.current = {
      x: puzzle.p2Spawn.x,
      y: puzzle.p2Spawn.y,
      z: puzzle.p2Spawn.z,
      rotY: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      isGrounded: true,
      isJumping: false,
      isUsingAbility: false,
      energy: 100,
      carryingItemId: null,
      animationState: 'idle',
      score: 0,
    };

    // Initialize Puzzle Objects State
    puzzle.objects.forEach((obj) => {
      objectsStateRef.current[obj.id] = { state: obj.state };
    });

    // 1. THREE.js Scene Setup
    const scene = new THREE.Scene();
    const bgColor = customization.room.theme === 'CANDLELIGHT'
      ? '#26121e'
      : customization.room.theme === 'TWILIGHT'
      ? '#121829'
      : '#1c1326';

    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.025);

    // Camera Setup (3D Isometric / Cinematic angle)
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 2, 0);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting Setup (Romantic Cozy Workshop Room)
    const ambientLight = new THREE.AmbientLight(
      customization.room.theme === 'CANDLELIGHT' ? '#fdba74' : '#fde68a',
      0.8
    );
    scene.add(ambientLight);

    const mainDeskLamp = new THREE.SpotLight('#ffedd5', 2.8);
    mainDeskLamp.position.set(0, 25, 10);
    mainDeskLamp.angle = Math.PI / 3;
    mainDeskLamp.penumbra = 0.5;
    mainDeskLamp.castShadow = true;
    mainDeskLamp.shadow.mapSize.width = 1024;
    mainDeskLamp.shadow.mapSize.height = 1024;
    scene.add(mainDeskLamp);

    const romanticPinkLight = new THREE.PointLight(customization.rose.heartColor, 2.0, 30);
    romanticPinkLight.position.set(-10, 8, -5);
    scene.add(romanticPinkLight);

    const romanticBlueLight = new THREE.PointLight(customization.arya.heartColor, 2.0, 30);
    romanticBlueLight.position.set(10, 8, -5);
    scene.add(romanticBlueLight);

    // 3. Room Environment Meshes
    const environmentGroup = new THREE.Group();

    // Giant Workshop Room Walls & Wooden Desk Surface
    const deskGeo = new THREE.BoxGeometry(60, 2, 40);
    const deskMat = new THREE.MeshStandardMaterial({
      color: customization.room.deskStyle === 'MAHOGANY' ? '#310a03' : '#451a03',
      roughness: 0.6,
      metalness: 0.1,
    });
    const deskMesh = new THREE.Mesh(deskGeo, deskMat);
    deskMesh.position.set(0, -1, 0);
    deskMesh.receiveShadow = true;
    environmentGroup.add(deskMesh);

    // Workshop Back Wall
    const wallGeo = new THREE.BoxGeometry(70, 40, 2);
    const wallMat = new THREE.MeshStandardMaterial({ color: bgColor, roughness: 0.8 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 18, -18);
    environmentGroup.add(wallMesh);

    // Giant Clockwork Gears on Back Wall (Decor)
    const gearGroup = new THREE.Group();
    const bigGearGeo = new THREE.CylinderGeometry(6, 6, 0.5, 16);
    const gearMat = new THREE.MeshStandardMaterial({ color: customization.arya.keyFinish, metalness: 0.7, roughness: 0.3 });
    const bigGear = new THREE.Mesh(bigGearGeo, gearMat);
    bigGear.rotation.x = Math.PI / 2;
    bigGear.position.set(0, 15, -16.8);
    gearGroup.add(bigGear);
    environmentGroup.add(gearGroup);

    // Particle System (Sparkles, Hearts or Clockwork Dust)
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 1] = Math.random() * 15;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: customization.room.particles === 'HEARTS' ? '#f43f5e' : '#fbbf24',
      size: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    scene.add(environmentGroup);

    // 4. Create Wooden Doll Characters (Rose & Arya)
    // --- ROSE (Doll 1: Wooden Doll with Yarn Hair & Red Heart Chest) ---
    const roseGroup = new THREE.Group();
    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const woodMatRose = new THREE.MeshStandardMaterial({ color: customization.rose.woodTint, roughness: 0.5 });
    const roseHead = new THREE.Mesh(headGeo, woodMatRose);
    roseHead.position.y = 1.3;
    roseHead.castShadow = true;
    roseGroup.add(roseHead);

    // Yarn Hair Braids
    const hairGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const hairMat = new THREE.MeshStandardMaterial({ color: customization.rose.hairColor, roughness: 0.9 });
    const roseHair = new THREE.Mesh(hairGeo, hairMat);
    roseHair.position.set(0, 1.45, -0.05);
    roseGroup.add(roseHair);

    // Torso / Dress
    const dressGeo = new THREE.ConeGeometry(0.6, 0.9, 12);
    const dressMat = new THREE.MeshStandardMaterial({ color: customization.rose.dressColor, roughness: 0.4 });
    const roseDress = new THREE.Mesh(dressGeo, dressMat);
    roseDress.position.y = 0.55;
    roseDress.castShadow = true;
    roseGroup.add(roseDress);

    // Heart Emblem on Chest
    const heartEmblemGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const heartEmblemMat = new THREE.MeshStandardMaterial({
      color: customization.rose.heartColor,
      emissive: customization.rose.heartColor,
      emissiveIntensity: 0.8,
    });
    const roseHeart = new THREE.Mesh(heartEmblemGeo, heartEmblemMat);
    roseHeart.position.set(0, 0.7, 0.35);
    roseGroup.add(roseHeart);

    // Legs & Arms (Wooden Joints)
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 8);
    const leg1 = new THREE.Mesh(legGeo, woodMatRose);
    leg1.position.set(-0.2, 0.15, 0);
    const leg2 = new THREE.Mesh(legGeo, woodMatRose);
    leg2.position.set(0.2, 0.15, 0);
    roseGroup.add(leg1);
    roseGroup.add(leg2);

    // Rose Whip / Magnet Aura Ring
    const roseAuraGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 24);
    const roseAuraMat = new THREE.MeshBasicMaterial({ color: customization.rose.heartColor, transparent: true, opacity: 0 });
    const roseAura = new THREE.Mesh(roseAuraGeo, roseAuraMat);
    roseAura.rotation.x = Math.PI / 2;
    roseAura.position.y = 0.5;
    roseGroup.add(roseAura);

    scene.add(roseGroup);

    // --- ARYA (Doll 2: Clockwork Doll with Brass Key on Back) ---
    const aryaGroup = new THREE.Group();
    // Head
    const woodMatArya = new THREE.MeshStandardMaterial({ color: customization.arya.woodTint, roughness: 0.5 });
    const aryaHead = new THREE.Mesh(headGeo, woodMatArya);
    aryaHead.position.y = 1.3;
    aryaHead.castShadow = true;
    aryaGroup.add(aryaHead);

    // Hair / Cap
    const capGeo = new THREE.SphereGeometry(0.53, 12, 12);
    const capMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.8 });
    const aryaCap = new THREE.Mesh(capGeo, capMat);
    aryaCap.position.set(0, 1.45, -0.05);
    aryaGroup.add(aryaCap);

    // Torso (Vest)
    const vestGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.9, 12);
    const vestMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.4 });
    const aryaVest = new THREE.Mesh(vestGeo, vestMat);
    aryaVest.position.y = 0.55;
    aryaVest.castShadow = true;
    aryaGroup.add(aryaVest);

    // Blue Heart Emblem
    const blueHeartGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const blueHeartMat = new THREE.MeshStandardMaterial({
      color: customization.arya.heartColor,
      emissive: customization.arya.heartColor,
      emissiveIntensity: 0.8,
    });
    const aryaHeart = new THREE.Mesh(blueHeartGeo, blueHeartMat);
    aryaHeart.position.set(0, 0.7, 0.35);
    aryaGroup.add(aryaHeart);

    // Clockwork Key on Back
    const keyStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
    const keyRingGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
    const brassMat = new THREE.MeshStandardMaterial({ color: customization.arya.keyFinish, metalness: 0.8, roughness: 0.2 });
    const keyGroup = new THREE.Group();
    const keyStem = new THREE.Mesh(keyStemGeo, brassMat);
    keyStem.rotation.x = Math.PI / 2;
    const keyRing = new THREE.Mesh(keyRingGeo, brassMat);
    keyRing.position.z = -0.25;
    keyGroup.add(keyStem);
    keyGroup.add(keyRing);
    keyGroup.position.set(0, 0.6, -0.4);
    aryaGroup.add(keyGroup);

    // Legs
    const leg3 = new THREE.Mesh(legGeo, woodMatArya);
    leg3.position.set(-0.2, 0.15, 0);
    const leg4 = new THREE.Mesh(legGeo, woodMatArya);
    leg4.position.set(0.2, 0.15, 0);
    aryaGroup.add(leg3);
    aryaGroup.add(leg4);

    // Time Freeze Aura Ring
    const aryaAuraGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 24);
    const aryaAuraMat = new THREE.MeshBasicMaterial({ color: customization.arya.heartColor, transparent: true, opacity: 0 });
    const aryaAura = new THREE.Mesh(aryaAuraGeo, aryaAuraMat);
    aryaAura.rotation.x = Math.PI / 2;
    aryaAura.position.y = 0.5;
    aryaGroup.add(aryaAura);

    scene.add(aryaGroup);

    // 5. Build Puzzle Platforms & Objects
    const platformMeshes: { mesh: THREE.Mesh; id: string; data: Platform3D }[] = [];
    puzzle.platforms.forEach((plat) => {
      const geo = new THREE.BoxGeometry(plat.width, plat.height, plat.depth);
      let mat: THREE.MeshStandardMaterial;

      if (plat.type === 'BOOK') {
        mat = new THREE.MeshStandardMaterial({ color: plat.color || '#991b1b', roughness: 0.3 });
      } else if (plat.type === 'TEA_CUP_PLATFORM') {
        mat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.1, metalness: 0.1 });
      } else {
        mat = new THREE.MeshStandardMaterial({ color: plat.color || '#b45309', roughness: 0.7 });
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(plat.x, plat.y, plat.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      platformMeshes.push({ mesh, id: plat.id, data: plat });
    });

    // Interactive Objects Meshes
    const interactiveMeshes: { mesh: THREE.Group; id: string; type: string }[] = [];
    puzzle.objects.forEach((obj) => {
      const objGroup = new THREE.Group();
      objGroup.position.set(obj.x, obj.y, obj.z);

      if (obj.type === 'LEVER') {
        const baseGeo = new THREE.BoxGeometry(0.8, 0.2, 0.8);
        const baseMat = new THREE.MeshStandardMaterial({ color: '#334155' });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);

        const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 0.4 });
        const handleMesh = new THREE.Mesh(handleGeo, handleMat);
        handleMesh.position.y = 0.5;
        handleMesh.name = 'lever_handle';

        objGroup.add(baseMesh);
        objGroup.add(handleMesh);
      } else if (obj.type === 'CANDLE_LIGHT') {
        const candleGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12);
        const candleMat = new THREE.MeshStandardMaterial({ color: '#fef08a' });
        const candleMesh = new THREE.Mesh(candleGeo, candleMat);

        const flameLight = new THREE.PointLight('#f59e0b', 0, 8);
        flameLight.position.y = 0.8;
        flameLight.name = 'flame_light';

        objGroup.add(candleMesh);
        objGroup.add(flameLight);
      } else {
        const defaultGeo = new THREE.BoxGeometry(obj.width, obj.height, obj.depth);
        const defaultMat = new THREE.MeshStandardMaterial({ color: obj.color || '#8b5cf6' });
        const defaultMesh = new THREE.Mesh(defaultGeo, defaultMat);
        objGroup.add(defaultMesh);
      }

      scene.add(objGroup);
      interactiveMeshes.push({ mesh: objGroup, id: obj.id, type: obj.type });
    });

    // Goal Portal Heart Visual
    const goalGeo = new THREE.TorusGeometry(puzzle.goalRadius, 0.15, 12, 24);
    const goalMat = new THREE.MeshStandardMaterial({
      color: '#f43f5e',
      emissive: '#f43f5e',
      emissiveIntensity: 0.8,
    });
    const goalMesh = new THREE.Mesh(goalGeo, goalMat);
    goalMesh.rotation.x = Math.PI / 2;
    goalMesh.position.set(puzzle.goalPos.x, puzzle.goalPos.y + 0.1, puzzle.goalPos.z);
    scene.add(goalMesh);

    // 6. Keyboard Listeners with e.preventDefault()
    const GAME_KEYS = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space', 'Enter', 'ShiftLeft', 'ShiftRight',
      'KeyF', 'KeyG', 'KeyK', 'KeyL', 'KeyN'
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.includes(e.code)) {
        e.preventDefault();
      }
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 7. WebSocket Listener for Remote Online Sync
    if (wsSocket && gameMode === 'ONLINE') {
      const handleWsMessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PARTNER_STATE' && msg.payload?.data?.state) {
            setPartnerConnected(true);
            const state = msg.payload.data.state;
            if (state.p1 && (playerRole === 'ARYA' || playerRole === 'CHRONO')) {
              p1Ref.current = { ...p1Ref.current, ...state.p1 };
            }
            if (state.p2 && (playerRole === 'ROSE' || playerRole === 'AETHER')) {
              p2Ref.current = { ...p2Ref.current, ...state.p2 };
            }
          } else if (msg.type === 'PARTNER_JOINED') {
            setPartnerConnected(true);
          }
        } catch (e) {
          console.error('WS Parse Error in Canvas:', e);
        }
      };

      wsSocket.addEventListener('message', handleWsMessage);
    }

    // 8. Main Game Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Rotate Clockwork Gears & Particles
      bigGear.rotation.z = time * 0.5;
      keyRing.rotation.z = time * 2;
      goalMesh.rotation.z = time * 1.5;
      particleSystem.rotation.y = time * 0.05;

      const keys = keysRef.current;
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      const speed = 7.0;
      const jumpImpulse = 10.0;
      const gravity = -24.0;

      // P1 (Rose) Movement
      let p1dx = 0;
      let p1dz = 0;
      if (gameMode === 'LOCAL' || playerRole === 'ROSE' || playerRole === 'AETHER') {
        if (keys['KeyW']) p1dz -= 1;
        if (keys['KeyS']) p1dz += 1;
        if (keys['KeyA']) p1dx -= 1;
        if (keys['KeyD']) p1dx += 1;

        if (p1dx !== 0 || p1dz !== 0) {
          const len = Math.hypot(p1dx, p1dz);
          p1.vx = (p1dx / len) * speed;
          p1.vz = (p1dz / len) * speed;
          p1.rotY = Math.atan2(p1dx, p1dz);
          p1.animationState = 'walk';
        } else {
          p1.vx *= 0.8;
          p1.vz *= 0.8;
          p1.animationState = 'idle';
        }

        // Jump (Space)
        if (keys['Space'] && p1.isGrounded) {
          p1.vy = jumpImpulse;
          p1.isGrounded = false;
          p1.isJumping = true;
        }

        // Ability (KeyF or KeyG)
        if (keys['KeyF'] || keys['KeyG']) {
          p1.isUsingAbility = true;
          roseAuraMat.opacity = 0.8;
        } else {
          p1.isUsingAbility = false;
          roseAuraMat.opacity = 0;
        }
      }

      // P2 (Arya) Movement
      let p2dx = 0;
      let p2dz = 0;
      if (gameMode === 'LOCAL' || playerRole === 'ARYA' || playerRole === 'CHRONO') {
        if (keys['ArrowUp']) p2dz -= 1;
        if (keys['ArrowDown']) p2dz += 1;
        if (keys['ArrowLeft']) p2dx -= 1;
        if (keys['ArrowRight']) p2dx += 1;

        if (p2dx !== 0 || p2dz !== 0) {
          const len = Math.hypot(p2dx, p2dz);
          p2.vx = (p2dx / len) * speed;
          p2.vz = (p2dz / len) * speed;
          p2.rotY = Math.atan2(p2dx, p2dz);
          p2.animationState = 'walk';
        } else {
          p2.vx *= 0.8;
          p2.vz *= 0.8;
          p2.animationState = 'idle';
        }

        // Jump (Shift / Enter / KeyN)
        if ((keys['ShiftLeft'] || keys['ShiftRight'] || keys['Enter'] || keys['KeyN']) && p2.isGrounded) {
          p2.vy = jumpImpulse;
          p2.isGrounded = false;
          p2.isJumping = true;
        }

        // Ability (KeyK or KeyL)
        if (keys['KeyK'] || keys['KeyL']) {
          p2.isUsingAbility = true;
          aryaAuraMat.opacity = 0.8;
        } else {
          p2.isUsingAbility = false;
          aryaAuraMat.opacity = 0;
        }
      }

      // Apply Gravity & Update Positions
      [p1, p2].forEach((p) => {
        p.vy += gravity * delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;

        // Ground Collision Check with Platforms
        let grounded = false;
        puzzle.platforms.forEach((plat) => {
          const minX = plat.x - plat.width / 2 - 0.4;
          const maxX = plat.x + plat.width / 2 + 0.4;
          const minZ = plat.z - plat.depth / 2 - 0.4;
          const maxZ = plat.z + plat.depth / 2 + 0.4;
          const platTop = plat.y + plat.height / 2;

          if (p.x >= minX && p.x <= maxX && p.z >= minZ && p.z <= maxZ) {
            if (p.y <= platTop + 0.1 && p.y >= platTop - 0.8 && p.vy <= 0) {
              p.y = platTop;
              p.vy = 0;
              grounded = true;
            }
          }
        });

        if (grounded) {
          p.isGrounded = true;
          p.isJumping = false;
        } else {
          p.isGrounded = false;
        }

        // Desk Fall Reset Boundary
        if (p.y < -5) {
          p.x = p === p1 ? puzzle.p1Spawn.x : puzzle.p2Spawn.x;
          p.y = p === p1 ? puzzle.p1Spawn.y + 2 : puzzle.p2Spawn.y + 2;
          p.z = p === p1 ? puzzle.p1Spawn.z : puzzle.p2Spawn.z;
          p.vy = 0;
        }
      });

      // Update 3D Meshes
      roseGroup.position.set(p1.x, p1.y, p1.z);
      roseGroup.rotation.y = p1.rotY;

      aryaGroup.position.set(p2.x, p2.y, p2.z);
      aryaGroup.rotation.y = p2.rotY;

      // Handle Levers & Interactive Objects Interactions
      puzzle.objects.forEach((obj) => {
        const p1Dist = Math.hypot(p1.x - obj.x, p1.z - obj.z);
        const p2Dist = Math.hypot(p2.x - obj.x, p2.z - obj.z);

        if (obj.type === 'LEVER') {
          const isActivated = (p1Dist < 1.8 && p1.isUsingAbility) || (p2Dist < 1.8 && p2.isUsingAbility);
          if (isActivated && !objectsStateRef.current[obj.id]?.state) {
            objectsStateRef.current[obj.id] = { state: true };
            const leverMesh = interactiveMeshes.find((m) => m.id === obj.id);
            if (leverMesh) {
              const handle = leverMesh.mesh.getObjectByName('lever_handle');
              if (handle) handle.rotation.z = Math.PI / 4;
            }

            // Trigger target platform/bridge
            if (obj.targetId) {
              const targetPlat = platformMeshes.find((pm) => pm.id === obj.targetId);
              if (targetPlat) {
                targetPlat.mesh.position.y = targetPlat.data.y + 1.5;
              }
            }
          }
        }
      });

      // Check Goal Condition
      const p1GoalDist = Math.hypot(p1.x - puzzle.goalPos.x, p1.z - puzzle.goalPos.z);
      const p2GoalDist = Math.hypot(p2.x - puzzle.goalPos.x, p2.z - puzzle.goalPos.z);

      if (p1GoalDist < puzzle.goalRadius && p2GoalDist < puzzle.goalRadius && !isCompletedRef.current) {
        isCompletedRef.current = true;
        setIsCompleted(true);
        onPuzzleComplete();
      }

      // Camera Smooth Follow Both Dolls
      const avgX = (p1.x + p2.x) / 2;
      const avgZ = (p1.z + p2.z) / 2;
      camera.position.x += (avgX - camera.position.x) * 0.05;
      camera.position.z += (avgZ + 18 - camera.position.z) * 0.05;
      camera.lookAt(avgX, 2, avgZ);

      // Sync state over WebSockets if Online
      if (wsSocket && wsSocket.readyState === WebSocket.OPEN && gameMode === 'ONLINE') {
        wsSocket.send(
          JSON.stringify({
            type: 'SYNC_STATE',
            payload: {
              role: playerRole,
              state: playerRole === 'ROSE' || playerRole === 'AETHER' ? { p1: p1 } : { p2: p2 },
            },
          })
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler with ResizeObserver
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [puzzle, playerRole, gameMode, wsSocket, customizationSettings]);

  // Touch & On-Screen Control Button Trigger
  const handleKeyTrigger = (code: string, isDown: boolean) => {
    keysRef.current[code] = isDown;
  };

  const handleCopyLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-3xl overflow-hidden border-2 border-rose-500/30 shadow-2xl bg-slate-950 select-none flex flex-col">
      
      {/* 3D WebGL Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Navigation Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
        
        {/* Rose Player Card */}
        <div className="flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-500/40 shadow-lg pointer-events-auto">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-md text-base">
            🌹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-rose-300">
                {lang === 'fa' ? 'رز (Rose)' : 'Rose'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                WASD + F/G
              </span>
            </div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-300"
                style={{ width: `${roseEnergy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Online Room Code Status Bar */}
        {gameMode === 'ONLINE' && roomCode && (
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/40 shadow-xl pointer-events-auto">
            <Globe2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {roomCode}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${partnerConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'}`}>
              {partnerConnected ? (lang === 'fa' ? '🟢 آنلاین' : '🟢 Connected') : (lang === 'fa' ? '🔴 در انتظار هم‌بازی...' : '🔴 Waiting...')}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'کپی شد!' : 'کپی لینک'}</span>
            </button>
          </div>
        )}

        {/* Arya Player Card */}
        <div className="flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-sky-500/40 shadow-lg pointer-events-auto">
          <div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                جهتی + K/L
              </span>
              <span className="text-xs font-bold text-sky-300">
                {lang === 'fa' ? 'آریا (Arya)' : 'Arya'}
              </span>
            </div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700 ml-auto">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${aryaEnergy}%` }}
              />
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md text-base">
            ⚙️
          </div>
        </div>
      </div>

      {/* Romantic Lore Banner Overlay */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-rose-500/30 text-rose-200 text-[11px] text-center shadow-xl max-w-md pointer-events-none hidden sm:block">
        ❤️ {puzzle.romanticPrompt[lang]}
      </div>

      {/* On-Screen Interactive Touch & Mouse Control Panels */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-auto gap-2 flex-wrap">
        
        {/* Left Control Panel: Rose (WASD + Jump + Whip/Magnet) */}
        {(gameMode === 'LOCAL' || playerRole === 'ROSE' || playerRole === 'AETHER') && (
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-rose-500/40 shadow-2xl flex items-center gap-2">
            {/* D-Pad */}
            <div className="grid grid-cols-3 gap-1">
              <div />
              <button
                onMouseDown={() => handleKeyTrigger('KeyW', true)}
                onMouseUp={() => handleKeyTrigger('KeyW', false)}
                onTouchStart={() => handleKeyTrigger('KeyW', true)}
                onTouchEnd={() => handleKeyTrigger('KeyW', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-rose-600 text-white font-bold rounded-lg text-xs shadow"
              >
                W
              </button>
              <div />
              <button
                onMouseDown={() => handleKeyTrigger('KeyA', true)}
                onMouseUp={() => handleKeyTrigger('KeyA', false)}
                onTouchStart={() => handleKeyTrigger('KeyA', true)}
                onTouchEnd={() => handleKeyTrigger('KeyA', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-rose-600 text-white font-bold rounded-lg text-xs shadow"
              >
                A
              </button>
              <button
                onMouseDown={() => handleKeyTrigger('KeyS', true)}
                onMouseUp={() => handleKeyTrigger('KeyS', false)}
                onTouchStart={() => handleKeyTrigger('KeyS', true)}
                onTouchEnd={() => handleKeyTrigger('KeyS', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-rose-600 text-white font-bold rounded-lg text-xs shadow"
              >
                S
              </button>
              <button
                onMouseDown={() => handleKeyTrigger('KeyD', true)}
                onMouseUp={() => handleKeyTrigger('KeyD', false)}
                onTouchStart={() => handleKeyTrigger('KeyD', true)}
                onTouchEnd={() => handleKeyTrigger('KeyD', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-rose-600 text-white font-bold rounded-lg text-xs shadow"
              >
                D
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              <button
                onMouseDown={() => handleKeyTrigger('Space', true)}
                onMouseUp={() => handleKeyTrigger('Space', false)}
                onTouchStart={() => handleKeyTrigger('Space', true)}
                onTouchEnd={() => handleKeyTrigger('Space', false)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow"
              >
                پرش (Space)
              </button>
              <button
                onMouseDown={() => handleKeyTrigger('KeyF', true)}
                onMouseUp={() => handleKeyTrigger('KeyF', false)}
                onTouchStart={() => handleKeyTrigger('KeyF', true)}
                onTouchEnd={() => handleKeyTrigger('KeyF', false)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold rounded-lg text-[10px] shadow"
              >
                اهرم/شلاق (F)
              </button>
            </div>
          </div>
        )}

        {/* Right Control Panel: Arya (Arrows + Jump + Time/Clockwork) */}
        {(gameMode === 'LOCAL' || playerRole === 'ARYA' || playerRole === 'CHRONO') && (
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-sky-500/40 shadow-2xl flex items-center gap-2 ml-auto">
            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              <button
                onMouseDown={() => handleKeyTrigger('ShiftLeft', true)}
                onMouseUp={() => handleKeyTrigger('ShiftLeft', false)}
                onTouchStart={() => handleKeyTrigger('ShiftLeft', true)}
                onTouchEnd={() => handleKeyTrigger('ShiftLeft', false)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-lg text-[10px] shadow"
              >
                پرش (Shift)
              </button>
              <button
                onMouseDown={() => handleKeyTrigger('KeyK', true)}
                onMouseUp={() => handleKeyTrigger('KeyK', false)}
                onTouchStart={() => handleKeyTrigger('KeyK', true)}
                onTouchEnd={() => handleKeyTrigger('KeyK', false)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-lg text-[10px] shadow"
              >
                اهرم/زمان (K)
              </button>
            </div>

            {/* Arrow D-Pad */}
            <div className="grid grid-cols-3 gap-1">
              <div />
              <button
                onMouseDown={() => handleKeyTrigger('ArrowUp', true)}
                onMouseUp={() => handleKeyTrigger('ArrowUp', false)}
                onTouchStart={() => handleKeyTrigger('ArrowUp', true)}
                onTouchEnd={() => handleKeyTrigger('ArrowUp', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-white font-bold rounded-lg text-xs shadow"
              >
                ↑
              </button>
              <div />
              <button
                onMouseDown={() => handleKeyTrigger('ArrowLeft', true)}
                onMouseUp={() => handleKeyTrigger('ArrowLeft', false)}
                onTouchStart={() => handleKeyTrigger('ArrowLeft', true)}
                onTouchEnd={() => handleKeyTrigger('ArrowLeft', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-white font-bold rounded-lg text-xs shadow"
              >
                ←
              </button>
              <button
                onMouseDown={() => handleKeyTrigger('ArrowDown', true)}
                onMouseUp={() => handleKeyTrigger('ArrowDown', false)}
                onTouchStart={() => handleKeyTrigger('ArrowDown', true)}
                onTouchEnd={() => handleKeyTrigger('ArrowDown', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-white font-bold rounded-lg text-xs shadow"
              >
                ↓
              </button>
              <button
                onMouseDown={() => handleKeyTrigger('ArrowRight', true)}
                onMouseUp={() => handleKeyTrigger('ArrowRight', false)}
                onTouchStart={() => handleKeyTrigger('ArrowRight', true)}
                onTouchEnd={() => handleKeyTrigger('ArrowRight', false)}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-white font-bold rounded-lg text-xs shadow"
              >
                →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
