import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ConviteApiService } from '../../../api/convite-api.service';
import { INVITE_TOKEN_KEY } from '../convite/convite.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb           = inject(FormBuilder);
  private auth         = inject(AuthService);
  private supabase     = inject(SupabaseService);
  private router       = inject(Router);
  private tokenStorage = inject(TokenStorageService);
  private conviteApi   = inject(ConviteApiService);

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

  // ── Etapa 2FA ──
  etapaMfa      = false;
  codigoMfa     = '';
  erroMfa       = '';
  verificandoMfa = false;

  // ── Etapa recuperar senha ──
  etapaRecuperarSenha   = false;
  emailRecuperacao      = '';
  enviandoRecuperacao   = false;
  erroRecuperacao       = '';
  sucessoRecuperacao    = '';

  private handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'SUPABASE_AUTH_SUCCESS' && event.data.accessToken) {
      this.tokenStorage.set(event.data.accessToken);
      this.auth.estaAutenticado.set(true);
      this.continuarAposLogin();
    }
  };

  ngOnInit(): void {
    window.addEventListener('message', this.handleMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage);
  }

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
        next: () => this.continuarAposLogin(),
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
            this.continuarAposLogin();
          }
        },
        error: (err: Error) => {
          this.erro       = err.message ?? 'Erro ao criar conta';
          this.carregando = false;
        },
      });
    }
  }

  // Após autenticar, verifica se há um 2FA pendente antes de liberar o acesso.
  private async continuarAposLogin(): Promise<void> {
    if (await this.supabase.precisaVerificarMfa()) {
      this.etapaMfa   = true;
      this.carregando = false;
      return;
    }
    this.aceitarConvitePendenteENavegar();
  }

  async confirmarMfa(): Promise<void> {
    if (this.codigoMfa.length !== 6) return;
    this.verificandoMfa = true;
    this.erroMfa        = '';

    const { token, erro } = await this.supabase.verificarMfaLogin(this.codigoMfa);
    if (erro) {
      this.erroMfa        = 'Código inválido. Tente novamente.';
      this.verificandoMfa = false;
      return;
    }
    if (token) {
      this.tokenStorage.set(token);
      this.auth.estaAutenticado.set(true);
    }
    this.aceitarConvitePendenteENavegar();
  }

  cancelarMfa(): void {
    this.auth.sair();
    this.etapaMfa   = false;
    this.codigoMfa  = '';
    this.erroMfa    = '';
  }

  private aceitarConvitePendenteENavegar(): void {
    const token = localStorage.getItem(INVITE_TOKEN_KEY);
    if (token) {
      localStorage.removeItem(INVITE_TOKEN_KEY);
      this.conviteApi.aceitar(token).subscribe({
        next:  () => this.router.navigate(['/empresas']),
        error: () => this.router.navigate(['/empresas']), // navega mesmo se o convite já expirou
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  entrarComGoogle(): void {
    this.supabase.entrarComGoogle();
  }

  abrirRecuperarSenha(event: Event): void {
    event.preventDefault();
    this.etapaRecuperarSenha = true;
    this.emailRecuperacao    = this.formulario.value.email ?? '';
    this.erroRecuperacao     = '';
    this.sucessoRecuperacao  = '';
  }

  fecharRecuperarSenha(): void {
    this.etapaRecuperarSenha = false;
    this.erroRecuperacao     = '';
    this.sucessoRecuperacao  = '';
  }

  async enviarRecuperarSenha(): Promise<void> {
    if (!this.emailRecuperacao) return;
    this.enviandoRecuperacao = true;
    this.erroRecuperacao     = '';
    this.sucessoRecuperacao  = '';

    const erro = await this.supabase.enviarEmailRedefinicaoSenha(this.emailRecuperacao);
    this.enviandoRecuperacao = false;
    if (erro) {
      this.erroRecuperacao = erro;
    } else {
      this.sucessoRecuperacao = 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.';
    }
  }
}
