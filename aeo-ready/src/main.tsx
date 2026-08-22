import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://mock-convex.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ErrorBoundary>
  </StrictMode>
);
