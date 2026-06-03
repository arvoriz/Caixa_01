import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { PerfilInfoComponent } from './perfil-info.component';
import { PerfilSegurancaComponent } from './perfil-seguranca.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, PerfilInfoComponent, PerfilSegurancaComponent],
  template: `
    <div class="p-6 lg:p-10">
      <div class="max-w-3xl mx-auto space-y-6">

        <div class="mb-2">
          <h1 class="text-2xl font-bold mb-1">Configurações da Conta</h1>
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Gerencie suas informações pessoais e preferências de segurança.
          </p>
        </div>

        <app-perfil-info />
        <app-perfil-seguranca />

        <!-- Zona de Perigo -->
        <div class="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1">
              <h3 class="font-bold text-lg text-red-500 mb-1">Zona de Perigo</h3>
              <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-600'">
                A exclusão da sua conta é permanente. Empresas das quais você é o único dono também serão excluídas. Você terá 30 dias para cancelar a solicitação.
              </p>
            </div>
            <button (click)="confirmarExclusao()"
                    class="py-2.5 px-5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shrink-0">
              Excluir Minha Conta
            </button>
          </div>
        </div>
      </div>

      <!-- Dialog de confirmação de exclusão -->
      @if (dialogExclusao) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             (click)="dialogExclusao = false">
          <div class="w-full max-w-md rounded-2xl border shadow-2xl p-6"
               [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
               (click)="$event.stopPropagation()">
            <div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-2">Confirmar exclusão de conta</h3>
            <p class="text-sm mb-6 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-600'">
              Sua conta e todos os dados pessoais serão excluídos em <strong>30 dias</strong>. Você receberá um e-mail com opção de cancelar durante esse período.
            </p>
            <div class="flex gap-3">
              <button (click)="dialogExclusao = false"
                      class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                      [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
                Cancelar
              </button>
              <button (click)="excluirConta()"
                      class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PerfilComponent {
  t    = inject(ThemeService);
  auth = inject(AuthService);

  dialogExclusao = false;

  confirmarExclusao() { this.dialogExclusao = true; }

  excluirConta() {
    // TODO: chamar endpoint de exclusão quando implementado
    this.dialogExclusao = false;
    alert('Funcionalidade em implementação — sua conta será excluída em 30 dias após confirmação por e-mail.');
  }
}
