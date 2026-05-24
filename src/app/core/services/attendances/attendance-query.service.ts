import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../../types/api.types';
import {
  Attendance,
  AttendanceListFilters,
} from '../../types/attendance.types';
import { PaginatedQueryService } from '../paginated-query.service';

@Injectable({
  providedIn: 'root',
})
export class AttendanceQueryService extends PaginatedQueryService<Attendance> {
  protected override endpoint = '/attendances';

  readonly attendances = this.items;

  override fetchAll(
    page: number = 1,
    append: boolean = false,
    search: string = '',
    limit: number = 10,
    sort: string = 'date:desc',
    filters: AttendanceListFilters = {},
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

    if (filters.employeeId) {
      params['employeeId'] = filters.employeeId;
    }

    if (filters.date) {
      params['date'] = filters.date;
    }

    if (filters.fromDate) {
      params['fromDate'] = filters.fromDate;
    }

    if (filters.toDate) {
      params['toDate'] = filters.toDate;
    }

    return this.api.get<ApiResponse<Attendance[]>>(this.endpoint, params).pipe(
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
