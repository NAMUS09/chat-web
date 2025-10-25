import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";
import { QueryProvider } from "./providers/query-provider.tsx";
import store from "./store/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <QueryProvider>
          <App />
          <Toaster />
          {import.meta.env.VITE_MODE === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
