import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, Session, User } from '@supabase/supabase-js';
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
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error || !data.url) return;

    const popup = window.open(
      data.url,
      'login-google',
      'width=500,height=620,top=100,left=100,resizable=yes,scrollbars=yes'
    );

    // Monitora o popup: quando o Supabase detectar SIGNED_IN tenta fechar;
    // o polling garante que o listener seja removido mesmo que o usuário feche manualmente.
    const { data: listener } = this.supabase.auth.onAuthStateChange((evento: string) => {
      if (evento === 'SIGNED_IN') {
        listener.subscription.unsubscribe();
        try { popup?.close(); } catch { /* COOP pode bloquear — popup fecha sozinho */ }
      }
    });

    const intervalo = setInterval(() => {
      if (popup?.closed) {
        clearInterval(intervalo);
        listener.subscription.unsubscribe();
      }
    }, 500);
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

  async usuarioAtualSupabase(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  async alterarSenha(novaSenha: string): Promise<string | null> {
    const { error } = await this.supabase.auth.updateUser({ password: novaSenha });
    return error?.message ?? null;
  }

  // ── MFA / 2FA ──────────────────────────────────────────────────────────────

  async listarFatoresMfa(): Promise<Array<{ id: string }>> {
    const { data } = await this.supabase.auth.mfa.listFactors();
    return data?.totp ?? [];
  }

  async ativarMfa(): Promise<{ id: string; qrCode: string; secret: string } | null> {
    const { data, error } = await this.supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'FluxoPro',
    });
    if (error || !data) return null;
    return { id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  }

  async verificarMfa(factorId: string, codigo: string): Promise<string | null> {
    const { error } = await this.supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo });
    return error?.message ?? null;
  }

  async desativarMfa(factorId: string): Promise<string | null> {
    const { error } = await this.supabase.auth.mfa.unenroll({ factorId });
    return error?.message ?? null;
  }

  // Após o login, indica se há um fator 2FA pendente de verificação (aal1 → aal2).
  async precisaVerificarMfa(): Promise<boolean> {
    const { data, error } = await this.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) return false;
    return data.currentLevel === 'aal1' && data.nextLevel === 'aal2';
  }

  // Verifica o código TOTP no login e devolve o novo access_token (já em aal2).
  async verificarMfaLogin(codigo: string): Promise<{ token?: string; erro?: string }> {
    const fatores = await this.listarFatoresMfa();
    if (fatores.length === 0) return { erro: 'Nenhum fator 2FA configurado.' };

    const erro = await this.verificarMfa(fatores[0].id, codigo);
    if (erro) return { erro };

    const session = await this.sessaoAtual();
    return { token: session?.access_token };
  }
}
