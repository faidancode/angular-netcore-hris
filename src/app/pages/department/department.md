## Department Component TS

@Component({
selector: 'app-department',
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
LucidePencil
],
templateUrl: './department.component.html',
styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
protected readonly query = inject(DepartmentQueryService);
private mutation = inject(DepartmentMutationService);

private confirm = inject(ConfirmService);
private modal = inject(ModalService);
private toast = inject(ToastService);

// --- Icons ---
protected readonly LucideSearch = LucideSearch;
protected readonly LucidePlus = LucidePlus;
protected readonly LucideChevronLeft = LucideChevronLeft;
protected readonly LucideChevronRight = LucideChevronRight;
protected readonly LucideArrowUpDown = LucideArrowUpDown;
protected readonly LucideTrash2 = LucideTrash2;
protected readonly LucidePencil = LucidePencil;

// --- Computed for Pagination UI ---
startRange = computed(() => (this.query.page() - 1) _ this.query.limit() + 1);
endRange = computed(() => {
const end = this.query.page() _ this.query.limit();
return end > this.query.total() ? this.query.total() : end;
});

ngOnInit() {
this.fetchData();
}

fetchData() {
this.query.fetchAll(
this.query.page(),
false,
this.query.searchQuery(),
this.query.limit(),
this.query.sort()
).subscribe();
}

async openForm(department: any = null) {
const result = await this.modal.open(DepartmentFormComponent, {
department
});

    if (result) {
      this.fetchData();
    }

}

onSearch(query: string) {
this.query.fetchAll(1, false, query).subscribe();
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
this.query.fetchAll(1, false, this.query.searchQuery(), this.query.limit(), `${field}:${newDir}`).subscribe();
}

async onDelete(id: string) {
const ok = await this.confirm.open({
title: 'Hapus Department',
message: 'Apakah Anda yakin ingin menghapus department ini?',
confirmText: 'Hapus',
cancelText: 'Batal'
});

    if (ok) {
      this.toast.success('Berhasil dihapus');
      this.mutation.remove(id).subscribe({
        next: () => this.fetchData()
      });
    } else {
      this.toast.error('Gagal dihapus');
    }

}
}

## Department Component HTML

