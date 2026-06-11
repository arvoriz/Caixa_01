import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-4">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-white">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>

        <!-- Card -->
        <div class="rounded-2xl border bg-[#121214] border-[#2a2a2c] shadow-2xl p-8">

          @if (validandoLink) {
            <div class="flex flex-col items-center gap-4 py-4">
              <div class="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <p class="text-gray-400 text-sm">Validando link...</p>
            </div>
          } @else if (linkInvalido) {
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white mb-2">Link inválido ou expirado</h2>
                <p class="text-gray-400 text-sm">Solicite um novo link de redefinição de senha na tela de login.</p>
              </div>
              <button (click)="irParaLogin()"
                      class="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[#18181b] border border-[#2a2a2c] text-gray-300 hover:bg-[#27272a] transition-colors">
                Ir para o login
              </button>
            </div>
          } @else if (sucesso) {
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white mb-2">Senha redefinida!</h2>
                <p class="text-gray-400 text-sm">Sua senha foi alterada com sucesso.</p>
              </div>
              <button (click)="irParaLogin()"
                      class="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Ir para o login
              </button>
            </div>
          } @else {
            <h2 class="text-xl font-bold text-white mb-1">Redefinir senha</h2>
            <p class="text-gray-400 text-sm mb-6">Escolha uma nova senha para sua conta.</p>

            <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-4">
              @if (erro) {
                <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro }}</div>
              }

              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-gray-400">Nova senha</label>
                <input formControlName="nova" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password"
                       class="w-full text-sm rounded-xl bg-[#18181b] border border-[#2a2a2c] text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors">
                @if (form.get('nova')?.invalid && form.get('nova')?.touched) {
                  <span class="text-xs text-red-500 mt-1 block">A senha deve ter no mínimo 6 caracteres</span>
                }
              </div>

              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-gray-400">Confirmar nova senha</label>
                <input formControlName="confirmar" type="password" placeholder="Repita a senha" autocomplete="new-password"
                       class="w-full text-sm rounded-xl bg-[#18181b] border border-[#2a2a2c] text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors">
                @if (form.hasError('senhasDiferentes') && form.get('confirmar')?.touched) {
                  <span class="text-xs text-red-500 mt-1 block">As senhas não coincidem</span>
                }
              </div>

              <button type="submit" [disabled]="salvando"
                      class="w-full py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
                {{ salvando ? 'Salvando...' : 'Salvar nova senha' }}
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class RedefinirSenhaComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private router   = inject(Router);

  validandoLink = true;
  linkInvalido  = false;
  salvando      = false;
  sucesso       = false;
  erro          = '';

  form = this.fb.group(
    {
      nova:      ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required],
    },
    { validators: RedefinirSenhaComponent.senhasIguais }
  );

  static senhasIguais(ctrl: AbstractControl): ValidationErrors | null {
    const nova      = ctrl.get('nova')?.value;
    const confirmar = ctrl.get('confirmar')?.value;
    return nova && confirmar && nova !== confirmar ? { senhasDiferentes: true } : null;
  }

  async ngOnInit(): Promise<void> {
    // O Supabase processa o token de recuperação presente na URL e cria a sessão automaticamente.
    const sessao = await this.supabase.sessaoAtual();
    this.linkInvalido  = !sessao;
    this.validandoLink = false;
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    this.erro     = '';

    const erro = await this.supabase.alterarSenha(this.form.value.nova!);
    this.salvando = false;
    if (erro) {
      this.erro = erro;
      return;
    }
    this.sucesso = true;
  }

  irParaLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
