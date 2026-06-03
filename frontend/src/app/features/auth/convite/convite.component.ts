import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConviteApiService, ConviteInfo } from '../../../api/convite-api.service';

const INVITE_TOKEN_KEY = 'convite_token_pendente';

@Component({
  selector: 'app-convite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-4">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-white">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"/>
            </svg>
          </div>
        </div>

        <!-- Card -->
        <div class="rounded-2xl border bg-[#121214] border-[#2a2a2c] shadow-2xl p-8 text-center">

          <!-- Carregando -->
          @if (carregando) {
            <div class="flex flex-col items-center gap-4">
              <div class="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <p class="text-gray-400 text-sm">Validando convite...</p>
            </div>
          }

          <!-- Erro -->
          @if (!carregando && erro) {
            <div class="flex flex-col items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white mb-2">Convite inválido</h2>
                <p class="text-gray-400 text-sm">{{ erro }}</p>
              </div>
              <button (click)="irParaLogin()"
                      class="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[#18181b] border border-[#2a2a2c] text-gray-300 hover:bg-[#27272a] transition-colors">
                Ir para o login
              </button>
            </div>
          }

          <!-- Convite válido -->
          @if (!carregando && !erro && convite) {
            <div class="flex flex-col items-center gap-5">
              <div class="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/>
                </svg>
              </div>

              <div>
                <p class="text-gray-400 text-sm mb-1">Você foi convidado para</p>
                <h2 class="text-2xl font-bold text-white mb-1">{{ convite.nome_fantasia || convite.razao_social }}</h2>
                @if (convite.nome_fantasia) {
                  <p class="text-gray-500 text-xs mb-2">{{ convite.razao_social }}</p>
                }
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                      [ngClass]="convite.papel === 'socio' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'">
                  <span class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="convite.papel === 'socio' ? 'bg-blue-500' : 'bg-orange-500'"></span>
                  {{ convite.papel === 'socio' ? 'Sócio' : 'Contador' }}
                </span>
              </div>

              <p class="text-xs text-gray-500">
                Este convite expira em {{ formatarExpiracao(convite.expira_em) }}
              </p>

              <button (click)="aceitar()"
                      class="w-full py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                Entrar e aceitar convite
              </button>

              <p class="text-xs text-gray-500">
                Será necessário fazer login ou criar uma conta para aceitar.
              </p>
            </div>
          }

        </div>
      </div>
    </div>
  `,
})
export class ConviteComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(ConviteApiService);

  convite: ConviteInfo | null = null;
  carregando = true;
  erro = '';
  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.erro      = 'Link de convite inválido.';
      this.carregando = false;
      return;
    }

    this.api.validar(this.token).subscribe({
      next:  info => { this.convite = info; this.carregando = false; },
      error: ()   => { this.erro = 'Este convite é inválido ou já expirou.'; this.carregando = false; },
    });
  }

  aceitar() {
    localStorage.setItem(INVITE_TOKEN_KEY, this.token);
    this.router.navigate(['/auth/login']);
  }

  irParaLogin() {
    this.router.navigate(['/auth/login']);
  }

  formatarExpiracao(iso: string): string {
    const diff = new Date(iso).getTime() - Date.now();
    const horas = Math.floor(diff / 3_600_000);
    if (horas <= 0) return 'menos de 1 hora';
    return `${horas}h`;
  }
}

export { INVITE_TOKEN_KEY };
