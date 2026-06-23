"use client";

import { useEffect } from "react";

export default function ExtensionErrorSuppressor() {
  useEffect(() => {
    const originalOnError = window.onerror;
    window.onerror = (message, source, ...rest) => {
      if (
        typeof source === "string" &&
        source.includes("chrome-extension://")
      ) {
        return true;
      }
      if (originalOnError) {
        return originalOnError(message, source, ...rest);
      }
      return false;
    };

    const originalUnhandled = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      const msg = String(event?.reason?.message || event?.reason || "");
      if (msg.includes("MetaMask") || msg.includes("chrome-extension")) {
        event.preventDefault();
        return;
      }
      if (originalUnhandled) {
        originalUnhandled.call(window, event);
      }
    };
  }, []);

  return null;
}
