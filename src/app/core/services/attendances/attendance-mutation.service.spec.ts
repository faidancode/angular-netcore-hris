import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { AttendanceMutationService } from './attendance-mutation.service';

describe('AttendanceMutationService', () => {
  let service: AttendanceMutationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AttendanceMutationService],
    });

    service = TestBed.inject(AttendanceMutationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should send POST request with payload', () => {
      const payload = {
        date: '2026-05-24',
        employeeId: 'employee-1',
        checkIn: '08:00:00',
        checkOut: '17:00:00',
      };

      service.create(payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/attendances`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('update', () => {
    it('should send PATCH request with payload', () => {
      const payload = {
        checkIn: '08:15:00',
        checkOut: '17:10:00',
      };

      service.update('attendance-1', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/attendances/attendance-1`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('remove', () => {
    it('should send DELETE request', () => {
      service.remove('attendance-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/attendances/attendance-1`);

      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });
  });
});
