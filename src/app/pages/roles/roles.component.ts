import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { RoleDto } from '../../core/types/role.types';
import { finalize } from 'rxjs';
import { RoleQueryService } from '../../core/services/roles/role-query.service';
import { RoleMutationService } from '../../core/services/roles/role-mutation.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private roleQuery = inject(RoleQueryService);
  private roleMutation = inject(RoleMutationService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  readonly roles = signal<RoleDto[]>([]);
  readonly isLoading = signal(true);
  readonly loadingPlaceholders = [1, 2, 3];

  ngOnInit() {
    this.fetchRoles();
  }

  fetchRoles() {
    this.isLoading.set(true);
    this.roleQuery
      .fetchAll(100)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res;

          if (Array.isArray(data)) {
            this.roles.set(data);
          } else if (data && Array.isArray(data.items)) {
            this.roles.set(data.items);
          } else {
            this.roles.set([]);
          }
        },
        error: () => {
          this.toastService.error('Failed to load roles');
          this.roles.set([]);
        },
      });
  }

  openCreate() {
    this.router.navigate(['/roles/new']);
  }

  openEdit(id: string) {
    this.router.navigate(['/roles', id]);
  }

  async deleteRole(id: string) {
    const ok = await this.confirmService.open({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (ok) {
      this.roleMutation.remove(id).subscribe({
        next: () => {
          this.toastService.success('Role deleted successfully');
          this.fetchRoles();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Failed to delete role');
        },
      });
    }
  }
}
