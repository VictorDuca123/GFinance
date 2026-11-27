import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/theme';
import { formatCurrency } from '../utils/format';
import { IconCheck, IconClock } from './icons';

type Props = { tipo: 'pending'; valor: number } | { tipo: 'ok' };

/**
 * Selo de situação do cliente. Nunca depende só da cor: tem ícone e texto.
 * - pending: amarelo, relógio e o valor pendente.
 * - ok: verde claro, check e "Em dia".
 */
export function Badge(props: Props) {
  const pendente = props.tipo === 'pending';
  const texto = pendente ? formatCurrency(props.valor) : 'Em dia';
  return (
    <View
      style={[styles.selo, pendente ? styles.pendente : styles.ok]}
      accessible
      accessibilityLabel={pendente ? `Valor pendente: ${texto}` : 'Em dia, sem valor pendente'}
    >
      {pendente ? <IconClock size={20} color={colors.ink} /> : <IconCheck size={20} color={colors.action} strokeWidth={2.6} />}
      <Text style={[styles.texto, pendente ? styles.textoPendente : styles.textoOk]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pendente: { backgroundColor: colors.yellow },
  ok: { backgroundColor: colors.tint },
  texto: { fontFamily: fonts.bold },
  textoPendente: { fontSize: 20, color: colors.ink, fontVariant: ['tabular-nums'] },
  textoOk: { fontSize: 18, color: colors.action },
});