<div class="page-container">
  <header class="page-header">
    <div class="page-header__content">
      <h2>Departments</h2>
      <p>Organizational structure and functional units.</p>
    </div>

    <div class="page-header__actions">
      <div class="search-field">
        <svg lucideSearch class="search-icon" [size]="18"></svg>
        <input type="text" placeholder="Search units..." [ngModel]="query.searchQuery()"
          (ngModelChange)="onSearch($event)" />
      </div>

      <button *appHasPermission="'Department:create'" class="btn btn-primary" (click)="openForm()">
        <svg lucidePlus [size]="18"></svg>
        <span>Add Department</span>
      </button>
    </div>

  </header>

  <div class="hris-table-wrapper">
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th class="sortable" (click)="toggleSort('name')">
              Name <svg lucideArrowUpDown [size]="14"></svg>
            </th>
            <th>Status</th>
            <th class="sortable" (click)="toggleSort('createdAt')">
              Created <svg lucideArrowUpDown [size]="14"></svg>
            </th>
            <th style="text-align: right">Actions</th>
          </tr>
        </thead>
        <tbody>
          @if (query.loading()) {
          @for (i of [1, 2, 3]; track i) {
          <tr class="animate-pulse">
            <td colspan="4">
              <div class="loading-skeleton"></div>
            </td>
          </tr>
          }
          } @else {
          @for (dept of query.departments(); track dept.id) {
          <tr>
            <td style="font-weight: 700">{{ dept.name }}</td>
            <td>
              <span class="hris-badge" [ngClass]="dept.isActive ? 'badge-success' : 'badge-danger'">
                {{ dept.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td style="
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                  ">
              {{ dept.createdAt | date: 'dd MMM yyyy' }}
            </td>
            <td>
              <div style="
                      display: flex;
                      align-items: center;
                      justify-content: flex-end;
                      gap: 0.25rem;
                    ">
                <button class="action-icon-btn" (click)="openForm(dept)">
                  <svg lucidePencil [size]="16"></svg>
                </button>
                <button (click)="onDelete(dept.id)" class="action-icon-btn delete">
                  <svg lucideTrash2 [size]="16"></svg>
                </button>
              </div>
            </td>
          </tr>
          }
          }
        </tbody>
      </table>
    </div>

    <div class="pagination-toolbar">
      <div class="flex items-center">
        <span class="page-info">Show</span>
        <select [ngModel]="query.limit()" (ngModelChange)="onLimitChange($event)" class="limit-select">
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
        </select>
      </div>

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <button class="page-btn-minimal" [disabled]="query.page() === 1" (click)="onPageChange(query.page() - 1)">
            <svg lucideChevronLeft [size]="16"></svg>
          </button>
          <span class="page-info">Page {{ query.page() }}</span>
          <button class="page-btn-minimal" [disabled]="query.loading() || !query.hasMore()"
            (click)="onPageChange(query.page() + 1)">
            <svg lucideChevronRight [size]="16"></svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</div>

## Department Form TS

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-form.component.html'
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentMutation = inject(DepartmentMutationService);
  private toast = inject(ToastService);


  @Input() department: Department | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  departmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    isActive: [true],
  });

  ngOnInit() {
    if (this.department) {
      this.departmentForm.patchValue({
        name: this.department.name,
        isActive: this.department.isActive ?? true,
      });
    }

    const nameControl = this.departmentForm.get('name');
    nameControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (nameControl.hasError('conflict')) {
        nameControl.setErrors(null);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.departmentForm.get(controlName);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted())
    );
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const payload = this.departmentForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.department
      ? this.departmentMutation.update(this.department.id, payload)
      : this.departmentMutation.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.emit(true);
        this.toast.success('Saved successfully');
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toast.error('Failed to save');

        if (err.status === 409) {
          this.departmentForm.get('name')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Department name is already in use.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }
}

## Department Form HTML

<div class="modal-backdrop" (click)="onCancel()"></div>

<div class="modal-container">
  <div class="modal form-modal">

    <div class="modal-header">
      <h3 class="modal-title">
        {{ department ? 'Edit Department' : 'New Department' }}
      </h3>

      <button type="button" class="modal-close" (click)="onCancel()">
        <svg lucide="x"></svg>
      </button>
    </div>

    <form [formGroup]="departmentForm" (ngSubmit)="onSave()" class="modal-body">

      <div class="form-group" [class.form-group--error]="isInvalid('name')">
        <label for="name">Department Name</label>
        <input id="name" type="text" formControlName="name" placeholder="e.g. Engineering Operations" />

        <div class="form-error" *ngIf="isInvalid('name') && !departmentForm.get('name')?.hasError('conflict')">
          Name is required
        </div>
        <div class="form-error" *ngIf="departmentForm.get('name')?.hasError('conflict')">
          This department name is already in use
        </div>
      </div>

      <div class="form-group form-group--inline">
        <label for="isActive">Availability Status</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="isActive" formControlName="isActive" />
          <label for="isActive" class="text-sm font-bold ml-2">Active</label>
        </div>
      </div>

      <div class="form-banner--error" *ngIf="errorMessage()">
        {{ errorMessage() }}
      </div>

      <div class="modal-footer">
        <button type="button" class="btn" (click)="onCancel()">
          Cancel
        </button>

        <button type="submit" class="btn btn-primary" [disabled]="loading()">
          <span *ngIf="loading()">Processing...</span>
          <span *ngIf="!loading()">
            {{ department ? 'Update Department' : 'Create Department' }}
          </span>
        </button>
      </div>
    </form>

  </div>
</div>
