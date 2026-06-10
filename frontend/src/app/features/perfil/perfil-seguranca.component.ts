import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-perfil-seguranca',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styles: [':host { display: block; }'],
  template: `
    <div class="p-6 rounded-2xl border transition-colors shadow-sm"
         [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">

      <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Segurança da Conta
      </h3>

      <!-- Senha: "Alterar" se já tem, "Definir" se logou só via social -->
      <div class="py-4 border-b transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-medium text-sm mb-1">Senha</h4>
            <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
              @if (temSenha()) {
                Altere a senha usada para entrar com e-mail.
              } @else {
                Você entra apenas via login social. Defina uma senha para também acessar com e-mail.
              }
            </p>
          </div>
          <button (click)="alterandoSenha.set(!alterandoSenha())"
                  class="px-4 py-2 rounded-xl text-xs font-medium border transition-colors shrink-0"
                  [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-200 hover:bg-[#202024]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'">
            {{ alterandoSenha() ? 'Cancelar' : (temSenha() ? 'Alterar Senha' : 'Definir Senha') }}
          </button>
        </div>

        @if (alterandoSenha()) {
          <form [formGroup]="formSenha" (ngSubmit)="salvarSenha()" class="mt-4 space-y-3">
            @if (erroSenha()) {
              <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erroSenha() }}</div>
            }
            @if (sucessoSenha()) {
              <div class="p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-green-500 text-sm">
                {{ temSenha() ? 'Senha alterada com sucesso.' : 'Senha definida com sucesso. Agora você também pode entrar com e-mail e senha.' }}
              </div>
            }
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">{{ temSenha() ? 'Nova Senha' : 'Senha' }}</label>
              <input formControlName="nova" type="password" placeholder="Mínimo 6 caracteres"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Confirmar Senha</label>
              <input formControlName="confirmar" type="password" placeholder="Repita a senha"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
              @if (formSenha.errors?.['senhasDiferentes'] && formSenha.get('confirmar')?.touched) {
                <span class="text-xs text-red-500 mt-1 block">As senhas não coincidem</span>
              }
            </div>
            <div class="flex justify-end">
              <button type="submit" [disabled]="salvandoSenha() || formSenha.invalid"
                      class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {{ salvandoSenha() ? 'Salvando...' : 'Confirmar' }}
              </button>
            </div>
          </form>
        }
      </div>

      <!-- 2FA / MFA -->
      <div class="py-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex-1">
            <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
              Autenticação de 2 Fatores (2FA)
              @if (mfaAtivo()) {
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">ATIVO</span>
              }
            </h4>
            <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
              Use um aplicativo autenticador (Google Authenticator, Authy) para gerar códigos de segurança.
            </p>
          </div>
          @if (carregandoMfa()) {
            <div class="w-11 h-6 rounded-full animate-pulse" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-200'"></div>
          } @else {
            <button (click)="toggleMfa()"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    [class.bg-blue-600]="mfaAtivo()"
                    [ngClass]="[
                      mfaAtivo() ? 'bg-blue-600' : (t.isDark() ? 'bg-[#3f3f46]' : 'bg-slate-200'),
                      t.isDark() ? 'focus:ring-offset-[#121214]' : 'focus:ring-offset-white'
                    ]">
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    [class.translate-x-5]="mfaAtivo()"
                    [class.translate-x-0]="!mfaAtivo()"></span>
            </button>
          }
        </div>

        @if (erroMfa() && !mostrandoQr()) {
          <p class="text-xs text-red-500 mt-2">{{ erroMfa() }}</p>
        }

        <!-- Modal de ativação 2FA -->
        @if (mostrandoQr()) {
          <div class="mt-4 p-4 rounded-xl border transition-colors"
               [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c]' : 'bg-slate-50 border-slate-200'">
            <h5 class="font-bold text-sm mb-3">Escaneie o QR Code</h5>
            <div class="flex flex-col sm:flex-row gap-6 items-start">
              <div class="w-36 h-36 rounded-xl overflow-hidden shrink-0 border"
                   [ngClass]="t.isDark() ? 'border-[#2a2a2c] bg-white' : 'border-slate-200'">
                @if (qrCode()) {
                  <img [src]="qrCode()!" class="w-full h-full" alt="QR Code 2FA">
                }
              </div>
              <div class="flex-1">
                <p class="text-xs mb-3 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-600'">
                  Abra o seu aplicativo autenticador, escaneie o QR Code e insira o código gerado abaixo para confirmar.
                </p>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Código de 6 dígitos</label>
                <div class="flex gap-2">
                  <input [(ngModel)]="codigoMfa" type="text" maxlength="6" placeholder="000000"
                         class="flex-1 text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest"
                         [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-white border-slate-200 text-slate-900'">
                  <button (click)="confirmarMfa()" [disabled]="codigoMfa.length !== 6 || confirmandoMfa()"
                          class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0">
                    {{ confirmandoMfa() ? '...' : 'Confirmar' }}
                  </button>
                </div>
                @if (erroMfa()) {
                  <p class="text-xs text-red-500 mt-2">{{ erroMfa() }}</p>
                }
              </div>
            </div>
            <button (click)="cancelarMfa()" class="mt-3 text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'">
              Cancelar
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class PerfilSegurancaComponent implements OnInit {
  t        = inject(ThemeService);
  private supabase = inject(SupabaseService);
  private fb       = inject(FormBuilder);

  temSenha      = signal(false);
  alterandoSenha = signal(false);
  salvandoSenha  = signal(false);
  erroSenha      = signal('');
  sucessoSenha   = signal(false);

  mfaAtivo      = signal(false);
  carregandoMfa  = signal(true);
  mostrandoQr    = signal(false);
  qrCode         = signal<string | null>(null);
  codigoMfa      = '';
  confirmandoMfa = signal(false);
  erroMfa        = signal('');
  private fatorMfaId = '';

  formSenha = this.fb.group(
    {
      nova:      ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required],
    },
    { validators: this.senhasIguais }
  );

  async ngOnInit() {
    const user = await this.supabase.usuarioAtualSupabase();
    const ids = user?.identities ?? [];
    this.temSenha.set(ids.some(i => i.provider === 'email'));

    const fatores = (await this.supabase.listarFatoresMfa()).filter(f => f.status === 'verified');
    this.mfaAtivo.set(fatores.length > 0);
    if (fatores.length > 0) this.fatorMfaId = fatores[0].id;
    this.carregandoMfa.set(false);
  }

  async salvarSenha() {
    if (this.formSenha.invalid) { this.formSenha.markAllAsTouched(); return; }
    this.salvandoSenha.set(true);
    this.erroSenha.set('');

    const err = await this.supabase.alterarSenha(this.formSenha.value.nova!);
    if (err) {
      this.erroSenha.set(err);
    } else {
      this.sucessoSenha.set(true);
      this.formSenha.reset();
      this.temSenha.set(true); // se era login só-social, agora tem senha
      // mantém o form aberto exibindo o sucesso, depois fecha
      setTimeout(() => {
        this.sucessoSenha.set(false);
        this.alterandoSenha.set(false);
      }, 2500);
    }
    this.salvandoSenha.set(false);
  }

  async toggleMfa() {
    this.erroMfa.set('');
    if (this.mfaAtivo()) {
      const err = await this.supabase.desativarMfa(this.fatorMfaId);
      if (!err) { this.mfaAtivo.set(false); this.fatorMfaId = ''; }
      else this.erroMfa.set(err);
    } else {
      const resultado = await this.supabase.ativarMfa();
      if (resultado.erro) {
        this.erroMfa.set(resultado.erro);
      } else {
        this.fatorMfaId = resultado.id;
        this.qrCode.set(resultado.qrCode);
        this.mostrandoQr.set(true);
      }
    }
  }

  async confirmarMfa() {
    if (this.codigoMfa.length !== 6) return;
    this.confirmandoMfa.set(true);
    this.erroMfa.set('');

    const err = await this.supabase.verificarMfa(this.fatorMfaId, this.codigoMfa);
    if (err) {
      this.erroMfa.set('Código inválido. Tente novamente.');
    } else {
      this.mfaAtivo.set(true);
      this.mostrandoQr.set(false);
      this.codigoMfa = '';
    }
    this.confirmandoMfa.set(false);
  }

  cancelarMfa() {
    this.supabase.desativarMfa(this.fatorMfaId);
    this.mostrandoQr.set(false);
    this.codigoMfa = '';
    this.fatorMfaId = '';
  }

  private senhasIguais(group: import('@angular/forms').AbstractControl) {
    const nova = group.get('nova')?.value;
    const confirmar = group.get('confirmar')?.value;
    return nova === confirmar ? null : { senhasDiferentes: true };
  }
}
