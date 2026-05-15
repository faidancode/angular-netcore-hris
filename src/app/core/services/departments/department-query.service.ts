import { Injectable } from '@angular/core';
import { Department } from '../../types/api.types';
import { PaginatedQueryService } from '../paginated-query.service';

@Injectable({ providedIn: 'root' })
export class DepartmentQueryService
  extends PaginatedQueryService<Department> {

  protected override endpoint = '/departments';

  readonly departments = this.items;
}
