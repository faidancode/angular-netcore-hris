import { Injectable } from '@angular/core';
import { Position } from '../../types/api.types';
import { PaginatedQueryService } from '../paginated-query.service';

@Injectable({ providedIn: 'root' })
export class PositionQueryService
  extends PaginatedQueryService<Position> {

  protected override endpoint = '/positions';

  readonly positions = this.items;
}
