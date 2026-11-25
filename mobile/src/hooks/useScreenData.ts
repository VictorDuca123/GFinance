import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useScreenData<T>(carregar: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setLoading(true);
      setError(null);
      carregar()
        .then((r) => ativo && setData(r))
        .catch((e) => ativo && setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados.'))
        .finally(() => ativo && setLoading(false));
      return () => {
        ativo = false; // evita atualizar tela já fechada
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tentativa, ...deps]),
  );

  return { data, loading, error, reload: () => setTentativa((t) => t + 1) };
}