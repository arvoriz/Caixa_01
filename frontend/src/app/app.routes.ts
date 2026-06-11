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
        path: 'lancamentos',
        loadComponent: () => import('./features/lancamentos/lancamentos.component').then(m => m.LancamentosComponent),
      },
      {
        path: 'empresas',
        loadComponent: () => import('./features/empresas/empresas.component').then(m => m.EmpresasComponent),
      },
      {
        path: 'emprestimos',
        loadComponent: () => import('./features/emprestimos/emprestimos.component').then(m => m.EmprestimosComponent),
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./features/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
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
      {
        path: 'redefinir-senha',
        loadComponent: () => import('./features/auth/redefinir-senha/redefinir-senha.component').then(m => m.RedefinirSenhaComponent),
      },
    ],
  },
  {
    path: 'convite',
    loadComponent: () => import('./features/auth/convite/convite.component').then(m => m.ConviteComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
