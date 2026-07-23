import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * The only theme values the app understands. Anything outside this union —
 * including tampered or corrupted `localStorage` entries — is rejected before
 * it can reach the DOM, preventing `data-theme` attribute injection.
 */
export type Theme = "light" | "dark";

/** `localStorage` key under which the user's explicit theme choice is persisted. */
export const THEME_STORAGE_KEY = "theme";

/** `localStorage` key under which the user's explicit font choice is persisted. */
export const FONT_STORAGE_KEY = "easy-read-font";

/** Media query used to detect the operating-system colour-scheme preference. */
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Narrowing type guard for {@link Theme}.
 *
 * Used as the single validation gate for every untrusted source of a theme
 * value (`localStorage`, `storage` events from other tabs). Returning `false`
 * here is what keeps an attacker-controlled string from ever being written to
 * `document.documentElement`.
 *
 * @param value - Any candidate value, typically a string read from storage.
 * @returns `true` only when `value` is exactly `"light"` or `"dark"`.
 */
export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * Narrowing type guard for the easy-read font preference.
 *
 * @param value - Any candidate value.
 * @returns `true` when value is boolean or boolean-string.
 */
export function isEasyReadFont(value: unknown): value is boolean {
  return value === true || value === false || value === "true" || value === "false";
}

/**
 * Reads the persisted theme, validating it against {@link isTheme}.
 *
 * @returns The stored {@link Theme}, or `null` when nothing valid is stored
 * (no entry, an invalid/tampered entry, or storage being unavailable).
 */
function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    // Accessing localStorage can throw (Safari private mode, disabled storage).
    return null;
  }
}

/**
 * Reads the persisted easy-read font preference, validating it against {@link isEasyReadFont}.
 *
 * @returns The stored boolean preference, or false when not present or invalid.
 */
export function getStoredFontPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
    return isEasyReadFont(stored) ? stored === "true" || stored === true : false;
  } catch {
    return false;
  }
}

/**
 * Resolves the current operating-system colour-scheme preference.
 *
 * @returns `"dark"` when the OS prefers a dark scheme, otherwise `"light"`.
 * Falls back to `"light"` in non-browser / SSR environments.
 */
function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

/**
 * Computes the theme to use on first paint: an explicit stored choice wins,
 * otherwise we follow the OS preference.
 */
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

/**
 * Applies a theme to the document root. This is the **single place** in the
 * app that mutates the `data-theme` attribute.
 *
 * @param theme - A validated {@link Theme} to apply.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Applies the easy-read font preference to the document root. This is the **single place**
 * in the app that mutates the `data-font` attribute.
 *
 * @param easyRead - A boolean indicating whether to use the easy-read font.
 */
export function applyFontPreference(easyRead: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-font", easyRead ? "easy-read" : "default");
}

/**
 * Resolves and applies the initial theme and font preference synchronously, before React renders.
 *
 * Call this once from the app entry point so the correct `data-theme` and `data-font` is set
 * ahead of the first paint, avoiding a flash of the wrong theme (FOUC).
 *
 * @returns The {@link Theme} that was applied.
 */
export function initTheme(): Theme {
  const theme = resolveInitialTheme();
  applyTheme(theme);
  const easyRead = getStoredFontPreference();
  applyFontPreference(easyRead);
  return theme;
}

/** Value exposed by {@link useTheme}. */
export interface ThemeContextValue {
  /** The currently active theme. */
  theme: Theme;
  /** Sets an explicit theme; persists the choice and stops OS-preference following. */
  setTheme: (theme: Theme) => void;
  /** Flips between `"light"` and `"dark"` as an explicit choice. */
  toggleTheme: () => void;
  /** Whether the dyslexia-friendly "easy-read" font is active. */
  easyReadFont: boolean;
  /** Sets the dyslexia-friendly font preference explicitly. */
  setEasyReadFont: (easyReadFont: boolean) => void;
  /** Flips the easy-read font preference. */
  toggleEasyReadFont: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provides theme state to the tree and keeps `data-theme` and `data-font` in sync.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);
  const [easyReadFont, setEasyReadState] = useState<boolean>(getStoredFontPreference);

  // Whether the user (in this tab or another) has explicitly picked a theme.
  // While `false`, we keep following the OS preference. A ref keeps the latest
  // value available to long-lived event listeners without re-subscribing.
  const hasExplicitChoiceRef = useRef<boolean>(getStoredTheme() !== null);

  // Single source of truth: mirror state to the DOM whenever it changes.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyFontPreference(easyReadFont);
  }, [easyReadFont]);

  const setTheme = useCallback((next: Theme) => {
    hasExplicitChoiceRef.current = true;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures; in-memory state still updates the UI.
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const setEasyReadFont = useCallback((next: boolean) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font-transitioning", "true");
    }
    try {
      window.localStorage.setItem(FONT_STORAGE_KEY, String(next));
    } catch {
      // Ignore persistence failures.
    }
    setEasyReadState(next);
    setTimeout(() => {
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-font-transitioning");
      }
    }, 150);
  }, []);

  const toggleEasyReadFont = useCallback(() => {
    setEasyReadFont(!easyReadFont);
  }, [easyReadFont, setEasyReadFont]);

  // Follow the OS colour-scheme preference, but only while the user has not
  // made an explicit choice. Effects only run in the browser, so we only need
  // to guard against environments where matchMedia itself is missing.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasExplicitChoiceRef.current) return;
      setThemeState(event.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // Safari < 14 fallback.
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Cross-tab synchronisation. The `storage` event only fires in *other* tabs,
  // so this reacts to choices made elsewhere. Effects are browser-only, so no
  // SSR guard is needed here.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        if (event.newValue === null) {
          // Another tab cleared the choice → resume following the OS.
          hasExplicitChoiceRef.current = false;
          setThemeState(getSystemTheme());
          return;
        }

        if (isTheme(event.newValue)) {
          hasExplicitChoiceRef.current = true;
          setThemeState(event.newValue);
        }
      } else if (event.key === FONT_STORAGE_KEY) {
        if (event.newValue === null) {
          if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-font-transitioning", "true");
          }
          setEasyReadState(false);
          setTimeout(() => {
            if (typeof document !== "undefined") {
              document.documentElement.removeAttribute("data-font-transitioning");
            }
          }, 150);
          return;
        }

        if (event.newValue === "true" || event.newValue === "false") {
          const nextVal = event.newValue === "true";
          if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-font-transitioning", "true");
          }
          setEasyReadState(nextVal);
          setTimeout(() => {
            if (typeof document !== "undefined") {
              document.documentElement.removeAttribute("data-font-transitioning");
            }
          }, 150);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      easyReadFont,
      setEasyReadFont,
      toggleEasyReadFont,
    }),
    [theme, setTheme, toggleTheme, easyReadFont, setEasyReadFont, toggleEasyReadFont],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Accesses the current theme and its mutators.
 *
 * @throws If called outside of a {@link ThemeProvider}.
 * @returns The {@link ThemeContextValue} for the nearest provider.
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme();
 * <button onClick={toggleTheme}>Switch to {theme === "light" ? "dark" : "light"}</button>
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
