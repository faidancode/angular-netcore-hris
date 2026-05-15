import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AbilityService } from './ability.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let abilityService: AbilityService;

  const mockAbilityService = {
    setPermissions: vi.fn(),
    clearPermissions: vi.fn(),
  };

  const mockResponse = {
    success: true,
    message: 'Success',
    data: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        roleName: 'Admin',
        avatar: 'avatar.jpg',
      },
      permissions: [
        { action: 'read', subject: 'User' },
        { action: 'create', subject: 'User' },
      ],
    },
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear(); // 1. Better to define the mock structure clearly

    const routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(), // 2. Use a factory or explicit provider to avoid metadata issues
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: AbilityService,
          useValue: mockAbilityService,
        },
      ],
    });

    // 3. Re-assign the injected mock if you need to check calls in tests
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    abilityService = TestBed.inject(AbilityService);
    // @ts-ignore - access the mock
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock?.verify();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and navigate to dashboard', () => {
      service.login('john@example.com', 'password').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'john@example.com',
        password: 'password',
      });

      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()).toEqual(mockResponse.data.user);

      expect(localStorage.getItem('hris_refresh_token')).toBe('refresh-token');

      expect(abilityService.setPermissions).toHaveBeenCalledWith(mockResponse.data.permissions);
    });

    it('should propagate login error', (done) => {
      service.login('john@example.com', 'wrong').subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear auth state and navigate to login', () => {
      localStorage.setItem('hris_refresh_token', 'refresh-token');

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();

      expect(localStorage.getItem('hris_refresh_token')).toBeNull();

      expect(abilityService.clearPermissions).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return null initially', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', () => {
      localStorage.setItem('hris_refresh_token', 'refresh-token');

      service.refreshToken().subscribe((token) => {
        expect(token).toBe('access-token');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);

      expect(req.request.method).toBe('POST');

      req.flush(mockResponse);

      expect(service.getToken()).toBe('access-token');
    });

    it('should logout when refresh token missing', (done) => {
      const logoutSpy = vi.spyOn(service, 'logout');

      service.refreshToken().subscribe({
        error: (err) => {
          expect(err.message).toBe('No refresh token');
          expect(logoutSpy).toHaveBeenCalled();
        },
      });
    });
  });

  describe('hydrate', () => {
    it('should return void if no refresh token exists', (done) => {
      service.hydrate().subscribe(() => {
        expect(service.isAuthenticated()).toBe(false);
      });
    });

    it('should hydrate successfully', () => {
      localStorage.setItem('hris_refresh_token', 'refresh-token');

      service.hydrate().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);

      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should logout if hydrate refresh fails', () => {
      localStorage.setItem('hris_refresh_token', 'refresh-token');

      const logoutSpy = vi.spyOn(service, 'logout');

      service.hydrate().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);

      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(logoutSpy).toHaveBeenCalled();
    });
  });
});
