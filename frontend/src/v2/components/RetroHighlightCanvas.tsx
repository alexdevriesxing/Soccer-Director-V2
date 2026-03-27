import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HighlightItem } from '../types';

interface RetroHighlightCanvasProps {
  highlights: HighlightItem[];
  homeScore: number;
  awayScore: number;
}

type RenderEventKind =
  | 'GOAL'
  | 'MISS'
  | 'SAVE'
  | 'WOODWORK'
  | 'BLOCKED_SHOT'
  | 'OFFSIDE'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'PENALTY_GOAL'
  | 'PENALTY_MISS'
  | 'BIG_CHANCE'
  | 'TURNOVER_CHANCE'
  | 'TACTICAL_SHIFT'
  | 'HALFTIME'
  | 'FULL_TIME'
  | 'OTHER';

interface Vec2 {
  x: number;
  y: number;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const PITCH = {
  x: 58,
  y: 54,
  width: 844,
  height: 432
};

const SPEED_OPTIONS = [0.75, 1, 1.5, 2];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function lerpVec(from: Vec2, to: Vec2, t: number): Vec2 {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t)
  };
}

function easeInOutCubic(t: number): number {
  const v = clamp(t, 0, 1);
  return v < 0.5
    ? 4 * v * v * v
    : 1 - Math.pow(-2 * v + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  const v = clamp(t, 0, 1);
  return 1 - Math.pow(1 - v, 3);
}

function normalize(vec: Vec2): Vec2 {
  const length = Math.hypot(vec.x, vec.y) || 1;
  return {
    x: vec.x / length,
    y: vec.y / length
  };
}

function toPitchPoint(fromX?: number, fromY?: number): Vec2 {
  const xPct = clamp(fromX ?? 50, 0, 100);
  const yPct = clamp(fromY ?? 50, 0, 100);
  return {
    x: PITCH.x + (xPct / 100) * PITCH.width,
    y: PITCH.y + (yPct / 100) * PITCH.height
  };
}

function quadraticBezier(from: Vec2, control: Vec2, to: Vec2, t: number): Vec2 {
  const v = clamp(t, 0, 1);
  const inv = 1 - v;
  return {
    x: inv * inv * from.x + 2 * inv * v * control.x + v * v * to.x,
    y: inv * inv * from.y + 2 * inv * v * control.y + v * v * to.y
  };
}

function eventDurationMs(kind: RenderEventKind): number {
  switch (kind) {
    case 'GOAL':
    case 'PENALTY_GOAL':
      return 2800;
    case 'SAVE':
      return 2400;
    case 'WOODWORK':
    case 'BLOCKED_SHOT':
    case 'OFFSIDE':
      return 2100;
    case 'MISS':
    case 'PENALTY_MISS':
      return 2300;
    case 'YELLOW_CARD':
    case 'RED_CARD':
      return 2200;
    case 'SUBSTITUTION':
      return 2100;
    case 'BIG_CHANCE':
    case 'TURNOVER_CHANCE':
    case 'TACTICAL_SHIFT':
      return 2000;
    case 'HALFTIME':
    case 'FULL_TIME':
      return 1800;
    default:
      return 1900;
  }
}

function resolveEventKind(eventType: string): RenderEventKind {
  const normalized = (eventType || '').toUpperCase();
  if (normalized === 'GOAL') return 'GOAL';
  if (normalized === 'MISS') return 'MISS';
  if (normalized === 'SAVE') return 'SAVE';
  if (normalized === 'WOODWORK') return 'WOODWORK';
  if (normalized === 'BLOCKED_SHOT') return 'BLOCKED_SHOT';
  if (normalized === 'OFFSIDE') return 'OFFSIDE';
  if (normalized === 'YELLOW_CARD') return 'YELLOW_CARD';
  if (normalized === 'RED_CARD') return 'RED_CARD';
  if (normalized === 'SUBSTITUTION') return 'SUBSTITUTION';
  if (normalized === 'PENALTY_GOAL') return 'PENALTY_GOAL';
  if (normalized === 'PENALTY_MISS') return 'PENALTY_MISS';
  if (normalized === 'BIG_CHANCE') return 'BIG_CHANCE';
  if (normalized === 'TURNOVER_CHANCE') return 'TURNOVER_CHANCE';
  if (normalized === 'TACTICAL_SHIFT') return 'TACTICAL_SHIFT';
  if (normalized === 'HALFTIME') return 'HALFTIME';
  if (normalized === 'FULL_TIME') return 'FULL_TIME';
  return 'OTHER';
}

function labelForEvent(kind: RenderEventKind): string {
  switch (kind) {
    case 'GOAL':
      return 'Goal';
    case 'MISS':
      return 'Miss';
    case 'SAVE':
      return 'Save';
    case 'WOODWORK':
      return 'Woodwork';
    case 'BLOCKED_SHOT':
      return 'Blocked Shot';
    case 'OFFSIDE':
      return 'Offside';
    case 'YELLOW_CARD':
      return 'Yellow Card';
    case 'RED_CARD':
      return 'Red Card';
    case 'SUBSTITUTION':
      return 'Substitution';
    case 'PENALTY_GOAL':
      return 'Penalty Goal';
    case 'PENALTY_MISS':
      return 'Penalty Miss';
    case 'BIG_CHANCE':
      return 'Big Chance';
    case 'TURNOVER_CHANCE':
      return 'Turnover Chance';
    case 'TACTICAL_SHIFT':
      return 'Tactical Shift';
    case 'HALFTIME':
      return 'Halftime';
    case 'FULL_TIME':
      return 'Full Time';
    default:
      return 'Highlight';
  }
}

function hashFromString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGradient.addColorStop(0, '#0a1820');
  skyGradient.addColorStop(1, '#071016');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawPitch(ctx: CanvasRenderingContext2D): void {
  const stripeCount = 12;
  const stripeWidth = PITCH.width / stripeCount;
  for (let i = 0; i < stripeCount; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#2b7e43' : '#2f8d4b';
    ctx.fillRect(PITCH.x + i * stripeWidth, PITCH.y, stripeWidth + 1, PITCH.height);
  }

  ctx.strokeStyle = '#d8ffe5';
  ctx.lineWidth = 2;
  ctx.strokeRect(PITCH.x, PITCH.y, PITCH.width, PITCH.height);

  const centerX = PITCH.x + PITCH.width / 2;
  const centerY = PITCH.y + PITCH.height / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, PITCH.y);
  ctx.lineTo(centerX, PITCH.y + PITCH.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 48, 0, Math.PI * 2);
  ctx.stroke();

  const boxDepth = 120;
  const boxHeight = 170;
  const boxY = centerY - boxHeight / 2;

  ctx.strokeRect(PITCH.x, boxY, boxDepth, boxHeight);
  ctx.strokeRect(PITCH.x + PITCH.width - boxDepth, boxY, boxDepth, boxHeight);

  ctx.fillStyle = '#d8ffe5';
  ctx.fillRect(PITCH.x - 6, centerY - 42, 6, 84);
  ctx.fillRect(PITCH.x + PITCH.width, centerY - 42, 6, 84);
}

