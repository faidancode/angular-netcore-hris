import { Injectable } from '@angular/core';
import { Employee } from '../../types/api.types';
import { PaginatedQueryService } from '../paginated-query.service';

@Injectable({ providedIn: 'root' })
export class EmployeeQueryService
  extends PaginatedQueryService<Employee> {

  protected override endpoint = '/employees';

  readonly employees = this.items;
}
