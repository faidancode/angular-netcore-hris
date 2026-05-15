import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AbilityService } from '@core/services/ability.service';
import { parsePermission } from '@core/utils/permission.utils';
import { AppPermission } from '@core/types/permission.type';

// --- Auth Guard ---
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

// --- Permission Guard ---
export const permissionGuard =
  (permission: AppPermission): CanActivateFn =>
  () => {
    const ability = inject(AbilityService);
    const router = inject(Router);

    // 🔥 kalau permissions belum ada → anggap belum login / reload
    if (!ability.permissionsLoaded()) {
      return router.createUrlTree(['/login']);
    }

    const { action, subject } = parsePermission(permission);

    return ability.can(action, subject) ? true : router.createUrlTree(['/forbidden']);
  };
