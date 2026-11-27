import { API_URL } from '../constants/config';

export type TipoErro = 'conexao' | 'validacao' | 'nao_encontrado' | 'servidor' | 'desconhecido';

export class ApiError extends Error {
  constructor(message: string, readonly tipo: TipoErro, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type Metodo = 'GET' | 'POST' | 'PUT';
type Params = Record<string, string | number | boolean | null | undefined>;

const TEMPO_LIMITE_MS = 15000;

function montarUrl(caminho: string, params?: Params): string {
  const qs = Object.entries(params ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${API_URL}${caminho}${qs ? `?${qs}` : ''}`;
}

// Único ponto que conhece o formato de erro da API. Ajuste aqui se a Pessoa A usar outro.
function extrairMensagem(corpo: unknown): string | null {
  if (!corpo || typeof corpo !== 'object') return null;
  const c = corpo as Record<string, unknown>;
  if (typeof c.message === 'string' && c.message.trim()) return c.message;
  if (Array.isArray(c.errors)) {
    const textos = c.errors
      .map((e) => (typeof e === 'string' ? e : (e as { message?: string })?.message))
      .filter(Boolean);
    if (textos.length) return textos.join(' ');
  }
  return null;
}

async function requisitar<T>(metodo: Metodo, caminho: string, params?: Params, body?: unknown): Promise<T> {
  if (!API_URL) throw new ApiError('O endereço da API não está configurado.', 'desconhecido');

  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);
  let resposta: Response;
  let texto: string;
  try {
    resposta = await fetch(montarUrl(caminho, params), {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controlador.signal,
    });
    texto = await resposta.text();
  } catch {
    // Sem nova tentativa automática: repetir um POST/PUT poderia duplicar o lançamento (RF14).
    throw new ApiError(
      metodo === 'GET'
        ? 'Sem conexão com o servidor. Verifique a internet e tente novamente.'
        : 'Não foi possível confirmar o envio. Confira na lista se o registro foi salvo antes de tentar de novo.',
      'conexao',
    );
  } finally {
    clearTimeout(timer);
  }

  let corpo: unknown = null;
  if (texto) {
    try {
      corpo = JSON.parse(texto);
    } catch {
      corpo = null;
    }
  }

  if (resposta.ok) return corpo as T;

  const mensagem = extrairMensagem(corpo);
  const { status } = resposta;
  if (status === 404) throw new ApiError(mensagem ?? 'Registro não encontrado.', 'nao_encontrado', status);
  if (status === 400 || status === 409 || status === 422) {
    throw new ApiError(mensagem ?? 'Os dados informados são inválidos.', 'validacao', status);
  }
  // 5xx e demais: mensagem fixa, sem expor detalhe técnico ao usuário.
  throw new ApiError('O servidor não conseguiu concluir a operação. Tente novamente em instantes.', 'servidor', status);
}

export const http = {
  get: <T>(caminho: string, params?: Params) => requisitar<T>('GET', caminho, params),
  post: <T>(caminho: string, body: unknown) => requisitar<T>('POST', caminho, undefined, body),
  put: <T>(caminho: string, body: unknown) => requisitar<T>('PUT', caminho, undefined, body),
};
