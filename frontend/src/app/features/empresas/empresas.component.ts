import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresasApiService, Empresa } from '../../api/empresas-api.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import { EmpresaCardComponent } from './empresa-card.component';
import { EmpresaCriarModalComponent } from './empresa-criar-modal.component';
import { EmpresaGerenciarModalComponent } from './empresa-gerenciar-modal.component';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, EmpresaCardComponent, EmpresaCriarModalComponent, EmpresaGerenciarModalComponent],
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
        <button (click)="modalCriarAberto = true"
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
            <div class="p-6 rounded-2xl border animate-pulse h-44"
                 [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
              <div class="w-10 h-10 rounded-xl mb-4" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-100'"></div>
              <div class="h-4 rounded w-3/4 mb-2" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-100'"></div>
              <div class="h-3 rounded w-1/2" [ngClass]="t.isDark() ? 'bg-[#2a2a2c]' : 'bg-slate-100'"></div>
            </div>
          }
        </div>
      }

      <!-- Erro -->
      @if (!carregando && erro) {
        <div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro }}</div>
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
          <button (click)="modalCriarAberto = true"
                  class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nova Empresa
          </button>
        </div>
      }

      <!-- Grid -->
      @if (!carregando && !erro && empresas.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (empresa of empresas; track empresa.id) {
            <app-empresa-card [empresa]="empresa" (clicado)="empresaSelecionada = $event" />
          }
        </div>
      }

      <!-- Modal: criar empresa -->
      @if (modalCriarAberto) {
        <app-empresa-criar-modal
          (fechado)="modalCriarAberto = false"
          (empresaCriada)="onEmpresaCriada($event)"
        />
      }

      <!-- Modal: gerenciar empresa -->
      @if (empresaSelecionada) {
        <app-empresa-gerenciar-modal
          [empresa]="empresaSelecionada"
          (fechado)="empresaSelecionada = null"
          (empresaAtualizada)="onEmpresaAtualizada($event)"
          (empresaExcluida)="onEmpresaExcluida($event)"
        />
      }
    </div>
  `,
})
export class EmpresasComponent implements OnInit {
  t   = inject(ThemeService);
  private api = inject(EmpresasApiService);
  private empresaAtiva = inject(EmpresaAtivaService);

  empresas: Empresa[]     = [];
  carregando              = true;
  erro                    = '';
  modalCriarAberto        = false;
  empresaSelecionada: Empresa | null = null;

  ngOnInit() {
    this.api.listar().subscribe({
      next: data => { this.empresas = data; this.carregando = false; },
      error: ()  => { this.erro = 'Erro ao carregar empresas.'; this.carregando = false; },
    });
  }

  onEmpresaCriada(empresa: Empresa) {
    this.empresas = [...this.empresas, empresa];
    this.empresaAtiva.empresas.set(this.empresas);
    this.empresaAtiva.selecionar(empresa);
  }

  onEmpresaAtualizada(empresa: Empresa) {
    this.empresas = this.empresas.map(e => e.id === empresa.id ? empresa : e);
    this.empresaSelecionada = empresa;
  }

  onEmpresaExcluida(empresaId: string) {
    this.empresas = this.empresas.filter(e => e.id !== empresaId);
    this.empresaSelecionada = null;
    this.empresaAtiva.remover(empresaId);
  }
}
