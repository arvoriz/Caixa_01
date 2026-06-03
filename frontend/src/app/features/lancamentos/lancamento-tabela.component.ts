import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { Lancamento } from '../../api/lancamentos-api.service';
import { formatarValor, formatarData, labelStatus, corStatus, corPontoStatus } from './lancamentos.helpers';

@Component({
  selector: 'app-lancamento-tabela',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: block; }'],
  template: `
    <div class="rounded-2xl border transition-colors shadow-sm overflow-hidden flex flex-col"
         [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="text-xs uppercase font-semibold transition-colors border-b"
                 [ngClass]="t.isDark() ? 'bg-[#18181b] text-gray-500 border-[#2a2a2c]' : 'bg-slate-50 text-slate-500 border-slate-200'">
            <tr>
              <th class="px-6 py-4">Descrição</th>
              <th class="px-6 py-4">Categoria</th>
              <th class="px-6 py-4">Vencimento</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Valor (R$)</th>
              <th class="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y transition-colors" [ngClass]="t.isDark() ? 'divide-[#2a2a2c]' : 'divide-slate-100'">
            @for (item of lancamentos; track item.id) {
              <tr class="transition-colors group" [ngClass]="t.isDark() ? 'hover:bg-[#18181b]' : 'hover:bg-slate-50'">
                <td class="px-6 py-4">
                  <span class="font-bold transition-colors" [ngClass]="t.isDark() ? 'text-gray-200' : 'text-slate-800'">{{ item.descricao }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                        [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-600'">
                    {{ item.categoria_nome || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-600'">{{ formatarData(item.data_vencimento) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
                        [ngClass]="corStatus(item.status)">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="corPontoStatus(item.status)"></span>
                    {{ labelStatus(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right font-bold text-base"
                    [ngClass]="item.tipo === 'entrada' ? 'text-green-500' : (t.isDark() ? 'text-gray-200' : 'text-slate-800')">
                  {{ item.tipo === 'entrada' ? '+' : '-' }} {{ formatarValor(item.valor) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="editar.emit(item)" title="Editar"
                            class="p-1.5 rounded-lg transition-colors"
                            [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#2a2a2c] hover:text-blue-500' : 'text-slate-400 hover:bg-slate-200 hover:text-blue-600'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button (click)="excluir.emit(item)" title="Excluir"
                            class="p-1.5 rounded-lg transition-colors"
                            [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#2a2a2c] hover:text-red-500' : 'text-slate-400 hover:bg-slate-200 hover:text-red-600'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LancamentoTabelaComponent {
  @Input() lancamentos: Lancamento[] = [];
  @Output() editar  = new EventEmitter<Lancamento>();
  @Output() excluir = new EventEmitter<Lancamento>();

  t = inject(ThemeService);

  formatarValor   = formatarValor;
  formatarData    = formatarData;
  labelStatus     = labelStatus;
  corStatus       = corStatus;
  corPontoStatus  = corPontoStatus;
}
