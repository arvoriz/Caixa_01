import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresaAtivaService } from '../../core/services/empresa-ativa.service';
import {
  RelatoriosApiService,
  RelatorioFluxoCaixa, RelatorioContas, RelatorioIntercompany, RelatorioExternos,
} from '../../api/relatorios-api.service';
import { ChaveRelatorio, tituloRelatorio } from './relatorios.helpers';
import { RelatorioFluxoComponent } from './relatorio-fluxo.component';
import { RelatorioContasComponent } from './relatorio-contas.component';
import { RelatorioIntercompanyComponent } from './relatorio-intercompany.component';
import { RelatorioExternosComponent } from './relatorio-externos.component';

type Periodo = 'mes_atual' | 'mes_anterior' | 'ano_atual';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    RelatorioFluxoComponent, RelatorioContasComponent,
    RelatorioIntercompanyComponent, RelatorioExternosComponent,
  ],
  template: `
    <div class="p-6 lg:p-10 flex flex-col">

      @if (!empresaAtiva.ativa()) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Selecione uma empresa no topo para ver os relatórios.
          </p>
        </div>
      } @else if (!selecionado()) {

        <!-- Lista de relatórios -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold mb-1">Central de Relatórios</h1>
          <p class="text-sm transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
            Informações contábeis e gerenciais de <span class="font-medium">{{ empresaAtiva.ativa()?.nome_fantasia || empresaAtiva.ativa()?.razao_social }}</span>.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (card of cards; track card.chave) {
            <div (click)="abrir(card.chave)"
                 class="p-6 rounded-3xl border transition-all duration-300 shadow-sm cursor-pointer group flex flex-col h-full"
                 [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] ' + card.hoverDark : 'bg-white border-slate-200 ' + card.hoverLight">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" [ngClass]="card.iconBg">
                <span [innerHTML]="card.icon"></span>
              </div>
              <h3 class="font-bold text-lg mb-2">{{ card.titulo }}</h3>
              <p class="text-xs mb-4 flex-1 leading-relaxed" [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">{{ card.descricao }}</p>
              <div class="flex items-center text-sm font-bold" [ngClass]="card.linkCor">
                Acessar Relatório
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          }
        </div>

      } @else {

        <!-- Cabeçalho do relatório -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 no-print">
          <div>
            <button (click)="voltar()" class="flex items-center text-sm font-medium mb-4 transition-colors group" [ngClass]="t.isDark() ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'">
              <div class="w-6 h-6 rounded-full border flex items-center justify-center mr-2 group-hover:-translate-x-1 transition-transform" [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-300'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </div>
              Voltar aos Relatórios
            </button>
            <h1 class="text-3xl font-bold">{{ tituloRelatorio(selecionado()!) }}</h1>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            @if (selecionado() === 'fluxo') {
              <select [ngModel]="periodo()" (ngModelChange)="mudarPeriodo($event)"
                      class="text-sm font-medium rounded-full px-4 py-2 border outline-none cursor-pointer"
                      [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c] text-white' : 'bg-white border-slate-200 text-slate-800'">
                <option value="mes_atual">Este mês</option>
                <option value="mes_anterior">Mês anterior</option>
                <option value="ano_atual">Este ano</option>
              </select>
            }
            <button (click)="exportarPdf()"
                    class="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
                    [ngClass]="t.isDark() ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Exportar PDF
            </button>
          </div>
        </div>

        <!-- Conteúdo -->
        @if (carregando()) {
          <div class="rounded-3xl border p-6 animate-pulse h-64" [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"></div>
        } @else if (erro()) {
          <div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro() }}</div>
        } @else {
          <div class="printable-report">
            <div class="hidden print:block mb-6">
              <h1 class="text-2xl font-bold">{{ tituloRelatorio(selecionado()!) }}</h1>
              <p class="text-sm text-slate-500">{{ empresaAtiva.ativa()?.nome_fantasia || empresaAtiva.ativa()?.razao_social }}</p>
            </div>

            @switch (selecionado()) {
              @case ('fluxo')        { @if (fluxo())        { <app-relatorio-fluxo        [data]="fluxo()!" /> } }
              @case ('contas')       { @if (contas())       { <app-relatorio-contas       [data]="contas()!" /> } }
              @case ('intercompany') { @if (intercompany()) { <app-relatorio-intercompany [data]="intercompany()!" /> } }
              @case ('externos')     { @if (externos())     { <app-relatorio-externos     [data]="externos()!" /> } }
            }
          </div>
        }
      }
    </div>
  `,
})
export class RelatoriosComponent {
  t            = inject(ThemeService);
  empresaAtiva = inject(EmpresaAtivaService);
  private api  = inject(RelatoriosApiService);
  private san  = inject(DomSanitizer);

