import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LeaveMasterQueryService } from './leave-master-query.service';

describe('LeaveMasterQueryService', () => {
  let service: LeaveMasterQueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LeaveMasterQueryService],
    });

    service = TestBed.inject(LeaveMasterQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should send GET request with pagination, search, and isActive filter', () => {
      service.fetchAll(2, false, 'annual', 25, 'createdAt:desc', { isActive: true }).subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/leave-masters`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('25');
      expect(req.request.params.get('sort')).toBe('createdAt:desc');
      expect(req.request.params.get('search')).toBe('annual');
      expect(req.request.params.get('q')).toBe('annual');
      expect(req.request.params.get('isActive')).toBe('true');

      req.flush({
        success: true,
        message: 'OK',
        data: [
          {
            id: 'leave-1',
            name: 'Annual Leave',
            code: 'AL',
            quotaDays: 12,
            isActive: true,
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

      expect(service.leaveMasters().length).toBe(1);
      expect(service.page()).toBe(2);
      expect(service.limit()).toBe(25);
      expect(service.total()).toBe(1);
      expect(service.hasMore()).toBe(false);
      expect(service.loading()).toBe(false);
    });
  });

  describe('getById', () => {
    it('should send GET request for leave master detail', () => {
      service.getById('leave-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leave-masters/leave-1`);

      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        message: 'OK',
        data: {
          id: 'leave-1',
          name: 'Annual Leave',
          code: 'AL',
          quotaDays: 12,
          isActive: true,
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
