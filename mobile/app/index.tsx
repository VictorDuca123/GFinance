import { LinearGradient } from 'expo-linear-gradient';
import { Href, Stack, useFocusEffect, useRouter } from 'expo-router';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowButton } from '../src/components/ArrowButton';
import { HeroHeader } from '../src/components/HeroHeader';
import {
  IconArrowIn, IconArrowOut, IconChart, IconHistory, IconProps, IconTruck, IconUsers,
} from '../src/components/icons';
import { APP_NAME } from '../src/constants/config';
import { colors, fonts, heroGradient, radius, shadow, touch } from '../src/constants/theme';
import { useIniciarOperacao } from '../src/hooks/useIniciarOperacao';
import { useReduceMotion } from '../src/hooks/useReduceMotion';
import { clientesApi } from '../src/services/api';
import { formatCurrency } from '../src/utils/format';

type Tom = 'verde' | 'amarelo' | 'vermelho';

interface Modulo {
  id: string;
  titulo: string;
  descricao: string;
  rota: string;
  Icone: (p: IconProps) => ReactNode;
  tom: Tom;
}

// Ordem fixa do design: linha 1 Clientes, Entradas, Relatórios; linha 2 Fornecedores, Saídas, Histórico.
const MODULOS: Modulo[] = [
  { id: 'clientes', titulo: 'Clientes', descricao: 'Cadastro e valores pendentes', rota: '/clientes', Icone: IconUsers, tom: 'verde' },
  { id: 'entradas', titulo: 'Entradas', descricao: 'Valores recebidos dos clientes', rota: '/recebimentos', Icone: IconArrowIn, tom: 'amarelo' },
  { id: 'relatorios', titulo: 'Relatórios', descricao: 'Totais e resultado por período', rota: '/relatorios', Icone: IconChart, tom: 'verde' },
  { id: 'fornecedores', titulo: 'Fornecedores', descricao: 'Cadastro e consulta', rota: '/fornecedores', Icone: IconTruck, tom: 'verde' },
  { id: 'saidas', titulo: 'Saídas', descricao: 'Despesas efetuadas', rota: '/saidas', Icone: IconArrowOut, tom: 'vermelho' },
  { id: 'historico', titulo: 'Histórico', descricao: 'Quem alterou o quê e quando', rota: '/historico', Icone: IconHistory, tom: 'verde' },
];

// Círculo do ícone / traço do ícone, por módulo.
const CORES_TOM: Record<Tom, { circulo: string; traco: string }> = {
  verde: { circulo: colors.tint, traco: colors.action },
  amarelo: { circulo: colors.yellow, traco: colors.black },
  vermelho: { circulo: colors.redTint, traco: colors.redSoft },
};

// Colunas da grade pela largura da janela: 3 deitado, 2 em pé, 1 em tela dividida estreita.
const LARGURA_TRES_COLUNAS = 900;
const LARGURA_DUAS_COLUNAS = 600;
const BASE_COLUNA: Record<number, `${number}%`> = { 1: '100%', 2: '46%', 3: '31%' };
const ATRASO_NAVEGAR_MS = 450; // deixa o destaque aparecer antes de trocar de tela
const DURACAO_DESTAQUE_MS = 1400;

type Total = { estado: 'carregando' } | { estado: 'ok'; valor: number } | { estado: 'erro' };

/** Total a receber de todos os clientes. Recarrega sempre que a Início volta a aparecer. */
function useTotalAReceber(): Total {
  const [total, setTotal] = useState<Total>({ estado: 'carregando' });
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      clientesApi
        .listar()
        .then((r) => ativo && setTotal({ estado: 'ok', valor: r.totalGeralPendente }))
        .catch(() => ativo && setTotal({ estado: 'erro' }));
      return () => {
        ativo = false;
      };
    }, []),
  );
  return total;
}

