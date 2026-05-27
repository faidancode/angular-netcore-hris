import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';
import { LeaveMasterQueryService } from '../../core/services/leave-masters/leave-master-query.service';
import { LeaveRequestMutationService } from '../../core/services/leave-requests/leave-request-mutation.service';
import { LeaveRequest } from '../../core/types/api.types';
import { ToastService } from '../../shared/services/toast.service';

const leaveDateRangeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const fromDate = control.get('fromDate')?.value;
  const toDate = control.get('toDate')?.value;

  if (!fromDate || !toDate) {
    return null;
  }

  return toDate >= fromDate ? null : { invalidDateRange: true };
};

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-request-form.component.html',
})
export class LeaveRequestFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveRequestMutation = inject(LeaveRequestMutationService);
  protected readonly employeeQuery = inject(EmployeeQueryService);
  protected readonly leaveMasterQuery = inject(LeaveMasterQueryService);
  private readonly toast = inject(ToastService);

  @Input() leaveRequest: LeaveRequest | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  submitted = signal(false);

  leaveRequestForm: FormGroup = this.fb.group(
    {
      employeeId: ['', [Validators.required]],
      leaveId: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(1000)]],
      attachmentPath: ['', [Validators.maxLength(500)]],
    },
    { validators: leaveDateRangeValidator },
  );

  ngOnInit() {
    this.loadEmployees();
    this.loadLeaveMasters();

    if (this.leaveRequest) {
      this.leaveRequestForm.patchValue({
        employeeId: this.leaveRequest.employeeId,
        leaveId: this.leaveRequest.leaveId,
        fromDate: this.leaveRequest.fromDate,
        toDate: this.leaveRequest.toDate,
        reason: this.leaveRequest.reason,
        attachmentPath: this.leaveRequest.attachmentPath ?? '',
      });
    }

    ['employeeId', 'leaveId', 'fromDate', 'toDate', 'reason', 'attachmentPath'].forEach(
      (controlName) => {
        this.leaveRequestForm.get(controlName)?.valueChanges.subscribe(() => {
          this.errorMessage.set(null);
        });
      },
    );
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
    const control = this.leaveRequestForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  hasInvalidDateRange(): boolean {
    return !!(
      this.leaveRequestForm.hasError('invalidDateRange') &&
      (this.leaveRequestForm.get('toDate')?.dirty ||
        this.leaveRequestForm.get('toDate')?.touched ||
        this.submitted())
    );
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.leaveRequestForm.invalid) {
      this.leaveRequestForm.markAllAsTouched();
      return;
    }

    const formValue = this.leaveRequestForm.getRawValue();
    const payload = {
      employeeId: formValue.employeeId,
      leaveId: formValue.leaveId,
      fromDate: formValue.fromDate,
      toDate: formValue.toDate,
      reason: formValue.reason.trim(),
      attachmentPath: formValue.attachmentPath?.trim() || undefined,
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.leaveRequest
      ? this.leaveRequestMutation.update(this.leaveRequest.id, payload)
      : this.leaveRequestMutation.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.emit(true);
        this.toast.success('Saved successfully');
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toast.error('Failed to save');

        if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'Invalid leave request data.');
        } else if (err.status === 409) {
          this.errorMessage.set(err.error?.message || 'Leave request could not be saved.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }
}
