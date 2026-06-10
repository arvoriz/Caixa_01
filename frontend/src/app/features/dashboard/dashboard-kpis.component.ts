import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardResumo } from '../../api/dashboard-api.service';
import { formatarValor } from './dashboard.helpers';

@Component({
  selector: 'app-dashboard-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <!-- Saldo -->
      <div class="p-6 my-3 rounded-2xl border transition-colors shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Saldo Atual em Caixa</p>
            <h3 class="text-2xl font-bold">{{ formatarValor(data.saldo_atual) }}</h3>
          </div>
          <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
        </div>
        <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Resultado do mês: {{ formatarValor(resultadoMes) }}</p>
      </div>

      <!-- Receitas -->
      <div class="p-6 my-3 rounded-2xl border transition-colors shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Receitas (Mês)</p>
            <h3 class="text-2xl font-bold text-green-500">{{ formatarValor(data.receitas_mes) }}</h3>
          </div>
          <div class="p-2 rounded-lg bg-green-500/10 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 9-11 9 11"/></svg>
          </div>
        </div>
        <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">{{ formatarValor(data.a_receber) }} a receber</p>
      </div>

      <!-- Despesas -->
      <div class="p-6 my-3 rounded-2xl border transition-colors shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Despesas (Mês)</p>
            <h3 class="text-2xl font-bold text-red-500">{{ formatarValor(data.despesas_mes) }}</h3>
          </div>
          <div class="p-2 rounded-lg bg-red-500/10 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 9 11 9-11"/></svg>
          </div>
        </div>
        <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">{{ formatarValor(data.a_pagar) }} a pagar</p>
      </div>

      <!-- Mútuo a receber -->
      <div class="p-6 my-3 rounded-2xl border transition-colors shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Mútuo a Receber</p>
            <h3 class="text-2xl font-bold text-blue-500">{{ formatarValor(data.mutuo_a_receber) }}</h3>
          </div>
          <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="m10 13 2 2 2-2"/><path d="M12 15V8"/><path d="M18 4v4"/><path d="M6 4v4"/><rect width="20" height="8" x="2" y="4" rx="2"/></svg>
          </div>
        </div>
        <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Empréstimos entre suas empresas</p>
      </div>

    </div>
  `,
})
export class DashboardKpisComponent {
  @Input() data!: DashboardResumo;
  t = inject(ThemeService);
  formatarValor = formatarValor;

  get resultadoMes(): number {
    return Number(this.data.receitas_mes) - Number(this.data.despesas_mes);
  }
}
