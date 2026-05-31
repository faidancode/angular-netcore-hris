import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../../types/api.types';
import {
  AttendanceReport,
  AttendanceReportFilters,
  AttendanceReportItem,
  AttendanceReportSummary,
  ReportExportFormat,
} from '../../types/report.types';
import { BaseApiService } from '../base-api.service';

const EMPTY_SUMMARY: AttendanceReportSummary = {
  totalAttendances: 0,
  totalOnTime: 0,
  totalLate: 0,
  totalByStatus: [],
  totalByEmployee: [],
  totalByDate: [],
};

@Injectable({ providedIn: 'root' })
export class AttendanceReportQueryService {
  private readonly api = inject(BaseApiService);
  private readonly endpoint = '/reports/attendances';

  private readonly _items = signal<AttendanceReportItem[]>([]);
  private readonly _summary = signal<AttendanceReportSummary>(EMPTY_SUMMARY);
  private readonly _loading = signal(false);
  private readonly _exporting = signal(false);
  private readonly _total = signal(0);
  private readonly _page = signal(1);
  private readonly _limit = signal(10);
  private readonly _searchQuery = signal('');
  private readonly _sort = signal('date:desc');
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
    sort: string = 'date:desc',
    filters: AttendanceReportFilters = {},
  ) {
    this._loading.set(true);
    this._page.set(page);
    this._searchQuery.set(search);
    this._sort.set(sort);
    this._limit.set(limit);

    return this.api
      .get<
        ApiResponse<AttendanceReport>
      >(this.endpoint, this.buildParams(page, search, limit, sort, filters, true))
      .pipe(
        tap({
          next: (res) => {
            const items = res.data.items ?? [];

            this._items.set(items);
            this._summary.set(this.normalizeSummary(res.data.summary));
            this._total.set(res.meta?.total ?? items.length);
            this._hasNextPage.set(res.meta?.hasNextPage ?? false);
            this._loading.set(false);
          },
          error: () => {
            this._loading.set(false);
          },
        }),
      );
  }

  export(
    format: ReportExportFormat,
    search: string,
    sort: string,
    filters: AttendanceReportFilters,
  ) {
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
    filters: AttendanceReportFilters,
    includePagination: boolean,
  ): Record<string, string> {
    const params: Record<string, string> = { sort };

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

  private normalizeSummary(
    summary: AttendanceReportSummary | null | undefined,
  ): AttendanceReportSummary {
    return {
      ...EMPTY_SUMMARY,
      ...summary,
      totalByStatus: summary?.totalByStatus ?? [],
      totalByEmployee: summary?.totalByEmployee ?? [],
      totalByDate: summary?.totalByDate ?? [],
    };
  }
}
