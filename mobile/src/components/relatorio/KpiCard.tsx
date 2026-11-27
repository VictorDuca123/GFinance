import { StyleSheet, View } from 'react-native';
import { Colors, colors, fontSize, layout, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { Muted, Strong, Title } from '../Typography';
import { CORES_GRAFICO, Marcador } from './Painel';

type Tipo = 'entradas' | 'saidas' | 'resultado';

const TITULOS: Record<Tipo, string> = {
  entradas: 'Recebimentos',
  saidas: 'Saídas',
  resultado: 'Resultado',
};

function situacao(valor: number): { texto: string; cor: string } {
  if (valor > 0) return { texto: 'Lucro no período', cor: colors.primary };
  if (valor < 0) return { texto: 'Prejuízo no período', cor: colors.danger };
  return { texto: 'Sem lucro nem prejuízo', cor: colors.textMuted };
}

/** Cartão de número principal. No resultado, a situação vai escrita (não só pela cor). */
export function KpiCard({ tipo, valor }: { tipo: Tipo; valor: number }) {
  const ehResultado = tipo === 'resultado';
  const sit = situacao(valor);
  const corValor = ehResultado ? sit.cor : colors.text;
  const rotuloAcessivel = `${TITULOS[tipo]}: ${formatCurrency(valor)}${ehResultado ? `. ${sit.texto}` : ''}`;

  return (
    <View
      style={[styles.card, ehResultado && styles.destaque]}
      accessible
      accessibilityLabel={rotuloAcessivel}
    >
      <View style={styles.topo}>
        {!ehResultado && <Marcador cor={CORES_GRAFICO[tipo]} />}
        <Muted>{TITULOS[tipo]}</Muted>
      </View>
      <Title style={[styles.valor, { color: corValor }]} adjustsFontSizeToFit numberOfLines={1}>
        {formatCurrency(valor)}
      </Title>
      {ehResultado && <Strong style={{ color: sit.cor }}>{sit.texto}</Strong>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 220,
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    borderWidth: 2,
    borderColor: Colors.light.backgroundSelected,
    padding: spacing.md,
    gap: spacing.xs,
  },
  destaque: { borderColor: colors.primary },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  valor: { fontSize: fontSize.title, fontVariant: ['tabular-nums'] },
});
