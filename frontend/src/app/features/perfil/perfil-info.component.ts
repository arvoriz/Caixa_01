import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthApiService } from '../../api/auth-api.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-perfil-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [':host { display: block; }'],
  template: `
    <div class="p-6 rounded-2xl border transition-colors shadow-sm"
         [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">

      <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        Informações Pessoais
      </h3>

      <!-- Avatar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg shrink-0"
             [ngClass]="avatarBg()">
          @if (avatarUrl()) {
            <img [src]="avatarUrl()" class="w-full h-full rounded-full object-cover" alt="Foto de perfil">
          } @else {
            {{ iniciais() }}
          }
        </div>
        <div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            @for (provedor of provedores(); track provedor) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                    [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'">
                @if (provedor === 'google') {
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                } @else if (provedor === 'email') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  E-mail / Senha
                }
              </span>
            }
          </div>
          <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
            Foto sincronizada com o provedor de login
          </p>
        </div>
      </div>

      <!-- Formulário -->
      @if (erro()) {
        <div class="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
      }
      @if (sucesso()) {
        <div class="mb-4 p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-green-500 text-sm">Informações atualizadas com sucesso.</div>
      }

      <form [formGroup]="form" (ngSubmit)="salvar()" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                 [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Nome Completo</label>
          <input formControlName="nome_completo" type="text" placeholder="Seu nome"
                 class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                 [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
          @if (form.get('nome_completo')?.invalid && form.get('nome_completo')?.touched) {
            <span class="text-xs text-red-500 mt-1 block">Nome obrigatório</span>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                 [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
            E-mail
            <span class="ml-1 normal-case font-normal text-[10px] px-1.5 py-0.5 rounded"
                  [ngClass]="t.isDark() ? 'bg-[#2a2a2c] text-gray-500' : 'bg-slate-100 text-slate-400'">
              não editável
            </span>
          </label>
          <input type="email" [value]="auth.usuarioAtual()?.email ?? ''" disabled
                 class="w-full text-sm rounded-xl px-4 py-3 border outline-none opacity-50 cursor-not-allowed transition-colors"
                 [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
        </div>

        <div class="sm:col-span-2 flex justify-end">
          <button type="submit" [disabled]="salvando() || form.invalid"
                  class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
            {{ salvando() ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class PerfilInfoComponent implements OnInit {
  t        = inject(ThemeService);
  auth     = inject(AuthService);
  private api      = inject(AuthApiService);
  private supabase = inject(SupabaseService);
  private fb       = inject(FormBuilder);

  provedores = signal<string[]>([]);
  avatarUrl  = signal<string | null>(null);
  salvando   = signal(false);
  erro       = signal('');
  sucesso    = signal(false);

  form = this.fb.group({
    nome_completo: ['', Validators.required],
  });

  constructor() {
    // Preenche o nome quando o usuário carregar (a chamada /auth/me é assíncrona).
    // Só sobrescreve enquanto o campo não foi editado pelo usuário.
    effect(() => {
      const u = this.auth.usuarioAtual();
      if (u && this.form.get('nome_completo')!.pristine) {
        this.form.patchValue({ nome_completo: u.nome_completo ?? '' }, { emitEvent: false });
      }
    });
  }

  async ngOnInit() {
    const user = await this.supabase.usuarioAtualSupabase();
    if (user) {
      const ids = user.identities ?? [];
      this.provedores.set(ids.map(i => i.provider));
      const googleId = ids.find(i => i.provider === 'google');
      if (googleId) {
        this.avatarUrl.set((user.user_metadata?.['avatar_url'] as string) ?? null);
      }
    }
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set(false);

    const { nome_completo } = this.form.value;
    this.api.atualizarPerfil(nome_completo!).subscribe({
      next: res => {
        this.auth.usuarioAtual.set(res.data);
        this.salvando.set(false);
        this.sucesso.set(true);
        setTimeout(() => this.sucesso.set(false), 3000);
      },
      error: err => {
        this.erro.set(err?.error?.errors?.[0] ?? 'Erro ao salvar.');
        this.salvando.set(false);
      },
    });
  }

  iniciais(): string {
    const nome = this.auth.usuarioAtual()?.nome_completo ?? this.auth.usuarioAtual()?.email ?? '';
    return nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase() || 'U';
  }

  avatarBg(): string {
    return this.avatarUrl() ? '' : 'bg-gradient-to-tr from-blue-500 to-blue-700';
  }
}
