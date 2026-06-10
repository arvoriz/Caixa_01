import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';
import { TipoTransacao } from './categorias-api.service';

export type StatusLancamento = 'pendente' | 'pago' | 'atrasado' | 'cancelado';

export interface Lancamento {
  id: string;
  empresa_id: string;
  categoria_id: string;
  categoria_nome: string | null;
  descricao: string;
  tipo: TipoTransacao;
  valor: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusLancamento;
  grupo_parcelamento_id: string | null;
  criado_em: string;
}

export interface CriarLancamentoDto {
  categoria_id: string;
  descricao: string;
  tipo: TipoTransacao;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status?: StatusLancamento;
}

export interface FiltroLancamentos {
  tipo?: TipoTransacao;
  status?: StatusLancamento;
  busca?: string;
}

@Injectable({ providedIn: 'root' })
export class LancamentosApiService {
  private http = inject(HttpClient);
  private base(empresaId: string) { return `${environment.apiUrl}/empresas/${empresaId}/lancamentos`; }

  listar(empresaId: string, filtro: FiltroLancamentos = {}): Observable<Lancamento[]> {
    const params = new URLSearchParams();
    if (filtro.tipo)   params.set('tipo', filtro.tipo);
    if (filtro.status) params.set('status', filtro.status);
    if (filtro.busca)  params.set('busca', filtro.busca);
    const qs = params.toString();
    const url = qs ? `${this.base(empresaId)}?${qs}` : this.base(empresaId);
    return this.http.get<RespostaApi<Lancamento[]>>(url).pipe(map(r => r.data));
  }

  criar(empresaId: string, dto: CriarLancamentoDto, parcelas = 1): Observable<Lancamento[]> {
    return this.http
      .post<RespostaApi<Lancamento[]>>(this.base(empresaId), { lancamento: dto, parcelas })
      .pipe(map(r => r.data));
  }

  atualizar(empresaId: string, id: string, dto: Partial<CriarLancamentoDto>): Observable<Lancamento> {
    return this.http
      .patch<RespostaApi<Lancamento>>(`${this.base(empresaId)}/${id}`, { lancamento: dto })
      .pipe(map(r => r.data));
  }

  propagarGrupo(empresaId: string, id: string, valor: number): Observable<void> {
    return this.http
      .patch<RespostaApi<unknown>>(`${this.base(empresaId)}/${id}/propagar_grupo`, { valor })
      .pipe(map(() => void 0));
  }

  parcelar(empresaId: string, id: string, parcelas: number): Observable<void> {
    return this.http
      .post<RespostaApi<unknown>>(`${this.base(empresaId)}/${id}/parcelar`, { parcelas })
      .pipe(map(() => void 0));
  }

  cancelar(
    empresaId: string,
    id: string,
    estorno: 'nenhum' | 'parcial' | 'integral',
    valor_estorno?: number,
  ): Observable<void> {
    return this.http
      .post<RespostaApi<unknown>>(`${this.base(empresaId)}/${id}/cancelar`, { estorno, valor_estorno })
      .pipe(map(() => void 0));
  }

  excluir(empresaId: string, id: string): Observable<void> {
    return this.http
      .delete<RespostaApi<unknown>>(`${this.base(empresaId)}/${id}`)
      .pipe(map(() => void 0));
  }
}
