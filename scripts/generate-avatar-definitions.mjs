import fs from 'fs';
import path from 'path';
import { validateAvatarDefinition } from '../node_modules/@bible-strong/avatar-core/dist/index.js';

const studioJsonPath = 'C:/Users/sunil/Downloads/avatar-studio-project.json';
const studioJson = JSON.parse(fs.readFileSync(studioJsonPath, 'utf8'));

const clamp = (v) => (v === undefined ? undefined : Math.min(1, Math.max(0, v)));

const expressionsRecord = {};
const expressionOrder = [];
for (const expr of studioJson.expressions) {
  const key = expr.id;
  expressionOrder.push(key);
  expressionsRecord[key] = {
    head: { x: expr.headX, y: expr.headY, z: expr.headZ },
    eyes: {
      left: {
        width: expr.widthLeft,
        height: expr.heightLeft,
        x: expr.positionXLeft,
        y: expr.positionYLeft,
        angle: expr.leftAngle,
      },
      right: {
        width: expr.widthRight,
        height: expr.heightRight,
        x: expr.positionXRight,
        y: expr.positionYRight,
        angle: expr.rightAngle,
      },
      spacing: expr.spacing,
    },
    perspective: expr.perspective ?? 1,
    motion: {
      eyes: expr.eyeMotion ?? 'none',
      body: expr.bodyMotion ?? 'none',
    },
    ...(expr.bodyColor || expr.eyeColor
      ? {
          colors: {
            ...(expr.bodyColor ? { body: expr.bodyColor } : {}),
            ...(expr.eyeColor ? { eyes: expr.eyeColor } : {}),
          },
        }
      : {}),
  };
}

if (!expressionsRecord['neutral']) {
  expressionsRecord['neutral'] = expressionsRecord['expression-00'];
  expressionOrder.unshift('neutral');
}

const animationsRecord = {};
const animationOrder = [];
for (const seq of studioJson.sequences) {
  const key = seq.id;
  animationOrder.push(key);
  animationsRecord[key] = {
    playbackMode: seq.playbackMode === 'once' ? 'once' : seq.playbackMode === 'pingPong' ? 'pingPong' : 'loop',
    steps: seq.steps.map((s) => ({
      expression: s.expressionId,
      holdMs: s.holdMs,
      transitionMs: s.transitionMs,
      transition: s.transition === 'snappy' ? 'snappy' : s.transition === 'spring' ? 'spring' : 'smooth',
    })),
    blink: {
      enabled: seq.blink?.enabled ?? true,
      initialDelayMs: seq.blink?.initialDelayMs ?? 2000,
      minIntervalMs: seq.blink?.minIntervalMs ?? 3000,
      maxIntervalMs: seq.blink?.maxIntervalMs ?? 6000,
      durationMs: seq.blink?.durationMs ?? 260,
    },
    metadata: {
      label: seq.name,
      description: seq.description,
      group: seq.group,
    },
  };
}

const avatarCatalog = {};

for (const avatar of studioJson.library.avatars) {
  const primary = { ...avatar.body.primary };
  if (primary.roundness !== undefined) primary.roundness = clamp(primary.roundness);
  if (primary.morphRoundness !== undefined) primary.morphRoundness = clamp(primary.morphRoundness);
  if (primary.tipRoundness !== undefined) primary.tipRoundness = clamp(primary.tipRoundness);
  if (primary.baseRoundness !== undefined) primary.baseRoundness = clamp(primary.baseRoundness);

  const def = {
    schema: 'bible-strong/avatar-definition',
    schemaVersion: 1,
    name: avatar.name,
    body: {
      primary,
      nodes: (avatar.body.nodes || []).map((node) => {
        const surface = { ...node.surface };
        if (surface.roundness !== undefined) surface.roundness = clamp(surface.roundness);
        if (surface.morphRoundness !== undefined) surface.morphRoundness = clamp(surface.morphRoundness);
        if (surface.tipRoundness !== undefined) surface.tipRoundness = clamp(surface.tipRoundness);
        if (surface.baseRoundness !== undefined) surface.baseRoundness = clamp(surface.baseRoundness);
        return {
          surface,
          position: node.position,
          rotation: node.rotation,
        };
      }),
    },
    colors: avatar.colors,
    expressions: expressionsRecord,
    expressionOrder,
    animations: animationsRecord,
    animationOrder,
  };

  const validation = validateAvatarDefinition(def);
  if (!validation.ok) {
    console.error(`Validation failed for ${avatar.name}:`, validation.errors);
    process.exit(1);
  }
  avatarCatalog[avatar.id] = {
    id: avatar.id,
    name: avatar.name,
    definition: def,
  };
}

const outputPath = path.resolve('AI-Resume-builder/client/src/components/avatar/avatarDefinitions.ts');
const fileContent = `/* eslint-disable max-lines */
import type { AvatarDefinition } from "@bible-strong/avatar-core";

export interface AvatarCharacter {
  id: string;
  name: string;
  definition: AvatarDefinition;
}

export const AVATAR_CHARACTERS: Record<string, AvatarCharacter> = ${JSON.stringify(avatarCatalog, null, 2)} as const;

export const DEFAULT_AVATAR_ID = "avatar-4b9ea0c1-286f-4aa1-b053-61fcc416ba7e"; // Onee

export function getAvatarCharacter(id?: string): AvatarCharacter {
  if (id && AVATAR_CHARACTERS[id]) {
    return AVATAR_CHARACTERS[id];
  }
  return AVATAR_CHARACTERS[DEFAULT_AVATAR_ID] || Object.values(AVATAR_CHARACTERS)[0];
}

export function getAllAvatarCharacters(): AvatarCharacter[] {
  return Object.values(AVATAR_CHARACTERS);
}
`;

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Successfully generated avatarDefinitions.ts with', Object.keys(avatarCatalog).length, 'characters!');
