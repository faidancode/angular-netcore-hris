import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { User } from '../../core/types/api.types';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserQueryService } from '../../core/services/users/user-query.service';
import { RoleQueryService } from '../../core/services/roles/role-query.service';
import { UserMutationService } from '../../core/services/users/user-mutation.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userQuery = inject(UserQueryService);
  private userMutation = inject(UserMutationService);
  private toast = inject(ToastService);
  protected readonly roleQuery = inject(RoleQueryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user: User | null = null;
  isEdit = false;

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    confirmPassword: [''],
    roleId: ['', [Validators.required]],
    isActive: [true],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
      return { mismatch: true };
    } else {
      if (confirmPassword?.hasError('mismatch')) {
        delete confirmPassword.errors?.['mismatch'];
        confirmPassword.setErrors(Object.keys(confirmPassword.errors || {}).length ? confirmPassword.errors : null);
      }
      return null;
    }
  }

  ngOnInit() {
    if (!this.roleQuery.roles().length && !this.roleQuery.loading()) {
      const previousLimit = this.roleQuery.limit();

      this.roleQuery.fetchAll(1, false, '', 100).subscribe({
        next: () => this.roleQuery.setLimit(previousLimit),
        error: () => this.roleQuery.setLimit(previousLimit),
      });
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.isEdit = true;
        this.loading.set(true);
        this.userQuery.getById(id).subscribe({
          next: (res) => {
            this.user = res.data;
            this.userForm.patchValue({
              name: this.user.name,
              email: this.user.email,
              roleId: this.user.roleId,
              isActive: this.user.isActive ?? true,
            });
            this.userForm.get('password')?.clearValidators();
            this.userForm.get('confirmPassword')?.clearValidators();
            this.loading.set(false);
          },
          error: () => {
            this.toast.error('Gagal memuat data user');
            this.onCancel();
          }
        });
      } else {
        this.isEdit = false;
        this.userForm.get('password')?.setValidators([Validators.required]);
        this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
      }
    });

    const nameControl = this.userForm.get('name');
    nameControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (nameControl.hasError('conflict')) {
        nameControl.setErrors(null);
      }
    });

    const emailControl = this.userForm.get('email');
    emailControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (emailControl.hasError('conflict')) {
        emailControl.setErrors(null);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onSave() {
    this.submitted.set(true);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.userForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.user
      ? this.userMutation.update(this.user.id, payload)
      : this.userMutation.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Berhasil disimpan');
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Gagal disimpan');

        if (err.statusCode === 409) {
          this.userForm.get('name')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Nama departemen sudah digunakan.');
        } else {
          this.errorMessage.set('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      },
    });
  }
}
