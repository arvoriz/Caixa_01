import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { Lancamento } from '../../api/lancamentos-api.service';
import { formatarValor, formatarData, labelStatus, corStatus, corPontoStatus, infoParcela } from './lancamentos.helpers';

@Component({
  selector: 'app-lancamento-tabela',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: block; }'],
  template: `
    <div class="flex flex-col gap-4">
      @for (item of itensPaginados; track item.id) {
        <div (click)="editar.emit(item)"
             class="flex flex-col md:flex-row md:items-center p-5 rounded-2xl border transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.01]"
             [ngClass]="t.isDark()
               ? 'bg-[#121214] border-[#2a2a2c] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]'
               : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]'">

          <!-- Coluna 1: Ícone e Título -->
          <div class="flex items-center gap-4 w-full md:w-5/12 mb-4 md:mb-0">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                 [ngClass]="item.tipo === 'entrada'
                   ? (t.isDark() ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-green-50 border-green-200 text-green-600')
                   : (t.isDark() ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-red-50 border-red-200 text-red-600')">
              @if (item.tipo === 'entrada') {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
              }
            </div>
            <div class="min-w-0">
              <h4 class="font-bold text-base truncate" [ngClass]="t.isDark() ? 'text-gray-200' : 'text-slate-800'">{{ item.descricao }}</h4>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border shrink-0"
                      [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-400 bg-[#18181b]' : 'border-slate-200 text-slate-500 bg-white'">
                  {{ item.categoria_nome || '—' }}
                </span>
                @if (infoParcela(item, todosLancamentos); as parcela) {
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-500/10 text-blue-500 shrink-0">
                    Parcela {{ parcela }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Coluna 2: Vencimento e Status -->
          <div class="w-full md:w-4/12 md:px-6 mb-4 md:mb-0">
            <div class="flex justify-between items-center md:justify-start md:gap-6">
              <div>
                <p class="text-[10px] uppercase font-semibold mb-0.5" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Vencimento</p>
                <p class="text-sm font-mono" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ formatarData(item.data_vencimento) }}</p>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
                    [ngClass]="corStatus(item.status)">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="corPontoStatus(item.status)"></span>
                {{ labelStatus(item.status) }}
              </span>
            </div>
          </div>

          <!-- Coluna 3: Valor e Ações -->
          <div class="w-full md:w-3/12 flex items-center justify-between md:pl-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0 transition-colors"
               [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
            <div>
              <p class="text-[10px] uppercase font-semibold mb-0.5" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Valor</p>
              <p class="font-bold text-base"
                 [ngClass]="item.tipo === 'entrada' ? 'text-green-500' : (t.isDark() ? 'text-gray-200' : 'text-slate-800')">
                {{ item.tipo === 'entrada' ? '+' : '-' }} {{ formatarValor(item.valor) }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              @if (item.status !== 'cancelado' && !empresaAtiva.soLeitura()) {
                <button (click)="$event.stopPropagation(); cancelar.emit(item)" title="Cancelar"
                        class="p-2 rounded-lg transition-colors"
                        [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#2a2a2c] hover:text-red-500' : 'text-slate-400 hover:bg-slate-100 hover:text-red-600'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Paginação -->
    @if (lancamentos.length > 0) {
      <div class="flex items-center justify-between mt-4 pt-4 border-t" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
        <div class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
          Mostrando <span class="font-medium text-blue-500">{{ ((paginaAtual - 1) * itemsPerPage) + 1 }}</span>
          a <span class="font-medium text-blue-500">{{ exibindoFim }}</span>
          de <span class="font-medium">{{ lancamentos.length }}</span> resultados
        </div>
        <div class="flex gap-2">
          <button (click)="paginaAnterior()" [disabled]="paginaAtual === 1"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300 hover:bg-[#202024]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
            Anterior
          </button>
          <button (click)="proximaPagina()" [disabled]="paginaAtual === totalPaginas"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300 hover:bg-[#202024]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
            Próximo
          </button>
        </div>
      </div>
    }
  `,
})
export class LancamentoTabelaComponent implements OnChanges {
  @Input() lancamentos: Lancamento[] = [];
  @Input() todosLancamentos: Lancamento[] = [];
  @Output() editar   = new EventEmitter<Lancamento>();
  @Output() cancelar = new EventEmitter<Lancamento>();

  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);

  itemsPerPage = 8;
  paginaAtual  = 1;

  formatarValor   = formatarValor;
  formatarData    = formatarData;
  labelStatus     = labelStatus;
  corStatus       = corStatus;
  corPontoStatus  = corPontoStatus;
  infoParcela     = infoParcela;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lancamentos']) this.paginaAtual = 1;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.lancamentos.length / this.itemsPerPage));
  }

  get itensPaginados(): Lancamento[] {
    const inicio = (this.paginaAtual - 1) * this.itemsPerPage;
    return this.lancamentos.slice(inicio, inicio + this.itemsPerPage);
  }

  get exibindoFim(): number {
    return Math.min(this.paginaAtual * this.itemsPerPage, this.lancamentos.length);
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) this.paginaAtual++;
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) this.paginaAtual--;
  }
}
