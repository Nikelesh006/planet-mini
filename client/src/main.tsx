import "./lib/silenceConsole";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Synchronously capture and scrub JWT token from URL query string immediately on load
if (typeof window !== "undefined") {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get("token");
    if (urlToken) {
      localStorage.setItem("jwtToken", urlToken);
      searchParams.delete("token");
      const cleanSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
      window.history.replaceState(null, "", window.location.pathname + cleanSearch + window.location.hash);
    }
  } catch {
    // Ignore error
  }
}

createRoot(document.getElementById("root")!).render(<App />);
