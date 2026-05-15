import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  signal,
} from '@angular/core';
import { AbilityService } from '@core/services/ability.service';
import { parsePermission } from '@core/utils/permission.utils';
import { AppPermission } from '@core/types/permission.type';

type PermissionEntry = AppPermission | { action: string; subject: string };
type PermissionInput = PermissionEntry | PermissionEntry[];

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private ability = inject(AbilityService);

  private _permission = signal<PermissionInput | null>(null);

  constructor() {
    effect(() => {
      this.vcr.clear();

      if (!this.ability.permissionsLoaded()) return;

      const perm = this._permission();
      if (!perm) return;

      const entries = Array.isArray(perm) ? perm : [perm];
      const allowed = entries.some((item) => {
        if (typeof item === 'string') {
          const parsed = parsePermission(item);
          return this.ability.can(parsed.action, parsed.subject);
        }
        return this.ability.can(item.action, item.subject);
      });

      if (allowed) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }

  @Input()
  set appHasPermission(value: PermissionInput) {
    this._permission.set(value);
  }
}
