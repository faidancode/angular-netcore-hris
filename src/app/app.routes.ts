import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'employees',
        canActivate: [permissionGuard('Employee:read')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@pages/employees/employees.component').then((m) => m.EmployeesComponent),
          },
          {
            path: 'new',
            canActivate: [permissionGuard('Employee:create')],
            loadComponent: () =>
              import('@pages/employees/employee-form.component').then(
                (m) => m.EmployeeFormComponent,
              ),
          },
          {
            path: ':id',
            canActivate: [permissionGuard('Employee:update')],
            loadComponent: () =>
              import('@pages/employees/employee-form.component').then(
                (m) => m.EmployeeFormComponent,
              ),
          },
        ],
      },
      {
        path: 'departments',
        canActivate: [permissionGuard('Department:read')],
        loadComponent: () =>
          import('@pages/department/department.component').then((m) => m.DepartmentComponent),
      },
      {
        path: 'positions',
        canActivate: [permissionGuard('Position:read')],
        loadComponent: () =>
          import('@pages/positions/positions.component').then((m) => m.PositionComponent),
      },
      {
        path: 'attendances',
        canActivate: [permissionGuard('Attendance:read')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@pages/attendances/attendances.component').then(
                (m) => m.AttendanceComponent,
              ),
          },
          {
            path: 'new',
            canActivate: [permissionGuard('Attendance:create')],
            loadComponent: () =>
              import('@pages/attendances/attendance-form.component').then(
                (m) => m.AttendanceFormComponent,
              ),
          },
          {
            path: ':id',
            canActivate: [permissionGuard('Attendance:update')],
            loadComponent: () =>
              import('@pages/attendances/attendance-form.component').then(
                (m) => m.AttendanceFormComponent,
              ),
          },
        ],
      },
      {
        path: 'leave-masters',
        canActivate: [permissionGuard('LeaveMaster:read')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@pages/leave-masters/leave-masters.component').then(
                (m) => m.LeaveMastersComponent,
              ),
          },
          {
            path: 'new',
            canActivate: [permissionGuard('LeaveMaster:create')],
            loadComponent: () =>
              import('@pages/leave-masters/leave-master-form.component').then(
                (m) => m.LeaveMasterFormComponent,
              ),
          },
          {
            path: ':id',
            canActivate: [permissionGuard('LeaveMaster:update')],
            loadComponent: () =>
              import('@pages/leave-masters/leave-master-form.component').then(
                (m) => m.LeaveMasterFormComponent,
              ),
          },
        ],
      },
      {
        path: 'users',
        canActivate: [permissionGuard('User:read')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@pages/users/users.component').then((m) => m.UsersComponent),
          },
          {
            path: 'new',
            canActivate: [permissionGuard('User:create')],
            loadComponent: () =>
              import('@pages/users/user-form.component').then((m) => m.UserFormComponent),
          },
          {
            path: ':id',
            canActivate: [permissionGuard('User:update')],
            loadComponent: () =>
              import('@pages/users/user-form.component').then((m) => m.UserFormComponent),
          },
        ],
      },
      {
        path: 'roles',
        canActivate: [permissionGuard('Role:read')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@pages/roles/roles.component').then((m) => m.RolesComponent),
          },
          {
            path: 'new',
            canActivate: [permissionGuard('Role:create')],
            loadComponent: () =>
              import('@pages/roles/components/role-form/role-form.component').then(
                (m) => m.RoleFormComponent,
              ),
          },
          {
            path: ':id',
            canActivate: [permissionGuard('Role:update')],
            loadComponent: () =>
              import('@pages/roles/components/role-form/role-form.component').then(
                (m) => m.RoleFormComponent,
              ),
          },
        ],
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('@pages/error/forbidden.component').then((m) => m.ForbiddenComponent),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('@pages/error/not-found.component').then((m) => m.NotFoundComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'not-found' },
];
