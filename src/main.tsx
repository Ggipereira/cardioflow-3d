import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { CardioFlowProvider } from "./context/CardioFlowContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <CardioFlowProvider>
        <App />
      </CardioFlowProvider>
    </BrowserRouter>
  </React.StrictMode>
);

