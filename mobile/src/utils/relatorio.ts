import { ID, Recebimento, Saida } from '../types';

/* Cálculos do dashboard de relatórios. Funções puras: recebem listas e devolvem dados prontos para desenhar. */

export type AtalhoPeriodo = 'este_mes' | 'mes_passado' | 'ultimos_30';

export interface PeriodoFechado { dataInicio: string; dataFim: string }

const pad = (n: number) => String(n).padStart(2, '0');
const paraISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const arred = (n: number) => Math.round(n * 100) / 100;

// Usa a data local do tablet (new Date(ano, mes, dia)), nunca UTC, para não "voltar" um dia no Brasil.
export function periodoDoAtalho(atalho: AtalhoPeriodo, hoje = new Date()): PeriodoFechado {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  if (atalho === 'este_mes') {
    return { dataInicio: paraISO(new Date(ano, mes, 1)), dataFim: paraISO(hoje) };
  }
  if (atalho === 'mes_passado') {
    // Dia 0 do mês atual = último dia do mês anterior.
    return { dataInicio: paraISO(new Date(ano, mes - 1, 1)), dataFim: paraISO(new Date(ano, mes, 0)) };
  }
  return { dataInicio: paraISO(new Date(ano, mes, hoje.getDate() - 29)), dataFim: paraISO(hoje) };
}

function diasEntre(inicio: string, fim: string): number {
  const [a1, m1, d1] = inicio.split('-').map(Number);
  const [a2, m2, d2] = fim.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000) + 1;
}

export interface GrupoEvolucao { chave: string; rotulo: string; entradas: number; saidas: number }
export type Granularidade = 'dia' | 'mes';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Agrupa por dia (até 31 dias) ou por mês. Só aparecem dias/meses que tiveram algum lançamento. */
export function agruparEvolucao(
  periodo: PeriodoFechado,
  recebimentos: Recebimento[],
  saidas: Saida[],
): { granularidade: Granularidade; grupos: GrupoEvolucao[] } {
  const granularidade: Granularidade = diasEntre(periodo.dataInicio, periodo.dataFim) <= 31 ? 'dia' : 'mes';
  const chaveDe = (data: string) => (granularidade === 'dia' ? data.slice(0, 10) : data.slice(0, 7));
  const rotuloDe = (chave: string) => {
    const [ano, mes, dia] = chave.split('-');
    return granularidade === 'dia' ? `${dia}/${mes}` : `${MESES[Number(mes) - 1]}/${ano}`;
  };

  const mapa = new Map<string, GrupoEvolucao>();
  const grupo = (data: string) => {
    const chave = chaveDe(data);
    let g = mapa.get(chave);
    if (!g) {
      g = { chave, rotulo: rotuloDe(chave), entradas: 0, saidas: 0 };
      mapa.set(chave, g);
    }
    return g;
  };
  recebimentos.forEach((r) => { grupo(r.data).entradas += r.valor; });
  saidas.forEach((s) => { grupo(s.data).saidas += s.valor; });

  const grupos = [...mapa.values()]
    .map((g) => ({ ...g, entradas: arred(g.entradas), saidas: arred(g.saidas) }))
    .sort((a, b) => a.chave.localeCompare(b.chave));
  return { granularidade, grupos };
}

export interface ItemRanking { id: ID; rotulo: string; detalhe?: string; valor: number }

/** Clientes que mais pagaram no período (soma dos recebimentos de cada um). */
export function rankingClientes(recebimentos: Recebimento[], limite = 5): ItemRanking[] {
  const mapa = new Map<ID, ItemRanking>();
  recebimentos.forEach((r) => {
    const item = mapa.get(r.clienteId) ?? { id: r.clienteId, rotulo: r.clienteNome, valor: 0 };
    item.valor += r.valor;
    mapa.set(r.clienteId, item);
  });
  return [...mapa.values()]
    .map((i) => ({ ...i, valor: arred(i.valor) }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite);
}

/** Maiores saídas individuais do período. */
export function rankingSaidas(saidas: Saida[], limite = 5): ItemRanking[] {
  return [...saidas]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite)
    .map((s) => ({ id: s.id, rotulo: s.descricao, detalhe: s.data, valor: s.valor }));
}
