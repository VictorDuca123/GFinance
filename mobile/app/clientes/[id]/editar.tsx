import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { PessoaForm } from '../../../src/components/PessoaForm';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { useScreenData } from '../../../src/hooks/useScreenData';
import { clientesApi } from '../../../src/services/api';
import { PessoaDados } from '../../../src/types';

export default function EditarClienteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const clienteId = Number(id);
  const { data, loading, error, reload } = useScreenData(() => clientesApi.obter(clienteId), [clienteId]);

  async function salvar(dados: PessoaDados) {
    await clientesApi.atualizar(clienteId, dados);
    Alert.alert('Cliente atualizado', 'As alterações foram salvas.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Editar cliente' }} />
      <StateView loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <PessoaForm
            rotuloNome="Nome do cliente"
            textoBotao="Salvar alterações"
            inicial={{ nome: data.nome, outrasInformacoes: data.outrasInformacoes ?? '' }}
            onSubmit={salvar}
          />
        )}
      </StateView>
    </Screen>
  );
}