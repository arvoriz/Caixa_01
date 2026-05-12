import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-20 flex items-center justify-between px-6 lg:px-10 border-b shrink-0 transition-colors duration-500 z-10 relative"
            [ngClass]="theme.isDark()
              ? 'bg-[#0a0a0b]/80 border-[#2a2a2c] backdrop-blur-md'
              : 'bg-slate-50/80 border-slate-200 backdrop-blur-md'">

      <!-- Seletor de Empresa -->
      <div class="flex items-center gap-3">
        <p class="hidden md:block text-xs font-semibold uppercase tracking-wider transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-500' : 'text-slate-400'">Empresa Ativa</p>
        <button class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300"
                [ngClass]="theme.isDark()
                  ? 'bg-[#121214] border-[#2a2a2c] hover:border-blue-500/50 text-gray-200'
                  : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800'">
          <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0"></div>
          <span class="text-sm font-medium truncate max-w-[180px]">Tech Solutions Ltda</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 opacity-50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      <!-- Ações -->
      <div class="flex items-center gap-3">

        <!-- Tema -->
        <button (click)="theme.toggle()"
                class="p-2 rounded-full border transition-all duration-300 shadow-sm"
                [ngClass]="theme.isDark()
                  ? 'bg-[#121214] border-[#2a2a2c] text-gray-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'">
          @if (theme.isDark()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/><path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          }
        </button>

        <!-- Notificações -->
        <button class="relative p-2 rounded-full border transition-all duration-300 shadow-sm"
                [ngClass]="theme.isDark()
                  ? 'bg-[#121214] border-[#2a2a2c] text-gray-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'">
          <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2"
                [ngClass]="theme.isDark() ? 'border-[#121214]' : 'border-white'"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </button>

        <!-- Novo Lançamento -->
        <button class="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Novo Lançamento
        </button>

        <!-- Sair -->
        <button (click)="auth.sair()"
                class="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors border"
                [ngClass]="theme.isDark()
                  ? 'border-[#2a2a2c] text-gray-400 hover:text-white hover:border-gray-500'
                  : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  theme = inject(ThemeService);
  auth  = inject(AuthService);
}
