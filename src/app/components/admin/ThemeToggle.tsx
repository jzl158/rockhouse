"use client";
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ThemeToggle() {
  const [isDark, setIsDark] = React.useState<boolean>(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      {isDark ? <FaSun /> : <FaMoon />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} Mode</span>
    </button>
  );
}


