import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, layout, spacing } from '../constants/theme';
import { responsaveisApi } from '../services/api';
import { Responsavel } from '../types';
import { AppButton } from './AppButton';
import { ErrorBanner } from './ErrorBanner';
import { Body, Muted, Subtitle } from './Typography';

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
        <View style={styles.janela}>
          <Subtitle accessibilityRole="header">{TEXTO_PERGUNTA}</Subtitle>
          {!!acao && <Muted>{acao}</Muted>}

          {carregando && (
            <View style={styles.centro}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Body>Carregando responsáveis...</Body>
            </View>
          )}

          {!!erro && (
            <>
              <ErrorBanner message={erro} />
              <Muted>Sem identificação não é possível salvar alterações.</Muted>
              <AppButton label="Tentar novamente" onPress={() => setTentativa((t) => t + 1)} />
            </>
          )}

          {lista !== null && lista.length === 0 && (
            <ErrorBanner message="Nenhum responsável ativo cadastrado. Avise a equipe." />
          )}
          {lista !== null && lista.length > 0 && lista.length !== QTD_ESPERADA && (
            <Muted>
              Atenção: eram esperados {QTD_ESPERADA} responsáveis ativos, mas há {lista.length}. Avise a equipe.
            </Muted>
          )}

          {lista?.map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityLabel={`Responsável: ${r.nome}`}
              onPress={() => onEscolher(r)}
              style={({ pressed }) => [styles.botaoNome, pressed && styles.pressionado]}
            >
              <Text style={styles.textoNome}>{r.nome}</Text>
            </Pressable>
          ))}

          <AppButton label="Cancelar" variant="secondary" onPress={onCancelar} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  janela: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    padding: spacing.lg,
    gap: spacing.md,
  },
  centro: { alignItems: 'center', gap: spacing.md, padding: spacing.md },
  botaoNome: {
    minHeight: 72,
    borderRadius: layout.radius,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressionado: { opacity: 0.85 },
  textoNome: { color: colors.onPrimary, fontSize: fontSize.subtitle, fontWeight: '700' },
});