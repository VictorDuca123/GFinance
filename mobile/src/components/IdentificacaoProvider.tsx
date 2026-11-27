import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { colors, fonts, radius, shadow, touch } from '../constants/theme';
import { responsaveisApi } from '../services/api';
import { Responsavel } from '../types';
import { Button } from './Button';
import { ErrorBanner } from './ErrorBanner';
import { IconAlert, IconCheck, IconUsers } from './icons';
import { NumberCircle } from './NumberCircle';

const TEXTO_PERGUNTA = 'Quem vai fazer essa alteração?'; // texto fixo definido no RF07
const QTD_ESPERADA = 3;

interface IdentificacaoContextValue {
  /** Abre a janela. Devolve o responsável escolhido, ou null se a pessoa cancelar. */
  identificar: (acao: string) => Promise<Responsavel | null>;
}

const IdentificacaoContext = createContext<IdentificacaoContextValue | null>(null);

export function useIdentificacao(): IdentificacaoContextValue {
  const ctx = useContext(IdentificacaoContext);
  if (!ctx) throw new Error('useIdentificacao deve ser usado dentro de IdentificacaoProvider.');
  return ctx;
}

export function IdentificacaoProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [acao, setAcao] = useState('');
  // Guarda a função que "preenche o vale" (Promise) de quem pediu a identificação.
  const resolverRef = useRef<((r: Responsavel | null) => void) | null>(null);

  const encerrar = useCallback((escolhido: Responsavel | null) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setAberto(false);
    resolver?.(escolhido);
  }, []);

  const identificar = useCallback((acaoSolicitada: string) => {
    resolverRef.current?.(null); // segurança: se já havia uma janela aberta, cancela a anterior
    return new Promise<Responsavel | null>((resolve) => {
      resolverRef.current = resolve;
      setAcao(acaoSolicitada);
      setAberto(true);
    });
  }, []);

  const valor = useMemo(() => ({ identificar }), [identificar]);

  return (
    <IdentificacaoContext.Provider value={valor}>
      {children}
      <JanelaIdentificacao visivel={aberto} acao={acao} onEscolher={encerrar} onCancelar={() => encerrar(null)} />
    </IdentificacaoContext.Provider>
  );
}

interface JanelaProps {
  visivel: boolean;
  acao: string;
  onEscolher: (r: Responsavel) => void;
  onCancelar: () => void;
}

function JanelaIdentificacao({ visivel, acao, onEscolher, onCancelar }: JanelaProps) {
  const { height, width } = useWindowDimensions();
  const estreita = width < 520; // tela dividida: menos recuo para sobrar espaço aos nomes
  const [lista, setLista] = useState<Responsavel[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  // A cada abertura busca a lista de novo, para refletir responsáveis ativados ou desativados.
  useEffect(() => {
    if (!visivel) return;
    let ativo = true;
    setCarregando(true);
    setErro(null);
    setLista(null);
    responsaveisApi
      .listar()
      .then((r) => ativo && setLista(r))
      .catch(() => ativo && setErro('Não foi possível carregar os responsáveis. Verifique a conexão e tente novamente.'))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [visivel, tentativa]);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar} statusBarTranslucent>
      <View style={styles.fundo}>
        <View style={[styles.janela, { maxHeight: height - 48 }]} accessibilityViewIsModal>
          <View style={styles.faixa} />
          <ScrollView contentContainerStyle={[styles.corpo, estreita && styles.corpoEstreito]} bounces={false}>
            <View style={styles.circuloIcone}>
              <IconUsers size={34} color={colors.action} strokeWidth={2.2} />
            </View>
            <Text style={styles.titulo} accessibilityRole="header">{TEXTO_PERGUNTA}</Text>
            <Text style={styles.subtitulo}>Toque no seu nome para continuar.</Text>
            {!!acao && <Text style={styles.acao}>Alteração: {acao}</Text>}

            {carregando && (
              <View style={styles.centro} accessibilityLiveRegion="polite">
                <ActivityIndicator size="large" color={colors.action} />
                <Text style={styles.subtitulo}>Carregando responsáveis...</Text>
              </View>
            )}

            {!!erro && (
              <View style={styles.bloco}>
                <ErrorBanner message={erro} />
                <Text style={styles.acao}>Sem identificação não é possível salvar alterações.</Text>
                <Button label="Tentar novamente" onPress={() => setTentativa((t) => t + 1)} />
              </View>
            )}

            {lista !== null && lista.length === 0 && (
              <ErrorBanner message="Nenhum responsável ativo cadastrado. Avise a equipe." />
            )}
            {lista !== null && lista.length > 0 && lista.length !== QTD_ESPERADA && (
              <View style={styles.alerta} accessibilityRole="alert">
                <IconAlert size={22} color={colors.ink} />
                <Text style={styles.textoAlerta}>
                  Atenção: eram esperados {QTD_ESPERADA} responsáveis ativos, mas há {lista.length}. Avise a equipe.
                </Text>
              </View>
            )}

            {!!lista?.length && (
              <View style={styles.nomes}>
                {lista.map((r, i) => (
                  <Pressable
                    key={r.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Responsável: ${r.nome}`}
                    onPress={() => onEscolher(r)}
                    style={({ pressed }) => [styles.botaoNome, pressed && styles.botaoNomePressionado]}
                  >
                    <NumberCircle numero={i + 1} />
                    <Text style={styles.textoNome} numberOfLines={2}>{r.nome}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.aviso}>
              <IconCheck size={20} color={colors.action} strokeWidth={2.6} />
              <Text style={styles.textoAviso}>A escolha vale só para esta alteração.</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              onPress={onCancelar}
              style={({ pressed }) => [styles.cancelar, pressed && styles.cancelarPressionado]}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  janela: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.surface,
    borderRadius: radius.sheet,
    overflow: 'hidden',
    ...shadow.card,
  },
  faixa: { height: 10, backgroundColor: colors.action },
  corpo: { paddingHorizontal: 40, paddingTop: 32, paddingBottom: 24, gap: 16, alignItems: 'stretch' },
  corpoEstreito: { paddingHorizontal: 20 },
  circuloIcone: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.tint,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  titulo: { fontFamily: fonts.heavy, fontSize: 29, lineHeight: 36, color: colors.ink, textAlign: 'center' },
  subtitulo: { fontFamily: fonts.semibold, fontSize: 19, color: colors.muted, textAlign: 'center', marginTop: -8 },
  acao: { fontFamily: fonts.semibold, fontSize: 16, color: colors.muted, textAlign: 'center' },
  centro: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  bloco: { gap: 12 },
  nomes: { gap: 12, marginTop: 8 },
  botaoNome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingLeft: 14,
    paddingRight: 24,
  },
  botaoNomePressionado: { borderColor: colors.action, backgroundColor: colors.tint },
  textoNome: { flex: 1, fontFamily: fonts.bold, fontSize: 21, color: colors.ink },
  alerta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.warnBg, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16,
  },
  textoAlerta: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  aviso: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: colors.tint, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16,
  },
  textoAviso: { fontFamily: fonts.semibold, fontSize: 16, color: colors.action },
  cancelar: { minHeight: touch, alignItems: 'center', justifyContent: 'center', borderRadius: touch / 2 },
  cancelarPressionado: { backgroundColor: colors.bg },
  textoCancelar: { fontFamily: fonts.semibold, fontSize: 19, color: colors.muted },
});