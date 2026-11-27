import { StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { Granularidade, GrupoEvolucao } from '../../utils/relatorio';
import { Body, Muted } from '../Typography';
import { Barra, CORES_GRAFICO, Marcador, Painel } from './Painel';

/**
 * Uma linha por dia (ou mês) com duas barras: entradas em cima, saídas embaixo.
 * Barras horizontais cabem bem no tablet e o leitor de tela lê cada linha como um texto.
 */
export function GraficoEvolucao({ granularidade, grupos }: { granularidade: Granularidade; grupos: GrupoEvolucao[] }) {
  const maior = Math.max(0, ...grupos.flatMap((g) => [g.entradas, g.saidas]));
  const porDia = granularidade === 'dia';

  return (
    <Painel
      titulo={porDia ? 'Movimento por dia' : 'Movimento por mês'}
      subtitulo={porDia ? 'Só aparecem os dias com lançamentos.' : 'Só aparecem os meses com lançamentos.'}
    >
      <View style={styles.legenda}>
        <View style={styles.itemLegenda}><Marcador cor={CORES_GRAFICO.entradas} /><Muted>Recebimentos</Muted></View>
        <View style={styles.itemLegenda}><Marcador cor={CORES_GRAFICO.saidas} /><Muted>Saídas</Muted></View>
      </View>

      {grupos.length === 0 ? (
        <Body>Nenhum lançamento neste período.</Body>
      ) : (
        grupos.map((g) => (
          <View
            key={g.chave}
            style={styles.linha}
            accessible
            accessibilityLabel={`${g.rotulo}: recebimentos ${formatCurrency(g.entradas)}, saídas ${formatCurrency(g.saidas)}`}
          >
            <Body style={styles.rotulo}>{g.rotulo}</Body>
            <View style={styles.barras}>
              <View style={styles.barraLinha}>
                <Barra fracao={maior ? g.entradas / maior : 0} cor={CORES_GRAFICO.entradas} />
                <Muted style={styles.valor}>{formatCurrency(g.entradas)}</Muted>
              </View>
              <View style={styles.barraLinha}>
                <Barra fracao={maior ? g.saidas / maior : 0} cor={CORES_GRAFICO.saidas} />
                <Muted style={styles.valor}>{formatCurrency(g.saidas)}</Muted>
              </View>
            </View>
          </View>
        ))
      )}
    </Painel>
  );
}

const styles = StyleSheet.create({
  legenda: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap' },
  itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rotulo: { width: 90, fontVariant: ['tabular-nums'] },
  barras: { flex: 1, gap: spacing.xs },
  barraLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  valor: { minWidth: 110, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
