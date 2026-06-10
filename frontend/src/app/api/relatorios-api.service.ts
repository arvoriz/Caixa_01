import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';
import { Emprestimo } from './emprestimos-api.service';
import { TipoTransacao } from './categorias-api.service';

export interface LinhaCategoria { nome: string | null; valor: string; }

export interface RelatorioFluxoCaixa {
  de: string;
  ate: string;
  saldo_inicial: string;
  entradas_total: string;
  saidas_total: string;
  saldo_final: string;
  entradas: LinhaCategoria[];
  saidas: LinhaCategoria[];
}

export interface ContaItem {
  id: string;
  descricao: string;
  categoria: string | null;
  tipo: TipoTransacao;
  valor: string;
  data_vencimento: string;
  dias_atraso: number;
}

export interface RelatorioContas {
  inadimplencia: string;
  a_pagar: string;
  a_receber: string;
  itens: ContaItem[];
}

export interface RelatorioIntercompany {
  total_a_receber: string;
  total_a_pagar: string;
  saldo_liquido: string;
  contratos: Emprestimo[];
}

export interface RelatorioExternos {
  total_captado: string;
  saldo_devedor: string;
  total_pago: string;
  contratos: Emprestimo[];
}

export interface PeriodoFiltro { de?: string; ate?: string; }

@Injectable({ providedIn: 'root' })
export class RelatoriosApiService {
  private http = inject(HttpClient);
  private base(empresaId: string) { return `${environment.apiUrl}/empresas/${empresaId}/relatorios`; }

  private periodoQs(p: PeriodoFiltro): string {
    const params = new URLSearchParams();
    if (p.de)  params.set('de', p.de);
    if (p.ate) params.set('ate', p.ate);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  fluxoCaixa(empresaId: string, periodo: PeriodoFiltro = {}): Observable<RelatorioFluxoCaixa> {
    return this.http
      .get<RespostaApi<RelatorioFluxoCaixa>>(`${this.base(empresaId)}/fluxo_caixa${this.periodoQs(periodo)}`)
      .pipe(map(r => r.data));
  }

  contas(empresaId: string): Observable<RelatorioContas> {
    return this.http
      .get<RespostaApi<RelatorioContas>>(`${this.base(empresaId)}/contas`)
      .pipe(map(r => r.data));
  }

  intercompany(empresaId: string): Observable<RelatorioIntercompany> {
    return this.http
      .get<RespostaApi<RelatorioIntercompany>>(`${this.base(empresaId)}/intercompany`)
      .pipe(map(r => r.data));
  }

  externos(empresaId: string): Observable<RelatorioExternos> {
    return this.http
      .get<RespostaApi<RelatorioExternos>>(`${this.base(empresaId)}/externos`)
      .pipe(map(r => r.data));
  }
}
