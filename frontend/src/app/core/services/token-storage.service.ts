import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly KEY = 'auth_token';

  set(token: string): void {
    localStorage.setItem(this.KEY, token);
  }

  get(): string | null {
    return localStorage.getItem(this.KEY);
  }

  remove(): void {
    localStorage.removeItem(this.KEY);
  }

  has(): boolean {
    return !!this.get();
  }
}
