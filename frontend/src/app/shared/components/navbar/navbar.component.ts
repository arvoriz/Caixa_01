import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="navbar">
      <div class="navbar__left">
        <h1 class="navbar__title">{{ titulo }}</h1>
      </div>
      <div class="navbar__right">
        <span class="navbar__usuario">{{ auth.usuarioAtual()?.nome }}</span>
        <button class="btn btn--ghost" (click)="auth.sair()">Sair</button>
      </div>
    </header>
  `,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  auth   = inject(AuthService);
  titulo = 'Dashboard';
}
