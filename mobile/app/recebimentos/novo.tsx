import { Stack, useLocalSearchParams } from 'expo-router';
import { ComponentRef, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, KeyboardAvoidingView, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { ClientePicker } from '../../src/components/ClientePicker';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { FormField } from '../../src/components/FormField';
import { HeroHeader } from '../../src/components/HeroHeader';
import { BackButton, useVoltar } from '../../src/components/BackButton';
import { IconAlert, IconCheck } from '../../src/components/icons';
import { colors, fonts, radius } from '../../src/constants/theme';
import { useResponsavelDaOperacao } from '../../src/hooks/useResponsavelDaOperacao';
import { clientesApi, recebimentosApi } from '../../src/services/api';
import { Cliente } from '../../src/types';
import { dateBRToISO, formatCurrency, formatDate, maskDate, parseMoney, todayISO } from '../../src/utils/format';

interface Erros { cliente?: string; valor?: string; data?: string }

interface Confirmacao {
  valor: number;
  clienteNome: string;
  responsavelNome: string;
  data: string; // ISO
  /** Pendente atualizado vindo do servidor; null se não foi possível consultar. */
  saldo: number | null;
}

const pad = (n: number) => String(n).padStart(2, '0');
function ontemBR(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1); // data local do tablet
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
const arred = (n: number) => Math.round(n * 100) / 100;
const MSG_VALOR = 'Informe o valor recebido.';

export default function NovoRecebimentoScreen() {
  const voltar = useVoltar();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const estreita = width < 600;
  const { consumirResponsavel } = useResponsavelDaOperacao('Registrar entrada');
  const { clienteId } = useLocalSearchParams<{ clienteId?: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [valorTxt, setValorTxt] = useState('');
  const [valorTocado, setValorTocado] = useState(false);
  const [dataTxt, setDataTxt] = useState(formatDate(todayISO()));
  const [info, setInfo] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    if (clienteId) {
      // Se falhar, a pessoa escolhe o cliente manualmente.
      clientesApi.obter(Number(clienteId)).then(setCliente).catch(() => undefined);
    }
  }, [clienteId]);

  const hoje = formatDate(todayISO());
  const ontem = ontemBR();
  const valor = parseMoney(valorTxt);
  const valorValido = valor !== null && valor > 0;
  const pendente = cliente?.valorPendente ?? 0;
  // Saldo exibido só como informação; quem calcula o valor oficial é o servidor.
  const saldoApos = cliente ? Math.max(arred(pendente - (valor ?? 0)), 0) : null;
  // Aviso, sem bloquear: só quando há pendência e o valor passa dela.
  const acimaDoPendente = !!cliente && valorValido && pendente > 0 && valor > pendente;
  const podeSalvar = !!cliente && valorValido;
  // Valor vazio só vira erro depois que a pessoa passou pelo campo (ou tentou salvar).
  const erroValor = erros.valor ?? (valorTocado && !valorValido ? MSG_VALOR : undefined);

  async function salvar() {
    const data = dateBRToISO(dataTxt);
    const novos: Erros = {};
    if (!cliente) novos.cliente = 'Escolha o cliente.';
    if (!valorValido) novos.valor = MSG_VALOR;
    if (!data) novos.data = 'Informe uma data válida (dd/mm/aaaa).';
    setErros(novos);
    if (!cliente || valor === null || valor <= 0 || !data) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      const responsavel = await consumirResponsavel();
      if (!responsavel) throw new Error('Identificação cancelada. Nada foi salvo.');
      const salvo = await recebimentosApi.criar(
        { clienteId: cliente.id, valor, data, informacoesAdicionais: info.trim() },
        responsavel.id,
      );
      // Só depois da confirmação do servidor (RF14). O saldo vem do servidor; se a consulta falhar, não mostramos número.
      const saldo = await clientesApi.obter(cliente.id).then((c) => c.valorPendente).catch(() => null);
      setConfirmacao({
        valor: salvo.valor,
        clienteNome: salvo.clienteNome || cliente.nome,
        responsavelNome: responsavel.nome,
        data: salvo.data,
        saldo,
      });
      rolagem.current?.scrollTo({ y: 0, animated: false }); // a confirmação é curta: volta ao topo para ela aparecer
      AccessibilityInfo.announceForAccessibility('Entrada registrada');
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    // KeyboardAvoidingView: no Android de ponta a ponta o teclado não encolhe a tela sozinho.
    <KeyboardAvoidingView style={styles.tela} behavior="padding">
      <Stack.Screen options={{ headerShown: false, title: 'Registrar entrada' }} />
      <ScrollView ref={rolagem} contentContainerStyle={{ paddingBottom: 32 + insets.bottom }} keyboardShouldPersistTaps="handled">
        <HeroHeader height={170} />
        <View style={[styles.topo, { paddingTop: insets.top + 20, paddingHorizontal: estreita ? 24 : 48 }]}>
          <BackButton />
          <Text style={styles.titulo} accessibilityRole="header">Registrar entrada</Text>
        </View>

        <View style={[styles.cartao, estreita && styles.cartaoEstreito]}>
          {confirmacao ? (
            <TelaConfirmacao c={confirmacao} onConcluir={voltar} />
          ) : (
            <>
              <ClientePicker selecionado={cliente} onSelect={setCliente} erro={erros.cliente} />

              <FormField
                label="Valor recebido"
                prefix="R$"
                value={valorTxt}
                onChangeText={(t) => {
                  setValorTxt(t);
                  if (erros.valor) setErros((e) => ({ ...e, valor: undefined }));
                }}
                onBlur={() => setValorTocado(true)}
                placeholder="0,00"
                keyboardType="decimal-pad"
                // O banco guarda até 10 dígitos antes da vírgula (DECIMAL 12,2), com separadores.
                maxLength={16}
                error={erroValor}
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
                {acimaDoPendente && (
                  <View style={styles.aviso} accessibilityRole="alert" accessibilityLiveRegion="polite">
                    <IconAlert size={22} color={colors.ink} />
                    <Text style={styles.textoAviso}>
                      O valor é maior que o pendente ({formatCurrency(pendente)}). Confira antes de salvar.
                    </Text>
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

              <FormField label="Observação (opcional)" value={info} onChangeText={setInfo} maxLength={255} multiline minHeight={72} />

              {!!erroEnvio && <ErrorBanner message={erroEnvio} />}

              <View style={[styles.rodape, estreita && styles.rodapeEstreito]}>
                <View style={!estreita && styles.cancelar}>
                  <Button label="Cancelar" variant="ghost" onPress={voltar} />
                </View>
                <View style={!estreita && styles.salvar}>
                  <Button
                    label="Salvar entrada"
                    onPress={salvar}
                    loading={enviando}
                    disabled={!podeSalvar}
                    hint={podeSalvar ? undefined : 'Escolha o cliente e informe o valor para salvar.'}
                    elevated
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TelaConfirmacao({ c, onConcluir }: { c: Confirmacao; onConcluir: () => void }) {
  return (
    <View style={styles.confirmacao}>
      <View style={styles.circuloOk}>
        <IconCheck size={56} color={colors.onDark} strokeWidth={3} />
      </View>
      <Text style={styles.tituloOk} accessibilityRole="header">Entrada registrada</Text>
      <Text style={styles.resumoOk}>{formatCurrency(c.valor)} de {c.clienteNome}</Text>
      <Text style={styles.detalheOk}>
        {c.responsavelNome ? `Registrado por ${c.responsavelNome} · ` : ''}{formatDate(c.data)}
      </Text>
      {c.saldo !== null && (
        <View style={[styles.saldo, styles.saldoOk]} accessible accessibilityLabel={`Saldo restante: ${formatCurrency(c.saldo)}`}>
          <Text style={styles.rotuloSaldo}>Saldo restante</Text>
          <Text style={styles.valorSaldo}>{formatCurrency(c.saldo)}</Text>
        </View>
      )}
      <View style={styles.concluir}>
        <Button label="Concluir" onPress={onConcluir} elevated />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', maxWidth: 1280, alignSelf: 'center' },
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
  aviso: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.warnBg, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16,
  },
  textoAviso: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
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

  confirmacao: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  circuloOk: {
    width: 104, height: 104, borderRadius: 52, backgroundColor: colors.action,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  tituloOk: { fontFamily: fonts.heavy, fontSize: 30, color: colors.ink, textAlign: 'center' },
  resumoOk: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink, textAlign: 'center', fontVariant: ['tabular-nums'] },
  detalheOk: { fontFamily: fonts.semibold, fontSize: 17, color: colors.muted, textAlign: 'center' },
  saldoOk: { alignSelf: 'stretch', marginTop: 12 },
  concluir: { alignSelf: 'stretch', marginTop: 12 },
});
