import { inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../types/api.types';
import { BaseApiService } from './base-api.service';

export abstract class PaginatedQueryService<T> {
  protected api = inject(BaseApiService);

  protected abstract endpoint: string;

  // state
  protected _items = signal<T[]>([]);
  protected _loading = signal(false);

  protected _total = signal(0);
  protected _page = signal(1);
  protected _limit = signal(10);

  protected _searchQuery = signal('');
  protected _sort = signal('createdAt:desc');

  protected _hasNextPage = signal(false);

  // readonly
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sort = this._sort.asReadonly();

  readonly hasMore = this._hasNextPage.asReadonly();

  fetchAll(
    page: number = 1,
    append: boolean = false,
    search: string = '',
    limit: number = 10,
    sort: string = 'createdAt:desc',
  ) {
    this._loading.set(true);

    this._page.set(page);
    this._searchQuery.set(search);
    this._sort.set(sort);
    this._limit.set(limit);

    const params = {
      page: page.toString(),
      limit: limit.toString(),
      search,
      sort,
    };

    return this.api.get<ApiResponse<T[]>>(this.endpoint, params).pipe(
      tap({
        next: (res) => {
          if (append) {
            this._items.update((prev) => [...prev, ...res.data]);
          } else {
            this._items.set(res.data);
          }

          this._total.set(res.meta?.total ?? res.data.length);
          this._hasNextPage.set(res.meta?.hasNextPage ?? false);

          this._loading.set(false);
        },
        error: () => {
          this._loading.set(false);
        },
      }),
    );
  }

  getById(id: string) {
    return this.api.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
  }

  setLimit(limit: number) {
    this._limit.set(limit);
    this._page.set(1);
  }

  reset() {
    this._items.set([]);
    this._page.set(1);
    this._total.set(0);
    this._hasNextPage.set(false);
  }
}