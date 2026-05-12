import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        // Desabilita o navigator.locks — evita NavigatorLockAcquireTimeoutError
        // no dev mode (HMR) e quando múltiplas abas tentam adquirir o lock ao mesmo tempo
        lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
      },
    });
  }

  async entrar(email: string, senha: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password: senha });
  }

  async cadastrar(email: string, senha: string, nome: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({ email, password: senha, options: { data: { full_name: nome } } });
  }

  async entrarComGoogle(): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) return;

    const popup = window.open(
      data.url,
      'login-google',
      'width=500,height=620,top=100,left=100,resizable=yes,scrollbars=yes'
    );

    // Fecha o popup e dispara onAuthStateChange quando o Supabase detectar a sessão
    const { data: listener } = this.supabase.auth.onAuthStateChange((evento: string) => {
      if (evento === 'SIGNED_IN') {
        popup?.close();
        listener.subscription.unsubscribe();
      }
    });
  }

  async sair(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async sessaoAtual(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  onMudancaAuth(callback: (session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((_evento: string, session: Session | null) => {
      callback(session);
    });
  }
}