export default function HomeScreen() {
  const router = useRouter();
  const iniciar = useIniciarOperacao();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduzir = useReduceMotion();
  const total = useTotalAReceber();

  const largo = width >= LARGURA_TRES_COLUNAS;
  const colunas = largo ? 3 : width >= LARGURA_DUAS_COLUNAS ? 2 : 1;
  const margem = largo ? 48 : 24;
  const [fimDoTopo, setFimDoTopo] = useState(320);

  const [destaque, setDestaque] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function abrirModulo(m: Modulo) {
    if (destaque) return; // evita abrir duas telas com toques repetidos
    setDestaque(m.id);
    timers.current.push(
      setTimeout(() => router.push(m.rota as Href), reduzir ? 0 : ATRASO_NAVEGAR_MS),
      setTimeout(() => setDestaque(null), DURACAO_DESTAQUE_MS),
    );
  }

  // A onda acompanha o fim do conteúdo do topo, que muda de altura entre deitado e em pé.
  function medirTopo(e: LayoutChangeEvent) {
    const { y, height } = e.nativeEvent.layout;
    setFimDoTopo(Math.round(y + height));
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
      <Stack.Screen options={{ headerShown: false, title: APP_NAME }} />
      <HeroHeader height={Math.max(800, fimDoTopo + 160)} waveTop={fimDoTopo + 8} />

      <View style={[styles.conteudo, { paddingHorizontal: margem, paddingTop: insets.top + 24 }]}>
        <View onLayout={medirTopo} style={styles.topo}>
          <Text style={styles.logo} accessibilityRole="header">{APP_NAME}</Text>

          <View style={styles.saudacao}>
            <View style={styles.barraAmarela} />
            <Text style={[styles.titulo, !largo && styles.tituloEstreito]} accessibilityRole="header">
              Olá! O que vamos fazer hoje?
            </Text>
          </View>

          <View style={styles.atalhos}>
            <Atalho
              rotulo="Registrar entrada"
              circulo={colors.yellow}
              icone={<IconArrowIn size={26} color={colors.black} strokeWidth={2.3} />}
              onPress={() => iniciar('Registrar entrada', { pathname: '/recebimentos/novo' })}
            />
            <Atalho
              rotulo="Registrar saída"
              circulo={colors.redTint}
              icone={<IconArrowOut size={26} color={colors.red} strokeWidth={2.3} />}
              onPress={() => iniciar('Registrar saída', { pathname: '/saidas/novo' })}
            />
            <TotalAReceber total={total} />
          </View>
        </View>

        <View style={[styles.grade, { marginTop: 112 }]}>
          {MODULOS.map((m) => (
            <CardModulo
              key={m.id}
              modulo={m}
              colunas={colunas}
              destacado={destaque === m.id}
              reduzir={reduzir}
              onPress={() => abrirModulo(m)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Atalho({ rotulo, circulo, icone, onPress }: { rotulo: string; circulo: string; icone: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      style={({ pressed }) => [styles.pilula, pressed && styles.pressionado]}
    >
      <View style={[styles.circuloAtalho, { backgroundColor: circulo }]}>{icone}</View>
      <Text style={styles.textoAtalho}>{rotulo}</Text>
    </Pressable>
  );
}

function TotalAReceber({ total }: { total: Total }) {
  // Sem resposta da API não mostramos número nenhum (nunca um valor inventado).
  const valor = total.estado === 'ok' ? formatCurrency(total.valor) : total.estado === 'erro' ? 'Indisponível' : '…';
  const falado = total.estado === 'ok'
    ? `Total a receber: ${valor}`
    : total.estado === 'erro' ? 'Total a receber indisponível no momento' : 'Carregando total a receber';
  return (
    <View style={[styles.pilula, styles.pilulaTotal]} accessible accessibilityLabel={falado}>
      <Text style={styles.rotuloTotal}>Total a receber</Text>
      <Text style={[styles.valorTotal, total.estado !== 'ok' && styles.valorTotalSemDado]}>{valor}</Text>
    </View>
  );
}

interface CardProps { modulo: Modulo; colunas: number; destacado: boolean; reduzir: boolean; onPress: () => void }

/** Card de módulo. Ao tocar, ganha o degradê da marca e cresce levemente antes de abrir a tela. */
function CardModulo({ modulo, colunas, destacado, reduzir, onPress }: CardProps) {
  const progresso = useRef(new Animated.Value(0)).current;
  const { Icone, titulo, descricao, tom } = modulo;
  const cores = CORES_TOM[tom];

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: destacado ? 1 : 0,
      duration: reduzir ? 0 : 500,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, [destacado, reduzir, progresso]);

  const escala = progresso.interpolate({ inputRange: [0, 1], outputRange: [1, reduzir ? 1 : 1.02] });

  return (
    <Animated.View style={[styles.celula, { flexBasis: BASE_COLUNA[colunas], transform: [{ scale: escala }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${titulo}. ${descricao}`}
        accessibilityHint={`Abre ${titulo}`}
        onPress={onPress}
        style={styles.card}
      >
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progresso }]} pointerEvents="none">
          <LinearGradient {...heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={[styles.circuloModulo, { backgroundColor: destacado ? colors.glassLight : cores.circulo }]}>
          <Icone size={30} color={destacado ? colors.onDark : cores.traco} strokeWidth={2.2} />
        </View>
        <View style={styles.textosModulo}>
          <Text style={[styles.tituloModulo, destacado && styles.textoClaro]}>{titulo}</Text>
          <Text style={[styles.descricaoModulo, destacado && styles.descricaoClara]}>{descricao}</Text>
        </View>
        <View style={styles.seta}>
          <ArrowButton label={`Abrir ${titulo}`} tone={tom === 'vermelho' ? 'red' : 'green'} onPress={onPress} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { width: '100%', maxWidth: 1280, alignSelf: 'center' },
  topo: { gap: 28 },
  logo: { fontFamily: fonts.logo, fontSize: 28, color: colors.onDark },
  saudacao: { gap: 16 },
  barraAmarela: { width: 56, height: 5, borderRadius: 3, backgroundColor: colors.yellow },
  titulo: { fontFamily: fonts.heavy, fontSize: 48, lineHeight: 58, color: colors.onDark, maxWidth: 820 },
  tituloEstreito: { fontSize: 38, lineHeight: 46 },

  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingLeft: 8,
    paddingRight: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pressionado: { opacity: 0.85 },
  circuloAtalho: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  textoAtalho: { fontFamily: fonts.bold, fontSize: 18, color: colors.onDark },
  pilulaTotal: { paddingLeft: 24, gap: 12 },
  rotuloTotal: { fontFamily: fonts.semibold, fontSize: 16, color: colors.onDarkMuted },
  valorTotal: { fontFamily: fonts.bold, fontSize: 22, color: colors.yellow, fontVariant: ['tabular-nums'] },
  valorTotalSemDado: { color: colors.onDark, fontSize: 18 },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  celula: { flexGrow: 1 },
  card: {
    minHeight: 176,
    borderRadius: radius.card,
    paddingVertical: 24,
    paddingHorizontal: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
    ...shadow.card,
  },
  circuloModulo: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  textosModulo: { marginTop: 14, paddingRight: touch + 8, gap: 4 },
  tituloModulo: { fontFamily: fonts.heavy, fontSize: 24, color: colors.ink },
  descricaoModulo: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.muted },
  textoClaro: { color: colors.onDark },
  // No destaque o texto pequeno passa sobre o verde do degradê: a sombra mantém a leitura.
  descricaoClara: {
    color: colors.onDark,
    textShadowColor: colors.textScrim,
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
  seta: { position: 'absolute', right: 24, bottom: 24 },
});
