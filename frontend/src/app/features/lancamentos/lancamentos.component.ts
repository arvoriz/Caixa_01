import { Component, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { LancamentoUiService } from '../../core/services/lancamento-ui.service';
import { LancamentosApiService, Lancamento, StatusLancamento } from '../../api/lancamentos-api.service';
import { LancamentoTabelaComponent } from './lancamento-tabela.component';
import { LancamentoFormModalComponent } from './lancamento-form-modal.component';
import { CancelarLancamentoModalComponent, ConfirmarCancelamentoDto } from './cancelar-lancamento-modal.component';
import { extrairErroApi } from '../../core/utils/erro-api';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, LancamentoTabelaComponent, LancamentoFormModalComponent, CancelarLancamentoModalComponent],
  template: `
    <div class="p-6 lg:p-10 flex flex-col">

      <!-- Cabeçalho -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold mb-1">Fluxo de Caixa</h1>
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Acompanhe e registre as entradas e saídas do seu caixa.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input [ngModel]="busca()" (ngModelChange)="busca.set($event)" type="text" placeholder="Buscar lançamento..."
                   class="w-full lg:w-64 text-sm rounded-xl pl-9 pr-4 py-2.5 border outline-none transition-colors focus:border-blue-500"
                   [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-white' : 'bg-white border-slate-200 text-slate-900'">
          </div>
          <select [ngModel]="filtroStatus()" (ngModelChange)="filtroStatus.set($event)"
                  class="text-sm rounded-xl px-4 py-2.5 border outline-none transition-colors focus:border-blue-500"
                  [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-gray-300' : 'bg-white border-slate-200 text-slate-700'">
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          @if (!empresaAtiva.soLeitura()) {
            <button (click)="abrirNovo()"
                    class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Novo
            </button>
          }
        </div>
      </div>

      <!-- Sem empresa -->
      @if (!empresaAtiva.ativa()) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Selecione uma empresa no topo para ver os lançamentos.
          </p>
        </div>
      } @else if (carregando()) {
        <div class="rounded-2xl border p-6 animate-pulse h-64"
             [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"></div>
      } @else if (erro()) {
        <div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
      } @else if (lancamentosFiltrados().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Nenhum lançamento encontrado</h3>
          <p class="text-sm mb-6 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            {{ empresaAtiva.soLeitura() ? 'Esta empresa ainda não possui lançamentos registrados.' : 'Registre a primeira entrada ou saída do caixa desta empresa.' }}
          </p>
          @if (!empresaAtiva.soLeitura()) {
            <button (click)="abrirNovo()"
                    class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Novo Lançamento
            </button>
          }
        </div>
      } @else {
        <app-lancamento-tabela
          [lancamentos]="lancamentosFiltrados()"
          [todosLancamentos]="lancamentos()"
          (editar)="abrirEdicao($event)"
          (cancelar)="abrirCancelamento($event)"
        />
        <p class="text-xs mt-4 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
          {{ lancamentosFiltrados().length }} lançamento(s)
        </p>
      }

      <!-- Modal form -->
      @if (modalAberto()) {
        <app-lancamento-form-modal
          [lancamento]="emEdicao()"
          [todosLancamentos]="lancamentos()"
          (fechado)="modalAberto.set(false)"
          (salvo)="onSalvo()"
        />
      }

      <!-- Modal cancelamento -->
      @if (cancelarModalAberto() && emCancelamento()) {
        <app-cancelar-lancamento-modal
          [lancamento]="emCancelamento()!"
          [todosLancamentos]="lancamentos()"
          (fechado)="cancelarModalAberto.set(false)"
          (confirmado)="onCancelado($event)"
        />
      }
    </div>
  `,
})
export class LancamentosComponent {
  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private api  = inject(LancamentosApiService);
  private ui   = inject(LancamentoUiService);

  lancamentos = signal<Lancamento[]>([]);
  carregando  = signal(false);
  erro        = signal('');

  busca        = signal('');
  filtroStatus = signal<StatusLancamento | ''>('');

  modalAberto = signal(false);
  emEdicao    = signal<Lancamento | null>(null);

  cancelarModalAberto = signal(false);
  emCancelamento      = signal<Lancamento | null>(null);

  private ultimoAbrir = 0;

  lancamentosFiltrados = computed(() => {
    const termo  = this.busca().trim().toLowerCase();
    const status = this.filtroStatus();
    return this.lancamentos().filter(l => {
      const matchBusca  = !termo  || l.descricao.toLowerCase().includes(termo);
      const matchStatus = !status || l.status === status;
      return matchBusca && matchStatus;
    });
  });

  constructor() {
    // Ignora solicitações anteriores à montagem (evita abrir o modal ao revisitar a página)
    this.ultimoAbrir = this.ui.abrirNovoSolicitado();

    // Recarrega quando a empresa ativa muda
    effect(() => {
      const emp = this.empresaAtiva.ativa();
      if (emp) this.carregar(emp.id);
    }, { allowSignalWrites: true });

    // Abre o modal quando o botão do navbar é clicado
    effect(() => {
      const n = this.ui.abrirNovoSolicitado();
      if (n > this.ultimoAbrir) {
        this.ultimoAbrir = n;
        this.abrirNovo();
      }
    }, { allowSignalWrites: true });
  }

  private carregar(empresaId: string) {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listar(empresaId).subscribe({
      next: data => { this.lancamentos.set(data); this.carregando.set(false); },
      error: ()  => { this.erro.set('Erro ao carregar lançamentos.'); this.carregando.set(false); },
    });
  }

  abrirNovo() {
    this.emEdicao.set(null);
    this.modalAberto.set(true);
  }

  abrirEdicao(lancamento: Lancamento) {
    this.emEdicao.set(lancamento);
    this.modalAberto.set(true);
  }

  onSalvo() {
    const emp = this.empresaAtiva.ativa();
    if (emp) this.carregar(emp.id);
  }

  abrirCancelamento(lancamento: Lancamento) {
    this.emCancelamento.set(lancamento);
    this.cancelarModalAberto.set(true);
  }

  onCancelado(dto: ConfirmarCancelamentoDto) {
    const emp = this.empresaAtiva.ativa();
    const lanc = this.emCancelamento();
    if (!emp || !lanc) return;

    this.cancelarModalAberto.set(false);
    this.api.cancelar(emp.id, lanc.id, dto.estorno, dto.valor_estorno).subscribe({
      next: () => this.carregar(emp.id),
      error: (err) => this.erro.set(extrairErroApi(err, 'Erro ao cancelar lançamento.')),
    });
  }
}
