import { CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = (): boolean => {
  return true;
};
