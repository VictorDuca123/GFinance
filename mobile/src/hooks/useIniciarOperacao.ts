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
      if (!responsavel) return; // cancelou: o formulário NÃO abre
      // O nome vai junto só para a tela de confirmação mostrar quem registrou.
      // Vale apenas para esta operação e é descartado com ela (RF09).
      router.push({
        pathname: destino.pathname,
        params: { ...destino.params, responsavelId: String(responsavel.id), responsavelNome: responsavel.nome },
      } as Href);
    },
    [identificar, router],
  );
}
