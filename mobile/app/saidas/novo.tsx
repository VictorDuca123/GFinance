import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AppButton } from '../../src/components/AppButton';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { saidasApi } from '../../src/services/api';
import { dateBRToISO, formatDate, maskDate, parseMoney, todayISO } from '../../src/utils/format';

interface Erros { descricao?: string; valor?: string; data?: string }

export default function NovaSaidaScreen() {
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [valorTxt, setValorTxt] = useState('');
  const [dataTxt, setDataTxt] = useState(formatDate(todayISO()));
  const [erros, setErros] = useState<Erros>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar() {
    const desc = descricao.trim();
    const valor = parseMoney(valorTxt);
    const data = dateBRToISO(dataTxt);
    const novos: Erros = {};
    if (!desc) novos.descricao = 'Informe a descrição da despesa.';
    if (valor === null || valor <= 0) novos.valor = 'Informe um valor maior que zero.';
    if (!data) novos.data = 'Informe uma data válida (dd/mm/aaaa).';
    setErros(novos);
    if (!desc || valor === null || valor <= 0 || !data) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      await saidasApi.criar({ descricao: desc, valor, data });
      Alert.alert('Saída registrada', 'A despesa foi salva com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Registrar saída' }} />
      <TextField label="Descrição da despesa" value={descricao} onChangeText={setDescricao} maxLength={255} error={erros.descricao} />
      <TextField label="Valor (R$)" value={valorTxt} onChangeText={setValorTxt} placeholder="0,00" keyboardType="decimal-pad" error={erros.valor} />
      <TextField label="Data da despesa" value={dataTxt} onChangeText={(t) => setDataTxt(maskDate(t))} placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} error={erros.data} />
      {!!erroEnvio && <ErrorBanner message={erroEnvio} />}
      <AppButton label="Salvar saída" onPress={salvar} loading={enviando} />
    </Screen>
  );
}