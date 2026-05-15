import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap, throwError, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { AbilityService } from '@core/services/ability.service';

// --- Types ---
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  avatar?: string;
}

interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    permissions: {
      action: string;
      subject: string;
    }[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private abilityService = inject(AbilityService);

  // --- Private Signals ---
  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<AuthUser | null>(null);

  // --- Public Computed ---
  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());

  // --- Login ---
  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginApiResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          const data = res.data;
          this._handleAuthResponse(data);
        }),
        tap(() => {
          this.router.navigate(['/dashboard']);
        }),
        map(() => void 0),
      );
  }

  // --- Logout ---
  logout(): void {
    localStorage.removeItem('hris_refresh_token');

    this._token.set(null);
    this._user.set(null);

    // 🔥 clear ability
    this.abilityService.clearPermissions();

    this.router.navigate(['/login']);
  }

  // --- Token accessor ---
  getToken(): string | null {
    return this._token();
  }

  // --- Refresh Token ---
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('hris_refresh_token');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<LoginApiResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((res) => {
        this._handleAuthResponse(res.data);
      }),
      map((res) => res.data.accessToken)
    );
  }

  // --- Init helper (for refresh case) ---
  hydrate(): Observable<void> {
    const refreshToken = localStorage.getItem('hris_refresh_token');
    if (refreshToken) {
      return this.refreshToken().pipe(
        map(() => void 0),
        catchError(() => {
          this.logout();
          return of(void 0);
        })
      );
    }
    return of(void 0);
  }

  private _handleAuthResponse(data: LoginApiResponse['data']): void {
    // --- persist only refresh token ---
    localStorage.setItem('hris_refresh_token', data.refreshToken);

    // --- update state in memory ---
    this._token.set(data.accessToken);
    this._user.set(data.user);

    // --- set permissions ---
    this.abilityService.setPermissions(
      (data.permissions ?? []).map((p) => ({
        action: p.action,
        subject: p.subject,
      })),
    );
  }
}
