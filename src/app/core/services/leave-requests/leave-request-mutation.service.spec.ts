import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LeaveRequestMutationService } from './leave-request-mutation.service';

describe('LeaveRequestMutationService', () => {
  let service: LeaveRequestMutationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LeaveRequestMutationService],
    });

    service = TestBed.inject(LeaveRequestMutationService);
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
        fromDate: '2026-01-10',
        toDate: '2026-01-12',
        reason: 'Family event',
        attachmentPath: '/uploads/leave/family-event.pdf',
      };

      service.create(payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-requests`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('update', () => {
    it('should send PATCH request with payload', () => {
      const payload = {
        reason: 'Updated reason',
        attachmentPath: '/uploads/leave/updated.pdf',
      };

      service.update('request-1', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-requests/request-1`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('remove', () => {
    it('should send DELETE request', () => {
      service.remove('request-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-requests/request-1`);

      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });
  });
});
