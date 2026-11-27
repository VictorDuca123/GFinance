import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowButton } from '../../src/components/ArrowButton';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { HeroHeader } from '../../src/components/HeroHeader';
import { BackButton } from '../../src/components/BackButton';
import { IconClose, IconPlus, IconSearch } from '../../src/components/icons';
import { Avatar } from '../../src/components/NumberCircle';
import { EstadoErro, EstadoVazio, Esqueleto } from '../../src/components/EstadosLista';
import { colors, fonts, radius, shadow, touch } from '../../src/constants/theme';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useIniciarOperacao } from '../../src/hooks/useIniciarOperacao';
import { useScreenData } from '../../src/hooks/useScreenData';
import { clientesApi } from '../../src/services/api';
import { Cliente } from '../../src/types';
import { formatCurrency } from '../../src/utils/format';

const LARGURA_LARGA = 900;
const LARGURA_ESTREITA = 600; // abaixo disso o selo vai para baixo do nome

export default function ClientesScreen() {
  const router = useRouter();
  const iniciar = useIniciarOperacao();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const margem = width >= LARGURA_LARGA ? 48 : 24;
  const estreita = width < LARGURA_ESTREITA;

  const [busca, setBusca] = useState('');
  const [somentePendentes, setSomentePendentes] = useState(false);
  const termo = useDebounce(busca);

  const { data, loading, error, reload } = useScreenData(
    () => clientesApi.listar({ busca: termo, somentePendentes }),
    [termo, somentePendentes],
  );

  // Sem busca e sem filtro, lista vazia quer dizer que ainda não há nenhum cliente cadastrado.
  const semFiltro = !termo.trim() && !somentePendentes;
  const novoCliente = () => iniciar('Adicionar cliente', { pathname: '/clientes/novo' });
  const limparTudo = () => {
    setBusca('');
    setSomentePendentes(false);
  };
  // Sem resposta da API o total não mostra número (nem fica "carregando" para sempre).
  const totalVisivel = data ? formatCurrency(data.totalGeralPendente) : error ? 'Indisponível' : '…';
  const totalFalado = data
    ? `Total pendente: ${formatCurrency(data.totalGeralPendente)}`
    : error ? 'Total pendente indisponível no momento' : 'Carregando total pendente';
  const abrir = (c: Cliente) => router.push({ pathname: '/clientes/[id]', params: { id: String(c.id) } });

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ headerShown: false, title: 'Clientes' }} />
      <HeroHeader height={205} waveTop={120} />

      <View style={[styles.conteudo, { paddingHorizontal: margem, paddingTop: insets.top + 20 }]}>
        <View style={styles.linhaTitulo}>
          <BackButton />
          <Text style={styles.titulo} accessibilityRole="header">Clientes</Text>
        </View>

        <View style={styles.linhaBusca}>
          <View style={styles.busca}>
            <IconSearch size={24} color={colors.muted} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar cliente pelo nome"
              // O texto de exemplo é o único rótulo visível da busca: usa muted para ter contraste de leitura.
              placeholderTextColor={colors.muted}
              accessibilityLabel="Buscar cliente pelo nome"
              returnKeyType="search"
              autoCorrect={false}
              maxLength={150}
              style={styles.campoBusca}
            />
            {!!busca && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                onPress={() => setBusca('')}
                hitSlop={8}
                style={({ pressed }) => [styles.limpar, pressed && styles.pressionado]}
              >
                <IconClose size={22} color={colors.muted} strokeWidth={2.4} />
              </Pressable>
            )}
          </View>
          <Button
            label="Novo cliente"
            icon={(cor) => <IconPlus size={22} color={cor} strokeWidth={2.6} />}
            onPress={novoCliente}
          />
        </View>

        <View style={styles.linhaFiltros}>
          <View style={styles.filtros} accessibilityRole="radiogroup" accessibilityLabel="Filtrar clientes">
            <Filtro rotulo="Todos" ativo={!somentePendentes} onPress={() => setSomentePendentes(false)} />
            <Filtro rotulo="Só com valor pendente" ativo={somentePendentes} onPress={() => setSomentePendentes(true)} />
          </View>
          <View style={styles.total} accessible accessibilityLabel={totalFalado}>
            <Text style={styles.rotuloTotal}>Total pendente</Text>
            <View style={[styles.capsulaTotal, !data && !!error && styles.capsulaSemDado]}>
              <Text style={[styles.valorTotal, !data && !!error && styles.valorSemDado]}>{totalVisivel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.lista}>
          {loading && !data ? (
            <Esqueleto />
          ) : error ? (
            <EstadoErro mensagem={error} onRetry={reload} />
          ) : data && data.itens.length === 0 ? (
            semFiltro ? (
              <EstadoVazio
                titulo="Nenhum cliente ainda"
                texto="Cadastre o primeiro cliente para começar a registrar entradas."
                acao={{ rotulo: 'Cadastrar cliente', onPress: novoCliente }}
              />
            ) : termo.trim() ? (
              <EstadoVazio
                titulo="Nenhum cliente encontrado"
                texto={somentePendentes
                  ? 'Nenhum cliente com valor pendente tem esse nome. Confira o nome ou mostre todos.'
                  : 'Confira o nome digitado na busca.'}
                acao={{ rotulo: 'Limpar busca', onPress: limparTudo }}
              />
            ) : (
              <EstadoVazio
                titulo="Nenhum cliente com valor pendente"
                texto="Todos os clientes estão em dia."
                acao={{ rotulo: 'Mostrar todos', onPress: limparTudo }}
              />
            )
          ) : (
            <FlatList
              data={data?.itens ?? []}
              keyExtractor={(c) => String(c.id)}
              contentContainerStyle={[styles.itens, { paddingBottom: 24 + insets.bottom }]}
              keyboardShouldPersistTaps="handled"
              // Puxar para baixo atualiza; o mesmo indicador aparece enquanto a busca nova carrega.
              refreshing={loading && !!data}
              onRefresh={reload}
              renderItem={({ item }) => <LinhaCliente cliente={item} empilhar={estreita} onPress={() => abrir(item)} />}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function Filtro({ rotulo, ativo, onPress }: { rotulo: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: ativo, checked: ativo }}
      accessibilityLabel={rotulo}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.filtro, ativo ? styles.filtroAtivo : styles.filtroInativo, pressed && styles.pressionado]}
    >
      <Text style={[styles.textoFiltro, ativo && styles.textoFiltroAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

function LinhaCliente({ cliente, empilhar, onPress }: { cliente: Cliente; empilhar: boolean; onPress: () => void }) {
  const pendente = cliente.valorPendente > 0;
  const selo = pendente ? <Badge tipo="pending" valor={cliente.valorPendente} /> : <Badge tipo="ok" />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${cliente.nome}. ${pendente ? `Valor pendente: ${formatCurrency(cliente.valorPendente)}` : 'Em dia'}`}
      accessibilityHint="Abre os detalhes do cliente"
      onPress={onPress}
      style={({ pressed }) => [styles.linha, pressed && styles.linhaPressionada]}
    >
      <Avatar nome={cliente.nome} />
      {empilhar ? (
        <View style={styles.empilhado}>
          <Text style={styles.nomeEmpilhado} numberOfLines={2}>{cliente.nome}</Text>
          {selo}
        </View>
      ) : (
        <>
          <Text style={styles.nome} numberOfLines={2}>{cliente.nome}</Text>
          {selo}
        </>
      )}
      <ArrowButton label={`Abrir ${cliente.nome}`} onPress={onPress} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  conteudo: { flex: 1, width: '100%', maxWidth: 1280, alignSelf: 'center', gap: 20 },
  pressionado: { opacity: 0.85 },

  linhaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  titulo: { fontFamily: fonts.heavy, fontSize: 32, color: colors.onDark },

  linhaBusca: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  busca: {
    flexGrow: 1, flexBasis: 320,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: touch, borderRadius: radius.field, paddingHorizontal: 20,
    backgroundColor: colors.surface, ...shadow.card,
  },
  campoBusca: { flex: 1, minHeight: touch, fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  // 40 dp visíveis + 8 dp de folga em volta = 56 dp de área de toque.
  limpar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },

  linhaFiltros: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  filtro: { minHeight: 52, paddingHorizontal: 22, borderRadius: radius.pill, justifyContent: 'center' },
  filtroAtivo: { backgroundColor: colors.action },
  filtroInativo: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  textoFiltro: { fontFamily: fonts.bold, fontSize: 17, color: colors.muted },
  textoFiltroAtivo: { color: colors.onDark },
  total: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rotuloTotal: { fontFamily: fonts.semibold, fontSize: 17, color: colors.muted },
  capsulaTotal: { minHeight: 44, paddingHorizontal: 20, borderRadius: radius.pill, backgroundColor: colors.action, justifyContent: 'center' },
  valorTotal: { fontFamily: fonts.bold, fontSize: 21, color: colors.onDark, fontVariant: ['tabular-nums'] },
  capsulaSemDado: { backgroundColor: colors.disabledBg },
  valorSemDado: { color: colors.disabledText, fontSize: 17 },

  lista: { flex: 1 },
  itens: { gap: 12, paddingTop: 4 },
  linha: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    minHeight: 84, borderRadius: radius.field, paddingLeft: 16, paddingRight: 14, paddingVertical: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft, ...shadow.card,
  },
  linhaPressionada: { borderColor: colors.action },
  nome: { flex: 1, fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  empilhado: { flex: 1, gap: 8, alignItems: 'flex-start' },
  nomeEmpilhado: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
});
