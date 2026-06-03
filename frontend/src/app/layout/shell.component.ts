import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { ThemeService } from '../core/services/theme.service';
import { AuthService } from '../core/services/auth.service';
import { EmpresaAtivaService } from '../core/services/empresa-ativa.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden font-sans transition-colors duration-500 selection:bg-blue-500 selection:text-white"
         [ngClass]="theme.isDark() ? 'bg-[#0a0a0b] text-white' : 'bg-slate-50 text-slate-900'">
      <app-sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar />
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [':host { display: contents; }'],
})
export class ShellComponent implements OnInit {
  theme        = inject(ThemeService);
  private auth = inject(AuthService);
  private empresaAtiva = inject(EmpresaAtivaService);

  ngOnInit() {
    this.auth.carregarUsuarioAtual().subscribe({
      error: () => {
        // auth/me falhou (ex: coluna ainda não existe) — inicializa sem preferência
        this.empresaAtiva.inicializar(null);
      },
    });
  }
}
