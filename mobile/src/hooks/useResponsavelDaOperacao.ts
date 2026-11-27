import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useIdentificacao } from '../components/IdentificacaoProvider';
import { ID, Responsavel } from '../types';

function lerId(texto?: string): ID | null {
  const n = Number(texto);
  return texto && Number.isInteger(n) && n > 0 ? n : null;
}

export function useResponsavelDaOperacao(acao: string) {
  const { responsavelId, responsavelNome } = useLocalSearchParams<{ responsavelId?: string; responsavelNome?: string }>();
  const { identificar } = useIdentificacao();
  // Vive só nesta tela: ao fechá-la, o responsável é descartado (RF09).
  const [atual, setAtual] = useState<Responsavel | null>(() => {
    const id = lerId(responsavelId);
    return id === null ? null : { id, nome: responsavelNome ?? '' };
  });

  /**
   * Entrega o responsável UMA vez e já o descarta. Se não houver (nova tentativa após falha),
   * pede a identificação de novo. Devolve null se a pessoa cancelar.
   */
  const consumirResponsavel = useCallback(async (): Promise<Responsavel | null> => {
    let escolhido = atual;
    if (escolhido === null) escolhido = await identificar(acao);
    setAtual(null);
    return escolhido;
  }, [atual, identificar, acao]);

  /** Mesmo que consumirResponsavel, mas devolve só o id (usado pela maioria dos formulários). */
  const consumir = useCallback(async (): Promise<ID | null> => {
    const r = await consumirResponsavel();
    return r ? r.id : null;
  }, [consumirResponsavel]);

  return { consumir, consumirResponsavel };
}
