import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb       = inject(FormBuilder);
  private auth     = inject(AuthService);
  private supabase = inject(SupabaseService);
  private router   = inject(Router);

  formulario = this.fb.group({
    nome:  [''],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  carregando = false;
  erro       = '';
  sucesso    = '';
  modoEscuro = true;
  isLogin    = true;

  alternarTema(): void {
    this.modoEscuro = !this.modoEscuro;
  }

  toggleModo(event: Event): void {
    event.preventDefault();
    this.isLogin = !this.isLogin;
    this.erro    = '';
    this.sucesso = '';
    const nomeCtrl = this.formulario.get('nome')!;
    if (this.isLogin) {
      nomeCtrl.clearValidators();
    } else {
      nomeCtrl.setValidators([Validators.required, Validators.minLength(2)]);
    }
    nomeCtrl.updateValueAndValidity();
    this.formulario.reset();
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.carregando = true;
    this.erro       = '';
    this.sucesso    = '';

    const { email, senha, nome } = this.formulario.value;

    if (this.isLogin) {
      this.auth.entrar(email!, senha!).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err: Error) => {
          this.erro       = err.message ?? 'E-mail ou senha incorretos';
          this.carregando = false;
        },
      });
    } else {
      this.auth.cadastrar(email!, senha!, nome!).subscribe({
        next: ({ data }: { data: { session: unknown } }) => {
          this.carregando = false;
          if (!data.session) {
            this.sucesso = 'Conta criada! Verifique seu e-mail para confirmar o cadastro.';
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err: Error) => {
          this.erro       = err.message ?? 'Erro ao criar conta';
          this.carregando = false;
        },
      });
    }
  }

  entrarComGoogle(): void {
    this.supabase.entrarComGoogle();
  }
}
