import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Employee, EmployeePayload } from '../../core/types/api.types';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeMutationService } from '../../core/services/employees/employee-mutation.service';
import { EmployeeQueryService } from '../../core/services/employees/employee-query.service';
import { ReferenceDataService } from '../../core/services/reference-data.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeQuery = inject(EmployeeQueryService);
  private employeeMutation = inject(EmployeeMutationService);
  private referenceData = inject(ReferenceDataService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  employee: Employee | null = null;
  isEdit = false;

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  positionsLoading = signal<boolean>(false);

  // Cached positions from reference data service
  positions = signal<any[]>([]);

  employeeForm: FormGroup = this.fb.group({
    nip: ['', [Validators.required]],
    fullName: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    positionId: ['', [Validators.required]],
    employeeStatus: ['', [Validators.required]],
    isActive: [true],
    dateOfJoining: [''],
    dateOfActivePosition: [''],
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.isEdit = true;
        this.loadEmployee(id);
      } else {
        this.isEdit = false;
      }
    });

    const nipControl = this.employeeForm.get('nip');
    nipControl?.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.errorMessage.set(null);
      if (nipControl.hasError('conflict')) {
        nipControl.setErrors(null);
      }
    });
  }

  ngOnInit() {
    // Load positions using cached reference data service
    this.positionsLoading.set(true);
    this.referenceData.getPositions(100).subscribe({
      next: (res) => {
        this.positions.set(res.data || []);
        this.positionsLoading.set(false);
      },
      error: () => {
        this.positionsLoading.set(false);
        this.toast.error('Failed to load positions');
      },
    });
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.employeeQuery.getById(id).subscribe({
      next: (res) => {
        this.employee = res.data;
        this.employeeForm.patchValue({
          nip: this.employee.nip,
          fullName: this.employee.fullName,
          gender: this.employee.gender,
          positionId: this.employee.positionId,
          employeeStatus: this.employee.employeeStatus,
          isActive: this.employee.isActive ?? true,
          dateOfJoining: this.toDateInputValue(this.employee.dateOfJoining),
          dateOfActivePosition: this.toDateInputValue(this.employee.dateOfActivePosition),
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load employee data');
        this.onCancel();
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onSave() {
    this.submitted.set(true);

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const payload: EmployeePayload = this.employeeForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.employee
      ? this.employeeMutation.update(this.employee.id, payload)
      : this.employeeMutation.create(payload);

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
          this.employeeForm.get('nip')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'NIP is already in use.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.includes('T') ? value.split('T')[0] : value.slice(0, 10);
  }
}
