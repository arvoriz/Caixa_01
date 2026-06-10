import { Component, inject, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable, switchMap, of } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { CategoriasApiService, Categoria, TipoTransacao } from '../../api/categorias-api.service';
import { LancamentosApiService, Lancamento } from '../../api/lancamentos-api.service';
import { extrairErroApi } from '../../core/utils/erro-api';

/** Data atual no formato YYYY-MM-DD no fuso horário local (evita o "dia seguinte" do toISOString em UTC). */
function dataLocalIso(): string {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

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
          <h3 class="text-lg font-bold">{{ somenteLeitura() ? 'Detalhes do Lançamento' : (editando ? 'Editar Lançamento' : 'Novo Lançamento') }}</h3>
          <button (click)="fechar()" class="p-1 rounded-lg transition-colors"
                  [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <form [formGroup]="form" (ngSubmit)="salvar()" class="p-6 overflow-y-auto space-y-6">

          @if (erro()) {
            <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
          }

          <!-- Tipo: badge informativo na edição, toggle na criação -->
          @if (editando) {
            <div class="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold w-fit"
                 [ngClass]="tipo() === 'saida'
                   ? (t.isDark() ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600')
                   : (t.isDark() ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-600')">
              <span class="w-2 h-2 rounded-full"
                    [ngClass]="tipo() === 'saida' ? 'bg-red-500' : 'bg-green-500'"></span>
              {{ tipo() === 'saida' ? 'Despesa (Saída)' : 'Receita (Entrada)' }}
            </div>
          } @else {
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
          }

          @if (editando && ehParcelado()) {
            <div class="rounded-xl p-3 border text-xs"
                 [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'">
              Parcela do grupo · {{ grupoInfo().pagas }} paga(s) · {{ grupoInfo().atrasadas }} atrasada(s) · {{ grupoInfo().pendentes }} pendente(s)
            </div>
          }

          <!-- Descrição & Valor -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Descrição *</label>
              <input formControlName="descricao" type="text" placeholder="Ex: Pagamento de Fornecedor"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
              @if (form.get('descricao')?.invalid && form.get('descricao')?.touched) {
                <span class="text-xs text-red-500 mt-1 block">Descrição obrigatória</span>
              }
            </div>

            @if (mostrarCamposParcela()) {
              <!-- Valor Total + Valor Parcela (lado a lado) -->
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Valor Total *</label>
                <input formControlName="valor" type="number" min="0" step="0.01" placeholder="0.00"
                       (input)="onValorTotalChange()"
                       class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
                @if (form.get('valor')?.invalid && form.get('valor')?.touched) {
                  <span class="text-xs text-red-500 mt-1 block">Informe um valor maior que zero</span>
                }
              </div>
              <div class="sm:col-span-full">
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                  Valor por Parcela
                  @if (editando && ehParcelado()) {
                    <span class="normal-case font-normal ml-1 text-xs opacity-60">(propaga às pendentes ao salvar)</span>
                  }
                </label>
                <input [(ngModel)]="valorParcela" [ngModelOptions]="{ standalone: true }"
                       [disabled]="somenteLeitura()"
                       type="number" min="0" step="0.01" placeholder="0.00"
                       (input)="onValorParcelaChange()"
                       class="w-full sm:w-1/3 text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
              </div>
            } @else {
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Valor (R$) *</label>
                <input formControlName="valor" type="number" min="0" step="0.01" placeholder="0.00"
                       class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
                @if (form.get('valor')?.invalid && form.get('valor')?.touched) {
                  <span class="text-xs text-red-500 mt-1 block">Informe um valor maior que zero</span>
                }
              </div>
            }
          </div>

          <!-- Categoria & Vencimento -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Categoria *</label>

              @if (!criandoCategoria()) {
                <select formControlName="categoria_id"
                        class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                  <option value="" disabled>Selecione...</option>
                  @for (cat of categorias(); track cat.id) {
                    <option [value]="cat.id">{{ cat.nome }}</option>
                  }
                </select>
                @if (!somenteLeitura()) {
                  <button type="button" (click)="criandoCategoria.set(true)"
                          class="text-xs text-blue-500 hover:text-blue-400 mt-1.5 font-medium">
                    + Nova categoria
                  </button>
                }
              } @else {
                <!-- Sem botão OK: o nome é salvo junto com o lançamento -->
                <div class="flex gap-2 items-center">
                  <input [(ngModel)]="nomeNovaCategoria" [ngModelOptions]="{ standalone: true }"
                         type="text" placeholder="Nome da nova categoria"
                         autofocus
                         class="flex-1 text-sm rounded-xl px-3 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900'">
                  <button type="button" (click)="criandoCategoria.set(false); nomeNovaCategoria = ''"
                          title="Voltar para seleção"
                          class="p-2.5 rounded-xl border transition-colors shrink-0"
                          [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-400 hover:bg-[#18181b]' : 'border-slate-200 text-slate-500 hover:bg-slate-100'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <p class="text-xs mt-1.5 opacity-60"
                   [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                  A categoria será criada ao salvar o lançamento.
                </p>
              }
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                     [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Data de Vencimento *</label>
              <input formControlName="data_vencimento" type="date"
                     class="w-full text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'">
              @if (form.get('data_vencimento')?.invalid && form.get('data_vencimento')?.touched) {
                <span class="text-xs text-red-500 mt-1 block">Data de vencimento obrigatória</span>
              }
            </div>
          </div>

          <!-- Toggles -->
          <div class="pt-4 border-t space-y-4" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">

            <div class="flex items-center justify-between">
              <h4 class="font-medium text-sm">Este lançamento já foi {{ tipo() === 'saida' ? 'pago' : 'recebido' }}?</h4>
              <button type="button" (click)="togglePago()" [disabled]="somenteLeitura()"
                      class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
                      [ngClass]="(pago() ? 'bg-blue-600' : (t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-300')) + (somenteLeitura() ? ' cursor-default' : ' cursor-pointer')">
                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
                      [ngClass]="pago() ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
            </div>

            @if (pago()) {
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                  Data do {{ tipo() === 'saida' ? 'Pagamento' : 'Recebimento' }}
                </label>
                <input formControlName="data_pagamento" type="date"
                       class="w-full sm:w-1/2 text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'">
              </div>
            }

            @if (podeParcelar()) {
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-sm">{{ editando ? 'Converter em parcelado' : 'Parcelar' }}</h4>
                  <p class="text-xs opacity-60" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
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
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Número de Parcelas</label>
                  <input [(ngModel)]="numeroParcelas" [ngModelOptions]="{ standalone: true }"
                         type="number" min="2" max="60"
                         (input)="onNumeroParcelasChange()"
                         class="w-full sm:w-1/3 text-sm rounded-xl px-4 py-3 border outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-2">
            @if (somenteLeitura()) {
              <button type="button" (click)="fechar()"
                      class="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                      [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
                Fechar
              </button>
            } @else {
              <button type="button" (click)="fechar()"
                      class="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                      [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
                Cancelar
              </button>
              <button type="submit" [disabled]="salvando()"
                      class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
                {{ salvando() ? 'Salvando...' : 'Salvar Lançamento' }}
              </button>
            }
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LancamentoFormModalComponent implements OnInit {
  @Input() lancamento: Lancamento | null = null;
  @Input() todosLancamentos: Lancamento[] = [];
  @Output() fechado = new EventEmitter<void>();
  @Output() salvo   = new EventEmitter<void>();

  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private catApi  = inject(CategoriasApiService);
  private lancApi = inject(LancamentosApiService);
  private fb      = inject(FormBuilder);

  tipo             = signal<TipoTransacao>('saida');
  pago             = signal(false);
  parcelado        = signal(false);
  categorias       = signal<Categoria[]>([]);
  criandoCategoria = signal(false);
  salvando         = signal(false);
  erro             = signal('');

  nomeNovaCategoria = '';
  numeroParcelas    = 2;
  valorParcela      = 0;
  editando          = false;

  // categoria_id não tem Validators.required — validamos manualmente em salvar()
  form = this.fb.group({
    descricao:       ['', Validators.required],
    valor:           [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoria_id:    [''],
    data_vencimento: ['', Validators.required],
    data_pagamento:  [''],
  });

  mostrarCamposParcela = computed(() => this.parcelado() || (this.editando && this.ehParcelado()));
  ehParcelado          = computed(() => !!this.lancamento?.grupo_parcelamento_id);
  somenteLeitura       = computed(() => this.empresaAtiva.soLeitura() || this.lancamento?.status === 'pago' || this.lancamento?.status === 'cancelado');

  grupoInfo = computed(() => {
    const gid = this.lancamento?.grupo_parcelamento_id;
    if (!gid) return { pagas: 0, atrasadas: 0, pendentes: 0 };
    const g = this.todosLancamentos.filter(l => l.grupo_parcelamento_id === gid && l.status !== 'cancelado');
    return {
      pagas:     g.filter(l => l.status === 'pago').length,
      atrasadas: g.filter(l => l.status === 'atrasado').length,
      pendentes: g.filter(l => l.status === 'pendente').length,
    };
  });

  podeParcelar = computed(() => {
    if (this.pago()) return false;
    if (!this.editando) return true;
    return !this.ehParcelado() && ['pendente', 'atrasado'].includes(this.lancamento?.status ?? '');
  });

  ngOnInit() {
    this.editando = !!this.lancamento;
    const hoje = dataLocalIso();
    if (this.lancamento) {
      this.tipo.set(this.lancamento.tipo);
      this.pago.set(this.lancamento.status === 'pago');
      const valorNum = Number(this.lancamento.valor);
      this.form.patchValue({
        descricao:       this.lancamento.descricao,
        valor:           valorNum,
        categoria_id:    this.lancamento.categoria_id,
        data_vencimento: this.lancamento.data_vencimento,
        data_pagamento:  this.lancamento.data_pagamento ?? hoje,
      });
      this.valorParcela = valorNum;
    } else {
      this.form.patchValue({ data_vencimento: hoje, data_pagamento: hoje });
    }
    if (this.somenteLeitura()) this.form.disable();
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
      this.form.patchValue({ data_pagamento: dataLocalIso() });
    }
  }

  toggleParcelado() {
    this.parcelado.update(v => !v);
    if (this.parcelado()) this.onValorTotalChange();
  }

  onNumeroParcelasChange() { this.onValorTotalChange(); }

  onValorTotalChange() {
    const total = Number(this.form.value.valor) || 0;
    const n = Math.max(this.numeroParcelas, 2);
    this.valorParcela = total > 0 ? +(total / n).toFixed(2) : 0;
  }

  onValorParcelaChange() {
    const n = this.editando ? this.totalParcelasGrupo() : Math.max(this.numeroParcelas, 2);
    this.form.patchValue({ valor: +(this.valorParcela * n).toFixed(2) });
  }

  private totalParcelasGrupo(): number {
    const gid = this.lancamento?.grupo_parcelamento_id;
    if (!gid) return 1;
    return this.todosLancamentos.filter(l => l.grupo_parcelamento_id === gid && l.status !== 'cancelado').length || 1;
  }

  salvar() {
    const id = this.empresaId;
    if (!id) { this.erro.set('Nenhuma empresa selecionada.'); return; }

    // Validação de categoria: precisa ter categoria_id OU estar criando nova com nome
    const temCategoriaId   = !!this.form.value.categoria_id;
    const temNovaCategoria = this.criandoCategoria() && !!this.nomeNovaCategoria.trim();
    if (!temCategoriaId && !temNovaCategoria) {
      this.erro.set('Selecione ou informe uma categoria.');
      return;
    }

    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.salvando.set(true);
    this.erro.set('');

    // Se nova categoria → criar primeiro, depois salvar lançamento com o ID retornado
    const categoriaObs: Observable<Categoria | null> = temNovaCategoria
      ? this.catApi.criar(id, { nome: this.nomeNovaCategoria.trim(), tipo: this.tipo() })
      : of(null);

    categoriaObs.pipe(
      switchMap(cat => {
        if (cat) this.form.patchValue({ categoria_id: cat.id });

        if (this.editando && this.ehParcelado()) return this.salvarEdicaoParcelado(id);
        if (this.editando && this.parcelado())   return this.lancApi.parcelar(id, this.lancamento!.id, this.numeroParcelas);
        return this.salvarSimples(id);
      })
    ).subscribe({
      next: () => { this.salvando.set(false); this.salvo.emit(); this.fechado.emit(); },
      error: (err) => {
        this.erro.set(extrairErroApi(err, 'Erro ao salvar lançamento.'));
        this.salvando.set(false);
      },
    });
  }

  private salvarSimples(id: string) {
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
    return this.editando
      ? this.lancApi.atualizar(id, this.lancamento!.id, dto)
      : this.lancApi.criar(id, dto, this.parcelado() ? this.numeroParcelas : 1);
  }

  private salvarEdicaoParcelado(id: string) {
    const v = this.form.value;
    const valorParcela = this.valorParcela > 0 ? this.valorParcela : Number(v.valor);
    const dto = {
      categoria_id:    v.categoria_id!,
      descricao:       v.descricao!,
      tipo:            this.tipo(),
      valor:           valorParcela,
      data_vencimento: v.data_vencimento!,
      data_pagamento:  this.pago() ? (v.data_pagamento || null) : null,
      status:          (this.pago() ? 'pago' : 'pendente') as 'pago' | 'pendente',
    };
    const valorOriginal = Number(this.lancamento!.valor);
    const valorMudou    = Math.abs(valorParcela - valorOriginal) > 0.001;

    return this.lancApi.atualizar(id, this.lancamento!.id, dto).pipe(
      switchMap(() =>
        valorMudou
          ? this.lancApi.propagarGrupo(id, this.lancamento!.id, valorParcela)
          : of(null)
      )
    );
  }

  fechar(event?: Event) {
    if (!event || event.target === event.currentTarget) this.fechado.emit();
  }
}
