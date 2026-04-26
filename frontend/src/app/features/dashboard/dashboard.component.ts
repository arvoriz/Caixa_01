import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h2 class="page-title">Bem-vindo, {{ auth.currentUser()?.name ?? '' }}</h2>
      <div class="card-grid">
        <!-- Cards de resumo virão aqui -->
        <div class="card">
          <p class="card__label">Total de registros</p>
          <p class="card__value">—</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  auth = inject(AuthService);
}
