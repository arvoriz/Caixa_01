export function formatarValor(valor: string | number): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formato curto para valores grandes nos rótulos (ex: R$ 38k). */
export function formatarValorCurto(valor: string | number): string {
  const n = Number(valor);
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
  return `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

/** Data 'YYYY-MM-DD' → 'DD/MM/AAAA' (sem timezone shift). */
export function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Cores fixas para o gráfico de categorias (donut + legenda). */
export const CORES_CATEGORIA = ['#ef4444', '#eab308', '#3b82f6', '#8b5cf6', '#f97316'];
