import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../../types/api.types';
import {
  EmployeeReport,
  EmployeeReportFilters,
  EmployeeReportItem,
  EmployeeReportSummary,
  ReportExportFormat,
} from '../../types/report.types';
import { BaseApiService } from '../base-api.service';

const EMPTY_SUMMARY: EmployeeReportSummary = {
  totalEmployees: 0,
  totalActiveEmployees: 0,
  totalInactiveEmployees: 0,
  totalPermanentEmployees: 0,
  totalContractEmployees: 0,
  totalMaleEmployees: 0,
  totalFemaleEmployees: 0,
  totalByDepartment: [],
  totalByPosition: [],
  totalByEmployeeStatus: [],
};

@Injectable({ providedIn: 'root' })
export class EmployeeReportQueryService {
  private readonly api = inject(BaseApiService);
  private readonly endpoint = '/reports/employees';

  private readonly _items = signal<EmployeeReportItem[]>([]);
  private readonly _summary = signal<EmployeeReportSummary>(EMPTY_SUMMARY);
  private readonly _loading = signal(false);
  private readonly _exporting = signal(false);
  private readonly _total = signal(0);
  private readonly _page = signal(1);
  private readonly _limit = signal(10);
  private readonly _searchQuery = signal('');
  private readonly _sort = signal('createdAt:desc');
  private readonly _hasNextPage = signal(false);

  readonly items = this._items.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly exporting = this._exporting.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sort = this._sort.asReadonly();
  readonly hasMore = this._hasNextPage.asReadonly();
  readonly totalPages = computed(() => Math.ceil(this._total() / this._limit()));

  fetchAll(
    page: number = 1,
    search: string = '',
    limit: number = 10,
    sort: string = 'createdAt:desc',
    filters: EmployeeReportFilters = {},
  ) {
    this._loading.set(true);
    this._page.set(page);
    this._searchQuery.set(search);
    this._sort.set(sort);
    this._limit.set(limit);

    return this.api
      .get<ApiResponse<EmployeeReport>>(
        this.endpoint,
        this.buildParams(page, search, limit, sort, filters, true),
      )
      .pipe(
        tap({
          next: (res) => {
            this._items.set(res.data.items);
            this._summary.set(res.data.summary ?? EMPTY_SUMMARY);
            this._total.set(res.meta?.total ?? res.data.items.length);
            this._hasNextPage.set(res.meta?.hasNextPage ?? false);
            this._loading.set(false);
          },
          error: () => {
            this._loading.set(false);
          },
        }),
      );
  }

  export(format: ReportExportFormat, search: string, sort: string, filters: EmployeeReportFilters) {
    this._exporting.set(true);

    return this.api
      .getFile(this.endpoint + '/export', {
        ...this.buildParams(this._page(), search, this._limit(), sort, filters, false),
        format,
      })
      .pipe(
        tap({
          next: () => this._exporting.set(false),
          error: () => this._exporting.set(false),
        }),
      );
  }

  setLimit(limit: number) {
    this._limit.set(limit);
    this._page.set(1);
  }

  reset() {
    this._items.set([]);
    this._summary.set(EMPTY_SUMMARY);
    this._page.set(1);
    this._total.set(0);
    this._hasNextPage.set(false);
  }

  private buildParams(
    page: number,
    search: string,
    limit: number,
    sort: string,
    filters: EmployeeReportFilters,
    includePagination: boolean,
  ): Record<string, string | boolean> {
    const params: Record<string, string | boolean> = { sort };

    if (includePagination) {
      params['page'] = page.toString();
      params['limit'] = limit.toString();
    }

    if (search) {
      params['search'] = search;
      params['q'] = search;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }
}
