import { StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { Body, Strong } from '../Typography';
import { Barra, CORES_GRAFICO, Marcador, Painel } from './Painel';

/** Recebimentos x saídas lado a lado, com o valor escrito ao lado de cada barra. */
export function BarraComparativa({ entradas, saidas }: { entradas: number; saidas: number }) {
  const maior = Math.max(entradas, saidas);
  const linhas = [
    { rotulo: 'Recebimentos', valor: entradas, cor: CORES_GRAFICO.entradas },
    { rotulo: 'Saídas', valor: saidas, cor: CORES_GRAFICO.saidas },
  ];

  let resumo = 'Entradas e saídas iguais no período.';
  if (maior > 0 && entradas !== saidas) {
    const pct = Math.round((Math.min(entradas, saidas) / maior) * 100);
    resumo = entradas > saidas
      ? `As saídas equivalem a ${pct}% dos recebimentos.`
      : `Os recebimentos cobrem só ${pct}% das saídas.`;
  }

  return (
    <Painel titulo="Entradas x saídas" subtitulo={resumo}>
      {linhas.map((l) => (
        <View
          key={l.rotulo}
          style={styles.linha}
          accessible
          accessibilityLabel={`${l.rotulo}: ${formatCurrency(l.valor)}`}
        >
          <View style={styles.rotulo}>
            <Marcador cor={l.cor} />
            <Body>{l.rotulo}</Body>
          </View>
          <Barra fracao={maior ? l.valor / maior : 0} cor={l.cor} altura={22} />
          <Strong style={styles.valor}>{formatCurrency(l.valor)}</Strong>
        </View>
      ))}
    </Painel>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  rotulo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: 150 },
  valor: { minWidth: 130, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
