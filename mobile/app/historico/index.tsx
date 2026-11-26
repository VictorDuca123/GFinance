import { Stack } from 'expo-router';
import { FlatList } from 'react-native';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Body, Muted, Subtitle } from '../../src/components/Typography';
import { spacing } from '../../src/constants/theme';
import { useScreenData } from '../../src/hooks/useScreenData';
import { historicoApi } from '../../src/services/api';
import { formatDateTime } from '../../src/utils/format';

const ACAO = { INCLUSAO: 'Inclusão', EDICAO: 'Edição' } as const;
const TIPO = { CLIENTE: 'Cliente', FORNECEDOR: 'Fornecedor', RECEBIMENTO: 'Recebimento', SAIDA: 'Saída' } as const;

export default function HistoricoScreen() {
  const { data, loading, error, reload } = useScreenData(() => historicoApi.listar(), []);

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Histórico' }} />
      <StateView loading={loading && !data} error={error} empty={!!data && data.length === 0} emptyMessage="Nenhuma atividade registrada." onRetry={reload}>
        <FlatList
          data={data ?? []}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          refreshing={loading && !!data}
          onRefresh={reload}
          renderItem={({ item }) => (
            <Card>
              <Subtitle>{TIPO[item.tipoRegistro]} nº {item.idRegistro}</Subtitle>
              <Body>{ACAO[item.acao]} por {item.nomeResponsavel}</Body>
              <Muted>{formatDateTime(item.dataHora)}</Muted>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}