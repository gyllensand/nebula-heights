import { useFrame } from "@react-three/fiber";
import { GodRays } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { forwardRef, useRef } from "react";
import { Mesh } from "three";

const Sun = forwardRef<Mesh, any>(({}, forwardRef) => {
  //   useFrame(() => {
  //     //@ts-ignore
  //     if (forwardRef.current) {
  //       //@ts-ignore
  //       forwardRef.current.scale.set(10, 10, 10);
  //     }
  //   });

  return (
    <mesh ref={forwardRef as any} scale={[10, 10, 10]} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 36, 36]} />
      <meshBasicMaterial color={"red"} />
    </mesh>
  );
});

const GodRaySphere = () => {
  const sunRef = useRef<Mesh>(null);

  return (
    <>
      <Sun ref={sunRef as any} />
      {sunRef.current && (
        <GodRays
          sun={sunRef.current}
          blendFunction={BlendFunction.SCREEN}
          samples={30}
          density={0.97}
          decay={0.9}
          weight={0.6}
          exposure={0.34}
          clampMax={1}
          //   width={Resizer.AUTO_SIZE}
          //   height={Resizer.AUTO_SIZE}
          kernelSize={KernelSize.SMALL}
          blur={false}
        />
      )}
    </>
  );
};

export default GodRaySphere;
