import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';
import { AuthApiService } from '../../api/auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenStorage = inject(TokenStorageService);
  private authApi      = inject(AuthApiService);
  private router       = inject(Router);

  currentUser     = signal<User | null>(null);
  isAuthenticated = signal<boolean>(this.tokenStorage.has());

  login(email: string, password: string) {
    return this.authApi.login(email, password).pipe(
      tap(res => {
        this.tokenStorage.set(res.data['token']);
        this.currentUser.set(res.data['user'] as unknown as User);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    this.authApi.logout().subscribe({ error: () => {} });
    this.tokenStorage.remove();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  loadCurrentUser() {
    return this.authApi.me().pipe(
      tap(res => {
        this.currentUser.set(res.data);
        this.isAuthenticated.set(true);
      })
    );
  }
}
