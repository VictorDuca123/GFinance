import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppButton } from '../../src/components/AppButton';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { TextField } from '../../src/components/TextField';
import { Subtitle } from '../../src/components/Typography';
import { spacing } from '../../src/constants/theme';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useScreenData } from '../../src/hooks/useScreenData';
import { fornecedoresApi } from '../../src/services/api';
import { useIniciarOperacao } from '../../src/hooks/useIniciarOperacao';

export default function FornecedoresScreen() {
  const router = useRouter();
  const iniciar = useIniciarOperacao();
  const [busca, setBusca] = useState('');
  const termo = useDebounce(busca);
  const { data, loading, error, reload } = useScreenData(() => fornecedoresApi.listar(termo), [termo]);

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Fornecedores' }} />
      <View style={styles.topo}>
        <AppButton label="Adicionar fornecedor" onPress={() => iniciar('Adicionar fornecedor', { pathname: '/fornecedores/novo' })} />
        <TextField label="Buscar por nome" value={busca} onChangeText={setBusca} placeholder="Digite parte do nome" />
      </View>
      <StateView loading={loading && !data} error={error} empty={!!data && data.length === 0} emptyMessage="Nenhum fornecedor encontrado." onRetry={reload}>
        <FlatList
          data={data ?? []}
          keyExtractor={(f) => String(f.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Card onPress={() => router.push({ pathname: '/fornecedores/[id]', params: { id: String(item.id) } })}>
              <Subtitle>{item.nome}</Subtitle>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({ topo: { gap: spacing.md } });