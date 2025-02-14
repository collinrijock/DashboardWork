module.exports = {
  corePlugins: { preflight: false },
  safelist: [
    "xs:col-span-1",
    "xs:col-span-2",
    "xs:col-span-3",
    "xs:col-span-4",
    "xs:col-span-5",
    "xs:col-span-6",
    "xs:col-span-7",
    "xs:col-span-8",
    "xs:col-span-9",
    "xs:col-span-10",
    "xs:col-span-11",
    "xs:col-span-12",
    "sm:col-span-1",
    "sm:col-span-2",
    "sm:col-span-3",
    "sm:col-span-4",
    "sm:col-span-5",
    "sm:col-span-6",
    "sm:col-span-7",
    "sm:col-span-8",
    "sm:col-span-9",
    "sm:col-span-10",
    "sm:col-span-11",
    "sm:col-span-12",
    "col-span-1",
    "col-span-2",
    "col-span-3",
    "col-span-4",
    "col-span-5",
    "col-span-6",
    "col-span-7",
    "col-span-8",
    "col-span-9",
    "col-span-10",
    "col-span-11",
    "col-span-12",
  ],
  darkMode: 'class', // This enables dark mode
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-text-primary)',
        'secondary': 'var(--color-text-secondary)',
        'primary-dimmed': 'var(--color-text-primary-dimmed)',
        'primary-hover': 'var(--color-bg-primary-highlighted)',
        lula: "var(--color-lula)",
        // lulaNew: "#F07637",
        // text_primary: "rgba(51, 51, 85, 1)",
        // text_secondary: "rgba(51, 51, 85, 0.5)",
        // text_disabled: "rgba(198, 198, 208, 1)",
        button_primary: "rgba(255, 86, 1, 1)",
        // button_secondary: "rgba(153, 153, 170, 1)",
        // lulaBorder: "#D1D5DB",
        // lulaBorder_secondary: "#455773",
        // background_primary: "#FFFFFF",
        // background_secondary: "#E7EAF0",
      },
      backgroundColor: {
        'primary': 'var(--color-bg-primary)',
        'secondary': 'var(--color-bg-secondary)',
        'primary-hover': 'var(--color-bg-primary-highlighted)',
      },
      placeholderColor: {
        'primary': 'var(--color-text-primary)',
        'primary-dimmed': 'var(--color-text-primary-dimmed)',
      },
      fontFamily: {
        abel: ["Abel"],
        lazzer: ["Lazzer"],
        caslonIonic: ["CaslonIonic"],
        sans: ["Lazzer"],
        serif: ["CaslonIonic"]
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    function ({ addUtilities }) {
      const newUtilities = {
        '.capitalize-first': {
          textTransform: 'lowercase',
        },
        '.capitalize-first::first-letter': {
          textTransform: 'uppercase',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
}

