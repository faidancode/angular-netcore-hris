import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';
import { LeaveAllowanceMutationService } from '../../core/services/leave-allowances/leave-allowance-mutation.service';
import { LeaveMasterQueryService } from '../../core/services/leave-masters/leave-master-query.service';
import { LeaveAllowance } from '../../core/types/api.types';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-leave-allowance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-allowance-form.component.html',
})
export class LeaveAllowanceFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveAllowanceMutation = inject(LeaveAllowanceMutationService);
  protected readonly employeeQuery = inject(EmployeeQueryService);
  protected readonly leaveMasterQuery = inject(LeaveMasterQueryService);
  private readonly toast = inject(ToastService);

  @Input() leaveAllowance: LeaveAllowance | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  submitted = signal(false);

  leaveAllowanceForm: FormGroup = this.fb.group({
    employeeId: ['', [Validators.required]],
    leaveId: ['', [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
    quotaDays: [1, [Validators.required, Validators.min(1), Validators.max(365)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  ngOnInit() {
    this.loadEmployees();
    this.loadLeaveMasters();

    if (this.leaveAllowance) {
      this.leaveAllowanceForm.patchValue({
        employeeId: this.leaveAllowance.employeeId,
        leaveId: this.leaveAllowance.leaveId,
        year: this.leaveAllowance.year,
        quotaDays: this.leaveAllowance.quotaDays,
        notes: this.leaveAllowance.notes ?? '',
      });
    }

    ['employeeId', 'leaveId', 'year'].forEach((controlName) => {
      const control = this.leaveAllowanceForm.get(controlName);
      control?.valueChanges.subscribe(() => {
        this.clearConflictState();
      });
    });

    ['quotaDays', 'notes'].forEach((controlName) => {
      const control = this.leaveAllowanceForm.get(controlName);
      control?.valueChanges.subscribe(() => {
        this.errorMessage.set(null);
      });
    });
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

  isInvalid(controlName: string): boolean {
    const control = this.leaveAllowanceForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.leaveAllowanceForm.invalid) {
      this.leaveAllowanceForm.markAllAsTouched();
      return;
    }

    const formValue = this.leaveAllowanceForm.getRawValue();
    const payload = {
      employeeId: formValue.employeeId,
      leaveId: formValue.leaveId,
      year: Number(formValue.year),
      quotaDays: Number(formValue.quotaDays),
      notes: formValue.notes?.trim() || undefined,
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.leaveAllowance
      ? this.leaveAllowanceMutation.update(this.leaveAllowance.id, payload)
      : this.leaveAllowanceMutation.create(payload);

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
          this.leaveAllowanceForm.get('employeeId')?.setErrors({ conflict: true });
          this.leaveAllowanceForm.get('leaveId')?.setErrors({ conflict: true });
          this.leaveAllowanceForm.get('year')?.setErrors({ conflict: true });
          this.errorMessage.set(
            err.error?.message ||
              'Leave allowance for this employee, leave type, and year already exists.',
          );
        } else if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'Invalid leave allowance data.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }

  private clearConflictState() {
    this.errorMessage.set(null);

    ['employeeId', 'leaveId', 'year'].forEach((controlName) => {
      const control = this.leaveAllowanceForm.get(controlName);
      if (control?.hasError('conflict')) {
        control.setErrors(null);
      }
    });
  }
}
