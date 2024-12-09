import { Center, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RefObject, useCallback, useEffect, useRef } from "react";
import {
  getSizeByAspect,
  minMaxNumber,
  pickRandom,
  pickRandomIntFromInterval,
} from "./utils";
import BuildingStructure, { BG_THEME } from "./BuildingStructure";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { start } from "tone";
import { DirectionalLight, PointLight } from "three";
import { a, useSpring, useSprings } from "@react-spring/three";
import { generateData } from "./generateData";
import { calculateOutwardPosition } from "./calculateOutwardPosition";
import { POINT_COLORS, Theme } from "./constants";
import { HITS, Sample, THUDS, WOOSH } from "./App";
import { ExplosionBlocks } from "./ExplosionBlocks";

declare const $fx: any;

$fx.features({});

const structureRotation: [number, number, number] = pickRandom(
  [
    [Math.PI / 8, -Math.PI / 8, 0],
    [-Math.PI / 8, -Math.PI / 8, 0],
    [Math.PI / 8, Math.PI / 8, 0],
    [-Math.PI / 8, Math.PI / 8, 0],
  ],
  $fx.rand
);

const INITIAL_DATA = generateData();

const BG_COLOR = BG_THEME === Theme.Dark ? "#000000" : "#ffffff";
const POINT_COLOR = pickRandom(POINT_COLORS);

