import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { FluxoMes, DespesaCategoria } from '../../api/dashboard-api.service';
import { formatarValorCurto, CORES_CATEGORIA } from './dashboard.helpers';

@Component({
  selector: 'app-dashboard-graficos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Fluxo Mensal -->
      <div class="lg:col-span-2 p-6 my-3 rounded-2xl border transition-colors shadow-sm flex flex-col"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">Fluxo Mensal</h3>
          <div class="flex items-center gap-4 text-xs" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-green-500"></span> Receitas</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Despesas</span>
          </div>
        </div>
        <div class="flex-1 flex items-end justify-between gap-2 md:gap-4 h-48 border-b pb-2" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
          @for (mes of fluxo; track $index) {
            <div class="flex flex-col items-center w-full h-full justify-end group relative">
              <div class="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap z-10"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] text-gray-200 border border-[#2a2a2c]' : 'bg-white text-slate-700 border border-slate-200 shadow'">
                +{{ formatarValorCurto(mes.receita) }} / -{{ formatarValorCurto(mes.despesa) }}
              </div>
              <div class="w-full flex items-end justify-center gap-1 h-full">
                <div class="w-1/2 bg-green-500 rounded-t-sm hover:opacity-80 transition-all" [style.height.%]="altura(mes.receita)"></div>
                <div class="w-1/2 bg-red-500 rounded-t-sm hover:opacity-80 transition-all" [style.height.%]="altura(mes.despesa)"></div>
              </div>
            </div>
          }
        </div>
        <div class="flex justify-between text-xs mt-3 px-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
          @for (mes of fluxo; track $index) {
            <span class="w-full text-center" [class.font-bold]="mes.atual" [class.text-blue-500]="mes.atual">{{ mes.label }}</span>
          }
        </div>
      </div>

      <!-- Despesas por Categoria -->
      <div class="p-6 my-3 rounded-2xl border transition-colors shadow-sm flex flex-col"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <h3 class="font-bold text-lg mb-6">Despesas por Categoria</h3>
        @if (categorias.length === 0) {
          <div class="flex-1 flex items-center justify-center text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
            Sem despesas pagas neste mês.
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center">
            <div class="w-36 h-36 rounded-full relative flex items-center justify-center shadow-lg" [style.background]="gradiente">
              <div class="w-24 h-24 rounded-full absolute transition-colors duration-500" [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-white'"></div>
              <div class="z-10 flex flex-col items-center">
                <span class="text-xs" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Total</span>
                <span class="font-bold text-sm">{{ formatarValorCurto(totalDespesas) }}</span>
              </div>
            </div>
            <div class="w-full mt-6 space-y-3">
              @for (cat of categorias; track cat.nome; let i = $index) {
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-3 h-3 rounded-sm shrink-0" [style.background]="cor(i)"></div>
                    <span class="truncate" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-600'">{{ cat.nome || '—' }}</span>
                  </div>
                  <span class="font-medium shrink-0 ml-2">{{ cat.pct }}%</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardGraficosComponent {
  @Input() fluxo: FluxoMes[] = [];
  @Input() categorias: DespesaCategoria[] = [];

  t = inject(ThemeService);
  formatarValorCurto = formatarValorCurto;

  cor(i: number): string {
    return CORES_CATEGORIA[i % CORES_CATEGORIA.length];
  }

  altura(valor: string): number {
    const max = Math.max(
      ...this.fluxo.flatMap(m => [Number(m.receita), Number(m.despesa)]),
      1,
    );
    return Math.round((Number(valor) / max) * 100);
  }

  get totalDespesas(): number {
    return this.categorias.reduce((s, c) => s + Number(c.valor), 0);
  }

  get gradiente(): string {
    if (this.categorias.length === 0) return 'transparent';
    let acc = 0;
    const partes = this.categorias.map((c, i) => {
      const ini = acc;
      acc += c.pct;
      return `${this.cor(i)} ${ini}% ${acc}%`;
    });
    // completa eventual sobra por arredondamento com a última cor
    if (acc < 100) partes.push(`${this.cor(this.categorias.length - 1)} ${acc}% 100%`);
    return `conic-gradient(${partes.join(', ')})`;
  }
}
