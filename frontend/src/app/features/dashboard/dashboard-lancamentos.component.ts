import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AlertaConta, TransacaoRecente } from '../../api/dashboard-api.service';
import { formatarValor, formatarData } from './dashboard.helpers';

@Component({
  selector: 'app-dashboard-lancamentos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Alertas -->
      <div class="p-6 my-3 rounded-2xl border transition-colors shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex items-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <h3 class="font-bold text-lg">Atenção Necessária</h3>
        </div>

        @if (alertas.length === 0) {
          <div class="py-10 text-center text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
            Nenhuma conta vencida ou vencendo nos próximos dias. 🎉
          </div>
        } @else {
          <div class="space-y-4">
            @for (a of alertas; track a.id) {
              <div class="p-3 rounded-xl border flex items-start gap-3"
                   [ngClass]="a.dias_atraso > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5'">
                <div class="p-2 rounded-lg mt-0.5 shrink-0" [ngClass]="a.dias_atraso > 0 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-sm" [ngClass]="a.dias_atraso > 0 ? 'text-red-500' : 'text-yellow-500'">{{ statusAlerta(a) }}</p>
                  <p class="text-xs my-1 transition-colors truncate" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ a.descricao }}</p>
                  <p class="font-bold text-sm">{{ formatarValor(a.valor) }}</p>
                </div>
              </div>
            }
          </div>
        }
        <a routerLink="/relatorios" class="block w-full mt-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors text-center">
          Ver contas a pagar e receber &rarr;
        </a>
      </div>

      <!-- Últimas Transações -->
      <div class="lg:col-span-2 p-6 my-3 rounded-2xl border transition-colors shadow-sm" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">Últimas Transações</h3>
          <a routerLink="/lancamentos" class="text-sm text-blue-500 hover:text-blue-400 font-medium">Ver extrato</a>
        </div>

        @if (transacoes.length === 0) {
          <div class="py-12 text-center text-sm" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
            Nenhum lançamento registrado ainda.
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs uppercase border-b transition-colors" [ngClass]="t.isDark() ? 'text-gray-500 border-[#2a2a2c]' : 'text-slate-400 border-slate-200'">
                <tr>
                  <th class="px-4 py-3 font-medium">Descrição</th>
                  <th class="px-4 py-3 font-medium">Categoria</th>
                  <th class="px-4 py-3 font-medium">Data</th>
                  <th class="px-4 py-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of transacoes; track tx.id) {
                  <tr class="border-b last:border-0 transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]/50 hover:bg-[#18181b]' : 'border-slate-100 hover:bg-slate-50'">
                    <td class="px-4 py-4 font-medium" [ngClass]="t.isDark() ? 'text-gray-200' : 'text-slate-800'">{{ tx.descricao }}</td>
                    <td class="px-4 py-4">
                      <span class="px-2 py-1 rounded-md text-xs border transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300' : 'border-slate-200 text-slate-600'">{{ tx.categoria || '—' }}</span>
                    </td>
                    <td class="px-4 py-4 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">{{ formatarData(tx.data) }}</td>
                    <td class="px-4 py-4 text-right font-bold" [ngClass]="tx.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'">
                      {{ tx.tipo === 'entrada' ? '+' : '-' }} {{ formatarValor(tx.valor) }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardLancamentosComponent {
  @Input() alertas: AlertaConta[] = [];
  @Input() transacoes: TransacaoRecente[] = [];

  t = inject(ThemeService);
  formatarValor = formatarValor;
  formatarData  = formatarData;

  statusAlerta(a: AlertaConta): string {
    if (a.dias_atraso > 0) return `Vencido há ${a.dias_atraso} dia(s)`;
    if (a.vence_hoje)      return 'Vence hoje';
    return 'Vence em breve';
  }
}
