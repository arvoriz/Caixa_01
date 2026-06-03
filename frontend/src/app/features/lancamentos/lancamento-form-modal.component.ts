import { Component, inject, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { CategoriasApiService, Categoria, TipoTransacao } from '../../api/categorias-api.service';
import { LancamentosApiService, Lancamento } from '../../api/lancamentos-api.service';

@Component({
  selector: 'app-lancamento-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         (click)="fechar($event)">
      <div class="w-full max-w-xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh]"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b transition-colors"
             [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <h3 class="text-lg font-bold">{{ editando ? 'Editar Lançamento' : 'Novo Lançamento' }}</h3>
          <button (click)="fechar()" class="p-1 rounded-lg transition-colors"
                  [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <form [formGroup]="form" (ngSubmit)="salvar()" class="p-6 overflow-y-auto space-y-6">

          @if (erro()) {
            <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
          }

          <!-- Toggle Entrada/Saída -->
          <div class="flex p-1 rounded-xl transition-colors border"
               [ngClass]="t.isDark() ? 'bg-[#0a0a0b] border-[#2a2a2c]' : 'bg-slate-100 border-slate-200'">
            <button type="button" (click)="mudarTipo('saida')"
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
                    [ngClass]="tipo() === 'saida'
                      ? (t.isDark() ? 'bg-red-500/20 text-red-500 shadow-sm' : 'bg-white text-red-600 shadow-sm')
                      : (t.isDark() ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-700')">
              Despesa (Saída)
            </button>
            <button type="button" (click)="mudarTipo('entrada')"
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
                    [ngClass]="tipo() === 'entrada'
                      ? (t.isDark() ? 'bg-green-500/20 text-green-500 shadow-sm' : 'bg-white text-green-600 shadow-sm')
                      : (t.isDark() ? 'text-gray-500 hover:text-gray-300' : 'text-slate-500 hover:text-slate-700')">
              Receita (Entrada)
            </button>
          </div>

          <!-- Descrição & Valor -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Descrição *</label>
              <input formControlName="descricao" type="text" placeholder="Ex: Pagamento de Fornecedor"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Valor (R$) *</label>
              <input formControlName="valor" type="number" min="0" step="0.01" placeholder="0.00"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
            </div>
          </div>

          <!-- Categoria & Vencimento -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Categoria *</label>
              @if (!criandoCategoria()) {
                <select formControlName="categoria_id"
                        class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                  <option value="" disabled>Selecione...</option>
                  @for (cat of categorias(); track cat.id) {
                    <option [value]="cat.id">{{ cat.nome }}</option>
                  }
                </select>
                <button type="button" (click)="criandoCategoria.set(true)"
                        class="text-xs text-blue-500 hover:text-blue-400 mt-1.5 font-medium">
                  + Nova categoria
                </button>
              } @else {
                <div class="flex gap-2">
                  <input [(ngModel)]="nomeNovaCategoria" [ngModelOptions]="{ standalone: true }"
                         type="text" placeholder="Nome da categoria"
                         class="flex-1 text-sm rounded-xl px-3 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
                  <button type="button" (click)="salvarNovaCategoria()" [disabled]="!nomeNovaCategoria.trim()"
                          class="px-3 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-60 shrink-0">
                    OK
                  </button>
                  <button type="button" (click)="criandoCategoria.set(false)"
                          class="px-3 rounded-xl text-xs font-medium border transition-colors shrink-0"
                          [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300' : 'border-slate-200 text-slate-600'">
                    ✕
                  </button>
                </div>
              }
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Data de Vencimento *</label>
              <input formControlName="data_vencimento" type="date"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'">
            </div>
          </div>

          <!-- Toggles -->
          <div class="pt-4 border-t space-y-4 transition-colors" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">

            <!-- Já pago? -->
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-sm">Este lançamento já foi {{ tipo() === 'saida' ? 'pago' : 'recebido' }}?</h4>
              <button type="button" (click)="togglePago()"
                      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                      [ngClass]="pago() ? 'bg-blue-600' : (t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-300')">
                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
                      [ngClass]="pago() ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
            </div>

            @if (pago()) {
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                  Data do {{ tipo() === 'saida' ? 'Pagamento' : 'Recebimento' }}
                </label>
                <input formControlName="data_pagamento" type="date"
                       class="w-full sm:w-1/2 text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'">
              </div>
            }

            <!-- Parcelar (só na criação) -->
            @if (!editando) {
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-sm">Parcelar</h4>
                  <p class="text-xs transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
                    Divide o valor em parcelas mensais automáticas.
                  </p>
                </div>
                <button type="button" (click)="toggleParcelado()"
                        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                        [ngClass]="parcelado() ? 'bg-blue-600' : (t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-300')">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
                        [ngClass]="parcelado() ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>

              @if (parcelado()) {
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Número de Parcelas</label>
                  <input [(ngModel)]="numeroParcelas" [ngModelOptions]="{ standalone: true }"
                         type="number" min="2" max="60"
                         class="w-full sm:w-1/3 text-sm rounded-xl px-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="fechar()"
                    class="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                    [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
              Cancelar
            </button>
            <button type="submit" [disabled]="salvando()"
                    class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
              {{ salvando() ? 'Salvando...' : 'Salvar Lançamento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LancamentoFormModalComponent implements OnInit {
  @Input() lancamento: Lancamento | null = null;
  @Output() fechado = new EventEmitter<void>();
  @Output() salvo   = new EventEmitter<void>();

  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private catApi  = inject(CategoriasApiService);
  private lancApi = inject(LancamentosApiService);
  private fb      = inject(FormBuilder);

  tipo       = signal<TipoTransacao>('saida');
  pago       = signal(false);
  parcelado  = signal(false);
  categorias = signal<Categoria[]>([]);
  criandoCategoria = signal(false);
  salvando   = signal(false);
  erro       = signal('');

  nomeNovaCategoria = '';
  numeroParcelas    = 2;
  editando = false;

  form = this.fb.group({
    descricao:       ['', Validators.required],
    valor:           [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoria_id:    ['', Validators.required],
    data_vencimento: ['', Validators.required],
    data_pagamento:  [''],
  });

  ngOnInit() {
    this.editando = !!this.lancamento;
    if (this.lancamento) {
      this.tipo.set(this.lancamento.tipo);
      this.pago.set(this.lancamento.status === 'pago');
      this.form.patchValue({
        descricao:       this.lancamento.descricao,
        valor:           Number(this.lancamento.valor),
        categoria_id:    this.lancamento.categoria_id,
        data_vencimento: this.lancamento.data_vencimento,
        data_pagamento:  this.lancamento.data_pagamento ?? '',
      });
    }
    this.carregarCategorias();
  }

  private get empresaId(): string | null {
    return this.empresaAtiva.ativa()?.id ?? null;
  }

  carregarCategorias() {
    const id = this.empresaId;
    if (!id) return;
    this.catApi.listar(id, this.tipo()).subscribe(cats => this.categorias.set(cats));
  }

  mudarTipo(novo: TipoTransacao) {
    if (this.tipo() === novo) return;
    this.tipo.set(novo);
    this.form.patchValue({ categoria_id: '' });
    this.carregarCategorias();
  }

  togglePago() {
    this.pago.update(v => !v);
    if (this.pago() && !this.form.value.data_pagamento) {
      this.form.patchValue({ data_pagamento: new Date().toISOString().slice(0, 10) });
    }
  }

  toggleParcelado() { this.parcelado.update(v => !v); }

  salvarNovaCategoria() {
    const id = this.empresaId;
    const nome = this.nomeNovaCategoria.trim();
    if (!id || !nome) return;
    this.catApi.criar(id, { nome, tipo: this.tipo() }).subscribe(cat => {
      this.categorias.update(lista => [...lista, cat]);
      this.form.patchValue({ categoria_id: cat.id });
      this.nomeNovaCategoria = '';
      this.criandoCategoria.set(false);
    });
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.empresaId;
    if (!id) { this.erro.set('Nenhuma empresa selecionada.'); return; }

    this.salvando.set(true);
    this.erro.set('');

    const v = this.form.value;
    const dto = {
      categoria_id:    v.categoria_id!,
      descricao:       v.descricao!,
      tipo:            this.tipo(),
      valor:           Number(v.valor),
      data_vencimento: v.data_vencimento!,
      data_pagamento:  this.pago() ? (v.data_pagamento || null) : null,
      status:          (this.pago() ? 'pago' : 'pendente') as 'pago' | 'pendente',
    };

    const req: Observable<unknown> = this.editando
      ? this.lancApi.atualizar(id, this.lancamento!.id, dto)
      : this.lancApi.criar(id, dto, this.parcelado() ? this.numeroParcelas : 1);

    req.subscribe({
      next: () => { this.salvando.set(false); this.salvo.emit(); this.fechado.emit(); },
      error: (err) => {
        this.erro.set(err?.error?.errors?.[0] ?? 'Erro ao salvar lançamento.');
        this.salvando.set(false);
      },
    });
  }

  fechar(event?: Event) {
    if (!event || event.target === event.currentTarget) this.fechado.emit();
  }
}
