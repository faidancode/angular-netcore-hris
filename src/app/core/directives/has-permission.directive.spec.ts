import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AbilityService } from '../services/ability.service';
import { HasPermissionDirective } from './has-permission.directive';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: ` <div *appHasPermission="permission" data-testid="protected">Protected Content</div> `,
})
class TestHostComponent {
  permission:
    | string
    | string[]
    | { action: string; subject: string }
    | ({ action: string; subject: string }[]) = 'User:read';
}

describe('HasPermissionDirective', () => {
  const abilityServiceMock = {
    permissionsLoaded: vi.fn(),
    can: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: AbilityService,
          useValue: abilityServiceMock,
        },
      ],
    });

    vi.clearAllMocks();
  });

  const createComponent = (
    permission?: string | string[] | { action: string; subject: string } | { action: string; subject: string }[],
  ) => {
    const fixture = TestBed.createComponent(TestHostComponent);

    if (permission !== undefined) {
      fixture.componentInstance.permission = permission;
    }

    fixture.detectChanges();

    return fixture;
  };

  describe('string permission', () => {
    it('should render when permission is granted', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);
      abilityServiceMock.can.mockReturnValue(true);

      const fixture = createComponent('user.read');

      const el = fixture.nativeElement.querySelector('[data-testid="protected"]');

      expect(el).toBeTruthy();
    });

    it('should not render when permission is denied', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);
      abilityServiceMock.can.mockReturnValue(false);

      const fixture = createComponent('user.read');

      const el = fixture.nativeElement.querySelector('[data-testid="protected"]');

      expect(el).toBeFalsy();
    });
  });

  describe('object permission', () => {
    it('should render when object permission is granted', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);
      abilityServiceMock.can.mockReturnValue(true);

      const fixture = createComponent({
        action: 'read',
        subject: 'User',
      });

      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('[data-testid="protected"]');

      expect(el).toBeTruthy();
    });
  });

  describe('array permissions', () => {
    it('should render when at least one permission is allowed', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);

      abilityServiceMock.can.mockReturnValueOnce(false).mockReturnValueOnce(true);

      const fixture = createComponent(['users.delete', 'users.read']);

      const el = fixture.nativeElement.querySelector('[data-testid="protected"]');

      expect(el).toBeTruthy();
    });

    it('should not render when all permissions are denied', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(true);
      abilityServiceMock.can.mockReturnValue(false);

      const fixture = createComponent(['users.delete', 'users.update']);

      const el = fixture.nativeElement.querySelector('[data-testid="protected"]');

      expect(el).toBeFalsy();
    });
  });

  describe('permissions loading state', () => {
    it('should not render when permissions are not loaded', () => {
      abilityServiceMock.permissionsLoaded.mockReturnValue(false);

      const fixture = createComponent('user.read');

      const el = fixture.nativeElement.querySelector('[data-testid="protected"]');

      expect(el).toBeFalsy();
      expect(abilityServiceMock.can).not.toHaveBeenCalled();
    });
  });
});
