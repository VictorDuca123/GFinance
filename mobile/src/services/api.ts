import {
  Atividade, Cliente, FiltroRecebimento, Fornecedor, ID, PessoaDados,
  Recebimento, RecebimentoForm, RelatorioPeriodo, Responsavel, Saida, SaidaForm, TipoRegistro,
} from '../types';

/* CAMADA DE DADOS FICTÍCIA */
export const MOCK_FORCAR_ERRO = false; 
export const MOCK_FORCAR_ERRO_RESPONSAVEIS = false;

async function simularLatencia(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, LATENCIA_MS));
}

async function simularRede(): Promise<void> {
  await simularLatencia();
  if (MOCK_FORCAR_ERRO) throw new Error('Falha de conexão simulada.');
}

const normalizar = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const arred = (n: number) => Math.round(n * 100) / 100;
const noPeriodo = (data: string, ini?: string | null, fim?: string | null) =>
  (!ini || data >= ini) && (!fim || data <= fim);

interface ClienteRegistro { id: ID; nome: string; outrasInformacoes?: string; totalAReceber: number }
type RecebimentoRegistro = Omit<Recebimento, 'clienteNome'>;

const clientes: ClienteRegistro[] = [
  { id: 1, nome: 'Cliente Exemplo A', outrasInformacoes: 'Dado fictício de teste', totalAReceber: 1500 },
  { id: 2, nome: 'Cliente Exemplo B', totalAReceber: 800 },
  { id: 3, nome: 'Cliente Exemplo C', totalAReceber: 0 },
];
const fornecedores: Fornecedor[] = [
  { id: 1, nome: 'Fornecedor Exemplo X' },
  { id: 2, nome: 'Fornecedor Exemplo Y', outrasInformacoes: 'Dado fictício de teste' },
];
const recebimentos: RecebimentoRegistro[] = [
  { id: 1, clienteId: 1, valor: 500, data: '2026-11-10', informacoesAdicionais: 'Pagamento parcial' },
  { id: 2, clienteId: 2, valor: 800, data: '2026-11-12' },
  { id: 3, clienteId: 1, valor: 250.5, data: '2026-11-18' },
];
const saidas: Saida[] = [
  { id: 1, descricao: 'Material de escritório', valor: 120.5, data: '2026-11-05' },
  { id: 2, descricao: 'Conta de internet', valor: 99.9, data: '2026-11-08' },
];
const atividades: Atividade[] = [
  { id: 1, nomeResponsavel: 'Responsável 1', acao: 'INCLUSAO', tipoRegistro: 'CLIENTE', idRegistro: 1, dataHora: '2026-11-01T09:00:00-03:00' },
  { id: 2, nomeResponsavel: 'Responsável 1', acao: 'INCLUSAO', tipoRegistro: 'RECEBIMENTO', idRegistro: 1, dataHora: '2026-11-10T14:30:00-03:00' },
  { id: 3, nomeResponsavel: 'Responsável 2', acao: 'EDICAO', tipoRegistro: 'CLIENTE', idRegistro: 1, dataHora: '2026-11-11T10:15:00-03:00' },
];
const proximo = { cliente: 4, fornecedor: 3, recebimento: 4, saida: 3, atividade: 4 };

// Responsáveis ATIVOS (fictícios). Na API real vêm de GET /api/responsibles,
// com os nomes reais cadastrados no banco. Nunca coloque nomes reais no código.
const responsaveis: Responsavel[] = [
  { id: 1, nome: 'Responsável 1' },
  { id: 2, nome: 'Responsável 2' },
  { id: 3, nome: 'Responsável 3' },
];

function paraCliente(r: ClienteRegistro): Cliente {
  const totalRecebido = arred(recebimentos.filter((x) => x.clienteId === r.id).reduce((s, x) => s + x.valor, 0));
  return { ...r, totalRecebido, valorPendente: Math.max(arred(r.totalAReceber - totalRecebido), 0) };
}
function paraRecebimento(r: RecebimentoRegistro): Recebimento {
  return { ...r, clienteNome: clientes.find((c) => c.id === r.clienteId)?.nome ?? '—' };
}

// Imita o backend (RF08, RNF04): o id precisa existir e estar ativo; senão rejeita ANTES de gravar.
function exigirResponsavel(id: ID): Responsavel {
  const r = responsaveis.find((x) => x.id === id);
  if (!r) throw new Error('Responsável inexistente ou inativo.');
  return r;
}

function registrar(acao: 'INCLUSAO' | 'EDICAO', tipoRegistro: TipoRegistro, idRegistro: ID, responsavel: Responsavel) {
  atividades.push({
    id: proximo.atividade++, nomeResponsavel: responsavel.nome, acao, tipoRegistro, idRegistro,
    dataHora: new Date().toISOString(),
  });
}

export const responsaveisApi = {
  // Devolve cópias para nenhuma tela conseguir alterar a lista original.
  async listar(): Promise<Responsavel[]> {
    await simularLatencia();
    if (MOCK_FORCAR_ERRO_RESPONSAVEIS) throw new Error('Falha de conexão simulada.');
    return responsaveis.map((r) => ({ ...r }));
  },
};

