import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (inject(TokenStorageService).has()) return true;

  return router.createUrlTree(['/auth/login']);
};
