import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowUpDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
} from '@lucide/angular';
import { Subject, finalize } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';
import { LeaveMasterQueryService } from '../../core/services/leave-masters/leave-master-query.service';
import { LeaveRequestMutationService } from '../../core/services/leave-requests/leave-request-mutation.service';
import { LeaveRequestQueryService } from '../../core/services/leave-requests/leave-request-query.service';
import { LeaveRequest } from '../../core/types/api.types';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { LeaveRequestFormComponent } from './leave-request-form.component';

@Component({
  selector: 'app-leave-requests',
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
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
})
export class LeaveRequestsComponent implements OnInit {
  protected readonly query = inject(LeaveRequestQueryService);
  protected readonly employeeQuery = inject(EmployeeQueryService);
  protected readonly leaveMasterQuery = inject(LeaveMasterQueryService);

  private readonly mutation = inject(LeaveRequestMutationService);
  private readonly confirm = inject(ConfirmService);
  private readonly modal = inject(ModalService);
  private readonly toast = inject(ToastService);
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
  leaveIdFilter = '';
  fromDateFilter = '';
  toDateFilter = '';

  startRange = computed(() => (this.query.page() - 1) * this.query.limit() + 1);
  endRange = computed(() => {
    const end = this.query.page() * this.query.limit();
    return end > this.query.total() ? this.query.total() : end;
  });

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((query: string) => {
        this.searchTerm = query;
        this.fetchData(1);
      });
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadLeaveMasters();
    this.fetchData();
  }

  fetchData(page: number = this.query.page()) {
    this.query
      .fetchAll(page, false, this.searchTerm, this.query.limit(), this.query.sort(), {
        employeeId: this.employeeIdFilter || undefined,
        leaveId: this.leaveIdFilter || undefined,
        fromDate: this.fromDateFilter || undefined,
        toDate: this.toDateFilter || undefined,
      })
      .subscribe();
  }

  loadEmployees() {
    if (!this.employeeQuery.items().length && !this.employeeQuery.loading()) {
      const previousLimit = this.employeeQuery.limit();

      this.employeeQuery
        .fetchAll(1, false, '', 100, 'fullName:asc')
        .pipe(
          finalize(() => {
            this.employeeQuery.setLimit(previousLimit);
          }),
        )
        .subscribe({
          error: () => this.toast.error('Failed to load employees'),
        });
    }
  }

  loadLeaveMasters() {
    if (!this.leaveMasterQuery.items().length && !this.leaveMasterQuery.loading()) {
      const previousLimit = this.leaveMasterQuery.limit();

      this.leaveMasterQuery
        .fetchAll(1, false, '', 100, 'name:asc', { isActive: true })
        .pipe(
          finalize(() => {
            this.leaveMasterQuery.setLimit(previousLimit);
          }),
        )
        .subscribe({
          error: () => this.toast.error('Failed to load leave masters'),
        });
    }
  }

  async openForm(leaveRequest: LeaveRequest | null = null) {
    const result = await this.modal.open(LeaveRequestFormComponent, {
      leaveRequest,
    });

    if (result) {
      this.fetchData();
    }
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onFiltersChange() {
    this.fetchData(1);
  }

  onResetFilters() {
    this.searchTerm = '';
    this.employeeIdFilter = '';
    this.leaveIdFilter = '';
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
    const newDir = currField === field && currDir === 'asc' ? 'desc' : 'asc';

    this.query
      .fetchAll(1, false, this.searchTerm, this.query.limit(), `${field}:${newDir}`, {
        employeeId: this.employeeIdFilter || undefined,
        leaveId: this.leaveIdFilter || undefined,
        fromDate: this.fromDateFilter || undefined,
        toDate: this.toDateFilter || undefined,
      })
      .subscribe();
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Delete Leave Request',
      message: 'Are you sure you want to delete this leave request?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (ok) {
      this.mutation.remove(id).subscribe({
        next: () => {
          this.toast.success('Successfully deleted');
          this.fetchData();
        },
        error: () => this.toast.error('Failed to delete leave request'),
      });
    }
  }
}
