import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

declare const $fx: any;
// $fx.features({
//   type,
//   colorMode,
//   primaryColor,
//   secondaryColor,
//   bgColor,
// });

const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
