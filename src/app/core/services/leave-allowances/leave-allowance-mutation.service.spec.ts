import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LeaveAllowanceMutationService } from './leave-allowance-mutation.service';

describe('LeaveAllowanceMutationService', () => {
  let service: LeaveAllowanceMutationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LeaveAllowanceMutationService],
    });

    service = TestBed.inject(LeaveAllowanceMutationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should send POST request with payload', () => {
      const payload = {
        employeeId: 'emp-1',
        leaveId: 'leave-1',
        year: 2026,
        quotaDays: 12,
        notes: 'Annual quota',
      };

      service.create(payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-allowances`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('update', () => {
    it('should send PATCH request with payload', () => {
      const payload = {
        quotaDays: 14,
        notes: 'Updated quota',
      };

      service.update('allowance-1', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-allowances/allowance-1`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('remove', () => {
    it('should send DELETE request', () => {
      service.remove('allowance-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-allowances/allowance-1`);

      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });
  });
});
