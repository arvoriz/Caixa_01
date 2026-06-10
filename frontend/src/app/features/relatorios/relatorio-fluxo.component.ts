import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { RelatorioFluxoCaixa } from '../../api/relatorios-api.service';
import { formatarValor } from './relatorios.helpers';

@Component({
  selector: 'app-relatorio-fluxo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- KPIs verticais -->
      <div class="lg:col-span-1 space-y-4">
        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <p class="text-xs uppercase font-bold tracking-wider mb-1" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Saldo Inicial</p>
          <h3 class="text-2xl font-bold">{{ formatarValor(data.saldo_inicial) }}</h3>
        </div>

        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-xs uppercase font-bold tracking-wider mb-1 text-green-500">Entradas</p>
              <h3 class="text-xl font-bold text-green-500">+ {{ formatarValor(data.entradas_total) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 9-11 9 11"/></svg>
            </div>
          </div>
          <div class="flex items-center justify-between border-t pt-4 mt-2" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
            <div>
              <p class="text-xs uppercase font-bold tracking-wider mb-1 text-red-500">Saídas</p>
              <h3 class="text-xl font-bold text-red-500">- {{ formatarValor(data.saidas_total) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 9 11 9-11"/></svg>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-blue-600 text-white shadow-lg">
          <p class="text-xs uppercase font-bold tracking-wider mb-1 text-blue-200">Saldo Final (Calculado)</p>
          <h3 class="text-3xl font-bold">{{ formatarValor(data.saldo_final) }}</h3>
        </div>
      </div>

      <!-- Demonstrativo por categoria -->
      <div class="lg:col-span-2 rounded-3xl border shadow-sm overflow-hidden flex flex-col" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="p-5 border-b" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <h3 class="font-bold">Demonstrativo por Categoria</h3>
        </div>
        <div class="flex-1 overflow-auto">
          <table class="w-full text-sm text-left min-w-[420px]">
            <tbody>
              <tr class="bg-green-500/5">
                <td colspan="2" class="px-6 py-3 text-xs font-bold text-green-600 uppercase tracking-wider">Receitas (+)</td>
              </tr>
              @if (data.entradas.length === 0) {
                <tr><td colspan="2" class="px-6 py-3.5 text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Nenhuma entrada no período.</td></tr>
              }
              @for (cat of data.entradas; track cat.nome) {
                <tr class="border-b" [ngClass]="t.isDark() ? 'border-[#2a2a2c]/50' : 'border-slate-50'">
                  <td class="px-6 py-3.5 font-medium" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ cat.nome || '—' }}</td>
                  <td class="px-6 py-3.5 text-right font-bold text-green-500">{{ formatarValor(cat.valor) }}</td>
                </tr>
              }
              <tr class="bg-red-500/5">
                <td colspan="2" class="px-6 py-3 text-xs font-bold text-red-600 uppercase tracking-wider">Despesas (-)</td>
              </tr>
              @if (data.saidas.length === 0) {
                <tr><td colspan="2" class="px-6 py-3.5 text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Nenhuma saída no período.</td></tr>
              }
              @for (cat of data.saidas; track cat.nome) {
                <tr class="border-b" [ngClass]="t.isDark() ? 'border-[#2a2a2c]/50' : 'border-slate-50'">
                  <td class="px-6 py-3.5 font-medium" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ cat.nome || '—' }}</td>
                  <td class="px-6 py-3.5 text-right font-bold text-red-500">{{ formatarValor(cat.valor) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class RelatorioFluxoComponent {
  @Input() data!: RelatorioFluxoCaixa;
  t = inject(ThemeService);
  formatarValor = formatarValor;
}
