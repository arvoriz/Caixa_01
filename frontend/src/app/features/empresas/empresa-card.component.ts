import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { inject } from '@angular/core';
import { Empresa } from '../../api/empresas-api.service';
import { iniciais, formatarSaldo, labelPapel, corIniciais, corPapel, corPapelBg, corPonto } from './empresas.helpers';

@Component({
  selector: 'app-empresa-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="clicado.emit(empresa)"
         class="p-5 rounded-2xl border transition-all duration-200 flex flex-col cursor-pointer group hover:scale-[1.02] hover:-translate-y-0.5"
         [ngClass]="t.isDark()
           ? 'bg-[#121214] border-[#2a2a2c] hover:bg-[#16161a] hover:border-blue-500/50 hover:shadow-[0_0_28px_rgba(37,99,235,0.15)]'
           : 'bg-white border-slate-200 hover:bg-blue-50/60 hover:border-blue-400/60 hover:shadow-[0_6px_24px_rgba(37,99,235,0.12)]'">

      <div class="flex items-start mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors"
             [ngClass]="corIniciais(empresa.papel)">
          {{ iniciais(empresa.nome_fantasia || empresa.razao_social) }}
        </div>
      </div>

      <div class="flex-1">
        <h3 class="font-bold text-base mb-0.5 group-hover:text-blue-500 transition-colors leading-snug">
          {{ empresa.nome_fantasia || empresa.razao_social }}
        </h3>
        <p class="text-xs mb-3 transition-colors" [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-500'">
          {{ empresa.razao_social }}
        </p>
        <div class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border"
             [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'">
          {{ empresa.cnpj }}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t flex items-center justify-between transition-colors"
           [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
        <div>
          <p class="text-[10px] uppercase font-semibold tracking-wider mb-0.5 transition-colors"
             [ngClass]="t.isDark() ? 'text-gray-500' : 'text-slate-400'">Saldo Atual</p>
          <p class="font-bold text-sm">{{ formatarSaldo(empresa.saldo_atual) }}</p>
        </div>
        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
              [ngClass]="corPapel(empresa.papel) + ' ' + corPapelBg(empresa.papel)">
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="corPonto(empresa.papel)"></span>
          {{ labelPapel(empresa.papel) }}
        </span>
      </div>
    </div>
  `,
})
export class EmpresaCardComponent {
  @Input() empresa!: Empresa;
  @Output() clicado = new EventEmitter<Empresa>();

  t = inject(ThemeService);

  iniciais     = iniciais;
  formatarSaldo = formatarSaldo;
  labelPapel   = labelPapel;
  corIniciais  = corIniciais;
  corPapel     = corPapel;
  corPapelBg   = corPapelBg;
  corPonto     = corPonto;
}
