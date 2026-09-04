/**
 * Cookie and LocalStorage synchronization utilities
 * Ensures data persistence across guest profiles, browser tabs, and reloads.
 */

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + encodeURIComponent(name) + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getCookieOrStorage(key: string): string | null {
  const fromCookie = getCookie(key);
  if (fromCookie) return fromCookie;
  if (typeof localStorage !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCookieAndStorage(key: string, value: string, days = 30): void {
  setCookie(key, value, days);
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage not accessible, stored in cookie instead:", e);
    }
  }
}
