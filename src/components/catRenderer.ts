import type { CatSkin } from '../skins';

export interface SoftPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  angle: number;
}

export interface FloatingSnack {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
}

export interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  scale: number;
}

export function drawJellyCat(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  r: number,
  points: SoftPoint[],
  skin: CatSkin,
  expression: 'happy' | 'sleepy' | 'surprised' | 'playful',
  idleTime: number,
  earWiggleLeft: number,
  earWiggleRight: number,
  isBlinking: boolean
) {
  // 1. Soft Shadow
  ctx.save();
  const shadowW = r * 1.6 + Math.sin(idleTime * 2) * 8;
  const shadowH = 26;
  const shadowY = center.y + r * 0.95;
  const gradShadow = ctx.createRadialGradient(center.x, shadowY, 0, center.x, shadowY, shadowW);
  gradShadow.addColorStop(0, skin.shadowColor);
  gradShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradShadow;
  ctx.beginPath();
  ctx.ellipse(center.x, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Tail
  ctx.save();
  const tailBaseX = center.x + r * 0.75;
  const tailBaseY = center.y + r * 0.45;
  const tailWiggle = Math.sin(idleTime * 4) * 25;
  ctx.beginPath();
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(tailBaseX + 45 + tailWiggle * 0.5, tailBaseY - 20, tailBaseX + 50 + tailWiggle, tailBaseY - 60);
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.strokeStyle = skin.bodyColor;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = skin.outlineColor;
  ctx.stroke();
  ctx.restore();

  // 3. Ears
  const drawEar = (isLeft: boolean) => {
    ctx.save();
    const baseAngle = isLeft ? -Math.PI * 0.68 : -Math.PI * 0.32;
    const earX = center.x + Math.cos(baseAngle) * (r * 0.88);
    const earY = center.y + Math.sin(baseAngle) * (r * 0.88);
    const wiggle = isLeft ? earWiggleLeft : earWiggleRight;

    ctx.translate(earX, earY);
    ctx.rotate(wiggle + (isLeft ? -0.2 : 0.2));

    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-14, -50, isLeft ? -24 : 24, -65);
    ctx.quadraticCurveTo(10, -50, 18, 0);
    ctx.closePath();
    ctx.fillStyle = skin.bodyColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = skin.outlineColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.quadraticCurveTo(-6, -38, isLeft ? -16 : 16, -48);
    ctx.quadraticCurveTo(6, -38, 10, -5);
    ctx.closePath();
    ctx.fillStyle = skin.innerEarColor;
    ctx.fill();
    ctx.restore();
  };

  drawEar(true);
  drawEar(false);

  // 4. Soft Jelly Contour Spline
  if (points.length > 2) {
    ctx.save();
    ctx.beginPath();
    const firstMidX = (points[0].x + points[points.length - 1].x) / 2;
    const firstMidY = (points[0].y + points[points.length - 1].y) / 2;
    ctx.moveTo(firstMidX, firstMidY);

    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length];
      const midX = (points[i].x + next.x) / 2;
      const midY = (points[i].y + next.y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.closePath();

    const bodyGrad = ctx.createRadialGradient(
      center.x - r * 0.25,
      center.y - r * 0.3,
      r * 0.1,
      center.x,
      center.y,
      r * 1.15
    );
    bodyGrad.addColorStop(0, skin.highlightColor);
    bodyGrad.addColorStop(0.35, skin.bodyColor);
    bodyGrad.addColorStop(0.92, skin.bodyColor);
    bodyGrad.addColorStop(1, skin.outlineColor);

    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = skin.outlineColor;
    ctx.stroke();

    // Glossy Highlights
    ctx.beginPath();
    ctx.ellipse(center.x - r * 0.35, center.y - r * 0.45, r * 0.28, r * 0.14, -0.35, 0, Math.PI * 2);
    ctx.fillStyle = skin.highlightColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center.x - r * 0.15, center.y - r * 0.55, 6, 0, Math.PI * 2);
    ctx.fillStyle = skin.highlightColor;
    ctx.fill();
    ctx.restore();
  }

  // 5. Face details
  const faceCenterX = center.x;
  const faceCenterY = center.y - r * 0.05;

  // Cheeks
  ctx.save();
  ctx.fillStyle = skin.cheekColor;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(faceCenterX - r * 0.42, faceCenterY + 12, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(faceCenterX + r * 0.42, faceCenterY + 12, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Whiskers
  ctx.save();
  ctx.strokeStyle = skin.outlineColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(faceCenterX - r * 0.42, faceCenterY);
  ctx.lineTo(faceCenterX - r * 0.78, faceCenterY - 6);
  ctx.moveTo(faceCenterX - r * 0.42, faceCenterY + 8);
  ctx.lineTo(faceCenterX - r * 0.76, faceCenterY + 12);
  ctx.moveTo(faceCenterX + r * 0.42, faceCenterY);
  ctx.lineTo(faceCenterX + r * 0.78, faceCenterY - 6);
  ctx.moveTo(faceCenterX + r * 0.42, faceCenterY + 8);
  ctx.lineTo(faceCenterX + r * 0.76, faceCenterY + 12);
  ctx.stroke();
  ctx.restore();

  // Eyes
  const eyeOffsetX = r * 0.28;
  const eyeY = faceCenterY - 6;
  const isBlink = isBlinking || expression === 'sleepy';

  const drawEye = (isLeft: boolean) => {
    const eyeX = isLeft ? faceCenterX - eyeOffsetX : faceCenterX + eyeOffsetX;
    ctx.save();

    if (isBlink) {
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 4, 11, Math.PI * 1.15, Math.PI * 1.85);
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = skin.eyeColor;
      ctx.stroke();
    } else if (expression === 'happy') {
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 6, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = skin.eyeColor;
      ctx.stroke();
    } else {
      const eyeRadius = expression === 'surprised' ? 14 : 11;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fillStyle = skin.eyeColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eyeX - eyeRadius * 0.35, eyeY - eyeRadius * 0.35, eyeRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = skin.pupilColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eyeX + eyeRadius * 0.3, eyeY + eyeRadius * 0.3, eyeRadius * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = skin.pupilColor;
      ctx.fill();
    }
    ctx.restore();
  };

  drawEye(true);
  drawEye(false);

  // Nose
  ctx.save();
  ctx.fillStyle = skin.cheekColor;
  ctx.beginPath();
  ctx.moveTo(faceCenterX, faceCenterY + 5);
  ctx.lineTo(faceCenterX - 5, faceCenterY + 1);
  ctx.lineTo(faceCenterX + 5, faceCenterY + 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Mouth
  ctx.save();
  ctx.strokeStyle = skin.eyeColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (expression === 'surprised') {
    ctx.ellipse(faceCenterX, faceCenterY + 15, 6, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff7096';
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.arc(faceCenterX - 6, faceCenterY + 11, 7, 0.1, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(faceCenterX + 6, faceCenterY + 11, 7, 0.15, Math.PI * 0.9);
    ctx.stroke();
  }
  ctx.restore();
}
