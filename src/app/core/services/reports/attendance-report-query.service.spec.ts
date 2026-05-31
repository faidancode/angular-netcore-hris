import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { AttendanceReportQueryService } from './attendance-report-query.service';

describe('AttendanceReportQueryService', () => {
  let service: AttendanceReportQueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AttendanceReportQueryService],
    });

    service = TestBed.inject(AttendanceReportQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should send GET request with pagination, search, sort, and filters', () => {
      service
        .fetchAll(2, 'john', 25, 'date:asc', {
          employeeId: 'employee-1',
          status: 'Late',
          date: '2026-01-15',
          fromDate: '2026-01-01',
          toDate: '2026-01-31',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/reports/attendances`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('25');
      expect(req.request.params.get('sort')).toBe('date:asc');
      expect(req.request.params.get('search')).toBe('john');
      expect(req.request.params.get('q')).toBe('john');
      expect(req.request.params.get('employeeId')).toBe('employee-1');
      expect(req.request.params.get('status')).toBe('Late');
      expect(req.request.params.get('date')).toBe('2026-01-15');
      expect(req.request.params.get('fromDate')).toBe('2026-01-01');
      expect(req.request.params.get('toDate')).toBe('2026-01-31');

      req.flush({
        success: true,
        message: 'OK',
        data: {
          summary: {
            totalAttendances: 1,
            totalOnTime: 0,
            totalLate: 1,
            totalByStatus: [{ label: 'Late', total: 1 }],
            totalByEmployee: [{ id: 'employee-1', name: 'John Doe', total: 1 }],
            totalByDate: [{ label: '2026-01-15', total: 1 }],
          },
          items: [
            {
              id: 'attendance-1',
              date: '2026-01-15',
              employeeId: 'employee-1',
              employeeName: 'John Doe',
              employeeNip: 'EMP-001',
              checkIn: '2026-01-15T08:30:00Z',
              checkOut: '2026-01-15T17:00:00Z',
              status: 'Late',
              createdAt: '2026-01-15T00:00:00Z',
            },
          ],
        },
        meta: {
          total: 1,
          page: 2,
          limit: 25,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      expect(service.items().length).toBe(1);
      expect(service.summary().totalAttendances).toBe(1);
      expect(service.page()).toBe(2);
      expect(service.limit()).toBe(25);
      expect(service.total()).toBe(1);
      expect(service.hasMore()).toBe(false);
      expect(service.loading()).toBe(false);
    });
  });

  describe('export', () => {
    it('should send GET request to export endpoint with format and filters', () => {
      service
        .export('xlsx', 'john', 'date:desc', {
          employeeId: 'employee-1',
          status: 'OnTime',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/reports/attendances/export`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.params.get('format')).toBe('xlsx');
      expect(req.request.params.get('sort')).toBe('date:desc');
      expect(req.request.params.get('search')).toBe('john');
      expect(req.request.params.get('q')).toBe('john');
      expect(req.request.params.get('employeeId')).toBe('employee-1');
      expect(req.request.params.get('status')).toBe('OnTime');
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('limit')).toBe(false);

      req.flush(new Blob(['file']));

      expect(service.exporting()).toBe(false);
    });
  });
});
