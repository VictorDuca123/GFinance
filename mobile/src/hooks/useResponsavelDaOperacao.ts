import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useIdentificacao } from '../components/IdentificacaoProvider';
import { ID } from '../types';

function lerId(texto?: string): ID | null {
  const n = Number(texto);
  return texto && Number.isInteger(n) && n > 0 ? n : null;
}

export function useResponsavelDaOperacao(acao: string) {
  const { responsavelId } = useLocalSearchParams<{ responsavelId?: string }>();
  const { identificar } = useIdentificacao();
  // Vive só nesta tela: ao fechá-la, o responsável é descartado (RF09).
  const [id, setId] = useState<ID | null>(lerId(responsavelId));

  /**
   * Entrega o id UMA vez e já o descarta. Se não houver (nova tentativa após falha),
   * pede a identificação de novo. Devolve null se a pessoa cancelar.
   */
  const consumir = useCallback(async (): Promise<ID | null> => {
    let atual = id;
    if (atual === null) {
      const escolhido = await identificar(acao);
      atual = escolhido ? escolhido.id : null;
    }
    setId(null);
    return atual;
  }, [id, identificar, acao]);

  return { consumir };
}