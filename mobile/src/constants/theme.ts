
export const colors = {
  primary: "#03942e",
  secundary: "#fef647",
  background: "#ffffff",
  surface: "#FFFFFF",
  text: "#000000",
  textMuted: "#616161",
  border: "#ffffff",
  success: "#00ff0d",
  danger: "#bb0000b9",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSize = {
  small: 15,
  body: 18,
  subtitle: 22,
  title: 28,
} as const;

export const typography = {
  title: fontSize.title,
  subtitle: fontSize.subtitle,
};

export const layout = {
  touchTarget: 56,
  maxContentWidth: 960,
  radius: 12,
};

export const Colors = {
  light: {
    text: colors.text,
    textSecondary: colors.textMuted,
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: "#e6f4e9",
    tint: colors.primary,
    icon: colors.textMuted,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: "#ffffff",
    textSecondary: "#bdbdbd",
    background: "#121212",
    backgroundElement: "#242424",
    backgroundSelected: "#164b2b",
    tint: "#39b85c",
    icon: "#bdbdbd",
    tabIconDefault: "#bdbdbd",
    tabIconSelected: "#39b85c",
  },
};

export type ThemeColor = keyof typeof Colors.light;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
};

export const MaxContentWidth = layout.maxContentWidth;

export const Fonts = {
  mono: "monospace",
};
