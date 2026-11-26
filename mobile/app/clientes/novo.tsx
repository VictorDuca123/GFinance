import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { PessoaForm } from '../../src/components/PessoaForm';
import { Screen } from '../../src/components/Screen';
import { clientesApi } from '../../src/services/api';
import { PessoaDados } from '../../src/types';

export default function NovoClienteScreen() {
  const router = useRouter();

  async function salvar(dados: PessoaDados) {
    await clientesApi.criar(dados); // se falhar, cai no catch do formulário
    // RF14: só confirma depois que a API confirmou a gravação
    Alert.alert('Cliente cadastrado', 'O cliente foi salvo com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Novo cliente' }} />
      <PessoaForm rotuloNome="Nome do cliente" textoBotao="Salvar cliente" onSubmit={salvar} />
    </Screen>
  );
}