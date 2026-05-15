import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Position } from '../../core/types/api.types';
import { ToastService } from '../../shared/services/toast.service';
import { PositionMutationService } from '../../core/services/positions/position-mutation.service';
import { DepartmentQueryService } from '../../core/services/departments/department-query.service';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './position-form.component.html',
})
export class PositionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private positionMutation = inject(PositionMutationService);
  private toast = inject(ToastService);
  protected readonly departmentQuery = inject(DepartmentQueryService);

  @Input() position: Position | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  positionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    departmentId: ['', [Validators.required]],
    isActive: [true],
  });

  ngOnInit() {
    if (this.position) {
      this.positionForm.patchValue({
        name: this.position.name,
        departmentId: this.position.departmentId,
        isActive: this.position.isActive ?? true,
      });
    }

    if (!this.departmentQuery.items().length && !this.departmentQuery.loading()) {
      const previousLimit = this.departmentQuery.limit();

      this.departmentQuery.fetchAll(1, false, '', 100).subscribe({
        next: () => this.departmentQuery.setLimit(previousLimit),
        error: () => this.departmentQuery.setLimit(previousLimit),
      });
    }

    const nameControl = this.positionForm.get('name');
    nameControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (nameControl.hasError('conflict')) {
        nameControl.setErrors(null);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.positionForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const payload = this.positionForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.position
      ? this.positionMutation.update(this.position.id, payload)
      : this.positionMutation.create(payload);

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
          this.positionForm.get('name')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Position name is already in use.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }
}