function drawPixelPlayer(
  ctx: CanvasRenderingContext2D,
  position: Vec2,
  color: string,
  direction: 'left' | 'right',
  scale = 1,
  opacity = 1
): void {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(position.x, position.y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#f8dfc5';
  ctx.fillRect(-4, -18, 8, 7);

  ctx.fillStyle = color;
  ctx.fillRect(-5, -11, 10, 12);
  ctx.fillRect(-4, 1, 3, 8);
  ctx.fillRect(1, 1, 3, 8);

  ctx.fillStyle = '#e7fff3';
  if (direction === 'right') {
    ctx.fillRect(4, -8, 4, 2);
  } else {
    ctx.fillRect(-8, -8, 4, 2);
  }

  ctx.restore();
}

function drawReferee(ctx: CanvasRenderingContext2D, position: Vec2, opacity = 1): void {
  drawPixelPlayer(ctx, position, '#1a1d21', 'right', 1, opacity);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#f4f8ff';
  ctx.fillRect(position.x - 3, position.y - 9, 6, 3);
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, position: Vec2, radius = 5): void {
  ctx.save();
  ctx.fillStyle = '#fff6ae';
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3f513a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawShotTrail(ctx: CanvasRenderingContext2D, from: Vec2, to: Vec2, color: string): void {
  ctx.save();
  const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  gradient.addColorStop(0, `${color}33`);
  gradient.addColorStop(0.55, `${color}99`);
  gradient.addColorStop(1, `${color}dd`);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawPulseRing(ctx: CanvasRenderingContext2D, center: Vec2, color: string, progress: number): void {
  const radius = 10 + 28 * progress;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = clamp(1 - progress, 0, 1);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGoalRipple(ctx: CanvasRenderingContext2D, point: Vec2, progress: number): void {
  const wave = 8 + progress * 16;
  ctx.save();
  ctx.strokeStyle = '#ccf8dc';
  ctx.globalAlpha = clamp(1 - progress * 0.8, 0, 1);
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, wave + i * 7, 8 + i * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCelebrationParticles(ctx: CanvasRenderingContext2D, seedText: string, anchor: Vec2, progress: number): void {
  const random = seededRandom(hashFromString(seedText));
  const intensity = clamp((progress - 0.65) / 0.35, 0, 1);
  const count = 22;

  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 14 + random() * 95 * intensity;
    const size = 2 + random() * 3;
    const x = anchor.x + Math.cos(angle) * distance;
    const y = anchor.y + Math.sin(angle) * distance;
    ctx.fillStyle = i % 2 === 0 ? '#8cf3c2' : '#f7ff95';
    ctx.globalAlpha = 0.25 + 0.65 * intensity;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  ctx.restore();
}

function drawCardSymbol(
  ctx: CanvasRenderingContext2D,
  position: Vec2,
  cardColor: string,
  progress: number
): void {
  const lift = 26 + 20 * easeOutCubic(progress);
  ctx.save();
  ctx.translate(position.x + 8, position.y - lift);
  ctx.fillStyle = cardColor;
  ctx.strokeStyle = '#f1f9ff';
  ctx.lineWidth = 2;
  ctx.fillRect(-10, -18, 20, 28);
  ctx.strokeRect(-10, -18, 20, 28);
  ctx.restore();
}

function getGoalkeeperBase(target: Vec2): Vec2 {
  const rightSide = target.x >= PITCH.x + PITCH.width / 2;
  return {
    x: rightSide ? PITCH.x + PITCH.width - 14 : PITCH.x + 14,
    y: clamp(target.y, PITCH.y + 70, PITCH.y + PITCH.height - 70)
  };
}

function resolveCamera(active: HighlightItem, progress: number, from: Vec2, to: Vec2): { x: number; y: number; zoom: number } {
  const path = String(active.cameraPath || '').toUpperCase();
  const preset = String(active.animationPreset || '').toUpperCase();

  let center = lerpVec(from, to, easeInOutCubic(Math.min(progress * 0.88, 1)));
  let zoom = 1.08;

  if (path.includes('REFEREE')) {
    center = lerpVec(from, to, 0.45);
    zoom = 1.24;
  } else if (path.includes('PENALTY')) {
    center = lerpVec(from, to, 0.7);
    zoom = 1.22;
  } else if (path.includes('MIDFIELD')) {
    center = {
      x: lerp(PITCH.x + PITCH.width * 0.32, PITCH.x + PITCH.width * 0.68, easeInOutCubic(progress)),
      y: PITCH.y + PITCH.height / 2
    };
    zoom = 1.14;
  } else if (path.includes('BOX')) {
    center = lerpVec(from, to, 0.74);
    zoom = 1.17;
  }

  if (preset.includes('PENALTY')) {
    zoom = Math.max(zoom, 1.2);
  }
  if (preset.includes('CARD')) {
    zoom = Math.max(zoom, 1.2);
  }

  const viewWidth = CANVAS_WIDTH / zoom;
  const viewHeight = CANVAS_HEIGHT / zoom;

  return {
    x: clamp(center.x, PITCH.x + viewWidth / 2, PITCH.x + PITCH.width - viewWidth / 2),
    y: clamp(center.y, PITCH.y + viewHeight / 2, PITCH.y + PITCH.height - viewHeight / 2),
    zoom
  };
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  active: HighlightItem,
  kind: RenderEventKind,
  progress: number
): void {
  const from = toPitchPoint(active.fromX, active.fromY);
  const to = toPitchPoint(active.toX, active.toY);

  const homeColor = '#6dc8ff';
  const awayColor = '#ff8f7a';
  const offenseColor = active.teamSide === 'away' ? awayColor : homeColor;
  const defenseColor = active.teamSide === 'away' ? homeColor : awayColor;

  const camera = resolveCamera(active, progress, from, to);

  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  drawPitch(ctx);

  const baselinePath = lerpVec(from, to, clamp(progress * 0.75 + 0.2, 0, 1));

  switch (kind) {
    case 'GOAL':
    case 'PENALTY_GOAL': {
      const control = {
        x: lerp(from.x, to.x, 0.55),
        y: Math.min(from.y, to.y) - 92
      };
      const t = clamp(progress * 1.2, 0, 1);
      const ball = quadraticBezier(from, control, to, t);
      const attacker = lerpVec(from, to, clamp(0.32 + progress * 0.28, 0, 0.74));
      const keeperBase = getGoalkeeperBase(to);
      const diveDirection = to.x >= PITCH.x + PITCH.width / 2 ? -1 : 1;
      const keeperDive = {
        x: keeperBase.x + diveDirection * (16 + 34 * easeOutCubic(progress)),
        y: lerp(keeperBase.y, to.y, 0.54)
      };

      drawShotTrail(ctx, from, ball, '#9cd8ff');
      drawPixelPlayer(ctx, attacker, offenseColor, to.x > from.x ? 'right' : 'left', 1.05);
      drawPixelPlayer(ctx, keeperDive, '#e3f06b', diveDirection > 0 ? 'right' : 'left', 1.05);
      drawBall(ctx, ball, 5);

      if (progress > 0.62) {
        drawGoalRipple(ctx, to, (progress - 0.62) / 0.38);
      }
      if (active.isDecisive && progress > 0.7) {
        drawCelebrationParticles(ctx, active.id, to, progress);
      }
      break;
    }

    case 'SAVE': {
      const intercept = lerpVec(from, to, 0.72);
      const control = {
        x: lerp(from.x, intercept.x, 0.5),
        y: Math.min(from.y, intercept.y) - 70
      };
      const t = clamp(progress * 1.3, 0, 1);
      const ball = quadraticBezier(from, control, intercept, t);
      const attacker = lerpVec(from, to, clamp(0.24 + progress * 0.26, 0, 0.64));
      const keeperBase = getGoalkeeperBase(intercept);
      const keeper = lerpVec(keeperBase, intercept, easeOutCubic(clamp(progress * 1.2, 0, 1)));

      drawShotTrail(ctx, from, intercept, '#8dc0ff');
      drawPixelPlayer(ctx, attacker, offenseColor, to.x > from.x ? 'right' : 'left');
      drawPixelPlayer(ctx, keeper, '#e3f06b', keeper.x < intercept.x ? 'right' : 'left', 1.08);
      drawBall(ctx, ball, 5);

      if (progress > 0.66) {
        drawPulseRing(ctx, intercept, '#9fe7ff', (progress - 0.66) / 0.34);
      }
      break;
    }

    case 'MISS':
    case 'PENALTY_MISS': {
      const direction = normalize({ x: to.x - from.x, y: to.y - from.y });
      const perpendicular = { x: -direction.y, y: direction.x };
      const missTarget = {
        x: to.x + direction.x * 42 + perpendicular.x * (active.teamSide === 'away' ? 34 : -34),
        y: to.y + direction.y * 42 + perpendicular.y * (active.teamSide === 'away' ? 34 : -34)
      };
      const control = {
        x: lerp(from.x, missTarget.x, 0.5),
        y: Math.min(from.y, missTarget.y) - 56
      };
      const t = clamp(progress * 1.22, 0, 1);
      const ball = quadraticBezier(from, control, missTarget, t);
      const attacker = lerpVec(from, to, clamp(0.26 + progress * 0.24, 0, 0.62));
      const keeper = getGoalkeeperBase(to);

      drawShotTrail(ctx, from, missTarget, '#ffbfa9');
      drawPixelPlayer(ctx, attacker, offenseColor, to.x > from.x ? 'right' : 'left');
      drawPixelPlayer(ctx, keeper, '#e3f06b', keeper.x < to.x ? 'right' : 'left');
      drawBall(ctx, ball, 5);

      if (progress > 0.76) {
        drawPulseRing(ctx, missTarget, '#ffd7a5', (progress - 0.76) / 0.24);
      }
      break;
    }

    case 'YELLOW_CARD':
    case 'RED_CARD': {
      const offender = lerpVec(from, to, 0.58);
      const referee = lerpVec(to, from, 0.32);
      const teammate = lerpVec(from, to, 0.34);

      drawPixelPlayer(ctx, offender, offenseColor, offender.x >= referee.x ? 'left' : 'right', 1.02);
      drawPixelPlayer(ctx, teammate, defenseColor, teammate.x >= offender.x ? 'left' : 'right', 0.95, 0.7);
      drawReferee(ctx, referee);
      if (progress > 0.35) {
        drawCardSymbol(
          ctx,
          referee,
          kind === 'RED_CARD' ? '#ff5757' : '#f7e16f',
          (progress - 0.35) / 0.65
        );
      }
      if (progress > 0.62) {
        drawPulseRing(ctx, offender, kind === 'RED_CARD' ? '#ff8c8c' : '#fff3a8', (progress - 0.62) / 0.38);
      }
      break;
    }

    case 'SUBSTITUTION': {
      const touchlineY = active.teamSide === 'away' ? PITCH.y + 30 : PITCH.y + PITCH.height - 30;
      const ease = easeInOutCubic(progress);
      const outgoing = {
        x: lerp(to.x, to.x + (active.teamSide === 'away' ? 58 : -58), ease),
        y: touchlineY
      };
      const incoming = {
        x: lerp(from.x + (active.teamSide === 'away' ? -58 : 58), from.x, ease),
        y: touchlineY
      };
      const official = {
        x: lerp(from.x, to.x, 0.52),
        y: touchlineY + (active.teamSide === 'away' ? 16 : -16)
      };

      drawPixelPlayer(ctx, outgoing, offenseColor, outgoing.x > incoming.x ? 'right' : 'left', 1, 0.58);
      drawPixelPlayer(ctx, incoming, offenseColor, incoming.x > outgoing.x ? 'right' : 'left', 1, 1);
      drawReferee(ctx, official, 0.92);
      drawPulseRing(ctx, official, '#8ae8c1', progress);
      break;
    }

    case 'BIG_CHANCE':
    case 'TURNOVER_CHANCE':
    case 'TACTICAL_SHIFT':
    case 'WOODWORK':
    case 'BLOCKED_SHOT':
    case 'OFFSIDE':
    case 'HALFTIME':
    case 'FULL_TIME':
    case 'OTHER': {
      const attacker = lerpVec(from, to, clamp(0.2 + progress * 0.32, 0, 0.72));
      const defender = lerpVec(to, from, clamp(0.16 + progress * 0.24, 0, 0.62));
      const control = {
        x: lerp(from.x, to.x, 0.5),
        y: Math.min(from.y, to.y) - 42
      };
      const ball = quadraticBezier(from, control, baselinePath, clamp(progress * 1.3, 0, 1));

      drawShotTrail(ctx, from, baselinePath, '#8cd4ff');
      drawPixelPlayer(ctx, attacker, offenseColor, attacker.x >= defender.x ? 'left' : 'right');
      drawPixelPlayer(ctx, defender, defenseColor, defender.x >= attacker.x ? 'left' : 'right', 0.98);
      drawBall(ctx, ball, 5);

      if (progress > 0.58) {
        drawPulseRing(ctx, to, '#9be8c3', (progress - 0.58) / 0.42);
      }
      break;
    }
  }

  ctx.restore();
}

const RetroHighlightCanvas: React.FC<RetroHighlightCanvasProps> = ({ highlights, homeScore, awayScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [playheadMs, setPlayheadMs] = useState(0);

  const active = useMemo(() => highlights[index] || null, [highlights, index]);
  const activeKind = useMemo(() => resolveEventKind(active?.eventType || ''), [active?.eventType]);
  const activeDuration = useMemo(() => eventDurationMs(activeKind), [activeKind]);

  useEffect(() => {
    if (highlights.length === 0) {
      setIndex(0);
      setPlayheadMs(0);
      setIsPlaying(false);
      return;
    }
    setIndex((prev) => clamp(prev, 0, highlights.length - 1));
  }, [highlights]);

  useEffect(() => {
    setPlayheadMs(0);
  }, [index]);

  useEffect(() => {
    if (!isPlaying || highlights.length === 0 || !active) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();

    const tick = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      setPlayheadMs((prev) => {
        const next = prev + delta * SPEED_OPTIONS[speedIndex];
        if (next >= activeDuration) {
          setIndex((current) => {
            if (highlights.length === 0) {
              return 0;
            }
            return (current + 1) % highlights.length;
          });
          return 0;
        }
        return next;
      });

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [active, activeDuration, highlights, isPlaying, speedIndex]);

  const progress = active ? clamp(playheadMs / activeDuration, 0, 1) : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBackground(ctx);

    if (!active) {
      drawPitch(ctx);
      ctx.fillStyle = '#effff6';
      ctx.textAlign = 'center';
      ctx.font = '600 18px Montserrat, sans-serif';
      ctx.fillText('No highlights generated yet.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    drawScene(ctx, active, activeKind, progress);

    ctx.fillStyle = 'rgba(5, 12, 10, 0.85)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 92, 14, 184, 36);
    ctx.fillStyle = '#ecfff5';
    ctx.textAlign = 'center';
    ctx.font = '700 24px "Press Start 2P", monospace';
    ctx.fillText(`${homeScore} - ${awayScore}`, CANVAS_WIDTH / 2, 40);

    ctx.fillStyle = 'rgba(2, 12, 9, 0.9)';
    ctx.fillRect(42, CANVAS_HEIGHT - 112, CANVAS_WIDTH - 84, 74);
    ctx.strokeStyle = 'rgba(155, 233, 194, 0.62)';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, CANVAS_HEIGHT - 112, CANVAS_WIDTH - 84, 74);

    const actorLabel = active.actorId ? ` | Player #${active.actorId}` : '';
    const presetLabel = active.animationPreset ? ` | ${active.animationPreset}` : '';

    ctx.textAlign = 'left';
    ctx.fillStyle = '#c8f7df';
    ctx.font = '700 14px Montserrat, sans-serif';
    ctx.fillText(`${active.minute}' ${labelForEvent(activeKind)}${actorLabel}`, 58, CANVAS_HEIGHT - 84);

    ctx.fillStyle = '#f7fffa';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText(active.commentary, 58, CANVAS_HEIGHT - 58);

    ctx.fillStyle = '#9ee0bf';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText(`Camera: ${active.cameraPath || 'AUTO'}${presetLabel}`, 58, CANVAS_HEIGHT - 40);
  }, [active, activeKind, homeScore, awayScore, progress]);

  const playbackLabel = isPlaying ? 'Pause' : 'Play';

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 10,
          border: '1px solid rgba(163, 230, 194, 0.4)',
          background: '#071217'
        }}
      />

      <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
        <div style={{ height: 8, background: 'rgba(140, 215, 180, 0.18)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #67ddb0 0%, #78d0ff 100%)',
              transition: 'width 70ms linear'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setIndex((prev) => (highlights.length === 0 ? 0 : (prev - 1 + highlights.length) % highlights.length));
              setPlayheadMs(0);
              setIsPlaying(false);
            }}
            style={controlButton}
            disabled={highlights.length === 0}
          >
            Prev
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            style={controlButton}
            disabled={highlights.length === 0}
          >
            {playbackLabel}
          </button>

          <button
            type="button"
            onClick={() => {
              setIndex((prev) => (highlights.length === 0 ? 0 : (prev + 1) % highlights.length));
              setPlayheadMs(0);
              setIsPlaying(false);
            }}
            style={controlButton}
            disabled={highlights.length === 0}
          >
            Next
          </button>

          <button
            type="button"
            onClick={() => setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length)}
            style={controlButton}
            disabled={highlights.length === 0}
          >
            Speed x{SPEED_OPTIONS[speedIndex].toFixed(2).replace(/\.00$/, '')}
          </button>

          {active && (
            <div style={{ color: '#bcead5', fontSize: 13, alignSelf: 'center' }}>
              {index + 1}/{highlights.length} | {labelForEvent(activeKind)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {highlights.map((highlight, idx) => (
            <button
              key={highlight.id}
              onClick={() => {
                setIndex(idx);
                setPlayheadMs(0);
                setIsPlaying(false);
              }}
              style={{
                border: idx === index ? '1px solid #9be7c3' : '1px solid rgba(155, 231, 195, 0.4)',
                background: idx === index ? 'rgba(155, 231, 195, 0.28)' : 'rgba(155, 231, 195, 0.12)',
                color: '#e8fff3',
                borderRadius: 6,
                padding: '4px 7px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {highlight.minute}' {highlight.eventType}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const controlButton: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.6)',
  background: 'rgba(132, 222, 181, 0.2)',
  color: '#e8fff3',
  borderRadius: 8,
  padding: '8px 11px',
  fontWeight: 700,
  cursor: 'pointer'
};

export default RetroHighlightCanvas;
