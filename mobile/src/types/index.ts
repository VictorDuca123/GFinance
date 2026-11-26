export type ID = number;

export interface Cliente {
  id: ID;
  nome: string;
  outrasInformacoes?: string;
  totalAReceber: number;
  totalRecebido: number;
  valorPendente: number;
}
export interface Fornecedor { id: ID; nome: string; outrasInformacoes?: string }
export interface Recebimento {
  id: ID;
  clienteId: ID;
  clienteNome: string;
  valor: number;
  data: string; // ISO: aaaa-mm-dd
  informacoesAdicionais?: string;
}
export interface Saida { id: ID; descricao: string; valor: number; data: string }

export type AcaoHistorico = 'INCLUSAO' | 'EDICAO';
export type TipoRegistro = 'CLIENTE' | 'FORNECEDOR' | 'RECEBIMENTO' | 'SAIDA';
export interface Atividade {
  id: ID;
  nomeResponsavel: string;
  acao: AcaoHistorico;
  tipoRegistro: TipoRegistro;
  idRegistro: ID;
  dataHora: string;
}
export interface RelatorioPeriodo {
  dataInicio: string;
  dataFim: string;
  totalRecebimentos: number;
  totalSaidas: number;
  resultado: number;
}

export interface Periodo { dataInicio: string | null; dataFim: string | null }
export interface FiltroRecebimento extends Partial<Periodo> { clienteId?: ID }

export interface PessoaDados { nome: string; outrasInformacoes: string }
export interface RecebimentoForm {
  clienteId: ID;
  valor: number;
  data: string;
  informacoesAdicionais: string;
}
export interface SaidaForm { descricao: string; valor: number; data: string }
export interface Responsavel { id: ID; nome: string }