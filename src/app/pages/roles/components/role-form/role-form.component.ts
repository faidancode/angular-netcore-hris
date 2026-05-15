import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { PermissionDto, RoleDto } from '../../../../core/types/role.types';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';
import { IconButtonComponent } from '../../../../shared/components/icon-button/icon-button.component';
import { RoleQueryService } from '../../../../core/services/roles/role-query.service';
import { RoleMutationService } from '../../../../core/services/roles/role-mutation.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconButtonComponent],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private query = inject(RoleQueryService);
  private mutation = inject(RoleMutationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  role: RoleDto | null = null;
  roleId: string | null = null;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  readonly isSubmitting = signal(false);
  readonly isLoadingRole = signal(false);
  readonly isLoadingPermissions = signal(false);
  readonly groupedPermissions = signal<{ [subject: string]: PermissionDto[] }>({});
  readonly selectedPermissionIds = signal<Set<string>>(new Set());
  readonly permissionSubjects = computed(() => Object.keys(this.groupedPermissions()).sort());

  ngOnInit() {
    this.roleId = this.resolveRoleId();

    if (this.roleId) {
      this.loadRole(this.roleId);
    }

    this.loadPermissions();
  }

  private resolveRoleId(): string | null {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      return null;
    }

    return id;
  }

  private loadRole(id: string) {
    this.isLoadingRole.set(true);

    this.query
      .getById(id)
      .pipe(
        finalize(() => {
          this.isLoadingRole.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          const data: any = res?.data ?? res;
          const role: RoleDto | null = data ?? null;

          if (!role) {
            this.toast.error('Role not found');
            return;
          }

          this.role = role;
          this.form.patchValue({
            name: role.name,
            description: role.description ?? '',
          });

          this.selectedPermissionIds.set(new Set(role.permissions?.map((perm) => perm.id) ?? []));
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message || 'Failed to load role');
        },
      });
  }

  loadPermissions() {
    this.isLoadingPermissions.set(true);

    this.query
      .getPermissions()
      .pipe(
        finalize(() => {
          this.isLoadingPermissions.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          const data: any = res?.data ?? res;
          const permissions = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.permissions)
                ? data.permissions
                : [];

          this.groupPermissions(permissions);
        },
        error: () => {
          this.toast.error('Failed to load permissions');
          this.groupedPermissions.set({});
        },
      });
  }

  groupPermissions(permissions: PermissionDto[]) {
    const grouped: { [subject: string]: PermissionDto[] } = {};

    for (const permission of permissions) {
      if (!grouped[permission.subject]) {
        grouped[permission.subject] = [];
      }

      grouped[permission.subject].push(permission);
    }

    this.groupedPermissions.set(grouped);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePermission(id: string) {
    const next = new Set(this.selectedPermissionIds());

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    this.selectedPermissionIds.set(next);
  }

  isPermissionSelected(id: string): boolean {
    return this.selectedPermissionIds().has(id);
  }

  onCancel() {
    this.router.navigate(['/roles']);
  }

  onSubmit() {
    if (this.form.invalid || this.selectedPermissionIds().size === 0) {
      this.form.markAllAsTouched();

      if (this.selectedPermissionIds().size === 0) {
        this.toast.error('Please select at least one permission.');
      }

      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      ...this.form.value,
      permissionIds: Array.from(this.selectedPermissionIds()),
    };

    const request = this.roleId
      ? this.mutation.update(this.roleId, payload)
      : this.mutation.create(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.roleId ? 'Role updated successfully' : 'Role created successfully');
        this.router.navigate(['/roles']);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Failed to save role');
        this.isSubmitting.set(false);
      },
    });
  }
}
