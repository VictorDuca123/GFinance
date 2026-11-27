/*
 * Tema do GFinance. A paleta, as fontes e as medidas abaixo vêm do design aprovado
 * (tablet Android na horizontal, referência 1280 x 800 dp) e não devem ser trocadas por gosto.
 *
 * Regras de uso:
 * - Texto nunca abaixo de 16 sp. Corpo em fonts.semibold, títulos em fonts.heavy.
 * - Texto branco só sobre action, deep, black ou a parte escura do degradê. Nunca sobre o lima.
 * - Amarelo (yellow) só no selo de valor pendente e nos detalhes indicados no design.
 * - Estado nunca é indicado só por cor: selos e avisos sempre têm ícone e texto.
 */

export const colors = {
  // Paleta do design
  primary: '#03942E', // verde da marca (fundos grandes; texto branco aqui só em tamanho grande)
  action: '#02782A', // botões, círculos de número, setas
  deep: '#04501A',
  black: '#0B0B0B',
  lime: '#D6F13F', // só na ponta do degradê
  yellow: '#FEF647', // só no selo de valor pendente
  tint: '#E6F4EA', // fundo claro de ícones e selos "Em dia"
  bg: '#F7F8F6',
  surface: '#FFFFFF',
  border: '#E1E6DE',
  borderSoft: '#E8ECE6',
  ink: '#111111',
  muted: '#2A2D31', // texto secundário (cinza quase preto)
  placeholder: '#8A8F88',
  disabledBg: '#DDE2DA',
  disabledText: '#4A4F55',
  red: '#C0392B', // saídas e seta de saídas
  redSoft: '#E06B63', // ícone de saídas
  redTint: '#FDE8E6',
  error: '#B3261E',
  warnBg: '#FFF4D6',
  skeleton: '#E6EAE3',

  // Sobre o degradê: vidro escuro garante contraste mesmo quando o fundo chega no lima.
  glass: 'rgba(11,11,11,0.55)',
  glassBorder: 'rgba(255,255,255,0.35)',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255,255,255,0.92)',
  glassLight: 'rgba(255,255,255,0.2)', // círculo de ícone sobre o degradê
  textScrim: 'rgba(0,0,0,0.45)', // sombra que mantém texto branco legível sobre o verde
  scrim: 'rgba(0,0,0,0.35)', // escurece a tela atrás de uma janela

  // Nomes antigos, ainda usados pelas telas fora do novo visual (Fornecedores, Saídas,
  // Histórico, Relatórios). Apontam para a paleta nova para manter tudo coerente.
  secondary: '#FEF647',
  background: '#F7F8F6',
  text: '#111111',
  textMuted: '#2A2D31',
  success: '#02782A',
  danger: '#B3261E',
};

/** Degradê do topo das telas e do card em destaque (da esquerda para a direita). */
export const heroGradient = {
  colors: ['#0B0B0B', '#04501A', '#03942E', '#D6F13F'] as const,
  locations: [0, 0.24, 0.62, 1] as const,
  start: { x: 0, y: 0.15 },
  end: { x: 1, y: 0.85 },
};

export const fonts = {
  regular: 'OpenSans_400Regular',
  semibold: 'OpenSans_600SemiBold', // texto corrente
  bold: 'OpenSans_700Bold', // botões, rótulos fortes
  heavy: 'OpenSans_800ExtraBold', // títulos
  logo: 'Philosopher_700Bold', // só o nome "GFinance"
};

export const radius = { pill: 999, card: 32, sheet: 44, field: 28 };

/** Alvo mínimo de toque (dp). */
export const touch = 56;

export const shadow = {
  card: {
    shadowColor: '#0B0B0B', shadowOpacity: 0.08, shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 }, elevation: 3,
  },
  button: {
    shadowColor: '#03942E', shadowOpacity: 0.35, shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// small subiu de 15 para 16: nenhum texto do app fica abaixo de 16 sp.
export const fontSize = {
  small: 16,
  body: 18,
  subtitle: 22,
  title: 28,
} as const;

export const typography = {
  title: fontSize.title,
  subtitle: fontSize.subtitle,
};

export const layout = {
  touchTarget: touch,
  maxContentWidth: 960,
  radius: 12,
};

export const Colors = {
  light: {
    text: colors.text,
    textSecondary: colors.textMuted,
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.tint,
    tint: colors.primary,
    icon: colors.textMuted,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#bdbdbd',
    background: '#121212',
    backgroundElement: '#242424',
    backgroundSelected: '#164b2b',
    tint: '#39b85c',
    icon: '#bdbdbd',
    tabIconDefault: '#bdbdbd',
    tabIconSelected: '#39b85c',
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
  mono: 'monospace',
};