export const clientesApi = {
  async listar({ busca = '', somentePendentes = false }: { busca?: string; somentePendentes?: boolean } = {}) {
    await simularRede();
    const todos = clientes.map(paraCliente);
    const termo = normalizar(busca);
    const itens = todos
      .filter((c) => (!termo || normalizar(c.nome).includes(termo)) && (!somentePendentes || c.valorPendente > 0))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const totalGeralPendente = arred(todos.reduce((s, c) => s + c.valorPendente, 0));
    return { itens, totalGeralPendente };
  },
  async obter(id: ID): Promise<Cliente> {
    await simularRede();
    const r = clientes.find((c) => c.id === id);
    if (!r) throw new Error('Cliente não encontrado.');
    return paraCliente(r);
  },
  async criar(d: PessoaDados, responsavelId: ID): Promise<Cliente> {
    await simularRede();
    const responsavel = exigirResponsavel(responsavelId);
    // Regra de cobrança ainda "a definir pela equipe": cliente novo começa com 0.
    const r: ClienteRegistro = { id: proximo.cliente++, nome: d.nome, outrasInformacoes: d.outrasInformacoes || undefined, totalAReceber: 0 };
    clientes.push(r);
    registrar('INCLUSAO', 'CLIENTE', r.id, responsavel);
    return paraCliente(r);
  },
  async atualizar(id: ID, d: PessoaDados, responsavelId: ID): Promise<Cliente> {
    await simularRede();
    const responsavel = exigirResponsavel(responsavelId);
    const r = clientes.find((c) => c.id === id);
    if (!r) throw new Error('Cliente não encontrado.');
    r.nome = d.nome;
    r.outrasInformacoes = d.outrasInformacoes || undefined;
    registrar('EDICAO', 'CLIENTE', id, responsavel);
    return paraCliente(r);
  },
};

export const fornecedoresApi = {
  async listar(busca = ''): Promise<Fornecedor[]> {
    await simularRede();
    const termo = normalizar(busca);
    return fornecedores
      .filter((f) => !termo || normalizar(f.nome).includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  },
  async obter(id: ID): Promise<Fornecedor> {
    await simularRede();
    const f = fornecedores.find((x) => x.id === id);
    if (!f) throw new Error('Fornecedor não encontrado.');
    return f;
  },
  async criar(d: PessoaDados, responsavelId: ID): Promise<Fornecedor> {
    await simularRede();
    const responsavel = exigirResponsavel(responsavelId);
    const f: Fornecedor = { id: proximo.fornecedor++, nome: d.nome, outrasInformacoes: d.outrasInformacoes || undefined };
    fornecedores.push(f);
    registrar('INCLUSAO', 'FORNECEDOR', f.id, responsavel);
    return f;
  },
  async atualizar(id: ID, d: PessoaDados, responsavelId: ID): Promise<Fornecedor> {
    await simularRede();
    const responsavel = exigirResponsavel(responsavelId);
    const f = fornecedores.find((x) => x.id === id);
    if (!f) throw new Error('Fornecedor não encontrado.');
    f.nome = d.nome;
    f.outrasInformacoes = d.outrasInformacoes || undefined;
    registrar('EDICAO', 'FORNECEDOR', id, responsavel);
    return f;
  },
};

export const recebimentosApi = {
  async listar({ clienteId, dataInicio, dataFim }: FiltroRecebimento = {}): Promise<Recebimento[]> {
    await simularRede();
    return recebimentos
      .filter((r) => (!clienteId || r.clienteId === clienteId) && noPeriodo(r.data, dataInicio, dataFim))
      .sort((a, b) => (a.data === b.data ? b.id - a.id : b.data.localeCompare(a.data)))
      .map(paraRecebimento);
  },
  async criar(f: RecebimentoForm, responsavelId: ID): Promise<Recebimento> {
    await simularRede();
    const responsavel = exigirResponsavel(responsavelId);
    if (!clientes.some((c) => c.id === f.clienteId)) throw new Error('Cliente não encontrado.');
    if (f.valor <= 0) throw new Error('O valor deve ser maior que zero.');
    const r: RecebimentoRegistro = {
      id: proximo.recebimento++, clienteId: f.clienteId, valor: f.valor, data: f.data,
      informacoesAdicionais: f.informacoesAdicionais || undefined,
    };
    recebimentos.push(r);
    registrar('INCLUSAO', 'RECEBIMENTO', r.id, responsavel);
    return paraRecebimento(r);
  },
};

export const saidasApi = {
  async listar({ dataInicio, dataFim }: { dataInicio?: string | null; dataFim?: string | null } = {}): Promise<Saida[]> {
    await simularRede();
    return saidas
      .filter((s) => noPeriodo(s.data, dataInicio, dataFim))
      .sort((a, b) => (a.data === b.data ? b.id - a.id : b.data.localeCompare(a.data)));
  },
  async criar(f: SaidaForm, responsavelId: ID): Promise<Saida> {
    await simularRede();
    const responsavel = exigirResponsavel(responsavelId);
    if (f.valor <= 0) throw new Error('O valor deve ser maior que zero.');
    const s: Saida = { id: proximo.saida++, descricao: f.descricao, valor: f.valor, data: f.data };
    saidas.push(s);
    registrar('INCLUSAO', 'SAIDA', s.id, responsavel);
    return s;
  },
};

export const relatoriosApi = {
  async periodo(dataInicio: string, dataFim: string): Promise<RelatorioPeriodo> {
    await simularRede();
    if (dataFim < dataInicio) throw new Error('A data final não pode ser anterior à data inicial.');
    const totalRecebimentos = arred(recebimentos.filter((r) => noPeriodo(r.data, dataInicio, dataFim)).reduce((s, r) => s + r.valor, 0));
    const totalSaidas = arred(saidas.filter((s) => noPeriodo(s.data, dataInicio, dataFim)).reduce((t, s) => t + s.valor, 0));
    return { dataInicio, dataFim, totalRecebimentos, totalSaidas, resultado: arred(totalRecebimentos - totalSaidas) };
  },
};

export const historicoApi = {
  async listar(): Promise<Atividade[]> {
    await simularRede();
    return [...atividades].sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  },
};