import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { RespostaApi, Usuario } from '../core/models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  me(): Observable<RespostaApi<Usuario>> {
    return this.http.get<RespostaApi<Usuario>>(`${this.base}/me`);
  }

  atualizarPerfil(nomeCompleto: string): Observable<RespostaApi<Usuario>> {
    return this.http.patch<RespostaApi<Usuario>>(`${this.base}/me`, {
      usuario: { nome_completo: nomeCompleto },
    });
  }

  salvarUltimaEmpresa(empresaId: string): Observable<void> {
    return this.http
      .patch<RespostaApi<unknown>>(`${this.base}/ultima_empresa`, { empresa_id: empresaId })
      .pipe(map(() => void 0));
  }
}
