import { Component, inject, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { Lancamento } from '../../api/lancamentos-api.service';

export interface ConfirmarCancelamentoDto {
  estorno: 'nenhum' | 'parcial' | 'integral';
  valor_estorno?: number;
}

@Component({
  selector: 'app-cancelar-lancamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         (click)="fechar($event)">
      <div class="w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b"
             [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </div>
            <h3 class="text-lg font-bold">Cancelar Lançamento</h3>
          </div>
          <button (click)="fechado.emit()" class="p-1 rounded-lg transition-colors"
                  [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-5">

          <!-- Info do lançamento -->
          <div class="rounded-xl p-4 border"
               [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c]' : 'bg-slate-50 border-slate-200'">
            <p class="font-semibold text-sm">{{ lancamento.descricao }}</p>
            <p class="text-xs mt-1" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
              {{ lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída' }} &bull;
              R$ {{ lancamento.valor }}
            </p>
          </div>

          <!-- Info parcelamento -->
          @if (ehParcelado()) {
            <div class="rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
              <p class="text-sm font-semibold text-amber-600 mb-2">Lançamento parcelado</p>
              <p class="text-xs text-amber-600/80 mb-3">
                Este lançamento faz parte de um grupo de parcelas. Ao confirmar,
                <strong>todas as parcelas não canceladas</strong> serão canceladas.
              </p>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="rounded-lg p-2" [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-white'">
                  <p class="text-lg font-bold text-green-500">{{ pagas() }}</p>
                  <p class="text-xs" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Pagas</p>
                </div>
                <div class="rounded-lg p-2" [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-white'">
                  <p class="text-lg font-bold text-red-500">{{ atrasadas() }}</p>
                  <p class="text-xs" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Atrasadas</p>
                </div>
                <div class="rounded-lg p-2" [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-white'">
                  <p class="text-lg font-bold" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-700'">{{ pendentes() }}</p>
                  <p class="text-xs" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Pendentes</p>
                </div>
              </div>
            </div>
          }

          <!-- Estorno (só aparece se houver parcelas pagas) -->
          @if (temPago()) {
            <div class="space-y-3">
              <p class="text-sm font-semibold">
                {{ ehParcelado() ? 'Houve estorno das parcelas pagas?' : 'Houve estorno deste lançamento?' }}
                @if (ehParcelado()) {
                  <span class="text-xs font-normal ml-1" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                    (Total pago: R$ {{ totalPagoFormatado() }})
                  </span>
                }
              </p>
              <div class="flex gap-2">
                <button type="button" (click)="estorno = 'integral'"
                        class="flex-1 py-2 rounded-xl text-sm font-medium border transition-colors"
                        [ngClass]="estorno === 'integral'
                          ? 'bg-green-500/20 border-green-500/30 text-green-500'
                          : (t.isDark() ? 'border-[#2a2a2c] text-gray-400' : 'border-slate-200 text-slate-500')">
                  Integral
                </button>
                <button type="button" (click)="estorno = 'parcial'"
                        class="flex-1 py-2 rounded-xl text-sm font-medium border transition-colors"
                        [ngClass]="estorno === 'parcial'
                          ? 'bg-blue-500/20 border-blue-500/30 text-blue-500'
                          : (t.isDark() ? 'border-[#2a2a2c] text-gray-400' : 'border-slate-200 text-slate-500')">
                  Parcial
                </button>
              </div>

              @if (estorno === 'parcial') {
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                    Valor estornado (R$)
                  </label>
                  <input [(ngModel)]="valorEstorno" type="number" min="0.01" step="0.01" placeholder="0.00"
                         class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                </div>
              }
            </div>
          }

          <!-- Aviso final -->
          <p class="text-xs" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
            O cancelamento não pode ser desfeito.
          </p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-6 pb-6">
          <button type="button" (click)="fechado.emit()"
                  class="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
            Voltar
          </button>
          <button type="button" (click)="confirmar()"
                  [disabled]="estorno === 'parcial' && valorEstorno <= 0"
                  class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CancelarLancamentoModalComponent {
  @Input() lancamento!: Lancamento;
  @Input() todosLancamentos: Lancamento[] = [];
  @Output() confirmado = new EventEmitter<ConfirmarCancelamentoDto>();
  @Output() fechado    = new EventEmitter<void>();

  t = inject(ThemeService);

  estorno: 'nenhum' | 'parcial' | 'integral' = 'integral';
  valorEstorno = 0;

  ehParcelado = computed(() => !!this.lancamento?.grupo_parcelamento_id);

  private grupo = computed(() => {
    const gid = this.lancamento?.grupo_parcelamento_id;
    if (!gid) return this.lancamento ? [this.lancamento] : [];
    return this.todosLancamentos.filter(
      l => l.grupo_parcelamento_id === gid && l.status !== 'cancelado'
    );
  });

  pagas     = computed(() => this.grupo().filter(l => l.status === 'pago').length);
  atrasadas = computed(() => this.grupo().filter(l => l.status === 'atrasado').length);
  pendentes = computed(() => this.grupo().filter(l => l.status === 'pendente').length);

  temPago = computed(() => this.pagas() > 0 || this.lancamento?.status === 'pago');

  totalPagoFormatado = computed(() => {
    const total = this.grupo()
      .filter(l => l.status === 'pago')
      .reduce((s, l) => s + Number(l.valor), 0);
    return total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  });

  confirmar() {
    this.confirmado.emit({
      estorno: this.estorno,
      valor_estorno: this.estorno === 'parcial' ? this.valorEstorno : undefined,
    });
  }

  fechar(event: Event) {
    if (event.target === event.currentTarget) this.fechado.emit();
  }
}
