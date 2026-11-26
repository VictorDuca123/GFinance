import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { PessoaForm } from '../../../src/components/PessoaForm';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { useScreenData } from '../../../src/hooks/useScreenData';
import { clientesApi } from '../../../src/services/api';
import { PessoaDados } from '../../../src/types';
import { useResponsavelDaOperacao } from '../../../src/hooks/useResponsavelDaOperacao';

export default function EditarClienteScreen() {
  const router = useRouter();
  const { consumir } = useResponsavelDaOperacao('Editar cliente');   // após "const clienteId = Number(id);"
  const { id } = useLocalSearchParams<{ id: string }>();
  const clienteId = Number(id);
  const { data, loading, error, reload } = useScreenData(() => clientesApi.obter(clienteId), [clienteId]);

  async function salvar(dados: PessoaDados) {
    const responsavelId = await consumir();
    if (responsavelId === null) throw new Error('Identificação cancelada. Nada foi salvo.');
    await clientesApi.atualizar(clienteId, dados, responsavelId);
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