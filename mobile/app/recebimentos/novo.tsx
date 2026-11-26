import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppButton } from '../../src/components/AppButton';
import { ClientePicker } from '../../src/components/ClientePicker';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { clientesApi, recebimentosApi } from '../../src/services/api';
import { Cliente } from '../../src/types';
import { dateBRToISO, formatDate, maskDate, parseMoney, todayISO } from '../../src/utils/format';
import { useResponsavelDaOperacao } from '../../src/hooks/useResponsavelDaOperacao';

interface Erros { cliente?: string; valor?: string; data?: string }

export default function NovoRecebimentoScreen() {
  const router = useRouter();
  const { consumir } = useResponsavelDaOperacao('Registrar recebimento');
  const { clienteId } = useLocalSearchParams<{ clienteId?: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [valorTxt, setValorTxt] = useState('');
  const [dataTxt, setDataTxt] = useState(formatDate(todayISO()));
  const [info, setInfo] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (clienteId) {
      // Se falhar, a pessoa escolhe o cliente manualmente.
      clientesApi.obter(Number(clienteId)).then(setCliente).catch(() => undefined);
    }
  }, [clienteId]);

  async function salvar() {
    const valor = parseMoney(valorTxt);
    const data = dateBRToISO(dataTxt);
    const novos: Erros = {};
    if (!cliente) novos.cliente = 'Selecione o cliente.';
    if (valor === null || valor <= 0) novos.valor = 'Informe um valor maior que zero.';
    if (!data) novos.data = 'Informe uma data válida (dd/mm/aaaa).';
    setErros(novos);
    if (!cliente || valor === null || valor <= 0 || !data) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      const responsavelId = await consumir();
      if (responsavelId === null) throw new Error('Identificação cancelada. Nada foi salvo.');
      await recebimentosApi.criar({ clienteId: cliente.id, valor, data, informacoesAdicionais: info.trim() }, responsavelId);
      Alert.alert('Recebimento registrado', 'O recebimento foi salvo com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Registrar recebimento' }} />
      <ClientePicker selecionado={cliente} onSelect={setCliente} erro={erros.cliente} />
      <TextField label="Valor recebido (R$)" value={valorTxt} onChangeText={setValorTxt} placeholder="0,00" keyboardType="decimal-pad" error={erros.valor} />
      <TextField label="Data do recebimento" value={dataTxt} onChangeText={(t) => setDataTxt(maskDate(t))} placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} error={erros.data} />
      <TextField label="Informações adicionais (opcional)" value={info} onChangeText={setInfo} maxLength={255} multiline style={{ minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }} />
      {!!erroEnvio && <ErrorBanner message={erroEnvio} />}
      <AppButton label="Salvar recebimento" onPress={salvar} loading={enviando} />
    </Screen>
  );
}