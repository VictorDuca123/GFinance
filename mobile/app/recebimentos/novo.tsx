import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { ClientePicker } from '../../src/components/ClientePicker';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { FormField } from '../../src/components/FormField';
import { HeroHeader } from '../../src/components/HeroHeader';
import { IconChevronLeft } from '../../src/components/icons';
import { colors, fonts, radius, touch } from '../../src/constants/theme';
import { useResponsavelDaOperacao } from '../../src/hooks/useResponsavelDaOperacao';
import { clientesApi, recebimentosApi } from '../../src/services/api';
import { Cliente } from '../../src/types';
import { dateBRToISO, formatCurrency, formatDate, maskDate, parseMoney, todayISO } from '../../src/utils/format';

interface Erros { cliente?: string; valor?: string; data?: string }

const pad = (n: number) => String(n).padStart(2, '0');
function ontemBR(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1); // data local do tablet
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
const arred = (n: number) => Math.round(n * 100) / 100;

export default function NovoRecebimentoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const estreita = width < 600;
  const { consumir } = useResponsavelDaOperacao('Registrar entrada');
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

  const hoje = formatDate(todayISO());
  const ontem = ontemBR();
  const valor = parseMoney(valorTxt);
  const pendente = cliente?.valorPendente ?? 0;
  // Saldo exibido só como informação; quem calcula o valor oficial é o servidor.
  const saldoApos = cliente ? Math.max(arred(pendente - (valor ?? 0)), 0) : null;

  async function salvar() {
    const data = dateBRToISO(dataTxt);
    const novos: Erros = {};
    if (!cliente) novos.cliente = 'Escolha o cliente.';
    if (valor === null || valor <= 0) novos.valor = 'Informe o valor recebido.';
    if (!data) novos.data = 'Informe uma data válida (dd/mm/aaaa).';
    setErros(novos);
    if (!cliente || valor === null || valor <= 0 || !data) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      const responsavelId = await consumir();
      if (responsavelId === null) throw new Error('Identificação cancelada. Nada foi salvo.');
      await recebimentosApi.criar({ clienteId: cliente.id, valor, data, informacoesAdicionais: info.trim() }, responsavelId);
      Alert.alert('Entrada registrada', 'A entrada foi salva com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ headerShown: false, title: 'Registrar entrada' }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        <HeroHeader height={170} />
        <View style={[styles.topo, { paddingTop: insets.top + 20, paddingHorizontal: estreita ? 24 : 48 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.voltar, pressed && styles.pressionado]}
          >
            <IconChevronLeft size={28} color={colors.onDark} strokeWidth={2.8} />
          </Pressable>
          <Text style={styles.titulo} accessibilityRole="header">Registrar entrada</Text>
        </View>

        <View style={[styles.cartao, estreita && styles.cartaoEstreito]}>
          <ClientePicker selecionado={cliente} onSelect={setCliente} erro={erros.cliente} />

          <FormField
            label="Valor recebido"
            prefix="R$"
            value={valorTxt}
            onChangeText={setValorTxt}
            placeholder="0,00"
            keyboardType="decimal-pad"
            error={erros.valor}
          >
            {cliente && pendente > 0 && (
              <View style={styles.linhaAtalho}>
                <Button
                  label={`Valor total: ${formatCurrency(pendente)}`}
                  variant="outline"
                  compact
                  onPress={() => setValorTxt(pendente.toFixed(2).replace('.', ','))}
                />
              </View>
            )}
          </FormField>

          <FormField
            label="Data"
            value={dataTxt}
            onChangeText={(t) => setDataTxt(maskDate(t))}
            placeholder="dd/mm/aaaa"
            keyboardType="numeric"
            maxLength={10}
            error={erros.data}
          >
            <View style={styles.linhaAtalho}>
              <Button label="Hoje" variant={dataTxt === hoje ? 'primary' : 'outline'} compact selected={dataTxt === hoje} onPress={() => setDataTxt(hoje)} />
              <Button label="Ontem" variant={dataTxt === ontem ? 'primary' : 'outline'} compact selected={dataTxt === ontem} onPress={() => setDataTxt(ontem)} />
            </View>
          </FormField>

          {saldoApos !== null && (
            <View style={styles.saldo} accessible accessibilityLabel={`Saldo após este recebimento: ${formatCurrency(saldoApos)}`}>
              <Text style={styles.rotuloSaldo}>Saldo após este recebimento</Text>
              <Text style={styles.valorSaldo}>{formatCurrency(saldoApos)}</Text>
            </View>
          )}

          <FormField
            label="Observação (opcional)"
            value={info}
            onChangeText={setInfo}
            maxLength={255}
            multiline
            minHeight={72}
          />

          {!!erroEnvio && <ErrorBanner message={erroEnvio} />}

          <View style={[styles.rodape, estreita && styles.rodapeEstreito]}>
            <View style={!estreita && styles.cancelar}>
              <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />
            </View>
            <View style={!estreita && styles.salvar}>
              <Button label="Salvar entrada" onPress={salvar} loading={enviando} elevated />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  pressionado: { opacity: 0.85 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', maxWidth: 1280, alignSelf: 'center' },
  voltar: {
    width: touch, height: touch, borderRadius: touch / 2,
    backgroundColor: colors.glassButton, borderWidth: 1, borderColor: colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { flex: 1, fontFamily: fonts.heavy, fontSize: 32, color: colors.onDark },

  // O cartão sobe sobre a faixa em degradê (sobreposição a partir de ~104 dp do topo).
  cartao: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    marginTop: 28,
    paddingVertical: 28,
    paddingHorizontal: 44,
    gap: 22,
    borderRadius: radius.sheet,
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  cartaoEstreito: { width: undefined, marginHorizontal: 16, alignSelf: 'stretch', paddingHorizontal: 22, borderRadius: 32 },
  linhaAtalho: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  saldo: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    backgroundColor: colors.tint, borderRadius: 24, paddingVertical: 16, paddingHorizontal: 22,
  },
  rotuloSaldo: { fontFamily: fonts.semibold, fontSize: 17, color: colors.action },
  valorSaldo: { fontFamily: fonts.heavy, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] },
  rodape: { flexDirection: 'row', gap: 16, marginTop: 4 },
  rodapeEstreito: { flexDirection: 'column-reverse' },
  cancelar: { flex: 1 },
  salvar: { flex: 2 },
});
