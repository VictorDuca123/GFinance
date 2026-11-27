export const APP_NAME = 'GFianance';

// Lida do arquivo .env (que NÃO vai para o GitHub). Só a URL, nunca segredos.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export type Modulo =
  | 'responsaveis' | 'clientes' | 'fornecedores'
  | 'recebimentos' | 'saidas' | 'relatorios' | 'historico';

/** true = o módulo usa a API real; false = usa os dados fictícios. Liga-se um módulo por vez. */
export const MODULOS_REAIS: Record<Modulo, boolean> = {
  responsaveis: false,
  clientes: false,
  fornecedores: false,
  recebimentos: false,
  saidas: false,
  relatorios: false,
  historico: false,
};
