import { Injectable } from '@angular/core';
import { User } from '../../types/api.types';
import { PaginatedQueryService } from '../paginated-query.service';

@Injectable({ providedIn: 'root' })
export class UserQueryService
  extends PaginatedQueryService<User> {

  protected override endpoint = '/users';

  readonly users = this.items;
}
