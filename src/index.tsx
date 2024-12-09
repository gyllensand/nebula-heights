import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  COLOR,
  SECONDARY_COLOR,
  EMISSIVE_COLOR,
  METALNESS,
  OPACITY,
} from "./BuildingStructure";
import { BOX_SIZE, CORE_SIZE, EXPLOSION_BLOCKS, SPACING } from "./generateData";

const blockArchitecture =
  CORE_SIZE + SPACING + EXPLOSION_BLOCKS + (BOX_SIZE[0] + BOX_SIZE[1]);
const colorScheme = `${COLOR}, ${SECONDARY_COLOR}, ${EMISSIVE_COLOR}`;
const additionalScheme = METALNESS * OPACITY;

declare const $fx: any;
$fx.features({
  blockArchitecture,
  colorScheme,
  additionalScheme,
});

const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
