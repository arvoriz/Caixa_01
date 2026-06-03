import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';

export interface ConviteInfo {
  nome_fantasia: string | null;
  razao_social: string;
  papel: 'socio' | 'contador';
  expira_em: string;
}

@Injectable({ providedIn: 'root' })
export class ConviteApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/convites`;

  validar(token: string): Observable<ConviteInfo> {
    return this.http
      .get<RespostaApi<ConviteInfo>>(`${this.base}/${token}`)
      .pipe(map(r => r.data));
  }

  aceitar(token: string): Observable<{ mensagem: string; empresa: string; papel: string }> {
    return this.http
      .post<RespostaApi<{ mensagem: string; empresa: string; papel: string }>>(
        `${this.base}/${token}/aceitar`,
        {}
      )
      .pipe(map(r => r.data));
  }
}
