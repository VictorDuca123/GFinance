import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { PessoaForm } from '../../src/components/PessoaForm';
import { Screen } from '../../src/components/Screen';
import { clientesApi } from '../../src/services/api';
import { PessoaDados } from '../../src/types';
import { useResponsavelDaOperacao } from '../../src/hooks/useResponsavelDaOperacao';

export default function NovoClienteScreen() {
  const router = useRouter();
  const { consumir } = useResponsavelDaOperacao('Adicionar cliente');   // após "const router = useRouter();"
  async function salvar(dados: PessoaDados) {
        const responsavelId = await consumir();
    if (responsavelId === null) throw new Error('Identificação cancelada. Nada foi salvo.');
    await clientesApi.criar(dados, responsavelId); // se falhar, cai no catch do formulário
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