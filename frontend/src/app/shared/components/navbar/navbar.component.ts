import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { EmpresaAtivaService } from '../../../core/services/empresa-ativa.service';
import { LancamentoUiService } from '../../../core/services/lancamento-ui.service';
import { Empresa } from '../../../api/empresas-api.service';

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
      <div class="flex items-center gap-3 relative">
        <p class="hidden md:block text-xs font-semibold uppercase tracking-wider transition-colors"
           [ngClass]="theme.isDark() ? 'text-gray-500' : 'text-slate-400'">Empresa Ativa</p>

        <!-- Botão trigger -->
        <button (click)="toggleDropdown()"
                class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200"
                [ngClass]="theme.isDark()
                  ? 'bg-[#121214] border-[#2a2a2c] hover:border-blue-500/50 text-gray-200'
                  : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800'">
          <div class="w-2 h-2 rounded-full shrink-0"
               [ngClass]="empresaAtiva.ativa() ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'"></div>
          <span class="text-sm font-medium truncate max-w-[180px]">{{ nomeEmpresaAtiva() }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 opacity-50 shrink-0 transition-transform duration-200"
               [class.rotate-180]="aberto()"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>

        <!-- Dropdown -->
        @if (aberto()) {
          <div class="absolute top-full left-0 mt-2 w-72 rounded-xl border shadow-2xl z-50 overflow-hidden"
               [ngClass]="theme.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">

            <div class="px-3 py-2 border-b transition-colors"
                 [ngClass]="theme.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
              <p class="text-xs font-semibold uppercase tracking-wider transition-colors"
                 [ngClass]="theme.isDark() ? 'text-gray-500' : 'text-slate-400'">Suas Empresas</p>
            </div>

            <div class="max-h-64 overflow-y-auto py-1">
              @if (empresaAtiva.empresas().length === 0) {
                <p class="px-4 py-3 text-sm transition-colors"
                   [ngClass]="theme.isDark() ? 'text-gray-500' : 'text-slate-400'">
                  Nenhuma empresa encontrada.
                </p>
              }
              @for (empresa of empresaAtiva.empresas(); track empresa.id) {
                <button (click)="selecionar(empresa)"
                        class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                        [ngClass]="[
                          empresaAtiva.ativa()?.id === empresa.id
                            ? (theme.isDark() ? 'bg-blue-600/10 text-blue-500' : 'bg-blue-50 text-blue-600')
                            : (theme.isDark() ? 'text-gray-200 hover:bg-[#18181b]' : 'text-slate-700 hover:bg-slate-50')
                        ]">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border"
                       [ngClass]="corIniciais(empresa.papel)">
                    {{ iniciais(empresa.nome_fantasia || empresa.razao_social) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ empresa.nome_fantasia || empresa.razao_social }}</p>
                    <p class="text-xs truncate transition-colors"
                       [ngClass]="empresaAtiva.ativa()?.id === empresa.id
                         ? 'text-blue-400'
                         : (theme.isDark() ? 'text-gray-500' : 'text-slate-400')">
                      {{ labelPapel(empresa.papel) }} · {{ empresa.cnpj }}
                    </p>
                  </div>
                  @if (empresaAtiva.ativa()?.id === empresa.id) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  }
                </button>
              }
            </div>
          </div>
        }
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
        <button (click)="novoLancamento()"
                class="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
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
  theme        = inject(ThemeService);
  auth         = inject(AuthService);
  empresaAtiva = inject(EmpresaAtivaService);
  private router       = inject(Router);
  private lancamentoUi = inject(LancamentoUiService);

  aberto = signal(false);

  nomeEmpresaAtiva = computed(() =>
    this.empresaAtiva.ativa()?.nome_fantasia ||
    this.empresaAtiva.ativa()?.razao_social ||
    'Selecionar empresa'
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const el = event.target as HTMLElement;
    if (!el.closest('app-navbar')) this.aberto.set(false);
  }

  toggleDropdown() { this.aberto.update(v => !v); }

  async novoLancamento() {
    await this.router.navigate(['/lancamentos']);
    this.lancamentoUi.solicitarNovo();
  }

  selecionar(empresa: Empresa) {
    this.empresaAtiva.selecionar(empresa);
    this.aberto.set(false);
  }

  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  labelPapel(papel: string): string {
    return ({ dono: 'Dono', socio: 'Sócio', contador: 'Contador' })[papel] ?? papel;
  }

  corIniciais(papel: string): string {
    return ({
      dono:     'bg-blue-500/10 text-blue-500 border-blue-500/20',
      socio:    'bg-purple-500/10 text-purple-500 border-purple-500/20',
      contador: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    })[papel] ?? '';
  }
}
