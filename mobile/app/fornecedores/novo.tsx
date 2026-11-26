import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { PessoaForm } from '../../src/components/PessoaForm';
import { Screen } from '../../src/components/Screen';
import { fornecedoresApi } from '../../src/services/api';
import { PessoaDados } from '../../src/types';
import { useResponsavelDaOperacao } from '../../src/hooks/useResponsavelDaOperacao';

export default function NovofornecedorScreen() {
  const router = useRouter();
  const { consumir } = useResponsavelDaOperacao('Adicionar fornecedor');
  async function salvar(dados: PessoaDados) {
        const responsavelId = await consumir();
    if (responsavelId === null) throw new Error('Identificação cancelada. Nada foi salvo.');
    await fornecedoresApi.criar(dados, responsavelId);
    Alert.alert('fornecedor cadastrado', 'O fornecedor foi salvo com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Novo fornecedor' }} />
      <PessoaForm rotuloNome="Nome do fornecedor" textoBotao="Salvar fornecedor" onSubmit={salvar} />
    </Screen>
  );
}