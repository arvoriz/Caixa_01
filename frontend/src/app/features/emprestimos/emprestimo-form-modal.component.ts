import { Component, inject, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { EmprestimosApiService } from '../../api/emprestimos-api.service';
import { extrairErroApi } from '../../core/utils/erro-api';

/** Data atual YYYY-MM-DD no fuso local. */
function dataLocalIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-emprestimo-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="fechar($event)">
      <div class="w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh]"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <h3 class="text-lg font-bold">Registrar Novo Contrato</h3>
          <button (click)="fechar()" class="p-1 rounded-lg transition-colors" [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-6 overflow-y-auto">

          @if (erro()) {
            <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
          }

          <!-- Tabs de Tipo -->
          <div class="flex gap-2 border-b transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
            <button (click)="aba.set('mutuo')" class="px-4 py-3 text-sm font-bold border-b-2 transition-all"
                    [ngClass]="aba() === 'mutuo' ? 'border-purple-500 text-purple-500' : 'border-transparent ' + (t.isDark() ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-800')">
              Mútuo (Intercompany)
            </button>
            <button (click)="aba.set('externo')" class="px-4 py-3 text-sm font-bold border-b-2 transition-all"
                    [ngClass]="aba() === 'externo' ? 'border-blue-500 text-blue-500' : 'border-transparent ' + (t.isDark() ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-800')">
              Externo (Terceiros)
            </button>
          </div>

          <!-- Informação -->
          <div class="p-4 rounded-xl border text-sm transition-colors"
               [ngClass]="aba() === 'mutuo'
                 ? (t.isDark() ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700')
                 : (t.isDark() ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700')">
            @if (aba() === 'mutuo') {
              <p class="font-medium">O valor será debitado da empresa de origem e creditado automaticamente na empresa de destino.</p>
            } @else {
              <p class="font-medium">O valor será creditado na sua empresa e uma dívida externa será gerada para acompanhamento.</p>
            }
          </div>

          <!-- Grid Credor / Devedor -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Credor (Origem) -->
            <div class="flex flex-col space-y-4">
              <div class="flex items-center gap-2 border-b pb-2 transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
                <div class="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 9 11 9-11"/></svg>
                </div>
                <span class="text-xs font-bold uppercase tracking-wider text-red-500">Credor (o dinheiro sai de)</span>
              </div>

              @if (aba() === 'mutuo') {
                <div class="flex-1 flex flex-col">
                  <label class="block text-xs font-medium mb-1.5" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Selecione sua empresa</label>
                  <select [(ngModel)]="origemId"
                          class="mt-auto w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:border-red-500 focus:ring-red-500"
                          [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                    <option value="">Selecione...</option>
                    @for (emp of empresas(); track emp.id) {
                      <option [value]="emp.id">{{ emp.nome_fantasia || emp.razao_social }}</option>
                    }
                  </select>
                </div>
              } @else {
                <div class="flex-1 flex flex-col">
                  <label class="block text-xs font-medium mb-2" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Tipo de credor externo</label>
                  <div class="flex gap-4 mb-3">
                    <label class="flex items-center gap-2 cursor-pointer group">
                      <div class="relative flex items-center justify-center w-4 h-4 rounded border transition-colors"
                           [ngClass]="fonteExterna() === 'banco' ? 'bg-red-500 border-red-500' : (t.isDark() ? 'border-[#2a2a2c] bg-[#18181b]' : 'border-slate-300 bg-white')">
                        @if (fonteExterna() === 'banco') {
                          <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        }
                      </div>
                      <input type="radio" name="fonte" class="hidden" (click)="fonteExterna.set('banco')">
                      <span class="text-xs font-medium" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-600'">Instituição / Banco</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer group">
                      <div class="relative flex items-center justify-center w-4 h-4 rounded border transition-colors"
                           [ngClass]="fonteExterna() === 'pessoa' ? 'bg-red-500 border-red-500' : (t.isDark() ? 'border-[#2a2a2c] bg-[#18181b]' : 'border-slate-300 bg-white')">
                        @if (fonteExterna() === 'pessoa') {
                          <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        }
                      </div>
                      <input type="radio" name="fonte" class="hidden" (click)="fonteExterna.set('pessoa')">
                      <span class="text-xs font-medium" [ngClass]="t.isDark() ? 'text-gray-300' : 'text-slate-600'">Pessoa Física</span>
                    </label>
                  </div>
                  <input [(ngModel)]="credorExterno" type="text"
                         [placeholder]="fonteExterna() === 'banco' ? 'Ex: Banco Itaú, Caixa' : 'Ex: João (Tio), Sócios'"
                         class="mt-auto w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:border-red-500 focus:ring-red-500"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
                </div>
              }
            </div>

            <!-- Devedor (Destino) -->
            <div class="flex flex-col space-y-4">
              <div class="flex items-center gap-2 border-b pb-2 transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
                <div class="w-6 h-6 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 9-11 9 11"/></svg>
                </div>
                <span class="text-xs font-bold uppercase tracking-wider text-green-500">Devedor (o dinheiro entra em)</span>
              </div>
              <div class="flex-1 flex flex-col">
                <label class="block text-xs font-medium mb-1.5" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Sua empresa que receberá</label>
                <select [(ngModel)]="destinoId"
                        class="mt-auto w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:border-green-500 focus:ring-green-500"
                        [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                  <option value="">Selecione...</option>
                  @for (emp of empresas(); track emp.id) {
                    <option [value]="emp.id">{{ emp.nome_fantasia || emp.razao_social }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Dados do contrato -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
            <div class="sm:col-span-1">
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Valor (R$) *</label>
              <input [(ngModel)]="valor" type="number" min="0" step="0.01" placeholder="0.00"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
            </div>
            <div class="sm:col-span-1">
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Data do contrato</label>
              <input [(ngModel)]="dataContrato" type="date"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'">
            </div>
            <div class="sm:col-span-1">
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Descrição</label>
              <input [(ngModel)]="descricao" type="text" placeholder="Ex: Capital de giro"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t flex justify-end gap-3 transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c] bg-[#121214]' : 'border-slate-100 bg-slate-50'">
          <button (click)="fechar()" class="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
            Cancelar
          </button>
          <button (click)="salvar()" [disabled]="salvando()"
                  class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
            {{ salvando() ? 'Salvando...' : 'Salvar Contrato' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class EmprestimoFormModalComponent implements OnInit {
  @Output() fechado = new EventEmitter<void>();
  @Output() salvo   = new EventEmitter<void>();

  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private api  = inject(EmprestimosApiService);

  empresas = this.empresaAtiva.empresas;

  aba           = signal<'mutuo' | 'externo'>('mutuo');
  fonteExterna  = signal<'banco' | 'pessoa'>('banco');
  salvando      = signal(false);
  erro          = signal('');

  origemId      = '';
  destinoId     = '';
  credorExterno = '';
  valor: number | null = null;
  descricao     = '';
  dataContrato  = dataLocalIso();

  ngOnInit() {
    // Devedor já vem pré-selecionado com a empresa ativa.
    this.destinoId = this.empresaAtiva.ativa()?.id ?? '';
  }

  salvar() {
    const empresaRota = this.empresaAtiva.ativa()?.id;
    if (!empresaRota) { this.erro.set('Nenhuma empresa selecionada.'); return; }

    const valorNum = Number(this.valor);
    if (!valorNum || valorNum <= 0) { this.erro.set('Informe um valor maior que zero.'); return; }
    if (!this.destinoId) { this.erro.set('Selecione a empresa devedora (destino).'); return; }

    const mutuo = this.aba() === 'mutuo';
    if (mutuo) {
      if (!this.origemId) { this.erro.set('Selecione a empresa de origem (credor).'); return; }
      if (this.origemId === this.destinoId) { this.erro.set('Origem e destino devem ser diferentes.'); return; }
    } else if (!this.credorExterno.trim()) {
      this.erro.set('Informe o nome do credor externo.'); return;
    }

    this.salvando.set(true);
    this.erro.set('');

    this.api.criar(empresaRota, {
      tipo:               mutuo ? 'mutuo' : this.fonteExterna(),
      descricao:          this.descricao.trim() || null,
      valor:              valorNum,
      empresa_origem_id:  mutuo ? this.origemId : null,
      empresa_destino_id: this.destinoId,
      credor_externo:     mutuo ? null : this.credorExterno.trim(),
      data_contrato:      this.dataContrato || null,
    }).subscribe({
      next: () => { this.salvando.set(false); this.salvo.emit(); this.fechado.emit(); },
      error: (err) => { this.erro.set(extrairErroApi(err, 'Erro ao salvar empréstimo.')); this.salvando.set(false); },
    });
  }

  fechar(event?: Event) {
    if (!event || event.target === event.currentTarget) this.fechado.emit();
  }
}
