import { Component, inject, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { EmprestimosApiService, Emprestimo, StatusEmprestimo } from '../../api/emprestimos-api.service';
import { extrairErroApi } from '../../core/utils/erro-api';
import { formatarValor, formatarData, labelTipo, nomeCredor } from './emprestimos.helpers';
import { ScrollTopOnChangeDirective } from '../../shared/directives/scroll-to-top-on-change.directive';

@Component({
  selector: 'app-emprestimo-detalhes-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollTopOnChangeDirective],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="fechar($event)">
      <div class="w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <h3 class="text-lg font-bold">Detalhes do Empréstimo</h3>
          <button (click)="fechar()" class="p-1 rounded-lg transition-colors" [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6 overflow-y-auto" [appScrollTopOnChange]="erro()">

          @if (erro()) {
            <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
          }

          <!-- Info principal -->
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-xl font-bold text-blue-500">{{ loan.descricao || labelTipo(loan.tipo) }}</h4>
              <span class="px-2 py-0.5 rounded-md text-xs font-bold uppercase"
                    [ngClass]="loan.status === 'quitado' ? 'bg-green-500/10 text-green-500' : (loan.status === 'cancelado' ? 'bg-gray-500/10 text-gray-500' : 'bg-blue-500/10 text-blue-500')">
                {{ loan.status }}
              </span>
            </div>
            <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
              {{ labelTipo(loan.tipo) }} · Contratado em {{ formatarData(loan.data_contrato) }}
            </p>
          </div>

          <!-- Fluxo Visual Direcional -->
          <div class="flex items-center justify-between p-4 rounded-xl border" [ngClass]="t.isDark() ? 'border-[#2a2a2c] bg-[#18181b]' : 'border-slate-100 bg-slate-50'">
            <div class="text-center w-1/3">
              <p class="text-[10px] uppercase font-bold text-red-500 mb-1">Saiu de</p>
              <div class="w-8 h-8 mx-auto rounded flex items-center justify-center font-bold text-xs mb-1 border"
                   [ngClass]="t.isDark() ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-slate-200 text-slate-700 border-slate-300'">
                {{ sigla(nomeCredor(loan)) }}
              </div>
              <p class="font-medium text-xs truncate" [title]="nomeCredor(loan)">{{ nomeCredor(loan) }}</p>
            </div>

            <div class="flex-1 flex flex-col items-center px-2">
              <p class="text-xs font-bold mb-1" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ formatarValor(loan.valor) }}</p>
              <div class="w-full h-[2px] relative rounded-full" [ngClass]="t.isDark() ? 'bg-gray-700' : 'bg-slate-300'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute top-1/2 right-0 -translate-y-1/2 translate-x-1"
                     [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>

            <div class="text-center w-1/3">
              <p class="text-[10px] uppercase font-bold text-green-500 mb-1">Entrou em</p>
              <div class="w-8 h-8 mx-auto rounded bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs mb-1 border"
                   [ngClass]="t.isDark() ? 'border-blue-500/20' : 'border-blue-100'">
                {{ sigla(loan.empresa_destino_nome) }}
              </div>
              <p class="font-medium text-xs truncate" [title]="loan.empresa_destino_nome || ''">{{ loan.empresa_destino_nome || '—' }}</p>
            </div>
          </div>

          <!-- Progresso -->
          <div>
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-[10px] uppercase font-semibold" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Saldo devedor</span>
              <span class="text-sm font-bold" [ngClass]="loan.status === 'quitado' ? 'text-green-500' : ''">
                {{ formatarValor(loan.saldo_devedor) }} <span class="opacity-50 font-normal">/ {{ formatarValor(loan.valor) }}</span>
              </span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 rounded-full overflow-hidden" [ngClass]="t.isDark() ? 'bg-gray-800' : 'bg-slate-200'">
                <div class="h-full rounded-full transition-all duration-700" [ngClass]="loan.status === 'quitado' ? 'bg-green-500' : 'bg-blue-500'" [style.width.%]="loan.progresso"></div>
              </div>
              <span class="text-xs font-medium w-9 text-right" [ngClass]="loan.status === 'quitado' ? 'text-green-500' : (t.isDark() ? 'text-gray-400' : 'text-slate-500')">{{ loan.progresso }}%</span>
            </div>
          </div>

          <!-- Registrar pagamento (só ativo e com permissão de escrita) -->
          @if (editavel()) {
            <div class="p-4 rounded-xl border" [ngClass]="t.isDark() ? 'border-[#2a2a2c] bg-[#18181b]' : 'border-slate-100 bg-slate-50'">
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Registrar pagamento</label>
              <div class="flex gap-2">
                <input [(ngModel)]="valorPago" type="number" min="0" step="0.01" placeholder="0.00"
                       class="flex-1 text-sm rounded-xl px-4 py-2.5 border outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                       [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-white border-slate-200 text-slate-900'">
                <button (click)="pagar()" [disabled]="ocupado()"
                        class="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  Pagar
                </button>
              </div>
              <p class="text-xs mt-1.5 opacity-60" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                Reduz o saldo devedor. Quita automaticamente ao chegar a zero.
              </p>
            </div>
          }

          <!-- Edição da descrição (somente empréstimo ativo e com permissão) -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Descrição</label>
            <input [(ngModel)]="descricao" type="text" [disabled]="!editavel()"
                   class="w-full text-sm rounded-xl px-3 py-2 border outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-white border-slate-200 text-slate-900'">
          </div>

          @if (loan.status !== 'ativo') {
            <p class="text-xs" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
              Empréstimo {{ loan.status === 'quitado' ? 'quitado' : 'cancelado' }} — não pode mais ser modificado.
            </p>
          }
        </div>

        <!-- Footer -->
        <div class="p-6 border-t flex items-center transition-colors" [ngClass]="(editavel() ? 'justify-between' : 'justify-end') + ' ' + (t.isDark() ? 'border-[#2a2a2c] bg-[#121214]' : 'border-slate-100 bg-slate-50')">
          @if (editavel()) {
            <button (click)="cancelarEmprestimo()" [disabled]="ocupado()" class="text-sm font-medium text-red-500 hover:text-red-400 transition-colors disabled:opacity-60">Cancelar empréstimo</button>
          }
          <div class="flex gap-3">
            <button (click)="fechar()" class="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                    [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
              Fechar
            </button>
            @if (editavel()) {
              <button (click)="salvarEdicao()" [disabled]="ocupado()"
                      class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                Salvar Edição
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EmprestimoDetalhesModalComponent implements OnInit {
  @Input() emprestimo!: Emprestimo;
  @Output() fechado    = new EventEmitter<void>();
  @Output() atualizado = new EventEmitter<void>();

  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private api  = inject(EmprestimosApiService);

  loan!: Emprestimo;
  descricao = '';
  valorPago: number | null = null;
  ocupado = signal(false);
  erro    = signal('');
  estado  = signal<StatusEmprestimo>('ativo');

  // Empréstimo só é editável se estiver ativo e o usuário não for contador (somente leitura).
  editavel = computed(() => this.estado() === 'ativo' && !this.empresaAtiva.soLeitura());

  formatarValor = formatarValor;
  formatarData  = formatarData;
  labelTipo     = labelTipo;
  nomeCredor    = nomeCredor;

  ngOnInit() {
    this.loan = this.emprestimo;
    this.descricao = this.loan.descricao ?? '';
    this.estado.set(this.loan.status);
  }

  private get empresaId(): string | null {
    return this.empresaAtiva.ativa()?.id ?? null;
  }

  sigla(nome: string | null): string {
    if (!nome) return '—';
    return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  pagar() {
    const id = this.empresaId;
    if (!id) return;
    const v = Number(this.valorPago);
    if (!v || v <= 0) { this.erro.set('Informe um valor de pagamento maior que zero.'); return; }

    this.ocupado.set(true);
    this.erro.set('');
    this.api.registrarPagamento(id, this.loan.id, v).subscribe({
      next: (atualizado) => {
        this.loan = atualizado;
        this.estado.set(atualizado.status);
        this.valorPago = null;
        this.ocupado.set(false);
        this.atualizado.emit();
      },
      error: (err) => { this.erro.set(extrairErroApi(err, 'Erro ao registrar pagamento.')); this.ocupado.set(false); },
    });
  }

  salvarEdicao() {
    const id = this.empresaId;
    if (!id) return;
    this.ocupado.set(true);
    this.erro.set('');
    this.api.atualizar(id, this.loan.id, { descricao: this.descricao.trim() }).subscribe({
      next: () => { this.ocupado.set(false); this.atualizado.emit(); this.fechado.emit(); },
      error: (err) => { this.erro.set(extrairErroApi(err, 'Erro ao salvar.')); this.ocupado.set(false); },
    });
  }

  cancelarEmprestimo() {
    const id = this.empresaId;
    if (!id) return;
    if (!confirm('Cancelar este empréstimo? O saldo devedor pendente será desfeito e o contrato ficará como cancelado.')) return;
    this.ocupado.set(true);
    this.erro.set('');
    this.api.cancelar(id, this.loan.id).subscribe({
      next: () => { this.ocupado.set(false); this.atualizado.emit(); this.fechado.emit(); },
      error: (err) => { this.erro.set(extrairErroApi(err, 'Erro ao cancelar.')); this.ocupado.set(false); },
    });
  }

  fechar(event?: Event) {
    if (!event || event.target === event.currentTarget) this.fechado.emit();
  }
}
