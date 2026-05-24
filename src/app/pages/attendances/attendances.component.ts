import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideArrowUpDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
} from '@lucide/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { Attendance } from '../../core/types/attendance.types';
import { AttendanceQueryService } from '../../core/services/attendances/attendance-query.service';
import { AttendanceMutationService } from '../../core/services/attendances/attendance-mutation.service';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HasPermissionDirective,
    LucideSearch,
    LucidePlus,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUpDown,
    LucideTrash2,
    LucidePencil,
  ],
  templateUrl: './attendances.component.html',
  styleUrls: ['./attendances.component.scss'],
})
export class AttendanceComponent implements OnInit {
  protected readonly query = inject(AttendanceQueryService);
  private readonly mutation = inject(AttendanceMutationService);
  protected readonly employeeQuery = inject(EmployeeQueryService);

  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly searchSubject = new Subject<string>();

  protected readonly LucideSearch = LucideSearch;
  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideArrowUpDown = LucideArrowUpDown;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucidePencil = LucidePencil;

  searchTerm = '';
  employeeIdFilter = '';
  dateFilter = '';
  fromDateFilter = '';
  toDateFilter = '';

  startRange = computed(() => (this.query.page() - 1) * this.query.limit() + 1);
  endRange = computed(() => {
    const end = this.query.page() * this.query.limit();
    return end > this.query.total() ? this.query.total() : end;
  });

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(),
      )
      .subscribe((query: string) => {
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
      .fetchAll(page, false, this.searchTerm, this.query.limit(), this.query.sort(), {
        employeeId: this.employeeIdFilter || undefined,
        date: this.dateFilter || undefined,
        fromDate: this.fromDateFilter || undefined,
        toDate: this.toDateFilter || undefined,
      })
      .subscribe();
  }

  loadEmployees() {
    if (!this.employeeQuery.items().length && !this.employeeQuery.loading()) {
      const previousLimit = this.employeeQuery.limit();

      this.employeeQuery.fetchAll(1, false, '', 100, 'fullName:asc').subscribe({
        next: () => this.employeeQuery.setLimit(previousLimit),
        error: () => this.employeeQuery.setLimit(previousLimit),
      });
    }
  }

  async openForm(attendance: Attendance | null = null) {
    if (attendance) {
      this.router.navigate([attendance.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['new'], { relativeTo: this.route });
    }
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
    const currentSort = this.query.sort();
    const [currField, currDir] = currentSort.split(':');
    let newDir = 'asc';

    if (currField === field && currDir === 'asc') {
      newDir = 'desc';
    }

    this.query
      .fetchAll(1, false, this.searchTerm, this.query.limit(), `${field}:${newDir}`, {
        employeeId: this.employeeIdFilter || undefined,
        date: this.dateFilter || undefined,
        fromDate: this.fromDateFilter || undefined,
        toDate: this.toDateFilter || undefined,
      })
      .subscribe();
  }

  formatTime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    return value.length >= 5 ? value.slice(0, 5) : value;
  }

  displayStatus(attendance: Attendance): string {
    if (attendance.status === 'OnTime') {
      return 'On Time';
    }

    if (attendance.status === 'Late') {
      return 'Late';
    }

    return '-';
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Delete Attendance',
      message: 'Are you sure you want to delete this attendance record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (ok) {
      this.mutation.remove(id).subscribe({
        next: () => {
          this.toast.success('Successfully deleted');
          this.fetchData();
        },
        error: () => this.toast.error('Failed to delete attendance'),
      });
    }
  }
}
