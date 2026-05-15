import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { Employee } from '../../core/types/api.types';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';
import { EmployeeMutationService } from '../../core/services/employees/employee-mutation.service';

@Component({
  selector: 'app-employees',
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
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
  protected readonly query = inject(EmployeeQueryService);
  private mutation = inject(EmployeeMutationService);

  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // --- Search Debouncing ---
  private searchSubject = new Subject<string>();

  // --- Icons ---
  protected readonly LucideSearch = LucideSearch;
  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideArrowUpDown = LucideArrowUpDown;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucidePencil = LucidePencil;

  constructor() {
    // Setup search debounce: wait 300ms after user stops typing before making API call
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(),
      )
      .subscribe((query: string) => {
        this.query
          .fetchAll(1, false, query, this.query.limit(), this.query.sort())
          .subscribe();
      });
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.query
      .fetchAll(
        this.query.page(),
        false,
        this.query.searchQuery(),
        this.query.limit(),
        this.query.sort(),
      )
      .subscribe();
  }

  async openForm(employee: Employee | null = null) {
    if (employee) {
      this.router.navigate([employee.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['new'], { relativeTo: this.route });
    }
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onLimitChange(limit: number) {
    this.query.setLimit(limit);
    this.fetchData();
  }

  onPageChange(page: number) {
    this.query
      .fetchAll(page, false, this.query.searchQuery(), this.query.limit(), this.query.sort())
      .subscribe();
  }

  toggleSort(field: string) {
    const currentSort = this.query.sort();
    const [currField, currDir] = currentSort.split(':');
    let newDir = 'asc';
    if (currField === field && currDir === 'asc') {
      newDir = 'desc';
    }

    this.query
      .fetchAll(1, false, this.query.searchQuery(), this.query.limit(), `${field}:${newDir}`)
      .subscribe();
  }

  displayGender(employee: Employee): string {
    return employee.genderLabel || employee.gender || '-';
  }

  displayStatus(employee: Employee): string {
    return employee.employeeStatusLabel || employee.employeeStatus || '-';
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (ok) {
      this.mutation.remove(id).subscribe({
        next: () => {
          this.toast.success('Successfully deleted');
          this.fetchData();
        },
        error: () => this.toast.error('Failed to delete employee'),
      });
    }
  }
}
