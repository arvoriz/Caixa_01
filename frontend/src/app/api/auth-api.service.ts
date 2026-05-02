import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RespostaApi, Usuario } from '../core/models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  me() {
    return this.http.get<RespostaApi<Usuario>>(`${this.base}/me`);
  }
}
