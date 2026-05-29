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
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { EmployeeReportQueryService } from '../../../core/services/reports/employee-report-query.service';
import { Department, Position } from '../../../core/types/api.types';
import {
  EmployeeReportFilters,
  EmployeeReportItem,
  ReportBreakdownItem,
  ReportExportFormat,
} from '../../../core/types/report.types';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-employee-report',
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
  templateUrl: './employee-report.component.html',
  styleUrls: ['./employee-report.component.scss'],
})
export class EmployeeReportComponent implements OnInit {
  protected readonly query = inject(EmployeeReportQueryService);
  protected readonly employeeQuery = inject(EmployeeQueryService);

  private readonly referenceData = inject(ReferenceDataService);
  private readonly toast = inject(ToastService);
  private readonly searchSubject = new Subject<string>();

  protected readonly LucideSearch = LucideSearch;
  protected readonly LucideDownload = LucideDownload;
  protected readonly LucideRefreshCcw = LucideRefreshCcw;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideArrowUpDown = LucideArrowUpDown;

  departments = signal<Department[]>([]);
  positions = signal<Position[]>([]);

  searchTerm = '';
  departmentIdFilter = '';
  positionIdFilter = '';
  employeeIdFilter = '';
  employeeStatusFilter = '';
  employmentTypeFilter = '';
  isActiveFilter = '';
  genderFilter = '';
  fromDateFilter = '';
  toDateFilter = '';

  summaryCards = computed(() => {
    const summary = this.query.summary();

    return [
      { label: 'Total Employees', value: summary.totalEmployees },
      { label: 'Active', value: summary.totalActiveEmployees },
      { label: 'Inactive', value: summary.totalInactiveEmployees },
      { label: 'Permanent', value: summary.totalPermanentEmployees },
      { label: 'Contract', value: summary.totalContractEmployees },
      { label: 'Male', value: summary.totalMaleEmployees },
      { label: 'Female', value: summary.totalFemaleEmployees },
    ];
  });

  topDepartments = computed(() => this.query.summary().totalByDepartment.slice(0, 5));
  topPositions = computed(() => this.query.summary().totalByPosition.slice(0, 5));
  statusBreakdown = computed(() => this.query.summary().totalByEmployeeStatus.slice(0, 5));

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((query: string) => {
        this.searchTerm = query;
        this.fetchData(1);
      });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.loadEmployees();
    this.fetchData();
  }

  fetchData(page: number = this.query.page()) {
    this.query
      .fetchAll(page, this.searchTerm, this.query.limit(), this.query.sort(), this.currentFilters())
      .subscribe({
        error: () => this.toast.error('Failed to load employee report'),
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
    this.departmentIdFilter = '';
    this.positionIdFilter = '';
    this.employeeIdFilter = '';
    this.employeeStatusFilter = '';
    this.employmentTypeFilter = '';
    this.isActiveFilter = '';
    this.genderFilter = '';
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
        error: () => this.toast.error('Failed to sort employee report'),
      });
  }

  onExport(format: ReportExportFormat) {
    this.query.export(format, this.searchTerm, this.query.sort(), this.currentFilters()).subscribe({
      next: (response) => {
        this.downloadFile(response.body, this.resolveFilename(response, format));
        this.toast.success('Employee report exported');
      },
      error: () => this.toast.error('Failed to export employee report'),
    });
  }

  displayActiveStatus(item: EmployeeReportItem): string {
    return item.isActive ? 'Active' : 'Inactive';
  }

  breakdownLabel(item: ReportBreakdownItem): string {
    return item.name || item.label || item.id || '-';
  }

  breakdownValue(item: ReportBreakdownItem): number {
    return item.total ?? item.count ?? 0;
  }

  private currentFilters(): EmployeeReportFilters {
    return {
      departmentId: this.departmentIdFilter || undefined,
      positionId: this.positionIdFilter || undefined,
      employeeId: this.employeeIdFilter || undefined,
      employeeStatus: this.employeeStatusFilter || undefined,
      employmentType: this.employmentTypeFilter || undefined,
      isActive: this.toBooleanFilter(this.isActiveFilter),
      gender: this.genderFilter || undefined,
      fromDate: this.fromDateFilter || undefined,
      toDate: this.toDateFilter || undefined,
    };
  }

  private loadReferenceData() {
    this.referenceData.getDepartments(100).subscribe({
      next: (res) => this.departments.set(res.data || []),
      error: () => this.toast.error('Failed to load departments'),
    });

    this.referenceData.getPositions(100).subscribe({
      next: (res) => this.positions.set(res.data || []),
      error: () => this.toast.error('Failed to load positions'),
    });
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

  private toBooleanFilter(value: string): boolean | undefined {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  private resolveFilename(response: { headers: { get(name: string): string | null } }, format: string): string {
    const contentDisposition = response.headers.get('content-disposition');
    const match = contentDisposition?.match(/filename="?([^"]+)"?/i);

    return match?.[1] || `employee-report-${this.timestamp()}.${format}`;
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
