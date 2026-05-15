import { TestBed } from '@angular/core/testing';

import { AbilityService, PermissionRule } from './ability.service';

describe('AbilityService', () => {
  let service: AbilityService;

  const mockPermissions: PermissionRule[] = [
    { action: 'read', subject: 'User' },
    { action: 'create', subject: 'Product' },
    { action: 'manage', subject: 'Order' },
    { action: 'delete', subject: 'all' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(AbilityService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setPermissions', () => {
    it('should set permissions and mark as loaded', () => {
      service.setPermissions(mockPermissions);

      expect(service.permissions()).toEqual(mockPermissions);
      expect(service.permissionsLoaded()).toBe(true);
    });

    it('should overwrite previous permissions', () => {
      service.setPermissions(mockPermissions);

      const newPermissions: PermissionRule[] = [{ action: 'read', subject: 'Dashboard' }];

      service.setPermissions(newPermissions);

      expect(service.permissions()).toEqual(newPermissions);
      expect(service.permissionsLoaded()).toBe(true);
    });
  });

  describe('clearPermissions', () => {
    it('should clear permissions and mark as not loaded', () => {
      service.setPermissions(mockPermissions);

      service.clearPermissions();

      expect(service.permissions()).toEqual([]);
      expect(service.permissionsLoaded()).toBe(false);
    });
  });

  describe('can', () => {
    beforeEach(() => {
      service.setPermissions(mockPermissions);
    });

    it('should return true for exact permission match', () => {
      expect(service.can('read', 'User')).toBe(true);
      expect(service.can('create', 'Product')).toBe(true);
    });

    it('should return true when action is manage', () => {
      expect(service.can('read', 'Order')).toBe(true);
      expect(service.can('update', 'Order')).toBe(true);
      expect(service.can('delete', 'Order')).toBe(true);
    });

    it('should return true when subject is all', () => {
      expect(service.can('delete', 'User')).toBe(true);
      expect(service.can('delete', 'Product')).toBe(true);
    });

    it('should return false when subject does not match', () => {
      expect(service.can('read', 'Invoice')).toBe(false);
    });

    it('should return false when action does not match', () => {
      expect(service.can('update', 'User')).toBe(false);
    });

    it('should return false when permissions are cleared', () => {
      service.clearPermissions();

      expect(service.can('read', 'User')).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should initialize with empty permissions', () => {
      expect(service.permissions()).toEqual([]);
      expect(service.permissionsLoaded()).toBe(false);
    });
  });
});
