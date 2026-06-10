import { Component, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { EmprestimosApiService, Emprestimo, TipoEmprestimo, StatusEmprestimo } from '../../api/emprestimos-api.service';
import { EmprestimoListaComponent } from './emprestimo-lista.component';
import { EmprestimoFormModalComponent } from './emprestimo-form-modal.component';
import { EmprestimoDetalhesModalComponent } from './emprestimo-detalhes-modal.component';

@Component({
  selector: 'app-emprestimos',
  standalone: true,
  imports: [CommonModule, FormsModule, EmprestimoListaComponent, EmprestimoFormModalComponent, EmprestimoDetalhesModalComponent],
  template: `
    <div class="p-6 lg:p-10 flex flex-col">

      <!-- Cabeçalho -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold mb-1">Empréstimos</h1>
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Gerencie obrigações com terceiros (bancos/pessoas) e mútuos entre suas empresas.
          </p>
        </div>
        @if (!empresaAtiva.soLeitura()) {
          <button (click)="abrirNovo()"
                  class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Novo Empréstimo
          </button>
        }
      </div>

      @if (!empresaAtiva.ativa()) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Selecione uma empresa no topo para ver os empréstimos.
          </p>
        </div>
      } @else {

        <!-- Filtros -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input [ngModel]="busca()" (ngModelChange)="busca.set($event)" type="text" placeholder="Buscar por título ou credor..."
                   class="w-full text-sm rounded-xl pl-10 pr-4 py-3 border outline-none transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                   [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'">
          </div>
          <select [ngModel]="filtroTipo()" (ngModelChange)="filtroTipo.set($event)"
                  class="w-full md:w-48 text-sm rounded-xl px-4 py-3 border outline-none transition-colors cursor-pointer"
                  [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-gray-300' : 'bg-white border-slate-200 text-slate-600'">
            <option value="">Todos os tipos</option>
            <option value="mutuo">Mútuo</option>
            <option value="banco">Externo (Banco)</option>
            <option value="pessoa">Externo (Pessoa)</option>
          </select>
          <select [ngModel]="filtroStatus()" (ngModelChange)="filtroStatus.set($event)"
                  class="w-full md:w-48 text-sm rounded-xl px-4 py-3 border outline-none transition-colors cursor-pointer"
                  [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-gray-300' : 'bg-white border-slate-200 text-slate-600'">
            <option value="">Status: Todos</option>
            <option value="ativo">Status: Ativo</option>
            <option value="quitado">Status: Quitado</option>
            <option value="cancelado">Status: Cancelado</option>
          </select>
        </div>

        @if (carregando()) {
          <div class="rounded-2xl border p-6 animate-pulse h-64" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"></div>
        } @else if (erro()) {
          <div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
        } @else if (filtrados().length === 0) {
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4" [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-slate-100'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="m10 13 2 2 2-2"/><path d="M12 15V8"/><path d="M18 4v4"/><path d="M6 4v4"/><rect width="20" height="8" x="2" y="4" rx="2"/></svg>
            </div>
            <h3 class="font-bold text-lg mb-1">Nenhum empréstimo encontrado</h3>
            <p class="text-sm mb-6 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
              {{ empresaAtiva.soLeitura() ? 'Esta empresa ainda não possui empréstimos registrados.' : 'Registre o primeiro empréstimo desta empresa.' }}
            </p>
            @if (!empresaAtiva.soLeitura()) {
              <button (click)="abrirNovo()" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Novo Empréstimo
              </button>
            }
          </div>
        } @else {
          <app-emprestimo-lista [emprestimos]="filtrados()" (abrir)="abrirDetalhes($event)" />
        }
      }

      @if (modalNovoAberto()) {
        <app-emprestimo-form-modal (fechado)="modalNovoAberto.set(false)" (salvo)="recarregar()" />
      }

      @if (selecionado()) {
        <app-emprestimo-detalhes-modal
          [emprestimo]="selecionado()!"
          (fechado)="selecionado.set(null)"
          (atualizado)="recarregar()"
        />
      }
    </div>
  `,
})
export class EmprestimosComponent {
  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private api  = inject(EmprestimosApiService);

  emprestimos = signal<Emprestimo[]>([]);
  carregando  = signal(false);
  erro        = signal('');

  busca        = signal('');
  filtroTipo   = signal<TipoEmprestimo | ''>('');
  filtroStatus = signal<StatusEmprestimo | ''>('');

  modalNovoAberto = signal(false);
  selecionado     = signal<Emprestimo | null>(null);

  filtrados = computed(() => {
    const termo  = this.busca().trim().toLowerCase();
    const tipo   = this.filtroTipo();
    const status = this.filtroStatus();
    return this.emprestimos().filter(e => {
      const alvo = `${e.descricao ?? ''} ${e.credor_externo ?? ''} ${e.empresa_origem_nome ?? ''}`.toLowerCase();
      const matchBusca  = !termo  || alvo.includes(termo);
      const matchTipo   = !tipo   || e.tipo === tipo;
      const matchStatus = !status || e.status === status;
      return matchBusca && matchTipo && matchStatus;
    });
  });

  constructor() {
    effect(() => {
      const emp = this.empresaAtiva.ativa();
      if (emp) this.carregar(emp.id);
    }, { allowSignalWrites: true });
  }

  private carregar(empresaId: string) {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listar(empresaId).subscribe({
      next: data => { this.emprestimos.set(data); this.carregando.set(false); },
      error: ()  => { this.erro.set('Erro ao carregar empréstimos.'); this.carregando.set(false); },
    });
  }

  recarregar() {
    const emp = this.empresaAtiva.ativa();
    if (emp) this.carregar(emp.id);
  }

  abrirNovo()  { this.modalNovoAberto.set(true); }
  abrirDetalhes(e: Emprestimo) { this.selecionado.set(e); }
}
