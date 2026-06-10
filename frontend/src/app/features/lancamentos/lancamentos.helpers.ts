import { Lancamento, StatusLancamento } from '../../api/lancamentos-api.service';

export function formatarValor(valor: string | number): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(iso: string | null): string {
  if (!iso) return '—';
  // iso vem como 'YYYY-MM-DD'; evita timezone shift montando a data local
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function labelStatus(status: string): string {
  return ({ pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado', cancelado: 'Cancelado' })[status] ?? status;
}

export function corStatus(status: StatusLancamento): string {
  return ({
    pago:      'bg-green-500/10 text-green-500 border border-green-500/20',
    pendente:  'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    atrasado:  'bg-red-500/10 text-red-500 border border-red-500/20',
    cancelado: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
  })[status] ?? '';
}

export function corPontoStatus(status: StatusLancamento): string {
  return ({
    pago:      'bg-green-500',
    pendente:  'bg-yellow-500',
    atrasado:  'bg-red-500',
    cancelado: 'bg-gray-500',
  })[status] ?? '';
}

/** Retorna "X/Y" se o lançamento fizer parte de um grupo parcelado, ou null caso contrário. */
export function infoParcela(item: Lancamento, todos: Lancamento[]): string | null {
  if (!item.grupo_parcelamento_id) return null;
  const grupo = todos
    .filter(l => l.grupo_parcelamento_id === item.grupo_parcelamento_id)
    .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));
  const indice = grupo.findIndex(l => l.id === item.id);
  if (indice === -1) return null;
  return `${indice + 1}/${grupo.length}`;
}
