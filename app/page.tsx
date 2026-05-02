"use client";

import { useEffect, useState } from "react";
import { useOneAuth } from "@withone/auth";
import Link from "next/link";

// A stable placeholder user id for the AuthKit token. Any string works for
// this test app — the backend just uses it to scope connections.
const USER_ID = "tenant-test-user-1";

type Theme = "dark" | "light";

// Reads the parent OS / browser color-scheme preference. Returns null
// until it's known (i.e., until the post-mount effect runs). Callers
// MUST gate any iframe-opening side effect behind a non-null theme,
// otherwise the iframe gets opened with a guessed default and the
// post-OAuth check iframe ends up in the wrong color scheme.
function useSystemTheme(): Theme | null {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setTheme("light");
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setTheme(mq.matches ? "dark" : "light");
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  return theme;
}

// Inner component: only mounted once `theme` is known. This is critical
// — `useOneAuth` runs `detectOAuthReturn` synchronously during render,
// and on the post-OAuth hard-reload that detection opens the check
// iframe immediately. If we mounted this component while theme was
// still "guessing" we'd open the iframe with the wrong color scheme.
function ConnectArea({ theme }: { theme: Theme }) {
  const { open } = useOneAuth({
    appTheme: theme,
    token: {
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/api/one-auth`,
      headers: {
        "x-user-id": USER_ID,
      },
    },
    onSuccess: (connection) => {
      // eslint-disable-next-line no-console
      console.log("Connection created:", connection);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Connection failed:", error);
    },
    onClose: () => {
      // eslint-disable-next-line no-console
      console.log("Auth modal closed");
    },
  });

  const isDark = theme === "dark";
  const palette = {
    primaryBg: isDark ? "#fff" : "#111",
    primaryFg: isDark ? "#111" : "#fff",
    primaryBorder: isDark ? "#fff" : "#111",
    border: isDark ? "#262626" : "#ddd",
    bg: isDark ? "#0b0b0b" : "#fff",
    fg: isDark ? "#f5f5f5" : "#111",
  };

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button
        onClick={open}
        style={{
          padding: "10px 18px",
          borderRadius: 8,
          border: `1px solid ${palette.primaryBorder}`,
          background: palette.primaryBg,
          color: palette.primaryFg,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Connect Integration
      </button>
      <Link
        href="/settings"
        style={{
          padding: "10px 18px",
          borderRadius: 8,
          border: `1px solid ${palette.border}`,
          background: palette.bg,
          color: palette.fg,
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        Open Settings
      </Link>
    </div>
  );
}

export default function Home() {
  const theme = useSystemTheme();

  // While theme is null (first SSR pass + first client render), render
  // a stable placeholder so the HTML matches across server/client (no
  // hydration mismatch) AND so the @withone/auth iframe is never
  // mounted with a guessed theme. The Connect button shows up after
  // the matchMedia effect resolves the real value.
  const isDark = theme === "dark";
  const palette = {
    bg: theme === null ? "#fff" : isDark ? "#0b0b0b" : "#fff",
    fg: theme === null ? "#111" : isDark ? "#f5f5f5" : "#111",
    muted: theme === null ? "#555" : isDark ? "#a3a3a3" : "#555",
    subtle: theme === null ? "#888" : isDark ? "#737373" : "#888",
  };

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "48px",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        background: palette.bg,
        color: palette.fg,
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>
        @withone/auth tenant test
      </h1>

      <p style={{ color: palette.muted, lineHeight: 1.5 }}>
        This app verifies that <code>@withone/auth</code> v1.1.9 behaves
        correctly on a non-withone origin.{" "}
        {theme && (
          <>
            Currently using <strong>{theme}</strong> theme (auto-detected
            from system preference) — the iframe will match.
          </>
        )}
      </p>

      <ol style={{ color: palette.muted, lineHeight: 1.7, paddingLeft: 18 }}>
        <li>
          Click <strong>Connect Integration</strong> below.
        </li>
        <li>Pick an OAuth integration (e.g. Notion, Slack, Gmail).</li>
        <li>Complete the OAuth flow on the provider.</li>
        <li>
          Land back here. URL should briefly flash{" "}
          <code>?one_auth_state=…</code>, then hard-reload to clean.
        </li>
        <li>Dismiss the auth iframe.</li>
        <li>
          Click <Link href="/settings">Open Settings</Link>, then come back
          using the &quot;Back home&quot; link.
        </li>
        <li>
          ✅ Pass: the iframe does <em>not</em> reopen and the URL stays
          clean.
        </li>
        <li>
          ❌ Fail: iframe reopens or <code>?one_auth_state</code> reappears.
        </li>
      </ol>

      {theme === null ? (
        <p style={{ color: palette.subtle, fontSize: 12 }}>Loading…</p>
      ) : (
        <ConnectArea theme={theme} />
      )}

      <p style={{ color: palette.subtle, fontSize: 12 }}>
        Open DevTools, watch the URL bar, and observe whether the iframe
        reopens after the round-trip.
      </p>
    </main>
  );
}
