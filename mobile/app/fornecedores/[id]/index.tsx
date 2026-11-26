import { Stack, useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../../src/components/AppButton';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { Body, Title } from '../../../src/components/Typography';
import { useScreenData } from '../../../src/hooks/useScreenData';
import { fornecedoresApi } from '../../../src/services/api';
import { useIniciarOperacao } from '../../../src/hooks/useIniciarOperacao';

export default function FornecedorDetalheScreen() {
  const iniciar = useIniciarOperacao();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fornecedorId = Number(id);
  const { data, loading, error, reload } = useScreenData(() => fornecedoresApi.obter(fornecedorId), [fornecedorId]);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Fornecedor' }} />
      <StateView loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <>
            <Title>{data.nome}</Title>
            {!!data.outrasInformacoes && <Body>{data.outrasInformacoes}</Body>}
            <AppButton label="Editar fornecedor" onPress={() => iniciar('Editar fornecedor', { pathname: '/fornecedores/[id]/editar', params: { id: String(fornecedorId) } })} />
          </>
        )}
      </StateView>
    </Screen>
  );
}