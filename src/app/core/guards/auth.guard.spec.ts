import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AbilityService } from '../services/ability.service';
import { AuthService } from '../services/auth.service';
import { authGuard, permissionGuard } from './auth.guard';

describe('Auth Guards', () => {
  let router: Router;

  const routerMock = {
    createUrlTree: vi.fn((commands) => ({ commands }) as unknown as UrlTree),
  };

  const authServiceMock = {
    isAuthenticated: vi.fn(),
  };

  const abilityServiceMock = {
    permissionsLoaded: vi.fn(),
    can: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: AbilityService,
          useValue: abilityServiceMock,
        },
      ],
    });

    router = TestBed.inject(Router);

    vi.clearAllMocks();
  });

  describe('authGuard', () => {
    it('should allow access when authenticated', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);

      const route = {} as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;
      const result = TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(result).toBe(true);
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to login when not authenticated', () => {
      authServiceMock.isAuthenticated.mockReturnValue(false);

      const route = {} as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;
      const result = TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      expect(result).toEqual({ commands: ['/login'] });
    });
  });

  describe('permissionGuard', () => {
    it('should allow access when permission exists', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);
      abilityServiceMock.can.mockReturnValue(true);

      const guard = permissionGuard('user.read');
      const route = {} as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => guard(route, state));

      expect(result).toBe(true);
    });

    it('should redirect to forbidden when permission is denied', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);
      abilityServiceMock.can.mockReturnValue(false);

      const guard = permissionGuard('user.read');
      const route = {} as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => guard(route, state));

      expect(router.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
      expect(result).toEqual({ commands: ['/forbidden'] });
    });

    it('should redirect to login when permissions are not loaded', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(false);

      const guard = permissionGuard('user.read');
      const route = {} as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => guard(route, state));

      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      expect(result).toEqual({ commands: ['/login'] });
      expect(abilityServiceMock.can).not.toHaveBeenCalled();
    });
  });
});
