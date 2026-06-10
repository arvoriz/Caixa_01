import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { RelatorioIntercompany } from '../../api/relatorios-api.service';
import { formatarValor } from './relatorios.helpers';

@Component({
  selector: 'app-relatorio-intercompany',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <p class="text-xs uppercase font-bold text-green-500 mb-1">Têm a receber (você é credor)</p>
          <h3 class="text-2xl font-bold text-green-500">{{ formatarValor(data.total_a_receber) }}</h3>
        </div>
        <div class="p-6 rounded-3xl border shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <p class="text-xs uppercase font-bold text-red-500 mb-1">Tem a pagar (você é devedor)</p>
          <h3 class="text-2xl font-bold text-red-500">{{ formatarValor(data.total_a_pagar) }}</h3>
        </div>
        <div class="p-6 rounded-3xl shadow-lg" [ngClass]="Number(data.saldo_liquido) >= 0 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'">
          <p class="text-xs uppercase font-bold tracking-wider mb-1 opacity-80">Saldo líquido</p>
          <h3 class="text-2xl font-bold">{{ formatarValor(data.saldo_liquido) }}</h3>
        </div>
      </div>

      <!-- Lista de contratos -->
      <div class="rounded-3xl border shadow-sm overflow-hidden" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase border-b" [ngClass]="t.isDark() ? 'text-gray-500 border-[#2a2a2c]' : 'text-slate-400 border-slate-200'">
              <tr>
                <th class="px-6 py-3">Credor (origem)</th>
                <th class="px-6 py-3">Devedor (destino)</th>
                <th class="px-6 py-3">Valor</th>
                <th class="px-6 py-3">Progresso</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3 text-right">Saldo devedor</th>
              </tr>
            </thead>
            <tbody>
              @if (data.contratos.length === 0) {
                <tr><td colspan="6" class="px-6 py-8 text-center text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Nenhum mútuo registrado.</td></tr>
              }
              @for (c of data.contratos; track c.id) {
                <tr class="border-b transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]/50 hover:bg-[#18181b]' : 'border-slate-100 hover:bg-slate-50'">
                  <td class="px-6 py-3.5 font-medium" [ngClass]="t.isDark() ? 'text-gray-200' : 'text-slate-800'">{{ c.empresa_origem_nome || '—' }}</td>
                  <td class="px-6 py-3.5" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ c.empresa_destino_nome || '—' }}</td>
                  <td class="px-6 py-3.5 font-medium">{{ formatarValor(c.valor) }}</td>
                  <td class="px-6 py-3.5">
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-1.5 rounded-full overflow-hidden" [ngClass]="t.isDark() ? 'bg-gray-800' : 'bg-slate-200'">
                        <div class="h-full rounded-full" [ngClass]="c.status === 'quitado' ? 'bg-green-500' : 'bg-blue-500'" [style.width.%]="c.progresso"></div>
                      </div>
                      <span class="text-xs">{{ c.progresso }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-3.5">
                    <span class="px-2 py-1 rounded-md text-xs font-bold uppercase"
                          [ngClass]="c.status === 'quitado' ? 'bg-green-500/10 text-green-500' : (c.status === 'cancelado' ? 'bg-gray-500/10 text-gray-500' : 'bg-blue-500/10 text-blue-500')">
                      {{ c.status }}
                    </span>
                  </td>
                  <td class="px-6 py-3.5 text-right font-bold" [ngClass]="c.status === 'quitado' ? 'text-green-500' : (t.isDark() ? 'text-gray-200' : 'text-slate-900')">
                    {{ formatarValor(c.saldo_devedor) }}
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
export class RelatorioIntercompanyComponent {
  @Input() data!: RelatorioIntercompany;
  t = inject(ThemeService);
  formatarValor = formatarValor;
  Number = Number;
}
