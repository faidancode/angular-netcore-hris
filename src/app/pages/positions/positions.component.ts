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
import { PositionFormComponent } from './position-form.component';
import { ToastService } from '../../shared/services/toast.service';
import { PositionQueryService } from '../../core/services/positions/position-query.service';
import { PositionMutationService } from '../../core/services/positions/position-mutation.service';

@Component({
  selector: 'app-position',
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
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
export class PositionComponent implements OnInit {
  protected readonly query = inject(PositionQueryService);
  private mutation = inject(PositionMutationService);

  private confirm = inject(ConfirmService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

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

  // --- Computed for Pagination UI ---
  startRange = computed(() => (this.query.page() - 1) * this.query.limit() + 1);
  endRange = computed(() => {
    const end = this.query.page() * this.query.limit();
    return end > this.query.total() ? this.query.total() : end;
  });

  constructor() {
    // Setup search debounce: wait 300ms after user stops typing before making API call
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(),
      )
      .subscribe((query: string) => {
        this.query.fetchAll(1, false, query).subscribe();
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

  async openForm(position: any = null) {
    const result = await this.modal.open(PositionFormComponent, {
      position,
    });

    if (result) {
      this.fetchData();
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
    this.query.fetchAll(page).subscribe();
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

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Hapus Position',
      message: 'Apakah Anda yakin ingin menghapus position ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    });

    if (ok) {
      this.toast.success('Berhasil dihapus');
      this.mutation.remove(id).subscribe({
        next: () => this.fetchData(),
      });
    } else {
      this.toast.error('Gagal dihapus');
    }
  }
}
