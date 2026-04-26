import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__logo">App</span>
      </div>
      <ul class="sidebar__nav">
        @for (item of navItems; track item.route) {
          <li>
            <a
              class="sidebar__link"
              [routerLink]="item.route"
              routerLinkActive="sidebar__link--active"
            >
              <span class="sidebar__icon">{{ item.icon }}</span>
              <span class="sidebar__label">{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '◈' },
    // Adicionar itens de menu conforme o projeto crescer
  ];
}
