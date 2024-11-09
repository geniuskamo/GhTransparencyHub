import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import { ErrorBoundary } from "@/components/error-boundary";
import { App } from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <SWRConfig value={{ 
        fetcher,
        provider: () => new Map()
      }}>
        <App />
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>
);