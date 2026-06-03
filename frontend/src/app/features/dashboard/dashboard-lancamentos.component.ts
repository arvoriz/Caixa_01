import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-lancamentos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Alertas -->
      <div class="p-6 rounded-2xl border transition-colors shadow-sm"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex items-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
          <h3 class="font-bold text-lg">Atenção Necessária</h3>
        </div>
        <div class="space-y-4">
          @for (alerta of alertas; track alerta.descricao) {
            <div class="p-3 rounded-xl border flex items-start gap-3"
                 [ngClass]="alerta.urgente
                   ? 'border-red-500/20 bg-red-500/5'
                   : 'border-yellow-500/20 bg-yellow-500/5'">
              <div class="p-2 rounded-lg mt-0.5 shrink-0"
                   [ngClass]="alerta.urgente ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'"
                   [innerHTML]="alerta.icone"></div>
              <div>
                <p class="font-medium text-sm" [ngClass]="alerta.urgente ? 'text-red-500' : 'text-yellow-500'">
                  {{ alerta.status }}
                </p>
                <p class="text-xs my-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">
                  {{ alerta.descricao }}
                </p>
                <p class="font-bold text-sm">{{ alerta.valor }}</p>
              </div>
            </div>
          }
        </div>
        <button class="w-full mt-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
          Ver todas as contas a pagar &rarr;
        </button>
      </div>

      <!-- Últimas Transações -->
      <div class="lg:col-span-2 p-6 rounded-2xl border transition-colors shadow-sm"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">Últimas Transações</h3>
          <button class="text-sm text-blue-500 hover:text-blue-400 font-medium">Ver extrato</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase border-b transition-colors"
                   [ngClass]="t.isDark() ? 'text-gray-500 border-[#2a2a2c]' : 'text-slate-400 border-slate-200'">
              <tr>
                <th class="px-4 py-3 font-medium">Descrição</th>
                <th class="px-4 py-3 font-medium">Categoria</th>
                <th class="px-4 py-3 font-medium">Data</th>
                <th class="px-4 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of transacoes; track tx.descricao) {
                <tr class="border-b last:border-0 transition-colors"
                    [ngClass]="t.isDark() ? 'border-[#2a2a2c]/50 hover:bg-[#18181b]' : 'border-slate-100 hover:bg-slate-50'">
                  <td class="px-4 py-4 font-medium">{{ tx.descricao }}</td>
                  <td class="px-4 py-4">
                    <span class="px-2 py-1 rounded-md text-xs border transition-colors"
                          [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300' : 'border-slate-200 text-slate-600'">
                      {{ tx.categoria }}
                    </span>
                  </td>
                  <td class="px-4 py-4 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">{{ tx.data }}</td>
                  <td class="px-4 py-4 text-right font-bold" [ngClass]="tx.cor">{{ tx.valor }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardLancamentosComponent {
  t = inject(ThemeService);

  alertas = [
    {
      urgente: true, status: 'Vencido há 2 dias', descricao: 'Imposto Simples Nacional (DAS)', valor: 'R$ 4.520,00',
      icone: '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    },
    {
      urgente: false, status: 'Vence Hoje', descricao: 'Licença AWS Hosting', valor: 'R$ 850,00',
      icone: '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
    },
  ];

  transacoes = [
    { descricao: 'Consultoria Projeto X', categoria: 'Serviços',   data: 'Hoje, 10:45', valor: '+ R$ 12.500,00', cor: 'text-green-500' },
    { descricao: 'Conta de Energia',      categoria: 'Escritório', data: 'Ontem',       valor: '- R$ 450,00',    cor: 'text-red-500'   },
    { descricao: 'Mútuo Filial B',        categoria: 'Empréstimo', data: '10 Jun 2026', valor: '+ R$ 5.000,00',  cor: 'text-blue-500'  },
  ];
}
