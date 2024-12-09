import { AdditiveBlending, ShaderMaterial, Texture, Vector3 } from "three";
import { forwardRef, useMemo } from "react";
import { extend } from "@react-three/fiber";

extend({ ShaderMaterial });

export const GrainyMaterial = forwardRef(
  (
    {
      opacity = 0.5,
      color = { r: 1, g: 1, b: 1 },
      grainScale = 1,
      noiseTexture,
    }: {
      opacity?: number;
      color?: { r: number; g: number; b: number };
      grainScale?: number;
      noiseTexture: Texture;
    },
    ref
  ) => {
    const grainyMaterial = useMemo(() => {
      return new ShaderMaterial({
        // blending: AdditiveBlending,
        uniforms: {
          uOpacity: { value: opacity },
          uColor: { value: new Vector3(color.r, color.g, color.b) },
          uGrainScale: { value: grainScale },
          uNoiseTexture: { value: noiseTexture }, // Add the noise texture
        },
        vertexShader: `
          varying vec2 vUv;
          uniform float uGrainScale;
          void main() {
            vUv = uv * uGrainScale; // Scale the UVs for tiling
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uOpacity;
          uniform vec3 uColor;
          uniform sampler2D uNoiseTexture;

          void main() {
            // Sample the noise texture
            float grain = texture2D(uNoiseTexture, vUv).r;

            // Combine grain with the base color
            vec3 finalColor = uColor * grain;
            gl_FragColor = vec4(finalColor, uOpacity);
          }
        `,
        transparent: true,
      });
    }, [opacity, color, grainScale, noiseTexture]);

    return <primitive ref={ref} attach="material" object={grainyMaterial} />;
  }
);
