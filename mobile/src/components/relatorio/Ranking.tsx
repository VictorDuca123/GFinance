import { StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../utils/format';
import { ItemRanking } from '../../utils/relatorio';
import { Body, Muted, Strong } from '../Typography';
import { Barra, Painel } from './Painel';

interface Props {
  titulo: string;
  itens: ItemRanking[];
  cor: string;
  mensagemVazia: string;
  detalheEhData?: boolean;
}

/** Lista "top N" com posição, nome, valor e uma barra proporcional ao primeiro colocado. */
export function Ranking({ titulo, itens, cor, mensagemVazia, detalheEhData = false }: Props) {
  const maior = itens[0]?.valor ?? 0;
  return (
    <View style={styles.coluna}>
      <Painel titulo={titulo}>
        {itens.length === 0 ? (
          <Body>{mensagemVazia}</Body>
        ) : (
          itens.map((item, i) => {
            const detalhe = item.detalhe && (detalheEhData ? formatDate(item.detalhe) : item.detalhe);
            return (
              <View
                key={item.id}
                style={styles.item}
                accessible
                accessibilityLabel={`${i + 1}º lugar: ${item.rotulo}, ${formatCurrency(item.valor)}${detalhe ? `, ${detalhe}` : ''}`}
              >
                <View style={styles.topo}>
                  <Strong style={styles.posicao}>{i + 1}º</Strong>
                  <View style={styles.nome}>
                    <Body numberOfLines={2}>{item.rotulo}</Body>
                    {!!detalhe && <Muted>{detalhe}</Muted>}
                  </View>
                  <Strong style={styles.valor}>{formatCurrency(item.valor)}</Strong>
                </View>
                <Barra fracao={maior ? item.valor / maior : 0} cor={cor} altura={8} />
              </View>
            );
          })
        )}
      </Painel>
    </View>
  );
}

const styles = StyleSheet.create({
  coluna: { flexBasis: '45%', flexGrow: 1, minWidth: 280 },
  item: { gap: spacing.xs },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  posicao: { width: 36 },
  nome: { flex: 1 },
  valor: { fontVariant: ['tabular-nums'] },
});
