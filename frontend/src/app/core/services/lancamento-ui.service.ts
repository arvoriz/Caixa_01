import { Injectable, signal } from '@angular/core';

// Ponte entre o botão "Novo Lançamento" do navbar (global) e a página de lançamentos.
// O navbar incrementa o contador; a página reage via effect e abre o modal.
@Injectable({ providedIn: 'root' })
export class LancamentoUiService {
  abrirNovoSolicitado = signal(0);

  solicitarNovo() {
    this.abrirNovoSolicitado.update(v => v + 1);
  }
}
