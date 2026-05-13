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
  saldo_inicial: string | null;
  criado_em: string;
  papel: PapelEmpresa;
}

export interface CriarEmpresaDto {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  saldo_inicial?: number | null;
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
}
