import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiResponse } from '../types/api.types';
import { BaseApiService } from './base-api.service';

/**
 * Reference Data Cache Service
 *
 * This service provides a centralized mechanism for caching reference data
 * (departments, positions, roles, etc.) that doesn't change frequently.
 *
 * Uses `shareReplay(1)` to:
 * - Cache the result in memory
 * - Share a single HTTP request among multiple subscribers
 * - Prevent duplicate requests when the same data is fetched multiple times
 *
 * Usage:
 * ```typescript
 * this.referenceData.getPositions().subscribe(positions => {...});
 * // If called again within the same session, returns cached result
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private api = inject(BaseApiService);

  // Cache for reference data observables
  private positionsCache$: Observable<ApiResponse<any[]>> | null = null;
  private departmentsCache$: Observable<ApiResponse<any[]>> | null = null;
  private rolesCache$: Observable<ApiResponse<any[]>> | null = null;

  /**
   * Fetches all positions and caches the result.
   * Subsequent calls return the cached observable without making new HTTP requests.
   *
   * @param limit - Maximum number of positions to fetch (default: 100)
   * @returns Cached observable of positions
   */
  getPositions(limit: number = 100): Observable<ApiResponse<any[]>> {
    if (!this.positionsCache$) {
      this.positionsCache$ = this.api
        .get<ApiResponse<any[]>>('/positions', {
          page: '1',
          limit: limit.toString(),
        })
        .pipe(shareReplay(1));
    }
    return this.positionsCache$;
  }

  /**
   * Fetches all departments and caches the result.
   * Subsequent calls return the cached observable without making new HTTP requests.
   *
   * @param limit - Maximum number of departments to fetch (default: 100)
   * @returns Cached observable of departments
   */
  getDepartments(limit: number = 100): Observable<ApiResponse<any[]>> {
    if (!this.departmentsCache$) {
      this.departmentsCache$ = this.api
        .get<ApiResponse<any[]>>('/departments', {
          page: '1',
          limit: limit.toString(),
        })
        .pipe(shareReplay(1));
    }
    return this.departmentsCache$;
  }

  /**
   * Fetches all roles and caches the result.
   * Subsequent calls return the cached observable without making new HTTP requests.
   *
   * @param limit - Maximum number of roles to fetch (default: 100)
   * @returns Cached observable of roles
   */
  getRoles(limit: number = 100): Observable<ApiResponse<any[]>> {
    if (!this.rolesCache$) {
      this.rolesCache$ = this.api
        .get<ApiResponse<any[]>>('/roles', {
          page: '1',
          limit: limit.toString(),
        })
        .pipe(shareReplay(1));
    }
    return this.rolesCache$;
  }

  /**
   * Invalidates all cached data.
   * Call this when you know reference data has been updated.
   */
  invalidateCache(): void {
    this.positionsCache$ = null;
    this.departmentsCache$ = null;
    this.rolesCache$ = null;
  }

  /**
   * Invalidates a specific cache.
   *
   * @param key - The cache key to invalidate ('positions', 'departments', or 'roles')
   */
  invalidateCacheKey(key: 'positions' | 'departments' | 'roles'): void {
    switch (key) {
      case 'positions':
        this.positionsCache$ = null;
        break;
      case 'departments':
        this.departmentsCache$ = null;
        break;
      case 'roles':
        this.rolesCache$ = null;
        break;
    }
  }
}
