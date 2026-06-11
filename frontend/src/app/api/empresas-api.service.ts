import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';

export type PapelEmpresa = 'dono' | 'socio' | 'contador';

export interface Empresa {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  saldo_atual: string | null;
  criado_em: string;
  papel: PapelEmpresa;
}

export interface AcessoDetalhe {
  id: string;
  papel: PapelEmpresa;
  usuario_id: string;
  nome: string | null;
  email: string;
  criado_em: string;
}

export interface CriarEmpresaDto {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  saldo_atual?: number | null;
}

export interface ConviteResposta {
  url: string;
  expira_em: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresasApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/empresas`;

  listar(): Observable<Empresa[]> {
    return this.http.get<RespostaApi<Empresa[]>>(this.base).pipe(map(r => r.data));
  }

  criar(dto: CriarEmpresaDto): Observable<Empresa> {
    return this.http.post<RespostaApi<Empresa>>(this.base, { empresa: dto }).pipe(map(r => r.data));
  }

  atualizar(empresaId: string, dto: { nome_fantasia: string }): Observable<Empresa> {
    return this.http
      .patch<RespostaApi<Empresa>>(`${this.base}/${empresaId}`, { empresa: dto })
      .pipe(map(r => r.data));
  }

  excluir(empresaId: string): Observable<void> {
    return this.http
      .delete<RespostaApi<unknown>>(`${this.base}/${empresaId}`)
      .pipe(map(() => void 0));
  }

  listarAcessos(empresaId: string): Observable<AcessoDetalhe[]> {
    return this.http
      .get<RespostaApi<AcessoDetalhe[]>>(`${this.base}/${empresaId}/acessos`)
      .pipe(map(r => r.data));
  }

  removerAcesso(empresaId: string, acessoId: string): Observable<void> {
    return this.http
      .delete<RespostaApi<unknown>>(`${this.base}/${empresaId}/acessos/${acessoId}`)
      .pipe(map(() => void 0));
  }

  gerarConvite(empresaId: string, papel: 'socio' | 'contador'): Observable<ConviteResposta> {
    return this.http
      .post<RespostaApi<ConviteResposta>>(`${this.base}/${empresaId}/convites`, { papel })
      .pipe(map(r => r.data));
  }

  transferirTitularidade(empresaId: string, acessoId: string): Observable<void> {
    return this.http
      .post<RespostaApi<unknown>>(`${this.base}/${empresaId}/transferir_titularidade`, { acesso_id: acessoId })
      .pipe(map(() => void 0));
  }
}
