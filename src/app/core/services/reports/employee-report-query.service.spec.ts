import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { EmployeeReportQueryService } from './employee-report-query.service';

describe('EmployeeReportQueryService', () => {
  let service: EmployeeReportQueryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EmployeeReportQueryService],
    });

    service = TestBed.inject(EmployeeReportQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should send GET request with pagination, search, sort, and filters', () => {
      service
        .fetchAll(2, 'john', 25, 'fullName:asc', {
          departmentId: 'department-1',
          positionId: 'position-1',
          employeeId: 'employee-1',
          employeeStatus: 'Permanent',
          employmentType: 'Contract',
          isActive: true,
          gender: 'Male',
          fromDate: '2026-01-01',
          toDate: '2026-01-31',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/reports/employees`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('25');
      expect(req.request.params.get('sort')).toBe('fullName:asc');
      expect(req.request.params.get('search')).toBe('john');
      expect(req.request.params.get('q')).toBe('john');
      expect(req.request.params.get('departmentId')).toBe('department-1');
      expect(req.request.params.get('positionId')).toBe('position-1');
      expect(req.request.params.get('employeeId')).toBe('employee-1');
      expect(req.request.params.get('employeeStatus')).toBe('Permanent');
      expect(req.request.params.get('employmentType')).toBe('Contract');
      expect(req.request.params.get('isActive')).toBe('true');
      expect(req.request.params.get('gender')).toBe('Male');
      expect(req.request.params.get('fromDate')).toBe('2026-01-01');
      expect(req.request.params.get('toDate')).toBe('2026-01-31');

      req.flush({
        success: true,
        message: 'OK',
        data: {
          summary: {
            totalEmployees: 1,
            totalActiveEmployees: 1,
            totalInactiveEmployees: 0,
            totalPermanentEmployees: 0,
            totalContractEmployees: 1,
            totalMaleEmployees: 1,
            totalFemaleEmployees: 0,
            totalByDepartment: [{ id: 'department-1', name: 'HR', total: 1 }],
            totalByPosition: [{ id: 'position-1', name: 'Manager', total: 1 }],
            totalByEmployeeStatus: [{ label: 'Permanent', total: 1 }],
          },
          items: [
            {
              id: 'employee-1',
              fullName: 'John Doe',
              nip: 'EMP-001',
              gender: 'Male',
              employmentType: 'Contract',
              employeeStatus: 'Permanent',
              isActive: true,
              departmentId: 'department-1',
              departmentName: 'HR',
              positionId: 'position-1',
              positionName: 'Manager',
              dateOfJoining: '2026-01-10',
              createdAt: '2026-01-10T00:00:00Z',
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
      expect(service.summary().totalEmployees).toBe(1);
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
        .export('xlsx', 'john', 'createdAt:desc', {
          departmentId: 'department-1',
          isActive: false,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/reports/employees/export`,
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.params.get('format')).toBe('xlsx');
      expect(req.request.params.get('sort')).toBe('createdAt:desc');
      expect(req.request.params.get('search')).toBe('john');
      expect(req.request.params.get('q')).toBe('john');
      expect(req.request.params.get('departmentId')).toBe('department-1');
      expect(req.request.params.get('isActive')).toBe('false');
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('limit')).toBe(false);

      req.flush(new Blob(['file']));

      expect(service.exporting()).toBe(false);
    });
  });
});
