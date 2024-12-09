import React, { MutableRefObject, useRef } from "react";
import { BoxGeometry, Texture, TextureLoader } from "three";
import { Edges } from "@react-three/drei";
import { GrainyMaterial } from "./GrainyMaterial";
import { useFrame, useLoader } from "@react-three/fiber";
import { GeneratedBlock, GeneratedData } from "./generateData";
import { a, SpringValue } from "@react-spring/three";
import { hexToRgb, pickRandom, pickRandomDecimalFromInterval } from "./utils";
import {
  ColorMode,
  DARK_COLORS,
  EDGE_COLORS,
  GRAIN_COLORS,
  LIGHT_COLORS,
  Theme,
} from "./constants";

export const BG_THEME = pickRandom([
  ...new Array(8).fill(null).map(() => Theme.Dark),
  Theme.Light,
]);
const COLOR_THEME = pickRandom([
  ...new Array(5)
    .fill(null)
    .map(() => [ColorMode.Plain, ColorMode.Plain, ColorMode.PlainDiff]),
  ColorMode.EveryOther,
]);
const COLOR = pickRandom(BG_THEME === Theme.Dark ? LIGHT_COLORS : DARK_COLORS);
const SECONDAY_COLOR = pickRandom(
  BG_THEME === Theme.Dark ? LIGHT_COLORS : DARK_COLORS
);
const EMISSIVE_COLOR = pickRandom(
  BG_THEME === Theme.Dark ? LIGHT_COLORS : DARK_COLORS
);
const GRAIN_COLOR = pickRandom(GRAIN_COLORS);
const EDGE_COLOR = pickRandom(EDGE_COLORS);
const METALNESS = pickRandomDecimalFromInterval(0.8, 1.3);
const OPACITY = pickRandom([
  0.9,
  0.9,
  pickRandomDecimalFromInterval(0.7, 0.9),
  pickRandomDecimalFromInterval(0.5, 0.9),
]);

interface BlockSprings {
  position: SpringValue<number[]>;
  size: SpringValue<number[]>;
  rotation: SpringValue<number[]>;
}

export interface BlockProps {
  block: GeneratedBlock;
  blockSpring: BlockSprings;
  isPointerDown: MutableRefObject<boolean>;
  noiseTexture?: Texture;
  emissiveIntensity: SpringValue<number>;
  index: number;
}

export const Block = ({
  block,
  blockSpring,
  isPointerDown,
  noiseTexture,
  emissiveIntensity,
  index,
}: BlockProps) => {
  const meshRef = useRef<BoxGeometry>(null);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }
    // console.log(isPointerDown.current);
    // meshRef.current.rotateX(+0.002);
  });

  const blockColor =
    COLOR_THEME === ColorMode.EveryOther
      ? index % 2 === 0
        ? COLOR
        : SECONDAY_COLOR
      : COLOR;

  return (
    <a.mesh
      rotation={blockSpring.rotation as any}
      position={blockSpring.position as any}
      castShadow
      receiveShadow
      renderOrder={index}
    >
      {block.isEdge ? (
        <>
          <a.boxGeometry args={blockSpring.size as any} />
          <meshStandardMaterial
            color={0xffffff}
            opacity={0}
            transparent={true}
          />
          <Edges color={EDGE_COLOR} threshold={1} />
        </>
      ) : block.isGrain && noiseTexture ? (
        <>
          <a.boxGeometry args={blockSpring.size as any} />
          <GrainyMaterial
            noiseTexture={noiseTexture}
            color={hexToRgb(GRAIN_COLOR)}
          />
          <Edges color={0xffffff} threshold={1} opacity={0.5} transparent />
        </>
      ) : (
        <>
          <a.boxGeometry args={blockSpring.size as any} ref={meshRef} />
          <a.meshStandardMaterial
            color={blockColor}
            metalness={METALNESS}
            opacity={OPACITY}
            transparent
            roughness={2}
            emissive={COLOR_THEME === ColorMode.Plain ? COLOR : EMISSIVE_COLOR}
            emissiveIntensity={emissiveIntensity}
          />
        </>
      )}
    </a.mesh>
  );
};

export interface BuildingStructureProps {
  data: GeneratedData;
  isPointerDown: MutableRefObject<boolean>;
  blockSprings: BlockSprings[];
  rotation: [number, number, number];
  emissiveIntensity: SpringValue<number>;
}

const BuildingStructure: React.FC<BuildingStructureProps> = ({
  data: { blocks, offsetX, offsetY, offsetZ },
  isPointerDown,
  rotation,
  blockSprings,
  emissiveIntensity,
}) => {
  const noiseTexture = useLoader(
    TextureLoader,
    `${process.env.PUBLIC_URL}/noise.png`
  );

  return (
    <a.group position={[offsetX, offsetY, offsetZ]}>
      <group rotation={rotation}>
        {blockSprings.map((block, index) => (
          <Block
            key={index}
            isPointerDown={isPointerDown}
            block={blocks[index]}
            blockSpring={block}
            noiseTexture={noiseTexture}
            emissiveIntensity={emissiveIntensity}
            index={index}
          />
        ))}
      </group>
    </a.group>
  );
};

export default BuildingStructure;