  selecionado = signal<ChaveRelatorio | null>(null);
  periodo     = signal<Periodo>('mes_atual');
  carregando  = signal(false);
  erro        = signal('');

  fluxo        = signal<RelatorioFluxoCaixa | null>(null);
  contas       = signal<RelatorioContas | null>(null);
  intercompany = signal<RelatorioIntercompany | null>(null);
  externos     = signal<RelatorioExternos | null>(null);

  tituloRelatorio = tituloRelatorio;

  cards = [
    {
      chave: 'fluxo' as ChaveRelatorio,
      titulo: 'Fluxo de Caixa',
      descricao: 'Entradas, saídas e saldos do período agrupados por categoria (regime de caixa).',
      iconBg: 'bg-blue-500/10 text-blue-500', linkCor: 'text-blue-500',
      hoverDark: 'hover:border-blue-500/50', hoverLight: 'hover:border-blue-400',
      icon: this.san.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>'),
    },
    {
      chave: 'contas' as ChaveRelatorio,
      titulo: 'Contas a Pagar e a Receber',
      descricao: 'Provisão e inadimplência: compromissos em aberto com cálculo de dias de atraso.',
      iconBg: 'bg-yellow-500/10 text-yellow-500', linkCor: 'text-yellow-500',
      hoverDark: 'hover:border-yellow-500/50', hoverLight: 'hover:border-yellow-400',
      icon: this.san.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>'),
    },
    {
      chave: 'intercompany' as ChaveRelatorio,
      titulo: 'Saldos Devedores Intercompany',
      descricao: 'Contratos de mútuo: quem deve a quem entre os seus próprios CNPJs.',
      iconBg: 'bg-purple-500/10 text-purple-500', linkCor: 'text-purple-500',
      hoverDark: 'hover:border-purple-500/50', hoverLight: 'hover:border-purple-400',
      icon: this.san.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="m10 13 2 2 2-2"/><path d="M12 15V8"/><path d="M18 4v4"/><path d="M6 4v4"/><rect width="20" height="8" x="2" y="4" rx="2"/></svg>'),
    },
    {
      chave: 'externos' as ChaveRelatorio,
      titulo: 'Empréstimos Externos',
      descricao: 'Captação em bancos ou terceiros: saldos restantes, progresso e impacto no caixa.',
      iconBg: 'bg-orange-500/10 text-orange-500', linkCor: 'text-orange-500',
      hoverDark: 'hover:border-orange-500/50', hoverLight: 'hover:border-orange-400',
      icon: this.san.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>'),
    },
  ];

  private get empresaId(): string | null {
    return this.empresaAtiva.ativa()?.id ?? null;
  }

  private intervalo(): { de: string; ate: string } {
    const hoje = new Date();
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    switch (this.periodo()) {
      case 'mes_anterior': {
        const de  = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const ate = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        return { de: iso(de), ate: iso(ate) };
      }
      case 'ano_atual':
        return { de: `${hoje.getFullYear()}-01-01`, ate: `${hoje.getFullYear()}-12-31` };
      default: {
        const de  = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        return { de: iso(de), ate: iso(ate) };
      }
    }
  }

  abrir(chave: ChaveRelatorio) {
    this.selecionado.set(chave);
    this.carregar();
  }

  voltar() {
    this.selecionado.set(null);
    this.erro.set('');
  }

  mudarPeriodo(p: Periodo) {
    this.periodo.set(p);
    if (this.selecionado() === 'fluxo') this.carregar();
  }

  private carregar() {
    const id = this.empresaId;
    const chave = this.selecionado();
    if (!id || !chave) return;

    this.carregando.set(true);
    this.erro.set('');
    const fail = () => { this.erro.set('Erro ao carregar relatório.'); this.carregando.set(false); };
    const done = () => this.carregando.set(false);

    switch (chave) {
      case 'fluxo':
        this.api.fluxoCaixa(id, this.intervalo()).subscribe({ next: d => { this.fluxo.set(d); done(); }, error: fail });
        break;
      case 'contas':
        this.api.contas(id).subscribe({ next: d => { this.contas.set(d); done(); }, error: fail });
        break;
      case 'intercompany':
        this.api.intercompany(id).subscribe({ next: d => { this.intercompany.set(d); done(); }, error: fail });
        break;
      case 'externos':
        this.api.externos(id).subscribe({ next: d => { this.externos.set(d); done(); }, error: fail });
        break;
    }
  }

  exportarPdf() {
    window.print();
  }
}
