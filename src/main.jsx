// 外部資源
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

// 內部資源
import "./index.css";
import App from "./App.jsx";
import "./assets/all.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
