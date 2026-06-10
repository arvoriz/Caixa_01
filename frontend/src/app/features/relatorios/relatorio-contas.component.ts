import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { RelatorioContas } from '../../api/relatorios-api.service';
import { formatarValor, formatarData } from './relatorios.helpers';

@Component({
  selector: 'app-relatorio-contas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <p class="text-xs uppercase font-bold text-red-500 mb-1">Inadimplência (Atrasados)</p>
          <h3 class="text-2xl font-bold text-red-500">{{ formatarValor(data.inadimplencia) }}</h3>
        </div>
        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <p class="text-xs uppercase font-bold text-yellow-500 mb-1">A Pagar (Abertos)</p>
          <h3 class="text-2xl font-bold">{{ formatarValor(data.a_pagar) }}</h3>
        </div>
        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <p class="text-xs uppercase font-bold text-green-500 mb-1">A Receber (Previsão)</p>
          <h3 class="text-2xl font-bold">{{ formatarValor(data.a_receber) }}</h3>
        </div>
      </div>

      <!-- Lista -->
      <div class="rounded-3xl border shadow-sm overflow-hidden" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase border-b" [ngClass]="t.isDark() ? 'text-gray-500 border-[#2a2a2c]' : 'text-slate-400 border-slate-200'">
              <tr>
                <th class="px-6 py-3">Descrição</th>
                <th class="px-6 py-3">Categoria</th>
                <th class="px-6 py-3">Tipo</th>
                <th class="px-6 py-3">Vencimento</th>
                <th class="px-6 py-3">Atraso</th>
                <th class="px-6 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              @if (data.itens.length === 0) {
                <tr><td colspan="6" class="px-6 py-8 text-center text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Nenhuma conta em aberto.</td></tr>
              }
              @for (item of data.itens; track item.id) {
                <tr class="border-b transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]/50 hover:bg-[#18181b]' : 'border-slate-100 hover:bg-slate-50'">
                  <td class="px-6 py-3.5 font-medium" [ngClass]="t.isDark() ? 'text-gray-200' : 'text-slate-800'">{{ item.descricao }}</td>
                  <td class="px-6 py-3.5">
                    <span class="px-2 py-1 rounded-md text-xs border" [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300' : 'border-slate-200 text-slate-600'">{{ item.categoria || '—' }}</span>
                  </td>
                  <td class="px-6 py-3.5">
                    <span class="text-xs font-bold" [ngClass]="item.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'">
                      {{ item.tipo === 'entrada' ? 'A receber' : 'A pagar' }}
                    </span>
                  </td>
                  <td class="px-6 py-3.5" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">{{ formatarData(item.data_vencimento) }}</td>
                  <td class="px-6 py-3.5">
                    @if (item.dias_atraso > 0) {
                      <span class="px-2 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-500">{{ item.dias_atraso }} dia(s)</span>
                    } @else {
                      <span class="text-xs" [ngClass]="t.isDark() ? 'text-gray-600' : 'text-slate-400'">Em dia</span>
                    }
                  </td>
                  <td class="px-6 py-3.5 text-right font-bold" [ngClass]="item.tipo === 'entrada' ? 'text-green-500' : (t.isDark() ? 'text-gray-200' : 'text-slate-900')">
                    {{ formatarValor(item.valor) }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class RelatorioContasComponent {
  @Input() data!: RelatorioContas;
  t = inject(ThemeService);
  formatarValor = formatarValor;
  formatarData  = formatarData;
}
