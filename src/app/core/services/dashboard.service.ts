import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse, DashboardSummary } from '../types/api.types';
import { BaseApiService } from './base-api.service';


@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/dashboard';

  // --- State ---
  private _dashboardSummary = signal<DashboardSummary | null>(null);
  private _loading = signal(false);


  // --- Public Signals (read-only) ---
  readonly dashboardSummary = this._dashboardSummary.asReadonly();
  readonly loading = this._loading.asReadonly();


  // --- Actions ---
  fetchAll() {
    this._loading.set(true);
    return this.api.get<ApiResponse<DashboardSummary>>(this.endpoint).pipe(
      tap({
        next: (res) => {
          this._dashboardSummary.set(res.data);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }
}
