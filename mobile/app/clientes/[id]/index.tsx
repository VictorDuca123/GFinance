import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '../../../src/components/AppButton';
import { Card } from '../../../src/components/Card';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { Body, Muted, Strong, Subtitle, Title } from '../../../src/components/Typography';
import { spacing } from '../../../src/constants/theme';
import { useScreenData } from '../../../src/hooks/useScreenData';
import { clientesApi, recebimentosApi } from '../../../src/services/api';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { useIniciarOperacao } from '../../../src/hooks/useIniciarOperacao';

export default function ClienteDetalheScreen() {
  const iniciar = useIniciarOperacao();
  const { id } = useLocalSearchParams<{ id: string }>();
  const clienteId = Number(id);

  const { data, loading, error, reload } = useScreenData(async () => {
    const [cliente, recebimentos] = await Promise.all([
      clientesApi.obter(clienteId),
      recebimentosApi.listar({ clienteId }),
    ]);
    return { cliente, recebimentos };
  }, [clienteId]);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Cliente' }} />
      <StateView loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <>
            <Title>{data.cliente.nome}</Title>
            {!!data.cliente.outrasInformacoes && <Body>{data.cliente.outrasInformacoes}</Body>}

            <Card>
              <View style={styles.linha}><Muted>Total a receber</Muted><Strong>{formatCurrency(data.cliente.totalAReceber)}</Strong></View>
              <View style={styles.linha}><Muted>Total recebido</Muted><Strong>{formatCurrency(data.cliente.totalRecebido)}</Strong></View>
              <View style={styles.linha}><Muted>Valor pendente</Muted><Strong>{formatCurrency(data.cliente.valorPendente)}</Strong></View>
            </Card>

            <AppButton label="Editar cliente" variant="secondary" onPress={() => iniciar('Editar cliente', { pathname: '/clientes/[id]/editar', params: { id: String(clienteId) } })} />
            <AppButton label="Registrar entrada" onPress={() => iniciar('Registrar entrada', { pathname: '/recebimentos/novo', params: { clienteId: String(clienteId) } })} />
            <Subtitle>Entradas</Subtitle>
            {data.recebimentos.length === 0 ? (
              <Muted>Nenhuma entrada registrada para este cliente.</Muted>
            ) : (
              data.recebimentos.map((r) => (
                <Card key={r.id}>
                  <Strong>{formatCurrency(r.valor)}</Strong>
                  <Muted>{formatDate(r.data)}{r.informacoesAdicionais ? ` · ${r.informacoesAdicionais}` : ''}</Muted>
                </Card>
              ))
            )}
          </>
        )}
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
});