import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';

export type TipoTransacao = 'entrada' | 'saida';

export interface Categoria {
  id: string;
  empresa_id: string | null;
  nome: string;
  tipo: TipoTransacao;
  padrao_sistema: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriasApiService {
  private http = inject(HttpClient);
  private base(empresaId: string) { return `${environment.apiUrl}/empresas/${empresaId}/categorias`; }

  listar(empresaId: string, tipo?: TipoTransacao): Observable<Categoria[]> {
    const url = tipo ? `${this.base(empresaId)}?tipo=${tipo}` : this.base(empresaId);
    return this.http.get<RespostaApi<Categoria[]>>(url).pipe(map(r => r.data));
  }

  criar(empresaId: string, dto: { nome: string; tipo: TipoTransacao }): Observable<Categoria> {
    return this.http
      .post<RespostaApi<Categoria>>(this.base(empresaId), { categoria: dto })
      .pipe(map(r => r.data));
  }
}
