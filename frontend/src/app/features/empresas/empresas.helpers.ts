import { PapelEmpresa } from '../../api/empresas-api.service';

export function iniciais(nome: string): string {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

export function formatarSaldo(saldo: string | null): string {
  if (!saldo) return 'R$ 0,00';
  return Number(saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function labelPapel(papel: string): string {
  return ({ dono: 'Dono', socio: 'Sócio', contador: 'Contador' })[papel] ?? papel;
}

export function corIniciais(papel: string): string {
  return ({
    dono:     'bg-blue-500/10 text-blue-500 border-blue-500/20',
    socio:    'bg-purple-500/10 text-purple-500 border-purple-500/20',
    contador: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  })[papel] ?? '';
}

export function corPapel(papel: string): string {
  return ({ dono: 'text-green-500', socio: 'text-blue-500', contador: 'text-orange-500' })[papel] ?? '';
}

export function corPapelBg(papel: string): string {
  return ({ dono: 'bg-green-500/10', socio: 'bg-blue-500/10', contador: 'bg-orange-500/10' })[papel] ?? '';
}

export function corPonto(papel: string): string {
  return ({ dono: 'bg-green-500', socio: 'bg-blue-500', contador: 'bg-orange-500' })[papel] ?? '';
}

export function badgePapel(papel: string): string {
  return ({
    dono:     'bg-green-500/10 text-green-500 border-green-500/20',
    socio:    'bg-blue-500/10 text-blue-500 border-blue-500/20',
    contador: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  })[papel] ?? '';
}

export function avatarPapel(papel: string): string {
  return ({
    dono:     'bg-gradient-to-tr from-green-500 to-green-700',
    socio:    'bg-gradient-to-tr from-blue-500 to-blue-700',
    contador: 'bg-gradient-to-tr from-orange-500 to-orange-700',
  })[papel] ?? '';
}

export function podeRemoverAcesso(meuPapel: PapelEmpresa, acessoPapel: PapelEmpresa): boolean {
  if (acessoPapel === 'dono') return false;
  if (meuPapel === 'dono') return true;
  if (meuPapel === 'socio') return acessoPapel === 'contador';
  return false;
}
