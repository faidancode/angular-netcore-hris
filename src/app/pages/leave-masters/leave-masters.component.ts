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
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { LeaveMaster } from '../../core/types/api.types';
import { LeaveMasterQueryService } from '../../core/services/leave-masters/leave-master-query.service';
import { LeaveMasterMutationService } from '../../core/services/leave-masters/leave-master-mutation.service';
import { LeaveMasterFormComponent } from './leave-master-form.component';

@Component({
  selector: 'app-leave-masters',
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
  templateUrl: './leave-masters.component.html',
  styleUrls: ['./leave-masters.component.scss'],
})
export class LeaveMastersComponent implements OnInit {
  protected readonly query = inject(LeaveMasterQueryService);
  private readonly mutation = inject(LeaveMasterMutationService);
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
  isActiveFilter = '';

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
    this.fetchData();
  }

  fetchData(page: number = this.query.page()) {
    this.query
      .fetchAll(page, false, this.searchTerm, this.query.limit(), this.query.sort(), {
        isActive:
          this.isActiveFilter === ''
            ? undefined
            : this.isActiveFilter === 'true',
      })
      .subscribe();
  }

  async openForm(leaveMaster: LeaveMaster | null = null) {
    const result = await this.modal.open(LeaveMasterFormComponent, {
      leaveMaster,
    });

    if (result) {
      this.fetchData();
    }
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
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
        isActive:
          this.isActiveFilter === ''
            ? undefined
            : this.isActiveFilter === 'true',
      })
      .subscribe();
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Delete Leave Master',
      message: 'Are you sure you want to delete this leave master?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (ok) {
      this.mutation.remove(id).subscribe({
        next: () => {
          this.toast.success('Successfully deleted');
          this.fetchData();
        },
        error: () => this.toast.error('Failed to delete leave master'),
      });
    }
  }
}
