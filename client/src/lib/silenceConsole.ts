/**
 * Production Console Silencer
 * Automatically disables all console output in production, on Vercel deployments,
 * and across any custom domains (such as .in).
 */

export function setupConsoleSilencer(): void {
  if (typeof window === "undefined") return;

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0" ||
    window.location.hostname.endsWith(".local");

  const isProd =
    import.meta.env.PROD ||
    process.env.NODE_ENV === "production" ||
    !isLocalhost;

  if (isProd) {
    const noop = () => {};
    const methods = [
      "log",
      "debug",
      "info",
      "warn",
      "error",
      "table",
      "trace",
      "group",
      "groupCollapsed",
      "groupEnd",
      "clear",
      "count",
      "countReset",
      "assert",
      "dir",
      "dirxml",
      "time",
      "timeLog",
      "timeEnd",
    ] as const;

    methods.forEach((method) => {
      try {
        (window.console as any)[method] = noop;
      } catch {
        // Ignore if property is protected or read-only
      }
    });
  }
}

// Execute immediately when imported
setupConsoleSilencer();
