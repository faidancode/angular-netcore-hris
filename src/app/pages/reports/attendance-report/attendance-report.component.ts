import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowUpDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDownload,
  LucideRefreshCcw,
  LucideSearch,
} from '@lucide/angular';
import { Subject, finalize } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EmployeeQueryService } from '../../../core/services/employees/employee-query.service';
import { AttendanceReportQueryService } from '../../../core/services/reports/attendance-report-query.service';
import {
  AttendanceReportFilters,
  AttendanceReportItem,
  ReportBreakdownItem,
  ReportExportFormat,
} from '../../../core/types/report.types';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch,
    LucideDownload,
    LucideRefreshCcw,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUpDown,
  ],
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss'],
})
export class AttendanceReportComponent implements OnInit {
  protected readonly query = inject(AttendanceReportQueryService);
  protected readonly employeeQuery = inject(EmployeeQueryService);

  private readonly toast = inject(ToastService);
  private readonly searchSubject = new Subject<string>();

  protected readonly LucideSearch = LucideSearch;
  protected readonly LucideDownload = LucideDownload;
  protected readonly LucideRefreshCcw = LucideRefreshCcw;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideArrowUpDown = LucideArrowUpDown;

  searchTerm = '';
  employeeIdFilter = '';
  statusFilter = '';
  dateFilter = '';
  fromDateFilter = '';
  toDateFilter = '';

  summaryCards = computed(() => {
    const summary = this.query.summary();

    return [
      { label: 'Total Records', value: summary.totalAttendances },
      { label: 'On Time', value: summary.totalOnTime },
      { label: 'Late', value: summary.totalLate },
    ];
  });

  statusBreakdown = computed(() => this.query.summary().totalByStatus.slice(0, 5));
  employeeBreakdown = computed(() => this.query.summary().totalByEmployee.slice(0, 5));
  dateBreakdown = computed(() => this.query.summary().totalByDate.slice(0, 5));

  constructor() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((query: string) => {
      this.searchTerm = query;
      this.fetchData(1);
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.fetchData();
  }

  fetchData(page: number = this.query.page()) {
    this.query
      .fetchAll(page, this.searchTerm, this.query.limit(), this.query.sort(), this.currentFilters())
      .subscribe({
        error: () => this.toast.error('Failed to load attendance report'),
      });
  }

  onSearch(query: string) {
    this.searchTerm = query;
    this.searchSubject.next(query);
  }

  onFiltersChange() {
    this.fetchData(1);
  }

  onResetFilters() {
    this.searchTerm = '';
    this.employeeIdFilter = '';
    this.statusFilter = '';
    this.dateFilter = '';
    this.fromDateFilter = '';
    this.toDateFilter = '';
    this.fetchData(1);
  }

  onLimitChange(limit: number) {
    this.query.setLimit(limit);
    this.fetchData(1);
  }

  onPageChange(page: number) {
    this.fetchData(page);
  }

  toggleSort(field: string) {
    const [currentField, currentDirection] = this.query.sort().split(':');
    const direction = currentField === field && currentDirection === 'asc' ? 'desc' : 'asc';

    this.query
      .fetchAll(
        1,
        this.searchTerm,
        this.query.limit(),
        `${field}:${direction}`,
        this.currentFilters(),
      )
      .subscribe({
        error: () => this.toast.error('Failed to sort attendance report'),
      });
  }

  onExport(format: ReportExportFormat) {
    this.query.export(format, this.searchTerm, this.query.sort(), this.currentFilters()).subscribe({
      next: (response) => {
        this.downloadFile(response.body, this.resolveFilename(response, format));
        this.toast.success('Attendance report exported');
      },
      error: () => this.toast.error('Failed to export attendance report'),
    });
  }

  displayStatus(item: AttendanceReportItem): string {
    if (item.status === 'OnTime') return 'On Time';
    return item.status || '-';
  }

  formatTime(value: string | null | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return value.slice(0, 5);
  }

  employeeInitial(item: AttendanceReportItem): string {
    return this.employeeName(item).charAt(0);
  }

  employeeName(item: AttendanceReportItem): string {
    return item.employeeName || '-';
  }

  employeeNip(item: AttendanceReportItem): string {
    return item.employeeNip || '-';
  }

  breakdownLabel(item: ReportBreakdownItem): string {
    return item.name || item.label || item.id || '-';
  }

  breakdownValue(item: ReportBreakdownItem): number {
    return item.total ?? item.count ?? 0;
  }

  private currentFilters(): AttendanceReportFilters {
    return {
      employeeId: this.employeeIdFilter || undefined,
      status: this.statusFilter || undefined,
      date: this.dateFilter || undefined,
      fromDate: this.fromDateFilter || undefined,
      toDate: this.toDateFilter || undefined,
    };
  }

  private loadEmployees() {
    if (!this.employeeQuery.items().length && !this.employeeQuery.loading()) {
      const previousLimit = this.employeeQuery.limit();

      this.employeeQuery
        .fetchAll(1, false, '', 100, 'fullName:asc')
        .pipe(finalize(() => this.employeeQuery.setLimit(previousLimit)))
        .subscribe({
          error: () => this.toast.error('Failed to load employees'),
        });
    }
  }

  private resolveFilename(
    response: { headers: { get(name: string): string | null } },
    format: string,
  ): string {
    const contentDisposition = response.headers.get('content-disposition');
    const match = contentDisposition?.match(/filename="?([^"]+)"?/i);

    return match?.[1] || `attendance-report-${this.timestamp()}.${format}`;
  }

  private downloadFile(blob: Blob | null, filename: string) {
    if (!blob) {
      this.toast.error('Export returned an empty file');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private timestamp(): string {
    const date = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
  }
}
