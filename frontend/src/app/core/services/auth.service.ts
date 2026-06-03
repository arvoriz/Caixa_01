import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';
import { SupabaseService } from './supabase.service';
import { AuthApiService } from '../../api/auth-api.service';
import { EmpresaAtivaService } from './empresa-ativa.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenStorage  = inject(TokenStorageService);
  private supabase      = inject(SupabaseService);
  private authApi       = inject(AuthApiService);
  private router        = inject(Router);
  private empresaAtiva  = inject(EmpresaAtivaService);

  usuarioAtual    = signal<Usuario | null>(null);
  estaAutenticado = signal<boolean>(this.tokenStorage.has());

  entrar(email: string, senha: string) {
    return from(this.supabase.entrar(email, senha)).pipe(
      tap(({ data, error }) => {
        if (error) throw error;
        const token = data.session?.access_token;
        if (token) {
          this.tokenStorage.set(token);
          this.estaAutenticado.set(true);
        }
      })
    );
  }

  cadastrar(email: string, senha: string, nome: string) {
    return from(this.supabase.cadastrar(email, senha, nome)).pipe(
      tap(({ data, error }) => {
        if (error) throw error;
        const token = data.session?.access_token;
        if (token) {
          this.tokenStorage.set(token);
          this.estaAutenticado.set(true);
        }
      })
    );
  }

  sair() {
    this.supabase.sair();
    this.tokenStorage.remove();
    this.usuarioAtual.set(null);
    this.estaAutenticado.set(false);
    this.empresaAtiva.limpar();
    this.router.navigate(['/auth/login']);
  }

  carregarUsuarioAtual() {
    return this.authApi.me().pipe(
      tap(res => {
        this.usuarioAtual.set(res.data);
        this.estaAutenticado.set(true);
        this.empresaAtiva.inicializar(res.data.ultima_empresa_id);
      })
    );
  }
}
