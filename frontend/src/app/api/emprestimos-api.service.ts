import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';

export type TipoEmprestimo  = 'mutuo' | 'banco' | 'pessoa';
export type StatusEmprestimo = 'ativo' | 'quitado' | 'cancelado';

export interface Emprestimo {
  id: string;
  tipo: TipoEmprestimo;
  empresa_origem_id: string | null;
  empresa_destino_id: string;
  empresa_origem_nome: string | null;
  empresa_destino_nome: string | null;
  credor_externo: string | null;
  credor_nome: string | null;
  descricao: string | null;
  valor: string;
  saldo_devedor: string;
  progresso: number;
  status: StatusEmprestimo;
  data_contrato: string;
  criado_em: string;
}

export interface CriarEmprestimoDto {
  tipo: TipoEmprestimo;
  descricao?: string | null;
  valor: number;
  empresa_origem_id?: string | null;
  empresa_destino_id: string;
  credor_externo?: string | null;
  data_contrato?: string | null;
}

export interface FiltroEmprestimos {
  tipo?: TipoEmprestimo;
  status?: StatusEmprestimo;
  busca?: string;
}

@Injectable({ providedIn: 'root' })
export class EmprestimosApiService {
  private http = inject(HttpClient);
  private base(empresaId: string) { return `${environment.apiUrl}/empresas/${empresaId}/emprestimos`; }

  listar(empresaId: string, filtro: FiltroEmprestimos = {}): Observable<Emprestimo[]> {
    const params = new URLSearchParams();
    if (filtro.tipo)   params.set('tipo', filtro.tipo);
    if (filtro.status) params.set('status', filtro.status);
    if (filtro.busca)  params.set('busca', filtro.busca);
    const qs = params.toString();
    const url = qs ? `${this.base(empresaId)}?${qs}` : this.base(empresaId);
    return this.http.get<RespostaApi<Emprestimo[]>>(url).pipe(map(r => r.data));
  }

  criar(empresaId: string, dto: CriarEmprestimoDto): Observable<Emprestimo> {
    return this.http
      .post<RespostaApi<Emprestimo>>(this.base(empresaId), { emprestimo: dto })
      .pipe(map(r => r.data));
  }

  atualizar(empresaId: string, id: string, dto: { descricao?: string; status?: StatusEmprestimo }): Observable<Emprestimo> {
    return this.http
      .patch<RespostaApi<Emprestimo>>(`${this.base(empresaId)}/${id}`, { emprestimo: dto })
      .pipe(map(r => r.data));
  }

  registrarPagamento(empresaId: string, id: string, valorPago: number): Observable<Emprestimo> {
    return this.http
      .post<RespostaApi<Emprestimo>>(`${this.base(empresaId)}/${id}/registrar_pagamento`, { valor_pago: valorPago })
      .pipe(map(r => r.data));
  }

  excluir(empresaId: string, id: string): Observable<void> {
    return this.http
      .delete<RespostaApi<unknown>>(`${this.base(empresaId)}/${id}`)
      .pipe(map(() => void 0));
  }
}
