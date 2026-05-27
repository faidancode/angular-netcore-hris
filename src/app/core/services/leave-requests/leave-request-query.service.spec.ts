import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LeaveRequestQueryService } from './leave-request-query.service';

describe('LeaveRequestQueryService', () => {
  let service: LeaveRequestQueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LeaveRequestQueryService],
    });

    service = TestBed.inject(LeaveRequestQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should send GET request with pagination, search, and filters', () => {
      service
        .fetchAll(2, false, 'family', 25, 'fromDate:asc', {
          employeeId: 'emp-1',
          leaveId: 'leave-1',
          fromDate: '2026-01-01',
          toDate: '2026-01-31',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/leave-requests`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('25');
      expect(req.request.params.get('sort')).toBe('fromDate:asc');
      expect(req.request.params.get('search')).toBe('family');
      expect(req.request.params.get('q')).toBe('family');
      expect(req.request.params.get('employeeId')).toBe('emp-1');
      expect(req.request.params.get('leaveId')).toBe('leave-1');
      expect(req.request.params.get('fromDate')).toBe('2026-01-01');
      expect(req.request.params.get('toDate')).toBe('2026-01-31');

      req.flush({
        success: true,
        message: 'OK',
        data: [
          {
            id: 'request-1',
            requestNo: 'LR-20260524012345-ABCDEF',
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            leaveId: 'leave-1',
            leaveName: 'Annual Leave',
            fromDate: '2026-01-10',
            toDate: '2026-01-12',
            reason: 'Family event',
            attachmentPath: '/uploads/leave/family-event.pdf',
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

      expect(service.leaveRequests().length).toBe(1);
      expect(service.page()).toBe(2);
      expect(service.limit()).toBe(25);
      expect(service.total()).toBe(1);
      expect(service.hasMore()).toBe(false);
      expect(service.loading()).toBe(false);
    });
  });

  describe('getById', () => {
    it('should send GET request for leave request detail', () => {
      service.getById('request-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-requests/request-1`);

      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        message: 'OK',
        data: {
          id: 'request-1',
          requestNo: 'LR-20260524012345-ABCDEF',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          leaveId: 'leave-1',
          leaveName: 'Annual Leave',
          fromDate: '2026-01-10',
          toDate: '2026-01-12',
          reason: 'Family event',
          attachmentPath: '/uploads/leave/family-event.pdf',
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