const Scene = ({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) => {
  const { aspect } = useThree((state) => ({
    aspect: state.viewport.aspect,
  }));

  const toneInitialized = useRef(false);
  const timer = useRef(0);
  const timerInterval = useRef<NodeJS.Timer>();
  const timeoutInterval = useRef<NodeJS.Timeout>();
  const timeoutInterval2 = useRef<NodeJS.Timeout>();
  const isPointerDown = useRef(false);
  const currentData = useRef(INITIAL_DATA);
  const pointLightRef = useRef<PointLight>(null!);
  const dirLightRef = useRef<DirectionalLight>(null!);

  useEffect(() => {
    HITS.forEach((hit) => {
      hit.sampler.toDestination();
    });
    THUDS.forEach((hit) => {
      hit.sampler.volume.value = -15;
      hit.sampler.toDestination();
    });
    WOOSH.forEach((hit) => {
      hit.sampler.volume.value = -5;
      hit.sampler.toDestination();
    });
  }, []);

  const [blockSprings, setBlockSprings] = useSprings(
    currentData.current.blocks.length,
    (i) => ({
      position: [
        currentData.current.blocks[i].position[0],
        currentData.current.blocks[i].position[1],
        currentData.current.blocks[i].position[2],
      ],
      size: [
        currentData.current.blocks[i].size[0],
        currentData.current.blocks[i].size[1],
        currentData.current.blocks[i].size[2],
      ],
      rotation: [0, 0, 0],
    })
  );

  const [explosionSprings, setExplosionSprings] = useSprings(
    currentData.current.explosionBlocks.length,
    (i) => ({
      position: [
        currentData.current.explosionBlocks[i].position[0],
        currentData.current.explosionBlocks[i].position[1],
        currentData.current.explosionBlocks[i].position[2],
      ],
      size: [
        currentData.current.explosionBlocks[i].size[0],
        currentData.current.explosionBlocks[i].size[1],
        currentData.current.explosionBlocks[i].size[2],
      ],
      rotation: [0, 0, 0],
    })
  );

  const [pointLightSpring, setPointLightSpring] = useSpring(() => ({
    intensity: 0,
    distance: 0,
  }));

  const [dirLightSpring, setDirLightSpring] = useSpring(() => ({
    intensity: 4,
    emissiveIntensity: 0.2,
  }));

  const initTone = useCallback(async () => {
    if (!toneInitialized.current) {
      await start();
      toneInitialized.current = true;
    }
  }, []);

  const triggerSound = useCallback(
    async (hit: Sample) => {
      await initTone();
      hit.sampler.triggerAttack("C#-1");
    },
    [initTone]
  );

  const defaultRetract = useCallback(() => {
    const secondData = generateData(currentData.current.blocks.length);

    currentData.current = {
      ...currentData.current,
      explosionBlocks: secondData.explosionBlocks,
      blocks: currentData.current.blocks.map((block, i) => ({
        ...block,
        position: secondData.blocks[i].position,
        size: secondData.blocks[i].size,
        rotation: secondData.blocks[i].rotation,
      })),
    };

    setBlockSprings.start((i) => ({
      position: currentData.current.blocks[i].position,
      size: currentData.current.blocks[i].size,
      rotation: currentData.current.blocks[i].rotation,
      delay: i,
      config: { mass: 1, tension: 200, friction: 25 },
    }));

    setExplosionSprings.start((i) => ({
      position: currentData.current.explosionBlocks[i].position,
      size: currentData.current.explosionBlocks[i].size,
      rotation: currentData.current.explosionBlocks[i].rotation,
      delay: i,
      config: { mass: 1, tension: 200, friction: 25 },
    }));
  }, [setBlockSprings, setExplosionSprings]);

  const resetInterval = useCallback(() => {
    clearInterval(timerInterval.current as any);
    timerInterval.current = undefined;
    timer.current = 0;
  }, []);

  const resetTimeout = useCallback((timeout: NodeJS.Timeout) => {
    clearInterval(timeout);
    timeout = undefined as any;
  }, []);

  const onPointerDown = useCallback(
    async (e: Event) => {
      e.preventDefault();
      isPointerDown.current = true;
      await initTone();

      // if (timeoutInterval.current) {
      //   resetTimeout(timeoutInterval.current);
      // }

      if (timeoutInterval2.current) {
        resetTimeout(timeoutInterval2.current);
      }

      if (timerInterval.current) {
        resetInterval();
      }

      timerInterval.current = setInterval(() => {
        timer.current += 0.25;
      }, 25);

      setPointLightSpring.set({ intensity: 0, distance: 0 });
      setDirLightSpring.set({ intensity: 4, emissiveIntensity: 0.2 });

      const distance = pickRandomIntFromInterval(50, 80, Math.random);
      const firstData = generateData(currentData.current.blocks.length);
      const firstPositions = currentData.current.blocks.map(({ position }) =>
        calculateOutwardPosition(position, distance)
      );
      const firstExplodePositions = currentData.current.explosionBlocks.map(
        ({ position }) => calculateOutwardPosition(position, distance)
      );

      currentData.current = {
        ...currentData.current,
        explosionBlocks: firstData.explosionBlocks.map((block, i) => ({
          ...block,
          position: firstExplodePositions[i],
        })),
        blocks: currentData.current.blocks.map((block, i) => ({
          ...block,
          position: firstPositions[i],
          size: firstData.blocks[i].size,
          rotation: firstData.blocks[i].rotation,
        })),
        offsetX: firstData.offsetX,
        offsetY: firstData.offsetY,
        offsetZ: firstData.offsetZ,
      };

      setBlockSprings.start((i) => ({
        position: currentData.current.blocks[i].position,
        size: currentData.current.blocks[i].size,
        rotation: currentData.current.blocks[i].rotation,
        delay: i,
        config: { mass: 3, tension: 100, friction: 15 },
      }));

      setExplosionSprings.start((i) => ({
        position: currentData.current.explosionBlocks[i].position,
        size: currentData.current.explosionBlocks[i].size,
        rotation: currentData.current.explosionBlocks[i].rotation,
        delay: i,
        config: { mass: 3, tension: 100, friction: 15 },
      }));

      // const thud = pickRandom(THUDS);
      // triggerSound(thud);

      timeoutInterval.current = setTimeout(() => {
        if (!isPointerDown.current || timer.current < 6) {
          defaultRetract();
          return;
        }

        timeoutInterval2.current = setTimeout(() => {
          const sonicBoom = pickRandom(HITS, Math.random);
          triggerSound(sonicBoom);

          const secondData = generateData(currentData.current.blocks.length);
          const secondPositions = currentData.current.blocks.map(
            ({ position }) => calculateOutwardPosition(position, 200)
          );
          const secondExplodePositions =
            currentData.current.explosionBlocks.map(({ position }) =>
              calculateOutwardPosition(position, 500)
            );
          console.log(currentData.current);
          currentData.current = {
            ...currentData.current,
            explosionBlocks: secondData.explosionBlocks.map((block, i) => ({
              ...block,
              position: secondExplodePositions[i],
            })),
            blocks: currentData.current.blocks.map((block, i) => ({
              ...block,
              position: secondPositions[i],
              size: secondData.blocks[i].size,
              rotation: secondData.blocks[i].rotation,
            })),
          };

          setBlockSprings.start((i) => ({
            position: currentData.current.blocks[i].position,
            size: currentData.current.blocks[i].size,
            rotation: currentData.current.blocks[i].rotation,
            delay: i,
            config: { mass: 3, tension: 20, friction: 25 },
          }));

          setExplosionSprings.start((i) => ({
            position: currentData.current.explosionBlocks[i].position,
            size: currentData.current.explosionBlocks[i].size,
            rotation: [
              currentData.current.explosionBlocks[i].rotation[0] * 5,
              currentData.current.explosionBlocks[i].rotation[1] * 5,
              currentData.current.explosionBlocks[i].rotation[2] * 5,
            ],
            delay: i,
            config: { mass: 3, tension: 20, friction: 25 },
          }));

          setPointLightSpring.start(() => ({
            intensity: 2000000,
            distance: 1000000,
            config: { mass: 5, tension: 100, friction: 10 },
          }));

          setDirLightSpring.start(() => ({
            intensity: 0,
            emissiveIntensity: 0,
            config: { mass: 3, tension: 40, friction: 25 },
          }));
        }, 350);
      }, 650);
    },
    [
      initTone,
      setPointLightSpring,
      setDirLightSpring,
      setBlockSprings,
      resetTimeout,
      resetInterval,
      defaultRetract,
      triggerSound,
      setExplosionSprings,
    ]
  );

  const onPointerUp = useCallback(
    (e: Event) => {
      e.preventDefault();
      isPointerDown.current = false;

      setPointLightSpring.start(() => ({
        intensity: 0,
        distance: 0,
        config: { mass: 1, tension: 200, friction: 25 },
      }));

      setDirLightSpring.start(() => ({
        intensity: 4,
        emissiveIntensity: 0.2,
        config: { mass: 1, tension: 100, friction: 25 },
      }));

      if (timer.current <= 6.5) {
        return;
      }

      const woosh = pickRandom(WOOSH, Math.random);
      triggerSound(woosh);

      const tension = 200 + minMaxNumber(timer.current * 2, 0, 300);

      const secondData = generateData(currentData.current.blocks.length);
      currentData.current = {
        ...currentData.current,
        explosionBlocks: secondData.explosionBlocks,
        blocks: currentData.current.blocks.map((block, i) => ({
          ...block,
          position: secondData.blocks[i].position,
          size: secondData.blocks[i].size,
          rotation: secondData.blocks[i].rotation,
        })),
      };

      setBlockSprings.start((i) => ({
        position: currentData.current.blocks[i].position,
        size: currentData.current.blocks[i].size,
        rotation: currentData.current.blocks[i].rotation,
        config: { mass: 1, tension, friction: 25 },
      }));

      setExplosionSprings.start((i) => ({
        position: currentData.current.explosionBlocks[i].position,
        size: currentData.current.explosionBlocks[i].size,
        rotation: [
          currentData.current.explosionBlocks[i].rotation[0] * 5,
          currentData.current.explosionBlocks[i].rotation[1] * 5,
          currentData.current.explosionBlocks[i].rotation[2] * 5,
        ],
        delay: i,
        config: { mass: 1, tension: 200, friction: 25 },
      }));

      if (timerInterval.current) {
        resetInterval();
      }
    },
    [
      setPointLightSpring,
      setDirLightSpring,
      setBlockSprings,
      setExplosionSprings,
      triggerSound,
      resetInterval,
    ]
  );

  useEffect(() => {
    const ref = canvasRef?.current;

    if (!ref) {
      return;
    }

    ref.addEventListener(
      "wheel",
      (event) => {
        const { ctrlKey } = event;
        if (ctrlKey) {
          event.preventDefault();
          return;
        }
      },
      { passive: false }
    );
  }, [canvasRef]);

  useEffect(() => {
    const ref = canvasRef?.current;

    if (!ref) {
      return;
    }

    ref.addEventListener("pointerup", onPointerUp);

    return () => {
      ref.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerUp, canvasRef]);

  useEffect(() => {
    const ref = canvasRef?.current;

    if (!ref) {
      return;
    }

    ref.addEventListener("pointerdown", onPointerDown);

    return () => {
      ref.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onPointerDown, canvasRef]);

  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <OrbitControls
        enabled={true}
        enablePan={false}
        maxDistance={700}
        minDistance={300}
      />
      {/* <ambientLight intensity={0.5} /> */}
      <a.pointLight
        ref={pointLightRef}
        distance={pointLightSpring.distance}
        intensity={pointLightSpring.intensity}
        castShadow
        position={[
          currentData.current.offsetX,
          currentData.current.offsetY,
          currentData.current.offsetZ,
        ]}
        color={POINT_COLOR}
      />
      <a.directionalLight
        ref={dirLightRef}
        position={[-10, 10, 5]}
        intensity={dirLightSpring.intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.005}
      />
      <Center
        scale={[
          getSizeByAspect(1, aspect),
          getSizeByAspect(1, aspect),
          getSizeByAspect(1, aspect),
        ]}
      >
        <BuildingStructure
          data={currentData.current}
          isPointerDown={isPointerDown}
          rotation={structureRotation}
          blockSprings={blockSprings}
          emissiveIntensity={dirLightSpring.emissiveIntensity}
        />
        <ExplosionBlocks
          blockSprings={explosionSprings}
          data={currentData.current}
          rotation={structureRotation}
          isPointerDown={isPointerDown}
          emissiveIntensity={dirLightSpring.emissiveIntensity}
        />
      </Center>

      <EffectComposer>
        <Bloom
          kernelSize={KernelSize.MEDIUM}
          intensity={2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.8}
        />
        {/* <GodRaySphere /> */}
        {/* <Noise opacity={0.2} /> */}
        {/* <LensFlare
          blendFunction={BlendFunction.SCREEN} // The blend function of this effect.
          enabled={true} // Boolean to enable/disable the effect.
          opacity={1.0} // The opacity for this effect. Default: 1.0
          starBurst={true} // Boolean to enable/disable the start burst effect. Can be disabled to improve performance.
          glareSize={0.96} // The glare size. Default: 0.2
          followMouse={false} // Set it to follow the mouse, ignoring the lens position. Default: false
          lensPosition={[0, 0.5, 0]} // The position of the lens flare in 3d space.
          starPoints={6} // The number of points for the star. Default: 6
          flareSize={0.01} // The flare side. Default 0.01
          flareSpeed={0.01} // The flare animation speed. Default 0.01
          flareShape={0.01} // Changes the appearance to anamorphic. Default 0.01
          animated={true} // Animated flare. Default: true
          anamorphic={false} //Set the appearance to full anamorphic. Default: false
          colorGain={new Color(70, 70, 70)} // Set the color gain for the lens flare. Must be a THREE.Color in RBG format.
          // lensDirtTexture={`${process.env.PUBLIC_URL}/noise.png`} // Texture to be used as color dirt for starburst effect.
          haloScale={0.5} // The halo scale. Default: 0.5
          secondaryGhosts={true} // Option to enable/disable secondary ghosts. Default: true.
          ghostScale={0.0} // Option to enable/disable secondary ghosts. Default: true.
          aditionalStreaks={true} // Option to enable/disable aditional streaks. Default: true.
          smoothTime={0.07} // The time that it takes to fade the occlusion. Default: 0.07
        /> */}
      </EffectComposer>
    </>
  );
};

export default Scene;
