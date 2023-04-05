// utils/detectDarkMode.js
export function detectDarkMode() {
    if (typeof window !== 'undefined') {
      console.log("Dark mode? ", window.matchMedia('(prefers-color-scheme: dark)').matches)
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }
  