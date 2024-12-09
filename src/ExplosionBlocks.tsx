import { Block, BuildingStructureProps } from "./BuildingStructure";
import { a } from "@react-spring/three";

export const ExplosionBlocks = ({
  data: { explosionBlocks, offsetX, offsetY, offsetZ },
  isPointerDown,
  rotation,
  blockSprings,

  emissiveIntensity,
}: Omit<BuildingStructureProps, "noiseTexture">) => {
  return (
    <a.group position={[offsetX, offsetY, offsetZ]}>
      <group rotation={rotation}>
        {blockSprings.map((block, index) => (
          <Block
            key={index}
            isPointerDown={isPointerDown}
            block={{ ...explosionBlocks[index], isEdge: false, isGrain: false }}
            blockSpring={block}
            emissiveIntensity={emissiveIntensity}
            index={index}
          />
        ))}
      </group>
    </a.group>
  );
};
