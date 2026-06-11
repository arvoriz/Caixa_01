import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresasApiService, Empresa, AcessoDetalhe } from '../../api/empresas-api.service';
import {
  formatarSaldo, labelPapel, badgePapel, avatarPapel,
  corPapel, corPapelBg, podeRemoverAcesso,
} from './empresas.helpers';
import { extrairErroApi } from '../../core/utils/erro-api';
import { ScrollTopOnChangeDirective } from '../../shared/directives/scroll-to-top-on-change.directive';

@Component({
  selector: 'app-empresa-gerenciar-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ScrollTopOnChangeDirective],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         (click)="fechar($event)">
      <div class="w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh]"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-start justify-between p-6 border-b transition-colors"
             [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h3 class="text-xl font-bold">{{ empresa.nome_fantasia || empresa.razao_social }}</h3>
              <span class="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border"
                    [ngClass]="badgePapel(empresa.papel)">
                {{ labelPapel(empresa.papel) }}
              </span>
            </div>
            <p class="text-xs font-mono mt-1 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
              {{ empresa.cnpj }}
            </p>
          </div>
          <button (click)="fechar()" class="p-1 rounded-lg shrink-0 transition-colors"
                  [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b px-6 gap-6 shrink-0 transition-colors"
             [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <button (click)="abaAtiva = 'dados'"
                  class="py-4 text-sm font-medium border-b-2 transition-colors"
                  [ngClass]="abaAtiva === 'dados'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent ' + (t.isDark() ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-800')">
            Dados da Empresa
          </button>
          @if (podeVerAcessos) {
            <button (click)="selecionarAbaAcessos()"
                    class="py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
                    [ngClass]="abaAtiva === 'acessos'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent ' + (t.isDark() ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-800')">
              Acessos & Usuários
              @if (acessos.length > 0) {
                <span class="flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-blue-500/20 text-blue-500">
                  {{ acessos.length }}
                </span>
              }
            </button>
          }
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex-1" [appScrollTopOnChange]="erro">

          <!-- TAB: Dados -->
          @if (abaAtiva === 'dados') {
            <div class="space-y-5">
              @if (erro) {
                <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro }}</div>
              }
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">CNPJ</label>
                  <input type="text" [value]="empresa.cnpj" disabled
                         class="w-full text-sm rounded-xl px-4 py-3 border outline-none opacity-50 cursor-not-allowed transition-colors"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                         [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Saldo Atual</label>
                  <input type="text" [value]="formatarSaldo(empresa.saldo_atual)" disabled
                         class="w-full text-sm rounded-xl px-4 py-3 border outline-none opacity-50 cursor-not-allowed transition-colors"
                         [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Razão Social</label>
                <input type="text" [value]="empresa.razao_social" disabled
                       class="w-full text-sm rounded-xl px-4 py-3 border outline-none opacity-50 cursor-not-allowed transition-colors"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
              </div>
              <div [formGroup]="formDados">
                <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                       [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Nome Fantasia</label>
                <input formControlName="nome_fantasia" type="text" placeholder="Como é conhecida"
                       class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border outline-none transition-colors"
                       [class.opacity-50]="!podeEditar"
                       [class.cursor-not-allowed]="!podeEditar"
                       [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
              </div>
              @if (podeEditar) {
                <div class="flex justify-end pt-2">
                  <button (click)="salvarDados()" [disabled]="salvandoDados"
                          class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
                    {{ salvandoDados ? 'Salvando...' : 'Salvar Alterações' }}
                  </button>
                </div>
              }
            </div>
          }

          <!-- TAB: Acessos -->
          @if (abaAtiva === 'acessos') {
            <div class="space-y-6">
              @if (erro) {
                <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro }}</div>
              }

              <!-- Painel convite -->
              <div class="p-4 rounded-xl border transition-colors"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c]' : 'bg-slate-50 border-slate-200'">
                <h4 class="font-bold text-sm mb-1">Convidar via Link</h4>
                <p class="text-xs mb-3 transition-colors" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">
                  Gere um link de convite com expiração de 24 horas e uso único.
                </p>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <select [(ngModel)]="papelConvite"
                          class="text-sm rounded-lg px-3 py-2 border outline-none transition-colors"
                          [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-gray-300' : 'bg-white border-slate-200 text-slate-700'">
                    @if (empresa.papel === 'dono') {
                      <option value="socio">Sócio</option>
                    }
                    <option value="contador">Contador</option>
                  </select>
                  <button (click)="gerarLink()" [disabled]="gerandoLink"
                          class="px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shrink-0 disabled:opacity-60">
                    {{ gerandoLink ? 'Gerando...' : 'Gerar Link' }}
                  </button>
                </div>
                @if (linkGerado) {
                  <div class="flex items-center gap-2 mt-3 pt-3 border-t transition-colors"
                       [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-200'">
                    <input type="text" readonly [value]="linkGerado"
                           class="flex-1 text-xs rounded-lg px-3 py-2 border outline-none font-mono transition-colors"
                           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-gray-300' : 'bg-white border-slate-200 text-slate-600'">
                    <button (click)="copiarLink()"
                            class="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 transition-colors flex items-center gap-1.5 shrink-0">
                      @if (!linkCopiado) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        Copiar
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        Copiado!
                      }
                    </button>
                  </div>
                }
              </div>

              <!-- Lista de usuários -->
              <div>
                <h4 class="font-bold text-sm mb-3">Usuários com Acesso</h4>
                @if (carregandoAcessos) {
                  <div class="space-y-3">
                    @for (_ of [1,2]; track $index) {
                      <div class="p-3.5 rounded-xl border animate-pulse h-16"
                           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"></div>
                    }
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (acesso of acessos; track acesso.id) {
                      <div class="flex items-center justify-between gap-2 p-3.5 rounded-xl border transition-colors"
                           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'">
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                               [ngClass]="avatarPapel(acesso.papel)">
                            {{ (acesso.nome || acesso.email).charAt(0).toUpperCase() }}
                          </div>
                          <div class="min-w-0">
                            <p class="text-sm font-bold leading-none mb-1 truncate">{{ acesso.nome || acesso.email }}</p>
                            <p class="text-xs truncate transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
                              {{ acesso.email }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                                [ngClass]="corPapel(acesso.papel) + ' ' + corPapelBg(acesso.papel)">
                            {{ labelPapel(acesso.papel) }}
                          </span>
                          @if (empresa.papel === 'dono' && acesso.papel === 'socio') {
                            <button (click)="transferirTitularidade(acesso)"
                                    class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                                    title="Transferir titularidade">
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                            </button>
                          }
                          @if (podeRemoverAcessoFn(acesso)) {
                            <button (click)="removerAcesso(acesso)"
                                    class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                    title="Remover acesso">
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class EmpresaGerenciarModalComponent implements OnInit {
  @Input() empresa!: Empresa;
  @Output() fechado          = new EventEmitter<void>();
  @Output() empresaAtualizada = new EventEmitter<Empresa>();

  t       = inject(ThemeService);
  private api = inject(EmpresasApiService);
  private fb  = inject(FormBuilder);

  abaAtiva: 'dados' | 'acessos' = 'dados';
  acessos: AcessoDetalhe[] = [];
  carregandoAcessos = false;
  salvandoDados = false;
  erro = '';
  papelConvite: 'socio' | 'contador' = 'contador';
  linkGerado  = '';
  linkCopiado = false;
  gerandoLink = false;

  formDados = this.fb.group({ nome_fantasia: [''] });

  // expor helpers ao template
  formatarSaldo = formatarSaldo;
  labelPapel    = labelPapel;
  badgePapel    = badgePapel;
  avatarPapel   = avatarPapel;
  corPapel      = corPapel;
  corPapelBg    = corPapelBg;

  get podeEditar(): boolean    { return this.empresa.papel !== 'contador'; }
  get podeVerAcessos(): boolean { return this.empresa.papel !== 'contador'; }
  podeRemoverAcessoFn(acesso: AcessoDetalhe) { return podeRemoverAcesso(this.empresa.papel, acesso.papel); }

  ngOnInit() {
    this.papelConvite = this.empresa.papel === 'dono' ? 'socio' : 'contador';
    this.formDados.patchValue({ nome_fantasia: this.empresa.nome_fantasia ?? '' });
    if (!this.podeEditar) this.formDados.disable(); else this.formDados.enable();
  }

  fechar(event?: Event) {
    if (!event || event.target === event.currentTarget) this.fechado.emit();
  }

  selecionarAbaAcessos() {
    this.abaAtiva = 'acessos';
    if (this.acessos.length === 0 && !this.carregandoAcessos) this.carregarAcessos();
  }

  carregarAcessos() {
    this.carregandoAcessos = true;
    this.api.listarAcessos(this.empresa.id).subscribe({
      next: data => { this.acessos = data; this.carregandoAcessos = false; },
      error: ()  => { this.erro = 'Erro ao carregar usuários.'; this.carregandoAcessos = false; },
    });
  }

  salvarDados() {
    this.salvandoDados = true;
    this.erro = '';
    const { nome_fantasia } = this.formDados.value;
    this.api.atualizar(this.empresa.id, { nome_fantasia: nome_fantasia ?? '' }).subscribe({
      next: atualizada => {
        this.salvandoDados = false;
        this.empresaAtualizada.emit({ ...atualizada, papel: this.empresa.papel });
      },
      error: (err) => { this.erro = extrairErroApi(err, 'Erro ao salvar.'); this.salvandoDados = false; },
    });
  }

  removerAcesso(acesso: AcessoDetalhe) {
    this.api.removerAcesso(this.empresa.id, acesso.id).subscribe({
      next: () => { this.acessos = this.acessos.filter(a => a.id !== acesso.id); },
      error: (err) => { this.erro = extrairErroApi(err, 'Erro ao remover acesso.'); },
    });
  }

  gerarLink() {
    this.gerandoLink = true;
    this.linkGerado  = '';
    this.api.gerarConvite(this.empresa.id, this.papelConvite).subscribe({
      next: resp => { this.linkGerado = resp.url; this.gerandoLink = false; },
      error: (err) => { this.erro = extrairErroApi(err, 'Erro ao gerar link.'); this.gerandoLink = false; },
    });
  }

  copiarLink() {
    navigator.clipboard.writeText(this.linkGerado).then(() => {
      this.linkCopiado = true;
      setTimeout(() => this.linkCopiado = false, 2500);
    });
  }

  transferirTitularidade(acesso: AcessoDetalhe) {
    this.api.transferirTitularidade(this.empresa.id, acesso.id).subscribe({
      next: () => {
        this.acessos = this.acessos.map(a => {
          if (a.id === acesso.id) return { ...a, papel: 'dono' as const };
          if (a.papel === 'dono') return { ...a, papel: 'socio' as const };
          return a;
        });
        this.empresaAtualizada.emit({ ...this.empresa, papel: 'socio' });
      },
      error: (err) => { this.erro = extrairErroApi(err, 'Erro ao transferir titularidade.'); },
    });
  }
}
