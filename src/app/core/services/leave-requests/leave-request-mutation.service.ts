import { Injectable } from '@angular/core';
import {
  LeaveRequest,
  LeaveRequestCreatePayload,
  LeaveRequestUpdatePayload,
} from '../../types/api.types';
import { CrudMutationService } from '../crud-mutation.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestMutationService extends CrudMutationService<
  LeaveRequest,
  LeaveRequestCreatePayload,
  LeaveRequestUpdatePayload
> {
  protected override endpoint = '/leave-requests';
}
