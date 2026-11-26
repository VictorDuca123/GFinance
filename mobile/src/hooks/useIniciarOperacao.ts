import { Href, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useIdentificacao } from '../components/IdentificacaoProvider';

interface Destino {
  pathname: string;
  params?: Record<string, string>;
}

export function useIniciarOperacao() {
  const router = useRouter();
  const { identificar } = useIdentificacao();

  return useCallback(
    async (acao: string, destino: Destino) => {
      const responsavel = await identificar(acao);
      if (!responsavel) return; // cancelou: o formulário NÃO abre (B4.6)
      router.push({
        pathname: destino.pathname,
        params: { ...destino.params, responsavelId: String(responsavel.id) },
      } as Href);
    },
    [identificar, router],
  );
}