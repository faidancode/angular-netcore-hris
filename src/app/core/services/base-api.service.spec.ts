import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { BaseApiService } from './base-api.service';

describe('BaseApiService', () => {
  let service: BaseApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), BaseApiService],
    });

    service = TestBed.inject(BaseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should send GET request', () => {
      service.get('/departments').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/departments`);

      expect(req.request.method).toBe('GET');

      req.flush({});
    });

    it('should build query params and ignore null/undefined', () => {
      service
        .get('/departments', {
          page: 1,
          limit: 10,
          search: 'finance',
          status: null,
          role: undefined,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (request) => request.url === `${environment.apiUrl}/departments`,
      );

      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('search')).toBe('finance');
      expect(req.request.params.has('status')).toBe(false);
      expect(req.request.params.has('role')).toBe(false);

      req.flush({});
    });
  });

  describe('post', () => {
    it('should send POST request with body', () => {
      const payload = { name: 'Finance' };

      service.post('/departments', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/departments`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('patch', () => {
    it('should send PATCH request with body', () => {
      const payload = { name: 'HR' };

      service.patch('/departments/1', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/departments/1`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('put', () => {
    it('should send PUT request with body', () => {
      const payload = { name: 'IT' };

      service.put('/departments/1', payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/departments/1`);

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      req.flush({});
    });
  });

  describe('delete', () => {
    it('should send DELETE request', () => {
      service.delete('/departments/1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/departments/1`);

      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });
  });
});
