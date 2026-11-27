import {
  AcaoHistorico, Atividade, Cliente, Fornecedor, ID, PessoaDados, Recebimento,
  RecebimentoForm, RelatorioPeriodo, Responsavel, Saida, SaidaForm, TipoRegistro,
} from '../types';

/**
 * ÚNICO lugar que conhece o formato JSON da API. Os nomes abaixo são a PROPOSTA enviada
 * à Pessoa A: ajuste-os conforme o que ela documentar (etapa A6).
 */
type Dinheiro = number | string; // o Spring pode serializar decimais como número ou texto

export interface ResponsavelDTO { id: ID; name: string }
export interface ClienteDTO {
  id: ID; name: string; otherInfo?: string | null;
  totalToReceive: Dinheiro; totalReceived: Dinheiro; pendingAmount: Dinheiro;
}
export interface ListaClientesDTO { items: ClienteDTO[]; totalPending: Dinheiro }
export interface FornecedorDTO { id: ID; name: string; otherInfo?: string | null }
export interface RecebimentoDTO {
  id: ID; clientId: ID; clientName: string; amount: Dinheiro; date: string; additionalInfo?: string | null;
}
export interface SaidaDTO { id: ID; description: string; amount: Dinheiro; date: string }
export interface AtividadeDTO {
  id: ID; responsibleName: string; action: AcaoHistorico; recordType: TipoRegistro; recordId: ID; dateTime: string;
}
export interface RelatorioDTO {
  startDate: string; endDate: string; totalReceipts: Dinheiro; totalOutflows: Dinheiro; result: Dinheiro;
}

const num = (v: Dinheiro) => Number(v);
const opt = (v?: string | null) => v ?? undefined;

export const paraResponsavel = (d: ResponsavelDTO): Responsavel => ({ id: d.id, nome: d.name });

export const paraCliente = (d: ClienteDTO): Cliente => ({
  id: d.id,
  nome: d.name,
  outrasInformacoes: opt(d.otherInfo),
  totalAReceber: num(d.totalToReceive),
  totalRecebido: num(d.totalReceived),
  valorPendente: Math.max(num(d.pendingAmount), 0), // nunca negativo (RF02)
});

export const paraFornecedor = (d: FornecedorDTO): Fornecedor => ({
  id: d.id, nome: d.name, outrasInformacoes: opt(d.otherInfo),
});

export const paraRecebimento = (d: RecebimentoDTO): Recebimento => ({
  id: d.id,
  clienteId: d.clientId,
  clienteNome: d.clientName,
  valor: num(d.amount),
  data: d.date.slice(0, 10),
  informacoesAdicionais: opt(d.additionalInfo),
});

export const paraSaida = (d: SaidaDTO): Saida => ({
  id: d.id, descricao: d.description, valor: num(d.amount), data: d.date.slice(0, 10),
});

export const paraAtividade = (d: AtividadeDTO): Atividade => ({
  id: d.id,
  nomeResponsavel: d.responsibleName,
  acao: d.action,
  tipoRegistro: d.recordType,
  idRegistro: d.recordId,
  dataHora: d.dateTime,
});

export const paraRelatorio = (d: RelatorioDTO): RelatorioPeriodo => ({
  dataInicio: d.startDate,
  dataFim: d.endDate,
  totalRecebimentos: num(d.totalReceipts),
  totalSaidas: num(d.totalOutflows),
  resultado: num(d.result),
});

// Corpos enviados nas gravações. O id do responsável vai junto (RF08).
export const corpoPessoa = (d: PessoaDados, responsavelId: ID) => ({
  name: d.nome,
  otherInfo: d.outrasInformacoes || null,
  responsibleId: responsavelId,
});

export const corpoRecebimento = (f: RecebimentoForm, responsavelId: ID) => ({
  clientId: f.clienteId,
  amount: f.valor,
  date: f.data,
  additionalInfo: f.informacoesAdicionais || null,
  responsibleId: responsavelId,
});

export const corpoSaida = (f: SaidaForm, responsavelId: ID) => ({
  description: f.descricao,
  amount: f.valor,
  date: f.data,
  responsibleId: responsavelId,
});
