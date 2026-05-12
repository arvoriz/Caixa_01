import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 lg:p-10">

      <!-- Título -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-1">Visão Geral</h1>
        <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
          Acompanhe a saúde financeira da empresa selecionada neste mês.
        </p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <!-- Saldo -->
        <div class="p-6 rounded-2xl border transition-colors shadow-sm"
             [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Saldo Atual em Caixa</p>
              <h3 class="text-2xl font-bold">R$ 45.230,00</h3>
            </div>
            <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
            </div>
          </div>
          <p class="text-xs text-green-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            12.5% em relação ao mês anterior
          </p>
        </div>

        <!-- Receitas -->
        <div class="p-6 rounded-2xl border transition-colors shadow-sm"
             [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Receitas (Mês)</p>
              <h3 class="text-2xl font-bold text-green-500">R$ 82.400,00</h3>
            </div>
            <div class="p-2 rounded-lg bg-green-500/10 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 9-11 9 11"/></svg>
            </div>
          </div>
          <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">R$ 15.000 a receber</p>
        </div>

        <!-- Despesas -->
        <div class="p-6 rounded-2xl border transition-colors shadow-sm"
             [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Despesas (Mês)</p>
              <h3 class="text-2xl font-bold text-red-500">R$ 38.150,00</h3>
            </div>
            <div class="p-2 rounded-lg bg-red-500/10 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 9 11 9-11"/></svg>
            </div>
          </div>
          <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">R$ 8.200 pagos hoje</p>
        </div>

        <!-- Mútuo -->
        <div class="p-6 rounded-2xl border transition-colors shadow-sm"
             [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm font-medium mb-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Mútuo a Receber</p>
              <h3 class="text-2xl font-bold text-blue-500">R$ 12.000,00</h3>
            </div>
            <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 21h8"/><path d="M12 17v4"/><path d="m10 13 2 2 2-2"/><path d="M12 15V8"/>
                <path d="M18 4v4"/><path d="M6 4v4"/><rect width="20" height="8" x="2" y="4" rx="2"/>
              </svg>
            </div>
          </div>
          <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Da filial: Comercial Ltda</p>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

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
                       [ngClass]="mes.atual ? 'shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''"
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
              <span [ngClass]="mes.atual ? 'font-bold text-blue-500' : ''">{{ mes.label }}</span>
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

      <!-- Alertas + Transações -->
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
            <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
              <div class="p-2 rounded-lg bg-red-500/20 text-red-500 mt-0.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <p class="font-medium text-sm text-red-500">Vencido há 2 dias</p>
                <p class="text-xs my-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">Imposto Simples Nacional (DAS)</p>
                <p class="font-bold text-sm">R$ 4.520,00</p>
              </div>
            </div>
            <div class="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
              <div class="p-2 rounded-lg bg-yellow-500/20 text-yellow-500 mt-0.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                  <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
                  <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-sm text-yellow-500">Vence Hoje</p>
                <p class="text-xs my-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">Licença AWS Hosting</p>
                <p class="font-bold text-sm">R$ 850,00</p>
              </div>
            </div>
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

    </div>
  `,
})
export class DashboardComponent {
  t    = inject(ThemeService);
  auth = inject(AuthService);

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

  transacoes = [
    { descricao: 'Consultoria Projeto X', categoria: 'Serviços',    data: 'Hoje, 10:45',  valor: '+ R$ 12.500,00', cor: 'text-green-500' },
    { descricao: 'Conta de Energia',      categoria: 'Escritório',  data: 'Ontem',        valor: '- R$ 450,00',    cor: 'text-red-500'   },
    { descricao: 'Mútuo Filial B',        categoria: 'Empréstimo',  data: '10 Jun 2026',  valor: '+ R$ 5.000,00',  cor: 'text-blue-500'  },
  ];
}
