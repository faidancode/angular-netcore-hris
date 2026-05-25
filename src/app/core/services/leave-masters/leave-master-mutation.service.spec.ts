import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LeaveMasterMutationService } from './leave-master-mutation.service';

describe('LeaveMasterMutationService', () => {
  let service: LeaveMasterMutationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LeaveMasterMutationService],
    });

    service = TestBed.inject(LeaveMasterMutationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should send POST request with payload', () => {
      const payload = {
        name: 'Annual Leave',
        code: 'AL',
        quotaDays: 12,
        isActive: true,
      };

      service.create(payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-masters`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('update', () => {
    it('should send PATCH request with payload', () => {
      const payload = {
        name: 'Annual Leave Updated',
        quotaDays: 14,
      };

      service.update('leave-1', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-masters/leave-1`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('remove', () => {
    it('should send DELETE request', () => {
      service.remove('leave-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-masters/leave-1`);

      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });
  });
});
