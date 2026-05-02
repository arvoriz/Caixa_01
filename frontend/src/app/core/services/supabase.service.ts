import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async entrar(email: string, senha: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password: senha });
  }

  async entrarComGoogle(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
    return this.supabase.auth.onAuthStateChange((_evento, session) => {
      callback(session);
    });
  }
}
