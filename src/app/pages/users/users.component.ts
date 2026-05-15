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
import { UserQueryService } from '../../core/services/users/user-query.service';
import { UserMutationService } from '../../core/services/users/user-mutation.service';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user',
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  protected readonly query = inject(UserQueryService);
  private readonly mutation = inject(UserMutationService);

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

  async openForm(user: any = null) {
    if (user) {
      this.router.navigate([user.id], { relativeTo: this.route });
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
      title: 'Hapus User',
      message: 'Apakah Anda yakin ingin menghapus user ini?',
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
