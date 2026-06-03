import { Injectable, inject, signal } from '@angular/core';
import { EmpresasApiService, Empresa } from '../../api/empresas-api.service';
import { AuthApiService } from '../../api/auth-api.service';

@Injectable({ providedIn: 'root' })
export class EmpresaAtivaService {
  private api     = inject(EmpresasApiService);
  private authApi = inject(AuthApiService);

  empresas = signal<Empresa[]>([]);
  ativa    = signal<Empresa | null>(null);

  inicializar(ultimaEmpresaId: string | null) {
    this.api.listar().subscribe(lista => {
      this.empresas.set(lista);
      const ultima = ultimaEmpresaId ? lista.find(e => e.id === ultimaEmpresaId) ?? null : null;
      this.ativa.set(ultima ?? lista[0] ?? null);
    });
  }

  selecionar(empresa: Empresa) {
    this.ativa.set(empresa);
    // Persiste em background — sem bloquear a UI
    this.authApi.salvarUltimaEmpresa(empresa.id).subscribe();
  }

  limpar() {
    this.empresas.set([]);
    this.ativa.set(null);
  }
}
