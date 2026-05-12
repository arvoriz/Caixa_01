import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'empresas',
        loadComponent: () => import('./features/empresas/empresas.component').then(m => m.EmpresasComponent),
      },
      // Adicionar novas rotas aqui dentro do shell (área autenticada)
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'callback',
        loadComponent: () => import('./features/auth/callback/callback.component').then(m => m.CallbackComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
