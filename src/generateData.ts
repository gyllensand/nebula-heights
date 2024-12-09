import { Box3, Vector3 } from "three";
import {
  pickRandom,
  pickRandomDecimalFromInterval,
  pickRandomIntFromInterval,
} from "./utils";

declare const $fx: any;

export const EXPLOSION_BLOCKS = pickRandomIntFromInterval(5, 10);
export const SPACING = pickRandomDecimalFromInterval(10, 20);
export const CORE_SIZE = pickRandomIntFromInterval(1, 4);
export const BOX_SIZE = pickRandom([
  [6, 24],
  [12, 18],
]);

export interface GeneratedData {
  blocks: GeneratedBlock[];
  explosionBlocks: GeneratedBlock[];
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

export interface GeneratedBlock {
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number];
  isEdge: boolean;
  isGrain: boolean;
}

export const generateData = (blockCount?: number): GeneratedData => {
  const generatedBlocks: GeneratedBlock[] = [];
  const generatedExplosionBlocks: GeneratedBlock[] = [];
  const branches = pickRandom([
    [pickRandomIntFromInterval(6, 8), pickRandomIntFromInterval(15, 20)],
    [pickRandomIntFromInterval(15, 20), pickRandomIntFromInterval(6, 8)],
    [pickRandomIntFromInterval(15, 20), pickRandomIntFromInterval(8, 12)],
    [pickRandomIntFromInterval(10, 12), pickRandomIntFromInterval(12, 15)],
  ]);

  const occupiedPositions = new Set<string>();

  const addBlock = (
    x: number,
    y: number,
    z: number,
    existingArray?: GeneratedBlock[]
  ) => {
    const positionKey = `${x},${y},${z}`;
    const isBig = pickRandom([
      ...new Array(99).fill(null).map(() => false),
      true,
    ]);

    const rotation: [number, number, number] = pickRandom([
      [0, 0, 0],
      [Math.PI / 2, 0, 0],
      [0, Math.PI / 2, 0],
      [0, 0, Math.PI / 2],
    ]);

    if (occupiedPositions.has(positionKey)) {
      return false;
    }

    occupiedPositions.add(positionKey);

    const width = isBig
      ? pickRandomDecimalFromInterval(20, 40)
      : pickRandomDecimalFromInterval(BOX_SIZE[0], BOX_SIZE[1]);
    const height = isBig
      ? pickRandomDecimalFromInterval(20, 40)
      : pickRandomDecimalFromInterval(BOX_SIZE[0] / 2, BOX_SIZE[1]);
    const depth = isBig
      ? pickRandomDecimalFromInterval(20, 40)
      : pickRandomDecimalFromInterval(BOX_SIZE[0], BOX_SIZE[1] * 1.5);

    const isEdge = pickRandom([
      ...new Array(9).fill(null).map(() => false),
      true,
    ]);
    const isGrain = isEdge
      ? false
      : pickRandom([...new Array(9).fill(null).map(() => false), true]);

    if (existingArray) {
      generatedExplosionBlocks.push({
        position: [x, y, z],
        size: [width, height, depth],
        rotation,
        isEdge: false,
        isGrain: false,
      });
      return true;
    }

    generatedBlocks.push({
      position: [x, y, z],
      size: [width, height, depth],
      rotation,
      isEdge,
      isGrain,
    });

    return true;
  };

  // Generate core blocks
  const coreRange = CORE_SIZE * SPACING;
  for (let i = 0; i < CORE_SIZE ** 3; i++) {
    if (blockCount && generatedBlocks.length >= blockCount) break;
    const x = pickRandomDecimalFromInterval(-coreRange, coreRange);
    const y = pickRandomDecimalFromInterval(-coreRange, coreRange);
    const z = pickRandomDecimalFromInterval(-coreRange, coreRange);
    addBlock(x, y, z);
  }

  // Function to pick biased directions with optional sub-branching
  const pickBiasedDirection = (
    bias: [number, number, number],
    randomness: number = 0.5
  ) => {
    const directions = [
      bias,
      [-bias[0], -bias[1], -bias[2]], // Opposite direction
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ];

    // Weighted randomness
    const weightedDirections = [
      ...Array(Math.floor(10 * (1 - randomness))).fill(bias),
      ...directions
        .map((dir) => Array(Math.floor(10 * randomness)).fill(dir))
        .flat(),
    ];

    return pickRandom(weightedDirections);
  };

  // Generate main branches and sub-branches
  for (let i = 0; i < branches[0]; i++) {
    if (blockCount && generatedBlocks.length >= blockCount) break;

    // Each branch gets a random bias
    const branchBias: [number, number, number] = pickRandom([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, -1],
    ]);

    const startIndex = Math.floor($fx.rand() * generatedBlocks.length);
    const startBlock = generatedBlocks[startIndex];
    let [x, y, z] = startBlock.position;

    for (let j = 0; j < branches[1]; j++) {
      const [dx, dy, dz] = pickBiasedDirection(branchBias, $fx.rand());
      x += dx * SPACING;
      y += dy * SPACING;
      z += dz * SPACING;

      if (addBlock(x, y, z)) {
        // Optional sub-branch
        if ($fx.rand() < 0.2) {
          let [sx, sy, sz] = [x, y, z];
          const subBranchLength = Math.floor(branches[1] / 2);

          for (let k = 0; k < subBranchLength; k++) {
            const [sdx, sdy, sdz] = pickBiasedDirection(branchBias, $fx.rand());
            sx += sdx * SPACING;
            sy += sdy * SPACING;
            sz += sdz * SPACING;

            addBlock(sx, sy, sz);
          }
        }
      }
    }
  }

  // Fill remaining blocks if needed
  if (blockCount) {
    while (generatedBlocks.length < blockCount) {
      const x = pickRandomDecimalFromInterval(-coreRange, coreRange);
      const y = pickRandomDecimalFromInterval(-coreRange, coreRange);
      const z = pickRandomDecimalFromInterval(-coreRange, coreRange);
      addBlock(x, y, z);
    }
  }

  new Array(EXPLOSION_BLOCKS).fill(null).forEach(() => {
    const x = pickRandomDecimalFromInterval(-coreRange, coreRange);
    const y = pickRandomDecimalFromInterval(-coreRange, coreRange);
    const z = pickRandomDecimalFromInterval(-coreRange, coreRange);
    addBlock(x, y, z, generatedExplosionBlocks);
  });

  // Calculate bounding box for centering
  const boundingBox = new Box3();
  generatedBlocks.forEach((block) => {
    const min = new Vector3(...block.position).sub(
      new Vector3(...block.size).multiplyScalar(0.5)
    );
    const max = new Vector3(...block.position).add(
      new Vector3(...block.size).multiplyScalar(0.5)
    );
    boundingBox.expandByPoint(min);
    boundingBox.expandByPoint(max);
  });

  const center = new Vector3();
  boundingBox.getCenter(center);

  const centerX = -center.x;
  const centerY = -center.y;

  let offsetZ = center.z;
  offsetZ = Math.min(offsetZ, 150);

  return {
    blocks: generatedBlocks,
    explosionBlocks: generatedExplosionBlocks,
    offsetX: centerX,
    offsetY: centerY,
    offsetZ,
  };
};
