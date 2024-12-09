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

const colorScheme = `${COLOR}, ${SECONDARY_COLOR}, ${EMISSIVE_COLOR}`;
const additionalScheme = METALNESS * OPACITY;

declare const $fx: any;
$fx.features({
  colorScheme,
  additionalScheme,
});

const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
