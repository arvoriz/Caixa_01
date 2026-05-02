import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  formulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  carregando = false;
  erro       = '';

  enviar() {
    if (this.formulario.invalid) return;
    this.carregando = true;
    this.erro       = '';

    const { email, senha } = this.formulario.value;

    this.auth.entrar(email!, senha!).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.erro       = err.message ?? 'Erro ao fazer login';
        this.carregando = false;
      },
    });
  }
}
