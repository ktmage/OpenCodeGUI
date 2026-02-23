import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Task 4 で App コンポーネントを作成し、ここでレンダリングする
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>OpenCode Chat</div>
  </StrictMode>,
);
