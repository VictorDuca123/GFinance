import { Stack, useRouter } from 'expo-router';
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
import { saidasApi } from '../../src/services/api';
import { Periodo } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';

export default function SaidasScreen() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>({ dataInicio: null, dataFim: null });
  const { data, loading, error, reload } = useScreenData(() => saidasApi.listar({ ...periodo }), [periodo]);

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Saídas' }} />
      {/* B4: identificação rápida entra aqui */}
      <AppButton label="Registrar saída" onPress={() => router.push('/saidas/novo')} />
      <PeriodFilter onApply={setPeriodo} />
      <StateView loading={loading && !data} error={error} empty={!!data && data.length === 0} emptyMessage="Nenhuma saída no período." onRetry={reload}>
        <FlatList
          data={data ?? []}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Card>
              <Subtitle>{item.descricao}</Subtitle>
              <Strong>{formatCurrency(item.valor)}</Strong>
              <Muted>{formatDate(item.data)}</Muted>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}