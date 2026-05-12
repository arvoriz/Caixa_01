import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div style="font-family:monospace;padding:2rem;background:#0a0a0b;color:#fff;min-height:100vh;">
      <h2>AUTH CALLBACK DEBUG</h2>
      <pre>{{ log }}</pre>
    </div>
  `,
})
export class CallbackComponent implements OnInit {
  private supabase = inject(SupabaseService);
  log = '';

  private append(msg: string) {
    this.log += msg + '\n';
    console.log('[callback]', msg);
  }

  async ngOnInit() {
    this.append('URL: ' + window.location.href);
    this.append('hash: ' + window.location.hash);
    this.append('search: ' + window.location.search);
    this.append('has opener: ' + !!window.opener);

    this.append('chamando sessaoAtual()...');
    try {
      const session = await this.supabase.sessaoAtual();
      this.append('session: ' + JSON.stringify(session ? { user: session.user?.email, has_token: !!session.access_token } : null));

      if (session?.access_token && window.opener) {
        this.append('enviando postMessage para opener...');
        window.opener.postMessage(
          { type: 'SUPABASE_AUTH_SUCCESS', accessToken: session.access_token },
          window.location.origin
        );
        this.append('postMessage enviado. Fechando em 2s...');
        setTimeout(() => window.close(), 2000);
      } else {
        this.append('PROBLEMA: sem sessão ou sem opener. NÃO fechando para você poder ver este log.');
      }
    } catch (e) {
      this.append('ERRO: ' + String(e));
    }
  }
}
