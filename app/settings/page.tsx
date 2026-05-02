"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Theme = "dark" | "light";

function useSystemTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setTheme(mq.matches ? "dark" : "light");
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return theme;
}

export default function SettingsPage() {
  const theme = useSystemTheme();
  const isDark = theme === "dark";
  const palette = {
    bg: isDark ? "#0b0b0b" : "#fff",
    fg: isDark ? "#f5f5f5" : "#111",
    muted: isDark ? "#a3a3a3" : "#555",
    border: isDark ? "#262626" : "#ddd",
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
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>Settings</h1>

      <p style={{ color: palette.muted, lineHeight: 1.5 }}>
        Placeholder settings page. The point of this route is to be a place
        you can navigate to AFTER completing OAuth, then navigate back — to
        verify the bug fix in <code>@withone/auth</code> v1.1.9 (no iframe
        loop, no <code>?one_auth_state</code> resurrection).
      </p>

      <Link
        href="/"
        style={{
          padding: "10px 18px",
          borderRadius: 8,
          border: `1px solid ${palette.border}`,
          background: palette.bg,
          color: palette.fg,
          textDecoration: "none",
          fontSize: 14,
          alignSelf: "flex-start",
        }}
      >
        ← Back home
      </Link>
    </main>
  );
}
