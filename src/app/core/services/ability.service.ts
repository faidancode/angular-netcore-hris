import { Injectable, signal, computed } from '@angular/core';

export interface PermissionRule {
  action: string;
  subject: string;
}

@Injectable({ providedIn: 'root' })
export class AbilityService {
  private readonly _permissions = signal<PermissionRule[]>([]);
  private readonly _loaded = signal(false);

  readonly permissionsLoaded = this._loaded.asReadonly();
  readonly permissions = computed(() => this._permissions());

  // --- Set from login response ---
  setPermissions(perms: PermissionRule[]): void {
    this._permissions.set(perms);
    this._loaded.set(true);
  }

  clearPermissions(): void {
    this._permissions.set([]);
    this._loaded.set(false);
  }

  // --- Core RBAC check ---
  can(action: string, subject: string): boolean {
    const perms = this._permissions();

    return perms.some((p) => {
      const actionMatch = p.action === action || p.action === 'manage';
      const subjectMatch = p.subject === subject || p.subject === 'all';
      return actionMatch && subjectMatch;
    });
  }
}
