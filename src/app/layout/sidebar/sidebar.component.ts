import { Component, EventEmitter, Output, inject, input, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideClock,
  LucideUsers,
  LucideKey,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDynamicIcon,
  LucideFileChartColumn,
  LucideLayoutGrid,
} from '@lucide/angular';

import { AbilityService } from '@core/services/ability.service';
import { NavItem } from './sidebar.types';
import { parsePermission } from '@core/utils/permission.utils';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon, LucideLayoutGrid, LucideChevronRight],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  // --- state ---
  collapsed = input<boolean>(false);
  @Output() toggleCollapse = new EventEmitter<void>();

  private ability = inject(AbilityService);

  // --- icons (exposed to template) ---
  protected readonly LucideLayoutGrid = LucideLayoutGrid;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideClock = LucideClock;

  // --- nav config ---
  navItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/dashboard', icon: LucideLayoutDashboard },
    {
      label: 'Employees',
      icon: LucideUsers,
      expanded: false,
      children: [
        {
          label: 'Department',
          route: '/departments',
          permission: 'Department:read',
        },
        {
          label: 'Position',
          route: '/positions',
          permission: 'Position:read',
        },
        {
          label: 'Employee',
          route: '/employees',
          permission: 'Employee:read',
        },
      ],
    },
    {
      label: 'Attendance',
      icon: LucideClock,
      expanded: false,
      children: [
        {
          label: 'Attendance',
          route: '/attendances',
          permission: 'Attendance:read',
        },
        {
          label: 'Leave Masters',
          route: '/leave-masters',
          permission: 'LeaveMaster:read',
        },
        {
          label: 'Leave Allowances',
          route: '/leave-allowances',
          permission: 'LeaveAllowance:read',
        },
        {
          label: 'Leave Requests',
          route: '/leave-requests',
          permission: 'LeaveRequest:read',
        },
      ],
    },
    {
      label: 'Report',
      icon: LucideFileChartColumn,
      expanded: false,
      children: [
        {
          label: 'Employee Report',
          route: '/reports/employees',
          permission: 'Report:read',
        },
      ],
    },
    {
      label: 'Setting',
      icon: LucideKey,
      expanded: false,
      children: [
        {
          label: 'Users',
          route: '/users',
          permission: 'User:read',
        },
        {
          label: 'Access Control',
          route: '/roles',
          permission: 'Role:read',
        },
      ],
    },
  ]);

  // --- computed (IMPORTANT: no function in template) ---
  protected readonly visibleNavItems = computed(() => {
    if (!this.ability.permissionsLoaded()) return [];

    return this.navItems()
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter((child) => {
            if (!child.permission) return true;
            const { action, subject } = parsePermission(child.permission);
            return this.ability.can(action, subject);
          });
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item) => {
        if (item.children) return item.children.length > 0;
        if (!item.permission) return true;
        const { action, subject } = parsePermission(item.permission);
        return this.ability.can(action, subject);
      });
  });

  toggleMenu(item: NavItem) {
    if (item.children) {
      this.navItems.update((items) =>
        items.map((i) => (i.label === item.label ? { ...i, expanded: !i.expanded } : i)),
      );
    }
  }
}
