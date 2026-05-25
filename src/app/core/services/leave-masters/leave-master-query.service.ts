import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse, LeaveMaster } from '../../types/api.types';
import { PaginatedQueryService } from '../paginated-query.service';

export interface LeaveMasterListFilters {
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveMasterQueryService extends PaginatedQueryService<LeaveMaster> {
  protected override endpoint = '/leave-masters';

  readonly leaveMasters = this.items;

  override fetchAll(
    page: number = 1,
    append: boolean = false,
    search: string = '',
    limit: number = 10,
    sort: string = 'createdAt:desc',
    filters: LeaveMasterListFilters = {},
  ) {
    this._loading.set(true);

    this._page.set(page);
    this._searchQuery.set(search);
    this._sort.set(sort);
    this._limit.set(limit);

    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      sort,
    };

    if (search) {
      params['search'] = search;
      params['q'] = search;
    }

    if (filters.isActive !== undefined && filters.isActive !== null) {
      params['isActive'] = String(filters.isActive);
    }

    return this.api.get<ApiResponse<LeaveMaster[]>>(this.endpoint, params).pipe(
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
}
