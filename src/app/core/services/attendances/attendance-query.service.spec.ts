import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { AttendanceQueryService } from './attendance-query.service';

describe('AttendanceQueryService', () => {
  let service: AttendanceQueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AttendanceQueryService],
    });

    service = TestBed.inject(AttendanceQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should send GET request with pagination, search, and filters', () => {
      service
        .fetchAll(2, false, 'budi', 25, 'date:asc', {
          employeeId: 'employee-1',
          date: '2026-05-24',
          fromDate: '2026-05-01',
          toDate: '2026-05-31',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/attendances`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('25');
      expect(req.request.params.get('sort')).toBe('date:asc');
      expect(req.request.params.get('search')).toBe('budi');
      expect(req.request.params.get('q')).toBe('budi');
      expect(req.request.params.get('employeeId')).toBe('employee-1');
      expect(req.request.params.get('date')).toBe('2026-05-24');
      expect(req.request.params.get('fromDate')).toBe('2026-05-01');
      expect(req.request.params.get('toDate')).toBe('2026-05-31');

      req.flush({
        success: true,
        message: 'OK',
        data: [
          {
            id: 'attendance-1',
            date: '2026-05-24',
            employeeId: 'employee-1',
            employeeName: 'Budi Santoso',
            employeeNip: 'EMP-0001',
            checkIn: '08:00:00',
            checkOut: '17:00:00',
            status: 'OnTime',
            createdAt: '2026-05-24T01:23:45Z',
            updatedAt: '2026-05-24T01:23:45Z',
          },
        ],
        meta: {
          total: 1,
          page: 2,
          limit: 25,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      expect(service.attendances().length).toBe(1);
      expect(service.page()).toBe(2);
      expect(service.limit()).toBe(25);
      expect(service.total()).toBe(1);
      expect(service.hasMore()).toBe(false);
      expect(service.loading()).toBe(false);
    });
  });

  describe('getById', () => {
    it('should send GET request for attendance detail', () => {
      service.getById('attendance-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/attendances/attendance-1`);

      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        message: 'OK',
        data: {
          id: 'attendance-1',
          date: '2026-05-24',
          employeeId: 'employee-1',
          employeeName: 'Budi Santoso',
          employeeNip: 'EMP-0001',
          checkIn: '08:00:00',
          checkOut: '17:00:00',
          status: 'OnTime',
          createdAt: '2026-05-24T01:23:45Z',
          updatedAt: '2026-05-24T01:23:45Z',
        },
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });
});
