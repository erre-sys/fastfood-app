import { CanActivateFn } from '@angular/router';
import { authService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => authService.isReady();