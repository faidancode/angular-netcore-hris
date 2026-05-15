import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { DashboardService } from '@core/services/dashboard.service';
import {
  LucideCalendarCheck,
  LucideCircleCheck,
  LucideDownload,
  LucideDynamicIcon,
  LucidePencil,
  LucidePlane,
  LucidePlus,
  LucideShieldCheck,
  LucideTimer,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: any;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  readonly loading = this.dashboardService.loading;

  ngOnInit(): void {
    this.dashboardService.fetchAll().subscribe();
  }

  stats = computed(() => {
    const summary = this.dashboardService.dashboardSummary();
    return [
      {
        label: 'Total Active Employees',
        value: summary?.totalActiveEmployees?.toLocaleString() || '0',
        change: 'Total',
        positive: true,
        icon: LucideUsers,
        color: 'bg-indigo-50 text-indigo-600',
      },
      {
        label: 'Total Male',
        value: summary?.totalMaleEmployees?.toLocaleString() || '0',
        change: 'Gender',
        positive: true,
        icon: LucideUserPlus,
        color: 'bg-sky-50 text-sky-600',
      },
      {
        label: 'Total Female',
        value: summary?.totalFemaleEmployees?.toLocaleString() || '0',
        change: 'Gender',
        positive: true,
        icon: LucideUserPlus,
        color: 'bg-amber-50 text-amber-600',
      },
      {
        label: 'Permanent Status',
        value: summary?.totalPermanentEmployees?.toLocaleString() || '0',
        change: 'Status',
        positive: true,
        icon: LucideCircleCheck,
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        label: 'Contract Status',
        value: summary?.totalContractEmployees?.toLocaleString() || '0',
        change: 'Status',
        positive: true,
        icon: LucideTimer,
        color: 'bg-amber-50 text-amber-600',
      },
    ];
  });

  departments = [
    { name: 'Engineering', count: 312, pct: 24, color: 'bg-primary' },
    { name: 'Sales', count: 256, pct: 20, color: 'bg-secondary' },
    { name: 'Operations', count: 198, pct: 15, color: 'bg-indigo-400' },
    { name: 'HR & Finance', count: 154, pct: 12, color: 'bg-emerald-400' },
    { name: 'Marketing', count: 128, pct: 10, color: 'bg-amber-400' },
  ];

  activities = [
    {
      id: 1,
      icon: LucideUserPlus,
      title: 'John Doe joined Engineering',
      time: '2m ago',
      badge: 'New Hire',
      badgeClass: 'border-emerald-100 text-emerald-600 bg-emerald-50',
    },
    {
      id: 2,
      icon: LucidePencil,
      title: 'Sarah K. profile updated',
      time: '1h ago',
      badge: 'Updated',
      badgeClass: 'border-sky-100 text-sky-600 bg-sky-50',
    },
    {
      id: 3,
      icon: LucideShieldCheck,
      title: 'Role "Manager" permissions changed',
      time: '3h ago',
      badge: 'RBAC',
      badgeClass: 'border-amber-100 text-amber-600 bg-amber-50',
    },
    {
      id: 4,
      icon: LucideCalendarCheck,
      title: 'Michael T. leave approved',
      time: '5h ago',
      badge: 'Leave',
      badgeClass: 'border-indigo-100 text-indigo-600 bg-indigo-50',
    },
  ];

  protected readonly LucideCalendarCheck = LucideCalendarCheck;
  protected readonly LucideCircleCheck = LucideCircleCheck;
  protected readonly LucideDownload = LucideDownload;
  protected readonly LucidePlane = LucidePlane;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideShieldCheck = LucideShieldCheck;
  protected readonly LucideUserPlus = LucideUserPlus;
  protected readonly LucideUsers = LucideUsers;
}
