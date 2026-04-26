import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, ApiResponse, User } from '../core/models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password });
  }

  logout() {
    return this.http.delete<ApiResponse<null>>(`${this.base}/logout`);
  }

  me() {
    return this.http.get<ApiResponse<User>>(`${this.base}/me`);
  }
}
