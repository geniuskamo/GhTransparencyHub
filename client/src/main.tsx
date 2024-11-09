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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <div className="min-h-screen">
        <NavBar />
        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/auth" component={Auth} />
            <Route path="/requests" component={Requests} />
            <Route path="/admin" component={Admin} />
            <Route>404 Page Not Found</Route>
          </Switch>
        </main>
        <Toaster />
      </div>
    </SWRConfig>
  </StrictMode>
);
