import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { PeriodFilter } from '../../src/components/PeriodFilter';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Muted, Subtitle, Title } from '../../src/components/Typography';
import { colors, spacing } from '../../src/constants/theme';
import { relatoriosApi } from '../../src/services/api';
import { Periodo, RelatorioPeriodo } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';

export default function RelatoriosScreen() {
  const [relatorio, setRelatorio] = useState<RelatorioPeriodo | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar(periodo: Periodo) {
    if (!periodo.dataInicio || !periodo.dataFim) return;
    setCarregando(true);
    setErro(null);
    try {
      setRelatorio(await relatoriosApi.periodo(periodo.dataInicio, periodo.dataFim));
    } catch (e) {
      setRelatorio(null);
      setErro(e instanceof Error ? e.message : 'Não foi possível gerar o relatório.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Relatórios' }} />
      <PeriodFilter obrigatorio textoBotao="Gerar relatório" onApply={gerar} />
      <StateView loading={carregando} error={erro} empty={!relatorio} emptyMessage="Escolha um período para ver o relatório.">
        {relatorio && (
          <>
            <Title>{formatDate(relatorio.dataInicio)} a {formatDate(relatorio.dataFim)}</Title>
            <View style={styles.grade}>
              <Resumo titulo="Total de recebimentos" valor={relatorio.totalRecebimentos} />
              <Resumo titulo="Total de saídas" valor={relatorio.totalSaidas} />
              <Resumo titulo="Resultado" valor={relatorio.resultado} destaque />
            </View>
          </>
        )}
      </StateView>
    </Screen>
  );
}

function Resumo({ titulo, valor, destaque = false }: { titulo: string; valor: number; destaque?: boolean }) {
  const cor = destaque ? (valor >= 0 ? colors.success : colors.danger) : colors.text;
  return (
    <View style={styles.celula}>
      <Card>
        <Muted>{titulo}</Muted>
        <Subtitle style={{ color: cor }}>{formatCurrency(valor)}</Subtitle>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  celula: { flexBasis: '30%', flexGrow: 1, minWidth: 220 },
});