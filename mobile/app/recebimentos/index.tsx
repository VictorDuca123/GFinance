import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { AppButton } from '../../src/components/AppButton';
import { Card } from '../../src/components/Card';
import { PeriodFilter } from '../../src/components/PeriodFilter';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Muted, Strong, Subtitle } from '../../src/components/Typography';
import { spacing } from '../../src/constants/theme';
import { useScreenData } from '../../src/hooks/useScreenData';
import { recebimentosApi } from '../../src/services/api';
import { Periodo } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { useIniciarOperacao } from '../../src/hooks/useIniciarOperacao';

export default function RecebimentosScreen() {
  const iniciar = useIniciarOperacao();
  const [periodo, setPeriodo] = useState<Periodo>({ dataInicio: null, dataFim: null });
  const { data, loading, error, reload } = useScreenData(() => recebimentosApi.listar({ ...periodo }), [periodo]);

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Entradas' }} />
      <AppButton label="Registrar entrada" onPress={() => iniciar('Registrar entrada', { pathname: '/recebimentos/novo' })} />
      <PeriodFilter onApply={setPeriodo} />
      <StateView loading={loading && !data} error={error} empty={!!data && data.length === 0} emptyMessage="Nenhuma entrada no período." onRetry={reload}>
        <FlatList
          data={data ?? []}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Card>
              <Subtitle>{item.clienteNome}</Subtitle>
              <Strong>{formatCurrency(item.valor)}</Strong>
              <Muted>{formatDate(item.data)}{item.informacoesAdicionais ? ` · ${item.informacoesAdicionais}` : ''}</Muted>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}