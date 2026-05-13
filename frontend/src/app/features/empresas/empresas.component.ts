import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresasApiService, Empresa } from '../../api/empresas-api.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 lg:p-10">

      <!-- Cabeçalho -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold mb-1">Minhas Empresas</h1>
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Gerencie todos os seus CNPJs, saldos iniciais e permissões de acesso.
          </p>
        </div>
        <button (click)="abrirModal()"
                class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Nova Empresa
        </button>
      </div>

      <!-- Loading -->
      @if (carregando) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (_ of [1,2,3]; track $index) {
            <div class="p-6 rounded-2xl border animate-pulse h-48"
                 [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
              <div class="w-12 h-12 rounded-xl mb-4" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-100'"></div>
              <div class="h-4 rounded w-3/4 mb-2" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-100'"></div>
              <div class="h-3 rounded w-1/2" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-100'"></div>
            </div>
          }
        </div>
      }

      <!-- Erro -->
      @if (!carregando && erro) {
        <div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">
          {{ erro }}
        </div>
      }

      <!-- Lista vazia -->
      @if (!carregando && !erro && empresas.length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               [ngClass]="t.isDark() ? 'bg-[#121214]' : 'bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/>
            </svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Nenhuma empresa cadastrada</h3>
          <p class="text-sm mb-6 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Adicione seu primeiro CNPJ para começar a gerenciar o fluxo de caixa.
          </p>
          <button (click)="abrirModal()"
                  class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nova Empresa
          </button>
        </div>
      }

      <!-- Grid de Empresas -->
      @if (!carregando && !erro && empresas.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (empresa of empresas; track empresa.id) {
            <div class="p-6 rounded-2xl border transition-colors shadow-sm flex flex-col"
                 [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] hover:border-[#3f3f46]' : 'bg-white border-slate-200 hover:border-slate-300'">

              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border"
                     [ngClass]="corIniciais(empresa.papel)">
                  {{ iniciais(empresa.nome_fantasia || empresa.razao_social) }}
                </div>
                <button class="p-1.5 rounded-lg transition-colors"
                        [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>

              <div class="flex-1">
                <h3 class="font-bold text-lg mb-1">{{ empresa.nome_fantasia || empresa.razao_social }}</h3>
                <p class="text-xs mb-3 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
                  Razão: {{ empresa.razao_social }}
                </p>
                <div class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono border"
                     [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'">
                  {{ empresa.cnpj }}
                </div>
              </div>

              <div class="mt-6 pt-4 border-t flex items-center justify-between transition-colors"
                   [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
                <div>
                  <p class="text-[10px] uppercase font-semibold tracking-wider mb-1 transition-colors"
                     [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Saldo Inicial</p>
                  <p class="font-bold text-sm"
                     [ngClass]="empresa.papel === 'contador' ? (t.isDark() ? 'text-gray-500' : 'text-slate-400') : ''">
                    {{ empresa.papel === 'contador' ? 'Restrito' : formatarSaldo(empresa.saldo_inicial) }}
                  </p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                      [ngClass]="corPapel(empresa.papel)">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="corPonto(empresa.papel)"></span>
                  {{ labelPapel(empresa.papel) }}
                </span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal -->
      @if (modalAberto) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             (click)="fecharModal($event)">
          <div class="w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col"
               [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
               (click)="$event.stopPropagation()">

            <div class="flex items-center justify-between p-6 border-b transition-colors"
                 [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
              <h3 class="text-lg font-bold">Cadastrar Nova Empresa</h3>
              <button (click)="fecharModal()" class="p-1 rounded-lg transition-colors"
                      [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <form [formGroup]="form" (ngSubmit)="salvar()" class="p-6 space-y-5">

              @if (erroModal) {
                <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erroModal }}</div>
              }

              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">CNPJ *</label>
                <input formControlName="cnpj" type="text" placeholder="00.000.000/0000-00"
                       class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                @if (form.get('cnpj')?.invalid && form.get('cnpj')?.touched) {
                  <span class="text-xs text-red-500 mt-1 block">CNPJ obrigatório</span>
                }
              </div>

              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Razão Social *</label>
                <input formControlName="razao_social" type="text" placeholder="Ex: Tech Solutions Software ME"
                       class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                @if (form.get('razao_social')?.invalid && form.get('razao_social')?.touched) {
                  <span class="text-xs text-red-500 mt-1 block">Razão social obrigatória</span>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Nome Fantasia</label>
                  <input formControlName="nome_fantasia" type="text" placeholder="Como é conhecida"
                         class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Saldo Inicial (R$)</label>
                  <input formControlName="saldo_inicial" type="number" placeholder="0,00"
                         class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                </div>
              </div>

              <div class="pt-1 flex justify-end gap-3">
                <button type="button" (click)="fecharModal()"
                        class="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                        [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
                  Cancelar
                </button>
                <button type="submit" [disabled]="salvando"
                        class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
                  {{ salvando ? 'Salvando...' : 'Salvar Empresa' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class EmpresasComponent implements OnInit {
  t      = inject(ThemeService);
  private api = inject(EmpresasApiService);
  private fb  = inject(FormBuilder);

  empresas: Empresa[] = [];
  carregando = true;
  erro       = '';
  modalAberto = false;
  salvando    = false;
  erroModal   = '';

  form = this.fb.group({
    cnpj:          ['', Validators.required],
    razao_social:  ['', Validators.required],
    nome_fantasia: [''],
    saldo_inicial: [null as number | null],
  });

  ngOnInit() {
    this.api.listar().subscribe({
      next: data => { this.empresas = data; this.carregando = false; },
      error: ()   => { this.erro = 'Erro ao carregar empresas.'; this.carregando = false; },
    });
  }

  abrirModal() { this.modalAberto = true; this.erroModal = ''; this.form.reset(); }

  fecharModal(event?: Event) {
    if (!event || event.target === event.currentTarget) this.modalAberto = false;
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando  = true;
    this.erroModal = '';
    const { cnpj, razao_social, nome_fantasia, saldo_inicial } = this.form.value;
    this.api.criar({ cnpj: cnpj!, razao_social: razao_social!, nome_fantasia: nome_fantasia ?? undefined, saldo_inicial }).subscribe({
      next: empresa => {
        this.empresas = [...this.empresas, empresa];
        this.salvando = false;
        this.modalAberto = false;
      },
      error: (err) => {
        this.erroModal = err?.error?.errors?.[0] ?? 'Erro ao salvar empresa.';
        this.salvando  = false;
      },
    });
  }

  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  formatarSaldo(saldo: string | null): string {
    if (!saldo) return 'R$ 0,00';
    return Number(saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  corIniciais(papel: string): string {
    const map: Record<string, string> = {
      dono:      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      socio:     'bg-purple-500/10 text-purple-500 border-purple-500/20',
      contador:  'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return map[papel] ?? map['dono'];
  }

  corPapel(papel: string): string {
    return papel === 'dono' || papel === 'socio'
      ? 'bg-green-500/10 text-green-500'
      : 'bg-blue-500/10 text-blue-500';
  }

  corPonto(papel: string): string {
    return papel === 'dono' || papel === 'socio' ? 'bg-green-500' : 'bg-blue-500';
  }

  labelPapel(papel: string): string {
    const map: Record<string, string> = { dono: 'Dono', socio: 'Sócio', contador: 'Contador' };
    return map[papel] ?? papel;
  }
}
