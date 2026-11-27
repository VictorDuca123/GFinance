import {
  Atividade, Cliente, FiltroRecebimento, Fornecedor, ID, PessoaDados, Recebimento,
  RecebimentoForm, RelatorioPeriodo, Responsavel, Saida, SaidaForm,
} from '../types';
import {
  AtividadeDTO, ClienteDTO, FornecedorDTO, ListaClientesDTO, RecebimentoDTO, RelatorioDTO,
  ResponsavelDTO, SaidaDTO,
  corpoPessoa, corpoRecebimento, corpoSaida,
  paraAtividade, paraCliente, paraFornecedor, paraRecebimento, paraRelatorio, paraResponsavel, paraSaida,
} from './contrato';
import { http } from './http';

/** Implementação REAL (HTTP). Mesmos nomes, parâmetros e retornos do mockApi.ts. */

export const responsaveisApi = {
  async listar(): Promise<Responsavel[]> {
    const lista = await http.get<ResponsavelDTO[]>('/api/responsibles');
    return lista.map(paraResponsavel);
  },
};

export const clientesApi = {
  async listar({ busca = '', somentePendentes = false }: { busca?: string; somentePendentes?: boolean } = {}) {
    const dto = await http.get<ListaClientesDTO>('/api/clients', {
      search: busca.trim(),
      onlyPending: somentePendentes ? true : undefined,
    });
    return { itens: dto.items.map(paraCliente), totalGeralPendente: Number(dto.totalPending) };
  },
  async obter(id: ID): Promise<Cliente> {
    return paraCliente(await http.get<ClienteDTO>(`/api/clients/${id}`));
  },
  async criar(d: PessoaDados, responsavelId: ID): Promise<Cliente> {
    return paraCliente(await http.post<ClienteDTO>('/api/clients', corpoPessoa(d, responsavelId)));
  },
  async atualizar(id: ID, d: PessoaDados, responsavelId: ID): Promise<Cliente> {
    return paraCliente(await http.put<ClienteDTO>(`/api/clients/${id}`, corpoPessoa(d, responsavelId)));
  },
};

export const fornecedoresApi = {
  async listar(busca = ''): Promise<Fornecedor[]> {
    const lista = await http.get<FornecedorDTO[]>('/api/suppliers', { search: busca.trim() });
    return lista.map(paraFornecedor);
  },
  async obter(id: ID): Promise<Fornecedor> {
    return paraFornecedor(await http.get<FornecedorDTO>(`/api/suppliers/${id}`));
  },
  async criar(d: PessoaDados, responsavelId: ID): Promise<Fornecedor> {
    return paraFornecedor(await http.post<FornecedorDTO>('/api/suppliers', corpoPessoa(d, responsavelId)));
  },
  async atualizar(id: ID, d: PessoaDados, responsavelId: ID): Promise<Fornecedor> {
    return paraFornecedor(await http.put<FornecedorDTO>(`/api/suppliers/${id}`, corpoPessoa(d, responsavelId)));
  },
};

export const recebimentosApi = {
  async listar({ clienteId, dataInicio, dataFim }: FiltroRecebimento = {}): Promise<Recebimento[]> {
    const lista = await http.get<RecebimentoDTO[]>('/api/receipts', {
      clientId: clienteId,
      startDate: dataInicio,
      endDate: dataFim,
    });
    return lista.map(paraRecebimento);
  },
  async criar(f: RecebimentoForm, responsavelId: ID): Promise<Recebimento> {
    return paraRecebimento(await http.post<RecebimentoDTO>('/api/receipts', corpoRecebimento(f, responsavelId)));
  },
};

export const saidasApi = {
  async listar({ dataInicio, dataFim }: { dataInicio?: string | null; dataFim?: string | null } = {}): Promise<Saida[]> {
    const lista = await http.get<SaidaDTO[]>('/api/outflows', { startDate: dataInicio, endDate: dataFim });
    return lista.map(paraSaida);
  },
  async criar(f: SaidaForm, responsavelId: ID): Promise<Saida> {
    return paraSaida(await http.post<SaidaDTO>('/api/outflows', corpoSaida(f, responsavelId)));
  },
};

export const relatoriosApi = {
  async periodo(dataInicio: string, dataFim: string): Promise<RelatorioPeriodo> {
    return paraRelatorio(
      await http.get<RelatorioDTO>('/api/reports/period', { startDate: dataInicio, endDate: dataFim }),
    );
  },
};

export const historicoApi = {
  async listar(): Promise<Atividade[]> {
    const lista = await http.get<AtividadeDTO[]>('/api/activities');
    return lista.map(paraAtividade);
  },
};
