import { Component } from '@angular/core';
import { DashboardKpisComponent } from './dashboard-kpis.component';
import { DashboardGraficosComponent } from './dashboard-graficos.component';
import { DashboardLancamentosComponent } from './dashboard-lancamentos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardKpisComponent, DashboardGraficosComponent, DashboardLancamentosComponent],
  template: `
    <div class="p-6 lg:p-10 space-y-8">
      <div>
        <h1 class="text-2xl font-bold mb-1">Visão Geral</h1>
        <p class="text-sm text-gray-500">Acompanhe a saúde financeira da empresa selecionada neste mês.</p>
      </div>
      <app-dashboard-kpis />
      <app-dashboard-graficos />
      <app-dashboard-lancamentos />
    </div>
  `,
})
export class DashboardComponent {}
