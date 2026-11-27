import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../constants/theme';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { Button } from './Button';
import { IconProps, IconUsers, IconWifiOff } from './icons';

/* Estados de uma lista: carregando (esqueleto), vazia e erro. */

/** Linhas cinza no formato da lista enquanto os dados chegam. Pulsam, a não ser que o sistema peça menos movimento. */
export function Esqueleto({ linhas = 6 }: { linhas?: number }) {
  const reduzir = useReduceMotion();
  const opacidade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduzir) {
      opacidade.setValue(1);
      return;
    }
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.45, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    pulso.start();
    return () => pulso.stop();
  }, [reduzir, opacidade]);

  return (
    <View style={styles.esqueleto} accessible accessibilityLabel="Carregando" accessibilityLiveRegion="polite">
      {Array.from({ length: linhas }, (_, i) => (
        <Animated.View key={i} style={[styles.linhaEsqueleto, { opacity: opacidade }]}>
          <View style={styles.circulo} />
          <View style={styles.barras}>
            <View style={[styles.barra, { width: '46%' }]} />
            <View style={[styles.barra, styles.barraFina, { width: '28%' }]} />
          </View>
          <View style={styles.selo} />
        </Animated.View>
      ))}
    </View>
  );
}

interface EstadoProps {
  Icone: (p: IconProps) => ReactNode;
  tom: 'verde' | 'vermelho';
  titulo: string;
  texto: string;
  acao?: { rotulo: string; onPress: () => void };
}

function Estado({ Icone, tom, titulo, texto, acao }: EstadoProps) {
  const vermelho = tom === 'vermelho';
  return (
    <View style={styles.estado} accessibilityLiveRegion="polite">
      <View style={[styles.circuloEstado, { backgroundColor: vermelho ? colors.redTint : colors.tint }]}>
        <Icone size={44} color={vermelho ? colors.red : colors.action} strokeWidth={2.1} />
      </View>
      <Text style={styles.titulo} accessibilityRole="header">{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
      {acao && (
        <View style={styles.acao}>
          <Button label={acao.rotulo} onPress={acao.onPress} />
        </View>
      )}
    </View>
  );
}

/** Lista vazia. Sem `acao`, serve para busca ou filtro sem resultado. */
export function EstadoVazio(props: Omit<EstadoProps, 'Icone' | 'tom'>) {
  return <Estado Icone={IconUsers} tom="verde" {...props} />;
}

/**
 * Erro ao carregar. Falha de conexão ganha o texto do design;
 * outros erros mostram a mensagem que veio do servidor.
 */
export function EstadoErro({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  const semConexao = /conex/i.test(mensagem);
  return (
    <Estado
      Icone={IconWifiOff}
      tom="vermelho"
      titulo={semConexao ? 'Sem conexão com o servidor' : 'Não foi possível carregar'}
      texto={semConexao ? 'Confira se o tablet está na mesma rede do servidor e tente de novo.' : mensagem}
      acao={{ rotulo: 'Tentar de novo', onPress: onRetry }}
    />
  );
}

const styles = StyleSheet.create({
  esqueleto: { gap: 12, paddingTop: 4 },
  linhaEsqueleto: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    minHeight: 84, borderRadius: radius.field, paddingHorizontal: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft,
  },
  circulo: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.skeleton },
  barras: { flex: 1, gap: 10 },
  barra: { height: 16, borderRadius: 8, backgroundColor: colors.skeleton },
  barraFina: { height: 12 },
  selo: { width: 120, height: 40, borderRadius: 20, backgroundColor: colors.skeleton },

  estado: { alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 24 },
  circuloEstado: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  titulo: { fontFamily: fonts.heavy, fontSize: 24, color: colors.ink, textAlign: 'center' },
  texto: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.muted, textAlign: 'center', maxWidth: 460 },
  acao: { marginTop: 12, minWidth: 260 },
});
