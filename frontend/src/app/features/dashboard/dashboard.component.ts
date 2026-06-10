import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { DashboardApiService, DashboardResumo } from '../../api/dashboard-api.service';
import { DashboardKpisComponent } from './dashboard-kpis.component';
import { DashboardGraficosComponent } from './dashboard-graficos.component';
import { DashboardLancamentosComponent } from './dashboard-lancamentos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardKpisComponent, DashboardGraficosComponent, DashboardLancamentosComponent],
  template: `
    <div class="p-6 lg:p-10 space-y-8">
      <div>
        <h1 class="text-2xl font-bold mb-1">Visão Geral</h1>
        <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
          Acompanhe a saúde financeira de
          <span class="font-medium">{{ empresaAtiva.ativa()?.nome_fantasia || empresaAtiva.ativa()?.razao_social || 'sua empresa' }}</span>
          neste mês.
        </p>
      </div>

      @if (!empresaAtiva.ativa()) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Selecione uma empresa no topo para ver o painel.
          </p>
        </div>
      } @else if (carregando()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="p-6 rounded-2xl border animate-pulse h-32" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"></div>
          }
        </div>
        <div class="rounded-2xl border animate-pulse h-72" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"></div>
      } @else if (erro()) {
        <div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
      } @else if (resumo()) {
        <app-dashboard-kpis [data]="resumo()!" />
        <app-dashboard-graficos [fluxo]="resumo()!.fluxo_mensal" [categorias]="resumo()!.despesas_categoria" />
        <app-dashboard-lancamentos [alertas]="resumo()!.alertas" [transacoes]="resumo()!.ultimas_transacoes" />
      }
    </div>
  `,
})
export class DashboardComponent {
  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private api  = inject(DashboardApiService);

  resumo     = signal<DashboardResumo | null>(null);
  carregando = signal(false);
  erro       = signal('');

  constructor() {
    effect(() => {
      const emp = this.empresaAtiva.ativa();
      if (emp) this.carregar(emp.id);
    }, { allowSignalWrites: true });
  }

  private carregar(empresaId: string) {
    this.carregando.set(true);
    this.erro.set('');
    this.api.resumo(empresaId).subscribe({
      next: data => { this.resumo.set(data); this.carregando.set(false); },
      error: ()  => { this.erro.set('Erro ao carregar o painel.'); this.carregando.set(false); },
    });
  }
}
