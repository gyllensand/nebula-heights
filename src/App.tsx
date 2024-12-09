import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Sampler } from "tone";

console.log(
  "%c * Computer Emotions * ",
  "color: #d80fe7; font-size: 14px; background-color: #000000;"
);

console.log(
  "%c http://www.computeremotions.com ",
  "font-size: 12px; background-color: #000000;"
);

const baseUrl = `${process.env.PUBLIC_URL}/audio/`;

export interface Sample {
  index: number;
  sampler: Sampler;
}

export const HITS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `low-hit1.wav`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `low-hit3.wav`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `low-hit4.wav`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `low-hit5.wav`,
      },
      baseUrl,
    }),
  },
];

export const THUDS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `thud1.wav`,
      },
      baseUrl,
    }),
  },
];

export const WOOSH: Sample[] = [
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `woosh2.wav`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `woosh3.wav`,
      },
      baseUrl,
    }),
  },
];

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 400], far: 5000, fov: 50 }}
      // camera={{ position: [0, 0, density * 150], fov: 50 }}
      dpr={window.devicePixelRatio}
    >
      <Suspense fallback={null}>
        <Scene canvasRef={canvasRef} />
      </Suspense>
    </Canvas>
  );
};

export default App;
