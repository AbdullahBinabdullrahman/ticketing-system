/**
 * Centralized Color Schema
 * All application colors should be imported from this file
 * This ensures consistency and makes it easy to change the theme
 */

export const colors = {
  // Primary Colors - Black-based theme
  primary: {
    50: "#f5f5f5",
    100: "#e5e5e5",
    200: "#d4d4d4",
    300: "#a3a3a3",
    400: "#737373",
    500: "#525252",
    600: "#404040",
    700: "#262626",
    800: "#171717",
    900: "#0a0a0a",
    950: "#000000",
  },

  // Accent Colors - For highlights and CTAs
  accent: {
    primary: "#FF6B35", // Vibrant orange
    secondary: "#F7931E", // Warm amber
    tertiary: "#00D9FF", // Bright cyan
    quaternary: "#7B68EE", // Medium purple
  },

  // Status Colors
  status: {
    success: "#10B981", // Green
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Red
    info: "#3B82F6", // Blue
  },

  // Text Colors
  text: {
    primary: "#FFFFFF", // White
    secondary: "#E5E5E5", // Light gray
    tertiary: "#A3A3A3", // Medium gray
    muted: "#737373", // Dark gray
    inverse: "#000000", // Black
  },

  // Background Colors
  background: {
    primary: "#000000", // Pure black
    secondary: "#0a0a0a", // Near black
    tertiary: "#171717", // Dark gray
    card: "#1a1a1a", // Card background
    hover: "#262626", // Hover state
    elevated: "#2a2a2a", // Elevated surfaces
  },

  // Border Colors
  border: {
    primary: "#262626",
    secondary: "#404040",
    accent: "#FF6B35",
    muted: "#171717",
  },

  // Gradient Definitions
  gradients: {
    primary: "linear-gradient(135deg, #000000 0%, #262626 100%)",
    accent: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
    accentAlt: "linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)",
    subtle: "linear-gradient(180deg, #0a0a0a 0%, #000000 100%)",
    card: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
  },

  // Shadow Colors
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.5)",
    glow: "0 0 20px rgba(255, 107, 53, 0.3)",
    glowAlt: "0 0 20px rgba(0, 217, 255, 0.3)",
  },
} as const;

/**
 * CSS Variables for use in Tailwind or inline styles
 */
export const cssVariables = {
  "--color-primary-50": colors.primary[50],
  "--color-primary-100": colors.primary[100],
  "--color-primary-200": colors.primary[200],
  "--color-primary-300": colors.primary[300],
  "--color-primary-400": colors.primary[400],
  "--color-primary-500": colors.primary[500],
  "--color-primary-600": colors.primary[600],
  "--color-primary-700": colors.primary[700],
  "--color-primary-800": colors.primary[800],
  "--color-primary-900": colors.primary[900],
  "--color-primary-950": colors.primary[950],

  "--color-accent-primary": colors.accent.primary,
  "--color-accent-secondary": colors.accent.secondary,
  "--color-accent-tertiary": colors.accent.tertiary,
  "--color-accent-quaternary": colors.accent.quaternary,

  "--color-text-primary": colors.text.primary,
  "--color-text-secondary": colors.text.secondary,
  "--color-text-tertiary": colors.text.tertiary,
  "--color-text-muted": colors.text.muted,

  "--color-bg-primary": colors.background.primary,
  "--color-bg-secondary": colors.background.secondary,
  "--color-bg-tertiary": colors.background.tertiary,
  "--color-bg-card": colors.background.card,
} as const;

/**
 * Helper function to get color by path
 * @example getColor('accent.primary') // Returns '#FF6B35'
 */
export function getColor(path: string): { [key: string]: string } | string {
  const parts = path.split(".");
  let current: Record<string, unknown> = colors as Record<string, unknown>;

  for (const part of parts) {
    if (current[part] === undefined) {
      console.warn(`Color path "${path}" not found, returning fallback`);
      return "#000000";
    }
    current = current[part] as Record<string, unknown>;
  }

  return current as { [key: string]: string };
}

/**
 * Type-safe color getter with autocomplete
 */
export type ColorPath =
  | `primary.${keyof typeof colors.primary}`
  | `accent.${keyof typeof colors.accent}`
  | `status.${keyof typeof colors.status}`
  | `text.${keyof typeof colors.text}`
  | `background.${keyof typeof colors.background}`
  | `border.${keyof typeof colors.border}`;

export default colors;
