import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

interface Empresa {
  iniciais: string;
  cor: string;
  corBorda: string;
  nome: string;
  razao: string;
  cnpj: string;
  saldo: string;
  papel: string;
  papelCor: string;
}

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule],
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

      <!-- Grid de Empresas -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (empresa of empresas; track empresa.cnpj) {
          <div class="p-6 rounded-2xl border transition-colors shadow-sm flex flex-col"
               [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] hover:border-[#3f3f46]' : 'bg-white border-slate-200 hover:border-slate-300'">

            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border"
                   [ngClass]="[empresa.cor, empresa.corBorda]">
                {{ empresa.iniciais }}
              </div>
              <button class="p-1.5 rounded-lg transition-colors"
                      [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>

            <div class="flex-1">
              <h3 class="font-bold text-lg mb-1">{{ empresa.nome }}</h3>
              <p class="text-xs mb-3 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
                Razão: {{ empresa.razao }}
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
                <p class="font-bold text-sm" [ngClass]="empresa.saldo === 'Restrito' ? (t.isDark() ? 'text-gray-500' : 'text-slate-400') : ''">
                  {{ empresa.saldo }}
                </p>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium" [ngClass]="empresa.papelCor">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="empresa.papel === 'Dono' ? 'bg-green-500' : 'bg-blue-500'"></span>
                {{ empresa.papel }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (modalAberto) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             (click)="fecharModal($event)">
          <div class="w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col"
               [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
               (click)="$event.stopPropagation()">

            <!-- Header -->
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

            <!-- Body -->
            <div class="p-6 space-y-5">
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">CNPJ *</label>
                <input type="text" placeholder="00.000.000/0000-00"
                       class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Razão Social *</label>
                <input type="text" placeholder="Ex: Tech Solutions Software ME"
                       class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Nome Fantasia</label>
                  <input type="text" placeholder="Como é conhecida"
                         class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Saldo Inicial (R$)</label>
                  <input type="number" placeholder="0,00"
                         class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t flex justify-end gap-3 transition-colors rounded-b-2xl"
                 [ngClass]="t.isDark() ? 'border-[#2a2a2c] bg-[#121214]' : 'border-slate-100 bg-slate-50'">
              <button (click)="fecharModal()"
                      class="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                      [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
                Cancelar
              </button>
              <button class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                Salvar Empresa
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EmpresasComponent {
  t = inject(ThemeService);

  modalAberto = false;

  empresas: Empresa[] = [
    {
      iniciais: 'TS', cor: 'bg-blue-500/10 text-blue-500',   corBorda: 'border-blue-500/20',
      nome: 'Tech Solutions Ltda',  razao: 'Tech Solutions Software ME',
      cnpj: '12.345.678/0001-90',  saldo: 'R$ 15.000,00',
      papel: 'Dono', papelCor: 'bg-green-500/10 text-green-500',
    },
    {
      iniciais: 'CB', cor: 'bg-purple-500/10 text-purple-500', corBorda: 'border-purple-500/20',
      nome: 'Comercial Beta',       razao: 'Comercial Beta Varejista SA',
      cnpj: '98.765.432/0001-10',  saldo: 'R$ 5.500,00',
      papel: 'Dono', papelCor: 'bg-green-500/10 text-green-500',
    },
    {
      iniciais: 'CS', cor: 'bg-orange-500/10 text-orange-500', corBorda: 'border-orange-500/20',
      nome: 'Consultoria Silva',    razao: 'Silva & Filhos Consultoria',
      cnpj: '45.123.890/0001-55',  saldo: 'Restrito',
      papel: 'Sócio', papelCor: 'bg-blue-500/10 text-blue-500',
    },
  ];

  abrirModal() { this.modalAberto = true; }

  fecharModal(event?: Event) {
    if (!event || event.target === event.currentTarget) {
      this.modalAberto = false;
    }
  }
}
