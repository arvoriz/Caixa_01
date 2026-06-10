export function formatarValor(valor: string | number): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export type ChaveRelatorio = 'fluxo' | 'contas' | 'intercompany' | 'externos';

export function tituloRelatorio(chave: ChaveRelatorio): string {
  return ({
    fluxo:        'Fluxo de Caixa',
    contas:       'Contas a Pagar e a Receber',
    intercompany: 'Saldos Intercompany',
    externos:     'Empréstimos Externos',
  })[chave];
}
