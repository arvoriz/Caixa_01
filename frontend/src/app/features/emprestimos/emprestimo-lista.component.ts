import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { Emprestimo } from '../../api/emprestimos-api.service';
import { formatarValor, labelTipo, labelStatus, corIconeTipo, nomeCredor } from './emprestimos.helpers';

@Component({
  selector: 'app-emprestimo-lista',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: block; }'],
  template: `
    <div class="flex flex-col gap-4">
      @for (loan of itensPaginados; track loan.id) {
        <div (click)="abrir.emit(loan)"
             class="flex flex-col md:flex-row md:items-center p-5 rounded-2xl border transition-all duration-300 shadow-sm cursor-pointer group hover:scale-[1.01]"
             [ngClass]="t.isDark()
               ? 'bg-[#121214] border-[#2a2a2c] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]'
               : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]'">

          <!-- Coluna 1: Ícone e Título -->
          <div class="flex items-center gap-4 w-full md:w-5/12 mb-4 md:mb-0">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                 [ngClass]="corIconeTipo(loan.tipo, t.isDark())">
              @if (loan.tipo === 'banco') {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              } @else if (loan.tipo === 'pessoa') {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="m10 13 2 2 2-2"/><path d="M12 15V8"/><path d="M18 4v4"/><path d="M6 4v4"/><rect width="20" height="8" x="2" y="4" rx="2"/></svg>
              }
            </div>
            <div class="min-w-0">
              <h4 class="font-bold text-base group-hover:text-blue-500 transition-colors truncate"
                  [ngClass]="t.isDark() ? 'text-gray-200' : 'text-slate-800'">
                {{ loan.descricao || labelTipo(loan.tipo) }}
              </h4>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border shrink-0"
                      [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-400 bg-[#18181b]' : 'border-slate-200 text-slate-500 bg-white'">
                  {{ labelTipo(loan.tipo) }}
                </span>
                <span class="text-xs truncate transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
                  Credor: {{ nomeCredor(loan) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Valor original e Progresso -->
          <div class="w-full md:w-4/12 md:px-6 mb-4 md:mb-0">
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-[10px] uppercase font-semibold transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Progresso</span>
              <span class="text-xs font-bold">{{ formatarValor(loan.valor) }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 rounded-full overflow-hidden transition-colors" [ngClass]="t.isDark() ? 'bg-gray-800' : 'bg-slate-200'">
                <div class="h-full rounded-full transition-all duration-1000"
                     [ngClass]="loan.status === 'quitado' ? 'bg-green-500' : 'bg-blue-500'"
                     [style.width.%]="loan.progresso"></div>
              </div>
              <span class="text-xs font-medium w-9 text-right"
                    [ngClass]="loan.status === 'quitado' ? 'text-green-500' : (t.isDark() ? 'text-gray-400' : 'text-slate-500')">
                {{ loan.progresso }}%
              </span>
            </div>
          </div>

          <!-- Coluna 3: Falta pagar e seta -->
          <div class="w-full md:w-3/12 flex items-center justify-between md:pl-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0 transition-colors"
               [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
            <div>
              <p class="text-[10px] uppercase font-semibold mb-0.5 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Falta Pagar</p>
              <p class="font-bold text-sm"
                 [ngClass]="loan.status === 'quitado' ? 'text-green-500' : (t.isDark() ? 'text-gray-200' : 'text-slate-800')">
                {{ loan.status === 'quitado' ? 'Quitado' : formatarValor(loan.saldo_devedor) }}
              </p>
            </div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-colors group-hover:text-blue-500"
                   [ngClass]="t.isDark() ? 'text-gray-600' : 'text-slate-300'"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Paginação -->
    @if (emprestimos.length > 0) {
      <div class="flex items-center justify-between mt-4 pt-4 border-t" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
        <div class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
          Mostrando <span class="font-medium text-blue-500">{{ ((paginaAtual - 1) * itemsPerPage) + 1 }}</span>
          a <span class="font-medium text-blue-500">{{ exibindoFim }}</span>
          de <span class="font-medium">{{ emprestimos.length }}</span> resultados
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
export class EmprestimoListaComponent implements OnChanges {
  @Input() emprestimos: Emprestimo[] = [];
  @Output() abrir = new EventEmitter<Emprestimo>();

  t = inject(ThemeService);

  itemsPerPage = 8;
  paginaAtual  = 1;

  formatarValor = formatarValor;
  labelTipo     = labelTipo;
  labelStatus   = labelStatus;
  corIconeTipo  = corIconeTipo;
  nomeCredor    = nomeCredor;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['emprestimos']) this.paginaAtual = 1;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.emprestimos.length / this.itemsPerPage));
  }

  get itensPaginados(): Emprestimo[] {
    const inicio = (this.paginaAtual - 1) * this.itemsPerPage;
    return this.emprestimos.slice(inicio, inicio + this.itemsPerPage);
  }

  get exibindoFim(): number {
    return Math.min(this.paginaAtual * this.itemsPerPage, this.emprestimos.length);
  }

  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }
}
