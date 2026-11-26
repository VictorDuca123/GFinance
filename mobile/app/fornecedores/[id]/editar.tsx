import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { PessoaForm } from '../../../src/components/PessoaForm';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { useScreenData } from '../../../src/hooks/useScreenData';
import { fornecedoresApi } from '../../../src/services/api';
import { PessoaDados } from '../../../src/types';

export default function EditarFornecedorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fornecedorId = Number(id);
  const { data, loading, error, reload } = useScreenData(() => fornecedoresApi.obter(fornecedorId), [fornecedorId]);

  async function salvar(dados: PessoaDados) {
    await fornecedoresApi.atualizar(fornecedorId, dados);
    Alert.alert('Fornecedor atualizado', 'As alterações foram salvas.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Editar fornecedor' }} />
      <StateView loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <PessoaForm
            rotuloNome="Nome do fornecedor"
            textoBotao="Salvar alterações"
            inicial={{ nome: data.nome, outrasInformacoes: data.outrasInformacoes ?? '' }}
            onSubmit={salvar}
          />
        )}
      </StateView>
    </Screen>
  );
}