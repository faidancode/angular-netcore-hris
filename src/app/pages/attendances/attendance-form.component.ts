import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  Attendance,
  AttendanceCreatePayload,
  AttendanceUpdatePayload,
} from '../../core/types/attendance.types';
import { ToastService } from '../../shared/services/toast.service';
import { AttendanceMutationService } from '../../core/services/attendances/attendance-mutation.service';
import { AttendanceQueryService } from '../../core/services/attendances/attendance-query.service';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';

@Component({
  selector: 'app-attendance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss'],
})
export class AttendanceFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly query = inject(AttendanceQueryService);
  private readonly mutation = inject(AttendanceMutationService);
  protected readonly employeeQuery = inject(EmployeeQueryService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  attendance: Attendance | null = null;
  isEdit = false;

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  attendanceForm: FormGroup = this.fb.group({
    date: ['', [Validators.required]],
    employeeId: ['', [Validators.required]],
    checkIn: ['', [Validators.required]],
    checkOut: ['', [Validators.required]],
  });

  ngOnInit() {
    this.loadEmployees();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id && id !== 'new') {
        this.isEdit = true;
        this.loadAttendance(id);
      } else {
        this.isEdit = false;
      }
    });

    const employeeIdControl = this.attendanceForm.get('employeeId');
    employeeIdControl?.valueChanges.subscribe(() => {
      this.clearConflictState();
    });

    const dateControl = this.attendanceForm.get('date');
    dateControl?.valueChanges.subscribe(() => {
      this.clearConflictState();
    });
  }

  loadEmployees() {
    if (!this.employeeQuery.items().length && !this.employeeQuery.loading()) {
      const previousLimit = this.employeeQuery.limit();

      this.employeeQuery.fetchAll(1, false, '', 100, 'fullName:asc').pipe(
        finalize(() => {
          this.employeeQuery.setLimit(previousLimit);
        }),
      ).subscribe({
        error: () => {
          this.toast.error('Failed to load employees');
        },
      });
      return;
    }
  }

  loadAttendance(id: string) {
    this.loading.set(true);

    this.query.getById(id).subscribe({
      next: (res) => {
        this.attendance = res.data;

        this.attendanceForm.patchValue({
          date: this.attendance.date,
          employeeId: this.attendance.employeeId,
          checkIn: this.toTimeInputValue(this.attendance.checkIn),
          checkOut: this.toTimeInputValue(this.attendance.checkOut),
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load attendance data');
        this.onCancel();
      },
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.attendanceForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onSave() {
    this.submitted.set(true);

    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const rawValue = this.attendanceForm.value;
    const payload: AttendanceCreatePayload | AttendanceUpdatePayload = {
      date: rawValue.date,
      employeeId: rawValue.employeeId,
      checkIn: this.normalizeTimeForPayload(rawValue.checkIn),
      checkOut: this.normalizeTimeForPayload(rawValue.checkOut),
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.attendance
      ? this.mutation.update(this.attendance.id, payload)
      : this.mutation.create(payload as AttendanceCreatePayload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Saved successfully');
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Failed to save');

        if (err.status === 409) {
          this.attendanceForm.get('employeeId')?.setErrors({ conflict: true });
          this.attendanceForm.get('date')?.setErrors({ conflict: true });
          this.errorMessage.set(
            err.error?.message || 'Attendance for this employee and date already exists.',
          );
        } else if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'Invalid attendance data.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }

  private clearConflictState() {
    this.errorMessage.set(null);

    const employeeIdControl = this.attendanceForm.get('employeeId');
    const dateControl = this.attendanceForm.get('date');

    if (employeeIdControl?.hasError('conflict')) {
      employeeIdControl.setErrors(null);
    }

    if (dateControl?.hasError('conflict')) {
      dateControl.setErrors(null);
    }
  }

  private toTimeInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.length >= 5 ? value.slice(0, 5) : value;
  }

  private normalizeTimeForPayload(value: string): string {
    if (!value) {
      return value;
    }

    if (value.length === 5) {
      return `${value}:00`;
    }

    return value;
  }
}
