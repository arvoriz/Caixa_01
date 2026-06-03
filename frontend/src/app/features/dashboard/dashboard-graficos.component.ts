import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-graficos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Fluxo Mensal -->
      <div class="lg:col-span-2 p-6 rounded-2xl border transition-colors shadow-sm flex flex-col"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">Fluxo Mensal</h3>
          <select class="text-sm bg-transparent border-none outline-none font-medium cursor-pointer"
                  [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
            <option>Últimos 6 meses</option>
            <option>Este ano</option>
          </select>
        </div>
        <div class="flex-1 flex items-end justify-between gap-2 md:gap-4 h-48 border-b pb-2"
             [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
          @for (mes of meses; track mes.label) {
            <div class="flex flex-col items-center w-full">
              <div class="w-full flex items-end justify-center gap-1">
                <div class="w-1/2 bg-green-500 rounded-t-sm hover:opacity-80 transition-opacity"
                     [class.shadow-[0_0_8px_rgba(34,197,94,0.5)]]="mes.atual"
                     [style.height]="mes.receita + '%'"></div>
                <div class="w-1/2 bg-red-500 rounded-t-sm hover:opacity-80 transition-opacity"
                     [style.height]="mes.despesa + '%'"></div>
              </div>
            </div>
          }
        </div>
        <div class="flex justify-between text-xs mt-3 px-1 transition-colors"
             [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
          @for (mes of meses; track mes.label) {
            <span [class.font-bold]="mes.atual" [class.text-blue-500]="mes.atual">{{ mes.label }}</span>
          }
        </div>
      </div>

      <!-- Despesas por Categoria -->
      <div class="p-6 rounded-2xl border transition-colors shadow-sm flex flex-col"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <h3 class="font-bold text-lg mb-6">Despesas por Categoria</h3>
        <div class="flex-1 flex flex-col items-center justify-center">
          <div class="w-36 h-36 rounded-full relative flex items-center justify-center shadow-lg"
               style="background: conic-gradient(#ef4444 0% 40%, #eab308 40% 65%, #3b82f6 65% 85%, #8b5cf6 85% 100%);">
            <div class="w-24 h-24 rounded-full absolute transition-colors duration-500"
                 [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-white'"></div>
            <div class="z-10 flex flex-col items-center">
              <span class="text-xs" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Total</span>
              <span class="font-bold text-sm">R$ 38k</span>
            </div>
          </div>
          <div class="w-full mt-6 space-y-3">
            @for (cat of categorias; track cat.label) {
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-sm" [ngClass]="cat.cor"></div>
                  <span [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-600'">{{ cat.label }}</span>
                </div>
                <span class="font-medium">{{ cat.pct }}%</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardGraficosComponent {
  t = inject(ThemeService);

  meses = [
    { label: 'Jan', receita: 60, despesa: 40, atual: false },
    { label: 'Fev', receita: 75, despesa: 50, atual: false },
    { label: 'Mar', receita: 40, despesa: 70, atual: false },
    { label: 'Abr', receita: 90, despesa: 60, atual: false },
    { label: 'Mai', receita: 80, despesa: 45, atual: false },
    { label: 'Jun', receita: 50, despesa: 25, atual: true  },
  ];

  categorias = [
    { label: 'Folha de Pgto.', cor: 'bg-red-500',    pct: 40 },
    { label: 'Impostos',       cor: 'bg-yellow-500', pct: 25 },
    { label: 'Software/SaaS',  cor: 'bg-blue-500',   pct: 20 },
    { label: 'Escritório',     cor: 'bg-purple-500', pct: 15 },
  ];
}
