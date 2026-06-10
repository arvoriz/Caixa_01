import { Injectable, signal } from '@angular/core';

// Estado da UI do layout (sidebar mobile em formato de drawer).
@Injectable({ providedIn: 'root' })
export class LayoutUiService {
  sidebarAberta = signal(false);

  abrirSidebar() {
    this.sidebarAberta.set(true);
  }

  fecharSidebar() {
    this.sidebarAberta.set(false);
  }

  toggleSidebar() {
    this.sidebarAberta.update(v => !v);
  }
}
