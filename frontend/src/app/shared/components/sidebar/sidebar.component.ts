import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmpresaAtivaService } from '../../../core/services/empresa-ativa.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 h-full hidden md:flex flex-col border-r shrink-0 transition-colors duration-500"
           [ngClass]="theme.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">

      <!-- Logo -->
      <div class="h-20 flex items-center px-6 border-b shrink-0 transition-colors duration-500"
           [ngClass]="theme.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] mr-3 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"/>
          </svg>
        </div>
        <span class="font-bold text-lg tracking-wide">Caixa Pro</span>
      </div>

      <!-- Navegação -->
      <nav class="flex-1 py-6 px-4 space-y-1 overflow-y-auto">

        <a routerLink="/dashboard" routerLinkActive="!bg-blue-600/10 !text-blue-500"
           class="flex items-center px-4 py-3 rounded-xl font-medium transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-400 hover:bg-[#18181b] hover:text-gray-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          Dashboard
        </a>

        <a routerLink="/lancamentos" routerLinkActive="!bg-blue-600/10 !text-blue-500"
           class="flex items-center px-4 py-3 rounded-xl transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-400 hover:bg-[#18181b] hover:text-gray-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Lançamentos
        </a>

        <a routerLink="/empresas" routerLinkActive="!bg-blue-600/10 !text-blue-500"
           class="flex items-center px-4 py-3 rounded-xl transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-400 hover:bg-[#18181b] hover:text-gray-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/>
          </svg>
          Empresas (CNPJs)
        </a>

        <a routerLink="/emprestimos" routerLinkActive="!bg-blue-600/10 !text-blue-500"
           class="flex items-center px-4 py-3 rounded-xl transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-400 hover:bg-[#18181b] hover:text-gray-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 21h8"/><path d="M12 17v4"/><path d="m10 13 2 2 2-2"/><path d="M12 15V8"/>
            <path d="M18 4v4"/><path d="M6 4v4"/><rect width="20" height="8" x="2" y="4" rx="2"/>
          </svg>
          Empréstimos
        </a>

        <a href="#" class="flex items-center px-4 py-3 rounded-xl transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-400 hover:bg-[#18181b] hover:text-gray-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
          </svg>
          Relatórios
        </a>
      </nav>

      <!-- Perfil do Usuário -->
      <div class="p-4 border-t shrink-0 transition-colors duration-500"
           [ngClass]="theme.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
        <a routerLink="/perfil"
           class="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer group"
           [ngClass]="theme.isDark() ? 'hover:bg-[#18181b]' : 'hover:bg-slate-100'">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0">
            {{ iniciais }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ auth.usuarioAtual()?.nome_completo ?? 'Usuário' }}</p>
            <p class="text-xs truncate transition-colors" [ngClass]="theme.isDark() ? 'text-gray-500' : 'text-slate-500'">
              {{ papelAtivo() }}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 transition-colors" [ngClass]="theme.isDark() ? 'text-gray-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  theme        = inject(ThemeService);
  auth         = inject(AuthService);
  empresaAtiva = inject(EmpresaAtivaService);

  get iniciais(): string {
    const nome = this.auth.usuarioAtual()?.nome_completo ?? '';
    return nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase() || 'U';
  }

  papelAtivo = computed(() => {
    const papel = this.empresaAtiva.ativa()?.papel;
    if (!papel) return '—';
    return ({ dono: 'Dono', socio: 'Sócio', contador: 'Contador' })[papel] ?? papel;
  });
}
