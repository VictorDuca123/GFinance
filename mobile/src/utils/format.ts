const pad = (n: number) => String(n).padStart(2, '0');

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatCurrency = (valor: number) => brl.format(valor);

// "2026-11-05" -> "05/11/2026". Separa o texto em vez de usar new Date(),
// porque new Date('2026-11-05') vira UTC e pode mostrar o dia anterior no Brasil.
export function formatDate(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function todayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

// Máscara dd/mm/aaaa enquanto a pessoa digita.
export function maskDate(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "05/11/2026" -> "2026-11-05"; devolve null se a data não existir (ex.: 31/02).
export function dateBRToISO(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valida =
    dt.getFullYear() === Number(yyyy) &&
    dt.getMonth() === Number(mm) - 1 &&
    dt.getDate() === Number(dd);
  return valida ? `${yyyy}-${mm}-${dd}` : null;
}

// Aceita "1.234,56", "1234,56" e "12.5". Devolve null se inválido.
export function parseMoney(texto: string): number | null {
  let t = texto.trim().replace(/[^\d.,]/g, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (!/^\d+\.\d{1,2}$/.test(t)) t = t.replace(/\./g, '');
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}