import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Switch, View } from 'react-native';
import { AppButton } from '../../src/components/AppButton';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { TextField } from '../../src/components/TextField';
import { Body, Muted, Strong, Subtitle } from '../../src/components/Typography';
import { spacing } from '../../src/constants/theme';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useScreenData } from '../../src/hooks/useScreenData';
import { clientesApi } from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { useIniciarOperacao } from '../../src/hooks/useIniciarOperacao';

export default function ClientesScreen() {
  const router = useRouter();
  const iniciar = useIniciarOperacao();
  const [busca, setBusca] = useState('');
  const [somentePendentes, setSomentePendentes] = useState(false);
  const termo = useDebounce(busca);

  const { data, loading, error, reload } = useScreenData(
    () => clientesApi.listar({ busca: termo, somentePendentes }),
    [termo, somentePendentes],
  );

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Clientes' }} />
      <View style={styles.topo}>
        <AppButton label="Adicionar cliente" onPress={() => iniciar('Adicionar cliente', { pathname: '/clientes/novo' })} />
        <TextField label="Buscar por nome" value={busca} onChangeText={setBusca} placeholder="Digite parte do nome" />
        <View style={styles.filtro}>
          <Body>Mostrar somente clientes com pendência</Body>
          <Switch value={somentePendentes} onValueChange={setSomentePendentes} />
        </View>
        {data && <Strong>Total geral pendente: {formatCurrency(data.totalGeralPendente)}</Strong>}
      </View>

      <StateView
        loading={loading && !data}
        error={error}
        empty={!!data && data.itens.length === 0}
        emptyMessage={somentePendentes ? 'Nenhum cliente com valor pendente.' : 'Nenhum cliente encontrado.'}
        onRetry={reload}
      >
        <FlatList
          data={data?.itens ?? []}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Card onPress={() => router.push({ pathname: '/clientes/[id]', params: { id: String(item.id) } })}>
              <Subtitle>{item.nome}</Subtitle>
              <Muted>Pendente: {formatCurrency(item.valorPendente)}</Muted>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topo: { gap: spacing.md },
  filtro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
});