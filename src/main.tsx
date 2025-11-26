import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CriticalCSS } from "./components/CriticalCSS";
import { setupLazyLoading, deferNonCriticalJS } from "./utils/performanceOptimizations";
import "./index.css";

// Setup performance optimizations
setupLazyLoading();
deferNonCriticalJS();

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <>
      <CriticalCSS />
      <App />
    </>
  );
}
