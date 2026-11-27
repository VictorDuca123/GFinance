import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PeriodFilter } from '../../src/components/PeriodFilter';
import { BarraComparativa } from '../../src/components/relatorio/BarraComparativa';
import { GraficoEvolucao } from '../../src/components/relatorio/GraficoEvolucao';
import { KpiCard } from '../../src/components/relatorio/KpiCard';
import { CORES_GRAFICO } from '../../src/components/relatorio/Painel';
import { Ranking } from '../../src/components/relatorio/Ranking';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Muted, Title } from '../../src/components/Typography';
import { colors, fontSize, layout, spacing } from '../../src/constants/theme';
import { recebimentosApi, relatoriosApi, saidasApi } from '../../src/services/api';
import { Periodo, Recebimento, RelatorioPeriodo, Saida } from '../../src/types';
import { formatDate } from '../../src/utils/format';
import {
  AtalhoPeriodo, PeriodoFechado, agruparEvolucao, periodoDoAtalho, rankingClientes, rankingSaidas,
} from '../../src/utils/relatorio';

type Opcao = AtalhoPeriodo | 'personalizado';

const OPCOES: { id: Opcao; rotulo: string }[] = [
  { id: 'este_mes', rotulo: 'Este mês' },
  { id: 'mes_passado', rotulo: 'Mês passado' },
  { id: 'ultimos_30', rotulo: 'Últimos 30 dias' },
  { id: 'personalizado', rotulo: 'Personalizado' },
];

interface Dados { periodo: PeriodoFechado; relatorio: RelatorioPeriodo; recebimentos: Recebimento[]; saidas: Saida[] }

export default function RelatoriosScreen() {
  const [opcao, setOpcao] = useState<Opcao>('este_mes');
  const [periodo, setPeriodo] = useState<PeriodoFechado | null>(null);
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // Se a pessoa trocar de período antes da resposta chegar, a resposta antiga é ignorada.
  const ultimaRequisicao = useRef(0);

  const gerar = useCallback(async (p: PeriodoFechado) => {
    const id = ++ultimaRequisicao.current;
    setPeriodo(p);
    setCarregando(true);
    setErro(null);
    try {
      const [relatorio, recebimentos, saidas] = await Promise.all([
        relatoriosApi.periodo(p.dataInicio, p.dataFim),
        recebimentosApi.listar(p),
        saidasApi.listar(p),
      ]);
      if (id === ultimaRequisicao.current) setDados({ periodo: p, relatorio, recebimentos, saidas });
    } catch (e) {
      if (id !== ultimaRequisicao.current) return;
      setDados(null);
      setErro(e instanceof Error ? e.message : 'Não foi possível gerar o relatório.');
    } finally {
      if (id === ultimaRequisicao.current) setCarregando(false);
    }
  }, []);

  // Abre já mostrando o mês atual, para a tela nunca começar vazia.
  useEffect(() => { gerar(periodoDoAtalho('este_mes')); }, [gerar]);

  function escolher(nova: Opcao) {
    setOpcao(nova);
    if (nova !== 'personalizado') gerar(periodoDoAtalho(nova));
  }

  function aplicarPersonalizado(p: Periodo) {
    if (p.dataInicio && p.dataFim) gerar({ dataInicio: p.dataInicio, dataFim: p.dataFim });
  }

  const evolucao = dados && agruparEvolucao(dados.periodo, dados.recebimentos, dados.saidas);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Relatórios' }} />

      <View style={styles.atalhos} accessibilityRole="radiogroup" accessibilityLabel="Período do relatório">
        {OPCOES.map((o) => {
          const ativo = o.id === opcao;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo, checked: ativo }}
              accessibilityLabel={o.rotulo}
              onPress={() => escolher(o.id)}
              style={({ pressed }) => [styles.chip, ativo && styles.chipAtivo, pressed && styles.chipPressionado]}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{o.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      {opcao === 'personalizado' && (
        <PeriodFilter obrigatorio textoBotao="Gerar relatório" onApply={aplicarPersonalizado} />
      )}

      {periodo && (
        <View style={styles.cabecalho}>
          <Title>{formatDate(periodo.dataInicio)} a {formatDate(periodo.dataFim)}</Title>
          <Muted>Totais calculados pelo sistema; gráficos com os lançamentos do período.</Muted>
        </View>
      )}

      <StateView
        loading={carregando}
        error={erro}
        onRetry={periodo ? () => gerar(periodo) : undefined}
        empty={!dados}
        emptyMessage="Escolha um período para ver o relatório."
      >
        {dados && evolucao && (
          <View style={styles.conteudo}>
            <View style={styles.grade}>
              <KpiCard tipo="entradas" valor={dados.relatorio.totalRecebimentos} />
              <KpiCard tipo="saidas" valor={dados.relatorio.totalSaidas} />
              <KpiCard tipo="resultado" valor={dados.relatorio.resultado} />
            </View>

            <BarraComparativa entradas={dados.relatorio.totalRecebimentos} saidas={dados.relatorio.totalSaidas} />

            <GraficoEvolucao granularidade={evolucao.granularidade} grupos={evolucao.grupos} />

            <View style={styles.grade}>
              <Ranking
                titulo="Clientes que mais pagaram"
                itens={rankingClientes(dados.recebimentos)}
                cor={CORES_GRAFICO.entradas}
                mensagemVazia="Nenhum recebimento neste período."
              />
              <Ranking
                titulo="Maiores saídas"
                itens={rankingSaidas(dados.saidas)}
                cor={CORES_GRAFICO.saidas}
                mensagemVazia="Nenhuma saída neste período."
                detalheEhData
              />
            </View>
          </View>
        )}
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: layout.touchTarget / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipAtivo: { backgroundColor: colors.primary },
  chipPressionado: { opacity: 0.85 },
  chipTexto: { fontSize: fontSize.body, fontWeight: '600', color: colors.primary },
  chipTextoAtivo: { color: colors.surface },
  cabecalho: { gap: spacing.xs },
  conteudo: { gap: spacing.lg },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
