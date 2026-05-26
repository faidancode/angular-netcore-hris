import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LeaveAllowanceQueryService } from './leave-allowance-query.service';

describe('LeaveAllowanceQueryService', () => {
  let service: LeaveAllowanceQueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LeaveAllowanceQueryService],
    });

    service = TestBed.inject(LeaveAllowanceQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should send GET request with pagination, search, and filters', () => {
      service
        .fetchAll(2, false, 'john', 25, 'year:asc', {
          employeeId: 'emp-1',
          leaveId: 'leave-1',
          year: 2026,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/leave-allowances`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('25');
      expect(req.request.params.get('sort')).toBe('year:asc');
      expect(req.request.params.get('search')).toBe('john');
      expect(req.request.params.get('q')).toBe('john');
      expect(req.request.params.get('employeeId')).toBe('emp-1');
      expect(req.request.params.get('leaveId')).toBe('leave-1');
      expect(req.request.params.get('year')).toBe('2026');

      req.flush({
        success: true,
        message: 'OK',
        data: [
          {
            id: 'allowance-1',
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            leaveId: 'leave-1',
            leaveName: 'Annual Leave',
            year: 2026,
            quotaDays: 12,
            notes: 'Annual quota',
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

      expect(service.leaveAllowances().length).toBe(1);
      expect(service.page()).toBe(2);
      expect(service.limit()).toBe(25);
      expect(service.total()).toBe(1);
      expect(service.hasMore()).toBe(false);
      expect(service.loading()).toBe(false);
    });
  });

  describe('getById', () => {
    it('should send GET request for leave allowance detail', () => {
      service.getById('allowance-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-allowances/allowance-1`);

      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        message: 'OK',
        data: {
          id: 'allowance-1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          leaveId: 'leave-1',
          leaveName: 'Annual Leave',
          year: 2026,
          quotaDays: 12,
          notes: 'Annual quota',
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
