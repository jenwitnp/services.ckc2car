/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ✅ Your existing colors
        main: {
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        secondary: {
          50: "#f0fdf2",
          100: "#dcfce3",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#048d1d", // Your base color
          600: "#037018",
          700: "#025a14",
          800: "#024711",
          900: "#013a0e",
          950: "#011f07",
        },
        primary: {
          50: "#eff6ff", // ✅ Added missing shades
          100: "#cfe2ff",
          200: "#9ec5fe",
          300: "#6ea8fe",
          400: "#3d8bfd",
          500: "#0d6efd",
          600: "#0a58ca",
          700: "#084298",
          800: "#052c65",
          900: "#031633",
        },
        warning: {
          50: "#fffbeb", // ✅ Added missing shade
          100: "#fff3cd",
          200: "#ffe69c",
          300: "#ffda6a",
          400: "#ffcd39",
          500: "#ffc107",
          600: "#cc9a06",
          700: "#997404",
          800: "#664d03",
          900: "#332701",
        },
        info: {
          50: "#f0f9ff", // ✅ Added missing shade
          100: "#cff4fc",
          200: "#9eeaf9",
          300: "#6edff6",
          400: "#3dd5f3",
          500: "#0dcaf0",
          600: "#0aa2c0",
          700: "#087990",
          800: "#055160",
          900: "#032830",
        },
        success: {
          50: "#f0fdf4", // ✅ Added missing shade
          100: "#d1e7dd",
          200: "#a3cfbb",
          300: "#75b798",
          400: "#479f76",
          500: "#198754",
          600: "#146c43",
          700: "#0f5132",
          800: "#0a3622",
          900: "#051b11",
        },
        danger: {
          50: "#fef2f2", // ✅ Added missing shade
          100: "#f8d7da",
          200: "#f1aeb5",
          300: "#ea868f",
          400: "#e35d6a",
          500: "#dc3545",
          600: "#b02a37",
          700: "#842029",
          800: "#58151c",
          900: "#2c0b0e",
        },

        // ✅ Additional colors needed for login page design
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },

        // ✅ Social media brand colors
        social: {
          line: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e", // LINE brand green
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
          },
          google: {
            50: "#fef2f2",
            100: "#fee2e2",
            200: "#fecaca",
            300: "#fca5a5",
            400: "#f87171",
            500: "#ef4444", // Google red
            600: "#dc2626",
            700: "#b91c1c",
            800: "#991b1b",
            900: "#7f1d1d",
          },
          facebook: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6", // Facebook blue
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
          },
          apple: {
            50: "#f9fafb",
            100: "#f3f4f6",
            200: "#e5e7eb",
            300: "#d1d5db",
            400: "#9ca3af",
            500: "#6b7280",
            600: "#4b5563",
            700: "#374151",
            800: "#1f2937", // Apple dark
            900: "#111827",
          },
        },

        // ✅ UI specific colors for better design system
        ui: {
          background: {
            primary: "#ffffff",
            secondary: "#f8fafc",
            tertiary: "#f1f5f9",
          },
          border: {
            light: "#e2e8f0",
            DEFAULT: "#cbd5e1",
            dark: "#94a3b8",
          },
          text: {
            primary: "#0f172a",
            secondary: "#475569",
            tertiary: "#64748b",
            muted: "#94a3b8",
          },
        },

        // ✅ Gradient colors for backgrounds
        gradient: {
          from: "#f8fafc",
          via: "#ffffff",
          to: "#f1f5f9",
        },
      },

      // ✅ Add custom gradients
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "login-gradient": "linear-gradient(135deg, var(--tw-gradient-stops))",
      },

      // ✅ Add custom shadows for cards
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-focus":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },

      // ✅ Add custom border radius
      borderRadius: {
        card: "0.75rem",
        button: "0.5rem",
      },

      // ✅ Add custom spacing for consistent design
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};
