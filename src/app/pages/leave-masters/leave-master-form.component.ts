import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveMaster } from '../../core/types/api.types';
import { ToastService } from '../../shared/services/toast.service';
import { LeaveMasterMutationService } from '../../core/services/leave-masters/leave-master-mutation.service';

@Component({
  selector: 'app-leave-master-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-master-form.component.html',
})
export class LeaveMasterFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveMasterMutation = inject(LeaveMasterMutationService);
  private toast = inject(ToastService);

  @Input() leaveMaster: LeaveMaster | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  submitted = signal(false);

  leaveMasterForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    quotaDays: [1, [Validators.required, Validators.min(1), Validators.max(365)]],
    isActive: [true],
  });

  ngOnInit() {
    if (this.leaveMaster) {
      this.leaveMasterForm.patchValue({
        name: this.leaveMaster.name,
        code: this.leaveMaster.code,
        quotaDays: this.leaveMaster.quotaDays,
        isActive: this.leaveMaster.isActive ?? true,
      });
    }

    ['name', 'code', 'quotaDays'].forEach((controlName) => {
      const control = this.leaveMasterForm.get(controlName);
      control?.valueChanges.subscribe(() => {
        this.errorMessage.set(null);
        if (control.hasError('conflict')) {
          control.setErrors(null);
        }
      });
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.leaveMasterForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.leaveMasterForm.invalid) {
      this.leaveMasterForm.markAllAsTouched();
      return;
    }

    const payload = this.leaveMasterForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.leaveMaster
      ? this.leaveMasterMutation.update(this.leaveMaster.id, payload)
      : this.leaveMasterMutation.create(payload);

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
          this.leaveMasterForm.get('name')?.setErrors({ conflict: true });
          this.leaveMasterForm.get('code')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Leave master code or name is already in use.');
        } else {
          this.errorMessage.set('A system error occurred. Please try again.');
        }
      },
    });
  }
}
