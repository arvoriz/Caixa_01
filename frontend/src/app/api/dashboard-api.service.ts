import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespostaApi } from '../core/models/user.model';
import { TipoTransacao } from './categorias-api.service';
import { StatusLancamento } from './lancamentos-api.service';

export interface FluxoMes  { label: string; receita: string; despesa: string; atual: boolean; }
export interface DespesaCategoria { nome: string | null; valor: string; pct: number; }

export interface AlertaConta {
  id: string;
  descricao: string;
  categoria: string | null;
  tipo: TipoTransacao;
  valor: string;
  data_vencimento: string;
  dias_atraso: number;
  vence_hoje: boolean;
}

export interface TransacaoRecente {
  id: string;
  descricao: string;
  categoria: string | null;
  tipo: TipoTransacao;
  valor: string;
  status: StatusLancamento;
  data: string | null;
  criado_em: string;
}

export interface DashboardResumo {
  saldo_atual: string;
  receitas_mes: string;
  despesas_mes: string;
  a_receber: string;
  a_pagar: string;
  mutuo_a_receber: string;
  fluxo_mensal: FluxoMes[];
  despesas_categoria: DespesaCategoria[];
  alertas: AlertaConta[];
  ultimas_transacoes: TransacaoRecente[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private http = inject(HttpClient);

  resumo(empresaId: string): Observable<DashboardResumo> {
    return this.http
      .get<RespostaApi<DashboardResumo>>(`${environment.apiUrl}/empresas/${empresaId}/dashboard`)
      .pipe(map(r => r.data));
  }
}
