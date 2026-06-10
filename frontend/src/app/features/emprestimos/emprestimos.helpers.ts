import { Emprestimo, TipoEmprestimo, StatusEmprestimo } from '../../api/emprestimos-api.service';

export function formatarValor(valor: string | number): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function labelTipo(tipo: TipoEmprestimo): string {
  return ({ mutuo: 'Mútuo', banco: 'Externo (Banco)', pessoa: 'Externo (Pessoa)' })[tipo] ?? tipo;
}

export function labelStatus(status: StatusEmprestimo): string {
  return ({ ativo: 'Ativo', quitado: 'Quitado', cancelado: 'Cancelado' })[status] ?? status;
}

/** Classes do container do ícone, por tipo (dark/light). */
export function corIconeTipo(tipo: TipoEmprestimo, dark: boolean): string {
  const mapa: Record<TipoEmprestimo, { dark: string; light: string }> = {
    banco:  { dark: 'bg-gray-800 border-gray-700 text-gray-300',          light: 'bg-slate-100 border-slate-200 text-slate-600' },
    pessoa: { dark: 'bg-orange-500/10 border-orange-500/20 text-orange-500', light: 'bg-orange-50 border-orange-200 text-orange-600' },
    mutuo:  { dark: 'bg-purple-500/10 border-purple-500/20 text-purple-500', light: 'bg-purple-50 border-purple-200 text-purple-600' },
  };
  return dark ? mapa[tipo].dark : mapa[tipo].light;
}

/** Nome de quem emprestou (credor). */
export function nomeCredor(e: Emprestimo): string {
  return (e.tipo === 'mutuo' ? e.empresa_origem_nome : e.credor_externo) || '—';
}
