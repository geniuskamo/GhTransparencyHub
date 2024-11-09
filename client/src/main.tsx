import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import { Toaster } from "@/components/ui/toaster";
import { NavBar } from "@/components/common/nav-bar";
import { Home } from "@/pages/home";
import { Auth } from "@/pages/auth";
import { Requests } from "@/pages/requests";
import { Admin } from "@/pages/admin";
import { ErrorBoundary } from "@/components/error-boundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <SWRConfig 
        value={{ 
          fetcher,
          provider: () => new Map()
        }}
      >
        <div className="min-h-screen">
          <ErrorBoundary>
            <NavBar />
          </ErrorBoundary>
          <main>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/auth" component={Auth} />
              <Route path="/requests">
                <ErrorBoundary>
                  <Requests />
                </ErrorBoundary>
              </Route>
              <Route path="/admin">
                <ErrorBoundary>
                  <Admin />
                </ErrorBoundary>
              </Route>
              <Route>404 Page Not Found</Route>
            </Switch>
          </main>
          <Toaster />
        </div>
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>
);
