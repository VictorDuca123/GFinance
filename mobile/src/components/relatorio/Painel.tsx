import { ReactNode } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { Colors, colors, layout, spacing } from '../../constants/theme';
import { Muted, Subtitle } from '../Typography';

/** Bloco do dashboard: título, subtítulo opcional e conteúdo sobre fundo levemente destacado. */
export function Painel({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <View style={styles.painel}>
      <View style={styles.cabecalho}>
        <Subtitle accessibilityRole="header">{titulo}</Subtitle>
        {!!subtitulo && <Muted>{subtitulo}</Muted>}
      </View>
      {children}
    </View>
  );
}

/** Barra horizontal proporcional. `fracao` vai de 0 a 1; valores > 0 ganham largura mínima para continuarem visíveis. */
export function Barra({ fracao, cor, altura = 14 }: { fracao: number; cor: string; altura?: number }) {
  const pct = fracao <= 0 ? 0 : Math.max(fracao * 100, 2);
  return (
    <View style={[styles.trilho, { height: altura }]} importantForAccessibility="no-hide-descendants">
      <View style={[styles.preenchimento, { width: `${pct}%` as DimensionValue, backgroundColor: cor }]} />
    </View>
  );
}

/** Quadradinho colorido da legenda, sempre acompanhado de texto. */
export function Marcador({ cor }: { cor: string }) {
  return <View style={[styles.marcador, { backgroundColor: cor }]} />;
}

export const CORES_GRAFICO = { entradas: colors.primary, saidas: colors.danger } as const;

const styles = StyleSheet.create({
  painel: {
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: layout.radius,
    padding: spacing.md,
    gap: spacing.md,
  },
  cabecalho: { gap: spacing.xs },
  trilho: { flex: 1, backgroundColor: colors.surface, borderRadius: 999, overflow: 'hidden' },
  preenchimento: { height: '100%', borderRadius: 999 },
  marcador: { width: 14, height: 14, borderRadius: 3 },
});
