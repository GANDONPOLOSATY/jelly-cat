import { useEffect, useRef, useCallback } from 'react';
import type { CatSkin } from './skins';
import { sound } from './audio';
import { drawJellyCat, type SoftPoint, type FloatingSnack, type FloatingHeart } from './components/catRenderer';

interface JellyCanvasProps {
  skin: CatSkin;
  expression: 'happy' | 'sleepy' | 'surprised' | 'playful';
  onPet: () => void;
  onFed: () => void;
  squishCount: number;
  onSquish: () => void;
}

export const JellyCanvas: React.FC<JellyCanvasProps> = ({
  skin,
  expression,
  onPet,
  onFed,
  onSquish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const centerRef = useRef({ x: 300, y: 350 });
  const baseRadiusRef = useRef(140);
  const pointsRef = useRef<SoftPoint[]>([]);

  const isDraggingRef = useRef(false);
  const dragPointIndexRef = useRef<number | null>(null);
  const dragCenterRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const petDistanceRef = useRef(0);

  const snacksRef = useRef<FloatingSnack[]>([]);
  const heartsRef = useRef<FloatingHeart[]>([]);

  const isBlinkingRef = useRef(false);
  const earWiggleLeftRef = useRef({ angle: 0, v: 0 });
  const earWiggleRightRef = useRef({ angle: 0, v: 0 });
  const idleTimeRef = useRef(0);

  const NUM_POINTS = 32;

  useEffect(() => {
    const pts: SoftPoint[] = [];
    const r = baseRadiusRef.current;
    for (let i = 0; i < NUM_POINTS; i++) {
      const angle = (i / NUM_POINTS) * Math.PI * 2;
      pts.push({
        x: centerRef.current.x + Math.cos(angle) * (r * 1.05),
        y: centerRef.current.y + Math.sin(angle) * (r * 0.95),
        vx: 0,
        vy: 0,
        baseRadius: r,
        angle
      });
    }
    pointsRef.current = pts;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const size = Math.min(rect.width, rect.height);
      const targetRadius = Math.max(90, Math.min(160, size * 0.26));
      baseRadiusRef.current = targetRadius;
      centerRef.current = {
        x: rect.width / 2,
        y: rect.height / 2 + 10
      };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.35 && !isBlinkingRef.current) {
        isBlinkingRef.current = true;
        setTimeout(() => {
          isBlinkingRef.current = false;
        }, 180);
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const spawnSnack = useCallback((clientX?: number, clientY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX !== undefined ? clientX - rect.left : centerRef.current.x + (Math.random() - 0.5) * 180;
    const y = clientY !== undefined ? clientY - rect.top : 40;

    const treats = ['🐟', '🍣', '🦐', '🧀', '🥛', '🍪'];
    const emoji = treats[Math.floor(Math.random() * treats.length)];

    snacksRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: 1.5 + Math.random() * 2,
      emoji
    });
    sound.playBoing();
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const dx = clickX - centerRef.current.x;
    const dy = clickY - centerRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < baseRadiusRef.current * 1.3) {
      sound.playSquish(0.8);
      onSquish();
      pointsRef.current.forEach(p => {
        const pdx = p.x - clickX;
        const pdy = p.y - clickY;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        const force = Math.max(0, 70 - pdist * 0.4);
        p.vx += (pdx / pdist) * force * 0.6;
        p.vy += (pdy / pdist) * force * 0.6;
      });
      earWiggleLeftRef.current.v = 0.45;
      earWiggleRightRef.current.v = -0.45;

      heartsRef.current.push({
        id: Math.random(),
        x: clickX,
        y: clickY - 20,
        vy: -2 - Math.random() * 2,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.5
      });
    }
  };

  const onPointerDown = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    lastMousePosRef.current = { x, y };
    isDraggingRef.current = true;
    sound.startPurr();

    const dx = x - centerRef.current.x;
    const dy = y - centerRef.current.y;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distFromCenter < baseRadiusRef.current * 0.65) {
      dragCenterRef.current = true;
    } else {
      let closestIdx = -1;
      let minDist = 9999;
      pointsRef.current.forEach((p, idx) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < minDist) {
          minDist = d;
          closestIdx = idx;
        }
      });
      if (minDist < baseRadiusRef.current * 0.8) {
        dragPointIndexRef.current = closestIdx;
      }
    }
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dx = x - lastMousePosRef.current.x;
    const dy = y - lastMousePosRef.current.y;
    lastMousePosRef.current = { x, y };

    if (!isDraggingRef.current) return;

    const moveDist = Math.hypot(dx, dy);
    petDistanceRef.current += moveDist;
    if (petDistanceRef.current > 200) {
      petDistanceRef.current = 0;
      onPet();
      sound.playSquish(0.4);
      heartsRef.current.push({
        id: Math.random(),
        x: x + (Math.random() - 0.5) * 40,
        y: y - 20,
        vy: -2,
        opacity: 1,
        scale: 0.9
      });
    }

    if (dragCenterRef.current) {
      centerRef.current.x += dx * 0.6;
      centerRef.current.y += dy * 0.6;
      pointsRef.current.forEach(p => {
        p.vx += dx * 0.3;
        p.vy += dy * 0.3;
      });
    } else if (dragPointIndexRef.current !== null) {
      const idx = dragPointIndexRef.current;
      const pt = pointsRef.current[idx];
      pt.x = x;
      pt.y = y;
      pt.vx = dx * 0.5;
      pt.vy = dy * 0.5;

      const n = NUM_POINTS;
      const prev = pointsRef.current[(idx - 1 + n) % n];
      const next = pointsRef.current[(idx + 1) % n];
      prev.vx += dx * 0.25;
      prev.vy += dy * 0.25;
      next.vx += dx * 0.25;
      next.vy += dy * 0.25;
    }
  };

  const onPointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragPointIndexRef.current = null;
      dragCenterRef.current = false;
      sound.stopPurr();
      sound.playBoing();
      pointsRef.current.forEach(p => {
        p.vx += (Math.random() - 0.5) * 15;
        p.vy += (Math.random() - 0.5) * 15;
      });
    }
  };

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      idleTimeRef.current += 0.025;
      const idleTime = idleTimeRef.current;

      const targetCenterX = width / 2;
      const targetCenterY = height / 2 + 10;
      if (!dragCenterRef.current) {
        centerRef.current.x += (targetCenterX - centerRef.current.x) * 0.05;
        centerRef.current.y += (targetCenterY - centerRef.current.y) * 0.05;
      }

      const r = baseRadiusRef.current;
      const points = pointsRef.current;
      const k = skin.springStiffness;
      const damp = skin.damping;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (isDraggingRef.current && dragPointIndexRef.current === i) {
          continue;
        }

        const breathe = Math.sin(idleTime * 2.5 + p.angle * 2) * (r * 0.035);
        const restX = centerRef.current.x + Math.cos(p.angle) * (r + breathe);
        const restY = centerRef.current.y + Math.sin(p.angle) * (r * 0.92 + breathe);

        const fx = (restX - p.x) * k;
        const fy = (restY - p.y) * k;

        const prev = points[(i - 1 + points.length) % points.length];
        const next = points[(i + 1) % points.length];
        const neighborFx = (prev.x + next.x - 2 * p.x) * 0.12;
        const neighborFy = (prev.y + next.y - 2 * p.y) * 0.12;

        p.vx = (p.vx + fx + neighborFx) * damp;
        p.vy = (p.vy + fy + neighborFy) * damp;

        p.x += p.vx;
        p.y += p.vy;
      }

      earWiggleLeftRef.current.v += (-earWiggleLeftRef.current.angle * 0.18);
      earWiggleLeftRef.current.v *= 0.85;
      earWiggleLeftRef.current.angle += earWiggleLeftRef.current.v;

      earWiggleRightRef.current.v += (-earWiggleRightRef.current.angle * 0.18);
      earWiggleRightRef.current.v *= 0.85;
      earWiggleRightRef.current.angle += earWiggleRightRef.current.v;

      drawJellyCat(
        ctx,
        centerRef.current,
        r,
        points,
        skin,
        expression,
        idleTime,
        earWiggleLeftRef.current.angle,
        earWiggleRightRef.current.angle,
        isBlinkingRef.current
      );

      // Snacks
      for (let i = snacksRef.current.length - 1; i >= 0; i--) {
        const s = snacksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.25;

        const dx = s.x - centerRef.current.x;
        const dy = s.y - centerRef.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist < r * 0.85) {
          sound.playChomp();
          sound.playMeow(skin.pitchMultiplier);
          onFed();
          pointsRef.current.forEach(p => {
            p.vy += (Math.random() - 0.5) * 16;
            p.vx += (Math.random() - 0.5) * 16;
          });
          for (let h = 0; h < 4; h++) {
            heartsRef.current.push({
              id: Math.random(),
              x: s.x + (Math.random() - 0.5) * 30,
              y: s.y,
              vy: -2.5 - Math.random() * 2,
              opacity: 1,
              scale: 0.9 + Math.random() * 0.5
            });
          }
          snacksRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.emoji, s.x, s.y);
        ctx.restore();

        if (s.y > height + 50) {
          snacksRef.current.splice(i, 1);
        }
      }

      // Hearts
      for (let i = heartsRef.current.length - 1; i >= 0; i--) {
        const h = heartsRef.current[i];
        h.y += h.vy;
        h.opacity -= 0.016;
        h.scale += 0.005;

        if (h.opacity <= 0) {
          heartsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, h.opacity);
        ctx.font = `${Math.round(24 * h.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('💖', h.x, h.y);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skin, expression, onFed]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none touch-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={onPointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => spawnSnack()}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-transform"
          title="Покормить котика вкусняшкой"
        >
          <span className="text-xl">🐟</span>
          <span className="text-xs font-medium tracking-wide">Угостить</span>
        </button>
      </div>
    </div>
  );
};
